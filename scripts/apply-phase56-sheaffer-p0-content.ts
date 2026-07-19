import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import {
  PHASE56_CRAFTSMAN_33T_ID,
  PHASE56_CRAFTSMAN_33T_SLUG,
  PHASE56_CRAFTSMAN_BALANCE_ID,
  PHASE56_CRAFTSMAN_BALANCE_SLUG,
  PHASE56_CRAFTSMAN_TIP_DIP_ID,
  PHASE56_CRAFTSMAN_TIP_DIP_SLUG,
  PHASE56_RAW_CRAFTSMAN_ID,
  PHASE56_RAW_CRAFTSMAN_SLUG,
  PHASE56_RAW_TOUCHDOWN_TM_ID,
  PHASE56_RAW_TOUCHDOWN_TM_SLUG,
  PHASE56_SHEAFFER_ID,
  PHASE56_TOUCHDOWN_TM_ID,
  PHASE56_TOUCHDOWN_TM_SLUG,
  phase56SheafferPacks,
} from "./data/phase56-sheaffer-p0";

export type ApplyPhase56Options = ApplyPhase22Options;
export type ApplyPhase56Result = ApplyPhase22Result;

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
    if (env[key]?.trim()) throw new Error(`Phase 56 refuses inherited remote selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase56Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 56 owned catalog authority check failed.");
  }
  const own = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) {
    throw new Error("Phase 56 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 56 client is not bound to owned copy.");
  }
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 56 owned copy must be migrated through 032.");
}

async function ensureEntity(tx: Transaction, input: { id: string; slug: string; name: string }): Promise<void> {
  const existing = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id", args: [input.id, input.slug] });
  if (existing.rows.length === 0) {
    await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [input.id, input.slug, input.name] });
  } else if (existing.rows.length !== 1 || String(existing.rows[0]?.id) !== input.id || String(existing.rows[0]?.type) !== "pen" || String(existing.rows[0]?.slug) !== input.slug) {
    throw new Error(`Phase 56 canonical entity/slug collision: ${input.id}/${input.slug}`);
  }
}

async function ensureMaker(tx: Transaction, entityId: string): Promise<void> {
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [entityId, PHASE56_SHEAFFER_ID] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase56-link", `${entityId}:made_by:${PHASE56_SHEAFFER_ID}`), entityId, PHASE56_SHEAFFER_ID, "Phase 56 canonical Sheaffer P0 maker topology"] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase56-reverse", `${PHASE56_SHEAFFER_ID}:reverse:${entityId}`), PHASE56_SHEAFFER_ID, entityId, "Phase 56 canonical Sheaffer P0 reverse maker topology"] });
  const madeBy = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [entityId] });
  if (madeBy.rows.length !== 1 || String(madeBy.rows[0]?.target_id) !== PHASE56_SHEAFFER_ID) throw new Error(`Phase 56 maker topology failed: ${entityId}`);
}

async function recordAction(tx: Transaction, input: { key: string; sourceId: string; targetId: string; kind: "split" | "retire"; note: string; fallbackReason?: string }): Promise<{ batchId: string; actionId: string }> {
  const batchKey = "phase56-sheaffer-p0-identity-v1";
  const batchId = stableId("phase56-batch", batchKey);
  const actionId = stableId("phase56-action", input.key);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, batchKey, digest(batchKey), "Split generic Sheaffer Craftsman and Touchdown TM rows into concrete P0 identities."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, ?, ?, ?, ?, 'applied', ?)", args: [actionId, batchId, input.key, input.kind, digest(`${input.key}\0${input.sourceId}\0${input.targetId}`), input.sourceId, input.targetId, input.note] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, ?, ?)", args: [stableId("phase56-lineage", input.key), batchId, actionId, input.sourceId, input.targetId, input.kind, input.kind === "split" ? (input.fallbackReason ?? "generic identity split requires concrete version selection") : null] });
  return { batchId, actionId };
}

async function installRedirect(tx: Transaction, input: { sourcePath: string; targetPath: string | null; actionId: string; batchId: string; kind: "permanent" | "hard_404"; reason: string }): Promise<void> {
  const existing = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [input.sourcePath] });
  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    if (String(row?.target_path ?? "") !== String(input.targetPath ?? "") || String(row?.redirect_kind ?? "") !== input.kind) throw new Error(`Phase 56 conflicting redirect for ${input.sourcePath}.`);
    return;
  }
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, ?, ?)", args: [stableId("phase56-redirect", input.sourcePath), input.batchId, input.actionId, input.sourcePath, input.targetPath, input.kind, input.reason] });
}

async function ensureIdentity(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE56_SHEAFFER_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "sheaffer") throw new Error("Phase 56 Sheaffer brand identity mismatch.");
    const raw = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id IN (?, ?)", args: [PHASE56_RAW_CRAFTSMAN_ID, PHASE56_RAW_TOUCHDOWN_TM_ID] });
    if (raw.rows.length !== 2 || raw.rows.some((row) => String(row.type) !== "pen") || raw.rows.some((row) => String(row.id) === PHASE56_RAW_CRAFTSMAN_ID && String(row.slug) !== PHASE56_RAW_CRAFTSMAN_SLUG) || raw.rows.some((row) => String(row.id) === PHASE56_RAW_TOUCHDOWN_TM_ID && String(row.slug) !== PHASE56_RAW_TOUCHDOWN_TM_SLUG)) throw new Error("Phase 56 raw Sheaffer identity mismatch.");

    await ensureEntity(tx, { id: PHASE56_CRAFTSMAN_BALANCE_ID, slug: PHASE56_CRAFTSMAN_BALANCE_SLUG, name: "Sheaffer Craftsman (Balance)" });
    await ensureEntity(tx, { id: PHASE56_CRAFTSMAN_33T_ID, slug: PHASE56_CRAFTSMAN_33T_SLUG, name: "Sheaffer Craftsman 33T (1949 Lever)" });
    await ensureEntity(tx, { id: PHASE56_CRAFTSMAN_TIP_DIP_ID, slug: PHASE56_CRAFTSMAN_TIP_DIP_SLUG, name: "Sheaffer Craftsman Tip-Dip Touchdown" });
    await ensureEntity(tx, { id: PHASE56_TOUCHDOWN_TM_ID, slug: PHASE56_TOUCHDOWN_TM_SLUG, name: "Sheaffer Touchdown TM" });
    for (const id of [PHASE56_CRAFTSMAN_BALANCE_ID, PHASE56_CRAFTSMAN_33T_ID, PHASE56_CRAFTSMAN_TIP_DIP_ID, PHASE56_TOUCHDOWN_TM_ID]) await ensureMaker(tx, id);

    const splitActions = [] as Array<{ batchId: string; actionId: string }>;
    splitActions.push(await recordAction(tx, { key: "craftsman-to-balance", sourceId: PHASE56_RAW_CRAFTSMAN_ID, targetId: PHASE56_CRAFTSMAN_BALANCE_ID, kind: "split", note: "Split generic Craftsman row to the Balance-era canonical page.", fallbackReason: "generic Craftsman row spans Balance, 33T and Tip-Dip versions" }));
    splitActions.push(await recordAction(tx, { key: "craftsman-to-33t", sourceId: PHASE56_RAW_CRAFTSMAN_ID, targetId: PHASE56_CRAFTSMAN_33T_ID, kind: "split", note: "Split generic Craftsman row to the catalog-confirmed 33T lever page.", fallbackReason: "generic Craftsman row spans Balance, 33T and Tip-Dip versions" }));
    splitActions.push(await recordAction(tx, { key: "craftsman-to-tip-dip", sourceId: PHASE56_RAW_CRAFTSMAN_ID, targetId: PHASE56_CRAFTSMAN_TIP_DIP_ID, kind: "split", note: "Split generic Craftsman row to the Tip-Dip Touchdown page.", fallbackReason: "generic Craftsman row spans Balance, 33T and Tip-Dip versions" }));
    const touchdownAction = await recordAction(tx, { key: "touchdown-tm-to-canonical", sourceId: PHASE56_RAW_TOUCHDOWN_TM_ID, targetId: PHASE56_TOUCHDOWN_TM_ID, kind: "retire", note: "Retire raw Touchdown TM row in favor of the concrete family page." });

    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id IN (?, ?) OR target_id IN (?, ?)", args: [PHASE56_RAW_CRAFTSMAN_ID, PHASE56_RAW_TOUCHDOWN_TM_ID, PHASE56_RAW_CRAFTSMAN_ID, PHASE56_RAW_TOUCHDOWN_TM_ID] });
    await tx.execute({ sql: "UPDATE entity_publications SET status = 'retired', blockers_json = ?, approved_content_hash = NULL, reviewed_content_revision = NULL, reviewed_contract_version = NULL, reviewed_by = NULL, reviewed_at = NULL, published_at = NULL, review_notes = ?, updated_at = datetime('now') WHERE entity_id = ?", args: ['["identity_split"]', "Phase 56 generic Craftsman row split into Balance, 33T lever and Tip-Dip canonical pages.", PHASE56_RAW_CRAFTSMAN_ID] });
    await tx.execute({ sql: "UPDATE entity_publications SET status = 'retired', blockers_json = ?, approved_content_hash = NULL, reviewed_content_revision = NULL, reviewed_contract_version = NULL, reviewed_by = NULL, reviewed_at = NULL, published_at = NULL, review_notes = ?, updated_at = datetime('now') WHERE entity_id = ?", args: ['["identity_canonicalized"]', "Phase 56 raw Touchdown TM row canonicalized to the Touchdown TM family page.", PHASE56_RAW_TOUCHDOWN_TM_ID] });
    const firstSplit = splitActions[0];
    if (!firstSplit) throw new Error("Phase 56 split action missing.");
    await installRedirect(tx, { sourcePath: `/pen/${PHASE56_RAW_CRAFTSMAN_SLUG}`, targetPath: null, actionId: firstSplit.actionId, batchId: firstSplit.batchId, kind: "hard_404", reason: "generic Craftsman identity was split; choose Balance, 33T lever or Tip-Dip canonical page" });
    await installRedirect(tx, { sourcePath: `/pen/${PHASE56_RAW_TOUCHDOWN_TM_SLUG}`, targetPath: `/pen/${PHASE56_TOUCHDOWN_TM_SLUG}`, actionId: touchdownAction.actionId, batchId: touchdownAction.batchId, kind: "permanent", reason: "raw Touchdown TM identity canonicalized to concrete family page" });
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase56SheafferP0Content(client: Client, options: ApplyPhase56Options): Promise<ApplyPhase56Result> {
  await assertOwned(client, options);
  await ensureIdentity(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase56SheafferPacks));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const workspaceRoot = process.cwd();
  const databasePath = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalogPath = cliValue("--protected-catalog");
  if (!databasePath || !ownedRoot || !protectedCatalogPath) throw new Error("Usage: tsx scripts/apply-phase56-sheaffer-p0-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client");
  const { snapshotCatalogFiles } = await import("../src/lib/audit/read-only-catalog");
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    const result = await applyPhase56SheafferP0Content(client, { workspaceRoot, reviewer: cliValue("--reviewer") ?? "phase56-sheaffer-p0-curated-content", databasePath: path.resolve(databasePath), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalogPath), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalogPath)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
