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

export const PHASE386_WANCHER_BRAND_ID = PHASE107_WANCHER_ID;
export const PHASE386_FLUX_AZURE_ID = "phase386-pen-wancher-flux-azure";
export const PHASE386_FLUX_AZURE_SLUG = "wancher-flux-azure";
export const PHASE386_FLUX_AZURE_NAME = "Wancher FLUX – Azure";

const RETRIEVED = "2026-08-03";
const SCOPE = "phase386-wancher-flux-azure-current";
const SVG_PATH = "/images/library/site-original/phase386/wancher/flux-azure.svg";
const PRODUCT = "https://www.wancherpen.com/products/flux-azure-fountain-pen";
const JP_PRODUCT = "https://jp.wancherpen.com/products/flux-azure-fountain-pen";
const COLLECTION = "https://www.wancherpen.com/collections/flux-fountain-pen";
const FIGBOOT = "https://www.youtube.com/watch?v=AdORODxP8BQ";
const RAKUTEN = "https://item.rakuten.co.jp/wancher/wf-rc-flux-bl/";

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
  publishedAt?: string | null;
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
    key: "phase386-wancher-flux-azure-svg",
    registryKey: "fountain-pen-graph-editorial-phase386",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase386",
    title: "Wancher FLUX Azure factual identity card",
    url: SVG_PATH,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创 factual SVG；表达三角形主体、可旋转握位、平底、再生棉复合材料、供墨和尖材边界，非产品照片。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: SVG_PATH,
    archiveLocator:
      "project-public-asset:/images/library/site-original/phase386/wancher/flux-azure.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900",
  };
}

