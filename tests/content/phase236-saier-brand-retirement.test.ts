import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase236SaierBrandRetirement, PHASE236_SAIER_ID, PHASE236_SAIER_NIB_ID } from "../../scripts/apply-phase236-saier-brand-retirement";
import { assertCatalogSnapshotUnchanged, copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

test("Phase 236 retires the unsupported Saier brand shell and keeps the nib identity separate", { timeout: 300_000 }, async () => {
  const root = process.cwd(); const real = path.join(root, "data", "fpkg.db"); const protectedSnapshot = snapshotCatalogFiles(real); const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase236-saier-"))); const copy = copyCheckpointedCatalogToDisposableCopy(real, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot }); const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = { workspaceRoot: root, reviewer: "phase236-saier-test", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: real, protectedCatalogSnapshot: protectedSnapshot, env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } } as const;
  try {
    await migrateDatabase(client);
    await assert.rejects(() => applyPhase236SaierBrandRetirement(client, { ...options, env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" } }), /refuses inherited remote selection/);
    assert.deepEqual(await applyPhase236SaierBrandRetirement(client, options), { entityId: PHASE236_SAIER_ID, outcome: "retired" });
    assert.deepEqual((await client.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [PHASE236_SAIER_NIB_ID] })).rows, [{ type: "nib", slug: "塞尔-3-0-ef尖" }]);
    assert.equal((await client.execute({ sql: "SELECT status FROM entity_publications WHERE entity_id=?", args: [PHASE236_SAIER_ID] })).rows[0]?.status, "retired");
    assert.deepEqual((await client.execute({ sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?", args: ["/brand/saier"] })).rows, [{ target_path: null, redirect_kind: "hard_404" }]);
    assert.equal(Number((await client.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? OR target_id=?", args: [PHASE236_SAIER_ID, PHASE236_SAIER_ID] })).rows[0]?.value), 0);
    assert.equal(Number((await client.execute({ sql: "SELECT count(*) AS value FROM taxonomy_actions WHERE source_row_key=? AND action_kind='retire'", args: ["phase236-saier-brand-retirement"] })).rows[0]?.value), 1);
    assert.deepEqual(await applyPhase236SaierBrandRetirement(client, options), { entityId: PHASE236_SAIER_ID, outcome: "noop" });
  } finally { client.close(); fs.rmSync(ownedRoot, { recursive: true, force: true }); }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
