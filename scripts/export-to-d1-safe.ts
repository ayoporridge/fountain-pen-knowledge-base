/**
 * Export local SQLite data to D1-safe SQL files.
 * - Truncates body_md to 50KB max
 * - Disables foreign keys during import
 * - Batch size of 20 rows for entities, 100 for others
 */
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DB_PATH = path.join(process.cwd(), "data", "fpkg.db");
const OUTPUT_DIR = path.join(process.cwd(), "data", "d1-safe");
const db = new Database(DB_PATH, { readonly: true });

if (fs.existsSync(OUTPUT_DIR)) fs.rmSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const MAX_FIELD_LEN = 50000; // 50KB per field

function escapeStr(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  let s = String(val);
  if (s.length > MAX_FIELD_LEN) {
    s = s.slice(0, MAX_FIELD_LEN) + "\n\n[内容已截断]";
  }
  s = s.replace(/'/g, "''");
  return `'${s}'`;
}

function exportTable(tableName: string, order: number, batchSize: number) {
  const rows = db.prepare(`SELECT * FROM ${tableName}`).all() as Array<Record<string, unknown>>;
  if (rows.length === 0) {
    console.log(`  ${tableName}: 0 rows (skipped)`);
    return;
  }

  const columns = Object.keys(rows[0]);
  const colList = columns.join(", ");
  let fileIndex = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const lines: string[] = ["PRAGMA foreign_keys=OFF;"];

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

console.log("Exporting to", OUTPUT_DIR);

exportTable("entities", 1, 20);
exportTable("entity_attributes", 2, 100);
exportTable("tags", 3, 100);
exportTable("entity_tags", 4, 100);
exportTable("entity_links", 5, 100);
exportTable("concept_rules", 6, 100);
exportTable("concept_matches", 7, 100);

db.close();
console.log("\nDone!");
