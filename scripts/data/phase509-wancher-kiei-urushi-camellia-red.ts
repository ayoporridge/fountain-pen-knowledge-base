import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-05";
export const PHASE509_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE509_KIEI_CAMELLIA_RED_ID = "phase509-wancher-kiei-camellia-red";
export const PHASE509_KIEI_CAMELLIA_RED_SLUG = "wancher-dream-pen-kiei-urushi-camellia-japonica-red";
const MODEL_SCOPE = "Wancher Dream Pen Kiei Urushi Camellia Japonica Red exact SKU, materials, option boundary and care";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; independenceGroup: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.independenceGroup, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase509", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase509", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作颜色证明。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey: MODEL_SCOPE, locator }] };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

const product = web({
  key: "wancher-kiei-camellia-red-official",
  title: "Wancher Dream Pen Kiei Urushi Camellia Red Fountain Pen",
  url: "https://www.wancherpen.com/products/kiei-urushi-camellia-red",
  registryKey: "wancher-official-kiei-camellia-red-phase509",
  registryName: "Wancher Pen official product page",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-kiei-camellia-red-phase509",
  summary: "官方 exact page：Camellia Japonica Red、US$600、Sold out、Kiei nuri 手工流程、天然漆黑色圆点提醒、Ebonite/Urushi、供墨、笔尖/feed、气密帽和包装。",
  locator: "exact title, price/status, Kiei concept, technique, natural Urushi note, specifications and packaging",
});

const collection = web({
  key: "wancher-kiei-collection-phase509",
  title: "Kiei Urushi Fountain Pen Collection | Wancher Official",
  url: "https://www.wancherpen.com/collections/kiei-urushi",
  registryKey: "wancher-official-kiei-collection-phase509",
  registryName: "Wancher Pen official collection",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-kiei-collection-phase509",
  summary: "官方集合页把 Camellia Red 与 Blue、Yellow、Black、Akatame、Holly Olive、Yozakura 等 Kiei sibling 分开列出，支持颜色级身份边界。",
  locator: "Kiei Urushi collection product navigation",
});

const nibGuide = web({
  key: "wancher-nib-guide-phase509",
  title: "Wancher Fountain Pen Nib Guide",
  url: "https://www.wancherpen.com/pages/nib-guide",
  registryKey: "wancher-official-nib-guide-phase509",
  registryName: "Wancher Pen official nib guide",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-nib-guide-phase509",
  summary: "官方笔尖指南说明 Wancher 18K、Keiryu、Matama 等笔尖的 feed 限制，并提醒 ebonite feed 会另收费；只用于选项兼容边界。",
  locator: "nib material, feed option, Dream Pen compatibility and replacement notes",
});

const care = web({
  key: "wancher-product-care-phase509",
  title: "Wancher Product Care Guide",
  url: "https://www.wancherpen.com/pages/product-care",
  registryKey: "wancher-official-product-care-phase509",
  registryName: "Wancher Pen official product care",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-product-care-phase509",
  summary: "官方护理页说明 Urushi 避光、防干燥、避免极端天气与冲击；Ebonite 不长时间浸水、不用化学清洁剂并以微湿布清洁。",
  locator: "Urushi/Maki-e/Raden and Ebonite material-care sections",
});

const kyotoMuseums = web({
  key: "kyoto-museums-lacquer-phase509",
  title: "A bit of knowledge about lacquer | Kyoto Museums Association",
  url: "https://kyoto-museums.city.kyoto.lg.jp/en/feature-column/lacquer/",
  registryKey: "kyoto-museums-association-lacquer-phase509",
  registryName: "Kyoto Museums Association",
  sourceType: "official",
  tier: "professional_secondary",
  independenceGroup: "kyoto-museums-association-lacquer-phase509",
  summary: "京都市博物馆协会资料提供天然漆、京都漆器和金银粉装饰背景；只解释工艺词，不替 Camellia Red 证明配方。",
  locator: "lacquer material, Kyoto lacquerware and decorative powder context",
});

const kyotoNationalMuseum = web({
  key: "kyoto-national-museum-makie-phase509",
  title: "Makie Lacquers of the Edo Period | Kyoto National Museum",
  url: "https://www.kyohaku.go.jp/old/eng/theme/floor1_6/past/shikko_20160830.html",
  registryKey: "kyoto-national-museum-makie-phase509",
  registryName: "Kyoto National Museum",
  sourceType: "official",
  tier: "professional_secondary",
  independenceGroup: "kyoto-national-museum-makie-phase509",
  summary: "京都国立博物馆资料解释蒔絵用漆的黏性固定金属粉末；只用于独立术语语境，不替 Wancher 证明叶片或层数。",
  locator: "Makie technique and lacquer exhibition context",
});

