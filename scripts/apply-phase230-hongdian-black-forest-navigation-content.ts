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
import { applyPhase163HongdianModels } from "./apply-phase163-hongdian-models-content";

export const PHASE230_HONGDIAN_BRAND_ID = "4yRpvovXFoWh";
export const PHASE230_BLACK_FOREST_ID = "GOTYyfNxvLAE";
export const PHASE230_BLACK_FOREST_SLUG = "hongdian-black-forest-family";
const OLD_SLUG = "弘典-hongdian-黑森林-黑森林pro";
const MARKDOWN = ".planning/content-research/hongdian-black-forest-navigation-phase230.md";
const IMAGE = "/images/library/site-original/phase230/hongdian/black-forest-family.svg";
const RETRIEVED = "2026-07-26";
const SOURCE_MARKER = `curated:phase230:${PHASE230_BLACK_FOREST_SLUG}`;

type Source = {
  key: string;
  title: string;
  url: string;
  sourceType: "official" | "retailer" | "blog" | "forum" | "user_submission";
  tier: "primary" | "contemporary_archive" | "professional_secondary" | "community";
  summary: string;
};

const SOURCES: Source[] = [
  {
    key: "hongdian-site",
    title: "HongDian Pens product site",
    url: "https://hongdianpens.com/",
    sourceType: "official",
    tier: "primary",
    summary: "品牌产品与常温水清洁语境；不据此推断法人、创立年份或型号统一规格。",
  },
  {
    key: "budapest-1850",
    title: "Budapest Pen Show：Hongdian 1850 Black Forest fountain pen test",
    url: "https://budapestpenshow.hu/en/hongdian-1850-black-forest-toltotoll-test/",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立实测记录 1850 的 PVD 金属、钢尖、约 138 mm、11 mm、31 g、笔帽与细握位；仅代表该样本。",
  },
  {
    key: "rokomari-1860",
    title: "Rokomari：HongDian 1860 Max Black Forest Fountain Pen",
    url: "https://www.rokomari.com/product/539985/hongdian-max-metal-matte-black-forest-metal-matte-fountain-pen-without-box",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary: "零售页列出 1860 Max、约 139 mm、约 14 mm、#6 钢尖、旋帽和 converter／cartridge；数值按该页面样本阅读。",
  },
  {
    key: "ttpen-1861",
    title: "TTpen：Hongdian 1861 Fountain Pen – Vintage Raw Brass Body",
    url: "https://www.ttpen.com/products/hongdian-1861-fountain-pen-vintage-raw-brass-body",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary: "具体 HD-1861BS-1 销售页，列出裸黄铜、EF/F/M/B 选项和墨囊／转换器路线；不替其它编号背书。",
  },
  {
    key: "reddit-boundary",
    title: "Reddit r/fountainpens：What’s the difference of the hongdian black forest models?",
    url: "https://www.reddit.com/r/fountainpens/comments/1hrwads/whats_the_difference_of_the_hongdian_black_forest/",
    sourceType: "forum",
    tier: "community",
    summary: "社区讨论把 1851 与 1860 Max 的握位和重量分开描述，作为版本边界旁证，不当作工厂规格表。",
  },
];

function id(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 230 refuses remote database selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase22Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(root).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !inside(database, root)
  ) throw new Error("Phase 230 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) {
    throw new Error("Phase 230 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 230 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 230 owned copy must be migrated through 032.");
}

