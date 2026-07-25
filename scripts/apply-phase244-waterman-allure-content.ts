import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE244_PEN_ID, PHASE244_PEN_SLUG, PHASE244_WATERMAN_ID, phase244WatermanAllurePacks } from "./data/phase244-waterman-allure";

export type ApplyPhase244Options = ApplyPhase22Options;
export type ApplyPhase244Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(options: ApplyPhase244Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) throw new Error(`Phase 244 refuses inherited remote database selection: ${key}.`);
  }
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase244Options): Promise<void> {
  assertNoRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, ownedRoot)) throw new Error("Phase 244 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 244 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 244 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 244 owned copy must be migrated through 032.");
}

async function assertIdentity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const brand = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=?", [PHASE244_WATERMAN_ID]);
  if (brand.length !== 1 || brand[0]?.type !== "brand" || brand[0]?.slug !== "waterman") throw new Error(`Phase 244 Waterman identity mismatch: ${JSON.stringify(brand)}`);
  const penPack = packs.find((pack) => pack.entityId === PHASE244_PEN_ID);
  if (!penPack) throw new Error("Phase 244 Allure pack is missing.");
  const existing = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [PHASE244_PEN_ID, PHASE244_PEN_SLUG]);
  if (existing.length === 0) return;
  const row = existing[0];
  if (existing.length !== 1 || row?.id !== PHASE244_PEN_ID || row.type !== penPack.expectedType || row.slug !== penPack.expectedSlug || row.name !== penPack.canonicalName) throw new Error(`Phase 244 Allure identity collision: ${JSON.stringify(existing)}`);
}

async function prepareTopology(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const pen = packs.find((pack) => pack.entityId === PHASE244_PEN_ID);
  if (!pen) throw new Error("Phase 244 Allure pack is missing.");
  const tx = await client.transaction("write");
  try {
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?,?,?,?)", args: [pen.entityId, pen.expectedType, pen.expectedSlug, pen.canonicalName] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [pen.entityId, PHASE244_WATERMAN_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: ["phase244-made-by-waterman-allure", pen.entityId, PHASE244_WATERMAN_ID, "Phase 244 verified Waterman Allure maker relation"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: ["phase244-reverse-waterman-allure", PHASE244_WATERMAN_ID, pen.entityId, "Phase 244 Waterman brand navigation"] });
    const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [pen.entityId] });
    if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE244_WATERMAN_ID) throw new Error("Phase 244 Allure maker topology is ambiguous.");
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase244WatermanAllureContent(client: Client, options: ApplyPhase244Options): Promise<ApplyPhase244Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 244 reviewer must not be empty.");
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase244WatermanAllurePacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await assertIdentity(client, packs);
  await prepareTopology(client, packs);
  const result = await applyCuratedContentPacks(client, options, packs);
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase244-waterman-allure-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase244WatermanAllureContent(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase244-waterman-allure", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
