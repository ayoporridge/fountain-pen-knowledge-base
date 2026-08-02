import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE371_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE371_FAIRY_TALES_ID = "phase371-sailor-shikiori-japanese-fairy-tales-11227";
export const PHASE371_FAIRY_TALES_SLUG = "sailor-shikiori-japanese-fairy-tales";

const RETRIEVED = "2026-08-03";
const SCOPE = "phase371-sailor-shikiori-japanese-fairy-tales-11227";

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
  const registryKey = input.registryKey ?? `sailor-phase371-${sourceType}`;
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
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }],
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
  officialEn: source({
    key: "phase371-sailor-fairy-tales-official-en",
    title: "SHIKIORI Japanese Fairy Tales Fountain Pen — 11-1227",
    url: "https://en.sailor.co.jp/product/11-1227/",
    summary:
      "Sailor 英文官网确认 Japanese Fairy Tales 主题、四个颜色 SKU、14K Gold with Gold plating、C/C、PMMA、φ17×124 mm 和 16.8 g。",
    locator: "product details, story theme, item codes, nib, filling, material, size and weight",
  }),
  officialJp: source({
    key: "phase371-sailor-fairy-tales-official-jp",
    title: "SHIKIORI―四季織― おとぎばなし 万年筆 — 11-1227",
    url: "https://sailor.co.jp/product/11-1227/",
    summary:
      "Sailor 日本官网确认日文故事名、当前 ¥44,000、四个代码、14K 中型、C/C、PMMA、Gold IP、φ17×124 mm、16.8 g 和 PG-03W 包装。",
    locator: "price, Japanese story names, item codes, specifications and packaging",
    registryKey: "sailor-official-japan-phase371",
  }),
  archive: source({
    key: "phase371-sailor-fairy-tales-price-archive",
    title: "Sailor 2022 product price change PDF — 11-1227",
    url: "https://sailor.co.jp/wp-content/uploads/2022/06/product-price-change_2022.pdf",
    summary:
      "Sailor 官方 2022 价格调整资料列出 11-1227 おとぎばなし及其旧价／新价，用作历史价格窗口，不推断精确首发日。",
    locator: "price-change list entry for model number 11-1227",
    tier: "contemporary_archive",
    registryKey: "sailor-official-archive-phase371",
  }),
  collection: source({
    key: "phase371-sailor-shikiori-collection",
    title: "SHIKIORI 四季織 Collections and price list",
    url: "https://shikiori.sailor.co.jp/collections/",
    summary:
      "SHIKIORI 官方系列站把 おとぎばなし列为独立系列，并在价格表中单列 14K／中细；用于与野山の唄、雪月空葉等相邻系列做身份边界。",
    locator: "collections description, price list and product boundary",
    registryKey: "sailor-shikiori-official-phase371",
    registryName: "SHIKIORI official website",
    homepageUrl: "https://shikiori.sailor.co.jp/",
  }),
  refill: source({
    key: "phase371-sailor-refill",
    title: "万年筆のインク補充方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-refill-ink/",
    summary:
      "官方补墨页用于墨囊／转换器装卸、吸排和换色排空边界，不把 11-1227 误写成活塞或真空系统。",
    locator: "cartridge and converter filling instructions",
    registryKey: "sailor-official-care-phase371",
  }),
  care: source({
    key: "phase371-sailor-care",
    title: "万年筆のお手入れ方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-maintenance/",
    summary:
      "官方维护页用于清水冲洗、避免整笔浸没和保存建议，不把清洗建议扩大成树脂与镀层的无限耐受承诺。",
    locator: "cleaning, storage and maintenance instructions",
    registryKey: "sailor-official-care-phase371",
  }),
  retailer: source({
    key: "phase371-sailor-fairy-tales-retailer",
    title: "Sailor SHIKIORI おとぎばなし 11-1227 — Pen House",
    url: "https://www.pen-house.net/item/43486.html",
    summary:
      "Pen House 专业零售页面以 11-1227 列出四个故事色和 14K 中细中型尖，用于市场身份交叉核对；规格主张仍以 Sailor 官方页为准。",
    locator: "11-1227 four-color listing and nib identity",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "pen-house-phase371",
    registryName: "Pen House",
    homepageUrl: "https://www.pen-house.net/",
    author: "Pen House",
  }),
  diagram: source({
    key: "phase371-sailor-fairy-tales-svg",
    title: "Sailor SHIKIORI おとぎばなし 11-1227 factual identity card",
    url: "/images/library/site-original/phase371/sailor/shikiori-japanese-fairy-tales-11227.svg",
    summary:
      "本站原创 factual SVG，表达四个故事色 SKU 和共同规格边界，不是产品照片、Logo、比例图或颜色校样。",
    locator: "site-original factual SVG metadata",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase371",
  }),
} as const;

