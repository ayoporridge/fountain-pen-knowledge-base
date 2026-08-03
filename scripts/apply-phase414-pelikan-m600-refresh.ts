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
  type ApplyPhase22Options,
  type ApplyPhase22Result,
  upsertSources,
  validatePack,
} from "./apply-phase22-content";
import {
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";
import {
  PHASE414_M600_ID,
  PHASE414_M600_NAME,
  PHASE414_M600_SLUG,
  PHASE414_PELIKAN_BRAND_ID,
  phase414PelikanM600RefreshPacks,
} from "./data/phase414-pelikan-m600-refresh";

export {
  PHASE414_M600_ID,
  PHASE414_M600_SLUG,
  PHASE414_PELIKAN_BRAND_ID,
} from "./data/phase414-pelikan-m600-refresh";

export type ApplyPhase414Options = ApplyPhase22Options;
export type ApplyPhase414Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 414 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertAuthority(client: Client, options: ApplyPhase414Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 414 reviewer must not be empty.");
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
    throw new Error("Phase 414 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    Number(own.nlink) !== 1 ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 414 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 414 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 414 owned copy must be migrated through 032.");
  }
}

async function assertIdentity(client: Client, pack: LoadedCuratedEntityPack): Promise<void> {
  const result = await client.execute({
    sql: "SELECT id,type,slug,name FROM entities WHERE id IN (?,?) ORDER BY id",
    args: [PHASE414_PELIKAN_BRAND_ID, PHASE414_M600_ID],
  });
  const brand = result.rows.find((row) => String(row.id) === PHASE414_PELIKAN_BRAND_ID);
  const model = result.rows.find((row) => String(row.id) === PHASE414_M600_ID);
  if (
    !brand ||
    String(brand.type) !== "brand" ||
    String(brand.slug) !== "pelikan" ||
    String(brand.name) !== "百利金 Pelikan" ||
    !model ||
    String(model.type) !== "pen" ||
    String(model.slug) !== pack.expectedSlug ||
    String(model.name) !== PHASE414_M600_NAME
  ) {
    throw new Error("Phase 414 Pelikan M600 identity mismatch.");
  }
}

async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
      args: [PHASE414_M600_ID, PHASE414_PELIKAN_BRAND_ID],
    });
    const maker = await tx.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE414_M600_ID],
    });
    if (maker.rows.length === 0) {
      await tx.execute({
        sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
        args: [
          "phase414-made-by-pelikan-m600",
          PHASE414_M600_ID,
          PHASE414_PELIKAN_BRAND_ID,
          "Phase 414 verified Pelikan Souverän M600 maker relation",
        ],
      });
    } else if (
      maker.rows.length !== 1 ||
      String(maker.rows[0]?.target_id) !== PHASE414_PELIKAN_BRAND_ID
    ) {
      throw new Error("Phase 414 Pelikan M600 maker relation is ambiguous.");
    }
    await tx.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      args: [PHASE414_PELIKAN_BRAND_ID, PHASE414_M600_ID],
    });
    await tx.execute({
      sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [
        "phase414-reverse-pelikan-m600",
        PHASE414_PELIKAN_BRAND_ID,
        PHASE414_M600_ID,
        "Phase 414 Pelikan brand navigation to Souverän M600",
      ],
    });
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
    sql: `SELECT entity.source, publication.status, publication.approved_content_hash,
             publication.reviewed_content_revision, publication.content_revision,
             publication.reviewed_contract_version, readiness.publishable,
             readiness.blocker_count, CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
      FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id
      LEFT JOIN public_entity_readiness readiness ON readiness.entity_id=entity.id AND readiness.contract_version=3
      LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?`,
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
    sql: "SELECT review_kind,count(*) AS total FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' GROUP BY review_kind",
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
    args: [PHASE414_PELIKAN_BRAND_ID, pack.entityId],
  });
  return maker.rows.length === 1 &&
    String(maker.rows[0]?.target_id) === PHASE414_PELIKAN_BRAND_ID &&
    reverse.rows.length === 1
    ? currentHash
    : null;
}

async function republishBrand(client: Client, reviewer: string): Promise<void> {
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE414_PELIKAN_BRAND_ID,
      reviewKind,
      reviewer,
      status: "approved",
      notes: "Phase 414 re-approves the unchanged Pelikan brand after normalizing M600 navigation.",
    });
  }
  await publishEntity(client, { entityId: PHASE414_PELIKAN_BRAND_ID, reviewer });
}

export async function applyPhase414PelikanM600Refresh(
  client: Client,
  options: ApplyPhase414Options,
): Promise<ApplyPhase414Result> {
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const definition = phase414PelikanM600RefreshPacks[0];
  if (!definition) throw new Error("Phase 414 Pelikan M600 pack definition is missing.");
  const pack = loadCuratedEntityPack(workspaceRoot, definition);
  validatePack(workspaceRoot, pack);
  if (Array.from(pack.bodyMd).length < 8_000) {
    throw new Error("Phase 414 reviewed body must contain at least 8,000 Unicode characters.");
  }
  if (
    pack.sources.length < 14 ||
    new Set(pack.sources.map((source) => source.independenceGroup)).size < 14 ||
    pack.variants?.length !== 15 ||
    pack.media.filter((media) => media.usageStatus === "primary").length !== 1
  ) {
    throw new Error("Phase 414 pack lacks expected Pelikan source, variant, or media coverage.");
  }
  await assertIdentity(client, pack);
  await ensureTopology(client);
  const currentHash = await exactTerminalState(client, pack);
  if (currentHash) {
    return {
      entities: [{ entityId: pack.entityId, outcome: "noop", contentHash: currentHash }],
    };
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
  await republishBrand(client, options.reviewer);
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
    entities: [
      { entityId: pack.entityId, outcome: "published", contentHash: published.contentHash },
    ],
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
      "Usage: tsx scripts/apply-phase414-pelikan-m600-refresh.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase414PelikanM600Refresh(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase414-pelikan-m600-refresh",
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
