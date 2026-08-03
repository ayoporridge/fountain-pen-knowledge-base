import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE107_WANCHER_ID,
  phase107WancherBrandPack,
} from "./phase107-wancher-dream-pen-true-ebonite-matte-black";

export const PHASE388_WANCHER_BRAND_ID = PHASE107_WANCHER_ID;
export const PHASE388_TSUIKIN_KANHIZAKURA_ID =
  "phase388-pen-wancher-tsuikin-kanhizakura";
export const PHASE388_TSUIKIN_KANHIZAKURA_SLUG =
  "wancher-tsuikin-kanhizakura";
export const PHASE388_TSUIKIN_KANHIZAKURA_NAME =
  "Wancher Dream Pen Tsuikin – Kanhizakura";

const RETRIEVED = "2026-08-03";
const SCOPE = "phase388-wancher-tsuikin-kanhizakura-current";
const SVG_PATH =
  "/images/library/site-original/phase388/wancher/tsuikin-kanhizakura.svg";
const JP_PRODUCT = "https://jp.wancherpen.com/products/tsuikin-kanhizakura";
const TSUIKIN_COLLECTION =
  "https://www.wancherpen.com/collections/dream-pen-ryukyu-tsuikin";
const DREAM_COLLECTION = "https://www.wancherpen.com/collections/dream-pen";
const NEW_ARRIVALS = "https://www.wancherpen.com/collections/all/new-arrival";
const CARE = "https://www.wancherpen.com/pages/product-care";
const WEB_JAPAN =
  "https://web-japan.org/niponica/niponica19/en/feature/feature05-2.html";
const OKINAWA =
  "https://www.pref.okinawa.jp/shigoto/kenkyu/1010919/1021637/1003010/1003040.html";

