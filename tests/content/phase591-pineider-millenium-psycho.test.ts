import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase591Options,
  applyPhase591PineiderMilleniumPsychoContent,
} from "../../scripts/apply-phase591-pineider-millenium-psycho-content";
import {
  PHASE591_IDS,
  PHASE591_PINEIDER_BRAND_ID,
  PHASE591_SLUGS,
  phase591PineiderPacks,
} from "../../scripts/data/phase591-pineider-millenium-psycho";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const SOURCE = process.env.FPKG_PHASE591_SOURCE_DATABASE
  ? fs.realpathSync.native(process.env.FPKG_PHASE591_SOURCE_DATABASE)
  : REAL;
const EXPECTED_SOURCE_SHA256 =
  "23bcef02269a11600d59b1d5e1b466d984664b5acb7e6f2f6a64a9c116ad8b74";

const MILLENIUM_CHILD_SKUS = [
  "SSPFXPP4801G20",
  "SSPMXPP4801G20",
  "SSPSXPP4801G20",
  "SSPBXPP4801G20",
  "SSPEXPP4801G20",
] as const;

const PSYCHO_CHILD_SKUS = [
  "SSPSXPP4301099",
  "SSPMXPP4301099",
  "SSPFXPP4301099",
  "SSPBXPP4301099",
  "SSPEXPP4301099",
] as const;

const TARGETS = [
  {
    id: PHASE591_IDS.millenium,
    slug: PHASE591_SLUGS.millenium,
    name: "Pineider Millenium Fountain Pen",
    markers: [
      "PP4801／945",
      "SSPFXPP4801G20",
      "88 pieces",
      "aluminum",
      "Arman",
      "Piston Filler",
    ],
  },
  {
    id: PHASE591_IDS.psycho,
    slug: PHASE591_SLUGS.psycho,
    name: "Pineider Psycho Fountain Pen",
    markers: [
      "PP4301／468",
      "SSPSXPP4301099",
      "140 MM",
      "925 silver",
      "cartridge／converter",
      "Piston Filler",
    ],
  },
] as const;

async function rows(client: Client, sql: string, args: unknown[] = []) {
  const result = await client.execute({ sql, args: args as never[] });
  return result.rows.map((row) => ({ ...row }));
}

function sha256(file: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function createOwnedCopy(
  prefix: string,
  sourceSnapshot: ReturnType<typeof snapshotCatalogFiles>,
) {
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
  );
  const copy = copyCheckpointedCatalogToDisposableCopy(
    SOURCE,
    path.join(ownedRoot, "catalog.db"),
    ownedRoot,
    { expectedSourceSnapshot: sourceSnapshot },
  );
  return { ownedRoot, databasePath: copy.destinationPath };
}

function options(
  ownedRoot: string,
  databasePath: string,
  protectedSnapshot: ReturnType<typeof snapshotCatalogFiles>,
): ApplyPhase591Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase591-pineider-millenium-psycho-test",
    databasePath,
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
}

async function entityDigest(client: Client, entityId: string): Promise<string> {
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
    "SELECT * FROM timeline_events WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
    "SELECT * FROM entity_publications WHERE entity_id=?",
    "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
  ];
  const payload: Array<Array<Record<string, unknown>>> = [];
  for (const sql of queries) {
    payload.push(
      await rows(
        client,
        sql,
        sql.includes(" OR ") ? [entityId, entityId] : [entityId],
      ),
    );
  }
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

async function assertCollisionRejected(
  label: string,
  sourceSnapshot: ReturnType<typeof snapshotCatalogFiles>,
  protectedSnapshot: ReturnType<typeof snapshotCatalogFiles>,
  mutate: (client: Client) => Promise<void>,
): Promise<void> {
  const owned = createOwnedCopy(`fpkg-phase591-${label}-`, sourceSnapshot);
  const client = createClient({ url: `file:${owned.databasePath}` });
  try {
    await migrateDatabase(client);
    await mutate(client);
    await assert.rejects(
      applyPhase591PineiderMilleniumPsychoContent(
        client,
        options(owned.ownedRoot, owned.databasePath, protectedSnapshot),
      ),
      /collision|identity mismatch/,
    );
  } finally {
    client.close();
  }
}

