import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase594Options,
  applyPhase594PineiderAvatarUrEgosphereContent,
} from "../../scripts/apply-phase594-pineider-avatar-ur-egosphere-content";
import {
  PHASE594_IDS,
  PHASE594_PINEIDER_BRAND_ID,
  PHASE594_SLUGS,
  phase594PineiderPacks,
} from "../../scripts/data/phase594-pineider-avatar-ur-egosphere";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const SOURCE = process.env.FPKG_PHASE594_SOURCE_DATABASE
  ? fs.realpathSync.native(process.env.FPKG_PHASE594_SOURCE_DATABASE)
  : REAL;
const EXPECTED_SOURCE_SHA256 =
  "88a61dfce0b208cba2a871d1259106291078f91c641335cddf51ee9897565c08";

const AVATAR_CHILD_SKUS = [
  "SPP2101E039",
  "SPP2101F039",
  "SPP2101M039",
  "SSAEXPP2101422",
  "SSAFXPP2101422",
  "SSAMXPP2101422",
  "SSAEXPP2101423",
  "SSAFXPP2101423",
  "SSAMXPP2101423",
  "SSAEXPP2101420",
  "SSAFXPP2101420",
  "SSAMXPP2101420",
  "SSAEXPP2101421",
  "SSAFXPP2101421",
  "SSAMXPP2101421",
  "SSAEXPP2101325",
  "SSAFXPP2101325",
  "SSAMXPP2101325",
  "SSAEXPP2101419",
  "SSAFXPP2101419",
  "SSAMXPP2101419",
  "SSAEXPP2101424",
  "SSAFXPP2101424",
  "SSAMXPP2101424",
] as const;

