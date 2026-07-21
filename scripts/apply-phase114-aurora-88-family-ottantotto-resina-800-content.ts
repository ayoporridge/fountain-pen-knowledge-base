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
  PHASE114_AURORA_BRAND_ID,
  PHASE114_FAMILY_ID,
  PHASE114_FAMILY_SLUG,
  PHASE114_FAMILY_SVG,
  PHASE114_OFFICIAL_URL,
  PHASE114_OPTIMA_ID,
  PHASE114_TARGET_ID,
  PHASE114_TARGET_NAME,
  PHASE114_TARGET_SLUG,
  loadPhase114AuroraOttantottoResina800Pack,
  phase114Aurora88FamilyArticle,
  phase114AuroraOttantottoResina800Pack,
} from "./data/phase114-aurora-88-family-ottantotto-resina-800";
import {
  curatedId,
  packId,
  type CuratedSource,
  type LoadedCuratedEntityPack,
} from "./lib/curated-content-pack";

export {
  PHASE114_AURORA_BRAND_ID,
  PHASE114_FAMILY_ID,
  PHASE114_FAMILY_SLUG,
  PHASE114_OPTIMA_ID,
  PHASE114_TARGET_ID,
  PHASE114_TARGET_SLUG,
};

export type ApplyPhase114Options = ApplyPhase22Options;
export type ApplyPhase114Result = ApplyPhase22Result;

const ALLOWED_REPO_INPUTS = new Set([
  "/Users/xz/CodeBuddy/fountain-pen-graph",
  "/Users/xz/Documents/fountain-pen-graph",
]);
const CANONICAL_REPO = "/Users/xz/Documents/fountain-pen-graph";
const FAMILY_MARKDOWN = ".planning/content-research/aurora-88-family-phase114.md";
const BRAND_MARKER_PREFIX = "curated-content:phase48-aurora-brand-v1:";
const FAMILY_BASELINE_MARKER_PREFIX = "curated-content:phase48-aurora-88-v1:";
const OPTIMA_MARKER_PREFIX = "curated-content:phase48-aurora-optima-v1:";

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FPKG_DATABASE_URL"] as const) {
    if (env[key]?.trim()) throw new Error(`Phase 114 refuses inherited remote database selection: ${key}.`);
  }
}

function assertVerifiedRepoPair(input: string): string {
  if (!ALLOWED_REPO_INPUTS.has(input)) {
    throw new Error("Phase 114 requires the verified CodeBuddy/Documents repo pair.");
  }
  const real = fs.realpathSync.native(input);
  let gitRoot: string;
  try {
    gitRoot = fs.realpathSync.native(
      execFileSync("git", ["-C", input, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim(),
    );
  } catch {
    throw new Error("Phase 114 could not resolve the verified CodeBuddy/Documents repo pair.");
  }
  if (real !== CANONICAL_REPO || gitRoot !== CANONICAL_REPO) {
    throw new Error("Phase 114 verified CodeBuddy/Documents repo pair must resolve to one canonical git root.");
  }
  return real;
}

async function assertAuthority(client: Client, options: ApplyPhase114Options): Promise<string> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 114 reviewer must not be empty.");
  const workspaceRoot = assertVerifiedRepoPair(options.workspaceRoot);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);

  if (fs.lstatSync(options.databasePath).isSymbolicLink()) {
    throw new Error("Phase 114 caller-owned database must not be a symlink.");
  }
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (!fs.statSync(ownedRoot).isDirectory() || !fs.statSync(databasePath).isFile() || !isInside(databasePath, ownedRoot)) {
    throw new Error("Phase 114 requires a regular database inside the caller-owned root.");
  }
  const protectedNames = new Set([protectedPath, `${protectedPath}-wal`, `${protectedPath}-shm`]);
  if (protectedNames.has(databasePath)) throw new Error("Phase 114 refuses the protected catalog or sidecar path.");
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino) {
    throw new Error("Phase 114 refuses a hard-link alias of the protected catalog.");
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 114 client/path mismatch for caller-owned database.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) throw new Error("Phase 114 owned copy must be migrated through 032.");
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
    "SELECT * FROM timeline_events WHERE entity_id=? ORDER BY id",
    "SELECT * FROM media_assets WHERE entity_id=? ORDER BY id",
    ...(includeTopology
      ? [
          "SELECT * FROM entity_publications WHERE entity_id=? ORDER BY entity_id",
          "SELECT * FROM entity_links WHERE source_id=? OR target_id=? ORDER BY id",
        ]
      : []),
  ];
  const payload = [];
  for (const sql of queries) {
    payload.push(await jsonRows(client, sql, sql.includes(" OR ") ? [entityId, entityId] : [entityId]));
  }
  return JSON.stringify(payload);
}

