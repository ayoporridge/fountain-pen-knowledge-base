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

export const PHASE385_WANCHER_BRAND_ID = PHASE107_WANCHER_ID;
export const PHASE385_ZOGAN_SWAN_ID = "phase385-pen-wancher-zogan-swan";
export const PHASE385_ZOGAN_SWAN_SLUG = "wancher-zogan-swan-urushi-teal";
export const PHASE385_ZOGAN_SWAN_NAME =
  "Wancher Dream Pen Zogan Swan – Urushi Teal";

const RETRIEVED = "2026-08-03";
const SCOPE = "phase385-wancher-zogan-swan-current";
const SVG_PATH =
  "/images/library/site-original/phase385/wancher/zogan-swan.svg";
const PRODUCT = "https://www.wancherpen.com/products/zogan-swan-urushi-teal";
const ZOGAN_COLLECTION =
  "https://www.wancherpen.com/collections/fountain-pen/dream-pen-zogan";
const DREAM_COLLECTION = "https://www.wancherpen.com/collections/dream-pen";
const TESTIMONIALS = "https://www.wancherpen.com/pages/our-testimonials";
const FIGBOOT = "https://www.patreon.com/posts/wancher-zogan-159219532";

function source(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup?: string;
  homepageUrl?: string;
  author?: string | null;
  publishedAt?: string | null;
  summary: string;
  locator: string;
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
    publishedAt: input.publishedAt ?? null,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: input.allowedUse ?? "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function siteOriginal(): CuratedSource {
  return {
    key: "phase385-wancher-zogan-swan-svg",
    registryKey: "fountain-pen-graph-editorial-phase385",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase385",
    title: "Wancher Zogan Swan Urushi Teal factual identity card",
    url: SVG_PATH,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创 factual SVG；表达 ABS、Teal Urushi、珍珠母贝天鹅、C/C 与四类尖材边界，非产品照片。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: SVG_PATH,
    archiveLocator:
      "project-public-asset:/images/library/site-original/phase385/wancher/zogan-swan.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900",
  };
}

