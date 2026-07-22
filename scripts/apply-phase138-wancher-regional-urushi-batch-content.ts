import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, createClient } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { computePublicationContentHash, publishEntity, recordEntityContentReview } from "../src/lib/publication";
import { insertPack, type ApplyPhase22Options, type ApplyPhase22Result, uniqueSources, upsertSources, validatePack } from "./apply-phase22-content";
import { applyPhase135WancherDreamPenTrueEboniteMarbleGreenContent } from "./apply-phase135-wancher-dream-pen-true-ebonite-marble-green-content";
import {
  loadPhase138WancherRegionalUrushiPacks,
  phase138MadeById,
  phase138ReverseId,
  PHASE138_DREAM_ARTICLE_ID,
  PHASE138_PROTECTED_IDS,
  PHASE138_WANCHER_ID,
} from "./data/phase138-wancher-regional-urushi-batch";
import type { LoadedCuratedEntityPack } from "./lib/curated-content-pack";

export type ApplyPhase138Options = ApplyPhase22Options;
export type ApplyPhase138Result = ApplyPhase22Result;

function hash(value: string) { return createHash("sha256").update(value).digest("hex"); }
async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}
async function entityDigest(client: Client, entityId: string, topology = true) {
  const queries = [
    "SELECT * FROM entities WHERE id=?", "SELECT * FROM stories WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_references WHERE entity_id=? ORDER BY id", "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id",
    "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id", "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id",
    "SELECT * FROM model_specs WHERE entity_id=? ORDER BY id", "SELECT * FROM model_variants WHERE model_entity_id=? ORDER BY id",
    "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id", "SELECT * FROM timeline_events WHERE entity_id=? ORDER BY id",
    ...(topology ? ["SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id", "SELECT * FROM entity_publications WHERE entity_id=?", "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash"] : []),
  ];
  const payload = [];
  for (const sql of queries) payload.push(await rows(client, sql, sql.includes(" OR ") ? [entityId, entityId] : [entityId]));
  return hash(JSON.stringify(payload));
}

async function exactBaseline(client: Client) {
  const ids = [PHASE138_WANCHER_ID, ...PHASE138_PROTECTED_IDS];
  const found = await rows(client, `SELECT entity.id,entity.type,entity.source,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity LEFT JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id IN (${ids.map(() => "?").join(",")})`, ids);
  if (found.length !== ids.length) throw new Error("Phase 138 requires the complete published Wancher baseline.");
  for (const row of found) {
    const expectedType = row.id === PHASE138_WANCHER_ID ? "brand" : row.id === PHASE138_DREAM_ARTICLE_ID ? "article" : "pen";
    const validArticle = expectedType === "article" && String(row.source).startsWith("curated:phase104:") && row.status == null && Number(row.is_public) === 1;
    const validPublished = expectedType !== "article" && String(row.source).startsWith("curated-content:") && row.status === "published" && Number(row.is_public) === 1;
    if (row.type !== expectedType || (!validArticle && !validPublished))
      throw new Error(`Phase 138 Wancher baseline is invalid: ${String(row.id)}.`);
  }
}

async function inspectState(client: Client, packs: LoadedCuratedEntityPack[]) {
  const states = new Set<"empty" | "terminal">();
  for (const pack of packs) {
    const names = [pack.canonicalName, ...pack.aliases.map((alias) => alias.alias)];
    const found = await rows(client, `SELECT DISTINCT entity.id,entity.type,entity.slug,entity.name,entity.source FROM entities entity LEFT JOIN entity_aliases alias ON alias.entity_id=entity.id WHERE entity.id=? OR entity.slug=? OR lower(entity.name) IN (${names.map(() => "lower(?)").join(",")}) OR lower(COALESCE(alias.alias,'')) IN (${names.map(() => "lower(?)").join(",")}) OR entity.source=?`, [pack.entityId, pack.expectedSlug, ...names, ...names, pack.sourceMarker]);
    if (found.length === 0) { states.add("empty"); continue; }
    if (found.length !== 1 || found[0]?.id !== pack.entityId || found[0]?.type !== "pen" || found[0]?.slug !== pack.expectedSlug || found[0]?.name !== pack.canonicalName || found[0]?.source !== pack.sourceMarker)
      throw new Error(`Phase 138 target identity is partial, alternate or colliding: ${pack.entityId}.`);
    states.add("terminal");
  }
  if (states.size !== 1) throw new Error("Phase 138 refuses mixed empty/terminal target state.");
  return [...states][0]!;
}