async function assertBaseline(client: Client): Promise<"first" | "terminal"> {
  const baseline = await client.execute({
    sql: `SELECT entity.id,entity.type,entity.slug,entity.source,publication.status,
                 CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
          FROM entities entity
          LEFT JOIN entity_publications publication ON publication.entity_id=entity.id
          LEFT JOIN public_entities public ON public.id=entity.id
          WHERE entity.id IN (?,?,?) ORDER BY entity.id`,
    args: [PHASE114_AURORA_BRAND_ID, PHASE114_FAMILY_ID, PHASE114_OPTIMA_ID],
  });
  const byId = new Map(baseline.rows.map((row) => [String(row.id), row]));
  const brand = byId.get(PHASE114_AURORA_BRAND_ID);
  const family = byId.get(PHASE114_FAMILY_ID);
  const optima = byId.get(PHASE114_OPTIMA_ID);
  if (!brand || brand.type !== "brand" || brand.slug !== "aurora" || brand.status !== "published" || Number(brand.is_public) !== 1 || !String(brand.source).startsWith(BRAND_MARKER_PREFIX)) {
    throw new Error("Phase 114 requires the exact published Phase 48 Aurora brand baseline; a terminal topology mutation invalidates its reviewed current hash.");
  }
  if (!optima || optima.type !== "pen" || optima.slug !== "aurora-optima" || optima.status !== "published" || Number(optima.is_public) !== 1 || !String(optima.source).startsWith(OPTIMA_MARKER_PREFIX)) {
    throw new Error("Phase 114 requires the exact published Phase 48 Aurora Optima baseline.");
  }
  const first = family?.type === "pen" && family.slug === PHASE114_FAMILY_SLUG && family.status === "published" && Number(family.is_public) === 1 && String(family.source).startsWith(FAMILY_BASELINE_MARKER_PREFIX);
  const terminal = family?.type === "article" && family.slug === PHASE114_FAMILY_SLUG && family.status == null && Number(family.is_public) === 1 && String(family.source).startsWith(phase114Aurora88FamilyArticle.sourceMarkerPrefix);
  if (!first && !terminal) {
    throw new Error("Phase 114 requires either the exact Phase 48 Aurora 88 pen baseline or the complete Phase 114 family article terminal identity.");
  }
  const articleReference = await client.execute({
    sql: `SELECT reference.entity_id FROM entity_references reference
          JOIN source_items item ON item.id=reference.source_item_id
          WHERE item.url=?`,
    args: [PHASE114_OFFICIAL_URL],
  });
  if (
    articleReference.rows.some(
      (row) =>
        row.entity_id !== PHASE114_FAMILY_ID && row.entity_id !== PHASE114_TARGET_ID,
    )
  ) {
    throw new Error(
      `Phase 114 only allows the Aurora 88 family article reference to the exact 800 URL; owners=${JSON.stringify(articleReference.rows.map((row) => String(row.entity_id)))}`,
    );
  }
  const routeCollision = await client.execute({
    sql: "SELECT redirect_kind,target_path FROM entity_redirects WHERE source_path='/pen/aurora-88'",
  });
  if (routeCollision.rows.length > 0) {
    throw new Error("Phase 114 route collision: /pen/aurora-88 must be owned only by the static article route map.");
  }
  return first ? "first" : "terminal";
}

