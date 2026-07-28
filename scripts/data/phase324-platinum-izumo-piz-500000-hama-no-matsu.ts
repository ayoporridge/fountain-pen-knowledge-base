import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";
import { phase78PlatinumCuridasPacks } from "./phase78-platinum-curidas";

export const PHASE324_PLATINUM_BRAND_ID = "e51tJpejEkXY";
export const PHASE324_HAMA_NO_MATSU_ID = "phase324-platinum-izumo-piz-500000-hama-no-matsu";
export const PHASE324_HAMA_NO_MATSU_SLUG = "platinum-izumo-piz-500000-hama-no-matsu";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase324-piz-500000-current";
const BOUNDARY_SCOPE = "phase324-piz-500000-boundaries";
const CARE_SCOPE = "phase324-piz-500000-care";

function web(input: { key: string; title: string; url: string; summary: string; locator: string; sourceType?: CuratedSource["sourceType"]; tier?: CuratedSource["tier"]; registryKey?: string; registryName?: string; homepageUrl?: string; author?: string; publishedAt?: string }): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const registryKey = input.registryKey ?? "platinum-official-phase324";
  return { key: input.key, registryKey, registryName: input.registryName ?? (sourceType === "official" ? "Platinum Pen Co., Ltd." : "Fountain Pen Graph editorial studio"), sourceType, tier: input.tier ?? "primary", independenceGroup: registryKey, title: input.title, url: input.url, homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://www.platinum-pen.co.jp/" : "/"), itemType: sourceType === "user_submission" ? "image" : "web_page", author: input.author ?? (sourceType === "official" ? "Platinum Pen Co., Ltd." : "Fountain Pen Graph editorial"), publishedAt: input.publishedAt ?? null, retrievedAt: RETRIEVED, allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only", license: sourceType === "user_submission" ? "site-original" : undefined, summary: input.summary, archiveUrl: input.url, archiveLocator: sourceType === "user_submission" ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim { return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.94, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }] }; }
function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence { return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true }; }

