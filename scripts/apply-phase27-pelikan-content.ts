import type { Client } from "@libsql/client";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import { phase27PelikanPacks } from "./data/phase27-pelikan";

export type ApplyPhase27PelikanOptions = ApplyPhase22Options;
export type ApplyPhase27PelikanResult = ApplyPhase22Result;

const LEGACY_M800_ID = "rKSjyWghpB8Y";
const LEGACY_M800_SLUG = "百利金-pelikan-m800";

async function retireLegacyM800(client: Client): Promise<void> {
  const legacy = await client.execute({
    sql: `SELECT entity.type, entity.slug, publication.status
            FROM entities entity
            JOIN entity_publications publication ON publication.entity_id = entity.id
           WHERE entity.id = ?`,
    args: [LEGACY_M800_ID],
  });
  if (
    legacy.rows.length !== 1 ||
    String(legacy.rows[0]?.type) !== "pen" ||
    String(legacy.rows[0]?.slug) !== LEGACY_M800_SLUG
  ) {
    throw new Error("Phase 27 legacy M800 identity mismatch.");
  }
  if (String(legacy.rows[0]?.status) === "retired") return;

  const retired = await client.execute({
    sql: `UPDATE entity_publications
             SET status = 'retired', blockers_json = '["canonical_redirect"]',
                 approved_content_hash = NULL, reviewed_content_revision = NULL,
                 reviewed_contract_version = NULL, reviewed_by = NULL,
                 reviewed_at = NULL, published_at = NULL,
                 review_notes = 'Phase 27 canonical M800 redirect: /pen/pelikan-souveran-m800',
                 updated_at = datetime('now')
           WHERE entity_id = ? AND status != 'retired'`,
    args: [LEGACY_M800_ID],
  });
  if (retired.rowsAffected !== 1) {
    throw new Error("Phase 27 failed to retire the legacy M800 identity.");
  }
}

export async function applyPhase27PelikanContent(
  client: Client,
  options: ApplyPhase27PelikanOptions,
): Promise<ApplyPhase27PelikanResult> {
  const result = await applyCuratedContentPacks(
    client,
    options,
    phase27PelikanPacks,
  );
  await retireLegacyM800(client);
  return result;
}
