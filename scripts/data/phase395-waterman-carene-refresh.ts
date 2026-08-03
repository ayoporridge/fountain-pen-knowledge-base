import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE50_CARENE_ID,
  PHASE50_WATERMAN_BRAND_ID,
  phase50WatermanCareneExpertPacks,
} from "./phase50-waterman-carene-expert";

export const PHASE395_WATERMAN_BRAND_ID = PHASE50_WATERMAN_BRAND_ID;
export const PHASE395_CARENE_ID = PHASE50_CARENE_ID;
export const PHASE395_CARENE_SLUG = "waterman-carene";
export const PHASE395_CARENE_NAME = "威迪文 Waterman Carène";

const RETRIEVED = "2026-08-03";
const SCOPE = "waterman-carene-phase395-current";

const baseModel = phase50WatermanCareneExpertPacks.find(
  (pack) => pack.entityId === PHASE395_CARENE_ID,
);
const baseBrand = phase50WatermanCareneExpertPacks.find(
  (pack) => pack.entityId === PHASE395_WATERMAN_BRAND_ID && pack.expectedType === "brand",
);
if (!baseModel || !baseBrand) throw new Error("Phase 395 Waterman Carène base pack missing.");
const sourceCatalog = baseModel.sources;

function source(
  previousKey: string | null,
  input: Omit<CuratedSource, "key" | "retrievedAt"> & { key: string },
): CuratedSource {
  const previous = previousKey
    ? sourceCatalog.find((candidate) => candidate.key === previousKey)
    : null;
  if (previous) {
    return { ...structuredClone(previous), ...input, retrievedAt: RETRIEVED };
  }
  return { ...input, retrievedAt: RETRIEVED };
}

