import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";

const SOURCE_REGISTRY_ID = "curated-source-registry-80bcb53d7086a809d0fdb6cf";
const RETRIEVED_AT = "2026-08-04";

export const PHASE497_MEDIA_TARGETS = [
  {
    entityId: "pwbUeoKAp7xI",
    type: "brand",
    slug: "dunn",
    mediaId: "curated-media-47f9326e978cd8ec6ee94d8c",
    oldSourceItemId: "curated-source-item-2216e4706a053a663052dae8",
    sourceItemId: "curated-source-item-phase497-dunn-brand",
    localPath: "/images/library/site-original/phase497/dunn/brand.svg",
    title: "Dunn-Pen 泵式上墨与材料边界事实图（示意图，非产品照片）",
    summary: "本站原创 Dunn 品牌层事实图；区分专利 pump filler、红色泵杆、透明 barrel 与 Dreadnaught 名称，材料和维修状态按单支核验。",
  },
  {
    entityId: "phase254-brand-st-dupont",
    type: "brand",
    slug: "st-dupont",
    mediaId: "curated-media-fd2823e747d4edfb66f9073d",
    oldSourceItemId: "curated-source-item-d03418ba75d0b49b7ad54dde",
    sourceItemId: "curated-source-item-phase497-st-dupont-brand",
    localPath: "/images/library/site-original/phase497/st-dupont/brand.svg",
    title: "S.T. Dupont 品牌与 Line D Eternity 边界事实图（示意图，非产品照片）",
    summary: "本站原创 S.T. Dupont 品牌层事实图；区分 Paris／Faverges heritage、钢笔与其它书写模式，以及 Line D Eternity 的漆面、剑形夹、Wings nib 与 plunger 线索。",
  },
  {
    entityId: "phase257-brand-eboya",
    type: "brand",
    slug: "eboya",
    mediaId: "curated-media-abf05b11ab069e412cf8e9cc",
    oldSourceItemId: "curated-source-item-698e8a518af8a3185c638d88",
    sourceItemId: "curated-source-item-phase497-eboya-brand",
    localPath: "/images/library/site-original/phase497/eboya/brand.svg",
    title: "Eboya HOUJU 尺寸与材料边界事实图（示意图，非产品照片）",
    summary: "本站原创 Eboya 品牌层事实图；以 Nikko Ebonite 与 HOUJU M 黑色款为入口，区分 S/M/L、14K Bock #6 narrow 与国际规格 C/C，不外推每支纹理和写感。",
  },
  {
    entityId: "phase259-brand-kanwrite",
    type: "brand",
    slug: "kanwrite",
    mediaId: "curated-media-4510ad4f1876cd7e763ae263",
    oldSourceItemId: "curated-source-item-2397bbbfa2b9a6816a033c15",
    sourceItemId: "curated-source-item-phase497-kanwrite-brand",
    localPath: "/images/library/site-original/phase497/kanwrite/brand.svg",
    title: "Kanwrite 品牌与 Heritage 活塞路线事实图（示意图，非产品照片）",
    summary: "本站原创 Kanwrite 品牌层事实图；区分 Kanpur Writers／OEM 背景、Heritage 的 acrylic 活塞与可换 #6 单元，以及 Legacy、Desire 等独立路线。",
  },
  {
    entityId: "phase260-brand-gravitas",
    type: "brand",
    slug: "gravitas",
    mediaId: "curated-media-13dd03989aa49af3f57206a3",
    oldSourceItemId: "curated-source-item-ba4711355410b7d0525888f5",
    sourceItemId: "curated-source-item-phase497-gravitas-brand",
    localPath: "/images/library/site-original/phase497/gravitas/brand.svg",
    title: "Gravitas Pens 上墨路线与 Ultemate Vac 边界事实图（示意图，非产品照片）",
    summary: "本站原创 Gravitas 品牌层事实图；区分 Piston、Pocket、Vac 2.0 与 Ultemate Vac 的机制和材料，不把单一 SKU 的容量、重量或保修限制扩展到全系。",
  },
] as const;

