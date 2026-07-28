import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";
import { PHASE83_DIPLOMAT_BRAND_ID, phase83DiplomatLeonardoPacks } from "./phase83-diplomat-leonardo";

export const PHASE326_DIPLOMAT_BRAND_ID = PHASE83_DIPLOMAT_BRAND_ID;
export const PHASE326_EXCELLENCE_A_PLUS_ID = "phase326-pen-diplomat-excellence-a-plus";
export const PHASE326_EXCELLENCE_A_PLUS_SLUG = "diplomat-excellence-a-plus";

const RETRIEVED = "2026-07-28";
const SCOPE = "phase326-diplomat-excellence-a-plus-current";
const BOUNDARY_SCOPE = "phase326-diplomat-excellence-a-plus-boundaries";
const CARE_SCOPE = "phase326-diplomat-excellence-a-plus-care";

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
  publishedAt?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const registryKey = input.registryKey ?? "diplomat-official-phase326";
  return {
    key: input.key,
    registryKey,
    registryName: input.registryName ?? (sourceType === "official" ? "Diplomat" : "Fountain Pen Graph editorial studio"),
    sourceType,
    tier: input.tier ?? "primary",
    independenceGroup: registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://www.diplomat-pen.com/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author: input.author ?? (sourceType === "official" ? "Diplomat" : "Fountain Pen Graph editorial"),
    publishedAt: input.publishedAt ?? null,
    retrievedAt: RETRIEVED,
    allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only",
    license: sourceType === "user_submission" ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: sourceType === "user_submission"
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
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

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string, scopeKey = SCOPE): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const SOURCES = {
  collections: source({
    key: "phase326-diplomat-excellence-a-plus-collections",
    title: "Diplomat collections — Excellence A+",
    url: "https://www.diplomat-pen.com/en/collections/",
    summary: "官方集合把 Excellence A+ 与 A2 分列，并说明 A+ 是 A2 的演进，使用金属螺纹、约三分之一圈开合、弹簧夹、金属笔身，以及钢尖或 14K 双色尖。",
    locator: "Excellence A+ section and technical data",
  }),
  product: source({
    key: "phase326-diplomat-excellence-a-plus-rhomb-product",
    title: "Fountain pen Excellence A+ Rhomb guilloche lapis",
    url: "https://www.diplomat-pen.com/en/product-2/excellence-a-plus-rhomb-guilloche-lapis-fountain-pen/",
    summary: "官方 Rhomb guilloché lapis 钢尖 SKU 给出黄铜、136/155/14.7 mm、45 g、不锈钢尖、转换器与两支短国际墨胆，并标示五年保修。",
    locator: "technical data and included accessories",
  }),
  archive: source({
    key: "phase326-diplomat-excellence-a-plus-shop",
    title: "Diplomat Excellence A+ shop archive",
    url: "https://www.diplomat-pen.com/en/shop/diplomat/excellence-a/",
    summary: "官方归档列出 A+ Rhomb 与 Wave 的钢尖和 14K 钢笔商品，证明它们是精确 SKU 变体而非不同帽机制的基础型号。",
    locator: "showing all Excellence A+ products",
  }),
  nib: source({
    key: "phase326-diplomat-excellence-a-plus-14k-nib",
    title: "14 ct bi-colour nib Excellence A+",
    url: "https://www.diplomat-pen.com/en/product/excellence-a-plus-chrome-14-ct-nib-block/",
    summary: "官方 A+ 14K 前段页限定 chrome fittings，列 61 mm、7 g 和 EF/F/M/B 尖幅。",
    locator: "A+ nib block technical data",
  }),
  converter: source({
    key: "phase326-diplomat-standard-converter",
    title: "Diplomat standard plunger refill converter",
    url: "https://www.diplomat-pen.com/en/product/ink-convector/",
    summary: "官方转换器商品说明其为标准格式，适用于 Diplomat 钢笔（Viper 除外），用于瓶装墨水灌装。",
    locator: "standard converter compatibility",
  }),
  guide: source({
    key: "phase326-diplomat-service-guide",
    title: "DIPLOMAT Service Guide & Warranty",
    url: "https://www.diplomat-pen.com/wp-content/uploads/2025/07/DIPLOMAT-Service-Guide-Warranty.pdf",
    summary: "官方服务指南说明转换器/墨胆的使用、清水清洁、笔尖朝上运输和约五年保修边界。",
    locator: "PDF pp. 33–41 fountain pen filling and cleaning; warranty section",
    publishedAt: "2025-07-01",
  }),
  goulet: source({
    key: "phase326-goulet-excellence-a-plus",
    title: "Diplomat Excellence A Plus Fountain Pen — Goulet Pens",
    url: "https://www.gouletpens.com/products/diplomat-excellence-a-plus-fountain-pen-waves",
    summary: "专业零售页将 A+ Wave 说明为银填 guilloché 金属笔身、约三分之一圈螺纹帽、#6 JoWo 不锈钢尖和 standard international cartridge/converter；这些是特定 SKU 的交叉资料。",
    locator: "Details and technical specifications",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "goulet-pens-phase326",
    registryName: "Goulet Pens",
    homepageUrl: "https://www.gouletpens.com/",
    author: "Goulet Pens",
  }),
  hamilton: source({
    key: "phase326-hamilton-excellence-a-plus",
    title: "Diplomat Excellence A+ Fountain Pen — Hamilton Pen Company",
    url: "https://www.hamiltonpens.com/products/diplomat-excellence-a-fountain-pen-lapis-black-wave",
    summary: "专业经销商交叉列出 A+ 的弹簧夹、三分之一圈螺纹帽、14K 双色或抛光钢尖、两支蓝色墨胆和转换器；不替代官方 SKU 的尺寸。",
    locator: "full details and included accessories",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "hamilton-pen-company-phase326",
    registryName: "Hamilton Pen Company",
    homepageUrl: "https://www.hamiltonpens.com/",
    author: "Hamilton Pen Company",
  }),
  diagram: source({
    key: "phase326-diplomat-excellence-a-plus-svg",
    title: "Diplomat Excellence A+ factual diagram",
    url: "/images/library/site-original/phase326/diplomat/excellence-a-plus.svg",
    summary: "本站原创事实 SVG，标出 A+ 的三分之一圈螺纹帽、Rhomb 钢尖 SKU 的规格样本、尖材边界和 A2 按压帽差异；非产品照片。",
    locator: "site-original factual SVG metadata",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase326",
    registryName: "Fountain Pen Graph editorial studio",
    author: "Fountain Pen Graph editorial",
  }),
} as const;