const SOURCES = {
  collection: source("phase50-carene-official", {
    key: "phase395-waterman-carene-collection",
    registryKey: "waterman-official-current-carene",
    registryName: "Waterman official current Carène",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-current",
    title: "Waterman Carène luxury pens collection",
    url: "https://www.waterman.com/carene-pens.html",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "官方 Carène collection 说明 integrated nib、海洋线条、七种钢笔字幅，并将 fountain pen 与 rollerball、ballpoint 分开展示。",
    archiveUrl: "https://www.waterman.com/carene-pens.html",
    archiveLocator: "current Carène collection: unique nib design, finishes, seven nib sizes and writing-type boundary",
  }),
  product: source("phase50-carene-official", {
    key: "phase395-waterman-carene-blue-ct",
    registryKey: "waterman-official-blue-ct",
    registryName: "Waterman official Blue CT product",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-blue-ct",
    title: "Waterman Carène Fountain Pen Blue CT, item 2214210",
    url: "https://www.waterman.com/pens/car%C3%A8ne/car%C3%A8ne-fountain-pen/SAP_2214210.html",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "当前 Blue CT 商品页列 item 2214210、rhodium-coated 18K gold inset nib、deep-blue lacquer、palladium-coated clip/trims、brass with lacquer cap 和法国手工组装。",
    archiveUrl: "https://www.waterman.com/pens/car%C3%A8ne/car%C3%A8ne-fountain-pen/SAP_2214210.html",
    archiveLocator: "product details, item 2214210, nib, lacquer, brass cap and hand-assembled France statement",
  }),
  history: source("phase50-waterman-history", {
    key: "phase395-waterman-history",
    registryKey: "waterman-official-heritage",
    registryName: "Waterman official heritage",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-heritage",
    title: "Waterman Heritage timeline",
    url: "https://www.waterman.com/waterman-history.html",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "官方 heritage 页面把 Expert 放在 1990–92、Hémisphère 放在 1994、Carène 放在 1997，并说明 Carène 的 yachting/nautical 灵感。",
    archiveUrl: "https://www.waterman.com/waterman-history.html",
    archiveLocator: "official heritage timeline: 1997 Carène introduction and sibling model dates",
  }),
  support: source(null, {
    key: "phase395-waterman-filling-support",
    registryKey: "waterman-official-support",
    registryName: "Waterman official support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-support",
    title: "Waterman fountain pen ink filling instructions",
    url: "https://www.waterman.com/support?cfid=fountain-pen-ink-filling-instructions",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "官方支持页说明墨囊插入、converter 吸墨、笔尖浸没、回滴三滴、擦拭和冷水清洁前的操作边界。",
    archiveUrl: "https://www.waterman.com/support?cfid=fountain-pen-ink-filling-instructions",
    archiveLocator: "official cartridge/converter filling sequence and excess-ink wiping guidance",
  }),
  catalogue: source("phase50-waterman-catalogue-2021", {
    key: "phase395-waterman-catalogue-2021",
    registryKey: "waterman-official-catalogue",
    registryName: "Waterman official catalogue",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "waterman-official-catalogue",
    title: "Waterman 2021 Trade Catalogue",
    url: "https://assets.waterman.com/is/content/NewellRubbermaid/wtrmn_trdctlg_2021",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "官方目录把 Carène 与 Expert 分列，并提供 Carène 的 18K 尖、字幅和漆面/饰件语境，作为当前网页之外的档案交叉证据。",
    archiveUrl: "https://assets.waterman.com/is/content/NewellRubbermaid/wtrmn_trdctlg_2021",
    archiveLocator: "Carène collection, nib and finish catalogue pages",
  }),
  brochure: source("phase50-carene-2014-catalogue", {
    key: "phase395-waterman-brochure-2014",
    registryKey: "waterman-brochure-archive",
    registryName: "Waterman catalogue archive",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "waterman-brochure-archive",
    title: "Waterman 2014 brochure：Carène",
    url: "https://www.watermanromania.ro/cataloage1/Waterman/Waterman-2014Brochure.pdf",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary:
      "历史 brochure 把 Carène 写成 18-carat solid gold nib、嵌入式尖和游艇线条，并保留七种尖号的档案语境。",
    archiveUrl: "https://www.watermanromania.ro/cataloage1/Waterman/Waterman-2014Brochure.pdf",
    archiveLocator: "PDF pp.9-10: Carène solid-gold nib, integrated design and nautical inspiration",
  }),
  atlas: source("phase50-carene-professional", {
    key: "phase395-atlas-carene-black-sea",
    registryKey: "atlas-stationers-carene",
    registryName: "Atlas Stationers",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "atlas-stationers-carene",
    title: "Atlas Stationers：Waterman Carène Black Sea GT",
    url: "https://www.atlasstationers.com/products/waterman-carene-fountain-pen-black-sea-gold-trim",
    homepageUrl: "https://www.atlasstationers.com/",
    author: "Atlas Stationers",
    allowedUse: "summary_only",
    summary:
      "专业零售商把 Black Sea GT 具体 SKU 列为 18kt gold、cartridge/converter、约 5.6 英寸合帽、34 g 和 brass/lacquer；这些数字只绑定该饰面。",
    archiveUrl: "https://www.atlasstationers.com/products/waterman-carene-fountain-pen-black-sea-gold-trim",
    archiveLocator: "Black Sea GT SKU S0700300: filling, nib, dimensions, weight and material table",
  }),
  tenpen: source("phase50-carene-tenpen", {
    key: "phase395-tenpen-carene",
    registryKey: "tenpen-carene",
    registryName: "Tenpen",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "tenpen-carene",
    title: "Tenpen：Waterman Carène history",
    url: "https://www.tenpen.it/node/1695",
    homepageUrl: "https://www.tenpen.it/",
    author: "Tenpen",
    allowedUse: "summary_only",
    summary:
      "专业钢笔资料将 Carène 放在 1997–98 的海洋设计语境中，用于家族关系和历史版本边界，不替代官方规格。",
    archiveUrl: "https://www.tenpen.it/node/1695",
    archiveLocator: "Carène launch period, nautical design and Waterman family context",
  }),
  svg: source("phase50-carene-svg", {
    key: "phase395-waterman-carene-svg",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "Waterman Carène 事实卡（本站原创示意图）",
    url: "/images/library/site-original/waterman-carene-expert/waterman-carene.svg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    allowedUse: "store_full",
    license: "site-original",
    summary:
      "本站原创 factual SVG 表达 1997、海洋线条、嵌入式 18K 尖、C/C 和 GT/ST 饰件边界；示意图，非产品照片。",
    archiveUrl: "/images/library/site-original/waterman-carene-expert/waterman-carene.svg",
    archiveLocator: "project-public-asset:/images/library/site-original/waterman-carene-expert/waterman-carene.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900",
  }),
};

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceItem: CuratedSource,
  locator: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey: sourceItem.key,
    locator,
    evidence: [{
      key: `${key}-evidence`,
      sourceKey: sourceItem.key,
      scopeKey: SCOPE,
      locator,
    }],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceItem: CuratedSource,
  locator: string,
): CuratedSpecEvidence {
  return {
    key,
    fieldKey,
    sourceKey: sourceItem.key,
    scopeKey: SCOPE,
    locator,
    qualifies: true,
  };
}

