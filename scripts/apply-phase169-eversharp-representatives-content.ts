import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE169_IDS, PHASE169_SLUGS, phase169EversharpRepresentativePacks } from "./data/phase169-eversharp-representatives";

export type ApplyPhase169Options = ApplyPhase22Options;
export type ApplyPhase169Result = ApplyPhase22Result;
function stableId(prefix: string, value: string): string { return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function noRemote(options: ApplyPhase169Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 169 refuses inherited remote database selection: ${key}.`); }

async function authority(client: Client, options: ApplyPhase169Options): Promise<void> {
  noRemote(options); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 169 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 169 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 169 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 169 owned copy must be migrated through 032.");
}

async function topology(client: Client): Promise<void> {
  const brand = await client.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [PHASE169_IDS.brand] });
  if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== PHASE169_SLUGS.brand) throw new Error("Phase 169 Eversharp brand identity mismatch.");
  const pens = [
    [PHASE169_IDS.envoy, PHASE169_SLUGS.envoy],
    [PHASE169_IDS.coronet, PHASE169_SLUGS.coronet],
    [PHASE169_IDS.pacemaker, PHASE169_SLUGS.pacemaker],
  ] as const;
  for (const [id, slug] of pens) {
    const row = await client.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [id] });
    if (row.rows.length !== 1 || String(row.rows[0]?.type) !== "pen" || String(row.rows[0]?.slug) !== slug) throw new Error(`Phase 169 Eversharp identity mismatch: ${id}.`);
  }
  const tx: Transaction = await client.transaction("write");
  try {
    for (const [id, slug] of pens) {
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [id, PHASE169_IDS.brand] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [stableId("phase169-made-by", id), id, PHASE169_IDS.brand, `Phase 169 exact Eversharp ${slug} maker relation`] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse' AND id<>?", args: [PHASE169_IDS.brand, id, stableId("phase169-reverse", id)] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [stableId("phase169-reverse", id), PHASE169_IDS.brand, id, `Phase 169 Eversharp brand navigation ${slug}`] });
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase169EversharpRepresentatives(client: Client, options: ApplyPhase169Options): Promise<ApplyPhase169Result> {
  await authority(client, options); await topology(client);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot); const packs = phase169EversharpRepresentativePacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  const result = await applyCuratedContentPacks(client, options, packs); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}

function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> { const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase169-eversharp-representatives-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]"); const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` }); try { const result = await applyPhase169EversharpRepresentatives(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase169-eversharp-representatives", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); } }
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
