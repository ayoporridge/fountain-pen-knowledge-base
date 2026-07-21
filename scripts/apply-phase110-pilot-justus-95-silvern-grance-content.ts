import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { type Client, createClient, type Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  computePublicationContentHash,
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import type {
  ApplyPhase22Options,
  ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  PHASE110_GRANCE_ID,
  PHASE110_GRANCE_SLUG,
  PHASE110_IDENTITY_MARKERS,
  PHASE110_JUSTUS_ID,
  PHASE110_JUSTUS_SLUG,
  PHASE110_PILOT_ID,
  PHASE110_SILVERN_ID,
  PHASE110_SILVERN_SLUG,
  loadPhase110PilotPacks,
} from "./data/phase110-pilot-justus-95-silvern-grance";
import {
  curatedId,
  packId,
  type LoadedCuratedEntityPack,
  type SpecFieldKey,
} from "./lib/curated-content-pack";

export {
  PHASE110_GRANCE_ID,
  PHASE110_GRANCE_SLUG,
  PHASE110_JUSTUS_ID,
  PHASE110_JUSTUS_SLUG,
  PHASE110_PILOT_ID,
  PHASE110_SILVERN_ID,
  PHASE110_SILVERN_SLUG,
};

export type ApplyPhase110Options = ApplyPhase22Options;
export type ApplyPhase110Result = ApplyPhase22Result;

const TARGETS = [
  {
    id: PHASE110_JUSTUS_ID,
    slug: PHASE110_JUSTUS_SLUG,
    name: "百乐 Pilot Justus 95",
    makerId: "phase110-maker-justus-pilot",
  },
  {
    id: PHASE110_SILVERN_ID,
    slug: PHASE110_SILVERN_SLUG,
    name: "百乐 Pilot Silvern",
    makerId: "phase110-maker-silvern-pilot",
  },
  {
    id: PHASE110_GRANCE_ID,
    slug: PHASE110_GRANCE_SLUG,
    name: "百乐 Pilot Grance",
    makerId: "phase110-maker-grance-pilot",
  },
] as const;

async function brandNonTopologyPayload(client: Client): Promise<string> {
  const queries = [
    "SELECT id,type,slug,name,summary,body_md,source FROM entities WHERE id=?",
    "SELECT id,title,story_type,summary,body_md,status,source_notes FROM stories WHERE entity_id=? ORDER BY id",
    "SELECT id,source_item_id,relation_type,note,review_status FROM entity_references WHERE entity_id=? ORDER BY id",
    "SELECT id,brand_entity_id,series_name,release_year,origin_country,nib,fill_system,material,dimensions,weight,price_range,status,review_status FROM model_specs WHERE entity_id=? ORDER BY id",
    "SELECT id,title,local_path,source_item_id,review_status,usage_status FROM media_assets WHERE entity_id=? ORDER BY id",
  ] as const;
  const payload = [];
  for (const sql of queries) {
    const result = await client.execute({ sql, args: [PHASE110_PILOT_ID] });
    payload.push(result.rows.map((row) => ({ ...row })));
  }
  return JSON.stringify(payload);
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 110 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function assertOwnedCatalog(
  client: Client,
  options: ApplyPhase110Options,
): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 110 reviewer must not be empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);

  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  const workspaceRoot = fs.realpathSync.native(options.workspaceRoot);
  if (options.workspaceRoot !== "/Users/xz/CodeBuddy/fountain-pen-graph") {
    throw new Error("Phase 110 logical workspace must be /Users/xz/CodeBuddy/fountain-pen-graph.");
  }
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !isInside(databasePath, ownedRoot)
  ) {
    throw new Error(
      "Phase 110 requires a non-symlink catalog file inside the caller-owned root.",
    );
  }
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (
    databasePath === protectedPath ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error("Phase 110 refuses the protected catalog or a hard-link alias.");
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 110 client is not bound to the authorized owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 110 owned copy must be migrated through 032.");
  }
  return workspaceRoot;
}