async function collisionPreflight(client: Client, packs: LoadedCuratedEntityPack[]) {
  const aliases = packs.flatMap((pack) => pack.aliases.map((alias) => alias.alias));
  const aliasOwners = await rows(client, `SELECT entity_id,alias FROM entity_aliases WHERE lower(alias) IN (${aliases.map(() => "lower(?)").join(",")}) AND entity_id NOT IN (${packs.map(() => "?").join(",")})`, [...aliases, ...packs.map((pack) => pack.entityId)]);
  const markerOwners = await rows(client, `SELECT id FROM entities WHERE source IN (${packs.map(() => "?").join(",")}) AND id NOT IN (${packs.map(() => "?").join(",")})`, [...packs.map((pack) => pack.sourceMarker), ...packs.map((pack) => pack.entityId)]);
  if (aliasOwners.length > 0 || markerOwners.length > 0) throw new Error("Phase 138 target alias/source collision; repair forbidden.");
}

async function reviewPublish(client: Client, entityId: string, reviewer: string, note: string) {
  for (const reviewKind of ["fact", "language", "media"] as const)
    await recordEntityContentReview(client, { entityId, reviewKind, reviewer, status: "approved", notes: note });
  return (await publishEntity(client, { entityId, reviewer })).contentHash;
}

async function terminal(client: Client, packs: LoadedCuratedEntityPack[]) {
  const hashes: string[] = [];
  for (const pack of packs) {
    const current = await computePublicationContentHash(client, pack.entityId);
    hashes.push(current);
    const row = (await rows(client, `SELECT entity.type,entity.slug,entity.name,entity.source,publication.status,publication.approved_content_hash,publication.content_revision,publication.reviewed_content_revision,publication.reviewed_contract_version,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id=?`, [pack.entityId]))[0];
    const aliases = (await rows(client, "SELECT alias FROM entity_aliases WHERE entity_id=? ORDER BY alias", [pack.entityId])).map((item) => String(item.alias));
    const links = (await rows(client, "SELECT id FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY id", [pack.entityId, pack.entityId])).map((item) => String(item.id));
    const reviews = await rows(client, "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind", [pack.entityId, current]);
    const counts = (await rows(client, `SELECT (SELECT count(*) FROM stories WHERE entity_id=?) stories,(SELECT count(*) FROM entity_references WHERE entity_id=?) refs,(SELECT count(*) FROM fact_scopes WHERE entity_id=?) scopes,(SELECT count(*) FROM claims WHERE subject_entity_id=?) claims,(SELECT count(*) FROM model_specs WHERE entity_id=?) specs,(SELECT count(*) FROM model_variants WHERE model_entity_id=?) variants,(SELECT count(*) FROM media_assets WHERE entity_id=?) media,(SELECT count(*) FROM timeline_events WHERE entity_id=?) timeline`, Array(8).fill(pack.entityId)))[0];
    if (row?.type !== "pen" || row?.slug !== pack.expectedSlug || row?.name !== pack.canonicalName || row?.source !== pack.sourceMarker || row?.status !== "published" || row?.approved_content_hash !== current || Number(row?.content_revision) !== Number(row?.reviewed_content_revision) || Number(row?.reviewed_contract_version) !== 3 || Number(row?.is_public) !== 1 || JSON.stringify(aliases) !== JSON.stringify(pack.aliases.map((alias) => alias.alias).sort()) || JSON.stringify(links) !== JSON.stringify([phase138MadeById(pack.entityId), phase138ReverseId(pack.entityId)].sort()) || JSON.stringify(reviews.map((review) => String(review.review_kind))) !== JSON.stringify(["fact", "language", "media", "publication"]) || reviews.some((review) => review.status !== "approved") || Number(counts?.stories) !== 1 || Number(counts?.refs) !== pack.sources.length || Number(counts?.scopes) !== pack.scopes.length || Number(counts?.claims) !== pack.claims.length || Number(counts?.specs) !== 1 || Number(counts?.variants) !== (pack.variants?.length ?? 0) || Number(counts?.media) !== pack.media.length || Number(counts?.timeline) !== (pack.timeline?.length ?? 0))
      throw new Error(`Phase 138 terminal payload is invalid: ${pack.entityId}.`);
  }
  const brandHash = await computePublicationContentHash(client, PHASE138_WANCHER_ID);
  const brand = (await rows(client, "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?", [PHASE138_WANCHER_ID]))[0];
  if (brand?.status !== "published" || brand?.approved_content_hash !== brandHash) throw new Error("Phase 138 terminal Wancher publication is stale.");
  return hashes;
}

