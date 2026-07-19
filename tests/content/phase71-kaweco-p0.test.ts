import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase71KawecoP0Content } from "../../scripts/apply-phase71-kaweco-p0-content";
import { PHASE71_AL_SPORT_SLUG, PHASE71_KAWECO_BRAND_ID, PHASE71_LILIPUT_SLUG, PHASE71_STUDENT_SLUG } from "../../scripts/data/phase71-kaweco-p0";
import { assertCatalogSnapshotUnchanged, copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
async function scalar(client: ReturnType<typeof createClient>, sql: string, args: string[] = []): Promise<number> { const result = await client.execute({ sql, args }); return Number(result.rows[0]?.value ?? 0); }

test("Phase 71 publishes Kaweco AL Sport, Liliput and Student on an owned checkpoint copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase71-kaweco-")));
  const copy = copyCheckpointedCatalogToDisposableCopy(REAL_CATALOG, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot });
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = { workspaceRoot: ROOT, reviewer: "phase71-kaweco-p0", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: REAL_CATALOG, protectedCatalogSnapshot: protectedSnapshot, env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } } as const;
  try {
    await migrateDatabase(client);
    for (const slug of [PHASE71_AL_SPORT_SLUG, PHASE71_LILIPUT_SLUG, PHASE71_STUDENT_SLUG]) assert.equal(await scalar(client, "SELECT count(*) AS value FROM entities WHERE slug = ? AND type = 'pen'", [slug]), 1, `checkpoint must contain one verified pen: ${slug}`);
    const first = await applyPhase71KawecoP0Content(client, options);
    assert.deepEqual(first.entities.map((entity) => entity.outcome), ["published", "published", "published", "published", "published"]);
    const rows = await client.execute({ sql: "SELECT id, slug, summary, body_md FROM public_entities WHERE slug IN (?, ?, ?) ORDER BY slug", args: [PHASE71_AL_SPORT_SLUG, PHASE71_LILIPUT_SLUG, PHASE71_STUDENT_SLUG] });
    assert.equal(rows.rows.length, 3);
    for (const row of rows.rows) {
      const id = String(row.id); const body = String(row.body_md ?? "");
      assert.ok(String(row.summary ?? "").length >= 60 && String(row.summary ?? "").length <= 160);
      assert.ok(body.length >= 2_000); assert.match(body, /示意图，非产品照片/); assert.doesNotMatch(body, /数据库|仓库|canonical|made_by/i);
      assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", [id, PHASE71_KAWECO_BRAND_ID]), 1);
      assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", [id]), 1);
      assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'", [PHASE71_KAWECO_BRAND_ID, id]), 1);
      const media = await client.execute({ sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'", args: [id] });
      assert.equal(media.rows.length, 1); const localPath = String(media.rows[0]?.local_path);
      assert.match(fs.readFileSync(path.join(ROOT, "public", localPath.slice(1)), "utf8"), /示意图，非产品照片/);
    }
    const bySlug = new Map(rows.rows.map((row) => [String(row.slug), String(row.body_md)]));
    assert.match(bySlug.get(PHASE71_AL_SPORT_SLUG) ?? "", /20.5 g[\s\S]*Piston Sport AL/);
    assert.match(bySlug.get(PHASE71_LILIPUT_SLUG) ?? "", /23.7 g[\s\S]*squeeze converter/);
    assert.match(bySlug.get(PHASE71_STUDENT_SLUG) ?? "", /25.4 g[\s\S]*060 threaded nib/);
    const brandModels = await client.execute({ sql: "SELECT pen.slug FROM entity_links link JOIN public_entities pen ON pen.id = link.source_id WHERE link.target_id = ? AND link.link_type = 'made_by' ORDER BY pen.slug", args: [PHASE71_KAWECO_BRAND_ID] });
    const slugs = brandModels.rows.map((row) => String(row.slug));
    for (const slug of ["kaweco-sport", PHASE71_AL_SPORT_SLUG, PHASE71_LILIPUT_SLUG, PHASE71_STUDENT_SLUG]) assert.equal(slugs.filter((item) => item === slug).length, 1);
    const replay = await applyPhase71KawecoP0Content(client, options); assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally { client.close(); fs.rmSync(ownedRoot, { recursive: true, force: true }); }
  assertCatalogSnapshotUnchanged(protectedSnapshot);
});
