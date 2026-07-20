import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import {
  PHASE83_DIPLOMAT_BRAND_ID,
  PHASE83_ELOX_FALLBACK_ID,
  PHASE83_EXCELLENCE_A2_FALLBACK_ID,
  PHASE83_LEONARDO_BRAND_ID,
  PHASE83_MOMENTO_ZERO_FALLBACK_ID,
  PHASE83_MZG_MOSAICO_FALLBACK_ID,
  PHASE83_SLUGS,
  phase83DiplomatLeonardoPacks,
} from "./data/phase83-diplomat-leonardo";

export type ApplyPhase83Options = ApplyPhase22Options;
export type ApplyPhase83Result = ApplyPhase22Result;

function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string) { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string) { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function assertNoRemoteSelection(env: NodeJS.ProcessEnv) { for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 83 refuses inherited remote selection: ${key}.`); }

async function assertOwned(client: Client, options: ApplyPhase83Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) throw new Error("Phase 83 owned catalog authority check failed.");
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)) throw new Error("Phase 83 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 83 client is not bound to its owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 83 owned copy must be migrated through 032.");
}

type ExactDefinition = { fallbackId: string; slug: string; name: string; aliases: string[]; brandId: string };
type ExactResolved = { id: string; sourceSlug: string; created: boolean };

async function resolveExactPen(tx: Transaction, definition: ExactDefinition): Promise<ExactResolved> {
  const names = [definition.name, ...definition.aliases];
  const slots = names.map(() => "?").join(", ");
  const matches = await tx.execute({ sql: `SELECT id, type, slug, name FROM entities WHERE type = 'pen' AND (slug = ? OR lower(name) IN (${slots})) ORDER BY id`, args: [definition.slug, ...names.map((name) => name.toLowerCase())] });
  if (matches.rows.length > 1) throw new Error(`Phase 83 exact identity lookup is ambiguous for ${definition.slug}; do not merge a family, article, colour or adjacent model.`);
  if (matches.rows.length === 0) {
    const collision = await tx.execute({ sql: "SELECT id, type FROM entities WHERE slug = ?", args: [definition.slug] });
    if (collision.rows.length) throw new Error(`Phase 83 canonical route is occupied for ${definition.slug}.`);
    await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [definition.fallbackId, definition.slug, definition.name] });
    return { id: definition.fallbackId, sourceSlug: definition.slug, created: true };
  }
  const row = matches.rows[0]!;
  const id = String(row.id);
  const sourceSlug = String(row.slug);
  const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [definition.slug, id] });
  if (collision.rows.length) throw new Error(`Phase 83 exact canonical route collides for ${definition.slug}.`);
  await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: [definition.slug, definition.name, id] });
  return { id, sourceSlug, created: false };
}

async function installRename(tx: Transaction, id: string, oldSlug: string, newSlug: string): Promise<void> {
  if (oldSlug === newSlug) return;
  const sourcePath = `/pen/${oldSlug}`;
  const targetPath = `/pen/${newSlug}`;
  const existing = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [sourcePath] });
  if (existing.rows.length === 1) {
    if (String(existing.rows[0]?.target_path) !== targetPath || String(existing.rows[0]?.redirect_kind) !== "permanent") throw new Error(`Phase 83 exact pen route has a conflicting redirect: ${sourcePath}.`);
    return;
  }
  if (existing.rows.length > 1) throw new Error(`Phase 83 exact pen route has duplicate redirects: ${sourcePath}.`);
  const key = `${id}:${sourcePath}->${targetPath}`;
  const batch = stableId("phase83-batch", key);
  const action = stableId("phase83-action", key);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batch, key, digest(key), "Phase 83 exact pen route normalization; no fuzzy family rename."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [action, batch, oldSlug, digest(key), id, id, "Phase 83 exact model slug normalization."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)", args: [stableId("phase83-lineage", key), batch, action, id, id] });
  await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')", args: [stableId("phase83-redirect", key), batch, action, sourcePath, targetPath] });
}

async function enforceMaker(tx: Transaction, penId: string, brandId: string, reason: string): Promise<void> {
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [penId, brandId] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase83-made-by", `${penId}:${brandId}`), penId, brandId, reason] });
  const maker = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [penId] });
  if (maker.rows.length !== 1 || String(maker.rows[0]?.target_id) !== brandId) throw new Error(`Phase 83 maker topology remains ambiguous for ${penId}.`);
}

async function ensureIdentity(client: Client): Promise<{ excellenceA2: string; elox: string; momentoZero: string; mzgMosaico: string }> {
  const tx = await client.transaction("write");
  try {
    const brands = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id IN (?, ?)", args: [PHASE83_DIPLOMAT_BRAND_ID, PHASE83_LEONARDO_BRAND_ID] });
    if (brands.rows.length !== 2 || brands.rows.some((row) => String(row.type) !== "brand")) throw new Error("Phase 83 requires the exact existing Diplomat and Leonardo brand identities.");
    const definitions: Record<string, ExactDefinition> = {
      excellenceA2: { fallbackId: PHASE83_EXCELLENCE_A2_FALLBACK_ID, slug: PHASE83_SLUGS.excellenceA2, name: "Diplomat Excellence A2", aliases: ["Excellence A2", "迪普洛玛 卓越 A2"], brandId: PHASE83_DIPLOMAT_BRAND_ID },
      elox: { fallbackId: PHASE83_ELOX_FALLBACK_ID, slug: PHASE83_SLUGS.elox, name: "Diplomat Elox", aliases: ["Elox", "迪普洛玛 Elox"], brandId: PHASE83_DIPLOMAT_BRAND_ID },
      momentoZero: { fallbackId: PHASE83_MOMENTO_ZERO_FALLBACK_ID, slug: PHASE83_SLUGS.momentoZero, name: "Leonardo Momento Zero", aliases: ["Momento Zero", "Leonardo MZ", "莱昂纳多 Momento Zero"], brandId: PHASE83_LEONARDO_BRAND_ID },
      mzgMosaico: { fallbackId: PHASE83_MZG_MOSAICO_FALLBACK_ID, slug: PHASE83_SLUGS.mzgMosaico, name: "Leonardo Momento Zero Grande Mosaico", aliases: ["Leonardo MZG Mosaico", "MZG Mosaico", "Momento Zero Grande Mosaico"], brandId: PHASE83_LEONARDO_BRAND_ID },
    };
    const resolved: Record<string, ExactResolved> = {};
    for (const [key, definition] of Object.entries(definitions)) {
      const item = await resolveExactPen(tx, definition);
      if (!item.created) await installRename(tx, item.id, item.sourceSlug, definition.slug);
      await enforceMaker(tx, item.id, definition.brandId, `Phase 83 exact ${definition.name} maker topology`);
      resolved[key] = item;
    }
    await tx.commit();
    return { excellenceA2: resolved.excellenceA2!.id, elox: resolved.elox!.id, momentoZero: resolved.momentoZero!.id, mzgMosaico: resolved.mzgMosaico!.id };
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

async function ensurePublicBrandNavigation(client: Client, brandId: string): Promise<void> {
  const pens = await client.execute({ sql: "SELECT pen.id FROM public_entities pen JOIN entity_links maker ON maker.source_id = pen.id AND maker.target_id = ? AND maker.link_type = 'made_by' WHERE pen.type = 'pen' ORDER BY pen.id", args: [brandId] });
  const tx = await client.transaction("write");
  try {
    for (const row of pens.rows) { const penId = String(row.id); await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase83-reverse", `${brandId}:${penId}`), brandId, penId, "Phase 83 public brand-to-model navigation repair"] }); }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
  const missing = await client.execute({ sql: "SELECT pen.slug FROM public_entities pen JOIN entity_links maker ON maker.source_id = pen.id AND maker.target_id = ? AND maker.link_type = 'made_by' LEFT JOIN entity_links reverse ON reverse.source_id = ? AND reverse.target_id = pen.id AND reverse.link_type = 'reverse' WHERE pen.type = 'pen' GROUP BY pen.id, pen.slug HAVING count(reverse.id) <> 1 ORDER BY pen.slug", args: [brandId, brandId] });
  if (missing.rows.length) throw new Error(`Phase 83 has incomplete public model navigation: ${missing.rows.map((row) => String(row.slug)).join(", ")}.`);
}

export async function applyPhase83DiplomatLeonardoContent(client: Client, options: ApplyPhase83Options): Promise<ApplyPhase83Result> {
  await assertOwned(client, options);
  const ids = await ensureIdentity(client);
  const packs = phase83DiplomatLeonardoPacks(ids);
  const groups = [PHASE83_DIPLOMAT_BRAND_ID, PHASE83_LEONARDO_BRAND_ID].map((brandId) =>
    packs.filter((pack) => pack.entityId === brandId || pack.spec?.brandEntityId === brandId),
  );
  const entities: ApplyPhase22Result["entities"] = [];
  for (const group of groups) {
    const result = await applyCuratedContentPacks(client, options, structuredClone(group));
    entities.push(...result.entities);
  }
  await ensurePublicBrandNavigation(client, PHASE83_DIPLOMAT_BRAND_ID);
  await ensurePublicBrandNavigation(client, PHASE83_LEONARDO_BRAND_ID);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities };
}

function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = cliValue("--database"); const ownedRoot = cliValue("--owned-root"); const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase83-diplomat-leonardo-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client"); const client = createClient({ url: `file:${path.resolve(database)}` });
  try { process.stdout.write(`${JSON.stringify(await applyPhase83DiplomatLeonardoContent(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase83-diplomat-leonardo", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
