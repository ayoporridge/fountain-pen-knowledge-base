-- Entity links: directed relationships between entities
-- Supports forward links (source → target) and automatic reverse link tracking

CREATE TABLE entity_links (
  id TEXT PRIMARY KEY NOT NULL,
  source_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL DEFAULT 'related',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(source_id, target_id, link_type)
);

CREATE INDEX idx_entity_links_source ON entity_links(source_id);
CREATE INDEX idx_entity_links_target ON entity_links(target_id);
CREATE INDEX idx_entity_links_type ON entity_links(link_type);

-- Prevent self-links
CREATE TRIGGER trg_no_self_link
BEFORE INSERT ON entity_links
WHEN NEW.source_id = NEW.target_id
BEGIN
  SELECT RAISE(ABORT, 'Cannot create self-link');
END;

-- Auto-create reverse link when a forward link is inserted
CREATE TRIGGER trg_link_reverse_insert
AFTER INSERT ON entity_links
WHEN NEW.link_type != 'reverse'
BEGIN
  INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, created_at)
  VALUES (
    'rev-' || NEW.id,
    NEW.target_id,
    NEW.source_id,
    'reverse',
    NEW.created_at
  );
END;

-- Auto-remove reverse link when a forward link is deleted
CREATE TRIGGER trg_link_reverse_delete
AFTER DELETE ON entity_links
WHEN OLD.link_type != 'reverse'
BEGIN
  DELETE FROM entity_links WHERE id = 'rev-' || OLD.id;
END;
