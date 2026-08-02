import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase107WancherBrandPack } from "./phase107-wancher-dream-pen-true-ebonite-matte-black";

export const PHASE362_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE362_TARGET_ID = "phase362-wancher-dream-pen-celluloid-bekko";
export const PHASE362_TARGET_SLUG = "wancher-dream-pen-celluloid-bekko";
const RETRIEVED = "2026-08-02";
const SCOPE = "phase362-wancher-celluloid-bekko-project";
const SVG_PATH = "/images/library/site-original/phase362/wancher/dream-pen-celluloid-bekko.svg";

function source(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup: string;
  homepageUrl?: string;
  author?: string;
  publishedAt?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const siteOriginal = sourceType === "user_submission";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    title: input.title,
    url: input.url,
    summary: input.summary,
    sourceType,
    tier: input.tier ?? (sourceType === "official" ? "primary" : "professional_secondary"),
    independenceGroup: input.independenceGroup,
    homepageUrl: input.homepageUrl ?? (siteOriginal ? "/" : input.url),
    itemType: siteOriginal ? "image" : "web_page",
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    allowedUse: siteOriginal ? "store_full" : "summary_only",
    license: siteOriginal ? "site-original" : undefined,
    archiveUrl: input.url,
    archiveLocator: siteOriginal
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

const S = {
  family: source({
    key: "phase362-wancher-bekko-family",
    registryKey: "wancher-official-celluloid-family-phase362",
    registryName: "Wancher official",
    title: "Dream Pen Celluloid: Kingyo, Bekko, Momiji & Seto",
    url: "https://www.wancherpen.com/pages/dreampen-celluloid-all-colors-kickstarter",
    independenceGroup: "wancher-official-celluloid-family-phase362",
    summary:
      "官方 family 页面把 Bekko／Bekkou（鼈甲）列为传统 celluloid 色款，描述琥珀、棕色和黑色的温暖斑驳图案，并与 Momiji、Seto 的现代 acetate 分开。",
  }),
  update: source({
    key: "phase362-wancher-bekko-july-update",
    registryKey: "wancher-official-celluloid-update-phase362",
    registryName: "Wancher official",
    title: "Dream Pen Celluloid Kickstarter Project Update JULY 2025",
    url: "https://www.wancherpen.com/blogs/news/dream-pen-celluloid-kickstarter-project-update-july-2025",
    independenceGroup: "wancher-official-celluloid-update-phase362",
    publishedAt: "2025-07-11",
    summary:
      "官方 2025 年 7 月更新列出 BEKKO 早鸟背书编号，并说明 Standard／Late Backers 计划在 2025 年 12 月发货。",
  }),
  shipping: source({
    key: "phase362-wancher-bekko-shipping-ticket",
    registryKey: "wancher-official-celluloid-shipping-phase362",
    registryName: "Wancher official",
    title: "Dream Pen Celluloid Kickstarter Shipping Ticket",
    url: "https://www.wancherpen.com/products/dream-pen-celluloid-kickstarter-shipping-ticket",
    independenceGroup: "wancher-official-celluloid-shipping-phase362",
    summary:
      "官方 shipping ticket 说明 BEKKO Super Early Bird／Early Bird 的运费票安排；它是履约资料，不提供笔身尺寸、重量或接口。",
  }),
  landing: source({
    key: "phase362-wancher-bekko-landing",
    registryKey: "wancher-official-celluloid-landing-phase362",
    registryName: "Wancher official",
    title: "Wancher × Kyoto Celluloid: Dream Pen Celluloid landing page",
    url: "https://www.wancherpen.com/pages/wancher-x-kyoto-celluloid-dream-pen-celluloid-landing-page",
    independenceGroup: "wancher-official-celluloid-landing-phase362",
    summary:
      "官方项目落地页记录 Kyoto Celluloid 合作、项目结束后的预订／公开销售语境，以及 925 银环与 titanium parts 的 family 背景。",
  }),
  jpCollection: source({
    key: "phase362-wancher-bekko-japan-collection",
    registryKey: "wancher-japan-celluloid-collection-phase362",
    registryName: "Wancher Japan official",
    title: "Dream Pen Celluloid collection — Kyoto roll-up craft",
    url: "https://jp.wancherpen.com/collections/dream-pen-celluloid-collection/keiryu",
    independenceGroup: "wancher-japan-celluloid-collection-phase362",
    summary:
      "日本官方 collection 说明 Kyoto Celluloid、川上清、Japanese Roll Up，以及 JoWo stainless、18K、Keiryu／Kodachi 等 family 尖材路线。",
  }),
  currentCollection: source({
    key: "phase362-wancher-bekko-current-collection",
    registryKey: "wancher-official-celluloid-current-collection-phase362",
    registryName: "Wancher official",
    title: "Celluloid Fountain Pen Collection",
    url: "https://www.wancherpen.com/collections/celluloid-fountain-pen-collection",
    independenceGroup: "wancher-official-celluloid-current-collection-phase362",
    summary:
      "当前国际 Celluloid collection 作为商城核查边界展示 KINGYO、SAKURA、SETO；本次检索未发现独立 BEKKO 规格卡，故不从集合页推断库存或停产。",
  }),
  care: source({
    key: "phase362-wancher-bekko-care",
    registryKey: "fountain-pen-revolution-celluloid-phase362",
    registryName: "Fountain Pen Revolution",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "fountain-pen-revolution-celluloid-phase362",
    homepageUrl: "https://fprevolutionusa.com/",
    title: "Celluloid in Modern Fountain Pens — care background",
    url: "https://fprevolutionusa.com/blogs/news/celluloid-in-modern-fountain-pens",
    author: "Kevin Thiemann",
    publishedAt: "2026-04-03",
    summary:
      "专业钢笔零售商文章补充传统／现代 celluloid 的温和保存背景；不替 Wancher 发布 BEKKO 的尺寸、尖材或当前库存。",
  }),
  diagram: source({
    key: "phase362-wancher-bekko-svg",
    registryKey: "fountain-pen-graph-editorial-phase362",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase362",
    title: "Wancher Dream Pen Celluloid BEKKO factual diagram",
    url: SVG_PATH,
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    summary:
      "本站原创 factual SVG，表达 BEKKO 的传统 celluloid 色彩、项目身份、family 级金属背景和独立规格未发布边界；非产品照片、Logo、比例图或颜色校样。",
  }),
} as const;

const brand: CuratedEntityPack = structuredClone(phase107WancherBrandPack);
brand.key = "phase362-wancher-brand-navigation-v1";
brand.markdownFile = ".planning/content-research/wancher-brand-phase362.md";
brand.storyTitle = "Wancher：Dream Pen Celluloid BEKKO 与材料导航";
brand.sources = [
  ...brand.sources,
  S.family,
  S.update,
  S.shipping,
  S.landing,
  S.jpCollection,
  S.currentCollection,
].filter((item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index);
const brandScope = brand.scopes[0]?.scopeKey ?? "phase362-wancher-brand-scope";
brand.claims = [
  ...brand.claims,
  {
    key: "phase362-wancher-bekko-navigation",
    predicate: "brand_model_navigation",
    objectText:
      "Wancher 品牌页新增 Dream Pen Celluloid BEKKO 独立入口；BEKKO 是传统 celluloid 项目色款，与 KINGYO、SAKURA、MOMIJI、SETO 及 Urushi、Ebonite、木材系列分开。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: S.family.key,
    locator: "official Celluloid family Bekko entry and material split",
    evidence: [{ key: "phase362-wancher-bekko-navigation-evidence", sourceKey: S.family.key, scopeKey: brandScope, locator: "Dream Pen Celluloid family Bekko section" }],
  } satisfies CuratedClaim,
];

const model: CuratedEntityPack = {
  key: "phase362-wancher-dream-pen-celluloid-bekko-v1",
  entityId: PHASE362_TARGET_ID,
  expectedType: "pen",
  expectedSlug: PHASE362_TARGET_SLUG,
  canonicalName: "Wancher Dream Pen Celluloid BEKKO",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-dream-pen-celluloid-bekko-phase362.md",
  storyTitle: "Wancher Dream Pen Celluloid BEKKO：传统鼈甲色 celluloid 的项目入口",
  primarySourceKey: S.family.key,
  depthTier: "A",
  aliases: [
    { alias: "Dream Pen Celluloid - BEKKO", language: "en", sourceKey: S.family.key },
    { alias: "Dream Pen Celluloid Bekko", language: "en", sourceKey: S.family.key },
    { alias: "Dream Pen Celluloid Bekkou", language: "en", sourceKey: S.family.key },
    { alias: "ドリームペン・セルロイド鼈甲", language: "ja", sourceKey: S.shipping.key },
    { alias: "万佳 Dream Pen Celluloid 鼈甲", language: "zh", sourceKey: S.family.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Wancher Dream Pen Celluloid BEKKO Kickstarter and official family colourway",
      validFrom: "2025",
      productionState: "current",
      nibScope: "family routes only; exact BEKKO nib by order and physical pen evidence",
      materialScope: "Traditional Celluloid BEKKO; family-level titanium parts and sterling silver ring context",
      editionScope: "BEKKO only; excludes KINGYO, SAKURA, MOMIJI, SETO and other Dream Pen materials",
    },
    {
      key: `${SCOPE}-unknown-fields`,
      scopeKey: `${SCOPE}-unknown-fields`,
      productionState: "unknown",
      editionScope: "No standalone current BEKKO product page with dimensions, weight, filling interface or nib width was found in the checked official collection; do not inherit sibling values",
    },
    {
      key: `${SCOPE}-media`,
      scopeKey: `${SCOPE}-media`,
      productionState: "current",
      editionScope: "site-original factual SVG; not a product photo, logo, scale drawing or colour proof",
    },
  ],
  claims: [
    claim("phase362-identity", "model_identity", "Wancher Dream Pen Celluloid BEKKO 是官方 Celluloid family 单列的鼈甲色项目色款，并在 Kickstarter 发货更新中实际进入交付批次。", S.family.key, "Bekko family entry and July project update"),
    claim("phase362-name", "name_alias", "官方页面同时使用 Bekko、Bekkou 与鼈甲写法；这些是同一色款的检索别名，不是多个实体。", S.family.key, "Bekko/Bekkou/tortoiseshell naming"),
    claim("phase362-colour", "colourway", "官方将 BEKKO 描述为 amber、brown、black 的温暖斑驳鼈甲意象；颜色叙事不证明逐支色纹、年份或稀有度。", S.family.key, "official Bekko colour description"),
    claim("phase362-material", "material_finish", "官方 family 将 BEKKO 放在 Traditional Celluloid 一侧；MOMIJI 与 SETO 的 modern cellulose acetate 说明不回填到 BEKKO。", S.family.key, "traditional versus modern material split"),
    claim("phase362-campaign", "production_history", "Wancher 2025 年 7 月更新列出 BEKKO 早鸟背书编号，并记录 Standard／Late Backers 计划于 2025 年 12 月发货。", S.update.key, "Bekko early-backer list and shipping schedule"),
    claim("phase362-shipping", "fulfillment", "官方 shipping ticket 说明 BEKKO Super Early Bird／Early Bird 支持者不需要再次购买运费票；履约档位不是硬件版本。", S.shipping.key, "Bekko shipping-ticket note"),
    claim("phase362-craft", "craft_process", "官方项目把 Dream Pen Celluloid 与 Kyoto Celluloid、Japanese Roll Up 和川上清的工艺语境联系起来；这不证明每支笔的逐支工匠记录。", S.landing.key, "Kyoto Celluloid project background"),
    claim("phase362-structure", "construction", "官方 landing 与日本 collection 提到家族级 titanium parts、钛螺纹和 925 sterling silver ring；BEKKO 订单的环色和零件处理未单列。", S.jpCollection.key, "family-level titanium and sterling ring context"),
    claim("phase362-nib", "nib_options", "日本官方 collection 列 JoWo stainless、Wancher 18K、Keiryu／Kodachi 等家族尖路线；具体 BEKKO 尖材和字幅必须按订单和尖面刻字核对。", S.jpCollection.key, "family nib routes"),
    claim("phase362-fill", "filling_system", "本次核查的官方 family、项目更新和 shipping 页面未单列 BEKKO filling system；不能从 SAKURA 或 SETO 复制接口。", S.currentCollection.key, "current collection has no standalone Bekko specification card"),
    claim("phase362-dimensions", "physical_specification", "当前核查未发现 BEKKO 独立尺寸、重量或容量数字；SAKURA 与 SETO 的 146/128 mm、21 g 等数值属于各自页面，不能作为默认值。", S.currentCollection.key, "no standalone Bekko measurement fields in checked collection"),
    claim("phase362-care", "maintenance_guidance", "传统 celluloid 应避开高温、强光、热水、酒精和强溶剂；清洁与螺纹维护应保守，并在接口不明时先确认。", S.care.key, "celluloid care background"),
    claim("phase362-buying", "selection_guidance", "购买或验收时核对完整商品名、传统 celluloid 色纹、尖面刻字、导墨器、盒卡、订单、实测尺寸和退换条件，不用同系列参数补空白。", S.update.key, "campaign and order evidence boundary", "editorial"),
  ],
  variants: [
    { key: "phase362-bekko-material", name: "BEKKO Traditional Celluloid colourway", notes: "官方 family 归类；琥珀、棕、黑的鼈甲意象。", sourceKey: S.family.key, variantKind: "material", market: "official family" },
    { key: "phase362-bekko-super-early", name: "Kickstarter Super Early Bird", notes: "履约档位；shipping ticket 说明运费处理，不证明硬件差异。", sourceKey: S.shipping.key, variantKind: "edition_group", market: "Kickstarter" },
    { key: "phase362-bekko-early", name: "Kickstarter Early Bird", notes: "官方更新列出 BEKKO 早鸟背书批次；编号不是生产序列号。", sourceKey: S.update.key, variantKind: "edition_group", market: "Kickstarter" },
    { key: "phase362-bekko-standard", name: "Kickstarter Standard / Late", notes: "官方更新计划于 2025 年 12 月发货；履约阶段不是笔身改版。", sourceKey: S.update.key, variantKind: "edition_group", market: "Kickstarter" },
    { key: "phase362-bekko-nib-routes", name: "Family nib routes", notes: "JoWo stainless、Wancher 18K、Keiryu／Kodachi 等家族路线；BEKKO 具体订单待核。", sourceKey: S.jpCollection.key, variantKind: "nib", market: "Wancher family" },
  ],
  spec: {
    brandEntityId: PHASE362_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Dream Pen Celluloid BEKKO",
      release_year: "2025 Kickstarter；官方 2025 年 7 月更新记录分批发货",
      origin_country: "Wancher × Kyoto Celluloid 日本项目语境；具体 BEKKO 组装地点未单列",
      nib: "家族可选 JoWo stainless、Wancher 18K、Keiryu／Kodachi；具体 BEKKO 订单待核",
      fill_system: "BEKKO 独立 filling system 未在本次核查的官方页面单列",
      material: "Traditional Celluloid BEKKO；家族级 titanium parts 与 925 sterling silver ring 背景",
      dimensions: "BEKKO 独立尺寸未发布；不继承 SAKURA／SETO 的 146/128 mm",
      weight: "BEKKO 独立重量未发布；不继承 SAKURA／SETO 的 21 g 或零售商样本",
      status: "官方 family 与 Kickstarter 发货记录中的项目色款；当前商城未见独立 BEKKO 规格卡",
    },
    evidence: [
      evidence("phase362-spec-brand", "brand_entity_id", S.family.key, "Wancher official Celluloid family maker context"),
      evidence("phase362-spec-series", "series_name", S.family.key, "Bekko family heading"),
      evidence("phase362-spec-release", "release_year", S.update.key, "2025 project update and shipping schedule"),
      evidence("phase362-spec-origin", "origin_country", S.landing.key, "Wancher × Kyoto Celluloid project"),
      evidence("phase362-spec-nib", "nib", S.jpCollection.key, "family JoWo, 18K and Keiryu/Kodachi routes"),
      evidence("phase362-spec-fill", "fill_system", S.currentCollection.key, "no standalone Bekko filling field in checked collection"),
      evidence("phase362-spec-material", "material", S.family.key, "Traditional Celluloid Bekko classification"),
      evidence("phase362-spec-dimensions", "dimensions", S.currentCollection.key, "no standalone Bekko measurement field in checked collection"),
      evidence("phase362-spec-weight", "weight", S.currentCollection.key, "no standalone Bekko weight field in checked collection"),
      evidence("phase362-spec-status", "status", S.update.key, "project fulfilment and current collection boundary"),
    ],
  },
  timeline: [
    {
      key: "phase362-bekko-kickstarter",
      title: "Dream Pen Celluloid BEKKO 进入 Kickstarter 项目",
      eventType: "model_released",
      startDate: "2025",
      circa: false,
      description: "官方 family 与项目更新共同记录 BEKKO 色款和实际背书批次；不把活动档位写成硬件版本。",
      sourceKey: S.update.key,
    },
    {
      key: "phase362-bekko-shipping",
      title: "BEKKO 标准／晚期支持者进入计划发货",
      eventType: "community_event",
      startDate: "2025-12",
      circa: true,
      description: "官方 2025 年 7 月更新计划 Standard／Late Backers 于 2025 年 12 月发货；计划时间不是今日库存保证。",
      sourceKey: S.update.key,
    },
  ],
  media: [
    {
      key: "phase362-bekko-primary-media",
      title: "Wancher Dream Pen Celluloid BEKKO 事实图（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary",
    },
  ],
};

export const phase362WancherDreamPenCelluloidBekkoPacks: CuratedEntityPack[] = [brand, model];
