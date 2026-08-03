import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
  setEntityPublicationStatus,
} from "../src/lib/publication";
import {
  insertPack,
  upsertSources,
  validatePack,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  PHASE408_ELITE_ID,
  PHASE408_ELITE_SLUG,
  PHASE408_PILOT_ID,
  phase408PilotElite95sRefreshPacks,
} from "./data/phase408-pilot-elite-95s-refresh";
import {
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export {
  PHASE408_ELITE_ID,
  PHASE408_ELITE_SLUG,
  PHASE408_PILOT_ID,
} from "./data/phase408-pilot-elite-95s-refresh";

export type ApplyPhase408Options = ApplyPhase22Options;
export type ApplyPhase408Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 408 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertAuthority(client: Client, options: ApplyPhase408Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 408 reviewer must not be empty.");
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
    throw new Error("Phase 408 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    Number(own.nlink) !== 1 ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 408 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 408 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 408 owned copy must be migrated through 032.");
  }
}

async function assertIdentity(client: Client, pack: LoadedCuratedEntityPack): Promise<void> {
  const result = await client.execute({
    sql: "SELECT id,type,slug,name FROM entities WHERE id IN (?,?) ORDER BY id",
    args: [PHASE408_PILOT_ID, PHASE408_ELITE_ID],
  });
  const brand = result.rows.find((row) => String(row.id) === PHASE408_PILOT_ID);
  const model = result.rows.find((row) => String(row.id) === PHASE408_ELITE_ID);
  if (
    !brand ||
    String(brand.type) !== "brand" ||
    String(brand.slug) !== "pilot" ||
    String(brand.name) !== "百乐 Pilot" ||
    !model ||
    String(model.type) !== "pen" ||
    String(model.slug) !== pack.expectedSlug ||
    String(model.name) !== pack.canonicalName
  ) {
    throw new Error("Phase 408 Pilot Elite 95S identity mismatch.");
  }
}

async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
      args: [PHASE408_ELITE_ID, PHASE408_PILOT_ID],
    });
    const maker = await tx.execute({
      sql: "SELECT id,target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE408_ELITE_ID],
    });
    if (maker.rows.length === 0) {
      await tx.execute({
        sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
        args: [
          "phase408-made-by-pilot-elite-95s",
          PHASE408_ELITE_ID,
          PHASE408_PILOT_ID,
          "Phase 408 verified Pilot Elite 95S maker relation",
        ],
      });
    } else if (
      maker.rows.length !== 1 ||
      String(maker.rows[0]?.target_id) !== PHASE408_PILOT_ID
    ) {
      throw new Error("Phase 408 Pilot Elite 95S maker relation is ambiguous.");
    }

    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      args: [PHASE408_PILOT_ID, PHASE408_ELITE_ID],
    });
    await tx.execute({
      sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [
        "phase408-reverse-pilot-elite-95s",
        PHASE408_PILOT_ID,
        PHASE408_ELITE_ID,
        "Phase 408 Pilot brand navigation to Elite 95S",
      ],
    });
    const makerAfter = await tx.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE408_ELITE_ID],
    });
    const reverseAfter = await tx.execute({
      sql: "SELECT source_id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      args: [PHASE408_PILOT_ID, PHASE408_ELITE_ID],
    });
    if (
      makerAfter.rows.length !== 1 ||
      String(makerAfter.rows[0]?.target_id) !== PHASE408_PILOT_ID ||
      reverseAfter.rows.length !== 1
    ) {
      throw new Error("Phase 408 Pilot Elite 95S topology is ambiguous.");
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

async function exactTerminalState(
  client: Client,
  pack: LoadedCuratedEntityPack,
): Promise<string | null> {
  const currentHash = await computePublicationContentHash(client, pack.entityId).catch(
    () => null,
  );
  if (!currentHash) return null;
  const state = await client.execute({
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
  });
  const row = state.rows[0];
  if (
    !row ||
    String(row.source ?? "") !== pack.sourceMarker ||
    String(row.status) !== "published" ||
    String(row.approved_content_hash ?? "") !== currentHash ||
    Number(row.reviewed_content_revision) !== Number(row.content_revision) ||
    Number(row.reviewed_contract_version) !== 3 ||
    Number(row.publishable) !== 1 ||
    Number(row.blocker_count) !== 0 ||
    Number(row.is_public) !== 1
  ) {
    return null;
  }
  const reviews = await client.execute({
    sql: `SELECT review_kind,count(*) AS total FROM entity_content_reviews
          WHERE entity_id=? AND content_hash=? AND status='approved'
          GROUP BY review_kind ORDER BY review_kind`,
    args: [pack.entityId, currentHash],
  });
  const exactReviews = new Map(
    reviews.rows.map((review) => [String(review.review_kind), Number(review.total)]),
  );
  if (["fact", "language", "media", "publication"].some((kind) => exactReviews.get(kind) !== 1)) {
    return null;
  }
  const maker = await client.execute({
    sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
    args: [pack.entityId],
  });
  const reverse = await client.execute({
    sql: "SELECT source_id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
    args: [PHASE408_PILOT_ID, pack.entityId],
  });
  return maker.rows.length === 1 &&
    String(maker.rows[0]?.target_id) === PHASE408_PILOT_ID &&
    reverse.rows.length === 1
    ? currentHash
    : null;
}

async function republishPilotBrand(client: Client, reviewer: string): Promise<void> {
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE408_PILOT_ID,
      reviewKind,
      reviewer,
      status: "approved",
      notes: "Phase 408 re-approves the unchanged Pilot brand after normalizing the Elite 95S navigation link.",
    });
  }
  await publishEntity(client, { entityId: PHASE408_PILOT_ID, reviewer });
}