function source(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  summary: string;
  locator: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup?: string;
  homepageUrl?: string;
  author?: string | null;
  allowedUse?: CuratedSource["allowedUse"];
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? "primary",
    independenceGroup: input.independenceGroup ?? input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl:
      input.homepageUrl ??
      (sourceType === "official" ? "https://www.wancherpen.com/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author: input.author ?? input.registryName,
    publishedAt: null,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: input.allowedUse ?? "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function siteOriginal(): CuratedSource {
  return {
    key: "phase388-wancher-tsuikin-kanhizakura-svg",
    registryKey: "fountain-pen-graph-editorial-phase388",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase388",
    title: "Wancher Dream Pen Tsuikin Kanhizakura factual identity card",
    url: SVG_PATH,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    publishedAt: null,
    retrievedAt: RETRIEVED,
    summary:
      "本站原创 factual SVG；表达 Ebonite、堆锦寒绯樱、欧规 C/C 与尖材/feed 边界，非产品照片。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: SVG_PATH,
    archiveLocator:
      "project-public-asset:/images/library/site-original/phase388/wancher/tsuikin-kanhizakura.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900",
  };
}

const S = {
  product: source({
    key: "phase388-wancher-tsuikin-kanhizakura-jp-product",
    title: "ドリームペン 堆錦・カンヒザクラ — Wancher Japan official",
    url: JP_PRODUCT,
    registryKey: "wancher-japan-tsuikin-kanhizakura-product-phase388",
    registryName: "Wancher Japan official",
    independenceGroup: "wancher-official-tsuikin-kanhizakura-phase388",
    summary:
      "日本官方具体商品页确认 Dream Pen 堆錦・カンヒザクラ的名称、Ebonite/Tsuikin 规格、三种尖、三种 feed、欧规 C/C、气密帽、包装、日元价格、Size & Shape 图片及同页水牛角通用文案冲突。",
    locator:
      "Japanese product title, description, Specifications, Okinawan craftsmanship, Size & Shape, package and current price sections",
  }),
  tsuikin: source({
    key: "phase388-wancher-ryukyu-tsuikin-collection",
    title: "Dream Pen Ryukyu Tsuikin collection — Wancher official",
    url: TSUIKIN_COLLECTION,
    registryKey: "wancher-official-ryukyu-tsuikin-collection-phase388",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-tsuikin-collection-phase388",
    summary:
      "官方集合页解释琉球堆锦的历史与 Tsuikin-mochi 的揉制、擀薄、切贴和刻线过程，并将 Kanhizakura 与 Hibiscus、Shell Ginger、Bonsai、Twin Dragons 作为相邻主题导航。",
    locator:
      "Ryukyu history, Tsuikin process and product grid for named Tsuikin models",
  }),
  dream: source({
    key: "phase388-wancher-dream-pen-collection",
    title: "Dream Pen Fountain Pen Collection — Wancher official",
    url: DREAM_COLLECTION,
    registryKey: "wancher-official-dream-pen-collection-phase388",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-dream-pen-collection-phase388",
    summary:
      "官方 Dream Pen 集合页用于确认系列跨 ebonite、ABS、铝、钛等材料与工艺，不把系列入口当成一支共享固定规格的型号。",
    locator: "Dream Pen collection introduction and material-family navigation",
  }),
  arrivals: source({
    key: "phase388-wancher-tsuikin-kanhizakura-new-arrivals",
    title: "New arrivals — Wancher official",
    url: NEW_ARRIVALS,
    registryKey: "wancher-official-new-arrivals-phase388",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-new-arrivals-phase388",
    summary:
      "官方新品列表将 Dream Pen Tsuikin Kanhizakura 单独列为 $1,000 USD 国际商品；仅用于当前国际标价与商品身份交叉核对，不取代日本具体页。",
    locator: "New-arrival product grid item naming Kanhizakura and $1,000 USD listing",
  }),
  care: source({
    key: "phase388-wancher-product-care",
    title: "Product Care Guide — Wancher official",
    url: CARE,
    registryKey: "wancher-official-product-care-phase388",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-product-care-phase388",
    summary:
      "官方护理页给出 Urushi/Maki-e/Raden 避光、避干燥和极端天气建议，并提醒 Ebonite 不要长时间浸泡、避免化学清洁剂；用于保守维护边界。",
    locator: "Urushi/Maki-e/Raden and Ebonite care guide sections",
  }),
  webJapan: source({
    key: "phase388-web-japan-kanhizakura",
    title: "Kanhizakura in Okinawa — Web Japan / Nipponica",
    url: WEB_JAPAN,
    registryKey: "web-japan-nipponica-kanhizakura-phase388",
    registryName: "Web Japan / Nipponica",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "web-japan-nipponica-phase388",
    homepageUrl: "https://web-japan.org/",
    summary:
      "日本文化资料将冲绳寒绯樱写为深粉色、钟形下垂、较早开放的樱花；用于独立核对主题植物，不把植物特征当作每一处漆画比例。",
    locator: "Okinawa kanhizakura description and early-blooming flower passage",
  }),
  okinawa: source({
    key: "phase388-okinawa-prefecture-kanhizakura",
    title: "カンヒザクラ — Okinawa Prefecture",
    url: OKINAWA,
    registryKey: "okinawa-prefecture-kanhizakura-phase388",
    registryName: "Okinawa Prefecture",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "okinawa-prefecture-government-phase388",
    homepageUrl: "https://www.pref.okinawa.jp/",
    summary:
      "冲绳县官方资料给出寒绯樱学名 Cerasus campanulata、冲绳分布及一月至二月花期等植物事实，用于独立核对 Kanhizakura 命名。",
    locator: "Cerasus campanulata, Okinawa distribution and January–February flowering information",
  }),
  svg: siteOriginal(),
} as const;

function claim(
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
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey,
        scopeKey: SCOPE,
        locator,
      },
    ],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
  qualifies = true,
  note?: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies, note };
}

