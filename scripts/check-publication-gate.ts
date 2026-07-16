import { spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import {
  assertDatabaseReady,
  migrateDatabase,
  resolveDatabaseConnection,
} from "../src/lib/db";
import {
  computePublicationContentHash,
  publishEntity,
  readPublicationContentPayload,
  recordEntityContentReview,
  setEntityPublicationStatus,
} from "../src/lib/publication";
import {
  cleanupActivePhase19Fixtures,
  cleanupPhase19Fixture,
  createPhase19Fixture,
  seedQualifiedPublicationFixture,
  withPhase19Fixture,
} from "./lib/phase19-fixtures";

const ROOT = process.cwd();
const REAL_DATABASE_PATH = path.join(ROOT, "data", "fpkg.db");
const MIGRATIONS_PATH = path.join(ROOT, "migrations");
const SCRIPT_PATH = path.join(ROOT, "scripts", "check-publication-gate.ts");
const MIGRATION_030 = "030_publication_gate.sql";
const MIGRATION_031 = "031_evidence_readiness_v2.sql";
const VALID_HASH = `sha256:v1:${"a".repeat(64)}`;

const CRITICAL_PUBLICATION_OBJECTS = [
  ["table", "entity_publications"],
  ["index", "idx_entity_publications_status"],
  ["index", "idx_entity_publications_review_contract"],
  ["view", "publication_claim_entities"],
  ["view", "publication_citation_entities"],
  ["view", "publication_source_item_entities"],
  ["view", "publication_base_blockers"],
  ["view", "publication_public_brands"],
  ["view", "publication_blockers"],
  ["view", "public_entity_readiness"],
  ["view", "public_entities"],
  ["trigger", "publication_entity_insert_draft"],
  ["trigger", "publication_entity_type_reset"],
  ["trigger", "publication_entity_content_update"],
  ["trigger", "publication_story_insert"],
  ["trigger", "publication_model_spec_insert"],
  ["trigger", "publication_model_variant_insert"],
  ["trigger", "publication_claim_insert"],
  ["trigger", "publication_citation_insert"],
  ["trigger", "publication_source_item_insert"],
  ["trigger", "publication_source_registry_insert"],
  ["trigger", "publication_entity_reference_insert"],
  ["trigger", "publication_timeline_event_insert"],
  ["trigger", "publication_media_asset_insert"],
  ["trigger", "publication_made_by_link_insert"],
  ["trigger", "publication_publish_insert_guard"],
  ["trigger", "publication_publish_transition_guard"],
] as const;

// Independent copy of the pre-publication non-brand/pen visibility contract.
// Do not import publicEntityFilter/isPublicEntity here: this is the expected
// side of the compatibility oracle, not another runtime consumer.
const LEGACY_PUBLIC_NON_BRAND_WHERE = `
  e.type NOT IN ('brand', 'pen')
  AND e.slug NOT IN (
    '百乐-pilot-custom-823',
    '百利金-pelikan-m800',
    '派克-parker-51-经典-vintage',
    '写乐-sailor-21k-pro-gear-大鱼雷',
    '奥罗拉-aurora'
  )
  AND NOT (
    e.type = 'concept'
    AND e.slug IN ('italic-nib', 'music-nib', 'rotary-filler')
  )
  AND NOT (
    e.type = 'article'
    AND e.slug IN (
      'about-us',
      'contact-us',
      'demonstrator-pens',
      'hommel-s-meteor-fountain-pen-and-its-descendants',
      'how-to-disassemble-and-reassemble-a-parker-51',
      'parker-ivorine-pastel-and-moire-oh-my',
      'personalized-pens-the-malarkey-pen',
      'pilot-iroshizuku-ink-guide',
      'preserving-your-pens-dos-and-don-ts',
      'privacy-policy',
      'readme',
      'soviet-pens',
      'tribute-pens-and-reboots',
      'world-war-ii-and-the-fountain-pen',
      '万特佳',
      '公爵-duke',
      '半句',
      '永续',
      '犀飞利-sheaffer-品牌泛称',
      '灵感提炼'
    )
  )
`;

interface FixtureContext {
  tempRoot: string;
  databasePath: string;
  databaseUrl: string;
  client: Client;
  children: Set<ChildProcess>;
  cleanupPromise?: Promise<void>;
}

interface FileSnapshot {
  exists: boolean;
  size?: string;
  mtimeNs?: string;
  mode?: number;
  sha256?: string;
}

interface DeprecatedStoryRow {
  id: string;
  storyType: string;
  status: string;
  bodyHash: string;
}

interface EntityContentRow {
  id: string;
  contentHash: string;
}

let activeFixture: FixtureContext | null = null;
let borrowedE2EServer: ChildProcess | null = null;
let signalCleanupStarted = false;

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function snapshotFile(filePath: string): FileSnapshot {
  if (!fs.existsSync(filePath)) return { exists: false };
  const stat = fs.statSync(filePath, { bigint: true });
  return {
    exists: true,
    size: stat.size.toString(),
    mtimeNs: stat.mtimeNs.toString(),
    mode: Number(stat.mode),
    sha256: sha256File(filePath),
  };
}

function snapshotRealDatabase(): Record<string, FileSnapshot> {
  return Object.fromEntries(
    [REAL_DATABASE_PATH, `${REAL_DATABASE_PATH}-wal`, `${REAL_DATABASE_PATH}-shm`].map(
      (filePath) => [path.basename(filePath), snapshotFile(filePath)],
    ),
  );
}

function hasExited(child: ChildProcess): boolean {
  return child.exitCode !== null || child.signalCode !== null;
}

function waitForChildExit(child: ChildProcess, timeoutMs: number): Promise<boolean> {
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

async function cleanupFixture(fixture: FixtureContext): Promise<void> {
  if (fixture.cleanupPromise) return fixture.cleanupPromise;

  fixture.cleanupPromise = (async () => {
    await Promise.all([...fixture.children].map((child) => stopChild(child)));
    fixture.children.clear();
    try {
      fixture.client.close();
    } finally {
      fs.rmSync(fixture.tempRoot, { recursive: true, force: true });
      if (activeFixture === fixture) activeFixture = null;
    }
  })();

  return fixture.cleanupPromise;
}

function registerChild(
  fixture: FixtureContext,
  command: string,
  args: string[],
  options: Parameters<typeof spawn>[2],
): ChildProcess {
  const child = spawn(command, args, options);
  fixture.children.add(child);
  child.once("exit", () => fixture.children.delete(child));
  return child;
}

async function createFixture(prefix = "fpkg-publication-"): Promise<FixtureContext> {
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
  );
  const databasePath = path.join(tempRoot, "fixture.db");
  const databaseUrl = `file:${databasePath}`;
  const client = createClient({ url: databaseUrl });
  const fixture: FixtureContext = {
    tempRoot,
    databasePath,
    databaseUrl,
    client,
    children: new Set(),
  };
  activeFixture = fixture;

  try {
    await migrateDatabase(client);
    return fixture;
  } catch (error) {
    await cleanupFixture(fixture);
    throw error;
  }
}

async function withFixture<T>(
  run: (fixture: FixtureContext) => Promise<T>,
): Promise<T> {
  const fixture = await createFixture();
  try {
    return await run(fixture);
  } finally {
    await cleanupFixture(fixture);
  }
}

async function withPre030Fixture<T>(
  run: (fixture: FixtureContext, migrationsDir: string) => Promise<T>,
): Promise<T> {
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-publication-pre030-")),
  );
  const migrationsDir = path.join(tempRoot, "migrations");
  fs.mkdirSync(migrationsDir);
  for (const file of fs.readdirSync(MIGRATIONS_PATH).sort()) {
    if (!file.endsWith(".sql") || file >= MIGRATION_030) continue;
    fs.copyFileSync(
      path.join(MIGRATIONS_PATH, file),
      path.join(migrationsDir, file),
    );
  }

  const databasePath = path.join(tempRoot, "fixture.db");
  const databaseUrl = `file:${databasePath}`;
  const client = createClient({ url: databaseUrl });
  const fixture: FixtureContext = {
    tempRoot,
    databasePath,
    databaseUrl,
    client,
    children: new Set(),
  };
  activeFixture = fixture;

  try {
    await migrateDatabase(client, { migrationsDir });
    return await run(fixture, migrationsDir);
  } finally {
    await cleanupFixture(fixture);
  }
}

function assertSnapshotUnchanged(
  before: Record<string, FileSnapshot>,
  context: string,
): void {
  const after = snapshotRealDatabase();
  assertCondition(
    JSON.stringify(after) === JSON.stringify(before),
    `${context} changed the real catalog.\nBefore: ${JSON.stringify(before)}\nAfter: ${JSON.stringify(after)}`,
  );
}

async function withCatalogCopy<T>(
  run: (fixture: FixtureContext) => Promise<T>,
): Promise<T> {
  const before = snapshotRealDatabase();
  const mainSnapshot = before[path.basename(REAL_DATABASE_PATH)];
  const walSnapshot = before[path.basename(`${REAL_DATABASE_PATH}-wal`)];
  assertCondition(mainSnapshot?.exists, "The local catalog snapshot is missing.");
  assertCondition(
    !walSnapshot?.exists || walSnapshot.size === "0",
    "Refusing to copy the local catalog while a non-empty WAL exists.",
  );

  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-publication-catalog-copy-")),
  );
  const databasePath = path.join(tempRoot, "catalog-copy.db");
  fs.copyFileSync(REAL_DATABASE_PATH, databasePath);
  assertCondition(
    fs.realpathSync.native(databasePath) !== fs.realpathSync.native(REAL_DATABASE_PATH),
    "Catalog copy unexpectedly resolved to the real database path.",
  );
  const databaseUrl = `file:${databasePath}`;
  const fixture: FixtureContext = {
    tempRoot,
    databasePath,
    databaseUrl,
    client: createClient({ url: databaseUrl }),
    children: new Set(),
  };
  activeFixture = fixture;

  try {
    return await run(fixture);
  } finally {
    await cleanupFixture(fixture);
    assertSnapshotUnchanged(before, "Disposable catalog-copy validation");
  }
}

function describeFailure(error: unknown): string {
  if (error instanceof AggregateError) {
    return error.errors.map(describeFailure).join("\n");
  }
  if (error instanceof Error) {
    const cause = error.cause ? `\nCaused by: ${describeFailure(error.cause)}` : "";
    return `${error.message}${cause}`;
  }
  return String(error);
}

async function runCheckMatrix(
  label: string,
  checks: Array<{ name: string; run: () => Promise<void> }>,
): Promise<void> {
  const failures: string[] = [];
  for (const check of checks) {
    try {
      await check.run();
      console.log(`PASS ${label}: ${check.name}`);
    } catch (error) {
      failures.push(`${check.name}: ${describeFailure(error)}`);
    }
  }
  if (failures.length > 0) {
    throw new Error(
      `${label} failed ${failures.length}/${checks.length} checks:\n- ${failures.join("\n- ")}`,
    );
  }
}

function assertCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message);
}

async function expectReject(
  run: () => Promise<unknown>,
  messageFragment: string,
): Promise<void> {
  try {
    await run();
  } catch (error) {
    if (error instanceof Error && error.message.includes(messageFragment)) return;
    throw error;
  }
  throw new Error(`Expected rejection containing: ${messageFragment}`);
}

