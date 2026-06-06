-- Migration: Fix FK references and import data
-- This migration fixes the entities_backup FK issue and imports missing data

-- Step 1: Fix entity_attributes FK
CREATE TABLE IF NOT EXISTS entity_attributes_new (
  id TEXT PRIMARY KEY NOT NULL,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT,
  UNIQUE(entity_id, key)
);

INSERT OR IGNORE INTO entity_attributes_new SELECT * FROM entity_attributes;
DROP TABLE IF EXISTS entity_attributes;
ALTER TABLE entity_attributes_new RENAME TO entity_attributes;
CREATE INDEX IF NOT EXISTS idx_entity_attributes_entity ON entity_attributes(entity_id);

-- Step 2: Fix entity_tags FK
CREATE TABLE IF NOT EXISTS entity_tags_new (
  id TEXT PRIMARY KEY NOT NULL,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(entity_id, tag_id)
);

INSERT OR IGNORE INTO entity_tags_new SELECT * FROM entity_tags;
DROP TABLE IF EXISTS entity_tags;
ALTER TABLE entity_tags_new RENAME TO entity_tags;
CREATE INDEX IF NOT EXISTS idx_entity_tags_entity ON entity_tags(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_tags_tag ON entity_tags(tag_id);

-- Step 3: Fix entity_links FK
CREATE TABLE IF NOT EXISTS entity_links_new (
  id TEXT PRIMARY KEY NOT NULL,
  source_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL DEFAULT 'related',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(source_id, target_id, link_type)
);

INSERT OR IGNORE INTO entity_links_new SELECT * FROM entity_links;
DROP TABLE IF EXISTS entity_links;
ALTER TABLE entity_links_new RENAME TO entity_links;
CREATE INDEX IF NOT EXISTS idx_entity_links_source ON entity_links(source_id);
CREATE INDEX IF NOT EXISTS idx_entity_links_target ON entity_links(target_id);

-- Step 4: Fix concept_matches FK
CREATE TABLE IF NOT EXISTS concept_matches_new (
  id TEXT PRIMARY KEY,
  concept_id TEXT NOT NULL REFERENCES concept_rules(id) ON DELETE CASCADE,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  matched_at TEXT DEFAULT (datetime('now')),
  UNIQUE(concept_id, entity_id)
);

INSERT OR IGNORE INTO concept_matches_new SELECT * FROM concept_matches;
DROP TABLE IF EXISTS concept_matches;
ALTER TABLE concept_matches_new RENAME TO concept_matches;
