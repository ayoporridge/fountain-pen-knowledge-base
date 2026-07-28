import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";
import { PHASE83_DIPLOMAT_BRAND_ID, phase83DiplomatLeonardoPacks } from "./phase83-diplomat-leonardo";

export const PHASE330_DIPLOMAT_BRAND_ID = PHASE83_DIPLOMAT_BRAND_ID;
export const PHASE330_MAGNUM_ID = "phase330-pen-diplomat-magnum";
export const PHASE330_MAGNUM_SLUG = "diplomat-magnum";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase330-diplomat-magnum-current";

function source(input: { key: string; title: string; url: string; summary: string; registryKey: string; registryName: string; sourceType?: CuratedSource["sourceType"]; tier?: CuratedSource["tier"]; homepageUrl?: string; author?: string; publishedAt?: string }): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  return {
    key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType, tier: input.tier ?? "primary", independenceGroup: input.registryKey, title: input.title, url: input.url,
    homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://www.diplomat-pen.com/" : "/"), itemType: sourceType === "user_submission" ? "image" : "web_page", author: input.author ?? input.registryName, publishedAt: input.publishedAt ?? null, retrievedAt: RETRIEVED,
    allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only", license: sourceType === "user_submission" ? "site-original" : undefined, summary: input.summary, archiveUrl: input.url,
    archiveLocator: sourceType === "user_submission" ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.94, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }] };
}
function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence { return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true }; }

