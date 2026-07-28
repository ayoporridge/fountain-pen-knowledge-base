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

export const PHASE333_WANCHER_BRAND_ID = PHASE107_WANCHER_ID;
export const PHASE333_WORLD_TREE_TEAK_ID =
  "phase333-pen-wancher-world-tree-teak";
export const PHASE333_WORLD_TREE_TEAK_SLUG = "wancher-world-tree-teak";

const RETRIEVED = "2026-07-28";
const SCOPE = "phase333-wancher-world-tree-teak-current";
const SVG_PATH =
  "/images/library/site-original/phase333/wancher/world-tree-teak.svg";

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
    key: "phase333-wancher-world-tree-teak-product",
    title: "World Tree - Teak Wood Fountain Pen",
    url: "https://www.wancherpen.com/products/world-tree-teak-wood",
    registryKey: "wancher-official-world-tree-teak-phase333",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-product-phase333",
    summary:
      "官方具体商品页确认天然柚木、手工抛光、纵向深色纹理、随使用逐渐变深、可拆 925 银夹、国际墨胆/转换器、尖材和 feed 选项、木盒包装。",
  }),
  sekai: source({
    key: "phase333-wancher-sekai-collection",
    title: "Sekai Fountain Pen Collection",
    url: "https://www.wancherpen.com/collections/sekai",
    registryKey: "wancher-official-sekai-collection-phase333",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-sekai-phase333",
    summary:
      "官方 Sekai 集合页确认 World Tree 木材路线、商品入口和可变库存；集合页不替代具体柚木商品规格。",
  }),
  worldTree: source({
    key: "phase333-wancher-world-tree-collection",
    title: "World Tree Fountain Pen Collection",
    url: "https://www.wancherpen.com/collections/world-tree",
    registryKey: "wancher-official-world-tree-collection-phase333",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-world-tree-phase333",
    summary:
      "官方 World Tree 系列页提供 13.2 mm、140.1/164.4 mm、27/21 g 家族参考值；不把系列参考数字冒充 Teak 逐支实测。",
  }),
  ebony: source({
    key: "phase333-wancher-world-tree-ebony-boundary",
    title: "World Tree - Ebony Fountain Pen",
    url: "https://www.wancherpen.com/products/world-tree-ebony",
    registryKey: "wancher-official-world-tree-ebony-phase333",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-ebony-boundary-phase333",
    summary:
      "同品牌 Ebony 具体商品用于划清柚木与乌木的材质、颜色和版本边界，不共享所有重量和图片结论。",
  }),
  appelboom: source({
    key: "phase333-appelboom-world-tree-teak",
    title: "Wancher Sekai World Tree Teak Wood Fountain Pen",
    url: "https://appelboom.com/wancher-sekai-world-tree-teak-wood-fountain-pen/",
    registryKey: "appelboom-world-tree-teak-phase333",
    registryName: "Appelboom",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "appelboom-phase333",
    homepageUrl: "https://appelboom.com/",
    author: "Appelboom",
    summary:
      "专业零售商的同款页面用于交叉核对 World Tree Teak 的商品语境；官方页面仍是材质、夹件和配置主源。",
  }),
  diagram: source({
    key: "phase333-wancher-world-tree-teak-svg",
    title: "Wancher World Tree Teak factual diagram",
    url: SVG_PATH,
    registryKey: "fountain-pen-graph-editorial-phase333-teak",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase333",
    homepageUrl: "/",
    summary:
      "本站原创事实 SVG，标示天然柚木纵向纹理、可拆 925 夹、C/C 供墨和尖材边界；非产品照片、非 Logo、非比例图、非颜色校样。",
  }),
} as const;

