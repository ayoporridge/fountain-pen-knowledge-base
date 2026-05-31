/**
 * Export local SQLite data to SQL INSERT statements for D1 import.
 * Usage: pnpm tsx scripts/export-to-d1.ts > data/d1-seed.sql
 */
import Database from "better-sqlite3";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "data", "fpkg.db");
const db = new Database(DB_PATH, { readonly: true });

function escapeStr(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

function exportTable(tableName: string) {
  const rows = db.prepare(`SELECT * FROM ${tableName}`).all() as Array<Record<string, unknown>>;
  if (rows.length === 0) return;

  const columns = Object.keys(rows[0]);
  const colList = columns.join(", ");

  console.log(`-- Table: ${tableName} (${rows.length} rows)`);
  for (const row of rows) {
    const values = columns.map((col) => escapeStr(row[col])).join(", ");
    console.log(`INSERT OR IGNORE INTO ${tableName} (${colList}) VALUES (${values});`);
  }
  console.log("");
}

// Export in dependency order
const tables = [
  "entities",
  "entity_attributes",
  "tags",
  "entity_tags",
  "entity_links",
  "concept_rules",
  "concept_matches",
];

console.log("-- Fountain Pen Knowledge Graph - D1 Seed Data");
console.log(`-- Generated: ${new Date().toISOString()}`);
console.log("");

for (const table of tables) {
  try {
    exportTable(table);
  } catch (err) {
    console.error(`-- Skipped ${table}: ${err instanceof Error ? err.message : err}`);
  }
}

db.close();
