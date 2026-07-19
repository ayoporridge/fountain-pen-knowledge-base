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
import { phase28Parker51Packs } from "./data/phase28-parker-51";
import {
  PHASE30_INGENUITY_ID,
  PHASE30_PARKER_ID,
  PHASE30_URBAN_ID,
  PHASE30_VECTOR_ID,
  PHASE30_VECTOR_XL_ID,
  phase30ParkerP0Packs,
} from "./data/phase30-parker-p0";

export type ApplyPhase30ParkerP0Options = ApplyPhase22Options;
export type ApplyPhase30ParkerP0Result = ApplyPhase22Result;

const PARKER_PENS = [
  {
    id: PHASE30_INGENUITY_ID,
    slug: "parker-ingenuity-fountain-pen",
    name: "Parker Ingenuity Fountain Pen（2023–）",
  },
  {
    id: PHASE30_VECTOR_ID,
    slug: "派克-parker-威雅-vector",
    name: "Parker Vector",
  },
  {
    id: PHASE30_VECTOR_XL_ID,
    slug: "parker-vector-xl-fountain-pen",
    name: "Parker Vector XL",
  },
  {
    id: PHASE30_URBAN_ID,
    slug: "parker-urban-fountain-pen",
    name: "Parker Urban Fountain Pen（现行款）",
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
        `Phase 30 refuses inherited remote database selection: ${key}.`,
      );
    }
  }
}

async function assertOwnedPhase30Catalog(
  client: Client,
  options: ApplyPhase30ParkerP0Options,
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
      "Phase 30 owned catalog authority is not a regular local copy.",
    );
  }
  if (fs.lstatSync(options.databasePath).isSymbolicLink()) {
    throw new Error("Phase 30 owned catalog must not be a symlink.");
  }
  if (!isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 30 database must remain inside the caller-owned root.");
  }
  const ownedStat = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    (ownedStat.dev === protectedStat.dev && ownedStat.ino === protectedStat.ino)
  ) {
    throw new Error(
      "Phase 30 refuses the protected catalog and hard-link aliases.",
    );
  }

  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  const clientPath = main?.file
    ? fs.realpathSync.native(String(main.file))
    : null;
  if (clientPath !== databasePath) {
    throw new Error(
      "Phase 30 client is not bound to the authorized owned copy.",
    );
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error(
      "Phase 30 owned copy must be migrated through 032 before apply.",
    );
  }
}

async function assertParkerBrand(transaction: Transaction): Promise<void> {
  const result = await transaction.execute({
    sql: "SELECT type, slug FROM entities WHERE id = ?",
    args: [PHASE30_PARKER_ID],
  });
  const row = result.rows[0];
  if (
    result.rows.length !== 1 ||
    String(row?.type) !== "brand" ||
    String(row?.slug) !== "parker"
  ) {
    throw new Error("Phase 30 Parker brand identity mismatch.");
  }
}

async function ensurePenEntity(
  transaction: Transaction,
  input: (typeof PARKER_PENS)[number],
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
      throw new Error(`Phase 30 failed to create ${input.slug}.`);
    }
    return;
  }
  const row = existing.rows[0];
  if (
    existing.rows.length !== 1 ||
    String(row?.id) !== input.id ||
    String(row?.type) !== "pen" ||
    String(row?.slug) !== input.slug
  ) {
    throw new Error(`Phase 30 entity/slug collision for ${input.slug}.`);
  }
}

async function ensureExactlyOneParkerMaker(
  transaction: Transaction,
  entityId: string,
): Promise<void> {
  await transaction.execute({
    sql: `DELETE FROM entity_links
           WHERE source_id = ? AND link_type = 'made_by' AND target_id <> ?`,
    args: [entityId, PHASE30_PARKER_ID],
  });
  const current = await transaction.execute({
    sql: `SELECT id FROM entity_links
           WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
    args: [entityId, PHASE30_PARKER_ID],
  });
  if (current.rows.length === 0) {
    await transaction.execute({
      sql: `INSERT INTO entity_links (
              id, source_id, target_id, link_type, reason
            ) VALUES (?, ?, ?, 'made_by', ?)`,
      args: [
        stableId("phase30-link", `${entityId}:made_by:${PHASE30_PARKER_ID}`),
        entityId,
        PHASE30_PARKER_ID,
        "Phase 30 canonical Parker maker",
      ],
    });
  } else if (current.rows.length !== 1) {
    throw new Error(
      `Phase 30 ${entityId} has ambiguous canonical Parker made_by links.`,
    );
  }

  const verified = await transaction.execute({
    sql: `SELECT count(*) AS total FROM entity_links
           WHERE source_id = ? AND target_id = ? AND link_type = 'made_by'`,
    args: [entityId, PHASE30_PARKER_ID],
  });
  const reverse = await transaction.execute({
    sql: `SELECT count(*) AS total FROM entity_links
           WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'`,
    args: [PHASE30_PARKER_ID, entityId],
  });
  if (
    Number(verified.rows[0]?.total ?? 0) !== 1 ||
    Number(reverse.rows[0]?.total ?? 0) !== 1
  ) {
    throw new Error(
      `Phase 30 ${entityId} must retain one Parker made_by and one reverse link.`,
    );
  }
}

async function preparePhase30Topology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    await assertParkerBrand(transaction);
    for (const pen of PARKER_PENS) {
      await ensurePenEntity(transaction, pen);
      await ensureExactlyOneParkerMaker(transaction, pen.id);
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase30ParkerP0Content(
  client: Client,
  options: ApplyPhase30ParkerP0Options,
): Promise<ApplyPhase30ParkerP0Result> {
  await assertOwnedPhase30Catalog(client, options);
  await preparePhase30Topology(client);

  const brandPack = phase28Parker51Packs.find(
    (pack) =>
      pack.expectedType === "brand" && pack.entityId === PHASE30_PARKER_ID,
  );
  if (!brandPack) {
    throw new Error("Phase 30 Parker brand pack is missing.");
  }
  const phase30BrandPack = structuredClone(brandPack);
  phase30BrandPack.sources = phase30BrandPack.sources.map((source) =>
    source.key === "parker-im-commons"
      ? {
          ...source,
          registryKey: "wikimedia-commons-caleb-bond",
          registryName: "Wikimedia Commons — Caleb Bond file",
        }
      : source,
  );
  const result = await applyCuratedContentPacks(client, options, [
    phase30BrandPack,
    ...structuredClone(phase30ParkerP0Packs),
  ]);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}
