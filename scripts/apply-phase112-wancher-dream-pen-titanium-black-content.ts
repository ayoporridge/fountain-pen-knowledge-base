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
  PHASE112_DREAM_ARTICLE_ID,
  PHASE112_OFFICIAL_URL,
  PHASE112_TITANIUM_BLACK_ID,
  PHASE112_TITANIUM_BLACK_SLUG,
  PHASE112_TRUE_EBONITE_ID,
  PHASE112_WANCHER_ID,
  loadPhase112WancherDreamPenTitaniumBlackPack,
  phase112WancherDreamPenTitaniumBlackPack,
} from "./data/phase112-wancher-dream-pen-titanium-black";
import {
  curatedId,
  packId,
  type CuratedSource,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export {
  PHASE112_DREAM_ARTICLE_ID,
  PHASE112_TITANIUM_BLACK_ID,
  PHASE112_TITANIUM_BLACK_SLUG,
  PHASE112_TRUE_EBONITE_ID,
  PHASE112_WANCHER_ID,
};

export type ApplyPhase112Options = ApplyPhase22Options;
export type ApplyPhase112Result = ApplyPhase22Result;

const ALLOWED_REPO_INPUTS = new Set([
  "/Users/xz/CodeBuddy/fountain-pen-graph",
  "/Users/xz/Documents/fountain-pen-graph",
]);
const CANONICAL_REPO = "/Users/xz/Documents/fountain-pen-graph";
const ARTICLE_SLUG = "wancher-dream-pen";
const BRAND_MARKER_PREFIX = "curated-content:phase107-wancher-brand-v1:";
const TRUE_EBONITE_MARKER_PREFIX = "curated-content:phase107-wancher-true-ebonite-matte-black-v1:";

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 112 refuses inherited remote database selection: ${key}.`);
  }
}

function assertVerifiedRepoPair(input: string): string {
  if (!ALLOWED_REPO_INPUTS.has(input)) {
    throw new Error("Phase 112 requires the verified CodeBuddy/Documents repo pair.");
  }
  const real = fs.realpathSync.native(input);
  let gitRoot: string;
  try {
    gitRoot = fs.realpathSync.native(
      execFileSync("git", ["-C", input, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim(),
    );
  } catch {
    throw new Error("Phase 112 could not resolve the verified CodeBuddy/Documents repo pair.");
  }
  if (real !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO) {
    throw new Error("Phase 112 verified CodeBuddy/Documents repo pair must resolve to one canonical git root.");
  }
  return real;
}

async function assertAuthority(client: Client, options: ApplyPhase112Options): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 112 reviewer must not be empty.");
  const workspaceRoot = assertVerifiedRepoPair(options.workspaceRoot);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);

  if (fs.lstatSync(options.databasePath).isSymbolicLink()) {
    throw new Error("Phase 112 caller-owned database must not be a symlink.");
  }
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || !isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 112 requires a regular database inside the caller-owned root.");
  }
  const protectedNames = new Set([protectedPath, `${protectedPath}-wal`, `${protectedPath}-shm`]);
  if (protectedNames.has(databasePath)) throw new Error("Phase 112 refuses the protected catalog or sidecar path.");
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino) {
    throw new Error("Phase 112 refuses a hard-link alias of the protected catalog.");
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 112 client/path mismatch for caller-owned database.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 112 owned copy must be migrated through 032.");
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
    "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id",
    ...(includeTopology ? ["SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id"] : []),
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
          LEFT JOIN entity_publications publication ON publication.entity_id=entity.id
          LEFT JOIN public_entities public ON public.id=entity.id
          WHERE entity.id IN (?,?,?) ORDER BY entity.id`,
    args: [PHASE112_WANCHER_ID, PHASE112_DREAM_ARTICLE_ID, PHASE112_TRUE_EBONITE_ID],
  });
  const byId = new Map(baseline.rows.map((row) => [String(row.id), row]));
  const brand = byId.get(PHASE112_WANCHER_ID);
  const article = byId.get(PHASE112_DREAM_ARTICLE_ID);
  const trueEbonite = byId.get(PHASE112_TRUE_EBONITE_ID);
  if (!brand || brand.type !== "brand" || brand.slug !== "wancher" || brand.status !== "published" || Number(brand.is_public) !== 1 || !String(brand.source).startsWith(BRAND_MARKER_PREFIX)) {
    throw new Error("Phase 112 requires the exact published Phase 107 Wancher brand baseline.");
  }
  if (!article || article.type !== "article" || article.slug !== ARTICLE_SLUG || Number(article.is_public) !== 1) {
    throw new Error("Phase 112 requires the exact published Phase 104 Dream Pen article baseline.");
  }
  if (!trueEbonite || trueEbonite.type !== "pen" || trueEbonite.slug !== "wancher-dream-pen-true-ebonite-matte-black" || trueEbonite.status !== "published" || Number(trueEbonite.is_public) !== 1 || !String(trueEbonite.source).startsWith(TRUE_EBONITE_MARKER_PREFIX)) {
    throw new Error("Phase 112 requires the exact published Phase 107 True Ebonite baseline.");
  }
  const action = await client.execute({
    sql: "SELECT action_kind,status FROM taxonomy_actions WHERE source_entity_id=? AND target_entity_id=? AND source_row_key=?",
    args: [PHASE112_DREAM_ARTICLE_ID, PHASE112_DREAM_ARTICLE_ID, "wancher万佳-dream-pen"],
  });
  if (action.rows.length !== 1 || action.rows[0]?.action_kind !== "rename" || action.rows[0]?.status !== "applied") {
    throw new Error("Phase 112 requires the applied Phase 104 route reclassification.");
  }
  const articleReference = await client.execute({
    sql: `SELECT reference.entity_id FROM entity_references reference
          JOIN source_items item ON item.id=reference.source_item_id
          WHERE item.url=?`,
    args: [PHASE112_OFFICIAL_URL],
  });
  if (
    !articleReference.rows.some(
      (row) => row.entity_id === PHASE112_DREAM_ARTICLE_ID,
    ) ||
    articleReference.rows.some(
      (row) =>
        row.entity_id !== PHASE112_DREAM_ARTICLE_ID &&
        row.entity_id !== PHASE112_TITANIUM_BLACK_ID,
    )
  ) {
    throw new Error(
      `Phase 112 requires the allowlisted Phase 104 article reference to the official Titanium URL; owners=${JSON.stringify(articleReference.rows.map((row) => String(row.entity_id)))}`,
    );
  }
}

