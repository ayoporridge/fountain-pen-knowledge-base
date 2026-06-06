import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "fpkg.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

console.log("=== Current FK references ===");
const tables = ["entity_attributes", "entity_tags", "entity_links", "concept_matches"];
for (const table of tables) {
  const createSql = (db.prepare(`SELECT sql FROM sqlite_master WHERE name = ? AND type = 'table'`).get(table) as {sql: string} | undefined)?.sql;
  if (createSql && createSql.includes("entities_backup")) {
    console.log(`  ${table}: has entities_backup FK - NEEDS FIX`);
  } else {
    console.log(`  ${table}: OK`);
  }
}

console.log("\n=== Fixing schema ===");

// Fix entity_attributes
console.log("Recreating entity_attributes...");
db.exec(`
  CREATE TABLE entity_attributes_new (
    id TEXT PRIMARY KEY NOT NULL,
    entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT,
    UNIQUE(entity_id, key)
  );
  INSERT INTO entity_attributes_new SELECT * FROM entity_attributes;
  DROP TABLE entity_attributes;
  ALTER TABLE entity_attributes_new RENAME TO entity_attributes;
  CREATE INDEX IF NOT EXISTS idx_entity_attributes_entity ON entity_attributes(entity_id);
`);
console.log("  ✓ entity_attributes fixed");

// Fix entity_tags
console.log("Recreating entity_tags...");
db.exec(`
  CREATE TABLE entity_tags_new (
    id TEXT PRIMARY KEY NOT NULL,
    entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(entity_id, tag_id)
  );
  INSERT INTO entity_tags_new SELECT * FROM entity_tags;
  DROP TABLE entity_tags;
  ALTER TABLE entity_tags_new RENAME TO entity_tags;
  CREATE INDEX IF NOT EXISTS idx_entity_tags_entity ON entity_tags(entity_id);
  CREATE INDEX IF NOT EXISTS idx_entity_tags_tag ON entity_tags(tag_id);
`);
console.log("  ✓ entity_tags fixed");

// Fix entity_links if it exists
const hasLinks = db.prepare("SELECT name FROM sqlite_master WHERE name = 'entity_links' AND type = 'table'").get();
if (hasLinks) {
  console.log("Recreating entity_links...");
  db.exec(`
    CREATE TABLE entity_links_new (
      id TEXT PRIMARY KEY NOT NULL,
      source_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      target_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      link_type TEXT NOT NULL DEFAULT 'related',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(source_id, target_id, link_type)
    );
    INSERT INTO entity_links_new SELECT * FROM entity_links;
    DROP TABLE entity_links;
    ALTER TABLE entity_links_new RENAME TO entity_links;
    CREATE INDEX IF NOT EXISTS idx_entity_links_source ON entity_links(source_id);
    CREATE INDEX IF NOT EXISTS idx_entity_links_target ON entity_links(target_id);
  `);
  console.log("  ✓ entity_links fixed");
}

// Fix concept_matches
const hasConceptMatches = db.prepare("SELECT name FROM sqlite_master WHERE name = 'concept_matches' AND type = 'table'").get();
if (hasConceptMatches) {
  console.log("Recreating concept_matches...");
  db.exec(`
    CREATE TABLE concept_matches_new (
      id TEXT PRIMARY KEY,
      concept_id TEXT NOT NULL REFERENCES concept_rules(id) ON DELETE CASCADE,
      entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
      matched_at TEXT DEFAULT (datetime('now')),
      UNIQUE(concept_id, entity_id)
    );
    INSERT INTO concept_matches_new SELECT * FROM concept_matches;
    DROP TABLE concept_matches;
    ALTER TABLE concept_matches_new RENAME TO concept_matches;
  `);
  console.log("  ✓ concept_matches fixed");
}

console.log("\n=== Final Stats ===");
const entityCount = (db.prepare("SELECT COUNT(*) as cnt FROM entities").get() as {cnt: number}).cnt;
const attrCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_attributes").get() as {cnt: number}).cnt;
const tagCount = (db.prepare("SELECT COUNT(*) as cnt FROM tags").get() as {cnt: number}).cnt;
const entityTagCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_tags").get() as {cnt: number}).cnt;
console.log(`Entities: ${entityCount}`);
console.log(`Attributes: ${attrCount}`);
console.log(`Tags: ${tagCount}`);
console.log(`Entity Tags: ${entityTagCount}`);

// Verify FK references are fixed
console.log("\n=== FK References After Fix ===");
for (const table of tables) {
  const createSql = (db.prepare(`SELECT sql FROM sqlite_master WHERE name = ? AND type = 'table'`).get(table) as {sql: string} | undefined)?.sql;
  if (createSql && createSql.includes("entities_backup")) {
    console.log(`  ${table}: STILL has entities_backup FK`);
  } else {
    console.log(`  ${table}: OK`);
  }
}

db.close();
console.log("\n✅ Schema fix complete!");
