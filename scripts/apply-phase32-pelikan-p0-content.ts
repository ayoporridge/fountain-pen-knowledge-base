import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client, Row, Transaction } from "@libsql/client";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  PHASE32_M1000_ID,
  PHASE32_M600_ID,
  PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
  PHASE32_PELIKAN_ID,
  PHASE32_RETIRED_MISLABEL_ID,
  phase32PelikanP0Packs,
} from "./data/phase32-pelikan-p0";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";

export type ApplyPhase32PelikanP0Options = ApplyPhase22Options;
export type ApplyPhase32PelikanP0Result = ApplyPhase22Result;

export const PHASE32_M1000_LEGACY_SLUG = "百利金-pelikan-m1000";
export const PHASE32_M1000_CANONICAL_SLUG = "pelikan-souveran-m1000";
export const PHASE32_M600_LEGACY_SLUG = "百利金-pelikan-m600";
export const PHASE32_M600_CANONICAL_SLUG = "pelikan-souveran-m600";
export const PHASE32_MISLABEL_SLUG = "百利金-pelikan-m605白乌龟";
export const PHASE32_M600_TORTOISESHELL_WHITE_2012_SLUG =
  "pelikan-souveran-m600-tortoiseshell-white-2012";

const TAXONOMY_KEY = "phase32-pelikan-p0-identities-v1";

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableId(prefix: string, value: string): string {
  return `${prefix}-${digest(value).slice(0, 24)}`;
}

function text(row: Row | undefined, key: string): string {
  return String(row?.[key] ?? "").trim();
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
        `Phase 32 refuses inherited remote database selection: ${key}.`,
      );
    }
  }
}

async function assertOwnedPhase32Catalog(
  client: Client,
  options: ApplyPhase32PelikanP0Options,
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
      "Phase 32 owned catalog authority is not a regular local copy.",
    );
  }
  if (fs.lstatSync(options.databasePath).isSymbolicLink()) {
    throw new Error("Phase 32 owned catalog must not be a symlink.");
  }
  if (!isInside(databasePath, ownedRoot)) {
    throw new Error(
      "Phase 32 database must remain inside the caller-owned root.",
    );
  }
  const ownedStat = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    (ownedStat.dev === protectedStat.dev && ownedStat.ino === protectedStat.ino)
  ) {
    throw new Error(
      "Phase 32 refuses the protected catalog and hard-link aliases.",
    );
  }

  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => text(row, "name") === "main");
  const clientPath = main?.file
    ? fs.realpathSync.native(String(main.file))
    : null;
  if (clientPath !== databasePath) {
    throw new Error(
      "Phase 32 client is not bound to the authorized owned copy.",
    );
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error(
      "Phase 32 owned copy must be migrated through 032 before apply.",
    );
  }
}

async function entityRow(
  transaction: Transaction,
  entityId: string,
): Promise<Row | undefined> {
  const result = await transaction.execute({
    sql: "SELECT id, type, slug, name FROM entities WHERE id = ?",
    args: [entityId],
  });
  return result.rows[0];
}

async function assertBrandIdentity(transaction: Transaction): Promise<void> {
  const brand = await entityRow(transaction, PHASE32_PELIKAN_ID);
  if (
    !brand ||
    text(brand, "type") !== "brand" ||
    text(brand, "slug") !== "pelikan"
  ) {
    throw new Error("Phase 32 Pelikan brand identity mismatch.");
  }
}

async function assertRenamablePen(
  transaction: Transaction,
  input: {
    entityId: string;
    legacySlug: string;
    canonicalSlug: string;
  },
): Promise<Row> {
  const entity = await entityRow(transaction, input.entityId);
  const slug = text(entity, "slug");
  if (
    !entity ||
    text(entity, "type") !== "pen" ||
    (slug !== input.legacySlug && slug !== input.canonicalSlug)
  ) {
    throw new Error(
      `Phase 32 unexpected identity for ${input.entityId}: ${text(entity, "type")}/${slug}`,
    );
  }
  const collision = await transaction.execute({
    sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?",
    args: [input.canonicalSlug, input.entityId],
  });
  if (collision.rows.length > 0) {
    throw new Error(
      `Phase 32 canonical slug collision: ${input.canonicalSlug} belongs to ${text(collision.rows[0], "id")}.`,
    );
  }
  return entity;
}

