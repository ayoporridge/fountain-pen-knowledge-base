import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";
import { phase78PlatinumCuridasPacks } from "./phase78-platinum-curidas";

export const PHASE317_PLATINUM_BRAND_ID = "e51tJpejEkXY";
export const PHASE317_TAKEAMI_G_ID = "phase317-platinum-izumo-pba-120000g-takeami";
export const PHASE317_TAKEAMI_G_SLUG = "platinum-izumo-pba-120000g-takeami";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase317-pba-120000g-current";
const BOUNDARY_SCOPE = "phase317-pba-120000g-boundaries";
const CARE_SCOPE = "phase317-pba-120000g-care";

function web(input: { key: string; title: string; url: string; summary: string; locator: string; sourceType?: CuratedSource["sourceType"]; tier?: CuratedSource["tier"]; registryKey?: string; registryName?: string; homepageUrl?: string; author?: string; publishedAt?: string }): CuratedSource {
  const sourceType = input.sourceType ?? "official"; const registryKey = input.registryKey ?? "platinum-official-phase317";
  return { key: input.key, registryKey, registryName: input.registryName ?? (sourceType === "official" ? "Platinum Pen Co., Ltd." : "Fountain Pen Graph editorial studio"), sourceType, tier: input.tier ?? "primary", independenceGroup: registryKey, title: input.title, url: input.url, homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://www.platinum-pen.co.jp/" : "/"), itemType: sourceType === "user_submission" ? "image" : "web_page", author: input.author ?? (sourceType === "official" ? "Platinum Pen Co., Ltd." : "Fountain Pen Graph editorial"), publishedAt: input.publishedAt ?? null, retrievedAt: RETRIEVED, allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only", license: sourceType === "user_submission" ? "site-original" : undefined, summary: input.summary, archiveUrl: input.url, archiveLocator: sourceType === "user_submission" ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim { return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.94, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }] }; }
function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence { return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true }; }

const S = {
  product: web({ key: "phase317-takeami-g-product", title: "Platinum Izumo Takeami PBA-120000G", url: "https://www.platinum-pen.co.jp/en/products/detail/?pid=2133", summary: "Platinum 官方产品页确认 PBA-120000G、18K F/M/B、POM Resin、Bamboo Weaving、136.5 mm、15 mm 与 30 g。", locator: "PBA-120000G heading; nib, base material, surface finish, size and weight fields" }),
  family: web({ key: "phase317-takeami-family", title: "Platinum IZUMO brand lineup", url: "https://www.platinum-pen.co.jp/en/brands/detail/?pid=70", summary: "官方 Izumo 品牌页把 PBA-120000G 的 #1/#15 与独立的 PBA-120000Y、PIZ-55000、PIZ-50000T 等型号分开。", locator: "IZUMO'S LINEUP exact PBA-120000G color cards and adjacent product codes" }),
  press: web({ key: "phase317-takeami-press", title: "New Product Specifications Izumo Bamboo Weaving Fountain Pen Gozame", url: "https://www.platinum-pen.co.jp/en/news/detail/?pid=8654", publishedAt: "2017-03-28", summary: "Platinum 官方发布稿确认茣蓙目工艺、#1 暗黑色、#15 红樺色、18K 大型尖、POM/竹/AS 结构、136.5×15 mm、30 g、附件与 2017-04-01 英文 release date。", locator: "2017.3.28 press release; bamboo process; PBA-120000G colors, specs and accessories" }),
  maintenance: web({ key: "phase317-takeami-maintenance", title: "Common practices on how to ensure long-term use of Izumo", url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/02/izumo-1.pdf", summary: "Izumo 手册用于墨囊/转换器取下、清水或温水冲洗与晾干边界；不推导竹轴长浸水、上蜡或溶剂修复许可。", locator: "Izumo manual cartridge/converter removal and nib rinse steps" }),
  catalog: web({ key: "phase317-takeami-catalog", title: "Platinum Fine Writing catalog 2019–2020", url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/Platinum-pen-general-catalog-2019-2020.pdf", publishedAt: "2019-01-01", summary: "官方目录用于交叉核对 PBA-120000G/Y 的产品号与 Izumo 竹编家族边界，不作为 2026 库存或价格证据。", locator: "PDF Izumo Takeami PBA-120000G/Y entries" }),
  retailer: web({ key: "phase317-takeami-platinumpenusa", title: "Platinum Pen USA Izumo Collection", url: "https://platinumpenusa.com/luxury-writing/izumo-collection/", sourceType: "retailer", tier: "professional_secondary", registryKey: "platinum-pen-usa-phase317", registryName: "Platinum Pen USA", homepageUrl: "https://platinumpenusa.com/", author: "Platinum Pen USA", summary: "Platinum 区域经销页交叉列出 PBA-120000G #1/#15、18K F/M/B 与 Gozame 竹编工艺；不替代制造商规格或库存。", locator: "Izumo Bamboo Weaving Fountain Pen Gozame; PBA-120000G #1/#15; 18kt F/M/B" }),
  diagram: web({ key: "phase317-takeami-g-svg", title: "PBA-120000G Takeami factual diagram", url: "/images/library/site-original/phase317/platinum/izumo-pba-120000g-takeami.svg", sourceType: "user_submission", registryKey: "fountain-pen-graph-editorial-phase317", summary: "本站原创事实 SVG，标出 PBA-120000G、#1/#15、茣蓙目竹编与规格边界；非产品照片。", locator: "site-original factual SVG metadata" }),
} as const;

const inheritedBrand = phase78PlatinumCuridasPacks.find((pack) => pack.entityId === PHASE317_PLATINUM_BRAND_ID && pack.expectedType === "brand");
if (!inheritedBrand) throw new Error("Phase 317 Platinum brand pack is unavailable.");

const model: CuratedEntityPack = {
  key: "phase317-platinum-izumo-pba-120000g-takeami-v1", entityId: PHASE317_TAKEAMI_G_ID, expectedType: "pen", expectedSlug: PHASE317_TAKEAMI_G_SLUG, canonicalName: "Platinum Izumo Takeami PBA-120000G 茣蓙目竹编", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/platinum-izumo-pba-120000g-takeami-phase317.md", storyTitle: "Platinum Izumo PBA-120000G：茣蓙目竹编与 #1/#15", primarySourceKey: S.product.key, depthTier: "A",
  aliases: [{ alias: "Platinum Izumo Takeami PBA-120000G Gozame", language: "en", sourceKey: S.press.key }, { alias: "PBA-120000G #1 Ankokushoku / #15 Benikabairo", language: "en", sourceKey: S.press.key }, { alias: "白金 出云 茣蓙目竹编", language: "zh", sourceKey: S.product.key }],
  sources: [S.product, S.family, S.press, S.maintenance, S.catalog, S.retailer, S.diagram],
  scopes: [
    { key: SCOPE, scopeKey: SCOPE, market: "Platinum Izumo Takeami Gozame", validFrom: "2017-03-28", productionState: "current", nibScope: "Large 18K F/M/B", materialScope: "POM body, bamboo woven barrel/casing, AS resin grip; Platinum cartridge/converter", editionScope: "PBA-120000G #1 Ankokushoku and #15 Benikabairo" },
    { key: BOUNDARY_SCOPE, scopeKey: BOUNDARY_SCOPE, productionState: "current", editionScope: "Independent from PBA-120000Y Torafu Yoko-ajiro, PIZ-55000 Tamenuri, PIZ-50000T Tagayasan and PIZ-80000N Yakumonuri" },
    { key: CARE_SCOPE, scopeKey: CARE_SCOPE, productionState: "current", editionScope: "Platinum cartridge/converter cleaning; no long soaking, sanding, waxing, solvent or glue repair for bamboo/urushi finish" },
  ],
  claims: [
    claim("phase317-takeami-g-identity", "model_identity", "PBA-120000G 是 Platinum Izumo Takeami 茣蓙目竹编型号；#1 暗黑色与 #15 红樺色属于同一产品号的颜色版本。", S.press.key, "PBA-120000G color and product-number table"),
    claim("phase317-takeami-g-craft", "craft_process", "官方发布稿描述油抜き、荒割、幅取り、せん引、染色、茣蓙目编织与錆漆处理等工艺方向；不外推单支笔的工匠、竹龄或产地。", S.press.key, "bamboo process paragraphs"),
    claim("phase317-takeami-g-spec", "specification", "官方规格为大型 18K（18-26）F/M/B 尖、POM 与竹编结构、全长 136.5 mm、最大径 15 mm、标准重量 30 g。", S.product.key, "nib, base material, surface finish, size and weight fields"),
    claim("phase317-takeami-g-fill", "filling_and_care", "PBA-120000G 使用 Platinum 专用墨囊与转换器；官方发布资料列 Converter-500，现行日文包装页面可能列 Converter-800A，购买时以实际说明书为准。", S.press.key, "accessories and converter fields"),
    claim("phase317-takeami-g-boundary", "identity_boundaries", "PBA-120000G 与 PBA-120000Y、PIZ-55000、PIZ-50000T、PIZ-80000N 使用不同产品号与编织/材料路线，不能共享图片或规格。", S.family.key, "IZUMO lineup product-number separation"),
    claim("phase317-takeami-g-retailer", "market_crosscheck", "Platinum Pen USA 以 PBA-120000G #1/#15 交叉记录 Gozame、18K F/M/B 与竹编工艺；区域经销页不替代官方当前库存口径。", S.retailer.key, "retailer PBA-120000G and Gozame fields"),
    claim("phase317-takeami-g-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明真实竹纹、颜色、比例、Logo、刻字、库存或实物品相。", S.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase317-takeami-g-ankokushoku", name: "#1 Ankokushoku 暗黑色", notes: "PBA-120000G 茣蓙目竹编的深色版本；官方发布稿按 F/M/B 列出商品代码。", sourceKey: S.press.key, variantKind: "material", productCode: "PBA-120000G #1", market: "日本/国际经销" },
    { key: "phase317-takeami-g-benikabairo", name: "#15 Benikabairo 红樺色", notes: "PBA-120000G 茣蓙目竹编的红褐染色版本；官方发布稿按 F/M/B 列出商品代码。", sourceKey: S.press.key, variantKind: "material", productCode: "PBA-120000G #15", market: "日本/国际经销" },
    { key: "phase317-takeami-g-nibs", name: "大型 18K F / M / B", notes: "同一 PBA-120000G 下的字幅选择，不拆成独立型号。", sourceKey: S.product.key, variantKind: "nib", productCode: "PBA-120000G", market: "日本/国际经销" },
  ],
  spec: { brandEntityId: PHASE317_PLATINUM_BRAND_ID, values: { series_name: "Platinum Izumo Takeami PBA-120000G", release_year: "2017", origin_country: "日本品牌；Izumo 出云系列", nib: "大型 18K（18-26）金尖；F、M、B", fill_system: "Platinum 专用墨囊／转换器；发布资料列 Converter-500，现行包装按地区核对", material: "POM 树脂内体、竹制茣蓙目编织轴、AS 树脂握位；#1/#15 染色与錆漆处理", dimensions: "全长 136.5 mm × 最大径 15 mm", weight: "标准重量约 30 g", price_range: "2017 官方发布价格未税 120,000 日元；当前价格按日期地区核对", status: "PBA-120000G 茣蓙目竹编；#1/#15 颜色版本" }, evidence: [evidence("phase317-brand", "brand_entity_id", S.family.key, "Izumo/Platinum product identity"), evidence("phase317-series", "series_name", S.product.key, "PBA-120000G heading"), evidence("phase317-release", "release_year", S.press.key, "2017.3.28 press release"), evidence("phase317-origin", "origin_country", S.family.key, "Platinum Japanese official context"), evidence("phase317-nib", "nib", S.product.key, "18K F/M/B field"), evidence("phase317-fill", "fill_system", S.press.key, "accessories/converter guidance"), evidence("phase317-material", "material", S.product.key, "POM Resin and Bamboo Weaving fields"), evidence("phase317-dimensions", "dimensions", S.product.key, "136.5 mm x 15 mm size field"), evidence("phase317-weight", "weight", S.product.key, "30 g weight field"), evidence("phase317-price", "price_range", S.press.key, "2017 price snapshot"), evidence("phase317-status", "status", S.family.key, "PBA-120000G color boundaries")] },
  timeline: [{ key: "phase317-takeami-release", title: "Izumo 竹编新品发布", eventType: "model_released", startDate: "2017-03-28", circa: false, description: "Platinum 官方发布稿公布 PBA-120000G 茣蓙目 #1/#15 与 PBA-120000Y 虎斑竹产品号。", sourceKey: S.press.key }],
  media: [{ key: "phase317-takeami-g-primary-media", title: "PBA-120000G 茣蓙目事实卡（非产品照片）", sourceKey: S.diagram.key, localPath: S.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。", sourceUrl: S.diagram.url, usageStatus: "primary" }],
};

export const phase317PlatinumIzumoPba120000gTakeamiPacks: CuratedEntityPack[] = [inheritedBrand, model];
