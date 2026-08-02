import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
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
import { phase69EsterbrookEstiePacks } from "./data/phase69-esterbrook-estie";
import {
  PHASE339_ESTERBROOK_BRAND_ID,
  PHASE339_ESTERBROOK_J_IDS,
  PHASE339_ESTERBROOK_J_SLUGS,
  phase339EsterbrookJSeriesPacks,
} from "./data/phase339-esterbrook-j-series";

export type ApplyPhase339Options = ApplyPhase22Options;
export type ApplyPhase339Result = ApplyPhase22Result;

const TARGETS = [
  {
    id: PHASE339_ESTERBROOK_J_IDS.j,
    slug: PHASE339_ESTERBROOK_J_SLUGS.j,
    name: "Vintage Esterbrook Double Jewel J",
  },
  {
    id: PHASE339_ESTERBROOK_J_IDS.lj,
    slug: PHASE339_ESTERBROOK_J_SLUGS.lj,
    name: "Vintage Esterbrook Double Jewel LJ",
  },
  {
    id: PHASE339_ESTERBROOK_J_IDS.sj,
    slug: PHASE339_ESTERBROOK_J_SLUGS.sj,
    name: "Vintage Esterbrook Double Jewel SJ",
  },
] as const;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 339 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase339Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 339 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !inside(database, ownedRoot)
  ) {
    throw new Error("Phase 339 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) {
    throw new Error("Phase 339 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 339 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 339 owned copy must be migrated through 032.");
}

async function assertIdentity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const brand = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=?", [PHASE339_ESTERBROOK_BRAND_ID]);
  if (
    brand.length !== 1 ||
    brand[0]?.type !== "brand" ||
    brand[0]?.slug !== "esterbrook" ||
    brand[0]?.name !== "Esterbrook"
  ) {
    throw new Error(`Phase 339 Esterbrook brand identity mismatch: ${JSON.stringify(brand)}`);
  }
  for (const target of TARGETS) {
    const pack = packs.find((candidate) => candidate.entityId === target.id);
    if (!pack) throw new Error(`Phase 339 pack missing: ${target.id}`);
    const existing = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [target.id, target.slug]);
    if (
      existing.length > 1 ||
      (existing.length === 1 &&
        (existing[0]?.id !== target.id ||
          existing[0]?.type !== pack.expectedType ||
          existing[0]?.slug !== pack.expectedSlug ||
          existing[0]?.name !== pack.canonicalName))
    ) {
      throw new Error(`Phase 339 historical J identity collision: ${JSON.stringify(existing)}.`);
    }
    const nameCollision = await rows(
      client,
      "SELECT id,type,slug,name FROM entities WHERE lower(name)=lower(?) AND id<>?",
      [target.name, target.id],
    );
    if (nameCollision.length > 0) throw new Error(`Phase 339 historical J name collision: ${JSON.stringify(nameCollision)}.`);
  }
}

async function prepareTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    for (const target of TARGETS) {
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)",
        args: [target.id, target.slug, target.name],
      });
      await tx.execute({
        sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
        args: [target.id, PHASE339_ESTERBROOK_BRAND_ID],
      });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
        args: [
          `phase339-made-by-${target.slug}`,
          target.id,
          PHASE339_ESTERBROOK_BRAND_ID,
          `Phase 339 verified historical Esterbrook ${target.slug} maker relation`,
        ],
      });
      await tx.execute({
        sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        args: [PHASE339_ESTERBROOK_BRAND_ID, target.id],
      });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
        args: [
          `phase339-reverse-${target.slug}`,
          PHASE339_ESTERBROOK_BRAND_ID,
          target.id,
          `Phase 339 Esterbrook brand navigation to ${target.name}`,
        ],
      });
      const maker = await tx.execute({
        sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
        args: [target.id],
      });
      if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE339_ESTERBROOK_BRAND_ID) {
        throw new Error(`Phase 339 ${target.name} maker topology is ambiguous.`);
      }
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase339EsterbrookJSeriesContent(
  client: Client,
  options: ApplyPhase339Options,
): Promise<ApplyPhase339Result> {
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const brandPack = phase69EsterbrookEstiePacks.find((pack) => pack.expectedType === "brand");
  if (!brandPack) throw new Error("Phase 339 requires the existing Esterbrook brand pack.");
  const rawPacks = [brandPack, ...phase339EsterbrookJSeriesPacks];
  const packs = rawPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await assertIdentity(client, packs);
  await prepareTopology(client);
  const result = await applyCuratedContentPacks(client, options, rawPacks);
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
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error("Usage: tsx scripts/apply-phase339-esterbrook-j-series-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase339EsterbrookJSeriesContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase339-esterbrook-j-series",
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
