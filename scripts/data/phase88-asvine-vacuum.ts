import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

export const PHASE88_V126_ID = "phase88-pen-asvine-v126";
export const PHASE88_V200_ID = "phase88-pen-asvine-v200";
export const PHASE88_V126_SLUG = "asvine-v126";
export const PHASE88_V200_SLUG = "asvine-v200";

const RETRIEVED = "2026-07-20";

function live(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "homepageUrl" | "archiveUrl" | "archiveLocator" | "independenceGroup">): CuratedSource {
  return {
    ...input,
    homepageUrl: input.url,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
    independenceGroup: input.registryKey,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase88",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase88",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false`,
  };
}

const SOURCES = {
  storefront: live({ key: "phase88-asvine-storefront", registryKey: "asvine-storefront-phase88", registryName: "Asvine storefront", sourceType: "official", tier: "primary", title: "Asvine Pen", url: "https://www.asvinepen.com/", summary: "当前 Asvine 产品集合页，仅作为当代 SKU 发现入口；其页面所有权未独立证实，不用来推断法人、创立年份、工厂或未经具体商品页支持的规格。" }),
  p36: live({ key: "phase88-asvine-p36-context", registryKey: "fpnibs-asvine-phase88", registryName: "FPnibs", sourceType: "retailer", tier: "contemporary_archive", title: "FPnibs: Asvine P36", url: "https://www.fpnibs.com/products/asvine-p36", summary: "P36 当代销售资料列透明 acrylic、钛配件与活塞；它只是 Asvine 产品线的对照对象，不用来证明真空型号的规格。" }),
  v126: live({ key: "phase88-asvine-v126-bottle-and-plume", registryKey: "bottle-and-plume-asvine-phase88", registryName: "Bottle and Plume", sourceType: "blog", tier: "professional_secondary", title: "Asvine V126 Fountain Pen Review", url: "https://www.bottleandplume.com/blogs/learn/asvine-v126-fountain-pen-review", summary: "独立评测将 V126 写为全尺寸真空上墨笔，带尾端 shutoff valve、钢尖和多种颜色/笔尖选项；样本手感不外推为全系质量保证。" }),
  v126Sample: live({ key: "phase88-asvine-v126-inky-imaginings", registryKey: "inky-imaginings-asvine-phase88", registryName: "Inky Imaginings", sourceType: "blog", tier: "professional_secondary", title: "Review: Asvine V126 Fountain Pen", url: "https://inkyimaginings.com/2026/06/07/review-asvine-v126-fountain-pen/", summary: "2026 使用者评测记录一支 V126 的跳墨和抽墨不完全样本；这是到手检查线索，不是批量质量结论。" }),
  v200: live({ key: "phase88-asvine-v200-retailer", registryKey: "desertcart-asvine-phase88", registryName: "Desertcart", sourceType: "retailer", tier: "contemporary_archive", title: "Asvine V200 Titanium Fountain Pen", url: "https://www.desertcart.fi/products/658361599-asvinev200-titanium-fountain-pen-vacuum-filling-matte-black-fine-point-transparent-acrylic-smooth-writing-pen-case-set", summary: "当代商品标题将 V200 标为透明 acrylic、钛部件与真空上墨；这是具体 SKU 线索，笔尖、扳手和包装不外推至所有地区版本。" }),
  v200Review: live({ key: "phase88-asvine-v200-sbrebrown", registryKey: "sbrebrown-asvine-phase88", registryName: "SBREBrown", sourceType: "blog", tier: "professional_secondary", title: "Asvine V200 Fountain Pen Review", url: "https://www.sbrebrown.com/2024/07/asvine-v200-fountain-pen-review/", summary: "独立评测于 2024 年发布，页面将 V200 标为 #6 nib、Bock Nib、Steel Nib 与 Vacuum-filler；该样笔由 Asvine 寄送，具体笔尖与书写表现仍只属于样本/对应 SKU。" }),
  v200Sample: live({ key: "phase88-asvine-v200-reddit", registryKey: "reddit-fountainpens-asvine-phase88", registryName: "r/fountainpens", sourceType: "forum", tier: "community", title: "Asvine V200 user sample discussion", url: "https://www.reddit.com/r/fountainpens/comments/1e7v5uu", summary: "2024 用户样本提到尾端钛部件带来的后重感、略滑握位与清洗后的出墨变化；均为单支体验，不当作全系规格。" }),
  brandSvg: diagram("phase88-asvine-brand-svg", "Asvine 型号路线事实图", "/images/library/site-original/asvine/asvine-brand.svg"),
  v126Svg: diagram("phase88-asvine-v126-svg", "Asvine V126 真空上墨与止墨阀事实图", "/images/library/site-original/asvine/asvine-v126.svg"),
  v200Svg: diagram("phase88-asvine-v200-svg", "Asvine V200 透明真空笔事实图", "/images/library/site-original/asvine/asvine-v200.svg"),
} satisfies Record<string, CuratedSource>;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function media(key: string, title: string, source: CuratedSource) {
  return [{ key, title, sourceKey: source.key, localPath: source.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、材料纹理、Logo、笔尖、库存、重量或具体 SKU。", sourceUrl: source.url, usageStatus: "primary" as const }];
}

/** Phase 66 creates/resolves the Asvine brand; this revision deliberately only enriches its verified public model navigation. */
export function phase88AsvineVacuumPacks(brandId: string): CuratedEntityPack[] {
  const brandScope = "phase88-asvine-navigation";
  const v126Scope = "phase88-asvine-v126-current";
  const v200Scope = "phase88-asvine-v200-current";
  return [
    {
      key: "phase88-asvine-brand-v2",
      entityId: brandId,
      expectedType: "brand",
      expectedSlug: "asvine",
      canonicalName: "Asvine",
      publicationIntent: "publish",
      publicationBlockers: [],
      markdownFile: ".planning/content-research/phase88-asvine-brand.md",
      storyTitle: "Asvine：先看上墨结构，再看相似的透明笔身",
      primarySourceKey: SOURCES.v126.key,
      depthTier: "A",
      aliases: [{ alias: "Asvine", language: "en", sourceKey: SOURCES.v126.key }],
      sources: [SOURCES.storefront, SOURCES.p36, SOURCES.v126, SOURCES.v200, SOURCES.brandSvg],
      scopes: [{ key: brandScope, scopeKey: brandScope, productionState: "current", editionScope: "只导航已核实的 P36 活塞、V126 真空/止墨阀和 V200 真空/钛部件路线；颜色、笔尖、销售套装与未经核实的厂史不自动并入。" }],
      claims: [
        { key: "phase88-asvine-model-boundary", predicate: "brand_navigation_boundary", objectText: "已核实的 P36、V126、V200 分别对应活塞、真空止墨阀、真空钛部件路线；透明外观、相似轮廓和卖家配件不证明它们可共享规格、图片或维护说明。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.v126.key, locator: SOURCES.v126.summary, evidence: [{ key: "phase88-asvine-v126-evidence", sourceKey: SOURCES.v126.key, scopeKey: brandScope, locator: SOURCES.v126.summary }, { key: "phase88-asvine-v200-evidence", sourceKey: SOURCES.v200.key, scopeKey: brandScope, locator: SOURCES.v200.summary }, { key: "phase88-asvine-p36-evidence", sourceKey: SOURCES.p36.key, scopeKey: brandScope, locator: SOURCES.p36.summary }] },
      ],
      media: media("phase88-asvine-brand-media", "Asvine 型号路线事实图（非产品照片）", SOURCES.brandSvg),
      timeline: [
        { key: "phase88-asvine-p36-context", title: "P36 的活塞路线资料边界", eventType: "design_milestone", startDate: "2026", circa: true, description: "当代 P36 商品资料可确认活塞、透明 acrylic 与钛配件组合；不将销售页观察年份写作品牌或型号首发日期。", sourceKey: SOURCES.p36.key },
        { key: "phase88-asvine-vacuum-context", title: "V126/V200 的真空路线资料边界", eventType: "design_milestone", startDate: "2026", circa: true, description: "独立评测与地区 SKU 可用于区分 V126 止墨阀和 V200 钛部件真空路线；不将其合并成一个型号。", sourceKey: SOURCES.v126.key },
      ],
    },
    {
      key: "phase88-asvine-v126-v1",
      entityId: PHASE88_V126_ID,
      expectedType: "pen",
      expectedSlug: PHASE88_V126_SLUG,
      canonicalName: "Asvine V126 Vacuum Filling Fountain Pen",
      publicationIntent: "publish",
      publicationBlockers: [],
      markdownFile: ".planning/content-research/phase88-asvine-v126.md",
      storyTitle: "Asvine V126：真空填充与止墨阀，要一起理解",
      primarySourceKey: SOURCES.v126.key,
      depthTier: "A",
      aliases: [{ alias: "Asvine V126", language: "en", sourceKey: SOURCES.v126.key }, { alias: "Asvine V126 Vacuum Filling Fountain Pen", language: "en", sourceKey: SOURCES.v126.key }],
      sources: [SOURCES.storefront, SOURCES.v126, SOURCES.v126Sample, SOURCES.v126Svg],
      scopes: [{ key: v126Scope, scopeKey: v126Scope, productionState: "current", editionScope: "V126 主型号；颜色、笔尖宽度、透明度、套装、地区 SKU 与具体密封/配件按实物或商品页核对。" }],
      claims: [
        { key: "phase88-v126-identity", predicate: "model_identity", objectText: "Asvine V126 是全尺寸真空上墨型号，带尾端止墨阀；独立评测可确认钢尖与多种颜色/笔尖选项，但不把相近尺寸的其他真空笔写作同一产品。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.v126.key, locator: SOURCES.v126.summary, evidence: [{ key: "phase88-v126-official-boundary", sourceKey: SOURCES.v126.key, scopeKey: v126Scope, locator: SOURCES.v126.summary }] },
        { key: "phase88-v126-storefront-boundary", predicate: "current_sku_source_boundary", objectText: "Asvine 当前站点只被用作 V126 等当代 SKU 的发现入口；页面所有权未独立证实，因此不据此推断法人、创立年份、工厂或未在具体产品资料中出现的规格。", factClass: "core", confidence: 0.97, sourceKey: SOURCES.storefront.key, locator: SOURCES.storefront.summary, evidence: [{ key: "phase88-v126-storefront-evidence", sourceKey: SOURCES.storefront.key, scopeKey: v126Scope, locator: SOURCES.storefront.summary }] },
        { key: "phase88-v126-sample-boundary", predicate: "quality_sample_boundary", objectText: "跳墨或抽墨不完全是已注明的一支样本体验，可用于到手检查；它不证明所有 V126 都有相同问题，也不构成对每批产品的质量判决。", factClass: "core", confidence: 0.98, sourceKey: SOURCES.v126Sample.key, locator: SOURCES.v126Sample.summary, evidence: [{ key: "phase88-v126-sample-evidence", sourceKey: SOURCES.v126Sample.key, scopeKey: v126Scope, locator: SOURCES.v126Sample.summary }] },
        { key: "phase88-v126-care", predicate: "maintenance_boundary", objectText: "以常温清水温和吸排并自然干燥；不以热水、酒精、强溶剂、尖锐工具或无资料拆解处理真空机构和尾端密封。漏气、阀门卡滞或持续不出墨时优先保留记录并咨询售后或专业维修。", factClass: "editorial", confidence: 0.97, sourceKey: SOURCES.v126.key, locator: "vacuum filling and shutoff-valve construction; conservative care boundary", evidence: [{ key: "phase88-v126-care-evidence", sourceKey: SOURCES.v126.key, scopeKey: v126Scope, locator: "vacuum filling and shutoff-valve construction; conservative care boundary" }] },
      ],
      variants: [{ key: "phase88-v126-colour-nib", name: "V126 颜色与钢尖选项", notes: "独立评测记录多种颜色与笔尖选项；具体色名、线宽、套装和地区可得性按精确 SKU。", sourceKey: SOURCES.v126.key, variantKind: "market_sku" }],
      spec: { brandEntityId: brandId, values: { series_name: "Asvine V126 Vacuum Filling Fountain Pen", release_year: "当代独立评测可见；首发年份待可追溯目录核实", origin_country: "Asvine 当代市场产品线；制造方、工厂、批次与销售地区须以可追溯实物/目录核对", nib: "钢尖；具体线宽、刻印、调校与可替换性按 SKU/实物核对", fill_system: "真空上墨，带尾端止墨阀", material: "独立评测确认树脂笔身；颜色、透明度和配件按 SKU", dimensions: "全尺寸真空笔；精确长度和直径待具体 SKU/实物核对", weight: "按具体 SKU/实物核对，不用单支评测外推", status: "当代独立评测与商品渠道可见；颜色、笔尖、套装和库存按地区 SKU" }, evidence: [evidence("brand_entity_id", "phase88-v126-brand", SOURCES.v126.key, v126Scope, "model/brand context; maker topology separately enforced"), evidence("series_name", "phase88-v126-series", SOURCES.v126.key, v126Scope, "review model title"), evidence("release_year", "phase88-v126-release", SOURCES.v126.key, v126Scope, "contemporary review presence, not claimed launch date"), evidence("origin_country", "phase88-v126-origin", SOURCES.v126.key, v126Scope, "market product context; no unsupported factory claim"), evidence("nib", "phase88-v126-nib", SOURCES.v126.key, v126Scope, "steel nib and option boundary"), evidence("fill_system", "phase88-v126-fill", SOURCES.v126.key, v126Scope, "vacuum filling and shutoff valve"), evidence("material", "phase88-v126-material", SOURCES.v126.key, v126Scope, "resin body review context"), evidence("dimensions", "phase88-v126-dimensions", SOURCES.v126.key, v126Scope, "full-size boundary only"), evidence("weight", "phase88-v126-weight", SOURCES.v126.key, v126Scope, "no model-wide fixed number claimed"), evidence("status", "phase88-v126-status", SOURCES.v126.key, v126Scope, "contemporary independent review") ] },
      media: media("phase88-asvine-v126-media", "Asvine V126 真空上墨与止墨阀事实图（非产品照片）", SOURCES.v126Svg),
      timeline: [{ key: "phase88-v126-current", title: "V126 的当代真空上墨资料范围", eventType: "model_released", startDate: "2026", circa: true, description: "当代独立评测可确认 V126 真空上墨、尾端止墨阀和钢尖；不将评测日期写作型号首发日期。", sourceKey: SOURCES.v126.key }],
    },
    {
      key: "phase88-asvine-v200-v1",
      entityId: PHASE88_V200_ID,
      expectedType: "pen",
      expectedSlug: PHASE88_V200_SLUG,
      canonicalName: "Asvine V200 Titanium Vacuum Filling Fountain Pen",
      publicationIntent: "publish",
      publicationBlockers: [],
      markdownFile: ".planning/content-research/phase88-asvine-v200.md",
      storyTitle: "Asvine V200：透明真空笔的钛部件，不等于所有人都觉得平衡",
      primarySourceKey: SOURCES.v200.key,
      depthTier: "A",
      aliases: [{ alias: "Asvine V200", language: "en", sourceKey: SOURCES.v200.key }, { alias: "Asvine V200 Titanium", language: "en", sourceKey: SOURCES.v200.key }],
      sources: [SOURCES.storefront, SOURCES.v200, SOURCES.v200Review, SOURCES.v200Sample, SOURCES.v200Svg],
      scopes: [{ key: v200Scope, scopeKey: v200Scope, productionState: "current", editionScope: "V200 主型号；笔尖、扳手、颜色、表面、套装和地区商品版本按精确 SKU，样本手感不外推。" }],
      claims: [
        { key: "phase88-v200-identity", predicate: "model_identity", objectText: "Asvine V200 的当代商品资料将透明 acrylic、钛部件与真空上墨列在同一 SKU 中；它不是 P36 活塞的升级名，也不是 V126 的金属版本。", factClass: "core", confidence: 0.98, sourceKey: SOURCES.v200.key, locator: SOURCES.v200.summary, evidence: [{ key: "phase88-v200-retailer-evidence", sourceKey: SOURCES.v200.key, scopeKey: v200Scope, locator: SOURCES.v200.summary }] },
        { key: "phase88-v200-professional-review-boundary", predicate: "independent_review_boundary", objectText: "2024 独立评测将 V200 标为真空笔，并以 #6、Bock、钢尖等标签描述受测样笔；该笔由 Asvine 寄送，所以具体笔尖和书写表现仍只属于样本或对应 SKU。", factClass: "core", confidence: 0.98, sourceKey: SOURCES.v200Review.key, locator: SOURCES.v200Review.summary, evidence: [{ key: "phase88-v200-professional-review-evidence", sourceKey: SOURCES.v200Review.key, scopeKey: v200Scope, locator: SOURCES.v200Review.summary }] },
        { key: "phase88-v200-sample-boundary", predicate: "quality_sample_boundary", objectText: "后重感、略滑握位和清洗后出墨改善都属于 2024 单支使用样本；它们适合提示试握与到手检查，不能写成每一支 V200 的固定手感或质量结论。", factClass: "core", confidence: 0.98, sourceKey: SOURCES.v200Sample.key, locator: SOURCES.v200Sample.summary, evidence: [{ key: "phase88-v200-sample-evidence", sourceKey: SOURCES.v200Sample.key, scopeKey: v200Scope, locator: SOURCES.v200Sample.summary }] },
        { key: "phase88-v200-care", predicate: "maintenance_boundary", objectText: "真空机构、透明笔杆与密封件只建议以常温清水温和清洗和自然晾干；不使用热水、酒精、强溶剂或无资料强拆。漏气、尾端不顺、裂纹或持续断墨应保留状态并咨询售后或专业维修。", factClass: "editorial", confidence: 0.97, sourceKey: SOURCES.v200.key, locator: "vacuum-filling product boundary; conservative care", evidence: [{ key: "phase88-v200-care-evidence", sourceKey: SOURCES.v200.key, scopeKey: v200Scope, locator: "vacuum-filling product boundary; conservative care" }] },
      ],
      variants: [{ key: "phase88-v200-market-sku", name: "V200 Titanium 地区 SKU 与笔尖选项", notes: "透明 acrylic、钛部件与真空上墨可由已引证商品标题确认；笔尖、扳手、套装和颜色只对具体地区 SKU 有效。", sourceKey: SOURCES.v200.key, variantKind: "market_sku", market: "retailer" }],
      spec: { brandEntityId: brandId, values: { series_name: "Asvine V200 Titanium Vacuum Filling Fountain Pen", release_year: "当代商品和 2024 使用样本可见；首发年份待可追溯目录核实", origin_country: "Asvine 当代市场产品线；制造方、工厂、批次与销售地区须以可追溯实物/目录核对", nib: "具体笔尖、线宽、刻印与可替换性按精确 SKU/实物核对", fill_system: "真空上墨", material: "透明 acrylic 笔杆与钛部件；其他材料和表面按 SKU", dimensions: "按具体 SKU/实物核对，不用相近真空型号代替", weight: "按具体 SKU/实物核对；单支后重感不等于固定重量或全系平衡", status: "当代地区商品 SKU 与 2024 使用样本可见；配置和库存按销售页" }, evidence: [evidence("brand_entity_id", "phase88-v200-brand", SOURCES.v200.key, v200Scope, "model/brand context; maker topology separately enforced"), evidence("series_name", "phase88-v200-series", SOURCES.v200.key, v200Scope, "retailer product title"), evidence("release_year", "phase88-v200-release", SOURCES.v200Sample.key, v200Scope, "2024 user sample, not claimed launch date"), evidence("origin_country", "phase88-v200-origin", SOURCES.v200.key, v200Scope, "market product context; no unsupported factory claim"), evidence("nib", "phase88-v200-nib", SOURCES.v200.key, v200Scope, "SKU-specific nib boundary"), evidence("fill_system", "phase88-v200-fill", SOURCES.v200.key, v200Scope, "retailer vacuum filling field"), evidence("material", "phase88-v200-material", SOURCES.v200.key, v200Scope, "retailer transparent acrylic and titanium field"), evidence("dimensions", "phase88-v200-dimensions", SOURCES.v200.key, v200Scope, "no model-wide fixed number claimed"), evidence("weight", "phase88-v200-weight", SOURCES.v200Sample.key, v200Scope, "single-sample balance boundary"), evidence("status", "phase88-v200-status", SOURCES.v200.key, v200Scope, "current retailer SKU") ] },
      media: media("phase88-asvine-v200-media", "Asvine V200 透明真空笔事实图（非产品照片）", SOURCES.v200Svg),
      timeline: [{ key: "phase88-v200-current", title: "V200 的当代 SKU 与样本资料范围", eventType: "model_released", startDate: "2024", circa: true, description: "地区 SKU 和 2024 使用样本共同支持透明 acrylic、钛部件与真空路线；不将观察日期写作首发日期。", sourceKey: SOURCES.v200Sample.key }],
    },
  ];
}
