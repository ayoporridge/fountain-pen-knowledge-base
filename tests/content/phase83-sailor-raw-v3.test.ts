import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase83SailorRawV3Content } from "../../scripts/apply-phase83-sailor-raw-v3-content";
import { PHASE83_MODELS, PHASE83_SAILOR_BRAND_ID } from "../../scripts/data/phase83-sailor-raw-v3";
import { copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
async function scalar(client: Client, sql: string, args: string[] = []) { const result = await client.execute({ sql, args }); return Number(result.rows[0]?.value ?? 0); }

test("Phase 83 updates only the four exact Sailor raw rows and preserves SKU boundaries", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase83-sailor-")));
  const copy = copyCheckpointedCatalogToDisposableCopy(REAL_CATALOG, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot });
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = { workspaceRoot: ROOT, reviewer: "phase83-sailor-raw-v3-test", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: REAL_CATALOG, protectedCatalogSnapshot: protectedSnapshot, env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } } as const;
  try {
    await migrateDatabase(client);
    const first = await applyPhase83SailorRawV3Content(client, options);
    assert.equal(first.entities.length, 5);
    assert.ok(first.entities.every((entity) => entity.outcome === "published"));
    for (const model of PHASE83_MODELS) {
      const page = await client.execute({ sql: "SELECT id, type, slug, summary, body_md FROM public_entities WHERE slug = ?", args: [model.slug] });
      assert.equal(page.rows.length, 1, model.slug); assert.equal(String(page.rows[0]?.type), "pen");
      const summary = String(page.rows[0]?.summary ?? ""), body = String(page.rows[0]?.body_md ?? "");
      assert.ok(summary.length >= 60 && summary.length <= 160, model.slug); assert.ok(body.length >= 2_000, model.slug);
      assert.match(body, /示意图，非产品照片/); assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|retired/i);
      const id = String(page.rows[0]?.id);
      assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", [id, PHASE83_SAILOR_BRAND_ID]), 1);
      assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", [id]), 1);
      assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'", [PHASE83_SAILOR_BRAND_ID, id]), 1);
      const redirect = await client.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [`/pen/${model.rawSlug}`] });
      assert.deepEqual(redirect.rows, [{ target_path: `/pen/${model.slug}`, redirect_kind: "permanent" }]);
      const asset = await client.execute({ sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'", args: [id] });
      assert.equal(asset.rows.length, 1); assert.match(String(asset.rows[0]?.local_path), /sailor-phase83\/.+\.svg$/);
      assert.match(fs.readFileSync(path.join(ROOT, "public", String(asset.rows[0]?.local_path).slice(1)), "utf8"), /示意图，非产品照片/);
    }
    const promenade = await client.execute({ sql: "SELECT body_md FROM public_entities WHERE slug = 'sailor-promenade-11-1031'" });
    const promenadeBody = String(promenade.rows[0]?.body_md);
    assert.match(promenadeBody, /约 136\.7–137 mm/);
    assert.match(promenadeBody, /约 18\.2 g/);
    assert.match(promenadeBody, /11-1033/);
    assert.match(promenadeBody, /不虚构精确停产日/);
    const young = await client.execute({ sql: "SELECT body_md FROM public_entities WHERE slug = 'sailor-young-profit-11-0501'" });
    const youngBody = String(young.rows[0]?.body_md);
    assert.match(youngBody, /钢尖/);
    assert.match(youngBody, /11-1219/);
    assert.match(youngBody, /11-0570\/11-0571/);
    assert.match(youngBody, /约 15 g/);
    const st = await client.execute({ sql: "SELECT body_md FROM public_entities WHERE slug = 'sailor-profit-st-11-1029'" });
    const stBody = String(st.rows[0]?.body_md);
    assert.match(stBody, /11-1029/);
    assert.match(stBody, /11-2024/);
    assert.match(stBody, /21K/);
    assert.match(stBody, /11-3048/);
    assert.match(stBody, /11-1229/);
    const shikiori = await client.execute({ sql: "SELECT body_md FROM public_entities WHERE slug = 'sailor-shikiori-setsugetsu-soraha-11-1224'" });
    const shikioriBody = String(shikiori.rows[0]?.body_md);
    assert.match(shikioriBody, /春空/);
    assert.match(shikioriBody, /万叶/);
    assert.match(shikioriBody, /名月/);
    assert.match(shikioriBody, /垂雪/);
    assert.match(shikioriBody, /-105\/-305/);
    assert.match(shikioriBody, /雪椿/);
    assert.match(shikioriBody, /-104\/-304/);
    assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_links p LEFT JOIN entity_links r ON r.source_id = ? AND r.target_id = p.source_id AND r.link_type = 'reverse' WHERE p.target_id = ? AND p.link_type = 'made_by' AND r.id IS NULL", [PHASE83_SAILOR_BRAND_ID, PHASE83_SAILOR_BRAND_ID]), 0);
    const second = await applyPhase83SailorRawV3Content(client, options); assert.ok(second.entities.every((entity) => entity.outcome === "noop"));
  } finally { client.close(); fs.rmSync(ownedRoot, { recursive: true, force: true }); }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
