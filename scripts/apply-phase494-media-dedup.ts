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

export const PHASE494_MEDIA_TARGETS = [
  {
    entityId: "b6DYMF38zz1B",
    type: "brand",
    slug: "esterbrook",
    mediaId: "curated-media-3b48706ce3be6c9c297321bc",
    sourceItemId: "curated-source-item-phase494-esterbrook-brand",
    localPath: "/images/library/site-original/esterbrook-estie/esterbrook-brand.svg",
    title: "Esterbrook 当代型号导航事实图（示意图，非产品照片）",
    summary: "本站原创 Esterbrook 型号家族导航图；只用于品牌层的系列边界，不代表某一支实物或具体颜色。",
  },
  {
    entityId: "eOfD77nOeENN",
    type: "brand",
    slug: "wancher",
    mediaId: "curated-media-7afab0739b73241b6e7274fe",
    sourceItemId: "curated-source-item-phase494-wancher-brand",
    localPath: "/images/library/site-original/wancher/wancher-brand-family.svg",
    title: "Wancher 品牌与系列边界事实图（示意图，非产品照片）",
    summary: "本站原创 Wancher 品牌层事实图；把硬橡胶、漆艺／螺钿与金属路线分开，不能替代具体 SKU 的规格页。",
  },
  {
    entityId: "hbOcg60TD2lr",
    type: "pen",
    slug: "sheaffer-connaisseur",
    mediaId: "curated-media-0eabdee5505d8f27d4885f89",
    sourceItemId: "curated-source-item-phase494-sheaffer-connaisseur",
    localPath: "/images/library/site-original/phase309/sheaffer/connaisseur.svg",
    title: "Sheaffer Connaisseur 独立事实图（示意图，非产品照片）",
    summary: "本站原创 Connaisseur 独立 factual SVG；只概括该历史系列的身份边界，非产品照片。",
  },
  {
    entityId: "phase106-sheaffer-imperial",
    type: "pen",
    slug: "sheaffer-imperial",
    mediaId: "curated-media-5a7d7bfbe0eaa88db5ac5f30",
    sourceItemId: "curated-source-item-phase494-sheaffer-imperial",
    localPath: "/images/library/site-original/phase309/sheaffer/imperial.svg",
    title: "Sheaffer Imperial 独立事实图（示意图，非产品照片）",
    summary: "本站原创 Imperial 独立 factual SVG；只概括该历史家族的子型边界，非产品照片。",
  },
  {
    entityId: "phase106-sheaffer-icon",
    type: "pen",
    slug: "sheaffer-icon",
    mediaId: "curated-media-5ce5daf804720d11b640985c",
    sourceItemId: "curated-source-item-phase494-sheaffer-icon",
    localPath: "/images/library/site-original/phase309/sheaffer/icon-9108.svg",
    title: "Sheaffer ICON 9108 独立事实图（示意图，非产品照片）",
    summary: "本站原创 ICON 9108 独立 factual SVG；只概括当前 SKU 的证据范围，非产品照片。",
  },
  {
    entityId: "I6tjleAZx9RU",
    type: "brand",
    slug: "opus88",
    mediaId: "curated-media-162ccc5a7887c1fc8ac71cc3",
    sourceItemId: "curated-source-item-phase494-opus88-brand",
    localPath: "/images/library/site-original/opus88-leonardo/opus88-brand.svg",
    title: "Opus 88 品牌与型号导航事实图（示意图，非产品照片）",
    summary: "本站原创 Opus 88 系列导航图；只概括型号与供墨结构的阅读边界，不表示某一支笔的比例或颜色。",
  },
] as const;

export interface ApplyPhase494Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase494Result {
  changed: boolean;
  entities: Array<{
    entityId: string;
    slug: string;
    outcome: "published" | "noop";
    contentHash: string;
  }>;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 494 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertOwnedCatalog(client: Client, options: ApplyPhase494Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile()) {
    throw new Error("Phase 494 requires an owned, regular catalog copy.");
  }
  if (fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 494 database must be a non-symlink inside the owned root.");
  }
  const ownedStat = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (ownedStat.dev === protectedStat.dev && ownedStat.ino === protectedStat.ino)) {
    throw new Error("Phase 494 refuses the protected catalog and hard-link aliases.");
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 494 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 494 owned copy must be migrated through 032 before apply.");
  }
}

