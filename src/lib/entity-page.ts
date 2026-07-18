import { queryOne } from "@/lib/db";
import { getPublicMediaUrl } from "@/lib/media-url";
import { publicMediaFilter } from "@/lib/public-media";

if (typeof window !== "undefined") {
  throw new Error("entity-page is a server-only module");
}

export type PublishedEntityType = "brand" | "pen";

export type PublishedStory = {
  title: string;
  bodyMd: string;
};

export type PublishedSource = {
  title: string;
  url: string;
  sourceName: string;
  archiveUrl: string | null;
  archiveLocator: string | null;
};

export type PublishedPrimaryMedia = {
  title: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  author: string | null;
  license: string;
  attribution: string;
  sourceUrl: string | null;
};

export type PublishedEntityLink = {
  type: PublishedEntityType;
  slug: string;
  name: string;
  summary: string;
};

export type PublishedTimelineEvent = {
  title: string;
  startDate: string;
  endDate: string | null;
  circa: boolean;
  description: string | null;
  source: Pick<PublishedSource, "title" | "url" | "sourceName">;
};

export type EvidenceBackedSpec = {
  key: string;
  label: string;
  value: string | number;
  source: Pick<PublishedSource, "title" | "url" | "sourceName"> & {
    locator: string;
  };
};

export type QualifiedVariant = {
  name: string;
  releaseYear: string | null;
  notes: string | null;
  source: Pick<PublishedSource, "title" | "url" | "sourceName">;
};

type PageBase = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  story: PublishedStory;
  sources: PublishedSource[];
  primaryMedia: PublishedPrimaryMedia;
};

export type BrandPageData = PageBase & {
  type: "brand";
  timeline: PublishedTimelineEvent[];
  models: PublishedEntityLink[];
};

export type ModelPageData = PageBase & {
  type: "pen";
  specs: EvidenceBackedSpec[];
  variants: QualifiedVariant[];
  canonicalBrand: PublishedEntityLink;
};

export type PublishedPageData = BrandPageData | ModelPageData;

export type PublishedPageInvariantCode =
  | "invalid-root"
  | "invalid-summary"
  | "invalid-story-cardinality"
  | "invalid-source-cardinality"
  | "invalid-primary-media-cardinality"
  | "invalid-timeline-cardinality"
  | "invalid-model-cardinality"
  | "invalid-spec-cardinality"
  | "invalid-brand-cardinality"
  | "malformed-row";

export class PublishedPageInvariantError extends Error {
  readonly code: PublishedPageInvariantCode;
  readonly entityType: PublishedEntityType;
  readonly slug: string;

  constructor(
    code: PublishedPageInvariantCode,
    entityType: PublishedEntityType,
    slug: string,
    detail: string,
  ) {
    super(`Published page ${code} for ${entityType}/${slug}: ${detail}`);
    this.name = "PublishedPageInvariantError";
    this.code = code;
    this.entityType = entityType;
    this.slug = slug;
  }
}

const SPEC_LABELS: Record<string, string> = {
  brand_entity_id: "品牌",
  series_name: "系列",
  release_year: "发布年份",
  origin_country: "产地",
  nib: "笔尖",
  fill_system: "上墨方式",
  material: "材质",
  dimensions: "尺寸",
  weight: "重量",
  price_range: "价格区间",
  status: "状态",
};

