import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, createClient } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import { computePublicationContentHash } from "../src/lib/publication";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
  validatePack,
} from "./apply-phase22-content";
import { applyPhase49ViscontiHomoSapiensContent } from "./apply-phase49-visconti-homo-sapiens-content";
import {
  loadPhase140Packs,
  PHASE140_BRANDS,
  phase140AllPacks,
  phase140Groups,
  PHASE140_IDS,
} from "./data/phase140-italian-representative-models-batch";
import type { LoadedCuratedEntityPack } from "./lib/curated-content-pack";

export type ApplyPhase140Options = ApplyPhase22Options;
export type ApplyPhase140Result = ApplyPhase22Result;

function stableId(surface: string, value: string): string {
  return `phase140-${surface}-${createHash("sha256").update(value).digest("hex").slice(0, 20)}`;
}

async function rows(client: Client, sql: string, args: unknown[] = []) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function assertPhase140Authority(client: Client, options: ApplyPhase140Options): Promise<void> {
  if (!options.reviewer.trim()) throw new Error("Phase 140 reviewer must not be empty.");
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (options.env?.[key]?.trim()) throw new Error(`Phase 140 refuses inherited remote database selection: ${key}.`);
  }
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  if (workspaceRoot !== fs.realpathSync.native(process.cwd())) {
    throw new Error("Phase 140 requires the verified CodeBuddy/Documents repo pair.");
  }
  if (fs.lstatSync(options.databasePath).isSymbolicLink()) {
    throw new Error("Phase 140 owned catalog must not be a symlink.");
  }
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const relative = path.relative(ownedRoot, databasePath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Phase 140 database must remain inside the caller-owned root.");
  }
  const ownedStat = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || (ownedStat.dev === protectedStat.dev && ownedStat.ino === protectedStat.ino)) {
    throw new Error("Phase 140 refuses the protected catalog and hard-link aliases.");
  }
  const main = (await client.execute("PRAGMA database_list")).rows.find((row) => String(row.name) === "main");
  const clientPath = main?.file ? fs.realpathSync.native(String(main.file)) : null;
  if (clientPath !== databasePath) throw new Error("Phase 140 client/path mismatch.");
}

