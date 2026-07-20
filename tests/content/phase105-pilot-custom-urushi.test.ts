import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyCuratedContentPacks } from "../../scripts/apply-phase22-content";
import {
  type ApplyPhase105Options,
  applyPhase105PilotCustomUrushiContent,
  PHASE105_PILOT_ID,
  PHASE105_URUSHI_ID,
  PHASE105_URUSHI_SLUG,
} from "../../scripts/apply-phase105-pilot-custom-urushi-content";
import {
  phase84PlatinumPilotP0V3BrandPacks,
  phase84PlatinumPilotP0V3Packs,
} from "../../scripts/data/phase84-platinum-pilot-p0-v3";
import {
  PHASE105_URUSHI_SLUG as PACK_SLUG,
  phase105PilotCustomUrushiPack,
} from "../../scripts/data/phase105-pilot-custom-urushi";
import {
  loadCuratedEntityPack,
  packId,
} from "../../scripts/lib/curated-content-pack";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

async function databaseSummary(client: Client) {
  const entityCount = await client.execute(
    "SELECT count(*) AS value FROM entities",
  );
  const target = await client.execute({
    sql: "SELECT status,content_revision,approved_content_hash FROM entity_publications WHERE entity_id=?",
    args: [PHASE105_URUSHI_ID],
  });
  return {
    entityCount: Number(entityCount.rows[0]?.value ?? 0),
    target: target.rows,
  };
}

async function brandSummary(client: Client) {
  const entity = await client.execute({
    sql: "SELECT id,type,slug,name,summary,body_md,source FROM entities WHERE id=?",
    args: [PHASE105_PILOT_ID],
  });
  const publication = await client.execute({
    sql: `SELECT status,depth_tier,blockers_json,approved_content_hash,
                 content_revision,reviewed_content_revision,reviewed_contract_version,
                 reviewed_by,reviewed_at,published_at,review_notes
          FROM entity_publications WHERE entity_id=?`,
    args: [PHASE105_PILOT_ID],
  });
  const reviews = await client.execute({
    sql: `SELECT review_kind,content_hash,status,reviewer,reviewed_at,note
          FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash`,
    args: [PHASE105_PILOT_ID],
  });
  const references = await client.execute({
    sql: "SELECT id,source_item_id,relation_type,note,review_status FROM entity_references WHERE entity_id=? ORDER BY id",
    args: [PHASE105_PILOT_ID],
  });
  return {
    entity: entity.rows,
    publication: publication.rows,
    reviews: reviews.rows,
    references: references.rows,
  };
}

async function preparePublishedPilotBrand(
  client: Client,
  options: ApplyPhase105Options,
) {
  const brand = phase84PlatinumPilotP0V3BrandPacks.find(
    (pack) => pack.entityId === PHASE105_PILOT_ID,
  );
  const pen = phase84PlatinumPilotP0V3Packs.find(
    (pack) => pack.spec?.brandEntityId === PHASE105_PILOT_ID,
  );
  assert.ok(brand && pen, "Phase 84 Pilot fixture packs must exist");
  const urushiPack = loadCuratedEntityPack(ROOT, phase105PilotCustomUrushiPack);
  await client.execute({
    sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
    args: [
      PHASE105_URUSHI_ID,
      PHASE105_URUSHI_SLUG,
      "Pilot Custom URUSHI fixture",
    ],
  });
  await client.execute({
    sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
    args: [
      packId(urushiPack, "made-by", PHASE105_PILOT_ID),
      PHASE105_URUSHI_ID,
      PHASE105_PILOT_ID,
      "Phase 105 exact Pilot maker relation",
    ],
  });
  await client.execute({
    sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
    args: [pen.entityId, pen.expectedSlug, pen.canonicalName],
  });
  await client.execute({
    sql: "UPDATE entities SET type='pen',slug=?,name=? WHERE id=?",
    args: [pen.expectedSlug, pen.canonicalName, pen.entityId],
  });
  await client.execute({
    sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by'",
    args: [pen.entityId],
  });
  await client.execute({
    sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by','Phase 105 test Pilot brand publication prerequisite')",
    args: [
      `phase105-brand-fixture-${pen.entityId}`,
      pen.entityId,
      PHASE105_PILOT_ID,
    ],
  });
  await applyCuratedContentPacks(
    client,
    options,
    structuredClone([brand, pen]),
  );
}

async function assertFailClosed(
  client: Client,
  options: ApplyPhase105Options,
  expected: RegExp,
) {
  const before = await databaseSummary(client);
  await assert.rejects(
    applyPhase105PilotCustomUrushiContent(client, options),
    expected,
  );
  assert.deepEqual(await databaseSummary(client), before);
}

