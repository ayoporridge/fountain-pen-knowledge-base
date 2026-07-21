import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE108_PILOT_ID = "Zt-PbXkE7UHM";
export const PHASE108_HERITAGE_91_ID = "NpJibLHczSl9";
export const PHASE108_HERITAGE_92_ID = "-Oa7pDNi4UnI";
export const PHASE108_HERITAGE_91_RAW_SLUG = "百乐-pilot-heritage-91";
export const PHASE108_HERITAGE_92_RAW_SLUG = "百乐-pilot-heritage-92";
export const PHASE108_HERITAGE_91_SLUG = "pilot-custom-heritage-91";
export const PHASE108_HERITAGE_92_SLUG = "pilot-custom-heritage-92";

const RETRIEVED = "2026-07-21";
const SCOPE_91_CURRENT = "phase108-heritage-91-current";
const SCOPE_91_PRICE = "phase108-heritage-91-historical-price-2025-10";
const SCOPE_92_CURRENT = "phase108-heritage-92-current";
const SCOPE_92_PRICE = "phase108-heritage-92-historical-price-2025-10";
const SVG_91 =
  "/images/library/site-original/phase108/pilot/pilot-custom-heritage-91.svg";
const SVG_92 =
  "/images/library/site-original/phase108/pilot/pilot-custom-heritage-92.svg";

function liveSource(
  input: Omit<
    CuratedSource,
    "retrievedAt" | "allowedUse" | "homepageUrl" | "archiveUrl" | "archiveLocator"
  > & { locator: string },
): CuratedSource {
  const { locator, ...source } = input;
  return {
    ...source,
    homepageUrl: new URL(source.url).origin,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: source.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};http=200;readable=true;external_archive=false;locator=${locator}`,
  };
}

function editorialSvg(
  key: string,
  title: string,
  url: string,
): CuratedSource {
  return {
    key,
    registryKey: `fountain-pen-graph-editorial-${key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-${key}`,
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "本站原创 factual SVG；示意图，非产品照片。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;sku-replica=false;dimensions=1600x900`,
  };
}

