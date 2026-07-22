import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, createClient, type Transaction } from "@libsql/client";
import { assertCatalogSnapshotUnchanged } from "../src/lib/audit/read-only-catalog";
import { computePublicationContentHash, publishEntity, recordEntityContentReview } from "../src/lib/publication";
import type { ApplyPhase22Options, ApplyPhase22Result } from "./apply-phase22-content";
import {
  loadPhase125PlatinumSmallMeteorPack,
  PHASE125_AWARD_URL,
  PHASE125_AWESOME_URL,
  PHASE125_FALSE_PREPPY_ALIAS,
  PHASE125_MADE_BY_ID,
  PHASE125_MANUAL_URL,
  PHASE125_NAME,
  PHASE125_NONOPEN_URL,
  PHASE125_PLATINUM_BRAND_ID,
  PHASE125_PREPPY_ID,
  PHASE125_RAW_NAME,
  PHASE125_RAW_SLUG,
  PHASE125_REVERSE_ID,
  PHASE125_SHANGHAI_URL,
  PHASE125_SINA_URL,
  PHASE125_SLUG,
  PHASE125_TAIWAN_URL,
  PHASE125_TARGET_ID,
  PHASE125_TRUTHFUL_LEGACY_ALIASES,
  PHASE125_VARIANTS,
} from "./data/phase125-platinum-small-meteor-pq-200";
import { curatedId, packId, type CuratedSource, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";

export type ApplyPhase125Options = ApplyPhase22Options;
export type ApplyPhase125Result = ApplyPhase22Result;

const CANONICAL_REPO = "/Users/xz/Documents/fountain-pen-graph";
const ALLOWED_REPOS = new Set(["/Users/xz/CodeBuddy/fountain-pen-graph", CANONICAL_REPO]);
const BATCH_ID = "phase125-platinum-small-meteor-pq-200-identity";
const RAW_SUMMARY = "白金小流星 PQ200 要放在 Preppy 旁边理解。它的读法很直接：Platinum Small Meteor PQ-200、塑料笔身、约 13 g、0.38 mm 细钢尖，并兼容白金墨囊和 PQR-200 上墨器。";
const RAW_BODY = "# 白金 Platinum 小流星PQ200\n\n**品牌:** 白金 Platinum\n\n**产地:** 日本\n\n**笔尖材质:** 钢尖\n\n**笔尖尺寸:** —\n\n**上墨方式:** 墨囊\n\n**价位段(元):** 30-60\n\n**外形特点:** 入门级小笔，学生定位\n\n**材质手感:** 轻巧塑料\n\n**笔尖特性:** 钢尖基础写感";
const EXPECTED_SOURCE_URLS = [PHASE125_SHANGHAI_URL, PHASE125_AWARD_URL, PHASE125_TAIWAN_URL, PHASE125_SINA_URL, PHASE125_NONOPEN_URL, PHASE125_AWESOME_URL, PHASE125_MANUAL_URL, "/images/library/site-original/phase125/platinum/platinum-small-meteor-pq-200.svg"].sort();
const EXCLUSIVE_SOURCE_URLS = [PHASE125_AWARD_URL, PHASE125_TAIWAN_URL, PHASE125_SINA_URL, PHASE125_NONOPEN_URL, PHASE125_AWESOME_URL];

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function stableId(prefix: string, value: string): string { return `${prefix}-${digest(value).slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function stableRows(rows: Array<Record<string, unknown>>): string { return JSON.stringify(rows.map((row) => ({ ...row }))); }

function rejectRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 125 refuses inherited remote database selection: ${key}.`);
}

