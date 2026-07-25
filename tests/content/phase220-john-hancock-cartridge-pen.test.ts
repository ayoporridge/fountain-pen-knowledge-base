import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase220JohnHancockContent } from "../../scripts/apply-phase220-john-hancock-cartridge-pen-content";
import { PHASE220_JOHN_HANCOCK_ID, PHASE220_JOHN_HANCOCK_SLUG, PHASE220_POLLOCK_BRAND_ID, PHASE220_POLLOCK_BRAND_SLUG } from "../../scripts/data/phase220-john-hancock-cartridge-pen";
import { assertCatalogSnapshotUnchanged, copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data", "fpkg.db");

test("Phase 220 publishes Pollock Pen Co. and John Hancock on an owned copy", { timeout: 900_000 }, async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase220-john-hancock-"));
  const copy = copyCheckpointedCatalogToDisposableCopy(REAL, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot });
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = {
    workspaceRoot: ROOT,
    reviewer: "phase220-john-hancock-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
  } as const;
  try {
    await migrateDatabase(client);
    await assert.rejects(() => applyPhase220JohnHancockContent(client, { ...options, env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" } }), /refuses inherited remote database selection/);
    const first = await applyPhase220JohnHancockContent(client, options);
    assert.deepEqual(first.entities.map((item) => item.entityId), [PHASE220_POLLOCK_BRAND_ID, PHASE220_JOHN_HANCOCK_ID]);
    assert.ok(first.entities.every((item) => item.outcome === "published"), JSON.stringify(first));
    const rows = await client.execute({ sql: "SELECT id,type,slug FROM entities WHERE id IN (?,?) ORDER BY id", args: [PHASE220_POLLOCK_BRAND_ID, PHASE220_JOHN_HANCOCK_ID] });
    assert.deepEqual(rows.rows, [
      { id: PHASE220_JOHN_HANCOCK_ID, type: "pen", slug: PHASE220_JOHN_HANCOCK_SLUG },
      { id: PHASE220_POLLOCK_BRAND_ID, type: "brand", slug: PHASE220_POLLOCK_BRAND_SLUG },
    ].sort((a, b) => String(a.id).localeCompare(String(b.id))));
    for (const [entityId, minimum] of [[PHASE220_POLLOCK_BRAND_ID, 1200], [PHASE220_JOHN_HANCOCK_ID, 2000]] as const) {
      const publicRow = await client.execute({ sql: "SELECT body_md,source FROM public_entities WHERE id=?", args: [entityId] });
      const body = String(publicRow.rows[0]?.body_md ?? "");
      assert.ok(Array.from(body).length >= minimum, `${entityId} body too short: ${body.length}`);
      assert.doesNotMatch(body, /canonical|made_by|retired|数据库|仓库/i);
      assert.match(String(publicRow.rows[0]?.source ?? ""), /curated-content:phase220/);
      assert.equal(Number((await client.execute({ sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'", args: [entityId] })).rows[0]?.value), 1);
    }
    assert.equal(Number((await client.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'", args: [PHASE220_JOHN_HANCOCK_ID, PHASE220_POLLOCK_BRAND_ID] })).rows[0]?.value), 1);
    assert.equal(Number((await client.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'", args: [PHASE220_POLLOCK_BRAND_ID, PHASE220_JOHN_HANCOCK_ID] })).rows[0]?.value), 1);
    const replay = await applyPhase220JohnHancockContent(client, options);
    assert.ok(replay.entities.every((item) => item.outcome === "noop"), JSON.stringify(replay));
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
