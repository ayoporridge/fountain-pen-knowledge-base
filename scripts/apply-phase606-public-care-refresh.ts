import { createHash } from "node:crypto";
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
  type ApplyPhase22Options,
  type ApplyPhase22Result,
  insertPack,
  uniqueSources,
  upsertSources,
  validatePack,
} from "./apply-phase22-content";
import {
  PHASE606_TARGETS,
  phase606PublicCareRefreshPacks,
} from "./data/phase606-public-care-refresh";
import {
  type LoadedCuratedEntityPack,
  loadCuratedEntityPack,
} from "./lib/curated-content-pack";

export type ApplyPhase606Options = ApplyPhase22Options;
export type ApplyPhase606Result = ApplyPhase22Result;

const TARGET_IDS = PHASE606_TARGETS.map(({ entityId }) => entityId);
const BRAND_IDS = PHASE606_TARGETS.map(({ brandEntityId }) => brandEntityId);

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
  );
}

function rejectRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(
        `Phase 606 refuses inherited remote database selection: ${key}.`,
      );
    }
  }
}

function assertNoSidecarState(databasePath: string): void {
  for (const suffix of ["-wal", "-shm"] as const) {
    const companion = `${databasePath}${suffix}`;
    if (fs.existsSync(companion) && fs.statSync(companion).size > 0) {
      throw new Error(
        `Phase 606 refuses a non-empty SQLite companion: ${companion}.`,
      );
    }
  }
}

async function assertOwnedCatalog(
  client: Client,
  options: ApplyPhase606Options,
): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim())
    throw new Error("Phase 606 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  assertNoSidecarState(options.databasePath);

  const databaseLstat = fs.lstatSync(options.databasePath);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    databaseLstat.isSymbolicLink() ||
    !inside(databasePath, ownedRoot)
  ) {
    throw new Error(
      "Phase 606 requires a non-symlink catalog file inside the caller-owned root.",
    );
  }
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (
    owned.nlink !== BigInt(1) ||
    databasePath === protectedPath ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error(
      "Phase 606 refuses the protected catalog or a hard-link alias.",
    );
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (
    !main?.file ||
    fs.realpathSync.native(String(main.file)) !== databasePath
  ) {
    throw new Error(
      "Phase 606 client is not bound to the authorized owned copy.",
    );
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 606 owned copy must be migrated through 032.");
  }
  return workspaceRoot;
}

function sha256(file: string): string {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function loadAndValidatePacks(
  workspaceRoot: string,
): LoadedCuratedEntityPack[] {
  const packs = phase606PublicCareRefreshPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  const expectedIds = [...TARGET_IDS].sort().join(",");
  if (
    packs.length !== 3 ||
    packs.some((pack) => pack.expectedType !== "pen") ||
    packs
      .map(({ entityId }) => entityId)
      .sort()
      .join(",") !== expectedIds
  ) {
    throw new Error(
      "Phase 606 requires the exact three-model target-only pack set.",
    );
  }
  const claimed = new Map<string, string>();
  for (const pack of packs) {
    validatePack(workspaceRoot, pack);
    for (const value of [
      pack.canonicalName,
      ...pack.aliases.map(({ alias }) => alias),
    ]) {
      const normalized = value.trim().toLocaleLowerCase("en");
      const owner = claimed.get(normalized);
      if (owner && owner !== pack.entityId) {
        throw new Error(
          `Phase 606 pack-set name or alias collision: ${value}.`,
        );
      }
      claimed.set(normalized, pack.entityId);
    }
    const target = PHASE606_TARGETS.find(
      ({ entityId }) => entityId === pack.entityId,
    );
    if (!target || pack.spec?.brandEntityId !== target.brandEntityId) {
      throw new Error(`Phase 606 pack maker mismatch: ${pack.entityId}.`);
    }
    const localMedia = path.join(
      workspaceRoot,
      "public",
      target.primaryMediaPath.replace(/^\//, ""),
    );
    if (sha256(localMedia) !== target.primaryMediaSha256) {
      throw new Error(`Phase 606 primary SVG hash mismatch: ${pack.entityId}.`);
    }
  }
  return packs;
}

async function assertIdentityAndOwnership(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  for (const pack of packs) {
    const target = PHASE606_TARGETS.find(
      ({ entityId }) => entityId === pack.entityId,
    );
    if (!target) throw new Error(`Phase 606 unknown target: ${pack.entityId}.`);
    const direct = await client.execute({
      sql: "SELECT id,type,slug,name,source FROM entities WHERE id=? OR slug=? OR lower(name)=lower(?) ORDER BY id",
      args: [pack.entityId, pack.expectedSlug, pack.canonicalName],
    });
    const row = direct.rows[0];
    if (
      direct.rows.length !== 1 ||
      String(row?.id) !== pack.entityId ||
      String(row?.type) !== "pen" ||
      String(row?.slug) !== pack.expectedSlug ||
      String(row?.name) !== pack.canonicalName
    ) {
      throw new Error(
        `Phase 606 refuses identity collision: ${pack.expectedSlug}: ${JSON.stringify(direct.rows)}.`,
      );
    }
    if (
      ![target.priorSourceMarker, pack.sourceMarker].includes(
        String(row?.source),
      )
    ) {
      throw new Error(
        `Phase 606 refuses source ownership mismatch: ${pack.entityId}.`,
      );
    }
    for (const alias of pack.aliases) {
      const collision = await client.execute({
        sql: `
          SELECT id,'entity' AS surface FROM entities
          WHERE lower(name)=lower(?) AND id<>?
          UNION ALL
          SELECT entity_id AS id,'alias' AS surface FROM entity_aliases
          WHERE lower(alias)=lower(?) AND entity_id<>?
        `,
        args: [alias.alias, pack.entityId, alias.alias, pack.entityId],
      });
      if (collision.rows.length > 0) {
        throw new Error(
          `Phase 606 refuses alias collision for ${alias.alias}: ${JSON.stringify(collision.rows)}.`,
        );
      }
    }
    const maker = await client.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [pack.entityId],
    });
    if (
      maker.rows.length !== 1 ||
      String(maker.rows[0]?.target_id) !== target.brandEntityId
    ) {
      throw new Error(`Phase 606 maker topology mismatch: ${pack.entityId}.`);
    }
  }
}

