import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
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
  PHASE75_LEGACY_HERITAGE_ID,
  PHASE75_LEGACY_HERITAGE_SLUG,
  PHASE75_SHEAFFER_ID,
  phase75SheafferLegacyHeritagePacks,
} from "./data/phase75-sheaffer-legacy-heritage";

export type ApplyPhase75Options = ApplyPhase22Options;
export type ApplyPhase75Result = ApplyPhase22Result;

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
      throw new Error(`Phase 75 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertOwned(
  client: Client,
  options: ApplyPhase75Options,
): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !isInside(database, ownedRoot)
  ) {
    throw new Error("Phase 75 owned catalog authority check failed.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (
    database === protectedCatalog ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 75 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (
    !main?.file ||
    fs.realpathSync.native(String(main.file)) !== database
  ) {
    throw new Error("Phase 75 client is not bound to owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 75 owned copy must be migrated through 032.");
  }
}

async function ensureLegacyHeritage(tx: Transaction): Promise<void> {
  const rows = await tx.execute({
    sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id",
    args: [PHASE75_LEGACY_HERITAGE_ID, PHASE75_LEGACY_HERITAGE_SLUG],
  });
  if (rows.rows.length === 0) {
    await tx.execute({
      sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)",
      args: [
        PHASE75_LEGACY_HERITAGE_ID,
        PHASE75_LEGACY_HERITAGE_SLUG,
        "Sheaffer Legacy Heritage",
      ],
    });
  } else if (
    rows.rows.length !== 1 ||
    String(rows.rows[0]?.id) !== PHASE75_LEGACY_HERITAGE_ID ||
    String(rows.rows[0]?.type) !== "pen" ||
    String(rows.rows[0]?.slug) !== PHASE75_LEGACY_HERITAGE_SLUG
  ) {
    throw new Error("Phase 75 Legacy Heritage entity/slug collision.");
  }
  await tx.execute({
    sql: "UPDATE entities SET name = ?, updated_at = datetime('now') WHERE id = ?",
    args: ["Sheaffer Legacy Heritage", PHASE75_LEGACY_HERITAGE_ID],
  });
  await tx.execute({
    sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?",
    args: [PHASE75_LEGACY_HERITAGE_ID, PHASE75_SHEAFFER_ID],
  });
  await tx.execute({
    sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)",
    args: [
      stableId("phase75-made-by", PHASE75_LEGACY_HERITAGE_ID),
      PHASE75_LEGACY_HERITAGE_ID,
      PHASE75_SHEAFFER_ID,
      "Phase 75 sourced Sheaffer Legacy Heritage maker topology",
    ],
  });
  await tx.execute({
    sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)",
    args: [
      stableId("phase75-reverse", PHASE75_LEGACY_HERITAGE_ID),
      PHASE75_SHEAFFER_ID,
      PHASE75_LEGACY_HERITAGE_ID,
      "Phase 75 Sheaffer brand-to-Legacy Heritage navigation",
    ],
  });
  const makers = await tx.execute({
    sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
    args: [PHASE75_LEGACY_HERITAGE_ID],
  });
  if (
    makers.rows.length !== 1 ||
    String(makers.rows[0]?.target_id) !== PHASE75_SHEAFFER_ID
  ) {
    throw new Error("Phase 75 Legacy Heritage maker topology remains ambiguous.");
  }
}

async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({
      sql: "SELECT type, slug FROM entities WHERE id = ?",
      args: [PHASE75_SHEAFFER_ID],
    });
    if (
      brand.rows.length !== 1 ||
      String(brand.rows[0]?.type) !== "brand" ||
      String(brand.rows[0]?.slug) !== "sheaffer"
    ) {
      throw new Error("Phase 75 Sheaffer brand identity mismatch.");
    }
    await ensureLegacyHeritage(tx);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase75SheafferLegacyHeritageContent(
  client: Client,
  options: ApplyPhase75Options,
): Promise<ApplyPhase75Result> {
  await assertOwned(client, options);
  await ensureTopology(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    structuredClone(phase75SheafferLegacyHeritagePacks),
  );
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : (process.argv[index + 1] ?? null);
}

async function main(): Promise<void> {
  const database = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error(
      "Usage: tsx scripts/apply-phase75-sheaffer-legacy-heritage-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase75SheafferLegacyHeritageContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: cliValue("--reviewer") ?? "phase75-sheaffer-legacy-heritage",
      databasePath: path.resolve(database),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalog),
      protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)),
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

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