const PAGE_QUERY = `
  WITH public_entity_rows AS MATERIALIZED (
    SELECT id, type, slug, name, summary
    FROM public_entities
  ),
  requested_entity AS MATERIALIZED (
    SELECT id, type, slug, name, summary
    FROM public_entity_rows
    WHERE type = ? AND slug = ?
  ),
  expected_story_rows AS (
    SELECT story.title, story.body_md
    FROM requested_entity root
    JOIN stories story ON story.entity_id = root.id
    WHERE story.status = 'published'
      AND story.story_type = CASE root.type
        WHEN 'brand' THEN 'brand_story'
        ELSE 'model_story'
      END
  ),
  qualified_source_candidates AS (
    SELECT
      item.title,
      item.url,
      registry.name AS source_name,
      qualified.archive_url,
      qualified.archive_locator,
      ROW_NUMBER() OVER (
        PARTITION BY lower(trim(coalesce(nullif(item.url, ''), item.id)))
        ORDER BY item.id
      ) AS source_rank
    FROM requested_entity root
    JOIN publication_source_item_entities owner ON owner.entity_id = root.id
    JOIN publication_v2_qualified_source_items qualified
      ON qualified.source_item_id = owner.source_item_id
    JOIN source_items item ON item.id = qualified.source_item_id
    JOIN source_registry registry ON registry.id = item.source_id
  ),
  qualified_spec_candidates AS (
    SELECT
      evidence.field_key,
      CASE evidence.field_key
        WHEN 'brand_entity_id' THEN public_brand.name
        WHEN 'series_name' THEN spec.series_name
        WHEN 'release_year' THEN spec.release_year
        WHEN 'origin_country' THEN spec.origin_country
        WHEN 'nib' THEN spec.nib
        WHEN 'fill_system' THEN spec.fill_system
        WHEN 'material' THEN spec.material
        WHEN 'dimensions' THEN spec.dimensions
        WHEN 'weight' THEN spec.weight
        WHEN 'price_range' THEN spec.price_range
        WHEN 'status' THEN spec.status
      END AS field_value,
      item.title AS source_title,
      item.url AS source_url,
      registry.name AS source_name,
      mapping.evidence_locator,
      ROW_NUMBER() OVER (
        PARTITION BY spec.id, evidence.field_key
        ORDER BY lower(item.url), item.id, citation.id
      ) AS evidence_rank
    FROM requested_entity root
    JOIN model_specs spec
      ON spec.entity_id = root.id AND spec.review_status = 'approved'
    JOIN publication_v2_field_evidence evidence
      ON evidence.entity_id = root.id AND evidence.model_spec_id = spec.id
    JOIN spec_field_evidence mapping ON mapping.id = evidence.evidence_id
    JOIN citations citation ON citation.id = evidence.citation_id
    JOIN source_items item ON item.id = evidence.source_item_id
    JOIN source_registry registry ON registry.id = item.source_id
    LEFT JOIN public_entity_rows public_brand
      ON public_brand.id = spec.brand_entity_id AND public_brand.type = 'brand'
    WHERE root.type = 'pen'
  ),
  qualified_variant_rows AS (
    SELECT DISTINCT
      variant.variant_name,
      variant.release_year,
      variant.notes,
      item.title AS source_title,
      item.url AS source_url,
      registry.name AS source_name
    FROM requested_entity root
    JOIN model_variants variant ON variant.model_entity_id = root.id
    JOIN fact_scopes scope
      ON scope.variant_id = variant.id AND scope.entity_id = root.id
    JOIN publication_v2_qualified_source_items qualified
      ON qualified.source_item_id = variant.source_item_id
    JOIN source_items item ON item.id = qualified.source_item_id
    JOIN source_registry registry ON registry.id = item.source_id
    WHERE root.type = 'pen' AND variant.review_status = 'approved'
  ),
  qualified_timeline_rows AS (
    SELECT
      event.title,
      event.start_date,
      event.end_date,
      event.circa,
      event.description,
      item.title AS source_title,
      item.url AS source_url,
      registry.name AS source_name
    FROM requested_entity root
    JOIN timeline_events event ON event.entity_id = root.id
    JOIN publication_v2_qualified_source_items qualified
      ON qualified.source_item_id = event.source_item_id
    JOIN source_items item ON item.id = qualified.source_item_id
    JOIN source_registry registry ON registry.id = item.source_id
    WHERE root.type = 'brand' AND event.review_status = 'approved'
  ),
  strict_primary_media_rows AS (
    SELECT
      media.id,
      media.title,
      media.local_path,
      media.image_url,
      media.thumbnail_url,
      media.author,
      media.license,
      media.attribution_text,
      coalesce(nullif(media.source_url, ''), nullif(item.url, '')) AS source_url
    FROM requested_entity root
    JOIN media_assets media ON media.entity_id = root.id
    JOIN publication_v2_qualified_primary_media qualified_media
      ON qualified_media.media_id = media.id AND qualified_media.entity_id = root.id
    LEFT JOIN publication_v2_qualified_source_items qualified_source
      ON qualified_source.source_item_id = media.source_item_id
    LEFT JOIN source_items item ON item.id = qualified_source.source_item_id
    WHERE media.usage_status = 'primary'
      AND nullif(trim(media.attribution_text), '') IS NOT NULL
      AND (media.source_item_id IS NULL OR qualified_source.source_item_id IS NOT NULL)
      AND ${publicMediaFilter("media")}
  ),
  brand_model_rows AS (
    SELECT public_pen.type, public_pen.slug, public_pen.name, public_pen.summary
    FROM requested_entity root
    JOIN entity_links relation
      ON relation.target_id = root.id AND relation.link_type = 'made_by'
    JOIN public_entity_rows public_pen
      ON public_pen.id = relation.source_id AND public_pen.type = 'pen'
    WHERE root.type = 'brand'
    GROUP BY public_pen.id
  ),
  model_brand_rows AS (
    SELECT public_brand.type, public_brand.slug, public_brand.name, public_brand.summary
    FROM requested_entity root
    JOIN entity_links relation
      ON relation.source_id = root.id AND relation.link_type = 'made_by'
    JOIN public_entity_rows public_brand
      ON public_brand.id = relation.target_id AND public_brand.type = 'brand'
    WHERE root.type = 'pen'
    GROUP BY public_brand.id
  )
  SELECT
    root.id AS entity_id,
    root.type AS entity_type,
    root.slug AS entity_slug,
    root.name AS entity_name,
    root.summary AS entity_summary,
    coalesce((
      SELECT json_group_array(json(payload))
      FROM (
        SELECT json_object('title', title, 'bodyMd', body_md) AS payload
        FROM expected_story_rows
        ORDER BY title, body_md
      )
    ), '[]') AS stories_json,
    coalesce((
      SELECT json_group_array(json(payload))
      FROM (
        SELECT json_object(
          'title', title,
          'url', url,
          'sourceName', source_name,
          'archiveUrl', archive_url,
          'archiveLocator', archive_locator
        ) AS payload
        FROM qualified_source_candidates
        WHERE source_rank = 1
        ORDER BY lower(url), title
      )
    ), '[]') AS sources_json,
    coalesce((
      SELECT json_group_array(json(payload))
      FROM (
        SELECT json_object(
          'id', id,
          'title', title,
          'localPath', local_path,
          'imageUrl', image_url,
          'thumbnailUrl', thumbnail_url,
          'author', author,
          'license', license,
          'attribution', attribution_text,
          'sourceUrl', source_url
        ) AS payload
        FROM strict_primary_media_rows
        ORDER BY title, image_url
      )
    ), '[]') AS primary_media_json,
    coalesce((
      SELECT json_group_array(json(payload))
      FROM (
        SELECT json_object(
          'title', title,
          'startDate', start_date,
          'endDate', end_date,
          'circa', circa,
          'description', description,
          'source', json_object(
            'title', source_title,
            'url', source_url,
            'sourceName', source_name
          )
        ) AS payload
        FROM qualified_timeline_rows
        ORDER BY start_date, title
      )
    ), '[]') AS timeline_json,
    coalesce((
      SELECT json_group_array(json(payload))
      FROM (
        SELECT json_object(
          'type', type,
          'slug', slug,
          'name', name,
          'summary', summary
        ) AS payload
        FROM brand_model_rows
        ORDER BY name, slug
      )
    ), '[]') AS models_json,
    coalesce((
      SELECT json_group_array(json(payload))
      FROM (
        SELECT json_object(
          'key', field_key,
          'value', field_value,
          'source', json_object(
            'title', source_title,
            'url', source_url,
            'sourceName', source_name,
            'locator', evidence_locator
          )
        ) AS payload
        FROM qualified_spec_candidates
        WHERE evidence_rank = 1
          AND field_value IS NOT NULL
          AND (typeof(field_value) != 'text' OR trim(field_value) != '')
        ORDER BY field_key
      )
    ), '[]') AS specs_json,
    coalesce((
      SELECT json_group_array(json(payload))
      FROM (
        SELECT json_object(
          'name', variant_name,
          'releaseYear', release_year,
          'notes', notes,
          'source', json_object(
            'title', source_title,
            'url', source_url,
            'sourceName', source_name
          )
        ) AS payload
        FROM qualified_variant_rows
        ORDER BY coalesce(release_year, ''), variant_name
      )
    ), '[]') AS variants_json,
    coalesce((
      SELECT json_group_array(json(payload))
      FROM (
        SELECT json_object(
          'type', type,
          'slug', slug,
          'name', name,
          'summary', summary
        ) AS payload
        FROM model_brand_rows
        ORDER BY name, slug
      )
    ), '[]') AS model_brands_json
  FROM requested_entity root
`;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function malformed(
  type: PublishedEntityType,
  slug: string,
  detail: string,
): never {
  throw new PublishedPageInvariantError("malformed-row", type, slug, detail);
}

