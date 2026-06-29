import { createClient, type Client, type InArgs } from "@libsql/client";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const OUT_PATH = path.join(
  process.cwd(),
  "docs/content/read-first-rewrite-baseline.md",
);

type Row = {
  slug: string;
  name: string;
  storyLen: number;
  body: string;
  officialRefs: number;
  reviewRefs: number;
  indexRefs: number;
  retailerRefs: number;
  totalRefs: number;
};

const PRIORITY_A = new Set([
  "派克-parker-51-经典-vintage",
  "凌美-lamy-lamy-2000",
  "百乐-pilot-custom-823",
  "白金-platinum-3776-century",
  "sailor-pro-gear",
  "万宝龙-montblanc-大班149-meisterst-ck",
  "百利金-pelikan-m800",
  "kaweco-sport",
  "白金-platinum-出云-izumo",
  "sheaffer-s-snorkel",
  "写乐-sailor-1911-profit系列",
  "pelikan-souveran-m800",
  "pilot-custom-823",
  "the-parker-51",
]);

const TEMPLATE_PATTERN =
  /型号档案记录了|现有来源包括|优先按实物图|这是一个钢笔型号|日用性可以从这些结构入手|字段能帮助读者|产地或品牌背景指向|后续应|可以作为|应把它放在|方便读者确认|资料不足|当前档案|当前页面|研究队列/;

function getClient() {
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: "file:data/fpkg.db" });
}

async function execute<T extends Record<string, unknown>>(
  db: Client,
  sql: string,
  args: unknown[] = [],
) {
  const result = await db.execute({ sql, args: args as InArgs });
  return result.rows.map((row) => row as T);
}

function classify(row: Row) {
  if (PRIORITY_A.has(row.slug)) return "A";
  if (row.officialRefs > 0 && row.reviewRefs + row.retailerRefs > 0) return "A";
  if (row.officialRefs > 0 || row.reviewRefs > 1 || row.totalRefs >= 3) return "B";
  return "C";
}

function needsRewrite(row: Row) {
  return row.storyLen < 900 || TEMPLATE_PATTERN.test(row.body);
}

function pct(value: number, total: number) {
  return total === 0 ? "0%" : `${Math.round((value / total) * 100)}%`;
}

function rowToMarkdown(row: Row) {
  return `| ${classify(row)} | ${row.slug} | ${row.name.replace(/\|/g, "/")} | ${row.storyLen} | ${row.officialRefs} | ${row.reviewRefs} | ${row.retailerRefs} | ${row.indexRefs} | ${needsRewrite(row) ? "是" : "否"} |`;
}

async function main() {
  const db = getClient();
  const rows = await execute<Row>(
    db,
    `SELECT
       e.slug,
       e.name,
       length(s.body_md) AS storyLen,
       s.body_md AS body,
       COUNT(CASE WHEN sr.source_type = 'official' THEN 1 END) AS officialRefs,
       COUNT(CASE WHEN sr.source_type IN ('blog', 'forum', 'reddit') THEN 1 END) AS reviewRefs,
       COUNT(CASE WHEN sr.source_type = 'retailer' THEN 1 END) AS retailerRefs,
       COUNT(CASE WHEN sr.source_type = 'user_submission' THEN 1 END) AS indexRefs,
       COUNT(er.id) AS totalRefs
     FROM entities e
     JOIN stories s ON s.entity_id = e.id AND s.story_type = 'model_story'
     LEFT JOIN entity_references er ON er.entity_id = e.id
     LEFT JOIN source_items si ON si.id = er.source_item_id
     LEFT JOIN source_registry sr ON sr.id = si.source_id
     WHERE e.type = 'pen'
     GROUP BY e.id, s.id
     ORDER BY e.slug`,
  );

  const total = rows.length;
  const templateLike = rows.filter(needsRewrite).length;
  const classes = rows.reduce(
    (acc, row) => {
      acc[classify(row)] += 1;
      return acc;
    },
    { A: 0, B: 0, C: 0 },
  );
  const lengths = rows.map((row) => row.storyLen).sort((a, b) => a - b);
  const avg = Math.round(
    lengths.reduce((sum, length) => sum + length, 0) / Math.max(total, 1),
  );
  const median = lengths[Math.floor(lengths.length / 2)] || 0;

  const priorityRows = rows.filter((row) => PRIORITY_A.has(row.slug));
  const restRows = rows.filter((row) => !PRIORITY_A.has(row.slug));
  const tableRows = [...priorityRows, ...restRows]
    .slice(0, 120)
    .map(rowToMarkdown)
    .join("\n");

  const report = `# Read first 重写基线

生成时间：${new Date().toISOString()}

## 总览

- 钢笔详情页：${total}
- 仍像资料卡或短说明：${templateLike}（${pct(templateLike, total)}）
- 字数：最短 ${lengths[0] || 0}，中位数 ${median}，平均 ${avg}，最长 ${lengths[lengths.length - 1] || 0}
- A 档：${classes.A}
- B 档：${classes.B}
- C 档：${classes.C}

## 分级规则

- A 档：经典型号、第一批样板，或同时具备官方来源与评测/零售来源。目标长度 2000-3500 字。
- B 档：有明确官方、专业或多来源支撑，但不一定需要长文。目标长度 1000-1800 字。
- C 档：资料少、索引型或边缘型号。目标长度 500-900 字，写清楚能确认的事实和辨认方式。

## 内容问题

当前问题不是旧的污染句，而是仍有大量字段解释式文字。凡是出现“型号档案记录了”“现有来源包括”“优先按实物图”“日用性可以从这些结构入手”等表达，都应重写为面向读者的钢笔介绍。

## 前 120 条分级清单

| 档位 | slug | 名称 | 当前字数 | 官方 | 评测/社区 | 零售 | 搜索索引 | 需重写 |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
${tableRows}
`;

  if (WRITE) {
    mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    writeFileSync(OUT_PATH, report);
  }

  console.log(report);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
