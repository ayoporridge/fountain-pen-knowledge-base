import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import Database from "better-sqlite3";
import {
  assertDatabaseReady,
  migrateDatabase,
  resolveDatabaseConnection,
} from "../src/lib/db";
import {
  assertCatalogSnapshotUnchanged,
  backupCatalogToDisposableCopy,
  openReadOnlyCatalog,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import {
  computePublicationContentHash,
  publishEntity,
  readPublicationContentPayload,
  recordEntityContentReview,
} from "../src/lib/publication";
import {
  assertPhase19LockedRealCatalog,
  installPhase19FixtureSignalHandlers,
  seedQualifiedPublicationFixture,
  withPhase19Fixture,
} from "./lib/phase19-fixtures";

const ROOT = process.cwd();
const REAL_CATALOG_PATH = path.join(ROOT, "data", "fpkg.db");
const MIGRATION_030_PATH = path.join(
  ROOT,
  "migrations",
  "030_publication_gate.sql",
);
const MIGRATION_030 = "030_publication_gate.sql";
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
  ["index", "idx_fact_scopes_variant"],
  ["index", "idx_spec_field_evidence_spec_field"],
  ["index", "idx_spec_field_evidence_citation"],
  ["index", "idx_spec_field_evidence_scope"],
  ["index", "idx_claim_evidence_claim"],
  ["index", "idx_claim_evidence_citation"],
  ["index", "idx_claim_evidence_scope"],
  ["index", "idx_fact_conflicts_entity_status"],
  ["index", "idx_fact_conflicts_scope"],
  ["index", "idx_fact_conflicts_semantic_unique"],
  ["index", "idx_fact_conflict_members_conflict"],
  ["index", "idx_fact_conflict_members_citation"],
  ["index", "idx_entity_content_reviews_lookup"],
  ["index", "idx_entity_publications_status"],
  ["index", "idx_entity_publications_review_contract"],
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
  ["view", "publication_payload_claim_entities"],
  ["view", "publication_evidence_citation_entities"],
  ["view", "publication_invalidation_citation_entities"],
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
  ["trigger", "fact_scope_variant_insert_guard"],
  ["trigger", "fact_scope_variant_update_guard"],
  ["trigger", "publication_fact_scope_insert"],
  ["trigger", "publication_fact_scope_update_old"],
  ["trigger", "publication_fact_scope_update_new"],
  ["trigger", "publication_fact_scope_delete"],
  ["trigger", "publication_spec_field_evidence_insert"],
  ["trigger", "publication_spec_field_evidence_update_old"],
  ["trigger", "publication_spec_field_evidence_update_new"],
  ["trigger", "publication_spec_field_evidence_delete"],
  ["trigger", "publication_claim_evidence_insert"],
  ["trigger", "publication_claim_evidence_update_old"],
  ["trigger", "publication_claim_evidence_update_new"],
  ["trigger", "publication_claim_evidence_delete"],
  ["trigger", "publication_fact_conflict_insert"],
  ["trigger", "publication_fact_conflict_update_old"],
  ["trigger", "publication_fact_conflict_update_new"],
  ["trigger", "publication_fact_conflict_delete"],
  ["trigger", "publication_fact_conflict_member_insert"],
  ["trigger", "publication_fact_conflict_member_update_old"],
  ["trigger", "publication_fact_conflict_member_update_new"],
  ["trigger", "publication_fact_conflict_member_delete"],
  ["trigger", "publication_content_review_update"],
  ["trigger", "publication_content_review_delete"],
  ["trigger", "publication_entity_id_immutable"],
  ["trigger", "publication_story_id_immutable"],
  ["trigger", "publication_model_spec_id_immutable"],
  ["trigger", "publication_model_variant_id_immutable"],
  ["trigger", "publication_claim_id_immutable"],
  ["trigger", "publication_citation_id_immutable"],
  ["trigger", "publication_source_item_id_immutable"],
  ["trigger", "publication_source_registry_id_immutable"],
  ["trigger", "publication_entity_reference_id_immutable"],
  ["trigger", "publication_timeline_event_id_immutable"],
  ["trigger", "publication_media_asset_id_immutable"],
  ["trigger", "publication_entity_link_id_immutable"],
  ["trigger", "publication_fact_scope_id_immutable"],
  ["trigger", "publication_spec_field_evidence_id_immutable"],
  ["trigger", "publication_claim_evidence_id_immutable"],
  ["trigger", "publication_fact_conflict_id_immutable"],
  ["trigger", "publication_fact_conflict_member_id_immutable"],
  ["trigger", "publication_lifecycle_entity_id_immutable"],
  ["trigger", "publication_content_revision_revoke_reviews"],
  ["trigger", "publication_published_snapshot_immutable"],
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
  readonly legacyNonBrandBefore: readonly string[];
}

interface UpgradeSourceState {
  readonly lifecycleBefore: readonly PublicationLifecycleRow[];
  readonly legacyNonBrandBefore: readonly string[];
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

function prepareUpgradeSource(sourcePath: string): UpgradeSourceState {
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
    // The raw main-file seed inherits WAL mode. This source is already an
    // executor-owned disposable staging copy, so normalize it to DELETE before
    // reopening through the 19-01 read-only online-backup adapter; otherwise a
    // read-only SQLite open may create staging -wal/-shm sidecars and correctly
    // trip the source snapshot guard.
    database.pragma("journal_mode = DELETE");
    const legacyNonBrandBefore = (
      database
        .prepare(
          `
            SELECT id
            FROM public_entities
            WHERE type NOT IN ('brand', 'pen')
            ORDER BY id
          `,
        )
        .all() as Array<{ id: string }>
    ).map((row) => row.id);
    return {
      lifecycleBefore: readLifecycle(database),
      legacyNonBrandBefore,
    };
  } finally {
    database.close();
  }
}

async function createMigration030Source(
  sourcePath: string,
  tempRoot: string,
): Promise<UpgradeSourceState> {
  createFreshSource(sourcePath);
  const migrationsDir = path.join(tempRoot, "migrations-through-030");
  fs.mkdirSync(migrationsDir);
  const files = fs
    .readdirSync(path.dirname(MIGRATION_030_PATH))
    .filter((file) => file.endsWith(".sql") && file <= MIGRATION_030)
    .sort();
  assertCondition(
    files.at(-1) === MIGRATION_030 &&
      !files.includes("031_evidence_readiness_v2.sql") &&
      !files.includes("032_taxonomy_identity.sql"),
    "Upgrade source migration fixture did not stop at migration 030.",
  );
  for (const file of files) {
    fs.copyFileSync(
      path.join(path.dirname(MIGRATION_030_PATH), file),
      path.join(migrationsDir, file),
    );
  }
  const client = createClient({ url: `file:${sourcePath}` });
  try {
    await migrateDatabase(client, { migrationsDir });
  } finally {
    client.close();
  }
  return prepareUpgradeSource(sourcePath);
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
  const realBefore = assertPhase19LockedRealCatalog(
    snapshotCatalogFiles(REAL_CATALOG_PATH),
  );
  assertRealCatalogCopyPreconditions(realBefore);
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), `fpkg-phase19-evidence-${kind}-`)),
  );
  const sourcePath = path.join(tempRoot, "source.db");
  const databasePath = path.join(tempRoot, "fixture.db");

  try {
    const upgradeSource = kind === "upgrade"
      ? await createMigration030Source(sourcePath, tempRoot)
      : (createFreshSource(sourcePath), {
          lifecycleBefore: [],
          legacyNonBrandBefore: [],
        });
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
        lifecycleBefore: upgradeSource.lifecycleBefore,
        legacyNonBrandBefore: upgradeSource.legacyNonBrandBefore,
      },
    };
  } catch (error) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    assertCatalogSnapshotUnchanged(
      realBefore,
      assertPhase19LockedRealCatalog(
        snapshotCatalogFiles(REAL_CATALOG_PATH),
      ),
    );
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
    assertCatalogSnapshotUnchanged(
      realBefore,
      assertPhase19LockedRealCatalog(
        snapshotCatalogFiles(REAL_CATALOG_PATH),
      ),
    );
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
      Number(row.contentRevision) === old.contentRevision + 1 &&
        String(row.createdAt) === old.createdAt,
      `${entityId} lost lifecycle identity or contract-v3 revision bump during table rebuild.`,
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

