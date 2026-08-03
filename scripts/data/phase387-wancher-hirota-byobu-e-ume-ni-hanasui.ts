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

export const PHASE387_WANCHER_BRAND_ID = PHASE107_WANCHER_ID;
export const PHASE387_HIROTA_BYOBU_UME_ID =
  "phase387-pen-wancher-hirota-byobu-e-ume-ni-hanasui";
export const PHASE387_HIROTA_BYOBU_UME_SLUG =
  "wancher-hirota-byobu-e-ume-ni-hanasui";
export const PHASE387_HIROTA_BYOBU_UME_NAME =
  "Wancher Hirota Byobu-e – Ume ni Hanasui";

const RETRIEVED = "2026-08-03";
const SCOPE = "phase387-wancher-hirota-byobu-e-ume-ni-hanasui-current";
const SVG_PATH =
  "/images/library/site-original/phase387/wancher/hirota-byobu-e-ume-ni-hanasui.svg";
const PRODUCT =
  "https://www.wancherpen.com/products/hirota-byobu-e-ume-ni-hanasui-fountain-pen";
const COLLECTION = "https://www.wancherpen.com/collections/hirota-urushi";
const ARTISANS = "https://www.wancherpen.com/pages/true-craftsmanship";
const MET =
  "https://www.metmuseum.org/ko/essays/interiors-imagined-folding-screens-garments-and-clothing-stands";
const KYOTO =
  "https://www.kyohaku.go.jp/old/eng/theme/floor1_6/past/1F-6_20201219.html";

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
    key: "phase387-wancher-hirota-byobu-ume-svg",
    registryKey: "fountain-pen-graph-editorial-phase387",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase387",
    title: "Hirota Byobu-e Ume ni Hanasui factual identity card",
    url: SVG_PATH,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创 factual SVG；表达 ebonite、Urushi、24K 金箔、梅枝、欧规 C/C 与尖材边界，非产品照片。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: SVG_PATH,
    archiveLocator:
      "project-public-asset:/images/library/site-original/phase387/wancher/hirota-byobu-e-ume-ni-hanasui.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900",
  };
}