async function insertEntity(
  client: Client,
  id: string,
  type: string,
  summary = `${id} summary`,
): Promise<void> {
  await client.execute({
    sql: `
      INSERT INTO entities (id, type, slug, name, summary, body_md, source)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [id, type, id, id, summary, `${id} body`, "fixture"],
  });
}

async function insertStory(
  client: Client,
  entityId: string,
  storyType: "brand_story" | "model_story",
  status: "published" | "deprecated" = "published",
): Promise<void> {
  await client.execute({
    sql: `
      INSERT INTO stories (id, entity_id, title, story_type, body_md, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [
      `story-${entityId}`,
      entityId,
      `${entityId} story`,
      storyType,
      `${entityId} story body`,
      status,
    ],
  });
}

async function forceReviewedPublication(
  client: Client,
  entityId: string,
  status: "draft" | "in_review" | "published" | "retired" = "published",
): Promise<void> {
  const contentHash = VALID_HASH;
  const stagedStatus = status === "published" ? "in_review" : status;
  await client.execute({
    sql: `
      UPDATE entity_publications
      SET status = ?,
          approved_content_hash = ?,
          reviewed_content_revision = content_revision,
          reviewed_contract_version = 1,
          reviewed_by = 'fixture-reviewer',
          reviewed_at = '2026-07-15T00:00:00.000Z',
          published_at = CASE
            WHEN ? = 'published' THEN '2026-07-15T00:00:01.000Z'
            ELSE NULL
          END,
          updated_at = datetime('now')
      WHERE entity_id = ?
    `,
    args: [stagedStatus, contentHash, status, entityId],
  });
  if (status === "published") {
    await client.execute({
      sql: "UPDATE entity_publications SET status = 'published' WHERE entity_id = ?",
      args: [entityId],
    });
  }
}

async function blockerCodes(client: Client, entityId: string): Promise<string[]> {
  const result = await client.execute({
    sql: `
      SELECT blocker_code
      FROM publication_blockers
      WHERE entity_id = ? AND contract_version = 1
      ORDER BY blocker_code
    `,
    args: [entityId],
  });
  return result.rows.map((row) => String(row.blocker_code));
}

async function assertBlocker(
  client: Client,
  entityId: string,
  expected: string,
): Promise<void> {
  const actual = await blockerCodes(client, entityId);
  assertCondition(
    actual.includes(expected),
    `${entityId} was missing blocker ${expected}; got ${actual.join(", ") || "none"}.`,
  );
}

async function assertNotPublic(client: Client, entityId: string): Promise<void> {
  const result = await client.execute({
    sql: "SELECT 1 FROM public_entities WHERE id = ?",
    args: [entityId],
  });
  assertCondition(
    result.rows.length === 0,
    `${entityId} unexpectedly entered public_entities.`,
  );
}

async function assertPublic(client: Client, entityId: string): Promise<void> {
  const result = await client.execute({
    sql: "SELECT 1 FROM public_entities WHERE id = ?",
    args: [entityId],
  });
  assertCondition(
    result.rows.length === 1,
    `${entityId} did not enter public_entities.`,
  );
}

async function assertPublicationReset(
  client: Client,
  entityId: string,
  expectedRevision?: number,
): Promise<void> {
  const result = await client.execute({
    sql: `
      SELECT status, content_revision, approved_content_hash, reviewed_content_revision,
             reviewed_contract_version, reviewed_by, reviewed_at, published_at
      FROM entity_publications
      WHERE entity_id = ?
    `,
    args: [entityId],
  });
  const row = result.rows[0];
  assertCondition(row, `${entityId} lost its explicit publication row.`);
  assertCondition(row.status === "draft", `${entityId} did not reset to draft.`);
  if (expectedRevision !== undefined) {
    assertCondition(
      Number(row.content_revision) === expectedRevision,
      `${entityId}.content_revision expected ${expectedRevision}, got ${String(row.content_revision)}.`,
    );
  }
  for (const field of [
    "approved_content_hash",
    "reviewed_content_revision",
    "reviewed_contract_version",
    "reviewed_by",
    "reviewed_at",
    "published_at",
  ] as const) {
    assertCondition(row[field] === null, `${entityId}.${field} was not cleared.`);
  }
}

async function runMigrationContract(): Promise<void> {
  await withPre030Fixture(async ({ client }, migrationsDir) => {
    fs.copyFileSync(
      path.join(MIGRATIONS_PATH, MIGRATION_030),
      path.join(migrationsDir, MIGRATION_030),
    );
    await migrateDatabase(client, { migrationsDir });
    await assertDatabaseReady(client, { migrationsDir });

    await insertEntity(client, "fixture-transition", "article");
    await client.execute(
      "UPDATE entities SET type = 'brand' WHERE id = 'fixture-transition'",
    );
    await assertPublicationReset(client, "fixture-transition", 1);
    await forceReviewedPublication(client, "fixture-transition", "in_review");
    await client.execute(
      "UPDATE entities SET type = 'pen' WHERE id = 'fixture-transition'",
    );
    await assertPublicationReset(client, "fixture-transition", 2);
    await forceReviewedPublication(client, "fixture-transition", "in_review");
    await client.execute(
      "UPDATE entities SET type = 'brand' WHERE id = 'fixture-transition'",
    );
    await assertPublicationReset(client, "fixture-transition", 3);
    await forceReviewedPublication(client, "fixture-transition", "in_review");
    await client.execute(
      "UPDATE entities SET type = 'article' WHERE id = 'fixture-transition'",
    );
    await assertPublicationReset(client, "fixture-transition", 4);

    await insertEntity(client, "fixture-enter-pen", "concept");
    await client.execute(
      "UPDATE entities SET type = 'pen' WHERE id = 'fixture-enter-pen'",
    );
    await assertPublicationReset(client, "fixture-enter-pen", 1);

    await insertEntity(client, "fixture-public-brand", "brand");
    await insertStory(client, "fixture-public-brand", "brand_story");
    await forceReviewedPublication(client, "fixture-public-brand");
    await assertPublic(client, "fixture-public-brand");

    await insertEntity(client, "fixture-draft-brand", "brand");
    await insertStory(client, "fixture-draft-brand", "brand_story");

    await insertEntity(client, "fixture-pen-missing-maker", "pen");
    await insertStory(client, "fixture-pen-missing-maker", "model_story");
    await forceReviewedPublication(client, "fixture-pen-missing-maker", "in_review");
    await assertBlocker(client, "fixture-pen-missing-maker", "missing_made_by");
    await assertNotPublic(client, "fixture-pen-missing-maker");

    await insertEntity(client, "fixture-pen-draft-maker", "pen");
    await insertStory(client, "fixture-pen-draft-maker", "model_story");
    await client.execute(`
      INSERT INTO entity_links (id, source_id, target_id, link_type)
      VALUES (
        'fixture-link-draft-maker',
        'fixture-pen-draft-maker',
        'fixture-draft-brand',
        'made_by'
      )
    `);
    await forceReviewedPublication(client, "fixture-pen-draft-maker", "in_review");
    await assertBlocker(
      client,
      "fixture-pen-draft-maker",
      "made_by_brand_not_public",
    );
    await assertNotPublic(client, "fixture-pen-draft-maker");

    await insertEntity(client, "fixture-pen-multiple-makers", "pen");
    await insertStory(client, "fixture-pen-multiple-makers", "model_story");
    await client.executeMultiple(`
      INSERT INTO entity_links (id, source_id, target_id, link_type)
      VALUES (
        'fixture-link-maker-one',
        'fixture-pen-multiple-makers',
        'fixture-public-brand',
        'made_by'
      );
      INSERT INTO entity_links (id, source_id, target_id, link_type)
      VALUES (
        'fixture-link-maker-two',
        'fixture-pen-multiple-makers',
        'fixture-draft-brand',
        'made_by'
      );
    `);
    await forceReviewedPublication(client, "fixture-pen-multiple-makers", "in_review");
    await assertBlocker(
      client,
      "fixture-pen-multiple-makers",
      "multiple_made_by",
    );
    await assertNotPublic(client, "fixture-pen-multiple-makers");

    await insertEntity(client, "fixture-public-pen", "pen");
    await insertStory(client, "fixture-public-pen", "model_story");
    await client.execute(`
      INSERT INTO entity_links (id, source_id, target_id, link_type)
      VALUES (
        'fixture-link-public-maker',
        'fixture-public-pen',
        'fixture-public-brand',
        'made_by'
      )
    `);
    await forceReviewedPublication(client, "fixture-public-pen");
    await assertPublic(client, "fixture-public-pen");

    await client.execute({
      sql: "UPDATE entity_publications SET blockers_json = '[]' WHERE entity_id = ?",
      args: ["fixture-pen-missing-maker"],
    });
    await assertNotPublic(client, "fixture-pen-missing-maker");

    await client.execute("DROP VIEW public_entities");
    await expectReject(
      () => assertDatabaseReady(client, { migrationsDir }),
      "view:public_entities",
    );
  });

  console.log(
    "Publication migration contract passed: schema manifest, type transitions, readiness, PUB-07, and fail-closed public view verified in an isolated DB.",
  );
}

async function storySnapshot(client: Client): Promise<string> {
  const result = await client.execute(`
    SELECT id, entity_id, title, story_type, summary, body_md, status,
           source_notes, created_at, updated_at
    FROM stories
    ORDER BY id
  `);
  return createHash("sha256")
    .update(JSON.stringify(result.rows))
    .digest("hex");
}

async function deprecatedStoryRows(
  client: Client,
): Promise<DeprecatedStoryRow[]> {
  const result = await client.execute(`
    SELECT id, story_type, status, body_md
    FROM stories
    WHERE status = 'deprecated'
      AND story_type IN ('brand_story', 'model_story')
    ORDER BY id
  `);
  return result.rows.map((row) => ({
    id: String(row.id),
    storyType: String(row.story_type),
    status: String(row.status),
    bodyHash: createHash("sha256")
      .update(String(row.body_md ?? ""))
      .digest("hex"),
  }));
}

async function entityContentRows(client: Client): Promise<EntityContentRow[]> {
  const result = await client.execute(`
    SELECT id, type, slug, name, summary, body_md, source, created_at,
           updated_at, source_url, source_file, imported_at
    FROM entities
    ORDER BY id
  `);
  return result.rows.map((row) => ({
    id: String(row.id),
    contentHash: createHash("sha256")
      .update(JSON.stringify(row))
      .digest("hex"),
  }));
}

function assertRowsEqual<T extends { id: string }>(
  before: T[],
  after: T[],
  label: string,
): void {
  const beforeById = new Map(before.map((row) => [row.id, JSON.stringify(row)]));
  const afterById = new Map(after.map((row) => [row.id, JSON.stringify(row)]));
  const diffs = [...new Set([...beforeById.keys(), ...afterById.keys()])]
    .filter((id) => beforeById.get(id) !== afterById.get(id))
    .sort();
  assertCondition(
    diffs.length === 0,
    `${label} changed ${diffs.length} rows: ${diffs.slice(0, 20).join(", ")}`,
  );
}

async function assertMigrationChecksum(
  client: Client,
  migrationsDir = MIGRATIONS_PATH,
): Promise<void> {
  const marker = await client.execute({
    sql: "SELECT checksum FROM migrations WHERE name = ?",
    args: [MIGRATION_030],
  });
  const recorded = marker.rows[0]?.checksum;
  const expected = createHash("sha256")
    .update(fs.readFileSync(path.join(migrationsDir, MIGRATION_030), "utf8"))
    .digest("hex");
  assertCondition(
    recorded !== null && recorded !== undefined && String(recorded) === expected,
    `Migration 030 checksum mismatch: expected ${expected}, got ${String(recorded)}.`,
  );
}

async function assertIntegrityAndCriticalSchema(
  client: Client,
  migrationsDir = MIGRATIONS_PATH,
): Promise<void> {
  const quickCheck = await client.execute("PRAGMA quick_check");
  const quickFailures = quickCheck.rows.filter(
    (row) => String(row.quick_check ?? Object.values(row)[0]) !== "ok",
  );
  assertCondition(
    quickFailures.length === 0,
    `PRAGMA quick_check failed: ${JSON.stringify(quickFailures)}`,
  );

  const foreignKeyCheck = await client.execute("PRAGMA foreign_key_check");
  assertCondition(
    foreignKeyCheck.rows.length === 0,
    `PRAGMA foreign_key_check found ${foreignKeyCheck.rows.length} violations.`,
  );

  const names = CRITICAL_PUBLICATION_OBJECTS.map(([, name]) => name);
  const schema = await client.execute({
    sql: `SELECT type, name FROM sqlite_schema WHERE name IN (${names.map(() => "?").join(", ")})`,
    args: names,
  });
  const actual = new Set(
    schema.rows.map((row) => `${String(row.type)}:${String(row.name)}`),
  );
  const missing = CRITICAL_PUBLICATION_OBJECTS
    .filter(([type, name]) => !actual.has(`${type}:${name}`))
    .map(([type, name]) => `${type}:${name}`);
  assertCondition(
    missing.length === 0,
    `Critical publication schema objects missing: ${missing.join(", ")}`,
  );

  await assertDatabaseReady(client, { migrationsDir });
  await assertMigrationChecksum(client, migrationsDir);
}

async function assertDraftOnlyBrandPenBackfill(client: Client): Promise<void> {
  const aggregate = await client.execute(`
    SELECT
      (SELECT count(*) FROM entities WHERE type IN ('brand', 'pen')) AS governed,
      (SELECT count(*)
       FROM entities e
       JOIN entity_publications ep ON ep.entity_id = e.id
       WHERE e.type IN ('brand', 'pen')) AS publication_rows,
      (SELECT count(*)
       FROM entities e
       JOIN entity_publications ep ON ep.entity_id = e.id
       WHERE e.type IN ('brand', 'pen') AND ep.status = 'draft') AS drafts,
      (SELECT count(*)
       FROM entities e
       JOIN entity_publications ep ON ep.entity_id = e.id
       WHERE e.type IN ('brand', 'pen') AND ep.status = 'published') AS published
  `);
  const row = aggregate.rows[0];
  assertCondition(row, "Brand/pen publication aggregate is missing.");
  const governed = Number(row.governed);
  assertCondition(
    governed === Number(row.publication_rows) && governed === Number(row.drafts),
    `Expected ${governed} brand/pen rows to be draft; got ${String(row.publication_rows)} publication rows and ${String(row.drafts)} drafts.`,
  );
  assertCondition(
    Number(row.published) === 0,
    `Migration grandfathered ${String(row.published)} brand/pen rows into published.`,
  );
}

async function runBackfillContract(): Promise<void> {
  await withPre030Fixture(async ({ client }, migrationsDir) => {
    await assertDatabaseReady(client, { migrationsDir });

    await insertEntity(client, "fixture-backfill-brand", "brand");
    await insertEntity(client, "fixture-backfill-pen", "pen");
    await insertEntity(client, "fixture-backfill-article", "article");
    await insertStory(client, "fixture-backfill-brand", "brand_story");
    await insertStory(
      client,
      "fixture-backfill-pen",
      "model_story",
      "deprecated",
    );
    const storiesBefore = await storySnapshot(client);

    fs.copyFileSync(
      path.join(MIGRATIONS_PATH, MIGRATION_030),
      path.join(migrationsDir, MIGRATION_030),
    );
    const firstRun = await migrateDatabase(client, { migrationsDir });
    assertCondition(
      firstRun.applied.length === 1 && firstRun.applied[0] === MIGRATION_030,
      `Expected only ${MIGRATION_030} to apply; got ${firstRun.applied.join(", ") || "none"}.`,
    );
    await assertDatabaseReady(client, { migrationsDir });

    const missingRows = await client.execute(`
      SELECT e.id
      FROM entities e
      LEFT JOIN entity_publications ep ON ep.entity_id = e.id
      WHERE e.type IN ('brand', 'pen') AND ep.entity_id IS NULL
    `);
    assertCondition(
      missingRows.rows.length === 0,
      `Backfill missed ${missingRows.rows.length} brand/pen publication rows.`,
    );
    const statuses = await client.execute(`
      SELECT
        count(*) AS total,
        sum(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS drafts,
        sum(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published
      FROM entity_publications
    `);
    const statusRow = statuses.rows[0];
    assertCondition(statusRow, "Backfill produced no publication status aggregate.");
    assertCondition(
      Number(statusRow.total) === Number(statusRow.drafts),
      "Backfill did not leave every explicit publication row in draft.",
    );
    assertCondition(
      Number(statusRow.published) === 0,
      "Backfill unexpectedly published one or more entities.",
    );
    assertCondition(
      storiesBefore === (await storySnapshot(client)),
      "Migration 030 changed story rows during backfill.",
    );

    const secondRun = await migrateDatabase(client, { migrationsDir });
    assertCondition(
      secondRun.applied.length === 0 && secondRun.skipped.includes(MIGRATION_030),
      "Migration 030 was not idempotently skipped on its second run.",
    );
    assertCondition(
      storiesBefore === (await storySnapshot(client)),
      "The idempotent migration replay changed story rows.",
    );
  });

  console.log(
    "Publication backfill contract passed: all brand/pen rows are draft, zero are published, stories are unchanged, and migration replay is idempotent.",
  );
}

async function runFreshReplayMatrix(): Promise<void> {
  await withFixture(async ({ client }) => {
    await insertEntity(client, "fixture-fresh-brand", "brand");
    await insertEntity(client, "fixture-fresh-pen", "pen");
    await assertDraftOnlyBrandPenBackfill(client);
    await assertIntegrityAndCriticalSchema(client);

    const secondRun = await migrateDatabase(client);
    assertCondition(
      secondRun.applied.length === 0 && secondRun.skipped.includes(MIGRATION_030),
      `Fresh replay was not idempotent: ${JSON.stringify(secondRun)}.`,
    );
    await assertIntegrityAndCriticalSchema(client);
  });
}

async function runCurrentCatalogCopyUpgrade(): Promise<void> {
  await withCatalogCopy(async ({ client }) => {
    const entitiesBefore = await entityContentRows(client);
    const deprecatedStoriesBefore = await deprecatedStoryRows(client);
    const governedMigrations = [MIGRATION_030, MIGRATION_031];
    const markerBefore = await client.execute({
      sql: `SELECT name FROM migrations WHERE name IN (${governedMigrations.map(() => "?").join(", ")})`,
      args: governedMigrations,
    });
    const previouslyApplied = new Set(
      markerBefore.rows.map((row) => String(row.name)),
    );
    const expectedApplied = governedMigrations.filter(
      (migration) => !previouslyApplied.has(migration),
    );

    const firstRun = await migrateDatabase(client);
    assertCondition(
      JSON.stringify(firstRun.applied) === JSON.stringify(expectedApplied) &&
        [...previouslyApplied].every((migration) =>
          firstRun.skipped.includes(migration),
        ),
      `Catalog-copy upgrade expected ${JSON.stringify(expectedApplied)} to apply and prior markers to skip; got ${JSON.stringify(firstRun)}.`,
    );

    assertRowsEqual(
      deprecatedStoriesBefore,
      await deprecatedStoryRows(client),
      "Deprecated brand/model stories",
    );
    assertRowsEqual(
      entitiesBefore,
      await entityContentRows(client),
      "Entity content",
    );
    await assertDraftOnlyBrandPenBackfill(client);
    await assertIntegrityAndCriticalSchema(client);

    const secondRun = await migrateDatabase(client);
    assertCondition(
      secondRun.applied.length === 0 &&
        governedMigrations.every((migration) =>
          secondRun.skipped.includes(migration),
        ),
      `Catalog-copy second migration run was not idempotent: ${JSON.stringify(secondRun)}.`,
    );
    assertRowsEqual(
      deprecatedStoriesBefore,
      await deprecatedStoryRows(client),
      "Deprecated brand/model stories after idempotent replay",
    );
    assertRowsEqual(
      entitiesBefore,
      await entityContentRows(client),
      "Entity content after idempotent replay",
    );
    await assertIntegrityAndCriticalSchema(client);
  });
}

async function runMigrationFullContract(): Promise<void> {
  await runCheckMatrix("publication migration-full", [
    { name: "empty fresh replay, schema, checksums, and integrity", run: runFreshReplayMatrix },
    { name: "synthetic pre-030 upgrade and draft-only backfill", run: runBackfillContract },
    { name: "current-catalog disposable-copy upgrade invariance", run: runCurrentCatalogCopyUpgrade },
    { name: "type transitions, critical schema, and made_by readiness", run: runMigrationContract },
    { name: "critical I/U/D invalidation matrix", run: runInvalidationContract },
    { name: "direct-SQL guards, rollback, and atomic publish", run: runPublishContract },
  ]);
  console.log(
    "Publication migration-full matrix passed: fresh/upgrade/idempotent/integrity/invalidation/direct-SQL/rollback checks are green.",
  );
}

async function runCatalogCompatibility(): Promise<void> {
  await withCatalogCopy(async ({ client }) => {
    const expectedRows = await client.execute(`
      SELECT e.id
      FROM entities e
      WHERE ${LEGACY_PUBLIC_NON_BRAND_WHERE}
      ORDER BY e.id
    `);
    const expectedIds = expectedRows.rows.map((row) => String(row.id));

    await migrateDatabase(client);
    await client.execute(`
      CREATE TEMP TABLE expected_legacy_public (
        id TEXT PRIMARY KEY NOT NULL
      )
    `);
    if (expectedIds.length > 0) {
      await client.batch(
        expectedIds.map((id) => ({
          sql: "INSERT INTO expected_legacy_public (id) VALUES (?)",
          args: [id],
        })),
        "write",
      );
    }

    const expectedOnly = await client.execute(`
      SELECT id FROM expected_legacy_public
      EXCEPT
      SELECT id FROM public_entities WHERE type NOT IN ('brand', 'pen')
    `);
    const actualOnly = await client.execute(`
      SELECT id FROM public_entities WHERE type NOT IN ('brand', 'pen')
      EXCEPT
      SELECT id FROM expected_legacy_public
    `);
    assertCondition(
      expectedOnly.rows.length === 0 && actualOnly.rows.length === 0,
      `Non-brand/pen compatibility mismatch. expected-only=${expectedOnly.rows.map((row) => String(row.id)).join(",") || "none"}; actual-only=${actualOnly.rows.map((row) => String(row.id)).join(",") || "none"}.`,
    );
    await assertIntegrityAndCriticalSchema(client);
  });
}

async function runExplicitNonBrandPublicationCompatibility(): Promise<void> {
  await withFixture(async ({ client }) => {
    const entityId = "fixture-explicit-article";
    await insertEntity(client, entityId, "article");
    await assertPublic(client, entityId);

    await client.execute({
      sql: `
        INSERT INTO entity_publications (entity_id, status, blockers_json)
        VALUES (?, 'draft', '["explicit_publication_draft"]')
      `,
      args: [entityId],
    });
    await assertNotPublic(client, entityId);

    await recordV2FirstThreeReviews(client, entityId);
    await publishEntity(client, {
      entityId,
      reviewer: "compatibility-reviewer",
    });
    await assertPublic(client, entityId);

    await setEntityPublicationStatus(client, entityId, "retired");
    await assertNotPublic(client, entityId);
  });
}

async function runCompatibilityContract(): Promise<void> {
  await runCheckMatrix("publication compatibility", [
    {
      name: "pre-upgrade legacy vs post-upgrade non-brand/pen bidirectional EXCEPT",
      run: runCatalogCompatibility,
    },
    {
      name: "explicit non-brand publication row switches to strict lifecycle",
      run: runExplicitNonBrandPublicationCompatibility,
    },
  ]);
  console.log(
    "Publication compatibility passed: legacy non-brand/pen membership is identical in both EXCEPT directions and explicit publication rows use the strict gate.",
  );
}

interface PublicationState {
  revision: number;
  status: string;
  approvedHash: string | null;
}

async function publicationState(
  client: Client,
  entityId: string,
): Promise<PublicationState> {
  const result = await client.execute({
    sql: `
      SELECT content_revision, status, approved_content_hash
      FROM entity_publications
      WHERE entity_id = ?
    `,
    args: [entityId],
  });
  const row = result.rows[0];
  assertCondition(row, `${entityId} has no publication state.`);
  return {
    revision: Number(row.content_revision),
    status: String(row.status),
    approvedHash: row.approved_content_hash === null
      ? null
      : String(row.approved_content_hash),
  };
}

async function createPublishedBrand(client: Client, entityId: string): Promise<void> {
  await insertEntity(client, entityId, "brand");
  await insertStory(client, entityId, "brand_story");
  await forceReviewedPublication(client, entityId);
  await assertPublic(client, entityId);
}

async function assertInvalidatingMutation(
  client: Client,
  entityId: string,
  label: string,
  counter: { count: number },
  mutate: () => Promise<unknown>,
): Promise<void> {
  const before = await publicationState(client, entityId);
  assertCondition(before.status === "published", `${label} fixture was not published.`);
  assertCondition(before.approvedHash !== null, `${label} fixture had no approved hash.`);
  await mutate();
  counter.count += 1;
  const after = await publicationState(client, entityId);
  assertCondition(
    after.revision > before.revision,
    `${label} did not increase content_revision (${before.revision} -> ${after.revision}).`,
  );
  assertCondition(after.status === "in_review", `${label} did not move published -> in_review.`);
  assertCondition(
    after.approvedHash === before.approvedHash,
    `${label} discarded the audit hash instead of preserving it.`,
  );
  await assertNotPublic(client, entityId);
}

async function assertNeutralMutation(
  client: Client,
  entityId: string,
  label: string,
  counter: { count: number },
  mutate: () => Promise<unknown>,
): Promise<void> {
  const before = await publicationState(client, entityId);
  await mutate();
  counter.count += 1;
  const after = await publicationState(client, entityId);
  assertCondition(
    JSON.stringify(after) === JSON.stringify(before),
    `${label} invalidated an entity with no dependency on the inserted source.`,
  );
  await assertPublic(client, entityId);
}

async function insertFixtureSource(
  client: Client,
  sourceId: string,
  itemId: string,
): Promise<void> {
  await client.execute({
    sql: `
      INSERT INTO source_registry (
        id, name, source_type, allowed_use, reliability, license, fetch_method
      ) VALUES (?, ?, 'official', 'summary_only', 'official_marketing', 'fixture-license', 'manual')
    `,
    args: [sourceId, sourceId],
  });
  await client.execute({
    sql: `
      INSERT INTO source_items (
        id, source_id, title, url, allowed_use, review_status
      ) VALUES (?, ?, ?, ?, 'summary_only', 'approved')
    `,
    args: [itemId, sourceId, itemId, `https://example.invalid/${itemId}`],
  });
}

async function hashFixture(reverse: boolean): Promise<{
  hash: string;
  changedHash: string;
  sourceCount: number;
}> {
  return withFixture(async ({ client }) => {
    await client.execute({
      sql: `
        INSERT INTO entities (id, type, slug, name, summary, body_md, source)
        VALUES ('fixture-hash-pen', 'pen', 'fixture-hash-pen', ?, ?, 'body', 'fixture')
      `,
      args: reverse ? ["Café\nPen", "line one\nline two"] : ["Cafe\u0301\r\nPen", "line one\r\nline two"],
    });
    await insertEntity(client, "fixture-hash-brand", "brand");
    await insertStory(client, "fixture-hash-pen", "model_story");
    await client.execute(`
      INSERT INTO entity_links (id, source_id, target_id, link_type, reason)
      VALUES (
        'fixture-hash-made-by',
        'fixture-hash-pen',
        'fixture-hash-brand',
        'made_by',
        'canonical maker'
      )
    `);
    await client.execute(`
      INSERT INTO source_registry (
        id, name, source_type, allowed_use, reliability, license, fetch_method
      ) VALUES (
        'fixture-hash-source',
        'Fixture Source',
        'official',
        'summary_only',
        'official_marketing',
        'fixture-license',
        'manual'
      )
    `);

    const itemOrder = reverse ? ["b", "a"] : ["a", "b"];
    for (const suffix of itemOrder) {
      const rawMetadata = reverse
        ? '{"tags":["two","one"],"kind":"fixture"}'
        : '{"kind":"fixture","tags":["one","two"]}';
      await client.execute({
        sql: `
          INSERT INTO source_items (
            id, source_id, title, url, raw_metadata_json, allowed_use, review_status
          ) VALUES (?, 'fixture-hash-source', ?, ?, ?, 'summary_only', 'approved')
        `,
        args: [
          `fixture-hash-item-${suffix}`,
          `Item ${suffix}`,
          `https://example.invalid/hash-${suffix}`,
          rawMetadata,
        ],
      });
    }

    const variantOrder = reverse ? ["b", "a"] : ["a", "b"];
    for (const suffix of variantOrder) {
      await client.execute({
        sql: `
          INSERT INTO model_variants (
            id, model_entity_id, variant_name, source_item_id, review_status
          ) VALUES (?, 'fixture-hash-pen', ?, ?, 'approved')
        `,
        args: [
          `fixture-hash-variant-${suffix}`,
          `Variant ${suffix}`,
          `fixture-hash-item-${suffix}`,
        ],
      });
      await client.execute({
        sql: `
          INSERT INTO entity_references (
            id, entity_id, source_item_id, relation_type, review_status
          ) VALUES (?, 'fixture-hash-pen', ?, 'official', 'approved')
        `,
        args: [
          `fixture-hash-reference-${suffix}`,
          `fixture-hash-item-${suffix}`,
        ],
      });
    }

    const hash = await computePublicationContentHash(client, "fixture-hash-pen");
    const payload = await readPublicationContentPayload(
      client,
      "fixture-hash-pen",
    ) as { sourceItems?: unknown[] };
    await client.execute(
      "UPDATE entities SET summary = 'critical hash change' WHERE id = 'fixture-hash-pen'",
    );
    return {
      hash,
      changedHash: await computePublicationContentHash(client, "fixture-hash-pen"),
      sourceCount: payload.sourceItems?.length ?? -1,
    };
  });
}

async function runLegacyInvalidationContract(): Promise<void> {
  const forwardHash = await hashFixture(false);
  const reverseHash = await hashFixture(true);
  assertCondition(
    forwardHash.hash === reverseHash.hash,
    `Canonical hash changed with row order/Unicode/newlines: ${forwardHash.hash} != ${reverseHash.hash}.`,
  );
  assertCondition(
    forwardHash.hash !== forwardHash.changedHash,
    "A publication-critical entity edit did not change the canonical hash.",
  );
  assertCondition(
    forwardHash.sourceCount === 2 && reverseHash.sourceCount === 2,
    "Canonical payload did not deduplicate source items reached by multiple paths.",
  );

  await withFixture(async ({ client }) => {
    const mutations = { count: 0 };

    const entityId = "fixture-invalidation-entities";
    await createPublishedBrand(client, entityId);
    await insertEntity(client, "fixture-invalidation-entity-insert", "brand");
    mutations.count += 1;
    await assertPublicationReset(client, "fixture-invalidation-entity-insert", 1);
    await assertInvalidatingMutation(
      client,
      entityId,
      "entities UPDATE",
      mutations,
      () => client.execute(`UPDATE entities SET summary = 'changed' WHERE id = '${entityId}'`),
    );
    await forceReviewedPublication(client, entityId);
    await client.execute({
      sql: "DELETE FROM entities WHERE id = ?",
      args: [entityId],
    });
    mutations.count += 1;
    const deletedEntity = await client.execute({
      sql: "SELECT 1 FROM entity_publications WHERE entity_id = ?",
      args: [entityId],
    });
    assertCondition(deletedEntity.rows.length === 0, "entities DELETE left publication state behind.");
    await assertNotPublic(client, entityId);

    const storyEntity = "fixture-invalidation-stories";
    await createPublishedBrand(client, storyEntity);
    await assertInvalidatingMutation(client, storyEntity, "stories INSERT", mutations, () =>
      client.execute(`
        INSERT INTO stories (id, entity_id, title, story_type, body_md, status)
        VALUES ('fixture-aux-story', '${storyEntity}', 'Aux', 'overview', 'Aux', 'draft')
      `));
    await forceReviewedPublication(client, storyEntity);
    await assertInvalidatingMutation(client, storyEntity, "stories UPDATE", mutations, () =>
      client.execute("UPDATE stories SET body_md = 'Aux changed' WHERE id = 'fixture-aux-story'"));
    await forceReviewedPublication(client, storyEntity);
    await assertInvalidatingMutation(client, storyEntity, "stories DELETE", mutations, () =>
      client.execute("DELETE FROM stories WHERE id = 'fixture-aux-story'"));

    const specEntity = "fixture-invalidation-specs";
    await createPublishedBrand(client, specEntity);
    await assertInvalidatingMutation(client, specEntity, "model_specs INSERT", mutations, () =>
      client.execute(`
        INSERT INTO model_specs (id, entity_id, series_name, review_status)
        VALUES ('fixture-spec', '${specEntity}', 'Series', 'approved')
      `));
    await forceReviewedPublication(client, specEntity);
    await assertInvalidatingMutation(client, specEntity, "model_specs UPDATE", mutations, () =>
      client.execute("UPDATE model_specs SET series_name = 'Series 2' WHERE id = 'fixture-spec'"));
    await forceReviewedPublication(client, specEntity);
    await assertInvalidatingMutation(client, specEntity, "model_specs DELETE", mutations, () =>
      client.execute("DELETE FROM model_specs WHERE id = 'fixture-spec'"));

    const variantEntity = "fixture-invalidation-variants";
    await createPublishedBrand(client, variantEntity);
    await assertInvalidatingMutation(client, variantEntity, "model_variants INSERT", mutations, () =>
      client.execute(`
        INSERT INTO model_variants (id, model_entity_id, variant_name, review_status)
        VALUES ('fixture-variant', '${variantEntity}', 'Variant', 'approved')
      `));
    await forceReviewedPublication(client, variantEntity);
    await assertInvalidatingMutation(client, variantEntity, "model_variants UPDATE", mutations, () =>
      client.execute("UPDATE model_variants SET notes = 'changed' WHERE id = 'fixture-variant'"));
    await forceReviewedPublication(client, variantEntity);
    await assertInvalidatingMutation(client, variantEntity, "model_variants DELETE", mutations, () =>
      client.execute("DELETE FROM model_variants WHERE id = 'fixture-variant'"));

    const claimEntity = "fixture-invalidation-claims";
    await createPublishedBrand(client, claimEntity);
    await assertInvalidatingMutation(client, claimEntity, "claims INSERT", mutations, () =>
      client.execute(`
        INSERT INTO claims (id, subject_entity_id, predicate, object_text, review_status)
        VALUES ('fixture-claim', '${claimEntity}', 'has_fact', 'fact', 'approved')
      `));
    await forceReviewedPublication(client, claimEntity);
    await assertInvalidatingMutation(client, claimEntity, "claims UPDATE", mutations, () =>
      client.execute("UPDATE claims SET object_text = 'changed fact' WHERE id = 'fixture-claim'"));
    await forceReviewedPublication(client, claimEntity);
    await assertInvalidatingMutation(client, claimEntity, "claims DELETE", mutations, () =>
      client.execute("DELETE FROM claims WHERE id = 'fixture-claim'"));

    await insertFixtureSource(client, "fixture-citation-source", "fixture-citation-item");
    const citationEntity = "fixture-invalidation-citations";
    await createPublishedBrand(client, citationEntity);
    await assertInvalidatingMutation(client, citationEntity, "citations INSERT", mutations, () =>
      client.execute(`
        INSERT INTO citations (id, target_type, target_id, source_item_id, note)
        VALUES ('fixture-citation', 'entity', '${citationEntity}', 'fixture-citation-item', 'note')
      `));
    await forceReviewedPublication(client, citationEntity);
    await assertInvalidatingMutation(client, citationEntity, "citations UPDATE", mutations, () =>
      client.execute("UPDATE citations SET note = 'changed' WHERE id = 'fixture-citation'"));
    await forceReviewedPublication(client, citationEntity);
    await assertInvalidatingMutation(client, citationEntity, "citations DELETE", mutations, () =>
      client.execute("DELETE FROM citations WHERE id = 'fixture-citation'"));

    const sourceItemEntity = "fixture-invalidation-source-items";
    await createPublishedBrand(client, sourceItemEntity);
    await insertFixtureSource(client, "fixture-item-source", "fixture-linked-item");
    await client.execute(`
      INSERT INTO entity_references (id, entity_id, source_item_id, review_status)
      VALUES ('fixture-item-reference', '${sourceItemEntity}', 'fixture-linked-item', 'approved')
    `);
    await forceReviewedPublication(client, sourceItemEntity);
    await assertNeutralMutation(client, sourceItemEntity, "source_items INSERT", mutations, () =>
      client.execute(`
        INSERT INTO source_items (id, source_id, title, url, review_status)
        VALUES ('fixture-unowned-item', 'fixture-item-source', 'Unowned', 'https://example.invalid/unowned', 'approved')
      `));
    await assertInvalidatingMutation(client, sourceItemEntity, "source_items UPDATE", mutations, () =>
      client.execute("UPDATE source_items SET allowed_use = 'link_only' WHERE id = 'fixture-linked-item'"));
    await forceReviewedPublication(client, sourceItemEntity);
    await assertInvalidatingMutation(client, sourceItemEntity, "source_items DELETE", mutations, () =>
      client.execute("DELETE FROM source_items WHERE id = 'fixture-linked-item'"));

    const registryEntity = "fixture-invalidation-source-registry";
    await createPublishedBrand(client, registryEntity);
    await insertFixtureSource(client, "fixture-linked-registry", "fixture-registry-item");
    await client.execute(`
      INSERT INTO entity_references (id, entity_id, source_item_id, review_status)
      VALUES ('fixture-registry-reference', '${registryEntity}', 'fixture-registry-item', 'approved')
    `);
    await forceReviewedPublication(client, registryEntity);
    await assertNeutralMutation(client, registryEntity, "source_registry INSERT", mutations, () =>
      client.execute(`
        INSERT INTO source_registry (id, name, source_type, allowed_use, reliability)
        VALUES ('fixture-unowned-registry', 'Unowned', 'official', 'link_only', 'medium')
      `));
    await assertInvalidatingMutation(client, registryEntity, "source_registry UPDATE", mutations, () =>
      client.execute("UPDATE source_registry SET reliability = 'technical_primary' WHERE id = 'fixture-linked-registry'"));
    await forceReviewedPublication(client, registryEntity);
    await assertInvalidatingMutation(client, registryEntity, "source_registry DELETE", mutations, () =>
      client.execute("DELETE FROM source_registry WHERE id = 'fixture-linked-registry'"));

    await insertFixtureSource(client, "fixture-reference-source", "fixture-reference-item");
    const referenceEntity = "fixture-invalidation-references";
    await createPublishedBrand(client, referenceEntity);
    await assertInvalidatingMutation(client, referenceEntity, "entity_references INSERT", mutations, () =>
      client.execute(`
        INSERT INTO entity_references (id, entity_id, source_item_id, note, review_status)
        VALUES ('fixture-reference', '${referenceEntity}', 'fixture-reference-item', 'note', 'approved')
      `));
    await forceReviewedPublication(client, referenceEntity);
    await assertInvalidatingMutation(client, referenceEntity, "entity_references UPDATE", mutations, () =>
      client.execute("UPDATE entity_references SET note = 'changed' WHERE id = 'fixture-reference'"));
    await forceReviewedPublication(client, referenceEntity);
    await assertInvalidatingMutation(client, referenceEntity, "entity_references DELETE", mutations, () =>
      client.execute("DELETE FROM entity_references WHERE id = 'fixture-reference'"));

    const timelineEntity = "fixture-invalidation-timeline";
    await createPublishedBrand(client, timelineEntity);
    await assertInvalidatingMutation(client, timelineEntity, "timeline_events INSERT", mutations, () =>
      client.execute(`
        INSERT INTO timeline_events (
          id, entity_id, title, event_type, start_date, review_status
        ) VALUES (
          'fixture-event', '${timelineEntity}', 'Founded', 'brand_founded', '2000', 'approved'
        )
      `));
    await forceReviewedPublication(client, timelineEntity);
    await assertInvalidatingMutation(client, timelineEntity, "timeline_events UPDATE", mutations, () =>
      client.execute("UPDATE timeline_events SET description = 'changed' WHERE id = 'fixture-event'"));
    await forceReviewedPublication(client, timelineEntity);
    await assertInvalidatingMutation(client, timelineEntity, "timeline_events DELETE", mutations, () =>
      client.execute("DELETE FROM timeline_events WHERE id = 'fixture-event'"));

    const mediaEntity = "fixture-invalidation-media";
    await createPublishedBrand(client, mediaEntity);
    await assertInvalidatingMutation(client, mediaEntity, "media_assets INSERT", mutations, () =>
      client.execute(`
        INSERT INTO media_assets (
          id, entity_id, title, image_url, license, review_status, usage_status
        ) VALUES (
          'fixture-media', '${mediaEntity}', 'Primary', 'https://example.invalid/image.jpg',
          'fixture-license', 'approved', 'primary'
        )
      `));
    await forceReviewedPublication(client, mediaEntity);
    await assertInvalidatingMutation(client, mediaEntity, "media_assets UPDATE", mutations, () =>
      client.execute("UPDATE media_assets SET attribution_text = 'changed' WHERE id = 'fixture-media'"));
    await forceReviewedPublication(client, mediaEntity);
    await assertInvalidatingMutation(client, mediaEntity, "media_assets DELETE", mutations, () =>
      client.execute("DELETE FROM media_assets WHERE id = 'fixture-media'"));

    await createPublishedBrand(client, "fixture-link-brand");
    await insertEntity(client, "fixture-link-pen", "pen");
    await insertStory(client, "fixture-link-pen", "model_story");
    await client.execute(`
      INSERT INTO entity_links (id, source_id, target_id, link_type, reason)
      VALUES ('fixture-made-by', 'fixture-link-pen', 'fixture-link-brand', 'made_by', 'maker')
    `);
    await forceReviewedPublication(client, "fixture-link-pen");
    await insertEntity(client, "fixture-link-draft-pen", "pen");
    const draftBefore = await publicationState(client, "fixture-link-draft-pen");
    await client.execute(`
      INSERT INTO entity_links (id, source_id, target_id, link_type)
      VALUES ('fixture-draft-made-by', 'fixture-link-draft-pen', 'fixture-link-brand', 'made_by')
    `);
    mutations.count += 1;
    const draftAfter = await publicationState(client, "fixture-link-draft-pen");
    assertCondition(
      draftAfter.revision > draftBefore.revision && draftAfter.status === "draft",
      "entity_links INSERT did not invalidate its draft pen without changing workflow state.",
    );
    await assertInvalidatingMutation(client, "fixture-link-pen", "entity_links UPDATE", mutations, () =>
      client.execute("UPDATE entity_links SET reason = 'changed maker' WHERE id = 'fixture-made-by'"));
    await forceReviewedPublication(client, "fixture-link-pen");
    await assertInvalidatingMutation(client, "fixture-link-pen", "entity_links DELETE", mutations, () =>
      client.execute("DELETE FROM entity_links WHERE id = 'fixture-made-by'"));

    assertCondition(
      mutations.count === 36,
      `Expected 36 critical I/U/D mutations, observed ${mutations.count}.`,
    );
  });

  console.log(
    "Publication invalidation contract passed: canonical hash is order/NFC/newline stable, critical edits change it, and the 12-table 36-mutation fan-out matrix is fail-closed.",
  );
}

async function approveCurrentContentAndPublish(
  client: Client,
  entityId: string,
): Promise<string> {
  let contentHash: string | null = null;
  for (const reviewKind of ["fact", "language", "media"] as const) {
    const review = await recordEntityContentReview(client, {
      entityId,
      reviewKind,
      reviewer: `phase19-${reviewKind}-reviewer`,
      status: "approved",
      notes: "Fixed contract-v2 invalidation fixture review.",
    });
    contentHash ??= review.contentHash;
    assertCondition(
      review.contentHash === contentHash,
      `${entityId} content changed while recording independent reviews.`,
    );
  }
  const published = await publishEntity(client, {
    entityId,
    reviewer: "phase19-publication-reviewer",
  });
  assertCondition(
    published.contentHash === contentHash,
    `${entityId} publication used a different hash than its content reviews.`,
  );
  await assertPublic(client, entityId);
  return published.contentHash;
}

async function assertV2InvalidatingMutation(
  client: Client,
  entityId: string,
  label: string,
  counter: { count: number },
  mutate: () => Promise<unknown>,
): Promise<void> {
  const before = await publicationState(client, entityId);
  const beforeHash = await computePublicationContentHash(client, entityId);
  assertCondition(
    before.status === "published" && before.approvedHash === beforeHash,
    `${label} fixture was not current-hash published.`,
  );
  await mutate();
  counter.count += 1;
  const after = await publicationState(client, entityId);
  const afterHash = await computePublicationContentHash(client, entityId);
  assertCondition(
    after.revision > before.revision,
    `${label} did not advance content_revision.`,
  );
  assertCondition(
    after.status === "in_review" && after.approvedHash === before.approvedHash,
    `${label} did not retain the stale audit hash while demoting publication.`,
  );
  assertCondition(afterHash !== beforeHash, `${label} did not change sha256:v2.`);
  await assertNotPublic(client, entityId);
  await expectReject(
    () =>
      publishEntity(client, {
        entityId,
        reviewer: "phase19-stale-review-check",
      }),
    "current-hash reviews missing",
  );
  await approveCurrentContentAndPublish(client, entityId);
}

async function runInvalidationContract(): Promise<void> {
  await withPhase19Fixture(async ({ client }) => {
    const mutations = { count: 0 };
    const brand = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-invalidation-brand",
      entityType: "brand",
    });
    await approveCurrentContentAndPublish(client, brand.entityId);

    for (const [label, sql, id] of [
      [
        "entities canonical content UPDATE",
        "UPDATE entities SET summary = summary || ':updated' WHERE id = ?",
        brand.entityId,
      ],
      [
        "stories canonical content UPDATE",
        "UPDATE stories SET body_md = body_md || ':updated' WHERE id = ?",
        brand.storyId,
      ],
      [
        "entity_references canonical content UPDATE",
        "UPDATE entity_references SET note = note || ':updated' WHERE id = ?",
        brand.referenceId,
      ],
      [
        "timeline_events canonical content UPDATE",
        "UPDATE timeline_events SET description = description || ':updated' WHERE id = ?",
        brand.timelineId,
      ],
    ] as const) {
      await assertV2InvalidatingMutation(
        client,
        brand.entityId,
        label,
        mutations,
        () => client.execute({ sql, args: [id] }),
      );
    }

    const extraScopeId = `${brand.entityId}-scope-extra`;
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "fact_scopes INSERT",
      mutations,
      () =>
        client.execute({
          sql: `
            INSERT INTO fact_scopes (
              id, entity_id, scope_key, market, production_state
            ) VALUES (?, ?, 'global-historical', 'global', 'historical')
          `,
          args: [extraScopeId, brand.entityId],
        }),
    );
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "citation/claim_evidence scope rebind",
      mutations,
      () =>
        client.batch(
          [
            {
              sql: "UPDATE citations SET scope_id = ? WHERE id = ?",
              args: [extraScopeId, brand.primaryCitationId],
            },
            {
              sql: "UPDATE claim_evidence SET scope_id = ? WHERE id = ?",
              args: [extraScopeId, brand.primaryClaimEvidenceId],
            },
          ],
          "write",
        ),
    );
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "claims.fact_class UPDATE",
      mutations,
      () =>
        client.execute({
          sql: "UPDATE claims SET fact_class = 'editorial' WHERE id = ?",
          args: [brand.mirrorClaimId],
        }),
    );
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "claim_evidence UPDATE",
      mutations,
      () =>
        client.execute({
          sql: "UPDATE claim_evidence SET evidence_locator = evidence_locator || ':updated' WHERE id = ?",
          args: [brand.mirrorClaimEvidenceId],
        }),
    );
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "claim_evidence DELETE",
      mutations,
      () =>
        client.execute({
          sql: "DELETE FROM claim_evidence WHERE id = ?",
          args: [brand.mirrorClaimEvidenceId],
        }),
    );
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "claim_evidence INSERT",
      mutations,
      () =>
        client.execute({
          sql: `
            INSERT INTO claim_evidence (
              id, claim_id, citation_id, scope_id, evidence_locator,
              review_status
            ) VALUES (?, ?, ?, ?, 'mapping-locator:restored', 'approved')
          `,
          args: [
            brand.mirrorClaimEvidenceId,
            brand.mirrorClaimId,
            brand.mirrorCitationId,
            brand.scopeId,
          ],
        }),
    );

    const auxiliaryCitationId = `${brand.entityId}-citation-auxiliary`;
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "citations INSERT",
      mutations,
      () =>
        client.execute({
          sql: `
            INSERT INTO citations (
              id, target_type, target_id, source_item_id, note,
              review_status, evidence_locator, scope_id
            ) VALUES (?, 'entity', ?, ?, 'auxiliary citation',
                      'approved', 'auxiliary:1', ?)
          `,
          args: [
            auxiliaryCitationId,
            brand.entityId,
            brand.mirrorItemId,
            brand.scopeId,
          ],
        }),
    );
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "citations UPDATE",
      mutations,
      () =>
        client.execute({
          sql: "UPDATE citations SET evidence_locator = 'auxiliary:2' WHERE id = ?",
          args: [auxiliaryCitationId],
        }),
    );
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "citations DELETE",
      mutations,
      () =>
        client.execute({
          sql: "DELETE FROM citations WHERE id = ?",
          args: [auxiliaryCitationId],
        }),
    );

    for (const [label, sql] of [
      [
        "source_items.source_tier UPDATE",
        "UPDATE source_items SET source_tier = 'contemporary_archive' WHERE id = ?",
      ],
      [
        "source_items.independence_group UPDATE",
        "UPDATE source_items SET independence_group = independence_group || '-updated' WHERE id = ?",
      ],
      [
        "source_items.archive_url UPDATE",
        "UPDATE source_items SET archive_url = archive_url || '?v=2' WHERE id = ?",
      ],
      [
        "source_items.archive_locator UPDATE",
        "UPDATE source_items SET archive_locator = archive_locator || ':v2' WHERE id = ?",
      ],
      [
        "source_items.allowed_use UPDATE",
        "UPDATE source_items SET allowed_use = 'metadata_only' WHERE id = ?",
      ],
      [
        "source_items.retrieved_at UPDATE",
        "UPDATE source_items SET retrieved_at = '2026-07-17' WHERE id = ?",
      ],
    ] as const) {
      await assertV2InvalidatingMutation(
        client,
        brand.entityId,
        label,
        mutations,
        () =>
          client.execute({
            sql,
            args: [brand.primaryItemId],
          }),
      );
    }
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "source_registry provenance UPDATE",
      mutations,
      () =>
        client.execute({
          sql: `
            UPDATE source_registry
            SET default_source_tier = 'contemporary_archive',
                default_independence_group = default_independence_group || '-updated'
            WHERE id = ?
          `,
          args: [brand.primaryRegistryId],
        }),
    );
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "fact_conflicts UPDATE",
      mutations,
      () =>
        client.execute({
          sql: "UPDATE fact_conflicts SET resolution_note = resolution_note || ':updated' WHERE id = ?",
          args: [brand.conflictId],
        }),
    );
    const additionalMemberId = `${brand.entityId}-conflict-member-extra`;
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "fact_conflict_members INSERT",
      mutations,
      () =>
        client.execute({
          sql: `
            INSERT INTO fact_conflict_members (
              id, conflict_id, citation_id, asserted_value
            ) VALUES (?, ?, ?, '2025')
          `,
          args: [additionalMemberId, brand.conflictId, brand.secondaryCitationId],
        }),
    );
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "fact_conflict_members UPDATE",
      mutations,
      () =>
        client.execute({
          sql: "UPDATE fact_conflict_members SET asserted_value = '2024' WHERE id = ?",
          args: [additionalMemberId],
        }),
    );
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "fact_conflict_members DELETE",
      mutations,
      () =>
        client.execute({
          sql: "DELETE FROM fact_conflict_members WHERE id = ?",
          args: [additionalMemberId],
        }),
    );
    const additionalConflictId = `${brand.entityId}-conflict-extra`;
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "fact_conflicts INSERT",
      mutations,
      () =>
        client.execute({
          sql: `
            INSERT INTO fact_conflicts (
              id, entity_id, field_key, scope_id, conflict_kind,
              status, resolution_note
            ) VALUES (?, ?, 'material', ?, 'field', 'resolved', 'resolved')
          `,
          args: [additionalConflictId, brand.entityId, brand.scopeId],
        }),
    );
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "fact_conflicts second UPDATE",
      mutations,
      () =>
        client.execute({
          sql: "UPDATE fact_conflicts SET status = 'dismissed', resolution_note = 'dismissed' WHERE id = ?",
          args: [additionalConflictId],
        }),
    );
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "fact_conflicts DELETE",
      mutations,
      () =>
        client.execute({
          sql: "DELETE FROM fact_conflicts WHERE id = ?",
          args: [additionalConflictId],
        }),
    );
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "approved reusable primary media UPDATE",
      mutations,
      () =>
        client.execute({
          sql: "UPDATE media_assets SET title = title || ':updated', license = 'cc-by-4.0' WHERE id = ?",
          args: [brand.mediaId],
        }),
    );

    const extraRegistryId = `${brand.entityId}-registry-extra`;
    const extraItemId = `${brand.entityId}-item-extra`;
    const extraReferenceId = `${brand.entityId}-reference-extra`;
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "owned source item INSERT",
      mutations,
      () =>
        client.batch(
          [
            {
              sql: `
                INSERT INTO source_registry (
                  id, name, source_type, allowed_use, reliability
                ) VALUES (?, 'Extra registry', 'book', 'summary_only', 'medium')
              `,
              args: [extraRegistryId],
            },
            {
              sql: `
                INSERT INTO source_items (
                  id, source_id, title, url, retrieved_at, allowed_use,
                  review_status, source_tier, independence_group,
                  archive_url, archive_locator
                ) VALUES (?, ?, 'Extra item', ?, '2026-07-16',
                          'summary_only', 'approved', 'community', ?, ?, 'snapshot:extra')
              `,
              args: [
                extraItemId,
                extraRegistryId,
                `https://example.invalid/${extraItemId}`,
                `${brand.entityId}-extra`,
                `https://archive.invalid/${extraItemId}`,
              ],
            },
            {
              sql: `
                INSERT INTO entity_references (
                  id, entity_id, source_item_id, relation_type, review_status
                ) VALUES (?, ?, ?, 'community', 'approved')
              `,
              args: [extraReferenceId, brand.entityId, extraItemId],
            },
          ],
          "write",
        ),
    );
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "owned source item UPDATE",
      mutations,
      () =>
        client.execute({
          sql: "UPDATE source_items SET archive_locator = 'snapshot:extra-updated' WHERE id = ?",
          args: [extraItemId],
        }),
    );
    await assertV2InvalidatingMutation(
      client,
      brand.entityId,
      "owned source item DELETE",
      mutations,
      () =>
        client.execute({
          sql: "DELETE FROM source_items WHERE id = ?",
          args: [extraItemId],
        }),
    );

    const pen = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-invalidation-pen",
      entityType: "pen",
      brandEntityId: brand.entityId,
    });
    await approveCurrentContentAndPublish(client, pen.entityId);
    assertCondition(
      pen.primarySpecEvidenceId &&
        pen.secondarySpecEvidenceId &&
        pen.secondarySpecCitationId &&
        pen.modelSpecId,
      "Qualified pen fixture omitted spec evidence IDs.",
    );
    for (const [label, sql, id] of [
      [
        "model_specs canonical content UPDATE",
        "UPDATE model_specs SET nib = '14k fine' WHERE id = ?",
        pen.modelSpecId,
      ],
      [
        "model_variants canonical content UPDATE",
        "UPDATE model_variants SET notes = notes || ':updated' WHERE id = ?",
        pen.variantId,
      ],
      [
        "made_by canonical content UPDATE",
        "UPDATE entity_links SET reason = reason || ':updated' WHERE id = ?",
        pen.madeById,
      ],
    ] as const) {
      assertCondition(id, `${label} fixture ID is missing.`);
      await assertV2InvalidatingMutation(
        client,
        pen.entityId,
        label,
        mutations,
        () => client.execute({ sql, args: [id] }),
      );
    }
    await assertV2InvalidatingMutation(
      client,
      pen.entityId,
      "spec_field_evidence UPDATE",
      mutations,
      () =>
        client.execute({
          sql: "UPDATE spec_field_evidence SET evidence_locator = evidence_locator || ':updated' WHERE id = ?",
          args: [pen.primarySpecEvidenceId],
        }),
    );
    await assertV2InvalidatingMutation(
      client,
      pen.entityId,
      "spec_field_evidence DELETE",
      mutations,
      () =>
        client.execute({
          sql: "DELETE FROM spec_field_evidence WHERE id = ?",
          args: [pen.secondarySpecEvidenceId],
        }),
    );
    await assertV2InvalidatingMutation(
      client,
      pen.entityId,
      "spec_field_evidence INSERT",
      mutations,
      () =>
        client.execute({
          sql: `
            INSERT INTO spec_field_evidence (
              id, model_spec_id, field_key, citation_id, scope_id,
              evidence_locator, review_status
            ) VALUES (?, ?, 'nib', ?, ?, 'spec-mapping:restored', 'approved')
          `,
          args: [
            pen.secondarySpecEvidenceId,
            pen.modelSpecId,
            pen.secondarySpecCitationId,
            pen.scopeId,
          ],
        }),
    );

    const crossOwner = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-cross-owner-brand",
      entityType: "brand",
    });
    await approveCurrentContentAndPublish(client, crossOwner.entityId);
    const sharedClaimId = "phase19-cross-owner-editorial-claim";
    await client.execute({
      sql: `
        INSERT INTO claims (
          id, subject_entity_id, predicate, object_text, source_item_id,
          review_status, fact_class
        ) VALUES (?, ?, 'shared_editorial_fact', 'before', ?, 'approved', 'editorial')
      `,
      args: [sharedClaimId, brand.entityId, brand.primaryItemId],
    });
    await client.execute({
      sql: `
        INSERT INTO citations (
          id, target_type, target_id, source_item_id, claim_id, note,
          review_status, evidence_locator, scope_id
        ) VALUES (
          'phase19-cross-owner-citation', 'entity', ?, ?, ?, 'shared owner',
          'approved', 'shared:1', ?
        )
      `,
      args: [
        crossOwner.entityId,
        crossOwner.primaryItemId,
        sharedClaimId,
        crossOwner.scopeId,
      ],
    });
    await approveCurrentContentAndPublish(client, brand.entityId);
    await approveCurrentContentAndPublish(client, crossOwner.entityId);
    const directBefore = await publicationState(client, brand.entityId);
    const indirectBefore = await publicationState(client, crossOwner.entityId);
    await client.execute({
      sql: "UPDATE claims SET object_text = 'after' WHERE id = ?",
      args: [sharedClaimId],
    });
    mutations.count += 1;
    const directAfter = await publicationState(client, brand.entityId);
    const indirectAfter = await publicationState(client, crossOwner.entityId);
    assertCondition(
      directAfter.revision > directBefore.revision &&
        indirectAfter.revision > indirectBefore.revision &&
        directAfter.status === "in_review" &&
        indirectAfter.status === "in_review",
      "Cross-owner claim mutation did not invalidate both direct and citation-derived owners.",
    );
    await assertNotPublic(client, brand.entityId);
    await assertNotPublic(client, crossOwner.entityId);

    assertCondition(
      mutations.count === 38,
      `Expected 38 contract-v2 invalidation mutations, observed ${mutations.count}.`,
    );
  });
  console.log(
    "Publication invalidation contract passed: 38 legacy+v2 payload dependency mutations demote current publications, standalone deletes revoke stale reviews, and cross-owner claims invalidate every owner.",
  );
}

