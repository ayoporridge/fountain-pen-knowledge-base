import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client, Row, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  PHASE35_M1005_STRESEMANN_2019_ID,
  PHASE35_M400_ID,
  PHASE35_M605_ID,
  PHASE35_M815_METAL_STRIPED_ID,
  PHASE35_PELIKAN_ID,
  phase35PelikanSouveranVariantPacks,
} from "./data/phase35-pelikan-souveran-variants";

export type ApplyPhase35PelikanSouveranVariantsOptions = ApplyPhase22Options;
export type ApplyPhase35PelikanSouveranVariantsResult = ApplyPhase22Result;

export const PHASE35_M1005_LEGACY_SLUG =
  "百利金-pelikan-m1005-stresemann";
export const PHASE35_M1005_CANONICAL_SLUG =
  "pelikan-souveran-m1005-stresemann-2019";
export const PHASE35_M400_LEGACY_SLUG = "百利金-pelikan-m400";
export const PHASE35_M400_CANONICAL_SLUG = "pelikan-souveran-m400";
export const PHASE35_M605_CANONICAL_SLUG = "pelikan-souveran-m605";
export const PHASE35_M815_LEGACY_SLUG = "百利金-pelikan-m815";
export const PHASE35_M815_CANONICAL_SLUG =
  "pelikan-souveran-m815-metal-striped";

export const PHASE35_RETIRED_M605_MISLABEL_ID = "hO_QkEZd8uyh";
export const PHASE35_RETIRED_M605_MISLABEL_SLUG =
  "百利金-pelikan-m605白乌龟";

const TAXONOMY_KEY = "phase35-pelikan-souveran-variants-v1";

type RenamablePen = {
  entityId: string;
  legacySlug: string;
  canonicalSlug: string;
};

const RENAMABLE_PENS: RenamablePen[] = [
  {
    entityId: PHASE35_M1005_STRESEMANN_2019_ID,
    legacySlug: PHASE35_M1005_LEGACY_SLUG,
    canonicalSlug: PHASE35_M1005_CANONICAL_SLUG,
  },
  {
    entityId: PHASE35_M400_ID,
    legacySlug: PHASE35_M400_LEGACY_SLUG,
    canonicalSlug: PHASE35_M400_CANONICAL_SLUG,
  },
  {
    entityId: PHASE35_M815_METAL_STRIPED_ID,
    legacySlug: PHASE35_M815_LEGACY_SLUG,
    canonicalSlug: PHASE35_M815_CANONICAL_SLUG,
  },
];

const PUBLISHED_PEN_IDS = [
  PHASE35_M1005_STRESEMANN_2019_ID,
  PHASE35_M400_ID,
  PHASE35_M605_ID,
  PHASE35_M815_METAL_STRIPED_ID,
];

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
        `Phase 35 refuses inherited remote database selection: ${key}.`,
      );
    }
  }
}

async function assertOwnedPhase35Catalog(
  client: Client,
  options: ApplyPhase35PelikanSouveranVariantsOptions,
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
      "Phase 35 owned catalog authority is not a regular local copy.",
    );
  }
  if (fs.lstatSync(options.databasePath).isSymbolicLink()) {
    throw new Error("Phase 35 owned catalog must not be a symlink.");
  }
  if (!isInside(databasePath, ownedRoot)) {
    throw new Error(
      "Phase 35 database must remain inside the caller-owned root.",
    );
  }

  const ownedStat = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    (ownedStat.dev === protectedStat.dev && ownedStat.ino === protectedStat.ino)
  ) {
    throw new Error(
      "Phase 35 refuses the protected catalog and hard-link aliases.",
    );
  }

  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => text(row, "name") === "main");
  const clientPath = main?.file
    ? fs.realpathSync.native(String(main.file))
    : null;
  if (clientPath !== databasePath) {
    throw new Error(
      "Phase 35 client is not bound to the authorized owned copy.",
    );
  }

  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error(
      "Phase 35 owned copy must be migrated through 032 before apply.",
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
  const brand = await entityRow(transaction, PHASE35_PELIKAN_ID);
  if (
    !brand ||
    text(brand, "type") !== "brand" ||
    text(brand, "slug") !== "pelikan"
  ) {
    throw new Error("Phase 35 Pelikan brand identity mismatch.");
  }
}

async function assertRenamablePen(
  transaction: Transaction,
  input: RenamablePen,
): Promise<Row> {
  const entity = await entityRow(transaction, input.entityId);
  const slug = text(entity, "slug");
  if (
    !entity ||
    text(entity, "type") !== "pen" ||
    (slug !== input.legacySlug && slug !== input.canonicalSlug)
  ) {
    throw new Error(
      `Phase 35 unexpected identity for ${input.entityId}: ${text(entity, "type")}/${slug}.`,
    );
  }
  const collision = await transaction.execute({
    sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?",
    args: [input.canonicalSlug, input.entityId],
  });
  if (collision.rows.length > 0) {
    throw new Error(
      `Phase 35 canonical slug collision: ${input.canonicalSlug} belongs to ${text(collision.rows[0], "id")}.`,
    );
  }
  return entity;
}