function requiredString(
  record: UnknownRecord,
  key: string,
  type: PublishedEntityType,
  slug: string,
): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim() === "") {
    malformed(type, slug, `${key} must be a non-empty string`);
  }
  return value;
}

function nullableString(
  record: UnknownRecord,
  key: string,
  type: PublishedEntityType,
  slug: string,
): string | null {
  const value = record[key];
  if (value === null) return null;
  if (typeof value !== "string")
    malformed(type, slug, `${key} must be a string or null`);
  return value;
}

function strictOnSitePath(
  value: string | null,
  type: PublishedEntityType,
  slug: string,
  field: string,
): string | null {
  if (value === null) return null;
  if (value.startsWith("//")) {
    malformed(type, slug, `${field} must not be a protocol-relative URL`);
  }
  const hasControlCharacter = Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127;
  });
  if (!value.startsWith("/") || value.includes("\\") || hasControlCharacter) {
    malformed(type, slug, `${field} must be a strict on-site path`);
  }
  return value;
}

function decodePrimaryMedia(
  media: UnknownRecord,
  type: PublishedEntityType,
  slug: string,
): PublishedPrimaryMedia {
  const id = requiredString(media, "id", type, slug);
  const localPath = nullableString(media, "localPath", type, slug);
  const imageUrl = nullableString(media, "imageUrl", type, slug);
  const thumbnailUrl = nullableString(media, "thumbnailUrl", type, slug);

  for (const [field, value] of [
    ["localPath", localPath],
    ["imageUrl", imageUrl],
    ["thumbnailUrl", thumbnailUrl],
  ] as const) {
    if (value?.startsWith("//")) {
      malformed(type, slug, `${field} must not be a protocol-relative URL`);
    }
  }

  const publicUrl = getPublicMediaUrl({
    id,
    localPath,
    imageUrl,
    thumbnailUrl,
  });
  if (publicUrl === null) {
    malformed(type, slug, "primary media has no public URL");
  }

  const publicThumbnail = getPublicMediaUrl({ thumbnailUrl });
  return {
    title: requiredString(media, "title", type, slug),
    imageUrl:
      strictOnSitePath(publicUrl, type, slug, "imageUrl") ??
      malformed(type, slug, "imageUrl must be present"),
    thumbnailUrl: strictOnSitePath(publicThumbnail, type, slug, "thumbnailUrl"),
    author: nullableString(media, "author", type, slug),
    license: requiredString(media, "license", type, slug),
    attribution: requiredString(media, "attribution", type, slug),
    sourceUrl: nullableString(media, "sourceUrl", type, slug),
  };
}

