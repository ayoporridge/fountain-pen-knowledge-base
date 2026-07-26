import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-27";
export const PHASE279_OPUS88_BRAND_ID = "I6tjleAZx9RU";
export const PHASE279_OPUS88_BRAND_SLUG = "opus88";
export const PHASE279_OPERA_ID = "phase279-opus88-premium-opera";
export const PHASE279_OPERA_SLUG = "opus-88-premium-opera";
const MODEL_SCOPE = "phase279-opus88-premium-opera";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; group: string; summary: string; locator: string }): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.group,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: input.url.endsWith(".pdf") ? "pdf" : "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase279",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase279",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core", scopeKey = MODEL_SCOPE): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.96 : 0.93,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, locator, scopeKey }],
  };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

const manual = web({
  key: "phase279-opus88-quick-start",
  title: "Opus 88 Eyedropper Fountain Pen Quick Start Guide",
  url: "https://feedbackfromalex.com/wp-content/uploads/2025/07/Opus88QuickStart.pdf",
  registryKey: "opus88-quick-start-phase279",
  registryName: "Opus 88 Quick Start Guide",
  sourceType: "official",
  tier: "contemporary_archive",
  group: "opus88-quick-start-phase279",
  summary: "说明书写明 Opus 88 滴入式钢笔不接受墨囊，使用滴管灌墨、打开或关闭止墨阀，并给出清洗和航空携带步骤；PDF 保留 Opus 88 联系信息。",
  locator: "pages 1-2: filling, shut-off valve, cleaning, travel and manufacturer contact",
});

const authorizedProduct = web({
  key: "phase279-opus88-opera-juspirit",
  title: "JUSPIRIT：OPUS 88 Premium Series / Opera",
  url: "https://juspirit.com/collections/opus88-premium-series",
  registryKey: "juspirit-opus88-premium-phase279",
  registryName: "JUSPIRIT",
  sourceType: "retailer",
  tier: "primary",
  group: "juspirit-opus88-premium-phase279",
  summary: "台湾授权渠道的 Premium Series 导航把 Opera 放在 Bock #250 大尖组，并列出台湾制造、EF/F/M/B/2.3 Stub 与日式滴入式等筛选边界。",
  locator: "Premium Series introduction, Bock #250 grouping, made-in-Taiwan and Opera filters",
});

const stilo = web({
  key: "phase279-opus88-opera-stilo",
  title: "Stilo e Stile：Opus 88 Premium Opera Brown Dot",
  url: "https://www.stiloestile.com/en/fountain-pens/opus-88-premium-opera-fountain-pen-brown-dot",
  registryKey: "stiloestile-opus88-opera-phase279",
  registryName: "Stilo e Stile",
  sourceType: "retailer",
  tier: "professional_secondary",
  group: "stiloestile-opus88-opera-phase279",
  summary: "专业钢笔零售档案给出 Brown Dot 的树脂、漆帽、No. 250 钢尖、EF/F/M/B/2.3 Stub、台湾制造、闭合 144 mm、笔杆 130 mm、直径 15 mm 与 34 g。",
  locator: "data sheet and product details for Brown Dot SKU",
});

const pencilcase = web({
  key: "phase279-opus88-flow-pencilcase",
  title: "The Pencilcase Blog：Opus 88 Flow Fountain Pen Review",
  url: "https://www.pencilcaseblog.com/2020/08/review-opus-88-flow-fountain-pen.html",
  registryKey: "pencilcase-opus88-flow-phase279",
  registryName: "The Pencilcase Blog",
  sourceType: "blog",
  tier: "professional_secondary",
  group: "pencilcase-opus88-flow-phase279",
  summary: "同品牌独立评测解释 Opus 88 日式滴入式的止墨杆、O-ring 与 Bock 路线；仅用于 Premium Opera 的共通结构和维护边界旁证，不移植 Flow 的尺寸。",
  locator: "filling mechanism, shut-off rod, O-ring and Bock nib discussion",
});

const svg = diagram("phase279-opus88-opera-svg", "Opus 88 Premium Opera factual diagram", "/images/library/site-original/phase279/opus88/premium-opera.svg");

const brandScope = "phase279-opus88-brand";

