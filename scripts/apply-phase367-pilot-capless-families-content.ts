import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import {
  PHASE367_KASURI_ID,
  PHASE367_KASURI_SLUG,
  PHASE367_PILOT_BRAND_ID,
  PHASE367_SE_ID,
  PHASE367_SE_SLUG,
  PHASE367_SPECIAL_ALLOY_ID,
  PHASE367_SPECIAL_ALLOY_SLUG,
  PHASE367_STRIPE_ID,
  PHASE367_STRIPE_SLUG,
  phase367PilotCaplessFamilyPacks,
} from "./data/phase367-pilot-capless-families";

export type ApplyPhase367Options = ApplyPhase22Options;
export type ApplyPhase367Result = ApplyPhase22Result;

const MODELS = [
  { id: PHASE367_KASURI_ID, slug: PHASE367_KASURI_SLUG, name: "百乐 Pilot Capless 絣（Kasuri）" },
  { id: PHASE367_STRIPE_ID, slug: PHASE367_STRIPE_SLUG, name: "百乐 Pilot Capless Stripe（条纹）" },
  { id: PHASE367_SE_ID, slug: PHASE367_SE_SLUG, name: "百乐 Pilot Capless SE（大理石）" },
  { id: PHASE367_SPECIAL_ALLOY_ID, slug: PHASE367_SPECIAL_ALLOY_SLUG, name: "百乐 Pilot Capless 特殊合金（FCS-1）" },
] as const;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(options: ApplyPhase367Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) throw new Error(`Phase 367 refuses inherited remote database selection: ${key}.`);
  }
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function authority(client: Client, options: ApplyPhase367Options): Promise<void> {
  assertNoRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) {
    throw new Error("Phase 367 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 367 refuses the protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 367 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 367 owned copy must be migrated through 032.");
}

async function identity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const brand = await rows(client, "SELECT id,type,slug FROM entities WHERE id=?", [PHASE367_PILOT_BRAND_ID]);
  if (brand.length !== 1 || brand[0]?.type !== "brand" || brand[0]?.slug !== "pilot") throw new Error(`Phase 367 Pilot brand identity mismatch: ${JSON.stringify(brand)}`);
  for (const model of MODELS) {
    const pack = packs.find((item) => item.entityId === model.id);
    if (!pack) throw new Error(`Phase 367 pack missing: ${model.id}`);
    const existing = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [model.id, model.slug]);
    if (existing.length > 1 || (existing.length === 1 && (existing[0]?.id !== model.id || existing[0]?.type !== pack.expectedType || existing[0]?.slug !== pack.expectedSlug || existing[0]?.name !== pack.canonicalName))) {
      throw new Error(`Phase 367 identity collision for ${model.id}: ${JSON.stringify(existing)}`);
    }
  }
}

async function topology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    for (const model of MODELS) {
      await tx.execute({ sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [model.id, model.slug, model.name] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [model.id, PHASE367_PILOT_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [`phase367-made-by-${model.slug}`, model.id, PHASE367_PILOT_BRAND_ID, `Phase 367 verified Pilot maker relation for ${model.slug}`] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [`phase367-reverse-${model.slug}`, PHASE367_PILOT_BRAND_ID, model.id, `Phase 367 Pilot brand navigation to ${model.slug}`] });
      const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [model.id] });
      if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE367_PILOT_BRAND_ID) throw new Error(`Phase 367 maker topology is ambiguous for ${model.id}.`);
      const reverse = await tx.execute({ sql: "SELECT source_id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'", args: [PHASE367_PILOT_BRAND_ID, model.id] });
      if (reverse.rows.length !== 1 || String(reverse.rows[0]?.source_id) !== PHASE367_PILOT_BRAND_ID) throw new Error(`Phase 367 reverse topology is ambiguous for ${model.id}.`);
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase367PilotCaplessFamiliesContent(client: Client, options: ApplyPhase367Options): Promise<ApplyPhase367Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 367 reviewer must not be empty.");
  await authority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase367PilotCaplessFamilyPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await identity(client, packs);
  await topology(client);
  const result = await applyCuratedContentPacks(client, options, phase367PilotCaplessFamilyPacks);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase367-pilot-capless-families-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase367PilotCaplessFamiliesContent(client, {
      workspaceRoot: process.cwd(), reviewer: value("--reviewer") ?? "phase367-pilot-capless-families", databasePath: resolvedDatabase, ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
