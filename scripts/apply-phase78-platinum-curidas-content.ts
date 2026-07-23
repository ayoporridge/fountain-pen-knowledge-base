import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Client, Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  PHASE78_CURIDAS_ID,
  PHASE78_CURIDAS_RAW_SLUG,
  PHASE78_CURIDAS_SLUG,
  PHASE78_PLATINUM_BRAND_ID,
  phase78PlatinumCuridasPacks,
} from "./data/phase78-platinum-curidas";

export type ApplyPhase78Options = ApplyPhase22Options;
export type ApplyPhase78Result = ApplyPhase22Result;

const BATCH_ID = "phase78-platinum-curidas-identity";

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
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 78 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertOwnedCatalog(
  client: Client,
  options: ApplyPhase78Options,
): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedCatalog = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !isInside(database, ownedRoot)
  ) {
    throw new Error("Phase 78 owned catalog authority check failed.");
  }
  const own = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (
    database === protectedCatalog ||
    (own.dev === protectedStat.dev && own.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 78 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 78 client is not bound to the caller-owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 78 owned copy must be migrated through 032.");
  }
}

async function insertRedirect(
  tx: Transaction,
  actionId: string,
): Promise<void> {
  const source = `/pen/${PHASE78_CURIDAS_RAW_SLUG}`;
  const target = `/pen/${PHASE78_CURIDAS_SLUG}`;
  const existing = await tx.execute({
    sql: "SELECT target_path, redirect_kind FROM entity_redirects WHERE source_path = ?",
    args: [source],
  });
  if (existing.rows.length === 1) {
    if (
      String(existing.rows[0]?.target_path) !== target ||
      String(existing.rows[0]?.redirect_kind) !== "permanent"
    ) {
      throw new Error("Phase 78 Curidas old route is occupied by a conflicting redirect.");
    }
    return;
  }
  if (existing.rows.length > 1) {
    throw new Error("Phase 78 Curidas old route has duplicate redirects.");
  }
  await tx.execute({
    sql: "INSERT INTO entity_redirects (id, batch_id, action_id, source_path, target_path, redirect_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'permanent', 'canonical_slug_rename')",
    args: [
      stableId("phase78-curidas-redirect", source),
      BATCH_ID,
      actionId,
      source,
      target,
    ],
  });
}

