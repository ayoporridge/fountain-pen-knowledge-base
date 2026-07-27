import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";
import { PHASE76_SAILOR_BRAND_ID, phase76SailorProfessionalGearPacks } from "./phase76-sailor-professional-gear";

const RETRIEVED = "2026-07-28";
export const PHASE303_SAILOR_BRAND_ID = PHASE76_SAILOR_BRAND_ID;
export const PHASE303_1911_S_21K_ID = "p303Sailor1911S21K";
export const PHASE303_1911_S_21K_SLUG = "sailor-1911-s-21k-11-1521";
const SCOPE = "phase303-sailor-1911-s-21k-11-1521";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.registryKey, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(): CuratedSource {
  const url = "/images/library/site-original/phase303/sailor/1911-s-21k-11-1521.svg";
  return { key: "phase303-sailor-1911-s-21k-svg", registryKey: "fountain-pen-graph-editorial-phase303", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase303", title: "Sailor 1911 S 21K 11-1521 factual diagram", url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "原创事实示意图：表达 11-1521 的 21K 镀金尖、PMMA、旋帽和 C/C 边界；不是产品照片。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, extra: Array<{ key: string; sourceKey: string; locator: string }> = []): CuratedClaim {
  return { key, predicate, objectText, factClass: predicate === "maintenance_boundary" ? "editorial" : "core", confidence: 0.97, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey: SCOPE, locator }, ...extra.map((item) => ({ ...item, scopeKey: SCOPE }))] };
}

function specEvidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence { return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true }; }

const S = {
  product: web({ key: "phase303-sailor-1911-s-21k-product", title: "Sailor 1911 S 21K 11-1521 official product page", url: "https://en.sailor.co.jp/product/11-1521/", registryKey: "sailor-official-11-1521-phase303", registryName: "The Sailor Pen Co., Ltd.", sourceType: "official", tier: "primary", summary: "官方产品页将 11-1521 定为 1911 S 21K，列出黑色/栗色各 EF/F/MF/M/B/Z/MS 货号、21K gold with gold plating、converter & cartridge、PMMA、φ17×135 mm 和 17.2 g。", locator: "product title, description, item codes, nib, type, material, size and weight" }),
  china: web({ key: "phase303-sailor-1911-s-21k-cn", title: "Sailor China 1911 S 21K 金笔", url: "https://cn.sailor.co.jp/product/11-1521/", registryKey: "sailor-cn-11-1521-phase303", registryName: "Sailor China", sourceType: "official", tier: "primary", summary: "中文官方页面核对 11-1521 的中文命名、颜色与尖号代码，并将其列为 21K 黄金镀金、PMMA、墨囊和墨芯式。", locator: "product title, item-code list and basic specifications" }),
  series: web({ key: "phase303-sailor-1911-series", title: "Sailor official 1911 Series directory", url: "https://en.sailor.co.jp/topics/1911-series/", registryKey: "sailor-official-1911-series-phase303", registryName: "The Sailor Pen Co., Ltd.", sourceType: "official", tier: "primary", summary: "官方系列页将 1911 Standard 11-1219、Large 11-2021/11-2024、Realo 与 Demonstrator 分开，建立 11-1521 与相邻路线的身份边界。", locator: "1911 Large, Realo, Demonstrator and Standard sections" }),
  plating: web({ key: "phase303-sailor-plating", title: "Sailor plating process specification change", url: "https://en.sailor.co.jp/topics/specification-change-plating-process/", registryKey: "sailor-official-plating-phase303", registryName: "The Sailor Pen Co., Ltd.", sourceType: "official", tier: "primary", summary: "官方公告列出 11-1521 的 2024 年后 Gold Ion Plating 过渡范围，说明旧金镀层与新工艺可能在流通中并存。", locator: "11-1521 item-code row and implementation period" }),
  review: web({ key: "phase303-sailor-profit-21-review", title: "Parka Blogs: Sailor Profit 21 Zoom nib review", url: "https://www.parkablogs.com/picture/review-sailor-profit-21-zoom-nib-fountain-pen", registryKey: "parkablogs-sailor-profit-21-phase303", registryName: "Parka Blogs", sourceType: "blog", tier: "professional_secondary", summary: "独立评测以 Profit 21 的 Zoom 尖样本观察线宽随握角变化与较粗线条用途；只用于书写语境，不替代官方 SKU 规格。", locator: "Zoom nib writing sample and conclusion" }),
  svg: diagram(),
} as const;

