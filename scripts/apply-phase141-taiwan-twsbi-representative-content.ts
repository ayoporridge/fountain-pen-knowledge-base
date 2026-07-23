import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, type Transaction, createClient } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import {
  applyCuratedContentPacks,
  insertPack,
  uniqueSources,
  upsertSources,
  validatePack,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import { applyPhase57Opus88LeonardoContent } from "./apply-phase57-opus88-leonardo-content";
import { applyPhase70TwsbiP0Content } from "./apply-phase70-twsbi-p0-content";
import { CYPRESS_CROWN_MINI_DECISION, loadPhase141Packs, PHASE141_BRANDS, PHASE141_IDS, PHASE141_SLUGS, PHASE141_TWSBI_BRAND_ID, phase141Groups } from "./data/phase141-taiwan-twsbi-representative-batch";
import { loadCuratedEntityPack, type CuratedEntityPack, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";
import { computePublicationContentHash, publishEntity, recordEntityContentReview } from "../src/lib/publication";

export type ApplyPhase141Options = ApplyPhase22Options;
export type ApplyPhase141Result = ApplyPhase22Result & { cypress: typeof CYPRESS_CROWN_MINI_DECISION };

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function inside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }

async function rows(client: Client | Transaction, sql: string, args: unknown[] = []) { return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row })); }

function assertNoRemote(options: ApplyPhase141Options): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) throw new Error(`Phase 141 refuses inherited remote database selection: ${key}.`);
  }
}

async function assertAuthority(client: Client, options: ApplyPhase141Options): Promise<void> {
  assertNoRemote(options);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!inside(databasePath, ownedRoot) || fs.lstatSync(options.databasePath).isSymbolicLink()) throw new Error("Phase 141 owned catalog authority check failed.");
  const own = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 141 refuses protected catalog or hard-link alias.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 141 client is not bound to owned copy.");
}

async function prepareTopology(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const tx = await client.transaction("write");
  try {
    for (const pack of packs.filter((candidate) => candidate.expectedType === "brand" && ![PHASE141_BRANDS.opus88, PHASE141_BRANDS.twsbi].includes(candidate.entityId as never))) {
      const existing = await rows(tx, "SELECT id,type,slug,name FROM entities WHERE id=?", [pack.entityId]);
      if (existing.length === 0) await tx.execute({ sql: "INSERT INTO entities(id,type,slug,name) VALUES(?, 'brand', ?, ?)", args: [pack.entityId, pack.expectedSlug, pack.canonicalName] });
      else if (existing.length !== 1 || existing[0]?.type !== "brand" || existing[0]?.slug !== pack.expectedSlug) throw new Error(`Phase 141 brand identity collision: ${pack.entityId}`);
    }
    const brandById = new Map(packs.filter((candidate) => candidate.expectedType === "brand").map((pack) => [pack.entityId, pack]));
    for (const pack of packs.filter((candidate) => candidate.expectedType === "pen")) {
      const brandId = pack.spec?.brandEntityId;
      if (!brandId || !brandById.has(brandId)) throw new Error(`Phase 141 missing maker for ${pack.entityId}`);
      const existing = await rows(tx, "SELECT id,type,slug,name FROM entities WHERE id=?", [pack.entityId]);
      if (existing.length === 0) await tx.execute({ sql: "INSERT INTO entities(id,type,slug,name) VALUES(?, 'pen', ?, ?)", args: [pack.entityId, pack.expectedSlug, pack.canonicalName] });
      else if (
        existing.length !== 1 ||
        existing[0]?.type !== "pen" ||
        existing[0]?.slug !== pack.expectedSlug ||
        (pack.entityId !== PHASE141_IDS.diamond580 && existing[0]?.name !== pack.canonicalName)
      ) throw new Error(`Phase 141 model identity collision: ${pack.entityId}`);
      await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [pack.entityId, brandId] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [stableId("phase141-made-by", `${pack.entityId}:${brandId}`), pack.entityId, brandId, "Phase 141 verified maker relation"] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [stableId("phase141-reverse", `${brandId}:${pack.entityId}`), brandId, pack.entityId, "Phase 141 representative model navigation"] });
    }
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

