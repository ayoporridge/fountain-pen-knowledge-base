import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "fpkg.db");
const D1_EXPORT_DIR = path.join(__dirname, "..", "data", "d1-export");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
// Disable foreign keys for import
db.pragma("foreign_keys = OFF");

console.log("=== Step 1: Import entity_attributes (with FK off) ===");
const attrFiles = fs.readdirSync(D1_EXPORT_DIR)
  .filter(f => f.startsWith("02-entity_attributes-") && f.endsWith(".sql"))
  .sort();

let attrImported = 0;
for (const file of attrFiles) {
  const sql = fs.readFileSync(path.join(D1_EXPORT_DIR, file), "utf-8");
  try {
    db.exec(sql);
    const inserts = (sql.match(/INSERT/gi) || []).length;
    attrImported += inserts;
    console.log(`  ✓ ${file} (${inserts} rows)`);
  } catch (e: any) {
    console.error(`  ✗ ${file}: ${e.message.substring(0, 100)}`);
  }
}
console.log(`Total attribute rows: ${attrImported}`);

console.log("\n=== Step 2: Import entity_tags (with FK off) ===");
const tagFiles = fs.readdirSync(D1_EXPORT_DIR)
  .filter(f => f.startsWith("04-entity_tags-") && f.endsWith(".sql"))
  .sort();

let tagImported = 0;
for (const file of tagFiles) {
  const sql = fs.readFileSync(path.join(D1_EXPORT_DIR, file), "utf-8");
  try {
    db.exec(sql);
    const inserts = (sql.match(/INSERT/gi) || []).length;
    tagImported += inserts;
    console.log(`  ✓ ${file} (${inserts} rows)`);
  } catch (e: any) {
    console.error(`  ✗ ${file}: ${e.message.substring(0, 100)}`);
  }
}
console.log(`Total entity_tag rows: ${tagImported}`);

console.log("\n=== Step 3: Verify ===");
const attrCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_attributes").get() as {cnt: number}).cnt;
const entityTagCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_tags").get() as {cnt: number}).cnt;
console.log(`Attributes in DB: ${attrCount}`);
console.log(`Entity Tags in DB: ${entityTagCount}`);

db.close();
