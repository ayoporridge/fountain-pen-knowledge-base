import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient, type Client } from "@libsql/client";
import { applyPhase153ParkerCurrentTrioContent, type ApplyPhase153Options } from "../../scripts/apply-phase153-parker-current-trio-content";
import { PHASE153_IDS, phase153ParkerCurrentTrioPacks } from "../../scripts/data/phase153-parker-current-trio";
import { assertCatalogSnapshotUnchanged, copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT_ALIAS = "/Users/xz/CodeBuddy/fountain-pen-graph";
const ROOT_CANONICAL = "/Users/xz/Documents/fountain-pen-graph";
const REAL = path.join(ROOT_CANONICAL, "data", "fpkg.db");

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

function sha256(file: string): string {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

test("Phase 153 publishes canonical Parker Jotter, IM and Sonnet identities on an owned checkpoint", { timeout: 900_000 }, async () => {
  const keepAlive = setInterval(() => undefined, 1_000);
  const protectedSnapshot = snapshotCatalogFiles(REAL);
  const protectedHash = sha256(REAL);
  const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase153-")));
  const copy = copyCheckpointedCatalogToDisposableCopy(REAL, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot });
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase153Options = {
    workspaceRoot: ROOT_ALIAS,
    reviewer: "phase153-test",
    databasePath: copy.destinationPath,
    ownedRoot,
    protectedCatalogPath: REAL,
    protectedCatalogSnapshot: protectedSnapshot,
    env: { NODE_ENV: "test", TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
  };
  try {
    await migrateDatabase(client);
    for (const pack of phase153ParkerCurrentTrioPacks) {
      const markdown = fs.readFileSync(path.join(ROOT_CANONICAL, pack.markdownFile), "utf8");
      assert.ok(Array.from(markdown).length >= (pack.expectedType === "brand" ? 1_200 : 2_000), pack.entityId);
      assert.ok(new Set(pack.sources.map((source) => source.independenceGroup)).size >= 2, pack.entityId);
      if (pack.expectedType === "pen") {
        const media = pack.media[0];
        assert.ok(media?.localPath, pack.entityId);
        const svg = fs.readFileSync(path.join(ROOT_CANONICAL, "public", (media?.localPath ?? "").replace(/^\//, "")), "utf8");
        assert.match(svg, /non-photo/);
        assert.match(svg, /non-logo/);
        assert.match(svg, /not-to-scale/);
        assert.match(svg, /non-colour-proof/);
      }
    }
    await assert.rejects(() => applyPhase153ParkerCurrentTrioContent(client, { ...options, reviewer: " " }), /reviewer must not be empty/);
    await assert.rejects(() => applyPhase153ParkerCurrentTrioContent(client, { ...options, env: { NODE_ENV: "test", TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "libsql://remote" } }), /inherited remote/);
    const first = await applyPhase153ParkerCurrentTrioContent(client, options);
    assert.deepEqual(first.entities.map((entity) => entity.outcome), ["published", "published", "published", "published"]);
    for (const pack of phase153ParkerCurrentTrioPacks) {
      const state = (await rows(client, `SELECT entity.type,entity.slug,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?`, [pack.entityId]))[0];
      assert.equal(state?.type, pack.expectedType, pack.entityId);
      assert.equal(state?.slug, pack.expectedSlug, pack.entityId);
      assert.equal(state?.status, "published", pack.entityId);
      assert.equal(Number(state?.is_public), 1, pack.entityId);
      const bodyLength = Number((await rows(client, "SELECT length(body_md) AS n FROM entities WHERE id=?", [pack.entityId]))[0]?.n ?? 0);
      assert.ok(bodyLength >= (pack.expectedType === "brand" ? 1_200 : 2_000), pack.entityId);
      const hash = await computePublicationContentHash(client, pack.entityId);
      const reviews = await rows(client, "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind", [pack.entityId, hash]);
      assert.deepEqual(reviews.map((row) => [row.review_kind, row.status]), [["fact", "approved"], ["language", "approved"], ["media", "approved"], ["publication", "approved"]], pack.entityId);
    }
    for (const penId of [PHASE153_IDS.jotter, PHASE153_IDS.im, PHASE153_IDS.sonnet]) {
      assert.equal(Number((await rows(client, "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'", [penId, PHASE153_IDS.brand]))[0]?.n), 1, `${penId} made_by`);
      assert.equal(Number((await rows(client, "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'", [PHASE153_IDS.brand, penId]))[0]?.n), 1, `${penId} reverse`);
    }
    const replay = await applyPhase153ParkerCurrentTrioContent(client, options);
    assert.deepEqual(replay.entities.map((entity) => entity.outcome), ["noop", "noop", "noop", "noop"]);
    assert.equal(sha256(REAL), protectedHash);
    assertCatalogSnapshotUnchanged(protectedSnapshot);
  } finally {
    clearInterval(keepAlive);
    client.close();
  }
});
