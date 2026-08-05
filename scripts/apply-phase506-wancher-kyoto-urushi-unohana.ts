import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  insertPack,
  uniqueSources,
  upsertSources,
  validatePack,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
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
  PHASE506_KYOTO_URUSHI_UNOHANA_ID,
  PHASE506_KYOTO_URUSHI_UNOHANA_SLUG,
  PHASE506_WANCHER_BRAND_ID,
  phase506WancherKyotoUrushiUnohanaPacks,
} from "./data/phase506-wancher-kyoto-urushi-unohana";

export type ApplyPhase506Options = ApplyPhase22Options;
export type ApplyPhase506Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(options: ApplyPhase506Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) {
      throw new Error(`Phase 506 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertAuthority(client: Client, options: ApplyPhase506Options): Promise<void> {
  assertNoRemote(options);
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
    throw new Error("Phase 506 owned catalog authority check failed.");
  }
  const ownedStat = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    (ownedStat.dev === protectedStat.dev && ownedStat.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 506 refuses the protected catalog and hard-link aliases.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 506 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 506 owned copy must be migrated through 032.");
  }
}

async function assertIdentity(client: Client, pack: LoadedCuratedEntityPack): Promise<void> {
  const brand = await client.execute({
    sql: "SELECT type,slug FROM entities WHERE id = ?",
    args: [PHASE506_WANCHER_BRAND_ID],
  });
  if (
    brand.rows.length !== 1 ||
    String(brand.rows[0]?.type) !== "brand" ||
    String(brand.rows[0]?.slug) !== "wancher"
  ) {
    throw new Error("Phase 506 Wancher brand identity is not the approved canonical row.");
  }
  const entity = await client.execute({
    sql: "SELECT id,type,slug,name FROM entities WHERE id = ? OR slug = ?",
    args: [pack.entityId, pack.expectedSlug],
  });
  if (
    entity.rows.length !== 1 ||
    String(entity.rows[0]?.id) !== pack.entityId ||
    String(entity.rows[0]?.type) !== pack.expectedType ||
    String(entity.rows[0]?.slug) !== pack.expectedSlug ||
    String(entity.rows[0]?.name) !== pack.canonicalName
  ) {
    throw new Error(`Phase 506 Wancher Kyoto Urushi Unohana identity collision: ${pack.entityId}.`);
  }
}

async function prepareTopology(client: Client, pack: LoadedCuratedEntityPack): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    const existing = await transaction.execute({
      sql: "SELECT id,type,slug,name FROM entities WHERE id = ? OR slug = ?",
      args: [pack.entityId, pack.expectedSlug],
    });
    if (existing.rows.length === 0) {
      await transaction.execute({
        sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,?,?,?)",
        args: [pack.entityId, pack.expectedType, pack.expectedSlug, pack.canonicalName],
      });
    } else if (
      existing.rows.length !== 1 ||
      String(existing.rows[0]?.id) !== pack.entityId ||
      String(existing.rows[0]?.type) !== pack.expectedType ||
      String(existing.rows[0]?.slug) !== pack.expectedSlug ||
      String(existing.rows[0]?.name) !== pack.canonicalName
    ) {
      throw new Error("Phase 506 refuses a conflicting Wancher Kyoto Urushi Unohana identity.");
    }

    await transaction.execute({
      sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?",
      args: [PHASE506_KYOTO_URUSHI_UNOHANA_ID, PHASE506_WANCHER_BRAND_ID],
    });
    await transaction.execute({
      sql: `INSERT OR IGNORE INTO entity_links
        (id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)`,
      args: [
        "phase506-made-by-wancher-kyoto-urushi-unohana",
        PHASE506_KYOTO_URUSHI_UNOHANA_ID,
        PHASE506_WANCHER_BRAND_ID,
        "Phase 506 verified Wancher Kyoto Urushi Unohana maker relation",
      ],
    });
    await transaction.execute({
      sql: `INSERT OR IGNORE INTO entity_links
        (id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)`,
      args: [
        "phase506-reverse-wancher-kyoto-urushi-unohana",
        PHASE506_WANCHER_BRAND_ID,
        PHASE506_KYOTO_URUSHI_UNOHANA_ID,
        "Phase 506 Wancher brand navigation to Kyoto Urushi Unohana",
      ],
    });
    const maker = await transaction.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
      args: [PHASE506_KYOTO_URUSHI_UNOHANA_ID],
    });
    if (
      maker.rows.length !== 1 ||
      String(maker.rows[0]?.target_id) !== PHASE506_WANCHER_BRAND_ID
    ) {
      throw new Error("Phase 506 Wancher Kyoto Urushi Unohana maker topology is ambiguous.");
    }
    const publication = await transaction.execute({
      sql: "SELECT status FROM entity_publications WHERE entity_id = ?",
      args: [PHASE506_KYOTO_URUSHI_UNOHANA_ID],
    });
    if (
      publication.rows.length !== 1 ||
      !["draft", "published"].includes(String(publication.rows[0]?.status))
    ) {
      throw new Error("Phase 506 expects a draft or already-published publication row.");
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

async function refreshWancherBrandPublication(client: Client, reviewer: string): Promise<void> {
  const publication = await client.execute({
    sql: "SELECT status FROM entity_publications WHERE entity_id = ?",
    args: [PHASE506_WANCHER_BRAND_ID],
  });
  if (String(publication.rows[0]?.status) === "published") return;
  const contentHash = await computePublicationContentHash(client, PHASE506_WANCHER_BRAND_ID);
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE506_WANCHER_BRAND_ID,
      reviewKind,
      reviewer,
      status: "approved",
      notes: `Phase 506 ${reviewKind} review after adding the Wancher Kyoto Urushi Unohana reverse navigation.`,
      contentHash,
    });
  }
  await publishEntity(client, { entityId: PHASE506_WANCHER_BRAND_ID, reviewer });
}

async function applySinglePack(
  client: Client,
  options: ApplyPhase506Options,
  pack: LoadedCuratedEntityPack,
): Promise<ApplyPhase506Result> {
  validatePack(options.workspaceRoot, pack);
  const current = await client.execute({
    sql: `
      SELECT entity.source, publication.status,
             readiness.blocker_count, readiness.publishable,
             CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
      FROM entities entity
      JOIN entity_publications publication ON publication.entity_id = entity.id
      LEFT JOIN public_entity_readiness readiness
        ON readiness.entity_id = entity.id AND readiness.contract_version = 3
      LEFT JOIN public_entities public ON public.id = entity.id
      WHERE entity.id = ?
    `,
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
      entities: [
        {
          entityId: pack.entityId,
          outcome: "noop",
          contentHash: await computePublicationContentHash(client, pack.entityId),
        },
      ],
    };
  }
  if ((pack.publicationIntent ?? "publish") !== "publish") {
    throw new Error("Phase 506 only supports a publish-intent pack.");
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
      notes: `${pack.sourceMarker}; ${reviewKind} review of the checked-in Wancher Kyoto Urushi Unohana copy.`,
    });
  }
  const published = await publishEntity(client, { entityId: pack.entityId, reviewer: options.reviewer });
  return {
    entities: [{ entityId: pack.entityId, outcome: "published", contentHash: published.contentHash }],
  };
}

export async function applyPhase506WancherKyotoUrushiUnohana(
  client: Client,
  options: ApplyPhase506Options,
): Promise<ApplyPhase506Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 506 reviewer must not be empty.");
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const rawPack = phase506WancherKyotoUrushiUnohanaPacks[0];
  if (!rawPack) throw new Error("Phase 506 Wancher Kyoto Urushi Unohana pack is missing.");
  const pack = loadCuratedEntityPack(workspaceRoot, rawPack);
  await prepareTopology(client, pack);
  await assertIdentity(client, pack);
  await refreshWancherBrandPublication(client, options.reviewer);
  const result = await applySinglePack(client, options, pack);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error(
      "Usage: tsx scripts/apply-phase506-wancher-kyoto-urushi-unohana.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase506WancherKyotoUrushiUnohana(client, {
      workspaceRoot: process.cwd(),
      reviewer: cliValue("--reviewer") ?? "phase506-wancher-kyoto-urushi-unohana",
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
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
