import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE92_DESIGN04_ID, PHASE92_DESIGN04_SLUG, PHASE92_OTTO_HUTT_ID, PHASE92_OTTO_HUTT_SLUG, phase92OttoHuttDesign04Packs } from "./data/phase92-otto-hutt-design04";

export type ApplyPhase92Options = ApplyPhase22Options;
export type ApplyPhase92Result = ApplyPhase22Result;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const stableId = (prefix: string, value: string) => `${prefix}-${hash(value).slice(0, 24)}`;
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 92 refuses inherited remote selection: ${key}.`); }
async function assertOwned(client: Client, options: ApplyPhase92Options): Promise<void> {
  assertNoRemote(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot), db = fs.realpathSync.native(options.databasePath), protectedDb = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(db).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(db, root)) throw new Error("Phase 92 database must be a non-symlink file inside the owned root.");
  const own = fs.statSync(db, { bigint: true }), protectedStat = fs.statSync(protectedDb, { bigint: true });
  if (db === protectedDb || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 92 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== db) throw new Error("Phase 92 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] }); if (migration.rows.length !== 1) throw new Error("Phase 92 owned copy must be migrated through 032.");
}
async function topology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT id,type,slug FROM entities WHERE id=? OR slug=?", args: [PHASE92_OTTO_HUTT_ID, PHASE92_OTTO_HUTT_SLUG] });
    if (!brand.rows.length) await tx.execute({ sql: "INSERT INTO entities (id,type,slug,name) VALUES (?, 'brand', ?, ?)", args: [PHASE92_OTTO_HUTT_ID, PHASE92_OTTO_HUTT_SLUG, "Otto Hutt"] });
    else if (brand.rows.length !== 1 || String(brand.rows[0]?.id) !== PHASE92_OTTO_HUTT_ID || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== PHASE92_OTTO_HUTT_SLUG) throw new Error("Phase 92 Otto Hutt brand identity collision.");
    const pen = await tx.execute({ sql: "SELECT id,type,slug FROM entities WHERE id=? OR slug=?", args: [PHASE92_DESIGN04_ID, PHASE92_DESIGN04_SLUG] });
    if (!pen.rows.length) await tx.execute({ sql: "INSERT INTO entities (id,type,slug,name) VALUES (?, 'pen', ?, ?)", args: [PHASE92_DESIGN04_ID, PHASE92_DESIGN04_SLUG, "Otto Hutt design04"] });
    else if (pen.rows.length !== 1 || String(pen.rows[0]?.id) !== PHASE92_DESIGN04_ID || String(pen.rows[0]?.type) !== "pen" || String(pen.rows[0]?.slug) !== PHASE92_DESIGN04_SLUG) throw new Error("Phase 92 design04 identity collision.");
    const key = "phase92-otto-hutt-design04-topology-v1"; await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id,source_key,source_checksum,status,note) VALUES (?,?,?,'applied',?)", args: [stableId("phase92-batch", key), key, hash(key), "Create Otto Hutt and design04 topology."] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [PHASE92_DESIGN04_ID, PHASE92_OTTO_HUTT_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?,?,?,'made_by',?)", args: [stableId("phase92-made-by", `${PHASE92_DESIGN04_ID}:${PHASE92_OTTO_HUTT_ID}`), PHASE92_DESIGN04_ID, PHASE92_OTTO_HUTT_ID, "Phase 92 exact Otto Hutt maker relation"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?,?,?,'reverse',?)", args: [stableId("phase92-reverse", `${PHASE92_OTTO_HUTT_ID}:${PHASE92_DESIGN04_ID}`), PHASE92_OTTO_HUTT_ID, PHASE92_DESIGN04_ID, "Phase 92 Otto Hutt-to-design04 public model navigation"] });
    const maker = await tx.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'", args: [PHASE92_DESIGN04_ID, PHASE92_OTTO_HUTT_ID] }); const reverse = await tx.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'", args: [PHASE92_OTTO_HUTT_ID, PHASE92_DESIGN04_ID] });
    if (Number(maker.rows[0]?.value ?? 0) !== 1 || Number(reverse.rows[0]?.value ?? 0) !== 1) throw new Error("Phase 92 Otto Hutt topology is incomplete."); await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase92OttoHuttDesign04Content(client: Client, options: ApplyPhase92Options): Promise<ApplyPhase92Result> { await assertOwned(client, options); await topology(client); const result = await applyCuratedContentPacks(client, options, structuredClone(phase92OttoHuttDesign04Packs)); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result; }
function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> { const database = value("--database"), ownedRoot = value("--owned-root"), protectedCatalog = value("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase92-otto-hutt-design04-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>"); const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` }); try { process.stdout.write(`${JSON.stringify(await applyPhase92OttoHuttDesign04Content(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase92-otto-hutt-design04", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); } }
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
