/**
 * Export local SQLite data to separate SQL files per table for D1 import.
 * Each file is small enough for D1's size limits.
 * Usage: pnpm tsx scripts/export-to-d1-batch.ts
 */
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DB_PATH = path.join(process.cwd(), "data", "fpkg.db");
const OUTPUT_DIR = path.join(process.cwd(), "data", "d1-export");
const db = new Database(DB_PATH, { readonly: true });

// Ensure output directory
if (fs.existsSync(OUTPUT_DIR)) fs.rmSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function escapeStr(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

function exportTable(tableName: string, order: number) {
  const rows = db.prepare(`SELECT * FROM ${tableName}`).all() as Array<Record<string, unknown>>;
  if (rows.length === 0) {
    console.log(`  ${tableName}: 0 rows (skipped)`);
    return;
  }

  const columns = Object.keys(rows[0]);
  const colList = columns.join(", ");

  // Split into batches of 50 rows to keep file size manageable
  const BATCH_SIZE = 50;
  let fileIndex = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const lines: string[] = [];

    for (const row of batch) {
      const values = columns.map((col) => escapeStr(row[col])).join(", ");
      lines.push(`INSERT OR IGNORE INTO ${tableName} (${colList}) VALUES (${values});`);
    }

    const filename = `${String(order).padStart(2, "0")}-${tableName}-${String(fileIndex).padStart(3, "0")}.sql`;
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), lines.join("\n") + "\n");
    fileIndex++;
  }

  console.log(`  ${tableName}: ${rows.length} rows → ${fileIndex} files`);
}

console.log("Exporting tables to", OUTPUT_DIR);
console.log("");

const tables = [
  "entities",
  "entity_attributes",
  "tags",
  "entity_tags",
  "tag_hierarchy",
  "tag_compositions",
  "entity_links",
  "concept_rules",
  "concept_matches",
];

for (let i = 0; i < tables.length; i++) {
  try {
    exportTable(tables[i], i + 1);
  } catch (err) {
    console.log(`  ${tables[i]}: skipped (${err instanceof Error ? err.message : err})`);
  }
}

db.close();
console.log("\nDone! Import with:");
console.log("  for f in data/d1-export/*.sql; do npx wrangler d1 execute fpkg --remote --file=\"$f\"; done");
