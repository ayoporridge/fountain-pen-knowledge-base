import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase28Parker51Content } from "../../scripts/apply-phase28-parker-51-content";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PARKER_ID = "vhqNYqDChhiN";
const VINTAGE_ID = "i_XH37icAI5C";
const DUPLICATE_ID = "jY3SP5ZX8Hwx";
const MODERN_ID = "jy_bRVs1hdMo";

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 28 publishes Parker and two distinct 51 generations from an owned checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase28-parker-51-")),
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

    const donorUrlsBefore = await client.execute({
      sql: `SELECT DISTINCT item.url
              FROM entity_references reference
              JOIN source_items item ON item.id = reference.source_item_id
             WHERE reference.entity_id = ?
               AND reference.review_status = 'approved'
               AND item.review_status = 'approved'
               AND item.url GLOB 'http*://*'
               AND item.archive_url GLOB 'http*://*'
               AND item.archive_url NOT LIKE '%.planning/%'
               AND trim(coalesce(item.archive_locator, '')) <> ''
               AND trim(coalesce(item.independence_group, '')) <> ''
             ORDER BY item.url`,
      args: [DUPLICATE_ID],
    });
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id = ? AND slug = 'parker-51-vintage'",
        [DUPLICATE_ID],
      ),
      1,
    );

    const applyOptions = {
      workspaceRoot: ROOT,
      reviewer: "phase28-parker-51-curated-content",
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

    const first = await applyPhase28Parker51Content(client, applyOptions);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [PARKER_ID, "published"],
        [VINTAGE_ID, "published"],
        [MODERN_ID, "published"],
      ],
    );

    const publicRows = await client.execute({
      sql: `SELECT id, slug, name, length(summary) AS summary_length,
                   length(body_md) AS body_length, body_md
              FROM public_entities
             WHERE id IN (?, ?, ?)
             ORDER BY CASE id WHEN ? THEN 0 WHEN ? THEN 1 ELSE 2 END`,
      args: [PARKER_ID, VINTAGE_ID, MODERN_ID, PARKER_ID, VINTAGE_ID],
    });
    assert.deepEqual(
      publicRows.rows.map((row) => [
        String(row.id),
        String(row.slug),
        String(row.name),
      ]),
      [
        [PARKER_ID, "parker", "派克 Parker"],
        [
          VINTAGE_ID,
          "派克-parker-51-经典-vintage",
          "派克 Parker 51（1941–1978）",
        ],
        [MODERN_ID, "派克-parker-51复刻", "派克 Parker 51（2021）"],
      ],
    );
    assert.ok(Number(publicRows.rows[0]?.body_length) >= 1_200);
    assert.ok(Number(publicRows.rows[1]?.body_length) >= 2_000);
    assert.ok(Number(publicRows.rows[2]?.body_length) >= 2_000);
    for (const row of publicRows.rows) {
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.summary_length) <= 160);
    }
    assert.match(
      String(publicRows.rows[0]?.body_md),
      /1888[\s\S]*Lucky Curve[\s\S]*Duofold[\s\S]*Quink[\s\S]*Vacumatic[\s\S]*Jotter/,
    );
    assert.match(
      String(publicRows.rows[1]?.body_md),
      /1941–1972[\s\S]*1941–1978[\s\S]*Red Band[\s\S]*Aero-metric[\s\S]*Special[\s\S]*Demi[\s\S]*cartridge/,
    );
    assert.match(
      String(publicRows.rows[1]?.body_md),
      /不能.*统一.*14K|不会.*统一.*14K/,
    );
    assert.match(
      String(publicRows.rows[2]?.body_md),
      /reimagined[\s\S]*modern take[\s\S]*墨囊／上墨器[\s\S]*旋帽[\s\S]*Core[\s\S]*钢尖[\s\S]*Deluxe[\s\S]*18K/,
    );
    assert.match(String(publicRows.rows[2]?.body_md), /不是.*忠实复刻/);
    assert.match(String(publicRows.rows[2]?.body_md), /collector/);

    for (const modelId of [VINTAGE_ID, MODERN_ID]) {
      assert.equal(
        await scalar(
          client,
          `SELECT count(*) AS value
             FROM entity_links
            WHERE source_id = ? AND link_type = 'made_by'`,
          [modelId],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          `SELECT count(*) AS value
             FROM entity_links
            WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
          [modelId, PARKER_ID],
        ),
        1,
      );
    }
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value FROM entity_links
          WHERE source_id = ? AND link_type = 'made_by'`,
        [DUPLICATE_ID],
      ),
      0,
    );

    const publicModels = await client.execute({
      sql: `SELECT pen.id, pen.slug
              FROM entity_links link
              JOIN public_entities pen ON pen.id = link.source_id
              JOIN public_entities brand ON brand.id = link.target_id
             WHERE link.target_id = ? AND link.link_type = 'made_by'
             ORDER BY pen.id`,
      args: [PARKER_ID],
    });
    const parkerPublicIds = new Set(
      publicModels.rows.map((row) => String(row.id)),
    );
    assert.ok(parkerPublicIds.has(VINTAGE_ID));
    assert.ok(parkerPublicIds.has(MODERN_ID));
    assert.equal(
      publicModels.rows.filter((row) => String(row.id) === VINTAGE_ID).length,
      1,
    );
    assert.equal(
      publicModels.rows.filter((row) => String(row.id) === MODERN_ID).length,
      1,
    );

    const lifecycle = await client.execute({
      sql: `SELECT entity_id, status, blockers_json
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?)
             ORDER BY entity_id`,
      args: [VINTAGE_ID, DUPLICATE_ID, MODERN_ID],
    });
    const statusById = new Map(
      lifecycle.rows.map((row) => [String(row.entity_id), String(row.status)]),
    );
    assert.equal(statusById.get(VINTAGE_ID), "published");
    assert.equal(statusById.get(MODERN_ID), "published");
    assert.equal(statusById.get(DUPLICATE_ID), "retired");
    assert.equal(
      String(
        lifecycle.rows.find((row) => String(row.entity_id) === DUPLICATE_ID)
          ?.blockers_json,
      ),
      '["taxonomy_merged"]',
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value FROM entity_lineage
          WHERE source_entity_id = ? AND target_entity_id = ?
            AND lineage_kind = 'merge'`,
        [DUPLICATE_ID, VINTAGE_ID],
      ),
      1,
    );
    const redirects = await client.execute({
      sql: `SELECT source_path, target_path, redirect_kind
              FROM entity_redirects
             WHERE source_path = '/pen/parker-51-vintage'`,
    });
    assert.deepEqual(
      redirects.rows.map((row) => [
        String(row.source_path),
        String(row.target_path),
        String(row.redirect_kind),
      ]),
      [
        [
          "/pen/parker-51-vintage",
          "/pen/派克-parker-51-经典-vintage",
          "permanent",
        ],
      ],
    );

    const donorUrlStrings = donorUrlsBefore.rows.map((row) => String(row.url));
    for (const url of donorUrlStrings) {
      assert.equal(
        await scalar(
          client,
          `SELECT count(*) AS value
             FROM entity_references reference
             JOIN source_items item ON item.id = reference.source_item_id
            WHERE reference.entity_id = ? AND item.url = ?`,
          [VINTAGE_ID, url],
        ),
        1,
      );
    }

    const specs = await client.execute({
      sql: `SELECT entity_id, series_name, release_year, nib, fill_system,
                   material, dimensions, status
              FROM model_specs
             WHERE entity_id IN (?, ?) AND review_status = 'approved'
             ORDER BY entity_id`,
      args: [VINTAGE_ID, MODERN_ID],
    });
    const specById = new Map(
      specs.rows.map((row) => [String(row.entity_id), row]),
    );
    assert.match(
      String(specById.get(VINTAGE_ID)?.release_year),
      /1941.*1972.*1978/,
    );
    assert.match(
      String(specById.get(VINTAGE_ID)?.fill_system),
      /Vacumatic.*Aero-metric.*cartridge/,
    );
    assert.match(String(specById.get(VINTAGE_ID)?.nib), /不统一标为 14K/);
    assert.match(String(specById.get(VINTAGE_ID)?.dimensions), /不共享/);
    assert.equal(String(specById.get(MODERN_ID)?.release_year), "2021");
    assert.match(
      String(specById.get(MODERN_ID)?.nib),
      /Core.*钢尖.*Deluxe.*18K/,
    );
    assert.match(
      String(specById.get(MODERN_ID)?.fill_system),
      /墨囊／上墨器.*旋帽/,
    );

    const variants = await client.execute({
      sql: `SELECT model_entity_id, variant_name
              FROM model_variants
             WHERE model_entity_id IN (?, ?)
             ORDER BY model_entity_id, variant_name`,
      args: [VINTAGE_ID, MODERN_ID],
    });
    const vintageVariants = variants.rows
      .filter((row) => String(row.model_entity_id) === VINTAGE_ID)
      .map((row) => String(row.variant_name));
    for (const expected of [
      "Vacumatic 主线",
      "Red Band",
      "Aero-metric 主线",
      "Parker 51 Special",
      "Parker 51 Demi",
      "少量 cartridge 版本",
      "后期结构版本",
    ]) {
      assert.ok(vintageVariants.includes(expected));
    }
    assert.deepEqual(
      variants.rows
        .filter((row) => String(row.model_entity_id) === MODERN_ID)
        .map((row) => String(row.variant_name)),
      ["Parker 51 Core", "Parker 51 Deluxe"],
    );

    const media = await client.execute({
      sql: `SELECT entity_id, local_path, author, license, source_url,
                   attribution_text
              FROM media_assets
             WHERE entity_id IN (?, ?, ?) AND usage_status = 'primary'
             ORDER BY CASE entity_id WHEN ? THEN 0 WHEN ? THEN 1 ELSE 2 END`,
      args: [PARKER_ID, VINTAGE_ID, MODERN_ID, PARKER_ID, VINTAGE_ID],
    });
    assert.deepEqual(
      media.rows.map((row) => [
        String(row.entity_id),
        String(row.local_path),
        String(row.author),
        String(row.license),
      ]),
      [
        [
          PARKER_ID,
          "/images/library/wikimedia/parker/parker-im-caleb-bond.jpg",
          "Caleb Bond",
          "cc-by-3.0",
        ],
        [
          VINTAGE_ID,
          "/images/library/wikimedia/parker/parker-51s-batch1928-44.jpg",
          "Batch1928 44",
          "public-domain",
        ],
        [
          MODERN_ID,
          "/images/library/licensed/parker/parker-51-2021-peter.jpg",
          "Peter",
          "cc-by-4.0",
        ],
      ],
    );
    for (const row of media.rows) {
      const image = path.join(ROOT, "public", String(row.local_path).slice(1));
      assert.ok(fs.statSync(image).isFile());
      assert.ok(fs.statSync(image).size > 10_000);
      assert.equal(
        fs.readFileSync(image).subarray(0, 2).toString("hex"),
        "ffd8",
      );
      assert.match(String(row.attribution_text), /未裁切|未重绘/);
      assert.match(String(row.source_url), /^https:\/\//);
    }

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_references reference
           JOIN source_items source ON source.id = reference.source_item_id
          WHERE reference.entity_id IN (?, ?, ?)
            AND source.archive_url LIKE '%.planning/%'`,
        [PARKER_ID, VINTAGE_ID, MODERN_ID],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM publication_v2_source_group_counts
          WHERE entity_id IN (?, ?, ?)
            AND primary_archive_group_count >= 1`,
        [PARKER_ID, VINTAGE_ID, MODERN_ID],
      ),
      3,
    );

    const revisionsBeforeReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [PARKER_ID, VINTAGE_ID, DUPLICATE_ID, MODERN_ID],
    });
    const replay = await applyPhase28Parker51Content(client, applyOptions);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop"],
    );
    const revisionsAfterReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [PARKER_ID, VINTAGE_ID, DUPLICATE_ID, MODERN_ID],
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