async function canonicalizeMixed580(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    const row = await rows(tx, "SELECT type,slug,name FROM entities WHERE id=?", [PHASE141_IDS.diamond580]);
    if (row.length !== 1 || row[0]?.type !== "pen" || !["三文堂-twsbi-580-580al", PHASE141_SLUGS.diamond580].includes(String(row[0]?.slug))) throw new Error("Phase 141 mixed TWSBI 580 identity mismatch.");
    if (row[0]?.slug === "三文堂-twsbi-580-580al") {
      const batchKey = "phase141-twsbi-diamond-580-standard-rename-v1";
      const batchId = stableId("phase141-batch", batchKey);
      const actionId = stableId("phase141-action", batchKey);
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)", args: [batchId, batchKey, digest(batchKey), "Resolve mixed 580/580AL donor in place as standard Diamond 580; create ALR sibling separately."] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'rename',?,?,?,'applied',?)", args: [actionId, batchId, "三文堂-twsbi-580-580al", digest(`${PHASE141_IDS.diamond580}:${PHASE141_SLUGS.diamond580}`), PHASE141_IDS.diamond580, PHASE141_IDS.diamond580, "Resolved raw mixed identity to standard Diamond 580."] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_lineage(id,batch_id,action_id,source_entity_id,target_entity_id,lineage_kind,fallback_reason) VALUES(?,?,?, ?, ?, 'rename', NULL)", args: [stableId("phase141-lineage", PHASE141_IDS.diamond580), batchId, actionId, PHASE141_IDS.diamond580, PHASE141_IDS.diamond580] });
      await tx.execute({ sql: "UPDATE entities SET slug=?,name=?,updated_at=datetime('now') WHERE id=?", args: [PHASE141_SLUGS.diamond580, "三文堂 TWSBI Diamond 580", PHASE141_IDS.diamond580] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_redirects(id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES(?,?,?,? ,?,'permanent','canonical_slug_rename')", args: [stableId("phase141-redirect", "三文堂-twsbi-580-580al"), batchId, actionId, "/pen/三文堂-twsbi-580-580al", `/pen/${PHASE141_SLUGS.diamond580}`] });
    }
    await tx.execute({ sql: "DELETE FROM entity_links WHERE source_id=? AND link_type='made_by' AND target_id<>?", args: [PHASE141_IDS.diamond580, PHASE141_TWSBI_BRAND_ID] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [stableId("phase141-made-by", `${PHASE141_IDS.diamond580}:${PHASE141_TWSBI_BRAND_ID}`), PHASE141_IDS.diamond580, PHASE141_TWSBI_BRAND_ID, "Phase 141 standard Diamond 580 maker relation"] });
    await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [stableId("phase141-reverse", `${PHASE141_TWSBI_BRAND_ID}:${PHASE141_IDS.diamond580}`), PHASE141_TWSBI_BRAND_ID, PHASE141_IDS.diamond580, "Phase 141 standard Diamond 580 navigation"] });
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

async function modelAlreadyPublished(client: Client, pack: LoadedCuratedEntityPack): Promise<boolean> {
  const row = await client.execute({
    sql: `
      SELECT entity.source, publication.status, readiness.blocker_count,
             readiness.publishable,
             CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
      FROM entities entity
      JOIN entity_publications publication ON publication.entity_id = entity.id
      LEFT JOIN public_entity_readiness readiness
        ON readiness.entity_id = entity.id AND readiness.contract_version = 3
      LEFT JOIN public_entities public ON public.id = entity.id
      WHERE entity.id = ?
    `,
    args: [pack.entityId],
  });
  const current = row.rows[0];
  return Boolean(
    current &&
      String(current.source ?? "") === pack.sourceMarker &&
      String(current.status) === "published" &&
      Number(current.blocker_count) === 0 &&
      Number(current.publishable) === 1 &&
      Number(current.is_public) === 1,
  );
}

async function applyModelOnlyContentPack(
  client: Client,
  options: ApplyPhase141Options,
  rawPack: CuratedEntityPack,
): Promise<ApplyPhase22Result["entities"][number]> {
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const pack = loadCuratedEntityPack(workspaceRoot, rawPack);
  if (pack.expectedType !== "pen") throw new Error(`Phase 141 model-only route requires a pen pack: ${pack.key}`);
  validatePack(workspaceRoot, pack);
  if (await modelAlreadyPublished(client, pack)) {
    return { entityId: pack.entityId, outcome: "noop", contentHash: await computePublicationContentHash(client, pack.entityId) };
  }
  const identity = await client.execute({
    sql: "SELECT type, slug FROM entities WHERE id = ?",
    args: [pack.entityId],
  });
  if (identity.rows.length !== 1 || String(identity.rows[0]?.type) !== "pen" || String(identity.rows[0]?.slug) !== pack.expectedSlug) {
    throw new Error(`Phase 141 model-only identity mismatch: ${pack.entityId}`);
  }
  const brandId = pack.spec?.brandEntityId;
  if (!brandId) throw new Error(`Phase 141 model-only pack has no brand: ${pack.entityId}`);
  const madeBy = await client.execute({
    sql: `SELECT target_id FROM entity_links WHERE source_id = ? AND link_type = 'made_by'`,
    args: [pack.entityId],
  });
  if (madeBy.rows.length !== 1 || String(madeBy.rows[0]?.target_id) !== brandId) {
    throw new Error(`Phase 141 model-only maker relation is missing or ambiguous: ${pack.entityId}`);
  }

  const transaction = await client.transaction("write");
  try {
    const sourceItemIds = await upsertSources(transaction, uniqueSources([pack]));
    await insertPack(transaction, pack, sourceItemIds);
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }

  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: pack.entityId,
      reviewKind,
      reviewer: options.reviewer,
      status: "approved",
      notes: `${pack.sourceMarker}; ${reviewKind} review of checked-in sourced copy.`,
    });
  }
  const published = await publishEntity(client, { entityId: pack.entityId, reviewer: options.reviewer });
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entityId: pack.entityId, outcome: "published", contentHash: published.contentHash };
}

