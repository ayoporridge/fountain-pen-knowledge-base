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
  readPublicationContentPayload,
} from "../src/lib/publication";

const ROOT = process.cwd();
const REAL_DATABASE_PATH = path.join(ROOT, "data", "fpkg.db");
const MIGRATIONS_PATH = path.join(ROOT, "migrations");
const SCRIPT_PATH = path.join(ROOT, "scripts", "check-publication-gate.ts");
const MIGRATION_030 = "030_publication_gate.sql";
const VALID_HASH = `sha256:v1:${"a".repeat(64)}`;

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

let activeFixture: FixtureContext | null = null;
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
  const contentHash = await computePublicationContentHash(client, entityId);
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
    args: [status, contentHash, status, entityId],
  });
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
  await withFixture(async ({ client }) => {
    await assertDatabaseReady(client);

    await insertEntity(client, "fixture-transition", "article");
    await client.execute(
      "UPDATE entities SET type = 'brand' WHERE id = 'fixture-transition'",
    );
    await assertPublicationReset(client, "fixture-transition", 1);
    await forceReviewedPublication(client, "fixture-transition");
    await client.execute(
      "UPDATE entities SET type = 'pen' WHERE id = 'fixture-transition'",
    );
    await assertPublicationReset(client, "fixture-transition", 2);
    await forceReviewedPublication(client, "fixture-transition");
    await client.execute(
      "UPDATE entities SET type = 'brand' WHERE id = 'fixture-transition'",
    );
    await assertPublicationReset(client, "fixture-transition", 3);
    await forceReviewedPublication(client, "fixture-transition");
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
    await forceReviewedPublication(client, "fixture-pen-missing-maker");
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
    await forceReviewedPublication(client, "fixture-pen-draft-maker");
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
    await forceReviewedPublication(client, "fixture-pen-multiple-makers");
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
      () => assertDatabaseReady(client),
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

async function runInvalidationContract(): Promise<void> {
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

async function assertSignalCleanup(reportFile: string): Promise<void> {
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

function installSignalHandlers(): void {
  for (const [signal, exitCode] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ] as const) {
    process.once(signal, () => {
      if (signalCleanupStarted) return;
      signalCleanupStarted = true;
      void (async () => {
        if (activeFixture) await cleanupFixture(activeFixture);
        process.exit(exitCode);
      })();
    });
  }
}

async function main(): Promise<void> {
  installSignalHandlers();
  const args = process.argv.slice(2);

  if (args.includes("--signal-probe")) {
    const reportIndex = args.indexOf("--report");
    const reportFile = reportIndex >= 0 ? args[reportIndex + 1] : undefined;
    if (!reportFile) throw new Error("--signal-probe requires --report <path>.");
    await runSignalProbe(reportFile);
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
  if (args.includes("--serve-e2e")) {
    await serveE2E(parsePort(args));
    return;
  }

  throw new Error(
    "Usage: pnpm check:publication-gate -- --fixture-isolation | --migration | --backfill | --invalidation | --serve-e2e --port 3107",
  );
}

main().catch(async (error) => {
  if (activeFixture) await cleanupFixture(activeFixture);
  console.error(error);
  process.exitCode = 1;
});
