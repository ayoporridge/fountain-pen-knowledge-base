import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import Database from "better-sqlite3";
import { assertDatabaseReady, resolveDatabaseConnection } from "../src/lib/db";
import {
  assertCatalogSnapshotUnchanged,
  backupCatalogToDisposableCopy,
  openReadOnlyCatalog,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";

const ROOT = process.cwd();
const REAL_CATALOG_PATH = path.join(ROOT, "data", "fpkg.db");
const MIGRATION_030_PATH = path.join(
  ROOT,
  "migrations",
  "030_publication_gate.sql",
);
const MIGRATION_031_PATH = path.join(
  ROOT,
  "migrations",
  "031_evidence_readiness_v2.sql",
);
const MIGRATION_031 = "031_evidence_readiness_v2.sql";
const V1_HASH = `sha256:v1:${"a".repeat(64)}`;

const REQUIRED_V2_OBJECTS = [
  ["table", "fact_scopes"],
  ["table", "spec_field_evidence"],
  ["table", "claim_evidence"],
  ["table", "fact_conflicts"],
  ["table", "fact_conflict_members"],
  ["table", "entity_content_reviews"],
  ["table", "entity_publications"],
  ["index", "idx_fact_scopes_entity"],
  ["index", "idx_spec_field_evidence_spec_field"],
  ["index", "idx_claim_evidence_claim"],
  ["index", "idx_fact_conflicts_entity_status"],
  ["index", "idx_entity_content_reviews_lookup"],
  ["view", "publication_v2_qualified_source_items"],
  ["view", "publication_v2_field_evidence"],
  ["view", "publication_v2_qualified_core_claims"],
  ["view", "publication_v2_source_groups"],
  ["view", "publication_v2_source_group_counts"],
  ["view", "publication_v2_required_spec_fields"],
  ["view", "publication_v2_missing_core_claim_evidence"],
  ["view", "publication_v2_unresolved_conflicts"],
  ["view", "publication_v2_current_reviews"],
  ["view", "publication_v2_qualified_primary_media"],
  ["view", "publication_claim_entities"],
  ["view", "publication_citation_entities"],
  ["view", "publication_source_item_entities"],
  ["view", "publication_base_blockers"],
  ["view", "publication_public_brands"],
  ["view", "publication_blockers"],
  ["view", "public_entity_readiness"],
  ["view", "public_entities"],
  ["trigger", "publication_publish_insert_guard"],
  ["trigger", "publication_publish_transition_guard"],
] as const;

type MigrationFixtureKind = "fresh" | "upgrade";

interface PublicationLifecycleRow {
  entityId: string;
  status: string;
  contentRevision: number;
  createdAt: string;
}

interface MigrationFixture {
  readonly kind: MigrationFixtureKind;
  readonly tempRoot: string;
  readonly sourcePath: string;
  readonly databasePath: string;
  readonly databaseUrl: string;
  readonly lifecycleBefore: readonly PublicationLifecycleRow[];
}

function assertCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message);
}

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

async function expectReject(
  run: () => Promise<unknown>,
  messageFragment: string,
): Promise<void> {
  try {
    await run();
  } catch (error) {
    assertCondition(error instanceof Error, "Expected an Error instance.");
    assertCondition(
      error.message.includes(messageFragment),
      `Expected rejection containing ${JSON.stringify(messageFragment)}, received: ${error.message}`,
    );
    return;
  }
  throw new Error(`Expected rejection containing: ${messageFragment}`);
}

function expectSqliteReject(
  run: () => unknown,
  messageFragment: string,
): void {
  try {
    run();
  } catch (error) {
    assertCondition(error instanceof Error, "Expected a SQLite Error instance.");
    assertCondition(
      error.message.includes(messageFragment),
      `Expected SQLite rejection containing ${JSON.stringify(messageFragment)}, received: ${error.message}`,
    );
    return;
  }
  throw new Error(`Expected SQLite rejection containing: ${messageFragment}`);
}

function migrationEnvironment(databaseUrl: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
    FPKG_DATABASE_URL: databaseUrl,
    PUBLICATION_GATE_FIXTURE: "1",
  };
}

function assertRealCatalogCopyPreconditions(before: CatalogSnapshot): void {
  assertCondition(before.main.exists, "The real catalog main file is missing.");
  assertCondition(
    !before.wal.exists || before.wal.size === "0",
    "Refusing the filesystem seed copy because the real catalog WAL is non-empty.",
  );
}

