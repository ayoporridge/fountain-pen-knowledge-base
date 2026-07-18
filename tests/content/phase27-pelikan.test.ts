import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase27PelikanContent } from "../../scripts/apply-phase27-pelikan-content";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { getCanonicalEntityPath } from "../../src/lib/entity-redirects";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PELIKAN_ID = "VXUULuCOLOB1";
const M800_ID = "1UzrQA9Rrmqs";
const LEGACY_M800_ID = "rKSjyWghpB8Y";
const LEGACY_M800_SLUG = "百利金-pelikan-m800";

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 27 publishes Pelikan and canonical M800 from an owned checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase27-pelikan-")),
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
    const applyOptions = {
      workspaceRoot: ROOT,
      reviewer: "phase27-pelikan-curated-content",
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

    const first = await applyPhase27PelikanContent(client, applyOptions);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [PELIKAN_ID, "published"],
        [M800_ID, "published"],
      ],
    );

    const publicRows = await client.execute({
      sql: `SELECT id, slug, name, length(summary) AS summary_length,
                   length(body_md) AS body_length, body_md
              FROM public_entities
             WHERE id IN (?, ?)
             ORDER BY CASE id WHEN ? THEN 0 ELSE 1 END`,
      args: [PELIKAN_ID, M800_ID, PELIKAN_ID],
    });
    assert.deepEqual(
      publicRows.rows.map((row) => [
        String(row.id),
        String(row.slug),
        String(row.name),
      ]),
      [
        [PELIKAN_ID, "pelikan", "百利金 Pelikan"],
        [M800_ID, "pelikan-souveran-m800", "百利金 Pelikan Souverän M800"],
      ],
    );
    assert.ok(Number(publicRows.rows[0]?.body_length) >= 1_200);
    assert.ok(Number(publicRows.rows[1]?.body_length) >= 2_000);
    for (const row of publicRows.rows) {
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.summary_length) <= 160);
    }
    assert.match(
      String(publicRows.rows[0]?.body_md),
      /1832[\s\S]*1838[\s\S]*1878[\s\S]*1929[\s\S]*1973[\s\S]*2023/,
    );
    assert.match(
      String(publicRows.rows[1]?.body_md),
      /14C 不是“仅 1987 年”[\s\S]*1990\/91/,
    );
    assert.match(
      String(publicRows.rows[1]?.body_md),
      /cellulose acetate[\s\S]*不能外推到纯黑 M800/,
    );
    assert.match(String(publicRows.rows[1]?.body_md), /M805 是同平台银色路线/);
    assert.match(
      String(publicRows.rows[1]?.body_md),
      /M815 不是固定的“高阶 M805”/,
    );

    const publicM800Identities = await client.execute({
      sql: `SELECT id, slug
              FROM public_entities
             WHERE id IN (?, ?)
             ORDER BY id`,
      args: [M800_ID, LEGACY_M800_ID],
    });
    assert.deepEqual(
      publicM800Identities.rows.map((row) => [
        String(row.id),
        String(row.slug),
      ]),
      [[M800_ID, "pelikan-souveran-m800"]],
    );
    const legacyIdentity = await client.execute({
      sql: `SELECT entity.id, entity.type, entity.slug, publication.status,
                   publication.blockers_json
              FROM entities entity
              JOIN entity_publications publication ON publication.entity_id = entity.id
             WHERE entity.id = ?`,
      args: [LEGACY_M800_ID],
    });
    assert.deepEqual(
      legacyIdentity.rows.map((row) => [
        String(row.id),
        String(row.type),
        String(row.slug),
        String(row.status),
        JSON.parse(String(row.blockers_json)),
      ]),
      [
        [
          LEGACY_M800_ID,
          "pen",
          LEGACY_M800_SLUG,
          "retired",
          ["canonical_redirect"],
        ],
      ],
    );
    assert.equal(
      getCanonicalEntityPath("pen", LEGACY_M800_SLUG),
      "/pen/pelikan-souveran-m800",
    );

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links
          WHERE source_id = ? AND link_type = 'made_by'`,
        [M800_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links
          WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
        [M800_ID, PELIKAN_ID],
      ),
      1,
    );
    const publicModels = await client.execute({
      sql: `SELECT pen.id, pen.slug, pen.name
              FROM entity_links link
              JOIN public_entities pen ON pen.id = link.source_id
              JOIN public_entities brand ON brand.id = link.target_id
             WHERE link.target_id = ? AND link.link_type = 'made_by'
             ORDER BY pen.id`,
      args: [PELIKAN_ID],
    });
    assert.ok(
      publicModels.rows.some(
        (row) =>
          String(row.id) === M800_ID &&
          String(row.slug) === "pelikan-souveran-m800" &&
          String(row.name) === "百利金 Pelikan Souverän M800",
      ),
    );
    assert.ok(
      publicModels.rows.every((row) => String(row.id) !== LEGACY_M800_ID),
    );

    const timeline = await client.execute({
      sql: `SELECT entity_id, title, event_type, start_date, circa
              FROM timeline_events
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id, start_date`,
      args: [PELIKAN_ID, M800_ID],
    });
    const timelineFor = (entityId: string) =>
      timeline.rows
        .filter((row) => String(row.entity_id) === entityId)
        .map((row) => [
          String(row.title),
          String(row.event_type),
          String(row.start_date),
          Number(row.circa),
        ]);
    assert.deepEqual(timelineFor(PELIKAN_ID), [
      ["Carl Hornemann 建立颜料与墨水工厂", "design_milestone", "1832", 0],
      ["Pelikan 传统创立日", "brand_founded", "1838-04-28", 0],
      ["鹈鹕图形商标注册", "design_milestone", "1878-11-27", 0],
      ["Pelikan 首款钢笔", "model_released", "1929", 0],
      ["书写工具生产迁往 Peine/Vöhrum", "design_milestone", "1973", 0],
      ["Hamelin 完成收购 Pelikan", "acquisition", "2023-12-13", 0],
    ]);
    assert.deepEqual(timelineFor(M800_ID), [
      ["Pelikan M800 推出", "model_released", "1987", 0],
      ["1990/91 目录开始列 18C/750 双色尖", "design_milestone", "1990", 1],
      ["M805 银色饰件路线出现", "design_milestone", "2002", 0],
      ["M815 Metal Striped 特别版", "design_milestone", "2018", 0],
    ]);

    const originClaim = await client.execute({
      sql: `SELECT object_text
              FROM claims
             WHERE subject_entity_id = ?
               AND predicate = 'brand_origin_dates'
               AND review_status = 'approved'`,
      args: [PELIKAN_ID],
    });
    assert.equal(originClaim.rows.length, 1);
    assert.match(
      String(originClaim.rows[0]?.object_text),
      /1832.*1838 年 4 月 28 日/,
    );

    const m8xxScope = await client.execute({
      sql: `SELECT scope.scope_key
              FROM claims claim
              JOIN claim_evidence evidence ON evidence.claim_id = claim.id
              JOIN fact_scopes scope ON scope.id = evidence.scope_id
             WHERE claim.subject_entity_id = ?
               AND claim.predicate = 'model_family_boundary'
               AND evidence.review_status = 'approved'`,
      args: [PELIKAN_ID],
    });
    assert.deepEqual(
      m8xxScope.rows.map((row) => String(row.scope_key)),
      ["pelikan-m8xx-model-identity-boundary-2026-07-19"],
    );

    const boundaryClaims = await client.execute({
      sql: `SELECT predicate, object_text
              FROM claims
             WHERE subject_entity_id = ?
               AND predicate IN (
                 'historical_nib_transition',
                 'material_by_finish',
                 'related_model_boundary',
                 'related_model_number_boundary'
               )
               AND review_status = 'approved'
             ORDER BY predicate`,
      args: [M800_ID],
    });
    const claimByPredicate = new Map(
      boundaryClaims.rows.map((row) => [
        String(row.predicate),
        String(row.object_text),
      ]),
    );
    assert.match(
      claimByPredicate.get("historical_nib_transition") ?? "",
      /14C\/585 不只存在于 1987 年.*1990\/91.*例外/,
    );
    assert.match(
      claimByPredicate.get("material_by_finish") ?? "",
      /cellulose acetate.*不能.*纯黑 M800/,
    );
    assert.match(
      claimByPredicate.get("related_model_boundary") ?? "",
      /M805.*独立银色路线.*镀钯.*全镀铑/,
    );
    assert.match(
      claimByPredicate.get("related_model_number_boundary") ?? "",
      /M815.*复用.*不是固定高阶 M805.*不并入 canonical M800/,
    );

    const spec = await client.execute({
      sql: `SELECT series_name, release_year, origin_country, nib, fill_system,
                   material, dimensions, weight, status
              FROM model_specs
             WHERE entity_id = ? AND review_status = 'approved'`,
      args: [M800_ID],
    });
    assert.equal(spec.rows.length, 1);
    assert.equal(
      String(spec.rows[0]?.series_name),
      "Souverän 800（canonical M800；不含 M805／M815）",
    );
    assert.equal(String(spec.rows[0]?.release_year), "1987");
    assert.match(String(spec.rows[0]?.origin_country), /德国.*制造与组装/);
    assert.match(
      String(spec.rows[0]?.nib),
      /18K\/750.*镀铑.*EF、F、M、B.*14C\/585.*不仅见于 1987/,
    );
    assert.match(String(spec.rows[0]?.fill_system), /差动活塞.*1\.35 ml/);
    assert.match(
      String(spec.rows[0]?.material),
      /cellulose acetate.*纯黑款不外推/,
    );
    assert.match(
      String(spec.rows[0]?.dimensions),
      /14\.1–14\.2 cm.*13\.1 mm.*L/,
    );
    assert.match(String(spec.rows[0]?.weight), /28\.2 g/);
    assert.match(String(spec.rows[0]?.status), /现行标准 M800.*2025 目录/);
    assert.equal(
      await scalar(
        client,
        `SELECT count(DISTINCT evidence.field_key) AS value
           FROM spec_field_evidence evidence
           JOIN model_specs spec ON spec.id = evidence.model_spec_id
          WHERE spec.entity_id = ? AND evidence.review_status = 'approved'`,
        [M800_ID],
      ),
      10,
    );

    const variants = await client.execute({
      sql: `SELECT variant_name, variant_kind, release_year, notes
              FROM model_variants
             WHERE model_entity_id = ?
             ORDER BY variant_name`,
      args: [M800_ID],
    });
    assert.deepEqual(
      variants.rows.map((row) => String(row.variant_name)).sort(),
      [
        "14C/585 双色金尖（早期与个别特别版本）",
        "B 18K/750 双色金尖（现行）",
        "Black-Green（2025 常规目录）",
        "Black（2025 常规目录）",
        "EF 18K/750 双色金尖（现行）",
        "F 18K/750 双色金尖（现行）",
        "M 18K/750 双色金尖（现行）",
      ].sort(),
    );
    const historicalNib = variants.rows.find((row) =>
      String(row.variant_name).startsWith("14C/585"),
    );
    assert.equal(String(historicalNib?.variant_kind), "nib");
    assert.equal(String(historicalNib?.release_year), "1987");
    assert.match(String(historicalNib?.notes), /不是仅 1987 年.*例外/);

    const media = await client.execute({
      sql: `SELECT entity_id, title, local_path, license, attribution_text,
                   source_url
              FROM media_assets
             WHERE entity_id IN (?, ?) AND usage_status = 'primary'
             ORDER BY CASE entity_id WHEN ? THEN 0 ELSE 1 END`,
      args: [PELIKAN_ID, M800_ID, PELIKAN_ID],
    });
    assert.equal(media.rows.length, 2);
    assert.deepEqual(
      media.rows.map((row) => [
        String(row.entity_id),
        String(row.local_path),
        String(row.license),
        String(row.source_url),
      ]),
      [
        [
          PELIKAN_ID,
          "/images/library/warm-pen-atlas/pelikan-brand-cover.jpg",
          "site-original",
          "/images/library/warm-pen-atlas/pelikan-brand-cover.jpg",
        ],
        [
          M800_ID,
          "/images/library/wikimedia/pelikan/pelikan-m800-hige-hige-japan.jpg",
          "cc-by-sa-4.0",
          "https://commons.wikimedia.org/wiki/File:Pelikan_M800.JPG",
        ],
      ],
    );
    assert.match(String(media.rows[0]?.attribution_text), /AI 图像生成辅助/);
    assert.match(
      String(media.rows[0]?.attribution_text),
      /非 Pelikan 产品实拍/,
    );
    assert.match(String(media.rows[1]?.title), /Pelikan Souverän M800 实物/);
    assert.match(String(media.rows[1]?.attribution_text), /Hige-hige-Japan/);
    assert.match(String(media.rows[1]?.attribution_text), /CC BY-SA 4\.0/);
    assert.match(
      String(media.rows[1]?.attribution_text),
      /未裁切、未缩放、未改色/,
    );
    assert.match(String(media.rows[1]?.attribution_text), /不代表纯黑款/);

    const m800ImagePath = path.join(
      ROOT,
      "public/images/library/wikimedia/pelikan/pelikan-m800-hige-hige-japan.jpg",
    );
    assert.ok(fs.statSync(m800ImagePath).isFile());
    assert.equal(
      createHash("sha256").update(fs.readFileSync(m800ImagePath)).digest("hex"),
      "572cba1c9a3a25937a375fa2228da02426043bcfdb713761436409792632dc30",
    );
    const mediaArchive = await client.execute({
      sql: `SELECT source.archive_locator
              FROM media_assets media
              JOIN source_items source ON source.id = media.source_item_id
             WHERE media.entity_id = ? AND media.usage_status = 'primary'`,
      args: [M800_ID],
    });
    assert.equal(mediaArchive.rows.length, 1);
    assert.match(
      String(mediaArchive.rows[0]?.archive_locator),
      /dimensions=3072x2048/,
    );
    assert.match(String(mediaArchive.rows[0]?.archive_locator), /resize=false/);
    assert.match(String(mediaArchive.rows[0]?.archive_locator), /crop=false/);
    assert.match(
      String(mediaArchive.rows[0]?.archive_locator),
      /color-edit=false/,
    );
    assert.match(
      String(mediaArchive.rows[0]?.archive_locator),
      /sha256=572cba1c9a3a25937a375fa2228da02426043bcfdb713761436409792632dc30/,
    );

    const references = await client.execute({
      sql: `SELECT source.url
              FROM entity_references reference
              JOIN source_items source ON source.id = reference.source_item_id
             WHERE reference.entity_id = ?
             ORDER BY source.url`,
      args: [M800_ID],
    });
    assert.deepEqual(
      references.rows.map((row) => String(row.url)).sort(),
      [
        "https://commons.wikimedia.org/wiki/File:Pelikan_M800.JPG",
        "https://thepelikansperch.com/2020/11/15/pelikan-m800-history-explored/",
        "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M800-Basis/index.html",
        "https://www.pelikan-passion.com/de/writing/premium/souveraen/souveraen-r-800-schwarz-gruen.html",
        "https://www.pelikan-passion.com/de/writing/premium/souveraen/souveraen-r-805-schwarz-silber.html",
        "https://www.pelikan-passion.com/images/assets/fwi_warranty_current.pdf",
        "https://www.pelikan.com/images/assets/catalogs/2025/2025_CATALOGO_FWI.pdf",
        "https://www.pelikan.com/int/services/faq.html",
      ].sort(),
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_references reference
           JOIN source_items source ON source.id = reference.source_item_id
          WHERE reference.entity_id IN (?, ?)
            AND source.archive_url LIKE '%.planning/%'`,
        [PELIKAN_ID, M800_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM publication_v2_source_group_counts
          WHERE entity_id IN (?, ?)
            AND primary_archive_group_count >= 1
            AND professional_secondary_group_count >= 1`,
        [PELIKAN_ID, M800_ID],
      ),
      2,
    );

    const revisionsBeforeReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?)
             ORDER BY entity_id`,
      args: [PELIKAN_ID, M800_ID, LEGACY_M800_ID],
    });
    const replay = await applyPhase27PelikanContent(client, applyOptions);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    const revisionsAfterReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?)
             ORDER BY entity_id`,
      args: [PELIKAN_ID, M800_ID, LEGACY_M800_ID],
    });
    assert.deepEqual(
      revisionsAfterReplay.rows.map((row) => ({ ...row })),
      revisionsBeforeReplay.rows.map((row) => ({ ...row })),
    );
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  }
});
