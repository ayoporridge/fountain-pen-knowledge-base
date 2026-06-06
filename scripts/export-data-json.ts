import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "fpkg.db");
const OUTPUT_DIR = path.join(__dirname, "..", "public", "data");

// Ensure output dir
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const db = new Database(DB_PATH);

console.log("=== Exporting entity_attributes ===");
const attrs = db.prepare("SELECT id, entity_id, key, value FROM entity_attributes").all() as Array<{id: string, entity_id: string, key: string, value: string}>;
console.log(`Found ${attrs.length} attributes`);

console.log("=== Exporting entity_tags ===");
const entityTags = db.prepare("SELECT id, entity_id, tag_id, created_at FROM entity_tags").all() as Array<{id: string, entity_id: string, tag_id: string, created_at: string}>;
console.log(`Found ${entityTags.length} entity_tags`);

// Write JSON files
fs.writeFileSync(
  path.join(OUTPUT_DIR, "entity_attributes.json"),
  JSON.stringify(attrs, null, 0)
);

fs.writeFileSync(
  path.join(OUTPUT_DIR, "entity_tags.json"),
  JSON.stringify(entityTags, null, 0)
);

console.log(`\n✅ Exported to ${OUTPUT_DIR}`);
console.log(`  - entity_attributes.json (${attrs.length} rows)`);
console.log(`  - entity_tags.json (${entityTags.length} rows)`);

db.close();
