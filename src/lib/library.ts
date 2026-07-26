import { queryAll, queryOne } from "@/lib/db";
import { getCanonicalEntityPath } from "@/lib/entity-redirects";
import { publicMediaFilter } from "@/lib/public-media";
import { publicEntityFilter } from "@/lib/public-visibility";

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
  image_url: string | null;
  thumbnail_url: string | null;
  local_path: string | null;
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

export interface BrandPublicModelsRecord {
  models: RelatedEntityRecord[];
  count: number;
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
  current_review_count: number;
  blocker_count: number;
  is_public: boolean;
  blocker_codes: string[];
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
       AND status IN ('published', 'reviewed')
       AND story_type NOT IN ('brand_story', 'model_story')
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
     JOIN public_entities public_owner ON public_owner.id = te.entity_id
     JOIN source_items si ON si.id = te.source_item_id
     WHERE te.entity_id = ?
       AND te.review_status = 'approved'
       AND si.review_status = 'approved'
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
     LEFT JOIN public_entities e ON e.id = te.entity_id
     LEFT JOIN source_items si ON si.id = te.source_item_id
     WHERE te.review_status = 'approved'
       AND (te.entity_id IS NULL OR e.id IS NOT NULL)
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
  const rows = (await queryAll(
    `SELECT d.id, d.slug, d.title, d.diagram_type, d.svg, d.hotspots_json,
            d.source_note, d.license, d.review_status
     FROM diagrams d
     LEFT JOIN public_entities public_owner ON public_owner.id = d.entity_id
     WHERE (
         d.entity_id IS NULL
         OR (d.entity_id = ? AND public_owner.id IS NOT NULL)
       )
       AND d.review_status IN ('published', 'reviewed')
     ORDER BY CASE WHEN d.entity_id = ? THEN 0 ELSE 1 END, d.title`,
    [entityId, entityId],
  )) as DiagramRecord[];
  return sanitizeDiagramEntityTargets(rows);
}

