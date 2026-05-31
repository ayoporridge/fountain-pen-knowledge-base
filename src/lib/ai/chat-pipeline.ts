import { getDb } from "@/lib/db";

interface ChatContext {
  entities: Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
    body_md: string | null;
    attributes: Record<string, string>;
    tags: string[];
    relevance: number;
  }>;
  totalMatches: number;
}

/**
 * Retrieve relevant entities from the knowledge graph
 * based on a natural language query.
 */
export async function retrieveContext(query: string): Promise<ChatContext> {
  const db = await getDb();

  // Simple keyword extraction: split query into terms
  const terms = query
    .replace(/[？。，、！?.!,]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  if (terms.length === 0) {
    return { entities: [], totalMatches: 0 };
  }

  // Build FTS5 query (OR of terms)
  const ftsQuery = terms.map((t) => `"${t}"`).join(" OR ");

  // Search entities
  const ftsResults = (await db
    .prepare(
      `SELECT e.id, e.type, e.slug, e.name, e.summary, e.body_md, rank
       FROM entities_fts fts
       JOIN entities e ON e.rowid = fts.rowid
       WHERE entities_fts MATCH ?
       ORDER BY rank
       LIMIT 20`,
    )
    .bind(ftsQuery)
    .all()).results as Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
    body_md: string | null;
    rank: number;
  }>;

  // Enrich with attributes and tags
  const enriched = [];
  for (const entity of ftsResults) {
    const attrs = (await db
      .prepare("SELECT key, value FROM entity_attributes WHERE entity_id = ?")
      .bind(entity.id)
      .all()).results as Array<{ key: string; value: string }>;

    const tags = (await db
      .prepare(
        `SELECT t.name FROM tags t
         JOIN entity_tags et ON et.tag_id = t.id
         WHERE et.entity_id = ?`,
      )
      .bind(entity.id)
      .all()).results as Array<{ name: string }>;

    enriched.push({
      ...entity,
      attributes: Object.fromEntries(attrs.map((a) => [a.key, a.value])),
      tags: tags.map((t) => t.name),
      relevance: Math.abs(entity.rank),
    });
  }

  return {
    entities: enriched,
    totalMatches: enriched.length,
  };
}

/**
 * Build a system prompt for the AI with knowledge graph context.
 */
export async function buildSystemPrompt(context: ChatContext): Promise<string> {
  if (context.entities.length === 0) {
    const db = await getDb();
    const countResult = await db.prepare("SELECT COUNT(*) as cnt FROM entities").first() as { cnt: number };
    return `你是"钢笔知识图谱"的 AI 助手。用户在浏览一个包含 ${countResult.cnt} 个词条的钢笔知识图谱。

当前查询没有找到匹配的词条。请基于你的钢笔知识回答用户的问题，并建议用户尝试不同的搜索词。`;
  }

  const entitySummaries = context.entities
    .slice(0, 10)
    .map((e) => {
      const attrStr = Object.entries(e.attributes)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      return `- **${e.name}** (${e.type})${e.summary ? `: ${e.summary}` : ""}${attrStr ? `\n  属性: ${attrStr}` : ""}${e.tags.length > 0 ? `\n  标签: ${e.tags.join(", ")}` : ""}`;
    })
    .join("\n");

  return `你是"钢笔知识图谱"的 AI 助手。系统中有一个包含 500+ 词条的钢笔百科数据库。

用户的问题匹配了以下词条：
${entitySummaries}

请基于以上知识图谱数据回答用户的问题：
- 推荐具体的词条和型号，引用词条名称
- 如果数据中有属性（价位、材质、笔尖等），结合这些信息给出具体建议
- 回答中提到词条时，用方括号标注：[词条名](/type/slug)
- 如果数据不足以回答，坦诚说明并基于你的钢笔知识补充
- 回答要简洁、实用，像一个懂笔的朋友在聊天`;
}