async function refreshExistingBrandPublication(client: Client, options: ApplyPhase141Options, entityId: string): Promise<void> {
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId,
      reviewKind,
      reviewer: options.reviewer,
      status: "approved",
      notes: `Phase 141 topology review; existing brand copy retained while representative model links were added.`,
    });
  }
  await publishEntity(client, { entityId, reviewer: options.reviewer });
}

export async function applyPhase141TaiwanTwsbiRepresentativeContent(client: Client, options: ApplyPhase141Options): Promise<ApplyPhase141Result> {
  await assertAuthority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = loadPhase141Packs(workspaceRoot);
  await applyPhase57Opus88LeonardoContent(client, options);
  await applyPhase70TwsbiP0Content(client, options);
  await canonicalizeMixed580(client);
  await prepareTopology(client, packs);
  await refreshExistingBrandPublication(client, options, PHASE141_BRANDS.opus88);
  await refreshExistingBrandPublication(client, options, PHASE141_BRANDS.twsbi);
  const byId = new Map(packs.map((pack) => [pack.entityId, pack]));
  const resultEntities: ApplyPhase22Result["entities"] = [];
  for (const group of phase141Groups.slice(0, 4)) {
    const applied = await applyCuratedContentPacks(client, options, [group.brand, ...group.pens]);
    resultEntities.push(...applied.entities);
  }
  for (const modelId of [PHASE141_IDS.omar, PHASE141_IDS.swipe, PHASE141_IDS.diamond580, PHASE141_IDS.diamond580alr]) {
    const pack = byId.get(modelId);
    if (!pack) throw new Error(`Phase 141 model pack missing: ${modelId}`);
    resultEntities.push(await applyModelOnlyContentPack(client, options, pack));
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities: resultEntities, cypress: CYPRESS_CROWN_MINI_DECISION };
}

function cliValue(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main(): Promise<void> {
  const database = cliValue("--database"); const ownedRoot = cliValue("--owned-root"); const protectedCatalog = cliValue("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) throw new Error("Usage: tsx scripts/apply-phase141-taiwan-twsbi-representative-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const client = createClient({ url: `file:${path.resolve(database)}` });
  try {
    const result = await applyPhase141TaiwanTwsbiRepresentativeContent(client, { workspaceRoot: process.cwd(), reviewer: cliValue("--reviewer") ?? "phase141-taiwan-twsbi", databasePath: path.resolve(database), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalog), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalog)), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
