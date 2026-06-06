import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "..", "data", "fpkg.db"));

// Get all tags with their dimensions
const tags = db.prepare(`
  SELECT slug, name, dimension, level 
  FROM tags 
  WHERE level = 'atom'
  ORDER BY dimension, slug
`).all();

console.log("=== All atom tags ===");
for (const tag of tags) {
  console.log(`${tag.dimension}: ${tag.slug} (${tag.name})`);
}

db.close();
