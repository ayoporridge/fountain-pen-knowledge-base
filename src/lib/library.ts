import { queryAll, queryOne } from "@/lib/db";
import { dedupeByEntityIdentity } from "@/lib/entity-identity";

export interface StoryRecord {
  id: string;
  title: string;
  story_type: string;
  summary: string | null;
  body_md: string;
  status: string;
}

export interface TimelineEventRecord {
  id: string;
  title: string;
  event_type: string;
  start_date: string;
  end_date: string | null;
  circa: number;
  description: string | null;
  review_status: string;
  source_title: string | null;
  source_url: string | null;
}

export interface DiagramRecord {
  id: string;
  entity_type?: string | null;
  entity_slug?: string | null;
  entity_name?: string | null;
  slug: string;
  title: string;
  diagram_type: string;
  svg: string;
  hotspots_json: string | null;
  source_note: string | null;
  license: string;
  review_status: string;
}

export interface CommunitySummaryRecord {
  id: string;
  summary_md: string;
  metadata_json: string | null;
  status: string;
  refreshed_at: string | null;
  source_name: string;
  source_type: string;
  entity_type: string;
  entity_slug: string;
  entity_name: string;
  entity_summary: string | null;
}

export interface SourceItemRecord {
  id: string;
  source_id: string;
  source_name: string;
  source_type: string;
  title: string;
  url: string;
  item_type: string;
  license: string | null;
  allowed_use: string | null;
  review_status: string;
  reference_count: number;
}

export interface SourceRegistryRecord {
  id: string;
  name: string;
  source_type: string;
  allowed_use: string;
  reliability: string;
  license: string | null;
  attribution: string | null;
  homepage_url: string | null;
  fetch_method: string;
  notes: string | null;
  item_count: number;
  reference_count: number;
}

export interface CitationRecord {
  id: string;
  target_type: string;
  target_id: string;
  note: string | null;
  claim_id: string | null;
  claim_predicate: string | null;
  claim_text: string | null;
  source_title: string | null;
  source_url: string | null;
  source_name: string | null;
  allowed_use: string | null;
  source_review_status: string | null;
}

export interface ClaimRecord {
  id: string;
  predicate: string;
  object_text: string | null;
  object_entity_type: string | null;
  object_entity_slug: string | null;
  object_entity_name: string | null;
  evidence_locator: string | null;
  confidence: number;
  review_status: string;
  source_title: string | null;
  source_url: string | null;
  source_name: string | null;
  allowed_use: string | null;
}

export interface ExternalIdRecord {
  id: string;
  provider: string;
  external_id: string;
  url: string | null;
  metadata_json: string | null;
}

export interface EntityAliasRecord {
  id: string;
  alias: string;
  language: string;
  source_name: string | null;
}

export interface MediaAssetRecord {
  id: string;
  title: string;
  asset_type: string;
  image_url: string | null;
  thumbnail_url: string | null;
  source_url: string | null;
  author: string | null;
  license: string | null;
  attribution_text: string | null;
  review_status: string;
  usage_status: string;
  source_title: string | null;
  source_name: string | null;
  entity_type: string | null;
  entity_slug: string | null;
  entity_name: string | null;
}

export interface ProductImageRecord {
  id: string;
  title: string;
  image_url: string;
  thumbnail_url: string | null;
  source_url: string | null;
  author: string | null;
  license: string | null;
  attribution_text: string | null;
  source_title: string | null;
  source_name: string | null;
}

export interface ModelSpecRecord {
  id: string;
  series_name: string | null;
  release_year: string | null;
  origin_country: string | null;
  nib: string | null;
  fill_system: string | null;
  material: string | null;
  dimensions: string | null;
  weight: string | null;
  price_range: string | null;
  status: string | null;
  review_status: string;
  brand_slug: string | null;
  brand_name: string | null;
}

export interface ModelVariantRecord {
  id: string;
  variant_name: string;
  release_year: string | null;
  notes: string | null;
  review_status: string;
}

export interface RelatedEntityRecord {
  type: string;
  slug: string;
  name: string;
  summary: string | null;
}

export interface ExhibitRecord {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  status: string;
}

export interface ExhibitSectionRecord {
  id: string;
  position: number;
  title: string;
  body_md: string;
  related_entity_slugs_json: string | null;
  diagram_slugs_json: string | null;
  source_item_ids_json: string | null;
}

