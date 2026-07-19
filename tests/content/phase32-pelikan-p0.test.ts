import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase27PelikanContent } from "../../scripts/apply-phase27-pelikan-content";
import {
  applyPhase32PelikanP0Content,
  PHASE32_M600_CANONICAL_SLUG,
  PHASE32_M600_LEGACY_SLUG,
  PHASE32_M600_TORTOISESHELL_WHITE_2012_SLUG,
  PHASE32_M1000_CANONICAL_SLUG,
  PHASE32_M1000_LEGACY_SLUG,
  PHASE32_MISLABEL_SLUG,
} from "../../scripts/apply-phase32-pelikan-p0-content";
import {
  PHASE32_M600_ID,
  PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
  PHASE32_M1000_ID,
  PHASE32_PELIKAN_ID,
  PHASE32_RETIRED_MISLABEL_ID,
} from "../../scripts/data/phase32-pelikan-p0";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { getCanonicalEntityPath } from "../../src/lib/entity-redirects";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PHASE27_M800_ID = "1UzrQA9Rrmqs";

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

async function legacyPayloadSnapshot(client: Client): Promise<unknown> {
  const entity = await client.execute({
    sql: `SELECT id, type, slug, name, summary, body_md, source
            FROM entities WHERE id = ?`,
    args: [PHASE32_RETIRED_MISLABEL_ID],
  });
  const counts = await client.execute({
    sql: `SELECT
            (SELECT count(*) FROM stories WHERE entity_id = ?) AS stories,
            (SELECT count(*) FROM model_specs WHERE entity_id = ?) AS specs,
            (SELECT count(*) FROM model_variants WHERE model_entity_id = ?) AS variants,
            (SELECT count(*) FROM claims WHERE subject_entity_id = ?) AS claims,
            (SELECT count(*) FROM entity_references WHERE entity_id = ?) AS refs,
            (SELECT count(*) FROM entity_aliases WHERE entity_id = ?) AS aliases,
            (SELECT count(*) FROM media_assets WHERE entity_id = ?) AS media,
            (SELECT count(*) FROM timeline_events WHERE entity_id = ?) AS timeline,
            (SELECT count(*) FROM entity_tags WHERE entity_id = ?) AS tags`,
    args: Array(9).fill(PHASE32_RETIRED_MISLABEL_ID),
  });
  return {
    entity: entity.rows.map((row) => ({ ...row })),
    counts: counts.rows.map((row) => ({ ...row })),
  };
}

