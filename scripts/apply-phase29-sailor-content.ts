import type { Client } from "@libsql/client";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import { phase29SailorPacks } from "./data/phase29-sailor";

export type ApplyPhase29SailorOptions = ApplyPhase22Options;
export type ApplyPhase29SailorResult = ApplyPhase22Result;

const PEN_ID = "GXGa7rK83Jmi";
const LEGACY_SLUG = "写乐-sailor-1219标准鱼雷";
const CANONICAL_SLUG = "sailor-1911-standard";

async function canonicalizePenSlug(client: Client): Promise<boolean> {
  const rows = await client.execute({
    sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id",
    args: [PEN_ID, CANONICAL_SLUG],
  });
  const pen = rows.rows.find((row) => String(row.id) === PEN_ID);
  if (!pen || String(pen.type) !== "pen") {
    throw new Error(`Phase 29 missing canonical pen identity: ${PEN_ID}`);
  }
  const collision = rows.rows.find(
    (row) =>
      String(row.slug) === CANONICAL_SLUG && String(row.id) !== PEN_ID,
  );
  if (collision) {
    throw new Error(
      `Phase 29 canonical slug collision: ${CANONICAL_SLUG} belongs to ${String(collision.id)}`,
    );
  }
  const currentSlug = String(pen.slug);
  if (currentSlug === CANONICAL_SLUG) return false;
  if (currentSlug !== LEGACY_SLUG) {
    throw new Error(`Phase 29 unexpected Sailor pen slug: ${currentSlug}`);
  }
  const updated = await client.execute({
    sql: "UPDATE entities SET slug = ?, updated_at = datetime('now') WHERE id = ? AND type = 'pen' AND slug = ?",
    args: [CANONICAL_SLUG, PEN_ID, LEGACY_SLUG],
  });
  if (updated.rowsAffected !== 1) {
    throw new Error("Phase 29 failed to canonicalize the Sailor 11-1219 slug.");
  }
  return true;
}

async function restoreLegacySlug(client: Client): Promise<void> {
  const restored = await client.execute({
    sql: "UPDATE entities SET slug = ?, updated_at = datetime('now') WHERE id = ? AND type = 'pen' AND slug = ?",
    args: [LEGACY_SLUG, PEN_ID, CANONICAL_SLUG],
  });
  if (restored.rowsAffected !== 1) {
    throw new Error(
      "Phase 29 apply failed and the temporary Sailor slug change could not be restored.",
    );
  }
}

export async function applyPhase29SailorContent(
  client: Client,
  options: ApplyPhase29SailorOptions,
): Promise<ApplyPhase29SailorResult> {
  const renamed = await canonicalizePenSlug(client);
  try {
    return await applyCuratedContentPacks(client, options, phase29SailorPacks);
  } catch (error) {
    if (renamed) await restoreLegacySlug(client);
    throw error;
  }
}
