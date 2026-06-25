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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

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
    // No filters: return all entities
    total = (
      (await queryOne("SELECT COUNT(*) as cnt FROM entities")) as {
        cnt: number;
      }
    ).cnt;
    entities = (await queryAll(
      "SELECT id, type, slug, name, summary, image_url FROM entities ORDER BY name LIMIT ? OFFSET ?",
      [limit, offset],
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

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const joinClause = joins.join("\n");

    // Count
    const countSql = `SELECT COUNT(DISTINCT e.id) as cnt FROM entities e ${joinClause} ${whereClause}`;
    total = ((await queryOne(countSql, params)) as { cnt: number }).cnt;

    // Results
    const resultSql = `
      SELECT DISTINCT e.id, e.type, e.slug, e.name, e.summary, e.image_url
      FROM entities e
      ${joinClause}
      ${whereClause}
      ORDER BY e.name
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

  return NextResponse.json({
    entities,
    total,
    page,
    limit,
    facets,
    activeFilters: Object.fromEntries(searchParams.entries()),
  });
}