const model: CuratedEntityPack = {
  key: "phase333-wancher-world-tree-teak-v1",
  entityId: PHASE333_WORLD_TREE_TEAK_ID,
  expectedType: "pen",
  expectedSlug: PHASE333_WORLD_TREE_TEAK_SLUG,
  canonicalName: "Wancher World Tree – Teak Wood",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-world-tree-teak-phase333.md",
  storyTitle: "Wancher World Tree – Teak Wood：天然柚木与纵向纹理",
  primarySourceKey: SOURCES.product.key,
  depthTier: "A",
  aliases: [
    { alias: "World Tree - Teak Wood", language: "en", sourceKey: SOURCES.product.key },
    { alias: "Wancher World Tree Teak", language: "en", sourceKey: SOURCES.product.key },
    { alias: "Wancher World Tree Teak Wood Fountain Pen", language: "en", sourceKey: SOURCES.appelboom.key },
    { alias: "万佳 World Tree 柚木", language: "zh", sourceKey: SOURCES.product.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Wancher official World Tree Teak Wood current product",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "#6 JoWo stainless steel、Wancher 18K gold 或 KEIRYU/Kodachi；按 SKU",
      materialScope: "Natural teak wood, handcrafted and polished; dark vertical striations and gradual darkening",
      editionScope: "World Tree Teak Wood only; other woods and Sekai Ai remain separate SKUs",
    },
    {
      key: `${SCOPE}-boundary`,
      scopeKey: `${SCOPE}-boundary`,
      productionState: "current",
      editionScope: "Independent from World Tree Ebony/Sandalwood/Verawood, Sekai Ai, Urushi and Dream Pen",
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
      "phase333-teak-identity",
      "model_identity",
      "World Tree – Teak Wood 是 Wancher Sekai collection 的天然柚木具体 SKU，不是 World Tree 系列导航，也不与 Ebony 或 Sekai Ai 合并。",
      SOURCES.product.key,
      "official product title and World Tree context",
    ),
    claim(
      "phase333-teak-material",
      "material",
      "官方说明每支柚木笔均手工制作并抛光，纵向深色条纹是柚木的识别特征；天然木料使颜色和纹理不会完全相同。",
      SOURCES.product.key,
      "The Story of Teak Wood and handcrafted variation",
    ),
    claim(
      "phase333-teak-aging",
      "material_change",
      "柚木会随着使用和时间逐渐变深；这是长期外观变化，不是统一颜色或每支相同速度的保证。",
      SOURCES.product.key,
      "teak gradual darkening statement",
    ),
    claim(
      "phase333-teak-clip",
      "clip",
      "商品提供无夹、925 Matte Silver Clip 和 925 Silver Clip；银夹在 Wancher 日本工作室制作，哑面版本与大分温泉蒸汽处理语境有关，并且可拆。",
      SOURCES.product.key,
      "Sterling Silver 925 Clip section and variant selector",
    ),
    claim(
      "phase333-teak-fill",
      "filling_system",
      "官方 Writing 部分列 European International Standard cartridge 或 converter；包装包括墨胆、转换器、传统日式木盒和说明材料。",
      SOURCES.product.key,
      "Writing and Packaging fields",
    ),
    claim(
      "phase333-teak-nib",
      "nib_options",
      "官方可选 #6 JoWo stainless steel、Wancher 18K gold、KEIRYU/Kodachi，feed 有 plastic、black ebonite、red ebonite；实际组合按 SKU。",
      SOURCES.product.key,
      "Writing nib and feed options",
    ),
    claim(
      "phase333-teak-care",
      "maintenance",
      "天然木面应使用柔软布与少量清水，避免酒精、强清洁剂、研磨膏、高温和强拆；异常裂线或松动时联系卖家或维修渠道。",
      SOURCES.product.key,
      "natural-wood handling boundary and editorial care guidance",
      "editorial",
    ),
    claim(
      "phase333-teak-family",
      "family_boundary",
      "World Tree 系列参考尺寸为直径 13.2 mm、闭帽 140.1 mm、插帽 164.4 mm，重量含夹 27 g、无夹 21 g；这些是家族语境，不是 Teak 每支实测保证。",
      SOURCES.worldTree.key,
      "World Tree collection family reference values",
    ),
    claim(
      "phase333-teak-ebony-boundary",
      "identity_boundary",
      "World Tree Ebony 是天然乌木 SKU；Teak 的木种、纵向纹理和随时间变深不能套用到 Ebony、Sekai Ai 或其他材料。",
      SOURCES.ebony.key,
      "same-brand Ebony sibling boundary",
    ),
    claim(
      "phase333-teak-cross-check",
      "professional_cross_check",
      "Appelboom 同款页面作为专业零售交叉窗口，用于确认商品语境；Wancher 官方页仍是材质、夹件、尖材与供墨主源。",
      SOURCES.appelboom.key,
      "professional retailer same-model cross-check",
    ),
    claim(
      "phase333-teak-media",
      "media_identity_boundary",
      "主图是本站原创 factual SVG，非产品照片、非 Logo、非比例图、非颜色校样，不证明真实木纹、颜色、库存或实际尖材组合。",
      SOURCES.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase333-teak-clip",
      name: "Without Clip / With 925 Matte Silver Clip / With 925 Silver Clip",
      notes: "官方夹件选项；可拆，不建立三个基础型号。",
      sourceKey: SOURCES.product.key,
      variantKind: "market_sku",
      market: "Wancher international listing",
    },
    {
      key: "phase333-teak-wood",
      name: "Natural Teak Wood",
      notes: "手工抛光、纵向深色纹理和随时间变深；不与其他 World Tree 木材合并。",
      sourceKey: SOURCES.product.key,
      variantKind: "material",
      market: "Wancher World Tree collection",
    },
    {
      key: "phase333-teak-nib-feed",
      name: "#6 JoWo stainless / Wancher 18K / KEIRYU-Kodachi; plastic or ebonite feed",
      notes: "尖材和 feed 按订单组合，不能从木纹或商品图片自动推定。",
      sourceKey: SOURCES.product.key,
      variantKind: "nib",
      market: "Wancher international listing",
    },
  ],
  spec: {
    brandEntityId: PHASE333_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher World Tree – Teak Wood",
      release_year: "当前商品与集合页读取于 2026-07-28；不据此推断首发年份",
      origin_country: "Wancher 日本品牌语境；官方明确银夹在日本工作室制作，不把整支笔产地过度外推",
      nib: "#6 JoWo 不锈钢尖、Wancher 18K 金尖或 KEIRYU/Kodachi；plastic/black ebonite/red ebonite feed",
      fill_system: "European International Standard cartridge 或 converter",
      material: "天然柚木；手工抛光、纵向深色纹理、随时间和使用逐渐变深",
      dimensions: "World Tree 系列参考：直径 13.2 mm；闭帽 140.1 mm；插帽 164.4 mm",
      weight: "World Tree 系列参考：27 g（含夹）；21 g（无夹）；Teak 实物按 SKU 核对",
      price_range: "官方当前页面显示约 $100；币种、夹件、税费与库存会变化",
      status: "Wancher 当前 World Tree Teak Wood 商品；木材、夹件、尖材、feed、包装和库存按 SKU 核对",
    },
    evidence: [
      evidence("phase333-teak-brand", "brand_entity_id", SOURCES.product.key, "Wancher official product context"),
      evidence("phase333-teak-series", "series_name", SOURCES.product.key, "World Tree - Teak Wood title"),
      evidence("phase333-teak-release", "release_year", SOURCES.product.key, "retrieval date only; launch year not asserted"),
      evidence("phase333-teak-origin", "origin_country", SOURCES.product.key, "Japan workshop clip statement with conservative boundary"),
      evidence("phase333-teak-nib", "nib", SOURCES.product.key, "official nib and feed options"),
      evidence("phase333-teak-fill", "fill_system", SOURCES.product.key, "official cartridge/converter specification"),
      evidence("phase333-teak-material", "material", SOURCES.product.key, "teak wood story and variation"),
      evidence("phase333-teak-dimensions", "dimensions", SOURCES.worldTree.key, "World Tree collection family dimensions"),
      evidence("phase333-teak-weight", "weight", SOURCES.worldTree.key, "World Tree collection family weights"),
      evidence("phase333-teak-price", "price_range", SOURCES.product.key, "current displayed price and mutable clip selector"),
      evidence("phase333-teak-status", "status", SOURCES.product.key, "current product page and SKU boundary"),
    ],
  },
  media: [
    {
      key: "phase333-teak-primary-media",
      title: "Wancher World Tree – Teak 事实图（非产品照片）",
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

export const phase333WancherWorldTreeTeakPacks: CuratedEntityPack[] = [
  phase107WancherBrandPack,
  model,
];
