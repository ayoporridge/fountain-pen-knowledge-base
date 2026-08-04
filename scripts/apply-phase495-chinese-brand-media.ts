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

export const PHASE495_MEDIA_TARGETS = [
  {
    entityId: "ncUFilOHTET2",
    type: "brand",
    slug: "yiren",
    mediaId: "curated-media-00f3022b429ccc7d2508322c",
    sourceItemId: "curated-source-item-phase495-yiren-brand",
    localPath: "/images/library/site-original/phase495/yiren/brand.svg",
    title: "依人 Yiren 品牌与型号边界事实图（示意图，非产品照片）",
    summary: "本站原创依人品牌层事实图；以 878 为已完成代表入口，并把相邻三位数编号与无型号礼品笔留在待核边界。",
  },
  {
    entityId: "yTWZrIZnGyMx",
    type: "brand",
    slug: "yongxu",
    mediaId: "curated-media-c8ca4b67ffcd8a912f74436a",
    sourceItemId: "curated-source-item-phase495-yongxu-brand",
    localPath: "/images/library/site-original/phase495/yongxu/brand.svg",
    title: "YongXu 品牌与 286 版本边界事实图（示意图，非产品照片）",
    summary: "本站原创 YongXu 品牌层事实图；说明 286 的按钮上墨与多笔尖样本边界，不把少量 14K demo 写成全系标配。",
  },
  {
    entityId: "v303FVWUV9sR",
    type: "brand",
    slug: "dongwu",
    mediaId: "curated-media-b7019948221b4e8c4807c0fa",
    sourceItemId: "curated-source-item-phase495-dongwu-brand",
    localPath: "/images/library/site-original/phase495/dongwu/brand.svg",
    title: "东吴 DongWu 品牌资料边界事实图（示意图，非产品照片）",
    summary: "本站原创东吴品牌层事实图；以 948 的实物评测为入口，提示旧笔状态与上墨未知字段，不外推完整目录。",
  },
  {
    entityId: "DnQI7CPpnewz",
    type: "brand",
    slug: "shule",
    mediaId: "curated-media-d269a75cd440b6126df57741",
    sourceItemId: "curated-source-item-phase495-shule-brand",
    localPath: "/images/library/site-original/phase495/shule/brand.svg",
    title: "书乐 ShuLe 品牌与相邻型号边界事实图（示意图，非产品照片）",
    summary: "本站原创书乐品牌层事实图；区分已完成的 2398 与论坛中的 2212 研究线索，不把相邻编号规格互相移植。",
  },
  {
    entityId: "mZNUfRureJsC",
    type: "brand",
    slug: "zhangjiang",
    mediaId: "curated-media-398b5598842b8c92b2019f41",
    sourceItemId: "curated-source-item-phase495-zhangjiang-brand",
    localPath: "/images/library/site-original/phase495/zhangjiang/brand.svg",
    title: "长江 ZhangJiang 品牌与转写边界事实图（示意图，非产品照片）",
    summary: "本站原创长江品牌层事实图；区分 ZhangJiang 988 代表入口与 Changjiang／Type 28 研究线索，不共享未经核实的规格。",
  },
] as const;

export const PHASE495_MODEL_MEDIA_TARGETS = [
  ["pJVODqR4jDGw", "依人-yiren-878", "curated-media-20c761255d6139e00d80df86", "/images/library/site-original/phase231/yiren/yiren-878-structure.svg"],
  ["phase234-yongxu-286", "yongxu-286", "curated-media-3288886c3a81702e89ce9e44", "/images/library/site-original/phase234/yongxu/yongxu-286.svg"],
  ["dbp20JATzwzm", "东吴-dongwu-948", "curated-media-3f0669742cf2001639fb5cd1", "/images/library/site-original/phase235/dongwu/dongwu-948.svg"],
  ["p81bNOu9URb7", "书乐-shule-2398", "curated-media-c8cfacc11bca612f0d185548", "/images/library/site-original/phase235/shule/shule-2398.svg"],
  ["fTRyXVmvdg58", "长江-zhangjiang-988", "curated-media-c6fbd8e6a4a30657c8428bc4", "/images/library/site-original/phase235/zhangjiang/zhangjiang-988.svg"],
] as const;

