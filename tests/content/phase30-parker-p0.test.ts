import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase28Parker51Content } from "../../scripts/apply-phase28-parker-51-content";
import { applyPhase30ParkerP0Content } from "../../scripts/apply-phase30-parker-p0-content";
import {
  PHASE30_INGENUITY_ID,
  PHASE30_PARKER_ID,
  PHASE30_URBAN_ID,
  PHASE30_VECTOR_ID,
  PHASE30_VECTOR_XL_ID,
} from "../../scripts/data/phase30-parker-p0";
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
const PEN_IDS = [
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

test("Phase 30 publishes four distinct Parker P0 canonicals from an owned checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase30-parker-p0-")),
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
        [PHASE30_PARKER_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id = ? AND type = 'pen' AND slug = '派克-parker-威雅-vector'",
        [PHASE30_VECTOR_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        "SELECT count(*) AS value FROM entities WHERE id IN (?, ?, ?)",
        [PHASE30_INGENUITY_ID, PHASE30_URBAN_ID, PHASE30_VECTOR_XL_ID],
      ),
      0,
    );

    const applyOptions = {
      workspaceRoot: ROOT,
      reviewer: "phase30-parker-p0-curated-content",
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

    await applyPhase28Parker51Content(client, {
      ...applyOptions,
      reviewer: "phase28-parker-51-prerequisite",
    });
    const parker51PublicationsBefore = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id`,
      args: [PHASE28_VINTAGE_51_ID, PHASE28_MODERN_51_ID],
    });
    assert.equal(parker51PublicationsBefore.rows.length, 2);
    assert.ok(
      parker51PublicationsBefore.rows.every(
        (row) =>
          String(row.status) === "published" &&
          Number(row.content_revision) > 0,
      ),
    );
    const first = await applyPhase30ParkerP0Content(client, applyOptions);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [PHASE30_PARKER_ID, "published"],
        [PHASE30_INGENUITY_ID, "published"],
        [PHASE30_VECTOR_ID, "published"],
        [PHASE30_VECTOR_XL_ID, "published"],
        [PHASE30_URBAN_ID, "published"],
      ],
    );

    const publicRows = await client.execute({
      sql: `SELECT id, slug, name, length(summary) AS summary_length,
                   length(body_md) AS body_length, summary, body_md
              FROM public_entities
             WHERE id IN (?, ?, ?, ?)
             ORDER BY CASE id
               WHEN ? THEN 0 WHEN ? THEN 1 WHEN ? THEN 2 ELSE 3 END`,
      args: [
        ...PEN_IDS,
        PHASE30_INGENUITY_ID,
        PHASE30_VECTOR_ID,
        PHASE30_VECTOR_XL_ID,
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
          PHASE30_INGENUITY_ID,
          "parker-ingenuity-fountain-pen",
          "Parker Ingenuity Fountain Pen（2023–）",
        ],
        [
          PHASE30_VECTOR_ID,
          "派克-parker-威雅-vector",
          "Parker Vector（经典款）",
        ],
        [
          PHASE30_VECTOR_XL_ID,
          "parker-vector-xl-fountain-pen",
          "Parker Vector XL",
        ],
        [
          PHASE30_URBAN_ID,
          "parker-urban-fountain-pen",
          "Parker Urban Fountain Pen（现行款）",
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
        /\b(?:canonical|made_by|market_sku|slug)\b|数据库|仓库/i,
      );
    }

    const bodyById = new Map(
      publicRows.rows.map((row) => [String(row.id), String(row.body_md)]),
    );
    assert.match(
      bodyById.get(PHASE30_INGENUITY_ID) ?? "",
      /2023[\s\S]*2011[\s\S]*5TH Technology/,
    );
    assert.match(
      bodyById.get(PHASE30_INGENUITY_ID) ?? "",
      /2213726[\s\S]*Fine[\s\S]*2026 EMEA[\s\S]*FP M/,
    );
    assert.match(
      bodyById.get(PHASE30_INGENUITY_ID) ?? "",
      /2182006[\s\S]*140 mm[\s\S]*165 mm[\s\S]*13\.7 mm[\s\S]*45 g[\s\S]*只属于该 SKU/,
    );
    assert.match(
      bodyById.get(PHASE30_VECTOR_ID) ?? "",
      /1984 年 2 月[\s\S]*FP-1[\s\S]*1984 年 3 月[\s\S]*Vector/,
    );
    assert.match(
      bodyById.get(PHASE30_VECTOR_ID) ?? "",
      /过去把经典 Vector 与 Vector XL 写在同一页[\s\S]*Vector XL 另设页面/,
    );
    assert.match(
      bodyById.get(PHASE30_VECTOR_XL_ID) ?? "",
      /2022 trade catalogue[\s\S]*官方硬边界[\s\S]*精确全球首发日未核实/,
    );
    assert.match(
      bodyById.get(PHASE30_VECTOR_XL_ID) ?? "",
      /2159746[\s\S]*135 mm[\s\S]*157 mm[\s\S]*11\.5 mm[\s\S]*20 g/,
    );
    assert.match(
      bodyById.get(PHASE30_VECTOR_XL_ID) ?? "",
      /converter[\s\S]*sold separately/,
    );
    assert.match(
      bodyById.get(PHASE30_URBAN_ID) ?? "",
      /2016 年末[\s\S]*1931593[\s\S]*Fine nib[\s\S]*不锈钢/,
    );
    assert.match(
      bodyById.get(PHASE30_URBAN_ID) ?? "",
      /Lacquer on Brass[\s\S]*QUINK[\s\S]*converter/,
    );

    for (const penId of PEN_IDS) {
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
          [penId, PHASE30_PARKER_ID],
        ),
        1,
      );
      assert.equal(
        await scalar(
          client,
          `SELECT count(*) AS value FROM entity_links
            WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'`,
          [PHASE30_PARKER_ID, penId],
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
      args: [PHASE30_PARKER_ID],
    });
    assert.deepEqual(
      new Set(publicParkerModels.rows.map((row) => String(row.id))),
      new Set([PHASE28_VINTAGE_51_ID, PHASE28_MODERN_51_ID, ...PEN_IDS]),
    );

    const parker51PublicationsAfter = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id`,
      args: [PHASE28_VINTAGE_51_ID, PHASE28_MODERN_51_ID],
    });
    assert.deepEqual(
      parker51PublicationsAfter.rows.map((row) => ({ ...row })),
      parker51PublicationsBefore.rows.map((row) => ({ ...row })),
    );

    const specs = await client.execute({
      sql: `SELECT entity_id, brand_entity_id, series_name, release_year, nib,
                   fill_system, material, dimensions, weight, status
              FROM model_specs
             WHERE entity_id IN (?, ?, ?, ?) AND review_status = 'approved'`,
      args: [...PEN_IDS],
    });
    const specById = new Map(
      specs.rows.map((row) => [String(row.entity_id), row]),
    );
    assert.equal(specs.rows.length, 4);
    assert.ok(
      specs.rows.every(
        (row) => String(row.brand_entity_id) === PHASE30_PARKER_ID,
      ),
    );
    const ingenuitySpec = specById.get(PHASE30_INGENUITY_ID);
    assert.equal(String(ingenuitySpec?.release_year), "2023");
    assert.match(String(ingenuitySpec?.nib), /F\/M.*2213726.*冲突/);
    assert.match(
      String(ingenuitySpec?.dimensions),
      /家族不设统一尺寸.*2182006.*140 mm.*165 mm.*13\.7 mm/,
    );
    assert.equal(
      String(ingenuitySpec?.weight),
      "家族不设统一重量；Black GT 2182006 为 45 g",
    );

    const vectorSpec = specById.get(PHASE30_VECTOR_ID);
    assert.match(String(vectorSpec?.release_year), /FP-1.*1984.*Vector name/);
    assert.equal(vectorSpec?.dimensions, null);
    assert.equal(vectorSpec?.weight, null);
    assert.doesNotMatch(
      [
        vectorSpec?.series_name,
        vectorSpec?.release_year,
        vectorSpec?.nib,
        vectorSpec?.fill_system,
        vectorSpec?.material,
        vectorSpec?.dimensions,
        vectorSpec?.weight,
      ].join(" "),
      /2159746|135 mm|157 mm|11\.5 mm|20 g/,
    );

    const vectorXlSpec = specById.get(PHASE30_VECTOR_XL_ID);
    assert.equal(
      String(vectorXlSpec?.release_year),
      "documented in Parker's 2022 catalogue; exact global launch date unverified",
    );
    assert.match(String(vectorXlSpec?.nib), /2159746 为 M/);
    assert.equal(
      String(vectorXlSpec?.dimensions),
      "Teal 2159746：闭合 135 mm、插帽 157 mm、最大径 11.5 mm",
    );
    assert.equal(String(vectorXlSpec?.weight), "Teal 2159746：20 g");
    assert.match(String(vectorXlSpec?.fill_system), /需另购/);

    const urbanSpec = specById.get(PHASE30_URBAN_ID);
    assert.equal(String(urbanSpec?.release_year), "post-2016 redesign");
    assert.match(String(urbanSpec?.nib), /1931593 为 F/);
    assert.match(String(urbanSpec?.material), /漆面黄铜笔帽/);
    assert.match(String(urbanSpec?.fill_system), /QUINK.*converter/);

    const variants = await client.execute({
      sql: `SELECT model_entity_id, variant_name, product_code, notes
              FROM model_variants
             WHERE model_entity_id IN (?, ?, ?, ?)
             ORDER BY model_entity_id, product_code`,
      args: [...PEN_IDS],
    });
    const variantsByModel = new Map<string, typeof variants.rows>();
    for (const row of variants.rows) {
      const id = String(row.model_entity_id);
      variantsByModel.set(id, [...(variantsByModel.get(id) ?? []), row]);
    }
    assert.deepEqual(
      variantsByModel
        .get(PHASE30_INGENUITY_ID)
        ?.map((row) => String(row.product_code)),
      ["2182006", "2213726"],
    );
    assert.deepEqual(
      variantsByModel
        .get(PHASE30_VECTOR_XL_ID)
        ?.map((row) => String(row.product_code)),
      ["2159746"],
    );
    assert.deepEqual(
      variantsByModel
        .get(PHASE30_URBAN_ID)
        ?.map((row) => String(row.product_code)),
      ["1931593"],
    );
    const vectorVariants = variantsByModel.get(PHASE30_VECTOR_ID) ?? [];
    assert.deepEqual(
      vectorVariants.map((row) => String(row.product_code)),
      ["FP-1"],
    );
    assert.doesNotMatch(
      vectorVariants
        .map((row) => `${String(row.variant_name)} ${String(row.notes)}`)
        .join(" "),
      /2159746|135 mm|157 mm|11\.5 mm|20 g/,
    );

    const conflict = await client.execute({
      sql: `SELECT conflict.status, conflict.resolution_note, scope.scope_key
              FROM fact_conflicts conflict
              JOIN fact_scopes scope ON scope.id = conflict.scope_id
             WHERE conflict.entity_id = ? AND conflict.field_key = 'nib'
               AND conflict.conflict_kind = 'field'`,
      args: [PHASE30_INGENUITY_ID],
    });
    assert.equal(conflict.rows.length, 1);
    assert.equal(String(conflict.rows[0]?.status), "resolved");
    assert.equal(
      String(conflict.rows[0]?.scope_key),
      "parker-ingenuity-grey-gt-2213726-official-conflict",
    );
    assert.match(
      String(conflict.rows[0]?.resolution_note),
      /Do not choose F or M at family level/,
    );
    const conflictMembers = await client.execute({
      sql: `SELECT member.asserted_value, source.url
              FROM fact_conflicts conflict
              JOIN fact_conflict_members member
                ON member.conflict_id = conflict.id
              JOIN citations citation ON citation.id = member.citation_id
              JOIN source_items source ON source.id = citation.source_item_id
             WHERE conflict.entity_id = ? AND conflict.field_key = 'nib'
             ORDER BY member.asserted_value`,
      args: [PHASE30_INGENUITY_ID],
    });
    assert.deepEqual(
      conflictMembers.rows.map((row) => [
        String(row.asserted_value),
        String(row.url),
      ]),
      [
        [
          "F",
          "https://www.parkerpen.com/writing-types/collections/ingenuity/ingenuity-fountain-pen/SAP_2213726.html",
        ],
        [
          "M",
          "https://www.parkerromania.ro/cataloage1/Parker/Parker%20-%202026.pdf",
        ],
      ],
    );

    const exactSources = await client.execute({
      sql: `SELECT DISTINCT source.url, source.archive_locator,
                            source.published_at
              FROM entity_references reference
              JOIN source_items source ON source.id = reference.source_item_id
             WHERE reference.entity_id IN (?, ?, ?, ?)
               AND source.url IN (?, ?, ?, ?, ?)
             ORDER BY source.url`,
      args: [
        ...PEN_IDS,
        "https://www.penheaven.com/parker-ingenuity-black-gold-trim-fountain-pen",
        "https://www.parkerpen.com/writing-types/collections/urban/urban-fountain-pen/SP_1417014.html",
        "https://parkerpens.net/vector.html",
        "https://www.penheaven.com/parker-vector-xl-teal-fountain-pen",
        "https://www.parkerromania.ro/cataloage1/Parker/ParkerCatalog2022.pdf",
      ],
    });
    assert.equal(exactSources.rows.length, 5);
    const sourceByUrl = new Map(
      exactSources.rows.map((row) => [String(row.url), row]),
    );
    assert.match(
      String(
        sourceByUrl.get(
          "https://www.penheaven.com/parker-ingenuity-black-gold-trim-fountain-pen",
        )?.archive_locator,
      ),
      /SKU 2182006.*L140.*L165.*D13\.7.*45g/,
    );
    assert.match(
      String(
        sourceByUrl.get(
          "https://www.parkerpen.com/writing-types/collections/urban/urban-fountain-pen/SP_1417014.html",
        )?.archive_locator,
      ),
      /1931593.*Fine.*Stainless steel.*Lacquer on Brass/,
    );
    assert.match(
      String(
        sourceByUrl.get(
          "https://www.penheaven.com/parker-vector-xl-teal-fountain-pen",
        )?.archive_locator,
      ),
      /2159746.*L135.*L157.*D11\.5.*20g.*sold separately/,
    );
    assert.match(
      String(
        sourceByUrl.get(
          "https://www.parkerromania.ro/cataloage1/Parker/ParkerCatalog2022.pdf",
        )?.archive_locator,
      ),
      /Vector XL.*2159746.*Medium nib/,
    );

    const reusedSources = await client.execute({
      sql: `SELECT item.url, item.raw_metadata_json, registry.name,
                   registry.attribution, registry.default_independence_group
              FROM source_items item
              JOIN source_registry registry ON registry.id = item.source_id
             WHERE item.url IN (?, ?)
             ORDER BY item.url`,
      args: [
        "https://assets.parkerpen.com/is/content/NewellRubbermaid/DASH/S7_int/Fine_Writing/2021/prkr_trdctlg_2021.pdf",
        "https://www.parkerpen.com/fountain-pen-care-guides.html",
      ],
    });
    assert.equal(reusedSources.rows.length, 2);
    const reusedByUrl = new Map(
      reusedSources.rows.map((row) => [String(row.url), row]),
    );
    const catalogueSource = reusedByUrl.get(
      "https://assets.parkerpen.com/is/content/NewellRubbermaid/DASH/S7_int/Fine_Writing/2021/prkr_trdctlg_2021.pdf",
    );
    assert.match(
      String(catalogueSource?.raw_metadata_json),
      /"curatedSourceKey":"parker-2021-trade-catalogue"/,
    );
    assert.equal(String(catalogueSource?.name), "Parker trade catalogues");
    assert.equal(
      String(catalogueSource?.attribution),
      "Parker / Newell Brands",
    );
    assert.equal(
      String(catalogueSource?.default_independence_group),
      "parker-newell-official",
    );
    const careSource = reusedByUrl.get(
      "https://www.parkerpen.com/fountain-pen-care-guides.html",
    );
    assert.match(
      String(careSource?.raw_metadata_json),
      /"curatedSourceKey":"parker-care-guide"/,
    );
    assert.equal(String(careSource?.name), "Parker care guides");
    assert.equal(String(careSource?.attribution), "Parker / Newell Brands");
    assert.equal(
      String(careSource?.default_independence_group),
      "parker-newell-official",
    );

    const media = await client.execute({
      sql: `SELECT entity_id, title, local_path, license, attribution_text,
                   source_url, usage_status
              FROM media_assets
             WHERE entity_id IN (?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [...PEN_IDS],
    });
    assert.equal(media.rows.length, 4);
    const expectedMedia = new Map([
      [
        PHASE30_INGENUITY_ID,
        "/images/library/site-original/parker-p0/parker-ingenuity-factual-diagram.svg",
      ],
      [
        PHASE30_URBAN_ID,
        "/images/library/site-original/parker-p0/parker-urban-factual-diagram.svg",
      ],
      [
        PHASE30_VECTOR_ID,
        "/images/library/site-original/parker-p0/parker-vector-factual-diagram.svg",
      ],
      [
        PHASE30_VECTOR_XL_ID,
        "/images/library/site-original/parker-p0/parker-vector-xl-factual-diagram.svg",
      ],
    ]);
    for (const row of media.rows) {
      const entityId = String(row.entity_id);
      const localPath = String(row.local_path);
      assert.equal(localPath, expectedMedia.get(entityId));
      assert.equal(String(row.license), "site-original");
      assert.equal(String(row.usage_status), "primary");
      assert.match(String(row.title), /示意图.*非产品照片/);
      assert.match(String(row.attribution_text), /示意图，非产品照片/);
      assert.match(String(row.attribution_text), /未复制或临摹/);
      assert.equal(String(row.source_url), localPath);
      const svg = fs.readFileSync(
        path.join(ROOT, "public", localPath.slice(1)),
        "utf8",
      );
      assert.match(svg, /<desc id="description">/);
      assert.match(svg, /示意图，非产品照片/);
      assert.doesNotMatch(svg, /<image\b/i);
      if (entityId === PHASE30_VECTOR_XL_ID) {
        assert.match(svg, /2022 OFFICIAL CATALOGUE/);
        assert.match(svg, /launch date remains unverified/);
        assert.doesNotMatch(svg, /2021/);
      }
    }

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_references reference
           JOIN source_items source ON source.id = reference.source_item_id
          WHERE reference.entity_id IN (?, ?, ?, ?, ?)
            AND source.archive_url LIKE '%.planning/%'`,
        [PHASE30_PARKER_ID, ...PEN_IDS],
      ),
      0,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM publication_v2_source_group_counts
          WHERE entity_id IN (?, ?, ?, ?, ?)
            AND primary_archive_group_count >= 1
            AND professional_secondary_group_count >= 1`,
        [PHASE30_PARKER_ID, ...PEN_IDS],
      ),
      5,
    );

    const revisionsBeforeReplay = await client.execute({
      sql: `SELECT entity_id, status, blockers_json, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [PHASE30_PARKER_ID, ...PEN_IDS],
    });
    const replay = await applyPhase30ParkerP0Content(client, applyOptions);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop", "noop", "noop", "noop"],
    );
    const revisionsAfterReplay = await client.execute({
      sql: `SELECT entity_id, status, blockers_json, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?, ?, ?, ?)
             ORDER BY entity_id`,
      args: [PHASE30_PARKER_ID, ...PEN_IDS],
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
