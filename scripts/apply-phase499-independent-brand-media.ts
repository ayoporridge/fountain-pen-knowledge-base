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

export const PHASE499_MEDIA_TARGETS = [
  {
    entityId: "phase275-brand-ensso",
    type: "brand",
    slug: "ensso",
    mediaId: "curated-media-1bab11595e8ce3207c4f6d8e",
    oldSourceItemId: "curated-source-item-7cbeff91d4d340e2b4aeb954",
    sourceItemId: "curated-source-item-phase499-ensso-brand",
    localPath: "/images/library/site-original/phase499/ensso/brand.svg",
    title: "Ensso 品牌与 Piuma 路线边界事实图（示意图，非产品照片）",
    summary: "本站原创 Ensso 品牌层事实图；区分 Piuma、XS、Piuma Pocket 与 BOLT 的 CNC 材料、尖座和机构边界，不把全尺寸样本规格扩展到其它路线。",
  },
  {
    entityId: "phase276-brand-fpr",
    type: "brand",
    slug: "fountain-pen-revolution",
    mediaId: "curated-media-f7b32c8a21cd143d4d4fc843",
    oldSourceItemId: "curated-source-item-523f39c588dfe3e9713f2ad8",
    sourceItemId: "curated-source-item-phase499-fpr-brand",
    localPath: "/images/library/site-original/phase499/fpr/brand.svg",
    title: "Fountain Pen Revolution 品牌与 flex 配置边界事实图（示意图，非产品照片）",
    summary: "本站原创 FPR 品牌层事实图；以 Himalaya V2-GT 为入口，区分笔身、feed、converter 与普通／flex／Ultra Flex 尖的订单配置。",
  },
  {
    entityId: "phase290-brand-schon-dsgn",
    type: "brand",
    slug: "schon-dsgn",
    mediaId: "curated-media-2b37d931b7307f4f0998c6fb",
    oldSourceItemId: "curated-source-item-b2b54642f4effceba3f3f578",
    sourceItemId: "curated-source-item-phase499-schon-dsgn-brand",
    localPath: "/images/library/site-original/phase499/schon-dsgn/brand.svg",
    title: "Schon DSGN Pocket Six 材料与口袋结构事实图（示意图，非产品照片）",
    summary: "本站原创 Schon DSGN 品牌层事实图；区分 Pocket Six 与其它书写工具，保留短杆、后插、#6 和短国际 C/C 的型号边界。",
  },
  {
    entityId: "phase345-kilk-brand",
    type: "brand",
    slug: "kilk",
    mediaId: "curated-media-c960e62f53933d8658aef444",
    oldSourceItemId: "curated-source-item-c92d3e7f4c5ef2e6a183c028",
    sourceItemId: "curated-source-item-phase499-kilk-brand",
    localPath: "/images/library/site-original/phase499/kilk/brand.svg",
    title: "Kilk 品牌与 Orient 路线边界事实图（示意图，非产品照片）",
    summary: "本站原创 Kilk 品牌层事实图；区分伊斯坦布尔工作坊语境、Orient 与兄弟／限量／定制路线，具体树脂、银饰件、尖和供墨按型号核验。",
  },
  {
    entityId: "phase347-tibaldi-brand",
    type: "brand",
    slug: "tibaldi",
    mediaId: "curated-media-59e06769c141d786c97cabb7",
    oldSourceItemId: "curated-source-item-ec7dcb61303dae7b138a4312",
    sourceItemId: "curated-source-item-phase499-tibaldi-brand",
    localPath: "/images/library/site-original/phase499/tibaldi/brand.svg",
    title: "Tibaldi 历史与 Bononia 复兴路线事实图（示意图，非产品照片）",
    summary: "本站原创 Tibaldi 品牌层事实图；区分 1916 佛罗伦萨起点、历史型号与当代 Bononia／N.60 路线，不把复兴款规格回填到旧笔。",
  },
] as const;

export const PHASE499_MODEL_MEDIA_TARGETS = [
  ["phase275-ensso-piuma", "ensso-piuma", "curated-media-5e59db3a4be3fedfa163ede2", "/images/library/site-original/phase275/ensso/piuma.svg"],
  ["phase276-fpr-himalaya-v2", "fpr-himalaya-v2", "curated-media-c27f96b15f23da1ab33c9544", "/images/library/site-original/phase276/fpr/himalaya-v2.svg"],
  ["phase290-pen-schon-dsgn-pocket-six", "schon-dsgn-pocket-six", "curated-media-91617d53a965e19fba4fb5ab", "/images/library/site-original/phase290/schon-dsgn/pocket-six.svg"],
  ["phase345-kilk-orient", "kilk-orient", "curated-media-708974a2636ee80843f2a08a", "/images/library/site-original/phase345/kilk/orient.svg"],
  ["phase347-tibaldi-bononia", "tibaldi-bononia", "curated-media-aa8c7dcdf6021d09494432b6", "/images/library/site-original/phase347/tibaldi/bononia.svg"],
] as const;

