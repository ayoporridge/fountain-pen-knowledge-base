import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase84PlatinumPilotP0V3BrandPacks } from "./phase84-platinum-pilot-p0-v3";

export const PHASE366_PILOT_BRAND_ID = "Zt-PbXkE7UHM";
export const PHASE366_KAEDE_ID = "phase366-pilot-custom-kaede";
export const PHASE366_WOOD_ID = "phase366-pilot-capless-wood";
export const PHASE366_RADEN_ID = "phase366-pilot-capless-raden";

export const PHASE366_KAEDE_SLUG = "pilot-custom-kaede";
export const PHASE366_WOOD_SLUG = "pilot-capless-wood";
export const PHASE366_RADEN_SLUG = "pilot-capless-raden";

const RETRIEVED = "2026-08-02";

function source(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup: string;
  homepageUrl?: string;
  author?: string;
  publishedAt?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const siteOriginal = sourceType === "user_submission";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    title: input.title,
    url: input.url,
    summary: input.summary,
    sourceType,
    tier:
      input.tier ??
      (sourceType === "official" ? "primary" : "professional_secondary"),
    independenceGroup: input.independenceGroup,
    homepageUrl: input.homepageUrl ?? (siteOriginal ? "/" : input.url),
    itemType: siteOriginal ? "image" : "web_page",
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    allowedUse: siteOriginal ? "store_full" : "summary_only",
    license: siteOriginal ? "site-original" : undefined,
    archiveUrl: input.url,
    archiveLocator: siteOriginal
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  scopeKey: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.94,
    sourceKey,
    locator,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey,
        scopeKey,
        locator,
      },
    ],
  };
}

function specEvidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  scopeKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const S = {
  kaedeExact: source({
    key: "phase366-pilot-kaede-exact",
    registryKey: "pilot-webcatalog-custom-kaede-phase366",
    registryName: "PILOT Web Catalog",
    title: "カスタム 楓（かえで） FK-2000K",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?category=%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E3%82%AB%E3%82%B9%E3%82%BF%E3%83%A0+%E6%A5%93%28%E3%81%8B%E3%81%88%E3%81%A7%29&itemID=t000100000218&searchTypeParam=categorySearch&volumeName=00004",
    independenceGroup: "pilot-webcatalog-custom-kaede-phase366",
    summary:
      "官方 exact page 列 FK-2000K、板屋楓树脂浸渍轴／帽、14K 10 号 F／M、旋合式、CON-40／CON-70N、143 mm、14.5 mm、20 g 和随附 CON-70N。",
  }),
  woodExact: source({
    key: "phase366-pilot-capless-wood-exact",
    registryKey: "pilot-webcatalog-capless-wood-phase366",
    registryName: "PILOT Web Catalog",
    title: "キャップレス 木軸 FC-25SK",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000120&volumeName=00004",
    independenceGroup: "pilot-webcatalog-capless-wood-phase366",
    summary:
      "官方 exact page 列 FC-25SK，树脂浸渍桦材轴、18K、按动、CON-40、140 mm、14 mm、26 g，以及黑／深红 EF／F／M lineup。",
  }),
  radenExact: source({
    key: "phase366-pilot-capless-raden-exact",
    registryKey: "pilot-webcatalog-capless-raden-phase366",
    registryName: "PILOT Web Catalog",
    title: "キャップレス 螺鈿 FCN-5MP",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000095&volumeName=00004",
    independenceGroup: "pilot-webcatalog-capless-raden-phase366",
    summary:
      "官方 exact page 列 FCN-5MP、螺鈿ブラック／水面／ストライプ的 F／M、黄铜蝋色漆与螺鈿、18K、CON-40、140 mm、13.4 mm、30 g。",
  }),
  supportList: source({
    key: "phase366-pilot-covered-products",
    registryKey: "pilot-official-covered-products-phase366",
    registryName: "PILOT official warranty",
    title: "Fountain Pens Products covered by the warranty",
    url: "https://www.pilot.co.jp/support/warranty/en-au/fountain/",
    independenceGroup: "pilot-official-covered-products-phase366",
    summary:
      "Pilot 国际支持清单把 CUSTOM MAPLE FK-2000K、Capless WOOD FC-25SK／FC-2500RR、Capless RADEN FCN-5MP 分别列为独立产品路线。",
  }),
  woodSupport: source({
    key: "phase366-pilot-capless-wood-support",
    registryKey: "pilot-support-capless-wood-phase366",
    registryName: "PILOT international support",
    title: "Capless WOOD FC-25SK use and care",
    url: "https://www.pilot.co.jp/support/warranty/en/fountain/capless_wood.html",
    independenceGroup: "pilot-support-capless-wood-phase366",
    summary:
      "官方支持页列 FC-25SK／FC-2500RR 的伸缩、CON-40、收尖、清洁、溶剂与不要自行维修边界。",
  }),
  caplessCare: source({
    key: "phase366-pilot-capless-care",
    registryKey: "pilot-support-capless-care-phase366",
    registryName: "PILOT official support",
    title: "キャップレス use and care guide",
    url: "https://www.pilot.co.jp/support/warranty/jp/fountain/capless_2.html",
    independenceGroup: "pilot-support-capless-care-phase366",
    summary:
      "Pilot 官方护理说明要求不用时收回笔尖、用清水清洁笔舌与 converter、避免高低温直射日光和自行拆 head，并提示航空气压风险。",
  }),
  price: source({
    key: "phase366-pilot-price-202607",
    registryKey: "pilot-price-list-202607-phase366",
    registryName: "PILOT official",
    title: "価格表 2026 年 7 月 1 日付",
    url: "https://www.pilot.co.jp/information/pricelist_202607.pdf",
    publishedAt: "2026-07-01",
    independenceGroup: "pilot-price-list-202607-phase366",
    summary:
      "2026 年 7 月价目表把 Custom 楓列为含税 55,000 日元、Capless 木轴 44,000 日元、Capless 螺鈿 110,000 日元；价格只作为日期快照。",
  }),
  customHistory: source({
    key: "phase366-pilot-custom-history",
    registryKey: "pilot-custom-official-history-phase366",
    registryName: "PILOT CUSTOM official site",
    title: "History | Fountain pen CUSTOM",
    url: "https://www.pilot-custom.jp/en/history/",
    independenceGroup: "pilot-custom-official-history-phase366",
    summary:
      "Pilot CUSTOM 官方历史页用于 Custom 家族、楓与槐的相邻型号边界；未披露 FK-2000K 首次上市年份时不作臆测。",
  }),
  caplessPress: source({
    key: "phase366-pilot-capless-press",
    registryKey: "pilot-capless-press-2026-phase366",
    registryName: "PILOT official press",
    title: "万年筆『キャップレス』新色発売",
    url: "https://www.pilot.co.jp/press_release/2026/03/05/post_150.html",
    publishedAt: "2026-03-05",
    independenceGroup: "pilot-capless-press-2026-phase366",
    summary:
      "Pilot 发布资料再次说明 Capless 的按动机制、18K／特殊合金尖路线和当前产品开发语境；不把新色资料回填到木轴或螺鈿的具体颜色。",
  }),
  kaedeFpn: source({
    key: "phase366-pilot-kaede-fpn",
    registryKey: "fpn-pilot-kaede-phase366",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "community",
    independenceGroup: "fpn-pilot-kaede-phase366",
    homepageUrl: "https://www.fountainpennetwork.com/",
    title: "Pilot Custom Kaede review",
    url: "https://www.fountainpennetwork.com/forum/topic/242054-pilot-custom-kaede/",
    summary:
      "2013 年 FPN 实物帖提供 Custom Kaede 的木纹、包装和个体差异样本；体验属于作者样本，不替官方规格或上市日期。",
  }),
  kaedeBlog: source({
    key: "phase366-pilot-kaede-blog",
    registryKey: "weirdoforest-pilot-kaede-phase366",
    registryName: "Weirdoforest Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "weirdoforest-pilot-kaede-phase366",
    homepageUrl: "https://weirdoforestpens.wordpress.com/",
    title: "Kaedey // Pilot Custom Maple Fountain Pen review",
    url: "https://weirdoforestpens.wordpress.com/2024/10/24/kaedey-pilot-custom-maple-fountain-pen-review/",
    summary:
      "独立评测记录 Custom Maple 的外观、木材使用变化与个人书写感；只用于体验和购买提醒，不升级成全库存规律。",
  }),
  woodBlog: source({
    key: "phase366-pilot-capless-wood-blog",
    registryKey: "takagishi-pilot-capless-wood-phase366",
    registryName: "たかぎし123",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "takagishi-pilot-capless-wood-phase366",
    homepageUrl: "https://takagishi123.com/",
    title: "キャップレス木軸レビュー",
    url: "https://takagishi123.com/pilot-capless-review/",
    summary:
      "实物评测补充 Capless 木轴的外观、按动使用和尖幅购买场景；规格仍以 Pilot exact page 为准。",
  }),
  woodPenAddict: source({
    key: "phase366-pilot-capless-penaddict",
    registryKey: "pen-addict-pilot-capless-phase366",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-addict-pilot-capless-phase366",
    homepageUrl: "https://www.penaddict.com/",
    title: "Pilot Vanishing Point review",
    url: "https://www.penaddict.com/blog/2012/5/9/pilot-vanishing-point-fountain-pen-review.html",
    summary:
      "专业评测提供普通 Capless 的单手按动、前夹位置与日用边界，只用作 FC-25SK 的机构相邻参照，不替代木轴规格。",
  }),
  radenKakaku: source({
    key: "phase366-pilot-raden-kakaku",
    registryKey: "kakaku-pilot-capless-raden-phase366",
    registryName: "価格.com",
    sourceType: "blog",
    tier: "community",
    independenceGroup: "kakaku-pilot-capless-raden-phase366",
    homepageUrl: "https://review.kakaku.com/",
    title: "キャップレス 螺鈿 FCN-5MP-RS review",
    url: "https://review.kakaku.com/review/S0000768224/",
    summary:
      "日本消费者样本描述 FCN-5MP-RS 的螺鈿外观、F 尖与 Capless 日用便利；个人体验与价格不外推为所有设计。",
  }),
  seriesReview: source({
    key: "phase366-pilot-series-review",
    registryKey: "gentleman-stationer-pilot-series-phase366",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "gentleman-stationer-pilot-series-phase366",
    homepageUrl: "https://www.gentlemanstationer.com/",
    title: "The Pilot Custom Series: an overview",
    url: "https://www.gentlemanstationer.com/blog/2026/3/14/pilot-custom-series-an-overview-of-some-of-my-favorite-fountain-pens",
    publishedAt: "2026-03-14",
    summary:
      "专业媒体从尖号、供墨和使用取向比较 Pilot Custom 家族；只作 Custom 楓与 Custom 槐／845 的相邻导航，不替特殊材料发布规格。",
  }),
  kaedeSvg: source({
    key: "phase366-pilot-kaede-svg",
    registryKey: "fountain-pen-graph-editorial-phase366",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase366-kaede",
    title: "Pilot Custom 楓事实示意图",
    url: "/images/library/site-original/pilot/custom-kaede.svg",
    homepageUrl: "/",
    summary:
      "本站原创 factual SVG，表达 FK-2000K 楓木树脂浸渍、14K No.10 F／M、CON-40／CON-70N 与旋合结构；非产品照片、Logo、比例图或颜色校样。",
  }),
  woodSvg: source({
    key: "phase366-pilot-wood-svg",
    registryKey: "fountain-pen-graph-editorial-phase366",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase366-wood",
    title: "Pilot Capless 木轴事实示意图",
    url: "/images/library/site-original/pilot/capless-wood.svg",
    homepageUrl: "/",
    summary:
      "本站原创 factual SVG，表达 FC-25SK 按动机构、树脂浸渍桦材、18K EF／F／M 与 CON-40；非产品照片、Logo、比例图或颜色校样。",
  }),
  radenSvg: source({
    key: "phase366-pilot-raden-svg",
    registryKey: "fountain-pen-graph-editorial-phase366",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase366-raden",
    title: "Pilot Capless 螺鈿事实示意图",
    url: "/images/library/site-original/pilot/capless-raden.svg",
    homepageUrl: "/",
    summary:
      "本站原创 factual SVG，表达 FCN-5MP 黄铜蝋色漆、螺鈿 RB／RM／RS、18K F／M 与 CON-40；非产品照片、Logo、比例图或颜色校样。",
  }),
} as const;