const SOURCES_91 = {
  lineup: liveSource({
    key: "phase108-91-pilot-heritage-lineup",
    registryKey: "pilot-custom-official-phase108-91",
    registryName: "PILOT Custom official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-official",
    title: "Simple designs that transcend generations CUSTOM HERITAGE Series",
    url: "https://www.pilot-custom.jp/en/lineup/heritage.html",
    summary:
      "当前 Heritage lineup 将 91 锁定为 FKVHN-12SR、14K No.5，并列出九种尖型与银色调设计。",
    locator:
      "live lines 73-86: CUSTOM HERITAGE 91 heading, FKVHN-12SR, 14K No.5, EF/F/SF/FM/SFM/M/SM/B/BB and product-information link",
  }),
  history: liveSource({
    key: "phase108-91-pilot-custom-history",
    registryKey: "pilot-custom-history-phase108-91",
    registryName: "PILOT Custom official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-official",
    title: "CUSTOM Series: Continuing to serve all styles of handwriting",
    url: "https://www.pilot-custom.jp/en/history/",
    summary:
      "Pilot 官方 Custom 系列史将 Custom Heritage 91 置于 2009，并给出当时 FKVH-1MR 与银色铑饰设计背景。",
    locator:
      "live history section 2009 / CUSTOM HERITAGE91 / FKVH-1MR; rhodium-finished clips and nibs, silver-tone simplified body design",
  }),
  catalog: liveSource({
    key: "phase108-91-pilot-webcatalog",
    registryKey: "pilot-webcatalog-phase108-91",
    registryName: "PILOT web catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-official",
    title: "FKVHN-12SR-BF｜カスタムヘリテイジ91｜PILOTウェブカタログ",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000257&volumeName=00004",
    summary:
      "当前目录页给出 FKVHN-12SR-BF、14K No.5、树脂轴帽、CON-40/CON-70N、137 mm、15.7 g。",
    locator:
      "live lines 17-26 title/product code; lines 32-60 product features and spec table including 14K No.5, resin, CON-40/CON-70N, dimensions and weight",
  }),
  care: liveSource({
    key: "phase108-91-pilot-warranty-care",
    registryKey: "pilot-warranty-phase108-91",
    registryName: "PILOT International Warranty",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-official",
    title: "CUSTOM HERITAGE 91 | International Warranty | PILOT",
    url: "https://www.pilot.co.jp/support/warranty/en/fountain/custom_heritage91.html",
    summary:
      "官方支持页绑定 FKVHN-12SR，并提供 cartridge/converter 钢笔的使用、清洁与安全边界。",
    locator:
      "page title and covered product FKVHN-12SR; use-and-care cartridge/converter compatibility and cleaning/care sections",
  }),
  price: liveSource({
    key: "phase108-91-pilot-price-2025-10",
    registryKey: "pilot-price-notice-2025-10-phase108-91",
    registryName: "PILOT price revision notice",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-official",
    title: "価格表 2025年10月1日付",
    url: "https://www.pilot.co.jp/information/2025.10%20price_list.pdf",
    itemType: "pdf",
    publishedAt: "2025-08-01",
    summary:
      "历史价格文件：FKVHN12SR 自 2025-10-01 的日本小售基准价为 27,500 日元；不代表 2026 当前价。",
    locator:
      "PDF page 1 (viewer P0), fountain-pen table line 15: カスタムヘリテイジ91 / FKVHN12SR / 22,000円 -> 27,500円; effective 2025-10-01 only",
  }),
  review: liveSource({
    key: "phase108-91-scrively-review",
    registryKey: "scrively-heritage-91-phase108",
    registryName: "Scrively",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "scrively",
    title: "Video-Review: Pilot Custom Heritage 91",
    url: "https://scrively.org/video-review-pilot-custom-heritage-91/",
    author: "Scrively",
    publishedAt: "2026-05-10",
    summary:
      "独立实测记录橙色样本、铑色 14K 尖与 c/c 结构；软尖响应只归因作者样本，明确不泛化为 flex。",
    locator:
      "live lines 38-57: title/date, reviewed orange sample, rhodium 14K nib, cartridge/converter, soft-nib response and explicit 'not a flex pen' boundary",
  }),
  diagram: editorialSvg(
    "phase108-heritage-91-svg",
    "Pilot Custom Heritage 91 cartridge/converter 事实示意图",
    SVG_91,
  ),
} satisfies Record<string, CuratedSource>;

