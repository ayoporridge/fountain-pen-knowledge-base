import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase62SheafferP0Content } from "../../scripts/apply-phase62-sheaffer-p0-content";
import { applyPhase75SheafferLegacyHeritageContent } from "../../scripts/apply-phase75-sheaffer-legacy-heritage-content";
import {
  type ApplyPhase106Options,
  applyPhase106SheafferConnaisseurImperialIconContent,
} from "../../scripts/apply-phase106-sheaffer-connaisseur-imperial-icon-content";
import {
  PHASE62_BALANCE_ID,
  PHASE62_MIXED_IMPERIAL_ID,
  PHASE62_MIXED_IMPERIAL_SLUG,
  PHASE62_PFM_ID,
  PHASE62_SHEAFFER_ID,
  PHASE62_SNORKEL_ID,
  PHASE62_TARGA_ID,
} from "../../scripts/data/phase62-sheaffer-p0";
import { PHASE75_LEGACY_HERITAGE_ID } from "../../scripts/data/phase75-sheaffer-legacy-heritage";
import {
  PHASE106_CONNAISSEUR_ID,
  PHASE106_CONNAISSEUR_RAW_SLUG,
  PHASE106_CONNAISSEUR_SLUG,
  PHASE106_ICON_ID,
  PHASE106_ICON_SLUG,
  PHASE106_IMPERIAL_ID,
  PHASE106_IMPERIAL_SLUG,
  phase106SheafferPacks,
} from "../../scripts/data/phase106-sheaffer-connaisseur-imperial-icon";
import { loadCuratedEntityPack } from "../../scripts/lib/curated-content-pack";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const TARGET_IDS = [
  PHASE106_CONNAISSEUR_ID,
  PHASE106_IMPERIAL_ID,
  PHASE106_ICON_ID,
] as const;
const PROTECTED_IDS = [
  PHASE62_SHEAFFER_ID,
  PHASE62_BALANCE_ID,
  PHASE62_SNORKEL_ID,
  PHASE62_PFM_ID,
  PHASE62_TARGA_ID,
  PHASE75_LEGACY_HERITAGE_ID,
] as const;
const LIFECYCLE_PROTECTED_IDS = PROTECTED_IDS.filter(
  (id) => id !== PHASE62_SHEAFFER_ID,
);

async function rows(client: Client, sql: string, args: string[] = []) {
  return (await client.execute({ sql, args })).rows;
}

async function scalar(client: Client, sql: string, args: string[] = []) {
  return Number((await rows(client, sql, args))[0]?.value ?? 0);
}

async function protectedSummary(client: Client) {
  const placeholders = PROTECTED_IDS.map(() => "?").join(",");
  const lifecyclePlaceholders = LIFECYCLE_PROTECTED_IDS.map(() => "?").join(
    ",",
  );
  return {
    entities: await rows(
      client,
      `SELECT id,type,slug,name,summary,body_md,source FROM entities WHERE id IN (${placeholders}) ORDER BY id`,
      [...PROTECTED_IDS],
    ),
    publications: await rows(
      client,
      `SELECT entity_id,status,depth_tier,blockers_json,approved_content_hash,content_revision,reviewed_content_revision,reviewed_contract_version,reviewed_by,reviewed_at,published_at,review_notes FROM entity_publications WHERE entity_id IN (${lifecyclePlaceholders}) ORDER BY entity_id`,
      [...LIFECYCLE_PROTECTED_IDS],
    ),
    stories: await rows(
      client,
      `SELECT entity_id,id,title,story_type,summary,body_md,status,source_notes FROM stories WHERE entity_id IN (${placeholders}) ORDER BY entity_id,id`,
      [...PROTECTED_IDS],
    ),
    specs: await rows(
      client,
      `SELECT entity_id,id,brand_entity_id,series_name,release_year,origin_country,nib,fill_system,material,dimensions,weight,price_range,status,review_status FROM model_specs WHERE entity_id IN (${placeholders}) ORDER BY entity_id,id`,
      [...PROTECTED_IDS],
    ),
    references: await rows(
      client,
      `SELECT entity_id,id,source_item_id,relation_type,note,review_status FROM entity_references WHERE entity_id IN (${placeholders}) ORDER BY entity_id,id`,
      [...PROTECTED_IDS],
    ),
    reviews: await rows(
      client,
      `SELECT entity_id,review_kind,content_hash,status,reviewer,reviewed_at,note FROM entity_content_reviews WHERE entity_id IN (${lifecyclePlaceholders}) ORDER BY entity_id,review_kind,content_hash`,
      [...LIFECYCLE_PROTECTED_IDS],
    ),
  };
}

