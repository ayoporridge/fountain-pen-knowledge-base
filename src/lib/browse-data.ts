import { queryAll, queryOne } from "@/lib/db";
import { getPublicMediaUrl } from "@/lib/media-url";
import { publicMediaFilter } from "@/lib/public-media";
import { publicEntityFilter } from "@/lib/public-visibility";

export const FACET_DIMENSIONS: Record<
  string,
  { label: string; tagDimension: string }
> = {
  nib_type: { label: "笔尖类型", tagDimension: "nib_type" },
  nib_material: { label: "笔尖材质", tagDimension: "nib_material" },
  fill_system: { label: "上墨方式", tagDimension: "fill_system" },
  origin: { label: "产地", tagDimension: "origin" },
  body_material: { label: "笔身材质", tagDimension: "body_material" },
};

export const GOLD_NIB_TAG_SLUGS = [
  "nibmat-gold",
  "nibmat-14k",
  "nibmat-18k",
  "nibmat-21k",
  "nibmat-bicolor",
] as const;

const TYPE_FILTERS: Record<string, string[]> = {
  pen: ["pen"],
  brand: ["brand"],
  article: ["article"],
  knowledge: ["concept", "fill_system", "nib"],
};

export interface BrowseEntity {
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  classification: string | null;
  source_count: number;
  image_url: string | null;
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
  ma.created_at DESC,
  ma.id`;

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
      ([key, value]) => !!value && key in FACET_DIMENSIONS,
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

  const countPromise = queryOne(
    `SELECT COUNT(*) as cnt FROM entities e ${where}`,
    params,
  ) as Promise<{ cnt: number }>;

  const rowsPromise = queryAll(
    `SELECT e.id, e.type, e.slug, e.name, e.summary,
            (
              SELECT GROUP_CONCAT(public_tag.name, ' · ')
              FROM (
                SELECT t.name
                FROM entity_tags card_et
                JOIN tags t ON t.id = card_et.tag_id
                WHERE card_et.entity_id = e.id
                  AND t.dimension IN (
                    'nib_type', 'nib_material', 'fill_system', 'origin',
                    'body_material'
                  )
                ORDER BY t.dimension, t.name
                LIMIT 3
              ) public_tag
            ) as classification,
            (
              SELECT COUNT(*)
              FROM entity_references card_er
              JOIN source_items card_si ON card_si.id = card_er.source_item_id
              WHERE card_er.entity_id = e.id
                AND card_er.review_status = 'approved'
                AND card_si.review_status = 'approved'
            ) as source_count,
            (
              SELECT ma.id FROM media_assets ma
              WHERE ma.entity_id = e.id
                AND ${publicMediaFilter("ma")}
              ORDER BY ${MEDIA_ORDER}
              LIMIT 1
            ) as media_id,
            (
              SELECT ma.local_path FROM media_assets ma
              WHERE ma.entity_id = e.id
                AND ${publicMediaFilter("ma")}
              ORDER BY ${MEDIA_ORDER}
              LIMIT 1
            ) as media_local_path,
            (
              SELECT ma.thumbnail_url FROM media_assets ma
              WHERE ma.entity_id = e.id
                AND ${publicMediaFilter("ma")}
              ORDER BY ${MEDIA_ORDER}
              LIMIT 1
            ) as media_thumbnail_url,
            (
              SELECT ma.image_url FROM media_assets ma
              WHERE ma.entity_id = e.id
                AND ${publicMediaFilter("ma")}
              ORDER BY ${MEDIA_ORDER}
              LIMIT 1
            ) as media_image_url
     FROM entities e
     ${where}
     ORDER BY
       CASE WHEN EXISTS (
         SELECT 1 FROM media_assets order_ma
         WHERE order_ma.entity_id = e.id
           AND ${publicMediaFilter("order_ma")}
       ) THEN 0 ELSE 1 END,
       CASE WHEN length(COALESCE(e.summary, '')) >= 40 THEN 0 ELSE 1 END,
       (SELECT COUNT(*) FROM entity_tags order_et WHERE order_et.entity_id = e.id) DESC,
       CASE e.type WHEN 'pen' THEN 0 WHEN 'brand' THEN 1 WHEN 'article' THEN 2 ELSE 3 END,
       e.name COLLATE NOCASE,
       e.id
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  ) as Promise<
    Array<{
      id: string;
      type: string;
      slug: string;
      name: string;
      summary: string | null;
      classification: string | null;
      source_count: number;
      media_id: string | null;
      media_local_path: string | null;
      media_thumbnail_url: string | null;
      media_image_url: string | null;
    }>
  >;

  const facetGroupsPromise = Promise.all(
    Object.entries(FACET_DIMENSIONS).map(async ([facetKey, info]) => {
      const facetConditions = [publicEntityFilter("facet_e")];
      const facetParams: unknown[] = [];
      if (allowedTypes.length > 0) {
        facetConditions.push(
          `facet_e.type IN (${allowedTypes.map(() => "?").join(", ")})`,
        );
        facetParams.push(...allowedTypes);
      }
      const otherFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(([key]) => key !== facetKey),
      );
      const otherTagFilters = buildTagFilterSql(
        getTagFilterGroups(otherFilters),
        "facet_e",
      );
      facetConditions.push(...otherTagFilters.sql);
      facetParams.push(...otherTagFilters.params);

      const facetRowsPromise = queryAll(
        `SELECT t.slug, t.name, COUNT(DISTINCT facet_e.id) as cnt
         FROM tags t
         JOIN entity_tags facet_et ON facet_et.tag_id = t.id
         JOIN entities facet_e ON facet_e.id = facet_et.entity_id
         WHERE t.dimension = ?
           AND ${facetConditions.join(" AND ")}
         GROUP BY t.id
         HAVING cnt > 0
         ORDER BY cnt DESC, t.name`,
        [info.tagDimension, ...facetParams],
      ) as Promise<Array<{ slug: string; name: string; cnt: number }>>;

      const goldPromise =
        facetKey === "nib_material"
          ? (queryOne(
              `SELECT COUNT(DISTINCT facet_e.id) as cnt
               FROM entities facet_e
               JOIN entity_tags gold_et ON gold_et.entity_id = facet_e.id
               JOIN tags gold_t ON gold_t.id = gold_et.tag_id
               WHERE gold_t.dimension = 'nib_material'
                 AND gold_t.slug IN (${GOLD_NIB_TAG_SLUGS.map(() => "?").join(", ")})
                 AND ${facetConditions.join(" AND ")}`,
              [...GOLD_NIB_TAG_SLUGS, ...facetParams],
            ) as Promise<{ cnt: number }>)
          : Promise.resolve(undefined);

      const [rows, gold] = await Promise.all([facetRowsPromise, goldPromise]);

      const options = rows.map((row) => ({
        slug: String(row.slug),
        name: String(row.name),
        count: Number(row.cnt),
      }));

      if (gold) {
        if (Number(gold.cnt || 0) > 0) {
          options.unshift({
            slug: "gold",
            name: "所有金尖",
            count: Number(gold.cnt),
          });
        }
      }

      return [facetKey, options] as const;
    }),
  );

  const typeCountsPromise = queryAll(
    `SELECT e.type, COUNT(*) as cnt
     FROM entities e
     WHERE ${publicEntityFilter("e")}
     GROUP BY e.type`,
  ) as Promise<Array<{ type: string; cnt: number }>>;

  const [count, rows, facetGroups, typeCounts] = await Promise.all([
    countPromise,
    rowsPromise,
    facetGroupsPromise,
    typeCountsPromise,
  ]);
  const entities: BrowseEntity[] = rows.map((row) => ({
    type: String(row.type),
    slug: String(row.slug),
    name: String(row.name),
    summary:
      !["pen", "brand"].includes(String(row.type)) && row.summary
        ? String(row.summary)
        : null,
    classification: row.classification ? String(row.classification) : null,
    source_count: Number(row.source_count || 0),
    image_url: getPublicMediaUrl({
      id: row.media_id,
      localPath: row.media_local_path,
      thumbnailUrl: row.media_thumbnail_url,
      imageUrl: row.media_image_url,
    }),
  }));
  const facets: BrowseData["facets"] = Object.fromEntries(facetGroups);

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
