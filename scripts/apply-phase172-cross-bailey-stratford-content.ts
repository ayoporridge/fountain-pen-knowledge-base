import { createHash } from "node:crypto";
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
  PHASE172_CROSS_IDS,
  PHASE172_CROSS_SLUGS,
  phase172CrossBaileyStratfordPacks,
} from "./data/phase172-cross-bailey-stratford";

export type ApplyPhase172Options = ApplyPhase22Options;
export type ApplyPhase172Result = ApplyPhase22Result;

const stableId = (prefix: string, value: string) =>
  `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function noRemote(options: ApplyPhase172Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) {
      throw new Error(`Phase 172 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function authority(client: Client, options: ApplyPhase172Options): Promise<void> {
  noRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(root).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !inside(database, root)
  ) {
    throw new Error("Phase 172 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    (own.dev === real.dev && own.ino === real.ino)
  ) {
    throw new Error("Phase 172 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 172 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 172 owned copy must be migrated through 032.");
  }
}

async function preflight(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  for (const pack of packs) {
    const rows = await client.execute({
      sql: "SELECT id,type,slug FROM entities WHERE id=? OR slug=? ORDER BY id",
      args: [pack.entityId, pack.expectedSlug],
    });
    if (
      rows.rows.length !== 1 ||
      String(rows.rows[0]?.id) !== pack.entityId ||
      String(rows.rows[0]?.type) !== pack.expectedType ||
      String(rows.rows[0]?.slug) !== pack.expectedSlug
    ) {
      throw new Error(
        `Phase 172 Cross identity mismatch: ${pack.entityId} ${JSON.stringify(rows.rows)}`,
      );
    }
  }
}

async function topology(client: Client): Promise<void> {
  const brand = await client.execute({
    sql: "SELECT type,slug FROM entities WHERE id=?",
    args: [PHASE172_CROSS_IDS.brand],
  });
  if (
    brand.rows.length !== 1 ||
    String(brand.rows[0]?.type) !== "brand" ||
    String(brand.rows[0]?.slug) !== PHASE172_CROSS_SLUGS.brand
  ) {
    throw new Error("Phase 172 Cross brand identity mismatch.");
  }
  const pens = [
    [PHASE172_CROSS_IDS.baileyLight, PHASE172_CROSS_SLUGS.baileyLight],
    [PHASE172_CROSS_IDS.stratfordAlias, PHASE172_CROSS_SLUGS.stratfordAlias],
  ] as const;
  const tx: Transaction = await client.transaction("write");
  try {
    const allowed = pens.map(([id]) => id);
    await tx.execute({
      sql: `DELETE FROM entity_links WHERE source_id=? AND link_type='reverse' AND target_id NOT IN (${allowed.map(() => "?").join(",")})`,
      args: [PHASE172_CROSS_IDS.brand, ...allowed],
    });
    for (const [penId, slug] of pens) {
      const row = await tx.execute({
        sql: "SELECT type,slug FROM entities WHERE id=?",
        args: [penId],
      });
      if (
        row.rows.length !== 1 ||
        String(row.rows[0]?.type) !== "pen" ||
        String(row.rows[0]?.slug) !== slug
      ) {
        throw new Error(`Phase 172 Cross pen identity mismatch: ${penId}.`);
      }
      await tx.execute({
        sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
        args: [penId, PHASE172_CROSS_IDS.brand],
      });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
        args: [
          stableId("phase172-made-by", penId),
          penId,
          PHASE172_CROSS_IDS.brand,
          `Phase 172 exact Cross maker relation for ${slug}`,
        ],
      });
      const reverseId = stableId("phase172-reverse", penId);
      await tx.execute({
        sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse' AND id<>?",
        args: [PHASE172_CROSS_IDS.brand, penId, reverseId],
      });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
        args: [
          reverseId,
          PHASE172_CROSS_IDS.brand,
          penId,
          `Phase 172 Cross brand navigation for ${slug}`,
        ],
      });
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase172CrossBaileyStratford(
  client: Client,
  options: ApplyPhase172Options,
): Promise<ApplyPhase172Result> {
  await authority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase172CrossBaileyStratfordPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  await preflight(client, packs);
  await topology(client);
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
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error(
      "Usage: tsx scripts/apply-phase172-cross-bailey-stratford-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase172CrossBaileyStratford(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase172-cross-bailey-stratford",
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
