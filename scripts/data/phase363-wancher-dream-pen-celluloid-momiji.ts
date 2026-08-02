import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase107WancherBrandPack } from "./phase107-wancher-dream-pen-true-ebonite-matte-black";

export const PHASE363_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE363_TARGET_ID = "phase363-wancher-dream-pen-celluloid-momiji";
export const PHASE363_TARGET_SLUG = "wancher-dream-pen-celluloid-momiji";
const RETRIEVED = "2026-08-02";
const SCOPE = "phase363-wancher-celluloid-momiji-project";
const SVG_PATH = "/images/library/site-original/phase363/wancher/dream-pen-celluloid-momiji.svg";

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
    key: "phase363-wancher-momiji-family",
    registryKey: "wancher-official-celluloid-family-phase363",
    registryName: "Wancher official",
    title: "Dream Pen Celluloid: Kingyo, Bekko, Momiji & Seto",
    url: "https://www.wancherpen.com/pages/dreampen-celluloid-all-colors-kickstarter",
    independenceGroup: "wancher-official-celluloid-family-phase363",
    summary:
      "官方 family 页面把 Momiji／紅葉列为原创现代 celluloid pattern，描述日本秋叶的红金灵感，并归入 cellulose acetate，与 Kingyo、Bekko 的传统材料分开。",
  }),
  update: source({
    key: "phase363-wancher-momiji-july-update",
    registryKey: "wancher-official-celluloid-update-phase363",
    registryName: "Wancher official",
    title: "Dream Pen Celluloid Kickstarter Project Update JULY 2025",
    url: "https://www.wancherpen.com/blogs/news/dream-pen-celluloid-kickstarter-project-update-july-2025",
    independenceGroup: "wancher-official-celluloid-update-phase363",
    publishedAt: "2025-07-11",
    summary:
      "官方 2025 年 7 月更新列出 MOMIJI 早鸟背书编号，并说明 Kingyo、Momiji、Sakura Standard／Late Backers 计划于 2025 年 11 月发货。",
  }),
  shipping: source({
    key: "phase363-wancher-momiji-shipping-ticket",
    registryKey: "wancher-official-celluloid-shipping-phase363",
    registryName: "Wancher official",
    title: "Dream Pen Celluloid Kickstarter Shipping Ticket",
    url: "https://www.wancherpen.com/products/dream-pen-celluloid-kickstarter-shipping-ticket",
    independenceGroup: "wancher-official-celluloid-shipping-phase363",
    summary:
      "官方 shipping ticket 说明 Dream Pen Celluloid 的项目运费票和批次流程；不为 MOMIJI 发布尺寸、重量、尖材或接口。",
  }),
  landing: source({
    key: "phase363-wancher-momiji-landing",
    registryKey: "wancher-official-celluloid-landing-phase363",
    registryName: "Wancher official",
    title: "Wancher × Kyoto Celluloid: Dream Pen Celluloid landing page",
    url: "https://www.wancherpen.com/pages/wancher-x-kyoto-celluloid-dream-pen-celluloid-landing-page",
    independenceGroup: "wancher-official-celluloid-landing-phase363",
    summary:
      "官方项目落地页记录 Kyoto Celluloid 合作、项目结束后的预订／公开销售语境，以及 925 银环与 titanium parts 的 family 背景。",
  }),
  jpCollection: source({
    key: "phase363-wancher-momiji-japan-collection",
    registryKey: "wancher-japan-celluloid-collection-phase363",
    registryName: "Wancher Japan official",
    title: "Dream Pen Celluloid collection — Kyoto roll-up craft",
    url: "https://jp.wancherpen.com/collections/dream-pen-celluloid-collection/keiryu",
    independenceGroup: "wancher-japan-celluloid-collection-phase363",
    summary:
      "日本官方 collection 说明 Kyoto Celluloid、川上清、Japanese Roll Up，以及 JoWo stainless、18K、Keiryu／Kodachi 等 family 尖材路线。",
  }),
  currentCollection: source({
    key: "phase363-wancher-momiji-current-collection",
    registryKey: "wancher-official-celluloid-current-collection-phase363",
    registryName: "Wancher official",
    title: "Celluloid Fountain Pen Collection",
    url: "https://www.wancherpen.com/collections/celluloid-fountain-pen-collection",
    independenceGroup: "wancher-official-celluloid-current-collection-phase363",
    summary:
      "当前国际 Celluloid collection 作为商城核查边界展示 KINGYO、SAKURA、SETO；本次检索未发现独立 MOMIJI 规格卡，故不从集合页推断库存或停产。",
  }),
  care: source({
    key: "phase363-wancher-momiji-care",
    registryKey: "fountain-pen-revolution-celluloid-phase363",
    registryName: "Fountain Pen Revolution",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "fountain-pen-revolution-celluloid-phase363",
    homepageUrl: "https://fprevolutionusa.com/",
    title: "Celluloid in Modern Fountain Pens — care background",
    url: "https://fprevolutionusa.com/blogs/news/celluloid-in-modern-fountain-pens",
    author: "Kevin Thiemann",
    publishedAt: "2026-04-03",
    summary:
      "专业钢笔零售商文章补充传统／现代 celluloid 的温和保存背景；不替 Wancher 发布 MOMIJI 的尺寸、尖材或当前库存。",
  }),
  diagram: source({
    key: "phase363-wancher-momiji-svg",
    registryKey: "fountain-pen-graph-editorial-phase363",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase363",
    title: "Wancher Dream Pen Celluloid MOMIJI factual diagram",
    url: SVG_PATH,
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    summary:
      "本站原创 factual SVG，表达 MOMIJI 的现代 acetate 红金秋叶意象、项目身份、family 级金属背景和独立规格未发布边界；非产品照片、Logo、比例图或颜色校样。",
  }),
} as const;

