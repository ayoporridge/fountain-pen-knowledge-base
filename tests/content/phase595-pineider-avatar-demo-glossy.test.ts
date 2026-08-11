import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase595Options,
  applyPhase595PineiderAvatarDemoGlossyContent,
} from "../../scripts/apply-phase595-pineider-avatar-demo-glossy-content";
import {
  PHASE595_DEMO_PRICED_SKUS,
  PHASE595_DEMO_UNPRICED_CODES,
  PHASE595_GLOSSY_HIDDEN_CODES,
  PHASE595_GLOSSY_PRICED_SKUS,
  PHASE595_IDS,
  PHASE595_PINEIDER_BRAND_ID,
  PHASE595_SLUGS,
  phase595PineiderPacks,
} from "../../scripts/data/phase595-pineider-avatar-demo-glossy";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const SOURCE = process.env.FPKG_PHASE595_SOURCE_DATABASE
  ? fs.realpathSync.native(process.env.FPKG_PHASE595_SOURCE_DATABASE)
  : REAL;
const EXPECTED_SOURCE_SHA256 =
  "d799dd0e07d68a27bcad31a8685088bacde5937bf0534075fd27ed42a6a212e8";

const TARGETS = [
  {
    id: PHASE595_IDS.demoMetal,
    slug: PHASE595_SLUGS.demoMetal,
    name: "Pineider Avatar UR Demo Metal Fountain Pen",
    markers: [
      "PP3401／608",
      "PP3901／611",
      "SFAE0PP3401438",
      "SFAM0PP3901378",
      "三十一个",
      "透明 UltraResin",
      "Magnetic Lock",
    ],
  },
  {
    id: PHASE595_IDS.glossy,
    slug: PHASE595_SLUGS.glossy,
    name: "Pineider Avatar UR Glossy Fountain Pen",
    markers: [
      "PP4001／602",
      "SSAFXPP4001406",
      "SSAEXPP4001406",
      "all-black look",
      "Lapis Blue",
      "Nero",
      "十六个",
    ],
  },
] as const;

