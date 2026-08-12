import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  PHASE599_BENU_BRAND_ID,
  PHASE599_IDS,
  PHASE599_SLUGS,
  phase599BenuPacks,
} from "./data/phase599-benu-canonical-families";
import {
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export { PHASE599_BENU_BRAND_ID, PHASE599_IDS, PHASE599_SLUGS } from "./data/phase599-benu-canonical-families";
export type ApplyPhase599Options = ApplyPhase22Options;
export type ApplyPhase599Result = ApplyPhase22Result;

const TARGETS = Object.entries(PHASE599_IDS).map(([key, id]) => {
  const typedKey = key as keyof typeof PHASE599_IDS;
  const pack = phase599BenuPacks.find((candidate) => candidate.entityId === id);
  if (!pack) throw new Error(`Phase 599 missing target pack: ${key}.`);
  return { key: typedKey, id, slug: PHASE599_SLUGS[typedKey], name: pack.canonicalName };
});

const ACCEPTED_BRAND_SOURCE_PREFIXES = [
  "curated-content:phase427-benu-brand-depth-refresh-v1:",
  "curated-content:phase599-benu-brand-current-family-refresh-v1:",
] as const;

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 599 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(
  client: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  const result = await client.execute({ sql, args: args as never[] });
  return result.rows.map((row) => ({ ...row }));
}

async function assertOwnedCatalog(client: Client, options: ApplyPhase599Options): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 599 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);

  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const databaseLstat = fs.lstatSync(options.databasePath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    databaseLstat.isSymbolicLink() ||
    !isInside(databasePath, ownedRoot)
  ) {
    throw new Error("Phase 599 requires a non-symlink catalog file inside the caller-owned root.");
  }

  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (owned.nlink !== BigInt(1)) throw new Error("Phase 599 refuses catalog files with more than one hard link.");
  if (databasePath === protectedPath || (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)) {
    throw new Error("Phase 599 refuses the protected catalog or a hard-link alias.");
  }

  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 599 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 599 owned copy must be migrated through 032.");
  return workspaceRoot;
}

function loadAndValidatePackSet(workspaceRoot: string): LoadedCuratedEntityPack[] {
  const packs = phase599BenuPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  if (
    packs.length !== 12 ||
    packs[0]?.entityId !== PHASE599_BENU_BRAND_ID ||
    packs[0]?.expectedType !== "brand" ||
    packs.slice(1).some((pack) => pack.expectedType !== "pen")
  ) {
    throw new Error("Phase 599 requires the exact BENU brand plus eleven family packs.");
  }
  for (const target of TARGETS) {
    const pack = packs.find((candidate) => candidate.entityId === target.id);
    if (!pack || pack.expectedSlug !== target.slug || pack.canonicalName !== target.name) {
      throw new Error(`Phase 599 pack identity mismatch: ${target.id}.`);
    }
  }
  const claimed = new Map<string, string>();
  for (const pack of packs.slice(1)) {
    for (const value of [pack.canonicalName, ...pack.aliases.map(({ alias }) => alias)]) {
      const normalized = value.trim().toLocaleLowerCase("en");
      const existing = claimed.get(normalized);
      if (existing && existing !== pack.entityId) throw new Error(`Phase 599 pack-set name or alias collision: ${value}.`);
      claimed.set(normalized, pack.entityId);
    }
  }
  return packs;
}

