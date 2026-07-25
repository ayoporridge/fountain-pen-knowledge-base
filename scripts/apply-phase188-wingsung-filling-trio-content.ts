import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { createClient, type Client, type Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import {
  PHASE188_618_ID,
  PHASE188_698_ID,
  PHASE188_699_ID,
  PHASE188_WINGSUNG_BRAND_ID,
  phase188WingsungFillingTrioPacks,
} from "./data/phase188-wingsung-filling-trio";

export type ApplyPhase188Options = ApplyPhase22Options;
export type ApplyPhase188Result = ApplyPhase22Result;

const TARGETS = [
  { id: PHASE188_618_ID, type: "pen", slug: "永生-wingsung-618", name: "WingSung 618" },
  { id: PHASE188_698_ID, type: "pen", slug: "永生-wingsung-698", name: "WingSung 698" },
  { id: PHASE188_699_ID, type: "pen", slug: "永生-wingsung-699", name: "WingSung 699" },
] as const;

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(`${prefix}\0${value}`).digest("hex").slice(0, 24)}`;
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function noRemote(options: ApplyPhase188Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) throw new Error(`Phase 188 refuses inherited remote database selection: ${key}.`);
  }
}

async function authority(client: Client, options: ApplyPhase188Options): Promise<void> {
  noRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 188 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 188 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 188 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 188 owned copy must be migrated through 032.");
}

async function identity(client: Client): Promise<void> {
  const brand = await client.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [PHASE188_WINGSUNG_BRAND_ID] });
  if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "wingsung") throw new Error("Phase 188 WingSung brand identity mismatch.");
  for (const target of TARGETS) {
    const row = await client.execute({ sql: "SELECT type,slug,name FROM entities WHERE id=?", args: [target.id] });
    if (row.rows.length !== 1 || String(row.rows[0]?.type) !== target.type || String(row.rows[0]?.slug) !== target.slug) throw new Error(`Phase 188 identity mismatch for ${target.name}: ${JSON.stringify(row.rows)}`);
  }
}

async function topology(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    for (const target of TARGETS) {
      const madeById = stableId("phase188-made-by", target.id);
      const reverseId = stableId("phase188-reverse", target.id);
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [target.id, PHASE188_WINGSUNG_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [madeById, target.id, PHASE188_WINGSUNG_BRAND_ID, `Phase 188 verified WingSung ${target.slug.split("-").at(-1)} maker relation`] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse' AND id<>?", args: [PHASE188_WINGSUNG_BRAND_ID, target.id, reverseId] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [reverseId, PHASE188_WINGSUNG_BRAND_ID, target.id, `Phase 188 WingSung brand navigation to ${target.name}`] });
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase188WingsungFillingTrioContent(client: Client, options: ApplyPhase188Options): Promise<ApplyPhase188Result> {
  await authority(client, options);
  await identity(client);
  await topology(client);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase188WingsungFillingTrioPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  const result = await applyCuratedContentPacks(client, options, packs);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase188-wingsung-filling-trio-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase188WingsungFillingTrioContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase188-wingsung-filling-trio", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

const invokedPath = process.argv[1] ? fs.realpathSync.native(path.resolve(process.argv[1])) : null;
const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url));
if (invokedPath === modulePath) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
