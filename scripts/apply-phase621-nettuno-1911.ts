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
  validatePack,
} from "./apply-phase22-content";
import {
  PHASE621_NETTUNO_BRAND_ID,
  PHASE621_NETTUNO_PELAGOS_ID,
  phase621NettunoGroups,
  phase621NettunoPacks,
} from "./data/phase621-nettuno-1911";
import {
  loadCuratedEntityPack,
  type CuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export type ApplyPhase621Options = ApplyPhase22Options;
export type ApplyPhase621Result = ApplyPhase22Result;

const TARGETS = phase621NettunoGroups.flatMap(({ brand, pens }) => [
  brand,
  ...pens,
]);

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
      throw new Error(`Phase 621 refuses inherited remote database selection: ${key}.`);
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

async function assertOwnedCatalog(
  client: Client,
  options: ApplyPhase621Options,
): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) {
    throw new Error("Phase 621 reviewer must not be empty.");
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
      "Phase 621 requires a non-symlink catalog file inside the caller-owned root.",
    );
  }
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (owned.nlink !== BigInt(1)) {
    throw new Error("Phase 621 refuses catalog files with more than one hard link.");
  }
  if (
    databasePath === protectedPath ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error("Phase 621 refuses the protected catalog or a hard-link alias.");
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 621 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 621 owned copy must be migrated through 032.");
  }
  return workspaceRoot;
}

function loadAndValidatePackSet(workspaceRoot: string): LoadedCuratedEntityPack[] {
  if (
    phase621NettunoGroups.length !== 1 ||
    phase621NettunoGroups[0]?.brand.entityId !== PHASE621_NETTUNO_BRAND_ID ||
    phase621NettunoGroups[0]?.pens.length !== 1 ||
    phase621NettunoGroups[0]?.pens[0]?.entityId !== PHASE621_NETTUNO_PELAGOS_ID ||
    phase621NettunoPacks.length !== 2
  ) {
    throw new Error("Phase 621 requires exactly one Nettuno brand and one Pelagos model.");
  }
  const packs = phase621NettunoPacks.map((pack) => {
    const loaded = loadCuratedEntityPack(workspaceRoot, pack);
    validatePack(workspaceRoot, loaded);
    return loaded;
  });
  if (
    packs.filter((pack) => pack.expectedType === "brand").length !== 1 ||
    packs.filter((pack) => pack.expectedType === "pen").length !== 1
  ) {
    throw new Error("Phase 621 pack shape is not one brand plus one pen.");
  }
  return packs;
}

async function assertIdentityPreflight(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  const claimed = new Map<string, string>();
  for (const pack of packs) {
    const direct = await rows(
      client,
      "SELECT id,type,slug,name,source FROM entities WHERE id=? OR slug=? OR lower(name)=lower(?) ORDER BY id",
      [pack.entityId, pack.expectedSlug, pack.canonicalName],
    );
    if (direct.length > 1) {
      throw new Error(`Phase 621 identity collision: ${pack.expectedSlug}.`);
    }
    const existing = direct[0];
    if (existing) {
      if (
        existing.id !== pack.entityId ||
        existing.type !== pack.expectedType ||
        existing.slug !== pack.expectedSlug ||
        existing.name !== pack.canonicalName
      ) {
        throw new Error(`Phase 621 identity collision: ${pack.expectedSlug}.`);
      }
      const source = String(existing.source ?? "");
      if (
        source !== `phase621-prepared:${pack.key}` &&
        source !== pack.sourceMarker
      ) {
        throw new Error(`Phase 621 source ownership mismatch: ${pack.entityId}.`);
      }
    }
    for (const value of [pack.canonicalName, ...pack.aliases.map(({ alias }) => alias)]) {
      const normalized = value.trim().toLocaleLowerCase("en");
      const prior = claimed.get(normalized);
      if (prior && prior !== pack.entityId) {
        throw new Error(`Phase 621 pack surface collision: ${value}.`);
      }
      claimed.set(normalized, pack.entityId);
      const collisions = await rows(
        client,
        `SELECT id,'entity' AS surface FROM entities
         WHERE lower(name)=lower(?) AND id<>?
         UNION ALL
         SELECT entity_id AS id,'alias' AS surface FROM entity_aliases
         WHERE lower(alias)=lower(?) AND entity_id<>?`,
        [value, pack.entityId, value, pack.entityId],
      );
      if (collisions.length > 0) {
        throw new Error(`Phase 621 alias or name collision: ${value}.`);
      }
    }
  }
}

