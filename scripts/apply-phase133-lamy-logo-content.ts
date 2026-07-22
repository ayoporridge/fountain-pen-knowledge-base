import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, createClient } from "@libsql/client";
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
  type ApplyPhase22Options,
  type ApplyPhase22Result,
  uniqueSources,
  upsertSources,
  validatePack,
} from "./apply-phase22-content";
import {
  loadPhase133LamyLogoPack,
  phase133MadeById,
  phase133ReverseId,
  PHASE133_LAMY_ID,
  PHASE133_LOGO_RAW_SLUG,
  PHASE133_LOGO_SLUG,
} from "./data/phase133-lamy-logo";
import type { LoadedCuratedEntityPack } from "./lib/curated-content-pack";

export type ApplyPhase133Options = ApplyPhase22Options;
export type ApplyPhase133Result = ApplyPhase22Result;

const CANONICAL_REPO = "/Users/xz/Documents/fountain-pen-graph";
const ALLOWED_REPOS = new Set([
  "/Users/xz/CodeBuddy/fountain-pen-graph",
  CANONICAL_REPO,
]);

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function stableId(prefix: string, value: string) {
  return `${prefix}-${hash(value).slice(0, 24)}`;
}

function inside(candidate: string, root: string) {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv) {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const)
    if (env[key]?.trim())
      throw new Error(`Phase 133 refuses inherited remote selection: ${key}.`);
}

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

async function authority(client: Client, options: ApplyPhase133Options) {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim())
    throw new Error("Phase 133 reviewer must not be empty.");
  if (!ALLOWED_REPOS.has(options.workspaceRoot))
    throw new Error("Phase 133 requires the verified CodeBuddy/Documents repo pair.");
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const gitRoot = fs.realpathSync.native(
    execFileSync(
      "git",
      ["-C", options.workspaceRoot, "rev-parse", "--show-toplevel"],
      { encoding: "utf8" },
    ).trim(),
  );
  if (workspaceRoot !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO)
    throw new Error("Phase 133 verified repo aliases must resolve identically.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  if (fs.lstatSync(options.databasePath).isSymbolicLink())
    throw new Error("Phase 133 owned database must not be a symlink.");
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !inside(databasePath, ownedRoot))
    throw new Error("Phase 133 requires a database inside caller-owned root.");
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    Number(owned.nlink) !== 1 ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  )
    throw new Error("Phase 133 refuses protected catalog or hard-link aliases.");
  const main = (await client.execute("PRAGMA database_list")).rows.find(
    (row) => String(row.name) === "main",
  );
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath)
    throw new Error("Phase 133 client/path mismatch.");
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1)
    throw new Error("Phase 133 owned copy must be migrated through 032.");
  return workspaceRoot;
}

async function entityDigest(client: Client, entityId: string, topology = true) {
  const queries = [
    "SELECT * FROM entities WHERE id=?",
    "SELECT * FROM stories WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_references WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id",
    "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id",
    "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id",
    "SELECT * FROM model_specs WHERE entity_id=? ORDER BY id",
    "SELECT * FROM model_variants WHERE model_entity_id=? ORDER BY id",
    "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id",
    ...(topology
      ? [
          "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
          "SELECT * FROM entity_publications WHERE entity_id=?",
          "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
        ]
      : []),
  ];
  const payload = [];
  for (const sql of queries)
    payload.push(
      await rows(
        client,
        sql,
        sql.includes(" OR ") ? [entityId, entityId] : [entityId],
      ),
    );
  return hash(JSON.stringify(payload));
}

async function baseline(client: Client, targetId: string) {
  const brand = (
    await rows(
      client,
      "SELECT entity.type,entity.slug,entity.source,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
      [PHASE133_LAMY_ID],
    )
  )[0];
  if (
    brand?.type !== "brand" ||
    brand?.slug !== "lamy" ||
    !String(brand?.source).startsWith("curated-content:phase68-lamy-brand-v1:") ||
    brand?.status !== "published" ||
    Number(brand?.is_public) !== 1
  )
    throw new Error("Phase 133 requires the exact published LAMY baseline.");
  return (
    await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE133_LAMY_ID],
    )
  )
    .map((row) => String(row.target_id))
    .filter((id) => id !== targetId);
}

