import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE217_LILY_910_ID, PHASE217_LILY_910_SLUG, PHASE217_LILY_BRAND_ID, phase217Lily910Packs } from "./data/phase217-lily-910";

export type ApplyPhase217Options = ApplyPhase22Options;
export type ApplyPhase217Result = ApplyPhase22Result;
function stableId(prefix: string, value: string): string { return `${prefix}-${createHash("sha256").update(`${prefix}\0${value}`).digest("hex").slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function noRemote(options: ApplyPhase217Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 217 refuses inherited remote database selection: ${key}.`); }
async function authority(client: Client, options: ApplyPhase217Options): Promise<void> {
  noRemote(options); if (!options.reviewer.trim()) throw new Error("Phase 217 reviewer must not be empty."); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 217 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || Number(own.nlink) !== 1 || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 217 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main"); if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 217 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] }); if (migration.rows.length !== 1) throw new Error("Phase 217 owned copy must be migrated through 032.");
}
async function identity(client: Client): Promise<void> {
  const rows = await client.execute({ sql: "SELECT id,type,slug FROM entities WHERE id IN (?,?) ORDER BY id", args: [PHASE217_LILY_BRAND_ID, PHASE217_LILY_910_ID] });
  const brand = rows.rows.find((row) => String(row.id) === PHASE217_LILY_BRAND_ID); const model = rows.rows.find((row) => String(row.id) === PHASE217_LILY_910_ID);
  if (!brand || String(brand.type) !== "brand" || String(brand.slug) !== "lily") throw new Error("Phase 217 Lily brand identity mismatch.");
  if (!model || String(model.type) !== "pen" || String(model.slug) !== PHASE217_LILY_910_SLUG) throw new Error("Phase 217 Lily 910 identity mismatch.");
}
async function topology(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    const madeBy = stableId("phase217-made-by", PHASE217_LILY_910_ID); const reverse = stableId("phase217-reverse", PHASE217_LILY_910_ID);
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [PHASE217_LILY_910_ID, PHASE217_LILY_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [madeBy, PHASE217_LILY_910_ID, PHASE217_LILY_BRAND_ID, "Phase 217 verified Lily 910 maker relation"] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse' AND id<>?", args: [PHASE217_LILY_BRAND_ID, PHASE217_LILY_910_ID, reverse] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [reverse, PHASE217_LILY_BRAND_ID, PHASE217_LILY_910_ID, "Phase 217 Lily brand navigation to 910"] });
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase217Lily910Content(client: Client, options: ApplyPhase217Options): Promise<ApplyPhase217Result> {
  await authority(client, options); await identity(client); await topology(client); const workspaceRoot = fs.realpathSync.native(options.workspaceRoot); const packs = phase217Lily910Packs.map((pack) => loadCuratedEntityPack(workspaceRoot, pack)); const result = await applyCuratedContentPacks(client, options, packs); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}
function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase217-lily-910-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try { const result = await applyPhase217Lily910Content(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase217-lily-910", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
const invokedPath = process.argv[1] ? fs.realpathSync.native(path.resolve(process.argv[1])) : null; const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url)); if (invokedPath === modulePath) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
