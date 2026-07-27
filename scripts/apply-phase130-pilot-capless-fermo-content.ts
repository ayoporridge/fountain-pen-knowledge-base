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
  loadPhase130PilotFermoPacks,
  PHASE130_CAPLESS_ID,
  PHASE130_DECIMO_ID,
  PHASE130_LS_ID,
  PHASE130_MADE_BY_IDS,
  PHASE130_REVERSE_IDS,
  PHASE130_TARGET_IDS,
  PHASE130_TARGET_SLUGS,
  PHASE130_FERMO_ID,
  PHASE130_FERMO_SLUG,
  PHASE130_PILOT_ID,
} from "./data/phase130-pilot-capless-fermo";
import type { LoadedCuratedEntityPack } from "./lib/curated-content-pack";

export type ApplyPhase130Options = ApplyPhase22Options;
export type ApplyPhase130Result = ApplyPhase22Result;

const CANONICAL_REPO = "/Users/xz/Documents/fountain-pen-graph";
const ALLOWED_REPOS = new Set([
  "/Users/xz/CodeBuddy/fountain-pen-graph",
  CANONICAL_REPO,
]);
const PROTECTED_IDS = [
  PHASE130_CAPLESS_ID,
  PHASE130_DECIMO_ID,
  PHASE130_LS_ID,
] as const;
const PHASE130_CAPLESS_BASELINE_MARKERS = [
  // Phase 84 is the checked-in successor that rewrites the full-size Capless
  // copy without changing its canonical identity.
  "curated-content:phase84-pilot-capless-v3:",
  "curated-content:phase43-pilot-capless-v1:",
] as const;
const BASELINE = [
  [PHASE130_CAPLESS_ID, "pen", "pilot-capless", PHASE130_CAPLESS_BASELINE_MARKERS],
  [PHASE130_DECIMO_ID, "pen", "pilot-capless-decimo", "curated-content:phase43-pilot-capless-decimo-v1:"],
  [PHASE130_LS_ID, "pen", "pilot-capless-ls", "curated-content:phase43-pilot-capless-ls-v1:"],
] as const;

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
      throw new Error(`Phase 130 refuses inherited remote selection: ${key}.`);
}

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map(
    (row) => ({ ...row }),
  );
}

async function authority(client: Client, options: ApplyPhase130Options) {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim())
    throw new Error("Phase 130 reviewer must not be empty.");
  if (!ALLOWED_REPOS.has(options.workspaceRoot))
    throw new Error("Phase 130 requires the verified CodeBuddy/Documents repo pair.");
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const gitRoot = fs.realpathSync.native(
    execFileSync(
      "git",
      ["-C", options.workspaceRoot, "rev-parse", "--show-toplevel"],
      { encoding: "utf8" },
    ).trim(),
  );
  if (workspaceRoot !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO)
    throw new Error("Phase 130 verified repo aliases must resolve identically.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  if (fs.lstatSync(options.databasePath).isSymbolicLink())
    throw new Error("Phase 130 owned database must not be a symlink.");
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !inside(databasePath, ownedRoot))
    throw new Error("Phase 130 requires a database inside caller-owned root.");
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    Number(owned.nlink) !== 1 ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  )
    throw new Error("Phase 130 refuses protected catalog or hard-link aliases.");
  const main = (await client.execute("PRAGMA database_list")).rows.find(
    (row) => String(row.name) === "main",
  );
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath)
    throw new Error("Phase 130 client/path mismatch.");
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1)
    throw new Error("Phase 130 owned copy must be migrated through 032.");
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

async function baseline(client: Client) {
  const brand = (
    await rows(
      client,
      "SELECT entity.type,entity.slug,entity.source,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
      [PHASE130_PILOT_ID],
    )
  )[0];
  if (
    brand?.type !== "brand" ||
    brand?.slug !== "pilot" ||
    !String(brand?.source).startsWith("curated-content:phase43-pilot-brand-v1:") ||
    brand?.status !== "published" ||
    Number(brand?.is_public) !== 1
  )
    throw new Error("Phase 130 requires the exact published Pilot baseline.");
  for (const [id, type, slug, marker] of BASELINE) {
    const row = (
      await rows(
        client,
        "SELECT entity.type,entity.slug,entity.source,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity LEFT JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?",
        [id],
      )
    )[0];
    const source = String(row?.source ?? "");
    const markerValues = typeof marker === "string" ? [marker] : marker;
    const markerMatches = markerValues.some((candidate) => source.startsWith(candidate));
    if (
      row?.type !== type ||
      row?.slug !== slug ||
      !markerMatches ||
      row?.status !== "published" ||
      Number(row?.is_public) !== 1
    )
      throw new Error(`Phase 130 prerequisite baseline is invalid: ${id}.`);
  }
}