function reviewedCopy(workspaceRoot: string): { summary: string; body: string } {
  const markdown = fs.readFileSync(path.resolve(workspaceRoot, MARKDOWN), "utf8").replace(/\r\n?/g, "\n");
  const summary = markdown.match(/^## summary\s*\n+([\s\S]*?)(?=^## )/m)?.[1]?.trim();
  const body = markdown.match(/^## body_md\s*\n+([\s\S]*?)(?=^## 来源\s*$)/m)?.[1]?.trim();
  if (!summary || !body || Array.from(summary).length < 80 || Array.from(body).length < 1_800) {
    throw new Error(`Phase 230 reviewed copy is incomplete: ${MARKDOWN}`);
  }
  return { summary, body };
}

async function upsertSource(tx: Transaction, source: Source): Promise<string> {
  const registry = id("phase230-source-registry", source.sourceType === "official" ? "hongdian-official" : source.key);
  const item = id("phase230-source-item", source.key);
  const reliability = source.sourceType === "official" ? "official_marketing" : source.sourceType === "forum" ? "community_opinion" : "medium";
  const homepage = source.url.startsWith("/") ? "/" : new URL(source.url).origin;
  await tx.execute({
    sql: "INSERT INTO source_registry (id,name,source_type,allowed_use,reliability,homepage_url,fetch_method,notes,last_checked_at,default_source_tier,default_independence_group) VALUES (?,?,?,'summary_only',?,?,?,?,? ,?,'phase230-hongdian') ON CONFLICT(id) DO NOTHING",
    args: [registry, source.sourceType === "official" ? "HongDian official" : source.title, source.sourceType, reliability, homepage, "manual", "Phase 230 reviewed source register", RETRIEVED, source.tier],
  });
  await tx.execute({
    sql: "INSERT INTO source_items (id,source_id,title,url,item_type,retrieved_at,summary,raw_metadata_json,allowed_use,review_status,source_tier,independence_group,archive_url,archive_locator) VALUES (?,?,?,?,'web_page',?,?,?,?, 'approved',?,?,?,?) ON CONFLICT(id) DO NOTHING",
    args: [item, registry, source.title, source.url, RETRIEVED, source.summary, JSON.stringify({ phase: 230, source: source.key }), source.tier === "primary" ? "summary_only" : "summary_only", source.tier, "phase230-hongdian", source.url, `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${source.summary}`],
  });
  return item;
}

async function clearPayload(tx: Transaction): Promise<void> {
  await tx.execute({ sql: "DELETE FROM citations WHERE target_id IN (SELECT id FROM stories WHERE entity_id = ?) OR target_id = ?", args: [PHASE230_BLACK_FOREST_ID, PHASE230_BLACK_FOREST_ID] });
  for (const sql of [
    "DELETE FROM entity_references WHERE entity_id = ?",
    "DELETE FROM media_assets WHERE entity_id = ?",
    "DELETE FROM stories WHERE entity_id = ?",
    "DELETE FROM entity_aliases WHERE entity_id = ?",
    "DELETE FROM claims WHERE subject_entity_id = ?",
  ]) await tx.execute({ sql, args: [PHASE230_BLACK_FOREST_ID] });
}

async function alreadyApplied(client: Client): Promise<boolean> {
  const entity = await client.execute({ sql: "SELECT type,slug,source,body_md FROM entities WHERE id=?", args: [PHASE230_BLACK_FOREST_ID] });
  if (entity.rows.length !== 1 || String(entity.rows[0]?.type) !== "article" || String(entity.rows[0]?.slug) !== PHASE230_BLACK_FOREST_SLUG || String(entity.rows[0]?.source) !== SOURCE_MARKER) return false;
  const story = await client.execute({ sql: "SELECT count(*) AS value FROM stories WHERE entity_id=? AND status='published' AND story_type='overview'", args: [PHASE230_BLACK_FOREST_ID] });
  const refs = await client.execute({ sql: "SELECT count(*) AS value FROM entity_references WHERE entity_id=? AND review_status='approved' AND id LIKE 'phase230-reference-%'", args: [PHASE230_BLACK_FOREST_ID] });
  const media = await client.execute({ sql: "SELECT count(*) AS value FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved' AND id LIKE 'phase230-media-%'", args: [PHASE230_BLACK_FOREST_ID] });
  return Array.from(String(entity.rows[0]?.body_md ?? "")).length >= 1_800 && Number(story.rows[0]?.value) === 1 && Number(refs.rows[0]?.value) === SOURCES.length && Number(media.rows[0]?.value) === 1;
}

async function recordReclassification(tx: Transaction): Promise<void> {
  const key = `${PHASE230_BLACK_FOREST_ID}:${OLD_SLUG}->${PHASE230_BLACK_FOREST_SLUG}`;
  const batchId = id("phase230-batch", key);
  const actionId = id("phase230-action", key);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id,source_key,source_checksum,status,note) VALUES (?,?,?,'applied',?)", args: [batchId, key, createHash("sha256").update(key).digest("hex"), "Reclassify the mixed Black Forest/Pro/1861 shell as a sourced family-navigation article."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES (?,?,?,'rename',?,?,?,?,?)", args: [actionId, batchId, OLD_SLUG, createHash("sha256").update(key).digest("hex"), PHASE230_BLACK_FOREST_ID, PHASE230_BLACK_FOREST_ID, "applied", "The old mixed route now explains the separate 1850/1851, 1860 Max and 1861 boundaries."] });
}

