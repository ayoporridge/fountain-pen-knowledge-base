-- Migration 005: Add source attribution to entities
ALTER TABLE entities ADD COLUMN source_url TEXT;
ALTER TABLE entities ADD COLUMN source_file TEXT;
ALTER TABLE entities ADD COLUMN imported_at TEXT;
