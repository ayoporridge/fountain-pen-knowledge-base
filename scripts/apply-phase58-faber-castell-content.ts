import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import {
  PHASE58_AMBITION_ID,
  PHASE58_CLASSIC_ID,
  PHASE58_EMOTION_ID,
  PHASE58_FABER_BRAND_ID,
  PHASE58_LOOM_ID,
  PHASE58_NEO_SLIM_ID,
  PHASE58_ONDORO_ID,
  phase58FaberCastellPacks,
} from "./data/phase58-faber-castell";

export type ApplyPhase58Options = ApplyPhase22Options;
export type ApplyPhase58Result = ApplyPhase22Result;

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
    if (env[key]?.trim()) throw new Error(`Phase 58 refuses inherited remote database selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase58Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 58 owned catalog authority check failed.");
  }
  const own = fs.statSync(databasePath, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 58 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 58 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 58 owned copy must be migrated through 032.");
}

type PenIdentity = { id: string; oldSlug: string; slug: string; name: string };
const PEN_IDENTITIES: PenIdentity[] = [
  { id: PHASE58_AMBITION_ID, oldSlug: "辉柏嘉-faber-castell-ambition雄心", slug: "faber-castell-ambition", name: "Faber-Castell Ambition" },
  { id: PHASE58_EMOTION_ID, oldSlug: "辉柏嘉-faber-castell-e-motion尚品", slug: "faber-castell-e-motion", name: "Faber-Castell e-motion" },
  { id: PHASE58_ONDORO_ID, oldSlug: "辉柏嘉-faber-castell-ondoro极致-烟熏橡木", slug: "faber-castell-ondoro", name: "Faber-Castell Ondoro" },
  { id: PHASE58_CLASSIC_ID, oldSlug: "辉柏嘉-faber-castell-伯爵经典-gvfc", slug: "graf-von-faber-castell-classic", name: "Graf von Faber-Castell Classic" },
  { id: PHASE58_NEO_SLIM_ID, oldSlug: "辉柏嘉-faber-castell-伯爵翎尚-neo-slim", slug: "faber-castell-neo-slim", name: "Faber-Castell NEO Slim" },
  { id: PHASE58_LOOM_ID, oldSlug: "辉柏嘉-faber-castell-如恩-loom", slug: "faber-castell-loom", name: "Faber-Castell LOOM" },
];

async function installRedirect(tx: Transaction, input: { sourcePath: string; targetPath: string; actionId: string; batchId: string }): Promise<void> {
  const existing = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [input.sourcePath] });
  if (existing.rows.length > 0) {
    if (String(existing.rows[0]?.target_path ?? "") !== input.targetPath || String(existing.rows[0]?.redirect_kind ?? "") !== "permanent") throw new Error(`Phase 58 conflicting redirect for ${input.sourcePath}.`);
    return;
  }
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_normalization')", args: [stableId("phase58-redirect", input.sourcePath), input.batchId, input.actionId, input.sourcePath, input.targetPath] });
}

async function renamePen(tx: Transaction, pen: PenIdentity): Promise<void> {
  const row = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ?", args: [pen.id] });
  if (row.rows.length !== 1 || String(row.rows[0]?.type) !== "pen") throw new Error(`Phase 58 entity identity missing: ${pen.id}`);
  const currentSlug = String(row.rows[0]?.slug ?? "");
  const batchId = stableId("phase58-batch", pen.id);
  const actionId = stableId("phase58-action", pen.id);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, `phase58-${pen.id}`, digest(pen.id), `Normalize ${pen.name} canonical slug.`] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, pen.id, digest(`${pen.id}\0${pen.slug}`), pen.id, pen.id, `Normalize ${pen.name} canonical slug.`] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)", args: [stableId("phase58-lineage", pen.id), batchId, actionId, pen.id, pen.id] });
  if (currentSlug !== pen.slug) {
    const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [pen.slug, pen.id] });
    if (collision.rows.length > 0) throw new Error(`Phase 58 slug collision: ${pen.slug}`);
    await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: [pen.slug, pen.name, pen.id] });
  } else {
    await tx.execute({ sql: "UPDATE entities SET name = ?, updated_at = datetime('now') WHERE id = ?", args: [pen.name, pen.id] });
  }
  await installRedirect(tx, { sourcePath: `/pen/${pen.oldSlug}`, targetPath: `/pen/${pen.slug}`, actionId, batchId });
}

async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ?", args: [PHASE58_FABER_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "faber-castell") throw new Error("Phase 58 Faber-Castell brand identity mismatch.");
    for (const pen of PEN_IDENTITIES) await renamePen(tx, pen);
    for (const pen of PEN_IDENTITIES) {
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [pen.id, PHASE58_FABER_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase58-link", `${pen.id}:made_by:${PHASE58_FABER_BRAND_ID}`), pen.id, PHASE58_FABER_BRAND_ID, "Phase 58 canonical Faber-Castell maker topology"] });
      const maker = await tx.execute({ sql: "SELECT count(*) AS total FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", args: [pen.id, PHASE58_FABER_BRAND_ID] });
      if (Number(maker.rows[0]?.total ?? 0) !== 1) throw new Error(`Phase 58 maker topology failed for ${pen.id}`);
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase58FaberCastellContent(client: Client, options: ApplyPhase58Options): Promise<ApplyPhase58Result> {
  await assertOwned(client, options);
  await ensureTopology(client);
  const result = await applyCuratedContentPacks(client, options, phase58FaberCastellPacks);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}
