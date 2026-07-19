import type {
  CuratedEntityPack,
  CuratedSource,
} from "../lib/curated-content-pack";
import {
  PHASE31_SAILOR_BRAND_ID,
  phase31SailorP0Packs,
} from "./phase31-sailor-p0";

export const PHASE33_SAILOR_BRAND_ID = PHASE31_SAILOR_BRAND_ID;
export const PHASE33_PGS21_ID = "dBDXcNFZa-2a";
export const PHASE33_PROFIT_REALO18_ID = "mgrSd-kwaHmS";
export const PHASE33_ANCHOR_ID = "H6jHBfCkFUBr";

const RETRIEVED = "2026-07-19";

type LiveSourceInput = Omit<
  CuratedSource,
  "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
> & {
  allowedUse?: CuratedSource["allowedUse"];
  locator: string;
};

function liveSource(source: LiveSourceInput): CuratedSource {
  const { allowedUse, locator, ...record } = source;
  return {
    ...record,
    retrievedAt: RETRIEVED,
    allowedUse: allowedUse ?? "summary_only",
    archiveUrl: record.url,
    archiveLocator: [
      "live-source-not-frozen",
      `retrieved=${RETRIEVED}`,
      "external_archive=false",
      "raw_source_stored=false",
      `locator=${locator}`,
    ].join(";"),
  };
}

function phase31Source(key: string): CuratedSource {
  const match = phase31SailorP0Packs
    .flatMap((pack) => pack.sources)
    .find((candidate) => candidate.key === key);
  if (!match) {
    throw new Error(`Phase 33 cannot resolve Phase 31 source ${key}.`);
  }
  return match;
}

