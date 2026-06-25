import { nanoid } from "nanoid";
import { execute, queryAll } from "@/lib/db";

interface ConceptCondition {
  dimension: string;
  tag_slug: string;
}

/**
 * Evaluate which concept rules match a given entity.
 * Returns list of matched concept rule IDs.
 */
export async function matchConceptsForEntity(
  entityId: string,
): Promise<string[]> {
  // Get all concept rules
  const rules = (await queryAll(
    "SELECT id, conditions FROM concept_rules",
  )) as Array<{ id: string; conditions: string }>;

  // Get entity's tags
  const entityTags = (await queryAll(
    `SELECT t.dimension, t.slug FROM tags t
     JOIN entity_tags et ON et.tag_id = t.id
     WHERE et.entity_id = ?`,
    [entityId],
  )) as Array<{ dimension: string; slug: string }>;

  const tagSet = new Set(entityTags.map((t) => `${t.dimension}:${t.slug}`));

  const matched: string[] = [];

  for (const rule of rules) {
    try {
      const conditions: ConceptCondition[] = JSON.parse(rule.conditions);
      if (conditions.length === 0) continue;

      // All conditions must match (AND logic)
      const allMatch = conditions.every((c) =>
        tagSet.has(`${c.dimension}:${c.tag_slug}`),
      );
      if (allMatch) {
        matched.push(rule.id);
      }
    } catch {
      // skip invalid JSON
    }
  }

  return matched;
}

/**
 * Recompute all concept matches for all entities.
 * Call after tag changes or concept rule changes.
 */
export async function recomputeAllConceptMatches(): Promise<{
  total: number;
  matched: number;
}> {
  // Clear existing matches
  await execute("DELETE FROM concept_matches");

  const entities = (await queryAll("SELECT id FROM entities")) as Array<{
    id: string;
  }>;

  let totalMatches = 0;

  for (const entity of entities) {
    const conceptIds = await matchConceptsForEntity(entity.id);
    for (const conceptId of conceptIds) {
      await execute(
        "INSERT OR IGNORE INTO concept_matches (id, concept_id, entity_id) VALUES (?, ?, ?)",
        [nanoid(12), conceptId, entity.id],
      );
      totalMatches++;
    }
  }

  return { total: entities.length, matched: totalMatches };
}

/**
 * Get entities matching a concept by concept rule ID.
 */
export async function getEntitiesForConcept(conceptId: string) {
  return queryAll(
    `SELECT e.id, e.type, e.slug, e.name, e.summary
     FROM concept_matches cm
     JOIN concept_rules cr ON cr.id = cm.concept_id
     JOIN entities e ON e.id = cm.entity_id
     WHERE cr.id = ?
     ORDER BY e.name`,
    [conceptId],
  );
}
