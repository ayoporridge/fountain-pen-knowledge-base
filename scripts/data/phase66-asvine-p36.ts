import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

export const PHASE66_P36_ID = "cVCGtVIb8WBd";
export const PHASE66_LEGACY_BRAND_ID = "mx3fnAnteiHS";
export const PHASE66_P36_RAW_SLUG = "意斯华-p36";
export const PHASE66_P36_SLUG = "asvine-p36";

const RETRIEVED = "2026-07-20";

function live(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "homepageUrl" | "archiveUrl" | "archiveLocator" | "independenceGroup">): CuratedSource {
  return { ...input, homepageUrl: input.url, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`, independenceGroup: input.registryKey };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase66", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase66", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false` };
}

const SOURCES = {
  p36: live({ key: "phase66-asvine-p36-fpnibs", registryKey: "fpnibs-asvine-phase66", registryName: "FPnibs", sourceType: "retailer", tier: "contemporary_archive", title: "FPnibs: Asvine P36", url: "https://www.fpnibs.com/products/asvine-p36", summary: "当代零售 SKU 将 P36 列作 titanium and clear fountain pen with piston filling system；其 pen-only 选项可配 Bock 250 nib unit，不能外推为所有 P36 的原厂配置。" }),
  p36Discussion: live({ key: "phase66-asvine-p36-fpn", registryKey: "fountain-pen-network-asvine-phase66", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", title: "Fountain Pen Network: Asvine P36", url: "https://www.fountainpennetwork.com/forum/topic/376060-asvine/", summary: "2024 用户样本讨论 P36 Titanium、透明 acrylic、活塞与约 6 mm 级笔尖外形；长度、重量、出水和改装属于该作者样本，不是全系额定规格。" }),
  brandSvg: diagram("phase66-asvine-brand-svg", "Asvine 型号导航事实图", "/images/library/site-original/asvine/asvine-brand.svg"),
  p36Svg: diagram("phase66-asvine-p36-svg", "Asvine P36 身份与结构事实图", "/images/library/site-original/asvine/asvine-p36.svg"),
};

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function media(key: string, title: string, source: CuratedSource) {
  return [{ key, title, sourceKey: source.key, localPath: source.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、刻字、库存或具体笔尖/SKU。", sourceUrl: source.url, usageStatus: "primary" as const }];
}

/** The brand ID is resolved by the apply script from an exact existing slug/name, or created deterministically there. */
export function phase66AsvineP36Packs(brandId: string): CuratedEntityPack[] {
  const brandScope = "phase66-asvine-brand-scope";
  const p36Scope = "phase66-asvine-p36-scope";
  const brand: CuratedEntityPack = {
    key: "phase66-asvine-brand-v1", entityId: brandId, expectedType: "brand", expectedSlug: "asvine", canonicalName: "Asvine", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/asvine-p36.md", storyTitle: "Asvine：以供墨结构识别当代型号", primarySourceKey: SOURCES.p36.key, depthTier: "A",
    aliases: [{ alias: "Asvine", language: "en", sourceKey: SOURCES.p36.key }],
    sources: [SOURCES.p36, SOURCES.p36Discussion, SOURCES.brandSvg],
    scopes: [{ key: brandScope, scopeKey: brandScope, productionState: "current", editionScope: "品牌导航；只反链已完成身份、内容和来源核验的公开型号，不从销售站自述推断法人、创立年份或工厂史" }],
    claims: [
      { key: "phase66-asvine-brand-identity", predicate: "brand_identity", objectText: "Asvine 是市场可见的当代钢笔品牌名称；本页以已核实的 P36 为入口，不把销售站自述升级为法人、创立年份、生产地或厂史。", factClass: "core", confidence: 0.97, sourceKey: SOURCES.p36.key, locator: SOURCES.p36.summary, evidence: [{ key: "phase66-asvine-brand-identity-evidence", sourceKey: SOURCES.p36.key, scopeKey: brandScope, locator: SOURCES.p36.summary }] },
      { key: "phase66-asvine-brand-boundary", predicate: "brand_navigation_boundary", objectText: "P36 是活塞上墨路线；其透明笔身和钛配件不能与 V126/V200 等真空型号共用结构、图片或规格，社区样本体验也不外推全线。", factClass: "core", confidence: 0.98, sourceKey: SOURCES.p36Discussion.key, locator: SOURCES.p36Discussion.summary, evidence: [{ key: "phase66-asvine-brand-boundary-evidence", sourceKey: SOURCES.p36Discussion.key, scopeKey: brandScope, locator: SOURCES.p36Discussion.summary }, { key: "phase66-asvine-brand-p36-evidence", sourceKey: SOURCES.p36.key, scopeKey: brandScope, locator: SOURCES.p36.summary }] },
    ],
    media: media("phase66-asvine-brand-media", "Asvine 型号导航事实图（非产品照片）", SOURCES.brandSvg),
    timeline: [
      { key: "phase66-asvine-p36-market", title: "P36 的当代商品页范围", eventType: "model_released", startDate: "2026", circa: true, description: "当代零售 SKU 可见 P36 的钛、透明与活塞组合；这不倒推品牌创立或型号首发年份。", sourceKey: SOURCES.p36.key },
      { key: "phase66-asvine-p36-sample", title: "P36 样本的结构交叉核对", eventType: "community_event", startDate: "2024", circa: true, description: "独立用户样本讨论 P36 Titanium 与活塞/透明结构；样本书写感和尺寸不作为全系规格。", sourceKey: SOURCES.p36Discussion.key },
    ],
  };
  const pen: CuratedEntityPack = {
    key: "phase66-asvine-p36-v1", entityId: PHASE66_P36_ID, expectedType: "pen", expectedSlug: PHASE66_P36_SLUG, canonicalName: "Asvine P36 Titanium Piston-Filling Fountain Pen", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/asvine-p36.md", storyTitle: "Asvine P36：活塞，不是真空", primarySourceKey: SOURCES.p36.key, depthTier: "A",
    aliases: [{ alias: "Asvine P36", language: "en", sourceKey: SOURCES.p36.key }, { alias: "Asvine P36 Titanium", language: "en", sourceKey: SOURCES.p36.key }, { alias: "P36 Titanium", language: "en", sourceKey: SOURCES.p36Discussion.key }, { alias: "意斯华 P36", language: "zh", kind: "former_name", sourceKey: SOURCES.p36Discussion.key }],
    sources: [SOURCES.p36, SOURCES.p36Discussion, SOURCES.p36Svg],
    scopes: [{ key: p36Scope, scopeKey: p36Scope, productionState: "current", editionScope: "P36 主型号；笔尖 unit、线宽、颜色、材料细节、包装与市场 SKU 按具体销售页或实物核对" }],
    claims: [
      { key: "phase66-p36-identity", predicate: "model_identity", objectText: "Asvine P36 是透明 acrylic、钛配件与活塞上墨的单一型号；FPnibs 所列 pen-only Bock 250 选项只对应该销售 SKU，不代表所有 P36 的原厂笔尖配置。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.p36.key, locator: SOURCES.p36.summary, evidence: [{ key: "phase66-p36-identity-evidence", sourceKey: SOURCES.p36.key, scopeKey: p36Scope, locator: SOURCES.p36.summary }] },
      { key: "phase66-p36-boundary", predicate: "version_boundary", objectText: "P36 的活塞结构不与 V126/V200 的真空结构合并；长度、重量、笔尖外形、出水和改装只在已注明的 2024 用户样本范围内成立。", factClass: "core", confidence: 0.98, sourceKey: SOURCES.p36Discussion.key, locator: SOURCES.p36Discussion.summary, evidence: [{ key: "phase66-p36-boundary-evidence", sourceKey: SOURCES.p36Discussion.key, scopeKey: p36Scope, locator: SOURCES.p36Discussion.summary }, { key: "phase66-p36-official-boundary", sourceKey: SOURCES.p36.key, scopeKey: p36Scope, locator: SOURCES.p36.summary }] },
      { key: "phase66-p36-care", predicate: "maintenance_boundary", objectText: "先以室温清水反复吸排并自然干燥；不要用热水、酒精、强溶剂、尖锐工具或蛮力拆解活塞、笔尖与笔舌。持续渗漏、异常紧涩、吸不上墨或笔尖错位时，应保留样本信息并交由销售方或专业维修判断。", factClass: "core", confidence: 0.97, sourceKey: SOURCES.p36.key, locator: "piston-filling construction; conservative non-disassembly care boundary", evidence: [{ key: "phase66-p36-care-evidence", sourceKey: SOURCES.p36.key, scopeKey: p36Scope, locator: "piston-filling construction; conservative non-disassembly care boundary" }] },
    ],
    variants: [{ key: "phase66-p36-pen-only-bock-250", name: "FPnibs pen-only / Bock 250 选项", notes: "该选项仅属于已引证的 FPnibs 销售 SKU；不把它扩展为所有 P36 的原厂笔尖配置。", sourceKey: SOURCES.p36.key, variantKind: "market_sku", market: "retailer" }],
    spec: { brandEntityId: brandId, values: { series_name: "Asvine P36 Titanium Piston-Filling Fountain Pen", release_year: "当代零售 SKU 可见；首发年份待可追溯产品档案核实", origin_country: "Asvine 当代市场产品线；制造方、工厂、批次与销售地区须以可追溯实物/目录核对", nib: "FPnibs pen-only SKU 可选 Bock 250 nib unit；其他 P36 的原厂笔尖、线宽和兼容性按具体版本核对", fill_system: "活塞上墨；不使用 V126/V200 的真空上墨或止墨阀说明", material: "透明 acrylic 笔身与钛配件；具体表面、颜色、笔尖和部件按 SKU", dimensions: "2024 社区样本约 14.5 cm 闭帽；不作为全系固定长度", weight: "2024 社区样本满墨约 32 g；不作为全系固定重量", status: "当代零售 SKU 可见；版本、笔尖、颜色、包装和库存按具体销售页" }, evidence: [
      evidence("brand_entity_id", "phase66-p36-brand", SOURCES.p36.key, p36Scope, "retailer model/brand context; maker topology separately corrected"), evidence("series_name", "phase66-p36-series", SOURCES.p36.key, p36Scope, "retailer P36 product title"), evidence("release_year", "phase66-p36-release", SOURCES.p36.key, p36Scope, "current retailer availability, not assumed launch year"), evidence("origin_country", "phase66-p36-origin", SOURCES.p36.key, p36Scope, "contemporary market product context; no unsupported factory claim"), evidence("nib", "phase66-p36-nib", SOURCES.p36.key, p36Scope, "pen-only Bock 250 option boundary"), evidence("fill_system", "phase66-p36-fill", SOURCES.p36.key, p36Scope, "piston filling product field"), evidence("material", "phase66-p36-material", SOURCES.p36.key, p36Scope, "titanium and clear product field"), evidence("dimensions", "phase66-p36-dimensions", SOURCES.p36Discussion.key, p36Scope, "2024 individual sample length only"), evidence("weight", "phase66-p36-weight", SOURCES.p36Discussion.key, p36Scope, "2024 individual filled sample weight only"), evidence("status", "phase66-p36-status", SOURCES.p36.key, p36Scope, "current retailer product page")
    ] },
    media: media("phase66-asvine-p36-media", "Asvine P36 身份与结构事实图（非产品照片）", SOURCES.p36Svg),
    timeline: [{ key: "phase66-p36-current", title: "P36 的当代商品与样本边界", eventType: "model_released", startDate: "2024", circa: true, description: "2024 用户样本和当代商品页共同支持 P36 的活塞/透明/钛组合；不将观察日期误写为首发年份。", sourceKey: SOURCES.p36Discussion.key }],
  };
  return [brand, pen];
}
