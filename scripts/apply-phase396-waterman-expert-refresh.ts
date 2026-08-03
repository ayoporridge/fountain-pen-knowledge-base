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
import {
  PHASE396_EXPERT_ID,
  PHASE396_EXPERT_NAME,
  PHASE396_EXPERT_SLUG,
  PHASE396_WATERMAN_BRAND_ID,
  phase396WatermanExpertRefreshPacks,
} from "./data/phase396-waterman-expert-refresh";

export type ApplyPhase396Options = ApplyPhase22Options;
export type ApplyPhase396Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 396 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(
  client: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertAuthority(client: Client, options: ApplyPhase396Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 396 reviewer must not be empty.");
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
    throw new Error("Phase 396 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    Number(own.nlink) !== 1 ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 396 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 396 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 396 owned copy must be migrated through 032.");
  }
}

async function assertIdentity(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  const brandPack = packs.find(
    (pack) => pack.entityId === PHASE396_WATERMAN_BRAND_ID && pack.expectedType === "brand",
  );
  const modelPack = packs.find(
    (pack) => pack.entityId === PHASE396_EXPERT_ID && pack.expectedType === "pen",
  );
  if (
    packs.length !== 2 ||
    !brandPack ||
    !modelPack ||
    brandPack.expectedSlug !== "waterman" ||
    modelPack.expectedSlug !== PHASE396_EXPERT_SLUG
  ) {
    throw new Error("Phase 396 Waterman Expert pack identity is incomplete.");
  }
  const brand = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE id=?",
    [PHASE396_WATERMAN_BRAND_ID],
  );
  if (
    brand.length !== 1 ||
    brand[0]?.type !== "brand" ||
    brand[0]?.slug !== "waterman" ||
    brand[0]?.name !== "威迪文 Waterman"
  ) {
    throw new Error(`Phase 396 Waterman brand mismatch: ${JSON.stringify(brand)}`);
  }
  const model = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE id=?",
    [PHASE396_EXPERT_ID],
  );
  if (
    model.length !== 1 ||
    model[0]?.type !== "pen" ||
    model[0]?.slug !== PHASE396_EXPERT_SLUG ||
    model[0]?.name !== PHASE396_EXPERT_NAME
  ) {
    throw new Error(`Phase 396 Waterman Expert model mismatch: ${JSON.stringify(model)}`);
  }
}

async function prepareTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
      args: [PHASE396_EXPERT_ID, PHASE396_WATERMAN_BRAND_ID],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?,?,?,'made_by',?)",
      args: [
        `${PHASE396_EXPERT_ID}-phase396-maker`,
        PHASE396_EXPERT_ID,
        PHASE396_WATERMAN_BRAND_ID,
        "Phase 396 verified Waterman Expert maker relation",
      ],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?,?,?,'reverse',?)",
      args: [
        "phase396-waterman-expert-reverse",
        PHASE396_WATERMAN_BRAND_ID,
        PHASE396_EXPERT_ID,
        "Phase 396 Waterman brand model navigation",
      ],
    });
    const maker = await tx.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE396_EXPERT_ID],
    });
    if (
      maker.rows.length !== 1 ||
      String(maker.rows[0]?.target_id) !== PHASE396_WATERMAN_BRAND_ID
    ) {
      throw new Error("Phase 396 Waterman Expert maker topology is ambiguous.");
    }
    const reverse = await tx.execute({
      sql: "SELECT source_id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      args: [PHASE396_WATERMAN_BRAND_ID, PHASE396_EXPERT_ID],
    });
    if (reverse.rows.length !== 1) {
      throw new Error("Phase 396 Waterman Expert reverse navigation is ambiguous.");
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase396WatermanExpertRefresh(
  client: Client,
  options: ApplyPhase396Options,
): Promise<ApplyPhase396Result> {
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase396WatermanExpertRefreshPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  await assertIdentity(client, packs);
  await prepareTopology(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    phase396WatermanExpertRefreshPacks,
  );
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
    throw new Error(
      "Usage: tsx scripts/apply-phase396-waterman-expert-refresh.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase396WatermanExpertRefresh(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase396-waterman-expert",
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: "",
      },
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
