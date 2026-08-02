import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-02";
export const PHASE347_TIBALDI_BRAND_ID = "phase347-tibaldi-brand";
export const PHASE347_BONONIA_ID = "phase347-tibaldi-bononia";
export const PHASE347_BONONIA_SLUG = "tibaldi-bononia";

const BRAND_SCOPE = "Tibaldi Italian brand history, revival language, and model navigation";
const BONONIA_SCOPE = "Tibaldi Bononia modern resin fountain pen, steel nib, filling, and variant sample records";

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
    registryKey: "fountain-pen-graph-editorial-phase347",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase347",
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
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: BONONIA_SCOPE, locator, qualifies: true };
}

const officialBrand = web({
  key: "phase347-tibaldi-official-brand",
  title: "Tibaldi official brand story",
  url: "https://tibaldipen.co.uk/tibaldi/",
  registryKey: "tibaldi-official-brand-phase347",
  registryName: "Tibaldi official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "tibaldi-official-brand-phase347",
  summary: "官方品牌页记载 1916 年佛罗伦萨起点、1965 年停业后的经营变化、Aquila 家族主持和 2004 年 Bassano del Grappa 总部叙述。",
  locator: "official brand story and modern story sections",
});

const officialBononia = web({
  key: "phase347-tibaldi-official-bononia",
  title: "Tibaldi official Bononia collection page",
  url: "https://tibaldipen.co.uk/bononia/",
  registryKey: "tibaldi-official-bononia-phase347",
  registryName: "Tibaldi official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "tibaldi-official-bononia-phase347",
  summary: "官方 Bononia 路线页列出 Rich Black、Seashell Mist、Martini Olive 等树脂颜色和 fountain pen／rollerball／ballpoint 入口，但不提供完整规格表。",
  locator: "Bononia collection navigation and colour product cards",
});

const history = web({
  key: "phase347-tibaldi-history-reference",
  title: "FountainPen.it Tibaldi historical reference",
  url: "https://fountainpen.it/Tibaldi/en",
  registryKey: "fountainpenit-tibaldi-phase347",
  registryName: "FountainPen.it",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "fountainpenit-tibaldi-phase347",
  summary: "钢笔史资料站梳理 Tibaldi 的 1916 年起点、Perfecta、Infrangibile、Lusso、Impero 与战后路线，并对早期生产资料保留考证边界。",
  locator: "history, chronology and model sections",
});

const pencilcase = web({
  key: "phase347-tibaldi-pencilcase",
  title: "The Pencilcase Blog Tibaldi Bononia review",
  url: "https://www.pencilcaseblog.com/2021/01/review-tibaldi-bononia-fountain-pen.html",
  registryKey: "pencilcase-tibaldi-bononia-phase347",
  registryName: "The Pencilcase Blog",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pencilcase-tibaldi-bononia-phase347",
  summary: "独立实物评测记录 Bononia 树脂构造、约 146/129 mm、约 24 g、标准国际卡水／转换器、钢尖和握持样本。",
  locator: "dimensions, material, filling and writing experience sections",
});

const penquisition = web({
  key: "phase347-tibaldi-penquisition",
  title: "Penquisition Tibaldi Bononia Bora Bora review",
  url: "https://penquisition.com/blog/2021/07/19/tibaldi-bononia-bora-bora",
  registryKey: "penquisition-tibaldi-bononia-phase347",
  registryName: "Penquisition",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "penquisition-tibaldi-bononia-phase347",
  summary: "独立 Bora Bora 样本给出 146.1/163.9 mm、23 g、#6 钢尖、ebonite feed 和标准国际卡水／转换器。",
  locator: "specifications, nib, feed and filling system sections",
});

const sbre = web({
  key: "phase347-tibaldi-sbrebrown",
  title: "SBREBrown Tibaldi Bononia Martini Olive review",
  url: "https://www.sbrebrown.com/2022/02/tibaldi-bononia-martini-olive-fountain-pen-review/",
  registryKey: "sbrebrown-tibaldi-bononia-phase347",
  registryName: "SBREBrown",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "sbrebrown-tibaldi-bononia-phase347",
  summary: "另一颜色的独立评测给出约 146.3/128.6/146.6 mm、23 g 与握位直径，作为样本数据交叉核对。",
  locator: "Martini Olive measurements and review notes",
});

