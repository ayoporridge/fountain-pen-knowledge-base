import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";
import { phase78PlatinumCuridasPacks } from "./phase78-platinum-curidas";

export const PHASE314_PLATINUM_BRAND_ID = "e51tJpejEkXY";
export const PHASE314_TAGAYASAN_ID = "phase314-platinum-izumo-piz-50000t-tagayasan";
export const PHASE314_TAGAYASAN_SLUG = "platinum-izumo-piz-50000t-tagayasan";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase314-piz-50000t-tagayasan-current";
const BOUNDARY_SCOPE = "phase314-piz-50000t-tagayasan-boundaries";
const CARE_SCOPE = "phase314-piz-50000t-tagayasan-care";

function web(input: { key: string; title: string; url: string; summary: string; locator: string; sourceType?: CuratedSource["sourceType"]; tier?: CuratedSource["tier"]; registryKey?: string; registryName?: string; homepageUrl?: string; author?: string; publishedAt?: string }): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const registryKey = input.registryKey ?? "platinum-official-phase314";
  return {
    key: input.key,
    registryKey,
    registryName: input.registryName ?? (sourceType === "official" ? "Platinum Pen Co., Ltd." : "Fountain Pen Graph editorial studio"),
    sourceType,
    tier: input.tier ?? "primary",
    independenceGroup: registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://www.platinum-pen.co.jp/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author: input.author ?? (sourceType === "official" ? "Platinum Pen Co., Ltd." : "Fountain Pen Graph editorial"),
    publishedAt: input.publishedAt ?? null,
    retrievedAt: RETRIEVED,
    allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only",
    license: sourceType === "user_submission" ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: sourceType === "user_submission" ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.94, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }] };
}
function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  product: web({ key: "phase314-tagayasan-product", title: "Izumo Tagayasan PIZ-50000T", url: "https://www.platinum-pen.co.jp/en/products/detail/?pid=2149", summary: "Platinum 官方产品页确认 PIZ-50000T、Tagayasan/Bombay Blackwood、18K F/M/B、164 mm、18.2 mm、38 g 与 #20/#21 产品卡。", locator: "PIZ-50000T heading; Tagayasan, nib, material, size and weight fields" }),
  catalog: web({ key: "phase314-tagayasan-catalog", title: "Platinum Fine Writing catalog 2019–2020", url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/Platinum-pen-general-catalog-2019-2020.pdf", publishedAt: "2019-01-01", summary: "Platinum 官方目录把 #20 Matte 与 #21 Gloss 列为同一 PIZ-50000T 型号的铁刀木变体，并重申 18K F/M/B、164 mm、18.2 mm、38 g。", locator: "Izumo Tagayasan PIZ-50000T #20/#21 catalog entry" }),
  family: web({ key: "phase314-tagayasan-family", title: "Platinum IZUMO brand lineup", url: "https://www.platinum-pen.co.jp/en/brands/detail/?pid=70", summary: "Izumo 品牌页将 PIZ-50000T 与 PIZ-55000、PIZ-80000N、PIZ-160000 等材料路线分开。", locator: "IZUMO lineup and separate PIZ product labels" }),
  maintenance: web({ key: "phase314-tagayasan-maintenance", title: "Common practices on how to ensure long-term use of Izumo", url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/02/izumo-1.pdf", summary: "Izumo 手册用于墨囊/转换器取下、清水冲洗与晾干边界，不推导木轴上油或打磨许可。", locator: "Izumo manual cartridge/converter and nib rinse instructions" }),
  retailer: web({ key: "phase314-tagayasan-chatterley", title: "Platinum Izumo Tagayasan Glossy Wood Fountain Pen", url: "https://chatterleyluxuries.com/product/platinum-izumo-tagayasan-bombay-black-glossy-wood-fountain-pen/", sourceType: "retailer", tier: "professional_secondary", registryKey: "chatterley-phase314", registryName: "Chatterley Luxuries", homepageUrl: "https://chatterleyluxuries.com/", author: "Chatterley Luxuries", summary: "专业经销页以 PIZ-50000T #21 列出 Tagayasan、18K F/M/B、164 mm、18.2 mm、38 g，用于交叉核对市场 SKU。", locator: "PIZ-50000T #21, material, nib, size and weight fields" }),
  diagram: web({ key: "phase314-tagayasan-svg", title: "PIZ-50000T Tagayasan factual diagram", url: "/images/library/site-original/phase314/platinum/izumo-piz-50000t-tagayasan.svg", sourceType: "user_submission", registryKey: "fountain-pen-graph-editorial-phase314", summary: "本站原创事实 SVG，标出铁刀木、#20/#21、规格与身份边界；非产品照片。", locator: "site-original factual SVG metadata" }),
} as const;

const inheritedBrand = phase78PlatinumCuridasPacks.find((pack) => pack.entityId === PHASE314_PLATINUM_BRAND_ID && pack.expectedType === "brand");
if (!inheritedBrand) throw new Error("Phase 314 Platinum brand pack is unavailable.");

const model: CuratedEntityPack = {
  key: "phase314-platinum-izumo-piz-50000t-tagayasan-v1",
  entityId: PHASE314_TAGAYASAN_ID,
  expectedType: "pen",
  expectedSlug: PHASE314_TAGAYASAN_SLUG,
  canonicalName: "Platinum Izumo Tagayasan PIZ-50000T 铁刀木",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/platinum-izumo-piz-50000t-tagayasan-phase314.md",
  storyTitle: "Platinum Izumo PIZ-50000T：铁刀木 #20/#21",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Platinum Izumo Tagayasan PIZ-50000T", language: "en", sourceKey: S.product.key },
    { alias: "Izumo Tagayasan #20 Matte / #21 Gloss", language: "en", sourceKey: S.catalog.key },
    { alias: "白金 出云 铁刀木", language: "zh", sourceKey: S.product.key },
  ],
  sources: [S.product, S.catalog, S.family, S.maintenance, S.retailer, S.diagram],
  scopes: [
    { key: SCOPE, scopeKey: SCOPE, market: "Platinum Izumo Tagayasan", validFrom: "2019-01-01", productionState: "current", nibScope: "Large 18K F/M/B", materialScope: "Bombay Blackwood/Tagayasan with #20 Matte or #21 Gloss; Platinum cartridge/converter", editionScope: "PIZ-50000T" },
    { key: BOUNDARY_SCOPE, scopeKey: BOUNDARY_SCOPE, productionState: "current", editionScope: "Independent from PIZ-55000 Tamenuri, PIZ-80000N Yakumonuri, PIZ-160000 Galaxy and PIZ-150000PW Precious Wood" },
    { key: CARE_SCOPE, scopeKey: CARE_SCOPE, productionState: "current", editionScope: "Platinum cartridge/converter cleaning; no solvent, oiling, sanding or long-soak claim for wood" },
  ],
  claims: [
    claim("phase314-tagayasan-identity", "model_identity", "PIZ-50000T 是 Platinum Izumo Tagayasan 铁刀木型号，#20 Matte 与 #21 Gloss 是同一型号的表面变体，不是两个独立型号。", S.product.key, "PIZ-50000T and surface fields"),
    claim("phase314-tagayasan-material", "material", "官方把 Tagayasan 解释为 Bombay Blackwood 铁刀木，木料经干燥、削制和手工研磨；公开资料不支持外推具体木材产地或工匠。", S.product.key, "Tagayasan material and hand finishing description"),
    claim("phase314-tagayasan-spec", "specification", "官方规格为大型 18K F/M/B 尖、全长 164 mm、最大径 18.2 mm、重量 38 g。", S.product.key, "nib, size and weight fields"),
    claim("phase314-tagayasan-fill", "filling_and_care", "PIZ-50000T 使用 Platinum 墨囊／Converter-800A；Izumo 手册支持清水清洗，不支持自行上油、打磨或强溶剂处理木轴。", S.maintenance.key, "cartridge/converter and rinse guidance"),
    claim("phase314-tagayasan-boundary", "identity_boundaries", "Tagayasan 与 PIZ-55000 Tamenuri、PIZ-80000N Yakumonuri、PIZ-160000 Galaxy 和 PIZ-150000PW 使用不同产品号与材料路线，不能共享图片或规格。", S.family.key, "IZUMO product-number/material separation"),
    claim("phase314-tagayasan-retailer", "market_crosscheck", "Chatterley 以 PIZ-50000T #21 交叉记录 Tagayasan、18K F/M/B、164 mm、18.2 mm 和 38 g；零售页不替代官方当前库存口径。", S.retailer.key, "retailer SKU and specification fields"),
    claim("phase314-tagayasan-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明真实木纹、颜色、比例、Logo、刻字、库存或实物品相。", S.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase314-tagayasan-matte", name: "#20 Matte 哑光", notes: "同一 PIZ-50000T 的哑光表面路线，不拆为新型号。", sourceKey: S.catalog.key, variantKind: "material", productCode: "PIZ-50000T", market: "日本/国际经销" },
    { key: "phase314-tagayasan-gloss", name: "#21 Gloss 光泽", notes: "同一 PIZ-50000T 的光泽表面路线，不拆为新型号。", sourceKey: S.catalog.key, variantKind: "material", productCode: "PIZ-50000T", market: "日本/国际经销" },
    { key: "phase314-tagayasan-nibs", name: "大型 18K F / M / B", notes: "同一 PIZ-50000T 下的字幅选择。", sourceKey: S.product.key, variantKind: "nib", productCode: "PIZ-50000T", market: "日本/国际经销" },
  ],
  spec: {
    brandEntityId: PHASE314_PLATINUM_BRAND_ID,
    values: { series_name: "Platinum Izumo Tagayasan PIZ-50000T", release_year: "2019", origin_country: "日本品牌；未外推具体木材工坊", nib: "大型 18K 金尖；F、M、B", fill_system: "Platinum 墨囊／Converter-800A 两用式", material: "Bombay Blackwood 铁刀木；#20 Matte / #21 Gloss 表面处理", dimensions: "全长 164 mm × 最大径 18.2 mm", weight: "38 g", price_range: "官方目录与价格表给出地区限定 SKU；当前价格与库存按日期核对", status: "PIZ-50000T 铁刀木型号；#20/#21 表面变体" },
    evidence: [
      evidence("phase314-brand", "brand_entity_id", S.product.key, "Izumo/Platinum product identity"), evidence("phase314-series", "series_name", S.product.key, "PIZ-50000T title"), evidence("phase314-release", "release_year", S.catalog.key, "2019–2020 catalog context"), evidence("phase314-origin", "origin_country", S.product.key, "Platinum Japan official context"), evidence("phase314-nib", "nib", S.product.key, "18K F/M/B field"), evidence("phase314-fill", "fill_system", S.maintenance.key, "Izumo cartridge/converter guidance"), evidence("phase314-material", "material", S.product.key, "Tagayasan/Bombay Blackwood fields"), evidence("phase314-dimensions", "dimensions", S.product.key, "164 mm x 18.2 mm size field"), evidence("phase314-weight", "weight", S.product.key, "38 g weight field"), evidence("phase314-price", "price_range", S.catalog.key, "catalog/price context is date-bound"), evidence("phase314-status", "status", S.family.key, "Izumo product-number boundary"),
    ],
  },
  timeline: [{ key: "phase314-tagayasan-catalog", title: "Izumo Tagayasan PIZ-50000T 进入官方目录", eventType: "model_released", startDate: "2019-01-01", circa: true, description: "Platinum 官方 Fine Writing 目录列出 PIZ-50000T 铁刀木 #20 Matte 与 #21 Gloss。", sourceKey: S.catalog.key }],
  media: [{ key: "phase314-tagayasan-primary-media", title: "PIZ-50000T Tagayasan 事实卡（非产品照片）", sourceKey: S.diagram.key, localPath: S.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。", sourceUrl: S.diagram.url, usageStatus: "primary" }],
};

export const phase314PlatinumIzumoPiz50000tTagayasanPacks: CuratedEntityPack[] = [inheritedBrand, model];
