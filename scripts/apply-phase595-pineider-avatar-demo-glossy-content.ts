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
  PHASE595_IDS,
  PHASE595_PINEIDER_BRAND_ID,
  PHASE595_SLUGS,
  phase595PineiderPacks,
} from "./data/phase595-pineider-avatar-demo-glossy";
import {
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export {
  PHASE595_IDS,
  PHASE595_PINEIDER_BRAND_ID,
  PHASE595_SLUGS,
} from "./data/phase595-pineider-avatar-demo-glossy";

export type ApplyPhase595Options = ApplyPhase22Options;
export type ApplyPhase595Result = ApplyPhase22Result;

const TARGETS = [
  {
    id: PHASE595_IDS.demoMetal,
    slug: PHASE595_SLUGS.demoMetal,
    name: "Pineider Avatar UR Demo Metal Fountain Pen",
  },
  {
    id: PHASE595_IDS.glossy,
    slug: PHASE595_SLUGS.glossy,
    name: "Pineider Avatar UR Glossy Fountain Pen",
  },
] as const;

const ACCEPTED_INITIAL_BRAND_SOURCE_PREFIX =
  "curated-content:phase594-pineider-brand-depth-refresh-v1:";

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 595 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function queryRows(
  client: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  const result = await client.execute({ sql, args: args as never[] });
  return result.rows.map((row) => ({ ...row }));
}

async function assertOwnedCatalog(
  client: Client,
  options: ApplyPhase595Options,
): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) {
    throw new Error("Phase 595 reviewer must not be empty.");
  }
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
    throw new Error(
      "Phase 595 requires a non-symlink catalog file inside the caller-owned root.",
    );
  }

  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (owned.nlink !== BigInt(1)) {
    throw new Error("Phase 595 refuses catalog files with more than one hard link.");
  }
  if (
    databasePath === protectedPath ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error("Phase 595 refuses the protected catalog or a hard-link alias.");
  }

  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 595 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 595 owned copy must be migrated through 032.");
  }
  return workspaceRoot;
}

function loadAndValidatePackSet(workspaceRoot: string): LoadedCuratedEntityPack[] {
  const packs = phase595PineiderPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  const expected = [
    PHASE595_PINEIDER_BRAND_ID,
    ...TARGETS.map((target) => target.id),
  ];
  if (
    packs.length !== expected.length ||
    packs.some((pack, index) => pack.entityId !== expected[index]) ||
    packs[0]?.expectedType !== "brand" ||
    packs.slice(1).some((pack) => pack.expectedType !== "pen")
  ) {
    throw new Error(
      "Phase 595 requires the exact Pineider brand plus Avatar Demo Metal and Glossy packs.",
    );
  }
  for (const target of TARGETS) {
    const pack = packs.find((candidate) => candidate.entityId === target.id);
    if (
      !pack ||
      pack.expectedSlug !== target.slug ||
      pack.canonicalName !== target.name
    ) {
      throw new Error(`Phase 595 pack identity mismatch: ${target.id}.`);
    }
  }

  const claimedNames = new Map<string, string>();
  for (const pack of packs.slice(1)) {
    for (const value of [pack.canonicalName, ...pack.aliases.map(({ alias }) => alias)]) {
      const normalized = value.trim().toLocaleLowerCase("en");
      const existing = claimedNames.get(normalized);
      if (existing && existing !== pack.entityId) {
        throw new Error(`Phase 595 pack-set name or alias collision: ${value}.`);
      }
      claimedNames.set(normalized, pack.entityId);
    }
  }
  return packs;
}