function createFreshSource(sourcePath: string): void {
  const database = new Database(sourcePath);
  try {
    database.pragma("journal_mode = DELETE");
    database.pragma("user_version = 0");
  } finally {
    database.close();
  }
}

function readLifecycle(database: Database.Database): PublicationLifecycleRow[] {
  const table = database
    .prepare(
      "SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'entity_publications'",
    )
    .get();
  if (!table) return [];
  return database
    .prepare(
      `
        SELECT entity_id AS entityId, status, content_revision AS contentRevision,
               created_at AS createdAt
        FROM entity_publications
        ORDER BY entity_id
      `,
    )
    .all() as PublicationLifecycleRow[];
}

function prepareUpgradeSource(sourcePath: string): PublicationLifecycleRow[] {
  const database = new Database(sourcePath);
  try {
    database.pragma("foreign_keys = ON");
    const migrations = database
      .prepare(
        "SELECT name, applied_at, checksum FROM migrations ORDER BY name",
      )
      .all() as Array<Record<string, unknown>>;
    assertCondition(
      migrations.some((row) => row.name === "030_publication_gate.sql"),
      "Upgrade source is not a canonical migration-030 catalog.",
    );
    assertCondition(
      !migrations.some((row) => row.name === MIGRATION_031),
      "Upgrade source already contains migration 031.",
    );

    database.exec("BEGIN IMMEDIATE");
    try {
      database
        .prepare(
          `
            INSERT INTO entities (id, type, slug, name, summary, body_md, source)
            VALUES (?, 'brand', ?, ?, ?, ?, 'phase19-upgrade-fixture')
          `,
        )
        .run(
          "phase19-old-published",
          "phase19-old-published",
          "Phase 19 old published",
          "Old published summary",
          "Old published body",
        );
      database
        .prepare(
          `
            INSERT INTO stories (id, entity_id, title, story_type, body_md, status)
            VALUES (?, ?, ?, 'brand_story', ?, 'published')
          `,
        )
        .run(
          "story-phase19-old-published",
          "phase19-old-published",
          "Old published story",
          "Old published story body",
        );
      database
        .prepare(
          `
            UPDATE entity_publications
            SET status = 'in_review',
                approved_content_hash = ?,
                reviewed_content_revision = content_revision,
                reviewed_contract_version = 1,
                reviewed_by = 'phase19-v1-reviewer',
                reviewed_at = '2026-07-16T00:00:00.000Z',
                published_at = '2026-07-16T00:00:01.000Z'
            WHERE entity_id = 'phase19-old-published'
          `,
        )
        .run(V1_HASH);
      database
        .prepare(
          "UPDATE entity_publications SET status = 'published' WHERE entity_id = ?",
        )
        .run("phase19-old-published");

      database
        .prepare(
          `
            INSERT INTO entities (id, type, slug, name, summary, body_md, source)
            VALUES (?, 'brand', ?, ?, ?, ?, 'phase19-upgrade-fixture')
          `,
        )
        .run(
          "phase19-old-retired",
          "phase19-old-retired",
          "Phase 19 old retired",
          "Old retired summary",
          "Old retired body",
        );
      database
        .prepare(
          "UPDATE entity_publications SET status = 'retired' WHERE entity_id = ?",
        )
        .run("phase19-old-retired");
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
    return readLifecycle(database);
  } finally {
    database.close();
  }
}

function runCanonicalMigration(fixture: MigrationFixture): string {
  const child = spawnSync("pnpm", ["migrate"], {
    cwd: ROOT,
    env: migrationEnvironment(fixture.databaseUrl),
    encoding: "utf8",
    timeout: 120_000,
  });
  if (child.error) throw child.error;
  const output = `${child.stdout ?? ""}${child.stderr ?? ""}`;
  assertCondition(
    child.status === 0,
    `Canonical pnpm migrate failed for ${fixture.kind} fixture:\n${output}`,
  );
  assertCondition(
    output.includes("Migration target: local SQLite"),
    `Canonical migration did not report a local SQLite target:\n${output}`,
  );
  return output;
}

async function createMigrationFixture(
  kind: MigrationFixtureKind,
): Promise<{ fixture: MigrationFixture; realBefore: CatalogSnapshot }> {
  const realBefore = snapshotCatalogFiles(REAL_CATALOG_PATH);
  assertRealCatalogCopyPreconditions(realBefore);
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), `fpkg-phase19-evidence-${kind}-`)),
  );
  const sourcePath = path.join(tempRoot, "source.db");
  const databasePath = path.join(tempRoot, "fixture.db");

  try {
    if (kind === "fresh") createFreshSource(sourcePath);
    else fs.copyFileSync(REAL_CATALOG_PATH, sourcePath);

    const lifecycleBefore = kind === "upgrade"
      ? prepareUpgradeSource(sourcePath)
      : [];
    const source = openReadOnlyCatalog(sourcePath, {
      env: migrationEnvironment(`file:${databasePath}`),
    });
    try {
      const backup = await backupCatalogToDisposableCopy(
        source,
        databasePath,
        tempRoot,
      );
      assertCondition(
        backup.destinationPath === databasePath && backup.remainingPages === 0,
        "SQLite online backup did not complete inside the owned fixture root.",
      );
    } finally {
      source.close();
    }

    return {
      realBefore,
      fixture: {
        kind,
        tempRoot,
        sourcePath,
        databasePath,
        databaseUrl: `file:${databasePath}`,
        lifecycleBefore,
      },
    };
  } catch (error) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    assertCatalogSnapshotUnchanged(realBefore);
    throw error;
  }
}

