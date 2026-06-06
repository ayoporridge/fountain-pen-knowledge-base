import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "..", "data", "fpkg.db"));

// Check if the keyword matching is working
console.log("=== Debug: Testing keyword matching ===\n");

const bodyMaterialValues = db.prepare(`
  SELECT DISTINCT value 
  FROM entity_attributes 
  WHERE key = 'body_material' 
  LIMIT 20
`).all();

console.log("Sample body_material values:");
for (const row of bodyMaterialValues) {
  const v = row.value;
  const hasResin = v.includes("树脂");
  const hasMetal = v.includes("金属");
  const hasSteel = v.includes("不锈钢");
  console.log(`  "${v}" → 树脂:${hasResin}, 金属:${hasMetal}, 不锈钢:${hasSteel}`);
}

// Check if entities already have tags for these dimensions
console.log("\n=== Checking existing entity_tags ===");
const existingTags = db.prepare(`
  SELECT t.dimension, COUNT(DISTINCT et.entity_id) as cnt
  FROM entity_tags et
  JOIN tags t ON et.tag_id = t.id
  WHERE t.dimension IN ('body_material', 'price', 'nib_type', 'size')
  GROUP BY t.dimension
`).all();

console.log("Existing tags for target dimensions:");
for (const row of existingTags) {
  console.log(`  ${row.dimension}: ${row.cnt} entities`);
}

// Check if INSERT OR IGNORE is preventing duplicates
console.log("\n=== Testing INSERT OR IGNORE ===");
const testEntity = db.prepare(`
  SELECT e.id, e.slug 
  FROM entities e 
  WHERE e.type = 'pen' 
  LIMIT 1
`).get();

if (testEntity) {
  console.log(`Test entity: ${testEntity.slug} (${testEntity.id})`);
  
  // Check if this entity already has a body_material tag
  const existingBodyTag = db.prepare(`
    SELECT t.slug 
    FROM entity_tags et
    JOIN tags t ON et.tag_id = t.id
    WHERE et.entity_id = ? AND t.dimension = 'body_material'
  `).get(testEntity.id);
  
  console.log(`Existing body_material tag: ${existingBodyTag ? existingBodyTag.slug : 'none'}`);
}

db.close();
