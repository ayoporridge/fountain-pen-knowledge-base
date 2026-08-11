import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase597Options,
  applyPhase597NahvalurKeyWestTriadPenOfYearContent,
} from "../../scripts/apply-phase597-nahvalur-key-west-triad-pen-of-year-content";
import {
  PHASE597_HORSE_UNAVAILABLE_CODES,
  PHASE597_IDS,
  PHASE597_KEY_WEST_UNAVAILABLE_CODES,
  PHASE597_NAHVALUR_BRAND_ID,
  PHASE597_SLUGS,
  PHASE597_TRIAD_CURRENT_SKUS,
  PHASE597_TRIAD_EXCLUDED_ROLLERBALL_CODES,
  phase597NahvalurPacks,
} from "../../scripts/data/phase597-nahvalur-key-west-triad-pen-of-year";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");
const SOURCE = process.env.FPKG_PHASE597_SOURCE_DATABASE
  ? fs.realpathSync.native(process.env.FPKG_PHASE597_SOURCE_DATABASE)
  : REAL;
const EXPECTED_SOURCE_SHA256 =
  "81bf7975b41e9820b86546ac9406bf82b04eaadcf6761e6041241c7ece4dc5b3";

const TARGETS = [
  {
    id: PHASE597_IDS.keyWest,
    slug: PHASE597_SLUGS.keyWest,
    name: "Nahvalur Key West Fountain Pen",
    markers: ["02030011", "Lamy LZ28", "25.5 g", "八个"],
  },
  {
    id: PHASE597_IDS.triad,
    slug: PHASE597_SLUGS.triad,
    name: "Nahvalur Triad Fountain Pen",
    markers: ["10130011", "RollerBall", "No.5", "15 g"],
  },
  {
    id: PHASE597_IDS.tiger2022,
    slug: PHASE597_SLUGS.tiger2022,
    name: "Nahvalur Pen of the Year: Tiger 2022 Fountain Pen",
    markers: ["222", "14K", "三枚舷窗", "钢尖"],
  },
  {
    id: PHASE597_IDS.rabbit2023,
    slug: PHASE597_SLUGS.rabbit2023,
    name: "Nahvalur Pen of the Year: Rabbit 2023 Fountain Pen",
    markers: ["223", "Brilliant Bunny", "14K", "珠光白"],
  },
  {
    id: PHASE597_IDS.dragon2024,
    slug: PHASE597_SLUGS.dragon2024,
    name: "Nahvalur Pen of the Year: Dragon 2024 Fountain Pen",
    markers: ["224", "03080041", "不可后插", "36.85 g"],
  },
  {
    id: PHASE597_IDS.snake2025,
    slug: PHASE597_SLUGS.snake2025,
    name: "Nahvalur Pen of the Year: Snake 2025 Fountain Pen",
    markers: ["888", "28.35 g", "sterling-silver", "绿色石饰"],
  },
  {
    id: PHASE597_IDS.horse2026,
    slug: PHASE597_SLUGS.horse2026,
    name: "Nahvalur Pen of the Year: Horse 2026 Fountain Pen",
    markers: ["999", "03080060", "31 g", "bronze"],
  },
] as const;

