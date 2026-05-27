-- Tag system: atomic tags → chunks → entities
-- Dimensions: nib_type, fill_system, body_material, origin, price, usage, size, era, brand_tier, etc.

CREATE TABLE tags (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  dimension TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('atom', 'chunk', 'entity')),
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_tags_dimension ON tags(dimension);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_level ON tags(level);

-- Entity ↔ Tag many-to-many
CREATE TABLE entity_tags (
  id TEXT PRIMARY KEY NOT NULL,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(entity_id, tag_id)
);

CREATE INDEX idx_entity_tags_entity ON entity_tags(entity_id);
CREATE INDEX idx_entity_tags_tag ON entity_tags(tag_id);

-- Tag compositions: chunk = combination of atoms
CREATE TABLE tag_compositions (
  id TEXT PRIMARY KEY NOT NULL,
  parent_tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  child_tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(parent_tag_id, child_tag_id)
);

CREATE INDEX idx_tag_comp_parent ON tag_compositions(parent_tag_id);
CREATE INDEX idx_tag_comp_child ON tag_compositions(child_tag_id);
