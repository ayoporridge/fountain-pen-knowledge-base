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
  PHASE405_ALLOY_ID,
  PHASE405_ALLOY_SLUG,
  PHASE405_PILOT_ID,
  phase405PilotCaplessSpecialAlloyRefreshPacks,
} from "./data/phase405-pilot-capless-special-alloy-refresh";
import {
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export {
  PHASE405_ALLOY_ID,
  PHASE405_ALLOY_SLUG,
  PHASE405_PILOT_ID,
} from "./data/phase405-pilot-capless-special-alloy-refresh";

export type ApplyPhase405Options = ApplyPhase22Options;
export type ApplyPhase405Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 405 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertAuthority(client: Client, options: ApplyPhase405Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 405 reviewer must not be empty.");
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
    throw new Error("Phase 405 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    Number(own.nlink) !== 1 ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 405 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 405 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 405 owned copy must be migrated through 032.");
  }
}

async function assertIdentity(client: Client, pack: LoadedCuratedEntityPack): Promise<void> {
  const result = await client.execute({
    sql: "SELECT id,type,slug,name FROM entities WHERE id IN (?,?) ORDER BY id",
    args: [PHASE405_PILOT_ID, PHASE405_ALLOY_ID],
  });
  const brand = result.rows.find((row) => String(row.id) === PHASE405_PILOT_ID);
  const model = result.rows.find((row) => String(row.id) === PHASE405_ALLOY_ID);
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
    throw new Error("Phase 405 Pilot Capless special alloy identity mismatch.");
  }
}

async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
      args: [PHASE405_ALLOY_ID, PHASE405_PILOT_ID],
    });
    const maker = await tx.execute({
      sql: "SELECT id,target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE405_ALLOY_ID],
    });
    if (maker.rows.length === 0) {
      await tx.execute({
        sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
        args: [
          "phase405-made-by-pilot-capless-special-alloy",
          PHASE405_ALLOY_ID,
          PHASE405_PILOT_ID,
          "Phase 405 verified Pilot Capless special alloy maker relation",
        ],
      });
    } else if (
      maker.rows.length !== 1 ||
      String(maker.rows[0]?.target_id) !== PHASE405_PILOT_ID
    ) {
      throw new Error("Phase 405 Pilot Capless special alloy maker relation is ambiguous.");
    }

    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      args: [PHASE405_PILOT_ID, PHASE405_ALLOY_ID],
    });
    await tx.execute({
      sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [
        "phase405-reverse-pilot-capless-special-alloy",
        PHASE405_PILOT_ID,
        PHASE405_ALLOY_ID,
        "Phase 405 Pilot brand navigation to Capless special alloy",
      ],
    });
    const makerAfter = await tx.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE405_ALLOY_ID],
    });
    const reverseAfter = await tx.execute({
      sql: "SELECT source_id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      args: [PHASE405_PILOT_ID, PHASE405_ALLOY_ID],
    });
    if (
      makerAfter.rows.length !== 1 ||
      String(makerAfter.rows[0]?.target_id) !== PHASE405_PILOT_ID ||
      reverseAfter.rows.length !== 1
    ) {
      throw new Error("Phase 405 Pilot Capless special alloy topology is ambiguous.");
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
    args: [PHASE405_PILOT_ID, pack.entityId],
  });
  return maker.rows.length === 1 &&
    String(maker.rows[0]?.target_id) === PHASE405_PILOT_ID &&
    reverse.rows.length === 1
    ? currentHash
    : null;
}

async function republishPilotBrand(client: Client, reviewer: string): Promise<void> {
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE405_PILOT_ID,
      reviewKind,
      reviewer,
      status: "approved",
      notes: "Phase 405 re-approves the unchanged Pilot brand after normalizing the Capless special alloy navigation link.",
    });
  }
  await publishEntity(client, { entityId: PHASE405_PILOT_ID, reviewer });
}

export async function applyPhase405PilotCaplessSpecialAlloyRefresh(
  client: Client,
  options: ApplyPhase405Options,
): Promise<ApplyPhase405Result> {
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const pack = loadCuratedEntityPack(
    workspaceRoot,
    phase405PilotCaplessSpecialAlloyRefreshPacks[0]!,
  );
  validatePack(workspaceRoot, pack);
  if (Array.from(pack.bodyMd).length < 8_000) {
    throw new Error("Phase 405 reviewed body must contain at least 8,000 Unicode characters.");
  }
  if (
    pack.sources.length < 10 ||
    pack.variants?.length !== 9 ||
    pack.variants.filter((variant) => variant.variantKind === "edition_group").length !== 1 ||
    pack.variants.filter((variant) => variant.variantKind === "market_sku").length !== 8
  ) {
    throw new Error("Phase 405 pack lacks the expected source or SKU coverage.");
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
      "Usage: tsx scripts/apply-phase405-pilot-capless-special-alloy-refresh.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase405PilotCaplessSpecialAlloyRefresh(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase405-pilot-capless-special-alloy-refresh",
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
