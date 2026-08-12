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
  PHASE605_BRANDS,
  PHASE605_MODELS,
  phase605FinalCoveragePacks,
  phase605Groups,
} from "./data/phase605-final-coverage-freeze";
import {
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export { PHASE605_BRANDS, PHASE605_MODELS } from "./data/phase605-final-coverage-freeze";
export type ApplyPhase605Options = ApplyPhase22Options;
export type ApplyPhase605Result = ApplyPhase22Result;

const TARGETS = phase605Groups.flatMap(({ brand, pens }) => [brand, ...pens]);

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
      throw new Error(`Phase 605 refuses inherited remote database selection: ${key}.`);
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
  options: ApplyPhase605Options,
): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 605 reviewer must not be empty.");
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
      "Phase 605 requires a non-symlink catalog file inside the caller-owned root.",
    );
  }
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (owned.nlink !== BigInt(1)) {
    throw new Error("Phase 605 refuses catalog files with more than one hard link.");
  }
  if (
    databasePath === protectedPath ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error("Phase 605 refuses the protected catalog or a hard-link alias.");
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 605 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 605 owned copy must be migrated through 032.");
  }
  return workspaceRoot;
}

function loadAndValidatePackSet(workspaceRoot: string): LoadedCuratedEntityPack[] {
  const packs = phase605FinalCoveragePacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  if (
    packs.length !== 10 ||
    packs.filter((pack) => pack.expectedType === "brand").length !== 5 ||
    packs.filter((pack) => pack.expectedType === "pen").length !== 5
  ) {
    throw new Error("Phase 605 requires the exact five-brand/five-model freeze set.");
  }
  const claimed = new Map<string, string>();
  for (const pack of packs) {
    for (const value of [pack.canonicalName, ...pack.aliases.map(({ alias }) => alias)]) {
      const normalized = value.trim().toLocaleLowerCase("en");
      const existing = claimed.get(normalized);
      if (existing && existing !== pack.entityId) {
        throw new Error(`Phase 605 pack-set name or alias collision: ${value}.`);
      }
      claimed.set(normalized, pack.entityId);
    }
  }
  return packs;
}

async function assertIdentityPreflight(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  for (const pack of packs) {
    const direct = await rows(
      client,
      "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? OR lower(name)=lower(?) ORDER BY id",
      [pack.entityId, pack.expectedSlug, pack.canonicalName],
    );
    if (
      direct.length > 1 ||
      (direct.length === 1 &&
        (direct[0]?.id !== pack.entityId ||
          direct[0]?.type !== pack.expectedType ||
          direct[0]?.slug !== pack.expectedSlug ||
          direct[0]?.name !== pack.canonicalName))
    ) {
      throw new Error(
        `Phase 605 refuses identity collision: ${pack.expectedSlug}: ${JSON.stringify(direct)}.`,
      );
    }
    for (const alias of pack.aliases) {
      const collisions = await rows(
        client,
        `SELECT id,'entity' AS surface FROM entities WHERE lower(name)=lower(?) AND id<>?
         UNION ALL
         SELECT entity_id AS id,'alias' AS surface FROM entity_aliases
         WHERE lower(alias)=lower(?) AND entity_id<>?`,
        [alias.alias, pack.entityId, alias.alias, pack.entityId],
      );
      if (collisions.length > 0) {
        throw new Error(
          `Phase 605 alias collision for ${alias.alias}: ${JSON.stringify(collisions)}.`,
        );
      }
    }
  }
}

