import {
  spawn,
  spawnSync,
  type ChildProcess,
} from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import Database from "better-sqlite3";
import { migrateDatabase, resolveDatabaseConnection } from "../src/lib/db";
import {
  assertCatalogSnapshotUnchanged,
  backupCatalogToDisposableCopy,
  openReadOnlyCatalog,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  cleanupPhase19Fixture,
  createPhase19Fixture,
  snapshotRealCatalogInvariant,
  withPhase19Fixture,
} from "./lib/phase19-fixtures";

const ROOT = process.cwd();
const SCRIPT_PATH = path.join(ROOT, "scripts", "check-audit-readiness.ts");

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

function hasExited(child: ChildProcess): boolean {
  return child.exitCode !== null || child.signalCode !== null;
}

function waitForChildExit(
  child: ChildProcess,
  timeoutMs: number,
): Promise<boolean> {
  if (hasExited(child)) return Promise.resolve(true);
  return new Promise((resolve) => {
    const onExit = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      child.off("exit", onExit);
      resolve(false);
    }, timeoutMs);
    child.once("exit", onExit);
  });
}

async function stopChild(child: ChildProcess): Promise<void> {
  if (hasExited(child)) return;
  child.kill("SIGTERM");
  if (await waitForChildExit(child, 1_500)) return;
  child.kill("SIGKILL");
  await waitForChildExit(child, 1_500);
}

