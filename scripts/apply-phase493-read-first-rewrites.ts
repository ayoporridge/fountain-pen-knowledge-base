import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import {
  curatedId,
  loadCuratedEntityPack,
  type CuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";
import {
  insertPack,
  uniqueSources,
  upsertSources,
  validatePack,
} from "./apply-phase22-content";
import {
  PHASE493_REWRITE_TARGETS,
  phase493ReadFirstRewritePacks,
} from "./data/phase493-read-first-rewrites";

export interface ApplyPhase493Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase493Result {
  entities: Array<{
    entityId: string;
    outcome: "published" | "noop";
    contentHash: string;
  }>;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 493 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertOwnedCatalog(
  client: Client,
  options: ApplyPhase493Options,
): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);

  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile()) {
    throw new Error("Phase 493 owned catalog authority is not a regular local copy.");
  }
  if (fs.lstatSync(options.databasePath).isSymbolicLink()) {
    throw new Error("Phase 493 owned catalog must not be a symlink.");
  }
  if (!isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 493 database must remain inside the caller-owned root.");
  }
  const ownedStat = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    (ownedStat.dev === protectedStat.dev && ownedStat.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 493 refuses the protected catalog and hard-link aliases.");
  }

  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  const clientPath = main?.file ? fs.realpathSync.native(String(main.file)) : null;
  if (clientPath !== databasePath) {
    throw new Error("Phase 493 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 493 owned copy must be migrated through 032 before apply.");
  }
}

function linkId(kind: string, value: string): string {
  return curatedId(`phase493-${kind}`, value);
}

async function loadPacks(workspaceRoot: string): Promise<LoadedCuratedEntityPack[]> {
  const root = fs.realpathSync.native(workspaceRoot);
  const packs = phase493ReadFirstRewritePacks.map((pack) =>
    loadCuratedEntityPack(root, pack),
  );
  for (const pack of packs) validatePack(root, pack);
  return packs;
}

async function assertTargetIdentity(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  for (const target of PHASE493_REWRITE_TARGETS) {
    const pack = packs.find((candidate) => candidate.entityId === target.entityId);
    if (!pack) throw new Error(`Phase 493 loaded pack missing: ${target.entityId}`);
    const entity = await client.execute({
      sql: "SELECT type, slug FROM entities WHERE id = ?",
      args: [target.entityId],
    });
    if (
      entity.rows.length !== 1 ||
      String(entity.rows[0]?.type) !== "pen" ||
      String(entity.rows[0]?.slug) !== target.slug
    ) {
      throw new Error(`Phase 493 canonical identity mismatch: ${target.entityId}`);
    }
    const brand = await client.execute({
      sql: "SELECT type FROM entities WHERE id = ?",
      args: [target.brandEntityId],
    });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand") {
      throw new Error(`Phase 493 maker identity mismatch: ${target.brandEntityId}`);
    }
    if (pack.spec?.brandEntityId !== target.brandEntityId) {
      throw new Error(`Phase 493 pack maker mismatch: ${target.entityId}`);
    }
  }
}

async function ensureTopology(
  transaction: Transaction,
  target: (typeof PHASE493_REWRITE_TARGETS)[number],
): Promise<void> {
  await transaction.execute({
    sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?",
    args: [target.entityId, target.brandEntityId],
  });
  await transaction.execute({
    sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)",
    args: [
      linkId("made-by", `${target.entityId}:${target.brandEntityId}`),
      target.entityId,
      target.brandEntityId,
      "Phase 493 verified maker relation",
    ],
  });
  const reverseId = linkId("reverse", `${target.brandEntityId}:${target.entityId}`);
  await transaction.execute({
    sql: "DELETE FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse' AND id <> ?",
    args: [target.brandEntityId, target.entityId, reverseId],
  });
  await transaction.execute({
    sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)",
    args: [
      reverseId,
      target.brandEntityId,
      target.entityId,
      "Phase 493 verified brand model navigation",
    ],
  });
  const maker = await transaction.execute({
    sql: "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
    args: [target.entityId, target.brandEntityId],
  });
  const makerTotal = await transaction.execute({
    sql: "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
    args: [target.entityId],
  });
  const reverse = await transaction.execute({
    sql: "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
    args: [target.brandEntityId, target.entityId],
  });
  if (
    Number(maker.rows[0]?.value) !== 1 ||
    Number(makerTotal.rows[0]?.value) !== 1 ||
    Number(reverse.rows[0]?.value) !== 1
  ) {
    throw new Error(`Phase 493 topology repair failed: ${target.entityId}`);
  }
}

