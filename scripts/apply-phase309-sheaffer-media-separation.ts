import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { computePublicationContentHash, publishEntity, recordEntityContentReview } from "../src/lib/publication";

export const PHASE309_SHEAFFER_ID = "tVXnzDSFCcPP";

export const PHASE309_TARGETS = [
  {
    entityId: "hbOcg60TD2lr",
    slug: "sheaffer-connaisseur",
    name: "Sheaffer Connaisseur",
    mediaId: "curated-media-0eabdee5505d8f27d4885f89",
    title: "Sheaffer Connaisseur 独立事实图（示意图，非产品照片）",
    sourceItemId: "curated-source-item-phase309-sheaffer-connaisseur-svg",
    localPath: "/images/library/site-original/phase309/sheaffer/connaisseur.svg",
    summary: "本站原创 Connaisseur 独立 factual SVG；只概括该历史系列的身份边界，非产品照片。",
  },
  {
    entityId: "phase106-sheaffer-imperial",
    slug: "sheaffer-imperial",
    name: "Sheaffer Imperial",
    mediaId: "curated-media-5a7d7bfbe0eaa88db5ac5f30",
    title: "Sheaffer Imperial 独立事实图（示意图，非产品照片）",
    sourceItemId: "curated-source-item-phase309-sheaffer-imperial-svg",
    localPath: "/images/library/site-original/phase309/sheaffer/imperial.svg",
    summary: "本站原创 Imperial 独立 factual SVG；只概括该历史家族的子型边界，非产品照片。",
  },
  {
    entityId: "phase106-sheaffer-icon",
    slug: "sheaffer-icon",
    name: "Sheaffer Icon",
    mediaId: "curated-media-5ce5daf804720d11b640985c",
    title: "Sheaffer ICON 9108 独立事实图（示意图，非产品照片）",
    sourceItemId: "curated-source-item-phase309-sheaffer-icon-9108-svg",
    localPath: "/images/library/site-original/phase309/sheaffer/icon-9108.svg",
    summary: "本站原创 ICON 9108 独立 factual SVG；只概括当前 SKU 的证据范围，非产品照片。",
  },
] as const;

export type ApplyPhase309Options = {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: ReturnType<typeof snapshotCatalogFiles>;
  env?: NodeJS.ProcessEnv;
};

