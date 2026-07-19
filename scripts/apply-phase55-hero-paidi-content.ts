import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import {
  PHASE55_HERO_849_ID,
  PHASE55_HERO_849_SLUG,
  PHASE55_HERO_850_ID,
  PHASE55_HERO_850_SLUG,
  PHASE55_HERO_BRAND_ID,
  PHASE55_MIXED_OLD_SLUG,
  PHASE55_MIXED_PEN_ID,
  PHASE55_PAIDI_BRAND_ID,
  PHASE55_PAIDI_CENTURY_1_ID,
  PHASE55_PAIDI_CENTURY_1_SLUG,
  phase55HeroPaidiPacks,
} from "./data/phase55-hero-paidi";

export type ApplyPhase55Options = ApplyPhase22Options;
export type ApplyPhase55Result = ApplyPhase22Result;

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
    if (env[key]?.trim()) throw new Error(`Phase 55 refuses inherited remote selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase55Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !isInside(databasePath, ownedRoot)
  ) {
    throw new Error("Phase 55 owned catalog authority check failed.");
  }
  const own = fs.statSync(databasePath, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) {
    throw new Error("Phase 55 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 55 client is not bound to owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 55 owned copy must be migrated through 032.");
}

async function recordAction(
  tx: Transaction,
  input: { key: string; sourceId: string; targetId: string; note: string },
): Promise<{ batchId: string; actionId: string }> {
  const batchId = stableId("phase55-batch", input.key);
  const actionId = stableId("phase55-action", input.key);
  await tx.execute({
    sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)",
    args: [batchId, input.key, digest(input.key), input.note],
  });
  await tx.execute({
    sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'retire', ?, ?, ?, 'applied', ?)",
    args: [actionId, batchId, input.key, digest(`${input.key}\0${input.sourceId}\0${input.targetId}`), input.sourceId, input.targetId, input.note],
  });
  await tx.execute({
    sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'retire', NULL)",
    args: [stableId("phase55-lineage", input.key), batchId, actionId, input.sourceId, input.targetId],
  });
  return { batchId, actionId };
}

async function installRedirect(
  tx: Transaction,
  input: { sourcePath: string; targetPath: string; actionId: string; batchId: string },
): Promise<void> {
  const existing = await tx.execute({
    sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
    args: [input.sourcePath],
  });
  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    if (String(row?.target_path ?? "") !== input.targetPath || String(row?.redirect_kind ?? "") !== "permanent") {
      throw new Error(`Phase 55 conflicting redirect for ${input.sourcePath}.`);
    }
    return;
  }
  await tx.execute({
    sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'mixed_identity_retired_to_concrete_canonical')",
    args: [stableId("phase55-redirect", input.sourcePath), input.batchId, input.actionId, input.sourcePath, input.targetPath],
  });
}

async function ensureEntity(
  tx: Transaction,
  input: { id: string; slug: string; name: string; brandId: string },
): Promise<void> {
  const existing = await tx.execute({
    sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id",
    args: [input.id, input.slug],
  });
  if (existing.rows.length === 0) {
    await tx.execute({ sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)", args: [input.id, input.slug, input.name] });
  } else if (
    existing.rows.length !== 1 ||
    String(existing.rows[0]?.id) !== input.id ||
    String(existing.rows[0]?.type) !== "pen" ||
    String(existing.rows[0]?.slug) !== input.slug
  ) {
    throw new Error(`Phase 55 entity/slug collision: ${input.id}/${input.slug}`);
  }
  await tx.execute({
    sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?",
    args: [input.id, input.brandId],
  });
  await tx.execute({
    sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)",
    args: [stableId("phase55-link", `${input.id}:made_by:${input.brandId}`), input.id, input.brandId, "Phase 55 canonical Hero/Paidi maker topology"],
  });
  const madeBy = await tx.execute({
    sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'",
    args: [input.id],
  });
  if (madeBy.rows.length !== 1 || String(madeBy.rows[0]?.target_id) !== input.brandId) {
    throw new Error(`Phase 55 canonical made_by link is missing or ambiguous: ${input.id}`);
  }
}

async function ensureIdentity(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brands = await tx.execute({
      sql: "SELECT id, type, slug FROM entities WHERE id IN (?, ?)",
      args: [PHASE55_HERO_BRAND_ID, PHASE55_PAIDI_BRAND_ID],
    });
    if (
      brands.rows.length !== 2 ||
      brands.rows.some((row) => String(row?.type) !== "brand") ||
      brands.rows.some((row) => (String(row?.id) === PHASE55_HERO_BRAND_ID && String(row?.slug) !== "hero")) ||
      brands.rows.some((row) => (String(row?.id) === PHASE55_PAIDI_BRAND_ID && String(row?.slug) !== "hero-paddy"))
    ) {
      throw new Error("Phase 55 Hero/Paidi brand identity set is incomplete.");
    }
    const mixed = await tx.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [PHASE55_MIXED_PEN_ID] });
    if (mixed.rows.length !== 1 || String(mixed.rows[0]?.type) !== "pen" || String(mixed.rows[0]?.slug) !== PHASE55_MIXED_OLD_SLUG) {
      throw new Error("Phase 55 mixed Hero/Paidi identity mismatch.");
    }

    await ensureEntity(tx, { id: PHASE55_HERO_849_ID, slug: PHASE55_HERO_849_SLUG, name: "英雄 Hero 849", brandId: PHASE55_HERO_BRAND_ID });
    await ensureEntity(tx, { id: PHASE55_HERO_850_ID, slug: PHASE55_HERO_850_SLUG, name: "英雄 Hero 850", brandId: PHASE55_HERO_BRAND_ID });
    await ensureEntity(tx, { id: PHASE55_PAIDI_CENTURY_1_ID, slug: PHASE55_PAIDI_CENTURY_1_SLUG, name: "英雄派迪 Paidi Century 1", brandId: PHASE55_PAIDI_BRAND_ID });

    const action = await recordAction(tx, {
      key: "phase55-mixed-hero-paidi-retire",
      sourceId: PHASE55_MIXED_PEN_ID,
      targetId: PHASE55_PAIDI_CENTURY_1_ID,
      note: "Retire mixed Hero/Paidi integrated-nib placeholder and route to concrete Paidi Century 1.",
    });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [PHASE55_MIXED_PEN_ID] });
    await tx.execute({
      sql: "UPDATE entity_publications SET status = 'retired', blockers_json = ?, approved_content_hash = NULL, reviewed_content_revision = NULL, reviewed_contract_version = NULL, reviewed_by = NULL, reviewed_at = NULL, published_at = NULL, review_notes = ?, updated_at = datetime('now') WHERE entity_id = ? AND status <> 'retired'",
      args: ['["identity_mixed_made_by"]', "Phase 55 mixed identity retired; use Hero 849, Hero 850 or Paidi Century 1 canonical pages.", PHASE55_MIXED_PEN_ID],
    });
    await installRedirect(tx, { sourcePath: `/pen/${PHASE55_MIXED_OLD_SLUG}`, targetPath: `/pen/${PHASE55_PAIDI_CENTURY_1_SLUG}`, actionId: action.actionId, batchId: action.batchId });
    const retiredLinks = await tx.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'", args: [PHASE55_MIXED_PEN_ID] });
    if (retiredLinks.rows.length !== 0) throw new Error("Phase 55 mixed identity still has made_by links.");
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase55HeroPaidiContent(
  client: Client,
  options: ApplyPhase55Options,
): Promise<ApplyPhase55Result> {
  await assertOwned(client, options);
  await ensureIdentity(client);
  const packs = structuredClone(phase55HeroPaidiPacks);
  const heroIds = new Set([PHASE55_HERO_BRAND_ID, PHASE55_HERO_849_ID, PHASE55_HERO_850_ID]);
  const paidiIds = new Set([PHASE55_PAIDI_BRAND_ID, PHASE55_PAIDI_CENTURY_1_ID]);
  const entities: ApplyPhase55Result["entities"] = [];
  for (const group of [packs.filter((pack) => heroIds.has(pack.entityId)), packs.filter((pack) => paidiIds.has(pack.entityId))]) {
    const result = await applyCuratedContentPacks(client, options, group);
    entities.push(...result.entities);
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities };
}
