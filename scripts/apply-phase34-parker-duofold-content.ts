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
  PHASE34_DUOFOLD_CENTENNIAL_ID,
  PHASE34_DUOFOLD_GEOMETRIC_ID,
  PHASE34_DUOFOLD_STRIPED_ID,
  PHASE34_DUOFOLD_VINTAGE_ID,
  PHASE34_PARKER_ID,
  phase34ParkerDuofoldPacks,
} from "./data/phase34-parker-duofold";

export type ApplyPhase34ParkerDuofoldOptions = ApplyPhase22Options;
export type ApplyPhase34ParkerDuofoldResult = ApplyPhase22Result;

const DUOFOLD_PENS = [
  {
    id: PHASE34_DUOFOLD_VINTAGE_ID,
    slug: "the-parker-duofold",
  },
  {
    id: PHASE34_DUOFOLD_GEOMETRIC_ID,
    slug: "the-parker-duofold-geometric-toothbrush",
  },
  {
    id: PHASE34_DUOFOLD_STRIPED_ID,
    slug: "the-parker-striped-duofold",
  },
  {
    id: PHASE34_DUOFOLD_CENTENNIAL_ID,
    slug: "派克-parker-世纪-duofold",
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
        `Phase 34 refuses inherited remote database selection: ${key}.`,
      );
    }
  }
}

async function assertOwnedPhase34Catalog(
  client: Client,
  options: ApplyPhase34ParkerDuofoldOptions,
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
      "Phase 34 owned catalog authority is not a regular local copy.",
    );
  }
  if (fs.lstatSync(options.databasePath).isSymbolicLink()) {
    throw new Error("Phase 34 owned catalog must not be a symlink.");
  }
  if (!isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 34 database must remain inside the caller-owned root.");
  }
  const databaseStat = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    (databaseStat.dev === protectedStat.dev &&
      databaseStat.ino === protectedStat.ino)
  ) {
    throw new Error(
      "Phase 34 refuses the protected catalog and hard-link aliases.",
    );
  }

  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  const clientPath = main?.file
    ? fs.realpathSync.native(String(main.file))
    : null;
  if (clientPath !== databasePath) {
    throw new Error(
      "Phase 34 client is not bound to the authorized owned copy.",
    );
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error(
      "Phase 34 owned copy must be migrated through 032 before apply.",
    );
  }
}

async function assertParkerAndDuofolds(
  transaction: Transaction,
): Promise<void> {
  const brand = await transaction.execute({
    sql: "SELECT type, slug FROM entities WHERE id = ?",
    args: [PHASE34_PARKER_ID],
  });
  if (
    brand.rows.length !== 1 ||
    String(brand.rows[0]?.type) !== "brand" ||
    String(brand.rows[0]?.slug) !== "parker"
  ) {
    throw new Error("Phase 34 Parker brand identity mismatch.");
  }

  for (const pen of DUOFOLD_PENS) {
    const entity = await transaction.execute({
      sql: "SELECT type, slug FROM entities WHERE id = ?",
      args: [pen.id],
    });
    if (
      entity.rows.length !== 1 ||
      String(entity.rows[0]?.type) !== "pen" ||
      String(entity.rows[0]?.slug) !== pen.slug
    ) {
      throw new Error(`Phase 34 Duofold identity mismatch: ${pen.id}.`);
    }
  }
}

async function ensureExactlyOneParkerMaker(
  transaction: Transaction,
  entityId: string,
): Promise<void> {
  await transaction.execute({
    sql: `DELETE FROM entity_links
           WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?`,
    args: [entityId, PHASE34_PARKER_ID],
  });
  const current = await transaction.execute({
    sql: `SELECT id FROM entity_links
           WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
    args: [entityId, PHASE34_PARKER_ID],
  });
  if (current.rows.length === 0) {
    await transaction.execute({
      sql: `INSERT INTO entity_links (
              id, source_id, target_id, link_type, reason
            ) VALUES (?, ?, ?, 'made_by', ?)`,
      args: [
        stableId("phase34-link", `${entityId}:made_by:${PHASE34_PARKER_ID}`),
        entityId,
        PHASE34_PARKER_ID,
        "Phase 34 canonical Parker maker",
      ],
    });
  } else if (current.rows.length !== 1) {
    throw new Error(`Phase 34 ${entityId} has ambiguous Parker made_by links.`);
  }

  const verified = await transaction.execute({
    sql: `SELECT count(*) AS total FROM entity_links
           WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
    args: [entityId, PHASE34_PARKER_ID],
  });
  const reverse = await transaction.execute({
    sql: `SELECT count(*) AS total FROM entity_links
           WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'`,
    args: [PHASE34_PARKER_ID, entityId],
  });
  if (
    Number(verified.rows[0]?.total ?? 0) !== 1 ||
    Number(reverse.rows[0]?.total ?? 0) !== 1
  ) {
    throw new Error(
      `Phase 34 ${entityId} must retain one Parker made_by and one reverse link.`,
    );
  }
}

async function preparePhase34Topology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    await assertParkerAndDuofolds(transaction);
    for (const pen of DUOFOLD_PENS) {
      await ensureExactlyOneParkerMaker(transaction, pen.id);
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase34ParkerDuofoldContent(
  client: Client,
  options: ApplyPhase34ParkerDuofoldOptions,
): Promise<ApplyPhase34ParkerDuofoldResult> {
  await assertOwnedPhase34Catalog(client, options);
  await preparePhase34Topology(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    structuredClone(phase34ParkerDuofoldPacks),
  );
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}
