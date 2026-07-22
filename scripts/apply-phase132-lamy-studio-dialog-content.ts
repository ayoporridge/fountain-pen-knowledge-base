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
  loadPhase132LamyStudioDialogPacks,
  phase132MadeById,
  phase132ReverseId,
  PHASE132_DIALOG_RAW_SLUG,
  PHASE132_DIALOG_SLUG,
  PHASE132_LAMY_ID,
  PHASE132_STUDIO_RAW_SLUG,
  PHASE132_STUDIO_SLUG,
} from "./data/phase132-lamy-studio-dialog";
import type { LoadedCuratedEntityPack } from "./lib/curated-content-pack";

export type ApplyPhase132Options = ApplyPhase22Options;
export type ApplyPhase132Result = ApplyPhase22Result;

const CANONICAL_REPO = "/Users/xz/Documents/fountain-pen-graph";
const ALLOWED_REPOS = new Set([
  "/Users/xz/CodeBuddy/fountain-pen-graph",
  CANONICAL_REPO,
]);
const TARGETS = [
  { key: "studio", rawSlug: PHASE132_STUDIO_RAW_SLUG, slug: PHASE132_STUDIO_SLUG, name: "LAMY studio" },
  { key: "dialog", rawSlug: PHASE132_DIALOG_RAW_SLUG, slug: PHASE132_DIALOG_SLUG, name: "LAMY dialog" },
] as const;
type TargetIds = { studio: string; dialog: string };

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
      throw new Error(`Phase 132 refuses inherited remote selection: ${key}.`);
}

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

async function authority(client: Client, options: ApplyPhase132Options) {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim())
    throw new Error("Phase 132 reviewer must not be empty.");
  if (!ALLOWED_REPOS.has(options.workspaceRoot))
    throw new Error("Phase 132 requires the verified CodeBuddy/Documents repo pair.");
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const gitRoot = fs.realpathSync.native(
    execFileSync(
      "git",
      ["-C", options.workspaceRoot, "rev-parse", "--show-toplevel"],
      { encoding: "utf8" },
    ).trim(),
  );
  if (workspaceRoot !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO)
    throw new Error("Phase 132 verified repo aliases must resolve identically.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  if (fs.lstatSync(options.databasePath).isSymbolicLink())
    throw new Error("Phase 132 owned database must not be a symlink.");
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !inside(databasePath, ownedRoot))
    throw new Error("Phase 132 requires a database inside caller-owned root.");
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    Number(owned.nlink) !== 1 ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  )
    throw new Error("Phase 132 refuses protected catalog or hard-link aliases.");
  const main = (await client.execute("PRAGMA database_list")).rows.find(
    (row) => String(row.name) === "main",
  );
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath)
    throw new Error("Phase 132 client/path mismatch.");
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1)
    throw new Error("Phase 132 owned copy must be migrated through 032.");
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

async function baseline(client: Client): Promise<string[]> {
  const brand = (
    await rows(
      client,
      "SELECT entity.type,entity.slug,entity.source,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
      [PHASE132_LAMY_ID],
    )
  )[0];
  if (
    brand?.type !== "brand" ||
    brand?.slug !== "lamy" ||
    !String(brand?.source).startsWith("curated-content:phase68-lamy-brand-v1:") ||
    brand?.status !== "published" ||
    Number(brand?.is_public) !== 1
  )
    throw new Error("Phase 132 requires the exact published LAMY baseline.");
  const protectedIds: string[] = [];
  for (const [slug, marker] of [
    ["lamy-safari", "curated-content:phase68-lamy-safari-v1:"],
    ["lamy-al-star", "curated-content:phase68-lamy-alstar-v1:"],
  ] as const) {
    const row = (await rows(client, "SELECT entity.id,entity.type,entity.slug,entity.source,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity LEFT JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.slug=?", [slug]))[0];
    if (
      row?.type !== "pen" ||
      row?.slug !== slug ||
      !String(row?.source).startsWith(marker) ||
      row?.status !== "published" ||
      Number(row?.is_public) !== 1
    )
      throw new Error(`Phase 132 prerequisite baseline is invalid: ${slug}.`);
    protectedIds.push(String(row.id));
  }
  return protectedIds;
}

async function inspectTargets(
  client: Client,
): Promise<{ ids: TargetIds; state: "raw" | "terminal" }> {
  const found = await rows(client, `SELECT id,type,slug,name,source FROM entities WHERE slug IN (${TARGETS.flatMap(() => ["?", "?"]).join(",")}) ORDER BY slug`, TARGETS.flatMap((target) => [target.rawSlug, target.slug]));
  if (found.length !== 2) throw new Error("Phase 132 requires exactly two raw-or-terminal LAMY identities.");
  const ids = {} as TargetIds;
  const states = new Set<"raw" | "terminal">();
  for (const target of TARGETS) {
    const matches = found.filter((row) => row.slug === target.rawSlug || row.slug === target.slug);
    if (matches.length !== 1 || matches[0]?.type !== "pen") throw new Error(`Phase 132 target identity is missing or colliding: ${target.key}.`);
    const row = matches[0]!;
    ids[target.key] = String(row.id);
    if (row.slug === target.rawSlug && row.source == null) states.add("raw");
    else if (row.slug === target.slug && String(row.source).startsWith(`curated-content:phase132-lamy-${target.key}-v1:`)) states.add("terminal");
    else throw new Error(`Phase 132 target identity is partial or alternate: ${target.key}.`);
  }
  if (states.size !== 1) throw new Error("Phase 132 target state mixes raw and terminal identities.");
  return { ids, state: [...states][0]! };
}