function processIsAlive(pid: number): boolean {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

async function assertClientClosed(client: Client): Promise<void> {
  try {
    await client.execute("SELECT 1");
  } catch {
    return;
  }
  throw new Error("Phase 19 fixture cleanup left its client usable.");
}

async function waitForFile(filePath: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (fs.existsSync(filePath)) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("Timed out waiting for the Phase 19 signal report.");
}

async function assertSignalCleanup(
  signal: "SIGINT" | "SIGTERM",
): Promise<void> {
  const reportFile = path.join(
    os.tmpdir(),
    `fpkg-phase19-${signal.toLowerCase()}-${process.pid}-${Date.now()}.json`,
  );
  const require = createRequire(import.meta.url);
  const tsxCli = require.resolve("tsx/cli");
  const output: string[] = [];
  const child = spawn(
    process.execPath,
    [tsxCli, SCRIPT_PATH, "--signal-probe", "--report", reportFile],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "libsql://example.invalid",
        TURSO_AUTH_TOKEN: "must-not-appear",
        FPKG_DATABASE_URL: "",
        PUBLICATION_GATE_FIXTURE: "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.stdout?.on("data", (chunk) => output.push(String(chunk)));
  child.stderr?.on("data", (chunk) => output.push(String(chunk)));

  try {
    await waitForFile(reportFile, 10_000);
    const report = JSON.parse(fs.readFileSync(reportFile, "utf8")) as {
      tempRoot: string;
      databasePath: string;
      childPid: number;
      remoteCleared: boolean;
    };
    assertCondition(
      fs.existsSync(report.databasePath) && processIsAlive(report.childPid),
      "Signal probe did not create both its fixture database and child.",
    );
    assertCondition(
      report.remoteCleared,
      "Signal probe did not clear inherited remote database selection.",
    );

    child.kill(signal);
    if (!(await waitForChildExit(child, 8_000))) {
      child.kill("SIGKILL");
      throw new Error(`Signal probe did not exit after ${signal}.`);
    }
    assertCondition(
      !fs.existsSync(report.tempRoot),
      `${signal} left its fixture root behind.`,
    );
    assertCondition(
      !processIsAlive(report.childPid),
      `${signal} left its registered child alive.`,
    );
  } catch (error) {
    await stopChild(child);
    throw new Error(
      `Phase 19 ${signal} cleanup probe failed. ${output.join("")}`,
      { cause: error },
    );
  } finally {
    fs.rmSync(reportFile, { force: true });
  }
}

async function runFixtureIsolation(): Promise<void> {
  const realBefore = snapshotRealCatalogInvariant();
  const realCatalogPath = path.join(ROOT, "data", "fpkg.db");

  expectThrow(
    () =>
      resolveDatabaseConnection({
        TURSO_DATABASE_URL: "libsql://example.invalid",
        FPKG_DATABASE_URL: "file:/tmp/phase19-fixture.db",
      }),
    "mutually exclusive",
  );
  expectThrow(
    () =>
      resolveDatabaseConnection({
        PUBLICATION_GATE_FIXTURE: "1",
        FPKG_DATABASE_URL: "libsql://example.invalid",
      }),
    "must be a file:",
  );
  expectThrow(
    () =>
      resolveDatabaseConnection({
        PUBLICATION_GATE_FIXTURE: "1",
        FPKG_DATABASE_URL: `file:${realCatalogPath}`,
      }),
    "may not use the real data/fpkg.db",
  );

  let successRoot = "";
  let successClient: Client | null = null;
  await withPhase19Fixture(async (fixture) => {
    successRoot = fixture.tempRoot;
    successClient = fixture.client;
    assertCondition(
      process.env.TURSO_DATABASE_URL === "" &&
        process.env.TURSO_AUTH_TOKEN === "" &&
        process.env.FPKG_DATABASE_URL === fixture.databaseUrl &&
        process.env.PUBLICATION_GATE_FIXTURE === "1",
      "Phase 19 fixture did not install its fail-closed environment.",
    );
    const connection = resolveDatabaseConnection();
    assertCondition(
      connection.localPath === fixture.databasePath,
      "Fixture resolver did not select the owned database.",
    );
    const migrations = await fixture.client.execute(
      "SELECT COUNT(*) AS count FROM migrations",
    );
    assertCondition(
      Number(migrations.rows[0]?.count) > 0,
      "Phase 19 fixture did not receive canonical migrations.",
    );
  });
  assertCondition(
    !fs.existsSync(successRoot) && successClient,
    "Successful fixture lifecycle did not remove its temp root.",
  );
  await assertClientClosed(successClient);

  let failureRoot = "";
  let failureClient: Client | null = null;
  let failureChildPid = 0;
  let expectedFailure = false;
  try {
    await withPhase19Fixture(async (fixture) => {
      failureRoot = fixture.tempRoot;
      failureClient = fixture.client;
      const child = fixture.registerChild(
        process.execPath,
        ["-e", "setInterval(() => {}, 1000)"],
        { cwd: ROOT, stdio: "ignore" },
      );
      assertCondition(child.pid, "Failure fixture child has no PID.");
      failureChildPid = child.pid;
      throw new Error("deliberate Phase 19 fixture failure");
    });
  } catch (error) {
    expectedFailure =
      error instanceof Error &&
      error.message === "deliberate Phase 19 fixture failure";
  }
  assertCondition(
    expectedFailure &&
      !fs.existsSync(failureRoot) &&
      !processIsAlive(failureChildPid) &&
      failureClient,
    "Failed fixture lifecycle leaked its root, child, or client.",
  );
  await assertClientClosed(failureClient);

  await assertSignalCleanup("SIGINT");
  await assertSignalCleanup("SIGTERM");
  snapshotRealCatalogInvariant(realBefore);

  console.log(
    "Audit fixture isolation passed: success, failure, SIGINT, and SIGTERM cleaned owned clients, children, and roots; real main/WAL/SHM unchanged.",
  );
}

async function runSignalProbe(reportFile: string): Promise<void> {
  const fixture = await createPhase19Fixture("fpkg-phase19-signal-probe-");
  try {
    const child = fixture.registerChild(
      process.execPath,
      ["-e", "setInterval(() => {}, 1000)"],
      { cwd: ROOT, stdio: "ignore" },
    );
    assertCondition(child.pid, "Signal fixture child has no PID.");
    fs.writeFileSync(
      reportFile,
      JSON.stringify({
        tempRoot: fixture.tempRoot,
        databasePath: fixture.databasePath,
        childPid: child.pid,
        remoteCleared:
          process.env.TURSO_DATABASE_URL === "" &&
          process.env.TURSO_AUTH_TOKEN === "",
      }),
    );
    await new Promise(() => undefined);
  } catch (error) {
    await cleanupPhase19Fixture(fixture);
    throw error;
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  if (args[0] === "--signal-probe") {
    const reportIndex = args.indexOf("--report");
    const reportFile = reportIndex >= 0 ? args[reportIndex + 1] : undefined;
    if (!reportFile) {
      throw new Error("--signal-probe requires --report <path>.");
    }
    await runSignalProbe(reportFile);
    return;
  }
  if (args.length !== 1) {
    throw new Error(
      "Usage: pnpm exec tsx scripts/check-audit-readiness.ts --readonly-isolation|--readonly-backup|--fixture-isolation",
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
  if (args[0] === "--fixture-isolation") {
    await runFixtureIsolation();
    return;
  }
  throw new Error(`Unknown audit readiness mode: ${args[0]}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
