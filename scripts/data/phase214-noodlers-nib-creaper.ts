import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-25";
export const PHASE214_NOODLERS_BRAND_ID = "9gaEROr1PX3t";
export const PHASE214_NIB_CREAPER_ID = "dLplUlM5weWq";
export const PHASE214_OLD_SLUG = "noodler鲶鱼-简易钢笔";
export const PHASE214_CANONICAL_SLUG = "noodlers-nib-creaper";
export const PHASE214_SOURCE_KEY = "phase214-noodlers-nib-creaper";

function live(input: {
  key: string;
  title: string;
  url: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
  independenceGroup?: string;
}): CuratedSource {
  return {
    ...input,
    registryKey: `${input.key}-registry`,
    independenceGroup: input.independenceGroup ?? `${input.key}-group`,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase214",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase214",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片，不证明真实比例、颜色、树脂配方、内腔、Logo、编号或生产批次。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true`,
  };
}

const S = {
  officialCatalog: live({
    key: "phase214-noodlers-official-standard-flex",
    title: "Noodler's Ink：Standard Flex Nibs 产品目录",
    url: "https://noodlersink.com/product-category/pens/standard-flex-nibs-pens/",
    registryName: "Noodler's Ink",
    sourceType: "official",
    tier: "primary",
    summary: "品牌官网将 Standard Creaper Series 和 Standard Flex Nibs 单列，并区分 Ahab、Konrad、Neponset 等其它书写工具产品线。",
    locator: "Standard Creaper Series heading; Standard Flex Nibs category; separate Ahab/Konrad/Neponset categories",
    independenceGroup: "noodlers-official-catalog",
  }),
  officialClear: live({
    key: "phase214-noodlers-official-17000",
    title: "Noodler's Ink：17000 Clear Piston Std Flex",
    url: "https://noodlersink.com/product/17000-clear-piston-std-flex/",
    registryName: "Noodler's Ink",
    sourceType: "official",
    tier: "contemporary_archive",
    summary: "官方 SKU 页确认 17000 Clear Piston Std Flex、Standard Flex 分类、价格和 Clear demonstrator 产品命名。",
    locator: "17000 Clear Piston Std Flex title, SKU 17000 and Standard Flex group",
    independenceGroup: "noodlers-official-product-pages",
  }),
  officialNib: live({
    key: "phase214-noodlers-official-18090",
    title: "Noodler's Ink：18090 Replacement Creaper Flexible Nib",
    url: "https://noodlersink.com/product/18090-replacement-creaper-flexible-nib/",
    registryName: "Noodler's Ink",
    sourceType: "official",
    tier: "contemporary_archive",
    summary: "官方零件页确认 Replacement Creaper Flexible Nib 的名称，并把它与 Ahab/Konrad 的替换件分开列出。",
    locator: "18090 Replacement Creaper Flexible Nib title and related replacement-part boundary",
    independenceGroup: "noodlers-official-product-pages",
  }),
  retailer: live({
    key: "phase214-noodlers-central-art",
    title: "Central Art Supply：Noodler's Nib Creaper Flex Fountain Pen",
    url: "https://www.centralartsupply.com/shop/c/p/NOODLERS-NIB-CREAPER-FLEX-FOUNTAIN-PEN---CLEAR-x82022346.htm",
    registryName: "Central Art Supply",
    sourceType: "retailer",
    tier: "retailer",
    summary: "零售页给出 Clear 样本的 #2 钢制柔性尖、旋转活塞、墨窗、植物来源树脂和首次使用前冲洗提示，并明确写 Nib Creaper 也称 Standard Flex Pen。",
    locator: "product description: small slender body, steel flexible #2 nib, twist piston, ink window, celluloid derivative, first-use flush",
  }),
  review: live({
    key: "phase214-noodlers-art-supply-critic",
    title: "Art Supply Critic：Noodler's Nib Creeper Flex Pen review",
    url: "https://artsupplycritic.com/2013/07/05/review-noodlers-nib-creeper-flex-pen/",
    registryName: "Art Supply Critic / Austin Smith",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立评测记录黑色样本的旋转笔夹、半透明墨窗、活塞、可抽出的 nib/feed、需要压力的 flex 和可能 railroading 的个体体验。",
    locator: "2013 review: piston, ink windows, friction-fit nib/feed, flex pressure and sample-specific railroading",
  }),
  fpn: live({
    key: "phase214-noodlers-fpn",
    title: "Fountain Pen Network：Noodler's Nib Creaper with Flex Nib",
    url: "https://www.fountainpennetwork.com/forum/topic/183002-noodlers-nib-creaper-with-flex-nib/",
    registryName: "Fountain Pen Network participants",
    sourceType: "forum",
    tier: "community",
    summary: "社区长评补充小型笔身、活塞密封可维护和纸张／墨水影响等使用线索，仅作为单支体验旁证。",
    locator: "2011 Nib Creaper review: small body, piston seal service, paper and flow observations",
  }),
  brandSvg: diagram("phase214-noodlers-brand-svg", "Noodler's 钢笔产品线边界示意", "/images/library/site-original/phase214/noodlers/noodlers-brand.svg"),
  modelSvg: diagram("phase214-noodlers-nib-creaper-svg", "Noodler's Nib Creaper 结构示意", "/images/library/site-original/phase214/noodlers/nib-creaper.svg"),
} as const;

const brandScope = "noodlers-brand-scope";
const modelScope = "noodlers-nib-creaper-scope";

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  extra: string[] = [],
): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence: 0.9,
    sourceKey,
    locator,
    evidence: [sourceKey, ...extra].map((evidenceSource, index) => ({
      key: `${key}-evidence-${index + 1}`,
      sourceKey: evidenceSource,
      scopeKey,
      locator,
    })),
  };
}

function specEvidence(
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `noodlers-nib-creaper-${fieldKey}`, fieldKey, sourceKey, scopeKey: modelScope, locator };
}

const brand: CuratedEntityPack = {
  key: "phase214-noodlers-brand",
  entityId: PHASE214_NOODLERS_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "noodlers",
  canonicalName: "Noodler's",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/noodlers-brand-phase214.md",
  storyTitle: "Noodler's：从墨水品牌到可调校钢笔产品线",
  primarySourceKey: S.officialCatalog.key,
  depthTier: "B",
  aliases: [
    { alias: "Noodler's", language: "en", sourceKey: S.officialCatalog.key },
    { alias: "Noodler's Ink", language: "en", sourceKey: S.officialCatalog.key },
    { alias: "Noodler", language: "en", sourceKey: S.officialCatalog.key },
    { alias: "鲶鱼钢笔品牌", language: "zh", sourceKey: S.retailer.key },
  ],
  sources: [S.officialCatalog, S.officialClear, S.officialNib, S.retailer, S.review, S.fpn, S.brandSvg],
  scopes: [{
    key: brandScope,
    scopeKey: brandScope,
    productionState: "current",
    editionScope: "Noodler's 品牌入口；Standard Flex／Creaper、Ahab、Konrad、Neponset 等产品线按各自型号和 SKU 分层。",
  }],
  claims: [
    claim("noodlers-product-lines", "brand_navigation", "官方书写工具目录把 Standard Flex／Creaper、Ahab、Konrad、Neponset、Boston Safety 和 Triple Tail 分成不同产品线，不能用一个简易钢笔总称替代它们。", S.officialCatalog.key, brandScope, "official writing-instrument category boundary"),
    claim("noodlers-standard-flex", "brand_model_family", "Standard Creaper Series 位于 Standard Flex Nibs 分类；17000 Clear Piston Std Flex 与 18090 Replacement Creaper Flexible Nib 提供了型号和零件层的明确入口。", S.officialCatalog.key, brandScope, "Standard Creaper Series, 17000 and 18090 official entries", [S.officialClear.key, S.officialNib.key]),
    claim("noodlers-tuning", "design_positioning", "Noodler's 钢笔产品把可清洁、可拆出 nib/feed 和可调校出墨作为使用语境；这不是每一支笔都开箱即写或全部样本参数相同的保证。", S.retailer.key, brandScope, "hands-on tinkerer and pull-out nib/feed description", [S.review.key]),
    claim("noodlers-material-boundary", "material_boundary", "零售资料可支持部分 Nib Creaper 样本使用植物来源树脂／celluloid derivative，但不能由此推断所有颜色、年份和 Noodler's 型号的统一树脂配方。", S.retailer.key, brandScope, "celluloid derivative and vegetal resin wording", [S.review.key]),
    claim("noodlers-flex-boundary", "nib_boundary", "Standard Flex 的钢尖、slit、feed、墨水和纸张共同影响线宽与出墨；Ahab、Konrad 等虽有 flex 讨论，仍是独立型号线。", S.review.key, brandScope, "sample-specific flex and railroading boundary", [S.officialCatalog.key]),
    claim("noodlers-care", "maintenance_guidance", "新笔先清水冲洗并低压力试写；可调校不等于可以随意使用溶剂、热水或工具强拆，异常应按卖家和具体型号说明处理。", S.retailer.key, brandScope, "first-use flushing and conservative adjustment boundary", [S.fpn.key]),
    claim("noodlers-selection", "selection_guidance", "选购应先确认产品线、颜色或 SKU、笔尖和供墨方式；中文“鲶鱼简易钢笔”只能作为历史 alias，不能代替具体型号身份。", S.officialCatalog.key, brandScope, "category and SKU selection boundary", [S.retailer.key]),
  ],
  variants: [
    { key: "noodlers-standard-flex", name: "Standard Flex／Creaper 产品线", notes: "Standard Flex Nibs 官方分类下的品牌型号族；颜色和 SKU 继续在具体型号页分层。", sourceKey: S.officialCatalog.key, variantKind: "edition_group" },
    { key: "noodlers-ahab", name: "Ahab Flex 产品线", notes: "官方独立产品分类；不把 Ahab 的笔身、供墨或图片移到 Nib Creaper。", sourceKey: S.officialCatalog.key, variantKind: "edition_group" },
    { key: "noodlers-konrad", name: "Konrad 产品线", notes: "官方独立产品分类；后续按 Acrylic、Rollerball 等具体线继续拆分。", sourceKey: S.officialCatalog.key, variantKind: "edition_group" },
  ],
  media: [{ key: "noodlers-brand-primary", title: S.brandSvg.title, sourceKey: S.brandSvg.key, localPath: S.brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；品牌导航示意，非产品照片，不代表真实比例、颜色、Logo、组织结构或生产批次。", sourceUrl: S.brandSvg.url, usageStatus: "primary" }],
  timeline: [
    { key: "noodlers-standard-flex-window", title: "Standard Creaper／Standard Flex 成为官方钢笔产品线", eventType: "model_released", startDate: "2010", circa: true, description: "Central Art Supply 的 Nib Creaper 页面将 2010 年写为 Nib Creaper 首次推出的时间点；官方目录当前仍把 Standard Flex Nibs 单独列出。", sourceKey: S.retailer.key },
    { key: "noodlers-current-catalog", title: "官方目录继续区分 Standard Flex 与其它钢笔线", eventType: "design_milestone", startDate: "2026", circa: true, description: "截至本包检索日，Noodler's 官方目录同时列 Standard Flex、Ahab、Konrad、Neponset 等写字工具分类。", sourceKey: S.officialCatalog.key },
  ],
};

const model: CuratedEntityPack = {
  key: PHASE214_SOURCE_KEY,
  entityId: PHASE214_NIB_CREAPER_ID,
  expectedType: "pen",
  expectedSlug: PHASE214_CANONICAL_SLUG,
  canonicalName: "Noodler's Nib Creaper",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/noodlers-nib-creaper-phase214.md",
  storyTitle: "Noodler's Nib Creaper：Standard Flex 的活塞、墨窗与可调校尖",
  primarySourceKey: S.officialClear.key,
  depthTier: "B",
  aliases: [
    { alias: "Noodler's Nib Creaper", language: "en", sourceKey: S.retailer.key },
    { alias: "Noodler's Nib Creeper", language: "en", sourceKey: S.review.key },
    { alias: "Noodler's Standard Flex Pen", language: "en", sourceKey: S.retailer.key },
    { alias: "Noodler's 简易钢笔", language: "zh", sourceKey: S.retailer.key },
    { alias: "鲶鱼简易钢笔", language: "zh", sourceKey: S.retailer.key },
  ],
  sources: [S.officialCatalog, S.officialClear, S.officialNib, S.retailer, S.review, S.fpn, S.modelSvg],
  scopes: [{
    key: modelScope,
    scopeKey: modelScope,
    productionState: "current",
    materialScope: "Nib Creaper／Standard Flex；Clear、Black 与彩色树脂 SKU 按具体来源和批次核对。",
    editionScope: "不覆盖 Ahab、Konrad、Charlie、Neponset 或其它 Noodler's 型号；17000 Clear 是官方 SKU 样本。",
  }],
  claims: [
    claim("nib-creaper-identity", "model_identity", "Noodler's Nib Creaper 也称 Standard Flex Pen；原中文“鲶鱼简易钢笔”是混合称呼，不能同时指代 Ahab、Konrad、Charlie 等不同型号。", S.retailer.key, modelScope, "Nib Creaper and Standard Flex Pen naming", [S.officialCatalog.key]),
    claim("nib-creaper-filling", "filling_system", "公开产品资料记录旋转活塞和可见余墨的墨窗；具体活塞密封、行程和颜色批次应以实物核对。", S.retailer.key, modelScope, "twist piston and small ink window", [S.review.key]),
    claim("nib-creaper-nib", "nib_boundary", "Clear 样本使用钢制 #2 flexible nib；官方 18090 页面另列 Replacement Creaper Flexible Nib，替换件不是第二个钢笔型号。", S.retailer.key, modelScope, "steel flexible #2 nib", [S.officialNib.key]),
    claim("nib-creaper-feed", "adjustability", "nib 和 feed 以 friction-fit 方式安装，资料称用户可以抽出、清洁和调整出墨；调校结果受样本、墨水、纸张和速度影响。", S.retailer.key, modelScope, "pull-out nib/feed and hands-on adjustment", [S.review.key]),
    claim("nib-creaper-material", "material_boundary", "零售资料将笔身描述为植物来源树脂／celluloid derivative，并提醒 demonstrator 与亮色可能出现颗粒或条纹；不将此写成所有年份的统一材料配方。", S.retailer.key, modelScope, "vegetal resin and visible particles/striations", [S.review.key]),
    claim("nib-creaper-flex", "writing_character", "flex 需要轻到中等压力和慢速下行笔画；独立评测记录过需要压力和样本 railroading，不能承诺古董柔尖级别的线宽。", S.review.key, modelScope, "sample-specific pressure and railroading", [S.fpn.key]),
    claim("nib-creaper-care", "maintenance_guidance", "首次灌墨前应充分冲洗以去除可能的加工油；换墨时清洁活塞、墨窗和 nib/feed，避免未经确认的溶剂、热水或强拆。", S.retailer.key, modelScope, "first-use flushing and cleaning options", [S.fpn.key]),
    claim("nib-creaper-selection", "selection_guidance", "购买时核对颜色／SKU、柔性尖、活塞密封和树脂状态；Standard Flex、Ahab、Konrad 的相似营销词不能替代 Nib Creaper 的精确身份。", S.officialClear.key, modelScope, "17000 Clear SKU and product-family boundary", [S.officialCatalog.key, S.retailer.key]),
  ],
  variants: [
    { key: "nib-creaper-clear-17000", name: "17000 Clear Piston Std Flex", notes: "官方 SKU 的 Clear demonstrator 样本；透明度、颗粒和条纹按具体实物核对。", sourceKey: S.officialClear.key, variantKind: "color", productCode: "17000" },
    { key: "nib-creaper-standard-flex-colors", name: "Standard Flex 彩色树脂 SKU", notes: "官方目录列多个颜色／SKU；颜色不是独立机械型号，实拍图不得跨色复用。", sourceKey: S.officialCatalog.key, variantKind: "color" },
  ],
  spec: {
    brandEntityId: PHASE214_NOODLERS_BRAND_ID,
    values: {
      series_name: "Standard Flex／Creaper Series",
      release_year: "2010（零售页标注的 Nib Creaper 首次推出时间；不覆盖每个颜色 SKU）",
      origin_country: "美国品牌产品线语境；具体制造地点未由本包来源核实",
      nib: "钢制 #2 flexible nib；实际线宽和调校按单支",
      fill_system: "旋转活塞式，带小型墨窗",
      material: "植物来源树脂／celluloid derivative；颜色与透明度按 SKU",
      dimensions: "小型、偏细笔身；官方未给统一全系列尺寸",
      weight: "官方与本包零售页未给统一全系列重量",
      price_range: "官方 17000 Clear SKU 页面检索价 $16.10；价格随时间、颜色和地区变化",
      status: "官方 Standard Flex Nibs 目录中的现行／可见 SKU；库存和颜色随时间变化",
    },
    evidence: [
      specEvidence("brand_entity_id", S.officialCatalog.key, "Noodler's official Standard Flex category"),
      specEvidence("series_name", S.officialCatalog.key, "Standard Creaper Series heading"),
      specEvidence("release_year", S.retailer.key, "Central Art Supply page states introduced in 2010"),
      specEvidence("origin_country", S.officialCatalog.key, "brand product context only; manufacturing location not asserted"),
      specEvidence("nib", S.retailer.key, "steel flexible #2 nib"),
      specEvidence("fill_system", S.retailer.key, "twist piston mechanism and ink window"),
      specEvidence("material", S.retailer.key, "vegetal resin/celluloid derivative description"),
      specEvidence("dimensions", S.review.key, "small and slender sample; no universal dimension asserted"),
      specEvidence("weight", S.retailer.key, "no universal weight stated on product page"),
      specEvidence("price_range", S.officialClear.key, "official 17000 SKU price observed on retrieved page"),
      specEvidence("status", S.officialCatalog.key, "current Standard Flex category and SKU listing"),
    ],
  },
  media: [{ key: "nib-creaper-primary", title: S.modelSvg.title, sourceKey: S.modelSvg.key, localPath: S.modelSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；结构示意，非产品照片，不代表真实比例、颜色、内腔、Logo、编号或生产批次。", sourceUrl: S.modelSvg.url, usageStatus: "primary" }],
  timeline: [{ key: "nib-creaper-introduced", title: "Nib Creaper／Standard Flex 进入公开产品语境", eventType: "model_released", startDate: "2010", circa: true, description: "Central Art Supply 的具体产品页将 2010 年写为 Nib Creaper 首次推出时间；官方目录当前继续使用 Standard Creaper／Standard Flex 分类。", sourceKey: S.retailer.key }],
};

export const phase214NoodlersNibCreaperPacks: CuratedEntityPack[] = [brand, model];
