import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  PHASE31_PRO_GEAR_ID,
  PHASE31_PROFIT_14_ID,
  PHASE31_PROFIT_18_ID,
  PHASE31_RETIRED_PRO_GEAR_ID,
  PHASE31_SAILOR_BRAND_ID,
  phase31SailorP0Packs,
} from "./data/phase31-sailor-p0";

export type ApplyPhase31SailorP0Options = ApplyPhase22Options;
export type ApplyPhase31SailorP0Result = ApplyPhase22Result;

const PRO_GEAR_SLUG = "sailor-pro-gear";
const RETIRED_PRO_GEAR_SLUG = "写乐-sailor-21k-pro-gear-大鱼雷";
const PROFIT_14_SLUG = "sailor-profit-14";
const PROFIT_18_SLUG = "sailor-profit-18";
const RETIRED_BLOCKERS = '["canonical_redirect"]';
const RETIRED_REVIEW_NOTE =
  "Phase 31 retired duplicate Professional Gear identity; permanent redirect to /pen/sailor-pro-gear; no payload migrated.";

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableId(prefix: string, value: string): string {
  return `${prefix}-${digest(value).slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative !== "" &&
    !relative.startsWith("..") &&
    !path.isAbsolute(relative)
  );
}

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(
        `Phase 31 refuses inherited remote database selection: ${key}.`,
      );
    }
  }
}

async function assertOwnedPhase31Catalog(
  client: Client,
  options: ApplyPhase31SailorP0Options,
): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);

  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile()
  ) {
    throw new Error(
      "Phase 31 owned catalog authority is not a regular local copy.",
    );
  }
  if (fs.lstatSync(options.databasePath).isSymbolicLink()) {
    throw new Error("Phase 31 owned catalog must not be a symlink.");
  }
  if (!isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 31 database must remain inside the caller-owned root.");
  }
  const ownedStat = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    (ownedStat.dev === protectedStat.dev && ownedStat.ino === protectedStat.ino)
  ) {
    throw new Error(
      "Phase 31 refuses the protected catalog and hard-link aliases.",
    );
  }

  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  const clientPath = main?.file
    ? fs.realpathSync.native(String(main.file))
    : null;
  if (clientPath !== databasePath) {
    throw new Error(
      "Phase 31 client is not bound to the authorized owned copy.",
    );
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error(
      "Phase 31 owned copy must be migrated through 032 before apply.",
    );
  }
}

async function assertIdentity(
  transaction: Transaction,
  entityId: string,
  expectedType: string,
  expectedSlug: string,
): Promise<void> {
  const result = await transaction.execute({
    sql: "SELECT type, slug FROM entities WHERE id = ?",
    args: [entityId],
  });
  const row = result.rows[0];
  if (
    !row ||
    String(row.type) !== expectedType ||
    String(row.slug) !== expectedSlug
  ) {
    throw new Error(
      `Phase 31 identity mismatch for ${entityId}: ${String(row?.type ?? "missing")}/${String(row?.slug ?? "missing")}`,
    );
  }
}

async function ensurePenEntity(
  transaction: Transaction,
  input: { id: string; slug: string; name: string },
): Promise<void> {
  const existing = await transaction.execute({
    sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id",
    args: [input.id, input.slug],
  });
  if (existing.rows.length === 0) {
    const inserted = await transaction.execute({
      sql: "INSERT INTO entities (id, type, slug, name) VALUES (?, 'pen', ?, ?)",
      args: [input.id, input.slug, input.name],
    });
    if (inserted.rowsAffected !== 1) {
      throw new Error(`Phase 31 failed to create ${input.slug}.`);
    }
    return;
  }
  if (
    existing.rows.length !== 1 ||
    String(existing.rows[0]?.id) !== input.id ||
    String(existing.rows[0]?.type) !== "pen" ||
    String(existing.rows[0]?.slug) !== input.slug
  ) {
    throw new Error(`Phase 31 entity/slug collision for ${input.slug}.`);
  }
}

async function ensureExactlyOneSailorMaker(
  transaction: Transaction,
  entityId: string,
): Promise<void> {
  await transaction.execute({
    sql: `DELETE FROM entity_links
           WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?`,
    args: [entityId, PHASE31_SAILOR_BRAND_ID],
  });
  await transaction.execute({
    sql: `DELETE FROM entity_links
           WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'
             AND id <> (
               SELECT min(id) FROM entity_links
                WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'
             )`,
    args: [
      entityId,
      PHASE31_SAILOR_BRAND_ID,
      entityId,
      PHASE31_SAILOR_BRAND_ID,
    ],
  });
  const current = await transaction.execute({
    sql: `SELECT count(*) AS total FROM entity_links
           WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
    args: [entityId, PHASE31_SAILOR_BRAND_ID],
  });
  if (Number(current.rows[0]?.total ?? 0) === 0) {
    await transaction.execute({
      sql: `INSERT INTO entity_links (id, source_id, target_id, link_type, reason)
            VALUES (?, ?, ?, 'made_by', 'Phase 31 canonical Sailor maker')`,
      args: [
        stableId("phase31-link", `${entityId}:made_by:${PHASE31_SAILOR_BRAND_ID}`),
        entityId,
        PHASE31_SAILOR_BRAND_ID,
      ],
    });
  }
  const verified = await transaction.execute({
    sql: `SELECT count(*) AS total FROM entity_links
           WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
    args: [entityId, PHASE31_SAILOR_BRAND_ID],
  });
  if (Number(verified.rows[0]?.total ?? 0) !== 1) {
    throw new Error(`Phase 31 ${entityId} must retain exactly one Sailor made_by.`);
  }
}

async function installPermanentRedirect(
  transaction: Transaction,
  input: {
    id: string;
    batchId: string;
    actionId: string;
    sourcePath: string;
    targetPath: string;
  },
): Promise<void> {
  const existing = await transaction.execute({
    sql: `SELECT redirect_kind, target_path
            FROM entity_redirects WHERE source_path = ?`,
    args: [input.sourcePath],
  });
  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    if (
      existing.rows.length !== 1 ||
      String(row?.redirect_kind) !== "permanent" ||
      String(row?.target_path) !== input.targetPath
    ) {
      throw new Error(`Phase 31 conflicting redirect for ${input.sourcePath}.`);
    }
    return;
  }
  await transaction.execute({
    sql: `INSERT INTO entity_redirects (
            id, batch_id, action_id, source_path, target_path,
            redirect_kind, fallback_reason
          ) VALUES (?, ?, ?, ?, ?, 'permanent', NULL)`,
    args: [
      input.id,
      input.batchId,
      input.actionId,
      input.sourcePath,
      input.targetPath,
    ],
  });
}

async function preparePhase31Topology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  const sourceKey = "phase31-sailor-p0-identity-v1";
  const batchId = stableId("taxonomy-batch", sourceKey);
  const actionId = stableId("taxonomy-action", sourceKey);
  const actionChecksum = digest(
    `${PHASE31_RETIRED_PRO_GEAR_ID}\0${PHASE31_PRO_GEAR_ID}\0retire\0${RETIRED_PRO_GEAR_SLUG}\0${PRO_GEAR_SLUG}`,
  );
  try {
    await assertIdentity(
      transaction,
      PHASE31_SAILOR_BRAND_ID,
      "brand",
      "sailor",
    );
    await assertIdentity(
      transaction,
      PHASE31_PRO_GEAR_ID,
      "pen",
      PRO_GEAR_SLUG,
    );
    await assertIdentity(
      transaction,
      PHASE31_RETIRED_PRO_GEAR_ID,
      "pen",
      RETIRED_PRO_GEAR_SLUG,
    );
    await ensurePenEntity(transaction, {
      id: PHASE31_PROFIT_14_ID,
      slug: PROFIT_14_SLUG,
      name: "Sailor Profit 14",
    });
    await ensurePenEntity(transaction, {
      id: PHASE31_PROFIT_18_ID,
      slug: PROFIT_18_SLUG,
      name: "Sailor Profit 18",
    });

    for (const entityId of [
      PHASE31_PRO_GEAR_ID,
      PHASE31_PROFIT_14_ID,
      PHASE31_PROFIT_18_ID,
    ]) {
      await ensureExactlyOneSailorMaker(transaction, entityId);
    }

    await transaction.execute({
      sql: `DELETE FROM media_assets
             WHERE id IN (
               'media-commons-b743b35c943997',
               'media-commons-c022ffa38969d0',
               'media-official-a2e066ea55bf93'
             )`,
    });
    await transaction.execute({
      sql: `DELETE FROM entity_references
             WHERE entity_id = ?
               AND source_item_id IN (
                 SELECT id FROM source_items
                  WHERE id = 'source-sailor-1911-1521-official'
                     OR url LIKE '%/11-1521/%'
               )`,
      args: [PHASE31_PRO_GEAR_ID],
    });

    await transaction.execute({
      sql: `DELETE FROM entity_links
             WHERE source_id = ? AND link_type = 'made_by'`,
      args: [PHASE31_RETIRED_PRO_GEAR_ID],
    });
    await transaction.execute({
      sql: `DELETE FROM entity_links
             WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'`,
      args: [PHASE31_SAILOR_BRAND_ID, PHASE31_RETIRED_PRO_GEAR_ID],
    });
    await transaction.execute({
      sql: `UPDATE entity_publications
               SET status = 'retired', blockers_json = ?,
                   approved_content_hash = NULL,
                   reviewed_content_revision = NULL,
                   reviewed_contract_version = NULL,
                   reviewed_by = NULL, reviewed_at = NULL,
                   published_at = NULL, review_notes = ?,
                   updated_at = datetime('now')
             WHERE entity_id = ?
               AND (status <> 'retired' OR blockers_json <> ?
                    OR coalesce(review_notes, '') <> ?)`,
      args: [
        RETIRED_BLOCKERS,
        RETIRED_REVIEW_NOTE,
        PHASE31_RETIRED_PRO_GEAR_ID,
        RETIRED_BLOCKERS,
        RETIRED_REVIEW_NOTE,
      ],
    });

    await transaction.execute({
      sql: `INSERT OR IGNORE INTO taxonomy_batches (
              id, source_key, source_checksum, status, note
            ) VALUES (?, ?, ?, 'applied', ?)`,
      args: [
        batchId,
        sourceKey,
        digest(sourceKey),
        "Create Profit 14/18 identities and retire the duplicate Pro Gear without migrating its payload.",
      ],
    });
    await transaction.execute({
      sql: `INSERT OR IGNORE INTO taxonomy_actions (
              id, batch_id, source_row_key, action_kind, action_checksum,
              source_entity_id, target_entity_id, status, note
            ) VALUES (?, ?, ?, 'retire', ?, ?, ?, 'applied', ?)`,
      args: [
        actionId,
        batchId,
        PHASE31_RETIRED_PRO_GEAR_ID,
        actionChecksum,
        PHASE31_RETIRED_PRO_GEAR_ID,
        PHASE31_PRO_GEAR_ID,
        "Retire duplicate Professional Gear identity; no aliases, body, references, variants, claims, specs, or media migrate to canonical.",
      ],
    });
    await transaction.execute({
      sql: `INSERT OR IGNORE INTO entity_lineage (
              id, batch_id, action_id, source_entity_id, target_entity_id,
              lineage_kind, fallback_reason
            ) VALUES (?, ?, ?, ?, ?, 'retire', ?)`,
      args: [
        stableId("taxonomy-lineage", actionChecksum),
        batchId,
        actionId,
        PHASE31_RETIRED_PRO_GEAR_ID,
        PHASE31_PRO_GEAR_ID,
        "Duplicate retired with redirect; polluted payload deliberately not merged.",
      ],
    });
    await installPermanentRedirect(transaction, {
      id: stableId("taxonomy-redirect", actionChecksum),
      batchId,
      actionId,
      sourcePath: `/pen/${RETIRED_PRO_GEAR_SLUG}`,
      targetPath: `/pen/${PRO_GEAR_SLUG}`,
    });

    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase31SailorP0Content(
  client: Client,
  options: ApplyPhase31SailorP0Options,
): Promise<ApplyPhase31SailorP0Result> {
  await assertOwnedPhase31Catalog(client, options);
  await preparePhase31Topology(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    phase31SailorP0Packs,
  );
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}
