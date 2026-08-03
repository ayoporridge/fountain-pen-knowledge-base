import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE107_WANCHER_ID,
  phase107WancherBrandPack,
} from "./phase107-wancher-dream-pen-true-ebonite-matte-black";

export const PHASE389_WANCHER_BRAND_ID = PHASE107_WANCHER_ID;
export const PHASE389_TWIN_DRAGONS_BLACK_ID =
  "phase389-pen-wancher-tsuikin-twin-dragons-black-urushi";
export const PHASE389_TWIN_DRAGONS_BLACK_SLUG =
  "wancher-tsuikin-twin-dragons-black-urushi";
export const PHASE389_TWIN_DRAGONS_BLACK_NAME =
  "Wancher Dream Pen Ryukyu Tsuikin – Twin Dragons Black Urushi";

const RETRIEVED = "2026-08-03";
const SCOPE = "phase389-wancher-tsuikin-twin-dragons-black-current";
const SVG_PATH =
  "/images/library/site-original/phase389/wancher/tsuikin-twin-dragons-black-urushi.svg";
const PRODUCT =
  "https://www.wancherpen.com/products/tsuikin-twin-dragons-black-urushi";
const COLLECTION =
  "https://www.wancherpen.com/collections/dream-pen-ryukyu-tsuikin";
const DREAM = "https://www.wancherpen.com/collections/dream-pen";
const CARE = "https://www.wancherpen.com/pages/product-care";
const MUSEUM =
  "https://www.kyohaku.go.jp/eng/learn/home/dictio/senshoku/48koutei/";

