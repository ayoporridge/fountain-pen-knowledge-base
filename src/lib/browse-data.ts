import { queryAll, queryOne } from "@/lib/db";
import { getPublicMediaUrl } from "@/lib/media-url";
import { publicEntityFilter } from "@/lib/public-visibility";

export const FACET_DIMENSIONS: Record<
  string,
  { label: string; tagDimension: string }
> = {
  nib_type: { label: "笔尖类型", tagDimension: "nib_type" },
  nib_material: { label: "笔尖材质", tagDimension: "nib_material" },
  fill_system: { label: "上墨方式", tagDimension: "fill_system" },
  origin: { label: "产地", tagDimension: "origin" },
  price: { label: "价位", tagDimension: "price" },
  brand_tier: { label: "品牌定位", tagDimension: "brand_tier" },
  era: { label: "年代", tagDimension: "era" },
  size: { label: "尺寸", tagDimension: "size" },
  usage: { label: "用途", tagDimension: "usage" },
  style: { label: "风格", tagDimension: "style" },
  ink_type: { label: "墨水类型", tagDimension: "ink_type" },
  body_material: { label: "笔身材质", tagDimension: "body_material" },
};

export const GOLD_NIB_TAG_SLUGS = [
  "nibmat-gold",
  "nibmat-14k",
  "nibmat-18k",
  "nibmat-21k",
  "nibmat-bicolor",
] as const;

export const PRICE_UP_TO_500_TAG_SLUGS = ["price-entry", "price-mid"] as const;

const TYPE_FILTERS: Record<string, string[]> = {
  pen: ["pen"],
  brand: ["brand"],
  article: ["article"],
  knowledge: ["concept", "fill_system", "nib"],
};

export interface BrowseEntity {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  image_url: string | null;
  media_id: string | null;
}

export interface BrowseData {
  entities: BrowseEntity[];
  total: number;
  page: number;
  limit: number;
  facets: Record<string, Array<{ slug: string; name: string; count: number }>>;
  typeCounts: Array<{ type: string; cnt: number }>;
  activeFilters: Record<string, string>;
  activeType: string;
}

export type TagFilterGroup = {
  dimension: string;
  slugs: readonly string[];
};

export function getTagFilterGroups(
  filters: Record<string, string>,
): TagFilterGroup[] {
  const groups: TagFilterGroup[] = [];
  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;
    if (key === "max_price") {
      const maxPrice = Number.parseInt(value, 10);
      if (maxPrice <= 200) {
        groups.push({ dimension: "price", slugs: ["price-entry"] });
      } else if (maxPrice <= 500) {
        groups.push({
          dimension: "price",
          slugs: PRICE_UP_TO_500_TAG_SLUGS,
        });
      }
      continue;
    }

    const facet = FACET_DIMENSIONS[key];
    if (!facet) continue;
    groups.push({
      dimension: facet.tagDimension,
      slugs:
        key === "nib_material" && value === "gold"
          ? GOLD_NIB_TAG_SLUGS
          : [value],
    });
  }
  return groups;
}

export function buildTagFilterSql(
  groups: TagFilterGroup[],
  entityAlias = "e",
): { sql: string[]; params: unknown[] } {
  const sql: string[] = [];
  const params: unknown[] = [];
  for (const group of groups) {
    const slugPlaceholders = group.slugs.map(() => "?").join(", ");
    sql.push(`EXISTS (
      SELECT 1
      FROM entity_tags filter_et
      JOIN tags filter_t ON filter_t.id = filter_et.tag_id
      WHERE filter_et.entity_id = ${entityAlias}.id
        AND filter_t.dimension = ?
        AND filter_t.slug IN (${slugPlaceholders})
    )`);
    params.push(group.dimension, ...group.slugs);
  }
  return { sql, params };
}

function normalizeInput(
  input: URLSearchParams | Record<string, string | string[] | undefined>,
): Record<string, string> {
  const values: Record<string, string> = {};
  if (input instanceof URLSearchParams) {
    for (const [key, value] of input.entries()) values[key] = value;
    return values;
  }
  for (const [key, value] of Object.entries(input)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first) values[key] = first;
  }
  return values;
}

const MEDIA_ORDER = `CASE ma.usage_status WHEN 'primary' THEN 0 ELSE 1 END,
  CASE WHEN ma.local_path IS NOT NULL THEN 0 ELSE 1 END,
  ma.created_at DESC`;

