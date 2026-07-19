import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE67_MODELS, PHASE67_SAILOR_BRAND_ID, phase67SailorJ2Packs, type Phase67Model } from "./data/phase67-sailor-j2";

export type ApplyPhase67Options = ApplyPhase22Options;
export type ApplyPhase67Result = ApplyPhase22Result;

function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string) { return `${prefix}-${digest(value).slice(0, 24)}`; }
function inside(candidate: string, root: string) { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(env: NodeJS.ProcessEnv) { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 67 refuses inherited remote selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase67Options) {
  assertNoRemote(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 67 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 67 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 67 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 67 owned copy must be migrated through 032.");
}

async function resolveModels(client: Client): Promise<Phase67Model[]> {
  const resolved: Phase67Model[] = [];
  for (const model of PHASE67_MODELS) {
    const result = await client.execute({ sql: "SELECT id, type, slug FROM entities WHERE slug IN (?, ?)", args: [model.rawSlug, model.slug] });
    if (result.rows.length !== 1 || String(result.rows[0]?.type) !== "pen") throw new Error(`Phase 67 requires exactly one raw or canonical pen for ${model.rawSlug}; found ${result.rows.length}.`);
    resolved.push({ ...model, id: String(result.rows[0]?.id) });
  }
  return resolved;
}

async function installRedirect(tx: Transaction, input: { source: string; target: string; actionId: string; batchId: string }) {
  const existing = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [input.source] });
  if (existing.rows.length) { if (String(existing.rows[0]?.target_path) !== input.target || String(existing.rows[0]?.redirect_kind) !== "permanent") throw new Error(`Phase 67 redirect collision: ${input.source}`); return; }
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')", args: [stableId("phase67-redirect", input.source), input.batchId, input.actionId, input.source, input.target] });
}

async function ensureMaker(tx: Transaction, id: string) {
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [id, PHASE67_SAILOR_BRAND_ID] });
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by' AND id <> (SELECT min(id) FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by')", args: [id, PHASE67_SAILOR_BRAND_ID, id, PHASE67_SAILOR_BRAND_ID] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase67-made-by", id), id, PHASE67_SAILOR_BRAND_ID, "Phase 67 Sailor J2 canonical maker topology"] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase67-reverse", id), PHASE67_SAILOR_BRAND_ID, id, "Phase 67 Sailor J2 brand model navigation"] });
  const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [id] });
  if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE67_SAILOR_BRAND_ID) throw new Error(`Phase 67 maker topology ambiguous: ${id}`);
}

async function topology(client: Client, models: Phase67Model[]) {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE67_SAILOR_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "sailor") throw new Error("Phase 67 Sailor brand identity mismatch.");
    const batchKey = "phase67-sailor-j2-canonical-v1"; const batchId = stableId("phase67-batch", batchKey);
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, batchKey, digest(batchKey), "Canonicalize four sourced Sailor raw rows; preserve historical versus current product boundaries."] });
    for (const model of models) {
      const row = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [model.id] }); const current = String(row.rows[0]?.slug ?? "");
      if (row.rows.length !== 1 || String(row.rows[0]?.type) !== "pen" || (current !== model.rawSlug && current !== model.slug)) throw new Error(`Phase 67 identity mismatch: ${model.id}/${current}`);
      if (current === model.rawSlug) await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: [model.slug, model.name, model.id] });
      await ensureMaker(tx, model.id);
      const actionId = stableId("phase67-action", model.id);
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'retire', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, model.rawSlug, digest(`${model.id}:${model.rawSlug}:${model.slug}`), model.id, model.id, `Canonicalized ${model.rawSlug} to ${model.slug}.`] });
      await installRedirect(tx, { source: `/pen/${model.rawSlug}`, target: `/pen/${model.slug}`, actionId, batchId });
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase67SailorJ2Content(client: Client, options: ApplyPhase67Options): Promise<ApplyPhase67Result> {
  await assertOwned(client, options);
  const models = await resolveModels(client);
  await topology(client, models);
  const result = await applyCuratedContentPacks(client, options, phase67SailorJ2Packs(models));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string) { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main() {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase67-sailor-j2-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { const result = await applyPhase67SailorJ2Content(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase67-sailor-j2-curated-content", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
