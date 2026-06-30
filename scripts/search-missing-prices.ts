import { createClient, type Client, type InArgs } from "@libsql/client";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const USE_TURSO = process.argv.includes("--turso");
const SNAPSHOT_DATE =
  process.env.PRICE_SNAPSHOT_DATE || new Date().toISOString().slice(0, 10);
const REPORT_PATH = path.join(
  process.cwd(),
  "docs/content",
  `price-platform-search-${SNAPSHOT_DATE}.md`,
);

type MissingPenRow = {
  entity_id: string;
  slug: string;
  name: string;
  spec_id: string;
  price_range: string | null;
  aliases: string | null;
};

type PlatformResult = {
  slug: string;
  name: string;
  priceText: string | null;
  sourceName: string;
  sourceUrl: string | null;
  productTitle: string | null;
  method: string;
  note?: string;
};

type CyberbizImpression = {
  id?: string;
  name?: string;
  price?: string;
  brand?: string;
  category?: string;
  position?: number;
};

const NON_FOUNTAIN_PEN_WORDS = [
  "原子筆",
  "鋼珠筆",
  "钢珠笔",
  "自動鉛筆",
  "自动铅笔",
  "鉛筆",
  "铅笔",
  "墨水",
  "卡水",
  "筆芯",
  "笔芯",
  "替芯",
  "筆袋",
  "笔袋",
  "筆盒",
  "笔盒",
  "吸墨器",
  "converter",
  "rollerball",
  "ballpoint",
  "mechanical pencil",
];

const WEAK_QUERY_WORDS = new Set([
  "the",
  "pen",
  "pens",
  "fountain",
  "series",
  "family",
  "steel",
  "gold",
  "black",
  "silver",
  "classic",
  "vintage",
  "collection",
]);

const BRAND_TOKENS = new Set([
  "admok",
  "aurora",
  "campus",
  "conklin",
  "cross",
  "delike",
  "diplomat",
  "dongwu",
  "esterbrook",
  "eversharp",
  "faber",
  "castell",
  "gvfc",
  "graf",
  "hero",
  "hongdian",
  "jinhao",
  "kaweco",
  "kaco",
  "lamy",
  "leonardo",
  "majohn",
  "montblanc",
  "moonman",
  "nakaya",
  "namiki",
  "noodler",
  "opus",
  "paili",
  "parker",
  "pelikan",
  "pilot",
  "platinum",
  "sailor",
  "schneider",
  "sheaffer",
  "skb",
  "snowhite",
  "twsbi",
  "visconti",
  "wahl",
  "wancher",
  "waterman",
  "wingsung",
]);

const NON_MODEL_TOKENS = new Set([
  "10k",
  "12k",
  "14k",
  "18k",
  "21k",
  "24k",
  "585",
  "750",
  "black",
  "blue",
  "brown",
  "classic",
  "gold",
  "green",
  "gt",
  "limited",
  "red",
  "silver",
  "vintage",
  "white",
]);

function loadLocalEnv() {
  if (!USE_TURSO) return;
  const envPath = path.join(process.cwd(), ".env.local");
  let text = "";
  try {
    text = readFileSync(envPath, "utf8");
  } catch {
    return;
  }
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

function getClient() {
  loadLocalEnv();
  if (USE_TURSO) {
    if (!process.env.TURSO_DATABASE_URL) {
      throw new Error("--turso requires TURSO_DATABASE_URL");
    }
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: "file:data/fpkg.db" });
}

async function all<T extends Record<string, unknown>>(
  db: Client,
  sql: string,
  args: unknown[] = [],
) {
  const result = await db.execute({ sql, args: args as InArgs });
  return result.rows.map((row) => row as T);
}

async function run(db: Client, sql: string, args: unknown[] = []) {
  if (!WRITE) return;
  await db.execute({ sql, args: args as InArgs });
}

