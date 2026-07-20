import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import {
  PHASE81_JAZZ_FALLBACK_ID,
  PHASE81_JAZZ_SLUG,
  PHASE81_OPUS_BRAND_ID,
  phase81Opus88JazzPacks,
} from "./data/phase81-opus88-jazz";

export type ApplyPhase81Options = ApplyPhase22Options;
export type ApplyPhase81Result = ApplyPhase22Result;

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
    if (env[key]?.trim()) throw new Error(`Phase 81 refuses inherited remote selection: ${key}.`);
  }
}

async function assertOwnedCatalog(client: Client, options: ApplyPhase81Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(database).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(database, ownedRoot)) {
    throw new Error("Phase 81 owned catalog authority check failed.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (database === protectedCatalog || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) {
    throw new Error("Phase 81 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 81 client is not bound to the caller-owned copy.");
  }
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 81 owned copy must be migrated through 032.");
}

async function ensureBrand(tx: Transaction): Promise<void> {
  const brand = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE81_OPUS_BRAND_ID] });
  if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "opus88") {
    throw new Error("Phase 81 requires the existing Opus 88 brand identity.");
  }
}

type JazzIdentity = { id: string; oldSlug: string | null; created: boolean };

async function resolveJazz(tx: Transaction): Promise<JazzIdentity> {
  const candidates = await tx.execute({
    sql: `SELECT id, slug, name FROM entities
      WHERE type = 'pen' AND (
        slug IN (?, ?, ?, ?)
        OR lower(trim(name)) IN (?, ?, ?, ?)
      ) ORDER BY id`,
    args: [
      PHASE81_JAZZ_SLUG,
      "opus88-jazz",
      "欧品-opus88-jazz",
      "欧品-opus-88-jazz",
      "opus 88 jazz",
      "opus88 jazz",
      "欧品 opus 88 jazz",
      "欧品opus88 jazz",
    ],
  });
  if (candidates.rows.length > 1) {
    throw new Error("Phase 81 found more than one exact Opus 88 Jazz candidate; resolve the duplicate before publishing.");
  }
  if (candidates.rows.length === 0) {
    const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE id = ? OR slug = ?", args: [PHASE81_JAZZ_FALLBACK_ID, PHASE81_JAZZ_SLUG] });
    if (collision.rows.length) throw new Error("Phase 81 Jazz fallback identity collides with an existing entity.");
    await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [PHASE81_JAZZ_FALLBACK_ID, PHASE81_JAZZ_SLUG, "Opus 88 Jazz"] });
    return { id: PHASE81_JAZZ_FALLBACK_ID, oldSlug: null, created: true };
  }
  const candidate = candidates.rows[0]!;
  const id = String(candidate.id);
  const oldSlug = String(candidate.slug);
  if (oldSlug === "opus-88-demo-kolora") throw new Error("Phase 81 refuses to use the retired mixed Demo/Kolora route for Jazz.");
  const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?", args: [PHASE81_JAZZ_SLUG, id] });
  if (collision.rows.length) throw new Error("Phase 81 Jazz canonical slug is occupied by another entity.");
  if (oldSlug !== PHASE81_JAZZ_SLUG) {
    await tx.execute({ sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?", args: [PHASE81_JAZZ_SLUG, "Opus 88 Jazz", id] });
  } else {
    await tx.execute({ sql: "UPDATE entities SET name = ?, updated_at = datetime('now') WHERE id = ?", args: ["Opus 88 Jazz", id] });
  }
  return { id, oldSlug, created: false };
}

async function linkMaker(tx: Transaction, jazzId: string): Promise<void> {
  await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?", args: [jazzId, PHASE81_OPUS_BRAND_ID] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)", args: [stableId("phase81-jazz-made-by", jazzId), jazzId, PHASE81_OPUS_BRAND_ID, "Phase 81 exact Opus 88 Jazz maker relation"] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)", args: [stableId("phase81-opus88-jazz-reverse", jazzId), PHASE81_OPUS_BRAND_ID, jazzId, "Phase 81 Opus 88-to-Jazz navigation"] });
  const makers = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [jazzId] });
  if (makers.rows.length !== 1 || String(makers.rows[0]?.target_id) !== PHASE81_OPUS_BRAND_ID) {
    throw new Error("Phase 81 Jazz maker topology is ambiguous.");
  }
}