export interface LibraryCoverageEntityRecord {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  story_count: number;
  claim_count: number;
  reference_count: number;
  media_count: number;
  image_count: number;
  diagram_count: number;
  event_count: number;
  external_id_count: number;
  alias_count: number;
  model_spec_count: number;
  coverage_score: number;
  coverage_status: "ready" | "starter" | "gap";
  missing_items: string[];
}

export interface LibraryCoverageSummaryRecord {
  type: string;
  total: number;
  ready: number;
  starter: number;
  gap: number;
  average_score: number;
  with_stories: number;
  with_claims: number;
  with_references: number;
  with_media: number;
  with_diagrams: number;
  with_events: number;
  with_external_ids: number;
  with_model_specs: number;
}

export interface LibraryCoverageReport {
  summaries: LibraryCoverageSummaryRecord[];
  priorityBrands: LibraryCoverageEntityRecord[];
  priorityPens: LibraryCoverageEntityRecord[];
}

export async function getStoriesForEntity(entityId: string) {
  return (await queryAll(
    `SELECT id, title, story_type, summary, body_md, status
     FROM stories
     WHERE entity_id = ?
     ORDER BY
       CASE status
         WHEN 'published' THEN 0
         WHEN 'reviewed' THEN 1
         WHEN 'draft' THEN 2
         ELSE 3
       END,
       updated_at DESC`,
    [entityId],
  )) as StoryRecord[];
}

export async function getTimelineForEntity(entityId: string, limit = 12) {
  return (await queryAll(
    `SELECT te.id, te.title, te.event_type, te.start_date, te.end_date, te.circa,
            te.description, te.review_status,
            si.title as source_title, si.url as source_url
     FROM timeline_events te
     LEFT JOIN source_items si ON si.id = te.source_item_id
     WHERE te.entity_id = ?
     ORDER BY te.start_date ASC, te.created_at ASC
     LIMIT ?`,
    [entityId, limit],
  )) as TimelineEventRecord[];
}

export async function getRecentTimeline(limit = 100) {
  return (await queryAll(
    `SELECT te.id, te.title, te.event_type, te.start_date, te.end_date, te.circa,
            te.description, te.review_status,
            si.title as source_title, si.url as source_url,
            e.type as entity_type, e.slug as entity_slug, e.name as entity_name
     FROM timeline_events te
     LEFT JOIN entities e ON e.id = te.entity_id
     LEFT JOIN source_items si ON si.id = te.source_item_id
     ORDER BY te.start_date ASC, te.created_at ASC
     LIMIT ?`,
    [limit],
  )) as Array<
    TimelineEventRecord & {
      entity_type: string | null;
      entity_slug: string | null;
      entity_name: string | null;
    }
  >;
}

export async function getDiagramsForEntity(entityId: string) {
  return (await queryAll(
    `SELECT id, slug, title, diagram_type, svg, hotspots_json, source_note, license, review_status
     FROM diagrams
     WHERE entity_id = ? OR entity_id IS NULL
     ORDER BY CASE WHEN entity_id = ? THEN 0 ELSE 1 END, title`,
    [entityId, entityId],
  )) as DiagramRecord[];
}

export async function getDiagramIndex(limit = 80) {
  return (await queryAll(
    `SELECT d.id, d.slug, d.title, d.diagram_type, d.svg, d.hotspots_json,
            d.source_note, d.license, d.review_status,
            e.type as entity_type,
            e.slug as entity_slug,
            e.name as entity_name
     FROM diagrams d
     LEFT JOIN entities e ON e.id = d.entity_id
     ORDER BY
       CASE d.review_status WHEN 'published' THEN 0 WHEN 'reviewed' THEN 1 ELSE 2 END,
       CASE d.diagram_type
         WHEN 'mechanism' THEN 0
         WHEN 'structure' THEN 1
         WHEN 'timeline' THEN 2
         ELSE 3
       END,
       d.title
     LIMIT ?`,
    [limit],
  )) as DiagramRecord[];
}

export async function getModelSpec(entityId: string) {
  return (await queryOne(
    `SELECT ms.*, b.slug as brand_slug, b.name as brand_name
     FROM model_specs ms
     LEFT JOIN entities b ON b.id = ms.brand_entity_id
     WHERE ms.entity_id = ?`,
    [entityId],
  )) as ModelSpecRecord | undefined;
}

