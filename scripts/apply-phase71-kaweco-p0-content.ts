import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { phase25KawecoPacks } from "./data/phase25-kaweco";
import { createPhase71KawecoPacks, PHASE71_AL_SPORT_RAW_SLUG, PHASE71_AL_SPORT_SLUG, PHASE71_KAWECO_BRAND_ID, PHASE71_LILIPUT_RAW_SLUG, PHASE71_LILIPUT_SLUG, PHASE71_STUDENT_RAW_SLUG, PHASE71_STUDENT_SLUG } from "./data/phase71-kaweco-p0";

export type ApplyPhase71Options = ApplyPhase22Options;
export type ApplyPhase71Result = ApplyPhase22Result;

const TARGETS = [
  { key: "alSport", oldSlug: PHASE71_AL_SPORT_RAW_SLUG, slug: PHASE71_AL_SPORT_SLUG, name: "Kaweco AL Sport" },
  { key: "liliput", oldSlug: PHASE71_LILIPUT_RAW_SLUG, slug: PHASE71_LILIPUT_SLUG, name: "Kaweco Liliput" },
  { key: "student", oldSlug: PHASE71_STUDENT_RAW_SLUG, slug: PHASE71_STUDENT_SLUG, name: "Kaweco Student" },
] as const;

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 71 refuses inherited remote database selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase71Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, ownedRoot)) throw new Error("Phase 71 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 71 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 71 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 71 owned copy must be migrated through 032.");
}

async function resolveExistingPen(tx: Transaction, target: (typeof TARGETS)[number]): Promise<string> {
  const bySlug = await tx.execute({ sql: "SELECT id, type, name FROM entities WHERE slug = ? ORDER BY id", args: [target.slug] });
  if (bySlug.rows.length !== 1) throw new Error(`Phase 71 strict slug lookup failed: ${target.slug}`);
  if (String(bySlug.rows[0]?.type) !== "pen") throw new Error(`Phase 71 wrong entity type for ${target.slug}`);
  const name = String(bySlug.rows[0]?.name ?? "");
  if (!name.includes(target.name.replace("Kaweco ", ""))) throw new Error(`Phase 71 strict title check failed for ${target.slug}: ${name}`);
  return String(bySlug.rows[0]?.id);
}

async function prepareIdentity(client: Client): Promise<{ alSport: string; liliput: string; student: string }> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE71_KAWECO_BRAND_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "kaweco") throw new Error("Phase 71 Kaweco brand identity mismatch.");
    const ids = { alSport: await resolveExistingPen(tx, TARGETS[0]), liliput: await resolveExistingPen(tx, TARGETS[1]), student: await resolveExistingPen(tx, TARGETS[2]) };
    if (new Set(Object.values(ids)).size !== 3) throw new Error("Phase 71 Kaweco models resolve ambiguously.");
    const batchKey = "phase71-kaweco-p0-identity-v1"; const batchId = stableId("phase71-batch", batchKey);
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, batchKey, digest(batchKey), "Confirm existing Kaweco AL Sport, Liliput and Student records and attach one verified brand relationship each."] });
    for (const target of TARGETS) {
      const id = ids[target.key]; const actionId = stableId("phase71-action", id);
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'reconcile', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, target.slug, digest(`${id}:${target.slug}`), id, id, `Verified existing ${target.name} identity and maker link.`] });
      await tx.execute({ sql: "UPDATE entities SET name = ?, updated_at = datetime('now') WHERE id = ?", args: [target.name, id] });
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [id, PHASE71_KAWECO_BRAND_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase71-made-by", id), id, PHASE71_KAWECO_BRAND_ID, "Phase 71 verified Kaweco model maker relation"] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase71-reverse", id), PHASE71_KAWECO_BRAND_ID, id, "Phase 71 Kaweco model navigation"] });
      const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [id] });
      if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== PHASE71_KAWECO_BRAND_ID) throw new Error(`Phase 71 maker topology is ambiguous: ${target.key}`);
    }
    await tx.commit(); return ids;
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase71KawecoP0Content(client: Client, options: ApplyPhase71Options): Promise<ApplyPhase71Result> {
  await assertOwned(client, options);
  const ids = await prepareIdentity(client);
  const existingBrand = phase25KawecoPacks.find((pack) => pack.entityId === PHASE71_KAWECO_BRAND_ID);
  if (!existingBrand) throw new Error("Phase 71 Kaweco brand prerequisite pack is missing.");
  const existingSport = phase25KawecoPacks.find(
    (pack) => pack.expectedType === "pen" && pack.expectedSlug === "kaweco-sport",
  );
  if (!existingSport) throw new Error("Phase 71 Kaweco Sport prerequisite pack is missing.");
  const brand = structuredClone(existingBrand); brand.key = "phase71-kaweco-brand-v1";
  const sport = structuredClone(existingSport); sport.key = "phase71-kaweco-sport-v1";
  const result = await applyCuratedContentPacks(client, options, [brand, sport, ...createPhase71KawecoPacks(ids)]);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return result;
}

function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = cliValue("--database"); const ownedRoot = cliValue("--owned-root"); const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase71-kaweco-p0-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { const result = await applyPhase71KawecoP0Content(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase71-kaweco-p0", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
