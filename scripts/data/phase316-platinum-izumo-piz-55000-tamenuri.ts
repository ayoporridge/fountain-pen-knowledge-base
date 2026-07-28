import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";
import { phase78PlatinumCuridasPacks } from "./phase78-platinum-curidas";

export const PHASE316_PLATINUM_BRAND_ID = "e51tJpejEkXY";
export const PHASE316_TAMENURI_ID = "phase316-platinum-izumo-piz-55000-tamenuri";
export const PHASE316_TAMENURI_SLUG = "platinum-izumo-piz-55000-tamenuri";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase316-piz-55000-tamenuri-current";
const BOUNDARY_SCOPE = "phase316-piz-55000-tamenuri-boundaries";
const CARE_SCOPE = "phase316-piz-55000-tamenuri-care";

function web(input: { key: string; title: string; url: string; summary: string; locator: string; sourceType?: CuratedSource["sourceType"]; tier?: CuratedSource["tier"]; registryKey?: string; registryName?: string; homepageUrl?: string; author?: string; publishedAt?: string }): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const registryKey = input.registryKey ?? "platinum-official-phase316";
  return { key: input.key, registryKey, registryName: input.registryName ?? (sourceType === "official" ? "Platinum Pen Co., Ltd." : "Fountain Pen Graph editorial studio"), sourceType, tier: input.tier ?? "primary", independenceGroup: registryKey, title: input.title, url: input.url, homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://www.platinum-pen.co.jp/" : "/"), itemType: sourceType === "user_submission" ? "image" : "web_page", author: input.author ?? (sourceType === "official" ? "Platinum Pen Co., Ltd." : "Fountain Pen Graph editorial"), publishedAt: input.publishedAt ?? null, retrievedAt: RETRIEVED, allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only", license: sourceType === "user_submission" ? "site-original" : undefined, summary: input.summary, archiveUrl: input.url, archiveLocator: sourceType === "user_submission" ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim { return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.94, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }] }; }
function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence { return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true }; }

