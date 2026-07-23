import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, type Transaction, createClient } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE145_IDS, phase145Packs } from "./data/phase145-waldmann-tuscany-batch";

export type ApplyPhase145Options = ApplyPhase22Options;
export type ApplyPhase145Result = ApplyPhase22Result;
function stableId(prefix: string, value: string): string { return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(options: ApplyPhase145Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 145 refuses inherited remote database selection: ${key}.`); }
async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) { return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row })); }
async function assertAuthority(client: Client, options: ApplyPhase145Options): Promise<void> {
  assertNoRemote(options); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, ownedRoot)) throw new Error("Phase 145 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true }); if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 145 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main"); if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 145 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] }); if (migration.rows.length !== 1) throw new Error("Phase 145 owned copy must be migrated through 032.");
}
async function preflight(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  for (const pack of packs) { const existing = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [pack.entityId, pack.expectedSlug]); if (existing.length === 0) continue; const row = existing[0]; if (existing.length !== 1 || row?.id !== pack.entityId || row.type !== pack.expectedType || row.slug !== pack.expectedSlug || row.name !== pack.canonicalName) throw new Error(`Phase 145 Waldmann identity collision: ${JSON.stringify(existing)}`); }
}
async function topology(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = packs.find((pack) => pack.expectedType === "brand"); if (!brand) throw new Error("Phase 145 Waldmann brand pack missing.");
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'brand', ?, ?)", args: [brand.entityId, brand.expectedSlug, brand.canonicalName] });
    for (const pack of packs.filter((candidate) => candidate.expectedType === "pen")) {
      await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [pack.entityId, pack.expectedSlug, pack.canonicalName] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [pack.entityId, PHASE145_IDS.brand] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [stableId("phase145-made-by", `${pack.entityId}:${PHASE145_IDS.brand}`), pack.entityId, PHASE145_IDS.brand, "Phase 145 verified Waldmann maker relation"] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [stableId("phase145-reverse", `${PHASE145_IDS.brand}:${pack.entityId}`), PHASE145_IDS.brand, pack.entityId, "Phase 145 public Waldmann model navigation"] });
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase145WaldmannTuscanyContent(client: Client, options: ApplyPhase145Options): Promise<ApplyPhase145Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 145 reviewer must not be empty.");
  await assertAuthority(client, options); const workspaceRoot = fs.realpathSync.native(options.workspaceRoot); const packs = phase145Packs.map((pack) => loadCuratedEntityPack(workspaceRoot, pack)); await preflight(client, packs); await topology(client, packs); const result = await applyCuratedContentPacks(client, options, packs); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}
function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> { const database = cliValue("--database"); const ownedRoot = cliValue("--owned-root"); const protectedCatalog = cliValue("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase145-waldmann-tuscany-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]"); const client = createClient({ url: `file:${path.resolve(database)}` }); try { const result = await applyPhase145WaldmannTuscanyContent(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase145-waldmann", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); } }
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
