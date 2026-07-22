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
import {
  type ApplyPhase125Options,
  applyPhase125PlatinumSmallMeteorContent,
} from "../../scripts/apply-phase125-platinum-small-meteor-pq-200-content";
import {
  loadPhase125PlatinumSmallMeteorPack,
  PHASE125_FALSE_PREPPY_ALIAS,
  PHASE125_MADE_BY_ID,
  PHASE125_NAME,
  PHASE125_PLATINUM_BRAND_ID,
  PHASE125_PREPPY_ID,
  PHASE125_RAW_NAME,
  PHASE125_RAW_SLUG,
  PHASE125_REVERSE_ID,
  PHASE125_SLUG,
  PHASE125_TARGET_ID,
  PHASE125_VARIANTS,
} from "../../scripts/data/phase125-platinum-small-meteor-pq-200";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
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
async function catalogDigest(client: Client) {
  const tables = [
    "entities",
    "entity_aliases",
    "entity_references",
    "source_items",
    "entity_links",
    "entity_redirects",
    "fact_scopes",
    "claims",
    "citations",
    "claim_evidence",
    "model_specs",
    "model_variants",
    "spec_field_evidence",
    "media_assets",
    "entity_publications",
    "entity_content_reviews",
    "taxonomy_batches",
    "taxonomy_actions",
  ];
  const payload = await Promise.all(
    tables.map((table) => rows(client, `SELECT * FROM ${table} ORDER BY 1`)),
  );
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

test("Phase 125 publishes the exact Platinum Small Meteor PQ-200 without merging Preppy", {
  timeout: 600_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase125-pq200-")),
  );
  // The only checkpoint copy in this test; all writes, faults, replay and tamper
  // cases operate on this caller-owned migrated database.
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase125Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase125-pq200-test",
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
        entityId: PHASE125_PLATINUM_BRAND_ID,
        reviewKind,
        reviewer: options.reviewer,
        status: "approved",
        notes:
          "Phase 125 fixture restores the Platinum current topology hash after the Phase 44 Preppy prerequisite.",
      });
    await publishEntity(client, {
      entityId: PHASE125_PLATINUM_BRAND_ID,
      reviewer: options.reviewer,
    });

    const pack = loadPhase125PlatinumSmallMeteorPack(ROOT_ALIAS);
    assert.equal(pack.entityId, PHASE125_TARGET_ID);
    assert.ok(
      Array.from(pack.summary).length >= 60 &&
        Array.from(pack.summary).length <= 160,
    );
    assert.ok(Array.from(pack.bodyMd).length >= 2_000);
    assert.match(pack.bodyMd, /\/pen\/platinum-preppy/);
    assert.deepEqual(
      pack.variants?.map((variant) => variant.name),
      PHASE125_VARIANTS,
    );
    assert.equal(
      pack.sources.find((source) => source.url.includes("sina.com.cn"))?.tier,
      "professional_secondary",
    );
    assert.equal(
      pack.sources.find((source) => source.url.includes("awesomepens"))?.tier,
      "retailer",
    );
    assert.ok(
      (pack.spec?.evidence ?? []).filter((item) => item.qualifies === false)
        .length >= 7,
    );
    const svg = fs.readFileSync(
      path.join(
        ROOT_CANONICAL,
        "public/images/library/site-original/phase125/platinum/platinum-small-meteor-pq-200.svg",
      ),
      "utf8",
    );
    for (const token of [
      'width="1600" height="900"',
      "site-original",
      "non-photo",
      "non-logo",
      "not-to-scale",
      "not-colour-proof",
      "not-finish-proof",
    ])
      assert.match(svg, new RegExp(token));

    const raw = (
      await rows(client, "SELECT * FROM entities WHERE id=?", [
        PHASE125_TARGET_ID,
      ])
    )[0];
    assert.deepEqual(
      [raw?.type, raw?.slug, raw?.name, raw?.source],
      ["pen", PHASE125_RAW_SLUG, PHASE125_RAW_NAME, null],
    );
    assert.equal(Array.from(String(raw?.summary)).length, 110);
    assert.equal(Array.from(String(raw?.body_md)).length, 171);
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT alias FROM entity_aliases WHERE entity_id=? ORDER BY alias",
          [PHASE125_TARGET_ID],
        )
      ).map((row) => String(row.alias)),
      [
        "Platinum PQ200",
        PHASE125_FALSE_PREPPY_ALIAS,
        "白金 小流星 PQ200",
      ].sort(),
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
          [PHASE125_TARGET_ID, PHASE125_TARGET_ID],
        )
      ).map((row) => [
        row.id,
        row.source_id,
        row.target_id,
        row.link_type,
        row.reason,
      ]),
      [
        [
          PHASE125_MADE_BY_ID,
          PHASE125_TARGET_ID,
          PHASE125_PLATINUM_BRAND_ID,
          "made_by",
          null,
        ],
        [
          PHASE125_REVERSE_ID,
          PHASE125_PLATINUM_BRAND_ID,
          PHASE125_TARGET_ID,
          "reverse",
          null,
        ],
      ],
    );

    const protectedIds = [
      PHASE125_PLATINUM_BRAND_ID,
      PHASE125_PREPPY_ID,
      "ekPMWnot9inz",
      "BoZ4C2WSqk0K",
      "phase121-platinum-procyon-pns-5000",
      "a1t4DNomp4Ge",
      "OOumUrtFoAqu",
      "phase123-platinum-izumo-piz-80000n",
      "ogo1UmxmcXJT",
      "phase124-platinum-fuji-shunkei-shungyo",
      "phase124-platinum-fuji-shunkei-kumpoo",
      "phase124-platinum-fuji-shunkei-rokka",
      "phase124-platinum-fuji-shunkei-shiun",
      "phase124-platinum-fuji-shunkei-kinshu",
    ];
    const protectedBefore = new Map<string, string>();
    for (const id of protectedIds)
      protectedBefore.set(id, await digestEntity(client, id));

    const beforeFaults = await catalogDigest(client);
    await assert.rejects(
      applyPhase125PlatinumSmallMeteorContent(client, {
        ...options,
        reviewer: "",
      }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      applyPhase125PlatinumSmallMeteorContent(client, {
        ...options,
        env: {
          ...process.env,
          TURSO_DATABASE_URL: "libsql://remote.invalid",
          TURSO_AUTH_TOKEN: "",
          FPKG_DATABASE_URL: "",
        },
      }),
      /refuses inherited remote/,
    );
    await assert.rejects(
      applyPhase125PlatinumSmallMeteorContent(client, {
        ...options,
        workspaceRoot: ownedRoot,
      }),
      /verified CodeBuddy\/Documents repo pair/,
    );
    assert.equal(await catalogDigest(client), beforeFaults);

    const hardlink = path.join(ownedRoot, "catalog-hardlink.db");
    fs.linkSync(copy.destinationPath, hardlink);
    const hardlinkClient = createClient({ url: `file:${hardlink}` });
    try {
      await assert.rejects(
        applyPhase125PlatinumSmallMeteorContent(hardlinkClient, {
          ...options,
          databasePath: hardlink,
        }),
        /hard-link aliases/,
      );
    } finally {
      hardlinkClient.close();
      fs.unlinkSync(hardlink);
    }
    assert.equal(await catalogDigest(client), beforeFaults);

    const first = await applyPhase125PlatinumSmallMeteorContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [[PHASE125_TARGET_ID, "published"]],
    );
    const entity = (
      await rows(
        client,
        "SELECT type,slug,name,source,summary,body_md FROM entities WHERE id=?",
        [PHASE125_TARGET_ID],
      )
    )[0];
    assert.deepEqual(
      [entity?.type, entity?.slug, entity?.name],
      ["pen", PHASE125_SLUG, PHASE125_NAME],
    );
    assert.equal(String(entity?.source), pack.sourceMarker);
    assert.equal(
      Array.from(String(entity?.summary)).length,
      Array.from(pack.summary).length,
    );
    assert.equal(
      Array.from(String(entity?.body_md)).length,
      Array.from(pack.bodyMd).length,
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT alias FROM entity_aliases WHERE entity_id=? ORDER BY alias",
          [PHASE125_TARGET_ID],
        )
      ).map((row) => String(row.alias)),
      [
        PHASE125_RAW_NAME,
        "Platinum PQ200",
        "白金 小流星 PQ200",
        "Platinum Little Meteor PQ-200",
        "Platinum Starlet PQ-200",
      ].sort(),
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_aliases WHERE entity_id=? AND alias=?",
        [PHASE125_TARGET_ID, PHASE125_FALSE_PREPPY_ALIAS],
      ),
      0,
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
          [PHASE125_TARGET_ID, PHASE125_TARGET_ID],
        )
      ).map((row) => [
        row.id,
        row.source_id,
        row.target_id,
        row.link_type,
        row.reason,
      ]),
      [
        [
          PHASE125_MADE_BY_ID,
          PHASE125_TARGET_ID,
          PHASE125_PLATINUM_BRAND_ID,
          "made_by",
          null,
        ],
        [
          PHASE125_REVERSE_ID,
          PHASE125_PLATINUM_BRAND_ID,
          PHASE125_TARGET_ID,
          "reverse",
          null,
        ],
      ],
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
          [`/pen/${PHASE125_RAW_SLUG}`],
        )
      ).map((row) => [row.target_path, row.redirect_kind]),
      [[`/pen/${PHASE125_SLUG}`, "permanent"]],
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT variant_name FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
          [PHASE125_TARGET_ID],
        )
      ).map((row) => String(row.variant_name)),
      [...PHASE125_VARIANTS].sort(),
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM fact_scopes WHERE entity_id=?",
        [PHASE125_TARGET_ID],
      ),
      6,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_references WHERE entity_id=?",
        [PHASE125_TARGET_ID],
      ),
      8,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND local_path=? AND license='site-original' AND usage_status='primary'",
        [
          PHASE125_TARGET_ID,
          "/images/library/site-original/phase125/platinum/platinum-small-meteor-pq-200.svg",
        ],
      ),
      1,
    );
    const hash = await computePublicationContentHash(
      client,
      PHASE125_TARGET_ID,
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
          [PHASE125_TARGET_ID],
        )
      ).map((row) => [row.status, row.approved_content_hash]),
      [["published", hash]],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media','publication')",
        [PHASE125_TARGET_ID, hash],
      ),
      4,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id=?",
        [PHASE125_TARGET_ID],
      ),
      1,
    );
    for (const id of protectedIds)
      assert.equal(await digestEntity(client, id), protectedBefore.get(id), id);

    const pristine = await catalogDigest(client);
    const replay = await applyPhase125PlatinumSmallMeteorContent(
      client,
      options,
    );
    assert.deepEqual(
      replay.entities.map((item) => [item.entityId, item.outcome]),
      [[PHASE125_TARGET_ID, "noop"]],
    );
    assert.equal(await catalogDigest(client), pristine);

    await client.execute("SAVEPOINT phase125_variant_tamper");
    await client.execute({
      sql: "UPDATE model_variants SET variant_name='tampered' WHERE model_entity_id=? AND variant_name=?",
      args: [PHASE125_TARGET_ID, PHASE125_VARIANTS[0]],
    });
    const variantTampered = await catalogDigest(client);
    await assert.rejects(
      applyPhase125PlatinumSmallMeteorContent(client, options),
      /terminal nib variants are invalid/,
    );
    assert.equal(await catalogDigest(client), variantTampered);
    await client.execute("ROLLBACK TO phase125_variant_tamper");
    await client.execute("RELEASE phase125_variant_tamper");
    assert.equal(await catalogDigest(client), pristine);

    await client.execute("SAVEPOINT phase125_alias_tamper");
    await client.execute({
      sql: "INSERT INTO entity_aliases(id,entity_id,alias,language) VALUES('phase125-false-preppy-alias',?,?,'en')",
      args: [PHASE125_TARGET_ID, PHASE125_FALSE_PREPPY_ALIAS],
    });
    const aliasTampered = await catalogDigest(client);
    await assert.rejects(
      applyPhase125PlatinumSmallMeteorContent(client, options),
      /terminal aliases are incomplete or contaminated/,
    );
    assert.equal(await catalogDigest(client), aliasTampered);
    await client.execute("ROLLBACK TO phase125_alias_tamper");
    await client.execute("RELEASE phase125_alias_tamper");
    assert.equal(await catalogDigest(client), pristine);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  }
});
