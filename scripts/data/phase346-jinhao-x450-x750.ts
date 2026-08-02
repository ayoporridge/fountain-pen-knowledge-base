import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE63_JINHAO_BRAND_ID,
  phase63JinhaoPacks,
} from "./phase63-jinhao-split";

const RETRIEVED = "2026-08-02";
export const PHASE346_X450_ID = "phase346-jinhao-x450";
export const PHASE346_X450_SLUG = "jinhao-x450";
export const PHASE346_X750_ID = "phase346-jinhao-x750";
export const PHASE346_X750_SLUG = "jinhao-x750";
const X450_SCOPE = "Jinhao X450 metal body, triangular guide grip, nib and cartridge/converter sample boundary";
const X750_SCOPE = "Jinhao X750 metal snap-cap body, nib, dimensions and cartridge/converter sample boundary";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup?: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.independenceGroup ?? input.registryKey,
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
    registryKey: "fountain-pen-graph-editorial-phase346",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase346",
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

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.95,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  scopeKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const sources = {
  truphaeX450: web({
    key: "phase346-jinhao-x450-truphae",
    title: "Truphae Jinhao X450 Review",
    url: "https://www.truphaeinc.com/blogs/reviews/jinhao-x450-review",
    registryKey: "truphae-jinhao-x450-phase346",
    registryName: "Truphae",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "2020 样本写出中国制造语境、漆面金属、约 1.5 oz、不锈钢中号尖、卡扣盖、转换器、标准国际墨囊与颜色选项。",
    locator: "review sections on materials, function, ink and colors",
  }),
  inksPensX450: web({
    key: "phase346-jinhao-x450-inks-pens",
    title: "Inks and Pens Jinhao X450 Review (and fakes)",
    url: "https://www.inksandpens.com/post/jinhao-x450-review-and-fakes/",
    registryKey: "inks-pens-jinhao-x450-phase346",
    registryName: "Inks and Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "2015 实物样本记录金属／黄铜观感、未套盖与套盖重心、#6 尖与 feed 可换、颜色名称和仿品边界。",
    locator: "body material, balance, color, nib swapping and fake-identification sections",
  }),
  gentlemanX450: web({
    key: "phase346-jinhao-x450-gentleman",
    title: "The Gentleman Stationer Pen Review: Jinhao x450",
    url: "https://www.gentlemanstationer.com/blog/2014/6/9/pen-review-jinhao-x450",
    registryKey: "gentleman-stationer-jinhao-x450-phase346",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "早期深红漆面样本观察卡扣公差、半三角握位、中号尖、#6 换尖和通用转换器；作者明确只代表个人样本。",
    locator: "build, nib/performance and cartridge-converter sections",
  }),
  gouletX450: web({
    key: "phase346-jinhao-x450-goulet",
    title: "Goulet Jinhao X450 Frosted Black",
    url: "https://www.gouletpens.com/products/jinhao-x450-fountain-pen-frosted-black",
    registryKey: "goulet-jinhao-x450-phase346",
    registryName: "The Goulet Pen Company",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary: "当前 Frosted Black SKU 标注中国制造、漆面金属、卡扣盖、树脂握位、两色 #6 钢尖、转换器、标准国际墨囊、141/160 mm 和 42 g。",
    locator: "product details and technical specs",
  }),
  mainelyX450: web({
    key: "phase346-jinhao-x450-mainely",
    title: "Mainely Pens: Jinhao X450",
    url: "https://mainelypens.blogspot.com/2015/01/for-my-first-fountainpen-review-well.html",
    registryKey: "mainely-pens-jinhao-x450-phase346",
    registryName: "Mainely Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "2015 实物量测给出 124 mm 笔身、141/160 mm、42 g、三条凹槽、两色钢尖、转换器与套盖后头重样本。",
    locator: "stats, grip, nib, filling and final thoughts",
  }),
  fpnX450: web({
    key: "phase346-jinhao-x450-fpn",
    title: "Fountain Pen Network Jinhao X450 Review",
    url: "https://www.fountainpennetwork.com/forum/topic/285607-jinhao-x450-review/",
    registryKey: "fpn-jinhao-x450-phase346",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "contemporary_archive",
    summary: "玩家讨论作为 2015 年低价型号、三角握位、尺寸和 #6 尖可替换的旁证；不承担统一批次规格。",
    locator: "dated review topic and specification notes",
  }),
  truphaeX750: web({
    key: "phase346-jinhao-x750-truphae",
    title: "Truphae Jinhao X450 Review sibling note",
    url: "https://www.truphaeinc.com/blogs/reviews/jinhao-x450-review",
    registryKey: "truphae-jinhao-x750-sibling-phase346",
    registryName: "Truphae",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "Truphae 评测将 X450 与 X750 并列为同系列不同型号；此处只作为 sibling 身份边界，不把 X450 规格移给 X750。",
    locator: "comparison image and model context",
  }),
  gouletX750Review: web({
    key: "phase346-jinhao-x750-goulet-review",
    title: "Goulet Jinhao X750 Fountain Pen Review",
    url: "https://www.gouletpens.com/blogs/fountain-pen-blog/jinhao-x750-fountain-pen-review",
    registryKey: "goulet-jinhao-x750-review-phase346",
    registryName: "The Goulet Pen Company",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "2013 评测明确 X750 为全金属卡扣盖、#6 钢尖、转换器、标准国际墨囊、可套盖、可换尖，并记录单支书写优缺点。",
    locator: "quick overview, pros/cons, writing and filling sections",
  }),
  gouletX750: web({
    key: "phase346-jinhao-x750-goulet",
    title: "Goulet Jinhao X750 Silver",
    url: "https://www.gouletpens.com/products/jinhao-x750-fountain-pen-silver",
    registryKey: "goulet-jinhao-x750-phase346",
    registryName: "The Goulet Pen Company",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary: "当前银色 SKU 标注中国制造、漆面金属、树脂握位、卡扣盖、#6 钢尖、141/158 mm、36 g、标准国际墨囊和转换器容量。",
    locator: "product details and technical specs",
  }),
  jetpensX750: web({
    key: "phase346-jinhao-x750-jetpens",
    title: "JetPens Jinhao X750 Ice Flower Red",
    url: "https://www.jetpens.com/Jinhao-X750-Fountain-Pen-Broad-Nib-Ice-Flower-Red/pd/14119",
    registryKey: "jetpens-jinhao-x750-phase346",
    registryName: "JetPens",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary: "X750-2 具体 SKU 列出金属、卡扣盖、转换器、标准国际墨囊、10.5 mm 握位、14.6 mm 最大直径、141/163/125 mm。",
    locator: "product specification table",
  }),
  peninkcillinX750: web({
    key: "phase346-jinhao-x750-peninkcillin",
    title: "Peninkcillin Jinhao X750 fountain pen review",
    url: "https://peninkcillin.blogspot.com/2012/01/jinhao-x750-fountain-pen-review.html",
    registryKey: "peninkcillin-jinhao-x750-phase346",
    registryName: "Peninkcillin",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "2012 文章回顾 2011 年购入的 X750，并以多周、多种墨水和宽尖样本观察早期流通。",
    locator: "dated acquisition, broad nib and extended ink-use context",
  }),
  stationeryWikiX750: web({
    key: "phase346-jinhao-x750-stationery-wiki",
    title: "Stationery Wiki Jinhao x750",
    url: "https://stationery.wiki/Jinhao_x750",
    registryKey: "stationery-wiki-jinhao-x750-phase346",
    registryName: "Stationery Wiki",
    sourceType: "blog",
    tier: "community",
    summary: "社区维护条目摘要 X750 的 141/126 mm、36 g、#6 钢尖和卡水／转换器；作为二级索引，不覆盖零售和单支差异。",
    locator: "model infobox and revision history",
  }),
  fpnX750: web({
    key: "phase346-jinhao-x750-fpn",
    title: "Fountain Pen Network Jinhao X750",
    url: "https://www.fountainpennetwork.com/forum/topic/330659-jinhao-x750/",
    registryKey: "fpn-jinhao-x750-phase346",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "contemporary_archive",
    summary: "2017 玩家帖作为银色 X750、早期 Goulet 购买和入门使用的旁证；不把个人满意度写成全系保证。",
    locator: "dated review topic and user sample context",
  }),
  nibSwap: web({
    key: "phase346-jinhao-x450-x750-nib-swap",
    title: "Goulet Jinhao X450/X750 nib swapping",
    url: "https://www.gouletpens.com/blogs/fountain-pen-blog/jinhao-x450x750-fountain-pen-nib",
    registryKey: "goulet-jinhao-x450-x750-nib-phase346",
    registryName: "The Goulet Pen Company",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "Goulet 教学把 X450 与 X750 的尖／feed 结构并列为可换 #6 的样本，并说明摩擦配合与正向止挡；不等同于任意第三方组件无条件兼容。",
    locator: "nib swap method and shared nib/feed setup",
  }),
  x450Svg: diagram("phase346-jinhao-x450-svg", "Jinhao X450 structure facts", "/images/library/site-original/phase346/jinhao/x450.svg"),
  x750Svg: diagram("phase346-jinhao-x750-svg", "Jinhao X750 structure facts", "/images/library/site-original/phase346/jinhao/x750.svg"),
};

