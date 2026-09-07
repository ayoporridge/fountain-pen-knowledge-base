import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, type Transaction, createClient } from "@libsql/client";
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
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";
import {
  PHASE619_BRAND_IDS,
  phase619BrandModelDedupPacks,
} from "./data/phase619-brand-model-dedup";

export type ApplyPhase619Options = ApplyPhase22Options;
export type ApplyPhase619Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(options: ApplyPhase619Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) {
      throw new Error(`Phase 619 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function authority(client: Client, options: ApplyPhase619Options): Promise<void> {
  assertNoRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !inside(database, ownedRoot)
  ) {
    throw new Error("Phase 619 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    (own.dev === real.dev && own.ino === real.ino) ||
    Number(own.nlink) !== 1
  ) {
    throw new Error("Phase 619 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 619 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 619 owned copy must be migrated through 032.");
  }
}

async function rows(
  client: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function identity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  if (
    packs.length !== 6 ||
    new Set(packs.map((pack) => pack.entityId)).size !== 6 ||
    packs.some((pack) => pack.expectedType !== "brand")
  ) {
    throw new Error("Phase 619 must load six unique brand packs.");
  }
  for (const [slug, id] of Object.entries(PHASE619_BRAND_IDS)) {
    const pack = packs.find((candidate) => candidate.entityId === id);
    if (!pack || pack.expectedSlug !== slug || pack.expectedType !== "brand") {
      throw new Error(`Phase 619 ${slug} pack identity mismatch.`);
    }
    const existing = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [id, slug]);
    if (
      existing.length !== 1 ||
      existing[0]?.id !== id ||
      existing[0]?.type !== "brand" ||
      existing[0]?.slug !== slug
    ) {
      throw new Error(`Phase 619 ${slug} entity identity mismatch: ${JSON.stringify(existing)}`);
    }
  }
}

async function assertNavigation(client: Client): Promise<void> {
  for (const [slug, brandId] of Object.entries(PHASE619_BRAND_IDS)) {
    const models = await rows(
      client,
      `
        SELECT e.id
        FROM entities e
        JOIN entity_publications publication
          ON publication.entity_id=e.id AND publication.status='published'
        JOIN entity_links maker
          ON maker.source_id=e.id AND maker.target_id=? AND maker.link_type='made_by'
        WHERE e.type='pen'
        ORDER BY e.id
      `,
      [brandId],
    );
    for (const model of models) {
      const reverse = await rows(
        client,
        "SELECT id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
        [brandId, String(model.id)],
      );
      if (reverse.length !== 1) {
        throw new Error(`Phase 619 ${slug} reverse navigation is ambiguous for ${String(model.id)}.`);
      }
    }
  }
}

async function alreadyApplied(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<boolean> {
  for (const pack of packs) {
    const current = await rows(
      client,
      `
        SELECT entity.source, publication.status, readiness.blocker_count,
               readiness.publishable,
               CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
        FROM entities entity
        JOIN entity_publications publication ON publication.entity_id=entity.id
        LEFT JOIN public_entity_readiness readiness
          ON readiness.entity_id=entity.id AND readiness.contract_version=3
        LEFT JOIN public_entities public ON public.id=entity.id
        WHERE entity.id=?
      `,
      [pack.entityId],
    );
    const row = current[0];
    if (
      !row ||
      String(row.source ?? "") !== pack.sourceMarker ||
      String(row.status) !== "published" ||
      Number(row.blocker_count) !== 0 ||
      Number(row.publishable) !== 1 ||
      Number(row.is_public) !== 1
    ) {
      return false;
    }
  }
  return true;
}

async function applyBrands(
  client: Client,
  options: ApplyPhase619Options,
  packs: LoadedCuratedEntityPack[],
): Promise<ApplyPhase619Result> {
  for (const pack of packs) validatePack(options.workspaceRoot, pack);
  if (await alreadyApplied(client, packs)) {
    return {
      entities: await Promise.all(
        packs.map(async (pack) => ({
          entityId: pack.entityId,
          outcome: "noop" as const,
          contentHash: await computePublicationContentHash(client, pack.entityId),
        })),
      ),
    };
  }

  const write = await client.transaction("write");
  try {
    const sourceItemIds = await upsertSources(write, uniqueSources(packs));
    for (const pack of packs) await insertPack(write, pack, sourceItemIds);
    await write.commit();
  } catch (error) {
    if (!write.closed) await write.rollback();
    throw error;
  }

  const publication = await client.transaction("write");
  const entities: ApplyPhase619Result["entities"] = [];
  try {
    for (const pack of packs) {
      const contentHash = await computePublicationContentHash(publication, pack.entityId);
      for (const reviewKind of ["fact", "language", "media"] as const) {
        await recordEntityContentReview(client, {
          entityId: pack.entityId,
          reviewKind,
          contentHash,
          reviewer: options.reviewer,
          status: "approved",
          notes: `${pack.sourceMarker}; ${reviewKind} review of phase619 brand-only copy.`,
          transaction: publication,
        });
      }
      const published = await publishEntity(client, {
        entityId: pack.entityId,
        contentHash,
        reviewer: options.reviewer,
        transaction: publication,
      });
      entities.push({ entityId: pack.entityId, outcome: "published", contentHash: published.contentHash });
    }
    await publication.commit();
  } catch (error) {
    if (!publication.closed) await publication.rollback();
    throw error;
  }
  return { entities };
}

export async function applyPhase619BrandModelDedup(
  client: Client,
  options: ApplyPhase619Options,
): Promise<ApplyPhase619Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 619 reviewer must not be empty.");
  await authority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase619BrandModelDedupPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await identity(client, packs);
  await assertNavigation(client);
  const result = await applyBrands(client, options, packs);
  await assertNavigation(client);
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
    throw new Error("Usage: tsx scripts/apply-phase619-brand-model-dedup.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase619BrandModelDedup(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase619-brand-model-dedup",
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
