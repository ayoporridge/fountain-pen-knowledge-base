import { createClient, type Client, type InArgs } from "@libsql/client";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const USE_TURSO = process.argv.includes("--turso");
const REPORT_ONLY = process.argv.includes("--report-only");
const SLOW = process.argv.includes("--slow");
const SNAPSHOT_DATE =
  process.env.PRICE_SNAPSHOT_DATE || new Date().toISOString().slice(0, 10);
const SLOW_DELAY_MS = Number(process.env.PRICE_SNAPSHOT_DELAY_MS || "1800");
const REPORT_PATH = path.join(
  process.cwd(),
  "docs/content",
  `price-snapshot-${SNAPSHOT_DATE}.md`,
);

type PriceSourceRow = {
  entity_id: string;
  slug: string;
  name: string;
  spec_id: string;
  price_range: string | null;
  source_name: string | null;
  source_type: string | null;
  title: string | null;
  url: string | null;
};

type PriceResult = {
  slug: string;
  name: string;
  priceText: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  method: string | null;
  error?: string;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  CAD: "CA$",
  AUD: "A$",
  BDT: "BDT ",
  GBP: "£",
  EUR: "€",
  PHP: "₱",
  CNY: "¥",
  JPY: "¥",
  HKD: "HK$",
  INR: "₹",
  SGD: "S$",
  TWD: "NT$",
};

const PRICE_RE =
  /(?:US\$|CA\$|A\$|HK\$|S\$|NT\$|BDT\s*|৳|₱|\$|£|€|¥|￥|₹|Rs\.?)\s*[0-9][0-9,]*(?:\.[0-9]{1,2})?/g;

const RETAILER_PRIORITY = [
  /goldspot/i,
  /goulet/i,
  /cult pens/i,
  /pensachi/i,
  /pen boutique/i,
  /endlesspens/i,
  /amazon/i,
  /jetpens/i,
  /truphae/i,
  /makoba/i,
  /ttpen/i,
  /peyton street/i,
];

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
  if (!WRITE || REPORT_ONLY) return;
  await db.execute({ sql, args: args as InArgs });
}

