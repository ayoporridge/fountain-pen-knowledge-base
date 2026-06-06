import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "fpkg.db");
console.log("DB path:", dbPath);
const db = new Database(dbPath);

// Check entity_tags with body_material dimension
const rows = db.prepare(`
  SELECT et.entity_id, t.name, t.slug, t.dimension 
  FROM entity_tags et 
  JOIN tags t ON t.id = et.tag_id 
  WHERE t.dimension = 'body_material' 
  LIMIT 10
`).all();
console.log("body_material tags:", JSON.stringify(rows, null, 2));

// Total entity_tags
const total = db.prepare("SELECT COUNT(*) as cnt FROM entity_tags").get();
console.log("Total entity_tags:", total);

// Tags by dimension
const tagDims = db.prepare(`
  SELECT t.dimension, COUNT(DISTINCT et.entity_id) as entity_count
  FROM tags t
  LEFT JOIN entity_tags et ON et.tag_id = t.id
  GROUP BY t.dimension
  ORDER BY entity_count DESC
`).all();
console.log("Tags by dimension:", JSON.stringify(tagDims, null, 2));

db.close();
