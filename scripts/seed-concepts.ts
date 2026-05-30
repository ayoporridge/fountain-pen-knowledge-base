import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { nanoid } from "nanoid";

const DB_PATH = path.join(process.cwd(), "data", "fpkg.db");

const CONCEPTS = [
  {
    name: "日系金尖入门",
    slug: "japanese-gold-nib-entry",
    description: "日本品牌入门级金尖钢笔，适合初次体验金尖写感",
    conditions: [
      { dimension: "origin", tag_slug: "origin-japan" },
      { dimension: "nib_material", tag_slug: "nibmat-14k" },
    ],
  },
  {
    name: "德系活塞笔",
    slug: "german-piston-fillers",
    description: "德国品牌的活塞上墨钢笔，大墨量经典之选",
    conditions: [
      { dimension: "origin", tag_slug: "origin-germany" },
      { dimension: "fill_system", tag_slug: "fill-piston" },
    ],
  },
  {
    name: "学生用钢笔",
    slug: "student-pens",
    description: "适合学生日用的钢笔，价格亲民，书写流畅",
    conditions: [
      { dimension: "price", tag_slug: "price-100以下" },
    ],
  },
  {
    name: "高端限量笔",
    slug: "premium-limited",
    description: "高端限量版钢笔，收藏与使用兼顾",
    conditions: [
      { dimension: "price", tag_slug: "price-3000以上" },
    ],
  },
  {
    name: "弹性尖钢笔",
    slug: "flex-nib-pens",
    description: "具有弹性的笔尖，适合书法和表现力书写",
    conditions: [
      { dimension: "nib_type", tag_slug: "nib-flex" },
    ],
  },
  {
    name: "透明示范笔",
    slug: "demonstrator-pens",
    description: "透明笔身可观赏墨水和内部结构",
    conditions: [
      { dimension: "style", tag_slug: "style-demonstrator" },
    ],
  },
  {
    name: "日用旗舰",
    slug: "daily-driver-flagships",
    description: "适合日常高强度使用的旗舰级钢笔",
    conditions: [
      { dimension: "usage", tag_slug: "usage-daily" },
      { dimension: "price", tag_slug: "price-1000-2000" },
    ],
  },
  {
    name: "复古钢笔",
    slug: "vintage-pens",
    description: "具有年代感的古董或复刻钢笔",
    conditions: [
      { dimension: "era", tag_slug: "era-vintage" },
    ],
  },
  {
    name: "意大利制笔",
    slug: "italian-pens",
    description: "意大利品牌钢笔，以设计感和材质著称",
    conditions: [
      { dimension: "origin", tag_slug: "origin-italy" },
    ],
  },
  {
    name: "书法练字笔",
    slug: "calligraphy-pens",
    description: "适合书法练习和艺术书写的钢笔",
    conditions: [
      { dimension: "usage", tag_slug: "usage-calligraphy" },
    ],
  },
];

function main() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  // Run migration if needed
  try {
    db.prepare("SELECT id FROM concept_rules LIMIT 1").get();
  } catch {
    console.log("Running concept migration...");
    const migration = fs.readFileSync(
      path.join(process.cwd(), "migrations", "007_tag_hierarchy.sql"),
      "utf-8",
    );
    for (const stmt of migration.split(";").filter((s) => s.trim())) {
      db.exec(stmt);
    }
    db.prepare("INSERT OR IGNORE INTO migrations (name, applied_at) VALUES ('007_tag_hierarchy.sql', datetime('now'))").run();
  }

  const insertRule = db.prepare(
    "INSERT OR IGNORE INTO concept_rules (id, name, slug, description, conditions) VALUES (?, ?, ?, ?, ?)",
  );

  let created = 0;
  for (const c of CONCEPTS) {
    const id = nanoid(12);
    try {
      insertRule.run(id, c.name, c.slug, c.description, JSON.stringify(c.conditions));
      console.log(`✅ ${c.name} (${c.slug})`);
      created++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("UNIQUE")) {
        console.log(`⏭  ${c.name} (already exists)`);
      } else {
        console.log(`❌ ${c.name}: ${msg}`);
      }
    }
  }

  // Compute matches
  console.log("\nComputing concept matches...");
  const entities = db.prepare("SELECT id FROM entities").all() as Array<{ id: string }>;
  const rules = db.prepare("SELECT id, conditions FROM concept_rules").all() as Array<{ id: string; conditions: string }>;
  const insertMatch = db.prepare("INSERT OR IGNORE INTO concept_matches (id, concept_id, entity_id) VALUES (?, ?, ?)");

  // Get entity tags
  const getEntityTags = db.prepare(
    `SELECT t.dimension, t.slug FROM tags t JOIN entity_tags et ON et.tag_id = t.id WHERE et.entity_id = ?`
  );

  let totalMatches = 0;
  for (const entity of entities) {
    const tags = getEntityTags.all(entity.id) as Array<{ dimension: string; slug: string }>;
    const tagSet = new Set(tags.map((t) => `${t.dimension}:${t.slug}`));

    for (const rule of rules) {
      const conditions = JSON.parse(rule.conditions) as Array<{ dimension: string; tag_slug: string }>;
      if (conditions.length === 0) continue;
      const allMatch = conditions.every((c) => tagSet.has(`${c.dimension}:${c.tag_slug}`));
      if (allMatch) {
        insertMatch.run(nanoid(12), rule.id, entity.id);
        totalMatches++;
      }
    }
  }

  console.log(`\nDone: ${created} concepts created, ${totalMatches} entity-concept matches`);
  db.close();
}

main();
