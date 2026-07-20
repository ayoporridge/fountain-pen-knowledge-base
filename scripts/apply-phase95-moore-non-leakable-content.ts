import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client } from "@libsql/client";
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
  PHASE95_MOORE_BRAND_ID,
  PHASE95_MOORE_NON_LEAKABLE_ID,
  phase95MoorePacks,
} from "./data/phase95-moore-non-leakable";

export type ApplyPhase95Options = ApplyPhase22Options;
export type ApplyPhase95Result = ApplyPhase22Result;

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 95 refuses inherited remote selection: ${key}.`);
    }
  }
}

async function assertOwned(
  client: Client,
  options: ApplyPhase95Options,
): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !isInside(databasePath, ownedRoot)
  ) {
    throw new Error(
      "Phase 95 database must be a non-symlink file inside the owned root.",
    );
  }
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error("Phase 95 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (
    !main?.file ||
    fs.realpathSync.native(String(main.file)) !== databasePath
  ) {
    throw new Error("Phase 95 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 95 owned copy must be migrated through 032.");
  }
}

async function ensureTopology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    const brand = await transaction.execute({
      sql: "SELECT id, type, slug FROM entities WHERE id = ?",
      args: [PHASE95_MOORE_BRAND_ID],
    });
    if (
      brand.rows.length !== 1 ||
      String(brand.rows[0]?.type) !== "brand" ||
      String(brand.rows[0]?.slug) !== "moore"
    ) {
      throw new Error("Phase 95 Moore brand identity mismatch.");
    }
    const pen = await transaction.execute({
      sql: "SELECT id, type, slug FROM entities WHERE id = ?",
      args: [PHASE95_MOORE_NON_LEAKABLE_ID],
    });
    if (
      pen.rows.length !== 1 ||
      String(pen.rows[0]?.type) !== "pen" ||
      String(pen.rows[0]?.slug) !== "moore-s-non-leakable-fountain-pen"
    ) {
      throw new Error("Phase 95 Moore’s Non-Leakable identity mismatch.");
    }
    await transaction.execute({
      sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?",
      args: [PHASE95_MOORE_NON_LEAKABLE_ID, PHASE95_MOORE_BRAND_ID],
    });
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)",
      args: [
        stableId("phase95-made-by", PHASE95_MOORE_NON_LEAKABLE_ID),
        PHASE95_MOORE_NON_LEAKABLE_ID,
        PHASE95_MOORE_BRAND_ID,
        "Phase 95 exact Moore model-maker relation",
      ],
    });
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)",
      args: [
        stableId("phase95-reverse", PHASE95_MOORE_NON_LEAKABLE_ID),
        PHASE95_MOORE_BRAND_ID,
        PHASE95_MOORE_NON_LEAKABLE_ID,
        "Phase 95 Moore brand-to-model navigation",
      ],
    });
    const maker = await transaction.execute({
      sql: "SELECT count(*) AS total FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'",
      args: [PHASE95_MOORE_NON_LEAKABLE_ID, PHASE95_MOORE_BRAND_ID],
    });
    if (Number(maker.rows[0]?.total ?? 0) !== 1) {
      throw new Error("Phase 95 Moore maker topology failed.");
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase95MooreContent(
  client: Client,
  options: ApplyPhase95Options,
): Promise<ApplyPhase95Result> {
  await assertOwned(client, options);
  await ensureTopology(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    structuredClone(phase95MoorePacks),
  );
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : (process.argv[index + 1] ?? null);
}

async function main(): Promise<void> {
  const databasePath = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalogPath = value("--protected-catalog");
  if (!databasePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error(
      "Usage: tsx scripts/apply-phase95-moore-non-leakable-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>",
    );
  }
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    const result = await applyPhase95MooreContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase95-moore-curated-content",
      databasePath: path.resolve(databasePath),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalogPath),
      protectedCatalogSnapshot: snapshotCatalogFiles(
        path.resolve(protectedCatalogPath),
      ),
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
