import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase217Lily910Content } from "../../scripts/apply-phase217-lily-910-content";
import { PHASE217_LILY_910_ID, PHASE217_LILY_910_SLUG, PHASE217_LILY_BRAND_ID } from "../../scripts/data/phase217-lily-910";
import { assertCatalogSnapshotUnchanged, copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd(); const REAL = path.join(ROOT, "data", "fpkg.db");
test("Phase 217 publishes Lily and Lily 910 on an owned copy", { timeout: 900_000 }, async () => {
  const snapshot = snapshotCatalogFiles(REAL); const ownedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase217-lily-")); const copy = copyCheckpointedCatalogToDisposableCopy(REAL, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: snapshot }); const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = { workspaceRoot: ROOT, reviewer: "phase217-lily-910-test", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: REAL, protectedCatalogSnapshot: snapshot, env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } } as const;
  try {
    await migrateDatabase(client); await assert.rejects(() => applyPhase217Lily910Content(client, { ...options, env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" } }), /refuses inherited remote database selection/);
    const first = await applyPhase217Lily910Content(client, options); assert.deepEqual(first.entities.map((item) => item.entityId), [PHASE217_LILY_BRAND_ID, PHASE217_LILY_910_ID]); assert.ok(first.entities.every((item) => item.outcome === "published"), JSON.stringify(first));
    const identities = await client.execute({ sql: "SELECT id,type,slug FROM entities WHERE id IN (?,?) ORDER BY id", args: [PHASE217_LILY_BRAND_ID, PHASE217_LILY_910_ID] }); assert.equal(identities.rows.length, 2); assert.equal(identities.rows.find((row) => row.id === PHASE217_LILY_910_ID)?.slug, PHASE217_LILY_910_SLUG);
    for (const entityId of [PHASE217_LILY_BRAND_ID, PHASE217_LILY_910_ID]) { const publicRow = await client.execute({ sql: "SELECT body_md,source FROM public_entities WHERE id=?", args: [entityId] }); const body = String(publicRow.rows[0]?.body_md ?? ""); assert.ok(Array.from(body).length >= (entityId === PHASE217_LILY_910_ID ? 2000 : 1200)); assert.doesNotMatch(body, /canonical|made_by|retired|数据库|仓库/i); assert.match(String(publicRow.rows[0]?.source ?? ""), /curated-content:phase217/); assert.equal(Number((await client.execute({ sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'", args: [entityId] })).rows[0]?.value), 1); }
    const modelBody = String((await client.execute({ sql: "SELECT body_md FROM public_entities WHERE id=?", args: [PHASE217_LILY_910_ID] })).rows[0]?.body_md ?? ""); assert.match(modelBody, /无帽|aerometric|维护|选购|shutter/); assert.equal(Number((await client.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'", args: [PHASE217_LILY_910_ID, PHASE217_LILY_BRAND_ID] })).rows[0]?.value), 1);
    const replay = await applyPhase217Lily910Content(client, options); assert.ok(replay.entities.every((item) => item.outcome === "noop"), JSON.stringify(replay)); assertCatalogSnapshotUnchanged(snapshot);
  } finally { client.close(); fs.rmSync(ownedRoot, { recursive: true, force: true }); }
});
