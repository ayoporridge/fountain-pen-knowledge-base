import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase237OrphanCitationCleanup, PHASE237_ORPHAN_CITATIONS, type ApplyPhase237Options } from "../../scripts/apply-phase237-orphan-citation-cleanup";
import { assertCatalogSnapshotUnchanged, copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

async function rows(client: ReturnType<typeof createClient>, sql: string, args: unknown[] = []) { return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row })); }

test("Phase 237 removes only the audited orphan citations on an owned copy", { timeout: 300_000 }, async () => {
  const root = fs.realpathSync.native(process.cwd());
  const real = path.join(root, "data", "fpkg.db");
  const protectedSnapshot = snapshotCatalogFiles(real);
  const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase237-orphan-citations-")));
  const copy = copyCheckpointedCatalogToDisposableCopy(real, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot });
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase237Options = { workspaceRoot: root, reviewer: "phase237-orphan-citation-test", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: real, protectedCatalogSnapshot: protectedSnapshot, env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } };
  try {
    await migrateDatabase(client);
    const claimTargets = [...new Set(PHASE237_ORPHAN_CITATIONS.filter((row) => row.targetType === "claim").map((row) => row.targetId))];
    const storyTargets = [...new Set(PHASE237_ORPHAN_CITATIONS.filter((row) => row.targetType === "story").map((row) => row.targetId))];
    const expectedIds = PHASE237_ORPHAN_CITATIONS.map((row) => row.id);
    await client.execute({ sql: `DELETE FROM citations WHERE id NOT IN (${expectedIds.map(() => "?").join(",")}) AND ((target_type='claim' AND target_id IN (${claimTargets.map(() => "?").join(",")})) OR (target_type='story' AND target_id IN (${storyTargets.map(() => "?").join(",")})) OR claim_id IN (${claimTargets.map(() => "?").join(",")}))`, args: [...expectedIds, ...claimTargets, ...storyTargets, ...claimTargets] });
    await client.execute({ sql: `DELETE FROM claims WHERE id IN (${claimTargets.map(() => "?").join(",")})`, args: claimTargets });
    await client.execute({ sql: `DELETE FROM stories WHERE id IN (${storyTargets.map(() => "?").join(",")})`, args: storyTargets });
    await assert.rejects(() => applyPhase237OrphanCitationCleanup(client, { ...options, env: { ...options.env, NODE_ENV: process.env.NODE_ENV ?? "test", FPKG_DATABASE_URL: "libsql://remote" } }), /refuses inherited remote selection/);
    const before = await rows(client, `SELECT id,target_type,target_id,source_item_id FROM citations WHERE id IN (${PHASE237_ORPHAN_CITATIONS.map(() => "?").join(",")})`, PHASE237_ORPHAN_CITATIONS.map((row) => row.id));
    const result = await applyPhase237OrphanCitationCleanup(client, options);
    assert.equal(result.outcome, before.length === 0 ? "noop" : "cleaned");
    assert.equal(result.removed, before.length);
    assert.equal(Number((await rows(client, "SELECT count(*) AS value FROM citations c LEFT JOIN source_items si ON si.id=c.source_item_id WHERE (c.source_item_id IS NOT NULL AND si.id IS NULL) OR (c.target_type='story' AND NOT EXISTS (SELECT 1 FROM stories s WHERE s.id=c.target_id)) OR (c.target_type='claim' AND NOT EXISTS (SELECT 1 FROM claims cl WHERE cl.id=c.target_id))"))[0]?.value), 0);
    assert.deepEqual(await applyPhase237OrphanCitationCleanup(client, options), { removed: 0, outcome: "noop" });
  } finally { client.close(); fs.rmSync(ownedRoot, { recursive: true, force: true }); }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
