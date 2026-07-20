import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import type { ApplyPhase22Options } from "./apply-phase22-content";

export const PHASE104_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE104_DREAM_ID = "2aoD07lwSYCV";
export const PHASE104_DREAM_SLUG = "wancher-dream-pen";
const OLD_SLUG = "wancher万佳-dream-pen";
const MARKDOWN = ".planning/content-research/wancher-dream-pen-navigation.md";
const IMAGE = "/images/library/site-original/wancher/wancher-dream-pen-navigation.svg";
const RETRIEVED = "2026-07-20";

type Source = { key: string; title: string; url: string; summary: string };
const SOURCES: Source[] = [
  { key: "dream-collection", title: "Dream Pen Fountain Pen Collection", url: "https://www.wancherpen.com/collections/dream-pen", summary: "官方 collection；证明 Dream Pen 覆盖硬橡胶、金属与多种工艺装饰，不是可共享固定规格的一支笔。" },
  { key: "our-story", title: "Wancher Our Story", url: "https://www.wancherpen.com/pages/our-story-page", summary: "官方品牌背景页。" },
  { key: "titanium-black", title: "Dream Pen Titanium Black Fountain Pen", url: "https://www.wancherpen.com/products/dream-pen-titanium-black", summary: "官方具体 SKU；用于区分钛金属分支的材料、JoWo 笔尖与 cartridge/converter 信息。" },
  { key: "true-ebonite", title: "Dream Pen True Ebonite Matte Black", url: "https://www.wancherpen.com/products/true-ebonite-matte-black", summary: "官方具体 SKU；用于区分硬橡胶分支，不把它的选项挪用于其他 Dream Pen。" },
  { key: "clip", title: "Wancher Dream Pen - A model with clip has arrived", url: "https://www.wancherpen.com/blogs/news/wancher-dream-pen-with-clip", summary: "官方 2022 年文章；说明同一系列存在有夹版的版本变化。" },
];

function id(prefix: string, value: string) { return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`; }
function reviewedCopy() {
  const markdown = fs.readFileSync(path.resolve(process.cwd(), MARKDOWN), "utf8").replace(/\r\n?/g, "\n");
  const summary = markdown.match(/^## summary\s*\n+([\s\S]*?)(?=^## )/m)?.[1].trim();
  const body = markdown.match(/^## body_md\s*\n+([\s\S]*)$/m)?.[1].trim();
  if (!summary || !body || Array.from(body).length < 1_800) throw new Error(`Phase 104 reviewed copy is incomplete: ${MARKDOWN}`);
  return { summary, body };
}
function inside(candidate: string, root: string) { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function rejectRemote(env: NodeJS.ProcessEnv) { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 104 refuses remote database selection: ${key}.`); }
async function assertOwned(client: Client, options: ApplyPhase22Options) {
  rejectRemote(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 104 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true }); const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 104 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 104 client is not bound to its owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 104 owned copy must be migrated through 032.");
}
async function upsertSource(tx: Transaction, source: Source) {
  const registry = id("phase104-source-registry", "wancher-official"); const item = id("phase104-source-item", source.key);
  await tx.execute({ sql: "INSERT INTO source_registry (id, name, source_type, allowed_use, reliability, homepage_url, fetch_method, notes, last_checked_at, default_source_tier, default_independence_group) VALUES (?, 'Wancher official', 'official', 'summary_only', 'official_marketing', 'https://www.wancherpen.com/', 'manual', 'Phase 104 source register', ?, 'primary', 'wancher-official') ON CONFLICT(id) DO UPDATE SET last_checked_at = excluded.last_checked_at, updated_at = datetime('now')", args: [registry, RETRIEVED] });
  await tx.execute({ sql: "INSERT INTO source_items (id, source_id, title, url, item_type, retrieved_at, summary, raw_metadata_json, allowed_use, review_status, source_tier, independence_group, archive_url, archive_locator) VALUES (?, ?, ?, ?, 'web_page', ?, ?, ?, 'summary_only', 'approved', 'primary', 'wancher-official', ?, ?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, url=excluded.url, retrieved_at=excluded.retrieved_at, summary=excluded.summary, archive_url=excluded.archive_url, archive_locator=excluded.archive_locator, review_status='approved', updated_at=datetime('now')", args: [item, registry, source.title, source.url, RETRIEVED, source.summary, JSON.stringify({ phase: 104, source: source.key }), source.url, `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${source.summary}`] });
  return item;
}
async function clearPayload(tx: Transaction, entityId: string) {
  await tx.execute({ sql: "DELETE FROM citations WHERE target_id IN (SELECT id FROM stories WHERE entity_id = ?) OR target_id = ?", args: [entityId, entityId] });
  for (const sql of ["DELETE FROM entity_references WHERE entity_id = ?", "DELETE FROM media_assets WHERE entity_id = ?", "DELETE FROM stories WHERE entity_id = ?", "DELETE FROM entity_aliases WHERE entity_id = ?", "DELETE FROM claims WHERE subject_entity_id = ?"]) await tx.execute({ sql, args: [entityId] });
}
async function recordReclassification(tx: Transaction) {
  const sourcePath = `/pen/${OLD_SLUG}`; const targetPath = `/article/${PHASE104_DREAM_SLUG}`; const key = `${PHASE104_DREAM_ID}:${sourcePath}->${targetPath}`;
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [id("phase104-batch", key), key, createHash("sha256").update(key).digest("hex"), "Reclassify Wancher Dream Pen shell from pen to series-navigation article."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [id("phase104-action", key), id("phase104-batch", key), OLD_SLUG, createHash("sha256").update(key).digest("hex"), PHASE104_DREAM_ID, PHASE104_DREAM_ID, "Dream Pen is a series, not an individual pen model."] });
}

