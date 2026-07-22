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
  loadPhase136ConklinDuragraphPack,
  PHASE136_CONKLIN_BRAND_ID,
  PHASE136_CURRENT_URL,
  PHASE136_DURAGRAPH_ID,
  PHASE136_DURAGRAPH_SLUG,
  PHASE136_GLIDER_ID,
  PHASE136_MADE_BY_ID,
  PHASE136_NOZAC_ID,
  PHASE136_REVERSE_ID,
} from "./data/phase136-conklin-duragraph";
import type { LoadedCuratedEntityPack } from "./lib/curated-content-pack";

export type ApplyPhase136Options = ApplyPhase22Options;
export type ApplyPhase136Result = ApplyPhase22Result;

const CANONICAL_REPO = "/Users/xz/Documents/fountain-pen-graph";
const ALLOWED_REPOS = new Set([
  "/Users/xz/CodeBuddy/fountain-pen-graph",
  CANONICAL_REPO,
]);
const BRAND_MARKER = "curated-content:phase99-conklin-brand-v1:";
const NOZAC_MARKER = "curated-content:phase99-nozac-v1:";
const GLIDER_MARKER = "curated-content:phase99-glider-v1:";

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
      throw new Error(`Phase 136 refuses inherited remote selection: ${key}.`);
}

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

async function authority(client: Client, options: ApplyPhase136Options) {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim())
    throw new Error("Phase 136 reviewer must not be empty.");
  if (!ALLOWED_REPOS.has(options.workspaceRoot))
    throw new Error("Phase 136 requires the verified CodeBuddy/Documents repo pair.");
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const gitRoot = fs.realpathSync.native(
    execFileSync(
      "git",
      ["-C", options.workspaceRoot, "rev-parse", "--show-toplevel"],
      { encoding: "utf8" },
    ).trim(),
  );
  if (workspaceRoot !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO)
    throw new Error("Phase 136 verified repo aliases must resolve identically.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  if (fs.lstatSync(options.databasePath).isSymbolicLink())
    throw new Error("Phase 136 owned database must not be a symlink.");
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    !inside(databasePath, ownedRoot)
  )
    throw new Error("Phase 136 requires a database inside caller-owned root.");
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    Number(owned.nlink) !== 1 ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  )
    throw new Error("Phase 136 refuses protected catalog or hard-link aliases.");
  const main = (await client.execute("PRAGMA database_list")).rows.find(
    (row) => String(row.name) === "main",
  );
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath)
    throw new Error("Phase 136 client/path mismatch.");
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1)
    throw new Error("Phase 136 owned copy must be migrated through 032.");
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
  const found = await rows(
    client,
    `SELECT entity.id,entity.type,entity.slug,entity.source,publication.status,
            CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public
       FROM entities entity
       LEFT JOIN entity_publications publication ON publication.entity_id=entity.id
       LEFT JOIN public_entities public ON public.id=entity.id
      WHERE entity.id IN (?,?,?) ORDER BY entity.id`,
    [PHASE136_CONKLIN_BRAND_ID, PHASE136_NOZAC_ID, PHASE136_GLIDER_ID],
  );
  const byId = new Map(found.map((row) => [String(row.id), row]));
  const expected = [
    [PHASE136_CONKLIN_BRAND_ID, "brand", "conklin", BRAND_MARKER],
    [PHASE136_NOZAC_ID, "pen", "the-conklin-nozac", NOZAC_MARKER],
    [PHASE136_GLIDER_ID, "pen", "the-conklin-glider", GLIDER_MARKER],
  ] as const;
  for (const [id, type, slug, marker] of expected) {
    const row = byId.get(id);
    if (
      row?.type !== type ||
      row?.slug !== slug ||
      !String(row?.source).startsWith(marker) ||
      row?.status !== "published" ||
      Number(row?.is_public) !== 1
    )
      throw new Error(`Phase 136 requires the exact published Conklin baseline: ${id}.`);
  }
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
         OR entity.source_url=? OR (item.url=? AND entity.type='pen') OR entity.source=?
      ORDER BY entity.id`,
    [
      pack.entityId,
      pack.expectedSlug,
      ...names,
      ...names,
      PHASE136_CURRENT_URL,
      PHASE136_CURRENT_URL,
      pack.sourceMarker,
    ],
  );
  if (found.length === 0) return "empty";
  if (found.length !== 1)
    throw new Error("Phase 136 found an alternate exact Duragraph pen.");
  const row = found[0];
  if (
    row?.id !== pack.entityId ||
    row?.type !== "pen" ||
    row?.slug !== pack.expectedSlug ||
    row?.name !== pack.canonicalName ||
    row?.source !== pack.sourceMarker
  )
    throw new Error("Phase 136 Duragraph identity is partial or alternate.");
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
      WHERE lower(alias) IN (${aliases.map(() => "lower(?)").join(",")}) AND entity_id<>?`,
    [...aliases, pack.entityId],
  );
  const markerOwners = await rows(
    client,
    "SELECT id FROM entities WHERE source=? AND id<>?",
    [pack.sourceMarker, pack.entityId],
  );
  if (aliasOwners.length > 0 || markerOwners.length > 0)
    throw new Error("Phase 136 target alias/source collision; repair forbidden.");
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
      JSON.stringify([PHASE136_MADE_BY_ID, PHASE136_REVERSE_ID].sort()) ||
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
    throw new Error("Phase 136 terminal payload/topology/publication is invalid.");
  const brandHash = await computePublicationContentHash(
    client,
    PHASE136_CONKLIN_BRAND_ID,
  );
  const brand = (
    await rows(
      client,
      "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
      [PHASE136_CONKLIN_BRAND_ID],
    )
  )[0];
  if (brand?.status !== "published" || brand?.approved_content_hash !== brandHash)
    throw new Error("Phase 136 terminal Conklin publication is stale.");
  return currentHash;
}

