import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "fpkg.db");
const db = new Database(DB_PATH);

console.log("=== Entity Attributes Keys ===");
const keys = db.prepare("SELECT DISTINCT key FROM entity_attributes ORDER BY key").all() as Array<{key: string}>;
console.log(keys.map(k => k.key).join("\n"));

console.log("\n=== Tags by Dimension ===");
const tags = db.prepare("SELECT dimension, COUNT(*) as cnt FROM tags GROUP BY dimension ORDER BY dimension").all() as Array<{dimension: string, cnt: number}>;
console.log(tags.map(t => `${t.dimension}: ${t.cnt}`).join("\n"));

console.log("\n=== Entity Tags Count ===");
const entityTags = db.prepare("SELECT COUNT(*) as cnt FROM entity_tags").get() as {cnt: number};
console.log(`Total entity_tags: ${entityTags.cnt}`);

console.log("\n=== Sample Pen Attributes ===");
const sample = db.prepare(`
  SELECT e.name, e.type, GROUP_CONCAT(ea.key || '=' || ea.value, '; ') as attrs
  FROM entities e
  LEFT JOIN entity_attributes ea ON ea.entity_id = e.id
  WHERE e.type = 'pen'
  GROUP BY e.id
  LIMIT 5
`).all() as Array<{name: string, type: string, attrs: string}>;
for (const s of sample) {
  console.log(`${s.name}: ${s.attrs || 'no attrs'}`);
}

console.log("\n=== Sample Article Attributes ===");
const sampleArticle = db.prepare(`
  SELECT e.name, e.type, GROUP_CONCAT(ea.key || '=' || ea.value, '; ') as attrs
  FROM entities e
  LEFT JOIN entity_attributes ea ON ea.entity_id = e.id
  WHERE e.type = 'article'
  GROUP BY e.id
  LIMIT 3
`).all() as Array<{name: string, type: string, attrs: string}>;
for (const s of sampleArticle) {
  console.log(`${s.name}: ${s.attrs || 'no attrs'}`);
}

db.close();