async function withMigratedFixture<T>(
  kind: MigrationFixtureKind,
  run: (fixture: MigrationFixture, firstMigrationOutput: string) => Promise<T>,
): Promise<T> {
  const { fixture, realBefore } = await createMigrationFixture(kind);
  try {
    const firstMigrationOutput = runCanonicalMigration(fixture);
    return await run(fixture, firstMigrationOutput);
  } finally {
    fs.rmSync(fixture.tempRoot, { recursive: true, force: true });
    assertCatalogSnapshotUnchanged(realBefore);
  }
}

async function assertMigrationMarker(client: Client): Promise<void> {
  assertCondition(
    fs.existsSync(MIGRATION_031_PATH),
    `Missing required migration file: ${MIGRATION_031}`,
  );
  const tableColumns = await client.execute("PRAGMA table_info(migrations)");
  const columnNames = tableColumns.rows.map((row) => String(row.name));
  assertCondition(
    ["name", "applied_at", "checksum"].every((name) =>
      columnNames.includes(name)
    ),
    `Canonical migrations table has unexpected columns: ${columnNames.join(", ")}.`,
  );
  const legacyMarker = await client.execute(
    "SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'schema_migrations'",
  );
  assertCondition(
    legacyMarker.rows.length === 0,
    "Evidence checker must not invent a schema_migrations table.",
  );
  const marker = await client.execute({
    sql: "SELECT applied_at, checksum FROM migrations WHERE name = ?",
    args: [MIGRATION_031],
  });
  assertCondition(marker.rows.length === 1, "Migration 031 marker is missing.");
  assertCondition(
    String(marker.rows[0]?.checksum) === sha256File(MIGRATION_031_PATH),
    "Migration 031 checksum does not match its canonical SQL file.",
  );
  assertCondition(
    String(marker.rows[0]?.applied_at ?? "").trim().length > 0,
    "Migration 031 marker has no applied_at value.",
  );
}

async function assertMigration030Unchanged(client: Client): Promise<void> {
  const marker = await client.execute({
    sql: "SELECT checksum FROM migrations WHERE name = ?",
    args: ["030_publication_gate.sql"],
  });
  assertCondition(marker.rows.length === 1, "Migration 030 marker is missing.");
  assertCondition(
    String(marker.rows[0]?.checksum) === sha256File(MIGRATION_030_PATH),
    "Migration 030 checksum/content changed while applying migration 031.",
  );
}

async function assertIntegrity(client: Client): Promise<void> {
  const quick = await client.execute("PRAGMA quick_check");
  assertCondition(
    quick.rows.every(
      (row) => String(row.quick_check ?? Object.values(row)[0]) === "ok",
    ),
    `PRAGMA quick_check failed: ${JSON.stringify(quick.rows)}`,
  );
  const foreignKeys = await client.execute("PRAGMA foreign_key_check");
  assertCondition(
    foreignKeys.rows.length === 0,
    `PRAGMA foreign_key_check found ${foreignKeys.rows.length} violation(s).`,
  );
}

