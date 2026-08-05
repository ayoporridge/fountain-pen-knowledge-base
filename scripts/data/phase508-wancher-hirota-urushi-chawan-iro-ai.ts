import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-05";
export const PHASE508_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE508_HIROTA_CHAWAN_AI_ID = "phase508-wancher-hirota-urushi-chawan-iro-ai";
export const PHASE508_HIROTA_CHAWAN_AI_SLUG = "wancher-hirota-urushi-chawan-iro-ai";
const MODEL_SCOPE = "Wancher Hirota Urushi Chawan-iro Ai exact SKU, one-piece notice, Chawan context and published unknowns";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; independenceGroup: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.independenceGroup, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase508", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase508", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作颜色证明。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey: MODEL_SCOPE, locator }] };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

const product = web({
  key: "wancher-hirota-chawan-iro-ai-official",
  title: "Hirota Urushi - Chawan-iro - Ai Fountain Pen | Wancher Pen",
  url: "https://www.wancherpen.com/products/hirota-urushi-chawan-iro-ai",
  registryKey: "wancher-official-hirota-chawan-iro-ai-phase508",
  registryName: "Wancher Pen official product page",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-hirota-chawan-iro-ai-phase508",
  summary: "官方 exact page：Chawan-iro - Ai、Hirota Yoko 手工漆艺语境、茶碗渐变叙事、四个技法名称、一件通知、US$850 与 Sold out 状态；未给本 SKU 笔尖/供墨/尺寸。",
  locator: "exact title, price/status, one-piece notice, Chawan-iro description, Hirota Urushi and technique sections",
});

const collection = web({
  key: "wancher-dream-pen-collection-phase508",
  title: "Dream Pen Fountain Pen Collection | Wancher Official",
  url: "https://www.wancherpen.com/collections/dream-pen",
  registryKey: "wancher-official-dream-pen-collection-phase508",
  registryName: "Wancher Pen official collection",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-dream-pen-collection-phase508",
  summary: "官方集合页提供 Dream Pen 系列入口；Ai、Byobu-e、Ume ni Hanasui 和其他 Hirota 色款应独立呈现。",
  locator: "Dream Pen collection title and navigation",
});

const care = web({
  key: "wancher-product-care-phase508",
  title: "Wancher Product Care Guide",
  url: "https://www.wancherpen.com/pages/product-care",
  registryKey: "wancher-official-product-care-phase508",
  registryName: "Wancher Pen official product care",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-product-care-phase508",
  summary: "官方护理页说明 Urushi 避光、干燥、极端天气和冲击，并提供漆面清洁边界。",
  locator: "Urushi/Maki-e/Raden material-care section",
});

const teaMuseum = web({
  key: "kyoto-national-museum-chanoyu-tea-bowls-phase508",
  title: "Feature Exhibition: Tea Bowls for Chanoyu | Kyoto National Museum",
  url: "https://www.kyohaku.go.jp/eng/exhibitions/feature/b/chanoyu_2023/",
  registryKey: "kyoto-national-museum-chanoyu-tea-bowls-phase508",
  registryName: "Kyoto National Museum",
  sourceType: "official",
  tier: "professional_secondary",
  independenceGroup: "kyoto-national-museum-chanoyu-tea-bowls-phase508",
  summary: "京都国立博物馆资料说明茶碗在茶会中既是饮茶器物，也被手持、观看和欣赏；只用于 Chawan 文化背景，不替 Ai 证明型号规格。",
  locator: "tea bowl role in chanoyu and aesthetic appreciation",
});

const svg = diagram("wancher-hirota-chawan-iro-ai-svg", "Hirota Chawan-iro Ai 身份、茶碗语境与未知规格边界事实图", "/images/library/site-original/phase508/wancher/hirota-chawan-iro-ai.svg");

