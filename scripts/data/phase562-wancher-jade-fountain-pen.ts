import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
} from "../lib/curated-content-pack";
import { phase425BrandDepthRefreshPacks } from "./phase425-brand-depth-refresh";

const RETRIEVED = "2026-08-10";
export const PHASE562_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE562_JADE_ID = "phase562-wancher-jade-fountain-pen";
export const PHASE562_JADE_SLUG = "wancher-jade-fountain-pen";
export const PHASE562_JADE_NAME = "Wancher Jade Fountain Pen";
const SCOPE_KEY = "phase562-wancher-jade-fountain-pen-current";

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
  publishedAt?: string;
  author?: string;
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
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt ?? null,
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
    registryKey: "fountain-pen-graph-editorial-phase562",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase562",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作颜色证明。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  product: web({
    key: "phase562-wancher-jade-product",
    title: "Jade Fountain Pen | Wancher Pen",
    url: "https://www.wancherpen.com/products/jade-fountain-pen",
    registryKey: "wancher-official-jade-fountain-pen-phase562",
    registryName: "Wancher Pen official Jade product page",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-jade-fountain-pen",
    summary:
      "官方 exact product page：Jade Fountain Pen；PMMA Resin、21K gold nib、Plastic feed、Converter or Cartridge、128.5 mm closed、149 mm posted、13 mm/18 mm、22 g，并给出日本制造与加工声明。",
    locator: "exact product title, Sailor heading, Made in Japan, specifications, attached accessories and current price/availability",
  }),
  productJson: web({
    key: "phase562-wancher-jade-product-json",
    title: "Jade Fountain Pen product JSON | Wancher",
    url: "https://www.wancherpen.com/products/jade-fountain-pen.js",
    registryKey: "wancher-official-jade-product-json-phase562",
    registryName: "Wancher Pen product JSON endpoint",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-jade-fountain-pen",
    itemType: "json",
    publishedAt: "2023-02-10T15:35:23+09:00",
    summary:
      "官方 JSON 提供商品 ID 7902093672663、handle、2023 创建/发布元数据、vendor Sailor、七个 EF/F/MF/M/B/Kodachi 变体和 WF-SLPG-JAD-* SKU；同时保留价格与 available 的读取时态。",
    locator: "id, title, handle, vendor, created_at/published_at, tags, variants, SKU, price and available fields",
  }),
  japanProduct: web({
    key: "phase562-wancher-jade-japan-product",
    title: "ジェード・翡翠 万年筆 | Wancher Japan",
    url: "https://jp.wancherpen.com/products/jade-fountain-pen",
    registryKey: "wancher-official-jade-japan-phase562",
    registryName: "Wancher Pen Japan official Jade product page",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-jade-japan",
    summary:
      "日本官方页面说明翡翠色主题，并以日文规格列出 PMMA 树脂、21K 金尖、塑料笔芯、墨囊/转换器、128.5 mm、13.2 mm、22 g 和随附物；尺寸口径与英文页面并列保留。",
    locator: "Japanese Jade history/color sections and visible Specifications block",
  }),
  jadeCollection: web({
    key: "phase562-wancher-jade-collection",
    title: "Jade Fountain Pen collection | Wancher",
    url: "https://www.wancherpen.com/collections/jade-fountain-pen",
    registryKey: "wancher-official-jade-collection-phase562",
    registryName: "Wancher Pen official Jade collection",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-jade-collection",
    summary: "官方集合页把 Jade Fountain Pen 作为单产品集合入口，支持单独型号身份和导航边界。",
    locator: "collection title, one-product count and Jade Fountain Pen card",
  }),
  sailorCollection: web({
    key: "phase562-wancher-sailor-collaboration",
    title: "Wancher x Sailor collaboration fountain pens",
    url: "https://www.wancherpen.com/collections/sailor-collaboration/fountain-pen",
    registryKey: "wancher-official-sailor-collaboration-phase562",
    registryName: "Wancher Pen official Sailor collaboration collection",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-sailor-collaboration",
    summary: "官方合作集合页提供 Jade 的 Sailor collaboration 语境；不单独证明每个零件由 Sailor 制造。",
    locator: "Jade Fountain Pen card and Sailor collaboration collection context",
  }),
  nibGuide: web({
    key: "phase562-wancher-nib-guide",
    title: "Wancher Fountain Pen Nib Guide",
    url: "https://www.wancherpen.com/pages/nib-guide",
    registryKey: "wancher-official-nib-guide-phase562",
    registryName: "Wancher Pen official nib guide",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-nib-guide",
    summary: "官方 Nib Guide 说明 Jade 与 Sailor Professional Gear 相关兼容语境，并区分其他 Wancher 尖路线；不替代 exact SKU 清单。",
    locator: "Jade/Sailor nib compatibility rows and nib replacement guidance",
  }),
  siblingReview: web({
    key: "phase562-sailor-pro-gear-sibling-review",
    title: "Review: Sailor Professional Gear (Medium Fine nib) | Hand Over That Pen",
    url: "https://www.handoverthatpen.com/2017/05/11/review-sailor-pro-gear/",
    registryKey: "handoverthatpen-sailor-pro-gear-phase562",
    registryName: "Hand Over That Pen",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "handoverthatpen-sailor-pro-gear",
    publishedAt: "2017-05-11",
    author: "Hand Over That Pen",
    summary: "独立评测的是 Sailor Professional Gear 及 Wancher 渠道的其他配色，不是 Jade exact SKU；仅用于相邻 Pro Gear 书写观察和来源边界。",
    locator: "review identity, 21K Medium Fine observations and Wancher-channel color clarification",
  }),
  care: web({
    key: "phase562-wancher-product-care",
    title: "Wancher Product Care Guide",
    url: "https://www.wancherpen.com/pages/product-care",
    registryKey: "wancher-official-product-care-phase562",
    registryName: "Wancher Pen official product care",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-product-care",
    summary: "官方护理页提供墨囊/转换器清洁和通用材质护理边界；本页据此采用柔软布、短时清水和避免溶剂/研磨剂的保守建议。",
    locator: "converter/cartridge cleaning and general material-care guidance",
  }),
  warranty: web({
    key: "phase562-wancher-warranty",
    title: "New Warranty | Wancher Pen International",
    url: "https://www.wancherpen.com/pages/warranty",
    registryKey: "wancher-official-warranty-phase562",
    registryName: "Wancher Pen official warranty",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-warranty",
    summary: "官方保修页说明正常使用下材料/工艺缺陷通常有一年保修，并列出维护、磨损、事故、误用和未经授权维修等排除项。",
    locator: "one-year warranty scope and exclusions",
  }),
  svg: diagram(
    "phase562-wancher-jade-svg",
    "Wancher Jade Fountain Pen material, SKU and accessory boundary diagram",
    "/images/library/site-original/phase562/wancher/jade-fountain-pen.svg",
  ),
} satisfies Record<string, CuratedSource>;