async function assertM605IdentityAvailable(
  transaction: Transaction,
): Promise<void> {
  const existing = await entityRow(transaction, PHASE35_M605_ID);
  if (
    existing &&
    (text(existing, "type") !== "pen" ||
      text(existing, "slug") !== PHASE35_M605_CANONICAL_SLUG)
  ) {
    throw new Error(
      `Phase 35 M605 ID collision: ${PHASE35_M605_ID} is ${text(existing, "type")}/${text(existing, "slug")}.`,
    );
  }
  const collision = await transaction.execute({
    sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?",
    args: [PHASE35_M605_CANONICAL_SLUG, PHASE35_M605_ID],
  });
  if (collision.rows.length > 0) {
    throw new Error(
      `Phase 35 M605 canonical slug collision: ${PHASE35_M605_CANONICAL_SLUG} belongs to ${text(collision.rows[0], "id")}.`,
    );
  }
}

async function assertRetiredMislabelBoundary(
  transaction: Transaction,
): Promise<void> {
  const legacy = await entityRow(
    transaction,
    PHASE35_RETIRED_M605_MISLABEL_ID,
  );
  if (
    !legacy ||
    text(legacy, "type") !== "pen" ||
    text(legacy, "slug") !== PHASE35_RETIRED_M605_MISLABEL_SLUG
  ) {
    throw new Error(
      "Phase 35 retired M605 white-tortoise mislabel identity mismatch.",
    );
  }
  const publication = await transaction.execute({
    sql: "SELECT status, blockers_json FROM entity_publications WHERE entity_id = ?",
    args: [PHASE35_RETIRED_M605_MISLABEL_ID],
  });
  if (
    publication.rows.length !== 1 ||
    text(publication.rows[0], "status") !== "retired" ||
    text(publication.rows[0], "blockers_json") !==
      '["taxonomy_retired_mislabel"]'
  ) {
    throw new Error(
      "Phase 35 requires the Phase 32 M605 mislabel retirement boundary.",
    );
  }
  const makerLinks = await transaction.execute({
    sql: `SELECT id FROM entity_links
           WHERE link_type = 'made_by'
             AND (source_id = ? OR target_id = ?)`,
    args: [
      PHASE35_RETIRED_M605_MISLABEL_ID,
      PHASE35_RETIRED_M605_MISLABEL_ID,
    ],
  });
  if (makerLinks.rows.length !== 0) {
    throw new Error(
      "Phase 35 retired M605 mislabel unexpectedly retains made_by links.",
    );
  }
}

async function assertRedirectAvailable(
  transaction: Transaction,
  sourcePath: string,
  targetPath: string,
): Promise<void> {
  const existing = await transaction.execute({
    sql: `SELECT redirect_kind, target_path
            FROM entity_redirects WHERE source_path = ?`,
    args: [sourcePath],
  });
  if (
    existing.rows.length > 1 ||
    (existing.rows.length === 1 &&
      (text(existing.rows[0], "redirect_kind") !== "permanent" ||
        text(existing.rows[0], "target_path") !== targetPath))
  ) {
    throw new Error(
      `Phase 35 conflicting redirect already owns ${sourcePath}.`,
    );
  }
}

async function canonicalizePenSlug(
  transaction: Transaction,
  input: RenamablePen,
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
      `Phase 35 failed to canonicalize ${input.entityId} to ${input.canonicalSlug}.`,
    );
  }
}

async function ensureM605Identity(transaction: Transaction): Promise<void> {
  const existing = await entityRow(transaction, PHASE35_M605_ID);
  if (existing) return;
  const inserted = await transaction.execute({
    sql: `INSERT INTO entities (id, type, slug, name)
          VALUES (?, 'pen', ?, ?)`,
    args: [
      PHASE35_M605_ID,
      PHASE35_M605_CANONICAL_SLUG,
      "Pelikan Souverän M605",
    ],
  });
  if (inserted.rowsAffected !== 1) {
    throw new Error("Phase 35 failed to create the canonical M605 identity.");
  }
}