export async function getDiagramIndex(limit = 80) {
  const rows = (await queryAll(
    `SELECT d.id, d.slug, d.title, d.diagram_type, d.svg, d.hotspots_json,
            d.source_note, d.license, d.review_status,
            e.type as entity_type,
            e.slug as entity_slug,
            e.name as entity_name
     FROM diagrams d
     LEFT JOIN public_entities e ON e.id = d.entity_id
     WHERE d.review_status IN ('published', 'reviewed')
       AND (d.entity_id IS NULL OR e.id IS NOT NULL)
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
  return sanitizeDiagramEntityTargets(rows);
}

function canonicalPublicPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/^\/+/, "");
  const [type, ...slugParts] = normalized.split("/");
  const slug = slugParts.join("/");
  if (!type || !slug) return null;
  const canonical = getCanonicalEntityPath(type, slug)?.replace(/^\/+/, "");
  return canonical || `${type}/${slug}`;
}

async function sanitizeDiagramEntityTargets(
  diagrams: DiagramRecord[],
): Promise<DiagramRecord[]> {
  const parsed = diagrams.map((diagram) => {
    try {
      const hotspots = JSON.parse(diagram.hotspots_json || "[]");
      return {
        diagram,
        hotspots: Array.isArray(hotspots)
          ? (hotspots as Array<Record<string, unknown>>)
          : [],
      };
    } catch {
      return { diagram, hotspots: [] as Array<Record<string, unknown>> };
    }
  });
  const candidatePaths = Array.from(
    new Set(
      parsed.flatMap(({ hotspots }) =>
        hotspots
          .map((hotspot) => canonicalPublicPath(hotspot.linked_entity))
          .filter((value): value is string => Boolean(value)),
      ),
    ),
  );
  const clauses = candidatePaths
    .map(() => "(type = ? AND slug = ?)")
    .join(" OR ");
  const publicRows = candidatePaths.length
    ? ((await queryAll(
        `SELECT type, slug
         FROM public_entities
         WHERE ${clauses}`,
        candidatePaths.flatMap((candidatePath) => {
          const [type, ...slugParts] = candidatePath.split("/");
          return [type, slugParts.join("/")];
        }),
      )) as Array<{ type: string; slug: string }>)
    : [];
  const publicPaths = new Set(
    publicRows.map((row) => `${row.type}/${row.slug}`),
  );

  return parsed.map(({ diagram, hotspots }) => ({
    ...diagram,
    hotspots_json: JSON.stringify(
      hotspots.map((hotspot) => {
        const sanitized = { ...hotspot };
        const candidatePath = canonicalPublicPath(hotspot.linked_entity);
        if (candidatePath && publicPaths.has(candidatePath)) {
          sanitized.linked_entity = `/${candidatePath}`;
        } else {
          delete sanitized.linked_entity;
        }
        return sanitized;
      }),
    ),
  }));
}

export async function getModelSpec(entityId: string) {
  return (await queryOne(
    `WITH qualified_fields AS (
       SELECT DISTINCT model_spec_id, field_key
       FROM publication_v2_field_evidence
     )
     SELECT ms.id,
            CASE WHEN EXISTS (
              SELECT 1 FROM qualified_fields field
              WHERE field.model_spec_id = ms.id AND field.field_key = 'series_name'
            ) THEN ms.series_name END AS series_name,
            CASE WHEN EXISTS (
              SELECT 1 FROM qualified_fields field
              WHERE field.model_spec_id = ms.id AND field.field_key = 'release_year'
            ) THEN ms.release_year END AS release_year,
            CASE WHEN EXISTS (
              SELECT 1 FROM qualified_fields field
              WHERE field.model_spec_id = ms.id AND field.field_key = 'origin_country'
            ) THEN ms.origin_country END AS origin_country,
            CASE WHEN EXISTS (
              SELECT 1 FROM qualified_fields field
              WHERE field.model_spec_id = ms.id AND field.field_key = 'nib'
            ) THEN ms.nib END AS nib,
            CASE WHEN EXISTS (
              SELECT 1 FROM qualified_fields field
              WHERE field.model_spec_id = ms.id AND field.field_key = 'fill_system'
            ) THEN ms.fill_system END AS fill_system,
            CASE WHEN EXISTS (
              SELECT 1 FROM qualified_fields field
              WHERE field.model_spec_id = ms.id AND field.field_key = 'material'
            ) THEN ms.material END AS material,
            CASE WHEN EXISTS (
              SELECT 1 FROM qualified_fields field
              WHERE field.model_spec_id = ms.id AND field.field_key = 'dimensions'
            ) THEN ms.dimensions END AS dimensions,
            CASE WHEN EXISTS (
              SELECT 1 FROM qualified_fields field
              WHERE field.model_spec_id = ms.id AND field.field_key = 'weight'
            ) THEN ms.weight END AS weight,
            CASE WHEN EXISTS (
              SELECT 1 FROM qualified_fields field
              WHERE field.model_spec_id = ms.id AND field.field_key = 'price_range'
            ) THEN ms.price_range END AS price_range,
            CASE WHEN EXISTS (
              SELECT 1 FROM qualified_fields field
              WHERE field.model_spec_id = ms.id AND field.field_key = 'status'
            ) THEN ms.status END AS status,
            ms.review_status,
            CASE WHEN EXISTS (
              SELECT 1 FROM qualified_fields field
              WHERE field.model_spec_id = ms.id AND field.field_key = 'brand_entity_id'
            ) THEN public_brand.slug END AS brand_slug,
            CASE WHEN EXISTS (
              SELECT 1 FROM qualified_fields field
              WHERE field.model_spec_id = ms.id AND field.field_key = 'brand_entity_id'
            ) THEN public_brand.name END AS brand_name
     FROM model_specs ms
     JOIN public_entities public_owner
       ON public_owner.id = ms.entity_id AND public_owner.type = 'pen'
     LEFT JOIN public_entities public_brand
       ON public_brand.id = ms.brand_entity_id AND public_brand.type = 'brand'
     WHERE ms.entity_id = ?
       AND ms.review_status = 'approved'
       AND EXISTS (
         SELECT 1 FROM qualified_fields field
         WHERE field.model_spec_id = ms.id
       )`,
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

export async function getBrandPublicModels(
  entityId: string,
): Promise<BrandPublicModelsRecord> {
  const models = (await queryAll(
    `SELECT public_pen.type,
            public_pen.slug,
            public_pen.name,
            public_pen.summary
     FROM public_entities public_brand
     JOIN entity_links relation
       ON relation.target_id = public_brand.id
      AND relation.link_type = 'made_by'
     JOIN public_entities public_pen
       ON public_pen.id = relation.source_id
      AND public_pen.type = 'pen'
     WHERE public_brand.id = ?
       AND public_brand.type = 'brand'
     GROUP BY public_pen.id
     ORDER BY public_pen.name, public_pen.slug`,
    [entityId],
  )) as RelatedEntityRecord[];
  return { models, count: models.length };
}

export async function getEntityReferences(entityId: string, limit = 8) {
  return (await queryAll(
    `WITH ranked_references AS (
       SELECT er.id, sr.id as source_id, sr.name as source_name, sr.source_type,
              si.title, si.url, si.item_type,
              COALESCE(si.allowed_use, sr.allowed_use) as allowed_use,
              COALESCE(si.license, sr.license) as license,
              er.review_status,
              0 as reference_count,
              ROW_NUMBER() OVER (
                PARTITION BY LOWER(TRIM(COALESCE(NULLIF(si.url, ''), si.id)))
                ORDER BY er.id
              ) as public_rank
       FROM entity_references er
       JOIN source_items si ON si.id = er.source_item_id
       JOIN source_registry sr ON sr.id = si.source_id
       WHERE er.entity_id = ?
         AND er.review_status = 'approved'
         AND si.review_status = 'approved'
     )
     SELECT id, source_id, source_name, source_type, title, url, item_type,
            allowed_use, license, review_status, reference_count
     FROM ranked_references
     WHERE public_rank = 1
     ORDER BY title
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
       AND c.review_status = 'approved'
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
       AND (si.id IS NULL OR si.review_status = 'approved')
       AND (cl.id IS NULL OR cl.review_status = 'approved')
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
       AND (si.id IS NULL OR si.review_status = 'approved')
       AND (cl.id IS NULL OR cl.review_status = 'approved')
     ORDER BY c.target_id, sr.name, si.title, c.id`,
    [targetType, ...targetIds],
  )) as CitationRecord[];
}

export async function getEntityExternalIds(entityId: string) {
  return (await queryAll(
    `SELECT id, provider, external_id, url, metadata_json
     FROM external_ids
     WHERE entity_id = ?
       AND provider != 'research_index'
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

const PUBLIC_SOURCE_USAGE_CTE = `source_usage AS (
  SELECT reference.source_item_id,
         'entity:' || reference.entity_id || ':' ||
           LOWER(TRIM(reference_item.url)) as usage_key
  FROM entity_references reference
  JOIN source_items reference_item
    ON reference_item.id = reference.source_item_id
  JOIN public_entities reference_owner
    ON reference_owner.id = reference.entity_id
  WHERE reference.review_status = 'approved'
    AND reference_item.review_status = 'approved'

  UNION ALL

  SELECT COALESCE(citation.source_item_id, source_claim.source_item_id),
         'citation:' || citation.id as usage_key
  FROM citations citation
  LEFT JOIN claims source_claim ON source_claim.id = citation.claim_id
  JOIN source_items cited_item
    ON cited_item.id = COALESCE(
      citation.source_item_id,
      source_claim.source_item_id
    )
  LEFT JOIN stories target_story
    ON citation.target_type = 'story'
   AND target_story.id = citation.target_id
  LEFT JOIN timeline_events target_event
    ON citation.target_type = 'timeline_event'
   AND target_event.id = citation.target_id
  LEFT JOIN diagrams target_diagram
    ON citation.target_type = 'diagram'
   AND target_diagram.id = citation.target_id
  LEFT JOIN model_specs target_spec
    ON citation.target_type = 'model_spec'
   AND target_spec.id = citation.target_id
  LEFT JOIN claims target_claim
    ON citation.target_type = 'claim'
   AND target_claim.id = citation.target_id
  LEFT JOIN exhibits target_exhibit
    ON citation.target_type = 'exhibit'
   AND target_exhibit.id = citation.target_id
  LEFT JOIN public_entities citation_owner
    ON citation_owner.id = CASE citation.target_type
      WHEN 'entity' THEN citation.target_id
      WHEN 'story' THEN target_story.entity_id
      WHEN 'timeline_event' THEN target_event.entity_id
      WHEN 'diagram' THEN target_diagram.entity_id
      WHEN 'model_spec' THEN target_spec.entity_id
      WHEN 'claim' THEN target_claim.subject_entity_id
      ELSE NULL
    END
  WHERE cited_item.review_status = 'approved'
    AND (citation.claim_id IS NULL OR source_claim.review_status = 'approved')
    AND (
      (citation.target_type = 'entity' AND citation_owner.id IS NOT NULL)
      OR (
        citation.target_type = 'story'
        AND target_story.status IN ('published', 'reviewed')
        AND citation_owner.id IS NOT NULL
      )
      OR (
        citation.target_type = 'timeline_event'
        AND target_event.review_status = 'approved'
        AND citation_owner.id IS NOT NULL
      )
      OR (
        citation.target_type = 'diagram'
        AND target_diagram.review_status IN ('published', 'reviewed')
        AND (target_diagram.entity_id IS NULL OR citation_owner.id IS NOT NULL)
      )
      OR (
        citation.target_type = 'model_spec'
        AND target_spec.review_status = 'approved'
        AND citation_owner.id IS NOT NULL
      )
      OR (
        citation.target_type = 'claim'
        AND target_claim.review_status = 'approved'
        AND citation_owner.id IS NOT NULL
      )
      OR (
        citation.target_type = 'exhibit'
        AND target_exhibit.status IN ('published', 'reviewed')
      )
    )
)`;

export async function getSourceRegistryIndex() {
  return (await queryAll(
    `WITH ${PUBLIC_SOURCE_USAGE_CTE}
     SELECT sr.id, sr.name, sr.source_type, sr.allowed_use, sr.reliability,
            sr.license, sr.attribution, sr.homepage_url, sr.fetch_method, sr.notes,
            COUNT(DISTINCT CASE
              WHEN si.review_status = 'approved' AND source_usage.usage_key IS NOT NULL
              THEN si.id END) as item_count,
            COUNT(DISTINCT source_usage.usage_key) as reference_count
     FROM source_registry sr
     LEFT JOIN source_items si ON si.source_id = sr.id
     LEFT JOIN source_usage ON source_usage.source_item_id = si.id
     GROUP BY sr.id
     HAVING COUNT(DISTINCT source_usage.usage_key) > 0
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
  const filters: string[] = ["si.review_status = 'approved'"];
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
    `WITH ${PUBLIC_SOURCE_USAGE_CTE}
     SELECT si.id, sr.id as source_id, sr.name as source_name, sr.source_type,
            si.title, si.url, si.item_type,
            COALESCE(si.allowed_use, sr.allowed_use) as allowed_use,
            COALESCE(si.license, sr.license) as license,
            si.review_status,
            COUNT(DISTINCT source_usage.usage_key) as reference_count
     FROM source_items si
     JOIN source_registry sr ON sr.id = si.source_id
     JOIN source_usage ON source_usage.source_item_id = si.id
     ${filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : ""}
     GROUP BY si.id
     HAVING COUNT(DISTINCT source_usage.usage_key) > 0
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
     JOIN public_entities e ON e.id = ma.entity_id
     WHERE ${publicMediaFilter("ma")}
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
    `SELECT ma.id, ma.title, ma.image_url, ma.thumbnail_url, ma.local_path,
            ma.source_url, ma.author, ma.license, ma.attribution_text,
            si.title as source_title,
            sr.name as source_name
     FROM media_assets ma
     JOIN public_entities public_owner ON public_owner.id = ma.entity_id
     LEFT JOIN source_items si ON si.id = ma.source_item_id
     LEFT JOIN source_registry sr ON sr.id = si.source_id
     WHERE ma.entity_id = ?
       AND ${publicMediaFilter("ma")}
     ORDER BY
       CASE ma.usage_status WHEN 'primary' THEN 0 ELSE 1 END,
       ma.created_at DESC,
       ma.id
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
     WHERE cs.status IN ('published', 'reviewed')
       AND ${publicEntityFilter("e")}
     ORDER BY
       CASE cs.status WHEN 'published' THEN 0 WHEN 'reviewed' THEN 1 ELSE 2 END,
       e.name
     LIMIT ?`,
    [limit],
  )) as CommunitySummaryRecord[];
}

export async function getLibraryStats() {
  const rows = (await queryAll(
    `WITH ${PUBLIC_SOURCE_USAGE_CTE}
     SELECT 'sources' as key,
            COUNT(DISTINCT source_usage.source_item_id) as value
     FROM source_usage
     UNION ALL
     SELECT 'claims', COUNT(*)
     FROM claims public_claim
     JOIN public_entities claim_owner
       ON claim_owner.id = public_claim.subject_entity_id
     WHERE public_claim.review_status = 'approved'
     UNION ALL
     SELECT 'stories', COUNT(*)
     FROM stories public_story
     JOIN public_entities story_owner ON story_owner.id = public_story.entity_id
     WHERE public_story.status IN ('published', 'reviewed')
     UNION ALL
     SELECT 'diagrams', COUNT(*)
     FROM diagrams public_diagram
     LEFT JOIN public_entities diagram_owner
       ON diagram_owner.id = public_diagram.entity_id
     WHERE public_diagram.review_status IN ('published', 'reviewed')
       AND (public_diagram.entity_id IS NULL OR diagram_owner.id IS NOT NULL)
     UNION ALL
     SELECT 'events', COUNT(*)
     FROM timeline_events public_event
     LEFT JOIN public_entities event_owner ON event_owner.id = public_event.entity_id
     WHERE public_event.review_status = 'approved'
       AND (public_event.entity_id IS NULL OR event_owner.id IS NOT NULL)
     UNION ALL
     SELECT 'exhibits', COUNT(*)
     FROM exhibits
     WHERE status IN ('published', 'reviewed')
     UNION ALL
     SELECT 'media', COUNT(*)
     FROM media_assets public_media
     JOIN public_entities media_owner ON media_owner.id = public_media.entity_id
     WHERE ${publicMediaFilter("public_media")}
     UNION ALL
     SELECT 'community', COUNT(*)
     FROM community_summaries public_community
     JOIN public_entities community_owner
       ON community_owner.id = public_community.entity_id
     WHERE public_community.status IN ('published', 'reviewed')`,
  )) as Array<{ key: string; value: number }>;
  return Object.fromEntries(rows.map((row) => [row.key, Number(row.value)]));
}

type RawCoverageEntity = Omit<
  LibraryCoverageEntityRecord,
  | "coverage_score"
  | "coverage_status"
  | "missing_items"
  | "blocker_codes"
  | "is_public"
> & { blocker_codes_json: string | null; is_public: number };

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
    current_review_count: Number(row.current_review_count || 0),
    blocker_count: Number(row.blocker_count || 0),
    blocker_codes_json: row.blocker_codes_json,
  };
}

function parseBlockerCodes(value: string | null): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? [...new Set(parsed.map(String))].sort() : [];
  } catch {
    return [];
  }
}

