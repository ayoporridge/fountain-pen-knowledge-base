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

export const PHASE496_MEDIA_TARGETS = [
  {
    entityId: "6bBDoAc4ULKm",
    type: "brand",
    slug: "chilton",
    mediaId: "curated-media-5afe2ffac84617361354ef7c",
    oldSourceItemId: "curated-source-item-eafb4978d861aadfbbff380b",
    sourceItemId: "curated-source-item-phase496-chilton-brand",
    localPath: "/images/library/site-original/phase496/chilton/brand.svg",
    title: "Chilton 品牌谱系与 Wing-flow 边界事实图（示意图，非产品照片）",
    summary: "本站原创 Chilton 品牌层事实图；区分 Boston／Long Island、pneumatic filler、Chiltonian、Golden Quill 与 Wing-flow，具体尖和密封状态按单支核验。",
  },
  {
    entityId: "5zbJPFGxfCXu",
    type: "brand",
    slug: "picasso",
    mediaId: "curated-media-6ec341b6335338b4da82abd8",
    oldSourceItemId: "curated-source-item-ba7df7a0d5af573a82e060d7",
    sourceItemId: "curated-source-item-phase496-picasso-brand",
    localPath: "/images/library/site-original/phase496/picasso/brand.svg",
    title: "Picasso 毕加索品牌与 916 边界事实图（示意图，非产品照片）",
    summary: "本站原创 Picasso 品牌层事实图；以上海帕弗洛与 Malaga 916 为已核实入口，保留其它书写模式、联名礼盒和市场 SKU 的边界。",
  },
  {
    entityId: "7ayTZUG4BVgU",
    type: "brand",
    slug: "ingersoll",
    mediaId: "curated-media-98801d2fee17ad5686d0f2ee",
    oldSourceItemId: "curated-source-item-dda32e9d582e6504b8cbf37f",
    sourceItemId: "curated-source-item-phase496-ingersoll-brand",
    localPath: "/images/library/site-original/phase496/ingersoll/brand.svg",
    title: "Ingersoll Dollar Pen 材料与上墨边界事实图（示意图，非产品照片）",
    summary: "本站原创 Ingersoll 品牌层事实图；区分金属、赛璐珞、Bakelite 与 stem-winder 线索，不把单支金／钢尖或修复状态扩展成全系规格。",
  },
  {
    entityId: "x0PbAr6vvwf9",
    type: "brand",
    slug: "wearever",
    mediaId: "curated-media-d617102c48ae9ecbcc75f312",
    oldSourceItemId: "curated-source-item-246d175700cf92cc2bca500b",
    sourceItemId: "curated-source-item-phase496-wearever-brand",
    localPath: "/images/library/site-original/phase496/wearever/brand.svg",
    title: "Wearever 品牌与 Zenith 边界事实图（示意图，非产品照片）",
    summary: "本站原创 Wearever 品牌层事实图；把 David Kahn、注塑材料、Zenith 与相邻产品线分开，战时金／钢尖和颜色按单支证据判断。",
  },
  {
    entityId: "aijX3l7Eed6N",
    type: "brand",
    slug: "wahl",
    mediaId: "curated-media-fa9246fab4b9cbf5e97c9665",
    oldSourceItemId: "curated-source-item-e40ee9afa00bb0bc1d8a0815",
    sourceItemId: "curated-source-item-phase496-wahl-brand",
    localPath: "/images/library/site-original/phase496/wahl/brand.svg",
    title: "Wahl 品牌谱系与材料转折事实图（示意图，非产品照片）",
    summary: "本站原创 Wahl 品牌层事实图；区分 Boston、Tempoint 与 Wahl Pen 的早期谱系及硬橡胶／赛璐珞转折，不将后期 Wahl-Eversharp 型号回填到早期页面。",
  },
] as const;