async function canonicalizePenSlug(
  transaction: Transaction,
  input: {
    entityId: string;
    legacySlug: string;
    canonicalSlug: string;
  },
): Promise<void> {
  const entity = await assertRenamablePen(transaction, input);
  if (text(entity, "slug") === input.canonicalSlug) return;
  const updated = await transaction.execute({
    sql: `UPDATE entities
             SET slug = ?, updated_at = datetime('now')
           WHERE id = ? AND type = 'pen' AND slug = ?`,
    args: [input.canonicalSlug, input.entityId, input.legacySlug],
  });
  if (updated.rowsAffected !== 1) {
    throw new Error(
      `Phase 32 failed to canonicalize ${input.entityId} to ${input.canonicalSlug}.`,
    );
  }
}

async function ensureNewWhiteTortoiseIdentity(
  transaction: Transaction,
): Promise<void> {
  const existing = await entityRow(
    transaction,
    PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
  );
  const collision = await transaction.execute({
    sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?",
    args: [
      PHASE32_M600_TORTOISESHELL_WHITE_2012_SLUG,
      PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
    ],
  });
  if (collision.rows.length > 0) {
    throw new Error(
      `Phase 32 white-tortoise slug collision with ${text(collision.rows[0], "id")}.`,
    );
  }
  if (existing) {
    if (
      text(existing, "type") !== "pen" ||
      text(existing, "slug") !==
        PHASE32_M600_TORTOISESHELL_WHITE_2012_SLUG
    ) {
      throw new Error(
        "Phase 32 existing white-tortoise canonical identity mismatch.",
      );
    }
    return;
  }
  const inserted = await transaction.execute({
    sql: `INSERT INTO entities (id, type, slug, name)
          VALUES (?, 'pen', ?, ?)`,
    args: [
      PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
      PHASE32_M600_TORTOISESHELL_WHITE_2012_SLUG,
      "Pelikan Souverän M600 Tortoiseshell-White (2012)",
    ],
  });
  if (inserted.rowsAffected !== 1) {
    throw new Error(
      "Phase 32 failed to create the independent 2012 M600 white-tortoise identity.",
    );
  }
}