export interface ApplyPhase495Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase495Result {
  changed: boolean;
  entities: Array<{ entityId: string; slug: string; outcome: "published" | "noop"; contentHash: string }>;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 495 refuses inherited remote database selection: ${key}.`);
  }
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase495Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, root)) {
    throw new Error("Phase 495 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)) {
    throw new Error("Phase 495 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 495 client is not bound to the owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 495 owned copy must be migrated through 032.");
}

async function assertIdentity(client: Client, workspaceRoot: string): Promise<void> {
  if ((await rows(client, "SELECT id FROM source_registry WHERE id=?", [SOURCE_REGISTRY_ID])).length !== 1) throw new Error("Phase 495 editorial source registry missing.");
  for (const target of PHASE495_MEDIA_TARGETS) {
    const entity = await rows(client, "SELECT type,slug FROM entities WHERE id=?", [target.entityId]);
    if (entity.length !== 1 || String(entity[0]?.type) !== target.type || String(entity[0]?.slug) !== target.slug) throw new Error(`Phase 495 target identity mismatch: ${target.entityId}`);
    const media = await rows(client, "SELECT entity_id FROM media_assets WHERE id=?", [target.mediaId]);
    if (media.length !== 1 || String(media[0]?.entity_id) !== target.entityId) throw new Error(`Phase 495 target media mismatch: ${target.slug}`);
    const assetPath = path.resolve(workspaceRoot, "public", target.localPath.slice(1));
    if (!target.localPath.startsWith("/images/") || !fs.existsSync(assetPath)) throw new Error(`Phase 495 missing public asset: ${target.localPath}`);
    const collision = await rows(client, "SELECT ma.entity_id FROM media_assets ma WHERE ma.local_path=? AND ma.id<>? AND ma.review_status='approved' AND ma.usage_status='primary'", [target.localPath, target.mediaId]);
    if (collision.length > 0) throw new Error(`Phase 495 replacement path already assigned: ${target.localPath}`);
  }
  for (const [entityId, slug, mediaId, localPath] of PHASE495_MODEL_MEDIA_TARGETS) {
    const entity = await rows(client, "SELECT type,slug FROM entities WHERE id=?", [entityId]);
    if (entity.length !== 1 || String(entity[0]?.type) !== "pen" || String(entity[0]?.slug) !== slug) throw new Error(`Phase 495 model identity mismatch: ${entityId}`);
    const media = await rows(client, "SELECT entity_id,local_path FROM media_assets WHERE id=? AND entity_id=? AND review_status='approved' AND usage_status='primary'", [mediaId, entityId]);
    if (media.length !== 1 || String(media[0]?.local_path) !== localPath) throw new Error(`Phase 495 model media must remain canonical: ${slug}`);
    const assetPath = path.resolve(workspaceRoot, "public", localPath.slice(1));
    if (!fs.existsSync(assetPath)) throw new Error(`Phase 495 model asset is missing: ${localPath}`);
  }
}

async function ensureSource(transaction: Transaction, target: (typeof PHASE495_MEDIA_TARGETS)[number]): Promise<void> {
  await transaction.execute({
    sql: `INSERT OR IGNORE INTO source_items(
      id,source_id,title,url,item_type,license,author,retrieved_at,summary,
      raw_metadata_json,allowed_use,review_status,source_tier,independence_group,
      archive_url,archive_locator
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      target.sourceItemId,
      SOURCE_REGISTRY_ID,
      target.title,
      target.localPath,
      "image",
      "site-original",
      "Fountain Pen Graph editorial",
      RETRIEVED_AT,
      target.summary,
      JSON.stringify({ curatedSourceKey: `phase495-${target.slug}-media` }),
      "store_full",
      "approved",
      "primary",
      "fountain-pen-graph-editorial-phase495",
      target.localPath,
      `project-public-asset:${target.localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;phase=495`,
    ],
  });
  const item = await rows(transaction, "SELECT source_id,url,title FROM source_items WHERE id=?", [target.sourceItemId]);
  if (item.length !== 1 || String(item[0]?.source_id) !== SOURCE_REGISTRY_ID || String(item[0]?.url) !== target.localPath || String(item[0]?.title) !== target.title) throw new Error(`Phase 495 source item mismatch: ${target.sourceItemId}`);
}

