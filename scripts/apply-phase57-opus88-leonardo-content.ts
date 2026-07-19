import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import {
  PHASE57_LEONARDO_BRAND_ID,
  PHASE57_LEONARDO_FURORE_ID,
  PHASE57_LEONARDO_MIXED_ID,
  PHASE57_LEONARDO_MIXED_SLUG,
  PHASE57_LEONARDO_MOMENTO_ID,
  PHASE57_OPUS_BRAND_ID,
  PHASE57_OPUS_DEMO_ID,
  PHASE57_OPUS_KOLORO_ID,
  PHASE57_OPUS_MIXED_ID,
  PHASE57_OPUS_MIXED_SLUG,
  phase57Opus88LeonardoPacks,
} from "./data/phase57-opus88-leonardo";

export type ApplyPhase57Options = ApplyPhase22Options;
export type ApplyPhase57Result = ApplyPhase22Result;

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
    if (env[key]?.trim()) throw new Error(`Phase 57 refuses inherited remote selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase57Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 57 owned catalog authority check failed.");
  }
  const own = fs.statSync(databasePath, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 57 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 57 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 57 owned copy must be migrated through 032.");
}

async function ensureCanonicalEntity(tx: Transaction, input: { id: string; slug: string; name: string; brandId: string }): Promise<void> {
  const existing = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id", args: [input.id, input.slug] });
  if (existing.rows.length === 0) {
    await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [input.id, input.slug, input.name] });
  } else if (existing.rows.length !== 1 || String(existing.rows[0]?.id) !== input.id || String(existing.rows[0]?.type) !== "pen" || String(existing.rows[0]?.slug) !== input.slug) {
    throw new Error(`Phase 57 canonical entity/slug collision: ${input.id}/${input.slug}`);
  }
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [input.id, input.brandId] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase57-link", `${input.id}:made_by:${input.brandId}`), input.id, input.brandId, "Phase 57 canonical Opus 88 / Leonardo maker topology"] });
  const madeBy = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [input.id] });
  if (madeBy.rows.length !== 1 || String(madeBy.rows[0]?.target_id) !== input.brandId) throw new Error(`Phase 57 made_by topology is ambiguous: ${input.id}`);
}

async function retireMixed(tx: Transaction, input: { key: string; sourceId: string; sourceSlug: string; targets: string[]; note: string }): Promise<void> {
  const mixed = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [input.sourceId] });
  if (mixed.rows.length !== 1 || String(mixed.rows[0]?.type) !== "pen" || String(mixed.rows[0]?.slug) !== input.sourceSlug) throw new Error(`Phase 57 mixed identity mismatch: ${input.sourceId}`);
  const batchKey = `phase57-${input.key}-retire`;
  const batchId = stableId("phase57-batch", batchKey);
  const actionId = stableId("phase57-action", batchKey);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, batchKey, digest(batchKey), input.note] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'split', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, input.key, digest(`${batchKey}\0${input.sourceId}\0${input.targets.join(",")}`), input.sourceId, input.targets[0], input.note] });
  for (const target of input.targets) {
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'split', ?)", args: [stableId("phase57-lineage", `${input.key}:${target}`), batchId, actionId, input.sourceId, target, "mixed donor retired; old route intentionally has no child redirect"] });
  }
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [input.sourceId] });
  await tx.execute({ sql: "UPDATE entity_publications SET status = 'retired', blockers_json = ?, approved_content_hash = NULL, reviewed_content_revision = NULL, reviewed_contract_version = NULL, reviewed_by = NULL, reviewed_at = NULL, published_at = NULL, review_notes = ?, updated_at = datetime('now') WHERE entity_id = ? AND status <> 'retired'", args: ['["identity_mixed_made_by"]', input.note, input.sourceId] });
}

async function ensureIdentity(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brands = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id IN (?, ?)", args: [PHASE57_OPUS_BRAND_ID, PHASE57_LEONARDO_BRAND_ID] });
    if (brands.rows.length !== 2 || brands.rows.some((row) => String(row?.type) !== "brand")) throw new Error("Phase 57 Opus/Leonardo brand identity set is incomplete.");
    if (!brands.rows.some((row) => String(row.id) === PHASE57_OPUS_BRAND_ID && String(row.slug) === "opus88") || !brands.rows.some((row) => String(row.id) === PHASE57_LEONARDO_BRAND_ID && String(row.slug) === "leonardo")) throw new Error("Phase 57 Opus/Leonardo brand slug mismatch.");
    await ensureCanonicalEntity(tx, { id: PHASE57_OPUS_DEMO_ID, slug: "opus-88-demo", name: "Opus 88 Demonstrator", brandId: PHASE57_OPUS_BRAND_ID });
    await ensureCanonicalEntity(tx, { id: PHASE57_OPUS_KOLORO_ID, slug: "opus-88-koloro", name: "Opus 88 Koloro", brandId: PHASE57_OPUS_BRAND_ID });
    await ensureCanonicalEntity(tx, { id: PHASE57_LEONARDO_FURORE_ID, slug: "leonardo-furore", name: "Leonardo Furore", brandId: PHASE57_LEONARDO_BRAND_ID });
    await ensureCanonicalEntity(tx, { id: PHASE57_LEONARDO_MOMENTO_ID, slug: "leonardo-momento-magico", name: "Leonardo Momento Magico", brandId: PHASE57_LEONARDO_BRAND_ID });
    await retireMixed(tx, { key: "opus88-demo-kolora", sourceId: PHASE57_OPUS_MIXED_ID, sourceSlug: PHASE57_OPUS_MIXED_SLUG, targets: [PHASE57_OPUS_DEMO_ID, PHASE57_OPUS_KOLORO_ID], note: "Retire mixed Opus 88 Demo/Kolora donor; old route is intentionally hard 404 with no redirect." });
    await retireMixed(tx, { key: "leonardo-furore-momento-magico", sourceId: PHASE57_LEONARDO_MIXED_ID, sourceSlug: PHASE57_LEONARDO_MIXED_SLUG, targets: [PHASE57_LEONARDO_FURORE_ID, PHASE57_LEONARDO_MOMENTO_ID], note: "Retire mixed Leonardo Furore/Momento Magico donor; old route is intentionally hard 404 with no redirect." });
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase57Opus88LeonardoContent(client: Client, options: ApplyPhase57Options): Promise<ApplyPhase57Result> {
  await assertOwned(client, options);
  await ensureIdentity(client);
  const opusIds = new Set([PHASE57_OPUS_BRAND_ID, PHASE57_OPUS_DEMO_ID, PHASE57_OPUS_KOLORO_ID]);
  const leonardoIds = new Set([PHASE57_LEONARDO_BRAND_ID, PHASE57_LEONARDO_FURORE_ID, PHASE57_LEONARDO_MOMENTO_ID]);
  const entities: ApplyPhase57Result["entities"] = [];
  for (const group of [phase57Opus88LeonardoPacks.filter((pack) => opusIds.has(pack.entityId)), phase57Opus88LeonardoPacks.filter((pack) => leonardoIds.has(pack.entityId))]) {
    const result = await applyCuratedContentPacks(client, options, structuredClone(group));
    entities.push(...result.entities);
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities };
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const workspaceRoot = process.cwd();
  const database = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase57-opus88-leonardo-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase57Opus88LeonardoContent(client, { workspaceRoot, reviewer: cliValue("--reviewer") ?? "phase57-opus88-leonardo-curated-content", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
