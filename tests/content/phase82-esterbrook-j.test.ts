import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { type Client, createClient } from "@libsql/client";
import { applyPhase82EsterbrookJContent } from "../../scripts/apply-phase82-esterbrook-j-content";
import { PHASE69_ESTERBROOK_BRAND_ID } from "../../scripts/data/phase69-esterbrook-estie";
import { PHASE82_ESTERBROOK_J_SLUG } from "../../scripts/data/phase82-esterbrook-j";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");

async function scalar(client: Client, sql: string, args: string[] = []): Promise<number> {
  const result = await client.execute({ sql, args });
  return Number(result.rows[0]?.value ?? 0);
}

test("Phase 82 publishes historical Esterbrook Double Jewel J without absorbing modern lines", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase82-esterbrook-j-")));
  const copy = copyCheckpointedCatalogToDisposableCopy(REAL_CATALOG, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot });
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase82-esterbrook-j-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL_CATALOG,
    protectedCatalogSnapshot: protectedSnapshot,
    env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
  } as const;
  try {
    await migrateDatabase(client);
    const first = await applyPhase82EsterbrookJContent(client, options);
    assert.deepEqual(first.entities.map((entity) => entity.outcome), ["published", "published"]);
    const page = await client.execute({ sql: "SELECT id, type, summary, body_md FROM public_entities WHERE slug = ?", args: [PHASE82_ESTERBROOK_J_SLUG] });
    assert.equal(page.rows.length, 1);
    const historicJ = page.rows[0]!;
    assert.equal(String(historicJ.type), "pen");
    assert.ok(Array.from(String(historicJ.summary ?? "")).length >= 60);
    assert.ok(Array.from(String(historicJ.summary ?? "")).length <= 160);
    const body = String(historicJ.body_md ?? "");
    assert.ok(Array.from(body).length >= 2_000);
    assert.match(body, /Double Jewel[\s\S]*J[\s\S]*LJ[\s\S]*SJ/);
    assert.match(body, /1941[\s\S]*Visumaster/);
    assert.match(body, /lever filler/);
    assert.match(body, /Renew-Point/);
    assert.match(body, /1550[\s\S]*2048[\s\S]*2314/);
    assert.match(body, /Model J[\s\S]*Estie[\s\S]*JR/);
    assert.match(body, /示意图，非产品照片/);
    assert.doesNotMatch(body, /数据库|仓库|canonical|made_by|retired/i);
    const historicJId = String(historicJ.id);
    assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", [historicJId, PHASE69_ESTERBROOK_BRAND_ID]), 1);
    assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", [historicJId]), 1);
    assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'", [PHASE69_ESTERBROOK_BRAND_ID, historicJId]), 1);
    const missingBackLinks = await client.execute({
      sql: `SELECT pen.slug FROM public_entities pen
            JOIN entity_links maker ON maker.source_id = pen.id AND maker.target_id = ? AND maker.link_type = 'made_by'
            LEFT JOIN entity_links reverse ON reverse.source_id = ? AND reverse.target_id = pen.id AND reverse.link_type = 'reverse'
            WHERE pen.type = 'pen' GROUP BY pen.id, pen.slug HAVING count(reverse.id) <> 1`,
      args: [PHASE69_ESTERBROOK_BRAND_ID, PHASE69_ESTERBROOK_BRAND_ID],
    });
    assert.equal(missingBackLinks.rows.length, 0, "every public Esterbrook model must retain exactly one brand navigation link");
    const asset = await client.execute({ sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'", args: [historicJId] });
    assert.equal(asset.rows.length, 1);
    assert.match(String(asset.rows[0]?.local_path), /esterbrook-j-series-double-jewel\.svg$/);
    assert.match(fs.readFileSync(path.join(ROOT, "public", String(asset.rows[0]?.local_path).slice(1)), "utf8"), /示意图，非产品照片/);
    const modern = await client.execute({ sql: "SELECT count(*) AS value FROM entities WHERE id = ? AND type = 'brand' AND slug = 'esterbrook'", args: [PHASE69_ESTERBROOK_BRAND_ID] });
    assert.equal(Number(modern.rows[0]?.value ?? 0), 1);
    const replay = await applyPhase82EsterbrookJContent(client, options);
    assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
