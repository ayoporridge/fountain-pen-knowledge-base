import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient } from "@libsql/client";
import Database from "better-sqlite3";
import { migrateDatabase } from "../src/lib/db";
import {
  assertCatalogSnapshotUnchanged,
  backupCatalogToDisposableCopy,
  openReadOnlyCatalog,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";

type ProbeRow = {
  id: number;
  label: string;
};

function assertCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message);
}

function expectThrow(run: () => unknown, messageFragment: string): Error {
  try {
    run();
  } catch (error) {
    assertCondition(error instanceof Error, "Expected an Error instance.");
    assertCondition(
      error.message.includes(messageFragment),
      `Expected rejection containing ${JSON.stringify(messageFragment)}, received: ${error.message}`,
    );
    return error;
  }
  throw new Error(`Expected rejection containing: ${messageFragment}`);
}

async function expectAsyncThrow(
  run: () => Promise<unknown>,
  messageFragment: string,
): Promise<Error> {
  try {
    await run();
  } catch (error) {
    assertCondition(error instanceof Error, "Expected an Error instance.");
    assertCondition(
      error.message.includes(messageFragment),
      `Expected rejection containing ${JSON.stringify(messageFragment)}, received: ${error.message}`,
    );
    return error;
  }
  throw new Error(`Expected rejection containing: ${messageFragment}`);
}

async function withOwnedTempRoot<T>(
  prefix: string,
  run: (tempRoot: string) => Promise<T> | T,
): Promise<T> {
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
  );
  try {
    return await run(tempRoot);
  } finally {
    if (fs.existsSync(tempRoot)) {
      fs.chmodSync(tempRoot, 0o700);
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }
}

function createCheckpointedWalFixture(tempRoot: string): {
  database: Database.Database;
  databasePath: string;
} {
  const databasePath = path.join(tempRoot, "readonly-source.db");
  const database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  database.exec(
    "CREATE TABLE probe_rows(id INTEGER PRIMARY KEY, label TEXT NOT NULL)",
  );
  database.prepare("INSERT INTO probe_rows(label) VALUES (?)").run("alpha");
  database.pragma("wal_checkpoint(TRUNCATE)");
  return { database, databasePath };
}