async function assertIdentityPreflight(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const brand = await rows(
    client,
    `SELECT entity.id,entity.type,entity.slug,entity.name,entity.source,
            publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
     FROM entities entity
     JOIN entity_publications publication ON publication.entity_id=entity.id
     LEFT JOIN public_entities public ON public.id=entity.id
     WHERE entity.id=? OR entity.slug='benu'`,
    [PHASE599_BENU_BRAND_ID],
  );
  const brandSource = String(brand[0]?.source ?? "");
  if (
    brand.length !== 1 ||
    brand[0]?.id !== PHASE599_BENU_BRAND_ID ||
    brand[0]?.type !== "brand" ||
    brand[0]?.slug !== "benu" ||
    brand[0]?.name !== "BENU" ||
    !ACCEPTED_BRAND_SOURCE_PREFIXES.some((prefix) => brandSource.startsWith(prefix)) ||
    brand[0]?.status !== "published" ||
    Number(brand[0]?.is_public) !== 1
  ) {
    throw new Error(`Phase 599 BENU brand identity mismatch: ${JSON.stringify(brand)}.`);
  }

  for (const target of TARGETS) {
    const direct = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? OR lower(name)=lower(?) ORDER BY id", [target.id, target.slug, target.name]);
    if (
      direct.length > 1 ||
      (direct.length === 1 && (direct[0]?.id !== target.id || direct[0]?.type !== "pen" || direct[0]?.slug !== target.slug || direct[0]?.name !== target.name))
    ) {
      throw new Error(`Phase 599 refuses identity collision: ${target.slug}: ${JSON.stringify(direct)}.`);
    }
    const pack = packs.find((candidate) => candidate.entityId === target.id);
    if (!pack) throw new Error(`Phase 599 target pack vanished: ${target.id}.`);
    for (const alias of pack.aliases) {
      const collisions = await rows(
        client,
        `SELECT id,'entity' AS surface FROM entities WHERE lower(name)=lower(?) AND id<>?
         UNION ALL
         SELECT entity_id AS id,'alias' AS surface FROM entity_aliases WHERE lower(alias)=lower(?) AND entity_id<>?`,
        [alias.alias, target.id, alias.alias, target.id],
      );
      if (collisions.length > 0) throw new Error(`Phase 599 alias collision for ${alias.alias}: ${JSON.stringify(collisions)}.`);
    }
  }
}

async function entityDigest(client: Client, entityId: string): Promise<string> {
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
    "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
    "SELECT * FROM entity_publications WHERE entity_id=?",
    "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
  ];
  const payload: Array<Array<Record<string, unknown>>> = [];
  for (const sql of queries) payload.push(await rows(client, sql, sql.includes(" OR target_id") ? [entityId, entityId] : [entityId]));
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

async function protectedExistingBenuDigests(client: Client): Promise<Map<string, string>> {
  const targetIds = new Set<string>(TARGETS.map(({ id }) => id));
  const existing = await rows(client, "SELECT source_id AS id FROM entity_links WHERE target_id=? AND link_type='made_by' ORDER BY source_id", [PHASE599_BENU_BRAND_ID]);
  const digests = new Map<string, string>();
  for (const row of existing) {
    const id = String(row.id);
    if (!targetIds.has(id)) digests.set(id, await entityDigest(client, id));
  }
  return digests;
}

