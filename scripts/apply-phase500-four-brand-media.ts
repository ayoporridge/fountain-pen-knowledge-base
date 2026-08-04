import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import { computePublicationContentHash, publishEntity, recordEntityContentReview } from "../src/lib/publication";

const SOURCE_REGISTRY_ID = "curated-source-registry-80bcb53d7086a809d0fdb6cf";
const RETRIEVED_AT = "2026-08-04";

export const PHASE500_MEDIA_TARGETS = [
  { entityId: "phase349-david-oscarson-brand", type: "brand", slug: "david-oscarson", mediaId: "curated-media-0c85a6b50c14cb24008f9398", oldSourceItemId: "curated-source-item-50d9acca31acd7c444ec20e5", sourceItemId: "curated-source-item-phase500-david-oscarson-brand", localPath: "/images/library/site-original/phase500/david-oscarson/brand.svg", title: "David Oscarson 品牌与 Winter Collection 边界事实图（示意图，非产品照片）", summary: "本站原创 David Oscarson 品牌层事实图；区分独立限量书写工具与 Winter Collection 的作品／批次边界，不把单支装饰和材料写成全系规格。" },
  { entityId: "phase350-bexley-brand", type: "brand", slug: "bexley", mediaId: "curated-media-f2919392cfe924fd2010fe82", oldSourceItemId: "curated-source-item-b69123204fd8889c486e8e1d", sourceItemId: "curated-source-item-phase500-bexley-brand", localPath: "/images/library/site-original/phase500/bexley/brand.svg", title: "Bexley 品牌与 Original 边界事实图（示意图，非产品照片）", summary: "本站原创 Bexley 品牌层事实图；以 Original 为代表入口，颜色、尖宽和上墨字段按具体 SKU 与样本核验。" },
  { entityId: "phase351-gioia-brand", type: "brand", slug: "gioia", mediaId: "curated-media-5ee10072b39181fcec1e084f", oldSourceItemId: "curated-source-item-60cd71b82111dde80ea4780d", sourceItemId: "curated-source-item-phase500-gioia-brand", localPath: "/images/library/site-original/phase500/gioia/brand.svg", title: "Gioia Pen Italia 与 Capodimonte Kawari 边界事实图（示意图，非产品照片）", summary: "本站原创 Gioia 品牌层事实图；区分意大利独立品牌与 Capodimonte Kawari 型号，树脂纹理、尖和供墨按型号与批次核验。" },
  { entityId: "phase352-danitrio-brand", type: "brand", slug: "danitrio", mediaId: "curated-media-3f8c5e525884129f12b01b9e", oldSourceItemId: "curated-source-item-657db1eb33db6381a159bb23", sourceItemId: "curated-source-item-phase500-danitrio-brand", localPath: "/images/library/site-original/phase500/danitrio/brand.svg", title: "Danitrio 品牌与 Densho 漆艺边界事实图（示意图，非产品照片）", summary: "本站原创 Danitrio 品牌层事实图；区分漆艺／maki-e 作品与 Densho 代表型号，装饰、尖和供墨按作品来源核验。" },
] as const;

export const PHASE500_MODEL_MEDIA_TARGETS = [
  ["phase349-david-oscarson-winter", "david-oscarson-winter", "curated-media-44941131baf7b1a91b42fc3e", "/images/library/site-original/phase349/david-oscarson/winter.svg"],
  ["phase350-bexley-original", "bexley-original", "curated-media-4e26b2fa96415c054cf47b1d", "/images/library/site-original/phase350/bexley/original.svg"],
  ["phase351-gioia-capodimonte-kawari", "gioia-capodimonte-kawari", "curated-media-a573a97c9560a1fd92738e91", "/images/library/site-original/phase351/gioia/capodimonte-kawari.svg"],
  ["phase352-danitrio-densho", "danitrio-densho", "curated-media-37b4d6b1bebe5740b4c0541b", "/images/library/site-original/phase352/danitrio/densho.svg"],
] as const;

