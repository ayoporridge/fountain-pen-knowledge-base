import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase29SailorContent } from "../../scripts/apply-phase29-sailor-content";
import { applyPhase31SailorP0Content } from "../../scripts/apply-phase31-sailor-p0-content";
import {
  PHASE31_PRO_GEAR_ID,
  PHASE31_PROFIT_14_ID,
  PHASE31_PROFIT_18_ID,
  PHASE31_RETIRED_PRO_GEAR_ID,
  PHASE31_SAILOR_BRAND_ID,
} from "../../scripts/data/phase31-sailor-p0";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { getCanonicalEntityPath } from "../../src/lib/entity-redirects";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PHASE29_1911_STANDARD_ID = "GXGa7rK83Jmi";
const TARGET_IDS = [
  PHASE31_SAILOR_BRAND_ID,
  PHASE31_PRO_GEAR_ID,
  PHASE31_PROFIT_14_ID,
  PHASE31_PROFIT_18_ID,
] as const;

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

async function topologySnapshot(client: Client): Promise<unknown> {
  const result = await client.execute({
    sql: `SELECT
            (SELECT count(*) FROM entities) AS entities,
            (SELECT count(*) FROM entity_links) AS links,
            (SELECT count(*) FROM entity_redirects) AS redirects,
            (SELECT count(*) FROM taxonomy_batches) AS batches,
            (SELECT count(*) FROM taxonomy_actions) AS actions,
            (SELECT count(*) FROM entity_lineage) AS lineage`,
  });
  return result.rows.map((row) => ({ ...row }));
}

