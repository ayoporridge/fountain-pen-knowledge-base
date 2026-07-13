import path from "node:path";
import Database from "better-sqlite3";
import { publicEntityFilter } from "../src/lib/public-visibility";

type ArticleRow = {
  slug: string;
  name: string;
  summary: string | null;
  body_md: string | null;
};

const TRANSLATION_PROCESS_PATTERNS: Array<[RegExp, string]> = [
  [/翻译结果/i, "translation-result marker"],
  [/请(?:将|把)以下[^\n]{0,80}翻译/i, "translation instruction"],
  [/请稍等[，,。…\s]*我将/i, "assistant waiting message"],
  [/保持\s*Markdown\s*(?:格式)?/i, "Markdown translation instruction"],
  [/翻译严格遵循/i, "translation compliance note"],
  [/根据翻译要求/i, "translation requirement note"],
];

const MARKDOWN_LINK_OR_IMAGE =
  /!\[|\[[^\]\n]*\](?:\([^\n)]*\)|\[[^\]\n]*\])/;

function main() {
  const database = new Database(path.join(process.cwd(), "data/fpkg.db"), {
    readonly: true,
  });
  const failures: string[] = [];

  try {
    const articles = database
      .prepare(
        `SELECT e.slug, e.name, e.summary, e.body_md
         FROM entities e
         WHERE e.type = 'article'
           AND ${publicEntityFilter("e")}
         ORDER BY e.slug`,
      )
      .all() as ArticleRow[];

    if (articles.length === 0) {
      failures.push("public article query returned no rows");
    }

    for (const article of articles) {
      const summary = article.summary || "";
      const body = article.body_md || "";
      const label = `${article.slug} (${article.name})`;

      if (!summary.trim()) {
        failures.push(`${label}: summary is empty`);
      }
      if ([...summary.trim()].length > 160) {
        failures.push(`${label}: summary exceeds 160 characters`);
      }
      if (/[\r\n]/.test(summary)) {
        failures.push(`${label}: summary contains a line break`);
      }
      if (MARKDOWN_LINK_OR_IMAGE.test(summary)) {
        failures.push(`${label}: summary contains a Markdown link or image`);
      }

      for (const [pattern, description] of TRANSLATION_PROCESS_PATTERNS) {
        if (pattern.test(summary)) {
          failures.push(`${label}: summary contains ${description}`);
        }
        if (pattern.test(body)) {
          failures.push(`${label}: body contains ${description}`);
        }
      }

      if (/```\s*markdown\b/i.test(body)) {
        failures.push(`${label}: body contains a markdown import fence`);
      }
      if (/\[内容已截断\]/.test(body)) {
        failures.push(`${label}: body contains the truncation marker`);
      }
    }

    if (failures.length > 0) {
      console.error(
        `Article content check failed with ${failures.length} violation(s) across ${articles.length} public article(s):`,
      );
      for (const failure of failures) console.error(`- ${failure}`);
      process.exitCode = 1;
      return;
    }

    console.log(
      `Article content OK: checked all ${articles.length} public article(s).`,
    );
  } finally {
    database.close();
  }
}

main();
