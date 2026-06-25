import { createClient } from "@libsql/client";
import Database from "better-sqlite3";
import { join } from "node:path";

const dbPath = join(import.meta.dirname, "data", "fpkg.db");
const localDb = new Database(dbPath, { readonly: true });
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  throw new Error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN first.");
}

const turso = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

// 1. Drop all tables
const tables = ['concept_matches', 'entity_links', 'entity_tags', 'entity_attributes', 'entities', 'concept_rules', 'tag_hierarchy', 'tag_compositions', 'tags', 'migrations'];
console.log('Dropping tables...');
for (const t of tables) {
  try { await turso.execute(`DROP TABLE IF EXISTS ${t}`); } catch {}
}

// 2. Create tables (from schema)
const schemas = [
  `CREATE TABLE migrations (name TEXT PRIMARY KEY NOT NULL, applied_at TEXT NOT NULL)`,
  `CREATE TABLE tags (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, dimension TEXT NOT NULL, level TEXT NOT NULL, description TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE tag_compositions (id TEXT PRIMARY KEY NOT NULL, parent_tag_id TEXT NOT NULL, child_tag_id TEXT NOT NULL, UNIQUE(parent_tag_id, child_tag_id))`,
  `CREATE TABLE tag_hierarchy (id TEXT PRIMARY KEY, parent_id TEXT NOT NULL, child_id TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')), UNIQUE(parent_id, child_id))`,
  `CREATE TABLE concept_rules (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, conditions TEXT NOT NULL DEFAULT '[]', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE entities (id TEXT PRIMARY KEY NOT NULL, type TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, summary TEXT, body_md TEXT, source TEXT, source_file TEXT, source_url TEXT, imported_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE entity_attributes (id TEXT PRIMARY KEY NOT NULL, entity_id TEXT NOT NULL, key TEXT NOT NULL, value TEXT, UNIQUE(entity_id, key))`,
  `CREATE TABLE entity_tags (id TEXT PRIMARY KEY NOT NULL, entity_id TEXT NOT NULL, tag_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE(entity_id, tag_id))`,
  `CREATE TABLE entity_links (id TEXT PRIMARY KEY NOT NULL, source_id TEXT NOT NULL, target_id TEXT NOT NULL, link_type TEXT NOT NULL DEFAULT 'related', created_at TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE(source_id, target_id, link_type))`,
  `CREATE TABLE concept_matches (id TEXT PRIMARY KEY, concept_id TEXT NOT NULL, entity_id TEXT NOT NULL, matched_at TEXT DEFAULT (datetime('now')), UNIQUE(concept_id, entity_id))`,
];

console.log('Creating tables...');
for (const sql of schemas) {
  await turso.execute(sql);
}

// 3. Copy data table by table
const tableConfigs = [
  { name: 'migrations', cols: 'name, applied_at' },
  { name: 'tags', cols: 'id, name, slug, dimension, level, description, created_at' },
  { name: 'tag_compositions', cols: 'id, parent_tag_id, child_tag_id' },
  { name: 'tag_hierarchy', cols: 'id, parent_id, child_id, created_at' },
  { name: 'concept_rules', cols: 'id, name, slug, description, conditions, created_at, updated_at' },
  { name: 'entities', cols: 'id, type, slug, name, summary, body_md, source, source_file, source_url, imported_at, created_at, updated_at' },
  { name: 'entity_attributes', cols: 'id, entity_id, key, value' },
  { name: 'entity_tags', cols: 'id, entity_id, tag_id, created_at' },
  { name: 'entity_links', cols: 'id, source_id, target_id, link_type, created_at' },
  { name: 'concept_matches', cols: 'id, concept_id, entity_id, matched_at' },
];

for (const { name, cols } of tableConfigs) {
  const colList = cols.split(', ');
  const placeholders = colList.map(() => '?').join(', ');
  const rows = localDb.prepare(`SELECT ${cols} FROM ${name}`).all();
  
  console.log(`Copying ${name}: ${rows.length} rows`);
  
  // Batch insert (50 rows at a time)
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const args = batch.flatMap(r => colList.map(c => r[c] ?? null));
    const multiSql = batch.map(() => `(${placeholders})`).join(',');
    await turso.execute({
      sql: `INSERT INTO ${name} (${cols}) VALUES ${multiSql}`,
      args,
    });
  }
}

// 4. Create indexes
const indexes = [
  'CREATE INDEX idx_tags_dimension ON tags(dimension)',
  'CREATE INDEX idx_tags_slug ON tags(slug)',
  'CREATE INDEX idx_tags_level ON tags(level)',
  'CREATE INDEX idx_tag_comp_parent ON tag_compositions(parent_tag_id)',
  'CREATE INDEX idx_tag_comp_child ON tag_compositions(child_tag_id)',
  'CREATE INDEX idx_tag_hierarchy_parent ON tag_hierarchy(parent_id)',
  'CREATE INDEX idx_tag_hierarchy_child ON tag_hierarchy(child_id)',
  'CREATE INDEX idx_entities_type ON entities(type)',
  'CREATE INDEX idx_entities_slug ON entities(slug)',
  'CREATE INDEX idx_entity_attributes_entity ON entity_attributes(entity_id)',
  'CREATE INDEX idx_entity_tags_entity ON entity_tags(entity_id)',
  'CREATE INDEX idx_entity_tags_tag ON entity_tags(tag_id)',
  'CREATE INDEX idx_entity_links_source ON entity_links(source_id)',
  'CREATE INDEX idx_entity_links_target ON entity_links(target_id)',
];

console.log('Creating indexes...');
for (const sql of indexes) {
  await turso.execute(sql);
}

// 5. Verify
const r1 = await turso.execute('SELECT COUNT(*) as c FROM entities');
const r2 = await turso.execute('SELECT COUNT(*) as c FROM tags');
const r3 = await turso.execute('SELECT COUNT(*) as c FROM entity_links');
console.log(`\nEntities: ${r1.rows[0].c}`);
console.log(`Tags: ${r2.rows[0].c}`);
console.log(`Links: ${r3.rows[0].c}`);
console.log('Done!');

localDb.close();
