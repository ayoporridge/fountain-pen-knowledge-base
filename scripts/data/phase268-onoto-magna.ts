import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-27";
export const PHASE268_ONOTO_BRAND_ID = "phase268-brand-onoto";
export const PHASE268_MAGNA_ID = "phase268-onoto-magna";
const BRAND_SCOPE = "phase268-onoto-brand";
const MODEL_SCOPE = "phase268-onoto-magna";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; group: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.group, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase268", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase268", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, scopeKey: string, factClass: "core" | "editorial" = "core"): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.94, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, locator, scopeKey }] };
}
function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

const about = web({ key: "phase268-onoto-about", title: "Onoto About Us", url: "https://onoto.com/about-us/", registryKey: "onoto-official-about-phase268", registryName: "Onoto The Pen", sourceType: "official", tier: "primary", group: "onoto-official-about-phase268", summary: "官方 About 页说明 Onoto Pen Company 位于 Norwich，由小团队运营并延续英国手工制笔。", locator: "company identity and contact" });
const heritage = web({ key: "phase268-onoto-heritage", title: "The History behind Onoto's Luxury Pens", url: "https://onoto.com/world-of-onoto/heritage/", registryKey: "onoto-official-heritage-phase268", registryName: "Onoto The Pen", sourceType: "official", tier: "primary", group: "onoto-official-heritage-phase268", summary: "官方历史页记录 1905 年 plunger-filler、1937 Magna、1958 年旧生产结束与 2005 年品牌复兴。", locator: "history narrative and innovation timeline" });
const home = web({ key: "phase268-onoto-home", title: "Onoto The Pen official catalogue", url: "https://onoto.com/", registryKey: "onoto-official-home-phase268", registryName: "Onoto The Pen", sourceType: "official", tier: "primary", group: "onoto-official-home-phase268", summary: "官方首页把 Magna、Heritage、主题限量、bespoke 和英国手工路线分列。", locator: "catalogue navigation and craftsmanship statement" });
const brochure = web({ key: "phase268-onoto-brochure", title: "Onoto official brochure", url: "https://onoto.com/wp-content/uploads/2018/11/Onoto-Brochure-Final.pdf", registryKey: "onoto-official-brochure-phase268", registryName: "Onoto The Pen", sourceType: "official", tier: "primary", group: "onoto-official-brochure-phase268", summary: "官方 PDF 介绍 1905 年传统、英国手工团队和限量工艺路线。", locator: "history and craftsmanship pages" });
const greenwich = web({ key: "phase268-onoto-greenwich", title: "The Magna Greenwich", url: "https://onoto.com/product/the-magna-greenwich/", registryKey: "onoto-official-greenwich-phase268", registryName: "Onoto The Pen", sourceType: "official", tier: "primary", group: "onoto-official-greenwich-phase268", summary: "官方 Greenwich 页给出高密度亚克力、sterling silver fittings、size 7 尖、尺寸、重量与 converter/plunger 选项。", locator: "product description and pen specifications" });
const silver = web({ key: "phase268-onoto-silver", title: "Magna Classic Sterling Silver", url: "https://onoto.com/product/magna-classic-sterling-silver-new-pattern/", registryKey: "onoto-official-silver-phase268", registryName: "Onoto The Pen", sourceType: "official", tier: "primary", group: "onoto-official-silver-phase268", summary: "官方银质 Magna 页说明 1937 形制、sterling silver 材料和 90 g 级别的重型版本边界。", locator: "product identity and material/weight description" });
const pencilcase = web({ key: "phase268-onoto-pencilcase", title: "The Pencilcase Blog Onoto Magna Sequoyah Review", url: "https://www.pencilcaseblog.com/2022/01/review-onoto-magna-sequoyah-fountain-pen.html", registryKey: "pencilcase-onoto-magna-phase268", registryName: "The Pencilcase Blog", sourceType: "blog", tier: "professional_secondary", group: "pencilcase-onoto-magna-phase268", summary: "专业复评记录 Sequoyah 样本的尺寸、握位、post、25/32 g 配重和标准国际转换器。", locator: "review measurements, balance and filling system" });
const fpn = web({ key: "phase268-onoto-fpn", title: "Fountain Pen Network Onoto Magna Writer LE Review", url: "https://www.fountainpennetwork.com/forum/topic/144753-onoto-magna-writer-le-review/", registryKey: "fpn-onoto-magna-phase268", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", group: "fpn-onoto-magna-phase268", summary: "独立评测记录 Magna Writer 样本的 C/C、尺寸和重量，并提供历史版本旁证。", locator: "review dimensions, weight and C/C system" });
const brandSvg = diagram("phase268-onoto-brand-svg", "Onoto brand history factual diagram", "/images/library/site-original/phase268/onoto/brand.svg");
const magnaSvg = diagram("phase268-onoto-magna-svg", "Onoto Magna factual diagram", "/images/library/site-original/phase268/onoto/magna.svg");

const brand: CuratedEntityPack = {
  key: "phase268-onoto-brand-v1", entityId: PHASE268_ONOTO_BRAND_ID, expectedType: "brand", expectedSlug: "onoto", canonicalName: "Onoto", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/onoto-brand-phase268.md", storyTitle: "Onoto：英国 plunger-filler 传统与现代限量笔", primarySourceKey: about.key, depthTier: "A",
  aliases: [{ alias: "Onoto The Pen", language: "en", sourceKey: about.key }, { alias: "Onoto Pen Company", language: "en", sourceKey: brochure.key }, { alias: "Onoto 钢笔", language: "zh", sourceKey: heritage.key }],
  sources: [about, heritage, home, brochure, greenwich, silver, pencilcase, fpn, brandSvg],
  scopes: [{ key: BRAND_SCOPE, scopeKey: BRAND_SCOPE, productionState: "current", editionScope: "Onoto 历史、当代英国手工运营、Magna／Heritage 与主题限量导航；具体材料、尖材和供墨按 SKU 核对。" }],
  claims: [
    claim("onoto-identity", "brand_identity", "Onoto Pen Company 是英国 Norwich 的小团队制笔公司；官方 About 页支持当代运营地点与手工语境，不扩写所有零件的生产地。", about.key, "company identity and contact", BRAND_SCOPE),
    claim("onoto-origin", "brand_history", "官方历史页把 Onoto 起点放在 1905 年 De La Rue 与 George Sweetser 的 plunger-filler 传统。", heritage.key, "1905 origin and plunger-filler history", BRAND_SCOPE),
    claim("onoto-magna", "brand_model_navigation", "官方年表把 1937 年列为 Magna 节点；当前 Magna、Heritage 与主题版共享历史语汇但不是同一 SKU。", heritage.key, "1937 Magna milestone and current route", BRAND_SCOPE),
    claim("onoto-revival", "brand_history", "官方记载旧生产于 1958 年结束、Onoto 于 2005 年复兴；这两个年份描述品牌历史阶段，不是每个现代型号的首发年份。", heritage.key, "1958 production end and 2005 revival", BRAND_SCOPE),
    claim("onoto-craft", "craftsmanship", "官方 brochure 与首页把当代 Onoto 描述为英国 goldsmith、jeweller 和 pen-master 小团队的手工制作。", brochure.key, "craftsmanship statement", BRAND_SCOPE),
    claim("onoto-routes", "brand_model_navigation", "官方目录把 Magna、Heritage、主题限量、bespoke 与 rollerball 分开；材料和上墨器必须逐页面核对。", home.key, "catalogue navigation", BRAND_SCOPE),
    claim("onoto-secondary", "professional_secondary_boundary", "Pencilcase 与 FPN 对现代 Magna 样本的尺寸、重量和 C/C 提供独立旁证；它们不替代官方品牌历史或目录。", pencilcase.key, "independent Magna sample cross-reference", BRAND_SCOPE),
    claim("onoto-care", "maintenance_guidance", "银、树脂、亚克力和 plunger-filler 需要分别维护；日常用软布和清水，涉及内部密封时按具体说明处理。", home.key, "conservative care guidance", BRAND_SCOPE, "editorial"),
  ],
  variants: [
    { key: "onoto-magna-route", name: "Magna family", notes: "1937 历史参照与现代 Magna、主题版、银质版本导航；不互相回填规格。", sourceKey: heritage.key, variantKind: "edition_group", market: "global" },
    { key: "onoto-heritage-route", name: "Heritage family", notes: "借用早期 N 型长杆语汇的相邻路线，不作为 Magna 型号。", sourceKey: home.key, variantKind: "edition_group", market: "global" },
  ],
  timeline: [{ key: "onoto-founded-1905", title: "Onoto plunger-filler 起点", eventType: "brand_founded", startDate: "1905", circa: false, description: "官方历史页以 1905 年作为 Onoto 的起点，关联 De La Rue 与 plunger-filler 专利传统。", sourceKey: heritage.key }, { key: "onoto-revived-2005", title: "Onoto 品牌复兴", eventType: "revival", startDate: "2005", circa: false, description: "官方历史页记载 Onoto 于 2005 年复兴，随后推出英国手工限量路线。", sourceKey: heritage.key }, { key: "onoto-current-craft", title: "当代 Norwich 手工运营", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "官方 About 与 brochure 当前显示 Norwich 小团队和英国手工制笔语境。", sourceKey: about.key }],
  media: [{ key: "onoto-brand-svg", title: brandSvg.title, sourceKey: brandSvg.key, localPath: brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非工厂照片、Logo 或生产流程证明。", sourceUrl: brandSvg.url, usageStatus: "primary" }],
};

const model: CuratedEntityPack = {
  key: "phase268-onoto-magna-v1", entityId: PHASE268_MAGNA_ID, expectedType: "pen", expectedSlug: "onoto-magna", canonicalName: "Onoto Magna", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/onoto-magna-phase268.md", storyTitle: "Onoto Magna：1937 经典轮廓的现代复兴", primarySourceKey: greenwich.key, depthTier: "A",
  aliases: [{ alias: "Onoto Magna Fountain Pen", language: "en", sourceKey: greenwich.key }, { alias: "The Magna", language: "en", sourceKey: heritage.key }, { alias: "Onoto Magna Greenwich", language: "en", sourceKey: greenwich.key }, { alias: "Onoto Magna 钢笔", language: "zh", sourceKey: pencilcase.key }],
  sources: [heritage, greenwich, silver, pencilcase, fpn, magnaSvg],
  scopes: [{ key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, productionState: "current", editionScope: "Onoto Magna 家族入口；Greenwich、Sequoyah、Pi、Shakespeare、银质与 plunger/converter 作为版本边界，不把 1937 原型当现代 SKU。" }],
  claims: [
    claim("magna-identity", "model_identity", "Onoto Magna 是以 1937 年大号 Onoto 为历史参照的现代家族入口；Greenwich、Sequoyah、Pi 等是 edition，不合并成同一材料配置。", heritage.key, "1937 Magna and modern route boundary", MODEL_SCOPE),
    claim("magna-greenwich", "variant_boundary", "官方 Greenwich 页提供一支现行版本的高密度亚克力、sterling silver fittings、size 7 尖和限量语境；其数字只代表该版本。", greenwich.key, "Greenwich description and specifications", MODEL_SCOPE),
    claim("magna-nib", "nib", "官方列 Onoto size 7 镀金不锈钢尖、Fine/Medium/Broad 与 18ct gold upgrade；stub/italic 可按单订制。", greenwich.key, "nib options", MODEL_SCOPE),
    claim("magna-fill", "filling_system", "Greenwich 官方页列 converter 或标准欧洲墨囊，并提供 plunger-filler upgrade；配重与 plunger-filler 可能互斥。", greenwich.key, "filling system and compatibility note", MODEL_SCOPE),
    claim("magna-material", "material_finish", "现代 Magna 可能使用高密度亚克力、树脂、sterling silver 或主题材料；银质 Magna 与普通亚克力版不可互换重量。", silver.key, "silver edition material boundary", MODEL_SCOPE),
    claim("magna-dimensions", "dimensions", "Greenwich 官方规格约 144 mm 有帽、127 mm 无帽、166 mm 帖帽；Pencilcase 与 FPN 样本略有差异。", greenwich.key, "official dimensions and sample cross-check", MODEL_SCOPE),
    claim("magna-weight", "weight", "Greenwich 官方列 25 g 或加配重 32 g；Pencilcase Sequoyah 样本约 25 g，银质版本明显更重。", greenwich.key, "official weight options and sample boundary", MODEL_SCOPE),
    claim("magna-shape", "cap_section", "Pencilcase 记录旋帽可 post、握位后端约 12.5 mm，帖帽后长度显著增加；这是现代样本体验。", pencilcase.key, "section, posting and balance", MODEL_SCOPE),
    claim("magna-secondary", "professional_secondary_boundary", "Pencilcase 与 FPN 的独立评测交叉支持现代 Magna 的尺寸、C/C 和重量样本，不升级为所有 edition 的固定规格。", pencilcase.key, "independent sample boundary", MODEL_SCOPE),
    claim("magna-care", "maintenance_guidance", "converter 版本可用清水冲洗；plunger-filler 应先确认密封和说明，不按普通转换器笔强拆。银件、树脂和亚克力避免强溶剂与研磨剂。", greenwich.key, "conservative maintenance guidance", MODEL_SCOPE, "editorial"),
    claim("magna-selection", "selection_guidance", "轻量日用可比较亚克力 converter 版；需要传统吸墨动作时确认 plunger-filler、配重兼容性、exact edition、证书和售后。", pencilcase.key, "selection guidance based on sample differences", MODEL_SCOPE, "editorial"),
  ],
  variants: [
    { key: "magna-greenwich", name: "Magna Greenwich", notes: "官方现行高密度亚克力与 sterling silver fittings 版本；规格按 Greenwich 页面。", sourceKey: greenwich.key, variantKind: "edition_group", market: "global" },
    { key: "magna-sequoyah", name: "Magna Sequoyah", notes: "Pencilcase 评测样本；纹理和配重不回填其它 edition。", sourceKey: pencilcase.key, variantKind: "edition_group", market: "global" },
    { key: "magna-silver", name: "Magna Classic Sterling Silver", notes: "银质重型路线；官方另页列材料和 90 g 级别，不与亚克力版本混写。", sourceKey: silver.key, variantKind: "material", market: "global" },
    { key: "magna-filling", name: "Converter / plunger-filler", notes: "供墨路线 variant；配重与 plunger-filler 的兼容性需按当期页面确认。", sourceKey: greenwich.key, variantKind: "market_sku", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE268_ONOTO_BRAND_ID,
    values: {
      series_name: "Magna",
      origin_country: "英国；Onoto 官方 About、Heritage 与产品页确认英国品牌及当代制作语境",
      nib: "Onoto size 7 镀金不锈钢尖；部分 edition 可升级 18ct gold，Fine/Medium/Broad 或订制 stub/italic",
      fill_system: "converter 或标准欧洲墨囊；部分版本可选 plunger-filler，需按 edition 确认",
      material: "高密度亚克力、树脂、sterling silver 或主题材料，随 edition 变化",
      dimensions: "官方 Greenwich 约 144 mm 有帽、127 mm 无帽、166 mm 帖帽；评测样本略有差异",
      weight: "官方 Greenwich 25 g 或加配重 32 g；银质与其它主题版不能沿用该数字",
    },
    evidence: [
      ev("magna", "brand_entity_id", greenwich.key, "official Magna Greenwich identity"),
      ev("magna", "series_name", heritage.key, "1937 Magna history and modern family"),
      ev("magna", "origin_country", about.key, "official British company context"),
      ev("magna", "nib", greenwich.key, "size 7 and nib options"),
      ev("magna", "fill_system", greenwich.key, "converter, cartridge and plunger option"),
      ev("magna", "material", greenwich.key, "Greenwich acrylic and silver fittings"),
      ev("magna", "dimensions", greenwich.key, "official Greenwich dimensions"),
      ev("magna", "weight", greenwich.key, "official 25/32 g options"),
    ],
  },
  timeline: [{ key: "magna-1937", title: "Magna 历史节点", eventType: "model_released", startDate: "1937", circa: false, description: "Onoto 官方历史年表将 1937 年列为 Magna 出现的节点；现代页面借用该轮廓，不等同于存世原件。", sourceKey: heritage.key }, { key: "magna-current-greenwich", title: "Magna Greenwich 当前版本核实", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "官方 Greenwich 页面核实现代 Magna 的材料、尺寸、重量与供墨选项。", sourceKey: greenwich.key }],
  media: [{ key: "onoto-magna-svg", title: magnaSvg.title, sourceKey: magnaSvg.key, localPath: magnaSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表 Greenwich、Sequoyah、银质版本的真实颜色、纹理、重量或编号。", sourceUrl: magnaSvg.url, usageStatus: "primary" }],
};

export const phase268OnotoMagnaPacks: CuratedEntityPack[] = [brand, model];
