import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE221_CAMEL_BRAND_ID, PHASE221_CAMEL_BRAND_SLUG, PHASE221_CAMEL_ID, PHASE221_CAMEL_SLUG, phase221CamelPacks } from "./data/phase221-camel-pen";

export type ApplyPhase221Options = ApplyPhase22Options;
export type ApplyPhase221Result = ApplyPhase22Result;
function stableId(prefix: string, value: string): string { return `${prefix}-${createHash("sha256").update(`${prefix}\0${value}`).digest("hex").slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function noRemote(options: ApplyPhase221Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 221 refuses inherited remote database selection: ${key}.`); }
async function authority(client: Client, options: ApplyPhase221Options): Promise<void> {
  noRemote(options); if (!options.reviewer.trim()) throw new Error("Phase 221 reviewer must not be empty."); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 221 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true }); if (database === protectedPath || Number(own.nlink) !== 1 || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 221 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main"); if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 221 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] }); if (migration.rows.length !== 1) throw new Error("Phase 221 owned copy must be migrated through 032.");
}
async function identity(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    const model = await tx.execute({ sql: "SELECT id,type,slug FROM entities WHERE id=?", args: [PHASE221_CAMEL_ID] });
    if (model.rows.length !== 1 || String(model.rows[0]?.type) !== "pen" || String(model.rows[0]?.slug) !== PHASE221_CAMEL_SLUG) throw new Error("Phase 221 Camel identity mismatch.");
    const bySlug = await tx.execute({ sql: "SELECT id,type,slug FROM entities WHERE slug=? ORDER BY id", args: [PHASE221_CAMEL_BRAND_SLUG] });
    if (bySlug.rows.length === 0) await tx.execute({ sql: "INSERT INTO entities (id,type,slug,name) VALUES (?,'brand',?,?)", args: [PHASE221_CAMEL_BRAND_ID, PHASE221_CAMEL_BRAND_SLUG, "Camel Pen Company"] });
    else if (bySlug.rows.length !== 1 || String(bySlug.rows[0]?.id) !== PHASE221_CAMEL_BRAND_ID || String(bySlug.rows[0]?.type) !== "brand") throw new Error("Phase 221 Camel brand slug collision.");
    const brand = await tx.execute({ sql: "SELECT id,type,slug FROM entities WHERE id=?", args: [PHASE221_CAMEL_BRAND_ID] }); if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== PHASE221_CAMEL_BRAND_SLUG) throw new Error("Phase 221 Camel brand identity mismatch.");
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [PHASE221_CAMEL_ID, PHASE221_CAMEL_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?,?,?,'made_by',?)", args: [stableId("phase221-made-by", PHASE221_CAMEL_ID), PHASE221_CAMEL_ID, PHASE221_CAMEL_BRAND_ID, "Phase 221 Camel Pen maker relation"] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='reverse' AND target_id<>?", args: [PHASE221_CAMEL_BRAND_ID, PHASE221_CAMEL_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?,?,?,'reverse',?)", args: [stableId("phase221-reverse", PHASE221_CAMEL_ID), PHASE221_CAMEL_BRAND_ID, PHASE221_CAMEL_ID, "Phase 221 Camel brand navigation"] });
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase221CamelContent(client: Client, options: ApplyPhase221Options): Promise<ApplyPhase221Result> { await authority(client, options); await identity(client); const workspaceRoot = fs.realpathSync.native(options.workspaceRoot); const packs = phase221CamelPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack)); const result = await applyCuratedContentPacks(client, options, packs); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result; }
function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> { const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase221-camel-pen-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]"); const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` }); try { const result = await applyPhase221CamelContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase221-camel", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); } }
const invokedPath = process.argv[1] ? fs.realpathSync.native(path.resolve(process.argv[1])) : null; const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url)); if (invokedPath === modulePath) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