function validatePacks(
  workspaceRoot: string,
  ownedRoot: string,
): LoadedCuratedEntityPack[] {
  const packs = loadPhase110PilotPacks(ownedRoot);
  if (
    packs.length !== 3 ||
    packs[0]?.entityId !== PHASE110_JUSTUS_ID ||
    packs[1]?.entityId !== PHASE110_SILVERN_ID ||
    packs[2]?.entityId !== PHASE110_GRANCE_ID
  ) {
    throw new Error("Phase 110 requires the exact ordered Justus 95/Silvern/Grance pack set.");
  }
  for (const pack of packs) {
    const summaryLength = Array.from(pack.summary).length;
    if (summaryLength < 60 || summaryLength > 160) {
      throw new Error(`${pack.key} summary must contain 60-160 Unicode characters.`);
    }
    if (Array.from(pack.bodyMd).length < 2_000) {
      throw new Error(`${pack.key} body must contain at least 2,000 Unicode characters.`);
    }
    if (!pack.spec || pack.claims.length < 2 || pack.scopes.length < 2) {
      throw new Error(`${pack.key} lacks claims, current/history scopes, or model specs.`);
    }
    const independence = new Set(
      pack.sources
        .filter((source) => source.itemType !== "image")
        .map((source) => source.independenceGroup),
    );
    if (!independence.has("pilot-official") || independence.size < 2) {
      throw new Error(`${pack.key} requires official and independent professional evidence.`);
    }
    if (
      !pack.scopes.some(
        (scope) =>
          /sample/.test(scope.scopeKey) &&
          scope.productionState === "historical",
      )
    ) {
      throw new Error(`${pack.key} lacks a dated historical/sample boundary.`);
    }
    for (const source of pack.sources) {
      if (!source.archiveUrl?.trim() || !source.archiveLocator?.trim()) {
        throw new Error(`${pack.key} source lacks an honest locator: ${source.key}.`);
      }
    }
    const primary = pack.media.filter((media) => media.usageStatus === "primary");
    if (primary.length !== 1 || !primary[0]?.localPath) {
      throw new Error(`${pack.key} requires exactly one local primary SVG.`);
    }
    const imagePath = path.join(workspaceRoot, "public", primary[0].localPath.slice(1));
    const image = fs.readFileSync(imagePath, "utf8");
    if (!image.includes("本站原创示意图，非产品照片")) {
      throw new Error(`${pack.key} primary SVG lacks the non-photo disclosure.`);
    }
    const required = new Set<SpecFieldKey>([
      "brand_entity_id",
      ...(Object.keys(pack.spec.values) as SpecFieldKey[]),
    ]);
    const evidenced = new Set(
      pack.spec.evidence
        .filter((evidence) => evidence.qualifies !== false)
        .map((evidence) => evidence.fieldKey),
    );
    for (const field of required) {
      if (!evidenced.has(field)) {
        throw new Error(`${pack.key} spec field lacks evidence: ${field}.`);
      }
    }
  }
  const currentSpecs = packs.map((pack) => JSON.stringify(pack.spec?.values));
  if (currentSpecs.some((spec) => /CON-20|CON-50|standard-international/i.test(spec))) {
    throw new Error("Phase 110 current specs contain historical or regional filling claims.");
  }
  const serialized = packs.map((pack) => JSON.stringify(pack));
  if (!serialized[0]?.includes("traditional-flex guarantee"))
    throw new Error("Phase 110 Justus lacks the non-traditional-flex boundary.");
  if (!serialized[1]?.includes("special_sample_2024_jaguar"))
    throw new Error("Phase 110 Silvern lacks the Jaguar special-sample boundary.");
  if (!serialized[2]?.includes("historical_family_boundary"))
    throw new Error("Phase 110 Grance lacks the historical-family boundary.");
  return packs;
}