const inheritedBrand = phase76SailorProfessionalGearPacks.find((pack) => pack.entityId === PHASE303_SAILOR_BRAND_ID && pack.expectedType === "brand");
if (!inheritedBrand) throw new Error("Phase 303 Sailor brand pack missing.");
const brand: CuratedEntityPack = structuredClone(inheritedBrand);
brand.key = "phase303-sailor-brand-v1";

const model: CuratedEntityPack = {
  key: "phase303-sailor-1911-s-21k-v1",
  entityId: PHASE303_1911_S_21K_ID,
  expectedType: "pen",
  expectedSlug: PHASE303_1911_S_21K_SLUG,
  canonicalName: "写乐 Sailor 1911 S 21K（11-1521）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sailor-1911-s-21k-11-1521-phase303.md",
  storyTitle: "Sailor 1911 S 21K：11-1521 的小尺寸 21K 金尖",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Sailor 1911 S 21K", language: "en", sourceKey: S.product.key },
    { alias: "Sailor Profit Standard 21", language: "en", sourceKey: S.product.key },
    { alias: "Sailor Profit 21", language: "en", sourceKey: S.review.key },
    { alias: "写乐 1911 S 21K 金笔", language: "zh", sourceKey: S.china.key },
  ],
  sources: [S.product, S.china, S.series, S.plating, S.review, S.svg],
  scopes: [{ key: SCOPE, scopeKey: SCOPE, validFrom: RETRIEVED, productionState: "current", market: "Sailor official regional pages; availability varies by market", nibScope: "11-1521 21K gold-plated EF/F/MF/M/B/Z/MS examples; exact item code controls width and color.", materialScope: "PMMA resin body with gold-plated trim; later IP transition is not a new model.", editionScope: "11-1521 black and maroon 1911 S 21K only; 14K Standard, 21K Large, Realo and demonstrators excluded." }],
  claims: [
    claim("phase303-1911-s-21k-identity", "model_identity", "11-1521 是 Sailor 1911 S 21K／Profit 21 的具体产品号，沿用 Profit Standard 小尺寸语境但独立于 14K 11-1219、21K Large 11-2021/11-2024 和 Realo。", S.product.key, S.product.summary, [{ key: "phase303-identity-series", sourceKey: S.series.key, locator: S.series.summary }]),
    claim("phase303-1911-s-21k-nib", "nib_specification", "官方 11-1521 使用 21K gold with gold plating，黑色和栗色均列 EF、F、MF、M、B、Z、MS 货号；末三位是尖号代码，不是独立型号。", S.product.key, "Nib and item-code list", [{ key: "phase303-nib-cn", sourceKey: S.china.key, locator: S.china.summary }]),
    claim("phase303-1911-s-21k-fill", "filling_system", "11-1521 是 Sailor converter & cartridge type；不能把 1911 Realo 的活塞机构或容量数字写入本型号。", S.product.key, "Type: Converter & Cartridge type", [{ key: "phase303-fill-series", sourceKey: S.series.key, locator: S.series.summary }]),
    claim("phase303-1911-s-21k-material", "material_and_finish", "官方材料为 PMMA Resin，货号产品为黑色或栗色；后续 Gold Ion Plating 公告描述的是装饰工艺过渡，不是新型号。", S.product.key, "Material: PMMA Resin and color item codes", [{ key: "phase303-material-plating", sourceKey: S.plating.key, locator: S.plating.summary }]),
    claim("phase303-1911-s-21k-size", "sku_dimensions", "官方目录规格为 φ17×135 mm（含笔夹）、17.2 g；这些是 11-1521 的产品规格，不应从 1911 Large 的 18 mm、141 mm 或 21.6 g 推算。", S.product.key, S.product.summary),
    claim("phase303-1911-s-21k-writing", "independent_writing_context", "Parka Blogs 的 Profit 21 Zoom 样本记录了握角改变线宽、粗线更适合标题或绘画轮廓；这是特定尖号体验，不能保证每个 11-1521 尖号都相同。", S.review.key, S.review.summary),
    claim("phase303-1911-s-21k-care", "maintenance_boundary", "换墨前后用常温清水冲洗并充分干燥，长期停用排空；避免热水、酒精和强清洁剂，不要用力压弯 21K 尖，异常交 Sailor 授权维修。", S.product.key, "conservative PMMA and cartridge/converter maintenance boundary"),
  ],
  variants: [
    { key: "phase303-1911-s-21k-black", name: "11-1521 黑色", notes: "EF/F/MF/M/B/Z/MS 对应 120/220/320/420/620/720/920。", sourceKey: S.product.key, variantKind: "color", productCode: "11-1521", market: "Sailor official" },
    { key: "phase303-1911-s-21k-maroon", name: "11-1521 栗色", notes: "EF/F/MF/M/B/Z/MS 对应 132/232/332/432/632/732/932。", sourceKey: S.product.key, variantKind: "color", productCode: "11-1521", market: "Sailor official" },
    { key: "phase303-1911-s-21k-widths", name: "EF／F／MF／M／B／Z／MS", notes: "官方页面列出的 11-1521 尖号；宽度和特殊尖不是独立型号。", sourceKey: S.product.key, variantKind: "nib" },
  ],
  spec: {
    brandEntityId: PHASE303_SAILOR_BRAND_ID,
    values: { series_name: "Sailor 1911 S 21K / Profit 21", release_year: "当前官方 SKU；首发年份未由本次资料确认", origin_country: "日本；具体市场供应以 Sailor 授权渠道为准", nib: "21K gold with gold plating；EF/F/MF/M/B/Z/MS", fill_system: "Sailor converter & cartridge type", material: "PMMA resin；黑色或栗色", dimensions: "官方 φ17×135 mm（含笔夹）", weight: "官方 17.2 g" },
    evidence: [
      specEvidence("phase303-1911-s-21k-brand", "brand_entity_id", S.product.key, "Sailor official product identity"),
      specEvidence("phase303-1911-s-21k-series", "series_name", S.product.key, "1911 S 21K title and description"),
      specEvidence("phase303-1911-s-21k-year", "release_year", S.product.key, "Current product page; no launch year asserted"),
      specEvidence("phase303-1911-s-21k-origin", "origin_country", S.product.key, "Sailor product context"),
      specEvidence("phase303-1911-s-21k-nib-spec", "nib", S.product.key, "21K gold with gold plating and item-code list"),
      specEvidence("phase303-1911-s-21k-fill-spec", "fill_system", S.product.key, "Converter & Cartridge type"),
      specEvidence("phase303-1911-s-21k-material", "material", S.product.key, "PMMA Resin"),
      specEvidence("phase303-1911-s-21k-dimensions", "dimensions", S.product.key, "φ17×135 mm including clip"),
      specEvidence("phase303-1911-s-21k-weight", "weight", S.product.key, "17.2 g"),
    ],
  },
  timeline: [{ key: "phase303-1911-s-21k-current", title: "11-1521 官方 SKU 核实", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "以当前 Sailor 官方产品页记录 11-1521 的身份与规格，不把检索日期当作首发年份。", sourceKey: S.product.key }],
  media: [{ key: "phase303-1911-s-21k-primary-media", title: "Sailor 1911 S 21K 11-1521 事实图（非产品照片）", sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片、非 Logo、非比例图、非颜色校样。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

export const phase303Sailor1911S21KPacks: CuratedEntityPack[] = [brand, model];
