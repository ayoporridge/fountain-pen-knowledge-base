import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-27";
export const PHASE274_BRAND_ID = "phase274-brand-lotus-pens";
export const PHASE274_BRAND_SLUG = "lotus-pens";
export const PHASE274_STUDENT_ID = "phase274-lotus-student";
export const PHASE274_STUDENT_SLUG = "lotus-student";
const BRAND_SCOPE = "phase274-lotus-brand";
const MODEL_SCOPE = "phase274-lotus-student";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; group: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.group, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase274", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase274", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, scopeKey: string, factClass: "core" | "editorial" = "core"): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.97 : 0.94, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, locator, scopeKey }] };
}
function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

const officialHome = web({ key: "phase274-lotus-official-home", title: "Lotus Pens official brand page", url: "https://www.lotuspens.com/", registryKey: "lotus-pens-official-home-phase274", registryName: "Lotus Pens", sourceType: "official", tier: "primary", group: "lotus-pens-official-home-phase274", summary: "官方首页称 Lotus Pens 是印度钢笔公司，2017 年由 Arun Singhi 创立，并展示手工、定制及多条产品家族。", locator: "brand introduction and featured fountain pen families" });
const officialProduct = web({ key: "phase274-lotus-student-official", title: "Lotus Pens Student Premium Ebonite product 22383", url: "https://www.lotuspens.com/product/97", registryKey: "lotus-student-official-product-phase274", registryName: "Lotus Pens", sourceType: "official", tier: "primary", group: "lotus-student-official-product-phase274", summary: "官方产品页确认 Product Code 22383、premium ebonite、#6 Jowo steel、140/128 mm、11.5 mm 握位、C/C type 与可选夹子和尖宽。", locator: "product title, code, material, nib, dimensions, filling and accessories" });
const review = web({ key: "phase274-lotus-student-inked-happiness", title: "Inked Happiness: Lotus Student review", url: "https://www.inkedhappiness.com/lotus-student-your-daily-carry-with-a-beauty-make-up/", registryKey: "inked-happiness-lotus-student-phase274", registryName: "Inked Happiness", sourceType: "blog", tier: "professional_secondary", group: "inked-happiness-lotus-student-phase274", summary: "独立评测记录 2019 Lotus Student pocket 样本的硬橡胶、Jowo 中/粗尖、Schmidt K5，以及 cartridge、converter、eyedropper 的版本体验和湿润书写。", locator: "Student review material, nib, filling, writing and price sections" });
const svgBrand = diagram("phase274-lotus-brand-svg", "Lotus Pens brand factual diagram", "/images/library/site-original/phase274/lotus/student.svg");
const svgModel = diagram("phase274-lotus-student-svg", "Lotus Student Premium Ebonite factual diagram", "/images/library/site-original/phase274/lotus/student.svg");

