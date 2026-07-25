import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE200_LECOULE_POWER_STONE_ID, PHASE200_SAILOR_BRAND_ID, phase200SailorLecoulePowerStonePacks } from "./data/phase200-sailor-lecoule-power-stone";

export type ApplyPhase200Options = ApplyPhase22Options;
export type ApplyPhase200Result = ApplyPhase22Result;
const TARGET = { id: PHASE200_LECOULE_POWER_STONE_ID, type: "pen", slug: "写乐-sailor-转运石", name: "写乐 Sailor Lecoule Power Stone Color（转运石）" } as const;
function stableId(prefix: string, value: string): string { return `${prefix}-${createHash("sha256").update(`${prefix}\0${value}`).digest("hex").slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function noRemote(options: ApplyPhase200Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 200 refuses inherited remote database selection: ${key}.`); }
async function authority(client: Client, options: ApplyPhase200Options): Promise<void> {
  noRemote(options); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 200 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 200 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 200 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 200 owned copy must be migrated through 032.");
}
async function identity(client: Client): Promise<void> {
  const brand = await client.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [PHASE200_SAILOR_BRAND_ID] });
  if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "sailor") throw new Error("Phase 200 Sailor brand identity mismatch.");
  const row = await client.execute({ sql: "SELECT type,slug,name FROM entities WHERE id=?", args: [TARGET.id] });
  if (row.rows.length !== 1 || String(row.rows[0]?.type) !== TARGET.type || String(row.rows[0]?.slug) !== TARGET.slug) throw new Error(`Phase 200 identity mismatch: ${JSON.stringify(row.rows)}`);
}
async function topology(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    const madeById = stableId("phase200-made-by", TARGET.id); const reverseId = stableId("phase200-reverse", TARGET.id);
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [TARGET.id, PHASE200_SAILOR_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [madeById, TARGET.id, PHASE200_SAILOR_BRAND_ID, "Phase 200 verified Sailor Lecoule Power Stone maker relation"] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse' AND id<>?", args: [PHASE200_SAILOR_BRAND_ID, TARGET.id, reverseId] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [reverseId, PHASE200_SAILOR_BRAND_ID, TARGET.id, "Phase 200 Sailor brand navigation to Lecoule Power Stone"] });
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase200SailorLecoulePowerStoneContent(client: Client, options: ApplyPhase200Options): Promise<ApplyPhase200Result> {
  await authority(client, options); await identity(client); await topology(client);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase200SailorLecoulePowerStonePacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  const result = await applyCuratedContentPacks(client, options, packs); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}
function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase200-sailor-lecoule-power-stone-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try { const result = await applyPhase200SailorLecoulePowerStoneContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase200-sailor-lecoule-power-stone", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
const invokedPath = process.argv[1] ? fs.realpathSync.native(path.resolve(process.argv[1])) : null; const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url));
if (invokedPath === modulePath) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
