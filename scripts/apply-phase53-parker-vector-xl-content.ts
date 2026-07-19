import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { phase28Parker51Packs } from "./data/phase28-parker-51";
import {
  PHASE53_PARKER_ID,
  PHASE53_VECTOR_ID,
  PHASE53_VECTOR_SLUG,
  PHASE53_VECTOR_XL_ID,
  PHASE53_VECTOR_XL_SLUG,
  phase53ParkerVectorXLPacks,
} from "./data/phase53-parker-vector-xl";

export type ApplyPhase53Options = ApplyPhase22Options;
export type ApplyPhase53Result = ApplyPhase22Result;

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

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 53 refuses inherited remote database selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase53Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !isInside(databasePath, ownedRoot)
  ) {
    throw new Error("Phase 53 owned catalog authority check failed.");
  }
  const own = fs.statSync(databasePath, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) {
    throw new Error("Phase 53 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 53 client is not bound to owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 53 owned copy must be migrated through 032.");
}

const TARGETS = [
  { id: PHASE53_VECTOR_ID, slug: PHASE53_VECTOR_SLUG, name: "Parker Vector（经典款）", existing: true },
  { id: PHASE53_VECTOR_XL_ID, slug: PHASE53_VECTOR_XL_SLUG, name: "Parker Vector XL", existing: false },
] as const;

async function assertBrand(transaction: Transaction): Promise<void> {
  const result = await transaction.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE53_PARKER_ID] });
  if (result.rows.length !== 1 || String(result.rows[0]?.type) !== "brand" || String(result.rows[0]?.slug) !== "parker") {
    throw new Error("Phase 53 Parker brand identity mismatch.");
  }
}

async function ensureTarget(transaction: Transaction, target: (typeof TARGETS)[number]): Promise<void> {
  const existing = await transaction.execute({
    sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id",
    args: [target.id, target.slug],
  });
  if (existing.rows.length === 0) {
    if (target.existing) throw new Error(`Phase 53 existing classic Vector disappeared: ${target.id}`);
    await transaction.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [target.id, target.slug, target.name] });
    return;
  }
  if (
    existing.rows.length !== 1 ||
    String(existing.rows[0]?.id) !== target.id ||
    String(existing.rows[0]?.type) !== "pen" ||
    String(existing.rows[0]?.slug) !== target.slug
  ) {
    throw new Error(`Phase 53 entity/slug collision for ${target.slug}; refusing guessed identity.`);
  }
}

async function ensureMaker(transaction: Transaction, entityId: string): Promise<void> {
  await transaction.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [entityId, PHASE53_PARKER_ID] });
  const current = await transaction.execute({ sql: "SELECT id FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", args: [entityId, PHASE53_PARKER_ID] });
  if (current.rows.length === 0) {
    await transaction.execute({
      sql: "INSERT INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)",
      args: [stableId("phase53-link", `${entityId}:made_by:${PHASE53_PARKER_ID}`), entityId, PHASE53_PARKER_ID, "Phase 53 canonical Parker Vector maker"],
    });
  } else if (current.rows.length !== 1) {
    throw new Error(`Phase 53 ${entityId} has ambiguous Parker maker links.`);
  }
  const verified = await transaction.execute({ sql: "SELECT count(*) AS total FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", args: [entityId, PHASE53_PARKER_ID] });
  if (Number(verified.rows[0]?.total ?? 0) !== 1) throw new Error(`Phase 53 ${entityId} maker link verification failed.`);
}

async function prepareTopology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    await assertBrand(transaction);
    for (const target of TARGETS) {
      await ensureTarget(transaction, target);
      await ensureMaker(transaction, target.id);
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase53ParkerVectorXLContent(client: Client, options: ApplyPhase53Options): Promise<ApplyPhase53Result> {
  await assertOwned(client, options);
  await prepareTopology(client);
  const brand = phase28Parker51Packs.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE53_PARKER_ID);
  if (!brand) throw new Error("Phase 53 Parker brand prerequisite pack is missing.");
  const phase53Brand = structuredClone(brand);
  phase53Brand.key = "phase53-parker-brand-v1";
  const result = await applyCuratedContentPacks(client, options, [phase53Brand, ...structuredClone(phase53ParkerVectorXLPacks)]);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}
