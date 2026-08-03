import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase33Sailor2026CurrentPacks } from "./phase33-sailor-2026-current";

export const PHASE378_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE378_DREAMSCAPE_ID =
  "phase378-sailor-dreamscape-celestial-temple-102650";
export const PHASE378_DREAMSCAPE_SLUG =
  "sailor-dreamscape-trip-celestial-temple";

const RETRIEVED = "2026-08-03";
const PRODUCT_JP = "https://sailor.co.jp/product/10-2650/";
const NEWS = "https://sailor.co.jp/news/20260716/";
const PRESS_PDF =
  "https://sailor.co.jp/wp-content/uploads/2026/07/260716_DREAMSCAPE-TRIP_CELESTIAL-TEMPLE.pdf";
const CATEGORY_JP = "https://sailor.co.jp/category_product/fountain-pen/";
const CATEGORY_EN = "https://en.sailor.co.jp/category_product/fountain-pen-all/";
const NIB = "https://sailor.co.jp/topics/fountain-pen-type/";
const REFILL = "https://sailor.co.jp/topics/fountain-pen-refill-ink/";
const CARE = "https://sailor.co.jp/topics/fountain-pen-maintenance/";
const INDUSTRY = "https://www.nichima.co.jp/new_item/entry/5633.html";
const SVG =
  "/images/library/site-original/phase378/sailor/dreamscape-trip-celestial-temple-102650.svg";

function source(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  registryKey: string;
  registryName: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup?: string;
  homepageUrl?: string;
  author?: string;
  publishedAt?: string;
  itemType?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const siteOriginal = sourceType === "user_submission";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier:
      input.tier ??
      (sourceType === "blog" ? "professional_secondary" : "primary"),
    independenceGroup: input.independenceGroup ?? input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl:
      input.homepageUrl ??
      (sourceType === "official" ? "https://sailor.co.jp/" : "/"),
    itemType: input.itemType ?? (siteOriginal ? "image" : "web_page"),
    author:
      input.author ??
      (sourceType === "official" ? "セーラー万年筆株式会社" : input.registryName),
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    allowedUse: siteOriginal ? "store_full" : "summary_only",
    license: siteOriginal ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: siteOriginal
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function claim(
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies };
}

