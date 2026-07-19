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
  PHASE33_ANCHOR_ID,
  PHASE33_PGS21_ID,
  PHASE33_PROFIT_REALO18_ID,
  PHASE33_SAILOR_BRAND_ID,
  phase33Sailor2026CurrentPacks,
} from "./data/phase33-sailor-2026-current";

export type ApplyPhase33Sailor2026CurrentOptions = ApplyPhase22Options;
export type ApplyPhase33Sailor2026CurrentResult = ApplyPhase22Result;

const SAILOR_PENS = [
  {
    id: PHASE33_PGS21_ID,
    slug: "sailor-professional-gear-slim-21",
    name: "Sailor Professional Gear Slim 21",
  },
  {
    id: PHASE33_PROFIT_REALO18_ID,
    slug: "sailor-profit-realo-18",
    name: "Sailor Profit Realo 18",
  },
  {
    id: PHASE33_ANCHOR_ID,
    slug: "sailor-professional-gear-anchor",
    name: "Sailor Professional Gear Anchor",
  },
] as const;

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
        `Phase 33 refuses inherited remote database selection: ${key}.`,
      );
    }
  }
}

async function assertOwnedPhase33Catalog(
  client: Client,
  options: ApplyPhase33Sailor2026CurrentOptions,
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
      "Phase 33 owned catalog authority is not a regular local copy.",
    );
  }
  if (fs.lstatSync(options.databasePath).isSymbolicLink()) {
    throw new Error("Phase 33 owned catalog must not be a symlink.");
  }
  if (!isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 33 database must remain inside the caller-owned root.");
  }

  const ownedStat = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    (ownedStat.dev === protectedStat.dev && ownedStat.ino === protectedStat.ino)
  ) {
    throw new Error(
      "Phase 33 refuses the protected catalog and hard-link aliases.",
    );
  }

  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  const clientPath = main?.file
    ? fs.realpathSync.native(String(main.file))
    : null;
  if (clientPath !== databasePath) {
    throw new Error(
      "Phase 33 client is not bound to the authorized owned copy.",
    );
  }

  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error(
      "Phase 33 owned copy must be migrated through 032 before apply.",
    );
  }
}

async function preflightPhase33Topology(client: Client): Promise<void> {
  const uniqueIds = new Set(SAILOR_PENS.map((pen) => pen.id));
  const uniqueSlugs = new Set(SAILOR_PENS.map((pen) => pen.slug));
  if (
    uniqueIds.size !== SAILOR_PENS.length ||
    uniqueSlugs.size !== SAILOR_PENS.length
  ) {
    throw new Error("Phase 33 target identities are not internally unique.");
  }

  const brand = await client.execute({
    sql: "SELECT type, slug FROM entities WHERE id = ?",
    args: [PHASE33_SAILOR_BRAND_ID],
  });
  if (
    brand.rows.length !== 1 ||
    String(brand.rows[0]?.type) !== "brand" ||
    String(brand.rows[0]?.slug) !== "sailor"
  ) {
    throw new Error("Phase 33 canonical Sailor brand identity mismatch.");
  }

  for (const pen of SAILOR_PENS) {
    const existing = await client.execute({
      sql: "SELECT id, type, slug FROM entities WHERE id = ? OR slug = ? ORDER BY id",
      args: [pen.id, pen.slug],
    });
    if (existing.rows.length === 0) continue;
    if (
      existing.rows.length !== 1 ||
      String(existing.rows[0]?.id) !== pen.id ||
      String(existing.rows[0]?.type) !== "pen" ||
      String(existing.rows[0]?.slug) !== pen.slug
    ) {
      throw new Error(`Phase 33 entity/slug collision for ${pen.slug}.`);
    }
  }
}

async function ensurePenEntity(
  transaction: Transaction,
  input: (typeof SAILOR_PENS)[number],
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
      throw new Error(`Phase 33 failed to create ${input.slug}.`);
    }
    return;
  }
  if (
    existing.rows.length !== 1 ||
    String(existing.rows[0]?.id) !== input.id ||
    String(existing.rows[0]?.type) !== "pen" ||
    String(existing.rows[0]?.slug) !== input.slug
  ) {
    throw new Error(`Phase 33 entity/slug collision for ${input.slug}.`);
  }
}

async function ensureExactlyOneSailorMaker(
  transaction: Transaction,
  entityId: string,
): Promise<void> {
  await transaction.execute({
    sql: `DELETE FROM entity_links
           WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?`,
    args: [entityId, PHASE33_SAILOR_BRAND_ID],
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
      PHASE33_SAILOR_BRAND_ID,
      entityId,
      PHASE33_SAILOR_BRAND_ID,
    ],
  });

  const current = await transaction.execute({
    sql: `SELECT count(*) AS total FROM entity_links
           WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
    args: [entityId, PHASE33_SAILOR_BRAND_ID],
  });
  if (Number(current.rows[0]?.total ?? 0) === 0) {
    await transaction.execute({
      sql: `INSERT INTO entity_links (id, source_id, target_id, link_type, reason)
            VALUES (?, ?, ?, 'made_by', 'Phase 33 canonical Sailor maker')`,
      args: [
        stableId(
          "phase33-link",
          `${entityId}:made_by:${PHASE33_SAILOR_BRAND_ID}`,
        ),
        entityId,
        PHASE33_SAILOR_BRAND_ID,
      ],
    });
  }

  const verified = await transaction.execute({
    sql: `SELECT count(*) AS total FROM entity_links
           WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
    args: [entityId, PHASE33_SAILOR_BRAND_ID],
  });
  const reverse = await transaction.execute({
    sql: `SELECT count(*) AS total FROM entity_links
           WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'`,
    args: [PHASE33_SAILOR_BRAND_ID, entityId],
  });
  if (
    Number(verified.rows[0]?.total ?? 0) !== 1 ||
    Number(reverse.rows[0]?.total ?? 0) !== 1
  ) {
    throw new Error(
      `Phase 33 ${entityId} must retain one Sailor made_by and one reverse link.`,
    );
  }
}

async function preparePhase33Topology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    for (const pen of SAILOR_PENS) {
      await ensurePenEntity(transaction, pen);
      await ensureExactlyOneSailorMaker(transaction, pen.id);
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase33Sailor2026CurrentContent(
  client: Client,
  options: ApplyPhase33Sailor2026CurrentOptions,
): Promise<ApplyPhase33Sailor2026CurrentResult> {
  await assertOwnedPhase33Catalog(client, options);
  await preflightPhase33Topology(client);
  await preparePhase33Topology(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    phase33Sailor2026CurrentPacks,
  );
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}
