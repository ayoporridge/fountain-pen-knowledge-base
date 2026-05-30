-- Migration 006: Full-text search with FTS5
-- Using trigram tokenizer for Chinese support (no external deps)

CREATE VIRTUAL TABLE IF NOT EXISTS entities_fts USING fts5(
  name,
  summary,
  body_md,
  content='entities',
  content_rowid='rowid',
  tokenize='trigram'
);

-- Populate FTS index
INSERT INTO entities_fts(rowid, name, summary, body_md)
SELECT rowid, name, COALESCE(summary, ''), COALESCE(body_md, '')
FROM entities;

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS entities_ai AFTER INSERT ON entities BEGIN
  INSERT INTO entities_fts(rowid, name, summary, body_md)
  VALUES (new.rowid, new.name, COALESCE(new.summary, ''), COALESCE(new.body_md, ''));
END;

CREATE TRIGGER IF NOT EXISTS entities_ad AFTER DELETE ON entities BEGIN
  INSERT INTO entities_fts(entities_fts, rowid, name, summary, body_md)
  VALUES ('delete', old.rowid, old.name, COALESCE(old.summary, ''), COALESCE(old.body_md, ''));
END;

CREATE TRIGGER IF NOT EXISTS entities_au AFTER UPDATE ON entities BEGIN
  INSERT INTO entities_fts(entities_fts, rowid, name, summary, body_md)
  VALUES ('delete', old.rowid, old.name, COALESCE(old.summary, ''), COALESCE(old.body_md, ''));
  INSERT INTO entities_fts(rowid, name, summary, body_md)
  VALUES (new.rowid, new.name, COALESCE(new.summary, ''), COALESCE(new.body_md, ''));
END;