async function collisionPreflight(
  client: Client,
  packs: LoadedCuratedEntityPack[],
) {
  const aliases = packs.flatMap((pack) =>
    pack.aliases.map((alias) => alias.alias),
  );
  const aliasOwners = await rows(
    client,
    `SELECT entity_id,alias FROM entity_aliases WHERE alias IN (${aliases.map(() => "?").join(",")}) AND entity_id NOT IN (${packs.map(() => "?").join(",")})`,
    [...aliases, ...packs.map((pack) => pack.entityId)],
  );
  const markerOwners = await rows(
    client,
    `SELECT id,source FROM entities WHERE source IN (${packs.map(() => "?").join(",")}) AND id NOT IN (${packs.map(() => "?").join(",")})`,
    [
      ...packs.map((pack) => pack.sourceMarker),
      ...packs.map((pack) => pack.entityId),
    ],
  );
  if (aliasOwners.length > 0 || markerOwners.length > 0)
    throw new Error("Phase 132 target alias/source collision; repair forbidden.");
}

async function installRawPacks(
  client: Client,
  packs: LoadedCuratedEntityPack[],
) {
  const transaction = await client.transaction("write");
  try {
    const batchKey = "phase132-lamy-studio-dialog-canonical-v1";
    const batchId = stableId("phase132-batch", batchKey);
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)",
      args: [batchId, batchKey, hash(batchKey), "Canonicalize only exact raw LAMY studio and dialog 3 identities; dialog cc excluded."],
    });
    for (let index = 0; index < TARGETS.length; index += 1) {
      const target = TARGETS[index]!;
      const pack = packs[index]!;
      const changed = await transaction.execute({
        sql: "UPDATE entities SET slug=?,name=?,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=? AND source IS NULL",
        args: [target.slug, target.name, pack.entityId, target.rawSlug],
      });
      if (changed.rowsAffected !== 1)
        throw new Error(`Phase 132 raw identity changed before migration: ${target.key}.`);
      const actionId = stableId("phase132-action", pack.entityId);
      await transaction.execute({
        sql: "INSERT OR IGNORE INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'rename',?,?,?,'applied',?)",
        args: [actionId, batchId, target.rawSlug, hash(`${pack.entityId}:${target.rawSlug}:${target.slug}`), pack.entityId, pack.entityId, `Canonicalized exact LAMY ${target.key} raw identity in place.`],
      });
      await transaction.execute({
        sql: "INSERT OR IGNORE INTO entity_lineage(id,batch_id,action_id,source_entity_id,target_entity_id,lineage_kind,fallback_reason) VALUES(?,?,?,?,?,'rename',NULL)",
        args: [stableId("phase132-lineage", pack.entityId), batchId, actionId, pack.entityId, pack.entityId],
      });
      const sourcePath = `/pen/${target.rawSlug}`;
      const targetPath = `/pen/${target.slug}`;
      const existingRedirect = await transaction.execute({
        sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?",
        args: [sourcePath],
      });
      if (existingRedirect.rows.length === 0) {
        await transaction.execute({
          sql: "INSERT INTO entity_redirects(id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES(?,?,?,?,?,'permanent','canonical_slug_rename')",
          args: [stableId("phase132-redirect", sourcePath), batchId, actionId, sourcePath, targetPath],
        });
      } else if (
        existingRedirect.rows.length !== 1 ||
        existingRedirect.rows[0]?.target_path !== targetPath ||
        existingRedirect.rows[0]?.redirect_kind !== "permanent"
      ) {
        throw new Error(`Phase 132 conflicting old-route redirect: ${target.key}.`);
      }
      await transaction.execute({
        sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by'",
        args: [pack.entityId],
      });
      await transaction.execute({
        sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        args: [PHASE132_LAMY_ID, pack.entityId],
      });
      await transaction.execute({
        sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
        args: [phase132MadeById(pack.entityId), pack.entityId, PHASE132_LAMY_ID, `Phase 132 exact ${target.name} maker relation`],
      });
      await transaction.execute({
        sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
        args: [phase132ReverseId(pack.entityId), PHASE132_LAMY_ID, pack.entityId, `Phase 132 LAMY navigation to ${target.name}`],
      });
    }
    const sourceIds = await upsertSources(transaction, uniqueSources(packs));
    for (const pack of packs) await insertPack(transaction, pack, sourceIds);
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