export async function getModelVariants(entityId: string) {
  return (await queryAll(
    `SELECT id, variant_name, release_year, notes, review_status
     FROM model_variants
     WHERE model_entity_id = ?
     ORDER BY COALESCE(release_year, ''), variant_name`,
    [entityId],
  )) as ModelVariantRecord[];
}

export async function getBrandRepresentativeModels(entityId: string) {
  const models = (await queryAll(
    `SELECT DISTINCT e.type, e.slug, e.name, e.summary
     FROM entity_links el
     JOIN entities e ON (
       (el.source_id = ? AND e.id = el.target_id)
       OR (el.target_id = ? AND e.id = el.source_id)
     )
     WHERE e.type = 'pen'
     ORDER BY e.name
     LIMIT 24`,
    [entityId, entityId],
  )) as RelatedEntityRecord[];
  return dedupeByEntityIdentity(models).slice(0, 12);
}

export async function getEntityReferences(entityId: string, limit = 8) {
  return (await queryAll(
    `SELECT er.id, sr.id as source_id, sr.name as source_name, sr.source_type,
            si.title, si.url, si.item_type,
            COALESCE(si.allowed_use, sr.allowed_use) as allowed_use,
            COALESCE(si.license, sr.license) as license,
            er.review_status,
            0 as reference_count
     FROM entity_references er
     JOIN source_items si ON si.id = er.source_item_id
     JOIN source_registry sr ON sr.id = si.source_id
     WHERE er.entity_id = ?
     ORDER BY
       CASE er.review_status WHEN 'approved' THEN 0 ELSE 1 END,
       si.title
     LIMIT ?`,
    [entityId, limit],
  )) as SourceItemRecord[];
}

export async function getClaimsForEntity(entityId: string, limit = 8) {
  return (await queryAll(
    `SELECT c.id, c.predicate, c.object_text,
            oe.type as object_entity_type,
            oe.slug as object_entity_slug,
            oe.name as object_entity_name,
            c.evidence_locator,
            c.confidence,
            c.review_status,
            si.title as source_title,
            si.url as source_url,
            sr.name as source_name,
            COALESCE(si.allowed_use, sr.allowed_use) as allowed_use
     FROM claims c
     LEFT JOIN entities oe ON oe.id = c.object_entity_id
     LEFT JOIN source_items si ON si.id = c.source_item_id
     LEFT JOIN source_registry sr ON sr.id = si.source_id
     WHERE c.subject_entity_id = ?
     ORDER BY
       CASE c.review_status
         WHEN 'approved' THEN 0
         WHEN 'pending' THEN 1
         WHEN 'needs_source' THEN 2
         ELSE 3
       END,
       c.confidence DESC,
       c.updated_at DESC
     LIMIT ?`,
    [entityId, limit],
  )) as ClaimRecord[];
}

export async function getCitationsForTarget(
  targetType: string,
  targetId: string,
) {
  return (await queryAll(
    `SELECT c.id, c.target_type, c.target_id, c.note, c.claim_id,
            cl.predicate as claim_predicate,
            cl.object_text as claim_text,
            si.title as source_title,
            si.url as source_url,
            sr.name as source_name,
            COALESCE(si.allowed_use, sr.allowed_use) as allowed_use,
            si.review_status as source_review_status
     FROM citations c
     LEFT JOIN claims cl ON cl.id = c.claim_id
     LEFT JOIN source_items si ON si.id = COALESCE(c.source_item_id, cl.source_item_id)
     LEFT JOIN source_registry sr ON sr.id = si.source_id
     WHERE c.target_type = ? AND c.target_id = ?
     ORDER BY
       CASE si.review_status WHEN 'approved' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END,
       sr.name,
       si.title,
       c.id`,
    [targetType, targetId],
  )) as CitationRecord[];
}

export async function getCitationsForTargets(
  targetType: string,
  targetIds: string[],
) {
  if (targetIds.length === 0) return [] as CitationRecord[];

  const placeholders = targetIds.map(() => "?").join(",");
  return (await queryAll(
    `SELECT c.id, c.target_type, c.target_id, c.note, c.claim_id,
            cl.predicate as claim_predicate,
            cl.object_text as claim_text,
            si.title as source_title,
            si.url as source_url,
            sr.name as source_name,
            COALESCE(si.allowed_use, sr.allowed_use) as allowed_use,
            si.review_status as source_review_status
     FROM citations c
     LEFT JOIN claims cl ON cl.id = c.claim_id
     LEFT JOIN source_items si ON si.id = COALESCE(c.source_item_id, cl.source_item_id)
     LEFT JOIN source_registry sr ON sr.id = si.source_id
     WHERE c.target_type = ? AND c.target_id IN (${placeholders})
     ORDER BY c.target_id, sr.name, si.title, c.id`,
    [targetType, ...targetIds],
  )) as CitationRecord[];
}

