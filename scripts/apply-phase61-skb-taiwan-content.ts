import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import {
  PHASE61_ES520_ID,
  PHASE61_ES520_SLUG,
  PHASE61_MIXED_OLD_SLUG,
  PHASE61_MIXED_PEN_ID,
  PHASE61_RS301N_ID,
  PHASE61_RS301N_SLUG,
  PHASE61_SKB_BRAND_ID,
  phase61SkbTaiwanPacks,
} from "./data/phase61-skb-taiwan";

export type ApplyPhase61Options = ApplyPhase22Options;
export type ApplyPhase61Result = ApplyPhase22Result;

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 61 refuses inherited remote selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase61Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) throw new Error("Phase 61 owned catalog authority check failed.");
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)) throw new Error("Phase 61 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 61 client is not bound to an owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 61 owned copy must be migrated through 032.");
}

async function ensurePen(tx: Transaction, input: { id: string; slug: string; name: string }): Promise<void> {
  const existing = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id", args: [input.id, input.slug] });
  if (existing.rows.length === 0) {
    await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [input.id, input.slug, input.name] });
  } else if (existing.rows.length !== 1 || String(existing.rows[0]?.id) !== input.id || String(existing.rows[0]?.type) !== "pen" || String(existing.rows[0]?.slug) !== input.slug) {
    throw new Error(`Phase 61 pen identity/slug collision: ${input.id}/${input.slug}`);
  }
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [input.id, PHASE61_SKB_BRAND_ID] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase61-link", `${input.id}:made_by:${PHASE61_SKB_BRAND_ID}`), input.id, PHASE61_SKB_BRAND_ID, "Phase 61 Taiwan SKB canonical maker topology"] });
  const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [input.id] });
  if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE61_SKB_BRAND_ID) throw new Error(`Phase 61 maker topology failed: ${input.id}`);
}

async function retireMixedIdentity(tx: Transaction): Promise<void> {
  const mixed = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE61_MIXED_PEN_ID] });
  if (mixed.rows.length !== 1 || String(mixed.rows[0]?.type) !== "pen" || String(mixed.rows[0]?.slug) !== PHASE61_MIXED_OLD_SLUG) throw new Error("Phase 61 mixed SKB/Penton identity mismatch.");
  const batchKey = "phase61-skb-penton-mixed-retire-v1";
  const batchId = stableId("phase61-batch", batchKey);
  const actionId = stableId("phase61-action", batchKey);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, batchKey, digest(batchKey), "Retire unverified mixed SKB/Penton F10/F21 identity without a replacement redirect."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'retire', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, batchKey, digest(`${batchKey}\0${PHASE61_MIXED_PEN_ID}`), PHASE61_MIXED_PEN_ID, PHASE61_MIXED_PEN_ID, "Identity unresolved: no redirect to Taiwan SKB, RS-301N, ES-520, F10, or any future Penton page."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'retire', ?)", args: [stableId("phase61-lineage", batchKey), batchId, actionId, PHASE61_MIXED_PEN_ID, PHASE61_MIXED_PEN_ID, "Identity unresolved; preserved audit payload without canonical successor."] });
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [PHASE61_MIXED_PEN_ID] });
  await tx.execute({ sql: "DELETE FROM entity_redirects WHERE source_path = ?", args: [`/pen/${PHASE61_MIXED_OLD_SLUG}`] });
  await tx.execute({ sql: "UPDATE entity_publications SET status = 'retired', blockers_json = ?, approved_content_hash = NULL, reviewed_content_revision = NULL, reviewed_contract_version = NULL, reviewed_by = NULL, reviewed_at = NULL, published_at = NULL, review_notes = ?, updated_at = datetime('now') WHERE entity_id = ?", args: ['["identity_unresolved_not_taiwan_skb"]', "Phase 61 retired mixed SKB/Penton F10/F21 placeholder. Identity is unresolved and this route intentionally has no redirect.", PHASE61_MIXED_PEN_ID] });
  const maker = await tx.execute({ sql: "SELECT count(*) AS total FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [PHASE61_MIXED_PEN_ID] });
  if (Number(maker.rows[0]?.total ?? 0) !== 0) throw new Error("Phase 61 retired mixed identity still has a maker link.");
  const redirect = await tx.execute({ sql: "SELECT count(*) AS total FROM entity_redirects WHERE source_path = ?", args: [`/pen/${PHASE61_MIXED_OLD_SLUG}`] });
  if (Number(redirect.rows[0]?.total ?? 0) !== 0) throw new Error("Phase 61 retired mixed identity still redirects.");
}

async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ?", args: [PHASE61_SKB_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "skb") throw new Error("Phase 61 Taiwan SKB brand identity mismatch.");
    await ensurePen(tx, { id: PHASE61_RS301N_ID, slug: PHASE61_RS301N_SLUG, name: "SKB RS-301N" });
    await ensurePen(tx, { id: PHASE61_ES520_ID, slug: PHASE61_ES520_SLUG, name: "SKB ES-520" });
    await retireMixedIdentity(tx);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase61SkbTaiwanContent(client: Client, options: ApplyPhase61Options): Promise<ApplyPhase61Result> {
  await assertOwned(client, options);
  await ensureTopology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase61SkbTaiwanPacks));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }

async function main(): Promise<void> {
  const workspaceRoot = process.cwd();
  const databasePath = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalogPath = cliValue("--protected-catalog");
  if (!databasePath || !ownedRoot || !protectedCatalogPath) throw new Error("Usage: tsx scripts/apply-phase61-skb-taiwan-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    const result = await applyPhase61SkbTaiwanContent(client, { workspaceRoot, reviewer: cliValue("--reviewer") ?? "phase61-skb-taiwan-curated-content", databasePath: path.resolve(databasePath), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalogPath), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalogPath)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally { client.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
