import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import {
  insertPack,
  type ApplyPhase22Options,
  uniqueSources,
  upsertSources,
  validatePack,
} from "./apply-phase22-content";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import {
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";
import {
  PHASE579_PILOT_BRAND_ID,
  PHASE579_REVIEWER,
  PHASE579_TARGET_ID,
  phase579PilotMetropolitanPacks,
} from "./data/phase579-pilot-metropolitan-depth";

export type ApplyPhase579Options = ApplyPhase22Options;

export type ApplyPhase579Result = {
  entityId: string;
  outcome: "published" | "noop";
  contentHash: string;
};

async function applyPack(
  client: Client,
  options: ApplyPhase579Options,
  pack: LoadedCuratedEntityPack,
): Promise<ApplyPhase579Result> {
  validatePack(options.workspaceRoot, pack);
  const current = await client.execute({
    sql: `SELECT entity.source, publication.status, readiness.blocker_count,
                 readiness.publishable, CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
          FROM entities entity
          JOIN entity_publications publication ON publication.entity_id=entity.id
          LEFT JOIN public_entity_readiness readiness
            ON readiness.entity_id=entity.id AND readiness.contract_version=3
          LEFT JOIN public_entities public ON public.id=entity.id
          WHERE entity.id=?`,
    args: [pack.entityId],
  });
  const row = current.rows[0];
  if (
    row &&
    String(row.source ?? "") === pack.sourceMarker &&
    String(row.status) === "published" &&
    Number(row.blocker_count) === 0 &&
    Number(row.publishable) === 1 &&
    Number(row.is_public) === 1
  ) {
    return {
      entityId: pack.entityId,
      outcome: "noop",
      contentHash: await computePublicationContentHash(client, pack.entityId),
    };
  }

  const transaction = await client.transaction("write");
  try {
    const sourceItemIds = await upsertSources(
      transaction,
      uniqueSources([pack]),
    );
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
      notes: `${pack.sourceMarker}; ${reviewKind} review of the deepened Pilot Metropolitan copy.`,
    });
  }
  const published = await publishEntity(client, {
    entityId: pack.entityId,
    reviewer: options.reviewer,
  });
  return {
    entityId: pack.entityId,
    outcome: "published",
    contentHash: published.contentHash,
  };
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 579 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertOwnedAuthority(
  client: Client,
  options: ApplyPhase579Options,
): Promise<void> {
  if (!options.reviewer.trim()) throw new Error("Phase 579 reviewer must not be empty.");
  rejectRemote(options.env ?? process.env);
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
    throw new Error("Phase 579 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    Number(owned.nlink) !== 1 ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error("Phase 579 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 579 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 579 owned copy must be migrated through 032.");
  }
}

async function assertIdentity(client: Client): Promise<void> {
  const brand = await client.execute({
    sql: "SELECT id,type,slug,name FROM entities WHERE id=?",
    args: [PHASE579_PILOT_BRAND_ID],
  });
  if (
    brand.rows.length !== 1 ||
    String(brand.rows[0]?.type) !== "brand" ||
    String(brand.rows[0]?.slug) !== "pilot" ||
    String(brand.rows[0]?.name) !== "百乐 Pilot"
  ) {
    throw new Error("Phase 579 Pilot brand identity is not the approved row.");
  }
  const rawPack = phase579PilotMetropolitanPacks[0];
  if (!rawPack) throw new Error("Phase 579 Metropolitan pack is missing.");
  const entity = await client.execute({
    sql: "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
    args: [PHASE579_TARGET_ID, rawPack.expectedSlug],
  });
  if (
    entity.rows.length !== 1 ||
    String(entity.rows[0]?.id) !== PHASE579_TARGET_ID ||
    String(entity.rows[0]?.type) !== "pen" ||
    String(entity.rows[0]?.slug) !== rawPack.expectedSlug ||
    String(entity.rows[0]?.name) !== rawPack.canonicalName
  ) {
    throw new Error("Phase 579 refuses a Metropolitan identity collision or duplicate slug.");
  }
}

async function prepareTopology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  const reverseId = `phase579-reverse-${PHASE579_TARGET_ID}`;
  try {
    // Preserve the approved maker row: deleting/reinserting made_by intentionally
    // invalidates the public Pilot brand through the publication trigger.
    const maker = await transaction.execute({
      sql: "SELECT id,target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE579_TARGET_ID],
    });
    if (
      maker.rows.length !== 1 ||
      String(maker.rows[0]?.target_id) !== PHASE579_PILOT_BRAND_ID
    ) {
      throw new Error("Phase 579 refuses to mutate an ambiguous maker topology.");
    }
    const makerId = String(maker.rows[0]?.id);
    await transaction.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse' AND id<>?",
      args: [PHASE579_PILOT_BRAND_ID, PHASE579_TARGET_ID, reverseId],
    });
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [
        reverseId,
        PHASE579_PILOT_BRAND_ID,
        PHASE579_TARGET_ID,
        "Phase 579 Pilot brand navigation to MR Metropolitan",
      ],
    });
    const makerAfter = await transaction.execute({
      sql: "SELECT id,target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE579_TARGET_ID],
    });
    const reverse = await transaction.execute({
      sql: "SELECT id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      args: [PHASE579_PILOT_BRAND_ID, PHASE579_TARGET_ID],
    });
    if (
      makerAfter.rows.length !== 1 ||
      String(makerAfter.rows[0]?.id) !== makerId ||
      String(makerAfter.rows[0]?.target_id) !== PHASE579_PILOT_BRAND_ID
    ) {
      throw new Error("Phase 579 maker topology changed unexpectedly.");
    }
    if (reverse.rows.length !== 1 || String(reverse.rows[0]?.id) !== reverseId) {
      throw new Error("Phase 579 reverse navigation is ambiguous.");
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase579PilotMetropolitan(
  client: Client,
  options: ApplyPhase579Options,
): Promise<ApplyPhase579Result> {
  await assertOwnedAuthority(client, options);
  await assertIdentity(client);
  await prepareTopology(client);
  const rawPack = phase579PilotMetropolitanPacks[0];
  if (!rawPack) throw new Error("Phase 579 Metropolitan pack is missing.");
  const pack = loadCuratedEntityPack(
    fs.realpathSync.native(options.workspaceRoot),
    rawPack,
  );
  const entity = await applyPack(client, options, pack);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return entity;
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
      "Usage: tsx scripts/apply-phase579-pilot-metropolitan-depth.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedOwnedRoot = path.resolve(ownedRoot);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase579PilotMetropolitan(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? PHASE579_REVIEWER,
      databasePath: resolvedDatabase,
      ownedRoot: resolvedOwnedRoot,
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