async function inspectTarget(client: Client, sourceMarker: string): Promise<"absent" | "terminal"> {
  const collisions = await client.execute({
    sql: `SELECT DISTINCT entity.id,entity.type,entity.slug,entity.name,entity.source
          FROM entities entity
          LEFT JOIN entity_aliases alias ON alias.entity_id=entity.id
          LEFT JOIN entity_references reference ON reference.entity_id=entity.id
          LEFT JOIN source_items item ON item.id=reference.source_item_id
          WHERE entity.id=? OR entity.slug=?
             OR lower(entity.name) IN (lower('Aurora Ottantotto Resina (800)'),lower('Aurora Ottantotto Resina 800'),lower('Aurora 88 Resina 800'))
             OR lower(COALESCE(alias.alias,'')) IN (lower('Aurora Ottantotto Resina (800)'),lower('Aurora Ottantotto Resina 800'),lower('Aurora 88 Resina 800'))
             OR entity.source_url=?
             OR (item.url=? AND entity.type='pen')
             OR (entity.source LIKE 'curated-content:phase114-aurora-ottantotto-resina-800-v1:%')
          ORDER BY entity.id`,
    args: [PHASE114_TARGET_ID, PHASE114_TARGET_SLUG, PHASE114_OFFICIAL_URL, PHASE114_OFFICIAL_URL],
  });
  if (collisions.rows.length === 0) return "absent";
  if (collisions.rows.length !== 1) throw new Error("Phase 114 found an alternate exact Aurora 800 pen before first write.");
  const row = collisions.rows[0];
  if (row?.id !== PHASE114_TARGET_ID || row.type !== "pen" || row.slug !== PHASE114_TARGET_SLUG || row.name !== PHASE114_TARGET_NAME) {
    throw new Error("Phase 114 found an alternate exact Aurora 800 pen before first write.");
  }
  if (row.source !== sourceMarker) throw new Error("Phase 114 locked target exists without its exact source marker; repair is forbidden.");
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

function loadFamilyCopy(workspaceRoot: string) {
  const markdown = fs
    .readFileSync(path.resolve(workspaceRoot, FAMILY_MARKDOWN), "utf8")
    .replace(/\r\n?/g, "\n");
  const summary = markdown.match(/^## summary\s*\n+([\s\S]*?)(?=^## )/m)?.[1].trim();
  const bodyMd = markdown.match(/^## body_md\s*\n+([\s\S]*)$/m)?.[1].trim();
  if (!summary || !bodyMd) throw new Error("Phase 114 family reviewed copy is incomplete.");
  const summaryLength = Array.from(summary).length;
  if (summaryLength < 60 || summaryLength > 160 || Array.from(bodyMd).length < 2_000) {
    throw new Error("Phase 114 family reviewed copy violates summary/body length contract.");
  }
  if (!bodyMd.includes(`/pen/${PHASE114_TARGET_SLUG}`)) {
    throw new Error("Phase 114 family reviewed copy is missing exact 800 navigation.");
  }
  const digest = createHash("sha256").update(`${summary}\0${bodyMd}`).digest("hex");
  return {
    summary,
    bodyMd,
    sourceMarker: `${phase114Aurora88FamilyArticle.sourceMarkerPrefix}${digest}`,
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

async function upsertPhase114Sources(
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
        `Phase 114 curated source registry: ${source.registryKey}`,
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
    await upsertPhase114Sources(transaction, phase114Aurora88FamilyArticle);
    const updated = await transaction.execute({
      sql: `UPDATE entities SET name=?,summary=?,body_md=?,source=?,source_url=NULL,
                   updated_at=datetime('now')
            WHERE id=? AND type='article' AND slug=?`,
      args: [
        phase114Aurora88FamilyArticle.canonicalName,
        copy.summary,
        copy.bodyMd,
        copy.sourceMarker,
        PHASE114_FAMILY_ID,
        PHASE114_FAMILY_SLUG,
      ],
    });
    if (updated.rowsAffected !== 1) {
      throw new Error("Phase 114 family identity changed before article payload install.");
    }
    await transaction.execute({
      sql: `INSERT INTO stories(
              id,entity_id,title,story_type,summary,body_md,status,source_notes
            ) VALUES(?,?,?,'overview',?,?,'published',?)`,
      args: [
        stableId("phase114-family-story", PHASE114_FAMILY_ID),
        PHASE114_FAMILY_ID,
        phase114Aurora88FamilyArticle.storyTitle,
        copy.summary,
        copy.bodyMd,
        copy.sourceMarker,
      ],
    });
    for (const source of phase114Aurora88FamilyArticle.sources) {
      await transaction.execute({
        sql: `INSERT INTO entity_references(
                id,entity_id,source_item_id,relation_type,note,review_status
              ) VALUES(?,?,?,?,?,'approved')`,
        args: [
          stableId("phase114-family-reference", source.key),
          PHASE114_FAMILY_ID,
          sourceItemId(source.key),
          source.sourceType === "official" ? "official" : source.itemType === "image" ? "reference" : "review",
          source.summary,
        ],
      });
    }
    const image = phase114Aurora88FamilyArticle.primaryImage;
    await transaction.execute({
      sql: `INSERT INTO media_assets(
              id,entity_id,title,asset_type,local_path,author,license,
              attribution_text,source_url,source_item_id,review_status,usage_status
            ) VALUES(?,?,?,'image',?,?,?,?,?,?,'approved','primary')`,
      args: [
        stableId("phase114-family-media", PHASE114_FAMILY_ID),
        PHASE114_FAMILY_ID,
        image.title,
        PHASE114_FAMILY_SVG,
        image.author ?? null,
        image.license ?? null,
        "本站原创 Aurora 88 家族时间线与型号导航事实图；非产品照片，不证明比例、颜色、饰面或跨代共享规格。",
        PHASE114_FAMILY_SVG,
        sourceItemId(image.key),
      ],
    });
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

async function installPhase114Pack(
  client: Client,
  pack: LoadedCuratedEntityPack,
): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    await upsertPhase114Sources(transaction, pack);
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
    if (updated.rowsAffected !== 1) throw new Error("Phase 114 target identity changed before payload install.");
    const publication = await transaction.execute({
      sql: "UPDATE entity_publications SET depth_tier=?,updated_at=datetime('now') WHERE entity_id=?",
      args: [pack.depthTier, pack.entityId],
    });
    if (publication.rowsAffected !== 1) throw new Error("Phase 114 target publication row is missing.");

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
      if (!source) throw new Error(`Phase 114 alias source missing: ${alias.sourceKey}`);
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
        if (!scopeId) throw new Error(`Phase 114 claim scope missing: ${item.scopeKey}`);
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
    if (!pack.spec) throw new Error("Phase 114 target pack requires model specs.");
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
      if (!scopeId) throw new Error(`Phase 114 spec scope missing: ${item.scopeKey}`);
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
        if (!citationId) throw new Error(`Phase 114 conflict citation missing: ${member.citationKey}`);
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
  const currentHash = await computePublicationContentHash(client, PHASE114_AURORA_BRAND_ID);
  if (currentHash !== expectedHash) throw new Error("Phase 114 Aurora post-topology current hash changed unexpectedly.");
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE114_AURORA_BRAND_ID,
      reviewKind,
      reviewer,
      status: "approved",
      notes: `Phase 114 ${reviewKind} review for exact post-topology current hash; Phase 41/48 Aurora brand pack not replayed.`,
    });
  }
  await publishEntity(client, { entityId: PHASE114_AURORA_BRAND_ID, reviewer });
}

async function assertTerminal(
  client: Client,
  targetMarker: string,
  familyMarker: string,
): Promise<string> {
  const family = await client.execute({
    sql: `SELECT entity.type,entity.slug,entity.name,entity.source,entity.summary,entity.body_md,
                 CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
          FROM entities entity LEFT JOIN public_entities public ON public.id=entity.id
          WHERE entity.id=?`,
    args: [PHASE114_FAMILY_ID],
  });
  const familyRow = family.rows[0];
  if (!familyRow || familyRow.type !== "article" || familyRow.slug !== PHASE114_FAMILY_SLUG || familyRow.source !== familyMarker || Number(familyRow.is_public) !== 1 || Array.from(String(familyRow.summary)).length < 60 || Array.from(String(familyRow.summary)).length > 160 || Array.from(String(familyRow.body_md)).length < 2_000 || !String(familyRow.body_md).includes(`/pen/${PHASE114_TARGET_SLUG}`)) {
    throw new Error(`Phase 114 terminal family article identity/content state is invalid; automatic repair is forbidden: ${JSON.stringify({ type: familyRow?.type, slug: familyRow?.slug, sourceMatches: familyRow?.source === familyMarker, isPublic: familyRow?.is_public, summaryLength: Array.from(String(familyRow?.summary ?? "")).length, bodyLength: Array.from(String(familyRow?.body_md ?? "")).length, hasTargetLink: String(familyRow?.body_md ?? "").includes(`/pen/${PHASE114_TARGET_SLUG}`) })}`);
  }
  const familyPayload = await client.execute({
    sql: `SELECT
            (SELECT count(*) FROM entity_publications WHERE entity_id=?) AS publications,
            (SELECT count(*) FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse')) AS topology,
            (SELECT count(*) FROM model_specs WHERE entity_id=?) AS specs,
            (SELECT count(*) FROM model_variants WHERE model_entity_id=?) AS variants,
            (SELECT count(*) FROM fact_scopes WHERE entity_id=?) AS scopes,
            (SELECT count(*) FROM claims WHERE subject_entity_id=?) AS claims,
            (SELECT count(*) FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved') AS primary_media,
            (SELECT count(*) FROM entity_references WHERE entity_id=? AND review_status='approved') AS refs`,
    args: [PHASE114_FAMILY_ID, PHASE114_FAMILY_ID, PHASE114_FAMILY_ID, PHASE114_FAMILY_ID, PHASE114_FAMILY_ID, PHASE114_FAMILY_ID, PHASE114_FAMILY_ID, PHASE114_FAMILY_ID, PHASE114_FAMILY_ID],
  });
  const familyCounts = familyPayload.rows[0];
  if (Number(familyCounts?.publications) !== 0 || Number(familyCounts?.topology) !== 0 || Number(familyCounts?.specs) !== 0 || Number(familyCounts?.variants) !== 0 || Number(familyCounts?.scopes) !== 0 || Number(familyCounts?.claims) !== 0 || Number(familyCounts?.primary_media) !== 1 || Number(familyCounts?.refs) !== phase114Aurora88FamilyArticle.sources.length) {
    throw new Error("Phase 114 terminal family article retained pen-only payload or lost reviewed navigation evidence.");
  }

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
    args: [PHASE114_TARGET_ID],
  });
  const row = target.rows[0];
  const currentHash = await computePublicationContentHash(client, PHASE114_TARGET_ID);
  if (!row || row.type !== "pen" || row.slug !== PHASE114_TARGET_SLUG || row.name !== PHASE114_TARGET_NAME || row.source !== targetMarker || row.status !== "published" || row.approved_content_hash !== currentHash || Number(row.blocker_count) !== 0 || Number(row.publishable) !== 1 || Number(row.is_public) !== 1) {
    throw new Error("Phase 114 terminal identity/source/publication state is invalid; automatic repair is forbidden.");
  }
  const topology = await client.execute({
    sql: "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse') ORDER BY link_type",
    args: [PHASE114_TARGET_ID, PHASE114_TARGET_ID],
  });
  if (topology.rows.length !== 2 || topology.rows[0]?.source_id !== PHASE114_TARGET_ID || topology.rows[0]?.target_id !== PHASE114_AURORA_BRAND_ID || topology.rows[0]?.link_type !== "made_by" || topology.rows[1]?.source_id !== PHASE114_AURORA_BRAND_ID || topology.rows[1]?.target_id !== PHASE114_TARGET_ID || topology.rows[1]?.link_type !== "reverse") {
    throw new Error("Phase 114 terminal made_by/reverse topology is invalid; automatic repair is forbidden.");
  }
  const evidence = await client.execute({
    sql: `SELECT
            (SELECT count(*) FROM fact_scopes WHERE entity_id=?) AS scopes,
            (SELECT count(*) FROM claims WHERE subject_entity_id=?) AS claims,
            (SELECT count(*) FROM claims WHERE subject_entity_id=? AND predicate='qualified_family_high_end_claim') AS qualified_family_claims,
            (SELECT count(*) FROM claims WHERE subject_entity_id=? AND predicate='dated_sample_observation' AND fact_class='editorial') AS sample_claims,
            (SELECT count(*) FROM spec_field_evidence evidence JOIN model_specs spec ON spec.id=evidence.model_spec_id WHERE spec.entity_id=? AND evidence.review_status='rejected') AS rejected_spec_evidence,
            (SELECT count(*) FROM media_assets WHERE entity_id=? AND usage_status='primary' AND review_status='approved') AS primary_media,
            (SELECT count(*) FROM entity_content_reviews WHERE entity_id=? AND content_hash=? AND status='approved' AND review_kind IN ('fact','language','media','publication')) AS reviews`,
    args: [PHASE114_TARGET_ID, PHASE114_TARGET_ID, PHASE114_TARGET_ID, PHASE114_TARGET_ID, PHASE114_TARGET_ID, PHASE114_TARGET_ID, PHASE114_TARGET_ID, currentHash],
  });
  const counts = evidence.rows[0];
  if (
    Number(counts?.scopes) !== 4 ||
    Number(counts?.claims) !== 4 ||
    Number(counts?.qualified_family_claims) !== 1 ||
    Number(counts?.sample_claims) !== 1 ||
    Number(counts?.rejected_spec_evidence) < 3 ||
    Number(counts?.primary_media) !== 1 ||
    Number(counts?.reviews) !== 4
  ) {
    throw new Error("Phase 114 terminal scope/evidence/media/review state is invalid; automatic repair is forbidden.");
  }
  const brandHash = await computePublicationContentHash(client, PHASE114_AURORA_BRAND_ID);
  const brandPublication = await client.execute({
    sql: "SELECT status,approved_content_hash FROM entity_publications WHERE entity_id=?",
    args: [PHASE114_AURORA_BRAND_ID],
  });
  if (brandPublication.rows[0]?.status !== "published" || brandPublication.rows[0]?.approved_content_hash !== brandHash) {
    throw new Error("Phase 114 terminal Aurora post-topology publication is invalid; automatic repair is forbidden.");
  }
  return currentHash;
}

