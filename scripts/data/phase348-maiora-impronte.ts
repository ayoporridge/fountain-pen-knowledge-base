import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-02";
export const PHASE348_MAIORA_BRAND_ID = "phase348-maiora-brand";
export const PHASE348_IMPRONTE_ID = "phase348-maiora-impronte";
export const PHASE348_IMPRONTE_OVERSIZE_ID = "phase348-maiora-impronte-oversize";
export const PHASE348_IMPRONTE_SLUG = "maiora-impronte";
export const PHASE348_IMPRONTE_OVERSIZE_SLUG = "maiora-impronte-oversize";

const BRAND_SCOPE = "Maiora Italian handmade writing culture, Delta-era context, and model navigation";
const IMPRONTE_SCOPE = "Maiora Impronte standard resin fountain pen, steel nib, filling, and variant samples";
const OVERSIZE_SCOPE = "Maiora Impronte Oversize resin fountain pen, steel nib, filling, and variant samples";

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
  itemType?: string;
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
    itemType: input.itemType ?? "web_page",
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
    registryKey: "fountain-pen-graph-editorial-phase348",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase348",
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

const catalog = web({
  key: "phase348-maiora-official-catalog",
  title: "Maiora official 2022 catalog",
  url: "https://maiorapen.com/wp-content/uploads/2022/12/CATALOGO-MAIORA-.pdf",
  registryKey: "maiora-official-catalog-phase348",
  registryName: "Maiora official catalog",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "maiora-official-catalog-phase348",
  summary: "官方 2022 catalog 记载 Maiora 的 1978 年故事起点、40 多年经验、made in Italy 语境，以及 Impronte 的树脂、三线螺纹、金属件、钢尖和目录尺寸。",
  locator: "PDF pp. 1-4 and Impronte dimension pages",
  itemType: "pdf",
});

const pencilcase = web({
  key: "phase348-maiora-pencilcase",
  title: "The Pencilcase Blog Maiora Impronte review",
  url: "https://www.pencilcaseblog.com/2020/10/review-maiora-impronte-fountain-pen.html",
  registryKey: "pencilcase-maiora-impronte-phase348",
  registryName: "The Pencilcase Blog",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pencilcase-maiora-impronte-phase348",
  summary: "独立标准款样本记录树脂组合、约 147/133 mm、约 27 g、captured converter、标准卡水／转换器和 JoWo 钢尖。",
  locator: "standard Impronte design, measurements, filling and nib sections",
});

const gentleman = web({
  key: "phase348-maiora-gentleman",
  title: "The Gentleman Stationer Maiora Impronte Oversize review",
  url: "https://www.gentlemanstationer.com/blog/2020/11/21/pen-review-maiora-impronte-oversize-fountain-pen",
  registryKey: "gentleman-maiora-impronte-phase348",
  registryName: "The Gentleman Stationer",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "gentleman-maiora-impronte-phase348",
  summary: "独立 Capri acrylic 评测把 Impronte Oversize 作为独立较大路线，讨论凹面握位、#6 JoWo 钢尖和 Delta 之后的品牌语境。",
  locator: "Oversize identity, Capri material, grip and nib sections",
});

const penAddict = web({
  key: "phase348-maiora-penaddict",
  title: "The Pen Addict Maiora Impronte Oversized review",
  url: "https://penaddict.squarespace.com/blog/2021/9/27/maiora-impronte-oversized-fountain-pen-review",
  registryKey: "penaddict-maiora-impronte-phase348",
  registryName: "The Pen Addict",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "penaddict-maiora-impronte-phase348",
  summary: "独立 Posillipo Oversize 样本记录 #6 JoWo EF、captured converter 和标准／Oversize 的选择边界。",
  locator: "Posillipo sample, filling, nib and size discussion",
});

const sbre = web({
  key: "phase348-maiora-sbrebrown",
  title: "SBREBrown Maiora Impronte Mirror Black Oversize review",
  url: "https://www.sbrebrown.com/?p=9633",
  registryKey: "sbrebrown-maiora-impronte-phase348",
  registryName: "SBREBrown",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "sbrebrown-maiora-impronte-phase348",
  summary: "Mirror Black Oversize 样本测得 145.2/143.4/153.7 mm、约 32 g、桶径约 15.5 mm 和握位 11.5–12.9 mm。",
  locator: "measurements and weight block",
});

