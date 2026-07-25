import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import type { ApplyPhase22Options } from "./apply-phase22-content";

export const PHASE236_SAIER_ID = "kBv3hmJfi366";
export const PHASE236_SAIER_SLUG = "saier";
export const PHASE236_SAIER_NIB_ID = "q3zuCzJLQmZl";

const SOURCE_KEY = "phase236-saier-brand-retirement";
const SOURCE_NOTE = "Saier brand shell has no verified pen model or brand catalogue; retain the separate nib lead but hard-404 the unsupported brand route.";

export interface ApplyPhase236Options extends ApplyPhase22Options {}
export interface ApplyPhase236Result { entityId: string; outcome: "retired" | "noop"; }

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 236 refuses inherited remote selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase236Options): Promise<void> {
  assertNoRemote(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 236 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 236 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 236 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 236 owned copy must be migrated through 032.");
}

async function retire(tx: Transaction): Promise<ApplyPhase236Result["outcome"]> {
  const identity = await tx.execute({ sql: "SELECT type,slug,name FROM entities WHERE id=?", args: [PHASE236_SAIER_ID] });
  if (identity.rows.length !== 1 || String(identity.rows[0]?.type) !== "brand" || String(identity.rows[0]?.slug) !== PHASE236_SAIER_SLUG || String(identity.rows[0]?.name) !== "塞尔 (Saier)") throw new Error("Phase 236 Saier brand identity mismatch.");
  const nib = await tx.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [PHASE236_SAIER_NIB_ID] });
  if (nib.rows.length !== 1 || String(nib.rows[0]?.type) !== "nib" || String(nib.rows[0]?.slug) !== "塞尔-3-0-ef尖") throw new Error("Phase 236 Saier nib identity mismatch.");
  const links = await tx.execute({ sql: "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? OR target_id=?", args: [PHASE236_SAIER_ID, PHASE236_SAIER_ID] });
  for (const link of links.rows) {
    const allowed = (String(link.source_id) === PHASE236_SAIER_ID && String(link.target_id) === PHASE236_SAIER_NIB_ID && String(link.link_type) === "reverse") || (String(link.source_id) === PHASE236_SAIER_NIB_ID && String(link.target_id) === PHASE236_SAIER_ID && String(link.link_type) === "related_to");
    if (!allowed) throw new Error(`Phase 236 refuses unexpected Saier topology: ${JSON.stringify(link)}`);
  }
  const publishedStories = await tx.execute({ sql: "SELECT count(*) AS value FROM stories WHERE entity_id=? AND status='published'", args: [PHASE236_SAIER_ID] });
  if (Number(publishedStories.rows[0]?.value ?? 0) !== 0) throw new Error("Phase 236 refuses a Saier brand with a published story.");
  const sourcePath = `/brand/${PHASE236_SAIER_SLUG}`;
  const redirect = await tx.execute({ sql: "SELECT redirect_kind,target_path FROM entity_redirects WHERE source_path=?", args: [sourcePath] });
  const action = await tx.execute({ sql: "SELECT id FROM taxonomy_actions WHERE source_row_key=? AND action_kind='retire'", args: [SOURCE_KEY] });
  const publication = await tx.execute({ sql: "SELECT status FROM entity_publications WHERE entity_id=?", args: [PHASE236_SAIER_ID] });
  if (action.rows.length === 1 && redirect.rows.length === 1 && String(redirect.rows[0]?.redirect_kind) === "hard_404" && redirect.rows[0]?.target_path == null && String(publication.rows[0]?.status) === "retired" && links.rows.length === 0) return "noop";
  const batchId = stableId("phase236-batch", SOURCE_KEY); const actionId = stableId("phase236-action", SOURCE_KEY);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id,source_key,source_checksum,status,note) VALUES (?,?,?,'applied',?)", args: [batchId, SOURCE_KEY, digest(SOURCE_KEY), SOURCE_NOTE] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES (?,?,?,'retire',?,?,NULL,'applied',?)", args: [actionId, batchId, SOURCE_KEY, digest(`${SOURCE_KEY}\0${PHASE236_SAIER_ID}\0retire`), PHASE236_SAIER_ID, SOURCE_NOTE] });
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? OR target_id=?", args: [PHASE236_SAIER_ID, PHASE236_SAIER_ID] });
  await tx.execute({ sql: "UPDATE entity_publications SET status='retired',blockers_json=?,approved_content_hash=NULL,reviewed_content_revision=NULL,reviewed_contract_version=NULL,reviewed_by=NULL,reviewed_at=NULL,published_at=NULL,review_notes=?,updated_at=datetime('now') WHERE entity_id=?", args: ['["taxonomy_identity_unresolved"]', SOURCE_NOTE, PHASE236_SAIER_ID] });
  if (redirect.rows.length > 0 && (redirect.rows.length !== 1 || String(redirect.rows[0]?.redirect_kind) !== "hard_404" || redirect.rows[0]?.target_path != null)) throw new Error("Phase 236 conflicting Saier brand redirect.");
  if (redirect.rows.length === 0) await tx.execute({ sql: "INSERT INTO entity_redirects (id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES (?,?,?, ?,NULL,'hard_404',?)", args: [stableId("phase236-redirect", sourcePath), batchId, actionId, sourcePath, "unsupported_brand_shell_retired; no verified pen model or catalogue"] });
  return "retired";
}

export async function applyPhase236SaierBrandRetirement(client: Client, options: ApplyPhase236Options): Promise<ApplyPhase236Result> {
  await assertOwned(client, options); const tx = await client.transaction("write");
  try { const outcome = await retire(tx); await tx.commit(); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return { entityId: PHASE236_SAIER_ID, outcome }; }
  catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase236-saier-brand-retirement.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try { process.stdout.write(`${JSON.stringify(await applyPhase236SaierBrandRetirement(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase236-saier-retirement", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