async function assertLegacyNonBrandCompatibility(
  client: Client,
  before: readonly string[],
): Promise<void> {
  const result = await client.execute(`
    SELECT id
    FROM public_entities
    WHERE type NOT IN ('brand', 'pen')
    ORDER BY id
  `);
  const after = result.rows.map((row) => String(row.id));
  assertCondition(
    JSON.stringify(after) === JSON.stringify(before),
    `Contract-v2 migration changed the legacy non-brand public set (${before.length} -> ${after.length}).`,
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
      await assertLegacyNonBrandCompatibility(
        client,
        fixture.legacyNonBrandBefore,
      );
      await assertIntegrity(client);
      await assertDatabaseReady(client);
      await assertRequiredObjects(client);
      const replayOutput = runCanonicalMigration(fixture);
      assertCondition(
        replayOutput.includes("Applied: 0"),
        `Upgrade replay was not idempotent:\n${replayOutput}`,
      );
      await assertUpgradeLifecycle(client, fixture.lifecycleBefore);
      await assertLegacyNonBrandCompatibility(
        client,
        fixture.legacyNonBrandBefore,
      );
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

interface SourceItemSeed {
  id: string;
  sourceId: string;
  tier?: string;
  group?: string;
}

interface CoreEvidenceSeed {
  entityId: string;
  claimId: string;
  itemId: string;
  scopeId: string;
  includeCitation?: boolean;
  citationLocator?: string | null;
  citationScopeId?: string | null;
}

function seedSchemaEntity(
  database: Database.Database,
  entityId: string,
): void {
  database
    .prepare(
      `
        INSERT INTO entities (id, type, slug, name, summary, body_md, source)
        VALUES (?, 'brand', ?, ?, 'Evidence fixture summary',
                'Evidence fixture body', 'phase19-schema-fixture')
      `,
    )
    .run(entityId, entityId, entityId);
}

function seedSourceItem(
  database: Database.Database,
  seed: SourceItemSeed,
): void {
  database
    .prepare(
      `
        INSERT INTO source_items (
          id, source_id, title, url, retrieved_at, allowed_use,
          review_status, source_tier, independence_group,
          archive_url, archive_locator
        ) VALUES (?, ?, ?, ?, '2026-07-16', 'summary_only', 'approved',
                  ?, ?, ?, 'snapshot:phase19')
      `,
    )
    .run(
      seed.id,
      seed.sourceId,
      seed.id,
      `https://example.invalid/${seed.id}`,
      seed.tier ?? null,
      seed.group ?? null,
      `https://archive.invalid/${seed.id}`,
    );
}

function seedScope(
  database: Database.Database,
  entityId: string,
  scopeId: string,
): void {
  database
    .prepare(
      `
        INSERT INTO fact_scopes (
          id, entity_id, scope_key, market, production_state
        ) VALUES (?, ?, ?, 'global', 'historical')
      `,
    )
    .run(scopeId, entityId, scopeId);
}

function seedCoreEvidence(
  database: Database.Database,
  seed: CoreEvidenceSeed,
): void {
  database
    .prepare(
      `
        INSERT INTO claims (
          id, subject_entity_id, predicate, object_text,
          confidence, review_status, fact_class
        ) VALUES (?, ?, 'fixture_fact', ?, 1, 'approved', 'core')
      `,
    )
    .run(seed.claimId, seed.entityId, `value:${seed.claimId}`);
  if (seed.includeCitation === false) return;

  const citationId = `citation-${seed.claimId}`;
  database
    .prepare(
      `
        INSERT INTO citations (
          id, target_type, target_id, source_item_id,
          review_status, evidence_locator, scope_id
        ) VALUES (?, 'claim', ?, ?, 'approved', ?, ?)
      `,
    )
    .run(
      citationId,
      seed.claimId,
      seed.itemId,
      seed.citationLocator === undefined
        ? `locator:${seed.claimId}`
        : seed.citationLocator,
      seed.citationScopeId === undefined
        ? seed.scopeId
        : seed.citationScopeId,
    );
  database
    .prepare(
      `
        INSERT INTO claim_evidence (
          id, claim_id, citation_id, scope_id,
          evidence_locator, review_status
        ) VALUES (?, ?, ?, ?, ?, 'approved')
      `,
    )
    .run(
      `evidence-${seed.claimId}`,
      seed.claimId,
      citationId,
      seed.scopeId,
      `mapping:${seed.claimId}`,
    );
}

interface PublicationState {
  status: string;
  revision: number;
  approvedHash: string | null;
}

function publicationState(
  database: Database.Database,
  entityId: string,
): PublicationState {
  const row = database
    .prepare(
      `
        SELECT
          status,
          content_revision AS revision,
          approved_content_hash AS approvedHash
        FROM entity_publications
        WHERE entity_id = ?
      `,
    )
    .get(entityId) as PublicationState | undefined;
  assertCondition(row, `Missing publication lifecycle for ${entityId}.`);
  return row;
}

function contract2Hash(sequence: number): string {
  return `sha256:v3:${sequence.toString(16).padStart(64, "0")}`;
}

function setContract2ReviewSnapshot(
  database: Database.Database,
  entityId: string,
  sequence: number,
): string {
  const contentHash = contract2Hash(sequence);
  database
    .prepare(
      `
        UPDATE entity_publications
        SET status = 'in_review',
            blockers_json = '[]',
            approved_content_hash = ?,
            reviewed_content_revision = content_revision,
            reviewed_contract_version = 3,
            reviewed_by = 'phase19-contract-reviewer',
            reviewed_at = '2026-07-16T00:00:00.000Z',
            published_at = '2026-07-16T00:00:01.000Z'
        WHERE entity_id = ?
      `,
    )
    .run(contentHash, entityId);
  const revisionBeforeReviews = publicationState(database, entityId).revision;
  const insert = database.prepare(
    `
      INSERT INTO entity_content_reviews (
        id, entity_id, review_kind, content_hash, status,
        reviewer, reviewed_at
      ) VALUES (?, ?, ?, ?, 'approved', 'phase19-contract-reviewer',
                '2026-07-16T00:00:00.000Z')
    `,
  );
  for (const reviewKind of ["fact", "language", "media", "publication"]) {
    insert.run(
      `review-${entityId}-${sequence}-${reviewKind}`,
      entityId,
      reviewKind,
      contentHash,
    );
  }
  assertCondition(
    publicationState(database, entityId).revision === revisionBeforeReviews,
    "Review snapshot insertion changed content_revision.",
  );
  return contentHash;
}

function assertNotPublic(
  database: Database.Database,
  entityId: string,
  message: string,
): void {
  const row = database
    .prepare("SELECT 1 FROM public_entities WHERE id = ?")
    .get(entityId);
  assertCondition(!row, message);
}

function publishReviewedEntity(
  database: Database.Database,
  entityId: string,
): void {
  const blockers = database
    .prepare(
      `
        SELECT blocker_code AS blockerCode, detail_key AS detailKey
        FROM publication_blockers
        WHERE entity_id = ? AND contract_version = 3
        ORDER BY blocker_code, subject_type, subject_id, detail_key
      `,
    )
    .all(entityId);
  assertCondition(
    blockers.length === 0,
    `${entityId} unexpectedly retained blockers before publish: ${JSON.stringify(blockers)}`,
  );
  database
    .prepare(
      "UPDATE entity_publications SET status = 'published' WHERE entity_id = ?",
    )
    .run(entityId);
  const row = database
    .prepare("SELECT 1 FROM public_entities WHERE id = ?")
    .get(entityId);
  assertCondition(row, `${entityId} did not enter sole public_entities view.`);
}

function assertPayloadInvalidation(
  database: Database.Database,
  entityId: string,
  label: string,
  mutate: () => void,
): void {
  const before = publicationState(database, entityId);
  assertCondition(
    before.status === "published",
    `${label} fixture was not published before mutation.`,
  );
  mutate();
  const after = publicationState(database, entityId);
  assertCondition(
    after.revision > before.revision,
    `${label} did not increment content_revision.`,
  );
  assertCondition(
    after.status === "in_review",
    `${label} did not demote the published lifecycle row.`,
  );
  assertCondition(
    after.approvedHash === before.approvedHash,
    `${label} discarded the old approved hash instead of retaining audit evidence.`,
  );
  assertNotPublic(
    database,
    entityId,
    `${label} left a stale publication in public_entities.`,
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
        "publication_guard: legacy review insert is forbidden",
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

      const entityId = "phase19-schema-entity";
      seedSchemaEntity(database, entityId);
      database
        .prepare(
          `
            INSERT INTO source_registry (
              id, name, source_type, allowed_use, reliability,
              default_source_tier, default_independence_group
            ) VALUES (?, ?, 'official', 'summary_only', 'medium', ?, ?)
          `,
        )
        .run(
          "registry-defaults",
          "Registry defaults only",
          "primary",
          "registry-default-group",
        );
      for (const [id, name] of [
        ["registry-a", "Registry A"],
        ["registry-b", "Registry B"],
      ]) {
        database
          .prepare(
            `
              INSERT INTO source_registry (
                id, name, source_type, allowed_use, reliability
              ) VALUES (?, ?, 'official', 'summary_only', 'medium')
            `,
          )
          .run(id, name);
      }
      for (const [index, invalidGroup] of [
        "shared-primary-origin ",
        "Shared-primary-origin",
      ].entries()) {
        expectSqliteReject(
          () =>
            database
              .prepare(
                `
                  INSERT INTO source_items (
                    id, source_id, title, url, retrieved_at, allowed_use,
                    review_status, source_tier, independence_group,
                    archive_url, archive_locator
                  ) VALUES (
                    ?, 'registry-a', 'Invalid group', ?, '2026-07-16',
                    'summary_only', 'approved', 'primary', ?,
                    'https://archive.invalid/invalid-group', 'snapshot:invalid'
                  )
                `,
              )
              .run(
                `invalid-group-${index}`,
                `https://example.invalid/invalid-group/${index}`,
                invalidGroup,
              ),
          "CHECK constraint failed",
        );
      }

      const itemSeeds: SourceItemSeed[] = [
        { id: "item-default-only", sourceId: "registry-defaults" },
        {
          id: "item-primary-a",
          sourceId: "registry-a",
          tier: "primary",
          group: "shared-primary-origin",
        },
        {
          id: "item-primary-b",
          sourceId: "registry-b",
          tier: "primary",
          group: "shared-primary-origin",
        },
        {
          id: "item-secondary-a",
          sourceId: "registry-a",
          tier: "professional_secondary",
          group: "independent-secondary",
        },
        {
          id: "item-secondary-mirror",
          sourceId: "registry-b",
          tier: "professional_secondary",
          group: "shared-primary-origin",
        },
        {
          id: "item-retailer-a",
          sourceId: "registry-a",
          tier: "retailer",
          group: "retailer-group",
        },
        {
          id: "item-community-a",
          sourceId: "registry-a",
          tier: "community",
          group: "community-group",
        },
        {
          id: "item-search-a",
          sourceId: "registry-a",
          tier: "search",
          group: "search-group",
        },
      ];
      for (const seed of itemSeeds) seedSourceItem(database, seed);
      database
        .prepare(
          `
            INSERT INTO source_items (
              id, source_id, title, url, retrieved_at, review_status,
              source_tier, independence_group, archive_url, archive_locator
            ) VALUES (
              'item-missing-allowed-use', 'registry-a',
              'Item missing allowed use',
              'https://example.invalid/item-missing-allowed-use',
              '2026-07-16', 'approved', 'primary', 'missing-use-group',
              'https://archive.invalid/item-missing-allowed-use',
              'snapshot:missing-use'
            )
          `,
        )
        .run();

      const qualifiedItemIds = new Set(
        (
          database
            .prepare(
              `
                SELECT source_item_id AS sourceItemId
                FROM publication_v2_qualified_source_items
                ORDER BY source_item_id
              `,
            )
            .all() as Array<{ sourceItemId: string }>
        ).map((row) => row.sourceItemId),
      );
      assertCondition(
        !qualifiedItemIds.has("item-default-only"),
        "Registry tier/group defaults incorrectly qualified an item with NULL item provenance.",
      );
      assertCondition(
        !qualifiedItemIds.has("item-missing-allowed-use"),
        "An item without explicit allowed_use incorrectly qualified.",
      );
      assertCondition(
        itemSeeds.slice(1).every((seed) => qualifiedItemIds.has(seed.id)),
        "An explicitly reviewed item-level provenance row failed qualification.",
      );

      seedScope(database, entityId, "scope-core");
      database
        .prepare(
          `
            INSERT INTO entities (id, type, slug, name, summary)
            VALUES (
              'variant-other-entity', 'concept', 'variant-other-entity',
              'Other variant owner', 'Variant coherence fixture'
            )
          `,
        )
        .run();
      database
        .prepare(
          `
            INSERT INTO model_variants (
              id, model_entity_id, variant_name, review_status
            ) VALUES (
              'variant-owned-elsewhere', 'variant-other-entity',
              'Elsewhere variant', 'approved'
            )
          `,
        )
        .run();
      expectSqliteReject(
        () =>
          database
            .prepare(
              `
                INSERT INTO fact_scopes (
                  id, entity_id, variant_id, scope_key
                ) VALUES (
                  'cross-entity-variant-scope', ?,
                  'variant-owned-elsewhere', 'cross-entity-variant-scope'
                )
              `,
            )
            .run(entityId),
        "fact_scope: variant entity mismatch",
      );
      for (const [claimId, itemId] of [
        ["claim-primary-a", "item-primary-a"],
        ["claim-primary-b", "item-primary-b"],
        ["claim-secondary-a", "item-secondary-a"],
        ["claim-secondary-mirror", "item-secondary-mirror"],
        ["claim-retailer-a", "item-retailer-a"],
        ["claim-community-a", "item-community-a"],
        ["claim-search-a", "item-search-a"],
      ]) {
        seedCoreEvidence(database, {
          entityId,
          claimId,
          itemId,
          scopeId: "scope-core",
        });
      }
      seedCoreEvidence(database, {
        entityId,
        claimId: "claim-default-provenance",
        itemId: "item-default-only",
        scopeId: "scope-core",
      });
      seedCoreEvidence(database, {
        entityId,
        claimId: "claim-missing-allowed-use",
        itemId: "item-missing-allowed-use",
        scopeId: "scope-core",
      });
      seedCoreEvidence(database, {
        entityId,
        claimId: "claim-missing-citation",
        itemId: "item-primary-a",
        scopeId: "scope-core",
        includeCitation: false,
      });
      seedCoreEvidence(database, {
        entityId,
        claimId: "claim-missing-locator",
        itemId: "item-primary-a",
        scopeId: "scope-core",
        citationLocator: null,
      });
      seedCoreEvidence(database, {
        entityId,
        claimId: "claim-missing-scope",
        itemId: "item-primary-a",
        scopeId: "scope-core",
        citationScopeId: null,
      });
      database
        .prepare(
          `
            INSERT INTO claims (
              id, subject_entity_id, predicate, object_text,
              review_status, fact_class
            ) VALUES (
              'claim-partial-stitch', ?, 'partial_stitch', 'partial',
              'approved', 'core'
            )
          `,
        )
        .run(entityId);
      for (const [suffix, itemId, citationScope] of [
        ["scoped", "item-default-only", "scope-core"],
        ["sourced", "item-primary-a", null],
      ] as const) {
        database
          .prepare(
            `
              INSERT INTO citations (
                id, target_type, target_id, source_item_id,
                review_status, evidence_locator, scope_id
              ) VALUES (?, 'claim', 'claim-partial-stitch', ?, 'approved', ?, ?)
            `,
          )
          .run(
            `citation-partial-${suffix}`,
            itemId,
            `locator:partial:${suffix}`,
            citationScope,
          );
        database
          .prepare(
            `
              INSERT INTO claim_evidence (
                id, claim_id, citation_id, scope_id,
                evidence_locator, review_status
              ) VALUES (
                ?, 'claim-partial-stitch', ?, 'scope-core', ?, 'approved'
              )
            `,
          )
          .run(
            `evidence-partial-${suffix}`,
            `citation-partial-${suffix}`,
            `mapping:partial:${suffix}`,
          );
      }

      const sourceCounts = database
        .prepare(
          `
            SELECT
              primary_archive_group_count AS primaryCount,
              professional_secondary_group_count AS secondaryCount,
              auxiliary_group_count AS auxiliaryCount
            FROM publication_v2_source_group_counts
            WHERE entity_id = ?
          `,
        )
        .get(entityId) as
        | {
          primaryCount: number;
          secondaryCount: number;
          auxiliaryCount: number;
        }
        | undefined;
      assertCondition(
        Number(sourceCounts?.primaryCount) === 1,
        "Different registries carrying the same item-level independence group counted more than once.",
      );
      assertCondition(
        Number(sourceCounts?.secondaryCount) === 1,
        "A same-registry item with a distinct professional-secondary group was not counted independently.",
      );
      assertCondition(
        Number(sourceCounts?.auxiliaryCount) === 3,
        "Retailer/community/search groups were not retained as auxiliary-only provenance.",
      );

      const missingEvidence = database
        .prepare(
          `
            SELECT subject_id AS subjectId, detail_key AS detailKey
            FROM publication_blockers
            WHERE entity_id = ?
              AND blocker_code = 'approved_claim_missing_evidence'
            ORDER BY subject_id, detail_key
          `,
        )
        .all(entityId) as Array<{ subjectId: string; detailKey: string }>;
      const actualDetailsByClaim = new Map<string, string[]>();
      for (const row of missingEvidence) {
        const details = actualDetailsByClaim.get(row.subjectId) ?? [];
        details.push(row.detailKey);
        actualDetailsByClaim.set(row.subjectId, details);
      }
      const expectedDetailsByClaim = new Map<string, string[]>([
        [
          "claim-default-provenance",
          ["claim-default-provenance:source_provenance"],
        ],
        [
          "claim-missing-allowed-use",
          ["claim-missing-allowed-use:source_provenance"],
        ],
        [
          "claim-missing-citation",
          [
            "claim-missing-citation:citation",
            "claim-missing-citation:locator",
            "claim-missing-citation:scope",
            "claim-missing-citation:source_provenance",
          ],
        ],
        ["claim-missing-locator", ["claim-missing-locator:locator"]],
        ["claim-missing-scope", ["claim-missing-scope:scope"]],
        ["claim-partial-stitch", ["claim-partial-stitch:complete_chain"]],
      ]);
      for (const [claimId, expected] of expectedDetailsByClaim) {
        const actual = actualDetailsByClaim.get(claimId) ?? [];
        assertCondition(
          JSON.stringify(actual) === JSON.stringify(expected),
          `${claimId} missing-component details differ: ${JSON.stringify(actual)}.`,
        );
      }
      assertCondition(
        actualDetailsByClaim.size === expectedDetailsByClaim.size,
        "A complete approved core claim received approved_claim_missing_evidence.",
      );

      const qualifiedCoreClaims = new Set(
        (
          database
            .prepare(
              `
                SELECT claim_id AS claimId
                FROM publication_v2_qualified_core_claims
                WHERE entity_id = ?
              `,
            )
            .all(entityId) as Array<{ claimId: string }>
        ).map((row) => row.claimId),
      );
      for (const claimId of [
        "claim-primary-a",
        "claim-primary-b",
        "claim-secondary-a",
        "claim-secondary-mirror",
        "claim-retailer-a",
        "claim-community-a",
        "claim-search-a",
      ]) {
        assertCondition(
          qualifiedCoreClaims.has(claimId),
          `${claimId} had a complete chain but did not enter the qualified core-claim view.`,
        );
      }
      for (const claimId of [
        "claim-default-provenance",
        "claim-missing-allowed-use",
        "claim-missing-citation",
        "claim-missing-locator",
        "claim-missing-scope",
        "claim-partial-stitch",
      ]) {
        assertCondition(
          !qualifiedCoreClaims.has(claimId),
          `${claimId} bypassed a missing evidence-chain component.`,
        );
      }

      database
        .prepare(
          `
            INSERT INTO claims (
              id, subject_entity_id, predicate, object_text,
              review_status, fact_class
            ) VALUES (?, ?, 'editorial_fixture', 'editorial', 'approved', 'editorial')
          `,
        )
        .run("claim-editorial", entityId);
      database
        .prepare(
          `
            INSERT INTO claims (
              id, subject_entity_id, predicate, object_text, review_status
            ) VALUES (?, ?, 'unclassified_fixture', 'unclassified', 'approved')
          `,
        )
        .run("claim-unclassified", entityId);
      const classificationBlockers = database
        .prepare(
          `
            SELECT blocker_code AS blockerCode, subject_id AS subjectId
            FROM publication_blockers
            WHERE entity_id = ?
              AND subject_id IN ('claim-editorial', 'claim-unclassified')
            ORDER BY blocker_code, subject_id
          `,
        )
        .all(entityId) as Array<{ blockerCode: string; subjectId: string }>;
      assertCondition(
        classificationBlockers.some(
          (row) =>
            row.blockerCode === "approved_claim_unclassified" &&
            row.subjectId === "claim-unclassified",
        ),
        "An approved unclassified claim did not fail closed.",
      );
      assertCondition(
        classificationBlockers.every((row) => row.subjectId !== "claim-editorial"),
        "An explicit editorial claim was incorrectly treated as core-fact completeness.",
      );

      database
        .prepare(
          `
            INSERT INTO model_specs (
              id, entity_id, nib, review_status
            ) VALUES ('spec-fixture', ?, '14k fine', 'approved')
          `,
        )
        .run(entityId);
      database
        .prepare(
          `
            INSERT INTO citations (
              id, target_type, target_id, source_item_id,
              review_status, evidence_locator, scope_id
            ) VALUES (
              'citation-spec-fixture', 'model_spec', 'spec-fixture',
              'item-primary-a', 'approved', 'table:nib', 'scope-core'
            )
          `,
        )
        .run();
      database
        .prepare(
          `
            INSERT INTO spec_field_evidence (
              id, model_spec_id, field_key, citation_id, scope_id,
              evidence_locator, review_status
            ) VALUES (
              'field-evidence-nib', 'spec-fixture', 'nib',
              'citation-spec-fixture', 'scope-core', 'row:nib', 'approved'
            )
          `,
        )
        .run();
      const qualifiedField = database
        .prepare(
          `
            SELECT 1
            FROM publication_v2_field_evidence
            WHERE model_spec_id = 'spec-fixture' AND field_key = 'nib'
          `,
        )
        .get();
      assertCondition(
        qualifiedField,
        "A complete field-level citation/locator/scope/provenance chain did not qualify.",
      );

      expectSqliteReject(
        () =>
          database
            .prepare(
              `
                INSERT INTO spec_field_evidence (
                  id, model_spec_id, field_key, citation_id, scope_id,
                  evidence_locator, review_status
                ) VALUES (
                  'invalid-field-key', 'spec-fixture', 'not-controlled',
                  'citation-spec-fixture', 'scope-core', 'row', 'approved'
                )
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
                INSERT INTO fact_scopes (
                  id, entity_id, scope_key, valid_from, valid_to
                ) VALUES ('invalid-dates', ?, 'invalid-dates', '2026', '2020')
              `,
            )
            .run(entityId),
        "CHECK constraint failed",
      );
      expectSqliteReject(
        () =>
          database
            .prepare(
              `
                INSERT INTO claim_evidence (
                  id, claim_id, citation_id, scope_id,
                  evidence_locator, review_status
                ) VALUES (
                  'invalid-foreign-keys', 'missing-claim', 'missing-citation',
                  'missing-scope', 'valid locator', 'approved'
                )
              `,
            )
            .run(),
        "FOREIGN KEY constraint failed",
      );
      expectSqliteReject(
        () =>
          database
            .prepare(
              `
                INSERT INTO fact_conflicts (
                  id, entity_id, field_key, conflict_kind, status
                ) VALUES ('invalid-resolution', ?, 'identity', 'identity', 'resolved')
              `,
            )
            .run(entityId),
        "CHECK constraint failed",
      );
      database
        .prepare(
          `
            INSERT INTO fact_conflicts (
              id, entity_id, field_key, conflict_kind, status
            ) VALUES ('null-scope-conflict-a', ?, 'identity', 'identity', 'open')
          `,
        )
        .run(entityId);
      expectSqliteReject(
        () =>
          database
            .prepare(
              `
                INSERT INTO fact_conflicts (
                  id, entity_id, field_key, conflict_kind, status
                ) VALUES (
                  'null-scope-conflict-b', ?, 'identity', 'identity', 'open'
                )
              `,
            )
            .run(entityId),
        "UNIQUE constraint failed",
      );

      const contentHash = `sha256:v3:${"c".repeat(64)}`;
      database
        .prepare(
          `
            UPDATE entity_publications
            SET approved_content_hash = ?,
                reviewed_content_revision = content_revision,
                reviewed_contract_version = 3,
                reviewed_by = 'schema-reviewer',
                reviewed_at = '2026-07-16T00:00:00.000Z'
            WHERE entity_id = ?
          `,
        )
        .run(contentHash, entityId);
      const revisionBeforeReviews = Number(
        (
          database
            .prepare(
              `
                SELECT content_revision AS revision
                FROM entity_publications WHERE entity_id = ?
              `,
            )
            .get(entityId) as { revision: number }
        ).revision,
      );
      const insertReview = database.prepare(
        `
          INSERT INTO entity_content_reviews (
            id, entity_id, review_kind, content_hash, status,
            reviewer, reviewed_at
          ) VALUES (?, ?, ?, ?, 'approved', 'schema-reviewer',
                    '2026-07-16T00:00:00.000Z')
        `,
      );
      for (const reviewKind of ["fact", "language", "media", "publication"]) {
        insertReview.run(
          `review-${reviewKind}`,
          entityId,
          reviewKind,
          contentHash,
        );
      }
      const revisionAfterReviews = Number(
        (
          database
            .prepare(
              `
                SELECT content_revision AS revision
                FROM entity_publications WHERE entity_id = ?
              `,
            )
            .get(entityId) as { revision: number }
        ).revision,
      );
      assertCondition(
        revisionAfterReviews === revisionBeforeReviews,
        "Hash-bound review rows entered the payload/revision loop.",
      );
      const currentReviewKinds = (
        database
          .prepare(
            `
              SELECT review_kind AS reviewKind
              FROM publication_v2_current_reviews
              WHERE entity_id = ?
              ORDER BY review_kind
            `,
          )
          .all(entityId) as Array<{ reviewKind: string }>
      ).map((row) => row.reviewKind);
      assertCondition(
        JSON.stringify(currentReviewKinds) ===
          JSON.stringify(["fact", "language", "media", "publication"]),
        "Four independent current-hash review kinds were not all represented.",
      );
      expectSqliteReject(
        () =>
          insertReview.run(
            "duplicate-fact-review",
            entityId,
            "fact",
            contentHash,
          ),
        "UNIQUE constraint failed",
      );
      expectSqliteReject(
        () =>
          database
            .prepare(
              `
                INSERT INTO entity_content_reviews (
                  id, entity_id, review_kind, content_hash, status
                ) VALUES (?, ?, 'fact', ?, 'approved')
              `,
            )
            .run(
              "approved-review-without-reviewer",
              entityId,
              `sha256:v3:${"d".repeat(64)}`,
            ),
        "CHECK constraint failed",
      );
      const incompleteCoreReadiness = database
        .prepare(
          `
            SELECT publishable, blocker_count AS blockerCount
            FROM public_entity_readiness
            WHERE entity_id = ? AND contract_version = 3
          `,
        )
        .get(entityId) as
        | { publishable: number; blockerCount: number }
        | undefined;
      assertCondition(
        Number(incompleteCoreReadiness?.publishable) === 0 &&
          Number(incompleteCoreReadiness?.blockerCount) > 0,
        "Approved core claims with incomplete evidence did not fail readiness.",
      );
      assertNotPublic(
        database,
        entityId,
        "Approved core claims with incomplete evidence entered public_entities.",
      );

      const blockedEntityId = "phase19-direct-sql-blocked";
      seedSchemaEntity(database, blockedEntityId);
      setContract2ReviewSnapshot(database, blockedEntityId, 100);
      database
        .prepare(
          `
            UPDATE entity_publications
            SET blockers_json = '[]', quality_score = 100
            WHERE entity_id = ?
          `,
        )
        .run(blockedEntityId);
      expectSqliteReject(
        () =>
          database
            .prepare(
              "UPDATE entity_publications SET status = 'published' WHERE entity_id = ?",
            )
            .run(blockedEntityId),
        "publication_guard: readiness blockers remain",
      );
      assertNotPublic(
        database,
        blockedEntityId,
        "Forged score/blockers_json exposed a zero-evidence entity.",
      );
      expectSqliteReject(
        () =>
          database
            .prepare(
              `
                UPDATE entity_publications
                SET approved_content_hash = ?
                WHERE entity_id = ?
              `,
            )
            .run(V1_HASH, blockedEntityId),
        "CHECK constraint failed",
      );

      database
        .prepare(
          `
            INSERT INTO entities (id, type, slug, name, summary)
            VALUES (
              'phase19-direct-insert-concept', 'concept',
              'phase19-direct-insert-concept', 'Direct insert concept',
              'Direct insert guard fixture'
            )
          `,
        )
        .run();
      expectSqliteReject(
        () =>
          database
            .prepare(
              `
                INSERT INTO entity_publications (
                  entity_id, status, blockers_json, approved_content_hash,
                  content_revision, reviewed_content_revision,
                  reviewed_contract_version, reviewed_by, reviewed_at,
                  published_at
                ) VALUES (
                  'phase19-direct-insert-concept', 'published', '[]', ?,
                  0, 0, 3, 'direct-reviewer',
                  '2026-07-16T00:00:00.000Z',
                  '2026-07-16T00:00:01.000Z'
                )
              `,
            )
            .run(contract2Hash(101)),
        "publication_guard: published insert requires an existing review row",
      );

      const proprietaryMediaEntity = "phase19-proprietary-media";
      seedSchemaEntity(database, proprietaryMediaEntity);
      for (const [id, license] of [
        ["proprietary-media-a", "proprietary"],
        ["proprietary-media-b", "All rights reserved"],
      ]) {
        database
          .prepare(
            `
              INSERT INTO media_assets (
                id, entity_id, title, asset_type, image_url, license,
                review_status, usage_status
              ) VALUES (?, ?, ?, 'image', ?, ?, 'approved', 'primary')
            `,
          )
          .run(
            id,
            proprietaryMediaEntity,
            id,
            `https://images.invalid/${id}.jpg`,
            license,
          );
      }
      assertCondition(
        !database
          .prepare(
            `
              SELECT 1 FROM publication_v2_qualified_primary_media
              WHERE entity_id = ?
            `,
          )
          .get(proprietaryMediaEntity),
        "An unrecognized/proprietary media license qualified as reusable.",
      );
      assertCondition(
        database
          .prepare(
            `
              SELECT 1 FROM publication_blockers
              WHERE entity_id = ?
                AND blocker_code = 'missing_approved_primary_media'
            `,
          )
          .get(proprietaryMediaEntity),
        "Proprietary media did not retain missing_approved_primary_media.",
      );

      const auxiliaryEntityId = "phase19-auxiliary-only";
      seedSchemaEntity(database, auxiliaryEntityId);
      database
        .prepare(
          `
            INSERT INTO stories (
              id, entity_id, title, story_type, body_md, status
            ) VALUES (
              'story-phase19-auxiliary-only', ?, 'Auxiliary-only brand story',
              'brand_story', 'Auxiliary-only story body', 'published'
            )
          `,
        )
        .run(auxiliaryEntityId);
      seedScope(database, auxiliaryEntityId, "scope-auxiliary-only");
      for (const [claimId, itemId] of [
        ["aux-claim-retailer", "item-retailer-a"],
        ["aux-claim-community", "item-community-a"],
        ["aux-claim-search", "item-search-a"],
      ]) {
        seedCoreEvidence(database, {
          entityId: auxiliaryEntityId,
          claimId,
          itemId,
          scopeId: "scope-auxiliary-only",
        });
      }
      database
        .prepare(
          `
            INSERT INTO media_assets (
              id, entity_id, title, asset_type, image_url, license,
              review_status, usage_status
            ) VALUES (
              'auxiliary-primary-media', ?, 'Auxiliary primary image', 'image',
              'https://images.invalid/auxiliary.jpg', 'CC-BY-4.0',
              'approved', 'primary'
            )
          `,
        )
        .run(auxiliaryEntityId);
      setContract2ReviewSnapshot(database, auxiliaryEntityId, 150);
      const auxiliaryCounts = database
        .prepare(
          `
            SELECT
              primary_archive_group_count AS primaryCount,
              professional_secondary_group_count AS secondaryCount,
              auxiliary_group_count AS auxiliaryCount
            FROM publication_v2_source_group_counts
            WHERE entity_id = ?
          `,
        )
        .get(auxiliaryEntityId) as
        | {
          primaryCount: number;
          secondaryCount: number;
          auxiliaryCount: number;
        }
        | undefined;
      assertCondition(
        Number(auxiliaryCounts?.primaryCount) === 0 &&
          Number(auxiliaryCounts?.secondaryCount) === 0 &&
          Number(auxiliaryCounts?.auxiliaryCount) === 3,
        "Retailer/community/search sources incorrectly satisfied a required source tier.",
      );
      const auxiliaryBlockers = new Set(
        (
          database
            .prepare(
              `
                SELECT blocker_code AS blockerCode
                FROM publication_blockers
                WHERE entity_id = ?
              `,
            )
            .all(auxiliaryEntityId) as Array<{ blockerCode: string }>
        ).map((row) => row.blockerCode),
      );
      assertCondition(
        auxiliaryBlockers.has("missing_primary_or_archive_group") &&
          auxiliaryBlockers.has("missing_professional_secondary_group"),
        "Auxiliary-only evidence lacked both hard source-threshold blockers.",
      );
      expectSqliteReject(
        () =>
          database
            .prepare(
              "UPDATE entity_publications SET status = 'published' WHERE entity_id = ?",
            )
            .run(auxiliaryEntityId),
        "publication_guard: readiness blockers remain",
      );
      assertNotPublic(
        database,
        auxiliaryEntityId,
        "Auxiliary-only evidence entered public_entities.",
      );

      const readyEntityId = "phase19-contract-ready";
      seedSchemaEntity(database, readyEntityId);
      database
        .prepare(
          `
            INSERT INTO stories (
              id, entity_id, title, story_type, body_md, status
            ) VALUES (
              'story-phase19-contract-ready', ?, 'Ready brand story',
              'brand_story', 'Complete ready story body', 'published'
            )
          `,
        )
        .run(readyEntityId);
      seedScope(database, readyEntityId, "scope-ready");
      seedCoreEvidence(database, {
        entityId: readyEntityId,
        claimId: "ready-claim-primary",
        itemId: "item-primary-a",
        scopeId: "scope-ready",
      });
      seedCoreEvidence(database, {
        entityId: readyEntityId,
        claimId: "ready-claim-secondary",
        itemId: "item-secondary-a",
        scopeId: "scope-ready",
      });
      database
        .prepare(
          `
            INSERT INTO model_specs (
              id, entity_id, nib, review_status
            ) VALUES ('ready-spec', ?, '18k medium', 'approved')
          `,
        )
        .run(readyEntityId);
      for (const [suffix, itemId] of [
        ["primary", "item-primary-a"],
        ["secondary", "item-secondary-a"],
      ]) {
        database
          .prepare(
            `
              INSERT INTO citations (
                id, target_type, target_id, source_item_id,
                review_status, evidence_locator, scope_id
              ) VALUES (?, 'model_spec', 'ready-spec', ?, 'approved',
                        ?, 'scope-ready')
            `,
          )
          .run(
            `ready-spec-citation-${suffix}`,
            itemId,
            `table:nib:${suffix}`,
          );
        database
          .prepare(
            `
              INSERT INTO spec_field_evidence (
                id, model_spec_id, field_key, citation_id, scope_id,
                evidence_locator, review_status
              ) VALUES (?, 'ready-spec', 'nib', ?, 'scope-ready', ?, 'approved')
            `,
          )
          .run(
            `ready-field-evidence-${suffix}`,
            `ready-spec-citation-${suffix}`,
            `row:nib:${suffix}`,
          );
      }
      database
        .prepare(
          `
            INSERT INTO media_assets (
              id, entity_id, title, asset_type, image_url, license,
              review_status, usage_status
            ) VALUES (
              'ready-primary-media', ?, 'Ready primary image', 'image',
              'https://images.invalid/ready.jpg', 'CC-BY-4.0',
              'approved', 'primary'
            )
          `,
        )
        .run(readyEntityId);
      database
        .prepare(
          `
            INSERT INTO fact_conflicts (
              id, entity_id, field_key, scope_id, conflict_kind,
              status, resolution_note
            ) VALUES (
              'ready-resolved-conflict', ?, 'historical_note', 'scope-ready',
              'field', 'resolved', 'Resolved before publication'
            )
          `,
        )
        .run(readyEntityId);

      setContract2ReviewSnapshot(database, readyEntityId, 200);
      const readyReadiness = database
        .prepare(
          `
            SELECT contract_version AS contractVersion,
                   blocker_count AS blockerCount,
                   publishable
            FROM public_entity_readiness
            WHERE entity_id = ?
          `,
        )
        .get(readyEntityId) as
        | { contractVersion: number; blockerCount: number; publishable: number }
        | undefined;
      assertCondition(
        Number(readyReadiness?.contractVersion) === 3 &&
          Number(readyReadiness?.blockerCount) === 0 &&
          Number(readyReadiness?.publishable) === 1,
        `Complete contract-v2 entity was not ready: ${JSON.stringify(readyReadiness)}`,
      );
      publishReviewedEntity(database, readyEntityId);
      database
        .prepare(
          `
            UPDATE entity_publications
            SET blockers_json = '["forged_diagnostic_blocker"]'
            WHERE entity_id = ?
          `,
        )
        .run(readyEntityId);
      assertCondition(
        database
          .prepare("SELECT 1 FROM public_entities WHERE id = ?")
          .get(readyEntityId),
        "Diagnostic blockers_json incorrectly became an authorization predicate.",
      );

      let reviewSequence = 201;
      seedSourceItem(database, {
        id: "item-cross-owner-claim-source",
        sourceId: "registry-a",
        tier: "community",
        group: "cross-owner-claim-source",
      });
      seedSourceItem(database, {
        id: "item-cross-owner-evidence-source",
        sourceId: "registry-b",
        tier: "professional_secondary",
        group: "cross-owner-evidence-source",
      });
      database
        .prepare(
          `
            INSERT INTO claims (
              id, subject_text, predicate, object_text, source_item_id,
              review_status, fact_class
            ) VALUES (
              'cross-owner-claim', 'Cross-owner subject', 'cross_owner_fact',
              'Cross-owner value', 'item-cross-owner-claim-source',
              'pending', 'unclassified'
            )
          `,
        )
        .run();
      database
        .prepare(
          `
            INSERT INTO citations (
              id, target_type, target_id, source_item_id, claim_id,
              review_status, evidence_locator, scope_id
            ) VALUES (
              'cross-owner-attachment', 'entity', ?, 'item-primary-a',
              'cross-owner-claim', 'approved', 'attachment:cross-owner',
              'scope-ready'
            )
          `,
        )
        .run(readyEntityId);
      assertCondition(
        publicationState(database, readyEntityId).status === "in_review",
        "Cross-owner claim attachment did not invalidate its payload owner.",
      );
      assertCondition(
        database
          .prepare(
            `
              SELECT 1 FROM publication_blockers
              WHERE entity_id = ?
                AND blocker_code = 'pending_claim_present'
                AND subject_id = 'cross-owner-claim'
            `,
          )
          .get(readyEntityId),
        "Citation-owned pending claim lacked a blocker on its payload owner.",
      );
      setContract2ReviewSnapshot(database, readyEntityId, reviewSequence++);
      expectSqliteReject(
        () =>
          database
            .prepare(
              "UPDATE entity_publications SET status = 'published' WHERE entity_id = ?",
            )
            .run(readyEntityId),
        "publication_guard: readiness blockers remain",
      );
      database
        .prepare(
          `
            UPDATE claims
            SET review_status = 'approved', fact_class = 'core'
            WHERE id = 'cross-owner-claim'
          `,
        )
        .run();
      database
        .prepare(
          `
            INSERT INTO citations (
              id, target_type, target_id, source_item_id,
              review_status, evidence_locator, scope_id
            ) VALUES (
              'cross-owner-evidence-citation', 'claim', 'cross-owner-claim',
              'item-cross-owner-evidence-source', 'approved',
              'evidence:cross-owner',
              'scope-ready'
            )
          `,
        )
        .run();
      database
        .prepare(
          `
            INSERT INTO claim_evidence (
              id, claim_id, citation_id, scope_id,
              evidence_locator, review_status
            ) VALUES (
              'cross-owner-evidence', 'cross-owner-claim',
              'cross-owner-evidence-citation', 'scope-ready',
              'mapping:cross-owner', 'approved'
            )
          `,
        )
        .run();
      assertCondition(
        database
          .prepare(
            `
              SELECT 1 FROM publication_v2_qualified_core_claims
              WHERE entity_id = ? AND claim_id = 'cross-owner-claim'
            `,
          )
          .get(readyEntityId),
        "Citation-owned core claim did not qualify for its payload owner.",
      );
      setContract2ReviewSnapshot(database, readyEntityId, reviewSequence++);
      publishReviewedEntity(database, readyEntityId);
      assertPayloadInvalidation(
        database,
        readyEntityId,
        "citation-owned claim source update",
        () => {
          database
            .prepare(
              `
                UPDATE source_items
                SET archive_locator = 'snapshot:cross-owner:revised'
                WHERE id = 'item-cross-owner-claim-source'
              `,
            )
            .run();
        },
      );
      setContract2ReviewSnapshot(database, readyEntityId, reviewSequence++);
      publishReviewedEntity(database, readyEntityId);
      assertPayloadInvalidation(
        database,
        readyEntityId,
        "citation-owned evidence citation update",
        () => {
          database
            .prepare(
              `
                UPDATE citations
                SET evidence_locator = 'evidence:cross-owner:revised'
                WHERE id = 'cross-owner-evidence-citation'
              `,
            )
            .run();
        },
      );
      setContract2ReviewSnapshot(database, readyEntityId, reviewSequence++);
      publishReviewedEntity(database, readyEntityId);
      assertPayloadInvalidation(
        database,
        readyEntityId,
        "citation-owned evidence source update",
        () => {
          database
            .prepare(
              `
                UPDATE source_items
                SET archive_locator = 'snapshot:cross-owner-evidence:revised'
                WHERE id = 'item-cross-owner-evidence-source'
              `,
            )
            .run();
        },
      );
      setContract2ReviewSnapshot(database, readyEntityId, reviewSequence++);
      publishReviewedEntity(database, readyEntityId);

      assertPayloadInvalidation(
        database,
        readyEntityId,
        "fact scope update",
        () => {
          database
            .prepare(
              "UPDATE fact_scopes SET market = 'cn' WHERE id = 'scope-ready'",
            )
            .run();
        },
      );
      expectSqliteReject(
        () =>
          database
            .prepare(
              "UPDATE entity_publications SET status = 'published' WHERE entity_id = ?",
            )
            .run(readyEntityId),
        "publication_guard: stale reviewed revision",
      );
      setContract2ReviewSnapshot(database, readyEntityId, reviewSequence++);
      publishReviewedEntity(database, readyEntityId);

      assertPayloadInvalidation(
        database,
        readyEntityId,
        "claim classification update",
        () => {
          database
            .prepare(
              "UPDATE claims SET fact_class = 'editorial' WHERE id = 'ready-claim-primary'",
            )
            .run();
        },
      );
      setContract2ReviewSnapshot(database, readyEntityId, reviewSequence++);
      publishReviewedEntity(database, readyEntityId);

      assertPayloadInvalidation(
        database,
        readyEntityId,
        "claim evidence update",
        () => {
          database
            .prepare(
              `
                UPDATE claim_evidence
                SET evidence_locator = 'mapping:ready-primary:revised'
                WHERE id = 'evidence-ready-claim-primary'
              `,
            )
            .run();
        },
      );
      setContract2ReviewSnapshot(database, readyEntityId, reviewSequence++);
      publishReviewedEntity(database, readyEntityId);

      assertPayloadInvalidation(
        database,
        readyEntityId,
        "citation evidence update",
        () => {
          database
            .prepare(
              `
                UPDATE citations
                SET evidence_locator = 'locator:ready-primary:revised'
                WHERE id = 'citation-ready-claim-primary'
              `,
            )
            .run();
        },
      );
      setContract2ReviewSnapshot(database, readyEntityId, reviewSequence++);
      publishReviewedEntity(database, readyEntityId);

      assertPayloadInvalidation(
        database,
        readyEntityId,
        "source item provenance update",
        () => {
          database
            .prepare(
              `
                UPDATE source_items
                SET archive_locator = 'snapshot:phase19:revised'
                WHERE id = 'item-primary-a'
              `,
            )
            .run();
        },
      );
      setContract2ReviewSnapshot(database, readyEntityId, reviewSequence++);
      publishReviewedEntity(database, readyEntityId);

      assertPayloadInvalidation(
        database,
        readyEntityId,
        "spec field evidence update",
        () => {
          database
            .prepare(
              `
                UPDATE spec_field_evidence
                SET evidence_locator = 'row:nib:primary:revised'
                WHERE id = 'ready-field-evidence-primary'
              `,
            )
            .run();
        },
      );
      setContract2ReviewSnapshot(database, readyEntityId, reviewSequence++);
      publishReviewedEntity(database, readyEntityId);

      assertPayloadInvalidation(
        database,
        readyEntityId,
        "conflict member insert",
        () => {
          database
            .prepare(
              `
                INSERT INTO fact_conflict_members (
                  id, conflict_id, citation_id, asserted_value
                ) VALUES (
                  'ready-conflict-member', 'ready-resolved-conflict',
                  'citation-ready-claim-primary', 'historical assertion'
                )
              `,
            )
            .run();
        },
      );
      setContract2ReviewSnapshot(database, readyEntityId, reviewSequence++);
      publishReviewedEntity(database, readyEntityId);

      assertPayloadInvalidation(
        database,
        readyEntityId,
        "primary media update",
        () => {
          database
            .prepare(
              `
                UPDATE media_assets
                SET title = 'Ready primary image revised'
                WHERE id = 'ready-primary-media'
              `,
            )
            .run();
        },
      );
      setContract2ReviewSnapshot(database, readyEntityId, reviewSequence++);
      publishReviewedEntity(database, readyEntityId);

      assertPayloadInvalidation(
        database,
        readyEntityId,
        "unresolved identity conflict insert",
        () => {
          database
            .prepare(
              `
                INSERT INTO fact_conflicts (
                  id, entity_id, field_key, conflict_kind, status
                ) VALUES (
                  'ready-open-identity-conflict', ?, 'canonical_identity',
                  'identity', 'open'
                )
              `,
            )
            .run(readyEntityId);
        },
      );
      setContract2ReviewSnapshot(database, readyEntityId, reviewSequence++);
      const identityBlocker = database
        .prepare(
          `
            SELECT 1 FROM publication_blockers
            WHERE entity_id = ?
              AND blocker_code = 'unresolved_identity_conflict'
              AND subject_id = 'ready-open-identity-conflict'
          `,
        )
        .get(readyEntityId);
      assertCondition(identityBlocker, "Open identity conflict lacked a hard blocker.");
      expectSqliteReject(
        () =>
          database
            .prepare(
              "UPDATE entity_publications SET status = 'published' WHERE entity_id = ?",
            )
            .run(readyEntityId),
        "publication_guard: readiness blockers remain",
      );
      database
        .prepare(
          `
            UPDATE fact_conflicts
            SET status = 'resolved', resolution_note = 'Canonical identity resolved'
            WHERE id = 'ready-open-identity-conflict'
          `,
        )
        .run();
      setContract2ReviewSnapshot(database, readyEntityId, reviewSequence++);
      publishReviewedEntity(database, readyEntityId);

      const beforeReviewRevoke = publicationState(database, readyEntityId);
      database
        .prepare(
          `
            UPDATE entity_content_reviews
            SET status = 'revoked'
            WHERE entity_id = ?
              AND review_kind = 'fact'
              AND content_hash = ?
          `,
        )
        .run(readyEntityId, beforeReviewRevoke.approvedHash);
      const afterReviewRevoke = publicationState(database, readyEntityId);
      assertCondition(
        afterReviewRevoke.revision === beforeReviewRevoke.revision &&
          afterReviewRevoke.status === "in_review",
        "Revoking a current fact review did not demote without changing revision.",
      );
      assertNotPublic(
        database,
        readyEntityId,
        "Revoked current fact review remained public.",
      );
      assertCondition(
        database
          .prepare(
            `
              SELECT 1 FROM publication_blockers
              WHERE entity_id = ? AND blocker_code = 'missing_fact_review'
            `,
          )
          .get(readyEntityId),
        "Revoked current fact review lacked missing_fact_review.",
      );
      database
        .prepare(
          `
            UPDATE entity_content_reviews
            SET status = 'approved'
            WHERE entity_id = ?
              AND review_kind = 'fact'
              AND content_hash = ?
          `,
        )
        .run(readyEntityId, beforeReviewRevoke.approvedHash);
      publishReviewedEntity(database, readyEntityId);

      const beforeReviewDelete = publicationState(database, readyEntityId);
      database
        .prepare(
          `
            DELETE FROM entity_content_reviews
            WHERE entity_id = ?
              AND review_kind = 'language'
              AND content_hash = ?
          `,
        )
        .run(readyEntityId, beforeReviewDelete.approvedHash);
      const afterReviewDelete = publicationState(database, readyEntityId);
      assertCondition(
        afterReviewDelete.revision === beforeReviewDelete.revision &&
          afterReviewDelete.status === "in_review",
        "Deleting a current language review did not demote without changing revision.",
      );
      assertNotPublic(
        database,
        readyEntityId,
        "Deleted current language review remained public.",
      );
      assertCondition(
        database
          .prepare(
            `
              SELECT 1 FROM publication_blockers
              WHERE entity_id = ? AND blocker_code = 'missing_language_review'
            `,
          )
          .get(readyEntityId),
        "Deleted current language review lacked missing_language_review.",
      );
      database
        .prepare(
          `
            INSERT INTO entity_content_reviews (
              id, entity_id, review_kind, content_hash, status,
              reviewer, reviewed_at
            ) VALUES (
              'replacement-language-review', ?, 'language', ?, 'approved',
              'phase19-contract-reviewer', '2026-07-16T00:00:00.000Z'
            )
          `,
        )
        .run(readyEntityId, beforeReviewDelete.approvedHash);
      assertCondition(
        publicationState(database, readyEntityId).revision ===
          beforeReviewDelete.revision,
        "Replacing a hash-bound review changed content_revision.",
      );
      publishReviewedEntity(database, readyEntityId);
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

async function contentRevision(client: Client, entityId: string): Promise<number> {
  const result = await client.execute({
    sql: "SELECT content_revision FROM entity_publications WHERE entity_id = ?",
    args: [entityId],
  });
  const revision = Number(result.rows[0]?.content_revision);
  assertCondition(
    Number.isSafeInteger(revision),
    `Missing content revision for ${entityId}.`,
  );
  return revision;
}

async function assertCanonicalMutation(
  client: Client,
  entityId: string,
  label: string,
  sql: string,
  args: unknown[],
): Promise<void> {
  const beforeHash = await computePublicationContentHash(client, entityId);
  const beforeRevision = await contentRevision(client, entityId);
  const result = await client.execute({ sql, args });
  assertCondition(result.rowsAffected > 0, `${label} mutated no rows.`);
  const afterHash = await computePublicationContentHash(client, entityId);
  const afterRevision = await contentRevision(client, entityId);
  assertCondition(afterHash !== beforeHash, `${label} did not change the v2 hash.`);
  assertCondition(
    afterRevision > beforeRevision,
    `${label} did not advance content_revision.`,
  );
}

async function stageReviewSnapshot(
  client: Client,
  entityId: string,
  contentHash: string,
  reviewKinds: readonly string[],
): Promise<void> {
  await client.execute({
    sql: `
      UPDATE entity_publications
      SET status = 'in_review',
          approved_content_hash = ?,
          reviewed_content_revision = content_revision,
          reviewed_contract_version = 3,
          reviewed_by = 'phase19-contract-reviewer',
          reviewed_at = '2026-07-16T00:00:00.000Z',
          published_at = NULL,
          blockers_json = '[]'
      WHERE entity_id = ?
    `,
    args: [contentHash, entityId],
  });
  for (const reviewKind of reviewKinds) {
    await client.execute({
      sql: `
        INSERT INTO entity_content_reviews (
          id, entity_id, review_kind, content_hash, status,
          reviewer, reviewed_at, note
        ) VALUES (?, ?, ?, ?, 'approved', 'phase19-contract-reviewer',
                  '2026-07-16T00:00:00.000Z', 'fixed fixture review')
        ON CONFLICT(entity_id, review_kind, content_hash) DO UPDATE SET
          status = 'approved',
          reviewer = excluded.reviewer,
          reviewed_at = excluded.reviewed_at,
          note = excluded.note
      `,
      args: [
        `review-${entityId}-${reviewKind}`,
        entityId,
        reviewKind,
        contentHash,
      ],
    });
  }
}

async function contract2Blockers(
  client: Client,
  entityId: string,
): Promise<string[]> {
  const result = await client.execute({
    sql: `
      SELECT blocker_code
      FROM publication_blockers
      WHERE entity_id = ? AND contract_version = 3
      ORDER BY blocker_code, subject_type, subject_id, detail_key
    `,
    args: [entityId],
  });
  return result.rows.map((row) => String(row.blocker_code));
}

interface Contract2BlockerDetail {
  blockerCode: string;
  detailKey: string;
}

async function contract2BlockerDetails(
  client: Client,
  entityId: string,
): Promise<Contract2BlockerDetail[]> {
  const result = await client.execute({
    sql: `
      SELECT blocker_code, detail_key
      FROM publication_blockers
      WHERE entity_id = ? AND contract_version = 3
      ORDER BY blocker_code, subject_type, subject_id, detail_key
    `,
    args: [entityId],
  });
  return result.rows.map((row) => ({
    blockerCode: String(row.blocker_code),
    detailKey: String(row.detail_key),
  }));
}

function blockerDetail(blockerCode: string, detailKey: string): Contract2BlockerDetail {
  return { blockerCode, detailKey };
}

async function assertExactContract2Blockers(
  client: Client,
  entityId: string,
  expected: readonly Contract2BlockerDetail[],
  label: string,
): Promise<void> {
  const actual = await contract2BlockerDetails(client, entityId);
  assertCondition(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${label} blocker/detail mismatch. expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}.`,
  );
  const readiness = await client.execute({
    sql: `
      SELECT blocker_count, publishable
      FROM public_entity_readiness
      WHERE entity_id = ? AND contract_version = 3
    `,
    args: [entityId],
  });
  assertCondition(
    readiness.rows.length === 1 &&
      Number(readiness.rows[0]?.blocker_count) === expected.length &&
      Number(readiness.rows[0]?.publishable) === 0,
    `${label} readiness was not an exact ${expected.length}-blocker failure: ${JSON.stringify(readiness.rows)}.`,
  );
}

async function stageCompleteContract2Snapshot(
  client: Client,
  entityId: string,
): Promise<string> {
  const contentHash = await computePublicationContentHash(client, entityId);
  await stageReviewSnapshot(client, entityId, contentHash, [
    "fact",
    "language",
    "media",
    "publication",
  ]);
  return contentHash;
}

async function assertDirectSqlBlocked(
  client: Client,
  entityId: string,
  label: string,
): Promise<void> {
  await expectReject(
    () =>
      client.execute({
        sql: `
          UPDATE entity_publications
          SET status = 'published',
              published_at = '2026-07-16T00:00:03.000Z'
          WHERE entity_id = ?
        `,
        args: [entityId],
      }),
    "publication_guard: readiness blockers remain",
  );
  await assertNoPublicMembership(client, entityId, label);
}

async function assertPublicationApiBlocked(
  client: Client,
  entityId: string,
  label: string,
): Promise<void> {
  const before = await publicationLifecycleSnapshot(client, entityId);
  await expectReject(
    () =>
      publishEntity(client, {
        entityId,
        reviewer: "phase19-qa-publication-reviewer",
      }),
    "Publication readiness blocked",
  );
  assertCondition(
    (await publicationLifecycleSnapshot(client, entityId)) === before,
    `${label} left a lifecycle change after publication rollback.`,
  );
  await assertNoPublicMembership(client, entityId, label);
}

async function assertBlockedQaCase(
  client: Client,
  entityId: string,
  expected: readonly Contract2BlockerDetail[],
  label: string,
): Promise<void> {
  await stageCompleteContract2Snapshot(client, entityId);
  await assertExactContract2Blockers(client, entityId, expected, label);
  await assertDirectSqlBlocked(client, entityId, `${label} direct SQL`);
  await assertPublicationApiBlocked(client, entityId, `${label} API`);
}

async function seedQaPenFixture(
  client: Client,
  entityId: string,
): Promise<Awaited<ReturnType<typeof seedQualifiedPublicationFixture>>> {
  const brand = await seedQualifiedPublicationFixture(client, {
    entityId: `${entityId}-brand`,
    entityType: "brand",
  });
  await recordFirstThreeCurrentReviews(client, brand.entityId);
  await publishEntity(client, {
    entityId: brand.entityId,
    reviewer: "phase19-qa-brand-publication-reviewer",
  });
  return seedQualifiedPublicationFixture(client, {
    entityId,
    entityType: "pen",
    brandEntityId: brand.entityId,
  });
}

async function runApprovedClaimSingleVariableCases(): Promise<void> {
  for (const missingComponent of [
    "citation",
    "locator",
    "scope",
    "source_provenance",
  ] as const) {
    await withPhase19Fixture(async ({ client }) => {
      const entity = await seedQaPenFixture(
        client,
        `phase19-qa-claim-${missingComponent}`,
      );
      const nonqualifyingItemId = `${entity.entityId}-item-unqualified`;
      await client.execute({
        sql: `
          INSERT INTO source_items (
            id, source_id, title, url, retrieved_at, allowed_use,
            review_status, archive_url, archive_locator
          ) VALUES (?, ?, 'Unqualified provenance item', ?, '2026-07-16',
                    'summary_only', 'approved', ?, 'snapshot:unqualified')
        `,
        args: [
          nonqualifyingItemId,
          entity.primaryRegistryId,
          `https://example.invalid/items/${nonqualifyingItemId}`,
          `https://archive.invalid/items/${nonqualifyingItemId}`,
        ],
      });

      if (missingComponent === "citation") {
        await client.execute({
          sql: `
            UPDATE citations
            SET target_type = 'entity', target_id = ?
            WHERE id = ?
          `,
          args: [entity.entityId, entity.primaryCitationId],
        });
      } else if (missingComponent === "locator") {
        await client.execute({
          sql: "UPDATE citations SET evidence_locator = NULL WHERE id = ?",
          args: [entity.primaryCitationId],
        });
      } else if (missingComponent === "scope") {
        await client.execute({
          sql: "UPDATE citations SET scope_id = NULL WHERE id = ?",
          args: [entity.primaryCitationId],
        });
      } else {
        await client.execute({
          sql: "UPDATE citations SET source_item_id = ? WHERE id = ?",
          args: [nonqualifyingItemId, entity.primaryCitationId],
        });
      }

      const expectedDetail = `${entity.primaryClaimId}:${missingComponent}`;
      await assertBlockedQaCase(
        client,
        entity.entityId,
        [blockerDetail("approved_claim_missing_evidence", expectedDetail)],
        `approved core claim missing ${missingComponent}`,
      );
    });
    console.log(`PASS QA-01: approved core claim missing ${missingComponent}`);
  }
}