async function ensureExactlyOnePelikanMaker(
  transaction: Transaction,
  entityId: string,
): Promise<void> {
  await transaction.execute({
    sql: `DELETE FROM entity_links
           WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?`,
    args: [entityId, PHASE32_PELIKAN_ID],
  });
  const canonical = await transaction.execute({
    sql: `SELECT id FROM entity_links
           WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
    args: [entityId, PHASE32_PELIKAN_ID],
  });
  if (canonical.rows.length === 0) {
    await transaction.execute({
      sql: `INSERT INTO entity_links (id, source_id, target_id, link_type)
            VALUES (?, ?, ?, 'made_by')`,
      args: [
        stableId("phase32-link", `${entityId}:made_by:${PHASE32_PELIKAN_ID}`),
        entityId,
        PHASE32_PELIKAN_ID,
      ],
    });
    return;
  }
  if (canonical.rows.length !== 1) {
    throw new Error(
      `Phase 32 ${entityId} has ambiguous canonical Pelikan made_by links.`,
    );
  }
}

async function retireMislabeledM605(transaction: Transaction): Promise<void> {
  const legacy = await entityRow(transaction, PHASE32_RETIRED_MISLABEL_ID);
  if (
    !legacy ||
    text(legacy, "type") !== "pen" ||
    text(legacy, "slug") !== PHASE32_MISLABEL_SLUG
  ) {
    throw new Error(
      "Phase 32 legacy M605 white-tortoise mislabel identity mismatch.",
    );
  }
  await transaction.execute({
    sql: `DELETE FROM entity_links
           WHERE link_type = 'made_by'
             AND (source_id = ? OR target_id = ?)`,
    args: [PHASE32_RETIRED_MISLABEL_ID, PHASE32_RETIRED_MISLABEL_ID],
  });
  const publication = await transaction.execute({
    sql: `SELECT status, blockers_json
            FROM entity_publications WHERE entity_id = ?`,
    args: [PHASE32_RETIRED_MISLABEL_ID],
  });
  if (publication.rows.length !== 1) {
    throw new Error("Phase 32 legacy mislabel publication row is missing.");
  }
  if (
    text(publication.rows[0], "status") === "retired" &&
    text(publication.rows[0], "blockers_json") ===
      '["taxonomy_retired_mislabel"]'
  ) {
    return;
  }
  const retired = await transaction.execute({
    sql: `UPDATE entity_publications
             SET status = 'retired',
                 blockers_json = '["taxonomy_retired_mislabel"]',
                 approved_content_hash = NULL,
                 reviewed_content_revision = NULL,
                 reviewed_contract_version = NULL,
                 reviewed_by = NULL,
                 reviewed_at = NULL,
                 published_at = NULL,
                 review_notes = ?,
                 updated_at = datetime('now')
           WHERE entity_id = ?`,
    args: [
      "Phase 32 retires the M605 white-tortoise mislabel without renaming or reusing its payload; old route redirects to the independently sourced 2012 M600 canonical entity.",
      PHASE32_RETIRED_MISLABEL_ID,
    ],
  });
  if (retired.rowsAffected !== 1) {
    throw new Error("Phase 32 failed to retire the legacy mislabel.");
  }
}

async function installPermanentRedirect(
  transaction: Transaction,
  input: {
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
    if (
      existing.rows.length !== 1 ||
      text(existing.rows[0], "redirect_kind") !== "permanent" ||
      text(existing.rows[0], "target_path") !== input.targetPath
    ) {
      throw new Error(
        `Phase 32 conflicting redirect already owns ${input.sourcePath}.`,
      );
    }
    return;
  }
  const inserted = await transaction.execute({
    sql: `INSERT INTO entity_redirects (
            id, batch_id, action_id, source_path, target_path,
            redirect_kind, fallback_reason
          ) VALUES (?, ?, ?, ?, ?, 'permanent', NULL)`,
    args: [
      stableId("taxonomy-redirect", `${TAXONOMY_KEY}:${input.sourcePath}`),
      input.batchId,
      input.actionId,
      input.sourcePath,
      input.targetPath,
    ],
  });
  if (inserted.rowsAffected !== 1) {
    throw new Error(
      `Phase 32 failed to install redirect ${input.sourcePath}.`,
    );
  }
}

async function recordTaxonomyAudit(
  transaction: Transaction,
): Promise<{ batchId: string; actionIds: Record<string, string> }> {
  const batchId = stableId("taxonomy-batch", TAXONOMY_KEY);
  await transaction.execute({
    sql: `INSERT OR IGNORE INTO taxonomy_batches (
            id, source_key, source_checksum, status, note
          ) VALUES (?, ?, ?, 'applied', ?)`,
    args: [
      batchId,
      TAXONOMY_KEY,
      digest(TAXONOMY_KEY),
      "Canonicalize M1000/M600 slugs, create an independent 2012 M600 Tortoiseshell-White, and retire the M605 mislabel without payload reuse.",
    ],
  });

  const actions = [
    {
      key: "rename-m1000",
      kind: "rename",
      source: PHASE32_M1000_ID,
      target: PHASE32_M1000_ID,
      note: `Rename ${PHASE32_M1000_LEGACY_SLUG} to ${PHASE32_M1000_CANONICAL_SLUG} while retaining ID.`,
    },
    {
      key: "rename-m600",
      kind: "rename",
      source: PHASE32_M600_ID,
      target: PHASE32_M600_ID,
      note: `Rename ${PHASE32_M600_LEGACY_SLUG} to ${PHASE32_M600_CANONICAL_SLUG} while retaining ID.`,
    },
    {
      key: "create-m600-white-2012",
      kind: "create",
      source: null,
      target: PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
      note: "Create the independently sourced 2012 M600 Tortoiseshell-White canonical identity.",
    },
    {
      key: "retire-m605-mislabel",
      kind: "retire",
      source: PHASE32_RETIRED_MISLABEL_ID,
      target: null,
      note: "Retire the M605 white-tortoise mislabel without renaming it, migrating its payload, or treating it as a verified M605 edition.",
    },
  ] as const;
  const actionIds: Record<string, string> = {};
  for (const action of actions) {
    const actionId = stableId(
      "taxonomy-action",
      `${TAXONOMY_KEY}:${action.key}`,
    );
    actionIds[action.key] = actionId;
    const checksum = digest(
      JSON.stringify({
        key: action.key,
        kind: action.kind,
        source: action.source,
        target: action.target,
      }),
    );
    await transaction.execute({
      sql: `INSERT OR IGNORE INTO taxonomy_actions (
              id, batch_id, source_row_key, action_kind, action_checksum,
              source_entity_id, target_entity_id, status, note
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'applied', ?)`,
      args: [
        actionId,
        batchId,
        action.key,
        action.kind,
        checksum,
        action.source,
        action.target,
        action.note,
      ],
    });
  }

  const audit = await transaction.execute({
    sql: `SELECT source_row_key, action_kind, status
            FROM taxonomy_actions
           WHERE batch_id = ?
           ORDER BY source_row_key`,
    args: [batchId],
  });
  if (
    audit.rows.length !== actions.length ||
    audit.rows.some((row) => text(row, "status") !== "applied")
  ) {
    throw new Error("Phase 32 taxonomy audit rows are incomplete.");
  }
  return { batchId, actionIds };
}

async function preparePhase32Identities(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    await assertBrandIdentity(transaction);
    await assertRenamablePen(transaction, {
      entityId: PHASE32_M1000_ID,
      legacySlug: PHASE32_M1000_LEGACY_SLUG,
      canonicalSlug: PHASE32_M1000_CANONICAL_SLUG,
    });
    await assertRenamablePen(transaction, {
      entityId: PHASE32_M600_ID,
      legacySlug: PHASE32_M600_LEGACY_SLUG,
      canonicalSlug: PHASE32_M600_CANONICAL_SLUG,
    });
    const legacyMislabel = await entityRow(
      transaction,
      PHASE32_RETIRED_MISLABEL_ID,
    );
    if (
      !legacyMislabel ||
      text(legacyMislabel, "type") !== "pen" ||
      text(legacyMislabel, "slug") !== PHASE32_MISLABEL_SLUG
    ) {
      throw new Error(
        "Phase 32 refuses to reinterpret an unexpected legacy mislabel identity.",
      );
    }

    await canonicalizePenSlug(transaction, {
      entityId: PHASE32_M1000_ID,
      legacySlug: PHASE32_M1000_LEGACY_SLUG,
      canonicalSlug: PHASE32_M1000_CANONICAL_SLUG,
    });
    await canonicalizePenSlug(transaction, {
      entityId: PHASE32_M600_ID,
      legacySlug: PHASE32_M600_LEGACY_SLUG,
      canonicalSlug: PHASE32_M600_CANONICAL_SLUG,
    });
    await ensureNewWhiteTortoiseIdentity(transaction);
    for (const entityId of [
      PHASE32_M1000_ID,
      PHASE32_M600_ID,
      PHASE32_M600_TORTOISESHELL_WHITE_2012_ID,
    ]) {
      await ensureExactlyOnePelikanMaker(transaction, entityId);
    }
    await retireMislabeledM605(transaction);

    const { batchId, actionIds } = await recordTaxonomyAudit(transaction);
    await installPermanentRedirect(transaction, {
      batchId,
      actionId: actionIds["rename-m1000"] ?? "",
      sourcePath: `/pen/${PHASE32_M1000_LEGACY_SLUG}`,
      targetPath: `/pen/${PHASE32_M1000_CANONICAL_SLUG}`,
    });
    await installPermanentRedirect(transaction, {
      batchId,
      actionId: actionIds["rename-m600"] ?? "",
      sourcePath: `/pen/${PHASE32_M600_LEGACY_SLUG}`,
      targetPath: `/pen/${PHASE32_M600_CANONICAL_SLUG}`,
    });
    await installPermanentRedirect(transaction, {
      batchId,
      actionId: actionIds["retire-m605-mislabel"] ?? "",
      sourcePath: `/pen/${PHASE32_MISLABEL_SLUG}`,
      targetPath: `/pen/${PHASE32_M600_TORTOISESHELL_WHITE_2012_SLUG}`,
    });
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase32PelikanP0Content(
  client: Client,
  options: ApplyPhase32PelikanP0Options,
): Promise<ApplyPhase32PelikanP0Result> {
  await assertOwnedPhase32Catalog(client, options);
  await preparePhase32Identities(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    phase32PelikanP0Packs,
  );
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}