function stripDiacritics(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeText(value: string) {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[’'`]/g, "")
    .replace(/[：:·,，。()（）/\\[\]#&+.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function romanTokens(value: string) {
  return Array.from(normalizeText(value).matchAll(/[a-z0-9]+/g), (match) => match[0])
    .filter(
      (token) =>
        (token.length >= 2 || /^\d$/.test(token)) && !WEAK_QUERY_WORDS.has(token),
    );
}

function allTokens(value: string) {
  return Array.from(normalizeText(value).matchAll(/[a-z0-9]+/g), (match) => match[0]);
}

function parseAliases(value: string | null) {
  if (!value) return [];
  return value
    .split("|||")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((item) => item.trim()).filter(Boolean))];
}

function slugQuery(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function queryCandidates(row: MissingPenRow) {
  const aliases = parseAliases(row.aliases);
  const romanAlias = aliases.find((alias) => romanTokens(alias).length >= 2);
  return uniqueStrings([
    row.name,
    romanAlias || "",
    ...aliases.slice(0, 3),
    slugQuery(row.slug),
  ]).slice(0, 4);
}

function hasFountainPenSignal(title: string) {
  const text = title.toLowerCase();
  if (NON_FOUNTAIN_PEN_WORDS.some((word) => text.includes(word))) return false;
  return /鋼筆|钢笔|fountain pen/.test(text);
}

function relevanceScore(row: MissingPenRow, title: string, query: string) {
  if (!hasFountainPenSignal(title)) return -100;
  const titleText = normalizeText(title);
  const titleTokens = new Set(allTokens(title));
  const queryTokens = romanTokens(query);
  const nameTokens = uniqueStrings([
    ...romanTokens(row.name),
    ...parseAliases(row.aliases).flatMap(romanTokens),
    ...romanTokens(row.slug),
  ]);
  const importantTokens = uniqueStrings([...queryTokens, ...nameTokens]).filter(
    (token) => token.length >= 3,
  );
  const criticalModelTokens = uniqueStrings([...queryTokens, ...nameTokens]).filter(
    (token) => /^[a-z]?\d{1,4}[a-z]?$/.test(token),
  );
  for (const token of criticalModelTokens) {
    if (!titleTokens.has(token)) return -60;
  }
  const rowModelTokens = uniqueStrings([...romanTokens(row.name), ...romanTokens(row.slug)]).filter(
    (token) => !BRAND_TOKENS.has(token) && !NON_MODEL_TOKENS.has(token),
  );
  const queryModelTokens = queryTokens.filter(
    (token) => !BRAND_TOKENS.has(token) && !NON_MODEL_TOKENS.has(token),
  );
  const requiredModelTokens = (rowModelTokens.length ? rowModelTokens : queryModelTokens).slice(
    0,
    4,
  );
  if (requiredModelTokens.length === 0) return -30;
  for (const token of requiredModelTokens) {
    if (!titleTokens.has(token)) return -50;
  }
  if (importantTokens.length === 0) return -10;

  let matched = 0;
  for (const token of importantTokens) {
    if (titleText.includes(token)) matched += 1;
  }
  const required = Math.min(2, importantTokens.length);
  if (matched < required) return -20 + matched;

  let score = matched * 10;
  if (/鋼筆|钢笔/.test(title)) score += 8;
  if (/fountain pen/i.test(title)) score += 8;
  if (titleText.includes(normalizeText(query))) score += 12;
  return score;
}

function formatTwdPrice(value: string | null | undefined) {
  if (!value) return null;
  const numeric = Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return `NT$${numeric.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

function cyberbizSearchUrl(query: string) {
  return `https://penexchange.cyberbiz.co/search?q=${encodeURIComponent(query)}`;
}

function extractCyberbizPayload(html: string) {
  const match = html.match(/window\.c12t\s*=\s*(\{[\s\S]*?\});/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as { impressions?: CyberbizImpression[] };
  } catch {
    return null;
  }
}

async function fetchText(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "zh-TW,zh;q=0.9,en;q=0.8",
      },
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

async function searchCyberbiz(row: MissingPenRow): Promise<PlatformResult> {
  const attempts: string[] = [];
  for (const query of queryCandidates(row)) {
    attempts.push(query);
    const url = cyberbizSearchUrl(query);
    try {
      const html = await fetchText(url);
      const payload = extractCyberbizPayload(html);
      const impressions = payload?.impressions || [];
      const ranked = impressions
        .map((item) => ({
          item,
          score: relevanceScore(row, item.name || "", query),
        }))
        .filter(({ item, score }) => score >= 18 && item.price)
        .sort((a, b) => b.score - a.score || (a.item.position || 999) - (b.item.position || 999));
      const winner = ranked[0]?.item;
      const price = formatTwdPrice(winner?.price);
      if (winner && price) {
        return {
          slug: row.slug,
          name: row.name,
          priceText: `${price}（Pen Exchange，查询于 ${SNAPSHOT_DATE}）`,
          sourceName: "Pen Exchange",
          sourceUrl: url,
          productTitle: winner.name || null,
          method: "cyberbiz-search",
        };
      }
    } catch (error) {
      return {
        slug: row.slug,
        name: row.name,
        priceText: null,
        sourceName: "Pen Exchange",
        sourceUrl: url,
        productTitle: null,
        method: "cyberbiz-search",
        note: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return {
    slug: row.slug,
    name: row.name,
    priceText: null,
    sourceName: "Pen Exchange",
    sourceUrl: cyberbizSearchUrl(attempts[0] || row.name),
    productTitle: null,
    method: "cyberbiz-search",
    note: attempts.length ? `未匹配到明确钢笔商品；查询：${attempts.join(" / ")}` : "无查询词",
  };
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
) {
  const results: R[] = [];
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      results[current] = await mapper(items[current]);
    }
  });
  await Promise.all(workers);
  return results;
}

function markdownEscape(value: string | null | undefined) {
  return String(value || "").replace(/\|/g, "/").replace(/\n/g, " ");
}

function buildReport(results: PlatformResult[], totalMissing: number) {
  const found = results.filter((item) => item.priceText);
  const missing = results.filter((item) => !item.priceText);
  const lines = [
    `# 缺失价格平台补搜 ${SNAPSHOT_DATE}`,
    "",
    `生成时间：${new Date().toISOString()}`,
    "",
    "## 平台可用性",
    "",
    "- Pen Exchange / Cyberbiz：可读取搜索页结构化价格，本轮作为可靠写入来源。",
    "- Amazon：搜索页和商品页在当前环境返回验证/继续购物页，本轮不自动写入。",
    "- 淘宝/天猫：搜索页和浏览器渲染均未返回稳定商品价格，本轮不自动写入。",
    "",
    "## 汇总",
    "",
    `- 本轮待补价格词条：${totalMissing}`,
    `- 新增价格：${found.length}`,
    `- 仍未找到可靠价格：${missing.length}`,
    "",
    "## 新增价格",
    "",
    "| slug | 名称 | 价格 | 商品 | 来源 | 链接 |",
    "| --- | --- | --- | --- | --- | --- |",
    ...found.map(
      (item) =>
        `| ${markdownEscape(item.slug)} | ${markdownEscape(item.name)} | ${markdownEscape(item.priceText)} | ${markdownEscape(item.productTitle)} | ${item.sourceName} | ${item.sourceUrl || ""} |`,
    ),
    "",
    "## 仍未解析",
    "",
    "| slug | 名称 | 平台 | 说明 |",
    "| --- | --- | --- | --- |",
    ...missing.map(
      (item) =>
        `| ${markdownEscape(item.slug)} | ${markdownEscape(item.name)} | ${item.sourceName} | ${markdownEscape(item.note || "未匹配到可靠商品价格")} |`,
    ),
    "",
  ];
  return lines.join("\n");
}

async function main() {
  const db = getClient();
  const rows = await all<MissingPenRow>(
    db,
    `SELECT
       e.id as entity_id,
       e.slug,
       e.name,
       ms.id as spec_id,
       ms.price_range,
       group_concat(ea.alias, '|||') as aliases
     FROM entities e
     JOIN model_specs ms ON ms.entity_id = e.id
     LEFT JOIN entity_aliases ea ON ea.entity_id = e.id
     WHERE e.type = 'pen'
       AND (ms.price_range IS NULL OR ms.price_range NOT LIKE '%查询于 ${SNAPSHOT_DATE}%')
     GROUP BY e.id, e.slug, e.name, ms.id, ms.price_range
     ORDER BY e.slug`,
  );

  const results = await mapLimit(rows, 3, searchCyberbiz);
  let updates = 0;
  for (const result of results) {
    if (!result.priceText) continue;
    updates += 1;
    await run(
      db,
      "UPDATE model_specs SET price_range = ?, updated_at = datetime('now') WHERE id = ?",
      [result.priceText, rows.find((row) => row.slug === result.slug)?.spec_id],
    );
  }

  const report = buildReport(results, rows.length);
  if (WRITE && !USE_TURSO) {
    mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    writeFileSync(REPORT_PATH, report);
  }

  console.log(
    JSON.stringify(
      {
        mode: WRITE ? "write" : "dry-run",
        database: USE_TURSO ? "turso" : "local",
        snapshotDate: SNAPSHOT_DATE,
        checked: rows.length,
        found: results.filter((item) => item.priceText).length,
        missing: results.filter((item) => !item.priceText).length,
        updates,
        reportPath: WRITE && !USE_TURSO ? REPORT_PATH : null,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