export interface ApplyPhase500Options { workspaceRoot: string; reviewer: string; databasePath: string; ownedRoot: string; protectedCatalogPath: string; protectedCatalogSnapshot: CatalogSnapshot; env?: NodeJS.ProcessEnv; }
export interface ApplyPhase500Result { changed: boolean; entities: Array<{ entityId: string; slug: string; outcome: "published" | "noop"; contentHash: string }>; }

function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function rejectRemote(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 500 refuses inherited remote database selection: ${key}.`); }
async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) { return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row })); }

async function assertAuthority(client: Client, options: ApplyPhase500Options): Promise<void> {
  rejectRemote(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, root)) throw new Error("Phase 500 requires an owned, non-symlink catalog copy.");
  const owned = fs.statSync(database, { bigint: true }); const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)) throw new Error("Phase 500 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 500 client is not bound to the owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 500 owned copy must be migrated through 032.");
}

async function assertIdentity(client: Client, workspaceRoot: string): Promise<void> {
  if ((await rows(client, "SELECT id FROM source_registry WHERE id=?", [SOURCE_REGISTRY_ID])).length !== 1) throw new Error("Phase 500 editorial source registry missing.");
  for (const target of PHASE500_MEDIA_TARGETS) {
    const entity = await rows(client, "SELECT type,slug FROM entities WHERE id=?", [target.entityId]); if (entity.length !== 1 || String(entity[0]?.type) !== target.type || String(entity[0]?.slug) !== target.slug) throw new Error(`Phase 500 target identity mismatch: ${target.entityId}`);
    const media = await rows(client, "SELECT entity_id FROM media_assets WHERE id=?", [target.mediaId]); if (media.length !== 1 || String(media[0]?.entity_id) !== target.entityId) throw new Error(`Phase 500 target media mismatch: ${target.slug}`);
    if (!target.localPath.startsWith("/images/") || !fs.existsSync(path.resolve(workspaceRoot, "public", target.localPath.slice(1)))) throw new Error(`Phase 500 missing public asset: ${target.localPath}`);
    if ((await rows(client, "SELECT ma.entity_id FROM media_assets ma WHERE ma.local_path=? AND ma.id<>? AND ma.review_status='approved' AND ma.usage_status='primary'", [target.localPath, target.mediaId])).length > 0) throw new Error(`Phase 500 replacement path already assigned: ${target.localPath}`);
  }
  for (const [entityId, slug, mediaId, localPath] of PHASE500_MODEL_MEDIA_TARGETS) {
    const entity = await rows(client, "SELECT type,slug FROM entities WHERE id=?", [entityId]); if (entity.length !== 1 || String(entity[0]?.type) !== "pen" || String(entity[0]?.slug) !== slug) throw new Error(`Phase 500 model identity mismatch: ${entityId}`);
    const media = await rows(client, "SELECT entity_id,local_path FROM media_assets WHERE id=? AND entity_id=? AND review_status='approved' AND usage_status='primary'", [mediaId, entityId]); if (media.length !== 1 || String(media[0]?.local_path) !== localPath) throw new Error(`Phase 500 model media must remain canonical: ${slug}`);
    if (!fs.existsSync(path.resolve(workspaceRoot, "public", localPath.slice(1)))) throw new Error(`Phase 500 model asset is missing: ${localPath}`);
  }
}

async function ensureSource(transaction: Transaction, target: (typeof PHASE500_MEDIA_TARGETS)[number]): Promise<void> {
  await transaction.execute({ sql: `INSERT OR IGNORE INTO source_items(id,source_id,title,url,item_type,license,author,retrieved_at,summary,raw_metadata_json,allowed_use,review_status,source_tier,independence_group,archive_url,archive_locator) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, args: [target.sourceItemId, SOURCE_REGISTRY_ID, target.title, target.localPath, "image", "site-original", "Fountain Pen Graph editorial", RETRIEVED_AT, target.summary, JSON.stringify({ curatedSourceKey: `phase500-${target.slug}-media` }), "store_full", "approved", "primary", "fountain-pen-graph-editorial-phase500", target.localPath, `project-public-asset:${target.localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;phase=500`] });
  const item = await rows(transaction, "SELECT source_id,url,title FROM source_items WHERE id=?", [target.sourceItemId]); if (item.length !== 1 || String(item[0]?.source_id) !== SOURCE_REGISTRY_ID || String(item[0]?.url) !== target.localPath || String(item[0]?.title) !== target.title) throw new Error(`Phase 500 source item mismatch: ${target.sourceItemId}`);
}

