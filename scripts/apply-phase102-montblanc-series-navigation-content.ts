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

export const PHASE102_MONTBLANC_BRAND_ID = "CJM8uLY0LmIX";
export const PHASE102_WRITERS_ID = "C_eW3pcaf4yp";
export const PHASE102_PATRON_ID = "AOnijUblJc72";
export const PHASE102_WRITERS_SLUG = "montblanc-writers-edition";
export const PHASE102_PATRON_SLUG = "montblanc-patron-of-art";

type Source = { key: string; title: string; url: string; summary: string };
type Target = {
  id: string;
  oldSlug: string;
  slug: string;
  name: string;
  markdownFile: string;
  image: string;
  sources: Source[];
};

const RETRIEVED = "2026-07-20";
const WRITERS: Source[] = [
  { key: "jane-austen", title: "Writers Edition Homage to Jane Austen, MB130651", url: "https://www.montblanc.com/en-us/writers-edition-homage-to-jane-austen-limited-edition-fountain-pen-MB130651.html", summary: "官方具体 Writers Edition 产品页；用于证明 Writers Edition 不是共享固定规格的单一型号。" },
  { key: "service-guide", title: "Montblanc Writing Instruments Service Guide 2024", url: "https://fast-stg.montblanc.com/on/demandware.static/-/Library-Sites-WWSharedLibrary/default/documents/ServiceGuide_WI_online_2024_GB.pdf", summary: "品牌现代书写工具的通用清洁与存放边界，不替代具体限定版的结构说明。" },
  { key: "patron", title: "Montblanc Patron of Art collection", url: "https://www.montblanc.cn/cn/zh-cn/test-pages-aem6-migration/collection/writing-instruments/all-collectables/montblanc-patron-of-art.html", summary: "官方限定系列资料，用于区分作家致敬的 Writers Edition 与 Patron of Art。" },
];
const PATRON: Source[] = [
  { key: "patron", title: "Montblanc Patron of Art collection", url: "https://www.montblanc.cn/cn/zh-cn/test-pages-aem6-migration/collection/writing-instruments/all-collectables/montblanc-patron-of-art.html", summary: "官方集合页说明 Patron of Art 自 1992 年起年度推出，1995 年后通常有 4810 与 888 两种限量层级。" },
  { key: "jane-austen", title: "Writers Edition Homage to Jane Austen, MB130651", url: "https://www.montblanc.com/en-us/writers-edition-homage-to-jane-austen-limited-edition-fountain-pen-MB130651.html", summary: "具体 Writers Edition 页面，用于说明两个限定系列必须按各自主题和 SKU 分开。" },
  { key: "service-guide", title: "Montblanc Writing Instruments Service Guide 2024", url: "https://fast-stg.montblanc.com/on/demandware.static/-/Library-Sites-WWSharedLibrary/default/documents/ServiceGuide_WI_online_2024_GB.pdf", summary: "品牌现代书写工具的通用清洁与存放边界，不替代具体限定版的结构说明。" },
];
const TARGETS: Target[] = [
  { id: PHASE102_WRITERS_ID, oldSlug: "万宝龙-montblanc-大文豪系列-writers-edition", slug: PHASE102_WRITERS_SLUG, name: "Montblanc Writers Edition（系列导航）", markdownFile: ".planning/content-research/montblanc-writers-edition-navigation.md", image: "/images/library/site-original/montblanc-series/montblanc-writers-edition.svg", sources: WRITERS },
  { id: PHASE102_PATRON_ID, oldSlug: "万宝龙-montblanc-patron-of-art-888", slug: PHASE102_PATRON_SLUG, name: "Montblanc Patron of Art（系列导航）", markdownFile: ".planning/content-research/montblanc-patron-of-art-navigation.md", image: "/images/library/site-original/montblanc-series/montblanc-patron-of-art.svg", sources: PATRON },
];

