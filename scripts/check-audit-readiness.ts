import {
  spawn,
  spawnSync,
  type ChildProcess,
} from "node:child_process";
import { createHash } from "node:crypto";
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
  captureInventoryAuditProvenance,
  captureSourceInventoryProvenance,
  runReadinessAudit,
} from "../src/lib/audit/readiness-audit";
import {
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import {
  cleanupPhase19Fixture,
  createPhase19Fixture,
  seedQualifiedPublicationFixture,
  snapshotRealCatalogInvariant,
  withPhase19Fixture,
} from "./lib/phase19-fixtures";

const ROOT = process.cwd();
const SCRIPT_PATH = path.join(ROOT, "scripts", "check-audit-readiness.ts");
const MIGRATIONS_DIR = path.join(ROOT, "migrations");
const MIGRATION_030 = "030_publication_gate.sql";
const MIGRATION_031 = "031_evidence_readiness_v2.sql";

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

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function sorted(values: Iterable<string>): string[] {
  return [...values].sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
}

function assertSetEqual(
  actualValues: Iterable<string>,
  expectedValues: Iterable<string>,
  label: string,
): void {
  const actual = new Set(actualValues);
  const expected = new Set(expectedValues);
  const actualOnly = sorted([...actual].filter((value) => !expected.has(value)));
  const expectedOnly = sorted(
    [...expected].filter((value) => !actual.has(value)),
  );
  assertCondition(
    actualOnly.length === 0 && expectedOnly.length === 0,
    `${label} set mismatch; actual-only=${actualOnly.join(",") || "none"}; expected-only=${expectedOnly.join(",") || "none"}.`,
  );
}

async function approveAndPublish(client: Client, entityId: string): Promise<void> {
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId,
      reviewKind,
      reviewer: `audit-${reviewKind}-reviewer`,
      status: "approved",
      notes: "Audit ledger fixture approval.",
    });
  }
  await publishEntity(client, {
    entityId,
    reviewer: "audit-publication-reviewer",
  });
}

async function seedLedgerRelationshipShells(client: Client): Promise<void> {
  await client.execute(`
    INSERT INTO entities (id, type, slug, name, summary, body_md, source)
    VALUES
      ('audit-second-brand', 'brand', 'audit-second-brand', 'Audit second brand', '', '', 'audit-fixture'),
      ('audit-no-publication', 'brand', 'audit-no-publication', 'Audit no publication', '', '', 'audit-fixture'),
      ('audit-missing-pen', 'pen', '百乐-pilot-custom-823', 'Audit missing pen', '', '', 'audit-fixture'),
      ('audit-multiple-pen', 'pen', 'audit-multiple-pen', 'Audit multiple pen', '', '', 'audit-fixture'),
      ('audit-noncanonical-pen', 'pen', 'audit-noncanonical-pen', 'Audit noncanonical pen', '', '', 'audit-fixture'),
      ('audit-nonbrand-target', 'concept', 'audit-nonbrand-target', 'Audit non-brand target', '', '', 'audit-fixture')
  `);
  await client.execute(
    "DELETE FROM entity_publications WHERE entity_id = 'audit-no-publication'",
  );
  await client.execute(`
    INSERT INTO entity_links (id, source_id, target_id, link_type)
    VALUES
      ('audit-multiple-maker-a', 'audit-multiple-pen', 'audit-public-brand', 'made_by'),
      ('audit-multiple-maker-b', 'audit-multiple-pen', 'audit-second-brand', 'made_by'),
      ('audit-noncanonical-maker', 'audit-noncanonical-pen', 'audit-nonbrand-target', 'made_by')
  `);
}

