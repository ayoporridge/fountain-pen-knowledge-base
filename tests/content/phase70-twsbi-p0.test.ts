import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { applyPhase70TwsbiP0Content } from "../../scripts/apply-phase70-twsbi-p0-content";
import { PHASE70_GO_RAW_SLUG, PHASE70_GO_SLUG, PHASE70_MINI_AL_RAW_SLUG, PHASE70_MINI_AL_SLUG, PHASE70_TWSBI_BRAND_ID, PHASE70_VAC700R_RAW_SLUG, PHASE70_VAC700R_SLUG } from "../../scripts/data/phase70-twsbi-p0";
import { copyCheckpointedCatalogToDisposableCopy, snapshotCatalogFiles } from "../../src/lib/audit/read-only-catalog";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const REAL_CATALOG = path.join(ROOT, "data", "fpkg.db");
const TARGETS = [
  { raw: PHASE70_MINI_AL_RAW_SLUG, slug: PHASE70_MINI_AL_SLUG, image: "twsbi-diamond-mini-al.svg" },
  { raw: PHASE70_GO_RAW_SLUG, slug: PHASE70_GO_SLUG, image: "twsbi-go.svg" },
  { raw: PHASE70_VAC700R_RAW_SLUG, slug: PHASE70_VAC700R_SLUG, image: "twsbi-vac700r.svg" },
] as const;
async function scalar(client: ReturnType<typeof createClient>, sql: string, args: string[] = []): Promise<number> { const result = await client.execute({ sql, args }); return Number(result.rows[0]?.value ?? 0); }

test("Phase 70 publishes separately verified TWSBI Mini AL, GO and VAC700R on an owned copy", async () => {
  const protectedSnapshot = snapshotCatalogFiles(REAL_CATALOG);
  const ownedRoot = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase70-twsbi-")));
  const copy = copyCheckpointedCatalogToDisposableCopy(REAL_CATALOG, path.join(ownedRoot, "catalog.db"), ownedRoot, { expectedSourceSnapshot: protectedSnapshot });
  const client = createClient({ url: `file:${copy.destinationPath}` });
  const options = { workspaceRoot: ROOT, reviewer: "phase70-twsbi-p0", databasePath: copy.destinationPath, ownedRoot, protectedCatalogPath: REAL_CATALOG, protectedCatalogSnapshot: protectedSnapshot, env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } } as const;
  try {
    await migrateDatabase(client);
    for (const target of TARGETS) assert.equal(await scalar(client, "SELECT count(*) AS value FROM entities WHERE slug = ? AND type = 'pen'", [target.raw]), 1, `checkpoint must provide exactly one raw pen for ${target.raw}`);
    const first = await applyPhase70TwsbiP0Content(client, options);
    assert.deepEqual(first.entities.map((entity) => entity.outcome), ["published", "published", "published", "published"]);
    const rows = await client.execute({ sql: "SELECT id, slug, summary, body_md FROM public_entities WHERE slug IN (?, ?, ?) ORDER BY slug", args: TARGETS.map((target) => target.slug) });
    assert.equal(rows.rows.length, 3);
    const bySlug = new Map(rows.rows.map((row) => [String(row.slug), row]));
    for (const target of TARGETS) {
      const row = bySlug.get(target.slug); assert.ok(row);
      assert.ok(String(row?.summary ?? "").length >= 60 && String(row?.summary ?? "").length <= 160);
      assert.ok(String(row?.body_md ?? "").length >= 2_000);
      assert.match(String(row?.body_md), /示意图，非产品照片/);
      assert.doesNotMatch(String(row?.body_md), /数据库|仓库|canonical|made_by/i);
      assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", [String(row?.id), PHASE70_TWSBI_BRAND_ID]), 1);
      assert.equal(await scalar(client, "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'", [PHASE70_TWSBI_BRAND_ID, String(row?.id)]), 1);
      const media = await client.execute({ sql: "SELECT local_path FROM media_assets WHERE entity_id = ? AND usage_status = 'primary'", args: [String(row?.id)] });
      assert.equal(media.rows.length, 1);
      const mediaPath = String(media.rows[0]?.local_path); assert.match(mediaPath, new RegExp(target.image.replace(".", "\\.")));
      assert.match(fs.readFileSync(path.join(ROOT, "public", mediaPath.slice(1)), "utf8"), /示意图，非产品照片/);
    }
    assert.match(String(bySlug.get(PHASE70_MINI_AL_SLUG)?.body_md), /Mini Clear[\s\S]*Mini Classic[\s\S]*铝制部件/);
    assert.match(String(bySlug.get(PHASE70_GO_SLUG)?.body_md), /1\.4 ml[\s\S]*1\.61 ml[\s\S]*不同来源/);
    assert.match(String(bySlug.get(PHASE70_VAC700R_SLUG)?.body_md), /止墨阀[\s\S]*常规[\s\S]*满填/);
    const redirects = await client.execute({ sql: "SELECT source_path, target_path, redirect_kind FROM entity_redirects WHERE source_path IN (?, ?, ?) ORDER BY source_path", args: TARGETS.map((target) => `/pen/${target.raw}`) });
    assert.deepEqual(redirects.rows.map((row) => ({ source: String(row.source_path), target: String(row.target_path), kind: String(row.redirect_kind) })), TARGETS.map((target) => ({ source: `/pen/${target.raw}`, target: `/pen/${target.slug}`, kind: "permanent" })).sort((a, b) => a.source.localeCompare(b.source)));
    const publicModels = await client.execute({ sql: "SELECT source_id FROM entity_links WHERE target_id = ? AND link_type = 'made_by'", args: [PHASE70_TWSBI_BRAND_ID] });
    const published = new Set(publicModels.rows.map((row) => String(row.source_id))); for (const target of TARGETS) assert.ok(published.has(String(bySlug.get(target.slug)?.id)));
    const replay = await applyPhase70TwsbiP0Content(client, options); assert.ok(replay.entities.every((entity) => entity.outcome === "noop"));
  } finally { client.close(); fs.rmSync(ownedRoot, { recursive: true, force: true }); }
  assert.deepEqual(snapshotCatalogFiles(REAL_CATALOG), protectedSnapshot);
});
