import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase27PelikanContent } from "../../scripts/apply-phase27-pelikan-content";
import { applyPhase32PelikanP0Content } from "../../scripts/apply-phase32-pelikan-p0-content";
import {
  applyPhase35PelikanSouveranVariantsContent,
  PHASE35_M400_CANONICAL_SLUG,
  PHASE35_M400_LEGACY_SLUG,
  PHASE35_M605_CANONICAL_SLUG,
  PHASE35_M815_CANONICAL_SLUG,
  PHASE35_M815_LEGACY_SLUG,
  PHASE35_M1005_CANONICAL_SLUG,
  PHASE35_M1005_LEGACY_SLUG,
  PHASE35_RETIRED_M605_MISLABEL_ID,
  PHASE35_RETIRED_M605_MISLABEL_SLUG,
} from "../../scripts/apply-phase35-pelikan-souveran-variants-content";
import {
  PHASE35_M400_ID,
  PHASE35_M605_ID,
  PHASE35_M815_METAL_STRIPED_ID,
  PHASE35_M1005_STRESEMANN_2019_ID,
  PHASE35_PELIKAN_ID,
} from "../../scripts/data/phase35-pelikan-souveran-variants";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");

const PHASE27_M800_ID = "1UzrQA9Rrmqs";
const PHASE32_M1000_ID = "6eXuisf9KiK5";
const PHASE32_M600_ID = "MJHgkh3M-6MQ";
const PHASE32_M600_WHITE_2012_ID = "aRUJifVzWhCk";
const COLLISION_ID = "phase35-m605-slug-collision";

const MODEL_IDS = [
  PHASE35_M1005_STRESEMANN_2019_ID,
  PHASE35_M400_ID,
  PHASE35_M605_ID,
  PHASE35_M815_METAL_STRIPED_ID,
] as const;

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

async function publicationSnapshot(
  client: Client,
  entityIds: string[],
): Promise<Array<Record<string, unknown>>> {
  const placeholders = entityIds.map(() => "?").join(", ");
  const result = await client.execute({
    sql: `SELECT entity_id, status, blockers_json, content_revision
            FROM entity_publications
           WHERE entity_id IN (${placeholders})
           ORDER BY entity_id`,
    args: entityIds,
  });
  return result.rows.map((row) => ({ ...row }));
}

