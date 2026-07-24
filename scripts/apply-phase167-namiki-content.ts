import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE167_IDS, PHASE167_NAMIKI_BRAND_ID, PHASE167_OLD_SLUGS, PHASE167_SLUGS, phase167NamikiPacks } from "./data/phase167-namiki";

export type ApplyPhase167Options = ApplyPhase22Options;
export type ApplyPhase167Result = ApplyPhase22Result;

function stableId(prefix: string, value: string): string { return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function noRemote(options: ApplyPhase167Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 167 refuses inherited remote database selection: ${key}.`); }

async function authority(client: Client, options: ApplyPhase167Options): Promise<void> {
  noRemote(options); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 167 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true }); const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 167 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 167 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 167 owned copy must be migrated through 032.");
}

async function ensureIdentity(client: Client): Promise<void> {
  const brand = await client.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [PHASE167_NAMIKI_BRAND_ID] });
  if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== PHASE167_SLUGS.brand) throw new Error("Phase 167 Namiki brand identity mismatch.");
  const models = [
    { id: PHASE167_IDS.emperor, oldSlug: PHASE167_OLD_SLUGS.emperor, slug: PHASE167_SLUGS.emperor, name: "Namiki Emperor" },
    { id: PHASE167_IDS.yukariRoyale, oldSlug: PHASE167_OLD_SLUGS.yukariRoyale, slug: PHASE167_SLUGS.yukariRoyale, name: "Namiki Yukari Royale" },
    { id: PHASE167_IDS.risingDragon, oldSlug: PHASE167_OLD_SLUGS.risingDragon, slug: PHASE167_SLUGS.risingDragon, name: "Namiki Rising Dragon 95th Anniversary" },
  ];
  const tx = await client.transaction("write");
  try {
    const batchKey = "phase167-namiki-identity"; const batchId = stableId("phase167-batch", batchKey); const batchChecksum = createHash("sha256").update(batchKey).digest("hex");
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)", args: [batchId, batchKey, batchChecksum, "Canonicalize Namiki representative model routes and preserve old routes as permanent redirects."] });
    for (const model of models) {
      const row = await tx.execute({ sql: "SELECT type,slug,name FROM entities WHERE id=?", args: [model.id] });
      if (row.rows.length !== 1 || String(row.rows[0]?.type) !== "pen") throw new Error(`Phase 167 Namiki model identity missing: ${model.id}`);
      const currentSlug = String(row.rows[0]?.slug);
      if (currentSlug !== model.slug && currentSlug !== model.oldSlug) throw new Error(`Phase 167 unexpected Namiki slug for ${model.id}: ${currentSlug}`);
      const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug=? AND id<>?", args: [model.slug, model.id] });
      if (collision.rows.length !== 0) throw new Error(`Phase 167 canonical slug collision: ${model.slug}`);
      const actionKey = `phase167-namiki-rename:${model.id}`; const actionId = stableId("phase167-action", actionKey);
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'rename',?,?,?,?,?)", args: [actionId, batchId, actionKey, createHash("sha256").update(actionKey).digest("hex"), model.id, model.id, "applied", `Use /pen/${model.slug} as the canonical Namiki model route.`] });
      if (currentSlug === model.oldSlug) await tx.execute({ sql: "UPDATE entities SET slug=?,name=?,updated_at=datetime('now') WHERE id=?", args: [model.slug, model.name, model.id] });
      const sourcePath = `/pen/${model.oldSlug}`; const targetPath = `/pen/${model.slug}`;
      const redirect = await tx.execute({ sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?", args: [sourcePath] });
      if (redirect.rows.length === 0) await tx.execute({ sql: "INSERT INTO entity_redirects(id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES(?,?,?,?,?,'permanent','canonical_slug_rename')", args: [stableId("phase167-redirect", sourcePath), batchId, actionId, sourcePath, targetPath] });
      else if (redirect.rows.length !== 1 || String(redirect.rows[0]?.target_path) !== targetPath || String(redirect.rows[0]?.redirect_kind) !== "permanent") throw new Error(`Phase 167 conflicting redirect: ${sourcePath}`);
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    for (const penId of Object.values(PHASE167_IDS)) {
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [penId, PHASE167_NAMIKI_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [stableId("phase167-made-by", penId), penId, PHASE167_NAMIKI_BRAND_ID, "Phase 167 verified Namiki maker relation"] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse' AND id<>?", args: [PHASE167_NAMIKI_BRAND_ID, penId, stableId("phase167-reverse", penId)] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [stableId("phase167-reverse", penId), PHASE167_NAMIKI_BRAND_ID, penId, "Phase 167 Namiki brand navigation"] });
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase167Namiki(client: Client, options: ApplyPhase167Options): Promise<ApplyPhase167Result> {
  await authority(client, options); await ensureIdentity(client); await ensureTopology(client);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot); const packs = phase167NamikiPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  const result = await applyCuratedContentPacks(client, options, packs); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}

function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> { const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase167-namiki-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]"); const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` }); try { const result = await applyPhase167Namiki(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase167-namiki", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); } }
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
