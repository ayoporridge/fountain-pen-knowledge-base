import { createClient, type Client, type InArgs } from "@libsql/client";
import { execFile } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const WRITE = process.argv.includes("--write");
const USE_TURSO = process.argv.includes("--turso");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : Number.POSITIVE_INFINITY;
const SNAPSHOT_DATE =
  process.env.PRICE_SNAPSHOT_DATE || new Date().toISOString().slice(0, 10);
const REPORT_PATH = path.join(
  process.cwd(),
  "docs/content",
  `price-domestic-search-${SNAPSHOT_DATE}.md`,
);
const CACHE_PATH = path.join(
  process.cwd(),
  "docs/content/.cache",
  `smzdm-search-${SNAPSHOT_DATE}.json`,
);

type MissingPenRow = {
  entity_id: string;
  slug: string;
  name: string;
  spec_id: string;
  price_range: string | null;
  aliases: string | null;
};

type SmzdmItem = {
  rank?: number;
  title?: string;
  price?: string;
  mall?: string;
  url?: string;
  comments?: number;
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

const DOMESTIC_PATTERN =
  /英雄|永生|金豪|弘典|坛笔|末匠|毕加索|白雪|晨光|书乐|依人|派利|大公|唐月|东吴|文采|金星|长江|逗万|意斯华|欧领|Admok|KACO|Kaco|Tramol|Wing\s*Sung|Hero|Jinhao|Hong\s*Dian|HongDian|PenBBS|Majohn|Moonman|Picasso|Snowhite|Delike|Campus|DongWu|ShuLe|YiRen|TangYue|Paili|JinXing|ZhangJiang/i;

const NON_FOUNTAIN_PEN_WORDS = [
  "原子笔",
  "圆珠笔",
  "宝珠笔",
  "中性笔",
  "签字笔芯",
  "钢笔尖",
  "筆尖",
  "笔尖",
  "通用笔尖",
  "替芯",
  "墨水",
  "墨囊",
  "墨胆",
  "笔袋",
  "笔盒",
  "铅笔",
  "自动铅笔",
  "钢珠笔",
  "ballpoint",
  "rollerball",
  "mechanical pencil",
  "ink bottle",
];

const BRAND_TOKENS = new Set([
  "admok",
  "campus",
  "delike",
  "dongwu",
  "hero",
  "hongdian",
  "jinhao",
  "jinxing",
  "kaco",
  "majohn",
  "moonman",
  "paili",
  "penbbs",
  "picasso",
  "shule",
  "snowhite",
  "tangyue",
  "tramol",
  "wingsung",
  "yiren",
  "zhangjiang",
]);

const WEAK_TOKENS = new Set([
  "pen",
  "pens",
  "fountain",
  "steel",
  "gold",
  "series",
  "classic",
  "black",
  "white",
  "silver",
  "ef",
  "f",
  "m",
  "14k",
  "18k",
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
        token.length >= 2 && !BRAND_TOKENS.has(token) && !WEAK_TOKENS.has(token),
    );
}

function chineseTokens(value: string) {
  const matches = value.match(/[\u4e00-\u9fff]{2,}/g) || [];
  return matches
    .map((item) => item.replace(/钢笔|金笔|系列|透明|学生|成人|练字|商务/g, ""))
    .filter((item) => item.length >= 2);
}

function chineseBrandFrom(row: MissingPenRow) {
  const haystack = `${row.slug} ${row.name} ${row.aliases || ""}`;
  const brands = [
    "末匠",
    "金豪",
    "弘典",
    "坛笔",
    "永生",
    "英雄",
    "文采",
    "毕加索",
    "白雪",
    "晨光",
    "书乐",
    "依人",
    "派利",
    "大公",
    "唐月",
    "东吴",
    "金星",
    "长江",
    "逗万",
    "意斯华",
    "欧领",
    "得力克",
    "三文堂",
    "派顿",
  ];
  return brands.find((brand) => haystack.includes(brand)) || null;
}

function modelCodeTokens(row: MissingPenRow) {
  const text = `${row.slug} ${row.name} ${row.aliases || ""}`;
  return uniqueStrings(
    Array.from(normalizeText(text).matchAll(/[a-z]?\d{1,4}[a-z]?/g), (match) => match[0]),
  ).filter((token) => !/^(14k|18k|21k|24k|585|750)$/i.test(token));
}

function chineseModelWords(row: MissingPenRow) {
  const brand = chineseBrandFrom(row);
  return uniqueStrings(
    chineseTokens(`${row.name} ${parseAliases(row.aliases).join(" ")}`)
      .map((token) => (brand ? token.replace(brand, "") : token))
      .map((token) =>
        token.replace(/钢笔|金笔|系列|透明|学生|成人|练字|商务|钛合金|负压上墨/g, ""),
      )
      .filter((token) => token.length >= 2),
  );
}

function modelTokens(row: MissingPenRow) {
  return uniqueStrings([
    ...romanTokens(row.name),
    ...romanTokens(row.slug),
    ...parseAliases(row.aliases).flatMap(romanTokens),
    ...chineseTokens(row.name),
    ...parseAliases(row.aliases).flatMap(chineseTokens),
  ]).filter((token) => token.length >= 2);
}

function slugQuery(slug: string) {
  return slug.replace(/-/g, " ").replace(/\s+/g, " ").trim();
}

function queryCandidates(row: MissingPenRow) {
  const aliases = parseAliases(row.aliases);
  const brand = chineseBrandFrom(row);
  const codes = modelCodeTokens(row);
  const words = chineseModelWords(row);
  const chineseAlias = aliases.find((alias) => /[\u4e00-\u9fff]/.test(alias));
  const chineseQueries = [
    brand && codes[0] ? `${brand} ${codes[0]} 钢笔` : "",
    brand && words[0] ? `${brand} ${words[0]} 钢笔` : "",
    chineseAlias ? `${chineseAlias} 钢笔` : "",
    !brand && /[\u4e00-\u9fff]/.test(row.name) ? `${row.name} 钢笔` : "",
  ];
  return uniqueStrings(chineseQueries).slice(0, 2);
}

function hasDomesticSignal(row: MissingPenRow) {
  return DOMESTIC_PATTERN.test(`${row.slug} ${row.name} ${row.aliases || ""}`);
}

function hasFountainPenSignal(title: string) {
  const lower = title.toLowerCase();
  if (NON_FOUNTAIN_PEN_WORDS.some((word) => lower.includes(word))) return false;
  return /钢笔|鋼筆|fountain pen/i.test(title);
}

function titleHasToken(title: string, token: string) {
  if (/^[a-z0-9]+$/i.test(token)) {
    return new Set(Array.from(normalizeText(title).matchAll(/[a-z0-9]+/g), (m) => m[0])).has(
      token.toLowerCase(),
    );
  }
  return title.includes(token);
}

function relevanceScore(row: MissingPenRow, item: SmzdmItem) {
  const title = item.title || "";
  if (!hasFountainPenSignal(title)) return -100;
  const tokens = modelTokens(row);
  if (tokens.length === 0) return -30;
  const numericTokens = tokens.filter((token) => /^[a-z]?\d{1,4}[a-z]?$/.test(token));
  for (const token of numericTokens) {
    if (!titleHasToken(title, token)) return -70;
  }

  const required = numericTokens.length ? numericTokens.slice(0, 2) : tokens.slice(0, 2);
  for (const token of required) {
    if (!titleHasToken(title, token)) return -50;
  }

  let score = 0;
  for (const token of tokens) {
    if (titleHasToken(title, token)) score += /^[a-z]?\d{1,4}[a-z]?$/i.test(token) ? 16 : 8;
  }
  if (/天猫|淘宝|淘宝精选|天猫精选/.test(item.mall || "")) score += 12;
  if (/京东/.test(item.mall || "")) score += 8;
  if (/wiki\.smzdm\.com/.test(item.url || "")) score += 5;
  if (/过期/.test(item.price || "")) score -= 30;
  if (/朝代|纪念|限量|限定|联名/.test(title)) score -= 18;
  if (/\d+\s*支装|套装|礼盒/.test(title)) score -= 8;
  return score;
}

function priceNumber(raw: string | undefined) {
  const price = normalizePrice(raw);
  if (!price) return Number.POSITIVE_INFINITY;
  const numeric = Number(price.replace(/[¥起]/g, ""));
  return Number.isFinite(numeric) ? numeric : Number.POSITIVE_INFINITY;
}

function parseJsonArray(stdout: string) {
  const start = stdout.indexOf("[");
  const end = stdout.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return [];
  try {
    return JSON.parse(stdout.slice(start, end + 1)) as SmzdmItem[];
  } catch {
    return [];
  }
}

function loadCache() {
  if (!existsSync(CACHE_PATH)) return new Map<string, SmzdmItem[]>();
  const raw = JSON.parse(readFileSync(CACHE_PATH, "utf8")) as Record<string, SmzdmItem[]>;
  return new Map(Object.entries(raw));
}

function saveCache(cache: Map<string, SmzdmItem[]>) {
  mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(Object.fromEntries(cache), null, 2));
}

