import { getDb } from "@/lib/db";
import { nanoid } from "nanoid";

interface ConceptCondition {
  dimension: string;
  tag_slug: string;
}

/**
 * Evaluate which concept rules match a given entity.
 * Returns list of matched concept rule IDs.
 */
export async function matchConceptsForEntity(entityId: string): Promise<string[]> {
  const db = await getDb();

  // Get all concept rules
  const rules = (await db
    .prepare("SELECT id, conditions FROM concept_rules")
    .all()).results as Array<{ id: string; conditions: string }>;

  // Get entity's tags
  const entityTags = (await db
    .prepare(
      `SELECT t.dimension, t.slug FROM tags t
       JOIN entity_tags et ON et.tag_id = t.id
       WHERE et.entity_id = ?`,
    )
    .bind(entityId)
    .all()).results as Array<{ dimension: string; slug: string }>;

  const tagSet = new Set(entityTags.map((t) => `${t.dimension}:${t.slug}`));

  const matched: string[] = [];

  for (const rule of rules) {
    try {
      const conditions: ConceptCondition[] = JSON.parse(rule.conditions);
      if (conditions.length === 0) continue;

      // All conditions must match (AND logic)
      const allMatch = conditions.every((c) => tagSet.has(`${c.dimension}:${c.tag_slug}`));
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
export async function recomputeAllConceptMatches(): Promise<{ total: number; matched: number }> {
  const db = await getDb();

  // Clear existing matches
  await db.prepare("DELETE FROM concept_matches").run();

  const entities = (await db.prepare("SELECT id FROM entities").all()).results as Array<{ id: string }>;

  let totalMatches = 0;

  for (const entity of entities) {
    const conceptIds = await matchConceptsForEntity(entity.id);
    for (const conceptId of conceptIds) {
      await db.prepare(
        "INSERT OR IGNORE INTO concept_matches (id, concept_id, entity_id) VALUES (?, ?, ?)",
      ).bind(nanoid(12), conceptId, entity.id).run();
      totalMatches++;
    }
  }

  return { total: entities.length, matched: totalMatches };
}

/**
 * Get entities matching a concept by slug.
 */
export async function getEntitiesForConcept(conceptSlug: string) {
  const db = await getDb();

  return (await db
    .prepare(
      `SELECT e.id, e.type, e.slug, e.name, e.summary
       FROM concept_matches cm
       JOIN concept_rules cr ON cr.id = cm.concept_id
       JOIN entities e ON e.id = cm.entity_id
       WHERE cr.slug = ?
       ORDER BY e.name`,
    )
    .bind(conceptSlug)
    .all()).results;
}
