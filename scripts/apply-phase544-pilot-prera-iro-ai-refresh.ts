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
  PHASE544_PILOT_ID,
  PHASE544_PRERA_ID,
  PHASE544_PRERA_SLUG,
  phase544PilotPreraIroAiRefreshPack,
} from "./data/phase544-pilot-prera-iro-ai-refresh";

export type ApplyPhase544Options = ApplyPhase22Options;
export type ApplyPhase544Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 544 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertAuthority(client: Client, options: ApplyPhase544Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 544 reviewer must not be empty.");
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
    throw new Error("Phase 544 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    Number(own.nlink) !== 1 ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 544 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 544 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 544 owned copy must be migrated through 032.");
  }
}

async function assertIdentity(client: Client, pack: LoadedCuratedEntityPack): Promise<void> {
  const rows = await client.execute({
    sql: "SELECT id,type,slug,name FROM entities WHERE id IN (?,?) ORDER BY id",
    args: [PHASE544_PILOT_ID, PHASE544_PRERA_ID],
  });
  const brand = rows.rows.find((row) => String(row.id) === PHASE544_PILOT_ID);
  const model = rows.rows.find((row) => String(row.id) === PHASE544_PRERA_ID);
  if (
    !brand ||
    String(brand.type) !== "brand" ||
    String(brand.slug) !== "pilot" ||
    !model ||
    String(model.type) !== "pen" ||
    String(model.slug) !== PHASE544_PRERA_SLUG ||
    String(model.slug) !== pack.expectedSlug
  ) {
    throw new Error("Phase 544 Pilot Prera identity mismatch.");
  }
}

async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const maker = await tx.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE544_PRERA_ID],
    });
    if (
      maker.rows.length !== 1 ||
      String(maker.rows[0]?.target_id) !== PHASE544_PILOT_ID
    ) {
      throw new Error("Phase 544 Pilot Prera maker relation is ambiguous.");
    }
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [
        "phase544-reverse-pilot-prera",
        PHASE544_PILOT_ID,
        PHASE544_PRERA_ID,
        "Phase 544 Pilot brand navigation to Prera Iro-ai variant scope",
      ],
    });
    const reverse = await tx.execute({
      sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      args: [PHASE544_PILOT_ID, PHASE544_PRERA_ID],
    });
    if (Number(reverse.rows[0]?.n) !== 1) {
      throw new Error("Phase 544 Pilot Prera reverse navigation is ambiguous.");
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

async function alreadyApplied(
  client: Client,
  pack: LoadedCuratedEntityPack,
): Promise<boolean> {
  const currentHash = await computePublicationContentHash(client, pack.entityId).catch(
    () => null,
  );
  if (!currentHash) return false;
  const row = (
    await client.execute({
      sql: `
        SELECT entity.source, publication.status, publication.approved_content_hash,
               publication.reviewed_content_revision, publication.content_revision,
               publication.reviewed_contract_version, readiness.publishable,
               readiness.blocker_count,
               CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
        FROM entities entity
        JOIN entity_publications publication ON publication.entity_id=entity.id
        LEFT JOIN public_entity_readiness readiness
          ON readiness.entity_id=entity.id AND readiness.contract_version=3
        LEFT JOIN public_entities public ON public.id=entity.id
        WHERE entity.id=?
      `,
      args: [pack.entityId],
    })
  ).rows[0];
  return Boolean(
    row &&
      String(row.source ?? "") === pack.sourceMarker &&
      String(row.status) === "published" &&
      String(row.approved_content_hash ?? "") === currentHash &&
      Number(row.reviewed_content_revision) === Number(row.content_revision) &&
      Number(row.reviewed_contract_version) === 3 &&
      Number(row.publishable) === 1 &&
      Number(row.blocker_count) === 0 &&
      Number(row.is_public) === 1,
  );
}

async function applyPack(
  client: Client,
  options: ApplyPhase544Options,
  pack: LoadedCuratedEntityPack,
): Promise<ApplyPhase544Result> {
  validatePack(options.workspaceRoot, pack);
  if (await alreadyApplied(client, pack)) {
    return {
      entities: [{
        entityId: pack.entityId,
        outcome: "noop",
        contentHash: await computePublicationContentHash(client, pack.entityId),
      }],
    };
  }
  const tx = await client.transaction("write");
  try {
    const sourceItemIds = await upsertSources(tx, uniqueSources([pack]));
    await insertPack(tx, pack, sourceItemIds);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: pack.entityId,
      reviewKind,
      reviewer: options.reviewer,
      status: "approved",
      notes: `${pack.sourceMarker}; ${reviewKind} review of Pilot Prera Iro-ai refresh copy.`,
    });
  }
  const published = await publishEntity(client, {
    entityId: pack.entityId,
    reviewer: options.reviewer,
  });
  return {
    entities: [{ entityId: pack.entityId, outcome: "published", contentHash: published.contentHash }],
  };
}

export async function applyPhase544PilotPreraIroAiRefresh(
  client: Client,
  options: ApplyPhase544Options,
): Promise<ApplyPhase544Result> {
  const snapshot = options.protectedCatalogSnapshot;
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const pack = loadCuratedEntityPack(workspaceRoot, phase544PilotPreraIroAiRefreshPack);
  await assertIdentity(client, pack);
  await ensureTopology(client);
  const result = await applyPack(client, options, pack);
  assertCatalogSnapshotUnchanged(snapshot);
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
      "Usage: tsx scripts/apply-phase544-pilot-prera-iro-ai-refresh.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase544PilotPreraIroAiRefresh(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase544-pilot-prera-iro-ai",
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
    });
    console.log(JSON.stringify(result, null, 2));
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
