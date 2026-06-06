import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "..", "data", "fpkg.db"));

// Check sample attribute values for each key
const keys = ["body_material", "price_range", "writing_style", "nib_size", "origin_country"];

for (const key of keys) {
  const values = db.prepare(`
    SELECT value, COUNT(*) as cnt 
    FROM entity_attributes 
    WHERE key = ? 
    GROUP BY value 
    ORDER BY cnt DESC 
    LIMIT 10
  `).all(key);
  console.log(`\n=== ${key} ===`);
  console.log(JSON.stringify(values, null, 2));
}

db.close();
