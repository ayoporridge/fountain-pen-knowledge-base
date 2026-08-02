import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import {
  PHASE348_IMPRONTE_ID,
  PHASE348_IMPRONTE_OVERSIZE_ID,
  PHASE348_IMPRONTE_OVERSIZE_SLUG,
  PHASE348_IMPRONTE_SLUG,
  PHASE348_MAIORA_BRAND_ID,
  phase348MaioraImprontePacks,
} from "./data/phase348-maiora-impronte";

export type ApplyPhase348Options = ApplyPhase22Options;
export type ApplyPhase348Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(options: ApplyPhase348Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) throw new Error(`Phase 348 refuses inherited remote database selection: ${key}.`);
  }
}

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase348Options): Promise<void> {
  assertNoRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    !fs.statSync(root).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !inside(database, root) ||
    database === protectedPath ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) throw new Error("Phase 348 owned catalog authority check failed.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 348 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 348 owned copy must be migrated through 032.");
}

async function assertIdentity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  if (
    packs.length !== 3 ||
    !packs.some((pack) => pack.entityId === PHASE348_MAIORA_BRAND_ID) ||
    !packs.some((pack) => pack.entityId === PHASE348_IMPRONTE_ID) ||
    !packs.some((pack) => pack.entityId === PHASE348_IMPRONTE_OVERSIZE_ID)
  ) throw new Error("Phase 348 Maiora packs are incomplete.");
  const expected = [
    [PHASE348_MAIORA_BRAND_ID, "brand", "maiora", "Maiora 玛奥拉"],
    [PHASE348_IMPRONTE_ID, "pen", PHASE348_IMPRONTE_SLUG, "Maiora Impronte"],
    [PHASE348_IMPRONTE_OVERSIZE_ID, "pen", PHASE348_IMPRONTE_OVERSIZE_SLUG, "Maiora Impronte Oversize"],
  ] as const;
  for (const [id, type, slug, name] of expected) {
    const matches = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [id, slug]);
    if (matches.length > 1 || (matches.length === 1 && (matches[0]?.id !== id || matches[0]?.type !== type || matches[0]?.slug !== slug || matches[0]?.name !== name))) {
      throw new Error(`Phase 348 identity collision for ${slug}: ${JSON.stringify(matches)}`);
    }
  }
}

async function prepareTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'brand', ?, ?)", args: [PHASE348_MAIORA_BRAND_ID, "maiora", "Maiora 玛奥拉"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [PHASE348_IMPRONTE_ID, PHASE348_IMPRONTE_SLUG, "Maiora Impronte"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [PHASE348_IMPRONTE_OVERSIZE_ID, PHASE348_IMPRONTE_OVERSIZE_SLUG, "Maiora Impronte Oversize"] });
    for (const [modelId, relationId, name] of [
      [PHASE348_IMPRONTE_ID, "phase348-made-by-maiora-impronte", "Maiora Impronte"],
      [PHASE348_IMPRONTE_OVERSIZE_ID, "phase348-made-by-maiora-impronte-oversize", "Maiora Impronte Oversize"],
    ] as const) {
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [modelId, PHASE348_MAIORA_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [relationId, modelId, PHASE348_MAIORA_BRAND_ID, `Phase 348 verified ${name} maker relation`] });
    }
    for (const [relationId, modelId, name] of [
      ["phase348-reverse-maiora-impronte", PHASE348_IMPRONTE_ID, "Impronte"],
      ["phase348-reverse-maiora-impronte-oversize", PHASE348_IMPRONTE_OVERSIZE_ID, "Impronte Oversize"],
    ] as const) {
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [relationId, PHASE348_MAIORA_BRAND_ID, modelId, `Phase 348 Maiora brand-to-${name} navigation`] });
    }
    for (const modelId of [PHASE348_IMPRONTE_ID, PHASE348_IMPRONTE_OVERSIZE_ID]) {
      const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [modelId] });
      if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE348_MAIORA_BRAND_ID) throw new Error(`Phase 348 maker topology is ambiguous for ${modelId}.`);
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase348MaioraImpronteContent(client: Client, options: ApplyPhase348Options): Promise<ApplyPhase348Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 348 reviewer must not be empty.");
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase348MaioraImprontePacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await assertIdentity(client, packs);
  await prepareTopology(client);
  const result = await applyCuratedContentPacks(client, options, phase348MaioraImprontePacks);
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase348-maiora-impronte-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <catalog> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase348MaioraImpronteContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: cliValue("--reviewer") ?? "phase348-maiora-impronte",
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