async function publicationSnapshot(client: Client, entityId: string): Promise<string> {
  const result = await client.execute({
    sql: `
      SELECT entity_id, status, depth_tier, quality_score, blockers_json,
             approved_content_hash, content_revision, reviewed_content_revision,
             reviewed_contract_version, reviewed_by, reviewed_at, published_at,
             review_notes, created_at, updated_at
      FROM entity_publications
      WHERE entity_id = ?
    `,
    args: [entityId],
  });
  return JSON.stringify(result.rows[0] ?? null);
}

async function stageDirectReview(
  client: Client,
  entityId: string,
  options: {
    revisionOffset?: number;
    contractVersion?: number;
    reviewer?: string | null;
    reviewedAt?: string | null;
    publishedAt?: string | null;
  } = {},
): Promise<string> {
  const contentHash = await computePublicationContentHash(client, entityId);
  await client.execute({
    sql: `
      UPDATE entity_publications
      SET approved_content_hash = ?,
          reviewed_content_revision = content_revision + ?,
          reviewed_contract_version = ?,
          reviewed_by = ?,
          reviewed_at = ?,
          published_at = ?,
          updated_at = datetime('now')
      WHERE entity_id = ?
    `,
    args: [
      contentHash,
      options.revisionOffset ?? 0,
      options.contractVersion ?? 1,
      options.reviewer === undefined ? "direct-reviewer" : options.reviewer,
      options.reviewedAt === undefined
        ? "2026-07-15T02:00:00.000Z"
        : options.reviewedAt,
      options.publishedAt === undefined
        ? "2026-07-15T02:00:01.000Z"
        : options.publishedAt,
      entityId,
    ],
  });
  return contentHash;
}