function formatPrice(rawPrice: string | number, currency?: string | null) {
  const amount = String(rawPrice).trim().replace(/,/g, "");
  if (!amount || !/^[0-9]+(?:\.[0-9]+)?$/.test(amount)) return null;
  const symbol = currency ? CURRENCY_SYMBOLS[currency.toUpperCase()] : "";
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  const formatted = numeric.toLocaleString("en-US", {
    minimumFractionDigits: amount.includes(".") ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${symbol || ""}${formatted}`.trim();
}

function normalizeSymbolPrice(value: string) {
  const text = value
    .replace(/￥/g, "¥")
    .replace(/^Rs\.?\s*/i, "₹")
    .replace(/^৳\s*/i, "BDT ")
    .replace(/^₱\s*/i, "₱")
    .replace(/\s+/g, "");
  const amount = Number(
    text
      .replace(/^(?:US\$|CA\$|A\$|HK\$|S\$|NT\$|BDT|₱|\$|£|€|¥|₹)/, "")
      .replace(/,/g, ""),
  );
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (amount < 3) return null;
  return text;
}

function defaultCurrencyForSource(
  sourceName: string | null,
  url: string | null,
) {
  const target = `${sourceName || ""} ${url || ""}`.toLowerCase();
  if (target.includes("juspirit")) return "NT$";
  if (target.includes("tsamsa") || target.includes("daraz.com.bd")) {
    return "BDT ";
  }
  if (
    target.includes("amazon.in") ||
    target.includes("fountain pen india") ||
    target.includes("makoba") ||
    target.includes("swastikpenn")
  ) {
    return "₹";
  }
  if (target.includes("amazon.de") || target.includes("amazon.es")) return "€";
  if (target.includes("amazon.com")) return "$";
  if (target.includes("everythingcalligraphy")) return "₱";
  if (target.includes("jd.com")) return "¥";
  return null;
}

function withFallbackCurrency(
  price: string,
  sourceName: string | null,
  url: string | null,
) {
  if (/^(?:US\$|CA\$|A\$|HK\$|S\$|NT\$|BDT|৳|₱|\$|£|€|¥|₹)/.test(price)) {
    return price.replace(/^৳/, "BDT ");
  }
  const fallback = defaultCurrencyForSource(sourceName, url);
  return fallback ? `${fallback}${price}` : price;
}

function getRetailerRank(sourceName: string | null, url: string | null) {
  const target = `${sourceName || ""} ${url || ""}`;
  const index = RETAILER_PRIORITY.findIndex((pattern) => pattern.test(target));
  return index === -1 ? RETAILER_PRIORITY.length : index;
}

function chooseSources(rows: PriceSourceRow[]) {
  const bySlug = new Map<string, PriceSourceRow[]>();
  for (const row of rows) {
    if (!bySlug.has(row.slug)) bySlug.set(row.slug, []);
    bySlug.get(row.slug)?.push(row);
  }

  return [...bySlug.entries()].map(([slug, items]) => ({
    slug,
    name: items[0].name,
    specId: items[0].spec_id,
    priceRange: items[0].price_range,
    sources: items
      .filter((item) => item.url)
      .sort(
        (a, b) =>
          getRetailerRank(a.source_name, a.url) -
            getRetailerRank(b.source_name, b.url) ||
          String(a.title || "").localeCompare(String(b.title || "")),
      ),
  }));
}

function findPriceInText(value: string | null | undefined) {
  if (!value) return null;
  const matches = value.match(PRICE_RE) || [];
  for (const match of matches) {
    const price = normalizeSymbolPrice(match);
    if (price) return price;
  }
  return null;
}

function extractMetaPrice(html: string) {
  const amountMatch = html.match(
    /<meta[^>]+(?:property|name)=["'](?:product:price:amount|og:price:amount|twitter:data1)["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  );
  const currencyMatch = html.match(
    /<meta[^>]+(?:property|name)=["'](?:product:price:currency|og:price:currency)["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  );
  if (!amountMatch) return null;
  return formatPrice(amountMatch[1], currencyMatch?.[1]) || null;
}

function walkJson(value: unknown, prices: string[]) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) walkJson(item, prices);
    return;
  }

  const record = value as Record<string, unknown>;
  const offers = record.offers;
  if (offers) walkJson(offers, prices);

  const price = record.price ?? record.lowPrice ?? record.highPrice;
  const currency =
    typeof record.priceCurrency === "string" ? record.priceCurrency : null;
  if (typeof price === "string" || typeof price === "number") {
    const formatted = formatPrice(price, currency);
    if (formatted) prices.push(formatted);
  }

  for (const item of Object.values(record)) {
    if (item && typeof item === "object") walkJson(item, prices);
  }
}

function extractJsonLdPrice(html: string) {
  const scripts = [
    ...html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].map((match) => match[1].trim());
  const prices: string[] = [];
  for (const script of scripts) {
    try {
      walkJson(JSON.parse(script), prices);
    } catch {
      // Some stores emit invalid JSON-LD; ignore and fall back to meta/text.
    }
  }
  return prices.find((price) => findPriceInText(price)) || null;
}

function extractEmbeddedPrice(html: string) {
  const snippets = [
    /"price"\s*:\s*"?([0-9][0-9,.]*)"?/i,
    /"amount"\s*:\s*"?([0-9][0-9,.]*)"?/i,
  ];
  for (const pattern of snippets) {
    const match = html.match(pattern);
    if (match) {
      const context = html.slice(
        Math.max(0, (match.index || 0) - 160),
        (match.index || 0) + 240,
      );
      const currency =
        context.match(/"priceCurrency"\s*:\s*"([A-Z]{3})"/i)?.[1] ||
        context.match(/"currency"\s*:\s*"([A-Z]{3})"/i)?.[1] ||
        null;
      const price = formatPrice(match[1], currency);
      if (price) return price;
    }
  }
  return null;
}

function extractVisiblePrice(html: string) {
  const matches = html.match(PRICE_RE) || [];
  const candidates = matches
    .map((match) => normalizeSymbolPrice(match))
    .filter((item): item is string => Boolean(item));
  if (candidates.length === 0) return null;

  const scored = candidates
    .map((price) => {
      const amount = Number(
        price
          .replace(/^(?:US\$|CA\$|A\$|HK\$|S\$|\$|£|€|¥)/, "")
          .replace(/,/g, ""),
      );
      return { price, amount };
    })
    .filter(({ amount }) => amount >= 3)
    .sort((a, b) => {
      const aLikelyProduct = a.amount >= 10 && a.amount <= 10000 ? 0 : 1;
      const bLikelyProduct = b.amount >= 10 && b.amount <= 10000 ? 0 : 1;
      return aLikelyProduct - bLikelyProduct || b.amount - a.amount;
    });
  return scored[0]?.price || null;
}

function extractPrice(html: string) {
  const jsonLd = extractJsonLdPrice(html);
  if (jsonLd) return { price: jsonLd, method: "json-ld" };
  const meta = extractMetaPrice(html);
  if (meta) return { price: meta, method: "meta" };
  const visible = extractVisiblePrice(html);
  if (visible) return { price: visible, method: "visible-text" };
  return null;
}

function isAcceptablePriceMethod(
  method: string,
  source: Pick<PriceSourceRow, "source_name" | "url">,
) {
  const url = String(source.url || "");
  if (/\/(?:collections|blogs)\//i.test(url)) return false;
  if (method === "visible-text" && /amazon\./i.test(url)) return false;
  return method !== "embedded-json";
}

let lastSlowFetchAt = 0;

async function waitForSlowFetchSlot() {
  if (!SLOW) return;
  const elapsed = Date.now() - lastSlowFetchAt;
  if (elapsed < SLOW_DELAY_MS) {
    await new Promise((resolve) => setTimeout(resolve, SLOW_DELAY_MS - elapsed));
  }
  lastSlowFetchAt = Date.now();
}

async function fetchHtml(url: string) {
  await waitForSlowFetchSlot();
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
        "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
      },
    });
    const html = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return html;
  } finally {
    clearTimeout(timeout);
  }
}

async function resolvePriceForPen(item: ReturnType<typeof chooseSources>[number]) {
  for (const source of item.sources.slice(0, 3)) {
    try {
      const html = await fetchHtml(String(source.url));
      const price = extractPrice(html);
      if (price && isAcceptablePriceMethod(price.method, source)) {
        return {
          slug: item.slug,
          name: item.name,
          priceText: price.price,
          sourceName: source.source_name,
          sourceUrl: source.url,
          method: price.method,
        } satisfies PriceResult;
      }
    } catch (error) {
      if (item.sources.length === 1) {
        return {
          slug: item.slug,
          name: item.name,
          priceText: null,
          sourceName: source.source_name,
          sourceUrl: source.url,
          method: null,
          error: error instanceof Error ? error.message : String(error),
        } satisfies PriceResult;
      }
    }
  }

  return {
    slug: item.slug,
    name: item.name,
    priceText: null,
    sourceName: item.sources[0]?.source_name || null,
    sourceUrl: item.sources[0]?.url || null,
    method: null,
  } satisfies PriceResult;
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

function snapshotText(result: PriceResult) {
  if (!result.priceText || !result.sourceName) return null;
  const price = withFallbackCurrency(
    result.priceText,
    result.sourceName,
    result.sourceUrl,
  );
  return `${price}（${result.sourceName}，查询于 ${SNAPSHOT_DATE}）`;
}

function markdownEscape(value: string | null) {
  return String(value || "").replace(/\|/g, "/");
}

function buildReport(results: PriceResult[], noRetailer: PriceSourceRow[]) {
  const found = results.filter((result) => result.priceText);
  const missing = results.filter((result) => !result.priceText);
  const lines = [
    `# 价格快照 ${SNAPSHOT_DATE}`,
    "",
    `生成时间：${new Date().toISOString()}`,
    "",
    "## 汇总",
    "",
    `- 已找到价格：${found.length}`,
    `- 有零售来源但未解析价格：${missing.length}`,
    `- 暂无零售来源：${noRetailer.length}`,
    "",
    "## 已写入价格",
    "",
    "| slug | 名称 | 价格 | 来源 | 方法 | 链接 |",
    "| --- | --- | --- | --- | --- | --- |",
    ...found.map(
      (result) =>
        `| ${markdownEscape(result.slug)} | ${markdownEscape(result.name)} | ${markdownEscape(snapshotText(result))} | ${markdownEscape(result.sourceName)} | ${markdownEscape(result.method)} | ${result.sourceUrl || ""} |`,
    ),
    "",
    "## 未解析价格",
    "",
    "| slug | 名称 | 来源 | 链接 | 说明 |",
    "| --- | --- | --- | --- | --- |",
    ...missing.map(
      (result) =>
        `| ${markdownEscape(result.slug)} | ${markdownEscape(result.name)} | ${markdownEscape(result.sourceName)} | ${result.sourceUrl || ""} | ${markdownEscape(result.error || "未在页面中解析到明确价格")} |`,
    ),
    "",
    "## 暂无零售来源",
    "",
    "| slug | 名称 |",
    "| --- | --- |",
    ...noRetailer.map(
      (row) => `| ${markdownEscape(row.slug)} | ${markdownEscape(row.name)} |`,
    ),
    "",
  ];
  return lines.join("\n");
}

async function main() {
  const db = getClient();
  const rows = await all<PriceSourceRow>(
    db,
    `SELECT
       e.id as entity_id,
       e.slug,
       e.name,
       ms.id as spec_id,
       ms.price_range,
       sr.name as source_name,
       sr.source_type,
       si.title,
       si.url
     FROM entities e
     JOIN model_specs ms ON ms.entity_id = e.id
     LEFT JOIN entity_references er ON er.entity_id = e.id
     LEFT JOIN source_items si ON si.id = er.source_item_id
     LEFT JOIN source_registry sr ON sr.id = si.source_id
     WHERE e.type = 'pen'
     ORDER BY e.slug, sr.source_type, si.title`,
  );

  const retailerRows = rows.filter(
    (row) => row.source_type === "retailer" && row.url,
  );
  const retailerSlugs = new Set(retailerRows.map((row) => row.slug));
  const noRetailer = rows
    .filter((row) => !retailerSlugs.has(row.slug))
    .filter(
      (row, index, arr) =>
        arr.findIndex((item) => item.slug === row.slug) === index,
    );
  const sourceGroups = chooseSources(retailerRows);
  const results = await mapLimit(sourceGroups, SLOW ? 1 : 5, resolvePriceForPen);

  let updates = 0;
  for (const group of sourceGroups) {
    const result = results.find((item) => item.slug === group.slug);
    const text = result ? snapshotText(result) : null;
    if (text) {
      updates += 1;
      await run(db, "UPDATE model_specs SET price_range = ?, updated_at = datetime('now') WHERE id = ?", [
        text,
        group.specId,
      ]);
    } else if (group.priceRange?.includes("查询于")) {
      updates += 1;
      await run(db, "UPDATE model_specs SET price_range = NULL, updated_at = datetime('now') WHERE id = ?", [
        group.specId,
      ]);
    }
  }

  const report = buildReport(results, noRetailer);
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
        slow: SLOW,
        retailerPens: sourceGroups.length,
        foundPrices: results.filter((result) => result.priceText).length,
        missingRetailerPrices: results.filter((result) => !result.priceText)
          .length,
        noRetailer: noRetailer.length,
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