const pilotBrandBase = phase84PlatinumPilotP0V3BrandPacks.find(
  (pack) => pack.entityId === PHASE366_PILOT_BRAND_ID,
);
if (!pilotBrandBase) throw new Error("Phase 366 Pilot brand prerequisite is missing.");

const brand: CuratedEntityPack = structuredClone(pilotBrandBase);
brand.key = "phase366-pilot-special-routes-brand-v1";
brand.markdownFile = ".planning/content-research/pilot-brand-phase366.md";
brand.storyTitle = "Pilot：楓木、木轴与螺鈿的独立入口";
brand.sources = [
  ...brand.sources,
  S.kaedeExact,
  S.woodExact,
  S.radenExact,
  S.supportList,
  S.price,
].filter(
  (item, index, all) =>
    all.findIndex((candidate) => candidate.key === item.key) === index,
);
const brandScope = brand.scopes[0]?.key ?? "phase366-pilot-brand-scope";
brand.claims = [
  ...brand.claims,
  claim(
    "phase366-pilot-kaede-navigation",
    "brand_model_navigation",
    "Pilot 官方目录把 Custom 楓（FK-2000K）作为独立楓木 Custom 入口；它与 Custom 槐、845、742 的木材、尖号和尺寸分开。",
    S.kaedeExact.key,
    "FK-2000K exact title and product block",
    brandScope,
  ),
  claim(
    "phase366-pilot-wood-navigation",
    "brand_model_navigation",
    "Pilot 官方目录把 Capless 木軸（FC-25SK／FC-2500RR）作为独立按动入口；黑／深红与 EF／F／M 是同一路线 variant。",
    S.woodExact.key,
    "FC-25SK exact title and lineup",
    brandScope,
  ),
  claim(
    "phase366-pilot-raden-navigation",
    "brand_model_navigation",
    "Pilot 官方目录把 Capless 螺鈿（FCN-5MP）作为独立工艺入口；螺鈿ブラック、水面、ストライプ与 F／M 不并入普通 Capless。",
    S.radenExact.key,
    "FCN-5MP exact title and lineup",
    brandScope,
  ),
];