const brand: CuratedEntityPack = {
  key: "phase279-opus88-brand-v1",
  entityId: PHASE279_OPUS88_BRAND_ID,
  expectedType: "brand",
  expectedSlug: PHASE279_OPUS88_BRAND_SLUG,
  canonicalName: "Opus 88",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/opus88-brand-phase279.md",
  storyTitle: "Opus 88：台湾制造与日式滴入式型号地图",
  primarySourceKey: authorizedProduct.key,
  depthTier: "B",
  aliases: [
    { alias: "Opus 88", language: "en", sourceKey: authorizedProduct.key },
    { alias: "OPUS88", language: "en", sourceKey: authorizedProduct.key },
    { alias: "精基实业", language: "zh", sourceKey: authorizedProduct.key },
    { alias: "Opus 88 钢笔", language: "zh", sourceKey: manual.key },
  ],
  sources: [manual, authorizedProduct, stilo, pencilcase, svg],
  scopes: [{ key: brandScope, scopeKey: brandScope, market: "Opus 88 brand navigation and model families", productionState: "current", editionScope: "Demonstrator, Koloro, Jazz, Omar, Premium Opera and future families remain separate identities." }],
  claims: [
    claim("opus88-brand-identity", "brand_identity", "Opus 88 是台湾制造语境下的钢笔品牌；本文保留来源之间对历史年份的差异，不把一个年份写成唯一成立年。", authorizedProduct.key, "brand introduction and made-in-Taiwan boundary", "core", brandScope),
    claim("opus88-brand-filling", "filling_system", "日式滴入式与尾部 shut-off valve 是品牌重要结构语言，但每个型号的笔尖平台、尺寸和材料仍需独立核对。", manual.key, "eyedropper guide and shut-off valve", "core", brandScope),
    claim("opus88-brand-navigation", "brand_navigation", "Demonstrator、Koloro、Jazz、Omar 与 Premium Opera 是不同型号路线；Premium Opera 的 Bock 250 不回填到 JoWo 路线。", authorizedProduct.key, "model grouping and nib platform filters", "core", brandScope),
    claim("opus88-brand-material", "material_finish", "透明树脂、硬橡胶、漆面帽和金属饰件在不同系列组合方式不同；颜色和限量批次属于 variant。", stilo.key, "Premium Opera material boundary as a model-specific example", "core", brandScope),
    claim("opus88-brand-care", "maintenance_guidance", "换墨、清洗、阀门关闭和 O-ring 保养必须顺着具体结构；不要用墨囊、热水、India ink 或厚硅脂替代说明书。", manual.key, "cleaning and warning sections", "editorial", brandScope),
  ],
  variants: [
    { key: "opus88-demonstrator", name: "Demonstrator", notes: "透明展示路线；另有独立型号页。", sourceKey: pencilcase.key, variantKind: "edition_group", market: "global" },
    { key: "opus88-koloro", name: "Koloro", notes: "双色树脂与 JoWo #5 路线；Kolora 只作别名。", sourceKey: pencilcase.key, variantKind: "edition_group", market: "global" },
    { key: "opus88-jazz", name: "Jazz", notes: "圆润日用外形与 JoWo 路线；不与 Premium Opera 合并。", sourceKey: pencilcase.key, variantKind: "edition_group", market: "global" },
    { key: "opus88-omar", name: "Omar", notes: "大容量传统滴入式路线；另有独立型号页。", sourceKey: pencilcase.key, variantKind: "edition_group", market: "global" },
    { key: "opus88-premium-opera", name: "Premium Opera", notes: "装饰树脂、Dot 帽与 Bock Type 250；本批新增独立型号页。", sourceKey: stilo.key, variantKind: "edition_group", market: "global" },
  ],
  timeline: [
    { key: "opus88-brand-oem", title: "台湾 OEM/ODM 制造背景进入品牌资料", eventType: "brand_founded", startDate: "1977", circa: true, description: "JUSPIRIT 品牌介绍把 Opus 88 与台湾零件加工和 OEM/ODM 背景联系起来；年份只作为该来源的历史边界。", sourceKey: authorizedProduct.key },
    { key: "opus88-premium-route", title: "Premium Opera 被列入 Bock #250 路线", eventType: "design_milestone", startDate: "2021", circa: true, description: "JUSPIRIT 的 Premium Series 导航将 Opera 与 Bock #250 组并列，和 JoWo #5/#6 路线分开。", sourceKey: authorizedProduct.key },
  ],
  media: [{ key: "opus88-brand-media", title: svg.title, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图或颜色校样。", sourceUrl: svg.url, usageStatus: "primary" }],
};

const model: CuratedEntityPack = {
  key: "phase279-opus88-premium-opera-v1",
  entityId: PHASE279_OPERA_ID,
  expectedType: "pen",
  expectedSlug: PHASE279_OPERA_SLUG,
  canonicalName: "Opus 88 Premium Opera",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/opus88-premium-opera-phase279.md",
  storyTitle: "Opus 88 Premium Opera：Bock 250 与止墨阀的装饰路线",
  primarySourceKey: authorizedProduct.key,
  depthTier: "A",
  aliases: [
    { alias: "Opus 88 Premium Opera", language: "en", sourceKey: stilo.key },
    { alias: "Opus 88 Opera", language: "en", sourceKey: authorizedProduct.key },
    { alias: "Premium Opera Brown Dot", language: "en", sourceKey: stilo.key, market: "global" },
    { alias: "Opus 88 Opera 高端版", language: "zh", sourceKey: authorizedProduct.key },
  ],
  sources: [manual, authorizedProduct, stilo, pencilcase, svg],
  scopes: [{
    key: MODEL_SCOPE,
    scopeKey: MODEL_SCOPE,
    market: "Opus 88 current and recent Premium Opera retail records",
    productionState: "current",
    nibScope: "Bock Type 250 steel; EF/F/M/B/2.3 mm Stub options recorded for Brown Dot channel SKU.",
    materialScope: "Transparent resin body; lacquered Dot-decorated cap; silver/rhodium trim.",
    editionScope: "Premium Opera regular color route; Brown/Blue/Green/Grey Dot variants included; Opera Master and unrelated Opus 88 models excluded.",
  }],
  claims: [
    claim("opera-identity", "model_identity", "Premium Opera 是 Opus 88 的独立装饰路线；Brown Dot 是可核对的颜色 SKU，Demo、Koloro、Jazz、Omar 与 Opera Master 不并入本实体。", stilo.key, "product title and series boundary"),
    claim("opera-material", "material_finish", "Brown Dot 商品资料列透明树脂笔身、漆面 Dot 装饰帽和银色/铑色饰件；颜色与装饰为版本范围，不是另一个制造商。", stilo.key, "data sheet and product details"),
    claim("opera-nib", "nib", "Premium Opera 使用 Bock Type 250 钢尖，Brown Dot 页面列 EF、F、M、B 与 2.3 mm Stub；尖宽和单支调校不能泛化。", stilo.key, "nib options and data sheet"),
    claim("opera-filling", "filling_system", "它是日式滴入式钢笔，笔身作为墨仓，尾部止墨阀控制墨水进入 feed；说明书明确不接受墨囊。", manual.key, "filling steps and cartridge warning"),
    claim("opera-origin", "manufacturing_origin", "JUSPIRIT 和 Brown Dot 商品资料都把 Opera 归为台湾制造；本文不把渠道所在地写成制造地。", authorizedProduct.key, "made-in-Taiwan brand boundary"),
    claim("opera-size", "physical_specification", "Brown Dot 商品页给出闭合约 144 mm、笔杆约 130 mm、笔帽约 63 mm、笔杆直径约 15 mm。", stilo.key, "data sheet measurements"),
    claim("opera-weight", "weight", "Brown Dot 商品页记录总重约 34 g；不同笔尖、饰件和墨水状态可能改变实物重量。", stilo.key, "data sheet weight"),
    claim("opera-valve", "shutoff_valve", "写字前需打开尾部止墨阀，收纳和携带前关阀；止墨阀降低流动风险但不能替代 O-ring、螺纹和温差检查。", pencilcase.key, "Opus 88 family shut-off rod and O-ring discussion"),
    claim("opera-maintenance", "maintenance_guidance", "换墨应排空笔身并拆下尖组，以清水和 bulb syringe 冲洗，完全干燥后再装回；不得使用 India ink 或丙烯墨。", manual.key, "cleaning instructions and ink warning", "editorial"),
    claim("opera-selection", "selection_guidance", "购买时核对 Dot 颜色、Bock 250 尖号、滴管、尾阀顺畅度、笔身裂纹与可追溯照片；不要用同品牌其它型号的规格或图片替代。", stilo.key, "Brown Dot product details and variant navigation", "editorial"),
  ],
  variants: [
    { key: "opera-brown-dot", name: "Brown Dot", notes: "透明棕色树脂笔身与 Dot 漆帽；本页规格锚点。", sourceKey: stilo.key, variantKind: "color", market: "global", productCode: "EAN 4710484643148" },
    { key: "opera-blue-dot", name: "Blue Dot", notes: "同 Premium Opera 结构的颜色变体；规格需按具体商品页复核。", sourceKey: stilo.key, variantKind: "color", market: "global" },
    { key: "opera-green-dot", name: "Green Dot", notes: "同 Premium Opera 结构的颜色变体；不要与 Opera Master 限量款混淆。", sourceKey: stilo.key, variantKind: "color", market: "global" },
    { key: "opera-grey-dot", name: "Grey Dot", notes: "同 Premium Opera 结构的颜色变体；颜色呈现随屏幕和批次变化。", sourceKey: stilo.key, variantKind: "color", market: "global" },
    { key: "opera-bock-250", name: "Bock Type 250 steel nib", notes: "EF/F/M/B/2.3 mm Stub 尖选项；不是 JoWo #5/#6 完整尖组。", sourceKey: authorizedProduct.key, variantKind: "nib", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE279_OPUS88_BRAND_ID,
    values: {
      series_name: "Premium Opera",
      release_year: "资料确认 Premium Opera 系列存在；未将零售页访问日期当作首发年份",
      origin_country: "台湾制造",
      nib: "Bock Type 250 steel；EF/F/M/B/2.3 mm Stub",
      fill_system: "日式滴入式；尾部 shut-off valve；不接受墨囊",
      material: "透明树脂笔身；漆面 Dot 装饰帽；银色/铑色饰件",
      dimensions: "Brown Dot：闭合约 144 mm；笔杆约 130 mm；笔帽约 63 mm；直径约 15 mm",
      weight: "Brown Dot 商品页约 34 g",
      price_range: "不同地区、Dot 颜色、库存和促销变化；不固化当前价格",
      status: "Premium Opera regular color route；Opera Master 与其它限量款另行核对",
    },
    evidence: [
      ev("opera", "brand_entity_id", authorizedProduct.key, "Opus 88 brand navigation"),
      ev("opera", "series_name", stilo.key, "Premium Opera title"),
      ev("opera", "release_year", stilo.key, "series boundary; no inferred launch year"),
      ev("opera", "origin_country", authorizedProduct.key, "made in Taiwan"),
      ev("opera", "nib", stilo.key, "No. 250 steel nib and widths"),
      ev("opera", "fill_system", manual.key, "eyedropper and no cartridges"),
      ev("opera", "material", stilo.key, "resin and lacquered cap"),
      ev("opera", "dimensions", stilo.key, "Brown Dot measurements"),
      ev("opera", "weight", stilo.key, "Brown Dot weight"),
      ev("opera", "price_range", stilo.key, "mutable retail price boundary"),
      ev("opera", "status", authorizedProduct.key, "Premium Opera versus other routes"),
    ],
  },
  timeline: [
    { key: "opera-current-series", title: "Premium Opera 系列被渠道资料单列", eventType: "design_milestone", startDate: "2021", circa: true, description: "JUSPIRIT 的 Premium Series 导航把 Opera 与 Bock #250 组单列；年份只作资料窗口，不作为官方首发断言。", sourceKey: authorizedProduct.key },
    { key: "opera-brown-dot-record", title: "Brown Dot SKU 规格记录", eventType: "model_released", startDate: "2025", circa: true, description: "Stilo e Stile 的 Brown Dot 页面记录树脂、漆帽、No. 250 尖、尺寸和重量；页面库存与价格会变化。", sourceKey: stilo.key },
  ],
  conflicts: [{ key: "opera-color-description", fieldKey: "material", scopeKey: MODEL_SCOPE, conflictKind: "field", status: "resolved", resolutionNote: "Stilo 页面摘要在一处将 Brown Dot 误写为 transparent blue；正文标题、颜色字段和同系列 Brown/Blue/Green/Grey 选项明确 Brown Dot，本页采用结构与颜色字段并保留批次/屏幕色差边界。", members: [{ citationKey: "opera-material", assertedValue: "Color field: Brown; transparent brown body" }, { citationKey: "opera-status", assertedValue: "A product-detail sentence says transparent blue" }] }],
  media: [{ key: "opera-media", title: svg.title, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图或颜色校样。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase279Opus88PremiumOperaPacks: CuratedEntityPack[] = [brand, model];