export async function getBrowseData(
  input: URLSearchParams | Record<string, string | string[] | undefined>,
): Promise<BrowseData> {
  const values = normalizeInput(input);
  const activeType = values.type || "all";
  const allowedTypes = TYPE_FILTERS[activeType] || [];
  const page = Math.max(Number.parseInt(values.page || "1", 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(values.limit || "30", 10) || 30, 1),
    50,
  );
  const offset = (page - 1) * limit;
  const activeFilters = Object.fromEntries(
    Object.entries(values).filter(
      ([key, value]) =>
        !!value && (key === "max_price" || key in FACET_DIMENSIONS),
    ),
  );

  const conditions = [publicEntityFilter("e")];
  const params: unknown[] = [];
  if (allowedTypes.length > 0) {
    conditions.push(`e.type IN (${allowedTypes.map(() => "?").join(", ")})`);
    params.push(...allowedTypes);
  }
  const tagFilters = buildTagFilterSql(getTagFilterGroups(activeFilters), "e");
  conditions.push(...tagFilters.sql);
  params.push(...tagFilters.params);
  const where = `WHERE ${conditions.join(" AND ")}`;

  const count = (await queryOne(
    `SELECT COUNT(*) as cnt FROM entities e ${where}`,
    params,
  )) as { cnt: number };

  const rows = (await queryAll(
    `SELECT e.id, e.type, e.slug, e.name, e.summary,
            (
              SELECT ma.id FROM media_assets ma
              WHERE ma.entity_id = e.id
                AND ma.asset_type = 'image'
                AND ma.review_status = 'approved'
                AND ma.usage_status IN ('primary', 'gallery')
                AND (ma.local_path IS NOT NULL OR ma.image_url IS NOT NULL)
              ORDER BY ${MEDIA_ORDER}
              LIMIT 1
            ) as media_id,
            (
              SELECT ma.local_path FROM media_assets ma
              WHERE ma.entity_id = e.id
                AND ma.asset_type = 'image'
                AND ma.review_status = 'approved'
                AND ma.usage_status IN ('primary', 'gallery')
                AND (ma.local_path IS NOT NULL OR ma.image_url IS NOT NULL)
              ORDER BY ${MEDIA_ORDER}
              LIMIT 1
            ) as media_local_path,
            (
              SELECT ma.thumbnail_url FROM media_assets ma
              WHERE ma.entity_id = e.id
                AND ma.asset_type = 'image'
                AND ma.review_status = 'approved'
                AND ma.usage_status IN ('primary', 'gallery')
                AND (ma.local_path IS NOT NULL OR ma.image_url IS NOT NULL)
              ORDER BY ${MEDIA_ORDER}
              LIMIT 1
            ) as media_thumbnail_url,
            (
              SELECT ma.image_url FROM media_assets ma
              WHERE ma.entity_id = e.id
                AND ma.asset_type = 'image'
                AND ma.review_status = 'approved'
                AND ma.usage_status IN ('primary', 'gallery')
                AND (ma.local_path IS NOT NULL OR ma.image_url IS NOT NULL)
              ORDER BY ${MEDIA_ORDER}
              LIMIT 1
            ) as media_image_url
     FROM entities e
     ${where}
     ORDER BY
       CASE WHEN EXISTS (
         SELECT 1 FROM media_assets order_ma
         WHERE order_ma.entity_id = e.id
           AND order_ma.review_status = 'approved'
           AND order_ma.usage_status IN ('primary', 'gallery')
       ) THEN 0 ELSE 1 END,
       CASE WHEN length(COALESCE(e.summary, '')) >= 40 THEN 0 ELSE 1 END,
       (SELECT COUNT(*) FROM entity_tags order_et WHERE order_et.entity_id = e.id) DESC,
       CASE e.type WHEN 'pen' THEN 0 WHEN 'brand' THEN 1 WHEN 'article' THEN 2 ELSE 3 END,
       e.name COLLATE NOCASE,
       e.id
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  )) as Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
    media_id: string | null;
    media_local_path: string | null;
    media_thumbnail_url: string | null;
    media_image_url: string | null;
  }>;

  const entities: BrowseEntity[] = rows.map((row) => ({
    id: String(row.id),
    type: String(row.type),
    slug: String(row.slug),
    name: String(row.name),
    summary: row.summary ? String(row.summary) : null,
    media_id: row.media_id ? String(row.media_id) : null,
    image_url: getPublicMediaUrl({
      id: row.media_id,
      localPath: row.media_local_path,
      thumbnailUrl: row.media_thumbnail_url,
      imageUrl: row.media_image_url,
    }),
  }));

  const dimensions = Object.values(FACET_DIMENSIONS).map(
    (info) => info.tagDimension,
  );
  const facetRows = (await queryAll(
    `SELECT t.dimension, t.slug, t.name, COUNT(DISTINCT e.id) as cnt
     FROM tags t
     LEFT JOIN entity_tags et ON et.tag_id = t.id
     LEFT JOIN entities e ON e.id = et.entity_id AND ${publicEntityFilter("e")}
     WHERE t.dimension IN (${dimensions.map(() => "?").join(", ")})
     GROUP BY t.id
     HAVING cnt > 0
     UNION ALL
     SELECT 'nib_material' as dimension, 'gold' as slug,
            '所有金尖' as name, COUNT(DISTINCT e.id) as cnt
     FROM entities e
     JOIN entity_tags gold_et ON gold_et.entity_id = e.id
     JOIN tags gold_t ON gold_t.id = gold_et.tag_id
     WHERE ${publicEntityFilter("e")}
       AND gold_t.dimension = 'nib_material'
       AND gold_t.slug IN (${GOLD_NIB_TAG_SLUGS.map(() => "?").join(", ")})
     ORDER BY dimension, cnt DESC, name`,
    [...dimensions, ...GOLD_NIB_TAG_SLUGS],
  )) as Array<{
    dimension: string;
    slug: string;
    name: string;
    cnt: number;
  }>;
  const facets: BrowseData["facets"] = Object.fromEntries(
    Object.keys(FACET_DIMENSIONS).map((key) => [key, []]),
  );
  for (const row of facetRows) {
    const dimensionKey = Object.entries(FACET_DIMENSIONS).find(
      ([, info]) => info.tagDimension === row.dimension,
    )?.[0];
    if (!dimensionKey) continue;
    facets[dimensionKey].push({
      slug: String(row.slug),
      name: String(row.name),
      count: Number(row.cnt),
    });
  }

  const typeCounts = (await queryAll(
    `SELECT e.type, COUNT(*) as cnt
     FROM entities e
     WHERE ${publicEntityFilter("e")}
     GROUP BY e.type`,
  )) as Array<{ type: string; cnt: number }>;

  return {
    entities,
    total: Number(count.cnt),
    page,
    limit,
    facets,
    typeCounts: typeCounts.map((row) => ({
      type: String(row.type),
      cnt: Number(row.cnt),
    })),
    activeFilters,
    activeType,
  };
}
