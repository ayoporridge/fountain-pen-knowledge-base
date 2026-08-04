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
const OLD_PATH = "/images/library/site-original/phase348/maiora/impronte.svg";

export const PHASE503_MAIORA_MEDIA_TARGETS = [
  {
    entityId: "phase348-maiora-brand",
    type: "brand",
    slug: "maiora",
    mediaId: "curated-media-7bad12ce5a19213a6f26cbda",
    oldSourceItemId: "curated-source-item-aa4192895dd4d9f042a0b313",
    sourceItemId: "curated-source-item-phase503-maiora-brand",
    localPath: "/images/library/site-original/phase503/maiora/brand.svg",
    title: "Maiora 品牌与 Impronte 型号路线事实图（示意图，非产品照片）",
    summary:
      "本站原创 Maiora 品牌层 factual SVG；区分品牌语境与 Impronte standard、Impronte Oversize 型号路线，不表示真实比例、颜色、Logo、库存或价格。",
  },
  {
    entityId: "phase348-maiora-impronte",
    type: "pen",
    slug: "maiora-impronte",
    mediaId: "curated-media-253d3e91b609ff7910b1f787",
    oldSourceItemId: "curated-source-item-aa4192895dd4d9f042a0b313",
    sourceItemId: "curated-source-item-phase503-maiora-impronte",
    localPath: "/images/library/site-original/phase503/maiora/impronte.svg",
    title: "Maiora Impronte standard 事实图（示意图，非产品照片）",
    summary:
      "本站原创 Maiora Impronte standard factual SVG；表达树脂、三线帽螺纹、钢尖与 captured converter 资料边界，不表示真实比例、颜色、Logo、库存或价格。",
  },
  {
    entityId: "phase348-maiora-impronte-oversize",
    type: "pen",
    slug: "maiora-impronte-oversize",
    mediaId: "curated-media-8b30b38f11b255e0d1f09753",
    oldSourceItemId: "curated-source-item-aa4192895dd4d9f042a0b313",
    sourceItemId: "curated-source-item-phase503-maiora-impronte-oversize",
    localPath: "/images/library/site-original/phase503/maiora/impronte-oversize.svg",
    title: "Maiora Impronte Oversize 事实图（示意图，非产品照片）",
    summary:
      "本站原创 Maiora Impronte Oversize factual SVG；表达较宽桶身、凹面握位、钢尖与 captured converter 资料边界，不表示真实比例、颜色、Logo、库存或价格。",
  },
] as const;

export interface ApplyPhase503Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase503Result {
  changed: boolean;
  entities: Array<{
    entityId: string;
    slug: string;
    outcome: "published" | "noop";
    contentHash: string;
  }>;
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 503 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(
  client: Client | Transaction,
  sql: string,
  args: unknown[] = [],
) {
  return (
    await client.execute({ sql, args: args as never[] })
  ).rows.map((row) => ({ ...row }));
}

async function assertAuthority(
  client: Client,
  options: ApplyPhase503Options,
): Promise<void> {
  rejectRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(root).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !inside(database, root)
  ) {
    throw new Error("Phase 503 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 503 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 503 client is not bound to the owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 503 owned copy must be migrated through 032.");
  }
}

async function assertIdentity(
  client: Client,
  workspaceRoot: string,
): Promise<void> {
  const registry = await rows(
    client,
    "SELECT id FROM source_registry WHERE id=?",
    [SOURCE_REGISTRY_ID],
  );
  if (registry.length !== 1) {
    throw new Error("Phase 503 editorial source registry is missing.");
  }

  for (const target of PHASE503_MAIORA_MEDIA_TARGETS) {
    const entity = await rows(
      client,
      "SELECT type,slug FROM entities WHERE id=?",
      [target.entityId],
    );
    if (
      entity.length !== 1 ||
      String(entity[0]?.type) !== target.type ||
      String(entity[0]?.slug) !== target.slug
    ) {
      throw new Error(`Phase 503 Maiora identity mismatch: ${target.entityId}.`);
    }

    const media = await rows(
      client,
      "SELECT entity_id,local_path,source_item_id,review_status,usage_status FROM media_assets WHERE id=?",
      [target.mediaId],
    );
    const mediaPath = String(media[0]?.local_path);
    const mediaSourceItemId = String(media[0]?.source_item_id);
    if (
      media.length !== 1 ||
      String(media[0]?.entity_id) !== target.entityId ||
      (mediaPath !== OLD_PATH && mediaPath !== target.localPath) ||
      (mediaSourceItemId !== target.oldSourceItemId &&
        mediaSourceItemId !== target.sourceItemId) ||
      String(media[0]?.review_status) !== "approved" ||
      String(media[0]?.usage_status) !== "primary"
    ) {
      throw new Error(`Phase 503 Maiora media identity mismatch: ${target.slug}.`);
    }

    const asset = path.resolve(workspaceRoot, "public", target.localPath.slice(1));
    if (!fs.existsSync(asset)) {
      throw new Error(`Phase 503 missing public asset: ${target.localPath}`);
    }
    const conflicting = await rows(
      client,
      "SELECT entity_id FROM media_assets WHERE local_path=? AND id<>? AND review_status='approved' AND usage_status='primary'",
      [target.localPath, target.mediaId],
    );
    if (conflicting.length > 0) {
      throw new Error(`Phase 503 replacement path already assigned: ${target.localPath}`);
    }
  }
}

