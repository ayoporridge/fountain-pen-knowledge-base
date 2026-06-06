/**
 * Reclassify concept entities that are actually articles.
 * Articles are identified by:
 * - Having source_file or source_url (imported content)
 * - Name starting with number (Richard's Pens articles)
 * - Summary containing "来源"
 */

import Database from "better-sqlite3";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "data", "fpkg.db");

function main() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  // Step 1: Add 'article' type support
  console.log("=== Step 1: Update schema to support 'article' type ===");
  
  // Check current schema
  const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE name = 'entities'").get() as { sql: string } | undefined;
  console.log("Current entities schema:", tableInfo?.sql?.substring(0, 200));

  // Recreate table with article type support
  db.exec(`ALTER TABLE entities RENAME TO entities_backup`);
  
  db.exec(`
    CREATE TABLE entities (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('pen', 'brand', 'concept', 'material', 'nib', 'fill_system', 'article')),
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      summary TEXT,
      body_md TEXT,
      source TEXT,
      source_file TEXT,
      source_url TEXT,
      imported_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    INSERT INTO entities (id, type, slug, name, summary, body_md, source, source_file, source_url, imported_at, created_at, updated_at)
    SELECT id, type, slug, name, summary, body_md, source, source_file, source_url, imported_at, 
           COALESCE(created_at, datetime('now')), 
           COALESCE(updated_at, datetime('now'))
    FROM entities_backup
  `);

  db.exec(`DROP TABLE entities_backup`);
  
  // Recreate indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_entities_slug ON entities(slug)`);
  
  console.log("✅ Schema updated");

  // Step 2: Reclassify concepts
  console.log("\n=== Step 2: Reclassify concept entities ===");
  
  const concepts = db
    .prepare("SELECT id, slug, name, summary, source_file, source_url FROM entities WHERE type = 'concept'")
    .all() as Array<{
    id: string;
    slug: string;
    name: string;
    summary: string | null;
    source_file: string | null;
    source_url: string | null;
  }>;

  let reclassified = 0;
  let keptAsConcept = 0;

  const updateType = db.prepare("UPDATE entities SET type = ? WHERE id = ?");

  for (const entity of concepts) {
    // Heuristics for article detection
    const isArticle =
      // Has source file/URL (imported from external)
      entity.source_file !== null ||
      entity.source_url !== null ||
      // Richard's Pens article pattern (starts with number)
      /^\d+[:\-]/.test(entity.name) ||
      entity.slug.match(/^\d+-/) ||
      // Summary contains source attribution
      (entity.summary && entity.summary.includes("来源：")) ||
      (entity.summary && entity.summary.startsWith("> 来源"));

    if (isArticle) {
      updateType.run("article", entity.id);
      reclassified++;
    } else {
      keptAsConcept++;
    }
  }

  console.log(`Reclassified ${reclassified} entities from concept → article`);
  console.log(`Kept ${keptAsConcept} entities as concept`);

  // Step 3: Print summary
  console.log("\n=== Summary ===");
  const stats = db
    .prepare("SELECT type, COUNT(*) as cnt FROM entities GROUP BY type ORDER BY cnt DESC")
    .all() as Array<{ type: string; cnt: number }>;
  console.log("\nEntity types:");
  for (const s of stats) {
    console.log(`  ${s.type}: ${s.cnt}`);
  }

  // Show remaining concepts
  const remainingConcepts = db
    .prepare("SELECT slug, name FROM entities WHERE type = 'concept' ORDER BY name LIMIT 20")
    .all() as Array<{ slug: string; name: string }>;
  console.log("\nRemaining concepts (sample):");
  for (const c of remainingConcepts) {
    console.log(`  ${c.slug} -> ${c.name}`);
  }

  db.close();
  console.log("\n✅ Done!");
}

main();
