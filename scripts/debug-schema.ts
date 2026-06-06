import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "..", "data", "fpkg.db"));

// Check entity_tags table schema
console.log("=== entity_tags table schema ===");
const schema = db.prepare(`PRAGMA table_info(entity_tags)`).all();
console.log(JSON.stringify(schema, null, 2));

// Test insert with explicit id
console.log("\n=== Testing insert with explicit id ===");
const testEntity = db.prepare(`
  SELECT e.id, e.slug 
  FROM entities e 
  WHERE e.type = 'pen' 
  LIMIT 1
`).get();

const testTag = db.prepare(`SELECT id, slug FROM tags WHERE slug = 'mat-resin'`).get();

if (testEntity && testTag) {
  console.log(`Entity: ${testEntity.slug} (${testEntity.id})`);
  console.log(`Tag: ${testTag.slug} (${testTag.id})`);
  
  // Try manual insert with explicit id
  try {
    const id = randomUUID();
    const result = db.prepare(`
      INSERT INTO entity_tags (id, entity_id, tag_id) VALUES (?, ?, ?)
    `).run(id, testEntity.id, testTag.id);
    console.log(`Insert result: ${result.changes} row(s) changed`);
    console.log(`Inserted id: ${id}`);
  } catch (err) {
    console.log(`Insert error: ${err.message}`);
  }
}

db.close();