async function inspectTarget(client: Client, sourceMarker: string): Promise<"absent" | "terminal"> {
  const collisions = await client.execute({
    sql: `SELECT DISTINCT entity.id,entity.type,entity.slug,entity.name,entity.source
          FROM entities entity
          LEFT JOIN entity_aliases alias ON alias.entity_id=entity.id
          LEFT JOIN entity_references reference ON reference.entity_id=entity.id
          LEFT JOIN source_items item ON item.id=reference.source_item_id
          WHERE entity.id=? OR entity.slug=?
             OR lower(entity.name) IN (lower('Wancher Dream Pen Titanium Black'),lower('Dream Pen Titanium Black'),lower('Wancher Titanium Black'))
             OR lower(COALESCE(alias.alias,'')) IN (lower('Wancher Dream Pen Titanium Black'),lower('Dream Pen Titanium Black'),lower('Wancher Titanium Black'))
             OR entity.source_url=?
             OR (item.url=? AND entity.type='pen')
             OR (entity.source LIKE 'curated-content:phase112-wancher-dream-pen-titanium-black-v1:%')
          ORDER BY entity.id`,
    args: [PHASE112_TITANIUM_BLACK_ID, PHASE112_TITANIUM_BLACK_SLUG, PHASE112_OFFICIAL_URL, PHASE112_OFFICIAL_URL],
  });
  if (collisions.rows.length === 0) return "absent";
  if (collisions.rows.length !== 1) throw new Error("Phase 112 found an alternate exact Titanium Black pen before first write.");
  const row = collisions.rows[0];
  if (row?.id !== PHASE112_TITANIUM_BLACK_ID || row.type !== "pen" || row.slug !== PHASE112_TITANIUM_BLACK_SLUG || row.name !== "Wancher Dream Pen Titanium Black") {
    throw new Error("Phase 112 found an alternate exact Titanium Black pen before first write.");
  }
  if (row.source !== sourceMarker) throw new Error("Phase 112 locked target exists without its exact source marker; repair is forbidden.");
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

async function upsertPhase112Sources(
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
        `Phase 112 curated source registry: ${source.registryKey}`,
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

async function installPhase112Pack(
  client: Client,
  pack: LoadedCuratedEntityPack,
): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    await upsertPhase112Sources(transaction, pack);
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
    if (updated.rowsAffected !== 1) throw new Error("Phase 112 target identity changed before payload install.");
    const publication = await transaction.execute({
      sql: "UPDATE entity_publications SET depth_tier=?,updated_at=datetime('now') WHERE entity_id=?",
      args: [pack.depthTier, pack.entityId],
    });
    if (publication.rowsAffected !== 1) throw new Error("Phase 112 target publication row is missing.");

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
      if (!source) throw new Error(`Phase 112 alias source missing: ${alias.sourceKey}`);
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
        if (!scopeId) throw new Error(`Phase 112 claim scope missing: ${item.scopeKey}`);
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
    if (!pack.spec) throw new Error("Phase 112 target pack requires model specs.");
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
      if (!scopeId) throw new Error(`Phase 112 spec scope missing: ${item.scopeKey}`);
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
        if (!citationId) throw new Error(`Phase 112 conflict citation missing: ${member.citationKey}`);
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

async function reviewAndPublishBrand(client: Client, reviewer: string, expectedHash: string): Promise<void> {
  const currentHash = await computePublicationContentHash(client, PHASE112_WANCHER_ID);
  if (currentHash !== expectedHash) throw new Error("Phase 112 Wancher post-topology current hash changed unexpectedly.");
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE112_WANCHER_ID,
      reviewKind,
      reviewer,
      status: "approved",
      notes: `Phase 112 ${reviewKind} review for exact post-topology current hash; Phase 107 brand pack not replayed.`,
    });
  }
  await publishEntity(client, { entityId: PHASE112_WANCHER_ID, reviewer });
}

