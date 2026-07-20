import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE96_KACO_BRAND_ID, PHASE96_KACO_MASTER14K_ID, phase96KacoMaster14kPacks } from "./data/phase96-kaco-master14k";

export type ApplyPhase96Options = ApplyPhase22Options;
export type ApplyPhase96Result = ApplyPhase22Result;

const id = (prefix: string, value: string) => `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
const inside = (candidate: string, root: string) => { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); };

async function owned(client: Client, options: ApplyPhase96Options) {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if ((options.env ?? process.env)[key]?.trim()) throw new Error(`Phase 96 refuses inherited remote selection: ${key}.`);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot), database = fs.realpathSync.native(options.databasePath), protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 96 database must be a non-symlink file inside the owned root.");
  const own = fs.statSync(database, { bigint: true }), real = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 96 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"), main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 96 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 96 owned copy must be migrated through 032.");
}

async function topology(client: Client) {
  const transaction = await client.transaction("write");
  try {
    for (const item of [{ id: PHASE96_KACO_BRAND_ID, type: "brand", slug: "kaco" }, { id: PHASE96_KACO_MASTER14K_ID, type: "pen", slug: "kaco-master大师14k" }] as const) {
      const entity = await transaction.execute({ sql: "SELECT id,type,slug FROM entities WHERE id=?", args: [item.id] });
      if (entity.rows.length !== 1 || String(entity.rows[0]?.type) !== item.type || String(entity.rows[0]?.slug) !== item.slug) throw new Error(`Phase 96 identity mismatch: ${item.slug}`);
    }
    await transaction.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [PHASE96_KACO_MASTER14K_ID, PHASE96_KACO_BRAND_ID] });
    await transaction.execute({ sql: "INSERT OR IGNORE INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?,?,?,'made_by',?)", args: [id("phase96-made-by", PHASE96_KACO_MASTER14K_ID), PHASE96_KACO_MASTER14K_ID, PHASE96_KACO_BRAND_ID, "Phase 96 exact KACO Master 14K maker relation"] });
    await transaction.execute({ sql: "INSERT OR IGNORE INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?,?,?,'reverse',?)", args: [id("phase96-reverse", PHASE96_KACO_MASTER14K_ID), PHASE96_KACO_BRAND_ID, PHASE96_KACO_MASTER14K_ID, "Phase 96 KACO brand-to-model navigation"] });
    const maker = await transaction.execute({ sql: "SELECT count(*) AS total FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'", args: [PHASE96_KACO_MASTER14K_ID, PHASE96_KACO_BRAND_ID] });
    if (Number(maker.rows[0]?.total ?? 0) !== 1) throw new Error("Phase 96 KACO maker topology failed.");
    await transaction.commit();
  } catch (error) { if (!transaction.closed) await transaction.rollback(); throw error; }
}

export async function applyPhase96KacoMaster14kContent(client: Client, options: ApplyPhase96Options): Promise<ApplyPhase96Result> {
  await owned(client, options); await topology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase96KacoMaster14kPacks));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}

const value = (name: string) => { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; };
async function main() { const databasePath = value("--database"), ownedRoot = value("--owned-root"), protectedCatalogPath = value("--protected-catalog"); if (!databasePath || !ownedRoot || !protectedCatalogPath) throw new Error("Usage: tsx scripts/apply-phase96-kaco-master14k-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>"); const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(databasePath)}` }); try { process.stdout.write(`${JSON.stringify(await applyPhase96KacoMaster14kContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase96-kaco-master14k", databasePath: path.resolve(databasePath), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalogPath), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalogPath)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); } }
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
