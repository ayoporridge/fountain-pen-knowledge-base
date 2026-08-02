import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-02";
export const PHASE350_BEXLEY_BRAND_ID = "phase350-bexley-brand";
export const PHASE350_BEXLEY_ORIGINAL_ID = "phase350-bexley-original";
export const PHASE350_BEXLEY_ORIGINAL_SLUG = "bexley-original";
const BRAND_SCOPE = "Bexley historical American fountain-pen revival brand navigation and model boundaries";
const ORIGINAL_SCOPE = "Bexley Original circa-1993 historical button-filler route, early nib/feed clues, repair and provenance boundaries";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.independenceGroup,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase350",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase350",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.96 : 0.92,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }],
  };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const fpnCompany = web({
  key: "bexley-fpn-company",
  title: "Fountain Pen Network：Bexley Pen Company",
  url: "https://www.fountainpennetwork.com/forum/topic/27521-bexley-pen-company/",
  registryKey: "fountain-pen-network-bexley-company-phase350",
  registryName: "Fountain Pen Network participants",
  sourceType: "forum",
  tier: "community",
  independenceGroup: "fountain-pen-network-bexley-company-phase350",
  summary: "收藏者型号年表列出 Original 1993、Deluxe/Giant 1994、Cable Twist 1995、Equipoise 1996 和 1998 系列，并区分早期 Minka 与后期 Bexley 尖。",
  locator: "Bexley model chronology and early nib notes",
});

const penagogy = web({
  key: "bexley-penagogy",
  title: "Penagogy：Bexley Pens",
  url: "https://penagogy.wordpress.com/2007/12/26/bexley-pens/",
  registryKey: "penagogy-bexley-history-phase350",
  registryName: "Penagogy",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "penagogy-bexley-history-phase350",
  summary: "品牌回顾把 Bexley 放在 1990 年代钢笔爱好者复兴语境，并以 Howard Levy、传统材料和颜色说明其历史方向。",
  locator: "Bexley history and Howard Levy context",
});

const peyton = web({
  key: "bexley-peyton",
  title: "Peyton Street Pens：Bexley Original",
  url: "https://www.peytonstreetpens.com/bexley-original-limited-edition-fountain-pen-053-hard-to-find-1st-bexley-grey-pearl-button-filler-14k-medium-nib-excellent-restored.html",
  registryKey: "peyton-street-bexley-original-phase350",
  registryName: "Peyton Street Pens",
  sourceType: "retailer",
  tier: "primary",
  independenceGroup: "peyton-street-bexley-original-phase350",
  summary: "专业修复商的 Grey Pearl 单支页面标注 Bexley USA—1993、5-1/2 英寸、button filler、14K medium 尖和 restored 状态。",
  locator: "title, dimensions, filling system, nib and restored condition",
});

const forbes = web({
  key: "bexley-forbes",
  title: "Forbes：Bexley Pens, American Made",
  url: "https://www.forbes.com/sites/nancyolson/2016/11/26/bexley-pens-american-made/",
  registryKey: "forbes-bexley-american-made-phase350",
  registryName: "Forbes",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "forbes-bexley-american-made-phase350",
  summary: "2016 年报道把 Bexley 与 Howard Levy、Columbus, Ohio 和 Golden Age 复兴语境联系起来；不提供当前目录。",
  locator: "American-made history and Columbus, Ohio context",
});

const penchalet = web({
  key: "bexley-penchalet",
  title: "Pen Chalet：Bexley Pens",
  url: "https://www.penchalet.com/bexley_pens/",
  registryKey: "pen-chalet-bexley-brand-phase350",
  registryName: "Pen Chalet",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "pen-chalet-bexley-brand-phase350",
  summary: "零售品牌页以 1990 年代 vintage pen enthusiasts 和传统美式设计交叉介绍 Bexley。",
  locator: "brand description and 1930s American design wording",
});

const penmarket = web({
  key: "bexley-penmarket",
  title: "The Pen Market：Bexley pre-owned pens",
  url: "https://www.thepenmarket.com/product/pre-owned-pens-bexley-226/",
  registryKey: "the-pen-market-bexley-phase350",
  registryName: "The Pen Market",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "the-pen-market-bexley-phase350",
  summary: "二手商页面将公司起点写作 1993，并以复古供墨与设计取向描述存世 Bexley；不等于当前在产证明。",
  locator: "company history and pre-owned listing boundary",
});

