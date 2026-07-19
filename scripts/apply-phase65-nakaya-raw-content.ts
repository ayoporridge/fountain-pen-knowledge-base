import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import {
  PHASE65_CIGAR_PORTABLE_ID,
  PHASE65_CIGAR_PORTABLE_RAW_SLUG,
  PHASE65_CIGAR_PORTABLE_SLUG,
  PHASE65_HOUSOGE_ID,
  PHASE65_HOUSOGE_RAW_SLUG,
  PHASE65_HOUSOGE_SLUG,
  PHASE65_NAKAYA_ID,
  PHASE65_WRITER_PORTABLE_ID,
  PHASE65_WRITER_PORTABLE_RAW_SLUG,
  PHASE65_WRITER_PORTABLE_SLUG,
  phase65NakayaPacks,
} from "./data/phase65-nakaya-raw";

export type ApplyPhase65Options = ApplyPhase22Options;
export type ApplyPhase65Result = ApplyPhase22Result;

const CANONICALS = [
  { id: PHASE65_HOUSOGE_ID, oldSlug: PHASE65_HOUSOGE_RAW_SLUG, slug: PHASE65_HOUSOGE_SLUG, name: "Nakaya Cigar Piccolo Housoge" },
  { id: PHASE65_CIGAR_PORTABLE_ID, oldSlug: PHASE65_CIGAR_PORTABLE_RAW_SLUG, slug: PHASE65_CIGAR_PORTABLE_SLUG, name: "Nakaya Cigar Portable Kuro-tamenuri" },
  { id: PHASE65_WRITER_PORTABLE_ID, oldSlug: PHASE65_WRITER_PORTABLE_RAW_SLUG, slug: PHASE65_WRITER_PORTABLE_SLUG, name: "Nakaya Writer Portable Kuro-tamenuri" },
] as const;

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 65 refuses inherited remote selection: ${key}.`);
}

async function assertOwned(client: Client, options: ApplyPhase65Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, ownedRoot)) throw new Error("Phase 65 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 65 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 65 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 65 owned copy must be migrated through 032.");
}

async function installRedirect(tx: Transaction, input: { source: string; target: string; actionId: string; batchId: string }): Promise<void> {
  const existing = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [input.source] });
  if (existing.rows.length) {
    if (String(existing.rows[0]?.target_path ?? "") !== input.target || String(existing.rows[0]?.redirect_kind) !== "permanent") throw new Error(`Phase 65 redirect collision: ${input.source}`);
    return;
  }
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')", args: [stableId("phase65-redirect", input.source), input.batchId, input.actionId, input.source, input.target] });
}

async function ensureCanonical(tx: Transaction, input: (typeof CANONICALS)[number]): Promise<void> {
  const row = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ?", args: [input.id] });
  if (row.rows.length !== 1 || String(row.rows[0]?.type) !== "pen") throw new Error(`Phase 65 canonical entity missing/type mismatch: ${input.id}`);
  const currentSlug = String(row.rows[0]?.slug);
  if (currentSlug !== input.oldSlug && currentSlug !== input.slug) throw new Error(`Phase 65 canonical slug mismatch: ${input.id}/${currentSlug}`);
  if (currentSlug === input.oldSlug) await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ? WHERE id = ?", args: [input.slug, input.name, input.id] });
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [input.id, PHASE65_NAKAYA_ID] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase65-made-by", input.id), input.id, PHASE65_NAKAYA_ID, "Phase 65 Nakaya canonical maker topology"] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase65-reverse", input.id), PHASE65_NAKAYA_ID, input.id, "Phase 65 Nakaya canonical model navigation"] });
  const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [input.id] });
  if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE65_NAKAYA_ID) throw new Error(`Phase 65 maker topology ambiguous: ${input.id}`);
}

async function ensureIdentity(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE65_NAKAYA_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "nakaya") throw new Error("Phase 65 Nakaya brand identity mismatch.");
    for (const canonical of CANONICALS) await ensureCanonical(tx, canonical);
    const batchKey = "phase65-nakaya-raw-canonical-v1"; const batchId = stableId("phase65-batch", batchKey);
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, batchKey, digest(batchKey), "Canonicalize three sourced Nakaya raw rows; preserve each existing entity and distinguish Cigar/Writer, Portable/Piccolo, and finish/decorative scope."] });
    for (const canonical of CANONICALS) {
      const actionId = stableId("phase65-action", canonical.id);
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'retire', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, canonical.oldSlug, digest(`${canonical.id}:${canonical.oldSlug}:${canonical.slug}`), canonical.id, canonical.id, `Canonicalized ${canonical.oldSlug} to ${canonical.slug}.`] });
      await installRedirect(tx, { source: `/pen/${canonical.oldSlug}`, target: `/pen/${canonical.slug}`, actionId, batchId });
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase65NakayaRawContent(client: Client, options: ApplyPhase65Options): Promise<ApplyPhase65Result> {
  await assertOwned(client, options);
  await ensureIdentity(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase65NakayaPacks));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = cliValue("--database"); const ownedRoot = cliValue("--owned-root"); const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase65-nakaya-raw-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { const result = await applyPhase65NakayaRawContent(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase65-nakaya-curated-content", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
