import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { publishEntity, recordEntityContentReview } from "../src/lib/publication";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import {
  PHASE293_FC_BRAND_ID,
  PHASE293_MODEL02_ID,
  PHASE293_MODEL02_SLUG,
  phase293FranklinChristophModel02Packs,
} from "./data/phase293-franklin-christoph-model02";

export type ApplyPhase293Options = ApplyPhase22Options;
export type ApplyPhase293Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 293 refuses inherited remote database selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase293Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 293 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, root)) {
    throw new Error("Phase 293 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || Number(own.nlink) !== 1 || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) {
    throw new Error("Phase 293 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 293 client is not bound to the authorized owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 293 owned copy must be migrated through 032.");
}

async function ensureIdentity(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT id,type,slug,name FROM entities WHERE id=?", args: [PHASE293_FC_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "franklin-christoph" || String(brand.rows[0]?.name) !== "Franklin-Christoph") throw new Error(`Phase 293 Franklin-Christoph brand identity mismatch: ${JSON.stringify(brand.rows)}`);
    const collisions = await tx.execute({ sql: "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id", args: [PHASE293_MODEL02_ID, PHASE293_MODEL02_SLUG] });
    if (collisions.rows.length === 0) {
      await tx.execute({ sql: "INSERT INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [PHASE293_MODEL02_ID, PHASE293_MODEL02_SLUG, "Franklin-Christoph Model 02 Intrinsic"] });
    } else if (collisions.rows.length !== 1 || String(collisions.rows[0]?.id) !== PHASE293_MODEL02_ID || String(collisions.rows[0]?.type) !== "pen" || String(collisions.rows[0]?.slug) !== PHASE293_MODEL02_SLUG || String(collisions.rows[0]?.name) !== "Franklin-Christoph Model 02 Intrinsic") {
      throw new Error(`Phase 293 Model 02 identity collision: ${JSON.stringify(collisions.rows)}`);
    }
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [PHASE293_MODEL02_ID, PHASE293_FC_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?, ?, ?, 'made_by', ?)", args: [`phase293-made-by-${PHASE293_MODEL02_ID}`, PHASE293_MODEL02_ID, PHASE293_FC_BRAND_ID, "Phase 293 verified Franklin-Christoph Model 02 Intrinsic maker relation"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?, ?, ?, 'reverse', ?)", args: [`phase293-reverse-${PHASE293_MODEL02_ID}`, PHASE293_FC_BRAND_ID, PHASE293_MODEL02_ID, "Phase 293 Franklin-Christoph brand-to-Model-02 navigation"] });
    const makers = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", args: [PHASE293_MODEL02_ID] });
    if (makers.rows.length !== 1 || String(makers.rows[0]?.target_id) !== PHASE293_FC_BRAND_ID) throw new Error(`Phase 293 maker topology remains ambiguous: ${JSON.stringify(makers.rows)}`);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

async function republishBrand(client: Client, reviewer: string): Promise<void> {
  const current = await client.execute({ sql: "SELECT publication.status, readiness.publishable, readiness.blocker_count, CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entity_publications publication LEFT JOIN public_entity_readiness readiness ON readiness.entity_id=publication.entity_id AND readiness.contract_version=3 LEFT JOIN public_entities public ON public.id=publication.entity_id WHERE publication.entity_id=?", args: [PHASE293_FC_BRAND_ID] });
  if (current.rows.length !== 1) throw new Error("Phase 293 Franklin-Christoph brand publication state is missing.");
  const row = current.rows[0];
  if (String(row?.status) === "published" && Number(row?.publishable) === 1 && Number(row?.blocker_count) === 0 && Number(row?.is_public) === 1) return;
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, { entityId: PHASE293_FC_BRAND_ID, reviewKind, reviewer, status: "approved", notes: "Phase 293 re-approves the Franklin-Christoph brand navigation after adding the exact Model 02 relation." });
  }
  await publishEntity(client, { entityId: PHASE293_FC_BRAND_ID, reviewer });
}

export async function applyPhase293FranklinChristophModel02Content(client: Client, options: ApplyPhase293Options): Promise<ApplyPhase293Result> {
  await assertOwned(client, options);
  await ensureIdentity(client);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase293FranklinChristophModel02Packs.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  const result = await applyCuratedContentPacks(client, options, packs);
  await republishBrand(client, options.reviewer.trim());
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase293-franklin-christoph-model02-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <catalog> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase293FranklinChristophModel02Content(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase293-franklin-christoph-model02",
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
}
