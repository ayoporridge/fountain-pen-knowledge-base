import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "..", "data", "fpkg.db"));

// Check attribute keys
const attrs = db.prepare('SELECT key, COUNT(*) as cnt FROM entity_attributes GROUP BY key ORDER BY cnt DESC').all();
console.log("Attribute keys:");
console.log(JSON.stringify(attrs, null, 2));

db.close();
