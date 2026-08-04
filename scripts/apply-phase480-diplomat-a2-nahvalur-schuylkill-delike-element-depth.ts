import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import {
  insertPack,
  uniqueSources,
  upsertSources,
  validatePack,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";
import {
  PHASE480_IDS,
  phase480DiplomatA2NahvalurSchuylkillDelikeElementDepthPacks,
} from "./data/phase480-diplomat-a2-nahvalur-schuylkill-delike-element-depth";

export type ApplyPhase480Options = ApplyPhase22Options;
export type ApplyPhase480Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(options: ApplyPhase480Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) {
      throw new Error(`Phase 480 refuses inherited remote database selection: ${key}.`);
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

async function authority(client: Client, options: ApplyPhase480Options): Promise<void> {
  assertNoRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const ownedStat = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    !fs.statSync(root).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !inside(database, root) ||
    database === protectedPath ||
    (ownedStat.dev === protectedStat.dev && ownedStat.ino === protectedStat.ino) ||
    Number(ownedStat.nlink) !== 1
  ) {
    throw new Error("Phase 480 requires an owned, non-symlink catalog copy.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 480 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 480 owned copy must be migrated through 032.");
  }
}

async function identity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const ids = Object.values(PHASE480_IDS);
  if (packs.length !== ids.length || new Set(packs.map((pack) => pack.entityId)).size !== ids.length) {
    throw new Error("Phase 480 must load Diplomat A2, Nahvalur Schuylkill and Delike Element exactly once.");
  }
  for (const [label, id] of Object.entries(PHASE480_IDS)) {
    const pack = packs.find((candidate) => candidate.entityId === id);
    if (!pack?.expectedSlug) throw new Error(`Phase 480 ${label} pack identity mismatch.`);
    const existing = await rows(client, "SELECT id,type,slug FROM entities WHERE id=? OR slug=?", [id, pack.expectedSlug]);
    if (
      existing.length !== 1 ||
      existing[0]?.id !== id ||
      existing[0]?.type !== pack.expectedType ||
      existing[0]?.slug !== pack.expectedSlug
    ) {
      throw new Error(`Phase 480 ${label} identity mismatch: ${JSON.stringify(existing)}`);
    }
  }
}

async function repairModelNavigation(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const tx = await client.transaction("write");
  try {
    for (const pack of packs) {
      const brandId = pack.spec?.brandEntityId;
      if (!brandId) throw new Error(`Phase 480 ${pack.expectedSlug} has no maker identity.`);
      const maker = await tx.execute({
        sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
        args: [pack.entityId, brandId],
      });
      if (Number(maker.rows[0]?.n) !== 1) {
        throw new Error(`Phase 480 ${pack.expectedSlug} must have exactly one made_by relation.`);
      }
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?,?,?,'reverse',?)",
        args: [
          `phase480-reverse-${pack.entityId}`,
          brandId,
          pack.entityId,
          `Phase 480 model navigation for ${pack.expectedSlug}`,
        ],
      });
      const reverse = await tx.execute({
        sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        args: [brandId, pack.entityId],
      });
      if (Number(reverse.rows[0]?.n) !== 1) {
        throw new Error(`Phase 480 ${pack.expectedSlug} reverse navigation is ambiguous.`);
      }
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

async function applyPacks(
  client: Client,
  options: ApplyPhase480Options,
  packs: LoadedCuratedEntityPack[],
): Promise<ApplyPhase480Result> {
  for (const pack of packs) validatePack(options.workspaceRoot, pack);
  const current = await client.execute({
    sql: `
      SELECT entity.id, entity.source, publication.status,
             readiness.blocker_count, readiness.publishable,
             CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
      FROM entities entity
      JOIN entity_publications publication ON publication.entity_id=entity.id
      LEFT JOIN public_entity_readiness readiness
        ON readiness.entity_id=entity.id AND readiness.contract_version=3
      LEFT JOIN public_entities public ON public.id=entity.id
      WHERE entity.id IN (${packs.map(() => "?").join(",")})
    `,
    args: packs.map((pack) => pack.entityId),
  });
  const currentById = new Map(current.rows.map((row) => [String(row.id), row]));
  const allApplied = packs.every((pack) => {
    const row = currentById.get(pack.entityId);
    return (
      row &&
      String(row.source ?? "") === pack.sourceMarker &&
      String(row.status) === "published" &&
      Number(row.blocker_count) === 0 &&
      Number(row.publishable) === 1 &&
      Number(row.is_public) === 1
    );
  });
  if (allApplied) {
    return {
      entities: await Promise.all(
        packs.map(async (pack) => ({
          entityId: pack.entityId,
          outcome: "noop" as const,
          contentHash: await computePublicationContentHash(client, pack.entityId),
        })),
      ),
    };
  }
  const tx = await client.transaction("write");
  try {
    const sourceItemIds = await upsertSources(tx, uniqueSources(packs));
    for (const pack of packs) await insertPack(tx, pack, sourceItemIds);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
  const entities: ApplyPhase480Result["entities"] = [];
  for (const pack of packs) {
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId: pack.entityId,
        reviewKind,
        reviewer: options.reviewer,
        status: "approved",
        notes: `${pack.sourceMarker}; Phase 480 fact/language/media review.`,
      });
    }
    const published = await publishEntity(client, { entityId: pack.entityId, reviewer: options.reviewer });
    entities.push({ entityId: pack.entityId, outcome: "published", contentHash: published.contentHash });
  }
  return { entities };
}

export async function applyPhase480DiplomatA2NahvalurSchuylkillDelikeElementDepth(
  client: Client,
  options: ApplyPhase480Options,
): Promise<ApplyPhase480Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 480 reviewer must not be empty.");
  await authority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase480DiplomatA2NahvalurSchuylkillDelikeElementDepthPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  await identity(client, packs);
  await repairModelNavigation(client, packs);
  const result = await applyPacks(client, options, packs);
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
      "Usage: tsx scripts/apply-phase480-diplomat-a2-nahvalur-schuylkill-delike-element-depth.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedOwnedRoot = path.resolve(ownedRoot);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase480DiplomatA2NahvalurSchuylkillDelikeElementDepth(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase480-diplomat-nahvalur-delike",
      databasePath: resolvedDatabase,
      ownedRoot: resolvedOwnedRoot,
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
