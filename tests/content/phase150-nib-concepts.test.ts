import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient, type Client } from "@libsql/client";
import { applyPhase150NibConceptsContent, type ApplyPhase150Options } from "../../scripts/apply-phase150-nib-concepts-content";
import { MARKDOWN, phase150NibConcepts } from "../../scripts/data/phase150-nib-concepts";
import { assertCatalogSnapshotUnchanged, copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT_ALIAS = "/Users/xz/CodeBuddy/fountain-pen-graph";
const ROOT_CANONICAL = "/Users/xz/Documents/fountain-pen-graph";
const REAL = path.join(ROOT_CANONICAL, "data", "fpkg.db");
async function rows(client: Client, sql: string, args: unknown[] = []) { return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row })); }

test("Phase 150 repairs seven public nib concepts on an owned checkpoint", { timeout: 900_000 }, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase150-")));
  const copy = copyCheckpointedCatalogToDisposableCopy(REAL, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot });
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase150Options = { workspaceRoot: ROOT_ALIAS, reviewer: "phase150-test", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: REAL, protectedCatalogSnapshot: protectedSnapshot, env: { NODE_ENV: "test", TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } };
  try {
    await migrateDatabase(client);
    const markdown = fs.readFileSync(path.join(ROOT_CANONICAL, MARKDOWN), "utf8");
    assert.ok(Array.from(markdown).length > 6_000);
    for (const definition of phase150NibConcepts) {
      const svg = fs.readFileSync(path.join(ROOT_CANONICAL, "public", definition.imagePath.replace(/^\//, "")), "utf8");
      assert.match(svg, /1600/); assert.match(svg, /900/); assert.match(svg, /not-to-scale/); assert.match(svg, /non-colour-proof/); assert.match(svg, /non-logo/);
    }
    await assert.rejects(() => applyPhase150NibConceptsContent(client, { ...options, env: { NODE_ENV: "test", TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "libsql://remote" } }), /inherited remote/);
    const first = await applyPhase150NibConceptsContent(client, options);
    assert.deepEqual(first.entities.map((entity) => entity.outcome), Array(7).fill("updated"));
    for (const definition of phase150NibConcepts) {
      const state = (await rows(client, "SELECT type,slug,name,summary,body_md,source FROM entities WHERE id=?", [definition.entityId]))[0];
      assert.equal(state?.type, "concept"); assert.equal(state?.slug, definition.expectedSlug); assert.equal(state?.name, definition.expectedName); assert.ok(String(state?.summary).length >= 60); assert.ok(Array.from(String(state?.body_md)).length >= 900); assert.match(String(state?.source), /^curated-content:phase150-nib-concepts-v1:/);
      assert.equal(Number((await rows(client, "SELECT count(*) AS count FROM entity_references WHERE entity_id=? AND id LIKE 'phase150-reference-%' AND review_status='approved'", [definition.entityId]))[0]?.count), definition.sources.filter((source) => source.sourceType !== "user_submission").length);
      assert.equal(Number((await rows(client, "SELECT count(*) AS count FROM media_assets WHERE entity_id=? AND id LIKE 'phase150-media-%' AND usage_status='primary' AND review_status='approved'", [definition.entityId]))[0]?.count), 1);
    }
    const replay = await applyPhase150NibConceptsContent(client, options);
    assert.deepEqual(replay.entities.map((entity) => entity.outcome), Array(7).fill("noop"));
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    clearInterval(keepAlive); client.close(); fs.rmSync(ownedRoot, { recursive: true, force: true });
  }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
