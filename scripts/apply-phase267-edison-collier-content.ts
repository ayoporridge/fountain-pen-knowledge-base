import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE267_COLLIER_ID, PHASE267_EDISON_BRAND_ID, phase267EdisonCollierPacks } from "./data/phase267-edison-collier";

export type ApplyPhase267Options = ApplyPhase22Options;
export type ApplyPhase267Result = ApplyPhase22Result;
const TARGET = { id: PHASE267_COLLIER_ID, type: "pen", slug: "edison-collier", name: "Edison Collier" } as const;
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function noRemote(options: ApplyPhase267Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 267 refuses inherited remote database selection: ${key}.`); }
async function authority(client: Client, options: ApplyPhase267Options): Promise<void> {
  noRemote(options); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 267 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 267 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 267 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 267 owned copy must be migrated through 032.");
}
async function identity(client: Client): Promise<void> {
  const collision = await client.execute({ sql: "SELECT id,type,slug,name FROM entities WHERE slug IN (?,?) OR id IN (?,?)", args: ["edison-pen-co", TARGET.slug, PHASE267_EDISON_BRAND_ID, TARGET.id] });
  if (collision.rows.some((row) => String(row.id) === PHASE267_EDISON_BRAND_ID && (String(row.type) !== "brand" || String(row.slug) !== "edison-pen-co" || String(row.name) !== "Edison Pen Co"))) throw new Error(`Phase 267 Edison brand identity collision: ${JSON.stringify(collision.rows)}`);
  if (collision.rows.some((row) => String(row.id) === TARGET.id && (String(row.type) !== TARGET.type || String(row.slug) !== TARGET.slug || String(row.name) !== TARGET.name))) throw new Error(`Phase 267 Edison Collier identity collision: ${JSON.stringify(collision.rows)}`);
  if (collision.rows.some((row) => String(row.slug) === "edison-pen-co" && String(row.id) !== PHASE267_EDISON_BRAND_ID)) throw new Error(`Phase 267 Edison brand slug collision: ${JSON.stringify(collision.rows)}`);
  if (collision.rows.some((row) => String(row.slug) === TARGET.slug && String(row.id) !== TARGET.id)) throw new Error(`Phase 267 Edison Collier slug collision: ${JSON.stringify(collision.rows)}`);
}
async function topology(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'brand', ?, ?)", args: [PHASE267_EDISON_BRAND_ID, "edison-pen-co", "Edison Pen Co"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [TARGET.id, TARGET.slug, TARGET.name] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [TARGET.id, PHASE267_EDISON_BRAND_ID] });
    const forwardId = `phase267-made-by-${TARGET.id}`;
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,?,?)", args: [forwardId, TARGET.id, PHASE267_EDISON_BRAND_ID, "made_by", "Phase 267 verified Edison Pen Co maker relation"] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='reverse' AND target_id=?", args: [PHASE267_EDISON_BRAND_ID, TARGET.id] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,?,?)", args: [`rev-${forwardId}`, PHASE267_EDISON_BRAND_ID, TARGET.id, "reverse", "Phase 267 Edison brand navigation to Collier"] });
    const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [TARGET.id] });
    if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE267_EDISON_BRAND_ID) throw new Error("Phase 267 Edison Collier maker topology is ambiguous.");
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase267EdisonCollierContent(client: Client, options: ApplyPhase267Options): Promise<ApplyPhase267Result> {
  await authority(client, options); await identity(client); await topology(client);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase267EdisonCollierPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  const result = await applyCuratedContentPacks(client, options, packs); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}
function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase267-edison-collier-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try { const result = await applyPhase267EdisonCollierContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase267-edison-collier", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
const invokedPath = process.argv[1] ? fs.realpathSync.native(path.resolve(process.argv[1])) : null; const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url));
if (invokedPath === modulePath) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
