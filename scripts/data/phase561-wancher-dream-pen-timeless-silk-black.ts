import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
} from "../lib/curated-content-pack";
import { phase425BrandDepthRefreshPacks } from "./phase425-brand-depth-refresh";

const RETRIEVED = "2026-08-10";
export const PHASE561_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE561_TIMELESS_ID = "phase561-wancher-dream-pen-timeless-silk-black";
export const PHASE561_TIMELESS_SLUG = "wancher-dream-pen-timeless-silk-black";
export const PHASE561_TIMELESS_NAME = "Wancher Dream Pen Timeless - Silk Black";
const SCOPE_KEY = "phase561-wancher-dream-pen-timeless-silk-black-current";

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
    registryKey: "fountain-pen-graph-editorial-phase561",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase561",
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
    key: "phase561-wancher-timeless-product",
    title: "Dream Pen Timeless - Silk Black Fountain Pen | Wancher Pen",
    url: "https://www.wancherpen.com/products/dream-pen-timeless-silk-black",
    registryKey: "wancher-official-timeless-silk-black-phase561",
    registryName: "Wancher Pen official product page",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-timeless-silk-black",
    summary:
      "官方 exact product page：Dream Pen Timeless - Silk Black；不锈钢 #5 螺纹尖、Fine/Medium、Nikko EBONITE 乌木、Mini Converter/欧规墨囊、塑料 feed、气密内帽、木盒与 Pen Kimono；访问时显示售罄。",
    locator: "exact product title, Important Note, material/technique, specifications, packaging and sold-out marker",
  }),
  productJson: web({
    key: "phase561-wancher-timeless-product-json",
    title: "Dream Pen Timeless - Silk Black product JSON | Wancher",
    url: "https://www.wancherpen.com/products/dream-pen-timeless-silk-black.js",
    registryKey: "wancher-official-timeless-silk-black-json-phase561",
    registryName: "Wancher Pen product JSON endpoint",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-timeless-silk-black",
    itemType: "json",
    publishedAt: "2023-02-16T12:24:40+09:00",
    summary:
      "官方 JSON 提供商品 ID 7905161674967、handle、2023 创建/发布元数据、Fine/Medium 变体和 WF-EB-DREAM-SKBK-JR-F/M SKU；weight=200 仅保留为未解释的电商元数据。",
    locator: "id, title, handle, created_at/published_at, options, variant SKU, tags and raw weight metadata",
  }),
  japanCollection: web({
    key: "phase561-wancher-timeless-japan-collection",
    title: "ドリームペンタイムレス・Dream Pen Timeless | Wancher Japan",
    url: "https://jp.wancherpen.com/collections/dream-pen-timeless",
    registryKey: "wancher-official-japan-timeless-collection-phase561",
    registryName: "Wancher Pen Japan official Timeless collection",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-japan-timeless-collection",
    summary:
      "日本官方系列页说明 Timeless 的紧凑尺寸、乌木和气密内帽，并列出 135 mm、16 g；只用于 Timeless 系列规格与日本站语境，不替代英文 exact SKU 的尖幅和商品 JSON。",
    locator: "Japanese Timeless introduction, compact-size explanation and visible 135 mm/16 g specification",
  }),
  dreamCollection: web({
    key: "phase561-wancher-dream-pen-collection",
    title: "Dream Pen Fountain Pen Collection | Wancher Official",
    url: "https://www.wancherpen.com/collections/dream-pen",
    registryKey: "wancher-official-dream-pen-collection-phase561",
    registryName: "Wancher Pen official Dream Pen collection",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-dream-pen-collection",
    summary:
      "官方 Dream Pen 集合页提供跨材料系列边界；乌木、铝、ABS、钛和漆艺等路线并列展示，不能把系列页当作 Timeless 的统一规格表。",
    locator: "Dream Pen introduction, material map and collection navigation",
  }),
  blog: web({
    key: "phase561-wancher-24-pens-2024",
    title: "24 Pens for 2024 | Wancher Pen",
    url: "https://www.wancherpen.com/blogs/news/24-pens-for-2024",
    registryKey: "wancher-official-24-pens-2024-phase561",
    registryName: "Wancher Pen official editorial blog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-24-pens-2024",
    publishedAt: "2024-01-01",
    summary:
      "Wancher 官方 2024 推荐文章将 Timeless - Silk Black 作为更适合小手的紧凑 Dream Pen 选择；这是品牌选购语境，不是独立长期书写测评。",
    locator: "Dream Pen Timeless: Silk Black recommendation paragraph",
  }),
  care: web({
    key: "phase561-wancher-product-care",
    title: "Wancher Product Care Guide",
    url: "https://www.wancherpen.com/pages/product-care",
    registryKey: "wancher-official-product-care-phase561",
    registryName: "Wancher Pen official product care",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-product-care",
    summary:
      "官方护理页提供墨囊/转换器清洁和不同材质的通用处理边界；未发布 Timeless 专属化学清洁剂或拆解流程，因此正文采用柔软布、短时清水和避免溶剂的保守建议。",
    locator: "converter/cartridge cleaning, material care and general maintenance guidance",
  }),
  warranty: web({
    key: "phase561-wancher-warranty",
    title: "Wancher Warranty",
    url: "https://www.wancherpen.com/pages/warranty",
    registryKey: "wancher-official-warranty-phase561",
    registryName: "Wancher Pen official warranty",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "wancher-official-warranty",
    summary:
      "官方保修页说明正常使用下材料/工艺缺陷通常有一年保修，同时排除维护、磨损、事故、误用、未经授权维修和非合规墨水等情形。",
    locator: "one-year warranty scope, exclusions and return boundary",
  }),
  siblingReview: web({
    key: "phase561-wancher-metal-sibling-review",
    title: "Wancher Dream Pen Titanium Black review | Kami to Pen",
    url: "https://kamitopen.jp/fountain-pen/wancher-dream-pen-titan-fountain-pen/",
    registryKey: "kamitopen-wancher-metal-sibling-phase561",
    registryName: "Kami to Pen",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "kamitopen-wancher-metal-sibling",
    publishedAt: "2024-01-01",
    author: "Kami to Pen",
    summary:
      "独立文章评测的是 Wancher Dream Pen Titanium Black，不是 Timeless；只用于相邻型号的比较边界，不借用钛款尺寸、重量或书写感。",
    locator: "review title, Titanium Black identification and model-specific observations",
  }),
  svg: diagram(
    "phase561-wancher-timeless-svg",
    "Wancher Dream Pen Timeless Silk Black factual boundary diagram",
    "/images/library/site-original/phase561/wancher/dream-pen-timeless-silk-black.svg",
  ),
} satisfies Record<string, CuratedSource>;

