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
  loadPhase121PlatinumProcyonPack,
  PHASE121_CATALOG_URL,
  PHASE121_CURRENT_COLOURS,
  PHASE121_CURRENT_URL,
  PHASE121_CURIDAS_ID,
  PHASE121_INDEX_URL,
  PHASE121_LAUNCH_URL,
  PHASE121_MANUAL_URL,
  PHASE121_PLATINUM_3776_ID,
  PHASE121_PLATINUM_BRAND_ID,
  PHASE121_PROCYON_ID,
  PHASE121_PROCYON_NAME,
  PHASE121_PROCYON_SLUG,
  PHASE121_REVIEW_2019_URL,
  PHASE121_REVIEW_2021_URL,
  phase121PlatinumProcyonPack,
} from "./data/phase121-platinum-procyon-pns-5000";
import {
  curatedId,
  packId,
  type CuratedSource,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export {
  PHASE121_CURIDAS_ID,
  PHASE121_PLATINUM_3776_ID,
  PHASE121_PLATINUM_BRAND_ID,
  PHASE121_PROCYON_ID,
  PHASE121_PROCYON_SLUG,
};

export type ApplyPhase121Options = ApplyPhase22Options;
export type ApplyPhase121Result = ApplyPhase22Result;

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
    if (env[key]?.trim()) throw new Error(`Phase 121 refuses inherited remote database selection: ${key}.`);
  }
}

