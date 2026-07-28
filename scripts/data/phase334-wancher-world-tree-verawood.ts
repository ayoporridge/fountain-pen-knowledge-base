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

export const PHASE334_WANCHER_BRAND_ID = PHASE107_WANCHER_ID;
export const PHASE334_WORLD_TREE_VERAWOOD_ID =
  "phase334-pen-wancher-world-tree-verawood";
export const PHASE334_WORLD_TREE_VERAWOOD_SLUG = "wancher-world-tree-verawood";

const RETRIEVED = "2026-07-28";
const SCOPE = "phase334-wancher-world-tree-verawood-current";
const SVG_PATH =
  "/images/library/site-original/phase334/wancher/world-tree-verawood.svg";

function source(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  registryKey: string;
  registryName: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup?: string;
  homepageUrl?: string;
  author?: string;
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
    allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only",
    license: sourceType === "user_submission" ? "site-original" : undefined,
    archiveUrl: input.url,
    archiveLocator:
      sourceType === "user_submission"
        ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
        : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
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
    confidence: factClass === "core" ? 0.98 : 0.94,
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

const SOURCES = {
  product: source({
    key: "phase334-wancher-world-tree-verawood-product",
    title: "World Tree - Verawood Fountain Pen",
    url: "https://www.wancherpen.com/products/world-tree-verawood",
    registryKey: "wancher-official-world-tree-verawood-phase334",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-product-phase334",
    summary:
      "官方具体商品页确认天然木材色差、No Clip/925 Matte Silver Clip/925 Silver Clip 选项、国际墨胆/转换器、#6 JoWo/Wancher 18K/KEIRYU-Kodachi、feed 与木盒包装。",
  }),
  sekai: source({
    key: "phase334-wancher-sekai-collection",
    title: "Sekai Fountain Pen Collection",
    url: "https://www.wancherpen.com/collections/sekai",
    registryKey: "wancher-official-sekai-collection-phase334",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-sekai-phase334",
    summary:
      "官方 Sekai 集合页用于确认 World Tree 的系列入口、木材路线和可变库存。",
  }),
  worldTree: source({
    key: "phase334-wancher-world-tree-collection",
    title: "World Tree Fountain Pen Collection",
    url: "https://www.wancherpen.com/collections/world-tree",
    registryKey: "wancher-official-world-tree-collection-phase334",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-world-tree-phase334",
    summary:
      "官方 World Tree 系列页给出 13.2 mm、140.1/164.4 mm、27/21 g 家族参考值，不冒充 Verawood 逐支测量。",
  }),
  ebony: source({
    key: "phase334-wancher-world-tree-ebony-boundary",
    title: "World Tree - Ebony Fountain Pen",
    url: "https://www.wancherpen.com/products/world-tree-ebony",
    registryKey: "wancher-official-world-tree-ebony-phase334",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-ebony-boundary-phase334",
    summary:
      "同品牌 Ebony 页面用于划清 Verawood 与乌木的具体 SKU 边界，不共享材质、颜色、图片和库存结论。",
  }),
  appelboom: source({
    key: "phase334-appelboom-world-tree-teak",
    title: "Wancher Sekai World Tree Teak Wood Fountain Pen",
    url: "https://appelboom.com/wancher-sekai-world-tree-teak-wood-fountain-pen/",
    registryKey: "appelboom-world-tree-teak-phase334",
    registryName: "Appelboom",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "appelboom-phase334",
    homepageUrl: "https://appelboom.com/",
    author: "Appelboom",
    summary:
      "专业零售商的 World Tree 木笔页面只作为家族级交叉窗口，不替代 Verawood 官方商品页。",
  }),
  diagram: source({
    key: "phase334-wancher-world-tree-verawood-svg",
    title: "Wancher World Tree Verawood factual diagram",
    url: SVG_PATH,
    registryKey: "fountain-pen-graph-editorial-phase334-verawood",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase334",
    homepageUrl: "/",
    summary:
      "本站原创事实 SVG，标示天然 Verawood、自然色差、可拆 925 夹、C/C 供墨和尖材边界；非产品照片、非 Logo、非比例图、非颜色校样。",
  }),
} as const;

const model: CuratedEntityPack = {
  key: "phase334-wancher-world-tree-verawood-v1",
  entityId: PHASE334_WORLD_TREE_VERAWOOD_ID,
  expectedType: "pen",
  expectedSlug: PHASE334_WORLD_TREE_VERAWOOD_SLUG,
  canonicalName: "Wancher World Tree – Verawood",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-world-tree-verawood-phase334.md",
  storyTitle: "Wancher World Tree – Verawood：天然木色与可拆银夹",
  primarySourceKey: SOURCES.product.key,
  depthTier: "A",
  aliases: [
    { alias: "World Tree - Verawood", language: "en", sourceKey: SOURCES.product.key },
    { alias: "Wancher World Tree Verawood", language: "en", sourceKey: SOURCES.product.key },
    { alias: "Wancher World Tree Verawood Fountain Pen", language: "en", sourceKey: SOURCES.sekai.key },
    { alias: "万佳 World Tree Verawood", language: "zh", sourceKey: SOURCES.product.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Wancher official World Tree Verawood current product",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "#6 JoWo stainless steel、Wancher 18K gold 或 KEIRYU/Kodachi；按 SKU",
      materialScope: "Natural Verawood; colour and pattern may differ from product imagery",
      editionScope: "World Tree Verawood only; other woods and Sekai Ai remain separate SKUs",
    },
    {
      key: `${SCOPE}-boundary`,
      scopeKey: `${SCOPE}-boundary`,
      productionState: "current",
      editionScope: "Independent from World Tree Ebony/Teak/Sandalwood, Sekai Ai, Urushi and Dream Pen",
    },
    {
      key: `${SCOPE}-care`,
      scopeKey: `${SCOPE}-care`,
      productionState: "current",
      editionScope: "Soft cloth and water care; avoid alcohol, strong detergent, heat and aggressive disassembly",
    },
  ],
  claims: [
    claim(
      "phase334-verawood-identity",
      "model_identity",
      "World Tree – Verawood 是 Wancher Sekai collection 的天然 Verawood 具体 SKU，不是 World Tree 系列导航，也不与 Ebony、Teak 或 Sekai Ai 合并。",
      SOURCES.product.key,
      "official product title and World Tree context",
    ),
    claim(
      "phase334-verawood-natural",
      "natural_material_variation",
      "官方提醒天然木材实物颜色可能与商品图片略有不同；页面没有把每支 Verawood 的色调和纹理密度定义成固定参数。",
      SOURCES.product.key,
      "natural-wood colour notice",
    ),
    claim(
      "phase334-verawood-clip",
      "clip",
      "商品提供 No Clip、925 Matte Silver Clip 和 925 Silver Clip，后两项显示为额外价格选项；夹子可拆，在 Wancher 日本工作室制作。",
      SOURCES.product.key,
      "variant selector and Sterling Silver 925 Clip section",
    ),
    claim(
      "phase334-verawood-clip-finish",
      "clip_finish",
      "925 银夹的哑面版本与大分温泉蒸汽相关的处理工艺有关；这是夹件表面语境，不是 Verawood 笔身的颜色或产地声明。",
      SOURCES.product.key,
      "Oita steam matte clip description",
    ),
    claim(
      "phase334-verawood-fill",
      "filling_system",
      "官方 Specification 写明 European International Standard cartridge 或 converter；包装包括墨胆、转换器、传统日式木盒和说明材料。",
      SOURCES.product.key,
      "Specification and Packaging fields",
    ),
    claim(
      "phase334-verawood-nib",
      "nib_options",
      "官方列出 #6 JoWo stainless steel、Wancher 18K gold、KEIRYU/Kodachi，feed 有 plastic、black ebonite、red ebonite；实际组合按 SKU。",
      SOURCES.product.key,
      "official nib and feed options",
    ),
    claim(
      "phase334-verawood-care",
      "maintenance",
      "天然木面应使用柔软布与少量清水，避免酒精、强清洁剂、研磨膏、高温和强拆；出现裂线或接缝松动时联系卖家或维修渠道。",
      SOURCES.product.key,
      "natural-wood handling boundary and editorial care guidance",
      "editorial",
    ),
    claim(
      "phase334-verawood-family",
      "family_boundary",
      "World Tree 系列参考尺寸为直径 13.2 mm、闭帽 140.1 mm、插帽 164.4 mm，重量含夹 27 g、无夹 21 g；这些是家族语境，不是 Verawood 每支实测保证。",
      SOURCES.worldTree.key,
      "World Tree collection family reference values",
    ),
    claim(
      "phase334-verawood-ebony-boundary",
      "identity_boundary",
      "World Tree Ebony 是天然乌木 SKU；Verawood 的色差、木纹和夹件选项不能套用到 Ebony、Teak 或 Sekai Ai。",
      SOURCES.ebony.key,
      "same-brand Ebony sibling boundary",
    ),
    claim(
      "phase334-verawood-cross-check",
      "professional_cross_check",
      "Appelboom 的 World Tree 木笔页面只作为专业零售家族交叉窗口；Wancher 官方 Verawood 页仍是材质、夹件、尖材与供墨主源。",
      SOURCES.appelboom.key,
      "professional retailer family cross-check",
    ),
    claim(
      "phase334-verawood-media",
      "media_identity_boundary",
      "主图是本站原创 factual SVG，非产品照片、非 Logo、非比例图、非颜色校样，不证明真实木纹、颜色、库存或实际尖材组合。",
      SOURCES.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase334-verawood-clip",
      name: "No Clip / 925 Matte Silver Clip / 925 Silver Clip",
      notes: "官方夹件选项；可拆，不建立三个基础型号。",
      sourceKey: SOURCES.product.key,
      variantKind: "market_sku",
      market: "Wancher international listing",
    },
    {
      key: "phase334-verawood-wood",
      name: "Natural Verawood",
      notes: "天然颜色可能与商品图不同；不与其他 World Tree 木材合并。",
      sourceKey: SOURCES.product.key,
      variantKind: "material",
      market: "Wancher World Tree collection",
    },
    {
      key: "phase334-verawood-nib-feed",
      name: "#6 JoWo stainless / Wancher 18K / KEIRYU-Kodachi; plastic or ebonite feed",
      notes: "尖材和 feed 按订单组合，不能从木色或商品图片自动推定。",
      sourceKey: SOURCES.product.key,
      variantKind: "nib",
      market: "Wancher international listing",
    },
  ],
  spec: {
    brandEntityId: PHASE334_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher World Tree – Verawood",
      release_year: "当前商品与集合页读取于 2026-07-28；不据此推断首发年份",
      origin_country: "Wancher 日本品牌语境；官方明确银夹在日本工作室制作，不把整支笔产地过度外推",
      nib: "#6 JoWo 不锈钢尖、Wancher 18K 金尖或 KEIRYU/Kodachi；plastic/black ebonite/red ebonite feed",
      fill_system: "European International Standard cartridge 或 converter",
      material: "天然 Verawood；实物颜色可能与商品图片略有不同",
      dimensions: "World Tree 系列参考：直径 13.2 mm；闭帽 140.1 mm；插帽 164.4 mm",
      weight: "World Tree 系列参考：27 g（含夹）；21 g（无夹）；Verawood 实物按 SKU 核对",
      price_range: "官方当前页面显示约 $100，银夹另有价格；币种、税费与库存会变化",
      status: "Wancher 当前 World Tree Verawood 商品；木材、夹件、尖材、feed、包装和库存按 SKU 核对",
    },
    evidence: [
      evidence("phase334-verawood-brand", "brand_entity_id", SOURCES.product.key, "Wancher official product context"),
      evidence("phase334-verawood-series", "series_name", SOURCES.product.key, "World Tree - Verawood title"),
      evidence("phase334-verawood-release", "release_year", SOURCES.product.key, "retrieval date only; launch year not asserted"),
      evidence("phase334-verawood-origin", "origin_country", SOURCES.product.key, "Japan workshop clip statement with conservative boundary"),
      evidence("phase334-verawood-nib", "nib", SOURCES.product.key, "official nib and feed options"),
      evidence("phase334-verawood-fill", "fill_system", SOURCES.product.key, "official cartridge/converter specification"),
      evidence("phase334-verawood-material", "material", SOURCES.product.key, "natural wood colour notice"),
      evidence("phase334-verawood-dimensions", "dimensions", SOURCES.worldTree.key, "World Tree collection family dimensions"),
      evidence("phase334-verawood-weight", "weight", SOURCES.worldTree.key, "World Tree collection family weights"),
      evidence("phase334-verawood-price", "price_range", SOURCES.product.key, "current displayed price and mutable clip selector"),
      evidence("phase334-verawood-status", "status", SOURCES.product.key, "current product page and SKU boundary"),
    ],
  },
  media: [
    {
      key: "phase334-verawood-primary-media",
      title: "Wancher World Tree – Verawood 事实图（非产品照片）",
      sourceKey: SOURCES.diagram.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary",
    },
  ],
};

export const phase334WancherWorldTreeVerawoodPacks: CuratedEntityPack[] = [
  phase107WancherBrandPack,
  model,
];
