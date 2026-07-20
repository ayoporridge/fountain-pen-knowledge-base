import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import {
  PHASE80_REMBRANDT_ORIGINAL_FALLBACK_ID,
  PHASE80_REMBRANDT_ORIGINAL_SLUG,
  PHASE80_REMBRANDT_S_FALLBACK_ID,
  PHASE80_REMBRANDT_S_SLUG,
  PHASE80_VISCONTI_BRAND_FALLBACK_ID,
  phase80ViscontiRembrandtPacks,
} from "./data/phase80-visconti-rembrandt";

export type ApplyPhase80Options = ApplyPhase22Options;
export type ApplyPhase80Result = ApplyPhase22Result;

const ORIGINAL_RAW_SLUG = "维斯康蒂-visconti-rembrandt伦勃朗";

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 80 refuses inherited remote database selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase80Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, root)) throw new Error("Phase 80 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 80 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 80 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 80 owned copy must be migrated through 032.");
}

async function installRedirect(tx: Transaction, input: { source: string; target: string; batchId: string; actionId: string }): Promise<void> {
  if (input.source === input.target) throw new Error("Phase 80 rejects self redirect.");
  const existing = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [input.source] });
  if (existing.rows.length > 0) { if (existing.rows.length !== 1 || String(existing.rows[0]?.target_path) !== input.target || String(existing.rows[0]?.redirect_kind) !== "permanent") throw new Error(`Phase 80 redirect collision: ${input.source}`); return; }
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')", args: [stableId("phase80-redirect", input.source), input.batchId, input.actionId, input.source, input.target] });
}

async function resolveBrand(tx: Transaction): Promise<string> {
  const rows = await tx.execute({ sql: "SELECT id, type, slug, name FROM entities WHERE type = 'brand' AND (slug = 'visconti' OR lower(name) = 'visconti' OR name = '维斯康蒂 Visconti') ORDER BY id", args: [] });
  if (rows.rows.length > 1) throw new Error("Phase 80 Visconti brand lookup is ambiguous.");
  if (rows.rows.length === 1) {
    const row = rows.rows[0]; const id = String(row?.id);
    const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = 'visconti' AND id <> ?", args: [id] });
    if (collision.rows.length) throw new Error("Phase 80 Visconti canonical slug is occupied.");
    await tx.execute({ sql: "UPDATE entities SET slug = 'visconti', name = '维斯康蒂 Visconti', updated_at = datetime('now') WHERE id = ?", args: [id] });
    return id;
  }
  const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = 'visconti'", args: [] });
  if (collision.rows.length) throw new Error("Phase 80 cannot create Visconti: canonical slug is occupied.");
  await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'brand', 'visconti', '维斯康蒂 Visconti')", args: [PHASE80_VISCONTI_BRAND_FALLBACK_ID] });
  return PHASE80_VISCONTI_BRAND_FALLBACK_ID;
}

async function resolveOriginal(tx: Transaction): Promise<{ id: string; oldSlug: string }> {
  const rows = await tx.execute({ sql: `SELECT id, type, slug, name FROM entities WHERE type = 'pen' AND (slug IN (?, ?, ?) OR name IN ('维斯康蒂 Visconti Rembrandt伦勃朗', '维斯康蒂 Visconti Rembrandt', 'Visconti Rembrandt')) ORDER BY id`, args: [ORIGINAL_RAW_SLUG, PHASE80_REMBRANDT_ORIGINAL_SLUG, "visconti-rembrandt"] });
  if (rows.rows.length > 1) throw new Error("Phase 80 original Rembrandt lookup is ambiguous; do not merge Rembrandt-S or special editions.");
  if (rows.rows.length === 0) {
    const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ?", args: [PHASE80_REMBRANDT_ORIGINAL_SLUG] });
    if (collision.rows.length) throw new Error("Phase 80 original Rembrandt canonical slug is occupied.");
    await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [PHASE80_REMBRANDT_ORIGINAL_FALLBACK_ID, PHASE80_REMBRANDT_ORIGINAL_SLUG, "维斯康蒂 Visconti Rembrandt（原始款，2009）"] });
    return { id: PHASE80_REMBRANDT_ORIGINAL_FALLBACK_ID, oldSlug: PHASE80_REMBRANDT_ORIGINAL_SLUG };
  }
  const row = rows.rows[0]; const id = String(row?.id); const oldSlug = String(row?.slug);
  if (oldSlug !== ORIGINAL_RAW_SLUG && oldSlug !== PHASE80_REMBRANDT_ORIGINAL_SLUG && oldSlug !== "visconti-rembrandt") throw new Error(`Phase 80 unexpected original Rembrandt slug: ${oldSlug}`);
  const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [PHASE80_REMBRANDT_ORIGINAL_SLUG, id] });
  if (collision.rows.length) throw new Error("Phase 80 original Rembrandt canonical slug collides.");
  await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: [PHASE80_REMBRANDT_ORIGINAL_SLUG, "维斯康蒂 Visconti Rembrandt（原始款，2009）", id] });
  return { id, oldSlug };
}

