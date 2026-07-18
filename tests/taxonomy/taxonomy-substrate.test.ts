import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient, type InArgs } from "@libsql/client";
import { assertDatabaseReady, migrateDatabase } from "../../src/lib/db";
import {
  computePublicationContentHash,
  publishEntity,
  readPublicationContentPayload,
  recordEntityContentReview,
} from "../../src/lib/publication";

const ROOT = process.cwd();
const CANONICAL_MIGRATIONS = path.join(ROOT, "migrations");
const MIGRATION_032 = "032_taxonomy_identity.sql";
const V2_HASH = `sha256:v2:${"2".repeat(64)}`;
const FORGED_V2_HASH = `sha256:v2:${"3".repeat(64)}`;
const V3_REVOKED_HASH = `sha256:v3:${"4".repeat(64)}`;
const V3_APPROVED_HASH = `sha256:v3:${"5".repeat(64)}`;

type Fixture = {
  client: Client;
  migrationDir: string;
  root: string;
};

async function sqlRows(
  client: Client,
  sql: string,
  args: unknown[] = [],
): Promise<Record<string, unknown>[]> {
  return (await client.execute({ sql, args: args as InArgs })).rows as Record<
    string,
    unknown
  >[];
}

async function sqlOne(
  client: Client,
  sql: string,
  args: unknown[] = [],
): Promise<Record<string, unknown>> {
  const row = (await sqlRows(client, sql, args))[0];
  assert.ok(row, `Expected one row for: ${sql}`);
  return row;
}

function copyMigrationsThrough031(target: string): void {
  fs.mkdirSync(target, { recursive: true });
  for (const file of fs.readdirSync(CANONICAL_MIGRATIONS).sort()) {
    if (!/^\d{3}_.+\.sql$/.test(file) || file >= MIGRATION_032) continue;
    fs.copyFileSync(
      path.join(CANONICAL_MIGRATIONS, file),
      path.join(target, file),
    );
  }
}

async function createFixture(): Promise<Fixture> {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-taxonomy-"));
  const migrationDir = path.join(root, "migrations");
  copyMigrationsThrough031(migrationDir);
  const client = createClient({ url: `file:${path.join(root, "fixture.db")}` });
  await migrateDatabase(client, { migrationsDir: migrationDir });
  return { client, migrationDir, root };
}

async function apply032(fixture: Fixture) {
  fs.copyFileSync(
    path.join(CANONICAL_MIGRATIONS, MIGRATION_032),
    path.join(fixture.migrationDir, MIGRATION_032),
  );
  return migrateDatabase(fixture.client, {
    migrationsDir: fixture.migrationDir,
  });
}

