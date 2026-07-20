import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE85_MONTEGRAPPA_BRAND_ID } from "./data/phase85-montegrappa-elmo";
import { PHASE86_ELMO_02_ID, PHASE86_ELMO_02_PLUS_ID, PHASE86_ELMO_02_PLUS_SLUG, PHASE86_ELMO_02_SLUG, phase86MontegrappaElmoFamilyPacks } from "./data/phase86-montegrappa-elmo-family";

export type ApplyPhase86Options = ApplyPhase22Options;
export type ApplyPhase86Result = ApplyPhase22Result;
function stableId(prefix: string, value: string): string { return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function noRemote(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 86 refuses inherited remote database selection: ${key}.`); }
async function assertOwned(client: Client, options: ApplyPhase86Options): Promise<void> {
  noRemote(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const db = fs.realpathSync.native(options.databasePath); const protectedDb = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(db).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(db, root)) throw new Error("Phase 86 owned catalog authority check failed.");
  const own = fs.statSync(db, { bigint: true }); const protectedStat = fs.statSync(protectedDb, { bigint: true });
  if (db === protectedDb || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 86 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== db) throw new Error("Phase 86 client is not bound to the caller-owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 86 owned copy must be migrated through 032.");
}
async function ensurePen(tx: Transaction, id: string, slug: string, name: string): Promise<void> {
  const byId = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ?", args: [id] }); const bySlug = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE slug = ?", args: [slug] });
  if (byId.rows.length === 0 && bySlug.rows.length === 0) { await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [id, slug, name] }); return; }
  if (byId.rows.length !== 1 || bySlug.rows.length !== 1 || String(byId.rows[0]?.id) !== id || String(bySlug.rows[0]?.id) !== id || String(byId.rows[0]?.type) !== "pen" || String(byId.rows[0]?.slug) !== slug) throw new Error(`Phase 86 exact Elmo identity is occupied or ambiguous: ${slug}.`);
  await tx.execute({ sql: "UPDATE entities SET name = ?, updated_at = datetime('now') WHERE id = ?", args: [name, id] });
}
async function topology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE85_MONTEGRAPPA_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "montegrappa") throw new Error("Phase 86 requires the exact Phase 85 Montegrappa brand identity.");
    for (const pen of [{ id: PHASE86_ELMO_02_ID, slug: PHASE86_ELMO_02_SLUG, name: "Montegrappa Elmo 02" }, { id: PHASE86_ELMO_02_PLUS_ID, slug: PHASE86_ELMO_02_PLUS_SLUG, name: "Montegrappa Elmo 02 Plus" }]) {
      await ensurePen(tx, pen.id, pen.slug, pen.name);
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [pen.id, PHASE85_MONTEGRAPPA_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase86-made-by", pen.id), pen.id, PHASE85_MONTEGRAPPA_BRAND_ID, `Phase 86 exact ${pen.name} maker relation`] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase86-reverse", pen.id), PHASE85_MONTEGRAPPA_BRAND_ID, pen.id, `Phase 86 Montegrappa-to-${pen.name} navigation`] });
    }
    const makers = await tx.execute({ sql: "SELECT source_id, target_id FROM entity_links WHERE source_id IN (?, ?) AND link_type = 'made_by'", args: [PHASE86_ELMO_02_ID, PHASE86_ELMO_02_PLUS_ID] });
    if (makers.rows.length !== 2 || makers.rows.some((row) => String(row.target_id) !== PHASE85_MONTEGRAPPA_BRAND_ID)) throw new Error("Phase 86 Elmo maker topology remains ambiguous.");
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
async function publicNavigation(client: Client): Promise<void> {
  const pens = await client.execute({ sql: "SELECT pen.id FROM public_entities pen JOIN entity_links maker ON maker.source_id = pen.id AND maker.target_id = ? AND maker.link_type = 'made_by' WHERE pen.type = 'pen'", args: [PHASE85_MONTEGRAPPA_BRAND_ID] });
  const tx = await client.transaction("write");
  try { for (const row of pens.rows) { const id = String(row.id); await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase86-public-reverse", id), PHASE85_MONTEGRAPPA_BRAND_ID, id, "Phase 86 public Montegrappa model navigation"] }); } await tx.commit(); } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase86MontegrappaElmoFamilyContent(client: Client, options: ApplyPhase86Options): Promise<ApplyPhase86Result> {
  await assertOwned(client, options); await topology(client); const result = await applyCuratedContentPacks(client, options, structuredClone(phase86MontegrappaElmoFamilyPacks())); await publicNavigation(client); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}
function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase86-montegrappa-elmo-family-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { process.stdout.write(`${JSON.stringify(await applyPhase86MontegrappaElmoFamilyContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase86-montegrappa-elmo-family", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
