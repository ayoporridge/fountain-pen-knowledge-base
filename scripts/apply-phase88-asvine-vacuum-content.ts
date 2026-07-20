import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE88_V126_ID, PHASE88_V126_SLUG, PHASE88_V200_ID, PHASE88_V200_SLUG, phase88AsvineVacuumPacks } from "./data/phase88-asvine-vacuum";

export type ApplyPhase88Options = ApplyPhase22Options;
export type ApplyPhase88Result = ApplyPhase22Result;

function stableId(prefix: string, value: string): string { return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }

async function assertOwned(client: Client, options: ApplyPhase88Options): Promise<void> {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if ((options.env ?? process.env)[key]?.trim()) throw new Error(`Phase 88 refuses inherited remote database selection: ${key}.`);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 88 owned catalog authority check failed.");
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)) throw new Error("Phase 88 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 88 client is not bound to the caller-owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 88 owned copy must be migrated through 032.");
}

async function ensureExactPen(tx: Transaction, input: { id: string; slug: string; name: string }): Promise<void> {
  const byId = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ?", args: [input.id] });
  const bySlug = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE slug = ?", args: [input.slug] });
  if (byId.rows.length === 0 && bySlug.rows.length === 0) {
    await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [input.id, input.slug, input.name] });
    return;
  }
  if (byId.rows.length !== 1 || bySlug.rows.length !== 1 || String(byId.rows[0]?.id) !== input.id || String(bySlug.rows[0]?.id) !== input.id || String(byId.rows[0]?.type) !== "pen" || String(byId.rows[0]?.slug) !== input.slug) throw new Error(`Phase 88 exact model identity is occupied or ambiguous: ${input.slug}.`);
  await tx.execute({ sql: "UPDATE entities SET name = ?, updated_at = datetime('now') WHERE id = ?", args: [input.name, input.id] });
}

async function enforceMaker(tx: Transaction, penId: string, brandId: string): Promise<void> {
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [penId, brandId] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase88-made-by", `${penId}:${brandId}`), penId, brandId, "Phase 88 exact Asvine model maker relation"] });
  const makers = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [penId] });
  if (makers.rows.length !== 1 || String(makers.rows[0]?.target_id) !== brandId) throw new Error(`Phase 88 maker topology remains ambiguous: ${penId}.`);
}

async function prepareTopology(client: Client): Promise<string> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE type = 'brand' AND slug = 'asvine'", args: [] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand") throw new Error("Phase 88 requires the exact Asvine brand published by Phase 66.");
    const brandId = String(brand.rows[0]?.id);
    await ensureExactPen(tx, { id: PHASE88_V126_ID, slug: PHASE88_V126_SLUG, name: "Asvine V126 Vacuum Filling Fountain Pen" });
    await ensureExactPen(tx, { id: PHASE88_V200_ID, slug: PHASE88_V200_SLUG, name: "Asvine V200 Titanium Vacuum Filling Fountain Pen" });
    await enforceMaker(tx, PHASE88_V126_ID, brandId);
    await enforceMaker(tx, PHASE88_V200_ID, brandId);
    await tx.commit();
    return brandId;
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

async function ensurePublicBrandNavigation(client: Client, brandId: string): Promise<void> {
  const pens = await client.execute({ sql: "SELECT pen.id FROM public_entities pen JOIN entity_links maker ON maker.source_id = pen.id AND maker.target_id = ? AND maker.link_type = 'made_by' WHERE pen.type = 'pen' ORDER BY pen.id", args: [brandId] });
  const tx = await client.transaction("write");
  try {
    for (const row of pens.rows) {
      const penId = String(row.id);
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase88-brand-reverse", `${brandId}:${penId}`), brandId, penId, "Phase 88 public Asvine model navigation"] });
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
  const missing = await client.execute({ sql: "SELECT pen.slug FROM public_entities pen JOIN entity_links maker ON maker.source_id = pen.id AND maker.target_id = ? AND maker.link_type = 'made_by' LEFT JOIN entity_links reverse ON reverse.source_id = ? AND reverse.target_id = pen.id AND reverse.link_type = 'reverse' WHERE pen.type = 'pen' GROUP BY pen.id, pen.slug HAVING count(reverse.id) <> 1 ORDER BY pen.slug", args: [brandId, brandId] });
  if (missing.rows.length) throw new Error(`Phase 88 has incomplete Asvine model navigation: ${missing.rows.map((row) => String(row.slug)).join(", ")}.`);
}

export async function applyPhase88AsvineVacuumContent(client: Client, options: ApplyPhase88Options): Promise<ApplyPhase88Result> {
  await assertOwned(client, options);
  const brandId = await prepareTopology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase88AsvineVacuumPacks(brandId)));
  await ensurePublicBrandNavigation(client, brandId);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase88-asvine-vacuum-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase88AsvineVacuumContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase88-asvine-vacuum", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