export async function getEntityExternalIds(entityId: string) {
  return (await queryAll(
    `SELECT id, provider, external_id, url, metadata_json
     FROM external_ids
     WHERE entity_id = ?
     ORDER BY provider, external_id`,
    [entityId],
  )) as ExternalIdRecord[];
}

export async function getEntityAliases(entityId: string, limit = 24) {
  return (await queryAll(
    `SELECT ea.id, ea.alias, ea.language, sr.name as source_name
     FROM entity_aliases ea
     LEFT JOIN source_registry sr ON sr.id = ea.source_id
     WHERE ea.entity_id = ?
     ORDER BY
       CASE ea.language
         WHEN 'zh' THEN 0
         WHEN 'zh-hans' THEN 1
         WHEN 'en' THEN 2
         ELSE 3
       END,
       ea.alias
     LIMIT ?`,
    [entityId, limit],
  )) as EntityAliasRecord[];
}

export async function getSourceRegistryIndex() {
  return (await queryAll(
    `SELECT sr.id, sr.name, sr.source_type, sr.allowed_use, sr.reliability,
            sr.license, sr.attribution, sr.homepage_url, sr.fetch_method, sr.notes,
            COUNT(DISTINCT si.id) as item_count,
            COUNT(DISTINCT er.id) as reference_count
     FROM source_registry sr
     LEFT JOIN source_items si ON si.source_id = sr.id
     LEFT JOIN entity_references er ON er.source_item_id = si.id
     GROUP BY sr.id
     ORDER BY
       CASE sr.source_type
         WHEN 'official' THEN 0
         WHEN 'wikimedia' THEN 1
         WHEN 'book' THEN 2
         WHEN 'patent' THEN 3
         WHEN 'blog' THEN 4
         WHEN 'reddit' THEN 5
         ELSE 6
       END,
       sr.name`,
  )) as SourceRegistryRecord[];
}

export async function getSourceItemIndex(
  options: {
    limit?: number;
    sourceId?: string | null;
    sourceType?: string | null;
  } = {},
) {
  const limit = options.limit ?? 80;
  const filters: string[] = [];
  const args: unknown[] = [];

  if (options.sourceId) {
    filters.push("sr.id = ?");
    args.push(options.sourceId);
  } else if (options.sourceType) {
    filters.push("sr.source_type = ?");
    args.push(options.sourceType);
  }

  args.push(limit);

  return (await queryAll(
    `SELECT si.id, sr.id as source_id, sr.name as source_name, sr.source_type,
            si.title, si.url, si.item_type,
            COALESCE(si.allowed_use, sr.allowed_use) as allowed_use,
            COALESCE(si.license, sr.license) as license,
            si.review_status,
            COUNT(DISTINCT er.id) as reference_count
     FROM source_items si
     JOIN source_registry sr ON sr.id = si.source_id
     LEFT JOIN entity_references er ON er.source_item_id = si.id
     ${filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : ""}
     GROUP BY si.id
     ORDER BY
       CASE si.review_status WHEN 'approved' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END,
       sr.name,
       si.title
     LIMIT ?`,
    args,
  )) as SourceItemRecord[];
}

export async function getMediaAssetIndex(limit = 80) {
  return (await queryAll(
    `SELECT ma.id, ma.title, ma.asset_type, ma.image_url, ma.thumbnail_url,
            ma.source_url, ma.author, ma.license, ma.attribution_text,
            ma.review_status, ma.usage_status,
            si.title as source_title,
            sr.name as source_name,
            e.type as entity_type,
            e.slug as entity_slug,
            e.name as entity_name
     FROM media_assets ma
     LEFT JOIN source_items si ON si.id = ma.source_item_id
     LEFT JOIN source_registry sr ON sr.id = si.source_id
     LEFT JOIN entities e ON e.id = ma.entity_id
     ORDER BY
       CASE ma.asset_type WHEN 'image' THEN 0 ELSE 1 END,
       CASE ma.review_status WHEN 'approved' THEN 0 WHEN 'needs_license' THEN 1 ELSE 2 END,
       ma.title
     LIMIT ?`,
    [limit],
  )) as MediaAssetRecord[];
}