async function runInventoryContract(): Promise<void> {
  await withPhase19Fixture(async ({ client, databasePath }) => {
    const initialInventory = await client.execute(`
      SELECT id
      FROM entities
      WHERE type IN ('brand', 'pen')
      ORDER BY type, slug, id
    `);
    const brand = await seedQualifiedPublicationFixture(client, {
      entityId: "audit-public-brand",
      entityType: "brand",
    });
    await approveAndPublish(client, brand.entityId);
    const pen = await seedQualifiedPublicationFixture(client, {
      entityId: "audit-public-pen",
      entityType: "pen",
      brandEntityId: brand.entityId,
    });
    await approveAndPublish(client, pen.entityId);
    await seedLedgerRelationshipShells(client);
    const legacyExcluded = await client.execute(`
      SELECT id, slug
      FROM entities
      WHERE slug IN ('banju', '百乐-pilot-custom-823')
      ORDER BY slug, id
    `);
    assertCondition(
      legacyExcluded.rows.length === 2,
      "Audit fixture is missing the locked legacy-exclusion identities.",
    );
    await client.execute("PRAGMA wal_checkpoint(TRUNCATE)");

    const auditClient = openReadOnlyCatalog(databasePath, { env: {} });
    try {
      const source = captureSourceInventoryProvenance(auditClient);
      const provenance = captureInventoryAuditProvenance(auditClient, source);
      const result = runReadinessAudit(auditClient, provenance);
      const addedIds = [
        "audit-public-brand",
        "audit-public-pen",
        "audit-second-brand",
        "audit-no-publication",
        "audit-missing-pen",
        "audit-multiple-pen",
        "audit-noncanonical-pen",
      ];
      const expectedIds = [
        ...initialInventory.rows.map((row) => String(row.id)),
        ...addedIds,
      ];
      assertSetEqual(
        result.rows.map((row) => row.entity_id),
        expectedIds,
        "Inventory ledger identities",
      );
      assertCondition(
        result.rows.length === expectedIds.length &&
          new Set(result.rows.map((row) => row.entity_id)).size === result.rows.length,
        "Inventory ledger did not return exactly one row per raw identity.",
      );

      const byId = new Map(result.rows.map((row) => [row.entity_id, row]));
      const noPublication = byId.get("audit-no-publication");
      assertCondition(
        noPublication?.publication_status === "missing" &&
          noPublication.blocker_codes.includes("missing_publication"),
        "Raw entity without a publication row was omitted or misclassified.",
      );
      assertCondition(
        byId.get("audit-missing-pen")?.made_by_status === "missing" &&
          byId.get("audit-public-pen")?.made_by_status === "exactly_one" &&
          byId.get("audit-multiple-pen")?.made_by_status === "multiple" &&
          byId.get("audit-noncanonical-pen")?.made_by_status === "noncanonical",
        "The four made_by dispositions were not preserved.",
      );
      assertCondition(
        legacyExcluded.rows.every(
          (row) => byId.get(String(row.id))?.in_legacy_public_baseline === false,
        ),
        "Locked legacy exclusions were not traced independently from the audit universe.",
      );

      const reverse = byId.get("audit-public-brand");
      assertSetEqual(
        reverse?.raw_reverse_model_ids ?? [],
        ["audit-public-pen", "audit-multiple-pen"],
        "Brand raw reverse models",
      );
      assertSetEqual(
        reverse?.public_reverse_model_ids ?? [],
        ["audit-public-pen"],
        "Brand public reverse models",
      );
      assertSetEqual(
        reverse?.reverse_model_diff_ids ?? [],
        ["audit-multiple-pen"],
        "Brand reverse model difference",
      );
      assertCondition(
        result.summary.inventory_audited === expectedIds.length &&
          result.summary.content_ready === 2 &&
          result.summary.published === 2 &&
          result.summary.published_blockers === 0 &&
          result.summary.backlog === expectedIds.length - 2,
        `Inventory/content/public summary dimensions were conflated: ${JSON.stringify(result.summary)}.`,
      );
      assertCondition(
        result.rows.every(
          (row) => row.content_ready === (row.blocker_count === 0),
        ),
        "A hard blocker was offset instead of failing the row.",
      );
    } finally {
      auditClient.close();
    }
  });

  console.log(
    "Audit inventory contract passed: every raw brand/pen has one deterministic row, all relationship dispositions are explicit, and summary dimensions stay separate.",
  );
}

function createMigrationsThrough030(tempRoot: string): string {
  const targetDir = path.join(tempRoot, "migrations-through-030");
  fs.mkdirSync(targetDir);
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => {
      const match = file.match(/^(\d{3})_.*\.sql$/);
      return Boolean(match && Number(match[1]) <= 30);
    })
    .sort();
  assertCondition(
    files.includes(MIGRATION_030) && !files.includes(MIGRATION_031),
    "Pre-031 migration fixture did not end exactly at migration 030.",
  );
  for (const file of files) {
    fs.copyFileSync(path.join(MIGRATIONS_DIR, file), path.join(targetDir, file));
  }
  return targetDir;
}