const S = {
  product: web({ key: "phase316-tamenuri-product", title: "Platinum 溜塗り『枇杷溜』 PIZ-55000", url: "https://www.platinum-pen.co.jp/products/fountain-pen/10631/", summary: "Platinum 日本官方产品页确认枇杷溜的 PIZ-55000 产品号，并在同品牌区列出赤溜与空溜。", locator: "溜塗り『枇杷溜』 heading; PIZ-55000 product number; same-brand PIZ-55000 sibling cards" }),
  family: web({ key: "phase316-tamenuri-family", title: "Platinum IZUMO brand lineup", url: "https://www.platinum-pen.co.jp/en/brands/detail/?pid=70", summary: "官方 Izumo 品牌页分别列出 PIZ-55000 的 Soratame、Akatame、Biwatame，并与 PIZ-50000T、PIZ-80000N 等型号分开。", locator: "IZUMO'S LINEUP; exact PIZ-55000 Tamenuri color cards and adjacent product codes" }),
  price: web({ key: "phase316-tamenuri-price", title: "Platinum price revision list 2025", url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2025/11/2f5d6b082c29d05bc6eafff43dbfdaa9.pdf", publishedAt: "2025-11-01", summary: "官方价格表按 PIZ-55000 #27/#28/#30 的 F/M/B 商品号列出价格快照，支持颜色与笔尖 SKU 边界。", locator: "PDF page 0; PIZ-55000 27-2/3/4, 28-2/3/4 and 30-2/3/4 rows" }),
  catalog: web({ key: "phase316-tamenuri-catalog", title: "Platinum Fine Writing catalog 2019–2020", url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/Platinum-pen-general-catalog-2019-2020.pdf", publishedAt: "2019-01-01", summary: "官方目录把 PIZ-55000 作为 Izumo Tamenuri 型号列出；仅作为年代与产品号的历史交叉证据。", locator: "PDF Izumo Tamenuri PIZ-55000 entry" }),
  maintenance: web({ key: "phase316-tamenuri-maintenance", title: "Common practices on how to ensure long-term use of Izumo", url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/02/izumo-1.pdf", summary: "Izumo 官方手册提供墨囊/转换器取下、清水或温水冲洗及晾干流程；不外推漆面抛光或强溶剂许可。", locator: "Izumo manual cartridge/converter removal and nib rinse steps" }),
  retailer: web({ key: "phase316-tamenuri-pensachi", title: "Platinum Izumo Tamenuri Fountain Pen", url: "https://www.pensachi.com/products/platinum-izumo-tamenuri-fountain-pen-akatame", sourceType: "retailer", tier: "professional_secondary", registryKey: "pensachi-phase316", registryName: "PenSachi", homepageUrl: "https://www.pensachi.com/", author: "PenSachi", summary: "专业经销页交叉列出 PIZ-55000、硬橡胶溜塗、18K F/M/B、旋帽、154 mm、18 mm、34.5 g、专用转换器/墨囊，并提醒旧 President 刻字与现行 Izumo 刻字的边界。", locator: "Product Code PIZ-55000#27; material, nib, filling, dimensions, weight and engraving note" }),
  diagram: web({ key: "phase316-tamenuri-svg", title: "PIZ-55000 Tamenuri factual diagram", url: "/images/library/site-original/phase316/platinum/izumo-piz-55000-tamenuri.svg", sourceType: "user_submission", registryKey: "fountain-pen-graph-editorial-phase316", summary: "本站原创事实 SVG，标出 #27/#28/#30、规格与型号边界；非产品照片。", locator: "site-original factual SVG metadata" }),
} as const;

const inheritedBrand = phase78PlatinumCuridasPacks.find((pack) => pack.entityId === PHASE316_PLATINUM_BRAND_ID && pack.expectedType === "brand");
if (!inheritedBrand) throw new Error("Phase 316 Platinum brand pack is unavailable.");

const model: CuratedEntityPack = {
  key: "phase316-platinum-izumo-piz-55000-tamenuri-v1",
  entityId: PHASE316_TAMENURI_ID,
  expectedType: "pen",
  expectedSlug: PHASE316_TAMENURI_SLUG,
  canonicalName: "Platinum Izumo Tamenuri PIZ-55000 溜塗",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/platinum-izumo-piz-55000-tamenuri-phase316.md",
  storyTitle: "Platinum Izumo PIZ-55000：空溜、赤溜与枇杷溜",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Platinum Izumo Tamenuri PIZ-55000", language: "en", sourceKey: S.family.key },
    { alias: "PIZ-55000 #27 Soratame / #28 Akatame / #30 Biwatame", language: "en", sourceKey: S.price.key },
    { alias: "白金 出云 溜塗 PIZ-55000", language: "zh", sourceKey: S.product.key },
  ],
  sources: [S.product, S.family, S.price, S.catalog, S.maintenance, S.retailer, S.diagram],
  scopes: [
    { key: SCOPE, scopeKey: SCOPE, market: "Platinum Izumo Tamenuri", validFrom: "2019-01-01", productionState: "current", nibScope: "Large 18K F/M/B", materialScope: "Ebonite with Tamenuri lacquer; Platinum cartridge/converter", editionScope: "PIZ-55000 #27 Soratame, #28 Akatame, #30 Biwatame" },
    { key: BOUNDARY_SCOPE, scopeKey: BOUNDARY_SCOPE, productionState: "current", editionScope: "Independent from PIZ-50000T Tagayasan, PIZ-80000N Yakumonuri, PBA-120000G/Y Takeami, PIZ-160000 Galaxy and PIZ-150000PW" },
    { key: CARE_SCOPE, scopeKey: CARE_SCOPE, productionState: "current", editionScope: "Platinum cartridge/converter cleaning; lacquer polishing, oiling, sanding and solvent repair are not supported" },
  ],
  claims: [
    claim("phase316-tamenuri-identity", "model_identity", "PIZ-55000 是 Platinum Izumo Tamenuri 溜塗型号；#27 空溜、#28 赤溜与 #30 枇杷溜是同一产品号下的漆色路线。", S.family.key, "PIZ-55000 Tamenuri color cards"),
    claim("phase316-tamenuri-material", "material", "PIZ-55000 以硬橡胶（ebonite）为基材并采用 Tamenuri 漆面；公开资料不支持外推具体漆器工坊或漆色的精确色值。", S.retailer.key, "ebonite with Tamenuri coating"),
    claim("phase316-tamenuri-spec", "specification", "专业经销资料列出大型 18K F/M/B 尖、全长约 154 mm、最大径约 18 mm、重量约 34.5 g；这些数值不能回填到其他 Izumo 产品号。", S.retailer.key, "nib, dimensions and weight fields"),
    claim("phase316-tamenuri-skus", "market_sku_boundary", "官方价格表按 #27/#28/#30 与 F/M/B 列出九个商品号；它们是颜色与笔尖 SKU，不是九个独立笔身型号。", S.price.key, "PIZ-55000 color/nib rows"),
    claim("phase316-tamenuri-fill", "filling_and_care", "PIZ-55000 使用 Platinum 专用墨囊或转换器；Izumo 手册支持清水/温水清洗，不支持自行抛光、上油、打磨或强溶剂处理漆面。", S.maintenance.key, "cartridge/converter and rinse guidance"),
    claim("phase316-tamenuri-boundary", "identity_boundaries", "Tamenuri 与 PIZ-50000T、PIZ-80000N、PBA-120000G/Y、PIZ-160000 和 PIZ-150000PW 使用不同产品号与材料路线，不能共享图片或规格。", S.family.key, "IZUMO lineup product-number separation"),
    claim("phase316-tamenuri-engraving", "version_boundary", "PenSachi 提醒旧款照片可能使用 President 笔尖刻字，现行货可能改为 Izumo（出云）刻字；这是刻字年代边界，不建立第二个型号。", S.retailer.key, "engraving note"),
    claim("phase316-tamenuri-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明真实颜色、比例、Logo、刻字、库存或实物品相。", S.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase316-tamenuri-soratame", name: "#27 Soratame 空溜", notes: "PIZ-55000 的空溜漆色路线；官方价格表另按 F/M/B 列出商品号。", sourceKey: S.price.key, variantKind: "material", productCode: "PIZ-55000 #27", market: "日本/国际经销" },
    { key: "phase316-tamenuri-akatame", name: "#28 Akatame 赤溜", notes: "PIZ-55000 的赤溜漆色路线；官方价格表另按 F/M/B 列出商品号。", sourceKey: S.price.key, variantKind: "material", productCode: "PIZ-55000 #28", market: "日本/国际经销" },
    { key: "phase316-tamenuri-biwatame", name: "#30 Biwatame 枇杷溜", notes: "PIZ-55000 的枇杷溜漆色路线；官方日本产品页使用 PIZ-55000 产品号。", sourceKey: S.product.key, variantKind: "material", productCode: "PIZ-55000 #30", market: "日本/国际经销" },
    { key: "phase316-tamenuri-nibs", name: "大型 18K F / M / B", notes: "同一 PIZ-55000 下的字幅选择，不拆成独立型号。", sourceKey: S.price.key, variantKind: "nib", productCode: "PIZ-55000", market: "日本/国际经销" },
  ],
  spec: {
    brandEntityId: PHASE316_PLATINUM_BRAND_ID,
    values: { series_name: "Platinum Izumo Tamenuri PIZ-55000", release_year: "2019", origin_country: "日本品牌；Izumo 出云系列", nib: "大型 18K 金尖；F、M、B", fill_system: "Platinum 专用墨囊／转换器两用式", material: "硬橡胶（ebonite）基材；Tamenuri 溜塗；#27/#28/#30", dimensions: "全长约 154 mm × 最大径约 18 mm", weight: "约 34.5 g", price_range: "官方价格表的日期限定快照；地区与日期决定实际价格", status: "PIZ-55000 型号；#27 空溜、#28 赤溜、#30 枇杷溜漆色版本" },
    evidence: [
      evidence("phase316-brand", "brand_entity_id", S.family.key, "Izumo/Platinum product identity"), evidence("phase316-series", "series_name", S.product.key, "PIZ-55000 heading"), evidence("phase316-release", "release_year", S.catalog.key, "2019–2020 catalog context"), evidence("phase316-origin", "origin_country", S.family.key, "Platinum Japanese official context"), evidence("phase316-nib", "nib", S.retailer.key, "18K F/M/B field"), evidence("phase316-fill", "fill_system", S.maintenance.key, "Izumo cartridge/converter guidance"), evidence("phase316-material", "material", S.retailer.key, "ebonite with Tamenuri coating"), evidence("phase316-dimensions", "dimensions", S.retailer.key, "154 mm x 18 mm size field"), evidence("phase316-weight", "weight", S.retailer.key, "34.5 g weight field"), evidence("phase316-price", "price_range", S.price.key, "date-bound price table"), evidence("phase316-status", "status", S.family.key, "PIZ-55000 color boundaries"),
    ],
  },
  timeline: [{ key: "phase316-tamenuri-catalog", title: "PIZ-55000 出现在官方 Izumo 目录", eventType: "model_released", startDate: "2019-01-01", circa: true, description: "Platinum 官方 Fine Writing 目录列出 Izumo Tamenuri PIZ-55000；后续价格表按 #27/#28/#30 与 F/M/B 细分商品号。", sourceKey: S.catalog.key }],
  media: [{ key: "phase316-tamenuri-primary-media", title: "PIZ-55000 Tamenuri 事实卡（非产品照片）", sourceKey: S.diagram.key, localPath: S.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。", sourceUrl: S.diagram.url, usageStatus: "primary" }],
};

export const phase316PlatinumIzumoPiz55000TamenuriPacks: CuratedEntityPack[] = [inheritedBrand, model];
