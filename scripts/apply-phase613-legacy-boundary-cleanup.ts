import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import Database from "better-sqlite3";
import {
  createClient,
  type Client,
  type Transaction,
} from "@libsql/client";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";

export const PHASE613_SOURCE_SHA256 =
  "92d3d9512efdd00505c3314957729c1889cd9baf3485d2afa4a66ca5874addd4";
export const PHASE613_CANDIDATE_SHA256 =
  "58380f7b575837e78e5464071404e0b32b7b2eb5dbda92ab022e409404b335a2";
export const PHASE613_REAL_SHA256 =
  "00ddd2dc6e1a9bde275920eed3d0d82e251be1e7d8b48bb1e27b6619e080d4c4";
export const PHASE613_EXPECTED_COUNTS = {
  nonPenSpecs: 2,
  publicPenSnapshotSpecs: 508,
  missingReverse: 42,
  knownPlaceholders: 7,
} as const;

const MARKER_SOURCE_KEY = "phase613-legacy-boundary-cleanup-v2";
const MARKER_ID = "phase613-legacy-boundary-cleanup-v2";
const MANIFEST_CHECKSUM = createHash("sha256")
  .update(
    JSON.stringify({
      marker: MARKER_SOURCE_KEY,
      source: PHASE613_SOURCE_SHA256,
      candidate: PHASE613_CANDIDATE_SHA256,
      real: PHASE613_REAL_SHA256,
      expected: PHASE613_EXPECTED_COUNTS,
    }),
  )
  .digest("hex");

const REMOTE_KEYS = [
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "FPKG_DATABASE_URL",
] as const;

const EXPECTED_BRAND_SPEC_SLUGS = new Set([
  "faber-castell",
  "graf-von-faber-castell",
]);

export const PHASE613_KNOWN_FIELD_REPAIRS = [
  {
    slug: "pilot-custom-742",
    field: "status",
    before: "当前 FKK-2000R-B 与同一 lineup 的 16 种官方尖号；地区供应需另核",
    after: null,
  },
  {
    slug: "pilot-custom-743",
    field: "status",
    before: "当前 FKK-3000R-B-M 与同一 lineup 的 14 种官方尖号；地区供应需另核",
    after: null,
  },
  {
    slug: "pilot-elite-95s",
    field: "status",
    before: "当前 FES-1MM-B-EF/F/M 三个官方黑色尖号入口；地区供应需另核",
    after: null,
  },
  {
    slug: "pilot-custom-heritage-912",
    field: "status",
    before: "当前 FKVH2MR-BF 与同一 lineup 的 15 种官方尖号；地区供应需另核",
    after: null,
  },
  {
    slug: "pelikan-souveran-m600",
    field: "weight",
    before: "官方口径约 16.4–18.0 g；是否含墨与版本需注明",
    after: "16.4 g",
  },
  {
    slug: "touchdown-tm",
    field: "status",
    before: "历史产品家族；1952 年后多数产品线转向 Snorkel，成员和市场版本需核对",
    after: null,
  },
  {
    slug: "sailor-naginata-togi-10-7121",
    field: "status",
    before: "官方当前展示；市场供应需向授权渠道确认",
    after: null,
  },
] as const;
const KNOWN_PLACEHOLDER_FIELDS = PHASE613_KNOWN_FIELD_REPAIRS;

type ProtectedCatalog = {
  path: string;
  snapshot: CatalogSnapshot;
};

export interface ApplyPhase613Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogs: readonly [ProtectedCatalog, ProtectedCatalog];
  env?: NodeJS.ProcessEnv;
}

type Target = {
  entityId: string;
  slug: string;
  type: "brand" | "pen";
  specId: string;
};

type Phase613Manifest = {
  version: 1;
  brandEntityIds: string[];
  penEntityIds: string[];
  changedEntityIds: string[];
  deletedSpecIds: string[];
  reverseIds: string[];
  replacedReverseIds: string[];
};

type ReadinessSnapshot = {
  blockerCount: number;
  blockersJson: string;
  publishable: number;
};

type AuthorityResult = {
  manifest: Phase613Manifest;
  status: "staged" | "applied";
};

export type ApplyPhase613Result = {
  outcome: "published" | "noop";
  affected: {
    brands: number;
    pens: number;
    deletedBrandSpecs: number;
    clearedPenSpecs: number;
    restoredReverseLinks: number;
  };
  entities: Array<{
    entityId: string;
    slug: string;
    type: "brand" | "pen";
    outcome: "published" | "noop";
    contentHash: string;
  }>;
};

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative !== "" &&
    !relative.startsWith("..") &&
    !path.isAbsolute(relative)
  );
}

