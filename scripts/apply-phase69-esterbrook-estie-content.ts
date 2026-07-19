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
  PHASE69_ESTERBROOK_BRAND_ID,
  PHASE69_ESTIE_OVERSIZED_ID,
  PHASE69_ESTIE_OVERSIZED_SLUG,
  phase69EsterbrookEstiePacks,
} from "./data/phase69-esterbrook-estie";

export type ApplyPhase69Options = ApplyPhase22Options;
export type ApplyPhase69Result = ApplyPhase22Result;

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableId(prefix: string, value: string): string {
  return `${prefix}-${digest(value).slice(0, 24)}`;
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
      throw new Error(`Phase 69 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertOwned(
  client: Client,
  options: ApplyPhase69Options,
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
    throw new Error("Phase 69 owned catalog authority check failed.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (
    database === protectedCatalog ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 69 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (
    !main?.file ||
    fs.realpathSync.native(String(main.file)) !== database
  ) {
    throw new Error("Phase 69 client is not bound to owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 69 owned copy must be migrated through 032.");
  }
}

async function ensureTopology(tx: Transaction): Promise<void> {
  const brand = await tx.execute({
    sql: "SELECT type, slug FROM entities WHERE id = ?",
    args: [PHASE69_ESTERBROOK_BRAND_ID],
  });
  if (
    brand.rows.length !== 1 ||
    String(brand.rows[0]?.type) !== "brand" ||
    String(brand.rows[0]?.slug) !== "esterbrook"
  ) {
    throw new Error("Phase 69 Esterbrook brand identity mismatch.");
  }

  const pen = await tx.execute({
    sql: "SELECT type, slug FROM entities WHERE id = ?",
    args: [PHASE69_ESTIE_OVERSIZED_ID],
  });
  if (
    pen.rows.length !== 1 ||
    String(pen.rows[0]?.type) !== "pen" ||
    String(pen.rows[0]?.slug) !== PHASE69_ESTIE_OVERSIZED_SLUG
  ) {
    throw new Error("Phase 69 Estie Oversized identity/slug mismatch.");
  }

  await tx.execute({
    sql: "UPDATE entities SET name = ?, updated_at = datetime('now') WHERE id = ?",
    args: ["Esterbrook Estie Oversized", PHASE69_ESTIE_OVERSIZED_ID],
  });
  await tx.execute({
    sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?",
    args: [PHASE69_ESTIE_OVERSIZED_ID, PHASE69_ESTERBROOK_BRAND_ID],
  });
  await tx.execute({
    sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)",
    args: [
      stableId(
        "phase69-made-by",
        `${PHASE69_ESTIE_OVERSIZED_ID}:${PHASE69_ESTERBROOK_BRAND_ID}`,
      ),
      PHASE69_ESTIE_OVERSIZED_ID,
      PHASE69_ESTERBROOK_BRAND_ID,
      "Phase 69 sourced Esterbrook Estie Oversized maker topology",
    ],
  });
  await tx.execute({
    sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)",
    args: [
      stableId(
        "phase69-reverse",
        `${PHASE69_ESTERBROOK_BRAND_ID}:${PHASE69_ESTIE_OVERSIZED_ID}`,
      ),
      PHASE69_ESTERBROOK_BRAND_ID,
      PHASE69_ESTIE_OVERSIZED_ID,
      "Phase 69 Esterbrook brand-to-model navigation",
    ],
  });
  const makers = await tx.execute({
    sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
    args: [PHASE69_ESTIE_OVERSIZED_ID],
  });
  if (
    makers.rows.length !== 1 ||
    String(makers.rows[0]?.target_id) !== PHASE69_ESTERBROOK_BRAND_ID
  ) {
    throw new Error("Phase 69 Estie Oversized maker topology remains ambiguous.");
  }
}

export async function applyPhase69EsterbrookEstieContent(
  client: Client,
  options: ApplyPhase69Options,
): Promise<ApplyPhase69Result> {
  await assertOwned(client, options);
  const tx = await client.transaction("write");
  try {
    await ensureTopology(tx);
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
  const result = await applyCuratedContentPacks(
    client,
    options,
    structuredClone(phase69EsterbrookEstiePacks),
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
      "Usage: tsx scripts/apply-phase69-esterbrook-estie-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase69EsterbrookEstieContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: cliValue("--reviewer") ?? "phase69-esterbrook-estie",
      databasePath: path.resolve(database),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalog),
      protectedCatalogSnapshot: snapshotCatalogFiles(
        path.resolve(protectedCatalog),
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

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