async function ensureSource(
  transaction: Transaction,
  target: (typeof PHASE503_MAIORA_MEDIA_TARGETS)[number],
): Promise<void> {
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
      JSON.stringify({ curatedSourceKey: `phase503-${target.slug}-media` }),
      "store_full",
      "approved",
      "primary",
      "fountain-pen-graph-editorial-phase503",
      target.localPath,
      `project-public-asset:${target.localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;phase=503`,
    ],
  });
  const item = await rows(
    transaction,
    "SELECT source_id,url,title,review_status FROM source_items WHERE id=?",
    [target.sourceItemId],
  );
  if (
    item.length !== 1 ||
    String(item[0]?.source_id) !== SOURCE_REGISTRY_ID ||
    String(item[0]?.url) !== target.localPath ||
    String(item[0]?.title) !== target.title ||
    String(item[0]?.review_status) !== "approved"
  ) {
    throw new Error(`Phase 503 source item mismatch: ${target.sourceItemId}.`);
  }
}

async function updateMedia(client: Client): Promise<Set<string>> {
  const changed = new Set<string>();
  const transaction = await client.transaction("write");
  try {
    for (const target of PHASE503_MAIORA_MEDIA_TARGETS) {
      const current = await rows(
        transaction,
        `SELECT source_item_id,local_path,image_url,thumbnail_url,source_url,title,
          author,license,attribution_text,review_status,usage_status
         FROM media_assets WHERE id=? AND entity_id=?`,
        [target.mediaId, target.entityId],
      );
      if (current.length !== 1) {
        throw new Error(`Phase 503 Maiora media row missing: ${target.slug}.`);
      }
      const row = current[0];
      const expected = [
        target.sourceItemId,
        target.localPath,
        target.localPath,
        target.localPath,
        target.localPath,
        target.title,
        "Fountain Pen Graph editorial",
        "site-original",
        target.summary,
        "approved",
        "primary",
      ].join("\0");
      const actual = [
        row?.source_item_id,
        row?.local_path,
        row?.image_url,
        row?.thumbnail_url,
        row?.source_url,
        row?.title,
        row?.author,
        row?.license,
        row?.attribution_text,
        row?.review_status,
        row?.usage_status,
      ].map(String).join("\0");
      await ensureSource(transaction, target);
      if (actual !== expected) changed.add(target.entityId);
      await transaction.execute({
        sql: `UPDATE media_assets SET title=?,image_url=?,thumbnail_url=?,local_path=?,
          source_url=?,source_item_id=?,author=?,license=?,attribution_text=?,
          review_status='approved',usage_status='primary',updated_at=datetime('now')
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
      await transaction.execute({
        sql: "UPDATE entity_references SET source_item_id=?,review_status='approved' WHERE entity_id=? AND source_item_id=?",
        args: [target.sourceItemId, target.entityId, target.oldSourceItemId],
      });
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
  return changed;
}

export async function applyPhase503MaioraMediaSeparation(
  client: Client,
  options: ApplyPhase503Options,
): Promise<ApplyPhase503Result> {
  if (!options.reviewer.trim()) {
    throw new Error("Phase 503 reviewer must not be empty.");
  }
  await assertAuthority(client, options);
  await assertIdentity(client, options.workspaceRoot);
  const changed = await updateMedia(client);
  const entities: ApplyPhase503Result["entities"] = [];
  for (const target of PHASE503_MAIORA_MEDIA_TARGETS) {
    const contentHash = await computePublicationContentHash(client, target.entityId);
    const publication = await rows(
      client,
      "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
      [target.entityId],
    );
    if (
      !changed.has(target.entityId) &&
      String(publication[0]?.status) === "published" &&
      String(publication[0]?.approved_content_hash) === contentHash
    ) {
      entities.push({
        entityId: target.entityId,
        slug: target.slug,
        outcome: "noop",
        contentHash,
      });
      continue;
    }
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId: target.entityId,
        reviewKind,
        reviewer: options.reviewer,
        status: "approved",
        contentHash,
        notes: `Phase 503 separated the ${target.slug} Maiora primary factual SVG.`,
      });
    }
    const published = await publishEntity(client, {
      entityId: target.entityId,
      reviewer: options.reviewer,
      contentHash,
    });
    entities.push({
      entityId: target.entityId,
      slug: target.slug,
      outcome: "published",
      contentHash: published.contentHash,
    });
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
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error(
      "Usage: tsx scripts/apply-phase503-maiora-media-separation.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase503MaioraMediaSeparation(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase503-maiora-media-separation",
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
