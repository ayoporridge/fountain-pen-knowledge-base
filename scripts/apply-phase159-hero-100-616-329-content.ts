import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE159_HERO_BRAND_ID, PHASE159_IDS, PHASE159_OLD_SLUGS, PHASE159_SLUGS, phase159HeroPacks } from "./data/phase159-hero-100-616-329";

export type ApplyPhase159Options = ApplyPhase22Options;
export type ApplyPhase159Result = ApplyPhase22Result;

function stableId(prefix: string, value: string): string { return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function noRemote(options: ApplyPhase159Options): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (options.env?.[key]?.trim()) throw new Error(`Phase 159 refuses inherited remote database selection: ${key}.`); }

async function authority(client: Client, options: ApplyPhase159Options): Promise<void> {
  noRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) throw new Error("Phase 159 requires an owned, non-symlink catalog copy.");
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 159 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 159 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 159 owned copy must be migrated through 032.");
}

const TARGETS = [
  { id: PHASE159_IDS.hero100, oldSlug: PHASE159_OLD_SLUGS.hero100, slug: PHASE159_SLUGS.hero100, name: "英雄 Hero 100" },
  { id: PHASE159_IDS.hero616, oldSlug: PHASE159_OLD_SLUGS.hero616, slug: PHASE159_SLUGS.hero616, name: "英雄 Hero 616" },
  { id: PHASE159_IDS.hero329, oldSlug: PHASE159_OLD_SLUGS.hero329, slug: PHASE159_SLUGS.hero329, name: "英雄 Hero 329" },
] as const;

async function ensureIdentity(client: Client, target: (typeof TARGETS)[number]): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const row = await tx.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [target.id] });
    if (row.rows.length !== 1 || String(row.rows[0]?.type) !== "pen") throw new Error(`Phase 159 missing or invalid Hero entity: ${target.id}`);
    const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug=? AND id<>?", args: [target.slug, target.id] });
    if (collision.rows.length !== 0) throw new Error(`Phase 159 canonical slug collision: ${target.slug}`);
    await tx.execute({ sql: "UPDATE entities SET slug=?, name=? WHERE id=?", args: [target.slug, target.name, target.id] });
    const batchKey = `phase159-hero-${target.slug}-canonical`;
    const batchId = stableId("phase159-batch", batchKey);
    const actionId = stableId("phase159-action", batchKey);
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id,source_key,source_checksum,status,note) VALUES (?,?,?,'applied',?)", args: [batchId, batchKey, createHash("sha256").update(batchKey).digest("hex"), `Canonicalize ${target.name} route.`] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES (?,?,?,'rename',?,?,?,?,?)", args: [actionId, batchId, batchKey, createHash("sha256").update(`${batchKey}:rename`).digest("hex"), target.id, target.id, "applied", `Use /pen/${target.slug} as the unambiguous ${target.name} route.`] });
    const sourcePath = `/pen/${target.oldSlug}`;
    const targetPath = `/pen/${target.slug}`;
    const redirect = await tx.execute({ sql: "SELECT redirect_kind,target_path FROM entity_redirects WHERE source_path=?", args: [sourcePath] });
    if (redirect.rows.length === 0) await tx.execute({ sql: "INSERT INTO entity_redirects (id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES (?,?,?,?,?,'permanent',?)", args: [stableId("phase159-redirect", target.oldSlug), batchId, actionId, sourcePath, targetPath, "canonical_model_route"] });
    else if (String(redirect.rows[0]?.redirect_kind) !== "permanent" || String(redirect.rows[0]?.target_path) !== targetPath) throw new Error(`Phase 159 conflicting redirect for ${target.oldSlug}.`);
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

async function ensureIdentityIfNeeded(client: Client): Promise<void> {
  for (const target of TARGETS) {
    const row = await client.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [target.id] });
    if (row.rows.length !== 1 || String(row.rows[0]?.type) !== "pen") throw new Error(`Phase 159 Hero entity is missing or has the wrong type: ${target.id}`);
    const slug = String(row.rows[0]?.slug);
    if (slug === target.oldSlug) await ensureIdentity(client, target);
    else if (slug !== target.slug) throw new Error(`Phase 159 unexpected Hero slug for ${target.id}: ${slug}`);
  }
}

async function topology(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [PHASE159_HERO_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "hero") throw new Error("Phase 159 Hero brand identity mismatch.");
    for (const target of TARGETS) {
      const pen = await tx.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [target.id] });
      if (pen.rows.length !== 1 || String(pen.rows[0]?.type) !== "pen" || String(pen.rows[0]?.slug) !== target.slug) throw new Error(`Phase 159 canonical identity mismatch after rename: ${target.slug}`);
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [target.id, PHASE159_HERO_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [stableId("phase159-made-by", target.id), target.id, PHASE159_HERO_BRAND_ID, `Phase 159 verified ${target.name} maker relation`] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse' AND id<>?", args: [PHASE159_HERO_BRAND_ID, target.id, stableId("phase159-reverse", target.id)] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [stableId("phase159-reverse", target.id), PHASE159_HERO_BRAND_ID, target.id, `Phase 159 Hero brand-to-${target.slug} navigation`] });
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase159HeroContent(client: Client, options: ApplyPhase159Options): Promise<ApplyPhase159Result> {
  await authority(client, options);
  await ensureIdentityIfNeeded(client);
  await topology(client);
  const packs = phase159HeroPacks.map((pack) => loadCuratedEntityPack(fs.realpathSync.native(options.workspaceRoot), pack));
  const result = await applyCuratedContentPacks(client, options, packs);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }

async function main(): Promise<void> {
  const database = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase159-hero-100-616-329-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database); const resolvedProtected = path.resolve(protectedCatalog); const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase159HeroContent(client, { workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase159-hero-100-616-329", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally { client.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
