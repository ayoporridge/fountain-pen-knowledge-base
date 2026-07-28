import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE315_PELIKAN_ID, PHASE315_TWIST_ID, PHASE315_TWIST_SLUG, phase315PelikanTwistP457Packs } from "./data/phase315-pelikan-twist-p457";

export type ApplyPhase315Options = ApplyPhase22Options;
export type ApplyPhase315Result = ApplyPhase22Result;
export { PHASE315_PELIKAN_ID, PHASE315_TWIST_ID, PHASE315_TWIST_SLUG };

function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(options: ApplyPhase315Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 315 refuses inherited remote database selection: ${key}.`); }
async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) { return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row })); }

async function authority(client: Client, options: ApplyPhase315Options): Promise<void> {
  assertNoRemote(options); if (!options.reviewer.trim()) throw new Error("Phase 315 reviewer must not be empty."); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, ownedRoot)) throw new Error("Phase 315 requires an owned, non-symlink catalog copy.");
  const ownedStat = fs.statSync(database, { bigint: true }); const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (ownedStat.dev === protectedStat.dev && ownedStat.ino === protectedStat.ino)) throw new Error("Phase 315 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 315 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 315 owned copy must be migrated through 032.");
}
async function identity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const brand = await rows(client, "SELECT id,type,slug FROM entities WHERE id=?", [PHASE315_PELIKAN_ID]);
  if (brand.length !== 1 || brand[0]?.type !== "brand" || brand[0]?.slug !== "pelikan") throw new Error(`Phase 315 Pelikan brand identity mismatch: ${JSON.stringify(brand)}`);
  const pack = packs.find((item) => item.entityId === PHASE315_TWIST_ID); if (!pack) throw new Error("Phase 315 Twist pack missing.");
  const existing = await rows(client, "SELECT id,type,slug FROM entities WHERE id=? OR slug=?", [PHASE315_TWIST_ID, PHASE315_TWIST_SLUG]);
  if (existing.length !== 1 || existing[0]?.id !== PHASE315_TWIST_ID || existing[0]?.type !== pack.expectedType || existing[0]?.slug !== pack.expectedSlug) throw new Error(`Phase 315 Twist identity mismatch: ${JSON.stringify(existing)}`);
}
async function topology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [PHASE315_TWIST_ID, PHASE315_PELIKAN_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: ["phase315-made-by-pelikan-twist-p457", PHASE315_TWIST_ID, PHASE315_PELIKAN_ID, "Phase 315 verified Pelikan Twist P457 maker relation"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: ["phase315-reverse-pelikan-twist-p457", PHASE315_PELIKAN_ID, PHASE315_TWIST_ID, "Phase 315 Pelikan brand navigation to Twist P457"] });
    const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [PHASE315_TWIST_ID] });
    if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE315_PELIKAN_ID) throw new Error("Phase 315 Twist maker topology is ambiguous.");
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase315PelikanTwistP457Content(client: Client, options: ApplyPhase315Options): Promise<ApplyPhase315Result> {
  await authority(client, options); const packs = phase315PelikanTwistP457Packs.map((pack) => loadCuratedEntityPack(fs.realpathSync.native(options.workspaceRoot), pack)); await identity(client, packs); await topology(client);
  const result = await applyCuratedContentPacks(client, options, packs); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}
function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase315-pelikan-twist-p457-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try { const result = await applyPhase315PelikanTwistP457Content(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase315-pelikan-twist-p457", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
