import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE66_LEGACY_BRAND_ID, PHASE66_P36_ID, PHASE66_P36_RAW_SLUG, PHASE66_P36_SLUG, phase66AsvineP36Packs } from "./data/phase66-asvine-p36";

export type ApplyPhase66Options = ApplyPhase22Options;
export type ApplyPhase66Result = ApplyPhase22Result;

function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string) { return `${prefix}-${digest(value).slice(0, 24)}`; }
function inside(candidate: string, root: string) { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(env: NodeJS.ProcessEnv) { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 66 refuses inherited remote selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase66Options) {
  assertNoRemote(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 66 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 66 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 66 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 66 owned copy must be migrated through 032.");
}

async function resolveAsvineBrand(tx: Transaction): Promise<string> {
  const matches = await tx.execute({ sql: "SELECT id, type, slug, name FROM entities WHERE type = 'brand' AND (lower(slug) = 'asvine' OR lower(name) = 'asvine') ORDER BY id", args: [] });
  if (matches.rows.length > 1) throw new Error("Phase 66 Asvine brand lookup is ambiguous.");
  if (matches.rows.length === 1) {
    const row = matches.rows[0];
    if (String(row?.type) !== "brand") throw new Error("Phase 66 Asvine lookup has an invalid type.");
    const id = String(row?.id);
    await tx.execute({ sql: "UPDATE entities SET slug = 'asvine', name = 'Asvine' WHERE id = ?", args: [id] });
    return id;
  }
  const collision = await tx.execute({ sql: "SELECT id, type FROM entities WHERE slug = 'asvine'", args: [] });
  if (collision.rows.length > 0) throw new Error("Phase 66 cannot create Asvine brand because slug is occupied.");
  const brandId = stableId("phase66-brand", "asvine");
  await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'brand', 'asvine', 'Asvine')", args: [brandId] });
  return brandId;
}

async function installRedirect(tx: Transaction, source: string, target: string): Promise<void> {
  const current = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [source] });
  if (current.rows.length) {
    if (current.rows.length !== 1 || String(current.rows[0]?.target_path) !== target || String(current.rows[0]?.redirect_kind) !== "permanent") throw new Error(`Phase 66 redirect conflict: ${source}`);
    return;
  }
  const key = `${source}->${target}`; const batchId = stableId("phase66-batch", key); const actionId = stableId("phase66-action", key);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, key, digest(key), "Phase 66 P36 canonical route rename"] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, status, note) VALUES (?, ?, ?, 'rename', ?, 'applied', ?)", args: [actionId, batchId, key, digest(key), "P36 old Chinese route points to the only verified canonical model"] });
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')", args: [stableId("phase66-redirect", key), batchId, actionId, source, target] });
}

async function topology(client: Client): Promise<string> {
  const tx = await client.transaction("write");
  try {
    const p36 = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE66_P36_ID] });
    if (p36.rows.length !== 1 || String(p36.rows[0]?.type) !== "pen") throw new Error("Phase 66 P36 donor identity mismatch.");
    const existingSlug = String(p36.rows[0]?.slug);
    if (existingSlug !== PHASE66_P36_RAW_SLUG && existingSlug !== PHASE66_P36_SLUG) throw new Error(`Phase 66 unexpected P36 slug: ${existingSlug}`);
    const brandId = await resolveAsvineBrand(tx);
    if (existingSlug === PHASE66_P36_RAW_SLUG) {
      await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ? WHERE id = ?", args: [PHASE66_P36_SLUG, "Asvine P36 Titanium Piston-Filling Fountain Pen", PHASE66_P36_ID] });
    } else {
      await tx.execute({ sql: "UPDATE entities SET name = ? WHERE id = ?", args: ["Asvine P36 Titanium Piston-Filling Fountain Pen", PHASE66_P36_ID] });
    }
    await installRedirect(tx, `/pen/${PHASE66_P36_RAW_SLUG}`, `/pen/${PHASE66_P36_SLUG}`);
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [PHASE66_P36_ID, brandId] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase66-made-by", `${PHASE66_P36_ID}:${brandId}`), PHASE66_P36_ID, brandId, "Phase 66 Asvine P36 canonical maker topology"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase66-reverse", `${brandId}:${PHASE66_P36_ID}`), brandId, PHASE66_P36_ID, "Phase 66 Asvine brand-to-model navigation topology"] });
    const makers = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [PHASE66_P36_ID] });
    if (makers.rows.length !== 1 || String(makers.rows[0]?.target_id) !== brandId) throw new Error("Phase 66 P36 maker topology remains ambiguous.");
    const legacy = await tx.execute({ sql: "SELECT type FROM entities WHERE id = ?", args: [PHASE66_LEGACY_BRAND_ID] });
    if (legacy.rows.length === 1 && String(legacy.rows[0]?.type) !== "brand") throw new Error("Phase 66 YiSiHua legacy entity type mismatch.");
    await tx.commit();
    return brandId;
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase66AsvineP36Content(client: Client, options: ApplyPhase66Options): Promise<ApplyPhase66Result> {
  await assertOwned(client, options);
  const brandId = await topology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase66AsvineP36Packs(brandId)));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string) { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main() {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase66-asvine-p36-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { const result = await applyPhase66AsvineP36Content(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase66-asvine-p36-curated-content", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
