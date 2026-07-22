import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase42LamyPlatinumContent } from "../../scripts/apply-phase42-lamy-platinum-content";
import { applyPhase78PlatinumCuridasContent } from "../../scripts/apply-phase78-platinum-curidas-content";
import { applyPhase121PlatinumProcyonContent } from "../../scripts/apply-phase121-platinum-procyon-pns-5000-content";
import { applyPhase122PlatinumPresidentContent } from "../../scripts/apply-phase122-platinum-president-ptb-20000p-content";
import {
  type ApplyPhase123Options,
  applyPhase123PlatinumIzumoContent,
} from "../../scripts/apply-phase123-platinum-izumo-piz-80000n-content";
import {
  loadPhase123PlatinumIzumoPizPack,
  PHASE123_3776_ID,
  PHASE123_ARTICLE_ID,
  PHASE123_ARTICLE_NAME,
  PHASE123_ARTICLE_SLUG,
  PHASE123_BRAND_ID,
  PHASE123_CATALOG_SCOPE,
  PHASE123_CATALOG_URL,
  PHASE123_CURIDAS_ID,
  PHASE123_CURRENT_SCOPE,
  PHASE123_CURRENT_VARIANTS,
  PHASE123_FPN_SCOPE,
  PHASE123_FPN_URL,
  PHASE123_LEGACY_MADE_BY_ID,
  PHASE123_LEGACY_REVERSE_ID,
  PHASE123_LEIGH_SCOPE,
  PHASE123_LEIGH_URL,
  PHASE123_LINEUP,
  PHASE123_MAINTENANCE_SCOPE,
  PHASE123_MAINTENANCE_URL,
  PHASE123_NEW_MADE_BY_ID,
  PHASE123_NEW_REVERSE_ID,
  PHASE123_PIZ_ID,
  PHASE123_PIZ_NAME,
  PHASE123_PIZ_SLUG,
  PHASE123_PRESIDENT_ID,
  PHASE123_PROCYON_ID,
  PHASE123_PRODUCT_EN_URL,
  PHASE123_PRODUCT_JP_URL,
  PHASE123_RAW_NAME,
  PHASE123_RAW_SLUG,
} from "../../scripts/data/phase123-platinum-izumo-piz-80000n";
import { curatedId } from "../../scripts/lib/curated-content-pack";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { getReclassifiedArticlePath } from "../../src/lib/entity-redirects";
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

