import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import {
  PHASE52_LAMY_2000_ID,
  PHASE52_LAMY_BRAND_ID,
  PHASE52_PLATINUM_3776_ID,
  PHASE52_PLATINUM_BRAND_ID,
  phase52LamyPlatinumCorePacks,
} from "./data/phase52-lamy-platinum-core";

export type ApplyPhase52Options = ApplyPhase22Options;
export type ApplyPhase52Result = ApplyPhase22Result;
const OLD_LAMY_2000_SLUG = "凌美-lamy-lamy-2000";
const OLD_PLATINUM_3776_SLUG = "白金-platinum-3776-century";

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
    if (env[key]?.trim()) throw new Error(`Phase 52 refuses inherited remote selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase52Options): Promise<void> {
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
    throw new Error("Phase 52 owned catalog authority check failed.");
  }
  const own = fs.statSync(databasePath, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) {
    throw new Error("Phase 52 refuses protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 52 client is not bound to owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 52 owned copy must be migrated through 032.");
}

async function installRedirect(
  tx: Awaited<ReturnType<Client["transaction"]>>,
  input: { sourcePath: string; targetPath: string; actionId: string; batchId: string },
): Promise<void> {
  const existing = await tx.execute({
    sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
    args: [input.sourcePath],
  });
  if (existing.rows.length > 0) {
    if (
      String(existing.rows[0]?.target_path ?? "") !== input.targetPath ||
      String(existing.rows[0]?.redirect_kind ?? "") !== "permanent"
    ) {
      throw new Error(`Phase 52 conflicting redirect for ${input.sourcePath}.`);
    }
    return;
  }
  await tx.execute({
    sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_normalization')",
    args: [
      stableId("phase52-redirect", input.sourcePath),
      input.batchId,
      input.actionId,
      input.sourcePath,
      input.targetPath,
    ],
  });
}

async function renameEntity(
  tx: Awaited<ReturnType<Client["transaction"]>>,
  input: { key: string; id: string; oldSlug: string; newSlug: string; name: string },
): Promise<void> {
  const row = await tx.execute({ sql: "SELECT id, type, slug FROM entities WHERE id = ?", args: [input.id] });
  if (row.rows.length !== 1 || String(row.rows[0]?.type) !== "pen") {
    throw new Error(`Phase 52 entity missing: ${input.id}`);
  }
  const currentSlug = String(row.rows[0]?.slug ?? "");
  if (currentSlug !== input.newSlug) {
    const collision = await tx.execute({
      sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?",
      args: [input.newSlug, input.id],
    });
    if (collision.rows.length > 0) throw new Error(`Phase 52 slug collision: ${input.newSlug}`);
    const batchId = stableId("phase52-batch", input.key);
    const actionId = stableId("phase52-action", input.key);
    await tx.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)",
      args: [batchId, input.key, digest(input.key), `Normalize ${input.name} canonical slug.`],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)",
      args: [
        actionId,
        batchId,
        input.key,
        digest(`${input.key}\0${input.id}`),
        input.id,
        input.id,
        `Normalize ${input.name} canonical slug.`,
      ],
    });
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)",
      args: [stableId("phase52-lineage", input.key), batchId, actionId, input.id, input.id],
    });
    await tx.execute({
      sql: "UPDATE entities SET slug = ?, name = ?, updated_at = datetime('now') WHERE id = ?",
      args: [input.newSlug, input.name, input.id],
    });
    await installRedirect(tx, {
      sourcePath: `/pen/${input.oldSlug}`,
      targetPath: `/pen/${input.newSlug}`,
      actionId,
      batchId,
    });
    return;
  }
  const batchId = stableId("phase52-batch", input.key);
  const actionId = stableId("phase52-action", input.key);
  await tx.execute({
    sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)",
    args: [batchId, input.key, digest(input.key), `Canonical slug already normalized for ${input.name}.`],
  });
  await tx.execute({
    sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)",
    args: [
      actionId,
      batchId,
      input.key,
      digest(`${input.key}\0${input.id}`),
      input.id,
      input.id,
      `Canonical slug already normalized for ${input.name}.`,
    ],
  });
  await installRedirect(tx, {
    sourcePath: `/pen/${input.oldSlug}`,
    targetPath: `/pen/${input.newSlug}`,
    actionId,
    batchId,
  });
}

async function ensureTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brands = await tx.execute({
      sql: "SELECT id, type FROM entities WHERE id IN (?, ?)",
      args: [PHASE52_LAMY_BRAND_ID, PHASE52_PLATINUM_BRAND_ID],
    });
    if (brands.rows.length !== 2 || brands.rows.some((row) => String(row?.type) !== "brand")) {
      throw new Error("Phase 52 LAMY/Platinum brand identity set is incomplete.");
    }
    await renameEntity(tx, {
      key: "phase52-lamy-2000-rename",
      id: PHASE52_LAMY_2000_ID,
      oldSlug: OLD_LAMY_2000_SLUG,
      newSlug: "lamy-2000",
      name: "LAMY 2000",
    });
    await renameEntity(tx, {
      key: "phase52-platinum-3776-rename",
      id: PHASE52_PLATINUM_3776_ID,
      oldSlug: OLD_PLATINUM_3776_SLUG,
      newSlug: "platinum-3776-century",
      name: "Platinum #3776 Century",
    });
    for (const [penId, brandId] of [
      [PHASE52_LAMY_2000_ID, PHASE52_LAMY_BRAND_ID],
      [PHASE52_PLATINUM_3776_ID, PHASE52_PLATINUM_BRAND_ID],
    ] as const) {
      await tx.execute({
        sql: "DELETE FROM entity_links WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?",
        args: [penId, brandId],
      });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'made_by', ?)",
        args: [stableId("phase52-link", `${penId}:made_by:${brandId}`), penId, brandId, "Phase 52 canonical maker topology"],
      });
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase52LamyPlatinumCoreContent(
  client: Client,
  options: ApplyPhase52Options,
): Promise<ApplyPhase52Result> {
  await assertOwned(client, options);
  await ensureTopology(client);
  const packs = structuredClone(phase52LamyPlatinumCorePacks);
  const lamyIds = new Set([PHASE52_LAMY_BRAND_ID, PHASE52_LAMY_2000_ID]);
  const platinumIds = new Set([PHASE52_PLATINUM_BRAND_ID, PHASE52_PLATINUM_3776_ID]);
  const entities: ApplyPhase52Result["entities"] = [];
  for (const group of [packs.filter((pack) => lamyIds.has(pack.entityId)), packs.filter((pack) => platinumIds.has(pack.entityId))]) {
    const result = await applyCuratedContentPacks(client, options, group);
    entities.push(...result.entities);
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities };
}
