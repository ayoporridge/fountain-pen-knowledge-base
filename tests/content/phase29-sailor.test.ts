import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase29SailorContent } from "../../scripts/apply-phase29-sailor-content";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { getCanonicalEntityPath } from "../../src/lib/entity-redirects";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const SAILOR_ID = "ce2dcqixqSCx";
const STANDARD_ID = "GXGa7rK83Jmi";

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 29 publishes only Sailor and canonical 11-1219 from an owned checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase29-sailor-")),
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
      reviewer: "phase29-sailor-curated-content",
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

    const first = await applyPhase29SailorContent(client, applyOptions);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [SAILOR_ID, "published"],
        [STANDARD_ID, "published"],
      ],
    );

    const publicRows = await client.execute({
      sql: `SELECT id, slug, name, length(summary) AS summary_length,
                   length(body_md) AS body_length, body_md
              FROM public_entities
             WHERE id IN (?, ?)
             ORDER BY CASE id WHEN ? THEN 0 ELSE 1 END`,
      args: [SAILOR_ID, STANDARD_ID, SAILOR_ID],
    });
    assert.deepEqual(
      publicRows.rows.map((row) => [
        String(row.id),
        String(row.slug),
        String(row.name),
      ]),
      [
        [SAILOR_ID, "sailor", "写乐 Sailor"],
        [
          STANDARD_ID,
          "sailor-1911-standard",
          "Sailor 1911 Standard / Profit Standard",
        ],
      ],
    );
    assert.ok(Number(publicRows.rows[0]?.body_length) >= 1_200);
    assert.ok(Number(publicRows.rows[1]?.body_length) >= 2_000);
    for (const row of publicRows.rows) {
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.summary_length) <= 160);
      assert.doesNotMatch(
        String(row.body_md),
        /\b(?:canonical|made_by|market_sku|slug|retired)\b|数据库|仓库/i,
      );
    }
    assert.match(String(publicRows.rows[0]?.body_md), /旧英文.*不是.*完整镜像/);
    assert.match(String(publicRows.rows[0]?.body_md), /数量会随着后续研究增加/);
    assert.match(
      String(publicRows.rows[1]?.body_md),
      /11-1521.*21K.*不是 11-1219/,
    );
    assert.match(
      String(publicRows.rows[1]?.body_md),
      /不自行创造“1911 14／1911 18”/,
    );
    assert.match(
      String(publicRows.rows[1]?.body_md),
      /AI 辅助制作.*不是 11-1219 产品实拍/,
    );

    assert.equal(
      getCanonicalEntityPath("pen", "写乐-sailor-1219标准鱼雷"),
      "/pen/sailor-1911-standard",
    );

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links
          WHERE source_id = ? AND link_type = 'made_by'`,
        [STANDARD_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links
          WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
        [STANDARD_ID, SAILOR_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links link
           JOIN entities pen ON pen.id = link.source_id AND pen.type = 'pen'
          WHERE link.target_id = ? AND link.link_type = 'made_by'`,
        [SAILOR_ID],
      ),
      12,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links link
           JOIN public_entities pen ON pen.id = link.source_id
          WHERE link.target_id = ? AND link.link_type = 'made_by'`,
        [SAILOR_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links link
           JOIN entities pen ON pen.id = link.source_id AND pen.type = 'pen'
           JOIN entity_publications publication ON publication.entity_id = pen.id
          WHERE link.target_id = ?
            AND link.link_type = 'made_by'
            AND pen.id <> ?
            AND publication.status = 'draft'`,
        [SAILOR_ID, STANDARD_ID],
      ),
      11,
    );

    const publicModels = await client.execute({
      sql: `SELECT pen.id, pen.slug, pen.name
              FROM entity_links link
              JOIN public_entities pen ON pen.id = link.source_id
             WHERE link.target_id = ? AND link.link_type = 'made_by'
             ORDER BY pen.id`,
      args: [SAILOR_ID],
    });
    assert.deepEqual(
      publicModels.rows.map((row) => [
        String(row.id),
        String(row.slug),
        String(row.name),
      ]),
      [
        [
          STANDARD_ID,
          "sailor-1911-standard",
          "Sailor 1911 Standard / Profit Standard",
        ],
      ],
    );

    const spec = await client.execute({
      sql: `SELECT brand_entity_id, series_name, release_year, nib, fill_system,
                   material, dimensions, weight, price_range, status
              FROM model_specs
             WHERE entity_id = ? AND review_status = 'approved'`,
      args: [STANDARD_ID],
    });
    assert.equal(spec.rows.length, 1);
    assert.equal(String(spec.rows[0]?.brand_entity_id), SAILOR_ID);
    assert.equal(
      String(spec.rows[0]?.series_name),
      "Sailor Profit / 1911 — Standard 14K（11-1219）",
    );
    assert.equal(spec.rows[0]?.release_year, null);
    assert.equal(
      String(spec.rows[0]?.nib),
      "14K 中型金尖；EF、F、MF、M、B、Z、MS",
    );
    assert.match(String(spec.rows[0]?.fill_system), /墨囊／上墨器两用式/);
    assert.match(String(spec.rows[0]?.material), /PMMA.*Gold IP/);
    assert.equal(
      String(spec.rows[0]?.dimensions),
      "最大径 φ17 mm × 全长 135 mm（含笔夹）",
    );
    assert.match(String(spec.rows[0]?.weight), /17\.0 g/);
    assert.match(
      String(spec.rows[0]?.price_range),
      /2026-07-19.*¥44,000.*¥46,200/,
    );
    assert.match(String(spec.rows[0]?.status), /Ivory、Black、Maroon/);
    assert.equal(
      await scalar(
        client,
        `SELECT count(DISTINCT evidence.field_key) AS value
           FROM spec_field_evidence evidence
           JOIN model_specs spec ON spec.id = evidence.model_spec_id
          WHERE spec.entity_id = ? AND evidence.review_status = 'approved'`,
        [STANDARD_ID],
      ),
      9,
    );

    const variants = await client.execute({
      sql: `SELECT variant_name, variant_kind, market, product_code, notes
              FROM model_variants
             WHERE model_entity_id = ?
             ORDER BY variant_name`,
      args: [STANDARD_ID],
    });
    assert.deepEqual(
      variants.rows.map((row) => String(row.variant_name)),
      ["日本现行 Black", "日本现行 Ivory", "日本现行 Maroon"],
    );
    assert.ok(
      variants.rows.every(
        (row) =>
          String(row.variant_kind) === "market_sku" &&
          String(row.market) === "日本" &&
          /^11-1219-/.test(String(row.product_code)),
      ),
    );
    assert.ok(
      variants.rows.every(
        (row) =>
          !/11-1521|11-1029|11-2021|11-2024|11-1214|11-2218/.test(
            `${String(row.product_code)} ${String(row.notes)}`,
          ),
      ),
    );

    const aliases = await client.execute({
      sql: `SELECT alias
              FROM entity_aliases
             WHERE entity_id = ?
             ORDER BY alias`,
      args: [STANDARD_ID],
    });
    assert.deepEqual(
      aliases.rows.map((row) => String(row.alias)),
      [
        "Sailor 1911 S",
        "Sailor 1911 Standard",
        "Sailor Profit Standard",
        "プロフィット スタンダード",
        "写乐 Sailor 1219 标准鱼雷",
      ].sort(),
    );
    assert.ok(
      aliases.rows.every(
        (row) =>
          !/Pro Gear|Professional Gear|21K|11-1521/.test(String(row.alias)),
      ),
    );

    const media = await client.execute({
      sql: `SELECT entity_id, title, local_path, author, license,
                   attribution_text, source_url, usage_status
              FROM media_assets
             WHERE entity_id IN (?, ?)
             ORDER BY CASE entity_id WHEN ? THEN 0 ELSE 1 END,
                      CASE usage_status WHEN 'primary' THEN 0 ELSE 1 END`,
      args: [SAILOR_ID, STANDARD_ID, SAILOR_ID],
    });
    assert.equal(media.rows.length, 3);
    const brandMedia = media.rows.find(
      (row) => String(row.entity_id) === SAILOR_ID,
    );
    const penPrimary = media.rows.find(
      (row) =>
        String(row.entity_id) === STANDARD_ID &&
        String(row.usage_status) === "primary",
    );
    const penGallery = media.rows.find(
      (row) =>
        String(row.entity_id) === STANDARD_ID &&
        String(row.usage_status) === "gallery",
    );
    assert.equal(
      String(brandMedia?.local_path),
      "/images/library/warm-pen-atlas/sailor-brand-cover.jpg",
    );
    assert.equal(String(brandMedia?.license), "site-original");
    assert.match(
      String(brandMedia?.attribution_text),
      /OpenAI.*非 Sailor 产品实拍/,
    );
    assert.equal(
      String(penPrimary?.local_path),
      "/images/library/site-original/sailor/sailor-1911-standard-14k-editorial.jpg",
    );
    assert.equal(String(penPrimary?.license), "site-original");
    assert.match(String(penPrimary?.title), /AI 辅助.*非产品实拍/);
    assert.match(
      String(penPrimary?.attribution_text),
      /不包含 Sailor 锚形商标/,
    );
    assert.equal(
      String(penGallery?.local_path),
      "/images/library/wikimedia/sailor/sailor-1911-standard-21k-zoom.jpg",
    );
    assert.equal(String(penGallery?.author), "Mehmet Pinarci");
    assert.equal(String(penGallery?.license), "cc-by-2.0");
    assert.match(String(penGallery?.title), /21K.*非 14K 11-1219/);
    assert.match(
      String(penGallery?.attribution_text),
      /未缩放、未裁切、未调色/,
    );
    assert.match(
      String(penGallery?.source_url),
      /commons\.wikimedia\.org.*Sailor_1911_Standard_21K_Zoom_nib/,
    );
    for (const row of media.rows) {
      const localPath = String(row.local_path);
      assert.ok(
        fs.statSync(path.join(ROOT, "public", localPath.slice(1))).isFile(),
      );
    }
    assert.notEqual(
      fs
        .readFileSync(
          path.join(ROOT, "public", String(penPrimary?.local_path).slice(1)),
        )
        .compare(
          fs.readFileSync(
            path.join(ROOT, "public", String(penGallery?.local_path).slice(1)),
          ),
        ),
      0,
    );

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_references reference
           JOIN source_items source ON source.id = reference.source_item_id
          WHERE reference.entity_id IN (?, ?)
            AND source.archive_url LIKE '%.planning/%'`,
        [SAILOR_ID, STANDARD_ID],
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
        [SAILOR_ID, STANDARD_ID],
      ),
      2,
    );

    const brandTimelineCount = await scalar(
      client,
      `SELECT count(*) AS value FROM timeline_events WHERE entity_id = ?`,
      [SAILOR_ID],
    );
    assert.equal(brandTimelineCount, 7);

    const revisionsBeforeReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id`,
      args: [SAILOR_ID, STANDARD_ID],
    });
    const replay = await applyPhase29SailorContent(client, applyOptions);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    const revisionsAfterReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id`,
      args: [SAILOR_ID, STANDARD_ID],
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