async function assertTargetIdentity(client: Client, workspaceRoot: string): Promise<void> {
  const registry = await rows(client, "SELECT id FROM source_registry WHERE id=?", [SOURCE_REGISTRY_ID]);
  if (registry.length !== 1) throw new Error(`Phase 494 source registry missing: ${SOURCE_REGISTRY_ID}`);
  for (const target of PHASE494_MEDIA_TARGETS) {
    const entity = await rows(client, "SELECT id,type,slug FROM entities WHERE id=?", [target.entityId]);
    if (entity.length !== 1 || String(entity[0]?.type) !== target.type || String(entity[0]?.slug) !== target.slug) {
      throw new Error(`Phase 494 target identity mismatch: ${target.entityId}`);
    }
    const media = await rows(client, "SELECT id,entity_id FROM media_assets WHERE id=?", [target.mediaId]);
    if (media.length !== 1 || String(media[0]?.entity_id) !== target.entityId) {
      throw new Error(`Phase 494 target media mismatch: ${target.slug}`);
    }
    if (!target.localPath.startsWith("/images/")) throw new Error(`Phase 494 media path is not public: ${target.localPath}`);
    const assetPath = path.resolve(workspaceRoot, "public", target.localPath.slice(1));
    if (!fs.existsSync(assetPath) || !fs.statSync(assetPath).isFile()) {
      throw new Error(`Phase 494 media asset is missing: ${assetPath}`);
    }
    const collision = await rows(
      client,
      `SELECT ma.entity_id, e.slug
       FROM media_assets ma JOIN entities e ON e.id=ma.entity_id
       WHERE ma.local_path=? AND ma.id<>? AND ma.review_status='approved' AND ma.usage_status='primary'`,
      [target.localPath, target.mediaId],
    );
    if (collision.length > 0) {
      throw new Error(`Phase 494 replacement path is already assigned: ${target.localPath}`);
    }
  }
}