async function assertTerminal(client: Client, sourceMarker: string): Promise<string> {
  const target = await client.execute({
    sql: `SELECT entity.id,entity.type,entity.slug,entity.name,entity.source,publication.status,
                 publication.approved_content_hash,publication.content_revision,
                 readiness.blocker_count,readiness.publishable,
                 CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
          FROM entities entity
          JOIN entity_publications publication ON publication.entity_id=entity.id
          LEFT JOIN public_entity_readiness readiness ON readiness.entity_id=entity.id AND readiness.contract_version=3
          LEFT JOIN public_entities public ON public.id=entity.id
          WHERE entity.id=?`,
    args: [PHASE112_TITANIUM_BLACK_ID],
  });
  const row = target.rows[0];
  const currentHash = await computePublicationContentHash(client, PHASE112_TITANIUM_BLACK_ID);
  if (!row || row.type !== "pen" || row.slug !== PHASE112_TITANIUM_BLACK_SLUG || row.name !== "Wancher Dream Pen Titanium Black" || row.source !== sourceMarker || row.status !== "published" || row.approved_content_hash !== currentHash || Number(row.blocker_count) !== 0 || Number(row.publishable) !== 1 || Number(row.is_public) !== 1) {
    throw new Error("Phase 112 terminal identity/source/publication state is invalid; automatic repair is forbidden.");
  }
  const topology = await client.execute({
    sql: "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY link_type",
    args: [PHASE112_TITANIUM_BLACK_ID, PHASE112_TITANIUM_BLACK_ID],
  });
  if (topology.rows.length !== 2 || topology.rows[0]?.source_id !== PHASE112_TITANIUM_BLACK_ID || topology.rows[0]?.target_id !== PHASE112_WANCHER_ID || topology.rows[0]?.link_type !== "made_by" || topology.rows[1]?.source_id !== PHASE112_WANCHER_ID || topology.rows[1]?.target_id !== PHASE112_TITANIUM_BLACK_ID || topology.rows[1]?.link_type !== "reverse") {
    throw new Error("Phase 112 terminal made_by/reverse topology is invalid; automatic repair is forbidden.");
  }
  const evidence = await client.execute({
    sql: `SELECT
            (SELECT count(*) FROM fact_scopes WHERE entity_id=?) AS scopes,
            (SELECT count(*) FROM claims WHERE subject_entity_id=?) AS claims,
            (SELECT count(*) FROM fact_conflicts WHERE entity_id=? AND status='resolved' AND resolution_note LIKE '%configuration chronology remains unknown%') AS conflicts,
            (SELECT count(*) FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved') AS primary_media,
            (SELECT count(*) FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media','publication')) AS reviews`,
    args: [PHASE112_TITANIUM_BLACK_ID, PHASE112_TITANIUM_BLACK_ID, PHASE112_TITANIUM_BLACK_ID, PHASE112_TITANIUM_BLACK_ID, PHASE112_TITANIUM_BLACK_ID, currentHash],
  });
  const counts = evidence.rows[0];
  if (Number(counts?.scopes) !== 2 || Number(counts?.claims) < 3 || Number(counts?.conflicts) !== 1 || Number(counts?.primary_media) !== 1 || Number(counts?.reviews) !== 4) {
    throw new Error("Phase 112 terminal scope/evidence/media/review state is invalid; automatic repair is forbidden.");
  }
  const brandHash = await computePublicationContentHash(client, PHASE112_WANCHER_ID);
  const brandPublication = await client.execute({
    sql: "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
    args: [PHASE112_WANCHER_ID],
  });
  if (brandPublication.rows[0]?.status !== "published" || brandPublication.rows[0]?.approved_content_hash !== brandHash) {
    throw new Error("Phase 112 terminal Wancher post-topology publication is invalid; automatic repair is forbidden.");
  }
  return currentHash;
}