test("Phase 105 publishes only Custom URUSHI through contract-v3 on an owned checkpoint", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase105-")),
  );
  const outsideRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase105-outside-")),
  );
  const hardLinkRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase105-hardlink-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase105Options = {
    workspaceRoot: ROOT,
    reviewer: "phase105-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };
  const extraClients: Client[] = [];
  try {
    await migrateDatabase(client);
    await preparePublishedPilotBrand(client, options);
    const pilotBefore = await brandSummary(client);

    await assertFailClosed(
      client,
      {
        ...options,
        env: {
          ...process.env,
          TURSO_DATABASE_URL: "libsql://remote",
          TURSO_AUTH_TOKEN: "",
          FPKG_DATABASE_URL: "",
        },
      },
      /refuses inherited remote database selection: TURSO_DATABASE_URL/,
    );
    await assertFailClosed(
      client,
      { ...options, reviewer: "   " },
      /reviewer must not be empty/,
    );

    const symlinkPath = path.join(ownedRoot, "catalog-symlink.db");
    fs.symlinkSync(copy.destinationPath, symlinkPath);
    await assertFailClosed(
      client,
      { ...options, databasePath: symlinkPath },
      /non-symlink catalog file/,
    );

    const mismatchCopy = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(ownedRoot, "mismatch.db"),
      ownedRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const mismatchClient = createClient({
      url: `file:${mismatchCopy.destinationPath}`,
    });
    extraClients.push(mismatchClient);
    await migrateDatabase(mismatchClient);
    await assertFailClosed(
      client,
      { ...options, databasePath: mismatchCopy.destinationPath },
      /client is not bound/,
    );

    const outsideCopy = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(outsideRoot, "outside.db"),
      outsideRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const outsideClient = createClient({
      url: `file:${outsideCopy.destinationPath}`,
    });
    extraClients.push(outsideClient);
    await migrateDatabase(outsideClient);
    await assertFailClosed(
      outsideClient,
      { ...options, databasePath: outsideCopy.destinationPath },
      /caller-owned root/,
    );

    const disposableProtected = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(hardLinkRoot, "disposable-protected.db"),
      hardLinkRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const disposableProtectedClient = createClient({
      url: `file:${disposableProtected.destinationPath}`,
    });
    await migrateDatabase(disposableProtectedClient);
    disposableProtectedClient.close();
    const hardLinkPath = path.join(ownedRoot, "hard-link-alias.db");
    fs.linkSync(disposableProtected.destinationPath, hardLinkPath);
    const hardLinkClient = createClient({ url: `file:${hardLinkPath}` });
    extraClients.push(hardLinkClient);
    const disposableSnapshot = snapshotCatalogFiles(
      disposableProtected.destinationPath,
    );
    await assert.rejects(
      applyPhase105PilotCustomUrushiContent(hardLinkClient, {
        ...options,
        databasePath: hardLinkPath,
        protectedCatalogPath: disposableProtected.destinationPath,
        protectedCatalogSnapshot: disposableSnapshot,
      }),
      /hard-link alias/,
    );
    assert.deepEqual(
      snapshotCatalogFiles(disposableProtected.destinationPath),
      disposableSnapshot,
    );

    const loaded = loadCuratedEntityPack(ROOT, phase105PilotCustomUrushiPack);
    assert.equal(PACK_SLUG, PHASE105_URUSHI_SLUG);
    assert.ok(Array.from(loaded.summary).length >= 60);
    assert.ok(Array.from(loaded.summary).length <= 160);
    assert.ok(Array.from(loaded.bodyMd).length >= 2_000);
    assert.ok(
      loaded.sources.every(
        (source) => source.archiveUrl && source.archiveLocator,
      ),
    );
    assert.equal(
      loaded.media.filter((media) => media.usageStatus === "primary").length,
      1,
    );

    const first = await applyPhase105PilotCustomUrushiContent(client, options);
    assert.deepEqual(first.entities, [
      {
        entityId: PHASE105_URUSHI_ID,
        outcome: "published",
        contentHash: first.entities[0]?.contentHash,
      },
    ]);
    const page = await client.execute({
      sql: "SELECT slug,body_md,source FROM public_entities WHERE id=?",
      args: [PHASE105_URUSHI_ID],
    });
    assert.equal(page.rows.length, 1);
    assert.equal(String(page.rows[0]?.slug), PHASE105_URUSHI_SLUG);
    assert.ok(Array.from(String(page.rows[0]?.body_md)).length >= 2_000);
    assert.match(String(page.rows[0]?.source), /^curated-content:phase105-/);

    const publication = await client.execute({
      sql: `SELECT status,approved_content_hash,content_revision,
                   reviewed_content_revision,reviewed_contract_version,
                   reviewed_by,reviewed_at,published_at
            FROM entity_publications WHERE entity_id=?`,
      args: [PHASE105_URUSHI_ID],
    });
    const publicationRow = publication.rows[0];
    assert.equal(String(publicationRow?.status), "published");
    assert.equal(
      String(publicationRow?.approved_content_hash),
      first.entities[0]?.contentHash,
    );
    assert.equal(
      Number(publicationRow?.reviewed_content_revision),
      Number(publicationRow?.content_revision),
    );
    assert.equal(Number(publicationRow?.reviewed_contract_version), 3);
    assert.equal(String(publicationRow?.reviewed_by), options.reviewer);
    assert.ok(String(publicationRow?.reviewed_at).length > 0);
    assert.ok(String(publicationRow?.published_at).length > 0);

    const reviews = await client.execute({
      sql: `SELECT review_kind,count(*) AS value FROM entity_content_reviews
            WHERE entity_id=? AND content_hash=? AND status='approved'
            GROUP BY review_kind ORDER BY review_kind`,
      args: [PHASE105_URUSHI_ID, first.entities[0]?.contentHash ?? ""],
    });
    assert.deepEqual(reviews.rows, [
      { review_kind: "fact", value: 1 },
      { review_kind: "language", value: 1 },
      { review_kind: "media", value: 1 },
      { review_kind: "publication", value: 1 },
    ]);

    const officialReferences = await client.execute({
      sql: `SELECT count(*) AS value FROM entity_references reference
            JOIN source_items source ON source.id=reference.source_item_id
            WHERE reference.entity_id=? AND reference.relation_type='official'
              AND source.independence_group='pilot-official'`,
      args: [PHASE105_URUSHI_ID],
    });
    assert.equal(Number(officialReferences.rows[0]?.value), 3);
    const evidenceGraph = await client.execute({
      sql: `SELECT
              (SELECT count(*) FROM claims WHERE subject_entity_id=?) AS claims,
              (SELECT count(*) FROM claim_evidence evidence JOIN claims claim ON claim.id=evidence.claim_id WHERE claim.subject_entity_id=?) AS claim_evidence,
              (SELECT count(*) FROM fact_scopes WHERE entity_id=?) AS scopes,
              (SELECT count(*) FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=?) AS spec_evidence,
              (SELECT count(*) FROM model_variants WHERE model_entity_id=?) AS variants`,
      args: Array(5).fill(PHASE105_URUSHI_ID),
    });
    assert.ok(Number(evidenceGraph.rows[0]?.claims) >= 3);
    assert.ok(Number(evidenceGraph.rows[0]?.claim_evidence) >= 4);
    assert.equal(Number(evidenceGraph.rows[0]?.scopes), 1);
    assert.ok(Number(evidenceGraph.rows[0]?.spec_evidence) >= 9);
    assert.equal(Number(evidenceGraph.rows[0]?.variants), 3);

    const variants = await client.execute({
      sql: "SELECT variant_name FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
      args: [PHASE105_URUSHI_ID],
    });
    assert.deepEqual(
      variants.rows.map((row) => String(row.variant_name)).sort(),
      ["朱", "漆黑", "紺青"].sort(),
    );
    const maker = await client.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE105_URUSHI_ID],
    });
    assert.deepEqual(maker.rows, [{ target_id: PHASE105_PILOT_ID }]);
    const media = await client.execute({
      sql: "SELECT local_path,attribution_text FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved'",
      args: [PHASE105_URUSHI_ID],
    });
    assert.deepEqual(
      media.rows.map((row) => String(row.local_path)),
      ["/images/library/site-original/pilot/custom-urushi.svg"],
    );
    assert.match(String(media.rows[0]?.attribution_text), /非产品照片/);
    const readiness = await client.execute({
      sql: "SELECT publishable,blocker_count FROM public_entity_readiness WHERE entity_id=? AND contract_version=3",
      args: [PHASE105_URUSHI_ID],
    });
    assert.deepEqual(readiness.rows, [{ publishable: 1, blocker_count: 0 }]);

    const beforeReplay = {
      publication: publication.rows,
      reviews: reviews.rows,
    };
    const replay = await applyPhase105PilotCustomUrushiContent(client, options);
    assert.deepEqual(replay.entities, [
      {
        entityId: PHASE105_URUSHI_ID,
        outcome: "noop",
        contentHash: first.entities[0]?.contentHash,
      },
    ]);
    const afterReplayPublication = await client.execute({
      sql: `SELECT status,approved_content_hash,content_revision,
                   reviewed_content_revision,reviewed_contract_version,
                   reviewed_by,reviewed_at,published_at
            FROM entity_publications WHERE entity_id=?`,
      args: [PHASE105_URUSHI_ID],
    });
    const afterReplayReviews = await client.execute({
      sql: `SELECT review_kind,count(*) AS value FROM entity_content_reviews
            WHERE entity_id=? AND content_hash=? AND status='approved'
            GROUP BY review_kind ORDER BY review_kind`,
      args: [PHASE105_URUSHI_ID, first.entities[0]?.contentHash ?? ""],
    });
    assert.deepEqual(afterReplayPublication.rows, beforeReplay.publication);
    assert.deepEqual(afterReplayReviews.rows, beforeReplay.reviews);
    assert.deepEqual(await brandSummary(client), pilotBefore);
  } finally {
    for (const extra of extraClients) extra.close();
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    fs.rmSync(outsideRoot, { recursive: true, force: true });
    fs.rmSync(hardLinkRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
});
