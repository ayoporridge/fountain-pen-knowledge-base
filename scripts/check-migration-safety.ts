import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { createClient } from "@libsql/client";
import { assertDatabaseReady, migrateDatabase } from "../src/lib/db";

const ROOT = process.cwd();
const CHECKER_PATH = "scripts/check-migration-safety.ts";
const PLAN_02_SUMMARY = path.join(
  ROOT,
  ".planning/phases/18-publication-gate/18-02-SUMMARY.md",
);

// Plan 02 owns these remaining legacy runners. Until that plan closes, tolerate
// only their exact reviewed bytes: any edit, new file, or reintroduced bypass
// fails the ownership scan. Once Plan 02 has a summary, no exception remains.
const TRANSITIONAL_PLAN_02_DEBT = new Map([
  [
    "scripts/seed.ts",
    "7fab5b3607d375339efa07981eb25ae4c8edf5fe80fe45ced4f7fd464b8d5be5",
  ],
  [
    "scripts/seed-tags.ts",
    "423e98bc187e4a487f68b8fee1e06ad0c738ccd3a09962ed09dae84f21aefefa",
  ],
  [
    "scripts/seed-concepts.ts",
    "f938611e5f1990ddb2846ce5fbf75185f70da2e0a02b48cf94bdce0ea99a1034",
  ],
  [
    "scripts/seed-library-samples.ts",
    "dcbb78a3458c1e3844db397e6810ce339a9b3bf1e5215d7e8bb4af1d47d9b585",
  ],
  [
    "scripts/import-csv.ts",
    "33298415fad30f03169d3a3e20a98a21d7309063665877c11eb944dbbbc4b1ff",
  ],
  [
    "scripts/import-markdown.ts",
    "35e86e1a6e68c8349344cfae9e8fdac6eeec564cdbb8328bda89cfb68be82819",
  ],
]);

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function sourceFiles(root: string): string[] {
  const files: string[] = [];

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...sourceFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

function migrationOwnershipFindings(source: string): string[] {
  const findings: string[] = [];
  const ownsMigrationDirectory =
    /\bMIGRATIONS_DIR\s*=\s*path\.join\s*\(\s*process\.cwd\(\)\s*,\s*["']migrations["']/s.test(
      source,
    );
  const readsMigrationSql =
    /\breadFileSync\s*\(\s*path\.join\s*\(\s*(?:MIGRATIONS_DIR|process\.cwd\(\)\s*,\s*["']migrations["'])/s.test(
      source,
    );
  const enumeratesMigrations =
    /\breaddirSync\s*\(\s*MIGRATIONS_DIR\s*\)/s.test(source);
  const writesMigrationTable =
    /\b(?:CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?|INSERT(?:\s+OR\s+\w+)?\s+INTO|UPDATE|DELETE\s+FROM)\s+migrations\b/is.test(
      source,
    );
  const executesMigrationSql =
    (ownsMigrationDirectory || readsMigrationSql || enumeratesMigrations) &&
    /\b(?:executeMultiple|db\.exec)\s*\(/s.test(source);

  if (writesMigrationTable) findings.push("writes the migrations table");
  if (ownsMigrationDirectory) findings.push("owns the migrations directory");
  if (enumeratesMigrations) findings.push("enumerates migration files");
  if (readsMigrationSql) findings.push("reads migration SQL");
  if (executesMigrationSql) findings.push("executes migration SQL");

  return findings;
}

function assertMigrationOwnership(): void {
  const scriptsDir = path.join(ROOT, "scripts");
  const files = sourceFiles(scriptsDir);
  const allowTransitionalDebt = !fs.existsSync(PLAN_02_SUMMARY);
  const tolerated: string[] = [];
  const violations: string[] = [];

  for (const file of files) {
    const relativePath = path.relative(ROOT, file).split(path.sep).join("/");
    if (relativePath === CHECKER_PATH) continue;

    const source = fs.readFileSync(file, "utf8");
    const findings = migrationOwnershipFindings(source);
    if (findings.length === 0) continue;

    const expectedHash = TRANSITIONAL_PLAN_02_DEBT.get(relativePath);
    if (
      allowTransitionalDebt &&
      expectedHash !== undefined &&
      sha256(source) === expectedHash
    ) {
      tolerated.push(relativePath);
      continue;
    }

    violations.push(`${relativePath}: ${findings.join(", ")}`);
  }

  const migrateScript = fs.readFileSync(path.join(ROOT, "scripts/migrate.ts"), "utf8");
  if (
    !/import\s+\{\s*migrateDatabase\s*\}\s+from\s+["']\.\.\/src\/lib\/db["']/.test(
      migrateScript,
    ) ||
    !/\bmigrateDatabase\s*\(\s*client\s*\)/.test(migrateScript)
  ) {
    violations.push(
      "scripts/migrate.ts: must delegate to src/lib/db.ts::migrateDatabase(client)",
    );
  }

  const databaseModule = fs.readFileSync(path.join(ROOT, "src/lib/db.ts"), "utf8");
  for (const requiredPattern of [
    "export async function migrateDatabase",
    'db.transaction("write")',
    "transaction.executeMultiple",
    "INSERT INTO migrations",
    "transaction.commit()",
    "rollbackQuietly(transaction)",
  ]) {
    if (!databaseModule.includes(requiredPattern)) {
      violations.push(
        `src/lib/db.ts: canonical migration owner is missing ${JSON.stringify(requiredPattern)}`,
      );
    }
  }

  const syntheticBypass = `
    const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    await db.executeMultiple(sql);
    await db.execute("INSERT INTO migrations (name) VALUES ('bypass')");
  `;
  if (migrationOwnershipFindings(syntheticBypass).length < 4) {
    violations.push("ownership detector did not reject its synthetic bypass fixture");
  }

  if (violations.length > 0) {
    throw new Error(
      `Migration ownership violations:\n${violations.map((item) => `- ${item}`).join("\n")}`,
    );
  }

  console.log(
    `Migration ownership scan passed (${files.length - 1} scripts scanned; ${tolerated.length} exact Plan 02 debt fixture(s) tolerated).`,
  );
}

async function assertImporterFailsClosed(tempRoot: string): Promise<void> {
  const databasePath = path.join(tempRoot, "missing-migration-importer.db");
  const migrationsDir = path.join(ROOT, "migrations");
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const pendingMigration = migrationFiles.at(-1);
  if (!pendingMigration || migrationFiles.length < 2) {
    throw new Error("Missing-migration fixture requires at least two migrations.");
  }

  const setupClient = createClient({ url: `file:${databasePath}` });
  let markerSnapshot = "";
  try {
    await setupClient.execute(`
      CREATE TABLE migrations (
        name TEXT PRIMARY KEY NOT NULL,
        applied_at TEXT NOT NULL DEFAULT (datetime('now')),
        checksum TEXT
      )
    `);
    await setupClient.execute(`
      CREATE TABLE source_registry (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT,
        source_type TEXT,
        allowed_use TEXT,
        reliability TEXT,
        license TEXT,
        attribution TEXT,
        homepage_url TEXT,
        fetch_method TEXT,
        notes TEXT,
        last_checked_at TEXT,
        updated_at TEXT
      )
    `);

    for (const file of migrationFiles.slice(0, -1)) {
      const checksum = sha256(fs.readFileSync(path.join(migrationsDir, file), "utf8"));
      await setupClient.execute({
        sql: "INSERT INTO migrations (name, checksum) VALUES (?, ?)",
        args: [file, checksum],
      });
    }

    const markers = await setupClient.execute(
      "SELECT name, checksum FROM migrations ORDER BY name",
    );
    markerSnapshot = JSON.stringify(markers.rows);
  } finally {
    setupClient.close();
  }

  const require = createRequire(import.meta.url);
  const tsxCli = require.resolve("tsx/cli");
  const importer = path.join(ROOT, "scripts/import-exhibit-content.ts");
  const child = spawnSync(process.execPath, [tsxCli, importer, "--write"], {
    cwd: ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      TURSO_DATABASE_URL: `file:${databasePath}`,
      TURSO_AUTH_TOKEN: "",
    },
    timeout: 30_000,
  });

  if (child.error) throw child.error;
  if (child.status === 0) {
    throw new Error("Importer accepted a database with a pending migration.");
  }
  const childOutput = `${child.stdout}\n${child.stderr}`;
  if (!childOutput.includes(pendingMigration)) {
    throw new Error(
      `Importer failed for the wrong reason; expected pending migration ${pendingMigration}.\n${childOutput}`,
    );
  }

  const verifyClient = createClient({ url: `file:${databasePath}` });
  try {
    const markers = await verifyClient.execute(
      "SELECT name, checksum FROM migrations ORDER BY name",
    );
    if (JSON.stringify(markers.rows) !== markerSnapshot) {
      throw new Error("Importer changed migration markers or checksums before failing.");
    }
    const pendingMarker = await verifyClient.execute({
      sql: "SELECT 1 FROM migrations WHERE name = ?",
      args: [pendingMigration],
    });
    if (pendingMarker.rows.length !== 0) {
      throw new Error("Importer recorded the pending migration as applied.");
    }
    const businessRows = await verifyClient.execute(
      "SELECT COUNT(*) AS count FROM source_registry",
    );
    if (Number(businessRows.rows[0]?.count) !== 0) {
      throw new Error("Importer wrote a business row before the readiness failure.");
    }
  } finally {
    verifyClient.close();
  }

  console.log(
    `Missing-migration importer fixture passed (${pendingMigration} stayed pending; markers and business rows unchanged).`,
  );
}

async function main(): Promise<void> {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-migrations-"));
  const migrationsDir = path.join(tempRoot, "migrations");
  const databasePath = path.join(tempRoot, "test.db");

  fs.mkdirSync(migrationsDir);
  fs.writeFileSync(
    path.join(migrationsDir, "001_create.sql"),
    "CREATE TABLE sample (id INTEGER PRIMARY KEY, value TEXT NOT NULL);",
  );
  fs.writeFileSync(
    path.join(migrationsDir, "002_transaction.sql"),
    "BEGIN;\nINSERT INTO sample (value) VALUES ('kept');\nCOMMIT;\n",
  );

  const client = createClient({ url: `file:${databasePath}` });

  try {
    assertMigrationOwnership();
    if (process.argv.includes("--migration-ownership")) {
      await assertImporterFailsClosed(tempRoot);
    }

    const first = await migrateDatabase(client, { migrationsDir });
    if (first.applied.length !== 2 || first.skipped.length !== 0) {
      throw new Error(`Unexpected first migration result: ${JSON.stringify(first)}`);
    }

    const second = await migrateDatabase(client, { migrationsDir });
    if (second.applied.length !== 0 || second.skipped.length !== 2) {
      throw new Error(`Migrations were not idempotent: ${JSON.stringify(second)}`);
    }

    await assertDatabaseReady(client, { migrationsDir });

    fs.appendFileSync(
      path.join(migrationsDir, "002_transaction.sql"),
      "\n-- checksum drift",
    );
    let driftWasRejected = false;
    try {
      await migrateDatabase(client, { migrationsDir });
    } catch (error) {
      driftWasRejected =
        error instanceof Error && error.message.includes("002_transaction.sql");
    }
    if (!driftWasRejected) {
      throw new Error("An applied migration rewrite was not rejected.");
    }
    fs.writeFileSync(
      path.join(migrationsDir, "002_transaction.sql"),
      "BEGIN;\nINSERT INTO sample (value) VALUES ('kept');\nCOMMIT;\n",
    );

    fs.writeFileSync(
      path.join(migrationsDir, "003_failure.sql"),
      "INSERT INTO sample (value) VALUES ('rolled back');\nINSERT INTO table_that_does_not_exist VALUES (1);",
    );

    let failed = false;
    try {
      await migrateDatabase(client, { migrationsDir });
    } catch (error) {
      failed = error instanceof Error && error.message.includes("003_failure.sql");
    }

    if (!failed) throw new Error("A broken migration did not fail the command.");

    const marker = await client.execute({
      sql: "SELECT 1 FROM migrations WHERE name = ?",
      args: ["003_failure.sql"],
    });
    if (marker.rows.length !== 0) {
      throw new Error("A failed migration was incorrectly recorded as applied.");
    }

    const rolledBackWrite = await client.execute(
      "SELECT 1 FROM sample WHERE value = 'rolled back'",
    );
    if (rolledBackWrite.rows.length !== 0) {
      throw new Error("A write before a migration failure was not rolled back.");
    }

    let pendingWasRejected = false;
    try {
      await assertDatabaseReady(client, { migrationsDir });
    } catch (error) {
      pendingWasRejected =
        error instanceof Error && error.message.includes("003_failure.sql");
    }

    if (!pendingWasRejected) {
      throw new Error("Runtime schema guard did not reject a pending migration.");
    }

    const replayDatabasePath = path.join(tempRoot, "full-replay.db");
    const replayClient = createClient({ url: `file:${replayDatabasePath}` });
    try {
      await migrateDatabase(replayClient);
      await assertDatabaseReady(replayClient);
      const foreignKeys = await replayClient.execute("PRAGMA foreign_key_check");
      if (foreignKeys.rows.length > 0) {
        throw new Error(
          `Fresh migration replay left ${foreignKeys.rows.length} foreign-key violation(s).`,
        );
      }
    } finally {
      replayClient.close();
    }

    console.log("Migration safety check passed, including a fresh full replay.");
  } finally {
    client.close();
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