function media(key: string, title: string, source: CuratedSource) {
  return [{
    key,
    title,
    sourceKey: source.key,
    localPath: source.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、笔尖、Logo、库存或具体 SKU。",
    sourceUrl: source.url,
    usageStatus: "primary" as const,
  }];
}

function makePen(input: {
  key: string;
  id: string;
  slug: string;
  name: string;
  markdownFile: string;
  storyTitle: string;
  summary: string;
  scopeKey: string;
  primary: CuratedSource;
  sources: CuratedSource[];
  svg: CuratedSource;
  aliases: Array<{ alias: string; language: string; sourceKey: string }>;
  claims: CuratedClaim[];
  variants: CuratedEntityPack["variants"];
  values: NonNullable<CuratedEntityPack["spec"]>["values"];
  specEvidence: CuratedSpecEvidence[];
  timelineSource: CuratedSource;
  timelineDescription: string;
}): CuratedEntityPack {
  return {
    key: `phase346-${input.key}-v1`,
    entityId: input.id,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.storyTitle,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases,
    sources: [...input.sources, input.svg],
    scopes: [{ key: input.scopeKey, scopeKey: input.scopeKey, productionState: "current", editionScope: "基础型号；颜色、饰件、尖号、包装和销售批次按具体商品或实物核对。" }],
    claims: input.claims,
    variants: input.variants,
    spec: {
      brandEntityId: PHASE63_JINHAO_BRAND_ID,
      values: input.values,
      evidence: input.specEvidence,
    },
    media: media(`${input.key}-primary`, `${input.name} 结构事实图（非产品照片）`, input.svg),
    timeline: [{ key: `${input.key}-current`, title: `${input.name} 的资料时间边界`, eventType: "model_released", startDate: "2013", circa: true, description: input.timelineDescription, sourceKey: input.timelineSource.key }],
  };
}

