import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient, type Client } from "@libsql/client";
import { applyPhase234Yongxu286Content, type ApplyPhase234Options } from "../../scripts/apply-phase234-yongxu-286-content";
import { PHASE234_YONGXU_BRAND_ID, PHASE234_YONGXU_PEN_ID, PHASE234_YONGXU_PEN_NAME, PHASE234_YONGXU_PEN_SLUG, phase234Yongxu286Packs } from "../../scripts/data/phase234-yongxu-286";
import { assertCatalogSnapshotUnchanged, copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";
import { computePublicationContentHash } from "../../src/lib/publication";

async function rows(client: Client, sql: string, args: unknown[] = []) { return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row })); }

test("Phase 234 publishes YongXu 286 on an owned checkpoint with conservative nib and filler boundaries", { timeout: 900_000 }, async () => {
  const canonicalRoot = fs.realpathSync.native(process.cwd()); const real = path.join(canonicalRoot, "data", "fpkg.db"); const protectedSnapshot = snapshotCatalogFiles(real); const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase234-yongxu-"))); const copy = copyCheckpointedCatalogToDisposableCopy(real, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot }); const client = createClient({ url: `file:${copy.destinationPath}` });
  const options: ApplyPhase234Options = { workspaceRoot: canonicalRoot, reviewer: "phase234-yongxu-test", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: real, protectedCatalogSnapshot: protectedSnapshot, env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } };
  try {
    await migrateDatabase(client);
    const penPack = phase234Yongxu286Packs.find((pack) => pack.entityId === PHASE234_YONGXU_PEN_ID); assert.ok(penPack);
    const markdown = fs.readFileSync(path.join(canonicalRoot, penPack.markdownFile), "utf8"); assert.ok(Array.from(markdown).length >= 2_500); assert.match(markdown, /按钮上墨/); assert.match(markdown, /14K/);
    const svg = fs.readFileSync(path.join(canonicalRoot, "public/images/library/site-original/phase234/yongxu/yongxu-286.svg"), "utf8"); assert.match(svg, /non-photo/); assert.match(svg, /not-to-scale/); assert.match(svg, /按钮/);
    assert.ok(new Set(penPack.sources.map((source) => source.independenceGroup)).size >= 5);
    await assert.rejects(() => applyPhase234Yongxu286Content(client, { ...options, reviewer: " " }), /reviewer must not be empty/);
    await assert.rejects(() => applyPhase234Yongxu286Content(client, { ...options, env: { ...process.env, NODE_ENV: process.env.NODE_ENV ?? "test", TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "libsql://remote" } }), /inherited remote/);
    const first = await applyPhase234Yongxu286Content(client, options); assert.deepEqual(first.entities.map((entity) => entity.outcome), ["published", "published"]);
    for (const pack of phase234Yongxu286Packs) {
      const state = (await rows(client, "SELECT entity.type,entity.slug,entity.name,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?", [pack.entityId]))[0];
      assert.equal(state?.type, pack.expectedType); assert.equal(state?.slug, pack.expectedSlug); assert.equal(state?.name, pack.canonicalName); assert.equal(state?.status, "published"); assert.equal(Number(state?.is_public), 1);
      const hash = await computePublicationContentHash(client, pack.entityId); const reviews = await rows(client, "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind", [pack.entityId, hash]); assert.deepEqual(reviews.map((row) => [row.review_kind, row.status]), [["fact", "approved"], ["language", "approved"], ["media", "approved"], ["publication", "approved"]]);
    }
    assert.equal(Number((await rows(client, "SELECT count(*) value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'", [PHASE234_YONGXU_PEN_ID, PHASE234_YONGXU_BRAND_ID]))[0]?.value), 1);
    assert.equal(Number((await rows(client, "SELECT count(*) value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'", [PHASE234_YONGXU_BRAND_ID, PHASE234_YONGXU_PEN_ID]))[0]?.value), 1);
    const spec = (await rows(client, "SELECT fill_system,nib FROM model_specs WHERE entity_id=?", [PHASE234_YONGXU_PEN_ID]))[0]; assert.match(String(spec?.fill_system), /按钮上墨/); assert.match(String(spec?.nib), /14K/);
    assert.deepEqual((await applyPhase234Yongxu286Content(client, options)).entities.map((entity) => entity.outcome), ["noop", "noop"]);
    assert.deepEqual((await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=?", [PHASE234_YONGXU_PEN_ID]))[0], { id: PHASE234_YONGXU_PEN_ID, type: "pen", slug: PHASE234_YONGXU_PEN_SLUG, name: PHASE234_YONGXU_PEN_NAME });
  } finally { client.close(); fs.rmSync(ownedRoot, { recursive: true, force: true }); }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
