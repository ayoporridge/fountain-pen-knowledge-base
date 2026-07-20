import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient, type Client } from "@libsql/client";
import { applyPhase83WatermanCurrentContent } from "../../scripts/apply-phase83-waterman-current-content";
import { PHASE83_ALLURE_SLUG } from "../../scripts/data/phase83-waterman-current";
import { copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const SLUGS = ["waterman", "waterman-carene", "waterman-expert", "waterman-hemisphere", PHASE83_ALLURE_SLUG];

async function scalar(client: Client, sql: string, args: string[] = []) { const result = await client.execute({ sql, args }); return Number(result.rows[0]?.value ?? 0); }

test("Phase 83 publishes source-bounded current Waterman fountain-pen series on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase83-waterman-")));
  const copy = copyCheckpointedCatalogToDisposableCopy(REAL_CATALOG, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot });
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = { workspaceRoot: ROOT, reviewer: "phase83-waterman-current-test", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: REAL_CATALOG, protectedCatalogSnapshot: protectedSnapshot, env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } } as const;
  try {
    await migrateDatabase(client);
    const first = await applyPhase83WatermanCurrentContent(client, options);
    assert.deepEqual(first.entities.map((entity) => entity.outcome), ["published", "published", "published", "published", "published"]);
    const pages = await client.execute({ sql: `SELECT id, type, slug, summary, body_md FROM public_entities WHERE slug IN (${SLUGS.map(() => "?").join(",")}) ORDER BY slug`, args: SLUGS });
    assert.equal(pages.rows.length, 5);
    for (const page of pages.rows) {
      const body = String(page.body_md ?? "");
      assert.ok(Array.from(String(page.summary ?? "")).length >= 60);
      assert.ok(Array.from(body).length >= (String(page.type) === "brand" ? 1_200 : 2_000));
      assert.match(body, /示意图，非产品照片/);
      assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|retired/i);
    }
    const bySlug = new Map(pages.rows.map((row) => [String(row.slug), row]));
    assert.match(String(bySlug.get("waterman-carene")?.body_md), /1997[\s\S]*18K[\s\S]*inset nib/);
    const expertBody = String(bySlug.get("waterman-expert")?.body_md);
    assert.match(expertBody, /1990–92/);
    assert.match(expertBody, /不锈钢尖/);
    assert.match(expertBody, /I、II、III/);
    const hemisphereBody = String(bySlug.get("waterman-hemisphere")?.body_md);
    assert.match(hemisphereBody, /1994/);
    assert.match(hemisphereBody, /(?:不锈钢尖|钢尖)/);
    assert.match(hemisphereBody, /Charleston/);
    const allureBody = String(bySlug.get(PHASE83_ALLURE_SLUG)?.body_md);
    assert.match(allureBody, /S0037650/);
    assert.match(allureBody, /Fine/);
    assert.match(allureBody, /没有给出可核.*首发年份/);
    const brand = bySlug.get("waterman");
    for (const slug of SLUGS.filter((slug) => slug !== "waterman")) {
      const pen = bySlug.get(slug);
      assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", [String(pen?.id), String(brand?.id)]), 1);
      assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", [String(pen?.id)]), 1);
      assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'", [String(brand?.id), String(pen?.id)]), 1);
      const media = await client.execute({ sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'", args: [String(pen?.id)] });
      assert.equal(media.rows.length, 1);
      const asset = path.join(ROOT, "public", String(media.rows[0]?.local_path).slice(1));
      assert.match(fs.readFileSync(asset, "utf8"), /示意图，非产品照片/);
    }
    const replay = await applyPhase83WatermanCurrentContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally { client.close(); fs.rmSync(ownedRoot, { recursive: true, force: true }); }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
