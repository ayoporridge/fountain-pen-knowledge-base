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
  PHASE620_LABAN_325_ID,
  PHASE620_LABAN_325_SLUG,
  phase620LabanModelDedupPacks,
} from "./data/phase620-laban-model-dedup";

export type ApplyPhase620Options = ApplyPhase22Options;
export type ApplyPhase620Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(options: ApplyPhase620Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) {
      throw new Error(`Phase 620 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(
  client: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function authority(client: Client, options: ApplyPhase620Options): Promise<void> {
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
    throw new Error("Phase 620 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    (own.dev === real.dev && own.ino === real.ino) ||
    Number(own.nlink) !== 1
  ) {
    throw new Error("Phase 620 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 620 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 620 owned copy must be migrated through 032.");
  }
}

async function identity(client: Client, pack: LoadedCuratedEntityPack): Promise<void> {
  if (
    pack.entityId !== PHASE620_LABAN_325_ID ||
    pack.expectedType !== "pen" ||
    pack.expectedSlug !== PHASE620_LABAN_325_SLUG
  ) {
    throw new Error("Phase 620 Laban pack identity mismatch.");
  }
  const existing = await rows(
    client,
    "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?",
    [pack.entityId, pack.expectedSlug],
  );
  if (
    existing.length !== 1 ||
    existing[0]?.id !== pack.entityId ||
    existing[0]?.type !== "pen" ||
    existing[0]?.slug !== pack.expectedSlug
  ) {
    throw new Error(`Phase 620 Laban entity identity mismatch: ${JSON.stringify(existing)}`);
  }
  const brandId = pack.spec?.brandEntityId;
  if (!brandId) throw new Error("Phase 620 Laban pack has no canonical maker.");
  const maker = await rows(
    client,
    "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
    [pack.entityId],
  );
  if (maker.length !== 1 || maker[0]?.target_id !== brandId) {
    throw new Error("Phase 620 Laban model maker relation is missing or ambiguous.");
  }
}

async function alreadyApplied(client: Client, pack: LoadedCuratedEntityPack): Promise<boolean> {
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
  return Boolean(
    row &&
      String(row.source ?? "") === pack.sourceMarker &&
      String(row.status) === "published" &&
      Number(row.blocker_count) === 0 &&
      Number(row.publishable) === 1 &&
      Number(row.is_public) === 1,
  );
}

async function applyModel(
  client: Client,
  options: ApplyPhase620Options,
  pack: LoadedCuratedEntityPack,
): Promise<ApplyPhase620Result["entities"][number]> {
  validatePack(options.workspaceRoot, pack);
  if (await alreadyApplied(client, pack)) {
    return {
      entityId: pack.entityId,
      outcome: "noop",
      contentHash: await computePublicationContentHash(client, pack.entityId),
    };
  }
  const write = await client.transaction("write");
  try {
    const sourceItemIds = await upsertSources(write, uniqueSources([pack]));
    await insertPack(write, pack, sourceItemIds);
    await write.commit();
  } catch (error) {
    if (!write.closed) await write.rollback();
    throw error;
  }

  const publication = await client.transaction("write");
  try {
    const contentHash = await computePublicationContentHash(publication, pack.entityId);
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId: pack.entityId,
        reviewKind,
        contentHash,
        reviewer: options.reviewer,
        status: "approved",
        notes: `${pack.sourceMarker}; ${reviewKind} review of Laban 325 model-specific copy.`,
        transaction: publication,
      });
    }
    const published = await publishEntity(client, {
      entityId: pack.entityId,
      contentHash,
      reviewer: options.reviewer,
      transaction: publication,
    });
    await publication.commit();
    return { entityId: pack.entityId, outcome: "published", contentHash: published.contentHash };
  } catch (error) {
    if (!publication.closed) await publication.rollback();
    throw error;
  }
}

export async function applyPhase620LabanModelDedup(
  client: Client,
  options: ApplyPhase620Options,
): Promise<ApplyPhase620Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 620 reviewer must not be empty.");
  await authority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase620LabanModelDedupPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  if (packs.length !== 1) throw new Error("Phase 620 must load one Laban model pack.");
  const pack = packs[0];
  if (!pack) throw new Error("Phase 620 Laban model pack is missing after load.");
  await identity(client, pack);
  const result = { entities: [await applyModel(client, options, pack)] };
  await identity(client, pack);
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
      "Usage: tsx scripts/apply-phase620-laban-model-dedup.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase620LabanModelDedup(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase620-laban-model-dedup",
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