function assertRepo(input: string): string {
  if (!ALLOWED_REPOS.has(input)) throw new Error("Phase 125 requires the verified CodeBuddy/Documents repo pair.");
  const real = fs.realpathSync.native(input);
  const gitRoot = fs.realpathSync.native(execFileSync("git", ["-C", input, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim());
  if (real !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO) throw new Error("Phase 125 verified repo pair must resolve to one canonical git root.");
  return real;
}

async function assertAuthority(client: Client, options: ApplyPhase125Options): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 125 reviewer must not be empty.");
  const workspaceRoot = assertRepo(options.workspaceRoot);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  if (fs.lstatSync(options.databasePath).isSymbolicLink()) throw new Error("Phase 125 caller-owned database must not be a symlink.");
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || !isInside(databasePath, ownedRoot)) throw new Error("Phase 125 requires a regular database inside the caller-owned root.");
  const own = fs.statSync(databasePath, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (databasePath === protectedPath || Number(own.nlink) !== 1 || (own.dev === protectedStat.dev && own.ino === protectedStat.ino)) throw new Error("Phase 125 refuses protected catalog or hard-link aliases.");
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 125 client/path mismatch for caller-owned database.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 125 owned copy must be migrated through 032.");
  return workspaceRoot;
}

async function rows(client: Client, sql: string, args: unknown[]): Promise<Array<Record<string, unknown>>> {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function entityDigest(client: Client, entityId: string): Promise<string> {
  const queries = [
    "SELECT * FROM entities WHERE id=?", "SELECT * FROM stories WHERE entity_id=? ORDER BY id", "SELECT * FROM entity_references WHERE entity_id=? ORDER BY id", "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id", "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id", "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id", "SELECT * FROM model_specs WHERE entity_id=? ORDER BY id", "SELECT * FROM model_variants WHERE model_entity_id=? ORDER BY id", "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id", "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id", "SELECT * FROM entity_publications WHERE entity_id=?", "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
  ];
  const payload = [];
  for (const sql of queries) payload.push(await rows(client, sql, sql.includes(" OR ") ? [entityId, entityId] : [entityId]));
  return digest(JSON.stringify(payload));
}

async function assertBaseline(client: Client): Promise<void> {
  const result = await client.execute({ sql: `SELECT entity.id,entity.type,entity.slug,publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id IN (?,?) ORDER BY entity.id`, args: [PHASE125_PLATINUM_BRAND_ID, PHASE125_PREPPY_ID] });
  if (result.rows.length !== 2) throw new Error("Phase 125 requires published Platinum and Preppy prerequisites.");
  const byId = new Map(result.rows.map((row) => [String(row.id), row]));
  const brand = byId.get(PHASE125_PLATINUM_BRAND_ID);
  const preppy = byId.get(PHASE125_PREPPY_ID);
  if (!brand || brand.type !== "brand" || brand.slug !== "platinum" || brand.status !== "published" || Number(brand.is_public) !== 1) throw new Error("Phase 125 requires the published Platinum brand baseline.");
  if (!preppy || preppy.type !== "pen" || preppy.slug !== "platinum-preppy" || preppy.status !== "published" || Number(preppy.is_public) !== 1) throw new Error("Phase 125 requires the published Phase 44 Preppy baseline.");
}

async function assertNoCollisions(client: Client): Promise<void> {
  const slug = await client.execute({ sql: "SELECT id FROM entities WHERE slug=? AND id<>?", args: [PHASE125_SLUG, PHASE125_TARGET_ID] });
  if (slug.rows.length) throw new Error("Phase 125 canonical slug is occupied.");
  const aliases = await client.execute({ sql: "SELECT DISTINCT entity_id FROM entity_aliases WHERE lower(alias) IN (lower(?),lower(?),lower(?),lower(?),lower(?)) AND entity_id<>?", args: [PHASE125_NAME, "Platinum PQ200", "白金 小流星 PQ200", "Platinum Little Meteor PQ-200", "Platinum Starlet PQ-200", PHASE125_TARGET_ID] });
  if (aliases.rows.length) throw new Error("Phase 125 canonical or regional alias is owned by another entity.");
  const sources = await client.execute({ sql: `SELECT DISTINCT reference.entity_id,item.url FROM entity_references reference JOIN source_items item ON item.id=reference.source_item_id WHERE item.url IN (${EXCLUSIVE_SOURCE_URLS.map(() => "?").join(",")}) AND reference.entity_id<>?`, args: [...EXCLUSIVE_SOURCE_URLS, PHASE125_TARGET_ID] });
  if (sources.rows.length) throw new Error("Phase 125 source URL is owned by another entity.");
  const oldRoute = `/pen/${PHASE125_RAW_SLUG}`;
  const redirect = await client.execute({ sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?", args: [oldRoute] });
  if (redirect.rows.length > 1 || (redirect.rows.length === 1 && (String(redirect.rows[0]?.target_path) !== `/pen/${PHASE125_SLUG}` || String(redirect.rows[0]?.redirect_kind) !== "permanent"))) throw new Error("Phase 125 old route has a conflicting redirect.");
}

async function assertExactTopology(client: Client): Promise<void> {
  const links = await rows(client, "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id", [PHASE125_TARGET_ID, PHASE125_TARGET_ID]);
  const expected = [
    { id: PHASE125_MADE_BY_ID, source_id: PHASE125_TARGET_ID, target_id: PHASE125_PLATINUM_BRAND_ID, link_type: "made_by", reason: null },
    { id: PHASE125_REVERSE_ID, source_id: PHASE125_PLATINUM_BRAND_ID, target_id: PHASE125_TARGET_ID, link_type: "reverse", reason: null },
  ].sort((a, b) => a.id.localeCompare(b.id));
  if (stableRows(links) !== stableRows(expected)) throw new Error("Phase 125 requires the exact existing PQ-200 maker/reverse pair.");
}

async function inspectTarget(client: Client, sourceMarker: string): Promise<"raw" | "terminal"> {
  const entity = (await rows(client, "SELECT * FROM entities WHERE id=?", [PHASE125_TARGET_ID]))[0];
  if (!entity) throw new Error("Phase 125 target entity is missing.");
  await assertExactTopology(client);
  const isRawIdentity = entity.type === "pen" && entity.slug === PHASE125_RAW_SLUG && entity.name === PHASE125_RAW_NAME && entity.summary === RAW_SUMMARY && entity.body_md === RAW_BODY && entity.source === null && entity.source_file === "钢笔品牌型号索引库.csv" && entity.source_url === null;
  if (isRawIdentity) {
    const aliases = await rows(client, "SELECT id,alias,language,source_id FROM entity_aliases WHERE entity_id=? ORDER BY id", [PHASE125_TARGET_ID]);
    const expectedAliases = [
      { id: "alias-Er9lACPas9qm-en-Platinum PQ200", alias: "Platinum PQ200", language: "en", source_id: null },
      { id: "alias-Er9lACPas9qm-en-Platinum Preppy", alias: PHASE125_FALSE_PREPPY_ALIAS, language: "en", source_id: null },
      { id: "alias-Er9lACPas9qm-zh-白金 小流星 PQ200", alias: "白金 小流星 PQ200", language: "zh", source_id: null },
    ];
    const spec = await rows(client, "SELECT id,series_name,origin_country,nib,fill_system,material,review_status FROM model_specs WHERE entity_id=?", [PHASE125_TARGET_ID]);
    const claim = await rows(client, "SELECT id,source_item_id,review_status FROM claims WHERE subject_entity_id=?", [PHASE125_TARGET_ID]);
    const references = await rows(client, "SELECT id,source_item_id,review_status FROM entity_references WHERE entity_id=? ORDER BY id", [PHASE125_TARGET_ID]);
    const publication = await rows(client, "SELECT status,approved_content_hash,content_revision FROM entity_publications WHERE entity_id=?", [PHASE125_TARGET_ID]);
    if (stableRows(aliases) !== stableRows(expectedAliases) || spec.length !== 1 || spec[0]?.id !== "spec-platinum-preppy-pq200-research" || spec[0]?.series_name !== "小流星 / PQ200 / Preppy identity pending" || spec[0]?.review_status !== "needs_source" || claim.length !== 1 || claim[0]?.id !== "claim-platinum-preppy-pq200-source-boundary" || claim[0]?.source_item_id !== "source-platinum-preppy-pq200-public-search" || references.length !== 2 || references[0]?.id !== "eref-commerce-1a48e667af8f67" || references[1]?.id !== "reference-model-gap-Er9lACPas9qm-source-platinum-preppy-pq200-public-search" || publication.length !== 1 || publication[0]?.status !== "draft" || publication[0]?.approved_content_hash !== null || Number(publication[0]?.content_revision) !== 1) throw new Error("Phase 125 raw payload does not match the locked inventory.");
    return "raw";
  }
  if (entity.type !== "pen" || entity.slug !== PHASE125_SLUG || entity.name !== PHASE125_NAME || entity.source !== sourceMarker) throw new Error("Phase 125 target is neither exact raw nor exact terminal state.");
  const expectedAliases = [PHASE125_RAW_NAME, ...PHASE125_TRUTHFUL_LEGACY_ALIASES, "Platinum Little Meteor PQ-200", "Platinum Starlet PQ-200"].sort();
  const aliases = (await rows(client, "SELECT alias FROM entity_aliases WHERE entity_id=? ORDER BY alias", [PHASE125_TARGET_ID])).map((row) => String(row.alias)).sort();
  if (JSON.stringify(aliases) !== JSON.stringify(expectedAliases) || aliases.includes(PHASE125_FALSE_PREPPY_ALIAS)) throw new Error("Phase 125 terminal aliases are incomplete or contaminated.");
  const redirect = await rows(client, "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?", [`/pen/${PHASE125_RAW_SLUG}`]);
  if (redirect.length !== 1 || redirect[0]?.target_path !== `/pen/${PHASE125_SLUG}` || redirect[0]?.redirect_kind !== "permanent") throw new Error("Phase 125 terminal redirect is invalid.");
  const variants = (await rows(client, "SELECT variant_name FROM model_variants WHERE model_entity_id=? ORDER BY variant_name", [PHASE125_TARGET_ID])).map((row) => String(row.variant_name)).sort();
  if (JSON.stringify(variants) !== JSON.stringify([...PHASE125_VARIANTS].sort())) throw new Error("Phase 125 terminal nib variants are invalid.");
  const scopes = await rows(client, "SELECT scope_key FROM fact_scopes WHERE entity_id=?", [PHASE125_TARGET_ID]);
  const refs = await rows(client, "SELECT item.url FROM entity_references reference JOIN source_items item ON item.id=reference.source_item_id WHERE reference.entity_id=? ORDER BY item.url", [PHASE125_TARGET_ID]);
  const media = await rows(client, "SELECT local_path,license,usage_status FROM media_assets WHERE entity_id=?", [PHASE125_TARGET_ID]);
  const stories = await rows(client, "SELECT status FROM stories WHERE entity_id=?", [PHASE125_TARGET_ID]);
  const specs = await rows(client, "SELECT series_name,release_year,origin_country,nib,fill_system,material,status,review_status FROM model_specs WHERE entity_id=?", [PHASE125_TARGET_ID]);
  if (scopes.length !== 6 || JSON.stringify(refs.map((row) => String(row.url)).sort()) !== JSON.stringify(EXPECTED_SOURCE_URLS) || media.length !== 1 || media[0]?.local_path !== "/images/library/site-original/phase125/platinum/platinum-small-meteor-pq-200.svg" || media[0]?.license !== "site-original" || media[0]?.usage_status !== "primary" || stories.length !== 1 || stories[0]?.status !== "published" || specs.length !== 1 || specs[0]?.series_name !== "Platinum Small Meteor PQ-200" || specs[0]?.release_year !== "2019" || specs[0]?.review_status !== "approved") throw new Error("Phase 125 terminal content payload is incomplete or tampered.");
  const currentHash = await computePublicationContentHash(client, PHASE125_TARGET_ID);
  const publication = await rows(client, "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?", [PHASE125_TARGET_ID]);
  const reviews = await rows(client, "SELECT review_kind,status FROM entity_content_reviews WHERE entity_id=? AND content_hash=? ORDER BY review_kind", [PHASE125_TARGET_ID, currentHash]);
  const publicRow = await rows(client, "SELECT id FROM public_entities WHERE id=?", [PHASE125_TARGET_ID]);
  if (publication.length !== 1 || publication[0]?.status !== "published" || publication[0]?.approved_content_hash !== currentHash || JSON.stringify(reviews.map((row) => String(row.review_kind))) !== JSON.stringify(["fact", "language", "media", "publication"]) || reviews.some((row) => row.status !== "approved") || publicRow.length !== 1) throw new Error("Phase 125 terminal publication does not authorize the current hash.");
  return "terminal";
}

async function insertRedirect(tx: Transaction, actionId: string): Promise<void> {
  const source = `/pen/${PHASE125_RAW_SLUG}`;
  const target = `/pen/${PHASE125_SLUG}`;
  await tx.execute({ sql: "INSERT INTO entity_redirects (id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES (?,?,?,?,?,'permanent','canonical_slug_rename')", args: [stableId("phase125-pq200-redirect", source), BATCH_ID, actionId, source, target] });
}

async function prepareIdentity(client: Client): Promise<void> {
  const tx = await client.transaction("write");
  try {
    await tx.execute({ sql: "INSERT INTO taxonomy_batches (id,source_key,source_checksum,status,note) VALUES (?,?,?,'applied',?)", args: [BATCH_ID, "phase125-platinum-small-meteor-pq-200-v1", digest("phase125-platinum-small-meteor-pq-200-v1"), "Canonicalize PQ-200 and remove the false Preppy identity merge through the curated pack."] });
    const actionId = stableId("phase125-pq200-rename", PHASE125_TARGET_ID);
    await tx.execute({ sql: "INSERT INTO taxonomy_actions (id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES (?,?,?,'rename',?,?,?,'applied',?)", args: [actionId, BATCH_ID, PHASE125_RAW_SLUG, digest(`${PHASE125_TARGET_ID}:${PHASE125_RAW_SLUG}:${PHASE125_SLUG}`), PHASE125_TARGET_ID, PHASE125_TARGET_ID, "Same-ID PQ-200 canonicalization; Preppy remains separate."] });
    const updated = await tx.execute({ sql: "UPDATE entities SET slug=?,name=?,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=? AND name=?", args: [PHASE125_SLUG, PHASE125_NAME, PHASE125_TARGET_ID, PHASE125_RAW_SLUG, PHASE125_RAW_NAME] });
    if (updated.rowsAffected !== 1) throw new Error("Phase 125 raw identity changed before canonicalization.");
    await insertRedirect(tx, actionId);
    await tx.execute({ sql: "DELETE FROM claim_evidence WHERE claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?)", args: [PHASE125_TARGET_ID] });
    await tx.execute({ sql: "DELETE FROM citations WHERE claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?) OR (target_type='model_spec' AND target_id IN (SELECT id FROM model_specs WHERE entity_id=?))", args: [PHASE125_TARGET_ID, PHASE125_TARGET_ID] });
    await tx.execute({ sql: "DELETE FROM spec_field_evidence WHERE model_spec_id IN (SELECT id FROM model_specs WHERE entity_id=?)", args: [PHASE125_TARGET_ID] });
    for (const [table, column] of [["entity_references", "entity_id"], ["entity_aliases", "entity_id"], ["stories", "entity_id"], ["claims", "subject_entity_id"], ["fact_scopes", "entity_id"], ["model_variants", "model_entity_id"], ["model_specs", "entity_id"], ["timeline_events", "entity_id"], ["media_assets", "entity_id"]] as const) await tx.execute({ sql: `DELETE FROM ${table} WHERE ${column}=?`, args: [PHASE125_TARGET_ID] });
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

function sourceReliability(source: CuratedSource): string {
  if (source.sourceType === "official") return "official_marketing";
  if (source.tier === "professional_secondary") return "high_for_model_history";
  return "medium";
}

function sourceItemId(sourceKey: string): string { return curatedId("source-item", sourceKey); }

async function upsertSources(tx: Transaction, pack: LoadedCuratedEntityPack): Promise<void> {
  for (const source of pack.sources) {
    await tx.execute({
      sql: `INSERT INTO source_registry(id,name,source_type,allowed_use,reliability,license,attribution,homepage_url,fetch_method,notes,last_checked_at,default_source_tier,default_independence_group)
            VALUES(?,?,?,?,?,?,?,?,'manual',?,?,?,?)
            ON CONFLICT(id) DO UPDATE SET name=excluded.name,source_type=excluded.source_type,allowed_use=excluded.allowed_use,reliability=excluded.reliability,license=excluded.license,attribution=excluded.attribution,homepage_url=excluded.homepage_url,notes=excluded.notes,last_checked_at=excluded.last_checked_at,default_source_tier=excluded.default_source_tier,default_independence_group=excluded.default_independence_group,updated_at=datetime('now')`,
      args: [curatedId("source-registry", source.registryKey), source.registryName, source.sourceType, source.allowedUse, sourceReliability(source), source.license ?? null, source.author ?? null, source.homepageUrl, `Phase 125 curated source registry: ${source.registryKey}`, source.retrievedAt, source.tier, source.independenceGroup],
    });
    await tx.execute({
      sql: `INSERT INTO source_items(id,source_id,title,url,item_type,license,author,published_at,retrieved_at,summary,raw_metadata_json,allowed_use,review_status,source_tier,independence_group,archive_url,archive_locator)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,'approved',?,?,?,?)
            ON CONFLICT(id) DO UPDATE SET source_id=excluded.source_id,title=excluded.title,url=excluded.url,item_type=excluded.item_type,license=excluded.license,author=excluded.author,published_at=excluded.published_at,retrieved_at=excluded.retrieved_at,summary=excluded.summary,raw_metadata_json=excluded.raw_metadata_json,allowed_use=excluded.allowed_use,review_status=excluded.review_status,source_tier=excluded.source_tier,independence_group=excluded.independence_group,archive_url=excluded.archive_url,archive_locator=excluded.archive_locator,updated_at=datetime('now')`,
      args: [sourceItemId(source.key), curatedId("source-registry", source.registryKey), source.title, source.url, source.itemType ?? "web_page", source.license ?? null, source.author ?? null, source.publishedAt ?? null, source.retrievedAt, source.summary, JSON.stringify({ curatedSourceKey: source.key, archiveLocator: source.archiveLocator }), source.allowedUse, source.tier, source.independenceGroup, source.archiveUrl ?? null, source.archiveLocator ?? null],
    });
  }
}

async function installPack(client: Client, pack: LoadedCuratedEntityPack): Promise<void> {
  const tx = await client.transaction("write");
  try {
    await upsertSources(tx, pack);
    const updated = await tx.execute({ sql: "UPDATE entities SET name=?,summary=?,body_md=?,source=?,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=?", args: [pack.canonicalName, pack.summary, pack.bodyMd, pack.sourceMarker, pack.entityId, pack.expectedSlug] });
    if (updated.rowsAffected !== 1) throw new Error("Phase 125 target identity changed before payload install.");
    const publication = await tx.execute({ sql: "UPDATE entity_publications SET depth_tier=?,updated_at=datetime('now') WHERE entity_id=?", args: [pack.depthTier, pack.entityId] });
    if (publication.rowsAffected !== 1) throw new Error("Phase 125 target publication row is missing.");
    await tx.execute({ sql: "INSERT INTO stories(id,entity_id,title,story_type,summary,body_md,status,source_notes) VALUES(?,?,?,'model_story',?,?,'published',?)", args: [packId(pack, "story", "published"), pack.entityId, pack.storyTitle, pack.summary, pack.bodyMd, pack.sourceMarker] });
    for (const source of pack.sources) {
      const relationType = source.sourceType === "official" ? "official" : source.tier === "professional_secondary" ? "review" : "reference";
      await tx.execute({ sql: "INSERT INTO entity_references(id,entity_id,source_item_id,relation_type,note,review_status) VALUES(?,?,?,?,?,'approved')", args: [packId(pack, "reference", source.key), pack.entityId, sourceItemId(source.key), relationType, source.summary] });
    }
    for (const alias of pack.aliases) {
      const source = pack.sources.find((item) => item.key === alias.sourceKey);
      if (!source) throw new Error(`Phase 125 alias source missing: ${alias.sourceKey}`);
      await tx.execute({ sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,source_id,alias_kind,market,source_item_id,review_status) VALUES(?,?,?,?,?,?,?,?,'approved')", args: [packId(pack, "alias", `${alias.language}:${alias.alias}`), pack.entityId, alias.alias, alias.language, curatedId("source-registry", source.registryKey), alias.kind ?? "alias", alias.market ?? null, sourceItemId(alias.sourceKey)] });
    }
    const variantIds = new Map<string, string>();
    for (const variant of pack.variants ?? []) {
      const variantId = packId(pack, "variant", variant.key);
      variantIds.set(variant.key, variantId);
      await tx.execute({ sql: "INSERT INTO model_variants(id,model_entity_id,variant_name,release_year,notes,source_item_id,review_status,variant_kind,parent_variant_id,product_code,market) VALUES(?,?,?,?,?,?,'approved',?,?,?,?)", args: [variantId, pack.entityId, variant.name, variant.releaseYear ?? null, variant.notes, sourceItemId(variant.sourceKey), variant.variantKind ?? "variant", variant.parentVariantKey ? variantIds.get(variant.parentVariantKey) ?? null : null, variant.productCode ?? null, variant.market ?? null] });
    }
    const scopeIds = new Map<string, string>();
    for (const scope of pack.scopes) {
      const scopeId = packId(pack, "scope", scope.key);
      scopeIds.set(scope.scopeKey, scopeId);
      await tx.execute({ sql: "INSERT INTO fact_scopes(id,entity_id,variant_id,scope_key,market,valid_from,valid_to,production_state,nib_scope,material_scope,edition_scope) VALUES(?,?,?,?,?,?,?,?,?,?,?)", args: [scopeId, pack.entityId, scope.variantKey ? variantIds.get(scope.variantKey) ?? null : null, scope.scopeKey, scope.market ?? null, scope.validFrom ?? null, scope.validTo ?? null, scope.productionState ?? null, scope.nibScope ?? null, scope.materialScope ?? null, scope.editionScope ?? null] });
    }
    for (const claim of pack.claims) {
      const claimId = packId(pack, "claim", claim.key);
      await tx.execute({ sql: "INSERT INTO claims(id,subject_entity_id,predicate,object_text,source_item_id,evidence_locator,confidence,review_status,fact_class) VALUES(?,?,?,?,?,?,?,'approved',?)", args: [claimId, pack.entityId, claim.predicate, claim.objectText, sourceItemId(claim.sourceKey), claim.locator, claim.confidence, claim.factClass] });
      for (const item of claim.evidence) {
        const scopeId = scopeIds.get(item.scopeKey);
        if (!scopeId) throw new Error(`Phase 125 claim scope missing: ${item.scopeKey}`);
        const citationId = packId(pack, "claim-citation", item.key);
        await tx.execute({ sql: "INSERT INTO citations(id,target_type,target_id,source_item_id,claim_id,note,review_status,evidence_locator,scope_id) VALUES(?,'claim',?,?,?,?,'approved',?,?)", args: [citationId, claimId, sourceItemId(item.sourceKey), claimId, item.note ?? null, item.locator, scopeId] });
        await tx.execute({ sql: "INSERT INTO claim_evidence(id,claim_id,citation_id,scope_id,evidence_locator,review_status) VALUES(?,?,?,?,?,'approved')", args: [packId(pack, "claim-evidence", item.key), claimId, citationId, scopeId, item.locator] });
      }
    }
    if (!pack.spec) throw new Error("Phase 125 target pack requires model specs.");
    const specId = packId(pack, "model-spec", "approved");
    const values = pack.spec.values;
    await tx.execute({ sql: "INSERT INTO model_specs(id,entity_id,brand_entity_id,series_name,release_year,origin_country,nib,fill_system,material,dimensions,weight,price_range,status,review_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,'approved')", args: [specId, pack.entityId, pack.spec.brandEntityId, values.series_name ?? null, values.release_year ?? null, values.origin_country ?? null, values.nib ?? null, values.fill_system ?? null, values.material ?? null, values.dimensions ?? null, values.weight ?? null, values.price_range ?? null, values.status ?? null] });
    for (const item of pack.spec.evidence) {
      const scopeId = scopeIds.get(item.scopeKey);
      if (!scopeId) throw new Error(`Phase 125 spec scope missing: ${item.scopeKey}`);
      const citationId = packId(pack, "spec-citation", item.key);
      await tx.execute({ sql: "INSERT INTO citations(id,target_type,target_id,source_item_id,note,review_status,evidence_locator,scope_id) VALUES(?,'model_spec',?,?,?,'approved',?,?)", args: [citationId, specId, sourceItemId(item.sourceKey), item.note ?? null, item.locator, scopeId] });
      await tx.execute({ sql: "INSERT INTO spec_field_evidence(id,model_spec_id,field_key,citation_id,scope_id,evidence_locator,review_status) VALUES(?,?,?,?,?,?,?)", args: [packId(pack, "spec-evidence", item.key), specId, item.fieldKey, citationId, scopeId, item.locator, item.qualifies === false ? "rejected" : "approved"] });
    }
    for (const event of pack.timeline ?? []) await tx.execute({ sql: "INSERT INTO timeline_events(id,entity_id,title,event_type,start_date,circa,description,source_item_id,review_status) VALUES(?,?,?,?,?,?,?,?,'approved')", args: [packId(pack, "timeline", event.key), pack.entityId, event.title, event.eventType, event.startDate, event.circa ? 1 : 0, event.description, sourceItemId(event.sourceKey)] });
    for (const media of pack.media) await tx.execute({ sql: "INSERT INTO media_assets(id,entity_id,title,asset_type,image_url,thumbnail_url,local_path,author,license,attribution_text,source_url,source_item_id,review_status,usage_status) VALUES(?,?,?,'image',?,?,?,?,?,?,?,?,'approved',?)", args: [packId(pack, "media", media.key), pack.entityId, media.title, media.imageUrl ?? null, media.thumbnailUrl ?? null, media.localPath ?? null, media.author, media.license, media.attributionText, media.sourceUrl, sourceItemId(media.sourceKey), media.usageStatus] });
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
}

export async function applyPhase125PlatinumSmallMeteorContent(client: Client, options: ApplyPhase125Options): Promise<ApplyPhase125Result> {
  const workspaceRoot = await assertAuthority(client, options);
  const loaded = loadPhase125PlatinumSmallMeteorPack(workspaceRoot);
  if (!fs.existsSync(path.join(workspaceRoot, "public", loaded.media[0]?.localPath?.replace(/^\//, "") ?? "missing"))) throw new Error("Phase 125 primary SVG is missing.");
  await assertBaseline(client);
  await assertNoCollisions(client);
  const brandBefore = await entityDigest(client, PHASE125_PLATINUM_BRAND_ID);
  const preppyBefore = await entityDigest(client, PHASE125_PREPPY_ID);
  const state = await inspectTarget(client, loaded.sourceMarker);
  if (state === "raw") await prepareIdentity(client);
  if (state === "terminal") {
    const contentHash = await computePublicationContentHash(client, PHASE125_TARGET_ID);
    if ((await entityDigest(client, PHASE125_PLATINUM_BRAND_ID)) !== brandBefore || (await entityDigest(client, PHASE125_PREPPY_ID)) !== preppyBefore) throw new Error("Phase 125 changed protected Platinum brand or Preppy state.");
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return { entities: [{ entityId: PHASE125_TARGET_ID, outcome: "noop", contentHash }] };
  }
  await installPack(client, loaded);
  for (const reviewKind of ["fact", "language", "media"] as const) await recordEntityContentReview(client, { entityId: PHASE125_TARGET_ID, reviewKind, reviewer: options.reviewer.trim(), status: "approved", notes: `${loaded.sourceMarker}; ${reviewKind} review of Phase 125 checked-in sourced copy.` });
  const published = await publishEntity(client, { entityId: PHASE125_TARGET_ID, reviewer: options.reviewer.trim() });
  const result: ApplyPhase125Result = { entities: [{ entityId: PHASE125_TARGET_ID, outcome: "published", contentHash: published.contentHash }] };
  await inspectTarget(client, loaded.sourceMarker);
  if ((await entityDigest(client, PHASE125_PLATINUM_BRAND_ID)) !== brandBefore || (await entityDigest(client, PHASE125_PREPPY_ID)) !== preppyBefore) throw new Error("Phase 125 changed protected Platinum brand or Preppy state.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

async function main(): Promise<void> {
  const databasePath = process.argv[2];
  const ownedRoot = process.argv[3];
  if (!databasePath || !ownedRoot) throw new Error("Usage: tsx scripts/apply-phase125-platinum-small-meteor-pq-200-content.ts <owned-checkpoint.db> <owned-root>");
  const protectedCatalogPath = path.resolve("data/fpkg.db");
  const { snapshotCatalogFiles } = await import("../src/lib/audit/read-only-catalog");
  const client = createClient({ url: `file:${path.resolve(databasePath)}` });
  try { process.stdout.write(`${JSON.stringify(await applyPhase125PlatinumSmallMeteorContent(client, { workspaceRoot: path.resolve("."), reviewer: "phase125-cli", databasePath: path.resolve(databasePath), ownedRoot: path.resolve(ownedRoot), protectedCatalogPath, protectedCatalogSnapshot: snapshotCatalogFiles(protectedCatalogPath), env: { ...process.env, TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", FPKG_DATABASE_URL: "" } }), null, 2)}\n`); } finally { client.close(); }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) void main();
