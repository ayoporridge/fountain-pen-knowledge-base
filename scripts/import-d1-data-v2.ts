import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "fpkg.db");
const D1_EXPORT_DIR = path.join(__dirname, "..", "data", "d1-export");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function importFiles(prefix: string, label: string) {
  const files = fs.readdirSync(D1_EXPORT_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith(".sql"))
    .sort();
  
  let total = 0;
  for (const file of files) {
    const sql = fs.readFileSync(path.join(D1_EXPORT_DIR, file), "utf-8");
    try {
      db.exec(sql);
      // Count INSERT statements
      const inserts = (sql.match(/INSERT/gi) || []).length;
      total += inserts;
      console.log(`  ✓ ${file} (${inserts} rows)`);
    } catch (e: any) {
      console.error(`  ✗ ${file}: ${e.message}`);
    }
  }
  console.log(`  Total ${label}: ~${total} rows\n`);
  return total;
}

console.log("=== Importing entity_attributes ===");
importFiles("02-entity_attributes-", "attributes");

console.log("=== Importing entity_tags ===");
importFiles("04-entity_tags-", "entity_tags");

console.log("=== Final Stats ===");
const entityCount = (db.prepare("SELECT COUNT(*) as cnt FROM entities").get() as {cnt: number}).cnt;
const attrCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_attributes").get() as {cnt: number}).cnt;
const tagCount = (db.prepare("SELECT COUNT(*) as cnt FROM tags").get() as {cnt: number}).cnt;
const entityTagCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_tags").get() as {cnt: number}).cnt;

console.log(`Entities: ${entityCount}`);
console.log(`Attributes: ${attrCount}`);
console.log(`Tags: ${tagCount}`);
console.log(`Entity Tags: ${entityTagCount}`);

db.close();