async function updateMedia(client: Client): Promise<Set<string>> {
  const changed = new Set<string>();
  const transaction = await client.transaction("write");
  try {
    for (const target of PHASE495_MEDIA_TARGETS) {
      const current = await rows(transaction, "SELECT source_item_id,local_path,image_url,thumbnail_url,source_url,title,author,license,attribution_text,review_status,usage_status FROM media_assets WHERE id=? AND entity_id=?", [target.mediaId, target.entityId]);
      if (current.length !== 1) throw new Error(`Phase 495 media row missing: ${target.slug}`);
      const row = current[0];
      const alreadyCurrent = [row?.source_item_id, row?.local_path, row?.image_url, row?.thumbnail_url, row?.source_url, row?.title, row?.author, row?.license, row?.attribution_text, row?.review_status, row?.usage_status].map(String).join("\0") === [target.sourceItemId, target.localPath, target.localPath, target.localPath, target.localPath, target.title, "Fountain Pen Graph editorial", "site-original", target.summary, "approved", "primary"].join("\0");
      await ensureSource(transaction, target);
      if (!alreadyCurrent) changed.add(target.entityId);
      const oldSource = String(row?.source_item_id ?? "");
      await transaction.execute({
        sql: `UPDATE media_assets SET title=?,image_url=?,thumbnail_url=?,local_path=?,source_url=?,source_item_id=?,author=?,license=?,attribution_text=?,review_status='approved',usage_status='primary',updated_at=datetime('now') WHERE id=? AND entity_id=?`,
        args: [target.title, target.localPath, target.localPath, target.localPath, target.localPath, target.sourceItemId, "Fountain Pen Graph editorial", "site-original", target.summary, target.mediaId, target.entityId],
      });
      if (oldSource && oldSource !== target.sourceItemId) await transaction.execute({ sql: "UPDATE entity_references SET source_item_id=?,review_status='approved' WHERE entity_id=? AND source_item_id=?", args: [target.sourceItemId, target.entityId, oldSource] });
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
  return changed;
}

export async function applyPhase495ChineseBrandMedia(client: Client, options: ApplyPhase495Options): Promise<ApplyPhase495Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 495 reviewer must not be empty.");
  await assertAuthority(client, options);
  await assertIdentity(client, options.workspaceRoot);
  const changed = await updateMedia(client);
  const entities: ApplyPhase495Result["entities"] = [];
  for (const target of PHASE495_MEDIA_TARGETS) {
    const contentHash = await computePublicationContentHash(client, target.entityId);
    const publication = await rows(client, "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?", [target.entityId]);
    if (!changed.has(target.entityId) && String(publication[0]?.status) === "published" && String(publication[0]?.approved_content_hash) === contentHash) {
      entities.push({ entityId: target.entityId, slug: target.slug, outcome: "noop", contentHash });
      continue;
    }
    for (const reviewKind of ["fact", "language", "media"] as const) await recordEntityContentReview(client, { entityId: target.entityId, reviewKind, reviewer: options.reviewer, status: "approved", contentHash, notes: `Phase 495 separated the ${target.slug} brand/model primary factual SVG.` });
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase495-chinese-brand-media.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase495ChineseBrandMedia(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase495-chinese-brand-media", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: process.env });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