const scope: CuratedScope = {
  key: SCOPE_KEY,
  scopeKey: SCOPE_KEY,
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Wancher official English catalog and Wancher Japan product page",
  nibScope: "21K gold nib; EF/F/MF/M/B/Kodachi Fine/Kodachi Medium are seven official market SKU options",
  materialScope: "PMMA Resin body; natural jade belongs to the separately described Jade Pen Pillow accessory",
  editionScope: "One Wancher Jade Fountain Pen identity with seven nib market SKUs; Sailor collaboration context is not a second model identity",
};

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: CuratedClaim["factClass"] = "core",
  confidence = factClass === "core" ? 0.98 : 0.93,
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE_KEY, locator }],
  };
}

function specEvidence(
  key: string,
  fieldKey: CuratedSpecEvidence["fieldKey"],
  sourceKey: string,
  locator: string,
  note?: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE_KEY, locator, qualifies: true, note };
}

const jadePack: CuratedEntityPack = {
  key: "phase562-wancher-jade-fountain-pen-v1",
  entityId: PHASE562_JADE_ID,
  expectedType: "pen",
  expectedSlug: PHASE562_JADE_SLUG,
  canonicalName: PHASE562_JADE_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-jade-fountain-pen-phase562.md",
  storyTitle: "Wancher Jade Fountain Pen：翡翠色主题与七个官方尖幅",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Jade Fountain Pen", language: "en", sourceKey: S.product.key },
    { alias: "Jade Pen", language: "en", sourceKey: S.product.key },
    { alias: "ジェード・翡翠 万年筆", language: "ja", sourceKey: S.japanProduct.key },
    { alias: "Wancher Jade Fountain Pen", language: "en", sourceKey: S.product.key },
    { alias: "WF-SLPG-JAD-EF", language: "en", kind: "producer_name", sourceKey: S.productJson.key },
    { alias: "WF-SLPG-JAD-F", language: "en", kind: "producer_name", sourceKey: S.productJson.key },
    { alias: "WF-SLPG-JAD-MF", language: "en", kind: "producer_name", sourceKey: S.productJson.key },
    { alias: "WF-SLPG-JAD-M", language: "en", kind: "producer_name", sourceKey: S.productJson.key },
    { alias: "WF-SLPG-JAD-B", language: "en", kind: "producer_name", sourceKey: S.productJson.key },
    { alias: "WF-SLPG-JAD-NF", language: "en", kind: "producer_name", sourceKey: S.productJson.key },
    { alias: "WF-SLPG-JAD-NM", language: "en", kind: "producer_name", sourceKey: S.productJson.key },
    { alias: "Wancher 翡翠钢笔", language: "zh", sourceKey: S.product.key },
  ],
  sources: Object.values(S),
  scopes: [scope],
  claims: [
    claim("jade-identity", "model_identity", "Jade Fountain Pen 是 Wancher 官方集合中的具体型号；商品 handle 为 jade-fountain-pen。", S.product.key, "exact product title and handle"),
    claim("jade-material", "material", "官方规格将笔身材料写为 PMMA Resin；Jade 主要是颜色和文化主题，不是天然翡翠笔身。", S.product.key, "material & art specification"),
    claim("jade-accessory-boundary", "accessory_boundary", "Jade Pen Pillow 是另行购买或加购的配件；其翡翠石材料不回填到钢笔本体。", S.product.key, "Jade Pen pillow section"),
    claim("jade-cultural-theme", "design_theme", "官方以日本绳文、弥生与江户时期的翡翠文化叙述解释薄荷绿和象牙白配色；这是设计语境，不是矿物学证明。", S.japanProduct.key, "Japanese Jade history and color sections"),
    claim("jade-japan", "manufacturing", "英文商品页声明从笔尖到笔身的流程在日本制造和加工；未公开每个组件和笔枕的独立产地证明。", S.product.key, "Made in Japan section"),
    claim("jade-nib", "nib", "官方 exact product page 给出 21K gold nib；当前资料未公布尖片尺寸、线宽公差或完整调校标准。", S.product.key, "nib specification and product heading"),
    claim("jade-variants", "market_sku", "官方 JSON 列出 EF、F、MF、M、B、Kodachi Fine、Kodachi Medium 七个同型号 market SKU。", S.productJson.key, "variant option names and productCode fields"),
    claim("jade-sailor-context", "collaboration_context", "页面标题区和 JSON vendor=SAILOR 提供 Wancher x Sailor 合作语境；它不单独证明所有零件均由 Sailor 制造，也不把型号改名为 Sailor Pro Gear。", S.sailorCollection.key, "Sailor collaboration collection and exact product context", "editorial"),
    claim("jade-feed", "feed", "官方规格写为 Plastic feed；不能借用 Dream Pen Timeless 的 #5 或气密内帽规格。", S.product.key, "feed specification", "core"),
    claim("jade-filling", "filling_system", "供墨为 Converter or Cartridge，包装清单也列出 converter 与 cartridge；当前资料没有授权 eyedropper 使用。", S.product.key, "filling mechanism and attached accessories"),
    claim("jade-dimensions", "dimensions", "英文页列出 128.5 mm closed、149 mm posted、13 mm/18 mm；日本页列出 128.5 mm、13.2 mm，测量口径并列保留。", S.product.key, "English specifications", "core"),
    claim("jade-japan-dimensions", "dimensions_market_note", "日本官方页面列出 22 g、128.5 mm（未使用时）和 13.2 mm；不同语言页面的四舍五入或测量点不强行统一。", S.japanProduct.key, "Japanese Specifications block", "editorial"),
    claim("jade-weight", "weight", "官方英文和日文页面均列出 22 g，但没有说明是否含帽、转换器、墨囊或包装。", S.product.key, "weight specification", "core"),
    claim("jade-catalog-history", "catalog_history", "商品 JSON 的 ID 为 7902093672663，created_at 为 2023-02-09、published_at 为 2023-02-10；这是电商目录元数据，不等于全球首发史。", S.productJson.key, "id, created_at and published_at fields"),
    claim("jade-price", "price_boundary", "英文页面检索时显示 $520 USD，JSON 变体价格字段为 52000/62000 日元；价格、税费、汇率和折扣随市场与时间变化。", S.product.key, "current price and duties/taxes boundary"),
    claim("jade-availability", "availability", "本次 JSON 读取时 EF 变体 available=true，其余六个变体为 false；这是读取时库存状态，不能推出停产或限量。", S.productJson.key, "variant available fields"),
    claim("jade-nib-guide", "nib_compatibility_context", "官方 Nib Guide 将 Jade 放在 Sailor 相关 Professional Gear 兼容语境；兼容说明不替代 exact SKU 的市场变体清单。", S.nibGuide.key, "Jade/Sailor nib guide rows"),
    claim("jade-secondary-boundary", "secondary_source_boundary", "Hand Over That Pen 评测的是其他 Sailor Professional Gear 配色，并非 Jade exact SKU；其书写反馈、尺寸和个体观察不能回填本型号。", S.siblingReview.key, "review identity and Wancher-channel color clarification"),
    claim("jade-care", "maintenance_guidance", "官方护理页支持墨囊/转换器清洁；本页采用柔软布、室温短时清水和避免酒精、强溶剂、研磨剂的保守建议。", S.care.key, "converter/cartridge cleaning and material-care guidance"),
    claim("jade-warranty", "warranty", "Wancher Warranty 页面说明正常使用下材料和工艺缺陷通常有一年保修，并排除维护、磨损、事故、误用和未经授权维修等。", S.warranty.key, "one-year warranty scope and exclusions"),
    claim("jade-media-boundary", "media_boundary", "本站 SVG 只解释 PMMA 本体、七个 SKU 与 Jade Pen Pillow 的身份边界；它是事实示意图，不是产品照片、Logo、比例图或颜色校样。", S.svg.key, "SVG metadata and visible boundary labels", "editorial"),
  ],
  variants: [
    ["EF", "WF-SLPG-JAD-EF"],
    ["Fine", "WF-SLPG-JAD-F"],
    ["Medium Fine", "WF-SLPG-JAD-MF"],
    ["Medium", "WF-SLPG-JAD-M"],
    ["Broad", "WF-SLPG-JAD-B"],
    ["Kodachi Fine", "WF-SLPG-JAD-NF"],
    ["Kodachi Medium", "WF-SLPG-JAD-NM"],
  ].map(([name, productCode], index) => ({
    key: `jade-${index + 1}`,
    name,
    notes: `${name} 是 Jade Fountain Pen 的官方尖幅 market SKU，不单独建立型号实体。`,
    sourceKey: S.productJson.key,
    variantKind: "market_sku" as const,
    productCode,
    market: "global",
  })),
  spec: {
    brandEntityId: PHASE562_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Jade Fountain Pen",
      release_year: "2023（官方产品 JSON created_at/published_at 元数据；不是独立全球首发史）",
      origin_country: "官方页面声明从笔尖到笔身在日本制造和加工；笔枕另有单独材料与工艺叙述",
      nib: "21K gold nib; EF/F/MF/M/B/Kodachi Fine/Kodachi Medium；WF-SLPG-JAD-*",
      fill_system: "Converter or Cartridge",
      material: "PMMA Resin；薄荷绿与象牙白翡翠色主题；非天然翡翠笔身",
      dimensions: "128.5 mm closed、149 mm posted、13 mm/18 mm（英文页）；日本页 128.5 mm、13.2 mm",
      weight: "22 g（英文与日文官方页面；是否含帽/转换器/墨囊未说明）",
      price_range: "英文页面检索时 $520 USD；JSON 变体价格为 52000/62000 日元，随市场和时间变化",
      status: "JSON 读取时 EF available=true，其余尖幅 false；不据此推断停产或限量",
    },
    evidence: [
      specEvidence("jade-brand", "brand_entity_id", S.product.key, "Wancher exact product identity"),
      specEvidence("jade-series", "series_name", S.jadeCollection.key, "one-product Jade collection"),
      specEvidence("jade-release", "release_year", S.productJson.key, "created_at/published_at metadata boundary"),
      specEvidence("jade-origin", "origin_country", S.product.key, "Made in Japan statement"),
      specEvidence("jade-nib", "nib", S.productJson.key, "seven official variant SKU options"),
      specEvidence("jade-fill", "fill_system", S.product.key, "Converter or Cartridge specification"),
      specEvidence("jade-material", "material", S.product.key, "PMMA Resin specification and Jade identity"),
      specEvidence("jade-dimensions", "dimensions", S.product.key, "English closed/posted and diameter rows", "Japanese page records the alternate 13.2 mm market wording"),
      specEvidence("jade-weight", "weight", S.product.key, "22 g specification"),
      specEvidence("jade-price", "price_range", S.product.key, "current USD price and mutable duties/taxes boundary"),
      specEvidence("jade-status", "status", S.productJson.key, "variant available fields are time-bound"),
    ],
  },
  timeline: [
    {
      key: "jade-catalog-2023",
      title: "官方商品 JSON 记录 Jade Fountain Pen 创建与发布元数据",
      eventType: "model_released",
      startDate: "2023-02-10",
      circa: false,
      description: "Wancher 当前商品 JSON 的 created_at 为 2023-02-09、published_at 为 2023-02-10；这里只记录电商目录时间，不扩展为全球首发史。",
      sourceKey: S.productJson.key,
    },
  ],
  media: [
    {
      key: "jade-factual-svg",
      title: "Jade Fountain Pen 材料、七个 SKU 与 Jade Pen Pillow 边界事实图（非产品照片）",
      sourceKey: S.svg.key,
      localPath: S.svg.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非 Logo、不按比例、不作颜色校样，不代表库存或价格。",
      sourceUrl: S.svg.url,
      usageStatus: "primary",
    },
  ],
};

const wancherBrandPack = phase425BrandDepthRefreshPacks.find(
  (pack) => pack.entityId === PHASE562_WANCHER_BRAND_ID && pack.expectedType === "brand",
);
if (!wancherBrandPack) throw new Error("Phase 562 Wancher brand pack is missing.");

export const phase562WancherJadeFountainPenPacks: CuratedEntityPack[] = [
  structuredClone(wancherBrandPack),
  jadePack,
];