function assertVerifiedRepoPair(input: string): string {
  if (!ALLOWED_REPO_INPUTS.has(input)) {
    throw new Error("Phase 121 requires the verified CodeBuddy/Documents repo pair.");
  }
  const real = fs.realpathSync.native(input);
  let gitRoot: string;
  try {
    gitRoot = fs.realpathSync.native(
      execFileSync("git", ["-C", input, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim(),
    );
  } catch {
    throw new Error("Phase 121 could not resolve the verified CodeBuddy/Documents repo pair.");
  }
  if (real !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO) {
    throw new Error("Phase 121 verified CodeBuddy/Documents repo pair must resolve to one canonical git root.");
  }
  return real;
}

async function assertAuthority(client: Client, options: ApplyPhase121Options): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 121 reviewer must not be empty.");
  const workspaceRoot = assertVerifiedRepoPair(options.workspaceRoot);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);

  if (fs.lstatSync(options.databasePath).isSymbolicLink()) {
    throw new Error("Phase 121 caller-owned database must not be a symlink.");
  }
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || !isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 121 requires a regular database inside the caller-owned root.");
  }
  const protectedNames = new Set([protectedPath, `${protectedPath}-wal`, `${protectedPath}-shm`]);
  if (protectedNames.has(databasePath)) throw new Error("Phase 121 refuses the protected catalog or sidecar path.");
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (Number(owned.nlink) !== 1) {
    throw new Error("Phase 121 caller-owned database must not have hard-link aliases.");
  }
  if (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino) {
    throw new Error("Phase 121 refuses a hard-link alias of the protected catalog.");
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 121 client/path mismatch for caller-owned database.");
  }
  let migration;
  try {
    migration = await client.execute({
      sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
      args: ["032_taxonomy_identity.sql"],
    });
  } catch {
    throw new Error("Phase 121 owned copy must be migrated through 032.");
  }
  if (migration.rows.length !== 1) throw new Error("Phase 121 owned copy must be migrated through 032.");
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
          WHERE entity.id IN (?,?,?) ORDER BY entity.id`,
    args: [
      PHASE121_PLATINUM_BRAND_ID,
      PHASE121_PLATINUM_3776_ID,
      PHASE121_CURIDAS_ID,
    ],
  });
  if (baseline.rows.length !== 3) {
    throw new Error("Phase 121 requires exact Phase 42/78 Platinum prerequisites.");
  }
  const byId = new Map(baseline.rows.map((row) => [String(row.id), row]));
  const brand = byId.get(PHASE121_PLATINUM_BRAND_ID);
  const century = byId.get(PHASE121_PLATINUM_3776_ID);
  const curidas = byId.get(PHASE121_CURIDAS_ID);
  if (
    !brand ||
    brand.type !== "brand" ||
    brand.slug !== "platinum" ||
    brand.status !== "published" ||
    Number(brand.is_public) !== 1 ||
    !String(brand.source).startsWith("curated-content:phase78-platinum-brand-v1:")
  ) {
    throw new Error("Phase 121 requires the exact published Phase 42 Platinum brand baseline.");
  }
  if (
    !century ||
    century.type !== "pen" ||
    century.slug !== "platinum-3776-century" ||
    century.status !== "published" ||
    Number(century.is_public) !== 1
  ) {
    throw new Error("Phase 121 requires the exact published Phase 42 #3776 Century baseline.");
  }
  if (
    !curidas ||
    curidas.type !== "pen" ||
    curidas.slug !== "platinum-curidas" ||
    curidas.status !== "published" ||
    Number(curidas.is_public) !== 1 ||
    !String(curidas.source).startsWith("curated-content:phase78-platinum-curidas-v1:")
  ) {
    throw new Error("Phase 121 requires the exact published Phase 78 Curidas baseline.");
  }
}

async function inspectTarget(
  client: Client,
  sourceMarker: string,
): Promise<"absent" | "terminal"> {
  const repoFiles = [
    [".planning/content-research", /procyon|pns-5000/i, "platinum-procyon-pns-5000-phase121.md"],
    ["scripts/data", /procyon|pns-5000/i, "phase121-platinum-procyon-pns-5000.ts"],
    ["scripts", /apply-.*(?:procyon|pns-5000)/i, "apply-phase121-platinum-procyon-pns-5000-content.ts"],
    ["tests/content", /procyon|pns-5000/i, "phase121-platinum-procyon-pns-5000.test.ts"],
  ] as const;
  for (const [directory, pattern, allowed] of repoFiles) {
    const alternates = fs
      .readdirSync(path.join(CANONICAL_REPO, directory))
      .filter((name) => pattern.test(name) && name !== allowed);
    if (alternates.length) {
      throw new Error(`Phase 121 found alternate Procyon repo pack files: ${alternates.join(", ")}`);
    }
  }

  const urls = [
    PHASE121_CURRENT_URL,
    PHASE121_INDEX_URL,
    PHASE121_LAUNCH_URL,
    PHASE121_CATALOG_URL,
    PHASE121_MANUAL_URL,
    PHASE121_REVIEW_2019_URL,
    PHASE121_REVIEW_2021_URL,
  ];
  const placeholders = urls.map(() => "?").join(",");
  const collisions = await client.execute({
    sql: `SELECT DISTINCT entity.id,entity.type,entity.slug,entity.name,entity.source
          FROM entities entity
          LEFT JOIN entity_aliases alias ON alias.entity_id=entity.id
          LEFT JOIN entity_references reference ON reference.entity_id=entity.id
          LEFT JOIN source_items item ON item.id=reference.source_item_id
          WHERE entity.id=? OR entity.slug=?
             OR lower(entity.name) IN (
               lower('Platinum Procyon PNS-5000'),lower('Platinum Procyon'),
               lower('PROCYON'),lower('PNS-5000')
             )
             OR lower(COALESCE(alias.alias,'')) IN (
               lower('Platinum Procyon PNS-5000'),lower('Platinum Procyon'),
               lower('PROCYON'),lower('PNS-5000')
             )
             OR entity.source_url IN (${placeholders})
             OR (item.url IN (${placeholders}) AND entity.type='pen')
             OR entity.source LIKE 'curated-content:phase121-platinum-procyon-pns-5000-v1:%'
          ORDER BY entity.id`,
    args: [
      PHASE121_PROCYON_ID,
      PHASE121_PROCYON_SLUG,
      ...urls,
      ...urls,
    ],
  });
  const sourceKeys = phase121PlatinumProcyonPack.sources.map((source) => source.key);
  const sourceItems = await client.execute({
    sql: `SELECT id,url FROM source_items WHERE id IN (${sourceKeys.map(() => "?").join(",")}) ORDER BY id`,
    args: sourceKeys.map(sourceItemId),
  });

  if (collisions.rows.length === 0) {
    if (sourceItems.rows.length) {
      throw new Error("Phase 121 source marker exists without the locked target; repair is forbidden.");
    }
    return "absent";
  }
  if (collisions.rows.length !== 1) {
    throw new Error("Phase 121 found an alternate Procyon identity or source owner before first write.");
  }
  const row = collisions.rows[0];
  if (
    row?.id !== PHASE121_PROCYON_ID ||
    row.type !== "pen" ||
    row.slug !== PHASE121_PROCYON_SLUG ||
    row.name !== PHASE121_PROCYON_NAME ||
    row.source !== sourceMarker
  ) {
    throw new Error("Phase 121 locked target is partial or alternate; automatic repair is forbidden.");
  }
  const expectedSourcePairs = phase121PlatinumProcyonPack.sources
    .map((source) => `${sourceItemId(source.key)}:${source.url}`)
    .sort();
  const actualSourcePairs = sourceItems.rows
    .map((item) => `${String(item.id)}:${String(item.url)}`)
    .sort();
  if (JSON.stringify(actualSourcePairs) !== JSON.stringify(expectedSourcePairs)) {
    throw new Error("Phase 121 terminal source ownership is incomplete or tampered; repair is forbidden.");
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

async function upsertPhase121Sources(
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
        `Phase 121 curated source registry: ${source.registryKey}`,
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

async function installPhase121Pack(
  client: Client,
  pack: LoadedCuratedEntityPack,
): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    await upsertPhase121Sources(transaction, pack);
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
    if (updated.rowsAffected !== 1) throw new Error("Phase 121 target identity changed before payload install.");
    const publication = await transaction.execute({
      sql: "UPDATE entity_publications SET depth_tier=?,updated_at=datetime('now') WHERE entity_id=?",
      args: [pack.depthTier, pack.entityId],
    });
    if (publication.rowsAffected !== 1) throw new Error("Phase 121 target publication row is missing.");

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
      if (!source) throw new Error(`Phase 121 alias source missing: ${alias.sourceKey}`);
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
        if (!scopeId) throw new Error(`Phase 121 claim scope missing: ${item.scopeKey}`);
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
    if (!pack.spec) throw new Error("Phase 121 target pack requires model specs.");
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
      if (!scopeId) throw new Error(`Phase 121 spec scope missing: ${item.scopeKey}`);
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
        if (!citationId) throw new Error(`Phase 121 conflict citation missing: ${member.citationKey}`);
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

async function reviewAndPublishBrand(
  client: Client,
  reviewer: string,
  expectedHash: string,
): Promise<void> {
  const currentHash = await computePublicationContentHash(
    client,
    PHASE121_PLATINUM_BRAND_ID,
  );
  if (currentHash !== expectedHash) {
    throw new Error("Phase 121 Platinum post-topology current hash changed unexpectedly.");
  }
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE121_PLATINUM_BRAND_ID,
      reviewKind,
      reviewer,
      status: "approved",
      notes: `Phase 121 ${reviewKind} review for exact post-topology current hash; Phase 42/78 brand packs not replayed.`,
    });
  }
  await publishEntity(client, {
    entityId: PHASE121_PLATINUM_BRAND_ID,
    reviewer,
  });
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
    args: [PHASE121_PROCYON_ID],
  });
  const row = target.rows[0];
  const currentHash = await computePublicationContentHash(client, PHASE121_PROCYON_ID);
  if (
    !row ||
    row.type !== "pen" ||
    row.slug !== PHASE121_PROCYON_SLUG ||
    row.name !== PHASE121_PROCYON_NAME ||
    row.source !== sourceMarker ||
    row.status !== "published" ||
    row.approved_content_hash !== currentHash ||
    Number(row.blocker_count) !== 0 ||
    Number(row.publishable) !== 1 ||
    Number(row.is_public) !== 1
  ) {
    throw new Error("Phase 121 terminal identity/source/publication state is invalid; automatic repair is forbidden.");
  }
  const topology = await client.execute({
    sql: "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY link_type",
    args: [PHASE121_PROCYON_ID, PHASE121_PROCYON_ID],
  });
  if (
    topology.rows.length !== 2 ||
    topology.rows[0]?.source_id !== PHASE121_PROCYON_ID ||
    topology.rows[0]?.target_id !== PHASE121_PLATINUM_BRAND_ID ||
    topology.rows[0]?.link_type !== "made_by" ||
    topology.rows[1]?.source_id !== PHASE121_PLATINUM_BRAND_ID ||
    topology.rows[1]?.target_id !== PHASE121_PROCYON_ID ||
    topology.rows[1]?.link_type !== "reverse"
  ) {
    throw new Error("Phase 121 terminal made_by/reverse topology is invalid; automatic repair is forbidden.");
  }
  const counts = (await client.execute({
    sql: `SELECT
      (SELECT count(*) FROM fact_scopes WHERE entity_id=?) AS scopes,
      (SELECT count(*) FROM claims WHERE subject_entity_id=?) AS claims,
      (SELECT count(*) FROM model_variants WHERE model_entity_id=?) AS variants,
      (SELECT count(*) FROM fact_scopes WHERE entity_id=? AND scope_key LIKE '%pns8000-limited%') AS sibling_scopes,
      (SELECT count(*) FROM fact_scopes WHERE entity_id=? AND scope_key LIKE '%supplied-sample%') AS sample_scopes,
      (SELECT count(*) FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='rejected') AS rejected,
      (SELECT count(*) FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved') AS media,
      (SELECT count(*) FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media','publication')) AS reviews`,
    args: [
      PHASE121_PROCYON_ID,PHASE121_PROCYON_ID,PHASE121_PROCYON_ID,
      PHASE121_PROCYON_ID,PHASE121_PROCYON_ID,PHASE121_PROCYON_ID,
      PHASE121_PROCYON_ID,PHASE121_PROCYON_ID,currentHash,
    ],
  })).rows[0];
  if (
    Number(counts?.scopes) !== 5 ||
    Number(counts?.claims) !== 8 ||
    Number(counts?.variants) !== PHASE121_CURRENT_COLOURS.length ||
    Number(counts?.sibling_scopes) !== 1 ||
    Number(counts?.sample_scopes) !== 2 ||
    Number(counts?.rejected) < 8 ||
    Number(counts?.media) !== 1 ||
    Number(counts?.reviews) !== 4
  ) {
    throw new Error("Phase 121 terminal scope/evidence/media/review state is invalid; automatic repair is forbidden.");
  }
  const variants = await client.execute({
    sql: "SELECT variant_name FROM model_variants WHERE model_entity_id=? ORDER BY variant_name",
    args: [PHASE121_PROCYON_ID],
  });
  if (
    JSON.stringify(variants.rows.map((item) => String(item.variant_name))) !==
    JSON.stringify([...PHASE121_CURRENT_COLOURS].sort())
  ) {
    throw new Error("Phase 121 terminal current variant set is invalid; automatic repair is forbidden.");
  }
  const brandHash = await computePublicationContentHash(client, PHASE121_PLATINUM_BRAND_ID);
  const brandPublication = await client.execute({
    sql: "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
    args: [PHASE121_PLATINUM_BRAND_ID],
  });
  if (
    brandPublication.rows[0]?.status !== "published" ||
    brandPublication.rows[0]?.approved_content_hash !== brandHash
  ) {
    throw new Error("Phase 121 terminal Platinum post-topology publication is invalid; automatic repair is forbidden.");
  }
  return currentHash;
}

