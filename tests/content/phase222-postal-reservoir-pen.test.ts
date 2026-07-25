import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase222PostalContent } from "../../scripts/apply-phase222-postal-reservoir-pen-content";
import { PHASE222_POSTAL_BRAND_ID, PHASE222_POSTAL_BRAND_SLUG, PHASE222_POSTAL_ID, PHASE222_POSTAL_SLUG } from "../../scripts/data/phase222-postal-reservoir-pen";
import { assertCatalogSnapshotUnchanged, copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd(); const REAL = path.join(ROOT, "data", "fpkg.db");
test("Phase 222 publishes Postal Pen Company and The Postal Reservoir Pen on an owned copy", { timeout: 900_000 }, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL); const ownedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase222-postal-")); const copy = copyCheckpointedCatalogToDisposableCopy(REAL, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot }); const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = { workspaceRoot: ROOT, reviewer: "phase222-postal-test", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: REAL, protectedCatalogSnapshot: protectedSnapshot, env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } } as const;
  try { await migrateDatabase(client); await assert.rejects(() => applyPhase222PostalContent(client, { ...options, env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" } }), /refuses inherited remote database selection/); const first = await applyPhase222PostalContent(client, options); assert.deepEqual(first.entities.map((item) => item.entityId), [PHASE222_POSTAL_BRAND_ID, PHASE222_POSTAL_ID]); assert.ok(first.entities.every((item) => item.outcome === "published"), JSON.stringify(first));
    const identities = await client.execute({ sql: "SELECT id,type,slug FROM entities WHERE id IN (?,?)", args: [PHASE222_POSTAL_BRAND_ID, PHASE222_POSTAL_ID] }); assert.equal(identities.rows.length, 2); assert.equal(String(identities.rows.find((row) => row.id === PHASE222_POSTAL_ID)?.slug), PHASE222_POSTAL_SLUG); assert.equal(String(identities.rows.find((row) => row.id === PHASE222_POSTAL_BRAND_ID)?.slug), PHASE222_POSTAL_BRAND_SLUG);
    for (const [entityId, minimum] of [[PHASE222_POSTAL_BRAND_ID, 1200], [PHASE222_POSTAL_ID, 2000]] as const) { const row = await client.execute({ sql: "SELECT body_md,source FROM public_entities WHERE id=?", args: [entityId] }); const body = String(row.rows[0]?.body_md ?? ""); assert.ok(Array.from(body).length >= minimum); assert.doesNotMatch(body, /canonical|made_by|retired|数据库|仓库/i); assert.match(String(row.rows[0]?.source ?? ""), /curated-content:phase222/); assert.equal(Number((await client.execute({ sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'", args: [entityId] })).rows[0]?.value), 1); }
    assert.equal(Number((await client.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'", args: [PHASE222_POSTAL_ID, PHASE222_POSTAL_BRAND_ID] })).rows[0]?.value), 1); assert.equal(Number((await client.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'", args: [PHASE222_POSTAL_BRAND_ID, PHASE222_POSTAL_ID] })).rows[0]?.value), 1); const replay = await applyPhase222PostalContent(client, options); assert.ok(replay.entities.every((item) => item.outcome === "noop"), JSON.stringify(replay)); assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally { client.close(); fs.rmSync(ownedRoot, { recursive: true, force: true }); } assertCatalogSnapshotUnchanged(protectedSnapshot);
});
