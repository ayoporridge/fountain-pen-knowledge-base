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
import { applyPhase123PlatinumIzumoContent } from "../../scripts/apply-phase123-platinum-izumo-piz-80000n-content";
import {
  type ApplyPhase124Options,
  applyPhase124PlatinumFujiShunkeiContent,
} from "../../scripts/apply-phase124-platinum-fuji-shunkei-content";
import {
  loadPhase124Packs,
  PHASE124_3776_ID,
  PHASE124_ARTICLE_ID,
  PHASE124_ARTICLE_NAME,
  PHASE124_ARTICLE_SLUG,
  PHASE124_BRAND_ID,
  PHASE124_CURIDAS_ID,
  PHASE124_EDITIONS,
  PHASE124_IZUMO_ARTICLE_ID,
  PHASE124_LEGACY_MADE_BY_ID,
  PHASE124_LEGACY_REVERSE_ID,
  PHASE124_NEW_MADE_BY_IDS,
  PHASE124_NEW_REVERSE_IDS,
  PHASE124_PIZ_ID,
  PHASE124_PNB13000_URL,
  PHASE124_PRESIDENT_ID,
  PHASE124_PROCYON_ID,
  PHASE124_RAW_NAME,
  PHASE124_RAW_SLUG,
  PHASE124_SERIES_URL,
  PHASE124_TARGET_IDS,
  phase124FamilyArticle,
} from "../../scripts/data/phase124-platinum-fuji-shunkei";
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