async function withFixture(
  run: (fixture: Fixture) => Promise<void>,
): Promise<void> {
  const fixture = await createFixture();
  try {
    await run(fixture);
  } finally {
    fixture.client.close();
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
}

async function seedEntityEvidence(
  client: Client,
  entityId: string,
  type: "brand" | "pen",
): Promise<void> {
  await client.execute({
    sql: `INSERT INTO stories (
      id, entity_id, title, story_type, summary, body_md, status, source_notes
    ) VALUES (?, ?, ?, ?, 'Fixture story summary', '# Fixture story', 'published', 'fixture')`,
    args: [
      `${entityId}-story`,
      entityId,
      `${entityId} story`,
      type === "brand" ? "brand_story" : "model_story",
    ],
  });
  await client.execute({
    sql: `INSERT INTO fact_scopes (
      id, entity_id, scope_key, market, valid_from, production_state
    ) VALUES (?, ?, 'global-current', 'global', '2020-01-01', 'current')`,
    args: [`${entityId}-scope`, entityId],
  });

  for (const source of ["primary", "secondary"] as const) {
    const claimId = `${entityId}-claim-${source}`;
    const citationId = `${entityId}-citation-${source}`;
    const sourceId = `source-${source}`;
    await client.execute({
      sql: `INSERT INTO claims (
        id, subject_entity_id, predicate, object_text, source_item_id,
        evidence_locator, confidence, review_status, fact_class
      ) VALUES (?, ?, ?, ?, ?, ?, 1, 'approved', 'core')`,
      args: [
        claimId,
        entityId,
        `${source}_identity`,
        `${entityId} ${source} fact`,
        sourceId,
        `claim:${source}`,
      ],
    });
    await client.execute({
      sql: `INSERT INTO citations (
        id, target_type, target_id, source_item_id, claim_id, note,
        review_status, evidence_locator, scope_id
      ) VALUES (?, 'claim', ?, ?, ?, 'fixture', 'approved', ?, ?)`,
      args: [
        citationId,
        claimId,
        sourceId,
        claimId,
        `citation:${source}`,
        `${entityId}-scope`,
      ],
    });
    await client.execute({
      sql: `INSERT INTO claim_evidence (
        id, claim_id, citation_id, scope_id, evidence_locator, review_status
      ) VALUES (?, ?, ?, ?, ?, 'approved')`,
      args: [
        `${entityId}-claim-evidence-${source}`,
        claimId,
        citationId,
        `${entityId}-scope`,
        `mapping:${source}`,
      ],
    });
  }

  if (type === "pen") {
    await client.execute({
      sql: `INSERT INTO model_specs (id, entity_id, nib, review_status)
            VALUES (?, ?, '14k medium', 'approved')`,
      args: [`${entityId}-spec`, entityId],
    });
    await client.execute({
      sql: `INSERT INTO citations (
        id, target_type, target_id, source_item_id, note, review_status,
        evidence_locator, scope_id
      ) VALUES (?, 'model_spec', ?, 'source-primary', 'fixture', 'approved', 'spec:nib', ?)`,
      args: [
        `${entityId}-spec-citation`,
        `${entityId}-spec`,
        `${entityId}-scope`,
      ],
    });
    await client.execute({
      sql: `INSERT INTO spec_field_evidence (
        id, model_spec_id, field_key, citation_id, scope_id,
        evidence_locator, review_status
      ) VALUES (?, ?, 'nib', ?, ?, 'field:nib', 'approved')`,
      args: [
        `${entityId}-spec-evidence`,
        `${entityId}-spec`,
        `${entityId}-spec-citation`,
        `${entityId}-scope`,
      ],
    });
  }

  await client.execute({
    sql: `INSERT INTO media_assets (
      id, entity_id, title, asset_type, local_path, author, license,
      attribution_text, source_url, source_item_id, review_status, usage_status
    ) VALUES (?, ?, 'Fixture primary image', 'image', ?, 'Fixture', 'CC0',
      'Fixture · CC0', 'https://fixture.invalid/image', 'source-primary',
      'approved', 'primary')`,
    args: [`${entityId}-media`, entityId, `public/${entityId}.jpg`],
  });
}

async function installV2Snapshot(
  client: Client,
  entityId: string,
): Promise<void> {
  const publication = await sqlOne(
    client,
    "SELECT content_revision FROM entity_publications WHERE entity_id = ?",
    [entityId],
  );
  const revision = Number(publication.content_revision);
  await client.execute({
    sql: `UPDATE entity_publications
          SET status = 'in_review', approved_content_hash = ?,
              reviewed_content_revision = ?, reviewed_contract_version = 2,
              reviewed_by = 'v2-fixture', reviewed_at = '2026-07-18T00:00:00Z',
              published_at = NULL
          WHERE entity_id = ?`,
    args: [V2_HASH, revision, entityId],
  });
  for (const kind of ["fact", "language", "media", "publication"] as const) {
    await client.execute({
      sql: `INSERT INTO entity_content_reviews (
        id, entity_id, review_kind, content_hash, status, reviewer,
        reviewed_at, note, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'approved', 'v2-fixture',
        '2026-07-18T00:00:00Z', ?, '2026-07-17T00:00:00Z',
        '2026-07-18T00:00:00Z')`,
      args: [
        `${entityId}-review-${kind}`,
        entityId,
        kind,
        V2_HASH,
        `legacy ${kind}`,
      ],
    });
  }
  await client.execute({
    sql: `UPDATE entity_publications
          SET status = 'published', published_at = '2026-07-18T00:00:00Z'
          WHERE entity_id = ?`,
    args: [entityId],
  });
}

async function seedPublishedV2Pair(client: Client): Promise<void> {
  await client.execute(`INSERT INTO source_registry (
    id, name, source_type, allowed_use, reliability, license, attribution,
    homepage_url, fetch_method, last_checked_at
  ) VALUES
    ('registry-primary', 'Primary', 'official', 'summary_only', 'medium',
      'CC0', 'Fixture', 'https://fixture.invalid/primary', 'manual', '2026-07-18'),
    ('registry-secondary', 'Secondary', 'book', 'summary_only', 'medium',
      'CC0', 'Fixture', 'https://fixture.invalid/secondary', 'manual', '2026-07-18')`);
  await client.execute(`INSERT INTO source_items (
    id, source_id, title, url, item_type, license, author, published_at,
    retrieved_at, summary, raw_metadata_json, allowed_use, review_status,
    source_tier, independence_group, archive_url, archive_locator
  ) VALUES
    ('source-primary', 'registry-primary', 'Primary source',
      'https://fixture.invalid/primary/item', 'web_page', 'CC0', 'Fixture',
      '2020-01-01', '2026-07-18', 'Primary', '{}', 'summary_only', 'approved',
      'primary', 'fixture-primary', 'https://archive.invalid/primary', 'snapshot:primary'),
    ('source-secondary', 'registry-secondary', 'Secondary source',
      'https://fixture.invalid/secondary/item', 'web_page', 'CC0', 'Fixture',
      '2021-01-01', '2026-07-18', 'Secondary', '{}', 'summary_only', 'approved',
      'professional_secondary', 'fixture-secondary',
      'https://archive.invalid/secondary', 'snapshot:secondary')`);
  await client.execute(`INSERT INTO entities (
    id, type, slug, name, summary, body_md, source
  ) VALUES
    ('brand-v2', 'brand', 'brand-v2', 'Brand V2',
      'A complete fixture brand summary for publication migration testing.',
      'Legacy brand body', 'fixture'),
    ('pen-v2', 'pen', 'pen-v2', 'Pen V2',
      'A complete fixture pen summary for publication migration testing.',
      'Legacy pen body', 'fixture')`);
  await seedEntityEvidence(client, "brand-v2", "brand");
  await seedEntityEvidence(client, "pen-v2", "pen");
  await client.execute(`INSERT INTO entity_links (
    id, source_id, target_id, link_type, reason
  ) VALUES ('pen-v2-made-by', 'pen-v2', 'brand-v2', 'made_by', 'fixture')`);
  await installV2Snapshot(client, "brand-v2");
  await installV2Snapshot(client, "pen-v2");
  assert.equal(
    Number(
      (
        await sqlOne(
          client,
          "SELECT count(*) AS count FROM public_entities WHERE id IN ('brand-v2', 'pen-v2')",
        )
      ).count,
    ),
    2,
  );
}

async function republishV3(client: Client, entityId: string): Promise<string> {
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId,
      reviewKind,
      reviewer: "v3-fixture",
      status: "approved",
    });
  }
  return (await publishEntity(client, { entityId, reviewer: "v3-fixture" }))
    .contentHash;
}