function decodeSqliteBoolean(
  value: unknown,
  type: PublishedEntityType,
  slug: string,
  field: string,
): boolean {
  if (value === 0) return false;
  if (value === 1) return true;
  return malformed(type, slug, `${field} must be SQLite integer 0 or 1`);
}

function parseJsonArray(
  record: UnknownRecord,
  key: string,
  type: PublishedEntityType,
  slug: string,
): unknown[] {
  const encoded = record[key];
  if (typeof encoded !== "string")
    malformed(type, slug, `${key} must be JSON text`);
  try {
    const parsed: unknown = JSON.parse(encoded);
    if (!Array.isArray(parsed))
      malformed(type, slug, `${key} must contain an array`);
    return parsed;
  } catch (error) {
    if (error instanceof PublishedPageInvariantError) throw error;
    malformed(type, slug, `${key} contains invalid JSON`);
  }
}

function objectArray(
  record: UnknownRecord,
  key: string,
  type: PublishedEntityType,
  slug: string,
): UnknownRecord[] {
  return parseJsonArray(record, key, type, slug).map((value, index) => {
    if (!isRecord(value))
      malformed(type, slug, `${key}[${index}] must be an object`);
    return value;
  });
}

function decodeSource(
  value: unknown,
  type: PublishedEntityType,
  slug: string,
): Pick<PublishedSource, "title" | "url" | "sourceName"> {
  if (!isRecord(value)) malformed(type, slug, "source must be an object");
  return {
    title: requiredString(value, "title", type, slug),
    url: requiredString(value, "url", type, slug),
    sourceName: requiredString(value, "sourceName", type, slug),
  };
}

