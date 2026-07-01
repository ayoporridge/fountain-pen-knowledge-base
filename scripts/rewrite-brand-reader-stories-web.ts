import { createClient, type Client, type InArgs } from "@libsql/client";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const USE_TURSO = process.argv.includes("--turso");
const REFRESH_WEB = process.argv.includes("--refresh-web");
const TODAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
}).format(new Date());

const CACHE_PATH = path.join(
  process.cwd(),
  "docs/content/.cache",
  `brand-web-research-${TODAY}.json`,
);
const REPORT_PATH = path.join(
  process.cwd(),
  "docs/content",
  `brand-reader-stories-web-${TODAY}.md`,
);

const HIDDEN_BRAND_SLUGS = new Set(["banju", "saier", "shanghai", "yongxu"]);

type Row = Record<string, unknown>;

type BrandRow = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
};

type StoryRow = {
  id: string;
  title: string;
  summary: string | null;
  body_md: string;
  source_notes: string | null;
};

type ModelRow = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  nib: string | null;
  fill_system: string | null;
  material: string | null;
  price_range: string | null;
  release_year: string | null;
};

type SourceRow = {
  source_name: string;
  source_type: string;
  title: string;
  url: string;
  summary: string | null;
};

type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

type BrandSearchPack = {
  slug: string;
  name: string;
  queries: string[];
  results: SearchResult[];
};

type BrandCopy = {
  title: string;
  summary: string;
  body: string;
};

function loadEnv() {
  if (!USE_TURSO || !existsSync(".env.local")) return;
  const text = readFileSync(".env.local", "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function createDb() {
  loadEnv();
  if (USE_TURSO) {
    if (!process.env.TURSO_DATABASE_URL) {
      throw new Error("--turso requires TURSO_DATABASE_URL in .env.local");
    }
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: "file:data/fpkg.db" });
}

async function all<T extends Row>(
  db: Client,
  sql: string,
  args: unknown[] = [],
) {
  const result = await db.execute({ sql, args: args as InArgs });
  return result.rows as T[];
}

async function one<T extends Row>(
  db: Client,
  sql: string,
  args: unknown[] = [],
) {
  return (await all<T>(db, sql, args))[0];
}

async function run(db: Client, sql: string, args: unknown[] = []) {
  if (!WRITE) return;
  await db.execute({ sql, args: args as InArgs });
}

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeDuckUrl(raw: string) {
  const cleaned = raw.replace(/&amp;/g, "&");
  try {
    const url = new URL(cleaned.startsWith("//") ? `https:${cleaned}` : cleaned);
    const uddg = url.searchParams.get("uddg");
    return uddg ? decodeURIComponent(uddg) : cleaned;
  } catch {
    return cleaned;
  }
}

async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0",
    },
  });
  if (!res.ok) return [];
  const html = await res.text();
  const results: SearchResult[] = [];
  const linkRe = /class="result__a" href="([^"]+)">([\s\S]*?)<\/a>/g;
  for (const match of html.matchAll(linkRe)) {
    const block = html.slice(match.index || 0, (match.index || 0) + 2200);
    const snippet =
      block.match(/class="result__snippet">([\s\S]*?)<\/a>/)?.[1] ||
      block.match(/class="result__snippet">([\s\S]*?)<\/div>/)?.[1] ||
      "";
    results.push({
      title: decodeHtml(match[2] || ""),
      url: decodeDuckUrl(match[1] || ""),
      snippet: decodeHtml(snippet),
    });
  }
  return results
    .filter((item) => item.title && item.url)
    .filter((item, index, arr) => arr.findIndex((x) => x.url === item.url) === index);
}

function brandQueryName(brand: BrandRow) {
  return brand.name.replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
}

function buildQueries(brand: BrandRow, models: ModelRow[]) {
  const name = brandQueryName(brand);
  const modelName = models[0]?.name || "";
  const queries = [
    `${name} fountain pen brand history official`,
    `${name} 钢笔 品牌 历史 代表型号`,
  ];
  if (modelName) {
    queries.push(`${modelName} 钢笔 评测 特点`);
  }
  return queries;
}