async function inspectTarget(
  client: Client,
): Promise<{ entityId: string; state: "raw" | "terminal" }> {
  const found = await rows(
    client,
    "SELECT id,type,slug,name,source FROM entities WHERE slug IN (?,?) ORDER BY slug",
    [PHASE133_LOGO_RAW_SLUG, PHASE133_LOGO_SLUG],
  );
  if (found.length !== 1 || found[0]?.type !== "pen")
    throw new Error("Phase 133 requires exactly one raw-or-terminal LAMY logo identity.");
  const row = found[0];
  if (row.slug === PHASE133_LOGO_RAW_SLUG && row.source == null)
    return { entityId: String(row.id), state: "raw" };
  if (
    row.slug === PHASE133_LOGO_SLUG &&
    String(row.source).startsWith("curated-content:phase133-lamy-logo-v1:")
  )
    return { entityId: String(row.id), state: "terminal" };
  throw new Error("Phase 133 target identity is partial or alternate.");
}

async function collisionPreflight(
  client: Client,
  pack: LoadedCuratedEntityPack,
) {
  const aliases = pack.aliases.map((alias) => alias.alias);
  const aliasOwners = await rows(
    client,
    `SELECT entity_id,alias FROM entity_aliases WHERE alias IN (${aliases.map(() => "?").join(",")}) AND entity_id<>?`,
    [...aliases, pack.entityId],
  );
  const markerOwners = await rows(
    client,
    "SELECT id,source FROM entities WHERE source=? AND id<>?",
    [pack.sourceMarker, pack.entityId],
  );
  if (aliasOwners.length > 0 || markerOwners.length > 0)
    throw new Error("Phase 133 target alias/source collision; repair forbidden.");
}

async function installRawPack(
  client: Client,
  pack: LoadedCuratedEntityPack,
) {
  const transaction = await client.transaction("write");
  try {
    const batchKey = "phase133-lamy-logo-canonical-v1";
    const batchId = stableId("phase133-batch", batchKey);
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)",
      args: [
        batchId,
        batchKey,
        hash(batchKey),
        "Canonicalize only exact raw LAMY logo fountain-pen identity; non-fountain writing systems excluded.",
      ],
    });
    const changed = await transaction.execute({
      sql: "UPDATE entities SET slug=?,name=?,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=? AND source IS NULL",
      args: [
        PHASE133_LOGO_SLUG,
        "LAMY logo",
        pack.entityId,
        PHASE133_LOGO_RAW_SLUG,
      ],
    });
    if (changed.rowsAffected !== 1)
      throw new Error("Phase 133 raw identity changed before migration.");
    const actionId = stableId("phase133-action", pack.entityId);
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'rename',?,?,?,'applied',?)",
      args: [
        actionId,
        batchId,
        PHASE133_LOGO_RAW_SLUG,
        hash(`${pack.entityId}:${PHASE133_LOGO_RAW_SLUG}:${PHASE133_LOGO_SLUG}`),
        pack.entityId,
        pack.entityId,
        "Canonicalized exact LAMY logo raw identity in place.",
      ],
    });
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO entity_lineage(id,batch_id,action_id,source_entity_id,target_entity_id,lineage_kind,fallback_reason) VALUES(?,?,?,?,?,'rename',NULL)",
      args: [
        stableId("phase133-lineage", pack.entityId),
        batchId,
        actionId,
        pack.entityId,
        pack.entityId,
      ],
    });
    const sourcePath = `/pen/${PHASE133_LOGO_RAW_SLUG}`;
    const targetPath = `/pen/${PHASE133_LOGO_SLUG}`;
    const redirect = await transaction.execute({
      sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
      args: [sourcePath],
    });
    if (redirect.rows.length === 0)
      await transaction.execute({
        sql: "INSERT INTO entity_redirects(id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES(?,?,?,?,?,'permanent','canonical_slug_rename')",
        args: [
          stableId("phase133-redirect", sourcePath),
          batchId,
          actionId,
          sourcePath,
          targetPath,
        ],
      });
    else if (
      redirect.rows.length !== 1 ||
      redirect.rows[0]?.target_path !== targetPath ||
      redirect.rows[0]?.redirect_kind !== "permanent"
    )
      throw new Error("Phase 133 conflicting old-route redirect.");
    await transaction.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [pack.entityId],
    });
    await transaction.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      args: [PHASE133_LAMY_ID, pack.entityId],
    });
    await transaction.execute({
      sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
      args: [
        phase133MadeById(pack.entityId),
        pack.entityId,
        PHASE133_LAMY_ID,
        "Phase 133 exact LAMY logo maker relation",
      ],
    });
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [
        phase133ReverseId(pack.entityId),
        PHASE133_LAMY_ID,
        pack.entityId,
        "Phase 133 LAMY navigation to logo",
      ],
    });
    const sourceIds = await upsertSources(transaction, uniqueSources([pack]));
    await insertPack(transaction, pack, sourceIds);
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

