import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase25KawecoContent } from "../../scripts/apply-phase25-kaweco-content";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const KAWECO_ID = "mRz7MvzUYwVF";
const CLASSIC_SPORT_ID = "JhyxWW1Ylw-A";

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 25 publishes Kaweco and Classic Sport from an owned checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase25-kaweco-")),
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
      reviewer: "phase25-kaweco-curated-content",
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

    const first = await applyPhase25KawecoContent(client, applyOptions);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [KAWECO_ID, "published"],
        [CLASSIC_SPORT_ID, "published"],
      ],
    );

    const publicRows = await client.execute({
      sql: `SELECT id, slug, name, length(summary) AS summary_length,
                   length(body_md) AS body_length, body_md
              FROM public_entities
             WHERE id IN (?, ?)
             ORDER BY CASE id WHEN ? THEN 0 ELSE 1 END`,
      args: [KAWECO_ID, CLASSIC_SPORT_ID, KAWECO_ID],
    });
    assert.deepEqual(
      publicRows.rows.map((row) => [
        String(row.id),
        String(row.slug),
        String(row.name),
      ]),
      [
        [KAWECO_ID, "kaweco", "Kaweco"],
        [CLASSIC_SPORT_ID, "kaweco-sport", "Kaweco Classic Sport"],
      ],
    );
    assert.ok(Number(publicRows.rows[0]?.body_length) >= 1_200);
    assert.ok(Number(publicRows.rows[1]?.body_length) >= 2_000);
    for (const row of publicRows.rows) {
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.summary_length) <= 160);
    }
    assert.match(String(publicRows.rows[0]?.body_md), /1994 年.*名称权/);
    assert.match(
      String(publicRows.rows[1]?.body_md),
      /Classic Sport 不是整个 Sport 家族/,
    );
    assert.match(String(publicRows.rows[1]?.body_md), /Sport 用作一个家族/);
    assert.match(
      String(publicRows.rows[1]?.body_md),
      /不是 Classic Sport 的颜色/,
    );

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links
          WHERE source_id = ? AND link_type = 'made_by'`,
        [CLASSIC_SPORT_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links
          WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
        [CLASSIC_SPORT_ID, KAWECO_ID],
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
      args: [KAWECO_ID],
    });
    const publicModelTuples = publicModels.rows.map((row) => [
      String(row.id),
      String(row.slug),
      String(row.name),
    ]);
    assert.equal(
      publicModelTuples.filter(
        ([id, slug, name]) =>
          id === CLASSIC_SPORT_ID &&
          slug === "kaweco-sport" &&
          name === "Kaweco Classic Sport",
      ).length,
      1,
    );

    const brandSourceProvenance = await client.execute({
      sql: `SELECT source.url, source.source_tier, registry.source_type
              FROM entity_references reference
              JOIN source_items source ON source.id = reference.source_item_id
              JOIN source_registry registry ON registry.id = source.source_id
             WHERE reference.entity_id = ?
               AND source.url IN (?, ?)`,
      args: [
        KAWECO_ID,
        "https://www.thepencompany.com/blog/meet-the-brand/kaweco/",
        "https://wiki.fountainpen.it/Kaweco/en",
      ],
    });
    const provenanceByUrl = new Map(
      brandSourceProvenance.rows.map((row) => [
        String(row.url),
        [String(row.source_type), String(row.source_tier)],
      ]),
    );
    assert.deepEqual(
      provenanceByUrl.get(
        "https://www.thepencompany.com/blog/meet-the-brand/kaweco/",
      ),
      ["retailer", "retailer"],
    );
    assert.deepEqual(
      provenanceByUrl.get("https://wiki.fountainpen.it/Kaweco/en"),
      ["blog", "professional_secondary"],
    );

    const spec = await client.execute({
      sql: `SELECT series_name, origin_country, nib, fill_system, material,
                   dimensions, weight, status
              FROM model_specs
             WHERE entity_id = ? AND review_status = 'approved'`,
      args: [CLASSIC_SPORT_ID],
    });
    assert.equal(spec.rows.length, 1);
    assert.equal(
      String(spec.rows[0]?.series_name),
      "Classic Sport（Sport 家族的塑料支线）",
    );
    assert.equal(
      String(spec.rows[0]?.fill_system),
      "一支标准短墨囊；Kaweco Mini Converter 可选",
    );
    assert.equal(
      String(spec.rows[0]?.material),
      "塑料笔身、金色饰件；不含 AL／Brass／Steel 支线",
    );
    assert.equal(
      String(spec.rows[0]?.weight),
      "约 10.7 g（当前 Navy SKU 属性表）",
    );
    assert.match(String(spec.rows[0]?.nib), /EF、F、M、B、BB/);
    assert.doesNotMatch(String(spec.rows[0]?.fill_system), /活塞/);

    const variants = await client.execute({
      sql: `SELECT variant_name, variant_kind
              FROM model_variants
             WHERE model_entity_id = ?
             ORDER BY variant_kind, variant_name`,
      args: [CLASSIC_SPORT_ID],
    });
    assert.equal(variants.rows.length, 12);
    assert.deepEqual(
      variants.rows
        .filter((row) => String(row.variant_kind) === "nib")
        .map((row) => String(row.variant_name))
        .sort(),
      ["B 镀金钢尖", "BB 镀金钢尖", "EF 镀金钢尖", "F 镀金钢尖", "M 镀金钢尖"],
    );
    assert.deepEqual(
      variants.rows
        .filter((row) => String(row.variant_kind) === "color")
        .map((row) => String(row.variant_name))
        .sort(),
      [
        "Guilloche Black 历史纹样",
        "波尔多红",
        "白色",
        "红色",
        "海军蓝",
        "黑色",
        "绿色",
      ].sort(),
    );
    assert.equal(
      variants.rows.some((row) =>
        /AL|Brass|Steel|Piston|黄铜|不锈钢|活塞/.test(String(row.variant_name)),
      ),
      false,
    );

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_aliases
          WHERE entity_id = ?
            AND lower(alias) IN ('kaweco sport', 'kaweco al sport', 'kaweco brass sport',
                                 'kaweco steel sport', 'kaweco piston sport')`,
        [CLASSIC_SPORT_ID],
      ),
      0,
    );

    const dimensionConflict = await client.execute({
      sql: `SELECT status, resolution_note
              FROM fact_conflicts
             WHERE entity_id = ? AND field_key = 'dimensions'`,
      args: [CLASSIC_SPORT_ID],
    });
    assert.equal(dimensionConflict.rows.length, 1);
    assert.equal(String(dimensionConflict.rows[0]?.status), "resolved");
    assert.match(
      String(dimensionConflict.rows[0]?.resolution_note),
      /圆整值.*SKU 属性表/,
    );

    const media = await client.execute({
      sql: `SELECT entity_id, title, local_path, license, attribution_text,
                   source_url
              FROM media_assets
             WHERE entity_id IN (?, ?) AND usage_status = 'primary'
             ORDER BY CASE entity_id WHEN ? THEN 0 ELSE 1 END`,
      args: [KAWECO_ID, CLASSIC_SPORT_ID, KAWECO_ID],
    });
    assert.equal(media.rows.length, 2);
    assert.equal(String(media.rows[0]?.license), "cc-by-sa-4.0");
    assert.equal(String(media.rows[1]?.license), "cc-by-sa-3.0");
    assert.match(String(media.rows[0]?.title), /Kaweco Special/);
    assert.match(
      String(media.rows[0]?.attribution_text),
      /上方.*Special FP 钢笔/,
    );
    assert.match(String(media.rows[0]?.attribution_text), /下方.*圆珠笔/);
    assert.match(String(media.rows[0]?.attribution_text), /所有物件.*钢笔规格/);
    assert.match(String(media.rows[0]?.attribution_text), /不是 Classic Sport/);
    assert.match(String(media.rows[0]?.attribution_text), /Mark Benecke/);
    assert.match(String(media.rows[0]?.attribution_text), /CC BY-SA 4\.0/);
    assert.match(String(media.rows[0]?.attribution_text), /1800 px/);
    assert.equal(
      String(media.rows[0]?.source_url),
      "https://commons.wikimedia.org/wiki/File:Kaweco_pens.jpg",
    );
    assert.match(String(media.rows[1]?.title), /Classic Sport/);
    assert.match(String(media.rows[1]?.attribution_text), /Olgierd Rudak/);
    assert.match(String(media.rows[1]?.attribution_text), /CC BY-SA 3\.0/);
    assert.match(
      String(media.rows[1]?.attribution_text),
      /不代表当前固定在售色表/,
    );
    assert.equal(
      String(media.rows[1]?.source_url),
      "https://czasopismo.legeartis.org/2020/10/wspolzawodnictwo-sportowe-noszenie-maseczki/",
    );

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
           FROM media_assets
          WHERE entity_id IN (?, ?) AND usage_status = 'primary'
            AND local_path LIKE '%warm-pen-atlas%'`,
        [KAWECO_ID, CLASSIC_SPORT_ID],
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
        [KAWECO_ID, CLASSIC_SPORT_ID],
      ),
      0,
    );
    const brandTimeline = await client.execute({
      sql: `SELECT title, event_type
              FROM timeline_events
             WHERE entity_id = ? AND review_status = 'approved'
             ORDER BY start_date`,
      args: [KAWECO_ID],
    });
    assert.deepEqual(
      brandTimeline.rows.map((row) => [
        String(row.title),
        String(row.event_type),
      ]),
      [
        ["Heidelberger Federhalterfabrik 成立", "design_milestone"],
        ["官方年表首次记录 Sport 口袋笔语境", "design_milestone"],
        ["Knust, Woringen und Grube 收购 Kaweco 名称与资产", "acquisition"],
        ["h&m gutberlet 取得名称权并重启 Sport", "revival"],
      ],
    );

    const classicTimeline = await client.execute({
      sql: `SELECT title, event_type
              FROM timeline_events
             WHERE entity_id = ? AND review_status = 'approved'
             ORDER BY start_date`,
      args: [CLASSIC_SPORT_ID],
    });
    assert.deepEqual(
      classicTimeline.rows.map((row) => [
        String(row.title),
        String(row.event_type),
      ]),
      [
        ["Sport 口袋笔语境见于官方年表", "design_milestone"],
        ["现代 Sport 系列重启", "revival"],
      ],
    );

    const revisionsBeforeReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id`,
      args: [KAWECO_ID, CLASSIC_SPORT_ID],
    });
    const replay = await applyPhase25KawecoContent(client, applyOptions);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    const revisionsAfterReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id`,
      args: [KAWECO_ID, CLASSIC_SPORT_ID],
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