const scope: CuratedScope = {
  key: SCOPE_KEY,
  scopeKey: SCOPE_KEY,
  validFrom: RETRIEVED,
  productionState: "current",
  market: "Wancher official English catalog and Wancher Japan Timeless collection",
  nibScope: "Stainless steel #5 screw-type nib; Fine and Medium are two current catalog SKU options",
  materialScope: "Nikko EBONITE in Tokyo is the product-page material statement; surface treatment and grade details are not published",
  editionScope: "One Dream Pen Timeless - Silk Black model with two market SKU variants; True Ebonite Silk Black is a separate sibling identity",
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

const timelessPack: CuratedEntityPack = {
  key: "phase561-wancher-dream-pen-timeless-silk-black-v1",
  entityId: PHASE561_TIMELESS_ID,
  expectedType: "pen",
  expectedSlug: PHASE561_TIMELESS_SLUG,
  canonicalName: PHASE561_TIMELESS_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-dream-pen-timeless-silk-black-phase561.md",
  storyTitle: "Wancher Dream Pen Timeless - Silk Black：紧凑乌木与两个官方尖幅 SKU",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Dream Pen Timeless - Silk Black", language: "en", sourceKey: S.product.key },
    { alias: "Wancher Dream Pen Timeless Silk Black", language: "en", sourceKey: S.product.key },
    { alias: "ドリームペンタイムレス・シルクブラック", language: "ja", sourceKey: S.japanCollection.key },
    { alias: "WF-EB-DREAM-SKBK-JR-F", language: "en", kind: "producer_name", sourceKey: S.productJson.key },
    { alias: "WF-EB-DREAM-SKBK-JR-M", language: "en", kind: "producer_name", sourceKey: S.productJson.key },
    { alias: "Wancher Dream Pen Timeless 丝黑", language: "zh", sourceKey: S.product.key },
  ],
  sources: Object.values(S),
  scopes: [scope],
  claims: [
    claim(
      "timeless-identity",
      "model_identity",
      "Dream Pen Timeless - Silk Black 是 Wancher Dream Pen 下的紧凑型乌木具体型号；它与 True Ebonite Silk Black 和系列导航页保持独立身份。",
      S.product.key,
      "exact product title and separate product handle",
    ),
    claim(
      "timeless-series",
      "collection_position",
      "Dream Pen collection 是跨材料系列入口；它提供乌木、铝、ABS、钛和漆艺等导航语境，不替代 Timeless 的规格。",
      S.dreamCollection.key,
      "Dream Pen material map and collection navigation",
    ),
    claim(
      "timeless-compact-boundary",
      "size_position",
      "Wancher 日本官方系列页把 Timeless 说明为比常规 Dream Pen 更紧凑的形状，并列出 135 mm 与 16 g。",
      S.japanCollection.key,
      "compact-size explanation and visible specification rows",
    ),
    claim(
      "timeless-material",
      "material",
      "官方商品页将材料写为来自东京 Nikko EBONITE 的 Ebonite；品牌的温润与随使用变化叙述不等于耐久实验结论。",
      S.product.key,
      "Material and technique section",
    ),
    claim(
      "timeless-togi",
      "craft_process",
      "官方说明将逐件雕刻和手工研磨与日本刀研磨所称的 Togi 美学联系起来；这是品牌工艺叙述，不是历史复刻证明。",
      S.product.key,
      "Togi and hand-polishing description",
    ),
    claim(
      "timeless-nib",
      "nib",
      "当前 exact product page 给出 stainless steel #5 screw-type nib，Fine 与 Medium；不能借用相邻 Dream Pen 的 #6 或金尖规格。",
      S.product.key,
      "Important Note and nib specification",
    ),
    claim(
      "timeless-skus",
      "market_sku",
      "官方 JSON 列出 WF-EB-DREAM-SKBK-JR-F 与 WF-EB-DREAM-SKBK-JR-M 两个尖幅 SKU；它们是同一型号的 market_sku 变体。",
      S.productJson.key,
      "variant SKU fields and Fine/Medium option list",
    ),
    claim(
      "timeless-feed",
      "feed",
      "官方规格写为 Plastic only feed；不因为其他 Dream Pen 页面出现 ebonite feed 就回填到 Timeless。",
      S.product.key,
      "feed specification",
    ),
    claim(
      "timeless-filling",
      "filling_system",
      "供墨为 Mini Converter 或 European International Standard cartridge；当前资料没有授权将笔身作为 eyedropper 使用。",
      S.product.key,
      "filling mechanism specification",
    ),
    claim(
      "timeless-cap",
      "cap",
      "官方列出 compact air-tight cap，用于帮助减少墨水干燥，不是永不干墨的保证。",
      S.product.key,
      "compact air-tight cap specification",
    ),
    claim(
      "timeless-dimensions",
      "dimensions",
      "Wancher 日本官方 Timeless 页列出 135 mm；未说明合盖、取帽或插帽的全部测量姿态。",
      S.japanCollection.key,
      "visible length specification and size section",
    ),
    claim(
      "timeless-weight-reconciliation",
      "weight_reconciliation",
      "日本官方页列出 16 g；当前产品 JSON 的 weight=200 没有解释称量口径，因此只保留为未解释目录元数据。",
      S.japanCollection.key,
      "official 16 g row; cross-check against product JSON metadata",
    ),
    claim(
      "timeless-packaging",
      "packaging",
      "官方商品页列出 Traditional Japanese Wooden Box、Pen Kimono、说明材料、Converter 与 Cartridge；具体订单和市场仍需核对。",
      S.product.key,
      "packaging section",
    ),
    claim(
      "timeless-catalog-history",
      "catalog_history",
      "官方产品 JSON 的 created_at 为 2023-02-14、published_at 为 2023-02-16；这是电商目录元数据，不足以证明全球首发史。",
      S.productJson.key,
      "created_at and published_at fields",
    ),
    claim(
      "timeless-selection-context",
      "selection_context",
      "Wancher 2024 官方文章把 Timeless - Silk Black 推荐给觉得常规 Dream Pen 偏大的读者；这是品牌选购语境，不是独立书写测评。",
      S.blog.key,
      "Timeless recommendation paragraph",
    ),
    claim(
      "timeless-care",
      "maintenance_guidance",
      "官方护理页提供墨囊/转换器的清洁路径；当前资料没有 Timeless 专属抛光剂，因此建议柔软布、短时清水和避免溶剂或研磨剂。",
      S.care.key,
      "converter/cartridge cleaning and general care guidance",
    ),
    claim(
      "timeless-warranty",
      "warranty",
      "Wancher 保修页说明正常使用下材料和工艺缺陷通常有一年保修，并排除维护、磨损、事故、误用、未经授权维修和非合规墨水等。",
      S.warranty.key,
      "one-year warranty scope and exclusions",
    ),
    claim(
      "timeless-status",
      "availability",
      "官方英文商品页在检索时显示 Sold out；这是库存时态，不足以推出停产、限量或二手稀有度。",
      S.product.key,
      "current sold-out marker",
    ),
    claim(
      "timeless-price",
      "price_boundary",
      "官方英文页面在检索时显示 $140 USD；价格、币种、税费、折扣和库存会随地区和时间变化，不作为固定 MSRP。",
      S.product.key,
      "current product price and duties/taxes boundary",
    ),
    claim(
      "timeless-sibling-review-boundary",
      "secondary_source_boundary",
      "Kami to Pen 的独立文章评测 Wancher Dream Pen Titanium Black，不是 Timeless；其尺寸、重量、重心和书写感不能回填本型号。",
      S.siblingReview.key,
      "review title, Titanium Black identification and sibling boundary",
    ),
    claim(
      "timeless-json-junior-boundary",
      "catalog_label_boundary",
      "当前 JSON tags 与图片文件名出现 junior/true-ebonite-junior 字样，但官方标题和 handle 仍是 Timeless；这些目录标签不单独改写 canonical identity。",
      S.productJson.key,
      "tags and image filename metadata compared with exact title/handle",
    ),
    claim(
      "timeless-media-boundary",
      "media_boundary",
      "本站 SVG 只用于解释 Timeless、两个 SKU 与 True Ebonite Silk Black 的身份边界；它是事实示意图，不是产品照片、Logo、比例图或颜色校样。",
      S.svg.key,
      "SVG metadata and visible non-photo/non-logo/not-to-scale/non-colour-proof labels",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "timeless-silk-black-f",
      name: "Fine",
      notes: "Timeless Silk Black market SKU WF-EB-DREAM-SKBK-JR-F；尖幅选项，不单独建立型号实体。",
      sourceKey: S.productJson.key,
      variantKind: "market_sku",
      productCode: "WF-EB-DREAM-SKBK-JR-F",
      market: "global",
    },
    {
      key: "timeless-silk-black-m",
      name: "Medium",
      notes: "Timeless Silk Black market SKU WF-EB-DREAM-SKBK-JR-M；尖幅选项，不单独建立型号实体。",
      sourceKey: S.productJson.key,
      variantKind: "market_sku",
      productCode: "WF-EB-DREAM-SKBK-JR-M",
      market: "global",
    },
  ],
  spec: {
    brandEntityId: PHASE561_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Dream Pen Timeless",
      release_year: "2023（官方产品 JSON created_at/published_at 元数据；不是独立全球首发史）",
      origin_country: "Wancher 官方商品身份；材料写为 Nikko EBONITE in Tokyo，整支笔的统一产地声明未公布",
      nib: "Stainless steel #5 screw-type nib; Fine/Medium；SKU 为 WF-EB-DREAM-SKBK-JR-F/M",
      fill_system: "Mini Converter or European International Standard cartridge",
      material: "Ebonite from Nikko EBONITE in Tokyo; Silk Black 外观；表面处理工程细节未公布",
      dimensions: "135 mm（Wancher Japan Timeless 系列页；测量姿态未在可见规格中完整说明）",
      weight: "16 g（Wancher Japan Timeless 系列页）；产品 JSON 的 200 为未解释目录元数据，不采用为手持重量",
      price_range: "官方英文页面检索时 $140 USD；币种、税费、库存和价格随地区与时间变化",
      status: "官方英文页面检索时 Sold out；不据此推断停产或限量",
    },
    evidence: [
      specEvidence("timeless-brand", "brand_entity_id", S.product.key, "Wancher exact product identity"),
      specEvidence("timeless-series", "series_name", S.japanCollection.key, "Timeless collection identity and compact-size context"),
      specEvidence("timeless-release", "release_year", S.productJson.key, "created_at/published_at metadata with historical boundary"),
      specEvidence("timeless-origin", "origin_country", S.product.key, "Nikko EBONITE in Tokyo material statement without a full component-origin claim"),
      specEvidence("timeless-nib", "nib", S.productJson.key, "Fine/Medium variants and official SKU codes"),
      specEvidence("timeless-fill", "fill_system", S.product.key, "Mini Converter or European International Standard cartridge"),
      specEvidence("timeless-material", "material", S.product.key, "Ebonite from Nikko EBONITE in Tokyo and Silk Black product identity"),
      specEvidence("timeless-dimensions", "dimensions", S.japanCollection.key, "official 135 mm row"),
      specEvidence("timeless-weight", "weight", S.japanCollection.key, "official 16 g row; JSON 200 boundary recorded in note"),
      specEvidence("timeless-price", "price_range", S.product.key, "current USD listing and mutable duties/taxes boundary"),
      specEvidence("timeless-status", "status", S.product.key, "current sold-out marker without production inference"),
    ],
  },
  timeline: [
    {
      key: "timeless-catalog-2023",
      title: "官方产品 JSON 记录 Timeless - Silk Black 创建与发布元数据",
      eventType: "model_released",
      startDate: "2023-02-16",
      circa: false,
      description: "Wancher 当前商品 JSON 的 created_at 为 2023-02-14、published_at 为 2023-02-16；这里只记录电商目录元数据，不扩展为全球首发史。",
      sourceKey: S.productJson.key,
    },
  ],
  media: [
    {
      key: "timeless-factual-svg",
      title: "Timeless Silk Black 材料、两个 SKU 与兄弟型号边界事实图（非产品照片）",
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
  (pack) => pack.entityId === PHASE561_WANCHER_BRAND_ID && pack.expectedType === "brand",
);
if (!wancherBrandPack) throw new Error("Phase 561 Wancher brand pack is missing.");

export const phase561WancherDreamPenTimelessSilkBlackPacks: CuratedEntityPack[] = [
  structuredClone(wancherBrandPack),
  timelessPack,
];