async function resolveS(tx: Transaction): Promise<string> {
  const rows = await tx.execute({ sql: `SELECT id, type, slug, name FROM entities WHERE type = 'pen' AND (slug IN (?, ?) OR lower(name) IN ('visconti rembrandt-s', 'visconti rembrandt s') OR name = '维斯康蒂 Visconti Rembrandt-S') ORDER BY id`, args: [PHASE80_REMBRANDT_S_SLUG, "visconti-rembrandt-s"] });
  if (rows.rows.length > 1) throw new Error("Phase 80 Rembrandt-S lookup is ambiguous; retain separately until every candidate is identified.");
  if (rows.rows.length === 0) {
    const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ?", args: [PHASE80_REMBRANDT_S_SLUG] });
    if (collision.rows.length) throw new Error("Phase 80 cannot create Rembrandt-S: canonical slug is occupied.");
    await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [PHASE80_REMBRANDT_S_FALLBACK_ID, PHASE80_REMBRANDT_S_SLUG, "维斯康蒂 Visconti Rembrandt-S（2022）"] });
    return PHASE80_REMBRANDT_S_FALLBACK_ID;
  }
  const row = rows.rows[0]; const id = String(row?.id); const slug = String(row?.slug);
  if (slug !== PHASE80_REMBRANDT_S_SLUG) {
    const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [PHASE80_REMBRANDT_S_SLUG, id] });
    if (collision.rows.length) throw new Error("Phase 80 Rembrandt-S canonical slug collides.");
    await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: [PHASE80_REMBRANDT_S_SLUG, "维斯康蒂 Visconti Rembrandt-S（2022）", id] });
  }
  return id;
}

async function linkMaker(tx: Transaction, penId: string, brandId: string): Promise<void> {
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [penId, brandId] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase80-made-by", `${penId}:${brandId}`), penId, brandId, "Phase 80 exact Visconti Rembrandt maker relation"] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase80-reverse", `${brandId}:${penId}`), brandId, penId, "Phase 80 Visconti-to-Rembrandt navigation"] });
  const makers = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [penId] });
  if (makers.rows.length !== 1 || String(makers.rows[0]?.target_id) !== brandId) throw new Error("Phase 80 Rembrandt maker topology is ambiguous.");
}

async function prepareTopology(client: Client): Promise<{ brandId: string; originalId: string; sId: string }> {
  const tx = await client.transaction("write");
  try {
    const brandId = await resolveBrand(tx); const original = await resolveOriginal(tx); const sId = await resolveS(tx);
    if (new Set([brandId, original.id, sId]).size !== 3) throw new Error("Phase 80 resolved multiple Visconti identities to one entity.");
    await linkMaker(tx, original.id, brandId); await linkMaker(tx, sId, brandId);
    if (original.oldSlug !== PHASE80_REMBRANDT_ORIGINAL_SLUG) {
      const key = "phase80-visconti-rembrandt-original-canonical-rename"; const batchId = stableId("phase80-batch", key); const actionId = stableId("phase80-action", key);
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, key, digest(key), "Canonicalize the exact original Rembrandt placeholder without absorbing Rembrandt-S or adjacent Visconti lines."] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, original.oldSlug, digest(`${original.id}:${original.oldSlug}:${PHASE80_REMBRANDT_ORIGINAL_SLUG}`), original.id, original.id, "Canonicalize only the verified 2009 original Rembrandt route."] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)", args: [stableId("phase80-lineage", original.id), batchId, actionId, original.id, original.id] });
      await installRedirect(tx, { source: `/pen/${original.oldSlug}`, target: `/pen/${PHASE80_REMBRANDT_ORIGINAL_SLUG}`, batchId, actionId });
    }
    await tx.commit(); return { brandId, originalId: original.id, sId };
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase80ViscontiRembrandtContent(client: Client, options: ApplyPhase80Options): Promise<ApplyPhase80Result> {
  await assertOwned(client, options); const ids = await prepareTopology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase80ViscontiRembrandtPacks(ids.brandId, ids.originalId, ids.sId)));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}

function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = cliValue("--database"); const ownedRoot = cliValue("--owned-root"); const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase80-visconti-rembrandt-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { const result = await applyPhase80ViscontiRembrandtContent(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase80-visconti-rembrandt", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
