import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
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
  loadCuratedEntityPack,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import {
  PHASE442_BRAND_IDS,
  phase442BrandDepthRefreshPacks,
} from "./data/phase442-brand-depth-refresh";

export type ApplyPhase442Options = ApplyPhase22Options;
export type ApplyPhase442Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(options: ApplyPhase442Options): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (options.env?.[key]?.trim()) {
      throw new Error(`Phase 442 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(
  client: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({
    ...row,
  }));
}

async function authority(
  client: Client,
  options: ApplyPhase442Options,
): Promise<void> {
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
    throw new Error("Phase 442 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    (own.dev === real.dev && own.ino === real.ino) ||
    Number(own.nlink) !== 1
  ) {
    throw new Error("Phase 442 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 442 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 442 owned copy must be migrated through 032.");
  }
}

async function identity(
  client: Client,
  packs: LoadedCuratedEntityPack[],
): Promise<void> {
  if (packs.length !== 5 || new Set(packs.map((pack) => pack.entityId)).size !== 5) {
    throw new Error("Phase 442 must load five unique brand packs.");
  }
  for (const [label, id] of Object.entries(PHASE442_BRAND_IDS)) {
    const pack = packs.find((candidate) => candidate.entityId === id);
    if (!pack || pack.expectedType !== "brand" || pack.expectedSlug !== label) {
      throw new Error(`Phase 442 ${label} pack identity mismatch.`);
    }
    const existing = await rows(
      client,
      "SELECT id,type,slug FROM entities WHERE id=? OR slug=?",
      [id, pack.expectedSlug],
    );
    if (
      existing.length !== 1 ||
      existing[0]?.id !== id ||
      existing[0]?.type !== "brand" ||
      existing[0]?.slug !== pack.expectedSlug
    ) {
      throw new Error(`Phase 442 ${label} brand identity mismatch: ${JSON.stringify(existing)}`);
    }
  }
}

async function repairBrandNavigation(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    for (const [label, brandId] of Object.entries(PHASE442_BRAND_IDS)) {
      const models = await tx.execute({
        sql: `
          SELECT e.id
          FROM entities e
          JOIN entity_publications publication
            ON publication.entity_id=e.id AND publication.status='published'
          JOIN entity_links maker
            ON maker.source_id=e.id AND maker.target_id=? AND maker.link_type='made_by'
          WHERE e.type='pen'
          ORDER BY e.id
        `,
        args: [brandId],
      });
      for (const row of models.rows) {
        const modelId = String(row.id);
        await tx.execute({
          sql: "INSERT OR IGNORE INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?,?,?,'reverse',?)",
          args: [
            `phase442-reverse-${label}-${modelId}`,
            brandId,
            modelId,
            `Phase 442 ${label} brand navigation for published pen ${modelId}`,
          ],
        });
        const reverse = await tx.execute({
          sql: "SELECT count(*) AS n FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
          args: [brandId, modelId],
        });
        if (Number(reverse.rows[0]?.n) !== 1) {
          throw new Error(`Phase 442 ${label} reverse navigation is ambiguous for ${modelId}.`);
        }
      }
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

async function applyBrandPacks(
  client: Client,
  options: ApplyPhase442Options,
  packs: LoadedCuratedEntityPack[],
): Promise<ApplyPhase442Result> {
  for (const pack of packs) validatePack(options.workspaceRoot, pack);
  const current = await client.execute({
    sql: `
      SELECT entity.id, entity.source, publication.status, readiness.blocker_count,
             readiness.publishable,
             CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
      FROM entities entity
      JOIN entity_publications publication ON publication.entity_id=entity.id
      LEFT JOIN public_entity_readiness readiness
        ON readiness.entity_id=entity.id AND readiness.contract_version=3
      LEFT JOIN public_entities public ON public.id=entity.id
      WHERE entity.id IN (${packs.map(() => "?").join(",")})
    `,
    args: packs.map((pack) => pack.entityId),
  });
  const currentById = new Map(
    current.rows.map((row) => [String(row.id), row]),
  );
  const allApplied = packs.every((pack) => {
    const row = currentById.get(pack.entityId);
    return (
      row &&
      String(row.source ?? "") === pack.sourceMarker &&
      String(row.status) === "published" &&
      Number(row.blocker_count) === 0 &&
      Number(row.publishable) === 1 &&
      Number(row.is_public) === 1
    );
  });
  if (allApplied) {
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
  const transaction = await client.transaction("write");
  try {
    const sourceItemIds = await upsertSources(transaction, uniqueSources(packs));
    for (const pack of packs) await insertPack(transaction, pack, sourceItemIds);
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
  const entities: ApplyPhase442Result["entities"] = [];
  for (const pack of packs) {
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId: pack.entityId,
        reviewKind,
        reviewer: options.reviewer,
        status: "approved",
        notes: `${pack.sourceMarker}; ${reviewKind} review of checked-in brand copy.`,
      });
    }
    const published = await publishEntity(client, {
      entityId: pack.entityId,
      reviewer: options.reviewer,
    });
    entities.push({
      entityId: pack.entityId,
      outcome: "published",
      contentHash: published.contentHash,
    });
  }
  return { entities };
}

export async function applyPhase442BrandDepthRefresh(
  client: Client,
  options: ApplyPhase442Options,
): Promise<ApplyPhase442Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 442 reviewer must not be empty.");
  await authority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = phase442BrandDepthRefreshPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  await identity(client, packs);
  await repairBrandNavigation(client);
  const result = await applyBrandPacks(client, options, packs);
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
      "Usage: tsx scripts/apply-phase442-brand-depth-refresh.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase442BrandDepthRefresh(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase442-brand-depth-refresh",
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
