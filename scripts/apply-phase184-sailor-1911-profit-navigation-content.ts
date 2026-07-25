import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { publishEntity, recordEntityContentReview } from "../src/lib/publication";
import type { ApplyPhase22Options } from "./apply-phase22-content";

export const PHASE184_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE184_SERIES_ID = "mSvIKpw1GsoS";
export const PHASE184_SERIES_SLUG = "sailor-1911-profit";
const OLD_SLUG = "写乐-sailor-1911-profit系列";
const MARKDOWN = ".planning/content-research/sailor-1911-profit-navigation-phase184.md";
const IMAGE = "/images/library/site-original/phase184/sailor-1911-profit.svg";
const RETRIEVED = "2026-07-25";

type Source = { key: string; title: string; url: string; summary: string; sourceType: "official" | "blog"; tier: "primary" | "contemporary_archive" | "professional_secondary" };
const SOURCES: Source[] = [
  { key: "directory", title: "Sailor official 1911 series directory", url: "https://en.sailor.co.jp/topics/1911-series/", summary: "官方系列页把 Standard、Large、Black Luster 等路线分开，提供当前目录边界。", sourceType: "official", tier: "primary" },
  { key: "history", title: "Sailor official company history", url: "https://en.sailor.co.jp/company/history/", summary: "官方公司史用于 1911 年创立与 1917 年规模化制造的历史语境。", sourceType: "official", tier: "primary" },
  { key: "standard", title: "Sailor Profit Standard 11-1219", url: "https://sailor.co.jp/product/11-1219/", summary: "官方日文产品页用于对应 Profit Standard 与 11-1219 产品号。", sourceType: "official", tier: "primary" },
  { key: "large", title: "Sailor 1911 Large 11-2021 / 11-2024", url: "https://en.sailor.co.jp/product/1911-large/", summary: "官方英文产品页用于区分 21K Large 号段与 Standard。", sourceType: "official", tier: "contemporary_archive" },
  { key: "review", title: "The Pen Addict：Sailor 1911 Standard review", url: "https://www.penaddict.com/blog/2020/2/10/sailor-1911-standard-royal-amethyst-fountain-pen-review", summary: "专业评测只补充单支 1911 Standard 的握持与反馈，不外推到全家族。", sourceType: "blog", tier: "professional_secondary" },
  { key: "graphic", title: "Sailor 1911／Profit series navigation factual SVG", url: IMAGE, summary: "本站原创系列边界示意图；非产品照片。", sourceType: "official", tier: "primary" },
];