export async function applyPhase138WancherRegionalUrushiBatchContent(client: Client, options: ApplyPhase138Options): Promise<ApplyPhase138Result> {
  await applyPhase135WancherDreamPenTrueEboniteMarbleGreenContent(client, options);
  await exactBaseline(client);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = loadPhase138WancherRegionalUrushiPacks(workspaceRoot);
  for (const pack of packs) validatePack(workspaceRoot, pack);
  const state = await inspectState(client, packs);
  if (state === "terminal") {
    const hashes = await terminal(client, packs);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return { entities: packs.map((pack, index) => ({ entityId: pack.entityId, outcome: "noop" as const, contentHash: hashes[index]! })) };
  }
  await collisionPreflight(client, packs);
  const protectedBefore = new Map<string, string>();
  for (const id of PHASE138_PROTECTED_IDS) protectedBefore.set(id, await entityDigest(client, id));
  const brandBefore = await entityDigest(client, PHASE138_WANCHER_ID, false);
  const reverseBefore = (await rows(client, "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id", [PHASE138_WANCHER_ID])).map((row) => String(row.target_id));
  const tx = await client.transaction("write");
  try {
    for (const pack of packs) {
      await tx.execute({ sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)", args: [pack.entityId, pack.expectedSlug, pack.canonicalName] });
      await tx.execute({ sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [phase138MadeById(pack.entityId), pack.entityId, PHASE138_WANCHER_ID, `Phase 138 verified ${pack.canonicalName} maker relation.`] });
    }
    const sourceIds = await upsertSources(tx, uniqueSources(packs));
    for (const pack of packs) await insertPack(tx, pack, sourceIds);
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
  for (const [id, before] of protectedBefore) if ((await entityDigest(client, id)) !== before) throw new Error(`Phase 138 changed protected Wancher entity: ${id}.`);
  if ((await entityDigest(client, PHASE138_WANCHER_ID, false)) !== brandBefore) throw new Error("Phase 138 changed Wancher non-topology payload.");
  const reverseAfter = (await rows(client, "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id", [PHASE138_WANCHER_ID])).map((row) => String(row.target_id));
  if (JSON.stringify(reverseAfter) !== JSON.stringify(reverseBefore.concat(packs.map((pack) => pack.entityId)).sort())) throw new Error("Phase 138 Wancher reverse delta is not exact add-six.");
  const reviewer = options.reviewer.trim();
  await reviewPublish(client, PHASE138_WANCHER_ID, reviewer, "Phase 138 post-topology current hash; Wancher brand content was not replayed.");
  const hashes: string[] = [];
  for (const pack of packs) hashes.push(await reviewPublish(client, pack.entityId, reviewer, `${pack.sourceMarker}; exact SKU, regional context and rejected inference scopes.`));
  await terminal(client, packs);
  for (const [id, before] of protectedBefore) if ((await entityDigest(client, id)) !== before) throw new Error(`Phase 138 changed protected Wancher entity during publication: ${id}.`);
  if ((await entityDigest(client, PHASE138_WANCHER_ID, false)) !== brandBefore) throw new Error("Phase 138 replayed Wancher non-topology content.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities: packs.map((pack, index) => ({ entityId: pack.entityId, outcome: "published" as const, contentHash: hashes[index]! })) };
}

function value(name: string) { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main() {
  const databasePath = value("--database"); const ownedRoot = value("--owned-root"); const protectedCatalogPath = value("--protected-catalog"); const reviewer = value("--reviewer") ?? "phase138-wancher-regional-urushi-batch";
  if (!databasePath || !ownedRoot || !protectedCatalogPath) throw new Error("Usage: tsx scripts/apply-phase138-wancher-regional-urushi-batch-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>");
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try { process.stdout.write(`${JSON.stringify(await applyPhase138WancherRegionalUrushiBatchContent(client, { workspaceRoot: process.cwd(), reviewer, databasePath: path.resolve(databasePath), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath: path.resolve(protectedCatalogPath), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalogPath)), env: process.env }), null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((error) => { process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`); process.exitCode = 1; });