test("Phase 124 reclassifies Fuji Shunkei and publishes five exact editions", {
  timeout: 420_000,
}, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase124-fuji-shunkei-")),
  );
  // The only checkpoint copy in this file. All positive, authority, tamper and
  // replay assertions operate on this caller-owned migrated database.
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase124Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase124-fuji-shunkei-test",
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

    const packs = loadPhase124Packs(ROOT_ALIAS);
    assert.equal(packs.length, 5);
    assert.deepEqual(
      packs.map((pack) => pack.entityId),
      PHASE124_TARGET_IDS,
    );
    assert.deepEqual(
      packs.map((pack) => pack.spec?.values.release_year),
      PHASE124_EDITIONS.map((edition) => edition.year),
    );
    for (let index = 0; index < packs.length; index += 1) {
      const pack = packs[index];
      const edition = PHASE124_EDITIONS[index];
      assert.ok(pack && edition);
      assert.ok(
        Array.from(pack.summary).length >= 60 &&
          Array.from(pack.summary).length <= 160,
      );
      assert.ok(Array.from(pack.bodyMd).length >= 2_000);
      assert.match(pack.bodyMd, /\/article\/platinum-fuji-shunkei/);
      assert.deepEqual(
        pack.variants?.map((variant) => variant.name),
        edition.nibs,
      );
      assert.equal(
        new Set(
          pack.sources
            .filter((source) => source.sourceType === "official")
            .map((source) => source.independenceGroup),
        ).size,
        1,
      );
      for (const url of [
        edition.officialUrl,
        PHASE124_SERIES_URL,
        PHASE124_PNB13000_URL,
        edition.sampleUrl,
      ]) {
        const source = pack.sources.find((item) => item.url === url);
        assert.ok(source?.archiveLocator?.includes("locator="), url);
      }
      const sample = pack.sources.find(
        (source) => source.url === edition.sampleUrl,
      );
      assert.equal(sample?.tier, edition.sampleTier);
      assert.equal(sample?.publishedAt, edition.samplePublishedAt);
      assert.equal(
        (pack.spec?.evidence ?? []).filter((item) => item.qualifies === false)
          .length,
        edition.key === "kinshu" ? 4 : 3,
      );
    }
    assert.equal(
      packs
        .find((pack) => pack.entityId.endsWith("kinshu"))
        ?.sources.find((source) => source.url.includes("bertramsinkwell"))
        ?.tier,
      "retailer",
    );
    assert.equal(
      packs
        .find((pack) => pack.entityId.endsWith("kinshu"))
        ?.sources.find((source) => source.url.includes("racheldelafuente"))
        ?.tier,
      "professional_secondary",
    );

    const familyCopy = fs.readFileSync(
      path.join(ROOT_CANONICAL, phase124FamilyArticle.markdownFile),
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
    for (const edition of PHASE124_EDITIONS) {
      assert.match(
        familyBody,
        new RegExp(`/pen/platinum-fuji-shunkei-${edition.key}`),
      );
      assert.match(familyBody, new RegExp(edition.productCode));
    }
    for (const token of ["PNB-13000", "Fuji Unkei", "2017—2021"])
      assert.match(familyBody, new RegExp(token));

    const svgPaths = [
      "family",
      ...PHASE124_EDITIONS.map((edition) => edition.key),
    ].map((key) =>
      path.join(
        ROOT_CANONICAL,
        "public/images/library/site-original/phase124/platinum",
        `platinum-fuji-shunkei-${key}.svg`,
      ),
    );
    const svgHashes = new Set<string>();
    for (const svgPath of svgPaths) {
      const svg = fs.readFileSync(svgPath, "utf8");
      svgHashes.add(createHash("sha256").update(svg).digest("hex"));
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
    }
    assert.equal(svgHashes.size, 6);

    const raw = (
      await rows(client, "SELECT * FROM entities WHERE id=?", [
        PHASE124_ARTICLE_ID,
      ])
    )[0];
    assert.deepEqual(
      [raw?.type, raw?.slug, raw?.name, raw?.source],
      ["pen", PHASE124_RAW_SLUG, PHASE124_RAW_NAME, null],
    );
    assert.equal(Array.from(String(raw?.summary)).length, 98);
    assert.equal(Array.from(String(raw?.body_md)).length, 223);
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value FROM entities WHERE id IN (${PHASE124_TARGET_IDS.map(() => "?").join(",")})`,
        PHASE124_TARGET_IDS,
      ),
      0,
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT id,alias,language FROM entity_aliases WHERE entity_id=? ORDER BY id",
          [PHASE124_ARTICLE_ID],
        )
      ).map((row) => [row.id, row.alias, row.language]),
      [
        [
          "alias-ogo1UmxmcXJT-en-Platinum Fuji Shunkei",
          "Platinum Fuji Shunkei",
          "en",
        ],
        [
          "alias-ogo1UmxmcXJT-en-Platinum PNB-13000",
          "Platinum PNB-13000",
          "en",
        ],
        [
          "alias-ogo1UmxmcXJT-zh-白金 富士旬景 PNB-13000",
          "白金 富士旬景 PNB-13000",
          "zh",
        ],
      ],
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT id FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
          [PHASE124_ARTICLE_ID, PHASE124_ARTICLE_ID],
        )
      ).map((row) => row.id),
      [PHASE124_LEGACY_MADE_BY_ID, PHASE124_LEGACY_REVERSE_ID],
    );
    assert.equal(
      getReclassifiedArticlePath("pen", PHASE124_RAW_SLUG),
      `/article/${PHASE124_ARTICLE_SLUG}`,
    );

    const protectedIds = [
      PHASE124_3776_ID,
      PHASE124_CURIDAS_ID,
      PHASE124_PROCYON_ID,
      PHASE124_PRESIDENT_ID,
      PHASE124_IZUMO_ARTICLE_ID,
      PHASE124_PIZ_ID,
    ];
    const protectedBefore = new Map<string, string>();
    for (const id of protectedIds)
      protectedBefore.set(id, await entityDigest(client, id));
    const brandPayloadBefore = await entityDigest(
      client,
      PHASE124_BRAND_ID,
      false,
    );
    const reverseBefore = (
      await rows(
        client,
        "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
        [PHASE124_BRAND_ID],
      )
    ).map((row) => String(row.target_id));

    const digestBeforeAuthorityFaults = await ownedDigest(client);
    await assert.rejects(
      applyPhase124PlatinumFujiShunkeiContent(client, {
        ...options,
        reviewer: "",
      }),
      /reviewer must not be empty/,
    );
    await assert.rejects(
      applyPhase124PlatinumFujiShunkeiContent(client, {
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
      applyPhase124PlatinumFujiShunkeiContent(client, {
        ...options,
        workspaceRoot: ownedRoot,
      }),
      /verified CodeBuddy\/Documents repo pair/,
    );
    assert.equal(await ownedDigest(client), digestBeforeAuthorityFaults);

    const hardlinkPath = path.join(ownedRoot, "catalog-hardlink.db");
    fs.linkSync(copy.destinationPath, hardlinkPath);
    const hardlinkClient = createClient({ url: `file:${hardlinkPath}` });
    try {
      await assert.rejects(
        applyPhase124PlatinumFujiShunkeiContent(hardlinkClient, {
          ...options,
          databasePath: hardlinkPath,
        }),
        /hard-link alias/,
      );
    } finally {
      hardlinkClient.close();
      fs.unlinkSync(hardlinkPath);
    }
    assert.equal(await ownedDigest(client), digestBeforeAuthorityFaults);

    const first = await applyPhase124PlatinumFujiShunkeiContent(
      client,
      options,
    );
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [PHASE124_ARTICLE_ID, ...PHASE124_TARGET_IDS].map((id) => [
        id,
        "published",
      ]),
    );

    const article = (
      await rows(client, "SELECT * FROM entities WHERE id=?", [
        PHASE124_ARTICLE_ID,
      ])
    )[0];
    assert.deepEqual(
      [article?.type, article?.slug, article?.name],
      ["article", PHASE124_ARTICLE_SLUG, PHASE124_ARTICLE_NAME],
    );
    assert.deepEqual(
      (
        await rows(
          client,
          "SELECT alias,language FROM entity_aliases WHERE entity_id=? ORDER BY alias",
          [PHASE124_ARTICLE_ID],
        )
      ).map((row) => [row.alias, row.language]),
      [["Platinum Fuji Shunkei", "en"]],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id=? OR target_id=?",
        [PHASE124_ARTICLE_ID, PHASE124_ARTICLE_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM model_specs WHERE entity_id=?",
        [PHASE124_ARTICLE_ID],
      ),
      0,
    );

    for (let index = 0; index < packs.length; index += 1) {
      const pack = packs[index];
      const edition = PHASE124_EDITIONS[index];
      assert.ok(pack && edition);
      assert.deepEqual(
        (
          await rows(
            client,
            "SELECT id,source_id,target_id,link_type FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
            [pack.entityId, pack.entityId],
          )
        ).map((row) => [row.id, row.source_id, row.target_id, row.link_type]),
        [
          [
            PHASE124_NEW_MADE_BY_IDS[index],
            pack.entityId,
            PHASE124_BRAND_ID,
            "made_by",
          ],
          [
            PHASE124_NEW_REVERSE_IDS[index],
            PHASE124_BRAND_ID,
            pack.entityId,
            "reverse",
          ],
        ],
      );
      assert.deepEqual(
        (
          await rows(
            client,
            "SELECT variant_name FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
            [pack.entityId],
          )
        ).map((row) => String(row.variant_name)),
        [...edition.nibs].sort(),
      );
      const hash = await computePublicationContentHash(client, pack.entityId);
      const publication = (
        await rows(
          client,
          "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
          [pack.entityId],
        )
      )[0];
      assert.deepEqual(
        [publication?.status, publication?.approved_content_hash],
        ["published", hash],
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media','publication')",
          [pack.entityId, hash],
        ),
        4,
      );
    }

    const reverseAfter = (
      await rows(
        client,
        "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
        [PHASE124_BRAND_ID],
      )
    ).map((row) => String(row.target_id));
    assert.deepEqual(
      reverseAfter,
      reverseBefore
        .filter((id) => id !== PHASE124_ARTICLE_ID)
        .concat(PHASE124_TARGET_IDS)
        .sort(),
    );
    assert.equal(
      await entityDigest(client, PHASE124_BRAND_ID, false),
      brandPayloadBefore,
    );
    for (const id of protectedIds)
      assert.equal(await entityDigest(client, id), protectedBefore.get(id));

    const pristine = await ownedDigest(client);
    const replay = await applyPhase124PlatinumFujiShunkeiContent(
      client,
      options,
    );
    assert.deepEqual(
      replay.entities.map((entity) => [entity.entityId, entity.outcome]),
      [PHASE124_ARTICLE_ID, ...PHASE124_TARGET_IDS].map((id) => [id, "noop"]),
    );
    assert.equal(await ownedDigest(client), pristine);

    const tamperTarget = PHASE124_TARGET_IDS[2];
    const tamperEdition = PHASE124_EDITIONS[2];
    assert.ok(tamperTarget && tamperEdition);
    const originalVariant = tamperEdition.nibs[0];
    assert.ok(originalVariant);
    await client.execute("SAVEPOINT phase124_variant_tamper");
    await client.execute({
      sql: "UPDATE model_variants SET variant_name='tampered' WHERE model_entity_id=? AND variant_name=?",
      args: [tamperTarget, originalVariant],
    });
    const tampered = await ownedDigest(client);
    await assert.rejects(
      applyPhase124PlatinumFujiShunkeiContent(client, options),
      /identity\/content\/publication is invalid|variant set is invalid/,
    );
    assert.equal(await ownedDigest(client), tampered);
    await client.execute("ROLLBACK TO phase124_variant_tamper");
    await client.execute("RELEASE phase124_variant_tamper");
    assert.equal(await ownedDigest(client), pristine);

    await client.execute("SAVEPOINT phase124_alias_tamper");
    await client.execute({
      sql: "INSERT INTO entity_aliases(id,entity_id,alias,language) VALUES('phase124-tampered-false-alias',?,'Platinum PNB-13000','en')",
      args: [PHASE124_ARTICLE_ID],
    });
    const tamperedAlias = await ownedDigest(client);
    await assert.rejects(
      applyPhase124PlatinumFujiShunkeiContent(client, options),
      /identity\/content\/publication is invalid|retained false PNB-13000 aliases/,
    );
    assert.equal(await ownedDigest(client), tamperedAlias);
    await client.execute("ROLLBACK TO phase124_alias_tamper");
    await client.execute("RELEASE phase124_alias_tamper");
    assert.equal(await ownedDigest(client), pristine);

    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  }
});