function scoreCoverage(row: RawCoverageEntity) {
  const checks = [
    row.story_count > 0,
    row.claim_count > 0,
    row.reference_count > 0,
    row.media_count > 0,
    row.current_review_count === 4,
  ];
  if (row.type === "pen") checks.push(row.model_spec_count > 0);
  return Math.round(
    (checks.filter(Boolean).length / Math.max(checks.length, 1)) * 100,
  );
}

function enrichCoverageEntity(
  rawRow: RawCoverageEntity,
): LibraryCoverageEntityRecord {
  const row = normalizeCoverageRow(rawRow);
  const coverage_score = scoreCoverage(row);
  const blocker_codes = parseBlockerCodes(row.blocker_codes_json);
  const {
    blocker_codes_json: _blockerCodesJson,
    is_public: rawIsPublic,
    ...publicRow
  } = row;
  const is_public = rawIsPublic === 1;
  const missing_items =
    blocker_codes.length > 0 ? blocker_codes : is_public ? [] : ["not_public"];
  return {
    ...publicRow,
    is_public,
    blocker_codes,
    coverage_score,
    coverage_status:
      row.blocker_count === 0 && is_public
        ? "ready"
        : coverage_score >= 45
          ? "starter"
          : "gap",
    missing_items,
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
              coalesce((
                SELECT count(*)
                FROM stories story
                WHERE story.entity_id = e.id
                  AND story.status = 'published'
                  AND story.story_type = CASE
                    WHEN e.type = 'brand' THEN 'brand_story'
                    ELSE 'model_story'
                  END
              ), 0) AS story_count,
              coalesce((
                SELECT count(DISTINCT claim.claim_id)
                FROM publication_v2_qualified_core_claims claim
                WHERE claim.entity_id = e.id
              ), 0) AS claim_count,
              coalesce((
                SELECT count(*)
                FROM publication_v2_source_groups source_group
                WHERE source_group.entity_id = e.id
              ), 0) AS reference_count,
              coalesce((
                SELECT count(*)
                FROM publication_v2_qualified_primary_media media
                WHERE media.entity_id = e.id
              ), 0) AS media_count,
              coalesce((
                SELECT count(*)
                FROM publication_v2_qualified_primary_media media
                WHERE media.entity_id = e.id
              ), 0) AS image_count,
              0 AS diagram_count,
              0 AS event_count,
              0 AS external_id_count,
              0 AS alias_count,
              coalesce((
                SELECT count(*)
                FROM model_specs spec
                WHERE spec.entity_id = e.id
                  AND spec.review_status = 'approved'
                  AND EXISTS (
                    SELECT 1
                    FROM publication_v2_required_spec_fields required
                    WHERE required.model_spec_id = spec.id
                  )
                  AND NOT EXISTS (
                    SELECT 1
                    FROM publication_v2_required_spec_fields required
                    WHERE required.model_spec_id = spec.id
                      AND NOT EXISTS (
                        SELECT 1
                        FROM publication_v2_field_evidence evidence
                        WHERE evidence.model_spec_id = required.model_spec_id
                          AND evidence.field_key = required.field_key
                      )
                  )
              ), 0) AS model_spec_count,
              coalesce((
                SELECT count(DISTINCT review.review_kind)
                FROM publication_v2_current_reviews review
                WHERE review.entity_id = e.id
              ), 0) AS current_review_count,
              readiness.blocker_count,
              CASE WHEN public_owner.id IS NULL THEN 0 ELSE 1 END AS is_public,
              readiness.blockers_json AS blocker_codes_json
       FROM entities e
       JOIN public_entity_readiness readiness
         ON readiness.entity_id = e.id AND readiness.contract_version = 3
       LEFT JOIN public_entities public_owner ON public_owner.id = e.id
       WHERE e.type IN ('brand', 'pen')
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
     LEFT JOIN stories s ON s.entity_id = e.id AND s.status IN ('published', 'reviewed')
     LEFT JOIN timeline_events te ON te.entity_id = e.id AND te.review_status = 'approved'
     WHERE e.type = 'brand'
       AND ${publicEntityFilter("e")}
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
  const sections = (await queryAll(
    `SELECT id, position, title, body_md, related_entity_slugs_json,
            diagram_slugs_json, source_item_ids_json
     FROM exhibit_sections
     WHERE exhibit_id = ?
     ORDER BY position ASC`,
    [exhibitId],
  )) as ExhibitSectionRecord[];

  const relatedPaths = sections.flatMap((section) =>
    parseStringList(section.related_entity_slugs_json)
      .map(canonicalPublicPath)
      .filter((value): value is string => Boolean(value)),
  );
  const publicRelated = await getRelatedEntitiesByPaths(relatedPaths);
  const publicRelatedPaths = new Set(
    publicRelated.map((entity) => `${entity.type}/${entity.slug}`),
  );

  const diagramSlugs = Array.from(
    new Set(
      sections.flatMap((section) =>
        parseStringList(section.diagram_slugs_json),
      ),
    ),
  );
  const publicDiagramRows = diagramSlugs.length
    ? ((await queryAll(
        `SELECT diagram.slug
         FROM diagrams diagram
         LEFT JOIN public_entities public_owner
           ON public_owner.id = diagram.entity_id
         WHERE diagram.slug IN (${diagramSlugs.map(() => "?").join(", ")})
           AND diagram.review_status IN ('published', 'reviewed')
           AND (diagram.entity_id IS NULL OR public_owner.id IS NOT NULL)`,
        diagramSlugs,
      )) as Array<{ slug: string }>)
    : [];
  const publicDiagramSlugs = new Set(
    publicDiagramRows.map((diagram) => diagram.slug),
  );

  return sections.map((section) => ({
    ...section,
    related_entity_slugs_json: JSON.stringify(
      parseStringList(section.related_entity_slugs_json)
        .map(canonicalPublicPath)
        .filter(
          (pathValue): pathValue is string =>
            pathValue !== null && publicRelatedPaths.has(pathValue),
        ),
    ),
    diagram_slugs_json: JSON.stringify(
      parseStringList(section.diagram_slugs_json).filter((slug) =>
        publicDiagramSlugs.has(slug),
      ),
    ),
  }));
}

export async function getRelatedEntitiesByPaths(paths: string[]) {
  const canonicalPaths = paths
    .map(canonicalPublicPath)
    .filter((pathValue): pathValue is string => Boolean(pathValue));
  if (canonicalPaths.length === 0) return [];

  const clauses = canonicalPaths
    .map(() => "(e.type = ? AND e.slug = ?)")
    .join(" OR ");
  const args = canonicalPaths.flatMap((pathValue) => {
    const [type, ...slugParts] = pathValue.split("/");
    return [type, slugParts.join("/")];
  });

  const rows = (await queryAll(
    `SELECT e.type, e.slug, e.name, e.summary
     FROM public_entities e
     WHERE (${clauses})
     ORDER BY e.type, e.name`,
    args,
  )) as RelatedEntityRecord[];

  const byPath = new Map(rows.map((row) => [`${row.type}/${row.slug}`, row]));
  return canonicalPaths
    .map((pathValue) => byPath.get(pathValue))
    .filter((row): row is RelatedEntityRecord => Boolean(row));
}

function parseStringList(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
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
