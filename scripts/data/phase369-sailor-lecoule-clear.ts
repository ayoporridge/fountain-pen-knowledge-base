import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase33Sailor2026CurrentPacks } from "./phase33-sailor-2026-current";

export const PHASE369_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE369_LECOULE_CLEAR_ID = "phase369-sailor-lecoule-clear-110313";
export const PHASE369_LECOULE_CLEAR_SLUG = "sailor-lecoule-clear";

const RETRIEVED = "2026-08-03";
const SCOPE = "phase369-sailor-lecoule-clear-110313";

function source(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  registryKey?: string;
  registryName?: string;
  homepageUrl?: string;
  author?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const registryKey = input.registryKey ?? `sailor-phase369-${sourceType}`;
  const registryName =
    input.registryName ??
    (sourceType === "official"
      ? "The Sailor Pen Co., Ltd."
      : "Fountain Pen Graph editorial studio");
  return {
    key: input.key,
    registryKey,
    registryName,
    sourceType,
    tier:
      input.tier ??
      (sourceType === "retailer" ? "professional_secondary" : "primary"),
    independenceGroup: registryKey,
    title: input.title,
    url: input.url,
    homepageUrl:
      input.homepageUrl ??
      (sourceType === "official" ? "https://sailor.co.jp/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author:
      input.author ??
      (sourceType === "official" ? "セーラー万年筆株式会社" : registryName),
    retrievedAt: RETRIEVED,
    allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only",
    license: sourceType === "user_submission" ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator:
      sourceType === "user_submission"
        ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
        : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.97 : 0.93,
    sourceKey,
    locator,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey,
        scopeKey: SCOPE,
        locator,
      },
    ],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  official: source({
    key: "phase369-sailor-lecoule-clear-official",
    title: "レクル 透明感万年筆 — 11-0313",
    url: "https://sailor.co.jp/product/11-0313/",
    summary:
      "Sailor 日本官网当前页确认 Lecoule Clear 的透明部件、11-0313-300 MF、不锈钢尖、墨囊／转换器、PMMA、镍铬镀层、φ17×123 mm、12.4 g、PG-01 和页面价格。",
    locator:
      "product title, code, nib, filling, transparent material, plating, size, weight, package and price",
  }),
  refill: source({
    key: "phase369-sailor-lecoule-clear-refill",
    title: "万年筆のインク補充方法 — 墨囊／转换器",
    url: "https://sailor.co.jp/topics/fountain-pen-refill-ink/",
    summary:
      "Sailor 官方补墨页用于墨囊／转换器的装卸、笔尖浸墨和换色时的排空步骤；不把 Clear 误写成活塞或滴入式。",
    locator: "cartridge and converter filling instructions",
  }),
  care: source({
    key: "phase369-sailor-lecoule-clear-care",
    title: "万年筆のお手入れ方法 — 透明笔芯清洗提示",
    url: "https://sailor.co.jp/topics/fountain-pen-maintenance/",
    summary:
      "Sailor 官方维护页说明清水冲洗、不要整笔浸没和透明笔芯清洗后仍可能留浅色墨迹的边界。",
    locator: "cleaning, waterline and transparent-feed residual-colour guidance",
  }),
  archive: source({
    key: "phase369-sailor-lecoule-clear-archive",
    title: "Sailor 2019–2020 官方目录索引第 77 页",
    url: "https://sailor.co.jp/book_2019-2020/pageindices/index77.html",
    summary:
      "旧官方目录将 11-0313 Clear 与 11-0311 Power Stone 分列，用来锁定历史／邻近 SKU 边界，不外推全球当前库存。",
    locator: "11-0313 Clear and 11-0311 Power Stone separate catalogue entries",
    tier: "contemporary_archive",
    registryKey: "sailor-official-catalogue-phase369",
  }),
  review: source({
    key: "phase369-sailor-lecoule-clear-review",
    title: "Sailor Lecoule Fountain Pen Review — The Pen Addict",
    url: "https://www.penaddict.com/blog/2014/9/17/sailor-lecoule-fountain-pen-review",
    summary:
      "The Pen Addict 对一支 Lecoule 样本记录了短笔身、插帽倾向、MF 细线与入门定位；这些是评测者体验，不外推为每支 Clear 的硬保证。",
    locator: "reviewer's Lecoule sample: short body, posting, MF line and beginner positioning",
    sourceType: "blog",
    tier: "professional_secondary",
    registryKey: "pen-addict-phase369",
    registryName: "The Pen Addict",
    homepageUrl: "https://www.penaddict.com/",
    author: "Jeff Abbott",
  }),
  retailer: source({
    key: "phase369-sailor-lecoule-clear-retailer",
    title: "Sailor Lecoule Clear MF 11-0313-300 — Luiban",
    url: "https://luiban.com/en/Manufacturers/Sailor/SA026-sailor-lecoule-fountain-pen-clear-mf",
    summary:
      "Luiban 国际经销商页面以 11-0313-300 标识透明 MF 样本，用来交叉核对国际市场型号代码，不替代 Sailor 官方规格。",
    locator: "international listing code and Clear MF product identity",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "luiban-phase369",
    registryName: "Luiban",
    homepageUrl: "https://luiban.com/",
    author: "Luiban",
  }),
  diagram: source({
    key: "phase369-sailor-lecoule-clear-svg",
    title: "Sailor Lecoule Clear 11-0313 factual identity card",
    url: "/images/library/site-original/phase369/sailor/lecoule-clear-110313.svg",
    summary: "本站原创 factual SVG；表达 11-0313 的透明部件、MF 尖与 C/C 边界，非产品照片。",
    locator: "site-original factual SVG metadata",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase369",
  }),
} as const;