const TARGETS = [
  {
    id: PHASE594_IDS.avatarUr,
    slug: PHASE594_SLUGS.avatarUr,
    name: "Pineider Avatar UR",
    markers: [
      "PP2101／600",
      "SPP2101E039",
      "SSAEXPP2101424",
      "148 mm",
      "UltraResin",
      "Magnetic Lock",
      "381／597／681",
    ],
  },
  {
    id: PHASE594_IDS.egosphere,
    slug: PHASE594_SLUGS.egosphere,
    name: "Pineider Egosphere Fountain Pen",
    markers: [
      "S000S008445056／1056",
      "S000S088831060／1058",
      "Egopshere",
      "out of stock",
      "925 sterling silver",
      "1999",
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
): ApplyPhase594Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase594-pineider-avatar-ur-egosphere-test",
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
  const owned = createOwnedCopy(`fpkg-phase594-${label}-`, sourceSnapshot);
  const client = createClient({ url: `file:${owned.databasePath}` });
  try {
    await migrateDatabase(client);
    await mutate(client);
    await assert.rejects(
      applyPhase594PineiderAvatarUrEgosphereContent(
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

test("Phase 594 refreshes exact Pineider Avatar UR and publishes canonical Egosphere on an owned checkpoint", {
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
          PHASE594_IDS.egosphere,
          "phase594-wrong-egosphere-id",
          "Phase 594 wrong Egosphere identity",
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
          "phase594-slug-collision",
          PHASE594_SLUGS.egosphere,
          "Phase 594 slug collision",
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
          "phase594-name-collision",
          "phase594-name-collision",
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
          "phase594-alias-collision",
          PHASE594_PINEIDER_BRAND_ID,
          "Pineider Egopshere Fountain Pen",
        ],
      });
    },
  );

  const owned = createOwnedCopy(
    "fpkg-phase594-pineider-avatar-ur-egosphere-",
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
      phase594PineiderPacks.map((pack) => pack.entityId),
      [
        PHASE594_PINEIDER_BRAND_ID,
        PHASE594_IDS.avatarUr,
        PHASE594_IDS.egosphere,
      ],
    );
    const modelPacks = phase594PineiderPacks.filter(
      (pack) => pack.expectedType === "pen",
    );
    assert.equal(modelPacks.length, 2);

    for (const pack of modelPacks) {
      const markdown = fs.readFileSync(
        path.join(ROOT, pack.markdownFile),
        "utf8",
      );
      assert.ok(Array.from(markdown).length >= 2_000);
      assert.match(markdown, /## body_md/);
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
      if (pack.entityId === PHASE594_IDS.egosphere) {
        assert.match(svg, /本站原创示意图/);
        assert.match(svg, /非产品照片/);
      } else {
        assert.match(svg, /site-original/i);
        assert.match(svg, /non-photo/i);
      }
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

    const brandMarkdown = fs.readFileSync(
      path.join(ROOT, phase594PineiderPacks[0]?.markdownFile ?? ""),
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
      "Pineider Alba Classic Fountain Pen",
      "Pineider Alba Mini Fountain Pen",
      "Pineider Avatar Anniversary Fountain Pen",
      "Pineider Avatar UR Mini Fountain Pen",
      "Pineider Egosphere Fountain Pen",
    ]) {
      assert.ok(brandMarkdown.includes(`[[${canonicalName}]]`));
    }

    const avatarPack = modelPacks.find(
      (pack) => pack.entityId === PHASE594_IDS.avatarUr,
    );
    const egospherePack = modelPacks.find(
      (pack) => pack.entityId === PHASE594_IDS.egosphere,
    );
    assert.ok(avatarPack);
    assert.ok(egospherePack);
    for (const sku of AVATAR_CHILD_SKUS) {
      assert.ok(
        avatarPack.variants?.some((variant) => variant.productCode === sku),
      );
    }
    for (const code of ["S000S008445056/1056", "S000S088831060/1058"]) {
      assert.ok(
        egospherePack.variants?.some((variant) => variant.productCode === code),
      );
    }
    assert.equal(
      egospherePack.aliases.some(
        ({ alias }) => alias === "Pineider Egopshere Fountain Pen",
      ),
      true,
    );

    const beforeTargets = await rows(
      client,
      "SELECT id FROM entities WHERE id IN (?,?)",
      TARGETS.map((target) => target.id),
    );
    const missingBefore = TARGETS.length - beforeTargets.length;
    assert.equal(missingBefore, 1);
    const avatarBefore = (
      await rows(client, "SELECT id,slug,name FROM entities WHERE id=?", [
        PHASE594_IDS.avatarUr,
      ])
    )[0];
    assert.deepEqual(avatarBefore, {
      id: PHASE594_IDS.avatarUr,
      slug: PHASE594_SLUGS.avatarUr,
      name: "Pineider Avatar UR",
    });

    const brandPensBeforeRows = await rows(
      client,
      `SELECT DISTINCT pen.id
         FROM public_entities pen
         JOIN entity_links maker
           ON maker.source_id=pen.id AND maker.link_type='made_by'
         WHERE pen.type='pen' AND maker.target_id=?
         ORDER BY pen.id`,
      [PHASE594_PINEIDER_BRAND_ID],
    );
    assert.equal(brandPensBeforeRows.length, 13);
    const protectedModelDigests = new Map<string, string>();
    for (const row of brandPensBeforeRows) {
      const id = String(row.id);
      if (id !== PHASE594_IDS.avatarUr) {
        protectedModelDigests.set(id, await entityDigest(client, id));
      }
    }
    assert.equal(protectedModelDigests.size, 12);
    const countsBefore = await publicationCounts(client);

    for (const [envKey, envValue] of [
      ["TURSO_DATABASE_URL", "libsql://remote.invalid"],
      ["TURSO_AUTH_TOKEN", "forged-token"],
      ["FPKG_DATABASE_URL", "file:/unauthorized.db"],
    ] as const) {
      const ownedHashBeforeRemoteRejection = sha256(owned.databasePath);
      await assert.rejects(
        applyPhase594PineiderAvatarUrEgosphereContent(client, {
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

    const first = await applyPhase594PineiderAvatarUrEgosphereContent(
      client,
      applyOptions,
    );
    assert.deepEqual(
      first.entities.map((entity) => entity.entityId),
      phase594PineiderPacks.map((pack) => pack.entityId),
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
      assert.match(String(state?.source), /^curated-content:phase594-/);
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

      const topology = (
        await rows(
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
            PHASE594_PINEIDER_BRAND_ID,
            target.id,
            PHASE594_PINEIDER_BRAND_ID,
            target.id,
            target.id,
          ],
        )
      )[0];
      assert.deepEqual(
        [
          Number(topology?.maker),
          Number(topology?.reverse),
          Number(topology?.specs),
          Number(topology?.primary_media),
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

    const variants = await rows(
      client,
      `SELECT child.model_entity_id,child.variant_kind,child.parent_variant_id,
                child.product_code,parent.variant_kind AS parent_kind
         FROM model_variants child
         LEFT JOIN model_variants parent ON parent.id=child.parent_variant_id
         WHERE child.model_entity_id IN (?,?)
         ORDER BY child.model_entity_id,child.product_code`,
      TARGETS.map((target) => target.id),
    );
    const productCodes = new Set(
      variants.map((variant) => String(variant.product_code)),
    );
    for (const code of [
      "PP2101/600",
      ...AVATAR_CHILD_SKUS,
      "S000S008445056/1056",
      "S000S088831060/1058",
    ]) {
      assert.ok(productCodes.has(code));
    }
    for (const hiddenSuffix of ["381", "597", "681"]) {
      assert.equal(
        variants.some((variant) =>
          String(variant.product_code).endsWith(hiddenSuffix),
        ),
        false,
      );
    }
    for (const child of variants.filter(
      (variant) => variant.variant_kind === "market_sku",
    )) {
      assert.ok(child.parent_variant_id);
      assert.equal(child.parent_kind, "edition_group");
    }

    const specs = await rows(
      client,
      `SELECT entity_id,series_name,origin_country,nib,fill_system,
                material,dimensions,weight,status
         FROM model_specs WHERE entity_id IN (?,?) ORDER BY entity_id`,
      TARGETS.map((target) => target.id),
    );
    assert.equal(specs.length, 2);
    const byId = new Map(specs.map((spec) => [String(spec.entity_id), spec]));
    const avatarSpec = byId.get(PHASE594_IDS.avatarUr);
    assert.equal(avatarSpec?.series_name, "Avatar UR");
    assert.equal(avatarSpec?.origin_country, "Italy");
    assert.match(String(avatarSpec?.nib), /steel.*Extra Fine.*Medium/i);
    assert.match(String(avatarSpec?.fill_system), /Cartridge.*converter/i);
    assert.match(String(avatarSpec?.material), /UltraResin.*Magnetic Lock/i);
    assert.match(String(avatarSpec?.dimensions), /148 mm.*14\.2 mm/);
    assert.match(String(avatarSpec?.weight), /30 g.*sample/i);
    assert.match(String(avatarSpec?.status), /24 selector-backed/i);

    const egosphereSpec = byId.get(PHASE594_IDS.egosphere);
    assert.equal(egosphereSpec?.series_name, "Egosphere");
    assert.equal(egosphereSpec?.origin_country, "Italy");
    assert.match(String(egosphereSpec?.nib), /do not disclose.*historic/i);
    assert.match(
      String(egosphereSpec?.fill_system),
      /do not disclose.*historic piston/i,
    );
    assert.match(String(egosphereSpec?.material), /925 sterling.*jasper/i);
    assert.match(String(egosphereSpec?.dimensions), /do not disclose/i);
    assert.match(String(egosphereSpec?.weight), /do not disclose/i);
    assert.match(String(egosphereSpec?.status), /out of stock.*unknown/i);

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
        entity_id: PHASE594_IDS.avatarUr,
        field_key: "dimensions",
        status: "resolved",
        member_count: 2,
      },
      {
        entity_id: PHASE594_IDS.avatarUr,
        field_key: "status",
        status: "resolved",
        member_count: 2,
      },
      {
        entity_id: PHASE594_IDS.egosphere,
        field_key: "fill_system",
        status: "resolved",
        member_count: 2,
      },
      {
        entity_id: PHASE594_IDS.egosphere,
        field_key: "nib",
        status: "resolved",
        member_count: 2,
      },
    ]);

    const rejected = await rows(
      client,
      `SELECT spec.entity_id,evidence.field_key,source.url,
                evidence.evidence_locator AS locator
         FROM spec_field_evidence evidence
         JOIN model_specs spec ON spec.id=evidence.model_spec_id
         JOIN citations citation ON citation.id=evidence.citation_id
         JOIN source_items source ON source.id=citation.source_item_id
         WHERE spec.entity_id IN (?,?) AND evidence.review_status='rejected'
         ORDER BY spec.entity_id,evidence.field_key,source.url,evidence.evidence_locator`,
      TARGETS.map((target) => target.id),
    );
    assert.equal(rejected.length, 7);
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE594_IDS.avatarUr &&
          row.field_key === "status" &&
          /381, 597 and 681/.test(String(row.locator)),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE594_IDS.egosphere &&
          row.field_key === "nib" &&
          /18K medium/.test(String(row.locator)),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE594_IDS.egosphere &&
          row.field_key === "fill_system" &&
          /piston/.test(String(row.locator)),
      ),
    );

    const brand = (
      await rows(client, "SELECT body_md FROM public_entities WHERE id=?", [
        PHASE594_PINEIDER_BRAND_ID,
      ])
    )[0];
    const brandBody = String(brand?.body_md ?? "");
    for (const target of TARGETS) {
      assert.ok(brandBody.includes(`[[${target.name}]]`));
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
          [PHASE594_PINEIDER_BRAND_ID],
        )
      )[0]?.n,
    );
    assert.equal(brandPensAfter, 14);
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

    const replay = await applyPhase594PineiderAvatarUrEgosphereContent(
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
