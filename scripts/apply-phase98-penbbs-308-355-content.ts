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
  PHASE98_PENBBS_308_ID,
  PHASE98_PENBBS_308_SLUG,
  PHASE98_PENBBS_355_ID,
  PHASE98_PENBBS_355_SLUG,
  phase98PenBbsPacks,
} from "./data/phase98-penbbs-308-355";
import { PHASE72_PENBBS_BRAND_ID } from "./data/phase72-delike-duke-penbbs";

export type ApplyPhase98Options = ApplyPhase22Options;
export type ApplyPhase98Result = ApplyPhase22Result;

const TARGETS = [
  { id: PHASE98_PENBBS_308_ID, slug: PHASE98_PENBBS_308_SLUG, name: "PenBBS 308" },
  { id: PHASE98_PENBBS_355_ID, slug: PHASE98_PENBBS_355_SLUG, name: "PenBBS 355" },
] as const;

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function assertOwned(client: Client, options: ApplyPhase98Options): Promise<void> {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if ((options.env ?? process.env)[key]?.trim()) {
      throw new Error(`Phase 98 refuses inherited remote database selection: ${key}.`);
    }
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(root).isDirectory()
    || !fs.statSync(database).isFile()
    || fs.lstatSync(options.databasePath).isSymbolicLink()
    || !isInside(database, root)
  ) {
    throw new Error("Phase 98 database must be a non-symlink file inside the owned root.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)) {
    throw new Error("Phase 98 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 98 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 98 owned copy must be migrated through 032.");
  }
}

async function prepareTopology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    const brand = await transaction.execute({
      sql: "SELECT type, slug FROM entities WHERE id = ?",
      args: [PHASE72_PENBBS_BRAND_ID],
    });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "penbbs") {
      throw new Error("Phase 98 PenBBS brand identity mismatch.");
    }
    for (const target of TARGETS) {
      const existing = await transaction.execute({
        sql: "SELECT type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id",
        args: [target.id, target.slug],
      });
      if (existing.rows.length === 0) {
        await transaction.execute({
          sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)",
          args: [target.id, target.slug, target.name],
        });
      } else if (
        existing.rows.length !== 1
        || String(existing.rows[0]?.type) !== "pen"
        || String(existing.rows[0]?.slug) !== target.slug
      ) {
        throw new Error(`Phase 98 identity collision for ${target.slug}.`);
      }
      await transaction.execute({
        sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?",
        args: [target.id, PHASE72_PENBBS_BRAND_ID],
      });
      await transaction.execute({
        sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)",
        args: [
          stableId("phase98-made-by", target.id),
          target.id,
          PHASE72_PENBBS_BRAND_ID,
          `Phase 98 verified ${target.name} maker relation`,
        ],
      });
      await transaction.execute({
        sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)",
        args: [
          stableId("phase98-reverse", target.id),
          PHASE72_PENBBS_BRAND_ID,
          target.id,
          `Phase 98 PenBBS brand-to-${target.name} navigation`,
        ],
      });
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase98PenBbsContent(
  client: Client,
  options: ApplyPhase98Options,
): Promise<ApplyPhase98Result> {
  await assertOwned(client, options);
  await prepareTopology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase98PenBbsPacks));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function argumentValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const databasePath = argumentValue("--database");
  const ownedRoot = argumentValue("--owned-root");
  const protectedCatalogPath = argumentValue("--protected-catalog");
  if (!databasePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error("Usage: tsx scripts/apply-phase98-penbbs-308-355-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>");
  }
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    const result = await applyPhase98PenBbsContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: argumentValue("--reviewer") ?? "phase98-penbbs-308-355",
      databasePath: path.resolve(databasePath),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalogPath),
      protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalogPath)),
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
