import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";
import { PHASE76_SAILOR_BRAND_ID, phase76SailorProfessionalGearPacks } from "./phase76-sailor-professional-gear";

const RETRIEVED = "2026-07-28";
export const PHASE302_SAILOR_BRAND_ID = PHASE76_SAILOR_BRAND_ID;
export const PHASE302_1911_LARGE_ID = "p302Sailor1911Large";
export const PHASE302_1911_LARGE_SLUG = "sailor-1911-large-11-2024";
const SCOPE = "phase302-sailor-1911-large-11-2024";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.registryKey, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(): CuratedSource {
  const url = "/images/library/site-original/phase302/sailor/1911-large-11-2024.svg";
  return { key: "phase302-sailor-1911-large-svg", registryKey: "fountain-pen-graph-editorial-phase302", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase302", title: "Sailor 1911 Large 11-2024 factual diagram", url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "原创事实示意图：表达 11-2024 的 21K 铑镀尖、PMMA、旋帽和 C/C 边界；不是产品照片。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, extra: Array<{ key: string; sourceKey: string; locator: string }> = []): CuratedClaim {
  return { key, predicate, objectText, factClass: predicate === "maintenance_boundary" ? "editorial" : "core", confidence: 0.97, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey: SCOPE, locator }, ...extra.map((item) => ({ ...item, scopeKey: SCOPE }))] };
}

function specEvidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence { return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true }; }