test("Phase 31 publishes Sailor Professional Gear, Profit 14, and Profit 18 from an owned checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase31-sailor-p0-")),
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

    const duplicateBefore = await client.execute({
      sql: "SELECT body_md FROM entities WHERE id = ?",
      args: [PHASE31_RETIRED_PRO_GEAR_ID],
    });
    assert.equal(duplicateBefore.rows.length, 1);
    const duplicateBodyBefore = String(duplicateBefore.rows[0]?.body_md);
    assert.match(duplicateBodyBefore, /21K比14K软一点点/);

    const applyOptions = {
      workspaceRoot: ROOT,
      reviewer: "phase31-sailor-p0-curated-content",
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

    const topologyBeforeRejectedApply = await topologySnapshot(client);
    await assert.rejects(
      applyPhase31SailorP0Content(client, {
        ...applyOptions,
        env: {
          ...applyOptions.env,
          FPKG_DATABASE_URL: "file:unauthorized-phase31-selection",
        },
      }),
      /refuses inherited remote database selection: FPKG_DATABASE_URL/,
    );
    assert.deepEqual(
      await topologySnapshot(client),
      topologyBeforeRejectedApply,
    );

    await applyPhase29SailorContent(client, {
      ...applyOptions,
      reviewer: "phase29-sailor-prerequisite",
    });
    const standardPublicationBefore = await client.execute({
      sql: `SELECT status, content_revision
              FROM entity_publications
             WHERE entity_id = ?`,
      args: [PHASE29_1911_STANDARD_ID],
    });
    assert.equal(standardPublicationBefore.rows.length, 1);
    assert.equal(
      String(standardPublicationBefore.rows[0]?.status),
      "published",
    );
    assert.ok(Number(standardPublicationBefore.rows[0]?.content_revision) > 0);
    const first = await applyPhase31SailorP0Content(client, applyOptions);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      TARGET_IDS.map((entityId) => [entityId, "published"]),
    );

    const publicRows = await client.execute({
      sql: `SELECT id, slug, name, length(summary) AS summary_length,
                   length(body_md) AS body_length, body_md
              FROM public_entities
             WHERE id IN (?, ?, ?, ?)`,
      args: [...TARGET_IDS],
    });
    const publicById = new Map(
      publicRows.rows.map((row) => [String(row.id), row]),
    );
    assert.equal(publicById.size, 4);
    assert.deepEqual(
      TARGET_IDS.map((id) => [
        id,
        String(publicById.get(id)?.slug),
        String(publicById.get(id)?.name),
      ]),
      [
        [PHASE31_SAILOR_BRAND_ID, "sailor", "写乐 Sailor"],
        [
          PHASE31_PRO_GEAR_ID,
          "sailor-pro-gear",
          "Sailor Professional Gear 21K",
        ],
        [PHASE31_PROFIT_14_ID, "sailor-profit-14", "Sailor Profit 14"],
        [PHASE31_PROFIT_18_ID, "sailor-profit-18", "Sailor Profit 18"],
      ],
    );
    assert.ok(
      Number(publicById.get(PHASE31_SAILOR_BRAND_ID)?.body_length) >= 1_200,
    );
    for (const id of [
      PHASE31_PRO_GEAR_ID,
      PHASE31_PROFIT_14_ID,
      PHASE31_PROFIT_18_ID,
    ]) {
      assert.ok(Number(publicById.get(id)?.body_length) >= 2_000);
    }
    for (const row of publicRows.rows) {
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.summary_length) <= 160);
      assert.doesNotMatch(
        String(row.body_md),
        /\b(?:canonical|made_by|market_sku|slug)\b|数据库|仓库/i,
      );
    }

    const proGearBody = String(publicById.get(PHASE31_PRO_GEAR_ID)?.body_md);
    const profit14Body = String(publicById.get(PHASE31_PROFIT_14_ID)?.body_md);
    const profit18Body = String(publicById.get(PHASE31_PROFIT_18_ID)?.body_md);
    assert.match(
      proGearBody,
      /11-2036[\s\S]*11-2037[\s\S]*21K 大型双色[\s\S]*φ18.*129 mm[\s\S]*21\.6 g/,
    );
    assert.match(proGearBody, /Gold IP[\s\S]*nickel chrome/);
    assert.match(proGearBody, /2003[\s\S]*家族[\s\S]*不能单独证明当前 11-2036/);
    assert.match(proGearBody, /2011[\s\S]*家族外观的历史样本/);
    assert.match(proGearBody, /¥77,000[\s\S]*¥79,200/);
    assert.doesNotMatch(proGearBody, /21K比14K软一点点/);

    assert.match(
      profit14Body,
      /2025-12-03[\s\S]*2025-12-13[\s\S]*14K 大型[\s\S]*Black[\s\S]*Red[\s\S]*Blue[\s\S]*Green/,
    );
    assert.match(profit14Body, /¥55,000[\s\S]*¥57,200/);
    assert.match(profit14Body, /不是产品照片/);
    assert.match(profit14Body, /不含 Sailor logo/);
    assert.match(profit14Body, /可验证笔尖刻字/);
    assert.match(profit14Body, /不足以推出.*客观更硬/);

    assert.match(
      profit18Body,
      /2025-12-03[\s\S]*2025-12-13[\s\S]*18K 大型[\s\S]*Shining Black[\s\S]*Shining Red[\s\S]*Shining Blue[\s\S]*Shining Green/,
    );
    assert.match(profit18Body, /珠光粒子[\s\S]*Gold IP/);
    assert.match(profit18Body, /¥66,000[\s\S]*¥68,200/);
    assert.match(profit18Body, /不是产品照片/);
    assert.match(profit18Body, /不含 Sailor logo/);
    assert.match(profit18Body, /可验证笔尖刻字/);
    assert.match(profit18Body, /不足以证明.*客观更软/);

    const duplicateAfter = await client.execute({
      sql: `SELECT entity.body_md, publication.status,
                   publication.blockers_json, publication.review_notes
              FROM entities entity
              JOIN entity_publications publication
                ON publication.entity_id = entity.id
             WHERE entity.id = ?`,
      args: [PHASE31_RETIRED_PRO_GEAR_ID],
    });
    assert.equal(String(duplicateAfter.rows[0]?.body_md), duplicateBodyBefore);
    assert.equal(String(duplicateAfter.rows[0]?.status), "retired");
    assert.equal(
      String(duplicateAfter.rows[0]?.blockers_json),
      '["canonical_redirect"]',
    );
    assert.match(
      String(duplicateAfter.rows[0]?.review_notes),
      /no payload migrated/,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value FROM entity_lineage
          WHERE source_entity_id = ? AND target_entity_id = ?
            AND lineage_kind = 'retire'`,
        [PHASE31_RETIRED_PRO_GEAR_ID, PHASE31_PRO_GEAR_ID],
      ),
      1,
    );

    const redirects = await client.execute({
      sql: `SELECT source_path, target_path, redirect_kind
              FROM entity_redirects
             WHERE source_path = '/pen/写乐-sailor-21k-pro-gear-大鱼雷'`,
    });
    assert.deepEqual(
      redirects.rows.map((row) => [
        String(row.source_path),
        String(row.target_path),
        String(row.redirect_kind),
      ]),
      [
        [
          "/pen/写乐-sailor-21k-pro-gear-大鱼雷",
          "/pen/sailor-pro-gear",
          "permanent",
        ],
      ],
    );
    assert.equal(
      getCanonicalEntityPath("pen", "写乐-sailor-21k-pro-gear-大鱼雷"),
      "/pen/sailor-pro-gear",
    );

    for (const modelId of [
      PHASE31_PRO_GEAR_ID,
      PHASE31_PROFIT_14_ID,
      PHASE31_PROFIT_18_ID,
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
          [modelId, PHASE31_SAILOR_BRAND_ID],
        ),
        1,
      );
    }
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value FROM entity_links
          WHERE source_id = ? AND link_type = 'made_by'`,
        [PHASE31_RETIRED_PRO_GEAR_ID],
      ),
      0,
    );

    const publicModels = await client.execute({
      sql: `SELECT pen.id
              FROM entity_links link
              JOIN public_entities pen ON pen.id = link.source_id
             WHERE link.target_id = ? AND link.link_type = 'made_by'
             ORDER BY pen.id`,
      args: [PHASE31_SAILOR_BRAND_ID],
    });
    assert.deepEqual(
      new Set(publicModels.rows.map((row) => String(row.id))),
      new Set([
        PHASE29_1911_STANDARD_ID,
        PHASE31_PRO_GEAR_ID,
        PHASE31_PROFIT_14_ID,
        PHASE31_PROFIT_18_ID,
      ]),
    );

    const standardPublicationAfter = await client.execute({
      sql: `SELECT status, content_revision
              FROM entity_publications
             WHERE entity_id = ?`,
      args: [PHASE29_1911_STANDARD_ID],
    });
    assert.deepEqual(
      standardPublicationAfter.rows.map((row) => [
        String(row.status),
        Number(row.content_revision),
      ]),
      standardPublicationBefore.rows.map((row) => [
        String(row.status),
        Number(row.content_revision),
      ]),
    );

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value FROM media_assets
          WHERE id IN (
            'media-commons-b743b35c943997',
            'media-commons-c022ffa38969d0',
            'media-official-a2e066ea55bf93'
          )`,
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_references reference
           JOIN source_items source ON source.id = reference.source_item_id
          WHERE reference.entity_id = ?
            AND (source.id = 'source-sailor-1911-1521-official'
                 OR source.url LIKE '%/11-1521/%')`,
        [PHASE31_PRO_GEAR_ID],
      ),
      0,
    );

    const independentReferences = await client.execute({
      sql: `SELECT reference.entity_id, source.url, source.source_tier
              FROM entity_references reference
              JOIN source_items source ON source.id = reference.source_item_id
             WHERE reference.entity_id IN (?, ?, ?)
               AND source.source_tier = 'professional_secondary'
             ORDER BY reference.entity_id, source.url`,
      args: [PHASE31_PRO_GEAR_ID, PHASE31_PROFIT_14_ID, PHASE31_PROFIT_18_ID],
    });
    assert.deepEqual(
      new Set(
        independentReferences.rows.map(
          (row) => `${String(row.entity_id)}\u0000${String(row.url)}`,
        ),
      ),
      new Set([
        `${PHASE31_PRO_GEAR_ID}\u0000https://www.parkablogs.com/picture/review-sailor-professional-gear-medium-nib`,
        `${PHASE31_PROFIT_14_ID}\u0000https://www.biccamera.com/bc/item/14770924/`,
        `${PHASE31_PROFIT_18_ID}\u0000https://www.biccamera.com/bc/item/14770945/`,
      ]),
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_references reference
           JOIN source_items source ON source.id = reference.source_item_id
          WHERE reference.entity_id IN (?, ?, ?)
            AND lower(source.url) LIKE '%penaddict%'`,
        [PHASE31_PRO_GEAR_ID, PHASE31_PROFIT_14_ID, PHASE31_PROFIT_18_ID],
      ),
      0,
    );

    const specs = await client.execute({
      sql: `SELECT entity_id, brand_entity_id, series_name, release_year,
                   nib, fill_system, material, dimensions, weight,
                   price_range, status
              FROM model_specs
             WHERE entity_id IN (?, ?, ?)
               AND review_status = 'approved'`,
      args: [PHASE31_PRO_GEAR_ID, PHASE31_PROFIT_14_ID, PHASE31_PROFIT_18_ID],
    });
    const specById = new Map(
      specs.rows.map((row) => [String(row.entity_id), row]),
    );
    assert.equal(specById.size, 3);
    for (const row of specs.rows) {
      assert.equal(String(row.brand_entity_id), PHASE31_SAILOR_BRAND_ID);
      assert.match(String(row.fill_system), /墨囊／上墨器两用式/);
      assert.equal(String(row.weight), "21.6 g");
    }
    const proGearSpec = specById.get(PHASE31_PRO_GEAR_ID);
    assert.equal(proGearSpec?.release_year, null);
    assert.match(String(proGearSpec?.series_name), /11-2036／11-2037/);
    assert.match(String(proGearSpec?.nib), /21K 大型双色.*EF.*MS/);
    assert.match(String(proGearSpec?.material), /Gold IP.*nickel chrome/);
    assert.match(String(proGearSpec?.dimensions), /φ18 mm.*129 mm/);
    assert.match(
      String(proGearSpec?.price_range),
      /2026-07-19.*¥77,000.*¥79,200/,
    );

    const profit14Spec = specById.get(PHASE31_PROFIT_14_ID);
    assert.equal(String(profit14Spec?.release_year), "2025");
    assert.match(String(profit14Spec?.series_name), /11-1214/);
    assert.match(String(profit14Spec?.nib), /14K 大型.*EF.*MS/);
    assert.match(String(profit14Spec?.material), /Black.*Green.*Gold IP/);
    assert.match(String(profit14Spec?.dimensions), /φ18 mm.*141 mm/);
    assert.match(
      String(profit14Spec?.price_range),
      /2026-07-19.*¥55,000.*¥57,200/,
    );

    const profit18Spec = specById.get(PHASE31_PROFIT_18_ID);
    assert.equal(String(profit18Spec?.release_year), "2025");
    assert.match(String(profit18Spec?.series_name), /11-2218/);
    assert.match(String(profit18Spec?.nib), /18K 大型.*EF.*MS/);
    assert.match(
      String(profit18Spec?.material),
      /珠光粒子.*Shining PMMA.*Gold IP/,
    );
    assert.match(String(profit18Spec?.dimensions), /φ18 mm.*141 mm/);
    assert.match(
      String(profit18Spec?.price_range),
      /2026-07-19.*¥66,000.*¥68,200/,
    );

    const variants = await client.execute({
      sql: `SELECT model_entity_id, variant_name, variant_kind, market,
                   product_code
              FROM model_variants
             WHERE model_entity_id IN (?, ?, ?)
             ORDER BY model_entity_id, variant_name`,
      args: [PHASE31_PRO_GEAR_ID, PHASE31_PROFIT_14_ID, PHASE31_PROFIT_18_ID],
    });
    const variantsFor = (entityId: string) =>
      variants.rows.filter((row) => String(row.model_entity_id) === entityId);
    assert.deepEqual(
      new Set(
        variantsFor(PHASE31_PRO_GEAR_ID).map((row) => String(row.product_code)),
      ),
      new Set([
        "11-2036-120/220/320/420/620/720/920",
        "11-2037-120/220/320/420/620/720/920",
      ]),
    );
    assert.deepEqual(
      new Set(
        variantsFor(PHASE31_PROFIT_14_ID).map((row) =>
          String(row.product_code),
        ),
      ),
      new Set([
        "11-1214-120/220/320/420/620/720/920",
        "11-1214-130/230/330/430/630/730/930",
        "11-1214-140/240/340/440/640/740/940",
        "11-1214-160/260/360/460/660/760/960",
      ]),
    );
    assert.deepEqual(
      new Set(
        variantsFor(PHASE31_PROFIT_18_ID).map((row) =>
          String(row.product_code),
        ),
      ),
      new Set([
        "11-2218-120/220/320/420/620/720/920",
        "11-2218-130/230/330/430/630/730/930",
        "11-2218-140/240/340/440/640/740/940",
        "11-2218-160/260/360/460/660/760/960",
      ]),
    );
    assert.ok(
      variants.rows.every(
        (row) =>
          String(row.variant_kind) === "market_sku" &&
          String(row.market) === "日本",
      ),
    );

    const timeline = await client.execute({
      sql: `SELECT entity_id, start_date, event_type
              FROM timeline_events
             WHERE entity_id IN (?, ?, ?)
             ORDER BY entity_id, start_date`,
      args: [PHASE31_PRO_GEAR_ID, PHASE31_PROFIT_14_ID, PHASE31_PROFIT_18_ID],
    });
    assert.deepEqual(
      timeline.rows
        .filter((row) => String(row.entity_id) === PHASE31_PRO_GEAR_ID)
        .map((row) => [String(row.start_date), String(row.event_type)]),
      [["2003", "design_milestone"]],
    );
    for (const modelId of [PHASE31_PROFIT_14_ID, PHASE31_PROFIT_18_ID]) {
      assert.deepEqual(
        timeline.rows
          .filter((row) => String(row.entity_id) === modelId)
          .map((row) => [String(row.start_date), String(row.event_type)]),
        [
          ["2025-12-03", "design_milestone"],
          ["2025-12-13", "model_released"],
        ],
      );
    }

    const media = await client.execute({
      sql: `SELECT entity_id, local_path, author, license, source_url,
                   attribution_text, usage_status
              FROM media_assets
             WHERE entity_id IN (?, ?, ?)
             ORDER BY entity_id, usage_status`,
      args: [PHASE31_PRO_GEAR_ID, PHASE31_PROFIT_14_ID, PHASE31_PROFIT_18_ID],
    });
    const proGearMedia = media.rows.filter(
      (row) => String(row.entity_id) === PHASE31_PRO_GEAR_ID,
    );
    assert.equal(proGearMedia.length, 3);
    assert.deepEqual(
      new Set(proGearMedia.map((row) => String(row.usage_status))),
      new Set(["primary", "gallery"]),
    );
    const proGearPrimary = proGearMedia.find(
      (row) => String(row.usage_status) === "primary",
    );
    assert.equal(
      String(proGearPrimary?.author),
      "Fountain Pen Graph editorial",
    );
    assert.equal(String(proGearPrimary?.license), "site-original");
    assert.equal(
      String(proGearPrimary?.local_path),
      "/images/library/site-original/sailor-p0/sailor-professional-gear-21k-factual.svg",
    );
    assert.match(String(proGearPrimary?.attribution_text), /非产品照片/);
    const proGearHistoryMedia = proGearMedia.filter(
      (row) => String(row.usage_status) === "gallery",
    );
    assert.equal(proGearHistoryMedia.length, 2);
    for (const row of proGearHistoryMedia) {
      assert.equal(String(row.author), "semihundido");
      assert.equal(String(row.license), "cc-by-sa-2.0");
      assert.match(String(row.source_url), /flickr\.com\/photos\/wasteofspace/);
      assert.match(String(row.attribution_text), /CC BY-SA 2\.0/);
      assert.match(String(row.attribution_text), /相同许可共享/);
      assert.match(String(row.attribution_text), /不证明.*当前|不证明现行/);
    }
    for (const modelId of [PHASE31_PROFIT_14_ID, PHASE31_PROFIT_18_ID]) {
      const modelMedia = media.rows.filter(
        (row) => String(row.entity_id) === modelId,
      );
      assert.equal(modelMedia.length, 1);
      assert.equal(String(modelMedia[0]?.usage_status), "primary");
      assert.equal(String(modelMedia[0]?.license), "site-original");
      assert.match(String(modelMedia[0]?.local_path), /\.svg$/);
      assert.match(
        String(modelMedia[0]?.attribution_text),
        /非 Sailor 产品照片/,
      );
      assert.match(String(modelMedia[0]?.attribution_text), /不含 Sailor logo/);
      assert.match(
        String(modelMedia[0]?.attribution_text),
        /未复制 Sailor 官网图片/,
      );
    }
    for (const row of media.rows) {
      const assetPath = path.join(
        ROOT,
        "public",
        String(row.local_path).replace(/^\//, ""),
      );
      assert.ok(fs.statSync(assetPath).isFile());
      assert.ok(fs.statSync(assetPath).size > 2_000);
    }

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM publication_v2_source_group_counts
          WHERE entity_id IN (?, ?, ?, ?)
            AND primary_archive_group_count >= 1
            AND professional_secondary_group_count >= 1`,
        [...TARGET_IDS],
      ),
      4,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_references reference
           JOIN source_items source ON source.id = reference.source_item_id
          WHERE reference.entity_id IN (?, ?, ?, ?)
            AND source.archive_url LIKE '%.planning/%'`,
        [...TARGET_IDS],
      ),
      0,
    );

    const revisionsBeforeReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [...TARGET_IDS, PHASE31_RETIRED_PRO_GEAR_ID],
    });
    const replay = await applyPhase31SailorP0Content(client, applyOptions);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop", "noop"],
    );
    const revisionsAfterReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [...TARGET_IDS, PHASE31_RETIRED_PRO_GEAR_ID],
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
