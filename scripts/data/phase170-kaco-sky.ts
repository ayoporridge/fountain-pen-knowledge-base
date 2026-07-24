import type { CuratedClaimEvidence, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";
import { phase96KacoMaster14kPacks, PHASE96_KACO_BRAND_ID } from "./phase96-kaco-master14k";

export const PHASE170_KACO_BRAND_ID = PHASE96_KACO_BRAND_ID;
export const PHASE170_KACO_SKY_ID = "WgPQyH1oYSEX";
export const PHASE170_KACO_SKY_SLUG = "kaco-sky百锋";
const RETRIEVED = "2026-07-24";
const BRAND_SCOPE = "phase170-kaco-brand";
const SKY_SCOPE = "phase170-kaco-sky";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", independenceGroup: input.registryKey, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, url: string, summary: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase170", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase170", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary, archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}
const S = {
  officialSky: web({ key: "phase170-kaco-sky-official-news", title: "上海文采：2016 年 SKY 百锋新品发布会", url: "https://www.kaco.cc/en/list/29/", registryKey: "kaco-official-sky-news-phase170", registryName: "上海文采 / KACO", sourceType: "official", tier: "primary", summary: "官方公司新闻记录 2016 年 4 月 23 日 SKY 百锋新品发布，并称其为历经两年打造、正式面向中国市场的新一代国民钢笔。", locator: "2016-04-23 SKY 百锋 launch report" }),
  retailerSky: web({ key: "phase170-kaco-sky-gecko", title: "GeckoDesign：KACO SKY 百锋限定礼盒", url: "https://www.geckodesign.com.tw/en/products/kaco%EF%BC%9ASKY%E7%99%BE%E9%8B%92%E9%8B%BC%E7%AD%86%EF%BC%9A%E9%99%90%E5%AE%9A%E5%85%B8%E8%97%8F%E7%A6%AE%E7%9B%92-2%E8%89%B2", registryKey: "geckodesign-kaco-sky-phase170", registryName: "GeckoDesign", sourceType: "retailer", tier: "retailer", summary: "零售页列出该礼盒的 PC 塑料笔身、不锈钢 EF 明尖、约 0.4 mm 标称线迹、欧规墨囊/吸墨器、三角笔杆及礼盒配件。", locator: "SKY gift set description and specification" }),
  penAddict: web({ key: "phase170-kaco-sky-penaddict", title: "The Pen Addict：KACO SKY II review", url: "https://www.penaddict.com/blog/2018/3/30/kaco-sky-ii-fountain-pen-review", registryKey: "penaddict-kaco-sky-phase170", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", summary: "专业评测说明 SKY 起于 2016 年初、SKY II 与原始 SKY 共享设计但升级为 Makrolon 和黑色 Schmidt 尖，并记录三角握位、欧规上墨和夹子边界。", locator: "SKY/SKY II generation, Makrolon, black Schmidt nib, triangular grip" }),
  brandSvg: diagram("phase170-kaco-brand-svg", "KACO model navigation", "/images/library/site-original/phase170/kaco/brand.svg", "本站原创 factual SVG，表达 SKY、SKY II 与 Master 14K 的型号边界。"),
  skySvg: diagram("phase170-kaco-sky-svg", "KACO SKY facts", "/images/library/site-original/phase170/kaco/sky.svg", "本站原创 factual SVG，表达 SKY 的 PC 笔身、EF 明尖与欧规耗材范围。"),
} as const;
function claimEvidence(key: string, sourceKey: string, scopeKey: string, locator: string): CuratedClaimEvidence { return { key, sourceKey, scopeKey, locator }; }
function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence { return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true }; }
function media(key: string, title: string, source: CuratedSource) { return [{ key, title, sourceKey: source.key, localPath: source.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片，不证明真实比例、颜色、单支重量、库存或包装。", sourceUrl: source.url, usageStatus: "primary" as const }]; }

const baseBrand = phase96KacoMaster14kPacks.find((pack) => pack.expectedType === "brand");
if (!baseBrand) throw new Error("Phase 170 requires the existing KACO brand pack.");
const brand = structuredClone(baseBrand);
brand.key = "phase170-kaco-brand-navigation-v1";
brand.markdownFile = ".planning/content-research/kaco-brand-phase170.md";
brand.storyTitle = "KACO：SKY 百锋、SKY II 与 Master 14K 的型号边界";
brand.primarySourceKey = S.officialSky.key;
brand.sources = [...brand.sources, S.officialSky, S.retailerSky, S.penAddict, S.brandSvg];
brand.scopes = [...brand.scopes, { key: BRAND_SCOPE, scopeKey: BRAND_SCOPE, productionState: "current", editionScope: "KACO SKY 百锋及 SKY II 代际导航；Master 14K 和普通 Master 保持独立资料范围。" }];
brand.claims = [...brand.claims, { key: "phase170-kaco-sky-navigation", predicate: "model_navigation", objectText: "KACO 品牌页新增 SKY 百锋导航。官方新闻确认其 2016 年发布；零售礼盒提供第一代规格范围；SKY II 的 Makrolon、黑色 Schmidt 尖和代际升级只作比较，不能回填第一代。", factClass: "core", confidence: 0.99, sourceKey: S.officialSky.key, locator: S.officialSky.summary, evidence: [claimEvidence("phase170-kaco-sky-navigation-official", S.officialSky.key, BRAND_SCOPE, "official launch report"), claimEvidence("phase170-kaco-sky-navigation-retail", S.retailerSky.key, BRAND_SCOPE, "SKY gift set specifications"), claimEvidence("phase170-kaco-sky-navigation-penaddict", S.penAddict.key, BRAND_SCOPE, "SKY and SKY II design boundary")] }];
brand.timeline = [...(brand.timeline ?? []), { key: "phase170-kaco-sky-launch", title: "SKY 百锋正式面向中国市场", eventType: "model_released", startDate: "2016-04-23", circa: false, description: "上海文采官方公司新闻记录 SKY 百锋新品发布会及正式面向中国市场的节点。", sourceKey: S.officialSky.key }];
brand.media = media("phase170-kaco-brand-media", "KACO 型号导航事实图（非产品照片）", S.brandSvg);

const sky: CuratedEntityPack = {
  key: "phase170-kaco-sky-v1", entityId: PHASE170_KACO_SKY_ID, expectedType: "pen", expectedSlug: PHASE170_KACO_SKY_SLUG, canonicalName: "KACO SKY 百锋", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/kaco-sky-bai-feng-phase170.md", storyTitle: "KACO SKY 百锋：2016 年发布的入门钢笔", primarySourceKey: S.officialSky.key, depthTier: "A",
  aliases: [{ alias: "KACO SKY", language: "en", sourceKey: S.officialSky.key }, { alias: "KACO SKY 百锋", language: "zh", sourceKey: S.officialSky.key }, { alias: "KACO 百锋", language: "zh", sourceKey: S.retailerSky.key }],
  sources: Array.from(new Map([...brand.sources, S.officialSky, S.retailerSky, S.penAddict, S.skySvg].map((source) => [source.key, source])).values()),
  scopes: [{ key: SKY_SCOPE, scopeKey: SKY_SCOPE, productionState: "historical", editionScope: "约 2016 年发布的 KACO SKY 百锋第一代；SKY II、金属款、联名色和礼盒配件按具体 SKU 区分。", materialScope: "公开礼盒页称 PC 塑料笔身；SKY II 的 Makrolon/金属漆资料不回填第一代。", nibScope: "公开礼盒页称不锈钢 EF 明尖，标称约 0.4 mm；实际字幅和对齐按单支试写。" }],
  claims: [
    { key: "phase170-kaco-sky-identity", predicate: "model_identity", objectText: "KACO SKY 百锋是上海文采官方 2016 年发布的钢笔型号；官方新闻确认发布和品牌归属，零售礼盒及专业评测补充结构与代际边界。", factClass: "core", confidence: 0.99, sourceKey: S.officialSky.key, locator: S.officialSky.summary, evidence: [claimEvidence("phase170-kaco-sky-identity-official", S.officialSky.key, SKY_SCOPE, "2016-04-23 official launch"), claimEvidence("phase170-kaco-sky-identity-retail", S.retailerSky.key, SKY_SCOPE, "SKY gift set model title")] },
    { key: "phase170-kaco-sky-spec", predicate: "specification_scope", objectText: "公开礼盒规格显示 PC 塑料笔身、不锈钢 EF 明尖、约 0.4 mm 标称线迹、欧规墨囊和吸墨器、三角形笔杆；这些内容属于该礼盒版本，不能覆盖所有颜色和散装 SKU。", factClass: "core", confidence: 0.98, sourceKey: S.retailerSky.key, locator: S.retailerSky.summary, evidence: [claimEvidence("phase170-kaco-sky-spec-retail", S.retailerSky.key, SKY_SCOPE, "retailer specification list")] },
    { key: "phase170-kaco-sky-generation", predicate: "version_boundary", objectText: "Pen Addict 说明 SKY 起于 2016 年初，SKY II 保留原始设计但升级为 Makrolon 笔杆和黑色 Schmidt 尖；SKY II 的摩擦、尖座和夹子体验不能倒填为第一代规格。", factClass: "core", confidence: 0.98, sourceKey: S.penAddict.key, locator: S.penAddict.summary, evidence: [claimEvidence("phase170-kaco-sky-generation-e", S.penAddict.key, SKY_SCOPE, "SKY/SKY II comparison")] },
    { key: "phase170-kaco-sky-filler", predicate: "filling_system", objectText: "公开礼盒列出欧规墨囊和吸墨器；安装前要确认口径和长度，不能把不同市场的配件标题当成永久兼容保证。", factClass: "core", confidence: 0.97, sourceKey: S.retailerSky.key, locator: "European cartridge and converter specification", evidence: [claimEvidence("phase170-kaco-sky-filler-e", S.retailerSky.key, SKY_SCOPE, "cartridge/converter list")] },
    { key: "phase170-kaco-sky-care", predicate: "use_and_care", objectText: "EF 尖适合细字但不应下压测试柔性；清洗使用常温水，避免酒精、丙酮、热水和硬拧 section，PC 表面与三角握位有异常时交给维修者。", factClass: "editorial", confidence: 0.98, sourceKey: S.penAddict.key, locator: "conservative SKY care and writing boundary", evidence: [claimEvidence("phase170-kaco-sky-care-e", S.penAddict.key, SKY_SCOPE, "nib and grip handling context")] },
  ],
  variants: [{ key: "phase170-kaco-sky-first", name: "SKY 百锋第一代", releaseYear: "2016", notes: "本页主语；公开礼盒规格为 PC、EF 明尖、欧规耗材和三角握位。", sourceKey: S.officialSky.key, variantKind: "edition_group" }, { key: "phase170-kaco-sky-ii", name: "SKY II", releaseYear: "2017—2018 资料窗口", notes: "共享设计但有 Makrolon、黑色 Schmidt 尖等升级；不是第一代同义词。", sourceKey: S.penAddict.key, variantKind: "edition_group" }, { key: "phase170-kaco-sky-gift", name: "SKY 百锋限定礼盒", notes: "零售页的特定礼盒，配件和包装不代表散装全系。", sourceKey: S.retailerSky.key, variantKind: "market_sku" }],
  spec: { brandEntityId: PHASE170_KACO_BRAND_ID, values: { series_name: "KACO SKY 百锋", release_year: "2016 年 4 月 23 日官方发布窗口", origin_country: "中国；上海文采／KACO 官方品牌语境", nib: "不锈钢 EF 明尖；零售标称线迹约 0.4 mm ± 0.05 mm，实测按单支", fill_system: "欧规墨囊与吸墨器；礼盒版本规格", material: "PC 塑料笔身；SKY II 的 Makrolon 与金属漆不回填", dimensions: "公开来源未给出可外推全系尺寸；按实物量测", weight: "500 g 为礼盒包装重量，不是单支笔净重；单支按实物量测", status: "历史／持续出现的 SKY 系列型号；具体在售状态和联名 SKU 按日期核对" }, evidence: [evidence("phase170-kaco-sky-brand", "brand_entity_id", S.officialSky.key, SKY_SCOPE, "KACO official launch"), evidence("phase170-kaco-sky-series", "series_name", S.officialSky.key, SKY_SCOPE, "SKY 百锋 title"), evidence("phase170-kaco-sky-year", "release_year", S.officialSky.key, SKY_SCOPE, "2016-04-23 launch"), evidence("phase170-kaco-sky-origin", "origin_country", S.officialSky.key, SKY_SCOPE, "Shanghai Wencai official company"), evidence("phase170-kaco-sky-nib", "nib", S.retailerSky.key, SKY_SCOPE, "EF stainless nib and 0.4 mm listing"), evidence("phase170-kaco-sky-fill", "fill_system", S.retailerSky.key, SKY_SCOPE, "European cartridge/converter"), evidence("phase170-kaco-sky-material", "material", S.retailerSky.key, SKY_SCOPE, "PC body listing"), evidence("phase170-kaco-sky-dimensions", "dimensions", S.retailerSky.key, SKY_SCOPE, "no full-system dimension claim"), evidence("phase170-kaco-sky-weight", "weight", S.retailerSky.key, SKY_SCOPE, "500 g package weight boundary"), evidence("phase170-kaco-sky-status", "status", S.officialSky.key, SKY_SCOPE, "official product launch and current navigation") ] },
  timeline: [{ key: "phase170-kaco-sky-release", title: "SKY 百锋新品发布", eventType: "model_released", startDate: "2016-04-23", circa: false, description: "上海文采官方新闻记录 SKY 百锋发布会及正式面向中国市场。", sourceKey: S.officialSky.key }],
  media: media("phase170-kaco-sky-media", "KACO SKY 百锋事实图（非产品照片）", S.skySvg),
};

export const phase170KacoSkyPacks: CuratedEntityPack[] = [brand, sky];
