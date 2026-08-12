import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, createClient } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";

const SOURCE_KEY = "phase602-retired-split-donor-brand-navigation-v1";
const NAVIGATIONS = [
  {
    donorId: "s0HAxT1gsHxh",
    donorSlug: "leonardo-furore-momento-magico",
    brandId: "g5r4udSOYhI5",
    brandSlug: "leonardo",
    outputs: ["ixul2gTcJ06B", "UE5otlwKUfp9"],
  },
  {
    donorId: "dTCUDu03vrI6",
    donorSlug: "opus-88-demo-kolora",
    brandId: "I6tjleAZx9RU",
    brandSlug: "opus88",
    outputs: ["CqFpmT3l4Mtm", "0CNmbxM54-GA"],
  },
] as const;
const SHEAFFER = {
  donorId: "qQbWP5zGOGSL",
  donorSlug: "sheaffer-s-craftsman",
  brandId: "tVXnzDSFCcPP",
  outputs: ["s56SHFCRBAL", "s56SHFCR33T", "s56SHFCRTDTIP"],
  fallback:
    "generic Craftsman identity was split; choose Balance, 33T lever or Tip-Dip canonical page",
} as const;

export interface ApplyPhase602Options {
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase602Result {
  outcome: "applied" | "noop";
  navigations: Array<{
    donorId: string;
    sourcePath: string;
    targetPath: string;
    outcome: "applied" | "noop";
  }>;
  sheaffer: "preserved_hard_404";
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableId(prefix: string, value: string): string {
  return `${prefix}-${digest(value).slice(0, 24)}`;
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 602 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertAuthority(client: Client, options: ApplyPhase602Options): Promise<void> {
  rejectRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const relative = path.relative(root, database);
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    relative === "" ||
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    database === protectedPath ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 602 requires an owned non-alias catalog copy.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 602 client is not bound to the owned copy.");
  }
}

async function assertSplit(
  client: Client,
  donorId: string,
  donorSlug: string,
  brandId: string,
  outputs: readonly string[],
): Promise<void> {
  const identities = await client.execute({
    sql: `SELECT e.id,e.type,e.slug,ep.status FROM entities e
      JOIN entity_publications ep ON ep.entity_id=e.id
      WHERE e.id IN (${[donorId, brandId, ...outputs].map(() => "?").join(",")})`,
    args: [donorId, brandId, ...outputs],
  });
  const donor = identities.rows.find((row) => String(row.id) === donorId);
  const brand = identities.rows.find((row) => String(row.id) === brandId);
  if (
    identities.rows.length !== outputs.length + 2 ||
    String(donor?.type) !== "pen" ||
    String(donor?.slug) !== donorSlug ||
    String(donor?.status) !== "retired" ||
    String(brand?.type) !== "brand" ||
    String(brand?.status) !== "published" ||
    outputs.some((id) =>
      identities.rows.every(
        (row) => String(row.id) !== id || String(row.type) !== "pen" || String(row.status) !== "published",
      ),
    )
  ) {
    throw new Error(`Phase 602 split identity mismatch: ${donorSlug}.`);
  }
  const lineage = await client.execute({
    sql: "SELECT target_entity_id FROM entity_lineage WHERE source_entity_id=? AND lineage_kind='split' ORDER BY target_entity_id",
    args: [donorId],
  });
  assertSet(
    lineage.rows.map((row) => String(row.target_entity_id)),
    outputs,
    `lineage ${donorSlug}`,
  );
  const reverse = await client.execute({
    sql: `SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse'
      AND target_id IN (${outputs.map(() => "?").join(",")}) ORDER BY target_id`,
    args: [brandId, ...outputs],
  });
  assertSet(
    reverse.rows.map((row) => String(row.target_id)),
    outputs,
    `brand navigation ${donorSlug}`,
  );
}

function assertSet(actual: string[], expected: readonly string[], label: string): void {
  if (JSON.stringify([...actual].sort()) !== JSON.stringify([...expected].sort())) {
    throw new Error(`Phase 602 ${label} does not cover the exact split outputs.`);
  }
}

export async function applyPhase602SplitDonorNavigation(
  client: Client,
  options: ApplyPhase602Options,
): Promise<ApplyPhase602Result> {
  await assertAuthority(client, options);
  for (const item of NAVIGATIONS) {
    await assertSplit(client, item.donorId, item.donorSlug, item.brandId, item.outputs);
  }
  await assertSplit(
    client,
    SHEAFFER.donorId,
    SHEAFFER.donorSlug,
    SHEAFFER.brandId,
    SHEAFFER.outputs,
  );
  const sheafferRoute = await client.execute({
    sql: "SELECT target_path,redirect_kind,fallback_reason FROM entity_redirects WHERE source_path=?",
    args: [`/pen/${SHEAFFER.donorSlug}`],
  });
  if (
    sheafferRoute.rows.length !== 1 ||
    sheafferRoute.rows[0]?.target_path !== null ||
    String(sheafferRoute.rows[0]?.redirect_kind) !== "hard_404" ||
    String(sheafferRoute.rows[0]?.fallback_reason) !== SHEAFFER.fallback
  ) {
    throw new Error("Phase 602 must preserve the reviewed Sheaffer Craftsman hard-404.");
  }

  const tx = await client.transaction("write");
  try {
    const batchId = stableId("phase602-batch", SOURCE_KEY);
    await tx.execute({
      sql: `INSERT OR IGNORE INTO taxonomy_batches
        (id,source_key,source_checksum,status,note)
        VALUES (?,?,?,'applied','Mixed split donors navigate through brand pages that link every canonical output.')`,
      args: [batchId, SOURCE_KEY, digest(SOURCE_KEY)],
    });
    const navigations: ApplyPhase602Result["navigations"] = [];
    for (const item of NAVIGATIONS) {
      const sourcePath = `/pen/${item.donorSlug}`;
      const targetPath = `/brand/${item.brandSlug}`;
      const existing = await tx.execute({
        sql: "SELECT target_path,redirect_kind,fallback_reason FROM entity_redirects WHERE source_path=?",
        args: [sourcePath],
      });
      if (existing.rows.length > 1) {
        throw new Error(`Phase 602 found duplicate redirects for ${sourcePath}.`);
      }
      if (existing.rows.length === 1) {
        if (
          String(existing.rows[0]?.target_path) !== targetPath ||
          String(existing.rows[0]?.redirect_kind) !== "permanent" ||
          String(existing.rows[0]?.fallback_reason) !== "mixed_identity_split_brand_navigation"
        ) {
          throw new Error(`Phase 602 found a conflicting redirect for ${sourcePath}.`);
        }
        navigations.push({ donorId: item.donorId, sourcePath, targetPath, outcome: "noop" });
        continue;
      }
      await tx.execute({
        sql: `INSERT INTO entity_redirects
          (id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason)
          VALUES (?,?,NULL,?,?,'permanent','mixed_identity_split_brand_navigation')`,
        args: [stableId("phase602-redirect", sourcePath), batchId, sourcePath, targetPath],
      });
      navigations.push({ donorId: item.donorId, sourcePath, targetPath, outcome: "applied" });
    }
    await tx.commit();
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return {
      outcome: navigations.some((item) => item.outcome === "applied") ? "applied" : "noop",
      navigations,
      sheaffer: "preserved_hard_404",
    };
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
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
    throw new Error("Phase 602 requires --database, --owned-root and --protected-catalog.");
  }
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase602SplitDonorNavigation(client, {
      databasePath: path.resolve(database),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalog),
      protectedCatalogSnapshot: snapshotCatalogFiles(protectedCatalog),
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