async function adjacentDigests(client: Client): Promise<Map<string, string>> {
  const placeholders = BRAND_IDS.map(() => "?").join(",");
  const targetPlaceholders = TARGET_IDS.map(() => "?").join(",");
  const adjacent = await client.execute({
    sql: `
      SELECT DISTINCT public.id
      FROM public_entities public
      WHERE public.id IN (${placeholders})
         OR public.id IN (
           SELECT link.source_id FROM entity_links link
           WHERE link.link_type='made_by'
             AND link.target_id IN (${placeholders})
             AND link.source_id NOT IN (${targetPlaceholders})
         )
      ORDER BY public.id
    `,
    args: [...BRAND_IDS, ...BRAND_IDS, ...TARGET_IDS],
  });
  const result = new Map<string, string>();
  for (const row of adjacent.rows) {
    const entityId = String(row.id);
    result.set(entityId, await computePublicationContentHash(client, entityId));
  }
  return result;
}

function assertSameDigests(
  before: Map<string, string>,
  after: Map<string, string>,
): void {
  if (JSON.stringify([...before]) !== JSON.stringify([...after])) {
    throw new Error("Phase 606 adjacent public entity digest changed.");
  }
}

async function terminalState(
  client: Client,
  pack: LoadedCuratedEntityPack,
): Promise<string> {
  const target = PHASE606_TARGETS.find(
    ({ entityId }) => entityId === pack.entityId,
  );
  if (!target)
    throw new Error(`Phase 606 unknown terminal target: ${pack.entityId}.`);
  const contentHash = await computePublicationContentHash(
    client,
    pack.entityId,
  );
  const state = await client.execute({
    sql: `
      SELECT entity.type,entity.slug,entity.name,entity.source,
             publication.status,publication.blockers_json,
             publication.approved_content_hash,
             publication.reviewed_contract_version,
             publication.reviewed_content_revision,publication.content_revision,
             readiness.blocker_count,readiness.publishable,
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
    state.rows.length !== 1 ||
    String(row?.type) !== "pen" ||
    String(row?.slug) !== pack.expectedSlug ||
    String(row?.name) !== pack.canonicalName ||
    String(row?.source) !== pack.sourceMarker ||
    String(row?.status) !== "published" ||
    String(row?.blockers_json ?? "[]") !== "[]" ||
    String(row?.approved_content_hash) !== contentHash ||
    Number(row?.reviewed_contract_version) !== 3 ||
    Number(row?.reviewed_content_revision) !== Number(row?.content_revision) ||
    Number(row?.blocker_count) !== 0 ||
    Number(row?.publishable) !== 1 ||
    Number(row?.is_public) !== 1
  ) {
    throw new Error(
      `Phase 606 terminal publication mismatch: ${pack.entityId}: ${JSON.stringify(state.rows)}.`,
    );
  }
  const reviews = await client.execute({
    sql: `
      SELECT review_kind FROM entity_content_reviews
      WHERE entity_id=? AND content_hash=? AND status='approved'
      ORDER BY review_kind
    `,
    args: [pack.entityId, contentHash],
  });
  if (
    reviews.rows.map((review) => String(review.review_kind)).join(",") !==
    "fact,language,media,publication"
  ) {
    throw new Error(`Phase 606 review gate mismatch: ${pack.entityId}.`);
  }
  const payload = await client.execute({
    sql: `
      SELECT
        (SELECT count(*) FROM entity_aliases WHERE entity_id=? AND review_status='approved') AS aliases,
        (SELECT count(*) FROM model_variants WHERE model_entity_id=? AND review_status='approved') AS variants,
        (SELECT count(*) FROM model_specs WHERE entity_id=? AND review_status='approved') AS specs,
        (SELECT count(*) FROM media_assets WHERE entity_id=? AND usage_status='primary') AS media,
        (SELECT min(local_path) FROM media_assets WHERE entity_id=? AND usage_status='primary') AS media_path,
        (SELECT count(*) FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by') AS maker,
        (SELECT count(*) FROM entity_links WHERE source_id=? AND link_type='made_by') AS maker_total
    `,
    args: [
      pack.entityId,
      pack.entityId,
      pack.entityId,
      pack.entityId,
      pack.entityId,
      pack.entityId,
      target.brandEntityId,
      pack.entityId,
    ],
  });
  const counts = payload.rows[0];
  if (
    Number(counts?.aliases) !== pack.aliases.length ||
    Number(counts?.variants) !== (pack.variants?.length ?? 0) ||
    Number(counts?.specs) !== 1 ||
    Number(counts?.media) !== 1 ||
    String(counts?.media_path) !== target.primaryMediaPath ||
    Number(counts?.maker) !== 1 ||
    Number(counts?.maker_total) !== 1
  ) {
    throw new Error(
      `Phase 606 terminal payload mismatch: ${pack.entityId}: ${JSON.stringify(payload.rows)}.`,
    );
  }
  return contentHash;
}

async function allCurrent(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<boolean> {
  for (const pack of packs) {
    const source = await client.execute({
      sql: "SELECT source FROM entities WHERE id=?",
      args: [pack.entityId],
    });
    if (String(source.rows[0]?.source ?? "") !== pack.sourceMarker)
      return false;
  }
  return true;
}

export async function applyPhase606PublicCareRefresh(
  client: Client,
  options: ApplyPhase606Options,
): Promise<ApplyPhase606Result> {
  const workspaceRoot = await assertOwnedCatalog(client, options);
  const packs = loadAndValidatePacks(workspaceRoot);
  await assertIdentityAndOwnership(client, packs);
  const adjacentBefore = await adjacentDigests(client);
  if (await allCurrent(client, packs)) {
    const entities: ApplyPhase606Result["entities"] = [];
    for (const pack of packs) {
      entities.push({
        entityId: pack.entityId,
        outcome: "noop",
        contentHash: await terminalState(client, pack),
      });
    }
    assertSameDigests(adjacentBefore, await adjacentDigests(client));
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return { entities };
  }

  const transaction = await client.transaction("write");
  try {
    const sourceItemIds = await upsertSources(
      transaction,
      uniqueSources(packs),
    );
    for (const pack of packs)
      await insertPack(transaction, pack, sourceItemIds);
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }

  const entities: ApplyPhase606Result["entities"] = [];
  for (const pack of packs) {
    const contentHash = await computePublicationContentHash(
      client,
      pack.entityId,
    );
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId: pack.entityId,
        reviewKind,
        reviewer: options.reviewer,
        status: "approved",
        notes: `${pack.sourceMarker}; ${reviewKind} review of the Phase 606 public care refresh.`,
        contentHash,
      });
    }
    const published = await publishEntity(client, {
      entityId: pack.entityId,
      reviewer: options.reviewer,
      contentHash,
    });
    entities.push({
      entityId: pack.entityId,
      outcome: "published",
      contentHash: published.contentHash,
    });
  }
  for (const pack of packs) await terminalState(client, pack);
  assertSameDigests(adjacentBefore, await adjacentDigests(client));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities };
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : (process.argv[index + 1] ?? null);
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error(
      "Usage: tsx scripts/apply-phase606-public-care-refresh.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const databasePath = path.resolve(database);
  const protectedCatalogPath = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${databasePath}` });
  try {
    const result = await applyPhase606PublicCareRefresh(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase606-public-care-refresh",
      databasePath,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath,
      protectedCatalogSnapshot: snapshotCatalogFiles(protectedCatalogPath),
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: "",
      },
    });
    console.log(JSON.stringify(result, null, 2));
  } finally {
    client.close();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
