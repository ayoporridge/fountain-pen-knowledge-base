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

console.log("\n=== Importing d1-seed.sql (full exec) ===");
const sql = fs.readFileSync(SEED_PATH, "utf-8");

try {
  db.exec(sql);
  console.log("Import successful!");
} catch (e: any) {
  console.error(`Error: ${e.message}`);
}

console.log("\n=== After Import ===");
attrCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_attributes").get() as {cnt: number}).cnt;
entityTagCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_tags").get() as {cnt: number}).cnt;
const entityCount = (db.prepare("SELECT COUNT(*) as cnt FROM entities").get() as {cnt: number}).cnt;
const tagCount = (db.prepare("SELECT COUNT(*) as cnt FROM tags").get() as {cnt: number}).cnt;
const linkCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_links").get() as {cnt: number}).cnt;
console.log(`Entities: ${entityCount}`);
console.log(`Attributes: ${attrCount}`);
console.log(`Tags: ${tagCount}`);
console.log(`Entity Tags: ${entityTagCount}`);
console.log(`Links: ${linkCount}`);

db.close();