async function brandPayloadSummary(client: Client) {
  return {
    entity: await rows(
      client,
      "SELECT id,type,slug,name,summary,body_md,source,source_url,source_file,imported_at FROM entities WHERE id=?",
      [PHASE62_SHEAFFER_ID],
    ),
    stories: await rows(
      client,
      "SELECT id,entity_id,title,story_type,summary,body_md,status,source_notes FROM stories WHERE entity_id=? ORDER BY id",
      [PHASE62_SHEAFFER_ID],
    ),
    specs: await rows(
      client,
      "SELECT id,entity_id,brand_entity_id,series_name,release_year,origin_country,nib,fill_system,material,dimensions,weight,price_range,status,review_status FROM model_specs WHERE entity_id=? ORDER BY id",
      [PHASE62_SHEAFFER_ID],
    ),
    references: await rows(
      client,
      "SELECT id,entity_id,source_item_id,relation_type,note,review_status FROM entity_references WHERE entity_id=? ORDER BY id",
      [PHASE62_SHEAFFER_ID],
    ),
    media: await rows(
      client,
      "SELECT id,entity_id,title,asset_type,image_url,thumbnail_url,local_path,author,license,attribution_text,source_url,source_item_id,review_status,usage_status FROM media_assets WHERE entity_id=? ORDER BY id",
      [PHASE62_SHEAFFER_ID],
    ),
  };
}

async function donorSummary(client: Client) {
  return {
    entity: await rows(
      client,
      "SELECT id,type,slug,name,summary,body_md,source FROM entities WHERE id=?",
      [PHASE62_MIXED_IMPERIAL_ID],
    ),
    publication: await rows(
      client,
      "SELECT entity_id,status,blockers_json,approved_content_hash,content_revision,reviewed_content_revision,reviewed_contract_version,review_notes FROM entity_publications WHERE entity_id=?",
      [PHASE62_MIXED_IMPERIAL_ID],
    ),
    makers: await rows(
      client,
      "SELECT id,target_id,link_type,reason FROM entity_links WHERE source_id=? AND link_type='made_by' ORDER BY id",
      [PHASE62_MIXED_IMPERIAL_ID],
    ),
    redirect: await rows(
      client,
      "SELECT source_path,target_path,redirect_kind,fallback_reason FROM entity_redirects WHERE source_path=?",
      [`/pen/${PHASE62_MIXED_IMPERIAL_SLUG}`],
    ),
  };
}

async function targetSummary(client: Client) {
  const placeholders = TARGET_IDS.map(() => "?").join(",");
  return {
    entities: await rows(
      client,
      `SELECT id,type,slug,name,summary,body_md,source FROM entities WHERE id IN (${placeholders}) ORDER BY id`,
      [...TARGET_IDS],
    ),
    publications: await rows(
      client,
      `SELECT entity_id,status,approved_content_hash,content_revision,reviewed_content_revision,reviewed_contract_version,reviewed_by,reviewed_at,published_at FROM entity_publications WHERE entity_id IN (${placeholders}) ORDER BY entity_id`,
      [...TARGET_IDS],
    ),
    reviews: await rows(
      client,
      `SELECT entity_id,review_kind,content_hash,status,reviewer,reviewed_at,note FROM entity_content_reviews WHERE entity_id IN (${placeholders}) ORDER BY entity_id,review_kind,content_hash`,
      [...TARGET_IDS],
    ),
  };
}