async function runLegacyPublishContract(): Promise<void> {
  await withFixture(async ({ client }) => {
    await insertEntity(client, "fixture-no-publication", "article");
    await expectReject(
      () => publishEntity(client, {
        entityId: "fixture-no-publication",
        reviewer: "fixture-reviewer",
      }),
      "Publication row not found",
    );

    await insertEntity(client, "fixture-statuses", "brand");
    await insertStory(client, "fixture-statuses", "brand_story");
    await assertNotPublic(client, "fixture-statuses");
    for (const status of ["in_review", "retired", "draft"] as const) {
      await setEntityPublicationStatus(client, "fixture-statuses", status);
      assertCondition(
        (await publicationState(client, "fixture-statuses")).status === status,
        `setEntityPublicationStatus did not persist ${status}.`,
      );
      await assertNotPublic(client, "fixture-statuses");
    }
    await expectReject(
      () => setEntityPublicationStatus(
        client,
        "fixture-statuses",
        "published" as never,
      ),
      "Unsupported non-published publication status",
    );
    await setEntityPublicationStatus(client, "fixture-statuses", "retired");
    await publishEntity(client, {
      entityId: "fixture-statuses",
      reviewer: "fixture-reviewer",
    });
    await assertPublic(client, "fixture-statuses");

    await insertEntity(client, "fixture-rollback", "brand");
    const rollbackBefore = await publicationSnapshot(client, "fixture-rollback");
    let transactionCalls = 0;
    const countingClient = {
      transaction: (...args: Parameters<Client["transaction"]>) => {
        transactionCalls += 1;
        return client.transaction(...args);
      },
    } as Pick<Client, "transaction">;
    await expectReject(
      () => publishEntity(countingClient, {
        entityId: "fixture-rollback",
        reviewer: "fixture-reviewer",
      }),
      "missing_published_story",
    );
    assertCondition(transactionCalls === 1, `publishEntity retried its write ${transactionCalls} times.`);
    assertCondition(
      rollbackBefore === await publicationSnapshot(client, "fixture-rollback"),
      "Failed publish left partial review metadata instead of rolling back.",
    );
    await assertNotPublic(client, "fixture-rollback");

    await insertEntity(client, "fixture-direct-status", "brand");
    await insertStory(client, "fixture-direct-status", "brand_story");
    await expectReject(
      () => client.execute(
        "UPDATE entity_publications SET status = 'published' WHERE entity_id = 'fixture-direct-status'",
      ),
      "publication_guard: invalid approved content hash",
    );
    await expectReject(
      () => client.execute(
        "UPDATE entity_publications SET approved_content_hash = 'not-a-hash' WHERE entity_id = 'fixture-direct-status'",
      ),
      "CHECK constraint failed",
    );

    await insertEntity(client, "fixture-stale-revision", "brand");
    await insertStory(client, "fixture-stale-revision", "brand_story");
    await stageDirectReview(client, "fixture-stale-revision", { revisionOffset: -1 });
    await expectReject(
      () => client.execute(
        "UPDATE entity_publications SET status = 'published' WHERE entity_id = 'fixture-stale-revision'",
      ),
      "publication_guard: stale reviewed revision",
    );

    await insertEntity(client, "fixture-stale-contract", "brand");
    await insertStory(client, "fixture-stale-contract", "brand_story");
    await stageDirectReview(client, "fixture-stale-contract", { contractVersion: 2 });
    await expectReject(
      () => client.execute(
        "UPDATE entity_publications SET status = 'published' WHERE entity_id = 'fixture-stale-contract'",
      ),
      "publication_guard: stale contract version",
    );

    await insertEntity(client, "fixture-missing-reviewer", "brand");
    await insertStory(client, "fixture-missing-reviewer", "brand_story");
    await stageDirectReview(client, "fixture-missing-reviewer", { reviewer: null });
    await expectReject(
      () => client.execute(
        "UPDATE entity_publications SET status = 'published' WHERE entity_id = 'fixture-missing-reviewer'",
      ),
      "publication_guard: reviewer is required",
    );

    await insertEntity(client, "fixture-missing-published-at", "brand");
    await insertStory(client, "fixture-missing-published-at", "brand_story");
    await stageDirectReview(client, "fixture-missing-published-at", { publishedAt: null });
    await expectReject(
      () => client.execute(
        "UPDATE entity_publications SET status = 'published' WHERE entity_id = 'fixture-missing-published-at'",
      ),
      "publication_guard: published_at is required",
    );

    await insertEntity(client, "fixture-one-statement", "brand");
    await insertStory(client, "fixture-one-statement", "brand_story");
    const oneStatementHash = await computePublicationContentHash(
      client,
      "fixture-one-statement",
    );
    await expectReject(
      () => client.execute({
        sql: `
          UPDATE entity_publications
          SET status = 'published',
              approved_content_hash = ?,
              reviewed_content_revision = content_revision,
              reviewed_contract_version = 1,
              reviewed_by = 'direct-reviewer',
              reviewed_at = '2026-07-15T03:00:00.000Z',
              published_at = '2026-07-15T03:00:01.000Z'
          WHERE entity_id = 'fixture-one-statement'
        `,
        args: [oneStatementHash],
      }),
      "publication_guard: readiness blockers remain",
    );

    await insertEntity(client, "fixture-published-insert", "article");
    await expectReject(
      () => client.execute({
        sql: `
          INSERT INTO entity_publications (
            entity_id, status, approved_content_hash, content_revision,
            reviewed_content_revision, reviewed_contract_version,
            reviewed_by, reviewed_at, published_at
          ) VALUES (?, 'published', ?, 0, 0, 1, 'direct-reviewer', ?, ?)
        `,
        args: [
          "fixture-published-insert",
          VALID_HASH,
          "2026-07-15T04:00:00.000Z",
          "2026-07-15T04:00:01.000Z",
        ],
      }),
      "publication_guard: published insert requires an existing review row",
    );

    await insertEntity(client, "fixture-valid-brand", "brand");
    await insertStory(client, "fixture-valid-brand", "brand_story");
    const firstBrandPublish = await publishEntity(client, {
      entityId: "fixture-valid-brand",
      reviewer: "brand-reviewer",
    });
    assertCondition(
      /^sha256:v1:[0-9a-f]{64}$/.test(firstBrandPublish.contentHash),
      `publishEntity returned malformed hash: ${firstBrandPublish.contentHash}.`,
    );
    await assertPublic(client, "fixture-valid-brand");
    await client.execute(
      "UPDATE entities SET summary = 'reviewed content changed' WHERE id = 'fixture-valid-brand'",
    );
    const invalidatedBrand = await publicationState(client, "fixture-valid-brand");
    assertCondition(
      invalidatedBrand.status === "in_review" &&
        invalidatedBrand.approvedHash === firstBrandPublish.contentHash,
      "Critical edit did not preserve the stale hash while hiding the brand.",
    );
    await assertNotPublic(client, "fixture-valid-brand");
    const secondBrandPublish = await publishEntity(client, {
      entityId: "fixture-valid-brand",
      reviewer: "brand-reviewer-2",
    });
    assertCondition(
      secondBrandPublish.contentHash !== firstBrandPublish.contentHash,
      "Re-review after critical edit reused the stale content hash.",
    );
    await assertPublic(client, "fixture-valid-brand");

    await insertEntity(client, "fixture-valid-pen", "pen");
    await insertStory(client, "fixture-valid-pen", "model_story");
    await client.execute(`
      INSERT INTO entity_links (id, source_id, target_id, link_type)
      VALUES ('fixture-valid-pen-maker', 'fixture-valid-pen', 'fixture-valid-brand', 'made_by')
    `);
    await publishEntity(client, {
      entityId: "fixture-valid-pen",
      reviewer: "pen-reviewer",
    });
    await assertPublic(client, "fixture-valid-pen");

    await insertEntity(client, "fixture-private-brand", "brand");
    await insertStory(client, "fixture-private-brand", "brand_story");
    await insertEntity(client, "fixture-blocked-pen", "pen");
    await insertStory(client, "fixture-blocked-pen", "model_story");
    await client.execute(`
      INSERT INTO entity_links (id, source_id, target_id, link_type)
      VALUES ('fixture-blocked-pen-maker', 'fixture-blocked-pen', 'fixture-private-brand', 'made_by')
    `);
    const blockedPenBefore = await publicationSnapshot(client, "fixture-blocked-pen");
    await expectReject(
      () => publishEntity(client, {
        entityId: "fixture-blocked-pen",
        reviewer: "pen-reviewer",
      }),
      "made_by_brand_not_public",
    );
    assertCondition(
      blockedPenBefore === await publicationSnapshot(client, "fixture-blocked-pen"),
      "Blocked pen publish did not roll back review metadata.",
    );
    await assertNotPublic(client, "fixture-blocked-pen");
  });

  console.log(
    "Publication publish contract passed: non-public states stay hidden, direct SQL is DB-guarded, failures roll back without retry, and valid brand/pen publish atomically.",
  );
}

