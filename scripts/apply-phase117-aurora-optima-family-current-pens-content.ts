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
  PHASE117_AURORA_BRAND_ID, PHASE117_OPTIMA_ID, PHASE117_AURORA_88_FAMILY_ID,
  PHASE117_RESINA_800_ID, PHASE117_IPSILON_FAMILY_ID, PHASE117_IPSILON_DEMO_ID,
  PHASE117_IPSILON_RESIN_ID, PHASE117_FAMILY_ID, PHASE117_FAMILY_SLUG,
  PHASE117_FAMILY_NAME, PHASE117_FAMILY_SVG, PHASE117_AUROLOIDE_ID,
  PHASE117_AUROLOIDE_SLUG, PHASE117_AUROLOIDE_NAME, PHASE117_RESINA_ID,
  PHASE117_RESINA_SLUG, PHASE117_RESINA_NAME, PHASE117_RESINA_OFFICIAL_URL,
  PHASE117_AUROLOIDE_OFFICIAL_URL,
  loadPhase117AuroraOptimaAuroloide996DorPack, loadPhase117AuroraOptimaResina997CnPack,
  phase117AuroraOptimaFamilyArticle,
} from "./data/phase117-aurora-optima-family-current-pens";
import { curatedId, packId, type CuratedSource, type LoadedCuratedEntityPack } from "./lib/curated-content-pack";

export type ApplyPhase117Options = ApplyPhase22Options;
export type ApplyPhase117Result = ApplyPhase22Result;
export { PHASE117_FAMILY_ID, PHASE117_FAMILY_SLUG, PHASE117_AUROLOIDE_ID, PHASE117_AUROLOIDE_SLUG, PHASE117_RESINA_ID, PHASE117_RESINA_SLUG };

const ALLOWED_REPO_INPUTS = new Set(["/Users/xz/CodeBuddy/fountain-pen-graph", "/Users/xz/Documents/fountain-pen-graph"]);
const CANONICAL_REPO = "/Users/xz/Documents/fountain-pen-graph";
const FAMILY_MARKDOWN = ".planning/content-research/aurora-optima-family-phase117.md";
const BRAND_MARKER_PREFIX = "curated-content:phase48-aurora-brand-v1:";
const PHASE114_FAMILY_MARKER_PREFIX = "curated:phase114:aurora-88-family:";
const PHASE114_RESINA_MARKER_PREFIX = "curated-content:phase114-aurora-ottantotto-resina-800-v1:";
const OPTIMA_MARKER_PREFIX = "curated-content:phase48-aurora-optima-v1:";
const PHASE115_FAMILY_MARKER_PREFIX = "curated:phase115:aurora-ipsilon-family:";
const PHASE115_DEMO_MARKER_PREFIX = "curated-content:phase115-aurora-ipsilon-demo-colors-v1:";
const PHASE115_RESIN_MARKER_PREFIX = "curated-content:phase115-aurora-ipsilon-resin-b11-n-v1:";

