import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE54_P200_P205_ID, PHASE54_PELIKAN_ID, PHASE54_PURA_ID, PHASE54_TOLEDO_ID, phase54PelikanToledoPuraPacks } from "./data/phase54-pelikan-toledo-pura";

export type ApplyPhase54Options = ApplyPhase22Options;
export type ApplyPhase54Result = ApplyPhase22Result;

export const PHASE54_TOLEDO_SLUG = "pelikan-toledo";
export const PHASE54_PURA_SLUG = "pelikan-pura";
export const PHASE54_P200_P205_SLUG = "pelikan-p200-p205";

const PENS = [
  { id: PHASE54_TOLEDO_ID, slug: PHASE54_TOLEDO_SLUG, name: "百利金 Pelikan Toledo" },
  { id: PHASE54_PURA_ID, slug: PHASE54_PURA_SLUG, name: "百利金 Pelikan Pura (P40)" },
  { id: PHASE54_P200_P205_ID, slug: PHASE54_P200_P205_SLUG, name: "百利金 Pelikan P200 / P205" },
] as const;

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
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 54 refuses inherited remote selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase54Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile()) {
    throw new Error("Phase 54 owned catalog authority is not a regular local copy.");
  }
  if (fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 54 database must be a non-symlink inside the owned root.");
  }
  const own = fs.statSync(databasePath, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) {
    throw new Error("Phase 54 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 54 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 54 owned copy must be migrated through 032.");
}

async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE54_PELIKAN_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "pelikan") {
      throw new Error("Phase 54 Pelikan brand identity mismatch.");
    }
    const batchKey = "phase54-pelikan-toledo-pura-topology-v1";
    await tx.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)",
      args: [stableId("phase54-batch", batchKey), batchKey, digest(batchKey), "Create Pelikan Toledo, Pura and P200/P205 canonical family entities."],
    });
    for (const pen of PENS) {
      const existing = await tx.execute({
        sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id",
        args: [pen.id, pen.slug],
      });
      if (existing.rows.length === 0) {
        await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [pen.id, pen.slug, pen.name] });
      } else if (existing.rows.length !== 1 || String(existing.rows[0]?.id) !== pen.id || String(existing.rows[0]?.type) !== "pen" || String(existing.rows[0]?.slug) !== pen.slug) {
        throw new Error(`Phase 54 entity/slug collision: ${pen.slug}`);
      }
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [pen.id, PHASE54_PELIKAN_ID] });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)",
        args: [stableId("phase54-link", `${pen.id}:made_by:${PHASE54_PELIKAN_ID}`), pen.id, PHASE54_PELIKAN_ID, "Phase 54 canonical Pelikan maker"],
      });
      const maker = await tx.execute({ sql: "SELECT count(*) AS total FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'", args: [pen.id, PHASE54_PELIKAN_ID] });
      if (Number(maker.rows[0]?.total ?? 0) !== 1) throw new Error(`Phase 54 maker topology failed: ${pen.slug}`);
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase54PelikanToledoPuraContent(client: Client, options: ApplyPhase54Options): Promise<ApplyPhase54Result> {
  await assertOwned(client, options);
  await ensureTopology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase54PelikanToledoPuraPacks));
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const workspaceRoot = process.cwd();
  const databasePath = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalogPath = cliValue("--protected-catalog");
  if (!databasePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error("Usage: tsx scripts/apply-phase54-pelikan-toledo-pura-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  }
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    const result = await applyPhase54PelikanToledoPuraContent(client, {
      workspaceRoot,
      reviewer: cliValue("--reviewer") ?? "phase54-pelikan-toledo-pura-curated-content",
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