function official(input: {
  key: string;
  title: string;
  url: string;
  publishedAt?: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return liveSource({
    key: input.key,
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: input.title,
    url: input.url,
    homepageUrl: "https://sailor.co.jp/",
    author: "セーラー万年筆株式会社",
    publishedAt: input.publishedAt,
    summary: input.summary,
    locator: input.locator,
  });
}

function factualSvg(input: {
  key: string;
  title: string;
  path: string;
  summary: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: input.title,
    url: input.path,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: input.path,
    archiveLocator: [
      `project-public-asset:${input.path}`,
      "site-original=true",
      "factual-svg=true",
      "product-photo=false",
      "logo=false",
      "anchor-trademark=false",
      "engraving=false",
      "to-scale=false",
      "colour-proof=false",
      "dimensions=1600x900",
    ].join(";"),
  };
}

const SOURCES = {
  "sailor-pgs21": phase31Source("sailor-pgs21"),
  "phase33-pgs21-silver": official({
    key: "phase33-pgs21-silver",
    title: "プロフェッショナルギア スリム 21 シルバートリム万年筆 — 11-2152",
    url: "https://sailor.co.jp/product/11-2152/",
    summary:
      "同日发布的独立银饰路线 11-2152，白／黑 PMMA 与 nickel chrome；只用于排除其颜色和代码，不并入 11-2151。",
    locator:
      "11-2152 White/Black item-code groups and nickel chrome specification boundary",
  }),
  "phase33-pgs-mini-old": official({
    key: "phase33-pgs-mini-old",
    title: "プロフェッショナルギア スリムミニ 金 万年筆 — 11-1503",
    url: "https://sailor.co.jp/product/11-1503/",
    summary:
      "旧 14K Slim Mini 官方页：11-1503、14K 中型、109.5 mm、16.4 g、Mini converter；只作 Mini／旧 14K 排除边界。",
    locator:
      "14K medium nib, 109.5 mm closed length, 16.4 g and mini-converter fields",
  }),
  "phase33-pgs21-retailer": liveSource({
    key: "phase33-pgs21-retailer",
    registryKey: "rakuten-penhouse",
    registryName: "Pen House on Rakuten",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "rakuten-penhouse-retailer",
    title: "SAILOR プロフェッショナルギアスリム21 — 11-2151",
    url: "https://item.rakuten.co.jp/penroom/48416/",
    homepageUrl: "https://item.rakuten.co.jp/penroom/",
    author: "Pen House",
    summary:
      "日本专业零售目录列出 11-2151 的七个完整 SKU、21K 中型双色尖、PMMA 与 Gold IP；只作代码和市场身份交叉确认，不采用其与官网口径不同的尺寸值。",
    locator:
      "complete 11-2151 item codes, nib, PMMA and Gold IP fields; retailer dimensions explicitly excluded",
  }),
  "phase33-refill": official({
    key: "phase33-refill",
    title: "万年筆のインク補充方法",
    url: "https://sailor.co.jp/topics/fountain-pen-refill-ink/",
    summary:
      "Sailor 官方分别说明墨囊、上墨器与 Realo 尾栓回转吸入的补墨步骤及耗材限制。",
    locator:
      "converter refill steps and Realo tail-knob filling section with cartridge/converter prohibition",
  }),
  "sailor-profit-realo18": phase31Source("sailor-profit-realo18"),
  "phase33-realo18-en": official({
    key: "phase33-realo18-en",
    title: "1911 REALO 18K Fountain Pen GT — 11-1853",
    url: "https://en.sailor.co.jp/product/11-1853/",
    summary:
      "Sailor 英文官网把同一 11-1853 命名为 1911 REALO 18K Fountain Pen GT，并列 φ18×150.5 mm 与 26.3 g；只支持英文市场名，不另建身份。",
    locator:
      "English product title, 11-1853 item codes, size and weight; same-code regional naming",
  }),
  "phase33-realo18-intro": official({
    key: "phase33-realo18-intro",
    title: "『プロフィット レアロ 18 万年筆』のご紹介",
    url: "https://sailor.co.jp/topics/profit_realo_18/",
    summary:
      "官方新品专题把 11-1853 定义为 Profit Realo 换代：容量约 1.5cc（旧式约 1.0cc 的 1.5 倍），新两部件笔身允许符合接口条件的握位互换。",
    locator:
      "1.5cc versus prior 1.0cc, two-part body, compatible-section condition and model-change statement",
  }),
  "phase33-realo-old": official({
    key: "phase33-realo-old",
    title: "プロフィット レアロ万年筆 — 11-3924",
    url: "https://sailor.co.jp/product/11-3924/",
    summary:
      "售完即止的旧 Profit Realo：21K 大型、约 1cc、φ18×141 mm、21.4 g；只作旧代边界。",
    locator:
      "sell-through status, 11-3924 codes, 21K large nib, 1cc, 141 mm and 21.4 g fields",
  }),
  "phase33-pro-gear-realo": official({
    key: "phase33-pro-gear-realo",
    title: "プロフェッショナルギア レアロ万年筆 — 11-3926",
    url: "https://sailor.co.jp/product/11-3926/",
    summary:
      "Professional Gear Realo 11-3926 是独立平顶家族：21K 大型、约 1cc、φ18×135 mm、21.0 g；不并入 Profit Realo 18。",
    locator:
      "Professional Gear Realo title, 11-3926 codes, 21K/1cc/135 mm/21.0 g specifications",
  }),
  "phase33-realo-retailer": liveSource({
    key: "phase33-realo-retailer",
    registryKey: "rakuten-you-style",
    registryName: "You STYLE on Rakuten",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "rakuten-you-style-retailer",
    title: "セーラー 万年筆 プロフィットレアロ18 — 11-1853",
    url: "https://item.rakuten.co.jp/auc-youstyle/you-sl-11-1722/",
    homepageUrl: "https://item.rakuten.co.jp/auc-youstyle/",
    author: "You STYLE",
    summary:
      "日本专业零售目录列出 Profit Realo 18 的 EF/F/MF/M/B/Z/MS 完整 11-1853 SKU；只作型号与尖号交叉确认。",
    locator:
      "retailer title and complete 11-1853-120/220/320/420/620/720/920 SKU list",
  }),
  "phase33-anchor-gold": official({
    key: "phase33-anchor-gold",
    title: "プロフェッショナルギア アンカー ゴールドトリム 万年筆 — 11-5080",
    url: "https://sailor.co.jp/product/11-5080/",
    summary:
      "Anchor Gold 11-5080：2025-12-13、21K 大型双色、黄铜大先／Gold IP、透明黎明蓝 PMMA、φ16×132.7 mm、30 g。",
    locator:
      "release date, seven item codes, nib/filling/brass section/material/size/weight and prices",
  }),
  "phase33-anchor-silver": official({
    key: "phase33-anchor-silver",
    title: "プロフェッショナルギア アンカー シルバートリム 万年筆 — 11-5081",
    url: "https://sailor.co.jp/product/11-5081/",
    summary:
      "Anchor Silver 11-5081：21K 大型双色，黄铜大先和金属部件为 nickel chrome，尺寸与重量同 Anchor 新身。",
    locator:
      "seven 11-5081 item codes, bicolor nib, brass/nickel-chrome section and shared dimensions",
  }),
  "phase33-anchor-black": official({
    key: "phase33-anchor-black",
    title: "プロフェッショナルギア アンカー ブラックトリム 万年筆 — 11-5082",
    url: "https://sailor.co.jp/product/11-5082/",
    summary:
      "Anchor Black 11-5082：21K 大型 Black IP 尖、黄铜／Black IP 大先与同一新笔身规格。",
    locator:
      "seven 11-5082 item codes, Black IP nib, brass/Black IP section and shared dimensions",
  }),
  "phase33-anchor-release": official({
    key: "phase33-anchor-release",
    title: "プロフェッショナルギア アンカー 万年筆 Press Release",
    url: "https://sailor.co.jp/wp-content/uploads/2025/12/251203%E3%83%97%E3%83%AD%E3%83%95%E3%82%A7%E3%83%83%E3%82%B7%E3%83%A7%E3%83%8A%E3%83%AB%E3%82%AE%E3%82%A2_%E3%82%A2%E3%83%B3%E3%82%AB%E3%83%BC-1.pdf",
    publishedAt: "2025-12-03",
    summary:
      "官方新闻稿明确 2025-12-03 公布、12-13 发售，并解释新帽顶／尾端／帽环、较长少圆弧轮廓、透明黎明蓝与黄铜低重心。",
    locator:
      "pages 1-3: announcement/release dates, comparison with standard Pro Gear, new body design and three trim specifications",
  }),
  "phase33-anchor-retailer": liveSource({
    key: "phase33-anchor-retailer",
    registryKey: "rakuten-penhouse",
    registryName: "Pen House on Rakuten",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "rakuten-penhouse-retailer",
    title: "SAILOR プロフェッショナルギア アンカー 全3色",
    url: "https://item.rakuten.co.jp/penroom/48288/",
    homepageUrl: "https://item.rakuten.co.jp/penroom/",
    author: "Pen House",
    summary:
      "日本专业零售目录独立列出 Gold／Silver／Black 三条 11-5080／5081／5082 完整 SKU、132.7 mm 与约 30 g。",
    locator:
      "three trim groups, complete item-code lists, size, weight, brass section and filling fields",
  }),
  "phase31-pro-gear-gold": phase31Source("phase31-pro-gear-gold"),
  "sailor-care": phase31Source("sailor-care"),
  "phase33-pgs21-factual": factualSvg({
    key: "phase33-pgs21-factual",
    title: "Professional Gear Slim 21 11-2151 事实卡（本站原创事实图）",
    path: "/images/library/site-original/sailor-2026-current/sailor-pgs21-11-2151-factual.svg",
    summary:
      "本站原创非写实事实卡；只呈现 11-2151 的日期、21K 中型尖、124 mm 与边界，非产品照片。",
  }),
  "phase33-realo18-factual": factualSvg({
    key: "phase33-realo18-factual",
    title: "Profit Realo 18 11-1853 事实卡（本站原创事实图）",
    path: "/images/library/site-original/sailor-2026-current/sailor-profit-realo-18-factual.svg",
    summary:
      "本站原创非写实事实卡；只呈现 18K 大型尖、约 1.5cc、150.5 mm 与代际边界，非产品照片。",
  }),
  "phase33-anchor-factual": factualSvg({
    key: "phase33-anchor-factual",
    title: "Professional Gear Anchor 事实卡（本站原创事实图）",
    path: "/images/library/site-original/sailor-2026-current/sailor-professional-gear-anchor-factual.svg",
    summary:
      "本站原创非写实事实卡；只呈现三组代码、新笔身、黄铜大先、132.7 mm 与 30 g，非产品照片。",
  }),
} satisfies Record<string, CuratedSource>;

const source = (key: keyof typeof SOURCES): CuratedSource => SOURCES[key];

const pgs21Pack: CuratedEntityPack = {
  key: "phase33-sailor-pgs21-11-2151-v1",
  entityId: PHASE33_PGS21_ID,
  expectedType: "pen",
  expectedSlug: "sailor-professional-gear-slim-21",
  canonicalName: "Sailor Professional Gear Slim 21",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/sailor-professional-gear-slim-21-publishable-content-2026-07-19.md",
  storyTitle: "Sailor Professional Gear Slim 21：2026 年 11-2151",
  primarySourceKey: "sailor-pgs21",
  depthTier: "A",
  aliases: [
    { alias: "Sailor Professional Gear Slim 21", language: "en", sourceKey: "sailor-pgs21" },
    { alias: "Sailor PGS21", language: "en", sourceKey: "sailor-pgs21" },
    { alias: "プロフェッショナルギア スリム 21", language: "ja", sourceKey: "sailor-pgs21" },
    { alias: "写乐 Professional Gear Slim 21", language: "zh", sourceKey: "sailor-pgs21" },
  ],
  sources: [
    source("sailor-pgs21"),
    source("phase33-pgs21-silver"),
    source("phase33-pgs-mini-old"),
    source("phase31-pro-gear-gold"),
    source("phase33-pgs21-retailer"),
    source("sailor-care"),
    source("phase33-refill"),
    source("phase33-pgs21-factual"),
  ],
  variants: [
    {
      key: "pgs21-gold-black-11-2151",
      name: "Black Gold Trim（11-2151）",
      releaseYear: "2026-03-14",
      notes: "21K 中型双色尖；EF/F/MF/M/B/Z/MS 完整代码按 120/220/320/420/620/720/920。",
      sourceKey: "sailor-pgs21",
      variantKind: "market_sku",
      productCode: "11-2151-120/220/320/420/620/720/920",
      market: "日本",
    },
  ],
  scopes: [
    {
      key: "pgs21-current",
      scopeKey: "sailor-pgs21-11-2151-current-2026-07-19",
      market: "日本",
      validFrom: "2026-03-14",
      productionState: "current",
      nibScope: "21K medium bicolor EF/F/MF/M/B/Z/MS",
      materialScope: "Black PMMA and Gold IP",
      editionScope: "11-2151 only",
    },
    {
      key: "pgs21-boundaries",
      scopeKey: "sailor-pgs21-fullsize-mini-and-silver-boundaries",
      productionState: "current",
      editionScope: "excludes 11-2152, full-size 11-2036/2037 and Slim Mini",
    },
    {
      key: "pgs21-care",
      scopeKey: "sailor-cartridge-converter-care-current",
      productionState: "current",
      editionScope: "generic Sailor cartridge/converter care",
    },
    {
      key: "pgs21-retailer",
      scopeKey: "sailor-pgs21-retailer-corroboration",
      market: "日本",
      productionState: "current",
      editionScope:
        "11-2151 SKU, nib and material corroboration only; retailer dimensions excluded",
    },
    {
      key: "pgs21-media",
      scopeKey: "sailor-pgs21-factual-svg-2026-07-19",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: "site-original factual SVG; not a product photo",
    },
  ],
  claims: [
    {
      key: "pgs21-current-identity",
      predicate: "current_sku_identity",
      objectText: "11-2151 是 2026-03-14 上市的 Black Gold Trim Professional Gear Slim 21：21K 中型双色尖、七尖号、两用式、PMMA、φ17×124 mm、16.8 g。",
      factClass: "core",
      confidence: 1,
      sourceKey: "sailor-pgs21",
      locator: "release date, item-code list and basic specifications",
      evidence: [{ key: "pgs21-official-current", sourceKey: "sailor-pgs21", scopeKey: "pgs21-current", locator: "11-2151 product page fields" }],
    },
    {
      key: "pgs21-boundary",
      predicate: "identity_boundaries",
      objectText: "本页排除同日银饰 11-2152、全尺寸 21K 大型尖 11-2036／2037、旧 14K Slim 与 109.5 mm Slim Mini；PGS 缩写和相似平顶外观不足以合并身份。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase33-pgs21-silver",
      locator: "contrasting product codes and specifications",
      evidence: [
        { key: "pgs21-silver-boundary", sourceKey: "phase33-pgs21-silver", scopeKey: "pgs21-boundaries", locator: "11-2152 White/Black nickel-chrome groups" },
        { key: "pgs21-fullsize-boundary", sourceKey: "phase31-pro-gear-gold", scopeKey: "pgs21-boundaries", locator: "11-2036 21K large, 129 mm and 21.6 g" },
        { key: "pgs21-mini-boundary", sourceKey: "phase33-pgs-mini-old", scopeKey: "pgs21-boundaries", locator: "11-1503 14K medium, 109.5 mm and Mini converter" },
      ],
    },
    {
      key: "pgs21-retailer-corroboration",
      predicate: "independent_sku_corroboration",
      objectText:
        "日本专业零售目录独立列出 11-2151 的七个尖号代码、21K 中型双色尖、PMMA 与 Gold IP，可交叉确认市场 SKU；尺寸采用日本官网的闭合 124 mm，不采用零售页与官网口径不同的 121／143 mm。",
      factClass: "core",
      confidence: 0.9,
      sourceKey: "phase33-pgs21-retailer",
      locator: "complete 11-2151 item-code list, nib and material fields",
      evidence: [
        {
          key: "pgs21-retailer",
          sourceKey: "phase33-pgs21-retailer",
          scopeKey: "pgs21-retailer",
          locator:
            "11-2151-120/220/320/420/620/720/920; dimensions excluded",
        },
      ],
    },
    {
      key: "pgs21-care-guidance",
      predicate: "maintenance_guidance",
      objectText: "使用 Sailor 墨囊或标准上墨器；换墨时以清水借上墨器反复吸排约五至六次，不套用 Realo 尾栓或 Slim Mini 专用上墨器步骤。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "sailor-care",
      locator: "official converter cleaning steps",
      evidence: [
        { key: "pgs21-cleaning", sourceKey: "sailor-care", scopeKey: "pgs21-care", locator: "draw and expel clean water five to six times" },
        { key: "pgs21-refill", sourceKey: "phase33-refill", scopeKey: "pgs21-care", locator: "Sailor converter installation and filling steps" },
      ],
    },
    {
      key: "pgs21-media-boundary",
      predicate: "media_identity_boundary",
      objectText: "主图是本站原创事实卡，不是产品照片；不含 Sailor logo、锚形商标或产品刻字，不证明实物色泽、比例或批次。",
      factClass: "editorial",
      confidence: 1,
      sourceKey: "phase33-pgs21-factual",
      locator: "site-original factual SVG provenance and disclaimer",
      evidence: [{ key: "pgs21-media", sourceKey: "phase33-pgs21-factual", scopeKey: "pgs21-media", locator: "product-photo=false and identity disclaimers" }],
    },
  ],
  spec: {
    brandEntityId: PHASE33_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor Professional Gear Slim 21 Gold Trim（11-2151）",
      release_year: "2026-03-14",
      origin_country: "日本品牌；本页未用产品页外推具体制造工厂",
      nib: "21K 中型双色金尖；EF、F、MF、M、B、Z、MS",
      fill_system: "Sailor 墨囊／上墨器两用式",
      material: "黑色 PMMA；金属部件为 Gold IP",
      dimensions: "最大径 φ17 mm × 全长 124 mm（含笔夹）",
      weight: "16.8 g",
      price_range: "日本官网 2026-07-19 快照：EF/F/MF/M/B 为 ¥66,000；Z/MS 为 ¥68,200",
      status: "日本官网当前商品页可见；本页仅对应 Gold Trim 11-2151",
    },
    evidence: [
      { key: "pgs21-brand", fieldKey: "brand_entity_id", sourceKey: "sailor-pgs21", scopeKey: "pgs21-current", locator: "official Sailor product page" },
      { key: "pgs21-series", fieldKey: "series_name", sourceKey: "sailor-pgs21", scopeKey: "pgs21-current", locator: "product title and 11-2151 codes" },
      { key: "pgs21-release", fieldKey: "release_year", sourceKey: "sailor-pgs21", scopeKey: "pgs21-current", locator: "2026-03-14 release field" },
      { key: "pgs21-origin", fieldKey: "origin_country", sourceKey: "sailor-pgs21", scopeKey: "pgs21-current", locator: "Sailor Japanese official product page; no factory inference", qualifies: true },
      { key: "pgs21-nib", fieldKey: "nib", sourceKey: "sailor-pgs21", scopeKey: "pgs21-current", locator: "21K medium bicolor and seven widths" },
      { key: "pgs21-fill", fieldKey: "fill_system", sourceKey: "sailor-pgs21", scopeKey: "pgs21-current", locator: "converter/cartridge field" },
      { key: "pgs21-material", fieldKey: "material", sourceKey: "sailor-pgs21", scopeKey: "pgs21-current", locator: "PMMA and Gold IP fields" },
      { key: "pgs21-dimensions", fieldKey: "dimensions", sourceKey: "sailor-pgs21", scopeKey: "pgs21-current", locator: "phi 17 by 124 mm including clip" },
      { key: "pgs21-weight", fieldKey: "weight", sourceKey: "sailor-pgs21", scopeKey: "pgs21-current", locator: "16.8 g" },
      { key: "pgs21-price", fieldKey: "price_range", sourceKey: "sailor-pgs21", scopeKey: "pgs21-current", locator: "JPY 66,000 regular and JPY 68,200 Z/MS" },
      { key: "pgs21-status", fieldKey: "status", sourceKey: "sailor-pgs21", scopeKey: "pgs21-current", locator: "live page retrieved 2026-07-19" },
    ],
  },
  media: [{
    key: "pgs21-factual-primary",
    title: "Professional Gear Slim 21 11-2151 事实卡（非产品照片）",
    sourceKey: "phase33-pgs21-factual",
    localPath: "/images/library/site-original/sailor-2026-current/sailor-pgs21-11-2151-factual.svg",
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "Fountain Pen Graph 本站原创事实图。只排版已核验的 11-2151 日期、21K 中型尖、124 mm 和边界；示意图，非 Sailor 产品照片，未复制官网图片，不含 Sailor logo、锚形商标或产品刻字，不表现真实比例、色泽、光泽或批次。",
    sourceUrl: "/images/library/site-original/sailor-2026-current/sailor-pgs21-11-2151-factual.svg",
    usageStatus: "primary",
  }],
  timeline: [{
    key: "pgs21-released",
    title: "Professional Gear Slim 21 11-2151 在日本发售",
    eventType: "model_released",
    startDate: "2026-03-14",
    circa: false,
    description: "日本官网所列 Gold Trim 11-2151 发售日。",
    sourceKey: "sailor-pgs21",
  }],
};