async function updateMedia(client: Client): Promise<Set<string>> {
  const changed = new Set<string>(); const transaction = await client.transaction("write");
  try {
    for (const target of PHASE500_MEDIA_TARGETS) {
      const current = await rows(transaction, "SELECT source_item_id,local_path,image_url,thumbnail_url,source_url,title,author,license,attribution_text,review_status,usage_status FROM media_assets WHERE id=? AND entity_id=?", [target.mediaId, target.entityId]); if (current.length !== 1) throw new Error(`Phase 500 media row missing: ${target.slug}`);
      const row = current[0]; const alreadyCurrent = [row?.source_item_id, row?.local_path, row?.image_url, row?.thumbnail_url, row?.source_url, row?.title, row?.author, row?.license, row?.attribution_text, row?.review_status, row?.usage_status].map(String).join("\0") === [target.sourceItemId, target.localPath, target.localPath, target.localPath, target.localPath, target.title, "Fountain Pen Graph editorial", "site-original", target.summary, "approved", "primary"].join("\0");
      await ensureSource(transaction, target); if (!alreadyCurrent) changed.add(target.entityId);
      await transaction.execute({ sql: `UPDATE media_assets SET title=?,image_url=?,thumbnail_url=?,local_path=?,source_url=?,source_item_id=?,author=?,license=?,attribution_text=?,review_status='approved',usage_status='primary',updated_at=datetime('now') WHERE id=? AND entity_id=?`, args: [target.title, target.localPath, target.localPath, target.localPath, target.localPath, target.sourceItemId, "Fountain Pen Graph editorial", "site-original", target.summary, target.mediaId, target.entityId] });
      await transaction.execute({ sql: "UPDATE entity_references SET source_item_id=?,review_status='approved' WHERE entity_id=? AND source_item_id=?", args: [target.sourceItemId, target.entityId, target.oldSourceItemId] });
    }
    await transaction.commit();
  } catch (error) { if (!transaction.closed) await transaction.rollback(); throw error; }
  return changed;
}

export async function applyPhase500FourBrandMedia(client: Client, options: ApplyPhase500Options): Promise<ApplyPhase500Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 500 reviewer must not be empty."); await assertAuthority(client, options); await assertIdentity(client, options.workspaceRoot); const changed = await updateMedia(client); const entities: ApplyPhase500Result["entities"] = [];
  for (const target of PHASE500_MEDIA_TARGETS) {
    const contentHash = await computePublicationContentHash(client, target.entityId); const publication = await rows(client, "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?", [target.entityId]);
    if (!changed.has(target.entityId) && String(publication[0]?.status) === "published" && String(publication[0]?.approved_content_hash) === contentHash) { entities.push({ entityId: target.entityId, slug: target.slug, outcome: "noop", contentHash }); continue; }
    for (const reviewKind of ["fact", "language", "media"] as const) await recordEntityContentReview(client, { entityId: target.entityId, reviewKind, reviewer: options.reviewer, status: "approved", contentHash, notes: `Phase 500 separated the ${target.slug} brand/model primary factual SVG.` });
    const published = await publishEntity(client, { entityId: target.entityId, reviewer: options.reviewer, contentHash }); entities.push({ entityId: target.entityId, slug: target.slug, outcome: "published", contentHash: published.contentHash });
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return { changed: changed.size > 0, entities };
}

function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase500-four-brand-media.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try { const result = await applyPhase500FourBrandMedia(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase500-four-brand-media", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: process.env }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
