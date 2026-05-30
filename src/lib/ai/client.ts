/**
 * AI client configuration for Vercel AI SDK.
 * Supports OpenAI and Anthropic providers.
 */

// Re-export from ai SDK when available
// For now, a simple wrapper around fetch for structured extraction

export interface ExtractionResult {
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
  "entities": [{"name": "...", "type": "pen|brand|nib|fill_system|concept", "summary": "...", "attributes": {}, "confidence": 0.9}],
  "tags": [{"name": "...", "dimension": "nib_type|fill_system|origin|price|body_material|nib_material|usage|style", "confidence": 0.8}],
  "links": [{"targetSlug": "...", "linkType": "brand_of|uses|related|makes", "confidence": 0.7}]
}

只输出 JSON，不要其他内容。`;

export async function extractFromText(text: string, apiKey?: string): Promise<ExtractionResult> {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("No API key configured. Set OPENAI_API_KEY environment variable.");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text.slice(0, 8000) },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from AI");
  }

  return JSON.parse(content) as ExtractionResult;
}

/**
 * Classify confidence into buckets.
 */
export function confidenceLevel(score: number): "high" | "medium" | "low" {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}