const brand: CuratedEntityPack = {
  key: "phase274-lotus-brand-v1", entityId: PHASE274_BRAND_ID, expectedType: "brand", expectedSlug: PHASE274_BRAND_SLUG, canonicalName: "Lotus Pens", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/lotus-pens-brand-phase274.md", storyTitle: "Lotus Pens：印度手工车制钢笔品牌", primarySourceKey: officialHome.key, depthTier: "B",
  aliases: [{ alias: "Lotus Pens", language: "en", sourceKey: officialHome.key }, { alias: "Lotus Writing Instruments", language: "en", sourceKey: officialHome.key }, { alias: "Lotus 钢笔", language: "zh", sourceKey: officialHome.key }],
  sources: [officialHome, officialProduct, review, svgBrand],
  scopes: [{ key: BRAND_SCOPE, scopeKey: BRAND_SCOPE, market: "India and international direct sales", productionState: "current", editionScope: "Lotus Pens brand navigation; individual Student, Shikhar, Everest and custom materials remain separate model entries" }],
  claims: [
    claim("lotus-brand-identity", "brand_identity", "Lotus Pens 官方首页称其为印度钢笔公司，2017 年由 Arun Singhi 创立；这是品牌自述起点，不等于印度钢笔制作传统的起源。", officialHome.key, "brand introduction", BRAND_SCOPE),
    claim("lotus-brand-materials", "material_range", "官方产品目录覆盖 premium ebonite、acrylic、木材、黄铜和定制路线；材料、夹子、尖宽与填充件需按具体型号核对。", officialHome.key, "featured products and material families", BRAND_SCOPE),
    claim("lotus-brand-making", "production_style", "Lotus 商品页说明部分产品手工制作并可能需要数周发货；制作周期与定制内容不是固定型号规格。", officialProduct.key, "hand-crafted dispatch note", BRAND_SCOPE),
    claim("lotus-brand-navigation", "brand_navigation", "Student、Shikhar、Everest、Titan 和 Writer 等名称应分成独立型号或系列入口，不因共用 Lotus 名称而合并规格。", officialHome.key, "featured product families", BRAND_SCOPE),
    claim("lotus-brand-independent-record", "independent_record", "Inked Happiness 的 Student 评测把 Arun Singhi 与 Lotus Pens 放入印度手工钢笔语境，提供品牌与型号发展的独立记录；它不是官方全目录。", review.key, "Lotus Student review and maker context", BRAND_SCOPE),
    claim("lotus-brand-care", "maintenance_guidance", "硬橡胶、漆面和特殊饰件应避开酒精、丙酮、热水与强抛光；converter、cartridge 与 eyedropper 的清洁和密封要求按型号处理。", review.key, "material and filling boundary", BRAND_SCOPE, "editorial"),
  ],
  variants: [{ key: "lotus-brand-student", name: "Student family", notes: "Lotus 的代表性入门日用路线；Premium Ebonite 22383 另有型号页。", sourceKey: officialProduct.key, variantKind: "edition_group", market: "global" }, { key: "lotus-brand-custom", name: "Custom and hand-painted routes", notes: "定制和手绘产品按订单与实物建档，不默认视为固定 SKU。", sourceKey: officialHome.key, variantKind: "edition_group", market: "global" }],
  timeline: [{ key: "lotus-brand-2017", title: "Lotus Pens 官方品牌起点", eventType: "brand_founded", startDate: "2017", circa: false, description: "官方首页称 Lotus Pens 于 2017 年由 Arun Singhi 创立；这里记录品牌自述，不外推为行业历史。", sourceKey: officialHome.key }, { key: "lotus-brand-2019-student", title: "Student 日用路线出现在独立评测", eventType: "model_released", startDate: "2019", circa: false, description: "Inked Happiness 的 2019 评测记录 Lotus Student pocket 样本；这为品牌型号导航提供时间锚点，但不替代当前 22383 商品页。", sourceKey: review.key }],
  media: [{ key: "lotus-brand-media", title: svgBrand.title, sourceKey: svgBrand.key, localPath: svgBrand.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图或颜色校样。", sourceUrl: svgBrand.url, usageStatus: "primary" }],
};

const model: CuratedEntityPack = {
  key: "phase274-lotus-student-v1", entityId: PHASE274_STUDENT_ID, expectedType: "pen", expectedSlug: PHASE274_STUDENT_SLUG, canonicalName: "Lotus Student", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/lotus-student-phase274.md", storyTitle: "Lotus Student Premium Ebonite：22383 的硬橡胶日用路线", primarySourceKey: officialProduct.key, depthTier: "A",
  aliases: [{ alias: "Lotus Student", language: "en", sourceKey: officialProduct.key }, { alias: "Student Premium Ebonite", language: "en", sourceKey: officialProduct.key }, { alias: "Lotus Student 22383", language: "en", sourceKey: officialProduct.key }, { alias: "Lotus 学生款", language: "zh", sourceKey: officialProduct.key }],
  sources: [officialHome, officialProduct, review, svgModel],
  scopes: [{ key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, market: "Lotus Pens current product page and earlier pocket review", productionState: "current", nibScope: "Current page lists #6 Jowo steel with selectable EF/F/M/B and custom grinds; writing feel is sample-specific.", materialScope: "Current product 22383 is premium ebonite; older Student materials and finishes are sibling variants.", editionScope: "Current Student Premium Ebonite product code 22383; 2019 pocket sample is a version boundary, not an exact-SKU replacement." }],
  claims: [
    claim("student-identity", "model_identity", "Lotus Student Premium Ebonite 是 Lotus Pens 当前页面的 Student 版本，产品代码 22383；其它材料、旧 pocket 样本和定制订单不合并。", officialProduct.key, "product title and code", MODEL_SCOPE),
    claim("student-material", "material_finish", "官方 22383 页面把笔材列为 premium ebonite；硬橡胶颜色与定制外观按订单确认。", officialProduct.key, "material field", MODEL_SCOPE),
    claim("student-nib", "nib", "官方页面列 #6 Jowo steel，并提供 EF、F、M、B 与特殊研磨选择；没有为所有字幅承诺同一湿度或弹性。", officialProduct.key, "nib options and technical specification", MODEL_SCOPE),
    claim("student-dimensions", "physical_specification", "当前页面给出总长 140 mm、未装帽 128 mm、握位直径 11.5 mm；旧 pocket 样本不能替代这组数值。", officialProduct.key, "technical specification", MODEL_SCOPE),
    claim("student-filling", "filling_system", "官方当前页写 C/C type；Inked Happiness 的 2019 pocket 样本记录 Schmidt K5，并称可使用 converter、cartridge 或 eyedropper，二者保持版本边界。", officialProduct.key, "C/C type", MODEL_SCOPE),
    claim("student-accessories", "accessories", "当前商品页列可选夹子、黑铬或黄铜饰件、木质礼盒、丝质笔套和抛光布；是否随订单包含需逐项确认。", officialProduct.key, "clip, trim and included accessories", MODEL_SCOPE),
    claim("student-review", "professional_review_boundary", "独立评测描述 pocket 样本的 Jowo 中/粗尖、湿润线条、平衡与三种填充体验；这些是样本观察，不回填为 22383 的统一保证。", review.key, "writing experience and filling sections", MODEL_SCOPE),
    claim("student-care", "maintenance_guidance", "C/C 版本先取下转换器并以室温水吸排；若实物确实支持 eyedropper，应额外检查螺纹、O-ring 和硅脂，硬橡胶避免酒精、丙酮和热水。", review.key, "filling and ebonite care boundary", MODEL_SCOPE, "editorial"),
    claim("student-selection", "selection_guidance", "购买时记录 22383、premium ebonite、尖宽、夹子、饰件、转换器、制作周期和保修渠道；价格与库存会变化。", officialProduct.key, "product code, options, price and dispatch note", MODEL_SCOPE, "editorial"),
  ],
  variants: [{ key: "student-22383", name: "Student Premium Ebonite 22383", notes: "当前官方产品页版本；premium ebonite、#6 Jowo steel、C/C type、140/128 mm。", sourceKey: officialProduct.key, variantKind: "market_sku", productCode: "22383", market: "global" }, { key: "student-pocket-2019", name: "2019 pocket sample boundary", notes: "Inked Happiness 评测样本；记录 Schmidt K5、cartridge/converter/eyedropper，不替代当前 22383 规格。", sourceKey: review.key, variantKind: "edition_group", market: "India" }],
  spec: { brandEntityId: PHASE274_BRAND_ID, values: { series_name: "Student Premium Ebonite", release_year: "当前产品页可见；未将检索日期当作首发年份", origin_country: "印度（Lotus Pens 官方品牌自述）", nib: "#6 Jowo steel；EF/F/M/B 与特殊研磨可选", fill_system: "官方当前页 C/C type；2019 pocket 样本另记 Schmidt K5、cartridge 与 eyedropper", material: "Premium Ebonite", dimensions: "总长 140 mm；未装帽 128 mm；握位直径 11.5 mm", weight: "官方当前页未给统一克重；手工材料与饰件会改变实物重量", price_range: "官方页面检索时约 78 USD；材料、尖研磨、定制和地区会变化", status: "当前 Student Premium Ebonite 产品代码 22383；旧 pocket/其它材料分层" }, evidence: [ev("student", "brand_entity_id", officialHome.key, "Lotus Pens brand identity"), ev("student", "series_name", officialProduct.key, "Student Premium Ebonite title"), ev("student", "release_year", officialHome.key, "brand year and current listing boundary"), ev("student", "origin_country", officialHome.key, "Indian fountain pen company"), ev("student", "nib", officialProduct.key, "#6 Jowo steel options"), ev("student", "fill_system", officialProduct.key, "C/C type"), ev("student", "material", officialProduct.key, "premium ebonite"), ev("student", "dimensions", officialProduct.key, "140/128 mm and 11.5 mm"), ev("student", "weight", officialProduct.key, "no unified weight shown"), ev("student", "price_range", officialProduct.key, "mutable current price"), ev("student", "status", officialProduct.key, "product code 22383") ] },
  timeline: [{ key: "student-current", title: "Student Premium Ebonite 22383 当前页面", eventType: "model_released", startDate: RETRIEVED, circa: true, description: "官方页面在资料检索日列出 Student Premium Ebonite 产品代码 22383；该日期是目录观察边界，不是首发年份。", sourceKey: officialProduct.key }],
  media: [{ key: "student-media", title: svgModel.title, sourceKey: svgModel.key, localPath: svgModel.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图或颜色校样。", sourceUrl: svgModel.url, usageStatus: "primary" }],
};

export const phase274LotusStudentPacks: CuratedEntityPack[] = [brand, model];
