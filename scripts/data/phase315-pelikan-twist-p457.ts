import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";
import { phase35PelikanSouveranVariantPacks } from "./phase35-pelikan-souveran-variants";

export const PHASE315_PELIKAN_ID = "VXUULuCOLOB1";
export const PHASE315_TWIST_ID = "wnzMt5lugvtc";
export const PHASE315_TWIST_SLUG = "pelikan-twist";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase315-pelikan-twist-p457-current";
const BOUNDARY_SCOPE = "phase315-pelikan-twist-p457-boundaries";
const CARE_SCOPE = "phase315-pelikan-twist-p457-care";

function web(input: { key: string; title: string; url: string; summary: string; locator: string; sourceType?: CuratedSource["sourceType"]; tier?: CuratedSource["tier"]; registryKey?: string; registryName?: string; homepageUrl?: string; author?: string; publishedAt?: string }): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const registryKey = input.registryKey ?? "pelikan-official-phase315";
  return {
    key: input.key,
    registryKey,
    registryName: input.registryName ?? (sourceType === "official" ? "Pelikan" : "Fountain Pen Graph editorial studio"),
    sourceType,
    tier: input.tier ?? "primary",
    independenceGroup: registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://www.pelikan.com/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author: input.author ?? (sourceType === "official" ? "Pelikan" : "Fountain Pen Graph editorial"),
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
  current: web({ key: "phase315-twist-current", title: "Twist Fountain Pens Standard — P457", url: "https://www.pelikan.com/int/en/products/writing/58-fountain-pens/61-twist-2.html", summary: "Pelikan 当前国际产品页直接列出 FP Twist P457 M Deep Blue 与 P457 M Deep Blue FB，并说明扭转三角握位、软握区和左右手通用。", locator: "Twist product features and FP Twist P457 M Deep Blue rows" }),
  mam: web({ key: "phase315-twist-mam", title: "Twist Fountain pens P457 Night Breeze/Fresh Melon", url: "https://mam.pelikan.com/mam/en/pelikan/products/605472", summary: "Pelikan MAM 产品资料以 P457、M 尖、Night Breeze/Fresh Melon 和墨囊套装交叉确认具体 SKU；不扩大为所有年份包装。", locator: "P457 product title, nib and package details" }),
  archive: web({ key: "phase315-twist-archive", title: "Pelikan Collectibles — School & Youth Pens / Twist", url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Cartridge-filler/School-youngsters-fp/index.html#heading_toc_j_14", tier: "contemporary_archive", registryKey: "pelikan-collectibles-phase315", registryName: "Pelikan Collectibles", summary: "专业档案记录现代 Twist 自 2013 年起及约 140 mm、17.5 mm、19 g、1.4 ml giant cartridge 参考值，并将 R457 分为 rollerball。", locator: "Twist since 2013 chronology, measurements, giant cartridge and R457 boundary" }),
  pelikanHistory: web({ key: "phase315-twist-history", title: "Pelikan History", url: "https://www.pelikan.com/ae/brand/pelikan-history.html", summary: "Pelikan 官方历史页用于说明 1950 年 400 的活塞传统，不能把 400/M400 的机构或规格写到 P457。", locator: "400 historical piston-filling context" }),
  pelikano: web({ key: "phase315-twist-pelikano", title: "Pelikan Collectibles — Pelikano history", url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Cartridge-filler/Pelikano/index.html", tier: "contemporary_archive", registryKey: "pelikan-collectibles-pelikano-phase315", registryName: "Pelikan Collectibles", summary: "档案确认 P450/P451 属于 Pelikano 各代编号，不是 Twist P457 的前代或颜色别名。", locator: "P450/P451 Pelikano chronology" }),
  perch: web({ key: "phase315-twist-perch", title: "The Pelikan's Perch — Pelikan 400", url: "https://thepelikansperch.com/2019/03/05/pelikan-400-fountain-pen/", sourceType: "blog", tier: "professional_secondary", registryKey: "the-pelikans-perch-phase315", registryName: "The Pelikan's Perch", homepageUrl: "https://thepelikansperch.com/", author: "The Pelikan's Perch", summary: "专业收藏资料交叉说明历史 400 的身份与活塞路线，不作为 P457 规格来源。", locator: "Pelikan 400 family history" }),
  svg: web({ key: "phase315-twist-svg", title: "Pelikan Twist P457 factual diagram", url: "/images/library/site-original/pelikan-m200-p457/p457.svg", sourceType: "user_submission", registryKey: "fountain-pen-graph-editorial-phase315", summary: "本站已有原创 P457 事实 SVG，标注扭转三角握位、钢尖、墨囊和颜色边界；非产品照片。", locator: "existing site-original P457 SVG metadata" }),
} as const;

const brand = phase35PelikanSouveranVariantPacks.find((pack) => pack.entityId === PHASE315_PELIKAN_ID && pack.expectedType === "brand");
if (!brand) throw new Error("Phase 315 Pelikan brand pack is unavailable.");

const model: CuratedEntityPack = {
  key: "phase315-pelikan-twist-p457-v2",
  entityId: PHASE315_TWIST_ID,
  expectedType: "pen",
  expectedSlug: PHASE315_TWIST_SLUG,
  canonicalName: "百利金 Pelikan Twist P457",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pelikan-twist-p457-phase315.md",
  storyTitle: "Pelikan Twist P457：扭转握位与墨囊平台",
  primarySourceKey: S.current.key,
  depthTier: "A",
  aliases: [
    { alias: "Pelikan Twist P457", language: "en", sourceKey: S.current.key },
    { alias: "Pelikan Twist fountain pen", language: "en", sourceKey: S.archive.key },
    { alias: "P457", language: "en", sourceKey: S.mam.key },
    { alias: "百利金 Twist P457", language: "zh", sourceKey: S.current.key },
  ],
  sources: [S.current, S.mam, S.archive, S.pelikanHistory, S.pelikano, S.perch, S.svg],
  scopes: [
    { key: SCOPE, scopeKey: SCOPE, market: "Pelikan modern Twist P457", validFrom: "2013", productionState: "current", nibScope: "Stainless steel; common M; Calligraphy 1.5 is separate variant scope", materialScope: "Twisted triangular injection-moulded body with soft grip zone", editionScope: "P457 fountain pen; colors and packages vary by SKU" },
    { key: BOUNDARY_SCOPE, scopeKey: BOUNDARY_SCOPE, productionState: "current", editionScope: "R457 rollerball, P450/P451 Pelikano, historical 400/M400 and old Twist P10/P20 excluded from canonical identity" },
    { key: CARE_SCOPE, scopeKey: CARE_SCOPE, productionState: "current", editionScope: "Pelikan cartridge cleaning; no piston, solvent or DIY nib-modification claim" },
  ],
  claims: [
    claim("phase315-twist-identity", "model_identity", "现有 Pelikan Twist 实体的规范名称为 Pelikan Twist P457；官方当前页列 P457 fountain pen，本次不创建第二个 P457 实体。", S.current.key, "current FP Twist P457 rows"),
    claim("phase315-twist-history", "platform_history", "专业档案将现代 Twist 记为 2013 年起的平台，并给出约 140 mm、17.5 mm、19 g 和 1.4 ml 大容量墨囊的参考值。", S.archive.key, "Twist since 2013 and platform reference measurements"),
    claim("phase315-twist-design", "ergonomic_design", "官方将扭转三角截面、软握区和左右手通用作为产品特征；这些是设计定位，不是对每位使用者舒适度的保证。", S.current.key, "Twist product feature bullets"),
    claim("phase315-twist-fill", "filling_system", "P457 使用 Pelikan 墨囊平台，不应套用 M200/M400 活塞或瓶装容量；具体套装附几支墨囊要按 SKU 记录。", S.mam.key, "P457 M product and package fields"),
    claim("phase315-twist-boundary", "identity_boundaries", "R457 是 rollerball，P450/P451 是 Pelikano 编号，历史 400/M400 属活塞路线，旧 Twist P10/P20 也不应合并到 P457。", S.pelikano.key, "R457/P450 and family boundaries"),
    claim("phase315-twist-400-boundary", "historical_boundary", "Pelikan 官方历史将 400 放在传统活塞路线；专业资料用于交叉确认其与现代 Twist 的年代和机构差异。", S.pelikanHistory.key, "400 historical context", "core"),
    claim("phase315-twist-professional-crosscheck", "professional_crosscheck", "The Pelikan's Perch 的历史资料把 400 作为传统 Pelikan 活塞笔讨论，不能用来替代 P457 的当前 SKU 或墨囊规格。", S.perch.key, "professional 400-family cross-check", "core"),
    claim("phase315-twist-variants", "version_scope", "普通颜色、套装、Eco、Structure 和 Calligraphy 应按有证据的颜色、材料、尖号或包装变体记录，不能抹平成一支永恒的黑色 P457。", S.archive.key, "Twist platform and variant boundary", "editorial"),
    claim("phase315-twist-care", "maintenance_guidance", "换墨先确认墨囊刺穿和导墨，再用清水冲洗；软握区和注塑件避免酒精、强溶剂、热水和硬物刮擦。", S.mam.key, "P457 cartridge package and conservative care boundary", "editorial"),
    claim("phase315-twist-media", "media_identity_boundary", "主图为本站已有原创事实 SVG，非产品照片，不证明具体颜色、比例、Logo、条码、库存或某一支实物品相。", S.svg.key, "existing site-original P457 SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase315-twist-deep-blue", name: "P457 M Deep Blue", notes: "官方当前页直接列出的 P457 单支/套装颜色；包装和附墨囊数量依 item number。", sourceKey: S.current.key, variantKind: "market_sku", productCode: "814737/814744", market: "国际" },
    { key: "phase315-twist-night-breeze", name: "P457 M Night Breeze / Fresh Melon display", notes: "MAM 资料覆盖的 display 组合，不代表所有地区的固定配货。", sourceKey: S.mam.key, variantKind: "market_sku", productCode: "605472", market: "Pelikan MAM" },
    { key: "phase315-twist-colors", name: "Twist Color Edition colors", notes: "颜色、包装和货号变体；不拆成独立 P457 型号。", sourceKey: S.archive.key, variantKind: "color", market: "历史/地区" },
    { key: "phase315-twist-calligraphy", name: "Twist Calligraphy 1.5", notes: "明确的宽书法尖范围；不能用它替代普通 P457 M 尖。", sourceKey: S.archive.key, variantKind: "nib", market: "2023 scope" },
    { key: "phase315-twist-structure-eco", name: "Twist Eco / Structure", notes: "材料或表面结构范围，具体 SKU 需另查；不改变 P457 主身份。", sourceKey: S.archive.key, variantKind: "material", market: "2023 scope" },
  ],
  spec: {
    brandEntityId: PHASE315_PELIKAN_ID,
    values: { series_name: "Pelikan Twist P457", release_year: "2013 起", origin_country: "德国品牌；制造地按具体 SKU 资料确认", nib: "不锈钢尖；常见 M；Calligraphy 1.5 为另列变体", fill_system: "Pelikan 大容量墨囊", material: "注塑笔身、软握区、扭转三角截面", dimensions: "档案参考：全长约 140 mm、最大径约 17.5 mm", weight: "档案参考约 19 g", price_range: "颜色、套装与地区价格按官方 SKU 和日期核对", status: "官方当前产品线仍列 P457；R457/P450/400 分开" },
    evidence: [
      evidence("phase315-brand", "brand_entity_id", S.current.key, "Pelikan maker identity"), evidence("phase315-series", "series_name", S.current.key, "P457 current product rows"), evidence("phase315-release", "release_year", S.archive.key, "Twist since 2013"), evidence("phase315-origin", "origin_country", S.mam.key, "official product context"), evidence("phase315-nib", "nib", S.mam.key, "P457 M and steel nib context"), evidence("phase315-fill", "fill_system", S.mam.key, "P457 package and cartridge context"), evidence("phase315-material", "material", S.current.key, "twisted triangular shape and soft grip"), evidence("phase315-dimensions", "dimensions", S.archive.key, "platform reference measurements"), evidence("phase315-weight", "weight", S.archive.key, "19 g archive reference"), evidence("phase315-price", "price_range", S.current.key, "current SKU/market boundary"), evidence("phase315-status", "status", S.current.key, "P457 current product rows"),
    ],
  },
  timeline: [{ key: "phase315-twist-start", title: "现代 Pelikan Twist 平台出现", eventType: "model_released", startDate: "2013", circa: true, description: "Pelikan Collectibles 将现代 Twist 记录为 2013 年起的平台；当前官网仍列 P457。", sourceKey: S.archive.key }],
  media: [{ key: "phase315-twist-primary-media", title: "Pelikan Twist P457 事实卡（非产品照片）", sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

export const phase315PelikanTwistP457Packs: CuratedEntityPack[] = [brand, model];
