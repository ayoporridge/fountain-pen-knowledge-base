import { queryAll } from "@/lib/db";

interface RecommendedEntity {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  score: number;
  reason: string;
}

/**
 * Get recommended entities for a given entity based on:
 * 1. Graph distance (2-hop neighbors via shared connections)
 * 2. Tag similarity (shared tags)
 * 3. Exclude the entity itself
 */
export async function getRecommendations(
  entityId: string,
  limit = 8,
): Promise<RecommendedEntity[]> {
  // Strategy 1: 2-hop graph neighbors (entities connected to my connections)
  const twoHop = await queryAll(
    `SELECT e.id, e.type, e.slug, e.name, e.summary,
            COUNT(DISTINCT e.id) as shared_neighbors,
            'graph' as reason
     FROM entity_links l1
     JOIN entity_links l2 ON (l1.target_id = l2.source_id OR l1.target_id = l2.target_id
                              OR l1.source_id = l2.source_id OR l1.source_id = l2.target_id)
     JOIN entities e ON (e.id = l2.target_id OR e.id = l2.source_id)
     WHERE (l1.source_id = ? OR l1.target_id = ?)
       AND e.id != ?
       AND e.id NOT IN (
         SELECT target_id FROM entity_links WHERE source_id = ?
         UNION
         SELECT source_id FROM entity_links WHERE target_id = ?
       )
     GROUP BY e.id
     ORDER BY shared_neighbors DESC
     LIMIT ?`,
    [entityId, entityId, entityId, entityId, entityId, limit * 2]
  ) as Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
    shared_neighbors: number;
    reason: string;
  }>;

  // Strategy 2: Tag similarity
  const tagSimilar = await queryAll(
    `SELECT e.id, e.type, e.slug, e.name, e.summary,
            COUNT(DISTINCT et2.tag_id) as shared_tags,
            'tag' as reason
     FROM entity_tags et1
     JOIN entity_tags et2 ON et1.tag_id = et2.tag_id AND et2.entity_id != ?
     JOIN entities e ON e.id = et2.entity_id
     WHERE et1.entity_id = ?
     GROUP BY e.id
     ORDER BY shared_tags DESC
     LIMIT ?`,
    [entityId, entityId, limit * 2]
  ) as Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
    shared_tags: number;
    reason: string;
  }>;

  // Merge and deduplicate, favoring graph neighbors
  const seen = new Set<string>([entityId]);
  const merged: RecommendedEntity[] = [];

  for (const item of twoHop) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push({
      ...item,
      score: item.shared_neighbors * 2,
      reason: `通过 ${item.shared_neighbors} 个共同关联发现`,
    });
  }

  for (const item of tagSimilar) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push({
      ...item,
      score: item.shared_tags,
      reason: `共享 ${item.shared_tags} 个标签`,
    });
  }

  // Sort by score, return top N
  return merged.sort((a, b) => b.score - a.score).slice(0, limit);
}