async function ensureExactlyOnePelikanMaker(
  transaction: Transaction,
  entityId: string,
): Promise<void> {
  await transaction.execute({
    sql: `DELETE FROM entity_links
           WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?`,
    args: [entityId, PHASE35_PELIKAN_ID],
  });
  const canonical = await transaction.execute({
    sql: `SELECT id FROM entity_links
           WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
    args: [entityId, PHASE35_PELIKAN_ID],
  });
  if (canonical.rows.length === 0) {
    await transaction.execute({
      sql: `INSERT INTO entity_links (id, source_id, target_id, link_type)
            VALUES (?, ?, ?, 'made_by')`,
      args: [
        stableId("phase35-link", `${entityId}:made_by:${PHASE35_PELIKAN_ID}`),
        entityId,
        PHASE35_PELIKAN_ID,
      ],
    });
    return;
  }
  if (canonical.rows.length !== 1) {
    throw new Error(
      `Phase 35 ${entityId} has ambiguous canonical Pelikan made_by links.`,
    );
  }
}

async function assertFourReverseMakerLinks(
  transaction: Transaction,
): Promise<void> {
  const links = await transaction.execute({
    sql: `SELECT source_id, COUNT(*) AS link_count
            FROM entity_links
           WHERE target_id = ?
             AND link_type = 'made_by'
             AND source_id IN (?, ?, ?, ?)
           GROUP BY source_id`,
    args: [PHASE35_PELIKAN_ID, ...PUBLISHED_PEN_IDS],
  });
  if (
    links.rows.length !== PUBLISHED_PEN_IDS.length ||
    links.rows.some((row) => Number(row.link_count) !== 1)
  ) {
    throw new Error(
      "Phase 35 Pelikan reverse made_by coverage is not exactly one per variant page.",
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
      "Canonicalize M1005 Stresemann (2019), M400 and M815 Metal Striped slugs, then create the real M605 family identity without reusing the retired white-tortoise mislabel.",
    ],
  });

  const actions = [
    {
      key: "rename-m1005-stresemann-2019",
      kind: "rename",
      source: PHASE35_M1005_STRESEMANN_2019_ID,
      target: PHASE35_M1005_STRESEMANN_2019_ID,
      note: `Rename ${PHASE35_M1005_LEGACY_SLUG} to ${PHASE35_M1005_CANONICAL_SLUG} while retaining ID and binding it only to the 2019 edition.`,
    },
    {
      key: "rename-m400",
      kind: "rename",
      source: PHASE35_M400_ID,
      target: PHASE35_M400_ID,
      note: `Rename ${PHASE35_M400_LEGACY_SLUG} to ${PHASE35_M400_CANONICAL_SLUG} while retaining ID.`,
    },
    {
      key: "rename-m815-metal-striped",
      kind: "rename",
      source: PHASE35_M815_METAL_STRIPED_ID,
      target: PHASE35_M815_METAL_STRIPED_ID,
      note: `Rename ${PHASE35_M815_LEGACY_SLUG} to ${PHASE35_M815_CANONICAL_SLUG} while retaining ID and narrowing it to Metal Striped variants.`,
    },
    {
      key: "create-m605",
      kind: "create",
      source: null,
      target: PHASE35_M605_ID,
      note: `Create ${PHASE35_M605_CANONICAL_SLUG} as a new canonical family identity; never reuse ${PHASE35_RETIRED_M605_MISLABEL_ID}.`,
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
    sql: `SELECT source_row_key, status
            FROM taxonomy_actions
           WHERE batch_id = ?
           ORDER BY source_row_key`,
    args: [batchId],
  });
  if (
    audit.rows.length !== actions.length ||
    audit.rows.some((row) => text(row, "status") !== "applied")
  ) {
    throw new Error("Phase 35 taxonomy audit rows are incomplete.");
  }
  return { batchId, actionIds };
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
  if (existing.rows.length > 0) return;
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
      `Phase 35 failed to install redirect ${input.sourcePath}.`,
    );
  }
}

async function preparePhase35Identities(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    await assertBrandIdentity(transaction);
    for (const input of RENAMABLE_PENS) {
      await assertRenamablePen(transaction, input);
      await assertRedirectAvailable(
        transaction,
        `/pen/${input.legacySlug}`,
        `/pen/${input.canonicalSlug}`,
      );
    }
    await assertM605IdentityAvailable(transaction);
    await assertRetiredMislabelBoundary(transaction);

    for (const input of RENAMABLE_PENS) {
      await canonicalizePenSlug(transaction, input);
    }
    await ensureM605Identity(transaction);
    for (const entityId of PUBLISHED_PEN_IDS) {
      await ensureExactlyOnePelikanMaker(transaction, entityId);
    }
    await assertFourReverseMakerLinks(transaction);

    const { batchId, actionIds } = await recordTaxonomyAudit(transaction);
    for (const input of RENAMABLE_PENS) {
      const actionKey =
        input.entityId === PHASE35_M1005_STRESEMANN_2019_ID
          ? "rename-m1005-stresemann-2019"
          : input.entityId === PHASE35_M400_ID
            ? "rename-m400"
            : "rename-m815-metal-striped";
      await installPermanentRedirect(transaction, {
        batchId,
        actionId: actionIds[actionKey] ?? "",
        sourcePath: `/pen/${input.legacySlug}`,
        targetPath: `/pen/${input.canonicalSlug}`,
      });
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase35PelikanSouveranVariantsContent(
  client: Client,
  options: ApplyPhase35PelikanSouveranVariantsOptions,
): Promise<ApplyPhase35PelikanSouveranVariantsResult> {
  await assertOwnedPhase35Catalog(client, options);
  await preparePhase35Identities(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    phase35PelikanSouveranVariantPacks,
  );
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}