async function state(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<"empty" | "upgrade" | "terminal"> {
  const ids = packs.map((pack) => pack.entityId);
  const found = await rows(
    client,
    `SELECT id,type,slug,name,source FROM entities WHERE id IN (${ids.map(() => "?").join(",")}) OR slug IN (${packs.map(() => "?").join(",")}) ORDER BY id`,
    [...ids, ...packs.map((pack) => pack.expectedSlug)],
  );
  if (found.length === 0) return "empty";
  if (found.length !== packs.length)
    throw new Error("Phase 130 target state is partial or colliding.");
  const byId = new Map(found.map((row) => [String(row.id), row]));
  let requiresUpgrade = false;
  for (const pack of packs) {
    const row = byId.get(pack.entityId);
    if (row?.type !== "pen" || row?.slug !== pack.expectedSlug || row?.name !== pack.canonicalName)
      throw new Error("Phase 130 terminal identity is partial or alternate.");
    if (row.source !== pack.sourceMarker) requiresUpgrade = true;
  }
  return requiresUpgrade ? "upgrade" : "terminal";
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
    throw new Error("Phase 130 target alias/source collision; repair forbidden.");
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
        "SELECT id FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY id",
        [pack.entityId, pack.entityId],
      )
    ).map((item) => String(item.id));
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
          [PHASE130_MADE_BY_IDS[index], PHASE130_REVERSE_IDS[index]].sort(),
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
      throw new Error("Phase 130 terminal payload/topology/publication is invalid.");
  }
  const brandHash = await computePublicationContentHash(
    client,
    PHASE130_PILOT_ID,
  );
  const brand = (
    await rows(
      client,
      "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
      [PHASE130_PILOT_ID],
    )
  )[0];
  if (brand?.status !== "published" || brand?.approved_content_hash !== brandHash)
    throw new Error("Phase 130 terminal Pilot publication is stale.");
  return hashes;
}

export async function applyPhase130PilotFermoContent(
  client: Client,
  options: ApplyPhase130Options,
): Promise<ApplyPhase130Result> {
  const workspaceRoot = await authority(client, options);
  const packs = loadPhase130PilotFermoPacks(workspaceRoot);
  for (const pack of packs) validatePack(workspaceRoot, pack);
  await baseline(client);
  const currentState = await state(client, packs);
  if (currentState === "terminal") {
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
  for (const id of PROTECTED_IDS)
    protectedBefore.set(id, await entityDigest(client, id));
  const brandBefore = await entityDigest(client, PHASE130_PILOT_ID, false);
  const reverseBefore = (
    await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE130_PILOT_ID],
    )
  ).map((row) => String(row.target_id));

  const tx = await client.transaction("write");
  try {
    for (let index = 0; index < packs.length; index += 1) {
      const pack = packs[index]!;
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [pack.entityId, pack.expectedSlug, pack.canonicalName],
      });
      const linkId = PHASE130_MADE_BY_IDS[index]!;
      const existingLink = await tx.execute({
        sql: "SELECT source_id,target_id,link_type FROM entity_links WHERE id=?",
        args: [linkId],
      });
      if (existingLink.rows.length === 0) {
        await tx.execute({
          sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
          args: [
            linkId,
            pack.entityId,
            PHASE130_PILOT_ID,
            `Phase 130 exact ${pack.canonicalName} maker relation`,
          ],
        });
      } else if (
        String(existingLink.rows[0]?.source_id) !== pack.entityId ||
        String(existingLink.rows[0]?.target_id) !== PHASE130_PILOT_ID ||
        String(existingLink.rows[0]?.link_type) !== "made_by"
      ) {
        throw new Error(`Phase 130 maker relation collision: ${linkId}.`);
      }
    }
    const sourceIds = await upsertSources(tx, uniqueSources(packs));
    for (const pack of packs) await insertPack(tx, pack, sourceIds);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }

  if ((await entityDigest(client, PHASE130_PILOT_ID, false)) !== brandBefore)
    throw new Error("Phase 130 changed Pilot non-topology payload.");
  const reverseAfter = (
    await rows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
      [PHASE130_PILOT_ID],
    )
  ).map((row) => String(row.target_id));
  const expectedReverseAfter = [
    ...new Set([...reverseBefore, ...PHASE130_TARGET_IDS]),
  ].sort();
  if (JSON.stringify(reverseAfter) !== JSON.stringify(expectedReverseAfter))
    throw new Error("Phase 130 reverse delta is not exact add-one-or-existing.");
  for (const id of PROTECTED_IDS)
    if ((await entityDigest(client, id)) !== protectedBefore.get(id))
      throw new Error(`Phase 130 changed protected Pilot entity ${id}.`);

  const reviewer = options.reviewer.trim();
  await reviewPublish(
    client,
    PHASE130_PILOT_ID,
    reviewer,
    "Phase 130 post-topology current hash; no Pilot pack replay.",
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
  if ((await entityDigest(client, PHASE130_PILOT_ID, false)) !== brandBefore)
    throw new Error("Phase 130 replayed Pilot non-topology payload.");
  for (const id of PROTECTED_IDS)
    if ((await entityDigest(client, id)) !== protectedBefore.get(id))
      throw new Error(
        `Phase 130 changed protected Pilot entity ${id} after publication.`,
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
  const reviewer = value("--reviewer") ?? "phase130-pilot-capless-fermo";
  if (!databasePath || !ownedRoot || !protectedCatalogPath)
    throw new Error(
      "Usage: tsx scripts/apply-phase130-pilot-capless-fermo-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>",
    );
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    process.stdout.write(
      `${JSON.stringify(
        await applyPhase130PilotFermoContent(client, {
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

export { PHASE130_FERMO_ID, PHASE130_FERMO_SLUG };