const SOURCES_92 = {
  lineup: liveSource({
    key: "phase108-92-pilot-heritage-lineup",
    registryKey: "pilot-custom-official-phase108-92",
    registryName: "PILOT Custom official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-official",
    title: "Simple designs that transcend generations CUSTOM HERITAGE Series",
    url: "https://www.pilot-custom.jp/en/lineup/heritage.html",
    summary:
      "当前 Heritage lineup 将 92 锁定为 FKVH-15SRS、14K No.5，并说明转尾栓从笔尖吸墨。",
    locator:
      "live lines 90-103: transparent screw-type CUSTOM HERITAGE 92, tail-plug filling, FKVH-15SRS, 14K No.5 and F/FM/M/B",
  }),
  catalog: liveSource({
    key: "phase108-92-pilot-webcatalog",
    registryKey: "pilot-webcatalog-phase108-92",
    registryName: "PILOT web catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-official",
    title: "FKVH15SRS-NCF｜カスタムヘリテイジ92｜PILOTウェブカタログ",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000244&volumeName=00004",
    summary:
      "当前目录页给出 FKVH15SRS-NCF、14K No.5、透明树脂、1.2 ml 内置回转吸入、137 mm、20 g。",
    locator:
      "live product title/SKU and feature/spec table: rotary internal filling, 1.2ml, transparent resin, 14K No.5, 137mm and 20g",
  }),
  care: liveSource({
    key: "phase108-92-pilot-warranty-care",
    registryKey: "pilot-warranty-phase108-92",
    registryName: "PILOT International Warranty",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-official",
    title: "CUSTOM HERITAGE 92 | International Warranty | PILOT",
    url: "https://www.pilot.co.jp/support/warranty/en/fountain/custom_heritage92.html",
    summary:
      "官方支持页绑定 FKVH-15SRS，并明确内置吸墨、不能使用 cartridge/converter。",
    locator:
      "live lines 6-15 product FKVH-15SRS and use-care PDF; filling section states built-in mechanism and no spare cartridge or converter",
  }),
  carePdf: liveSource({
    key: "phase108-92-pilot-care-pdf",
    registryKey: "pilot-warranty-phase108-92",
    registryName: "PILOT International Warranty",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-official",
    title: "Screw Type Fountain Pen / Use and Care Guide",
    url: "https://www.pilot.co.jp/support/warranty/jp/warranty_assets/pdf/fountain_type_s_en.pdf",
    itemType: "pdf",
    summary:
      "当前英文说明书给出活塞吸排、清水换色、润滑痕迹、尾栓、气压与 Tsuwairo 禁用边界。",
    locator:
      "PDF page 1 (viewer P0), lines 0-34: piston fill steps, clean-water flushing, lubricant note, tail-plug care, pressure warning and Tsuwairo incompatibility",
  }),
  price: liveSource({
    key: "phase108-92-pilot-price-2025-10",
    registryKey: "pilot-price-notice-2025-10-phase108-92",
    registryName: "PILOT price revision notice",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-official",
    title: "価格表 2025年10月1日付",
    url: "https://www.pilot.co.jp/information/2025.10%20price_list.pdf",
    itemType: "pdf",
    publishedAt: "2025-08-01",
    summary:
      "历史价格文件：FKVH15SRS 自 2025-10-01 的日本小售基准价为 33,000 日元；不代表 2026 当前价。",
    locator:
      "PDF page 1 (viewer P0), fountain-pen table line 16: カスタムヘリテイジ92 / FKVH15SRS / 29,700円 -> 33,000円; effective 2025-10-01 only",
  }),
  parka: liveSource({
    key: "phase108-92-parka-review",
    registryKey: "parka-heritage-92-phase108",
    registryName: "Parka Blogs",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "parka-blogs",
    title: "Review: Pilot Custom Heritage 92 Fountain Pen",
    url: "https://www.parkablogs.com/picture/review-pilot-custom-heritage-92-fountain-pen",
    author: "Teoh Yi Chie",
    publishedAt: "2015-02-21",
    summary:
      "独立样本记录 piston 墨仓、轻量平衡、顺滑供墨和纸面反馈；拆尖清洗不升级为官方 care。",
    locator:
      "live lines 36-69: author/date, built-in piston sample, dimensions/handling, nib and sample writing observations; line 52 cleaning is author practice only",
  }),
  gentleman: liveSource({
    key: "phase108-92-gentleman-stationer-review",
    registryKey: "gentleman-stationer-heritage-92-phase108",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "gentleman-stationer",
    title: "Workhorse Pens: Pilot Custom Heritage 92 Fountain Pen",
    url: "https://www.gentlemanstationer.com/blog/2026/6/6/workhorse-pens-pilot-custom-heritage-92-fountain-pen",
    author: "Joe Crace",
    publishedAt: "2026-06-06",
    summary:
      "作者长途使用自己的 92，记录 posted 平衡、No.5 M 尖与中等偏湿写感；均限定为个人样本。",
    locator:
      "live lines 41-52 and 60-74: author's own piston pen, travel use, personal posted preference, No.5 M nib and sample wetness/balance observations",
  }),
  diagram: editorialSvg(
    "phase108-heritage-92-svg",
    "Pilot Custom Heritage 92 内置 piston 事实示意图",
    SVG_92,
  ),
} satisfies Record<string, CuratedSource>;

function specEvidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

