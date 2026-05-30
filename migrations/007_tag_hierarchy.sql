-- Migration 007: Tag hierarchy + concept rules

-- Tag hierarchy: parent-child relationships between tags
CREATE TABLE IF NOT EXISTS tag_hierarchy (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  child_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(parent_id, child_id)
);

-- Concept rules: conditions that map to concept entities
CREATE TABLE IF NOT EXISTS concept_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  -- JSON array of conditions: [{"dimension": "fill_system", "tag_slug": "fill-piston"}, ...]
  conditions TEXT NOT NULL DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Materialized concept-entity matches (for fast lookup)
CREATE TABLE IF NOT EXISTS concept_matches (
  id TEXT PRIMARY KEY,
  concept_id TEXT NOT NULL REFERENCES concept_rules(id) ON DELETE CASCADE,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  matched_at TEXT DEFAULT (datetime('now')),
  UNIQUE(concept_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_concept_matches_concept ON concept_matches(concept_id);
CREATE INDEX IF NOT EXISTS idx_concept_matches_entity ON concept_matches(entity_id);
CREATE INDEX IF NOT EXISTS idx_tag_hierarchy_parent ON tag_hierarchy(parent_id);
CREATE INDEX IF NOT EXISTS idx_tag_hierarchy_child ON tag_hierarchy(child_id);
