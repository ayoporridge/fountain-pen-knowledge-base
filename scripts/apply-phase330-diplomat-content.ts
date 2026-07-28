import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE330_DIPLOMAT_BRAND_ID, PHASE330_MAGNUM_ID, PHASE330_MAGNUM_SLUG, phase330DiplomatMagnumPacks } from "./data/phase330-diplomat-magnum";

export type ApplyPhase330Options = ApplyPhase22Options;
export type ApplyPhase330Result = ApplyPhase22Result;
export { PHASE330_DIPLOMAT_BRAND_ID, PHASE330_MAGNUM_ID, PHASE330_MAGNUM_SLUG };
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(options: ApplyPhase330Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 330 refuses inherited remote database selection: ${key}.`); }
async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) { return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row })); }
async function authority(client: Client, options: ApplyPhase330Options): Promise<void> {
  assertNoRemote(options); if (!options.reviewer.trim()) throw new Error("Phase 330 reviewer must not be empty."); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, ownedRoot)) throw new Error("Phase 330 requires an owned, non-symlink catalog copy.");
  const ownedStat = fs.statSync(database, { bigint: true }); const protectedStat = fs.statSync(protectedCatalog, { bigint: true }); if (database === protectedCatalog || (ownedStat.dev === protectedStat.dev && ownedStat.ino === protectedStat.ino)) throw new Error("Phase 330 refuses the protected catalog or hard-link alias.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] }); if (migration.rows.length !== 1) throw new Error("Phase 330 owned copy must be migrated through 032.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main"); if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 330 client is not bound to the authorized owned copy.");
}
async function identity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const brand = await rows(client, "SELECT id,type,slug FROM entities WHERE id=?", [PHASE330_DIPLOMAT_BRAND_ID]); if (brand.length !== 1 || brand[0]?.type !== "brand" || brand[0]?.slug !== "diplomat") throw new Error(`Phase 330 Diplomat brand identity mismatch: ${JSON.stringify(brand)}`);
  const pack = packs.find((item) => item.entityId === PHASE330_MAGNUM_ID); if (!pack) throw new Error("Phase 330 Magnum pack missing.");
  const existing = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [PHASE330_MAGNUM_ID, PHASE330_MAGNUM_SLUG]);
  if (existing.length > 1 || (existing.length === 1 && (existing[0]?.id !== PHASE330_MAGNUM_ID || existing[0]?.type !== pack.expectedType || existing[0]?.slug !== pack.expectedSlug || existing[0]?.name !== pack.canonicalName))) throw new Error(`Phase 330 Magnum identity collision: ${JSON.stringify(existing)}`);
}
async function topology(client: Client): Promise<void> {
  const tx = await client.transaction("write"); try {
    await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [PHASE330_MAGNUM_ID, PHASE330_MAGNUM_SLUG, "Diplomat Magnum"] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [PHASE330_MAGNUM_ID, PHASE330_DIPLOMAT_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: ["phase330-made-by-diplomat-magnum", PHASE330_MAGNUM_ID, PHASE330_DIPLOMAT_BRAND_ID, "Phase 330 verified Diplomat Magnum maker relation"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: ["phase330-reverse-diplomat-magnum", PHASE330_DIPLOMAT_BRAND_ID, PHASE330_MAGNUM_ID, "Phase 330 Diplomat brand navigation to Magnum"] });
    const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [PHASE330_MAGNUM_ID] }); if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE330_DIPLOMAT_BRAND_ID) throw new Error("Phase 330 Magnum maker topology is ambiguous.");
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
async function ensurePublicBrandNavigation(client: Client): Promise<void> {
  const pens = await client.execute({ sql: "SELECT pen.id FROM public_entities pen JOIN entity_links maker ON maker.source_id=pen.id AND maker.target_id=? AND maker.link_type='made_by' WHERE pen.type='pen'", args: [PHASE330_DIPLOMAT_BRAND_ID] });
  const tx = await client.transaction("write"); try { for (const row of pens.rows) { const penId = String(row.id); await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [`phase330-reverse-diplomat-${penId}`, PHASE330_DIPLOMAT_BRAND_ID, penId, "Phase 330 public Diplomat model navigation repair"] }); } await tx.commit(); } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
  const missing = await client.execute({ sql: "SELECT pen.slug FROM public_entities pen JOIN entity_links maker ON maker.source_id=pen.id AND maker.target_id=? AND maker.link_type='made_by' LEFT JOIN entity_links reverse ON reverse.source_id=? AND reverse.target_id=pen.id AND reverse.link_type='reverse' WHERE pen.type='pen' GROUP BY pen.id,pen.slug HAVING count(reverse.id)<>1", args: [PHASE330_DIPLOMAT_BRAND_ID, PHASE330_DIPLOMAT_BRAND_ID] }); if (missing.rows.length) throw new Error(`Phase 330 Diplomat public navigation incomplete: ${missing.rows.map((row) => String(row.slug)).join(", ")}`);
}
export async function applyPhase330DiplomatMagnumContent(client: Client, options: ApplyPhase330Options): Promise<ApplyPhase330Result> {
  await authority(client, options); const packs = phase330DiplomatMagnumPacks.map((pack) => loadCuratedEntityPack(fs.realpathSync.native(options.workspaceRoot), pack)); await identity(client, packs); await topology(client); const result = await applyCuratedContentPacks(client, options, packs); await ensurePublicBrandNavigation(client); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}
function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase330-diplomat-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` }); try { const result = await applyPhase330DiplomatMagnumContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase330-diplomat-magnum", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
