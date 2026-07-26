import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-26";
export const PHASE256_ESTERBROOK_BRAND_ID = "b6DYMF38zz1B";
export const PHASE256_ESTIE_ID = "phase256-esterbrook-estie-standard";
export const PHASE256_ESTIE_SLUG = "esterbrook-estie";
const SCOPE = "phase256-esterbrook-estie-standard";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; independenceGroup: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.independenceGroup, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase256", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase256", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.95, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey: SCOPE, locator }] };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const esties = web({ key: "phase256-esterbrook-esties", title: "Esterbrook official Esties", url: "https://www.esterbrookpens.com/pages/esties", registryKey: "esterbrook-official-phase256", registryName: "Esterbrook Pens", sourceType: "official", tier: "primary", independenceGroup: "esterbrook-official-esties-phase256", summary: "官方把 Estie 定义为主力家族，并分为 Core、Seasonal、Premier；颜色、材料和限定状态绑定具体 SKU。", locator: "Meet the Estie; Core, Seasonal and Premier sections" });
const guide = web({ key: "phase256-esterbrook-guide", title: "Esterbrook official Tips for choosing your Estie", url: "https://www.esterbrookpens.com/blogs/happenings/tips-for-choosing-your-estie", registryKey: "esterbrook-official-guide-phase256", registryName: "Esterbrook Pens", sourceType: "official", tier: "primary", independenceGroup: "esterbrook-official-guide-phase256", summary: "官方选购指南给出 standard/Oversized 尺寸、后插边界和不同尖宽的选购语境。", locator: "Materials, trim, Size matters and nib selection sections" });
const nibs = web({ key: "phase256-esterbrook-nibs", title: "Esterbrook official Learn About Our Nibs", url: "https://www.esterbrookpens.com/pages/learn-about-our-nibs", registryKey: "esterbrook-official-nibs-phase256", registryName: "Esterbrook Pens", sourceType: "official", tier: "primary", independenceGroup: "esterbrook-official-nibs-phase256", summary: "官方尖指南确认 JoWo #6、标准尖宽和 Estie/Model J 可换尖范围。", locator: "Fast Facts, Industry Standard and Standard Nib Sizes" });
const productRange = web({ key: "phase256-esterbrook-product-range", title: "Esterbrook official Product Range", url: "https://www.esterbrookpens.com/pages/product-range", registryKey: "esterbrook-official-range-phase256", registryName: "Esterbrook Pens", sourceType: "official", tier: "primary", independenceGroup: "esterbrook-official-range-phase256", summary: "官方产品范围页将 Estie 作为复兴后的 cornerstone，说明原始颜色、两个尺寸和后续产品路线。", locator: "The Estie product-range section" });
const about = web({ key: "phase256-esterbrook-about", title: "Esterbrook official About", url: "https://www.esterbrookpens.com/pages/about", registryKey: "esterbrook-official-about-phase256", registryName: "Esterbrook Pens", sourceType: "official", tier: "primary", independenceGroup: "esterbrook-official-about-phase256", summary: "官方介绍说明 1858 Camden 起点、原公司结束与 2018 Kenro 复兴边界。", locator: "Our Story: 1858 and 2018 rebirth" });
const secondary = web({ key: "phase256-esterbrook-estie-secondary", title: "Esterbrook Estie standard size user reference", url: "https://www.reddit.com/r/fountainpens/comments/1evti26/how_does_the_esterbrook_estie_compare_to_a_sailor/", registryKey: "esterbrook-community-phase256", registryName: "fountainpens community", sourceType: "forum", tier: "professional_secondary", independenceGroup: "esterbrook-community-phase256", summary: "社区讨论明确区分 standard Estie 与 Oversized，并把尺寸差异作为购买判断；仅作二级边界旁证。", locator: "standard versus oversized size comparison discussion" });
const svg = diagram("phase256-esterbrook-estie-svg", "Esterbrook Estie standard structure factual diagram", "/images/library/site-original/phase256/esterbrook/estie-standard.svg");