async function databaseSummary(client: Client) {
  return {
    entities: await scalar(client, "SELECT count(*) AS value FROM entities"),
    targets: await targetSummary(client),
  };
}

async function assertFailClosed(
  client: Client,
  options: ApplyPhase106Options,
  expected: RegExp,
) {
  const before = await databaseSummary(client);
  await assert.rejects(
    applyPhase106SheafferConnaisseurImperialIconContent(client, options),
    expected,
  );
  assert.deepEqual(await databaseSummary(client), before);
}

test("Phase 106 publishes Connaisseur, Imperial and Icon without disturbing prior Sheaffer canon", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase106-")),
  );
  const outsideRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase106-outside-")),
  );
  const aliasRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase106-alias-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase106Options = {
    workspaceRoot: ROOT,
    reviewer: "phase106-test",
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
    await applyPhase62SheafferP0Content(client, options);
    await applyPhase75SheafferLegacyHeritageContent(client, options);
    const protectedBefore = await protectedSummary(client);
    const brandPayloadBefore = await brandPayloadSummary(client);
    const donorBefore = await donorSummary(client);
    const publicPensBefore = await rows(
      client,
      "SELECT pen.id,pen.slug FROM public_entities pen JOIN entity_links maker ON maker.source_id=pen.id AND maker.link_type='made_by' WHERE maker.target_id=? AND pen.type='pen' ORDER BY pen.id",
      [PHASE62_SHEAFFER_ID],
    );

    await assertFailClosed(
      client,
      {
        ...options,
        env: {
          ...options.env,
          NODE_ENV: options.env?.NODE_ENV ?? "test",
          TURSO_DATABASE_URL: "libsql://remote",
        },
      },
      /refuses inherited remote database selection/,
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

    const mismatch = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(ownedRoot, "mismatch.db"),
      ownedRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const mismatchClient = createClient({
      url: `file:${mismatch.destinationPath}`,
    });
    extraClients.push(mismatchClient);
    await migrateDatabase(mismatchClient);
    await assertFailClosed(
      client,
      { ...options, databasePath: mismatch.destinationPath },
      /client is not bound/,
    );

    const outside = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(outsideRoot, "outside.db"),
      outsideRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const outsideClient = createClient({
      url: `file:${outside.destinationPath}`,
    });
    extraClients.push(outsideClient);
    await migrateDatabase(outsideClient);
    await assertFailClosed(
      outsideClient,
      { ...options, databasePath: outside.destinationPath },
      /caller-owned root/,
    );

    const disposableProtected = copyCheckpointedCatalogToDisposableCopy(
      REAL,
      path.join(aliasRoot, "protected.db"),
      aliasRoot,
      { expectedSourceSnapshot: protectedSnapshot },
    );
    const protectedClient = createClient({
      url: `file:${disposableProtected.destinationPath}`,
    });
    await migrateDatabase(protectedClient);
    protectedClient.close();
    const hardLinkPath = path.join(ownedRoot, "hard-link.db");
    fs.linkSync(disposableProtected.destinationPath, hardLinkPath);
    const hardLinkClient = createClient({ url: `file:${hardLinkPath}` });
    extraClients.push(hardLinkClient);
    await assert.rejects(
      applyPhase106SheafferConnaisseurImperialIconContent(hardLinkClient, {
        ...options,
        databasePath: hardLinkPath,
        protectedCatalogPath: disposableProtected.destinationPath,
        protectedCatalogSnapshot: snapshotCatalogFiles(
          disposableProtected.destinationPath,
        ),
      }),
      /hard-link alias/,
    );

    const unmigratedPath = path.join(ownedRoot, "unmigrated.db");
    const unmigratedClient = createClient({ url: `file:${unmigratedPath}` });
    extraClients.push(unmigratedClient);
    await unmigratedClient.execute(
      "CREATE TABLE migrations (name TEXT PRIMARY KEY, checksum TEXT)",
    );
    await assert.rejects(
      applyPhase106SheafferConnaisseurImperialIconContent(unmigratedClient, {
        ...options,
        databasePath: unmigratedPath,
      }),
      /migrated through 032/,
    );
    assert.equal(
      await scalar(
        unmigratedClient,
        "SELECT count(*) AS value FROM migrations",
      ),
      0,
    );

    await client.execute({
      sql: "UPDATE entities SET slug=? WHERE id=?",
      args: ["phase106-wrong-connaisseur-raw", PHASE106_CONNAISSEUR_ID],
    });
    await assertFailClosed(
      client,
      options,
      /Connaisseur raw identity or canonical slug collision/,
    );
    await client.execute({
      sql: "UPDATE entities SET slug=? WHERE id=?",
      args: [PHASE106_CONNAISSEUR_RAW_SLUG, PHASE106_CONNAISSEUR_ID],
    });

    await client.execute({
      sql: "INSERT INTO entities (id,type,slug,name) VALUES (?,'pen',?,?)",
      args: [
        "phase106-imperial-slug-collision-fixture",
        PHASE106_IMPERIAL_SLUG,
        "Phase 106 collision fixture",
      ],
    });
    await assertFailClosed(
      client,
      options,
      /entity or slug collision: sheaffer-imperial/,
    );
    await client.execute({
      sql: "DELETE FROM entities WHERE id=?",
      args: ["phase106-imperial-slug-collision-fixture"],
    });

    for (const pack of phase106SheafferPacks) {
      const loaded = loadCuratedEntityPack(ROOT, pack);
      assert.ok(Array.from(loaded.summary).length >= 60);
      assert.ok(Array.from(loaded.summary).length <= 160);
      assert.ok(Array.from(loaded.bodyMd).length >= 2_000);
      assert.ok(
        loaded.sources.every(
          (source) => source.archiveUrl && source.archiveLocator,
        ),
      );
      assert.ok(
        new Set(loaded.sources.map((source) => source.independenceGroup))
          .size >= 2,
      );
      assert.ok(loaded.claims.length >= 2);
      assert.ok(loaded.claims.every((claim) => claim.evidence.length >= 1));
      assert.ok((loaded.spec?.evidence.length ?? 0) >= 8);
      assert.equal(
        loaded.media.filter((media) => media.usageStatus === "primary").length,
        1,
      );
    }

    const first = await applyPhase106SheafferConnaisseurImperialIconContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map(({ entityId, outcome }) => ({ entityId, outcome })),
      TARGET_IDS.map((entityId) => ({ entityId, outcome: "published" })),
    );

    const pages = await rows(
      client,
      "SELECT id,type,slug,summary,body_md,source FROM public_entities WHERE id IN (?,?,?) ORDER BY CASE id WHEN ? THEN 1 WHEN ? THEN 2 ELSE 3 END",
      [...TARGET_IDS, ...TARGET_IDS.slice(0, 2)],
    );
    assert.equal(pages.length, 3);
    assert.deepEqual(
      pages.map((page) => String(page.slug)),
      [PHASE106_CONNAISSEUR_SLUG, PHASE106_IMPERIAL_SLUG, PHASE106_ICON_SLUG],
    );
    for (const page of pages) {
      assert.equal(String(page.type), "pen");
      assert.ok(Array.from(String(page.summary)).length >= 60);
      assert.ok(Array.from(String(page.summary)).length <= 160);
      assert.ok(Array.from(String(page.body_md)).length >= 2_000);
      assert.match(String(page.source), /^curated-content:phase106-/);
    }
    assert.match(
      String(pages[0]?.body_md),
      /1986[\s\S]*开放式[\s\S]*cartridge\/converter/,
    );
    assert.match(
      String(pages[1]?.body_md),
      /Imperial IV[\s\S]*Imperial VI[\s\S]*Imperial VIII/,
    );
    assert.match(String(pages[1]?.body_md), /Touchdown[\s\S]*cartridge/);
    assert.match(String(pages[1]?.body_md), /PFM[\s\S]*Targa[\s\S]*Legacy/);
    assert.match(
      String(pages[2]?.body_md),
      /9108[\s\S]*stainless-steel[\s\S]*converter/,
    );
    assert.doesNotMatch(
      String(pages[2]?.body_md),
      /具备(?:明确|可量化).*flex|所有 Icon.*(?:都是|只有).*9108/,
    );

    const route = await rows(
      client,
      "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
      [`/pen/${PHASE106_CONNAISSEUR_RAW_SLUG}`],
    );
    assert.deepEqual(route, [
      {
        target_path: `/pen/${PHASE106_CONNAISSEUR_SLUG}`,
        redirect_kind: "permanent",
      },
    ]);
    const identities = await rows(
      client,
      "SELECT id,type,slug FROM entities WHERE id IN (?,?,?) ORDER BY id",
      [...TARGET_IDS],
    );
    assert.equal(identities.length, 3);
    assert.equal(new Set(identities.map((row) => String(row.slug))).size, 3);
    assert.ok(
      identities.some(
        (row) =>
          String(row.id) === PHASE106_CONNAISSEUR_ID &&
          String(row.slug) === PHASE106_CONNAISSEUR_SLUG,
      ),
    );

    for (const id of TARGET_IDS) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
          [id, PHASE62_SHEAFFER_ID],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND link_type='made_by'",
          [id],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
          [id],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved'",
          [id],
        ),
        1,
      );
      const reviewKinds = await rows(
        client,
        "SELECT review_kind,count(*) AS value FROM entity_content_reviews WHERE entity_id=? AND content_hash=(SELECT approved_content_hash FROM entity_publications WHERE entity_id=?) AND status='approved' GROUP BY review_kind ORDER BY review_kind",
        [id, id],
      );
      assert.deepEqual(reviewKinds, [
        { review_kind: "fact", value: 1 },
        { review_kind: "language", value: 1 },
        { review_kind: "media", value: 1 },
        { review_kind: "publication", value: 1 },
      ]);
      assert.deepEqual(
        await rows(
          client,
          "SELECT publishable,blocker_count FROM public_entity_readiness WHERE entity_id=? AND contract_version=3",
          [id],
        ),
        [{ publishable: 1, blocker_count: 0 }],
      );
    }

    const iconVariants = await rows(
      client,
      "SELECT variant_kind,product_code,variant_name FROM model_variants WHERE model_entity_id=?",
      [PHASE106_ICON_ID],
    );
    assert.deepEqual(iconVariants, [
      {
        variant_kind: "market_sku",
        product_code: "9108",
        variant_name: "Icon 9108 Matte Black fountain pen",
      },
    ]);

    assert.deepEqual(await donorSummary(client), donorBefore);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_redirects WHERE target_path=?",
        [`/pen/${PHASE106_IMPERIAL_SLUG}`],
      ),
      0,
    );
    assert.deepEqual(await protectedSummary(client), protectedBefore);
    assert.deepEqual(await brandPayloadSummary(client), brandPayloadBefore);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id=?",
        [PHASE62_SHEAFFER_ID],
      ),
      1,
    );

    const publicPensAfter = await rows(
      client,
      "SELECT pen.id,pen.slug FROM public_entities pen JOIN entity_links maker ON maker.source_id=pen.id AND maker.link_type='made_by' WHERE maker.target_id=? AND pen.type='pen' ORDER BY pen.id",
      [PHASE62_SHEAFFER_ID],
    );
    const added = publicPensAfter.filter(
      (row) =>
        !publicPensBefore.some(
          (before) => String(before.id) === String(row.id),
        ),
    );
    assert.deepEqual(
      added.map((row) => String(row.id)).sort(),
      [...TARGET_IDS].sort(),
    );

    const beforeReplay = await targetSummary(client);
    const replay = await applyPhase106SheafferConnaisseurImperialIconContent(
      client,
      options,
    );
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
    assert.deepEqual(await targetSummary(client), beforeReplay);
  } finally {
    for (const extra of extraClients) extra.close();
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    fs.rmSync(outsideRoot, { recursive: true, force: true });
    fs.rmSync(aliasRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
});
