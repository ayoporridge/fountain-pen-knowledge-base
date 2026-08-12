import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, createClient } from "@libsql/client";
import {
  type ApplyPhase504Options,
  applyPhase504RetiredPelikanM800Identity,
} from "./apply-phase504-retired-pelikan-m800-identity";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";

const AURORA_DONOR_ID = "G9ptvLpfyzNQ";
const AURORA_DONOR_SLUG = "奥罗拉-aurora";
const AURORA_BRAND_ID = "CJXe8UpnkHLJ";
const AURORA_BRAND_SLUG = "aurora";
const AURORA_SOURCE_PATH = `/pen/${AURORA_DONOR_SLUG}`;
const SOURCE_KEY = "phase601-retired-aurora-placeholder-to-brand-v1";

export type ApplyPhase601Options = ApplyPhase504Options;

export interface ApplyPhase601Result {
  outcome: "applied" | "noop";
  pelikanM800: Awaited<ReturnType<typeof applyPhase504RetiredPelikanM800Identity>>;
  aurora: {
    outcome: "applied" | "noop";
    sourceId: string;
    targetId: string;
    sourcePath: string;
    targetPath: null;
  };
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableId(prefix: string, value: string): string {
  return `${prefix}-${digest(value).slice(0, 24)}`;
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 601 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertAuthority(client: Client, options: ApplyPhase601Options): Promise<void> {
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
    throw new Error("Phase 601 requires an owned, non-symlink catalog copy.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 601 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 601 client is not bound to the owned copy.");
  }
}

async function closeAuroraPlaceholder(
  client: Client,
  options: ApplyPhase601Options,
): Promise<ApplyPhase601Result["aurora"]> {
  await assertAuthority(client, options);
  const tx = await client.transaction("write");
  try {
    const entities = await tx.execute({
      sql: "SELECT id,type,slug FROM entities WHERE id IN (?,?)",
      args: [AURORA_DONOR_ID, AURORA_BRAND_ID],
    });
    const donor = entities.rows.find((row) => String(row.id) === AURORA_DONOR_ID);
    const brand = entities.rows.find((row) => String(row.id) === AURORA_BRAND_ID);
    if (
      entities.rows.length !== 2 ||
      String(donor?.type) !== "pen" ||
      String(donor?.slug) !== AURORA_DONOR_SLUG ||
      String(brand?.type) !== "brand" ||
      String(brand?.slug) !== AURORA_BRAND_SLUG
    ) {
      throw new Error("Phase 601 Aurora placeholder identities do not match the approved mapping.");
    }
    const publications = await tx.execute({
      sql: "SELECT entity_id,status,blockers_json FROM entity_publications WHERE entity_id IN (?,?)",
      args: [AURORA_DONOR_ID, AURORA_BRAND_ID],
    });
    const donorPublication = publications.rows.find(
      (row) => String(row.entity_id) === AURORA_DONOR_ID,
    );
    const brandPublication = publications.rows.find(
      (row) => String(row.entity_id) === AURORA_BRAND_ID,
    );
    if (
      String(donorPublication?.status) !== "retired" ||
      String(donorPublication?.blockers_json) !== '["entity_type_placeholder"]' ||
      String(brandPublication?.status) !== "published"
    ) {
      throw new Error("Phase 601 Aurora publication boundary is not the reviewed placeholder mapping.");
    }

    const batchId = stableId("phase601-batch", SOURCE_KEY);
    const actionId = stableId("phase601-action", SOURCE_KEY);
    const note =
      "Retired Aurora pen placeholder points to the published Aurora brand; it is not an Aurora 88 or Optima model alias.";
    await tx.execute({
      sql: `INSERT OR IGNORE INTO taxonomy_batches
        (id,source_key,source_checksum,status,note) VALUES (?,?,?,'applied',?)`,
      args: [batchId, SOURCE_KEY, digest(SOURCE_KEY), note],
    });
    await tx.execute({
      sql: `INSERT OR IGNORE INTO taxonomy_actions
        (id,batch_id,source_row_key,action_kind,action_checksum,
         source_entity_id,target_entity_id,status,note)
        VALUES (?,?,?,'retire',?,?,?,'applied',?)`,
      args: [
        actionId,
        batchId,
        SOURCE_KEY,
        digest(`${SOURCE_KEY}\0${AURORA_DONOR_ID}\0${AURORA_BRAND_ID}`),
        AURORA_DONOR_ID,
        AURORA_BRAND_ID,
        note,
      ],
    });

    let changed = false;
    const lineage = await tx.execute({
      sql: "SELECT target_entity_id,lineage_kind FROM entity_lineage WHERE source_entity_id=?",
      args: [AURORA_DONOR_ID],
    });
    if (lineage.rows.length > 1) {
      throw new Error("Phase 601 found multiple Aurora placeholder lineages.");
    }
    if (lineage.rows.length === 1) {
      const row = lineage.rows[0];
      if (
        String(row?.target_entity_id) !== AURORA_BRAND_ID ||
        String(row?.lineage_kind) !== "retire"
      ) {
        throw new Error("Phase 601 found a conflicting Aurora placeholder lineage.");
      }
    } else {
      await tx.execute({
        sql: `INSERT INTO entity_lineage
          (id,batch_id,action_id,source_entity_id,target_entity_id,lineage_kind,fallback_reason)
          VALUES (?,?,?,?,?,'retire','entity_type_placeholder')`,
        args: [
          stableId("phase601-lineage", SOURCE_KEY),
          batchId,
          actionId,
          AURORA_DONOR_ID,
          AURORA_BRAND_ID,
        ],
      });
      changed = true;
    }

    const redirect = await tx.execute({
      sql: "SELECT target_path,redirect_kind,fallback_reason FROM entity_redirects WHERE source_path=?",
      args: [AURORA_SOURCE_PATH],
    });
    if (
      redirect.rows.length !== 1 ||
      redirect.rows[0]?.target_path !== null ||
      String(redirect.rows[0]?.redirect_kind) !== "hard_404" ||
      String(redirect.rows[0]?.fallback_reason) !== "brand_generic_placeholder_retired"
    ) {
      throw new Error("Phase 601 Aurora placeholder must preserve the reviewed hard-404 route.");
    }
    await tx.commit();
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return {
      outcome: changed ? "applied" : "noop",
      sourceId: AURORA_DONOR_ID,
      targetId: AURORA_BRAND_ID,
      sourcePath: AURORA_SOURCE_PATH,
      targetPath: null,
    };
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase601RetiredBacklogClosure(
  client: Client,
  options: ApplyPhase601Options,
): Promise<ApplyPhase601Result> {
  await assertAuthority(client, options);
  const pelikanM800 = await applyPhase504RetiredPelikanM800Identity(client, options);
  const aurora = await closeAuroraPlaceholder(client, options);
  return {
    outcome:
      pelikanM800.outcome === "applied" || aurora.outcome === "applied"
        ? "applied"
        : "noop",
    pelikanM800,
    aurora,
  };
}

function value(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error(
      "Usage: tsx scripts/apply-phase601-retired-backlog-closure.ts --database <owned-copy> --owned-root <root> --protected-catalog <data/fpkg.db>",
    );
  }
  const protectedSnapshot: CatalogSnapshot = snapshotCatalogFiles(protectedCatalog);
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase601RetiredBacklogClosure(client, {
      databasePath: path.resolve(database),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalog),
      protectedCatalogSnapshot: protectedSnapshot,
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
