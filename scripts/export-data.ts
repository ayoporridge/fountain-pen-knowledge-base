import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "fpkg.db");
const OUTPUT_DIR = path.join(__dirname, "..", "data", "migration-output");

// Ensure output dir
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const db = new Database(DB_PATH);

console.log("=== Exporting entity_attributes ===");
const attrs = db.prepare("SELECT * FROM entity_attributes").all() as Array<{id: string, entity_id: string, key: string, value: string}>;
console.log(`Found ${attrs.length} attributes`);

console.log("=== Exporting entity_tags ===");
const entityTags = db.prepare("SELECT * FROM entity_tags").all() as Array<{id: string, entity_id: string, tag_id: string, created_at: string}>;
console.log(`Found ${entityTags.length} entity_tags`);

// Generate INSERT statements
let attrSql = "-- Entity Attributes\n";
for (const attr of attrs) {
  const value = attr.value ? `'${attr.value.replace(/'/g, "''")}'` : 'NULL';
  attrSql += `INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value) VALUES ('${attr.id}', '${attr.entity_id}', '${attr.key}', ${value});\n`;
}

let tagSql = "-- Entity Tags\n";
for (const tag of entityTags) {
  tagSql += `INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id, created_at) VALUES ('${tag.id}', '${tag.entity_id}', '${tag.tag_id}', '${tag.created_at}');\n`;
}

// Write to files
fs.writeFileSync(path.join(OUTPUT_DIR, "entity_attributes.sql"), attrSql);
fs.writeFileSync(path.join(OUTPUT_DIR, "entity_tags.sql"), tagSql);

console.log(`\n✅ Exported to ${OUTPUT_DIR}`);
console.log(`  - entity_attributes.sql (${attrs.length} rows)`);
console.log(`  - entity_tags.sql (${entityTags.length} rows)`);

db.close();