async function prepareCuridasIdentity(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const identities = await tx.execute({
      sql: "SELECT id, type, slug, name FROM entities WHERE id IN (?, ?) ORDER BY id",
      args: [PHASE78_PLATINUM_BRAND_ID, PHASE78_CURIDAS_ID],
    });
    const byId = new Map(identities.rows.map((row) => [String(row.id), row]));
    const brand = byId.get(PHASE78_PLATINUM_BRAND_ID);
    const curidas = byId.get(PHASE78_CURIDAS_ID);
    if (
      !brand ||
      String(brand.type) !== "brand" ||
      String(brand.slug) !== "platinum" ||
      !curidas ||
      String(curidas.type) !== "pen"
    ) {
      throw new Error("Phase 78 requires exact pre-existing Platinum and Curidas identities.");
    }
    const currentSlug = String(curidas.slug);
    if (
      currentSlug !== PHASE78_CURIDAS_RAW_SLUG &&
      currentSlug !== PHASE78_CURIDAS_SLUG
    ) {
      throw new Error(`Phase 78 Curidas has unexpected slug: ${currentSlug}.`);
    }
    const collision = await tx.execute({
      sql: "SELECT id FROM entities WHERE slug = ? AND id <> ?",
      args: [PHASE78_CURIDAS_SLUG, PHASE78_CURIDAS_ID],
    });
    if (collision.rows.length) {
      throw new Error("Phase 78 Curidas canonical slug is occupied.");
    }

    const makers = await tx.execute({
      sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by' ORDER BY target_id",
      args: [PHASE78_CURIDAS_ID],
    });
    if (
      makers.rows.length !== 1 ||
      String(makers.rows[0]?.target_id) !== PHASE78_PLATINUM_BRAND_ID
    ) {
      throw new Error("Phase 78 requires exactly one existing Curidas-to-Platinum maker relation.");
    }

    await tx.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_batches (id, source_key, source_checksum, status, note) VALUES (?, ?, ?, 'applied', ?)",
      args: [
        BATCH_ID,
        "phase78-platinum-curidas-identity-v1",
        digest("phase78-platinum-curidas-identity-v1"),
        "Canonicalize the verified Platinum Curidas route without merging Pilot Capless or Platinum Preppy.",
      ],
    });
    const actionId = stableId("phase78-curidas-rename", PHASE78_CURIDAS_ID);
    await tx.execute({
      sql: "INSERT OR IGNORE INTO taxonomy_actions (id, batch_id, source_row_key, action_kind, action_checksum, source_entity_id, target_entity_id, status, note) VALUES (?, ?, ?, 'rename', ?, ?, ?, 'applied', ?)",
      args: [
        actionId,
        BATCH_ID,
        PHASE78_CURIDAS_RAW_SLUG,
        digest(`${PHASE78_CURIDAS_ID}:${PHASE78_CURIDAS_RAW_SLUG}:${PHASE78_CURIDAS_SLUG}`),
        PHASE78_CURIDAS_ID,
        PHASE78_CURIDAS_ID,
        "Canonicalized the exact Platinum Curidas PKN-7000 route; no Capless or Preppy merge.",
      ],
    });
    if (currentSlug === PHASE78_CURIDAS_RAW_SLUG) {
      await tx.execute({
        sql: "UPDATE entities SET slug = ?, name = ? WHERE id = ?",
        args: [PHASE78_CURIDAS_SLUG, "Platinum Curidas", PHASE78_CURIDAS_ID],
      });
      await tx.execute({
        sql: "INSERT OR IGNORE INTO entity_lineage (id, batch_id, action_id, source_entity_id, target_entity_id, lineage_kind, fallback_reason) VALUES (?, ?, ?, ?, ?, 'rename', NULL)",
        args: [
          stableId("phase78-curidas-lineage", PHASE78_CURIDAS_ID),
          BATCH_ID,
          actionId,
          PHASE78_CURIDAS_ID,
          PHASE78_CURIDAS_ID,
        ],
      });
    }
    await insertRedirect(tx, actionId);
    await tx.execute({
      sql: "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)",
      args: [
        stableId("phase78-curidas-reverse", `${PHASE78_PLATINUM_BRAND_ID}:${PHASE78_CURIDAS_ID}`),
        PHASE78_PLATINUM_BRAND_ID,
        PHASE78_CURIDAS_ID,
        "Phase 78 Platinum-to-Curidas public navigation",
      ],
    });
    const reverse = await tx.execute({
      sql: "SELECT count(*) AS count FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse'",
      args: [PHASE78_PLATINUM_BRAND_ID, PHASE78_CURIDAS_ID],
    });
    if (Number(reverse.rows[0]?.count ?? 0) !== 1) {
      throw new Error("Phase 78 Curidas reverse navigation is ambiguous.");
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

async function assertPublicPlatinumModelLinks(client: Client): Promise<void> {
  const missing = await client.execute({
    sql: `SELECT pen.slug
            FROM public_entities pen
            JOIN entity_links maker
              ON maker.source_id = pen.id
             AND maker.target_id = ?
             AND maker.link_type = 'made_by'
       LEFT JOIN entity_links reverse
              ON reverse.source_id = ?
             AND reverse.target_id = pen.id
             AND reverse.link_type = 'reverse'
           WHERE pen.type = 'pen'
           GROUP BY pen.id, pen.slug
          HAVING count(reverse.id) <> 1
           ORDER BY pen.slug`,
    args: [PHASE78_PLATINUM_BRAND_ID, PHASE78_PLATINUM_BRAND_ID],
  });
  if (missing.rows.length) {
    throw new Error(
      `Phase 78 Platinum is missing reverse links for public models: ${missing.rows.map((row) => String(row.slug)).join(", ")}.`,
    );
  }
}

async function ensurePublicPlatinumModelLinks(client: Client): Promise<void> {
  const models = await client.execute({
    sql: `SELECT pen.id
            FROM public_entities pen
            JOIN entity_links maker
              ON maker.source_id = pen.id
             AND maker.target_id = ?
             AND maker.link_type = 'made_by'
           WHERE pen.type = 'pen'
           ORDER BY pen.id`,
    args: [PHASE78_PLATINUM_BRAND_ID],
  });
  const tx = await client.transaction("write");
  try {
    for (const row of models.rows) {
      const penId = String(row.id);
      const reverse = await tx.execute({
        sql: "SELECT id FROM entity_links WHERE source_id = ? AND target_id = ? AND link_type = 'reverse' ORDER BY id",
        args: [PHASE78_PLATINUM_BRAND_ID, penId],
      });
      if (reverse.rows.length > 1) {
        throw new Error(`Phase 78 found duplicate Platinum reverse links for ${penId}.`);
      }
      if (reverse.rows.length === 0) {
        await tx.execute({
          sql: "INSERT INTO entity_links (id, source_id, target_id, link_type, reason) VALUES (?, ?, ?, 'reverse', ?)",
          args: [
            stableId("phase78-platinum-public-reverse", `${PHASE78_PLATINUM_BRAND_ID}:${penId}`),
            PHASE78_PLATINUM_BRAND_ID,
            penId,
            "Phase 78 complete Platinum brand navigation for an already public model",
          ],
        });
      }
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

async function capturePublicPlatinumModels(client: Client): Promise<string[]> {
  const rows = await client.execute({
    sql: `SELECT pen.id
            FROM public_entities pen
            JOIN entity_links maker
              ON maker.source_id = pen.id
             AND maker.target_id = ?
             AND maker.link_type = 'made_by'
           WHERE pen.type = 'pen'
           ORDER BY pen.id`,
    args: [PHASE78_PLATINUM_BRAND_ID],
  });
  return rows.rows.map((row) => String(row.id));
}

async function republishModelsAfterNavigation(
  client: Client,
  modelIds: string[],
  reviewer: string,
): Promise<void> {
  for (const entityId of modelIds) {
    const currentHash = await computePublicationContentHash(client, entityId);
    const state = await client.execute({
      sql: `SELECT publication.status, publication.approved_content_hash,
                   publication.reviewed_content_revision, publication.content_revision,
                   publication.reviewed_contract_version, readiness.publishable,
                   readiness.blocker_count, CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
              FROM entity_publications publication
              LEFT JOIN public_entity_readiness readiness
                ON readiness.entity_id = publication.entity_id AND readiness.contract_version = 3
              LEFT JOIN public_entities public ON public.id = publication.entity_id
             WHERE publication.entity_id = ?`,
      args: [entityId],
    });
    const row = state.rows[0];
    if (
      row &&
      String(row.status) === "published" &&
      String(row.approved_content_hash ?? "") === currentHash &&
      Number(row.reviewed_content_revision) === Number(row.content_revision) &&
      Number(row.reviewed_contract_version) === 3 &&
      Number(row.publishable) === 1 &&
      Number(row.blocker_count) === 0 &&
      Number(row.is_public) === 1
    ) continue;
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId,
        reviewKind,
        reviewer,
        status: "approved",
        notes: "Phase 78 re-approves unchanged public Platinum model content after Curidas navigation updates.",
      });
    }
    await publishEntity(client, { entityId, reviewer });
  }
}

export async function applyPhase78PlatinumCuridasContent(
  client: Client,
  options: ApplyPhase78Options,
): Promise<ApplyPhase78Result> {
  await assertOwnedCatalog(client, options);
  const publicModelsBefore = await capturePublicPlatinumModels(client);
  await prepareCuridasIdentity(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    structuredClone(phase78PlatinumCuridasPacks),
  );
  await ensurePublicPlatinumModelLinks(client);
  await republishModelsAfterNavigation(client, publicModelsBefore, options.reviewer);
  await assertPublicPlatinumModelLinks(client);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}
