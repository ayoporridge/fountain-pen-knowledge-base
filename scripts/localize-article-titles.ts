import { createClient, type Client, type InArgs } from "@libsql/client";

const WRITE = process.argv.includes("--write");

type ArticleRow = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  bodyMd: string | null;
};

const SLUG_TITLE_FALLBACKS: Record<string, string> = {
  i: "钢笔医生 I",
  ii: "钢笔医生 II",
};

function getClient() {
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  return createClient({ url: "file:data/fpkg.db" });
}

async function execute<T extends Record<string, unknown> = Record<string, unknown>>(
  db: Client,
  sql: string,
  args: unknown[] = [],
) {
  return db.execute({ sql, args: args as InArgs }).then((result) =>
    result.rows.map((row) => row as T),
  );
}

function hasChinese(text: string) {
  return /[\u3400-\u9fff]/.test(text);
}

function cleanTitleCandidate(value: string) {
  return value
    .replace(/^```[a-z-]*\s*/i, "")
    .replace(/```$/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/^#+\s*/g, "")
    .replace(/^>\s*/g, "")
    .replace(/^翻译结果[:：]\s*/g, "")
    .replace(/[*_`]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([：:，。！？])/g, "$1")
    .replace(/[。！？.!?]\s*$/g, "")
    .trim();
}

function isGoodTitle(value: string) {
  return (
    hasChinese(value) &&
    value.length >= 2 &&
    value.length <= 80 &&
    !/来源[:：]/.test(value) &&
    !/^翻译结果[:：]?$/.test(value)
  );
}

function candidatesFromText(value: string | null) {
  if (!value) return [];

  const beforeSource = value
    .replace(/\r/g, "\n")
    .split(/>\s*来源[:：]|来源[:：]|>\s*Source[:：]|Source[:：]/i)[0];

  const lines = beforeSource
    .split(/\n+/)
    .map(cleanTitleCandidate)
    .filter(Boolean);

  return [cleanTitleCandidate(beforeSource), ...lines];
}

function extractPenDoctorTitle(row: ArticleRow) {
  if (!/^[ivxlcdm]+$/i.test(row.slug)) return "";

  const source = [row.summary, row.bodyMd].filter(Boolean).join("\n");
  const text = source
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_`>#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const match = text.match(
    /钢笔医生(?:专栏)?\s*(?:第)?([IVXLCDM]+|[一二三四五六七八九十百零两]+)(?:章|期)?(?:\s*[（(][^）)]*[）)])?\s+([^。！？!\[]{4,40})/,
  );
  const topic = cleanTitleCandidate(match?.[2] || "")
    .replace(/^[:：]\s*/, "")
    .split(/\s+(?:我|我的|我有|我买|请|一支|Frank|钢笔医生)/)[0]
    .replace(/[（(][^）)]*$/g, "")
    .trim();

  if (topic && topic.length >= 4 && topic.length <= 28 && hasChinese(topic)) {
    return `钢笔医生 ${row.name}：${topic}`;
  }

  return `钢笔医生 ${row.name}`;
}

function localizedTitle(row: ArticleRow) {
  const penDoctorTitle = extractPenDoctorTitle(row);
  if (penDoctorTitle) return penDoctorTitle;

  for (const candidate of [
    ...candidatesFromText(row.summary),
    ...candidatesFromText(row.bodyMd),
  ]) {
    if (isGoodTitle(candidate)) return candidate;
  }

  return SLUG_TITLE_FALLBACKS[row.slug] || "";
}

async function main() {
  const db = getClient();
  const rows = await execute<ArticleRow>(
    db,
    `SELECT id, slug, name, summary, body_md AS bodyMd
     FROM entities
     WHERE type = 'article'
     ORDER BY slug`,
  );

  let updateCount = 0;
  const skipped: ArticleRow[] = [];

  for (const row of rows) {
    const nextTitle = localizedTitle(row);
    if (!nextTitle) {
      skipped.push(row);
      continue;
    }

    if (nextTitle === row.name) continue;

    updateCount += 1;
    console.log(`${row.slug}: ${row.name} -> ${nextTitle}`);

    if (WRITE) {
      await db.execute({
        sql: `UPDATE entities
              SET name = ?, updated_at = datetime('now')
              WHERE id = ?`,
        args: [nextTitle, row.id],
      });
    }
  }

  console.log(`${WRITE ? "Updated" : "Would update"} article titles: ${updateCount}`);
  if (skipped.length > 0) {
    console.log(`Skipped without Chinese title: ${skipped.length}`);
    for (const row of skipped.slice(0, 20)) {
      console.log(`  - ${row.slug}: ${row.name}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