export async function applyPhase114Aurora88FamilyOttantottoResina800Content(
  client: Client,
  options: ApplyPhase114Options,
): Promise<ApplyPhase114Result> {
  const workspaceRoot = await assertAuthority(client, options);
  const pack = loadPhase114AuroraOttantottoResina800Pack(workspaceRoot);
  const familyCopy = loadFamilyCopy(workspaceRoot);
  const baselineState = await assertBaseline(client);
  const targetState = await inspectTarget(client, pack.sourceMarker);
  if (baselineState === "terminal" || targetState === "terminal") {
    if (baselineState !== "terminal" || targetState !== "terminal") {
      throw new Error("Phase 114 partial terminal identity is invalid; automatic repair is forbidden.");
    }
    const contentHash = await assertTerminal(client, pack.sourceMarker, familyCopy.sourceMarker);
    assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
    return { entities: [
      { entityId: PHASE114_FAMILY_ID, outcome: "noop", contentHash },
      { entityId: PHASE114_TARGET_ID, outcome: "noop", contentHash },
    ] };
  }

  const optimaBefore = await payloadDigest(client, PHASE114_OPTIMA_ID, true);
  const brandPayloadBefore = await payloadDigest(client, PHASE114_AURORA_BRAND_ID, false);
  const brandHashBefore = await computePublicationContentHash(client, PHASE114_AURORA_BRAND_ID);
  const reverseBefore = await jsonRows(client, "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id", [PHASE114_AURORA_BRAND_ID]);
  const transaction = await client.transaction("write");
  try {
    await deleteOwnedPayload(transaction, PHASE114_FAMILY_ID);
    await transaction.execute({ sql: "DELETE FROM entity_content_reviews WHERE entity_id=?", args: [PHASE114_FAMILY_ID] });
    await transaction.execute({ sql: "DELETE FROM entity_links WHERE (source_id=? OR target_id=?) AND link_type IN ('made_by','reverse')", args: [PHASE114_FAMILY_ID, PHASE114_FAMILY_ID] });
    const reclassified = await transaction.execute({
      sql: "UPDATE entities SET type='article',slug=?,name=?,summary=?,body_md=?,source=?,source_url=NULL,updated_at=datetime('now') WHERE id=? AND type='pen' AND slug=?",
      args: [PHASE114_FAMILY_SLUG, phase114Aurora88FamilyArticle.canonicalName, familyCopy.summary, familyCopy.bodyMd, familyCopy.sourceMarker, PHASE114_FAMILY_ID, PHASE114_FAMILY_SLUG],
    });
    if (reclassified.rowsAffected !== 1) throw new Error("Phase 114 family identity changed before atomic reclassification.");
    // The migration's entity-type trigger creates a fresh draft whenever a
    // governed pen becomes an article. Remove that trigger-created lifecycle
    // row so the article uses the legacy non-governed public branch.
    await transaction.execute({ sql: "DELETE FROM entity_publications WHERE entity_id=?", args: [PHASE114_FAMILY_ID] });
    await transaction.execute({
      sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,'pen',?,?)",
      args: [PHASE114_TARGET_ID, PHASE114_TARGET_SLUG, PHASE114_TARGET_NAME],
    });
    await transaction.execute({
      sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'made_by',?)",
      args: [stableId("phase114-made-by", `${PHASE114_TARGET_ID}:${PHASE114_AURORA_BRAND_ID}`), PHASE114_TARGET_ID, PHASE114_AURORA_BRAND_ID, "Phase 114 exact Aurora 800 maker relation"],
    });
    await transaction.execute({
      sql: "INSERT OR IGNORE INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,'reverse',?)",
      args: [stableId("phase114-reverse", `${PHASE114_AURORA_BRAND_ID}:${PHASE114_TARGET_ID}`), PHASE114_AURORA_BRAND_ID, PHASE114_TARGET_ID, "Phase 114 Aurora-to-exact-800 public navigation"],
    });
    const actionKey = `${PHASE114_FAMILY_ID}:pen->article:${PHASE114_TARGET_ID}`;
    const checksum = createHash("sha256").update(actionKey).digest("hex");
    const batchId = stableId("phase114-batch", actionKey);
    await transaction.execute({
      sql: "INSERT INTO taxonomy_batches(id,source_key,source_checksum,status,note) VALUES(?,?,?,'applied',?)",
      args: [batchId, actionKey, checksum, "Reclassify Aurora 88 as family article and create exact Resina 800 pen."],
    });
    await transaction.execute({
      sql: `INSERT INTO taxonomy_actions(
              id,batch_id,source_row_key,action_kind,action_checksum,
              source_entity_id,target_entity_id,status,note
            ) VALUES(?,?,?,'rename',?,?,?,'applied',?)`,
      args: [stableId("phase114-action", actionKey), batchId, PHASE114_FAMILY_SLUG, checksum, PHASE114_FAMILY_ID, PHASE114_FAMILY_ID, "Same-ID pen-to-article family reclassification; exact SKU gets a new immutable identity."],
    });
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }

  if (await payloadDigest(client, PHASE114_OPTIMA_ID, true) !== optimaBefore) throw new Error("Phase 114 changed the protected Aurora Optima payload/topology.");
  if (await payloadDigest(client, PHASE114_AURORA_BRAND_ID, false) !== brandPayloadBefore) throw new Error("Phase 114 changed Aurora non-topology payload or Phase 48 source marker.");
  const reverseAfter = await jsonRows(client, "SELECT source_id,target_id,link_type FROM entity_links WHERE source_id=? AND link_type='reverse' ORDER BY target_id", [PHASE114_AURORA_BRAND_ID]);
  const expectedReverse = reverseBefore.filter((row) => row.target_id !== PHASE114_FAMILY_ID).concat([{ source_id: PHASE114_AURORA_BRAND_ID, target_id: PHASE114_TARGET_ID, link_type: "reverse" }]).sort((a, b) => String(a.target_id).localeCompare(String(b.target_id)));
  if (JSON.stringify(reverseAfter) !== JSON.stringify(expectedReverse)) throw new Error("Phase 114 Aurora topology delta is not exactly family removal plus target addition.");
  const brandHashAfter = await computePublicationContentHash(client, PHASE114_AURORA_BRAND_ID);
  if (brandHashAfter === brandHashBefore) throw new Error("Phase 114 expected Aurora topology hash change.");
  await reviewAndPublishBrand(client, options.reviewer.trim(), brandHashAfter);

  await installFamilyArticle(client, familyCopy);
  await installPhase114Pack(client, pack);
  for (const reviewKind of ["fact", "language", "media"] as const) {
    await recordEntityContentReview(client, {
      entityId: PHASE114_TARGET_ID,
      reviewKind,
      reviewer: options.reviewer.trim(),
      status: "approved",
      notes: `${pack.sourceMarker}; ${reviewKind} review of Phase 114 checked-in sourced copy.`,
    });
  }
  const published = await publishEntity(client, {
    entityId: PHASE114_TARGET_ID,
    reviewer: options.reviewer.trim(),
  });
  const result: ApplyPhase114Result = {
    entities: [
      {
        entityId: PHASE114_FAMILY_ID,
        outcome: "published",
        contentHash: published.contentHash,
      },
      {
        entityId: PHASE114_TARGET_ID,
        outcome: "published",
        contentHash: published.contentHash,
      },
    ],
  };
  await assertTerminal(client, pack.sourceMarker, familyCopy.sourceMarker);
  if (await payloadDigest(client, PHASE114_OPTIMA_ID, true) !== optimaBefore) throw new Error("Phase 114 changed the protected Aurora Optima after publish.");
  if (await payloadDigest(client, PHASE114_AURORA_BRAND_ID, false) !== brandPayloadBefore) throw new Error("Phase 114 replayed or changed the Phase 41/48 Aurora brand pack.");
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
  const reviewer = value("--reviewer") ?? "phase114-aurora-88-family-ottantotto-resina-800";
  if (!databasePath || !ownedRoot || !protectedCatalogPath) {
    throw new Error("Usage: tsx scripts/apply-phase114-aurora-88-family-ottantotto-resina-800-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]");
  }
  const resolvedDatabase = path.resolve(databasePath);
  const resolvedOwnedRoot = path.resolve(ownedRoot);
  const resolvedProtected = path.resolve(protectedCatalogPath);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase114Aurora88FamilyOttantottoResina800Content(client, {
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