const brand: CuratedEntityPack = structuredClone(phase107WancherBrandPack);
brand.key = "phase363-wancher-brand-navigation-v1";
brand.markdownFile = ".planning/content-research/wancher-brand-phase363.md";
brand.storyTitle = "Wancher：Dream Pen Celluloid MOMIJI 与材料导航";
brand.sources = [
  ...brand.sources,
  S.family,
  S.update,
  S.shipping,
  S.landing,
  S.jpCollection,
  S.currentCollection,
].filter((item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index);
const brandScope = brand.scopes[0]?.scopeKey ?? "phase363-wancher-brand-scope";
brand.claims = [
  ...brand.claims,
  {
    key: "phase363-wancher-momiji-navigation",
    predicate: "brand_model_navigation",
    objectText:
      "Wancher 品牌页新增 Dream Pen Celluloid MOMIJI 独立入口；MOMIJI 是现代 acetate 的红金秋叶色款，与 KINGYO、BEKKO、SAKURA、SETO 及其他材料系列分开。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: S.family.key,
    locator: "official Celluloid family Momiji entry and material split",
    evidence: [{ key: "phase363-wancher-momiji-navigation-evidence", sourceKey: S.family.key, scopeKey: brandScope, locator: "Dream Pen Celluloid family Momiji section" }],
  } satisfies CuratedClaim,
];

const model: CuratedEntityPack = {
  key: "phase363-wancher-dream-pen-celluloid-momiji-v1",
  entityId: PHASE363_TARGET_ID,
  expectedType: "pen",
  expectedSlug: PHASE363_TARGET_SLUG,
  canonicalName: "Wancher Dream Pen Celluloid MOMIJI",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-dream-pen-celluloid-momiji-phase363.md",
  storyTitle: "Wancher Dream Pen Celluloid MOMIJI：现代 acetate 的红金秋叶入口",
  primarySourceKey: S.family.key,
  depthTier: "A",
  aliases: [
    { alias: "Dream Pen Celluloid - MOMIJI", language: "en", sourceKey: S.family.key },
    { alias: "Dream Pen Celluloid Momiji", language: "en", sourceKey: S.family.key },
    { alias: "ドリームペン・セルロイド紅葉", language: "ja", sourceKey: S.shipping.key },
    { alias: "万佳 Dream Pen Celluloid 紅葉", language: "zh", sourceKey: S.family.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Wancher Dream Pen Celluloid MOMIJI Kickstarter and official family colourway",
      validFrom: "2025",
      productionState: "current",
      nibScope: "family routes only; exact MOMIJI nib by order and physical pen evidence",
      materialScope: "Modern Cellulose Acetate MOMIJI; family-level titanium parts and sterling silver ring context",
      editionScope: "MOMIJI only; excludes KINGYO, BEKKO, SAKURA, SETO and other Dream Pen materials",
    },
    {
      key: `${SCOPE}-unknown-fields`,
      scopeKey: `${SCOPE}-unknown-fields`,
      productionState: "unknown",
      editionScope: "No standalone current MOMIJI product page with dimensions, weight, filling interface or nib width was found in the checked official collection; do not inherit sibling values",
    },
    {
      key: `${SCOPE}-media`,
      scopeKey: `${SCOPE}-media`,
      productionState: "current",
      editionScope: "site-original factual SVG; not a product photo, logo, scale drawing or colour proof",
    },
  ],
  claims: [
    claim("phase363-identity", "model_identity", "Wancher Dream Pen Celluloid MOMIJI 是官方 Celluloid family 单列的秋叶色项目色款，并在 Kickstarter 发货更新中实际进入交付批次。", S.family.key, "Momiji family entry and July project update"),
    claim("phase363-name", "name_alias", "官方页面使用 Momiji 与紅葉写法；这些是同一秋叶色款的检索别名，不是多个实体。", S.family.key, "Momiji/紅葉 naming"),
    claim("phase363-colour", "colourway", "官方把 MOMIJI 描述为日本秋季红叶灵感的原创 pattern，颜色叙事集中在红与金；不证明逐支纹理、比例、年份或稀有度。", S.family.key, "official Momiji colour description"),
    claim("phase363-material", "material_finish", "官方 family 将 MOMIJI 放在 Modern Cellulose Material（cellulose acetate）一侧；KINGYO、BEKKO 的 Traditional Celluloid 说明不回填到 MOMIJI。", S.family.key, "traditional versus modern material split"),
    claim("phase363-campaign", "production_history", "Wancher 2025 年 7 月更新列出 MOMIJI 早鸟背书编号，并记录 Kingyo、Momiji、Sakura Standard／Late Backers 计划于 2025 年 11 月发货。", S.update.key, "Momiji early-backer list and shipping schedule"),
    claim("phase363-shipping", "fulfillment", "官方 shipping ticket 记录 Dream Pen Celluloid 项目运费票与分批流程；履约档位不等于 MOMIJI 硬件版本。", S.shipping.key, "project shipping-ticket flow"),
    claim("phase363-craft", "craft_process", "官方项目把 Dream Pen Celluloid 与 Kyoto Celluloid、Japanese Roll Up 和川上清的工艺语境联系起来；这不证明每支 MOMIJI 的逐支工匠记录。", S.landing.key, "Kyoto Celluloid project background"),
    claim("phase363-structure", "construction", "官方 landing 与日本 collection 提到家族级 titanium parts、钛螺纹和 925 sterling silver ring；MOMIJI 订单的环色和零件处理未单列。", S.jpCollection.key, "family-level titanium and sterling ring context"),
    claim("phase363-nib", "nib_options", "日本官方 collection 列 JoWo stainless、Wancher 18K、Keiryu／Kodachi 等家族尖路线；具体 MOMIJI 尖材和字幅必须按订单和尖面刻字核对。", S.jpCollection.key, "family nib routes"),
    claim("phase363-fill", "filling_system", "本次核查的官方 family、项目更新和 current collection 未单列 MOMIJI filling system；不能从 SAKURA 或 SETO 复制接口。", S.currentCollection.key, "current collection has no standalone Momiji specification card"),
    claim("phase363-dimensions", "physical_specification", "当前核查未发现 MOMIJI 独立尺寸、重量或容量数字；SAKURA 与 SETO 的 146/128 mm、21 g 等数值属于各自页面，不能作为默认值。", S.currentCollection.key, "no standalone Momiji measurement fields in checked collection"),
    claim("phase363-care", "maintenance_guidance", "现代 cellulose acetate 仍应避开高温、强光、热水、酒精和强溶剂；清洁与螺纹维护应保守，并在接口不明时先确认。", S.care.key, "celluloid care background"),
    claim("phase363-buying", "selection_guidance", "购买或验收时核对完整商品名、现代 acetate 色纹、尖面刻字、导墨器、盒卡、订单、实测尺寸和退换条件，不用同系列参数补空白。", S.update.key, "campaign and order evidence boundary", "editorial"),
  ],
  variants: [
    { key: "phase363-momiji-material", name: "MOMIJI Modern Cellulose Acetate colourway", notes: "官方 family 归类；红、金秋叶意象的原创 pattern。", sourceKey: S.family.key, variantKind: "material", market: "official family" },
    { key: "phase363-momiji-super-early", name: "Kickstarter Super Early Bird", notes: "项目履约档位；不证明 MOMIJI 硬件差异。", sourceKey: S.shipping.key, variantKind: "edition_group", market: "Kickstarter" },
    { key: "phase363-momiji-early", name: "Kickstarter Early Bird", notes: "官方更新列出 MOMIJI 早鸟背书批次；编号不是生产序列号。", sourceKey: S.update.key, variantKind: "edition_group", market: "Kickstarter" },
    { key: "phase363-momiji-standard", name: "Kickstarter Standard / Late", notes: "官方更新计划于 2025 年 11 月发货；履约阶段不是笔身改版。", sourceKey: S.update.key, variantKind: "edition_group", market: "Kickstarter" },
    { key: "phase363-momiji-nib-routes", name: "Family nib routes", notes: "JoWo stainless、Wancher 18K、Keiryu／Kodachi 等家族路线；MOMIJI 具体订单待核。", sourceKey: S.jpCollection.key, variantKind: "nib", market: "Wancher family" },
  ],
  spec: {
    brandEntityId: PHASE363_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Dream Pen Celluloid MOMIJI",
      release_year: "2025 Kickstarter；官方 2025 年 7 月更新记录 11 月分批发货",
      origin_country: "Wancher × Kyoto Celluloid 日本项目语境；具体 MOMIJI 组装地点未单列",
      nib: "家族可选 JoWo stainless、Wancher 18K、Keiryu／Kodachi；具体 MOMIJI 订单待核",
      fill_system: "MOMIJI 独立 filling system 未在本次核查的官方页面单列",
      material: "Modern Cellulose Material（cellulose acetate）MOMIJI；家族级 titanium parts 与 925 sterling silver ring 背景",
      dimensions: "MOMIJI 独立尺寸未发布；不继承 SAKURA／SETO 的 146/128 mm",
      weight: "MOMIJI 独立重量未发布；不继承 SAKURA／SETO 的 21 g 或零售商样本",
      status: "官方 family 与 Kickstarter 发货记录中的项目色款；当前商城未见独立 MOMIJI 规格卡",
    },
    evidence: [
      evidence("phase363-spec-brand", "brand_entity_id", S.family.key, "Wancher official Celluloid family maker context"),
      evidence("phase363-spec-series", "series_name", S.family.key, "Momiji family heading"),
      evidence("phase363-spec-release", "release_year", S.update.key, "2025 project update and shipping schedule"),
      evidence("phase363-spec-origin", "origin_country", S.landing.key, "Wancher × Kyoto Celluloid project"),
      evidence("phase363-spec-nib", "nib", S.jpCollection.key, "family JoWo, 18K and Keiryu/Kodachi routes"),
      evidence("phase363-spec-fill", "fill_system", S.currentCollection.key, "no standalone Momiji filling field in checked collection"),
      evidence("phase363-spec-material", "material", S.family.key, "Modern Cellulose Material and cellulose acetate classification"),
      evidence("phase363-spec-dimensions", "dimensions", S.currentCollection.key, "no standalone Momiji measurement field in checked collection"),
      evidence("phase363-spec-weight", "weight", S.currentCollection.key, "no standalone Momiji weight field in checked collection"),
      evidence("phase363-spec-status", "status", S.update.key, "project fulfilment and current collection boundary"),
    ],
  },
  timeline: [
    {
      key: "phase363-momiji-kickstarter",
      title: "Dream Pen Celluloid MOMIJI 进入 Kickstarter 项目",
      eventType: "model_released",
      startDate: "2025",
      circa: false,
      description: "官方 family 与项目更新共同记录 MOMIJI 色款和实际背书批次；不把活动档位写成硬件版本。",
      sourceKey: S.update.key,
    },
    {
      key: "phase363-momiji-shipping",
      title: "MOMIJI Standard／Late Backers 进入计划发货",
      eventType: "community_event",
      startDate: "2025-11",
      circa: true,
      description: "官方 2025 年 7 月更新计划 Kingyo、Momiji、Sakura Standard／Late Backers 于 2025 年 11 月发货；计划时间不是今日库存保证。",
      sourceKey: S.update.key,
    },
  ],
  media: [
    {
      key: "phase363-momiji-primary-media",
      title: "Wancher Dream Pen Celluloid MOMIJI 事实图（非产品照片）",
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

export const phase363WancherDreamPenCelluloidMomijiPacks: CuratedEntityPack[] = [brand, model];
