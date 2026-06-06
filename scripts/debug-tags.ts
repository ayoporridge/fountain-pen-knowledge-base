import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "..", "data", "fpkg.db"));

// Check if target tags exist
console.log("=== Checking if target tags exist ===\n");

const targetTags = [
  "mat-resin", "mat-pmma", "mat-celluloid", "mat-lacquer",
  "mat-carbon-fiber", "mat-wood", "mat-brass", "mat-aluminum",
  "mat-titanium", "mat-steel",
  "price-entry", "price-mid", "price-upper-mid", "price-high",
  "price-flagship", "price-ultra",
  "nib-standard", "nib-flex", "nib-custom-ground", "nib-italic",
  "nib-music", "nib-naginata", "nib-round", "nib-superflex",
  "size-compact", "size-standard", "size-large", "size-oversize"
];

for (const tagSlug of targetTags) {
  const tag = db.prepare(`SELECT id, slug, name, dimension FROM tags WHERE slug = ?`).get(tagSlug);
  if (tag) {
    console.log(`✓ ${tagSlug} (${tag.name}) - ${tag.dimension}`);
  } else {
    console.log(`✗ ${tagSlug} - NOT FOUND`);
  }
}

// Test manual insert
console.log("\n=== Testing manual insert ===");
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
  
  // Try manual insert
  try {
    const result = db.prepare(`
      INSERT INTO entity_tags (entity_id, tag_id) VALUES (?, ?)
    `).run(testEntity.id, testTag.id);
    console.log(`Insert result: ${result.changes} row(s) changed`);
  } catch (err) {
    console.log(`Insert error: ${err.message}`);
  }
}

db.close();
