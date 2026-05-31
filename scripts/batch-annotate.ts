import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { nanoid } from "nanoid";

const DB_PATH = path.join(process.cwd(), "data", "fpkg.db");

interface ExtractionResult {
  entities: Array<{
    name: string;
    type: string;
    summary?: string;
    attributes?: Record<string, string>;
    confidence: number;
  }>;
  tags: Array<{
    name: string;
    dimension: string;
    confidence: number;
  }>;
  links: Array<{
    targetSlug: string;
    linkType: string;
    confidence: number;
  }>;
}

const SYSTEM_PROMPT = `你是一个钢笔知识图谱的标注助手。从给定的文本中提取结构化信息。

要求：
1. 提取提到的钢笔实体（笔、品牌、笔尖类型等）
2. 提取可打标签的属性（材质、价位、产地、上墨方式等）
3. 为每个提取结果标注置信度（0-1）

输出 JSON 格式：
{
  "tags": [{"name": "...", "dimension": "nib_type|fill_system|origin|price|body_material|nib_material|usage|style", "confidence": 0.8}],
  "links": [{"targetSlug": "...", "linkType": "brand_of|uses|related|makes", "confidence": 0.7}]
}

只输出 JSON，不要其他内容。不要重新创建已有的实体，只提供建议的标签和链接。`;

async function annotateEntity(
  entity: { id: string; name: string; body_md: string | null; summary: string | null },
  apiKey: string,
): Promise<ExtractionResult | null> {
  const text = [entity.name, entity.summary, entity.body_md?.slice(0, 4000)]
    .filter(Boolean)
    .join("\n\n");

  if (text.length < 50) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text.slice(0, 6000) },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { choices: Array<{ message?: { content?: string } }> };
    const content = data.choices[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Set OPENAI_API_KEY environment variable");
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  // Get entities without tags (or with few tags)
  const entities = db
    .prepare(
      `SELECT e.id, e.name, e.body_md, e.summary
       FROM entities e
       LEFT JOIN entity_tags et ON et.entity_id = e.id
       GROUP BY e.id
       HAVING COUNT(et.id) < 3
       ORDER BY RANDOM()
       LIMIT 50`,
    )
    .all() as Array<{ id: string; name: string; body_md: string | null; summary: string | null }>;

  console.log(`Found ${entities.length} entities with few tags. Annotating...`);

  const insertTag = db.prepare(
    "INSERT OR IGNORE INTO tags (id, name, slug, dimension) VALUES (?, ?, ?, ?)",
  );
  const findTag = db.prepare(
    "SELECT id FROM tags WHERE slug = ? AND dimension = ?",
  );
  const insertEntityTag = db.prepare(
    "INSERT OR IGNORE INTO entity_tags (id, entity_id, tag_id) VALUES (?, ?, ?)",
  );
  const findEntityBySlug = db.prepare(
    "SELECT id FROM entities WHERE slug = ?",
  );
  const insertLink = db.prepare(
    "INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type) VALUES (?, ?, ?, ?)",
  );

  let annotated = 0;
  let tagsAdded = 0;
  let linksAdded = 0;

  for (const entity of entities) {
    console.log(`  Annotating: ${entity.name}...`);
    const result = await annotateEntity(entity, apiKey);

    if (!result) continue;

    // Add tags
    for (const tag of result.tags) {
      if (tag.confidence < 0.5) continue;
      const slug = tag.name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
      insertTag.run(nanoid(12), tag.name, slug, tag.dimension);
      const found = findTag.get(slug, tag.dimension) as { id: string } | undefined;
      if (found) {
        try {
          insertEntityTag.run(nanoid(12), entity.id, found.id);
          tagsAdded++;
        } catch {
          // duplicate
        }
      }
    }

    // Add links
    for (const link of result.links) {
      if (link.confidence < 0.5) continue;
      const target = findEntityBySlug.get(link.targetSlug) as { id: string } | undefined;
      if (target && target.id !== entity.id) {
        try {
          insertLink.run(nanoid(12), entity.id, target.id, link.linkType);
          linksAdded++;
        } catch {
          // duplicate
        }
      }
    }

    annotated++;
    // Rate limit: 1 request per second
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ Done: ${annotated} entities annotated, ${tagsAdded} tags added, ${linksAdded} links added`);
  db.close();
}

main().catch(console.error);