export type ApplyPhase309Result = {
  changed: boolean;
  outcomes: Array<{ entityId: string; slug: string; outcome: "published" | "noop" }>;
};

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(options: ApplyPhase309Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) {
      throw new Error(`Phase 309 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function authority(client: Client, options: ApplyPhase309Options): Promise<void> {
  assertNoRemote(options);
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
    throw new Error("Phase 309 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) {
    throw new Error("Phase 309 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 309 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 309 owned copy must be migrated through 032.");
  }
}

async function assertIdentity(client: Client): Promise<void> {
  const brand = await rows(client, "SELECT id,type,slug FROM entities WHERE id=?", [PHASE309_SHEAFFER_ID]);
  if (brand.length !== 1 || brand[0]?.type !== "brand" || brand[0]?.slug !== "sheaffer") {
    throw new Error(`Phase 309 Sheaffer brand identity mismatch: ${JSON.stringify(brand)}`);
  }
  for (const target of PHASE309_TARGETS) {
    const entity = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=?", [target.entityId]);
    if (
      entity.length !== 1 ||
      entity[0]?.type !== "pen" ||
      entity[0]?.slug !== target.slug ||
      entity[0]?.name !== target.name
    ) {
      throw new Error(`Phase 309 target identity mismatch: ${JSON.stringify(entity)}`);
    }
    const media = await rows(client, "SELECT id,entity_id FROM media_assets WHERE id=?", [target.mediaId]);
    if (media.length !== 1 || media[0]?.entity_id !== target.entityId) {
      throw new Error(`Phase 309 target media mismatch: ${target.slug}`);
    }
  }
}

async function updateMedia(client: Client): Promise<boolean> {
  const tx = await client.transaction("write");
  let changed = false;
  try {
    for (const target of PHASE309_TARGETS) {
      const current = await rows(
        tx,
        "SELECT source_item_id,local_path,image_url,source_url,title FROM media_assets WHERE id=? AND entity_id=?",
        [target.mediaId, target.entityId],
      );
      if (current.length !== 1) throw new Error(`Phase 309 media row missing: ${target.slug}`);
      const oldSourceItem = String(current[0]?.source_item_id ?? "");
      if (
        oldSourceItem !== target.sourceItemId ||
        String(current[0]?.local_path) !== target.localPath ||
        String(current[0]?.image_url) !== target.localPath ||
        String(current[0]?.source_url) !== target.localPath ||
        String(current[0]?.title) !== target.title
      ) {
        changed = true;
      }

      await tx.execute({
        sql: `
          INSERT OR IGNORE INTO source_items(
            id,source_id,title,url,item_type,license,author,retrieved_at,
            summary,raw_metadata_json,allowed_use,review_status,source_tier,
            independence_group,archive_url,archive_locator
          ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `,
        args: [
          target.sourceItemId,
          "curated-source-registry-80bcb53d7086a809d0fdb6cf",
          target.title,
          target.localPath,
          "image",
          "site-original",
          "Fountain Pen Graph editorial",
          "2026-07-28",
          target.summary,
          JSON.stringify({ curatedSourceKey: `phase309-sheaffer-${target.slug}-svg` }),
          "store_full",
          "approved",
          "primary",
          "fountain-pen-graph-editorial-phase309",
          target.localPath,
          `project-public-asset:${target.localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;sku-replica=false;phase=309`,
        ],
      });
      await tx.execute({
        sql: `
          UPDATE media_assets
          SET title=?,image_url=?,thumbnail_url=?,local_path=?,source_url=?,source_item_id=?,
              author=?,license=?,attribution_text=?,review_status='approved',usage_status='primary',
              updated_at=datetime('now')
          WHERE id=? AND entity_id=?
        `,
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
      await tx.execute({
        sql: "UPDATE entity_references SET source_item_id=?,review_status='approved' WHERE entity_id=? AND source_item_id=?",
        args: [target.sourceItemId, target.entityId, oldSourceItem],
      });
    }
    await tx.commit();
    return changed;
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

async function refreshPublication(client: Client, target: (typeof PHASE309_TARGETS)[number], reviewer: string, changed: boolean): Promise<"published" | "noop"> {
  const hash = await computePublicationContentHash(client, target.entityId);
  const current = await rows(client, "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?", [target.entityId]);
  if (!changed && current.length === 1 && current[0]?.status === "published" && current[0]?.approved_content_hash === hash) return "noop";
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: target.entityId,
      reviewKind,
      reviewer,
      status: "approved",
      contentHash: hash,
      notes: `Phase 309 separated the ${target.slug} factual SVG from the shared Sheaffer triptych.`,
    });
  }
  await publishEntity(client, { entityId: target.entityId, reviewer, contentHash: hash });
  return "published";
}

export async function applyPhase309SheafferMediaSeparation(
  client: Client,
  options: ApplyPhase309Options,
): Promise<ApplyPhase309Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 309 reviewer must not be empty.");
  await authority(client, options);
  await assertIdentity(client);
  const changed = await updateMedia(client);
  const outcomes = [];
  for (const target of PHASE309_TARGETS) {
    outcomes.push({
      entityId: target.entityId,
      slug: target.slug,
      outcome: await refreshPublication(client, target, options.reviewer, changed),
    });
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { changed, outcomes };
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
      "Usage: tsx scripts/apply-phase309-sheaffer-media-separation.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase309SheafferMediaSeparation(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase309-sheaffer-media-separation",
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
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
