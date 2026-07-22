import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase42LamyPlatinumContent } from "../../scripts/apply-phase42-lamy-platinum-content";
import { applyPhase78PlatinumCuridasContent } from "../../scripts/apply-phase78-platinum-curidas-content";
import {
  type ApplyPhase121Options,
  applyPhase121PlatinumProcyonContent,
} from "../../scripts/apply-phase121-platinum-procyon-pns-5000-content";
import {
  loadPhase121PlatinumProcyonPack,
  PHASE121_CATALOG_URL,
  PHASE121_CURIDAS_ID,
  PHASE121_CURRENT_COLOURS,
  PHASE121_CURRENT_SCOPE,
  PHASE121_CURRENT_URL,
  PHASE121_INDEX_URL,
  PHASE121_LAUNCH_COLOURS,
  PHASE121_LAUNCH_SCOPE,
  PHASE121_LAUNCH_URL,
  PHASE121_MANUAL_URL,
  PHASE121_PLATINUM_3776_ID,
  PHASE121_PLATINUM_BRAND_ID,
  PHASE121_PNS8000_COLOURS,
  PHASE121_PNS8000_SCOPE,
  PHASE121_PROCYON_ID,
  PHASE121_PROCYON_NAME,
  PHASE121_PROCYON_SLUG,
  PHASE121_REVIEW_2019_URL,
  PHASE121_REVIEW_2021_URL,
  PHASE121_SAMPLE_2019_SCOPE,
  PHASE121_SAMPLE_2021_SCOPE,
} from "../../scripts/data/phase121-platinum-procyon-pns-5000";
import { curatedId } from "../../scripts/lib/curated-content-pack";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

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

async function digest(client: Client, entityId: string, topology = true) {
  const queries = [
    "SELECT * FROM entities WHERE id=?",
    "SELECT * FROM stories WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_references WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id",
    "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id",
    "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id",
    "SELECT * FROM model_specs WHERE entity_id=? ORDER BY id",
    "SELECT * FROM model_variants WHERE model_entity_id=? ORDER BY id",
    "SELECT * FROM timeline_events WHERE entity_id=? ORDER BY id",
    "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id",
    ...(topology
      ? [
          "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
          "SELECT * FROM entity_publications WHERE entity_id=? ORDER BY entity_id",
          "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
        ]
      : []),
  ];
  const result = [];
  for (const sql of queries) {
    result.push(
      await rows(
        client,
        sql,
        sql.includes(" OR ") ? [entityId, entityId] : [entityId],
      ),
    );
  }
  return JSON.stringify(result);
}

async function ownedDigest(client: Client) {
  const tableQueries = [
    "SELECT * FROM entities ORDER BY id",
    "SELECT * FROM entity_aliases ORDER BY id",
    "SELECT * FROM entity_references ORDER BY id",
    "SELECT * FROM source_items ORDER BY id",
    "SELECT * FROM entity_links ORDER BY id",
    "SELECT * FROM fact_scopes ORDER BY id",
    "SELECT * FROM claims ORDER BY id",
    "SELECT * FROM claim_evidence ORDER BY id",
    "SELECT * FROM model_specs ORDER BY id",
    "SELECT * FROM model_variants ORDER BY id",
    "SELECT * FROM spec_field_evidence ORDER BY id",
    "SELECT * FROM media_assets ORDER BY id",
    "SELECT * FROM entity_publications ORDER BY entity_id",
    "SELECT * FROM entity_content_reviews ORDER BY entity_id,review_kind,content_hash",
  ];
  return createHash("sha256")
    .update(
      JSON.stringify(
        await Promise.all(tableQueries.map((sql) => rows(client, sql))),
      ),
    )
    .digest("hex");
}