async function reviewPublish(
  client: Client,
  entityId: string,
  reviewer: string,
  note: string,
) {
  for (const reviewKind of ["fact", "language", "media"] as const)
    await recordEntityContentReview(client, {
      entityId,
      reviewKind,
      reviewer,
      status: "approved",
      notes: note,
    });
  return (await publishEntity(client, { entityId, reviewer })).contentHash;
}

async function terminal(client: Client, pack: LoadedCuratedEntityPack) {
  const current = await computePublicationContentHash(client, pack.entityId);
  const row = (
    await rows(
      client,
      `SELECT entity.type,entity.slug,entity.name,entity.source,publication.status,publication.approved_content_hash,publication.content_revision,publication.reviewed_content_revision,publication.reviewed_contract_version,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public
       FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id
       LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?`,
      [pack.entityId],
    )
  )[0];
  const aliases = (
    await rows(
      client,
      "SELECT alias FROM entity_aliases WHERE entity_id=? ORDER BY alias",
      [pack.entityId],
    )
  ).map((item) => String(item.alias));
  const links = (
    await rows(
      client,
      "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY link_type,source_id,target_id",
      [pack.entityId, pack.entityId],
    )
  ).map((item) => [
    String(item.source_id),
    String(item.target_id),
    String(item.link_type),
  ]);
  const reviews = await rows(
    client,
    "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
    [pack.entityId, current],
  );
  const counts = (
    await rows(
      client,
      `SELECT
        (SELECT count(*) FROM stories WHERE entity_id=?) stories,
        (SELECT count(*) FROM entity_references WHERE entity_id=?) refs,
        (SELECT count(*) FROM fact_scopes WHERE entity_id=?) scopes,
        (SELECT count(*) FROM claims WHERE subject_entity_id=?) claims,
        (SELECT count(*) FROM model_specs WHERE entity_id=?) specs,
        (SELECT count(*) FROM model_variants WHERE model_entity_id=?) variants,
        (SELECT count(*) FROM media_assets WHERE entity_id=?) media,
        (SELECT count(*) FROM timeline_events WHERE entity_id=?) timeline`,
      Array(8).fill(pack.entityId),
    )
  )[0];
  if (
    row?.type !== "pen" ||
    row?.slug !== pack.expectedSlug ||
    row?.name !== pack.canonicalName ||
    row?.source !== pack.sourceMarker ||
    row?.status !== "published" ||
    row?.approved_content_hash !== current ||
    Number(row?.content_revision) !== Number(row?.reviewed_content_revision) ||
    Number(row?.reviewed_contract_version) !== 3 ||
    Number(row?.is_public) !== 1 ||
    JSON.stringify(aliases) !==
      JSON.stringify(pack.aliases.map((alias) => alias.alias).sort()) ||
    JSON.stringify(links) !==
      JSON.stringify([
        [pack.entityId, PHASE133_LAMY_ID, "made_by"],
        [PHASE133_LAMY_ID, pack.entityId, "reverse"],
      ]) ||
    JSON.stringify(reviews.map((review) => String(review.review_kind))) !==
      JSON.stringify(["fact", "language", "media", "publication"]) ||
    reviews.some((review) => review.status !== "approved") ||
    Number(counts?.stories) !== 1 ||
    Number(counts?.refs) !== pack.sources.length ||
    Number(counts?.scopes) !== pack.scopes.length ||
    Number(counts?.claims) !== pack.claims.length ||
    Number(counts?.specs) !== 1 ||
    Number(counts?.variants) !== (pack.variants?.length ?? 0) ||
    Number(counts?.media) !== pack.media.length ||
    Number(counts?.timeline) !== (pack.timeline?.length ?? 0)
  )
    throw new Error("Phase 133 terminal payload/topology/publication is invalid.");
  const redirect = await rows(
    client,
    "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
    [`/pen/${PHASE133_LOGO_RAW_SLUG}`],
  );
  if (
    redirect.length !== 1 ||
    redirect[0]?.target_path !== `/pen/${PHASE133_LOGO_SLUG}` ||
    redirect[0]?.redirect_kind !== "permanent"
  )
    throw new Error("Phase 133 terminal redirect is invalid.");
  const brandHash = await computePublicationContentHash(client, PHASE133_LAMY_ID);
  const brand = (
    await rows(
      client,
      "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
      [PHASE133_LAMY_ID],
    )
  )[0];
  if (brand?.status !== "published" || brand?.approved_content_hash !== brandHash)
    throw new Error("Phase 133 terminal LAMY publication is stale.");
  return current;
}

