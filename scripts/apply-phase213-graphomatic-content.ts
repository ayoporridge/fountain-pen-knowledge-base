import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  insertPack,
  uniqueSources,
  upsertSources,
  validatePack,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import {
  PHASE213_GRAPHOMATIC_ID,
  phase213GraphomaticPacks,
} from "./data/phase213-graphomatic";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";

export type ApplyPhase213Options = ApplyPhase22Options;
export type ApplyPhase213Result = ApplyPhase22Result;

function noRemote(options: ApplyPhase213Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) {
      throw new Error(`Phase 213 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function authority(client: Client, options: ApplyPhase213Options): Promise<void> {
  noRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const relative = path.relative(root, database);
  if (
    !fs.statSync(root).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    relative === "" ||
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    throw new Error("Phase 213 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) {
    throw new Error("Phase 213 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 213 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 213 owned copy must be migrated through 032.");
  }
}

async function identity(client: Client): Promise<void> {
  const row = await client.execute({
    sql: "SELECT type,slug FROM entities WHERE id=?",
    args: [PHASE213_GRAPHOMATIC_ID],
  });
  if (
    row.rows.length !== 1 ||
    String(row.rows[0]?.type) !== "brand" ||
    String(row.rows[0]?.slug) !== "graphomatic"
  ) {
    throw new Error("Phase 213 Graphomatic identity mismatch.");
  }
}

export async function applyPhase213GraphomaticContent(
  client: Client,
  options: ApplyPhase213Options,
): Promise<ApplyPhase213Result> {
  await authority(client, options);
  await identity(client);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase213GraphomaticPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  if (packs.length !== 1 || packs[0]?.expectedType !== "brand") {
    throw new Error("Phase 213 expects exactly one brand pack and no invented model pack.");
  }
  const [pack] = packs;
  validatePack(workspaceRoot, pack);

  const current = await client.execute({
    sql: `
      SELECT entity.source, publication.status, readiness.blocker_count,
             readiness.publishable,
             CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
      FROM entities entity
      JOIN entity_publications publication ON publication.entity_id = entity.id
      LEFT JOIN public_entity_readiness readiness
        ON readiness.entity_id = entity.id AND readiness.contract_version = 3
      LEFT JOIN public_entities public ON public.id = entity.id
      WHERE entity.id = ?
    `,
    args: [pack.entityId],
  });
  const row = current.rows[0];
  const applied = row && String(row.source ?? "") === pack.sourceMarker
    && String(row.status) === "published"
    && Number(row.blocker_count) === 0
    && Number(row.publishable) === 1
    && Number(row.is_public) === 1;
  if (applied) {
    const result: ApplyPhase213Result = {
      entities: [{
        entityId: pack.entityId,
        outcome: "noop",
        contentHash: await computePublicationContentHash(client, pack.entityId),
      }],
    };
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return result;
  }

  const transaction = await client.transaction("write");
  try {
    const sourceItemIds = await upsertSources(transaction, uniqueSources(packs));
    await insertPack(transaction, pack, sourceItemIds);
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }

  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: pack.entityId,
      reviewKind,
      reviewer: options.reviewer,
      status: "approved",
      notes: `${pack.sourceMarker}; ${reviewKind} review of checked-in sourced copy.`,
    });
  }
  const published = await publishEntity(client, {
    entityId: pack.entityId,
    reviewer: options.reviewer,
  });
  const result: ApplyPhase213Result = {
    entities: [{ entityId: pack.entityId, outcome: "published", contentHash: published.contentHash }],
  };
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
      "Usage: tsx scripts/apply-phase213-graphomatic-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase213GraphomaticContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase213-graphomatic",
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

const invokedPath = process.argv[1]
  ? fs.realpathSync.native(path.resolve(process.argv[1]))
  : null;
const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url));
if (invokedPath === modulePath) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
