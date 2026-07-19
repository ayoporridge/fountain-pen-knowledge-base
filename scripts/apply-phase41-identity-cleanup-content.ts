import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE41_AURORA_88_ID, PHASE41_AURORA_BRAND_ID, PHASE41_AURORA_GENERIC_ID, PHASE41_PILOT_823_DUPLICATE_ID, PHASE41_PILOT_823_ID, PHASE41_PILOT_BRAND_ID, PHASE41_WATERMAN_BRAND_ID, PHASE41_WATERMAN_HEMISPHERE_ID, phase41IdentityCleanupPacks } from "./data/phase41-identity-cleanup";

export type ApplyPhase41Options = ApplyPhase22Options;
export type ApplyPhase41Result = ApplyPhase22Result;
const OLD_PILOT_SLUG = "百乐-pilot-custom-823";
const OLD_WATERMAN_SLUG = "威迪文-waterman-查尔斯顿-hemisphere";
const OLD_AURORA_SLUG = "奥罗拉-aurora";
function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 41 refuses inherited remote selection: ${key}.`); }
async function assertOwned(client: Client, options: ApplyPhase41Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot); const databasePath = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) throw new Error("Phase 41 owned catalog authority check failed.");
  const own = fs.statSync(databasePath, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true }); if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 41 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main"); if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 41 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] }); if (migration.rows.length !== 1) throw new Error("Phase 41 owned copy must be migrated through 032.");
}
async function installRedirect(tx: Awaited<ReturnType<Client["transaction"]>>, input: { sourcePath: string; targetPath?: string; kind: "permanent" | "hard_404"; fallback: string; actionId: string; batchId: string }): Promise<void> {
  const existing = await tx.execute({ sql: "SELECT redirect_kind, target_path FROM entity_redirects WHERE source_path = ?", args: [input.sourcePath] });
  if (existing.rows.length > 0) { const row = existing.rows[0]; if (String(row?.redirect_kind) !== input.kind || (input.targetPath ?? null) !== (row?.target_path == null ? null : String(row.target_path))) throw new Error(`Phase 41 conflicting redirect for ${input.sourcePath}.`); return; }
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, ?, ?)", args: [stableId("phase41-redirect", input.sourcePath), input.batchId, input.actionId, input.sourcePath, input.targetPath ?? null, input.kind, input.fallback] });
}
async function recordAction(tx: Awaited<ReturnType<Client["transaction"]>>, input: { key: string; sourceId: string; targetId: string; kind: "merge" | "rename" | "retire"; note: string }): Promise<{ batchId: string; actionId: string }> {
  const batchId = stableId("phase41-batch", input.key); const actionId = stableId("phase41-action", input.key); const checksum = digest(`${input.key}\0${input.sourceId}\0${input.targetId}`);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, input.key, digest(input.key), input.note] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, ?, ?, ?, ?, 'applied', ?)", args: [actionId, batchId, input.sourceId, input.kind, checksum, input.sourceId, input.targetId, input.note] });
  if (input.kind === "merge" || input.kind === "rename") await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, ?, NULL)", args: [stableId("phase41-lineage", input.key), batchId, actionId, input.sourceId, input.targetId, input.kind] });
  return { batchId, actionId };
}
async function ensureIdentityCleanup(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brands = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id IN (?, ?, ?)", args: [PHASE41_PILOT_BRAND_ID, PHASE41_WATERMAN_BRAND_ID, PHASE41_AURORA_BRAND_ID] });
    if (brands.rows.length !== 3 || brands.rows.some((row) => String(row?.type) !== "brand")) throw new Error("Phase 41 brand identity set is incomplete.");
    const pilot = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE41_PILOT_823_ID] }); if (pilot.rows.length !== 1 || String(pilot.rows[0]?.type) !== "pen" || String(pilot.rows[0]?.slug) !== "pilot-custom-823") throw new Error("Phase 41 Pilot canonical identity mismatch.");
    const duplicate = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE41_PILOT_823_DUPLICATE_ID] }); if (duplicate.rows.length !== 1 || String(duplicate.rows[0]?.type) !== "pen" || String(duplicate.rows[0]?.slug) !== OLD_PILOT_SLUG) throw new Error("Phase 41 Pilot duplicate identity mismatch.");
    const waterman = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE41_WATERMAN_HEMISPHERE_ID] }); if (waterman.rows.length !== 1 || String(waterman.rows[0]?.type) !== "pen") throw new Error("Phase 41 Waterman identity missing.");
    if (String(waterman.rows[0]?.slug) !== "waterman-hemisphere") {
      const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: ["waterman-hemisphere", PHASE41_WATERMAN_HEMISPHERE_ID] }); if (collision.rows.length > 0) throw new Error("Phase 41 Waterman canonical slug collision.");
      const action = await recordAction(tx, { key: "phase41-waterman-hemisphere-rename", sourceId: PHASE41_WATERMAN_HEMISPHERE_ID, targetId: PHASE41_WATERMAN_HEMISPHERE_ID, kind: "rename", note: "Rename mixed Charleston/Hémisphère import to canonical Waterman Hémisphère." });
      await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: ["waterman-hemisphere", "威迪文 Waterman Hémisphère", PHASE41_WATERMAN_HEMISPHERE_ID] });
      await installRedirect(tx, { sourcePath: `/pen/${OLD_WATERMAN_SLUG}`, targetPath: "/pen/waterman-hemisphere", kind: "permanent", fallback: "canonical_identity_rename", actionId: action.actionId, batchId: action.batchId });
    } else {
      const action = await recordAction(tx, { key: "phase41-waterman-hemisphere-rename", sourceId: PHASE41_WATERMAN_HEMISPHERE_ID, targetId: PHASE41_WATERMAN_HEMISPHERE_ID, kind: "rename", note: "Canonical Waterman Hémisphère rename already applied." });
      await installRedirect(tx, { sourcePath: `/pen/${OLD_WATERMAN_SLUG}`, targetPath: "/pen/waterman-hemisphere", kind: "permanent", fallback: "canonical_identity_rename", actionId: action.actionId, batchId: action.batchId });
    }
    const mergeAction = await recordAction(tx, { key: "phase41-pilot-custom-823-merge", sourceId: PHASE41_PILOT_823_DUPLICATE_ID, targetId: PHASE41_PILOT_823_ID, kind: "merge", note: "Merge duplicate imported Pilot Custom 823 identity into the clean canonical slug; canonical content owns the facts." });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ?", args: [PHASE41_PILOT_823_DUPLICATE_ID] });
    await tx.execute({ sql: "UPDATE entity_publications SET status = 'retired', blockers_json = ?, approved_content_hash = NULL, reviewed_content_revision = NULL, reviewed_contract_version = NULL, reviewed_by = NULL, reviewed_at = NULL, published_at = NULL, review_notes = ?, updated_at = datetime('now') WHERE entity_id = ? AND status <> 'retired'", args: ['["taxonomy_merged"]', "Duplicate Pilot Custom 823 identity; use /pen/pilot-custom-823.", PHASE41_PILOT_823_DUPLICATE_ID] });
    await installRedirect(tx, { sourcePath: `/pen/${OLD_PILOT_SLUG}`, targetPath: "/pen/pilot-custom-823", kind: "permanent", fallback: "duplicate_canonical_merge", actionId: mergeAction.actionId, batchId: mergeAction.batchId });
    const auroraAction = await recordAction(tx, { key: "phase41-aurora-generic-retire", sourceId: PHASE41_AURORA_GENERIC_ID, targetId: PHASE41_AURORA_BRAND_ID, kind: "retire", note: "Retire brand-generic Aurora pen placeholder; future Aurora 88/Optima pages require concrete model identity." });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ?", args: [PHASE41_AURORA_GENERIC_ID] });
    await tx.execute({ sql: "UPDATE entity_publications SET status = 'retired', blockers_json = ?, approved_content_hash = NULL, reviewed_content_revision = NULL, reviewed_contract_version = NULL, reviewed_by = NULL, reviewed_at = NULL, published_at = NULL, review_notes = ?, updated_at = datetime('now') WHERE entity_id = ? AND status <> 'retired'", args: ['["entity_type_placeholder"]', "Aurora generic placeholder retired; create Aurora 88, Optima or another concrete model instead.", PHASE41_AURORA_GENERIC_ID] });
    await installRedirect(tx, { sourcePath: `/pen/${OLD_AURORA_SLUG}`, kind: "hard_404", fallback: "brand_generic_placeholder_retired", actionId: auroraAction.actionId, batchId: auroraAction.batchId });
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
async function ensureAurora88Topology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const existing = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ?", args: [PHASE41_AURORA_88_ID, "aurora-88"] });
    if (existing.rows.length === 0) await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [PHASE41_AURORA_88_ID, "aurora-88", "奥罗拉 Aurora 88"] });
    else if (existing.rows.length !== 1 || String(existing.rows[0]?.id) !== PHASE41_AURORA_88_ID || String(existing.rows[0]?.type) !== "pen" || String(existing.rows[0]?.slug) !== "aurora-88") throw new Error("Phase 41 Aurora 88 identity collision.");
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [PHASE41_AURORA_88_ID, PHASE41_AURORA_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase41-link", `${PHASE41_AURORA_88_ID}:made_by:${PHASE41_AURORA_BRAND_ID}`), PHASE41_AURORA_88_ID, PHASE41_AURORA_BRAND_ID, "Phase 41 canonical Aurora 88 maker"] });
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase41IdentityCleanupContent(client: Client, options: ApplyPhase41Options): Promise<ApplyPhase41Result> {
  await assertOwned(client, options); await ensureIdentityCleanup(client); await ensureAurora88Topology(client);
  const packs = structuredClone(phase41IdentityCleanupPacks);
  const pilotIds = new Set([PHASE41_PILOT_BRAND_ID, PHASE41_PILOT_823_ID]); const watermanIds = new Set([PHASE41_WATERMAN_BRAND_ID, PHASE41_WATERMAN_HEMISPHERE_ID]); const auroraIds = new Set([PHASE41_AURORA_BRAND_ID, PHASE41_AURORA_88_ID]);
  const batches = [packs.filter((pack) => pilotIds.has(pack.entityId)), packs.filter((pack) => watermanIds.has(pack.entityId)), packs.filter((pack) => auroraIds.has(pack.entityId))];
  const entities: ApplyPhase41Result["entities"] = [];
  for (const batch of batches) { const result = await applyCuratedContentPacks(client, options, batch); entities.push(...result.entities); }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return { entities };
}
