import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE83_MODELS, PHASE83_SAILOR_BRAND_ID, phase83SailorRawV3Packs, type Phase83Model } from "./data/phase83-sailor-raw-v3";

export type ApplyPhase83Options = ApplyPhase22Options;
export type ApplyPhase83Result = ApplyPhase22Result;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const stableId = (prefix: string, value: string) => `${prefix}-${digest(value).slice(0, 24)}`;
function inside(candidate: string, root: string) { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(env: NodeJS.ProcessEnv) { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 83 refuses inherited remote selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase83Options) {
  assertNoRemote(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 83 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 83 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 83 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 83 owned copy must be migrated through 032.");
}

async function exactModels(client: Client): Promise<Phase83Model[]> {
  const models: Phase83Model[] = [];
  for (const model of PHASE83_MODELS) {
    const result = await client.execute({ sql: "SELECT id, type, slug FROM entities WHERE slug IN (?, ?, ?) ORDER BY id", args: [model.rawSlug, model.previousSlug ?? "__phase83_no_previous_slug__", model.slug] });
    if (result.rows.length !== 1 || String(result.rows[0]?.type) !== "pen") throw new Error(`Phase 83 requires exactly one exact raw/current/canonical pen for ${model.rawSlug}; found ${result.rows.length}.`);
    models.push({ ...model, id: String(result.rows[0]?.id) });
  }
  return models;
}

async function ensureTopology(client: Client, models: Phase83Model[]) {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE83_SAILOR_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "sailor") throw new Error("Phase 83 Sailor brand identity mismatch.");
    const batchKey = "phase83-sailor-raw-v3-identity"; const batchId = stableId("phase83-batch", batchKey);
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, batchKey, digest(batchKey), "Strict exact Sailor raw-row update; preserve historical/current SKU boundaries."] });
    for (const model of models) {
      const row = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [model.id] });
      if (row.rows.length !== 1 || String(row.rows[0]?.type) !== "pen") throw new Error(`Phase 83 target type mismatch: ${model.id}.`);
      const current = String(row.rows[0]?.slug); if (current !== model.rawSlug && current !== model.previousSlug && current !== model.slug) throw new Error(`Phase 83 refuses non-exact identity ${model.id}/${current}.`);
      const actionId = stableId("phase83-action", model.id);
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'retire', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, model.rawSlug, digest(`${model.id}:${model.rawSlug}:${model.slug}`), model.id, model.id, `Canonicalized only exact raw slug ${model.rawSlug}.`] });
      if (current !== model.slug) {
        const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [model.slug, model.id] }); if (collision.rows.length) throw new Error(`Phase 83 canonical slug collision: ${model.slug}.`);
        await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: [model.slug, model.name, model.id] });
      }
      for (const sourceSlug of [model.rawSlug, ...(model.previousSlug ? [model.previousSlug] : [])]) {
        const existingRedirect = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [`/pen/${sourceSlug}`] });
        if (existingRedirect.rows.length > 1 || (existingRedirect.rows.length === 1 && String(existingRedirect.rows[0]?.redirect_kind) !== "permanent")) throw new Error(`Phase 83 raw-route redirect collision: ${sourceSlug}.`);
        if (!existingRedirect.rows.length) await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')", args: [stableId("phase83-redirect", sourceSlug), batchId, actionId, `/pen/${sourceSlug}`, `/pen/${model.slug}`] });
        else if (String(existingRedirect.rows[0]?.target_path) !== `/pen/${model.slug}`) await tx.execute({ sql: "UPDATE entity_redirects SET target_path = ?, batch_id = ?, action_id = ?, fallback_reason = 'canonical_slug_rename' WHERE source_path = ?", args: [`/pen/${model.slug}`, batchId, actionId, `/pen/${sourceSlug}`] });
      }
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [model.id, PHASE83_SAILOR_BRAND_ID] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by' AND id <> (SELECT min(id) FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by')", args: [model.id, PHASE83_SAILOR_BRAND_ID, model.id, PHASE83_SAILOR_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase83-made-by", model.id), model.id, PHASE83_SAILOR_BRAND_ID, "Phase 83 exact Sailor maker topology"] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase83-reverse", model.id), PHASE83_SAILOR_BRAND_ID, model.id, "Phase 83 Sailor brand model navigation"] });
      const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [model.id] }); if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE83_SAILOR_BRAND_ID) throw new Error(`Phase 83 maker ambiguity: ${model.id}.`);
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase83SailorRawV3Content(client: Client, options: ApplyPhase83Options): Promise<ApplyPhase83Result> {
  await assertOwned(client, options); const models = await exactModels(client); await ensureTopology(client, models);
  const result = await applyCuratedContentPacks(client, options, phase83SailorRawV3Packs(models)); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}
function arg(name: string) { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main() {
  const database = arg("--database"), ownedRoot = arg("--owned-root"), protectedCatalog = arg("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase83-sailor-raw-v3-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { process.stdout.write(`${JSON.stringify(await applyPhase83SailorRawV3Content(client, { workspaceRoot: process.cwd(), reviewer: arg("--reviewer") ?? "phase83-sailor-raw-v3", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
