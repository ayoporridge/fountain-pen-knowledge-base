import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { computePublicationContentHash, publishEntity, recordEntityContentReview } from "../src/lib/publication";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import {
  PHASE308_LEGACY_9064_ID,
  PHASE308_LEGACY_9064_SLUG,
  PHASE308_SHEAFFER_ID,
  phase308SheafferLegacy9064Packs,
} from "./data/phase308-sheaffer-legacy-9064";

export type ApplyPhase308Options = ApplyPhase22Options;
export type ApplyPhase308Result = ApplyPhase22Result;

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemote(options: ApplyPhase308Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) {
      throw new Error(`Phase 308 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function authority(client: Client, options: ApplyPhase308Options): Promise<void> {
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
    throw new Error("Phase 308 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (database === protectedPath || (own.dev === real.dev && own.ino === real.ino)) {
    throw new Error("Phase 308 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 308 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 308 owned copy must be migrated through 032.");
  }
}

async function identity(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const brand = await rows(client, "SELECT id,type,slug FROM entities WHERE id=?", [PHASE308_SHEAFFER_ID]);
  if (brand.length !== 1 || brand[0]?.type !== "brand" || brand[0]?.slug !== "sheaffer") {
    throw new Error(`Phase 308 Sheaffer brand identity mismatch: ${JSON.stringify(brand)}`);
  }
  const pack = packs.find((item) => item.entityId === PHASE308_LEGACY_9064_ID);
  if (!pack) throw new Error("Phase 308 Legacy 9064 pack missing.");
  const existing = await rows(client, "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=?", [PHASE308_LEGACY_9064_ID, PHASE308_LEGACY_9064_SLUG]);
  if (
    existing.length > 1 ||
    (existing.length === 1 &&
      (existing[0]?.id !== PHASE308_LEGACY_9064_ID ||
        existing[0]?.type !== pack.expectedType ||
        existing[0]?.slug !== pack.expectedSlug ||
        existing[0]?.name !== pack.canonicalName))
  ) {
    throw new Error(`Phase 308 Legacy 9064 identity collision: ${JSON.stringify(existing)}`);
  }
}

async function topology(client: Client): Promise<void> {
  const tx: Transaction = await client.transaction("write");
  try {
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)",
      args: [PHASE308_LEGACY_9064_ID, PHASE308_LEGACY_9064_SLUG, "Sheaffer Legacy 9064"],
    });
    const links = await tx.execute({
      sql: "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? AND target_id=?) OR (source_id=? AND target_id=?)",
      args: [PHASE308_LEGACY_9064_ID, PHASE308_SHEAFFER_ID, PHASE308_SHEAFFER_ID, PHASE308_LEGACY_9064_ID],
    });
    const ready =
      links.rows.length === 2 &&
      links.rows.some(
        (row) =>
          String(row.source_id) === PHASE308_LEGACY_9064_ID &&
          String(row.target_id) === PHASE308_SHEAFFER_ID &&
          String(row.link_type) === "made_by",
      ) &&
      links.rows.some(
        (row) =>
          String(row.source_id) === PHASE308_SHEAFFER_ID &&
          String(row.target_id) === PHASE308_LEGACY_9064_ID &&
          String(row.link_type) === "reverse",
      );
    if (!ready) {
      await tx.execute({
        sql: "DELETE FROM entity_links WHERE source_id=? AND link_type IN ('made_by','reverse')",
        args: [PHASE308_LEGACY_9064_ID],
      });
      await tx.execute({
        sql: "DELETE FROM entity_links WHERE source_id=? AND target_id=? AND link_type IN ('made_by','reverse')",
        args: [PHASE308_SHEAFFER_ID, PHASE308_LEGACY_9064_ID],
      });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
        args: [
          "phase308-made-by-sheaffer-legacy-9064",
          PHASE308_LEGACY_9064_ID,
          PHASE308_SHEAFFER_ID,
          "Phase 308 sourced Sheaffer Legacy 9064 maker topology",
        ],
      });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
        args: [
          "phase308-reverse-sheaffer-legacy-9064",
          PHASE308_SHEAFFER_ID,
          PHASE308_LEGACY_9064_ID,
          "Phase 308 Sheaffer brand navigation to current Legacy 9064",
        ],
      });
    }
    const maker = await tx.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
      args: [PHASE308_LEGACY_9064_ID],
    });
    if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE308_SHEAFFER_ID) {
      throw new Error("Phase 308 Legacy 9064 maker topology is ambiguous.");
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

async function refreshSheafferBrand(client: Client, reviewer: string): Promise<void> {
  const contentHash = await computePublicationContentHash(client, PHASE308_SHEAFFER_ID);
  const current = await rows(
    client,
    "SELECT publication.status, publication.approved_content_hash, readiness.blocker_count FROM entity_publications publication JOIN public_entity_readiness readiness ON readiness.entity_id=publication.entity_id AND readiness.contract_version=3 WHERE publication.entity_id=?",
    [PHASE308_SHEAFFER_ID],
  );
  if (
    current.length === 1 &&
    String(current[0]?.status) === "published" &&
    String(current[0]?.approved_content_hash) === contentHash &&
    Number(current[0]?.blocker_count) === 0
  )
    return;
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE308_SHEAFFER_ID,
      reviewKind,
      reviewer,
      status: "approved",
      notes: `Phase 308 relation addition; ${reviewKind} review of the existing Sheaffer brand copy.`,
    });
  }
  await publishEntity(client, { entityId: PHASE308_SHEAFFER_ID, reviewer, contentHash });
}

export async function applyPhase308SheafferLegacy9064Content(
  client: Client,
  options: ApplyPhase308Options,
): Promise<ApplyPhase308Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 308 reviewer must not be empty.");
  await authority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const rawPacks = phase308SheafferLegacy9064Packs;
  const packs = rawPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  await identity(client, packs);
  await topology(client);
  const result = await applyCuratedContentPacks(client, options, rawPacks);
  await refreshSheafferBrand(client, options.reviewer);
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
      "Usage: tsx scripts/apply-phase308-sheaffer-legacy-9064-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase308SheafferLegacy9064Content(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase308-sheaffer-legacy-9064",
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
