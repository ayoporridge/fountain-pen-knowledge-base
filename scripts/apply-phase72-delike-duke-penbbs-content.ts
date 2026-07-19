import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { PHASE72_DELIKE_BRAND_ID, PHASE72_DELIKE_ELEMENT_ID, PHASE72_DELIKE_ELEMENT_RAW_SLUG, PHASE72_DELIKE_ELEMENT_SLUG, PHASE72_DUKE_551_ID, PHASE72_DUKE_551_RAW_SLUG, PHASE72_DUKE_551_SLUG, PHASE72_DUKE_BRAND_ID, PHASE72_PENBBS_268_ID, PHASE72_PENBBS_268_RAW_SLUG, PHASE72_PENBBS_268_SLUG, PHASE72_PENBBS_BRAND_ID, phase72DelikePacks, phase72DukePacks, phase72PenBbsPacks } from "./data/phase72-delike-duke-penbbs";

export type ApplyPhase72Options = ApplyPhase22Options;
export type ApplyPhase72Result = ApplyPhase22Result;

const TARGETS = [
  { key: "delike", brandId: PHASE72_DELIKE_BRAND_ID, id: PHASE72_DELIKE_ELEMENT_ID, oldSlug: PHASE72_DELIKE_ELEMENT_RAW_SLUG, slug: PHASE72_DELIKE_ELEMENT_SLUG, name: "Delike Element", packs: phase72DelikePacks },
  { key: "duke", brandId: PHASE72_DUKE_BRAND_ID, id: PHASE72_DUKE_551_ID, oldSlug: PHASE72_DUKE_551_RAW_SLUG, slug: PHASE72_DUKE_551_SLUG, name: "Duke 551 Confucius", packs: phase72DukePacks },
  { key: "penbbs", brandId: PHASE72_PENBBS_BRAND_ID, id: PHASE72_PENBBS_268_ID, oldSlug: PHASE72_PENBBS_268_RAW_SLUG, slug: PHASE72_PENBBS_268_SLUG, name: "PenBBS 268", packs: phase72PenBbsPacks },
] as const;

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 72 refuses inherited remote database selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase72Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env); assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot); const database = fs.realpathSync.native(options.databasePath); const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(root).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, root)) throw new Error("Phase 72 owned catalog authority check failed.");
  const own = fs.statSync(database, { bigint: true }); const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 72 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) throw new Error("Phase 72 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 72 owned copy must be migrated through 032.");
}

async function prepareTarget(client: Client, target: (typeof TARGETS)[number]): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type FROM entities WHERE id = ?", args: [target.brandId] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand") throw new Error(`Phase 72 brand identity mismatch: ${target.key}`);
    const pen = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [target.id] });
    if (target.key === "duke" && pen.rows.length === 0) {
      await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [target.id, target.slug, target.name] });
    } else if (pen.rows.length !== 1 || String(pen.rows[0]?.type) !== "pen") throw new Error(`Phase 72 pen identity mismatch: ${target.key}`);
    const resolved = await tx.execute({ sql: "SELECT slug FROM entities WHERE id = ?", args: [target.id] });
    const currentSlug = String(resolved.rows[0]?.slug); if (currentSlug !== target.oldSlug && currentSlug !== target.slug) throw new Error(`Phase 72 unexpected slug for ${target.key}: ${currentSlug}`);
    if (target.key !== "duke") {
      const batchKey = `phase72-${target.key}-canonical-v1`; const batchId = stableId("phase72-batch", batchKey); const actionId = stableId("phase72-action", target.id);
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, batchKey, digest(batchKey), `Phase 72 sources ${target.name} without merging nearby products or unverified routes.`] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, target.oldSlug, digest(`${target.id}:${target.oldSlug}:${target.slug}`), target.id, target.id, `Canonicalized ${target.oldSlug} to ${target.slug}; no nearby-model merge.`] });
      if (currentSlug === target.oldSlug) await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)", args: [stableId("phase72-lineage", target.id), batchId, actionId, target.id, target.id] });
    }
    if (currentSlug === target.oldSlug) await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: [target.slug, target.name, target.id] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [target.id, target.brandId] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase72-made-by", `${target.id}:${target.brandId}`), target.id, target.brandId, `Phase 72 verified ${target.name} maker relation`] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase72-reverse", `${target.brandId}:${target.id}`), target.brandId, target.id, `Phase 72 ${target.name} brand navigation`] });
    const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [target.id] });
    if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== target.brandId) throw new Error(`Phase 72 maker topology ambiguous: ${target.key}`);
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase72DelikeDukePenBbsContent(client: Client, options: ApplyPhase72Options): Promise<ApplyPhase72Result> {
  await assertOwned(client, options); const results: ApplyPhase72Result["entities"] = [];
  for (const target of TARGETS) { await prepareTarget(client, target); const result = await applyCuratedContentPacks(client, options, structuredClone(target.packs())); results.push(...result.entities); }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot); return { entities: results };
}

function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> { const database = cliValue("--database"); const ownedRoot = cliValue("--owned-root"); const protectedCatalog = cliValue("--protected-catalog"); if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase72-delike-duke-penbbs-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]"); const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` }); try { const result = await applyPhase72DelikeDukePenBbsContent(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase72-delike-duke-penbbs", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); } finally { client.close(); } }
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
