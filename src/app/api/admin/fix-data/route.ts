import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import fs from "node:fs";
import path from "node:path";

export async function POST() {
  const db = getDb();
  const results: string[] = [];

  // Step 1: Fix schema FK references
  results.push("=== Step 1: Fixing schema FK references ===");

  const tables = [
    {
      name: "entity_attributes",
      create: `CREATE TABLE entity_attributes_new (
        id TEXT PRIMARY KEY NOT NULL,
        entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
        key TEXT NOT NULL,
        value TEXT,
        UNIQUE(entity_id, key)
      )`,
      indexes: [
        "CREATE INDEX IF NOT EXISTS idx_entity_attributes_entity ON entity_attributes(entity_id)"
      ]
    },
    {
      name: "entity_tags",
      create: `CREATE TABLE entity_tags_new (
        id TEXT PRIMARY KEY NOT NULL,
        entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
        tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(entity_id, tag_id)
      )`,
      indexes: [
        "CREATE INDEX IF NOT EXISTS idx_entity_tags_entity ON entity_tags(entity_id)",
        "CREATE INDEX IF NOT EXISTS idx_entity_tags_tag ON entity_tags(tag_id)"
      ]
    },
    {
      name: "entity_links",
      create: `CREATE TABLE entity_links_new (
        id TEXT PRIMARY KEY NOT NULL,
        source_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
        target_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
        link_type TEXT NOT NULL DEFAULT 'related',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(source_id, target_id, link_type)
      )`,
      indexes: [
        "CREATE INDEX IF NOT EXISTS idx_entity_links_source ON entity_links(source_id)",
        "CREATE INDEX IF NOT EXISTS idx_entity_links_target ON entity_links(target_id)"
      ]
    },
    {
      name: "concept_matches",
      create: `CREATE TABLE concept_matches_new (
        id TEXT PRIMARY KEY,
        concept_id TEXT NOT NULL REFERENCES concept_rules(id) ON DELETE CASCADE,
        entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
        matched_at TEXT DEFAULT (datetime('now')),
        UNIQUE(concept_id, entity_id)
      )`,
      indexes: []
    }
  ];

  for (const table of tables) {
    const exists = db.prepare(
      "SELECT name FROM sqlite_master WHERE name = ? AND type = 'table'"
    ).get(table.name) as { name: string } | undefined;

    if (exists) {
      const createSql = (db.prepare(
        "SELECT sql FROM sqlite_master WHERE name = ? AND type = 'table'"
      ).get(table.name) as { sql: string } | undefined)?.sql;

      if (createSql?.includes("entities_backup")) {
        db.exec(`CREATE TABLE IF NOT EXISTS ${table.name}_new AS SELECT * FROM ${table.name}`);
        db.exec(`DROP TABLE IF EXISTS ${table.name}`);
        db.exec(table.create.replace(`${table.name}_new`, table.name));
        db.exec(`INSERT OR IGNORE INTO ${table.name} SELECT * FROM ${table.name}_new`);
        db.exec(`DROP TABLE IF EXISTS ${table.name}_new`);
        for (const idx of table.indexes) {
          db.exec(idx);
        }
        results.push(`  ✓ Fixed ${table.name} FK references`);
      } else {
        results.push(`  - ${table.name}: already OK`);
      }
    }
  }

  // Step 2: Import data from JSON files
  results.push("\n=== Step 2: Importing data ===");

  const dataDir = path.join(process.cwd(), "public", "data");

  // Import entity_attributes
  const attrsPath = path.join(dataDir, "entity_attributes.json");
  if (fs.existsSync(attrsPath)) {
    const attrs = JSON.parse(fs.readFileSync(attrsPath, "utf-8")) as Array<{
      id: string;
      entity_id: string;
      key: string;
      value: string;
    }>;

    const insertAttr = db.prepare(
      "INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value) VALUES (?, ?, ?, ?)"
    );

    let imported = 0;
    for (const attr of attrs) {
      try {
        insertAttr.run(attr.id, attr.entity_id, attr.key, attr.value);
        imported++;
      } catch {
        // Ignore duplicates
      }
    }
    results.push(`  ✓ Imported ${imported} entity_attributes`);
  } else {
    results.push(`  ⚠ entity_attributes.json not found`);
  }

  // Import entity_tags
  const tagsPath = path.join(dataDir, "entity_tags.json");
  if (fs.existsSync(tagsPath)) {
    const tags = JSON.parse(fs.readFileSync(tagsPath, "utf-8")) as Array<{
      id: string;
      entity_id: string;
      tag_id: string;
      created_at: string;
    }>;

    const insertTag = db.prepare(
      "INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id, created_at) VALUES (?, ?, ?, ?)"
    );

    let imported = 0;
    for (const tag of tags) {
      try {
        insertTag.run(tag.id, tag.entity_id, tag.tag_id, tag.created_at);
        imported++;
      } catch {
        // Ignore duplicates
      }
    }
    results.push(`  ✓ Imported ${imported} entity_tags`);
  } else {
    results.push(`  ⚠ entity_tags.json not found`);
  }

  // Step 3: Verify
  results.push("\n=== Step 3: Verification ===");
  const entityCount = (db.prepare("SELECT COUNT(*) as cnt FROM entities").get() as { cnt: number }).cnt;
  const attrCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_attributes").get() as { cnt: number }).cnt;
  const tagCount = (db.prepare("SELECT COUNT(*) as cnt FROM tags").get() as { cnt: number }).cnt;
  const entityTagCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_tags").get() as { cnt: number }).cnt;
  const linkCount = (db.prepare("SELECT COUNT(*) as cnt FROM entity_links").get() as { cnt: number }).cnt;

  results.push(`  Entities: ${entityCount}`);
  results.push(`  Attributes: ${attrCount}`);
  results.push(`  Tags: ${tagCount}`);
  results.push(`  Entity Tags: ${entityTagCount}`);
  results.push(`  Links: ${linkCount}`);

  return NextResponse.json({
    success: true,
    results
  });
}