export async function applyPhase408PilotElite95sRefresh(
  client: Client,
  options: ApplyPhase408Options,
): Promise<ApplyPhase408Result> {
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const pack = loadCuratedEntityPack(workspaceRoot, phase408PilotElite95sRefreshPacks[0]!);
  validatePack(workspaceRoot, pack);
  if (Array.from(pack.bodyMd).length < 8_000) {
    throw new Error("Phase 408 reviewed body must contain at least 8,000 Unicode characters.");
  }
  if (
    pack.sources.length < 10 ||
    pack.variants?.length !== 4 ||
    pack.variants.filter((variant) => variant.variantKind === "edition_group").length !== 1 ||
    pack.variants.filter((variant) => variant.variantKind === "market_sku").length !== 3
  ) {
    throw new Error("Phase 408 pack lacks the expected source or Elite 95S SKU coverage.");
  }
  await assertIdentity(client, pack);
  await ensureTopology(client);
  const currentHash = await exactTerminalState(client, pack);
  if (currentHash) {
    return { entities: [{ entityId: pack.entityId, outcome: "noop", contentHash: currentHash }] };
  }

  await setEntityPublicationStatus(client, pack.entityId, "draft");
  const tx = await client.transaction("write");
  try {
    const sourceItemIds = await upsertSources(tx, pack.sources);
    await insertPack(tx, pack, sourceItemIds);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }

  await republishPilotBrand(client, options.reviewer);
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: pack.entityId,
      reviewKind,
      reviewer: options.reviewer,
      status: "approved",
      notes: `${pack.sourceMarker}; ${reviewKind} review of checked-in current sourced copy.`,
    });
  }
  const published = await publishEntity(client, {
    entityId: pack.entityId,
    reviewer: options.reviewer,
  });
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    entities: [{ entityId: pack.entityId, outcome: "published", contentHash: published.contentHash }],
  };
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
      "Usage: tsx scripts/apply-phase408-pilot-elite-95s-refresh.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase408PilotElite95sRefresh(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase408-pilot-elite-95s-refresh",
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