async function assertRequiredObjects(client: Client): Promise<void> {
  const names = REQUIRED_V2_OBJECTS.map(([, name]) => name);
  const result = await client.execute({
    sql: `SELECT type, name FROM sqlite_schema WHERE name IN (${names.map(() => "?").join(", ")})`,
    args: names,
  });
  const actual = new Set(
    result.rows.map((row) => `${String(row.type)}:${String(row.name)}`),
  );
  const missing = REQUIRED_V2_OBJECTS
    .filter(([type, name]) => !actual.has(`${type}:${name}`))
    .map(([type, name]) => `${type}:${name}`);
  assertCondition(
    missing.length === 0,
    `Evidence/readiness v2 schema objects are missing: ${missing.join(", ")}.`,
  );
}

async function assertUpgradeLifecycle(
  client: Client,
  before: readonly PublicationLifecycleRow[],
): Promise<void> {
  const result = await client.execute(`
    SELECT entity_id AS entityId, status, content_revision AS contentRevision,
           created_at AS createdAt, approved_content_hash, reviewed_content_revision,
           reviewed_contract_version, reviewed_by, reviewed_at, published_at
    FROM entity_publications
    ORDER BY entity_id
  `);
  assertCondition(
    result.rows.length === before.length,
    `entity_publications rebuild changed row count ${before.length} -> ${result.rows.length}.`,
  );
  const beforeById = new Map(before.map((row) => [row.entityId, row]));
  for (const row of result.rows) {
    const entityId = String(row.entityId);
    const old = beforeById.get(entityId);
    assertCondition(old, `entity_publications rebuild added unknown row ${entityId}.`);
    const expectedStatus = old.status === "retired" ? "retired" : "draft";
    assertCondition(
      row.status === expectedStatus,
      `${entityId} expected ${expectedStatus} after contract upgrade, got ${String(row.status)}.`,
    );
    assertCondition(
      Number(row.contentRevision) === old.contentRevision &&
        String(row.createdAt) === old.createdAt,
      `${entityId} lost lifecycle identity/revision during table rebuild.`,
    );
    for (const field of [
      "approved_content_hash",
      "reviewed_content_revision",
      "reviewed_contract_version",
      "reviewed_by",
      "reviewed_at",
      "published_at",
    ] as const) {
      assertCondition(
        row[field] === null,
        `${entityId}.${field} grandfathered a contract-v1 review.`,
      );
    }
  }
  const published = await client.execute(
    "SELECT id FROM public_entities WHERE id = 'phase19-old-published'",
  );
  assertCondition(
    published.rows.length === 0,
    "A contract-v1 published fixture remained public after migration 031.",
  );
}

async function runMigrationContract(): Promise<void> {
  const migration030Before = sha256File(MIGRATION_030_PATH);

  await withMigratedFixture("fresh", async (fixture, firstOutput) => {
    assertCondition(
      firstOutput.includes(MIGRATION_031),
      `Fresh canonical migration did not report ${MIGRATION_031}.`,
    );
    const client = createClient({ url: fixture.databaseUrl });
    try {
      await assertMigrationMarker(client);
      await assertMigration030Unchanged(client);
      await assertIntegrity(client);
      await assertDatabaseReady(client);
      await assertRequiredObjects(client);
      const replayOutput = runCanonicalMigration(fixture);
      assertCondition(
        replayOutput.includes("Applied: 0"),
        `Migration replay was not idempotent:\n${replayOutput}`,
      );
      await assertMigrationMarker(client);
      await assertIntegrity(client);
    } finally {
      client.close();
    }
  });

  await withMigratedFixture("upgrade", async (fixture, firstOutput) => {
    assertCondition(
      firstOutput.includes(MIGRATION_031),
      `Upgrade canonical migration did not report ${MIGRATION_031}.`,
    );
    const client = createClient({ url: fixture.databaseUrl });
    try {
      await assertMigrationMarker(client);
      await assertMigration030Unchanged(client);
      await assertUpgradeLifecycle(client, fixture.lifecycleBefore);
      await assertIntegrity(client);
      await assertDatabaseReady(client);
      await assertRequiredObjects(client);
      const replayOutput = runCanonicalMigration(fixture);
      assertCondition(
        replayOutput.includes("Applied: 0"),
        `Upgrade replay was not idempotent:\n${replayOutput}`,
      );
      await assertUpgradeLifecycle(client, fixture.lifecycleBefore);
    } finally {
      client.close();
    }
  });

  assertCondition(
    sha256File(MIGRATION_030_PATH) === migration030Before,
    "Migration 030 file content changed during evidence migration checks.",
  );
  console.log(
    "Evidence migration contract passed: online-backup fresh/upgrade targets, canonical migration/replay, v1 review invalidation, rebuild parity, checksum, quick_check and foreign_key_check are green.",
  );
}

