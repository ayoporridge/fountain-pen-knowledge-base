import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
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
import type { ApplyPhase22Options, ApplyPhase22Result } from "./apply-phase22-content";
import {
  loadPhase122PlatinumPresidentPack,
  PHASE122_BRAND_URL,
  PHASE122_CATALOG_URL,
  PHASE122_CURRENT_VARIANTS,
  PHASE122_CURIDAS_ID,
  PHASE122_LEGACY_ALIASES,
  PHASE122_LENSKY_URL,
  PHASE122_PENHERO_URL,
  PHASE122_PLATINUM_3776_ID,
  PHASE122_PLATINUM_BRAND_ID,
  PHASE122_PROCYON_ID,
  PHASE122_PRODUCT_URL,
  PHASE122_RAW_NAME,
  PHASE122_RAW_SLUG,
  PHASE122_PRESIDENT_ID,
  PHASE122_PRESIDENT_NAME,
  PHASE122_PRESIDENT_SLUG,
  phase122PlatinumPresidentPack,
} from "./data/phase122-platinum-president-ptb-20000p";
import {
  curatedId,
  packId,
  type CuratedSource,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export {
  PHASE122_CURIDAS_ID,
  PHASE122_PLATINUM_3776_ID,
  PHASE122_PLATINUM_BRAND_ID,
  PHASE122_PRESIDENT_ID,
  PHASE122_PRESIDENT_SLUG,
};

export type ApplyPhase122Options = ApplyPhase22Options;
export type ApplyPhase122Result = ApplyPhase22Result;

const ALLOWED_REPO_INPUTS = new Set([
  "/Users/xz/CodeBuddy/fountain-pen-graph",
  "/Users/xz/Documents/fountain-pen-graph",
]);
const CANONICAL_REPO = "/Users/xz/Documents/fountain-pen-graph";

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 122 refuses inherited remote database selection: ${key}.`);
  }
}

function assertVerifiedRepoPair(input: string): string {
  if (!ALLOWED_REPO_INPUTS.has(input)) {
    throw new Error("Phase 122 requires the verified CodeBuddy/Documents repo pair.");
  }
  const real = fs.realpathSync.native(input);
  let gitRoot: string;
  try {
    gitRoot = fs.realpathSync.native(
      execFileSync("git", ["-C", input, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim(),
    );
  } catch {
    throw new Error("Phase 122 could not resolve the verified CodeBuddy/Documents repo pair.");
  }
  if (real !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO) {
    throw new Error("Phase 122 verified CodeBuddy/Documents repo pair must resolve to one canonical git root.");
  }
  return real;
}

async function assertAuthority(client: Client, options: ApplyPhase122Options): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 122 reviewer must not be empty.");
  const workspaceRoot = assertVerifiedRepoPair(options.workspaceRoot);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);

  if (fs.lstatSync(options.databasePath).isSymbolicLink()) {
    throw new Error("Phase 122 caller-owned database must not be a symlink.");
  }
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || !isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 122 requires a regular database inside the caller-owned root.");
  }
  const protectedNames = new Set([protectedPath, `${protectedPath}-wal`, `${protectedPath}-shm`]);
  if (protectedNames.has(databasePath)) throw new Error("Phase 122 refuses the protected catalog or sidecar path.");
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (Number(owned.nlink) !== 1) {
    throw new Error("Phase 122 caller-owned database must not have hard-link aliases.");
  }
  if (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino) {
    throw new Error("Phase 122 refuses a hard-link alias of the protected catalog.");
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 122 client/path mismatch for caller-owned database.");
  }
  let migration;
  try {
    migration = await client.execute({
      sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
      args: ["032_taxonomy_identity.sql"],
    });
  } catch {
    throw new Error("Phase 122 owned copy must be migrated through 032.");
  }
  if (migration.rows.length !== 1) throw new Error("Phase 122 owned copy must be migrated through 032.");
  return workspaceRoot;
}

async function jsonRows(client: Client, sql: string, args: unknown[]): Promise<Array<Record<string, unknown>>> {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}

async function payloadDigest(client: Client, entityId: string, includeTopology: boolean): Promise<string> {
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
    ...(includeTopology
      ? [
          "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
          "SELECT * FROM entity_publications WHERE entity_id=? ORDER BY entity_id",
          "SELECT * FROM entity_content_reviews WHERE entity_id=? ORDER BY review_kind,content_hash",
        ]
      : []),
  ];
  const payload = [];
  for (const sql of queries) {
    payload.push(await jsonRows(client, sql, sql.includes(" OR ") ? [entityId, entityId] : [entityId]));
  }
  return JSON.stringify(payload);
}

async function assertBaseline(client: Client): Promise<void> {
  const baseline = await client.execute({
    sql: `SELECT entity.id,entity.type,entity.slug,entity.source,publication.status,
                 CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
          FROM entities entity
          JOIN entity_publications publication ON publication.entity_id=entity.id
          LEFT JOIN public_entities public ON public.id=entity.id
          WHERE entity.id IN (?,?,?,?) ORDER BY entity.id`,
    args: [
      PHASE122_PLATINUM_BRAND_ID,
      PHASE122_PLATINUM_3776_ID,
      PHASE122_CURIDAS_ID,
      PHASE122_PROCYON_ID,
    ],
  });
  if (baseline.rows.length !== 4) {
    throw new Error("Phase 122 requires exact Phase 42/78/121 Platinum prerequisites.");
  }
  const byId = new Map(baseline.rows.map((row) => [String(row.id), row]));
  const brand = byId.get(PHASE122_PLATINUM_BRAND_ID);
  const century = byId.get(PHASE122_PLATINUM_3776_ID);
  const curidas = byId.get(PHASE122_CURIDAS_ID);
  const procyon = byId.get(PHASE122_PROCYON_ID);
  if (
    !brand ||
    brand.type !== "brand" ||
    brand.slug !== "platinum" ||
    brand.status !== "published" ||
    Number(brand.is_public) !== 1 ||
    !String(brand.source).startsWith("curated-content:phase78-platinum-brand-v1:")
  ) {
    throw new Error("Phase 122 requires the exact published Phase 42 Platinum brand baseline.");
  }
  if (
    !century ||
    century.type !== "pen" ||
    century.slug !== "platinum-3776-century" ||
    century.status !== "published" ||
    Number(century.is_public) !== 1
  ) {
    throw new Error("Phase 122 requires the exact published Phase 42 #3776 Century baseline.");
  }
  if (
    !curidas ||
    curidas.type !== "pen" ||
    curidas.slug !== "platinum-curidas" ||
    curidas.status !== "published" ||
    Number(curidas.is_public) !== 1 ||
    !String(curidas.source).startsWith("curated-content:phase78-platinum-curidas-v1:")
  ) {
    throw new Error("Phase 122 requires the exact published Phase 78 Curidas baseline.");
  }
  if (!procyon || procyon.type !== "pen" || procyon.slug !== "platinum-procyon-pns-5000" || procyon.status !== "published" || Number(procyon.is_public) !== 1 || !String(procyon.source).startsWith("curated-content:phase121-platinum-procyon-pns-5000-v1:")) {
    throw new Error("Phase 122 requires the exact published Phase 121 Procyon baseline.");
  }
}

async function inspectTarget(
  client: Client,
  sourceMarker: string,
): Promise<"raw" | "terminal"> {
  const repoFiles = [
    [".planning/content-research", /president|ptb-20000p/i, "platinum-president-ptb-20000p-phase122.md"],
    ["scripts/data", /president|ptb-20000p/i, "phase122-platinum-president-ptb-20000p.ts"],
    ["scripts", /apply-.*(?:president|ptb-20000p)/i, "apply-phase122-platinum-president-ptb-20000p-content.ts"],
    ["tests/content", /president|ptb-20000p/i, "phase122-platinum-president-ptb-20000p.test.ts"],
  ] as const;
  for (const [directory, pattern, allowed] of repoFiles) {
    const alternates = fs
      .readdirSync(path.join(CANONICAL_REPO, directory))
      .filter((name) => pattern.test(name) && name !== allowed);
    if (alternates.length) {
      throw new Error(`Phase 122 found alternate President repo pack files: ${alternates.join(", ")}`);
    }
  }

  const urls = [PHASE122_PRODUCT_URL, PHASE122_BRAND_URL, PHASE122_CATALOG_URL, PHASE122_PENHERO_URL, PHASE122_LENSKY_URL];
  const placeholders = urls.map(() => "?").join(",");
  const collisions = await client.execute({
    sql: `SELECT DISTINCT entity.id,entity.type,entity.slug,entity.name,entity.source
          FROM entities entity
          LEFT JOIN entity_aliases alias ON alias.entity_id=entity.id
          LEFT JOIN entity_references reference ON reference.entity_id=entity.id
          LEFT JOIN source_items item ON item.id=reference.source_item_id
          WHERE entity.id=? OR entity.slug=?
             OR lower(entity.name) IN (
               lower('Platinum President PTB-20000P'),lower('Platinum President'),
               lower('PRESIDENT'),lower('PTB-20000P')
             )
             OR lower(COALESCE(alias.alias,'')) IN (
               lower('Platinum President PTB-20000P'),lower('Platinum President'),
               lower('PRESIDENT'),lower('PTB-20000P')
             )
             OR entity.source_url IN (${placeholders})
             OR (item.url IN (${placeholders}) AND entity.type='pen')
             OR entity.source LIKE 'curated-content:phase122-platinum-president-ptb-20000p-v1:%'
          ORDER BY entity.id`,
    args: [
      PHASE122_PRESIDENT_ID,
      PHASE122_PRESIDENT_SLUG,
      ...urls,
      ...urls,
    ],
  });
  const sourceKeys = phase122PlatinumPresidentPack.sources.map((source) => source.key);
  const sourceItems = await client.execute({
    sql: `SELECT id,url FROM source_items WHERE id IN (${sourceKeys.map(() => "?").join(",")}) ORDER BY id`,
    args: sourceKeys.map(sourceItemId),
  });

  const relevantCollisions = collisions.rows.filter((item) => ![PHASE122_PLATINUM_BRAND_ID, PHASE122_PLATINUM_3776_ID, PHASE122_CURIDAS_ID, PHASE122_PROCYON_ID].includes(String(item.id)));
  if (relevantCollisions.length !== 1) {
    throw new Error(`Phase 122 found an alternate President identity or source owner before first write: ${JSON.stringify(relevantCollisions)}`);
  }
  const row = relevantCollisions[0];
  if (row?.id !== PHASE122_PRESIDENT_ID || row.type !== "pen") throw new Error("Phase 122 found an alternate President identity or source owner before first write.");
  if (row.slug === PHASE122_RAW_SLUG && row.name === PHASE122_RAW_NAME && row.source == null) {
    if (sourceItems.rows.length) throw new Error("Phase 122 source marker exists in raw state; repair is forbidden.");
    const raw = await client.execute({ sql: `SELECT entity.summary,entity.body_md,publication.status,publication.approved_content_hash,
      (SELECT count(*) FROM public_entities WHERE id=entity.id) AS is_public,
      (SELECT group_concat(id||':'||alias||':'||language,'|') FROM (SELECT id,alias,language FROM entity_aliases WHERE entity_id=entity.id ORDER BY id)) AS aliases,
      (SELECT group_concat(id||':'||source_id||':'||target_id||':'||link_type||':'||COALESCE(reason,''),'|') FROM (SELECT * FROM entity_links WHERE source_id=entity.id OR target_id=entity.id ORDER BY id)) AS links,
      (SELECT group_concat(id,'|') FROM (SELECT id FROM stories WHERE entity_id=entity.id ORDER BY id)) AS stories,
      (SELECT group_concat(id,'|') FROM (SELECT id FROM model_specs WHERE entity_id=entity.id ORDER BY id)) AS specs,
      (SELECT group_concat(id,'|') FROM (SELECT id FROM claims WHERE subject_entity_id=entity.id ORDER BY id)) AS claims,
      (SELECT group_concat(id,'|') FROM (SELECT id FROM entity_references WHERE entity_id=entity.id ORDER BY id)) AS refs,
      (SELECT group_concat(id,'|') FROM (SELECT id FROM media_assets WHERE entity_id=entity.id ORDER BY id)) AS media
      FROM entities entity JOIN entity_publications publication ON publication.entity_id=entity.id WHERE entity.id=?`, args: [PHASE122_PRESIDENT_ID] });
    const exact = raw.rows[0];
    const expectedAliases = "alias-a1t4DNomp4Ge-en-Platinum President:Platinum President:en|alias-a1t4DNomp4Ge-zh-白金 总统 President:白金 总统 President:zh";
    const expectedLinks = "CQFuH9Ba8VV6:a1t4DNomp4Ge:e51tJpejEkXY:made_by:|rev-CQFuH9Ba8VV6:e51tJpejEkXY:a1t4DNomp4Ge:reverse:";
    if (!exact || Array.from(String(exact.summary)).length !== 92 || Array.from(String(exact.body_md)).length !== 173 || exact.status !== "draft" || exact.approved_content_hash != null || Number(exact.is_public) !== 0 || exact.aliases !== expectedAliases || exact.links !== expectedLinks || exact.stories !== "story-model-platinum-president-research" || exact.specs !== "spec-platinum-president-research" || exact.claims !== "claim-platinum-president-source-boundary" || exact.refs !== "eref-commerce-64393125ae94f6|reference-model-gap-a1t4DNomp4Ge-source-platinum-president-public-search" || exact.media !== "media-commerce-8aa686ad649399") {
      throw new Error("Phase 122 raw payload/topology inventory is alternate; automatic repair is forbidden.");
    }
    const redirect = await client.execute({ sql: "SELECT * FROM entity_redirects WHERE source_path IN (?,?)", args: [`/pen/${PHASE122_RAW_SLUG}`, `/pen/${PHASE122_PRESIDENT_SLUG}`] });
    if (redirect.rows.length) throw new Error("Phase 122 raw route already has a redirect; repair is forbidden.");
    return "raw";
  }
  if (row.slug !== PHASE122_PRESIDENT_SLUG || row.name !== PHASE122_PRESIDENT_NAME || row.source !== sourceMarker) throw new Error("Phase 122 locked target is partial or alternate; automatic repair is forbidden.");
  const expectedSourcePairs = phase122PlatinumPresidentPack.sources
    .map((source) => `${sourceItemId(source.key)}:${source.url}`)
    .sort();
  const actualSourcePairs = sourceItems.rows
    .map((item) => `${String(item.id)}:${String(item.url)}`)
    .sort();
  if (JSON.stringify(actualSourcePairs) !== JSON.stringify(expectedSourcePairs)) {
    throw new Error("Phase 122 terminal source ownership is incomplete or tampered; repair is forbidden.");
  }
  return "terminal";
}

function sourceReliability(source: CuratedSource): string {
  if (source.sourceType === "official") return "official_marketing";
  if (source.tier === "professional_secondary") return "high_for_model_history";
  return "medium";
}

function sourceItemId(sourceKey: string): string {
  return curatedId("source-item", sourceKey);
}

async function upsertPhase122Sources(
  transaction: Transaction,
  pack: LoadedCuratedEntityPack,
): Promise<void> {
  for (const source of pack.sources) {
    await transaction.execute({
      sql: `INSERT INTO source_registry (
              id,name,source_type,allowed_use,reliability,license,attribution,
              homepage_url,fetch_method,notes,last_checked_at,
              default_source_tier,default_independence_group
            ) VALUES (?,?,?,?,?,?,?,?,'manual',?,?,?,?)
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
        curatedId("source-registry", source.registryKey),
        source.registryName,
        source.sourceType,
        source.allowedUse,
        sourceReliability(source),
        source.license ?? null,
        source.author ?? null,
        source.homepageUrl,
        `Phase 122 curated source registry: ${source.registryKey}`,
        source.retrievedAt,
        source.tier,
        source.independenceGroup,
      ],
    });
    await transaction.execute({
      sql: `INSERT INTO source_items (
              id,source_id,title,url,item_type,license,author,published_at,
              retrieved_at,summary,raw_metadata_json,allowed_use,review_status,
              source_tier,independence_group,archive_url,archive_locator
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'approved',?,?,?,?)
            ON CONFLICT(id) DO UPDATE SET
              source_id=excluded.source_id,title=excluded.title,url=excluded.url,
              item_type=excluded.item_type,license=excluded.license,
              author=excluded.author,published_at=excluded.published_at,
              retrieved_at=excluded.retrieved_at,summary=excluded.summary,
              raw_metadata_json=excluded.raw_metadata_json,
              allowed_use=excluded.allowed_use,review_status=excluded.review_status,
              source_tier=excluded.source_tier,
              independence_group=excluded.independence_group,
              archive_url=excluded.archive_url,archive_locator=excluded.archive_locator,
              updated_at=datetime('now')`,
      args: [
        sourceItemId(source.key),
        curatedId("source-registry", source.registryKey),
        source.title,
        source.url,
        source.itemType ?? "web_page",
        source.license ?? null,
        source.author ?? null,
        source.publishedAt ?? null,
        source.retrievedAt,
        source.summary,
        JSON.stringify({ curatedSourceKey: source.key, archiveLocator: source.archiveLocator }),
        source.allowedUse,
        source.tier,
        source.independenceGroup,
        source.archiveUrl ?? null,
        source.archiveLocator ?? null,
      ],
    });
  }
}