const carene: CuratedEntityPack = {
  key: "phase395-waterman-carene-refresh-v1",
  entityId: PHASE395_CARENE_ID,
  expectedType: "pen",
  expectedSlug: PHASE395_CARENE_SLUG,
  canonicalName: PHASE395_CARENE_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/waterman-carene-phase395.md",
  storyTitle: "Waterman Carène：从 1997 海洋线条到今天的嵌入式 18K 尖",
  primarySourceKey: SOURCES.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Waterman Carène", language: "en", sourceKey: SOURCES.collection.key },
    { alias: "Waterman Carene", language: "en", sourceKey: SOURCES.collection.key },
    { alias: "威迪文 Carène", language: "zh", sourceKey: SOURCES.collection.key },
    { alias: "威迪文 海韵", language: "zh", sourceKey: SOURCES.history.key },
    { alias: "Carène Fountain Pen", language: "en", sourceKey: SOURCES.product.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [{
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "current",
    market: "Waterman current Carène collection, current Blue CT item 2214210 and historical/retail comparison",
    nibScope: "integrated/inset 18K gold nib; official collection says seven sizes, actual availability by SKU",
    materialScope: "lacquer and metal trims; Blue CT item 2214210 brass/lacquer cap, palladium trims and black resin shell",
    editionScope: "Carène fountain pen family; Black Sea, Marine Amber, Blue, Deluxe and thematic names are finish/market records",
  }],
  claims: [
    claim(`${SCOPE}-identity`, "model_identity", "Waterman Carène 是官方当前 collection 中的具体 fountain-pen family；当前 Blue CT 商品号为 2214210，不能与同名 rollerball 或 ballpoint 混写。", SOURCES.product, "official product writing type and item 2214210"),
    claim(`${SCOPE}-history`, "release_history", "Waterman Heritage 将 Carène 的进入年份列为 1997，并说其线条受 nautical codes 和 yachting world 启发。", SOURCES.history, "official heritage 1997 Carène entry"),
    claim(`${SCOPE}-nib`, "nib_design", "官方 collection 将 Carène 的尖描述为 integrated nib，当前 Blue CT 页写 rhodium-coated 18K gold Inset nib，并称 collection 提供七种钢笔字幅。", SOURCES.collection, "current collection nib design and seven nib sizes"),
    claim(`${SCOPE}-product-nib`, "sku_nib_boundary", "Blue CT item 2214210 的具体规格是 rhodium-coated 18K gold Inset nib；这条 SKU 证据不能自动覆盖每个历史或主题款的刻字和尖宽。", SOURCES.product, "Blue CT product features and specifications"),
    claim(`${SCOPE}-material`, "material_and_finish", "当前 Blue CT 商品页列深蓝 lacquer cap/barrel、palladium-coated clip/trims、black resin shell 和 brass with lacquer cap；Black Sea GT 等饰面按各自 SKU 记录。", SOURCES.product, "Blue CT material and finish details"),
    claim(`${SCOPE}-assembly`, "manufacturing_boundary", "当前 Carène 商品页称每支精品笔在法国制作，并具体写 hand-assembled at Waterman Centre of Excellence in France；这不替历史个体推断每个部件的工厂。", SOURCES.product, "official crafted/hand-assembled in France wording"),
    claim(`${SCOPE}-filling`, "filling_system", "Carène fountain pen 使用 Waterman cartridge/converter；官方支持页分别说明墨囊插入和 converter 吸墨、回滴三滴与擦拭步骤。", SOURCES.support, "official cartridge and converter filling instructions"),
    claim(`${SCOPE}-sizes`, "nib_size_boundary", "官方当前 collection 说 Carène 钢笔有七种 nib sizes；2014 brochure 与历史目录可补充 EF/F/M/B/Stub/OF/OB 语境，当前可购字幅仍需按地区商品页核对。", SOURCES.brochure, "official brochure nib and Carène section, bounded by current collection"),
    claim(`${SCOPE}-retail-reference`, "variant_measurement", "Atlas Stationers 的 Black Sea GT S0700300 记录合帽约 5.6 英寸、无帽 5.0 英寸、后套 5.8 英寸、34 g、brass/lacquer 和 cartridge/converter；这些是该零售 SKU 的参考，不是全系列统一值。", SOURCES.atlas, "Black Sea GT product specification table"),
    claim(`${SCOPE}-family-boundary`, "sibling_boundary", "Carène 与 Expert、Hémisphère、Allure 同在 Waterman Pens 导航但不共享尖和上墨；Carène 的海洋线条和 18K inset nib 不能回填到其他系列。", SOURCES.history, "official heritage sibling dates and current pens navigation"),
    claim(`${SCOPE}-care`, "maintenance_guidance", "官方支持页建议用冷水清洁、擦去尖和握位外侧残墨；不要把热水、酒精、溶剂或撬动嵌入式尖片写成标准维护。", SOURCES.support, "official filling cleanup and safe handling boundary"),
    claim(`${SCOPE}-market`, "market_edition_boundary", "Black Sea、Marine Amber、Blue CT、Deluxe、L'Essence du Bleu、Opéra 和 Reflections of Paris 先记录为 Carène 家族的颜色、饰面、主题或礼盒 SKU，只有来源证明结构变化时才另立型号。", SOURCES.collection, "official Carène finishes and full collection links"),
    claim(`${SCOPE}-media`, "media_identity_boundary", "本站原创 SVG 只表达海洋线条、嵌入式 18K 尖、C/C 和 GT/ST 饰件边界；它是示意图，不是具体 Carène 产品照片、比例图或颜色校样。", SOURCES.svg, "site-original factual SVG attribution and non-photo boundary", "editorial"),
  ],
  variants: [
    { key: `${SCOPE}-blue-ct`, name: "Blue Fountain Pen CT（item 2214210）", releaseYear: "现行官网 SKU", notes: "深蓝 lacquer、palladium-coated two-prong clip/trims、black resin shell；官方页列 rhodium-coated 18K Inset nib。", sourceKey: SOURCES.product.key, variantKind: "market_sku", productCode: "2214210", market: "Waterman UK current product page" },
    { key: `${SCOPE}-black-sea-gt`, name: "Black Sea Fountain Pen GT（S0700300）", releaseYear: "当前/历史零售 SKU", notes: "Atlas Stationers 的具体 Black Sea GT 记录；18kt gold、brass/lacquer、34 g 和 C/C 只绑定此样本。", sourceKey: SOURCES.atlas.key, variantKind: "market_sku", productCode: "S0700300", market: "Atlas Stationers US listing" },
    { key: `${SCOPE}-finish-family`, name: "Marine Amber、Deluxe 与主题饰面", releaseYear: "现行与历史多代", notes: "官方 collection 入口；颜色、饰件、礼盒、库存和是否停产按商品号分别核对。", sourceKey: SOURCES.collection.key, variantKind: "edition_group", market: "Waterman current collection" },
    { key: `${SCOPE}-nib-seven`, name: "Carène seven nib sizes", releaseYear: "collection-level offering", notes: "官方当前页说七种字幅；EF/F/M/B/Stub/OF/OB 由历史目录补充为档案语境，不承诺所有市场同时在售。", sourceKey: SOURCES.brochure.key, variantKind: "nib", market: "Waterman collection and catalogue archive" },
  ],
  spec: {
    brandEntityId: PHASE395_WATERMAN_BRAND_ID,
    values: {
      series_name: "Waterman Carène",
      release_year: "1997",
      origin_country: "Waterman Paris 产品线；当前 Blue CT 页称在法国手工组装，具体 SKU 以包装和商品号核对",
      nib: "integrated/inset 18K gold；当前 Blue CT 为 rhodium-coated 18K gold，collection 说七种字幅",
      fill_system: "Waterman cartridge/converter",
      material: "漆面与金属饰件；Blue CT 2214210 为 brass with lacquer cap、palladium-coated trims、black resin shell",
      dimensions: "Black Sea GT S0700300 零售参考：合帽约 5.6 in、无帽 5.0 in、后套 5.8 in、34 g；不覆盖全系",
      status: "现行 Carène fountain-pen collection 与历史/地区饰面并存；rollerball/ballpoint 分列",
    },
    evidence: [
      evidence(`${SCOPE}-brand`, "brand_entity_id", SOURCES.product, "Waterman official product maker context"),
      evidence(`${SCOPE}-series`, "series_name", SOURCES.collection, "official current Carène collection title"),
      evidence(`${SCOPE}-release`, "release_year", SOURCES.history, "official 1997 heritage entry"),
      evidence(`${SCOPE}-origin`, "origin_country", SOURCES.product, "official hand-assembled France statement"),
      evidence(`${SCOPE}-nib`, "nib", SOURCES.product, "Blue CT 2214210 Inset nib and 18K details"),
      evidence(`${SCOPE}-fill`, "fill_system", SOURCES.support, "official cartridge/converter steps"),
      evidence(`${SCOPE}-material`, "material", SOURCES.product, "Blue CT lacquer, brass, palladium and resin fields"),
      evidence(`${SCOPE}-dimensions`, "dimensions", SOURCES.atlas, "Black Sea GT sample dimensions and weight"),
      evidence(`${SCOPE}-status`, "status", SOURCES.collection, "current finishes and writing-type separation"),
    ],
  },
  media: [{
    key: `${SCOPE}-primary-media`,
    title: "Waterman Carène 事实卡（非产品照片）",
    sourceKey: SOURCES.svg.key,
    localPath: SOURCES.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影，不表现真实比例、颜色校样、Logo 或刻字。",
    sourceUrl: SOURCES.svg.url,
    usageStatus: "primary",
  }],
  timeline: [{
    key: `${SCOPE}-release-event`,
    title: "Carène 进入 Waterman 品牌历史",
    eventType: "model_released",
    startDate: "1997",
    circa: false,
    description: "Waterman Heritage 官方时间线把 Carène 放在 1997 年，并说明其海洋与游艇设计灵感。",
    sourceKey: SOURCES.history.key,
  }],
  conflicts: [],
};

const watermanBrand: CuratedEntityPack = structuredClone(baseBrand);
watermanBrand.key = "phase395-waterman-brand-v1";

export const phase395WatermanCareneRefreshPacks: CuratedEntityPack[] = [
  watermanBrand,
  carene,
];
