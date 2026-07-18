import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase24TwsbiContent } from "../../scripts/apply-phase24-twsbi-content";
import {
  assertCatalogSnapshotUnchanged,
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { publicMediaFilter } from "../../src/lib/public-media";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const TWSBI_ID = "YTHuH8c3R9zl";
const ECO_ID = "X1jZgxCD4osm";
const BRAND_IMAGE = path.join(
  ROOT,
  "public",
  "images",
  "library",
  "warm-pen-atlas",
  "twsbi-brand-cover.jpg",
);
const ECO_IMAGE = path.join(
  ROOT,
  "public",
  "images",
  "library",
  "wikimedia",
  "twsbi",
  "twsbi-eco-pavel-satrapa.jpg",
);

async function scalar(
  client: Client,
  sql: string,
  args: string[] = [],
): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 24 publishes TWSBI and ECO from an owned checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase24-twsbi-")),
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
      reviewer: "phase24-twsbi-curated-content",
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

    const first = await applyPhase24TwsbiContent(client, applyOptions);
    assert.deepEqual(
      first.entities.map((entity) => [entity.entityId, entity.outcome]),
      [
        [TWSBI_ID, "published"],
        [ECO_ID, "published"],
      ],
    );

    const publicRows = await client.execute({
      sql: `SELECT id, name, length(summary) AS summary_length,
                   length(body_md) AS body_length, body_md
              FROM public_entities
             WHERE id IN (?, ?)
             ORDER BY CASE id WHEN ? THEN 0 ELSE 1 END`,
      args: [TWSBI_ID, ECO_ID, TWSBI_ID],
    });
    assert.deepEqual(
      publicRows.rows.map((row) => String(row.id)),
      [TWSBI_ID, ECO_ID],
    );
    assert.equal(String(publicRows.rows[0]?.name), "三文堂 TWSBI");
    assert.equal(String(publicRows.rows[1]?.name), "三文堂 TWSBI ECO");
    assert.ok(Number(publicRows.rows[0]?.body_length) >= 1_200);
    assert.ok(Number(publicRows.rows[1]?.body_length) >= 2_000);
    for (const row of publicRows.rows) {
      assert.ok(Number(row.summary_length) >= 60);
      assert.ok(Number(row.summary_length) <= 160);
    }
    assert.match(
      String(publicRows.rows[0]?.body_md),
      /没有列出明确的品牌创立年份/,
    );
    assert.match(
      String(publicRows.rows[1]?.body_md),
      /ECO-T[\s\S]*不是普通 ECO 的一种配色/,
    );
    assert.match(String(publicRows.rows[1]?.body_md), /先做少，别急着拆/);

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links
          WHERE source_id = ? AND link_type = 'made_by'`,
        [ECO_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_links
          WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
        [ECO_ID, TWSBI_ID],
      ),
      1,
    );
    const publicModels = await client.execute({
      sql: `SELECT pen.id
              FROM entity_links link
              JOIN public_entities pen ON pen.id = link.source_id
              JOIN public_entities brand ON brand.id = link.target_id
             WHERE link.target_id = ? AND link.link_type = 'made_by'
             ORDER BY pen.id`,
      args: [TWSBI_ID],
    });
    const publicModelIds = publicModels.rows.map((row) => String(row.id));
    assert.ok(publicModelIds.includes(ECO_ID));
    assert.equal(new Set(publicModelIds).size, publicModelIds.length);

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_aliases
          WHERE entity_id = ? AND lower(alias) = 'twsbi'`,
        [TWSBI_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_aliases
          WHERE entity_id = ? AND lower(alias) = 'twsbi eco'`,
        [ECO_ID],
      ),
      1,
    );
    const variants = await client.execute({
      sql: `SELECT variant_name, variant_kind
              FROM model_variants
             WHERE model_entity_id = ?
             ORDER BY variant_name`,
      args: [ECO_ID],
    });
    const variantsByName = new Map(
      variants.rows.map((row) => [
        String(row.variant_name),
        String(row.variant_kind),
      ]),
    );
    for (const expectedVariant of [
      "ECO Black / Clear",
      "ECO Clear",
      "ECO White / Clear",
    ]) {
      assert.equal(variantsByName.get(expectedVariant), "color");
    }
    assert.equal(variantsByName.has("ECO-T"), false);

    const spec = await client.execute({
      sql: `SELECT series_name, release_year, nib, fill_system, material,
                   dimensions, weight, price_range, status
              FROM model_specs
             WHERE entity_id = ? AND review_status = 'approved'`,
      args: [ECO_ID],
    });
    assert.equal(spec.rows.length, 1);
    assert.match(String(spec.rows[0]?.release_year), /2015/);
    assert.match(String(spec.rows[0]?.nib), /Stub 1\.1/);
    assert.match(String(spec.rows[0]?.fill_system), /瓶装墨水/);
    assert.match(String(spec.rows[0]?.dimensions), /138\.8–139/);
    assert.equal(String(spec.rows[0]?.weight), "约 21 g");

    const references = await client.execute({
      sql: `SELECT source.title, source.url, source.source_tier,
                   source.archive_url, source.archive_locator
              FROM entity_references reference
              JOIN source_items source ON source.id = reference.source_item_id
             WHERE reference.entity_id = ?
             ORDER BY source.title`,
      args: [ECO_ID],
    });
    assert.ok(references.rows.length >= 8);
    const urls = new Set(references.rows.map((row) => String(row.url)));
    for (const expectedUrl of [
      "https://www.twsbi.com/products/twsbi-eco-black-fountain-pen",
      "https://www.twsbi.com/collections/fountain-pens/eco",
      "https://twsbijapan.com/products/twsbi-eco-black/",
      "https://www.gouletpens.com/products/twsbi-eco-fountain-pen-black",
      "https://www.thewritingdesk.co.uk/content/twsbi-nibs.html",
      "https://nibsmith.com/twsbi-eco-review/",
      "https://commons.wikimedia.org/wiki/File:TWSBI_Eco.jpg",
    ]) {
      assert.ok(urls.has(expectedUrl), `missing source ${expectedUrl}`);
    }
    for (const row of references.rows) {
      assert.ok(String(row.archive_url).length > 0);
      assert.ok(String(row.archive_locator).length > 0);
      assert.doesNotMatch(String(row.archive_url), /\.planning\//);
    }

    const media = await client.execute({
      sql: `SELECT entity_id, local_path, author, license,
                   attribution_text, source_url
              FROM media_assets
             WHERE entity_id IN (?, ?) AND usage_status = 'primary'
             ORDER BY CASE entity_id WHEN ? THEN 0 ELSE 1 END`,
      args: [TWSBI_ID, ECO_ID, TWSBI_ID],
    });
    assert.equal(media.rows.length, 2);
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM media_assets media
          WHERE media.entity_id IN (?, ?)
            AND ${publicMediaFilter("media")}`,
        [TWSBI_ID, ECO_ID],
      ),
      2,
    );
    assert.notEqual(
      String(media.rows[0]?.local_path),
      String(media.rows[1]?.local_path),
    );
    assert.equal(String(media.rows[0]?.license), "site-original");
    assert.equal(
      String(media.rows[0]?.local_path),
      "/images/library/warm-pen-atlas/twsbi-brand-cover.jpg",
    );
    assert.match(String(media.rows[0]?.author), /OpenAI image generation/);
    assert.match(String(media.rows[0]?.attribution_text), /本站原创编辑插画/);
    assert.match(String(media.rows[0]?.attribution_text), /AI 辅助制作/);
    assert.match(String(media.rows[0]?.attribution_text), /非 TWSBI 产品实拍/);
    assert.match(String(media.rows[0]?.attribution_text), /不代表任何具体型号/);
    assert.equal(String(media.rows[1]?.author), "Pavel.satrapa");
    assert.equal(String(media.rows[1]?.license), "cc-by-sa-4.0");
    assert.match(String(media.rows[1]?.attribution_text), /Wikimedia Commons/);
    assert.match(
      String(media.rows[1]?.attribution_text),
      /具体 TWSBI ECO 样本，不代表全部 ECO 配色/,
    );
    assert.match(String(media.rows[1]?.attribution_text), /未裁切、未改色/);
    assert.equal(
      String(media.rows[1]?.source_url),
      "https://commons.wikimedia.org/wiki/File:TWSBI_Eco.jpg",
    );
    for (const row of media.rows) {
      assert.ok(
        fs
          .statSync(path.join(ROOT, "public", String(row.local_path).slice(1)))
          .isFile(),
      );
    }
    assert.equal(
      createHash("sha256").update(fs.readFileSync(BRAND_IMAGE)).digest("hex"),
      "1285d45e6eb200bb958895a2614b21cb341d8b85e531a76a9134440686e89641",
    );
    assert.equal(
      createHash("sha256").update(fs.readFileSync(ECO_IMAGE)).digest("hex"),
      "722133c2a8d4071a079a65faed9a5f9b9c9232e839ca9ddab1937b6bf3b53bda",
    );

    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM source_items source
           JOIN media_assets media ON media.source_item_id = source.id
          WHERE media.entity_id = ? AND media.usage_status = 'primary'
            AND source.source_tier = 'primary'
            AND source.license = 'cc-by-sa-4.0'
            AND source.author = 'Pavel.satrapa'`,
        [ECO_ID],
      ),
      1,
    );
    assert.equal(
      await scalar(
        client,
        `SELECT count(*) AS value
           FROM entity_references reference
           JOIN source_items source ON source.id = reference.source_item_id
          WHERE reference.entity_id IN (?, ?)
            AND source.archive_url LIKE '%.planning/%'`,
        [TWSBI_ID, ECO_ID],
      ),
      0,
    );

    const timeline = await client.execute({
      sql: `SELECT entity_id, title, event_type, start_date, circa
              FROM timeline_events
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id, start_date, title`,
      args: [TWSBI_ID, ECO_ID],
    });
    const diamond530 = timeline.rows.find(
      (row) =>
        String(row.entity_id) === TWSBI_ID &&
        String(row.title) === "Diamond 530 推出",
    );
    assert.ok(diamond530);
    assert.equal(String(diamond530.start_date), "2010");
    assert.equal(String(diamond530.event_type), "model_released");
    assert.equal(Number(diamond530.circa), 0);
    const ecoAvailabilityEvents = timeline.rows.filter((row) =>
      String(row.title).includes("同期评测记录 ECO 已公开销售"),
    );
    assert.equal(ecoAvailabilityEvents.length, 2);
    for (const event of ecoAvailabilityEvents) {
      assert.equal(String(event.event_type), "community_event");
      assert.equal(String(event.start_date), "2015-07-31");
      assert.equal(Number(event.circa), 0);
    }

    const revisionsBeforeReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id`,
      args: [TWSBI_ID, ECO_ID],
    });
    const replay = await applyPhase24TwsbiContent(client, applyOptions);
    assert.deepEqual(
      replay.entities.map((entity) => entity.outcome),
      ["noop", "noop"],
    );
    const revisionsAfterReplay = await client.execute({
      sql: `SELECT entity_id, status, content_revision
              FROM entity_publications
             WHERE entity_id IN (?, ?)
             ORDER BY entity_id`,
      args: [TWSBI_ID, ECO_ID],
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
