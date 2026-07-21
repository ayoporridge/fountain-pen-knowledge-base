import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE107_WANCHER_ID = "eOfD77nOeENN";
export const PHASE107_DREAM_ARTICLE_ID = "2aoD07lwSYCV";
export const PHASE107_TRUE_EBONITE_ID = "phase107-wancher-true-ebonite-matte-black";
export const PHASE107_TRUE_EBONITE_SLUG =
  "wancher-dream-pen-true-ebonite-matte-black";

const RETRIEVED = "2026-07-21";
const CURRENT = "phase107-true-ebonite-current-listing";
const HISTORICAL = "phase107-true-ebonite-2018-supplied-sample";
const BRAND_SCOPE = "phase107-wancher-brand-scope";
const SVG_PATH =
  "/images/library/site-original/phase107/wancher/wancher-dream-pen-true-ebonite-matte-black.svg";

function webSource(
  source: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "archiveUrl"> & {
    locator: string;
  },
): CuratedSource {
  const { locator, ...rest } = source;
  return {
    ...rest,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: source.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}`,
  };
}

const ourStory = webSource({
  key: "phase107-wancher-our-story",
  registryKey: "wancher-official-phase107",
  registryName: "Wancher official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official",
  title: "Wancher Our Story",
  url: "https://www.wancherpen.com/pages/our-story-page",
  homepageUrl: "https://www.wancherpen.com/",
  summary:
    "Wancher 官方品牌自述；用于品牌身份、九州起点与日本书写文化语境，不把品牌叙事扩成所有部件产地或普遍质量结论。",
  locator:
    "Our Story headings and narrative describing the Kyushu starting point, writing-culture purpose and Wancher brand perspective",
});

const dreamCollection = webSource({
  key: "phase107-wancher-dream-pen-collection",
  registryKey: "wancher-official-phase107",
  registryName: "Wancher official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official",
  title: "Dream Pen Fountain Pen Collection",
  url: "https://www.wancherpen.com/collections/dream-pen",
  homepageUrl: "https://www.wancherpen.com/",
  summary:
    "官方 collection 用于确认 Dream Pen 是跨材料与工艺的系列入口，不是一支可共享固定规格的单笔。",
  locator:
    "collection title, product grid and collection material/craft descriptions; family boundary only",
});

const currentListing = webSource({
  key: "phase107-true-ebonite-current-official",
  registryKey: "wancher-official-phase107",
  registryName: "Wancher official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official",
  title: "Dream Pen True Ebonite Fountain Pen - Matte Black",
  url: "https://www.wancherpen.com/products/true-ebonite-matte-black",
  homepageUrl: "https://www.wancherpen.com/",
  summary:
    "2026-07-21 当前商品页：Japanese Ebonite、Matte Sandblast、European International cartridge/converter、当期 nib/feed/cap/clip 选项。",
  locator:
    "Specifications lines 762-772 (material, filling, nib, feed, compact air-tight cap); product options and package/handmade-variation sections retrieved 2026-07-21",
});

const clipArticle = webSource({
  key: "phase107-wancher-dream-pen-clip-2022",
  registryKey: "wancher-official-phase107",
  registryName: "Wancher official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official",
  title: "Wancher Dream Pen - A model with clip has arrived",
  url: "https://www.wancherpen.com/blogs/news/wancher-dream-pen-with-clip",
  homepageUrl: "https://www.wancherpen.com/",
  publishedAt: "2022-07-08",
  summary:
    "官方 2022 文章记录 Dream Pen 从长期无夹设计扩展出 clip option；只用于版本演变，不承诺当前库存。",
  locator:
    "July 8 2022 article: original clipless design, motivation and addition of clip, note limiting then-current clip option",
});

const pencilcase = webSource({
  key: "phase107-pencilcase-true-ebonite-review-2018",
  registryKey: "pencilcaseblog-wancher-true-ebonite",
  registryName: "The Pencilcase Blog",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pencilcaseblog",
  title: "Review: Wancher Dream Pen True Ebonite Fountain Pen",
  url: "https://www.pencilcaseblog.com/2018/10/review-wancher-dream-pen-true-ebonite.html",
  homepageUrl: "https://www.pencilcaseblog.com/",
  author: "Dries De Schepper",
  publishedAt: "2018-10-31",
  summary:
    "独立专业评测的一支 Wancher supplied sample：polished、clipless、non-posting、block threads、slip seal、steel JoWo fine 与 FNF ebonite feed，并披露样品来源。",
  locator:
    "paragraphs from 'Wancher sent me one' through finish, non-posting, block-thread/slip-seal and steel JoWo/FNF feed observations; final supplied-product/no-affiliate disclosure",
});

const diagram: CuratedSource = {
  key: "phase107-wancher-true-ebonite-boundary-svg",
  registryKey: "fountain-pen-graph-editorial-phase107",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase107",
  title: "Wancher True Ebonite current / historical 事实边界图",
  url: SVG_PATH,
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  summary:
    "本站原创双时态事实示意图；分开 current listing 与 2018 supplied sample，非产品照片。",
  allowedUse: "store_full",
  license: "site-original",
  archiveUrl: SVG_PATH,
  archiveLocator: `project-public-asset:${SVG_PATH};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;finish-replica=false;dimensions=1600x900`,
};

function ev(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function media(title: string) {
  return [
    {
      key: `phase107-${title.includes("品牌") ? "brand" : "pen"}-primary-media`,
      title,
      sourceKey: diagram.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、表面、笔夹、笔尖、feed、包装、价格或库存。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary" as const,
    },
  ];
}

export const phase107WancherBrandPack: CuratedEntityPack = {
  key: "phase107-wancher-brand-v1",
  entityId: PHASE107_WANCHER_ID,
  expectedType: "brand",
  expectedSlug: "wancher",
  canonicalName: "Wancher",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-brand-phase107.md",
  storyTitle: "Wancher：先看材料与工艺如何组成产品，再看具体型号",
  primarySourceKey: ourStory.key,
  depthTier: "A",
  aliases: [
    { alias: "Wancher", language: "en", sourceKey: ourStory.key },
    { alias: "Wancher Pen", language: "en", sourceKey: ourStory.key },
    { alias: "万佳", language: "zh", sourceKey: dreamCollection.key },
  ],
  sources: [ourStory, dreamCollection, currentListing, pencilcase, diagram],
  scopes: [
    {
      key: BRAND_SCOPE,
      scopeKey: BRAND_SCOPE,
      productionState: "current",
      materialScope:
        "品牌页说明材料与工艺产品结构；每支笔的材质、部件产地与表面仍由具体 SKU 证明。",
      editionScope:
        "品牌与 Dream Pen 导航范围；2018 supplied sample 不能代表 Wancher 全产品质量。",
    },
  ],
  claims: [
    {
      key: "phase107-wancher-brand-identity",
      predicate: "brand_identity",
      objectText:
        "Wancher 官方把品牌故事起点放在日本九州，并以书写文化、材料与工艺合作组织产品；这不等于所有部件都在同一地点制造。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: ourStory.key,
      locator: "Our Story brand origin and purpose narrative",
      evidence: [
        {
          key: "phase107-brand-identity-official",
          sourceKey: ourStory.key,
          scopeKey: BRAND_SCOPE,
          locator: "Our Story Kyushu starting point and writing-culture narrative",
        },
      ],
    },
    {
      key: "phase107-wancher-brand-navigation",
      predicate: "brand_model_navigation",
      objectText:
        "Dream Pen 是跨材料与工艺的系列入口；True Ebonite Matte Black 必须作为具体 SKU 单独核验，而不是让系列页承载统一规格。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: dreamCollection.key,
      locator: "Dream Pen collection and exact True Ebonite product listing",
      evidence: [
        {
          key: "phase107-brand-navigation-collection",
          sourceKey: dreamCollection.key,
          scopeKey: BRAND_SCOPE,
          locator: "Dream Pen collection product/material range",
        },
        {
          key: "phase107-brand-navigation-independent",
          sourceKey: pencilcase.key,
          scopeKey: BRAND_SCOPE,
          locator:
            "2018 exact-product supplied sample demonstrates why model/sample scope must remain explicit",
          note:
            "只用于证明外部作者观察过具体 Dream Pen 项目与样品；不推广为品牌质量结论。",
        },
      ],
    },
  ],
  media: media("Wancher 品牌与 True Ebonite 证据边界图（非产品照片）"),
  timeline: [
    {
      key: "phase107-wancher-independent-sample-2018",
      title: "外部作者评测 Wancher Dream Pen supplied sample",
      eventType: "community_event",
      startDate: "2018-10-31",
      circa: false,
      description:
        "Pencilcase Blog 记录具体 True Ebonite 样品；它是品牌外部观察窗口，不是全品牌质量抽检。",
      sourceKey: pencilcase.key,
    },
    {
      key: "phase107-wancher-story-window",
      title: "Wancher 官方品牌叙事资料窗口",
      eventType: "design_milestone",
      startDate: "2026",
      circa: true,
      description:
        "2026-07-21 读取的官方品牌与 collection 资料；读取年份不是品牌创立年份。",
      sourceKey: ourStory.key,
    },
  ],
};

export const phase107TrueEbonitePack: CuratedEntityPack = {
  key: "phase107-wancher-true-ebonite-matte-black-v1",
  entityId: PHASE107_TRUE_EBONITE_ID,
  expectedType: "pen",
  expectedSlug: PHASE107_TRUE_EBONITE_SLUG,
  canonicalName: "Wancher Dream Pen True Ebonite Matte Black",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/wancher-dream-pen-true-ebonite-matte-black-phase107.md",
  storyTitle:
    "Wancher Dream Pen True Ebonite Matte Black：两条时间线读同一个名字",
  primarySourceKey: currentListing.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Dream Pen True Ebonite Matte Black",
      language: "en",
      sourceKey: currentListing.key,
    },
    {
      alias: "Wancher True Ebonite Matte Black",
      language: "en",
      sourceKey: currentListing.key,
    },
    {
      alias: "Wancher Dream Pen True Ebonite Matt Black",
      language: "en",
      sourceKey: currentListing.key,
    },
  ],
  sources: [currentListing, clipArticle, pencilcase, dreamCollection, diagram],
  scopes: [
    {
      key: CURRENT,
      scopeKey: CURRENT,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "2026-07-21 listing options: #6 JoWo stainless steel、Wancher 18K、Keiryu-Kodachi、Shogun；实际订单按 SKU。",
      materialScope:
        "Japanese Ebonite + Matte Sandblast Treatment；不继承 2018 polished sample 触感。",
      editionScope:
        "当日 listing 的 nib/feed/cap/clip/package 选项；不承诺价格、库存与未来可售性。",
    },
    {
      key: HISTORICAL,
      scopeKey: HISTORICAL,
      validFrom: "2018-10-31",
      validTo: "2018-10-31",
      productionState: "historical",
      nibScope:
        "单支 supplied sample：steel JoWo fine nib + Flexible Nib Factory ebonite feed。",
      materialScope:
        "单支 supplied sample：高度 polished 的黑色 ebonite；不是 current matte finish。",
      editionScope:
        "无夹、不能后插、block threads、slip-seal inner cap 与作者体验只属于受测样品。",
    },
  ],
  claims: [
    {
      key: "phase107-true-ebonite-current-identity",
      predicate: "model_identity",
      objectText:
        "当前 Dream Pen True Ebonite Matte Black listing 是以 Japanese Ebonite 与 Matte Sandblast Treatment 为核心的具体 Wancher SKU，不是 Dream Pen 系列文章本身。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: currentListing.key,
      locator: "product title and Specifications material line 764",
      evidence: [
        {
          key: "phase107-current-finish-citation",
          sourceKey: currentListing.key,
          scopeKey: CURRENT,
          locator:
            "product title; Specifications lines 762-766: Japanese Ebonite, Matte Sandblast Treatment",
        },
      ],
    },
    {
      key: "phase107-true-ebonite-current-configuration",
      predicate: "current_configuration",
      objectText:
        "2026-07-21 页面列 European International cartridge/converter、多种 nib/feed、compact air-tight cap 与 clip options；它们是选择范围而非同时安装的固定组合。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: currentListing.key,
      locator: "Specifications lines 766-772 and live product option selectors",
      evidence: [
        {
          key: "phase107-current-config-citation",
          sourceKey: currentListing.key,
          scopeKey: CURRENT,
          locator:
            "lines 766-772: European International converter/cartridge; nib/feed choices; compact air-tight cap",
        },
        {
          key: "phase107-current-clip-citation",
          sourceKey: clipArticle.key,
          scopeKey: CURRENT,
          locator:
            "2022 article documenting original clipless design and later clip option; current availability remains listing-specific",
        },
      ],
    },
    {
      key: "phase107-true-ebonite-historical-sample",
      predicate: "historical_sample_observation",
      objectText:
        "Pencilcase Blog 的 2018 Wancher supplied sample 为 polished、clipless、non-posting，采用 block threads、slip seal、steel JoWo fine 与 FNF ebonite feed；写感与价格判断只属于该样品。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: pencilcase.key,
      locator:
        "2018 review finish, posting, threads, seal, nib/feed and final supplied-product disclosure",
      evidence: [
        {
          key: "phase107-historical-finish-citation",
          sourceKey: pencilcase.key,
          scopeKey: HISTORICAL,
          locator:
            "polished Japanese ebonite paragraphs and clipless cigar-shape photos/descriptions",
        },
        {
          key: "phase107-historical-structure-citation",
          sourceKey: pencilcase.key,
          scopeKey: HISTORICAL,
          locator:
            "non-posting paragraph; production block threads, occasional cross-thread and slip-seal inner-cap paragraphs",
        },
        {
          key: "phase107-historical-nib-citation",
          sourceKey: pencilcase.key,
          scopeKey: HISTORICAL,
          locator:
            "steel JoWo fine + Flexible Nib Factory ebonite feed paragraph; smooth/responsive/rich-flow judgment",
          note:
            "作者体验；文章末披露产品由 Wancher 提供且无 affiliate links。",
        },
      ],
    },
  ],
  variants: [
    {
      key: "phase107-current-clip-options",
      name: "Clipless／Chrome-plated clip／Gold-plated clip",
      releaseYear: "2026-07-21 listing snapshot",
      notes:
        "当前页面选项；不是三个独立基础型号，也不保证未来库存。",
      sourceKey: currentListing.key,
      variantKind: "market_sku",
    },
    {
      key: "phase107-current-nib-feed-options",
      name: "Current nib and feed choices",
      releaseYear: "2026-07-21 listing snapshot",
      notes:
        "#6 JoWo steel、Wancher 18K、Keiryu-Kodachi、Shogun 及 plastic/black ebonite/red ebonite feed 按订单组合。",
      sourceKey: currentListing.key,
      variantKind: "market_sku",
    },
  ],
  spec: {
    brandEntityId: PHASE107_WANCHER_ID,
    values: {
      series_name: "Wancher Dream Pen True Ebonite Matte Black",
      release_year:
        "当前 2026-07-21 listing；2018 supplied sample 为独立历史 scope，不声明统一首发年",
      origin_country:
        "Wancher 日本品牌与 Japanese Ebonite 产品语境；不从品牌自述推断每个部件产地",
      nib: "当前 listing 可选 #6 JoWo stainless steel、Wancher 18K、Keiryu-Kodachi、Shogun；按订单核对",
      fill_system: "Converter or Cartridge (European International Standard)",
      material: "Japanese Ebonite，Matte Sandblast Treatment",
      dimensions:
        "官方说明手工尺寸可轻微变化；本包不借用 2018 sibling measurements 建立固定数值",
      weight: "本包没有可核实的 current 统一重量，不从历史样品回填",
      status:
        "2026-07-21 官方 listing snapshot；笔夹、笔尖、feed、包装和库存按当期 SKU",
    },
    evidence: [
      ev(
        "brand_entity_id",
        "phase107-spec-brand",
        dreamCollection.key,
        CURRENT,
        "official Wancher Dream Pen collection and exact product identity",
      ),
      ev(
        "series_name",
        "phase107-spec-series",
        currentListing.key,
        CURRENT,
        "exact current product title",
      ),
      ev(
        "release_year",
        "phase107-spec-time",
        currentListing.key,
        CURRENT,
        "retrieved 2026-07-21; observation date is not claimed launch date",
      ),
      ev(
        "origin_country",
        "phase107-spec-origin",
        ourStory.key,
        CURRENT,
        "official brand context only; no unsupported component-origin claim",
      ),
      ev(
        "nib",
        "phase107-spec-nib",
        currentListing.key,
        CURRENT,
        "Specifications line 768 nib options",
      ),
      ev(
        "fill_system",
        "phase107-spec-fill",
        currentListing.key,
        CURRENT,
        "Specifications line 766 European International converter/cartridge",
      ),
      ev(
        "material",
        "phase107-current-finish-citation",
        currentListing.key,
        CURRENT,
        "Specifications line 764 Japanese Ebonite and Matte Sandblast Treatment",
      ),
      {
        fieldKey: "material",
        key: "phase107-historical-finish-citation",
        sourceKey: pencilcase.key,
        scopeKey: HISTORICAL,
        locator:
          "2018 supplied sample polished black ebonite observation; rejected as current model spec",
        qualifies: false,
        note: "Historical sample evidence retained only to resolve the finish conflict.",
      },
      ev(
        "dimensions",
        "phase107-spec-dimensions",
        currentListing.key,
        CURRENT,
        "handmade slight-size-variation statement; no stable numeric value claimed",
      ),
      ev(
        "weight",
        "phase107-spec-weight",
        currentListing.key,
        CURRENT,
        "no current model-wide number asserted; historical sibling measurements rejected",
      ),
      ev(
        "status",
        "phase107-spec-status",
        currentListing.key,
        CURRENT,
        "live listing retrieved 2026-07-21; mutable price and stock excluded",
      ),
    ],
  },
  conflicts: [
    {
      key: "phase107-finish-temporal-sample-conflict",
      fieldKey: "material",
      scopeKey: CURRENT,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "官方 current listing 的 matte sandblast 与 2018 supplied sample 的 polished finish 属于不同时间／样品 scope；不互相覆盖，也不宣称同批次。",
      members: [
        {
          citationKey: "phase107-current-finish-citation",
          assertedValue: "2026-07-21 current: Matte Sandblast Treatment",
        },
        {
          citationKey: "phase107-historical-finish-citation",
          assertedValue: "2018 supplied sample: polished black ebonite",
        },
      ],
    },
  ],
  media: media("Wancher True Ebonite current／historical 事实图（非产品照片）"),
  timeline: [
    {
      key: "phase107-true-ebonite-review-2018",
      title: "Pencilcase Blog 评测 True Ebonite supplied sample",
      eventType: "community_event",
      startDate: "2018-10-31",
      circa: false,
      description:
        "记录 polished clipless sample、结构、steel JoWo fine + ebonite feed 与作者体验；不是 current SKU 规格。",
      sourceKey: pencilcase.key,
    },
    {
      key: "phase107-true-ebonite-current-window",
      title: "True Ebonite Matte Black current listing 资料窗口",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "官方页面可见 matte sandblast、European International C/C 与当期选项；读取日不是首发日。",
      sourceKey: currentListing.key,
    },
  ],
};

export const phase107WancherPacks: CuratedEntityPack[] = [
  phase107WancherBrandPack,
  phase107TrueEbonitePack,
];