function id(prefix: string, value: string) { return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`; }
function body(file: string) {
  const markdown = fs.readFileSync(path.resolve(process.cwd(), file), "utf8").replace(/\r\n?/g, "\n");
  const summary = markdown.match(/^## summary\s*\n+([\s\S]*?)(?=^## )/m)?.[1].trim();
  const content = markdown.match(/^## body_md\s*\n+([\s\S]*)$/m)?.[1].trim();
  if (!summary || !content || Array.from(content).length < 1_800) throw new Error(`Phase 102 reviewed copy is incomplete: ${file}`);
  return { summary, content };
}
function inside(candidate: string, root: string) { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function rejectRemote(env: NodeJS.ProcessEnv) { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 102 refuses remote database selection: ${key}.`); }
async function assertOwned(client: Client, options: ApplyPhase22Options) {
  rejectRemote(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 102 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true }); const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 102 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 102 client is not bound to its owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 102 owned copy must be migrated through 032.");
}
async function upsertSource(tx: Transaction, source: Source) {
  const registry = id("phase102-source-registry", "montblanc-official"); const item = id("phase102-source-item", source.key);
  await tx.execute({ sql: "INSERT INTO source_registry (id, name, source_type, allowed_use, reliability, homepage_url, fetch_method, notes, last_checked_at, default_source_tier, default_independence_group) VALUES (?, 'Montblanc official', 'official', 'summary_only', 'official_marketing', 'https://www.montblanc.com/', 'manual', 'Phase 102 source register', ?, 'primary', 'montblanc-official') ON CONFLICT(id) DO UPDATE SET last_checked_at = excluded.last_checked_at, updated_at = datetime('now')", args: [registry, RETRIEVED] });
  await tx.execute({ sql: "INSERT INTO source_items (id, source_id, title, url, item_type, retrieved_at, summary, raw_metadata_json, allowed_use, review_status, source_tier, independence_group, archive_url, archive_locator) VALUES (?, ?, ?, ?, 'web_page', ?, ?, ?, 'summary_only', 'approved', 'primary', 'montblanc-official', ?, ?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, url=excluded.url, retrieved_at=excluded.retrieved_at, summary=excluded.summary, archive_url=excluded.archive_url, archive_locator=excluded.archive_locator, review_status='approved', updated_at=datetime('now')", args: [item, registry, source.title, source.url, RETRIEVED, source.summary, JSON.stringify({ phase: 102, source: source.key }), source.url, `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${source.summary}`] });
  return item;
}
async function clearPayload(tx: Transaction, entityId: string) {
  await tx.execute({ sql: "DELETE FROM citations WHERE target_id IN (SELECT id FROM stories WHERE entity_id = ?) OR target_id = ?", args: [entityId, entityId] });
  for (const sql of ["DELETE FROM entity_references WHERE entity_id = ?", "DELETE FROM media_assets WHERE entity_id = ?", "DELETE FROM stories WHERE entity_id = ?", "DELETE FROM entity_aliases WHERE entity_id = ?", "DELETE FROM claims WHERE subject_entity_id = ?"]) await tx.execute({ sql, args: [entityId] });
}
async function recordReclassification(tx: Transaction, target: Target) {
  const sourcePath = `/pen/${target.oldSlug}`;
  const targetPath = `/article/${target.slug}`;
  const key = `${target.id}:${sourcePath}->${targetPath}`;
  const batch = id("phase102-batch", key);
  const action = id("phase102-action", key);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batch, key, createHash("sha256").update(key).digest("hex"), "Reclassify a Montblanc limited-series shell from pen to article navigation."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [action, batch, target.oldSlug, createHash("sha256").update(key).digest("hex"), target.id, target.id, "Series navigation has no single pen-model identity."] });
  // entity_redirects only permits /brand and /pen targets. The public 308 to
  // /article is intentionally declared in src/lib/entity-redirects.ts instead.
}
async function applyTarget(tx: Transaction, target: Target) {
  const copy = body(target.markdownFile); const entity = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [target.id] });
  if (entity.rows.length !== 1 || (String(entity.rows[0]?.type) !== "pen" && String(entity.rows[0]?.type) !== "article") || (String(entity.rows[0]?.slug) !== target.oldSlug && String(entity.rows[0]?.slug) !== target.slug)) throw new Error(`Phase 102 identity mismatch: ${target.id}`);
  const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [target.slug, target.id] }); if (collision.rows.length) throw new Error(`Phase 102 slug collision: ${target.slug}`);
  await clearPayload(tx, target.id);
  await tx.execute({ sql: "DELETE FROM entity_links WHERE (source_id = ? OR target_id = ?) AND link_type IN ('made_by', 'reverse')", args: [target.id, target.id] });
  await tx.execute({ sql: "UPDATE entities SET type='article', slug=?, name=?, summary=?, body_md=?, source=?, source_url=NULL, updated_at=datetime('now') WHERE id=?", args: [target.slug, target.name, copy.summary, copy.content, `curated:phase102:${target.slug}`, target.id] });
  await tx.execute({ sql: "DELETE FROM entity_publications WHERE entity_id = ?", args: [target.id] });
  for (const source of target.sources) {
    const item = await upsertSource(tx, source);
    await tx.execute({ sql: "INSERT INTO entity_references (id, entity_id, source_item_id, relation_type, note, review_status) VALUES (?, ?, ?, 'official', ?, 'approved')", args: [id("phase102-reference", `${target.id}:${source.key}`), target.id, item, source.summary] });
  }
  await tx.execute({ sql: "INSERT INTO stories (id, entity_id, title, story_type, summary, body_md, status, source_notes) VALUES (?, ?, ?, 'overview', ?, ?, 'published', ?)", args: [id("phase102-story", target.id), target.id, target.name, copy.summary, copy.content, `curated:phase102:${target.slug}`] });
  const imageSource = await upsertSource(tx, { key: `diagram-${target.slug}`, title: `${target.name} facts diagram`, url: target.image, summary: "本站原创事实示意图；非产品照片。" });
  await tx.execute({ sql: "INSERT INTO media_assets (id, entity_id, title, asset_type, local_path, author, license, attribution_text, source_url, source_item_id, review_status, usage_status) VALUES (?, ?, ?, 'diagram', ?, 'Fountain Pen Graph editorial', 'site-original', ?, ?, ?, 'approved', 'primary')", args: [id("phase102-media", target.id), target.id, `${target.name} 系列导航事实图`, target.image, "本站原创事实示意图，非产品照片；不代表任何具体限定笔的比例、颜色、材质、笔尖、年份、限量数或包装。", target.image, imageSource] });
  await recordReclassification(tx, target);
}

export async function applyPhase102MontblancSeriesNavigationContent(client: Client, options: ApplyPhase22Options) {
  await assertOwned(client, options); const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE102_MONTBLANC_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "montblanc") throw new Error("Phase 102 Montblanc brand identity mismatch.");
    for (const target of TARGETS) await applyTarget(tx, target);
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities: TARGETS.map((target) => ({ entityId: target.id, outcome: "published" as const })) };
}

function value(name: string) { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main() {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase102-montblanc-series-navigation-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { process.stdout.write(`${JSON.stringify(await applyPhase102MontblancSeriesNavigationContent(client, { workspaceRoot: process.cwd(), reviewer: "phase102-montblanc-series", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