async function assertIdentityPreflight(client: Client): Promise<void> {
  const brand = await client.execute({
    sql: `SELECT entity.id,entity.type,entity.slug,publication.status,
                 readiness.publishable,readiness.blocker_count,
                 CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
          FROM entities entity
          JOIN entity_publications publication ON publication.entity_id=entity.id
          LEFT JOIN public_entity_readiness readiness ON readiness.entity_id=entity.id AND readiness.contract_version=3
          LEFT JOIN public_entities public ON public.id=entity.id
          WHERE entity.id=? OR entity.slug='pilot' ORDER BY entity.id`,
    args: [PHASE110_PILOT_ID],
  });
  const pilot = brand.rows[0];
  if (
    brand.rows.length !== 1 ||
    String(pilot?.id) !== PHASE110_PILOT_ID ||
    String(pilot?.type) !== "brand" ||
    String(pilot?.slug) !== "pilot"
  ) {
    throw new Error("Phase 110 requires the exact Pilot brand identity prerequisite.");
  }

  for (const marker of Object.values(PHASE110_IDENTITY_MARKERS)) {
    const target = TARGETS.find((item) => item.id === marker.id);
    if (!target) throw new Error(`Phase 110 marker has no target: ${marker.id}.`);
    const names = marker.names.map((name) => name.trim().toLowerCase());
    const entities = await client.execute({ sql: `SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? OR lower(trim(name)) IN (${names.map(() => "?").join(",")}) ORDER BY id`, args: [marker.id, marker.slug, ...names] });
    const aliases = await client.execute({ sql: `SELECT a.entity_id AS id,e.type,e.slug,a.alias AS name FROM entity_aliases a JOIN entities e ON e.id=a.entity_id WHERE lower(trim(a.alias)) IN (${names.map(() => "?").join(",")}) ORDER BY a.entity_id`, args: names });
    const variants = await client.execute({ sql: `SELECT v.model_entity_id AS id,e.type,e.slug,coalesce(v.product_code,v.variant_name) AS name FROM model_variants v JOIN entities e ON e.id=v.model_entity_id WHERE upper(replace(coalesce(v.product_code,v.variant_name),' ','')) IN (${marker.skus.map(() => "?").join(",")}) ORDER BY v.model_entity_id`, args: marker.skus.map((sku) => sku.toUpperCase().replaceAll(" ", "")) });
    const urls = await client.execute({ sql: `SELECT r.entity_id AS id,e.type,e.slug,i.url AS name FROM entity_references r JOIN source_items i ON i.id=r.source_item_id JOIN entities e ON e.id=r.entity_id WHERE lower(rtrim(i.url,'/')) IN (${marker.officialUrls.map(() => "?").join(",")}) ORDER BY r.entity_id`, args: marker.officialUrls.map((url) => url.split("#", 1)[0]?.replace(/\/$/, "").toLowerCase() ?? "") });
    for (const [criterion, candidates] of [["exact-name", [...entities.rows, ...aliases.rows]], ["exact-SKU", variants.rows], ["exact-source-URL", urls.rows]] as const) {
      for (const candidate of candidates) {
        if (String(candidate.id) !== marker.id) throw new Error(`Phase 110 ${criterion} collision: candidate=${String(candidate.id)} type=${String(candidate.type)} slug=${String(candidate.slug)} locator=${String(candidate.name)}.`);
      }
    }
    const own = entities.rows.filter((row) => String(row.id) === marker.id);
    if (own.length > 0 && (own.length !== 1 || String(own[0]?.type) !== "pen" || String(own[0]?.slug) !== marker.slug || String(own[0]?.name) !== target.name)) throw new Error(`Phase 110 target-ID payload mismatch: ${marker.id}.`);
    if (own.length === 1) {
      const maker = await client.execute({ sql: "SELECT id,target_id,link_type,reason FROM entity_links WHERE source_id=? ORDER BY id", args: [marker.id] });
      if (maker.rows.length !== 1 || String(maker.rows[0]?.id) !== target.makerId || String(maker.rows[0]?.target_id) !== PHASE110_PILOT_ID || String(maker.rows[0]?.link_type) !== "made_by" || maker.rows[0]?.reason !== null) {
        throw new Error(`Phase 110 exact made_by topology mismatch: ${marker.id}.`);
      }
    }
  }
  if (
    String(pilot?.status) !== "published" ||
    Number(pilot?.publishable) !== 1 ||
    Number(pilot?.blocker_count) !== 0 ||
    Number(pilot?.is_public) !== 1
  ) {
    throw new Error("Phase 110 requires the published/readiness Pilot brand prerequisite.");
  }
}

