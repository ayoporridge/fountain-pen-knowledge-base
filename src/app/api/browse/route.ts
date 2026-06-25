import { type NextRequest, NextResponse } from "next/server";
import { queryAll, queryOne } from "@/lib/db";

// Faceted dimensions and their corresponding tag dimensions
const FACET_DIMENSIONS: Record<
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

const TYPE_FILTERS: Record<string, string[]> = {
  pen: ["pen"],
  brand: ["brand"],
  article: ["article"],
  knowledge: ["concept", "fill_system", "nib"],
};

const ENTITY_SELECT = `
  e.id,
  e.type,
  e.slug,
  e.name,
  e.summary,
  (
    SELECT COALESCE(ma.thumbnail_url, ma.image_url)
    FROM media_assets ma
    WHERE ma.entity_id = e.id
      AND ma.asset_type = 'image'
      AND ma.image_url IS NOT NULL
      AND ma.review_status = 'approved'
      AND ma.usage_status IN ('primary', 'gallery')
    ORDER BY CASE ma.usage_status WHEN 'primary' THEN 0 ELSE 1 END,
             ma.created_at DESC
    LIMIT 1
  ) as image_url
`;

const ENTITY_ORDER = `
  CASE e.type
    WHEN 'pen' THEN 0
    WHEN 'brand' THEN 1
    WHEN 'article' THEN 2
    WHEN 'concept' THEN 3
    WHEN 'fill_system' THEN 4
    WHEN 'nib' THEN 5
    ELSE 6
  END,
  e.name
`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const typeFilter = searchParams.get("type") || "all";
  const allowedTypes = TYPE_FILTERS[typeFilter] || [];

  // Parse filter params: ?nib_type=弹性尖&origin=日本
  const filters: Array<{ dimension: string; tagSlug: string }> = [];
  for (const [key, value] of searchParams.entries()) {
    if (FACET_DIMENSIONS[key] && value) {
      filters.push({ dimension: key, tagSlug: value });
    }
  }

  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(
    Number.parseInt(searchParams.get("limit") || "20", 10),
    50,
  );
  const offset = (page - 1) * limit;

  // Build query based on filters
  let entities: Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
    image_url: string | null;
  }>;
  let total: number;

  if (filters.length === 0) {
    const typeWhere =
      allowedTypes.length > 0
        ? `WHERE e.type IN (${allowedTypes.map(() => "?").join(", ")})`
        : "";
    const typeParams = allowedTypes;

    total = (
      (await queryOne(
        `SELECT COUNT(*) as cnt FROM entities e ${typeWhere}`,
        typeParams,
      )) as {
        cnt: number;
      }
    ).cnt;
    entities = (await queryAll(
      `SELECT ${ENTITY_SELECT}
       FROM entities e
       ${typeWhere}
       ORDER BY ${ENTITY_ORDER}
       LIMIT ? OFFSET ?`,
      [...typeParams, limit, offset],
    )) as typeof entities;
  } else {
    // Build JOINs for each filter
    const joins: string[] = [];
    const conditions: string[] = [];
    const params: unknown[] = [];

    for (let i = 0; i < filters.length; i++) {
      joins.push(
        `JOIN entity_tags et${i} ON et${i}.entity_id = e.id
         JOIN tags t${i} ON t${i}.id = et${i}.tag_id AND t${i}.dimension = ? AND t${i}.slug = ?`,
      );
      params.push(filters[i].dimension, filters[i].tagSlug);
    }
    if (allowedTypes.length > 0) {
      conditions.push(`e.type IN (${allowedTypes.map(() => "?").join(", ")})`);
      params.push(...allowedTypes);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const joinClause = joins.join("\n");

    // Count
    const countSql = `SELECT COUNT(DISTINCT e.id) as cnt FROM entities e ${joinClause} ${whereClause}`;
    total = ((await queryOne(countSql, params)) as { cnt: number }).cnt;

    // Results
    const resultSql = `
      SELECT DISTINCT ${ENTITY_SELECT}
      FROM entities e
      ${joinClause}
      ${whereClause}
      ORDER BY ${ENTITY_ORDER}
      LIMIT ? OFFSET ?
    `;
    entities = (await queryAll(resultSql, [
      ...params,
      limit,
      offset,
    ])) as typeof entities;
  }

  // Get facet counts
  const facets: Record<
    string,
    Array<{ slug: string; name: string; count: number }>
  > = {};

  for (const [dimKey, dimInfo] of Object.entries(FACET_DIMENSIONS)) {
    const tagCounts = (await queryAll(
      `SELECT t.slug, t.name, COUNT(DISTINCT et.entity_id) as cnt
       FROM tags t
       LEFT JOIN entity_tags et ON et.tag_id = t.id
       WHERE t.dimension = ?
       GROUP BY t.id
       HAVING cnt > 0
       ORDER BY cnt DESC`,
      [dimInfo.tagDimension],
    )) as Array<{ slug: string; name: string; cnt: number }>;

    facets[dimKey] = tagCounts.map((tc) => ({
      slug: tc.slug,
      name: tc.name,
      count: tc.cnt,
    }));
  }

  const typeCounts = (await queryAll(
    `SELECT type, COUNT(*) as cnt
     FROM entities
     GROUP BY type`,
  )) as Array<{ type: string; cnt: number }>;

  return NextResponse.json({
    entities,
    total,
    page,
    limit,
    facets,
    typeCounts,
    activeFilters: Object.fromEntries(searchParams.entries()),
  });
}
