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
  PHASE388_TSUIKIN_KANHIZAKURA_ID,
  PHASE388_TSUIKIN_KANHIZAKURA_NAME,
  PHASE388_TSUIKIN_KANHIZAKURA_SLUG,
  PHASE388_WANCHER_BRAND_ID,
  phase388WancherTsuikinKanhizakuraPacks,
} from "./data/phase388-wancher-tsuikin-kanhizakura";

export type ApplyPhase388Options = ApplyPhase22Options;
export type ApplyPhase388Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 388 refuses inherited remote database selection: ${key}.`);
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

async function assertAuthority(client: Client, options: ApplyPhase388Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 388 reviewer must not be empty.");
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
    throw new Error("Phase 388 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    Number(own.nlink) !== 1 ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 388 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 388 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 388 owned copy must be migrated through 032.");
  }
}

async function assertIdentity(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  if (
    packs.length !== 2 ||
    !packs.some((pack) => pack.entityId === PHASE388_WANCHER_BRAND_ID) ||
    !packs.some((pack) => pack.entityId === PHASE388_TSUIKIN_KANHIZAKURA_ID)
  ) {
    throw new Error("Phase 388 Wancher Tsuikin Kanhizakura packs are incomplete.");
  }
  const brand = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?",
    [PHASE388_WANCHER_BRAND_ID, "wancher"],
  );
  if (
    brand.length !== 1 ||
    brand[0]?.id !== PHASE388_WANCHER_BRAND_ID ||
    brand[0]?.type !== "brand" ||
    brand[0]?.slug !== "wancher" ||
    brand[0]?.name !== "Wancher"
  ) {
    throw new Error(`Phase 388 Wancher brand identity mismatch: ${JSON.stringify(brand)}`);
  }
  const model = packs.find((pack) => pack.entityId === PHASE388_TSUIKIN_KANHIZAKURA_ID);
  if (!model) throw new Error("Phase 388 Kanhizakura pack missing.");
  const existing = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
    [PHASE388_TSUIKIN_KANHIZAKURA_ID, PHASE388_TSUIKIN_KANHIZAKURA_SLUG],
  );
  if (
    existing.length > 1 ||
    (existing.length === 1 &&
      (existing[0]?.id !== PHASE388_TSUIKIN_KANHIZAKURA_ID ||
        existing[0]?.type !== model.expectedType ||
        existing[0]?.slug !== model.expectedSlug ||
        existing[0]?.name !== PHASE388_TSUIKIN_KANHIZAKURA_NAME))
  ) {
    throw new Error(`Phase 388 Kanhizakura identity collision: ${JSON.stringify(existing)}`);
  }
  const names = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE lower(name)=lower(?) AND id<>?",
    [PHASE388_TSUIKIN_KANHIZAKURA_NAME, PHASE388_TSUIKIN_KANHIZAKURA_ID],
  );
  if (names.length > 0) {
    throw new Error(`Phase 388 Kanhizakura name collision: ${JSON.stringify(names)}`);
  }
}

async function prepareTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)",
      args: [
        PHASE388_TSUIKIN_KANHIZAKURA_ID,
        PHASE388_TSUIKIN_KANHIZAKURA_SLUG,
        PHASE388_TSUIKIN_KANHIZAKURA_NAME,
      ],
    });
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
      args: [PHASE388_TSUIKIN_KANHIZAKURA_ID, PHASE388_WANCHER_BRAND_ID],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
      args: [
        `${PHASE388_TSUIKIN_KANHIZAKURA_ID}-maker`,
        PHASE388_TSUIKIN_KANHIZAKURA_ID,
        PHASE388_WANCHER_BRAND_ID,
        "Phase 388 verified Wancher Dream Pen Tsuikin Kanhizakura maker relation",
      ],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [
        "phase388-reverse-wancher-tsuikin-kanhizakura",
        PHASE388_WANCHER_BRAND_ID,
        PHASE388_TSUIKIN_KANHIZAKURA_ID,
        "Phase 388 Wancher brand public model navigation",
      ],
    });
    const maker = await tx.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE388_TSUIKIN_KANHIZAKURA_ID],
    });
    if (
      maker.rows.length !== 1 ||
      String(maker.rows[0]?.target_id) !== PHASE388_WANCHER_BRAND_ID
    ) {
      throw new Error("Phase 388 Kanhizakura maker topology is ambiguous.");
    }
    const reverse = await tx.execute({
      sql: "SELECT source_id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      args: [PHASE388_WANCHER_BRAND_ID, PHASE388_TSUIKIN_KANHIZAKURA_ID],
    });
    if (reverse.rows.length !== 1) {
      throw new Error("Phase 388 Kanhizakura reverse navigation is ambiguous.");
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase388WancherTsuikinKanhizakuraContent(
  client: Client,
  options: ApplyPhase388Options,
): Promise<ApplyPhase388Result> {
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase388WancherTsuikinKanhizakuraPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  await assertIdentity(client, packs);
  await prepareTopology(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    phase388WancherTsuikinKanhizakuraPacks,
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
      "Usage: tsx scripts/apply-phase388-wancher-tsuikin-kanhizakura-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase388WancherTsuikinKanhizakuraContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase388-wancher-tsuikin-kanhizakura",
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