function decodeEntityLink(
  row: UnknownRecord,
  expectedType: PublishedEntityType,
  rootType: PublishedEntityType,
  rootSlug: string,
): PublishedEntityLink {
  const type = requiredString(row, "type", rootType, rootSlug);
  if (type !== expectedType)
    malformed(rootType, rootSlug, `relation type must be ${expectedType}`);
  return {
    type: expectedType,
    slug: requiredString(row, "slug", rootType, rootSlug),
    name: requiredString(row, "name", rootType, rootSlug),
    summary: requiredString(row, "summary", rootType, rootSlug),
  };
}

function decodeBase(
  row: UnknownRecord,
  type: PublishedEntityType,
  slug: string,
): PageBase {
  const summary = requiredString(row, "entity_summary", type, slug);
  const summaryLength = Array.from(summary.trim()).length;
  if (summaryLength < 60 || summaryLength > 160) {
    throw new PublishedPageInvariantError(
      "invalid-summary",
      type,
      slug,
      `expected 60-160 Unicode characters, received ${summaryLength}`,
    );
  }

  const storyRows = objectArray(row, "stories_json", type, slug);
  if (storyRows.length !== 1) {
    throw new PublishedPageInvariantError(
      "invalid-story-cardinality",
      type,
      slug,
      `expected one published story, received ${storyRows.length}`,
    );
  }
  const sources = objectArray(row, "sources_json", type, slug).map(
    (source): PublishedSource => ({
      title: requiredString(source, "title", type, slug),
      url: requiredString(source, "url", type, slug),
      sourceName: requiredString(source, "sourceName", type, slug),
      archiveUrl: nullableString(source, "archiveUrl", type, slug),
      archiveLocator: nullableString(source, "archiveLocator", type, slug),
    }),
  );
  if (sources.length < 2) {
    throw new PublishedPageInvariantError(
      "invalid-source-cardinality",
      type,
      slug,
      `expected at least two qualified sources, received ${sources.length}`,
    );
  }

  const mediaRows = objectArray(row, "primary_media_json", type, slug);
  if (mediaRows.length !== 1) {
    throw new PublishedPageInvariantError(
      "invalid-primary-media-cardinality",
      type,
      slug,
      `expected one strict primary image, received ${mediaRows.length}`,
    );
  }
  const story = storyRows[0];
  const media = mediaRows[0];
  return {
    id: requiredString(row, "entity_id", type, slug),
    slug: requiredString(row, "entity_slug", type, slug),
    name: requiredString(row, "entity_name", type, slug),
    summary,
    story: {
      title: requiredString(story, "title", type, slug),
      bodyMd: requiredString(story, "bodyMd", type, slug),
    },
    sources,
    primaryMedia: decodePrimaryMedia(media, type, slug),
  };
}