const S = {
  product: source({
    key: "phase387-wancher-hirota-byobu-ume-product",
    title: "Hirota Byobu-e - Ume ni Hanasui (Plum Blossom)",
    url: PRODUCT,
    registryKey: "wancher-official-hirota-byobu-ume-product-phase387",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-phase387",
    summary:
      "官方具体商品页确认这是一件 Hirota Byobu-e Editor’s Collection 单件作品：Ebonite、Urushi、24K 金箔、Maki-e、Shogun 18K、欧规墨囊/转换器、塑料 feed、气密帽、包装、订单尖幅/饰面选项与当前 $2,950 USD 标价。",
    locator:
      "title, About the collection, Pen Design, Historical Background, About Master Hirota Yoko, Specifications, Size & Shape, Packaging and current price sections",
  }),
  collection: source({
    key: "phase387-wancher-hirota-collection",
    title: "Urushi Fountain Pen by Yoko Hirota — Wancher collection",
    url: COLLECTION,
    registryKey: "wancher-official-hirota-collection-phase387",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-phase387",
    summary:
      "官方 Hirota collection 解释 Hirota Urushi 的主要技术，并把具体产品按 Sabi-nuri、Chawan-iro、Kinpaku Maki-e 等路线导航；用于系列边界，不把相邻 SKU 规格移入 Ume ni Hanasui。",
    locator:
      "Hirota Urushi collection introduction, four techniques and named product navigation",
  }),
  artisans: source({
    key: "phase387-wancher-artisans-hirota",
    title: "True Craftsmanship — Master Yoko Hirota",
    url: ARTISANS,
    registryKey: "wancher-official-hirota-artisan-phase387",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-phase387",
    summary:
      "官方工匠页给出 Hirota Yoko 的 Urushi/Maki-e 经验和公开履历节点，用于创作者背景，不当作本支笔逐层工艺鉴定。",
    locator: "Master Yoko Hirota profile and background timeline",
  }),
  met: source({
    key: "phase387-met-byobu-history",
    title: "Interiors Imagined: Folding Screens, Garments, and Clothing Stands",
    url: MET,
    registryKey: "metropolitan-museum-byobu-history-phase387",
    registryName: "The Metropolitan Museum of Art",
    independenceGroup: "metropolitan-museum-phase387",
    homepageUrl: "https://www.metmuseum.org/",
    tier: "professional_secondary",
    summary:
      "大都会艺术博物馆艺术史文章解释 byōbu 的挡风/分隔空间功能、金地反光与日本折屏绘画的室内语境，用于历史背景，不声称本笔复制某件馆藏。",
    locator:
      "Byōbu definition, furnishing/decorative function, gold-leaf surface and nature-theme discussion",
  }),
  kyoto: source({
    key: "phase387-kyoto-urushi-conservation",
    title: "Preserving Lacquers through Conservation",
    url: KYOTO,
    registryKey: "kyoto-national-museum-urushi-care-phase387",
    registryName: "Kyoto National Museum",
    independenceGroup: "kyoto-national-museum-phase387",
    homepageUrl: "https://www.kyohaku.go.jp/",
    tier: "professional_secondary",
    summary:
      "京都国立博物馆保存资料说明 Urushi 对紫外线、湿度骤变与漆层维护的保守边界；用于一般护理建议，不替代 Wancher 的保修条款。",
    locator:
      "Urushi properties, ultraviolet deterioration, humidity changes and conservation discussion",
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
baseBrand.key = "phase387-wancher-brand-hirota-byobu-navigation-v1";
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
      "Wancher 品牌页新增 Hirota Byobu-e – Ume ni Hanasui 具体型号导航；Hirota Urushi 与 Byobu-e 保留为系列/工艺入口。",
  },
  {
    key: `${SCOPE}-brand-navigation`,
    scopeKey: `${SCOPE}-brand-navigation`,
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope:
      "Wancher 品牌页新增 Hirota Byobu-e – Ume ni Hanasui 入口；不把其它 Hirota、Byobu-e 季节作品或 Kinpaku Maki-e SKU 合并。",
  },
];
baseBrand.claims = [
  ...baseBrand.claims,
  claim(
    `${SCOPE}-brand-navigation-claim`,
    "series_navigation",
    "Wancher 品牌页新增 Hirota Byobu-e – Ume ni Hanasui 具体型号入口；它属于 Hirota Byobu-e Editor’s Collection，但不取代 Hirota Urushi 系列导航，也不与其它季节或梅花主题 SKU 合并。",
    S.product.key,
    "official product title and collection boundary",
  ),
];

const model: CuratedEntityPack = {
  key: `${PHASE387_HIROTA_BYOBU_UME_ID}-v1`,
  entityId: PHASE387_HIROTA_BYOBU_UME_ID,
  expectedType: "pen",
  expectedSlug: PHASE387_HIROTA_BYOBU_UME_SLUG,
  canonicalName: PHASE387_HIROTA_BYOBU_UME_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/wancher-hirota-byobu-e-ume-ni-hanasui-phase387.md",
  storyTitle:
    "Wancher Hirota Byobu-e：Ume ni Hanasui 把一折春意收进一支漆笔",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Hirota Byobu-e - Ume ni Hanasui (Plum Blossom)",
      language: "en",
      sourceKey: S.product.key,
    },
    {
      alias: "Hirota Byobu-e Ume ni Hanasui",
      language: "en",
      sourceKey: S.collection.key,
    },
    {
      alias: "Hirota Byobu-e 梅に花吸",
      language: "ja",
      sourceKey: S.product.key,
    },
    {
      alias: "Wancher 广田漆 Byobu-e 梅花",
      language: "zh",
      sourceKey: S.product.key,
    },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Wancher official current product and institutional art-history/care references",
      nibScope:
        "EF、F、MF、M、B；Keiryu Kodachi F/M/B；Shogun 18K；实际尖幅、feed 与调校按订单 SKU 核对",
      materialScope:
        "Ebonite 基材、Urushi 漆、24K Gold leaf 与手绘 Maki-e；单件作品存在自然差异",
      editionScope:
        "Hirota Byobu-e Editor’s Collection 的 Ume ni Hanasui 具体单件作品；官方称每个设计只制作一支",
    },
    {
      key: `${SCOPE}-boundary`,
      scopeKey: `${SCOPE}-boundary`,
      productionState: "current",
      editionScope:
        "不继承其它 Hirota Urushi、Byobu-e 季节作品、Kinpaku Maki-e 或 Wancher Dream Pen 的尺寸、重量、尖材、feed、价格和媒体",
    },
  ],
  claims: [
    claim(
      `${SCOPE}-identity`,
      "model_identity",
      "Hirota Byobu-e – Ume ni Hanasui（Plum Blossom）是 Wancher 当前商品页上的具体钢笔型号；Hirota Byobu-e 是编辑者系列层级，Ume ni Hanasui 是本支梅花主题作品名。",
      S.product.key,
      "official product title and Pen Design heading",
    ),
    claim(
      `${SCOPE}-one-piece`,
      "edition_limit",
      "Wancher 官方称 Hirota Byobu-e Editor’s Collection 的每个设计是 singular piece、只存在一支；这表示作品设计数量边界，不代表没有尖材或饰面订单选项，也不披露编号规则。",
      S.product.key,
      "About the collection statement that each design is a singular piece",
    ),
    claim(
      `${SCOPE}-theme`,
      "design_inspiration",
      "Ume ni Hanasui 以早春梅花和淡淡花香为主题，强调冬末到春初之间安静而有生命力的瞬间；这是官方设计叙述，不是某件古代画作的出处证明。",
      S.product.key,
      "Pen Design: Ume ni Hanasui section",
    ),
    claim(
      `${SCOPE}-material`,
      "material_and_art",
      "官方规格为 Ebonite、Urushi、24K Gold leaf、Maki-e；Ebonite 是基材，Urushi 是漆面，金箔与手绘 Maki-e 是装饰层，不能写成纯金笔杆。",
      S.product.key,
      "Specifications Material & art line",
    ),
    claim(
      `${SCOPE}-byobu-history`,
      "historical_context",
      "大都会艺术博物馆资料说明 byōbu 兼具挡风、划分空间与装饰功能，金箔表面能够反射环境光；本页用它解释 Byobu-e 语境，不声称 Ume ni Hanasui 复制某件馆藏。",
      S.met.key,
      "Byōbu definition, furnishing/decorative function and gold-leaf surface discussion",
    ),
    claim(
      `${SCOPE}-artisan`,
      "artisan_background",
      "Wancher 官方称 Master Yoko Hirota 有三十年以上 Urushi 与 Maki-e 经验，并在工匠页列出其公开履历节点；该资料说明创作者背景，不等于本支笔每一层工序的独立鉴定。",
      S.artisans.key,
      "Master Yoko Hirota profile and background timeline",
    ),
    claim(
      `${SCOPE}-nibs`,
      "nib_options",
      "当前商品页列出 EF、F、MF、M、B、Keiryu Kodachi F/M/B 与 Shogun 18K；它们是订单可选路线，不是每支单件作品同时附带的多支尖。",
      S.product.key,
      "current order option controls for Size and nib routes",
    ),
    claim(
      `${SCOPE}-trim`,
      "trim_options",
      "当前商品页同时显示 Solid Gold 与 Rhodium Plated 饰面选项；页面没有把它们写成笔尖材质，也未在文字中列出所有覆盖部件，购买前应核对订单组合。",
      S.product.key,
      "current Solid Gold and Rhodium Plated option controls",
    ),
    claim(
      `${SCOPE}-filling`,
      "filling_system",
      "Ume ni Hanasui 使用 European International Standard cartridge 或 converter，包装栏列出 cartridge 与 converter；不把相邻型号的活塞、按压或其它 feed 选项移入本页。",
      S.product.key,
      "Specifications Filling mechanism and Packaging sections",
    ),
    claim(
      `${SCOPE}-feed-cap`,
      "feed_and_cap",
      "官方规格列出 plastic feed 和 compact air-tight cap；后者意在减少墨水过早干燥，不是永不干涸或免维护保证。",
      S.product.key,
      "Specifications Feed and Compact air-tight cap lines",
    ),
    claim(
      `${SCOPE}-packaging`,
      "packaging",
      "官方包装包括传统日式木盒、cartridge、converter 与 instructional materials；这些是验收和护理资料，不代表整支笔产地或编号证书。",
      S.product.key,
      "Packaging section",
    ),
    claim(
      `${SCOPE}-size-boundary`,
      "specification_boundary",
      "商品页 Size & Shape 以图片呈现，当前文字没有公布数值尺寸与重量；不以其它 Hirota 或 Dream Pen 型号测量值代替。",
      S.product.key,
      "Size & Shape image heading and absence of numeric dimension/weight text",
    ),
    claim(
      `${SCOPE}-care`,
      "maintenance_guidance",
      "京都国立博物馆保存资料指出 Urushi 会受紫外线劣化，漆器基材可能因湿度骤变而胀缩；本页据此建议避开长时间直射光、极端干湿和溶剂/研磨，异常时交由卖家或修复人员判断。",
      S.kyoto.key,
      "Urushi properties, ultraviolet deterioration and humidity-change conservation guidance",
      "editorial",
    ),
    claim(
      `${SCOPE}-price`,
      "current_price",
      "官方商品页在 2026-08-03 检索时显示 $2,950 USD；税费、库存、尖材/饰面加价和交付条件随时间与目的地变化。",
      S.product.key,
      "current price block retrieved 2026-08-03",
    ),
    claim(
      `${SCOPE}-media`,
      "media_identity_boundary",
      "本站主图是原创 factual SVG，仅表达 ebonite、Urushi、24K 金箔、梅枝、欧规 C/C 与尖材路线；非产品照片、非 Logo、非真实比例图、非颜色校样。",
      S.svg.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    ...(["EF", "F", "MF", "M", "B"] as const).map((name) => ({
      key: `${SCOPE}-nib-${name.toLowerCase()}`,
      name,
      notes: "当前官方订单列出的普通尖幅；实际 feed、调校和可用性按订单核对。",
      sourceKey: S.product.key,
      variantKind: "nib" as const,
      market: "Wancher international listing",
    })),
    ...(["F", "M", "B"] as const).map((name) => ({
      key: `${SCOPE}-kodachi-${name.toLowerCase()}`,
      name: `Keiryu Kodachi ${name}`,
      notes: "当前官方订单列出的 Kodachi 路线；页面显示相对基础选项的加价，实际供墨和调校需向卖家确认。",
      sourceKey: S.product.key,
      variantKind: "nib" as const,
      market: "Wancher international listing",
    })),
    {
      key: `${SCOPE}-shogun-18k`,
      name: "Shogun 18K",
      notes: "当前官方订单列出的金尖路线；不是每支单件作品自动附带的固定尖材。",
      sourceKey: S.product.key,
      variantKind: "nib" as const,
      market: "Wancher international listing",
    },
    {
      key: `${SCOPE}-trim-solid-gold`,
      name: "Solid Gold",
      notes: "当前商品页显示的饰面选项；页面文字未列出全部覆盖部件，购买前核对订单组合。",
      sourceKey: S.product.key,
      variantKind: "material" as const,
      market: "Wancher international listing",
    },
    {
      key: `${SCOPE}-trim-rhodium-plated`,
      name: "Rhodium Plated",
      notes: "当前商品页显示的饰面选项；不要把它当作笔尖材料或另一支独立作品。",
      sourceKey: S.product.key,
      variantKind: "material" as const,
      market: "Wancher international listing",
    },
  ],
  spec: {
    brandEntityId: PHASE387_WANCHER_BRAND_ID,
    values: {
      series_name: "Hirota Byobu-e Editor’s Collection",
      release_year:
        "官方当前商品页说明系列首批三月底、第二批十月底发布；Ume ni Hanasui 独立首发年份未核验",
      origin_country:
        "Wancher 官方称 Hirota Yoko 在日本完成相关 Urushi/Maki-e 工艺；整支笔与部件产地未完整披露",
      nib: "EF、F、MF、M、B；Keiryu Kodachi F/M/B；Shogun 18K（按订单 SKU）",
      fill_system: "European International Standard cartridge 或 converter",
      material: "Ebonite、Urushi、24K Gold leaf、手绘 Maki-e",
      dimensions: "官方 Size & Shape 为图片呈现，文字未公布数值尺寸",
      weight: "官方当前商品页未公布文字重量",
      price_range:
        "$2,950 USD（2026-08-03 官方商品页标价；价格、税费和配置可变）",
      status:
        "Hirota Byobu-e Editor’s Collection 的一件独立设计；官方称每个设计仅一支，订单仍有尖材与饰面选项",
    },
    evidence: [
      evidence(`${SCOPE}-brand`, "brand_entity_id", S.product.key, "Wancher official product context"),
      evidence(`${SCOPE}-series`, "series_name", S.product.key, "About the collection and title"),
      evidence(`${SCOPE}-release`, "release_year", S.product.key, "collection release timing; launch year intentionally not asserted"),
      evidence(`${SCOPE}-origin`, "origin_country", S.artisans.key, "Master Yoko Hirota profile; conservative boundary"),
      evidence(`${SCOPE}-nib`, "nib", S.product.key, "current nib and size options"),
      evidence(`${SCOPE}-fill`, "fill_system", S.product.key, "official filling mechanism"),
      evidence(`${SCOPE}-material`, "material", S.product.key, "official Material & art specification"),
      evidence(`${SCOPE}-dimensions`, "dimensions", S.product.key, "Size & Shape image heading; no text dimensions"),
      evidence(`${SCOPE}-weight`, "weight", S.product.key, "no numeric weight in current text specification"),
      evidence(`${SCOPE}-price`, "price_range", S.product.key, "current $2,950 USD price block retrieved 2026-08-03"),
      evidence(`${SCOPE}-status`, "status", S.product.key, "singular-piece collection statement"),
    ],
  },
  media: [
    {
      key: `${SCOPE}-primary-media`,
      title: "Hirota Byobu-e Ume ni Hanasui 事实图（非产品照片）",
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

export const phase387WancherHirotaByobuUmePacks: CuratedEntityPack[] = [
  baseBrand,
  model,
];
