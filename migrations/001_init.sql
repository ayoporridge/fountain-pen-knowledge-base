-- Migration tracking table
CREATE TABLE IF NOT EXISTS migrations (
  name TEXT PRIMARY KEY NOT NULL,
  applied_at TEXT NOT NULL
);
