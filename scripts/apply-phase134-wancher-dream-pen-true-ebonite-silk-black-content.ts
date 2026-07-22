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
  loadPhase134WancherDreamPenTrueEboniteSilkBlackPack,
  PHASE134_AS_IS_URL,
  PHASE134_DREAM_ARTICLE_ID,
  PHASE134_MADE_BY_ID,
  PHASE134_MATTE_BLACK_ID,
  PHASE134_OFFICIAL_URL,
  PHASE134_REVERSE_ID,
  PHASE134_SILK_BLACK_ID,
  PHASE134_SILK_BLACK_SLUG,
  PHASE134_WANCHER_ID,
} from "./data/phase134-wancher-dream-pen-true-ebonite-silk-black";
import type { LoadedCuratedEntityPack } from "./lib/curated-content-pack";

export type ApplyPhase134Options = ApplyPhase22Options;
export type ApplyPhase134Result = ApplyPhase22Result;

const CANONICAL_REPO = "/Users/xz/Documents/fountain-pen-graph";
const ALLOWED_REPOS = new Set([
  "/Users/xz/CodeBuddy/fountain-pen-graph",
  CANONICAL_REPO,
]);
const BRAND_MARKER = "curated-content:phase107-wancher-brand-v1:";
const MATTE_MARKER =
  "curated-content:phase107-wancher-true-ebonite-matte-black-v1:";

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
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
      throw new Error(`Phase 134 refuses inherited remote selection: ${key}.`);
}

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

async function authority(client: Client, options: ApplyPhase134Options) {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim())
    throw new Error("Phase 134 reviewer must not be empty.");
  if (!ALLOWED_REPOS.has(options.workspaceRoot))
    throw new Error("Phase 134 requires the verified CodeBuddy/Documents repo pair.");
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const gitRoot = fs.realpathSync.native(
    execFileSync(
      "git",
      ["-C", options.workspaceRoot, "rev-parse", "--show-toplevel"],
      { encoding: "utf8" },
    ).trim(),
  );
  if (workspaceRoot !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO)
    throw new Error("Phase 134 verified repo aliases must resolve identically.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  if (fs.lstatSync(options.databasePath).isSymbolicLink())
    throw new Error("Phase 134 owned database must not be a symlink.");
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !inside(databasePath, ownedRoot))
    throw new Error("Phase 134 requires a database inside caller-owned root.");
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    Number(owned.nlink) !== 1 ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  )
    throw new Error("Phase 134 refuses protected catalog or hard-link aliases.");
  const main = (await client.execute("PRAGMA database_list")).rows.find(
    (row) => String(row.name) === "main",
  );
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath)
    throw new Error("Phase 134 client/path mismatch.");
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1)
    throw new Error("Phase 134 owned copy must be migrated through 032.");
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
    "SELECT * FROM timeline_events WHERE entity_id=? ORDER BY id",
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

async function baseline(client: Client) {
  const entities = await rows(
    client,
    `SELECT entity.id,entity.type,entity.slug,entity.source,publication.status,
            CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public
     FROM entities entity
     LEFT JOIN entity_publications publication ON publication.entity_id=entity.id
     LEFT JOIN public_entities public ON public.id=entity.id
     WHERE entity.id IN (?,?,?) ORDER BY entity.id`,
    [PHASE134_WANCHER_ID, PHASE134_DREAM_ARTICLE_ID, PHASE134_MATTE_BLACK_ID],
  );
  const byId = new Map(entities.map((row) => [String(row.id), row]));
  const brand = byId.get(PHASE134_WANCHER_ID);
  const article = byId.get(PHASE134_DREAM_ARTICLE_ID);
  const matte = byId.get(PHASE134_MATTE_BLACK_ID);
  if (
    brand?.type !== "brand" ||
    brand?.slug !== "wancher" ||
    !String(brand?.source).startsWith(BRAND_MARKER) ||
    brand?.status !== "published" ||
    Number(brand?.is_public) !== 1
  )
    throw new Error("Phase 134 requires the exact published Phase 107 Wancher brand.");
  if (
    article?.type !== "article" ||
    article?.slug !== "wancher-dream-pen" ||
    Number(article?.is_public) !== 1
  )
    throw new Error("Phase 134 requires the published Phase 104 Dream Pen article.");
  if (
    matte?.type !== "pen" ||
    matte?.slug !== "wancher-dream-pen-true-ebonite-matte-black" ||
    !String(matte?.source).startsWith(MATTE_MARKER) ||
    matte?.status !== "published" ||
    Number(matte?.is_public) !== 1
  )
    throw new Error("Phase 134 requires the exact published Phase 107 Matte Black sibling.");
  const action = await rows(
    client,
    "SELECT action_kind,status FROM taxonomy_actions WHERE source_entity_id=? AND target_entity_id=? AND source_row_key=?",
    [
      PHASE134_DREAM_ARTICLE_ID,
      PHASE134_DREAM_ARTICLE_ID,
      "wancher万佳-dream-pen",
    ],
  );
  if (
    action.length !== 1 ||
    action[0]?.action_kind !== "rename" ||
    action[0]?.status !== "applied"
  )
    throw new Error("Phase 134 requires the applied Phase 104 Dream Pen reclassification.");
  const officialOwners = await rows(
    client,
    `SELECT reference.entity_id
     FROM entity_references reference
     JOIN source_items item ON item.id=reference.source_item_id
     WHERE item.url=? ORDER BY reference.entity_id`,
    [PHASE134_OFFICIAL_URL],
  );
  if (
    officialOwners.some(
      (row) => String(row.entity_id) !== PHASE134_SILK_BLACK_ID,
    )
  )
    throw new Error(
      `Phase 134 requires the exact Silk Black URL to have no alternate owner; owners=${JSON.stringify(officialOwners.map((row) => String(row.entity_id)))}`,
    );
}

