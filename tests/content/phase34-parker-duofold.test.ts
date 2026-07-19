import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase28Parker51Content } from "../../scripts/apply-phase28-parker-51-content";
import { applyPhase30ParkerP0Content } from "../../scripts/apply-phase30-parker-p0-content";
import { applyPhase34ParkerDuofoldContent } from "../../scripts/apply-phase34-parker-duofold-content";
import {
  PHASE30_INGENUITY_ID,
  PHASE30_URBAN_ID,
  PHASE30_VECTOR_ID,
  PHASE30_VECTOR_XL_ID,
} from "../../scripts/data/phase30-parker-p0";
import {
  PHASE34_DUOFOLD_CENTENNIAL_ID,
  PHASE34_DUOFOLD_GEOMETRIC_ID,
  PHASE34_DUOFOLD_STRIPED_ID,
  PHASE34_DUOFOLD_VINTAGE_ID,
  PHASE34_PARKER_ID,
} from "../../scripts/data/phase34-parker-duofold";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const PHASE28_VINTAGE_51_ID = "i_XH37icAI5C";
const PHASE28_MODERN_51_ID = "jy_bRVs1hdMo";
const DUOFOLD_IDS = [
  PHASE34_DUOFOLD_VINTAGE_ID,
  PHASE34_DUOFOLD_GEOMETRIC_ID,
  PHASE34_DUOFOLD_STRIPED_ID,
  PHASE34_DUOFOLD_CENTENNIAL_ID,
] as const;
const PRESERVED_IDS = [
  PHASE28_VINTAGE_51_ID,
  PHASE28_MODERN_51_ID,
  PHASE30_INGENUITY_ID,
  PHASE30_VECTOR_ID,
  PHASE30_VECTOR_XL_ID,
  PHASE30_URBAN_ID,
] as const;

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