function stableId(prefix: string, value: string): string { return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`; }
function isInside(candidate: string, root: string): boolean { const relative = path.relative(root, candidate); return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative); }
function rejectRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) if (env[key]?.trim()) throw new Error(`Phase 117 refuses inherited remote database selection: ${key}.`);
}
function assertVerifiedRepoPair(input: string): string {
  if (!ALLOWED_REPO_INPUTS.has(input)) throw new Error("Phase 117 requires the verified CodeBuddy/Documents repo pair.");
  const real = fs.realpathSync.native(input);
  let gitRoot: string;
  try { gitRoot = fs.realpathSync.native(execFileSync("git", ["-C", input, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim()); }
  catch { throw new Error("Phase 117 could not resolve the verified CodeBuddy/Documents repo pair."); }
  if (real !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO) throw new Error("Phase 117 verified CodeBuddy/Documents repo pair must resolve to one canonical git root.");
  return real;
}
async function assertAuthority(client: Client, options: ApplyPhase117Options): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 117 reviewer must not be empty.");
  const workspaceRoot = assertVerifiedRepoPair(options.workspaceRoot);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  if (fs.lstatSync(options.databasePath).isSymbolicLink()) throw new Error("Phase 117 caller-owned database must not be a symlink.");
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || !isInside(databasePath, ownedRoot)) throw new Error("Phase 117 requires a regular database inside the caller-owned root.");
  const protectedNames = new Set([protectedPath, `${protectedPath}-wal`, `${protectedPath}-shm`]);
  if (protectedNames.has(databasePath)) throw new Error("Phase 117 refuses the protected catalog or sidecar path.");
  const owned = fs.statSync(databasePath, { bigint: true }); const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino) throw new Error("Phase 117 refuses a hard-link alias of the protected catalog.");
  const listed = await client.execute("PRAGMA database_list"); const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) throw new Error("Phase 117 client/path mismatch for caller-owned database.");
  const migration = await client.execute({ sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL", args: ["032_taxonomy_identity.sql"] });
  if (migration.rows.length !== 1) throw new Error("Phase 117 owned copy must be migrated through 032.");
  return workspaceRoot;
}
async function jsonRows(client: Client, sql: string, args: unknown[]): Promise<Array<Record<string, unknown>>> {
  return (await client.execute({ sql, args: args as never[] })).rows.map((row) => ({ ...row }));
}
async function payloadDigest(client: Client, entityId: string, includeTopology: boolean): Promise<string> {
  const queries = ["SELECT * FROM entities WHERE id=?", "SELECT * FROM stories WHERE entity_id=? ORDER BY id", "SELECT * FROM entity_references WHERE entity_id=? ORDER BY id", "SELECT * FROM entity_aliases WHERE entity_id=? ORDER BY id", "SELECT * FROM fact_scopes WHERE entity_id=? ORDER BY id", "SELECT * FROM claims WHERE subject_entity_id=? ORDER BY id", "SELECT * FROM model_specs WHERE entity_id=? ORDER BY id", "SELECT * FROM model_variants WHERE model_entity_id=? ORDER BY id", "SELECT * FROM timeline_events WHERE entity_id=? ORDER BY id", "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id", ...(includeTopology ? ["SELECT * FROM entity_publications WHERE entity_id=? ORDER BY entity_id", "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id"] : [])];
  const payload = []; for (const sql of queries) payload.push(await jsonRows(client, sql, sql.includes(" OR ") ? [entityId, entityId] : [entityId]));
  return JSON.stringify(payload);
}
function sourceReliability(source: CuratedSource): string {
  if (source.sourceType === "official") return "official_marketing";
  if (source.tier === "professional_secondary") return "high_for_model_history";
  return "medium";
}

function sourceItemId(sourceKey: string): string {
  return curatedId("source-item", sourceKey);
}

function loadFamilyCopy(workspaceRoot: string) {
  const markdown = fs
    .readFileSync(path.resolve(workspaceRoot, FAMILY_MARKDOWN), "utf8")
    .replace(/\r\n?/g, "\n");
  const summary = markdown.match(/^## summary\s*\n+([\s\S]*?)(?=^## )/m)?.[1].trim();
  const bodyMd = markdown.match(/^## body_md\s*\n+([\s\S]*)$/m)?.[1].trim();
  if (!summary || !bodyMd) throw new Error("Phase 117 family reviewed copy is incomplete.");
  const summaryLength = Array.from(summary).length;
  if (summaryLength < 60 || summaryLength > 160 || Array.from(bodyMd).length < 2_000) {
    throw new Error("Phase 117 family reviewed copy violates summary/body length contract.");
  }
  if (
    !bodyMd.includes(`/pen/${PHASE117_AUROLOIDE_SLUG}`) ||
    !bodyMd.includes(`/pen/${PHASE117_RESINA_SLUG}`)
  ) {
    throw new Error("Phase 117 family reviewed copy is missing three-way navigation.");
  }
  const digest = createHash("sha256").update(`${summary}\0${bodyMd}`).digest("hex");
  return {
    summary,
    bodyMd,
    sourceMarker: `${phase117AuroraOptimaFamilyArticle.sourceMarkerPrefix}${digest}`,
  };
}

async function deleteOwnedPayload(transaction: Transaction, entityId: string): Promise<void> {
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

async function upsertPhase117Sources(
  transaction: Transaction,
  pack: { sources: readonly CuratedSource[] },
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
        `Phase 117 curated source registry: ${source.registryKey}`,
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

async function installFamilyArticle(
  client: Client,
  copy: ReturnType<typeof loadFamilyCopy>,
): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    await upsertPhase117Sources(transaction, phase117AuroraOptimaFamilyArticle);
    const updated = await transaction.execute({
      sql: `UPDATE entities SET name=?,summary=?,body_md=?,source=?,source_url=NULL,
                   updated_at=datetime('now')
            WHERE id=? AND type='article' AND slug=?`,
      args: [
        phase117AuroraOptimaFamilyArticle.canonicalName,
        copy.summary,
        copy.bodyMd,
        copy.sourceMarker,
        PHASE117_FAMILY_ID,
        PHASE117_FAMILY_SLUG,
      ],
    });
    if (updated.rowsAffected !== 1) {
      throw new Error("Phase 117 family identity changed before article payload install.");
    }
    await transaction.execute({
      sql: `INSERT INTO stories(
              id,entity_id,title,story_type,summary,body_md,status,source_notes
            ) VALUES(?,?,?,'overview',?,?,'published',?)`,
      args: [
        stableId("phase117-family-story", PHASE117_FAMILY_ID),
        PHASE117_FAMILY_ID,
        phase117AuroraOptimaFamilyArticle.storyTitle,
        copy.summary,
        copy.bodyMd,
        copy.sourceMarker,
      ],
    });
    for (const source of phase117AuroraOptimaFamilyArticle.sources) {
      await transaction.execute({
        sql: `INSERT INTO entity_references(
                id,entity_id,source_item_id,relation_type,note,review_status
              ) VALUES(?,?,?,?,?,'approved')`,
        args: [
          stableId("phase117-family-reference", source.key),
          PHASE117_FAMILY_ID,
          sourceItemId(source.key),
          source.sourceType === "official" ? "official" : source.itemType === "image" ? "reference" : "review",
          source.summary,
        ],
      });
    }
    const image = phase117AuroraOptimaFamilyArticle.primaryImage;
    await transaction.execute({
      sql: `INSERT INTO media_assets(
              id,entity_id,title,asset_type,local_path,author,license,
              attribution_text,source_url,source_item_id,review_status,usage_status
            ) VALUES(?,?,?,'image',?,?,?,?,?,?,'approved','primary')`,
      args: [
        stableId("phase117-family-media", PHASE117_FAMILY_ID),
        PHASE117_FAMILY_ID,
        image.title,
        PHASE117_FAMILY_SVG,
        image.author ?? null,
        image.license ?? null,
        "本站原创 Aurora Optima sibling family navigation；非产品照片、logo、比例、颜色或饰面证明。",
        PHASE117_FAMILY_SVG,
        sourceItemId(image.key),
      ],
    });
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

async function installPhase117Pack(
  client: Client,
  pack: LoadedCuratedEntityPack,
): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    await upsertPhase117Sources(transaction, pack);
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
    if (updated.rowsAffected !== 1) throw new Error("Phase 117 target identity changed before payload install.");
    const publication = await transaction.execute({
      sql: "UPDATE entity_publications SET depth_tier=?,updated_at=datetime('now') WHERE entity_id=?",
      args: [pack.depthTier, pack.entityId],
    });
    if (publication.rowsAffected !== 1) throw new Error("Phase 117 target publication row is missing.");

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
      if (!source) throw new Error(`Phase 117 alias source missing: ${alias.sourceKey}`);
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
        if (!scopeId) throw new Error(`Phase 117 claim scope missing: ${item.scopeKey}`);
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
    if (!pack.spec) throw new Error("Phase 117 target pack requires model specs.");
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
      if (!scopeId) throw new Error(`Phase 117 spec scope missing: ${item.scopeKey}`);
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
        if (!citationId) throw new Error(`Phase 117 conflict citation missing: ${member.citationKey}`);
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


async function assertBaseline(client: Client): Promise<"first" | "terminal"> {
  const result = await client.execute({
    sql: `SELECT entity.id,entity.type,entity.slug,entity.source,publication.status,
                 CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
          FROM entities entity LEFT JOIN entity_publications publication ON publication.entity_id=entity.id
          LEFT JOIN public_entities public ON public.id=entity.id
          WHERE entity.id IN (?,?,?,?,?,?,?)`,
    args: [PHASE117_AURORA_BRAND_ID, PHASE117_FAMILY_ID, PHASE117_AURORA_88_FAMILY_ID, PHASE117_RESINA_800_ID, PHASE117_IPSILON_FAMILY_ID, PHASE117_IPSILON_DEMO_ID, PHASE117_IPSILON_RESIN_ID],
  });
  const byId = new Map(result.rows.map((row) => [String(row.id), row]));
  const expected = [
    [PHASE117_AURORA_BRAND_ID, "brand", "aurora", BRAND_MARKER_PREFIX, true],
    [PHASE117_AURORA_88_FAMILY_ID, "article", "aurora-88", PHASE114_FAMILY_MARKER_PREFIX, false],
    [PHASE117_RESINA_800_ID, "pen", "aurora-ottantotto-resina-800", PHASE114_RESINA_MARKER_PREFIX, true],
    [PHASE117_IPSILON_FAMILY_ID, "article", "aurora-ipsilon", PHASE115_FAMILY_MARKER_PREFIX, false],
    [PHASE117_IPSILON_DEMO_ID, "pen", "aurora-ipsilon-demo-colors", PHASE115_DEMO_MARKER_PREFIX, true],
    [PHASE117_IPSILON_RESIN_ID, "pen", "aurora-ipsilon-resin-b11-n", PHASE115_RESIN_MARKER_PREFIX, true],
  ] as const;
  for (const [id, type, slug, marker, governed] of expected) {
    const row = byId.get(id);
    if (!row || row.type !== type || row.slug !== slug || Number(row.is_public) !== 1 || !String(row.source).startsWith(marker) || (governed && row.status !== "published") || (!governed && row.status != null)) {
      throw new Error(`Phase 117 requires exact Phase 114/115 terminal prerequisite for ${id}.`);
    }
  }
  const family = byId.get(PHASE117_FAMILY_ID);
  const first = family?.type === "pen" && family.slug === PHASE117_FAMILY_SLUG && family.status === "published" && Number(family.is_public) === 1 && String(family.source).startsWith(OPTIMA_MARKER_PREFIX);
  const terminal = family?.type === "article" && family.slug === PHASE117_FAMILY_SLUG && family.status == null && Number(family.is_public) === 1 && String(family.source).startsWith(phase117AuroraOptimaFamilyArticle.sourceMarkerPrefix);
  if (!first && !terminal) throw new Error("Phase 117 requires either the exact Phase 48 Optima donor or complete Phase 117 family article.");
  const routeCollision = await client.execute({ sql: "SELECT source_path,target_path FROM entity_redirects WHERE source_path IN ('/pen/aurora-optima','/article/aurora-optima','/pen/aurora-optima-auroloide-996-dor','/pen/aurora-optima-resina-997-cn')", args: [] });
  if (routeCollision.rows.length) throw new Error(`Phase 117 route collision: ${JSON.stringify(routeCollision.rows)}`);
  return first ? "first" : "terminal";
}

async function inspectTargets(client: Client, markers: [string, string, string], baseline: "first" | "terminal"): Promise<"first" | "terminal"> {
  const generic = await client.execute({
    sql: `SELECT DISTINCT entity.id,entity.type,entity.slug,entity.name
          FROM entities entity LEFT JOIN entity_aliases alias ON alias.entity_id=entity.id
          WHERE entity.id NOT IN (?,?,?) AND (
            lower(entity.name) IN (lower('Optima'),lower('Aurora Optima'),lower('Aurora Optima（系列导航）'),lower('Aurora Optima Auroloide 996-DOR'),lower('Aurora Optima Resina 997-CN'))
            OR lower(COALESCE(alias.alias,'')) IN (lower('Optima'),lower('Aurora Optima'),lower('Aurora Optima Auroloide 996-DOR'),lower('Aurora Optima Resina 997-CN'))
            OR lower(entity.slug) IN ('aurora-optima','aurora-optima-auroloide-996-dor','aurora-optima-resina-997-cn')
            OR entity.source LIKE 'curated-content:phase117-aurora-optima-%'
          ) ORDER BY entity.id`,
    args: [PHASE117_FAMILY_ID, PHASE117_AUROLOIDE_ID, PHASE117_RESINA_ID],
  });
  if (generic.rows.length) throw new Error(`Phase 117 found generic or alternate Optima owner: ${JSON.stringify(generic.rows)}`);
  const owners = await client.execute({
    sql: `SELECT DISTINCT reference.entity_id,item.url FROM entity_references reference
          JOIN source_items item ON item.id=reference.source_item_id
          WHERE item.url IN (?,?) ORDER BY item.url,reference.entity_id`,
    args: [PHASE117_AUROLOIDE_OFFICIAL_URL, PHASE117_RESINA_OFFICIAL_URL],
  });
  const ownerPairs = owners.rows.map((row) => `${String(row.url)}:${String(row.entity_id)}`).sort();
  const expectedOwners = baseline === "first"
    ? [`${PHASE117_AUROLOIDE_OFFICIAL_URL}:${PHASE117_FAMILY_ID}`, `${PHASE117_RESINA_OFFICIAL_URL}:${PHASE117_FAMILY_ID}`].sort()
    : [
        `${PHASE117_AUROLOIDE_OFFICIAL_URL}:${PHASE117_AUROLOIDE_ID}`,
        `${PHASE117_AUROLOIDE_OFFICIAL_URL}:${PHASE117_RESINA_ID}`,
        `${PHASE117_RESINA_OFFICIAL_URL}:${PHASE117_RESINA_ID}`,
      ].sort();
  if (JSON.stringify(ownerPairs) !== JSON.stringify(expectedOwners)) throw new Error(`Phase 117 official source ownership is not the allowed Phase 48 donor migration state: ${JSON.stringify(ownerPairs)}`);
  const rows = await client.execute({ sql: "SELECT id,type,slug,name,source FROM entities WHERE id IN (?,?,?) OR slug IN (?,?,?) ORDER BY id", args: [PHASE117_FAMILY_ID, PHASE117_AUROLOIDE_ID, PHASE117_RESINA_ID, PHASE117_FAMILY_SLUG, PHASE117_AUROLOIDE_SLUG, PHASE117_RESINA_SLUG] });
  if (baseline === "first") {
    if (rows.rows.length !== 1 || rows.rows[0]?.id !== PHASE117_FAMILY_ID || rows.rows[0]?.type !== "pen" || rows.rows[0]?.slug !== PHASE117_FAMILY_SLUG || !String(rows.rows[0]?.source).startsWith(OPTIMA_MARKER_PREFIX)) throw new Error("Phase 117 first-write identity inventory is not the locked donor plus absent exact targets.");
    return "first";
  }
  if (rows.rows.length !== 3) throw new Error("Phase 117 partial terminal identity is invalid; automatic repair is forbidden.");
  const byId = new Map(rows.rows.map((row) => [String(row.id), row]));
  const expected = [[PHASE117_FAMILY_ID, "article", PHASE117_FAMILY_SLUG, PHASE117_FAMILY_NAME, markers[0]], [PHASE117_AUROLOIDE_ID, "pen", PHASE117_AUROLOIDE_SLUG, PHASE117_AUROLOIDE_NAME, markers[1]], [PHASE117_RESINA_ID, "pen", PHASE117_RESINA_SLUG, PHASE117_RESINA_NAME, markers[2]]] as const;
  for (const [id, type, slug, name, marker] of expected) {
    const row = byId.get(id);
    if (!row || row.type !== type || row.slug !== slug || row.name !== name || row.source !== marker) throw new Error("Phase 117 terminal identity/source marker is invalid; automatic repair is forbidden.");
  }
  return "terminal";
}
async function reviewAndPublish(client: Client, entityId: string, reviewer: string, note: string): Promise<string> {
  for (const reviewKind of ["fact", "language", "media"] as const) await recordEntityContentReview(client, { entityId, reviewKind, reviewer, status: "approved", notes: note });
  return (await publishEntity(client, { entityId, reviewer })).contentHash;
}
async function assertTerminal(client: Client, markers: [string, string, string]): Promise<string[]> {
  const identities = await client.execute({
    sql: `SELECT entity.id,entity.type,entity.slug,entity.name,entity.source,entity.summary,entity.body_md,
                 publication.status,publication.approved_content_hash,
                 CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
          FROM entities entity LEFT JOIN entity_publications publication ON publication.entity_id=entity.id
          LEFT JOIN public_entities public ON public.id=entity.id WHERE entity.id IN (?,?,?) ORDER BY entity.id`,
    args: [PHASE117_FAMILY_ID, PHASE117_AUROLOIDE_ID, PHASE117_RESINA_ID],
  });
  if (identities.rows.length !== 3) throw new Error("Phase 117 terminal identities missing.");
  const byId = new Map(identities.rows.map((row) => [String(row.id), row]));
  const family = byId.get(PHASE117_FAMILY_ID);
  if (!family || family.type !== "article" || family.slug !== PHASE117_FAMILY_SLUG || family.source !== markers[0] || Number(family.is_public) !== 1 || family.status != null || Array.from(String(family.summary)).length < 60 || Array.from(String(family.body_md)).length < 2000 || !String(family.body_md).includes(`/pen/${PHASE117_AUROLOIDE_SLUG}`) || !String(family.body_md).includes(`/pen/${PHASE117_RESINA_SLUG}`)) throw new Error("Phase 117 terminal family content is invalid; automatic repair is forbidden.");
  const familyCounts = (await client.execute({ sql: `SELECT
    (SELECT count(*) FROM entity_publications WHERE entity_id=?) AS publications,
    (SELECT count(*) FROM entity_links WHERE source_id=? OR target_id=?) AS topology,
    (SELECT count(*) FROM model_specs WHERE entity_id=?) AS specs,
    (SELECT count(*) FROM model_variants WHERE model_entity_id=?) AS variants,
    (SELECT count(*) FROM fact_scopes WHERE entity_id=?) AS scopes,
    (SELECT count(*) FROM claims WHERE subject_entity_id=?) AS claims,
    (SELECT count(*) FROM claim_evidence evidence JOIN claims claim ON claim.id=evidence.claim_id WHERE claim.subject_entity_id=?) AS evidence,
    (SELECT count(*) FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved') AS media`, args: [PHASE117_FAMILY_ID, PHASE117_FAMILY_ID, PHASE117_FAMILY_ID, PHASE117_FAMILY_ID, PHASE117_FAMILY_ID, PHASE117_FAMILY_ID, PHASE117_FAMILY_ID, PHASE117_FAMILY_ID, PHASE117_FAMILY_ID] })).rows[0];
  if (Number(familyCounts?.publications) || Number(familyCounts?.topology) || Number(familyCounts?.specs) || Number(familyCounts?.variants) || Number(familyCounts?.scopes) || Number(familyCounts?.claims) || Number(familyCounts?.evidence) || Number(familyCounts?.media) !== 1) throw new Error("Phase 117 article retained pen-only payload or lost primary media.");
  const hashes: string[] = [];
  for (const [id, slug, marker, sibling] of [[PHASE117_AUROLOIDE_ID, PHASE117_AUROLOIDE_SLUG, markers[1], PHASE117_RESINA_SLUG], [PHASE117_RESINA_ID, PHASE117_RESINA_SLUG, markers[2], PHASE117_AUROLOIDE_SLUG]] as const) {
    const row = byId.get(id); const hash = await computePublicationContentHash(client, id); hashes.push(hash);
    if (!row || row.type !== "pen" || row.slug !== slug || row.source !== marker || row.status !== "published" || row.approved_content_hash !== hash || Number(row.is_public) !== 1 || Array.from(String(row.summary)).length < 60 || Array.from(String(row.body_md)).length < 2000 || !String(row.body_md).includes("/article/aurora-optima") || !String(row.body_md).includes(`/pen/${sibling}`)) throw new Error("Phase 117 terminal pen content/publication is invalid; automatic repair is forbidden.");
    const links = await client.execute({ sql: "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY link_type", args: [id, id] });
    if (links.rows.length !== 2 || links.rows[0]?.source_id !== id || links.rows[0]?.target_id !== PHASE117_AURORA_BRAND_ID || links.rows[0]?.link_type !== "made_by" || links.rows[1]?.source_id !== PHASE117_AURORA_BRAND_ID || links.rows[1]?.target_id !== id || links.rows[1]?.link_type !== "reverse") throw new Error("Phase 117 terminal maker topology is invalid; automatic repair is forbidden.");
    const counts = (await client.execute({ sql: `SELECT
      (SELECT count(*) FROM fact_scopes WHERE entity_id=?) AS scopes,
      (SELECT count(*) FROM claims WHERE subject_entity_id=?) AS claims,
      (SELECT count(*) FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='rejected') AS rejected,
      (SELECT count(*) FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved') AS media,
      (SELECT count(*) FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media','publication')) AS reviews`, args: [id,id,id,id,id,hash] })).rows[0];
    const expectedScopes = id === PHASE117_AUROLOIDE_ID ? 3 : 4;
    const expectedClaims = 3;
    if (Number(counts?.scopes) !== expectedScopes || Number(counts?.claims) !== expectedClaims || Number(counts?.rejected) < 2 || Number(counts?.media) !== 1 || Number(counts?.reviews) !== 4) throw new Error("Phase 117 terminal scope/evidence/media/reviews invalid; automatic repair is forbidden.");
  }
  const brandHash = await computePublicationContentHash(client, PHASE117_AURORA_BRAND_ID);
  const brand = (await client.execute({ sql: "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?", args: [PHASE117_AURORA_BRAND_ID] })).rows[0];
  if (brand?.status !== "published" || brand.approved_content_hash !== brandHash) throw new Error("Phase 117 Aurora post-topology publication invalid; automatic repair is forbidden.");
  return hashes;
}
export async function applyPhase117AuroraOptimaFamilyCurrentPensContent(client: Client, options: ApplyPhase117Options): Promise<ApplyPhase117Result> {
  const workspaceRoot = await assertAuthority(client, options);
  const familyCopy = loadFamilyCopy(workspaceRoot);
  const auroloide = loadPhase117AuroraOptimaAuroloide996DorPack(workspaceRoot);
  const resina = loadPhase117AuroraOptimaResina997CnPack(workspaceRoot);
  const markers: [string,string,string] = [familyCopy.sourceMarker, auroloide.sourceMarker, resina.sourceMarker];
  const baseline = await assertBaseline(client);
  const state = await inspectTargets(client, markers, baseline);
  if (state === "terminal") {
    const hashes = await assertTerminal(client, markers);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return { entities: [{ entityId: PHASE117_FAMILY_ID, outcome: "noop", contentHash: hashes[0] }, { entityId: PHASE117_AUROLOIDE_ID, outcome: "noop", contentHash: hashes[0] }, { entityId: PHASE117_RESINA_ID, outcome: "noop", contentHash: hashes[1] }] };
  }
  const protectedIds = [
    PHASE117_AURORA_88_FAMILY_ID,
    PHASE117_RESINA_800_ID,
    PHASE117_IPSILON_FAMILY_ID,
    PHASE117_IPSILON_DEMO_ID,
    PHASE117_IPSILON_RESIN_ID,
  ];
  const protectedBefore = new Map<string,string>();
  for (const id of protectedIds) protectedBefore.set(id, await payloadDigest(client, id, true));
  const brandPayloadBefore = await payloadDigest(client, PHASE117_AURORA_BRAND_ID, false);
  const brandHashBefore = await computePublicationContentHash(client, PHASE117_AURORA_BRAND_ID);
  const reverseBefore = await jsonRows(client, "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id", [PHASE117_AURORA_BRAND_ID]);
  const tx = await client.transaction("write");
  try {
    await deleteOwnedPayload(tx, PHASE117_FAMILY_ID);
    await tx.execute({ sql: "DELETE FROM entity_content_reviews WHERE entity_id=?", args: [PHASE117_FAMILY_ID] });
    await tx.execute({ sql: "DELETE FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse')", args: [PHASE117_FAMILY_ID, PHASE117_FAMILY_ID] });
    const reclassified = await tx.execute({
      sql: `UPDATE entities
            SET type='article',slug=?,name=?,summary=?,body_md=?,source=?,source_url=NULL,
                updated_at=datetime('now')
            WHERE id=? AND type='pen' AND slug=?`,
      args: [
        PHASE117_FAMILY_SLUG,
        PHASE117_FAMILY_NAME,
        familyCopy.summary,
        familyCopy.bodyMd,
        familyCopy.sourceMarker,
        PHASE117_FAMILY_ID,
        PHASE117_FAMILY_SLUG,
      ],
    });
    if (reclassified.rowsAffected !== 1) throw new Error("Phase 117 family identity changed before atomic reclassification.");
    await tx.execute({ sql: "DELETE FROM entity_publications WHERE entity_id=?", args: [PHASE117_FAMILY_ID] });
    for (const [id,slug,name] of [[PHASE117_AUROLOIDE_ID,PHASE117_AUROLOIDE_SLUG,PHASE117_AUROLOIDE_NAME],[PHASE117_RESINA_ID,PHASE117_RESINA_SLUG,PHASE117_RESINA_NAME]] as const) {
      await tx.execute({ sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)", args: [id,slug,name] });
      await tx.execute({ sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)", args: [stableId("phase117-made-by", `${id}:${PHASE117_AURORA_BRAND_ID}`), id, PHASE117_AURORA_BRAND_ID, "Phase 117 exact Optima maker relation"] });
      await tx.execute({ sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)", args: [stableId("phase117-reverse", `${PHASE117_AURORA_BRAND_ID}:${id}`), PHASE117_AURORA_BRAND_ID, id, "Phase 117 Aurora-to-Optima public navigation"] });
    }
    const actionKey = `${PHASE117_FAMILY_ID}:pen->article:${PHASE117_AUROLOIDE_ID}:${PHASE117_RESINA_ID}`;
    const checksum = createHash("sha256").update(actionKey).digest("hex");
    const batchId = stableId("phase117-batch", actionKey);
    await tx.execute({
      sql: "INSERT INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)",
      args: [batchId, actionKey, checksum, "Reclassify Aurora Optima as a family article and create exact 996-DOR/997-CN pens."],
    });
    await tx.execute({
      sql: `INSERT INTO taxonomy_actions(
              id,batch_id,source_row_key,action_kind,action_checksum,
              source_entity_id,target_entity_id,status,note
            ) VALUES(?,?,?,'rename',?,?,?,'applied',?)`,
      args: [
        stableId("phase117-action", actionKey),
        batchId,
        PHASE117_FAMILY_SLUG,
        checksum,
        PHASE117_FAMILY_ID,
        PHASE117_FAMILY_ID,
        "Same-ID Optima pen-to-article reclassification; exact current SKUs receive immutable identities.",
      ],
    });
    await tx.commit();
  } catch (error) { if (!tx.closed) await tx.rollback(); throw error; }
  if (await payloadDigest(client, PHASE117_AURORA_BRAND_ID, false) !== brandPayloadBefore) throw new Error("Phase 117 changed Aurora non-topology payload.");
  const reverseAfter = await jsonRows(client, "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id", [PHASE117_AURORA_BRAND_ID]);
  const additions = [{source_id:PHASE117_AURORA_BRAND_ID,target_id:PHASE117_AUROLOIDE_ID,link_type:"reverse"},{source_id:PHASE117_AURORA_BRAND_ID,target_id:PHASE117_RESINA_ID,link_type:"reverse"}];
  const expectedReverse = reverseBefore.filter((row) => row.target_id !== PHASE117_FAMILY_ID).concat(additions).sort((a,b)=>String(a.target_id).localeCompare(String(b.target_id)));
  if (JSON.stringify(reverseAfter) !== JSON.stringify(expectedReverse)) throw new Error("Phase 117 Aurora topology delta is not exactly old-family removal plus two exact pens.");
  const brandHashAfter = await computePublicationContentHash(client, PHASE117_AURORA_BRAND_ID);
  if (brandHashAfter === brandHashBefore) throw new Error("Phase 117 expected Aurora topology hash change.");
  await reviewAndPublish(client, PHASE117_AURORA_BRAND_ID, options.reviewer.trim(), "Phase 117 exact post-topology current hash; Phase 48/114 brand packs not replayed.");
  await installFamilyArticle(client, familyCopy);
  await installPhase117Pack(client, auroloide); await installPhase117Pack(client, resina);
  const auroloideHash = await reviewAndPublish(client, PHASE117_AUROLOIDE_ID, options.reviewer.trim(), `${auroloide.sourceMarker}; Phase 117 checked-in sourced copy.`);
  const resinaHash = await reviewAndPublish(client, PHASE117_RESINA_ID, options.reviewer.trim(), `${resina.sourceMarker}; Phase 117 checked-in sourced copy.`);
  await assertTerminal(client, markers);
  for (const id of protectedIds) if (await payloadDigest(client,id,true) !== protectedBefore.get(id)) throw new Error(`Phase 117 changed protected entity ${id}.`);
  if (await payloadDigest(client,PHASE117_AURORA_BRAND_ID,false) !== brandPayloadBefore) throw new Error("Phase 117 replayed or changed Aurora non-topology payload.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return { entities: [{entityId:PHASE117_FAMILY_ID,outcome:"published",contentHash:auroloideHash},{entityId:PHASE117_AUROLOIDE_ID,outcome:"published",contentHash:auroloideHash},{entityId:PHASE117_RESINA_ID,outcome:"published",contentHash:resinaHash}] };
}
function value(name: string): string | null { const index = process.argv.indexOf(name); return index === -1 ? null : process.argv[index+1] ?? null; }
async function main(): Promise<void> {
  const databasePath=value("--database"), ownedRoot=value("--owned-root"), protectedCatalogPath=value("--protected-catalog");
  const reviewer=value("--reviewer") ?? "phase117-aurora-optima-family-current-pens";
  if (!databasePath || !ownedRoot || !protectedCatalogPath) throw new Error("Usage: tsx scripts/apply-phase117-aurora-optima-family-current-pens-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  const client=createClient({url:`file:${path.resolve(databasePath)}`});
  try { process.stdout.write(`${JSON.stringify(await applyPhase117AuroraOptimaFamilyCurrentPensContent(client,{workspaceRoot:process.cwd(),reviewer,databasePath:path.resolve(databasePath),ownedRoot:path.resolve(ownedRoot),protectedCatalogPath:path.resolve(protectedCatalogPath),protectedCatalogSnapshot:snapshotCatalogFiles(path.resolve(protectedCatalogPath)),env:process.env}),null,2)}\n`); } finally { client.close(); }
}
if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) void main().catch((error)=>{console.error(error instanceof Error?error.message:String(error));process.exitCode=1;});