async function state(
  client: Client,
  pack: LoadedCuratedEntityPack,
): Promise<"empty" | "terminal"> {
  const names = [pack.canonicalName, ...pack.aliases.map((item) => item.alias)];
  const found = await rows(
    client,
    `SELECT DISTINCT entity.id,entity.type,entity.slug,entity.name,entity.source
     FROM entities entity
     LEFT JOIN entity_aliases alias ON alias.entity_id=entity.id
     LEFT JOIN entity_references reference ON reference.entity_id=entity.id
     LEFT JOIN source_items item ON item.id=reference.source_item_id
     WHERE entity.id=? OR entity.slug=?
        OR lower(entity.name) IN (${names.map(() => "lower(?)").join(",")})
        OR lower(COALESCE(alias.alias,'')) IN (${names.map(() => "lower(?)").join(",")})
        OR entity.source_url=?
        OR (item.url=? AND entity.type='pen')
        OR entity.source=?
     ORDER BY entity.id`,
    [
      pack.entityId,
      pack.expectedSlug,
      ...names,
      ...names,
      PHASE134_OFFICIAL_URL,
      PHASE134_OFFICIAL_URL,
      pack.sourceMarker,
    ],
  );
  if (found.length === 0) return "empty";
  if (found.length !== 1)
    throw new Error("Phase 134 found an alternate exact Silk Black pen.");
  const row = found[0];
  if (
    row?.id !== pack.entityId ||
    row?.type !== "pen" ||
    row?.slug !== pack.expectedSlug ||
    row?.name !== pack.canonicalName ||
    row?.source !== pack.sourceMarker
  )
    throw new Error("Phase 134 exact Silk Black identity is partial or alternate.");
  return "terminal";
}