const x450 = makePen({
  key: "x450",
  id: PHASE346_X450_ID,
  slug: PHASE346_X450_SLUG,
  name: "金豪 Jinhao X450",
  markdownFile: ".planning/content-research/jinhao-x450-phase346.md",
  storyTitle: "Jinhao X450：金属大笔身与三角导向握位",
  summary: "Jinhao X450 是金豪较早的金属大笔身型号，以三角导向握位、可替换的 #6 规格钢尖和墨囊／转换器路线为识别重点；不同颜色与镀层属于商品变体，不能与 X750、159 或 X159 合并。",
  scopeKey: X450_SCOPE,
  primary: sources.gouletX450,
  sources: [sources.gouletX450, sources.truphaeX450, sources.inksPensX450, sources.gentlemanX450, sources.mainelyX450, sources.fpnX450, sources.nibSwap],
  svg: sources.x450Svg,
  aliases: [
    { alias: "Jinhao X450", language: "en", sourceKey: sources.gouletX450.key },
    { alias: "Jinhao x450", language: "en", sourceKey: sources.gentlemanX450.key },
    { alias: "金豪 X450", language: "zh", sourceKey: sources.truphaeX450.key },
    { alias: "Jinhao 450", language: "en", sourceKey: sources.fpnX450.key },
  ],
  claims: [
    claim("x450-identity", "model_identity", "X450 是 Jinhao 独立的金属大笔身、卡扣盖、树脂导向握位和 #6 钢尖路线；不与 X750、159、X159 合并。", sources.gouletX450.key, X450_SCOPE, "current product identity and material/nib fields"),
    claim("x450-material", "material_boundary", "当前零售页写 lacquered metal，独立样本有 brass-like／enamel-coated brass 描述；页面保留这两种资料层级，不把单支观感扩写成统一合金声明。", sources.gouletX450.key, X450_SCOPE, "lacquered metal current SKU and independent brass-described samples"),
    claim("x450-grip", "ergonomic_design", "三条凹槽或半三角导向握位是 X450 的重要辨识线索；它影响手指落点，具体舒适度随手型和样本变化。", sources.mainelyX450.key, X450_SCOPE, "three grooved divots and grip observation"),
    claim("x450-nib", "nib", "资料中的 X450 原厂尖为钢制中号或两色外观，Goulet 与独立评测确认 #6 规格尖片／feed 可换；金色外观不等于金尖。", sources.gouletX450.key, X450_SCOPE, "steel nib, medium SKU and nib swap boundary"),
    claim("x450-fill", "filling_system", "X450 采用标准国际墨囊与转换器路线，部分销售包只附通用转换器；金属笔身不写成滴入式改装型号。", sources.truphaeX450.key, X450_SCOPE, "converter and standard international cartridge sections"),
    claim("x450-size", "physical_specification", "Goulet 当前 Frosted Black 样本为 141 mm 闭帽、160 mm 套盖、124 mm 笔身和约 42 g；Mainely Pens 的 2015 样本给出同组数值，仍按样本记录。", sources.gouletX450.key, X450_SCOPE, "technical specs and dated sample stats"),
    claim("x450-variants", "variant_boundary", "Lava Red、Brown Marble、Frosted Black、Shimmering Sands 等名称来自不同商品和年份；颜色、饰件和尖号是 SKU 变体，不自动创建新型号。", sources.truphaeX450.key, X450_SCOPE, "color list and product SKU boundary"),
    claim("x450-fakes", "buying_boundary", "Inks and Pens 记录二手平台存在仿品，不能只凭桶身颜色判断真伪；购买时要核对尖片、握位、转换器和可追溯销售页。", sources.inksPensX450.key, X450_SCOPE, "fake-identification and trusted-retailer caution"),
    claim("x450-care", "maintenance_guidance", "清洁使用室温清水并自然干燥；漆面金属、镀层、树脂握位和尖座避免酒精、热水、研磨剂与蛮力拆解。", sources.mainelyX450.key, X450_SCOPE, "conservative metal, resin and nib care", "editorial"),
    claim("x450-selection", "selection_guidance", "选购重点是重量、三角握位、卡扣公差、颜色批次和是否附转换器；不要用一支偏干或偏湿的原厂尖代表全系列。", sources.gentlemanX450.key, X450_SCOPE, "sample-level build and nib boundary", "editorial"),
  ],
  variants: [
    { key: "x450-colors", name: "Lava Red / Brown Marble / Black Marble / Frosted Black", notes: "资料中出现的颜色和表面名称；不同销售商可能改写，仍属于颜色 SKU。", sourceKey: sources.truphaeX450.key, variantKind: "color", market: "global" },
    { key: "x450-finish", name: "漆面金属与金银色饰件", notes: "当前商品页与独立样本的表面处理记录；饰件颜色不是新的机械型号。", sourceKey: sources.gouletX450.key, variantKind: "material", market: "retailer" },
    { key: "x450-nib-medium", name: "原厂中号／两色 #6 钢尖", notes: "常见商品配置；线宽、刻字和调校按具体 SKU/实物。", sourceKey: sources.gouletX450.key, variantKind: "nib", market: "global" },
    { key: "x450-nib-swap", name: "第三方 #6 替换尖", notes: "Goulet 教学和独立评测记录可玩性；换尖需逐支确认尖座与 feed 配合。", sourceKey: sources.nibSwap.key, variantKind: "nib", market: "aftermarket" },
  ],
  values: {
    series_name: "X450",
    release_year: "2014–2015 独立评测可追溯；无可靠官方首发年档案",
    origin_country: "当前零售与评测写中国制造语境；工厂、批次和生产方未由本包独立确认",
    nib: "#6 规格不锈钢尖，常见 M；两色／金色外观为表面处理，不是实心金尖",
    fill_system: "标准国际墨囊与通用转换器；不支持将金属桶身写成 eyedropper",
    material: "漆面金属／独立样本所述 brass-like 金属外壳，树脂握位；表面随 SKU",
    dimensions: "Goulet/ Mainely 样本：闭帽 141 mm、套盖 160 mm、笔身 124 mm、握位约 10 mm",
    weight: "Goulet 与 Mainely 样本约 42 g；Truphae 约 1.5 oz 的独立量测",
    status: "当代零售仍可见；颜色、尖号、包装和库存随市场与 SKU 变化",
  },
  specEvidence: [
    evidence("x450-brand", "brand_entity_id", sources.gouletX450.key, X450_SCOPE, "Jinhao brand field"),
    evidence("x450-series", "series_name", sources.gouletX450.key, X450_SCOPE, "X450 product title and SKU"),
    evidence("x450-release", "release_year", sources.gentlemanX450.key, X450_SCOPE, "2014–2015 dated reviews; no launch-year assertion"),
    evidence("x450-origin", "origin_country", sources.gouletX450.key, X450_SCOPE, "made in China product field"),
    evidence("x450-nib", "nib", sources.gouletX450.key, X450_SCOPE, "#6 steel, medium, two-tone product fields"),
    evidence("x450-fill", "fill_system", sources.gouletX450.key, X450_SCOPE, "converter and standard international cartridges"),
    evidence("x450-material", "material", sources.gouletX450.key, X450_SCOPE, "lacquered metal and resin grip"),
    evidence("x450-dimensions", "dimensions", sources.gouletX450.key, X450_SCOPE, "141/160/124 mm and grip field"),
    evidence("x450-weight", "weight", sources.gouletX450.key, X450_SCOPE, "42 g sample"),
    evidence("x450-status", "status", sources.gouletX450.key, X450_SCOPE, "current product SKU and stock boundary"),
  ],
  timelineSource: sources.gentlemanX450,
  timelineDescription: "2014–2015 的独立评测已能追溯 X450 的市场与玩家语境；本事件不冒充 Jinhao 官方首发档案。",
});