function source(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  summary: string;
  locator: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup?: string;
  homepageUrl?: string;
  author?: string | null;
  allowedUse?: CuratedSource["allowedUse"];
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? "primary",
    independenceGroup: input.independenceGroup ?? input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl:
      input.homepageUrl ??
      (sourceType === "official" ? "https://www.wancherpen.com/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author: input.author ?? input.registryName,
    publishedAt: null,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: input.allowedUse ?? "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function siteOriginal(): CuratedSource {
  return {
    key: "phase389-wancher-twin-dragons-black-svg",
    registryKey: "fountain-pen-graph-editorial-phase389",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase389",
    title: "Wancher Twin Dragons Black Urushi factual identity card",
    url: SVG_PATH,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    publishedAt: null,
    retrievedAt: RETRIEVED,
    summary:
      "本站原创 factual SVG；表达黑漆、Ebonite、双龙堆锦、欧规 C/C 与尖材/feed 边界，非产品照片。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: SVG_PATH,
    archiveLocator:
      "project-public-asset:/images/library/site-original/phase389/wancher/tsuikin-twin-dragons-black-urushi.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900",
  };
}

const S = {
  product: source({
    key: "phase389-wancher-twin-dragons-black-product",
    title: "Tsuikin - Twin Dragons - Black Urushi — Wancher official",
    url: PRODUCT,
    registryKey: "wancher-official-twin-dragons-black-product-phase389",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-twin-dragons-black-phase389",
    summary:
      "官方具体商品页确认 Black Urushi 双龙 SKU、$1,000 USD 标价与当前 Sold out、Ebonite/Urushi/Tsuikin、双龙金铂粉、两类尖、三种 feed、欧规 C/C、气密帽、Type A/B 未解释下拉、包装和 Size & Shape 图片。",
    locator:
      "title, price/availability, Twin Dragons description, Specifications, Type selector, Size & Shape and Packaging sections",
  }),
  collection: source({
    key: "phase389-wancher-ryukyu-tsuikin-collection",
    title: "Dream Pen Ryukyu Tsuikin — Wancher collection",
    url: COLLECTION,
    registryKey: "wancher-official-ryukyu-tsuikin-collection-phase389",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-ryukyu-tsuikin-collection-phase389",
    summary:
      "官方集合页解释 2022 冲绳回归日本 50 周年纪念语境、琉球漆艺历史、Tsuikin 工艺及 Twin Dragons Black/Red/So-hari 三种产品边界。",
    locator: "Ryukyu history, Tsuikin process, Twin Dragons and adjacent product sections",
  }),
  dream: source({
    key: "phase389-wancher-dream-pen-collection",
    title: "Dream Pen Fountain Pen Collection — Wancher official",
    url: DREAM,
    registryKey: "wancher-official-dream-pen-collection-phase389",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-dream-pen-collection-phase389",
    summary:
      "官方 Dream Pen 集合页确认 Dream Pen 是跨材料、跨传统工艺的系列入口，不把系列宣传替代 Black Urushi 的具体规格。",
    locator: "Dream Pen introduction and material/craft family navigation",
  }),
  care: source({
    key: "phase389-wancher-product-care",
    title: "Product Care Guide — Wancher official",
    url: CARE,
    registryKey: "wancher-official-product-care-phase389",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-product-care-phase389",
    summary:
      "官方护理页给出 Urushi/Maki-e/Raden 避直射光、干燥和极端天气建议，并提醒 Ebonite 不要长时间浸泡、避免化学清洁剂。",
    locator: "Urushi/Maki-e/Raden and Ebonite care sections",
  }),
  museum: source({
    key: "phase389-kyoto-museum-imperial-dragons",
    title: "Imperial Dragons — Kyoto National Museum",
    url: MUSEUM,
    registryKey: "kyoto-national-museum-imperial-dragons-phase389",
    registryName: "Kyoto National Museum",
    tier: "professional_secondary",
    independenceGroup: "kyoto-national-museum-phase389",
    homepageUrl: "https://www.kyohaku.go.jp/",
    summary:
      "京都国立博物馆资料用于一般东亚龙纹视觉史背景，说明中国古代龙与帝王象征的关联；不把这一背景直接当作冲绳双龙的唯一传说或图像出处。",
    locator: "dragon character history, imperial symbolism and textile/art context",
  }),
  svg: siteOriginal(),
} as const;

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
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey,
    locator,
    evidence: [
      { key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator },
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

const baseBrand = structuredClone(phase107WancherBrandPack);
baseBrand.key = "phase389-wancher-brand-twin-dragons-black-navigation-v1";
baseBrand.sources = [...baseBrand.sources, ...Object.values(S)].filter(
  (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
);
baseBrand.scopes = [
  ...baseBrand.scopes,
  {
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope:
      "Wancher 品牌页新增 Dream Pen Ryukyu Tsuikin Twin Dragons Black Urushi 具体型号入口；Red Urushi、Black Sohari 与其它 Tsuikin 主题保持独立。",
  },
];
baseBrand.claims = [
  ...baseBrand.claims,
  claim(
    `${SCOPE}-brand-navigation`,
    "series_navigation",
    "Wancher 品牌页新增 Twin Dragons Black Urushi 具体型号入口；本条不把 Red Urushi、Black Sohari、Hibiscus、Shell Ginger、Bonsai 或 Kanhizakura 合并为同一型号。",
    S.product.key,
    "official Black Urushi title and Ryukyu Tsuikin product boundary",
  ),
];

const model: CuratedEntityPack = {
  key: `${PHASE389_TWIN_DRAGONS_BLACK_ID}-v1`,
  entityId: PHASE389_TWIN_DRAGONS_BLACK_ID,
  expectedType: "pen",
  expectedSlug: PHASE389_TWIN_DRAGONS_BLACK_SLUG,
  canonicalName: PHASE389_TWIN_DRAGONS_BLACK_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/wancher-tsuikin-twin-dragons-black-urushi-phase389.md",
  storyTitle: "Wancher Twin Dragons Black Urushi：黑漆底上的琉球堆锦双龙",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Tsuikin - Twin Dragons - Black Urushi", language: "en", sourceKey: S.product.key },
    { alias: "Dream Pen Ryukyu Tsuikin Twin Dragons Black Urushi", language: "en", sourceKey: S.collection.key },
    { alias: "堆錦・双竜・黒", language: "ja", sourceKey: S.collection.key },
    { alias: "Wancher Tsuikin Twin Dragons Black Urushi", language: "en", sourceKey: S.product.key },
    { alias: "万佳 Dream Pen 琉球堆锦双龙黑漆", language: "zh", sourceKey: S.product.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Wancher international current product and official collection/care references",
      nibScope: "#6 JoWo stainless steel、Wancher 18K gold；当前页面未公布固定尖幅",
      materialScope: "Ebonite、Urushi、Tsuikin Urushi；双龙 Tsuikin-mochi 混入真铂粉与金粉",
      editionScope: "Dream Pen Ryukyu Tsuikin Twin Dragons Black Urushi 具体 SKU；Red/Black Sohari 独立",
    },
    {
      key: `${SCOPE}-boundary`,
      scopeKey: `${SCOPE}-boundary`,
      productionState: "current",
      editionScope:
        "不继承 Red Urushi、Black Sohari、Hibiscus、Shell Ginger、Bonsai、Kanhizakura 或其它 Wancher 型号的尺寸、重量、尖材、feed、价格和媒体",
    },
  ],
  claims: [
    claim(
      `${SCOPE}-identity`,
      "model_identity",
      "Tsuikin - Twin Dragons - Black Urushi 是 Wancher 当前国际商品页的具体型号；Dream Pen 是系列入口，Ryukyu Tsuikin 是工艺路线，Black Urushi 是本条底色与 SKU 边界。",
      S.product.key,
      "official product title and collection position",
    ),
    claim(
      `${SCOPE}-availability`,
      "availability",
      "2026-08-03 检索时国际商品页显示 Sold out，并保留 $1,000 USD 标价；售罄是当前销售状态，不是停产或限量数量证明。",
      S.product.key,
      "current price and Sold out block retrieved 2026-08-03",
    ),
    claim(
      `${SCOPE}-motif`,
      "design_motif",
      "Wancher 称双龙是冲绳神话与民间故事中的吉祥生物，并与 Shisa 并列为文化象征；页面没有给出一则唯一传说或完整图像出处。",
      S.collection.key,
      "Twin Dragons description and Okinawan mythology statement",
    ),
    claim(
      `${SCOPE}-dragon-context`,
      "visual_history_context",
      "京都国立博物馆资料说明东亚龙纹在中国古代与帝王象征相连；本条仅用于一般视觉史背景，不把中国皇权含义直接等同为冲绳双龙意义。",
      S.museum.key,
      "Imperial dragon symbolism and textile/art context",
      "editorial",
    ),
    claim(
      `${SCOPE}-dragon-context-source`,
      "visual_history_source",
      "京都国立博物馆的龙纹条目提供一条独立的专业背景来源；它只支持龙纹视觉史的限定说明，不证明 Black Urushi 的具体图案出处。",
      S.museum.key,
      "Imperial Dragons museum dictionary entry",
    ),
    claim(
      `${SCOPE}-history`,
      "series_history",
      "Wancher 以 2022-05-15 冲绳回归日本 50 周年为推出 Ryukyu Tsuikin 的纪念语境，并简述琉球漆艺和王国历史；这不是 Black Urushi 的独立首发年份证明。",
      S.collection.key,
      "2022 anniversary, Okinawa history and Ryukyu lacquer history sections",
    ),
    claim(
      `${SCOPE}-tsuikin-process`,
      "craft_process",
      "官方工艺说明包括把颜料揉进漆制成 Tsuikin-mochi、擀薄、切图、贴附、刻线和最后着色；没有据此臆测本支笔工期、漆层数量或配方。",
      S.product.key,
      "How Tsuikin art was made section",
    ),
    claim(
      `${SCOPE}-material`,
      "material_and_art",
      "Black Urushi 具体规格为 Ebonite、Urushi、Tsuikin Urushi；官方称双龙 Tsuikin-mochi 混入真铂粉与金粉，但不等于整支笔由贵金属制成。",
      S.product.key,
      "Material & art specification and Twin Dragons motif material statement",
    ),
    claim(
      `${SCOPE}-nib`,
      "nib_options",
      "当前商品页列出 #6 JoWo stainless steel 与 Wancher 18K gold 两条尖材路线；没有公布固定尖幅、磨尖师或写感保证。",
      S.product.key,
      "Specifications Nib line",
    ),
    claim(
      `${SCOPE}-feed`,
      "feed_options",
      "当前商品页列出 plastic、ebonite black、ebonite red 三种 feed；它们是 feed 选项，不是三支备用笔或三种笔身颜色。",
      S.product.key,
      "Specifications Feed line",
    ),
    claim(
      `${SCOPE}-type-boundary`,
      "market_variant_boundary",
      "商品页出现 Type A、Type B 下拉项，但没有公开二者的名称映射或构造差异；本页记录为未解释市场 SKU，不擅自翻译为材质、颜色或限量版本。",
      S.product.key,
      "current Type A and Type B selector without explanatory labels",
    ),
    claim(
      `${SCOPE}-filling`,
      "filling_system",
      "Black Urushi 使用 European International Standard cartridge 或 converter；包装列出 converter、cartridge、Pen Kimono、说明材料、Certificate 与传统日式木盒。",
      S.product.key,
      "Filling mechanism and Packaging sections",
    ),
    claim(
      `${SCOPE}-cap`,
      "cap_design",
      "官方将帽子描述为 compact air-tight cap，用于减少墨水干燥；它不是永远不干或免清洗保证。",
      S.product.key,
      "Compact air-tight cap specification",
    ),
    claim(
      `${SCOPE}-care`,
      "maintenance_guidance",
      "Wancher 护理页建议 Urushi/Maki-e/Raden 避免直射光、干燥和极端天气，并提醒 Ebonite 不要长时间浸泡、避免化学清洁剂；本文据此给出保守维护边界。",
      S.care.key,
      "official Product Care Guide sections",
      "editorial",
    ),
    claim(
      `${SCOPE}-size-boundary`,
      "specification_boundary",
      "当前商品页 Size & Shape 以图片呈现，文字未公布数值尺寸和重量；不从相邻 Tsuikin 或 Dream Pen 型号借用数字。",
      S.product.key,
      "Size & Shape image section and absent numeric dimension/weight text",
    ),
    claim(
      `${SCOPE}-media`,
      "media_identity_boundary",
      "本站原创 factual SVG 只表达黑漆、Ebonite、双龙堆锦、欧规 C/C 与尖材/feed 路线，并标明非产品照片、非 Logo、非真实比例、非颜色校样。",
      S.svg.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: `${SCOPE}-nib-jowo-stainless-steel`,
      name: "#6 JoWo stainless steel",
      notes: "官方当前商品页列出的不锈钢尖路线；固定尖幅与调校未公布。",
      sourceKey: S.product.key,
      variantKind: "nib",
      market: "Wancher international listing",
    },
    {
      key: `${SCOPE}-nib-wancher-18k`,
      name: "Wancher 18K gold",
      notes: "官方当前商品页列出的 18K 金尖路线；不从合金名称推导弹性或固定线宽。",
      sourceKey: S.product.key,
      variantKind: "nib",
      market: "Wancher international listing",
    },
    {
      key: `${SCOPE}-feed-plastic`,
      name: "plastic feed",
      notes: "官方列出的 feed 选项，不等于另一支笔或笔身颜色。",
      sourceKey: S.product.key,
      variantKind: "variant",
      market: "Wancher international listing",
    },
    {
      key: `${SCOPE}-feed-ebonite-black`,
      name: "ebonite black feed",
      notes: "官方列出的黑色 Ebonite feed 选项，具体与尖材组合按订单确认。",
      sourceKey: S.product.key,
      variantKind: "variant",
      market: "Wancher international listing",
    },
    {
      key: `${SCOPE}-feed-ebonite-red`,
      name: "ebonite red feed",
      notes: "官方列出的红色 Ebonite feed 选项，不把颜色名当成红漆版本。",
      sourceKey: S.product.key,
      variantKind: "variant",
      market: "Wancher international listing",
    },
    {
      key: `${SCOPE}-market-type-a`,
      name: "Type A",
      notes: "商品页下拉项；官方当前文字没有解释其构造、颜色或尖材对应关系。",
      sourceKey: S.product.key,
      variantKind: "market_sku",
      market: "Wancher international listing",
    },
    {
      key: `${SCOPE}-market-type-b`,
      name: "Type B",
      notes: "商品页下拉项；官方当前文字没有解释其构造、颜色或尖材对应关系。",
      sourceKey: S.product.key,
      variantKind: "market_sku",
      market: "Wancher international listing",
    },
  ],
  spec: {
    brandEntityId: PHASE389_WANCHER_BRAND_ID,
    values: {
      series_name: "Dream Pen Ryukyu Tsuikin",
      release_year: "系列纪念语境为 2022-05-15 冲绳回归日本 50 周年；Black Urushi 独立首发年份未核验",
      origin_country: "Wancher 将 Tsuikin 置于冲绳琉球漆艺语境；各部件完整原产地未逐项披露",
      nib: "#6 JoWo stainless steel、Wancher 18K gold",
      fill_system: "European International Standard cartridge 或 converter",
      material: "Ebonite、Urushi、Tsuikin Urushi；双龙堆锦含真铂粉与金粉的官方描述",
      dimensions: "官方 Size & Shape 为图片呈现，文字未公布数值尺寸",
      weight: "官方当前商品页未公布文字重量",
      price_range: "$1,000 USD（2026-08-03 国际官方页标价；当前 Sold out，税费与库存可变）",
      status: "Twin Dragons Black Urushi 具体 SKU；当前国际商品页 Sold out，Red Urushi 与 Black Sohari 分开记录",
    },
    evidence: [
      evidence(`${SCOPE}-spec-brand`, "brand_entity_id", S.product.key, "Wancher official product context"),
      evidence(`${SCOPE}-spec-series`, "series_name", S.collection.key, "Dream Pen Ryukyu Tsuikin collection title and model list"),
      evidence(`${SCOPE}-spec-release`, "release_year", S.collection.key, "2022 anniversary context; independent launch year intentionally not asserted"),
      evidence(`${SCOPE}-spec-origin`, "origin_country", S.collection.key, "Ryukyu/Okinawa craft context and conservative origin boundary"),
      evidence(`${SCOPE}-spec-nib`, "nib", S.product.key, "current Nib specification"),
      evidence(`${SCOPE}-spec-fill`, "fill_system", S.product.key, "European International Standard cartridge/converter"),
      evidence(`${SCOPE}-spec-material`, "material", S.product.key, "Material & art and Twin Dragons motif material specification"),
      evidence(`${SCOPE}-spec-dimensions`, "dimensions", S.product.key, "Size & Shape image; no numeric dimensions"),
      evidence(`${SCOPE}-spec-weight`, "weight", S.product.key, "no numeric weight in current text specification"),
      evidence(`${SCOPE}-spec-price`, "price_range", S.product.key, "current $1,000 USD price and Sold out state retrieved 2026-08-03"),
      evidence(`${SCOPE}-spec-status`, "status", S.product.key, "current Sold out product state and separate title"),
    ],
  },
  media: [
    {
      key: `${SCOPE}-primary-media`,
      title: "Twin Dragons Black Urushi 事实图（非产品照片）",
      sourceKey: S.svg.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创 factual SVG；非产品照片、非 Logo、非真实比例图、非颜色校样。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary",
    },
  ],
};

export const phase389WancherTwinDragonsBlackPacks: CuratedEntityPack[] = [
  baseBrand,
  model,
];
