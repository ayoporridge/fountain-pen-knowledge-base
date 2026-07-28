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

export const PHASE332_WANCHER_BRAND_ID = PHASE107_WANCHER_ID;
export const PHASE332_SEKAI_AI_ID = "phase332-pen-wancher-sekai-ai";
export const PHASE332_SEKAI_AI_SLUG = "wancher-sekai-ai";

const RETRIEVED = "2026-07-28";
const SCOPE = "phase332-wancher-sekai-ai-current";
const SVG_PATH = "/images/library/site-original/phase332/wancher/sekai-ai.svg";

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
  publishedAt?: string;
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
    publishedAt: input.publishedAt ?? null,
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

const SOURCES = {
  product: source({
    key: "phase332-wancher-sekai-ai-product",
    title: "Sekai - Ai Indigo-dyed wood pen",
    url: "https://www.wancherpen.com/products/sekai-ai",
    registryKey: "wancher-official-sekai-ai-phase332",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-product-phase332",
    summary:
      "官方具体商品页确认 Olive Wood、Aizome、Dove Zogan/无夹/925 夹选项、国际墨胆或转换器、#6 JoWo/Wancher 18K/KEIRYU-Kodachi、feed 与木盒包装；蓝色尖不自动随笔附送。",
  }),
  sekai: source({
    key: "phase332-wancher-sekai-collection",
    title: "Sekai Fountain Pen Collection",
    url: "https://www.wancherpen.com/collections/sekai",
    registryKey: "wancher-official-sekai-collection-phase332",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-sekai-phase332",
    summary:
      "官方集合页用于确认 Sekai 是 Wancher 的木材与传统工艺路线集合，商品数量和库存会随时间变化。",
  }),
  worldTree: source({
    key: "phase332-wancher-world-tree-collection",
    title: "World Tree Fountain Pen Collection",
    url: "https://www.wancherpen.com/collections/world-tree",
    registryKey: "wancher-official-world-tree-collection-phase332",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-world-tree-phase332",
    summary:
      "World Tree 系列页给出木笔家族参考尺寸 13.2 mm、140.1/164.4 mm 与 27/21 g；用于家族比例语境，不把系列数字冒充 Sekai Ai 固定实测。",
  }),
  ebony: source({
    key: "phase332-wancher-world-tree-ebony-boundary",
    title: "World Tree - Ebony Fountain Pen",
    url: "https://www.wancherpen.com/products/world-tree-ebony",
    registryKey: "wancher-official-world-tree-ebony-phase332",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-ebony-boundary-phase332",
    summary:
      "同品牌具体 Ebony 页面用于划清天然乌木与 Sekai Ai 的 Olive Wood + Aizome 边界，不共享材质、颜色、图片和库存结论。",
  }),
  appelboom: source({
    key: "phase332-appelboom-world-tree-teak",
    title: "Wancher Sekai World Tree Teak Wood Fountain Pen",
    url: "https://appelboom.com/wancher-sekai-world-tree-teak-wood-fountain-pen/",
    registryKey: "appelboom-world-tree-teak-phase332",
    registryName: "Appelboom",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "appelboom-phase332",
    homepageUrl: "https://appelboom.com/",
    author: "Appelboom",
    summary:
      "专业零售商的 Teak sibling 页面用于交叉核对 World Tree/Sekai 的天然木材与 C/C 语境，不替代 Sekai Ai 官方页。",
  }),
  diagram: source({
    key: "phase332-wancher-sekai-ai-svg",
    title: "Wancher Sekai Ai factual diagram",
    url: SVG_PATH,
    registryKey: "fountain-pen-graph-editorial-phase332-sekai-ai",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase332",
    homepageUrl: "/",
    summary:
      "本站原创事实 SVG，标示 Olive Wood、Aizome、Dove Zogan/夹件、国际墨胆/转换器和尖材边界；非产品照片、非 Logo、非比例图、非颜色校样。",
  }),
} as const;

