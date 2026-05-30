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
export function matchConceptsForEntity(entityId: string): string[] {
  const db = getDb();

  // Get all concept rules
  const rules = db
    .prepare("SELECT id, conditions FROM concept_rules")
    .all() as Array<{ id: string; conditions: string }>;

  // Get entity's tags
  const entityTags = db
    .prepare(
      `SELECT t.dimension, t.slug FROM tags t
       JOIN entity_tags et ON et.tag_id = t.id
       WHERE et.entity_id = ?`,
    )
    .all(entityId) as Array<{ dimension: string; slug: string }>;

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
export function recomputeAllConceptMatches(): { total: number; matched: number } {
  const db = getDb();

  // Clear existing matches
  db.prepare("DELETE FROM concept_matches").run();

  const entities = db.prepare("SELECT id FROM entities").all() as Array<{ id: string }>;
  const insertMatch = db.prepare(
    "INSERT OR IGNORE INTO concept_matches (id, concept_id, entity_id) VALUES (?, ?, ?)",
  );

  let totalMatches = 0;

  for (const entity of entities) {
    const conceptIds = matchConceptsForEntity(entity.id);
    for (const conceptId of conceptIds) {
      insertMatch.run(nanoid(12), conceptId, entity.id);
      totalMatches++;
    }
  }

  return { total: entities.length, matched: totalMatches };
}

/**
 * Get entities matching a concept by slug.
 */
export function getEntitiesForConcept(conceptSlug: string) {
  const db = getDb();

  return db
    .prepare(
      `SELECT e.id, e.type, e.slug, e.name, e.summary
       FROM concept_matches cm
       JOIN concept_rules cr ON cr.id = cm.concept_id
       JOIN entities e ON e.id = cm.entity_id
       WHERE cr.slug = ?
       ORDER BY e.name`,
    )
    .all(conceptSlug);
}
