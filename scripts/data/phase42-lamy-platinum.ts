import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";

export const PHASE42_LAMY_BRAND_ID = "ySwGGq4bhvOA";
export const PHASE42_LAMY_2000_ID = "nS_nJKVzb_VP";
export const PHASE42_PLATINUM_BRAND_ID = "e51tJpejEkXY";
export const PHASE42_PLATINUM_3776_ID = "ekPMWnot9inz";
const RETRIEVED = "2026-07-19";

function live(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string; homepageUrl?: string }): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.homepageUrl ?? input.url,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary,
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const SOURCES = {
  lamyCompany: live({ key: "phase42-lamy-company", title: "LAMY company and brand", url: "https://www.lamy.com/en-us/company", registryKey: "lamy-official", registryName: "LAMY official", sourceType: "official", tier: "primary", summary: "LAMY 官方公司页说明 1930 年海德堡起点、持续本地开发生产与全球品牌范围。", locator: "company and brand overview; 1930 foundation; Heidelberg production" }),
  lamyDesign: live({ key: "phase42-lamy-design", title: "LAMY design", url: "https://www.lamy.com/en-us/company/design", registryKey: "lamy-official", registryName: "LAMY official", sourceType: "official", tier: "primary", summary: "LAMY 官方设计页把 2000 追溯至 1966 年，列出 Gerd A. Müller、玻纤聚碳酸酯、磨砂不锈钢和家族产品。", locator: "LAMY 2000 design history, materials, designer and family products" }),
  lamyCulture: live({ key: "phase42-lamy-culture", title: "LAMY corporate culture", url: "https://www.lamy.com/en-gb/company/corporate-culture", registryKey: "lamy-official-culture", registryName: "LAMY official corporate culture", sourceType: "official", tier: "contemporary_archive", summary: "官方企业文化页补充 Orthos 工厂、1930 年海德堡起点与 Made in Germany 语境。", locator: "1930 Orthos foundation and Made in Germany context" }),
  lamyProduct: live({ key: "phase42-lamy-2000-product", title: "LAMY 2000 fountain pen", url: "https://www.lamy.com/en-us/p/lamy-2000-fountain-pen", registryKey: "lamy-official-product", registryName: "LAMY official product", sourceType: "official", tier: "primary", summary: "官方当前产品页列标准黑色 2000 的活塞上墨、玻纤材料、拉丝不锈钢部件、14 ct 金尖、尺寸与尖号。", locator: "current standard black LAMY 2000 product data: filling, materials, nibs, dimensions" }),
  lamy2000M: live({ key: "phase42-lamy-2000-m", title: "LAMY 2000 M fountain pen", url: "https://www.lamy.com/en-us/p/lamy-2000-m-fountain-pen", registryKey: "lamy-official-product", registryName: "LAMY official product", sourceType: "official", tier: "contemporary_archive", summary: "官方 2000 M 页面把全不锈钢 2000 M 与标准 Makrolon 2000 分开，并给出约 54 g 与独立商品号。", locator: "2000 M stainless-steel material and weight boundary" }),
  lamyCatalog: live({ key: "phase42-lamy-catalog", title: "LAMY 2024 product catalogue", url: "https://www.cnp.gr/wp-content/uploads/2024/02/lamy-pens-product-range-catalogue-2024.pdf", registryKey: "lamy-catalogue", registryName: "LAMY product catalogue archive", sourceType: "official", tier: "contemporary_archive", summary: "2024 目录把 2000 [001] 与 2000 M [002] 分列，列出 Makrolon、活塞、14 ct 镀铑尖和 EF–OBB。", locator: "PDF p.6 LAMY 2000 [001]/[002] material, filling, nib and product family" }),
  lamyReview: live({ key: "phase42-lamy-2000-review", title: "Gentleman Stationer: LAMY 2000 review", url: "https://www.gentlemanstationer.com/blog/2017/4/5/pen-review-lamy-2000", registryKey: "gentleman-stationer", registryName: "The Gentleman Stationer", sourceType: "blog", tier: "professional_secondary", summary: "专业评测补充 2000 的连续生产、Makrolon 与拉丝握位、半包金尖、偏宽线条和拆解维护风险。", locator: "design continuity, materials, nib writing observations and maintenance cautions" }),
  lamyCare: live({ key: "phase42-lamy-care", title: "LAMY care FAQ", url: "https://www.lamyshop.se/en/pages/faq", registryKey: "lamy-care", registryName: "LAMY care guidance", sourceType: "official", tier: "contemporary_archive", summary: "LAMY 护理 FAQ 建议活塞笔以清水吸排、换色前彻底冲洗，不用洗洁精或化学品。", locator: "piston fountain pen cleaning and ink-change guidance" }),
  platinumCompany: live({ key: "phase42-platinum-company", title: "Platinum company and brand", url: "https://www.platinum-pen.co.jp/en/company/", registryKey: "platinum-official", registryName: "Platinum official", sourceType: "official", tier: "primary", summary: "Platinum 官方公司页列出 1919 foundation、品牌目录与 #3776、Preppy、Procyon、Izumo 等产品路线。", locator: "company overview, 1919 foundation and brand/product navigation" }),
  platinumMessage: live({ key: "phase42-platinum-message", title: "Platinum official company message", url: "https://www.platinum-pen.co.jp/en/company/message/", registryKey: "platinum-official", registryName: "Platinum official", sourceType: "official", tier: "primary", summary: "官方讯息说明 1919 年钢笔公司起点、墨囊技术与长期不易干的钢笔技术方向。", locator: "1919 fountain pen company, cartridge ink and capillary technology" }),
  platinumCentury: live({ key: "phase42-platinum-3776-brand", title: "Platinum #3776 Century official brand page", url: "https://www.platinum-pen.co.jp/brands/3776-century/", registryKey: "platinum-3776-official", registryName: "Platinum #3776 official", sourceType: "official", tier: "primary", summary: "官方 #3776 Century 页面说明 1978 开发、2011 Century 刷新、富士山 3776 命名与树脂／赛璐珞家族边界。", locator: "#3776 origin, 2011 Century refresh and family model list" }),
  platinumProduct: live({ key: "phase42-platinum-3776-product", title: "Platinum PNB-15000 #3776 Century", url: "https://www.platinum-pen.co.jp/products/fountain-pen/1464/", registryKey: "platinum-3776-official", registryName: "Platinum #3776 official", sourceType: "official", tier: "primary", summary: "日本官方 PNB-15000 页面列 AS 树脂、14K 14-26 尖、UEF–C、139.5 mm、15.4 mm、20.5 g 与颜色编号。", locator: "PNB-15000 current specifications, nibs, dimensions, weight, colors and accessories" }),
  platinumManual: live({ key: "phase42-platinum-manual", title: "Platinum Century care manual", url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/century.pdf", registryKey: "platinum-care", registryName: "Platinum official manual", sourceType: "official", tier: "contemporary_archive", summary: "官方手册解释 Slip & Seal 约两年目标、换墨冲洗、长期保存与不搭载该结构的特殊款边界。", locator: "Slip & Seal operation, cleaning, storage and exceptions" }),
  platinumTimeline: live({ key: "phase42-platinum-timeline", title: "Platinum 100th anniversary timeline", url: "https://www.platinum-pen.co.jp/common/img/pdf/decade_special_page%28english%29.pdf", registryKey: "platinum-official-history", registryName: "Platinum official history", sourceType: "official", tier: "contemporary_archive", summary: "官方十周年资料区分 1978 原始 #3776 与 2011 #3776 Century。", locator: "1978 #3776 and 2011 Century timeline" }),
  platinumReview: live({ key: "phase42-platinum-3776-review", title: "Pen Addict: Platinum #3776 Century review", url: "https://www.penaddict.com/blog/2015/12/14/platinum-3776-century-chartres-blue-fountain-pen-review", registryKey: "pen-addict", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", summary: "专业评测补充 Chartres Blue 的清晰线条、铅笔感反馈与 14K 尖的具体使用体验。", locator: "Chartres Blue review: writing feedback, line control and daily use" }),
  platinumGoulet: live({ key: "phase42-platinum-3776-goulet", title: "Goulet Pens: Platinum #3776 Century collection", url: "https://www.gouletpens.com/collections/platinum-3776-century-fountain-pens", registryKey: "goulet-pens", registryName: "Goulet Pens", sourceType: "retailer", tier: "retailer", summary: "可靠零售目录补充普通树脂与赛璐珞款的墨囊／上墨器、螺旋帽、约 20 g 与容量参考。", locator: "collection specifications, filling system, materials and approximate capacity" }),
  platinumPenchant: live({ key: "phase42-platinum-3776-penchant", title: "Penchantink: #3776 Century review", url: "https://penchantink.co.uk/a-turn-with-the-century/", registryKey: "penchantink", registryName: "Penchantink", sourceType: "blog", tier: "professional_secondary", summary: "专业评测提供短握位与反馈明显的个人体验，用于平衡选购建议而非替代官方规格。", locator: "personal writing feedback and grip observations" }),
  lamyBrandSvg: diagram("phase42-lamy-brand-svg", "LAMY 品牌导航事实卡", "/images/library/site-original/lamy-platinum/lamy-brand.svg", "本站原创品牌导航图，区分海德堡、2000、Safari/AL-star 与 Studio/cp1。"),
  lamy2000Svg: diagram("phase42-lamy-2000-svg", "LAMY 2000 事实卡", "/images/library/site-original/lamy-platinum/lamy-2000.svg", "本站原创事实图，区分标准 Makrolon 活塞款与全不锈钢 2000 M。"),
  platinumBrandSvg: diagram("phase42-platinum-brand-svg", "Platinum 品牌导航事实卡", "/images/library/site-original/lamy-platinum/platinum-brand.svg", "本站原创品牌导航图，区分 1919、#3776 Century、Preppy、Procyon 与 Izumo。"),
  platinum3776Svg: diagram("phase42-platinum-3776-svg", "Platinum #3776 Century 事实卡", "/images/library/site-original/lamy-platinum/platinum-3776-century.svg", "本站原创事实图，区分 1978 #3776、2011 Century、14K 尖与 Slip & Seal。"),
};

function evidence(key: string, sourceKey: string, scopeKey: string, locator: string, qualifies = true) {
  return { key, sourceKey, scopeKey, locator, qualifies };
}

function specEvidence(fieldKey: "brand_entity_id" | "series_name" | "release_year" | "origin_country" | "nib" | "fill_system" | "material" | "dimensions" | "status", key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makeBrandPack(input: { key: string; entityId: string; slug: string; name: string; title: string; markdownFile: string; primary: CuratedSource; secondary: CuratedSource; extra: CuratedSource[]; svg: CuratedSource; aliases: string[]; origin: string; milestones: Array<{ key: string; title: string; date: string; description: string; sourceKey: string }> }): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  return {
    key: `phase42-${input.key}-v1`, entityId: input.entityId, expectedType: "brand", expectedSlug: input.slug, canonicalName: input.name,
    publicationIntent: "publish", publicationBlockers: [], markdownFile: input.markdownFile, storyTitle: input.title, primarySourceKey: input.primary.key, depthTier: "A",
    aliases: input.aliases.map((alias) => ({ alias, language: alias.match(/[\u4e00-\u9fff]/) ? "zh" : "en", sourceKey: input.primary.key })),
    sources: [input.primary, input.secondary, ...input.extra, input.svg].filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index),
    scopes: [{ key: scopeKey, scopeKey, productionState: "current", editionScope: "品牌历史与系列导航；具体型号规格下沉到型号页" }],
    claims: [
      { key: `${input.key}-identity`, predicate: "brand_identity", objectText: input.name, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: "official brand identity", evidence: [evidence(`${input.key}-identity-evidence`, input.primary.key, scopeKey, "official company/brand identity")] },
      { key: `${input.key}-navigation`, predicate: "series_navigation", objectText: "品牌页只做可追溯的系列导航，不把泛称品牌当成具体钢笔。", factClass: "core", confidence: 0.99, sourceKey: input.secondary.key, locator: "professional series boundary", evidence: [evidence(`${input.key}-navigation-evidence`, input.secondary.key, scopeKey, "series navigation and model boundary")] },
    ],
    variants: [],
    media: [{ key: `${input.key}-primary`, title: `${input.name} 品牌导航事实卡（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影。", sourceUrl: input.svg.url, usageStatus: "primary" }],
    timeline: [{ key: `${input.key}-origin`, title: input.milestones[0]?.title ?? `${input.name} 品牌起点`, eventType: "brand_founded", startDate: input.origin, circa: false, description: input.milestones[0]?.description ?? `${input.name} 品牌起点。`, sourceKey: input.milestones[0]?.sourceKey ?? input.primary.key }, ...input.milestones.slice(1).map((milestone) => ({ key: milestone.key, title: milestone.title, eventType: "design_milestone" as const, startDate: milestone.date, circa: true, description: milestone.description, sourceKey: milestone.sourceKey }))],
  };
}

function makePenPack(input: { key: string; id: string; slug: string; name: string; title: string; markdownFile: string; primary: CuratedSource; secondary: CuratedSource; extra: CuratedSource[]; svg: CuratedSource; brandEntityId: string; aliases: string[]; release: string; nib: string; fill: string; material: string; dimensions: string; status: string; summary: string; boundary: string; variants: Array<{ key: string; name: string; notes: string; sourceKey: string; releaseYear?: string; productCode?: string }> }): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  const sources = [input.primary, input.secondary, ...input.extra, input.svg].filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index);
  return {
    key: `phase42-${input.key}-v1`, entityId: input.id, expectedType: "pen", expectedSlug: input.slug, canonicalName: input.name,
    publicationIntent: "publish", publicationBlockers: [], markdownFile: input.markdownFile, storyTitle: input.title, primarySourceKey: input.primary.key, depthTier: "A",
    aliases: input.aliases.map((alias, index) => ({ alias, language: alias.match(/[\u4e00-\u9fff]/) ? "zh" : "en", sourceKey: index === 0 ? input.primary.key : input.secondary.key })),
    sources, scopes: [{ key: scopeKey, scopeKey, productionState: input.status.includes("历史") ? "historical" : "current", editionScope: "具体型号；颜色、材料、市场与维修史按 variant 或实物记录" }],
    claims: [
      { key: `${input.key}-identity`, predicate: "model_identity", objectText: input.summary, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: "official model identity", evidence: [evidence(`${input.key}-identity-evidence`, input.primary.key, scopeKey, "official model identity and product specifications")] },
      { key: `${input.key}-boundary`, predicate: "version_boundary", objectText: input.boundary, factClass: "core", confidence: 0.99, sourceKey: input.secondary.key, locator: "professional secondary model boundary", evidence: [evidence(`${input.key}-boundary-evidence`, input.secondary.key, scopeKey, "professional secondary model boundary"), evidence(`${input.key}-official-boundary`, input.primary.key, scopeKey, "official product-specific boundary")] },
    ],
    variants: input.variants.map((variant) => ({ ...variant, variantKind: "market_sku" as const })),
    spec: { brandEntityId: input.brandEntityId, values: { series_name: input.name, release_year: input.release, origin_country: "官方产品线；制造地按具体目录、包装或版本核对", nib: input.nib, fill_system: input.fill, material: input.material, dimensions: input.dimensions, status: input.status }, evidence: [
      specEvidence("brand_entity_id", `${input.key}-brand`, input.primary.key, scopeKey, "maker identity"), specEvidence("series_name", `${input.key}-series`, input.primary.key, scopeKey, "official product title"), specEvidence("release_year", `${input.key}-release`, input.primary.key, scopeKey, "official chronology"), specEvidence("origin_country", `${input.key}-origin`, input.primary.key, scopeKey, "official brand/catalog context; no factory inference"), specEvidence("nib", `${input.key}-nib`, input.primary.key, scopeKey, "official nib field"), specEvidence("fill_system", `${input.key}-fill`, input.primary.key, scopeKey, "official filling system"), specEvidence("material", `${input.key}-material`, input.primary.key, scopeKey, "official material field"), specEvidence("dimensions", `${input.key}-dimensions`, input.primary.key, scopeKey, "official dimensions or current product field"), specEvidence("status", `${input.key}-status`, input.secondary.key, scopeKey, "current/market and sibling boundary"),
    ] },
    media: [{ key: `${input.key}-primary`, title: `${input.name} 事实卡（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影，不表现真实比例、颜色、Logo 或刻字。", sourceUrl: input.svg.url, usageStatus: "primary" }],
    timeline: [{ key: `${input.key}-timeline`, title: `${input.name} 进入产品线`, eventType: "model_released", startDate: input.release.split(/[（(]/)[0] ?? input.release, circa: true, description: input.summary, sourceKey: input.primary.key }],
  };
}

export const phase42LamyPlatinumPacks: CuratedEntityPack[] = [
  makeBrandPack({ key: "lamy-brand", entityId: PHASE42_LAMY_BRAND_ID, slug: "lamy", name: "凌美 LAMY", title: "凌美 LAMY：海德堡制造与工业设计型号树", markdownFile: ".planning/content-research/lamy-brand.md", primary: SOURCES.lamyCompany, secondary: SOURCES.lamyReview, extra: [SOURCES.lamyDesign, SOURCES.lamyCulture], svg: SOURCES.lamyBrandSvg, aliases: ["LAMY", "凌美", "C. Josef Lamy"], origin: "1930", milestones: [{ key: "lamy-origin", title: "Orthos／LAMY 在海德堡起步", date: "1930", description: "官方资料把 C. Josef Lamy 的 Orthos 工厂与海德堡品牌起点放在 1930 年。", sourceKey: SOURCES.lamyCompany.key }, { key: "lamy-2000-milestone", title: "LAMY 2000 进入设计史", date: "1966", description: "官方设计页将 LAMY 2000 追溯至 1966 年，成为品牌独立设计路线的核心节点。", sourceKey: SOURCES.lamyDesign.key }] }),
  makePenPack({ key: "lamy-2000", id: PHASE42_LAMY_2000_ID, slug: "lamy-2000", name: "LAMY 2000", title: "LAMY 2000：1966 年的活塞经典与两种材料边界", markdownFile: ".planning/content-research/lamy-2000.md", primary: SOURCES.lamyProduct, secondary: SOURCES.lamyReview, extra: [SOURCES.lamyDesign, SOURCES.lamy2000M, SOURCES.lamyCatalog, SOURCES.lamyCare], svg: SOURCES.lamy2000Svg, brandEntityId: PHASE42_LAMY_BRAND_ID, aliases: ["LAMY 2000", "Lamy 2000 fountain pen", "凌美 2000", "LAMY 2000 Makrolon"], release: "1966", nib: "部分镀铂 14K 金半包尖；EF/F/M/B/OM/OB/BB/OBB", fill: "活塞上墨；瓶装墨水", material: "标准款为玻纤增强聚碳酸酯（Makrolon）与拉丝不锈钢部件；2000 M 为全不锈钢 sibling", dimensions: "标准款约 140 mm、13 mm、26 g；2000 M 约 54 g，按 SKU 核对", status: "标准黑色款现行；2000 M 与纪念色为独立变体", summary: "LAMY 2000 是 1966 年 Gerd A. Müller 设计的活塞钢笔，标准款用玻纤增强 Makrolon 与半包 14K 金尖；2000 M 是独立的不锈钢版本。", boundary: "本页只承载标准黑色 Makrolon 2000 fountain pen；全不锈钢 2000 M、Black Amber、Blue Bauhaus 与圆珠／滚珠／机械铅笔是 sibling，不共享标准款重量、材质或图片。", variants: [{ key: "lamy-2000-standard", name: "标准黑色 Makrolon 2000", releaseYear: "1966–", productCode: "4000017", notes: "标准活塞钢笔，玻纤增强聚碳酸酯与拉丝不锈钢部件，EF–OBB。", sourceKey: SOURCES.lamyProduct.key }, { key: "lamy-2000-m", name: "LAMY 2000 M 全不锈钢", releaseYear: "现行家族变体", productCode: "4029589", notes: "独立 2000 M，不回填标准款材质与重量。", sourceKey: SOURCES.lamy2000M.key }] }),
  makeBrandPack({ key: "platinum-brand", entityId: PHASE42_PLATINUM_BRAND_ID, slug: "platinum", name: "白金 Platinum", title: "白金 Platinum：1919 品牌与日本钢笔系列导航", markdownFile: ".planning/content-research/platinum-brand.md", primary: SOURCES.platinumMessage, secondary: SOURCES.platinumReview, extra: [SOURCES.platinumCompany, SOURCES.platinumCentury], svg: SOURCES.platinumBrandSvg, aliases: ["Platinum Pen", "白金", "PLATINUM JAPAN"], origin: "1919", milestones: [{ key: "platinum-origin", title: "Platinum 以钢笔制造公司成立", date: "1919", description: "官方资料把 Platinum 的钢笔制造公司起点放在 1919 年。", sourceKey: SOURCES.platinumMessage.key }, { key: "platinum-3776-milestone", title: "#3776 Century 成为家族导航核心", date: "2011", description: "官方 #3776 资料区分 1978 原始 #3776 与 2011 Century 刷新，形成今日金尖树脂路线。", sourceKey: SOURCES.platinumCentury.key }] }),
  makePenPack({ key: "platinum-3776-century", id: PHASE42_PLATINUM_3776_ID, slug: "platinum-3776-century", name: "Platinum #3776 Century", title: "Platinum #3776 Century：1978 传统、2011 刷新与 Slip & Seal", markdownFile: ".planning/content-research/platinum-3776-century.md", primary: SOURCES.platinumProduct, secondary: SOURCES.platinumReview, extra: [SOURCES.platinumCentury, SOURCES.platinumManual, SOURCES.platinumTimeline, SOURCES.platinumGoulet, SOURCES.platinumPenchant], svg: SOURCES.platinum3776Svg, brandEntityId: PHASE42_PLATINUM_BRAND_ID, aliases: ["Platinum #3776 Century", "#3776 Century", "3776 Century", "Platinum 3776", "白金 3776 世纪"], release: "1978（#3776）；2011（Century）", nib: "14K 金大型 14-26；UEF/EF/F/SF/M/B/C", fill: "Platinum 墨囊／Converter-800A", material: "普通 PNB-13000/PNB-15000 为 AS 树脂；赛璐珞、木材与限定材料另立 variant", dimensions: "PNB-15000 约 139.5 mm、15.4 mm、20.5 g；按版本核对", status: "普通树脂款现行；Ver.2.0、Travia 与特殊材料另立", summary: "Platinum #3776 Century 源自 1978 年 #3776，2011 年经全面刷新成为 Century；普通树脂款配 14K 大型尖、墨囊／上墨器与 Slip & Seal。", boundary: "本页只承载普通树脂 PNB-13000/PNB-15000；赛璐珞、Ver.2.0、Travia、屋久杉和象嵌特殊款不共享普通款的材料、重量或防干承诺。", variants: [{ key: "platinum-3776-pnb15000", name: "PNB-15000 普通树脂款", releaseYear: "2011–", productCode: "PNB-15000", notes: "AS 树脂、14K 14-26 尖、UEF–C，标准约 139.5 mm／20.5 g。", sourceKey: SOURCES.platinumProduct.key }, { key: "platinum-3776-ver20", name: "#3776 CENTURY Ver.2.0 示范款", releaseYear: "2026", productCode: "PNB-450", notes: "独立透明新版本，Slip & Seal 加速试验目标与外观结构不回填普通款。", sourceKey: SOURCES.platinumTimeline.key }] }),
];
