import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-02";
export const PHASE345_KILK_BRAND_ID = "phase345-kilk-brand";
export const PHASE345_ORIENT_ID = "phase345-kilk-orient";
export const PHASE345_ORIENT_SLUG = "kilk-orient";
const BRAND_SCOPE = "Kilk Istanbul/Turkey brand story, manufacturing language, and standard/limited model navigation";
const ORIENT_SCOPE = "Kilk Orient current resin, sterling-silver, nib, filling, and variant records";

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
    registryKey: "fountain-pen-graph-editorial-phase345",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase345",
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
  scopeKey: string,
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
    evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }],
  };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: ORIENT_SCOPE, locator, qualifies: true };
}

const story = web({
  key: "phase345-kilk-story",
  title: "Kilk official Our Story",
  url: "https://kilk.ist/our-story/",
  registryKey: "kilk-official-story-phase345",
  registryName: "Kilk official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "kilk-official-story-phase345",
  summary: "官方 Our Story 记载伊斯坦布尔 Üsküdar 艺术工作坊语境、设计与生产取向、标准／限量／个性化路线和 2020 团队节点。",
  locator: "Our Story lines on Istanbul, workshop, products and 2020 team",
});

const orientOfficial = web({
  key: "phase345-kilk-orient-official",
  title: "Kilk Orient official product page",
  url: "https://kilk.ist/product/orient-fountain-pen/",
  registryKey: "kilk-official-orient-phase345",
  registryName: "Kilk official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "kilk-official-orient-phase345",
  summary: "官方 Orient 页确认自身张力曲线、向日葵花瓣几何纹样、树脂、converter piston、国际卡水、颜色和钢／14K 尖选项。",
  locator: "Orient description, options and related products",
});

const goldspot = web({
  key: "phase345-kilk-goldspot",
  title: "Goldspot Kilk Orient Haphazard Red",
  url: "https://goldspot.com/products/kilk-orient-fountain-pen-in-haphazard-red",
  registryKey: "goldspot-kilk-orient-phase345",
  registryName: "Goldspot Pens",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "goldspot-kilk-orient-phase345",
  summary: "授权零售商给出 925 银、Bock #6 钢尖、140/131/155 mm、13/15 mm、20.5 g、土耳其制造和两年保证。",
  locator: "Orient description and specification table",
});

const pencilcase = web({
  key: "phase345-kilk-pencilcase",
  title: "The Pencilcase Blog Kilk Orient review",
  url: "https://www.pencilcaseblog.com/2022/09/review-kilk-orient-fountain-pen.html",
  registryKey: "pencilcase-kilk-orient-phase345",
  registryName: "The Pencilcase Blog",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pencilcase-kilk-orient-phase345",
  summary: "独立实物评测测量 139/132 mm、15/11 mm、约 20 g，并讨论银饰件、树脂、Bock #6 钢尖和握持样本。",
  locator: "dimensions, material, nib and writing sample sections",
});

const penAddict = web({
  key: "phase345-kilk-penaddict",
  title: "The Pen Addict Kilk Orient review",
  url: "https://www.penaddict.com/blog/2023/3/3/kilk-orient-fountain-pen-review",
  registryKey: "penaddict-kilk-orient-phase345",
  registryName: "The Pen Addict",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "penaddict-kilk-orient-phase345",
  summary: "独立评测交叉记录 Kilk 2012／伊斯坦布尔背景、钢 V2／#6 Bock、转换器、925 银和橙色样本的流量观察。",
  locator: "brand context, nib, filling, silver trim and sample writing",
});

const sbre = web({
  key: "phase345-kilk-sbrebrown",
  title: "SBREBrown Kilk Orient review",
  url: "https://www.sbrebrown.com/2022/11/kilk-orient-fountain-pen-review/",
  registryKey: "sbrebrown-kilk-orient-phase345",
  registryName: "SBREBrown",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "sbrebrown-kilk-orient-phase345",
  summary: "独立视频／文字评测作为树脂、卡水／转换器和尖幅选择的第三方交叉样本，不替代官方规格。",
  locator: "Kilk Orient review and fountain pen tags",
});

