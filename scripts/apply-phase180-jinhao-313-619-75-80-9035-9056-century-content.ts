import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE179_JINHAO_BRAND_ID } from "./data/phase179-jinhao-992-85-10";
import { PHASE180_IDS, phase180JinhaoPacks } from "./data/phase180-jinhao-313-619-75-80-9035-9056-century";

export type ApplyPhase180Options = ApplyPhase22Options;
export type ApplyPhase180Result = ApplyPhase22Result;

const TARGETS = [
  { id: PHASE180_IDS.model313, type: "pen", slug: "金豪-jinhao-313", name: "Jinhao 313" },
  { id: PHASE180_IDS.model619, type: "pen", slug: "金豪-jinhao-619", name: "Jinhao 619" },
  { id: PHASE180_IDS.model75, type: "pen", slug: "金豪-jinhao-75", name: "Jinhao 75" },
  { id: PHASE180_IDS.model80, type: "pen", slug: "金豪-jinhao-80", name: "Jinhao 80" },
  { id: PHASE180_IDS.model9035, type: "pen", slug: "金豪-jinhao-9035", name: "Jinhao 9035" },
  { id: PHASE180_IDS.model9056, type: "pen", slug: "金豪-jinhao-9056木杆", name: "Jinhao 9056" },
  { id: PHASE180_IDS.modelCentury, type: "pen", slug: "金豪-jinhao-世纪-century", name: "Jinhao Century" },
  { id: PHASE180_IDS.modelSilverCentury, type: "pen", slug: "金豪-jinhao-纯银镂空世纪", name: "Jinhao S925 Century" },
] as const;

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(`${prefix}\0${value}`).digest("hex").slice(0, 24)}`;
}
function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}
function noRemote(options: ApplyPhase180Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) throw new Error(`Phase 180 refuses inherited remote database selection: ${key}.`);
  }
}
async function authority(client: Client, options: ApplyPhase180Options): Promise<void> {
  noRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 180 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 180 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 180 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 180 owned copy must be migrated through 032.");
}
async function identity(client: Client): Promise<void> {
  for (const target of TARGETS) {
    const row = await client.execute({ sql: "SELECT type,slug,name FROM entities WHERE id=?", args: [target.id] });
    if (row.rows.length !== 1 || String(row.rows[0]?.type) !== target.type || String(row.rows[0]?.slug) !== target.slug) throw new Error(`Phase 180 identity mismatch for ${target.name}: ${JSON.stringify(row.rows)}`);
  }
}
async function topology(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    for (const target of TARGETS) {
      const madeById = stableId("phase180-made-by", target.id);
      const reverseId = stableId("phase180-reverse", target.id);
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [target.id, PHASE179_JINHAO_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [madeById, target.id, PHASE179_JINHAO_BRAND_ID, `Phase 180 verified ${target.name} maker relation`] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse' AND id<>?", args: [PHASE179_JINHAO_BRAND_ID, target.id, reverseId] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [reverseId, PHASE179_JINHAO_BRAND_ID, target.id, `Phase 180 Jinhao brand navigation to ${target.name}`] });
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase180JinhaoContent(client: Client, options: ApplyPhase180Options): Promise<ApplyPhase180Result> {
  await authority(client, options);
  await identity(client);
  await topology(client);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase180JinhaoPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase180-jinhao-313-619-75-80-9035-9056-century-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase180JinhaoContent(client, {
      workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase180-jinhao-batch", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}
const invokedPath = process.argv[1] ? fs.realpathSync.native(path.resolve(process.argv[1])) : null;
const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url));
if (invokedPath === modulePath) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
