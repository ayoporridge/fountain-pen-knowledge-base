import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import {
  PHASE62_BALANCE_ID,
  PHASE62_BALANCE_RAW_SLUG,
  PHASE62_BALANCE_SLUG,
  PHASE62_MIXED_IMPERIAL_ID,
  PHASE62_MIXED_IMPERIAL_SLUG,
  PHASE62_PFM_ID,
  PHASE62_PFM_RAW_SLUG,
  PHASE62_PFM_SLUG,
  PHASE62_SHEAFFER_ID,
  PHASE62_SNORKEL_ID,
  PHASE62_SNORKEL_RAW_SLUG,
  PHASE62_SNORKEL_SLUG,
  PHASE62_TARGA_ID,
  PHASE62_TARGA_RAW_SLUG,
  PHASE62_TARGA_SLUG,
  PHASE62_TUCKAWAY_ID,
  PHASE62_TUCKAWAY_RAW_SLUG,
  PHASE62_TUCKAWAY_SLUG,
  phase62SheafferPacks,
} from "./data/phase62-sheaffer-p0";

export type ApplyPhase62Options = ApplyPhase22Options;
export type ApplyPhase62Result = ApplyPhase22Result;

const CANONICALS = [
  { id: PHASE62_BALANCE_ID, oldSlug: PHASE62_BALANCE_RAW_SLUG, slug: PHASE62_BALANCE_SLUG, name: "Sheaffer Balance" },
  { id: PHASE62_SNORKEL_ID, oldSlug: PHASE62_SNORKEL_RAW_SLUG, slug: PHASE62_SNORKEL_SLUG, name: "Sheaffer Snorkel" },
  { id: PHASE62_PFM_ID, oldSlug: PHASE62_PFM_RAW_SLUG, slug: PHASE62_PFM_SLUG, name: "Sheaffer PFM" },
  { id: PHASE62_TUCKAWAY_ID, oldSlug: PHASE62_TUCKAWAY_RAW_SLUG, slug: PHASE62_TUCKAWAY_SLUG, name: "Sheaffer Tuckaway" },
  { id: PHASE62_TARGA_ID, oldSlug: PHASE62_TARGA_RAW_SLUG, slug: PHASE62_TARGA_SLUG, name: "Sheaffer Targa" },
] as const;

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 62 refuses inherited remote selection: ${key}.`);
}

async function assertOwned(client: Client, options: ApplyPhase62Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, ownedRoot)) throw new Error("Phase 62 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 62 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 62 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 62 owned copy must be migrated through 032.");
}

async function installRedirect(tx: Transaction, input: { source: string; target: string | null; kind: "permanent" | "hard_404"; actionId: string; batchId: string; reason: string }): Promise<void> {
  const existing = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [input.source] });
  if (existing.rows.length) {
    if (String(existing.rows[0]?.target_path ?? "") !== String(input.target ?? "") || String(existing.rows[0]?.redirect_kind) !== input.kind) throw new Error(`Phase 62 redirect collision: ${input.source}`);
    return;
  }
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, ?, ?)", args: [stableId("phase62-redirect", input.source), input.batchId, input.actionId, input.source, input.target, input.kind, input.reason] });
}

async function ensureCanonical(tx: Transaction, input: (typeof CANONICALS)[number]): Promise<void> {
  const row = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ?", args: [input.id] });
  if (row.rows.length !== 1 || String(row.rows[0]?.type) !== "pen") throw new Error(`Phase 62 canonical entity missing/type mismatch: ${input.id}`);
  const currentSlug = String(row.rows[0]?.slug);
  if (currentSlug !== input.oldSlug && currentSlug !== input.slug) throw new Error(`Phase 62 canonical slug mismatch: ${input.id}/${currentSlug}`);
  if (currentSlug === input.oldSlug) await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ? WHERE id = ?", args: [input.slug, input.name, input.id] });
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [input.id, PHASE62_SHEAFFER_ID] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase62-made-by", input.id), input.id, PHASE62_SHEAFFER_ID, "Phase 62 canonical Sheaffer family topology"] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase62-reverse", input.id), PHASE62_SHEAFFER_ID, input.id, "Phase 62 canonical Sheaffer family topology"] });
  const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [input.id] });
  if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE62_SHEAFFER_ID) throw new Error(`Phase 62 maker topology ambiguous: ${input.id}`);
}

async function ensureIdentity(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE62_SHEAFFER_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "sheaffer") throw new Error("Phase 62 Sheaffer brand identity mismatch.");
    for (const canonical of CANONICALS) await ensureCanonical(tx, canonical);
    const batchKey = "phase62-sheaffer-family-canonical-v1"; const batchId = stableId("phase62-batch", batchKey);
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, batchKey, digest(batchKey), "Canonicalize five existing Sheaffer family rows; retire the ambiguous Chinese Imperial/Legacy donor without guessing a target."] });
    for (const canonical of CANONICALS) {
      const canonicalAction = stableId("phase62-action", canonical.id);
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'retire', ?, ?, ?, 'applied', ?)", args: [canonicalAction, batchId, canonical.oldSlug, digest(`${canonical.id}:${canonical.oldSlug}:${canonical.slug}`), canonical.id, canonical.id, `Canonicalized ${canonical.oldSlug} to ${canonical.slug}.`] });
      await installRedirect(tx, { source: `/pen/${canonical.oldSlug}`, target: `/pen/${canonical.slug}`, kind: "permanent", actionId: canonicalAction, batchId, reason: "raw Sheaffer family slug canonicalized to a sourced family page" });
    }
    const mixed = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE62_MIXED_IMPERIAL_ID] });
    if (mixed.rows.length !== 1 || String(mixed.rows[0]?.type) !== "pen" || String(mixed.rows[0]?.slug) !== PHASE62_MIXED_IMPERIAL_SLUG) throw new Error("Phase 62 mixed Imperial/Legacy donor identity mismatch.");
    const mixedAction = stableId("phase62-action", "mixed-imperial-legacy");
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'retire', ?, ?, NULL, 'applied', ?)", args: [mixedAction, batchId, PHASE62_MIXED_IMPERIAL_SLUG, digest(`mixed:${PHASE62_MIXED_IMPERIAL_ID}`), PHASE62_MIXED_IMPERIAL_ID, "Ambiguous Chinese 帝国元首 may refer to Imperial or Legacy; retire without redirect until the two family identities are separately sourced."] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [PHASE62_MIXED_IMPERIAL_ID] });
    await tx.execute({ sql: "UPDATE entity_publications SET status = 'retired', blockers_json = ?, approved_content_hash = NULL, reviewed_content_revision = NULL, reviewed_contract_version = NULL, reviewed_by = NULL, reviewed_at = NULL, published_at = NULL, review_notes = ?, updated_at = datetime('now') WHERE entity_id = ?", args: ['["identity_ambiguous_imperial_legacy"]', "Phase 62 retired this Chinese mixed donor. Imperial and Legacy require separate canonical pages; no redirect is safe.", PHASE62_MIXED_IMPERIAL_ID] });
    await installRedirect(tx, { source: `/pen/${PHASE62_MIXED_IMPERIAL_SLUG}`, target: null, kind: "hard_404", actionId: mixedAction, batchId, reason: "ambiguous Chinese Imperial/Legacy donor retired; no verified canonical target" });
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase62SheafferP0Content(client: Client, options: ApplyPhase62Options): Promise<ApplyPhase62Result> {
  await assertOwned(client, options); await ensureIdentity(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase62SheafferPacks));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}

function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = cliValue("--database"); const ownedRoot = cliValue("--owned-root"); const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase62-sheaffer-p0-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { const result = await applyPhase62SheafferP0Content(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase62-sheaffer-curated-content", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