const stilofetti = web({
  key: "phase347-tibaldi-stilofetti",
  title: "Stilofetti Tibaldi Bononia Bora Bora product page",
  url: "https://www.stilofetti.it/en/home/3627-tibaldi-bononia-bora-bora-fountain-pen.html",
  registryKey: "stilofetti-tibaldi-bononia-phase347",
  registryName: "Stilofetti",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "stilofetti-tibaldi-bononia-phase347",
  summary: "专业零售商列出 EF/F/M/B/BB 钢尖、ebonite conductor 与 Bora Bora 商品路线；不把库存和价格写成长期事实。",
  locator: "Bononia product details and nib options",
});

const svg = diagram(
  "phase347-tibaldi-bononia-svg",
  "Tibaldi Bononia resin and filling factual diagram",
  "/images/library/site-original/phase347/tibaldi/bononia.svg",
);

const brand: CuratedEntityPack = {
  key: "phase347-tibaldi-brand-v1",
  entityId: PHASE347_TIBALDI_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "tibaldi",
  canonicalName: "蒂巴尔迪 Tibaldi",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/quick/260802-tibaldi-bononia/brand.md",
  storyTitle: "蒂巴尔迪 Tibaldi：从佛罗伦萨老品牌到当代复兴",
  primarySourceKey: officialBrand.key,
  depthTier: "A",
  aliases: [
    { alias: "Tibaldi", language: "en", sourceKey: officialBrand.key },
    { alias: "Tibaldi Pens", language: "en", sourceKey: officialBrand.key },
    { alias: "蒂巴尔迪钢笔", language: "zh", sourceKey: history.key },
  ],
  sources: [officialBrand, officialBononia, history, pencilcase, penquisition, svg],
  scopes: [{ key: BRAND_SCOPE, scopeKey: BRAND_SCOPE, productionState: "current", editionScope: "Tibaldi historical brand record and modern Bononia-era navigation; historical and current production remain distinct." }],
  claims: [
    claim("tibaldi-founded", "brand_history", "Tibaldi 官方品牌页把品牌起点放在 1916 年佛罗伦萨，由 Giuseppe Tibaldi 建立。", officialBrand.key, BRAND_SCOPE, "1916 Florence origin in official brand story"),
    claim("tibaldi-closure", "brand_history", "官方当前叙述说品牌在 1965 年后经历停业与多次领导层变化；这不是每个历史型号的停产日期。", officialBrand.key, BRAND_SCOPE, "1965 and leadership-change language"),
    claim("tibaldi-revival", "brand_revival", "官方写明现由 Aquila 家族主持，并把 2004 年总部迁至 Bassano del Grappa 纳入现代复兴叙述。", officialBrand.key, BRAND_SCOPE, "Aquila family and 2004 headquarters language"),
    claim("tibaldi-history-models", "historical_model_navigation", "FountainPen.it 资料页把 Perfecta、Infrangibile、Lusso、Impero 与 Trasparente列为不同历史路线；正文按二级资料归因，不把其规格复制到现代型号。", history.key, BRAND_SCOPE, "history, chronology and model sections"),
    claim("tibaldi-current-routes", "brand_model_navigation", "官方 Bononia 页把 fountain pen、rollerball、ballpoint 及多种树脂颜色放在当代产品导航中；书写工具类型和颜色不能混成一个 fountain pen 实体。", officialBononia.key, BRAND_SCOPE, "Bononia product navigation and colour cards"),
    claim("tibaldi-italian-context", "origin_country", "官方品牌页持续使用意大利、佛罗伦萨与 Bassano del Grappa 的品牌语境；未给出 Bononia 每个零件或供应商的独立工厂证明。", officialBrand.key, BRAND_SCOPE, "Italian brand context and manufacturing boundary"),
    claim("tibaldi-sample-boundary", "professional_secondary_boundary", "The Pencilcase Blog 与 Penquisition 的 Bononia 评测提供具体样本，不替代品牌页，也不扩写成全品牌手感。", pencilcase.key, BRAND_SCOPE, "independent model sample boundary"),
    claim("tibaldi-care", "maintenance_guidance", "Tibaldi 的历史填充系统和现代 Bononia 不能共用维护假设；品牌页只作索引，清洗与修复需回到具体型号。", officialBononia.key, BRAND_SCOPE, "current navigation versus historical filling systems", "editorial"),
  ],
  variants: [{ key: "tibaldi-routes", name: "Bononia、Infrangible、N.60、Perfecta 与历史路线", notes: "官方当前导航与历史资料中的不同产品路线；每个型号的材料、填充和年代分别核对。", sourceKey: officialBononia.key, variantKind: "edition_group", market: "global" }],
  timeline: [
    { key: "tibaldi-1916", title: "Giuseppe Tibaldi 在佛罗伦萨建立品牌", eventType: "brand_founded", startDate: "1916", circa: false, description: "官方品牌页的历史起点；不等同于现有 Bononia 的首发年份。", sourceKey: officialBrand.key },
    { key: "tibaldi-1965", title: "原公司生产周期结束", eventType: "discontinued", startDate: "1965", circa: false, description: "官方现代品牌页以 1965 年作为旧阶段结束的叙述节点；历史型号的具体停产时间仍需逐项考证。", sourceKey: officialBrand.key },
    { key: "tibaldi-2004", title: "现代品牌总部迁至 Bassano del Grappa 的叙述节点", eventType: "revival", startDate: "2004", circa: false, description: "官方品牌页现代故事中的总部迁移与复兴语境。", sourceKey: officialBrand.key },
  ],
  media: [{ key: "tibaldi-brand-svg", title: "Tibaldi 与 Bononia 路线事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

const model: CuratedEntityPack = {
  key: "phase347-tibaldi-bononia-v1",
  entityId: PHASE347_BONONIA_ID,
  expectedType: "pen",
  expectedSlug: PHASE347_BONONIA_SLUG,
  canonicalName: "Tibaldi Bononia",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/tibaldi-bononia-phase347.md",
  storyTitle: "Tibaldi Bononia：复古帽环下的轻量树脂钢笔",
  primarySourceKey: officialBononia.key,
  depthTier: "A",
  aliases: [
    { alias: "Tibaldi Bononia Fountain Pen", language: "en", sourceKey: officialBononia.key },
    { alias: "Bononia Bora Bora", language: "en", sourceKey: penquisition.key },
    { alias: "Tibaldi Bononia 蒂巴尔迪博洛尼亚", language: "zh", sourceKey: pencilcase.key },
  ],
  sources: [officialBononia, officialBrand, pencilcase, penquisition, sbre, stilofetti, svg],
  scopes: [{ key: BONONIA_SCOPE, scopeKey: BONONIA_SCOPE, productionState: "current", editionScope: "Bononia fountain pen; resin colours and EF–BB steel nib options are variants, while rollerball and ballpoint remain separate writing-tool routes." }],
  claims: [
    claim("bononia-identity", "model_identity", "Tibaldi Bononia 是现代 Tibaldi 的独立树脂 fountain pen 型号；官方同页的 rollerball 与 ballpoint 不应混入本实体。", officialBononia.key, BONONIA_SCOPE, "official Bononia collection navigation"),
    claim("bononia-design", "design_language", "Bononia 以流线鱼雷形、三道帽环和带回形意味的夹子建立复古识别度；这是型号设计描述，不是历史同款证明。", pencilcase.key, BONONIA_SCOPE, "shape, cap bands and clip observations"),
    claim("bononia-material", "material", "独立评测与零售资料将 Bononia 样本写为树脂／丙烯酸构造；颜色纹理不能推断为赛璐珞或统一配方。", pencilcase.key, BONONIA_SCOPE, "resin/acrylic construction and colour sample"),
    claim("bononia-fill", "filling_system", "Penquisition 与 The Pencilcase Blog 都记录标准国际卡水／转换器路线；没有来源支持活塞、真空或 eyedropper 说法。", penquisition.key, BONONIA_SCOPE, "standard international cartridge/converter"),
    claim("bononia-nib", "nib", "Bora Bora 样本使用 #6 钢尖并记录 ebonite feed；Stilofetti 零售页列出 EF、F、M、B、BB 钢尖选项。", stilofetti.key, BONONIA_SCOPE, "steel nib options and ebonite conductor"),
    claim("bononia-size", "physical_specification", "不同样本给出约 146/129 mm、146.1/163.9 mm 或 146.3/128.6/146.6 mm；测量点和样本不同，页面不强行合并为单一尺寸。", penquisition.key, BONONIA_SCOPE, "Bora Bora dimensions and sample-boundary note"),
    claim("bononia-weight", "physical_specification", "The Pencilcase Blog 记录约 24 g，Penquisition 与 SBREBrown 记录约 23 g；重量按样本与测量口径呈现。", pencilcase.key, BONONIA_SCOPE, "independent sample weights"),
    claim("bononia-variants", "variant_boundary", "Rich Black、Seashell Mist、Martini Olive、Bora Bora 等是颜色／树脂批次，EF–BB 是尖幅选项，不自动生成平行型号。", officialBononia.key, BONONIA_SCOPE, "official colours and retailer nib menu"),
    claim("bononia-sample", "sample_boundary", "三家独立评测分别观察树脂、平衡、夹子、握位和钢尖；具体作者的顺滑或干湿判断不能泛化为所有批次。", pencilcase.key, BONONIA_SCOPE, "independent writing-sample boundary"),
    claim("bononia-care", "maintenance_guidance", "树脂笔身、钢尖、ebonite feed 和转换器用室温清水温和清洗，避免酒精、丙酮、漂白剂、热水和硬拧。", penquisition.key, BONONIA_SCOPE, "conservative care guidance", "editorial"),
    claim("bononia-buying", "selection_guidance", "选购先确认 fountain pen 与同名 rollerball/ballpoint 的类型，再核对颜色、EF–BB 尖幅、转换器、批次与授权渠道保修。", officialBononia.key, BONONIA_SCOPE, "product-type and colour navigation", "editorial"),
  ],
  variants: [
    { key: "bononia-colours", name: "Rich Black / Seashell Mist / Martini Olive / Bora Bora", notes: "官方与评测可见的颜色／树脂路线；库存和命名随市场与批次变化。", sourceKey: officialBononia.key, variantKind: "color", market: "global" },
    { key: "bononia-steel", name: "EF / F / M / B / BB steel nib", notes: "Stilofetti 零售页列出的钢尖字幅；不同市场库存可能不同。", sourceKey: stilofetti.key, variantKind: "nib", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE347_TIBALDI_BRAND_ID,
    values: {
      series_name: "Bononia",
      release_year: "官方当前产品导航可见；The Pencilcase Blog 为 2021 样本，Penquisition 为 2021 样本，不将评测日期当作唯一首发年份",
      origin_country: "意大利品牌语境；Bononia 页面未单独给出每个零件的工厂地址",
      nib: "#6 steel sample with ebonite feed；EF/F/M/B/BB options in professional retailer listing",
      fill_system: "Standard international cartridges / cartridge-converter",
      material: "Resin/acrylic body; colours and batches vary",
      dimensions: "Independent samples: approximately 146 mm capped and 129 mm uncapped; Bora Bora 146.1 mm capped / 163.9 mm posted",
      weight: "Approximately 23–24 g in independent samples",
      status: "Official Bononia collection navigation available; colours, nib stock and prices vary by market",
    },
    evidence: [
      evidence("bononia-brand", "brand_entity_id", officialBrand.key, "Tibaldi official brand context"),
      evidence("bononia-series", "series_name", officialBononia.key, "official Bononia collection"),
      evidence("bononia-release", "release_year", pencilcase.key, "dated 2021 review sample; no single launch-year assertion"),
      evidence("bononia-origin", "origin_country", officialBrand.key, "Italian brand context; model factory address not supplied"),
      evidence("bononia-nib-spec", "nib", stilofetti.key, "EF/F/M/B/BB steel nib menu and ebonite conductor"),
      evidence("bononia-fill-spec", "fill_system", penquisition.key, "standard international cartridge/converter"),
      evidence("bononia-material-spec", "material", pencilcase.key, "resin/acrylic construction"),
      evidence("bononia-dimensions", "dimensions", penquisition.key, "Bora Bora sample dimensions"),
      evidence("bononia-weight", "weight", pencilcase.key, "approximately 24 g sample"),
      evidence("bononia-status", "status", officialBononia.key, "current collection navigation"),
    ],
  },
  timeline: [{ key: "bononia-current", title: "Bononia 当代产品页与样本资料核对", eventType: "model_released", startDate: RETRIEVED, circa: false, description: "2026-08-02 可访问的官方产品导航与独立样本资料构成当前型号范围；不把评测日期当作首发年份。", sourceKey: officialBononia.key }],
  media: [{ key: "bononia-svg", title: "Tibaldi Bononia 树脂、帽环与供墨事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase347TibaldiBononiaPacks: CuratedEntityPack[] = [brand, model];