const S = {
  product: source({
    key: "phase385-wancher-zogan-swan-product",
    title: "Dream Pen Zogan Swan - Urushi Teal",
    url: PRODUCT,
    registryKey: "wancher-official-zogan-swan-product-phase385",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-zogan-swan-product-phase385",
    summary:
      "官方具体商品页确认仅制作 10 支、ABS + Aizu Urushi + 珍珠母贝 Zogan、国际墨囊/转换器、四类尖材、气密帽、护理与包装。",
    locator:
      "Description, Zogan Inlay, Product Care, Specifications, Packaging and current price sections",
  }),
  zoganCollection: source({
    key: "phase385-wancher-zogan-collection",
    title: "Wancher Fountain Pen Collection – Dream Pen Zogan",
    url: ZOGAN_COLLECTION,
    registryKey: "wancher-official-zogan-collection-phase385",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-zogan-collection-phase385",
    summary:
      "官方 Zogan 集合页把 Swan 与 Sakura River、Momiji、Ada Zakura、Yuki Zuki 等具体图案/颜色 SKU 并列，用于型号边界与导航。",
    locator: "collection filter and product grid showing Zogan Swan beside other named Zogan SKUs",
  }),
  dreamCollection: source({
    key: "phase385-wancher-dream-collection",
    title: "Dream Pen Fountain Pen Collection",
    url: DREAM_COLLECTION,
    registryKey: "wancher-official-dream-collection-phase385",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-dream-collection-phase385",
    summary:
      "官方 Dream Pen collection 用于确认 Dream Pen 是跨材料与工艺的系列入口，不是一支可共享固定规格的单笔。",
    locator: "Dream Pen collection title and product-family navigation",
  }),
  testimonials: source({
    key: "phase385-wancher-zogan-swan-testimonial",
    title: "Our Testimonials – Zogan Swan Urushi Teal",
    url: TESTIMONIALS,
    registryKey: "wancher-official-testimonials-phase385",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-testimonials-phase385",
    summary:
      "Wancher 自有 Testimonials 页面托管归于 Zogan Swan Urushi Teal 的外部评价摘录；只作为体验线索，不替代独立测试。",
    locator:
      "Zogan Swan Urushi Teal testimonial entry and page heading describing reviews from fountain pen bloggers",
  }),
  figboot: source({
    key: "phase385-figboot-zogan-swan-review",
    title: "Wancher Zogan Swan Urushi Teal – Figboot on Pens sitemap",
    url: FIGBOOT,
    registryKey: "figboot-on-pens-zogan-swan-phase385",
    registryName: "Figboot on Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "figboot-on-pens-zogan-swan-phase385",
    homepageUrl: "https://www.figboot.com/",
    author: "David Parker",
    publishedAt: "2026-05-25",
    allowedUse: "metadata_only",
    summary:
      "Figboot on Pens 的公开 sitemap 列出 2026-05-25 的 Zogan Swan Urushi Teal review entry；当前可访问页面未展开全文，不从标题外推规格或写感。",
    locator: "2026 Posts entry dated May 25; title exactly names Wancher Zogan Swan Urushi Teal",
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
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const baseBrand = structuredClone(phase107WancherBrandPack);
baseBrand.key = "phase385-wancher-brand-zogan-swan-navigation-v1";
baseBrand.sources = [
  ...baseBrand.sources,
  ...Object.values(S),
].filter(
  (sourceItem, index, all) =>
    all.findIndex((candidate) => candidate.key === sourceItem.key) === index,
);
baseBrand.scopes = [
  ...baseBrand.scopes,
  {
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope:
      "Wancher 品牌页新增 Zogan Swan 具体型号导航；Dream Pen 与 Zogan 仍保留为系列/工艺入口。",
  },
  {
    key: `${SCOPE}-brand-navigation`,
    scopeKey: `${SCOPE}-brand-navigation`,
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope:
      "Wancher 品牌页新增 Dream Pen Zogan Swan – Urushi Teal 具体型号入口；Dream Pen 与 Zogan 仍保留为系列/工艺导航，不与相邻 SKU 合并。",
  },
];
baseBrand.claims = [
  ...baseBrand.claims,
  claim(
    `${SCOPE}-brand-navigation-claim`,
    "series_navigation",
    "Wancher 品牌页新增 Dream Pen Zogan Swan – Urushi Teal 具体型号入口；它属于 Dream Pen 的 Zogan 工艺路线，但不取代 Dream Pen 系列导航，也不与 Sakura River、Momiji 或 Yuki Zuki 合并。",
    S.zoganCollection.key,
    "official Zogan collection product grid and named SKU boundary",
  ),
];

const model: CuratedEntityPack = {
  key: `${PHASE385_ZOGAN_SWAN_ID}-v1`,
  entityId: PHASE385_ZOGAN_SWAN_ID,
  expectedType: "pen",
  expectedSlug: PHASE385_ZOGAN_SWAN_SLUG,
  canonicalName: PHASE385_ZOGAN_SWAN_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/wancher-zogan-swan-urushi-teal-phase385.md",
  storyTitle: "Wancher Zogan Swan：湖水色 Urushi 与珍珠母贝天鹅",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Dream Pen Zogan Swan - Urushi Teal", language: "en", sourceKey: S.product.key },
    { alias: "Wancher Zogan Swan Urushi Teal", language: "en", sourceKey: S.figboot.key },
    { alias: "Zogan Swan Urushi Teal", language: "en", sourceKey: S.zoganCollection.key },
    { alias: "Wancher Dream Pen 象嵌天鹅 湖水蓝漆", language: "zh", sourceKey: S.product.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Wancher official current product and independent review listing",
      nibScope:
        "#6 JoWo stainless steel、Keiryu、Keiryu Kodachi、Shogun 18K；实际尖幅与 feed 按订单 SKU",
      materialScope:
        "ABS 基材、Aizu Urushi 漆面、珍珠母贝 Zogan；天然贝片与手工漆面存在外观差异",
      editionScope:
        "限定 10 支的 Zogan Swan Urushi Teal；与相邻 Zogan 图案/颜色 SKU 分离",
    },
    {
      key: `${SCOPE}-boundary`,
      scopeKey: `${SCOPE}-boundary`,
      productionState: "current",
      editionScope:
        "不继承 Dream Pen 系列导航、Zogan Sakura River/Momiji/Yuki Zuki、其他 Urushi 或 Wancher 相邻 SKU 的尺寸、重量、材质和媒体",
    },
  ],
  claims: [
    claim(
      `${SCOPE}-identity`,
      "model_identity",
      "Dream Pen Zogan Swan – Urushi Teal 是 Wancher 当前商品页上的具体限定型号；名称中的 Dream Pen 是系列层级，Zogan Swan 是图案/工艺主题，Urushi Teal 是当前颜色版本。",
      S.product.key,
      "official product title and Limited Edition label",
    ),
    claim(
      `${SCOPE}-limited`,
      "edition_limit",
      "官方商品页声明这款钢笔最终只制作 10 支；该数量是总量边界，不代表当前库存、编号规则或每支配置相同。",
      S.product.key,
      "Limited Edition description: only 10 pieces will ever be crafted",
    ),
    claim(
      `${SCOPE}-inspiration`,
      "design_inspiration",
      "Wancher 将天鹅图案与大分县 Shidaka Lake 的湖面景象联系起来，Teal Urushi 对应天鹅滑行的水色；这是设计叙述，不是实物颜色校样。",
      S.product.key,
      "The Swan design-inspiration section and Shidaka Lake reference",
    ),
    claim(
      `${SCOPE}-craft`,
      "craft_process",
      "官方称先由日本 Urushi artisans 完成漆艺，再由 Zogan experts 完成珍珠母贝象嵌；页面未披露整支笔和各部件的完整产地、工匠署名或认证。",
      S.product.key,
      "Zogan Inlay paragraph describing Japanese artisans and Zogan experts",
    ),
    claim(
      `${SCOPE}-material`,
      "material_and_art",
      "官方规格为 ABS、Urushi 与珍珠母贝 Zogan；ABS 是基材，Teal Aizu Urushi 是主要漆面，天鹅图案是贝片象嵌，不能改写成纯漆或整支贝雕。",
      S.product.key,
      "Specifications material and art line",
    ),
    claim(
      `${SCOPE}-nibs`,
      "nib_options",
      "官方列出 #6 JoWo 不锈钢、Keiryu、Keiryu Kodachi 与 Shogun 18K 四类尖材；它们是订单可选路线，不是每支同时附带的四支笔尖，尖幅按 SKU 核对。",
      S.product.key,
      "Specifications nib line and product option context",
    ),
    claim(
      `${SCOPE}-filling`,
      "filling_system",
      "Swan 使用 European International Standard cartridge 或 converter；包装列出 converter 与 cartridge，不把相邻 Wancher 型号的活塞或其他填充机构移入本页。",
      S.product.key,
      "Specifications filling mechanism and Packaging list",
    ),
    claim(
      `${SCOPE}-cap`,
      "cap_seal",
      "官方列出 compact air-tight cap，目标是减少墨水过早干燥；它不是永不干或免维护的保证。",
      S.product.key,
      "Specifications compact air-tight cap line",
    ),
    claim(
      `${SCOPE}-care`,
      "maintenance_guidance",
      "珍珠母贝应避免跌落和受压，用柔软布轻擦；Urushi 应避免长时间直射阳光，清洁不使用酒精、研磨剂或强溶剂，异常时交由卖家或维修者判断。",
      S.product.key,
      "Product Care instructions and conservative care boundary",
      "editorial",
    ),
    claim(
      `${SCOPE}-packaging`,
      "packaging",
      "官方包装包括传统日式木盒、Pen Kimono、说明材料、证书、converter 与 cartridge；这些是包装和追溯资料，不是整支笔产地或材质认证。",
      S.product.key,
      "Packaging section",
    ),
    claim(
      `${SCOPE}-size-boundary`,
      "specification_boundary",
      "商品页的 Size & Shape 以图片呈现，当前可核验文字没有公布数值尺寸，重量也未公布；不以相邻 Dream Pen 或 Zogan SKU 数值代替。",
      S.product.key,
      "Size & Shape image heading and absence of numeric size/weight in text",
    ),
    claim(
      `${SCOPE}-price`,
      "current_price",
      "官方商品页在 2026-08-03 检索时显示 $600 USD；税费、库存、尖材加价和交付条件随时间与目的地变化。",
      S.product.key,
      "current product price block retrieved 2026-08-03",
    ),
    claim(
      `${SCOPE}-independent-review`,
      "professional_cross_check",
      "Figboot on Pens 公开 sitemap 列出 2026-05-25 的 Wancher Zogan Swan Urushi Teal review entry；由于当前可访问页面未展开全文，本页不从标题外推尺寸、线宽、耐久或独立测量。",
      S.figboot.key,
      "2026 Posts sitemap entry dated May 25",
    ),
    claim(
      `${SCOPE}-testimonial-boundary`,
      "experience_boundary",
      "Wancher 自有 Testimonials 页面托管一条归于 Zogan Swan Urushi Teal 的正面使用感受；它是品牌页面上的外部评价摘录，只作为体验线索，不作为独立规格证明。",
      S.testimonials.key,
      "Zogan Swan Urushi Teal testimonial entry and vendor-hosted review context",
      "editorial",
    ),
    claim(
      `${SCOPE}-media`,
      "media_identity_boundary",
      "本站主图是原创 factual SVG，仅表达 Teal Urushi、贝片天鹅、ABS、C/C 与四类尖材边界；非产品照片、非 Logo、非真实比例图、非颜色校样。",
      S.svg.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: `${SCOPE}-jowo-steel`,
      name: "#6 JoWo stainless steel",
      notes: "官方列出的钢尖路线；尖幅、feed 和调校按订单 SKU 核对。",
      sourceKey: S.product.key,
      variantKind: "nib",
      market: "Wancher international listing",
    },
    {
      key: `${SCOPE}-keiryu`,
      name: "Keiryu",
      notes: "官方列出的特殊尖路线；页面未把具体线宽和书写角度写成统一规格。",
      sourceKey: S.product.key,
      variantKind: "nib",
      market: "Wancher international listing",
    },
    {
      key: `${SCOPE}-keiryu-kodachi`,
      name: "Keiryu Kodachi",
      notes: "官方列出的特殊尖路线；下单前确认尖幅、feed 和是否有额外费用。",
      sourceKey: S.product.key,
      variantKind: "nib",
      market: "Wancher international listing",
    },
    {
      key: `${SCOPE}-shogun-18k`,
      name: "Shogun 18K",
      notes: "官方列出的金尖路线；不是所有 Swan 自动附带的固定尖材。",
      sourceKey: S.product.key,
      variantKind: "nib",
      market: "Wancher international listing",
    },
  ],
  spec: {
    brandEntityId: PHASE385_WANCHER_BRAND_ID,
    values: {
      series_name: "Dream Pen Zogan Swan – Urushi Teal",
      release_year:
        "官方当前商品页与 Figboot on Pens 2026-05-25 review listing 可核验；首发年份未独立核验",
      origin_country:
        "官方称漆艺师与 Zogan 专家在日本完成相关工艺；整支笔及各部件产地未披露",
      nib: "#6 JoWo stainless steel、Keiryu、Keiryu Kodachi 或 Shogun 18K；尖幅按订单 SKU",
      fill_system: "European International Standard cartridge 或 converter",
      material: "ABS 基材、Aizu Urushi 漆面、珍珠母贝 Zogan 象嵌",
      dimensions:
        "官方 Size & Shape 为图片呈现，当前文字规格未公布数值尺寸",
      weight: "官方当前商品页未公布文字重量",
      price_range:
        "$600 USD（2026-08-03 官方商品页标价；价格、税费和库存可变）",
      status:
        "限定版；官方声明最终仅制作 10 支，库存和配置按当前订单页面核对",
    },
    evidence: [
      evidence(`${SCOPE}-brand`, "brand_entity_id", S.product.key, "Wancher official product context"),
      evidence(`${SCOPE}-series`, "series_name", S.product.key, "official product title"),
      evidence(`${SCOPE}-release`, "release_year", S.figboot.key, "2026-05-25 review listing; launch year intentionally not asserted"),
      evidence(`${SCOPE}-origin`, "origin_country", S.product.key, "Japanese Urushi artisan and Zogan expert statement; conservative boundary"),
      evidence(`${SCOPE}-nib`, "nib", S.product.key, "official nib options"),
      evidence(`${SCOPE}-fill`, "fill_system", S.product.key, "official cartridge/converter specification"),
      evidence(`${SCOPE}-material`, "material", S.product.key, "official ABS, Urushi and mother-of-pearl Zogan specification"),
      evidence(`${SCOPE}-dimensions`, "dimensions", S.product.key, "Size & Shape image heading; no text dimensions"),
      evidence(`${SCOPE}-weight`, "weight", S.product.key, "no numeric weight in current text specification"),
      evidence(`${SCOPE}-price`, "price_range", S.product.key, "current $600 USD price block retrieved 2026-08-03"),
      evidence(`${SCOPE}-status`, "status", S.product.key, "Limited Edition and only-10-pieces statement"),
    ],
  },
  media: [
    {
      key: `${SCOPE}-primary-media`,
      title: "Wancher Zogan Swan Urushi Teal 事实图（非产品照片）",
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

export const phase385WancherZoganSwanPacks: CuratedEntityPack[] = [
  baseBrand,
  model,
];