async function collisionPreflight(
  client: Client,
  pack: LoadedCuratedEntityPack,
) {
  const aliases = pack.aliases.map((item) => item.alias);
  const aliasOwners = await rows(
    client,
    `SELECT entity_id,alias FROM entity_aliases
     WHERE lower(alias) IN (${aliases.map(() => "lower(?)").join(",")})
       AND entity_id<>?`,
    [...aliases, pack.entityId],
  );
  const asIsPenOwners = await rows(
    client,
    `SELECT reference.entity_id
     FROM entity_references reference
     JOIN source_items item ON item.id=reference.source_item_id
     JOIN entities entity ON entity.id=reference.entity_id
     WHERE item.url=? AND entity.type='pen' AND entity.id<>?`,
    [PHASE134_AS_IS_URL, pack.entityId],
  );
  if (aliasOwners.length > 0 || asIsPenOwners.length > 0)
    throw new Error("Phase 134 target alias/source collision; repair forbidden.");
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

async function terminal(
  client: Client,
  pack: LoadedCuratedEntityPack,
): Promise<string> {
  const currentHash = await computePublicationContentHash(client, pack.entityId);
  const row = (
    await rows(
      client,
      `SELECT entity.type,entity.slug,entity.name,entity.source,
              publication.status,publication.approved_content_hash,
              publication.content_revision,publication.reviewed_content_revision,
              publication.reviewed_contract_version,
              CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public
       FROM entities entity
       JOIN entity_publications publication ON publication.entity_id=entity.id
       LEFT JOIN public_entities public ON public.id=entity.id
       WHERE entity.id=?`,
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
      "SELECT id FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY id",
      [pack.entityId, pack.entityId],
    )
  ).map((item) => String(item.id));
  const reviews = await rows(
    client,
    "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind",
    [pack.entityId, currentHash],
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
    row?.approved_content_hash !== currentHash ||
    Number(row?.content_revision) !== Number(row?.reviewed_content_revision) ||
    Number(row?.reviewed_contract_version) !== 3 ||
    Number(row?.is_public) !== 1 ||
    JSON.stringify(aliases) !==
      JSON.stringify(pack.aliases.map((item) => item.alias).sort()) ||
    JSON.stringify(links) !==
      JSON.stringify([PHASE134_MADE_BY_ID, PHASE134_REVERSE_ID].sort()) ||
    JSON.stringify(reviews.map((item) => String(item.review_kind))) !==
      JSON.stringify(["fact", "language", "media", "publication"]) ||
    reviews.some((item) => item.status !== "approved") ||
    Number(counts?.stories) !== 1 ||
    Number(counts?.refs) !== pack.sources.length ||
    Number(counts?.scopes) !== pack.scopes.length ||
    Number(counts?.claims) !== pack.claims.length ||
    Number(counts?.specs) !== 1 ||
    Number(counts?.variants) !== (pack.variants?.length ?? 0) ||
    Number(counts?.media) !== pack.media.length ||
    Number(counts?.timeline) !== (pack.timeline?.length ?? 0)
  )
    throw new Error("Phase 134 terminal payload/topology/publication is invalid.");
  const brandHash = await computePublicationContentHash(
    client,
    PHASE134_WANCHER_ID,
  );
  const brand = (
    await rows(
      client,
      "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
      [PHASE134_WANCHER_ID],
    )
  )[0];
  if (brand?.status !== "published" || brand?.approved_content_hash !== brandHash)
    throw new Error("Phase 134 terminal Wancher publication is stale.");
  return currentHash;
}

export async function applyPhase134WancherDreamPenTrueEboniteSilkBlackContent(
  client: Client,
  options: ApplyPhase134Options,
): Promise<ApplyPhase134Result> {
  const workspaceRoot = await authority(client, options);
  const pack = loadPhase134WancherDreamPenTrueEboniteSilkBlackPack(workspaceRoot);
  validatePack(workspaceRoot, pack);
  await baseline(client);
  const currentState = await state(client, pack);
  if (currentState === "terminal") {
    const contentHash = await terminal(client, pack);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return {
      entities: [
        { entityId: pack.entityId, outcome: "noop", contentHash },
      ],
    };
  }
  await collisionPreflight(client, pack);

  const articleBefore = await entityDigest(client, PHASE134_DREAM_ARTICLE_ID);
  const matteBefore = await entityDigest(client, PHASE134_MATTE_BLACK_ID);
  const brandBefore = await entityDigest(client, PHASE134_WANCHER_ID, false);
  const reverseBefore = (
    await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE134_WANCHER_ID],
    )
  ).map((row) => String(row.target_id));

  const tx = await client.transaction("write");
  try {
    await tx.execute({
      sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
      args: [pack.entityId, pack.expectedSlug, pack.canonicalName],
    });
    await tx.execute({
      sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
      args: [
        PHASE134_MADE_BY_ID,
        pack.entityId,
        PHASE134_WANCHER_ID,
        "Phase 134 exact Silk Black maker relation; Dream Pen article remains navigation-only.",
      ],
    });
    const sourceIds = await upsertSources(tx, uniqueSources([pack]));
    await insertPack(tx, pack, sourceIds);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }

  if ((await entityDigest(client, PHASE134_DREAM_ARTICLE_ID)) !== articleBefore)
    throw new Error("Phase 134 changed protected Dream Pen article payload.");
  if ((await entityDigest(client, PHASE134_MATTE_BLACK_ID)) !== matteBefore)
    throw new Error("Phase 134 changed protected Matte Black sibling payload.");
  if ((await entityDigest(client, PHASE134_WANCHER_ID, false)) !== brandBefore)
    throw new Error("Phase 134 changed Wancher non-topology payload.");
  const reverseAfter = (
    await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE134_WANCHER_ID],
    )
  ).map((row) => String(row.target_id));
  if (
    JSON.stringify(reverseAfter) !==
    JSON.stringify(reverseBefore.concat(PHASE134_SILK_BLACK_ID).sort())
  )
    throw new Error("Phase 134 Wancher reverse delta is not exact add-one.");

  const reviewer = options.reviewer.trim();
  await reviewPublish(
    client,
    PHASE134_WANCHER_ID,
    reviewer,
    "Phase 134 post-topology current hash; Wancher content pack was not replayed.",
  );
  const contentHash = await reviewPublish(
    client,
    pack.entityId,
    reviewer,
    `${pack.sourceMarker}; exact current, 2018 supplied-sample and AS IS boundaries.`,
  );
  await terminal(client, pack);
  if ((await entityDigest(client, PHASE134_DREAM_ARTICLE_ID)) !== articleBefore)
    throw new Error("Phase 134 changed Dream Pen article during publication.");
  if ((await entityDigest(client, PHASE134_MATTE_BLACK_ID)) !== matteBefore)
    throw new Error("Phase 134 changed Matte Black during publication.");
  if ((await entityDigest(client, PHASE134_WANCHER_ID, false)) !== brandBefore)
    throw new Error("Phase 134 replayed Wancher non-topology content.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    entities: [
      { entityId: pack.entityId, outcome: "published", contentHash },
    ],
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
  const reviewer = value("--reviewer") ?? "phase134-wancher-silk-black";
  if (!databasePath || !ownedRoot || !protectedCatalogPath)
    throw new Error(
      "Usage: tsx scripts/apply-phase134-wancher-dream-pen-true-ebonite-silk-black-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>",
    );
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    process.stdout.write(
      `${JSON.stringify(
        await applyPhase134WancherDreamPenTrueEboniteSilkBlackContent(client, {
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

export {
  PHASE134_SILK_BLACK_ID,
  PHASE134_SILK_BLACK_SLUG,
};