export interface ApplyPhase499Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase499Result {
  changed: boolean;
  entities: Array<{ entityId: string; slug: string; outcome: "published" | "noop"; contentHash: string }>;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 499 refuses inherited remote database selection: ${key}.`);
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase499Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, root)) throw new Error("Phase 499 requires an owned, non-symlink catalog copy.");
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)) throw new Error("Phase 499 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 499 client is not bound to the owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 499 owned copy must be migrated through 032.");
}

async function assertIdentity(client: Client, workspaceRoot: string): Promise<void> {
  if ((await rows(client, "SELECT id FROM source_registry WHERE id=?", [SOURCE_REGISTRY_ID])).length !== 1) throw new Error("Phase 499 editorial source registry missing.");
  for (const target of PHASE499_MEDIA_TARGETS) {
    const entity = await rows(client, "SELECT type,slug FROM entities WHERE id=?", [target.entityId]);
    if (entity.length !== 1 || String(entity[0]?.type) !== target.type || String(entity[0]?.slug) !== target.slug) throw new Error(`Phase 499 target identity mismatch: ${target.entityId}`);
    const media = await rows(client, "SELECT entity_id FROM media_assets WHERE id=?", [target.mediaId]);
    if (media.length !== 1 || String(media[0]?.entity_id) !== target.entityId) throw new Error(`Phase 499 target media mismatch: ${target.slug}`);
    const assetPath = path.resolve(workspaceRoot, "public", target.localPath.slice(1));
    if (!target.localPath.startsWith("/images/") || !fs.existsSync(assetPath)) throw new Error(`Phase 499 missing public asset: ${target.localPath}`);
    const collision = await rows(client, "SELECT ma.entity_id FROM media_assets ma WHERE ma.local_path=? AND ma.id<>? AND ma.review_status='approved' AND ma.usage_status='primary'", [target.localPath, target.mediaId]);
    if (collision.length > 0) throw new Error(`Phase 499 replacement path already assigned: ${target.localPath}`);
  }
  for (const [entityId, slug, mediaId, localPath] of PHASE499_MODEL_MEDIA_TARGETS) {
    const entity = await rows(client, "SELECT type,slug FROM entities WHERE id=?", [entityId]);
    if (entity.length !== 1 || String(entity[0]?.type) !== "pen" || String(entity[0]?.slug) !== slug) throw new Error(`Phase 499 model identity mismatch: ${entityId}`);
    const media = await rows(client, "SELECT entity_id,local_path FROM media_assets WHERE id=? AND entity_id=? AND review_status='approved' AND usage_status='primary'", [mediaId, entityId]);
    if (media.length !== 1 || String(media[0]?.local_path) !== localPath) throw new Error(`Phase 499 model media must remain canonical: ${slug}`);
    if (!fs.existsSync(path.resolve(workspaceRoot, "public", localPath.slice(1)))) throw new Error(`Phase 499 model asset is missing: ${localPath}`);
  }
}

async function ensureSource(transaction: Transaction, target: (typeof PHASE499_MEDIA_TARGETS)[number]): Promise<void> {
  await transaction.execute({
    sql: `INSERT OR IGNORE INTO source_items(
      id,source_id,title,url,item_type,license,author,retrieved_at,summary,
      raw_metadata_json,allowed_use,review_status,source_tier,independence_group,
      archive_url,archive_locator
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [target.sourceItemId, SOURCE_REGISTRY_ID, target.title, target.localPath, "image", "site-original", "Fountain Pen Graph editorial", RETRIEVED_AT, target.summary, JSON.stringify({ curatedSourceKey: `phase499-${target.slug}-media` }), "store_full", "approved", "primary", "fountain-pen-graph-editorial-phase499", target.localPath, `project-public-asset:${target.localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;phase=499`],
  });
  const item = await rows(transaction, "SELECT source_id,url,title FROM source_items WHERE id=?", [target.sourceItemId]);
  if (item.length !== 1 || String(item[0]?.source_id) !== SOURCE_REGISTRY_ID || String(item[0]?.url) !== target.localPath || String(item[0]?.title) !== target.title) throw new Error(`Phase 499 source item mismatch: ${target.sourceItemId}`);
}

async function updateMedia(client: Client): Promise<Set<string>> {
  const changed = new Set<string>();
  const transaction = await client.transaction("write");
  try {
    for (const target of PHASE499_MEDIA_TARGETS) {
      const current = await rows(transaction, "SELECT source_item_id,local_path,image_url,thumbnail_url,source_url,title,author,license,attribution_text,review_status,usage_status FROM media_assets WHERE id=? AND entity_id=?", [target.mediaId, target.entityId]);
      if (current.length !== 1) throw new Error(`Phase 499 media row missing: ${target.slug}`);
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

export async function applyPhase499IndependentBrandMedia(client: Client, options: ApplyPhase499Options): Promise<ApplyPhase499Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 499 reviewer must not be empty.");
  await assertAuthority(client, options);
  await assertIdentity(client, options.workspaceRoot);
  const changed = await updateMedia(client);
  const entities: ApplyPhase499Result["entities"] = [];
  for (const target of PHASE499_MEDIA_TARGETS) {
    const contentHash = await computePublicationContentHash(client, target.entityId);
    const publication = await rows(client, "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?", [target.entityId]);
    if (!changed.has(target.entityId) && String(publication[0]?.status) === "published" && String(publication[0]?.approved_content_hash) === contentHash) {
      entities.push({ entityId: target.entityId, slug: target.slug, outcome: "noop", contentHash });
      continue;
    }
    for (const reviewKind of ["fact", "language", "media"] as const) await recordEntityContentReview(client, { entityId: target.entityId, reviewKind, reviewer: options.reviewer, status: "approved", contentHash, notes: `Phase 499 separated the ${target.slug} brand/model primary factual SVG.` });
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase499-independent-brand-media.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase499IndependentBrandMedia(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase499-independent-brand-media", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: process.env });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
