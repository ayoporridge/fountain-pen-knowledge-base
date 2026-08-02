import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE351_CAPODIMONTE_ID, PHASE351_CAPODIMONTE_SLUG, PHASE351_GIOIA_BRAND_ID, phase351GioiaCapodimontePacks } from "./data/phase351-gioia-capodimonte";

export type ApplyPhase351Options = ApplyPhase22Options;
export type ApplyPhase351Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(options: ApplyPhase351Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) throw new Error(`Phase 351 refuses inherited remote database selection: ${key}.`);
  }
}

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase351Options): Promise<void> {
  assertNoRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root) || database === protectedPath || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 351 owned catalog authority check failed.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 351 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 351 owned copy must be migrated through 032.");
}

async function assertIdentity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  if (packs.length !== 2 || !packs.some((pack) => pack.entityId === PHASE351_GIOIA_BRAND_ID) || !packs.some((pack) => pack.entityId === PHASE351_CAPODIMONTE_ID)) throw new Error("Phase 351 Gioia packs are incomplete.");
  const brand = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [PHASE351_GIOIA_BRAND_ID, "gioia"]);
  if (brand.length > 1 || (brand.length === 1 && (brand[0]?.id !== PHASE351_GIOIA_BRAND_ID || brand[0]?.type !== "brand" || brand[0]?.slug !== "gioia" || brand[0]?.name !== "Gioia Pen Italia 乔亚"))) throw new Error(`Phase 351 brand identity collision: ${JSON.stringify(brand)}`);
  const model = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [PHASE351_CAPODIMONTE_ID, PHASE351_CAPODIMONTE_SLUG]);
  if (model.length > 1 || (model.length === 1 && (model[0]?.id !== PHASE351_CAPODIMONTE_ID || model[0]?.type !== "pen" || model[0]?.slug !== PHASE351_CAPODIMONTE_SLUG || model[0]?.name !== "Gioia Capodimonte Kawari"))) throw new Error(`Phase 351 Capodimonte identity collision: ${JSON.stringify(model)}`);
}

async function prepareTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'brand', ?, ?)", args: [PHASE351_GIOIA_BRAND_ID, "gioia", "Gioia Pen Italia 乔亚"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [PHASE351_CAPODIMONTE_ID, PHASE351_CAPODIMONTE_SLUG, "Gioia Capodimonte Kawari"] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [PHASE351_CAPODIMONTE_ID, PHASE351_GIOIA_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: ["phase351-made-by-gioia-capodimonte", PHASE351_CAPODIMONTE_ID, PHASE351_GIOIA_BRAND_ID, "Phase 351 verified Gioia Capodimonte Kawari maker relation"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: ["phase351-reverse-gioia-capodimonte", PHASE351_GIOIA_BRAND_ID, PHASE351_CAPODIMONTE_ID, "Phase 351 Gioia navigation to Capodimonte Kawari"] });
    const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [PHASE351_CAPODIMONTE_ID] });
    if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE351_GIOIA_BRAND_ID) throw new Error("Phase 351 Capodimonte maker topology is ambiguous.");
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase351GioiaCapodimonteContent(client: Client, options: ApplyPhase351Options): Promise<ApplyPhase351Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 351 reviewer must not be empty.");
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase351GioiaCapodimontePacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await assertIdentity(client, packs);
  await prepareTopology(client);
  const result = await applyCuratedContentPacks(client, options, phase351GioiaCapodimontePacks);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase351-gioia-capodimonte-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <catalog> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase351GioiaCapodimonteContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: cliValue("--reviewer") ?? "phase351-gioia-capodimonte",
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
