import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase233EmptyBrandShellRetirement, PHASE233_EMPTY_BRANDS } from "../../scripts/apply-phase233-empty-brand-shell-retirement";
import { assertCatalogSnapshotUnchanged, copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

test("Phase 233 retires only empty BanJu/ShangHai brand shells on an owned checkpoint", { timeout: 300_000 }, async () => {
  const root = process.cwd(); const real = path.join(root, "data", "fpkg.db"); const protectedSnapshot = snapshotCatalogFiles(real); const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase233-empty-brand-"))); const copy = copyCheckpointedCatalogToDisposableCopy(real, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot }); const client = createClient({ url: `file:${copy.destinationPath}` });
  try {
    await migrateDatabase(client);
    await assert.rejects(() => applyPhase233EmptyBrandShellRetirement(client, { workspaceRoot: root, reviewer: "phase233-test", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: real, protectedCatalogSnapshot: protectedSnapshot, env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "libsql://remote" } }), /refuses inherited remote selection/);
    const first = await applyPhase233EmptyBrandShellRetirement(client, { workspaceRoot: root, reviewer: "phase233-test", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: real, protectedCatalogSnapshot: protectedSnapshot, env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } });
    assert.deepEqual(first.map((item) => item.outcome), ["retired", "retired"]);
    for (const target of PHASE233_EMPTY_BRANDS) {
      assert.deepEqual((await client.execute({ sql: "SELECT type,slug,name FROM entities WHERE id=?", args: [target.id] })).rows, [{ type: "brand", slug: target.slug, name: target.name }]);
      assert.equal((await client.execute({ sql: "SELECT status FROM entity_publications WHERE entity_id=?", args: [target.id] })).rows[0]?.status, "retired");
      assert.deepEqual((await client.execute({ sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?", args: [`/brand/${target.slug}`] })).rows, [{ target_path: null, redirect_kind: "hard_404" }]);
      assert.equal(Number((await client.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? OR target_id=?", args: [target.id, target.id] })).rows[0]?.value), 0);
      assert.equal(Number((await client.execute({ sql: "SELECT count(*) AS value FROM taxonomy_actions WHERE source_row_key=? AND action_kind='retire'", args: [target.sourceKey] })).rows[0]?.value), 1);
    }
    assert.deepEqual((await applyPhase233EmptyBrandShellRetirement(client, { workspaceRoot: root, reviewer: "phase233-test", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: real, protectedCatalogSnapshot: protectedSnapshot, env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } })).map((item) => item.outcome), ["noop", "noop"]);
  } finally { client.close(); fs.rmSync(ownedRoot, { recursive: true, force: true }); }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
