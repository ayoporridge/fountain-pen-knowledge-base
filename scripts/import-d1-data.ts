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

console.log("=== Importing entity_attributes ===");
const attrFiles = fs.readdirSync(D1_EXPORT_DIR)
  .filter(f => f.startsWith("02-entity_attributes-"))
  .sort();

let attrCount = 0;
for (const file of attrFiles) {
  const sql = fs.readFileSync(path.join(D1_EXPORT_DIR, file), "utf-8");
  // Split by semicolons and execute each statement
  const statements = sql.split(";").filter(s => s.trim());
  for (const stmt of statements) {
    if (stmt.trim()) {
      try {
        db.exec(stmt + ";");
        attrCount++;
      } catch (e: any) {
        // Ignore duplicate key errors
        if (!e.message.includes("UNIQUE constraint")) {
          console.error(`Error in ${file}: ${e.message}`);
        }
      }
    }
  }
  console.log(`  ✓ ${file}`);
}
console.log(`Imported ${attrCount} attribute statements`);

console.log("\n=== Importing entity_tags ===");
const tagFiles = fs.readdirSync(D1_EXPORT_DIR)
  .filter(f => f.startsWith("04-entity_tags-"))
  .sort();

let tagCount = 0;
for (const file of tagFiles) {
  const sql = fs.readFileSync(path.join(D1_EXPORT_DIR, file), "utf-8");
  const statements = sql.split(";").filter(s => s.trim());
  for (const stmt of statements) {
    if (stmt.trim()) {
      try {
        db.exec(stmt + ";");
        tagCount++;
      } catch (e: any) {
        if (!e.message.includes("UNIQUE constraint")) {
          console.error(`Error in ${file}: ${e.message}`);
        }
      }
    }
  }
  console.log(`  ✓ ${file}`);
}
console.log(`Imported ${tagCount} entity_tag statements`);

console.log("\n=== Final Stats ===");
const entityCount = (db.prepare("SELECT COUNT(*) as cnt FROM entities").get() as {cnt: number}).cnt;
const finalAttrCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_attributes").get() as {cnt: number}).cnt;
const finalTagCount = (db.prepare("SELECT COUNT(*) as cnt FROM tags").get() as {cnt: number}).cnt;
const finalEntityTagCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_tags").get() as {cnt: number}).cnt;

console.log(`Entities: ${entityCount}`);
console.log(`Attributes: ${finalAttrCount}`);
console.log(`Tags: ${finalTagCount}`);
console.log(`Entity Tags: ${finalEntityTagCount}`);

db.close();
