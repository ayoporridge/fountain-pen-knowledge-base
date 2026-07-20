import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE85_MONTEGRAPPA_BRAND_ID } from "./data/phase85-montegrappa-elmo";
import { PHASE87_EXTRA_1930_ID, PHASE87_EXTRA_1930_SLUG, phase87MontegrappaExtra1930Packs } from "./data/phase87-montegrappa-extra-1930";

export type ApplyPhase87Options = ApplyPhase22Options;
export type ApplyPhase87Result = ApplyPhase22Result;
function id(prefix: string, value: string): string { return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
async function assertOwned(client: Client, options: ApplyPhase87Options): Promise<void> {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if ((options.env ?? process.env)[key]?.trim()) throw new Error(`Phase 87 refuses inherited remote database selection: ${key}.`);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); const root = fs.realpathSync.native(options.ownedRoot); const db = fs.realpathSync.native(options.databasePath); const protectedDb = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(db).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(db, root)) throw new Error("Phase 87 owned catalog authority check failed.");
  const own = fs.statSync(db, { bigint: true }); const protectedStat = fs.statSync(protectedDb, { bigint: true }); if (db === protectedDb || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 87 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main"); if (!main?.file || fs.realpathSync.native(String(main.file)) !== db) throw new Error("Phase 87 client is not bound to the caller-owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] }); if (migration.rows.length !== 1) throw new Error("Phase 87 owned copy must be migrated through 032.");
}
async function topology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE85_MONTEGRAPPA_BRAND_ID] }); if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "montegrappa") throw new Error("Phase 87 requires the exact Montegrappa brand identity.");
    const byId = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ?", args: [PHASE87_EXTRA_1930_ID] }); const bySlug = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE slug = ?", args: [PHASE87_EXTRA_1930_SLUG] });
    if (byId.rows.length === 0 && bySlug.rows.length === 0) await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [PHASE87_EXTRA_1930_ID, PHASE87_EXTRA_1930_SLUG, "Montegrappa Extra 1930"] });
    else if (byId.rows.length !== 1 || bySlug.rows.length !== 1 || String(byId.rows[0]?.id) !== PHASE87_EXTRA_1930_ID || String(bySlug.rows[0]?.id) !== PHASE87_EXTRA_1930_ID || String(byId.rows[0]?.type) !== "pen" || String(byId.rows[0]?.slug) !== PHASE87_EXTRA_1930_SLUG) throw new Error("Phase 87 Extra 1930 identity is occupied or ambiguous.");
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [PHASE87_EXTRA_1930_ID, PHASE85_MONTEGRAPPA_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [id("phase87-made-by", PHASE87_EXTRA_1930_ID), PHASE87_EXTRA_1930_ID, PHASE85_MONTEGRAPPA_BRAND_ID, "Phase 87 exact Montegrappa Extra 1930 maker relation"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [id("phase87-reverse", PHASE87_EXTRA_1930_ID), PHASE85_MONTEGRAPPA_BRAND_ID, PHASE87_EXTRA_1930_ID, "Phase 87 Montegrappa-to-Extra 1930 navigation"] });
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase87MontegrappaExtra1930Content(client: Client, options: ApplyPhase87Options): Promise<ApplyPhase87Result> { await assertOwned(client, options); await topology(client); const result = await applyCuratedContentPacks(client, options, structuredClone(phase87MontegrappaExtra1930Packs())); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result; }
function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> { const database = value("--database"), ownedRoot = value("--owned-root"), protectedCatalog = value("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase87-montegrappa-extra-1930-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]"); const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` }); try { process.stdout.write(`${JSON.stringify(await applyPhase87MontegrappaExtra1930Content(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase87-montegrappa-extra-1930", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); } }
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