const pack: CuratedEntityPack = {
  key: "phase508-wancher-hirota-chawan-iro-ai-v1",
  entityId: PHASE508_HIROTA_CHAWAN_AI_ID,
  expectedType: "pen",
  expectedSlug: PHASE508_HIROTA_CHAWAN_AI_SLUG,
  canonicalName: "Wancher Hirota Urushi Chawan-iro Ai",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-hirota-urushi-chawan-iro-ai-phase508.md",
  storyTitle: "Wancher Hirota Chawan-iro Ai：茶碗渐变意象与一件手工漆艺 SKU",
  primarySourceKey: product.key,
  depthTier: "A",
  aliases: [
    { alias: "Hirota Urushi - Chawan-iro - Ai", language: "en", sourceKey: product.key },
    { alias: "Wancher Hirota Chawan-iro Ai", language: "en", sourceKey: product.key },
    { alias: "Wancher 广田漆 茶碗色 Ai", language: "zh", sourceKey: product.key },
  ],
  sources: [product, collection, care, teaMuseum, svg],
  scopes: [
    { key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, productionState: "current", market: "global", nibScope: "Exact page does not publish this Ai SKU's nib configuration; do not inherit sibling options.", materialScope: "Hirota Urushi hand-crafted context and Chawan-iro design narrative; exact substrate, layers and formula unpublished.", editionScope: "One exact Ai colour listing; one-piece notice, Sold out state, price and future return statement are retrieval-window/commercial boundaries." },
    { key: "phase508-chawan-context", scopeKey: "phase508-chawan-context", productionState: "historical", materialScope: "Independent museum tea-bowl context only; no product-specific certification.", editionScope: "Chanoyu history does not establish Ai launch year, artisan provenance or edition count." },
  ],
  claims: [
    claim("ai-identity", "model_identity", "Chawan-iro - Ai 是 Hirota Urushi 语境下的一个具体颜色/作品 SKU，与 Byobu-e、Ume ni Hanasui、其他 Chawan 色和泛 Hirota 节点分开。", product.key, "exact title and Chawan-iro wording"),
    claim("ai-chawan-concept", "design_concept", "Wancher 用日本茶碗的细微纹理与渐变解释 Chawan-iro，并将其连接到茶会中的观看与谦逊审美；这是一手品牌设计说明。", product.key, "Chawan-iro description"),
    claim("ai-master", "artisan", "官方将 Hirota Urushi 写为 Hirota Yoko（廣田洋子）大师的日本传统 Urushi 手工艺术；没有把每个组件产地或工坊地址扩写出来。", product.key, "Hirota Urushi and Master Hirota Yoko sections"),
    claim("ai-technique-menu", "technique_context", "页面列出 Hirota 常用的四个技法名称：櫛目堆漆塗、金箔、石目堆漆塗蒟醤、金彩ひび塗；没有指明 Ai 使用其中哪一个。", product.key, "four main techniques normally used in Master Hirota's art"),
    claim("ai-one-piece", "availability_boundary", "官方通知称每种颜色只有一件、制作可能需要数月且未来不保证同款回归；这是商品页状态和制作说明，不自动等于永久限量编号。", product.key, "important one-piece notice"),
    claim("ai-tea-context", "tea_bowl_context", "京都国立博物馆资料说明茶碗在茶会中既是饮茶器物，也被手持、观看和欣赏；只用于解释 Chawan 一词。", teaMuseum.key, "tea bowl role in chanoyu"),
    claim("ai-unknown-config", "unpublished_spec_boundary", "Ai exact page 没有公布笔尖、供墨、长度、直径、重量、漆层数量或具体胎体；不从 Wancher 兄弟款借用这些字段。", product.key, "exact page scope and absence of model specification table"),
    claim("ai-price", "price", "检索窗口页面标示 US$850；价格和库存会变，不是长期估值。", product.key, "regular/sale price and sold-out marker", "editorial"),
    claim("ai-care", "maintenance_guidance", "官方护理页建议 Urushi 避直晒、干燥、极端天气和强冲击，漆面以温和方式处理。", care.key, "Urushi care"),
    claim("ai-selection", "selection_guidance", "购买和二手核对完整 Ai 标题、Hirota 署名/证书、原订单、包装和实物纹理；一件通知不应被改写为无证据的稀有度。", product.key, "exact SKU and one-piece boundary", "editorial"),
  ],
  variants: [{ key: "ai-one-piece", name: "Ai one-piece listing", notes: "官方颜色级一件通知；不创建虚构编号，也不把其他 Chawan 色合并进来。", sourceKey: product.key, variantKind: "edition_group", market: "global" }],
  spec: {
    brandEntityId: PHASE508_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Hirota Urushi Chawan-iro",
      release_year: "独立上市年份未公布；2026-08-05 为当前 listing 核验窗口",
      origin_country: "Wancher 日本商品；exact page 未对每个组件产地作统一声明",
      nib: "官方 exact page 未公布本 Ai SKU 的笔尖配置",
      fill_system: "官方 exact page 未公布本 Ai SKU 的供墨配置",
      material: "Hirota Urushi 手工语境与 Chawan-iro 茶碗意象；具体胎体、漆层和配方未公布",
      dimensions: "官方 exact page 未公布本 Ai SKU 的长度、直径",
      weight: "官方 exact page 未公布",
      price_range: "检索窗口页面标示 US$850；价格与库存会变",
      status: "检索窗口显示 Sold out；每种颜色一件且未来不保证回归，不据此推断永久停产",
    },
    evidence: [
      evidence("ai-brand", "brand_entity_id", collection.key, "Dream Pen collection brand boundary"),
      evidence("ai-series", "series_name", product.key, "exact title and collection context"),
      evidence("ai-release", "release_year", product.key, "current listing without independent launch year"),
      evidence("ai-origin", "origin_country", product.key, "Japanese traditional Urushi wording without component-level origin"),
      evidence("ai-nib", "nib", product.key, "exact page without Ai nib specification"),
      evidence("ai-fill", "fill_system", product.key, "exact page without Ai filling specification"),
      evidence("ai-material", "material", product.key, "Hirota Urushi and Chawan-iro description without substrate/layer formula"),
      evidence("ai-dimensions", "dimensions", product.key, "exact page without dimensions"),
      evidence("ai-weight", "weight", product.key, "exact page without weight"),
      evidence("ai-price", "price_range", product.key, "current price field"),
      evidence("ai-status", "status", product.key, "sold-out and one-piece notice"),
    ],
  },
  timeline: [{ key: "ai-current-listing", title: "Chawan-iro Ai exact listing verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Exact Ai title, one-piece notice and source boundary verified on the retrieval date; this is not a release-year claim.", sourceKey: product.key }],
  conflicts: [{ key: "ai-one-piece-not-release", fieldKey: "release_year", scopeKey: MODEL_SCOPE, conflictKind: "field", status: "resolved", resolutionNote: "一件通知和数月制作周期是当前商品/制作说明，不提供现代型号首发年份；release_year 保持未公布。", members: [{ citationKey: "ai-release", assertedValue: "one-piece notice does not establish launch year" }] }],
  media: [{ key: "ai-svg", title: "Hirota Chawan-iro Ai 身份、茶碗语境与未知规格边界图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase508WancherHirotaUrushiChawanAiPacks: CuratedEntityPack[] = [pack];