async function assertIdentityPreflight(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  const brandPack = packs[0];
  const brand = await queryRows(
    client,
    `SELECT entity.id,entity.type,entity.slug,entity.name,entity.source,
            publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
     FROM entities entity
     JOIN entity_publications publication ON publication.entity_id=entity.id
     LEFT JOIN public_entities public ON public.id=entity.id
     WHERE entity.id=? OR entity.slug='pineider'`,
    [PHASE595_PINEIDER_BRAND_ID],
  );
  const currentSource = String(brand[0]?.source ?? "");
  const acceptedBrandSource =
    currentSource === brandPack?.sourceMarker ||
    currentSource.startsWith(ACCEPTED_INITIAL_BRAND_SOURCE_PREFIX);
  if (
    !brandPack ||
    brand.length !== 1 ||
    brand[0]?.id !== PHASE595_PINEIDER_BRAND_ID ||
    brand[0]?.type !== "brand" ||
    brand[0]?.slug !== "pineider" ||
    brand[0]?.name !== brandPack.canonicalName ||
    !acceptedBrandSource ||
    brand[0]?.status !== "published" ||
    Number(brand[0]?.is_public) !== 1
  ) {
    throw new Error(
      `Phase 595 Pineider brand identity mismatch: ${JSON.stringify(brand)}.`,
    );
  }

  for (const target of TARGETS) {
    const rows = await queryRows(
      client,
      `SELECT id,type,slug,name FROM entities
       WHERE id=? OR slug=? OR lower(name)=lower(?) ORDER BY id`,
      [target.id, target.slug, target.name],
    );
    if (
      rows.length > 1 ||
      (rows.length === 1 &&
        (rows[0]?.id !== target.id ||
          rows[0]?.type !== "pen" ||
          rows[0]?.slug !== target.slug ||
          rows[0]?.name !== target.name))
    ) {
      throw new Error(`Phase 595 entity, slug, or name collision: ${target.slug}.`);
    }

    const canonicalAliasCollisions = await queryRows(
      client,
      `SELECT entity.id,entity.type,entity.slug,alias.alias
       FROM entity_aliases alias
       JOIN entities entity ON entity.id=alias.entity_id
       WHERE lower(alias.alias)=lower(?) AND entity.id<>?`,
      [target.name, target.id],
    );
    if (canonicalAliasCollisions.length > 0) {
      throw new Error(
        `Phase 595 canonical name collides with an alias: ${target.name}.`,
      );
    }

    const pack = packs.find((candidate) => candidate.entityId === target.id);
    if (!pack) throw new Error(`Phase 595 missing loaded pack: ${target.id}.`);
    for (const alias of pack.aliases) {
      const collisions = await queryRows(
        client,
        `SELECT entity.id,entity.type,entity.slug,entity.name,alias.alias
         FROM entities entity
         LEFT JOIN entity_aliases alias ON alias.entity_id=entity.id
         WHERE entity.id<>? AND
           (lower(entity.name)=lower(?) OR lower(alias.alias)=lower(?))`,
        [target.id, alias.alias, alias.alias],
      );
      if (collisions.length > 0) {
        throw new Error(
          `Phase 595 alias collision for ${alias.alias}: ${JSON.stringify(collisions)}.`,
        );
      }
    }
  }
}

