import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE37_KOP_ID, PHASE37_NAGINATA_ID, PHASE37_SAILOR_BRAND_ID, phase37SailorKopPacks } from "./data/phase37-sailor-kop-naginata";

export type ApplyPhase37Options = ApplyPhase22Options;
export type ApplyPhase37Result = ApplyPhase22Result;

const OLD_KOP_SLUG = "写乐-sailor-king-of-pen笔王";
const KOP_SLUG = "sailor-king-of-pens";
const OLD_NAGINATA_SLUG = "写乐-sailor-长刀研";
const NAGINATA_SLUG = "sailor-naginata-togi";

function stableId(prefix: string, value: string): string { return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`; }
function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 37 refuses inherited remote selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase37Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot); const databasePath = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) throw new Error("Phase 37 owned catalog authority check failed.");
  const own = fs.statSync(databasePath, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 37 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 37 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 37 owned copy must be migrated through 032.");
}

async function assertIdentity(transaction: Transaction, id: string, type: string, slug: string): Promise<void> {
  const row = await transaction.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [id] });
  if (row.rows.length !== 1 || String(row.rows[0]?.type) !== type || String(row.rows[0]?.slug) !== slug) throw new Error(`Phase 37 identity mismatch: ${id}`);
}

async function deleteOwnedPayload(transaction: Transaction, entityId: string): Promise<void> {
  await transaction.execute({ sql: "DELETE FROM claim_evidence WHERE claim_id IN (SELECT id FROM claims WHERE subject_entity_id = ?)", args: [entityId] });
  await transaction.execute({ sql: "DELETE FROM spec_field_evidence WHERE model_spec_id IN (SELECT id FROM model_specs WHERE entity_id = ?)", args: [entityId] });
  await transaction.execute({ sql: "DELETE FROM citations WHERE (target_type = 'entity' AND target_id = ?) OR (target_type = 'story' AND target_id IN (SELECT id FROM stories WHERE entity_id = ?)) OR (target_type = 'timeline_event' AND target_id IN (SELECT id FROM timeline_events WHERE entity_id = ?)) OR (target_type = 'model_spec' AND target_id IN (SELECT id FROM model_specs WHERE entity_id = ?)) OR (target_type = 'claim' AND target_id IN (SELECT id FROM claims WHERE subject_entity_id = ?)) OR claim_id IN (SELECT id FROM claims WHERE subject_entity_id = ?)", args: [entityId, entityId, entityId, entityId, entityId, entityId] });
  for (const sql of ["DELETE FROM fact_conflicts WHERE entity_id = ?", "DELETE FROM fact_scopes WHERE entity_id = ?", "DELETE FROM entity_references WHERE entity_id = ?", "DELETE FROM entity_aliases WHERE entity_id = ?", "DELETE FROM timeline_events WHERE entity_id = ?", "DELETE FROM media_assets WHERE entity_id = ?", "DELETE FROM model_variants WHERE model_entity_id = ?", "DELETE FROM model_specs WHERE entity_id = ?", "DELETE FROM claims WHERE subject_entity_id = ?", "DELETE FROM stories WHERE entity_id = ?"]) await transaction.execute({ sql, args: [entityId] });
}

async function installHard404(transaction: Transaction, batchId: string, actionId: string): Promise<void> {
  const sourcePath = `/pen/${OLD_NAGINATA_SLUG}`;
  const existing = await transaction.execute({ sql: "SELECT redirect_kind, target_path FROM entity_redirects WHERE source_path = ?", args: [sourcePath] });
  if (existing.rows.length > 0) { const row = existing.rows[0]; if (existing.rows.length !== 1 || String(row?.redirect_kind) !== "hard_404" || row?.target_path != null) throw new Error("Phase 37 conflicting Naginata redirect."); return; }
  await transaction.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, NULL, 'hard_404', ?)", args: [stableId("phase37-redirect", sourcePath), batchId, actionId, sourcePath, "entity_type_changed; Naginata-Togi is a nib taxonomy, not a published pen page"] });
}

async function prepareTopology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  const sourceKey = "phase37-sailor-kop-naginata-v1"; const batchId = stableId("taxonomy-batch", sourceKey); const actionId = stableId("taxonomy-action", sourceKey);
  try {
    await assertIdentity(transaction, PHASE37_SAILOR_BRAND_ID, "brand", "sailor");
    const kop = await transaction.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE37_KOP_ID] });
    if (kop.rows.length !== 1 || String(kop.rows[0]?.type) !== "pen" || ![OLD_KOP_SLUG, KOP_SLUG].includes(String(kop.rows[0]?.slug))) throw new Error("Phase 37 KOP legacy identity mismatch.");
    const collision = await transaction.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [KOP_SLUG, PHASE37_KOP_ID] });
    if (collision.rows.length > 0) throw new Error("Phase 37 KOP canonical slug collision.");
    await transaction.execute({ sql: "UPDATE entities SET slug = ?, name = ? WHERE id = ?", args: [KOP_SLUG, "写乐 Sailor King of Pens（KOP）", PHASE37_KOP_ID] });
    await transaction.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [PHASE37_KOP_ID, PHASE37_SAILOR_BRAND_ID] });
    await transaction.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase37-link", `${PHASE37_KOP_ID}:made_by:${PHASE37_SAILOR_BRAND_ID}`), PHASE37_KOP_ID, PHASE37_SAILOR_BRAND_ID, "Phase 37 canonical Sailor KOP maker"] });
    const naginata = await transaction.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE37_NAGINATA_ID] });
    if (naginata.rows.length !== 1) throw new Error(`Phase 37 Naginata identity missing: ${PHASE37_NAGINATA_ID}`);
    const naginataType = String(naginata.rows[0]?.type); const naginataSlug = String(naginata.rows[0]?.slug);
    if (naginataType === "pen" && naginataSlug === OLD_NAGINATA_SLUG) {
      await deleteOwnedPayload(transaction, PHASE37_NAGINATA_ID);
      await transaction.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? OR target_id = ?", args: [PHASE37_NAGINATA_ID, PHASE37_NAGINATA_ID] });
      await transaction.execute({ sql: "UPDATE entities SET type = 'nib', slug = ?, name = ?, summary = ?, body_md = NULL, source = ? WHERE id = ?", args: [NAGINATA_SLUG, "写乐 Sailor Naginata-Togi（长刀研）", "Sailor 的 Naginata-Togi（长刀研）是特殊笔尖类型；具体钢笔 SKU 必须按货号单独记录。", "taxonomy:phase37-sailor-naginata-nib", PHASE37_NAGINATA_ID] });
      await transaction.execute({ sql: "UPDATE entity_publications SET status = 'retired', blockers_json = ?, approved_content_hash = NULL, reviewed_content_revision = NULL, reviewed_contract_version = NULL, reviewed_by = NULL, reviewed_at = NULL, published_at = NULL, review_notes = ?, updated_at = datetime('now') WHERE entity_id = ?", args: ['["entity_type_changed"]', "Reclassified as nib taxonomy; not a published pen model.", PHASE37_NAGINATA_ID] });
    } else if (naginataType !== "nib" || naginataSlug !== NAGINATA_SLUG) {
      throw new Error(`Phase 37 Naginata identity mismatch: ${PHASE37_NAGINATA_ID}`);
    }
    await transaction.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, sourceKey, digest(sourceKey), "Rename KOP slug and reclassify Naginata-Togi from a polluted pen draft to a nib taxonomy entry."] });
    await transaction.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, PHASE37_NAGINATA_ID, digest(`${PHASE37_NAGINATA_ID}\0${OLD_NAGINATA_SLUG}\0${NAGINATA_SLUG}\0nib`), PHASE37_NAGINATA_ID, PHASE37_NAGINATA_ID, "Reclassify Naginata-Togi as nib; old pen route is hard 404."] });
    await installHard404(transaction, batchId, actionId);
    await transaction.commit();
  } catch (error) { if (!transaction.closed) await transaction.rollback(); throw error; }
}

export async function applyPhase37SailorKopNaginataContent(client: Client, options: ApplyPhase37Options): Promise<ApplyPhase37Result> {
  await assertOwned(client, options); await prepareTopology(client); const result = await applyCuratedContentPacks(client, options, structuredClone(phase37SailorKopPacks)); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}