const S = {
  product: web({ key: "phase302-sailor-1911-large-product", title: "Sailor 1911 L Silver Trim 11-2024 official product page", url: "https://en.sailor.co.jp/product/11-2024/", registryKey: "sailor-official-11-2024-phase302", registryName: "The Sailor Pen Co., Ltd.", sourceType: "official", tier: "primary", summary: "官方产品页将 11-2024 定为 1911 L Silver Trim，列出 11-2024-120/220/320/420/620/720/920 尖号代码、21K gold with rhodium plating、converter & cartridge、PMMA、φ18×141 mm 和 21.6 g。", locator: "product title, item codes, nib, type, material, size and weight" }),
  series: web({ key: "phase302-sailor-1911-series", title: "Sailor official 1911 Series directory", url: "https://en.sailor.co.jp/topics/1911-series/", registryKey: "sailor-official-1911-series-phase302", registryName: "The Sailor Pen Co., Ltd.", sourceType: "official", tier: "primary", summary: "官方系列页把 1911 Large 11-2021/11-2024 与 1911 Standard 11-1219、Realo 和 Black Luster 分开，说明 Large 的 PMMA、C/C 与 21K 路线。", locator: "1911 Large and 1911 Standard sections" }),
  china: web({ key: "phase302-sailor-1911-large-cn", title: "Sailor China 1911 L silver trim", url: "https://cn.sailor.co.jp/product/11-2024/", registryKey: "sailor-cn-11-2024-phase302", registryName: "Sailor China", sourceType: "official", tier: "primary", summary: "中国官方页面以 1911 L 银质镶边呈现 11-2024，并列出对应尖号与型号身份，用于地区命名交叉核对。", locator: "product title and item-code list" }),
  review: web({ key: "phase302-sailor-1911-large-review", title: "The Pen Addict: Sailor 1911 Large Stormy Sea review", url: "https://penaddict.squarespace.com/blog/2018/5/25/sailor-1911-large-stormy-sea", registryKey: "pen-addict-sailor-1911-large-phase302", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", summary: "独立评测记录 1911 Large 样本约 140.5 mm 闭盖、122.7 mm 无帽、153.6 mm 套帽，以及 21K 尖和 C/C 的使用观察；样本数据不替代 11-2024 官方规格。", locator: "dimensions, nib and filling observations" }),
  standard: web({ key: "phase302-sailor-1911-standard", title: "Sailor 1911 S 11-1219 official product page", url: "https://en.sailor.co.jp/product/11-1219/", registryKey: "sailor-official-11-1219-phase302", registryName: "The Sailor Pen Co., Ltd.", sourceType: "official", tier: "primary", summary: "官方 11-1219 页面用于对照 Standard 的 14K 线路；不把 Standard 的尺寸、尖材或饰件写入 11-2024。", locator: "1911 S identity and 14K comparison" }),
  svg: diagram(),
} as const;

const inheritedBrand = phase76SailorProfessionalGearPacks.find((pack) => pack.entityId === PHASE302_SAILOR_BRAND_ID && pack.expectedType === "brand");
if (!inheritedBrand) throw new Error("Phase 302 Sailor brand pack missing.");
const brand: CuratedEntityPack = structuredClone(inheritedBrand);
brand.key = "phase302-sailor-brand-v1";

const large: CuratedEntityPack = {
  key: "phase302-sailor-1911-large-v1",
  entityId: PHASE302_1911_LARGE_ID,
  expectedType: "pen",
  expectedSlug: PHASE302_1911_LARGE_SLUG,
  canonicalName: "写乐 Sailor 1911 Large 银饰（11-2024）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sailor-1911-large-11-2024-phase302.md",
  storyTitle: "Sailor 1911 Large 银饰：11-2024 的 21K 大型笔尖",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Sailor 1911 Large", language: "en", sourceKey: S.product.key },
    { alias: "Sailor 1911L Silver Trim", language: "en", sourceKey: S.product.key },
    { alias: "Sailor Profit 21 Silver Trim", language: "en", sourceKey: S.series.key },
    { alias: "写乐 1911L 银饰", language: "zh", sourceKey: S.china.key },
  ],
  sources: [S.product, S.series, S.china, S.review, S.standard, S.svg],
  scopes: [{ key: SCOPE, scopeKey: SCOPE, validFrom: RETRIEVED, productionState: "current", market: "Sailor official regional pages; availability varies by market", nibScope: "11-2024 21K rhodium-plated EF/F/MF/M/B/Z/MS examples; exact item code controls width.", materialScope: "PMMA resin with silver/rhodium trim; gold-trim 11-2021 and Black Luster excluded.", editionScope: "1911 Large fountain pen 11-2024 only; 1911 Standard, Realo, demonstrator and ballpoint excluded." }],
  claims: [
    claim("phase302-1911-large-identity", "model_identity", "11-2024 是 Sailor 1911 Large 银／铑饰钢笔的具体产品号；它与 14K 1911 Standard 11-1219、金饰 11-2021 和 1911 Realo 分开。", S.product.key, S.product.summary, [{ key: "phase302-identity-series", sourceKey: S.series.key, locator: S.series.summary }]),
    claim("phase302-1911-large-nib", "nib_specification", "官方 11-2024 使用 21K gold with rhodium plating，当前代码覆盖 EF、F、MF、M、B、Z、MS；银色饰件不是钢尖的同义词。", S.product.key, S.product.summary),
    claim("phase302-1911-large-fill", "filling_system", "11-2024 是 Sailor converter & cartridge type；不要把 1911 Realo 的活塞上墨或其他品牌转换器写入本型号。", S.product.key, "Type: Converter & Cartridge type", [{ key: "phase302-fill-series", sourceKey: S.series.key, locator: S.series.summary }]),
    claim("phase302-1911-large-material", "material_and_finish", "官方材料为 PMMA Resin，11-2024 的饰件为 silver/rhodium trim；金饰、透明 demonstrator、Black Luster 的材料与镀层另按 SKU 核对。", S.product.key, "Material: PMMA Resin; product title: Silver Trim", [{ key: "phase302-material-series", sourceKey: S.series.key, locator: S.series.summary }]),
    claim("phase302-1911-large-size", "sku_dimensions", "官方目录规格为 φ18×141 mm（含笔夹）、21.6 g；独立评测的约 140.5/122.7/153.6 mm 量测只代表样本，用于比例交叉理解。", S.product.key, S.product.summary, [{ key: "phase302-size-review", sourceKey: S.review.key, locator: S.review.summary }]),
    claim("phase302-1911-large-writing", "independent_writing_context", "The Pen Addict 的 1911 Large 样本记录 21K 尖、短无帽握持和 C/C 使用观察；反馈与平衡属于样本体验，不是每个颜色或尖号的保证。", S.review.key, S.review.summary),
    claim("phase302-1911-large-care", "maintenance_boundary", "换墨前后用常温清水冲洗笔尖和供墨部件，长期停用排空并干燥；避免热水、酒精、强清洁剂和自行弯折 21K 尖，异常交 Sailor 授权维修。", S.product.key, "conservative PMMA and cartridge/converter maintenance boundary"),
  ],
  variants: [
    { key: "phase302-1911-large-11-2024", name: "1911 L Silver Trim 11-2024", notes: "本页 canonical SKU；黑色银／铑饰与 21K 尖的具体宽度由 item code 确认。", sourceKey: S.product.key, variantKind: "market_sku", productCode: "11-2024", market: "Sailor official" },
    { key: "phase302-1911-large-widths", name: "EF／F／MF／M／B／Z／MS", notes: "官方页面列出的 11-2024 尖号代码；宽度不是独立型号。", sourceKey: S.product.key, variantKind: "nib" },
  ],
  spec: {
    brandEntityId: PHASE302_SAILOR_BRAND_ID,
    values: { series_name: "Sailor 1911 Large / Profit 21 silver trim", release_year: "当前官方 SKU；统一首发年份未由本次资料确认", origin_country: "日本；具体市场供应以 Sailor 授权渠道为准", nib: "21K gold with rhodium plating；EF/F/MF/M/B/Z/MS", fill_system: "Sailor converter & cartridge type", material: "PMMA resin；silver/rhodium trim", dimensions: "官方 φ18×141 mm（含笔夹）", weight: "官方 21.6 g" },
    evidence: [
      specEvidence("phase302-1911-large-brand", "brand_entity_id", S.product.key, "Sailor official product identity"),
      specEvidence("phase302-1911-large-series", "series_name", S.product.key, "1911 L Silver Trim title and item code"),
      specEvidence("phase302-1911-large-year", "release_year", S.product.key, "Current product page; no launch year asserted"),
      specEvidence("phase302-1911-large-origin", "origin_country", S.product.key, "Sailor product context"),
      specEvidence("phase302-1911-large-nib-spec", "nib", S.product.key, "21K gold with rhodium plating and item-code list"),
      specEvidence("phase302-1911-large-fill-spec", "fill_system", S.product.key, "Converter & Cartridge type"),
      specEvidence("phase302-1911-large-material", "material", S.product.key, "PMMA Resin"),
      specEvidence("phase302-1911-large-dimensions", "dimensions", S.product.key, "φ18×141 mm including clip"),
      specEvidence("phase302-1911-large-weight", "weight", S.product.key, "21.6 g"),
    ],
  },
  timeline: [{ key: "phase302-1911-large-current", title: "11-2024 官方 SKU 核实", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "以当前 Sailor 官方产品页记录 11-2024 的身份与规格，不把检索日期当作首发年份。", sourceKey: S.product.key }],
  media: [{ key: "phase302-1911-large-primary-media", title: "Sailor 1911 Large 11-2024 事实图（非产品照片）", sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片、非 Logo、非比例图、非颜色校样。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

export const phase302Sailor1911LargePacks: CuratedEntityPack[] = [brand, large];
