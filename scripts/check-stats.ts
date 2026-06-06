import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "fpkg.db");
const db = new Database(DB_PATH);

console.log("=== Database Stats ===");
const entityCount = (db.prepare("SELECT COUNT(*) as cnt FROM entities").get() as {cnt: number}).cnt;
const attrCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_attributes").get() as {cnt: number}).cnt;
const tagCount = (db.prepare("SELECT COUNT(*) as cnt FROM tags").get() as {cnt: number}).cnt;
const entityTagCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_tags").get() as {cnt: number}).cnt;

console.log(`Entities: ${entityCount}`);
console.log(`Attributes: ${attrCount}`);
console.log(`Tags: ${tagCount}`);
console.log(`Entity Tags: ${entityTagCount}`);

if (attrCount === 0) {
  console.log("\n⚠️  entity_attributes is empty! Need to import d1-seed.sql");
}

db.close();