const pack: CuratedEntityPack = {
  key: "phase256-esterbrook-estie-standard-v1",
  entityId: PHASE256_ESTIE_ID,
  expectedType: "pen",
  expectedSlug: PHASE256_ESTIE_SLUG,
  canonicalName: "Esterbrook Estie",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/esterbrook-estie-standard-phase256.md",
  storyTitle: "Esterbrook Estie 标准款：Core、Seasonal 与可换尖的日用尺寸",
  primarySourceKey: esties.key,
  depthTier: "A",
  aliases: [{ alias: "Esterbrook Estie", language: "en", sourceKey: esties.key }, { alias: "Estie standard", language: "en", sourceKey: guide.key }, { alias: "Esterbrook Estie 标准款", language: "zh", sourceKey: guide.key }],
  sources: [esties, guide, nibs, productRange, about, secondary, svg],
  scopes: [{ key: SCOPE, scopeKey: SCOPE, productionState: "current", editionScope: "traditional standard Estie；Oversized、JR、button piston 特定限量、Seasonal/Premier 颜色按 SKU 分开。" }],
  claims: [
    claim("estie-standard-identity", "model_identity", "Esterbrook Estie 是现代复兴后的主力型号；本页锁定 standard 尺寸，不吞并现有 Estie Oversized。", esties.key, "Meet the Estie and Core/Seasonal/Premier family boundary"),
    claim("estie-standard-size", "size_boundary", "官方指南给出 standard 合帽约 5.9 英寸、开帽约 5 英寸、后插约 6.7 英寸；Oversized 约 6.0/5.2 英寸且不建议后插。", guide.key, "Size matters: traditional and oversize measurements"),
    claim("estie-material", "material_finish", "Estie 以亚克力笔身承载 Core、Seasonal、Premier 等颜色和材料路线；具体纹理与饰件必须绑定 SKU。", esties.key, "Core, Seasonal and Premier descriptions"),
    claim("estie-nib", "nib", "官方尖指南确认 JoWo #6 钢尖和 EF、F、M、B、Stub/Flex 等可选范围；不是每个 SKU 都有全部尖宽。", nibs.key, "Fast Facts, Industry Standard and Standard Nib Sizes"),
    claim("estie-fill", "filling_system", "传统 Estie 主要采用 cartridge/converter；button piston 只在明确的限定 SKU（如 Raven）出现。", productRange.key, "Estie product range and button-piston model boundary"),
    claim("estie-cap", "cap", "缓冲式帽盖是现代 Estie 的家族设计语境；标准款可后插，但实际固定感受受树脂和饰件影响。", esties.key, "Estie everyday description and cushion-cap boundary"),
    claim("estie-history", "brand_continuity", "现代 Estie 借鉴 Esterbrook 的历史风格，但原公司结束与 2018 Kenro 复兴属于品牌史边界，不是标准款首发年份。", about.key, "Our Story: original company and 2018 rebirth"),
    claim("estie-secondary", "professional_sample_boundary", "社区讨论和标准尺寸比较只能作为二级边界，不替代官方尺寸或全系列书写保证。", secondary.key, "standard versus oversized comparison", "core"),
    claim("estie-care", "maintenance_boundary", "亚克力、帽盖缓冲结构和 JoWo 尖座应采用温和清洁，异常时停止强拆并联系官方或销售方。", esties.key, "conservative care boundary for acrylic and interchangeable nibs", "editorial"),
  ],
  variants: [{ key: "estie-standard-core", name: "Estie standard Core/Seasonal/Premier 尺寸路线", notes: "标准尺寸的颜色、饰件和生产状态绑定具体 SKU；不覆盖 Oversized。", sourceKey: esties.key, variantKind: "edition_group", market: "global" }],
  spec: {
    brandEntityId: PHASE256_ESTERBROOK_BRAND_ID,
    values: { series_name: "Esterbrook Estie", release_year: "现代复兴后持续销售；官方未在本页给出标准款首发年份", origin_country: "现代品牌总部与销售语境在美国；具体制造地按 SKU/包装核对", nib: "JoWo #6 steel nib；EF/F/M/B/Stub/Flex 选项按 SKU", fill_system: "国际规格 cartridge/converter；button piston 仅明确限定款", material: "亚克力笔身；Core、Seasonal、Premier 的颜色/材料按 SKU", dimensions: "standard：合帽约 5.9 in、开帽约 5 in、后插约 6.7 in", weight: "官方标准尺寸指南未给统一重量；饰件与颜色 SKU 逐项实测" },
    evidence: [evidence("estie-brand", "brand_entity_id", esties.key, "official Esterbrook Esties"), evidence("estie-series", "series_name", esties.key, "Meet the Estie"), evidence("estie-release", "release_year", productRange.key, "modern product range; no launch year asserted"), evidence("estie-origin", "origin_country", about.key, "modern Kenro/U.S. brand context; no factory inference"), evidence("estie-nib-spec", "nib", nibs.key, "JoWo #6 and nib-size guide"), evidence("estie-fill-spec", "fill_system", productRange.key, "C/C and distinct button-piston SKU boundary"), evidence("estie-material-spec", "material", esties.key, "Core, Seasonal and Premier acrylic/material routes"), evidence("estie-dimensions", "dimensions", guide.key, "standard dimensions and posting"), evidence("estie-weight", "weight", guide.key, "guide does not provide a fixed standard weight; intentionally not asserted")],
  },
  media: [{ key: "estie-standard-svg", title: "Esterbrook Estie 标准款结构事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase256EsterbrookEstieStandardPacks: CuratedEntityPack[] = [pack];