const svg = diagram("wancher-kiei-camellia-red-svg", "Kiei Camellia Red 材料、自然纹理与供墨边界事实图", "/images/library/site-original/phase509/wancher/kiei-camellia-red.svg");

const pack: CuratedEntityPack = {
  key: "phase509-wancher-kiei-camellia-red-v1",
  entityId: PHASE509_KIEI_CAMELLIA_RED_ID,
  expectedType: "pen",
  expectedSlug: PHASE509_KIEI_CAMELLIA_RED_SLUG,
  canonicalName: "Wancher Dream Pen Kiei Urushi Camellia Japonica Red",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-kiei-urushi-camellia-red-phase509.md",
  storyTitle: "Wancher Kiei Camellia Red：红色山茶花、天然漆与手工纹理边界",
  primarySourceKey: product.key,
  depthTier: "A",
  aliases: [
    { alias: "Kiei Urushi - Camellia Japonica Red", language: "en", sourceKey: product.key },
    { alias: "Dream Pen Kiei Urushi Camellia Red", language: "en", sourceKey: product.key },
    { alias: "Wancher 季映漆 山茶花红", language: "zh", sourceKey: product.key },
  ],
  sources: [product, collection, nibGuide, care, kyotoMuseums, kyotoNationalMuseum, svg],
  scopes: [
    { key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, productionState: "current", market: "global", nibScope: "Exact page lists JoWo #6 and Wancher 18K; actual nib/feed combination must be confirmed per order.", materialScope: "Ebonite, Urushi and natural leaf/gold decoration as described for this exact Red listing; exact species, layers and formula unpublished.", editionScope: "One Camellia Japonica Red colour SKU; price, Sold out status and seasonal natural variation are retrieval-window/commercial boundaries." },
    { key: "phase509-kiei-context", scopeKey: "phase509-kiei-context", productionState: "historical", materialScope: "Independent lacquer and Maki-e terminology only; no product-specific certification.", editionScope: "Craft history does not establish Red launch year or fixed edition count." },
  ],
  claims: [
    claim("red-identity", "model_identity", "Camellia Japonica Red 是 Kiei Urushi 下的红色山茶花具体 SKU，与其他 Camellia 色、Holly Olive 和 Yozakura 作品分开。", product.key, "exact product title and collection siblings"),
    claim("red-kiei-technique", "decoration_technique", "Wancher 将 Kiei nuri 描述为工匠原创并开发三年的现代 Urushi 技法，逐片处理叶材、叠加漆层、金粉赋色、贴叶并覆哑光漆。", product.key, "Kiei concept and hand process description"),
    claim("red-camellia", "design_theme", "商品标题把本 SKU 命名为 Camellia Japonica Red；红色山茶花是主题名，不等于每支笔有相同花材数量、颜色值或图案位置。", product.key, "exact title and design boundary"),
    claim("red-material", "material", "规格列 Ebonite、Urushi；工艺说明另写天然叶片、金粉和透明 Urushi，具体花材来源与漆层数量未公布。", product.key, "materials and Kieinuri technique sections"),
    claim("red-natural-mark", "surface_boundary", "官方说明 Urushi 自然形成的细小黑色圆点不应误作缺陷；Nurippanashi 哑光层也保留自然粗糙和不均匀点。", product.key, "natural Urushi note and Nurippanashi explanation"),
    claim("red-seasonality", "variation_boundary", "品牌提醒 Kiei 系列图案会随季节与年份变化；这支持天然纹理差异提醒，不证明固定限量或永久停产。", product.key, "seasonal design notice"),
    claim("red-filling", "filling_system", "供墨为 converter 或 European International Standard cartridge；页面没有授权本 SKU 作为 eyedropper 使用。", product.key, "filling mechanism"),
    claim("red-nib", "nib", "官方笔尖菜单为 #6 JoWo stainless steel 或 Wancher 18K gold，实际订购配置按页面选项确认。", product.key, "nib specification"),
    claim("red-feed", "feed", "Feed 菜单为 plastic、black ebonite、red ebonite；官方 nib guide 提醒部分笔尖只配 plastic feed，ebonite 组合需按订单核对。", nibGuide.key, "feed option and compatibility notes"),
    claim("red-cap", "cap", "商品规格写 compact air-tight cap，用于减少墨水干涸问题；未据此推断完全防漏。", product.key, "compact air-tight cap specification"),
    claim("red-packaging", "packaging", "包装包括日本木盒、Pen Kimono、说明材料、Authenticity Certificate、converter 和 cartridge。", product.key, "packaging list"),
    claim("red-price", "price", "检索窗口页面标示 US$600 并显示 Sold out；价格和库存会变，不是长期估值。", product.key, "current price and sold-out marker", "editorial"),
    claim("red-lacquer-context", "craft_terminology_context", "京都博物馆资料提供天然漆和金银粉背景，京都国立博物馆解释蒔絵术语；两者只用于独立语境。", kyotoMuseums.key, "independent lacquer and maki-e context"),
    claim("red-care-urushi", "maintenance_guidance", "官方建议 Urushi 避直晒、干燥、极端天气与强冲击，装饰表面应轻拿轻放。", care.key, "Urushi, Maki-e and Raden care"),
    claim("red-care-ebonite", "maintenance_guidance", "官方建议 Ebonite 水中不超过一分钟，不用化学清洁剂，避免直晒并以微湿布清洁。", care.key, "Ebonite care"),
    claim("red-selection", "selection_guidance", "选购或二手核对 exact title、Camellia Japonica Red、证书、附件、实际 nib/feed 组合和实物纹理；不要以顾客评论补规格。", product.key, "exact SKU and evidence boundary", "editorial"),
  ],
  variants: [
    { key: "red-nib-jowo", name: "#6 JoWo stainless steel", notes: "官方笔尖选项；实际 feed 组合按订单确认。", sourceKey: product.key, variantKind: "nib", market: "global" },
    { key: "red-nib-wancher-18k", name: "Wancher 18K gold", notes: "官方笔尖选项；官方指南对部分 18K 组合规定使用 plastic feed。", sourceKey: product.key, variantKind: "nib", market: "global" },
    { key: "red-feed-plastic", name: "Plastic feed", notes: "官方 feed 选项；部分笔尖只能配 plastic feed。", sourceKey: product.key, variantKind: "material", market: "global" },
    { key: "red-feed-ebonite-black", name: "Black ebonite feed", notes: "官方 feed 选项；兼容性和附加费用按订单核对。", sourceKey: product.key, variantKind: "material", market: "global" },
    { key: "red-feed-ebonite-red", name: "Red ebonite feed", notes: "官方 feed 选项；兼容性和附加费用按订单核对。", sourceKey: product.key, variantKind: "material", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE509_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Dream Pen Kiei Urushi",
      release_year: "独立上市年份未公布；2026-08-05 为当前 listing 核验窗口",
      origin_country: "日本品牌商品；页面说明以日本天然漆与手工材料制作，未逐组件公布产地分工",
      nib: "#6 JoWo stainless steel 或 Wancher 18K gold（按订单选项确认）",
      fill_system: "Converter 或 European International Standard cartridge",
      material: "Ebonite、Urushi、天然叶片与金粉装饰；具体花材来源和漆层数量未公布",
      dimensions: "官方 exact page 未公布本 SKU 的长度、直径",
      weight: "官方 exact page 未公布",
      price_range: "检索窗口页面标示 US$600；价格、税费和库存会变",
      status: "检索窗口显示 Sold out；不据此推断永久停产或固定限量编号",
    },
    evidence: [
      evidence("red-brand", "brand_entity_id", collection.key, "Kiei collection brand boundary"),
      evidence("red-series", "series_name", product.key, "exact title and collection context"),
      evidence("red-release", "release_year", product.key, "current listing without independent launch year"),
      evidence("red-origin", "origin_country", product.key, "Japanese Urushi and hand-process wording"),
      evidence("red-nib-spec", "nib", product.key, "nib menu"),
      evidence("red-fill-spec", "fill_system", product.key, "filling mechanism"),
      evidence("red-material-spec", "material", product.key, "materials and technique description"),
      evidence("red-dimensions", "dimensions", product.key, "exact page without published dimensions"),
      evidence("red-weight", "weight", product.key, "exact page without published weight"),
      evidence("red-price-spec", "price_range", product.key, "current price field"),
      evidence("red-status", "status", product.key, "sold-out marker and seasonal notice"),
    ],
  },
  timeline: [{ key: "red-current-listing", title: "Camellia Japonica Red exact listing verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Exact Red title, commercial status and source boundary verified on the retrieval date; this is not a release-year claim.", sourceKey: product.key }],
  conflicts: [{ key: "red-season-not-release", fieldKey: "release_year", scopeKey: MODEL_SCOPE, conflictKind: "field", status: "resolved", resolutionNote: "季节变化和三年技法开发叙述是工艺背景，不足以确定现代 Camellia Red 的首发年份；release_year 保持未公布。", members: [{ citationKey: "red-release", assertedValue: "seasonal technique context does not establish launch year" }] }],
  media: [{ key: "red-svg", title: "Kiei Camellia Red 材料、自然纹理与供墨边界图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase509WancherKieiUrushiCamelliaRedPacks: CuratedEntityPack[] = [pack];
