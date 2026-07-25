import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient, type Client } from "@libsql/client";
import { applyPhase235ObscureChineseTrioContent, type ApplyPhase235Options } from "../../scripts/apply-phase235-obscure-chinese-trio-content";
import { PHASE235_TARGETS, phase235ObscureChineseTrioPacks } from "../../scripts/data/phase235-obscure-chinese-trio";
import { assertCatalogSnapshotUnchanged, copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

async function rows(client: Client, sql: string, args: unknown[] = []) { return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row })); }

test("Phase 235 publishes DongWu 948, ShuLe 2398 and ZhangJiang 988 on an owned checkpoint", { timeout: 900_000 }, async () => {
  const canonicalRoot = fs.realpathSync.native(process.cwd()); const real = path.join(canonicalRoot, "data", "fpkg.db"); const protectedSnapshot = snapshotCatalogFiles(real); const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase235-obscure-chinese-"))); const copy = copyCheckpointedCatalogToDisposableCopy(real, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot }); const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase235Options = { workspaceRoot: canonicalRoot, reviewer: "phase235-obscure-chinese-test", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: real, protectedCatalogSnapshot: protectedSnapshot, env: { ...process.env, NODE_ENV: process.env.NODE_ENV ?? "test", TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } };
  try {
    await migrateDatabase(client);
    const packs = phase235ObscureChineseTrioPacks(); assert.equal(packs.length, 6); assert.ok(packs.filter((pack) => pack.expectedType === "pen").every((pack) => pack.sources.length >= 2));
    for (const pack of packs.filter((candidate) => candidate.expectedType === "pen")) { const markdown = fs.readFileSync(path.join(canonicalRoot, pack.markdownFile), "utf8"); assert.ok(Array.from(markdown).length >= 1_700, pack.entityId); assert.match(markdown, /按单支|实物/); }
    for (const target of PHASE235_TARGETS) { const svg = fs.readFileSync(path.join(canonicalRoot, "public", target.svgPath.replace(/^\//, "")), "utf8"); assert.match(svg, /non-photo/); assert.match(svg, /not-to-scale/); }
    await assert.rejects(() => applyPhase235ObscureChineseTrioContent(client, { ...options, reviewer: " " }), /reviewer must not be empty/);
    await assert.rejects(() => applyPhase235ObscureChineseTrioContent(client, { ...options, env: { ...process.env, NODE_ENV: process.env.NODE_ENV ?? "test", TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "libsql://remote" } }), /inherited remote/);
    const first = await applyPhase235ObscureChineseTrioContent(client, options); assert.deepEqual(first.entities.map((entity) => entity.outcome), ["published", "published", "published", "published", "published", "published"]);
    for (const pack of packs) {
      const state = (await rows(client, "SELECT entity.type,entity.slug,entity.name,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?", [pack.entityId]))[0]; assert.equal(state?.type, pack.expectedType); assert.equal(state?.slug, pack.expectedSlug); assert.equal(state?.name, pack.canonicalName); assert.equal(state?.status, "published"); assert.equal(Number(state?.is_public), 1);
      const hash = await computePublicationContentHash(client, pack.entityId); const reviews = await rows(client, "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind", [pack.entityId, hash]); assert.deepEqual(reviews.map((row) => [row.review_kind, row.status]), [["fact", "approved"], ["language", "approved"], ["media", "approved"], ["publication", "approved"]]);
    }
    for (const target of PHASE235_TARGETS) { assert.equal(Number((await rows(client, "SELECT count(*) value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'", [target.penId, target.brandId]))[0]?.value), 1); assert.equal(Number((await rows(client, "SELECT count(*) value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'", [target.brandId, target.penId]))[0]?.value), 1); }
    assert.deepEqual((await applyPhase235ObscureChineseTrioContent(client, options)).entities.map((entity) => entity.outcome), ["noop", "noop", "noop", "noop", "noop", "noop"]);
  } finally { client.close(); fs.rmSync(ownedRoot, { recursive: true, force: true }); }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