export const PHASE497_MODEL_MEDIA_TARGETS = [
  ["Jfj3aTwb70wG", "the-dunn-pen", "curated-media-5d0100761e393a28f11fe7b0", "/images/library/site-original/phase212/dunn/dunn-pen.svg"],
  ["phase254-st-dupont-line-d-eternity", "st-dupont-line-d-eternity", "curated-media-66ae535224e8b985e11952e0", "/images/library/site-original/phase254/st-dupont/line-d-eternity.svg"],
  ["phase257-eboya-houju-m-black", "eboya-houju-m-black", "curated-media-ba07b48fc8ea92e212976500", "/images/library/site-original/phase257/eboya/houju-m.svg"],
  ["phase259-kanwrite-heritage", "kanwrite-heritage", "curated-media-90a7310e52a94e7ef34931cf", "/images/library/site-original/phase259/kanwrite/heritage.svg"],
  ["phase260-gravitas-ultemate-vac", "gravitas-ultemate-vac", "curated-media-0719534b33a0d1440a84560f", "/images/library/site-original/phase260/gravitas/ultemate-vac.svg"],
] as const;

export interface ApplyPhase497Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase497Result {
  changed: boolean;
  entities: Array<{ entityId: string; slug: string; outcome: "published" | "noop"; contentHash: string }>;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 497 refuses inherited remote database selection: ${key}.`);
  }
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase497Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, root)) throw new Error("Phase 497 requires an owned, non-symlink catalog copy.");
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)) throw new Error("Phase 497 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 497 client is not bound to the owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 497 owned copy must be migrated through 032.");
}

async function assertIdentity(client: Client, workspaceRoot: string): Promise<void> {
  if ((await rows(client, "SELECT id FROM source_registry WHERE id=?", [SOURCE_REGISTRY_ID])).length !== 1) throw new Error("Phase 497 editorial source registry missing.");
  for (const target of PHASE497_MEDIA_TARGETS) {
    const entity = await rows(client, "SELECT type,slug FROM entities WHERE id=?", [target.entityId]);
    if (entity.length !== 1 || String(entity[0]?.type) !== target.type || String(entity[0]?.slug) !== target.slug) throw new Error(`Phase 497 target identity mismatch: ${target.entityId}`);
    const media = await rows(client, "SELECT entity_id FROM media_assets WHERE id=?", [target.mediaId]);
    if (media.length !== 1 || String(media[0]?.entity_id) !== target.entityId) throw new Error(`Phase 497 target media mismatch: ${target.slug}`);
    const assetPath = path.resolve(workspaceRoot, "public", target.localPath.slice(1));
    if (!target.localPath.startsWith("/images/") || !fs.existsSync(assetPath)) throw new Error(`Phase 497 missing public asset: ${target.localPath}`);
    const collision = await rows(client, "SELECT ma.entity_id FROM media_assets ma WHERE ma.local_path=? AND ma.id<>? AND ma.review_status='approved' AND ma.usage_status='primary'", [target.localPath, target.mediaId]);
    if (collision.length > 0) throw new Error(`Phase 497 replacement path already assigned: ${target.localPath}`);
  }
  for (const [entityId, slug, mediaId, localPath] of PHASE497_MODEL_MEDIA_TARGETS) {
    const entity = await rows(client, "SELECT type,slug FROM entities WHERE id=?", [entityId]);
    if (entity.length !== 1 || String(entity[0]?.type) !== "pen" || String(entity[0]?.slug) !== slug) throw new Error(`Phase 497 model identity mismatch: ${entityId}`);
    const media = await rows(client, "SELECT entity_id,local_path FROM media_assets WHERE id=? AND entity_id=? AND review_status='approved' AND usage_status='primary'", [mediaId, entityId]);
    if (media.length !== 1 || String(media[0]?.local_path) !== localPath) throw new Error(`Phase 497 model media must remain canonical: ${slug}`);
    if (!fs.existsSync(path.resolve(workspaceRoot, "public", localPath.slice(1)))) throw new Error(`Phase 497 model asset is missing: ${localPath}`);
  }
}

async function ensureSource(transaction: Transaction, target: (typeof PHASE497_MEDIA_TARGETS)[number]): Promise<void> {
  await transaction.execute({
    sql: `INSERT OR IGNORE INTO source_items(
      id,source_id,title,url,item_type,license,author,retrieved_at,summary,
      raw_metadata_json,allowed_use,review_status,source_tier,independence_group,
      archive_url,archive_locator
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [target.sourceItemId, SOURCE_REGISTRY_ID, target.title, target.localPath, "image", "site-original", "Fountain Pen Graph editorial", RETRIEVED_AT, target.summary, JSON.stringify({ curatedSourceKey: `phase497-${target.slug}-media` }), "store_full", "approved", "primary", "fountain-pen-graph-editorial-phase497", target.localPath, `project-public-asset:${target.localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;phase=497`],
  });
  const item = await rows(transaction, "SELECT source_id,url,title FROM source_items WHERE id=?", [target.sourceItemId]);
  if (item.length !== 1 || String(item[0]?.source_id) !== SOURCE_REGISTRY_ID || String(item[0]?.url) !== target.localPath || String(item[0]?.title) !== target.title) throw new Error(`Phase 497 source item mismatch: ${target.sourceItemId}`);
}