async function runRequiredNegativeCases(): Promise<void> {
  await withPhase19Fixture(async ({ client }) => {
    const entity = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-qa-deprecated-story",
      entityType: "brand",
    });
    const deprecatedStoryId = `${entity.entityId}-deprecated-story`;
    await client.execute({
      sql: `
        INSERT INTO stories (
          id, entity_id, title, story_type, body_md, status
        ) VALUES (?, ?, 'Deprecated trace only', 'overview',
                  'Deprecated trace body', 'deprecated')
      `,
      args: [deprecatedStoryId, entity.entityId],
    });
    await assertBlockedQaCase(
      client,
      entity.entityId,
      [blockerDetail("deprecated_story_present", deprecatedStoryId)],
      "deprecated story",
    );
  });
  console.log("PASS QA-01: deprecated story");

  await withPhase19Fixture(async ({ client }) => {
    const entity = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-qa-pending-claim",
      entityType: "brand",
    });
    await client.execute({
      sql: "UPDATE claims SET review_status = 'pending' WHERE id = ?",
      args: [entity.classificationClaimId],
    });
    await assertBlockedQaCase(
      client,
      entity.entityId,
      [blockerDetail("pending_claim_present", entity.classificationClaimId)],
      "pending claim",
    );
  });
  console.log("PASS QA-01: pending claim");

  await withPhase19Fixture(async ({ client }) => {
    const entity = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-qa-needs-source-spec",
      entityType: "brand",
    });
    const specId = `${entity.entityId}-needs-source-spec`;
    await client.execute({
      sql: `
        INSERT INTO model_specs (id, entity_id, review_status)
        VALUES (?, ?, 'needs_source')
      `,
      args: [specId, entity.entityId],
    });
    await assertBlockedQaCase(
      client,
      entity.entityId,
      [blockerDetail("spec_needs_source", specId)],
      "needs_source spec",
    );
  });
  console.log("PASS QA-01: needs_source spec");

  await withPhase19Fixture(async ({ client }) => {
    const entity = await seedQaPenFixture(
      client,
      "phase19-qa-missing-spec-field-evidence",
    );
    assertCondition(entity.modelSpecId, "Pen QA fixture omitted modelSpecId.");
    await client.execute({
      sql: "UPDATE model_specs SET fill_system = 'piston' WHERE id = ?",
      args: [entity.modelSpecId],
    });
    await assertBlockedQaCase(
      client,
      entity.entityId,
      [
        blockerDetail(
          "missing_field_evidence",
          `${entity.modelSpecId}:fill_system`,
        ),
      ],
      "nonempty spec field without field evidence",
    );
  });
  console.log("PASS QA-01: nonempty spec field without field evidence");

  await withPhase19Fixture(async ({ client }) => {
    const entity = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-qa-retailer-only",
      entityType: "brand",
    });
    await client.execute({
      sql: `
        UPDATE source_items
        SET source_tier = 'retailer'
        WHERE id IN (?, ?, ?)
      `,
      args: [entity.primaryItemId, entity.secondaryItemId, entity.mirrorItemId],
    });
    await assertBlockedQaCase(
      client,
      entity.entityId,
      [
        blockerDetail("missing_primary_or_archive_group", entity.entityId),
        blockerDetail(
          "missing_professional_secondary_group",
          entity.entityId,
        ),
      ],
      "retailer-only evidence",
    );
  });
  console.log("PASS QA-01: retailer-only evidence");

  for (const conflictKind of ["field", "identity", "made_by"] as const) {
    await withPhase19Fixture(async ({ client }) => {
      const entity = conflictKind === "made_by"
        ? await seedQaPenFixture(client, `phase19-qa-${conflictKind}-conflict`)
        : await seedQualifiedPublicationFixture(client, {
            entityId: `phase19-qa-${conflictKind}-conflict`,
            entityType: "brand",
          });
      await client.execute({
        sql: `
          UPDATE fact_conflicts
          SET field_key = ?, conflict_kind = ?, status = 'open',
              resolution_note = NULL
          WHERE id = ?
        `,
        args: [
          conflictKind === "field" ? "release_year" : conflictKind,
          conflictKind,
          entity.conflictId,
        ],
      });
      await assertBlockedQaCase(
        client,
        entity.entityId,
        [
          blockerDetail(
            conflictKind === "field"
              ? "unresolved_field_conflict"
              : "unresolved_identity_conflict",
            entity.conflictId,
          ),
        ],
        `unresolved ${conflictKind} conflict`,
      );
    });
    console.log(`PASS QA-01: unresolved ${conflictKind} conflict`);
  }
}

