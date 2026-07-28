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

export const PHASE335_WANCHER_BRAND_ID = PHASE107_WANCHER_ID;
export const PHASE335_WORLD_TREE_SANDALWOOD_ID =
  "phase335-pen-wancher-world-tree-sandalwood";
export const PHASE335_WORLD_TREE_SANDALWOOD_SLUG = "wancher-world-tree-sandalwood";

const RETRIEVED = "2026-07-28";
const SCOPE = "phase335-wancher-world-tree-sandalwood-current";
const SVG_PATH =
  "/images/library/site-original/phase335/wancher/world-tree-sandalwood.svg";

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
    key: "phase335-wancher-world-tree-sandalwood-product",
    title: "World Tree - Sandalwood Fountain Pen",
    url: "https://www.wancherpen.com/products/world-tree-sandalwood",
    registryKey: "wancher-official-world-tree-sandalwood-phase335",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-product-phase335",
    summary:
      "官方具体商品页确认天然木材色差、No Clip/925 Matte Silver Clip/925 Silver Clip 选项、国际墨胆/转换器、#6 JoWo 不锈钢尖与 Wancher 18K 金尖、feed 与木盒包装；图库中的周年龙尖不自动代表基础 SKU。",
  }),
  sekai: source({
    key: "phase335-wancher-sekai-collection",
    title: "Sekai Fountain Pen Collection",
    url: "https://www.wancherpen.com/collections/sekai",
    registryKey: "wancher-official-sekai-collection-phase335",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-sekai-phase335",
    summary:
      "官方 Sekai 集合页用于确认 World Tree 的系列入口、木材路线和可变库存。",
  }),
  worldTree: source({
    key: "phase335-wancher-world-tree-collection",
    title: "World Tree Fountain Pen Collection",
    url: "https://www.wancherpen.com/collections/world-tree",
    registryKey: "wancher-official-world-tree-collection-phase335",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-world-tree-phase335",
    summary:
      "官方 World Tree 系列页给出 13.2 mm、140.1/164.4 mm、27/21 g 家族参考值，不冒充 Sandalwood 逐支测量。",
  }),
  ebony: source({
    key: "phase335-wancher-world-tree-ebony-boundary",
    title: "World Tree - Ebony Fountain Pen",
    url: "https://www.wancherpen.com/products/world-tree-ebony",
    registryKey: "wancher-official-world-tree-ebony-phase335",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-ebony-boundary-phase335",
    summary:
      "同品牌 Ebony 页面用于划清 Sandalwood 与乌木的具体 SKU 边界，不共享材质、颜色、图片和库存结论。",
  }),
  appelboom: source({
    key: "phase335-appelboom-world-tree-teak",
    title: "Wancher Sekai World Tree Teak Wood Fountain Pen",
    url: "https://appelboom.com/wancher-sekai-world-tree-teak-wood-fountain-pen/",
    registryKey: "appelboom-world-tree-teak-phase335",
    registryName: "Appelboom",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "appelboom-phase335",
    homepageUrl: "https://appelboom.com/",
    author: "Appelboom",
    summary:
      "专业零售商的 World Tree 木笔页面只作为家族级交叉窗口，不替代 Sandalwood 官方商品页。",
  }),
  diagram: source({
    key: "phase335-wancher-world-tree-sandalwood-svg",
    title: "Wancher World Tree Sandalwood factual diagram",
    url: SVG_PATH,
    registryKey: "fountain-pen-graph-editorial-phase335-sandalwood",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase335",
    homepageUrl: "/",
    summary:
      "本站原创事实 SVG，标示天然 Sandalwood、自然色差、可拆 925 夹、C/C 供墨和尖材边界；非产品照片、非 Logo、非比例图、非颜色校样。",
  }),
} as const;