async function updateMedia(client: Client): Promise<Set<string>> {
  const changed = new Set<string>();
  const transaction = await client.transaction("write");
  try {
    for (const target of PHASE497_MEDIA_TARGETS) {
      const current = await rows(transaction, "SELECT source_item_id,local_path,image_url,thumbnail_url,source_url,title,author,license,attribution_text,review_status,usage_status FROM media_assets WHERE id=? AND entity_id=?", [target.mediaId, target.entityId]);
      if (current.length !== 1) throw new Error(`Phase 497 media row missing: ${target.slug}`);
      const row = current[0];
      const alreadyCurrent = [row?.source_item_id, row?.local_path, row?.image_url, row?.thumbnail_url, row?.source_url, row?.title, row?.author, row?.license, row?.attribution_text, row?.review_status, row?.usage_status].map(String).join("\0") === [target.sourceItemId, target.localPath, target.localPath, target.localPath, target.localPath, target.title, "Fountain Pen Graph editorial", "site-original", target.summary, "approved", "primary"].join("\0");
      await ensureSource(transaction, target);
      if (!alreadyCurrent) changed.add(target.entityId);
      await transaction.execute({ sql: `UPDATE media_assets SET title=?,image_url=?,thumbnail_url=?,local_path=?,source_url=?,source_item_id=?,author=?,license=?,attribution_text=?,review_status='approved',usage_status='primary',updated_at=datetime('now') WHERE id=? AND entity_id=?`, args: [target.title, target.localPath, target.localPath, target.localPath, target.localPath, target.sourceItemId, "Fountain Pen Graph editorial", "site-original", target.summary, target.mediaId, target.entityId] });
      await transaction.execute({ sql: "UPDATE entity_references SET source_item_id=?,review_status='approved' WHERE entity_id=? AND source_item_id=?", args: [target.sourceItemId, target.entityId, target.oldSourceItemId] });
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
  return changed;
}

export async function applyPhase497AdditionalBrandMedia(client: Client, options: ApplyPhase497Options): Promise<ApplyPhase497Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 497 reviewer must not be empty.");
  await assertAuthority(client, options);
  await assertIdentity(client, options.workspaceRoot);
  const changed = await updateMedia(client);
  const entities: ApplyPhase497Result["entities"] = [];
  for (const target of PHASE497_MEDIA_TARGETS) {
    const contentHash = await computePublicationContentHash(client, target.entityId);
    const publication = await rows(client, "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?", [target.entityId]);
    if (!changed.has(target.entityId) && String(publication[0]?.status) === "published" && String(publication[0]?.approved_content_hash) === contentHash) {
      entities.push({ entityId: target.entityId, slug: target.slug, outcome: "noop", contentHash });
      continue;
    }
    for (const reviewKind of ["fact", "language", "media"] as const) await recordEntityContentReview(client, { entityId: target.entityId, reviewKind, reviewer: options.reviewer, status: "approved", contentHash, notes: `Phase 497 separated the ${target.slug} brand/model primary factual SVG.` });
    const published = await publishEntity(client, { entityId: target.entityId, reviewer: options.reviewer, contentHash });
    entities.push({ entityId: target.entityId, slug: target.slug, outcome: "published", contentHash: published.contentHash });
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { changed: changed.size > 0, entities };
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase497-additional-brand-media.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase497AdditionalBrandMedia(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase497-additional-brand-media", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: process.env });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