const SOURCES = {
  product: source({ key: "phase330-diplomat-magnum-product", title: "Fountain pen Magnum", url: "https://www.diplomat-pen.com/en/product/magnum-fountain-pen/", summary: "官方 Magnum 商品页列塑料与黄铜、135/153/12 mm、14 g、蓝色墨胆、两年保修、左右手定位以及 EF/F/M/B 尖幅。", registryKey: "diplomat-official-magnum-phase330", registryName: "Diplomat" }),
  archive: source({ key: "phase330-diplomat-magnum-archive", title: "Diplomat Magnum Archives", url: "https://www.diplomat-pen.com/en/shop/magnum/", summary: "官方归档把 Fountain pen Magnum Demo 与 Fountain pen Magnum 分列，并将透明色和普通颜色作为商品选择；球笔和机械铅笔不是钢笔实体。", registryKey: "diplomat-official-magnum-archive-phase330", registryName: "Diplomat" }),
  collections: source({ key: "phase330-diplomat-collections", title: "Diplomat collections — Magnum", url: "https://www.diplomat-pen.com/en/collections/", summary: "官方集合把 Magnum、Equipment、Quad、Triangle 和 Spacetec 等目录路线分开；Magnum 强调 everyday writing instrument。", registryKey: "diplomat-official-collections-phase330", registryName: "Diplomat" }),
  history: source({ key: "phase330-diplomat-history", title: "Our history — Magnum launched in 1996", url: "https://www.diplomat-pen.com/en/our-company/our-history/", summary: "官方品牌历史把 Magnum 放在 1996 年，说明它帮助 Diplomat 进入中档钢笔市场；这是系列里程碑，不是每个颜色 SKU 的生产日期。", registryKey: "diplomat-official-history-phase330", registryName: "Diplomat" }),
  guide: source({ key: "phase330-diplomat-service-guide", title: "DIPLOMAT Service Guide & Warranty", url: "https://www.diplomat-pen.com/wp-content/uploads/2025/07/DIPLOMAT-Service-Guide-Warranty.pdf", summary: "官方服务指南用于墨胆/转换器清洁、清水冲洗和笔尖朝上运输；Magnum 商品页的两年保修单独保留。", registryKey: "diplomat-official-service-phase330", registryName: "Diplomat", publishedAt: "2025-07-01" }),
  review: source({ key: "phase330-pen-addict-magnum", title: "Diplomat Magnum Fountain Pen Review", url: "https://www.penaddict.com/blog/2022/8/1/diplomat-magnum-fountain-pen-review", summary: "The Pen Addict 专业评测以样笔记录 Magnum 的轻量塑料/黄铜结构、钢尖和日用书写体验；体验限定于评测样本。", registryKey: "pen-addict-magnum-phase330", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", homepageUrl: "https://www.penaddict.com/", author: "The Pen Addict", publishedAt: "2022-08-01" }),
  diagram: source({ key: "phase330-diplomat-magnum-svg", title: "Diplomat Magnum factual diagram", url: "/images/library/site-original/phase330/diplomat/magnum.svg", summary: "本站原创 Magnum 事实 SVG，标示塑料/黄铜结构、墨胆与官方样本尺寸；非产品照片、非 Logo、非比例图、非颜色校样。", registryKey: "fountain-pen-graph-editorial-phase330-magnum", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", homepageUrl: "/" }),
} as const;

const inheritedBrand = phase83DiplomatLeonardoPacks({ excellenceA2: "phase83-pen-diplomat-excellence-a2", elox: "phase83-pen-diplomat-elox", momentoZero: "phase83-pen-leonardo-momento-zero", mzgMosaico: "phase83-pen-leonardo-mzg-mosaico" }).find((pack) => pack.entityId === PHASE330_DIPLOMAT_BRAND_ID && pack.expectedType === "brand");
if (!inheritedBrand) throw new Error("Phase 330 Diplomat brand pack is unavailable.");

const model: CuratedEntityPack = {
  key: "phase330-diplomat-magnum-v1", entityId: PHASE330_MAGNUM_ID, expectedType: "pen", expectedSlug: PHASE330_MAGNUM_SLUG, canonicalName: "Diplomat Magnum", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/diplomat-magnum-phase330.md", storyTitle: "Diplomat Magnum：面向日常与初学者的轻量钢笔", primarySourceKey: SOURCES.product.key, depthTier: "A",
  aliases: [{ alias: "Diplomat Magnum", language: "en", sourceKey: SOURCES.product.key }, { alias: "Diplomat Magnum Demo", language: "en", sourceKey: SOURCES.archive.key }, { alias: "迪普洛玛 Magnum", language: "zh", sourceKey: SOURCES.collections.key }, { alias: "迪普洛玛 马格南", language: "zh", sourceKey: SOURCES.product.key }],
  sources: Object.values(SOURCES),
  scopes: [
    { key: SCOPE, scopeKey: SCOPE, market: "Diplomat Magnum fountain pen family", validFrom: "2026-01-01", productionState: "current", nibScope: "EF/F/M/B stainless steel", materialScope: "plastic and brass structure; colours and Demo transparency by SKU", editionScope: "Magnum fountain pen; Magnum Demo and colours are variants" },
    { key: `${SCOPE}-boundary`, scopeKey: `${SCOPE}-boundary`, productionState: "current", editionScope: "Independent from Magnum ballpoint, mechanical pencil, Equipment/Quad/Triangle, Spacetec and other Diplomat fountain pen families" },
    { key: `${SCOPE}-care`, scopeKey: `${SCOPE}-care`, productionState: "current", editionScope: "Standard international cartridge/converter cleaning, nib-up transport and two-year product warranty" },
  ],
  claims: [
    claim("magnum-identity", "model_identity", "Magnum 是 Diplomat 独立的轻量日用钢笔路线；普通 Magnum 与 Magnum Demo 是同一家族的颜色/透明版本，不把球笔、铅笔或 Spacetec 合并。", SOURCES.product.key, "official Magnum product identity"),
    claim("magnum-audience", "intended_use", "官方把 Magnum 定位为适合年轻人与年长者的 everyday writing instrument，并写明可从小学一年级使用、兼顾左右手；这不是医疗或人体工学认证。", SOURCES.product.key, "everyday and right/left-handed description"),
    claim("magnum-spec", "specification", "官方当前样本为闭帽 135 mm、插帽 153 mm、直径 12 mm、净重 14 g；数字只代表商品样本，不回填到 Demo 或其他饰件。", SOURCES.product.key, "technical data"),
    claim("magnum-material", "construction", "商品页列塑料与黄铜材料；轻量来自材料组合，不等于笔身可以承受敲击、甩动或夹片横向掰动。", SOURCES.product.key, "material field and handling boundary"),
    claim("magnum-nibs", "nib_options", "官方提供 Extra-Fine、Fine、Medium、Broad 四种尖幅；The Pen Addict 的顺滑/湿润观察限定于其样笔，不是统一出厂调校承诺。", SOURCES.product.key, "nib selector and professional review boundary"),
    claim("magnum-fill", "filling_system", "官方商品随一支蓝色墨胆，处于标准国际墨胆日用语境；转换器或替代墨胆要核对实际长度和握位空间。", SOURCES.product.key, "included cartridge"),
    claim("magnum-demo", "variant_boundary", "官方归档把 Magnum Demo 作为透明色商品列出，普通 Magnum 另列多种颜色；它们共享 Magnum 钢笔身份，不建立两个基础实体。", SOURCES.archive.key, "Magnum and Magnum Demo archive"),
    claim("magnum-history", "history", "官方品牌历史把 Magnum 的推出放在 1996 年，并说明它帮助品牌进入中档钢笔市场；这不是当前颜色 SKU 的制造年份。", SOURCES.history.key, "1996 Magnum milestone"),
    claim("magnum-care", "maintenance", "换色或久置时按官方服务指南用清水冲洗尖部和转换器，避免塑料件接触热水、酒精和强溶剂；旅行时笔尖朝上。", SOURCES.guide.key, "cleaning and nib-up transport"),
    claim("magnum-warranty", "warranty", "当前 Magnum 商品页列两年保修；证书、日期、授权渠道和地区条款需按具体购买核对，不能沿用 A+ 的五年条款。", SOURCES.product.key, "two-year warranty"),
    claim("magnum-review", "professional_cross_check", "The Pen Addict 的专业评测以样笔交叉讨论轻量结构、钢尖和日用书写；体验观察不替代官方尺寸、颜色和保修。", SOURCES.review.key, "professional review scope"),
    claim("magnum-boundary", "identity_boundaries", "Magnum 的 14 g、12 mm、墨胆供墨和 EF/F/M/B 钢尖与 Traveller、CLR、Esteem、Nexus 的结构边界分开；球笔、铅笔和 Spacetec 不进入本钢笔页。", SOURCES.collections.key, "current family boundary"),
    claim("magnum-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明真实比例、透明色、Logo、库存或具体实物品相。", SOURCES.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase330-magnum-colours", name: "Bright pink / Lemon green / Crow black / Indigo blue / John Doe / Flamed red / Pearl white / Aegean blue", notes: "官方普通 Magnum 当前颜色 SKU；颜色不建立多个基础型号。", sourceKey: SOURCES.product.key, variantKind: "color", market: "EU/国际经销" },
    { key: "phase330-magnum-demo", name: "Magnum Demo blue / violet / orange", notes: "官方归档的透明/半透明外观商品；共享 Magnum 钢笔身份。", sourceKey: SOURCES.archive.key, variantKind: "market_sku", market: "EU/国际经销" },
    { key: "phase330-magnum-nibs", name: "EF / F / M / B stainless steel", notes: "官方尖幅选择；不把其他 Diplomat 系列的尖块默认兼容。", sourceKey: SOURCES.product.key, variantKind: "nib" },
  ],
  spec: {
    brandEntityId: PHASE330_DIPLOMAT_BRAND_ID,
    values: { series_name: "Diplomat Magnum", release_year: "1996（官方品牌历史中的系列里程碑）；当前颜色 SKU 年份不据此推断", origin_country: "德国 Diplomat 产品线；具体制造与地区 SKU 以商品资料核验", nib: "EF/F/M/B 不锈钢尖", fill_system: "一支蓝色墨胆；标准国际墨胆/转换器语境", material: "塑料与黄铜结构；普通颜色和 Magnum Demo 透明版本", dimensions: "闭帽 135 mm、插帽 153 mm、直径 12 mm", weight: "14 g（官方 Magnum 商品样本）", price_range: "官方当前商品快照约 €26；价格、税费和库存按地区与日期核对", status: "官方当前 Magnum 商品、归档与品牌历史可见；颜色、Demo 和尖幅按 SKU" },
    evidence: [evidence("phase330-magnum-brand", "brand_entity_id", SOURCES.product.key, "Diplomat official context"), evidence("phase330-magnum-series", "series_name", SOURCES.collections.key, "Magnum heading"), evidence("phase330-magnum-release", "release_year", SOURCES.history.key, "1996 history milestone"), evidence("phase330-magnum-origin", "origin_country", SOURCES.product.key, "Diplomat product context"), evidence("phase330-magnum-nib", "nib", SOURCES.product.key, "EF/F/M/B selector"), evidence("phase330-magnum-fill", "fill_system", SOURCES.product.key, "included blue cartridge"), evidence("phase330-magnum-material", "material", SOURCES.product.key, "plastic and brass"), evidence("phase330-magnum-dimensions", "dimensions", SOURCES.product.key, "135/153/12 mm"), evidence("phase330-magnum-weight", "weight", SOURCES.product.key, "14 g"), evidence("phase330-magnum-price", "price_range", SOURCES.product.key, "current price snapshot"), evidence("phase330-magnum-status", "status", SOURCES.archive.key, "current archive" )],
  },
  media: [{ key: "phase330-magnum-primary-media", title: "Diplomat Magnum 事实卡（非产品照片）", sourceKey: SOURCES.diagram.key, localPath: SOURCES.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。", sourceUrl: SOURCES.diagram.url, usageStatus: "primary" }],
};

export const phase330DiplomatMagnumPacks: CuratedEntityPack[] = [inheritedBrand, model];
