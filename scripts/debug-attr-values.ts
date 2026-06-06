import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "..", "data", "fpkg.db"));

// Check actual attribute values for body_material
console.log("=== body_material attribute values ===");
const bodyMaterialValues = db.prepare(`
  SELECT value, COUNT(*) as cnt 
  FROM entity_attributes 
  WHERE key = 'body_material' 
  GROUP BY value 
  ORDER BY cnt DESC
`).all();

for (const row of bodyMaterialValues) {
  console.log(`  "${row.value}": ${row.cnt} entities`);
}

console.log("\n=== price_range attribute values ===");
const priceValues = db.prepare(`
  SELECT value, COUNT(*) as cnt 
  FROM entity_attributes 
  WHERE key = 'price_range' 
  GROUP BY value 
  ORDER BY cnt DESC
`).all();

for (const row of priceValues) {
  console.log(`  "${row.value}": ${row.cnt} entities`);
}

console.log("\n=== writing_style attribute values ===");
const writingStyleValues = db.prepare(`
  SELECT value, COUNT(*) as cnt 
  FROM entity_attributes 
  WHERE key = 'writing_style' 
  GROUP BY value 
  ORDER BY cnt DESC
`).all();

for (const row of writingStyleValues) {
  console.log(`  "${row.value}": ${row.cnt} entities`);
}

console.log("\n=== nib_size attribute values ===");
const nibSizeValues = db.prepare(`
  SELECT value, COUNT(*) as cnt 
  FROM entity_attributes 
  WHERE key = 'nib_size' 
  GROUP BY value 
  ORDER BY cnt DESC
`).all();

for (const row of nibSizeValues) {
  console.log(`  "${row.value}": ${row.cnt} entities`);
}

db.close();