test("taxonomy substrate and migration replay preserve revoked v2 compatibility", async () => {
  await withFixture(async (fixture) => {
    await seedPublishedV2Pair(fixture.client);
    const beforePublications = await sqlRows(
      fixture.client,
      `SELECT entity_id, content_revision FROM entity_publications
       WHERE entity_id IN ('brand-v2', 'pen-v2') ORDER BY entity_id`,
    );
    const beforeReviews = await sqlRows(
      fixture.client,
      `SELECT id, entity_id, review_kind, reviewer, reviewed_at, note,
              created_at, updated_at
       FROM entity_content_reviews ORDER BY id`,
    );

    const first = await apply032(fixture);
    assert.deepEqual(first.applied, [MIGRATION_032]);
    const second = await migrateDatabase(fixture.client, {
      migrationsDir: fixture.migrationDir,
    });
    assert.deepEqual(second.applied, []);
    assert.ok(second.skipped.includes(MIGRATION_032));
    await assertDatabaseReady(fixture.client, {
      migrationsDir: fixture.migrationDir,
    });

    const objects = await sqlRows(
      fixture.client,
      `SELECT type, name FROM sqlite_schema WHERE name IN (
        'taxonomy_batches', 'taxonomy_actions', 'entity_lineage',
        'entity_redirects', 'entity_content_reviews', 'entity_publications'
      ) ORDER BY name`,
    );
    assert.deepEqual(
      objects.map((row) => `${row.type}:${row.name}`),
      [
        "table:entity_content_reviews",
        "table:entity_lineage",
        "table:entity_publications",
        "table:entity_redirects",
        "table:taxonomy_actions",
        "table:taxonomy_batches",
      ],
    );

    const publications = await sqlRows(
      fixture.client,
      `SELECT entity_id, status, content_revision, approved_content_hash,
              reviewed_content_revision, reviewed_contract_version,
              reviewed_by, reviewed_at, published_at
       FROM entity_publications
       WHERE entity_id IN ('brand-v2', 'pen-v2') ORDER BY entity_id`,
    );
    for (const [index, row] of publications.entries()) {
      assert.equal(row.status, "in_review");
      assert.equal(
        Number(row.content_revision),
        Number(beforePublications[index].content_revision) + 1,
      );
      for (const field of [
        "approved_content_hash",
        "reviewed_content_revision",
        "reviewed_contract_version",
        "reviewed_by",
        "reviewed_at",
        "published_at",
      ]) {
        assert.equal(row[field], null, `${String(row.entity_id)}.${field}`);
      }
    }
    assert.equal(
      Number(
        (
          await sqlOne(
            fixture.client,
            "SELECT count(*) AS count FROM public_entities WHERE id IN ('brand-v2', 'pen-v2')",
          )
        ).count,
      ),
      0,
    );

    const afterReviews = await sqlRows(
      fixture.client,
      `SELECT id, entity_id, review_kind, reviewer, reviewed_at, note,
              created_at, updated_at, status, content_hash
       FROM entity_content_reviews ORDER BY id`,
    );
    assert.deepEqual(
      afterReviews.map(
        ({ status: _status, content_hash: _hash, ...row }) => row,
      ),
      beforeReviews,
    );
    assert.ok(afterReviews.every((row) => row.status === "revoked"));
    assert.ok(afterReviews.every((row) => row.content_hash === V2_HASH));
    await assert.rejects(
      fixture.client.execute({
        sql: `UPDATE entity_content_reviews SET status = 'approved' WHERE id = ?`,
        args: [String(afterReviews[0].id)],
      }),
    );
    await assert.rejects(
      fixture.client.execute({
        sql: `INSERT INTO entity_content_reviews (
          id, entity_id, review_kind, content_hash, status
        ) VALUES ('new-revoked-v2-review', 'pen-v2', 'fact', ?, 'revoked')`,
        args: [V2_HASH],
      }),
    );
    await assert.rejects(
      fixture.client.execute({
        sql: "DELETE FROM entity_content_reviews WHERE id = ?",
        args: [String(afterReviews[0].id)],
      }),
    );
    await assert.rejects(
      fixture.client.execute({
        sql: `UPDATE entity_publications
              SET approved_content_hash = ?, reviewed_contract_version = 2
              WHERE entity_id = 'pen-v2'`,
        args: [V2_HASH],
      }),
    );
    await assert.rejects(
      fixture.client.execute({
        sql: `INSERT INTO entity_content_reviews (
          id, entity_id, review_kind, content_hash, status
        ) VALUES ('new-v2-review', 'pen-v2', 'fact', ?, 'pending')`,
        args: [V2_HASH],
      }),
    );
    await fixture.client.execute({
      sql: `INSERT INTO entity_content_reviews (
        id, entity_id, review_kind, content_hash, status
      ) VALUES ('runtime-v3-revoked', 'pen-v2', 'fact', ?, 'revoked')`,
      args: [V3_REVOKED_HASH],
    });
    await fixture.client.execute({
      sql: `INSERT INTO entity_content_reviews (
        id, entity_id, review_kind, content_hash, status, reviewer, reviewed_at
      ) VALUES ('runtime-v3-approved', 'pen-v2', 'language', ?, 'approved',
        'fixture-reviewer', '2026-07-19T00:00:00Z')`,
      args: [V3_APPROVED_HASH],
    });
    for (const reviewId of ["runtime-v3-revoked", "runtime-v3-approved"]) {
      await assert.rejects(
        fixture.client.execute({
          sql: `UPDATE entity_content_reviews
                SET content_hash = ?, status = 'revoked'
                WHERE id = ?`,
          args: [FORGED_V2_HASH, reviewId],
        }),
      );
    }
    assert.deepEqual(
      await sqlRows(
        fixture.client,
        `SELECT id, content_hash, status FROM entity_content_reviews
         WHERE id IN ('runtime-v3-revoked', 'runtime-v3-approved')
         ORDER BY id`,
      ),
      [
        {
          id: "runtime-v3-approved",
          content_hash: V3_APPROVED_HASH,
          status: "approved",
        },
        {
          id: "runtime-v3-revoked",
          content_hash: V3_REVOKED_HASH,
          status: "revoked",
        },
      ],
    );
  });
});

