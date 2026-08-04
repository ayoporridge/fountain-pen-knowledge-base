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

export const PHASE498_MEDIA_TARGETS = [
  {
    entityId: "phase260-brand-ranga",
    type: "brand",
    slug: "ranga",
    mediaId: "curated-media-af311dc59371faebc1bd671f",
    oldSourceItemId: "curated-source-item-b77e6ee9710ba96de97fbc93",
    sourceItemId: "curated-source-item-phase498-ranga-brand",
    localPath: "/images/library/site-original/phase498/ranga/brand.svg",
    title: "Ranga Pens 手工材料与订单边界事实图（示意图，非产品照片）",
    summary: "本站原创 Ranga 品牌层事实图；区分 Model 3、Model 3C、材料与订单层级，钢笔／rollerball、尖、feed 和 converter 按具体订单核验。",
  },
  {
    entityId: "phase261-brand-magna-carta",
    type: "brand",
    slug: "magna-carta",
    mediaId: "curated-media-da4192c7feb511c56accc3d3",
    oldSourceItemId: "curated-source-item-25e9e77775a437ae38d2a4d7",
    sourceItemId: "curated-source-item-phase498-magna-carta-brand",
    localPath: "/images/library/site-original/phase498/magna-carta/brand.svg",
    title: "Magna Carta 型号与弹性尖边界事实图（示意图，非产品照片）",
    summary: "本站原创 Magna Carta 品牌层事实图；区分 Mag 600、Mag 600 S、Mag 1000 与 Trilli，颜色、尖材和 flex 配置不互相移植。",
  },
  {
    entityId: "phase262-brand-taccia",
    type: "brand",
    slug: "taccia",
    mediaId: "curated-media-08dd13b460908e60907f8eb5",
    oldSourceItemId: "curated-source-item-cc6fbe81d29b2aee74acaf73",
    sourceItemId: "curated-source-item-phase498-taccia-brand",
    localPath: "/images/library/site-original/phase498/taccia/brand.svg",
    title: "TACCIA 标准树脂与漆艺路线事实图（示意图，非产品照片）",
    summary: "本站原创 TACCIA 品牌层事实图；把 Spotlight、Spectrum、Pinnacle 与漆艺／PENFORT 关联路线分开，透明、尖材和供墨按型号核验。",
  },
  {
    entityId: "phase272-brand-mabie-todd",
    type: "brand",
    slug: "mabie-todd",
    mediaId: "curated-media-9198417a118a78596113fcfe",
    oldSourceItemId: "curated-source-item-0a353b091ff96bff8dc103ad",
    sourceItemId: "curated-source-item-phase498-mabie-todd-brand",
    localPath: "/images/library/site-original/phase498/mabie-todd/brand.svg",
    title: "Mabie Todd & Co. 与 Swan 历史断点事实图（示意图，非产品照片）",
    summary: "本站原创 Mabie Todd 品牌层历史图；区分纽约起步、英国制造、Swan 家族和 Biro Swan 断点，不把馆藏单支规格写成全系标准。",
  },
  {
    entityId: "phase274-brand-lotus-pens",
    type: "brand",
    slug: "lotus-pens",
    mediaId: "curated-media-8cf625d27c0b47a6898b5c8e",
    oldSourceItemId: "curated-source-item-d450e80332a71f5800e3c0a1",
    sourceItemId: "curated-source-item-phase498-lotus-brand",
    localPath: "/images/library/site-original/phase498/lotus/brand.svg",
    title: "Lotus Pens 手工家族与 Student 边界事实图（示意图，非产品照片）",
    summary: "本站原创 Lotus 品牌层事实图；以 Student Premium Ebonite 为代表入口，区分其它家族、材料与定制订单，不把 SKU 规格扩展到全品牌。",
  },
] as const;

export const PHASE498_MODEL_MEDIA_TARGETS = [
  ["phase260-ranga-model-3", "ranga-model-3", "curated-media-405a25e1b626ce666c5a7fec", "/images/library/site-original/phase260/ranga/model-3.svg"],
  ["phase261-magna-carta-mag-600", "magna-carta-mag-600", "curated-media-c4497d4c187c6e0ee04f221d", "/images/library/site-original/phase261/magna-carta/mag-600.svg"],
  ["phase262-taccia-spotlight", "taccia-spotlight", "curated-media-28faafeb9e7b9174173243cf", "/images/library/site-original/phase262/taccia/spotlight.svg"],
  ["phase272-mabie-todd-swan", "mabie-todd-swan", "curated-media-77906623973588bd29c12e26", "/images/library/site-original/phase272/mabie-todd/swan.svg"],
  ["phase274-lotus-student", "lotus-student", "curated-media-429e128b4d0d327c201be93f", "/images/library/site-original/phase274/lotus/student.svg"],
] as const;