async function prepareIdentitiesAndTopology(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  const brand = packs.find((pack) => pack.expectedType === "brand");
  const pen = packs.find((pack) => pack.expectedType === "pen");
  if (!brand || !pen) throw new Error("Phase 621 identity set is incomplete.");
  const transaction = await client.transaction("write");
  try {
    for (const pack of [brand, pen]) {
      const existing = await rows(
        transaction,
        "SELECT id,type,slug,name,source FROM entities WHERE id=? OR slug=? ORDER BY id",
        [pack.entityId, pack.expectedSlug],
      );
      if (existing.length === 0) {
        await transaction.execute({
          sql: "INSERT INTO entities(id,type,slug,name,source) VALUES(?,?,?,?,?)",
          args: [
            pack.entityId,
            pack.expectedType,
            pack.expectedSlug,
            pack.canonicalName,
            `phase621-prepared:${pack.key}`,
          ],
        });
      } else if (
        existing.length !== 1 ||
        existing[0]?.id !== pack.entityId ||
        existing[0]?.type !== pack.expectedType ||
        existing[0]?.slug !== pack.expectedSlug ||
        existing[0]?.name !== pack.canonicalName
      ) {
        throw new Error(`Phase 621 conflicting identity: ${pack.expectedSlug}.`);
      }
    }

    let maker = await rows(
      transaction,
      "SELECT id,target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      [pen.entityId],
    );
    if (maker.length === 0) {
      await transaction.execute({
        sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
        args: [
          stableId("phase621-made-by", pen.entityId),
          pen.entityId,
          brand.entityId,
          "Phase 621 verified Nettuno 1911 canonical product-brand relation; Maiora production context remains scoped in content.",
        ],
      });
      maker = await rows(
        transaction,
        "SELECT id,target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
        [pen.entityId],
      );
    }
    if (maker.length !== 1 || maker[0]?.target_id !== brand.entityId) {
      throw new Error(`Phase 621 maker topology is ambiguous: ${pen.entityId}.`);
    }

    let reverse = await rows(
      transaction,
      "SELECT id,source_id FROM entity_links WHERE target_id=? AND link_type='reverse' ORDER BY id",
      [pen.entityId],
    );
    if (reverse.length === 0) {
      await transaction.execute({
        sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
        args: [
          stableId("phase621-reverse", pen.entityId),
          brand.entityId,
          pen.entityId,
          "Phase 621 Nettuno 1911 brand navigation to Pelagos Matte",
        ],
      });
      reverse = await rows(
        transaction,
        "SELECT id,source_id FROM entity_links WHERE target_id=? AND link_type='reverse' ORDER BY id",
        [pen.entityId],
      );
    }
    if (reverse.length !== 1 || reverse[0]?.source_id !== brand.entityId) {
      throw new Error(`Phase 621 reverse topology is ambiguous: ${pen.entityId}.`);
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

async function assertTerminalState(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  for (const pack of packs) {
    const state = await rows(
      client,
      `SELECT entity.type,entity.slug,entity.name,entity.source,publication.status,
              readiness.blocker_count,readiness.publishable,
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
      current?.type !== pack.expectedType ||
      current?.slug !== pack.expectedSlug ||
      current?.name !== pack.canonicalName ||
      current?.source !== pack.sourceMarker ||
      current?.status !== "published" ||
      Number(current?.blocker_count) !== 0 ||
      Number(current?.publishable) !== 1 ||
      Number(current?.is_public) !== 1
    ) {
      throw new Error(
        `Phase 621 terminal publication mismatch: ${pack.entityId}: ${JSON.stringify(state)}`,
      );
    }
    const reviews = await rows(
      client,
      "SELECT review_kind FROM entity_content_reviews WHERE entity_id=? AND content_hash=(SELECT approved_content_hash FROM entity_publications WHERE entity_id=?) AND status='approved' ORDER BY review_kind",
      [pack.entityId, pack.entityId],
    );
    if (
      reviews.map((row) => String(row.review_kind)).join(",") !==
      "fact,language,media,publication"
    ) {
      throw new Error(`Phase 621 review gate mismatch: ${pack.entityId}.`);
    }
    const media = await rows(
      client,
      "SELECT local_path,usage_status FROM media_assets WHERE entity_id=? ORDER BY id",
      [pack.entityId],
    );
    const primary = pack.media.find((item) => item.usageStatus === "primary");
    if (
      media.length !== 1 ||
      media[0]?.usage_status !== "primary" ||
      media[0]?.local_path !== primary?.localPath
    ) {
      throw new Error(`Phase 621 media mismatch: ${pack.entityId}.`);
    }
  }
  const maker = await rows(
    client,
    "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
    [PHASE621_NETTUNO_PELAGOS_ID],
  );
  const reverse = await rows(
    client,
    "SELECT source_id FROM entity_links WHERE target_id=? AND link_type='reverse'",
    [PHASE621_NETTUNO_PELAGOS_ID],
  );
  if (
    maker.length !== 1 ||
    maker[0]?.target_id !== PHASE621_NETTUNO_BRAND_ID ||
    reverse.length !== 1 ||
    reverse[0]?.source_id !== PHASE621_NETTUNO_BRAND_ID
  ) {
    throw new Error("Phase 621 terminal maker/reverse topology mismatch.");
  }
  const specs = await rows(
    client,
    "SELECT id FROM model_specs WHERE entity_id=? AND review_status='approved'",
    [PHASE621_NETTUNO_PELAGOS_ID],
  );
  if (specs.length !== 1) throw new Error("Phase 621 Pelagos spec row is missing.");
}

export async function applyPhase621Nettuno1911(
  client: Client,
  options: ApplyPhase621Options,
): Promise<ApplyPhase621Result> {
  const workspaceRoot = await assertOwnedCatalog(client, options);
  const packs = loadAndValidatePackSet(workspaceRoot);
  await assertIdentityPreflight(client, packs);
  await prepareIdentitiesAndTopology(client, packs);
  const result = await applyCuratedContentPacks(
    client,
    options,
    phase621NettunoPacks,
  );
  await assertTerminalState(client, packs);
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
      "Usage: tsx scripts/apply-phase621-nettuno-1911.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const databasePath = path.resolve(database);
  const protectedCatalogPath = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${databasePath}` });
  try {
    const result = await applyPhase621Nettuno1911(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase621-nettuno-1911",
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