function sourceScore(result: SearchResult) {
  const text = `${result.title} ${result.url}`.toLowerCase();
  let score = 0;
  if (/official|官网|about|history|heritage|company/.test(text)) score += 40;
  if (/wikipedia|wikidata/.test(text)) score += 35;
  if (
    /richardspens|penhero|parkercollector|penography|fountainpennetwork|penaddict|gentlemanstationer|wellappointeddesk|frankunderwater|narratess/.test(
      text,
    )
  ) {
    score += 28;
  }
  if (/cultpens|goulet|jetpens|goldspot|penexchange|pensachi/.test(text)) {
    score += 15;
  }
  if (/bilibili|youtube|reddit|aliexpress|amazon|taobao/.test(text)) score -= 8;
  return score;
}

async function getSearchPacks(db: Client, brands: BrandRow[]) {
  if (!REFRESH_WEB && existsSync(CACHE_PATH)) {
    return JSON.parse(readFileSync(CACHE_PATH, "utf8")) as BrandSearchPack[];
  }

  const packs: BrandSearchPack[] = [];
  for (const brand of brands) {
    const models = await getBrandModels(db, brand.id);
    const queries = buildQueries(brand, models);
    const seen = new Set<string>();
    const results: SearchResult[] = [];
    for (const query of queries) {
      const found = await searchDuckDuckGo(query);
      for (const item of found) {
        if (seen.has(item.url)) continue;
        seen.add(item.url);
        results.push(item);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    results.sort((a, b) => sourceScore(b) - sourceScore(a));
    packs.push({
      slug: brand.slug,
      name: brand.name,
      queries,
      results: results.slice(0, 8),
    });
    console.log(`searched ${brand.slug}: ${results.length} results`);
  }

  mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(packs, null, 2));
  return packs;
}

function cleanText(value: string | null | undefined) {
  return String(value || "")
    .replace(/\*\*/g, "")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "")
    .replace(/（官方[^）]*口径）/g, "")
    .replace(/官方[^，；。]*口径/g, "")
    .replace(/官方商品页常列/g, "常见")
    .replace(/官方商品页列/g, "常见")
    .replace(/公开资料提到\s*/g, "")
    .replace(/[A-Za-z0-9 &./'-]+页面写的是\s*/g, "")
    .replace(/这个页面把/g, "这个组合把")
    .replace(/当前 [A-Za-z0-9 ]+ 页/g, "")
    .replace(/需以[^；。]*复核/g, "")
    .replace(/需[^；。]*核验/g, "")
    .replace(/需逐单品确认/g, "")
    .replace(/按具体版本确认/g, "随具体版本变化")
    .replace(
      /Hero 329 Fountain Pen Gold Arrow Pattern 3-pack，说明它常以低价套装形式出现/g,
      "Hero 329 常以低价套装形式出现",
    )
    .replace(/vintage\s*\d*/gi, "")
    .replace(/vintage 材质细节/gi, "")
    .replace(/线索/g, "")
    .replace(/语境/g, "")
    .replace(/具体 SKU/g, "具体版本")
    .replace(/（[，,；;\s]+/g, "（")
    .replace(/[，,；;\s]+）/g, "）")
    .replace(/（\s*）/g, "")
    .replace(/；\s*；/g, "；")
    .replace(/；\s*随版本变化。?$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sentence(value: string | null | undefined, max = 120) {
  const text = cleanText(value);
  if (!text) return "";
  const match = text.match(/^(.{8,180}?[。！？!?])\s*/);
  return (match ? match[1] : text.slice(0, max))
    .replace(/[。！？!?]+$/, "")
    .trim();
}

function displayModelName(name: string) {
  return name
    .replace(/^凌美 LAMY LAMY /, "LAMY ")
    .replace(/^凌美 LAMY /, "LAMY ")
    .replace(/^百乐 Pilot /, "Pilot ")
    .replace(/^白金 Platinum /, "Platinum ")
    .replace(/^写乐 Sailor /, "Sailor ")
    .replace(/^百利金 Pelikan /, "Pelikan ")
    .replace(/^派克 Parker /, "Parker ")
    .replace(/^万宝龙 Montblanc /, "Montblanc ")
    .replace(/^三文堂 TWSBI /, "TWSBI ")
    .replace(/^金豪 Jinhao /, "Jinhao ")
    .replace(/^弘典 HongDian /, "HongDian ")
    .trim();
}

function modelIdentityKey(name: string) {
  return displayModelName(name)
    .toLowerCase()
    .replace(/百乐|pilot|凌美|lamy|白金|platinum|写乐|sailor|派克|parker|百利金|pelikan|万宝龙|montblanc/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");
}

const MODEL_PRIORITIES: Record<string, string[]> = {
  lamy: ["2000", "Safari", "Al-Star", "Studio", "Dialog"],
  pilot: ["Custom 823", "Custom 74", "Capless", "845", "743", "742"],
  platinum: ["3776", "Izumo", "President", "Curidas", "小流星"],
  sailor: ["Pro Gear", "1911", "King of Pen", "笔王", "长刀研"],
  parker: ["Parker 51", "Duofold", "Vacumatic", "75", "21"],
  montblanc: ["149", "146", "Meisterstück", "Writers", "Patron"],
  pelikan: ["M800", "M1000", "M400", "M600"],
  kaweco: ["Sport", "AL Sport", "Liliput", "Student"],
  twsbi: ["ECO", "580", "VAC700", "Diamond", "GO"],
  hero: ["Hero 100", "616", "329", "1997"],
  wingsung: ["601", "601A", "698", "699", "3013"],
  majohn: ["A1", "M2", "P136", "Q1", "V1"],
  jinhao: ["82", "X159", "世纪", "100", "80"],
  hongdian: ["黑森林", "N6", "M2", "T1", "秦"],
  conklin: ["Nozac", "Glider", "Crescent"],
  eversharp: ["Skyline", "Doric", "Symphony", "Coronet"],
  waterman: ["52", "Patrician", "Carène", "C/F", "Expert"],
  sheaffer: ["Snorkel", "PFM", "Touchdown", "Targa", "Imperial"],
};

function sortModels(brand: BrandRow, models: ModelRow[]) {
  const priorities = MODEL_PRIORITIES[brand.slug] || [];
  const deduped: ModelRow[] = [];
  const seen = new Set<string>();
  for (const model of models) {
    if (isPseudoModel(model)) continue;
    const key = modelIdentityKey(model.name);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(model);
  }
  return deduped.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aIndex = priorities.findIndex((term) =>
      aName.includes(term.toLowerCase()),
    );
    const bIndex = priorities.findIndex((term) =>
      bName.includes(term.toLowerCase()),
    );
    const aScore = aIndex === -1 ? 999 : aIndex;
    const bScore = bIndex === -1 ? 999 : bIndex;
    return aScore - bScore || a.name.localeCompare(b.name);
  });
}

function isPseudoModel(model: ModelRow) {
  const text = `${model.name} ${model.summary || ""} ${model.nib || ""} ${model.fill_system || ""} ${model.material || ""}`;
  return (
    /更像品牌入口|不是单一型号|具体型号\/|分开阅读/.test(text) ||
    /[—-]\s*$/.test(model.name.trim())
  );
}

function sourceFact(brand: BrandRow, sources: SourceRow[], pack?: BrandSearchPack) {
  const text = [
    ...sources.map((source) => source.summary || ""),
    ...(pack?.results || []).slice(0, 3).map((result) => result.snippet),
  ].join(" ");

  if (/1999 brand origin|Founded in 1999/i.test(text)) {
    return `${brand.name} 的品牌起点可以追到 1999 年，定位更接近现代、价格相对友好的书写工具。`;
  }
  if (/Shanghai G\. Crown|1992 establishment|G\. Crown/i.test(text)) {
    return `${brand.name} 和上海 G. Crown Fountain Pen Co., Ltd.、海外分销渠道有联系，是中国出口钢笔市场里常见的名字。`;
  }
  if (/Graph-O-Matic|ink-making fountain pen|wartime ink-making pen/i.test(text)) {
    return `${brand.name} 最有辨识度的故事，是 Graph-O-Matic 这类带有制墨/储墨话题的战时钢笔。`;
  }
  if (/1918/.test(text) && /Pilot|Namiki/i.test(`${brand.name} ${text}`)) {
    return `${brand.name} 的现代公司历史可以追到 1918 年前后，后来的 Custom、Capless 和 Namiki 工艺线都从这条制造体系里生长出来。`;
  }
  if (/1929/.test(text) && /Pelikan/i.test(`${brand.name} ${text}`)) {
    return `${brand.name} 的钢笔声誉和 1929 年以来的活塞上墨传统关系很深。`;
  }
  if (/1906|Meisterst/i.test(text) && /Montblanc/i.test(`${brand.name} ${text}`)) {
    return `${brand.name} 的高端书写形象，离不开 20 世纪初的品牌起点和 Meisterstück 大班系列。`;
  }
  return "";
}

function summaryIntro(brand: BrandRow, models: ModelRow[]) {
  const summary = sentence(brand.summary);
  if (!summary || summary === "钢笔品牌") {
    if (models.length > 0) {
      return `${brand.name} 是一个较小众的钢笔品牌，读者最容易从 ${displayModelName(models[0].name)} 认识它。`;
    }
    return `${brand.name} 是钢笔史和收藏资料里一条较窄的品牌线。`;
  }
  if (summary === "中国钢笔品牌") {
    if (models.length > 0) {
      return `${brand.name} 是国产钢笔里比较小众的一支，最清楚的入口是 ${displayModelName(models[0].name)}。`;
    }
    return `${brand.name} 是国产钢笔品牌。`;
  }
  if (summary.includes("现有资料主要指向上海 G. Crown")) {
    return `${brand.name} 是中国钢笔品牌，公开资料里更清楚的信息指向上海 G. Crown 和海外分销渠道。`;
  }
  if (/品牌|制造商|公司|厂/.test(summary)) {
    return `${brand.name} 是${summary}。`;
  }
  return `${brand.name} 的核心印象是：${summary}。`;
}

function modelLine(model: ModelRow) {
  const parts = [sentence(model.summary, 110)];
  const nib = cleanSpec(model.nib, "nib");
  const fill = cleanSpec(model.fill_system, "fill");
  const material = cleanSpec(model.material, "material");
  if (nib) parts.push(`笔尖：${nib}`);
  if (fill) parts.push(`上墨：${fill}`);
  if (material) parts.push(`材料：${material}`);
  return `- **${displayModelName(model.name)}**：${parts.filter(Boolean).join("；")}。`;
}

function cleanSpec(value: string | null | undefined, kind: "fill" | "material" | "nib") {
  let text = cleanText(value);
  if (!text) return "";
  text = text
    .replace(/\/规格/g, "")
    .replace(/\/笔尖规格/g, "")
    .replace(/笔尖规格/g, "")
    .replace(/\/上墨方式/g, "")
    .replace(/上墨方式/g, "")
    .replace(/\/笔身材质/g, "")
    .replace(/笔身材质/g, "")
    .replace(/材料线索/g, "")
    .replace(/具体型号\/[^；。]+/g, "")
    .replace(/\/后期版本/g, "")
    .replace(/\/广告版本/g, "")
    .replace(/\/尺寸版本/g, "")
    .replace(/\/饰面版本/g, "")
    .replace(/\/版本差异/g, "")
    .replace(/版本差异/g, "")
    .replace(/需以[^；。]*复核/g, "")
    .replace(/需[^；。]*核验/g, "")
    .replace(/线索/g, "")
    .replace(/语境/g, "")
    .replace(/口径/g, "")
    .replace(/随具体版本确认/g, "随具体版本变化")
    .replace(/vintage\s*\d*/gi, "")
    .replace(/vintage 材质细节/gi, "")
    .replace(/或随版本变化/g, "随版本变化")
    .replace(/\/?或$/g, "")
    .replace(/（[，,；;\s]+/g, "（")
    .replace(/[，,；;\s]+）/g, "）")
    .replace(/（\s*）/g, "")
    .replace(/；\s*；/g, "；")
    .replace(/；\s*随版本变化。?$/g, "")
    .replace(/[；，、]\s*$/g, "")
    .replace(/^[\/、，；\s]+|[\/、，；\s]+$/g, "")
    .trim();
  if (!text) return "";
  if (kind === "fill" && /^(取决于搭载笔款|随版本变化)$/.test(text)) return "";
  if (kind === "material" && /^(取决于搭载笔款|随版本变化)$/.test(text)) {
    return "";
  }
  if (kind === "nib" && /^(规格|随版本变化)$/.test(text)) return "";
  return text;
}

const DOMESTIC_BRAND_SLUGS = new Set([
  "admok",
  "campus",
  "dagong",
  "delike",
  "dongwu",
  "douwan",
  "duke",
  "hero",
  "hero-paddy",
  "hongdian",
  "jinhao",
  "jinxing",
  "kaco",
  "lanbitou",
  "lily",
  "majohn",
  "mg",
  "paili",
  "penbbs",
  "picasso",
  "shule",
  "skb",
  "snowhite",
  "tangyue",
  "tramol",
  "wingsung",
  "yiren",
  "yisihua",
  "zhangjiang",
]);

function brandCharacter(brand: BrandRow, models: ModelRow[]) {
  const text = `${brand.summary || ""} ${models
    .map((model) => `${model.name} ${model.summary || ""} ${model.nib || ""} ${model.fill_system || ""} ${model.material || ""}`)
    .join(" ")}`;

  if (brand.slug === "lamy") {
    return `${brand.name} 的核心不是堆配置，而是把清楚的工业设计放进不同价位。Safari 负责入门和教学握姿，LAMY 2000 负责经典设计和长期日用，Studio、AL-star、Dialog 3 则把同一套克制语言推向金属笔身、日常工具和旋转伸缩结构。`;
  }
  if (brand.slug === "pilot") {
    return `${brand.name} 的强项是稳定制造和清晰产品线。Custom 系列让读者按笔尖尺寸、上墨方式和预算往上走，Capless/Decimo 则把“随手按一下就写”变成这个品牌最容易被记住的现代设计。`;
  }
  if (brand.slug === "platinum") {
    return `${brand.name} 可以从两端看：#3776 Century 代表相对容易入手的金尖日用笔，Izumo、President 等型号则把漆面、尺寸和更高阶的笔尖配置放到前面。它的许多现代型号也常被拿来讨论密封、维护和墨囊兼容。`;
  }
  if (brand.slug === "sailor") {
    return `${brand.name} 最值得看的，是笔尖反馈和外形家族。1911/Profit 更传统，Pro Gear 更现代，King of Pen 和长刀研把尺寸、笔尖和书写姿态推到更讲究的层级。`;
  }
  if (brand.slug === "parker") {
    return `${brand.name} 的历史很适合从两条线读：Duofold、Vacumatic、51 这些老型号展示了美国钢笔工业最兴盛时的设计野心，现代复刻和现行 Duofold 则把这个名字带回日用和礼品市场。`;
  }
  if (brand.slug === "waterman") {
    return `${brand.name} 早期和美国钢笔发明史关系很深，后来的法国 Waterman 又形成了另一种更偏商务和设计感的路线。读 Waterman 时，老笔要看上墨机构和硬橡胶/赛璐珞状态，现代笔则更该看笔身漆面、嵌入式笔尖和耗材兼容。`;
  }
  if (brand.slug === "sheaffer") {
    return `${brand.name} 很适合从上墨机构和笔尖形态读。Touchdown、Snorkel、PFM、Targa 这些名字背后，是美国品牌在便利上墨、包尖结构和战后商务笔上的连续尝试。`;
  }
  if (brand.slug === "pelikan") {
    return `${brand.name} 的辨识度来自活塞上墨、条纹笔杆和 Souverän 产品线。M400、M600、M800、M1000 的差别不只是大小，也关系到重量、笔尖尺寸和长时间书写时的平衡。`;
  }
  if (brand.slug === "montblanc") {
    return `${brand.name} 的核心是 Meisterstück 大班系列和高端书写礼品市场。146、149 这类型号要看尺寸、笔尖、活塞结构和年代差异；限量系列还要看题材、编号、盒证和保存状态。`;
  }
  if (brand.slug === "kaweco") {
    return `${brand.name} 的魅力在随身携带和尺寸控制上。Sport 合盖很短、套帽后能稳定书写，AL Sport、Liliput、Student 又把口袋笔、金属笔身和复古学生笔分别展开。`;
  }
  if (brand.slug === "twsbi") {
    return `${brand.name} 最容易被记住的是透明笔身、活塞或真空上墨和可拆洗结构。ECO、580、VAC700R 的差别，主要落在墨量、重量、维护难度和透明示范感上。`;
  }
  if (brand.slug === "aurora") {
    return `${brand.name} 的重点在意大利制造、笔尖反馈和经典外形。88、Optima 这类名字常被放在老派欧洲书写工具里讨论，收藏时还要看年代、笔尖、活塞状态和材质。`;
  }
  if (brand.slug === "cross") {
    return `${brand.name} 更常被人从签字笔认识，钢笔线则偏向商务礼品和日常书写。Bailey、Century、Townsend 等型号要分清尺寸、材质、笔尖配置和耗材系统。`;
  }
  if (brand.slug === "diplomat") {
    return `${brand.name} 的现代代表是 Aero 这类金属笔身钢笔。它给人的印象更偏德国制造、明确重量和可靠笔尖，购买时要看钢尖/金尖版本、笔杆表面处理和握持重量。`;
  }
  if (brand.slug === "monteverde") {
    return `${brand.name} 更像现代彩色书写工具品牌，重点在配色、笔身设计和相对友好的价格。读它时应按具体系列判断，不同型号在重量、笔尖来源和耗材兼容上差异很大。`;
  }
  if (brand.slug === "faber-castell") {
    return `${brand.name} 的钢笔线延续了它在铅笔和书写工具上的材料意识。Ambition、E-Motion、Ondoro、Loom 这些型号的差异，更多落在笔杆材料、握持粗细、钢尖表现和日常耐用性上。`;
  }
  if (brand.slug === "leonardo") {
    return `${brand.name} 更像现代意大利手工笔的入口。它的吸引力通常来自树脂花纹、车削比例、活塞或上墨器结构，以及同一系列里不断变化的颜色和限量版本。`;
  }
  if (brand.slug === "opus88") {
    return `${brand.name} 的重点是滴入式上墨和大墨量。Demo、Kolora 这类透明或半透明型号，适合喜欢看墨水、愿意接受清洁步骤、又需要长时间书写的人。`;
  }
  if (brand.slug === "wancher") {
    return `${brand.name} 的看点在日本材料和主题化版本。Dream Pen 这类型号常把 ebonite、生漆、莳绘或特殊笔尖配置放到前面，购买时要按具体批次看材料和笔尖。`;
  }
  if (brand.slug === "namiki") {
    return `${brand.name} 是 Pilot 体系里更偏漆艺和高级工艺的一支。Emperor、Yukari Royale 这类型号的重点在尺寸、漆面、莳绘题材和大型金尖，不适合只按“顺滑”来判断。`;
  }
  if (brand.slug === "noodlers") {
    return `${brand.name} 更常被人从墨水认识，钢笔线带有工具和可调校的气质。它适合愿意自己处理笔尖、供墨和清洁的人，追求开箱即稳的读者要谨慎一些。`;
  }
  if (brand.slug === "schneider") {
    return `${brand.name} 的钢笔更接近学校、办公和日常文具市场。BK402 这类型号不靠复杂历史取胜，重点是便宜、易买、耗材简单和书写够稳定。`;
  }
  if (DOMESTIC_BRAND_SLUGS.has(brand.slug)) {
    return `${brand.name} 更适合按具体型号来判断。入门和国产型号的差异往往体现在笔尖稳定性、上墨器密封、笔杆重量、做工一致性和售后便利上。`;
  }
  if (/活塞|piston|透明|TWSBI|Pelikan/i.test(text)) {
    return `${brand.name} 的辨识度很大一部分来自上墨结构和笔身比例。读这些型号时，可以把墨量、维护、密封和笔身重量放在同一张清单里看。`;
  }
  if (/口袋|Sport|Liliput|pocket/i.test(text)) {
    return `${brand.name} 的魅力在随身携带和尺寸控制上。它的代表型号通常合盖很短、开盖后又能写得稳定，适合通勤、手账和短时记录。`;
  }
  if (/漆|莳绘|urushi|maki|高端|奢侈|限量/i.test(text)) {
    return `${brand.name} 的判断重点不只在顺滑，还在材料、工艺、笔尖和版本完整性。买这类笔时，漆面、金属件、编号、盒证和售后渠道都值得认真看。`;
  }
  if (/美国经典|vintage|Dollar|Snorkel|Doric|Skyline|Chilton|Dunn|Morrison|Wearever|WASP/i.test(text)) {
    return `${brand.name} 更适合放在老钢笔和收藏市场里读。版本、材料、上墨机构、修复痕迹和零件状态，会比单纯的品牌名更影响实际价值。`;
  }
  return `${brand.name} 的具体性格要回到型号上看：外形比例、笔尖反馈、上墨系统和长期维护，都会决定它适合日用、收藏还是尝鲜。`;
}

function buildCopy(
  brand: BrandRow,
  models: ModelRow[],
  sources: SourceRow[],
  pack?: BrandSearchPack,
): BrandCopy {
  const sortedModels = sortModels(brand, models).slice(0, 6);
  const modelNames = sortedModels.map((model) => displayModelName(model.name));
  const fact = sourceFact(brand, sources, pack);
  const intro = [summaryIntro(brand, sortedModels), fact]
    .filter(Boolean)
    .join("\n\n");

  const modelPara =
    sortedModels.length > 0
      ? `${sortedModels.length === 1 ? "先看这支代表型号：" : "几支代表型号能说明这个品牌的性格："}\n\n${sortedModels
          .map(modelLine)
          .join("\n")}`
      : `读 ${brand.name} 时，系列名和实物标识最重要。笔帽刻字、笔尖标识、上墨器兼容性、笔身材质和经销渠道，通常比单独一个品牌名更能说明它的定位。`;

  const character = brandCharacter(brand, sortedModels);

  const title =
    modelNames.length > 0
      ? `${brand.name}：${modelNames.slice(0, 2).join("、")}与品牌性格`
      : `${brand.name}：品牌背景与常见实物`;

  const summary =
    modelNames.length > 0
      ? `${brand.name} 的代表型号包括 ${modelNames.slice(0, 3).join("、")}，这些型号能看出品牌定位和书写性格。`
      : `${brand.name} 的重点在品牌来历、常见实物和具体型号。`;

  return {
    title,
    summary,
    body: [intro, modelPara, character].join("\n\n"),
  };
}

function cleanBrandSummary(brand: BrandRow) {
  const summary = cleanText(brand.summary);
  if (summary.includes("现有资料主要指向上海 G. Crown")) {
    return "中国钢笔品牌，和上海 G. Crown 及海外分销渠道有关";
  }
  return summary || null;
}

async function getBrands(db: Client) {
  return all<BrandRow>(
    db,
    `SELECT id, slug, name, summary
     FROM entities
     WHERE type = 'brand'
     ORDER BY slug`,
  );
}

async function getBrandModels(db: Client, brandId: string) {
  const rows = await all<ModelRow>(
    db,
    `SELECT DISTINCT p.id, p.slug, p.name, p.summary,
            ms.nib, ms.fill_system, ms.material, ms.price_range, ms.release_year
     FROM entity_links el
     JOIN entities p ON (
       (el.source_id = ? AND p.id = el.target_id)
       OR (el.target_id = ? AND p.id = el.source_id)
     )
     LEFT JOIN model_specs ms ON ms.entity_id = p.id
     WHERE p.type = 'pen'
       AND el.link_type != 'reverse'
     ORDER BY p.name`,
    [brandId, brandId],
  );
  return rows;
}

async function getBrandSources(db: Client, brandId: string) {
  return all<SourceRow>(
    db,
    `SELECT sr.name as source_name, sr.source_type, si.title, si.url, si.summary
     FROM entity_references er
     JOIN source_items si ON si.id = er.source_item_id
     JOIN source_registry sr ON sr.id = si.source_id
     WHERE er.entity_id = ?
     ORDER BY
       CASE sr.source_type
         WHEN 'official' THEN 0
         WHEN 'wikimedia' THEN 1
         WHEN 'blog' THEN 2
         WHEN 'retailer' THEN 3
         ELSE 4
       END,
       sr.name,
       si.title`,
    [brandId],
  );
}

async function getStory(db: Client, brandId: string) {
  return one<StoryRow>(
    db,
    `SELECT id, title, summary, body_md, source_notes
     FROM stories
     WHERE entity_id = ? AND story_type = 'brand_story'
     LIMIT 1`,
    [brandId],
  );
}

async function upsertStory(db: Client, brand: BrandRow, copy: BrandCopy) {
  const story = await getStory(db, brand.id);
  if (story?.id) {
    await run(
      db,
      `UPDATE stories
       SET title = ?, summary = ?, body_md = ?,
           source_notes = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        copy.title,
        copy.summary,
        copy.body,
        `Web-researched reader-facing brand story, refreshed ${TODAY}.`,
        story.id,
      ],
    );
    return;
  }

  await run(
    db,
    `INSERT INTO stories
     (id, entity_id, title, story_type, summary, body_md, status, source_notes, created_at, updated_at)
     VALUES (?, ?, ?, 'brand_story', ?, ?, 'published', ?, datetime('now'), datetime('now'))`,
    [
      `brand-story-${brand.slug}`,
      brand.id,
      copy.title,
      copy.summary,
      copy.body,
      `Web-researched reader-facing brand story, refreshed ${TODAY}.`,
    ],
  );
}

function bannedBrandCopy(text: string) {
  return /公开检索入口|进一步查证方向|馆内|来源卡片|品牌名只能|页面下方|型号页会|适合从品牌背景/.test(
    text,
  );
}

async function main() {
  const db = createDb();
  try {
    const allBrands = await getBrands(db);
    const visibleBrands = allBrands.filter(
      (brand) => !HIDDEN_BRAND_SLUGS.has(brand.slug),
    );
    const packs = await getSearchPacks(db, visibleBrands);
    const packBySlug = new Map(packs.map((pack) => [pack.slug, pack]));
    const rewritten: string[] = [];
    const warnings: string[] = [];

    for (const brand of visibleBrands) {
      const [models, sources] = await Promise.all([
        getBrandModels(db, brand.id),
        getBrandSources(db, brand.id),
      ]);
      const copy = buildCopy(brand, models, sources, packBySlug.get(brand.slug));
      const mergedText = `${copy.title}\n${copy.summary}\n${copy.body}`;
      if (bannedBrandCopy(mergedText)) {
        warnings.push(`${brand.slug}: banned wording remains`);
      }
      const cleanedSummary = cleanBrandSummary(brand);
      if (cleanedSummary && cleanedSummary !== brand.summary) {
        await run(
          db,
          `UPDATE entities
           SET summary = ?, updated_at = datetime('now')
           WHERE id = ?`,
          [cleanedSummary, brand.id],
        );
      }
      await upsertStory(db, brand, copy);
      rewritten.push(`${brand.slug}｜${brand.name}｜${models.length} models`);
    }

    const report = [
      `# Brand Reader Stories Web Rewrite (${TODAY})`,
      "",
      `- database: ${USE_TURSO ? "turso" : "local"}`,
      `- mode: ${WRITE ? "write" : "dry-run"}`,
      `- visible brands rewritten: ${rewritten.length}`,
      `- hidden brands skipped: ${[...HIDDEN_BRAND_SLUGS].join(", ")}`,
      `- search cache: ${CACHE_PATH}`,
      "",
      "## Rewritten",
      "",
      ...rewritten.map((line) => `- ${line}`),
      "",
      "## Warnings",
      "",
      ...(warnings.length ? warnings.map((line) => `- ${line}`) : ["- None"]),
      "",
      "## Web Sources Sample",
      "",
      ...packs.slice(0, 20).flatMap((pack) => [
        `### ${pack.name}`,
        ...pack.results.slice(0, 3).map((item) => `- ${item.title} — ${item.url}`),
        "",
      ]),
    ].join("\n");

    if (WRITE && !USE_TURSO) {
      mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
      writeFileSync(REPORT_PATH, report);
    }

    console.log(
      JSON.stringify(
        {
          database: USE_TURSO ? "turso" : "local",
          mode: WRITE ? "write" : "dry-run",
          visibleBrands: visibleBrands.length,
          warnings: warnings.length,
          reportPath: WRITE && !USE_TURSO ? REPORT_PATH : null,
          cachePath: CACHE_PATH,
        },
        null,
        2,
      ),
    );
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
