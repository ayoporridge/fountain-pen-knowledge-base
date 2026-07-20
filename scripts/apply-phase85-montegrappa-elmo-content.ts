import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE85_ELMO_01_ID, PHASE85_ELMO_01_SLUG, PHASE85_MONTEGRAPPA_BRAND_ID, phase85MontegrappaElmoPacks } from "./data/phase85-montegrappa-elmo";

export type ApplyPhase85Options = ApplyPhase22Options;
export type ApplyPhase85Result = ApplyPhase22Result;

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 85 refuses inherited remote database selection: ${key}.`);
  }
}

async function assertOwnedCatalog(client: Client, options: ApplyPhase85Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, root)) {
    throw new Error("Phase 85 owned catalog authority check failed.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) {
    throw new Error("Phase 85 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 85 client is not bound to the caller-owned copy.");
  }
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 85 owned copy must be migrated through 032.");
}

async function ensureEntity(tx: Transaction, input: { id: string; type: "brand" | "pen"; slug: string; name: string }): Promise<void> {
  const byId = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ?", args: [input.id] });
  const bySlug = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE slug = ?", args: [input.slug] });
  if (byId.rows.length === 0 && bySlug.rows.length === 0) {
    await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, ?, ?, ?)", args: [input.id, input.type, input.slug, input.name] });
    return;
  }
  if (byId.rows.length !== 1 || bySlug.rows.length !== 1 || String(byId.rows[0]?.id) !== input.id || String(bySlug.rows[0]?.id) !== input.id || String(byId.rows[0]?.type) !== input.type || String(byId.rows[0]?.slug) !== input.slug) {
    throw new Error(`Phase 85 exact ${input.type} identity is occupied or ambiguous: ${input.slug}.`);
  }
  await tx.execute({ sql: "UPDATE entities SET name = ?, updated_at = datetime('now') WHERE id = ?", args: [input.name, input.id] });
}

async function prepareTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    await ensureEntity(tx, { id: PHASE85_MONTEGRAPPA_BRAND_ID, type: "brand", slug: "montegrappa", name: "Montegrappa" });
    await ensureEntity(tx, { id: PHASE85_ELMO_01_ID, type: "pen", slug: PHASE85_ELMO_01_SLUG, name: "Montegrappa Elmo 01" });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [PHASE85_ELMO_01_ID, PHASE85_MONTEGRAPPA_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase85-made-by", PHASE85_ELMO_01_ID), PHASE85_ELMO_01_ID, PHASE85_MONTEGRAPPA_BRAND_ID, "Phase 85 exact Montegrappa Elmo 01 maker relation"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase85-brand-reverse", PHASE85_ELMO_01_ID), PHASE85_MONTEGRAPPA_BRAND_ID, PHASE85_ELMO_01_ID, "Phase 85 Montegrappa-to-Elmo 01 model navigation"] });
    const makers = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [PHASE85_ELMO_01_ID] });
    if (makers.rows.length !== 1 || String(makers.rows[0]?.target_id) !== PHASE85_MONTEGRAPPA_BRAND_ID) throw new Error("Phase 85 Elmo 01 maker topology remains ambiguous.");
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

async function ensurePublicBrandNavigation(client: Client): Promise<void> {
  const pens = await client.execute({
    sql: "SELECT pen.id FROM public_entities pen JOIN entity_links maker ON maker.source_id = pen.id AND maker.target_id = ? AND maker.link_type = 'made_by' WHERE pen.type = 'pen' ORDER BY pen.id",
    args: [PHASE85_MONTEGRAPPA_BRAND_ID],
  });
  const tx = await client.transaction("write");
  try {
    for (const row of pens.rows) {
      const penId = String(row.id);
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase85-public-reverse", penId), PHASE85_MONTEGRAPPA_BRAND_ID, penId, "Phase 85 public Montegrappa model navigation"] });
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase85MontegrappaElmoContent(client: Client, options: ApplyPhase85Options): Promise<ApplyPhase85Result> {
  await assertOwnedCatalog(client, options);
  await prepareTopology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase85MontegrappaElmoPacks()));
  await ensurePublicBrandNavigation(client);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase85-montegrappa-elmo-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase85MontegrappaElmoContent(client, {
      workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase85-montegrappa-elmo", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally { client.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
