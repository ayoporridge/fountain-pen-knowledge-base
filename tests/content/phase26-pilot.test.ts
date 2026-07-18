import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase26PilotContent } from "../../scripts/apply-phase26-pilot-content";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PILOT_ID = "Zt-PbXkE7UHM";
const CUSTOM_74_ID = "gtneqw804HyP";

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 26 publishes Pilot and Custom 74 from an owned checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase26-pilot-")),
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
      reviewer: "phase26-pilot-curated-content",
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

    const first = await applyPhase26PilotContent(client, applyOptions);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [PILOT_ID, "published"],
        [CUSTOM_74_ID, "published"],
      ],
    );

    const publicRows = await client.execute({
      sql: `SELECT id, slug, name, length(summary) AS summary_length,
                   length(body_md) AS body_length, body_md
              FROM public_entities
             WHERE id IN (?, ?)
             ORDER BY CASE id WHEN ? THEN 0 ELSE 1 END`,
      args: [PILOT_ID, CUSTOM_74_ID, PILOT_ID],
    });
    assert.deepEqual(
      publicRows.rows.map((row) => [
        String(row.id),
        String(row.slug),
        String(row.name),
      ]),
      [
        [PILOT_ID, "pilot", "百乐 Pilot"],
        [CUSTOM_74_ID, "百乐-pilot-custom-74", "百乐 Pilot Custom 74"],
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
      /Namiki.*PILOT Corporation.*产品目录仍应分开/,
    );
    assert.match(String(publicRows.rows[1]?.body_md), /停止经销.*实际停售日期/);
    assert.match(String(publicRows.rows[1]?.body_md), /Custom Heritage 91/);
    assert.match(String(publicRows.rows[1]?.body_md), /Custom 742/);

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links
          WHERE source_id = ? AND link_type = 'made_by'`,
        [CUSTOM_74_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links
          WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
        [CUSTOM_74_ID, PILOT_ID],
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
      args: [PILOT_ID],
    });
    assert.ok(
      publicModels.rows.some(
        (row) =>
          String(row.id) === CUSTOM_74_ID &&
          String(row.slug) === "百乐-pilot-custom-74" &&
          String(row.name) === "百乐 Pilot Custom 74",
      ),
    );

    const timeline = await client.execute({
      sql: `SELECT entity_id, title, event_type, start_date
              FROM timeline_events
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id, start_date`,
      args: [PILOT_ID, CUSTOM_74_ID],
    });
    const timelineFor = (entityId: string) =>
      timeline.rows
        .filter((row) => String(row.entity_id) === entityId)
        .map((row) => [
          String(row.title),
          String(row.event_type),
          String(row.start_date),
        ]);
    assert.deepEqual(timelineFor(PILOT_ID), [
      ["Namiki Manufacturing 成立并开始制造钢笔", "brand_founded", "1918"],
      ["Capless 伸缩钢笔推出", "model_released", "1963"],
      ["第一代 CUSTOM 系列推出", "model_released", "1971"],
    ]);
    assert.deepEqual(timelineFor(CUSTOM_74_ID), [
      ["Custom 67 建立后续 Custom 74 的设计方向", "design_milestone", "1985"],
      ["Custom 74 推出", "model_released", "1992"],
    ]);

    const foundationClaim = await client.execute({
      sql: `SELECT object_text
              FROM claims
             WHERE subject_entity_id = ?
               AND predicate = 'company_founding'
               AND review_status = 'approved'`,
      args: [PILOT_ID],
    });
    assert.equal(foundationClaim.rows.length, 1);
    assert.match(
      String(foundationClaim.rows[0]?.object_text),
      /并木良辅.*1916.*1918.*和田正雄/,
    );

    const spec = await client.execute({
      sql: `SELECT series_name, release_year, origin_country, nib, fill_system,
                   material, dimensions, weight, status
              FROM model_specs
             WHERE entity_id = ? AND review_status = 'approved'`,
      args: [CUSTOM_74_ID],
    });
    assert.equal(spec.rows.length, 1);
    assert.equal(String(spec.rows[0]?.series_name), "PILOT CUSTOM 标准型");
    assert.equal(String(spec.rows[0]?.release_year), "1992");
    assert.match(String(spec.rows[0]?.nib), /14K 5 号.*11 种/);
    assert.match(String(spec.rows[0]?.fill_system), /CON-40、CON-70N/);
    assert.match(String(spec.rows[0]?.dimensions), /143 mm.*14\.7 mm/);
    assert.match(String(spec.rows[0]?.weight), /17\.4 g/);
    assert.match(
      String(spec.rows[0]?.status),
      /澳大利亚.*截至 2026-07-09.*Discontinued.*未注明/,
    );

    assert.equal(
      await scalar(
        client,
        `SELECT count(DISTINCT evidence.field_key) AS value
           FROM spec_field_evidence evidence
           JOIN model_specs spec ON spec.id = evidence.model_spec_id
          WHERE spec.entity_id = ? AND evidence.review_status = 'approved'`,
        [CUSTOM_74_ID],
      ),
      10,
    );

    const variants = await client.execute({
      sql: `SELECT variant_name, variant_kind, market, release_year, notes,
                   product_code
              FROM model_variants
             WHERE model_entity_id = ?
             ORDER BY variant_name`,
      args: [CUSTOM_74_ID],
    });
    assert.deepEqual(
      variants.rows.map((row) => String(row.variant_name)).sort(),
      [
        "日本现行深红／深蓝／深绿",
        "日本现行黑色 C／MS",
        "日本现行黑色标准尖",
        "欧洲透明彩色杆",
        "美国 Lavender Fog 特别配色尖号",
      ].sort(),
    );
    assert.ok(
      variants.rows.every(
        (row) =>
          String(row.variant_kind) === "market_sku" &&
          row.release_year === null,
      ),
    );
    const variantByName = new Map(
      variants.rows.map((row) => [String(row.variant_name), row]),
    );
    assert.deepEqual(
      {
        productCode: String(
          variantByName.get("日本现行黑色标准尖")?.product_code,
        ),
        notes: String(variantByName.get("日本现行黑色标准尖")?.notes),
      },
      {
        productCode: "FKKN-12SR-B",
        notes:
          "FKKN-12SR 黑色杆可选 EF、F、SF、FM、SFM、M、SM、B、BB；2026-07-19 日本目录快照。",
      },
    );
    assert.deepEqual(
      {
        productCode: String(
          variantByName.get("日本现行深红／深蓝／深绿")?.product_code,
        ),
        notes: String(variantByName.get("日本现行深红／深蓝／深绿")?.notes),
      },
      {
        productCode: "FKKN-12SR-DR/DL/DG",
        notes:
          "FKKN-12SR 的 DR、DL、DG 仅提供 EF、F、M、B；不把黑色杆的软尖和 BB 套到这些颜色。",
      },
    );
    assert.deepEqual(
      {
        productCode: String(
          variantByName.get("日本现行黑色 C／MS")?.product_code,
        ),
        notes: String(variantByName.get("日本现行黑色 C／MS")?.notes),
      },
      {
        productCode: "FKKN-14SR",
        notes:
          "C 与 MS 使用黑色 FKKN-14SR 独立商品代码；不是所有颜色的常规选项。",
      },
    );

    const media = await client.execute({
      sql: `SELECT entity_id, title, local_path, license, attribution_text,
                   source_url
              FROM media_assets
             WHERE entity_id IN (?, ?) AND usage_status = 'primary'
             ORDER BY CASE entity_id WHEN ? THEN 0 ELSE 1 END`,
      args: [PILOT_ID, CUSTOM_74_ID, PILOT_ID],
    });
    assert.equal(media.rows.length, 2);
    assert.deepEqual(
      media.rows.map((row) => [
        String(row.entity_id),
        String(row.local_path),
        String(row.source_url),
        String(row.license),
      ]),
      [
        [
          PILOT_ID,
          "/images/library/wikimedia/pilot/pilot-vanishing-point-m-marek-kubica.jpg",
          "https://commons.wikimedia.org/wiki/File:Pilot_Vanishing_Point_-M-_(32057717435).jpg",
          "cc-by-sa-2.0",
        ],
        [
          CUSTOM_74_ID,
          "/images/library/wikimedia/pilot/pilot-custom-74-m-dreibelbis.jpg",
          "https://commons.wikimedia.org/wiki/File:Pilot_Custom_74_(26901490646).jpg",
          "cc-by-2.0",
        ],
      ],
    );
    assert.equal(String(media.rows[0]?.license), "cc-by-sa-2.0");
    assert.equal(String(media.rows[1]?.license), "cc-by-2.0");
    assert.match(String(media.rows[0]?.title), /Vanishing Point/);
    assert.match(String(media.rows[0]?.attribution_text), /Marek Kubica/);
    assert.match(String(media.rows[0]?.attribution_text), /仅代表.*Capless/);
    assert.match(String(media.rows[1]?.title), /Custom 74 SFM/);
    assert.match(String(media.rows[1]?.attribution_text), /M Dreibelbis/);
    assert.match(String(media.rows[1]?.attribution_text), /未裁切/);
    assert.match(String(media.rows[1]?.attribution_text), /2016 年/);
    assert.match(String(media.rows[1]?.attribution_text), /不代表/);

    const mediaPaths = media.rows.map((row) => String(row.local_path));
    assert.notEqual(mediaPaths[0], mediaPaths[1]);
    for (const localPath of mediaPaths) {
      assert.ok(
        fs.statSync(path.join(ROOT, "public", localPath.slice(1))).isFile(),
      );
    }
    assert.equal(
      fs
        .readFileSync(path.join(ROOT, "public", mediaPaths[0]?.slice(1) ?? ""))
        .equals(
          fs.readFileSync(
            path.join(ROOT, "public", mediaPaths[1]?.slice(1) ?? ""),
          ),
        ),
      false,
    );

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_references reference
           JOIN source_items source ON source.id = reference.source_item_id
          WHERE reference.entity_id IN (?, ?)
            AND source.archive_url LIKE '%.planning/%'`,
        [PILOT_ID, CUSTOM_74_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(DISTINCT source.url) AS value
           FROM entity_references reference
           JOIN source_items source ON source.id = reference.source_item_id
          WHERE reference.entity_id = ?
            AND source.url IN (
              'https://www.pilot-custom.jp/en/history/',
              'https://www.pilot-custom.jp/en/lineup/standard.html',
              'https://www.pilot-custom.jp/en/lineup/heritage.html',
              'https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000240&volumeName=00004',
              'https://www.pilotpen.eu/our-universes/fine-writing/custom/',
              'https://pilotpen.com.au/pens/custom-74',
              'https://www.pilot.co.jp/support/warranty/en/warranty_assets/pdf/fountain_con40_en.pdf',
              'https://www.gentlemanstationer.com/blog/2023/6/3/review-revisited-the-pilot-custom-74-fountain-pen',
              'https://www.penaddict.com/blog/2026/6/12/pilot-custom-74-ranking-the-nibs'
            )`,
        [CUSTOM_74_ID],
      ),
      9,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM publication_v2_source_group_counts
          WHERE entity_id IN (?, ?)
            AND primary_archive_group_count >= 1
            AND professional_secondary_group_count >= 1`,
        [PILOT_ID, CUSTOM_74_ID],
      ),
      2,
    );

    const revisionsBeforeReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id`,
      args: [PILOT_ID, CUSTOM_74_ID],
    });
    const replay = await applyPhase26PilotContent(client, applyOptions);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    const revisionsAfterReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id`,
      args: [PILOT_ID, CUSTOM_74_ID],
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