interface PublicationTransactionTrace {
  transactionCalls: number;
  events: string[];
}

function tracedPublicationClient(client: Client): {
  db: Pick<Client, "transaction">;
  trace: PublicationTransactionTrace;
} {
  const trace: PublicationTransactionTrace = {
    transactionCalls: 0,
    events: [],
  };
  const db: Pick<Client, "transaction"> = {
    async transaction(...args: Parameters<Client["transaction"]>) {
      trace.transactionCalls += 1;
      trace.events.push(`TRANSACTION:${String(args[0] ?? "write")}`);
      const transaction = await client.transaction(...args);
      return new Proxy(transaction, {
        get(target, property) {
          if (property === "execute") {
            return async (...executeArgs: Parameters<typeof target.execute>) => {
              const statement = executeArgs[0];
              const sql = typeof statement === "string"
                ? statement
                : String(statement.sql);
              trace.events.push(`SQL:${sql.replace(/\s+/g, " ").trim()}`);
              return target.execute(...executeArgs);
            };
          }
          if (property === "commit") {
            return async () => {
              trace.events.push("COMMIT");
              return target.commit();
            };
          }
          if (property === "rollback") {
            return async () => {
              trace.events.push("ROLLBACK");
              return target.rollback();
            };
          }
          const value = Reflect.get(target, property, target);
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
    },
  };
  return { db, trace };
}

function traceIndex(trace: PublicationTransactionTrace, fragment: string): number {
  return trace.events.findIndex((event) => event.includes(fragment));
}

function assertTraceOrder(
  trace: PublicationTransactionTrace,
  fragments: readonly string[],
  label: string,
): void {
  const indices = fragments.map((fragment) => traceIndex(trace, fragment));
  assertCondition(
    indices.every((index) => index >= 0) &&
      indices.every((index, position) => position === 0 || index > indices[position - 1]),
    `${label} transaction order mismatch: ${JSON.stringify(trace.events)}.`,
  );
}

async function recordV2FirstThreeReviews(
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
      notes: "Fixed publication transaction fixture review.",
    });
    contentHash ??= review.contentHash;
    assertCondition(
      review.contentHash === contentHash,
      `${entityId} changed while recording first-three reviews.`,
    );
  }
  return contentHash ?? computePublicationContentHash(client, entityId);
}