async function prepareIdentitiesAndTopology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    for (const pack of TARGETS) {
      const existing = await rows(
        transaction,
        "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
        [pack.entityId, pack.expectedSlug],
      );
      if (existing.length === 0) {
        await transaction.execute({
          sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,?,?,?)",
          args: [pack.entityId, pack.expectedType, pack.expectedSlug, pack.canonicalName],
        });
      } else if (
        existing.length !== 1 ||
        existing[0]?.id !== pack.entityId ||
        existing[0]?.type !== pack.expectedType ||
        existing[0]?.slug !== pack.expectedSlug ||
        existing[0]?.name !== pack.canonicalName
      ) {
        throw new Error(`Phase 605 refuses a conflicting identity: ${pack.expectedSlug}.`);
      }
    }

    for (const { brand, pens } of phase605Groups) {
      for (const pen of pens) {
        const maker = await rows(
          transaction,
          "SELECT id,target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
          [pen.entityId],
        );
        if (maker.length === 0) {
          await transaction.execute({
            sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
            args: [
              stableId("phase605-made-by", pen.entityId),
              pen.entityId,
              brand.entityId,
              "Phase 605 final coverage freeze verified maker relation",
            ],
          });
        } else if (maker.length !== 1 || maker[0]?.target_id !== brand.entityId) {
          throw new Error(`Phase 605 maker topology is ambiguous: ${pen.entityId}.`);
        }
        const reverse = await rows(
          transaction,
          "SELECT id,source_id FROM entity_links WHERE target_id=? AND link_type='reverse'",
          [pen.entityId],
        );
        if (reverse.length === 0) {
          await transaction.execute({
            sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
            args: [
              stableId("phase605-reverse", pen.entityId),
              brand.entityId,
              pen.entityId,
              "Phase 605 brand public representative-model navigation",
            ],
          });
        } else if (reverse.length !== 1 || reverse[0]?.source_id !== brand.entityId) {
          throw new Error(`Phase 605 reverse topology is ambiguous: ${pen.entityId}.`);
        }
      }
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
        `Phase 605 terminal publication mismatch: ${pack.entityId}: ${JSON.stringify(state)}.`,
      );
    }
    const reviews = await rows(
      client,
      `SELECT review_kind FROM entity_content_reviews
       WHERE entity_id=?
         AND content_hash=(SELECT approved_content_hash FROM entity_publications WHERE entity_id=?)
         AND status='approved' ORDER BY review_kind`,
      [pack.entityId, pack.entityId],
    );
    if (
      reviews.map((row) => String(row.review_kind)).join(",") !==
      "fact,language,media,publication"
    ) {
      throw new Error(`Phase 605 review gate mismatch: ${pack.entityId}.`);
    }
  }

  for (const { brand, pens } of phase605Groups) {
    for (const pen of pens) {
      const maker = await rows(
        client,
        "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
        [pen.entityId],
      );
      const reverse = await rows(
        client,
        "SELECT source_id FROM entity_links WHERE target_id=? AND link_type='reverse'",
        [pen.entityId],
      );
      if (
        maker.length !== 1 ||
        maker[0]?.target_id !== brand.entityId ||
        reverse.length !== 1 ||
        reverse[0]?.source_id !== brand.entityId
      ) {
        throw new Error(`Phase 605 terminal topology mismatch: ${pen.entityId}.`);
      }
    }
  }
}

export async function applyPhase605FinalCoverageFreezeContent(
  client: Client,
  options: ApplyPhase605Options,
): Promise<ApplyPhase605Result> {
  const workspaceRoot = await assertOwnedCatalog(client, options);
  const packs = loadAndValidatePackSet(workspaceRoot);
  await assertIdentityPreflight(client, packs);
  await prepareIdentitiesAndTopology(client);
  const entities: ApplyPhase605Result["entities"] = [];
  for (const { brand, pens } of phase605Groups) {
    const result = await applyCuratedContentPacks(
      client,
      options,
      structuredClone([brand, ...pens]),
    );
    entities.push(...result.entities);
  }
  await assertTerminalState(client, packs);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities };
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
      "Usage: tsx scripts/apply-phase605-final-coverage-freeze-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const databasePath = path.resolve(database);
  const protectedCatalogPath = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${databasePath}` });
  try {
    const result = await applyPhase605FinalCoverageFreezeContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase605-final-coverage-freeze",
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
