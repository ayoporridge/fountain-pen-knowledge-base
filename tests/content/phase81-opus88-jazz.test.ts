import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient, type Client } from "@libsql/client";
import { applyPhase57Opus88LeonardoContent } from "../../scripts/apply-phase57-opus88-leonardo-content";
import { applyPhase81Opus88JazzContent } from "../../scripts/apply-phase81-opus88-jazz-content";
import { PHASE81_JAZZ_SLUG, PHASE81_OPUS_BRAND_ID } from "../../scripts/data/phase81-opus88-jazz";
import { PHASE57_OPUS_DEMO_ID, PHASE57_OPUS_KOLORO_ID } from "../../scripts/data/phase57-opus88-leonardo";
import { copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");

async function scalar(client: Client, sql: string, args: string[] = []): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 81 publishes an independent Opus 88 Jazz page and complete brand navigation on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase81-opus88-jazz-")));
  const copy = copyCheckpointedCatalogToDisposableCopy(REAL_CATALOG, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot });
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase81-opus88-jazz-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL_CATALOG,
    protectedCatalogSnapshot: protectedSnapshot,
    env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
  } as const;
  try {
    await migrateDatabase(client);
    await applyPhase57Opus88LeonardoContent(client, { ...options, reviewer: "phase81-opus88-prerequisite" });
    await assert.rejects(
      applyPhase81Opus88JazzContent(client, { ...options, env: { ...options.env, FPKG_DATABASE_URL: "file:unauthorized-phase81" } }),
      /refuses inherited remote selection: FPKG_DATABASE_URL/,
    );
    const first = await applyPhase81Opus88JazzContent(client, options);
    assert.deepEqual(first.entities.map((entity) => entity.outcome), ["published", "published"]);

    const pages = await client.execute({
      sql: "SELECT id, type, slug, summary, body_md FROM public_entities WHERE id = ? OR slug = ? ORDER BY type, slug",
      args: [PHASE81_OPUS_BRAND_ID, PHASE81_JAZZ_SLUG],
    });
    assert.equal(pages.rows.length, 2);
    const brand = pages.rows.find((row) => String(row.id) === PHASE81_OPUS_BRAND_ID);
    const jazz = pages.rows.find((row) => String(row.slug) === PHASE81_JAZZ_SLUG);
    assert.equal(String(brand?.type), "brand");
    assert.equal(String(jazz?.type), "pen");
    assert.notEqual(String(jazz?.id), PHASE57_OPUS_DEMO_ID);
    assert.notEqual(String(jazz?.id), PHASE57_OPUS_KOLORO_ID);
    assert.ok(Array.from(String(brand?.body_md ?? "")).length >= 1_200);
    assert.ok(Array.from(String(jazz?.summary ?? "")).length >= 60);
    assert.ok(Array.from(String(jazz?.summary ?? "")).length <= 160);
    const body = String(jazz?.body_md ?? "");
    assert.ok(Array.from(body).length >= 2_000);
    assert.match(body, /151\.2 mm[\s\S]*15\.2 mm[\s\S]*28 g/);
    assert.match(body, /3 ml[\s\S]*2 ml/);
    assert.match(body, /#6 JoWo/);
    assert.match(body, /Koloro/);
    assert.match(body, /Omar/);
    assert.match(body, /Opera/);
    assert.match(body, /示意图，非产品照片/);
    assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|market_sku|slug/i);

    assert.equal(
      await scalar(client, "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", [String(jazz?.id), PHASE81_OPUS_BRAND_ID]),
      1,
    );
    const missingReverse = await scalar(client, `SELECT count(*) AS value
      FROM (
        SELECT pen.id
          FROM public_entities pen
          JOIN entity_links maker ON maker.source_id = pen.id AND maker.target_id = ? AND maker.link_type = 'made_by'
     LEFT JOIN entity_links reverse ON reverse.source_id = ? AND reverse.target_id = pen.id AND reverse.link_type = 'reverse'
         WHERE pen.type = 'pen'
         GROUP BY pen.id
        HAVING count(reverse.id) <> 1
      ) missing`, [PHASE81_OPUS_BRAND_ID, PHASE81_OPUS_BRAND_ID]);
    assert.equal(missingReverse, 0, "every published Opus 88 model must be linked from the brand");
    assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_redirects WHERE source_path = ? OR (source_path = ? AND target_path = ?)", ["/pen/opus-88-demo-kolora", "/pen/opus-88-demo-kolora", `/pen/${PHASE81_JAZZ_SLUG}`]), 0);

    const media = await client.execute({ sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'", args: [String(jazz?.id)] });
    assert.equal(media.rows.length, 1);
    const localPath = String(media.rows[0]?.local_path);
    assert.match(localPath, /opus88-jazz-structure\.svg$/);
    assert.match(fs.readFileSync(path.join(ROOT, "public", localPath.slice(1)), "utf8"), /示意图，非产品照片/);

    const replay = await applyPhase81Opus88JazzContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
