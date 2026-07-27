import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";
import {
  PHASE291_ESTERBROOK_BRAND_ID,
  PHASE291_MODEL_J_ID,
  PHASE291_MODEL_J_SLUG,
  phase291EsterbrookModelJPacks,
} from "./data/phase291-esterbrook-model-j";
import { phase69EsterbrookEstiePacks } from "./data/phase69-esterbrook-estie";

export type ApplyPhase291Options = ApplyPhase22Options;
export type ApplyPhase291Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 291 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase291Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 291 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !inside(database, ownedRoot)) {
    throw new Error("Phase 291 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) {
    throw new Error("Phase 291 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 291 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 291 owned copy must be migrated through 032.");
}

async function assertIdentity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  if (!packs.some((pack) => pack.entityId === PHASE291_MODEL_J_ID)) {
    throw new Error("Phase 291 Model J pack is missing.");
  }
  const brand = await rows(client, "SELECT id,type,slug FROM entities WHERE id=?", [PHASE291_ESTERBROOK_BRAND_ID]);
  if (brand.length !== 1 || brand[0]?.type !== "brand" || brand[0]?.slug !== "esterbrook") {
    throw new Error(`Phase 291 Esterbrook identity mismatch: ${JSON.stringify(brand)}`);
  }
  const model = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [PHASE291_MODEL_J_ID, PHASE291_MODEL_J_SLUG]);
  if (model.length > 1 || (model.length === 1 && (model[0]?.id !== PHASE291_MODEL_J_ID || model[0]?.type !== "pen" || model[0]?.slug !== PHASE291_MODEL_J_SLUG || model[0]?.name !== "Esterbrook Model J"))) {
    throw new Error(`Phase 291 Model J identity collision: ${JSON.stringify(model)}`);
  }
}

async function prepareTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)",
      args: [PHASE291_MODEL_J_ID, PHASE291_MODEL_J_SLUG, "Esterbrook Model J"],
    });
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
      args: [PHASE291_MODEL_J_ID, PHASE291_ESTERBROOK_BRAND_ID],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
      args: ["phase291-made-by-esterbrook-model-j", PHASE291_MODEL_J_ID, PHASE291_ESTERBROOK_BRAND_ID, "Phase 291 verified modern Esterbrook Model J maker relation"],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: ["phase291-reverse-esterbrook-model-j", PHASE291_ESTERBROOK_BRAND_ID, PHASE291_MODEL_J_ID, "Phase 291 Esterbrook brand-to-modern-Model-J navigation"],
    });
    const maker = await tx.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE291_MODEL_J_ID],
    });
    if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE291_ESTERBROOK_BRAND_ID) {
      throw new Error(`Phase 291 Model J maker topology remains ambiguous: ${JSON.stringify(maker.rows)}`);
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase291EsterbrookModelJContent(client: Client, options: ApplyPhase291Options): Promise<ApplyPhase291Result> {
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const brandPack = phase69EsterbrookEstiePacks.find((pack) => pack.expectedType === "brand");
  if (!brandPack) throw new Error("Phase 291 requires the existing Esterbrook brand pack.");
  const packs = [brandPack, ...phase291EsterbrookModelJPacks].map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await assertIdentity(client, packs);
  await prepareTopology(client);
  const result = await applyCuratedContentPacks(client, options, packs);
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase291-esterbrook-model-j-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <catalog> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase291EsterbrookModelJContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase291-esterbrook-model-j",
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
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
