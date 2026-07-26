import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE260_GRAVITAS_BRAND_ID, PHASE260_GRAVITAS_MODEL_ID, PHASE260_RANGA_BRAND_ID, PHASE260_RANGA_MODEL_ID, phase260RangaGravitasPacks } from "./data/phase260-ranga-gravitas";

export type ApplyPhase260Options = ApplyPhase22Options;
export type ApplyPhase260Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(options: ApplyPhase260Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 260 refuses inherited remote database selection: ${key}.`); }
async function rows(client: Client, sql: string, args: unknown[] = []) { return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row })); }
async function assertAuthority(client: Client, options: ApplyPhase260Options): Promise<void> {
  assertNoRemote(options); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath); const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true });
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root) || database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 260 owned catalog authority check failed.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main"); if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 260 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] }); if (migration.rows.length !== 1) throw new Error("Phase 260 owned copy must be migrated through 032.");
}
async function assertIdentity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  if (packs.length !== 4) throw new Error("Phase 260 Ranga/Gravitas packs are incomplete.");
  const expected = [
    [PHASE260_RANGA_BRAND_ID, "brand", "ranga", "Ranga Pens"],
    [PHASE260_RANGA_MODEL_ID, "pen", "ranga-model-3", "Ranga Model 3"],
    [PHASE260_GRAVITAS_BRAND_ID, "brand", "gravitas", "Gravitas Pens"],
    [PHASE260_GRAVITAS_MODEL_ID, "pen", "gravitas-ultemate-vac", "Gravitas Ultemate Vac"],
  ] as const;
  for (const [id, type, slug, name] of expected) {
    const found = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [id, slug]);
    if (found.length > 1 || (found.length === 1 && (found[0]?.id !== id || found[0]?.type !== type || found[0]?.slug !== slug || found[0]?.name !== name))) throw new Error(`Phase 260 identity collision: ${JSON.stringify(found)}`);
  }
}
async function prepareTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'brand', ?, ?)", args: [PHASE260_RANGA_BRAND_ID, "ranga", "Ranga Pens"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [PHASE260_RANGA_MODEL_ID, "ranga-model-3", "Ranga Model 3"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'brand', ?, ?)", args: [PHASE260_GRAVITAS_BRAND_ID, "gravitas", "Gravitas Pens"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [PHASE260_GRAVITAS_MODEL_ID, "gravitas-ultemate-vac", "Gravitas Ultemate Vac"] });
    for (const [model, brand, label] of [[PHASE260_RANGA_MODEL_ID, PHASE260_RANGA_BRAND_ID, "Ranga Model 3"], [PHASE260_GRAVITAS_MODEL_ID, PHASE260_GRAVITAS_BRAND_ID, "Gravitas Ultemate Vac"]] as const) {
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [model, brand] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [`phase260-made-by-${model}`, model, brand, `Phase 260 verified ${label} maker relation`] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [`phase260-reverse-${model}`, brand, model, `Phase 260 brand navigation for ${label}`] });
      const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [model] }); if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== brand) throw new Error(`Phase 260 ${label} maker topology is ambiguous.`);
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase260RangaGravitasContent(client: Client, options: ApplyPhase260Options): Promise<ApplyPhase260Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 260 reviewer must not be empty.");
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase260RangaGravitasPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await assertIdentity(client, packs); await prepareTopology(client);
  const rangaResult = await applyCuratedContentPacks(client, options, packs.filter((pack) => pack.entityId === PHASE260_RANGA_BRAND_ID || pack.entityId === PHASE260_RANGA_MODEL_ID));
  const gravitasResult = await applyCuratedContentPacks(client, options, packs.filter((pack) => pack.entityId === PHASE260_GRAVITAS_BRAND_ID || pack.entityId === PHASE260_GRAVITAS_MODEL_ID));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return { entities: [...rangaResult.entities, ...gravitasResult.entities] };
}
function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> { const database = cliValue("--database"); const ownedRoot = cliValue("--owned-root"); const protectedCatalog = cliValue("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase260-ranga-gravitas-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]"); const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` }); try { const result = await applyPhase260RangaGravitasContent(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase260-ranga-gravitas", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); } }
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