const S = {
  product: source({
    key: "phase386-wancher-flux-azure-product",
    title: "WANCHER FLUX - Azure Fountain Pen",
    url: PRODUCT,
    registryKey: "wancher-official-flux-azure-product-phase386",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-flux-azure-product-phase386",
    summary:
      "官方国际商品页确认 FLUX Azure 的三角/可调握位设计、再生棉材料、黄铜 grip、平底、尺寸重量、尖材、converter、电子证书与 $150 USD 标价。",
    locator:
      "Inspiration, Feature, Design, Specifications, Certificate of Authenticity and current price sections",
  }),
  jpProduct: source({
    key: "phase386-wancher-flux-azure-japan",
    title: "ワンチャー FLUX・Azure 万年筆",
    url: JP_PRODUCT,
    registryKey: "wancher-japan-flux-azure-product-phase386",
    registryName: "Wancher Japan official",
    independenceGroup: "wancher-japan-flux-azure-product-phase386",
    summary:
      "日本官方页交叉核对 Azure 日文名称、再生棉材质、JOWO/Keiryu/Shogun 尖、欧州/セーラー converter、螺旋帽、17.4 mm、147.3/91.8/25.2 mm 与 49/38 g。",
    locator: "商品详细规格表与舒适/设计段落",
  }),
  collection: source({
    key: "phase386-wancher-flux-collection",
    title: "FLUX Fountain Pen Collection",
    url: COLLECTION,
    registryKey: "wancher-official-flux-collection-phase386",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-flux-collection-phase386",
    summary:
      "官方 FLUX collection 用于确认 Azure 的系列位置、再生棉复合材料语境与 RE:FLUX 回收计划；不把系列宣传替代具体商品规格。",
    locator: "collection design, sustainable excellence and RE:FLUX sections",
  }),
  figboot: source({
    key: "phase386-figboot-flux-review",
    title: "Wancher Flux Review — David Figboot on Pens",
    url: FIGBOOT,
    registryKey: "figboot-on-pens-flux-azure-phase386",
    registryName: "Figboot on Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "figboot-on-pens-flux-azure-phase386",
    homepageUrl: "https://www.youtube.com/",
    author: "David Parker",
    allowedUse: "metadata_only",
    summary:
      "官方商品页嵌入的 David Figboot FLUX review video；作为独立专业评测入口交叉确认型号存在，不从视频标题或缩略图外推未读取的性能结论。",
    locator: "YouTube review URL embedded in official FLUX product page",
  }),
  rakuten: source({
    key: "phase386-wancher-flux-rakuten",
    title: "Wancher FLUX AZURE — official shop",
    url: RAKUTEN,
    registryKey: "wancher-rakuten-official-flux-azure-phase386",
    registryName: "Wancher official shop on Rakuten",
    sourceType: "retailer",
    tier: "retailer",
    independenceGroup: "wancher-rakuten-official-flux-azure-phase386",
    homepageUrl: "https://www.rakuten.co.jp/",
    summary:
      "Wancher 官方 Rakuten 店铺的日本销售窗口；用于确认地区价格/保证语境，不作为独立评测或全局 MSRP 主源。",
    locator: "official shop title, Azure listing and Japanese sale context",
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
baseBrand.key = "phase386-wancher-brand-flux-navigation-v1";
baseBrand.sources = [...baseBrand.sources, ...Object.values(S)].filter(
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
      "Wancher 品牌页新增 FLUX – Azure 具体型号入口；FLUX 保持系列导航，Azure 的颜色、结构与供墨边界不继承到 Dream Pen/Urushi/World Tree。",
  },
];
baseBrand.claims = [
  ...baseBrand.claims,
  claim(
    `${SCOPE}-brand-navigation`,
    "series_navigation",
    "Wancher 品牌页新增 FLUX – Azure 具体型号入口；它属于 FLUX 现代设计路线，不与 Dream Pen、World Tree、Urushi 或其他 Wancher 型号合并。",
    S.collection.key,
    "official FLUX collection and Azure product boundary",
  ),
];

const model: CuratedEntityPack = {
  key: `${PHASE386_FLUX_AZURE_ID}-v1`,
  entityId: PHASE386_FLUX_AZURE_ID,
  expectedType: "pen",
  expectedSlug: PHASE386_FLUX_AZURE_SLUG,
  canonicalName: PHASE386_FLUX_AZURE_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-flux-azure-phase386.md",
  storyTitle: "Wancher FLUX Azure：把握位转到适合自己的角度",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "FLUX - Azure Fountain Pen", language: "en", sourceKey: S.product.key },
    { alias: "FLUX・Azure 万年筆", language: "ja", sourceKey: S.jpProduct.key },
    { alias: "Wancher FLUX Azure", language: "en", sourceKey: S.figboot.key },
    { alias: "ワンチャー FLUX・Azure", language: "ja", sourceKey: S.jpProduct.key },
    { alias: "万佳 FLUX Azure", language: "zh", sourceKey: S.product.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Wancher official current product, Japanese shop and professional review entry",
      nibScope: "JoWo stainless steel、Keiryu、Shogun 18K；尖幅与 converter 按订单 SKU",
      materialScope: "再生棉/回收棉复合笔身、黄铜 grip、Azure 颜色层次",
      editionScope: "FLUX – Azure 具体型号；其他颜色与未来版本不合并",
    },
    {
      key: `${SCOPE}-boundary`,
      scopeKey: `${SCOPE}-boundary`,
      productionState: "current",
      editionScope:
        "不继承 Dream Pen 的 Urushi/气密帽、World Tree 的木材、Shizuku 的玻璃尖或其他 Wancher SKU 的尺寸/重量/图片",
    },
  ],
  claims: [
    claim(
      `${SCOPE}-identity`,
      "model_identity",
      "Wancher FLUX – Azure 是 FLUX collection 中的具体 Azure 颜色型号；不能把 FLUX 系列页或其他 Wancher 现代设计款当作本实体的别名。",
      S.product.key,
      "official product title and FLUX collection boundary",
    ),
    claim(
      `${SCOPE}-ergonomic`,
      "ergonomic_design",
      "官方将笔身设计为略带三角的圆角形，握位可旋转以改变笔尖角度并把重心移到另一侧；旋转握位不等于自动变线或软尖机构。",
      S.product.key,
      "Feature section describing triangular form, rotating grip and writing angle",
    ),
    claim(
      `${SCOPE}-appearance`,
      "appearance",
      "Azure 笔身由蓝色及白、黑、绿的层次组成，表面光滑但纹理像树皮；官方称每支图案不可完全复制，不能把商品图当颜色校样或限量编号证明。",
      S.product.key,
      "Design section describing blue layered pattern and non-replicable texture",
    ),
    claim(
      `${SCOPE}-flat-bottom`,
      "physical_design",
      "笔尾完全平整，可直立放置或横放在较宽的一侧以减少滚动；这是桌面稳定设计，不是防摔保证。",
      S.product.key,
      "Design section describing flat bottom and roll-stopper boundary",
    ),
    claim(
      `${SCOPE}-material`,
      "material",
      "官方规格为 Upcycled Cotton，系列页解释为 recycled cotton 进入复合材料体系；主体不是木材、ebonite 或 Urushi，握位为黄铜。",
      S.collection.key,
      "Sustainable Excellence material description and product specifications",
    ),
    claim(
      `${SCOPE}-sustainability`,
      "sustainability_program",
      "Wancher 系列页介绍 RE:FLUX 回收计划：不再保留时可联系总部安排寄回；是否适用于具体国家、运费和条件需按当前页面确认。",
      S.collection.key,
      "RE:FLUX program description and conservative eligibility boundary",
    ),
    claim(
      `${SCOPE}-dimensions`,
      "physical_specification",
      "官方规格给出直径 17.4 mm（grip maximum）、闭帽 147.3 mm、open/body 91.8 mm、grip 25.2 mm；日文页提供同组数值并写作全长/胴軸/首軸。",
      S.jpProduct.key,
      "Japanese official detailed specification table",
    ),
    claim(
      `${SCOPE}-weight`,
      "physical_specification",
      "官方规格为含帽 49 g、去帽 38 g；不同尖材、转换器和墨水会改变实际携带重量。",
      S.product.key,
      "Specifications weight with cap and without cap",
    ),
    claim(
      `${SCOPE}-cap`,
      "cap_mechanism",
      "FLUX 使用 screwcap/ねじ込み式笔帽；不把它写成 Dream Pen 的弹簧气密帽，也不把平底当作帽盖防滚锁。",
      S.jpProduct.key,
      "Japanese official cap mechanism field and family boundary",
    ),
    claim(
      `${SCOPE}-nib`,
      "nib_options",
      "官方列出 JoWo 不锈钢、Keiryu 与 Shogun 18K 三类 compatible nib；它们是配置路线，不是同一支笔同时附带三种尖，尖幅按订单核对。",
      S.product.key,
      "Specifications compatible nib line",
    ),
    claim(
      `${SCOPE}-fill`,
      "filling_system",
      "普通配置使用 European International converter；选 Shogun nib 时官方另列 Sailor proprietary converter 语境，当前商品页说明附 converter、不附 cartridge。",
      S.product.key,
      "Specifications refill mechanism and attached accessories",
    ),
    claim(
      `${SCOPE}-price`,
      "current_price",
      "官方国际商品页于 2026-08-03 显示 $150 USD；日本官方店另列 19,800 日元含税，地区价格、税费、尖材和库存会变动。",
      S.product.key,
      "current international price block retrieved 2026-08-03",
    ),
    claim(
      `${SCOPE}-certificate`,
      "certificate",
      "官方说明为减少纸张，不随笔附印刷证书，而是向收藏者发送 PDF Certificate of Authenticity；实际发送方式按订单确认。",
      S.product.key,
      "Certificate of Authenticity section",
    ),
    claim(
      `${SCOPE}-review`,
      "professional_cross_check",
      "官方商品页嵌入 David Figboot 的 FLUX review video，形成独立专业评测入口；在未读取完整视频记录前，不从标题或缩略图外推线宽、耐久和具体写感。",
      S.figboot.key,
      "YouTube review URL embedded in official product page",
    ),
    claim(
      `${SCOPE}-care`,
      "maintenance_guidance",
      "复合材料与黄铜握位应使用软布轻擦，避开酒精、漂白剂、研磨剂、强溶剂、长时间浸水和高温；供墨异常先检查 converter、feed、尖齿和握位接口，不要强拆黄铜环。",
      S.product.key,
      "material context plus conservative cleaning and service boundary",
      "editorial",
    ),
    claim(
      `${SCOPE}-media`,
      "media_identity_boundary",
      "本站主图是原创 factual SVG，仅表达三角形主体、可旋转握位、平底、再生棉复合材料、converter 和尖材路线；非产品照片、非 Logo、非真实比例图、非颜色校样。",
      S.svg.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: `${SCOPE}-jowo`,
      name: "JoWo stainless steel",
      notes: "官方列出的普通钢尖路线；具体尖幅、feed 与 converter 按订单核对。",
      sourceKey: S.product.key,
      variantKind: "nib",
      market: "Wancher international listing",
    },
    {
      key: `${SCOPE}-keiryu`,
      name: "Keiryu",
      notes: "官方列出的特殊尖路线；旋转握位改变角度，不等于 Keiryu 自动变线。",
      sourceKey: S.product.key,
      variantKind: "nib",
      market: "Wancher international listing",
    },
    {
      key: `${SCOPE}-shogun`,
      name: "Shogun 18K",
      notes: "官方列出的金尖路线；使用 Sailor proprietary converter 语境，不能套用普通国际墨囊。",
      sourceKey: S.product.key,
      variantKind: "nib",
      market: "Wancher international listing",
    },
  ],
  spec: {
    brandEntityId: PHASE386_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher FLUX – Azure",
      release_year:
        "官方当前商品页、系列页与 Figboot review video 可核验；首发年份未独立核验",
      origin_country:
        "Wancher 日本品牌商品；RE:FLUX 说明回收寄回总部，但整支笔及部件产地未完整披露",
      nib: "JoWo 不锈钢、Keiryu 或 Shogun 18K；尖幅按订单 SKU",
      fill_system:
        "European International converter；Shogun nib 使用 Sailor proprietary converter 语境",
      material: "Upcycled/recycled cotton composite resin body；brass grip section",
      dimensions:
        "直径 17.4 mm（grip maximum）；147.3 mm cap closed；91.8 mm open/body；25.2 mm grip",
      weight: "49 g with cap；38 g without cap",
      price_range:
        "$150 USD（2026-08-03 官方国际页标价；日本官方店 19,800 日元含税）",
      status:
        "FLUX collection 当前 Azure SKU；库存、尖材、converter 与价格按订单页面核对",
    },
    evidence: [
      evidence(`${SCOPE}-brand`, "brand_entity_id", S.product.key, "Wancher official product context"),
      evidence(`${SCOPE}-series`, "series_name", S.product.key, "official product title"),
      evidence(`${SCOPE}-release`, "release_year", S.figboot.key, "review entry only; launch year intentionally not asserted"),
      evidence(`${SCOPE}-origin`, "origin_country", S.collection.key, "Wancher brand and RE:FLUX context; conservative origin boundary"),
      evidence(`${SCOPE}-nib`, "nib", S.product.key, "official compatible nib options"),
      evidence(`${SCOPE}-fill`, "fill_system", S.product.key, "official converter and cartridge note"),
      evidence(`${SCOPE}-material`, "material", S.product.key, "official Upcycled Cotton and brass grip specification"),
      evidence(`${SCOPE}-dimensions`, "dimensions", S.jpProduct.key, "Japanese official dimensions"),
      evidence(`${SCOPE}-weight`, "weight", S.product.key, "official weight with/without cap"),
      evidence(`${SCOPE}-price`, "price_range", S.product.key, "current $150 USD price block retrieved 2026-08-03"),
      evidence(`${SCOPE}-status`, "status", S.collection.key, "FLUX collection and current Azure product listing"),
    ],
  },
  media: [
    {
      key: `${SCOPE}-primary-media`,
      title: "Wancher FLUX Azure 事实图（非产品照片）",
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

export const phase386WancherFluxAzurePacks: CuratedEntityPack[] = [
  baseBrand,
  model,
];