const BRAND_MODEL_NAMES = [
  "Pineider Avatar UR",
  "Pineider Arco Fountain Pen",
  "Pineider Rock Fountain Pen",
  "Pineider Classic Palladium Fountain Pen",
  "Pineider Tempi Moderni Fountain Pen",
  "Pineider Grande Bellezza Forged Carbon Fountain Pen",
  "Pineider Mystery Fast Filler Fountain Pen",
  "Pineider Millenium Fountain Pen",
  "Pineider Psycho Fountain Pen",
  "Pineider Alba Classic Fountain Pen",
  "Pineider Alba Mini Fountain Pen",
  "Pineider Avatar Anniversary Fountain Pen",
  "Pineider Avatar UR Mini Fountain Pen",
  "Pineider Egosphere Fountain Pen",
  "Pineider Avatar UR Demo Metal Fountain Pen",
  "Pineider Avatar UR Glossy Fountain Pen",
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
): ApplyPhase595Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase595-pineider-avatar-demo-glossy-test",
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
  const owned = createOwnedCopy(`fpkg-phase595-${label}-`, sourceSnapshot);
  const client = createClient({ url: `file:${owned.databasePath}` });
  try {
    await migrateDatabase(client);
    await mutate(client);
    await assert.rejects(
      applyPhase595PineiderAvatarDemoGlossyContent(
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

test("Phase 595 publishes canonical Pineider Avatar Demo Metal and Glossy on an owned checkpoint", {
  timeout: 900_000,
}, async () => {
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
          PHASE595_IDS.demoMetal,
          "phase595-wrong-demo-id",
          "Phase 595 wrong Demo identity",
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
          "phase595-slug-collision",
          PHASE595_SLUGS.demoMetal,
          "Phase 595 slug collision",
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
          "phase595-name-collision",
          "phase595-name-collision",
          TARGETS[1].name,
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
          "phase595-alias-collision",
          PHASE595_PINEIDER_BRAND_ID,
          "Pineider PP4001",
        ],
      });
    },
  );

  const owned = createOwnedCopy(
    "fpkg-phase595-pineider-avatar-demo-glossy-",
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
      phase595PineiderPacks.map((pack) => pack.entityId),
      [PHASE595_PINEIDER_BRAND_ID, PHASE595_IDS.demoMetal, PHASE595_IDS.glossy],
    );
    const modelPacks = phase595PineiderPacks.filter(
      (pack) => pack.expectedType === "pen",
    );
    assert.equal(modelPacks.length, 2);
    assert.equal(new Set(modelPacks.map((pack) => pack.entityId)).size, 2);

    for (const pack of modelPacks) {
      const markdown = fs.readFileSync(
        path.join(ROOT, pack.markdownFile),
        "utf8",
      );
      assert.ok(Array.from(markdown).length >= 2_500);
      assert.match(markdown, /## body_md/);
      assert.match(markdown, /## 图片说明/);
      assert.match(markdown, /## 来源/);
      assert.match(markdown, /## (?:购买|怎么选)/);
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

    const demoPack = modelPacks.find(
      (pack) => pack.entityId === PHASE595_IDS.demoMetal,
    );
    const glossyPack = modelPacks.find(
      (pack) => pack.entityId === PHASE595_IDS.glossy,
    );
    assert.ok(demoPack);
    assert.ok(glossyPack);
    assert.ok(
      demoPack.aliases.some(
        ({ alias }) => alias === "Pineider Avatar UR Demo Metal Black",
      ),
    );
    assert.ok(
      glossyPack.aliases.some(({ alias }) => alias === "Pineider PP4001"),
    );
    assert.equal(
      PHASE595_DEMO_PRICED_SKUS.every((productCode) =>
        demoPack.variants?.some(
          (variant) => variant.productCode === productCode,
        ),
      ),
      true,
    );
    assert.equal(
      PHASE595_GLOSSY_PRICED_SKUS.every((productCode) =>
        glossyPack.variants?.some(
          (variant) => variant.productCode === productCode,
        ),
      ),
      true,
    );
    assert.equal(
      [...PHASE595_DEMO_UNPRICED_CODES].some((productCode) =>
        demoPack.variants?.some(
          (variant) => variant.productCode === productCode,
        ),
      ),
      false,
    );
    assert.equal(
      [...PHASE595_GLOSSY_HIDDEN_CODES].some((productCode) =>
        glossyPack.variants?.some(
          (variant) => variant.productCode === productCode,
        ),
      ),
      false,
    );

    const brandMarkdown = fs.readFileSync(
      path.join(ROOT, phase595PineiderPacks[0]?.markdownFile ?? ""),
      "utf8",
    );
    for (const canonicalName of BRAND_MODEL_NAMES) {
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
      [PHASE595_PINEIDER_BRAND_ID],
    );
    assert.equal(brandPensBeforeRows.length, 14);
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
        applyPhase595PineiderAvatarDemoGlossyContent(client, {
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

    const first = await applyPhase595PineiderAvatarDemoGlossyContent(
      client,
      applyOptions,
    );
    assert.deepEqual(
      first.entities.map((entity) => entity.entityId),
      phase595PineiderPacks.map((pack) => pack.entityId),
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
      assert.match(String(state?.source), /^curated-content:phase595-/);
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
      assert.ok(Array.from(body).length >= 2_500);
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
          PHASE595_PINEIDER_BRAND_ID,
          target.id,
          PHASE595_PINEIDER_BRAND_ID,
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
          row.entity_id === PHASE595_IDS.demoMetal &&
          row.alias === "Pineider Avatar UR Demo Metal Black",
      ),
    );
    assert.ok(
      aliases.some(
        (row) =>
          row.entity_id === PHASE595_IDS.glossy &&
          row.alias === "Pineider PP4001",
      ),
    );

    const variants = await rows(
      client,
      `SELECT child.model_entity_id,child.variant_kind,child.product_code,
                parent.variant_kind AS parent_kind
           FROM model_variants child
           LEFT JOIN model_variants parent ON parent.id=child.parent_variant_id
           WHERE child.model_entity_id IN (?,?)
           ORDER BY child.model_entity_id,child.product_code`,
      TARGETS.map((target) => target.id),
    );
    const productCodes = new Set(
      variants.map((row) => String(row.product_code)),
    );
    for (const productCode of [
      ...PHASE595_DEMO_PRICED_SKUS,
      ...PHASE595_GLOSSY_PRICED_SKUS,
    ]) {
      assert.ok(productCodes.has(productCode));
    }
    for (const productCode of [
      ...PHASE595_DEMO_UNPRICED_CODES,
      ...PHASE595_GLOSSY_HIDDEN_CODES,
    ]) {
      assert.equal(productCodes.has(productCode), false);
    }
    assert.ok(productCodes.has("PP3401 / 608"));
    assert.ok(productCodes.has("PP3901 / 611"));
    assert.ok(productCodes.has("PP4001 / 602"));
    assert.equal(
      variants.filter(
        (row) =>
          row.model_entity_id === PHASE595_IDS.demoMetal &&
          row.variant_kind === "market_sku",
      ).length,
      31,
    );
    assert.equal(
      variants.filter(
        (row) =>
          row.model_entity_id === PHASE595_IDS.glossy &&
          row.variant_kind === "market_sku",
      ).length,
      5,
    );
    assert.equal(
      variants
        .filter((row) => row.variant_kind === "market_sku")
        .every((row) => row.parent_kind === "edition_group"),
      true,
    );

    const specs = await rows(
      client,
      `SELECT entity_id,series_name,nib,fill_system,material,dimensions,weight,status
           FROM model_specs WHERE entity_id IN (?,?) ORDER BY entity_id`,
      TARGETS.map((target) => target.id),
    );
    assert.equal(specs.length, 2);
    const byId = new Map(specs.map((spec) => [String(spec.entity_id), spec]));
    const demoSpec = byId.get(PHASE595_IDS.demoMetal);
    assert.match(String(demoSpec?.series_name), /PP3401\/608.*PP3901\/611/);
    assert.match(String(demoSpec?.nib), /palladium-plated.*black.*31/i);
    assert.match(
      String(demoSpec?.fill_system),
      /Cartridge\/converter.*Magnetic/i,
    );
    assert.match(
      String(demoSpec?.material),
      /Transparent UltraResin.*visible/i,
    );
    assert.match(String(demoSpec?.dimensions), /148 mm.*14\.2 mm/i);
    assert.match(String(demoSpec?.weight), /publish no product weight/i);
    assert.match(
      String(demoSpec?.status),
      /31 pricing-backed.*five.*unpriced/i,
    );

    const glossySpec = byId.get(PHASE595_IDS.glossy);
    assert.match(String(glossySpec?.series_name), /PP4001\/602/);
    assert.match(String(glossySpec?.nib), /palladium-plated.*EF\/F\/M.*five/i);
    assert.match(
      String(glossySpec?.fill_system),
      /Cartridge\/converter.*Magnetic/i,
    );
    assert.match(String(glossySpec?.material), /Lapis Blue 406.*Nero 056/i);
    assert.match(String(glossySpec?.dimensions), /148 mm.*14\.2 mm/i);
    assert.match(String(glossySpec?.weight), /publishes no product weight/i);
    assert.match(String(glossySpec?.status), /five pricing-backed.*sixteen/i);

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
        entity_id: PHASE595_IDS.demoMetal,
        field_key: "model_identity",
        status: "resolved",
        member_count: 2,
      },
      {
        entity_id: PHASE595_IDS.demoMetal,
        field_key: "variant_availability",
        status: "resolved",
        member_count: 3,
      },
      {
        entity_id: PHASE595_IDS.glossy,
        field_key: "colour_scope",
        status: "resolved",
        member_count: 2,
      },
      {
        entity_id: PHASE595_IDS.glossy,
        field_key: "nib",
        status: "resolved",
        member_count: 2,
      },
      {
        entity_id: PHASE595_IDS.glossy,
        field_key: "variant_availability",
        status: "resolved",
        member_count: 2,
      },
    ]);

    const rejected = await rows(
      client,
      `SELECT spec.entity_id,evidence.field_key,source.url,
                evidence.review_status,evidence.evidence_locator AS locator
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
          row.entity_id === PHASE595_IDS.demoMetal &&
          row.field_key === "status" &&
          /five complete codes/.test(String(row.locator)),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE595_IDS.demoMetal &&
          row.field_key === "weight" &&
          /30 g.*17\.8 g/.test(String(row.locator)),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE595_IDS.glossy &&
          row.field_key === "nib" &&
          String(row.url).includes("hamiltonpens.com") &&
          /black-plated/.test(String(row.locator)),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE595_IDS.glossy &&
          row.field_key === "status" &&
          /16 complete codes/.test(String(row.locator)),
      ),
    );

    const brand = (
      await rows(client, "SELECT body_md FROM public_entities WHERE id=?", [
        PHASE595_PINEIDER_BRAND_ID,
      ])
    )[0];
    const brandBody = String(brand?.body_md ?? "");
    for (const canonicalName of BRAND_MODEL_NAMES) {
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
          [PHASE595_PINEIDER_BRAND_ID],
        )
      )[0]?.n,
    );
    assert.equal(brandPensAfter, 16);
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

    const replay = await applyPhase595PineiderAvatarDemoGlossyContent(
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
