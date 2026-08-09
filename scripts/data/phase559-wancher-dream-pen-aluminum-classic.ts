import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
} from "../lib/curated-content-pack";
import { phase425BrandDepthRefreshPacks } from "./phase425-brand-depth-refresh";

const RETRIEVED = "2026-08-10";
export const PHASE559_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE559_ALUMINUM_CLASSIC_ID = "phase559-wancher-dream-pen-aluminum-classic";
export const PHASE559_ALUMINUM_CLASSIC_SLUG = "wancher-dream-pen-aluminum-classic";
export const PHASE559_ALUMINUM_CLASSIC_NAME = "Wancher Dream Pen Aluminum Classic";

const SCOPE_KEY = "phase559-wancher-aluminum-classic-current";

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
    registryKey: "fountain-pen-graph-editorial-phase559",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase559",
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
    key: "phase559-wancher-aluminum-classic-product",
    title: "Dream Pen Aluminum Classic Fountain Pen | Wancher Pen",
    url: "https://www.wancherpen.com/products/dream-pen-aluminum-classic",
    registryKey: "wancher-official-aluminum-classic-phase559",
    registryName: "Wancher Pen official product page",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-aluminum-classic",
    summary:
      "官方 exact product page：Dream Pen Aluminum Classic、EF/F/M/B、铝制笔身、Classic 金色、#6 JoWo 镀金不锈钢尖、欧规墨囊／转换器、三种 feed 与 compact air-tight cap；访问时显示售罄。",
    locator: "product title, Classic/Contemporary color sections, options, specifications and sold-out marker",
  }),
  productJson: web({
    key: "phase559-wancher-aluminum-classic-product-json",
    title: "Dream Pen Aluminum Classic product JSON | Wancher",
    url: "https://www.wancherpen.com/products/dream-pen-aluminum-classic.js",
    registryKey: "wancher-official-aluminum-classic-json-phase559",
    registryName: "Wancher Pen product JSON endpoint",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-aluminum-classic",
    itemType: "json",
    publishedAt: "2023-08-01T13:00:08+09:00",
    summary:
      "官方商品 JSON 提供 Shopify 商品 ID 8096507101399、2023 创建／发布元数据、handle、EF/F/M/B 变体、WF-DREAM-ALU-GL-EF/F/M/B SKU；weight=200 仅作未解释目录元数据，不替代店铺 41 g 规格。",
    locator: "product id, handle, created_at/published_at, options, variant SKU and raw weight metadata",
  }),
  dreamCollection: web({
    key: "phase559-wancher-dream-pen-collection",
    title: "Dream Pen Fountain Pen Collection | Wancher Official",
    url: "https://www.wancherpen.com/collections/dream-pen",
    registryKey: "wancher-official-dream-pen-collection-phase559",
    registryName: "Wancher Pen official Dream Pen collection",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-dream-pen-collection",
    summary:
      "官方集合页把 Dream Pen 作为跨材料系列入口，列出日本乌木、ABS、铝和钛等路线；只用于确认系列层级，不把相邻型号规格借给 Aluminum Classic。",
    locator: "Dream Pen introduction, material list and collection navigation",
  }),
  aluminumCollection: web({
    key: "phase559-wancher-aluminum-collection",
    title: "Dream Pen Aluminum Collection | Wancher Official",
    url: "https://www.wancherpen.com/collections/dream-pen-aluminum",
    registryKey: "wancher-official-aluminum-collection-phase559",
    registryName: "Wancher Pen official Aluminum collection",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-aluminum-collection",
    summary:
      "官方 Aluminum 集合将 Aluminum Classic 与 Aluminum Contemporary 分列；Classic 为金色、Contemporary 为玫瑰金色，集合状态会随库存变化。",
    locator: "Classic and Contemporary product cards and color boundary",
  }),
  care: web({
    key: "phase559-wancher-product-care",
    title: "Wancher Product Care Guide",
    url: "https://www.wancherpen.com/pages/product-care",
    registryKey: "wancher-official-product-care-phase559",
    registryName: "Wancher Pen official product care",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-product-care",
    summary:
      "官方护理页提供 converter/cartridge 清洁与处理路径，并分别说明 Urushi、Raden、Zogan、Matte、Titanium 等路线；未发布 Aluminum Classic 专属抛光说明，因此本页不虚构铝面护理化学剂。",
    locator: "converter/cartridge cleaning, general care, and absence of an Aluminum-specific section",
  }),
  warranty: web({
    key: "phase559-wancher-warranty",
    title: "Wancher Warranty",
    url: "https://www.wancherpen.com/pages/warranty",
    registryKey: "wancher-official-warranty-phase559",
    registryName: "Wancher Pen official warranty",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-warranty",
    summary:
      "官方保修页说明正常使用下材料／工艺缺陷的一年保修，并排除维护、磨损、事故、误用、未经授权维修、非合规墨水和自然材质差异；退换与库存时态另按页面。",
    locator: "one-year warranty, exclusions, and return/exchange terms",
  }),
  rakuten: web({
    key: "phase559-wancher-aluminum-classic-rakuten",
    title: "Wancher Dream Pen Aluminum Classic WF-DREAM-ALU-GD | Wancher official shop",
    url: "https://item.rakuten.co.jp/wancher/wf-dream-alu-gd/",
    registryKey: "wancher-official-rakuten-aluminum-classic-phase559",
    registryName: "Wancher official Rakuten shop",
    sourceType: "retailer",
    tier: "primary",
    independenceGroup: "wancher-official-rakuten-aluminum-classic",
    summary:
      "Wancher 官方 Rakuten 店铺详情给出商品编号 WF-DREAM-ALU-GD、EF/F/M/B、#6 JoWo 不锈钢尖、欧规转换器／墨囊、未使用时 152.5 mm、最大 15.3 mm、41 g、铝材及桐箱／保证书／说明书。",
    locator: "official shop product number and detail table for nib, dimensions, weight, material and package",
  }),
  siblingReview: web({
    key: "phase559-wancher-metal-sibling-review",
    title: "Wancher Dream Pen Titanium Black review | Kami to Pen",
    url: "https://kamitopen.jp/fountain-pen/wancher-dream-pen-titan-fountain-pen/",
    registryKey: "kamitopen-wancher-metal-sibling-phase559",
    registryName: "Kami to Pen",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "kamitopen-wancher-metal-sibling",
    publishedAt: "2024-01-01",
    author: "Kami to Pen",
    summary:
      "独立文章评测的是 Wancher Dream Pen Titanium Black，不是 Aluminum Classic；本页只用它建立相邻全金属型号的证据边界，不借用其尺寸、重量或书写感。",
    locator: "Titanium Black review identification, metal-body observations, dimensions and explicit sibling boundary",
  }),
  svg: diagram(
    "phase559-wancher-aluminum-classic-svg",
    "Wancher Dream Pen Aluminum Classic material and SKU boundary factual diagram",
    "/images/library/site-original/phase559/wancher/dream-pen-aluminum-classic.svg",
  ),
} satisfies Record<string, CuratedSource>;