test("Phase 34 publishes four non-overlapping Parker Duofold identities from an owned checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase34-parker-duofold-")),
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
        "SELECT count(*) AS value FROM entities WHERE id = ? AND type = 'brand' AND slug = 'parker'",
        [PHASE34_PARKER_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value FROM entities
          WHERE (id = ? AND slug = 'the-parker-duofold')
             OR (id = ? AND slug = 'the-parker-duofold-geometric-toothbrush')
             OR (id = ? AND slug = 'the-parker-striped-duofold')
             OR (id = ? AND slug = '派克-parker-世纪-duofold')`,
        [...DUOFOLD_IDS],
      ),
      4,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM public_entities WHERE id IN (?, ?, ?, ?)",
        [...DUOFOLD_IDS],
      ),
      0,
    );

    const applyOptions = {
      workspaceRoot: ROOT,
      reviewer: "phase34-parker-duofold-curated-content",
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

    const topologyBeforeRefusal = await client.execute({
      sql: `SELECT id, source_id, target_id, link_type
              FROM entity_links
             WHERE source_id IN (?, ?, ?, ?) OR target_id IN (?, ?, ?, ?)
             ORDER BY id`,
      args: [...DUOFOLD_IDS, ...DUOFOLD_IDS],
    });
    await assert.rejects(
      applyPhase34ParkerDuofoldContent(client, {
        ...applyOptions,
        env: {
          ...applyOptions.env,
          TURSO_DATABASE_URL: "libsql://not-authorized.example",
        },
      }),
      /refuses inherited remote database selection/,
    );
    const topologyAfterRefusal = await client.execute({
      sql: `SELECT id, source_id, target_id, link_type
              FROM entity_links
             WHERE source_id IN (?, ?, ?, ?) OR target_id IN (?, ?, ?, ?)
             ORDER BY id`,
      args: [...DUOFOLD_IDS, ...DUOFOLD_IDS],
    });
    assert.deepEqual(
      topologyAfterRefusal.rows.map((row) => ({ ...row })),
      topologyBeforeRefusal.rows.map((row) => ({ ...row })),
    );

    await applyPhase28Parker51Content(client, {
      ...applyOptions,
      reviewer: "phase28-parker-51-prerequisite",
    });
    await applyPhase30ParkerP0Content(client, {
      ...applyOptions,
      reviewer: "phase30-parker-p0-prerequisite",
    });

    const preservedBefore = await client.execute({
      sql: `SELECT entity_id, status, blockers_json, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [...PRESERVED_IDS],
    });
    assert.equal(preservedBefore.rows.length, PRESERVED_IDS.length);
    assert.ok(
      preservedBefore.rows.every(
        (row) =>
          String(row.status) === "published" &&
          Number(row.content_revision) > 0,
      ),
    );

    const catalogueBefore = await client.execute({
      sql: `SELECT item.id, item.source_id, item.title, item.url,
                   item.source_tier, registry.name, registry.source_type,
                   registry.homepage_url
              FROM source_items item
              JOIN source_registry registry ON registry.id = item.source_id
             WHERE item.url = ?`,
      args: [
        "https://www.parkerromania.ro/cataloage1/Parker/Parker%20-%202026.pdf",
      ],
    });
    assert.equal(catalogueBefore.rows.length, 1);

    const first = await applyPhase34ParkerDuofoldContent(client, applyOptions);
    assert.deepEqual(
      first.entities
        .slice(1)
        .map((entity) => [entity.entityId, entity.outcome]),
      [
        [PHASE34_DUOFOLD_VINTAGE_ID, "published"],
        [PHASE34_DUOFOLD_GEOMETRIC_ID, "published"],
        [PHASE34_DUOFOLD_STRIPED_ID, "published"],
        [PHASE34_DUOFOLD_CENTENNIAL_ID, "published"],
      ],
    );
    assert.equal(first.entities[0]?.entityId, PHASE34_PARKER_ID);
    assert.ok(
      first.entities[0]?.outcome === "noop" ||
        first.entities[0]?.outcome === "published",
    );

    const publicRows = await client.execute({
      sql: `SELECT id, slug, name, length(summary) AS summary_length,
                   length(body_md) AS body_length, body_md
              FROM public_entities
             WHERE id IN (?, ?, ?, ?)
             ORDER BY CASE id
               WHEN ? THEN 0 WHEN ? THEN 1 WHEN ? THEN 2 ELSE 3 END`,
      args: [
        ...DUOFOLD_IDS,
        PHASE34_DUOFOLD_VINTAGE_ID,
        PHASE34_DUOFOLD_GEOMETRIC_ID,
        PHASE34_DUOFOLD_STRIPED_ID,
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
          PHASE34_DUOFOLD_VINTAGE_ID,
          "the-parker-duofold",
          "Parker Duofold（1921–1938 经典家族）",
        ],
        [
          PHASE34_DUOFOLD_GEOMETRIC_ID,
          "the-parker-duofold-geometric-toothbrush",
          "Parker Duofold Geometric（1939–1940）",
        ],
        [
          PHASE34_DUOFOLD_STRIPED_ID,
          "the-parker-striped-duofold",
          "Parker Striped Duofold（1940–1948）",
        ],
        [
          PHASE34_DUOFOLD_CENTENNIAL_ID,
          "派克-parker-世纪-duofold",
          "Parker Duofold Classic Centennial（1987/88–）",
        ],
      ],
    );
    for (const row of publicRows.rows) {
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.summary_length) <= 160);
      assert.ok(Number(row.body_length) >= 2_000);
      assert.match(String(row.body_md), /示意图，非产品照片/);
      assert.doesNotMatch(
        String(row.body_md),
        /\b(?:canonical|made_by|market_sku|slug|PDP|live)\b|数据库|仓库|本轮检索|缓存/i,
      );
    }
    const parkerBrand = await client.execute({
      sql: "SELECT body_md FROM public_entities WHERE id = ?",
      args: [PHASE34_PARKER_ID],
    });
    assert.equal(parkerBrand.rows.length, 1);
    assert.doesNotMatch(
      String(parkerBrand.rows[0]?.body_md),
      /\b(?:canonical|made_by|market_sku|slug|PDP|live)\b|数据库|仓库|raw inventory|本轮检索|缓存/i,
    );

    const bodyById = new Map(
      publicRows.rows.map((row) => [String(row.id), String(row.body_md)]),
    );
    assert.match(
      bodyById.get(PHASE34_DUOFOLD_VINTAGE_ID) ?? "",
      /1921[\s\S]*1933[\s\S]*Permanite[\s\S]*Streamlined/,
    );
    assert.match(
      bodyById.get(PHASE34_DUOFOLD_VINTAGE_ID) ?? "",
      /Senior[\s\S]*Junior[\s\S]*Special[\s\S]*Lady/,
    );
    const geometricBody = bodyById.get(PHASE34_DUOFOLD_GEOMETRIC_ID) ?? "";
    assert.match(geometricBody, /1939–1940/);
    assert.match(geometricBody, /Standard[\s\S]*Slender/);
    for (const color of ["black", "brown", "grey", "green"]) {
      assert.match(geometricBody, new RegExp(color, "i"));
    }
    assert.match(
      geometricBody,
      /Visiometer[\s\S]*solid rod[\s\S]*button filler/,
    );
    assert.match(
      geometricBody,
      /(?:没有 Vacumatic|不是 Vacumatic|不等于 Vacumatic)/,
    );
    assert.match(
      bodyById.get(PHASE34_DUOFOLD_STRIPED_ID) ?? "",
      /1940–1948[\s\S]*Vacumatic filler[\s\S]*button filler[\s\S]*Duovac/,
    );
    assert.match(
      bodyById.get(PHASE34_DUOFOLD_STRIPED_ID) ?? "",
      /1942[\s\S]*Vacumatic imprint[\s\S]*stacked-coin cap band/,
    );
    assert.match(
      bodyById.get(PHASE34_DUOFOLD_CENTENNIAL_ID) ?? "",
      /1987 年(?:已经)?开始生产[\s\S]*1988 年正式推出/,
    );
    assert.match(
      bodyById.get(PHASE34_DUOFOLD_CENTENNIAL_ID) ?? "",
      /1931375[\s\S]*1931376[\s\S]*1931381[\s\S]*1931382[\s\S]*FP 18K/,
    );
    assert.match(
      bodyById.get(PHASE34_DUOFOLD_CENTENNIAL_ID) ?? "",
      /地区目录副本[\s\S]*不在 Parker 主域/,
    );
    assert.match(
      bodyById.get(PHASE34_DUOFOLD_CENTENNIAL_ID) ?? "",
      /1931375[\s\S]*since 1921[\s\S]*solid red precious resin[\s\S]*palladium-finished trims/,
    );

    for (const penId of DUOFOLD_IDS) {
      assert.equal(
        await scalar(
          client,
          `SELECT count(*) AS value FROM entity_links
            WHERE source_id = ? AND link_type = 'made_by'`,
          [penId],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          `SELECT count(*) AS value FROM entity_links
            WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
          [penId, PHASE34_PARKER_ID],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          `SELECT count(*) AS value FROM entity_links
            WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'`,
          [PHASE34_PARKER_ID, penId],
        ),
        1,
      );
    }

    const publicParkerModels = await client.execute({
      sql: `SELECT pen.id
              FROM entity_links link
              JOIN public_entities pen ON pen.id = link.source_id
             WHERE link.target_id = ? AND link.link_type = 'made_by'
             ORDER BY pen.id`,
      args: [PHASE34_PARKER_ID],
    });
    assert.deepEqual(
      new Set(publicParkerModels.rows.map((row) => String(row.id))),
      new Set([
        PHASE28_VINTAGE_51_ID,
        PHASE28_MODERN_51_ID,
        PHASE30_INGENUITY_ID,
        PHASE30_VECTOR_ID,
        PHASE30_VECTOR_XL_ID,
        PHASE30_URBAN_ID,
        ...DUOFOLD_IDS,
      ]),
    );

    const preservedAfter = await client.execute({
      sql: `SELECT entity_id, status, blockers_json, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [...PRESERVED_IDS],
    });
    assert.deepEqual(
      preservedAfter.rows.map((row) => ({ ...row })),
      preservedBefore.rows.map((row) => ({ ...row })),
    );

    const specs = await client.execute({
      sql: `SELECT entity_id, brand_entity_id, series_name, release_year, nib,
                   fill_system, material, dimensions, weight, status
              FROM model_specs
             WHERE entity_id IN (?, ?, ?, ?) AND review_status = 'approved'`,
      args: [...DUOFOLD_IDS],
    });
    assert.equal(specs.rows.length, 4);
    assert.ok(
      specs.rows.every(
        (row) => String(row.brand_entity_id) === PHASE34_PARKER_ID,
      ),
    );
    const specById = new Map(
      specs.rows.map((row) => [String(row.entity_id), row]),
    );
    const vintageSpec = specById.get(PHASE34_DUOFOLD_VINTAGE_ID);
    assert.match(
      String(vintageSpec?.release_year),
      /1921.*1933.*1930 年代后期/,
    );
    assert.match(String(vintageSpec?.fill_system), /button filler.*rubber sac/);
    assert.match(String(vintageSpec?.dimensions), /无统一尺寸.*Senior.*139 mm/);
    assert.equal(vintageSpec?.weight, null);

    const geometricSpec = specById.get(PHASE34_DUOFOLD_GEOMETRIC_ID);
    assert.equal(String(geometricSpec?.release_year), "1939–1940");
    assert.match(
      String(geometricSpec?.fill_system),
      /button filler.*rubber sac.*solid rod/,
    );
    assert.match(
      String(geometricSpec?.material),
      /Standard.*Slender.*绿.*灰.*棕.*黑/,
    );
    assert.doesNotMatch(String(geometricSpec?.fill_system), /Vacumatic filler/);

    const stripedSpec = specById.get(PHASE34_DUOFOLD_STRIPED_ID);
    assert.equal(String(stripedSpec?.release_year), "1940–1948");
    assert.match(
      String(stripedSpec?.fill_system),
      /1940–42.*Speedline.*1942–48.*plastic plunger.*button filler.*sac/,
    );
    assert.match(
      String(stripedSpec?.dimensions),
      /Senior.*135 mm.*Ingenue.*125 mm/,
    );

    const centennialSpec = specById.get(PHASE34_DUOFOLD_CENTENNIAL_ID);
    assert.equal(
      String(centennialSpec?.release_year),
      "1987 production / 1988 centenary introduction",
    );
    assert.match(String(centennialSpec?.nib), /18K.*F\/M.*SKU/);
    assert.equal(
      String(centennialSpec?.dimensions),
      "当前官方只确认 Centennial Size；未公开精确长宽、重量或容量",
    );
    assert.equal(centennialSpec?.weight, null);
    assert.doesNotMatch(
      String(centennialSpec?.dimensions),
      /137|14\.8|131|13\.7/,
    );

    const productCodes = await client.execute({
      sql: `SELECT product_code
              FROM model_variants
             WHERE model_entity_id = ? AND product_code IS NOT NULL
             ORDER BY product_code`,
      args: [PHASE34_DUOFOLD_CENTENNIAL_ID],
    });
    assert.deepEqual(
      productCodes.rows.map((row) => String(row.product_code)),
      ["1931375", "1931376", "1931381", "1931382"],
    );

    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM fact_conflicts WHERE entity_id = ? AND field_key = 'material'",
        [PHASE34_DUOFOLD_CENTENNIAL_ID],
      ),
      0,
    );

    const catalogueAfter = await client.execute({
      sql: `SELECT item.id, item.source_id, item.title, item.url,
                   item.source_tier, registry.name, registry.source_type,
                   registry.homepage_url
              FROM source_items item
              JOIN source_registry registry ON registry.id = item.source_id
             WHERE item.url = ?`,
      args: [
        "https://www.parkerromania.ro/cataloage1/Parker/Parker%20-%202026.pdf",
      ],
    });
    assert.deepEqual(
      catalogueAfter.rows.map((row) => ({ ...row })),
      catalogueBefore.rows.map((row) => ({ ...row })),
    );

    const media = await client.execute({
      sql: `SELECT entity_id, title, local_path, license, attribution_text,
                   source_url, usage_status
              FROM media_assets
             WHERE entity_id IN (?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [...DUOFOLD_IDS],
    });
    assert.equal(media.rows.length, 4);
    const expectedMedia = new Map([
      [
        PHASE34_DUOFOLD_VINTAGE_ID,
        "/images/library/site-original/parker-duofold/parker-duofold-vintage-family-factual.svg",
      ],
      [
        PHASE34_DUOFOLD_GEOMETRIC_ID,
        "/images/library/site-original/parker-duofold/parker-duofold-geometric-factual.svg",
      ],
      [
        PHASE34_DUOFOLD_STRIPED_ID,
        "/images/library/site-original/parker-duofold/parker-striped-duofold-factual.svg",
      ],
      [
        PHASE34_DUOFOLD_CENTENNIAL_ID,
        "/images/library/site-original/parker-duofold/parker-duofold-centennial-factual.svg",
      ],
    ]);
    const svgDigests = new Set<string>();
    for (const row of media.rows) {
      const localPath = String(row.local_path);
      assert.equal(localPath, expectedMedia.get(String(row.entity_id)));
      assert.equal(String(row.license), "site-original");
      assert.equal(String(row.usage_status), "primary");
      assert.match(String(row.title), /示意图.*非产品照片/);
      assert.match(String(row.attribution_text), /示意图，非产品照片/);
      assert.match(String(row.attribution_text), /未复制或临摹|不表现任何真实/);
      assert.equal(String(row.source_url), localPath);
      const svg = fs.readFileSync(
        path.join(ROOT, "public", localPath.slice(1)),
        "utf8",
      );
      assert.match(svg, /<desc\b/);
      assert.match(svg, /非产品照片/);
      assert.doesNotMatch(svg, /<image\b/i);
      svgDigests.add(sha256(svg));
    }
    assert.equal(svgDigests.size, 4);

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_references reference
           JOIN source_items source ON source.id = reference.source_item_id
          WHERE reference.entity_id IN (?, ?, ?, ?)
            AND source.archive_url LIKE '%.planning/%'`,
        [...DUOFOLD_IDS],
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
        [...DUOFOLD_IDS],
      ),
      4,
    );

    const archiveSources = await client.execute({
      sql: `SELECT reference.entity_id, source.url, source.source_tier,
                   registry.source_type
              FROM entity_references reference
              JOIN source_items source ON source.id = reference.source_item_id
              JOIN source_registry registry ON registry.id = source.source_id
             WHERE (reference.entity_id = ? AND source.url = ?)
                OR (reference.entity_id = ? AND source.url = ?)
             ORDER BY reference.entity_id`,
      args: [
        PHASE34_DUOFOLD_GEOMETRIC_ID,
        "https://drive.google.com/file/d/1_8YvB2-K7242YXvJEbgz1hg7UPKkM6iR/view?usp=sharing",
        PHASE34_DUOFOLD_STRIPED_ID,
        "https://drive.google.com/file/d/1ufIlpYuTcgRYxJ8fDFagf4Y4kILPREnC/view?usp=sharing",
      ],
    });
    assert.deepEqual(
      new Set(
        archiveSources.rows.map((row) =>
          [
            String(row.entity_id),
            String(row.url),
            String(row.source_tier),
            String(row.source_type),
          ].join("|"),
        ),
      ),
      new Set([
        `${PHASE34_DUOFOLD_GEOMETRIC_ID}|https://drive.google.com/file/d/1_8YvB2-K7242YXvJEbgz1hg7UPKkM6iR/view?usp=sharing|contemporary_archive|official`,
        `${PHASE34_DUOFOLD_STRIPED_ID}|https://drive.google.com/file/d/1ufIlpYuTcgRYxJ8fDFagf4Y4kILPREnC/view?usp=sharing|contemporary_archive|official`,
      ]),
    );

    const revisionsBeforeReplay = await client.execute({
      sql: `SELECT entity_id, status, blockers_json, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [...DUOFOLD_IDS],
    });
    const replay = await applyPhase34ParkerDuofoldContent(client, applyOptions);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop", "noop", "noop"],
    );
    const revisionsAfterReplay = await client.execute({
      sql: `SELECT entity_id, status, blockers_json, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [...DUOFOLD_IDS],
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
