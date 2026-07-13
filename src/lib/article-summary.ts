const MIN_SUMMARY_LENGTH = 80;
const TARGET_SUMMARY_LENGTH = 140;

const SKIP_BLOCK_PATTERNS = [
  /^\s{0,3}#{1,6}\s+/,
  /^\s*>?\s*(?:来源|source)\s*[:：]/i,
  /^\s*(?:作者|撰文|译者|发布日期|发布于|更新于|最后更新)\s*[:：]?/i,
  /^\s*[（(]?(?:本文)?(?:发布|更新)于\s*\d{4}年/i,
  /^\s*(?:[-*_]\s*){3,}$/,
  /^\s*\|?.*\|.*\|\s*$/,
  /^\s*<(?:figure|img|table|script|style)\b/i,
  /^\s*!\[[^\]]*\]\(/,
];

const RESIDUE_PATTERNS = [
  /翻译结果|翻译要求|请将以下|请稍等|保持\s*Markdown|以下是.{0,20}翻译|译文如下/i,
  /(?:点击|单击|长按|鼠标悬停|触屏设备).{0,28}(?:图片|图像|截图|放大|查看)/i,
  /(?:图片|图像|截图).{0,28}(?:点击|单击|长按|鼠标悬停|放大|查看)/i,
  /返回(?:本页)?顶部|回到(?:本页)?顶部|上一页|下一页/i,
  /本文信息(?:力求|尽可能)准确|不应视为绝对权威|若您对本页面内容有补充/i,
  /(?:欢迎|请)(?:通过)?邮件.{0,24}(?:分享|联系|告知|修正)/i,
  /本文(?:亦)?(?:收录|节选)于.{0,24}(?:电子书|指南)|购买.{0,12}电子书/i,
  /版权所有|未经许可.{0,12}(?:转载|复制)/i,
  /图片来源|照片(?:来源|由)|摄影[:：]|合理使用条款|依据.{0,12}第107条/i,
];

function removeImportOnlyLines(markdown: string): string {
  return markdown
    .split("\n")
    .map((line) => {
      const text = line.trim();
      const plainText = text.replace(/[*_]/g, "");
      if (!text) return "";
      if (/^#{1,6}\s+/.test(text)) return "";
      if (/^>\s*(?:来源|source|来源站点)\s*[:：]/i.test(text)) return "";
      if (
        /^>?\s*(?:作者|撰文|译者|建库日期|翻译日期|提炼日期|提炼视角)\s*[:：]/i.test(
          text,
        )
      ) {
        return "";
      }
      if (
        /^[（(](?:本文|本页|本页面)?(?:发布|更新)于\s*\d{4}年[^）)]*[）)]$/.test(
          plainText,
        )
      ) {
        return "";
      }
      if (/^(?:[-*_]\s*){3,}$/.test(text)) return "";
      if (/^\|.*\|\s*$/.test(text) || /^[-:|\s]+$/.test(text)) return "";
      if (/^!\[[^\]]*\]\(/.test(text)) return "";
      if (/^>\s*\[?!\[.*(?:说明|注意|警告)/i.test(text)) return "";
      return line;
    })
    .join("\n");
}

function decodeCommonEntities(value: string): string {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripMarkdown(value: string): string {
  let text = value
    .replace(/<figure\b[\s\S]*?<\/figure>/gi, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/!\[[^\]]*\]\((?:<[^>]*>|[^)])*\)/g, " ")
    .replace(/!\[[^\]]*\]\[[^\]]*\]/g, " ")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1");

  // Run twice so ordinary links nested inside emphasis are flattened too.
  for (let index = 0; index < 2; index += 1) {
    text = text.replace(/\[([^\]]+)\]\((?:<[^>]*>|[^)])*\)/g, "$1");
  }

  return decodeCommonEntities(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}(?:#{1,6}|>|[-+*]|\d+[.)])\s*/gm, "")
    .replace(/```[a-z0-9_-]*|```/gi, " ")
    .replace(/[*_~`]/g, "")
    .replace(/\\([\\`*_{}[\]()#+\-.!])/g, "$1")
    .replace(/[ \t]*\n[ \t]*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isUsefulBlock(rawBlock: string, cleaned: string): boolean {
  if (!cleaned || cleaned.length < 12) return false;
  if (SKIP_BLOCK_PATTERNS.some((pattern) => pattern.test(rawBlock))) {
    return false;
  }
  if (RESIDUE_PATTERNS.some((pattern) => pattern.test(cleaned))) return false;
  if (/^(?:[|｜]\s*)?(?:说明|注意|警告)\s+/.test(cleaned)) return false;
  if (
    /^(?:日期|卷号|链接|备注)(?:\s*[|｜]\s*(?:日期|卷号|链接|备注))+/i.test(
      cleaned,
    )
  ) {
    return false;
  }

  const hanCount = cleaned.match(/[\u3400-\u9fff]/g)?.length || 0;
  return hanCount >= 4;
}

function trimAtSentenceBoundary(value: string): string {
  if (value.length <= TARGET_SUMMARY_LENGTH) return value;

  const window = value.slice(0, TARGET_SUMMARY_LENGTH);
  for (let index = window.length - 1; index >= MIN_SUMMARY_LENGTH; index -= 1) {
    if (/[。！？；]/.test(window[index])) {
      return window.slice(0, index + 1).trim();
    }
  }

  return `${value.slice(0, TARGET_SUMMARY_LENGTH - 1).trimEnd()}…`;
}

/**
 * Builds a factual card summary from the first useful prose in an article.
 * It only removes import syntax/residue and truncates existing prose; it does
 * not paraphrase or add facts.
 */
export function articleSummaryFromMarkdown(
  markdown: string | null | undefined,
): string {
  if (!markdown) return "";

  const blocks = removeImportOnlyLines(markdown)
    .replace(/\r\n?/g, "\n")
    .replace(/^\s*```(?:markdown)?\s*$/gim, "\n")
    .replace(/[ \t]{2,}\n/g, "\n\n")
    .split(/\n\s*\n+/)
    .map((raw) => ({ raw, cleaned: stripMarkdown(raw) }))
    .filter(({ raw, cleaned }) => isUsefulBlock(raw, cleaned));

  if (blocks.length === 0) return "";

  let summary = "";
  for (const { cleaned } of blocks) {
    summary = summary ? `${summary} ${cleaned}` : cleaned;
    if (summary.length >= MIN_SUMMARY_LENGTH) break;
  }

  return trimAtSentenceBoundary(summary)
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isCleanArticleSummary(summary: string): boolean {
  return (
    summary.length >= MIN_SUMMARY_LENGTH &&
    summary.length <= TARGET_SUMMARY_LENGTH &&
    !/[\r\n]/.test(summary) &&
    !/!\[[^\]]*\]\(|\[[^\]]+\]\([^)]+\)|```|^\s{0,3}#{1,6}\s/m.test(summary) &&
    !RESIDUE_PATTERNS.some((pattern) => pattern.test(summary))
  );
}

export const ARTICLE_SUMMARY_LIMITS = {
  min: MIN_SUMMARY_LENGTH,
  max: TARGET_SUMMARY_LENGTH,
} as const;