test("Phase 32 publishes Pelikan M1000, M600 and an independent 2012 M600 White Tortoise from an owned checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase32-pelikan-p0-")),
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
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id = ? AND type = 'pen' AND slug = ?",
        [PHASE32_M1000_ID, PHASE32_M1000_LEGACY_SLUG],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id = ? AND type = 'pen' AND slug = ?",
        [PHASE32_M600_ID, PHASE32_M600_LEGACY_SLUG],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id = ? AND type = 'pen' AND slug = ?",
        [PHASE32_RETIRED_MISLABEL_ID, PHASE32_MISLABEL_SLUG],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id = ?",
        [PHASE32_M600_TORTOISESHELL_WHITE_2012_ID],
      ),
      0,
    );
    const legacyPayloadBefore = await legacyPayloadSnapshot(client);

    const applyOptions = {
      workspaceRoot: ROOT,
      reviewer: "phase32-pelikan-p0-curated-content",
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
      ...applyOptions,
      reviewer: "phase27-pelikan-prerequisite",
    });
    const m800PublicationBefore = await client.execute({
      sql: `SELECT status, content_revision
              FROM entity_publications
             WHERE entity_id = ?`,
      args: [PHASE27_M800_ID],
    });
    assert.equal(m800PublicationBefore.rows.length, 1);
    assert.equal(String(m800PublicationBefore.rows[0]?.status), "published");
    assert.ok(Number(m800PublicationBefore.rows[0]?.content_revision) > 0);
    const first = await applyPhase32PelikanP0Content(client, applyOptions);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [PHASE32_PELIKAN_ID, "published"],
        [PHASE32_M1000_ID, "published"],
        [PHASE32_M600_ID, "published"],
        [PHASE32_M600_TORTOISESHELL_WHITE_2012_ID, "published"],
      ],
    );
    assert.equal(
      getCanonicalEntityPath("pen", PHASE32_MISLABEL_SLUG),
      `/pen/${PHASE32_M600_TORTOISESHELL_WHITE_2012_SLUG}`,
    );

    const publicRows = await client.execute({
      sql: `SELECT id, slug, name, length(summary) AS summary_length,
                   length(body_md) AS body_length, body_md
              FROM public_entities
             WHERE id IN (?, ?, ?)
             ORDER BY CASE id WHEN ? THEN 0 WHEN ? THEN 1 ELSE 2 END`,
      args: [
        PHASE32_M1000_ID,
        PHASE32_M600_ID,
        PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
        PHASE32_M1000_ID,
        PHASE32_M600_ID,
      ],
    });
    assert.deepEqual(
      publicRows.rows.map((row) => [
        String(row.id),
        String(row.slug),
        String(row.name),
      ]),
      [
        [
          PHASE32_M1000_ID,
          PHASE32_M1000_CANONICAL_SLUG,
          "Pelikan Souverän M1000",
        ],
        [PHASE32_M600_ID, PHASE32_M600_CANONICAL_SLUG, "Pelikan Souverän M600"],
        [
          PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
          PHASE32_M600_TORTOISESHELL_WHITE_2012_SLUG,
          "Pelikan Souverän M600 Tortoiseshell-White (2012)",
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
    const m1000Body = String(publicRows.rows[0]?.body_md);
    assert.match(m1000Body, /14\.7 cm[\s\S]*14\.6 cm[\s\S]*相差[^。]*1 mm/);
    assert.match(m1000Body, /14\.6–14\.7 cm/);
    assert.match(m1000Body, /32\.6 g/);
    assert.match(m1000Body, /14\.1 mm[\s\S]*1\.35 ml/);
    assert.match(
      m1000Body,
      /18K\/750[\s\S]*EF、F、M、B[\s\S]*differential piston/,
    );
    assert.match(
      m1000Body,
      /反向螺纹[\s\S]*不应成为例行保养|反向螺纹[\s\S]*不是.*日常/,
    );
    assert.doesNotMatch(m1000Body, /普遍软|一定湿|普遍.*湿/);

    const currentSpecClaims = await client.execute({
      sql: `SELECT subject_entity_id, object_text
              FROM claims
             WHERE subject_entity_id IN (?, ?)
               AND predicate = 'current_dimensions_weight_capacity'
               AND review_status = 'approved'
             ORDER BY subject_entity_id`,
      args: [PHASE32_M1000_ID, PHASE32_M600_ID],
    });
    const currentSpecClaimById = new Map(
      currentSpecClaims.rows.map((row) => [
        String(row.subject_entity_id),
        String(row.object_text),
      ]),
    );
    assert.match(
      currentSpecClaimById.get(PHASE32_M1000_ID) ?? "",
      /相差 1 mm.*14\.7 cm.*14\.6 cm.*14\.6–14\.7 cm/,
    );
    assert.match(
      currentSpecClaimById.get(PHASE32_M600_ID) ?? "",
      /相差 1 mm.*13\.4 cm.*13\.3 cm.*13\.3–13\.4 cm/,
    );

    const currentProductSources = await client.execute({
      sql: `SELECT item.url, registry.name, registry.source_type,
                   registry.default_source_tier,
                   registry.default_independence_group
              FROM source_items item
              JOIN source_registry registry ON registry.id = item.source_id
             WHERE item.url IN (?, ?)
             ORDER BY item.url`,
      args: [
        "https://www.pelikan-passion.com/co/escritura/premium/souveraen/souveran-1000-black.html",
        "https://www.pelikan-passion.com/de/writing/premium/souveraen/souveraen-r-600-schwarz.html",
      ],
    });
    assert.equal(currentProductSources.rows.length, 2);
    for (const row of currentProductSources.rows) {
      assert.equal(String(row.name), "Pelikan Fine Writing official");
      assert.equal(String(row.source_type), "official");
      assert.equal(String(row.default_source_tier), "primary");
      assert.equal(
        String(row.default_independence_group),
        "pelikan-fine-writing-official",
      );
    }

    assert.match(
      String(publicRows.rows[1]?.body_md),
      /1985–1988[\s\S]*18C\/750 单色[\s\S]*1989[\s\S]*14C\/585 双色[\s\S]*1990 至 1997 年 9 月[\s\S]*18C\/750 双色/,
    );
    const m600Body = String(publicRows.rows[1]?.body_md);
    assert.match(m600Body, /相差[^。]*1 mm[\s\S]*13\.4 cm[\s\S]*13\.3 cm/);
    assert.match(m600Body, /13\.3–13\.4 cm/);
    assert.match(m600Body, /16\.4 g/);
    assert.match(m600Body, /12\.4 mm[\s\S]*1\.30 ml/);
    assert.match(
      m600Body,
      /press-fit \/ friction-fit[\s\S]*正常保养很少需要|press-fit[\s\S]*无需每次都拆/,
    );

    const m800PublicationAfter = await client.execute({
      sql: `SELECT status, content_revision
              FROM entity_publications
             WHERE entity_id = ?`,
      args: [PHASE27_M800_ID],
    });
    assert.deepEqual(
      m800PublicationAfter.rows.map((row) => [
        String(row.status),
        Number(row.content_revision),
      ]),
      m800PublicationBefore.rows.map((row) => [
        String(row.status),
        Number(row.content_revision),
      ]),
    );

    const whiteBody = String(publicRows.rows[2]?.body_md);
    assert.match(
      whiteBody,
      /2012[\s\S]*浅色 tortoise-striped[\s\S]*白色笔帽[\s\S]*金色饰件[\s\S]*14ct/,
    );
    assert.match(
      whiteBody,
      /家族级近似[\s\S]*5\.28 in（约 134\.1 mm）[\s\S]*0\.49 in（约 12\.45 mm）[\s\S]*0\.56 oz（约 15\.9 g）[\s\S]*1\.30 ml/,
    );
    assert.match(
      whiteBody,
      /通用历史 M600 平台表[\s\S]*133 mm[\s\S]*12\.4 mm[\s\S]*18 g[\s\S]*不能冒充 2012 Tortoiseshell-White 的精确规格/,
    );
    assert.match(
      whiteBody,
      /M605 White-Transparent \(2017\)[\s\S]*M605 Green-White \(2021\)[\s\S]*M605 Black Tortoise \(2022\)/,
    );
    assert.match(whiteBody, /不足以.*celluloid|不.*标.*celluloid/);
    const whiteMeasurementClaim = await client.execute({
      sql: `SELECT object_text FROM claims
             WHERE subject_entity_id = ?
               AND predicate = 'edition_dimensions_weight_capacity'
               AND review_status = 'approved'`,
      args: [PHASE32_M600_TORTOISESHELL_WHITE_2012_ID],
    });
    assert.equal(whiteMeasurementClaim.rows.length, 1);
    assert.match(
      String(whiteMeasurementClaim.rows[0]?.object_text),
      /没有来源提供 2012 配色的官方单支测量.*134\.1 mm.*12\.45 mm.*15\.9 g.*通用历史 M600 平台表另列 133 mm.*18 g.*不得冒充该配色精确值/,
    );

    const redirects = await client.execute({
      sql: `SELECT source_path, target_path, redirect_kind
              FROM entity_redirects
             WHERE source_path IN (?, ?, ?)
             ORDER BY source_path`,
      args: [
        `/pen/${PHASE32_M1000_LEGACY_SLUG}`,
        `/pen/${PHASE32_M600_LEGACY_SLUG}`,
        `/pen/${PHASE32_MISLABEL_SLUG}`,
      ],
    });
    const redirectMap = new Map(
      redirects.rows.map((row) => [
        String(row.source_path),
        [String(row.target_path), String(row.redirect_kind)],
      ]),
    );
    assert.deepEqual(redirectMap.get(`/pen/${PHASE32_M1000_LEGACY_SLUG}`), [
      `/pen/${PHASE32_M1000_CANONICAL_SLUG}`,
      "permanent",
    ]);
    assert.deepEqual(redirectMap.get(`/pen/${PHASE32_M600_LEGACY_SLUG}`), [
      `/pen/${PHASE32_M600_CANONICAL_SLUG}`,
      "permanent",
    ]);
    assert.deepEqual(redirectMap.get(`/pen/${PHASE32_MISLABEL_SLUG}`), [
      `/pen/${PHASE32_M600_TORTOISESHELL_WHITE_2012_SLUG}`,
      "permanent",
    ]);

    const retired = await client.execute({
      sql: `SELECT entity.id, entity.type, entity.slug, entity.name,
                   publication.status, publication.blockers_json
              FROM entities entity
              JOIN entity_publications publication
                ON publication.entity_id = entity.id
             WHERE entity.id = ?`,
      args: [PHASE32_RETIRED_MISLABEL_ID],
    });
    assert.deepEqual(
      retired.rows.map((row) => [
        String(row.id),
        String(row.type),
        String(row.slug),
        String(row.name),
        String(row.status),
        String(row.blockers_json),
      ]),
      [
        [
          PHASE32_RETIRED_MISLABEL_ID,
          "pen",
          PHASE32_MISLABEL_SLUG,
          "百利金 Pelikan M605白乌龟",
          "retired",
          '["taxonomy_retired_mislabel"]',
        ],
      ],
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id = ?",
        [PHASE32_RETIRED_MISLABEL_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
        [PHASE32_RETIRED_MISLABEL_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entity_links WHERE target_id = ? AND link_type = 'made_by'",
        [PHASE32_RETIRED_MISLABEL_ID],
      ),
      0,
    );
    assert.deepEqual(await legacyPayloadSnapshot(client), legacyPayloadBefore);

    for (const modelId of [
      PHASE32_M1000_ID,
      PHASE32_M600_ID,
      PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
    ]) {
      assert.equal(
        await scalar(
          client,
          `SELECT count(*) AS value FROM entity_links
            WHERE source_id = ? AND link_type = 'made_by'`,
          [modelId],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          `SELECT count(*) AS value FROM entity_links
            WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
          [modelId, PHASE32_PELIKAN_ID],
        ),
        1,
      );
    }

    const publicModels = await client.execute({
      sql: `SELECT pen.id, pen.slug
              FROM entity_links link
              JOIN public_entities pen ON pen.id = link.source_id
             WHERE link.target_id = ? AND link.link_type = 'made_by'
             ORDER BY pen.id`,
      args: [PHASE32_PELIKAN_ID],
    });
    assert.deepEqual(
      new Set(publicModels.rows.map((row) => String(row.id))),
      new Set([
        PHASE27_M800_ID,
        PHASE32_M1000_ID,
        PHASE32_M600_ID,
        PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
      ]),
    );
    assert.ok(
      publicModels.rows.every(
        (row) => String(row.id) !== PHASE32_RETIRED_MISLABEL_ID,
      ),
    );

    const specs = await client.execute({
      sql: `SELECT entity_id, series_name, release_year, nib, fill_system,
                   material, dimensions, weight, status
              FROM model_specs
             WHERE entity_id IN (?, ?, ?) AND review_status = 'approved'`,
      args: [
        PHASE32_M1000_ID,
        PHASE32_M600_ID,
        PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
      ],
    });
    const specById = new Map(
      specs.rows.map((row) => [String(row.entity_id), row]),
    );
    assert.match(
      String(specById.get(PHASE32_M1000_ID)?.nib),
      /18K\/750.*EF、F、M、B/,
    );
    assert.match(
      String(specById.get(PHASE32_M1000_ID)?.fill_system),
      /差动活塞.*1\.35 ml/,
    );
    assert.equal(
      String(specById.get(PHASE32_M1000_ID)?.dimensions),
      "闭帽 14.6–14.7 cm（现行产品页与 2025 目录相差 1 mm）；直径 14.1 mm；XL",
    );
    assert.match(
      String(specById.get(PHASE32_M600_ID)?.release_year),
      /1985.*1997-09/,
    );
    assert.match(
      String(specById.get(PHASE32_M600_ID)?.nib),
      /14K\/585.*EF、F、M、B/,
    );
    assert.equal(
      String(specById.get(PHASE32_M600_ID)?.dimensions),
      "现行闭帽 13.3–13.4 cm（产品页与 2025 目录相差 1 mm）；直径 12.4 mm；M",
    );
    assert.match(
      String(
        specById.get(PHASE32_M600_TORTOISESHELL_WHITE_2012_ID)?.dimensions,
      ),
      /家族级近似参考.*134\.1 mm.*12\.45 mm.*非 2012 配色官方单支测量/,
    );
    assert.match(
      String(specById.get(PHASE32_M600_TORTOISESHELL_WHITE_2012_ID)?.weight),
      /15\.9 g.*通用历史 M600 表另列 18 g.*有差异/,
    );
    assert.match(
      String(specById.get(PHASE32_M600_TORTOISESHELL_WHITE_2012_ID)?.material),
      /具体材料未充分核实.*不标 celluloid/,
    );
    assert.match(
      String(specById.get(PHASE32_M600_TORTOISESHELL_WHITE_2012_ID)?.status),
      /2012.*不与 M605 2017\/2021\/2022 合并/,
    );

    const m600Variants = await client.execute({
      sql: `SELECT variant_name FROM model_variants
             WHERE model_entity_id = ? ORDER BY variant_name`,
      args: [PHASE32_M600_ID],
    });
    const variantNames = new Set(
      m600Variants.rows.map((row) => String(row.variant_name)),
    );
    for (const expected of [
      "M600 Old Style（1985–1997）",
      "18C/750 单色金尖（1985–1988）",
      "14C/585 双色金尖（1989）",
      "18C/750 双色金尖（1990–1997）",
      "M600 加大平台（1997-09 至今）",
    ]) {
      assert.ok(variantNames.has(expected));
    }
    const whiteVariants = await client.execute({
      sql: "SELECT variant_name FROM model_variants WHERE model_entity_id = ?",
      args: [PHASE32_M600_TORTOISESHELL_WHITE_2012_ID],
    });
    assert.deepEqual(
      whiteVariants.rows.map((row) => String(row.variant_name)),
      ["Tortoiseshell-White（2012）"],
    );

    const boundaryClaim = await client.execute({
      sql: `SELECT object_text FROM claims
             WHERE subject_entity_id = ?
               AND predicate = 'related_model_boundary'
               AND review_status = 'approved'`,
      args: [PHASE32_M600_TORTOISESHELL_WHITE_2012_ID],
    });
    assert.equal(boundaryClaim.rows.length, 1);
    assert.match(
      String(boundaryClaim.rows[0]?.object_text),
      /2017 M605 White-Transparent.*2021 M605 Green-White.*2022 M605 Black Tortoise/,
    );

    const media = await client.execute({
      sql: `SELECT entity_id, title, local_path, author, license,
                   attribution_text, source_url
              FROM media_assets
             WHERE entity_id IN (?, ?, ?) AND usage_status = 'primary'`,
      args: [
        PHASE32_M1000_ID,
        PHASE32_M600_ID,
        PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
      ],
    });
    assert.equal(media.rows.length, 3);
    const m1000Media = media.rows.find(
      (row) => String(row.entity_id) === PHASE32_M1000_ID,
    );
    assert.equal(String(m1000Media?.author), "M Dreibelbis");
    assert.equal(String(m1000Media?.license), "cc-by-2.0");
    assert.match(
      String(m1000Media?.source_url),
      /commons\.wikimedia\.org.*Pelikan_M1000_II/,
    );
    assert.match(
      String(m1000Media?.attribution_text),
      /Flickr.*Wikimedia Commons.*CC BY 2\.0.*未裁切、未缩放、未改色/,
    );
    const m1000Image = path.join(
      ROOT,
      "public/images/library/wikimedia/pelikan-p0/pelikan-m1000-ii-m-dreibelbis.jpg",
    );
    assert.equal(fs.statSync(m1000Image).size, 4_550_417);
    assert.equal(
      createHash("sha256").update(fs.readFileSync(m1000Image)).digest("hex"),
      "e96b05bb09b5b309cb23565e5af5c46768cfd771d1a3a6bbc72fe0452098e0dd",
    );

    for (const modelId of [
      PHASE32_M600_ID,
      PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
    ]) {
      const row = media.rows.find(
        (candidate) => String(candidate.entity_id) === modelId,
      );
      assert.equal(String(row?.license), "site-original");
      assert.match(String(row?.title), /非产品照片/);
      assert.match(
        String(row?.attribution_text),
        /factual SVG.*非 Pelikan 产品实拍.*非机械结构图.*不按比例/,
      );
      const localPath = String(row?.local_path);
      assert.ok(
        fs.statSync(path.join(ROOT, "public", localPath.slice(1))).isFile(),
      );
    }
    const whiteMedia = media.rows.find(
      (row) =>
        String(row.entity_id) === PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
    );
    assert.match(String(whiteMedia?.attribution_text), /非材料证据/);

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_references reference
           JOIN source_items source ON source.id = reference.source_item_id
          WHERE reference.entity_id IN (?, ?, ?, ?)
            AND source.archive_url LIKE '%.planning/%'`,
        [
          PHASE32_PELIKAN_ID,
          PHASE32_M1000_ID,
          PHASE32_M600_ID,
          PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
        ],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM publication_v2_source_group_counts
          WHERE entity_id IN (?, ?, ?, ?)
            AND primary_archive_group_count >= 1
            AND professional_secondary_group_count >= 1`,
        [
          PHASE32_PELIKAN_ID,
          PHASE32_M1000_ID,
          PHASE32_M600_ID,
          PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
        ],
      ),
      4,
    );

    const revisionsBeforeReplay = await client.execute({
      sql: `SELECT entity_id, status, blockers_json, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [
        PHASE32_PELIKAN_ID,
        PHASE32_M1000_ID,
        PHASE32_M600_ID,
        PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
        PHASE32_RETIRED_MISLABEL_ID,
      ],
    });
    const replay = await applyPhase32PelikanP0Content(client, applyOptions);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop", "noop"],
    );
    const revisionsAfterReplay = await client.execute({
      sql: `SELECT entity_id, status, blockers_json, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [
        PHASE32_PELIKAN_ID,
        PHASE32_M1000_ID,
        PHASE32_M600_ID,
        PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
        PHASE32_RETIRED_MISLABEL_ID,
      ],
    });
    assert.deepEqual(
      revisionsAfterReplay.rows.map((row) => ({ ...row })),
      revisionsBeforeReplay.rows.map((row) => ({ ...row })),
    );
    assert.deepEqual(await legacyPayloadSnapshot(client), legacyPayloadBefore);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  }
});