export const PHASE496_MODEL_MEDIA_TARGETS = [
  ["2XGqrpYS7j0c", "the-chilton-wing-flow", "curated-media-5a7a2fb7a90633ed16de66c9", "/images/library/site-original/phase165/chilton/wing-flow.svg"],
  ["FZaeo2DF5_Qd", "毕加索-picasso-916", "curated-media-acf975097072d93c67725700", "/images/library/site-original/phase208/picasso/picasso-916.svg"],
  ["OwOqThACQI6M", "the-ingersoll-dollar-pen", "curated-media-1db434df6325918f9e37192d", "/images/library/site-original/phase209/ingersoll/dollar-pen.svg"],
  ["ZkG6VOvfGspq", "the-wearever-zenith", "curated-media-a95a5716b0e425ba71c99fb6", "/images/library/site-original/phase210/wearever/zenith.svg"],
  ["NbQ5cQ_jPBEO", "the-wahl-pen", "curated-media-059dfb9d608e8b23fbd1cbcd", "/images/library/site-original/phase211/wahl/the-wahl-pen.svg"],
] as const;

export interface ApplyPhase496Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase496Result {
  changed: boolean;
  entities: Array<{ entityId: string; slug: string; outcome: "published" | "noop"; contentHash: string }>;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 496 refuses inherited remote database selection: ${key}.`);
  }
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase496Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, root)) {
    throw new Error("Phase 496 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)) {
    throw new Error("Phase 496 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 496 client is not bound to the owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 496 owned copy must be migrated through 032.");
}

async function assertIdentity(client: Client, workspaceRoot: string): Promise<void> {
  if ((await rows(client, "SELECT id FROM source_registry WHERE id=?", [SOURCE_REGISTRY_ID])).length !== 1) throw new Error("Phase 496 editorial source registry missing.");
  for (const target of PHASE496_MEDIA_TARGETS) {
    const entity = await rows(client, "SELECT type,slug FROM entities WHERE id=?", [target.entityId]);
    if (entity.length !== 1 || String(entity[0]?.type) !== target.type || String(entity[0]?.slug) !== target.slug) throw new Error(`Phase 496 target identity mismatch: ${target.entityId}`);
    const media = await rows(client, "SELECT entity_id FROM media_assets WHERE id=?", [target.mediaId]);
    if (media.length !== 1 || String(media[0]?.entity_id) !== target.entityId) throw new Error(`Phase 496 target media mismatch: ${target.slug}`);
    const assetPath = path.resolve(workspaceRoot, "public", target.localPath.slice(1));
    if (!target.localPath.startsWith("/images/") || !fs.existsSync(assetPath)) throw new Error(`Phase 496 missing public asset: ${target.localPath}`);
    const collision = await rows(client, "SELECT ma.entity_id FROM media_assets ma WHERE ma.local_path=? AND ma.id<>? AND ma.review_status='approved' AND ma.usage_status='primary'", [target.localPath, target.mediaId]);
    if (collision.length > 0) throw new Error(`Phase 496 replacement path already assigned: ${target.localPath}`);
  }
  for (const [entityId, slug, mediaId, localPath] of PHASE496_MODEL_MEDIA_TARGETS) {
    const entity = await rows(client, "SELECT type,slug FROM entities WHERE id=?", [entityId]);
    if (entity.length !== 1 || String(entity[0]?.type) !== "pen" || String(entity[0]?.slug) !== slug) throw new Error(`Phase 496 model identity mismatch: ${entityId}`);
    const media = await rows(client, "SELECT entity_id,local_path FROM media_assets WHERE id=? AND entity_id=? AND review_status='approved' AND usage_status='primary'", [mediaId, entityId]);
    if (media.length !== 1 || String(media[0]?.local_path) !== localPath) throw new Error(`Phase 496 model media must remain canonical: ${slug}`);
    if (!fs.existsSync(path.resolve(workspaceRoot, "public", localPath.slice(1)))) throw new Error(`Phase 496 model asset is missing: ${localPath}`);
  }
}

async function ensureSource(transaction: Transaction, target: (typeof PHASE496_MEDIA_TARGETS)[number]): Promise<void> {
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
      JSON.stringify({ curatedSourceKey: `phase496-${target.slug}-media` }),
      "store_full",
      "approved",
      "primary",
      "fountain-pen-graph-editorial-phase496",
      target.localPath,
      `project-public-asset:${target.localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;phase=496`,
    ],
  });
  const item = await rows(transaction, "SELECT source_id,url,title FROM source_items WHERE id=?", [target.sourceItemId]);
  if (item.length !== 1 || String(item[0]?.source_id) !== SOURCE_REGISTRY_ID || String(item[0]?.url) !== target.localPath || String(item[0]?.title) !== target.title) throw new Error(`Phase 496 source item mismatch: ${target.sourceItemId}`);
}

async function updateMedia(client: Client): Promise<Set<string>> {
  const changed = new Set<string>();
  const transaction = await client.transaction("write");
  try {
    for (const target of PHASE496_MEDIA_TARGETS) {
      const current = await rows(transaction, "SELECT source_item_id,local_path,image_url,thumbnail_url,source_url,title,author,license,attribution_text,review_status,usage_status FROM media_assets WHERE id=? AND entity_id=?", [target.mediaId, target.entityId]);
      if (current.length !== 1) throw new Error(`Phase 496 media row missing: ${target.slug}`);
      const row = current[0];
      const alreadyCurrent = [row?.source_item_id, row?.local_path, row?.image_url, row?.thumbnail_url, row?.source_url, row?.title, row?.author, row?.license, row?.attribution_text, row?.review_status, row?.usage_status].map(String).join("\0") === [target.sourceItemId, target.localPath, target.localPath, target.localPath, target.localPath, target.title, "Fountain Pen Graph editorial", "site-original", target.summary, "approved", "primary"].join("\0");
      await ensureSource(transaction, target);
      if (!alreadyCurrent) changed.add(target.entityId);
      await transaction.execute({
        sql: `UPDATE media_assets SET title=?,image_url=?,thumbnail_url=?,local_path=?,source_url=?,source_item_id=?,author=?,license=?,attribution_text=?,review_status='approved',usage_status='primary',updated_at=datetime('now') WHERE id=? AND entity_id=?`,
        args: [target.title, target.localPath, target.localPath, target.localPath, target.localPath, target.sourceItemId, "Fountain Pen Graph editorial", "site-original", target.summary, target.mediaId, target.entityId],
      });
      await transaction.execute({ sql: "UPDATE entity_references SET source_item_id=?,review_status='approved' WHERE entity_id=? AND source_item_id=?", args: [target.sourceItemId, target.entityId, target.oldSourceItemId] });
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
  return changed;
}

export async function applyPhase496HistoricalBrandMedia(client: Client, options: ApplyPhase496Options): Promise<ApplyPhase496Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 496 reviewer must not be empty.");
  await assertAuthority(client, options);
  await assertIdentity(client, options.workspaceRoot);
  const changed = await updateMedia(client);
  const entities: ApplyPhase496Result["entities"] = [];
  for (const target of PHASE496_MEDIA_TARGETS) {
    const contentHash = await computePublicationContentHash(client, target.entityId);
    const publication = await rows(client, "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?", [target.entityId]);
    if (!changed.has(target.entityId) && String(publication[0]?.status) === "published" && String(publication[0]?.approved_content_hash) === contentHash) {
      entities.push({ entityId: target.entityId, slug: target.slug, outcome: "noop", contentHash });
      continue;
    }
    for (const reviewKind of ["fact", "language", "media"] as const) await recordEntityContentReview(client, { entityId: target.entityId, reviewKind, reviewer: options.reviewer, status: "approved", contentHash, notes: `Phase 496 separated the ${target.slug} brand/model primary factual SVG.` });
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase496-historical-brand-media.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase496HistoricalBrandMedia(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase496-historical-brand-media", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: process.env });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