test("Phase 35 publishes sourced Pelikan M1005, M400, real M605 and versioned M815 on an owned sequential checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase35-pelikan-variants-")),
  );
  const databasePath = path.join(ownedRoot, "catalog.db");
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    databasePath,
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  try {
    await migrateDatabase(client);
    const baseOptions = {
      workspaceRoot: ROOT,
      reviewer: "phase35-pelikan-souveran-variants-curated-content",
      databasePath: copy.destinationPath,
      ownedRoot,
      protectedCatalogPath: REAL_CATALOG,
      protectedCatalogSnapshot: protectedSnapshot,
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: "",
      },
    } as const;

    await applyPhase27PelikanContent(client, {
      ...baseOptions,
      reviewer: "phase27-pelikan-prerequisite",
    });
    await applyPhase32PelikanP0Content(client, {
      ...baseOptions,
      reviewer: "phase32-pelikan-prerequisite",
    });

    const protectedPublishedIds = [
      PHASE27_M800_ID,
      PHASE32_M1000_ID,
      PHASE32_M600_ID,
      PHASE32_M600_WHITE_2012_ID,
    ];
    const protectedPagesBefore = await publicationSnapshot(
      client,
      protectedPublishedIds,
    );
    assert.equal(protectedPagesBefore.length, protectedPublishedIds.length);
    assert.ok(
      protectedPagesBefore.every((row) => String(row.status) === "published"),
    );

    await assert.rejects(
      applyPhase35PelikanSouveranVariantsContent(client, {
        ...baseOptions,
        env: { ...baseOptions.env, TURSO_DATABASE_URL: "libsql://remote" },
      }),
      /refuses inherited remote database selection: TURSO_DATABASE_URL/,
    );

    await client.execute({
      sql: `INSERT INTO entities (id, type, slug, name)
            VALUES (?, 'pen', ?, 'Phase 35 collision fixture')`,
      args: [COLLISION_ID, PHASE35_M605_CANONICAL_SLUG],
    });
    await assert.rejects(
      applyPhase35PelikanSouveranVariantsContent(client, baseOptions),
      /M605 canonical slug collision/,
    );
    for (const [entityId, legacySlug] of [
      [PHASE35_M1005_STRESEMANN_2019_ID, PHASE35_M1005_LEGACY_SLUG],
      [PHASE35_M400_ID, PHASE35_M400_LEGACY_SLUG],
      [PHASE35_M815_METAL_STRIPED_ID, PHASE35_M815_LEGACY_SLUG],
    ]) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entities WHERE id = ? AND slug = ?",
          [entityId, legacySlug],
        ),
        1,
      );
    }
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id = ?",
        [PHASE35_M605_ID],
      ),
      0,
    );
    await client.execute({
      sql: "DELETE FROM entity_publications WHERE entity_id = ?",
      args: [COLLISION_ID],
    });
    await client.execute({
      sql: "DELETE FROM entities WHERE id = ?",
      args: [COLLISION_ID],
    });

    const first = await applyPhase35PelikanSouveranVariantsContent(
      client,
      baseOptions,
    );
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [PHASE35_PELIKAN_ID, "published"],
        [PHASE35_M1005_STRESEMANN_2019_ID, "published"],
        [PHASE35_M400_ID, "published"],
        [PHASE35_M605_ID, "published"],
        [PHASE35_M815_METAL_STRIPED_ID, "published"],
      ],
    );

    const publicRows = await client.execute({
      sql: `SELECT id, slug, name, length(summary) AS summary_length,
                   length(body_md) AS body_length, body_md
              FROM public_entities
             WHERE id IN (?, ?, ?, ?)
             ORDER BY CASE id
               WHEN ? THEN 0 WHEN ? THEN 1 WHEN ? THEN 2 ELSE 3 END`,
      args: [...MODEL_IDS, ...MODEL_IDS.slice(0, 3)],
    });
    assert.deepEqual(
      publicRows.rows.map((row) => [
        String(row.id),
        String(row.slug),
        String(row.name),
      ]),
      [
        [
          PHASE35_M1005_STRESEMANN_2019_ID,
          PHASE35_M1005_CANONICAL_SLUG,
          "Pelikan Souverän M1005 Stresemann (2019)",
        ],
        [PHASE35_M400_ID, PHASE35_M400_CANONICAL_SLUG, "Pelikan Souverän M400"],
        [PHASE35_M605_ID, PHASE35_M605_CANONICAL_SLUG, "Pelikan Souverän M605"],
        [
          PHASE35_M815_METAL_STRIPED_ID,
          PHASE35_M815_CANONICAL_SLUG,
          "Pelikan Souverän M815 Metal Striped",
        ],
      ],
    );
    for (const row of publicRows.rows) {
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.summary_length) <= 160);
      assert.ok(Number(row.body_length) >= 2_000);
      assert.doesNotMatch(
        String(row.body_md),
        /\b(?:canonical|made_by|market_sku|slug|retired)\b|数据库|仓库/i,
      );
    }

    const bodyById = new Map(
      publicRows.rows.map((row) => [String(row.id), String(row.body_md)]),
    );
    const m1005Body = bodyById.get(PHASE35_M1005_STRESEMANN_2019_ID) ?? "";
    assert.match(m1005Body, /只讲 2019 Stresemann/);
    assert.match(
      m1005Body,
      /146 mm[\s\S]*14\.1 mm[\s\S]*34\.1 g[\s\S]*1\.35 ml/,
    );
    assert.match(m1005Body, /2019 年 6 月/);
    assert.match(
      m1005Body,
      /2011 年 M1005 Demonstrator[\s\S]*2013 年黑色 M1005/,
    );
    assert.match(m1005Body, /官方媒体资料库（MAM）/);
    assert.match(
      m1005Body,
      /EF 对应[\s\S]*810425[\s\S]*810463[\s\S]*F 对应[\s\S]*810432[\s\S]*810470[\s\S]*M 对应[\s\S]*810449[\s\S]*810487[\s\S]*B 对应[\s\S]*810456[\s\S]*810494/,
    );
    assert.match(m1005Body, /810487[\s\S]*M 尖[\s\S]*带笔盒/);

    const m400Body = bodyById.get(PHASE35_M400_ID) ?? "";
    assert.match(m400Body, /1982–1997 Old Style[\s\S]*1997 年 9 月后/);
    assert.match(m400Body, /12\.7 cm[\s\S]*14\.9 g[\s\S]*1\.3 ml/);
    assert.match(m400Body, /125 mm[\s\S]*15\.3 g[\s\S]*1\.30 ml/);
    assert.match(m400Body, /单帽环[\s\S]*握位增加一道饰环/);
    assert.match(m400Body, /印刷双雏鸟徽记[\s\S]*单雏鸟[\s\S]*拉丝金属质感/);
    assert.match(m400Body, /四道纵向鳍片[\s\S]*塑料供墨[\s\S]*横向排列/);
    assert.match(m400Body, /#500[\s\S]*M500[\s\S]*特定市场标记/);
    assert.match(m400Body, /1995–1997[\s\S]*1998–2006/);
    assert.doesNotMatch(m400Body, /涂饶/);

    const m605Body = bodyById.get(PHASE35_M605_ID) ?? "";
    for (const marker of [
      "2003 Solid Dark Blue",
      "2012 Black",
      "2012 Blue Striated",
      "2013 Marine Blue Transparent",
      "2017 White-Transparent",
      "2019 Stresemann",
      "2021 Green-White",
      "2022 Tortoiseshell-Black",
    ]) {
      assert.match(m605Body, new RegExp(marker));
    }
    assert.match(
      m605Body,
      /2012[\s\S]*M600 Tortoiseshell-White[\s\S]*不属于 M605/,
    );
    assert.match(m605Body, /平台表[\s\S]*18\.0 g/);
    assert.match(m605Body, /2022 Tortoiseshell-Black[\s\S]*16\.4 g/);
    assert.match(m605Body, /14K 铑饰金尖[\s\S]*EF、F、M、B/);
    assert.match(m605Body, /2013 年报[\s\S]*很快售罄/);
    assert.match(
      m605Body,
      /2017 White-Transparent[\s\S]*2019 Stresemann[\s\S]*2021 Green-White[\s\S]*2022 Tortoiseshell-Black[\s\S]*全镀铑/,
    );
    assert.doesNotMatch(
      m605Body,
      /2017 White-Transparent[^\n]*cellulose acetate/,
    );
    assert.match(m605Body, /压入／摩擦配合（press-fit \/ friction-fit）/);
    assert.doesNotMatch(
      m605Body,
      /限量\s*1200|除 Marine Blue 外(?:全部|均为)双色尖/,
    );
    assert.doesNotMatch(m605Body, /旧库|已经退役/);

    const m815Body = bodyById.get(PHASE35_M815_METAL_STRIPED_ID) ?? "";
    assert.match(m815Body, /2018 Black 的 38 g[\s\S]*2025 Blue 的官方 36 g/);
    assert.match(m815Body, /黄铜[\s\S]*18K\/750 全镀铑金尖[\s\S]*EF、F、M、B/);
    assert.match(m815Body, /闭帽[\s\S]*14\.1 cm[\s\S]*36 g/);
    assert.match(m815Body, /37\.1 g[\s\S]*同一款 2018 Black/);
    assert.match(m815Body, /36 g[\s\S]*37\.13 g[\s\S]*同版资料差异/);
    assert.doesNotMatch(m815Body, /共同重量[^。]*38 g|共同重量[^。]*36 g/);

    const variantCounts = await client.execute({
      sql: `SELECT model_entity_id, count(*) AS variant_count
              FROM model_variants
             WHERE model_entity_id IN (?, ?, ?, ?)
             GROUP BY model_entity_id`,
      args: [...MODEL_IDS],
    });
    assert.deepEqual(
      new Map(
        variantCounts.rows.map((row) => [
          String(row.model_entity_id),
          Number(row.variant_count),
        ]),
      ),
      new Map([
        [PHASE35_M1005_STRESEMANN_2019_ID, 5],
        [PHASE35_M400_ID, 2],
        [PHASE35_M605_ID, 8],
        [PHASE35_M815_METAL_STRIPED_ID, 2],
      ]),
    );

    const m605Variants = await client.execute({
      sql: `SELECT variant_name, release_year
              FROM model_variants
             WHERE model_entity_id = ?
             ORDER BY release_year, variant_name`,
      args: [PHASE35_M605_ID],
    });
    assert.deepEqual(
      m605Variants.rows.map((row) => [
        String(row.variant_name),
        String(row.release_year),
      ]),
      [
        ["M605 Solid Dark Blue", "2003"],
        ["M605 Black", "2012"],
        ["M605 Blue Striated", "2012"],
        ["M605 Marine Blue Transparent", "2013"],
        ["M605 White-Transparent", "2017"],
        ["M605 Stresemann / Black-Anthracite", "2019"],
        ["M605 Green-White", "2021"],
        ["M605 Tortoiseshell-Black", "2022"],
      ],
    );

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM fact_scopes scope
           JOIN model_variants variant ON variant.id = scope.variant_id
          WHERE scope.entity_id = ? AND variant.model_entity_id = ?`,
        [PHASE35_M605_ID, PHASE35_M605_ID],
      ),
      8,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM timeline_events WHERE entity_id = ? AND event_type = 'model_released'",
        [PHASE35_M605_ID],
      ),
      8,
    );

    const m605SpecEvidence = await client.execute({
      sql: `SELECT evidence.field_key, count(*) AS evidence_count
              FROM spec_field_evidence evidence
              JOIN model_specs spec ON spec.id = evidence.model_spec_id
             WHERE spec.entity_id = ?
               AND evidence.field_key IN ('nib', 'fill_system', 'dimensions', 'weight', 'status')
             GROUP BY evidence.field_key`,
      args: [PHASE35_M605_ID],
    });
    const m605EvidenceCount = new Map(
      m605SpecEvidence.rows.map((row) => [
        String(row.field_key),
        Number(row.evidence_count),
      ]),
    );
    assert.ok((m605EvidenceCount.get("nib") ?? 0) >= 2);
    assert.ok((m605EvidenceCount.get("fill_system") ?? 0) >= 2);
    assert.ok((m605EvidenceCount.get("dimensions") ?? 0) >= 2);
    assert.ok((m605EvidenceCount.get("weight") ?? 0) >= 2);
    assert.ok((m605EvidenceCount.get("status") ?? 0) >= 3);

    const m1005BoundEvidence = await client.execute({
      sql: `SELECT evidence.field_key, source.url
              FROM spec_field_evidence evidence
              JOIN model_specs spec ON spec.id = evidence.model_spec_id
              JOIN citations citation ON citation.id = evidence.citation_id
              JOIN source_items source ON source.id = citation.source_item_id
             WHERE spec.entity_id = ?
               AND evidence.field_key IN ('origin_country', 'fill_system')
             ORDER BY evidence.field_key, source.url`,
      args: [PHASE35_M1005_STRESEMANN_2019_ID],
    });
    assert.deepEqual(
      m1005BoundEvidence.rows.map((row) => [
        String(row.field_key),
        String(row.url),
      ]),
      [
        [
          "fill_system",
          "https://mam.pelikan.com/en/pelikan/media/812352/download",
        ],
        [
          "fill_system",
          "https://thepelikansperch.com/2019/01/14/pelikan-m1005-stresemann-announced/",
        ],
        [
          "origin_country",
          "https://mam.pelikan.com/en/pelikan/media/812352/download",
        ],
      ],
    );

    const m400BoundEvidence = await client.execute({
      sql: `SELECT evidence.field_key, source.url
              FROM spec_field_evidence evidence
              JOIN model_specs spec ON spec.id = evidence.model_spec_id
              JOIN citations citation ON citation.id = evidence.citation_id
              JOIN source_items source ON source.id = citation.source_item_id
             WHERE spec.entity_id = ?
               AND evidence.field_key IN ('nib', 'fill_system', 'status')
             ORDER BY evidence.field_key, source.url`,
      args: [PHASE35_M400_ID],
    });
    assert.deepEqual(
      m400BoundEvidence.rows.map((row) => [
        String(row.field_key),
        String(row.url),
      ]),
      [
        [
          "fill_system",
          "https://mam.pelikan.com/mam/en/pelikan/products/994863",
        ],
        [
          "fill_system",
          "https://www.pelikan.com/images/assets/catalogs/2025/2025_CATALOGO_FWI.pdf",
        ],
        ["nib", "https://mam.pelikan.com/mam/en/pelikan/products/994863"],
        [
          "nib",
          "https://thepelikansperch.com/2019/03/21/pelikan-400-versus-m400/",
        ],
        [
          "nib",
          "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M400-Basis/index.html",
        ],
        [
          "status",
          "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M400-Basis/index.html",
        ],
        [
          "status",
          "https://www.pelikan.com/images/assets/catalogs/2025/2025_CATALOGO_FWI.pdf",
        ],
      ],
    );

    const m605NibEvidence = await client.execute({
      sql: `SELECT source.url
              FROM spec_field_evidence evidence
              JOIN model_specs spec ON spec.id = evidence.model_spec_id
              JOIN citations citation ON citation.id = evidence.citation_id
              JOIN source_items source ON source.id = citation.source_item_id
             WHERE spec.entity_id = ? AND evidence.field_key = 'nib'
             ORDER BY source.url`,
      args: [PHASE35_M605_ID],
    });
    assert.deepEqual(
      m605NibEvidence.rows.map((row) => String(row.url)),
      [
        "https://mam.pelikan.com/en/pelikan/media/925435/download",
        "https://mam.pelikan.com/mam/en/pelikan/products/813624",
        "https://thepelikansperch.com/2017/12/31/pelikan-m605-white-transparent-review/",
        "https://thepelikansperch.com/database/fountain-pens/m6xx/m605/",
        "https://www.pelikan-passion.com/fr/lecriture/premium/souveraen/souveran-605-tortoiseshell-black.html?fwiRefId=468",
      ],
    );

    const m605StatusEvidence = await client.execute({
      sql: `SELECT scope.scope_key, source.url
              FROM spec_field_evidence evidence
              JOIN model_specs spec ON spec.id = evidence.model_spec_id
              JOIN fact_scopes scope ON scope.id = evidence.scope_id
              JOIN citations citation ON citation.id = evidence.citation_id
              JOIN source_items source ON source.id = citation.source_item_id
             WHERE spec.entity_id = ? AND evidence.field_key = 'status'
             ORDER BY scope.scope_key, source.url`,
      args: [PHASE35_M605_ID],
    });
    assert.deepEqual(
      m605StatusEvidence.rows.map((row) => [
        String(row.scope_key),
        String(row.url),
      ]),
      [
        [
          "pelikan-m605-dark-blue-2003",
          "https://thepelikansperch.com/database/fountain-pens/m6xx/m605/",
        ],
        [
          "pelikan-m605-dark-blue-2003",
          "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M600-Basis/index.html#heading_toc_j_3",
        ],
        [
          "pelikan-m605-family-platform-2003-2022",
          "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M600-Basis/index.html#heading_toc_j_3",
        ],
        [
          "pelikan-m605-stresemann-2019",
          "https://www.pelikan.com/images/assets/catalogs/2025/2025_CATALOGO_FWI.pdf",
        ],
      ],
    );

    const m605Conflicts = await client.execute({
      sql: `SELECT conflict.field_key, scope.scope_key, conflict.status
              FROM fact_conflicts conflict
              JOIN fact_scopes scope ON scope.id = conflict.scope_id
             WHERE conflict.entity_id = ?
             ORDER BY conflict.field_key, scope.scope_key`,
      args: [PHASE35_M605_ID],
    });
    assert.deepEqual(
      m605Conflicts.rows.map((row) => [
        String(row.field_key),
        String(row.scope_key),
        String(row.status),
      ]),
      [
        ["nib", "pelikan-m605-family-platform-2003-2022", "resolved"],
        ["status", "pelikan-m605-dark-blue-2003", "resolved"],
        ["weight", "pelikan-m605-family-platform-2003-2022", "resolved"],
      ],
    );

    const m605NibConflictMembers = await client.execute({
      sql: `SELECT member.asserted_value, source.url
              FROM fact_conflicts conflict
              JOIN fact_conflict_members member
                ON member.conflict_id = conflict.id
              JOIN citations citation ON citation.id = member.citation_id
              JOIN source_items source ON source.id = citation.source_item_id
             WHERE conflict.entity_id = ? AND conflict.field_key = 'nib'
             ORDER BY member.asserted_value`,
      args: [PHASE35_M605_ID],
    });
    assert.deepEqual(
      m605NibConflictMembers.rows.map((row) => [
        String(row.asserted_value),
        String(row.url),
      ]),
      [
        [
          "2017 White-Transparent: monotone rhodium-plated",
          "https://thepelikansperch.com/2017/12/31/pelikan-m605-white-transparent-review/",
        ],
        [
          "2019 Stresemann: completely rhodium-plated",
          "https://mam.pelikan.com/mam/en/pelikan/products/813624",
        ],
        [
          "2021 Green-White: fully rhodium-plated",
          "https://mam.pelikan.com/en/pelikan/media/925435/download",
        ],
        [
          "2022 Tortoiseshell-Black: rhodium-plated",
          "https://www.pelikan-passion.com/fr/lecriture/premium/souveraen/souveran-605-tortoiseshell-black.html?fwiRefId=468",
        ],
        [
          "family sentence: all except Marine Blue are bicolor",
          "https://thepelikansperch.com/database/fountain-pens/m6xx/m605/",
        ],
      ],
    );

    const m815WeightConflicts = await client.execute({
      sql: `SELECT scope.scope_key, conflict.status, member.asserted_value,
                   source.url
              FROM fact_conflicts conflict
              JOIN fact_scopes scope ON scope.id = conflict.scope_id
              JOIN fact_conflict_members member
                ON member.conflict_id = conflict.id
              JOIN citations citation ON citation.id = member.citation_id
              JOIN source_items source ON source.id = citation.source_item_id
             WHERE conflict.entity_id = ? AND conflict.field_key = 'weight'
             ORDER BY scope.scope_key, member.asserted_value`,
      args: [PHASE35_M815_METAL_STRIPED_ID],
    });
    assert.deepEqual(
      m815WeightConflicts.rows.map((row) => [
        String(row.scope_key),
        String(row.status),
        String(row.asserted_value),
        String(row.url),
      ]),
      [
        [
          "pelikan-m815-metal-striped-black-2018",
          "resolved",
          "2018 Black review sample: approximately 37.1 g",
          "https://thepelikansperch.com/2018/07/21/pelikan-m815-metal-striped-review/",
        ],
        [
          "pelikan-m815-metal-striped-black-2018",
          "resolved",
          "2018 Black: 38 g",
          "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M800-Basis/M815/M815-Metal-Striped/index.html",
        ],
        [
          "pelikan-m815-metal-striped-blue-2025",
          "resolved",
          "2025 Blue announcement: 37.13 g",
          "https://thepelikansperch.com/2025/04/30/pelikan-m815-metal-striped-blue-announced/",
        ],
        [
          "pelikan-m815-metal-striped-blue-2025",
          "resolved",
          "2025 Blue official: 36 g",
          "https://www.pelikan-passion.com/de/writing/premium/souveraen/souveraen-815-metal-striped-blue.html?fwiRefId=239",
        ],
      ],
    );

    for (const modelId of MODEL_IDS) {
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
          [modelId],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
          [modelId, PHASE35_PELIKAN_ID],
        ),
        1,
      );
    }
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value FROM entity_links
          WHERE target_id = ? AND link_type = 'made_by'
            AND source_id IN (?, ?, ?, ?)`,
        [PHASE35_PELIKAN_ID, ...MODEL_IDS],
      ),
      4,
    );

    const retiredMislabel = await client.execute({
      sql: `SELECT entity.type, entity.slug, publication.status,
                   publication.blockers_json
              FROM entities entity
              JOIN entity_publications publication
                ON publication.entity_id = entity.id
             WHERE entity.id = ?`,
      args: [PHASE35_RETIRED_M605_MISLABEL_ID],
    });
    assert.deepEqual(
      retiredMislabel.rows.map((row) => [
        String(row.type),
        String(row.slug),
        String(row.status),
        String(row.blockers_json),
      ]),
      [
        [
          "pen",
          PHASE35_RETIRED_M605_MISLABEL_SLUG,
          "retired",
          '["taxonomy_retired_mislabel"]',
        ],
      ],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE link_type = 'made_by' AND (source_id = ? OR target_id = ?)",
        [PHASE35_RETIRED_M605_MISLABEL_ID, PHASE35_RETIRED_M605_MISLABEL_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id = ?",
        [PHASE35_RETIRED_M605_MISLABEL_ID],
      ),
      0,
    );

    const redirects = await client.execute({
      sql: `SELECT source_path, target_path, redirect_kind
              FROM entity_redirects
             WHERE source_path IN (?, ?, ?)
             ORDER BY source_path`,
      args: [
        `/pen/${PHASE35_M1005_LEGACY_SLUG}`,
        `/pen/${PHASE35_M400_LEGACY_SLUG}`,
        `/pen/${PHASE35_M815_LEGACY_SLUG}`,
      ],
    });
    const redirectMap = new Map(
      redirects.rows.map((row) => [
        String(row.source_path),
        [String(row.target_path), String(row.redirect_kind)],
      ]),
    );
    assert.deepEqual(redirectMap.get(`/pen/${PHASE35_M1005_LEGACY_SLUG}`), [
      `/pen/${PHASE35_M1005_CANONICAL_SLUG}`,
      "permanent",
    ]);
    assert.deepEqual(redirectMap.get(`/pen/${PHASE35_M400_LEGACY_SLUG}`), [
      `/pen/${PHASE35_M400_CANONICAL_SLUG}`,
      "permanent",
    ]);
    assert.deepEqual(redirectMap.get(`/pen/${PHASE35_M815_LEGACY_SLUG}`), [
      `/pen/${PHASE35_M815_CANONICAL_SLUG}`,
      "permanent",
    ]);

    const taxonomyActions = await client.execute({
      sql: `SELECT action.source_row_key, action.action_kind, action.status
              FROM taxonomy_actions action
              JOIN taxonomy_batches batch ON batch.id = action.batch_id
             WHERE batch.source_key = ?
             ORDER BY action.source_row_key`,
      args: ["phase35-pelikan-souveran-variants-v1"],
    });
    assert.deepEqual(
      taxonomyActions.rows.map((row) => [
        String(row.source_row_key),
        String(row.action_kind),
        String(row.status),
      ]),
      [
        ["create-m605", "create", "applied"],
        ["rename-m1005-stresemann-2019", "rename", "applied"],
        ["rename-m400", "rename", "applied"],
        ["rename-m815-metal-striped", "rename", "applied"],
      ],
    );

    const media = await client.execute({
      sql: `SELECT entity_id, local_path, license, usage_status,
                   attribution_text
              FROM media_assets
             WHERE entity_id IN (?, ?, ?, ?) AND usage_status = 'primary'
             ORDER BY entity_id`,
      args: [...MODEL_IDS],
    });
    assert.equal(media.rows.length, 4);
    assert.equal(
      new Set(media.rows.map((row) => String(row.local_path))).size,
      4,
    );
    for (const row of media.rows) {
      assert.equal(String(row.license), "site-original");
      assert.equal(String(row.usage_status), "primary");
      assert.match(String(row.attribution_text), /本站原创事实图/);
      const localPath = String(row.local_path);
      assert.ok(
        fs.statSync(path.join(ROOT, "public", localPath.slice(1))).isFile(),
      );
    }
    const m605Svg = fs.readFileSync(
      path.join(
        ROOT,
        "public/images/library/site-original/pelikan-souveran-variants/pelikan-m605-family-factual.svg",
      ),
      "utf8",
    );
    for (const marker of [
      "Solid Dark Blue",
      "Black",
      "Blue Striated",
      "Marine Blue Transparent",
      "White-Transparent",
      "Stresemann",
      "Green-White",
      "Tortoiseshell-Black",
    ]) {
      assert.match(m605Svg, new RegExp(marker));
    }
    assert.match(m605Svg, /本站原创事实图/);
    assert.doesNotMatch(m605Svg, /factual SVG/);

    const sourceRegistries = await client.execute({
      sql: `SELECT item.url, registry.name, registry.source_type,
                   registry.default_source_tier,
                   registry.default_independence_group
              FROM source_items item
              JOIN source_registry registry ON registry.id = item.source_id
             WHERE item.url IN (?, ?, ?, ?, ?)
             ORDER BY item.url`,
      args: [
        "https://mam.pelikan.com/mam/de/pelikan/products/810487",
        "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M400-Basis/index.html",
        "https://thepelikansperch.com/2025/04/30/pelikan-m815-metal-striped-blue-announced/",
        "https://www.pelikan-collectibles.com/de/Pelikan/Kataloge/2013-Katalog/Pelikan-Pen-Catalogue-2013-2014.pdf#page=7",
        "https://www.pelikan.com/images/assets/picb/Annual_report_2013_part1.pdf?download=",
      ],
    });
    assert.equal(sourceRegistries.rows.length, 5);
    const registryByUrl = new Map(
      sourceRegistries.rows.map((row) => [String(row.url), row]),
    );
    assert.deepEqual(
      [
        "name",
        "source_type",
        "default_source_tier",
        "default_independence_group",
      ].map((key) =>
        String(
          registryByUrl.get(
            "https://mam.pelikan.com/mam/de/pelikan/products/810487",
          )?.[key],
        ),
      ),
      [
        "Pelikan Fine Writing official",
        "official",
        "primary",
        "pelikan-fine-writing-official",
      ],
    );
    assert.equal(
      String(
        registryByUrl.get(
          "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M400-Basis/index.html",
        )?.name,
      ),
      "Pelikan Collectibles",
    );
    assert.equal(
      String(
        registryByUrl.get(
          "https://thepelikansperch.com/2025/04/30/pelikan-m815-metal-striped-blue-announced/",
        )?.name,
      ),
      "The Pelikan's Perch",
    );
    for (const url of [
      "https://www.pelikan-collectibles.com/de/Pelikan/Kataloge/2013-Katalog/Pelikan-Pen-Catalogue-2013-2014.pdf#page=7",
      "https://www.pelikan.com/images/assets/picb/Annual_report_2013_part1.pdf?download=",
    ]) {
      const sourceRow = registryByUrl.get(url);
      assert.equal(String(sourceRow?.source_type), "official");
      assert.equal(
        String(sourceRow?.default_source_tier),
        "contemporary_archive",
      );
    }

    assert.deepEqual(
      await publicationSnapshot(client, protectedPublishedIds),
      protectedPagesBefore,
    );

    const revisionsBeforeReplay = await publicationSnapshot(client, [
      PHASE35_PELIKAN_ID,
      ...MODEL_IDS,
      PHASE35_RETIRED_M605_MISLABEL_ID,
    ]);
    const replay = await applyPhase35PelikanSouveranVariantsContent(
      client,
      baseOptions,
    );
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop", "noop", "noop"],
    );
    assert.deepEqual(
      await publicationSnapshot(client, [
        PHASE35_PELIKAN_ID,
        ...MODEL_IDS,
        PHASE35_RETIRED_M605_MISLABEL_ID,
      ]),
      revisionsBeforeReplay,
    );
    assert.deepEqual(
      await publicationSnapshot(client, protectedPublishedIds),
      protectedPagesBefore,
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  }
});
