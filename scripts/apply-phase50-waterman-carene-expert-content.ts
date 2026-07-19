import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE50_CARENE_ID, PHASE50_EXPERT_ID, PHASE50_WATERMAN_BRAND_ID, phase50WatermanCareneExpertPacks } from "./data/phase50-waterman-carene-expert";

export type ApplyPhase50Options = ApplyPhase22Options;
export type ApplyPhase50Result = ApplyPhase22Result;

const OLD_CARENE_SLUG = "威迪文-waterman-海韵-car-ne";
const OLD_EXPERT_SLUG = "威迪文-waterman-权威-expert";

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 50 refuses inherited remote selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase50Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) throw new Error("Phase 50 owned catalog authority check failed.");
  const own = fs.statSync(databasePath, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 50 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 50 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 50 owned copy must be migrated through 032.");
}

async function recordAction(tx: Awaited<ReturnType<Client["transaction"]>>, input: { key: string; sourceId: string; targetId: string }): Promise<{ batchId: string; actionId: string }> {
  const batchId = stableId("phase50-batch", input.key);
  const actionId = stableId("phase50-action", input.key);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, input.key, digest(input.key), `Phase 50 canonical rename: ${input.sourceId} -> ${input.targetId}`] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, input.key, digest(`${input.key}\0${input.sourceId}\0${input.targetId}`), input.sourceId, input.targetId, "Phase 50 Waterman model identity rename."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)", args: [stableId("phase50-lineage", input.key), batchId, actionId, input.sourceId, input.targetId] });
  return { batchId, actionId };
}

async function installRedirect(tx: Awaited<ReturnType<Client["transaction"]>>, input: { sourcePath: string; targetPath: string; actionId: string; batchId: string }): Promise<void> {
  const existing = await tx.execute({ sql: "SELECT redirect_kind, target_path FROM entity_redirects WHERE source_path = ?", args: [input.sourcePath] });
  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    if (String(row?.redirect_kind) !== "permanent" || String(row?.target_path) !== input.targetPath) throw new Error(`Phase 50 conflicting redirect for ${input.sourcePath}.`);
    return;
  }
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_identity_rename')", args: [stableId("phase50-redirect", input.sourcePath), input.batchId, input.actionId, input.sourcePath, input.targetPath] });
}

async function rename(tx: Awaited<ReturnType<Client["transaction"]>>, input: { id: string; oldSlug: string; slug: string; name: string }): Promise<void> {
  const row = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [input.id] });
  if (row.rows.length !== 1 || String(row.rows[0]?.type) !== "pen") throw new Error(`Phase 50 entity missing: ${input.id}`);
  const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [input.slug, input.id] });
  if (collision.rows.length > 0) throw new Error(`Phase 50 canonical slug collision: ${input.slug}`);
  const action = await recordAction(tx, { key: `phase50-${input.slug}-rename`, sourceId: input.id, targetId: input.id });
  await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: [input.slug, input.name, input.id] });
  await installRedirect(tx, { sourcePath: `/pen/${input.oldSlug}`, targetPath: `/pen/${input.slug}`, actionId: action.actionId, batchId: action.batchId });
}

async function ensureIdentity(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type FROM entities WHERE id = ?", args: [PHASE50_WATERMAN_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand") throw new Error("Phase 50 Waterman brand identity missing.");
    await rename(tx, { id: PHASE50_CARENE_ID, oldSlug: OLD_CARENE_SLUG, slug: "waterman-carene", name: "威迪文 Waterman Carène" });
    await rename(tx, { id: PHASE50_EXPERT_ID, oldSlug: OLD_EXPERT_SLUG, slug: "waterman-expert", name: "威迪文 Waterman Expert" });
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase50WatermanCareneExpertContent(client: Client, options: ApplyPhase50Options): Promise<ApplyPhase50Result> {
  await assertOwned(client, options);
  await ensureIdentity(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase50WatermanCareneExpertPacks));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}
