import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE268_MAGNA_ID, PHASE268_ONOTO_BRAND_ID, phase268OnotoMagnaPacks } from "./data/phase268-onoto-magna";

export type ApplyPhase268Options = ApplyPhase22Options;
export type ApplyPhase268Result = ApplyPhase22Result;
const TARGET = { id: PHASE268_MAGNA_ID, type: "pen", slug: "onoto-magna", name: "Onoto Magna" } as const;
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function noRemote(options: ApplyPhase268Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 268 refuses inherited remote database selection: ${key}.`); }
async function authority(client: Client, options: ApplyPhase268Options): Promise<void> {
  noRemote(options); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 268 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 268 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 268 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 268 owned copy must be migrated through 032.");
}
async function identity(client: Client): Promise<void> {
  const collision = await client.execute({ sql: "SELECT id,type,slug,name FROM entities WHERE slug IN (?,?) OR id IN (?,?)", args: ["onoto", TARGET.slug, PHASE268_ONOTO_BRAND_ID, TARGET.id] });
  if (collision.rows.some((row) => String(row.id) === PHASE268_ONOTO_BRAND_ID && (String(row.type) !== "brand" || String(row.slug) !== "onoto" || String(row.name) !== "Onoto"))) throw new Error(`Phase 268 Onoto brand identity collision: ${JSON.stringify(collision.rows)}`);
  if (collision.rows.some((row) => String(row.id) === TARGET.id && (String(row.type) !== TARGET.type || String(row.slug) !== TARGET.slug || String(row.name) !== TARGET.name))) throw new Error(`Phase 268 Onoto Magna identity collision: ${JSON.stringify(collision.rows)}`);
  if (collision.rows.some((row) => String(row.slug) === "onoto" && String(row.id) !== PHASE268_ONOTO_BRAND_ID)) throw new Error(`Phase 268 Onoto brand slug collision: ${JSON.stringify(collision.rows)}`);
  if (collision.rows.some((row) => String(row.slug) === TARGET.slug && String(row.id) !== TARGET.id)) throw new Error(`Phase 268 Onoto Magna slug collision: ${JSON.stringify(collision.rows)}`);
}
async function topology(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'brand', ?, ?)", args: [PHASE268_ONOTO_BRAND_ID, "onoto", "Onoto"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [TARGET.id, TARGET.slug, TARGET.name] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [TARGET.id, PHASE268_ONOTO_BRAND_ID] });
    const forwardId = `phase268-made-by-${TARGET.id}`;
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,?,?)", args: [forwardId, TARGET.id, PHASE268_ONOTO_BRAND_ID, "made_by", "Phase 268 verified Onoto Magna maker relation"] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='reverse' AND target_id=?", args: [PHASE268_ONOTO_BRAND_ID, TARGET.id] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,?,?)", args: [`rev-${forwardId}`, PHASE268_ONOTO_BRAND_ID, TARGET.id, "reverse", "Phase 268 Onoto brand navigation to Magna"] });
    const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [TARGET.id] });
    if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE268_ONOTO_BRAND_ID) throw new Error("Phase 268 Onoto Magna maker topology is ambiguous.");
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase268OnotoMagnaContent(client: Client, options: ApplyPhase268Options): Promise<ApplyPhase268Result> {
  await authority(client, options); await identity(client); await topology(client);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase268OnotoMagnaPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  const result = await applyCuratedContentPacks(client, options, packs); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}
function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase268-onoto-magna-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try { const result = await applyPhase268OnotoMagnaContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase268-onoto-magna", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
const invokedPath = process.argv[1] ? fs.realpathSync.native(path.resolve(process.argv[1])) : null; const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url));
if (invokedPath === modulePath) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