export async function applyPhase136ConklinDuragraphContent(
  client: Client,
  options: ApplyPhase136Options,
): Promise<ApplyPhase136Result> {
  const workspaceRoot = await authority(client, options);
  const pack = loadPhase136ConklinDuragraphPack(workspaceRoot);
  validatePack(workspaceRoot, pack);
  await baseline(client);
  const currentState = await state(client, pack);
  if (currentState === "terminal") {
    const contentHash = await terminal(client, pack);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return {
      entities: [{ entityId: pack.entityId, outcome: "noop", contentHash }],
    };
  }
  await collisionPreflight(client, pack);

  const nozacBefore = await entityDigest(client, PHASE136_NOZAC_ID);
  const gliderBefore = await entityDigest(client, PHASE136_GLIDER_ID);
  const brandBefore = await entityDigest(client, PHASE136_CONKLIN_BRAND_ID, false);
  const reverseBefore = (
    await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE136_CONKLIN_BRAND_ID],
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
        PHASE136_MADE_BY_ID,
        pack.entityId,
        PHASE136_CONKLIN_BRAND_ID,
        "Phase 136 verified modern Duragraph maker relation.",
      ],
    });
    const sourceIds = await upsertSources(tx, uniqueSources([pack]));
    await insertPack(tx, pack, sourceIds);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }

  if ((await entityDigest(client, PHASE136_NOZAC_ID)) !== nozacBefore)
    throw new Error("Phase 136 changed protected Nozac content.");
  if ((await entityDigest(client, PHASE136_GLIDER_ID)) !== gliderBefore)
    throw new Error("Phase 136 changed protected Glider content.");
  if (
    (await entityDigest(client, PHASE136_CONKLIN_BRAND_ID, false)) !== brandBefore
  )
    throw new Error("Phase 136 changed Conklin non-topology payload.");
  const reverseAfter = (
    await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE136_CONKLIN_BRAND_ID],
    )
  ).map((row) => String(row.target_id));
  if (
    JSON.stringify(reverseAfter) !==
    JSON.stringify(reverseBefore.concat(PHASE136_DURAGRAPH_ID).sort())
  )
    throw new Error("Phase 136 Conklin reverse delta is not exact add-one.");

  const reviewer = options.reviewer.trim();
  await reviewPublish(
    client,
    PHASE136_CONKLIN_BRAND_ID,
    reviewer,
    "Phase 136 post-topology current hash; Conklin brand pack was not replayed.",
  );
  const contentHash = await reviewPublish(
    client,
    pack.entityId,
    reviewer,
    `${pack.sourceMarker}; current family, exact SKU material and dated review scopes.`,
  );
  await terminal(client, pack);
  if ((await entityDigest(client, PHASE136_NOZAC_ID)) !== nozacBefore)
    throw new Error("Phase 136 changed protected Nozac during publication.");
  if ((await entityDigest(client, PHASE136_GLIDER_ID)) !== gliderBefore)
    throw new Error("Phase 136 changed protected Glider during publication.");
  if (
    (await entityDigest(client, PHASE136_CONKLIN_BRAND_ID, false)) !== brandBefore
  )
    throw new Error("Phase 136 replayed Conklin non-topology content.");
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
  const reviewer = value("--reviewer") ?? "phase136-conklin-duragraph";
  if (!databasePath || !ownedRoot || !protectedCatalogPath)
    throw new Error(
      "Usage: tsx scripts/apply-phase136-conklin-duragraph-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>",
    );
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    process.stdout.write(
      `${JSON.stringify(
        await applyPhase136ConklinDuragraphContent(client, {
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

export { PHASE136_DURAGRAPH_ID, PHASE136_DURAGRAPH_SLUG };
