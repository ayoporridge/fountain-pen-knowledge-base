import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE103_144_ID, PHASE103_144_OLD_SLUG, PHASE103_144_SLUG, PHASE103_22_ID, PHASE103_22_OLD_SLUG, PHASE103_22_SLUG, PHASE103_MONTBLANC_BRAND_ID, phase103MontblancVintagePacks } from "./data/phase103-montblanc-vintage-publish";

export type ApplyPhase103Options = ApplyPhase22Options;
export type ApplyPhase103Result = ApplyPhase22Result;
const MODELS = [
  { id: PHASE103_144_ID, oldSlug: PHASE103_144_OLD_SLUG, slug: PHASE103_144_SLUG, name: "Montblanc No. 144（1949 后战活塞款）" },
  { id: PHASE103_22_ID, oldSlug: PHASE103_22_OLD_SLUG, slug: PHASE103_22_SLUG, name: "Montblanc No. 22（1960–1970，中文市场常称“学生龙 22”）" },
] as const;
function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string) { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string) { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function rejectRemote(env: NodeJS.ProcessEnv) { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 103 refuses inherited remote database selection: ${key}.`); }
async function assertOwned(client: Client, options: ApplyPhase103Options) {
  rejectRemote(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, root)) throw new Error("Phase 103 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedCatalog, { bigint: true }); if (database === protectedCatalog || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 103 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main"); if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 103 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] }); if (migration.rows.length !== 1) throw new Error("Phase 103 owned copy must be migrated through 032.");
}
async function installRedirect(tx: Transaction, model: (typeof MODELS)[number]) {
  const source = `/pen/${model.oldSlug}`; const target = `/pen/${model.slug}`; const existing = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [source] });
  if (existing.rows.length === 1) { if (String(existing.rows[0]?.target_path) !== target || String(existing.rows[0]?.redirect_kind) !== "permanent") throw new Error(`Phase 103 redirect collision: ${source}`); return; }
  if (existing.rows.length > 1) throw new Error(`Phase 103 duplicate redirect: ${source}`);
  const key = `${model.id}:${source}->${target}`; const batch = stableId("phase103-batch", key); const action = stableId("phase103-action", key);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batch, key, digest(key), "Canonicalize sourced Montblanc vintage models without merging cross-generation siblings."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [action, batch, model.oldSlug, digest(key), model.id, model.id, "Canonicalize exact historic model identity and retain legacy route."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)", args: [stableId("phase103-lineage", key), batch, action, model.id, model.id] });
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_normalization')", args: [stableId("phase103-redirect", source), batch, action, source, target] });
}
async function ensureTopology(client: Client) {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE103_MONTBLANC_BRAND_ID] }); if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "montblanc") throw new Error("Phase 103 Montblanc brand identity mismatch.");
    for (const model of MODELS) {
      const current = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [model.id] }); const currentSlug = String(current.rows[0]?.slug); if (current.rows.length !== 1 || String(current.rows[0]?.type) !== "pen" || (currentSlug !== model.oldSlug && currentSlug !== model.slug)) throw new Error(`Phase 103 model identity mismatch: ${model.id}`);
      const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [model.slug, model.id] }); if (collision.rows.length) throw new Error(`Phase 103 slug collision: ${model.slug}`);
      if (String(current.rows[0]?.slug) === model.oldSlug) await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: [model.slug, model.name, model.id] });
      await installRedirect(tx, model);
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [model.id, PHASE103_MONTBLANC_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase103-made-by", model.id), model.id, PHASE103_MONTBLANC_BRAND_ID, "Phase 103 exact Montblanc historic model maker topology"] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase103-reverse", model.id), PHASE103_MONTBLANC_BRAND_ID, model.id, "Phase 103 Montblanc brand-model navigation"] });
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
async function ensureBrandNavigation(client: Client) {
  const tx = await client.transaction("write");
  try {
    const pens = await client.execute({ sql: "SELECT pen.id FROM public_entities pen JOIN entity_links maker ON maker.source_id=pen.id AND maker.target_id=? AND maker.link_type='made_by' WHERE pen.type='pen'", args: [PHASE103_MONTBLANC_BRAND_ID] });
    for (const pen of pens.rows) await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase103-all-reverse", String(pen.id)), PHASE103_MONTBLANC_BRAND_ID, String(pen.id), "Phase 103 public Montblanc model navigation repair"] });
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase103MontblancVintagePublishContent(client: Client, options: ApplyPhase103Options): Promise<ApplyPhase103Result> {
  await assertOwned(client, options); await ensureTopology(client); const result = await applyCuratedContentPacks(client, options, structuredClone(phase103MontblancVintagePacks)); await ensureBrandNavigation(client); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}
function value(name: string) { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main() { const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase103-montblanc-vintage-publish-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>"); const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` }); try { process.stdout.write(`${JSON.stringify(await applyPhase103MontblancVintagePublishContent(client, { workspaceRoot: process.cwd(), reviewer: "phase103-montblanc-vintage", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); } }
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