test("Phase 121 publishes one canonical Platinum Procyon PNS-5000 with exact temporal and sample scopes", {
  timeout: 240_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase121-procyon-")),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase121Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase121-platinum-procyon-test",
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

    const pack = loadPhase121PlatinumProcyonPack(ROOT_ALIAS);
    assert.equal(pack.entityId, PHASE121_PROCYON_ID);
    assert.equal(pack.expectedSlug, PHASE121_PROCYON_SLUG);
    assert.equal(pack.canonicalName, PHASE121_PROCYON_NAME);
    assert.ok(
      Array.from(pack.summary).length >= 60 &&
        Array.from(pack.summary).length <= 160,
    );
    assert.ok(Array.from(pack.bodyMd).length >= 2_000);
    assert.match(pack.bodyMd, /Porcelain White[\s\S]*Deep Sea/);
    assert.match(pack.bodyMd, /2018[\s\S]*2026/);
    assert.match(pack.bodyMd, /PNS-8000.*limited sibling/i);
    assert.match(pack.bodyMd, /Jeff Abbott[\s\S]*2019[\s\S]*2021/);
    assert.doesNotMatch(pack.bodyMd, /数据库|runner|made_by|full corpus/i);

    assert.deepEqual(
      pack.variants?.map((variant) => variant.name),
      [...PHASE121_CURRENT_COLOURS],
    );
    assert.equal(
      new Set(pack.variants?.map((variant) => variant.name)).size,
      4,
    );
    assert.deepEqual(PHASE121_LAUNCH_COLOURS, [
      "#3 Porcelain White",
      "#25 Persimmon Orange",
      "#50 Deep Sea",
      "#52 Turquoise Blue",
      "#68 Citron Yellow",
    ]);
    assert.deepEqual(PHASE121_PNS8000_COLOURS, [
      "#18 Rose Gold",
      "#79 Satin Silver",
    ]);
    assert.deepEqual(
      pack.scopes.map((scope) => scope.scopeKey),
      [
        PHASE121_CURRENT_SCOPE,
        PHASE121_LAUNCH_SCOPE,
        PHASE121_PNS8000_SCOPE,
        PHASE121_SAMPLE_2019_SCOPE,
        PHASE121_SAMPLE_2021_SCOPE,
      ],
    );
    const officialSources = pack.sources.filter(
      (source) => source.sourceType === "official",
    );
    assert.equal(officialSources.length, 5);
    assert.equal(
      new Set(officialSources.map((source) => source.independenceGroup)).size,
      1,
    );
    const reviews = pack.sources.filter(
      (source) => source.registryName === "The Pen Addict",
    );
    assert.equal(reviews.length, 2);
    assert.equal(
      new Set(reviews.map((source) => source.independenceGroup)).size,
      1,
    );
    assert.deepEqual(
      reviews.map((source) => [source.author, source.publishedAt]),
      [
        ["Jeff Abbott", "2019-07-17"],
        ["Jeff Abbott", "2021-01-13"],
      ],
    );
    for (const source of pack.sources.filter(
      (source) => source.itemType !== "image",
    )) {
      assert.match(source.archiveLocator ?? "", /live-source-not-frozen/);
      assert.match(source.archiveLocator ?? "", /retrieved=2026-07-22/);
      assert.match(source.archiveLocator ?? "", /locator=/);
    }
    const catalogue = pack.sources.find(
      (source) => source.url === PHASE121_CATALOG_URL,
    );
    assert.match(
      catalogue?.archiveLocator ?? "",
      /PDF page 10.*printed catalogue page 8/i,
    );
    for (const url of [
      PHASE121_CURRENT_URL,
      PHASE121_INDEX_URL,
      PHASE121_LAUNCH_URL,
      PHASE121_CATALOG_URL,
      PHASE121_MANUAL_URL,
      PHASE121_REVIEW_2019_URL,
      PHASE121_REVIEW_2021_URL,
    ]) {
      assert.ok(pack.sources.some((source) => source.url === url));
    }
    assert.ok(
      (pack.spec?.evidence ?? []).filter((item) => item.qualifies === false)
        .length >= 8,
    );
    assert.ok(
      (pack.spec?.evidence ?? []).some(
        (item) =>
          item.sourceKey.includes("pns8000") === false &&
          item.scopeKey === PHASE121_PNS8000_SCOPE &&
          item.qualifies === false,
      ),
    );
    assert.equal(pack.media.length, 1);

    const svgPath = path.join(
      ROOT_CANONICAL,
      "public/images/library/site-original/phase121/platinum/platinum-procyon-pns-5000.svg",
    );
    const svg = fs.readFileSync(svgPath, "utf8");
    assert.match(svg, /width="1600" height="900"/);
    for (const token of [
      "site-original",
      "non-photo",
      "non-logo",
      "not-to-scale",
      "not-colour-proof",
      "not-finish-proof",
    ]) {
      assert.match(svg, new RegExp(token));
    }
    const svgDigest = createHash("sha256").update(svg).digest("hex");
    const protectedMedia = await rows(
      client,
      "SELECT local_path FROM media_assets WHERE entity_id IN (?,?,?) AND local_path IS NOT NULL",
      [
        PHASE121_PLATINUM_BRAND_ID,
        PHASE121_PLATINUM_3776_ID,
        PHASE121_CURIDAS_ID,
      ],
    );
    for (const media of protectedMedia) {
      const asset = fs.readFileSync(
        path.join(ROOT_CANONICAL, "public", String(media.local_path).slice(1)),
      );
      assert.notEqual(
        createHash("sha256").update(asset).digest("hex"),
        svgDigest,
      );
    }

    const absent = await rows(
      client,
      `SELECT entity.id FROM entities entity
       LEFT JOIN entity_aliases alias ON alias.entity_id=entity.id
       WHERE entity.id=? OR entity.slug=? OR lower(entity.name) IN (lower('Platinum Procyon PNS-5000'),lower('PROCYON'),lower('PNS-5000'))
          OR lower(COALESCE(alias.alias,'')) IN (lower('PROCYON'),lower('PNS-5000'))`,
      [PHASE121_PROCYON_ID, PHASE121_PROCYON_SLUG],
    );
    assert.equal(absent.length, 0);

    const rejectedOptions: ApplyPhase121Options[] = [
      { ...options, reviewer: "" },
      { ...options, workspaceRoot: ownedRoot },
      {
        ...options,
        env: {
          ...options.env,
          FPKG_DATABASE_URL: "file:remote",
        } as NodeJS.ProcessEnv,
      },
      { ...options, databasePath: REAL },
    ];
    for (const changed of rejectedOptions) {
      const before = await ownedDigest(client);
      await assert.rejects(
        applyPhase121PlatinumProcyonContent(client, changed),
      );
      assert.equal(await ownedDigest(client), before);
    }

    const symlink = path.join(ownedRoot, "catalog-symlink.db");
    fs.symlinkSync(copy.destinationPath, symlink);
    await assert.rejects(
      applyPhase121PlatinumProcyonContent(client, {
        ...options,
        databasePath: symlink,
      }),
      /must not be a symlink/,
    );
    const mismatched = path.join(ownedRoot, "catalog-mismatch.db");
    fs.copyFileSync(copy.destinationPath, mismatched);
    await assert.rejects(
      applyPhase121PlatinumProcyonContent(client, {
        ...options,
        databasePath: mismatched,
      }),
      /client\/path mismatch/,
    );
    const hardLink = path.join(ownedRoot, "owned-hard-link.db");
    fs.linkSync(copy.destinationPath, hardLink);
    try {
      await assert.rejects(
        applyPhase121PlatinumProcyonContent(client, options),
        /must not have hard-link aliases/,
      );
    } finally {
      fs.unlinkSync(hardLink);
    }
    const unmigrated = path.join(ownedRoot, "unmigrated.db");
    const unmigratedClient = createClient({ url: `file:${unmigrated}` });
    try {
      await unmigratedClient.execute("CREATE TABLE placeholder (id TEXT)");
      await assert.rejects(
        applyPhase121PlatinumProcyonContent(unmigratedClient, {
          ...options,
          databasePath: unmigrated,
        }),
        /migrated through 032/,
      );
    } finally {
      unmigratedClient.close();
    }

    const brandPayloadBefore = await digest(
      client,
      PHASE121_PLATINUM_BRAND_ID,
      false,
    );
    const brandHashBefore = await computePublicationContentHash(
      client,
      PHASE121_PLATINUM_BRAND_ID,
    );
    const reverseBefore = await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE121_PLATINUM_BRAND_ID],
    );
    const centuryBefore = await digest(client, PHASE121_PLATINUM_3776_ID);
    const curidasBefore = await digest(client, PHASE121_CURIDAS_ID);

    const first = await applyPhase121PlatinumProcyonContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [[PHASE121_PROCYON_ID, "published"]],
    );

    assert.equal(
      await digest(client, PHASE121_PLATINUM_BRAND_ID, false),
      brandPayloadBefore,
    );
    const brandHashAfter = await computePublicationContentHash(
      client,
      PHASE121_PLATINUM_BRAND_ID,
    );
    assert.notEqual(brandHashAfter, brandHashBefore);
    const reverseAfter = await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE121_PLATINUM_BRAND_ID],
    );
    assert.deepEqual(
      reverseAfter
        .map((row) => ({ target_id: String(row.target_id) }))
        .sort((a, b) =>
          a.target_id < b.target_id ? -1 : a.target_id > b.target_id ? 1 : 0,
        ),
      reverseBefore
        .map((row) => ({ target_id: String(row.target_id) }))
        .concat([{ target_id: PHASE121_PROCYON_ID }])
        .sort((a, b) =>
          a.target_id < b.target_id ? -1 : a.target_id > b.target_id ? 1 : 0,
        ),
    );
    assert.equal(
      await digest(client, PHASE121_PLATINUM_3776_ID),
      centuryBefore,
    );
    assert.equal(await digest(client, PHASE121_CURIDAS_ID), curidasBefore);

    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id=?",
        [PHASE121_PROCYON_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        [PHASE121_PROCYON_ID, PHASE121_PLATINUM_BRAND_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [PHASE121_PLATINUM_BRAND_ID, PHASE121_PROCYON_ID],
      ),
      1,
    );
    const dbVariants = await rows(
      client,
      "SELECT variant_name FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
      [PHASE121_PROCYON_ID],
    );
    assert.deepEqual(
      dbVariants.map((item) => item.variant_name),
      [...PHASE121_CURRENT_COLOURS].sort(),
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE lower(name) LIKE '%procyon%' OR lower(name) LIKE '%pns-5000%'",
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE lower(name) IN (lower('#18 Rose Gold'),lower('#79 Satin Silver'),lower('Porcelain White'),lower('Deep Sea'))",
      ),
      0,
    );
    const reviewRows = await rows(
      client,
      "SELECT review_kind,content_hash FROM entity_content_reviews WHERE entity_id IN (?,?) AND status='approved' ORDER BY entity_id,review_kind",
      [PHASE121_PLATINUM_BRAND_ID, PHASE121_PROCYON_ID],
    );
    assert.ok(
      reviewRows.filter((row) => row.content_hash === brandHashAfter).length >=
        4,
    );
    assert.equal(
      reviewRows.filter(
        (row) => row.content_hash === first.entities[0]?.contentHash,
      ).length,
      4,
    );

    const terminalDigest = await ownedDigest(client);
    const replay = await applyPhase121PlatinumProcyonContent(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop"],
    );
    assert.equal(await ownedDigest(client), terminalDigest);

    const fakeId = "phase121-source-owner-tamper";
    await client.execute({
      sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
      args: [fakeId, fakeId, "PROCYON"],
    });
    await client.execute({
      sql: "INSERT INTO entity_references(id,entity_id,source_item_id,relation_type,note,review_status) VALUES(?,?,?,?,?,'approved')",
      args: [
        `${fakeId}-reference`,
        fakeId,
        curatedId("source-item", "phase121-platinum-procyon-current-cards"),
        "official",
        "tamper",
      ],
    });
    const collisionDigest = await ownedDigest(client);
    await assert.rejects(
      applyPhase121PlatinumProcyonContent(client, options),
      /alternate Procyon identity or source owner/,
    );
    assert.equal(await ownedDigest(client), collisionDigest);
    await client.execute({
      sql: "DELETE FROM entity_references WHERE entity_id=?",
      args: [fakeId],
    });
    await client.execute({
      sql: "DELETE FROM entities WHERE id=?",
      args: [fakeId],
    });

    await client.execute({
      sql: "DELETE FROM model_variants WHERE model_entity_id=? AND variant_name=?",
      args: [PHASE121_PROCYON_ID, PHASE121_CURRENT_COLOURS[0]],
    });
    const partialDigest = await ownedDigest(client);
    await assert.rejects(
      applyPhase121PlatinumProcyonContent(client, options),
      /terminal .*state is invalid/,
    );
    assert.equal(await ownedDigest(client), partialDigest);

    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
});