async function exactTerminalHash(
  client: Client,
  pack: LoadedCuratedEntityPack,
): Promise<string | null> {
  const target = TARGETS.find((item) => item.id === pack.entityId);
  if (!target) return null;
  const currentHash = await computePublicationContentHash(client, pack.entityId).catch(
    () => null,
  );
  if (!currentHash) return null;
  const stateRows = await client.execute({
    sql: `SELECT entity.slug,entity.source,publication.status,
                 publication.approved_content_hash,publication.content_revision,
                 publication.reviewed_content_revision,publication.reviewed_contract_version,
                 readiness.publishable,readiness.blocker_count,
                 CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
          FROM entities entity
          JOIN entity_publications publication ON publication.entity_id=entity.id
          LEFT JOIN public_entity_readiness readiness ON readiness.entity_id=entity.id AND readiness.contract_version=3
          LEFT JOIN public_entities public ON public.id=entity.id
          WHERE entity.id=?`,
    args: [pack.entityId],
  });
  const state = stateRows.rows[0];
  if (
    !state ||
    String(state.slug) !== target.slug ||
    String(state.source ?? "") !== pack.sourceMarker ||
    String(state.status) !== "published" ||
    String(state.approved_content_hash ?? "") !== currentHash ||
    Number(state.content_revision) !== Number(state.reviewed_content_revision) ||
    Number(state.reviewed_contract_version) !== 3 ||
    Number(state.publishable) !== 1 ||
    Number(state.blocker_count) !== 0 ||
    Number(state.is_public) !== 1
  ) {
    return null;
  }
  const reviews = await client.execute({
    sql: "SELECT review_kind,count(*) AS total FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' GROUP BY review_kind",
    args: [pack.entityId, currentHash],
  });
  const reviewCounts = new Map(
    reviews.rows.map((row) => [String(row.review_kind), Number(row.total)]),
  );
  if (
    ["fact", "language", "media", "publication"].some(
      (kind) => reviewCounts.get(kind) !== 1,
    )
  ) {
    return null;
  }
  const maker = await client.execute({
    sql: "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id=? AND link_type='made_by'",
    args: [pack.entityId],
  });
  const primary = await client.execute({
    sql: "SELECT local_path FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved'",
    args: [pack.entityId],
  });
  return maker.rows.length === 1 &&
    String(maker.rows[0]?.id) === target.makerId &&
    String(maker.rows[0]?.source_id) === target.id &&
    String(maker.rows[0]?.target_id) === PHASE110_PILOT_ID &&
    String(maker.rows[0]?.link_type) === "made_by" &&
    maker.rows[0]?.reason === null &&
    primary.rows.length === 1 &&
    String(primary.rows[0]?.local_path) ===
      pack.media.find((media) => media.usageStatus === "primary")?.localPath
    ? currentHash
    : null;
}

async function createIdentitiesAndTopology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    for (const target of TARGETS) {
      await transaction.execute({
        sql: "INSERT OR IGNORE INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
        args: [target.id, target.slug, target.name],
      });
      await transaction.execute({
        sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type) VALUES(?,?,?,'made_by')",
        args: [target.makerId, target.id, PHASE110_PILOT_ID],
      });
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

async function deleteOwnedPayload(
  transaction: Transaction,
  entityId: string,
): Promise<void> {
  await transaction.execute({
    sql: "DELETE FROM claim_evidence WHERE claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?)",
    args: [entityId],
  });
  await transaction.execute({
    sql: "DELETE FROM spec_field_evidence WHERE model_spec_id IN (SELECT id FROM model_specs WHERE entity_id=?)",
    args: [entityId],
  });
  await transaction.execute({
    sql: `DELETE FROM citations
          WHERE (target_type='entity' AND target_id=?)
             OR (target_type='story' AND target_id IN (SELECT id FROM stories WHERE entity_id=?))
             OR (target_type='timeline_event' AND target_id IN (SELECT id FROM timeline_events WHERE entity_id=?))
             OR (target_type='model_spec' AND target_id IN (SELECT id FROM model_specs WHERE entity_id=?))
             OR (target_type='claim' AND target_id IN (SELECT id FROM claims WHERE subject_entity_id=?))
             OR claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?)`,
    args: Array(6).fill(entityId),
  });
  for (const sql of [
    "DELETE FROM fact_conflicts WHERE entity_id=?",
    "DELETE FROM fact_scopes WHERE entity_id=?",
    "DELETE FROM entity_references WHERE entity_id=?",
    "DELETE FROM entity_aliases WHERE entity_id=?",
    "DELETE FROM timeline_events WHERE entity_id=?",
    "DELETE FROM media_assets WHERE entity_id=?",
    "DELETE FROM model_variants WHERE model_entity_id=?",
    "DELETE FROM model_specs WHERE entity_id=?",
    "DELETE FROM claims WHERE subject_entity_id=?",
    "DELETE FROM stories WHERE entity_id=?",
  ]) {
    await transaction.execute({ sql, args: [entityId] });
  }
}