export async function getPrimaryProductImage(entityId: string) {
  return (await queryOne(
    `SELECT ma.id, ma.title, ma.image_url, ma.thumbnail_url,
            ma.source_url, ma.author, ma.license, ma.attribution_text,
            si.title as source_title,
            sr.name as source_name
     FROM media_assets ma
     LEFT JOIN source_items si ON si.id = ma.source_item_id
     LEFT JOIN source_registry sr ON sr.id = si.source_id
     WHERE ma.entity_id = ?
       AND ma.asset_type = 'image'
       AND ma.image_url IS NOT NULL
       AND ma.review_status = 'approved'
       AND ma.usage_status IN ('primary', 'gallery')
       AND ma.image_url NOT LIKE '/images/library/warm-pen-atlas/%'
       AND COALESCE(ma.source_url, '') NOT LIKE '/images/library/warm-pen-atlas/%'
     ORDER BY
       CASE ma.usage_status WHEN 'primary' THEN 0 ELSE 1 END,
       ma.created_at DESC
     LIMIT 1`,
    [entityId],
  )) as ProductImageRecord | undefined;
}

export async function getCommunitySummaryIndex(limit = 80) {
  return (await queryAll(
    `SELECT cs.id, cs.summary_md, cs.metadata_json, cs.status, cs.refreshed_at,
            sr.name as source_name,
            sr.source_type,
            e.type as entity_type,
            e.slug as entity_slug,
            e.name as entity_name,
            e.summary as entity_summary
     FROM community_summaries cs
     JOIN entities e ON e.id = cs.entity_id
     JOIN source_registry sr ON sr.id = cs.source_id
     ORDER BY
       CASE cs.status WHEN 'published' THEN 0 WHEN 'reviewed' THEN 1 ELSE 2 END,
       e.name
     LIMIT ?`,
    [limit],
  )) as CommunitySummaryRecord[];
}

export async function getLibraryStats() {
  const rows = (await queryAll(
    `SELECT 'sources' as key, COUNT(*) as value FROM source_registry
     UNION ALL SELECT 'claims', COUNT(*) FROM claims
     UNION ALL SELECT 'stories', COUNT(*) FROM stories
     UNION ALL SELECT 'diagrams', COUNT(*) FROM diagrams
     UNION ALL SELECT 'events', COUNT(*) FROM timeline_events
     UNION ALL SELECT 'exhibits', COUNT(*) FROM exhibits
     UNION ALL SELECT 'media', COUNT(*) FROM media_assets
     UNION ALL SELECT 'community', COUNT(*) FROM community_summaries`,
  )) as Array<{ key: string; value: number }>;
  return Object.fromEntries(rows.map((row) => [row.key, Number(row.value)]));
}

type RawCoverageEntity = Omit<
  LibraryCoverageEntityRecord,
  "coverage_score" | "coverage_status" | "missing_items"
>;

function normalizeCoverageRow(row: RawCoverageEntity): RawCoverageEntity {
  return {
    ...row,
    story_count: Number(row.story_count || 0),
    claim_count: Number(row.claim_count || 0),
    reference_count: Number(row.reference_count || 0),
    media_count: Number(row.media_count || 0),
    image_count: Number(row.image_count || 0),
    diagram_count: Number(row.diagram_count || 0),
    event_count: Number(row.event_count || 0),
    external_id_count: Number(row.external_id_count || 0),
    alias_count: Number(row.alias_count || 0),
    model_spec_count: Number(row.model_spec_count || 0),
  };
}

function scoreCoverage(row: RawCoverageEntity) {
  const checks =
    row.type === "brand"
      ? [
          [row.story_count > 0, 2],
          [row.claim_count > 0, 2],
          [row.reference_count > 0, 1],
          [row.event_count > 0, 1],
          [row.media_count > 0, 1],
          [row.external_id_count > 0, 1],
          [row.alias_count >= 2, 1],
        ]
      : [
          [row.story_count > 0, 2],
          [row.model_spec_count > 0, 2],
          [row.claim_count > 0, 2],
          [row.reference_count > 0, 1],
          [row.media_count > 0, 1],
          [row.diagram_count > 0, 1],
          [row.event_count > 0, 1],
        ];

  const total = checks.reduce((sum, [, weight]) => sum + Number(weight), 0);
  const earned = checks.reduce(
    (sum, [passed, weight]) => sum + (passed ? Number(weight) : 0),
    0,
  );
  return Math.round((earned / total) * 100);
}