export async function applyPhase104WancherDreamPenNavigationContent(client: Client, options: ApplyPhase22Options) {
  await assertOwned(client, options); const copy = reviewedCopy(); const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE104_WANCHER_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "wancher") throw new Error("Phase 104 Wancher brand identity mismatch.");
    const entity = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE104_DREAM_ID] });
    if (entity.rows.length !== 1 || (String(entity.rows[0]?.type) !== "pen" && String(entity.rows[0]?.type) !== "article") || (String(entity.rows[0]?.slug) !== OLD_SLUG && String(entity.rows[0]?.slug) !== PHASE104_DREAM_SLUG)) throw new Error("Phase 104 Dream Pen identity mismatch.");
    const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [PHASE104_DREAM_SLUG, PHASE104_DREAM_ID] }); if (collision.rows.length) throw new Error("Phase 104 Dream Pen slug collision.");
    await clearPayload(tx, PHASE104_DREAM_ID);
    await tx.execute({ sql: "DELETE FROM entity_links WHERE (source_id = ? OR target_id = ?) AND link_type IN ('made_by', 'reverse')", args: [PHASE104_DREAM_ID, PHASE104_DREAM_ID] });
    await tx.execute({ sql: "UPDATE entities SET type='article', slug=?, name='Wancher Dream Pen（系列导航）', summary=?, body_md=?, source=?, source_url=NULL, updated_at=datetime('now') WHERE id=?", args: [PHASE104_DREAM_SLUG, copy.summary, copy.body, `curated:phase104:${PHASE104_DREAM_SLUG}`, PHASE104_DREAM_ID] });
    await tx.execute({ sql: "DELETE FROM entity_publications WHERE entity_id = ?", args: [PHASE104_DREAM_ID] });
    for (const source of SOURCES) {
      const item = await upsertSource(tx, source);
      await tx.execute({ sql: "INSERT INTO entity_references (id, entity_id, source_item_id, relation_type, note, review_status) VALUES (?, ?, ?, 'official', ?, 'approved')", args: [id("phase104-reference", `${PHASE104_DREAM_ID}:${source.key}`), PHASE104_DREAM_ID, item, source.summary] });
    }
    await tx.execute({ sql: "INSERT INTO stories (id, entity_id, title, story_type, summary, body_md, status, source_notes) VALUES (?, ?, 'Wancher Dream Pen（系列导航）', 'overview', ?, ?, 'published', ?)", args: [id("phase104-story", PHASE104_DREAM_ID), PHASE104_DREAM_ID, copy.summary, copy.body, `curated:phase104:${PHASE104_DREAM_SLUG}`] });
    const imageSource = await upsertSource(tx, { key: "diagram", title: "Wancher Dream Pen navigation facts diagram", url: IMAGE, summary: "本站原创事实示意图；非产品照片。" });
    await tx.execute({ sql: "INSERT INTO media_assets (id, entity_id, title, asset_type, local_path, author, license, attribution_text, source_url, source_item_id, review_status, usage_status) VALUES (?, ?, 'Wancher Dream Pen 系列导航事实图', 'diagram', ?, 'Fountain Pen Graph editorial', 'site-original', ?, ?, ?, 'approved', 'primary')", args: [id("phase104-media", PHASE104_DREAM_ID), PHASE104_DREAM_ID, IMAGE, "本站原创事实示意图，非产品照片；不代表任何具体 Dream Pen 的比例、颜色、材质、笔尖、年份、供墨方式或包装。", IMAGE, imageSource] });
    await recordReclassification(tx); await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities: [{ entityId: PHASE104_DREAM_ID, outcome: "published" as const }] };
}
function value(name: string) { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main() {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase104-wancher-dream-pen-navigation-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { process.stdout.write(`${JSON.stringify(await applyPhase104WancherDreamPenNavigationContent(client, { workspaceRoot: process.cwd(), reviewer: "phase104-wancher-dream-pen", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
