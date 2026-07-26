import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE31_SAILOR_BRAND_ID,
  phase31SailorP0Packs,
} from "./phase31-sailor-p0";

const RETRIEVED = "2026-07-26";
export const PHASE258_SAILOR_BRAND_ID = PHASE31_SAILOR_BRAND_ID;
export const PHASE258_TUZU_ID = "phase258-sailor-tuzu-adjust";
export const PHASE258_TUZU_SLUG = "sailor-tuzu-adjust";
const SCOPE = "phase258-sailor-tuzu-adjust";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.independenceGroup,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase258",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase258",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
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
    confidence: factClass === "core" ? 0.98 : 0.95,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-e`, sourceKey, scopeKey: SCOPE, locator }],
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

const product = web({
  key: "phase258-sailor-tuzu-product",
  title: "Sailor TUZU ADJUST Fountain Pen 2025",
  url: "https://en.sailor.co.jp/product/11-0453-2/",
  registryKey: "sailor-official-tuzu-product-phase258",
  registryName: "The Sailor Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "sailor-official-tuzu-product-phase258",
  summary: "写乐官方商品页列出 TUZU ADJUST 的 11-0453 商品编码、F/M/B 不锈钢尖、旋转笔尖、C/C 供墨、recycled PC、17.5×135 mm、20.0 g 与颜色边界。",
  locator: "Product Characteristics; Item Code; Nib; Type; Material; Size; Weight; Package",
});

const brandSite = web({
  key: "phase258-sailor-tuzu-site",
  title: "TUZU official brand site",
  url: "https://tuzu-en.sailor.co.jp/",
  registryKey: "sailor-tuzu-official-site-phase258",
  registryName: "The Sailor Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "sailor-tuzu-official-site-phase258",
  summary: "TUZU 官方品牌站说明 Rotating Nib Feature、Natural Fit Grip、F/M/B、标准与限量颜色，以及不同市场供应差异。",
  locator: "LINEUP; Rotating Nib Feature; Natural Fit Grip; product availability",
});

const topic = web({
  key: "phase258-sailor-tuzu-topic",
  title: "Sailor official TUZU ADJUST topic",
  url: "https://en.sailor.co.jp/topics/tuzu-adjust-fountain-pen-tuzu-ballpoint-pen/",
  registryKey: "sailor-tuzu-official-topic-phase258",
  registryName: "The Sailor Pen Co., Ltd.",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "sailor-tuzu-official-topic-phase258",
  summary: "写乐官方专题记录 TUZU 品牌概念、2019 年启动、约三年开发与按约 10° 刻度调整笔尖的机制说明。",
  locator: "Brand Concept; project started in 2019; Rotating Nib Feature",
});

const retailer = web({
  key: "phase258-sailor-tuzu-goulet",
  title: "Goulet Pen Company Sailor TUZU ADJUST",
  url: "https://www.gouletpens.com/products/sailor-tuzu-adjust-fountain-pen-gray",
  registryKey: "goulet-sailor-tuzu-phase258",
  registryName: "Goulet Pen Company",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "goulet-sailor-tuzu-phase258",
  summary: "独立零售商对灰色 TUZU ADJUST 的商品与握位尺寸作当前销售旁证；不替代官方商品编码、颜色库存和市场规格。",
  locator: "product listing and specification table",
});

const svg = diagram(
  "phase258-sailor-tuzu-svg",
  "Sailor TUZU ADJUST rotating nib factual diagram",
  "/images/library/site-original/phase258/sailor/tuzu-adjust.svg",
);

const inheritedBrand = phase31SailorP0Packs.find(
  (pack) => pack.entityId === PHASE258_SAILOR_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 258 cannot resolve the canonical Sailor brand pack.");

const brand: CuratedEntityPack = structuredClone(inheritedBrand);
brand.key = "phase258-sailor-brand-v1";
brand.sources = [...brand.sources, product, brandSite, topic, retailer];
brand.scopes = [
  ...brand.scopes,
  {
    key: SCOPE,
    scopeKey: SCOPE,
    productionState: "current",
    editionScope: "Sailor TUZU ADJUST 标准款导航；Forge、圆珠笔和其他 Sailor 家族单独核对。",
  },
];
brand.claims = [
  ...brand.claims,
  claim("sailor-tuzu-navigation", "brand_model_navigation", "TUZU ADJUST 是写乐面向握笔角度与握位适配的现代钢尖路线；标准款、Forge 与圆珠笔不合并为一个型号。", topic.key, "TUZU brand concept and lineup"),
];

const model: CuratedEntityPack = {
  key: "phase258-sailor-tuzu-adjust-v1",
  entityId: PHASE258_TUZU_ID,
  expectedType: "pen",
  expectedSlug: PHASE258_TUZU_SLUG,
  canonicalName: "Sailor TUZU ADJUST",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sailor-tuzu-adjust-phase258.md",
  storyTitle: "Sailor TUZU ADJUST：把笔尖角度交给握笔者",
  primarySourceKey: product.key,
  depthTier: "A",
  aliases: [
    { alias: "TUZU ADJUST Fountain Pen", language: "en", sourceKey: product.key },
    { alias: "Sailor TUZU", language: "en", sourceKey: brandSite.key },
    { alias: "写乐 TUZU 调整钢笔", language: "zh", sourceKey: topic.key },
  ],
  sources: [product, brandSite, topic, retailer, svg],
  scopes: [{
    key: SCOPE,
    scopeKey: SCOPE,
    productionState: "current",
    editionScope: "标准 TUZU ADJUST；F/M/B、常规与限量颜色按 11-0453 商品编码区分；Forge 与圆珠笔单独处理。",
  }],
  claims: [
    claim("tuzu-identity", "model_identity", "写乐官方 TUZU ADJUST Fountain Pen 是以可旋转笔尖和自然贴合握位为核心的钢笔型号；不与 TUZU ADJUST Forge 或圆珠笔合并。", product.key, "TUZU ADJUST Fountain Pen product title"),
    claim("tuzu-angle", "writing_mechanism", "Rotating Nib Feature 允许前端按约 10° 的刻度调整笔尖角度和握位关系；调节需要遵循说明并以试写确认。", topic.key, "Rotating Nib Feature and 10-degree pitches"),
    claim("tuzu-grip", "grip_design", "Natural Fit Grip 以两条缓和斜面扩大手指接触区域，让笔身滚动后仍能找到相对稳定的握法。", brandSite.key, "Natural Fit Grip"),
    claim("tuzu-nib", "nib", "标准 TUZU ADJUST 使用不锈钢尖，官方列 F、M、B 三种宽度；不把它写成 14K 或弹性 flex 尖。", product.key, "Nib: Stainless steel; item code F/M/B"),
    claim("tuzu-fill", "filling_system", "供墨类型为 cartridge & converter，官方注明包装内装有转换器；不同市场的配件以订单核对。", product.key, "Type: Converter & Cartridge type; converter fitted inside"),
    claim("tuzu-material", "material_finish", "帽、杆和握位主体使用 recycled PC，握位接触部为 ABS resin，金属部件为镍铬镀层。", product.key, "Material"),
    claim("tuzu-size", "dimensions", "官方规格给出含夹约 135 mm、最大直径约 17.5 mm、重量约 20.0 g；这些数字只绑定标准 TUZU ADJUST。", product.key, "Size and Weight"),
    claim("tuzu-colors", "variant_boundary", "标准款的 Black、Gray、Green 与 Red、Translucent Navy、Light Blue、Translucent Violet 限量色共用 11-0453 路线；颜色不是新的机械型号。", product.key, "Item Code and limited edition color list"),
    claim("tuzu-retailer-boundary", "professional_secondary_boundary", "独立零售商的灰色 TUZU ADJUST 商品页可作为当前销售与握位尺寸的旁证；不替代写乐官方商品编码、限量色和市场供应说明。", retailer.key, "product listing and specification table"),
    claim("tuzu-care", "maintenance_boundary", "旋转前端应避免硬扭和工具夹持；换墨用清水吸排，调节机构出现卡滞时联系写乐或授权销售方。", product.key, "conservative maintenance boundary for rotating front section", "editorial"),
  ],
  variants: [
    { key: "tuzu-standard-colors", name: "Black / Gray / Green", notes: "标准颜色；F/M/B 对应 11-0453-xxx 商品编码。", sourceKey: product.key, variantKind: "market_sku", market: "global" },
    { key: "tuzu-limited-colors", name: "Red / Translucent Navy / Light Blue / Translucent Violet", notes: "官方标为限量颜色；库存与供应市场可能变化。", sourceKey: brandSite.key, variantKind: "edition_group", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE258_SAILOR_BRAND_ID,
    values: {
      series_name: "TUZU ADJUST",
      release_year: "2024 官方专题记录项目与品牌开发；商品页当前标题标注 2025",
      origin_country: "日本写乐（The Sailor Pen Co., Ltd.）官方产品路线",
      nib: "不锈钢尖；F / M / B",
      fill_system: "Cartridge & converter；官方注明随笔装有转换器",
      material: "Recycled PC 主体；ABS resin 握位接触部；镍铬镀层金属件",
      dimensions: "含夹约 135 mm；最大直径约 17.5 mm",
      weight: "约 20.0 g",
    },
    evidence: [
      evidence("tuzu-brand", "brand_entity_id", product.key, "official Sailor TUZU product"),
      evidence("tuzu-series", "series_name", product.key, "TUZU ADJUST Fountain Pen title"),
      evidence("tuzu-release", "release_year", topic.key, "project started in 2019 and development context; no launch-year overclaim"),
      evidence("tuzu-origin", "origin_country", product.key, "The Sailor Pen Co., Ltd. official product"),
      evidence("tuzu-nib-spec", "nib", product.key, "Stainless steel F/M/B"),
      evidence("tuzu-fill-spec", "fill_system", product.key, "Converter & Cartridge type"),
      evidence("tuzu-material-spec", "material", product.key, "recycled PC, ABS resin and nickel chrome plating"),
      evidence("tuzu-dimensions", "dimensions", product.key, "17.5 x 135mm including clip"),
      evidence("tuzu-weight", "weight", product.key, "20.0g official weight"),
    ],
  },
  timeline: [
    { key: "tuzu-project-start", title: "TUZU 项目启动", eventType: "design_milestone", startDate: "2019", circa: false, description: "写乐官方专题以 2019 年作为项目启动节点；不是标准商品首发日。", sourceKey: topic.key },
    { key: "tuzu-product-current", title: "TUZU ADJUST 当前商品页核实", eventType: "model_released", startDate: "2025", circa: true, description: "官方商品页标题与商品编码的当前资料边界；不同市场供应以授权销售方为准。", sourceKey: product.key },
  ],
  media: [{
    key: "tuzu-adjust-svg",
    title: "Sailor TUZU ADJUST 旋转笔尖事实图（非产品照片）",
    sourceKey: svg.key,
    localPath: svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或包装。",
    sourceUrl: svg.url,
    usageStatus: "primary",
  }],
};

export const phase258SailorTuzuAdjustPacks: CuratedEntityPack[] = [brand, model];