const brand = structuredClone(
  phase33Sailor2026CurrentPacks.find(
    (pack) => pack.entityId === PHASE369_SAILOR_BRAND_ID && pack.expectedType === "brand",
  ),
);
if (!brand) throw new Error("Phase 369 Sailor brand pack missing.");
brand.key = "phase369-sailor-brand-v1";

const model: CuratedEntityPack = {
  key: "phase369-sailor-lecoule-clear-110313-v1",
  entityId: PHASE369_LECOULE_CLEAR_ID,
  expectedType: "pen",
  expectedSlug: PHASE369_LECOULE_CLEAR_SLUG,
  canonicalName: "写乐 Sailor Lecoule Clear（11-0313）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sailor-lecoule-clear-110313-phase369.md",
  storyTitle: "写乐 Sailor Lecoule Clear 11-0313：透明感钢尖入门款",
  primarySourceKey: S.official.key,
  depthTier: "A",
  aliases: [
    { alias: "Sailor Lecoule Clear", language: "en", sourceKey: S.official.key },
    { alias: "Sailor Lecoule Transparent", language: "en", sourceKey: S.retailer.key },
    { alias: "11-0313", language: "en", sourceKey: S.official.key },
    { alias: "11-0313-300", language: "en", sourceKey: S.official.key },
    { alias: "レクル 透明感", language: "ja", sourceKey: S.official.key },
    { alias: "写乐 Lecoule 透明感", language: "zh", sourceKey: S.official.key },
  ],
  sources: [S.official, S.refill, S.care, S.archive, S.review, S.retailer, S.diagram],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Sailor Japan official product page",
      validFrom: "2019",
      productionState: "current",
      nibScope: "stainless steel MF; current complete code 11-0313-300",
      materialScope: "transparent PMMA parts and nickel-chrome plated metal parts",
      editionScope: "Lecoule Clear / 11-0313, not 11-0311 Power Stone",
    },
    {
      key: "phase369-lecoule-clear-archive-boundary",
      scopeKey: "phase369-lecoule-clear-archive-boundary",
      productionState: "historical",
      editionScope: "2019–2020 official catalogue window; no exact launch date inferred",
    },
    {
      key: "phase369-lecoule-clear-media-boundary",
      scopeKey: "phase369-lecoule-clear-media-boundary",
      productionState: "current",
      editionScope: "site-original factual SVG; no product photo or colour proof",
    },
  ],
  claims: [
    claim(
      "phase369-lecoule-clear-identity",
      "model_identity",
      "11-0313 是 Sailor Lecoule Clear 透明感钢笔的独立型号，当前完整 MF 代码为 11-0313-300；它不是 11-0311 Power Stone 的透明别名。",
      S.official.key,
      "official product title and code",
    ),
    claim(
      "phase369-lecoule-clear-international-code",
      "international_listing",
      "Luiban 以 11-0313-300 列出透明 MF 样本，作为国际市场的专业二手交叉核对；最终型号和规格仍以 Sailor 官方页为准。",
      S.retailer.key,
      "international listing code and Clear MF identity",
    ),
    claim(
      "phase369-lecoule-clear-nib",
      "nib",
      "官方当前规格为不锈钢 MF（中细）尖；评测样本的线宽和反馈只代表单支调校，不能把高阶金尖手感移入 Clear。",
      S.official.key,
      "stainless steel nib and MF code",
    ),
    claim(
      "phase369-lecoule-clear-filling",
      "filling_system",
      "采用墨囊／转换器两用式，不能写成尾栓活塞、真空或滴入式大容量上墨。",
      S.refill.key,
      "cartridge and converter instructions",
    ),
    claim(
      "phase369-lecoule-clear-material",
      "material",
      "盖、杆、大先、盖栓和尾栓均为透明 PMMA 树脂，金属件为镍铬镀层；透明感是材质与外观路线，不是天然水晶。",
      S.official.key,
      "transparent PMMA parts and nickel-chrome plating fields",
    ),
    claim(
      "phase369-lecoule-clear-size",
      "physical_specification",
      "官网给出最大径 φ17 mm、全长 123 mm（含笔夹）和重量 12.4 g；不把插帽长度或装墨实称混入规格。",
      S.official.key,
      "size and weight fields",
    ),
    claim(
      "phase369-lecoule-clear-price",
      "market_status",
      "日本官网当前页面显示 ¥3,850（本体 ¥3,500）；价格和库存是读取日与市场口径，不能承诺全球统一售价。",
      S.official.key,
      "current page price and availability context",
    ),
    claim(
      "phase369-lecoule-clear-boundary",
      "sibling_boundary",
      "2019–2020 官方目录把 11-0313 Clear 与 11-0311 Power Stone 分列；两者同属 Lecoule 入门层，但颜色路线和 SKU 不同。",
      S.archive.key,
      "separate catalogue entries for 11-0313 and 11-0311",
    ),
    claim(
      "phase369-lecoule-clear-review-sample",
      "review_sample",
      "The Pen Addict 对一支 Lecoule 样本记录了短笔身、较适合插帽书写和清楚的 MF 细线；这是评测者的单支体验，不是每支 Clear 的质量保证。",
      S.review.key,
      "reviewer's short-body, posting and MF observations",
    ),
    claim(
      "phase369-lecoule-clear-care",
      "maintenance_guidance",
      "换色时排空墨囊或转换器，以清水吸排多次；透明笔芯清洗后仍可能留浅色墨迹，不要整笔浸水、用热水或强溶剂处理。",
      S.care.key,
      "official cleaning and transparent-feed residual-colour guidance",
      "editorial",
    ),
    claim(
      "phase369-lecoule-clear-selection",
      "selection_guidance",
      "选购时核对 11-0313-300、透明 PMMA、MF 尖、φ17×123 mm 与 C/C 路线；想要宝石色应转查 Power Stone，想要金尖或活塞应查其他系列。",
      S.official.key,
      "code, material, nib, size and filling fields",
      "editorial",
    ),
    claim(
      "phase369-lecoule-clear-media",
      "media_identity_boundary",
      "主图是本站原创事实 SVG，不复制 Sailor logo 或产品照片，也不证明实物透明度、比例、批次或颜色。",
      S.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase369-lecoule-clear-mf-current",
      name: "Clear 透明感 MF（11-0313-300）",
      notes: "当前官网完整代码；不锈钢 MF 尖，透明 PMMA 部件。",
      sourceKey: S.official.key,
      variantKind: "market_sku",
      productCode: "11-0313-300",
      market: "日本",
    },
    {
      key: "phase369-lecoule-clear-catalogue-window",
      name: "2019–2020 官方目录路线",
      notes: "旧目录中的 11-0313 Clear；用于历史时间层，不承诺当前每个市场库存。",
      sourceKey: S.archive.key,
      variantKind: "edition_group",
      market: "历史／地区库存",
    },
  ],
  spec: {
    brandEntityId: PHASE369_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor Lecoule Clear（11-0313）",
      release_year: "2019–2020 官方目录已列；现行官网未给出明确首发日",
      origin_country: "日本品牌；不外推具体工厂",
      nib: "不锈钢 MF（中细）尖；完整代码 11-0313-300",
      fill_system: "墨囊／转换器两用式（cartridge/converter）",
      material: "透明 PMMA 树脂盖／杆／大先／盖栓／尾栓；镍铬镀层金属件",
      dimensions: "φ17 × 123 mm（含笔夹）",
      weight: "12.4 g",
      price_range: "日本官网 ¥3,850（本体 ¥3,500）；按读取日和市场口径",
      status: "日本官网现行 Lecoule Clear；11-0313-300 MF",
    },
    evidence: [
      evidence("phase369-clear-brand", "brand_entity_id", S.official.key, "official Sailor product page"),
      evidence("phase369-clear-series", "series_name", S.official.key, "product title and 11-0313 code"),
      evidence("phase369-clear-release", "release_year", S.archive.key, "2019–2020 official catalogue window"),
      evidence("phase369-clear-origin", "origin_country", S.official.key, "Sailor Japan product context"),
      evidence("phase369-clear-nib-field", "nib", S.official.key, "stainless steel MF and 11-0313-300"),
      evidence("phase369-clear-fill-field", "fill_system", S.refill.key, "cartridge and converter instructions"),
      evidence("phase369-clear-material-field", "material", S.official.key, "PMMA and nickel-chrome plating"),
      evidence("phase369-clear-dimensions", "dimensions", S.official.key, "φ17×123 mm"),
      evidence("phase369-clear-weight", "weight", S.official.key, "12.4 g"),
      evidence("phase369-clear-price", "price_range", S.official.key, "current official page price"),
      evidence("phase369-clear-status", "status", S.official.key, "current product page status"),
    ],
  },
  media: [
    {
      key: "phase369-lecoule-clear-primary-media",
      title: "Lecoule Clear 11-0313 事实卡（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: S.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样。",
      sourceUrl: S.diagram.url,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "phase369-lecoule-clear-catalogue-window",
      title: "11-0313 出现在 Sailor 2019–2020 官方目录",
      eventType: "design_milestone",
      startDate: "2019",
      circa: true,
      description: "官方目录已把 Lecoule Clear 11-0313 与 Power Stone 11-0311 分列；目录窗口不等于精确首发日。",
      sourceKey: S.archive.key,
    },
  ],
};

export const phase369SailorLecouleClearPacks: CuratedEntityPack[] = [brand, model];
