import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import {
  insertPack,
  uniqueSources,
  upsertSources,
  validatePack,
} from "./apply-phase22-content";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import {
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";
import {
  PHASE519_WANCHER_BRAND_ID,
  phase519WancherDreamPenPacks,
} from "./data/phase519-wancher-dream-pen-new-products";

export const PHASE564_TARGET_ID = "phase519-wancher-zogan-swan-urushi-black";
export const PHASE564_REVIEWER = "phase564-wancher-zogan-swan-urushi-black";

export type ApplyPhase564Options = {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
};

export type ApplyPhase564Result = {
  entityId: string;
  outcome: "published" | "noop";
  contentHash: string;
};

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 564 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertAuthority(
  client: Client,
  options: ApplyPhase564Options,
): Promise<void> {
  rejectRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(root).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !inside(database, root)
  ) {
    throw new Error("Phase 564 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 564 refuses the protected catalog and hard-link aliases.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 564 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 564 owned copy must be migrated through 032.");
  }
}

async function assertIdentity(
  client: Client,
  pack: LoadedCuratedEntityPack,
): Promise<void> {
  const brand = await client.execute({
    sql: "SELECT id,type,slug,name FROM entities WHERE id=?",
    args: [PHASE519_WANCHER_BRAND_ID],
  });
  if (
    brand.rows.length !== 1 ||
    String(brand.rows[0]?.type) !== "brand" ||
    String(brand.rows[0]?.slug) !== "wancher" ||
    String(brand.rows[0]?.name) !== "Wancher"
  ) {
    throw new Error("Phase 564 Wancher brand identity is not the approved canonical row.");
  }
  const entity = await client.execute({
    sql: "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
    args: [pack.entityId, pack.expectedSlug],
  });
  if (
    entity.rows.length !== 1 ||
    String(entity.rows[0]?.id) !== pack.entityId ||
    String(entity.rows[0]?.type) !== pack.expectedType ||
    String(entity.rows[0]?.slug) !== pack.expectedSlug ||
    String(entity.rows[0]?.name) !== pack.canonicalName
  ) {
    throw new Error(`Phase 564 refuses an identity collision: ${pack.entityId}.`);
  }
}

async function prepareTopology(client: Client, pack: LoadedCuratedEntityPack): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    await transaction.execute({
      sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?",
      args: [pack.entityId, PHASE519_WANCHER_BRAND_ID],
    });
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
      args: [
        `phase564-made-by-${pack.entityId}`,
        pack.entityId,
        PHASE519_WANCHER_BRAND_ID,
        `Phase 564 verified Wancher maker relation for ${pack.canonicalName}`,
      ],
    });
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [
        `phase564-reverse-${pack.entityId}`,
        PHASE519_WANCHER_BRAND_ID,
        pack.entityId,
        `Phase 564 Wancher brand navigation to ${pack.canonicalName}`,
      ],
    });
    const maker = await transaction.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [pack.entityId],
    });
    if (
      maker.rows.length !== 1 ||
      String(maker.rows[0]?.target_id) !== PHASE519_WANCHER_BRAND_ID
    ) {
      throw new Error(`Phase 564 maker topology is ambiguous: ${pack.entityId}.`);
    }
    const reverse = await transaction.execute({
      sql: "SELECT id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
      args: [PHASE519_WANCHER_BRAND_ID, pack.entityId],
    });
    if (reverse.rows.length !== 1) {
      throw new Error(`Phase 564 reverse navigation is ambiguous: ${pack.entityId}.`);
    }
    const publication = await transaction.execute({
      sql: "SELECT status FROM entity_publications WHERE entity_id=?",
      args: [pack.entityId],
    });
    if (
      publication.rows.length !== 1 ||
      !["draft", "published"].includes(String(publication.rows[0]?.status))
    ) {
      throw new Error(`Phase 564 expects an existing publication row: ${pack.entityId}.`);
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

async function applySinglePack(
  client: Client,
  options: ApplyPhase564Options,
  pack: LoadedCuratedEntityPack,
): Promise<ApplyPhase564Result> {
  validatePack(options.workspaceRoot, pack);
  const current = await client.execute({
    sql: `SELECT entity.source, publication.status, readiness.blocker_count,
                 readiness.publishable, CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
          FROM entities entity
          JOIN entity_publications publication ON publication.entity_id=entity.id
          LEFT JOIN public_entity_readiness readiness
            ON readiness.entity_id=entity.id AND readiness.contract_version=3
          LEFT JOIN public_entities public ON public.id=entity.id
          WHERE entity.id=?`,
    args: [pack.entityId],
  });
  const row = current.rows[0];
  const alreadyPublished =
    row &&
    String(row.source ?? "") === pack.sourceMarker &&
    String(row.status) === "published" &&
    Number(row.blocker_count) === 0 &&
    Number(row.publishable) === 1 &&
    Number(row.is_public) === 1;
  if (alreadyPublished) {
    return {
      entityId: pack.entityId,
      outcome: "noop",
      contentHash: await computePublicationContentHash(client, pack.entityId),
    };
  }
  if ((pack.publicationIntent ?? "publish") !== "publish") {
    throw new Error(`Phase 564 only supports a publish-intent pack: ${pack.entityId}.`);
  }
  const transaction = await client.transaction("write");
  try {
    const sourceItemIds = await upsertSources(transaction, uniqueSources([pack]));
    await insertPack(transaction, pack, sourceItemIds);
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: pack.entityId,
      reviewKind,
      reviewer: options.reviewer,
      status: "approved",
      notes: `${pack.sourceMarker}; ${reviewKind} review of the deepened Wancher copy.`,
    });
  }
  const published = await publishEntity(client, {
    entityId: pack.entityId,
    reviewer: options.reviewer,
  });
  return {
    entityId: pack.entityId,
    outcome: "published",
    contentHash: published.contentHash,
  };
}

export async function applyPhase564WancherZoganSwanUrushiBlack(
  client: Client,
  options: ApplyPhase564Options,
): Promise<ApplyPhase564Result> {
  await assertAuthority(client, options);
  const rawPack = phase519WancherDreamPenPacks.find(
    (pack) => pack.entityId === PHASE564_TARGET_ID,
  );
  if (!rawPack) throw new Error("Phase 564 Zogan Swan Urushi Black pack is missing.");
  const pack = loadCuratedEntityPack(
    fs.realpathSync.native(options.workspaceRoot),
    rawPack,
  );
  await assertIdentity(client, pack);
  await prepareTopology(client, pack);
  const result = await applySinglePack(client, options, pack);
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
      "Usage: tsx scripts/apply-phase564-wancher-zogan-swan-urushi-black.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase564WancherZoganSwanUrushiBlack(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? PHASE564_REVIEWER,
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: "",
      },
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