function coverageMissingItems(row: RawCoverageEntity) {
  const missing: string[] = [];
  if (row.story_count === 0) missing.push("故事");
  if (row.claim_count === 0) missing.push("事实");
  if (row.reference_count === 0) missing.push("来源");
  if (row.media_count === 0) missing.push("媒体候选");
  if (row.event_count === 0) missing.push("时间线");

  if (row.type === "brand") {
    if (row.external_id_count === 0) missing.push("外部标识");
    if (row.alias_count < 2) missing.push("别名");
  } else {
    if (row.model_spec_count === 0) missing.push("规格");
    if (row.diagram_count === 0) missing.push("图示");
  }

  return missing;
}

function enrichCoverageEntity(
  rawRow: RawCoverageEntity,
): LibraryCoverageEntityRecord {
  const row = normalizeCoverageRow(rawRow);
  const coverage_score = scoreCoverage(row);
  return {
    ...row,
    coverage_score,
    coverage_status:
      coverage_score >= 80 ? "ready" : coverage_score >= 45 ? "starter" : "gap",
    missing_items: coverageMissingItems(row),
  };
}

function summarizeCoverage(
  type: string,
  rows: LibraryCoverageEntityRecord[],
): LibraryCoverageSummaryRecord {
  const typedRows = rows.filter((row) => row.type === type);
  const total = typedRows.length;
  const sum = (predicate: (row: LibraryCoverageEntityRecord) => boolean) =>
    typedRows.filter(predicate).length;

  return {
    type,
    total,
    ready: sum((row) => row.coverage_status === "ready"),
    starter: sum((row) => row.coverage_status === "starter"),
    gap: sum((row) => row.coverage_status === "gap"),
    average_score:
      total === 0
        ? 0
        : Math.round(
            typedRows.reduce((score, row) => score + row.coverage_score, 0) /
              total,
          ),
    with_stories: sum((row) => row.story_count > 0),
    with_claims: sum((row) => row.claim_count > 0),
    with_references: sum((row) => row.reference_count > 0),
    with_media: sum((row) => row.media_count > 0),
    with_diagrams: sum((row) => row.diagram_count > 0),
    with_events: sum((row) => row.event_count > 0),
    with_external_ids: sum((row) => row.external_id_count > 0),
    with_model_specs: sum((row) => row.model_spec_count > 0),
  };
}

export async function getLibraryCoverageReport(
  priorityLimit = 24,
): Promise<LibraryCoverageReport> {
  const rows = (
    (await queryAll(
      `SELECT e.id, e.type, e.slug, e.name, e.summary,
              COUNT(DISTINCT s.id) as story_count,
              COUNT(DISTINCT c.id) as claim_count,
              COUNT(DISTINCT er.id) as reference_count,
              COUNT(DISTINCT ma.id) as media_count,
              COUNT(DISTINCT CASE WHEN ma.asset_type = 'image' THEN ma.id END) as image_count,
              COUNT(DISTINCT d.id) as diagram_count,
              COUNT(DISTINCT te.id) as event_count,
              COUNT(DISTINCT ex.id) as external_id_count,
              COUNT(DISTINCT ea.id) as alias_count,
              COUNT(DISTINCT ms.id) as model_spec_count
       FROM entities e
       LEFT JOIN stories s ON s.entity_id = e.id
       LEFT JOIN claims c ON c.subject_entity_id = e.id
       LEFT JOIN entity_references er ON er.entity_id = e.id
       LEFT JOIN media_assets ma ON ma.entity_id = e.id
       LEFT JOIN diagrams d ON d.entity_id = e.id
       LEFT JOIN timeline_events te ON te.entity_id = e.id
       LEFT JOIN external_ids ex ON ex.entity_id = e.id
       LEFT JOIN entity_aliases ea ON ea.entity_id = e.id
       LEFT JOIN model_specs ms ON ms.entity_id = e.id
       WHERE e.type IN ('brand', 'pen')
       GROUP BY e.id
       ORDER BY e.type, e.name`,
    )) as RawCoverageEntity[]
  ).map(enrichCoverageEntity);

  const byPriority = (
    a: LibraryCoverageEntityRecord,
    b: LibraryCoverageEntityRecord,
  ) =>
    a.coverage_score - b.coverage_score ||
    b.missing_items.length - a.missing_items.length ||
    a.name.localeCompare(b.name);

  return {
    summaries: [
      summarizeCoverage("brand", rows),
      summarizeCoverage("pen", rows),
    ],
    priorityBrands: rows
      .filter((row) => row.type === "brand")
      .sort(byPriority)
      .slice(0, priorityLimit),
    priorityPens: rows
      .filter((row) => row.type === "pen")
      .sort(byPriority)
      .slice(0, priorityLimit),
  };
}