export const phase108PilotCustomHeritage91Pack: CuratedEntityPack = {
  key: "phase108-pilot-custom-heritage-91-v1",
  entityId: PHASE108_HERITAGE_91_ID,
  expectedType: "pen",
  expectedSlug: PHASE108_HERITAGE_91_SLUG,
  canonicalName: "百乐 Pilot Custom Heritage 91",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pilot-custom-heritage-91-phase108.md",
  storyTitle: "Pilot Custom Heritage 91：No.5 金尖与可拆换供墨路线",
  primarySourceKey: SOURCES_91.catalog.key,
  depthTier: "A",
  aliases: [
    { alias: "Pilot Custom Heritage 91", language: "en", sourceKey: SOURCES_91.lineup.key },
    { alias: "カスタムヘリテイジ91", language: "ja", sourceKey: SOURCES_91.catalog.key },
    { alias: "FKVHN-12SR", language: "und", sourceKey: SOURCES_91.lineup.key },
  ],
  sources: Object.values(SOURCES_91),
  scopes: [
    {
      key: SCOPE_91_CURRENT,
      scopeKey: SCOPE_91_CURRENT,
      market: "Japan/current official catalog",
      productionState: "current",
      nibScope: "14K No.5; EF/F/SF/FM/SFM/M/SM/B/BB；不把 soft 泛化为 flex。",
      materialScope: "树脂轴帽与银色调件；颜色/SKU 后缀逐项核对。",
      editionScope: "FKVHN-12SR current product family; cartridge/CON-40/CON-70N only.",
    },
    {
      key: SCOPE_91_PRICE,
      scopeKey: "historical_price_2025_10",
      market: "Japan",
      validFrom: "2025-10-01",
      validTo: "2026-06-30",
      productionState: "historical",
      editionScope: "2025-10 Japanese retail reference price snapshot; not a 2026 current price.",
    },
  ],
  claims: [
    {
      key: "phase108-91-identity",
      predicate: "model_identity",
      objectText: "Custom Heritage 91 是 FKVHN-12SR、14K No.5 的平顶 Pilot 型号。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: SOURCES_91.lineup.key,
      locator: "91 lineup block: FKVHN-12SR and 14K No.5.",
      evidence: [
        { key: "phase108-91-identity-lineup", sourceKey: SOURCES_91.lineup.key, scopeKey: SCOPE_91_CURRENT, locator: "live lines 73-81" },
        { key: "phase108-91-identity-catalog", sourceKey: SOURCES_91.catalog.key, scopeKey: SCOPE_91_CURRENT, locator: "catalog title/SKU and spec table" },
      ],
    },
    {
      key: "phase108-91-fill-care",
      predicate: "fill_and_care",
      objectText: "91 使用 Pilot cartridge 或 CON-40/CON-70N；它没有 92 的内置 piston 与固定墨仓。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: SOURCES_91.catalog.key,
      locator: "catalog converter row and cartridge/converter instruction videos.",
      evidence: [
        { key: "phase108-91-fill-catalog", sourceKey: SOURCES_91.catalog.key, scopeKey: SCOPE_91_CURRENT, locator: "live lines 43-60, especially CON-40/CON-70N row" },
        { key: "phase108-91-fill-review", sourceKey: SOURCES_91.review.key, scopeKey: SCOPE_91_CURRENT, locator: "Quick Facts cartridge/converter and CON-40/CON-70 recommendation", note: "Independent sample cross-check only." },
      ],
    },
    {
      key: "phase108-91-writing-sample",
      predicate: "review_sample_boundary",
      objectText: "Scrively 的橙色样本与软尖响应只约束作者体验；作者明确不把它称为 flex pen。",
      factClass: "editorial",
      confidence: 0.9,
      sourceKey: SOURCES_91.review.key,
      locator: "review paragraphs and Quick Facts.",
      evidence: [
        { key: "phase108-91-review-sample", sourceKey: SOURCES_91.review.key, scopeKey: SCOPE_91_CURRENT, locator: "live lines 42-56; sample-specific and explicit not-flex boundary" },
      ],
    },
    {
      key: "phase108-91-price-history",
      predicate: "historical_price_2025_10",
      objectText: "2025-10-01 起 FKVHN12SR 的日本历史小售基准价为 27,500 日元；不是 2026 当前售价。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: SOURCES_91.price.key,
      locator: "PDF page 1 line 15.",
      evidence: [
        { key: "phase108-91-price-pdf", sourceKey: SOURCES_91.price.key, scopeKey: SCOPE_91_PRICE, locator: "PDF P0 line 15: FKVHN12SR 22,000 -> 27,500 yen" },
      ],
    },
  ],
  variants: [
    {
      key: "phase108-91-fkvhn-12sr",
      name: "FKVHN-12SR current family",
      notes: "尖宽和颜色由 SKU 后缀表达；供墨保持 cartridge/converter。",
      sourceKey: SOURCES_91.catalog.key,
      variantKind: "market_sku",
      productCode: "FKVHN-12SR",
      market: "Japan",
    },
  ],
  spec: {
    brandEntityId: PHASE108_PILOT_ID,
    values: {
      series_name: "Pilot Custom Heritage 91 / FKVHN-12SR",
      release_year: "2009 family introduction; current FKVHN-12SR scope verified 2026-07-21",
      nib: "14K No.5, rhodium-finished; EF/F/SF/FM/SFM/M/SM/B/BB",
      fill_system: "Pilot cartridge/converter; CON-40 and CON-70N compatible",
      material: "resin barrel and cap; silver-tone trim",
      dimensions: "maximum diameter 14.7 mm; length 137 mm",
      weight: "15.7 g",
      price_range: "historical Japan reference: 27,500 JPY effective 2025-10-01; not current",
      status: "current official lineup/catalog at retrieval",
    },
    evidence: [
      specEvidence("brand_entity_id", "phase108-91-spec-brand", SOURCES_91.lineup.key, SCOPE_91_CURRENT, "PILOT official Custom Heritage lineup"),
      specEvidence("series_name", "phase108-91-spec-series", SOURCES_91.lineup.key, SCOPE_91_CURRENT, "91 block and FKVHN-12SR"),
      specEvidence("release_year", "phase108-91-spec-release", SOURCES_91.history.key, SCOPE_91_CURRENT, "official history 2009 / CUSTOM HERITAGE91 / FKVH-1MR; current FKVHN-12SR scope separately verified"),
      specEvidence("nib", "phase108-91-spec-nib", SOURCES_91.lineup.key, SCOPE_91_CURRENT, "live lines 78-81"),
      specEvidence("fill_system", "phase108-91-spec-fill", SOURCES_91.catalog.key, SCOPE_91_CURRENT, "converter row CON-40/CON-70N and cartridge instruction"),
      specEvidence("material", "phase108-91-spec-material", SOURCES_91.catalog.key, SCOPE_91_CURRENT, "resin barrel/cap and product feature text"),
      specEvidence("dimensions", "phase108-91-spec-dimensions", SOURCES_91.catalog.key, SCOPE_91_CURRENT, "maximum diameter 14.7mm, length 137mm"),
      specEvidence("weight", "phase108-91-spec-weight", SOURCES_91.catalog.key, SCOPE_91_CURRENT, "weight 15.7g"),
      specEvidence("price_range", "phase108-91-spec-price", SOURCES_91.price.key, SCOPE_91_PRICE, "PDF P0 line 15; historical only"),
      specEvidence("status", "phase108-91-spec-status", SOURCES_91.lineup.key, SCOPE_91_CURRENT, "live current lineup at retrieval"),
    ],
  },
  timeline: [
    { key: "phase108-91-2009", title: "Custom Heritage 91 family introduced", eventType: "model_released", startDate: "2009-01-01", circa: true, description: "Pilot official Custom history places Heritage 91 in 2009; current FKVHN-12SR remains a separately verified scope.", sourceKey: SOURCES_91.history.key },
    { key: "phase108-91-price-boundary", title: "2025-10 historical price boundary", eventType: "design_milestone", startDate: "2025-10-01", circa: false, description: "Historical Japan price snapshot only; later prices must not be backfilled.", sourceKey: SOURCES_91.price.key },
  ],
  media: [
    { key: "phase108-91-primary", title: "Custom Heritage 91 cartridge/converter 结构图（非产品照片）", sourceKey: SOURCES_91.diagram.key, localPath: SVG_91, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创事实示意图；非产品照片、非比例、非颜色或表面复刻；不含 Pilot Logo。", sourceUrl: SVG_91, usageStatus: "primary" },
  ],
};

export const phase108PilotCustomHeritage92Pack: CuratedEntityPack = {
  key: "phase108-pilot-custom-heritage-92-v1",
  entityId: PHASE108_HERITAGE_92_ID,
  expectedType: "pen",
  expectedSlug: PHASE108_HERITAGE_92_SLUG,
  canonicalName: "百乐 Pilot Custom Heritage 92",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pilot-custom-heritage-92-phase108.md",
  storyTitle: "Pilot Custom Heritage 92：透明固定墨仓与内置 piston",
  primarySourceKey: SOURCES_92.catalog.key,
  depthTier: "A",
  aliases: [
    { alias: "Pilot Custom Heritage 92", language: "en", sourceKey: SOURCES_92.lineup.key },
    { alias: "カスタムヘリテイジ92", language: "ja", sourceKey: SOURCES_92.catalog.key },
    { alias: "FKVH-15SRS", language: "und", sourceKey: SOURCES_92.lineup.key },
  ],
  sources: Object.values(SOURCES_92),
  scopes: [
    { key: SCOPE_92_CURRENT, scopeKey: SCOPE_92_CURRENT, market: "Japan/current official catalog", productionState: "current", nibScope: "14K No.5; F/FM/M/B; sample wetness/smoothness is not universal.", materialScope: "transparent resin barrel/cap and visible fixed reservoir.", editionScope: "FKVH-15SRS current family; built-in piston only; cartridge/converter incompatible." },
    { key: SCOPE_92_PRICE, scopeKey: "historical_price_2025_10", market: "Japan", validFrom: "2025-10-01", validTo: "2026-06-30", productionState: "historical", editionScope: "2025-10 Japanese retail reference price snapshot; not a 2026 current price." },
  ],
  claims: [
    { key: "phase108-92-identity", predicate: "model_identity", objectText: "Custom Heritage 92 是 FKVH-15SRS、14K No.5 的透明平顶 Pilot 型号。", factClass: "core", confidence: 0.99, sourceKey: SOURCES_92.lineup.key, locator: "92 lineup block.", evidence: [
      { key: "phase108-92-identity-lineup", sourceKey: SOURCES_92.lineup.key, scopeKey: SCOPE_92_CURRENT, locator: "live lines 90-99" },
      { key: "phase108-92-identity-catalog", sourceKey: SOURCES_92.catalog.key, scopeKey: SCOPE_92_CURRENT, locator: "catalog title/SKU and spec table" },
    ] },
    { key: "phase108-92-fill-care", predicate: "fill_and_care", objectText: "92 的 1.2 ml 墨仓与 piston 固定在笔身内，需转动尾栓吸排；不能使用 cartridge 或 converter。", factClass: "core", confidence: 0.99, sourceKey: SOURCES_92.care.key, locator: "warranty filling mechanism statement and catalog capacity.", evidence: [
      { key: "phase108-92-fill-warranty", sourceKey: SOURCES_92.care.key, scopeKey: SCOPE_92_CURRENT, locator: "built-in filling mechanism; spare cartridge/converter cannot be used" },
      { key: "phase108-92-fill-catalog", sourceKey: SOURCES_92.catalog.key, scopeKey: SCOPE_92_CURRENT, locator: "rotary piston and 1.2ml product feature" },
      { key: "phase108-92-care-pdf", sourceKey: SOURCES_92.carePdf.key, scopeKey: SCOPE_92_CURRENT, locator: "PDF P0 lines 0-34; fill, flush, lubricant, tail-plug and Tsuwairo cautions" },
      { key: "phase108-92-fill-parka", sourceKey: SOURCES_92.parka.key, scopeKey: SCOPE_92_CURRENT, locator: "live lines 41-50 and 63-65: reviewed sample has a built-in reservoir and piston", note: "Independent sample cross-checks the mechanism only; capacity and official care remain Pilot-sourced." },
    ] },
    { key: "phase108-92-writing-samples", predicate: "review_sample_boundary", objectText: "Parka 与 Gentleman Stationer 的顺滑、平衡、posted 与清洗观察只约束各自样本；官方 care 优先。", factClass: "editorial", confidence: 0.9, sourceKey: SOURCES_92.parka.key, locator: "two independent sample reviews.", evidence: [
      { key: "phase108-92-parka-sample", sourceKey: SOURCES_92.parka.key, scopeKey: SCOPE_92_CURRENT, locator: "live lines 44-69; sample handling and writing observations" },
      { key: "phase108-92-gentleman-sample", sourceKey: SOURCES_92.gentleman.key, scopeKey: SCOPE_92_CURRENT, locator: "live lines 48-74; author's posted preference and No.5 M sample" },
    ] },
    { key: "phase108-92-price-history", predicate: "historical_price_2025_10", objectText: "2025-10-01 起 FKVH15SRS 的日本历史小售基准价为 33,000 日元；不是 2026 当前售价。", factClass: "core", confidence: 0.99, sourceKey: SOURCES_92.price.key, locator: "PDF page 1 line 16.", evidence: [
      { key: "phase108-92-price-pdf", sourceKey: SOURCES_92.price.key, scopeKey: SCOPE_92_PRICE, locator: "PDF P0 line 16: FKVH15SRS 29,700 -> 33,000 yen" },
    ] },
  ],
  variants: [
    { key: "phase108-92-fkvh-15srs", name: "FKVH-15SRS current family", notes: "当前无色 F/FM/M/B SKU 共享内置 piston；不从旧评测扩张历史颜色。", sourceKey: SOURCES_92.catalog.key, variantKind: "market_sku", productCode: "FKVH-15SRS", market: "Japan" },
  ],
  spec: {
    brandEntityId: PHASE108_PILOT_ID,
    values: {
      series_name: "Pilot Custom Heritage 92 / FKVH-15SRS",
      release_year: "current FKVH-15SRS scope verified 2026-07-21; no unverified launch year asserted",
      nib: "14K No.5; F/FM/M/B",
      fill_system: "built-in rotary piston and fixed 1.2 ml reservoir; no cartridge/converter",
      material: "transparent resin barrel and cap",
      dimensions: "maximum diameter 14.7 mm; length 137 mm",
      weight: "20 g",
      price_range: "historical Japan reference: 33,000 JPY effective 2025-10-01; not current",
      status: "current official lineup/catalog at retrieval",
    },
    evidence: [
      specEvidence("brand_entity_id", "phase108-92-spec-brand", SOURCES_92.lineup.key, SCOPE_92_CURRENT, "PILOT official Custom Heritage lineup"),
      specEvidence("series_name", "phase108-92-spec-series", SOURCES_92.lineup.key, SCOPE_92_CURRENT, "92 block and FKVH-15SRS"),
      specEvidence("release_year", "phase108-92-spec-release", SOURCES_92.lineup.key, SCOPE_92_CURRENT, "current official scope verified at retrieval; no launch-year claim"),
      specEvidence("nib", "phase108-92-spec-nib", SOURCES_92.lineup.key, SCOPE_92_CURRENT, "live lines 96-99"),
      specEvidence("fill_system", "phase108-92-spec-fill", SOURCES_92.catalog.key, SCOPE_92_CURRENT, "rotary piston and 1.2ml; warranty excludes cartridge/converter"),
      specEvidence("material", "phase108-92-spec-material", SOURCES_92.catalog.key, SCOPE_92_CURRENT, "transparent resin barrel/cap"),
      specEvidence("dimensions", "phase108-92-spec-dimensions", SOURCES_92.catalog.key, SCOPE_92_CURRENT, "maximum diameter 14.7mm, length 137mm"),
      specEvidence("weight", "phase108-92-spec-weight", SOURCES_92.catalog.key, SCOPE_92_CURRENT, "weight 20g"),
      specEvidence("price_range", "phase108-92-spec-price", SOURCES_92.price.key, SCOPE_92_PRICE, "PDF P0 line 16; historical only"),
      specEvidence("status", "phase108-92-spec-status", SOURCES_92.lineup.key, SCOPE_92_CURRENT, "live current lineup at retrieval"),
    ],
  },
  timeline: [
    { key: "phase108-92-current-boundary", title: "Current FKVH-15SRS source boundary verified", eventType: "design_milestone", startDate: "2026-07-21", circa: false, description: "Current official lineup/catalog and care were live-verified without asserting an unsupported launch year.", sourceKey: SOURCES_92.lineup.key },
    { key: "phase108-92-price-boundary", title: "2025-10 historical price boundary", eventType: "design_milestone", startDate: "2025-10-01", circa: false, description: "Historical Japan price snapshot only; later prices must not be backfilled.", sourceKey: SOURCES_92.price.key },
  ],
  media: [
    { key: "phase108-92-primary", title: "Custom Heritage 92 内置 piston 结构图（非产品照片）", sourceKey: SOURCES_92.diagram.key, localPath: SVG_92, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创事实示意图；非产品照片、非比例、非颜色或表面复刻；不含 Pilot Logo。", sourceUrl: SVG_92, usageStatus: "primary" },
  ],
};

export const phase108PilotCustomHeritagePacks = [
  phase108PilotCustomHeritage91Pack,
  phase108PilotCustomHeritage92Pack,
];
