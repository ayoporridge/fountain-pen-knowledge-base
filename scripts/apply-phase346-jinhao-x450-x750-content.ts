import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE346_X450_ID, PHASE346_X450_SLUG, PHASE346_X750_ID, PHASE346_X750_SLUG, phase346JinhaoX450X750Packs } from "./data/phase346-jinhao-x450-x750";
import { PHASE63_JINHAO_BRAND_ID } from "./data/phase63-jinhao-split";

export type ApplyPhase346Options = ApplyPhase22Options;
export type ApplyPhase346Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(options: ApplyPhase346Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) throw new Error(`Phase 346 refuses inherited remote database selection: ${key}.`);
  }
}

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase346Options): Promise<void> {
  assertNoRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root) || database === protectedPath || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 346 owned catalog authority check failed.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 346 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 346 owned copy must be migrated through 032.");
}

async function assertIdentity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  if (packs.length !== 3 || !packs.some((pack) => pack.entityId === PHASE63_JINHAO_BRAND_ID) || !packs.some((pack) => pack.entityId === PHASE346_X450_ID) || !packs.some((pack) => pack.entityId === PHASE346_X750_ID)) throw new Error("Phase 346 Jinhao packs are incomplete.");
  const brand = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [PHASE63_JINHAO_BRAND_ID, "jinhao"]);
  if (brand.length !== 1 || brand[0]?.id !== PHASE63_JINHAO_BRAND_ID || brand[0]?.type !== "brand" || brand[0]?.slug !== "jinhao" || brand[0]?.name !== "金豪 Jinhao") throw new Error(`Phase 346 Jinhao brand identity is not the existing canonical brand: ${JSON.stringify(brand)}`);
  for (const [id, slug, name] of [[PHASE346_X450_ID, PHASE346_X450_SLUG, "金豪 Jinhao X450"], [PHASE346_X750_ID, PHASE346_X750_SLUG, "金豪 Jinhao X750"]] as const) {
    const model = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [id, slug]);
    if (model.length > 1 || (model.length === 1 && (model[0]?.id !== id || model[0]?.type !== "pen" || model[0]?.slug !== slug || model[0]?.name !== name))) throw new Error(`Phase 346 model identity collision: ${JSON.stringify(model)}`);
  }
}

async function prepareTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    for (const [id, slug, name] of [[PHASE346_X450_ID, PHASE346_X450_SLUG, "金豪 Jinhao X450"], [PHASE346_X750_ID, PHASE346_X750_SLUG, "金豪 Jinhao X750"]] as const) {
      await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [id, slug, name] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [id, PHASE63_JINHAO_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [`phase346-made-by-${slug}`, id, PHASE63_JINHAO_BRAND_ID, `Phase 346 verified Jinhao ${slug} maker relation`] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [`phase346-reverse-${slug}`, PHASE63_JINHAO_BRAND_ID, id, `Phase 346 Jinhao brand-to-${slug} navigation`] });
      const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [id] });
      if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE63_JINHAO_BRAND_ID) throw new Error(`Phase 346 ${slug} maker topology is ambiguous.`);
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase346JinhaoX450X750Content(client: Client, options: ApplyPhase346Options): Promise<ApplyPhase346Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 346 reviewer must not be empty.");
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase346JinhaoX450X750Packs.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await assertIdentity(client, packs);
  await prepareTopology(client);
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase346-jinhao-x450-x750-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <catalog> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase346JinhaoX450X750Content(client, {
      workspaceRoot: process.cwd(),
      reviewer: cliValue("--reviewer") ?? "phase346-jinhao-x450-x750",
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