const SOURCES = {
  product: source({
    key: "phase378-dreamscape-product",
    title: "DREAMSCAPE TRIP CELESTIAL TEMPLE 万年筆 — 10-2650",
    url: PRODUCT_JP,
    summary:
      "Sailor 当前日本产品页确认 10-2650 的名称、¥29,700、2026-12-05 计划限量发售、F/MF/M 代码、不锈钢尖、金色 IP、PMMA、C/C、φ18×129 mm 和 23.5 g 当前值。",
    locator:
      "title, product code, price, planned release, nib, filling, material, finish, size, current weight and package fields",
    registryKey: "sailor-official-phase378-dreamscape",
    registryName: "セーラー万年筆株式会社",
    publishedAt: "2026-07-16",
  }),
  news: source({
    key: "phase378-dreamscape-news",
    title: "DREAMSCAPE TRIP Vol.1 CELESTIAL TEMPLE 新闻 — Sailor",
    url: NEWS,
    summary:
      "Sailor 官方新闻确认新套装系列概念、2026-12-05 全国经销店限量发售，以及笔套、贴纸、机票风卡片和旅行箱式包装的设计说明。",
    locator: "press-release date, series concept, nationwide limited sale and set-item descriptions",
    registryKey: "sailor-official-phase378-dreamscape",
    registryName: "セーラー万年筆株式会社",
    publishedAt: "2026-07-16",
  }),
  pressPdf: source({
    key: "phase378-dreamscape-press-pdf",
    title: "DREAMSCAPE TRIP CELESTIAL TEMPLE 新闻资料 PDF — Sailor",
    url: PRESS_PDF,
    summary:
      "Sailor 2026-07-16 新闻 PDF 用于核对套装物件、发布时态和早期资料差异；PDF 的 21.6 g 与包装宽度 126.5 mm 不覆盖当前产品页的主规格。",
    locator: "two-page press release, set contents, early weight and package-dimension fields",
    registryKey: "sailor-official-phase378-dreamscape",
    registryName: "セーラー万年筆株式会社",
    publishedAt: "2026-07-16",
    itemType: "pdf",
  }),
  categoryJp: source({
    key: "phase378-dreamscape-category-jp",
    title: "万年筆产品目录 — Sailor 日本官网",
    url: CATEGORY_JP,
    summary:
      "官方日本目录把 10-2650 列入当前万年笔产品导航；目录位置用于确认型号入口，不替代单支规格。",
    locator: "fountain-pen category product card and product-page link",
    registryKey: "sailor-official-phase378-dreamscape",
    registryName: "セーラー万年筆株式会社",
  }),
  categoryEn: source({
    key: "phase378-dreamscape-category-en",
    title: "Fountain Pen category — Sailor English",
    url: CATEGORY_EN,
    summary:
      "Sailor 英文目录列出 DREAMSCAPE TRIP Vol.1 CELESTIAL TEMPLE 的英文导航名；用于跨语言检索，不把导航名拆成新实体。",
    locator: "English fountain-pen category listing and related product navigation",
    registryKey: "sailor-official-phase378-dreamscape",
    registryName: "The Sailor Pen Co., Ltd.",
    homepageUrl: "https://en.sailor.co.jp/",
    author: "The Sailor Pen Co., Ltd.",
  }),
  nib: source({
    key: "phase378-dreamscape-nib",
    title: "ペン先の種類と特長 — Sailor 官方",
    url: NIB,
    summary:
      "Sailor 官方笔尖知识页用于解释 F、MF、M 等标准字幅和笔尖材料的一般边界，不替代 10-2650 的单支调校。",
    locator: "official nib material and standard width guidance",
    registryKey: "sailor-official-phase378-dreamscape",
    registryName: "セーラー万年筆株式会社",
  }),
  refill: source({
    key: "phase378-dreamscape-refill",
    title: "万年筆のインク補充方法 — Sailor 官方",
    url: REFILL,
    summary:
      "Sailor 官方说明墨囊和转换器的安装、吸墨、排空与保存步骤，用于 10-2650 的 C/C 维护边界。",
    locator: "official cartridge and converter filling instructions",
    registryKey: "sailor-official-phase378-dreamscape",
    registryName: "セーラー万年筆株式会社",
  }),
  care: source({
    key: "phase378-dreamscape-care",
    title: "万年筆のお手入れ方法 — Sailor 官方",
    url: CARE,
    summary:
      "Sailor 官方说明日常清洗、长期保存与避免强力清洁的方法；PMMA 和金色 IP 的保守建议仍以型号资料为边界。",
    locator: "official cleaning, storage and maintenance instructions",
    registryKey: "sailor-official-phase378-dreamscape",
    registryName: "セーラー万年筆株式会社",
  }),
  industry: source({
    key: "phase378-dreamscape-industry",
    title: "特別な世界をテーマにした万年筆セット — 文マガ",
    url: INDUSTRY,
    summary:
      "文マガ是文具流通行业刊物，2026-07-19 独立报道 DREAMSCAPE TRIP Vol.1 的 ¥29,700、2026-12-05 限量发售、飞机笔尖意象与套装物件。",
    locator: "industry new-product report dated 2026-07-19, price, release, concept and package contents",
    registryKey: "nichima-industry-phase378-dreamscape",
    registryName: "株式会社ニチマ／文マガ",
    sourceType: "blog",
    tier: "professional_secondary",
    homepageUrl: "https://www.nichima.co.jp/",
    author: "文マガ（株式会社ニチマ）",
    publishedAt: "2026-07-19",
  }),
  diagram: source({
    key: "phase378-dreamscape-svg",
    title: "Sailor DREAMSCAPE TRIP CELESTIAL TEMPLE 10-2650 factual identity card",
    url: SVG,
    summary:
      "本站原创 factual SVG 概括 10-2650 的 PMMA、金色 IP、不锈钢尖、C/C、当前 23.5 g 和 F/MF/M 代码边界。",
    locator: "site-original factual SVG metadata",
    registryKey: "fountain-pen-graph-editorial-phase378-dreamscape",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    independenceGroup: "fountain-pen-graph-editorial",
    itemType: "image",
  }),
};

const SCOPE = "phase378-sailor-dreamscape-celestial-temple-102650";