const penChalet = web({
  key: "phase348-maiora-penchalet-standard",
  title: "Pen Chalet Maiora Impronte standard product page",
  url: "https://www.penchalet.com/fine_pens/fountain_pens/maiora_impronte_fountain_pen.html",
  registryKey: "penchalet-maiora-impronte-standard-phase348",
  registryName: "Pen Chalet",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "penchalet-maiora-impronte-standard-phase348",
  summary: "专业零售商列出标准款 142.9 mm 闭帽、152.4 mm 套帽、15.2 mm 桶径、树脂、#6 不锈钢尖和标准国际卡水／转换器。",
  locator: "standard product specifications",
});

const penChaletOversize = web({
  key: "phase348-maiora-penchalet-oversize",
  title: "Pen Chalet Maiora Impronte Oversize product page",
  url: "https://www.penchalet.com/fine_pens/fountain_pens/maiora_impronte_oversize_fountain_pen.html",
  registryKey: "penchalet-maiora-impronte-oversize-phase348",
  registryName: "Pen Chalet",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "penchalet-maiora-impronte-oversize-phase348",
  summary: "专业零售商把 Impronte Oversize 单列为较大尺寸树脂路线，并列 #6 不锈钢尖；库存和价格不写入正文。",
  locator: "Oversize product route and specifications",
});

const svg = diagram(
  "phase348-maiora-impronte-svg",
  "Maiora Impronte standard and Oversize factual diagram",
  "/images/library/site-original/phase348/maiora/impronte.svg",
);