async function runStaleReviewCases(): Promise<void> {
  for (const reviewKind of [
    "fact",
    "language",
    "media",
    "publication",
  ] as const) {
    await withPhase19Fixture(async ({ client }) => {
      const entity = await seedQualifiedPublicationFixture(client, {
        entityId: `phase19-qa-stale-${reviewKind}-review`,
        entityType: "brand",
      });
      const currentHash = await stageCompleteContract2Snapshot(
        client,
        entity.entityId,
      );
      const staleHash = `sha256:v3:${"e".repeat(64)}`;
      assertCondition(
        staleHash !== currentHash,
        `${reviewKind} stale-review fixture accidentally matched current hash.`,
      );
      await client.execute({
        sql: `
          DELETE FROM entity_content_reviews
          WHERE entity_id = ? AND review_kind = ? AND content_hash = ?
        `,
        args: [entity.entityId, reviewKind, currentHash],
      });
      await client.execute({
        sql: `
          INSERT INTO entity_content_reviews (
            id, entity_id, review_kind, content_hash, status,
            reviewer, reviewed_at, note
          ) VALUES (?, ?, ?, ?, 'approved', 'stale-reviewer',
                    '2026-07-15T00:00:00.000Z', 'stale hash fixture')
        `,
        args: [
          `stale-review-${entity.entityId}-${reviewKind}`,
          entity.entityId,
          reviewKind,
          staleHash,
        ],
      });
      await assertExactContract2Blockers(
        client,
        entity.entityId,
        [blockerDetail(`missing_${reviewKind}_review`, reviewKind)],
        `stale ${reviewKind} review`,
      );
      await assertDirectSqlBlocked(
        client,
        entity.entityId,
        `stale ${reviewKind} review direct SQL`,
      );

      if (reviewKind === "publication") {
        const published = await publishEntity(client, {
          entityId: entity.entityId,
          reviewer: "phase19-current-publication-reviewer",
        });
        assertCondition(
          published.contentHash === currentHash &&
            (await currentPublicationReviewCount(
              client,
              entity.entityId,
              currentHash,
            )) === 1,
          "publishEntity did not replace the stale publication review on the current hash.",
        );
        const blockers = await contract2BlockerDetails(client, entity.entityId);
        assertCondition(
          blockers.length === 0,
          `Stale publication review refresh retained blockers: ${JSON.stringify(blockers)}.`,
        );
      } else {
        const before = await publicationLifecycleSnapshot(
          client,
          entity.entityId,
        );
        await expectReject(
          () =>
            publishEntity(client, {
              entityId: entity.entityId,
              reviewer: "phase19-publication-reviewer",
            }),
          `current-hash reviews missing for ${entity.entityId}: ${reviewKind}`,
        );
        assertCondition(
          (await publicationLifecycleSnapshot(client, entity.entityId)) ===
            before,
          `Stale ${reviewKind} review left an in_review snapshot or final review.`,
        );
        await assertNoPublicMembership(
          client,
          entity.entityId,
          `stale ${reviewKind} review API`,
        );
      }
    });
    console.log(`PASS QA-01: stale ${reviewKind} review`);
  }
}