function createCrashWalFixture(tempRoot: string): string {
  const databasePath = path.join(tempRoot, "wal-source.db");
  const childSource = `
    const Database = require("better-sqlite3");
    const database = new Database(${JSON.stringify(databasePath)});
    database.pragma("journal_mode = WAL");
    database.pragma("wal_autocheckpoint = 0");
    database.exec("CREATE TABLE probe_rows(id INTEGER PRIMARY KEY, label TEXT NOT NULL)");
    database.prepare("INSERT INTO probe_rows(label) VALUES (?)").run("wal-only-row");
    process.exit(0);
  `;
  const child = spawnSync(process.execPath, ["-e", childSource], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  assertCondition(
    child.status === 0,
    `WAL fixture child failed: ${child.stderr || child.stdout}`,
  );
  assertCondition(
    fs.statSync(`${databasePath}-wal`).size > 0,
    "WAL fixture did not retain uncheckpointed rows.",
  );
  assertCondition(
    fs.existsSync(`${databasePath}-shm`),
    "WAL fixture did not retain its shared-memory sidecar.",
  );

  for (const filePath of [
    databasePath,
    `${databasePath}-wal`,
    `${databasePath}-shm`,
  ]) {
    fs.chmodSync(filePath, 0o444);
  }
  fs.chmodSync(tempRoot, 0o555);
  return databasePath;
}

async function runReadOnlyIsolation(): Promise<void> {
  await withOwnedTempRoot("fpkg-audit-readonly-", async (tempRoot) => {
    const fixture = createCheckpointedWalFixture(tempRoot);
    try {
      const missingPath = path.join(tempRoot, "missing.db");
      expectThrow(
        () => openReadOnlyCatalog("data/fpkg.db", { env: {} }),
        "absolute local filesystem path",
      );
      for (const remotePath of [
        "libsql://example.invalid/catalog",
        "https://example.invalid/catalog.db",
        "http://example.invalid/catalog.db",
      ]) {
        expectThrow(
          () => openReadOnlyCatalog(remotePath, { env: {} }),
          "remote database URLs are forbidden",
        );
      }
      expectThrow(
        () => openReadOnlyCatalog(missingPath, { env: {} }),
        "does not exist",
      );
      const tursoError = expectThrow(
        () =>
          openReadOnlyCatalog(fixture.databasePath, {
            env: {
              TURSO_DATABASE_URL: "libsql://example.invalid",
              TURSO_AUTH_TOKEN: "must-not-appear",
            },
          }),
        "Turso database selection is forbidden",
      );
      assertCondition(
        !tursoError.message.includes("example.invalid") &&
          !tursoError.message.includes("must-not-appear"),
        "Turso rejection leaked credential-bearing environment values.",
      );

      const before = snapshotCatalogFiles(fixture.databasePath);
      const client = openReadOnlyCatalog(fixture.databasePath, { env: {} });
      assertCondition(
        JSON.stringify(Object.keys(client).sort()) ===
          JSON.stringify(["all", "close", "get"]),
        `AuditReadClient exposed an unexpected runtime surface: ${Object.keys(client).sort().join(", ")}`,
      );
      try {
        const queryOnly = client.get<{ query_only: number }>("PRAGMA query_only");
        assertCondition(
          Number(queryOnly?.query_only) === 1,
          "Read-only catalog did not verify PRAGMA query_only=ON.",
        );
        const rows = client.all<ProbeRow>(
          "SELECT id, label FROM probe_rows WHERE label = ? ORDER BY id",
          ["alpha"],
        );
        assertCondition(
          rows.length === 1 && rows[0]?.label === "alpha",
          "Parameterized read did not return the fixture row.",
        );

        for (const sql of [
          "INSERT INTO probe_rows(label) VALUES ('forbidden')",
          "UPDATE probe_rows SET label = 'forbidden'",
          "CREATE TABLE forbidden_write(id INTEGER)",
        ]) {
          expectThrow(() => client.all(sql), "read-only statements");
        }
      } finally {
        client.close();
      }
      expectThrow(() => client.all("SELECT 1"), "closed");

      const after = snapshotCatalogFiles(fixture.databasePath);
      assertCatalogSnapshotUnchanged(before, after);
      assertCondition(
        after.wal.exists && after.shm.exists,
        "Read-only cleanup removed a pre-existing WAL or SHM sidecar.",
      );
    } finally {
      fixture.database.close();
    }
  });

  console.log(
    "Audit readonly isolation passed: explicit local reads only; remote/write paths rejected; main/WAL/SHM unchanged.",
  );
}

async function runReadOnlyBackup(): Promise<void> {
  await withOwnedTempRoot("fpkg-audit-wal-source-", async (sourceRoot) => {
    const sourcePath = createCrashWalFixture(sourceRoot);
    const sourceBefore = snapshotCatalogFiles(sourcePath);

    await withOwnedTempRoot("fpkg-audit-backup-", async (ownedRoot) => {
      await withOwnedTempRoot("fpkg-audit-escape-", async (escapeRoot) => {
        const outsideDestination = path.join(escapeRoot, "outside.db");
        const symlinkParent = path.join(ownedRoot, "escape-link");
        fs.symlinkSync(escapeRoot, symlinkParent, "dir");

        const client = openReadOnlyCatalog(sourcePath, { env: {} });
        try {
          await expectAsyncThrow(
            () =>
              backupCatalogToDisposableCopy(
                client,
                outsideDestination,
                ownedRoot,
              ),
            "inside the caller-owned root",
          );
          await expectAsyncThrow(
            () => backupCatalogToDisposableCopy(client, sourcePath, sourceRoot),
            "must not be the source catalog or a sidecar",
          );
          await expectAsyncThrow(
            () =>
              backupCatalogToDisposableCopy(
                client,
                path.join(symlinkParent, "escaped.db"),
                ownedRoot,
              ),
            "inside the caller-owned root",
          );

          const existingDestination = path.join(ownedRoot, "existing.db");
          fs.writeFileSync(existingDestination, "owned-but-not-disposable");
          await expectAsyncThrow(
            () =>
              backupCatalogToDisposableCopy(
                client,
                existingDestination,
                ownedRoot,
              ),
            "must not already exist",
          );

          const destinationPath = path.join(ownedRoot, "catalog-backup.db");
          const result = await backupCatalogToDisposableCopy(
            client,
            destinationPath,
            ownedRoot,
          );
          assertCondition(
            result.destinationPath === fs.realpathSync.native(destinationPath),
            "Backup result did not return the canonical destination path.",
          );
          assertCatalogSnapshotUnchanged(
            result.sourceSnapshotBefore,
            result.sourceSnapshotAfter,
          );

          const backup = new Database(destinationPath, {
            readonly: true,
            fileMustExist: true,
          });
          try {
            const rows = backup
              .prepare("SELECT id, label FROM probe_rows ORDER BY id")
              .all() as ProbeRow[];
            assertCondition(
              rows.length === 1 && rows[0]?.label === "wal-only-row",
              "SQLite online backup omitted the source WAL row.",
            );
          } finally {
            backup.close();
          }

          const copyClient = createClient({ url: `file:${destinationPath}` });
          try {
            await migrateDatabase(copyClient);
            await copyClient.execute({
              sql: "INSERT INTO probe_rows(label) VALUES (?)",
              args: ["copy-only-row"],
            });
          } finally {
            copyClient.close();
          }
        } finally {
          client.close();
        }
      });
    });

    const sourceAfter = snapshotCatalogFiles(sourcePath);
    assertCatalogSnapshotUnchanged(sourceBefore, sourceAfter);
    assertCondition(
      sourceAfter.wal.exists && sourceAfter.shm.exists,
      "Backup cleanup removed the source WAL or SHM sidecar.",
    );
  });

  console.log(
    "Audit readonly backup passed: WAL state copied online inside an owned root; copy migration/write left source main/WAL/SHM unchanged.",
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    throw new Error(
      "Usage: pnpm exec tsx scripts/check-audit-readiness.ts --readonly-isolation|--readonly-backup",
    );
  }
  if (args[0] === "--readonly-isolation") {
    await runReadOnlyIsolation();
    return;
  }
  if (args[0] === "--readonly-backup") {
    await runReadOnlyBackup();
    return;
  }
  throw new Error(`Unknown audit readiness mode: ${args[0]}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