const S = {
  catalog: web({ key: "phase324-hama-no-matsu-catalog", title: "Platinum Fine Writing catalog 2019–2020", url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/Platinum-pen-general-catalog-2019-2020.pdf", publishedAt: "2019-01-01", summary: "官方目录把 PIZ-500000 #55 Hama no Matsu 列为 Kaga Maki-e、18K F/M/B、ebonite、154 mm、18 mm、34.1 g。", locator: "PDF p.08 Izumo Kaga Maki-e PIZ-500000 #55 row" }),
  price: web({ key: "phase324-hama-no-matsu-price", title: "Platinum 2023 price revision list", url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2022/12/52ea6d6214b3a3003e19c057c7f7fedf-1.pdf", publishedAt: "2023-01-16", summary: "官方价格表列 PIZ-500000 55-2/3/4 的 F/M/B 旧价 500,000、新价 600,000 日元，均为未税。", locator: "PDF p.0 PIZ-500000 55-2/3/4 and PIZ-300000 #55 rows" }),
  usa: web({ key: "phase324-hama-no-matsu-usa", title: "Platinum Pen USA Izumo Collection", url: "https://platinumpenusa.com/luxury-writing/izumo-collection/", sourceType: "retailer", tier: "professional_secondary", registryKey: "platinum-pen-usa-phase324", registryName: "Platinum Pen USA", homepageUrl: "https://platinumpenusa.com/", author: "Platinum Pen USA", summary: "Platinum Pen USA 将 #55 Hama no Matsu 作为 Kaga Taka Maki-e 作品列出，并给出 18K 宽幅尖、154×18 mm 和桐箱。", locator: "PIZ-500000 #55 Hama no Matsu family entry and specification context" }),
  retailer: web({ key: "phase324-hama-no-matsu-retailer", title: "Pen House: Platinum Izumo Kaga Maki-e Hama no Matsu", url: "https://www.penhouse.ro/instrumente-de-scris/stilouri/stilou-platinum-izumo-kaga-maki-e-hama-n", sourceType: "retailer", tier: "professional_secondary", registryKey: "pen-house-phase324", registryName: "Pen House", homepageUrl: "https://www.penhouse.ro/", author: "Pen House", summary: "授权零售页列 PIZ-500000 55M、18K M 尖与实物尺寸重量快照；不替代官方目录。", locator: "PIZ-500000 55M product code and dimensions fields" }),
  maintenance: web({ key: "phase324-hama-no-matsu-maintenance", title: "Platinum Izumo 官方使用与维护手册", url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/02/izumo-1.pdf", summary: "Izumo 官方手册说明墨囊/转换器清洁、清水冲洗和漆艺表面的溶剂与浸泡边界。", locator: "Izumo cartridge/converter cleaning and lacquer caution" }),
  diagram: web({ key: "phase324-hama-no-matsu-svg", title: "PIZ-500000 #55 Hama no Matsu factual diagram", url: "/images/library/site-original/phase324/platinum/izumo-piz-500000-hama-no-matsu.svg", sourceType: "user_submission", registryKey: "fountain-pen-graph-editorial-phase324", summary: "本站原创事实 SVG，标出 PIZ-500000 #55、Kaga 高蒔绘和 PIZ-300000 #55 边界；非产品照片。", locator: "site-original factual SVG metadata" }),
} as const;

const inheritedBrand = phase78PlatinumCuridasPacks.find((pack) => pack.entityId === PHASE324_PLATINUM_BRAND_ID && pack.expectedType === "brand");
if (!inheritedBrand) throw new Error("Phase 324 Platinum brand pack is unavailable.");

const model: CuratedEntityPack = {
  key: "phase324-platinum-izumo-piz-500000-hama-no-matsu-v1",
  entityId: PHASE324_HAMA_NO_MATSU_ID,
  expectedType: "pen",
  expectedSlug: PHASE324_HAMA_NO_MATSU_SLUG,
  canonicalName: "Platinum Izumo PIZ-500000 #55 滨之松 Hama no Matsu",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/platinum-izumo-piz-500000-hama-no-matsu-phase324.md",
  storyTitle: "Platinum Izumo PIZ-500000 #55：滨之松 Hama no Matsu",
  primarySourceKey: S.catalog.key,
  depthTier: "A",
  aliases: [
    { alias: "Platinum Izumo Kaga Maki-e Hama no Matsu PIZ-500000-55", language: "en", sourceKey: S.retailer.key },
    { alias: "出雲 加賀蒔絵 浜の松 PIZ-500000", language: "ja", sourceKey: S.price.key },
    { alias: "白金 出云 滨之松／浜の松", language: "zh", sourceKey: S.usa.key },
  ],
  sources: [S.catalog, S.price, S.usa, S.retailer, S.maintenance, S.diagram],
  scopes: [
    { key: SCOPE, scopeKey: SCOPE, market: "Platinum Izumo Kaga Maki-e Hama no Matsu", validFrom: "2019-01-01", productionState: "current", nibScope: "18K gold F/M/B", materialScope: "ebonite body; Hon-Urushi Taka Maki-e; Platinum cartridge/converter", editionScope: "PIZ-500000 #55 Hama no Matsu" },
    { key: BOUNDARY_SCOPE, scopeKey: BOUNDARY_SCOPE, productionState: "current", editionScope: "Independent from PIZ-300000 #55 Hama no Matsu, PIZ-600000 #56, PIZ-300000 #93 and PIZ-300000A #82" },
    { key: CARE_SCOPE, scopeKey: CARE_SCOPE, productionState: "current", editionScope: "Platinum cartridge/converter cleaning; no long soaking, sanding, waxing, solvent or glue repair for urushi/maki-e finish" },
  ],
  claims: [
    claim("phase324-hama-no-matsu-identity", "model_identity", "PIZ-500000 #55 是 Platinum Izumo Kaga Maki-e Hama no Matsu（浜の松／滨之松）型号。", S.catalog.key, "PIZ-500000 #55 Hama no Matsu row"),
    claim("phase324-hama-no-matsu-craft", "craft_process", "官方目录把表面工艺列为 Taka Maki-e 高蒔绘；Platinum Pen USA 将题材解释为海滨松与海浪景观，不外推粉末配方或工匠细节。", S.usa.key, "Hama no Matsu Taka Maki-e description"),
    claim("phase324-hama-no-matsu-spec", "specification", "官方目录规格为 18K F/M/B、ebonite、154 mm、最大径 18 mm、34.1 g；零售页面存在约 35 g 的测量快照。", S.catalog.key, "PIZ-500000 specification row"),
    claim("phase324-hama-no-matsu-price", "price_snapshot", "Platinum 2023 年 1 月价格表将 PIZ-500000 F/M/B 未税新价列为 600,000 日元，并与同名 PIZ-300000 #55 分列。", S.price.key, "PIZ-500000 55-2/3/4 price rows and PIZ-300000 #55 rows"),
    claim("phase324-hama-no-matsu-boundary", "identity_boundaries", "PIZ-500000 #55 与 PIZ-300000 #55 虽同题材，产品号和 Taka/Hira Maki-e 工艺路线不同，不能共享图片或规格。", S.price.key, "PIZ-500000 and PIZ-300000 #55 adjacent price/product rows"),
    claim("phase324-hama-no-matsu-care", "filling_and_care", "Izumo 官方手册用于墨囊/转换器清洗、阴干和漆面保护边界。", S.maintenance.key, "Izumo maintenance handbook"),
    claim("phase324-hama-no-matsu-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明真实颜色、金银粉、比例、Logo、序号或实物品相。", S.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase324-hama-no-matsu-55", name: "#55 Hama no Matsu 滨之松", notes: "PIZ-500000 的官方图案编号；不与 PIZ-300000 #55 合并。", sourceKey: S.catalog.key, variantKind: "material", productCode: "PIZ-500000 #55", market: "日本/国际经销" },
    { key: "phase324-hama-no-matsu-nibs", name: "18K F / M / B", notes: "同一 PIZ-500000 下的尖幅选择；价格表用 55-2/3/4 区分商品代码。", sourceKey: S.price.key, variantKind: "nib", productCode: "PIZ-500000 55-2/3/4", market: "日本/国际经销" },
  ],
  spec: {
    brandEntityId: PHASE324_PLATINUM_BRAND_ID,
    values: { series_name: "Platinum Izumo PIZ-500000 #55 Hama no Matsu", release_year: "2019–2020 官方目录快照", origin_country: "日本品牌；Izumo Kaga Maki-e 系列", nib: "18K gold；F、M、B", fill_system: "Platinum 墨囊／转换器；附件按地区和实物核对", material: "ebonite；Hon-Urushi Taka Maki-e 高蒔绘表面", dimensions: "154 mm（书写时约 134 mm）× 最大径 18 mm", weight: "官方目录 34.1 g；零售页面约 35 g 的测量快照", price_range: "Platinum 2023 价格表未税新价 600,000 日元；当前价格按日期、地区和库存核对", status: "PIZ-500000 #55 Hama no Matsu；Kaga Maki-e 高阶型号" },
    evidence: [evidence("phase324-brand", "brand_entity_id", S.catalog.key, "Izumo/Platinum product identity"), evidence("phase324-series", "series_name", S.catalog.key, "PIZ-500000 #55 heading"), evidence("phase324-release", "release_year", S.catalog.key, "2019–2020 official catalog context"), evidence("phase324-origin", "origin_country", S.catalog.key, "Platinum Japanese official context"), evidence("phase324-nib", "nib", S.catalog.key, "18K F/M/B field"), evidence("phase324-fill", "fill_system", S.retailer.key, "retailer filling/accessory context"), evidence("phase324-material", "material", S.catalog.key, "ebonite and Taka Maki-e fields"), evidence("phase324-dimensions", "dimensions", S.catalog.key, "154 mm x 18 mm size field"), evidence("phase324-weight", "weight", S.catalog.key, "34.1 g catalog snapshot"), evidence("phase324-price", "price_range", S.price.key, "2023 official price revision"), evidence("phase324-status", "status", S.usa.key, "Kaga Maki-e family boundary")] },
  timeline: [{ key: "phase324-hama-no-matsu-catalog", title: "Hama no Matsu 目录与价格快照", eventType: "model_released", startDate: "2019-01-01", circa: true, description: "Platinum 2019–2020 目录与后续价格表将 PIZ-500000 #55 Hama no Matsu 作为独立 Kaga Maki-e 型号列出。", sourceKey: S.catalog.key }],
  media: [{ key: "phase324-hama-no-matsu-primary-media", title: "PIZ-500000 #55 Hama no Matsu 事实卡（非产品照片）", sourceKey: S.diagram.key, localPath: S.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。", sourceUrl: S.diagram.url, usageStatus: "primary" }],
};

export const phase324PlatinumIzumoPiz500000HamaNoMatsuPacks: CuratedEntityPack[] = [inheritedBrand, model];