const model: CuratedEntityPack = {
  key: "phase335-wancher-world-tree-sandalwood-v1",
  entityId: PHASE335_WORLD_TREE_SANDALWOOD_ID,
  expectedType: "pen",
  expectedSlug: PHASE335_WORLD_TREE_SANDALWOOD_SLUG,
  canonicalName: "Wancher World Tree – Sandalwood",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-world-tree-sandalwood-phase335.md",
  storyTitle: "Wancher World Tree – Sandalwood：天然木色与可拆银夹",
  primarySourceKey: SOURCES.product.key,
  depthTier: "A",
  aliases: [
    { alias: "World Tree - Sandalwood", language: "en", sourceKey: SOURCES.product.key },
    { alias: "Wancher World Tree Sandalwood", language: "en", sourceKey: SOURCES.product.key },
    { alias: "Wancher World Tree Sandalwood Fountain Pen", language: "en", sourceKey: SOURCES.sekai.key },
    { alias: "万佳 World Tree Sandalwood", language: "zh", sourceKey: SOURCES.product.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Wancher official World Tree Sandalwood current product",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "基础页面列 #6 JoWo stainless steel 或 Wancher 18K gold；特殊周年尖另行核对",
      materialScope: "Natural Sandalwood; colour and pattern may differ from product imagery",
      editionScope: "World Tree Sandalwood only; other woods and Sekai Ai remain separate SKUs",
    },
    {
      key: `${SCOPE}-boundary`,
      scopeKey: `${SCOPE}-boundary`,
      productionState: "current",
      editionScope: "Independent from World Tree Ebony/Teak/Verawood, Sekai Ai, Urushi and Dream Pen",
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
      "phase335-sandalwood-identity",
      "model_identity",
      "World Tree – Sandalwood 是 Wancher Sekai collection 的天然 Sandalwood 具体 SKU，不是 World Tree 系列导航，也不与 Ebony、Teak 或 Sekai Ai 合并。",
      SOURCES.product.key,
      "official product title and World Tree context",
    ),
    claim(
      "phase335-sandalwood-natural",
      "natural_material_variation",
      "官方提醒天然木材实物颜色可能与商品图片略有不同；页面没有把每支 Sandalwood 的色调和纹理密度定义成固定参数。",
      SOURCES.product.key,
      "natural-wood colour notice",
    ),
    claim(
      "phase335-sandalwood-clip",
      "clip",
      "商品提供 No Clip、925 Matte Silver Clip 和 925 Silver Clip，后两项显示为额外价格选项；夹子可拆，在 Wancher 日本工作室制作。",
      SOURCES.product.key,
      "variant selector and Sterling Silver 925 Clip section",
    ),
    claim(
      "phase335-sandalwood-clip-finish",
      "clip_finish",
      "925 银夹的哑面版本与大分温泉蒸汽相关的处理工艺有关；这是夹件表面语境，不是 Sandalwood 笔身的颜色或产地声明。",
      SOURCES.product.key,
      "Oita steam matte clip description",
    ),
    claim(
      "phase335-sandalwood-fill",
      "filling_system",
      "官方 Specification 写明 European International Standard cartridge 或 converter；包装包括墨胆、转换器、传统日式木盒和说明材料。",
      SOURCES.product.key,
      "Specification and Packaging fields",
    ),
    claim(
      "phase335-sandalwood-nib",
      "nib_options",
      "官方基础 Writing 规格列出 #6 JoWo stainless steel 与 Wancher 18K gold，feed 有 plastic、black ebonite、red ebonite；图库中的周年 Keiryu Dragon Nib 不自动写入基础 Sandalwood SKU，实际组合按订单核对。",
      SOURCES.product.key,
      "official nib and feed options",
    ),
    claim(
      "phase335-sandalwood-care",
      "maintenance",
      "天然木面应使用柔软布与少量清水，避免酒精、强清洁剂、研磨膏、高温和强拆；出现裂线或接缝松动时联系卖家或维修渠道。",
      SOURCES.product.key,
      "natural-wood handling boundary and editorial care guidance",
      "editorial",
    ),
    claim(
      "phase335-sandalwood-family",
      "family_boundary",
      "World Tree 系列参考尺寸为直径 13.2 mm、闭帽 140.1 mm、插帽 164.4 mm，重量含夹 27 g、无夹 21 g；这些是家族语境，不是 Sandalwood 每支实测保证。",
      SOURCES.worldTree.key,
      "World Tree collection family reference values",
    ),
    claim(
      "phase335-sandalwood-ebony-boundary",
      "identity_boundary",
      "World Tree Ebony 是天然乌木 SKU；Sandalwood 的色差、木纹和夹件选项不能套用到 Ebony、Teak 或 Sekai Ai。",
      SOURCES.ebony.key,
      "same-brand Ebony sibling boundary",
    ),
    claim(
      "phase335-sandalwood-cross-check",
      "professional_cross_check",
      "Appelboom 的 World Tree 木笔页面只作为专业零售家族交叉窗口；Wancher 官方 Sandalwood 页仍是材质、夹件、尖材与供墨主源。",
      SOURCES.appelboom.key,
      "professional retailer family cross-check",
    ),
    claim(
      "phase335-sandalwood-media",
      "media_identity_boundary",
      "主图是本站原创 factual SVG，非产品照片、非 Logo、非比例图、非颜色校样，不证明真实木纹、颜色、库存或实际尖材组合。",
      SOURCES.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase335-sandalwood-clip",
      name: "No Clip / 925 Matte Silver Clip / 925 Silver Clip",
      notes: "官方夹件选项；可拆，不建立三个基础型号。",
      sourceKey: SOURCES.product.key,
      variantKind: "market_sku",
      market: "Wancher international listing",
    },
    {
      key: "phase335-sandalwood-wood",
      name: "Natural Sandalwood",
      notes: "天然颜色可能与商品图不同；不与其他 World Tree 木材合并。",
      sourceKey: SOURCES.product.key,
      variantKind: "material",
      market: "Wancher World Tree collection",
    },
    {
      key: "phase335-sandalwood-nib-feed",
      name: "#6 JoWo stainless / Wancher 18K; plastic or ebonite feed",
      notes: "基础页面的尖材和 feed 按订单组合；周年龙尖图片只作特殊配置边界，不能从木色或商品图片自动推定。",
      sourceKey: SOURCES.product.key,
      variantKind: "nib",
      market: "Wancher international listing",
    },
  ],
  spec: {
    brandEntityId: PHASE335_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher World Tree – Sandalwood",
      release_year: "当前商品与集合页读取于 2026-07-28；不据此推断首发年份",
      origin_country: "Wancher 日本品牌语境；官方明确银夹在日本工作室制作，不把整支笔产地过度外推",
      nib: "#6 JoWo 不锈钢尖或 Wancher 18K 金尖；plastic/black ebonite/red ebonite feed；周年 Keiryu Dragon Nib 需独立 SKU 证据",
      fill_system: "European International Standard cartridge 或 converter",
      material: "天然 Sandalwood；实物颜色可能与商品图片略有不同",
      dimensions: "World Tree 系列参考：直径 13.2 mm；闭帽 140.1 mm；插帽 164.4 mm",
      weight: "World Tree 系列参考：27 g（含夹）；21 g（无夹）；Sandalwood 实物按 SKU 核对",
      price_range: "官方当前页面显示约 $100，银夹另有价格；币种、税费与库存会变化",
      status: "Wancher 当前 World Tree Sandalwood 商品；木材、夹件、尖材、feed、包装和库存按 SKU 核对",
    },
    evidence: [
      evidence("phase335-sandalwood-brand", "brand_entity_id", SOURCES.product.key, "Wancher official product context"),
      evidence("phase335-sandalwood-series", "series_name", SOURCES.product.key, "World Tree - Sandalwood title"),
      evidence("phase335-sandalwood-release", "release_year", SOURCES.product.key, "retrieval date only; launch year not asserted"),
      evidence("phase335-sandalwood-origin", "origin_country", SOURCES.product.key, "Japan workshop clip statement with conservative boundary"),
      evidence("phase335-sandalwood-nib", "nib", SOURCES.product.key, "official nib and feed options"),
      evidence("phase335-sandalwood-fill", "fill_system", SOURCES.product.key, "official cartridge/converter specification"),
      evidence("phase335-sandalwood-material", "material", SOURCES.product.key, "natural wood colour notice"),
      evidence("phase335-sandalwood-dimensions", "dimensions", SOURCES.worldTree.key, "World Tree collection family dimensions"),
      evidence("phase335-sandalwood-weight", "weight", SOURCES.worldTree.key, "World Tree collection family weights"),
      evidence("phase335-sandalwood-price", "price_range", SOURCES.product.key, "current displayed price and mutable clip selector"),
      evidence("phase335-sandalwood-status", "status", SOURCES.product.key, "current product page and SKU boundary"),
    ],
  },
  media: [
    {
      key: "phase335-sandalwood-primary-media",
      title: "Wancher World Tree – Sandalwood 事实图（非产品照片）",
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

export const phase335WancherWorldTreeSandalwoodPacks: CuratedEntityPack[] = [
  phase107WancherBrandPack,
  model,
];