async function terminal(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<string[]> {
  const hashes: string[] = [];
  for (let index = 0; index < packs.length; index += 1) {
    const pack = packs[index]!;
    const current = await computePublicationContentHash(client, pack.entityId);
    hashes.push(current);
    const row = (
      await rows(
        client,
        `SELECT entity.type,entity.slug,entity.name,entity.source,publication.status,publication.approved_content_hash,publication.content_revision,publication.reviewed_content_revision,publication.reviewed_contract_version,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public
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
        "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY link_type,source_id,target_id",
        [pack.entityId, pack.entityId],
      )
    ).map((item) => [String(item.source_id), String(item.target_id), String(item.link_type)]);
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
        JSON.stringify(
          [
            [pack.entityId, PHASE132_LAMY_ID, "made_by"],
            [PHASE132_LAMY_ID, pack.entityId, "reverse"],
          ],
        ) ||
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
      throw new Error("Phase 132 terminal payload/topology/publication is invalid.");
  }
  const brandHash = await computePublicationContentHash(
    client,
    PHASE132_LAMY_ID,
  );
  const brand = (
    await rows(
      client,
      "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
      [PHASE132_LAMY_ID],
    )
  )[0];
  if (brand?.status !== "published" || brand?.approved_content_hash !== brandHash)
    throw new Error("Phase 132 terminal LAMY publication is stale.");
  for (const target of TARGETS) {
    const redirect = await rows(client, "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?", [`/pen/${target.rawSlug}`]);
    if (redirect.length !== 1 || redirect[0]?.target_path !== `/pen/${target.slug}` || redirect[0]?.redirect_kind !== "permanent")
      throw new Error(`Phase 132 terminal redirect is invalid: ${target.key}.`);
  }
  return hashes;
}

export async function applyPhase132LamyStudioDialogContent(
  client: Client,
  options: ApplyPhase132Options,
): Promise<ApplyPhase132Result> {
  const workspaceRoot = await authority(client, options);
  const protectedIds = await baseline(client);
  const inspected = await inspectTargets(client);
  const packs = loadPhase132LamyStudioDialogPacks(workspaceRoot, inspected.ids);
  for (const pack of packs) validatePack(workspaceRoot, pack);
  if (inspected.state === "terminal") {
    const hashes = await terminal(client, packs);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return {
      entities: packs.map((pack, index) => ({
        entityId: pack.entityId,
        outcome: "noop" as const,
        contentHash: hashes[index]!,
      })),
    };
  }
  await collisionPreflight(client, packs);

  const protectedBefore = new Map<string, string>();
  for (const id of protectedIds)
    protectedBefore.set(id, await entityDigest(client, id));
  const brandBefore = await entityDigest(client, PHASE132_LAMY_ID, false);
  const reverseBefore = (
    await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE132_LAMY_ID],
    )
  ).map((row) => String(row.target_id));

  await installRawPacks(client, packs);

  if ((await entityDigest(client, PHASE132_LAMY_ID, false)) !== brandBefore)
    throw new Error("Phase 132 changed LAMY non-topology payload.");
  const reverseAfter = (
    await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE132_LAMY_ID],
    )
  ).map((row) => String(row.target_id));
  if (
    JSON.stringify(reverseAfter) !==
    JSON.stringify([...new Set([...reverseBefore, ...packs.map((pack) => pack.entityId)])].sort())
  )
    throw new Error("Phase 132 reverse delta is not exact target migration.");
  for (const id of protectedIds)
    if ((await entityDigest(client, id)) !== protectedBefore.get(id))
      throw new Error(`Phase 132 changed protected LAMY entity ${id}.`);

  const reviewer = options.reviewer.trim();
  await reviewPublish(
    client,
    PHASE132_LAMY_ID,
    reviewer,
    "Phase 132 post-topology current hash; no LAMY pack replay.",
  );
  const hashes: string[] = [];
  for (const pack of packs)
    hashes.push(
      await reviewPublish(
        client,
        pack.entityId,
        reviewer,
        `${pack.sourceMarker}; exact SKU, time and sample boundaries.`,
      ),
    );
  await terminal(client, packs);
  if ((await entityDigest(client, PHASE132_LAMY_ID, false)) !== brandBefore)
    throw new Error("Phase 132 replayed LAMY non-topology payload.");
  for (const id of protectedIds)
    if ((await entityDigest(client, id)) !== protectedBefore.get(id))
      throw new Error(
        `Phase 132 changed protected LAMY entity ${id} after publication.`,
      );
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    entities: packs.map((pack, index) => ({
      entityId: pack.entityId,
      outcome: "published" as const,
      contentHash: hashes[index]!,
    })),
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
  const reviewer = value("--reviewer") ?? "phase132-lamy-studio-dialog";
  if (!databasePath || !ownedRoot || !protectedCatalogPath)
    throw new Error(
      "Usage: tsx scripts/apply-phase132-lamy-studio-dialog-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>",
    );
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    process.stdout.write(
      `${JSON.stringify(
        await applyPhase132LamyStudioDialogContent(client, {
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

export { PHASE132_DIALOG_SLUG, PHASE132_STUDIO_SLUG };
