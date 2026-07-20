import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import {
  PHASE83_ALLURE_FALLBACK_ID,
  PHASE83_ALLURE_SLUG,
  PHASE83_CARENE_ID,
  PHASE83_EXPERT_ID,
  PHASE83_HEMISPHERE_ID,
  PHASE83_WATERMAN_BRAND_ID,
  phase83WatermanCurrentPacks,
} from "./data/phase83-waterman-current";

export type ApplyPhase83Options = ApplyPhase22Options;
export type ApplyPhase83Result = ApplyPhase22Result;

function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string) { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string) { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemoteSelection(env: NodeJS.ProcessEnv) { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 83 refuses inherited remote database selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase83Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, root)) throw new Error("Phase 83 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 83 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 83 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 83 owned copy must be migrated through 032.");
}

type AllureIdentity = { id: string; oldSlug: string | null; created: boolean };

async function requireFixed(tx: Transaction, id: string, slug: string, name: string): Promise<void> {
  const rows = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [id] });
  if (rows.rows.length !== 1 || String(rows.rows[0]?.type) !== (id === PHASE83_WATERMAN_BRAND_ID ? "brand" : "pen")) throw new Error(`Phase 83 expected existing Waterman identity is missing: ${id}.`);
  const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [slug, id] });
  if (collision.rows.length) throw new Error(`Phase 83 Waterman slug collision: ${slug}.`);
  await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: [slug, name, id] });
}

async function resolveAllure(tx: Transaction): Promise<AllureIdentity> {
  const candidates = await tx.execute({ sql: `SELECT id, slug, name FROM entities WHERE type = 'pen' AND (slug IN (?, ?, ?) OR lower(trim(name)) IN (?, ?, ?)) ORDER BY id`, args: [PHASE83_ALLURE_SLUG, "威迪文-waterman-allure", "waterman-allure-fountain-pen", "waterman allure", "waterman allure fountain pen", "威迪文 waterman allure"] });
  if (candidates.rows.length > 1) throw new Error("Phase 83 found more than one exact Waterman Allure candidate; resolve those identities before publishing.");
  if (candidates.rows.length === 0) {
    const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE id = ? OR slug = ?", args: [PHASE83_ALLURE_FALLBACK_ID, PHASE83_ALLURE_SLUG] });
    if (collision.rows.length) throw new Error("Phase 83 Allure fallback identity collides.");
    await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [PHASE83_ALLURE_FALLBACK_ID, PHASE83_ALLURE_SLUG, "威迪文 Waterman Allure"] });
    return { id: PHASE83_ALLURE_FALLBACK_ID, oldSlug: null, created: true };
  }
  const row = candidates.rows[0]!; const id = String(row.id); const oldSlug = String(row.slug);
  const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [PHASE83_ALLURE_SLUG, id] });
  if (collision.rows.length) throw new Error("Phase 83 Allure canonical slug collides.");
  await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: [PHASE83_ALLURE_SLUG, "威迪文 Waterman Allure", id] });
  return { id, oldSlug, created: false };
}

async function maker(tx: Transaction, penId: string): Promise<void> {
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [penId, PHASE83_WATERMAN_BRAND_ID] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase83-waterman-maker", penId), penId, PHASE83_WATERMAN_BRAND_ID, "Phase 83 exact Waterman current-series maker relation"] });
  const links = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [penId] });
  if (links.rows.length !== 1 || String(links.rows[0]?.target_id) !== PHASE83_WATERMAN_BRAND_ID) throw new Error("Phase 83 Waterman maker topology is ambiguous.");
}

async function syncBrandNavigation(tx: Transaction): Promise<void> {
  const rows = await tx.execute({ sql: "SELECT source_id FROM entity_links WHERE target_id = ? AND link_type = 'made_by' ORDER BY source_id", args: [PHASE83_WATERMAN_BRAND_ID] });
  for (const row of rows.rows) {
    const penId = String(row.source_id);
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase83-waterman-reverse", penId), PHASE83_WATERMAN_BRAND_ID, penId, "Phase 83 Waterman brand-to-model navigation for every exact maker relation"] });
  }
}

async function installRenameRedirect(tx: Transaction, allure: AllureIdentity): Promise<void> {
  if (allure.created || !allure.oldSlug || allure.oldSlug === PHASE83_ALLURE_SLUG) return;
  const source = `/pen/${allure.oldSlug}`; const target = `/pen/${PHASE83_ALLURE_SLUG}`;
  const batchKey = "phase83-waterman-allure-exact-route-rename"; const batchId = stableId("phase83-batch", batchKey); const actionId = stableId("phase83-action", `${allure.id}:${allure.oldSlug}`);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, batchKey, digest(batchKey), "Canonicalize only an exact Waterman Allure pen row; do not merge Deluxe, Pastel, Graduate, Impression, rollerball or ballpoint entries."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, allure.oldSlug, digest(`${allure.id}:${allure.oldSlug}:${PHASE83_ALLURE_SLUG}`), allure.id, allure.id, "Rename the exact Allure fountain-pen candidate only."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)", args: [stableId("phase83-lineage", allure.id), batchId, actionId, allure.id, allure.id] });
  const existing = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [source] });
  if (!existing.rows.length) await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')", args: [stableId("phase83-redirect", source), batchId, actionId, source, target] });
  else if (existing.rows.length !== 1 || String(existing.rows[0]?.target_path) !== target || String(existing.rows[0]?.redirect_kind) !== "permanent") throw new Error("Phase 83 Allure old route has a conflicting redirect.");
}

async function prepareTopology(client: Client): Promise<string> {
  const tx = await client.transaction("write");
  try {
    await requireFixed(tx, PHASE83_WATERMAN_BRAND_ID, "waterman", "威迪文 Waterman");
    await requireFixed(tx, PHASE83_CARENE_ID, "waterman-carene", "威迪文 Waterman Carène");
    await requireFixed(tx, PHASE83_EXPERT_ID, "waterman-expert", "威迪文 Waterman Expert");
    await requireFixed(tx, PHASE83_HEMISPHERE_ID, "waterman-hemisphere", "威迪文 Waterman Hémisphère");
    const allure = await resolveAllure(tx);
    for (const penId of [PHASE83_CARENE_ID, PHASE83_EXPERT_ID, PHASE83_HEMISPHERE_ID, allure.id]) await maker(tx, penId);
    await syncBrandNavigation(tx); await installRenameRedirect(tx, allure); await tx.commit(); return allure.id;
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase83WatermanCurrentContent(client: Client, options: ApplyPhase83Options): Promise<ApplyPhase83Result> {
  await assertOwned(client, options); const allureId = await prepareTopology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase83WatermanCurrentPacks(allureId)));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}

function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = cliValue("--database"); const ownedRoot = cliValue("--owned-root"); const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase83-waterman-current-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { const result = await applyPhase83WatermanCurrentContent(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase83-waterman-current", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
