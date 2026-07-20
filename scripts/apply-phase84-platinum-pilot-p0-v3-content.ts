import fs from "node:fs";
import path from "node:path";
import type { Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import { publishEntity, recordEntityContentReview } from "../src/lib/publication";
import { applyCuratedContentPacks, type ApplyPhase22Options, type ApplyPhase22Result } from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import { PHASE43_CAPLESS_ID } from "./data/phase43-pilot-capless";
import { PHASE44_PLAISIR_ID, PHASE44_PREFOUNTE_ID, PHASE44_PREPPY_ID } from "./data/phase44-platinum-low-price";
import { PHASE47_PILOT_823_ID } from "./data/phase47-pilot-custom-823";
import { PHASE52_PLATINUM_3776_ID } from "./data/phase52-lamy-platinum-core";
import { PHASE60_CUSTOM_912_ID } from "./data/phase60-pilot-p0";
import { phase84PlatinumPilotP0V3BrandPacks, phase84PlatinumPilotP0V3Packs } from "./data/phase84-platinum-pilot-p0-v3";

export type ApplyPhase84Options = ApplyPhase22Options;
export type ApplyPhase84Result = ApplyPhase22Result;

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function assertNoRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 84 refuses inherited remote selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase84Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 84 owned catalog authority check failed.");
  }
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)) {
    throw new Error("Phase 84 refuses protected catalog or hard-link alias.");
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 84 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 84 owned copy must be migrated through 032.");
}

const TARGETS = [
  { id: PHASE52_PLATINUM_3776_ID, slug: "platinum-3776-century", brandId: "e51tJpejEkXY" },
  { id: PHASE44_PREPPY_ID, slug: "platinum-preppy", brandId: "e51tJpejEkXY" },
  { id: PHASE44_PREFOUNTE_ID, slug: "platinum-prefounte", brandId: "e51tJpejEkXY" },
  { id: PHASE44_PLAISIR_ID, slug: "platinum-plaisir", brandId: "e51tJpejEkXY" },
  { id: PHASE43_CAPLESS_ID, slug: "pilot-capless", brandId: "Zt-PbXkE7UHM" },
  { id: PHASE47_PILOT_823_ID, slug: "pilot-custom-823", brandId: "Zt-PbXkE7UHM" },
  { id: PHASE60_CUSTOM_912_ID, slug: "pilot-custom-heritage-912", brandId: "Zt-PbXkE7UHM" },
] as const;

async function assertExactTopology(client: Client): Promise<void> {
  const brands = new Map<string, string>([["e51tJpejEkXY", "platinum"], ["Zt-PbXkE7UHM", "pilot"]]);
  for (const [id, slug] of brands) {
    const brand = await client.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [id] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== slug) {
      throw new Error(`Phase 84 prerequisite brand identity mismatch: ${id}.`);
    }
  }
  for (const target of TARGETS) {
    const entity = await client.execute({ sql: "SELECT type, slug FROM entities WHERE id = ?", args: [target.id] });
    if (entity.rows.length !== 1 || String(entity.rows[0]?.type) !== "pen" || String(entity.rows[0]?.slug) !== target.slug) {
      throw new Error(`Phase 84 requires prior exact canonical identity: ${target.slug}.`);
    }
    const makers = await client.execute({ sql: "SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by' ORDER BY target_id", args: [target.id] });
    if (makers.rows.length !== 1 || String(makers.rows[0]?.target_id) !== target.brandId) {
      throw new Error(`Phase 84 requires exactly one verified maker for ${target.slug}.`);
    }
  }
}

async function republishBrandAfterModelUpdates(client: Client, brandId: string, reviewer: string): Promise<void> {
  const current = await client.execute({
    sql: "SELECT publication.status, readiness.publishable, readiness.blocker_count, CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entity_publications publication LEFT JOIN public_entity_readiness readiness ON readiness.entity_id = publication.entity_id AND readiness.contract_version = 3 LEFT JOIN public_entities public ON public.id = publication.entity_id WHERE publication.entity_id = ?",
    args: [brandId],
  });
  if (current.rows.length !== 1) throw new Error(`Phase 84 brand publication state is missing: ${brandId}.`);
  if (String(current.rows[0]?.status) === "published" && Number(current.rows[0]?.publishable) === 1 && Number(current.rows[0]?.blocker_count) === 0 && Number(current.rows[0]?.is_public) === 1) return;
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, { entityId: brandId, reviewKind, reviewer, status: "approved", notes: "Phase 84 re-approves the unchanged brand page after its exact model pages update." });
  }
  await publishEntity(client, { entityId: brandId, reviewer });
}

async function currentPhase84Replay(client: Client, workspaceRoot: string): Promise<ApplyPhase84Result | null> {
  const packs = phase84PlatinumPilotP0V3Packs.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  const entities: ApplyPhase84Result["entities"] = [];
  for (const pack of packs) {
    const row = await client.execute({
      sql: "SELECT entity.source, publication.status, publication.approved_content_hash, readiness.publishable, readiness.blocker_count, CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id = entity.id LEFT JOIN public_entity_readiness readiness ON readiness.entity_id = entity.id AND readiness.contract_version = 3 LEFT JOIN public_entities public ON public.id = entity.id WHERE entity.id = ?",
      args: [pack.entityId],
    });
    const current = row.rows[0];
    if (!current || String(current.source) !== pack.sourceMarker || String(current.status) !== "published") return null;
    entities.push({ entityId: pack.entityId, outcome: "noop", contentHash: String(current.approved_content_hash ?? pack.sourceMarker) });
  }
  return { entities };
}

export async function applyPhase84PlatinumPilotP0V3Content(client: Client, options: ApplyPhase84Options): Promise<ApplyPhase84Result> {
  await assertOwned(client, options);
  await assertExactTopology(client);
  const replay = await currentPhase84Replay(client, options.workspaceRoot);
  if (replay) return replay;
  const entities: ApplyPhase84Result["entities"] = [];
  for (const brandId of ["e51tJpejEkXY", "Zt-PbXkE7UHM"]) {
    const brand = phase84PlatinumPilotP0V3BrandPacks.find((pack) => pack.entityId === brandId);
    if (!brand) throw new Error(`Phase 84 brand publication pack is missing: ${brandId}.`);
    const pens = phase84PlatinumPilotP0V3Packs.filter((pack) => pack.spec?.brandEntityId === brandId);
    const result = await applyCuratedContentPacks(client, options, structuredClone([brand, ...pens]));
    await republishBrandAfterModelUpdates(client, brandId, options.reviewer);
    entities.push(...result.entities.filter((entity) => TARGETS.some((target) => target.id === entity.entityId)));
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities };
}
