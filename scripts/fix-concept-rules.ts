/**
 * Fix concept rules to match actual tag slugs in the database,
 * then rebuild concept_matches and generate links.
 */

import Database from "better-sqlite3";
import path from "node:path";
import { nanoid } from "nanoid";

const DB_PATH = path.join(process.cwd(), "data", "fpkg.db");

function main() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  // Step 1: Get all available tags
  const allTags = db
    .prepare("SELECT dimension, slug, name FROM tags")
    .all() as Array<{ dimension: string; slug: string; name: string }>;

  const tagMap = new Map<string, { slug: string; name: string }>();
  for (const t of allTags) {
    tagMap.set(`${t.dimension}:${t.slug}`, { slug: t.slug, name: t.name });
  }

  console.log("=== Available tags ===");
  const dims = new Map<string, string[]>();
  for (const t of allTags) {
    if (!dims.has(t.dimension)) dims.set(t.dimension, []);
    dims.get(t.dimension)!.push(`${t.slug} (${t.name})`);
  }
  for (const [dim, slugs] of dims) {
    console.log(`${dim}: ${slugs.join(", ")}`);
  }

  // Step 2: Fix concept rules with correct tag slugs
  const FIXED_CONCEPTS = [
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
      conditions: [{ dimension: "price", tag_slug: "price-entry" }],
    },
    {
      name: "高端限量笔",
      slug: "premium-limited",
      description: "高端限量版钢笔，收藏与使用兼顾",
      conditions: [
        { dimension: "price", tag_slug: "price-flagship" },
      ],
    },
    {
      name: "弹性尖钢笔",
      slug: "flex-nib-pens",
      description: "具有弹性的笔尖，适合书法和表现力书写",
      conditions: [{ dimension: "nib_type", tag_slug: "nib-flex" }],
    },
    {
      name: "透明示范笔",
      slug: "demonstrator-pens",
      description: "透明笔身可观赏墨水和内部结构",
      conditions: [{ dimension: "style", tag_slug: "style-vintage" }],
    },
    {
      name: "日用旗舰",
      slug: "daily-driver-flagships",
      description: "适合日常高强度使用的旗舰级钢笔",
      conditions: [
        { dimension: "usage", tag_slug: "use-daily" },
        { dimension: "price", tag_slug: "price-high" },
      ],
    },
    {
      name: "复古钢笔",
      slug: "vintage-pens",
      description: "具有年代感的古董或复刻钢笔",
      conditions: [{ dimension: "era", tag_slug: "era-vintage-reissue" }],
    },
    {
      name: "意大利制笔",
      slug: "italian-pens",
      description: "意大利品牌钢笔，以设计感和材质著称",
      conditions: [{ dimension: "origin", tag_slug: "origin-italy" }],
    },
    {
      name: "书法练字笔",
      slug: "calligraphy-pens",
      description: "适合书法练习和艺术书写的钢笔",
      conditions: [{ dimension: "usage", tag_slug: "use-calligraphy" }],
    },
  ];

  console.log("\n=== Updating concept rules ===");
  const upsertRule = db.prepare(`
    INSERT OR REPLACE INTO concept_rules (id, name, slug, description, conditions, created_at, updated_at)
    VALUES (
      COALESCE((SELECT id FROM concept_rules WHERE slug = ?), ?),
      ?, ?, ?, ?, datetime('now'), datetime('now')
    )
  `);

  for (const c of FIXED_CONCEPTS) {
    const existingId = (
      db.prepare("SELECT id FROM concept_rules WHERE slug = ?").get(c.slug) as { id: string } | undefined
    )?.id;
    const id = existingId || nanoid(12);

    // Validate conditions exist
    const valid = c.conditions.every((cond) =>
      tagMap.has(`${cond.dimension}:${cond.tag_slug}`),
    );

    if (!valid) {
      console.log(`⚠️  ${c.name}: missing tags, skipping`);
      continue;
    }

    upsertRule.run(c.slug, id, c.name, c.slug, c.description, JSON.stringify(c.conditions));
    console.log(`✅ ${c.name} (${c.slug})`);
  }

  // Step 3: Rebuild concept_matches
  console.log("\n=== Rebuilding concept_matches ===");
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

  // Step 4: Generate tag-based entity links
  console.log("\n=== Generating tag-based entity links ===");
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
      `SELECT t.id as tag_id, et.entity_id
       FROM entity_tags et
       JOIN tags t ON t.id = et.tag_id`,
    )
    .all() as Array<{ tag_id: string; entity_id: string }>;

  const groups = new Map<string, string[]>();
  for (const row of tagGroups) {
    if (!groups.has(row.tag_id)) groups.set(row.tag_id, []);
    groups.get(row.tag_id)!.push(row.entity_id);
  }

  let linksCreated = 0;
  for (const [, entityIds] of groups) {
    if (entityIds.length < 2 || entityIds.length > 50) continue;
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

  // Step 5: Summary
  console.log("\n=== Summary ===");
  const stats = db
    .prepare("SELECT type, COUNT(*) as cnt FROM entities GROUP BY type ORDER BY cnt DESC")
    .all() as Array<{ type: string; cnt: number }>;
  console.log("\nEntity types:");
  for (const s of stats) {
    console.log(`  ${s.type}: ${s.cnt}`);
  }

  const totalLinks = (
    db.prepare("SELECT COUNT(*) as cnt FROM entity_links").get() as { cnt: number }
  ).cnt;
  console.log(`\nTotal links: ${totalLinks}`);

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