function sha256(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function placeholders(values: readonly unknown[]): string {
  return values.map(() => "?").join(",");
}

async function rows(
  db: Client | Transaction,
  sql: string,
  args: readonly unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  const result = await db.execute({ sql, args: args as never[] });
  return result.rows.map((row) => ({ ...row }));
}

async function rollbackQuietly(transaction: Transaction): Promise<void> {
  if (transaction.closed) return;
  try {
    await transaction.rollback();
  } catch {
    // Keep the original write error.
  }
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of REMOTE_KEYS) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 613 refuses inherited remote selector ${key}.`);
    }
  }
}

function assertNoNonEmptySidecars(databasePath: string): void {
  for (const suffix of ["-wal", "-shm"] as const) {
    const sidecar = `${databasePath}${suffix}`;
    if (fs.existsSync(sidecar) && fs.statSync(sidecar).size > 0) {
      throw new Error(`Phase 613 refuses non-empty SQLite companion ${sidecar}.`);
    }
  }
}

async function assertOwnedAuthority(
  client: Client,
  options: ApplyPhase613Options,
): Promise<AuthorityResult | null> {
  rejectRemote(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 613 reviewer is required.");
  const [source, real] = options.protectedCatalogs;
  for (const catalog of [source, real]) {
    assertCatalogSnapshotUnchanged(catalog.snapshot);
  }
  if (
    source.snapshot.main.sha256 !== PHASE613_SOURCE_SHA256 ||
    real.snapshot.main.sha256 !== PHASE613_REAL_SHA256 ||
    source.snapshot.wal.exists ||
    source.snapshot.shm.exists ||
    real.snapshot.wal.exists ||
    real.snapshot.shm.exists
  ) {
    throw new Error("Phase 613 requires the frozen Phase 609 source and real catalog families.");
  }

  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !inside(databasePath, ownedRoot)
  ) {
    throw new Error("Phase 613 requires a non-symlink catalog inside the owned root.");
  }
  const owned = fs.statSync(databasePath, { bigint: true });
  if (owned.nlink !== BigInt(1)) {
    throw new Error("Phase 613 refuses catalog files with multiple hard links.");
  }
  for (const catalog of [source, real]) {
    const protectedPath = fs.realpathSync.native(catalog.path);
    const protectedStat = fs.statSync(protectedPath, { bigint: true });
    if (
      databasePath === protectedPath ||
      (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
    ) {
      throw new Error("Phase 613 refuses protected catalogs and hard-link aliases.");
    }
  }
  assertNoNonEmptySidecars(options.databasePath);
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 613 client is not bound to the authorized owned copy.");
  }
  const migration = await rows(
    client,
    "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL",
    ["032_taxonomy_identity.sql"],
  );
  if (migration.length !== 1) {
    throw new Error("Phase 613 owned copy must be migrated through 032.");
  }

  const markerRows = await rows(
    client,
    "SELECT source_checksum,status,note FROM taxonomy_batches WHERE source_key=?",
    [MARKER_SOURCE_KEY],
  );
  if (markerRows.length === 0) {
    if (sha256(databasePath) !== PHASE613_CANDIDATE_SHA256) {
      throw new Error("Phase 613 fresh candidate does not match the Phase 612 checkpoint.");
    }
    return null;
  }
  if (markerRows.length !== 1) throw new Error("Phase 613 marker is ambiguous.");
  const marker = markerRows[0];
  if (
    String(marker.source_checksum) !== MANIFEST_CHECKSUM ||
    !["staged", "applied"].includes(String(marker.status))
  ) {
    throw new Error("Phase 613 marker checksum or status is invalid.");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(String(marker.note ?? ""));
  } catch {
    throw new Error("Phase 613 marker manifest is not valid JSON.");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Phase 613 marker manifest is not an object.");
  }
  const manifest = parsed as Partial<Phase613Manifest>;
  if (
    manifest.version !== 1 ||
    !Array.isArray(manifest.brandEntityIds) ||
    !Array.isArray(manifest.penEntityIds) ||
    !Array.isArray(manifest.changedEntityIds) ||
    !Array.isArray(manifest.deletedSpecIds) ||
    !Array.isArray(manifest.reverseIds) ||
    !Array.isArray(manifest.replacedReverseIds) ||
    manifest.changedEntityIds.some((id) => typeof id !== "string") ||
    manifest.reverseIds.some((id) => typeof id !== "string") ||
    manifest.replacedReverseIds.some((id) => typeof id !== "string")
  ) {
    throw new Error("Phase 613 marker manifest shape is invalid.");
  }
  const status = String(marker.status);
  if (status !== "staged" && status !== "applied") {
    throw new Error(`Phase 613 marker status is unsupported: ${status}.`);
  }
  return { manifest: manifest as Phase613Manifest, status };
}

async function loadTargets(client: Client): Promise<{
  brands: Target[];
  pens: Target[];
  reverseIds: string[];
  replacedReverseIds: string[];
}> {
  const brandRows = await rows(
    client,
    `SELECT e.id AS entity_id,e.slug,e.type,s.id AS spec_id
     FROM model_specs s JOIN entities e ON e.id=s.entity_id
     WHERE e.type != 'pen' ORDER BY e.slug`,
  );
  if (
    brandRows.length !== PHASE613_EXPECTED_COUNTS.nonPenSpecs ||
    new Set(brandRows.map((row) => String(row.slug))).size !== brandRows.length ||
    !brandRows.every((row) => EXPECTED_BRAND_SPEC_SLUGS.has(String(row.slug)))
  ) {
    throw new Error("Phase 613 non-pen model-spec preflight does not match the two known brand rows.");
  }
  const brands = brandRows.map((row) => ({
    entityId: String(row.entity_id),
    slug: String(row.slug),
    type: "brand" as const,
    specId: String(row.spec_id),
  }));

  const penRows = await rows(
    client,
    `SELECT e.id AS entity_id,e.slug,e.type,s.id AS spec_id
     FROM model_specs s
     JOIN entities e ON e.id=s.entity_id
     JOIN public_entities public ON public.id=e.id
     WHERE e.type='pen' AND (s.price_range IS NOT NULL OR s.status IS NOT NULL)
     ORDER BY e.slug`,
  );
  if (penRows.length !== PHASE613_EXPECTED_COUNTS.publicPenSnapshotSpecs) {
    throw new Error(
      `Phase 613 expected ${PHASE613_EXPECTED_COUNTS.publicPenSnapshotSpecs} public pen snapshot specs, found ${penRows.length}.`,
    );
  }
  const pens = penRows.map((row) => ({
    entityId: String(row.entity_id),
    slug: String(row.slug),
    type: "pen" as const,
    specId: String(row.spec_id),
  }));

  for (const check of KNOWN_PLACEHOLDER_FIELDS) {
    const result = await rows(
      client,
      `SELECT s.entity_id,s.${check.field} AS value
       FROM model_specs s JOIN entities e ON e.id=s.entity_id
       WHERE e.slug=? AND e.type='pen'`,
      [check.slug],
    );
    if (
      result.length !== 1 ||
      String(result[0]?.value ?? "").trim() !== check.before
    ) {
      throw new Error(
        `Phase 613 known placeholder preflight does not match ${check.slug}.${check.field}.`,
      );
    }
    if (!pens.some((pen) => pen.entityId === String(result[0]?.entity_id))) {
      throw new Error(
        `Phase 613 known placeholder is not part of the public pen target set: ${check.slug}.${check.field}.`,
      );
    }
  }

  const missing = await rows(
    client,
    `SELECT f.id,
            (SELECT r.id FROM entity_links r
             WHERE r.source_id=f.target_id AND r.target_id=f.source_id
               AND r.link_type='reverse' ORDER BY r.id LIMIT 1) AS existing_reverse_id
     FROM entity_links f
     WHERE f.link_type != 'reverse'
       AND NOT EXISTS (
         SELECT 1 FROM entity_links r
         WHERE r.id='rev-'||f.id
           AND r.source_id=f.target_id
           AND r.target_id=f.source_id
           AND r.link_type='reverse'
       )
     ORDER BY f.id`,
  );
  if (missing.length !== PHASE613_EXPECTED_COUNTS.missingReverse) {
    throw new Error(
      `Phase 613 expected ${PHASE613_EXPECTED_COUNTS.missingReverse} missing reverse rows, found ${missing.length}.`,
    );
  }
  const wrongReverseIds = await rows(
    client,
    `SELECT f.id
     FROM entity_links f
     JOIN entity_links r ON r.id='rev-'||f.id
     WHERE f.link_type != 'reverse'
       AND NOT (r.source_id=f.target_id AND r.target_id=f.source_id AND r.link_type='reverse')`,
  );
  if (wrongReverseIds.length > 0) {
    throw new Error("Phase 613 refuses to overwrite existing non-canonical reverse IDs.");
  }
  const replacedReverseIds = missing
    .map((row) => row.existing_reverse_id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  const canonicalAliasConflicts = await rows(
    client,
    `SELECT r.id
     FROM entity_links f
     JOIN entity_links r
       ON r.source_id=f.target_id AND r.target_id=f.source_id
      AND r.link_type='reverse'
     WHERE f.link_type != 'reverse'
       AND NOT EXISTS (
         SELECT 1 FROM entity_links exact
         WHERE exact.id='rev-'||f.id
           AND exact.source_id=f.target_id
           AND exact.target_id=f.source_id
           AND exact.link_type='reverse'
       )
       AND r.id IN (SELECT 'rev-'||forward.id FROM entity_links forward)`,
  );
  if (canonicalAliasConflicts.length > 0) {
    throw new Error("Phase 613 refuses to delete a reverse row that is canonical for another forward relation.");
  }
  return {
    brands,
    pens,
    reverseIds: missing.map((row) => `rev-${String(row.id)}`),
    replacedReverseIds,
  };
}

async function assertTerminalState(
  client: Client,
  manifest: Phase613Manifest,
): Promise<ApplyPhase613Result["entities"]> {
  const nonPen = await rows(
    client,
    "SELECT 1 FROM model_specs s JOIN entities e ON e.id=s.entity_id WHERE e.type != 'pen'",
  );
  if (nonPen.length !== 0) throw new Error("Phase 613 terminal state still has non-pen model specs.");
  const snapshots = await rows(
    client,
    `SELECT 1 FROM model_specs s JOIN public_entities public ON public.id=s.entity_id
     WHERE public.type='pen' AND (s.price_range IS NOT NULL OR s.status IS NOT NULL)`,
  );
  if (snapshots.length !== 0) throw new Error("Phase 613 terminal state still exposes price/status snapshots.");
  const missing = await rows(
    client,
    `SELECT f.id FROM entity_links f
     WHERE f.link_type != 'reverse'
       AND NOT EXISTS (
         SELECT 1 FROM entity_links r
         WHERE r.id='rev-'||f.id AND r.source_id=f.target_id
           AND r.target_id=f.source_id AND r.link_type='reverse'
       )`,
  );
  if (missing.length !== 0) throw new Error("Phase 613 terminal state still has missing reverse rows.");
  for (const check of KNOWN_PLACEHOLDER_FIELDS) {
    const result = await rows(
      client,
      `SELECT s.${check.field} AS value
       FROM model_specs s JOIN entities e ON e.id=s.entity_id
       WHERE e.slug=? AND e.type='pen'`,
      [check.slug],
    );
    if (result.length !== 1 || result[0]?.value !== check.after) {
      throw new Error(
        `Phase 613 terminal placeholder field is not normalized: ${check.slug}.${check.field}.`,
      );
    }
  }
  const ids = manifest.changedEntityIds;
  if (ids.length === 0) throw new Error("Phase 613 manifest has no changed entities.");
  const stateRows = await rows(
    client,
    `SELECT e.id,e.slug,e.type,p.status,p.approved_content_hash,
            p.content_revision,p.reviewed_content_revision,p.reviewed_contract_version,
            readiness.blocker_count,readiness.publishable,
            CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
     FROM entities e JOIN entity_publications p ON p.entity_id=e.id
     LEFT JOIN public_entity_readiness readiness
       ON readiness.entity_id=e.id AND readiness.contract_version=3
     LEFT JOIN public_entities public ON public.id=e.id
     WHERE e.id IN (${placeholders(ids)}) ORDER BY e.id`,
    ids,
  );
  if (stateRows.length !== ids.length) throw new Error("Phase 613 changed entity state is incomplete.");
  const stateById = new Map(stateRows.map((row) => [String(row.id), row]));
  const reviewRows = await rows(
    client,
    `SELECT entity_id,content_hash,review_kind,status
     FROM entity_content_reviews
     WHERE entity_id IN (${placeholders(ids)})
       AND review_kind IN ('fact','language','media','publication')
       AND status='approved'
       AND content_hash IN (
         SELECT approved_content_hash FROM entity_publications WHERE entity_id IN (${placeholders(ids)})
       )
     ORDER BY entity_id,review_kind`,
    [...ids, ...ids],
  );
  const reviewKinds = new Map<string, Set<string>>();
  for (const row of reviewRows) {
    const id = String(row.entity_id);
    const set = reviewKinds.get(id) ?? new Set<string>();
    set.add(String(row.review_kind));
    reviewKinds.set(id, set);
  }
  const entities: ApplyPhase613Result["entities"] = [];
  for (const id of ids) {
    const row = stateById.get(id);
    const hash = String(row?.approved_content_hash ?? "");
    if (
      !row ||
      String(row.status) !== "published" ||
      !hash.startsWith("sha256:v3:") ||
      Number(row.content_revision) !== Number(row.reviewed_content_revision) ||
      Number(row.reviewed_contract_version) !== 3 ||
      Number(row.blocker_count) !== 0 ||
      Number(row.publishable) !== 1 ||
      Number(row.is_public) !== 1 ||
      reviewKinds.get(id)?.size !== 4
    ) {
      throw new Error(`Phase 613 publication state is incomplete: ${id}.`);
    }
    entities.push({
      entityId: id,
      slug: String(row.slug),
      type: String(row.type) === "brand" ? "brand" : "pen",
      outcome: "noop",
      contentHash: hash,
    });
  }
  return entities;
}

async function assertMutationState(
  client: Client,
  manifest: Phase613Manifest,
): Promise<void> {
  const nonPen = await rows(
    client,
    "SELECT 1 FROM model_specs s JOIN entities e ON e.id=s.entity_id WHERE e.type != 'pen'",
  );
  if (nonPen.length !== 0) {
    throw new Error("Phase 613 staged state still has non-pen model specs.");
  }
  const penSpecs = await rows(
    client,
    `SELECT entity_id,price_range,status
     FROM model_specs WHERE entity_id IN (${placeholders(manifest.penEntityIds)})
     ORDER BY entity_id`,
    manifest.penEntityIds,
  );
  if (
    penSpecs.length !== manifest.penEntityIds.length ||
    penSpecs.some((row) => row.price_range !== null || row.status !== null)
  ) {
    throw new Error("Phase 613 staged pen specs are incomplete.");
  }
  for (const repair of KNOWN_PLACEHOLDER_FIELDS) {
    const result = await rows(
      client,
      `SELECT s.${repair.field} AS value
       FROM model_specs s JOIN entities e ON e.id=s.entity_id
       WHERE e.slug=? AND e.type='pen'`,
      [repair.slug],
    );
    if (result.length !== 1 || result[0]?.value !== repair.after) {
      throw new Error(
        `Phase 613 staged field normalization is incomplete: ${repair.slug}.${repair.field}.`,
      );
    }
  }
  const missing = await rows(
    client,
    `SELECT f.id FROM entity_links f
     WHERE f.link_type != 'reverse' AND NOT EXISTS (
       SELECT 1 FROM entity_links r
       WHERE r.id='rev-'||f.id AND r.source_id=f.target_id
         AND r.target_id=f.source_id AND r.link_type='reverse'
     )`,
  );
  if (missing.length !== 0) {
    throw new Error("Phase 613 staged state still has missing reverse rows.");
  }
  const reverseRows = await rows(
    client,
    `SELECT id FROM entity_links WHERE id IN (${placeholders(manifest.reverseIds)})`,
    manifest.reverseIds,
  );
  if (reverseRows.length !== manifest.reverseIds.length) {
    throw new Error("Phase 613 staged state is missing canonical reverse rows.");
  }
  const publicationRows = await rows(
    client,
    `SELECT entity_id,status FROM entity_publications
     WHERE entity_id IN (${placeholders(manifest.changedEntityIds)})`,
    manifest.changedEntityIds,
  );
  if (
    publicationRows.length !== manifest.changedEntityIds.length ||
    publicationRows.some((row) => String(row.status) !== "in_review")
  ) {
    throw new Error("Phase 613 staged publication state is not uniformly in_review.");
  }
}

async function checkpointOwnedClient(
  client: Client,
  databasePath: string,
): Promise<void> {
  const result = await client.execute("PRAGMA wal_checkpoint(TRUNCATE)");
  if (Number(result.rows[0]?.busy ?? 0) !== 0) {
    throw new Error("Phase 613 owned-copy WAL checkpoint is busy.");
  }
  const walPath = `${databasePath}-wal`;
  if (fs.existsSync(walPath) && fs.statSync(walPath).size !== 0) {
    throw new Error("Phase 613 owned-copy WAL checkpoint did not truncate the WAL.");
  }
}

async function precomputePublicationHashes(
  databasePath: string,
  scratchRoot: string,
  entityIds: readonly string[],
): Promise<Map<string, string>> {
  const hashCopy = path.join(
    scratchRoot,
    `.phase613-hash-copy-${process.pid}-${Date.now()}.db`,
  );
  fs.copyFileSync(databasePath, hashCopy);
  const readDb = new Database(hashCopy, {
    readonly: true,
    fileMustExist: true,
  });
  const hashDb = {
    execute: async (statement: { sql: string; args?: readonly unknown[] }) => ({
      rows: readDb
        .prepare(statement.sql)
        .all(...(statement.args ?? [])),
    }),
  } as never;
  const hashes = new Map<string, string>();
  try {
    for (const entityId of entityIds) {
      hashes.set(entityId, await computePublicationContentHash(hashDb, entityId));
    }
  } finally {
    readDb.close();
    for (const suffix of ["", "-wal", "-shm"] as const) {
      fs.rmSync(`${hashCopy}${suffix}`, { force: true });
    }
  }
  return hashes;
}

async function reviewAndPublish(
  client: Client,
  options: ApplyPhase613Options,
  manifest: Phase613Manifest,
  hashes: Map<string, string>,
  readinessSnapshots: Map<string, ReadinessSnapshot>,
): Promise<ApplyPhase613Result["entities"]> {
  const metadata = await rows(
    client,
    `SELECT id,slug,type FROM entities
     WHERE id IN (${placeholders(manifest.changedEntityIds)})`,
    manifest.changedEntityIds,
  );
  const metadataById = new Map(metadata.map((row) => [String(row.id), row]));
  if (metadataById.size !== manifest.changedEntityIds.length) {
    throw new Error("Phase 613 review manifest entity metadata is incomplete.");
  }
  const transaction = await client.transaction("write");
  const entities: ApplyPhase613Result["entities"] = [];
  try {
    // Brands must become public before their pens can pass the made_by
    // readiness blocker. The content-review and publication guards remain in
    // force for every entity through the shared transaction.
    const publicationOrder = [
      ...manifest.brandEntityIds,
      ...manifest.penEntityIds,
    ];
    if (
      publicationOrder.length !== manifest.changedEntityIds.length ||
      new Set(publicationOrder).size !== publicationOrder.length
    ) {
      throw new Error("Phase 613 publication order does not match the manifest.");
    }
    for (const entityId of publicationOrder) {
      const contentHash = hashes.get(entityId);
      if (!contentHash?.startsWith("sha256:v3:")) {
        throw new Error(`Phase 613 content hash precomputation failed: ${entityId}.`);
      }
      for (const reviewKind of ["fact", "language", "media"] as const) {
        await recordEntityContentReview(client, {
          entityId,
          reviewKind,
          reviewer: options.reviewer,
          status: "approved",
          contentHash,
          notes: `Phase 613 ${reviewKind} review after removing undated public snapshots and correcting legacy boundary metadata.`,
          transaction,
        });
      }
      await publishEntity(client, {
        entityId,
        reviewer: options.reviewer,
        contentHash,
        readiness: readinessSnapshots.get(entityId),
        assertPublicMembership: false,
        transaction,
      });
      const row = metadataById.get(entityId);
      entities.push({
        entityId,
        slug: String(row?.slug),
        type: String(row?.type) === "brand" ? "brand" : "pen",
        outcome: "published",
        contentHash,
      });
    }
    const markerUpdate = await transaction.execute({
      sql: `UPDATE taxonomy_batches
            SET status='applied',updated_at=datetime('now')
            WHERE source_key=? AND status='staged'`,
      args: [MARKER_SOURCE_KEY],
    });
    if (Number(markerUpdate.rowsAffected) !== 1) {
      throw new Error("Phase 613 staged marker transition failed.");
    }
    await transaction.commit();
  } catch (error) {
    await rollbackQuietly(transaction);
    throw error;
  }
  return entities;
}

export async function applyPhase613LegacyBoundaryCleanup(
  client: Client,
  options: ApplyPhase613Options,
): Promise<ApplyPhase613Result> {
  const authority = await assertOwnedAuthority(client, options);
  if (authority?.status === "applied") {
    const entities = await assertTerminalState(client, authority.manifest);
    assertCatalogSnapshotUnchanged(options.protectedCatalogs[0].snapshot);
    assertCatalogSnapshotUnchanged(options.protectedCatalogs[1].snapshot);
    return {
      outcome: "noop",
      affected: {
        brands: authority.manifest.brandEntityIds.length,
        pens: authority.manifest.penEntityIds.length,
        deletedBrandSpecs: authority.manifest.deletedSpecIds.length,
        clearedPenSpecs: authority.manifest.penEntityIds.length,
        restoredReverseLinks: authority.manifest.reverseIds.length,
      },
      entities,
    };
  }

  let manifest: Phase613Manifest;
  if (authority?.status === "staged") {
    manifest = authority.manifest;
    await assertMutationState(client, manifest);
  } else {
    const targets = await loadTargets(client);
    const changedTargets = [...targets.brands, ...targets.pens];
    const changedEntityIds = changedTargets.map((target) => target.entityId);
    const brandIds = targets.brands.map((target) => target.entityId);
    const penIds = targets.pens.map((target) => target.entityId);
    manifest = {
      version: 1,
      brandEntityIds: brandIds,
      penEntityIds: penIds,
      changedEntityIds,
      deletedSpecIds: targets.brands.map((target) => target.specId),
      reverseIds: targets.reverseIds,
      replacedReverseIds: [],
    };
    const transaction = await client.transaction("write");
    try {
      const brandSpecIds = targets.brands.map((target) => target.specId);
      const brandSpecPlaceholders = placeholders(brandSpecIds);
      await transaction.execute({
        sql: `DELETE FROM spec_field_evidence WHERE model_spec_id IN (${brandSpecPlaceholders})`,
        args: brandSpecIds,
      });
      await transaction.execute({
        sql: `DELETE FROM citations WHERE target_type='model_spec' AND target_id IN (${brandSpecPlaceholders})`,
        args: brandSpecIds,
      });
      const deleted = await transaction.execute({
        sql: `DELETE FROM model_specs WHERE id IN (${brandSpecPlaceholders})`,
        args: brandSpecIds,
      });
      if (Number(deleted.rowsAffected) !== targets.brands.length) {
        throw new Error(`Phase 613 deleted ${deleted.rowsAffected} brand specs instead of ${targets.brands.length}.`);
      }

      const penSpecIds = targets.pens.map((target) => target.specId);
      const penSpecPlaceholders = placeholders(penSpecIds);
      const cleared = await transaction.execute({
        sql: `UPDATE model_specs SET price_range=NULL,status=NULL,updated_at=datetime('now')
              WHERE id IN (${penSpecPlaceholders})
                AND (price_range IS NOT NULL OR status IS NOT NULL)`,
        args: penSpecIds,
      });
      if (Number(cleared.rowsAffected) !== targets.pens.length) {
        throw new Error(`Phase 613 cleared ${cleared.rowsAffected} pen specs instead of ${targets.pens.length}.`);
      }

      for (const repair of KNOWN_PLACEHOLDER_FIELDS) {
        if (repair.after === null) continue;
        const expectedCurrentValue = repair.before;
        const currentPredicate =
          `${repair.field}=?`;
        const normalized = await transaction.execute({
          sql: `UPDATE model_specs
                SET ${repair.field}=?,updated_at=datetime('now')
                WHERE entity_id=(SELECT id FROM entities WHERE slug=? AND type='pen')
                  AND ${currentPredicate}`,
          args: [repair.after, repair.slug, expectedCurrentValue],
        });
        if (Number(normalized.rowsAffected) !== 1) {
          throw new Error(
            `Phase 613 normalized ${normalized.rowsAffected} rows for ${repair.slug}.${repair.field}.`,
          );
        }
      }

      const replacementReverseRows = await rows(
        transaction,
        `SELECT r.id
         FROM entity_links f
         JOIN entity_links r
           ON r.source_id=f.target_id AND r.target_id=f.source_id
          AND r.link_type='reverse'
         WHERE f.link_type != 'reverse'
           AND NOT EXISTS (
             SELECT 1 FROM entity_links exact
             WHERE exact.id='rev-'||f.id
               AND exact.source_id=f.target_id
               AND exact.target_id=f.source_id
               AND exact.link_type='reverse'
           )
         ORDER BY r.id`,
      );
      const replacementReverseIds = replacementReverseRows.map((row) => String(row.id));
      if (replacementReverseIds.length > 0) {
        await transaction.execute({
          sql: `DELETE FROM entity_links WHERE id IN (${placeholders(replacementReverseIds)})`,
          args: replacementReverseIds,
        });
      }
      const reverseInsert = await transaction.execute({
        sql: `INSERT INTO entity_links(id,source_id,target_id,link_type,reason)
              SELECT 'rev-'||f.id,f.target_id,f.source_id,'reverse',
                     'Phase 613 restored canonical reverse relation'
              FROM entity_links f
              WHERE f.link_type != 'reverse'
                AND NOT EXISTS (
                  SELECT 1 FROM entity_links r
                  WHERE r.id='rev-'||f.id AND r.source_id=f.target_id
                    AND r.target_id=f.source_id AND r.link_type='reverse'
                )`,
      });
      if (Number(reverseInsert.rowsAffected) !== targets.reverseIds.length) {
        throw new Error(`Phase 613 restored ${reverseInsert.rowsAffected} reverse rows instead of ${targets.reverseIds.length}.`);
      }
      manifest.replacedReverseIds = replacementReverseIds;
      await transaction.execute({
        sql: `INSERT INTO taxonomy_batches(id,source_key,source_checksum,status,note)
              VALUES(?,?,?,'staged',?)`,
        args: [MARKER_ID, MARKER_SOURCE_KEY, MANIFEST_CHECKSUM, JSON.stringify(manifest)],
      });
      await transaction.commit();
    } catch (error) {
      await rollbackQuietly(transaction);
      throw error;
    }
    await assertMutationState(client, manifest);
  }

  await checkpointOwnedClient(client, options.databasePath);
  // A committed staged mutation can be read quickly through better-sqlite3;
  // the publication writes still use the guarded @libsql/client APIs below.
  const hashes = await precomputePublicationHashes(
    options.databasePath,
    options.ownedRoot,
    manifest.changedEntityIds,
  );
  // publishEntity's SQLite transition guard performs the authoritative
  // blocker check. Passing an optimistic snapshot avoids repeating the
  // expensive readiness view for every entity; a blocked transition still
  // aborts the caller-owned transaction.
  const readinessSnapshots = new Map<string, ReadinessSnapshot>(
    manifest.changedEntityIds.map((entityId) => [entityId, {
      blockerCount: 0,
      blockersJson: "[]",
      publishable: 1,
    }]),
  );
  const publishedEntities = await reviewAndPublish(
    client,
    options,
    manifest,
    hashes,
    readinessSnapshots,
  );
  const terminalEntities = await assertTerminalState(client, manifest);
  assertCatalogSnapshotUnchanged(options.protectedCatalogs[0].snapshot);
  assertCatalogSnapshotUnchanged(options.protectedCatalogs[1].snapshot);
  return {
    outcome: "published",
    affected: {
      brands: manifest.brandEntityIds.length,
      pens: manifest.penEntityIds.length,
      deletedBrandSpecs: manifest.deletedSpecIds.length,
      clearedPenSpecs: manifest.penEntityIds.length,
      restoredReverseLinks: manifest.reverseIds.length,
    },
    entities: publishedEntities.map((entity) => ({
      ...entity,
      contentHash:
        terminalEntities.find((candidate) => candidate.entityId === entity.entityId)?.contentHash ?? entity.contentHash,
    })),
  };
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const sourceCatalog = value("--source-catalog");
  const realCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !sourceCatalog || !realCatalog) {
    throw new Error(
      "Usage: tsx scripts/apply-phase613-legacy-boundary-cleanup.ts --database <owned-copy> --owned-root <root> --source-catalog <source> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const databasePath = path.resolve(database);
  const sourcePath = path.resolve(sourceCatalog);
  const realPath = path.resolve(realCatalog);
  const client = createClient({ url: `file:${databasePath}` });
  try {
    const result = await applyPhase613LegacyBoundaryCleanup(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase613-legacy-boundary-cleanup",
      databasePath,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogs: [
        { path: sourcePath, snapshot: snapshotCatalogFiles(sourcePath) },
        { path: realPath, snapshot: snapshotCatalogFiles(realPath) },
      ],
      env: process.env,
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