async function runSchemaContract(): Promise<void> {
  await withMigratedFixture("fresh", async (fixture) => {
    const database = new Database(fixture.databasePath);
    try {
      database.pragma("foreign_keys = ON");
      const claims = database.pragma("table_info(claims)") as Array<{
        name: string;
        notnull: number;
        dflt_value: string | null;
      }>;
      const factClass = claims.find((column) => column.name === "fact_class");
      assertCondition(
        factClass?.notnull === 1 &&
          String(factClass.dflt_value).includes("unclassified"),
        "claims.fact_class must be NOT NULL and default fail-closed to unclassified.",
      );

      const sourceItems = database.pragma("table_info(source_items)") as Array<{
        name: string;
      }>;
      for (const column of [
        "source_tier",
        "independence_group",
        "archive_url",
        "archive_locator",
      ]) {
        assertCondition(
          sourceItems.some((item) => item.name === column),
          `source_items.${column} is missing from item-level provenance.`,
        );
      }

      const citations = database.pragma("table_info(citations)") as Array<{
        name: string;
        dflt_value: string | null;
      }>;
      assertCondition(
        citations.some(
          (column) =>
            column.name === "review_status" &&
            String(column.dflt_value).includes("pending"),
        ),
        "citations.review_status must default to pending.",
      );
      for (const column of ["evidence_locator", "scope_id"]) {
        assertCondition(
          citations.some((item) => item.name === column),
          `citations.${column} is missing.`,
        );
      }

      expectSqliteReject(
        () =>
          database
            .prepare(
              `
                INSERT INTO source_registry (
                  id, name, source_type, allowed_use, reliability,
                  default_source_tier
                ) VALUES ('invalid-tier-registry', 'Invalid', 'official',
                          'summary_only', 'medium', 'not-a-tier')
              `,
            )
            .run(),
        "CHECK constraint failed",
      );
      expectSqliteReject(
        () =>
          database
            .prepare(
              `
                INSERT INTO entity_content_reviews (
                  id, entity_id, review_kind, content_hash, status
                ) VALUES ('invalid-review', 'missing', 'combined',
                          'sha256:v2:${"a".repeat(64)}', 'pending')
              `,
            )
            .run(),
        "CHECK constraint failed",
      );
      expectSqliteReject(
        () =>
          database
            .prepare(
              `
                INSERT INTO claim_evidence (
                  id, claim_id, citation_id, scope_id, evidence_locator,
                  review_status
                ) VALUES ('invalid-locator', 'missing', 'missing', 'missing',
                          '   ', 'approved')
              `,
            )
            .run(),
        "CHECK constraint failed",
      );
    } finally {
      database.close();
    }
  });
  console.log(
    "Evidence schema contract passed: normalized evidence/provenance/scope/conflict/review objects and fail-closed constraints are present.",
  );
}

async function runFixtureIsolation(): Promise<void> {
  const before = snapshotCatalogFiles(REAL_CATALOG_PATH);
  const realCatalogUrl = `file:${REAL_CATALOG_PATH}`;
  expectSqliteReject(
    () =>
      resolveDatabaseConnection({
        PUBLICATION_GATE_FIXTURE: "1",
        FPKG_DATABASE_URL: realCatalogUrl,
      }),
    "may not use the real data/fpkg.db",
  );
  await withMigratedFixture("fresh", async (fixture) => {
    const resolved = resolveDatabaseConnection(
      migrationEnvironment(fixture.databaseUrl),
    );
    assertCondition(
      resolved.localPath === fixture.databasePath,
      "Evidence fixture did not resolve to its owned migration target.",
    );
  });
  assertCatalogSnapshotUnchanged(before);
  console.log(
    "Evidence fixture isolation passed: the real database was never opened by SQLite, and canonical migration stayed inside an online-backed owned target.",
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  if (args.length === 1 && args[0] === "--migration") {
    await runMigrationContract();
    return;
  }
  if (args.length === 1 && args[0] === "--schema") {
    await runSchemaContract();
    return;
  }
  if (args.length === 1 && args[0] === "--fixture-isolation") {
    await runFixtureIsolation();
    return;
  }
  if (args.length === 0 || (args.length === 1 && args[0] === "--all")) {
    await runMigrationContract();
    await runSchemaContract();
    return;
  }
  throw new Error(
    "Usage: pnpm check:evidence-contract -- --migration|--schema|--fixture-isolation|--all",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
