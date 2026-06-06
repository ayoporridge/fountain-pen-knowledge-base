/**
 * Data quality fix script:
 * 1. Reclassify "concept" entities that are actually articles
 * 2. Rebuild concept_matches
 * 3. Generate tag-based entity links
 */

import Database from "better-sqlite3";
import path from "node:path";
import { nanoid } from "nanoid";

const DB_PATH = path.join(process.cwd(), "data", "fpkg.db");

function main() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  console.log("=== Step 1: Add 'article' type to entities table ===");
  // SQLite CHECK constraint can't be altered easily, so we need to recreate
  // Actually, let's just update the constraint
  try {
    db.exec(`ALTER TABLE entities RENAME TO entities_old`);
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
      INSERT INTO entities SELECT * FROM entities_old
    `);
    db.exec(`DROP TABLE entities_old`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_entities_slug ON entities(slug)`);
    console.log("✅ Added 'article' type to entities CHECK constraint");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("already exists")) {
      console.log("⏭  'article' type already supported");
    } else {
      console.log("⚠️  Schema update issue:", msg);
    }
  }

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
    // Heuristics for article detection:
    // 1. Has source_file or source_url (imported from external source)
    // 2. Name starts with number (Richard's Pens articles like "1: Who Made This Pen?")
    // 3. Name contains ":" (article title pattern)
    // 4. Slug starts with number
    // 5. Summary starts with "来源" or "> 来源"

    const isArticle =
      entity.source_file !== null ||
      entity.source_url !== null ||
      /^\d+[:\-]/.test(entity.name) ||
      entity.slug.startsWith("1-") ||
      entity.slug.startsWith("2-") ||
      entity.slug.startsWith("3-") ||
      entity.slug.startsWith("4-") ||
      entity.slug.startsWith("5-") ||
      entity.slug.startsWith("6-") ||
      entity.slug.startsWith("7-") ||
      entity.slug.startsWith("8-") ||
      entity.slug.startsWith("9-") ||
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

  console.log("\n=== Step 3: Rebuild concept_matches ===");
  db.prepare("DELETE FROM concept_matches").run();

  const entities = db.prepare("SELECT id FROM entities").all() as Array<{ id: string }>;
  const rules = db
    .prepare("SELECT id, conditions FROM concept_rules")
    .all() as Array<{ id: string; conditions: string }>;

  const getEntityTags = db.prepare(
    `SELECT t.dimension, t.slug FROM tags t
     JOIN entity_tags et ON et.tag_id = t.id
     WHERE et.entity_id = ?`,
  );

  const insertMatch = db.prepare(
    "INSERT OR IGNORE INTO concept_matches (id, concept_id, entity_id) VALUES (?, ?, ?)",
  );

  let totalMatches = 0;
  for (const entity of entities) {
    const tags = getEntityTags.all(entity.id) as Array<{
      dimension: string;
      slug: string;
    }>;
    const tagSet = new Set(tags.map((t) => `${t.dimension}:${t.slug}`));

    for (const rule of rules) {
      const conditions = JSON.parse(rule.conditions) as Array<{
        dimension: string;
        tag_slug: string;
      }>;
      if (conditions.length === 0) continue;
      const allMatch = conditions.every((c) =>
        tagSet.has(`${c.dimension}:${c.tag_slug}`),
      );
      if (allMatch) {
        insertMatch.run(nanoid(12), rule.id, entity.id);
        totalMatches++;
      }
    }
  }

  console.log(`Created ${totalMatches} concept-entity matches`);

  console.log("\n=== Step 4: Generate tag-based entity links ===");
  // For entities sharing the same tag, create links
  const existingLinks = db
    .prepare("SELECT source_id, target_id FROM entity_links")
    .all() as Array<{ source_id: string; target_id: string }>;
  const linkSet = new Set(
    existingLinks.map((l) => `${l.source_id}:${l.target_id}`),
  );

  const insertLink = db.prepare(
    "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type) VALUES (?, ?, ?, ?)",
  );

  // Group entities by tag
  const tagGroups = db
    .prepare(
      `SELECT t.id as tag_id, t.name as tag_name, t.dimension, et.entity_id
       FROM entity_tags et
       JOIN tags t ON t.id = et.tag_id
       ORDER BY t.id`,
    )
    .all() as Array<{
    tag_id: string;
    tag_name: string;
    dimension: string;
    entity_id: string;
  }>;

  // Group by tag_id
  const groups = new Map<string, string[]>();
  for (const row of tagGroups) {
    if (!groups.has(row.tag_id)) {
      groups.set(row.tag_id, []);
    }
    groups.get(row.tag_id)!.push(row.entity_id);
  }

  let linksCreated = 0;
  for (const [tagId, entityIds] of groups) {
    // Only create links for groups with 2-50 entities (too few = no point, too many = noise)
    if (entityIds.length < 2 || entityIds.length > 50) continue;

    // Create links between entities in the same tag group
    // Limit to first 20 entities per group to avoid explosion
    const limited = entityIds.slice(0, 20);
    for (let i = 0; i < limited.length; i++) {
      for (let j = i + 1; j < limited.length; j++) {
        const a = limited[i];
        const b = limited[j];
        if (!linkSet.has(`${a}:${b}`) && !linkSet.has(`${b}:${a}`)) {
          insertLink.run(nanoid(12), a, b, "shared_tag");
          linkSet.add(`${a}:${b}`);
          linksCreated++;
        }
      }
    }
  }

  console.log(`Created ${linksCreated} tag-based entity links`);

  console.log("\n=== Step 5: Print summary ===");
  const stats = db
    .prepare("SELECT type, COUNT(*) as cnt FROM entities GROUP BY type ORDER BY cnt DESC")
    .all() as Array<{ type: string; cnt: number }>;
  console.log("\nEntity types:");
  for (const s of stats) {
    console.log(`  ${s.type}: ${s.cnt}`);
  }

  const totalLinks = (
    db.prepare("SELECT COUNT(*) as cnt FROM entity_links").get() as {
      cnt: number;
    }
  ).cnt;
  console.log(`\nTotal links: ${totalLinks}`);

  const totalConceptMatches = (
    db.prepare("SELECT COUNT(*) as cnt FROM concept_matches").get() as {
      cnt: number;
    }
  ).cnt;
  console.log(`Total concept matches: ${totalConceptMatches}`);

  // Show concept match counts
  const conceptStats = db
    .prepare(
      `SELECT cr.name, cr.slug, COUNT(cm.id) as match_count
       FROM concept_rules cr
       LEFT JOIN concept_matches cm ON cm.concept_id = cr.id
       GROUP BY cr.id
       ORDER BY match_count DESC`,
    )
    .all() as Array<{ name: string; slug: string; match_count: number }>;
  console.log("\nConcept rules:");
  for (const c of conceptStats) {
    console.log(`  ${c.name} (${c.slug}): ${c.match_count} matches`);
  }

  db.close();
  console.log("\n✅ Done!");
}

main();