async function ensureSourceItem(transaction: Transaction, target: (typeof PHASE494_MEDIA_TARGETS)[number]): Promise<void> {
  await transaction.execute({
    sql: `INSERT OR IGNORE INTO source_items(
      id,source_id,title,url,item_type,license,author,retrieved_at,
      summary,raw_metadata_json,allowed_use,review_status,source_tier,
      independence_group,archive_url,archive_locator
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
      JSON.stringify({ curatedSourceKey: `phase494-${target.slug}-media` }),
      "store_full",
      "approved",
      "primary",
      "fountain-pen-graph-editorial-phase494",
      target.localPath,
      `project-public-asset:${target.localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;phase=494`,
    ],
  });
  const source = await rows(transaction, "SELECT source_id,url,title FROM source_items WHERE id=?", [target.sourceItemId]);
  if (source.length !== 1 || String(source[0]?.source_id) !== SOURCE_REGISTRY_ID || String(source[0]?.url) !== target.localPath || String(source[0]?.title) !== target.title) {
    throw new Error(`Phase 494 source item identity mismatch: ${target.sourceItemId}`);
  }
}

async function updateMedia(client: Client): Promise<Set<string>> {
  const changed = new Set<string>();
  const transaction = await client.transaction("write");
  try {
    for (const target of PHASE494_MEDIA_TARGETS) {
      const current = await rows(
        transaction,
        "SELECT source_item_id,local_path,image_url,thumbnail_url,source_url,title,author,license,attribution_text,review_status,usage_status FROM media_assets WHERE id=? AND entity_id=?",
        [target.mediaId, target.entityId],
      );
      if (current.length !== 1) throw new Error(`Phase 494 media row missing: ${target.slug}`);
      const row = current[0];
      const alreadyCurrent =
        String(row?.source_item_id ?? "") === target.sourceItemId &&
        String(row?.local_path ?? "") === target.localPath &&
        String(row?.image_url ?? "") === target.localPath &&
        String(row?.thumbnail_url ?? "") === target.localPath &&
        String(row?.source_url ?? "") === target.localPath &&
        String(row?.title ?? "") === target.title &&
        String(row?.author ?? "") === "Fountain Pen Graph editorial" &&
        String(row?.license ?? "") === "site-original" &&
        String(row?.attribution_text ?? "") === target.summary &&
        String(row?.review_status ?? "") === "approved" &&
        String(row?.usage_status ?? "") === "primary";
      await ensureSourceItem(transaction, target);
      if (!alreadyCurrent) changed.add(target.entityId);
      const oldSourceItem = String(row?.source_item_id ?? "");
      await transaction.execute({
        sql: `UPDATE media_assets
              SET title=?,image_url=?,thumbnail_url=?,local_path=?,source_url=?,source_item_id=?,
                  author=?,license=?,attribution_text=?,review_status='approved',usage_status='primary',updated_at=datetime('now')
              WHERE id=? AND entity_id=?`,
        args: [
          target.title,
          target.localPath,
          target.localPath,
          target.localPath,
          target.localPath,
          target.sourceItemId,
          "Fountain Pen Graph editorial",
          "site-original",
          target.summary,
          target.mediaId,
          target.entityId,
        ],
      });
      if (oldSourceItem && oldSourceItem !== target.sourceItemId) {
        await transaction.execute({
          sql: "UPDATE entity_references SET source_item_id=?,review_status='approved' WHERE entity_id=? AND source_item_id=?",
          args: [target.sourceItemId, target.entityId, oldSourceItem],
        });
      }
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
  return changed;
}

async function currentPublished(client: Client, entityId: string): Promise<{ status: string; hash: string }> {
  const publication = await rows(client, "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?", [entityId]);
  if (publication.length !== 1) throw new Error(`Phase 494 publication row missing: ${entityId}`);
  return { status: String(publication[0]?.status ?? ""), hash: String(publication[0]?.approved_content_hash ?? "") };
}

export async function applyPhase494MediaDedup(client: Client, options: ApplyPhase494Options): Promise<ApplyPhase494Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 494 reviewer must not be empty.");
  await assertOwnedCatalog(client, options);
  await assertTargetIdentity(client, options.workspaceRoot);
  const changedTargets = await updateMedia(client);
  const entities: ApplyPhase494Result["entities"] = [];
  for (const target of PHASE494_MEDIA_TARGETS) {
    const contentHash = await computePublicationContentHash(client, target.entityId);
    const current = await currentPublished(client, target.entityId);
    if (!changedTargets.has(target.entityId) && current.status === "published" && current.hash === contentHash) {
      entities.push({ entityId: target.entityId, slug: target.slug, outcome: "noop", contentHash });
      continue;
    }
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId: target.entityId,
        reviewKind,
        reviewer: options.reviewer,
        status: "approved",
        contentHash,
        notes: `Phase 494 separated the ${target.slug} primary factual SVG from a shared brand/model image path.`,
      });
    }
    const published = await publishEntity(client, {
      entityId: target.entityId,
      reviewer: options.reviewer,
      contentHash,
    });
    entities.push({ entityId: target.entityId, slug: target.slug, outcome: "published", contentHash: published.contentHash });
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { changed: changedTargets.size > 0, entities };
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const databasePath = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalogPath = cliValue("--protected-catalog");
  if (!databasePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error("Usage: tsx scripts/apply-phase494-media-dedup.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  }
  const resolvedDatabase = path.resolve(databasePath);
  const resolvedProtected = path.resolve(protectedCatalogPath);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase494MediaDedup(client, {
      workspaceRoot: process.cwd(),
      reviewer: cliValue("--reviewer") ?? "phase494-media-dedup",
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: process.env,
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