const brand: CuratedEntityPack = {
  key: "phase348-maiora-brand-v1",
  entityId: PHASE348_MAIORA_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "maiora",
  canonicalName: "Maiora 玛奥拉",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/quick/260802-maiora-impronte/brand.md",
  storyTitle: "Maiora：把意大利制笔传统写成新的品牌路线",
  primarySourceKey: catalog.key,
  depthTier: "A",
  aliases: [
    { alias: "Maiora Pens", language: "en", sourceKey: catalog.key },
    { alias: "Maiora writing culture", language: "en", sourceKey: catalog.key },
    { alias: "玛奥拉钢笔", language: "zh", sourceKey: pencilcase.key },
  ],
  sources: [catalog, pencilcase, gentleman, penAddict, penChalet, svg],
  scopes: [{ key: BRAND_SCOPE, scopeKey: BRAND_SCOPE, productionState: "current", editionScope: "Maiora brand self-description, Delta-era secondary context, and current Impronte standard/Oversize navigation." }],
  claims: [
    claim("maiora-story", "brand_history", "Maiora 官方 2022 catalog 用“story born in 1978, continues”描述品牌时间线，并把 40 多年书写工具经验放在公司自述中。", catalog.key, BRAND_SCOPE, "PDF p. 1 company story"),
    claim("maiora-italy", "manufacturing_scope", "官方 catalog 强调 authentic made in Italy，并在 Impronte 与其它路线中描述手工车制和手工处理；不扩写为所有供应商都在同一地址。", catalog.key, BRAND_SCOPE, "PDF pp. 1, 3 and final made-in-Italy statement"),
    claim("maiora-delta-context", "brand_context", "The Pencilcase Blog 与 The Gentleman Stationer 将 Maiora 放在 Delta 停业后的意大利品牌变化中，并把 Nino Marino 与 Delta 背景作为二级语境。", pencilcase.key, BRAND_SCOPE, "Delta-era context in independent reviews"),
    claim("maiora-craft", "manufacturing_scope", "官方 catalog 描述实心树脂棒、手工车制／抛光、实心黄铜夹和金／铑饰面；工艺自述不等于年度产量或工厂规模。", catalog.key, BRAND_SCOPE, "Impronte craft and metal-work description"),
    claim("maiora-navigation", "brand_model_navigation", "Impronte standard 与 Impronte Oversize 共享设计语言但形成不同尺寸路线；颜色、饰面和 EF/F/M/B 字幅属于版本层。", gentleman.key, BRAND_SCOPE, "standard/Oversize distinction and variant boundary"),
    claim("maiora-nib-boundary", "nib_scope", "官方 catalog 写钢尖 EF/F/M/B，独立资料写 #6 JoWo；不把 JoWo 供应商说成 Maiora 自制尖。", catalog.key, BRAND_SCOPE, "official nib menu and independent JoWo attribution"),
    claim("maiora-care", "maintenance_guidance", "品牌页不能替代型号级维护；Impronte 的 captured converter、树脂、电镀和螺纹需要各自回到型号页。", catalog.key, BRAND_SCOPE, "model-specific care boundary", "editorial"),
    claim("maiora-comparison", "comparison_boundary", "Maiora 可与 Leonardo、Tibaldi、Montegrappa 作材料、尖、供墨和历史语境比较，但相似的意大利或 Delta 语境不建立制造关系。", gentleman.key, BRAND_SCOPE, "comparative brand boundary", "editorial"),
  ],
  variants: [{ key: "maiora-impronte-routes", name: "Impronte standard / Impronte Oversize", notes: "标准与较大尺寸路线；颜色、树脂纹理、电镀与尖幅另作变体，不拆成更多型号。", sourceKey: gentleman.key, variantKind: "edition_group", market: "global" }],
  timeline: [
    { key: "maiora-1978", title: "Maiora 官方故事起点", eventType: "brand_founded", startDate: "1978", circa: false, description: "官方 2022 catalog 的 company story 节点；不把它改写成当前每个型号的首发年份。", sourceKey: catalog.key },
    { key: "maiora-delta-revival", title: "Delta 之后的品牌路线旁证", eventType: "revival", startDate: "2018", circa: true, description: "独立评测将 Maiora 放进 Delta 停业后意大利独立制笔品牌的语境；年份为近似背景，不是官方注册日期。", sourceKey: pencilcase.key },
    { key: "maiora-2022-catalog", title: "官方 2022 catalog 可核对的产品路线", eventType: "design_milestone", startDate: "2022", circa: false, description: "官方 catalog 把 Impronte、Mitho、Alpha 等路线和 made-in-Italy 叙述集中呈现。", sourceKey: catalog.key },
  ],
  media: [{ key: "maiora-brand-svg", title: "Maiora 与 Impronte standard／Oversize 路线事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

const standard: CuratedEntityPack = {
  key: "phase348-maiora-impronte-v1",
  entityId: PHASE348_IMPRONTE_ID,
  expectedType: "pen",
  expectedSlug: PHASE348_IMPRONTE_SLUG,
  canonicalName: "Maiora Impronte",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/maiora-impronte-phase348.md",
  storyTitle: "Maiora Impronte：颜色树脂、三线螺纹与标准尺寸",
  primarySourceKey: catalog.key,
  depthTier: "A",
  aliases: [
    { alias: "Maiora Impronte Fountain Pen", language: "en", sourceKey: penChalet.key },
    { alias: "Impronte standard", language: "en", sourceKey: gentleman.key },
    { alias: "Maiora Impronte 标准款", language: "zh", sourceKey: pencilcase.key },
  ],
  sources: [catalog, pencilcase, gentleman, penChalet, penAddict, svg],
  scopes: [{ key: IMPRONTE_SCOPE, scopeKey: IMPRONTE_SCOPE, productionState: "current", editionScope: "Impronte standard-size fountain pen; colours, metal finishes and EF/F/M/B nibs are variants, not separate models." }],
  claims: [
    claim("impronte-identity", "model_identity", "Maiora Impronte 是标准尺寸 fountain pen 路线；Impronte Oversize 单独记录，rollerball 等同名书写工具不混入本实体。", gentleman.key, IMPRONTE_SCOPE, "standard/Oversize identity boundary"),
    claim("impronte-craft", "design_language", "官方 catalog 写 Impronte 由实心树脂棒手工车制，配三线帽螺纹、实心黄铜夹和亮／哑双表面。", catalog.key, IMPRONTE_SCOPE, "PDF p. 3 Impronte collection"),
    claim("impronte-material", "material", "标准款样本使用树脂／acrylic 组合；橙黑 spaghetti resin、Capri、Matte Black 等是颜色或表面版本，不等于统一配方。", pencilcase.key, IMPRONTE_SCOPE, "standard sample material and colour variants"),
    claim("impronte-fill", "filling_system", "Impronte 使用 captured converter，可在标准国际卡水与转换器之间切换；资料不支持活塞、真空或 eyedropper。", pencilcase.key, IMPRONTE_SCOPE, "captured converter and cartridge/converter route"),
    claim("impronte-nib", "nib", "官方目录给不锈钢、铱尖、金／铑电镀与 EF/F/M/B；独立资料把标准款记录为 #6 JoWo 钢尖。", catalog.key, IMPRONTE_SCOPE, "official nib menu and independent JoWo sample"),
    claim("impronte-size", "physical_specification", "官方目录给 147/157 mm、直径 16 mm；The Pencilcase Blog 样本约 147/133 mm、握位约 12 mm；PenChalet 零售表给 142.9/152.4 mm。", catalog.key, IMPRONTE_SCOPE, "catalog dimension pages and measurement-boundary note"),
    claim("impronte-weight", "physical_specification", "The Pencilcase Blog 标准款样本约 27 g；这是独立样本重量，不能覆盖 Oversize 或所有饰面。", pencilcase.key, IMPRONTE_SCOPE, "standard sample weight"),
    claim("impronte-variants", "variant_boundary", "黑／橙、Capri、Mirror Black、Matte Black 与金／铑电镀是颜色／饰面版本；EF/F/M/B 是尖幅选项。", catalog.key, IMPRONTE_SCOPE, "official colour and nib menu"),
    claim("impronte-sample", "sample_boundary", "标准款评测对凹面握位、表面一致性和 JoWo 尖的观察属于样本，不改写为所有 Impronte 的书写承诺。", pencilcase.key, IMPRONTE_SCOPE, "independent writing sample"),
    claim("impronte-care", "maintenance_guidance", "树脂、电镀、三线螺纹和 captured converter 用室温清水与柔软布维护，避免热水、酒精、丙酮、漂白剂和硬拧。", catalog.key, IMPRONTE_SCOPE, "conservative care guidance", "editorial"),
    claim("impronte-buying", "selection_guidance", "选购先确认 standard／Oversize、颜色／饰面、EF–B 尖幅、卡水／转换器和卖家的测量口径。", penChalet.key, IMPRONTE_SCOPE, "standard product selection", "editorial"),
  ],
  variants: [
    { key: "impronte-colours", name: "黑／橙、Capri、Mirror Black、Matte Black", notes: "官方目录与独立商品／评测中出现的颜色或饰面；库存随时期变化。", sourceKey: catalog.key, variantKind: "color", market: "global" },
    { key: "impronte-nibs", name: "EF / F / M / B steel nib", notes: "官方 catalog 字幅范围；JoWo 归属由独立资料提供。", sourceKey: catalog.key, variantKind: "nib", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE348_MAIORA_BRAND_ID,
    values: {
      series_name: "Impronte standard",
      release_year: "官方 2022 catalog 可见；The Pencilcase Blog 为 2020 样本，不将评测日期当作唯一首发年份",
      origin_country: "意大利；官方 catalog 使用 made in Italy 语境",
      nib: "#6 stainless steel / JoWo sample; official EF/F/M/B, gold or rhodium plated by version",
      fill_system: "Captured converter; standard international cartridges / converter",
      material: "Hand-turned resin/acrylic body with colour and finish variants",
      dimensions: "Official catalog 147/157 mm and Ø16 mm; independent samples approximately 142.9–147 mm capped",
      weight: "Approximately 27 g in The Pencilcase Blog standard sample",
      status: "Impronte standard route documented in official catalog and retailer/independent samples",
    },
    evidence: [
      evidence("impronte-brand", "brand_entity_id", catalog.key, IMPRONTE_SCOPE, "Maiora official catalog brand context"),
      evidence("impronte-series", "series_name", catalog.key, IMPRONTE_SCOPE, "official Impronte collection"),
      evidence("impronte-release", "release_year", pencilcase.key, IMPRONTE_SCOPE, "dated 2020 sample; no single launch-year assertion"),
      evidence("impronte-origin", "origin_country", catalog.key, IMPRONTE_SCOPE, "official made-in-Italy statement"),
      evidence("impronte-nib-spec", "nib", catalog.key, IMPRONTE_SCOPE, "official EF/F/M/B steel nib"),
      evidence("impronte-fill-spec", "fill_system", pencilcase.key, IMPRONTE_SCOPE, "captured converter and cartridge/converter"),
      evidence("impronte-material-spec", "material", catalog.key, IMPRONTE_SCOPE, "hand-turned resin body"),
      evidence("impronte-dimensions", "dimensions", catalog.key, IMPRONTE_SCOPE, "147/157 mm and 16 mm catalog dimensions"),
      evidence("impronte-weight", "weight", pencilcase.key, IMPRONTE_SCOPE, "approximately 27 g sample"),
      evidence("impronte-status", "status", catalog.key, IMPRONTE_SCOPE, "official catalog product route"),
    ],
  },
  timeline: [{ key: "impronte-current", title: "Impronte standard 资料核对", eventType: "model_released", startDate: RETRIEVED, circa: false, description: "2026-08-02 可访问的官方 catalog、零售规格和独立样本构成标准路线范围；不把样本日期当作首发年份。", sourceKey: catalog.key }],
  media: [{ key: "impronte-svg", title: "Maiora Impronte standard／Oversize 事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

const oversize: CuratedEntityPack = {
  key: "phase348-maiora-impronte-oversize-v1",
  entityId: PHASE348_IMPRONTE_OVERSIZE_ID,
  expectedType: "pen",
  expectedSlug: PHASE348_IMPRONTE_OVERSIZE_SLUG,
  canonicalName: "Maiora Impronte Oversize",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/maiora-impronte-oversize-phase348.md",
  storyTitle: "Maiora Impronte Oversize：大桶身也可以把手指放稳",
  primarySourceKey: catalog.key,
  depthTier: "A",
  aliases: [
    { alias: "Maiora Impronte Oversized Fountain Pen", language: "en", sourceKey: penAddict.key },
    { alias: "Impronte Oversize Posillipo", language: "en", sourceKey: penAddict.key },
    { alias: "Maiora Impronte 大号", language: "zh", sourceKey: gentleman.key },
  ],
  sources: [catalog, gentleman, penAddict, sbre, penChaletOversize, pencilcase, svg],
  scopes: [{ key: OVERSIZE_SCOPE, scopeKey: OVERSIZE_SCOPE, productionState: "current", editionScope: "Impronte Oversize fountain pen; Posillipo, Capri, Mirror Black and other colours/finishes are variants." }],
  claims: [
    claim("oversize-identity", "model_identity", "Maiora Impronte Oversize 是 Impronte 的独立较大尺寸 fountain pen 路线；标准款单独记录。", gentleman.key, OVERSIZE_SCOPE, "Oversize identity in independent review"),
    claim("oversize-design", "design_language", "Oversize 保留 Impronte 的树脂、三线螺纹和尖顶轮廓，同时使用更宽桶身与深凹握位；不是简单颜色变体。", gentleman.key, OVERSIZE_SCOPE, "Capri Oversize design and grip"),
    claim("oversize-material", "material", "Capri、Posillipo、Mirror Black 等样本使用树脂／acrylic；官方目录的手工车制与金／铑饰面属于系列工艺语境。", catalog.key, OVERSIZE_SCOPE, "official Impronte craft and sample materials"),
    claim("oversize-fill", "filling_system", "The Pen Addict 记录 Oversize 的尾端 captured converter，配 cartridge/converter 路线；没有资料支持活塞或 eyedropper。", penAddict.key, OVERSIZE_SCOPE, "Posillipo filling system"),
    claim("oversize-nib", "nib", "Posillipo 样本使用 #6 JoWo EF 钢尖；官方目录给 EF/F/M/B 钢尖范围，零售商也列 #6 stainless steel。", penAddict.key, OVERSIZE_SCOPE, "#6 JoWo EF sample and official nib menu"),
    claim("oversize-size", "physical_specification", "SBREBrown Mirror Black 样本测得 145.2 mm 闭帽、143.4 mm 开盖、153.7 mm 套帽、桶径约 15.5 mm、握位 11.5–12.9 mm；官方目录给系列 147/157 mm、Ø16 mm。", sbre.key, OVERSIZE_SCOPE, "Mirror Black measurements and official catalogue boundary"),
    claim("oversize-weight", "physical_specification", "SBREBrown Mirror Black 样本全笔约 32 g，笔身 23 g、帽 9 g；重量随材料与饰面变化。", sbre.key, OVERSIZE_SCOPE, "sample weight block"),
    claim("oversize-variants", "variant_boundary", "Posillipo、Capri、Mirror Black 等是颜色／树脂版本；EF/F/M/B 是尖幅选项，不拆成平行机械型号。", penAddict.key, OVERSIZE_SCOPE, "colour and nib variant boundary"),
    claim("oversize-sample", "sample_boundary", "独立评测对凹面握位、平衡、初写和尖幅的判断属于具体样本，不泛化为全批次保证。", gentleman.key, OVERSIZE_SCOPE, "independent writing observations"),
    claim("oversize-care", "maintenance_guidance", "树脂、镀层、螺纹和 captured converter 用室温清水与柔软布维护；避免热水、酒精、丙酮、漂白剂和硬拧。", catalog.key, OVERSIZE_SCOPE, "conservative care guidance", "editorial"),
    claim("oversize-buying", "selection_guidance", "选购先确认手型、套帽习惯、standard／Oversize 标签、颜色／饰面、EF–B 尖幅和卖家的测量口径。", gentleman.key, OVERSIZE_SCOPE, "Oversize selection guidance", "editorial"),
  ],
  variants: [
    { key: "oversize-colours", name: "Posillipo / Capri / Mirror Black", notes: "独立评测和零售菜单可见的颜色／树脂版本；库存随市场变化。", sourceKey: penAddict.key, variantKind: "color", market: "global" },
    { key: "oversize-nibs", name: "EF / F / M / B steel nib", notes: "官方 catalog 字幅范围，#6 JoWo 归属来自独立样本。", sourceKey: catalog.key, variantKind: "nib", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE348_MAIORA_BRAND_ID,
    values: {
      series_name: "Impronte Oversize",
      release_year: "官方 2022 catalog 可见；独立评测为 2020–2022 样本，不将评测日期当作唯一首发年份",
      origin_country: "意大利；官方 catalog 使用 made in Italy 语境",
      nib: "#6 JoWo/stainless steel samples; official EF/F/M/B",
      fill_system: "Captured converter; standard international cartridge/converter route",
      material: "Hand-turned resin/acrylic body with colour and plated trim variants",
      dimensions: "SBREBrown sample 145.2 mm capped, 143.4 mm uncapped, 153.7 mm posted; barrel approx. 15.5 mm",
      weight: "Approximately 32 g full pen in Mirror Black sample; body 23 g, cap 9 g",
      status: "Oversize route documented by official catalog, professional retailers and independent reviews",
    },
    evidence: [
      evidence("oversize-brand", "brand_entity_id", catalog.key, OVERSIZE_SCOPE, "Maiora official catalog brand context"),
      evidence("oversize-series", "series_name", gentleman.key, OVERSIZE_SCOPE, "independent Oversize identity"),
      evidence("oversize-release", "release_year", penAddict.key, OVERSIZE_SCOPE, "dated sample boundary; no single launch-year assertion"),
      evidence("oversize-origin", "origin_country", catalog.key, OVERSIZE_SCOPE, "official made-in-Italy statement"),
      evidence("oversize-nib-spec", "nib", catalog.key, OVERSIZE_SCOPE, "official EF/F/M/B steel nib range"),
      evidence("oversize-fill-spec", "fill_system", penAddict.key, OVERSIZE_SCOPE, "captured converter route"),
      evidence("oversize-material-spec", "material", catalog.key, OVERSIZE_SCOPE, "hand-turned resin and plated trim"),
      evidence("oversize-dimensions", "dimensions", sbre.key, OVERSIZE_SCOPE, "Mirror Black sample measurements"),
      evidence("oversize-weight", "weight", sbre.key, OVERSIZE_SCOPE, "32 g sample weight"),
      evidence("oversize-status", "status", gentleman.key, OVERSIZE_SCOPE, "current standard/Oversize product distinction"),
    ],
  },
  timeline: [{ key: "oversize-current", title: "Impronte Oversize 资料核对", eventType: "model_released", startDate: RETRIEVED, circa: false, description: "官方 catalog、专业零售商和 2020–2022 独立样本共同构成 Oversize 路线范围；不把评测日期当作首发年份。", sourceKey: catalog.key }],
  media: [{ key: "oversize-svg", title: "Maiora Impronte Oversize 事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase348MaioraImprontePacks: CuratedEntityPack[] = [brand, standard, oversize];