type ProductInput = {
  key: string;
  entityId: string;
  slug: string;
  canonicalName: string;
  storyTitle: string;
  markdownFile: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  extra: CuratedSource[];
  svg: CuratedSource;
  aliases: string[];
  summary: string;
  material: string;
  nib: string;
  fill: string;
  dimensions: string;
  weight: string;
  price: string;
  release: string;
  status: string;
  boundary: string;
  selection: string;
  variants: Array<{
    key: string;
    name: string;
    productCode: string;
    notes: string;
    variantKind: "nib" | "color" | "material" | "market_sku";
    market?: string;
  }>;
};

function makePack(input: ProductInput): CuratedEntityPack {
  const scopeKey = `phase366-${input.key}-current`;
  const sources = [input.primary, input.secondary, ...input.extra, input.svg].filter(
    (item, index, all) =>
      all.findIndex((candidate) => candidate.key === item.key) === index,
  );
  const aliases = input.aliases.map((alias, index) => ({
    alias,
    language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en",
    sourceKey: index === 0 ? input.primary.key : input.secondary.key,
  }));
  const claims = [
    claim(
      `phase366-${input.key}-identity`,
      "model_identity",
      input.summary,
      input.primary.key,
      "official exact title, product code and lineup",
      scopeKey,
    ),
    claim(
      `phase366-${input.key}-material`,
      "material_finish",
      input.material,
      input.primary.key,
      "official material and finish fields",
      scopeKey,
    ),
    claim(
      `phase366-${input.key}-nib`,
      "nib_options",
      input.nib,
      input.primary.key,
      "official nib field and lineup",
      scopeKey,
    ),
    claim(
      `phase366-${input.key}-filling`,
      "filling_system",
      input.fill,
      input.primary.key,
      "official converter and filling fields",
      scopeKey,
    ),
    claim(
      `phase366-${input.key}-dimensions`,
      "physical_specification",
      `${input.dimensions}；${input.weight}`,
      input.primary.key,
      "official dimensions and weight fields",
      scopeKey,
    ),
    claim(
      `phase366-${input.key}-price`,
      "commercial_snapshot",
      input.price,
      S.price.key,
      "2026-07-01 price-list snapshot",
      `${scopeKey}-commercial`,
    ),
    claim(
      `phase366-${input.key}-support`,
      "support_boundary",
      input.status,
      S.supportList.key,
      "official covered-products boundary",
      scopeKey,
    ),
    claim(
      `phase366-${input.key}-boundary`,
      "version_boundary",
      input.boundary,
      input.secondary.key,
      "professional or community sibling boundary",
      scopeKey,
    ),
    claim(
      `phase366-${input.key}-care`,
      "maintenance_guidance",
      "按 Pilot 官方护理边界使用：不用时收回尖端，室温清水清洁笔舌与 converter，避免高低温、直射日光、酒精等溶剂和自行拆修；工艺或木材出现裂纹、起翘、漏墨时停止继续使用并联系维修方。",
      input.key.includes("kaede") ? S.supportList.key : S.caplessCare.key,
      "official care, solvent and self-repair warnings",
      scopeKey,
    ),
    claim(
      `phase366-${input.key}-selection`,
      "selection_guidance",
      input.selection,
      input.primary.key,
      "exact SKU, variant and package verification",
      scopeKey,
      "editorial",
    ),
  ];
  const values = {
    series_name: input.canonicalName,
    release_year: input.release,
    origin_country: "Pilot Japan 官方产品线；本包不从销售市场推断具体工厂地址",
    nib: input.nib,
    fill_system: input.fill,
    material: input.material,
    dimensions: input.dimensions,
    weight: input.weight,
    price_range: input.price,
    status: input.status,
  };
  const evidence = [
    specEvidence(`phase366-${input.key}-spec-brand`, "brand_entity_id", input.primary.key, scopeKey, "Pilot maker context"),
    specEvidence(`phase366-${input.key}-spec-series`, "series_name", input.primary.key, scopeKey, "exact product title and code"),
    specEvidence(`phase366-${input.key}-spec-release`, "release_year", input.primary.key, scopeKey, "current catalogue chronology boundary"),
    specEvidence(`phase366-${input.key}-spec-origin`, "origin_country", input.primary.key, scopeKey, "Pilot Japan Web Catalog context"),
    specEvidence(`phase366-${input.key}-spec-nib`, "nib", input.primary.key, scopeKey, "official nib field"),
    specEvidence(`phase366-${input.key}-spec-fill`, "fill_system", input.primary.key, scopeKey, "official filling field"),
    specEvidence(`phase366-${input.key}-spec-material`, "material", input.primary.key, scopeKey, "official material field"),
    specEvidence(`phase366-${input.key}-spec-dimensions`, "dimensions", input.primary.key, scopeKey, "official dimensions field"),
    specEvidence(`phase366-${input.key}-spec-weight`, "weight", input.primary.key, scopeKey, "official weight field"),
    specEvidence(`phase366-${input.key}-spec-price`, "price_range", S.price.key, `${scopeKey}-commercial`, "2026-07-01 price-list snapshot"),
    specEvidence(`phase366-${input.key}-spec-status`, "status", S.supportList.key, scopeKey, "official warranty/support list"),
  ];
  return {
    key: `phase366-${input.key}-v1`,
    entityId: input.entityId,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.canonicalName,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.storyTitle,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases,
    sources,
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        market: "Pilot Japan current official catalogue / covered-product listing",
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope: input.nib,
        materialScope: input.material,
        editionScope: input.boundary,
      },
      {
        key: `${scopeKey}-commercial`,
        scopeKey: `${scopeKey}-commercial`,
        productionState: "unknown",
        editionScope: "价格、库存、区域代码、木纹或螺鈿排列按交易日期与 exact SKU 复核",
      },
      {
        key: `${scopeKey}-media`,
        scopeKey: `${scopeKey}-media`,
        productionState: "current",
        editionScope: "site-original factual SVG; not a product photograph, logo, scale drawing or colour proof",
      },
    ],
    claims,
    variants: input.variants.map((variant) => ({
      ...variant,
      sourceKey: input.primary.key,
    })),
    spec: { brandEntityId: PHASE366_PILOT_BRAND_ID, values, evidence },
    media: [
      {
        key: `phase366-${input.key}-primary-media`,
        title: `${input.canonicalName} 事实图（非产品照片）`,
        sourceKey: input.svg.key,
        localPath: input.svg.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样，不代表具体木纹、贝片排列、光泽、价格或库存。",
        sourceUrl: input.svg.url,
        usageStatus: "primary",
      },
    ],
  };
}