const svg = diagram(
  "phase345-kilk-orient-svg",
  "Kilk Orient curve and silver factual diagram",
  "/images/library/site-original/phase345/kilk/orient.svg",
);

const brand: CuratedEntityPack = {
  key: "phase345-kilk-brand-v1",
  entityId: PHASE345_KILK_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "kilk",
  canonicalName: "Kilk",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/quick/260802-kilk-orient/brand.md",
  storyTitle: "Kilk：伊斯坦布尔艺术工作坊与独立制笔路线",
  primarySourceKey: story.key,
  depthTier: "A",
  aliases: [
    { alias: "Kilk Exclusive Writing Instruments", language: "en", sourceKey: story.key },
    { alias: "Kilk Istanbul", language: "en", sourceKey: story.key },
    { alias: "Kilk 土耳其钢笔", language: "zh", sourceKey: goldspot.key },
  ],
  sources: [story, orientOfficial, goldspot, penAddict, sbre, svg],
  scopes: [{ key: BRAND_SCOPE, scopeKey: BRAND_SCOPE, productionState: "current", editionScope: "Kilk Istanbul/Turkey design and production language; standard, boutique, limited and personalized routes remain distinct." }],
  claims: [
    claim("kilk-history", "brand_history", "Kilk 官方把品牌故事放在伊斯坦布尔 Üsküdar 艺术工作坊语境，并说品牌从设计、生产到书写者关系持续发展。", story.key, BRAND_SCOPE, "Our Story workshop and Istanbul context"),
    claim("kilk-origin", "brand_origin", "官方页面把 Kilk 置于土耳其伊斯坦布尔语境；The Pen Addict 另以二级资料记录 2012 年背景，不能混作注册文件。", story.key, BRAND_SCOPE, "Istanbul and independent timeline boundary"),
    claim("kilk-production", "manufacturing_scope", "Kilk 官方称团队专业地设计和生产书写工具；不把所有外购尖、银件或零件产地扩写成同一来源。", story.key, BRAND_SCOPE, "design and production language"),
    claim("kilk-navigation", "brand_model_navigation", "官方把 boutique、limited、personalized 与 standard models 分开，并在 Orient 页列出 NovoBaroque、Noon、Celestial 等相关路线。", orientOfficial.key, BRAND_SCOPE, "standard and related model navigation"),
    claim("kilk-ergonomics", "brand_design_scope", "官方将 wit、aesthetics、ergonomics、durability 作为设计取向；它们不是所有型号的书写效果保证。", story.key, BRAND_SCOPE, "design values"),
    claim("kilk-secondary", "professional_secondary_boundary", "The Pen Addict、Pencilcase 与 SBREBrown 的 Orient 评测提供具体样本旁证，不替代品牌页面或扩写成全品牌规格。", penAddict.key, BRAND_SCOPE, "independent model sample boundary"),
    claim("kilk-care", "maintenance_guidance", "树脂、银饰件和尖座需分别温和清洁；品牌页未确认全系滴入或通用零件标准，维护建议按具体型号回到来源。", story.key, BRAND_SCOPE, "conservative brand-wide care boundary", "editorial"),
  ],
  variants: [{ key: "kilk-routes", name: "Orient、NovoBaroque、Noon、Celestial", notes: "官方产品导航中的标准／相关路线；各型号材料、装饰和供墨分别核对。", sourceKey: orientOfficial.key, variantKind: "edition_group", market: "global" }],
  timeline: [
    { key: "kilk-2012", title: "Kilk 品牌时间线旁证", eventType: "brand_founded", startDate: "2012", circa: true, description: "The Pen Addict 的独立文章将 Kilk 成立时间记为 2012；这是二级资料旁证，不是官方注册文件。", sourceKey: penAddict.key },
    { key: "kilk-2020", title: "钢笔爱好者加入团队", eventType: "design_milestone", startDate: "2020", circa: false, description: "Kilk 官方 Our Story 的团队节点；不推断所有型号的首发年份。", sourceKey: story.key },
  ],
  media: [{ key: "kilk-brand-svg", title: "Kilk 与 Orient 路线事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

const model: CuratedEntityPack = {
  key: "phase345-kilk-orient-v1",
  entityId: PHASE345_ORIENT_ID,
  expectedType: "pen",
  expectedSlug: PHASE345_ORIENT_SLUG,
  canonicalName: "Kilk Orient",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/kilk-orient-phase345.md",
  storyTitle: "Kilk Orient：把弧线、树脂和银饰件放在同一支笔上",
  primarySourceKey: orientOfficial.key,
  depthTier: "A",
  aliases: [
    { alias: "Kilk Orient Fountain Pen", language: "en", sourceKey: orientOfficial.key },
    { alias: "Orient Haphazard Red", language: "en", sourceKey: goldspot.key },
    { alias: "Kilk Orient 土耳其银饰树脂钢笔", language: "zh", sourceKey: pencilcase.key },
  ],
  sources: [orientOfficial, story, goldspot, pencilcase, penAddict, sbre, svg],
  scopes: [{ key: ORIENT_SCOPE, scopeKey: ORIENT_SCOPE, productionState: "current", editionScope: "Orient family; resin colors, steel/14k nibs and EF–BB tips are product variants, not separate mechanical models." }],
  claims: [
    claim("orient-identity", "model_identity", "Kilk Orient 是 Kilk 独立的树脂与银饰件钢笔型号；NovoBaroque、Noon、Celestial 是其它路线，不能混用规格。", orientOfficial.key, ORIENT_SCOPE, "official Orient and related product navigation"),
    claim("orient-design", "design_language", "官方以自身张力的曲线和向日葵花瓣几何纹样解释 Orient 形体；这两项是本型号设计事实。", orientOfficial.key, ORIENT_SCOPE, "Orient design description"),
    claim("orient-material", "material", "官方写 Orient 使用 high-quality resin；Goldspot 与独立评测确认桶身和饰件包含 aged／matte 925 sterling silver。", goldspot.key, ORIENT_SCOPE, "resin body and 925 silver trim"),
    claim("orient-fill", "filling_system", "官方写 converter piston 与 international standard cartridges；Goldspot 说明随笔附送国际转换器，不能外推 eyedropper。", orientOfficial.key, ORIENT_SCOPE, "converter and international cartridge paths"),
    claim("orient-nib", "nib", "官方提供 Steel 与 14k Solid Gold Platinum Plated 两种尖材、EF/F/M/B/BB 字幅；Goldspot 与评测把钢尖样本标为德国 Bock #6。", orientOfficial.key, ORIENT_SCOPE, "official nib options and independent Bock sample"),
    claim("orient-size", "physical_specification", "Goldspot 商品规格给出闭帽 140 mm、开盖 131 mm、套帽 155 mm、握位最大 13 mm、桶身最大 15 mm、总重 20.5 g；Pencilcase 的 139/132 mm 与约 20 g 是独立样本。", goldspot.key, ORIENT_SCOPE, "official-retailer specification and sample boundary"),
    claim("orient-origin", "origin_country", "Kilk 官方品牌故事置于伊斯坦布尔；Goldspot 商品页把 Orient 标为 Made in Turkey，并列两年制造保证。", goldspot.key, ORIENT_SCOPE, "Made in Turkey and warranty"),
    claim("orient-variants", "variant_boundary", "Haphazard Blue、Haphazard Red、Red Chipped、Dark Biege 以及钢／14K 尖是颜色与商品选项，不自动生成平行型号。", orientOfficial.key, ORIENT_SCOPE, "colors and nib choices"),
    claim("orient-sample", "sample_boundary", "The Pen Addict 的橙色样本与 Pencilcase 的颜色样本各自承担树脂触感、流量和夹子观察，不能泛化到所有批次。", penAddict.key, ORIENT_SCOPE, "independent sample observations"),
    claim("orient-care", "maintenance_guidance", "国际卡水／转换器清洁使用室温清水；银饰件用柔软布温和擦拭，树脂、螺纹和尖座避免酒精、研磨剂、热水与硬拧。", orientOfficial.key, ORIENT_SCOPE, "conservative resin, silver and nib care", "editorial"),
    claim("orient-buying", "selection_guidance", "选购先确认颜色、银件状态、钢／14K 尖、EF–BB 字幅和是否随笔附转换器；不要从一支偏干样本推断全系流量。", goldspot.key, ORIENT_SCOPE, "variant, nib and sample selection", "editorial"),
  ],
  variants: [
    { key: "orient-haphazard", name: "Haphazard Blue / Haphazard Red", notes: "官方产品页可见的树脂颜色选项；不是独立供墨型号。", sourceKey: orientOfficial.key, variantKind: "color", market: "global" },
    { key: "orient-other-colors", name: "Red Chipped / Dark Biege", notes: "官方 additional information 中的颜色名；库存和命名需按日期核对。", sourceKey: orientOfficial.key, variantKind: "color", market: "global" },
    { key: "orient-steel", name: "Steel Nib", notes: "官方钢尖选项；Goldspot 和评测样本标为 #6 Bock steel。", sourceKey: goldspot.key, variantKind: "nib", market: "global" },
    { key: "orient-gold", name: "14k Solid Gold Platinum Plated", notes: "官方金尖选项；不要用钢尖样本的手感和重量覆盖金尖配置。", sourceKey: orientOfficial.key, variantKind: "nib", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE345_KILK_BRAND_ID,
    values: {
      series_name: "Orient",
      release_year: "官方当前产品页可见；独立评测为 2022–2023 样本，不将评测日期当作唯一首发年份",
      origin_country: "土耳其；Kilk 官方伊斯坦布尔语境，Goldspot 标注 Made in Turkey",
      nib: "#6 Bock steel sample；official Steel / 14k Solid Gold Platinum Plated，EF/F/M/B/BB",
      fill_system: "International standard cartridges／included converter",
      material: "High-quality acrylic/resin body with aged/matte 925 sterling silver accents",
      dimensions: "Goldspot 140 mm capped, 131 mm uncapped, 155 mm posted; max section 13 mm, max barrel 15 mm",
      weight: "Goldspot 20.5 g; Pencilcase sample approximately 20 g",
      status: "Official product page currently lists the Orient family; stock, colors and prices vary by market",
    },
    evidence: [
      evidence("orient-brand", "brand_entity_id", story.key, "Kilk official brand story"),
      evidence("orient-series", "series_name", orientOfficial.key, "Orient official product page"),
      evidence("orient-release", "release_year", penAddict.key, "dated independent samples; no single launch-year assertion"),
      evidence("orient-origin", "origin_country", goldspot.key, "Made in Turkey and Istanbul brand context"),
      evidence("orient-nib-spec", "nib", orientOfficial.key, "official steel/14k and EF–BB choices"),
      evidence("orient-fill-spec", "fill_system", goldspot.key, "international cartridge/converter and included converter"),
      evidence("orient-material-spec", "material", goldspot.key, "resin body and aged 925 sterling silver"),
      evidence("orient-dimensions", "dimensions", goldspot.key, "140/131/155 mm and 13/15 mm"),
      evidence("orient-weight", "weight", goldspot.key, "20.5 g official-retailer specification"),
      evidence("orient-status", "status", orientOfficial.key, "current official product route"),
    ],
  },
  timeline: [{ key: "orient-current", title: "Orient 官方产品页核对", eventType: "model_released", startDate: RETRIEVED, circa: false, description: "2026-08-02 可访问的官方产品页与独立规格资料构成当前型号范围；不把评测日期当作首发年份。", sourceKey: orientOfficial.key }],
  media: [{ key: "orient-svg", title: "Kilk Orient 曲线与银饰件事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase345KilkOrientPacks: CuratedEntityPack[] = [brand, model];
