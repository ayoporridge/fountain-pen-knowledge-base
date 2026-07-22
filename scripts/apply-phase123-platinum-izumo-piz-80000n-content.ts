import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, createClient, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged, snapshotCatalogFiles } from "../src/lib/audit/read-only-catalog";
import { computePublicationContentHash, publishEntity, recordEntityContentReview } from "../src/lib/publication";
import type { ApplyPhase22Options, ApplyPhase22Result } from "./apply-phase22-content";
import {
  loadPhase123PlatinumIzumoPizPack,
  PHASE123_ARTICLE_ID,
  PHASE123_ARTICLE_NAME,
  PHASE123_ARTICLE_SLUG,
  PHASE123_BRAND_ID,
  PHASE123_CURRENT_VARIANTS,
  PHASE123_CURIDAS_ID,
  PHASE123_FAMILY_SCOPE,
  PHASE123_FAMILY_SVG_PATH,
  PHASE123_LEGACY_MADE_BY_ID,
  PHASE123_LEGACY_REVERSE_ID,
  PHASE123_LINEUP,
  PHASE123_NEW_MADE_BY_ID,
  PHASE123_NEW_REVERSE_ID,
  PHASE123_PIZ_ID,
  PHASE123_PIZ_NAME,
  PHASE123_PIZ_SLUG,
  PHASE123_PRESIDENT_ID,
  PHASE123_PROCYON_ID,
  PHASE123_RAW_NAME,
  PHASE123_RAW_SLUG,
  PHASE123_3776_ID,
  phase123FamilySource,
  phase123PlatinumIzumoFamilyArticle,
  phase123PlatinumIzumoPizPack,
} from "./data/phase123-platinum-izumo-piz-80000n";
import { curatedId, packId, type CuratedSource, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";

export type ApplyPhase123Options = ApplyPhase22Options;
export type ApplyPhase123Result = ApplyPhase22Result;
export { PHASE123_ARTICLE_ID, PHASE123_ARTICLE_SLUG, PHASE123_BRAND_ID, PHASE123_PIZ_ID, PHASE123_PIZ_SLUG };

const ALLOWED_REPO_INPUTS = new Set(["/Users/xz/CodeBuddy/fountain-pen-graph", "/Users/xz/Documents/fountain-pen-graph"]);
const CANONICAL_REPO = "/Users/xz/Documents/fountain-pen-graph";
const FAMILY_MARKDOWN = ".planning/content-research/platinum-izumo-family-phase123.md";
const RETRIEVED = "2026-07-22";

function stableId(prefix: string, value: string) {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}
function isInside(candidate: string, root: string) {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}
function rejectRemoteSelection(env: NodeJS.ProcessEnv) {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 123 refuses inherited remote database selection: ${key}.`);
}
function assertVerifiedRepoPair(input: string) {
  if (!ALLOWED_REPO_INPUTS.has(input)) throw new Error("Phase 123 requires the verified CodeBuddy/Documents repo pair.");
  const real = fs.realpathSync.native(input);
  let gitRoot: string;
  try {
    gitRoot = fs.realpathSync.native(execFileSync("git", ["-C", input, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim());
  } catch {
    throw new Error("Phase 123 could not resolve the verified CodeBuddy/Documents repo pair.");
  }
  if (real !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO) throw new Error("Phase 123 verified repo aliases must resolve to one canonical root.");
  return real;
}

async function assertAuthority(client: Client, options: ApplyPhase123Options) {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 123 reviewer must not be empty.");
  const workspaceRoot = assertVerifiedRepoPair(options.workspaceRoot);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  if (fs.lstatSync(options.databasePath).isSymbolicLink()) throw new Error("Phase 123 caller-owned database must not be a symlink.");
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || !isInside(databasePath, ownedRoot)) throw new Error("Phase 123 requires a regular database inside the caller-owned root.");
  if ([protectedPath, `${protectedPath}-wal`, `${protectedPath}-shm`].includes(databasePath)) throw new Error("Phase 123 refuses the protected catalog or sidecar path.");
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (Number(owned.nlink) !== 1 || (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)) throw new Error("Phase 123 caller-owned database must not be a hard-link alias.");
  const main = (await client.execute("PRAGMA database_list")).rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 123 client/path mismatch for caller-owned database.");
  let migration;
  try {
    migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  } catch {
    throw new Error("Phase 123 owned copy must be migrated through 032.");
  }
  if (migration.rows.length !== 1) throw new Error("Phase 123 owned copy must be migrated through 032.");
  return workspaceRoot;
}

async function jsonRows(client: Client, sql: string, args: unknown[]) {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}
async function payloadDigest(client: Client, entityId: string, includeTopology: boolean) {
  const queries = [
    "SELECT * FROM entities WHERE id=?", "SELECT * FROM stories WHERE entity_id=? ORDER BY id",
    "SELECT * FROM entity_references WHERE entity_id=? ORDER BY id", "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id",
    "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id", "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id",
    "SELECT * FROM model_specs WHERE entity_id=? ORDER BY id", "SELECT * FROM model_variants WHERE model_entity_id=? ORDER BY id",
    "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id",
    ...(includeTopology ? ["SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id", "SELECT * FROM entity_publications WHERE entity_id=?", "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash"] : []),
  ];
  const payload = [];
  for (const sql of queries) payload.push(await jsonRows(client, sql, sql.includes(" OR ") ? [entityId, entityId] : [entityId]));
  return JSON.stringify(payload);
}

function loadFamilyCopy(workspaceRoot: string) {
  const markdown = fs.readFileSync(path.resolve(workspaceRoot, FAMILY_MARKDOWN), "utf8").replace(/\r\n?/g, "\n");
  const summary = markdown.match(/^## summary\s*\n+([\s\S]*?)(?=^## )/m)?.[1]?.trim();
  const bodyMd = markdown.match(/^## body_md\s*\n+([\s\S]*)$/m)?.[1]?.trim();
  if (!summary || !bodyMd || Array.from(summary).length < 60 || Array.from(summary).length > 160 || Array.from(bodyMd).length < 2_000) throw new Error("Phase 123 family reviewed copy is incomplete.");
  if (!bodyMd.includes(`/pen/${PHASE123_PIZ_SLUG}`) || PHASE123_LINEUP.some((label) => !bodyMd.includes(label))) throw new Error("Phase 123 family copy lost its exact navigation contract.");
  const digest = createHash("sha256").update(JSON.stringify({ summary, bodyMd, lineup: PHASE123_LINEUP })).digest("hex");
  return { summary, bodyMd, sourceMarker: `${phase123PlatinumIzumoFamilyArticle.sourceMarkerPrefix}${digest}` };
}

async function assertBaseline(client: Client) {
  const expected = [
    [PHASE123_BRAND_ID, "brand", "platinum", "curated-content:phase78-platinum-brand-v1:"],
    [PHASE123_3776_ID, "pen", "platinum-3776-century", ""],
    [PHASE123_CURIDAS_ID, "pen", "platinum-curidas", "curated-content:phase78-platinum-curidas-v1:"],
    [PHASE123_PROCYON_ID, "pen", "platinum-procyon-pns-5000", "curated-content:phase121-platinum-procyon-pns-5000-v1:"],
    [PHASE123_PRESIDENT_ID, "pen", "platinum-president-ptb-20000p", "curated-content:phase122-platinum-president-ptb-20000p-v1:"],
  ] as const;
  const result = await client.execute({ sql: `SELECT entity.id,entity.type,entity.slug,entity.source,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id IN (${expected.map(() => "?").join(",")})`, args: expected.map(([id]) => id) });
  if (result.rows.length !== expected.length) throw new Error("Phase 123 requires exact Phase 42/78/121/122 Platinum prerequisites.");
  const byId = new Map(result.rows.map((row) => [String(row.id), row]));
  for (const [id, type, slug, marker] of expected) {
    const row = byId.get(id);
    if (!row || row.type !== type || row.slug !== slug || row.status !== "published" || Number(row.is_public) !== 1 || (marker && !String(row.source).startsWith(marker))) throw new Error(`Phase 123 prerequisite mismatch for ${id}.`);
  }
}

function sourceItemId(key: string) { return curatedId("source-item", key); }
function reliability(source: CuratedSource) {
  if (source.sourceType === "official") return "official_marketing";
  if (source.tier === "professional_secondary") return "high_for_model_history";
  if (source.tier === "community") return "community_opinion";
  return "medium";
}

async function inspectState(client: Client, articleMarker: string, penMarker: string): Promise<"raw" | "terminal"> {
  const target = await client.execute({ sql: "SELECT id,type,slug,name,source,source_url,summary,body_md FROM entities WHERE id IN (?,?) ORDER BY id", args: [PHASE123_ARTICLE_ID, PHASE123_PIZ_ID] });
  const article = target.rows.find((row) => row.id === PHASE123_ARTICLE_ID);
  const pen = target.rows.find((row) => row.id === PHASE123_PIZ_ID);
  if (!article) throw new Error("Phase 123 donor article identity is missing.");
  const urls = phase123PlatinumIzumoPizPack.sources.map((source) => source.url);
  const urlOwners = await client.execute({ sql: `SELECT DISTINCT reference.entity_id FROM entity_references reference JOIN source_items item ON item.id=reference.source_item_id WHERE item.url IN (${urls.map(() => "?").join(",")}) ORDER BY reference.entity_id`, args: urls });
  const allowedOwners = new Set([PHASE123_ARTICLE_ID, PHASE123_PIZ_ID, PHASE123_PROCYON_ID, PHASE123_PRESIDENT_ID]);
  if (urlOwners.rows.some((row) => !allowedOwners.has(String(row.entity_id)))) throw new Error("Phase 123 found alternate source URL owner.");
  const collision = await client.execute({ sql: `SELECT DISTINCT entity.id FROM entities entity LEFT JOIN entity_aliases alias ON alias.entity_id=entity.id WHERE entity.id IN (?,?) OR entity.slug IN (?,?,?) OR lower(entity.name) IN (lower(?),lower(?),lower(?)) OR lower(COALESCE(alias.alias,'')) IN (lower(?),lower(?),lower(?)) OR entity.source LIKE 'curated%phase123%izumo%'`, args: [PHASE123_ARTICLE_ID, PHASE123_PIZ_ID, PHASE123_RAW_SLUG, PHASE123_ARTICLE_SLUG, PHASE123_PIZ_SLUG, PHASE123_RAW_NAME, PHASE123_ARTICLE_NAME, PHASE123_PIZ_NAME, PHASE123_RAW_NAME, PHASE123_ARTICLE_NAME, PHASE123_PIZ_NAME] });
  if (collision.rows.some((row) => ![PHASE123_ARTICLE_ID, PHASE123_PIZ_ID].includes(String(row.id)))) throw new Error("Phase 123 found alternate Izumo identity or alias.");
  if (article.type === "pen" && article.slug === PHASE123_RAW_SLUG && article.name === PHASE123_RAW_NAME && article.source == null && pen == null) {
    const raw = (await client.execute({ sql: `SELECT publication.status,publication.approved_content_hash,
      (SELECT count(*) FROM public_entities WHERE id=entity.id) AS is_public,
      (SELECT group_concat(id||':'||alias||':'||language,'|') FROM (SELECT id,alias,language FROM entity_aliases WHERE entity_id=entity.id ORDER BY id)) AS aliases,
      (SELECT group_concat(id||':'||source_id||':'||target_id||':'||link_type,'|') FROM (SELECT id,source_id,target_id,link_type FROM entity_links WHERE source_id=entity.id OR target_id=entity.id ORDER BY id)) AS links,
      (SELECT group_concat(id,'|') FROM (SELECT id FROM stories WHERE entity_id=entity.id ORDER BY id)) AS stories,
      (SELECT group_concat(id,'|') FROM (SELECT id FROM model_specs WHERE entity_id=entity.id ORDER BY id)) AS specs,
      (SELECT group_concat(id,'|') FROM (SELECT id FROM claims WHERE subject_entity_id=entity.id ORDER BY id)) AS claims,
      (SELECT group_concat(id,'|') FROM (SELECT id FROM entity_references WHERE entity_id=entity.id ORDER BY id)) AS refs,
      (SELECT group_concat(id,'|') FROM (SELECT id FROM media_assets WHERE entity_id=entity.id ORDER BY id)) AS media
      FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id WHERE entity.id=?`, args: [PHASE123_ARTICLE_ID] })).rows[0];
    const expectedAliases = "alias-OOumUrtFoAqu-en-Platinum Izumo:Platinum Izumo:en|alias-OOumUrtFoAqu-zh-白金 出云 Izumo:白金 出云 Izumo:zh";
    const expectedLinks = `${PHASE123_LEGACY_REVERSE_ID}:${PHASE123_BRAND_ID}:${PHASE123_ARTICLE_ID}:reverse|${PHASE123_LEGACY_MADE_BY_ID}:${PHASE123_ARTICLE_ID}:${PHASE123_BRAND_ID}:made_by`;
    if (Array.from(String(article.summary)).length !== 67 || Array.from(String(article.body_md)).length !== 248 || article.source_url != null || raw?.status !== "draft" || raw?.approved_content_hash != null || Number(raw?.is_public) !== 0 || raw?.aliases !== expectedAliases || raw?.links !== expectedLinks || raw?.stories !== "story-model-platinum-izumo-research" || raw?.specs !== "spec-platinum-izumo-research" || raw?.claims !== "claim-platinum-izumo-source-boundary" || raw?.refs !== "22c69d1a-6013-474a-9cac-a6a0ff370795|afe7edae-cf04-4a12-aa84-f8430350b93d|eref-commerce-1954fe77d81a4c|reference-model-gap-OOumUrtFoAqu-source-platinum-izumo-public-search" || raw?.media !== "media-commerce-82fe9226299f2b") throw new Error("Phase 123 raw payload/topology inventory is alternate; automatic repair is forbidden.");
    if ((await client.execute({ sql: "SELECT 1 FROM entity_redirects WHERE source_path IN (?,?)", args: [`/pen/${PHASE123_RAW_SLUG}`, `/article/${PHASE123_ARTICLE_SLUG}`] })).rows.length) throw new Error("Phase 123 raw redirect state is alternate.");
    if ((await client.execute({ sql: `SELECT 1 FROM source_items WHERE id IN (${phase123PlatinumIzumoPizPack.sources.map(() => "?").join(",")})`, args: phase123PlatinumIzumoPizPack.sources.map((source) => sourceItemId(source.key)) })).rows.length) throw new Error("Phase 123 source items exist in raw state; repair is forbidden.");
    return "raw";
  }
  if (article.type !== "article" || article.slug !== PHASE123_ARTICLE_SLUG || article.name !== PHASE123_ARTICLE_NAME || article.source !== articleMarker || !pen || pen.type !== "pen" || pen.slug !== PHASE123_PIZ_SLUG || pen.name !== PHASE123_PIZ_NAME || pen.source !== penMarker) throw new Error("Phase 123 target is partial or alternate; automatic repair is forbidden.");
  return "terminal";
}

async function upsertSource(tx: Transaction, source: CuratedSource) {
  await tx.execute({ sql: `INSERT INTO source_registry(id,name,source_type,allowed_use,reliability,license,attribution,homepage_url,fetch_method,notes,last_checked_at,default_source_tier,default_independence_group) VALUES(?,?,?,?,?,?,?,?, 'manual',?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,last_checked_at=excluded.last_checked_at,updated_at=datetime('now')`, args: [curatedId("source-registry", source.registryKey), source.registryName, source.sourceType, source.allowedUse, reliability(source), source.license ?? null, source.author ?? null, source.homepageUrl, `Phase 123 source: ${source.registryKey}`, source.retrievedAt, source.tier, source.independenceGroup] });
  await tx.execute({ sql: `INSERT INTO source_items(id,source_id,title,url,item_type,license,author,published_at,retrieved_at,summary,raw_metadata_json,allowed_use,review_status,source_tier,independence_group,archive_url,archive_locator) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,'approved',?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,url=excluded.url,summary=excluded.summary,archive_locator=excluded.archive_locator,review_status='approved',updated_at=datetime('now')`, args: [sourceItemId(source.key), curatedId("source-registry", source.registryKey), source.title, source.url, source.itemType ?? "web_page", source.license ?? null, source.author ?? null, source.publishedAt ?? null, source.retrievedAt, source.summary, JSON.stringify({ curatedSourceKey: source.key, phase: 123 }), source.allowedUse, source.tier, source.independenceGroup, source.archiveUrl ?? null, source.archiveLocator ?? null] });
}

async function deleteOwnedPayload(tx: Transaction, entityId: string) {
  await tx.execute({ sql: "DELETE FROM claim_evidence WHERE claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?)", args: [entityId] });
  await tx.execute({ sql: "DELETE FROM citations WHERE claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?) OR (target_type='model_spec' AND target_id IN (SELECT id FROM model_specs WHERE entity_id=?))", args: [entityId, entityId] });
  await tx.execute({ sql: "DELETE FROM spec_field_evidence WHERE model_spec_id IN (SELECT id FROM model_specs WHERE entity_id=?)", args: [entityId] });
  for (const [table, column] of [["entity_references", "entity_id"], ["stories", "entity_id"], ["entity_aliases", "entity_id"], ["claims", "subject_entity_id"], ["fact_scopes", "entity_id"], ["model_variants", "model_entity_id"], ["model_specs", "entity_id"], ["timeline_events", "entity_id"], ["media_assets", "entity_id"]] as const) await tx.execute({ sql: `DELETE FROM ${table} WHERE ${column}=?`, args: [entityId] });
}

async function installPenPack(tx: Transaction, pack: LoadedCuratedEntityPack) {
  for (const source of pack.sources) await upsertSource(tx, source);
  await tx.execute({ sql: "UPDATE entities SET name=?,summary=?,body_md=?,source=?,source_url=NULL,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=?", args: [pack.canonicalName, pack.summary, pack.bodyMd, pack.sourceMarker, pack.entityId, pack.expectedSlug] });
  await tx.execute({ sql: "UPDATE entity_publications SET depth_tier=? WHERE entity_id=?", args: [pack.depthTier, pack.entityId] });
  await tx.execute({ sql: "INSERT INTO stories(id,entity_id,title,story_type,summary,body_md,status,source_notes) VALUES(?,?,?,'model_story',?,?,'published',?)", args: [packId(pack, "story", "published"), pack.entityId, pack.storyTitle, pack.summary, pack.bodyMd, pack.sourceMarker] });
  for (const source of pack.sources) await tx.execute({ sql: "INSERT INTO entity_references(id,entity_id,source_item_id,relation_type,note,review_status) VALUES(?,?,?,?,?,'approved')", args: [packId(pack, "reference", source.key), pack.entityId, sourceItemId(source.key), source.sourceType === "official" ? "official" : source.tier === "professional_secondary" ? "review" : "reference", source.summary] });
  for (const alias of pack.aliases) {
    const source = pack.sources.find((item) => item.key === alias.sourceKey);
    if (!source) throw new Error(`Phase 123 alias source missing: ${alias.sourceKey}`);
    await tx.execute({ sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,source_id,alias_kind,market,source_item_id,review_status) VALUES(?,?,?,?,?,?,?,?,'approved')", args: [packId(pack, "alias", `${alias.language}:${alias.alias}`), pack.entityId, alias.alias, alias.language, curatedId("source-registry", source.registryKey), alias.kind ?? "alias", alias.market ?? null, sourceItemId(alias.sourceKey)] });
  }
  const variantIds = new Map<string, string>();
  for (const variant of pack.variants ?? []) {
    const id = packId(pack, "variant", variant.key); variantIds.set(variant.key, id);
    await tx.execute({ sql: "INSERT INTO model_variants(id,model_entity_id,variant_name,release_year,notes,source_item_id,review_status,variant_kind,parent_variant_id,product_code,market) VALUES(?,?,?,?,?,?,'approved',?,?,?,?)", args: [id, pack.entityId, variant.name, variant.releaseYear ?? null, variant.notes, sourceItemId(variant.sourceKey), variant.variantKind ?? "variant", variant.parentVariantKey ? variantIds.get(variant.parentVariantKey) ?? null : null, variant.productCode ?? null, variant.market ?? null] });
  }
  const scopeIds = new Map<string, string>();
  for (const scope of pack.scopes) {
    const id = packId(pack, "scope", scope.key); scopeIds.set(scope.scopeKey, id);
    await tx.execute({ sql: "INSERT INTO fact_scopes(id,entity_id,variant_id,scope_key,market,valid_from,valid_to,production_state,nib_scope,material_scope,edition_scope) VALUES(?,?,?,?,?,?,?,?,?,?,?)", args: [id, pack.entityId, scope.variantKey ? variantIds.get(scope.variantKey) ?? null : null, scope.scopeKey, scope.market ?? null, scope.validFrom ?? null, scope.validTo ?? null, scope.productionState ?? null, scope.nibScope ?? null, scope.materialScope ?? null, scope.editionScope ?? null] });
  }
  for (const claim of pack.claims) {
    const claimId = packId(pack, "claim", claim.key);
    await tx.execute({ sql: "INSERT INTO claims(id,subject_entity_id,predicate,object_text,source_item_id,evidence_locator,confidence,review_status,fact_class) VALUES(?,?,?,?,?,?,?,'approved',?)", args: [claimId, pack.entityId, claim.predicate, claim.objectText, sourceItemId(claim.sourceKey), claim.locator, claim.confidence, claim.factClass] });
    for (const item of claim.evidence) {
      const scopeId = scopeIds.get(item.scopeKey); if (!scopeId) throw new Error(`Phase 123 claim scope missing: ${item.scopeKey}`);
      const citationId = packId(pack, "claim-citation", item.key);
      await tx.execute({ sql: "INSERT INTO citations(id,target_type,target_id,source_item_id,claim_id,note,review_status,evidence_locator,scope_id) VALUES(?,'claim',?,?,?,?,'approved',?,?)", args: [citationId, claimId, sourceItemId(item.sourceKey), claimId, item.note ?? null, item.locator, scopeId] });
      await tx.execute({ sql: "INSERT INTO claim_evidence(id,claim_id,citation_id,scope_id,evidence_locator,review_status) VALUES(?,?,?,?,?,'approved')", args: [packId(pack, "claim-evidence", item.key), claimId, citationId, scopeId, item.locator] });
    }
  }
  if (!pack.spec) throw new Error("Phase 123 PIZ pack requires model specs.");
  const specId = packId(pack, "model-spec", "approved"); const values = pack.spec.values;
  await tx.execute({ sql: "INSERT INTO model_specs(id,entity_id,brand_entity_id,series_name,release_year,origin_country,nib,fill_system,material,dimensions,weight,price_range,status,review_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,'approved')", args: [specId, pack.entityId, pack.spec.brandEntityId, values.series_name ?? null, values.release_year ?? null, values.origin_country ?? null, values.nib ?? null, values.fill_system ?? null, values.material ?? null, values.dimensions ?? null, values.weight ?? null, values.price_range ?? null, values.status ?? null] });
  for (const item of pack.spec.evidence) {
    const scopeId = scopeIds.get(item.scopeKey); if (!scopeId) throw new Error(`Phase 123 spec scope missing: ${item.scopeKey}`);
    const citationId = packId(pack, "spec-citation", item.key);
    await tx.execute({ sql: "INSERT INTO citations(id,target_type,target_id,source_item_id,note,review_status,evidence_locator,scope_id) VALUES(?,'model_spec',?,?,?,'approved',?,?)", args: [citationId, specId, sourceItemId(item.sourceKey), item.note ?? null, item.locator, scopeId] });
    await tx.execute({ sql: "INSERT INTO spec_field_evidence(id,model_spec_id,field_key,citation_id,scope_id,evidence_locator,review_status) VALUES(?,?,?,?,?,?,?)", args: [packId(pack, "spec-evidence", item.key), specId, item.fieldKey, citationId, scopeId, item.locator, item.qualifies === false ? "rejected" : "approved"] });
  }
  for (const event of pack.timeline ?? []) await tx.execute({ sql: "INSERT INTO timeline_events(id,entity_id,title,event_type,start_date,circa,description,source_item_id,review_status) VALUES(?,?,?,?,?,?,?,?,'approved')", args: [packId(pack, "timeline", event.key), pack.entityId, event.title, event.eventType, event.startDate, event.circa ? 1 : 0, event.description, sourceItemId(event.sourceKey)] });
  for (const media of pack.media) await tx.execute({ sql: "INSERT INTO media_assets(id,entity_id,title,asset_type,image_url,thumbnail_url,local_path,author,license,attribution_text,source_url,source_item_id,review_status,usage_status) VALUES(?,? ,?,'image',?,?,?,?,?,?,?,?, 'approved',?)", args: [packId(pack, "media", media.key), pack.entityId, media.title, media.imageUrl ?? null, media.thumbnailUrl ?? null, media.localPath ?? null, media.author, media.license, media.attributionText, media.sourceUrl, sourceItemId(media.sourceKey), media.usageStatus] });
}

async function installArticle(tx: Transaction, copy: ReturnType<typeof loadFamilyCopy>) {
  await upsertSource(tx, phase123FamilySource);
  const diagram: CuratedSource = { key: "phase123-family-boundary-svg", registryKey: "fountain-pen-graph-editorial-phase123", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase123", title: "Izumo 11-family navigation boundary map", url: PHASE123_FAMILY_SVG_PATH, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, summary: "Original factual SVG: exact 11-family navigation and no-shared-spec boundary.", allowedUse: "store_full", license: "site-original", archiveUrl: PHASE123_FAMILY_SVG_PATH, archiveLocator: `project-public-asset:${PHASE123_FAMILY_SVG_PATH};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900` };
  await upsertSource(tx, diagram);
  await tx.execute({ sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,source_id,alias_kind,source_item_id,review_status) VALUES(?,?,?,?,?,'alias',?,'approved')", args: [stableId("phase123-article-alias", PHASE123_RAW_NAME), PHASE123_ARTICLE_ID, PHASE123_RAW_NAME, "zh", curatedId("source-registry", phase123FamilySource.registryKey), sourceItemId(phase123FamilySource.key)] });
  for (const [id, alias, language] of [["alias-OOumUrtFoAqu-en-Platinum Izumo", "Platinum Izumo", "en"], ["alias-OOumUrtFoAqu-zh-白金 出云 Izumo", "白金 出云 Izumo", "zh"]] as const) await tx.execute({ sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,source_id,alias_kind,source_item_id,review_status) VALUES(?,?,?,?,?,'alias',?,'approved')", args: [id, PHASE123_ARTICLE_ID, alias, language, curatedId("source-registry", phase123FamilySource.registryKey), sourceItemId(phase123FamilySource.key)] });
  await tx.execute({ sql: "INSERT INTO entity_references(id,entity_id,source_item_id,relation_type,note,review_status) VALUES(?,?,?,?,?,'approved')", args: [stableId("phase123-family-reference", phase123FamilySource.key), PHASE123_ARTICLE_ID, sourceItemId(phase123FamilySource.key), "official", phase123FamilySource.summary] });
  const scopeId = stableId("phase123-family-scope", PHASE123_FAMILY_SCOPE);
  await tx.execute({ sql: "INSERT INTO fact_scopes(id,entity_id,scope_key,valid_from,production_state,edition_scope) VALUES(?,?,?,?,'current',?)", args: [scopeId, PHASE123_ARTICLE_ID, PHASE123_FAMILY_SCOPE, RETRIEVED, `Exact deduplicated navigation labels: ${PHASE123_LINEUP.join(" | ")}; no shared specs/entities; 2025 news excluded.`] });
  const claimId = stableId("phase123-family-claim", "lineup"); const citationId = stableId("phase123-family-citation", "lineup");
  const familyLocator = phase123FamilySource.archiveLocator ?? phase123FamilySource.summary;
  await tx.execute({ sql: "INSERT INTO claims(id,subject_entity_id,predicate,object_text,source_item_id,evidence_locator,confidence,review_status,fact_class) VALUES(?,?,?,?,?,?,0.99,'approved','core')", args: [claimId, PHASE123_ARTICLE_ID, "retrieved_navigation_snapshot", PHASE123_LINEUP.join(" | "), sourceItemId(phase123FamilySource.key), familyLocator] });
  await tx.execute({ sql: "INSERT INTO citations(id,target_type,target_id,source_item_id,claim_id,review_status,evidence_locator,scope_id) VALUES(?,'claim',?,?,?,'approved',?,?)", args: [citationId, claimId, sourceItemId(phase123FamilySource.key), claimId, familyLocator, scopeId] });
  await tx.execute({ sql: "INSERT INTO claim_evidence(id,claim_id,citation_id,scope_id,evidence_locator,review_status) VALUES(?,?,?,?,?,'approved')", args: [stableId("phase123-family-evidence", "lineup"), claimId, citationId, scopeId, familyLocator] });
  await tx.execute({ sql: "INSERT INTO stories(id,entity_id,title,story_type,summary,body_md,status,source_notes) VALUES(?,?,?,'overview',?,?,'published',?)", args: [stableId("phase123-family-story", PHASE123_ARTICLE_ID), PHASE123_ARTICLE_ID, PHASE123_ARTICLE_NAME, copy.summary, copy.bodyMd, copy.sourceMarker] });
  await tx.execute({ sql: "INSERT INTO media_assets(id,entity_id,title,asset_type,local_path,author,license,attribution_text,source_url,source_item_id,review_status,usage_status) VALUES(?,?,?,'diagram',?,'Fountain Pen Graph editorial','site-original',?,?,?,'approved','primary')", args: [stableId("phase123-family-media", PHASE123_ARTICLE_ID), PHASE123_ARTICLE_ID, "Izumo 11-family navigation boundary map", PHASE123_FAMILY_SVG_PATH, "site-original factual SVG; non-photo, non-logo, not-to-scale, not-colour-proof, not-finish-proof.", PHASE123_FAMILY_SVG_PATH, sourceItemId(diagram.key)] });
}

async function reviewAndPublish(client: Client, entityId: string, reviewer: string, note: string) {
  for (const reviewKind of ["fact", "language", "media"] as const) await recordEntityContentReview(client, { entityId, reviewKind, reviewer, status: "approved", notes: note });
  return (await publishEntity(client, { entityId, reviewer })).contentHash;
}

async function assertTerminal(client: Client, articleMarker: string, penMarker: string) {
  const identities = await client.execute({ sql: `SELECT entity.id,entity.type,entity.slug,entity.name,entity.source,entity.summary,entity.body_md,publication.status,publication.approved_content_hash,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id IN (?,?) ORDER BY entity.id`, args: [PHASE123_ARTICLE_ID, PHASE123_PIZ_ID] });
  if (identities.rows.length !== 2) throw new Error("Phase 123 terminal identities are incomplete.");
  const byId = new Map(identities.rows.map((row) => [String(row.id), row]));
  const hashes = new Map<string, string>();
  for (const [id, type, slug, name, marker] of [[PHASE123_ARTICLE_ID, "article", PHASE123_ARTICLE_SLUG, PHASE123_ARTICLE_NAME, articleMarker], [PHASE123_PIZ_ID, "pen", PHASE123_PIZ_SLUG, PHASE123_PIZ_NAME, penMarker]] as const) {
    const row = byId.get(id); const hash = await computePublicationContentHash(client, id); hashes.set(id, hash);
    if (!row || row.type !== type || row.slug !== slug || row.name !== name || row.source !== marker || row.status !== "published" || row.approved_content_hash !== hash || Number(row.is_public) !== 1 || Array.from(String(row.summary)).length < 60 || Array.from(String(row.summary)).length > 160 || Array.from(String(row.body_md)).length < 2_000) throw new Error("Phase 123 terminal identity/content/publication is invalid; automatic repair is forbidden.");
    const reviews = await client.execute({ sql: "SELECT count(*) AS count FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media','publication')", args: [id, hash] });
    if (Number(reviews.rows[0]?.count) !== 4) throw new Error("Phase 123 terminal current-hash reviews are invalid.");
  }
  if (!String(byId.get(PHASE123_ARTICLE_ID)?.body_md).includes(`/pen/${PHASE123_PIZ_SLUG}`) || !String(byId.get(PHASE123_PIZ_ID)?.body_md).includes(`/article/${PHASE123_ARTICLE_SLUG}`)) throw new Error("Phase 123 terminal canonical cross-links are invalid.");
  const articleCounts = (await client.execute({ sql: `SELECT (SELECT count(*) FROM entity_links WHERE source_id=? OR target_id=?) AS topology,(SELECT count(*) FROM model_specs WHERE entity_id=?) AS specs,(SELECT count(*) FROM model_variants WHERE model_entity_id=?) AS variants,(SELECT count(*) FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved') AS media`, args: [PHASE123_ARTICLE_ID, PHASE123_ARTICLE_ID, PHASE123_ARTICLE_ID, PHASE123_ARTICLE_ID, PHASE123_ARTICLE_ID] })).rows[0];
  if (Number(articleCounts?.topology) || Number(articleCounts?.specs) || Number(articleCounts?.variants) || Number(articleCounts?.media) !== 1) throw new Error("Phase 123 terminal article retained pen-only payload or lost media.");
  const aliases = (await client.execute({ sql: "SELECT alias,language FROM entity_aliases WHERE entity_id=? ORDER BY alias", args: [PHASE123_ARTICLE_ID] })).rows.map((row) => [String(row.alias), String(row.language)]);
  if (JSON.stringify(aliases) !== JSON.stringify([["Platinum Izumo", "en"], [PHASE123_RAW_NAME, "zh"], ["白金 出云 Izumo", "zh"]])) throw new Error("Phase 123 terminal article aliases are invalid.");
  const topology = await client.execute({ sql: "SELECT id,source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY id", args: [PHASE123_PIZ_ID, PHASE123_PIZ_ID] });
  if (JSON.stringify(topology.rows.map((row) => [row.id,row.source_id,row.target_id,row.link_type])) !== JSON.stringify([[PHASE123_NEW_MADE_BY_ID,PHASE123_PIZ_ID,PHASE123_BRAND_ID,"made_by"],[PHASE123_NEW_REVERSE_ID,PHASE123_BRAND_ID,PHASE123_PIZ_ID,"reverse"]])) throw new Error("Phase 123 terminal PIZ topology is invalid.");
  const variants = (await client.execute({ sql: "SELECT variant_name FROM model_variants WHERE model_entity_id=? ORDER BY variant_name", args: [PHASE123_PIZ_ID] })).rows.map((row) => String(row.variant_name));
  if (JSON.stringify(variants) !== JSON.stringify([...PHASE123_CURRENT_VARIANTS].sort())) throw new Error("Phase 123 terminal variant set is invalid.");
  const counts = (await client.execute({ sql: `SELECT (SELECT count(*) FROM fact_scopes WHERE entity_id=?) AS scopes,(SELECT count(*) FROM claims WHERE subject_entity_id=?) AS claims,(SELECT count(*) FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='rejected') AS rejected,(SELECT count(*) FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved') AS media`, args: [PHASE123_PIZ_ID,PHASE123_PIZ_ID,PHASE123_PIZ_ID,PHASE123_PIZ_ID] })).rows[0];
  if (Number(counts?.scopes) !== 5 || Number(counts?.claims) !== 6 || Number(counts?.rejected) < 8 || Number(counts?.media) !== 1) throw new Error("Phase 123 terminal scope/evidence/media is invalid.");
  const brandHash = await computePublicationContentHash(client, PHASE123_BRAND_ID); const brand = (await client.execute({ sql: "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?", args: [PHASE123_BRAND_ID] })).rows[0];
  if (brand?.status !== "published" || brand.approved_content_hash !== brandHash) throw new Error("Phase 123 terminal Platinum post-topology publication is invalid.");
  return [hashes.get(PHASE123_ARTICLE_ID)!, hashes.get(PHASE123_PIZ_ID)!] as const;
}

export async function applyPhase123PlatinumIzumoContent(client: Client, options: ApplyPhase123Options): Promise<ApplyPhase123Result> {
  const workspaceRoot = await assertAuthority(client, options);
  const family = loadFamilyCopy(workspaceRoot); const penPack = loadPhase123PlatinumIzumoPizPack(workspaceRoot);
  await assertBaseline(client);
  const state = await inspectState(client, family.sourceMarker, penPack.sourceMarker);
  if (state === "terminal") {
    const [articleHash, penHash] = await assertTerminal(client, family.sourceMarker, penPack.sourceMarker);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return { entities: [{ entityId: PHASE123_ARTICLE_ID, outcome: "noop", contentHash: articleHash }, { entityId: PHASE123_PIZ_ID, outcome: "noop", contentHash: penHash }] };
  }
  const protectedIds = [PHASE123_3776_ID, PHASE123_CURIDAS_ID, PHASE123_PROCYON_ID, PHASE123_PRESIDENT_ID];
  const protectedBefore = new Map<string, string>(); for (const id of protectedIds) protectedBefore.set(id, await payloadDigest(client, id, true));
  const brandPayloadBefore = await payloadDigest(client, PHASE123_BRAND_ID, false);
  const brandHashBefore = await computePublicationContentHash(client, PHASE123_BRAND_ID);
  const reverseBefore = await jsonRows(client, "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id", [PHASE123_BRAND_ID]);

  const tx = await client.transaction("write");
  try {
    await deleteOwnedPayload(tx, PHASE123_ARTICLE_ID);
    await tx.execute({ sql: "DELETE FROM entity_links WHERE id IN (?,?)", args: [PHASE123_LEGACY_MADE_BY_ID, PHASE123_LEGACY_REVERSE_ID] });
    const changed = await tx.execute({ sql: "UPDATE entities SET type='article',slug=?,name=?,summary=?,body_md=?,source=?,source_url=NULL,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=? AND name=?", args: [PHASE123_ARTICLE_SLUG, PHASE123_ARTICLE_NAME, family.summary, family.bodyMd, family.sourceMarker, PHASE123_ARTICLE_ID, PHASE123_RAW_SLUG, PHASE123_RAW_NAME] });
    if (changed.rowsAffected !== 1) throw new Error("Phase 123 donor changed before atomic reclassification.");
    await tx.execute({ sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)", args: [PHASE123_PIZ_ID, PHASE123_PIZ_SLUG, PHASE123_PIZ_NAME] });
    await tx.execute({ sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [PHASE123_NEW_MADE_BY_ID, PHASE123_PIZ_ID, PHASE123_BRAND_ID, "Phase 123 exact PIZ-80000N maker relation"] });
    const key = `${PHASE123_ARTICLE_ID}:pen->article:${PHASE123_PIZ_ID}`; const checksum = createHash("sha256").update(key).digest("hex"); const batchId = stableId("phase123-izumo-batch", key); const actionId = stableId("phase123-izumo-action", key);
    await tx.execute({ sql: "INSERT INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)", args: [batchId, key, checksum, "Same-ID Izumo family article plus exact PIZ-80000N pen."] });
    await tx.execute({ sql: "INSERT INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'rename',?,?,?,'applied',?)", args: [actionId, batchId, PHASE123_RAW_SLUG, checksum, PHASE123_ARTICLE_ID, PHASE123_ARTICLE_ID, "Preserve donor ID while replacing the pen-only maker pair with exact PIZ topology."] });
    await installArticle(tx, family);
    await installPenPack(tx, penPack);
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }

  if (await payloadDigest(client, PHASE123_BRAND_ID, false) !== brandPayloadBefore) throw new Error("Phase 123 changed Platinum non-topology payload.");
  for (const id of protectedIds) if (await payloadDigest(client, id, true) !== protectedBefore.get(id)) throw new Error(`Phase 123 changed protected entity ${id}.`);
  const reverseAfter = await jsonRows(client, "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id", [PHASE123_BRAND_ID]);
  const expectedReverse = reverseBefore.map((row) => String(row.target_id)).filter((id) => id !== PHASE123_ARTICLE_ID).concat(PHASE123_PIZ_ID).sort();
  if (JSON.stringify(reverseAfter.map((row) => String(row.target_id))) !== JSON.stringify(expectedReverse)) throw new Error("Phase 123 Platinum reverse delta is not exact remove-one/add-one.");
  const brandHashAfter = await computePublicationContentHash(client, PHASE123_BRAND_ID);
  if (brandHashAfter === brandHashBefore) throw new Error("Phase 123 expected post-topology Platinum hash change.");
  await reviewAndPublish(client, PHASE123_BRAND_ID, options.reviewer.trim(), "Phase 123 post-topology current hash; no Platinum pack replay.");
  const articleHash = await reviewAndPublish(client, PHASE123_ARTICLE_ID, options.reviewer.trim(), `${family.sourceMarker}; exact 11-family navigation review.`);
  const penHash = await reviewAndPublish(client, PHASE123_PIZ_ID, options.reviewer.trim(), `${penPack.sourceMarker}; exact PIZ evidence-boundary review.`);
  await assertTerminal(client, family.sourceMarker, penPack.sourceMarker);
  if (await payloadDigest(client, PHASE123_BRAND_ID, false) !== brandPayloadBefore) throw new Error("Phase 123 replayed or changed Platinum non-topology payload.");
  for (const id of protectedIds) if (await payloadDigest(client, id, true) !== protectedBefore.get(id)) throw new Error(`Phase 123 changed protected entity ${id} after publication.`);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities: [{ entityId: PHASE123_ARTICLE_ID, outcome: "published", contentHash: articleHash }, { entityId: PHASE123_PIZ_ID, outcome: "published", contentHash: penHash }] };
}

function value(name: string) { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index + 1] ?? null; }
async function main() {
  const databasePath = value("--database"), ownedRoot = value("--owned-root"), protectedCatalogPath = value("--protected-catalog");
  const reviewer = value("--reviewer") ?? "phase123-platinum-izumo-piz-80000n";
  if (!databasePath || !ownedRoot || !protectedCatalogPath) throw new Error("Usage: tsx scripts/apply-phase123-platinum-izumo-piz-80000n-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const resolvedDatabase = path.resolve(databasePath), resolvedOwnedRoot = path.resolve(ownedRoot), resolvedProtected = path.resolve(protectedCatalogPath);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try { process.stdout.write(`${JSON.stringify(await applyPhase123PlatinumIzumoContent(client, { workspaceRoot: process.cwd(), reviewer, databasePath: resolvedDatabase, ownedRoot: resolvedOwnedRoot, protectedCatalogPath: resolvedProtected, protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected), env: process.env }), null, 2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
