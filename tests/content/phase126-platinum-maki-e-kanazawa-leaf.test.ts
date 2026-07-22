import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase42LamyPlatinumContent } from "../../scripts/apply-phase42-lamy-platinum-content";
import { applyPhase44PlatinumLowPriceContent } from "../../scripts/apply-phase44-platinum-low-price-content";
import { applyPhase78PlatinumCuridasContent } from "../../scripts/apply-phase78-platinum-curidas-content";
import { applyPhase121PlatinumProcyonContent } from "../../scripts/apply-phase121-platinum-procyon-pns-5000-content";
import { applyPhase122PlatinumPresidentContent } from "../../scripts/apply-phase122-platinum-president-ptb-20000p-content";
import { applyPhase123PlatinumIzumoContent } from "../../scripts/apply-phase123-platinum-izumo-piz-80000n-content";
import { applyPhase124PlatinumFujiShunkeiContent } from "../../scripts/apply-phase124-platinum-fuji-shunkei-content";
import { applyPhase125PlatinumSmallMeteorContent } from "../../scripts/apply-phase125-platinum-small-meteor-pq-200-content";
import {
  type ApplyPhase126Options,
  applyPhase126PlatinumMakiEContent,
} from "../../scripts/apply-phase126-platinum-maki-e-kanazawa-leaf-content";
import {
  loadPhase126Packs,
  PHASE126_ARTICLE_ID,
  PHASE126_ARTICLE_NAME,
  PHASE126_ARTICLE_SLUG,
  PHASE126_BRAND_ID,
  PHASE126_LEGACY_MADE_BY_ID,
  PHASE126_LEGACY_REVERSE_ID,
  PHASE126_LINES,
  PHASE126_NEW_MADE_BY_IDS,
  PHASE126_NEW_REVERSE_IDS,
  PHASE126_RAW_NAME,
  PHASE126_RAW_SLUG,
  PHASE126_TARGET_IDS,
} from "../../scripts/data/phase126-platinum-maki-e-kanazawa-leaf";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { getReclassifiedArticlePath } from "../../src/lib/entity-redirects";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../../src/lib/publication";

const ROOT_ALIAS = "/Users/xz/CodeBuddy/fountain-pen-graph";
const ROOT_CANONICAL = "/Users/xz/Documents/fountain-pen-graph";
const REAL = path.join(ROOT_CANONICAL, "data", "fpkg.db");

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

async function scalar(client: Client, sql: string, args: unknown[] = []) {
  return Number(
    (await client.execute({ sql, args: args as never[] })).rows[0]?.value ?? 0,
  );
}

