import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase254StDupontPacks } from "./phase254-st-dupont-line-d-eternity";

const RETRIEVED = "2026-07-27";
export const PHASE273_BRAND_ID = "phase254-brand-st-dupont";
export const PHASE273_INITIAL_ID = "phase273-st-dupont-initial";
export const PHASE273_INITIAL_SLUG = "st-dupont-initial";
const SCOPE = "phase273-st-dupont-initial";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; group: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.group, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase273", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase273", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.94, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, locator, scopeKey: SCOPE }] };
}
function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const official = web({ key: "phase273-initial-official-en", title: "S.T. Dupont official Initial fountain pen 270216", url: "https://en.st-dupont.com/products/fountain-pen-initial-270216", registryKey: "st-dupont-initial-official-en-phase273", registryName: "S.T. Dupont official website", sourceType: "official", tier: "primary", group: "st-dupont-initial-official-en-phase273", summary: "官方 270216 页面确认 black lacquer、matte black、sword articulated clip、Wings black stainless-steel nib、piston included、147 × 13 mm、brass、38 g、Made in China，并列相关墨囊和瓶装墨水。", locator: "product title, description, nib, refills, dimensions, material, weight and origin" });
const officialUs = web({ key: "phase273-initial-official-us", title: "S.T. Dupont USA official Initial fountain pen 270216", url: "https://us.st-dupont.com/products/fountain-pen-initial-270216", registryKey: "st-dupont-initial-official-us-phase273", registryName: "S.T. Dupont USA official store", sourceType: "official", tier: "primary", group: "st-dupont-initial-official-us-phase273", summary: "美国官方商店将 270216 作为现行 Initial fountain pen 参考号，支持当前价格与在售边界；价格会随地区、库存和促销变化。", locator: "US product title, current availability and price boundary" });
const review = web({ key: "phase273-initial-penquisition", title: "Penquisition: D-Initial Impressions", url: "https://penquisition.com/blog/2021/8/26/d-initial-impressions", registryKey: "penquisition-d-initial-phase273", registryName: "Penquisition", sourceType: "blog", tier: "professional_secondary", group: "penquisition-d-initial-phase273", summary: "独立评测记录 D-Initial 三种书写模式、snap cap、钢尖 cartridge/converter、帖帽风险、塑料内螺纹和 medium 样本写感；不是黑色 270216 的 exact-SKU 规格。", locator: "fountain pen filling, cap, threads, nib and price sections" });
const svg = diagram("phase273-initial-svg", "S.T. Dupont D-Initial 270216 factual diagram", "/images/library/site-original/phase273/st-dupont/initial.svg");

const existingBrandPack = phase254StDupontPacks.find((pack) => pack.entityId === PHASE273_BRAND_ID);
if (!existingBrandPack) throw new Error("Phase 273 requires the existing S.T. Dupont brand pack.");

