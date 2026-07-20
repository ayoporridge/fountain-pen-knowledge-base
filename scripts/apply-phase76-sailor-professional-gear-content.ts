import fs from "node:fs";
import path from "node:path";
import type { Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  PHASE76_PROFESSIONAL_GEAR_ID,
  PHASE76_PROFESSIONAL_GEAR_SLUG,
  PHASE76_SAILOR_BRAND_ID,
  phase76SailorProfessionalGearPacks,
} from "./data/phase76-sailor-professional-gear";

export type ApplyPhase76Options = ApplyPhase22Options;
export type ApplyPhase76Result = ApplyPhase22Result;

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
      throw new Error(`Phase 76 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertOwnedCatalog(
  client: Client,
  options: ApplyPhase76Options,
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
    throw new Error("Phase 76 owned catalog authority check failed.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedCatalog, { bigint: true });
  if (
    database === protectedCatalog ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 76 refuses the protected catalog or hard-link alias.");
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  const boundPath = main?.file
    ? fs.realpathSync.native(String(main.file))
    : null;
  if (boundPath !== database) {
    throw new Error("Phase 76 client is not bound to the caller-owned copy.");
  }
}

async function assertPhase76Prerequisites(client: Client): Promise<void> {
  const identities = await client.execute({
    sql: `SELECT id, type, slug
            FROM entities
           WHERE id IN (?, ?)
           ORDER BY id`,
    args: [PHASE76_SAILOR_BRAND_ID, PHASE76_PROFESSIONAL_GEAR_ID],
  });
  const byId = new Map(identities.rows.map((row) => [String(row.id), row]));
  const brand = byId.get(PHASE76_SAILOR_BRAND_ID);
  const pen = byId.get(PHASE76_PROFESSIONAL_GEAR_ID);
  if (
    !brand ||
    String(brand.type) !== "brand" ||
    String(brand.slug) !== "sailor" ||
    !pen ||
    String(pen.type) !== "pen" ||
    String(pen.slug) !== PHASE76_PROFESSIONAL_GEAR_SLUG
  ) {
    throw new Error("Phase 76 requires the pre-existing Sailor and Professional Gear identities.");
  }
  const links = await client.execute({
    sql: `SELECT
            (SELECT count(*) FROM entity_links
              WHERE source_id = ? AND target_id = ? AND link_type = 'made_by') AS makers,
            (SELECT count(*) FROM entity_links
              WHERE source_id = ? AND target_id = ? AND link_type = 'reverse') AS reverses`,
    args: [
      PHASE76_PROFESSIONAL_GEAR_ID,
      PHASE76_SAILOR_BRAND_ID,
      PHASE76_SAILOR_BRAND_ID,
      PHASE76_PROFESSIONAL_GEAR_ID,
    ],
  });
  if (
    Number(links.rows[0]?.makers ?? 0) !== 1 ||
    Number(links.rows[0]?.reverses ?? 0) !== 1
  ) {
    throw new Error("Phase 76 requires exactly one Sailor maker and reverse link for Professional Gear.");
  }
}

async function assertPublicSailorModelLinks(client: Client): Promise<void> {
  const brand = await client.execute({
    sql: "SELECT id FROM public_entities WHERE id = ? AND type = 'brand'",
    args: [PHASE76_SAILOR_BRAND_ID],
  });
  if (brand.rows.length !== 1) {
    throw new Error("Phase 76 Sailor brand must be public before its model links are accepted.");
  }
  const missing = await client.execute({
    sql: `SELECT pen.id, pen.slug
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
    args: [PHASE76_SAILOR_BRAND_ID, PHASE76_SAILOR_BRAND_ID],
  });
  if (missing.rows.length > 0) {
    throw new Error(
      `Phase 76 Sailor brand is missing reverse links for public models: ${missing.rows.map((row) => String(row.slug)).join(", ")}.`,
    );
  }
}

export async function applyPhase76SailorProfessionalGearContent(
  client: Client,
  options: ApplyPhase76Options,
): Promise<ApplyPhase76Result> {
  await assertOwnedCatalog(client, options);
  await assertPhase76Prerequisites(client);
  const result = await applyCuratedContentPacks(
    client,
    options,
    phase76SailorProfessionalGearPacks,
  );
  await assertPublicSailorModelLinks(client);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}
