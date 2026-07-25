import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import type { ApplyPhase22Options } from "./apply-phase22-content";

export const PHASE232_YISIHUA_ID = "mx3fnAnteiHS";
export const PHASE232_YISIHUA_SLUG = "yisihua";

export interface ApplyPhase232Options extends ApplyPhase22Options {}
export interface ApplyPhase232Result { entityId: string; outcome: "retired" | "noop"; }

const SOURCE_KEY = "phase232-yisihua-brand-retirement";
const SOURCE_NOTE = "YiSiHua brand shell has no remaining verified model or relationship after P36 moved to Asvine; retain entity for lineage but hard-404 the brand route.";

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 232 refuses inherited remote selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase232Options): Promise<void> {
  assertNoRemote(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 232 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 232 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 232 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 232 owned copy must be migrated through 032.");
}

async function ensureRetired(tx: Transaction): Promise<"retired" | "noop"> {
  const identity = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE232_YISIHUA_ID] });
  if (identity.rows.length !== 1 || String(identity.rows[0]?.type) !== "brand" || String(identity.rows[0]?.slug) !== PHASE232_YISIHUA_SLUG) throw new Error("Phase 232 YiSiHua legacy brand identity mismatch.");
  const sourcePath = `/brand/${PHASE232_YISIHUA_SLUG}`;
  const redirect = await tx.execute({ sql: "SELECT redirect_kind, target_path FROM entity_redirects WHERE source_path = ?", args: [sourcePath] });
  const action = await tx.execute({ sql: "SELECT id, batch_id, status FROM taxonomy_actions WHERE source_row_key = ? AND action_kind = 'retire'", args: [SOURCE_KEY] });
  const publication = await tx.execute({ sql: "SELECT status, blockers_json FROM entity_publications WHERE entity_id = ?", args: [PHASE232_YISIHUA_ID] });
  if (action.rows.length === 1 && redirect.rows.length === 1 && String(redirect.rows[0]?.redirect_kind) === "hard_404" && redirect.rows[0]?.target_path == null && String(publication.rows[0]?.status) === "retired") return "noop";
  const batchId = stableId("phase232-batch", SOURCE_KEY); const actionId = stableId("phase232-action", SOURCE_KEY); const actionChecksum = digest(`${SOURCE_KEY}\0${PHASE232_YISIHUA_ID}\0retire`);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, SOURCE_KEY, digest(SOURCE_KEY), SOURCE_NOTE] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'retire', ?, ?, NULL, 'applied', ?)", args: [actionId, batchId, SOURCE_KEY, actionChecksum, PHASE232_YISIHUA_ID, SOURCE_NOTE] });
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? OR target_id = ?", args: [PHASE232_YISIHUA_ID, PHASE232_YISIHUA_ID] });
  await tx.execute({ sql: "UPDATE entity_publications SET status = 'retired', blockers_json = ?, approved_content_hash = NULL, reviewed_content_revision = NULL, reviewed_contract_version = NULL, reviewed_by = NULL, reviewed_at = NULL, published_at = NULL, review_notes = ?, updated_at = datetime('now') WHERE entity_id = ?", args: ['["taxonomy_identity_unresolved"]', SOURCE_NOTE, PHASE232_YISIHUA_ID] });
  if (redirect.rows.length > 0 && (redirect.rows.length !== 1 || String(redirect.rows[0]?.redirect_kind) !== "hard_404" || redirect.rows[0]?.target_path != null)) throw new Error("Phase 232 conflicting YiSiHua brand redirect.");
  if (redirect.rows.length === 0) await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, NULL, 'hard_404', ?)", args: [stableId("phase232-redirect", sourcePath), batchId, actionId, sourcePath, "legacy_brand_shell_retired; no verified brand successor"] });
  return "retired";
}

export async function applyPhase232YisihuaBrandRetirement(client: Client, options: ApplyPhase232Options): Promise<ApplyPhase232Result> {
  await assertOwned(client, options);
  const tx = await client.transaction("write");
  try { const outcome = await ensureRetired(tx); await tx.commit(); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return { entityId: PHASE232_YISIHUA_ID, outcome }; }
  catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase232-yisihua-brand-retirement.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try { const result = await applyPhase232YisihuaBrandRetirement(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase232-yisihua-retirement", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