const model: CuratedEntityPack = {
  key: "phase332-wancher-sekai-ai-v1",
  entityId: PHASE332_SEKAI_AI_ID,
  expectedType: "pen",
  expectedSlug: PHASE332_SEKAI_AI_SLUG,
  canonicalName: "Wancher Sekai Ai",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-sekai-ai-phase332.md",
  storyTitle: "Wancher Sekai Ai：Olive Wood 上的 Aizome 蓝染",
  primarySourceKey: SOURCES.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Sekai - Ai", language: "en", sourceKey: SOURCES.product.key },
    { alias: "World Tree Ai", language: "en", sourceKey: SOURCES.product.key },
    { alias: "Wancher Sekai Ai", language: "en", sourceKey: SOURCES.sekai.key },
    { alias: "万佳 Sekai Ai 蓝染木笔", language: "zh", sourceKey: SOURCES.product.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Wancher Sekai Ai / World Tree Ai current product",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "#6 JoWo stainless steel、Wancher 18K gold 或 KEIRYU/Kodachi；蓝色尖为额外选项",
      materialScope:
        "Olive Wood base with Indigo Dyeing (Aizome); handmade colour and grain variation",
      editionScope:
        "Sekai Ai/Dove Zogan SKU; not World Tree Ebony or other wood/Urushi variants",
    },
    {
      key: `${SCOPE}-boundary`,
      scopeKey: `${SCOPE}-boundary`,
      productionState: "current",
      editionScope:
        "Independent from World Tree Ebony/Teak/Sandalwood/Verawood, Dream Pen, Sekai Aizu Urushi and Shizuku Glass Nib",
    },
    {
      key: `${SCOPE}-care`,
      scopeKey: `${SCOPE}-care`,
      productionState: "current",
      editionScope:
        "No alcohol or detergent on final coating; use water and soft cloth; inspect wood and feed before service",
    },
  ],
  claims: [
    claim(
      "phase332-sekai-ai-identity",
      "model_identity",
      "Sekai Ai（World Tree Ai）是 Wancher 以 Olive Wood 和 Aizome 蓝染构成的具体商品 SKU，不是 Sekai collection 导航，也不与 World Tree Ebony 合并。",
      SOURCES.product.key,
      "official product title, World Tree Ai naming and base material",
    ),
    claim(
      "phase332-sekai-ai-material",
      "material_and_craft",
      "官方把 Olive Wood 作为基材，以 Indigo Dyeing（Aizome）形成蓝色；每支分别染色，蓝色深浅和木纹显现会有手工差异。",
      SOURCES.product.key,
      "Base - Olivewood and Aizome description",
    ),
    claim(
      "phase332-sekai-ai-artisan",
      "craft_origin_scope",
      "官方说明 World Tree Ai 由大分县中津的 Aizome Masters 染色；这证明工艺合作语境，不把整支钢笔或所有部件的产地扩大到中津。",
      SOURCES.product.key,
      "Aizome Masters of Nakatsu paragraph and conservative origin boundary",
    ),
    claim(
      "phase332-sekai-ai-variants",
      "variant_options",
      "当前页面列无夹、Zogan Dove、925 Matte Silver Clip 和 925 Silver Clip；Dove Zogan 是版本选项，实际库存和可售状态随页面变化。",
      SOURCES.product.key,
      "variant selector and current availability note",
    ),
    claim(
      "phase332-sekai-ai-blue-nib",
      "nib_boundary",
      "商品图片中的蓝色尖不自动包含，官方说明需要额外购买；不可由图片反推实际订单的尖材或尖幅。",
      SOURCES.product.key,
      "blue nib purchase note",
    ),
    claim(
      "phase332-sekai-ai-fill",
      "filling_system",
      "官方规格写明 European International Standard cartridge 或 converter，包装包括墨胆、转换器、传统日式木盒和说明材料。",
      SOURCES.product.key,
      "filling mechanism and packaging fields",
    ),
    claim(
      "phase332-sekai-ai-nib",
      "nib_options",
      "官方列出 #6 JoWo stainless steel、Wancher 18K gold、KEIRYU/Kodachi，以及 plastic、black ebonite、red ebonite feed；配置应按 SKU 核对。",
      SOURCES.product.key,
      "nib and feed specification",
    ),
    claim(
      "phase332-sekai-ai-care",
      "maintenance",
      "官方警告酒精或清洁剂可能移除最终涂层，建议以温和清洁方式或清水配软布擦拭；木面不应强抛光或自行强拆。",
      SOURCES.product.key,
      "product care note",
    ),
    claim(
      "phase332-sekai-ai-family",
      "family_boundary",
      "World Tree collection 的 13.2 mm、140.1/164.4 mm、27/21 g 只能作为 Sekai 木笔家族参考；本页不把这些系列数字写成每支 Ai 的实测保证。",
      SOURCES.worldTree.key,
      "World Tree collection family dimensions and weights",
    ),
    claim(
      "phase332-sekai-ai-ebony-boundary",
      "identity_boundary",
      "World Tree Ebony 是天然乌木 SKU；Sekai Ai 是 Olive Wood + Aizome + Dove Zogan/夹件路线，二者不共享材质、颜色、图片、库存或所有重量结论。",
      SOURCES.ebony.key,
      "same-brand Ebony sibling comparison",
    ),
    claim(
      "phase332-sekai-ai-cross-check",
      "professional_cross_check",
      "Appelboom 的 World Tree Teak 页面只作为专业零售交叉窗口，支持家族级天然木材和 C/C 语境；不替代 Sekai Ai 官方商品页。",
      SOURCES.appelboom.key,
      "retailer sibling-page scope limitation",
    ),
    claim(
      "phase332-sekai-ai-media",
      "media_identity_boundary",
      "主图是本站原创 factual SVG，非产品照片、非 Logo、非比例图、非颜色校样，不证明真实蓝色、珍珠母细节、库存或实际尖材组合。",
      SOURCES.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase332-sekai-ai-clip",
      name: "No Clip / Zogan Dove / 925 Matte Silver Clip / 925 Silver Clip",
      notes: "官方版本选择；不建立多个基础型号，库存按当前页面核对。",
      sourceKey: SOURCES.product.key,
      variantKind: "market_sku",
      market: "Wancher international listing",
    },
    {
      key: "phase332-sekai-ai-aizome",
      name: "Olive Wood + Indigo Dyeing (Aizome)",
      notes: "蓝染工艺路线；每支色深和纹理显现有手工差异。",
      sourceKey: SOURCES.product.key,
      variantKind: "material",
      market: "Wancher Sekai collection",
    },
    {
      key: "phase332-sekai-ai-nib-feed",
      name: "#6 JoWo stainless / Wancher 18K / KEIRYU-Kodachi; plastic or ebonite feed",
      notes: "尖材和 feed 按订单组合；蓝色尖不是默认随笔附送。",
      sourceKey: SOURCES.product.key,
      variantKind: "nib",
      market: "Wancher international listing",
    },
  ],
  spec: {
    brandEntityId: PHASE332_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Sekai Ai / World Tree Ai",
      release_year: "当前商品与集合页读取于 2026-07-28；不据此推断首发年份",
      origin_country:
        "Wancher 日本品牌语境；官方说明中津 Aizome 工艺合作，不把整支笔产地过度外推",
      nib: "#6 JoWo 不锈钢尖、Wancher 18K 金尖或 KEIRYU/Kodachi；蓝色尖可能需另购",
      fill_system: "European International Standard cartridge 或 converter",
      material: "Olive Wood + Indigo Dyeing (Aizome)，每支颜色和木纹显现有手工差异",
      dimensions: "World Tree 系列参考：直径 13.2 mm；闭帽 140.1 mm；插帽 164.4 mm",
      weight: "World Tree 系列参考：27 g（含夹）；21 g（无夹）；Sekai Ai 实物按 SKU 核对",
      price_range: "官方当前页面显示价格约 $150–$230，币种、版本和库存会变化",
      status: "Wancher 当前 Sekai Ai 商品；Dove Zogan/夹件、尖材、feed、包装和库存按 SKU 核对",
    },
    evidence: [
      evidence("phase332-sekai-ai-brand", "brand_entity_id", SOURCES.product.key, "Wancher official product context"),
      evidence("phase332-sekai-ai-series", "series_name", SOURCES.product.key, "Sekai - Ai and World Tree Ai naming"),
      evidence("phase332-sekai-ai-release", "release_year", SOURCES.product.key, "retrieval date only; launch year not asserted"),
      evidence("phase332-sekai-ai-origin", "origin_country", SOURCES.product.key, "Nakatsu Aizome collaboration with conservative origin boundary"),
      evidence("phase332-sekai-ai-nib", "nib", SOURCES.product.key, "official nib options and blue nib note"),
      evidence("phase332-sekai-ai-fill", "fill_system", SOURCES.product.key, "official cartridge/converter specification"),
      evidence("phase332-sekai-ai-material", "material", SOURCES.product.key, "Olive Wood and Aizome specification"),
      evidence("phase332-sekai-ai-dimensions", "dimensions", SOURCES.worldTree.key, "World Tree collection family reference dimensions"),
      evidence("phase332-sekai-ai-weight", "weight", SOURCES.worldTree.key, "World Tree collection family reference weights"),
      evidence("phase332-sekai-ai-price", "price_range", SOURCES.product.key, "current displayed price and mutable variant selector"),
      evidence("phase332-sekai-ai-status", "status", SOURCES.product.key, "current product page and SKU boundary"),
    ],
  },
  media: [
    {
      key: "phase332-sekai-ai-primary-media",
      title: "Wancher Sekai Ai 事实图（非产品照片）",
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

export const phase332WancherSekaiAiPacks: CuratedEntityPack[] = [
  phase107WancherBrandPack,
  model,
];