const scope: CuratedScope = {
  key: SCOPE_KEY,
  scopeKey: SCOPE_KEY,
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Wancher official English catalog and official Japanese Rakuten shop",
  nibScope: "#6 JoWo stainless steel plated in gold for Classic; EF/F/M/B are four current market SKU options",
  materialScope: "Aluminum body with Classic gold appearance; aluminum grade and coating process are not published",
  editionScope: "One Aluminum Classic model with four market SKU variants; Contemporary remains a separate rose-gold sibling",
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

const aluminumPack: CuratedEntityPack = {
  key: "phase559-wancher-dream-pen-aluminum-classic-v1",
  entityId: PHASE559_ALUMINUM_CLASSIC_ID,
  expectedType: "pen",
  expectedSlug: PHASE559_ALUMINUM_CLASSIC_SLUG,
  canonicalName: PHASE559_ALUMINUM_CLASSIC_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-dream-pen-aluminum-classic-phase559.md",
  storyTitle: "Wancher Dream Pen Aluminum Classic：金色铝身与四个官方 SKU",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Dream Pen Aluminum Classic", language: "en", sourceKey: S.product.key },
    { alias: "Wancher Aluminum Classic", language: "en", sourceKey: S.product.key },
    { alias: "ドリームペン アルミニウム・クラシック ゴールド", language: "ja", sourceKey: S.rakuten.key },
    { alias: "WF-DREAM-ALU-GD", language: "en", kind: "producer_name", sourceKey: S.rakuten.key },
    { alias: "Wancher Dream Pen 铝制经典金色", language: "zh", sourceKey: S.product.key },
  ],
  sources: Object.values(S),
  scopes: [scope],
  claims: [
    claim(
      "aluminum-classic-identity",
      "model_identity",
      "Dream Pen Aluminum Classic 是 Wancher Dream Pen 下的金色铝制具体型号；不与 Dream Pen 系列导航、Aluminum Contemporary 或其他 Dream Pen 材料路线合并。",
      S.product.key,
      "exact product title and Classic/Contemporary sections",
    ),
    claim(
      "aluminum-classic-series",
      "collection_position",
      "Wancher Dream Pen collection 是跨材料系列入口，官方集合页将铝与乌木、ABS、钛等路线并列；集合页不替代本 SKU 的规格。",
      S.dreamCollection.key,
      "Dream Pen introduction and material navigation",
    ),
    claim(
      "aluminum-classic-color-boundary",
      "color_variant_boundary",
      "Classic 为金色外观，Contemporary 为玫瑰金色相邻商品；两者不是同一型号的普通颜色后缀。",
      S.aluminumCollection.key,
      "Classic and Contemporary product cards and color names",
    ),
    claim(
      "aluminum-classic-material",
      "material",
      "官方规格将基础材料列为 Aluminum；金色是 Classic 外观，不等于整支笔使用黄金或贵金属。",
      S.product.key,
      "Base material specification and Classic color description",
    ),
    claim(
      "aluminum-classic-thermal-boundary",
      "material_usage_context",
      "官方说明铝笔身初触偏凉并会随手部热量变暖；这是品牌材料说明，不是本项目的独立长期书写测试。",
      S.product.key,
      "Sleek finishing touch and thermal conductivity paragraph",
    ),
    claim(
      "aluminum-classic-json-history",
      "catalog_history",
      "官方产品 JSON 的 created_at 为 2023-07-31、published_at 为 2023-08-01；这是电商目录元数据，不足以证明独立全球首发史。",
      S.productJson.key,
      "created_at and published_at fields",
    ),
    claim(
      "aluminum-classic-nib",
      "nib",
      "官方规格为 #6 JoWo stainless steel plated in Gold and or Rose Gold；Classic 当前商品选项为 EF、F、M、B，不是 14K 或 18K 金尖。",
      S.product.key,
      "nib specification and title option selector",
    ),
    claim(
      "aluminum-classic-skus",
      "market_sku",
      "官方产品 JSON 列出 WF-DREAM-ALU-GL-EF、WF-DREAM-ALU-GL-F、WF-DREAM-ALU-GL-M、WF-DREAM-ALU-GL-B 四个 Classic 尖幅 SKU；它们是同一型号的市场变体。",
      S.productJson.key,
      "variant SKU fields and EF/F/M/B option list",
    ),
    claim(
      "aluminum-classic-feed",
      "feed",
      "官方规格列出 plastic、ebonite black、ebonite red 三种 feed 语境，但没有证明每个尖幅与某一种 feed 固定配对。",
      S.product.key,
      "feed specification",
    ),
    claim(
      "aluminum-classic-filling",
      "filling_system",
      "供墨为 converter 或 European International Standard cartridge；页面没有授权把铝制笔身当作 eyedropper 使用。",
      S.product.key,
      "filling mechanism specification",
    ),
    claim(
      "aluminum-classic-cap",
      "cap",
      "官方列出 compact air-tight cap，用于帮助减少干墨问题；这不是永不干墨的保证。",
      S.product.key,
      "compact air-tight cap specification",
    ),
    claim(
      "aluminum-classic-dimensions",
      "dimensions",
      "Wancher 官方 Rakuten 店铺详情列出未使用时长度 152.5 mm、最大直径 15.3 mm；字段口径不等于合盖、未合盖和握位的全部尺寸。",
      S.rakuten.key,
      "official shop detail rows for length and maximum diameter",
    ),
    claim(
      "aluminum-classic-weight-reconciliation",
      "weight_reconciliation",
      "官方 Rakuten 店铺规格列出 41 g；当前产品 JSON 的 weight=200 没有解释称量口径，因此只保留为未解释目录元数据，不改写手持重量。",
      S.rakuten.key,
      "official shop weight row; cross-check against product JSON metadata",
    ),
    claim(
      "aluminum-classic-packaging",
      "packaging",
      "官方店铺详情列出 converter、cartridge、保证书、说明书和专用桐箱；包装应随具体订单和市场核对。",
      S.rakuten.key,
      "official shop accessories list",
    ),
    claim(
      "aluminum-classic-care",
      "maintenance_guidance",
      "官方护理页提供 converter/cartridge 的清洁路径，但未给出 Aluminum Classic 专属抛光剂；本页建议柔软布轻拭并避开酸性、研磨性和溶剂清洁剂。",
      S.care.key,
      "converter/cartridge cleaning and general care guidance",
    ),
    claim(
      "aluminum-classic-warranty",
      "warranty",
      "Wancher 保修页说明正常使用下材料和工艺缺陷通常有一年保修，并排除日常维护、磨损、事故、误用、未经授权维修及非合规墨水或填充物。",
      S.warranty.key,
      "one-year warranty scope and exclusions",
    ),
    claim(
      "aluminum-classic-status",
      "availability",
      "官方英文商品页在检索时显示 Sold out；这是当前库存状态，不足以推出停产、限量数量或二手稀有度。",
      S.product.key,
      "current sold-out marker",
    ),
    claim(
      "aluminum-classic-price",
      "price_boundary",
      "官方英文页面在检索时显示 $400 USD，当前地区产品 JSON 另返回 CNY 价格元数据；价格、币种、税费和库存会变化，不作为固定 MSRP。",
      S.product.key,
      "current product price and duties/taxes notice",
    ),
    claim(
      "aluminum-classic-sibling-review-boundary",
      "secondary_source_boundary",
      "Kami to Pen 的独立文章评测 Wancher Dream Pen Titanium Black，不是 Aluminum Classic；其尺寸、重量、重心和书写感不能回填本型号。",
      S.siblingReview.key,
      "review title, metal sibling identification and model-specific boundary",
    ),
    claim(
      "aluminum-classic-media-boundary",
      "media_boundary",
      "本站 SVG 只用于解释铝材、金色、四个 SKU 与 Contemporary 兄弟边界；它是事实示意图，不是产品照片、Logo、比例图或颜色校样。",
      S.svg.key,
      "SVG metadata and visible non-photo/non-logo/not-to-scale/non-colour-proof labels",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "aluminum-classic-ef",
      name: "EF",
      notes: "Classic gold market SKU WF-DREAM-ALU-GL-EF；尖幅选项，不单独建立型号实体。",
      sourceKey: S.productJson.key,
      variantKind: "market_sku",
      productCode: "WF-DREAM-ALU-GL-EF",
      market: "global",
    },
    {
      key: "aluminum-classic-f",
      name: "F",
      notes: "Classic gold market SKU WF-DREAM-ALU-GL-F；尖幅选项，不单独建立型号实体。",
      sourceKey: S.productJson.key,
      variantKind: "market_sku",
      productCode: "WF-DREAM-ALU-GL-F",
      market: "global",
    },
    {
      key: "aluminum-classic-m",
      name: "M",
      notes: "Classic gold market SKU WF-DREAM-ALU-GL-M；尖幅选项，不单独建立型号实体。",
      sourceKey: S.productJson.key,
      variantKind: "market_sku",
      productCode: "WF-DREAM-ALU-GL-M",
      market: "global",
    },
    {
      key: "aluminum-classic-b",
      name: "B",
      notes: "Classic gold market SKU WF-DREAM-ALU-GL-B；尖幅选项，不单独建立型号实体。",
      sourceKey: S.productJson.key,
      variantKind: "market_sku",
      productCode: "WF-DREAM-ALU-GL-B",
      market: "global",
    },
  ],
  spec: {
    brandEntityId: PHASE559_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Dream Pen Aluminum",
      release_year: "2023（官方产品 JSON created_at/published_at 元数据；不是独立全球首发史）",
      origin_country: "Wancher 官方商品身份；当前资料未对整支笔及各组件作统一产地声明",
      nib: "#6 JoWo stainless steel plated in gold; EF/F/M/B；Classic SKU 为 WF-DREAM-ALU-GL-EF/F/M/B",
      fill_system: "Converter or European International Standard cartridge",
      material: "Aluminum body; Classic gold appearance；铝材牌号与表面处理工艺未公布",
      dimensions: "152.5 mm 未使用时长度；最大直径 15.3 mm（Wancher 官方 Rakuten 店铺详情）",
      weight: "41 g（Wancher 官方 Rakuten 店铺详情）；产品 JSON 的 200 为未解释目录元数据，不采用为手持重量",
      price_range: "官方英文页面检索时 $400 USD；当前地区 JSON 返回 CNY 价格元数据；价格、税费和库存时态变化",
      status: "官方英文页面检索时 Sold out；不据此推断停产或限量",
    },
    evidence: [
      specEvidence("aluminum-classic-brand", "brand_entity_id", S.product.key, "Wancher exact product identity"),
      specEvidence("aluminum-classic-series", "series_name", S.dreamCollection.key, "Dream Pen collection material hierarchy"),
      specEvidence("aluminum-classic-release", "release_year", S.productJson.key, "created_at/published_at metadata with historical boundary"),
      specEvidence("aluminum-classic-origin", "origin_country", S.product.key, "Wancher product identity without a full component-origin claim"),
      specEvidence("aluminum-classic-nib", "nib", S.productJson.key, "EF/F/M/B variants and official SKU codes"),
      specEvidence("aluminum-classic-fill", "fill_system", S.product.key, "converter or European International Standard cartridge"),
      specEvidence("aluminum-classic-material", "material", S.product.key, "Aluminum base material and Classic gold section"),
      specEvidence("aluminum-classic-dimensions", "dimensions", S.rakuten.key, "152.5 mm unused length and 15.3 mm maximum diameter"),
      specEvidence("aluminum-classic-weight", "weight", S.rakuten.key, "official shop 41 g row; JSON 200 boundary recorded in note"),
      specEvidence("aluminum-classic-price", "price_range", S.product.key, "current USD listing and mutable duties/taxes boundary"),
      specEvidence("aluminum-classic-status", "status", S.product.key, "current sold-out marker without production inference"),
    ],
  },
  timeline: [
    {
      key: "aluminum-classic-catalog-2023",
      title: "官方产品 JSON 记录 Aluminum Classic 创建与发布元数据",
      eventType: "model_released",
      startDate: "2023-08-01",
      circa: false,
      description: "Wancher 当前商品 JSON 的 created_at 为 2023-07-31、published_at 为 2023-08-01；这里只记录电商目录元数据，不把它扩展为完整全球首发史。",
      sourceKey: S.productJson.key,
    },
  ],
  media: [
    {
      key: "aluminum-classic-factual-svg",
      title: "Aluminum Classic 材料、四个 SKU 与 Contemporary 边界事实图（非产品照片）",
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
  (pack) => pack.entityId === PHASE559_WANCHER_BRAND_ID && pack.expectedType === "brand",
);
if (!wancherBrandPack) throw new Error("Phase 559 Wancher brand pack is missing.");

export const phase559WancherDreamPenAluminumClassicPacks: CuratedEntityPack[] = [
  structuredClone(wancherBrandPack),
  aluminumPack,
];