const productInputs: ProductInput[] = [
  {
    key: "pilot-custom-kaede",
    entityId: PHASE366_KAEDE_ID,
    slug: PHASE366_KAEDE_SLUG,
    canonicalName: "百乐 Pilot Custom 楓（Kaede）",
    storyTitle: "Pilot Custom 楓：板屋楓树脂浸渍的轻量木轴",
    markdownFile: ".planning/content-research/pilot-custom-kaede-phase366.md",
    primary: S.kaedeExact,
    secondary: S.kaedeBlog,
    extra: [S.supportList, S.price, S.customHistory, S.kaedeFpn, S.seriesReview],
    svg: S.kaedeSvg,
    aliases: ["カスタム 楓（かえで）", "Pilot Custom Kaede", "Pilot Custom Maple", "百乐 Custom 楓"],
    summary:
      "Pilot 官方将 Custom 楓以 FK-2000K 单列；F／M 是同一楓木纹型号的原厂尖幅，不是槐木、845 漆杆或 Capless 木轴。",
    material: "板屋楓（Itaya maple）轴与帽，树脂浸渍加工并硬化打磨；色柄モクメ",
    nib: "14K No.10；FK-2000K-M（F）／FK-2000K-M-M（M）",
    fill: "Pilot CON-40／CON-70N；商品页注明附 CON-70N",
    dimensions: "全长 143 mm；最大径 14.5 mm",
    weight: "20 g（本体；不含盒与包装）",
    price: "Pilot 2026-07-01 价目表／当前 Web Catalog 快照：含税 55,000 日元；价格可变",
    release: "现行；当前官方 exact page 未披露首次上市年份",
    status: "Pilot 当前目录与国际支持清单可核对的 Custom MAPLE FK-2000K",
    boundary:
      "Custom 楓 FK-2000K 使用楓木、14K 10 号、143 mm 和 20 g；Custom 槐、845、742 与 Capless 木轴的材料、尖号、结构和图片均不共享。",
    selection:
      "核对 FK-2000K、楓木纹、F／M、14K 10 号、CON-70N 与 Z-CR-N3；木纹差异不是统一色卡，也不能用 845 或槐的照片证明身份。",
    variants: [
      { key: "phase366-kaede-f", name: "FK-2000K-M 楓木纹 F", productCode: "FK-2000K-M", notes: "14K 10 号 F 尖原厂 SKU。", variantKind: "nib", market: "Pilot Japan" },
      { key: "phase366-kaede-m", name: "FK-2000K-M-M 楓木纹 M", productCode: "FK-2000K-M-M", notes: "14K 10 号 M 尖原厂 SKU。", variantKind: "nib", market: "Pilot Japan" },
      { key: "phase366-kaede-wood", name: "Itaya maple resin-impregnated body", productCode: "FK-2000K", notes: "轴与帽的官方材料路线，不与槐木或桦材合并。", variantKind: "material", market: "Pilot Japan" },
      { key: "phase366-kaede-con40", name: "CON-40 compatible", productCode: "FK-2000K", notes: "官方 converter 选项。", variantKind: "market_sku", market: "Pilot Japan" },
      { key: "phase366-kaede-con70n", name: "CON-70N included", productCode: "FK-2000K", notes: "商品页注明随附 CON-70N。", variantKind: "market_sku", market: "Pilot Japan" },
    ],
  },
  {
    key: "pilot-capless-wood",
    entityId: PHASE366_WOOD_ID,
    slug: PHASE366_WOOD_SLUG,
    canonicalName: "百乐 Pilot Capless 木轴（Capless WOOD）",
    storyTitle: "Pilot Capless 木轴：按一下就写的树脂浸渍桦材",
    markdownFile: ".planning/content-research/pilot-capless-wood-phase366.md",
    primary: S.woodExact,
    secondary: S.woodBlog,
    extra: [S.woodSupport, S.supportList, S.caplessCare, S.price, S.woodPenAddict, S.caplessPress],
    svg: S.woodSvg,
    aliases: ["キャップレス 木軸", "Pilot Capless WOOD", "Pilot Capless Wood", "FC-25SK", "FC-2500RR", "百乐 Capless 木轴"],
    summary:
      "Pilot 官方将 Capless WOOD 以 FC-25SK（国际代码 FC-2500RR）单列；树脂浸渍桦材、按动收尖、18K 与 CON-40 构成独立路线。",
    material: "树脂浸渍桦材轴；头部不锈钢、夹子铁钢；黑／深红 finish",
    nib: "18K；FC-25SK lineup 为 EF／F／M",
    fill: "Pilot CON-40；可按官方 Capless 说明使用 Pilot 墨囊／瓶装墨水",
    dimensions: "全长 140 mm；最大径 14 mm",
    weight: "26 g（本体；不含盒与包装）",
    price: "Pilot 2026-07-01 价目表快照：FC-25SK 含税 44,000 日元；区域售价与库存可变",
    release: "现行；Capless 机构自 1963 年形成产品线，FC-25SK 首次上市年未在当前 exact page 披露",
    status: "Pilot 当前 Capless WOOD FC-25SK／FC-2500RR 支持清单中的独立按动型号",
    boundary:
      "FC-25SK 是树脂浸渍桦材的按动 Capless；普通 FC-18SR／FC-15SR、Decimo、LS、螺鈿和 Custom 楓的材料、尺寸、重量或机构字段不能互换。",
    selection:
      "核对 FC-25SK 或有地区说明的 FC-2500RR、黑／深红、EF／F／M、18K、CON-40 与 Z-CR-N3；按键、shutter、木材裂纹和溶剂痕要以实物验收。",
    variants: [
      { key: "phase366-wood-black-ef", name: "FC-25SK-BEF 黑色 EF", productCode: "FC-25SK-BEF", notes: "桦材黑色 finish，18K EF。", variantKind: "nib", market: "Pilot Japan" },
      { key: "phase366-wood-black-f", name: "FC-25SK-BF 黑色 F", productCode: "FC-25SK-BF", notes: "桦材黑色 finish，18K F。", variantKind: "nib", market: "Pilot Japan" },
      { key: "phase366-wood-black-m", name: "FC-25SK-BM 黑色 M", productCode: "FC-25SK-BM", notes: "桦材黑色 finish，18K M。", variantKind: "nib", market: "Pilot Japan" },
      { key: "phase366-wood-red-ef", name: "FC-25SK-DREF 深红 EF", productCode: "FC-25SK-DREF", notes: "桦材深红 finish，18K EF。", variantKind: "nib", market: "Pilot Japan" },
      { key: "phase366-wood-red-f", name: "FC-25SK-DRF 深红 F", productCode: "FC-25SK-DRF", notes: "桦材深红 finish，18K F。", variantKind: "nib", market: "Pilot Japan" },
      { key: "phase366-wood-red-m", name: "FC-25SK-DRM 深红 M", productCode: "FC-25SK-DRM", notes: "桦材深红 finish，18K M。", variantKind: "nib", market: "Pilot Japan" },
      { key: "phase366-wood-international", name: "FC-2500RR international market code", productCode: "FC-2500RR", notes: "同一路线国际代码，不新建第二实体。", variantKind: "market_sku", market: "International" },
    ],
  },
  {
    key: "pilot-capless-raden",
    entityId: PHASE366_RADEN_ID,
    slug: PHASE366_RADEN_SLUG,
    canonicalName: "百乐 Pilot Capless 螺鈿（Raden）",
    storyTitle: "Pilot Capless 螺鈿：按动机构上的漆与贝饰",
    markdownFile: ".planning/content-research/pilot-capless-raden-phase366.md",
    primary: S.radenExact,
    secondary: S.woodPenAddict,
    extra: [S.supportList, S.caplessCare, S.price, S.caplessPress, S.radenKakaku],
    svg: S.radenSvg,
    aliases: ["キャップレス 螺鈿", "Pilot Capless Raden", "Pilot Capless RADEN", "FCN-5MP", "百乐 Capless 螺鈿"],
    summary:
      "Pilot 官方将 Capless 螺鈿以 FCN-5MP 单列；螺鈿ブラック、水面、ストライプ的 F／M 是同一工艺型号 variant，不是普通 Capless 颜色。",
    material: "黄铜轴；地塗蝋色漆仕上＋螺鈿；头部不锈钢、握位铁钢",
    nib: "18K；FCN-5MP lineup 为 F／M",
    fill: "Pilot CON-40",
    dimensions: "全长 140 mm；最大径 13.4 mm",
    weight: "30 g（本体；不含 Z-CS-LN 盒与包装）",
    price: "Pilot 2026-07-01 价目表快照：FCN-5MP 含税 110,000 日元；手工工艺价格与供货可变",
    release: "现行；Capless 机构自 1963 年形成产品线，FCN-5MP 的首次上市年未在当前 exact page 披露",
    status: "Pilot 日本保修清单与 Web Catalog 均独立列出的 Capless RADEN FCN-5MP",
    boundary:
      "FCN-5MP 是黄铜蝋色漆与螺鈿的按动路线；普通 Capless、Capless 木轴、Decimo、LS、SE 与 Custom URUSHI 的 finish、材料、尺寸和图片不能互换。",
    selection:
      "核对 FCN-5MP、RB／RM／RS 设计代码、F／M、18K、CON-40 与 Z-CS-LN；验收贝片缺口、翘起、漆面裂纹、shutter 和按键，不把反光差异当成统一色卡。",
    variants: [
      { key: "phase366-raden-black-f", name: "FCN-5MP-RB-F 螺鈿ブラック F", productCode: "FCN-5MP-RB-F", notes: "黑底螺鈿设计，18K F。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase366-raden-black-m", name: "FCN-5MP-RB-M 螺鈿ブラック M", productCode: "FCN-5MP-RB-M", notes: "黑底螺鈿设计，18K M。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase366-raden-minamo-f", name: "FCN-5MP-RM-F 螺鈿水面 F", productCode: "FCN-5MP-RM-F", notes: "水面设计，18K F。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase366-raden-minamo-m", name: "FCN-5MP-RM-M 螺鈿水面 M", productCode: "FCN-5MP-RM-M", notes: "水面设计，18K M。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase366-raden-stripe-f", name: "FCN-5MP-RS-F 螺鈿ストライプ F", productCode: "FCN-5MP-RS-F", notes: "条纹设计，18K F。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase366-raden-stripe-m", name: "FCN-5MP-RS-M 螺鈿ストライプ M", productCode: "FCN-5MP-RS-M", notes: "条纹设计，18K M。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase366-raden-raden-material", name: "Raden nacre on urushi ground", productCode: "FCN-5MP", notes: "螺鈿工艺与蝋色漆底的材料／工艺路线。", variantKind: "material", market: "Pilot Japan" },
    ],
  },
];

export const phase366PilotSpecialRoutePacks: CuratedEntityPack[] = [
  brand,
  ...productInputs.map(makePack),
];