const BRAND_MODEL_NAMES = [
  "Nahvalur Original Fountain Pen",
  "Nahvalur Original Plus",
  "Nahvalur Schuylkill",
  "Nahvalur Nautilus（原 Narwhal）",
  "Nahvalur Horizon Fountain Pen",
  "Nahvalur Voyage Fountain Pen",
  "Nahvalur Eclipse Fountain Pen",
  "Nahvalur Key West Fountain Pen",
  "Nahvalur Triad Fountain Pen",
  "Nahvalur Pen of the Year: Tiger 2022 Fountain Pen",
  "Nahvalur Pen of the Year: Rabbit 2023 Fountain Pen",
  "Nahvalur Pen of the Year: Dragon 2024 Fountain Pen",
  "Nahvalur Pen of the Year: Snake 2025 Fountain Pen",
  "Nahvalur Pen of the Year: Horse 2026 Fountain Pen",
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
): ApplyPhase597Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase597-nahvalur-key-west-triad-pen-of-year-test",
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
  const owned = createOwnedCopy(`fpkg-phase597-${label}-`, sourceSnapshot);
  const client = createClient({ url: `file:${owned.databasePath}` });
  try {
    await migrateDatabase(client);
    await mutate(client);
    await assert.rejects(
      applyPhase597NahvalurKeyWestTriadPenOfYearContent(
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
         (SELECT count(*)
            FROM public_entity_readiness readiness
            JOIN public_entities public ON public.id=readiness.entity_id
           WHERE readiness.contract_version=3
             AND readiness.publishable=1
             AND readiness.blocker_count=0) AS ready_count`,
    )
  )[0];
  return {
    publicCount: Number(result?.public_count),
    readyCount: Number(result?.ready_count),
  };
}

function triadCodes(
  values: ReadonlyArray<readonly [string, string, string, string, string]>,
): string[] {
  return values.map(([, , , , productCode]) => productCode);
}

test("Phase 597 publishes canonical Nahvalur Key West, Triad and five Pen of the Year editions on an owned checkpoint", {
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
          PHASE597_IDS.keyWest,
          "phase597-wrong-key-west-id",
          "Phase 597 wrong Key West identity",
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
          "phase597-slug-collision",
          PHASE597_SLUGS.triad,
          "Phase 597 Triad slug collision",
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
          "phase597-name-collision",
          "phase597-name-collision",
          TARGETS[4].name,
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
          "phase597-alias-collision",
          PHASE597_NAHVALUR_BRAND_ID,
          "Nahvalur Year of the Horse 2026",
        ],
      });
    },
  );

  const owned = createOwnedCopy(
    "fpkg-phase597-nahvalur-key-west-triad-pen-of-year-",
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
      phase597NahvalurPacks.map((pack) => pack.entityId),
      [
        PHASE597_NAHVALUR_BRAND_ID,
        PHASE597_IDS.keyWest,
        PHASE597_IDS.triad,
        PHASE597_IDS.tiger2022,
        PHASE597_IDS.rabbit2023,
        PHASE597_IDS.dragon2024,
        PHASE597_IDS.snake2025,
        PHASE597_IDS.horse2026,
      ],
    );
    const modelPacks = phase597NahvalurPacks.filter(
      (pack) => pack.expectedType === "pen",
    );
    assert.equal(modelPacks.length, 7);
    assert.equal(new Set(modelPacks.map((pack) => pack.entityId)).size, 7);

    for (const pack of modelPacks) {
      const markdown = fs.readFileSync(
        path.join(ROOT, pack.markdownFile),
        "utf8",
      );
      assert.ok(Array.from(markdown).length >= 2_500);
      assert.match(markdown, /## summary/);
      assert.match(markdown, /## model_specs/);
      assert.match(markdown, /## body_md/);
      assert.match(markdown, /## 图片说明/);
      assert.match(markdown, /## 来源/);
      assert.match(markdown, /## (?:选购|怎么选)/);
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
        (item) => item.usageStatus === "primary",
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
        pack.media.find((item) => item.usageStatus === "primary")?.localPath,
    );
    assert.equal(new Set(primaryPaths).size, 7);
    assert.equal(
      new Set(
        primaryPaths.map((localPath) =>
          sha256(
            path.join(ROOT, "public", String(localPath).replace(/^\//, "")),
          ),
        ),
      ).size,
      7,
    );

    const byId = new Map(
      modelPacks.map((pack) => [pack.entityId, pack] as const),
    );
    const currentCodes = triadCodes(PHASE597_TRIAD_CURRENT_SKUS);
    for (const productCode of currentCodes) {
      assert.equal(
        modelPacks.some((pack) =>
          pack.variants?.some((variant) => variant.productCode === productCode),
        ),
        true,
      );
    }
    for (const productCode of [
      ...PHASE597_KEY_WEST_UNAVAILABLE_CODES,
      ...PHASE597_TRIAD_EXCLUDED_ROLLERBALL_CODES,
      ...PHASE597_HORSE_UNAVAILABLE_CODES,
      "03080041",
    ]) {
      assert.equal(
        modelPacks.some((pack) =>
          pack.variants?.some((variant) => variant.productCode === productCode),
        ),
        false,
      );
    }
    assert.equal(
      byId
        .get(PHASE597_IDS.keyWest)
        ?.variants?.filter((variant) => variant.variantKind === "market_sku")
        .length,
      0,
    );
    assert.equal(
      byId
        .get(PHASE597_IDS.keyWest)
        ?.variants?.filter((variant) => variant.variantKind === "edition_group")
        .length,
      2,
    );
    assert.equal(
      byId
        .get(PHASE597_IDS.triad)
        ?.variants?.filter((variant) => variant.variantKind === "market_sku")
        .length,
      16,
    );
    assert.equal(
      byId
        .get(PHASE597_IDS.triad)
        ?.variants?.filter((variant) => variant.variantKind === "edition_group")
        .length,
      8,
    );
    for (const annualId of [
      PHASE597_IDS.tiger2022,
      PHASE597_IDS.rabbit2023,
      PHASE597_IDS.dragon2024,
      PHASE597_IDS.snake2025,
      PHASE597_IDS.horse2026,
    ]) {
      assert.equal(
        byId
          .get(annualId)
          ?.variants?.filter(
            (variant) => variant.variantKind === "edition_group",
          ).length,
        1,
      );
      assert.equal(
        byId
          .get(annualId)
          ?.variants?.filter((variant) => variant.variantKind === "market_sku")
          .length,
        0,
      );
    }

    const brandMarkdown = fs.readFileSync(
      path.join(ROOT, phase597NahvalurPacks[0]?.markdownFile ?? ""),
      "utf8",
    );
    assert.ok(Array.from(brandMarkdown).length >= 2_500);
    for (const canonicalName of BRAND_MODEL_NAMES) {
      assert.ok(brandMarkdown.includes(`[[${canonicalName}]]`));
    }

    const beforeTargets = await rows(
      client,
      `SELECT id FROM entities WHERE id IN (${TARGETS.map(() => "?").join(",")})`,
      TARGETS.map((target) => target.id),
    );
    const missingBefore =
      TARGETS.length - new Set(beforeTargets.map((row) => String(row.id))).size;
    assert.equal(missingBefore, 7);

    const brandPensBeforeRows = await rows(
      client,
      `SELECT DISTINCT pen.id
         FROM public_entities pen
         JOIN entity_links maker
           ON maker.source_id=pen.id AND maker.link_type='made_by'
         WHERE pen.type='pen' AND maker.target_id=?
         ORDER BY pen.id`,
      [PHASE597_NAHVALUR_BRAND_ID],
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
      const hashBefore = sha256(owned.databasePath);
      await assert.rejects(
        applyPhase597NahvalurKeyWestTriadPenOfYearContent(client, {
          ...applyOptions,
          env: {
            ...applyOptions.env,
            [envKey]: envValue,
          } as NodeJS.ProcessEnv,
        }),
        /inherited remote database selection/,
      );
      assert.equal(sha256(owned.databasePath), hashBefore);
    }

    const first = await applyPhase597NahvalurKeyWestTriadPenOfYearContent(
      client,
      applyOptions,
    );
    assert.deepEqual(
      first.entities.map((entity) => entity.entityId),
      phase597NahvalurPacks.map((pack) => pack.entityId),
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
      assert.match(String(state?.source), /^curated-content:phase597-/);
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
          PHASE597_NAHVALUR_BRAND_ID,
          target.id,
          PHASE597_NAHVALUR_BRAND_ID,
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

    const variants = await rows(
      client,
      `SELECT child.model_entity_id,child.variant_kind,child.product_code,
                parent.variant_kind AS parent_kind
         FROM model_variants child
         LEFT JOIN model_variants parent ON parent.id=child.parent_variant_id
         WHERE child.model_entity_id IN (${TARGETS.map(() => "?").join(",")})
         ORDER BY child.model_entity_id,child.product_code`,
      TARGETS.map((target) => target.id),
    );
    const persistedCodes = new Set(
      variants.map((row) => String(row.product_code)),
    );
    for (const productCode of currentCodes) {
      assert.ok(persistedCodes.has(productCode));
    }
    for (const productCode of [
      ...PHASE597_KEY_WEST_UNAVAILABLE_CODES,
      ...PHASE597_TRIAD_EXCLUDED_ROLLERBALL_CODES,
      ...PHASE597_HORSE_UNAVAILABLE_CODES,
      "03080041",
    ]) {
      assert.equal(persistedCodes.has(productCode), false);
    }
    assert.equal(
      variants.filter((row) => row.variant_kind === "edition_group").length,
      15,
    );
    assert.equal(
      variants.filter((row) => row.variant_kind === "market_sku").length,
      16,
    );
    assert.equal(
      variants
        .filter((row) => row.variant_kind === "market_sku")
        .every((row) => row.parent_kind === "edition_group"),
      true,
    );

    const specs = await rows(
      client,
      `SELECT entity_id,series_name,release_year,nib,fill_system,material,
                dimensions,weight,status
         FROM model_specs
         WHERE entity_id IN (${TARGETS.map(() => "?").join(",")})
         ORDER BY entity_id`,
      TARGETS.map((target) => target.id),
    );
    assert.equal(specs.length, 7);
    const specById = new Map(
      specs.map((spec) => [String(spec.entity_id), spec]),
    );
    assert.match(
      String(specById.get(PHASE597_IDS.keyWest)?.fill_system),
      /cartridge\/converter.*Lamy LZ28/i,
    );
    assert.match(
      String(specById.get(PHASE597_IDS.triad)?.status),
      /16 available.*eight.*RollerBall/i,
    );
    assert.match(
      String(specById.get(PHASE597_IDS.tiger2022)?.nib),
      /stainless steel.*14K.*sample/i,
    );
    assert.match(
      String(specById.get(PHASE597_IDS.rabbit2023)?.material),
      /pearl white.*rose-gold/i,
    );
    assert.match(
      String(specById.get(PHASE597_IDS.dragon2024)?.dimensions),
      /149 mm.*133 mm.*cannot post.*13 mm.*10–11\.5 mm/i,
    );
    assert.match(
      String(specById.get(PHASE597_IDS.snake2025)?.weight),
      /36\.85 g.*28\.35 g.*rejected/i,
    );
    assert.match(
      String(specById.get(PHASE597_IDS.horse2026)?.status),
      /all six.*unavailable.*999/i,
    );

    const conflicts = await rows(
      client,
      `SELECT entity_id,field_key,status,count(member.id) AS member_count
         FROM fact_conflicts conflict
         LEFT JOIN fact_conflict_members member ON member.conflict_id=conflict.id
         WHERE entity_id IN (${TARGETS.map(() => "?").join(",")})
         GROUP BY entity_id,field_key,status
         ORDER BY entity_id,field_key`,
      TARGETS.map((target) => target.id),
    );
    assert.equal(conflicts.length, 10);
    assert.ok(
      conflicts.some(
        (row) =>
          row.entity_id === PHASE597_IDS.keyWest &&
          row.field_key === "variant_availability" &&
          row.status === "resolved" &&
          Number(row.member_count) === 2,
      ),
    );
    assert.ok(
      conflicts.some(
        (row) =>
          row.entity_id === PHASE597_IDS.triad &&
          row.field_key === "instrument_type" &&
          Number(row.member_count) === 2,
      ),
    );
    assert.ok(
      conflicts.some(
        (row) =>
          row.entity_id === PHASE597_IDS.tiger2022 &&
          row.field_key === "nib" &&
          Number(row.member_count) === 2,
      ),
    );
    assert.ok(
      conflicts.some(
        (row) =>
          row.entity_id === PHASE597_IDS.rabbit2023 &&
          row.field_key === "model_identity" &&
          Number(row.member_count) === 2,
      ),
    );
    assert.ok(
      conflicts.some(
        (row) =>
          row.entity_id === PHASE597_IDS.dragon2024 &&
          row.field_key === "product_code" &&
          Number(row.member_count) === 2,
      ),
    );
    assert.ok(
      conflicts.some(
        (row) =>
          row.entity_id === PHASE597_IDS.snake2025 &&
          row.field_key === "weight" &&
          Number(row.member_count) === 2,
      ),
    );
    for (const fieldKey of ["nib", "material", "weight"] as const) {
      assert.ok(
        conflicts.some(
          (row) =>
            row.entity_id === PHASE597_IDS.horse2026 &&
            row.field_key === fieldKey &&
            Number(row.member_count) === 2,
        ),
      );
    }

    const rejected = await rows(
      client,
      `SELECT spec.entity_id,evidence.field_key,source.url,
                evidence.review_status,evidence.evidence_locator AS locator
         FROM spec_field_evidence evidence
         JOIN model_specs spec ON spec.id=evidence.model_spec_id
         JOIN citations citation ON citation.id=evidence.citation_id
         JOIN source_items source ON source.id=citation.source_item_id
         WHERE spec.entity_id IN (${TARGETS.map(() => "?").join(",")})
           AND evidence.review_status='rejected'
         ORDER BY spec.entity_id,evidence.field_key,source.url`,
      TARGETS.map((target) => target.id),
    );
    assert.ok(rejected.length >= 12);
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE597_IDS.keyWest &&
          row.field_key === "status" &&
          /available=false/.test(String(row.locator)),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE597_IDS.triad &&
          row.field_key === "status" &&
          /RollerBall.*fail fountain-pen/i.test(String(row.locator)),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE597_IDS.tiger2022 &&
          row.field_key === "nib" &&
          /14K sample/i.test(String(row.locator)),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE597_IDS.rabbit2023 &&
          row.field_key === "series_name" &&
          /Brilliant Bunny.*separate/i.test(String(row.locator)),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE597_IDS.dragon2024 &&
          row.field_key === "status" &&
          /03080042–47.*absent/i.test(String(row.locator)),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE597_IDS.snake2025 &&
          row.field_key === "weight" &&
          /28\.35 g.*conflicts/i.test(String(row.locator)),
      ),
    );
    assert.ok(
      rejected.some(
        (row) =>
          row.entity_id === PHASE597_IDS.horse2026 &&
          row.field_key === "nib" &&
          /no gold material branch/i.test(String(row.locator)),
      ),
    );

    const brand = (
      await rows(client, "SELECT body_md FROM public_entities WHERE id=?", [
        PHASE597_NAHVALUR_BRAND_ID,
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
          [PHASE597_NAHVALUR_BRAND_ID],
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

    const replay = await applyPhase597NahvalurKeyWestTriadPenOfYearContent(
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