async function contentIsCurrent(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<boolean> {
  for (const pack of packs) {
    const row = await client.execute({
      sql: `
        SELECT entity.source, publication.status, publication.blockers_json,
               publication.approved_content_hash,
               publication.reviewed_contract_version,
               publication.reviewed_content_revision,
               publication.content_revision,
               CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
        FROM entities entity
        JOIN entity_publications publication ON publication.entity_id = entity.id
        LEFT JOIN public_entities public ON public.id = entity.id
        WHERE entity.id = ?
      `,
      args: [pack.entityId],
    });
    const current = row.rows[0];
    if (
      !current ||
      String(current.source ?? "") !== pack.sourceMarker ||
      String(current.status) !== "published" ||
      String(current.blockers_json ?? "[]") !== "[]" ||
      !String(current.approved_content_hash ?? "").trim() ||
      Number(current.reviewed_contract_version) !== 3 ||
      Number(current.reviewed_content_revision) !== Number(current.content_revision) ||
      Number(current.is_public) !== 1
    ) {
      return false;
    }
  }
  return true;
}

async function topologyIsCurrent(
  client: Client,
): Promise<boolean> {
  for (const target of PHASE493_REWRITE_TARGETS) {
    const maker = await client.execute({
      sql: "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
      args: [target.entityId, target.brandEntityId],
    });
    const makerTotal = await client.execute({
      sql: "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
      args: [target.entityId],
    });
    const reverse = await client.execute({
      sql: "SELECT count(*) AS value FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
      args: [target.brandEntityId, target.entityId],
    });
    if (
      Number(maker.rows[0]?.value) !== 1 ||
      Number(makerTotal.rows[0]?.value) !== 1 ||
      Number(reverse.rows[0]?.value) !== 1
    ) {
      return false;
    }
  }
  return true;
}

async function currentPublicationHash(client: Client, entityId: string): Promise<string> {
  const result = await client.execute({
    sql: "SELECT approved_content_hash FROM entity_publications WHERE entity_id = ? AND status = 'published'",
    args: [entityId],
  });
  const hash = String(result.rows[0]?.approved_content_hash ?? "").trim();
  if (!hash) throw new Error(`Phase 493 published hash is missing: ${entityId}`);
  return hash;
}

export async function applyPhase493ReadFirstRewrites(
  client: Client,
  options: ApplyPhase493Options,
): Promise<ApplyPhase493Result> {
  await assertOwnedCatalog(client, options);
  if (!options.reviewer.trim()) throw new Error("Phase 493 reviewer must not be empty.");
  const packs = await loadPacks(options.workspaceRoot);
  await assertTargetIdentity(client, packs);

  if (await contentIsCurrent(client, packs)) {
    if (!(await topologyIsCurrent(client))) {
      const transaction = await client.transaction("write");
      try {
        for (const target of PHASE493_REWRITE_TARGETS) {
          await ensureTopology(transaction, target);
        }
        await transaction.commit();
      } catch (error) {
        if (!transaction.closed) await transaction.rollback();
        throw error;
      }
    }
    const entities = [];
    for (const pack of packs) {
      entities.push({
        entityId: pack.entityId,
        outcome: "noop" as const,
        contentHash: await currentPublicationHash(client, pack.entityId),
      });
    }
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return { entities };
  }

  const transaction = await client.transaction("write");
  try {
    const sourceItemIds = await upsertSources(transaction, uniqueSources(packs));
    for (const pack of packs) {
      await insertPack(transaction, pack, sourceItemIds);
    }
    for (const target of PHASE493_REWRITE_TARGETS) {
      await ensureTopology(transaction, target);
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }

  const entities: ApplyPhase493Result["entities"] = [];
  for (const pack of packs) {
    const contentHash = await computePublicationContentHash(client, pack.entityId);
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId: pack.entityId,
        reviewKind,
        reviewer: options.reviewer,
        status: "approved",
        contentHash,
        notes: `${pack.sourceMarker}; ${reviewKind} review of Phase 493 reader-facing rewrite.`,
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
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities };
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const workspaceRoot = process.cwd();
  const databasePath = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalogPath = cliValue("--protected-catalog");
  const reviewer = cliValue("--reviewer") ?? "phase493-read-first-rewrites";
  if (!databasePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error(
      "Usage: tsx scripts/apply-phase493-read-first-rewrites.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const protectedCatalogSnapshot = snapshotCatalogFiles(protectedCatalogPath);
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    const result = await applyPhase493ReadFirstRewrites(client, {
      workspaceRoot,
      reviewer,
      databasePath: path.resolve(databasePath),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalogPath),
      protectedCatalogSnapshot,
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