async function upsertSources(
  transaction: Transaction,
  packs: LoadedCuratedEntityPack[],
): Promise<Map<string, string>> {
  const sources = new Map(
    packs.flatMap((pack) => pack.sources).map((source) => [source.key, source]),
  );
  const sourceIds = new Map<string, string>();
  for (const source of sources.values()) {
    const registryId = curatedId("source-registry", source.registryKey);
    const sourceId = curatedId("source-item", source.key);
    sourceIds.set(source.key, sourceId);
    await transaction.execute({
      sql: `INSERT INTO source_registry(
              id,name,source_type,allowed_use,reliability,license,attribution,
              homepage_url,fetch_method,notes,last_checked_at,
              default_source_tier,default_independence_group
            ) VALUES(?,?,?,?,?,?,?,?, 'manual',?,?,?,?)
            ON CONFLICT(id) DO UPDATE SET
              name=excluded.name,source_type=excluded.source_type,
              allowed_use=excluded.allowed_use,reliability=excluded.reliability,
              license=excluded.license,attribution=excluded.attribution,
              homepage_url=excluded.homepage_url,notes=excluded.notes,
              last_checked_at=excluded.last_checked_at,
              default_source_tier=excluded.default_source_tier,
              default_independence_group=excluded.default_independence_group,
              updated_at=datetime('now')`,
      args: [
        registryId,
        source.registryName,
        source.sourceType,
        source.allowedUse,
        source.sourceType === "official" ? "official_marketing" : "medium",
        source.license ?? null,
        source.author ?? null,
        source.homepageUrl,
        `Phase 110 curated source: ${source.registryKey}`,
        source.retrievedAt,
        source.tier,
        source.independenceGroup,
      ],
    });
    await transaction.execute({
      sql: `INSERT INTO source_items(
              id,source_id,title,url,item_type,license,author,published_at,
              retrieved_at,summary,raw_metadata_json,allowed_use,review_status,
              source_tier,independence_group,archive_url,archive_locator
            ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,'approved',?,?,?,?)
            ON CONFLICT(id) DO UPDATE SET
              source_id=excluded.source_id,title=excluded.title,url=excluded.url,
              item_type=excluded.item_type,license=excluded.license,
              author=excluded.author,published_at=excluded.published_at,
              retrieved_at=excluded.retrieved_at,summary=excluded.summary,
              raw_metadata_json=excluded.raw_metadata_json,
              allowed_use=excluded.allowed_use,review_status='approved',
              source_tier=excluded.source_tier,
              independence_group=excluded.independence_group,
              archive_url=excluded.archive_url,
              archive_locator=excluded.archive_locator,updated_at=datetime('now')`,
      args: [
        sourceId,
        registryId,
        source.title,
        source.url,
        source.itemType ?? "web_page",
        source.license ?? null,
        source.author ?? null,
        source.publishedAt ?? null,
        source.retrievedAt,
        source.summary,
        JSON.stringify({ curatedSourceKey: source.key }),
        source.allowedUse,
        source.tier,
        source.independenceGroup,
        source.archiveUrl ?? null,
        source.archiveLocator ?? null,
      ],
    });
  }
  return sourceIds;
}