async function publicationCounts(client: Client) {
  const result = (
    await rows(
      client,
      `SELECT
         (SELECT count(*) FROM public_entities) AS public_count,
         (SELECT count(*) FROM public_entity_readiness
            WHERE contract_version=3 AND publishable=1 AND blocker_count=0) AS ready_count`,
    )
  )[0];
  return {
    publicCount: Number(result?.public_count),
    readyCount: Number(result?.ready_count),
  };
}

test("Phase 591 publishes exact Pineider Millenium and Psycho identities on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
  // Capture both protected families before any SQLite client exists. SOURCE is
  // read and copied only by the catalog snapshot/copy helpers.
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const protectedHash = sha256(REAL);
  const sourceHash = sha256(SOURCE);
  assert.equal(sourceHash, EXPECTED_SOURCE_SHA256);

  await assertCollisionRejected(
    "id-collision",
    sourceSnapshot,
    protectedSnapshot,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [
          PHASE591_IDS.millenium,
          "phase591-wrong-millenium-id",
          "Phase 591 wrong Millenium identity",
        ],
      });
    },
  );
  await assertCollisionRejected(
    "slug-collision",
    sourceSnapshot,
    protectedSnapshot,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [
          "phase591-slug-collision",
          PHASE591_SLUGS.millenium,
          "Phase 591 slug collision",
        ],
      });
    },
  );
  await assertCollisionRejected(
    "name-collision",
    sourceSnapshot,
    protectedSnapshot,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [
          "phase591-name-collision",
          "phase591-name-collision",
          TARGETS[0].name,
        ],
      });
    },
  );
  await assertCollisionRejected(
    "alias-collision",
    sourceSnapshot,
    protectedSnapshot,
    async (client) => {
      await client.execute({
        sql: "INSERT INTO entity_aliases(id,entity_id,alias,language) VALUES(?,?,?,'en')",
        args: [
          "phase591-alias-collision",
          PHASE591_PINEIDER_BRAND_ID,
          "Pineider PP4801",
        ],
      });
    },
  );

  const owned = createOwnedCopy(
    "fpkg-phase591-pineider-millenium-psycho-",
    sourceSnapshot,
  );
  const client = createClient({ url: `file:${owned.databasePath}` });
  const applyOptions = options(
    owned.ownedRoot,
    owned.databasePath,
    protectedSnapshot,
  );
  try {
    await migrateDatabase(client);

    assert.deepEqual(
      phase591PineiderPacks.map((pack) => pack.entityId),
      [PHASE591_PINEIDER_BRAND_ID, PHASE591_IDS.millenium, PHASE591_IDS.psycho],
    );
    const modelPacks = phase591PineiderPacks.filter(
      (pack) => pack.expectedType === "pen",
    );
    assert.equal(modelPacks.length, 2);
    assert.equal(new Set(modelPacks.map((pack) => pack.entityId)).size, 2);

    for (const pack of modelPacks) {
      const markdown = fs.readFileSync(
        path.join(ROOT, pack.markdownFile),
        "utf8",
      );
      assert.ok(Array.from(markdown).length >= 2_000);
      assert.match(markdown, /## body_md/);
      assert.match(markdown, /## 身份/);
      assert.match(markdown, /## 上墨/);
      assert.match(markdown, /## 购买核验/);
      assert.match(markdown, /## 图片说明/);
      assert.match(markdown, /## 来源/);
      assert.doesNotMatch(markdown, /## model_specs/i);
      assert.doesNotMatch(markdown, /made_by|CuratedEntityPack|数据库字段/i);
      assert.ok(
        pack.sources.some((source) => source.sourceType === "official"),
      );
      assert.ok(
        pack.sources.some((source) => source.tier === "professional_secondary"),
      );
      assert.ok(
        new Set(
          pack.sources
            .filter((source) => source.itemType !== "image")
            .map((source) => source.independenceGroup),
        ).size >= 2,
      );
      for (const source of pack.sources.filter(
        (candidate) => candidate.itemType !== "image",
      )) {
        assert.match(source.url, /^https:\/\//);
        assert.equal(source.archiveUrl, source.url);
        assert.match(String(source.archiveLocator), /retrieved=2026-08-11/);
        assert.match(String(source.archiveLocator), /locator=.+/);
      }
      const primary = pack.media.filter(
        (media) => media.usageStatus === "primary",
      );
      assert.equal(primary.length, 1);
      const svgPath = path.join(
        ROOT,
        "public",
        String(primary[0]?.localPath).replace(/^\//, ""),
      );
      const svg = fs.readFileSync(svgPath, "utf8");
      assert.match(svg, /width="1600"/);
      assert.match(svg, /height="900"/);
      assert.match(svg, /viewBox="0 0 1600 900"/);
      assert.match(svg, /role="img"/);
      assert.match(svg, /aria-labelledby="title desc"/);
      assert.match(svg, /<title id="title">[^<]+<\/title>/);
      assert.match(svg, /<desc id="desc">[^<]+<\/desc>/);
      assert.match(svg, /本站原创示意图/);
      assert.match(svg, /非产品照片/);
    }

    const primaryPaths = modelPacks.map(
      (pack) =>
        pack.media.find((media) => media.usageStatus === "primary")?.localPath,
    );
    assert.equal(new Set(primaryPaths).size, 2);
    assert.equal(
      new Set(
        primaryPaths.map((localPath) =>
          sha256(
            path.join(ROOT, "public", String(localPath).replace(/^\//, "")),
          ),
        ),
      ).size,
      2,
    );

    const milleniumPack = modelPacks.find(
      (pack) => pack.entityId === PHASE591_IDS.millenium,
    );
    const psychoPack = modelPacks.find(
      (pack) => pack.entityId === PHASE591_IDS.psycho,
    );
    assert.ok(milleniumPack);
    assert.ok(psychoPack);
    assert.ok(
      milleniumPack.aliases.some(
        ({ alias }) => alias === "Pineider Millennium Fountain Pen",
      ),
    );
    assert.equal(
      milleniumPack.aliases.some(({ alias }) => /Arman/i.test(alias)),
      false,
    );
    assert.deepEqual(
      MILLENIUM_CHILD_SKUS.every((sku) =>
        milleniumPack.variants?.some((variant) => variant.productCode === sku),
      ),
      true,
    );
    assert.deepEqual(
      PSYCHO_CHILD_SKUS.every((sku) =>
        psychoPack.variants?.some((variant) => variant.productCode === sku),
      ),
      true,
    );
    assert.ok(
      psychoPack.scopes.some(
        (scope) =>
          /Yellow Gold/.test(String(scope.market)) &&
          /PP4301-099 is not assigned/.test(String(scope.materialScope)),
      ),
    );
    assert.ok(
      psychoPack.scopes.some(
        (scope) =>
          /Rose Gold/.test(String(scope.market)) &&
          /88/.test(String(scope.editionScope)),
      ),
    );

    const brandMarkdown = fs.readFileSync(
      path.join(ROOT, phase591PineiderPacks[0]?.markdownFile ?? ""),
      "utf8",
    );
    for (const canonicalName of [
      "Pineider Avatar UR",
      "Pineider Arco Fountain Pen",
      "Pineider Rock Fountain Pen",
      "Pineider Classic Palladium Fountain Pen",
      "Pineider Tempi Moderni Fountain Pen",
      "Pineider Grande Bellezza Forged Carbon Fountain Pen",
      "Pineider Mystery Fast Filler Fountain Pen",
      "Pineider Millenium Fountain Pen",
      "Pineider Psycho Fountain Pen",
    ]) {
      assert.ok(brandMarkdown.includes(`[[${canonicalName}]]`));
    }

    const beforeTargets = await rows(
      client,
      "SELECT id FROM entities WHERE id IN (?,?)",
      TARGETS.map((target) => target.id),
    );
    const beforeIds = new Set(beforeTargets.map((row) => String(row.id)));
    const missingBefore = TARGETS.length - beforeIds.size;
    assert.equal(missingBefore, 2);

    const brandPensBeforeRows = await rows(
      client,
      `SELECT DISTINCT pen.id
         FROM public_entities pen
         JOIN entity_links maker
           ON maker.source_id=pen.id AND maker.link_type='made_by'
         WHERE pen.type='pen' AND maker.target_id=?
         ORDER BY pen.id`,
      [PHASE591_PINEIDER_BRAND_ID],
    );
    assert.equal(brandPensBeforeRows.length, 7);
    const protectedModelDigests = new Map<string, string>();
    for (const row of brandPensBeforeRows) {
      const id = String(row.id);
      protectedModelDigests.set(id, await entityDigest(client, id));
    }
    const countsBefore = await publicationCounts(client);

    for (const [envKey, envValue] of [
      ["TURSO_DATABASE_URL", "libsql://remote.invalid"],
      ["TURSO_AUTH_TOKEN", "forged-token"],
      ["FPKG_DATABASE_URL", "file:/unauthorized.db"],
    ] as const) {
      const ownedHashBeforeRemoteRejection = sha256(owned.databasePath);
      await assert.rejects(
        applyPhase591PineiderMilleniumPsychoContent(client, {
          ...applyOptions,
          env: {
            ...applyOptions.env,
            [envKey]: envValue,
          } as NodeJS.ProcessEnv,
        }),
        /inherited remote database selection/,
      );
      assert.equal(sha256(owned.databasePath), ownedHashBeforeRemoteRejection);
    }

    const first = await applyPhase591PineiderMilleniumPsychoContent(
      client,
      applyOptions,
    );
    assert.deepEqual(
      first.entities.map((entity) => entity.entityId),
      phase591PineiderPacks.map((pack) => pack.entityId),
    );
    assert.equal(
      first.entities.every((entity) => entity.outcome === "published"),
      true,
    );

    for (const target of TARGETS) {
      const state = (
        await rows(
          client,
          `SELECT entity.type,entity.slug,entity.name,entity.body_md,entity.source,
                    publication.status,publication.approved_content_hash,
                    publication.content_revision,
                    publication.reviewed_content_revision,
                    publication.reviewed_contract_version,
                    readiness.publishable,readiness.blocker_count,
                    CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
             FROM entities entity
             JOIN entity_publications publication ON publication.entity_id=entity.id
             LEFT JOIN public_entity_readiness readiness
               ON readiness.entity_id=entity.id AND readiness.contract_version=3
             LEFT JOIN public_entities public ON public.id=entity.id
             WHERE entity.id=?`,
          [target.id],
        )
      )[0];
      assert.equal(state?.type, "pen");
      assert.equal(state?.slug, target.slug);
      assert.equal(state?.name, target.name);
      assert.match(String(state?.source), /^curated-content:phase591-/);
      assert.equal(state?.status, "published");
      assert.equal(
        Number(state?.content_revision),
        Number(state?.reviewed_content_revision),
      );
      assert.equal(Number(state?.reviewed_contract_version), 3);
      assert.equal(Number(state?.publishable), 1);
      assert.equal(Number(state?.blocker_count), 0);
      assert.equal(Number(state?.is_public), 1);
      const body = String(state?.body_md ?? "");
      assert.ok(Array.from(body).length >= 2_000);
      for (const marker of target.markers) {
        assert.match(
          body,
          new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        );
      }
      assert.doesNotMatch(body, /## model_specs|made_by|CuratedEntityPack/i);

      const topology = await rows(
        client,
        `SELECT
             (SELECT count(*) FROM entity_links
                WHERE source_id=? AND link_type='made_by' AND target_id=?) AS maker,
             (SELECT count(*) FROM entity_links
                WHERE target_id=? AND link_type='reverse' AND source_id=?) AS reverse,
             (SELECT count(*) FROM model_specs WHERE entity_id=?) AS specs,
             (SELECT count(*) FROM media_assets
                WHERE entity_id=? AND usage_status='primary') AS primary_media`,
        [
          target.id,
          PHASE591_PINEIDER_BRAND_ID,
          target.id,
          PHASE591_PINEIDER_BRAND_ID,
          target.id,
          target.id,
        ],
      );
      assert.deepEqual(
        [
          Number(topology[0]?.maker),
          Number(topology[0]?.reverse),
          Number(topology[0]?.specs),
          Number(topology[0]?.primary_media),
        ],
        [1, 1, 1, 1],
      );

      const reviews = await rows(
        client,
        `SELECT review_kind,status FROM entity_content_reviews
           WHERE entity_id=? AND content_hash=? ORDER BY review_kind`,
        [target.id, state?.approved_content_hash],
      );
      assert.deepEqual(
        reviews,
        ["fact", "language", "media", "publication"].map((reviewKind) => ({
          review_kind: reviewKind,
          status: "approved",
        })),
      );
    }

    const aliases = await rows(
      client,
      `SELECT entity_id,alias FROM entity_aliases
         WHERE entity_id IN (?,?) ORDER BY entity_id,alias`,
      TARGETS.map((target) => target.id),
    );
    assert.ok(
      aliases.some(
        (row) =>
          row.entity_id === PHASE591_IDS.millenium &&
          row.alias === "Pineider Millennium Fountain Pen",
      ),
    );
    assert.equal(
      aliases.some((row) => /Arman/i.test(String(row.alias))),
      false,
    );

    const variants = await rows(
      client,
      `SELECT model_entity_id,variant_name,product_code,market
         FROM model_variants WHERE model_entity_id IN (?,?)
         ORDER BY model_entity_id,product_code,variant_name`,
      TARGETS.map((target) => target.id),
    );
    const productCodes = new Set(
      variants.map((row) => String(row.product_code)),
    );
    for (const sku of [...MILLENIUM_CHILD_SKUS, ...PSYCHO_CHILD_SKUS]) {
      assert.ok(productCodes.has(sku));
    }
    assert.ok(productCodes.has("PP4801 / 945"));
    assert.ok(productCodes.has("PP4301 / 468; PP4301-099"));
    assert.equal(
      variants.some(
        (row) =>
          /Yellow Gold|Rose Gold/.test(String(row.variant_name)) &&
          /PP4301-099/.test(String(row.product_code)),
      ),
      false,
    );

    const specs = await rows(
      client,
      `SELECT entity_id,series_name,nib,fill_system,material,dimensions,weight,status
         FROM model_specs WHERE entity_id IN (?,?) ORDER BY entity_id`,
      TARGETS.map((target) => target.id),
    );
    assert.equal(specs.length, 2);
    const byId = new Map(specs.map((spec) => [String(spec.entity_id), spec]));
    const milleniumSpec = byId.get(PHASE591_IDS.millenium);
    assert.match(
      String(milleniumSpec?.series_name),
      /PP4801\/945.*Millennium/i,
    );
    assert.match(String(milleniumSpec?.nib), /14K.*F\/M\/S\/B\/EF/);
    assert.match(String(milleniumSpec?.fill_system), /Piston Filler.*Twist/i);
    assert.match(
      String(milleniumSpec?.material),
      /Aluminum.*black PVD.*marine/i,
    );
    assert.match(String(milleniumSpec?.dimensions), /publishes no dimensions/i);
    assert.match(String(milleniumSpec?.weight), /publishes no weight/i);
    assert.match(String(milleniumSpec?.status), /250th.*88/i);

    const psychoSpec = byId.get(PHASE591_IDS.psycho);
    assert.match(
      String(psychoSpec?.series_name),
      /PP4301\/468.*Palladium.*Yellow Gold.*Rose Gold/i,
    );
    assert.match(String(psychoSpec?.nib), /F\/M\/S\/B\/EF.*14K.*Hyperflex/i);
    assert.match(
      String(psychoSpec?.fill_system),
      /Cartridge\/converter.*Piston metadata rejected/i,
    );
    assert.match(
      String(psychoSpec?.material),
      /925 silver.*Palladium.*Yellow Gold.*Rose Gold/i,
    );
    assert.match(String(psychoSpec?.dimensions), /140 mm.*18\.5 mm/);
    assert.match(
      String(psychoSpec?.status),
      /88 per trim\/color.*writing mode.*not family-total/i,
    );

    const conflicts = await rows(
      client,
      `SELECT entity_id,field_key,status,count(member.id) AS member_count
         FROM fact_conflicts conflict
         LEFT JOIN fact_conflict_members member ON member.conflict_id=conflict.id
         WHERE entity_id IN (?,?)
         GROUP BY entity_id,field_key,status
         ORDER BY entity_id,field_key`,
      TARGETS.map((target) => target.id),
    );
    assert.deepEqual(conflicts, [
      {
        entity_id: PHASE591_IDS.millenium,
        field_key: "model_identity",
        status: "resolved",
        member_count: 3,
      },
      {
        entity_id: PHASE591_IDS.millenium,
        field_key: "series_name",
        status: "resolved",
        member_count: 2,
      },
      {
        entity_id: PHASE591_IDS.psycho,
        field_key: "edition_count",
        status: "resolved",
        member_count: 3,
      },
      {
        entity_id: PHASE591_IDS.psycho,
        field_key: "fill_system",
        status: "resolved",
        member_count: 4,
      },
      {
        entity_id: PHASE591_IDS.psycho,
        field_key: "trim_scope",
        status: "resolved",
        member_count: 3,
      },
    ]);

    const rejected = await rows(
      client,
      `SELECT spec.entity_id,evidence.field_key,source.url,evidence.review_status,
                evidence.evidence_locator AS locator
         FROM spec_field_evidence evidence
         JOIN model_specs spec ON spec.id=evidence.model_spec_id
         JOIN citations citation ON citation.id=evidence.citation_id
         JOIN source_items source ON source.id=citation.source_item_id
         WHERE spec.entity_id IN (?,?) AND evidence.review_status='rejected'
         ORDER BY spec.entity_id,evidence.field_key,source.url`,
      TARGETS.map((target) => target.id),
    );
    assert.ok(rejected.length >= 6);
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE591_IDS.millenium &&
          row.field_key === "series_name" &&
          String(row.url).includes("truphaeinc.com"),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE591_IDS.millenium &&
          row.field_key === "weight" &&
          /68\.32/.test(String(row.locator)),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE591_IDS.psycho &&
          row.field_key === "fill_system" &&
          String(row.url).includes("chatterleyluxuries.com") &&
          /Piston Filler/.test(String(row.locator)),
      ),
    );

    const editionScopes = await rows(
      client,
      `SELECT entity_id,scope_key,edition_scope FROM fact_scopes
         WHERE entity_id IN (?,?) ORDER BY entity_id,scope_key`,
      TARGETS.map((target) => target.id),
    );
    assert.ok(
      editionScopes.some(
        (row) =>
          row.entity_id === PHASE591_IDS.psycho &&
          /88 for each trim\/color and each writing mode/.test(
            String(row.edition_scope),
          ),
      ),
    );
    assert.equal(
      editionScopes.some(
        (row) =>
          row.entity_id === PHASE591_IDS.psycho &&
          /family total(?:s)? 88|88 total/i.test(String(row.edition_scope)),
      ),
      false,
    );

    const brand = (
      await rows(client, "SELECT body_md FROM public_entities WHERE id=?", [
        PHASE591_PINEIDER_BRAND_ID,
      ])
    )[0];
    const brandBody = String(brand?.body_md ?? "");
    for (const canonicalName of [
      "Pineider Avatar UR",
      "Pineider Arco Fountain Pen",
      "Pineider Rock Fountain Pen",
      "Pineider Classic Palladium Fountain Pen",
      "Pineider Tempi Moderni Fountain Pen",
      "Pineider Grande Bellezza Forged Carbon Fountain Pen",
      "Pineider Mystery Fast Filler Fountain Pen",
      "Pineider Millenium Fountain Pen",
      "Pineider Psycho Fountain Pen",
    ]) {
      assert.ok(brandBody.includes(`[[${canonicalName}]]`));
    }

    const brandPensAfter = Number(
      (
        await rows(
          client,
          `SELECT count(DISTINCT pen.id) AS n
             FROM public_entities pen
             JOIN entity_links maker
               ON maker.source_id=pen.id AND maker.link_type='made_by'
             WHERE pen.type='pen' AND maker.target_id=?`,
          [PHASE591_PINEIDER_BRAND_ID],
        )
      )[0]?.n,
    );
    assert.equal(brandPensAfter, 9);
    assert.equal(brandPensAfter, brandPensBeforeRows.length + missingBefore);

    const countsAfter = await publicationCounts(client);
    assert.equal(
      countsAfter.publicCount,
      countsBefore.publicCount + missingBefore,
    );
    assert.equal(
      countsAfter.readyCount,
      countsBefore.readyCount + missingBefore,
    );

    for (const [id, digest] of protectedModelDigests) {
      assert.equal(await entityDigest(client, id), digest);
    }

    const replay = await applyPhase591PineiderMilleniumPsychoContent(
      client,
      applyOptions,
    );
    assert.equal(
      replay.entities.every((entity) => entity.outcome === "noop"),
      true,
    );
    assert.deepEqual(
      replay.entities.map((entity) => entity.contentHash),
      first.entities.map((entity) => entity.contentHash),
    );

    assert.equal(sha256(REAL), protectedHash);
    assert.equal(sha256(SOURCE), sourceHash);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
    assertCatalogSnapshotUnchanged(sourceSnapshot);
  } finally {
    client.close();
  }
});