const realo18Pack: CuratedEntityPack = {
  key: "phase33-sailor-profit-realo18-11-1853-v1",
  entityId: PHASE33_PROFIT_REALO18_ID,
  expectedType: "pen",
  expectedSlug: "sailor-profit-realo-18",
  canonicalName: "Sailor Profit Realo 18",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sailor-profit-realo-18-publishable-content-2026-07-19.md",
  storyTitle: "Sailor Profit Realo 18：2026 年 1.5cc 换代款",
  primarySourceKey: "sailor-profit-realo18",
  depthTier: "A",
  aliases: [
    { alias: "Sailor Profit Realo 18", language: "en", sourceKey: "sailor-profit-realo18" },
    { alias: "Sailor 1911 Realo 18K", language: "en", sourceKey: "phase33-realo18-en" },
    { alias: "プロフィット レアロ 18", language: "ja", sourceKey: "sailor-profit-realo18" },
    { alias: "写乐 Profit Realo 18", language: "zh", sourceKey: "sailor-profit-realo18" },
  ],
  sources: [
    source("sailor-profit-realo18"), source("phase33-realo18-en"), source("phase33-realo18-intro"),
    source("phase33-realo-old"), source("phase33-pro-gear-realo"),
    source("sailor-care"), source("phase33-refill"),
    source("phase33-realo-retailer"), source("phase33-realo18-factual"),
  ],
  variants: [{
    key: "profit-realo18-black-11-1853",
    name: "Transparent Black（11-1853）",
    releaseYear: "2026-05-30",
    notes: "18K 大型尖；EF/F/MF/M/B/Z/MS 完整代码按 120/220/320/420/620/720/920，EF/MF/Z/MS 受注生产。",
    sourceKey: "sailor-profit-realo18",
    variantKind: "market_sku",
    productCode: "11-1853-120/220/320/420/620/720/920",
    market: "日本",
  }],
  scopes: [
    { key: "realo18-current", scopeKey: "sailor-profit-realo18-11-1853-current-2026-07-19", market: "日本", validFrom: "2026-05-30", productionState: "current", nibScope: "18K large EF/F/MF/M/B/Z/MS", materialScope: "transparent Black PMMA and Gold IP", editionScope: "11-1853 only" },
    { key: "realo18-change", scopeKey: "sailor-profit-realo18-model-change-and-compatibility", validFrom: "2026", productionState: "current", editionScope: "1.5cc two-part body; compatibility conditional" },
    { key: "realo18-old-boundary", scopeKey: "sailor-profit-realo-old-11-3924-boundary", productionState: "historical", editionScope: "old 21K/1cc generation only" },
    { key: "realo18-pg-boundary", scopeKey: "sailor-professional-gear-realo-11-3926-boundary", productionState: "current", editionScope: "separate flat-top family" },
    { key: "realo18-care", scopeKey: "sailor-realo-piston-care-current", productionState: "current", editionScope: "official Realo filling and cleaning" },
    { key: "realo18-retailer", scopeKey: "sailor-realo18-retailer-corroboration", market: "日本", productionState: "current", editionScope: "SKU corroboration only" },
    { key: "realo18-media", scopeKey: "sailor-realo18-factual-svg-2026-07-19", validFrom: RETRIEVED, productionState: "current", editionScope: "site-original factual SVG; not a product photo" },
  ],
  claims: [
    { key: "realo18-current-identity", predicate: "current_sku_identity", objectText: "11-1853 是 2026-05-30 上市的 Profit Realo 18：18K 大型七尖号、约 1.5cc 尾栓回转吸入、透明黑 PMMA、φ18×150.5 mm、26.3 g。", factClass: "core", confidence: 1, sourceKey: "sailor-profit-realo18", locator: "release date, item-code list and basic specifications", evidence: [{ key: "realo18-official-current", sourceKey: "sailor-profit-realo18", scopeKey: "realo18-current", locator: "11-1853 product page fields" }] },
    { key: "realo18-model-change", predicate: "model_change", objectText: "新笔身容量约 1.5cc，相对旧尾栓回转式约 1.0cc 提升约 1.5 倍，并改成可分离的两部件结构；握位互换仅限接口规格和尺寸一致的官方兼容对象。", factClass: "core", confidence: 0.99, sourceKey: "phase33-realo18-intro", locator: "capacity and two-part compatibility explanation", evidence: [{ key: "realo18-change", sourceKey: "phase33-realo18-intro", scopeKey: "realo18-change", locator: "1.5cc, prior 1.0cc, two parts and compatibility condition" }] },
    { key: "realo18-generation-boundaries", predicate: "identity_boundaries", objectText: "旧 Profit Realo 11-3924 是 21K／1cc／141 mm；Professional Gear Realo 11-3926 是另一平顶家族。两者均不继承 11-1853 的 18K、1.5cc、150.5 mm 与发售日期。", factClass: "core", confidence: 0.99, sourceKey: "phase33-realo-old", locator: "old and sibling product specifications", evidence: [
      { key: "realo18-old", sourceKey: "phase33-realo-old", scopeKey: "realo18-old-boundary", locator: "11-3924 21K, 1cc, 141 mm, 21.4 g and sell-through status" },
      { key: "realo18-pg", sourceKey: "phase33-pro-gear-realo", scopeKey: "realo18-pg-boundary", locator: "11-3926 Professional Gear Realo, 21K, 1cc, 135 mm" },
    ] },
    { key: "realo18-retailer-corroboration", predicate: "independent_sku_corroboration", objectText: "日本专业零售目录独立列出 11-1853 的七个尖号代码；只用于交叉确认型号与尾码，规格与代际仍以 Sailor 官网为准。", factClass: "core", confidence: 0.9, sourceKey: "phase33-realo-retailer", locator: "complete product-specific SKU list", evidence: [{ key: "realo18-retailer", sourceKey: "phase33-realo-retailer", scopeKey: "realo18-retailer", locator: "11-1853-120/220/320/420/620/720/920" }] },
    { key: "realo18-care-guidance", predicate: "maintenance_guidance", objectText: "尾栓缓慢回转吸墨；清洗时反复吸排清水，不把整支笔或尾栓浸水，不使用墨囊或上墨器，也不自行拆解活塞。", factClass: "core", confidence: 0.98, sourceKey: "sailor-care", locator: "official Realo cleaning section", evidence: [
      { key: "realo18-cleaning", sourceKey: "sailor-care", scopeKey: "realo18-care", locator: "expel ink, draw/expel water repeatedly and immersion cautions" },
      { key: "realo18-refill", sourceKey: "phase33-refill", scopeKey: "realo18-care", locator: "tail-knob filling and cartridge/converter prohibition" },
    ] },
    { key: "realo18-media-boundary", predicate: "media_identity_boundary", objectText: "主图是本站原创事实卡，不是产品照片，不含 Sailor logo、锚形商标或产品刻字，不证明实物透明度、色泽、比例或批次。", factClass: "editorial", confidence: 1, sourceKey: "phase33-realo18-factual", locator: "site-original factual SVG provenance", evidence: [{ key: "realo18-media", sourceKey: "phase33-realo18-factual", scopeKey: "realo18-media", locator: "product-photo=false and identity disclaimers" }] },
  ],
  spec: {
    brandEntityId: PHASE33_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor Profit Realo 18（11-1853）", release_year: "2026-05-30",
      origin_country: "日本品牌；本页未用产品页外推具体制造工厂",
      nib: "18K 大型金尖；EF、F、MF、M、B、Z、MS",
      fill_system: "尾栓回转吸入式，约 1.5cc；不可使用墨囊或上墨器",
      material: "透明黑色 PMMA；金属部件为 Gold IP",
      dimensions: "最大径 φ18 mm × 全长 150.5 mm（含笔夹）", weight: "26.3 g",
      price_range: "日本官网 2026-07-19 快照：EF/F/MF/M/B 为 ¥66,000；Z/MS 为 ¥68,200",
      status: "日本官网当前商品页可见；EF/MF/Z/MS 为受注生产",
    },
    evidence: [
      { key: "realo18-brand", fieldKey: "brand_entity_id", sourceKey: "sailor-profit-realo18", scopeKey: "realo18-current", locator: "official Sailor product page" },
      { key: "realo18-series", fieldKey: "series_name", sourceKey: "sailor-profit-realo18", scopeKey: "realo18-current", locator: "product title and 11-1853 codes" },
      { key: "realo18-release", fieldKey: "release_year", sourceKey: "sailor-profit-realo18", scopeKey: "realo18-current", locator: "2026-05-30 release field" },
      { key: "realo18-origin", fieldKey: "origin_country", sourceKey: "sailor-profit-realo18", scopeKey: "realo18-current", locator: "Japanese official product page; no factory inference", qualifies: true },
      { key: "realo18-nib", fieldKey: "nib", sourceKey: "sailor-profit-realo18", scopeKey: "realo18-current", locator: "18K large and seven widths" },
      { key: "realo18-fill", fieldKey: "fill_system", sourceKey: "sailor-profit-realo18", scopeKey: "realo18-current", locator: "tail-knob piston and approximately 1.5cc" },
      { key: "realo18-material", fieldKey: "material", sourceKey: "sailor-profit-realo18", scopeKey: "realo18-current", locator: "transparent Black PMMA and Gold IP" },
      { key: "realo18-dimensions", fieldKey: "dimensions", sourceKey: "sailor-profit-realo18", scopeKey: "realo18-current", locator: "phi 18 by 150.5 mm including clip" },
      { key: "realo18-weight", fieldKey: "weight", sourceKey: "sailor-profit-realo18", scopeKey: "realo18-current", locator: "26.3 g" },
      { key: "realo18-price", fieldKey: "price_range", sourceKey: "sailor-profit-realo18", scopeKey: "realo18-current", locator: "JPY 66,000 regular and JPY 68,200 Z/MS" },
      { key: "realo18-status", fieldKey: "status", sourceKey: "sailor-profit-realo18", scopeKey: "realo18-current", locator: "live page and made-to-order note retrieved 2026-07-19" },
    ],
  },
  media: [{ key: "realo18-factual-primary", title: "Profit Realo 18 11-1853 事实卡（非产品照片）", sourceKey: "phase33-realo18-factual", localPath: "/images/library/site-original/sailor-2026-current/sailor-profit-realo-18-factual.svg", author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创事实图。只排版已核验的 18K 大型尖、约 1.5cc、150.5 mm 与代际边界；示意图，非 Sailor 产品照片，未复制官网图片，不含 Sailor logo、锚形商标或产品刻字，不表现真实比例、透明度、色泽、光泽或批次。", sourceUrl: "/images/library/site-original/sailor-2026-current/sailor-profit-realo-18-factual.svg", usageStatus: "primary" }],
  timeline: [{ key: "realo18-released", title: "Profit Realo 18 11-1853 在日本发售", eventType: "model_released", startDate: "2026-05-30", circa: false, description: "日本官网所列 2026 换代款发售日。", sourceKey: "sailor-profit-realo18" }],
};

const anchorPack: CuratedEntityPack = {
  key: "phase33-sailor-professional-gear-anchor-v1",
  entityId: PHASE33_ANCHOR_ID,
  expectedType: "pen",
  expectedSlug: "sailor-professional-gear-anchor",
  canonicalName: "Sailor Professional Gear Anchor",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sailor-professional-gear-anchor-publishable-content-2026-07-19.md",
  storyTitle: "Sailor Professional Gear Anchor：三组饰件共用的新笔身",
  primarySourceKey: "phase33-anchor-gold",
  depthTier: "A",
  aliases: [
    { alias: "Sailor Professional Gear Anchor", language: "en", sourceKey: "phase33-anchor-release" },
    { alias: "Sailor Pro Gear Anchor", language: "en", sourceKey: "phase33-anchor-release" },
    { alias: "プロフェッショナルギア アンカー", language: "ja", sourceKey: "phase33-anchor-release" },
    { alias: "写乐 Professional Gear Anchor", language: "zh", sourceKey: "phase33-anchor-release" },
  ],
  sources: [
    source("phase33-anchor-gold"), source("phase33-anchor-silver"), source("phase33-anchor-black"),
    source("phase33-anchor-release"), source("phase31-pro-gear-gold"), source("sailor-care"),
    source("phase33-refill"), source("phase33-anchor-retailer"), source("phase33-anchor-factual"),
  ],
  variants: [
    { key: "anchor-gold-11-5080", name: "Gold Trim（11-5080）", releaseYear: "2025-12-13", notes: "21K 大型双色；黄铜大先和金属部件为 Gold IP。", sourceKey: "phase33-anchor-gold", variantKind: "market_sku", productCode: "11-5080-140/240/340/440/640/740/940", market: "日本" },
    { key: "anchor-silver-11-5081", name: "Silver Trim（11-5081）", releaseYear: "2025-12-13", notes: "21K 大型双色；黄铜大先和金属部件为 nickel chrome plating。", sourceKey: "phase33-anchor-silver", variantKind: "market_sku", productCode: "11-5081-140/240/340/440/640/740/940", market: "日本" },
    { key: "anchor-black-11-5082", name: "Black Trim（11-5082）", releaseYear: "2025-12-13", notes: "21K 大型 Black IP；黄铜大先和金属部件为 Black IP，帽顶装饰金属部分例外为 nickel chrome。", sourceKey: "phase33-anchor-black", variantKind: "market_sku", productCode: "11-5082-140/240/340/440/640/740/940", market: "日本" },
  ],
  scopes: [
    { key: "anchor-current", scopeKey: "sailor-professional-gear-anchor-current-2026-07-19", market: "日本", validFrom: "2025-12-13", productionState: "current", nibScope: "21K large EF/F/MF/M/B/Z/MS", materialScope: "transparent Dawn Blue PMMA and brass section", editionScope: "11-5080/5081/5082" },
    { key: "anchor-design", scopeKey: "sailor-anchor-new-body-2025", validFrom: "2025-12-03", productionState: "current", editionScope: "new cap top, barrel end, cap ring and sharper longer silhouette" },
    { key: "anchor-boundary", scopeKey: "sailor-anchor-versus-standard-professional-gear", productionState: "current", editionScope: "separate model, not a colourway" },
    { key: "anchor-care", scopeKey: "sailor-cartridge-converter-care-current", productionState: "current", editionScope: "generic Sailor cartridge/converter care" },
    { key: "anchor-retailer", scopeKey: "sailor-anchor-retailer-corroboration", market: "日本", productionState: "current", editionScope: "SKU corroboration only" },
    { key: "anchor-media", scopeKey: "sailor-anchor-factual-svg-2026-07-19", validFrom: RETRIEVED, productionState: "current", editionScope: "site-original factual SVG; not a product photo" },
  ],
  claims: [
    { key: "anchor-current-identity", predicate: "current_sku_identity", objectText: "Professional Gear Anchor 于 2025-12-13 上市；11-5080／5081／5082 共用 21K 大型尖、两用式、透明黎明蓝 PMMA、黄铜大先、φ16×132.7 mm 与 30 g。", factClass: "core", confidence: 1, sourceKey: "phase33-anchor-release", locator: "release date and three trim specifications", evidence: [
      { key: "anchor-gold", sourceKey: "phase33-anchor-gold", scopeKey: "anchor-current", locator: "11-5080 product page" },
      { key: "anchor-silver", sourceKey: "phase33-anchor-silver", scopeKey: "anchor-current", locator: "11-5081 product page" },
      { key: "anchor-black", sourceKey: "phase33-anchor-black", scopeKey: "anchor-current", locator: "11-5082 product page" },
    ] },
    { key: "anchor-new-body", predicate: "design_identity", objectText: "Anchor 使用新帽顶、尾端、帽环与更长少圆弧的轮廓；黄铜大先形成不同于普通 Pro Gear 的 30 g 新笔身，不能降格为配色。", factClass: "core", confidence: 0.99, sourceKey: "phase33-anchor-release", locator: "new components, silhouette comparison and brass-section explanation", evidence: [{ key: "anchor-design", sourceKey: "phase33-anchor-release", scopeKey: "anchor-design", locator: "press release pages 1-2 body comparison and brass section" }, { key: "anchor-standard-boundary", sourceKey: "phase31-pro-gear-gold", scopeKey: "anchor-boundary", locator: "standard 11-2036 129 mm, 21.6 g and PMMA section" }] },
    { key: "anchor-trim-boundaries", predicate: "variant_boundaries", objectText: "Gold 11-5080 为双色尖／Gold IP，Silver 11-5081 为双色尖／nickel chrome，Black 11-5082 为 Black IP 尖与大先；黑饰款帽顶金属部分另为 nickel chrome。", factClass: "core", confidence: 1, sourceKey: "phase33-anchor-release", locator: "three trim product specifications and cap-top exception", evidence: [
      { key: "anchor-gold-trim", sourceKey: "phase33-anchor-gold", scopeKey: "anchor-current", locator: "Gold IP nib/section/metal fields" },
      { key: "anchor-silver-trim", sourceKey: "phase33-anchor-silver", scopeKey: "anchor-current", locator: "nickel chrome fields" },
      { key: "anchor-black-trim", sourceKey: "phase33-anchor-release", scopeKey: "anchor-current", locator: "Black IP fields and cap-top nickel-chrome note" },
    ] },
    { key: "anchor-retailer-corroboration", predicate: "independent_sku_corroboration", objectText: "日本专业零售目录独立列出三条饰件和完整尖号代码，可交叉确认市场 SKU；结构与规格仍以官方产品页和新闻稿为准。", factClass: "core", confidence: 0.9, sourceKey: "phase33-anchor-retailer", locator: "three trim groups and complete item-code lists", evidence: [{ key: "anchor-retailer", sourceKey: "phase33-anchor-retailer", scopeKey: "anchor-retailer", locator: "11-5080/5081/5082 code groups, size and weight" }] },
    { key: "anchor-care-guidance", predicate: "maintenance_guidance", objectText: "使用 Sailor 墨囊或上墨器；以清水借上墨器反复吸排约五至六次，避免酒精、热水、研磨剂和自行拆卸黄铜大先、笔尖或帽顶。", factClass: "core", confidence: 0.98, sourceKey: "sailor-care", locator: "official converter cleaning steps", evidence: [{ key: "anchor-cleaning", sourceKey: "sailor-care", scopeKey: "anchor-care", locator: "draw and expel clean water five to six times" }, { key: "anchor-refill", sourceKey: "phase33-refill", scopeKey: "anchor-care", locator: "official converter filling steps" }] },
    { key: "anchor-media-boundary", predicate: "media_identity_boundary", objectText: "主图是本站原创事实卡，不是产品照片；不含 Sailor logo、锚形商标或产品刻字，不证明黎明蓝实物色泽、比例或批次。", factClass: "editorial", confidence: 1, sourceKey: "phase33-anchor-factual", locator: "site-original factual SVG provenance", evidence: [{ key: "anchor-media", sourceKey: "phase33-anchor-factual", scopeKey: "anchor-media", locator: "product-photo=false and identity disclaimers" }] },
  ],
  spec: {
    brandEntityId: PHASE33_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor Professional Gear Anchor（11-5080／11-5081／11-5082）",
      release_year: "2025-12-13", origin_country: "日本品牌；本页未用产品页外推具体制造工厂",
      nib: "21K 大型金尖；Gold/Silver 为双色，Black 为 Black IP；EF、F、MF、M、B、Z、MS",
      fill_system: "Sailor 墨囊／上墨器两用式",
      material: "透明黎明蓝 PMMA 笔帽与笔杆；黄铜大先；饰件按 Gold IP、nickel chrome、Black IP 分列",
      dimensions: "最大径 φ16 mm × 全长 132.7 mm（含笔夹）", weight: "30.0 g",
      price_range: "日本官网 2026-07-19 快照：EF/F/MF/M/B 为 ¥88,000；Z/MS 为 ¥90,200",
      status: "日本官网当前商品页可见；EF/MF/Z/MS 为受注生产",
    },
    evidence: [
      { key: "anchor-brand", fieldKey: "brand_entity_id", sourceKey: "phase33-anchor-gold", scopeKey: "anchor-current", locator: "official Sailor product page" },
      { key: "anchor-series", fieldKey: "series_name", sourceKey: "phase33-anchor-release", scopeKey: "anchor-current", locator: "family name and three trim variants" },
      { key: "anchor-release", fieldKey: "release_year", sourceKey: "phase33-anchor-release", scopeKey: "anchor-current", locator: "2025-12-13 nationwide release" },
      { key: "anchor-origin", fieldKey: "origin_country", sourceKey: "phase33-anchor-gold", scopeKey: "anchor-current", locator: "Japanese official product page; no factory inference", qualifies: true },
      { key: "anchor-nib", fieldKey: "nib", sourceKey: "phase33-anchor-release", scopeKey: "anchor-current", locator: "21K large bicolor/Black IP and width list" },
      { key: "anchor-fill", fieldKey: "fill_system", sourceKey: "phase33-anchor-gold", scopeKey: "anchor-current", locator: "converter/cartridge field" },
      { key: "anchor-material-gold", fieldKey: "material", sourceKey: "phase33-anchor-gold", scopeKey: "anchor-current", locator: "PMMA, brass and Gold IP fields" },
      { key: "anchor-material-silver", fieldKey: "material", sourceKey: "phase33-anchor-silver", scopeKey: "anchor-current", locator: "brass and nickel chrome fields" },
      { key: "anchor-material-black", fieldKey: "material", sourceKey: "phase33-anchor-black", scopeKey: "anchor-current", locator: "brass and Black IP fields" },
      { key: "anchor-dimensions", fieldKey: "dimensions", sourceKey: "phase33-anchor-gold", scopeKey: "anchor-current", locator: "phi 16 by 132.7 mm including clip" },
      { key: "anchor-weight", fieldKey: "weight", sourceKey: "phase33-anchor-gold", scopeKey: "anchor-current", locator: "30.0 g" },
      { key: "anchor-price", fieldKey: "price_range", sourceKey: "phase33-anchor-gold", scopeKey: "anchor-current", locator: "JPY 88,000 regular and JPY 90,200 Z/MS" },
      { key: "anchor-status", fieldKey: "status", sourceKey: "phase33-anchor-gold", scopeKey: "anchor-current", locator: "live product pages and made-to-order note retrieved 2026-07-19" },
    ],
  },
  media: [{ key: "anchor-factual-primary", title: "Professional Gear Anchor 三组饰件事实卡（非产品照片）", sourceKey: "phase33-anchor-factual", localPath: "/images/library/site-original/sailor-2026-current/sailor-professional-gear-anchor-factual.svg", author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创事实图。只排版已核验的 11-5080／5081／5082、新笔身、黄铜大先、132.7 mm 和 30 g；示意图，非 Sailor 产品照片，未复制官网图片，不含 Sailor logo、锚形商标或产品刻字，不表现真实黎明蓝、比例、光泽或批次。", sourceUrl: "/images/library/site-original/sailor-2026-current/sailor-professional-gear-anchor-factual.svg", usageStatus: "primary" }],
  timeline: [
    { key: "anchor-announced", title: "Professional Gear Anchor 正式公布", eventType: "design_milestone", startDate: "2025-12-03", circa: false, description: "Sailor 发布新闻稿，公布新笔身与三条饰件路线。", sourceKey: "phase33-anchor-release" },
    { key: "anchor-released", title: "Professional Gear Anchor 在日本发售", eventType: "model_released", startDate: "2025-12-13", circa: false, description: "官方新闻稿和产品页所列日本全国发售日。", sourceKey: "phase33-anchor-release" },
  ],
};

const sailorBrandPack = phase31SailorP0Packs[0];
if (!sailorBrandPack || sailorBrandPack.entityId !== PHASE33_SAILOR_BRAND_ID) {
  throw new Error("Phase 33 cannot resolve the canonical Phase 31 Sailor brand pack.");
}

export const phase33Sailor2026CurrentPacks: CuratedEntityPack[] = [
  sailorBrandPack,
  pgs21Pack,
  realo18Pack,
  anchorPack,
];