async function prepareIdentitiesAndTopology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    for (const target of TARGETS) {
      const existing = await rows(transaction, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id", [target.id, target.slug]);
      if (existing.length === 0) {
        await transaction.execute({ sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)", args: [target.id, target.slug, target.name] });
      } else if (existing.length !== 1 || existing[0]?.id !== target.id || existing[0]?.type !== "pen" || existing[0]?.slug !== target.slug || existing[0]?.name !== target.name) {
        throw new Error(`Phase 599 refuses a conflicting identity: ${target.slug}.`);
      }

      const maker = await rows(transaction, "SELECT id,target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", [target.id]);
      if (maker.length === 0) {
        await transaction.execute({ sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [stableId("phase599-made-by", target.id), target.id, PHASE599_BENU_BRAND_ID, "Phase 599 verified BENU canonical maker relation"] });
      } else if (maker.length !== 1 || maker[0]?.target_id !== PHASE599_BENU_BRAND_ID) {
        throw new Error(`Phase 599 ${target.slug} maker topology is ambiguous.`);
      }

      const reverse = await rows(transaction, "SELECT id,source_id FROM entity_links WHERE target_id=? AND link_type='reverse'", [target.id]);
      if (reverse.length === 0) {
        await transaction.execute({ sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [stableId("phase599-reverse", target.id), PHASE599_BENU_BRAND_ID, target.id, "Phase 599 BENU brand public family navigation"] });
      } else if (reverse.length !== 1 || reverse[0]?.source_id !== PHASE599_BENU_BRAND_ID) {
        throw new Error(`Phase 599 ${target.slug} reverse topology is ambiguous.`);
      }

      const publication = await rows(transaction, "SELECT status FROM entity_publications WHERE entity_id=?", [target.id]);
      if (publication.length !== 1 || !["draft", "in_review", "published"].includes(String(publication[0]?.status))) {
        throw new Error(`Phase 599 publication row is missing: ${target.id}.`);
      }
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

async function assertTerminalState(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  for (const pack of packs) {
    const state = await rows(
      client,
      `SELECT entity.type,entity.slug,entity.name,entity.source,publication.status,
              readiness.blocker_count,readiness.publishable,
              CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
       FROM entities entity
       JOIN entity_publications publication ON publication.entity_id=entity.id
       LEFT JOIN public_entity_readiness readiness ON readiness.entity_id=entity.id AND readiness.contract_version=3
       LEFT JOIN public_entities public ON public.id=entity.id
       WHERE entity.id=?`,
      [pack.entityId],
    );
    const current = state[0];
    if (
      state.length !== 1 || current?.type !== pack.expectedType || current?.slug !== pack.expectedSlug || current?.name !== pack.canonicalName ||
      current?.source !== pack.sourceMarker || current?.status !== "published" || Number(current?.blocker_count) !== 0 || Number(current?.publishable) !== 1 || Number(current?.is_public) !== 1
    ) {
      throw new Error(`Phase 599 terminal publication mismatch: ${pack.entityId}: ${JSON.stringify(state)}.`);
    }
    const reviews = await rows(client, "SELECT review_kind FROM entity_content_reviews WHERE entity_id=? AND content_hash=(SELECT approved_content_hash FROM entity_publications WHERE entity_id=?) AND status='approved' ORDER BY review_kind", [pack.entityId, pack.entityId]);
    if (
      reviews.map((row) => String(row.review_kind)).join(",") !==
      "fact,language,media,publication"
    ) {
      const publication = await rows(
        client,
        "SELECT status,approved_content_hash AS content_hash,reviewed_by AS reviewer FROM entity_publications WHERE entity_id=?",
        [pack.entityId],
      );
      const allReviews = await rows(
        client,
        "SELECT review_kind,status,content_hash,reviewer FROM entity_content_reviews WHERE entity_id=? ORDER BY reviewed_at DESC,review_kind",
        [pack.entityId],
      );
      throw new Error(
        `Phase 599 review gate mismatch: ${pack.entityId}: ${JSON.stringify({ publication, reviews, allReviews })}.`,
      );
    }
  }

  for (const target of TARGETS) {
    const maker = await rows(client, "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'", [target.id]);
    const reverse = await rows(client, "SELECT source_id FROM entity_links WHERE target_id=? AND link_type='reverse'", [target.id]);
    if (maker.length !== 1 || maker[0]?.target_id !== PHASE599_BENU_BRAND_ID || reverse.length !== 1 || reverse[0]?.source_id !== PHASE599_BENU_BRAND_ID) {
      throw new Error(`Phase 599 terminal topology mismatch: ${target.id}.`);
    }
  }
}

export async function applyPhase599BenuCanonicalFamiliesContent(client: Client, options: ApplyPhase599Options): Promise<ApplyPhase599Result> {
  const workspaceRoot = await assertOwnedCatalog(client, options);
  const packs = loadAndValidatePackSet(workspaceRoot);
  await assertIdentityPreflight(client, packs);
  const protectedBefore = await protectedExistingBenuDigests(client);
  await prepareIdentitiesAndTopology(client);
  const result = await applyCuratedContentPacks(client, options, phase599BenuPacks);
  await assertTerminalState(client, packs);
  for (const [id, before] of protectedBefore) {
    if ((await entityDigest(client, id)) !== before) throw new Error(`Phase 599 changed protected existing BENU model: ${id}.`);
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase599-benu-canonical-families-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const databasePath = path.resolve(database);
  const protectedCatalogPath = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${databasePath}` });
  try {
    const result = await applyPhase599BenuCanonicalFamiliesContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase599-benu-canonical-families",
      databasePath,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath,
      protectedCatalogSnapshot: snapshotCatalogFiles(protectedCatalogPath),
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