async function entityDigest(
  client: Client,
  entityId: string,
  includeTopology = true,
) {
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
    ...(includeTopology
      ? [
          "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
          "SELECT * FROM entity_publications WHERE entity_id=?",
          "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
        ]
      : []),
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

async function ownedDigest(client: Client) {
  const tables = [
    "entities",
    "entity_aliases",
    "entity_references",
    "source_items",
    "entity_links",
    "entity_redirects",
    "fact_scopes",
    "claims",
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

test("Phase 123 reclassifies Izumo as one family article and publishes exact PIZ-80000N", {
  timeout: 300_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase123-izumo-")),
  );
  // The only checkpoint copy in this file. Every positive, authority, fault and tamper
  // assertion below operates on this caller-owned migrated database.
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase123Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase123-izumo-test",
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

    const pack = loadPhase123PlatinumIzumoPizPack(ROOT_ALIAS);
    assert.equal(pack.entityId, PHASE123_PIZ_ID);
    assert.deepEqual(
      pack.variants?.map((variant) => variant.name),
      [...PHASE123_CURRENT_VARIANTS],
    );
    assert.deepEqual(
      pack.scopes.map((scope) => scope.scopeKey),
      [
        PHASE123_CURRENT_SCOPE,
        PHASE123_CATALOG_SCOPE,
        PHASE123_MAINTENANCE_SCOPE,
        PHASE123_LEIGH_SCOPE,
        PHASE123_FPN_SCOPE,
      ],
    );
    assert.ok(
      Array.from(pack.summary).length >= 60 &&
        Array.from(pack.summary).length <= 160,
    );
    assert.ok(Array.from(pack.bodyMd).length >= 2_000);
    assert.match(pack.bodyMd, new RegExp(`/article/${PHASE123_ARTICLE_SLUG}`));
    assert.equal(
      new Set(
        pack.sources
          .filter((source) => source.sourceType === "official")
          .map((source) => source.independenceGroup),
      ).size,
      1,
    );
    for (const url of [
      PHASE123_PRODUCT_JP_URL,
      PHASE123_PRODUCT_EN_URL,
      PHASE123_CATALOG_URL,
      PHASE123_MAINTENANCE_URL,
      PHASE123_LEIGH_URL,
      PHASE123_FPN_URL,
    ]) {
      const source = pack.sources.find((item) => item.url === url);
      assert.ok(
        source?.archiveLocator?.includes("locator="),
        `missing locator for ${url}`,
      );
    }
    const leigh = pack.sources.find(
      (source) => source.url === PHASE123_LEIGH_URL,
    );
    assert.deepEqual(
      [leigh?.publishedAt, leigh?.tier],
      ["2013-06-25", "professional_secondary"],
    );
    assert.match(leigh?.summary ?? "", /older|ambiguous|not #91|not #92/i);
    const fpn = pack.sources.find((source) => source.url === PHASE123_FPN_URL);
    assert.deepEqual(
      [fpn?.author, fpn?.publishedAt, fpn?.tier],
      ["columela", "2017-08-05", "community"],
    );
    assert.ok(
      (pack.spec?.evidence ?? []).filter((item) => item.qualifies === false)
        .length >= 8,
    );

    const familyCopy = fs.readFileSync(
      path.join(
        ROOT_CANONICAL,
        ".planning/content-research/platinum-izumo-family-phase123.md",
      ),
      "utf8",
    );
    const familySummary =
      familyCopy.match(/^## summary\s*\n+([\s\S]*?)(?=^## )/m)?.[1]?.trim() ??
      "";
    const familyBody =
      familyCopy.match(/^## body_md\s*\n+([\s\S]*)$/m)?.[1]?.trim() ?? "";
    assert.ok(
      Array.from(familySummary).length >= 60 &&
        Array.from(familySummary).length <= 160,
    );
    assert.ok(Array.from(familyBody).length >= 2_000);
    assert.match(familyBody, new RegExp(`/pen/${PHASE123_PIZ_SLUG}`));
    for (const family of PHASE123_LINEUP)
      assert.match(
        familyBody,
        new RegExp(family.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );

    const svgs = [
      "public/images/library/site-original/phase123/platinum/platinum-izumo-family.svg",
      "public/images/library/site-original/phase123/platinum/platinum-izumo-piz-80000n.svg",
    ].map((relative) =>
      fs.readFileSync(path.join(ROOT_CANONICAL, relative), "utf8"),
    );
    assert.notEqual(
      createHash("sha256")
        .update(svgs[0] ?? "")
        .digest("hex"),
      createHash("sha256")
        .update(svgs[1] ?? "")
        .digest("hex"),
    );
    for (const svg of svgs)
      for (const token of [
        'width="1600" height="900"',
        "site-original",
        "non-photo",
        "non-logo",
        "not-to-scale",
        "not-colour-proof",
        "not-finish-proof",
      ])
        assert.match(svg ?? "", new RegExp(token));

    const raw = (
      await rows(client, "SELECT * FROM entities WHERE id=?", [
        PHASE123_ARTICLE_ID,
      ])
    )[0];
    assert.deepEqual(
      [raw?.type, raw?.slug, raw?.name, raw?.source_url],
      ["pen", PHASE123_RAW_SLUG, PHASE123_RAW_NAME, null],
    );
    assert.equal(Array.from(String(raw?.summary)).length, 67);
    assert.equal(Array.from(String(raw?.body_md)).length, 248);
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id=?",
        [PHASE123_PIZ_ID],
      ),
      0,
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT id,alias,language FROM entity_aliases WHERE entity_id=? ORDER BY id",
          [PHASE123_ARTICLE_ID],
        )
      ).map((row) => [row.id, row.alias, row.language]),
      [
        ["alias-OOumUrtFoAqu-en-Platinum Izumo", "Platinum Izumo", "en"],
        ["alias-OOumUrtFoAqu-zh-白金 出云 Izumo", "白金 出云 Izumo", "zh"],
      ],
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT id,source_id,target_id,link_type FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
          [PHASE123_ARTICLE_ID, PHASE123_ARTICLE_ID],
        )
      ).map((row) => row.id),
      [PHASE123_LEGACY_REVERSE_ID, PHASE123_LEGACY_MADE_BY_ID].sort(),
    );
    for (const [table, id] of [
      ["stories", "story-model-platinum-izumo-research"],
      ["model_specs", "spec-platinum-izumo-research"],
      ["claims", "claim-platinum-izumo-source-boundary"],
      ["media_assets", "media-commerce-82fe9226299f2b"],
    ] as const)
      assert.equal(
        await scalar(
          client,
          `SELECT count(*) AS value FROM ${table} WHERE id=?`,
          [id],
        ),
        1,
      );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT id FROM entity_references WHERE entity_id=? ORDER BY id",
          [PHASE123_ARTICLE_ID],
        )
      ).map((row) => row.id),
      [
        "22c69d1a-6013-474a-9cac-a6a0ff370795",
        "afe7edae-cf04-4a12-aa84-f8430350b93d",
        "eref-commerce-1954fe77d81a4c",
        "reference-model-gap-OOumUrtFoAqu-source-platinum-izumo-public-search",
      ],
    );

    for (const changed of [
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
    ]) {
      const before = await ownedDigest(client);
      await assert.rejects(applyPhase123PlatinumIzumoContent(client, changed));
      assert.equal(await ownedDigest(client), before);
    }
    await client.execute({
      sql: "UPDATE entities SET name='tampered raw Izumo' WHERE id=?",
      args: [PHASE123_ARTICLE_ID],
    });
    const rawTamper = await ownedDigest(client);
    await assert.rejects(
      applyPhase123PlatinumIzumoContent(client, options),
      /raw|alternate|partial/i,
    );
    assert.equal(await ownedDigest(client), rawTamper);
    await client.execute({
      sql: "UPDATE entities SET name=? WHERE id=?",
      args: [PHASE123_RAW_NAME, PHASE123_ARTICLE_ID],
    });

    const protectedIds = [
      PHASE123_3776_ID,
      PHASE123_CURIDAS_ID,
      PHASE123_PROCYON_ID,
      PHASE123_PRESIDENT_ID,
    ];
    const protectedBefore = new Map<string, string>();
    for (const id of protectedIds)
      protectedBefore.set(id, await entityDigest(client, id));
    const brandPayloadBefore = await entityDigest(
      client,
      PHASE123_BRAND_ID,
      false,
    );
    const brandHashBefore = await computePublicationContentHash(
      client,
      PHASE123_BRAND_ID,
    );
    const reverseBefore = (
      await rows(
        client,
        "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
        [PHASE123_BRAND_ID],
      )
    ).map((row) => String(row.target_id));

    const first = await applyPhase123PlatinumIzumoContent(client, options);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [PHASE123_ARTICLE_ID, "published"],
        [PHASE123_PIZ_ID, "published"],
      ],
    );
    assert.equal(
      await entityDigest(client, PHASE123_BRAND_ID, false),
      brandPayloadBefore,
    );
    for (const [id, digest] of protectedBefore)
      assert.equal(await entityDigest(client, id), digest);
    const brandHashAfter = await computePublicationContentHash(
      client,
      PHASE123_BRAND_ID,
    );
    assert.notEqual(brandHashAfter, brandHashBefore);
    process.stdout.write(
      `# Phase123 audit hashes: article=${first.entities[0]?.contentHash} pen=${first.entities[1]?.contentHash} brand=${brandHashAfter}\n`,
    );
    const reverseAfter = (
      await rows(
        client,
        "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
        [PHASE123_BRAND_ID],
      )
    ).map((row) => String(row.target_id));
    assert.deepEqual(
      reverseAfter,
      reverseBefore
        .filter((id) => id !== PHASE123_ARTICLE_ID)
        .concat(PHASE123_PIZ_ID)
        .sort(),
    );

    assert.deepEqual(
      await rows(client, "SELECT type,slug,name FROM entities WHERE id=?", [
        PHASE123_ARTICLE_ID,
      ]),
      [
        {
          type: "article",
          slug: PHASE123_ARTICLE_SLUG,
          name: PHASE123_ARTICLE_NAME,
        },
      ],
    );
    assert.deepEqual(
      await rows(client, "SELECT type,slug,name FROM entities WHERE id=?", [
        PHASE123_PIZ_ID,
      ]),
      [{ type: "pen", slug: PHASE123_PIZ_SLUG, name: PHASE123_PIZ_NAME }],
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT alias FROM entity_aliases WHERE entity_id=? ORDER BY alias",
          [PHASE123_ARTICLE_ID],
        )
      ).map((row) => row.alias),
      ["Platinum Izumo", PHASE123_RAW_NAME, "白金 出云 Izumo"],
    );
    assert.equal(
      getReclassifiedArticlePath("pen", PHASE123_RAW_SLUG),
      `/article/${PHASE123_ARTICLE_SLUG}`,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_redirects WHERE source_path=?",
        [`/pen/${PHASE123_RAW_SLUG}`],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? OR target_id=?",
        [PHASE123_ARTICLE_ID, PHASE123_ARTICLE_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
        [PHASE123_ARTICLE_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_variants WHERE model_entity_id=?",
        [PHASE123_ARTICLE_ID],
      ),
      0,
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT id,source_id,target_id,link_type FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
          [PHASE123_PIZ_ID, PHASE123_PIZ_ID],
        )
      ).map((row) => [row.id, row.source_id, row.target_id, row.link_type]),
      [
        [
          PHASE123_NEW_MADE_BY_ID,
          PHASE123_PIZ_ID,
          PHASE123_BRAND_ID,
          "made_by",
        ],
        [
          PHASE123_NEW_REVERSE_ID,
          PHASE123_BRAND_ID,
          PHASE123_PIZ_ID,
          "reverse",
        ],
      ],
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT variant_name FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
          [PHASE123_PIZ_ID],
        )
      ).map((row) => row.variant_name),
      [...PHASE123_CURRENT_VARIANTS].sort(),
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id NOT IN (?,?) AND (lower(name) LIKE '%izumo%' OR lower(slug) LIKE '%izumo%')",
        [PHASE123_ARTICLE_ID, PHASE123_PIZ_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id NOT IN (?,?) AND name IN (" +
          PHASE123_LINEUP.map(() => "?").join(",") +
          ")",
        [PHASE123_ARTICLE_ID, PHASE123_PIZ_ID, ...PHASE123_LINEUP],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type NOT IN ('made_by','reverse')",
        [PHASE123_PIZ_ID, PHASE123_PIZ_ID],
      ),
      0,
    );

    for (const [id, hash] of [
      [PHASE123_ARTICLE_ID, first.entities[0]?.contentHash],
      [PHASE123_PIZ_ID, first.entities[1]?.contentHash],
      [PHASE123_BRAND_ID, brandHashAfter],
    ] as const) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media','publication')",
          [id, hash],
        ),
        4,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM public_entities WHERE id=?",
          [id],
        ),
        1,
      );
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_references reference JOIN source_items item ON item.id=reference.source_item_id WHERE reference.entity_id=? AND item.source_tier IN ('retailer','community') AND reference.review_status='approved' AND item.url NOT IN (?)",
        [PHASE123_PIZ_ID, PHASE123_FPN_URL],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM source_items WHERE id=? AND source_tier='community'",
        [curatedId("source-item", "phase123-fpn-ginsen-sample")],
      ),
      1,
    );

    const terminalDigest = await ownedDigest(client);
    const replay = await applyPhase123PlatinumIzumoContent(client, options);
    assert.deepEqual(
      replay.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [PHASE123_ARTICLE_ID, "noop"],
        [PHASE123_PIZ_ID, "noop"],
      ],
    );
    assert.equal(await ownedDigest(client), terminalDigest);

    await client.execute({
      sql: "UPDATE entity_aliases SET alias='tampered Izumo alias' WHERE entity_id=? AND alias=?",
      args: [PHASE123_ARTICLE_ID, PHASE123_RAW_NAME],
    });
    const tampered = await ownedDigest(client);
    await assert.rejects(
      applyPhase123PlatinumIzumoContent(client, options),
      /terminal|alias|tamper/i,
    );
    assert.equal(await ownedDigest(client), tampered);
    await client.execute({
      sql: "UPDATE entity_aliases SET alias=? WHERE entity_id=? AND alias='tampered Izumo alias'",
      args: [PHASE123_RAW_NAME, PHASE123_ARTICLE_ID],
    });
    await client.execute({
      sql: "DELETE FROM model_variants WHERE model_entity_id=? AND variant_name=?",
      args: [PHASE123_PIZ_ID, PHASE123_CURRENT_VARIANTS[0]],
    });
    const variantTamper = await ownedDigest(client);
    await assert.rejects(
      applyPhase123PlatinumIzumoContent(client, options),
      /terminal|variant|tamper/i,
    );
    assert.equal(await ownedDigest(client), variantTamper);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL), protectedSnapshot);
});