export async function applyPhase121PlatinumProcyonContent(
  client: Client,
  options: ApplyPhase121Options,
): Promise<ApplyPhase121Result> {
  const workspaceRoot = await assertAuthority(client, options);
  const pack = loadPhase121PlatinumProcyonPack(workspaceRoot);
  await assertBaseline(client);
  const targetState = await inspectTarget(client, pack.sourceMarker);
  if (targetState === "terminal") {
    const contentHash = await assertTerminal(client, pack.sourceMarker);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return { entities: [{ entityId: PHASE121_PROCYON_ID, outcome: "noop", contentHash }] };
  }

  const centuryBefore = await payloadDigest(client, PHASE121_PLATINUM_3776_ID, true);
  const curidasBefore = await payloadDigest(client, PHASE121_CURIDAS_ID, true);
  const brandPayloadBefore = await payloadDigest(client, PHASE121_PLATINUM_BRAND_ID, false);
  const brandHashBefore = await computePublicationContentHash(client, PHASE121_PLATINUM_BRAND_ID);
  const reverseBefore = await jsonRows(
    client,
    "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
    [PHASE121_PLATINUM_BRAND_ID],
  );

  const transaction = await client.transaction("write");
  try {
    await transaction.execute({
      sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
      args: [PHASE121_PROCYON_ID, PHASE121_PROCYON_SLUG, PHASE121_PROCYON_NAME],
    });
    await transaction.execute({
      sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
      args: [
        stableId("phase121-made-by", `${PHASE121_PROCYON_ID}:${PHASE121_PLATINUM_BRAND_ID}`),
        PHASE121_PROCYON_ID,
        PHASE121_PLATINUM_BRAND_ID,
        "Phase 121 exact Platinum maker relation",
      ],
    });
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [
        stableId("phase121-reverse", `${PHASE121_PLATINUM_BRAND_ID}:${PHASE121_PROCYON_ID}`),
        PHASE121_PLATINUM_BRAND_ID,
        PHASE121_PROCYON_ID,
        "Phase 121 Platinum-to-Procyon PNS-5000 public navigation",
      ],
    });
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }

  if (await payloadDigest(client, PHASE121_PLATINUM_3776_ID, true) !== centuryBefore) {
    throw new Error("Phase 121 changed protected #3776 Century.");
  }
  if (await payloadDigest(client, PHASE121_CURIDAS_ID, true) !== curidasBefore) {
    throw new Error("Phase 121 changed protected Curidas.");
  }
  if (await payloadDigest(client, PHASE121_PLATINUM_BRAND_ID, false) !== brandPayloadBefore) {
    throw new Error("Phase 121 changed Platinum non-topology payload.");
  }
  const reverseAfter = await jsonRows(
    client,
    "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id",
    [PHASE121_PLATINUM_BRAND_ID],
  );
  const expectedReverseTargets = reverseBefore
    .map((row) => String(row.target_id))
    .concat(PHASE121_PROCYON_ID)
    .sort();
  const actualReverseTargets = reverseAfter
    .map((row) => String(row.target_id))
    .sort();
  if (
    JSON.stringify(actualReverseTargets) !==
    JSON.stringify(expectedReverseTargets)
  ) {
    throw new Error("Phase 121 Platinum reverse delta is not exact add-one.");
  }
  const brandHashAfter = await computePublicationContentHash(client, PHASE121_PLATINUM_BRAND_ID);
  if (brandHashAfter === brandHashBefore) {
    throw new Error("Phase 121 expected one-link-pair Platinum topology hash change.");
  }
  await reviewAndPublishBrand(client, options.reviewer.trim(), brandHashAfter);

  await installPhase121Pack(client, pack);
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE121_PROCYON_ID,
      reviewKind,
      reviewer: options.reviewer.trim(),
      status: "approved",
      notes: `${pack.sourceMarker}; ${reviewKind} review of Phase 121 checked-in sourced copy.`,
    });
  }
  const published = await publishEntity(client, {
    entityId: PHASE121_PROCYON_ID,
    reviewer: options.reviewer.trim(),
  });
  const result: ApplyPhase121Result = {
    entities: [{
      entityId: PHASE121_PROCYON_ID,
      outcome: "published",
      contentHash: published.contentHash,
    }],
  };

  await assertTerminal(client, pack.sourceMarker);
  if (await payloadDigest(client, PHASE121_PLATINUM_3776_ID, true) !== centuryBefore) {
    throw new Error("Phase 121 changed protected #3776 Century after publish.");
  }
  if (await payloadDigest(client, PHASE121_CURIDAS_ID, true) !== curidasBefore) {
    throw new Error("Phase 121 changed protected Curidas after publish.");
  }
  if (await payloadDigest(client, PHASE121_PLATINUM_BRAND_ID, false) !== brandPayloadBefore) {
    throw new Error("Phase 121 replayed or changed the Phase 42/78 Platinum brand pack.");
  }
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
  const reviewer = value("--reviewer") ?? "phase121-platinum-procyon-pns-5000";
  if (!databasePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error("Usage: tsx scripts/apply-phase121-platinum-procyon-pns-5000-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  }
  const resolvedDatabase = path.resolve(databasePath);
  const resolvedOwnedRoot = path.resolve(ownedRoot);
  const resolvedProtected = path.resolve(protectedCatalogPath);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase121PlatinumProcyonContent(client, {
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