const model: CuratedEntityPack = {
  key: "phase371-sailor-shikiori-japanese-fairy-tales-11227-v1",
  entityId: PHASE371_FAIRY_TALES_ID,
  expectedType: "pen",
  expectedSlug: PHASE371_FAIRY_TALES_SLUG,
  canonicalName: "写乐 Sailor SHIKIORI おとぎばなし（11-1227）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sailor-shikiori-japanese-fairy-tales-11227-phase371.md",
  storyTitle: "写乐 Sailor SHIKIORI おとぎばなし 11-1227：四个童话场景的 14K 中细笔",
  primarySourceKey: S.officialJp.key,
  depthTier: "A",
  aliases: [
    { alias: "Sailor SHIKIORI Japanese Fairy Tales", language: "en", sourceKey: S.officialEn.key },
    { alias: "Sailor Shikiori Otogi-banashi", language: "en", sourceKey: S.officialEn.key },
    { alias: "11-1227", language: "en", sourceKey: S.officialEn.key },
    { alias: "11-1227-301", language: "en", sourceKey: S.officialEn.key, kind: "regional_name", market: "Dragon Palace" },
    { alias: "11-1227-302", language: "en", sourceKey: S.officialEn.key, kind: "regional_name", market: "Vega" },
    { alias: "11-1227-303", language: "en", sourceKey: S.officialEn.key, kind: "regional_name", market: "Princess Kaguya" },
    { alias: "11-1227-304", language: "en", sourceKey: S.officialEn.key, kind: "regional_name", market: "Grateful Crane" },
    { alias: "SHIKIORI おとぎばなし", language: "ja", sourceKey: S.officialJp.key },
    { alias: "写乐 四季織 童话", language: "zh", sourceKey: S.officialJp.key },
  ],
  sources: [S.officialEn, S.officialJp, S.archive, S.collection, S.refill, S.care, S.retailer, S.diagram],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Sailor Japan official product page",
      productionState: "current",
      nibScope: "14K gold, standard-size nib, MF across four 11-1227 color SKUs",
      materialScope: "PMMA resin cap/barrel/section; gold IP metal parts",
      editionScope: "SHIKIORI Japanese Fairy Tales / おとぎばなし, 11-1227-301 through 304",
    },
    {
      key: "phase371-fairy-tales-archive-boundary",
      scopeKey: "phase371-fairy-tales-archive-boundary",
      productionState: "historical",
      editionScope: "2022 official price-change window; no exact launch date inferred",
    },
    {
      key: "phase371-fairy-tales-media-boundary",
      scopeKey: "phase371-fairy-tales-media-boundary",
      productionState: "current",
      editionScope: "site-original factual SVG; no product photo or color proof",
    },
  ],
  claims: [
    claim(
      "phase371-fairy-tales-identity",
      "model_identity",
      "11-1227 是 Sailor SHIKIORI おとぎばなし／Japanese Fairy Tales 的共同主型号，四个完整颜色 SKU 为 11-1227-301、302、303、304。",
      S.officialJp.key,
      "Japanese product title and item-code table",
    ),
    claim(
      "phase371-fairy-tales-retailer-identity",
      "market_listing",
      "Pen House 将 11-1227 列为四个故事色的同一商品组并标注 14K 中细中型尖，用于市场身份交叉核对；经销商页面不覆盖官网规格。",
      S.retailer.key,
      "professional retailer four-color listing",
    ),
    claim(
      "phase371-fairy-tales-theme",
      "design_theme",
      "おとぎばなし从代代相传的故事和故事发生的季节场景获得灵感；主题是设计语境，不是文物复刻或产地证明。",
      S.officialEn.key,
      "Japanese Fairy Tales description and SHIKIORI context",
    ),
    claim(
      "phase371-fairy-tales-nib",
      "nib",
      "四个颜色共同采用 14K 金中型 MF（中细）尖；不能把颜色 SKU 误写成钢尖或 21K 尖。",
      S.officialEn.key,
      "nib and item-code fields",
    ),
    claim(
      "phase371-fairy-tales-filling",
      "filling_system",
      "采用墨囊／转换器两用式，不是 Realo 活塞、真空或滴入式大容量系统。",
      S.refill.key,
      "official cartridge and converter instructions",
    ),
    claim(
      "phase371-fairy-tales-material",
      "material",
      "盖、杆和大先为 PMMA 树脂，金属部件为 Gold IP 处理；Gold IP 是表面处理名称，不等于整支笔为黄金。",
      S.officialJp.key,
      "PMMA and gold IP fields",
    ),
    claim(
      "phase371-fairy-tales-size",
      "physical_specification",
      "官方给出最大径 φ17 mm、含笔夹全长 124 mm、空笔重量 16.8 g；不把装墨重量或插帽重心混入字段。",
      S.officialEn.key,
      "size and weight fields",
    ),
    claim(
      "phase371-fairy-tales-price",
      "market_status",
      "日本官方当前产品页显示 ¥44,000（本体 ¥40,000）；价格与库存按读取市场和日期，不外推全球统一售价。",
      S.officialJp.key,
      "current Japanese price and market notice",
    ),
    claim(
      "phase371-fairy-tales-history",
      "historical_boundary",
      "官方 2022 价格调整资料已经列出 11-1227；它确认历史价格窗口中的独立型号，不足以证明精确首发日。",
      S.archive.key,
      "2022 price-change list entry",
    ),
    claim(
      "phase371-fairy-tales-sibling-boundary",
      "sibling_boundary",
      "おとぎばなし与野山の唄、雪月空葉等同属 SHIKIORI，却拥有独立代码、故事／自然主题和价格时间层，不能相互替换。",
      S.collection.key,
      "official SHIKIORI collection boundary",
    ),
    claim(
      "phase371-fairy-tales-care",
      "maintenance_guidance",
      "换色时排空墨囊或转换器，以室温清水吸排；不要整笔浸泡、用热水、酒精或强溶剂，异常时停止强拆并寻求服务。",
      S.care.key,
      "official cleaning and storage guidance",
      "editorial",
    ),
    claim(
      "phase371-fairy-tales-selection",
      "selection_guidance",
      "选购应核对 11-1227-30x 完整代码、14K 中型 MF、C/C、PMMA、Gold IP、φ17×124 mm、16.8 g 和 PG-03W；只写 Shikiori 童话不足以确认颜色。",
      S.officialJp.key,
      "code, nib, filling, material, dimensions, weight and package fields",
      "editorial",
    ),
    claim(
      "phase371-fairy-tales-media",
      "media_identity_boundary",
      "主图是本站原创四故事色事实 SVG，不复制 Sailor 产品照片或 Logo，也不证明实物颜色、比例、批次和耐光性。",
      S.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    { key: "phase371-fairy-tales-dragon-palace", name: "竜宮城 Dragon Palace", notes: "11-1227-301，14K 中型 MF。", sourceKey: S.officialJp.key, variantKind: "color", productCode: "11-1227-301", market: "日本" },
    { key: "phase371-fairy-tales-vega", name: "織姫 Vega", notes: "11-1227-302，14K 中型 MF。", sourceKey: S.officialJp.key, variantKind: "color", productCode: "11-1227-302", market: "日本" },
    { key: "phase371-fairy-tales-kaguya", name: "かぐや姫 Princess Kaguya", notes: "11-1227-303，14K 中型 MF。", sourceKey: S.officialJp.key, variantKind: "color", productCode: "11-1227-303", market: "日本" },
    { key: "phase371-fairy-tales-grateful-crane", name: "機織り鶴 Grateful Crane", notes: "11-1227-304，14K 中型 MF。", sourceKey: S.officialJp.key, variantKind: "color", productCode: "11-1227-304", market: "日本" },
  ],
  spec: {
    brandEntityId: PHASE371_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor SHIKIORI おとぎばなし（Japanese Fairy Tales）11-1227",
      release_year: "现行日本官网产品页；2022 官方价格调整资料已列 11-1227，不外推首发日",
      origin_country: "日本品牌；不外推具体工厂",
      nib: "14K 金／中型 MF（中细）",
      fill_system: "墨囊／转换器两用式（cartridge/converter）",
      material: "盖、杆、大先为 PMMA 树脂；金属部件为 Gold IP 处理",
      dimensions: "φ17 × 124 mm（含笔夹）",
      weight: "16.8 g",
      price_range: "日本官方当前页面 ¥44,000（本体 ¥40,000）",
      status: "日本官网现行；11-1227-301 至 304 四个 MF 颜色 SKU",
    },
    evidence: [
      evidence("phase371-fairy-tales-brand", "brand_entity_id", S.officialJp.key, "official Sailor product page"),
      evidence("phase371-fairy-tales-series", "series_name", S.officialJp.key, "product title and 11-1227 code"),
      evidence("phase371-fairy-tales-release", "release_year", S.archive.key, "2022 official price-change window"),
      evidence("phase371-fairy-tales-origin", "origin_country", S.officialJp.key, "Sailor Japan official context"),
      evidence("phase371-fairy-tales-nib-field", "nib", S.officialEn.key, "14K standard MF"),
      evidence("phase371-fairy-tales-fill-field", "fill_system", S.refill.key, "cartridge and converter instructions"),
      evidence("phase371-fairy-tales-material-field", "material", S.officialJp.key, "PMMA and Gold IP fields"),
      evidence("phase371-fairy-tales-dimensions", "dimensions", S.officialEn.key, "φ17×124 mm"),
      evidence("phase371-fairy-tales-weight", "weight", S.officialEn.key, "16.8 g"),
      evidence("phase371-fairy-tales-price", "price_range", S.officialJp.key, "¥44,000 current Japanese price"),
      evidence("phase371-fairy-tales-status", "status", S.officialJp.key, "current product page and four-SKU status"),
    ],
  },
  media: [
    {
      key: "phase371-fairy-tales-primary-media",
      title: "SHIKIORI おとぎばなし 11-1227 四故事色事实卡（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: S.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样。",
      sourceUrl: S.diagram.url,
      usageStatus: "primary",
    },
  ],
};

export const phase371SailorShikioriJapaneseFairyTalesPacks: CuratedEntityPack[] = [model];