async function digestEntity(client: Client, entityId: string) {
  const queries = [
    "SELECT * FROM entities WHERE id=?",
    "SELECT * FROM stories WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_references WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id",
    "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id",
    "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id",
    "SELECT * FROM model_specs WHERE entity_id=? ORDER BY id",
    "SELECT * FROM model_variants WHERE model_entity_id=? ORDER BY id",
    "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
    "SELECT * FROM entity_publications WHERE entity_id=?",
    "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
  ];
  const payload = [];
  for (const sql of queries)
    payload.push(
      await rows(
        client,
        sql,
        sql.includes(" OR ") ? [entityId, entityId] : [entityId],
      ),
    );
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

async function brandPayloadDigest(client: Client) {
  const payload = await Promise.all([
    rows(client, "SELECT * FROM entities WHERE id=?", [PHASE126_BRAND_ID]),
    rows(client, "SELECT * FROM stories WHERE entity_id=? ORDER BY id", [
      PHASE126_BRAND_ID,
    ]),
    rows(
      client,
      "SELECT * FROM entity_references WHERE entity_id=? ORDER BY id",
      [PHASE126_BRAND_ID],
    ),
    rows(client, "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id", [
      PHASE126_BRAND_ID,
    ]),
    rows(client, "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id", [
      PHASE126_BRAND_ID,
    ]),
    rows(client, "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id", [
      PHASE126_BRAND_ID,
    ]),
    rows(client, "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id", [
      PHASE126_BRAND_ID,
    ]),
  ]);
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

test("Phase 126 reclassifies Platinum Maki-e and publishes three exact product lines", {
  timeout: 700_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase126-makie-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase126Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase126-makie-test",
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
  try {
    await migrateDatabase(client);
    await applyPhase42LamyPlatinumContent(client, options);
    await applyPhase78PlatinumCuridasContent(client, options);
    await applyPhase121PlatinumProcyonContent(client, options);
    await applyPhase122PlatinumPresidentContent(client, options);
    await applyPhase123PlatinumIzumoContent(client, options);
    await applyPhase124PlatinumFujiShunkeiContent(client, options);
    await applyPhase44PlatinumLowPriceContent(client, options);
    for (const reviewKind of ["fact", "language", "media"] as const)
      await recordEntityContentReview(client, {
        entityId: PHASE126_BRAND_ID,
        reviewKind,
        reviewer: options.reviewer,
        status: "approved",
        notes: "Phase 126 fixture restores Platinum after Phase 44 topology.",
      });
    await publishEntity(client, {
      entityId: PHASE126_BRAND_ID,
      reviewer: options.reviewer,
    });
    await applyPhase125PlatinumSmallMeteorContent(client, options);

    assert.equal(
      getReclassifiedArticlePath("pen", PHASE126_RAW_SLUG),
      `/article/${PHASE126_ARTICLE_SLUG}`,
    );
    const packs = loadPhase126Packs(ROOT_ALIAS);
    assert.deepEqual(
      packs.map((pack) => pack.entityId),
      PHASE126_TARGET_IDS,
    );
    assert.deepEqual(
      packs.map((pack) => pack.variants?.length),
      [2, 3, 5],
    );
    for (const pack of packs) {
      assert.ok(Array.from(pack.bodyMd).length >= 2_000);
      assert.match(pack.bodyMd, /\/article\/platinum-maki-e-kanazawa-leaf/);
      assert.ok(pack.sources.some((source) => source.tier === "primary"));
      assert.ok(
        pack.sources.some((source) => source.tier === "professional_secondary"),
      );
    }

    const raw = (
      await rows(client, "SELECT * FROM entities WHERE id=?", [
        PHASE126_ARTICLE_ID,
      ])
    )[0];
    assert.deepEqual(
      [raw?.type, raw?.slug, raw?.name, raw?.source],
      ["pen", PHASE126_RAW_SLUG, PHASE126_RAW_NAME, null],
    );
    assert.equal(Array.from(String(raw?.summary)).length, 51);
    assert.equal(Array.from(String(raw?.body_md)).length, 175);
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT alias FROM entity_aliases WHERE entity_id=? ORDER BY alias",
          [PHASE126_ARTICLE_ID],
        )
      ).map((row) => String(row.alias)),
      [
        "Platinum Maki-e fountain pen",
        "Platinum Maki-e series",
        "白金 莳绘系列",
      ].sort(),
    );
    assert.equal(
      await scalar(
        client,
        "SELECT COUNT(*) value FROM model_specs WHERE entity_id=? AND id='spec-platinum-makie-series-research'",
        [PHASE126_ARTICLE_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT COUNT(*) value FROM media_assets WHERE entity_id=? AND id='media-commerce-77b6f17237ce0f'",
        [PHASE126_ARTICLE_ID],
      ),
      1,
    );
    const legacyLinks = await rows(
      client,
      "SELECT id FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
      [PHASE126_ARTICLE_ID, PHASE126_ARTICLE_ID],
    );
    assert.deepEqual(
      legacyLinks.map((row) => String(row.id)),
      [PHASE126_LEGACY_REVERSE_ID, PHASE126_LEGACY_MADE_BY_ID].sort(),
    );
    const publication = (
      await rows(
        client,
        "SELECT status,content_revision FROM entity_publications WHERE entity_id=?",
        [PHASE126_ARTICLE_ID],
      )
    )[0];
    assert.deepEqual(
      [publication?.status, Number(publication?.content_revision)],
      ["draft", 1],
    );

    const protectedIds = [
      "ekPMWnot9inz",
      "BoZ4C2WSqk0K",
      "phase121-platinum-procyon-pns-5000",
      "a1t4DNomp4Ge",
      "OOumUrtFoAqu",
      "phase123-platinum-izumo-piz-80000n",
      "ogo1UmxmcXJT",
      ...["shungyo", "kumpoo", "rokka", "shiun", "kinshu"].map(
        (key) => `phase124-platinum-fuji-shunkei-${key}`,
      ),
      "s44PLATPREP",
      "Er9lACPas9qm",
    ];
    const protectedBefore = new Map(
      await Promise.all(
        protectedIds.map(
          async (id) => [id, await digestEntity(client, id)] as const,
        ),
      ),
    );
    const brandBefore = await brandPayloadDigest(client);
    const reverseBefore = await scalar(
      client,
      "SELECT COUNT(*) value FROM entity_links WHERE source_id=? AND link_type='reverse'",
      [PHASE126_BRAND_ID],
    );

    await assert.rejects(
      applyPhase126PlatinumMakiEContent(client, { ...options, reviewer: "" }),
      /reviewer must not be empty/,
    );
    const hardlinkPath = path.join(ownedRoot, "hardlink.db");
    fs.linkSync(copy.destinationPath, hardlinkPath);
    const hardlinkClient = createClient({ url: `file:${hardlinkPath}` });
    try {
      await assert.rejects(
        applyPhase126PlatinumMakiEContent(hardlinkClient, {
          ...options,
          databasePath: hardlinkPath,
        }),
        /hard-link/,
      );
    } finally {
      hardlinkClient.close();
      fs.unlinkSync(hardlinkPath);
    }

    const first = await applyPhase126PlatinumMakiEContent(client, options);
    assert.deepEqual(
      first.entities.map((item) => [item.entityId, item.outcome]),
      [PHASE126_ARTICLE_ID, ...PHASE126_TARGET_IDS].map((id) => [
        id,
        "published",
      ]),
    );
    const article = (
      await rows(client, "SELECT * FROM entities WHERE id=?", [
        PHASE126_ARTICLE_ID,
      ])
    )[0];
    assert.deepEqual(
      [article?.type, article?.slug, article?.name],
      ["article", PHASE126_ARTICLE_SLUG, PHASE126_ARTICLE_NAME],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT COUNT(*) value FROM entity_links WHERE source_id=? OR target_id=?",
        [PHASE126_ARTICLE_ID, PHASE126_ARTICLE_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT COUNT(*) value FROM entity_aliases WHERE entity_id=? AND alias='Platinum Maki-e fountain pen'",
        [PHASE126_ARTICLE_ID],
      ),
      0,
    );
    const newLinks = await rows(
      client,
      `SELECT id FROM entity_links WHERE id IN (${[
        ...PHASE126_NEW_MADE_BY_IDS,
        ...PHASE126_NEW_REVERSE_IDS,
      ]
        .map(() => "?")
        .join(",")}) ORDER BY id`,
      [...PHASE126_NEW_MADE_BY_IDS, ...PHASE126_NEW_REVERSE_IDS],
    );
    assert.deepEqual(
      newLinks.map((row) => String(row.id)),
      [...PHASE126_NEW_MADE_BY_IDS, ...PHASE126_NEW_REVERSE_IDS].sort(),
    );
    assert.equal(
      await scalar(
        client,
        "SELECT COUNT(*) value FROM entity_links WHERE source_id=? AND link_type='reverse'",
        [PHASE126_BRAND_ID],
      ),
      reverseBefore + 2,
    );
    assert.equal(await brandPayloadDigest(client), brandBefore);

    for (let index = 0; index < PHASE126_TARGET_IDS.length; index += 1) {
      const id = PHASE126_TARGET_IDS[index];
      const line = PHASE126_LINES[index];
      assert.ok(id && line);
      const entity = (
        await rows(
          client,
          "SELECT type,slug,name FROM public_entities WHERE id=?",
          [id],
        )
      )[0];
      assert.deepEqual(
        [entity?.type, entity?.slug, entity?.name],
        ["pen", line.slug, line.canonicalName],
      );
      assert.equal(
        await scalar(
          client,
          "SELECT COUNT(*) value FROM model_variants WHERE model_entity_id=?",
          [id],
        ),
        line.variants.length,
      );
    }
    for (const id of [
      PHASE126_ARTICLE_ID,
      ...PHASE126_TARGET_IDS,
      PHASE126_BRAND_ID,
    ]) {
      const hash = await computePublicationContentHash(client, id);
      assert.equal(
        await scalar(
          client,
          "SELECT COUNT(*) value FROM entity_publications WHERE entity_id=? AND status='published' AND approved_content_hash=?",
          [id, hash],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT COUNT(*) value FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved'",
          [id, hash],
        ),
        4,
      );
    }
    for (const [id, before] of protectedBefore)
      assert.equal(await digestEntity(client, id), before, id);

    const noop = await applyPhase126PlatinumMakiEContent(client, options);
    assert.ok(noop.entities.every((item) => item.outcome === "noop"));
    await client.execute("SAVEPOINT phase126_tamper");
    try {
      await client.execute({
        sql: "INSERT INTO entity_aliases(id,entity_id,alias,language) VALUES('phase126-false-alias',?,'Platinum Maki-e fountain pen','en')",
        args: [PHASE126_TARGET_IDS[0]],
      });
      await assert.rejects(
        applyPhase126PlatinumMakiEContent(client, options),
        /terminal|alias|tamper/i,
      );
    } finally {
      await client.execute("ROLLBACK TO phase126_tamper");
      await client.execute("RELEASE phase126_tamper");
    }
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
  }
});