interface DirectSnapshotOptions {
  revisionOffset?: number;
  contractVersion?: number;
  reviewer?: string | null;
  reviewedAt?: string | null;
  includePublicationReview?: boolean;
}

async function stageDirectContract2Snapshot(
  client: Client,
  entityId: string,
  options: DirectSnapshotOptions = {},
): Promise<string> {
  const contentHash = await computePublicationContentHash(client, entityId);
  await client.execute({
    sql: `
      UPDATE entity_publications
      SET status = 'in_review',
          approved_content_hash = ?,
          reviewed_content_revision = content_revision + ?,
          reviewed_contract_version = ?,
          reviewed_by = ?,
          reviewed_at = ?,
          published_at = NULL,
          blockers_json = '[]'
      WHERE entity_id = ?
    `,
    args: [
      contentHash,
      options.revisionOffset ?? 0,
      options.contractVersion ?? 2,
      options.reviewer === undefined ? "direct-reviewer" : options.reviewer,
      options.reviewedAt === undefined
        ? "2026-07-16T00:00:00.000Z"
        : options.reviewedAt,
      entityId,
    ],
  });
  if (options.includePublicationReview !== false) {
    await client.execute({
      sql: `
        INSERT INTO entity_content_reviews (
          id, entity_id, review_kind, content_hash, status,
          reviewer, reviewed_at, note
        ) VALUES (?, ?, 'publication', ?, 'approved', 'direct-reviewer',
                  '2026-07-16T00:00:00.000Z', 'direct SQL fixture')
        ON CONFLICT(entity_id, review_kind, content_hash) DO UPDATE SET
          status = 'approved',
          reviewer = excluded.reviewer,
          reviewed_at = excluded.reviewed_at,
          note = excluded.note
      `,
      args: [
        `direct-publication-review-${entityId}`,
        entityId,
        contentHash,
      ],
    });
  }
  return contentHash;
}

async function v2BlockerCodes(
  client: Client,
  entityId: string,
): Promise<string[]> {
  const result = await client.execute({
    sql: `
      SELECT blocker_code
      FROM publication_blockers
      WHERE entity_id = ? AND contract_version = 2
      ORDER BY blocker_code, subject_type, subject_id, detail_key
    `,
    args: [entityId],
  });
  return result.rows.map((row) => String(row.blocker_code));
}