async function searchSmzdm(query: string, cache: Map<string, SmzdmItem[]>) {
  if (cache.has(query)) return cache.get(query) || [];
  try {
    const { stdout } = await execFileAsync(
      "opencli",
      ["smzdm", "search", query, "--limit", "8", "-f", "json"],
      {
        timeout: 45_000,
        maxBuffer: 1024 * 1024,
      },
    );
    const items = parseJsonArray(stdout);
    cache.set(query, items);
    saveCache(cache);
    return items;
  } catch (error) {
    cache.set(query, []);
    saveCache(cache);
    return [];
  }
}

function normalizePrice(raw: string | undefined) {
  if (!raw) return null;
  if (/过期/.test(raw)) return null;
  const match = raw.match(/[￥¥]?\s*(\d+(?:\.\d+)?)(?:\s*-\s*\d+(?:\.\d+)?)?\s*(?:元|起)?/);
  if (!match) return null;
  const suffix = /起/.test(raw) ? "起" : "";
  return `¥${match[1]}${suffix}`;
}

function sourceLabel(item: SmzdmItem) {
  const mall = (item.mall || "").trim();
  if (mall) return `${mall} via 什么值得买`;
  if (/wiki\.smzdm\.com/.test(item.url || "")) return "什么值得买商品百科";
  return "什么值得买";
}