async function runMirrorAndCompletePositiveCase(): Promise<void> {
  await withPhase19Fixture(async ({ client }) => {
    const brand = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-qa-complete-brand",
      entityType: "brand",
    });
    const sourceCounts = await client.execute({
      sql: `
        SELECT primary_archive_group_count, professional_secondary_group_count,
               auxiliary_group_count
        FROM publication_v2_source_group_counts
        WHERE entity_id = ?
      `,
      args: [brand.entityId],
    });
    const counts = sourceCounts.rows[0];
    assertCondition(
      Number(counts?.primary_archive_group_count) === 1 &&
        Number(counts?.professional_secondary_group_count) === 1 &&
        Number(counts?.auxiliary_group_count) === 0,
      `Mirror grouping changed source thresholds: ${JSON.stringify(counts)}.`,
    );
    const groups = await client.execute({
      sql: `
        SELECT count(DISTINCT independence_group) AS group_count
        FROM publication_v2_source_groups
        WHERE entity_id = ?
      `,
      args: [brand.entityId],
    });
    assertCondition(
      Number(groups.rows[0]?.group_count) === 2,
      "Primary item, same-origin mirror, and independent secondary did not collapse to two independence groups.",
    );
    await recordFirstThreeCurrentReviews(client, brand.entityId);
    await publishEntity(client, {
      entityId: brand.entityId,
      reviewer: "phase19-complete-brand-reviewer",
    });

    const pen = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-qa-complete-pen",
      entityType: "pen",
      brandEntityId: brand.entityId,
    });
    await recordFirstThreeCurrentReviews(client, pen.entityId);
    await publishEntity(client, {
      entityId: pen.entityId,
      reviewer: "phase19-complete-pen-reviewer",
    });
    for (const entityId of [brand.entityId, pen.entityId]) {
      const blockers = await contract2BlockerDetails(client, entityId);
      assertCondition(
        blockers.length === 0,
        `${entityId} retained blockers after complete publication: ${JSON.stringify(blockers)}.`,
      );
      const publicRow = await client.execute({
        sql: "SELECT id FROM public_entities WHERE id = ?",
        args: [entityId],
      });
      assertCondition(
        publicRow.rows.length === 1,
        `${entityId} did not enter public_entities after complete qualification.`,
      );
    }
    const reverseModels = await client.execute({
      sql: `
        SELECT pen.id
        FROM public_entities pen
        JOIN entity_links link
          ON link.source_id = pen.id AND link.link_type = 'made_by'
        WHERE pen.type = 'pen' AND link.target_id = ?
        ORDER BY pen.id
      `,
      args: [brand.entityId],
    });
    assertCondition(
      JSON.stringify(reverseModels.rows.map((row) => String(row.id))) ===
        JSON.stringify([pen.entityId]),
      `Complete brand reverse public model set mismatch: ${JSON.stringify(reverseModels.rows)}.`,
    );
  });
  console.log(
    "PASS QA-01: mirror group deduplication and complete brand+pen atomic publication",
  );
}