async function runBackupMigrationContract(): Promise<void> {
  await withOwnedTempRoot("fpkg-audit-030-031-", async (tempRoot) => {
    const migrationsThrough030 = createMigrationsThrough030(tempRoot);
    const sourcePath = path.join(tempRoot, "source-030.db");
    const auditPath = path.join(tempRoot, "audit-031.db");
    const sourceClient = createClient({ url: `file:${sourcePath}` });
    try {
      await migrateDatabase(sourceClient, {
        migrationsDir: migrationsThrough030,
      });
    } finally {
      sourceClient.close();
    }

    const normalizeSource = new Database(sourcePath);
    try {
      normalizeSource.pragma("wal_checkpoint(TRUNCATE)");
      normalizeSource.pragma("journal_mode = DELETE");
    } finally {
      normalizeSource.close();
    }
    const sourceBefore = snapshotCatalogFiles(sourcePath);
    const source = openReadOnlyCatalog(sourcePath, { env: {} });
    try {
      const backup = await backupCatalogToDisposableCopy(
        source,
        auditPath,
        tempRoot,
      );
      assertCondition(
        backup.destinationPath === auditPath && backup.remainingPages === 0,
        "Pre-031 source online backup did not complete inside the owned root.",
      );
    } finally {
      source.close();
    }

    const preMigrationCopy = openReadOnlyCatalog(auditPath, { env: {} });
    let sourceProvenance;
    try {
      sourceProvenance = captureSourceInventoryProvenance(preMigrationCopy);
      assertCondition(
        preMigrationCopy.get(
          "SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'schema_migrations'",
        ) === undefined,
        "Audit provenance invented a schema_migrations table.",
      );
    } finally {
      preMigrationCopy.close();
    }

    const writableCopy = createClient({ url: `file:${auditPath}` });
    try {
      await migrateDatabase(writableCopy);
      await writableCopy.execute("PRAGMA wal_checkpoint(TRUNCATE)");
    } finally {
      writableCopy.close();
    }

    const migratedCopy = openReadOnlyCatalog(auditPath, { env: {} });
    try {
      const provenance = captureInventoryAuditProvenance(
        migratedCopy,
        sourceProvenance,
      );
      const result = runReadinessAudit(migratedCopy, provenance);
      assertCondition(
        provenance.source_schema_max_migration === 30 &&
          provenance.source_schema_migration_name === MIGRATION_030 &&
          provenance.source_schema_migration_checksum ===
            sha256File(path.join(MIGRATIONS_DIR, MIGRATION_030)),
        `Source migration provenance is not exact 030: ${JSON.stringify(provenance)}.`,
      );
      assertCondition(
        provenance.audit_schema_max_migration === 31 &&
          provenance.audit_schema_migration_name === MIGRATION_031 &&
          provenance.audit_schema_migration_checksum ===
            sha256File(path.join(MIGRATIONS_DIR, MIGRATION_031)) &&
          provenance.audit_database_kind ===
            "owned_disposable_migrated_copy",
        `Audit migration provenance is not exact 031: ${JSON.stringify(provenance)}.`,
      );
      assertCondition(
        result.rows.length > 0 &&
          result.rows.every(
            (row) =>
              row.source_inventory_snapshot_id ===
              provenance.source_inventory_snapshot_id,
          ),
        "Post-migration readiness did not retain the pre-migration inventory snapshot identity.",
      );
    } finally {
      migratedCopy.close();
    }

    assertCatalogSnapshotUnchanged(sourceBefore, snapshotCatalogFiles(sourcePath));
  });

  console.log(
    "Audit backup migration passed: source provenance is exact migration 030, readiness runs only on the owned canonical 031 copy, and source main/WAL/SHM remain unchanged.",
  );
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
  const modes = new Set(args);
  const inventoryModes = ["--inventory", "--backup-migration"];
  if (
    args.length > 0 &&
    args.every((arg) => inventoryModes.includes(arg))
  ) {
    if (modes.has("--inventory")) await runInventoryContract();
    if (modes.has("--backup-migration")) await runBackupMigrationContract();
    return;
  }
  if (args.length !== 1) {
    throw new Error(
      "Usage: pnpm exec tsx scripts/check-audit-readiness.ts --readonly-isolation|--readonly-backup|--fixture-isolation|[--inventory] [--backup-migration]",
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