test("schema authorization scan permits v2 only in revoked-history clause", async () => {
  await withFixture(async (fixture) => {
    await apply032(fixture);
    const rows = await sqlRows(
      fixture.client,
      `SELECT type, name, lower(sql) AS sql
       FROM sqlite_schema
       WHERE sql IS NOT NULL AND type IN ('table', 'view', 'trigger')
       ORDER BY type, name`,
    );
    const v2References = rows.filter((row) =>
      String(row.sql).includes("sha256:v2:"),
    );
    assert.deepEqual(
      v2References.map((row) => `${row.type}:${row.name}`),
      ["table:entity_content_reviews"],
    );
    assert.match(String(v2References[0].sql), /status\s*=\s*'revoked'/);
    for (const row of rows) {
      if (row.name === "entity_content_reviews") continue;
      assert.doesNotMatch(
        String(row.sql),
        /sha256:v2:|contract_version\s*(?:=|!=)\s*2/,
      );
    }
  });
});

test("taxonomy substrate constraints and immutable identity reject malformed state", async () => {
  await withFixture(async (fixture) => {
    await seedPublishedV2Pair(fixture.client);
    await apply032(fixture);
    await fixture.client.execute(`INSERT INTO taxonomy_batches (
      id, source_key, source_checksum, status
    ) VALUES ('batch-1', 'fixture:matrix', '${"a".repeat(64)}', 'staged')`);
    await fixture.client.execute(`INSERT INTO taxonomy_actions (
      id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id,
      target_entity_id, status
    ) VALUES ('action-1', 'batch-1', 'row-1', 'rename', '${"b".repeat(64)}',
      'pen-v2', 'pen-v2', 'staged')`);
    await assert.rejects(
      fixture.client.execute(`INSERT INTO taxonomy_actions (
        id, batch_id, source_row_key, action_kind, action_checksum, status
      ) VALUES ('action-duplicate', 'batch-1', 'row-1', 'alias',
        '${"b".repeat(64)}', 'staged')`),
    );

    await fixture.client.execute(`INSERT INTO entity_aliases (
      id, entity_id, alias, language, alias_kind, market, valid_from, valid_to,
      source_item_id, review_status
    ) VALUES ('alias-1', 'pen-v2', 'Pen regional name', 'en', 'regional_name',
      'US', '2020-01-01', '2025-12-31', 'source-primary', 'approved')`);
    await assert.rejects(
      fixture.client.execute(`INSERT INTO entity_aliases (
        id, entity_id, alias, alias_kind, review_status
      ) VALUES ('alias-bad-kind', 'pen-v2', 'Bad', 'marketing_guess', 'pending')`),
    );
    await assert.rejects(
      fixture.client.execute(`INSERT INTO entity_aliases (
        id, entity_id, alias, alias_kind, valid_from, valid_to, review_status
      ) VALUES ('alias-bad-dates', 'pen-v2', 'Bad dates', 'alias',
        '2025-01-01', '2020-01-01', 'pending')`),
    );
    await assert.rejects(
      fixture.client.execute(`INSERT INTO entity_aliases (
        id, entity_id, alias, alias_kind, review_status
      ) VALUES ('alias-no-source', 'pen-v2', 'Unsourced', 'alias', 'approved')`),
    );
    await assert.rejects(
      fixture.client.execute(`INSERT INTO entity_aliases (
        id, entity_id, alias, alias_kind, source_item_id, review_status
      ) VALUES ('alias-no-market', 'pen-v2', 'Unscoped regional',
        'regional_name', 'source-primary', 'approved')`),
    );

    await fixture.client.execute(`INSERT INTO entities (
      id, type, slug, name, summary
    ) VALUES
      ('pen-child-a', 'pen', 'pen-child-a', 'Pen child A', 'draft child'),
      ('pen-child-b', 'pen', 'pen-child-b', 'Pen child B', 'draft child'),
      ('pen-other', 'pen', 'pen-other', 'Pen other', 'draft other')`);
    await fixture.client.execute(`INSERT INTO entity_lineage (
      id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind,
      fallback_reason
    ) VALUES
      ('lineage-a', 'batch-1', 'action-1', 'pen-v2', 'pen-child-a', 'split',
        'evidence scoped child'),
      ('lineage-b', 'batch-1', 'action-1', 'pen-v2', 'pen-child-b', 'split',
        'evidence scoped child')`);
    await fixture.client.execute(`INSERT INTO entity_redirects (
      id, batch_id, action_id, source_path, target_path, redirect_kind
    ) VALUES ('redirect-1', 'batch-1', 'action-1', '/pen/pen-v2',
      '/pen/pen-child-a', 'permanent')`);
    await assert.rejects(
      fixture.client.execute(`INSERT INTO entity_redirects (
        id, batch_id, source_path, target_path, redirect_kind
      ) VALUES ('redirect-open', 'batch-1', '/pen/open',
        'https://example.com/escape', 'permanent')`),
    );

    await fixture.client.execute(`INSERT INTO model_variants (
      id, model_entity_id, variant_name, variant_kind, review_status
    ) VALUES
      ('variant-edition', 'pen-v2', 'Edition group', 'edition_group', 'approved'),
      ('variant-color', 'pen-v2', 'Color child', 'color', 'approved')`);
    await fixture.client.execute(`UPDATE model_variants
      SET parent_variant_id = 'variant-edition' WHERE id = 'variant-color'`);
    await assert.rejects(
      fixture.client.execute(`UPDATE model_variants
        SET parent_variant_id = 'variant-color' WHERE id = 'variant-edition'`),
    );
    await assert.rejects(
      fixture.client.execute(`UPDATE model_variants
        SET variant_kind = 'color' WHERE id = 'variant-edition'`),
    );
    await fixture.client.execute(`INSERT INTO model_variants (
      id, model_entity_id, variant_name, variant_kind, review_status
    ) VALUES ('variant-other', 'pen-other', 'Other edition', 'edition_group', 'pending')`);
    await assert.rejects(
      fixture.client.execute(`UPDATE model_variants
        SET parent_variant_id = 'variant-other' WHERE id = 'variant-color'`),
    );
    await assert.rejects(
      fixture.client.execute(
        `UPDATE entities SET id = 'pen-v2-mutated' WHERE id = 'pen-v2'`,
      ),
    );
  });
});