async function runQa01CompleteMatrix(): Promise<void> {
  await runApprovedClaimSingleVariableCases();
  await runRequiredNegativeCases();
  await runStaleReviewCases();
  await runMirrorAndCompletePositiveCase();
  console.log(
    "QA-01 complete matrix passed: independent evidence-component, status, conflict, review, source-group, and complete brand+pen cases are exact and fail closed.",
  );
}

async function assertNoPublicMembership(
  client: Client,
  entityId: string,
  label: string,
): Promise<void> {
  const result = await client.execute({
    sql: "SELECT 1 FROM public_entities WHERE id = ?",
    args: [entityId],
  });
  assertCondition(result.rows.length === 0, `${label} remained public.`);
}

async function runHashInvalidationContract(): Promise<void> {
  let canonicalHash: string | null = null;
  for (const [canonicalTextVariant, reverseIndependentRows] of [
    ["nfc-lf", false],
    ["nfd-crlf", true],
  ] as const) {
    await withPhase19Fixture(async ({ client }) => {
      const entityId = "phase19-canonical-equivalence";
      await seedQualifiedPublicationFixture(client, {
        entityId,
        entityType: "brand",
        canonicalTextVariant,
        reverseIndependentRows,
      });
      const contentHash = await computePublicationContentHash(client, entityId);
      assertCondition(
        /^sha256:v3:[0-9a-f]{64}$/.test(contentHash),
        `Canonical publication hash must use contract v3, received ${contentHash}.`,
      );
      if (canonicalHash === null) canonicalHash = contentHash;
      else {
        assertCondition(
          contentHash === canonicalHash,
          "Row order, JSON key order, Unicode normalization, or newline form changed the canonical hash.",
        );
      }
      const payload = (await readPublicationContentPayload(
        client,
        entityId,
      )) as unknown as Record<string, unknown>;
      for (const key of [
        "factScopes",
        "claimEvidence",
        "factConflicts",
        "factConflictMembers",
        "sourceItems",
        "primaryMedia",
      ]) {
        assertCondition(key in payload, `Canonical payload omitted ${key}.`);
      }
      assertCondition(
        !("entityContentReviews" in payload),
        "Canonical payload must exclude hash-bound review rows.",
      );
    });
  }

  await withPhase19Fixture(async ({ client }) => {
    const brand = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-hash-brand",
      entityType: "brand",
    });
    const pen = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-hash-pen",
      entityType: "pen",
      brandEntityId: brand.entityId,
    });
    const brandMutations = [
      [
        "claim fact classification",
        "UPDATE claims SET fact_class = 'core' WHERE id = ?",
        [brand.classificationClaimId],
      ],
      [
        "claim review semantics",
        "UPDATE claims SET review_status = 'rejected' WHERE id = ?",
        [brand.primaryClaimId],
      ],
      [
        "citation locator",
        "UPDATE citations SET evidence_locator = evidence_locator || ':updated' WHERE id = ?",
        [brand.primaryCitationId],
      ],
      [
        "citation scope",
        "UPDATE citations SET scope_id = NULL WHERE id = ?",
        [brand.primaryCitationId],
      ],
      [
        "citation review semantics",
        "UPDATE citations SET review_status = 'needs_review' WHERE id = ?",
        [brand.secondaryCitationId],
      ],
      [
        "claim evidence locator",
        "UPDATE claim_evidence SET evidence_locator = evidence_locator || ':updated' WHERE id = ?",
        [brand.primaryClaimEvidenceId],
      ],
      [
        "claim evidence review semantics",
        "UPDATE claim_evidence SET review_status = 'needs_review' WHERE id = ?",
        [brand.secondaryClaimEvidenceId],
      ],
      [
        "fact scope",
        "UPDATE fact_scopes SET market = 'eu' WHERE id = ?",
        [brand.scopeId],
      ],
      [
        "source tier",
        "UPDATE source_items SET source_tier = 'contemporary_archive' WHERE id = ?",
        [brand.primaryItemId],
      ],
      [
        "source independence group",
        "UPDATE source_items SET independence_group = independence_group || '-updated' WHERE id = ?",
        [brand.primaryItemId],
      ],
      [
        "source archive URL",
        "UPDATE source_items SET archive_url = archive_url || '?v=2' WHERE id = ?",
        [brand.primaryItemId],
      ],
      [
        "source archive locator",
        "UPDATE source_items SET archive_locator = archive_locator || ':v2' WHERE id = ?",
        [brand.primaryItemId],
      ],
      [
        "source allowed use",
        "UPDATE source_items SET allowed_use = 'metadata_only' WHERE id = ?",
        [brand.primaryItemId],
      ],
      [
        "source retrieval time",
        "UPDATE source_items SET retrieved_at = '2026-07-17' WHERE id = ?",
        [brand.primaryItemId],
      ],
      [
        "source review semantics",
        "UPDATE source_items SET review_status = 'needs_review' WHERE id = ?",
        [brand.mirrorItemId],
      ],
      [
        "source metadata canonicalization",
        "UPDATE source_items SET raw_metadata_json = '{\"a\":1,\"b\":3}' WHERE id = ?",
        [brand.secondaryItemId],
      ],
      [
        "registry provenance defaults",
        "UPDATE source_registry SET default_source_tier = 'contemporary_archive', default_independence_group = default_independence_group || '-updated' WHERE id = ?",
        [brand.primaryRegistryId],
      ],
      [
        "resolved conflict payload",
        "UPDATE fact_conflicts SET resolution_note = resolution_note || ':updated' WHERE id = ?",
        [brand.conflictId],
      ],
      [
        "conflict member payload",
        "UPDATE fact_conflict_members SET asserted_value = '2027' WHERE id = ?",
        [brand.conflictMemberId],
      ],
      [
        "primary media payload",
        "UPDATE media_assets SET title = title || ':updated', license = 'cc-by-4.0' WHERE id = ?",
        [brand.mediaId],
      ],
    ] as const;
    for (const [label, sql, args] of brandMutations) {
      await assertCanonicalMutation(client, brand.entityId, label, sql, [...args]);
    }

    assertCondition(
      pen.modelSpecId !== null &&
        pen.primarySpecEvidenceId !== null &&
        pen.secondarySpecEvidenceId !== null,
      "Pen fixture omitted required spec evidence identifiers.",
    );
    for (const [label, sql, args] of [
      [
        "model spec review semantics",
        "UPDATE model_specs SET review_status = 'rejected' WHERE id = ?",
        [pen.modelSpecId],
      ],
      [
        "spec evidence locator",
        "UPDATE spec_field_evidence SET evidence_locator = evidence_locator || ':updated' WHERE id = ?",
        [pen.primarySpecEvidenceId],
      ],
      [
        "spec evidence review semantics",
        "UPDATE spec_field_evidence SET review_status = 'needs_review' WHERE id = ?",
        [pen.secondarySpecEvidenceId],
      ],
    ] as const) {
      await assertCanonicalMutation(client, pen.entityId, label, sql, [...args]);
    }
  });

  await withPhase19Fixture(async ({ client }) => {
    const entity = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-review-exclusion",
      entityType: "brand",
    });
    const contentHash = await computePublicationContentHash(
      client,
      entity.entityId,
    );
    const revision = await contentRevision(client, entity.entityId);
    await stageReviewSnapshot(client, entity.entityId, contentHash, [
      "fact",
      "language",
      "media",
    ]);
    let blockers = await contract2Blockers(client, entity.entityId);
    assertCondition(
      blockers.includes("missing_publication_review") &&
        !blockers.includes("missing_fact_review") &&
        !blockers.includes("missing_language_review") &&
        !blockers.includes("missing_media_review"),
      `Review insert readiness mismatch: ${JSON.stringify(blockers)}.`,
    );
    await stageReviewSnapshot(client, entity.entityId, contentHash, [
      "publication",
    ]);
    blockers = await contract2Blockers(client, entity.entityId);
    assertCondition(
      blockers.length === 0,
      `Fully reviewed fixture retained blockers: ${JSON.stringify(blockers)}.`,
    );
    assertCondition(
      (await computePublicationContentHash(client, entity.entityId)) ===
        contentHash &&
        (await contentRevision(client, entity.entityId)) === revision,
      "Review insertion changed content hash or content_revision.",
    );
    await client.execute({
      sql: `
        UPDATE entity_publications
        SET status = 'published', published_at = '2026-07-16T00:00:01.000Z'
        WHERE entity_id = ?
      `,
      args: [entity.entityId],
    });
    await client.execute({
      sql: `
        UPDATE entity_content_reviews
        SET status = 'revoked'
        WHERE entity_id = ? AND review_kind = 'language' AND content_hash = ?
      `,
      args: [entity.entityId, contentHash],
    });
    blockers = await contract2Blockers(client, entity.entityId);
    assertCondition(
      blockers.includes("missing_language_review"),
      "Revoking a current-hash language review did not change readiness.",
    );
    await assertNoPublicMembership(
      client,
      entity.entityId,
      "Revoked review fixture",
    );
    assertCondition(
      (await computePublicationContentHash(client, entity.entityId)) ===
        contentHash &&
        (await contentRevision(client, entity.entityId)) === revision,
      "Review update changed content hash or content_revision.",
    );
    await client.execute({
      sql: `
        UPDATE entity_content_reviews
        SET status = 'approved'
        WHERE entity_id = ? AND review_kind = 'language' AND content_hash = ?
      `,
      args: [entity.entityId, contentHash],
    });
    await client.execute({
      sql: `
        UPDATE entity_publications
        SET status = 'published', published_at = '2026-07-16T00:00:02.000Z'
        WHERE entity_id = ?
      `,
      args: [entity.entityId],
    });
    await client.execute({
      sql: `
        DELETE FROM entity_content_reviews
        WHERE entity_id = ? AND review_kind = 'media' AND content_hash = ?
      `,
      args: [entity.entityId, contentHash],
    });
    blockers = await contract2Blockers(client, entity.entityId);
    assertCondition(
      blockers.includes("missing_media_review"),
      "Deleting a current-hash media review did not change readiness.",
    );
    await assertNoPublicMembership(
      client,
      entity.entityId,
      "Deleted review fixture",
    );
    assertCondition(
      (await computePublicationContentHash(client, entity.entityId)) ===
        contentHash &&
        (await contentRevision(client, entity.entityId)) === revision,
      "Review delete changed content hash or content_revision.",
    );
  });

  for (const missingComponent of [
    "citation",
    "locator",
    "scope",
    "provenance",
  ] as const) {
    await withPhase19Fixture(async ({ client }) => {
      const entity = await seedQualifiedPublicationFixture(client, {
        entityId: `phase19-missing-${missingComponent}`,
        entityType: "brand",
      });
      if (missingComponent === "citation") {
        await client.execute({
          sql: "DELETE FROM citations WHERE id = ?",
          args: [entity.primaryCitationId],
        });
      } else if (missingComponent === "locator") {
        await client.execute({
          sql: "UPDATE citations SET evidence_locator = NULL WHERE id = ?",
          args: [entity.primaryCitationId],
        });
      } else if (missingComponent === "scope") {
        await client.execute({
          sql: "UPDATE citations SET scope_id = NULL WHERE id = ?",
          args: [entity.primaryCitationId],
        });
      } else {
        await client.execute({
          sql: "UPDATE source_items SET source_tier = NULL WHERE id = ?",
          args: [entity.primaryItemId],
        });
      }
      const contentHash = await computePublicationContentHash(
        client,
        entity.entityId,
      );
      await stageReviewSnapshot(client, entity.entityId, contentHash, [
        "fact",
        "language",
        "media",
        "publication",
      ]);
      const blockers = await contract2Blockers(client, entity.entityId);
      assertCondition(
        blockers.includes("approved_claim_missing_evidence"),
        `${missingComponent} removal did not produce exact approved_claim_missing_evidence: ${JSON.stringify(blockers)}.`,
      );
      let directSqlRejected = false;
      try {
        await client.execute({
          sql: `
            UPDATE entity_publications
            SET status = 'published',
                published_at = '2026-07-16T00:00:03.000Z'
            WHERE entity_id = ?
          `,
          args: [entity.entityId],
        });
      } catch {
        directSqlRejected = true;
      }
      assertCondition(
        directSqlRejected,
        `${missingComponent} evidence gap bypassed the direct-SQL guard.`,
      );
      await assertNoPublicMembership(
        client,
        entity.entityId,
        `${missingComponent} evidence gap`,
      );
    });
  }
  console.log(
    "Evidence hash/invalidation contract passed: deterministic v2 payload, normalized evidence/provenance/conflicts/media, review exclusion, and exact incomplete-core-claim blockers are green.",
  );
}