async function synchronizeBrandNavigation(tx: Transaction): Promise<void> {
  const models = await tx.execute({
    sql: `SELECT e.id
            FROM entities e
            JOIN entity_links maker
              ON maker.source_id = e.id
             AND maker.target_id = ?
             AND maker.link_type = 'made_by'
           WHERE e.type = 'pen'
           ORDER BY e.id`,
    args: [PHASE81_OPUS_BRAND_ID],
  });
  for (const row of models.rows) {
    const modelId = String(row.id);
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)",
      args: [
        stableId("phase81-opus88-reverse", modelId),
        PHASE81_OPUS_BRAND_ID,
        modelId,
        "Phase 81 Opus 88 brand-to-model navigation for every exact maker relation",
      ],
    });
  }
  const missing = await tx.execute({
    sql: `SELECT count(*) AS value
            FROM entity_links maker
       LEFT JOIN entity_links reverse
              ON reverse.source_id = ?
             AND reverse.target_id = maker.source_id
             AND reverse.link_type = 'reverse'
           WHERE maker.target_id = ? AND maker.link_type = 'made_by' AND reverse.id IS NULL`,
    args: [PHASE81_OPUS_BRAND_ID, PHASE81_OPUS_BRAND_ID],
  });
  if (Number(missing.rows[0]?.value ?? 0) !== 0) {
    throw new Error("Phase 81 could not make every Opus 88 model visible from the brand relation.");
  }
}

async function installRenameRedirect(tx: Transaction, input: JazzIdentity): Promise<void> {
  if (input.created || !input.oldSlug || input.oldSlug === PHASE81_JAZZ_SLUG) return;
  const source = `/pen/${input.oldSlug}`;
  const target = `/pen/${PHASE81_JAZZ_SLUG}`;
  const batchKey = "phase81-opus88-jazz-route-rename";
  const batchId = stableId("phase81-batch", batchKey);
  const actionId = stableId("phase81-action", `${input.id}:${input.oldSlug}`);
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)", args: [batchId, batchKey, digest(batchKey), "Rename only a verified exact Opus 88 Jazz row; the old Demo/Kolora mixed route remains unredirected."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)", args: [actionId, batchId, input.oldSlug, digest(`${input.id}:${input.oldSlug}:${PHASE81_JAZZ_SLUG}`), input.id, input.id, "Canonicalize only the exact Jazz route; no Demo, Koloro, Omar or Opera merge."] });
  await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)", args: [stableId("phase81-lineage", input.id), batchId, actionId, input.id, input.id] });
  const existing = await tx.execute({ sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?", args: [source] });
  if (existing.rows.length === 0) {
    await tx.execute({ sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')", args: [stableId("phase81-redirect", source), batchId, actionId, source, target] });
  } else if (existing.rows.length !== 1 || String(existing.rows[0]?.target_path) !== target || String(existing.rows[0]?.redirect_kind) !== "permanent") {
    throw new Error("Phase 81 Jazz old route is occupied by a conflicting redirect.");
  }
}

async function prepareTopology(client: Client): Promise<string> {
  const tx = await client.transaction("write");
  try {
    await ensureBrand(tx);
    const jazz = await resolveJazz(tx);
    await linkMaker(tx, jazz.id);
    await synchronizeBrandNavigation(tx);
    await installRenameRedirect(tx, jazz);
    await tx.commit();
    return jazz.id;
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase81Opus88JazzContent(client: Client, options: ApplyPhase81Options): Promise<ApplyPhase81Result> {
  await assertOwnedCatalog(client, options);
  const jazzId = await prepareTopology(client);
  const result = await applyCuratedContentPacks(client, options, structuredClone(phase81Opus88JazzPacks(jazzId)));
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
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase81-opus88-jazz-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase81Opus88JazzContent(client, {
      workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase81-opus88-jazz", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" },
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally { client.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