const inheritedBrand = phase83DiplomatLeonardoPacks({
  excellenceA2: "phase83-pen-diplomat-excellence-a2",
  elox: "phase83-pen-diplomat-elox",
  momentoZero: "phase83-pen-leonardo-momento-zero",
  mzgMosaico: "phase83-pen-leonardo-mzg-mosaico",
}).find((pack) => pack.entityId === PHASE326_DIPLOMAT_BRAND_ID && pack.expectedType === "brand");
if (!inheritedBrand) throw new Error("Phase 326 Diplomat brand pack is unavailable.");

const model: CuratedEntityPack = {
  key: "phase326-diplomat-excellence-a-plus-v1",
  entityId: PHASE326_EXCELLENCE_A_PLUS_ID,
  expectedType: "pen",
  expectedSlug: PHASE326_EXCELLENCE_A_PLUS_SLUG,
  canonicalName: "Diplomat Excellence A+",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/diplomat-excellence-a-plus-phase326.md",
  storyTitle: "Diplomat Excellence A+：三分之一圈螺纹帽的 Excellence 路线",
  primarySourceKey: SOURCES.collections.key,
  depthTier: "A",
  aliases: [
    { alias: "Diplomat Excellence A+", language: "en", sourceKey: SOURCES.collections.key },
    { alias: "Excellence A Plus", language: "en", sourceKey: SOURCES.archive.key },
    { alias: "迪普洛玛 Excellence A+", language: "zh", sourceKey: SOURCES.product.key },
    { alias: "Diplomat A+", language: "en", sourceKey: SOURCES.collections.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    { key: SCOPE, scopeKey: SCOPE, market: "Diplomat Excellence A+ fountain pen family", validFrom: "2025-01-01", productionState: "current", nibScope: "stainless steel or 14K bi-colour EF/F/M/B according to SKU", materialScope: "metal body and thread; lacquer/guilloché surface according to SKU", editionScope: "A+ fountain pen; Rhomb and Wave are SKU variants" },
    { key: BOUNDARY_SCOPE, scopeKey: BOUNDARY_SCOPE, productionState: "current", editionScope: "Independent from Excellence A2 Soft Sliding Click, early Excellence A, rollerball, ballpoint and mechanical pencil" },
    { key: CARE_SCOPE, scopeKey: CARE_SCOPE, productionState: "current", editionScope: "Diplomat cartridge/converter filling, lukewarm-water cleaning and nib-up transport" },
  ],
  claims: [
    claim("phase326-a-plus-identity", "model_identity", "Excellence A+ 是 Diplomat 独立的钢笔产品线，官方将它称为 Excellence A2 的演进，而不是 A2 的颜色版本。", SOURCES.collections.key, "Excellence A+ collection identity"),
    claim("phase326-a-plus-cap", "cap_mechanism", "A+ 使用金属螺纹帽，约三分之一圈即可安静开合；弹簧夹为金属结构。", SOURCES.collections.key, "screw-on cap and spring-loaded clip"),
    claim("phase326-a-plus-spec", "specification", "官方 Rhomb guilloché lapis 钢尖 SKU 为黄铜笔身，闭帽 136 mm、插帽 155 mm、直径 14.7 mm、45 g。", SOURCES.product.key, "Rhomb steel-nib technical data"),
    claim("phase326-a-plus-nibs", "nib_options", "系列页列不锈钢尖和 14 carat bi-colour 尖；官方 A+ 14K 前段页限定 chrome fittings，并列 EF/F/M/B。", SOURCES.nib.key, "A+ nib block compatibility and sizes"),
    claim("phase326-a-plus-filling", "filling_system", "Rhomb 钢尖商品随附转换器和两支短国际墨胆；标准转换器用于瓶装墨水，具体饰件和地区附件仍按 SKU 核对。", SOURCES.product.key, "included converter and cartridges"),
    claim("phase326-a-plus-care", "maintenance", "Diplomat 服务指南用于转换器清洁、清水冲洗、换色/久置后的维护以及旅行时笔尖朝上运输。", SOURCES.guide.key, "fountain pen filling and cleaning guidance"),
    claim("phase326-a-plus-warranty", "warranty", "官方保修以完整证书、购买日期和授权经销商为条件，材料与制造缺陷覆盖购买后五年；正常磨损和未授权维修不在范围。", SOURCES.product.key, "five-year warranty and exclusions"),
    claim("phase326-a-plus-boundary", "identity_boundaries", "A+ 的三分之一圈螺纹帽不应与 A2 的 Soft Sliding Click 按压帽、早期 Excellence A、滚珠/圆珠或铅笔混写；Rhomb/Wave、钢尖/14K 和饰件是 SKU 变体。", SOURCES.collections.key, "A+ and A2 adjacent collection boundaries"),
    claim("phase326-a-plus-goulet-cross-check", "retailer_cross_check", "Goulet 的 Wave 商品将 A+ 交叉列为 #6 JoWo 不锈钢尖与 standard international cartridge/converter；这是特定 Wave SKU 的辅助证据，不覆盖所有 A+ 重量。", SOURCES.goulet.key, "Wave details and technical specifications"),
    claim("phase326-a-plus-hamilton-cross-check", "retailer_cross_check", "Hamilton 的 Lapis Black Wave 商品交叉列出三分之一圈螺纹帽、弹簧夹、钢尖/14K 尖、两支蓝色墨胆和转换器；具体颜色与库存仍以商品页为准。", SOURCES.hamilton.key, "full details and included accessories"),
    claim("phase326-a-plus-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明真实比例、颜色、刻字、库存或具体实物品相。", SOURCES.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase326-a-plus-rhomb-steel", name: "Rhomb guilloché lapis stainless steel", notes: "官方精确 SKU：黄铜、136/155/14.7 mm、45 g、转换器与两支短国际墨胆；不把此重量推广到 Wave 或 14K。", sourceKey: SOURCES.product.key, variantKind: "market_sku", productCode: "Excellence A+ Rhomb guilloche lapis", market: "EU/国际经销" },
    { key: "phase326-a-plus-wave", name: "Wave guilloché lapis", notes: "官方归档列出的 A+ 外观变体；尖材、饰件、图片与库存按商品确认。", sourceKey: SOURCES.archive.key, variantKind: "market_sku", productCode: "Excellence A+ Wave guilloche lapis", market: "EU/国际经销" },
    { key: "phase326-a-plus-14k", name: "14K bi-colour nib", notes: "官方 A+ 前段页限定 chrome fittings，EF/F/M/B；不把 gold trims 或 A2 前段默认视为兼容。", sourceKey: SOURCES.nib.key, variantKind: "nib", productCode: "Excellence A+ chrome 14 ct nib block", market: "EU/国际经销" },
  ],
  spec: {
    brandEntityId: PHASE326_DIPLOMAT_BRAND_ID,
    values: {
      series_name: "Diplomat Excellence A+",
      release_year: "当前官方目录可见；官网未给出本页可核实的首发年份",
      origin_country: "德国 Diplomat 产品线；具体制造与市场 SKU 以官方商品资料为准",
      nib: "不锈钢或 14K bi-colour；EF/F/M/B 按 SKU；Rhomb 样本为钢尖",
      fill_system: "cartridge/converter；Rhomb 商品随转换器和两支短国际墨胆；标准转换器不适用于 Viper",
      material: "金属笔身与金属螺纹；Rhomb 样本为黄铜，表面为 guilloché/漆面 SKU",
      dimensions: "Rhomb 钢尖 SKU：闭帽 136 mm、插帽 155 mm、直径 14.7 mm",
      weight: "Rhomb 钢尖 SKU 官方净重 45 g；不可泛化到 Wave、14K 或其他饰件",
      price_range: "官方归档快照：钢尖 A+ 约 €256、14K A+ 约 €690；价格、税费和库存按日期与地区核对",
      status: "官方当前集合与商店归档可见；A+ 与 A2 为不同帽机制的现行产品线",
    },
    evidence: [
      evidence("phase326-brand", "brand_entity_id", SOURCES.collections.key, "Diplomat collection context"),
      evidence("phase326-series", "series_name", SOURCES.collections.key, "Excellence A+ heading"),
      evidence("phase326-release", "release_year", SOURCES.collections.key, "current collection snapshot; no first-year claim"),
      evidence("phase326-origin", "origin_country", SOURCES.product.key, "Diplomat official product context"),
      evidence("phase326-nib", "nib", SOURCES.nib.key, "A+ 14K nib block and collection nib options"),
      evidence("phase326-fill", "fill_system", SOURCES.product.key, "converter and two short international cartridges"),
      evidence("phase326-material", "material", SOURCES.product.key, "Rhomb brass and guilloche product field"),
      evidence("phase326-dimensions", "dimensions", SOURCES.product.key, "136/155/14.7 mm"),
      evidence("phase326-weight", "weight", SOURCES.product.key, "45 g Rhomb steel SKU"),
      evidence("phase326-price", "price_range", SOURCES.archive.key, "A+ shop archive price snapshot"),
      evidence("phase326-status", "status", SOURCES.collections.key, "current A+ collection and A2 boundary"),
    ],
  },
  media: [{
    key: "phase326-a-plus-primary-media",
    title: "Diplomat Excellence A+ 事实卡（非产品照片）",
    sourceKey: SOURCES.diagram.key,
    localPath: SOURCES.diagram.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
    sourceUrl: SOURCES.diagram.url,
    usageStatus: "primary",
  }],
};

export const phase326DiplomatExcellenceAPlusPacks: CuratedEntityPack[] = [inheritedBrand, model];