function decodeBrand(row: UnknownRecord, slug: string): BrandPageData {
  const type = "brand" as const;
  const base = decodeBase(row, type, slug);
  const timeline = objectArray(row, "timeline_json", type, slug).map(
    (event): PublishedTimelineEvent => ({
      title: requiredString(event, "title", type, slug),
      startDate: requiredString(event, "startDate", type, slug),
      endDate: nullableString(event, "endDate", type, slug),
      circa: decodeSqliteBoolean(event.circa, type, slug, "timeline.circa"),
      description: nullableString(event, "description", type, slug),
      source: decodeSource(event.source, type, slug),
    }),
  );
  if (timeline.length < 2) {
    throw new PublishedPageInvariantError(
      "invalid-timeline-cardinality",
      type,
      slug,
      `expected at least two qualified events, received ${timeline.length}`,
    );
  }
  const models = objectArray(row, "models_json", type, slug).map((model) =>
    decodeEntityLink(model, "pen", type, slug),
  );
  if (models.length < 1) {
    throw new PublishedPageInvariantError(
      "invalid-model-cardinality",
      type,
      slug,
      "expected at least one public model",
    );
  }
  return { ...base, type, timeline, models };
}

function decodeModel(row: UnknownRecord, slug: string): ModelPageData {
  const type = "pen" as const;
  const base = decodeBase(row, type, slug);
  const specs = objectArray(row, "specs_json", type, slug).map(
    (spec): EvidenceBackedSpec => {
      const key = requiredString(spec, "key", type, slug);
      const value = spec.value;
      if (
        !(
          (typeof value === "string" && value.trim() !== "") ||
          typeof value === "number"
        )
      ) {
        malformed(type, slug, `spec ${key} has no display value`);
      }
      const source = decodeSource(spec.source, type, slug);
      if (!isRecord(spec.source))
        malformed(type, slug, `spec ${key} source is malformed`);
      return {
        key,
        label: SPEC_LABELS[key] ?? key,
        value,
        source: {
          ...source,
          locator: requiredString(spec.source, "locator", type, slug),
        },
      };
    },
  );
  if (specs.length < 1) {
    throw new PublishedPageInvariantError(
      "invalid-spec-cardinality",
      type,
      slug,
      "expected at least one qualified spec",
    );
  }
  const variants = objectArray(row, "variants_json", type, slug).map(
    (variant): QualifiedVariant => ({
      name: requiredString(variant, "name", type, slug),
      releaseYear: nullableString(variant, "releaseYear", type, slug),
      notes: nullableString(variant, "notes", type, slug),
      source: decodeSource(variant.source, type, slug),
    }),
  );
  const brands = objectArray(row, "model_brands_json", type, slug).map(
    (brand) => decodeEntityLink(brand, "brand", type, slug),
  );
  if (brands.length !== 1) {
    throw new PublishedPageInvariantError(
      "invalid-brand-cardinality",
      type,
      slug,
      `expected one public canonical brand, received ${brands.length}`,
    );
  }
  return { ...base, type, specs, variants, canonicalBrand: brands[0] };
}

export async function getPublishedEntityPage(
  type: PublishedEntityType,
  slug: string,
): Promise<PublishedPageData | null> {
  const unknownRow = await queryOne(PAGE_QUERY, [type, slug]);
  if (unknownRow === undefined) return null;
  if (!isRecord(unknownRow)) {
    throw new PublishedPageInvariantError(
      "malformed-row",
      type,
      slug,
      "database result must be an object",
    );
  }
  const rowType = requiredString(unknownRow, "entity_type", type, slug);
  if (rowType !== type || (rowType !== "brand" && rowType !== "pen")) {
    throw new PublishedPageInvariantError(
      "invalid-root",
      type,
      slug,
      `authorized root returned ${rowType}`,
    );
  }
  return rowType === "brand"
    ? decodeBrand(unknownRow, slug)
    : decodeModel(unknownRow, slug);
}
