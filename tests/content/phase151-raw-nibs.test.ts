import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient, type Client } from "@libsql/client";
import { applyPhase151RawNibContent, type ApplyPhase151Options } from "../../scripts/apply-phase151-raw-nibs-content";
import { PHASE151_MARKDOWN, phase151RawNibDefinitions } from "../../scripts/data/phase151-raw-nibs";
import { assertCatalogSnapshotUnchanged, copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT_ALIAS = "/Users/xz/CodeBuddy/fountain-pen-graph";
const ROOT_CANONICAL = "/Users/xz/Documents/fountain-pen-graph";
const REAL = path.join(ROOT_CANONICAL, "data", "fpkg.db");

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

test("Phase 151 repairs two raw nib pages without search-index references", { timeout: 900_000 }, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase151-")));
  const copy = copyCheckpointedCatalogToDisposableCopy(REAL, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot });
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase151Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase151-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: { NODE_ENV: "test", TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
  };
  try {
    await migrateDatabase(client);
    const markdown = fs.readFileSync(path.join(ROOT_CANONICAL, PHASE151_MARKDOWN), "utf8");
    assert.ok(Array.from(markdown).length > 2_500);
    for (const definition of phase151RawNibDefinitions) {
      const svg = fs.readFileSync(path.join(ROOT_CANONICAL, "public", definition.imagePath.replace(/^\//, "")), "utf8");
      assert.match(svg, /1600/); assert.match(svg, /900/); assert.match(svg, /not-to-scale/); assert.match(svg, /non-colour-proof/); assert.match(svg, /non-logo/);
    }
    await assert.rejects(() => applyPhase151RawNibContent(client, { ...options, env: { NODE_ENV: "test", TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "libsql://remote" } }), /inherited remote/);
    const first = await applyPhase151RawNibContent(client, options);
    assert.deepEqual(first.entities.map((entity) => entity.outcome), ["updated", "updated"]);
    for (const definition of phase151RawNibDefinitions) {
      const state = await rows(client, "SELECT type,slug,name,summary,body_md,source FROM entities WHERE id=?", [definition.entityId]);
      assert.equal(state.length, 1, JSON.stringify({ definition, state }));
      const current = state[0];
      assert.equal(current?.type, "nib", JSON.stringify({ definition, current }));
      assert.equal(current?.slug, definition.expectedSlug, JSON.stringify({ definition, current }));
      assert.equal(current?.name, definition.expectedName);
      assert.ok(Array.from(String(current?.body_md)).length >= 900);
      assert.match(String(current?.source), /^curated-content:phase151-raw-nibs-v1:/);
      assert.equal(Number((await rows(client, "SELECT count(*) AS count FROM entity_references WHERE entity_id=? AND id LIKE 'phase151-reference-%'", [definition.entityId]))[0]?.count), definition.sources.filter((source) => source.sourceType !== "user_submission").length);
      assert.equal(Number((await rows(client, "SELECT count(*) AS count FROM entity_references er JOIN source_items si ON si.id=er.source_item_id WHERE er.entity_id=? AND si.url LIKE 'https://www.bing.com/search%'", [definition.entityId]))[0]?.count), 0);
      assert.equal(Number((await rows(client, "SELECT count(*) AS count FROM media_assets WHERE entity_id=? AND id LIKE 'phase151-media-%' AND usage_status='primary'", [definition.entityId]))[0]?.count), 1);
    }
    const replay = await applyPhase151RawNibContent(client, options);
    assert.deepEqual(replay.entities.map((entity) => entity.outcome), ["noop", "noop"]);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    clearInterval(keepAlive); client.close(); fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