const baseBrand = structuredClone(phase107WancherBrandPack);
baseBrand.key = "phase388-wancher-brand-tsuikin-kanhizakura-navigation-v1";
baseBrand.sources = [...baseBrand.sources, ...Object.values(S)].filter(
  (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
);
baseBrand.scopes = [
  ...baseBrand.scopes,
  {
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope:
      "Wancher 品牌页新增 Dream Pen Tsuikin – Kanhizakura 具体型号入口；Dream Pen 与 Ryukyu Tsuikin 继续作为系列/工艺入口。",
  },
];
baseBrand.claims = [
  ...baseBrand.claims,
  claim(
    `${SCOPE}-brand-navigation`,
    "series_navigation",
    "Wancher 品牌页新增 Dream Pen Tsuikin – Kanhizakura 具体型号入口；本条不把 Hibiscus、Shell Ginger、Bonsai、Twin Dragons 或 Celluloid Sakura 合并为同一型号。",
    S.product.key,
    "official Japanese product title and related collection boundary",
  ),
];

const model: CuratedEntityPack = {
  key: `${PHASE388_TSUIKIN_KANHIZAKURA_ID}-v1`,
  entityId: PHASE388_TSUIKIN_KANHIZAKURA_ID,
  expectedType: "pen",
  expectedSlug: PHASE388_TSUIKIN_KANHIZAKURA_SLUG,
  canonicalName: PHASE388_TSUIKIN_KANHIZAKURA_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-tsuikin-kanhizakura-phase388.md",
  storyTitle: "Wancher Dream Pen Tsuikin Kanhizakura：把冲绳早樱压进堆锦漆面",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Dream Pen Tsuikin Kanhizakura", language: "en", sourceKey: S.arrivals.key },
    { alias: "ドリームペン 堆錦・カンヒザクラ", language: "ja", sourceKey: S.product.key },
    { alias: "Dream Pen 堆錦・カンヒザクラ", language: "ja", sourceKey: S.product.key },
    { alias: "Wancher Tsuikin Kanhizakura", language: "en", sourceKey: S.tsuikin.key },
    { alias: "万佳 Dream Pen 堆锦寒绯樱", language: "zh", sourceKey: S.product.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Wancher Japan current product, international collection and official care references",
      nibScope: "JoWo #6 stainless steel、Shogun 18K、Keiryu nib；按订单确认尖幅、供墨与调校",
      materialScope: "具体商品规格 Ebonite、Tsuikin；页面通用水牛角段落作为已解决冲突保留",
      editionScope: "Dream Pen / Ryukyu Tsuikin 中的 Kanhizakura 具体商品；相邻 Tsuikin 与 Celluloid SKU 不继承",
    },
    {
      key: `${SCOPE}-boundary`,
      scopeKey: `${SCOPE}-boundary`,
      productionState: "current",
      editionScope:
        "不把 Hibiscus、Shell Ginger、Bonsai、Twin Dragons、Dream Pen Celluloid Sakura 或其它 Urushi/Zogan 型号的尺寸、重量、尖材、feed、价格和图片移入本页",
    },
  ],
  claims: [
    claim(
      `${SCOPE}-identity`,
      "model_identity",
      "Dream Pen Tsuikin Kanhizakura 是 Wancher 当前日本商品页和国际新品列表中的具体型号；Dream Pen 是系列入口，Ryukyu Tsuikin 是工艺路线，Kanhizakura 是本支寒绯樱主题名。",
      S.product.key,
      "Japanese product title and international new-arrival listing",
    ),
    claim(
      `${SCOPE}-botany`,
      "design_theme",
      "Kanhizakura 指冲绳寒绯樱，学名 Cerasus campanulata；独立资料核对其深粉色、钟形下垂花与一至二月早花特征，用于命名语境而非漆画比例证明。",
      S.okinawa.key,
      "Cerasus campanulata and January–February flowering facts",
    ),
    claim(
      `${SCOPE}-botany-secondary`,
      "design_theme_crosscheck",
      "Web Japan 的冲绳文化资料也将寒绯樱描述为深粉色、钟形下垂并较早开放的樱花；此交叉来源只核对主题植物，不替代 Wancher 的产品图案说明。",
      S.webJapan.key,
      "Okinawa kanhizakura description and early-blooming flower passage",
    ),
    claim(
      `${SCOPE}-tsuikin-process`,
      "craft_process",
      "Wancher 对 Ryukyu Tsuikin 的公开说明包含把有色漆揉成 Tsuikin-mochi、擀薄、切割、贴附、刻线和着色的步骤；没有据此臆测本支笔的工期、配方或漆层数量。",
      S.tsuikin.key,
      "Ryukyu Tsuikin process description",
    ),
    claim(
      `${SCOPE}-material-specific`,
      "material",
      "日本具体商品规格写材质/加饰为 Ebonite、Tsuikin；本页据此记录当前 SKU 的工作规格，不把金属、螺钿或其它 Dream Pen 材料移入。",
      S.product.key,
      "Japanese Specifications: 材質・加飾：エボナイト、堆錦",
    ),
    claim(
      `${SCOPE}-material-generic`,
      "material",
      "同一商品页后段通用 Okinawan craftsmanship 文案写轴素材为水牛角；页面未明确限定为 Kanhizakura，故作为同页来源冲突成员保留，不写入固定规格。",
      S.product.key,
      "Okinawan craftsmanship paragraph mentioning 水牛角",
    ),
    claim(
      `${SCOPE}-nib`,
      "nib_options",
      "当前商品规格列出 JoWo #6 不锈钢、Shogun 18K 与 Keiryu nib 三条路线；它们是订单选项，不是每支笔同时附带三枚尖，也不提供未核验的线宽/弹性保证。",
      S.product.key,
      "Japanese Specifications nib lines",
    ),
    claim(
      `${SCOPE}-feed`,
      "feed_options",
      "当前商品页列出 plastic、ebonite black、ebonite red 三种 feed；记录为变体路线，不把 feed 颜色当成笔身颜色，也不继承相邻型号的 feed。",
      S.product.key,
      "Japanese Specifications feed lines",
    ),
    claim(
      `${SCOPE}-filling`,
      "filling_system",
      "Kanhizakura 使用 European International Standard cartridge 或 converter；包装列出两者及 Pen Kimono、说明/保修材料与专用盒。",
      S.product.key,
      "Japanese filling mechanism and package sections",
    ),
    claim(
      `${SCOPE}-cap`,
      "cap_design",
      "官方将帽子描述为 compact air-tight cap；这是减少空气交换的设计目标，不是永不干涸或免清洗保证。",
      S.product.key,
      "Japanese Specifications compact air-tight cap line",
    ),
    claim(
      `${SCOPE}-care`,
      "maintenance_guidance",
      "Wancher 护理页建议 Urushi/Maki-e/Raden 避免直射光、干燥和极端天气，并提醒 Ebonite 不要长时间浸泡、避免化学清洁剂；本文据此给出保守护理边界。",
      S.care.key,
      "official Product Care Guide sections",
      "editorial",
    ),
    claim(
      `${SCOPE}-size-boundary`,
      "specification_boundary",
      "当前日本商品页 Size & Shape 以图片呈现，文字未公布数值尺寸、重量或整笔测量；不从相邻 Dream Pen SKU 借用数字。",
      S.product.key,
      "Size & Shape image section and absent numeric dimensions/weight",
    ),
    claim(
      `${SCOPE}-regional-price`,
      "regional_price",
      "2026-08-03 检索日本官方页为 ¥132,000 JPY（含税）；国际官方新品/系列列表为 $1,000 USD；两者是地区窗口标价，不直接换算为统一 MSRP。",
      S.arrivals.key,
      "current international new-arrival price, cross-checked with Japanese product page",
    ),
    claim(
      `${SCOPE}-media`,
      "media_identity_boundary",
      "本站原创 factual SVG 表达 Ebonite、堆锦寒绯樱、欧规 C/C 与尖材/feed 路线，标明非产品照片、非 Logo、非真实比例、非颜色校样。",
      S.svg.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: `${SCOPE}-nib-jowo-stainless-steel`,
      name: "JoWo #6 stainless steel",
      notes: "当前日本页列出的不锈钢尖路线；实际尖幅、调校与供应按订单确认。",
      sourceKey: S.product.key,
      variantKind: "nib",
      market: "Wancher Japan listing",
    },
    {
      key: `${SCOPE}-nib-shogun-18k`,
      name: "Shogun 18K",
      notes: "当前商品页列出的 18K 尖路线；不从材质名称推导弹性、湿度或固定线宽。",
      sourceKey: S.product.key,
      variantKind: "nib",
      market: "Wancher Japan listing",
    },
    {
      key: `${SCOPE}-nib-keiryu`,
      name: "Keiryu nib",
      notes: "当前商品页列出的 Keiryu 路线；页面未给出可复现的尖幅或试写性能。",
      sourceKey: S.product.key,
      variantKind: "nib",
      market: "Wancher Japan listing",
    },
    {
      key: `${SCOPE}-feed-plastic`,
      name: "plastic feed",
      notes: "官方列出的 feed 选项；不等同于笔身材料或另一支独立型号。",
      sourceKey: S.product.key,
      variantKind: "variant",
      market: "Wancher Japan listing",
    },
    {
      key: `${SCOPE}-feed-ebonite-black`,
      name: "ebonite black feed",
      notes: "官方列出的黑色 Ebonite feed 选项；实际与尖材的组合按订单确认。",
      sourceKey: S.product.key,
      variantKind: "variant",
      market: "Wancher Japan listing",
    },
    {
      key: `${SCOPE}-feed-ebonite-red`,
      name: "ebonite red feed",
      notes: "官方列出的红色 Ebonite feed 选项；不要把颜色名当作笔杆颜色。",
      sourceKey: S.product.key,
      variantKind: "variant",
      market: "Wancher Japan listing",
    },
  ],
  spec: {
    brandEntityId: PHASE388_WANCHER_BRAND_ID,
    values: {
      series_name: "Dream Pen / Ryukyu Tsuikin",
      release_year: "官方当前页面未给出 Kanhizakura 独立首发年份；读取日仅为当前资料窗口",
      origin_country: "Wancher 将 Tsuikin 置于冲绳琉球漆艺语境并称日本工匠制作；各部件完整原产地未逐项披露",
      nib: "JoWo #6 stainless steel、Shogun 18K、Keiryu nib（按订单选项）",
      fill_system: "European International Standard cartridge 或 converter",
      material: "具体商品规格：Ebonite、Tsuikin；同页水牛角通用文案作为 resolved source conflict，不作本 SKU 固定材质",
      dimensions: "官方 Size & Shape 为图片呈现，文字未公布数值尺寸",
      weight: "官方当前商品页未公布文字重量",
      price_range: "日本官方页 ¥132,000 JPY（含税）与国际列表 $1,000 USD，均为 2026-08-03 地区窗口标价",
      status: "Dream Pen / Ryukyu Tsuikin 的 Kanhizakura 具体型号；相邻 Tsuikin 主题不合并",
    },
    evidence: [
      evidence(`${SCOPE}-spec-brand`, "brand_entity_id", S.product.key, "Wancher Japanese product context"),
      evidence(`${SCOPE}-spec-series`, "series_name", S.dream.key, "Dream Pen collection and Ryukyu Tsuikin route"),
      evidence(`${SCOPE}-spec-release`, "release_year", S.product.key, "no independent launch year in current product page"),
      evidence(`${SCOPE}-spec-origin`, "origin_country", S.tsuikin.key, "Okinawan/Ryukyu craft context and conservative origin boundary"),
      evidence(`${SCOPE}-spec-nib`, "nib", S.product.key, "Japanese nib option lines"),
      evidence(`${SCOPE}-spec-fill`, "fill_system", S.product.key, "European International Standard cartridge/converter"),
      evidence(`${SCOPE}-material-specific`, "material", S.product.key, "specific Specifications: Ebonite, Tsuikin"),
      evidence(`${SCOPE}-material-generic`, "material", S.product.key, "generic Okinawan craftsmanship paragraph mentioning buffalo horn", false, "Page-level generic wording is retained only as a resolved conflict member; it is not adopted as the SKU material."),
      evidence(`${SCOPE}-spec-dimensions`, "dimensions", S.product.key, "Size & Shape image; no numeric dimensions"),
      evidence(`${SCOPE}-spec-weight`, "weight", S.product.key, "no numeric weight in current text specification"),
      evidence(`${SCOPE}-spec-price`, "price_range", S.arrivals.key, "international $1,000 listing cross-checked with Japanese ¥132,000 page"),
      evidence(`${SCOPE}-spec-status`, "status", S.product.key, "current product title and separate SKU listing"),
    ],
  },
  conflicts: [
    {
      key: `${SCOPE}-material-conflict`,
      fieldKey: "material",
      scopeKey: SCOPE,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "日本页具体 Specifications 明确写 Ebonite、Tsuikin（堆錦）；同页后段“轴素材为水牛角”属于未限定 SKU 的通用 Okinawan craftsmanship 文案。模型采用具体规格，保留通用文案为来源冲突并提示下单前向卖家确认，不把两者并列成固定材质或新增版本。",
      members: [
        {
          citationKey: `${SCOPE}-material-specific`,
          assertedValue: "具体商品 Specifications：エボナイト、堆錦（Ebonite、Tsuikin）",
        },
        {
          citationKey: `${SCOPE}-material-generic`,
          assertedValue: "同页通用 Okinawan craftsmanship：轴素材となる水牛角（water buffalo horn）",
        },
      ],
    },
  ],
  media: [
    {
      key: `${SCOPE}-primary-media`,
      title: "Dream Pen Tsuikin Kanhizakura 事实图（非产品照片）",
      sourceKey: S.svg.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创 factual SVG；非产品照片、非 Logo、非真实比例图、非颜色校样。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary",
    },
  ],
};

export const phase388WancherTsuikinKanhizakuraPacks: CuratedEntityPack[] = [
  baseBrand,
  model,
];