const fpnCollection = web({
  key: "bexley-fpn-collection",
  title: "Fountain Pen Network：A collection of Bexley pens",
  url: "https://www.fountainpennetwork.com/forum/topic/310355-a-collection-of-bexley-pens/?comment=3776260&do=findComment",
  registryKey: "fountain-pen-network-bexley-collection-phase350",
  registryName: "Fountain Pen Network collector",
  sourceType: "forum",
  tier: "community",
  independenceGroup: "fountain-pen-network-bexley-collection-phase350",
  summary: "收藏者样本把 Original 视为 1993 第一款，记录无环平顶、Duofold-inspired、14K Minka、实心 ebonite feed/section 与颜色。",
  locator: "Original first-model, silhouette, nib, feed and colour sample notes",
});

const svg = diagram(
  "bexley-original-svg",
  "Bexley Original 1993 structure and historical clues factual diagram",
  "/images/library/site-original/phase350/bexley/original.svg",
);

const brand: CuratedEntityPack = {
  key: "phase350-bexley-brand-v1",
  entityId: PHASE350_BEXLEY_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "bexley",
  canonicalName: "Bexley 贝克斯利",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/quick/260802-bexley-original/brand.md",
  storyTitle: "Bexley：把 1990 年代的美国钢笔复兴留在一支笔里",
  primarySourceKey: penagogy.key,
  depthTier: "A",
  aliases: [
    { alias: "Bexley Pens", language: "en", sourceKey: penagogy.key },
    { alias: "Bexley pen company", language: "en", sourceKey: fpnCompany.key },
    { alias: "Bexley 贝克斯利钢笔", language: "zh", sourceKey: forbes.key },
  ],
  sources: [fpnCompany, penagogy, peyton, forbes, penchalet, penmarket, fpnCollection, svg],
  scopes: [{ key: BRAND_SCOPE, scopeKey: BRAND_SCOPE, productionState: "historical", editionScope: "Bexley historical navigation; Original, Deluxe, Giant, Cable Twist, Equipoise, anniversary and Ebonite routes remain distinct; current catalogue not verified." }],
  claims: [
    claim("bexley-history", "brand_history", "Penagogy 将 Bexley 放在 1990 年代钢笔爱好者复兴语境，并提到 Howard Levy；Forbes 以 Columbus, Ohio 报道其美国制造意图。", penagogy.key, BRAND_SCOPE, "1990s revival and Howard Levy; cross-source Ohio context"),
    claim("bexley-design", "design_language", "零售和历史回顾都把 Bexley 描述为传统美式、Golden Age／1930s-inspired 的路线；这是设计语境，不是 Parker 授权声明。", penchalet.key, BRAND_SCOPE, "1930s American design wording"),
    claim("bexley-original-nav", "brand_model_navigation", "Original 是约 1993 的第一款入口；Deluxe、Giant、Cable Twist、Equipoise、5th Anniversary 和 Ebonite Collection 是相邻独立路线。", fpnCompany.key, BRAND_SCOPE, "model chronology"),
    claim("bexley-american-boundary", "origin_boundary", "Bexley USA 和 Columbus, Ohio 分别来自单支零售资料与历史报道，支持美国品牌／制造意图语境，但不构成覆盖全部组件的产地表。", peyton.key, BRAND_SCOPE, "Bexley USA single-pen label; Forbes Ohio context"),
    claim("bexley-status", "availability_boundary", "当前可靠官方产品目录和稳定在产状态未核实；二手商页面只能证明历史笔存世，不把库存、价格或稀有度写成品牌固定事实。", penmarket.key, BRAND_SCOPE, "pre-owned listing boundary", "editorial"),
    claim("bexley-care", "maintenance_guidance", "历史 Bexley 要先核对具体型号、内囊、feed、尖和表面处理，再决定清洗与修复；不能用 Original 的 button filler 规则覆盖全部后续型号。", fpnCollection.key, BRAND_SCOPE, "sample-specific structure and repair boundary", "editorial"),
  ],
  variants: [{ key: "bexley-historical-routes", name: "Original / Deluxe / Giant / Cable Twist / Equipoise / Anniversary / Ebonite Collection", notes: "FPN 型号年表中的历史路线；每条路线的结构、材料、尖和年代需要独立页面核对。", sourceKey: fpnCompany.key, variantKind: "edition_group", market: "US" }],
  timeline: [
    { key: "bexley-1990s", title: "1990 年代钢笔爱好者复兴语境", eventType: "brand_founded", startDate: "1990", circa: true, description: "Penagogy 与 Forbes 将 Bexley 放入 1990 年代的传统美式钢笔复兴和 Howard Levy 语境；年份是约值，不替代公司档案。", sourceKey: penagogy.key },
    { key: "bexley-original-1993", title: "Original 作为第一款路线出现", eventType: "model_released", startDate: "1993", circa: false, description: "Peyton Street 单支资料与 FPN 型号年表都把 Bexley Original 放在 1993；后续型号按独立条目处理。", sourceKey: fpnCompany.key },
    { key: "bexley-1998", title: "后续限量与 Ebonite 路线仍见于型号年表", eventType: "design_milestone", startDate: "1998", circa: true, description: "FPN 资料列出 5th Anniversary 与 Ebonite Collection 约 1998；不据此推断当前生产状态。", sourceKey: fpnCompany.key },
  ],
  media: [{ key: "bexley-brand-svg", title: "Bexley Original 与历史导航事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

const model: CuratedEntityPack = {
  key: "phase350-bexley-original-v1",
  entityId: PHASE350_BEXLEY_ORIGINAL_ID,
  expectedType: "pen",
  expectedSlug: PHASE350_BEXLEY_ORIGINAL_SLUG,
  canonicalName: "Bexley Original",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/bexley-original-phase350.md",
  storyTitle: "Bexley Original：美国钢笔复兴早期的一支按键上墨笔",
  primarySourceKey: peyton.key,
  depthTier: "A",
  aliases: [
    { alias: "Bexley Original fountain pen", language: "en", sourceKey: peyton.key },
    { alias: "The first Bexley", language: "en", sourceKey: fpnCollection.key },
    { alias: "Bexley Original 贝克斯利初代", language: "zh", sourceKey: fpnCompany.key },
  ],
  sources: [fpnCompany, penagogy, peyton, forbes, penmarket, fpnCollection, svg],
  scopes: [{ key: ORIGINAL_SCOPE, scopeKey: ORIGINAL_SCOPE, productionState: "historical", materialScope: "Early pearl/resin colour samples and solid ebonite feed/section clues are sample-scoped; no universal material recipe.", nibScope: "Early 14K Minka clues and later Bexley-marked 14K examples remain pen-specific; Peyton Street sample is Medium.", editionScope: "Bexley Original circa 1993; exclude Deluxe, Giant, Cable Twist, Equipoise, anniversary and Ebonite routes." }],
  claims: [
    claim("original-identity", "model_identity", "Bexley Original 是约 1993 年 Bexley 的第一款历史型号入口；不能把后续 Deluxe、Giant 或 Ebonite Collection 合并进来。", fpnCompany.key, ORIGINAL_SCOPE, "Original 1993 chronology and adjacent-model separation"),
    claim("original-sample", "sample_specification", "Peyton Street 的 Grey Pearl 单支页面标注 Bexley USA—1993、5-1/2 英寸、button filler、14K medium 尖，并注明 restored；这些是单支资料。", peyton.key, ORIGINAL_SCOPE, "title and individual listing fields"),
    claim("original-silhouette", "design_language", "收藏者把 Original 描述为无环 flat-top、Parker Duofold-inspired 轮廓；这是设计比较，不是授权、复刻或零件兼容声明。", fpnCollection.key, ORIGINAL_SCOPE, "first-model silhouette and Parker comparison"),
    claim("original-nib", "nib_history", "早期样本可见 14K Minka 尖线索，部分刻字被抛光；资料还提到后期 Bexley 刻字 14K 尖，不能仅凭刻字替全批次定年。", fpnCompany.key, ORIGINAL_SCOPE, "early Minka and later Bexley nib boundary"),
    claim("original-feed", "feed_material", "收藏者资料把 Original 的 feed/section 记为实心 ebonite；二手修复状态和替换件需逐支拍照确认。", fpnCollection.key, ORIGINAL_SCOPE, "solid ebonite feed/section sample"),
    claim("original-filler", "filling_system", "Original 使用 button filler；不要在未检查内囊和 feed 的情况下强装现代 converter，也不把按钮上墨推广给其它 Bexley 路线。", peyton.key, ORIGINAL_SCOPE, "button filler field and repair boundary"),
    claim("original-colours", "variant_boundary", "Blue Pearl、Burgundy Pearl、Grey Pearl、Bronze、Lime Pearl 等颜色来自收藏者样本清单；Grey Pearl 是 Peyton Street 单支颜色，不等于官方色卡。", fpnCollection.key, ORIGINAL_SCOPE, "colour sample list and Grey Pearl listing"),
    claim("original-size-boundary", "physical_specification", "公开资料只有 Peyton Street 的 5-1/2 英寸样本标注，没有测量状态、统一闭帽／套帽长度、桶径或重量；未知字段保留。", peyton.key, ORIGINAL_SCOPE, "single-pen 5-1/2 inch label and absent table"),
    claim("original-status", "production_status", "Original 是历史型号；本次没有找到可靠当前官方目录，存世二手页面不构成在产证明。", forbes.key, ORIGINAL_SCOPE, "historical 2016 article and current-source boundary"),
    claim("original-care", "maintenance_guidance", "老式 button filler 应由维修者检查内囊、按钮、feed、尖和 ebonite，使用室温清水缓慢清洗；不以未知维修状态推断整批耐用性。", penagogy.key, ORIGINAL_SCOPE, "historical pen care and material boundary", "editorial"),
    claim("original-buying", "selection_guidance", "选购先确认 Original 身份、button filler、尖刻字、内囊修复、测量方法和来源；卖家只写 Bexley 不足以证明是第一款。", peyton.key, ORIGINAL_SCOPE, "listing identity and restored-condition boundary", "editorial"),
  ],
  variants: [
    { key: "original-colour-samples", name: "Blue Pearl / Burgundy Pearl / Grey Pearl / Bronze / Lime Pearl", notes: "收藏者记录的常见颜色样本；不替代官方色卡，Grey Pearl 另有单支零售证据。", sourceKey: fpnCollection.key, variantKind: "color", market: "US" },
    { key: "original-nib-samples", name: "14K Minka early clue / 14K Bexley-marked later example", notes: "尖刻字和磨抛状态是逐支鉴定线索，Peyton Street 样本为 Medium；不创建尖幅 SKU。", sourceKey: fpnCompany.key, variantKind: "nib", market: "US" },
    { key: "original-filling", name: "Button filler", notes: "历史 Original 的供墨身份；内囊和维修状态需在实物上确认。", sourceKey: peyton.key, variantKind: "variant", market: "US" },
  ],
  spec: {
    brandEntityId: PHASE350_BEXLEY_BRAND_ID,
    values: {
      series_name: "Original",
      release_year: "约 1993；Peyton Street 单支与 FPN 年表均指向 1993",
      origin_country: "美国语境；单支页面标注 Bexley USA，Forbes 报道提及 Columbus, Ohio 制造意图",
      nib: "早期 14K Minka 线索／后期 Bexley 刻字 14K；Peyton Street 样本为 Medium",
      fill_system: "Button filler；内囊、按钮和 feed 必须按单支维修状态检查",
      material: "珍珠色树脂／亚克力样本；收藏资料记录实心 ebonite feed/section，统一配方未公布",
      dimensions: "Peyton Street 单支标注 5-1/2 in（约 140 mm）；测量状态和全系列标准值未公布",
      weight: "公开资料未稳定发布；保留未知",
      status: "Historical；当前官方目录与在产状态未核实，二手存世页不构成在产证明",
    },
    evidence: [
      evidence("original-brand", "brand_entity_id", penagogy.key, ORIGINAL_SCOPE, "Bexley brand history"),
      evidence("original-series", "series_name", fpnCompany.key, ORIGINAL_SCOPE, "Original chronology"),
      evidence("original-year", "release_year", peyton.key, ORIGINAL_SCOPE, "1993 single-pen listing"),
      evidence("original-origin", "origin_country", peyton.key, ORIGINAL_SCOPE, "Bexley USA single-pen label"),
      evidence("original-nib-evidence", "nib", fpnCompany.key, ORIGINAL_SCOPE, "Minka and Bexley-marked 14K nib boundary"),
      evidence("original-fill-evidence", "fill_system", peyton.key, ORIGINAL_SCOPE, "button filler field"),
      evidence("original-material-evidence", "material", fpnCollection.key, ORIGINAL_SCOPE, "pearl colours and ebonite feed/section"),
      evidence("original-dimensions-evidence", "dimensions", peyton.key, ORIGINAL_SCOPE, "5-1/2 inch sample label"),
      evidence("original-weight-evidence", "weight", peyton.key, ORIGINAL_SCOPE, "no weight in individual listing"),
      evidence("original-status-evidence", "status", forbes.key, ORIGINAL_SCOPE, "historical article and absent current catalogue boundary"),
    ],
  },
  timeline: [{ key: "original-1993", title: "Bexley Original 历史样本", eventType: "model_released", startDate: "1993", circa: false, description: "Peyton Street 单支资料和 FPN 型号年表均把 Original 放在 1993；页面不推断统一批量或当前复产。", sourceKey: peyton.key }],
  media: [{ key: "original-svg", title: "Bexley Original 结构与历史线索事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase350BexleyOriginalPacks: CuratedEntityPack[] = [brand, model];