async function publicationReviewCount(
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

async function runDirectSqlContract2Matrix(): Promise<void> {
  for (const testCase of [
    "no-snapshot",
    "stale-hash",
    "stale-revision",
    "stale-contract",
    "missing-reviewer",
    "missing-reviewed-at",
    "missing-published-at",
    "missing-language-review",
    "missing-publication-review",
  ] as const) {
    await withPhase19Fixture(async ({ client }) => {
      const entity = await seedQualifiedPublicationFixture(client, {
        entityId: `phase19-direct-${testCase}`,
        entityType: "brand",
      });
      if (testCase !== "no-snapshot") {
        await recordV2FirstThreeReviews(client, entity.entityId);
        await stageDirectContract2Snapshot(client, entity.entityId, {
          revisionOffset: testCase === "stale-revision" ? -1 : 0,
          contractVersion: testCase === "stale-contract" ? 1 : 2,
          reviewer: testCase === "missing-reviewer" ? null : undefined,
          reviewedAt: testCase === "missing-reviewed-at" ? null : undefined,
          includePublicationReview: testCase !== "missing-publication-review",
        });
        if (testCase === "stale-hash") {
          await client.execute({
            sql: "UPDATE stories SET body_md = body_md || '\nchanged' WHERE id = ?",
            args: [entity.storyId],
          });
        } else if (testCase === "missing-language-review") {
          await client.execute({
            sql: `
              DELETE FROM entity_content_reviews
              WHERE entity_id = ? AND review_kind = 'language'
            `,
            args: [entity.entityId],
          });
        }
      }

      const expected = testCase === "no-snapshot"
        ? "publication_guard: invalid approved content hash"
        : testCase === "stale-hash" || testCase === "stale-revision"
          ? "publication_guard: stale reviewed revision"
          : testCase === "stale-contract"
            ? "publication_guard: stale contract version"
            : testCase === "missing-reviewer"
              ? "publication_guard: reviewer is required"
              : testCase === "missing-reviewed-at"
                ? "publication_guard: reviewed_at is required"
                : testCase === "missing-published-at"
                  ? "publication_guard: published_at is required"
                  : "publication_guard: readiness blockers remain";
      await expectReject(
        () =>
          client.execute({
            sql: testCase === "missing-published-at"
              ? "UPDATE entity_publications SET status = 'published' WHERE entity_id = ?"
              : `
                  UPDATE entity_publications
                  SET status = 'published',
                      published_at = '2026-07-16T00:00:01.000Z'
                  WHERE entity_id = ?
                `,
            args: [entity.entityId],
          }),
        expected,
      );
      await assertNotPublic(client, entity.entityId);
    });
  }

  await withPhase19Fixture(async ({ client }) => {
    const entity = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-direct-invalid-hash",
      entityType: "brand",
    });
    await expectReject(
      () =>
        client.execute({
          sql: "UPDATE entity_publications SET approved_content_hash = 'not-a-hash' WHERE entity_id = ?",
          args: [entity.entityId],
        }),
      "CHECK constraint failed",
    );
  });

  await withPhase19Fixture(async ({ client }) => {
    const brand = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-immutable-id-brand",
      entityType: "brand",
    });
    await approveCurrentContentAndPublish(client, brand.entityId);
    const pen = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-immutable-id-pen",
      entityType: "pen",
      brandEntityId: brand.entityId,
    });
    await approveCurrentContentAndPublish(client, pen.entityId);
    assertCondition(
      pen.modelSpecId &&
        pen.variantId &&
        pen.primarySpecEvidenceId &&
        pen.madeById,
      "Immutable-ID pen fixture omitted required identifiers.",
    );
    const brandSnapshot = await publicationSnapshot(client, brand.entityId);
    const penSnapshot = await publicationSnapshot(client, pen.entityId);
    const brandHash = await computePublicationContentHash(client, brand.entityId);
    const penHash = await computePublicationContentHash(client, pen.entityId);
    for (const guard of [
      { table: "entities", column: "id", id: brand.entityId },
      { table: "stories", column: "id", id: brand.storyId },
      { table: "model_specs", column: "id", id: pen.modelSpecId },
      { table: "model_variants", column: "id", id: pen.variantId },
      { table: "claims", column: "id", id: brand.primaryClaimId },
      { table: "citations", column: "id", id: brand.primaryCitationId },
      { table: "source_items", column: "id", id: brand.primaryItemId },
      {
        table: "source_registry",
        column: "id",
        id: brand.primaryRegistryId,
      },
      {
        table: "entity_references",
        column: "id",
        id: brand.referenceId,
      },
      { table: "timeline_events", column: "id", id: brand.timelineId },
      { table: "media_assets", column: "id", id: brand.mediaId },
      { table: "entity_links", column: "id", id: pen.madeById },
      { table: "fact_scopes", column: "id", id: brand.scopeId },
      {
        table: "spec_field_evidence",
        column: "id",
        id: pen.primarySpecEvidenceId,
      },
      {
        table: "claim_evidence",
        column: "id",
        id: brand.primaryClaimEvidenceId,
      },
      { table: "fact_conflicts", column: "id", id: brand.conflictId },
      {
        table: "fact_conflict_members",
        column: "id",
        id: brand.conflictMemberId,
      },
      {
        table: "entity_publications",
        column: "entity_id",
        id: brand.entityId,
      },
    ] as const) {
      await expectReject(
        () =>
          client.execute({
            sql: `UPDATE ${guard.table} SET ${guard.column} = ? WHERE ${guard.column} = ?`,
            args: [`${guard.id}-mutated`, guard.id],
          }),
        `publication_guard: ${guard.table}.${guard.column} is immutable`,
      );
    }
    assertCondition(
      (await publicationSnapshot(client, brand.entityId)) === brandSnapshot &&
        (await publicationSnapshot(client, pen.entityId)) === penSnapshot &&
        (await computePublicationContentHash(client, brand.entityId)) ===
          brandHash &&
        (await computePublicationContentHash(client, pen.entityId)) === penHash,
      "Rejected canonical ID rewrites changed lifecycle state or content hash.",
    );
    await assertPublic(client, brand.entityId);
    await assertPublic(client, pen.entityId);
  });

  await withPhase19Fixture(async ({ client }) => {
    const entity = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-published-snapshot-immutable",
      entityType: "brand",
    });
    await recordV2FirstThreeReviews(client, entity.entityId);
    const firstPublish = await publishEntity(client, {
      entityId: entity.entityId,
      reviewer: "phase19-first-publication-reviewer",
    });
    await client.execute({
      sql: "UPDATE stories SET body_md = body_md || ':new-revision' WHERE id = ?",
      args: [entity.storyId],
    });
    const revoked = await client.execute({
      sql: `
        SELECT count(*) AS approved_count
        FROM entity_content_reviews
        WHERE entity_id = ? AND content_hash = ? AND status = 'approved'
      `,
      args: [entity.entityId, firstPublish.contentHash],
    });
    assertCondition(
      Number(revoked.rows[0]?.approved_count ?? -1) === 0,
      "Content revision did not revoke every approval on the stale hash.",
    );
    await recordV2FirstThreeReviews(client, entity.entityId);
    const secondPublish = await publishEntity(client, {
      entityId: entity.entityId,
      reviewer: "phase19-second-publication-reviewer",
    });
    assertCondition(
      secondPublish.contentHash !== firstPublish.contentHash,
      "Published snapshot tamper fixture did not create a second content hash.",
    );
    const publishedSnapshot = await publicationSnapshot(client, entity.entityId);
    for (const mutation of [
      {
        sql: "UPDATE entity_publications SET approved_content_hash = ? WHERE entity_id = ?",
        args: [firstPublish.contentHash, entity.entityId],
      },
      {
        sql: "UPDATE entity_publications SET content_revision = content_revision + 1 WHERE entity_id = ?",
        args: [entity.entityId],
      },
      {
        sql: "UPDATE entity_publications SET reviewed_content_revision = reviewed_content_revision - 1 WHERE entity_id = ?",
        args: [entity.entityId],
      },
      {
        sql: "UPDATE entity_publications SET reviewed_contract_version = 1 WHERE entity_id = ?",
        args: [entity.entityId],
      },
      {
        sql: "UPDATE entity_publications SET reviewed_by = 'tampered' WHERE entity_id = ?",
        args: [entity.entityId],
      },
      {
        sql: "UPDATE entity_publications SET reviewed_at = '2026-07-15T00:00:00.000Z' WHERE entity_id = ?",
        args: [entity.entityId],
      },
      {
        sql: "UPDATE entity_publications SET published_at = '2026-07-15T00:00:00.000Z' WHERE entity_id = ?",
        args: [entity.entityId],
      },
    ]) {
      await expectReject(
        () => client.execute(mutation),
        "publication_guard: published authorization snapshot is immutable",
      );
      assertCondition(
        (await publicationSnapshot(client, entity.entityId)) ===
          publishedSnapshot,
        "Rejected published snapshot tamper changed lifecycle state.",
      );
    }

    await client.execute({
      sql: `
        UPDATE entity_publications
        SET status = 'in_review',
            approved_content_hash = ?,
            reviewed_content_revision = content_revision,
            reviewed_contract_version = 2,
            reviewed_by = 'stale-direct-reviewer',
            reviewed_at = '2026-07-16T00:00:00.000Z',
            published_at = NULL
        WHERE entity_id = ?
      `,
      args: [firstPublish.contentHash, entity.entityId],
    });
    await expectReject(
      () =>
        client.execute({
          sql: `
            UPDATE entity_publications
            SET status = 'published',
                published_at = '2026-07-16T00:00:01.000Z'
            WHERE entity_id = ?
          `,
          args: [entity.entityId],
        }),
      "publication_guard: readiness blockers remain",
    );
    await assertNotPublic(client, entity.entityId);
    const refreshed = await publishEntity(client, {
      entityId: entity.entityId,
      reviewer: "phase19-refresh-after-stale-direct-sql",
    });
    assertCondition(
      refreshed.contentHash === secondPublish.contentHash,
      "Server publish did not restore the current canonical hash after stale direct SQL.",
    );
    await assertPublic(client, entity.entityId);
  });
}

async function runPublishContract(): Promise<void> {
  const signalSnapshot = snapshotRealDatabase();
  const sharedSignalReport = path.join(
    os.tmpdir(),
    `fpkg-publication-shared-signal-${process.pid}-${Date.now()}.json`,
  );
  await assertSignalCleanup(sharedSignalReport, "--shared-signal-probe");
  assertSnapshotUnchanged(signalSnapshot, "Shared Phase 19 SIGTERM cleanup");
  await runDirectSqlContract2Matrix();

  await withPhase19Fixture(async ({ client }) => {
    const blocked = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-transaction-blocked",
      entityType: "brand",
    });
    await client.execute({
      sql: "DELETE FROM media_assets WHERE id = ?",
      args: [blocked.mediaId],
    });
    const blockedHash = await recordV2FirstThreeReviews(
      client,
      blocked.entityId,
    );
    const blockedBefore = await publicationSnapshot(client, blocked.entityId);
    const blockedTrace = tracedPublicationClient(client);
    await expectReject(
      () =>
        publishEntity(blockedTrace.db, {
          entityId: blocked.entityId,
          reviewer: "phase19-blocked-publication-reviewer",
        }),
      "Publication readiness blocked",
    );
    assertCondition(
      blockedTrace.trace.transactionCalls === 1 &&
        blockedTrace.trace.events.filter((event) => event === "ROLLBACK").length === 1 &&
        !blockedTrace.trace.events.includes("COMMIT"),
      `Blocked publish retried or did not roll back exactly once: ${JSON.stringify(blockedTrace.trace)}.`,
    );
    assertTraceOrder(
      blockedTrace.trace,
      [
        "review_kind IN ('fact', 'language', 'media')",
        "SET status = 'in_review'",
        "'publication'",
        "FROM public_entity_readiness",
        "ROLLBACK",
      ],
      "Blocked publish",
    );
    assertCondition(
      traceIndex(blockedTrace.trace, "SET status = 'published'") === -1,
      "Blocked publish attempted the final published transition.",
    );
    assertCondition(
      (await publicationSnapshot(client, blocked.entityId)) === blockedBefore,
      "Blocked publish left a lifecycle snapshot after rollback.",
    );
    assertCondition(
      (await publicationReviewCount(client, blocked.entityId, blockedHash)) === 0,
      "Blocked publish left its transaction-owned publication review.",
    );
    await assertNotPublic(client, blocked.entityId);
  });

  await withPhase19Fixture(async ({ client }) => {
    const missingReview = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-transaction-missing-media-review",
      entityType: "brand",
    });
    await recordV2FirstThreeReviews(client, missingReview.entityId, "media");
    const before = await publicationSnapshot(client, missingReview.entityId);
    const traced = tracedPublicationClient(client);
    await expectReject(
      () =>
        publishEntity(traced.db, {
          entityId: missingReview.entityId,
          reviewer: "phase19-publication-reviewer",
        }),
      "current-hash reviews missing",
    );
    assertCondition(
      traced.trace.transactionCalls === 1 &&
        traced.trace.events.filter((event) => event === "ROLLBACK").length === 1 &&
        traceIndex(traced.trace, "SET status = 'in_review'") === -1 &&
        traceIndex(traced.trace, "'publication'") === -1,
      `Missing first-three review mutated lifecycle before validation: ${JSON.stringify(traced.trace)}.`,
    );
    assertCondition(
      (await publicationSnapshot(client, missingReview.entityId)) === before,
      "Missing first-three review changed lifecycle state.",
    );
  });

  await withPhase19Fixture(async ({ client }) => {
    const brand = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-stale-publication-brand",
      entityType: "brand",
    });
    const currentHash = await recordV2FirstThreeReviews(client, brand.entityId);
    await stageDirectContract2Snapshot(client, brand.entityId, {
      includePublicationReview: false,
    });
    const staleHash = `sha256:v2:${"d".repeat(64)}`;
    await client.execute({
      sql: `
        INSERT INTO entity_content_reviews (
          id, entity_id, review_kind, content_hash, status,
          reviewer, reviewed_at
        ) VALUES (
          'phase19-stale-publication-review', ?, 'publication', ?, 'approved',
          'stale-reviewer', '2026-07-15T00:00:00.000Z'
        )
      `,
      args: [brand.entityId, staleHash],
    });
    const prepublishBlockers = await v2BlockerCodes(client, brand.entityId);
    assertCondition(
      prepublishBlockers.includes("missing_publication_review"),
      `Stale publication review did not block readiness: ${JSON.stringify(prepublishBlockers)}.`,
    );
    await expectReject(
      () =>
        client.execute({
          sql: `
            UPDATE entity_publications
            SET status = 'published',
                published_at = '2026-07-16T00:00:01.000Z'
            WHERE entity_id = ?
          `,
          args: [brand.entityId],
        }),
      "publication_guard: readiness blockers remain",
    );
    const tracedBrand = tracedPublicationClient(client);
    const publishedBrand = await publishEntity(tracedBrand.db, {
      entityId: brand.entityId,
      reviewer: "phase19-current-publication-reviewer",
    });
    assertCondition(
      publishedBrand.contentHash === currentHash &&
        tracedBrand.trace.transactionCalls === 1,
      "Server publication did not refresh the stale final review on the current hash.",
    );
    assertTraceOrder(
      tracedBrand.trace,
      [
        "review_kind IN ('fact', 'language', 'media')",
        "SET status = 'in_review'",
        "'publication'",
        "FROM public_entity_readiness",
        "SET status = 'published'",
        "FROM public_entities",
        "COMMIT",
      ],
      "Successful publish",
    );
    assertCondition(
      tracedBrand.trace.events.filter((event) => event === "COMMIT").length === 1 &&
        !tracedBrand.trace.events.includes("ROLLBACK") &&
        (await publicationReviewCount(client, brand.entityId, currentHash)) === 1,
      "Successful publish did not commit exactly one current-hash publication review.",
    );
    await assertPublic(client, brand.entityId);

    const pen = await seedQualifiedPublicationFixture(client, {
      entityId: "phase19-atomic-publication-pen",
      entityType: "pen",
      brandEntityId: brand.entityId,
    });
    await recordV2FirstThreeReviews(client, pen.entityId);
    const publishedPen = await publishEntity(client, {
      entityId: pen.entityId,
      reviewer: "phase19-pen-publication-reviewer",
    });
    await assertPublic(client, pen.entityId);
    const publicMadeBy = await client.execute({
      sql: `
        SELECT link.id
        FROM entity_links link
        JOIN public_entities target ON target.id = link.target_id
        WHERE link.source_id = ? AND link.link_type = 'made_by'
      `,
      args: [pen.entityId],
    });
    assertCondition(
      publicMadeBy.rows.length === 1,
      "Published pen did not have exactly one made_by edge to its public brand.",
    );
    await client.execute({
      sql: "UPDATE media_assets SET title = title || ':critical-edit' WHERE id = ?",
      args: [pen.mediaId],
    });
    await assertNotPublic(client, pen.entityId);
    const editSnapshot = await publicationSnapshot(client, pen.entityId);
    await expectReject(
      () =>
        publishEntity(client, {
          entityId: pen.entityId,
          reviewer: "phase19-stale-first-three-reviewer",
        }),
      "current-hash reviews missing",
    );
    assertCondition(
      (await publicationSnapshot(client, pen.entityId)) === editSnapshot,
      "Stale first-three reviews left partial publication state.",
    );
    await recordV2FirstThreeReviews(client, pen.entityId);
    const republishedPen = await publishEntity(client, {
      entityId: pen.entityId,
      reviewer: "phase19-republication-reviewer",
    });
    assertCondition(
      republishedPen.contentHash !== publishedPen.contentHash,
      "Critical edit reused the stale content hash.",
    );
    await assertPublic(client, pen.entityId);

    for (const status of ["in_review", "retired", "draft"] as const) {
      await setEntityPublicationStatus(client, pen.entityId, status);
      await assertNotPublic(client, pen.entityId);
    }
    await expectReject(
      () =>
        setEntityPublicationStatus(
          client,
          pen.entityId,
          "published" as never,
        ),
      "Unsupported non-published publication status",
    );
  });

  console.log(
    "Publication publish contract passed: direct SQL rejects stale/incomplete snapshots, one ordered no-retry transaction owns final review, failures fully roll back, and qualified brand+pen publish atomically.",
  );
}

function processIsAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return !(
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ESRCH"
    );
  }
}

async function waitForFile(filePath: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (fs.existsSync(filePath)) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`Timed out waiting for fixture report: ${filePath}`);
}

function expectThrow(run: () => unknown, messageFragment: string): void {
  try {
    run();
  } catch (error) {
    if (error instanceof Error && error.message.includes(messageFragment)) return;
    throw error;
  }
  throw new Error(`Expected rejection containing: ${messageFragment}`);
}

async function assertClientClosed(client: Client): Promise<void> {
  try {
    await client.execute("SELECT 1");
  } catch {
    return;
  }
  throw new Error("Fixture cleanup left its libSQL client usable.");
}

function idleChild(fixture: FixtureContext): ChildProcess {
  return registerChild(
    fixture,
    process.execPath,
    ["-e", "setInterval(() => {}, 1000)"],
    { cwd: ROOT, stdio: "ignore" },
  );
}

async function assertSignalCleanup(
  reportFile: string,
  probeFlag = "--signal-probe",
): Promise<void> {
  const require = createRequire(import.meta.url);
  const tsxCli = require.resolve("tsx/cli");
  const output: string[] = [];
  const child = spawn(
    process.execPath,
    [tsxCli, SCRIPT_PATH, probeFlag, "--report", reportFile],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
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
      serverPid: number;
    };
    if (!fs.existsSync(report.databasePath) || !processIsAlive(report.serverPid)) {
      throw new Error("Signal probe did not create both fixture DB and child server.");
    }

    child.kill("SIGTERM");
    if (!(await waitForChildExit(child, 8_000))) {
      child.kill("SIGKILL");
      throw new Error("Signal probe did not exit after SIGTERM.");
    }
    if (fs.existsSync(report.tempRoot)) {
      throw new Error(`SIGTERM left fixture root behind: ${report.tempRoot}`);
    }
    if (processIsAlive(report.serverPid)) {
      throw new Error(`SIGTERM left fixture server alive: ${report.serverPid}`);
    }
  } catch (error) {
    await stopChild(child);
    throw new Error(`Signal cleanup fixture failed.\n${output.join("")}`, {
      cause: error,
    });
  } finally {
    fs.rmSync(reportFile, { force: true });
  }
}

async function runFixtureIsolation(): Promise<void> {
  const before = snapshotRealDatabase();

  expectThrow(
    () =>
      resolveDatabaseConnection({
        TURSO_DATABASE_URL: "libsql://example.invalid",
        FPKG_DATABASE_URL: "file:/tmp/fixture.db",
      }),
    "mutually exclusive",
  );
  expectThrow(
    () =>
      resolveDatabaseConnection({
        PUBLICATION_GATE_FIXTURE: "1",
        TURSO_DATABASE_URL: "libsql://example.invalid",
      }),
    "requires an explicit file:",
  );
  expectThrow(
    () =>
      resolveDatabaseConnection({
        PUBLICATION_GATE_FIXTURE: "1",
        FPKG_DATABASE_URL: "libsql://example.invalid",
      }),
    "must be a file:",
  );
  for (const databaseUrl of [
    "file:data/fpkg.db",
    `file:${REAL_DATABASE_PATH}`,
    "file:data/../data/fpkg.db",
  ]) {
    expectThrow(
      () =>
        resolveDatabaseConnection({
          PUBLICATION_GATE_FIXTURE: "1",
          FPKG_DATABASE_URL: databaseUrl,
        }),
      "may not use the real data/fpkg.db",
    );
  }

  let successRoot = "";
  let successClient: Client | null = null;
  await withFixture(async (fixture) => {
    successRoot = fixture.tempRoot;
    successClient = fixture.client;
    const connection = resolveDatabaseConnection({
      PUBLICATION_GATE_FIXTURE: "1",
      FPKG_DATABASE_URL: fixture.databaseUrl,
    });
    if (connection.localPath !== fixture.databasePath) {
      throw new Error("Fixture database URL did not resolve to its disposable path.");
    }
    const migrations = await fixture.client.execute(
      "SELECT COUNT(*) AS count FROM migrations",
    );
    if (Number(migrations.rows[0]?.count) === 0) {
      throw new Error("Fixture database did not receive canonical migrations.");
    }
  });
  if (fs.existsSync(successRoot) || !successClient) {
    throw new Error("Successful fixture lifecycle did not remove its temp root.");
  }
  await assertClientClosed(successClient);

  let failureRoot = "";
  let failureClient: Client | null = null;
  let failureServerPid = 0;
  let expectedFailure = false;
  try {
    await withFixture(async (fixture) => {
      failureRoot = fixture.tempRoot;
      failureClient = fixture.client;
      const server = idleChild(fixture);
      if (!server.pid) throw new Error("Failure fixture did not start its child server.");
      failureServerPid = server.pid;
      throw new Error("deliberate fixture failure");
    });
  } catch (error) {
    expectedFailure =
      error instanceof Error && error.message === "deliberate fixture failure";
  }
  if (!expectedFailure || fs.existsSync(failureRoot) || processIsAlive(failureServerPid)) {
    throw new Error("Failed fixture lifecycle leaked its DB root or child server.");
  }
  if (!failureClient) throw new Error("Failure fixture did not expose its test client.");
  await assertClientClosed(failureClient);

  const signalReport = path.join(
    os.tmpdir(),
    `fpkg-publication-signal-${process.pid}-${Date.now()}.json`,
  );
  await assertSignalCleanup(signalReport);

  const after = snapshotRealDatabase();
  if (JSON.stringify(after) !== JSON.stringify(before)) {
    throw new Error(
      `Real database changed during fixture isolation.\nBefore: ${JSON.stringify(before)}\nAfter: ${JSON.stringify(after)}`,
    );
  }

  console.log(
    "Publication fixture isolation passed: real DB unchanged; success, failure, and SIGTERM cleaned clients, servers, and temp roots.",
  );
}

function parsePort(args: string[]): number {
  const equalsArg = args.find((arg) => arg.startsWith("--port="));
  const separateIndex = args.indexOf("--port");
  const raw = equalsArg?.slice("--port=".length) ??
    (separateIndex >= 0 ? args[separateIndex + 1] : undefined) ??
    "3107";
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid --port value: ${raw}`);
  }
  return port;
}

async function serveE2E(port: number): Promise<void> {
  if (
    process.env.PUBLICATION_GATE_FIXTURE === "1" &&
    process.env.FPKG_DATABASE_URL?.trim()
  ) {
    const connection = resolveDatabaseConnection(process.env);
    assertCondition(
      connection.localPath,
      "Shared E2E server requires an explicit disposable local database.",
    );
    const client = createClient({ url: process.env.FPKG_DATABASE_URL });
    try {
      await assertDatabaseReady(client);
    } finally {
      client.close();
    }
    const require = createRequire(import.meta.url);
    const nextCli = require.resolve("next/dist/bin/next");
    borrowedE2EServer = spawn(
      process.execPath,
      [nextCli, "start", "-p", String(port)],
      {
        cwd: ROOT,
        env: {
          ...process.env,
          TURSO_DATABASE_URL: "",
          TURSO_AUTH_TOKEN: "",
          FPKG_DATABASE_URL: process.env.FPKG_DATABASE_URL,
          PUBLICATION_GATE_FIXTURE: "1",
        },
        stdio: "inherit",
      },
    );
    const server = borrowedE2EServer;
    const exitCode = await new Promise<number>((resolve, reject) => {
      server.once("error", reject);
      server.once("exit", (code, signal) => {
        resolve(code ?? (signal ? 1 : 0));
      });
    });
    borrowedE2EServer = null;
    if (exitCode !== 0) process.exitCode = exitCode;
    return;
  }

  const fixture = await createFixture("fpkg-publication-e2e-");
  try {
    console.log(`Publication E2E fixture: ${fixture.databasePath}`);
    const server = registerChild(fixture, "pnpm", ["start", "-p", String(port)], {
      cwd: ROOT,
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: fixture.databaseUrl,
        PUBLICATION_GATE_FIXTURE: "1",
      },
      stdio: "inherit",
    });
    const exitCode = await new Promise<number>((resolve, reject) => {
      server.once("error", reject);
      server.once("exit", (code, signal) => {
        resolve(code ?? (signal ? 1 : 0));
      });
    });
    if (exitCode !== 0) process.exitCode = exitCode;
  } finally {
    await cleanupFixture(fixture);
  }
}

async function runSignalProbe(reportFile: string): Promise<void> {
  const fixture = await createFixture("fpkg-publication-signal-probe-");
  const server = idleChild(fixture);
  if (!server.pid) throw new Error("Signal probe child server has no PID.");
  fs.writeFileSync(
    reportFile,
    JSON.stringify({
      tempRoot: fixture.tempRoot,
      databasePath: fixture.databasePath,
      serverPid: server.pid,
    }),
  );
  await new Promise(() => undefined);
}

async function runSharedSignalProbe(reportFile: string): Promise<void> {
  const fixture = await createPhase19Fixture(
    "fpkg-publication-shared-signal-probe-",
  );
  try {
    const server = fixture.registerChild(
      process.execPath,
      ["-e", "setInterval(() => {}, 1000)"],
      { cwd: ROOT, stdio: "ignore" },
    );
    if (!server.pid) throw new Error("Shared signal probe child has no PID.");
    fs.writeFileSync(
      reportFile,
      JSON.stringify({
        tempRoot: fixture.tempRoot,
        databasePath: fixture.databasePath,
        serverPid: server.pid,
      }),
    );
    await new Promise(() => undefined);
  } catch (error) {
    await cleanupPhase19Fixture(fixture);
    throw error;
  }
}

async function cleanupAllFixtures(): Promise<void> {
  const legacyFixture = activeFixture;
  const results = await Promise.allSettled([
    ...(borrowedE2EServer ? [stopChild(borrowedE2EServer)] : []),
    ...(legacyFixture ? [cleanupFixture(legacyFixture)] : []),
    cleanupActivePhase19Fixtures(),
  ]);
  borrowedE2EServer = null;
  const failures = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);
  if (failures.length > 0) {
    throw new AggregateError(failures, "Publication fixture cleanup failed.");
  }
}

function installSignalHandlers(): void {
  for (const [signal, exitCode] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ] as const) {
    process.once(signal, () => {
      if (signalCleanupStarted) return;
      signalCleanupStarted = true;
      void (async () => {
        try {
          await cleanupAllFixtures();
          process.exit(exitCode);
        } catch {
          process.exit(1);
        }
      })();
    });
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  installSignalHandlers();

  if (args.length === 0 || args.includes("--all")) {
    await runFixtureIsolation();
    await runMigrationFullContract();
    await runCompatibilityContract();
    return;
  }

  if (args.includes("--signal-probe")) {
    const reportIndex = args.indexOf("--report");
    const reportFile = reportIndex >= 0 ? args[reportIndex + 1] : undefined;
    if (!reportFile) throw new Error("--signal-probe requires --report <path>.");
    await runSignalProbe(reportFile);
    return;
  }
  if (args.includes("--shared-signal-probe")) {
    const reportIndex = args.indexOf("--report");
    const reportFile = reportIndex >= 0 ? args[reportIndex + 1] : undefined;
    if (!reportFile) {
      throw new Error("--shared-signal-probe requires --report <path>.");
    }
    await runSharedSignalProbe(reportFile);
    return;
  }
  if (args.includes("--fixture-isolation")) {
    await runFixtureIsolation();
    return;
  }
  if (args.includes("--migration")) {
    await runMigrationContract();
    return;
  }
  if (args.includes("--backfill")) {
    await runBackfillContract();
    return;
  }
  if (args.includes("--invalidation")) {
    await runInvalidationContract();
    return;
  }
  if (args.includes("--publish")) {
    await runPublishContract();
    return;
  }
  if (args.includes("--migration-full")) {
    await runMigrationFullContract();
    return;
  }
  if (args.includes("--compatibility")) {
    await runCompatibilityContract();
    return;
  }
  if (args.includes("--serve-e2e")) {
    await serveE2E(parsePort(args));
    return;
  }

  throw new Error(
    "Usage: pnpm check:publication-gate [-- --all | --fixture-isolation | --migration | --backfill | --invalidation | --publish | --migration-full | --compatibility | --serve-e2e --port 3107]",
  );
}

main().catch(async (error) => {
  try {
    await cleanupAllFixtures();
  } catch (cleanupError) {
    console.error(cleanupError);
  }
  console.error(error);
  process.exitCode = 1;
});