export async function applyPhase133LamyLogoContent(
  client: Client,
  options: ApplyPhase133Options,
): Promise<ApplyPhase133Result> {
  const workspaceRoot = await authority(client, options);
  const inspected = await inspectTarget(client);
  const protectedIds = await baseline(client, inspected.entityId);
  const pack = loadPhase133LamyLogoPack(workspaceRoot, inspected.entityId);
  validatePack(workspaceRoot, pack);
  if (inspected.state === "terminal") {
    const contentHash = await terminal(client, pack);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return {
      entities: [{ entityId: pack.entityId, outcome: "noop", contentHash }],
    };
  }
  await collisionPreflight(client, pack);
  const protectedBefore = new Map<string, string>();
  for (const id of protectedIds)
    protectedBefore.set(id, await entityDigest(client, id));
  const brandBefore = await entityDigest(client, PHASE133_LAMY_ID, false);
  await installRawPack(client, pack);
  if ((await entityDigest(client, PHASE133_LAMY_ID, false)) !== brandBefore)
    throw new Error("Phase 133 changed LAMY non-topology payload.");
  for (const id of protectedIds)
    if ((await entityDigest(client, id)) !== protectedBefore.get(id))
      throw new Error(`Phase 133 changed protected LAMY entity ${id}.`);
  const reviewer = options.reviewer.trim();
  await reviewPublish(
    client,
    PHASE133_LAMY_ID,
    reviewer,
    "Phase 133 post-topology current hash; no LAMY pack replay.",
  );
  const contentHash = await reviewPublish(
    client,
    pack.entityId,
    reviewer,
    `${pack.sourceMarker}; global/current, regional and sample boundaries.`,
  );
  await terminal(client, pack);
  if ((await entityDigest(client, PHASE133_LAMY_ID, false)) !== brandBefore)
    throw new Error("Phase 133 replayed LAMY non-topology payload.");
  for (const id of protectedIds)
    if ((await entityDigest(client, id)) !== protectedBefore.get(id))
      throw new Error(`Phase 133 changed protected LAMY entity ${id} after publication.`);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    entities: [{ entityId: pack.entityId, outcome: "published", contentHash }],
  };
}

function value(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main() {
  const databasePath = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalogPath = value("--protected-catalog");
  const reviewer = value("--reviewer") ?? "phase133-lamy-logo";
  if (!databasePath || !ownedRoot || !protectedCatalogPath)
    throw new Error(
      "Usage: tsx scripts/apply-phase133-lamy-logo-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>",
    );
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    process.stdout.write(
      `${JSON.stringify(
        await applyPhase133LamyLogoContent(client, {
          workspaceRoot: process.cwd(),
          reviewer,
          databasePath: path.resolve(databasePath),
          ownedRoot: path.resolve(ownedRoot),
          protectedCatalogPath: path.resolve(protectedCatalogPath),
          protectedCatalogSnapshot: snapshotCatalogFiles(
            path.resolve(protectedCatalogPath),
          ),
          env: process.env,
        }),
        null,
        2,
      )}\n`,
    );
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });

export { PHASE133_LOGO_SLUG };