export interface ApplyPhase498Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase498Result {
  changed: boolean;
  entities: Array<{ entityId: string; slug: string; outcome: "published" | "noop"; contentHash: string }>;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 498 refuses inherited remote database selection: ${key}.`);
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase498Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, root)) throw new Error("Phase 498 requires an owned, non-symlink catalog copy.");
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)) throw new Error("Phase 498 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 498 client is not bound to the owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 498 owned copy must be migrated through 032.");
}

async function assertIdentity(client: Client, workspaceRoot: string): Promise<void> {
  if ((await rows(client, "SELECT id FROM source_registry WHERE id=?", [SOURCE_REGISTRY_ID])).length !== 1) throw new Error("Phase 498 editorial source registry missing.");
  for (const target of PHASE498_MEDIA_TARGETS) {
    const entity = await rows(client, "SELECT type,slug FROM entities WHERE id=?", [target.entityId]);
    if (entity.length !== 1 || String(entity[0]?.type) !== target.type || String(entity[0]?.slug) !== target.slug) throw new Error(`Phase 498 target identity mismatch: ${target.entityId}`);
    const media = await rows(client, "SELECT entity_id FROM media_assets WHERE id=?", [target.mediaId]);
    if (media.length !== 1 || String(media[0]?.entity_id) !== target.entityId) throw new Error(`Phase 498 target media mismatch: ${target.slug}`);
    const assetPath = path.resolve(workspaceRoot, "public", target.localPath.slice(1));
    if (!target.localPath.startsWith("/images/") || !fs.existsSync(assetPath)) throw new Error(`Phase 498 missing public asset: ${target.localPath}`);
    const collision = await rows(client, "SELECT ma.entity_id FROM media_assets ma WHERE ma.local_path=? AND ma.id<>? AND ma.review_status='approved' AND ma.usage_status='primary'", [target.localPath, target.mediaId]);
    if (collision.length > 0) throw new Error(`Phase 498 replacement path already assigned: ${target.localPath}`);
  }
  for (const [entityId, slug, mediaId, localPath] of PHASE498_MODEL_MEDIA_TARGETS) {
    const entity = await rows(client, "SELECT type,slug FROM entities WHERE id=?", [entityId]);
    if (entity.length !== 1 || String(entity[0]?.type) !== "pen" || String(entity[0]?.slug) !== slug) throw new Error(`Phase 498 model identity mismatch: ${entityId}`);
    const media = await rows(client, "SELECT entity_id,local_path FROM media_assets WHERE id=? AND entity_id=? AND review_status='approved' AND usage_status='primary'", [mediaId, entityId]);
    if (media.length !== 1 || String(media[0]?.local_path) !== localPath) throw new Error(`Phase 498 model media must remain canonical: ${slug}`);
    if (!fs.existsSync(path.resolve(workspaceRoot, "public", localPath.slice(1)))) throw new Error(`Phase 498 model asset is missing: ${localPath}`);
  }
}

async function ensureSource(transaction: Transaction, target: (typeof PHASE498_MEDIA_TARGETS)[number]): Promise<void> {
  await transaction.execute({
    sql: `INSERT OR IGNORE INTO source_items(
      id,source_id,title,url,item_type,license,author,retrieved_at,summary,
      raw_metadata_json,allowed_use,review_status,source_tier,independence_group,
      archive_url,archive_locator
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [target.sourceItemId, SOURCE_REGISTRY_ID, target.title, target.localPath, "image", "site-original", "Fountain Pen Graph editorial", RETRIEVED_AT, target.summary, JSON.stringify({ curatedSourceKey: `phase498-${target.slug}-media` }), "store_full", "approved", "primary", "fountain-pen-graph-editorial-phase498", target.localPath, `project-public-asset:${target.localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;phase=498`],
  });
  const item = await rows(transaction, "SELECT source_id,url,title FROM source_items WHERE id=?", [target.sourceItemId]);
  if (item.length !== 1 || String(item[0]?.source_id) !== SOURCE_REGISTRY_ID || String(item[0]?.url) !== target.localPath || String(item[0]?.title) !== target.title) throw new Error(`Phase 498 source item mismatch: ${target.sourceItemId}`);
}

async function updateMedia(client: Client): Promise<Set<string>> {
  const changed = new Set<string>();
  const transaction = await client.transaction("write");
  try {
    for (const target of PHASE498_MEDIA_TARGETS) {
      const current = await rows(transaction, "SELECT source_item_id,local_path,image_url,thumbnail_url,source_url,title,author,license,attribution_text,review_status,usage_status FROM media_assets WHERE id=? AND entity_id=?", [target.mediaId, target.entityId]);
      if (current.length !== 1) throw new Error(`Phase 498 media row missing: ${target.slug}`);
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

export async function applyPhase498FurtherBrandMedia(client: Client, options: ApplyPhase498Options): Promise<ApplyPhase498Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 498 reviewer must not be empty.");
  await assertAuthority(client, options);
  await assertIdentity(client, options.workspaceRoot);
  const changed = await updateMedia(client);
  const entities: ApplyPhase498Result["entities"] = [];
  for (const target of PHASE498_MEDIA_TARGETS) {
    const contentHash = await computePublicationContentHash(client, target.entityId);
    const publication = await rows(client, "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?", [target.entityId]);
    if (!changed.has(target.entityId) && String(publication[0]?.status) === "published" && String(publication[0]?.approved_content_hash) === contentHash) {
      entities.push({ entityId: target.entityId, slug: target.slug, outcome: "noop", contentHash });
      continue;
    }
    for (const reviewKind of ["fact", "language", "media"] as const) await recordEntityContentReview(client, { entityId: target.entityId, reviewKind, reviewer: options.reviewer, status: "approved", contentHash, notes: `Phase 498 separated the ${target.slug} brand/model primary factual SVG.` });
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase498-further-brand-media.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase498FurtherBrandMedia(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase498-further-brand-media", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: process.env });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