export async function applyPhase112WancherDreamPenTitaniumBlackContent(
  client: Client,
  options: ApplyPhase112Options,
): Promise<ApplyPhase112Result> {
  const workspaceRoot = await assertAuthority(client, options);
  const pack = loadPhase112WancherDreamPenTitaniumBlackPack(workspaceRoot);
  await assertBaseline(client);
  const targetState = await inspectTarget(client, pack.sourceMarker);
  if (targetState === "terminal") {
    const contentHash = await assertTerminal(client, pack.sourceMarker);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return { entities: [{ entityId: PHASE112_TITANIUM_BLACK_ID, outcome: "noop", contentHash }] };
  }

  const articleBefore = await payloadDigest(client, PHASE112_DREAM_ARTICLE_ID, true);
  const trueEboniteBefore = await payloadDigest(client, PHASE112_TRUE_EBONITE_ID, true);
  const brandPayloadBefore = await payloadDigest(client, PHASE112_WANCHER_ID, false);
  const brandHashBefore = await computePublicationContentHash(client, PHASE112_WANCHER_ID);
  const transaction = await client.transaction("write");
  try {
    await transaction.execute({
      sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
      args: [PHASE112_TITANIUM_BLACK_ID, PHASE112_TITANIUM_BLACK_SLUG, "Wancher Dream Pen Titanium Black"],
    });
    await transaction.execute({
      sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
      args: [stableId("phase112-made-by", `${PHASE112_TITANIUM_BLACK_ID}:${PHASE112_WANCHER_ID}`), PHASE112_TITANIUM_BLACK_ID, PHASE112_WANCHER_ID, "Phase 112 exact Wancher maker relation"],
    });
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [stableId("phase112-reverse", `${PHASE112_WANCHER_ID}:${PHASE112_TITANIUM_BLACK_ID}`), PHASE112_WANCHER_ID, PHASE112_TITANIUM_BLACK_ID, "Phase 112 Wancher-to-Titanium-Black public navigation"],
    });
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }

  if (await payloadDigest(client, PHASE112_DREAM_ARTICLE_ID, true) !== articleBefore) throw new Error("Phase 112 changed the protected Dream Pen article payload/topology.");
  if (await payloadDigest(client, PHASE112_TRUE_EBONITE_ID, true) !== trueEboniteBefore) throw new Error("Phase 112 changed the protected True Ebonite payload/topology.");
  if (await payloadDigest(client, PHASE112_WANCHER_ID, false) !== brandPayloadBefore) throw new Error("Phase 112 changed Wancher non-topology payload or Phase 107 source marker.");
  const brandHashAfter = await computePublicationContentHash(client, PHASE112_WANCHER_ID);
  if (brandHashAfter === brandHashBefore) throw new Error("Phase 112 expected one-link-pair Wancher topology hash change.");
  await reviewAndPublishBrand(client, options.reviewer.trim(), brandHashAfter);

  await installPhase112Pack(client, pack);
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE112_TITANIUM_BLACK_ID,
      reviewKind,
      reviewer: options.reviewer.trim(),
      status: "approved",
      notes: `${pack.sourceMarker}; ${reviewKind} review of Phase 112 checked-in sourced copy.`,
    });
  }
  const published = await publishEntity(client, {
    entityId: PHASE112_TITANIUM_BLACK_ID,
    reviewer: options.reviewer.trim(),
  });
  const result: ApplyPhase112Result = {
    entities: [
      {
        entityId: PHASE112_TITANIUM_BLACK_ID,
        outcome: "published",
        contentHash: published.contentHash,
      },
    ],
  };
  await assertTerminal(client, pack.sourceMarker);
  if (await payloadDigest(client, PHASE112_DREAM_ARTICLE_ID, true) !== articleBefore) throw new Error("Phase 112 changed the protected Dream Pen article after publish.");
  if (await payloadDigest(client, PHASE112_TRUE_EBONITE_ID, true) !== trueEboniteBefore) throw new Error("Phase 112 changed the protected True Ebonite entity after publish.");
  if (await payloadDigest(client, PHASE112_WANCHER_ID, false) !== brandPayloadBefore) throw new Error("Phase 112 replayed or changed the Phase 107 Wancher brand pack.");
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
  const reviewer = value("--reviewer") ?? "phase112-wancher-titanium-black";
  if (!databasePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error("Usage: tsx scripts/apply-phase112-wancher-dream-pen-titanium-black-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  }
  const resolvedDatabase = path.resolve(databasePath);
  const resolvedOwnedRoot = path.resolve(ownedRoot);
  const resolvedProtected = path.resolve(protectedCatalogPath);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase112WancherDreamPenTitaniumBlackContent(client, {
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