export async function getFeaturedBrands(limit = 8) {
  return (await queryAll(
    `SELECT e.type, e.slug, e.name, e.summary,
            COUNT(DISTINCT s.id) as story_count,
            COUNT(DISTINCT te.id) as event_count
     FROM entities e
     LEFT JOIN stories s ON s.entity_id = e.id
     LEFT JOIN timeline_events te ON te.entity_id = e.id
     WHERE e.type = 'brand'
     GROUP BY e.id
     ORDER BY story_count DESC, event_count DESC, e.name
     LIMIT ?`,
    [limit],
  )) as Array<
    RelatedEntityRecord & { story_count: number; event_count: number }
  >;
}

export async function getPublishedExhibits() {
  return (await queryAll(
    `SELECT id, slug, title, summary, status
     FROM exhibits
     WHERE status IN ('published', 'reviewed')
     ORDER BY CASE status WHEN 'published' THEN 0 WHEN 'reviewed' THEN 1 ELSE 2 END, title`,
  )) as ExhibitRecord[];
}

export async function getExhibit(slug: string) {
  return (await queryOne(
    `SELECT id, slug, title, summary, status
     FROM exhibits
     WHERE slug = ? AND status IN ('published', 'reviewed')`,
    [slug],
  )) as ExhibitRecord | undefined;
}

export async function getExhibitSections(exhibitId: string) {
  return (await queryAll(
    `SELECT id, position, title, body_md, related_entity_slugs_json,
            diagram_slugs_json, source_item_ids_json
     FROM exhibit_sections
     WHERE exhibit_id = ?
     ORDER BY position ASC`,
    [exhibitId],
  )) as ExhibitSectionRecord[];
}

export async function getRelatedEntitiesByPaths(paths: string[]) {
  if (paths.length === 0) return [];

  const clauses = paths.map(() => "(e.type = ? AND e.slug = ?)").join(" OR ");
  const args = paths.flatMap((pathValue) => {
    const [type, ...slugParts] = pathValue.split("/");
    return [type, slugParts.join("/")];
  });

  const rows = (await queryAll(
    `SELECT e.type, e.slug, e.name, e.summary
     FROM entities e
     WHERE ${clauses}
     ORDER BY e.type, e.name`,
    args,
  )) as RelatedEntityRecord[];

  const byPath = new Map(rows.map((row) => [`${row.type}/${row.slug}`, row]));
  return paths
    .map((pathValue) => byPath.get(pathValue))
    .filter((row): row is RelatedEntityRecord => Boolean(row));
}

export async function getSourceItemsByIds(ids: string[]) {
  if (ids.length === 0) return [];

  const placeholders = ids.map(() => "?").join(", ");
  const rows = (await queryAll(
    `SELECT si.id, si.source_id, sr.name as source_name, sr.source_type,
            si.title, si.url, si.item_type, si.license, si.allowed_use,
            si.review_status,
            COUNT(DISTINCT er.id) + COUNT(DISTINCT c.id) as reference_count
     FROM source_items si
     JOIN source_registry sr ON sr.id = si.source_id
     LEFT JOIN entity_references er ON er.source_item_id = si.id
     LEFT JOIN citations c ON c.source_item_id = si.id
     WHERE si.id IN (${placeholders})
     GROUP BY si.id
     ORDER BY si.title`,
    ids,
  )) as SourceItemRecord[];

  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids
    .map((id) => byId.get(id))
    .filter((row): row is SourceItemRecord => Boolean(row));
}