async function searchDomesticPrice(
  row: MissingPenRow,
  cache: Map<string, SmzdmItem[]>,
): Promise<PlatformResult> {
  const attempts: string[] = [];
  const candidates: Array<{ item: SmzdmItem; score: number; query: string }> = [];
  for (const query of queryCandidates(row)) {
    attempts.push(query);
    const items = await searchSmzdm(query, cache);
    for (const item of items) {
      const price = normalizePrice(item.price);
      if (!price) continue;
      const score = relevanceScore(row, item);
      if (score >= 18) candidates.push({ item, score, query });
    }
    if (candidates.some(({ score }) => score >= 36)) break;
  }

  candidates.sort(
    (a, b) =>
      b.score - a.score ||
      priceNumber(a.item.price) - priceNumber(b.item.price) ||
      (a.item.rank || 999) - (b.item.rank || 999),
  );
  const winner = candidates[0]?.item;
  const price = normalizePrice(winner?.price);
  if (winner && price) {
    const source = sourceLabel(winner);
    return {
      slug: row.slug,
      name: row.name,
      priceText: `${price}（${source}，查询于 ${SNAPSHOT_DATE}）`,
      sourceName: source,
      sourceUrl: winner.url || null,
      productTitle: winner.title || null,
      method: "opencli-smzdm-search",
    };
  }

  return {
    slug: row.slug,
    name: row.name,
    priceText: null,
    sourceName: "什么值得买",
    sourceUrl: null,
    productTitle: null,
    method: "opencli-smzdm-search",
    note: attempts.length ? `未匹配到明确同型号价格；查询：${attempts.join(" / ")}` : "无查询词",
  };
}

function markdownEscape(value: string | null | undefined) {
  return String(value || "").replace(/\|/g, "/").replace(/\n/g, " ");
}

function buildReport(results: PlatformResult[], totalMissing: number) {
  const found = results.filter((item) => item.priceText);
  const missing = results.filter((item) => !item.priceText);
  const lines = [
    `# 国产笔价格补搜 ${SNAPSHOT_DATE}`,
    "",
    `生成时间：${new Date().toISOString()}`,
    "",
    "## 平台可用性",
    "",
    "- 淘宝：opencli taobao search 需要已登录淘宝会话；当前共享浏览器未登录，不能直接批量读取。",
    "- 1688：opencli 1688 search 需要登录/验证；当前未作为写入来源。",
    "- 什么值得买：公开搜索可读取商品标题、价格、商城和链接；本轮用于国产笔价格兜底，优先保留天猫/淘宝，其次京东和商品百科。",
    "",
    "## 汇总",
    "",
    `- 本轮国产缺价词条：${totalMissing}`,
    `- 新增价格：${found.length}`,
    `- 仍未找到可靠价格：${missing.length}`,
    "",
    "## 新增价格",
    "",
    "| slug | 名称 | 价格 | 商品 | 来源 | 链接 |",
    "| --- | --- | --- | --- | --- | --- |",
    ...found.map(
      (item) =>
        `| ${markdownEscape(item.slug)} | ${markdownEscape(item.name)} | ${markdownEscape(item.priceText)} | ${markdownEscape(item.productTitle)} | ${markdownEscape(item.sourceName)} | ${item.sourceUrl || ""} |`,
    ),
    "",
    "## 仍未解析",
    "",
    "| slug | 名称 | 平台 | 说明 |",
    "| --- | --- | --- | --- |",
    ...missing.map(
      (item) =>
        `| ${markdownEscape(item.slug)} | ${markdownEscape(item.name)} | ${markdownEscape(item.sourceName)} | ${markdownEscape(item.note || "未匹配到可靠商品价格")} |`,
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
  const targetRows = rows.filter(hasDomesticSignal).slice(0, LIMIT);
  const cache = loadCache();
  const results: PlatformResult[] = [];
  for (const row of targetRows) {
    results.push(await searchDomesticPrice(row, cache));
  }

  let updates = 0;
  for (const result of results) {
    if (!result.priceText) continue;
    updates += 1;
    await run(
      db,
      "UPDATE model_specs SET price_range = ?, updated_at = datetime('now') WHERE id = ?",
      [result.priceText, targetRows.find((row) => row.slug === result.slug)?.spec_id],
    );
  }

  const report = buildReport(results, targetRows.length);
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
        checked: targetRows.length,
        found: results.filter((item) => item.priceText).length,
        missing: results.filter((item) => !item.priceText).length,
        updates,
        reportPath: WRITE && !USE_TURSO ? REPORT_PATH : null,
        cachePath: CACHE_PATH,
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
