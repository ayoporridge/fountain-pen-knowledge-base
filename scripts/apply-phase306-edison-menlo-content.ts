import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE306_EDISON_BRAND_ID, PHASE306_MENLO_ID, PHASE306_MENLO_SLUG, phase306EdisonMenloPacks } from "./data/phase306-edison-menlo";

export type ApplyPhase306Options = ApplyPhase22Options;
export type ApplyPhase306Result = ApplyPhase22Result;
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(options: ApplyPhase306Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 306 refuses inherited remote database selection: ${key}.`); }
async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) { return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row })); }
async function authority(client: Client, options: ApplyPhase306Options): Promise<void> {
  assertNoRemote(options); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 306 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 306 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main"); if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 306 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] }); if (migration.rows.length !== 1) throw new Error("Phase 306 owned copy must be migrated through 032.");
}
async function identity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const brand = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=?", [PHASE306_EDISON_BRAND_ID]); if (brand.length !== 1 || brand[0]?.type !== "brand" || brand[0]?.slug !== "edison-pen-co" || brand[0]?.name !== "Edison Pen Co") throw new Error(`Phase 306 Edison brand identity mismatch: ${JSON.stringify(brand)}`);
  const model = packs.find((pack) => pack.entityId === PHASE306_MENLO_ID); if (!model) throw new Error("Phase 306 Menlo pack missing.");
  const existing = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [PHASE306_MENLO_ID, PHASE306_MENLO_SLUG]); if (existing.length === 0) return; if (existing.length !== 1 || existing[0]?.id !== PHASE306_MENLO_ID || existing[0]?.type !== model.expectedType || existing[0]?.slug !== model.expectedSlug || existing[0]?.name !== model.canonicalName) throw new Error(`Phase 306 Menlo identity collision: ${JSON.stringify(existing)}`);
}
async function topology(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [PHASE306_MENLO_ID, PHASE306_MENLO_SLUG, "Edison Menlo"] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [PHASE306_MENLO_ID, PHASE306_EDISON_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: ["phase306-made-by-edison-menlo", PHASE306_MENLO_ID, PHASE306_EDISON_BRAND_ID, "Phase 306 verified Edison Pen Co maker relation"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: ["phase306-reverse-edison-menlo", PHASE306_EDISON_BRAND_ID, PHASE306_MENLO_ID, "Phase 306 Edison brand navigation to Menlo"] });
    const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [PHASE306_MENLO_ID] }); if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE306_EDISON_BRAND_ID) throw new Error("Phase 306 Menlo maker topology is ambiguous.");
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase306EdisonMenloContent(client: Client, options: ApplyPhase306Options): Promise<ApplyPhase306Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 306 reviewer must not be empty.");
  await authority(client, options); const workspaceRoot = fs.realpathSync.native(options.workspaceRoot); const packs = phase306EdisonMenloPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack)); await identity(client, packs); await topology(client); const result = await applyCuratedContentPacks(client, options, packs); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}
function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase306-edison-menlo-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try { const result = await applyPhase306EdisonMenloContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase306-edison-menlo", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
