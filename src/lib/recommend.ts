import { queryAll, queryOne } from "@/lib/db";
import { publicEntityFilter } from "@/lib/public-visibility";

export interface RecommendedEntity {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  score: number;
  reason: string;
}

const LINK_REASON_LABELS: Record<string, string> = {
  brand_model: "品牌与型号直接关联",
  made_by: "品牌制造关系",
  same_brand: "同一品牌",
  same_series: "同一系列",
  uses: "使用相同机制或材料",
  implements: "实现同一工艺概念",
  predecessor: "前后代型号关系",
  successor: "前后代型号关系",
  related_to: "资料中直接相关",
  related: "资料中直接相关",
};

const TAG_REASON_PRIORITY: Record<string, number> = {
  nib_material: 85,
  nib_type: 80,
  fill_system: 75,
  origin: 70,
  body_material: 65,
};

function tagReason(value: string): { label: string; priority: number } | null {
  const separator = value.indexOf("|");
  if (separator < 1) return null;
  const dimension = value.slice(0, separator);
  const name = value.slice(separator + 1);
  if (!name) return null;

  const labels: Record<string, string> = {
    nib_material: `同为「${name}」笔尖材质`,
    nib_type: `同为「${name}」笔尖类型`,
    fill_system: `同用「${name}」上墨方式`,
    origin: `同为「${name}」产地`,
    body_material: `同用「${name}」笔身材质`,
  };

  if (!TAG_REASON_PRIORITY[dimension]) return null;

  return {
    label: labels[dimension] || `同属「${name}」分类`,
    priority: TAG_REASON_PRIORITY[dimension] || 10,
  };
}

/**
 * Recommend public entities using explanations people can evaluate: direct
 * graph relations first, then same series/brand, followed by the strongest
 * shared product facet. Hidden/index-only entities are filtered in every query.
 */
export async function getRecommendations(
  entityId: string,
  limit = 8,
): Promise<RecommendedEntity[]> {
  const current = (await queryOne(
    "SELECT id, type, name FROM entities WHERE id = ?",
    [entityId],
  )) as { id: string; type: string; name: string } | undefined;
  if (!current) return [];

  const direct = (await queryAll(
    `SELECT e.id, e.type, e.slug, e.name, e.summary,
            el.link_type
     FROM entity_links el
     JOIN entities e ON (
       (el.source_id = ? AND e.id = el.target_id)
       OR (el.target_id = ? AND e.id = el.source_id)
     )
     WHERE (el.source_id = ? OR el.target_id = ?)
       AND el.link_type != 'reverse'
       AND ${publicEntityFilter("e")}
     ORDER BY CASE el.link_type
       WHEN 'brand_model' THEN 0
       WHEN 'made_by' THEN 1
       WHEN 'same_series' THEN 2
       WHEN 'same_brand' THEN 3
       ELSE 4
     END, e.name
     LIMIT ?`,
    [entityId, entityId, entityId, entityId, limit * 3],
  )) as Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
    link_type: string;
  }>;

  const modelPeers = (await queryAll(
    `WITH approved_specs AS (
       SELECT ms.*
       FROM model_specs ms
       WHERE ms.review_status = 'approved'
         AND EXISTS (
           SELECT 1
           FROM citations citation
           LEFT JOIN claims claim ON claim.id = citation.claim_id
           JOIN source_items source_item
             ON source_item.id = COALESCE(citation.source_item_id, claim.source_item_id)
           WHERE citation.target_type = 'model_spec'
             AND citation.target_id = ms.id
             AND source_item.review_status = 'approved'
             AND (citation.claim_id IS NULL OR claim.review_status = 'approved')
         )
     )
     SELECT e.id, e.type, e.slug, e.name, e.summary,
            candidate.series_name, brand.name as brand_name,
            CASE
              WHEN COALESCE(candidate.series_name, '') != ''
               AND candidate.series_name = current.series_name THEN 'series'
              ELSE 'brand'
            END as match_kind
     FROM approved_specs current
     JOIN approved_specs candidate ON candidate.entity_id != current.entity_id
       AND current.brand_entity_id IS NOT NULL
       AND candidate.brand_entity_id = current.brand_entity_id
     JOIN entities e ON e.id = candidate.entity_id
     LEFT JOIN entities brand ON brand.id = candidate.brand_entity_id
     WHERE current.entity_id = ?
       AND ${publicEntityFilter("e")}
     ORDER BY CASE match_kind WHEN 'series' THEN 0 ELSE 1 END, e.name
     LIMIT ?`,
    [entityId, limit * 3],
  )) as Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
    series_name: string | null;
    brand_name: string | null;
    match_kind: "series" | "brand";
  }>;

  const tagPeers = (await queryAll(
    `SELECT e.id, e.type, e.slug, e.name, e.summary,
            COUNT(DISTINCT t.id) as shared_tags,
            GROUP_CONCAT(DISTINCT t.dimension || '|' || t.name) as shared_tag_labels
     FROM entity_tags mine
     JOIN tags t ON t.id = mine.tag_id
     JOIN entity_tags theirs ON theirs.tag_id = mine.tag_id
       AND theirs.entity_id != mine.entity_id
     JOIN entities e ON e.id = theirs.entity_id
     WHERE mine.entity_id = ?
       AND t.dimension IN (
         'nib_material', 'nib_type', 'fill_system', 'origin', 'body_material'
       )
       AND ${publicEntityFilter("e")}
     GROUP BY e.id, e.type, e.slug, e.name, e.summary
     ORDER BY shared_tags DESC, e.name
     LIMIT ?`,
    [entityId, limit * 5],
  )) as Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
    shared_tags: number;
    shared_tag_labels: string | null;
  }>;

  const seen = new Set<string>([entityId]);
  const merged: RecommendedEntity[] = [];

  for (const item of direct) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push({
      id: item.id,
      type: item.type,
      slug: item.slug,
      name: item.name,
      summary: item.summary,
      score: 300,
      reason:
        LINK_REASON_LABELS[item.link_type] ||
        `与「${current.name}」有直接资料关联`,
    });
  }

  for (const item of modelPeers) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    const sameSeries = item.match_kind === "series" && item.series_name;
    merged.push({
      id: item.id,
      type: item.type,
      slug: item.slug,
      name: item.name,
      summary: item.summary,
      score: sameSeries ? 250 : 230,
      reason: sameSeries
        ? `同属「${item.series_name}」系列`
        : `同为「${item.brand_name || "该品牌"}」的型号`,
    });
  }

  for (const item of tagPeers) {
    if (seen.has(item.id)) continue;
    const reasons = String(item.shared_tag_labels || "")
      .split(",")
      .map(tagReason)
      .filter((value): value is { label: string; priority: number } =>
        Boolean(value),
      )
      .sort((a, b) => b.priority - a.priority);
    if (reasons.length === 0) continue;
    seen.add(item.id);
    merged.push({
      id: item.id,
      type: item.type,
      slug: item.slug,
      name: item.name,
      summary: item.summary,
      score: 80 + reasons[0].priority + Number(item.shared_tags || 0),
      reason: reasons
        .slice(0, 2)
        .map((reason) => reason.label)
        .join("；"),
    });
  }

  return merged
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "zh-CN"))
    .slice(0, limit);
}