function id(prefix: string, value: string): string { return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function reviewedCopy() {
  const markdown = fs.readFileSync(path.resolve(process.cwd(), MARKDOWN), "utf8").replace(/\r\n?/g, "\n");
  const summary = markdown.match(/^## summary\s*\n+([\s\S]*?)(?=^## )/m)?.[1]?.trim();
  const body = markdown.match(/^## body_md\s*\n+([\s\S]*?)(?=^## 来源\s*$)/m)?.[1]?.trim();
  if (!summary || !body || Array.from(body).length < 1_800) throw new Error(`Phase 184 reviewed copy is incomplete: ${MARKDOWN}`);
  return { summary, body };
}
function rejectRemote(env: NodeJS.ProcessEnv) { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 184 refuses remote database selection: ${key}.`); }
async function assertOwned(client: Client, options: ApplyPhase22Options) {
  rejectRemote(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 184 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 184 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 184 client is not bound to its owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 184 owned copy must be migrated through 032.");
}
async function upsertSource(tx: Transaction, source: Source) {
  const registry = id("phase184-source-registry", source.key);
  const item = id("phase184-source-item", source.key);
  await tx.execute({ sql: "INSERT INTO source_registry (id,name,source_type,allowed_use,reliability,homepage_url,fetch_method,notes,last_checked_at,default_source_tier,default_independence_group) VALUES (?,?,?,'summary_only',?,?, 'manual', ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET last_checked_at=excluded.last_checked_at, updated_at=datetime('now')", args: [registry, source.sourceType === "official" ? "The Sailor Pen Co., Ltd." : "The Pen Addict", source.sourceType, source.sourceType === "official" ? "official_marketing" : "high_for_model_history", source.url.startsWith("http") ? new URL(source.url).origin : "/", "Phase 184 series navigation source register", RETRIEVED, source.tier, `phase184-${source.key}`] });
  await tx.execute({ sql: "INSERT INTO source_items (id,source_id,title,url,item_type,retrieved_at,summary,raw_metadata_json,allowed_use,review_status,source_tier,independence_group,archive_url,archive_locator) VALUES (?,?,?,?,'web_page',?,?,?,'summary_only','approved',?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,url=excluded.url,retrieved_at=excluded.retrieved_at,summary=excluded.summary,review_status='approved',updated_at=datetime('now')", args: [item, registry, source.title, source.url, RETRIEVED, source.summary, JSON.stringify({ phase: 184, source: source.key }), source.tier, `phase184-${source.sourceType}`, source.url, `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${source.summary}`] });
  return item;
}
async function clearPayload(tx: Transaction) {
  await tx.execute({ sql: "DELETE FROM citations WHERE target_id IN (SELECT id FROM stories WHERE entity_id = ?) OR target_id = ?", args: [PHASE184_SERIES_ID, PHASE184_SERIES_ID] });
  for (const sql of ["DELETE FROM entity_references WHERE entity_id = ?", "DELETE FROM media_assets WHERE entity_id = ?", "DELETE FROM stories WHERE entity_id = ?", "DELETE FROM entity_aliases WHERE entity_id = ?", "DELETE FROM claims WHERE subject_entity_id = ?"]) await tx.execute({ sql, args: [PHASE184_SERIES_ID] });
}
async function recordRedirect(tx: Transaction) {
  const sourcePath = `/pen/${OLD_SLUG}`; const targetPath = `/article/${PHASE184_SERIES_SLUG}`; const key = `${PHASE184_SERIES_ID}:${sourcePath}->${targetPath}`; const batch = id("phase184-batch", key); const action = id("phase184-action", key);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)", args: [batch, key, createHash("sha256").update(key).digest("hex"), "Reclassify Sailor 1911／Profit shell from pen to series-navigation article."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'rename',?,?,?,'applied',?)", args: [action, batch, OLD_SLUG, createHash("sha256").update(key).digest("hex"), PHASE184_SERIES_ID, PHASE184_SERIES_ID, "1911／Profit is a family navigation node, not one pen model."] });
  // Article targets are redirected by the app's reclassified-article map. The
  // taxonomy action above is the durable audit record because entity_redirects
  // only accepts /brand/* and /pen/* targets.
}
async function restoreSailorBrandPublication(client: Client, reviewer: string): Promise<void> {
  const row = await client.execute({ sql: "SELECT status FROM entity_publications WHERE entity_id=?", args: [PHASE184_SAILOR_BRAND_ID] });
  if (String(row.rows[0]?.status ?? "") === "published") return;
  const stories = await client.execute({ sql: "SELECT count(*) AS value FROM stories WHERE entity_id=? AND status='published'", args: [PHASE184_SAILOR_BRAND_ID] });
  if (Number(stories.rows[0]?.value ?? 0) === 0) return;
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, { entityId: PHASE184_SAILOR_BRAND_ID, reviewKind, reviewer, status: "approved", notes: "Phase 184 restored the existing Sailor brand publication after series navigation source registration." });
  }
  await publishEntity(client, { entityId: PHASE184_SAILOR_BRAND_ID, reviewer });
}
export async function applyPhase184SailorNavigation(client: Client, options: ApplyPhase22Options) {
  await assertOwned(client, options); const copy = reviewedCopy(); const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [PHASE184_SAILOR_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "sailor") throw new Error("Phase 184 Sailor brand identity mismatch.");
    const entity = await tx.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [PHASE184_SERIES_ID] });
    if (entity.rows.length !== 1 || !["pen", "article"].includes(String(entity.rows[0]?.type)) || ![OLD_SLUG, PHASE184_SERIES_SLUG].includes(String(entity.rows[0]?.slug))) throw new Error("Phase 184 series identity mismatch.");
    const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug=? AND id<>?", args: [PHASE184_SERIES_SLUG, PHASE184_SERIES_ID] }); if (collision.rows.length) throw new Error("Phase 184 article slug collision.");
    await clearPayload(tx);
    await tx.execute({ sql: "DELETE FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','member_of_series','marketed_under_licensed_brand')", args: [PHASE184_SERIES_ID, PHASE184_SERIES_ID] });
    await tx.execute({ sql: "UPDATE entities SET type='article',slug=?,name='写乐 Sailor 1911／Profit（系列导航）',summary=?,body_md=?,source=?,source_url=NULL,updated_at=datetime('now') WHERE id=?", args: [PHASE184_SERIES_SLUG, copy.summary, copy.body, `curated:phase184:${PHASE184_SERIES_SLUG}`, PHASE184_SERIES_ID] });
    await tx.execute({ sql: "DELETE FROM entity_publications WHERE entity_id=?", args: [PHASE184_SERIES_ID] });
    for (const source of SOURCES) { const item = source.key === "graphic" ? await upsertSource(tx, source) : await upsertSource(tx, source); await tx.execute({ sql: "INSERT INTO entity_references(id,entity_id,source_item_id,relation_type,note,review_status) VALUES(?,?,?,?,'approved source for series navigation','approved')", args: [id("phase184-reference", `${PHASE184_SERIES_ID}:${source.key}`), PHASE184_SERIES_ID, item, source.sourceType === "official" ? "official" : "review"] }); }
    await tx.execute({ sql: "INSERT INTO stories(id,entity_id,title,story_type,summary,body_md,status,source_notes) VALUES(?,?,?,'overview',?,?, 'published',?)", args: [id("phase184-story", PHASE184_SERIES_ID), PHASE184_SERIES_ID, "写乐 Sailor 1911／Profit（系列导航）", copy.summary, copy.body, `curated:phase184:${PHASE184_SERIES_SLUG}`] });
    const image = SOURCES.find((source) => source.key === "graphic"); if (!image) throw new Error("Phase 184 graphic source missing."); const imageItem = id("phase184-source-item", image.key);
    await tx.execute({ sql: "INSERT INTO media_assets(id,entity_id,title,asset_type,local_path,author,license,attribution_text,source_url,source_item_id,review_status,usage_status) VALUES(?,?,?,'diagram',?,'Fountain Pen Graph editorial','site-original',?,?,?,'approved','primary')", args: [id("phase184-media", PHASE184_SERIES_ID), PHASE184_SERIES_ID, "Sailor 1911／Profit 系列导航事实图", IMAGE, "本站原创 factual SVG；系列示意图，非产品实拍，不代表任何具体产品比例、颜色、尖号或供墨方式。", IMAGE, imageItem] });
    for (const modelId of ["GXGa7rK83Jmi", "Ga6QpPQiF0YT", "VyZ6lMsgEeUo", "OwE1TbVzfyQK", "9jIF6QOt8wGr", "ZNBYjDlGF4FY", "Gmdr1MCj1Pp8", "mgrSd-kwaHmS"]) {
      const model = await tx.execute({ sql: "SELECT id FROM entities WHERE id=? AND type='pen'", args: [modelId] }); if (model.rows.length === 1) await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'related',?)", args: [id("phase184-related", modelId), PHASE184_SERIES_ID, modelId, "Phase 184 1911／Profit series navigation to exact model"] });
    }
    await recordRedirect(tx); await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
  await restoreSailorBrandPublication(client, options.reviewer);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return { entities: [{ entityId: PHASE184_SERIES_ID, outcome: "published" as const }] };
}
function value(name: string) { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main() { const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase184-sailor-1911-profit-navigation-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>"); const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` }); try { process.stdout.write(`${JSON.stringify(await applyPhase184SailorNavigation(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase184-sailor-navigation", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); } }
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