const x750 = makePen({
  key: "x750",
  id: PHASE346_X750_ID,
  slug: PHASE346_X750_SLUG,
  name: "金豪 Jinhao X750",
  markdownFile: ".planning/content-research/jinhao-x750-phase346.md",
  storyTitle: "Jinhao X750：全尺寸金属卡扣盖与可换 #6 尖",
  summary: "Jinhao X750 是金豪的全尺寸金属卡扣盖钢笔，以 #6 钢尖、标准国际墨囊／转换器、可套盖和较有分量的笔身为主要身份线索；颜色、尖号和零售包装是变体，不能与 X450 或 159 混写。",
  scopeKey: X750_SCOPE,
  primary: sources.gouletX750,
  sources: [sources.gouletX750, sources.gouletX750Review, sources.jetpensX750, sources.peninkcillinX750, sources.stationeryWikiX750, sources.fpnX750, sources.nibSwap, sources.truphaeX750],
  svg: sources.x750Svg,
  aliases: [
    { alias: "Jinhao X750", language: "en", sourceKey: sources.gouletX750.key },
    { alias: "Jinhao x750", language: "en", sourceKey: sources.gouletX750Review.key },
    { alias: "金豪 X750", language: "zh", sourceKey: sources.jetpensX750.key },
    { alias: "Jinhao 750", language: "en", sourceKey: sources.stationeryWikiX750.key },
  ],
  claims: [
    claim("x750-identity", "model_identity", "X750 是 Jinhao 独立的全尺寸金属、卡扣盖、#6 钢尖和墨囊／转换器型号；X450、159、X159 不能用作异名。", sources.gouletX750Review.key, X750_SCOPE, "2013 review overview and current SKU identity"),
    claim("x750-material", "material_boundary", "Goulet 当前银色 SKU 写漆面金属和树脂握位；独立评测的 brass／金属观感属于样本，不扩写为所有年份的合金档案。", sources.gouletX750.key, X750_SCOPE, "body material and grip fields with sample boundary"),
    claim("x750-cap", "cap_and_posting", "X750 使用卡扣盖并可套盖；夹子偏硬、套盖后变重或卡扣随样本变化，属于实际使用观察。", sources.gouletX750Review.key, X750_SCOPE, "snap-cap, postable and pros/cons sections"),
    claim("x750-nib", "nib", "常见配置是中号 #6 钢尖，JetPens 也有宽尖 SKU；Goulet 记录同一尖／feed 结构可换第三方 #6，线宽与组件兼容性仍需逐件核对。", sources.gouletX750.key, X750_SCOPE, "nib material, size and replacement context"),
    claim("x750-fill", "filling_system", "X750 接受标准国际短／长墨囊并附转换器，可用瓶装墨水；不同商品包的转换器容量和是否附墨囊须看 SKU。", sources.gouletX750.key, X750_SCOPE, "compatible inks and filling mechanism fields"),
    claim("x750-size", "physical_specification", "Goulet 银色样本为 141 mm 闭帽、158 mm 套盖、126 mm 笔身、10 mm 握位、36 g；JetPens X750-2 另给 141/163/125 mm，按样本呈现差异。", sources.gouletX750.key, X750_SCOPE, "technical specs and JetPens model-number sample"),
    claim("x750-early", "market_history", "Peninkcillin 的文章回顾 2011 年购入并多周使用，Goulet 评测日期为 2013 年；这能标出早期流通，不构成官方首发年份。", sources.peninkcillinX750.key, X750_SCOPE, "dated acquisition and independent review timeline"),
    claim("x750-variants", "variant_boundary", "银色、磨砂黑、闪砂、冰花红、棋盘格等是颜色／表面 SKU；中号、宽号和替换尖是尖号或改装选项，不自动拆成新型号。", sources.jetpensX750.key, X750_SCOPE, "color and nib product variants"),
    claim("x750-care", "maintenance_guidance", "清洗以室温清水为主；漆面金属、树脂握位、镀层和尖座避免酒精、热水、研磨剂、强行扩 feed 或滴入式改装。", sources.gouletX750.key, X750_SCOPE, "conservative cleaning and material boundary", "editorial"),
    claim("x750-selection", "selection_guidance", "X750 适合喜欢较重笔身、可套盖和可换 #6 尖的使用者；轻量通勤或长时间悬腕书写者应先试握再买。", sources.gouletX750Review.key, X750_SCOPE, "weight, tinkering and beginner-use observations", "editorial"),
  ],
  variants: [
    { key: "x750-colors", name: "Silver / Frosted Black / Shimmering Sands / Ice Flower Red", notes: "不同零售页和年代出现的颜色与图案；库存、表面和命名需按 SKU 核对。", sourceKey: sources.jetpensX750.key, variantKind: "color", market: "global" },
    { key: "x750-medium", name: "Medium #6 steel nib", notes: "Goulet 当前银色常见配置；线宽和调校不代表每批次一致。", sourceKey: sources.gouletX750.key, variantKind: "nib", market: "global" },
    { key: "x750-broad", name: "Broad nib SKU", notes: "JetPens X750-2 Ice Flower Red 商品的宽尖选择；不是独立机械型号。", sourceKey: sources.jetpensX750.key, variantKind: "nib", market: "retailer" },
    { key: "x750-nib-swap", name: "第三方 #6 替换尖", notes: "Goulet 教学记录 X450/X750 共通尖 feed 结构；替换前仍要检查具体尖座。", sourceKey: sources.nibSwap.key, variantKind: "nib", market: "aftermarket" },
  ],
  values: {
    series_name: "X750",
    release_year: "2011 购入样本与 2013 评测可追溯；无可靠官方首发年档案",
    origin_country: "Goulet 当前商品标注中国制造；工厂、批次和生产方未由本包独立确认",
    nib: "#6 不锈钢尖，常见 M；JetPens 有宽尖 SKU，金银色外观不是金尖证明",
    fill_system: "标准国际短／长墨囊与转换器，兼用瓶装墨水；不写成 eyedropper",
    material: "漆面金属笔身与树脂握位；颜色、镀层和图案随市场 SKU",
    dimensions: "Goulet 样本：闭帽 141 mm、开盖/笔身 126 mm、套盖 158 mm、握位 10 mm；JetPens 样本套盖 163 mm",
    weight: "Goulet 银色样本约 36 g（笔身 22 g、笔盖 14 g）",
    status: "当前零售仍可见；颜色、尖号、容量、包装和库存随市场 SKU 变化",
  },
  specEvidence: [
    evidence("x750-brand", "brand_entity_id", sources.gouletX750.key, X750_SCOPE, "Jinhao brand field"),
    evidence("x750-series", "series_name", sources.gouletX750.key, X750_SCOPE, "X750 product title and SKU"),
    evidence("x750-release", "release_year", sources.peninkcillinX750.key, X750_SCOPE, "2011 sample and 2013 dated review boundary"),
    evidence("x750-origin", "origin_country", sources.gouletX750.key, X750_SCOPE, "made in China product field"),
    evidence("x750-nib", "nib", sources.gouletX750.key, X750_SCOPE, "#6 steel and medium product fields"),
    evidence("x750-fill", "fill_system", sources.gouletX750.key, X750_SCOPE, "converter and standard international cartridges"),
    evidence("x750-material", "material", sources.gouletX750.key, X750_SCOPE, "lacquered metal and resin grip"),
    evidence("x750-dimensions", "dimensions", sources.gouletX750.key, X750_SCOPE, "141/158/126 mm and grip field"),
    evidence("x750-weight", "weight", sources.gouletX750.key, X750_SCOPE, "36 g sample"),
    evidence("x750-status", "status", sources.gouletX750.key, X750_SCOPE, "current product SKU and stock boundary"),
  ],
  timelineSource: sources.gouletX750Review,
  timelineDescription: "2011 购入样本、2013 评测和当前零售页共同构成 X750 的流通时间边界；不将这些日期写成品牌官方首发年。",
});

const baseBrand = phase63JinhaoPacks.find((pack) => pack.entityId === PHASE63_JINHAO_BRAND_ID);
if (!baseBrand) throw new Error("Phase 346 requires the existing Jinhao brand pack.");

export const phase346JinhaoX450X750Packs: CuratedEntityPack[] = [
  structuredClone(baseBrand),
  x450,
  x750,
];
