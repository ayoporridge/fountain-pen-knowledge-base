import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE64_AERO_ID, PHASE64_AERO_SLUG, PHASE64_CAMPUS_ID, PHASE64_CAMPUS_SLUG, PHASE64_DIPLOMAT_ID, PHASE64_ONLINE_ID, PHASE64_ONLINE_SLUG, phase64DiplomatOnlinePacks } from "./data/phase64-diplomat-online";

export type ApplyPhase64Options = ApplyPhase22Options;
export type ApplyPhase64Result = ApplyPhase22Result;
function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string) { return `${prefix}-${digest(value).slice(0, 24)}`; }
function inside(candidate: string, root: string) { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemote(env: NodeJS.ProcessEnv) { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 64 refuses inherited remote selection: ${key}.`); }
async function assertOwned(client: Client, options: ApplyPhase64Options) {
  assertNoRemote(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 64 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 64 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 64 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 64 owned copy must be migrated through 032.");
}
async function redirect(tx: Transaction, source: string, target: string): Promise<void> {
  const current = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [source] });
  if (current.rows.length) { if (String(current.rows[0]?.target_path) !== target || String(current.rows[0]?.redirect_kind) !== "permanent") throw new Error(`Phase 64 redirect conflict: ${source}`); return; }
  const key = `${source}->${target}`; const batchId = stableId("phase64-batch", key); const actionId = stableId("phase64-action", key);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, key, digest(key), "Phase 64 Diplomat/ONLINE canonical route rename"] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, status, note) VALUES (?, ?, ?, 'rename', ?, 'applied', ?)", args: [actionId, batchId, key, digest(key), "Canonical route and identity correction"] });
  try {
    await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')", args: [stableId("phase64-redirect", key), batchId, actionId, source, target] });
  } catch (error) {
    throw new Error(`Phase 64 invalid redirect ${source} -> ${target}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function rename(tx: Transaction, input: { id: string; type: "brand" | "pen"; oldSlug: string; slug: string; name: string }): Promise<void> {
  const entity = await tx.execute({ sql: "SELECT type, slug, name FROM entities WHERE id = ?", args: [input.id] });
  if (entity.rows.length !== 1 || String(entity.rows[0]?.type) !== input.type) throw new Error(`Phase 64 missing ${input.type}: ${input.id}`);
  const actual = String(entity.rows[0]?.slug);
  if (actual !== input.oldSlug && actual !== input.slug) throw new Error(`Phase 64 unexpected slug for ${input.id}: ${actual}`);
  if (actual === input.slug) {
    if (String(entity.rows[0]?.name) !== input.name) {
      await tx.execute({ sql: "UPDATE entities SET name = ? WHERE id = ?", args: [input.name, input.id] });
    }
    return;
  }
  if (actual === input.oldSlug) { await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ? WHERE id = ?", args: [input.slug, input.name, input.id] }); await redirect(tx, `/${input.type}/${input.oldSlug}`, `/${input.type}/${input.slug}`); }
}
async function ensureMaker(tx: Transaction, penId: string, brandId: string, note: string) {
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [penId, brandId] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase64-link", `${penId}:made_by:${brandId}`), penId, brandId, note] });
  const rows = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [penId] });
  if (rows.rows.length !== 1 || String(rows.rows[0]?.target_id) !== brandId) throw new Error(`Phase 64 ambiguous maker: ${penId}`);
}
async function topology(client: Client) {
  const tx = await client.transaction("write");
  try {
    await rename(tx, { id: PHASE64_DIPLOMAT_ID, type: "brand", oldSlug: "diplomat", slug: "diplomat", name: "Diplomat" });
    await rename(tx, { id: PHASE64_AERO_ID, type: "pen", oldSlug: "diplomat迪波曼-aero太空梭", slug: PHASE64_AERO_SLUG, name: "Diplomat Aero" });
    await rename(tx, { id: PHASE64_ONLINE_ID, type: "brand", oldSlug: "campus", slug: PHASE64_ONLINE_SLUG, name: "ONLINE Schreibgeräte" });
    await rename(tx, { id: PHASE64_CAMPUS_ID, type: "pen", oldSlug: "欧领-campus-校园系列", slug: PHASE64_CAMPUS_SLUG, name: "ONLINE Campus" });
    await ensureMaker(tx, PHASE64_AERO_ID, PHASE64_DIPLOMAT_ID, "Phase 64 Diplomat Aero canonical maker topology");
    await ensureMaker(tx, PHASE64_CAMPUS_ID, PHASE64_ONLINE_ID, "Phase 64 ONLINE Campus canonical maker topology");
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}
export async function applyPhase64DiplomatOnlineContent(client: Client, options: ApplyPhase64Options): Promise<ApplyPhase64Result> {
  await assertOwned(client, options);
  await topology(client);
  const diplomatIds = new Set([PHASE64_DIPLOMAT_ID, PHASE64_AERO_ID]);
  const onlineIds = new Set([PHASE64_ONLINE_ID, PHASE64_CAMPUS_ID]);
  const entities: ApplyPhase64Result["entities"] = [];
  for (const group of [
    phase64DiplomatOnlinePacks.filter((pack) => diplomatIds.has(pack.entityId)),
    phase64DiplomatOnlinePacks.filter((pack) => onlineIds.has(pack.entityId)),
  ]) {
    const result = await applyCuratedContentPacks(
      client,
      options,
      structuredClone(group),
    );
    entities.push(...result.entities);
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities };
}
function value(name: string) { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main() {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase64-diplomat-online-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { const result = await applyPhase64DiplomatOnlineContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase64-diplomat-online-curated-content", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