async function installPhase122Pack(
  client: Client,
  pack: LoadedCuratedEntityPack,
): Promise<void> {
  const transaction = await client.transaction("write");
  try {
      await upsertPhase122Sources(transaction, pack);
    const updated = await transaction.execute({
      sql: `UPDATE entities SET name=?,summary=?,body_md=?,source=?,updated_at=datetime('now')
            WHERE id=? AND type='pen' AND slug=?`,
      args: [
        pack.canonicalName,
        pack.summary,
        pack.bodyMd,
        pack.sourceMarker,
        pack.entityId,
        pack.expectedSlug,
      ],
    });
    if (updated.rowsAffected !== 1) throw new Error("Phase 122 target identity changed before payload install.");
    const publication = await transaction.execute({
      sql: "UPDATE entity_publications SET depth_tier=?,updated_at=datetime('now') WHERE entity_id=?",
      args: [pack.depthTier, pack.entityId],
    });
    if (publication.rowsAffected !== 1) throw new Error("Phase 122 target publication row is missing.");

    const storyId = packId(pack, "story", "published");
    await transaction.execute({
      sql: `INSERT INTO stories(id,entity_id,title,story_type,summary,body_md,status,source_notes)
            VALUES(?,?,?,'model_story',?,?,'published',?)`,
      args: [storyId, pack.entityId, pack.storyTitle, pack.summary, pack.bodyMd, pack.sourceMarker],
    });
    for (const source of pack.sources) {
      const relationType =
        source.sourceType === "official"
          ? "official"
          : source.tier === "professional_secondary"
            ? "review"
            : "reference";
      await transaction.execute({
        sql: `INSERT INTO entity_references(id,entity_id,source_item_id,relation_type,note,review_status)
              VALUES(?,?,?,?,?,'approved')`,
        args: [
          packId(pack, "reference", source.key),
          pack.entityId,
          sourceItemId(source.key),
          relationType,
          source.summary,
        ],
      });
    }
    for (const alias of pack.aliases) {
      const source = pack.sources.find((item) => item.key === alias.sourceKey);
      if (!source) throw new Error(`Phase 122 alias source missing: ${alias.sourceKey}`);
      await transaction.execute({
        sql: `INSERT INTO entity_aliases(
                id,entity_id,alias,language,source_id,alias_kind,market,
                source_item_id,review_status
              ) VALUES(?,?,?,?,?,?,?,?,'approved')`,
        args: [
          packId(pack, "alias", `${alias.language}:${alias.alias}`),
          pack.entityId,
          alias.alias,
          alias.language,
          curatedId("source-registry", source.registryKey),
          alias.kind ?? "alias",
          alias.market ?? null,
          sourceItemId(alias.sourceKey),
        ],
      });
    }

    const variantIds = new Map<string, string>();
    for (const variant of pack.variants ?? []) {
      const variantId = packId(pack, "variant", variant.key);
      variantIds.set(variant.key, variantId);
      await transaction.execute({
        sql: `INSERT INTO model_variants(
                id,model_entity_id,variant_name,release_year,notes,source_item_id,
                review_status,variant_kind,parent_variant_id,product_code,market
              ) VALUES(?,?,?,?,?,?,'approved',?,?,?,?)`,
        args: [
          variantId,
          pack.entityId,
          variant.name,
          variant.releaseYear ?? null,
          variant.notes,
          sourceItemId(variant.sourceKey),
          variant.variantKind ?? "variant",
          variant.parentVariantKey ? variantIds.get(variant.parentVariantKey) ?? null : null,
          variant.productCode ?? null,
          variant.market ?? null,
        ],
      });
    }

    const scopeIds = new Map<string, string>();
    for (const scope of pack.scopes) {
      const scopeId = packId(pack, "scope", scope.key);
      scopeIds.set(scope.scopeKey, scopeId);
      await transaction.execute({
        sql: `INSERT INTO fact_scopes(
                id,entity_id,variant_id,scope_key,market,valid_from,valid_to,
                production_state,nib_scope,material_scope,edition_scope
              ) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
        args: [
          scopeId,
          pack.entityId,
          scope.variantKey ? variantIds.get(scope.variantKey) ?? null : null,
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
        sql: `INSERT INTO claims(
                id,subject_entity_id,predicate,object_text,source_item_id,
                evidence_locator,confidence,review_status,fact_class
              ) VALUES(?,?,?,?,?,?,?,'approved',?)`,
        args: [
          claimId,
          pack.entityId,
          claim.predicate,
          claim.objectText,
          sourceItemId(claim.sourceKey),
          claim.locator,
          claim.confidence,
          claim.factClass,
        ],
      });
      for (const item of claim.evidence) {
        const scopeId = scopeIds.get(item.scopeKey);
        if (!scopeId) throw new Error(`Phase 122 claim scope missing: ${item.scopeKey}`);
        const citationId = packId(pack, "claim-citation", item.key);
        await transaction.execute({
          sql: `INSERT INTO citations(
                  id,target_type,target_id,source_item_id,claim_id,note,
                  review_status,evidence_locator,scope_id
                ) VALUES(?,'claim',?,?,?,?,'approved',?,?)`,
          args: [
            citationId,
            claimId,
            sourceItemId(item.sourceKey),
            claimId,
            item.note ?? null,
            item.locator,
            scopeId,
          ],
        });
        await transaction.execute({
          sql: `INSERT INTO claim_evidence(
                  id,claim_id,citation_id,scope_id,evidence_locator,review_status
                ) VALUES(?,?,?,?,?,'approved')`,
          args: [
            packId(pack, "claim-evidence", item.key),
            claimId,
            citationId,
            scopeId,
            item.locator,
          ],
        });
      }
    }

    const specCitationIds = new Map<string, string>();
    if (!pack.spec) throw new Error("Phase 122 target pack requires model specs.");
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
    for (const item of pack.spec.evidence) {
      const scopeId = scopeIds.get(item.scopeKey);
      if (!scopeId) throw new Error(`Phase 122 spec scope missing: ${item.scopeKey}`);
      const citationId = packId(pack, "spec-citation", item.key);
      specCitationIds.set(item.key, citationId);
      await transaction.execute({
        sql: `INSERT INTO citations(
                id,target_type,target_id,source_item_id,note,review_status,
                evidence_locator,scope_id
              ) VALUES(?,'model_spec',?,?,?,'approved',?,?)`,
        args: [
          citationId,
          specId,
          sourceItemId(item.sourceKey),
          item.note ?? null,
          item.locator,
          scopeId,
        ],
      });
      await transaction.execute({
        sql: `INSERT INTO spec_field_evidence(
                id,model_spec_id,field_key,citation_id,scope_id,
                evidence_locator,review_status
              ) VALUES(?,?,?,?,?,?,?)`,
        args: [
          packId(pack, "spec-evidence", item.key),
          specId,
          item.fieldKey,
          citationId,
          scopeId,
          item.locator,
          item.qualifies === false ? "rejected" : "approved",
        ],
      });
    }

    for (const conflict of pack.conflicts ?? []) {
      const conflictId = packId(pack, "conflict", conflict.key);
      await transaction.execute({
        sql: `INSERT INTO fact_conflicts(
                id,entity_id,field_key,scope_id,conflict_kind,status,resolution_note
              ) VALUES(?,?,?,?,?,?,?)`,
        args: [
          conflictId,
          pack.entityId,
          conflict.fieldKey,
          scopeIds.get(conflict.scopeKey) ?? null,
          conflict.conflictKind,
          conflict.status,
          conflict.resolutionNote,
        ],
      });
      for (const member of conflict.members) {
        const citationId = specCitationIds.get(member.citationKey);
        if (!citationId) throw new Error(`Phase 122 conflict citation missing: ${member.citationKey}`);
        await transaction.execute({
          sql: "INSERT INTO fact_conflict_members(id,conflict_id,citation_id,asserted_value) VALUES(?,?,?,?)",
          args: [
            packId(pack, "conflict-member", `${conflict.key}:${member.citationKey}`),
            conflictId,
            citationId,
            member.assertedValue,
          ],
        });
      }
    }

    for (const event of pack.timeline ?? []) {
      await transaction.execute({
        sql: `INSERT INTO timeline_events(
                id,entity_id,title,event_type,start_date,circa,description,
                source_item_id,review_status
              ) VALUES(?,?,?,?,?,?,?,?,'approved')`,
        args: [
          packId(pack, "timeline", event.key),
          pack.entityId,
          event.title,
          event.eventType,
          event.startDate,
          event.circa ? 1 : 0,
          event.description,
          sourceItemId(event.sourceKey),
        ],
      });
    }
    for (const media of pack.media) {
      await transaction.execute({
        sql: `INSERT INTO media_assets(
                id,entity_id,title,asset_type,image_url,thumbnail_url,local_path,
                author,license,attribution_text,source_url,source_item_id,
                review_status,usage_status
              ) VALUES(?,?,?,'image',?,?,?,?,?,?,?,?,'approved',?)`,
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
          sourceItemId(media.sourceKey),
          media.usageStatus,
        ],
      });
    }
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

async function assertTerminal(
  client: Client,
  sourceMarker: string,
): Promise<string> {
  const target = await client.execute({
    sql: `SELECT entity.id,entity.type,entity.slug,entity.name,entity.source,publication.status,
                 publication.approved_content_hash,readiness.blocker_count,
                 readiness.publishable,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
          FROM entities entity
          JOIN entity_publications publication ON publication.entity_id=entity.id
          LEFT JOIN public_entity_readiness readiness
            ON readiness.entity_id=entity.id AND readiness.contract_version=3
          LEFT JOIN public_entities public ON public.id=entity.id
          WHERE entity.id=?`,
    args: [PHASE122_PRESIDENT_ID],
  });
  const row = target.rows[0];
  const currentHash = await computePublicationContentHash(client, PHASE122_PRESIDENT_ID);
  if (
    !row ||
    row.type !== "pen" ||
    row.slug !== PHASE122_PRESIDENT_SLUG ||
    row.name !== PHASE122_PRESIDENT_NAME ||
    row.source !== sourceMarker ||
    row.status !== "published" ||
    row.approved_content_hash !== currentHash ||
    Number(row.blocker_count) !== 0 ||
    Number(row.publishable) !== 1 ||
    Number(row.is_public) !== 1
  ) {
    throw new Error("Phase 122 terminal identity/source/publication state is invalid; automatic repair is forbidden.");
  }
  const topology = await client.execute({
    sql: "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY id",
    args: [PHASE122_PRESIDENT_ID, PHASE122_PRESIDENT_ID],
  });
  if (
    topology.rows.length !== 2 ||
    topology.rows[0]?.id !== "CQFuH9Ba8VV6" || topology.rows[0]?.source_id !== PHASE122_PRESIDENT_ID || topology.rows[0]?.target_id !== PHASE122_PLATINUM_BRAND_ID || topology.rows[0]?.link_type !== "made_by" || topology.rows[0]?.reason != null ||
    topology.rows[1]?.id !== "rev-CQFuH9Ba8VV6" || topology.rows[1]?.source_id !== PHASE122_PLATINUM_BRAND_ID || topology.rows[1]?.target_id !== PHASE122_PRESIDENT_ID || topology.rows[1]?.link_type !== "reverse" || topology.rows[1]?.reason != null
  ) {
    throw new Error("Phase 122 terminal made_by/reverse topology is invalid; automatic repair is forbidden.");
  }
  const counts = (await client.execute({
    sql: `SELECT
      (SELECT count(*) FROM fact_scopes WHERE entity_id=?) AS scopes,
      (SELECT count(*) FROM claims WHERE subject_entity_id=?) AS claims,
      (SELECT count(*) FROM model_variants WHERE model_entity_id=?) AS variants,
      (SELECT count(*) FROM fact_scopes WHERE entity_id=? AND scope_key LIKE '%brand-document%') AS brand_scopes,
      (SELECT count(*) FROM fact_scopes WHERE entity_id=? AND scope_key LIKE '%adjusted-red-wine-sample%') AS sample_scopes,
      (SELECT count(*) FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='rejected') AS rejected,
      (SELECT count(*) FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved') AS media,
      (SELECT count(*) FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media','publication')) AS reviews`,
    args: [
      PHASE122_PRESIDENT_ID,PHASE122_PRESIDENT_ID,PHASE122_PRESIDENT_ID,
      PHASE122_PRESIDENT_ID,PHASE122_PRESIDENT_ID,PHASE122_PRESIDENT_ID,
      PHASE122_PRESIDENT_ID,PHASE122_PRESIDENT_ID,currentHash,
    ],
  })).rows[0];
  if (
    Number(counts?.scopes) !== 5 ||
    Number(counts?.claims) !== 6 ||
    Number(counts?.variants) !== PHASE122_CURRENT_VARIANTS.length ||
    Number(counts?.brand_scopes) !== 1 ||
    Number(counts?.sample_scopes) !== 1 ||
    Number(counts?.rejected) < 12 ||
    Number(counts?.media) !== 1 ||
    Number(counts?.reviews) !== 4
  ) {
    throw new Error("Phase 122 terminal scope/evidence/media/review state is invalid; automatic repair is forbidden.");
  }
  const aliases = await client.execute({ sql: "SELECT id,alias,language FROM entity_aliases WHERE entity_id=? ORDER BY alias", args: [PHASE122_PRESIDENT_ID] });
  if (JSON.stringify(aliases.rows.map((item) => [String(item.alias), String(item.language)])) !== JSON.stringify([["Platinum President", "en"], [PHASE122_RAW_NAME, "zh"], ["白金 总统 President", "zh"]])) throw new Error("Phase 122 terminal aliases are invalid; automatic repair is forbidden.");
  const redirect = await client.execute({ sql: "SELECT target_path,redirect_kind FROM entity_redirects WHERE source_path=?", args: [`/pen/${PHASE122_RAW_SLUG}`] });
  if (redirect.rows.length !== 1 || redirect.rows[0]?.target_path !== `/pen/${PHASE122_PRESIDENT_SLUG}` || redirect.rows[0]?.redirect_kind !== "permanent") throw new Error("Phase 122 terminal redirect is invalid; automatic repair is forbidden.");
  const variants = await client.execute({
    sql: "SELECT variant_name FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
    args: [PHASE122_PRESIDENT_ID],
  });
  if (
    JSON.stringify(variants.rows.map((item) => String(item.variant_name))) !==
    JSON.stringify([...PHASE122_CURRENT_VARIANTS].sort())
  ) {
    throw new Error("Phase 122 terminal current variant set is invalid; automatic repair is forbidden.");
  }
  return currentHash;
}

export async function applyPhase122PlatinumPresidentContent(
  client: Client,
  options: ApplyPhase122Options,
): Promise<ApplyPhase122Result> {
  const workspaceRoot = await assertAuthority(client, options);
  const pack = loadPhase122PlatinumPresidentPack(workspaceRoot);
  await assertBaseline(client);
  const targetState = await inspectTarget(client, pack.sourceMarker);
  if (targetState === "terminal") {
    const contentHash = await assertTerminal(client, pack.sourceMarker);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return { entities: [{ entityId: PHASE122_PRESIDENT_ID, outcome: "noop", contentHash }] };
  }

  const protectedBefore = new Map<string, string>();
  for (const id of [PHASE122_PLATINUM_BRAND_ID, PHASE122_PLATINUM_3776_ID, PHASE122_CURIDAS_ID, PHASE122_PROCYON_ID]) protectedBefore.set(id, await payloadDigest(client, id, true));
  const relationshipBefore = await jsonRows(client, "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id", [PHASE122_PRESIDENT_ID, PHASE122_PRESIDENT_ID]);

  const transaction = await client.transaction("write");
  try {
    const collision = await transaction.execute({ sql: "SELECT id FROM entities WHERE slug=? AND id<>?", args: [PHASE122_PRESIDENT_SLUG, PHASE122_PRESIDENT_ID] });
    if (collision.rows.length) throw new Error("Phase 122 canonical slug is occupied.");
    const batchId = stableId("phase122-president-batch", "phase122-president-identity-v1");
    const actionId = stableId("phase122-president-action", PHASE122_PRESIDENT_ID);
    await transaction.execute({ sql: "INSERT INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)", args: [batchId, "phase122-president-identity-v1", createHash("sha256").update("phase122-president-identity-v1").digest("hex"), "Same-ID canonical President PTB-20000P reclassification."] });
    await transaction.execute({ sql: "INSERT INTO taxonomy_actions(id,batch_id,source_row_key,action_kind,action_checksum,source_entity_id,target_entity_id,status,note) VALUES(?,?,?,'rename',?,?,?,'applied',?)", args: [actionId, batchId, PHASE122_RAW_SLUG, createHash("sha256").update(`${PHASE122_PRESIDENT_ID}:${PHASE122_RAW_SLUG}:${PHASE122_PRESIDENT_SLUG}`).digest("hex"), PHASE122_PRESIDENT_ID, PHASE122_PRESIDENT_ID, "Preserve stable ID and maker topology while canonicalizing identity."] });
    await transaction.execute({ sql: "UPDATE entities SET slug=?,name=?,updated_at=datetime('now') WHERE id=? AND slug=? AND name=?", args: [PHASE122_PRESIDENT_SLUG, PHASE122_PRESIDENT_NAME, PHASE122_PRESIDENT_ID, PHASE122_RAW_SLUG, PHASE122_RAW_NAME] });
    // Migration 032 forbids self-lineage rows; the same-ID rename is represented by
    // the taxonomy action itself plus the permanent route redirect.
    await transaction.execute({ sql: "INSERT INTO entity_redirects(id,batch_id,action_id,source_path,target_path,redirect_kind,fallback_reason) VALUES(?,?,?,?,?,'permanent','canonical_slug_rename')", args: [stableId("phase122-president-redirect", PHASE122_RAW_SLUG), batchId, actionId, `/pen/${PHASE122_RAW_SLUG}`, `/pen/${PHASE122_PRESIDENT_SLUG}`] });
    await transaction.execute({ sql: "DELETE FROM claim_evidence WHERE claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?)", args: [PHASE122_PRESIDENT_ID] });
    await transaction.execute({ sql: "DELETE FROM citations WHERE claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?) OR (target_type='model_spec' AND target_id IN (SELECT id FROM model_specs WHERE entity_id=?))", args: [PHASE122_PRESIDENT_ID, PHASE122_PRESIDENT_ID] });
    await transaction.execute({ sql: "DELETE FROM spec_field_evidence WHERE model_spec_id IN (SELECT id FROM model_specs WHERE entity_id=?)", args: [PHASE122_PRESIDENT_ID] });
    for (const [table, column] of [["entity_references", "entity_id"], ["stories", "entity_id"], ["claims", "subject_entity_id"], ["fact_scopes", "entity_id"], ["model_variants", "model_entity_id"], ["model_specs", "entity_id"], ["timeline_events", "entity_id"], ["media_assets", "entity_id"]] as const) await transaction.execute({ sql: `DELETE FROM ${table} WHERE ${column}=?`, args: [PHASE122_PRESIDENT_ID] });
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }

  const relationshipAfterIdentity = await jsonRows(client, "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id", [PHASE122_PRESIDENT_ID, PHASE122_PRESIDENT_ID]);
  if (JSON.stringify(relationshipAfterIdentity) !== JSON.stringify(relationshipBefore)) throw new Error("Phase 122 changed the locked made_by/reverse rows.");
  for (const [id, digest] of protectedBefore) if (await payloadDigest(client, id, true) !== digest) throw new Error(`Phase 122 changed protected entity ${id}.`);

  await installPhase122Pack(client, pack);
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE122_PRESIDENT_ID,
      reviewKind,
      reviewer: options.reviewer.trim(),
      status: "approved",
      notes: `${pack.sourceMarker}; ${reviewKind} review of Phase 122 checked-in sourced copy.`,
    });
  }
  const published = await publishEntity(client, {
    entityId: PHASE122_PRESIDENT_ID,
    reviewer: options.reviewer.trim(),
  });
  const result: ApplyPhase122Result = {
    entities: [{
      entityId: PHASE122_PRESIDENT_ID,
      outcome: "published",
      contentHash: published.contentHash,
    }],
  };

  await assertTerminal(client, pack.sourceMarker);
  const relationshipAfter = await jsonRows(client, "SELECT id,source_id,target_id,link_type,reason FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id", [PHASE122_PRESIDENT_ID, PHASE122_PRESIDENT_ID]);
  if (JSON.stringify(relationshipAfter) !== JSON.stringify(relationshipBefore)) throw new Error("Phase 122 changed the locked made_by/reverse rows after publish.");
  for (const [id, digest] of protectedBefore) if (await payloadDigest(client, id, true) !== digest) throw new Error(`Phase 122 changed protected entity ${id} after publish.`);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return result;
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const databasePath = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalogPath = value("--protected-catalog");
  const reviewer = value("--reviewer") ?? "phase122-platinum-president-ptb-20000p";
  if (!databasePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error("Usage: tsx scripts/apply-phase122-platinum-president-ptb-20000p-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  }
  const resolvedDatabase = path.resolve(databasePath);
  const resolvedOwnedRoot = path.resolve(ownedRoot);
  const resolvedProtected = path.resolve(protectedCatalogPath);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase122PlatinumPresidentContent(client, {
      workspaceRoot: process.cwd(),
      reviewer,
      databasePath: resolvedDatabase,
      ownedRoot: resolvedOwnedRoot,
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: process.env,
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