async function prepareIdentitiesAndTopology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    for (const target of TARGETS) {
      const existing = await queryRows(
        transaction,
        "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
        [target.id, target.slug],
      );
      if (existing.length === 0) {
        await transaction.execute({
          sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
          args: [target.id, target.slug, target.name],
        });
      } else if (
        existing.length !== 1 ||
        existing[0]?.id !== target.id ||
        existing[0]?.type !== "pen" ||
        existing[0]?.slug !== target.slug ||
        existing[0]?.name !== target.name
      ) {
        throw new Error(`Phase 595 refuses a conflicting identity: ${target.slug}.`);
      }

      const maker = await queryRows(
        transaction,
        "SELECT id,target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
        [target.id],
      );
      if (maker.length === 0) {
        await transaction.execute({
          sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
          args: [
            stableId("phase595-made-by", target.id),
            target.id,
            PHASE595_PINEIDER_BRAND_ID,
            "Phase 595 verified exact Pineider maker relation",
          ],
        });
      } else if (
        maker.length !== 1 ||
        maker[0]?.target_id !== PHASE595_PINEIDER_BRAND_ID
      ) {
        throw new Error(`Phase 595 ${target.slug} maker topology is ambiguous.`);
      }

      const reverse = await queryRows(
        transaction,
        "SELECT id,source_id FROM entity_links WHERE target_id=? AND link_type='reverse'",
        [target.id],
      );
      if (reverse.length === 0) {
        await transaction.execute({
          sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
          args: [
            stableId("phase595-reverse", target.id),
            PHASE595_PINEIDER_BRAND_ID,
            target.id,
            "Phase 595 Pineider brand public model navigation",
          ],
        });
      } else if (
        reverse.length !== 1 ||
        reverse[0]?.source_id !== PHASE595_PINEIDER_BRAND_ID
      ) {
        throw new Error(`Phase 595 ${target.slug} reverse topology is ambiguous.`);
      }

      const publication = await queryRows(
        transaction,
        "SELECT status FROM entity_publications WHERE entity_id=?",
        [target.id],
      );
      if (
        publication.length !== 1 ||
        !["draft", "in_review", "published"].includes(
          String(publication[0]?.status),
        )
      ) {
        throw new Error(`Phase 595 publication row is missing: ${target.id}.`);
      }
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
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
  for (const sql of queries) {
    payload.push(
      await queryRows(
        client,
        sql,
        sql.includes(" OR ") ? [entityId, entityId] : [entityId],
      ),
    );
  }
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

async function protectedPineiderModelDigests(
  client: Client,
): Promise<Map<string, string>> {
  const excluded = new Set<string>(TARGETS.map((target) => target.id));
  const models = await queryRows(
    client,
    `SELECT DISTINCT pen.id
     FROM entities pen
     JOIN entity_links maker
       ON maker.source_id=pen.id AND maker.link_type='made_by'
     JOIN public_entities public ON public.id=pen.id
     WHERE maker.target_id=?
     ORDER BY pen.id`,
    [PHASE595_PINEIDER_BRAND_ID],
  );
  const digests = new Map<string, string>();
  for (const row of models) {
    const id = String(row.id);
    if (!excluded.has(id)) digests.set(id, await entityDigest(client, id));
  }
  return digests;
}

async function assertTerminalState(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  for (const pack of packs) {
    const state = await queryRows(
      client,
      `SELECT entity.source,publication.status,publication.approved_content_hash,
              publication.content_revision,publication.reviewed_content_revision,
              publication.reviewed_contract_version,readiness.publishable,
              readiness.blocker_count,
              CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
       FROM entities entity
       JOIN entity_publications publication ON publication.entity_id=entity.id
       LEFT JOIN public_entity_readiness readiness
         ON readiness.entity_id=entity.id AND readiness.contract_version=3
       LEFT JOIN public_entities public ON public.id=entity.id
       WHERE entity.id=?`,
      [pack.entityId],
    );
    const current = state[0];
    if (
      state.length !== 1 ||
      current?.source !== pack.sourceMarker ||
      current?.status !== "published" ||
      Number(current?.content_revision) !==
        Number(current?.reviewed_content_revision) ||
      Number(current?.reviewed_contract_version) !== 3 ||
      Number(current?.publishable) !== 1 ||
      Number(current?.blocker_count) !== 0 ||
      Number(current?.is_public) !== 1
    ) {
      throw new Error(`Phase 595 terminal publication mismatch: ${pack.entityId}.`);
    }
    const reviews = await queryRows(
      client,
      `SELECT review_kind,status
       FROM entity_content_reviews
       WHERE entity_id=? AND content_hash=?
       ORDER BY review_kind`,
      [pack.entityId, current?.approved_content_hash],
    );
    const expectedReviews = ["fact", "language", "media", "publication"];
    if (
      reviews.length !== expectedReviews.length ||
      reviews.some(
        (review, index) =>
          review.review_kind !== expectedReviews[index] || review.status !== "approved",
      )
    ) {
      throw new Error(
        `Phase 595 current-hash approved review set is incomplete: ${pack.entityId}.`,
      );
    }
  }

  for (const target of TARGETS) {
    const maker = await queryRows(
      client,
      "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      [target.id],
    );
    const reverse = await queryRows(
      client,
      "SELECT source_id FROM entity_links WHERE target_id=? AND link_type='reverse'",
      [target.id],
    );
    if (
      maker.length !== 1 ||
      maker[0]?.target_id !== PHASE595_PINEIDER_BRAND_ID ||
      reverse.length !== 1 ||
      reverse[0]?.source_id !== PHASE595_PINEIDER_BRAND_ID
    ) {
      throw new Error(`Phase 595 terminal topology mismatch: ${target.id}.`);
    }
  }
}

export async function applyPhase595PineiderAvatarDemoGlossyContent(
  client: Client,
  options: ApplyPhase595Options,
): Promise<ApplyPhase595Result> {
  const workspaceRoot = await assertOwnedCatalog(client, options);
  const packs = loadAndValidatePackSet(workspaceRoot);
  await assertIdentityPreflight(client, packs);
  const protectedBefore = await protectedPineiderModelDigests(client);
  await prepareIdentitiesAndTopology(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    phase595PineiderPacks,
  );
  await assertTerminalState(client, packs);
  for (const [id, before] of protectedBefore) {
    if ((await entityDigest(client, id)) !== before) {
      throw new Error(`Phase 595 changed protected existing Pineider model: ${id}.`);
    }
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
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error(
      "Usage: tsx scripts/apply-phase595-pineider-avatar-demo-glossy-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const databasePath = path.resolve(database);
  const protectedCatalogPath = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${databasePath}` });
  try {
    const result = await applyPhase595PineiderAvatarDemoGlossyContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase595-pineider-avatar-demo-glossy",
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