export async function applyPhase230HongdianBlackForestNavigationContent(client: Client, options: ApplyPhase22Options) {
  await assertOwned(client, options);
  if (await alreadyApplied(client)) {
    await applyPhase163HongdianModels(client, options);
    return { entities: [{ entityId: PHASE230_BLACK_FOREST_ID, outcome: "noop" as const }] };
  }
  const copy = reviewedCopy(options.workspaceRoot);
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [PHASE230_HONGDIAN_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "hongdian") throw new Error("Phase 230 HongDian brand identity mismatch.");
    const entity = await tx.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [PHASE230_BLACK_FOREST_ID] });
    if (entity.rows.length !== 1 || (String(entity.rows[0]?.type) !== "pen" && String(entity.rows[0]?.type) !== "article") || (String(entity.rows[0]?.slug) !== OLD_SLUG && String(entity.rows[0]?.slug) !== PHASE230_BLACK_FOREST_SLUG)) throw new Error("Phase 230 Black Forest mixed identity mismatch.");
    const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug=? AND id<>?", args: [PHASE230_BLACK_FOREST_SLUG, PHASE230_BLACK_FOREST_ID] });
    if (collision.rows.length > 0) throw new Error("Phase 230 Black Forest article slug collision.");
    await clearPayload(tx);
    await tx.execute({ sql: "DELETE FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse')", args: [PHASE230_BLACK_FOREST_ID, PHASE230_BLACK_FOREST_ID] });
    await tx.execute({ sql: "UPDATE entities SET type='article',slug=?,name='HongDian 黑森林家族（型号边界导航）',summary=?,body_md=?,source=?,source_url=NULL,updated_at=datetime('now') WHERE id=?", args: [PHASE230_BLACK_FOREST_SLUG, copy.summary, copy.body, SOURCE_MARKER, PHASE230_BLACK_FOREST_ID] });
    await tx.execute({ sql: "DELETE FROM entity_publications WHERE entity_id=?", args: [PHASE230_BLACK_FOREST_ID] });
    for (const source of SOURCES) {
      const item = await upsertSource(tx, source);
      await tx.execute({ sql: "INSERT INTO entity_references (id,entity_id,source_item_id,relation_type,note,review_status) VALUES (?,?,?,'reference',?,'approved')", args: [id("phase230-reference", `${PHASE230_BLACK_FOREST_ID}:${source.key}`), PHASE230_BLACK_FOREST_ID, item, source.summary] });
    }
    const imageItem = await upsertSource(tx, { key: "diagram", title: "HongDian Black Forest family boundary diagram", url: IMAGE, sourceType: "user_submission", tier: "primary", summary: "本站原创事实示意图；非产品照片，不按比例。" });
    await tx.execute({ sql: "INSERT INTO media_assets (id,entity_id,title,asset_type,local_path,author,license,attribution_text,source_url,source_item_id,review_status,usage_status) VALUES (?,?,?,'diagram',?,'Fountain Pen Graph editorial','site-original',?,?,?,'approved','primary')", args: [id("phase230-media", PHASE230_BLACK_FOREST_ID), PHASE230_BLACK_FOREST_ID, "HongDian 黑森林家族型号边界事实图", IMAGE, "本站原创事实示意图，非产品照片；不代表真实比例、颜色、Logo、库存或包装。", IMAGE, imageItem] });
    await tx.execute({ sql: "INSERT INTO stories (id,entity_id,title,story_type,summary,body_md,status,source_notes) VALUES (?,?,?,'overview',?,?, 'published',?)", args: [id("phase230-story", PHASE230_BLACK_FOREST_ID), PHASE230_BLACK_FOREST_ID, "HongDian 黑森林家族型号边界", copy.summary, copy.body, SOURCE_MARKER] });
    await recordReclassification(tx);
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
  await applyPhase163HongdianModels(client, options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities: [{ entityId: PHASE230_BLACK_FOREST_ID, outcome: "published" as const }] };
}

function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }

async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase230-hongdian-black-forest-navigation-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { process.stdout.write(`${JSON.stringify(await applyPhase230HongdianBlackForestNavigationContent(client, { workspaceRoot: process.cwd(), reviewer: "phase230-hongdian-black-forest", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