async function installPack(
  transaction: Transaction,
  pack: LoadedCuratedEntityPack,
  sourceIds: Map<string, string>,
): Promise<void> {
  const sourceId = (key: string) => {
    const value = sourceIds.get(key);
    if (!value) throw new Error(`Phase 110 source mapping missing: ${key}.`);
    return value;
  };
  await deleteOwnedPayload(transaction, pack.entityId);
  const updated = await transaction.execute({
    sql: "UPDATE entities SET name=?,summary=?,body_md=?,source=?,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=?",
    args: [
      pack.canonicalName,
      pack.summary,
      pack.bodyMd,
      pack.sourceMarker,
      pack.entityId,
      pack.expectedSlug,
    ],
  });
  if (updated.rowsAffected !== 1) {
    throw new Error(`Phase 110 entity identity changed during install: ${pack.entityId}.`);
  }
  await transaction.execute({
    sql: "UPDATE entity_publications SET status='draft',published_at=NULL,depth_tier=?,updated_at=datetime('now') WHERE entity_id=?",
    args: [pack.depthTier, pack.entityId],
  });
  await transaction.execute({
    sql: "INSERT INTO stories(id,entity_id,title,story_type,summary,body_md,status,source_notes) VALUES(?,?,?,'model_story',?,?,'published',?)",
    args: [
      packId(pack, "story", "published"),
      pack.entityId,
      pack.storyTitle,
      pack.summary,
      pack.bodyMd,
      pack.sourceMarker,
    ],
  });
  for (const source of pack.sources) {
    await transaction.execute({
      sql: "INSERT INTO entity_references(id,entity_id,source_item_id,relation_type,note,review_status) VALUES(?,?,?,?,?,'approved')",
      args: [
        packId(pack, "reference", source.key),
        pack.entityId,
        sourceId(source.key),
        source.sourceType === "official" ? "official" : "reference",
        source.summary,
      ],
    });
  }
  for (const alias of pack.aliases) {
    const source = pack.sources.find((item) => item.key === alias.sourceKey);
    if (!source) throw new Error(`Phase 110 alias source missing: ${alias.sourceKey}.`);
    await transaction.execute({
      sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,source_id,alias_kind,market,source_item_id,review_status) VALUES(?,?,?,?,?,?,?,?, 'approved')",
      args: [
        packId(pack, "alias", `${alias.language}:${alias.alias}`),
        pack.entityId,
        alias.alias,
        alias.language,
        curatedId("source-registry", source.registryKey),
        alias.kind ?? "alias",
        alias.market ?? null,
        sourceId(alias.sourceKey),
      ],
    });
  }

  const variantIds = new Map<string, string>();
  for (const variant of pack.variants ?? []) {
    variantIds.set(variant.key, packId(pack, "variant", variant.key));
  }
  for (const variant of pack.variants ?? []) {
    await transaction.execute({
      sql: `INSERT INTO model_variants(
              id,model_entity_id,variant_name,release_year,notes,source_item_id,
              review_status,variant_kind,parent_variant_id,product_code,market
            ) VALUES(?,?,?,?,?,?,'approved',?,?,?,?)`,
      args: [
        variantIds.get(variant.key) ?? null,
        pack.entityId,
        variant.name,
        variant.releaseYear ?? null,
        variant.notes,
        sourceId(variant.sourceKey),
        variant.variantKind ?? "variant",
        variant.parentVariantKey
          ? (variantIds.get(variant.parentVariantKey) ?? null)
          : null,
        variant.productCode ?? null,
        variant.market ?? null,
      ],
    });
  }

  const scopeIds = new Map<string, string>();
  for (const scope of pack.scopes) {
    const id = packId(pack, "scope", scope.key);
    scopeIds.set(scope.key, id);
    await transaction.execute({
      sql: `INSERT INTO fact_scopes(
              id,entity_id,variant_id,scope_key,market,valid_from,valid_to,
              production_state,nib_scope,material_scope,edition_scope
            ) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        id,
        pack.entityId,
        scope.variantKey ? (variantIds.get(scope.variantKey) ?? null) : null,
        scope.scopeKey,
        scope.market ?? null,
        scope.validFrom ?? null,
        scope.validTo ?? null,
        scope.productionState ?? null,
        scope.nibScope ?? null,
        scope.materialScope ?? null,
        scope.editionScope ?? null,
      ],
    });
  }
  for (const claim of pack.claims) {
    const claimId = packId(pack, "claim", claim.key);
    await transaction.execute({
      sql: "INSERT INTO claims(id,subject_entity_id,predicate,object_text,source_item_id,evidence_locator,confidence,review_status,fact_class) VALUES(?,?,?,?,?,?,?,'approved',?)",
      args: [
        claimId,
        pack.entityId,
        claim.predicate,
        claim.objectText,
        sourceId(claim.sourceKey),
        claim.locator,
        claim.confidence,
        claim.factClass,
      ],
    });
    for (const evidence of claim.evidence) {
      const scopeId = scopeIds.get(evidence.scopeKey);
      if (!scopeId) throw new Error(`Phase 110 claim scope missing: ${evidence.scopeKey}.`);
      const citationId = packId(pack, "claim-citation", evidence.key);
      await transaction.execute({
        sql: "INSERT INTO citations(id,target_type,target_id,source_item_id,claim_id,note,review_status,evidence_locator,scope_id) VALUES(?,'claim',?,?,?,?, 'approved',?,?)",
        args: [
          citationId,
          claimId,
          sourceId(evidence.sourceKey),
          claimId,
          evidence.note ?? null,
          evidence.locator,
          scopeId,
        ],
      });
      await transaction.execute({
        sql: "INSERT INTO claim_evidence(id,claim_id,citation_id,scope_id,evidence_locator,review_status) VALUES(?,?,?,?,?,'approved')",
        args: [
          packId(pack, "claim-evidence", evidence.key),
          claimId,
          citationId,
          scopeId,
          evidence.locator,
        ],
      });
    }
  }

  if (!pack.spec) throw new Error(`Phase 110 model spec missing: ${pack.entityId}.`);
  const specId = packId(pack, "model-spec", "approved");
  const values = pack.spec.values;
  await transaction.execute({
    sql: `INSERT INTO model_specs(
            id,entity_id,brand_entity_id,series_name,release_year,origin_country,
            nib,fill_system,material,dimensions,weight,price_range,status,review_status
          ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,'approved')`,
    args: [
      specId,
      pack.entityId,
      pack.spec.brandEntityId,
      values.series_name ?? null,
      values.release_year ?? null,
      values.origin_country ?? null,
      values.nib ?? null,
      values.fill_system ?? null,
      values.material ?? null,
      values.dimensions ?? null,
      values.weight ?? null,
      values.price_range ?? null,
      values.status ?? null,
    ],
  });
  for (const evidence of pack.spec.evidence) {
    const scopeId = scopeIds.get(evidence.scopeKey);
    if (!scopeId) throw new Error(`Phase 110 spec scope missing: ${evidence.scopeKey}.`);
    const citationId = packId(pack, "spec-citation", evidence.key);
    await transaction.execute({
      sql: "INSERT INTO citations(id,target_type,target_id,source_item_id,note,review_status,evidence_locator,scope_id) VALUES(?,'model_spec',?,?,?,'approved',?,?)",
      args: [
        citationId,
        specId,
        sourceId(evidence.sourceKey),
        evidence.note ?? null,
        evidence.locator,
        scopeId,
      ],
    });
    await transaction.execute({
      sql: "INSERT INTO spec_field_evidence(id,model_spec_id,field_key,citation_id,scope_id,evidence_locator,review_status) VALUES(?,?,?,?,?,?,?)",
      args: [
        packId(pack, "spec-evidence", evidence.key),
        specId,
        evidence.fieldKey,
        citationId,
        scopeId,
        evidence.locator,
        evidence.qualifies === false ? "rejected" : "approved",
      ],
    });
  }
  for (const event of pack.timeline ?? []) {
    await transaction.execute({
      sql: "INSERT INTO timeline_events(id,entity_id,title,event_type,start_date,circa,description,source_item_id,review_status) VALUES(?,?,?,?,?,?,?,?,'approved')",
      args: [
        packId(pack, "timeline", event.key),
        pack.entityId,
        event.title,
        event.eventType,
        event.startDate,
        event.circa ? 1 : 0,
        event.description,
        sourceId(event.sourceKey),
      ],
    });
  }
  for (const media of pack.media) {
    await transaction.execute({
      sql: `INSERT INTO media_assets(
              id,entity_id,title,asset_type,image_url,thumbnail_url,local_path,
              author,license,attribution_text,source_url,source_item_id,
              review_status,usage_status
            ) VALUES(?,?,?,'image',?,?,?,?,?,?,?,?, 'approved',?)`,
      args: [
        packId(pack, "media", media.key),
        pack.entityId,
        media.title,
        media.imageUrl ?? null,
        media.thumbnailUrl ?? null,
        media.localPath ?? null,
        media.author,
        media.license,
        media.attributionText,
        media.sourceUrl,
        sourceId(media.sourceKey),
        media.usageStatus,
      ],
    });
  }
}

export async function applyPhase110PilotContent(
  client: Client,
  options: ApplyPhase110Options,
): Promise<ApplyPhase110Result> {
  const workspaceRoot = await assertOwnedCatalog(client, options);
  const packs = validatePacks(workspaceRoot, fs.realpathSync.native(options.ownedRoot));
  await assertIdentityPreflight(client);
  const terminalHashes = await Promise.all(
    packs.map((pack) => exactTerminalHash(client, pack)),
  );
  if (terminalHashes.every((hash): hash is string => hash !== null)) {
    return {
      entities: packs.map((pack, index) => ({
        entityId: pack.entityId,
        outcome: "noop" as const,
        contentHash: terminalHashes[index] as string,
      })),
    };
  }

  const brandHashBefore = await computePublicationContentHash(client, PHASE110_PILOT_ID);
  const brandPayloadBefore = await brandNonTopologyPayload(client);
  await createIdentitiesAndTopology(client);
  const brandHashAfter = await computePublicationContentHash(client, PHASE110_PILOT_ID);
  const brandPayloadAfter = await brandNonTopologyPayload(client);
  if (brandPayloadAfter !== brandPayloadBefore) {
    throw new Error("Phase 110 Pilot non-topology payload/source marker changed; companion replay requires replanning.");
  }
  if (brandHashAfter === brandHashBefore) {
    throw new Error("Phase 110 Pilot contract hash did not change for the exact made_by topology.");
  }
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE110_PILOT_ID,
      reviewKind,
      reviewer: options.reviewer,
      status: "approved",
      notes: "Phase 110 topology-only current-hash review; Phase 84 Pilot brand payload was not replayed.",
    });
  }
  await publishEntity(client, { entityId: PHASE110_PILOT_ID, reviewer: options.reviewer });
  const transaction = await client.transaction("write");
  try {
    const sourceIds = await upsertSources(transaction, packs);
    for (const pack of packs) await installPack(transaction, pack, sourceIds);
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }

  const entities: ApplyPhase110Result["entities"] = [];
  for (const pack of packs) {
    for (const reviewKind of ["fact", "language", "media"] as const) {
      await recordEntityContentReview(client, {
        entityId: pack.entityId,
        reviewKind,
        reviewer: options.reviewer,
        status: "approved",
        notes: `${pack.sourceMarker}; ${reviewKind} review of checked-in Phase 110 sourced copy.`,
      });
    }
    const published = await publishEntity(client, {
      entityId: pack.entityId,
      reviewer: options.reviewer,
    });
    entities.push({
      entityId: pack.entityId,
      outcome: "published",
      contentHash: published.contentHash,
    });
  }
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities };
}

function requiredArg(name: string): string {
  const index = process.argv.indexOf(name);
  const value = index === -1 ? null : process.argv[index + 1];
  if (!value?.trim()) throw new Error(`Phase 110 requires ${name}.`);
  return value;
}

async function main(): Promise<void> {
  const databasePath = requiredArg("--database");
  const ownedRoot = requiredArg("--owned-root");
  const protectedCatalogPath = requiredArg("--protected-catalog");
  const reviewer = process.argv.includes("--reviewer")
    ? requiredArg("--reviewer")
    : "phase110-content-review";
  const client = createClient({ url: `file:${databasePath}` });
  try {
    const result = await applyPhase110PilotContent(client, {
      databasePath,
      ownedRoot,
      protectedCatalogPath,
      protectedCatalogSnapshot: snapshotCatalogFiles(protectedCatalogPath),
      workspaceRoot: "/Users/xz/CodeBuddy/fountain-pen-graph",
      reviewer,
      env: process.env,
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