async function publicationLifecycleSnapshot(
  client: Client,
  entityId: string,
): Promise<string> {
  const result = await client.execute({
    sql: `
      SELECT entity_id, status, depth_tier, quality_score, blockers_json,
             approved_content_hash, content_revision,
             reviewed_content_revision, reviewed_contract_version,
             reviewed_by, reviewed_at, published_at, review_notes,
             created_at, updated_at
      FROM entity_publications
      WHERE entity_id = ?
    `,
    args: [entityId],
  });
  return JSON.stringify(result.rows[0] ?? null);
}

async function recordFirstThreeCurrentReviews(
  client: Client,
  entityId: string,
  excludedKind?: "fact" | "language" | "media",
): Promise<string> {
  let contentHash: string | null = null;
  for (const reviewKind of ["fact", "language", "media"] as const) {
    if (reviewKind === excludedKind) continue;
    const review = await recordEntityContentReview(client, {
      entityId,
      reviewKind,
      reviewer: `phase19-${reviewKind}-reviewer`,
      status: "approved",
      notes: "Fixed readiness/publish fixture review.",
    });
    contentHash ??= review.contentHash;
    assertCondition(
      review.contentHash === contentHash,
      `${entityId} changed while recording current-hash reviews.`,
    );
  }
  return contentHash ?? computePublicationContentHash(client, entityId);
}

