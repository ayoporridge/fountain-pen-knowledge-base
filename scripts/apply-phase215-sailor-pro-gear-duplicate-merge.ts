import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import type { ApplyPhase22Options, ApplyPhase22Result } from "./apply-phase22-content";

export type ApplyPhase215Options = ApplyPhase22Options;
export type ApplyPhase215Result = ApplyPhase22Result;

const OLD_ID = "ouSQi7nqLzH5";
const OLD_SLUG = "写乐-sailor-21k-pro-gear-大鱼雷";
const CANONICAL_ID = "uY3QLMSxlCoo";
const CANONICAL_SLUG = "sailor-pro-gear";
const BRAND_ID = "ce2dcqixqSCx";
const SOURCE_KEY = "phase215-sailor-pro-gear-duplicate-merge";

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableId(prefix: string, value: string): string {
  return `${prefix}-${digest(value).slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function noRemote(options: ApplyPhase215Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) {
      throw new Error(`Phase 215 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function authority(client: Client, options: ApplyPhase215Options): Promise<void> {
  noRemote(options);
  if (!options.reviewer.trim()) throw new Error("Phase 215 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(root).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !isInside(database, root)
  ) {
    throw new Error("Phase 215 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    Number(owned.nlink) !== 1 ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 215 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 215 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 215 owned copy must be migrated through 032.");
}

async function identity(client: Client): Promise<void> {
  const rows = await client.execute({
    sql: "SELECT id,type,slug,source FROM entities WHERE id IN (?,?,?) ORDER BY id",
    args: [OLD_ID, CANONICAL_ID, BRAND_ID],
  });
  if (rows.rows.length !== 3) throw new Error("Phase 215 Sailor identities are incomplete.");
  const byId = new Map(rows.rows.map((row) => [String(row.id), row]));
  const old = byId.get(OLD_ID);
  const canonical = byId.get(CANONICAL_ID);
  const brand = byId.get(BRAND_ID);
  if (old?.type !== "pen" || old?.slug !== OLD_SLUG) throw new Error("Phase 215 old Sailor raw identity mismatch.");
  if (
    canonical?.type !== "pen" ||
    canonical?.slug !== CANONICAL_SLUG ||
    !String(canonical.source ?? "").startsWith("curated-content:phase76-sailor-professional-gear-regular-21k-v1:")
  ) throw new Error("Phase 215 Sailor canonical identity mismatch.");
  if (brand?.type !== "brand" || brand?.slug !== "sailor") throw new Error("Phase 215 Sailor brand identity mismatch.");
}

async function alreadyApplied(client: Client): Promise<boolean> {
  const publication = await client.execute({
    sql: "SELECT status,blockers_json FROM entity_publications WHERE entity_id=?",
    args: [OLD_ID],
  });
  const oldPublication = publication.rows[0];
  const blockers = JSON.parse(String(oldPublication?.blockers_json ?? "[]")) as unknown;
  const redirect = await client.execute({
    sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
    args: [`/pen/${OLD_SLUG}`],
  });
  const lineage = await client.execute({
    sql: "SELECT target_entity_id,lineage_kind FROM entity_lineage WHERE source_entity_id=?",
    args: [OLD_ID],
  });
  const aliases = await client.execute({
    sql: "SELECT alias FROM entity_aliases WHERE entity_id=? AND alias IN (?,?)",
    args: [CANONICAL_ID, "Sailor 21K Pro Gear", "写乐 21K Pro Gear / 大鱼雷"],
  });
  const canonicalPublication = await client.execute({
    sql: "SELECT publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entity_publications publication LEFT JOIN public_entities public ON public.id=publication.entity_id WHERE publication.entity_id=?",
    args: [CANONICAL_ID],
  });
  return (
    oldPublication?.status === "retired" &&
    Array.isArray(blockers) && blockers.includes("taxonomy_merged") &&
    redirect.rows.length === 1 &&
    String(redirect.rows[0]?.target_path) === `/pen/${CANONICAL_SLUG}` &&
    String(redirect.rows[0]?.redirect_kind) === "permanent" &&
    lineage.rows.some(
      (row) =>
        String(row?.target_entity_id) === CANONICAL_ID &&
        String(row?.lineage_kind) === "merge",
    ) &&
    aliases.rows.length >= 2 &&
    canonicalPublication.rows[0]?.status === "published" &&
    Number(canonicalPublication.rows[0]?.is_public) === 1
  );
}

async function merge(client: Client): Promise<void> {
  if (await alreadyApplied(client)) return;
  const sourcePath = `/pen/${OLD_SLUG}`;
  const targetPath = `/pen/${CANONICAL_SLUG}`;
  const batchKey = `${SOURCE_KEY}-v1`;
  const batchId = stableId("phase215-batch", batchKey);
  const actionId = stableId("phase215-action", batchKey);
  const note = "Merge the unpublishable Sailor 21K Pro Gear／大鱼雷 placeholder into the canonical full-size regular 21K model; retain only truthful aliases and the old route.";
  const transaction: Transaction = await client.transaction("write");
  try {
    const canonicalAlias = await transaction.execute({
      sql: "SELECT source_id,source_item_id FROM entity_aliases WHERE entity_id=? AND review_status='approved' AND source_id IS NOT NULL AND source_item_id IS NOT NULL LIMIT 1",
      args: [CANONICAL_ID],
    });
    const sourceId = String(canonicalAlias.rows[0]?.source_id ?? "");
    const sourceItemId = String(canonicalAlias.rows[0]?.source_item_id ?? "");
    if (!sourceId || !sourceItemId) throw new Error("Phase 215 canonical Sailor model lacks alias provenance.");
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)",
      args: [batchId, batchKey, digest(batchKey), note],
    });
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'merge',?,?,?,?,?)",
      args: [actionId, batchId, OLD_SLUG, digest(`${OLD_ID}:${CANONICAL_ID}:${batchKey}`), OLD_ID, CANONICAL_ID, "applied", note],
    });
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO entity_lineage(id,batch_id,action_id,source_entity_id,target_entity_id,lineage_kind,fallback_reason) VALUES(?,?,?, ?,?,'merge',?)",
      args: [stableId("phase215-lineage", OLD_ID), batchId, actionId, OLD_ID, CANONICAL_ID, "canonical_model_identity"],
    });
    for (const [alias, language] of [["Sailor 21K Pro Gear", "en"], ["写乐 21K Pro Gear / 大鱼雷", "zh"] as const]) {
      await transaction.execute({
        sql: "INSERT OR IGNORE INTO entity_aliases(id,entity_id,alias,language,source_id,alias_kind,source_item_id,review_status) VALUES(?,?,?,?,?,'alias',?,'approved')",
        args: [stableId("phase215-alias", `${language}:${alias}`), CANONICAL_ID, alias, language, sourceId, sourceItemId],
      });
    }
    const redirect = await transaction.execute({
      sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
      args: [sourcePath],
    });
    if (redirect.rows.length === 0) {
      await transaction.execute({
        sql: "INSERT INTO entity_redirects(id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES(?,?,?,?,?,'permanent','duplicate_canonical_merge')",
        args: [stableId("phase215-redirect", OLD_SLUG), batchId, actionId, sourcePath, targetPath],
      });
    } else if (
      redirect.rows.length !== 1 ||
      String(redirect.rows[0]?.target_path) !== targetPath ||
      String(redirect.rows[0]?.redirect_kind) !== "permanent"
    ) {
      throw new Error("Phase 215 found a conflicting Sailor duplicate redirect.");
    }
    await transaction.execute({ sql: "DELETE FROM entity_links WHERE source_id=?", args: [OLD_ID] });
    await transaction.execute({
      sql: "UPDATE entity_publications SET status='retired',blockers_json=?,approved_content_hash=NULL,reviewed_content_revision=NULL,reviewed_contract_version=NULL,reviewed_by=NULL,reviewed_at=NULL,published_at=NULL,review_notes=?,updated_at=datetime('now') WHERE entity_id=?",
      args: ['["taxonomy_merged"]', note, OLD_ID],
    });
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase215SailorProGearDuplicateMerge(
  client: Client,
  options: ApplyPhase215Options,
): Promise<ApplyPhase215Result> {
  await authority(client, options);
  await identity(client);
  const wasApplied = await alreadyApplied(client);
  await merge(client);
  if (!(await alreadyApplied(client))) throw new Error("Phase 215 merge did not reach terminal identity state.");
  if (wasApplied) {
    return {
      entities: [
        { entityId: OLD_ID, outcome: "noop", contentHash: "identity-merge-only" },
        { entityId: CANONICAL_ID, outcome: "noop", contentHash: await computePublicationContentHash(client, CANONICAL_ID) },
      ],
    };
  }
  const brandState = await client.execute({
    sql: "SELECT publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entity_publications publication LEFT JOIN public_entities public ON public.id=publication.entity_id WHERE publication.entity_id=?",
    args: [BRAND_ID],
  });
  if (brandState.rows[0]?.status !== "published" || Number(brandState.rows[0]?.is_public) !== 1) {
    const brandHash = await computePublicationContentHash(client, BRAND_ID);
    const brandReviews = await client.execute({
      sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=?",
      args: [BRAND_ID, brandHash],
    });
    if (brandReviews.rows.length < 3 || brandReviews.rows.some((row) => String(row.status) !== "approved")) {
      for (const reviewKind of ["fact", "language", "media"] as const) {
        await recordEntityContentReview(client, {
          entityId: BRAND_ID,
          reviewKind,
          reviewer: options.reviewer,
          status: "approved",
          notes: `${SOURCE_KEY}; ${reviewKind} review of the canonical Sailor brand prerequisite.`,
        });
      }
    }
    await publishEntity(client, { entityId: BRAND_ID, reviewer: options.reviewer });
  }
  const currentHash = await computePublicationContentHash(client, CANONICAL_ID);
  const reviews = await client.execute({
    sql: "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=?",
    args: [CANONICAL_ID, currentHash],
  });
  const canonicalState = await client.execute({
    sql: "SELECT publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entity_publications publication LEFT JOIN public_entities public ON public.id=publication.entity_id WHERE publication.entity_id=?",
    args: [CANONICAL_ID],
  });
  if (
    reviews.rows.length < 3 ||
    reviews.rows.some((row) => String(row.status) !== "approved") ||
    canonicalState.rows[0]?.status !== "published" ||
    Number(canonicalState.rows[0]?.is_public) !== 1
  ) {
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId: CANONICAL_ID,
        reviewKind,
        reviewer: options.reviewer,
        status: "approved",
        notes: `${SOURCE_KEY}; ${reviewKind} review after duplicate identity merge.`,
      });
    }
    await publishEntity(client, { entityId: CANONICAL_ID, reviewer: options.reviewer });
  }
  const result: ApplyPhase215Result = {
    entities: [
      { entityId: OLD_ID, outcome: "noop", contentHash: "identity-merge-only" },
      { entityId: CANONICAL_ID, outcome: "published", contentHash: await computePublicationContentHash(client, CANONICAL_ID) },
    ],
  };
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
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
    throw new Error("Usage: tsx scripts/apply-phase215-sailor-pro-gear-duplicate-merge.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase215SailorProGearDuplicateMerge(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? SOURCE_KEY,
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: "",
      },
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

const invokedPath = process.argv[1] ? fs.realpathSync.native(path.resolve(process.argv[1])) : null;
const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url));
if (invokedPath === modulePath) void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