const brand = structuredClone(
  phase33Sailor2026CurrentPacks.find(
    (candidate) =>
      candidate.entityId === PHASE378_SAILOR_BRAND_ID &&
      candidate.expectedType === "brand",
  ),
);
if (!brand) throw new Error("Phase 378 Sailor brand pack missing.");
brand.key = "phase378-sailor-brand-v1";

const pack: CuratedEntityPack = {
  key: `${PHASE378_DREAMSCAPE_ID}-v1`,
  entityId: PHASE378_DREAMSCAPE_ID,
  expectedType: "pen",
  expectedSlug: PHASE378_DREAMSCAPE_SLUG,
  canonicalName: "写乐 Sailor DREAMSCAPE TRIP CELESTIAL TEMPLE（10-2650）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/sailor-dreamscape-trip-celestial-temple-102650-phase378.md",
  storyTitle:
    "写乐 Sailor DREAMSCAPE TRIP CELESTIAL TEMPLE 10-2650：把一支钢笔做成一次有随行物的旅程",
  primarySourceKey: SOURCES.product.key,
  depthTier: "A",
  aliases: [
    {
      alias: "DREAMSCAPE TRIP Vol.1 'CELESTIAL TEMPLE' FOUNTAIN PEN",
      language: "en",
      sourceKey: SOURCES.categoryEn.key,
    },
    {
      alias: "DREAMSCAPE TRIP　CELESTIAL TEMPLE万年筆",
      language: "ja",
      sourceKey: SOURCES.product.key,
    },
    {
      alias: "DREAMSCAPE TRIP Vol.1 CELESTIAL TEMPLE",
      language: "en",
      sourceKey: SOURCES.news.key,
    },
    {
      alias: "10-2650",
      language: "en",
      sourceKey: SOURCES.product.key,
    },
    {
      alias: "写乐 Sailor 梦境之旅 CELESTIAL TEMPLE",
      language: "zh",
      sourceKey: SOURCES.product.key,
    },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Sailor official Japan product page and nationwide authorized market",
      validFrom: "2026-12-05",
      productionState: "current",
      nibScope: "stainless steel F/MF/M",
      materialScope: "PMMA resin and gold IP finish",
      editionScope: "10-2650; Vol.1 limited set announced for future release",
    },
    {
      key: `${SCOPE}-catalog-snapshot`,
      scopeKey: `${SCOPE}-catalog-snapshot`,
      validFrom: RETRIEVED,
      productionState: "historical",
      editionScope: "2026-08-03 catalog reading snapshot; not proof that the future product has shipped",
    },
    {
      key: `${SCOPE}-media-boundary`,
      scopeKey: `${SCOPE}-media-boundary`,
      productionState: "current",
      editionScope: "site-original factual SVG; no product photo, logo, scale or colour proof",
    },
  ],
  claims: [
    claim(
      SCOPE,
      `${SCOPE}-identity`,
      "model_identity",
      "10-2650 是 Sailor DREAMSCAPE TRIP Vol.1 CELESTIAL TEMPLE 套装中的具体钢笔主型号；Vol.1、CELESTIAL TEMPLE 和 F/MF/M 尖幅属于同一型号的系列／变体边界。",
      SOURCES.product.key,
      "official product title and 10-2650 code",
    ),
    claim(
      SCOPE,
      `${SCOPE}-series`,
      "series_context",
      "DREAMSCAPE TRIP 是 Sailor 以‘与你一起旅行的钢笔’为概念的新套装系列，每卷把主题钢笔和限定随行物组合销售；CELESTIAL TEMPLE 是 Vol.1。",
      SOURCES.news.key,
      "official press-release series definition",
    ),
    claim(
      SCOPE,
      `${SCOPE}-release`,
      "release_history",
      "Sailor 公布 10-2650 于 2026-12-05 在全国 Sailor 产品经销店限量发售；读取日 2026-08-03，正文保持已公告、计划上市的未来时态。",
      SOURCES.news.key,
      "official release date and limited-sale notice",
    ),
    claim(
      SCOPE,
      `${SCOPE}-industry-release`,
      "market_listing",
      "文マガ 2026-07-19 的文具流通行业报道独立交叉核对 ¥29,700、2026-12-05 限量发售、飞机笔尖意象与套装随行物；不替代 Sailor 单支规格。",
      SOURCES.industry.key,
      "industry new-product report",
    ),
    claim(
      SCOPE,
      `${SCOPE}-nib`,
      "nib",
      "不锈钢笔尖，金色 IP 饰面；官方提供 F、MF、M 三种市场代码。金色 IP 是表面处理，不是贵金属尖材声明。",
      SOURCES.product.key,
      "official nib material, finish and code fields",
    ),
    claim(
      SCOPE,
      `${SCOPE}-nib-context`,
      "nib_context",
      "Sailor 官方笔尖知识页把 F、MF、M 作为标准字幅背景；实际线宽和单支调校仍受纸张、墨水与书写压力影响。",
      SOURCES.nib.key,
      "official nib width guidance",
    ),
    claim(
      SCOPE,
      `${SCOPE}-filling`,
      "filling_system",
      "墨囊／转换器两用式（cartridge/converter）；不是尾栓回转吸入式，也不应把套装附送的两支黑色墨囊写成专用配方。",
      SOURCES.product.key,
      "official filling method field",
    ),
    claim(
      SCOPE,
      `${SCOPE}-material`,
      "material",
      "盖、笔杆和大先为 PMMA 树脂，金属部件为金色 IP 饰面；产品的云、太阳和神殿视觉主题属于设计说明，不是实际材质名称。",
      SOURCES.product.key,
      "official body-material and metal-finish fields",
    ),
    claim(
      SCOPE,
      `${SCOPE}-size`,
      "physical_specification",
      "当前日本产品页规格为 φ18×129 mm（含笔夹），空笔重量 23.5 g；尺寸和重量口径保留产品页原文。",
      SOURCES.product.key,
      "current official size and weight fields",
    ),
    claim(
      SCOPE,
      `${SCOPE}-discrepancy`,
      "source_discrepancy",
      "Sailor 2026-07-16 新闻 PDF 另载 21.6 g 和包装宽度 W126.5 mm；本页不把它们建成第二个型号或重量版本，暂以当前产品页的 23.5 g／216.5 mm 作为主规格并保留待复核边界。",
      SOURCES.pressPdf.key,
      "early press-PDF specification table versus current product page",
      "editorial",
    ),
    claim(
      SCOPE,
      `${SCOPE}-package`,
      "package_contents",
      "套装包含钢笔、笔套、贴纸 3 种、机票风卡片、黑色墨囊 2 支、使用说明书、产品说明书和质量保证书；官方新闻另说明包装采用旅行箱意象。",
      SOURCES.news.key,
      "official set-content and package-design descriptions",
    ),
    claim(
      SCOPE,
      `${SCOPE}-price`,
      "market_status",
      "日本官网价格为 ¥29,700（本体 ¥27,000）；这是 2026-08-03 读取的日本官方基线，不推导海外税费、库存或二手价格。",
      SOURCES.product.key,
      "official price and limited-sale notice",
    ),
    claim(
      SCOPE,
      `${SCOPE}-care`,
      "maintenance_guidance",
      "换色或长期不用时排空墨囊／转换器，以室温清水吸排并自然晾干；PMMA 与金色 IP 表面不使用酒精、强溶剂、研磨布、金属抛光膏或家具蜡，出现裂纹、漏墨或镀层脱落时联系服务。",
      SOURCES.care.key,
      "official cleaning guidance plus conservative PMMA and plated-finish care",
      "editorial",
    ),
    claim(
      SCOPE,
      `${SCOPE}-selection`,
      "selection_guidance",
      "选购应核对 10-2650 主码、F/MF/M 后缀、当前产品页 23.5 g、C/C、套装随行物和 2026-12-05 计划时态；若卖家引用 21.6 g，应要求说明所用的早期 PDF 版本。",
      SOURCES.product.key,
      "model code, current specification, set boundary and release-date selection checks",
      "editorial",
    ),
    claim(
      SCOPE,
      `${SCOPE}-media`,
      "media_identity_boundary",
      "主图是本站原创 factual SVG，不复制 Sailor 产品照片或 Logo，不证明真实图案颜色、比例、包装缺件或单支笔尖状态。",
      SOURCES.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: `${SCOPE}-f`,
      name: "细字 F",
      notes: "日本官网代码 10-2650-241，JAN 49-01680-61287-2；与 MF／M 共享 10-2650 主型号。",
      sourceKey: SOURCES.product.key,
      variantKind: "market_sku",
      productCode: "10-2650-241",
      market: "日本",
    },
    {
      key: `${SCOPE}-mf`,
      name: "中细 MF",
      notes: "日本官网代码 10-2650-341，JAN 49-01680-61288-9；与 F／M 共享 10-2650 主型号。",
      sourceKey: SOURCES.product.key,
      variantKind: "market_sku",
      productCode: "10-2650-341",
      market: "日本",
    },
    {
      key: `${SCOPE}-m`,
      name: "中字 M",
      notes: "日本官网代码 10-2650-441，JAN 49-01680-61289-6；与 F／MF 共享 10-2650 主型号。",
      sourceKey: SOURCES.product.key,
      variantKind: "market_sku",
      productCode: "10-2650-441",
      market: "日本",
    },
  ],
  spec: {
    brandEntityId: PHASE378_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor DREAMSCAPE TRIP Vol.1 CELESTIAL TEMPLE（10-2650）",
      release_year: "2026-12-05 计划上市（读取日 2026-08-03，未来时态）",
      origin_country: "日本 Sailor；不外推具体工厂、装配线或树脂供应商",
      nib: "不锈钢，金色 IP 饰面；F／MF／M",
      fill_system: "墨囊／转换器两用式（cartridge/converter）",
      material: "盖、笔杆、大先为 PMMA 树脂；金属部件金色 IP 饰面",
      dimensions: "φ18×129 mm（含笔夹）",
      weight: "23.5 g（当前日本产品页；早期新闻 PDF 另载 21.6 g）",
      price_range: "¥29,700（本体 ¥27,000）；限定发售",
      status: "已公告、计划 2026-12-05 发售；未把未来时态写成已上市",
    },
    evidence: [
      evidence(`${SCOPE}-brand`, "brand_entity_id", SOURCES.product.key, SCOPE, "official Sailor product page"),
      evidence(`${SCOPE}-series`, "series_name", SOURCES.product.key, SCOPE, "official product title and code"),
      evidence(`${SCOPE}-release`, "release_year", SOURCES.news.key, SCOPE, "official release notice"),
      evidence(`${SCOPE}-origin`, "origin_country", SOURCES.news.key, SCOPE, "Sailor company and official release context"),
      evidence(`${SCOPE}-nib`, "nib", SOURCES.product.key, SCOPE, "official nib and finish fields"),
      evidence(`${SCOPE}-fill`, "fill_system", SOURCES.product.key, SCOPE, "official filling-method field"),
      evidence(`${SCOPE}-material`, "material", SOURCES.product.key, SCOPE, "official body and metal fields"),
      evidence(`${SCOPE}-dimensions`, "dimensions", SOURCES.product.key, SCOPE, "current official size field"),
      evidence(`${SCOPE}-weight`, "weight", SOURCES.product.key, SCOPE, "current official product-page weight"),
      evidence(`${SCOPE}-price`, "price_range", SOURCES.product.key, SCOPE, "official price and limited-sale notice"),
      evidence(`${SCOPE}-status`, "status", SOURCES.news.key, SCOPE, "official planned release and availability notice"),
    ],
  },
  media: [
    {
      key: `${SCOPE}-primary-media`,
      title: "DREAMSCAPE TRIP CELESTIAL TEMPLE 10-2650 事实卡（非产品照片）",
      sourceKey: SOURCES.diagram.key,
      localPath: SVG,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样。",
      sourceUrl: SVG,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: `${SCOPE}-announced`,
      title: "Sailor 公布 DREAMSCAPE TRIP Vol.1 CELESTIAL TEMPLE",
      eventType: "model_released",
      startDate: "2026-07-16",
      circa: false,
      description:
        "Sailor 官方新闻公布新套装系列及 Vol.1 CELESTIAL TEMPLE，并宣布 2026-12-05 限量发售；时间线记录公告，不表示当天已经上市。",
      sourceKey: SOURCES.news.key,
    },
    {
      key: `${SCOPE}-planned-release`,
      title: "10-2650 计划限量发售",
      eventType: "model_released",
      startDate: "2026-12-05",
      circa: false,
      description:
        "官方日本产品页与行业报道共同列出 2026-12-05 的计划上市日；截至读取日仍保持未来时态。",
      sourceKey: SOURCES.product.key,
    },
  ],
};

export const phase378SailorDreamscapeCelestialTemplePacks: CuratedEntityPack[] = [
  brand,
  pack,
];
