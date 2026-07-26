import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import {
  insertPack,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
  uniqueSources,
  upsertSources,
  validatePack,
} from "./apply-phase22-content";
import { loadCuratedEntityPack } from "./lib/curated-content-pack";
import { computePublicationContentHash, publishEntity, recordEntityContentReview } from "../src/lib/publication";
import {
  PHASE248_M200_ID,
  PHASE248_PELIKAN_ID,
  PHASE248_TWIST_ID,
  PHASE248_TWIST_OLD_SLUG,
  PHASE248_TWIST_SLUG,
  phase248PelikanM200TwistPacks,
} from "./data/phase248-pelikan-m200-twist";

export type ApplyPhase248Options = ApplyPhase22Options;
export type ApplyPhase248Result = ApplyPhase22Result;

const SOURCE_KEY = "phase248-pelikan-m200-twist-reclassification-v1";
const PENS = [
  { id: PHASE248_M200_ID, slug: "pelikan-m200", legacySlug: "pelikan-m200", name: "百利金 Pelikan M200" },
  { id: PHASE248_TWIST_ID, slug: PHASE248_TWIST_SLUG, legacySlug: PHASE248_TWIST_OLD_SLUG, name: "百利金 Pelikan Twist" },
] as const;

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
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 248 refuses inherited remote selection: ${key}.`);
  }
}

async function assertOwned(client: Client, options: ApplyPhase248Options): Promise<void> {
  assertNoRemoteSelection(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || fs.lstatSync(options.databasePath).isSymbolicLink() || !isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 248 owned catalog authority check failed.");
  }
  const own = fs.statSync(databasePath, { bigint: true });
  const real = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (own.dev === real.dev && own.ino === real.ino)) throw new Error("Phase 248 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 248 client is not bound to owned copy.");
  const migration = await client.execute({ sql: "SELECT 1 AS ok FROM migrations WHERE name = ? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 248 owned copy must be migrated through 032.");
}

async function ensureIdentityAndTopology(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const brand = await tx.execute({ sql: "SELECT type,slug FROM entities WHERE id=?", args: [PHASE248_PELIKAN_ID] });
    if (brand.rows.length !== 1 || String(brand.rows[0]?.type) !== "brand" || String(brand.rows[0]?.slug) !== "pelikan") throw new Error("Phase 248 Pelikan brand identity mismatch.");
    const batchId = stableId("phase248-taxonomy-batch", SOURCE_KEY);
    await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches (id,source_key,source_checksum,status,note) VALUES (?,?,?,'applied',?)", args: [batchId, SOURCE_KEY, digest(SOURCE_KEY), "Canonicalize Pelikan Twist family route and separate its content from M200."] });
    for (const pen of PENS) {
      const current = await tx.execute({ sql: "SELECT type,slug,name FROM entities WHERE id=?", args: [pen.id] });
      if (current.rows.length !== 1 || String(current.rows[0]?.type) !== "pen") throw new Error(`Phase 248 entity identity mismatch: ${pen.id}`);
      const actualSlug = String(current.rows[0]?.slug ?? "");
      if (actualSlug !== pen.slug && actualSlug !== pen.legacySlug) throw new Error(`Phase 248 unexpected slug for ${pen.id}: ${actualSlug}`);
      const collision = await tx.execute({ sql: "SELECT id FROM entities WHERE slug=? AND id<>?", args: [pen.slug, pen.id] });
      if (collision.rows.length > 0) throw new Error(`Phase 248 canonical slug collision: ${pen.slug}`);
      const actionKey = `${pen.id}:${pen.legacySlug}:${pen.slug}`;
      const actionId = stableId("phase248-taxonomy-action", actionKey);
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions (id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES (?,?,?,'rename',?,?,?,'applied',?)", args: [actionId, batchId, pen.id, digest(actionKey), pen.id, pen.id, `Canonicalize ${pen.name} route without creating a duplicate entity.`] });
      if (actualSlug !== pen.slug || String(current.rows[0]?.name) !== pen.name) {
        await tx.execute({ sql: "UPDATE entities SET slug=?,name=?,updated_at=datetime('now') WHERE id=?", args: [pen.slug, pen.name, pen.id] });
      }
      if (pen.legacySlug !== pen.slug) {
        const sourcePath = `/pen/${pen.legacySlug}`;
        const targetPath = `/pen/${pen.slug}`;
        const redirect = await tx.execute({ sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?", args: [sourcePath] });
        if (redirect.rows.length === 0) {
          await tx.execute({ sql: "INSERT INTO entity_redirects (id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES (?,?,?,?,?,'permanent','canonical_slug_rename')", args: [stableId("phase248-redirect", sourcePath), batchId, actionId, sourcePath, targetPath] });
        } else if (String(redirect.rows[0]?.target_path) !== targetPath || String(redirect.rows[0]?.redirect_kind) !== "permanent") {
          throw new Error(`Phase 248 conflicting redirect: ${sourcePath}`);
        }
      }
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [pen.id, PHASE248_PELIKAN_ID] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links (id,source_id,target_id,link_type,reason) VALUES (?,?,?,'made_by',?)", args: [stableId("phase248-link", `${pen.id}:made_by:${PHASE248_PELIKAN_ID}`), pen.id, PHASE248_PELIKAN_ID, "Phase 248 canonical Pelikan maker"] });
      const maker = await tx.execute({ sql: "SELECT count(*) AS value FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'", args: [pen.id, PHASE248_PELIKAN_ID] });
      if (Number(maker.rows[0]?.value ?? 0) !== 1) throw new Error(`Phase 248 maker topology failed: ${pen.id}`);
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

export async function applyPhase248PelikanM200TwistContent(client: Client, options: ApplyPhase248Options): Promise<ApplyPhase248Result> {
  await assertOwned(client, options);
  await ensureIdentityAndTopology(client);
  const packs = structuredClone(phase248PelikanM200TwistPacks)
    .filter((pack) => pack.expectedType === "pen")
    .map((pack) => loadCuratedEntityPack(fs.realpathSync.native(options.workspaceRoot), pack));
  for (const pack of packs) validatePack(fs.realpathSync.native(options.workspaceRoot), pack);

  const appliedFlags: boolean[] = [];
  for (const pack of packs) {
    const row = await client.execute({ sql: "SELECT entity.source,publication.status,publication.approved_content_hash,publication.content_revision,publication.reviewed_content_revision,publication.reviewed_contract_version FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id WHERE entity.id=?", args: [pack.entityId] });
    const current = row.rows[0];
    appliedFlags.push(Boolean(current && String(current.source ?? "") === pack.sourceMarker && String(current.status) === "published" && String(current.approved_content_hash ?? "") !== "" && Number(current.reviewed_content_revision) === Number(current.content_revision) && Number(current.reviewed_contract_version) === 3));
  }
  if (appliedFlags.every(Boolean)) {
    const entities: ApplyPhase248Result["entities"] = [];
    for (const pack of packs) entities.push({ entityId: pack.entityId, outcome: "noop", contentHash: await computePublicationContentHash(client, pack.entityId) });
    return { entities };
  }
  const transaction = await client.transaction("write");
  try {
    const sourceItemIds = await upsertSources(transaction, uniqueSources(packs));
    for (const pack of packs) await insertPack(transaction, pack, sourceItemIds);
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
  const entities: ApplyPhase248Result["entities"] = [];
  for (const pack of packs) {
    const contentHash = await computePublicationContentHash(client, pack.entityId);
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, { entityId: pack.entityId, reviewKind, contentHash, reviewer: options.reviewer.trim(), status: "approved", notes: `${pack.sourceMarker}; ${reviewKind} review of Phase 248 checked-in sourced copy.` });
    }
    const published = await publishEntity(client, { entityId: pack.entityId, contentHash, reviewer: options.reviewer.trim() });
    entities.push({ entityId: pack.entityId, outcome: "published", contentHash: published.contentHash });
  }
  const result = { entities } satisfies ApplyPhase248Result;
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function cliValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const workspaceRoot = process.cwd();
  const databasePath = cliValue("--database");
  const ownedRoot = cliValue("--owned-root");
  const protectedCatalogPath = cliValue("--protected-catalog");
  const reviewer = cliValue("--reviewer") ?? "phase248-pelikan-m200-twist";
  if (!databasePath || !ownedRoot || !protectedCatalogPath) throw new Error("Usage: tsx scripts/apply-phase248-pelikan-m200-twist.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const protectedCatalogSnapshot = snapshotCatalogFiles(protectedCatalogPath);
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    const result = await applyPhase248PelikanM200TwistContent(client, {
      workspaceRoot,
      reviewer,
      databasePath: path.resolve(databasePath),
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalogPath),
      protectedCatalogSnapshot,
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
