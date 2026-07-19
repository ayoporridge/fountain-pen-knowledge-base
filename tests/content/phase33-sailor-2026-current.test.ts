import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase29SailorContent } from "../../scripts/apply-phase29-sailor-content";
import { applyPhase31SailorP0Content } from "../../scripts/apply-phase31-sailor-p0-content";
import { applyPhase33Sailor2026CurrentContent } from "../../scripts/apply-phase33-sailor-2026-current-content";
import {
  PHASE31_PRO_GEAR_ID,
  PHASE31_PROFIT_14_ID,
  PHASE31_PROFIT_18_ID,
} from "../../scripts/data/phase31-sailor-p0";
import {
  PHASE33_ANCHOR_ID,
  PHASE33_PGS21_ID,
  PHASE33_PROFIT_REALO18_ID,
  PHASE33_SAILOR_BRAND_ID,
} from "../../scripts/data/phase33-sailor-2026-current";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PHASE29_1911_STANDARD_ID = "GXGa7rK83Jmi";
const TARGET_IDS = [
  PHASE33_SAILOR_BRAND_ID,
  PHASE33_PGS21_ID,
  PHASE33_PROFIT_REALO18_ID,
  PHASE33_ANCHOR_ID,
] as const;
const NEW_MODEL_IDS = [
  PHASE33_PGS21_ID,
  PHASE33_PROFIT_REALO18_ID,
  PHASE33_ANCHOR_ID,
] as const;
const PRESERVED_MODEL_IDS = [
  PHASE29_1911_STANDARD_ID,
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
            (SELECT count(*) FROM entity_publications) AS publications,
            (SELECT count(*) FROM source_items) AS sources`,
  });
  return result.rows.map((row) => ({ ...row }));
}

async function publicationSnapshot(
  client: Client,
  ids: readonly string[],
): Promise<unknown> {
  const placeholders = ids.map(() => "?").join(", ");
  const result = await client.execute({
    sql: `SELECT entity_id, status, content_revision, approved_content_hash
            FROM entity_publications
           WHERE entity_id IN (${placeholders})
           ORDER BY entity_id`,
    args: [...ids],
  });
  return result.rows.map((row) => ({ ...row }));
}

test("Phase 33 publishes the 2026 Sailor current pack from owned checkpoint copies", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase33-sailor-current-")),
  );
  const collisionRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase33-sailor-collision-")),
  );
  const databasePath = path.join(ownedRoot, "catalog.db");
  const collisionPath = path.join(collisionRoot, "catalog.db");
  const copy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    databasePath,
    ownedRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const collisionCopy = copyCheckpointedCatalogToDisposableCopy(
    REAL_CATALOG,
    collisionPath,
    collisionRoot,
    { expectedSourceSnapshot: protectedSnapshot },
  );
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const collisionClient = createClient({
    url: `file:${collisionCopy.destinationPath}`,
  });

  try {
    await migrateDatabase(client);
    await migrateDatabase(collisionClient);

    const applyOptions = {
      workspaceRoot: ROOT,
      reviewer: "phase33-sailor-2026-current-curated-content",
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
      applyPhase33Sailor2026CurrentContent(client, {
        ...applyOptions,
        env: {
          ...applyOptions.env,
          FPKG_DATABASE_URL: "file:unauthorized-phase33-selection",
        },
      }),
      /refuses inherited remote database selection: FPKG_DATABASE_URL/,
    );
    assert.deepEqual(
      await topologySnapshot(client),
      topologyBeforeRejectedApply,
    );

    await collisionClient.execute({
      sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)",
      args: [
        "phase33-collision-probe",
        "sailor-professional-gear-slim-21",
        "Collision probe",
      ],
    });
    const collisionBefore = await topologySnapshot(collisionClient);
    await assert.rejects(
      applyPhase33Sailor2026CurrentContent(collisionClient, {
        ...applyOptions,
        reviewer: "phase33-collision-preflight",
        databasePath: collisionCopy.destinationPath,
        ownedRoot: collisionRoot,
      }),
      /entity\/slug collision for sailor-professional-gear-slim-21/,
    );
    assert.deepEqual(await topologySnapshot(collisionClient), collisionBefore);

    await applyPhase29SailorContent(client, {
      ...applyOptions,
      reviewer: "phase29-sailor-prerequisite",
    });
    await applyPhase31SailorP0Content(client, {
      ...applyOptions,
      reviewer: "phase31-sailor-p0-prerequisite",
    });
    const preservedBefore = await publicationSnapshot(
      client,
      PRESERVED_MODEL_IDS,
    );
    assert.equal(
      (preservedBefore as Array<unknown>).length,
      PRESERVED_MODEL_IDS.length,
    );

    const first = await applyPhase33Sailor2026CurrentContent(
      client,
      applyOptions,
    );
    assert.equal(first.entities.length, 4);
    assert.equal(first.entities[0]?.entityId, PHASE33_SAILOR_BRAND_ID);
    assert.ok(
      first.entities[0]?.outcome === "noop" ||
        first.entities[0]?.outcome === "published",
    );
    assert.deepEqual(
      first.entities
        .slice(1)
        .map((entity) => [entity.entityId, entity.outcome]),
      NEW_MODEL_IDS.map((entityId) => [entityId, "published"]),
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
      NEW_MODEL_IDS.map((id) => [
        id,
        String(publicById.get(id)?.slug),
        String(publicById.get(id)?.name),
      ]),
      [
        [
          PHASE33_PGS21_ID,
          "sailor-professional-gear-slim-21",
          "Sailor Professional Gear Slim 21",
        ],
        [
          PHASE33_PROFIT_REALO18_ID,
          "sailor-profit-realo-18",
          "Sailor Profit Realo 18",
        ],
        [
          PHASE33_ANCHOR_ID,
          "sailor-professional-gear-anchor",
          "Sailor Professional Gear Anchor",
        ],
      ],
    );
    for (const id of NEW_MODEL_IDS) {
      assert.ok(Number(publicById.get(id)?.summary_length) >= 60);
      assert.ok(Number(publicById.get(id)?.summary_length) <= 180);
      assert.ok(Number(publicById.get(id)?.body_length) >= 2_000);
      assert.doesNotMatch(
        String(publicById.get(id)?.body_md),
        /\b(?:canonical|made_by|market_sku|slug|retired)\b|数据库|仓库/i,
      );
    }

    const pgsBody = String(publicById.get(PHASE33_PGS21_ID)?.body_md);
    assert.match(
      pgsBody,
      /2026 年 3 月 14 日[\s\S]*11-2151-120[\s\S]*11-2151-920/,
    );
    assert.match(
      pgsBody,
      /21K 中型双色[\s\S]*φ17 mm × 全长 124 mm[\s\S]*16\.8 g/,
    );
    assert.match(pgsBody, /全尺寸[\s\S]*旧 14K Slim[\s\S]*Slim Mini/);
    assert.match(pgsBody, /11-2152[\s\S]*nickel chrome/);
    assert.doesNotMatch(
      pgsBody,
      /11-2151`?\s*(?:\*\*)?\s*(?:是|使用|搭载|配备)[^。\n]{0,40}21K 大型/,
    );

    const realoBody = String(
      publicById.get(PHASE33_PROFIT_REALO18_ID)?.body_md,
    );
    assert.match(
      realoBody,
      /2026 年 5 月 30 日[\s\S]*18K 大型[\s\S]*约 1\.5cc[\s\S]*150\.5 mm[\s\S]*26\.3 g/,
    );
    assert.match(realoBody, /11-3924[\s\S]*21K[\s\S]*1\.0cc[\s\S]*141 mm/);
    assert.match(realoBody, /Professional Gear Realo[\s\S]*11-3926/);
    assert.match(
      realoBody,
      /1911 REALO 18K Fountain Pen GT[\s\S]*同一商品代码/,
    );
    assert.match(realoBody, /墨囊与上墨器都不能使用/);

    const anchorBody = String(publicById.get(PHASE33_ANCHOR_ID)?.body_md);
    assert.match(
      anchorBody,
      /2025 年 12 月 3 日[\s\S]*12 月 13 日[\s\S]*11-5080[\s\S]*11-5081[\s\S]*11-5082/,
    );
    assert.match(anchorBody, /新帽顶[\s\S]*黄铜大先/);
    assert.match(anchorBody, /φ16 mm × 132\.7 mm[\s\S]*30\.0 g/);
    assert.match(anchorBody, /Gold IP[\s\S]*nickel chrome[\s\S]*Black IP/);
    assert.match(anchorBody, /不是普通 Pro Gear 换一套颜色/);

    for (const modelId of NEW_MODEL_IDS) {
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
          [modelId, PHASE33_SAILOR_BRAND_ID],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          `SELECT count(*) AS value FROM entity_links
            WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'`,
          [PHASE33_SAILOR_BRAND_ID, modelId],
        ),
        1,
      );
    }

    const publicModels = await client.execute({
      sql: `SELECT pen.id
              FROM entity_links link
              JOIN public_entities pen ON pen.id = link.source_id
             WHERE link.target_id = ? AND link.link_type = 'made_by'
             ORDER BY pen.id`,
      args: [PHASE33_SAILOR_BRAND_ID],
    });
    assert.deepEqual(
      new Set(publicModels.rows.map((row) => String(row.id))),
      new Set([...PRESERVED_MODEL_IDS, ...NEW_MODEL_IDS]),
    );

    assert.deepEqual(
      await publicationSnapshot(client, PRESERVED_MODEL_IDS),
      preservedBefore,
    );

    const aliases = await client.execute({
      sql: `SELECT entity_id, alias, language
              FROM entity_aliases
             WHERE entity_id IN (?, ?, ?)
             ORDER BY entity_id, alias`,
      args: [...NEW_MODEL_IDS],
    });
    assert.equal(aliases.rows.length, 12);
    assert.equal(
      aliases.rows.filter(
        (row) =>
          String(row.entity_id) === PHASE33_PROFIT_REALO18_ID &&
          String(row.alias) === "Sailor 1911 Realo 18K" &&
          String(row.language) === "en",
      ).length,
      1,
    );

    const references = await client.execute({
      sql: `SELECT reference.entity_id, source.url, source.source_tier
              FROM entity_references reference
              JOIN source_items source ON source.id = reference.source_item_id
             WHERE reference.entity_id IN (?, ?, ?)
             ORDER BY reference.entity_id, source.url`,
      args: [...NEW_MODEL_IDS],
    });
    const referenceKeys = new Set(
      references.rows.map(
        (row) => `${String(row.entity_id)}\u0000${String(row.url)}`,
      ),
    );
    for (const expected of [
      `${PHASE33_PGS21_ID}\u0000https://sailor.co.jp/product/11-2151/`,
      `${PHASE33_PGS21_ID}\u0000https://item.rakuten.co.jp/penroom/48416/`,
      `${PHASE33_PROFIT_REALO18_ID}\u0000https://sailor.co.jp/product/11-1853/`,
      `${PHASE33_PROFIT_REALO18_ID}\u0000https://en.sailor.co.jp/product/11-1853/`,
      `${PHASE33_PROFIT_REALO18_ID}\u0000https://item.rakuten.co.jp/auc-youstyle/you-sl-11-1722/`,
      `${PHASE33_ANCHOR_ID}\u0000https://sailor.co.jp/product/11-5080/`,
      `${PHASE33_ANCHOR_ID}\u0000https://sailor.co.jp/product/11-5081/`,
      `${PHASE33_ANCHOR_ID}\u0000https://sailor.co.jp/product/11-5082/`,
      `${PHASE33_ANCHOR_ID}\u0000https://item.rakuten.co.jp/penroom/48288/`,
    ]) {
      assert.ok(referenceKeys.has(expected), `missing reference ${expected}`);
    }
    assert.equal(
      references.rows.filter(
        (row) => String(row.source_tier) === "professional_secondary",
      ).length,
      3,
    );

    const specs = await client.execute({
      sql: `SELECT entity_id, brand_entity_id, series_name, release_year,
                   nib, fill_system, material, dimensions, weight,
                   price_range, status
              FROM model_specs
             WHERE entity_id IN (?, ?, ?)
               AND review_status = 'approved'`,
      args: [...NEW_MODEL_IDS],
    });
    const specById = new Map(
      specs.rows.map((row) => [String(row.entity_id), row]),
    );
    assert.equal(specById.size, 3);
    for (const row of specs.rows) {
      assert.equal(String(row.brand_entity_id), PHASE33_SAILOR_BRAND_ID);
    }
    assert.equal(
      String(specById.get(PHASE33_PGS21_ID)?.release_year),
      "2026-03-14",
    );
    assert.match(String(specById.get(PHASE33_PGS21_ID)?.nib), /21K 中型/);
    assert.match(String(specById.get(PHASE33_PGS21_ID)?.dimensions), /124 mm/);
    assert.equal(String(specById.get(PHASE33_PGS21_ID)?.weight), "16.8 g");
    assert.equal(
      String(specById.get(PHASE33_PROFIT_REALO18_ID)?.release_year),
      "2026-05-30",
    );
    assert.match(
      String(specById.get(PHASE33_PROFIT_REALO18_ID)?.fill_system),
      /1\.5cc[\s\S]*不可使用墨囊或上墨器/,
    );
    assert.match(
      String(specById.get(PHASE33_PROFIT_REALO18_ID)?.dimensions),
      /150\.5 mm/,
    );
    assert.equal(
      String(specById.get(PHASE33_PROFIT_REALO18_ID)?.weight),
      "26.3 g",
    );
    assert.equal(
      String(specById.get(PHASE33_ANCHOR_ID)?.release_year),
      "2025-12-13",
    );
    assert.match(
      String(specById.get(PHASE33_ANCHOR_ID)?.material),
      /黄铜大先[\s\S]*Gold IP[\s\S]*nickel chrome[\s\S]*Black IP/,
    );
    assert.equal(String(specById.get(PHASE33_ANCHOR_ID)?.weight), "30.0 g");

    const variants = await client.execute({
      sql: `SELECT model_entity_id AS entity_id, variant_kind, product_code, market
              FROM model_variants
             WHERE model_entity_id IN (?, ?, ?)
             ORDER BY model_entity_id, product_code`,
      args: [...NEW_MODEL_IDS],
    });
    assert.equal(variants.rows.length, 5);
    assert.deepEqual(
      new Set(variants.rows.map((row) => String(row.product_code))),
      new Set([
        "11-2151-120/220/320/420/620/720/920",
        "11-1853-120/220/320/420/620/720/920",
        "11-5080-140/240/340/440/640/740/940",
        "11-5081-140/240/340/440/640/740/940",
        "11-5082-140/240/340/440/640/740/940",
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
      args: [...NEW_MODEL_IDS],
    });
    assert.deepEqual(
      timeline.rows
        .filter((row) => String(row.entity_id) === PHASE33_PGS21_ID)
        .map((row) => [String(row.start_date), String(row.event_type)]),
      [["2026-03-14", "model_released"]],
    );
    assert.deepEqual(
      timeline.rows
        .filter((row) => String(row.entity_id) === PHASE33_PROFIT_REALO18_ID)
        .map((row) => [String(row.start_date), String(row.event_type)]),
      [["2026-05-30", "model_released"]],
    );
    assert.deepEqual(
      timeline.rows
        .filter((row) => String(row.entity_id) === PHASE33_ANCHOR_ID)
        .map((row) => [String(row.start_date), String(row.event_type)]),
      [
        ["2025-12-03", "design_milestone"],
        ["2025-12-13", "model_released"],
      ],
    );

    const media = await client.execute({
      sql: `SELECT entity_id, local_path, author, license, source_url,
                   attribution_text, usage_status
              FROM media_assets
             WHERE entity_id IN (?, ?, ?)
             ORDER BY entity_id`,
      args: [...NEW_MODEL_IDS],
    });
    assert.equal(media.rows.length, 3);
    for (const row of media.rows) {
      assert.equal(String(row.author), "Fountain Pen Graph editorial");
      assert.equal(String(row.license), "site-original");
      assert.equal(String(row.usage_status), "primary");
      assert.match(String(row.local_path), /sailor-2026-current\/.+\.svg$/);
      assert.match(String(row.attribution_text), /本站原创事实图/);
      assert.match(String(row.attribution_text), /非 Sailor 产品照片/);
      assert.match(String(row.attribution_text), /不含 Sailor logo/);
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
          WHERE entity_id IN (?, ?, ?)
            AND primary_archive_group_count >= 1
            AND professional_secondary_group_count >= 1`,
        [...NEW_MODEL_IDS],
      ),
      3,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_references reference
           JOIN source_items source ON source.id = reference.source_item_id
          WHERE reference.entity_id IN (?, ?, ?)
            AND source.archive_url LIKE '%.planning/%'`,
        [...NEW_MODEL_IDS],
      ),
      0,
    );

    const revisionsBeforeReplay = await publicationSnapshot(client, TARGET_IDS);
    const replay = await applyPhase33Sailor2026CurrentContent(
      client,
      applyOptions,
    );
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop", "noop"],
    );
    assert.deepEqual(
      await publicationSnapshot(client, TARGET_IDS),
      revisionsBeforeReplay,
    );
  } finally {
    collisionClient.close();
    client.close();
    fs.rmSync(collisionRoot, { recursive: true, force: true });
    fs.rmSync(ownedRoot, { recursive: true, force: true });
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  }
});