const model: CuratedEntityPack = {
  key: "phase273-st-dupont-initial-v1", entityId: PHASE273_INITIAL_ID, expectedType: "pen", expectedSlug: PHASE273_INITIAL_SLUG, canonicalName: "S.T. Dupont D-Initial", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/st-dupont-initial-phase273.md", storyTitle: "S.T. Dupont D‑Initial：270216 黑色漆面入门钢笔", primarySourceKey: official.key, depthTier: "A",
  aliases: [{ alias: "D-Initial", language: "en", sourceKey: official.key }, { alias: "Initial Fountain Pen", language: "en", sourceKey: official.key }, { alias: "S.T. Dupont Initial 270216", language: "en", sourceKey: official.key }, { alias: "都彭 D-Initial", language: "zh", sourceKey: official.key }],
  sources: [official, officialUs, review, svg],
  scopes: [{ key: SCOPE, scopeKey: SCOPE, market: "S.T. Dupont current global and US product pages", productionState: "current", nibScope: "270216 uses a Wings black stainless-steel nib; width and tuning are order/sample-specific.", materialScope: "Official 270216 page lists brass with black lacquer and matte black finishes; other D-Initial references vary.", editionScope: "D-Initial fountain pen 270216 only; rollerball, ballpoint, other colors and Line D Eternity excluded." }],
  claims: [
    claim("initial-identity", "model_identity", "S.T. Dupont D-Initial 270216 是官方当前页面列出的黑色 fountain pen 参考号；Initial 与 Line D Eternity 是独立产品系列。", official.key, "Initial product title, reference 270216 and collection boundary"),
    claim("initial-finish", "material_finish", "270216 官方描述为 black lacquer 与 matte black finishes；白漆金饰件、黑铬等其它参考号是 sibling finish，不回填为同一 exact SKU。", official.key, "black lacquer and matte black finish description"),
    claim("initial-clip-nib", "nib_and_trim", "官方页面列 sword articulated clip 和 Wings black stainless-steel nib；页面没有承诺统一尖宽或软弹，不能借 Line D Eternity 的金尖规格。", official.key, "clip and nib description"),
    claim("initial-filling-boundary", "filling_system", "官方 270216 页面写 piston included，同时列相关墨囊和瓶装墨水；Penquisition 的 D-Initial 样本为 cartridge/converter，因此实际填充件需按参考号包装确认，不能未经证据写成活塞钢笔。", official.key, "piston included and refills", "core"),
    claim("initial-review-crosscheck", "professional_review_boundary", "Penquisition 独立评测记录 D-Initial 钢笔为 steel-nibbed cartridge/converter、snap cap 和 medium 样本写感；该样本不是黑色 270216，尺寸、颜色和填充件不外推。", review.key, "fountain pen filling, cap and nib sections"),
    claim("initial-size", "physical_specification", "270216 官方规格为 147 × 13 mm、brass、38 g；评测中的其它 D-Initial 样本体验不替代这组 exact-SKU 数值。", official.key, "dimensions, material and weight"),
    claim("initial-origin", "manufacturing_origin", "官方 270216 页面写 Made in China；这描述当前参考号制造地，不等于 S.T. Dupont 品牌历史或 Line D Eternity 的 Faverges 制造。", official.key, "Made in China product field"),
    claim("initial-writing-modes", "writing_mode_boundary", "官方页面同时列 fountain、rollerball 和 ballpoint；本页只作为钢笔入口，另外两种模式不合并为同一内容。", official.key, "available writing modes"),
    claim("initial-care", "maintenance_guidance", "清洁时先取下墨囊或转换器，用室温清水缓慢吸排并干燥；漆面、哑光饰件和 articulated clip 避免酒精、强溶剂、金属抛光剂与过度拧紧。", review.key, "cap, threads and material care boundary", "editorial"),
    claim("initial-selection", "selection_guidance", "购买时记录 reference 270216、finish、尖宽、随附填充件、定制和保修渠道；官方美国价格与库存属于可变信息，不能当作长期估值。", officialUs.key, "current US listing and mutable price", "editorial"),
  ],
  variants: [{ key: "initial-270216-black", name: "270216 black lacquer / matte black", notes: "本页代表参考号；147 × 13 mm、38 g、brass、黑色钢尖和剑形夹按官方页面。", sourceKey: official.key, variantKind: "market_sku", productCode: "270216", market: "global" }, { key: "initial-writing-modes", name: "fountain / rollerball / ballpoint", notes: "官方目录并列三种模式；本页只描述 fountain pen。", sourceKey: official.key, variantKind: "edition_group", market: "global" }],
  spec: { brandEntityId: PHASE273_BRAND_ID, values: { series_name: "D-Initial Fountain Pen", release_year: "当前官方 270216 商品页可见；未把资料检索日当作首发年份", origin_country: "Made in China（270216 官方页面）", nib: "Wings black stainless-steel nib；字幅和写感按单支确认", fill_system: "官方写 piston included；独立 D-Initial 样本为 cartridge/converter，270216 随附件需核对", material: "brass；black lacquer 与 matte black finishes", dimensions: "147 × 13 mm", weight: "38 g", price_range: "美国官方页面检索时约 395 USD；地区、库存和促销可变", status: "现行 D-Initial fountain pen 270216；其它颜色、饰件和书写模式为 sibling variant" }, evidence: [ev("initial", "brand_entity_id", official.key, "S.T. Dupont product identity"), ev("initial", "series_name", official.key, "Initial title and fountain pen mode"), ev("initial", "release_year", officialUs.key, "current listing boundary; no launch year asserted"), ev("initial", "origin_country", official.key, "Made in China"), ev("initial", "nib", official.key, "Wings black stainless-steel nib"), ev("initial", "fill_system", official.key, "piston included and refill list"), ev("initial", "material", official.key, "brass and finish"), ev("initial", "dimensions", official.key, "147 x 13 mm"), ev("initial", "weight", official.key, "38 g"), ev("initial", "price_range", officialUs.key, "mutable US price"), ev("initial", "status", official.key, "current 270216 reference") ] },
  timeline: [{ key: "initial-current", title: "270216 Initial 当前商品页核实", eventType: "model_released", startDate: RETRIEVED, circa: true, description: "官方页面在资料检索日列出黑色 270216；该日期是目录观察边界，不是首发年份断言。", sourceKey: official.key }],
  media: [{ key: "initial-svg", title: svg.title, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图或颜色校样。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase273StDupontInitialPacks: CuratedEntityPack[] = [existingBrandPack, model];