async function currentPublicationReviewCount(
  client: Client,
  entityId: string,
  contentHash: string,
): Promise<number> {
  const result = await client.execute({
    sql: `
      SELECT count(*) AS review_count
      FROM entity_content_reviews
      WHERE entity_id = ? AND review_kind = 'publication'
        AND content_hash = ? AND status = 'approved'
    `,
    args: [entityId, contentHash],
  });
  return Number(result.rows[0]?.review_count ?? 0);
}

async function runReadinessPublishContract(): Promise<void> {
  await withPhase19Fixture(async ({ client }) => {
    const entity = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-publication-review-api",
      entityType: "brand",
    });
    await expectReject(
      () =>
        recordEntityContentReview(client, {
          entityId: entity.entityId,
          reviewKind: "publication" as "fact",
          reviewer: "forbidden-caller",
          status: "approved",
        }),
      "only accepts fact, language, or media",
    );
  });

  for (const missingReview of ["fact", "language", "media"] as const) {
    await withPhase19Fixture(async ({ client }) => {
      const entity = await seedQualifiedPublicationFixture(client, {
        entityId: `phase19-missing-${missingReview}-review`,
        entityType: "brand",
      });
      const contentHash = await recordFirstThreeCurrentReviews(
        client,
        entity.entityId,
        missingReview,
      );
      const before = await publicationLifecycleSnapshot(client, entity.entityId);
      await expectReject(
        () =>
          publishEntity(client, {
            entityId: entity.entityId,
            reviewer: "phase19-publication-reviewer",
          }),
        `current-hash reviews missing for ${entity.entityId}: ${missingReview}`,
      );
      const after = await publicationLifecycleSnapshot(client, entity.entityId);
      assertCondition(
        after === before,
        `Missing ${missingReview} review left a lifecycle snapshot after rollback.`,
      );
      assertCondition(
        (await currentPublicationReviewCount(
          client,
          entity.entityId,
          contentHash,
        )) === 0,
        `Missing ${missingReview} review left a publication review.`,
      );
      await assertNoPublicMembership(
        client,
        entity.entityId,
        `Missing ${missingReview} review fixture`,
      );
    });
  }

  for (const blockerCase of [
    "evidence",
    "source",
    "scope",
    "conflict",
  ] as const) {
    await withPhase19Fixture(async ({ client }) => {
      const entity = await seedQualifiedPublicationFixture(client, {
        entityId: `phase19-publish-blocker-${blockerCase}`,
        entityType: "brand",
      });
      if (blockerCase === "evidence") {
        await client.execute({
          sql: "DELETE FROM citations WHERE id = ?",
          args: [entity.primaryCitationId],
        });
      } else if (blockerCase === "source") {
        await client.execute({
          sql: "UPDATE source_items SET archive_locator = NULL WHERE id = ?",
          args: [entity.primaryItemId],
        });
      } else if (blockerCase === "scope") {
        await client.execute({
          sql: "UPDATE citations SET scope_id = NULL WHERE id = ?",
          args: [entity.primaryCitationId],
        });
      } else {
        await client.execute({
          sql: "UPDATE fact_conflicts SET status = 'open', resolution_note = NULL WHERE id = ?",
          args: [entity.conflictId],
        });
      }
      const contentHash = await recordFirstThreeCurrentReviews(
        client,
        entity.entityId,
      );
      const before = await publicationLifecycleSnapshot(client, entity.entityId);
      await expectReject(
        () =>
          publishEntity(client, {
            entityId: entity.entityId,
            reviewer: "phase19-publication-reviewer",
          }),
        "Publication readiness blocked",
      );
      const after = await publicationLifecycleSnapshot(client, entity.entityId);
      assertCondition(
        after === before,
        `${blockerCase} blocker left an in_review v2 snapshot after rollback.`,
      );
      assertCondition(
        (await currentPublicationReviewCount(
          client,
          entity.entityId,
          contentHash,
        )) === 0,
        `${blockerCase} blocker left the transaction-owned publication review.`,
      );
      const blockers = await contract2Blockers(client, entity.entityId);
      const expectedBlocker = blockerCase === "conflict"
        ? "unresolved_field_conflict"
        : "approved_claim_missing_evidence";
      assertCondition(
        blockers.includes(expectedBlocker),
        `${blockerCase} fixture missed ${expectedBlocker}: ${JSON.stringify(blockers)}.`,
      );
      await assertNoPublicMembership(
        client,
        entity.entityId,
        `${blockerCase} blocker fixture`,
      );
    });
  }

  await withPhase19Fixture(async ({ client }) => {
    const brand = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-atomic-brand",
      entityType: "brand",
    });
    await recordFirstThreeCurrentReviews(client, brand.entityId);
    const publishedBrand = await publishEntity(client, {
      entityId: brand.entityId,
      reviewer: "phase19-brand-publication-reviewer",
    });
    const pen = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-atomic-pen",
      entityType: "pen",
      brandEntityId: brand.entityId,
    });
    // The made_by edge is part of the brand publication payload and demotes
    // the earlier snapshot; refresh the brand before publishing the pen.
    await recordFirstThreeCurrentReviews(client, brand.entityId);
    await publishEntity(client, {
      entityId: brand.entityId,
      reviewer: "phase19-brand-republication-reviewer",
    });
    await recordFirstThreeCurrentReviews(client, pen.entityId);
    const publishedPen = await publishEntity(client, {
      entityId: pen.entityId,
      reviewer: "phase19-pen-publication-reviewer",
    });
    const publicRows = await client.execute({
      sql: `
        SELECT id FROM public_entities
        WHERE id IN (?, ?)
        ORDER BY id
      `,
      args: [brand.entityId, pen.entityId],
    });
    assertCondition(
      publicRows.rows.length === 2,
      "Fully qualified brand+pen did not atomically enter public_entities.",
    );
    const madeBy = await client.execute({
      sql: `
        SELECT link.id
        FROM entity_links link
        JOIN public_entities brand ON brand.id = link.target_id
        WHERE link.source_id = ? AND link.link_type = 'made_by'
      `,
      args: [pen.entityId],
    });
    assertCondition(
      madeBy.rows.length === 1,
      "Published pen must have exactly one made_by edge to a public brand.",
    );

    await client.execute({
      sql: "UPDATE stories SET body_md = body_md || '\ncritical edit' WHERE id = ?",
      args: [pen.storyId],
    });
    await assertNoPublicMembership(client, pen.entityId, "Critical edit pen");
    const staleSnapshot = await publicationLifecycleSnapshot(
      client,
      pen.entityId,
    );
    await expectReject(
      () =>
        publishEntity(client, {
          entityId: pen.entityId,
          reviewer: "phase19-stale-publication-reviewer",
        }),
      "current-hash reviews missing",
    );
    assertCondition(
      (await publicationLifecycleSnapshot(client, pen.entityId)) ===
        staleSnapshot,
      "Stale first-three reviews changed lifecycle state on failed publish.",
    );
    await recordFirstThreeCurrentReviews(client, pen.entityId);
    const republishedPen = await publishEntity(client, {
      entityId: pen.entityId,
      reviewer: "phase19-republication-reviewer",
    });
    assertCondition(
      republishedPen.contentHash !== publishedPen.contentHash &&
        publishedBrand.contentHash.startsWith("sha256:v3:") &&
        (await currentPublicationReviewCount(
          client,
          pen.entityId,
          republishedPen.contentHash,
        )) === 1,
      "Critical edit did not require fresh first-three reviews and a refreshed final review.",
    );
  });
  console.log(
    "Evidence readiness/publish contract passed: three current-hash content reviews, transaction-owned publication review, blocker rollback, and atomic brand+pen publication are green.",
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  if (
    args.includes("--hash-invalidation") ||
    args.includes("--readiness-publish") ||
    args.includes("--all") ||
    args.length === 0
  ) {
    installPhase19FixtureSignalHandlers();
  }
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
  if (args.length === 1 && args[0] === "--hash-invalidation") {
    await runHashInvalidationContract();
    return;
  }
  if (args.length === 1 && args[0] === "--readiness-publish") {
    await runReadinessPublishContract();
    return;
  }
  if (args.length === 0 || (args.length === 1 && args[0] === "--all")) {
    await runMigrationContract();
    await runSchemaContract();
    await runHashInvalidationContract();
    await runReadinessPublishContract();
    await runQa01CompleteMatrix();
    return;
  }
  throw new Error(
    "Usage: pnpm check:evidence-contract -- --migration|--schema|--fixture-isolation|--hash-invalidation|--readiness-publish|--all",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
