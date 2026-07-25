import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase231Yiren878Content } from "../../scripts/apply-phase231-yiren-878-content";
import { PHASE231_YIREN_878_ID, PHASE231_YIREN_878_SLUG, PHASE231_YIREN_BRAND_ID, PHASE231_YIREN_BRAND_SLUG } from "../../scripts/data/phase231-yiren-878";
import { assertCatalogSnapshotUnchanged, copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

test("Phase 231 publishes YiRen and the sourced 878 model on an owned copy", { timeout: 900_000 }, async () => {
  const root = process.cwd();
  const real = path.join(root, "data", "fpkg.db");
  const protectedSnapshot = snapshotCatalogFiles(real);
  const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase231-yiren-")));
  const copy = copyCheckpointedCatalogToDisposableCopy(real, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot });
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = { workspaceRoot: root, reviewer: "phase231-yiren-878-test", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: real, protectedCatalogSnapshot: protectedSnapshot, env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } } as const;
  try {
    await migrateDatabase(client);
    await assert.rejects(() => applyPhase231Yiren878Content(client, { ...options, env: { ...options.env, FPKG_DATABASE_URL: "libsql://remote" } }), /refuses inherited remote selection/);
    const first = await applyPhase231Yiren878Content(client, options);
    assert.deepEqual(first.entities.map((item) => item.entityId), [PHASE231_YIREN_BRAND_ID, PHASE231_YIREN_878_ID]);
    assert.ok(first.entities.every((item) => item.outcome === "published"), JSON.stringify(first));
    const identities = await client.execute({ sql: "SELECT id,type,slug FROM entities WHERE id IN (?,?)", args: [PHASE231_YIREN_BRAND_ID, PHASE231_YIREN_878_ID] });
    assert.equal(identities.rows.length, 2);
    assert.equal(String(identities.rows.find((row) => row.id === PHASE231_YIREN_BRAND_ID)?.slug), PHASE231_YIREN_BRAND_SLUG);
    assert.equal(String(identities.rows.find((row) => row.id === PHASE231_YIREN_878_ID)?.slug), PHASE231_YIREN_878_SLUG);
    for (const [entityId, minimum] of [[PHASE231_YIREN_BRAND_ID, 1200], [PHASE231_YIREN_878_ID, 2000]] as const) {
      const row = await client.execute({ sql: "SELECT body_md,source FROM public_entities WHERE id=?", args: [entityId] });
      const body = String(row.rows[0]?.body_md ?? "");
      assert.ok(Array.from(body).length >= minimum);
      assert.doesNotMatch(body, /canonical|made_by|retired|数据库|仓库/i);
      assert.match(String(row.rows[0]?.source ?? ""), /curated-content:phase231/);
      assert.equal(Number((await client.execute({ sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary'", args: [entityId] })).rows[0]?.value), 1);
    }
    const body = String((await client.execute({ sql: "SELECT body_md FROM public_entities WHERE id=?", args: [PHASE231_YIREN_878_ID] })).rows[0]?.body_md ?? "");
    assert.match(body, /全金属|转换器|墨囊|0\.5|维护|选购/);
    assert.equal(Number((await client.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'", args: [PHASE231_YIREN_878_ID, PHASE231_YIREN_BRAND_ID] })).rows[0]?.value), 1);
    assert.equal(Number((await client.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'", args: [PHASE231_YIREN_BRAND_ID, PHASE231_YIREN_878_ID] })).rows[0]?.value), 1);
    const refs = await client.execute({ sql: "SELECT count(*) AS value FROM entity_references WHERE entity_id=? AND review_status='approved'", args: [PHASE231_YIREN_878_ID] });
    assert.equal(Number(refs.rows[0]?.value), 5);
    const replay = await applyPhase231Yiren878Content(client, options);
    assert.ok(replay.entities.every((item) => item.outcome === "noop"), JSON.stringify(replay));
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    client.close();
    fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