test("approved alias source ownership invalidates publication fail closed", async () => {
  await withFixture(async (fixture) => {
    await seedPublishedV2Pair(fixture.client);
    await apply032(fixture);
    await republishV3(fixture.client, "brand-v2");
    await republishV3(fixture.client, "pen-v2");

    await fixture.client.execute(`INSERT INTO source_items (
      id, source_id, title, url, item_type, license, author, published_at,
      retrieved_at, summary, raw_metadata_json, allowed_use, review_status,
      source_tier, independence_group, archive_url, archive_locator
    ) VALUES
      ('alias-source-approved', 'registry-primary', 'Approved alias source',
        'https://fixture.invalid/alias/approved', 'web_page', 'CC0', 'Fixture',
        '2022-01-01', '2026-07-18', 'Approved alias', '{}', 'summary_only',
        'approved', 'primary', 'alias-approved',
        'https://archive.invalid/alias-approved', 'snapshot:alias-approved'),
      ('alias-source-pending', 'registry-primary', 'Pending alias source',
        'https://fixture.invalid/alias/pending', 'web_page', 'CC0', 'Fixture',
        '2022-01-01', '2026-07-18', 'Pending alias', '{}', 'summary_only',
        'approved', 'primary', 'alias-pending',
        'https://archive.invalid/alias-pending', 'snapshot:alias-pending'),
      ('alias-source-rejected', 'registry-primary', 'Rejected alias source',
        'https://fixture.invalid/alias/rejected', 'web_page', 'CC0', 'Fixture',
        '2022-01-01', '2026-07-18', 'Rejected alias', '{}', 'summary_only',
        'approved', 'primary', 'alias-rejected',
        'https://archive.invalid/alias-rejected', 'snapshot:alias-rejected')`);
    await fixture.client.execute(`INSERT INTO entity_aliases (
      id, entity_id, alias, source_item_id, review_status
    ) VALUES
      ('alias-approved-owner', 'pen-v2', 'Approved owner alias',
        'alias-source-approved', 'approved'),
      ('alias-pending-owner', 'pen-v2', 'Pending owner alias',
        'alias-source-pending', 'pending'),
      ('alias-rejected-owner', 'pen-v2', 'Rejected owner alias',
        'alias-source-rejected', 'rejected')`);

    const approvedHash = await republishV3(fixture.client, "pen-v2");
    const published = await sqlOne(
      fixture.client,
      `SELECT status, content_revision
       FROM entity_publications WHERE entity_id = 'pen-v2'`,
    );
    assert.equal(published.status, "published");
    const sourceItems = (
      (await readPublicationContentPayload(
        fixture.client,
        "pen-v2",
      )) as Record<string, unknown>
    ).sourceItems as Record<string, unknown>[];
    assert.ok(sourceItems.some((item) => item.id === "alias-source-approved"));
    assert.ok(!sourceItems.some((item) => item.id === "alias-source-pending"));
    assert.ok(!sourceItems.some((item) => item.id === "alias-source-rejected"));

    await fixture.client.execute(`UPDATE source_items
      SET title = title || ' updated'
      WHERE id IN ('alias-source-pending', 'alias-source-rejected')`);
    const afterUnreviewedSourceUpdates = await sqlOne(
      fixture.client,
      `SELECT status, content_revision
       FROM entity_publications WHERE entity_id = 'pen-v2'`,
    );
    assert.equal(afterUnreviewedSourceUpdates.status, "published");
    assert.equal(
      Number(afterUnreviewedSourceUpdates.content_revision),
      Number(published.content_revision),
    );
    assert.equal(
      await computePublicationContentHash(fixture.client, "pen-v2"),
      approvedHash,
    );

    await fixture.client.execute(`UPDATE source_items
      SET review_status = 'rejected'
      WHERE id = 'alias-source-approved'`);
    const invalidated = await sqlOne(
      fixture.client,
      `SELECT status, content_revision
       FROM entity_publications WHERE entity_id = 'pen-v2'`,
    );
    assert.equal(invalidated.status, "in_review");
    assert.equal(
      Number(invalidated.content_revision),
      Number(published.content_revision) + 1,
    );
    assert.notEqual(
      await computePublicationContentHash(fixture.client, "pen-v2"),
      approvedHash,
    );
    assert.equal(
      Number(
        (
          await sqlOne(
            fixture.client,
            `SELECT count(*) AS count FROM entity_content_reviews
             WHERE entity_id = 'pen-v2' AND status = 'approved'`,
          )
        ).count,
      ),
      0,
    );
    assert.equal(
      Number(
        (
          await sqlOne(
            fixture.client,
            "SELECT count(*) AS count FROM public_entities WHERE id = 'pen-v2'",
          )
        ).count,
      ),
      0,
    );
  });
});