async function entityDigest(client: Client, entityId: string): Promise<string> {
  const queries = [
    "SELECT * FROM entities WHERE id=?",
    "SELECT * FROM stories WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_references WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id",
    "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id",
    "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id",
    "SELECT * FROM model_specs WHERE entity_id=? ORDER BY id",
    "SELECT * FROM model_variants WHERE model_entity_id=? ORDER BY id",
    "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id",
    "SELECT * FROM timeline_events WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
    "SELECT * FROM entity_publications WHERE entity_id=?",
    "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
  ];
  const payload = [];
  for (const sql of queries) {
    payload.push(await rows(client, sql, sql.includes(" OR ") ? [entityId, entityId] : [entityId]));
  }
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

async function applyPrerequisites(client: Client, options: ApplyPhase140Options): Promise<void> {
  await applyPhase49ViscontiHomoSapiensContent(client, options);
}

async function assertBrandBaseline(client: Client): Promise<void> {
  const expected = [
    [PHASE140_BRANDS.visconti, "visconti"],
  ] as const;
  for (const [id, slug] of expected) {
    const found = await rows(client, "SELECT id,type,slug FROM entities WHERE id=?", [id]);
    if (found.length !== 1 || found[0]?.type !== "brand" || found[0]?.slug !== slug) {
      throw new Error(`Phase 140 requires exact brand baseline: ${id}.`);
    }
  }
}

function newTargetPacks(packs: LoadedCuratedEntityPack[]) {
  return packs.filter((pack) => pack.entityId !== PHASE140_BRANDS.visconti);
}

async function inspectNewTargetState(client: Client, packs: LoadedCuratedEntityPack[]): Promise<"empty" | "terminal"> {
  const states = new Set<"empty" | "terminal">();
  for (const pack of newTargetPacks(packs)) {
    const found = await rows(client, "SELECT id,type,slug,name,source FROM entities WHERE id=?", [pack.entityId]);
    if (found.length === 0) {
      states.add("empty");
      continue;
    }
    const row = found[0];
    if (found.length !== 1 || row?.type !== pack.expectedType || row?.slug !== pack.expectedSlug || row?.name !== pack.canonicalName || row?.source !== pack.sourceMarker) {
      throw new Error(`Phase 140 target identity/content is partial or tampered: ${pack.entityId}.`);
    }
    states.add("terminal");
  }
  if (states.size !== 1) throw new Error("Phase 140 refuses mixed empty/terminal target state.");
  return [...states][0]!;
}

async function collisionPreflight(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const targets = newTargetPacks(packs);
  const names = targets.flatMap((pack) => [pack.canonicalName, ...pack.aliases.map((alias) => alias.alias)]);
  const slugs = targets.map((pack) => pack.expectedSlug);
  const ids = targets.map((pack) => pack.entityId);
  const collisions = await rows(client, `
    SELECT DISTINCT entity.id,entity.type,entity.slug,entity.name
    FROM entities entity
    LEFT JOIN entity_aliases alias ON alias.entity_id=entity.id
    WHERE entity.id IN (${ids.map(() => "?").join(",")})
       OR entity.slug IN (${slugs.map(() => "?").join(",")})
       OR lower(entity.name) IN (${names.map(() => "lower(?)").join(",")})
       OR lower(COALESCE(alias.alias,'')) IN (${names.map(() => "lower(?)").join(",")})
  `, [...ids, ...slugs, ...names, ...names]);
  if (collisions.length > 0) {
    throw new Error(`Phase 140 target collision; repair forbidden: ${JSON.stringify(collisions)}.`);
  }
}

async function prepareTopology(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  const targets = newTargetPacks(packs);
  const tx = await client.transaction("write");
  try {
    for (const brandPack of targets.filter((candidate) => candidate.expectedType === "brand")) {
      await tx.execute({ sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'brand',?,?)", args: [brandPack.entityId, brandPack.expectedSlug, brandPack.canonicalName] });
    }
    for (const pack of targets.filter((candidate) => candidate.expectedType === "pen")) {
      const definition = phase140AllPacks.find((candidate) => candidate.entityId === pack.entityId);
      const brandId = definition?.spec?.brandEntityId;
      if (!brandId) throw new Error(`Phase 140 missing maker for ${pack.entityId}.`);
      await tx.execute({ sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)", args: [pack.entityId, pack.expectedSlug, pack.canonicalName] });
      await tx.execute({
        sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
        args: [stableId("made-by", `${pack.entityId}:${brandId}`), pack.entityId, brandId, `Phase 140 verified ${pack.canonicalName} maker relation.`],
      });
    }
    await tx.commit();
  } catch (error) {
    if (!tx.closed) await tx.rollback();
    throw error;
  }
}

async function publicPensForBrands(client: Client): Promise<string[]> {
  const brandIds = [PHASE140_BRANDS.visconti];
  const excluded = new Set(Object.values(PHASE140_IDS));
  return (await rows(client, `
    SELECT DISTINCT pen.id
    FROM entities pen
    JOIN entity_links link ON link.source_id=pen.id AND link.link_type='made_by'
    JOIN public_entities public ON public.id=pen.id
    WHERE link.target_id IN (${brandIds.map(() => "?").join(",")})
    ORDER BY pen.id
  `, brandIds)).map((row) => String(row.id)).filter((id) => !excluded.has(id as never));
}

async function reverseTargets(client: Client, brandId: string): Promise<string[]> {
  return (await rows(client, "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id", [brandId])).map((row) => String(row.target_id));
}

async function assertTerminal(client: Client, packs: LoadedCuratedEntityPack[]): Promise<void> {
  for (const pack of packs) {
    const contentHash = await computePublicationContentHash(client, pack.entityId);
    const state = (await rows(client, `
      SELECT entity.type,entity.slug,entity.name,entity.source,publication.status,
             publication.approved_content_hash,publication.content_revision,
             publication.reviewed_content_revision,publication.reviewed_contract_version,
             CASE WHEN public.id IS NULL THEN 0 ELSE 1 END is_public
      FROM entities entity
      JOIN entity_publications publication ON publication.entity_id=entity.id
      LEFT JOIN public_entities public ON public.id=entity.id
      WHERE entity.id=?
    `, [pack.entityId]))[0];
    const counts = (await rows(client, `
      SELECT (SELECT count(*) FROM stories WHERE entity_id=?) stories,
             (SELECT count(*) FROM entity_references WHERE entity_id=?) refs,
             (SELECT count(*) FROM fact_scopes WHERE entity_id=?) scopes,
             (SELECT count(*) FROM claims WHERE subject_entity_id=?) claims,
             (SELECT count(*) FROM model_specs WHERE entity_id=?) specs,
             (SELECT count(*) FROM media_assets WHERE entity_id=?) media
    `, Array(6).fill(pack.entityId)))[0];
    const reviews = await rows(client, "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind", [pack.entityId, contentHash]);
    if (state?.type !== pack.expectedType || state?.slug !== pack.expectedSlug || state?.name !== pack.canonicalName || state?.source !== pack.sourceMarker || state?.status !== "published" || state?.approved_content_hash !== contentHash || Number(state?.content_revision) !== Number(state?.reviewed_content_revision) || Number(state?.reviewed_contract_version) !== 3 || Number(state?.is_public) !== 1 || Number(counts?.stories) !== 1 || Number(counts?.refs) !== pack.sources.length || Number(counts?.scopes) !== pack.scopes.length || Number(counts?.claims) !== pack.claims.length || Number(counts?.specs) !== (pack.expectedType === "pen" ? 1 : pack.spec ? 1 : 0) || Number(counts?.media) !== pack.media.length || JSON.stringify(reviews.map((review) => String(review.review_kind))) !== JSON.stringify(["fact", "language", "media", "publication"]) || reviews.some((review) => review.status !== "approved")) {
      throw new Error(`Phase 140 terminal payload is invalid: ${pack.entityId}.`);
    }
  }
}

export async function applyPhase140ItalianRepresentativeModelsBatchContent(client: Client, options: ApplyPhase140Options): Promise<ApplyPhase140Result> {
  await assertPhase140Authority(client, options);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  const packs = loadPhase140Packs(workspaceRoot);
  for (const pack of packs) validatePack(workspaceRoot, pack);
  const state = await inspectNewTargetState(client, packs);
  if (state === "terminal") {
    const entities: ApplyPhase140Result["entities"] = [];
    for (const group of phase140Groups) {
      const result = await applyCuratedContentPacks(client, options, [group.brand, ...group.pens]);
      entities.push(...result.entities);
    }
    await assertTerminal(client, packs);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return { entities };
  }

  await applyPrerequisites(client, options);
  await assertBrandBaseline(client);
  await collisionPreflight(client, packs);
  const protectedIds = await publicPensForBrands(client);
  const protectedBefore = new Map<string, string>();
  for (const id of protectedIds) protectedBefore.set(id, await entityDigest(client, id));
  const reverseBefore = new Map<string, string[]>();
  for (const group of phase140Groups) reverseBefore.set(group.brand.entityId, await reverseTargets(client, group.brand.entityId));

  await prepareTopology(client, packs);
  const entities: ApplyPhase140Result["entities"] = [];
  for (const group of phase140Groups) {
    const result = await applyCuratedContentPacks(client, options, [group.brand, ...group.pens]);
    entities.push(...result.entities);
  }

  for (const [id, before] of protectedBefore) {
    if ((await entityDigest(client, id)) !== before) throw new Error(`Phase 140 changed protected existing model: ${id}.`);
  }
  for (const group of phase140Groups) {
    const before = reverseBefore.get(group.brand.entityId) ?? [];
    const expected = before.concat(group.pens.map((pack) => pack.entityId)).sort();
    const after = await reverseTargets(client, group.brand.entityId);
    if (JSON.stringify(after) !== JSON.stringify(expected)) throw new Error(`Phase 140 reverse delta is not exact for brand ${group.brand.entityId}.`);
  }
  if (entities.length !== packs.length || entities.some((entity) => entity.outcome !== "published")) {
    throw new Error("Phase 140 first apply did not publish exactly fifteen brand/model packs.");
  }
  await assertTerminal(client, packs);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities };
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main() {
  const databasePath = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalogPath = value("--protected-catalog");
  const reviewer = value("--reviewer") ?? "phase140-italian-representative-models-batch";
  if (!databasePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error("Usage: tsx scripts/apply-phase140-italian-representative-models-batch-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db>");
  }
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try {
    const result = await applyPhase140ItalianRepresentativeModelsBatchContent(client, {
      workspaceRoot: process.cwd(), reviewer, databasePath: path.resolve(databasePath), ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: path.resolve(protectedCatalogPath), protectedCatalogSnapshot: snapshotCatalogFiles(path.resolve(protectedCatalogPath)), env: process.env,
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
