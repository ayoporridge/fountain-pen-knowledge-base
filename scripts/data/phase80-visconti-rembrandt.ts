import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

export const PHASE80_VISCONTI_BRAND_FALLBACK_ID = "phase80-brand-visconti";
export const PHASE80_REMBRANDT_ORIGINAL_FALLBACK_ID = "phase80-pen-visconti-rembrandt-original";
export const PHASE80_REMBRANDT_S_FALLBACK_ID = "phase80-pen-visconti-rembrandt-s";
export const PHASE80_REMBRANDT_ORIGINAL_SLUG = "visconti-rembrandt-original-2009";
export const PHASE80_REMBRANDT_S_SLUG = "visconti-rembrandt-s-2022";

const RETRIEVED = "2026-07-20";

function source(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator">): CuratedSource {
  return {
    ...input,
    retrievedAt: RETRIEVED,
    allowedUse: input.sourceType === "user_submission" ? "store_full" : "summary_only",
    archiveUrl: input.url,
    archiveLocator: input.url.startsWith("/")
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;to-scale=false;colour-proof=false`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function svg(key: string, title: string, url: string): CuratedSource {
  return source({
    key,
    registryKey: "fountain-pen-graph-editorial-phase80",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase80",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片。",
  });
}

const SOURCES = {
  history: source({
    key: "phase80-visconti-history",
    registryKey: "visconti-official-phase80",
    registryName: "Visconti",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "visconti-official",
    title: "Visconti History",
    url: "https://www.visconti.it/en/history/",
    homepageUrl: "https://www.visconti.it/en/",
    author: "Visconti",
    summary: "Visconti 官方历史以 1988 年为现代品牌故事起点；它只支持品牌时间锚点，不替具体 Rembrandt SKU 背书。",
  }),
  collection: source({
    key: "phase80-visconti-rembrandt-collection",
    registryKey: "visconti-official-phase80",
    registryName: "Visconti",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "visconti-official",
    title: "Rembrandt Collection",
    url: "https://www.visconti.it/en/collezione-rembrandt.html",
    homepageUrl: "https://www.visconti.it/en/",
    author: "Visconti",
    summary: "官方系列页将 Rembrandt 的视觉灵感指向明暗对照，并把 fountain pen、rollerball 与 ballpoint 同列；本内容只讨论 fountain pen。",
  }),
  catalog2024: source({
    key: "phase80-visconti-catalog-2024-rembrandt",
    registryKey: "visconti-catalog-phase80",
    registryName: "Visconti 2024 Collection Catalogue",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "visconti-catalog",
    title: "Visconti 2024 Collection Catalogue, pp. 27–28",
    url: "https://exhibitorsearch.messefrankfurt.com/images/original/document_downloads/10000001202601/0010783380/1736257297290_3850547318.pdf",
    homepageUrl: "https://www.visconti.it/en/",
    author: "Visconti",
    summary: "目录把原始 Rembrandt 标作 2009、Regular Edition，并给出 acrylic resin + brass、palladium、磁吸帽、converter/cartridge、A66/A10 steel nib 与 regular 尺寸重量。",
  }),
  catalog2023: source({
    key: "phase80-visconti-catalog-2023-rembrandt-s",
    registryKey: "visconti-catalog-archive-phase80",
    registryName: "Visconti 2023 Collection Catalogue archive",
    sourceType: "retailer",
    tier: "contemporary_archive",
    independenceGroup: "manuscript-pen-catalogue-archive",
    title: "Visconti 2023 Collection Catalogue archive",
    url: "https://manuscriptpen.com/pub/media/amasty/amfile/attach/A83XRcDGiENCven8yMCNDG73a2CwYgC8.pdf",
    homepageUrl: "https://manuscriptpen.com/",
    author: "Manuscript Pen",
    summary: "经销商保存的 2023 目录记录 Rembrandt-S 的 2022 年、acrylic resin + brass、ruthenium 处理及其与原始款不同的尺寸重量；这是存档证据，不冒充当前官网货页。",
  }),
  originalRetail: source({
    key: "phase80-penchalet-rembrandt-original",
    registryKey: "penchalet-phase80",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "penchalet-retailer",
    title: "Visconti Rembrandt Fountain Pen",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/visconti_rembrandt_fountain_pen.html",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    summary: "专业零售资料交叉记录原始 Rembrandt 的磁吸、钢尖、插帽长度及 cartridge/converter；其测量与 2024 目录不同，页面中保留来源边界。",
  }),
  sRetail: source({
    key: "phase80-penchalet-rembrandt-s",
    registryKey: "penchalet-phase80",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "penchalet-retailer",
    title: "Visconti Rembrandt-S Fountain Pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/visconti_rembrandt_s_fountain_pens.html",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    summary: "专业零售资料将 Rembrandt-S 记为 2022 年 9 月推出，强调较大的镀钌钢尖、不同的饰件与尺寸，并把墨囊／转换器称作 standard international；后者仅作零售商口径。",
  }),
  review: source({
    key: "phase80-pen-addict-rembrandt-silver-shadow",
    registryKey: "pen-addict-phase80",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-addict",
    title: "Visconti Rembrandt Silver Shadow Fountain Pen: A Review",
    url: "https://penaddict.squarespace.com/blog/2017/9/8/visconti-rembrandt-silver-shadow-fountain-pen-a-review",
    homepageUrl: "https://penaddict.squarespace.com/",
    author: "The Pen Addict",
    summary: "2017 年实物评测提供 Silver Shadow 原始款样本的书写与帽顶个案；只能用作验笔提示，不能外推到所有 Rembrandt 或 Rembrandt-S。",
  }),
  brandSvg: svg("phase80-visconti-brand-svg", "Visconti Rembrandt 品牌与家族边界事实图", "/images/library/site-original/visconti-rembrandt/visconti-brand-rembrandt-map.svg"),
  originalSvg: svg("phase80-visconti-rembrandt-original-svg", "Visconti Rembrandt 原始款事实图", "/images/library/site-original/visconti-rembrandt/rembrandt-original-2009.svg"),
  sSvg: svg("phase80-visconti-rembrandt-s-svg", "Visconti Rembrandt-S 事实图", "/images/library/site-original/visconti-rembrandt/rembrandt-s-2022.svg"),
} satisfies Record<string, CuratedSource>;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function media(key: string, title: string, sourceItem: CuratedSource) {
  return [{
    key, title, sourceKey: sourceItem.key, localPath: sourceItem.url,
    author: "Fountain Pen Graph editorial", license: "site-original",
    attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、库存、具体笔尖、材料或版本。",
    sourceUrl: sourceItem.url, usageStatus: "primary" as const,
  }];
}

export function phase80ViscontiRembrandtPacks(brandId: string, originalId: string, sId: string): CuratedEntityPack[] {
  const brandScope = "phase80-visconti-brand-rembrandt-navigation";
  const originalScope = "phase80-rembrandt-original-2009-regular";
  const sScope = "phase80-rembrandt-s-2022-regular";
  return [
    {
      key: "phase80-visconti-brand-rembrandt-v1", entityId: brandId, expectedType: "brand", expectedSlug: "visconti", canonicalName: "维斯康蒂 Visconti",
      publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/visconti-brand-rembrandt-phase80.md", storyTitle: "Visconti：Rembrandt 的两个代际要分开读", primarySourceKey: SOURCES.history.key, depthTier: "A",
      aliases: [{ alias: "Visconti", language: "en", sourceKey: SOURCES.history.key }, { alias: "维斯康蒂", language: "zh", sourceKey: SOURCES.history.key }],
      sources: [SOURCES.history, SOURCES.collection, SOURCES.catalog2024, SOURCES.catalog2023, SOURCES.originalRetail, SOURCES.sRetail, SOURCES.review, SOURCES.brandSvg],
      scopes: [{ key: brandScope, scopeKey: brandScope, productionState: "current", editionScope: "品牌入口只做可核查型号导航；Rembrandt 原始款与 Rembrandt-S 是独立页面，Van Gogh、Mirage、Homo Sapiens 不被并入。" }],
      claims: [
        { key: "phase80-visconti-brand-origin", predicate: "brand_identity", objectText: "Visconti 官方历史以 1988 年作为现代品牌故事的起点。本页不把这个时间锚点误写为每个型号的首发年，也不以品牌气质填补未核实的生产史。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.history.key, locator: SOURCES.history.summary, evidence: [{ key: "phase80-visconti-origin-evidence", sourceKey: SOURCES.history.key, scopeKey: brandScope, locator: SOURCES.history.summary }] },
        { key: "phase80-visconti-rembrandt-navigation", predicate: "brand_model_navigation", objectText: "Rembrandt 原始款与 2022 Rembrandt-S 各有独立尺寸、金属处理和笔尖记录。Van Gogh、Mirage 与 Homo Sapiens 是相邻但独立产品线，页面之间可比较，不共享规格或图像。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.catalog2024.key, locator: SOURCES.catalog2024.summary, evidence: [{ key: "phase80-visconti-rembrandt-original-nav", sourceKey: SOURCES.catalog2024.key, scopeKey: brandScope, locator: SOURCES.catalog2024.summary }, { key: "phase80-visconti-rembrandt-s-nav", sourceKey: SOURCES.catalog2023.key, scopeKey: brandScope, locator: SOURCES.catalog2023.summary }, { key: "phase80-visconti-rembrandt-collection-nav", sourceKey: SOURCES.collection.key, scopeKey: brandScope, locator: SOURCES.collection.summary }, { key: "phase80-visconti-rembrandt-original-independent-review", sourceKey: SOURCES.review.key, scopeKey: brandScope, locator: "独立评测对原始 Rembrandt Silver Shadow 样笔的观察；不替代 S 的规格或版本判断。" }] },
      ],
      media: media("phase80-visconti-brand-rembrandt-media", "Visconti Rembrandt 导航事实图（非产品照片）", SOURCES.brandSvg),
      timeline: [
        { key: "phase80-visconti-1988", title: "Visconti 的现代品牌时间锚点", eventType: "brand_founded", startDate: "1988", circa: false, description: "官方历史以 1988 年作为现代品牌故事的起点；不替代具体型号的年代证据。", sourceKey: SOURCES.history.key },
        { key: "phase80-rembrandt-original-2009", title: "Rembrandt 原始款进入目录", eventType: "model_released", startDate: "2009", circa: false, description: "2024 目录把原始 Rembrandt 标为 2009 年的 Regular Edition。", sourceKey: SOURCES.catalog2024.key },
        { key: "phase80-rembrandt-s-2022", title: "Rembrandt-S 的改款目录记录", eventType: "design_milestone", startDate: "2022", circa: false, description: "2023 目录存档将 Rembrandt-S 记录为 2022 年的不同常规改款。", sourceKey: SOURCES.catalog2023.key },
      ],
    },
    {
      key: "phase80-visconti-rembrandt-original-v1", entityId: originalId, expectedType: "pen", expectedSlug: PHASE80_REMBRANDT_ORIGINAL_SLUG, canonicalName: "维斯康蒂 Visconti Rembrandt（原始款，2009）",
      publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/visconti-rembrandt-original-2009-phase80.md", storyTitle: "Visconti Rembrandt 原始款：2009 目录版本，先看 A66／A10 与钯色件", primarySourceKey: SOURCES.catalog2024.key, depthTier: "A",
      aliases: [{ alias: "Visconti Rembrandt", language: "en", sourceKey: SOURCES.catalog2024.key }, { alias: "Visconti Rembrandt original", language: "en", sourceKey: SOURCES.catalog2024.key }, { alias: "维斯康蒂 Rembrandt 伦勃朗", language: "zh", sourceKey: SOURCES.collection.key }],
      sources: [SOURCES.collection, SOURCES.catalog2024, SOURCES.originalRetail, SOURCES.review, SOURCES.originalSvg],
      scopes: [{ key: originalScope, scopeKey: originalScope, productionState: "historical", validFrom: "2009", materialScope: "acrylic resin + brass; palladium trim", nibScope: "A66 small steel nib or A10 large steel nib by SKU/year", editionScope: "2009 original regular fountain pen only; excludes Rembrandt-S, rollerball, ballpoint and unverified special editions." }],
      claims: [
        { key: "phase80-rembrandt-original-identity", predicate: "model_identity", objectText: "这里的 Rembrandt 是官方 2024 目录标作 2009 的原始常规钢笔：acrylic resin 加 brass、palladium 色金属件、磁吸帽与 converter/cartridge。它不是 2022 的 Rembrandt-S，也不是系列中的滚珠笔或圆珠笔。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.catalog2024.key, locator: SOURCES.catalog2024.summary, evidence: [{ key: "phase80-rembrandt-original-catalog", sourceKey: SOURCES.catalog2024.key, scopeKey: originalScope, locator: SOURCES.catalog2024.summary }, { key: "phase80-rembrandt-original-collection", sourceKey: SOURCES.collection.key, scopeKey: originalScope, locator: SOURCES.collection.summary }, { key: "phase80-rembrandt-original-retail", sourceKey: SOURCES.originalRetail.key, scopeKey: originalScope, locator: SOURCES.originalRetail.summary }] },
        { key: "phase80-rembrandt-original-nib-boundary", predicate: "version_boundary", objectText: "目录同时记录 A66 小钢尖和 A10 大钢尖；笔尖尺寸不能由一张商品图或“Rembrandt”这个名称推断。二手或旧库存应以 SKU、笔尖面、销售年和实拍为准，不把 S 的大号镀钌尖倒灌进原始款。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.catalog2024.key, locator: SOURCES.catalog2024.summary, evidence: [{ key: "phase80-rembrandt-original-a66-a10", sourceKey: SOURCES.catalog2024.key, scopeKey: originalScope, locator: SOURCES.catalog2024.summary }, { key: "phase80-rembrandt-original-retail-boundary", sourceKey: SOURCES.originalRetail.key, scopeKey: originalScope, locator: SOURCES.originalRetail.summary }] },
        { key: "phase80-rembrandt-original-care", predicate: "maintenance_boundary", objectText: "这是可插拔 converter/cartridge 的笔，不是活塞或 Power Filler。日常换色以清水正常冲洗并自然晾干为限；帽吸力、笔尖错位、供墨异常或松动应优先咨询卖家或售后，不把评测里的个案拆解变成通用保养步骤。", factClass: "editorial", confidence: 0.97, sourceKey: SOURCES.originalRetail.key, locator: SOURCES.originalRetail.summary, evidence: [{ key: "phase80-rembrandt-original-fill-care", sourceKey: SOURCES.originalRetail.key, scopeKey: originalScope, locator: SOURCES.originalRetail.summary }, { key: "phase80-rembrandt-original-review-care", sourceKey: SOURCES.review.key, scopeKey: originalScope, locator: SOURCES.review.summary }] },
      ],
      variants: [{ key: "phase80-rembrandt-original-a66", name: "A66 small steel nib record", releaseYear: "2009 起，按 SKU", notes: "2024 目录记录的小钢尖选项；不能代替所有年份。", sourceKey: SOURCES.catalog2024.key, variantKind: "nib" }, { key: "phase80-rembrandt-original-a10", name: "A10 large steel nib record", releaseYear: "2009 起，按 SKU", notes: "2024 目录记录的大钢尖选项；不能用 Rembrandt-S 的镀钌尖图片替代。", sourceKey: SOURCES.catalog2024.key, variantKind: "nib" }],
      spec: { brandEntityId: brandId, values: { series_name: "Visconti Rembrandt 原始款（2009 Regular Edition）", release_year: "2009（2024 官方目录的 original/regular 记录）", origin_country: "意大利品牌产品线；具体制造信息按 SKU 与包装核对", nib: "目录记录 A66 small steel nib 或 A10 large steel nib；按 SKU、销售年和笔尖面核验", fill_system: "converter/cartridge；不是 Power Filler 或内置活塞", material: "acrylic resin + brass；palladium 处理金属件（2024 regular catalogue）", dimensions: "2024 regular catalogue：合盖 139.5 mm × 13.5 mm、36.5 g；未盖帽 123.4 mm × 12.5 mm、21.8 g", status: "原始 2009 常规版本；不同库存、特别色和零售测量不自动归入同一规格" }, evidence: [evidence("brand_entity_id", "phase80-original-brand", SOURCES.catalog2024.key, originalScope, "Visconti Rembrandt official catalogue identity"), evidence("series_name", "phase80-original-name", SOURCES.catalog2024.key, originalScope, "2009 Rembrandt regular entry"), evidence("release_year", "phase80-original-release", SOURCES.catalog2024.key, originalScope, "2009 release-year field"), evidence("origin_country", "phase80-original-origin", SOURCES.collection.key, originalScope, "Visconti official collection context; no factory claim"), evidence("nib", "phase80-original-nib", SOURCES.catalog2024.key, originalScope, "A66/A10 steel-nib fields"), evidence("fill_system", "phase80-original-fill", SOURCES.catalog2024.key, originalScope, "converter/cartridge field"), evidence("material", "phase80-original-material", SOURCES.catalog2024.key, originalScope, "acrylic resin + brass and palladium fields"), evidence("dimensions", "phase80-original-dimensions", SOURCES.catalog2024.key, originalScope, "regular closed/uncapped dimensions and weight"), evidence("status", "phase80-original-status", SOURCES.originalRetail.key, originalScope, "retailer cross-check with different measurements retained as scope boundary")] },
      media: media("phase80-rembrandt-original-media", "Visconti Rembrandt 原始款事实图（非产品照片）", SOURCES.originalSvg),
      timeline: [{ key: "phase80-rembrandt-original-release-event", title: "Rembrandt 原始款的目录年份", eventType: "model_released", startDate: "2009", circa: false, description: "官方 2024 目录将原始 Rembrandt 标作 2009 年的 Regular Edition。", sourceKey: SOURCES.catalog2024.key }],
    },
    {
      key: "phase80-visconti-rembrandt-s-v1", entityId: sId, expectedType: "pen", expectedSlug: PHASE80_REMBRANDT_S_SLUG, canonicalName: "维斯康蒂 Visconti Rembrandt-S（2022）",
      publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/visconti-rembrandt-s-2022-phase80.md", storyTitle: "Visconti Rembrandt-S：2022 改款，不能拿原始 Rembrandt 的规格替代", primarySourceKey: SOURCES.catalog2023.key, depthTier: "A",
      aliases: [{ alias: "Visconti Rembrandt-S", language: "en", sourceKey: SOURCES.catalog2023.key }, { alias: "Visconti Rembrandt S", language: "en", sourceKey: SOURCES.sRetail.key }, { alias: "维斯康蒂 Rembrandt-S", language: "zh", sourceKey: SOURCES.catalog2023.key }],
      sources: [SOURCES.collection, SOURCES.catalog2023, SOURCES.sRetail, SOURCES.catalog2024, SOURCES.sSvg],
      scopes: [{ key: sScope, scopeKey: sScope, productionState: "historical", validFrom: "2022", materialScope: "acrylic resin + brass; ruthenium trim", nibScope: "larger ruthenium-plated steel nib by 2022 retail/catlogue context", editionScope: "2022 Rembrandt-S fountain pen only; excludes 2009 original, rollerball, ballpoint and unsupported Eco name." }],
      claims: [
        { key: "phase80-rembrandt-s-identity", predicate: "model_identity", objectText: "Rembrandt-S 是 2022 改款，不是原始 Rembrandt 的别名：目录存档记为 acrylic resin + brass、ruthenium 处理，零售资料也以更大的镀钌钢尖和不同外观描述它。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.catalog2023.key, locator: SOURCES.catalog2023.summary, evidence: [{ key: "phase80-rembrandt-s-catalog", sourceKey: SOURCES.catalog2023.key, scopeKey: sScope, locator: SOURCES.catalog2023.summary }, { key: "phase80-rembrandt-s-retail", sourceKey: SOURCES.sRetail.key, scopeKey: sScope, locator: SOURCES.sRetail.summary }] },
        { key: "phase80-rembrandt-s-boundary", predicate: "version_boundary", objectText: "2022 S 的合盖 139.8 mm × 15.4 mm、31.3 g，与原始款 139.5 mm × 13.5 mm、36.5 g 不同；这种尺寸、重量、饰件和笔尖差异足以要求两个独立型号页。Van Gogh、Mirage 与 Homo Sapiens 也各有独立结构和年代，不能借图、借规格或重定向。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.catalog2023.key, locator: SOURCES.catalog2023.summary, evidence: [{ key: "phase80-rembrandt-s-dimensions", sourceKey: SOURCES.catalog2023.key, scopeKey: sScope, locator: SOURCES.catalog2023.summary }, { key: "phase80-rembrandt-original-contrast", sourceKey: SOURCES.catalog2024.key, scopeKey: sScope, locator: SOURCES.catalog2024.summary }, { key: "phase80-rembrandt-s-secondary", sourceKey: SOURCES.sRetail.key, scopeKey: sScope, locator: SOURCES.sRetail.summary }] },
        { key: "phase80-rembrandt-s-care", predicate: "maintenance_boundary", objectText: "S 仍是 cartridge/converter 路线。日常清洗只做可逆的清水吸排和自然晾干；对磁吸帽、较大钢尖、供墨或饰件的异常，不建议自行拉尖、拔舌或拆结构，应保留实拍和 SKU 后联络卖家或售后。", factClass: "editorial", confidence: 0.97, sourceKey: SOURCES.sRetail.key, locator: SOURCES.sRetail.summary, evidence: [{ key: "phase80-rembrandt-s-fill-care", sourceKey: SOURCES.sRetail.key, scopeKey: sScope, locator: SOURCES.sRetail.summary }] },
      ],
      variants: [{ key: "phase80-rembrandt-s-black", name: "2022 initial Black SKU", releaseYear: "2022", notes: "零售资料所列初始色之一；不以颜色替代代际判断。", sourceKey: SOURCES.sRetail.key, variantKind: "color" }, { key: "phase80-rembrandt-s-lavender", name: "2023 Lavender retail record", releaseYear: "2023", notes: "零售资料提到的后续颜色记录；以具体 SKU 与市场为准。", sourceKey: SOURCES.sRetail.key, variantKind: "color" }],
      spec: { brandEntityId: brandId, values: { series_name: "Visconti Rembrandt-S（2022）", release_year: "2022（2023 目录存档；零售资料记录 2022 年 9 月上市）", origin_country: "意大利品牌产品线；具体制造信息按 SKU 与包装核对", nib: "较大的镀钌钢尖（2022 改款资料）；具体字幅和尖面按 SKU/实拍核验", fill_system: "converter/cartridge；零售商称 standard international，购买前按随笔 converter/SKU 再确认", material: "acrylic resin + brass；ruthenium 处理金属件（2023 目录存档）", dimensions: "2023 目录存档：合盖 139.8 mm × 15.4 mm、31.3 g；未盖帽 125 mm × 11.5 mm、18.1 g", status: "2022 的独立 Rembrandt-S 改款；不合并为 2009 原始款的色变或后继别名" }, evidence: [evidence("brand_entity_id", "phase80-s-brand", SOURCES.catalog2023.key, sScope, "Visconti Rembrandt-S catalogue identity"), evidence("series_name", "phase80-s-name", SOURCES.catalog2023.key, sScope, "Rembrandt-S entry"), evidence("release_year", "phase80-s-release", SOURCES.catalog2023.key, sScope, "2022 release-year field"), evidence("origin_country", "phase80-s-origin", SOURCES.collection.key, sScope, "Visconti collection context; no factory claim"), evidence("nib", "phase80-s-nib", SOURCES.sRetail.key, sScope, "larger ruthenium-plated steel-nib retailer field"), evidence("fill_system", "phase80-s-fill", SOURCES.sRetail.key, sScope, "cartridge/converter retailer field"), evidence("material", "phase80-s-material", SOURCES.catalog2023.key, sScope, "acrylic resin + brass and ruthenium fields"), evidence("dimensions", "phase80-s-dimensions", SOURCES.catalog2023.key, sScope, "closed/uncapped dimensions and weights"), evidence("status", "phase80-s-status", SOURCES.sRetail.key, sScope, "retailer launch/cross-check record")] },
      media: media("phase80-rembrandt-s-media", "Visconti Rembrandt-S 事实图（非产品照片）", SOURCES.sSvg),
      timeline: [{ key: "phase80-rembrandt-s-release-event", title: "Rembrandt-S 的目录年份", eventType: "model_released", startDate: "2022", circa: false, description: "2023 目录存档把 Rembrandt-S 列为 2022 年的改款记录。", sourceKey: SOURCES.catalog2023.key }],
    },
  ];
}