test("taxonomy hash and review revocation fail closed without automatic republish", async () => {
  await withFixture(async (fixture) => {
    await seedPublishedV2Pair(fixture.client);
    await apply032(fixture);
    await republishV3(fixture.client, "brand-v2");
    const originalHash = await republishV3(fixture.client, "pen-v2");
    assert.match(originalHash, /^sha256:v3:[0-9a-f]{64}$/);
    const payload = (await readPublicationContentPayload(
      fixture.client,
      "pen-v2",
    )) as Record<string, unknown>;
    assert.equal(payload.version, 3);
    assert.ok(
      (payload.taxonomyLinks as Record<string, unknown>[]).some(
        (link) => link.linkType === "made_by",
      ),
    );

    const before = await sqlOne(
      fixture.client,
      "SELECT content_revision FROM entity_publications WHERE entity_id = 'pen-v2'",
    );
    await fixture.client.execute(`INSERT INTO entity_aliases (
      id, entity_id, alias, language, alias_kind, market, source_item_id,
      review_status
    ) VALUES ('hash-alias', 'pen-v2', 'Pen approved alias', 'en',
      'regional_name', 'US', 'source-primary', 'approved')`);
    const after = await sqlOne(
      fixture.client,
      `SELECT status, content_revision, approved_content_hash,
              reviewed_content_revision
       FROM entity_publications WHERE entity_id = 'pen-v2'`,
    );
    assert.equal(after.status, "in_review");
    assert.equal(
      Number(after.content_revision),
      Number(before.content_revision) + 1,
    );
    assert.equal(after.approved_content_hash, originalHash);
    assert.notEqual(after.reviewed_content_revision, after.content_revision);
    const aliasHash = await computePublicationContentHash(
      fixture.client,
      "pen-v2",
    );
    assert.notEqual(aliasHash, originalHash);
    assert.deepEqual(
      (
        (await readPublicationContentPayload(
          fixture.client,
          "pen-v2",
        )) as Record<string, unknown>
      ).aliases,
      [
        {
          alias: "Pen approved alias",
          aliasKind: "regional_name",
          entityId: "pen-v2",
          id: "hash-alias",
          language: "en",
          market: "US",
          reviewStatus: "approved",
          sourceItemId: "source-primary",
          validFrom: null,
          validTo: null,
        },
      ],
    );
    assert.equal(
      Number(
        (
          await sqlOne(
            fixture.client,
            `SELECT count(*) AS count FROM entity_content_reviews
             WHERE entity_id = 'pen-v2' AND status = 'approved'`,
          )
        ).count,
      ),
      0,
    );

    const revisionBeforeInternal = Number(after.content_revision);
    const hashBeforeInternal = aliasHash;
    await fixture.client.execute(`INSERT INTO entity_aliases (
      id, entity_id, alias, alias_kind, review_status
    ) VALUES ('pending-alias', 'pen-v2', 'Pending alias', 'alias', 'pending')`);
    await fixture.client.execute(`INSERT INTO taxonomy_batches (
      id, source_key, source_checksum, status
    ) VALUES ('hash-batch', 'hash:internal', '${"c".repeat(64)}', 'staged')`);
    assert.equal(
      Number(
        (
          await sqlOne(
            fixture.client,
            "SELECT content_revision FROM entity_publications WHERE entity_id = 'pen-v2'",
          )
        ).content_revision,
      ),
      revisionBeforeInternal,
    );
    assert.equal(
      await computePublicationContentHash(fixture.client, "pen-v2"),
      hashBeforeInternal,
    );

    await fixture.client.execute(
      "DELETE FROM entity_aliases WHERE id = 'hash-alias'",
    );
    assert.equal(
      await computePublicationContentHash(fixture.client, "pen-v2"),
      originalHash,
    );
    assert.equal(
      Number(
        (
          await sqlOne(
            fixture.client,
            `SELECT count(*) AS count FROM entity_content_reviews
             WHERE entity_id = 'pen-v2' AND status = 'approved'`,
          )
        ).count,
      ),
      0,
    );

    await republishV3(fixture.client, "pen-v2");
    await fixture.client.execute(`INSERT INTO tags (
      id, name, slug, dimension, level
    ) VALUES ('tag-taxonomy', 'Taxonomy tag', 'taxonomy-tag', 'identity', 'atom')`);
    await fixture.client.execute(`INSERT INTO entity_tags (
      id, entity_id, tag_id
    ) VALUES ('pen-v2-tag', 'pen-v2', 'tag-taxonomy')`);
    assert.equal(
      (
        await sqlOne(
          fixture.client,
          "SELECT status FROM entity_publications WHERE entity_id = 'pen-v2'",
        )
      ).status,
      "in_review",
    );
    assert.deepEqual(
      (
        (await readPublicationContentPayload(
          fixture.client,
          "pen-v2",
        )) as Record<string, unknown>
      ).canonicalTagIds,
      ["tag-taxonomy"],
    );

    await republishV3(fixture.client, "pen-v2");
    await fixture.client.execute(`INSERT INTO entities (
      id, type, slug, name, summary
    ) VALUES ('series-entity', 'concept', 'series-entity', 'Series entity', 'series')`);
    await fixture.client.execute(`INSERT INTO entity_links (
      id, source_id, target_id, link_type, reason
    ) VALUES ('pen-v2-series', 'pen-v2', 'series-entity', 'member_of_series', 'fixture')`);
    assert.equal(
      (
        await sqlOne(
          fixture.client,
          "SELECT status FROM entity_publications WHERE entity_id = 'pen-v2'",
        )
      ).status,
      "in_review",
    );
    assert.ok(
      (
        (
          (await readPublicationContentPayload(
            fixture.client,
            "pen-v2",
          )) as Record<string, unknown>
        ).taxonomyLinks as Record<string, unknown>[]
      ).some((link) => link.linkType === "member_of_series"),
    );

    await republishV3(fixture.client, "pen-v2");
    const unrelatedRevision = Number(
      (
        await sqlOne(
          fixture.client,
          "SELECT content_revision FROM entity_publications WHERE entity_id = 'pen-v2'",
        )
      ).content_revision,
    );
    const unrelatedHash = await computePublicationContentHash(
      fixture.client,
      "pen-v2",
    );
    await fixture.client.execute(`INSERT INTO entity_links (
      id, source_id, target_id, link_type, reason
    ) VALUES ('pen-v2-unrelated', 'pen-v2', 'series-entity', 'related', 'internal')`);
    assert.equal(
      Number(
        (
          await sqlOne(
            fixture.client,
            "SELECT content_revision FROM entity_publications WHERE entity_id = 'pen-v2'",
          )
        ).content_revision,
      ),
      unrelatedRevision,
    );
    assert.equal(
      await computePublicationContentHash(fixture.client, "pen-v2"),
      unrelatedHash,
    );

    await republishV3(fixture.client, "pen-v2");
    await fixture.client.execute(`INSERT INTO model_variants (
      id, model_entity_id, variant_name, variant_kind, product_code, market,
      source_item_id, review_status
    ) VALUES ('hash-edition', 'pen-v2', 'Hash edition', 'edition_group',
      'SKU-1', 'JP', 'source-primary', 'approved')`);
    assert.equal(
      (
        await sqlOne(
          fixture.client,
          "SELECT status FROM entity_publications WHERE entity_id = 'pen-v2'",
        )
      ).status,
      "in_review",
    );
    assert.equal(
      Number(
        (
          await sqlOne(
            fixture.client,
            "SELECT count(*) AS count FROM public_entities WHERE id = 'pen-v2'",
          )
        ).count,
      ),
      0,
    );
    assert.ok(
      (
        (
          (await readPublicationContentPayload(
            fixture.client,
            "pen-v2",
          )) as Record<string, unknown>
        ).modelVariants as Record<string, unknown>[]
      ).some(
        (variant) =>
          variant.id === "hash-edition" &&
          variant.variantKind === "edition_group" &&
          variant.productCode === "SKU-1" &&
          variant.market === "JP",
      ),
    );
  });
});
