import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "fpkg.db");
const SEED_PATH = path.join(__dirname, "..", "data", "d1-seed.sql");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

console.log("=== Before Import ===");
let attrCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_attributes").get() as {cnt: number}).cnt;
let entityTagCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_tags").get() as {cnt: number}).cnt;
console.log(`Attributes: ${attrCount}`);
console.log(`Entity Tags: ${entityTagCount}`);

console.log("\n=== Importing d1-seed.sql ===");
const sql = fs.readFileSync(SEED_PATH, "utf-8");

// Split into individual statements
const statements = sql.split("\n").filter(line => line.startsWith("INSERT"));

console.log(`Found ${statements.length} INSERT statements`);

let imported = 0;
let errors = 0;
for (const stmt of statements) {
  try {
    db.exec(stmt);
    imported++;
  } catch (e: any) {
    errors++;
    if (errors <= 5) {
      console.error(`Error: ${e.message.substring(0, 100)}`);
    }
  }
}
console.log(`Imported: ${imported}, Errors: ${errors}`);

console.log("\n=== After Import ===");
attrCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_attributes").get() as {cnt: number}).cnt;
entityTagCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_tags").get() as {cnt: number}).cnt;
console.log(`Attributes: ${attrCount}`);
console.log(`Entity Tags: ${entityTagCount}`);

db.close();
