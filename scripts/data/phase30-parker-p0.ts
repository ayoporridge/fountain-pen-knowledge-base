import type {
  CuratedEntityPack,
  CuratedSource,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-19";

export const PHASE30_PARKER_ID = "vhqNYqDChhiN";
export const PHASE30_INGENUITY_ID = "b16OmQf7Jwfr";
export const PHASE30_URBAN_ID = "PbA7NulBdLC-";
export const PHASE30_VECTOR_ID = "ZxZjOj45mkq4";
export const PHASE30_VECTOR_XL_ID = "P7LgZR6-DDPi";

type LiveSourceInput = Omit<
  CuratedSource,
  "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
> & {
  allowedUse?: CuratedSource["allowedUse"];
  locator: string;
};

function liveSource(source: LiveSourceInput): CuratedSource {
  const { allowedUse, locator, ...record } = source;
  return {
    ...record,
    retrievedAt: RETRIEVED,
    allowedUse: allowedUse ?? "summary_only",
    archiveUrl: record.url,
    archiveLocator: [
      "live-source-not-frozen",
      `retrieved=${RETRIEVED}`,
      "external_archive=false",
      "raw_source_stored=false",
      `locator=${locator}`,
    ].join(";"),
  };
}

function siteOriginalSource(input: {
  key: string;
  title: string;
  path: string;
  diagramScope: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: input.title,
    url: input.path,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: `${input.diagramScope}；本站原创 factual SVG，仅呈现资料关系，示意图，非产品照片。`,
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: input.path,
    archiveLocator: [
      `project-public-asset:${input.path}`,
      "site-original=true",
      "format=svg",
      "editorial-diagram=true",
      "product-photo=false",
      "product-likeness=false",
      "official-photo-copied=false",
    ].join(";"),
  };
}

const SOURCES = {
  "parker-ingenuity-2023-press": liveSource({
    key: "parker-ingenuity-2023-press",
    registryKey: "parker-official",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official",
    title: "Parker Ingenuity Press Release",
    url: "https://www.parkerpen.com/parker-ingenuity-press-release.html",
    homepageUrl: "https://www.parkerpen.com/",
    author: "Parker / Newell Brands",
    publishedAt: "2023-03",
    summary:
      "Parker 官方 2023 新闻稿：新一代 Ingenuity 扩展到 fountain pen、rollerball 与 ballpoint，并说明大型不锈钢尖及首发 finish。",
    locator:
      "March 2023 launch paragraph; extended family paragraph; four finishes and stainless-steel nib statement",
  }),
  "parker-ingenuity-2213726-pdp": liveSource({
    key: "parker-ingenuity-2213726-pdp",
    registryKey: "parker-official",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official",
    title: "Ingenuity Fountain Pen — Grey GT 2213726",
    url: "https://www.parkerpen.com/writing-types/collections/ingenuity/ingenuity-fountain-pen/SAP_2213726.html",
    homepageUrl: "https://www.parkerpen.com/",
    author: "Parker / Newell Brands",
    summary:
      "Parker 当前美国 PDP：2213726、Grey lacquer Gold trim、Fine、gold-PVD stainless-steel nib 与 lacquer-on-brass cap。",
    locator:
      "Specifications: Item #2213726; Nib Size Fine; Nib Material Stainless Steel (Gold PVD); Cap Material Lacquer on brass",
  }),
  "parker-2026-emea-catalogue": liveSource({
    key: "parker-2026-emea-catalogue",
    registryKey: "parker-official-catalogues",
    registryName: "Parker trade catalogues",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official",
    title: "Parker Trade Catalogue 2026 — EMEA",
    url: "https://www.parkerromania.ro/cataloage1/Parker/Parker%20-%202026.pdf",
    homepageUrl: "https://www.parkerpen.com/",
    author: "Parker / Newell Brands",
    publishedAt: "2025-09-30",
    summary:
      "Parker 2026 EMEA 官方 trade catalogue；第 110 页把 2213726 列为 Grey GT FP M，第 109 页列 2182006。",
    locator:
      "catalogue pages 109-110; portfolio rows 2182006 and 2213726; legend FP=Fountain Pen, F=Fine, M=Medium",
  }),
  "parker-ingenuity-2182006-penheaven": liveSource({
    key: "parker-ingenuity-2182006-penheaven",
    registryKey: "pen-heaven",
    registryName: "Pen Heaven",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "pen-heaven-retailer",
    title: "Parker Ingenuity Black Gold Trim Fountain Pen",
    url: "https://www.penheaven.com/parker-ingenuity-black-gold-trim-fountain-pen",
    homepageUrl: "https://www.penheaven.com/",
    author: "Pen Heaven",
    summary:
      "独立专业零售商品页把 SKU 2182006 与 M 钢尖、140/165 mm、13.7 mm、45 g 对应；只作该 SKU 规格证据。",
    locator:
      "SKU 2182006 heading and Key Features: medium stainless-steel nib; closed L140 x D13.7; posted L165 x D13.7; weight 45g",
  }),
  "parker-ingenuity-5th-goldspot": liveSource({
    key: "parker-ingenuity-5th-goldspot",
    registryKey: "goldspot-magazine",
    registryName: "Goldspot Pens Magazine",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "goldspot-editorial",
    title: "Parker 5th Mode Peacock Ink Review",
    url: "https://goldspot.com/blogs/magazine/parker-5th-mode-peacock-ink-review",
    homepageUrl: "https://goldspot.com/",
    author: "Goldspot Pens",
    publishedAt: "2013",
    summary:
      "专业零售编辑文章记录旧 Ingenuity 5TH 的专用 refill 书写系统；只用于与 2023+ 真钢笔划界。",
    locator:
      "review identity and Parker 5th refill description; historical 5TH boundary only",
  }),
  "parker-urban-1931593-pdp": liveSource({
    key: "parker-urban-1931593-pdp",
    registryKey: "parker-official",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official",
    title: "Urban Fountain Pen — Muted Black GT 1931593",
    url: "https://www.parkerpen.com/writing-types/collections/urban/urban-fountain-pen/SP_1417014.html",
    homepageUrl: "https://www.parkerpen.com/",
    author: "Parker / Newell Brands",
    summary:
      "Parker 当前 Urban PDP：1931593、Muted Black GT、F、不锈钢尖、漆面黄铜笔帽及 QUINK 墨囊／converter。",
    locator:
      "description and Specifications: Item #1931593; Fine; Stainless steel; Cap Material Lacquer on Brass; convertible to bottle filling",
  }),
  "parker-urban-gentleman-stationer": liveSource({
    key: "parker-urban-gentleman-stationer",
    registryKey: "gentleman-stationer",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "gentleman-stationer",
    title: "Pen Review: The New Parker Urban Fountain Pen",
    url: "https://www.gentlemanstationer.com/blog/2017/4/17/pen-review-parker-urban",
    homepageUrl: "https://www.gentlemanstationer.com/",
    author: "The Gentleman Stationer",
    publishedAt: "2017-04-19",
    summary:
      "独立专业评测记录 2016 年末 Parker 产品线重设计、新 Urban 笔尖变化及单支样笔范围；披露 Massdrop 供样与 affiliate links。",
    locator:
      "paragraphs 40-48 for late-2016 redesign and new nib; review-unit disclosure in paragraph 42",
  }),
  "parker-2021-trade-catalogue": liveSource({
    key: "parker-2021-trade-catalogue",
    registryKey: "parker-official-catalogues",
    registryName: "Parker trade catalogues",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official",
    title: "Parker Trade Catalogue 2021",
    url: "https://assets.parkerpen.com/is/content/NewellRubbermaid/DASH/S7_int/Fine_Writing/2021/prkr_trdctlg_2021.pdf",
    homepageUrl: "https://www.parkerpen.com/",
    author: "Parker / Newell Brands",
    itemType: "pdf",
    publishedAt: "2021",
    summary:
      "2021 trade catalogue 用于确认 Parker 51 的 Core／Deluxe、钢尖／18K 金尖、墨囊／上墨器与旋帽边界。",
    locator: "Parker 51 Core and Deluxe product tables in the 2021 trade catalogue",
  }),
  "parker-2022-catalogue": liveSource({
    key: "parker-2022-catalogue",
    registryKey: "parker-official-catalogues",
    registryName: "Parker trade catalogues",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official",
    title: "Parker Trade Catalogue 2022",
    url: "https://www.parkerromania.ro/cataloage1/Parker/ParkerCatalog2022.pdf",
    homepageUrl: "https://www.parkerpen.com/",
    author: "Parker / Newell Brands",
    publishedAt: "2022",
    summary:
      "Parker 2022 trade catalogue 已单列 Vector XL，并把 2159746 列为 Teal Fountain Pen Medium nib。",
    locator:
      "Vector XL collection pages and portfolio row 2159746: Vector XL Teal Fountain Pen Medium nib",
  }),
  "parker-vector-penography": liveSource({
    key: "parker-vector-penography",
    registryKey: "parker-collector-penography",
    registryName: "Parker Pens Penography",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "parker-collector-penography",
    title: "Parker Pens Penography: Vector",
    url: "https://parkerpens.net/vector.html",
    homepageUrl: "https://parkerpens.net/",
    author: "Tony Fischier",
    summary:
      "Parker 专题研究：1984 年 2 月 FP-1 加入 RB-1，3 月起使用 Vector 名称，并记录随后结构调整。",
    locator:
      "Vector history paragraphs: February 1984 FP-1; March 1984 Vector naming; late-1984 redesign",
  }),
  "parker-vector-xl-pdp": liveSource({
    key: "parker-vector-xl-pdp",
    registryKey: "parker-official",
    registryName: "Parker official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official",
    title: "Vector XL Fountain Pen",
    url: "https://www.parkerpen.com/writing-types/collections/vector-xl/vector-xl-fountain-pen/SP_1417056.html",
    homepageUrl: "https://www.parkerpen.com/",
    author: "Parker / Newell Brands",
    summary:
      "Parker 当前 Vector XL PDP，说明 large stainless-steel nib 与 XL 家族；具体页面 SKU 随颜色选择变化。",
    locator:
      "description and Features: Vector XL identity and durable large stainless-steel nib",
  }),
  "parker-vector-xl-2159746-penheaven": liveSource({
    key: "parker-vector-xl-2159746-penheaven",
    registryKey: "pen-heaven",
    registryName: "Pen Heaven",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "pen-heaven-retailer",
    title: "Parker Vector XL Teal Fountain Pen",
    url: "https://www.penheaven.com/parker-vector-xl-teal-fountain-pen",
    homepageUrl: "https://www.penheaven.com/",
    author: "Pen Heaven",
    summary:
      "独立专业零售商品页：2159746、M 钢尖、135/157 mm、11.5 mm、20 g，converter compatible 且 sold separately。",
    locator:
      "SKU 2159746 and Key Features: medium stainless-steel nib; closed L135 x D11.5; posted L157 x D11.5; 20g; converter sold separately",
  }),
  "parker-care-guide": liveSource({
    key: "parker-care-guide",
    registryKey: "parker-official-support",
    registryName: "Parker care guides",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "parker-newell-official",
    title: "Parker fountain pen care guide",
    url: "https://www.parkerpen.com/fountain-pen-care-guides.html",
    homepageUrl: "https://www.parkerpen.com/",
    author: "Parker / Newell Brands",
    summary:
      "Parker 现代钢笔的墨囊／上墨器、清洗与维护入口；不用于 vintage Vacumatic 或 Aero-metric 的拆修。",
    locator: "fountain pen filling, cleaning and storage guidance",
  }),
  "parker-ingenuity-diagram": siteOriginalSource({
    key: "parker-ingenuity-diagram",
    title: "Parker Ingenuity 2023+ 身份与 SKU 证据图",
    path: "/images/library/site-original/parker-p0/parker-ingenuity-factual-diagram.svg",
    diagramScope: "区分 2023+ fountain pen 与 2011 5TH，并标注 2213726 冲突和 2182006 SKU 规格",
  }),
  "parker-urban-diagram": siteOriginalSource({
    key: "parker-urban-diagram",
    title: "Parker Urban post-2016 代际与 1931593 证据图",
    path: "/images/library/site-original/parker-p0/parker-urban-factual-diagram.svg",
    diagramScope: "表示 post-2016 代际边界和 1931593 的 SKU 规格",
  }),
  "parker-vector-diagram": siteOriginalSource({
    key: "parker-vector-diagram",
    title: "经典 Parker Vector 文字时间线",
    path: "/images/library/site-original/parker-p0/parker-vector-factual-diagram.svg",
    diagramScope: "表示 RB-1、FP-1、Vector 与 Vector XL 分叉关系",
  }),
  "parker-vector-xl-diagram": siteOriginalSource({
    key: "parker-vector-xl-diagram",
    title: "Parker Vector XL 2159746 规格卡",
    path: "/images/library/site-original/parker-p0/parker-vector-xl-factual-diagram.svg",
    diagramScope: "表示 2159746 的 M、尺寸、重量与 converter 边界",
  }),
} satisfies Record<string, CuratedSource>;

const source = (key: keyof typeof SOURCES): CuratedSource => SOURCES[key];

export const phase30ParkerP0Packs: CuratedEntityPack[] = [
  {
    key: "phase30-parker-ingenuity-v1",
    entityId: PHASE30_INGENUITY_ID,
    expectedType: "pen",
    expectedSlug: "parker-ingenuity-fountain-pen",
    canonicalName: "Parker Ingenuity Fountain Pen（2023–）",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/parker-ingenuity-publishable-content-2026-07-19.md",
    storyTitle: "Parker Ingenuity Fountain Pen：2023 新钢笔与 2011 5TH 怎么分",
    primarySourceKey: "parker-ingenuity-2023-press",
    depthTier: "A",
    aliases: [
      {
        alias: "Parker Ingenuity Fountain Pen",
        language: "en",
        sourceKey: "parker-ingenuity-2023-press",
      },
      {
        alias: "派克 Ingenuity 钢笔",
        language: "zh",
        sourceKey: "parker-ingenuity-2023-press",
      },
    ],
    sources: [
      source("parker-ingenuity-2023-press"),
      source("parker-ingenuity-2213726-pdp"),
      source("parker-2026-emea-catalogue"),
      source("parker-ingenuity-2182006-penheaven"),
      source("parker-ingenuity-5th-goldspot"),
      source("parker-care-guide"),
      source("parker-ingenuity-diagram"),
    ],
    variants: [
      {
        key: "grey-gt-2213726",
        name: "Grey GT 2213726",
        notes:
          "同一 SKU：Parker 美国 PDP 写 F，2026 EMEA catalogue 写 M；冲突保留，不提升为 family 尖号。",
        sourceKey: "parker-ingenuity-2213726-pdp",
        variantKind: "market_sku",
        productCode: "2213726",
        market: "美国 PDP / EMEA catalogue",
      },
      {
        key: "black-gt-2182006",
        name: "Black GT 2182006",
        notes:
          "M；闭合 140 mm、插帽 165 mm、最大径 13.7 mm、45 g；这些值只绑定 SKU 2182006。",
        sourceKey: "parker-ingenuity-2182006-penheaven",
        variantKind: "market_sku",
        productCode: "2182006",
        market: "EMEA / UK retailer snapshot",
      },
    ],
    scopes: [
      {
        key: "ingenuity-current",
        scopeKey: "parker-ingenuity-fountain-pen-2023-present",
        validFrom: "2023-03",
        productionState: "current",
        nibScope: "large stainless-steel fountain-pen nib; SKU-specific F/M",
        editionScope: "2023+ conventional fountain pen only",
      },
      {
        key: "ingenuity-5th-excluded",
        scopeKey: "parker-ingenuity-5th-2011-excluded",
        validFrom: "2011",
        productionState: "historical",
        editionScope: "5TH refill writing system; explicitly not this fountain pen",
      },
      {
        key: "ingenuity-2213726-conflict",
        scopeKey: "parker-ingenuity-grey-gt-2213726-official-conflict",
        variantKey: "grey-gt-2213726",
        productionState: "current",
        nibScope: "official PDP F versus official 2026 EMEA catalogue M",
        editionScope: "SKU 2213726 only",
      },
      {
        key: "ingenuity-2182006",
        scopeKey: "parker-ingenuity-black-gt-2182006",
        variantKey: "black-gt-2182006",
        productionState: "current",
        nibScope: "M stainless-steel nib",
        editionScope: "SKU 2182006 measurements only",
      },
    ],
    claims: [
      {
        key: "ingenuity-identity-boundary",
        predicate: "model_identity",
        objectText:
          "本页是 Parker 2023 年发布的新一代 conventional fountain pen，严格排除 2011 Ingenuity 5TH refill writing system。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "parker-ingenuity-2023-press",
        locator: "March 2023 next-generation fountain-pen launch",
        evidence: [
          {
            key: "ingenuity-current-official",
            sourceKey: "parker-ingenuity-2023-press",
            scopeKey: "ingenuity-current",
            locator:
              "next generation extends range to Fountain Pen, Rollerball and Ballpoint; stainless-steel nibs",
          },
          {
            key: "ingenuity-5th-secondary",
            sourceKey: "parker-ingenuity-5th-goldspot",
            scopeKey: "ingenuity-5th-excluded",
            locator: "historical Ingenuity 5TH dedicated refill identity",
          },
        ],
      },
      {
        key: "ingenuity-2213726-conflict",
        predicate: "sku_specification_conflict",
        objectText:
          "2213726 在 Parker 美国 PDP 标为 F，在 2026 EMEA 官方目录标为 M；本站记录冲突，不在 family 层选择其一。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "parker-ingenuity-2213726-pdp",
        locator: "matching SKU 2213726 with conflicting official nib sizes",
        evidence: [
          {
            key: "ingenuity-2213726-pdp-f",
            sourceKey: "parker-ingenuity-2213726-pdp",
            scopeKey: "ingenuity-2213726-conflict",
            locator: "Specifications: Item #2213726, Nib Size Fine",
          },
          {
            key: "ingenuity-2213726-catalogue-m",
            sourceKey: "parker-2026-emea-catalogue",
            scopeKey: "ingenuity-2213726-conflict",
            locator: "page 110: 2213726 Ingenuity Grey GT FP M",
          },
        ],
      },
      {
        key: "ingenuity-2182006-spec",
        predicate: "market_sku_specification",
        objectText:
          "Black GT 2182006 为 M，闭合 140 mm、插帽 165 mm、最大径 13.7 mm、45 g；数值只属于该 SKU。",
        factClass: "core",
        confidence: 0.96,
        sourceKey: "parker-ingenuity-2182006-penheaven",
        locator: "Pen Heaven SKU and Key Features",
        evidence: [
          {
            key: "ingenuity-2182006-secondary-spec",
            sourceKey: "parker-ingenuity-2182006-penheaven",
            scopeKey: "ingenuity-2182006",
            locator:
              "SKU 2182006; medium steel nib; L140/L165/D13.7; 45g",
          },
          {
            key: "ingenuity-2182006-official-code",
            sourceKey: "parker-2026-emea-catalogue",
            scopeKey: "ingenuity-2182006",
            locator: "page 109: 2182006 Ingenuity Black Lacquer GT FP",
          },
        ],
      },
      {
        key: "ingenuity-media-boundary",
        predicate: "media_identity_boundary",
        objectText:
          "主图是本站原创 factual SVG，只表示身份和 SKU 证据关系；示意图，非产品照片。",
        factClass: "editorial",
        confidence: 1,
        sourceKey: "parker-ingenuity-diagram",
        locator: "site-original SVG provenance",
        evidence: [
          {
            key: "ingenuity-diagram-not-photo",
            sourceKey: "parker-ingenuity-diagram",
            scopeKey: "ingenuity-current",
            locator: "product-photo=false; product-likeness=false",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: PHASE30_PARKER_ID,
      values: {
        series_name: "Parker Ingenuity Fountain Pen（2023–）",
        release_year: "2023",
        nib: "大型不锈钢尖；F/M 依 SKU 与市场，2213726 存在官方冲突",
        fill_system: "Parker 墨囊／上墨器；包装是否附 converter 依 SKU",
        material: "漆面金属笔帽与笔杆；材料、镀层依 SKU",
        dimensions:
          "家族不设统一尺寸；Black GT 2182006 为闭合 140 mm、插帽 165 mm、最大径 13.7 mm",
        weight: "家族不设统一重量；Black GT 2182006 为 45 g",
        status: "2023+ current fountain pen；严格排除 2011 Ingenuity 5TH",
      },
      evidence: [
        {
          key: "ingenuity-brand",
          fieldKey: "brand_entity_id",
          sourceKey: "parker-ingenuity-2023-press",
          scopeKey: "ingenuity-current",
          locator: "official Parker Ingenuity release",
        },
        {
          key: "ingenuity-series",
          fieldKey: "series_name",
          sourceKey: "parker-ingenuity-2023-press",
          scopeKey: "ingenuity-current",
          locator: "next generation Parker Ingenuity Fountain Pen",
        },
        {
          key: "ingenuity-year",
          fieldKey: "release_year",
          sourceKey: "parker-ingenuity-2023-press",
          scopeKey: "ingenuity-current",
          locator: "March 2023 launch",
        },
        {
          key: "ingenuity-2213726-nib-pdp",
          fieldKey: "nib",
          sourceKey: "parker-ingenuity-2213726-pdp",
          scopeKey: "ingenuity-2213726-conflict",
          locator: "Item #2213726, Nib Size Fine",
          note: "Conflicting official SKU record; not a family-wide value.",
        },
        {
          key: "ingenuity-2213726-nib-catalogue",
          fieldKey: "nib",
          sourceKey: "parker-2026-emea-catalogue",
          scopeKey: "ingenuity-2213726-conflict",
          locator: "page 110: 2213726 Grey GT FP M",
          note: "Conflicting official SKU record; not a family-wide value.",
        },
        {
          key: "ingenuity-fill",
          fieldKey: "fill_system",
          sourceKey: "parker-ingenuity-2023-press",
          scopeKey: "ingenuity-current",
          locator: "conventional fountain-pen family identity",
        },
        {
          key: "ingenuity-material",
          fieldKey: "material",
          sourceKey: "parker-ingenuity-2213726-pdp",
          scopeKey: "ingenuity-current",
          locator: "Grey GT lacquer-on-brass and PVD fields; SKU-scoped example",
        },
        {
          key: "ingenuity-dimensions-2182006",
          fieldKey: "dimensions",
          sourceKey: "parker-ingenuity-2182006-penheaven",
          scopeKey: "ingenuity-2182006",
          locator: "closed L140 x D13.7; posted L165 x D13.7",
          note: "Qualifies only for the explicitly SKU-scoped spec wording.",
        },
        {
          key: "ingenuity-weight-2182006",
          fieldKey: "weight",
          sourceKey: "parker-ingenuity-2182006-penheaven",
          scopeKey: "ingenuity-2182006",
          locator: "Weight 45g",
          note: "Qualifies only for the explicitly SKU-scoped spec wording.",
        },
        {
          key: "ingenuity-status",
          fieldKey: "status",
          sourceKey: "parker-ingenuity-2023-press",
          scopeKey: "ingenuity-current",
          locator: "2023+ fountain-pen identity",
        },
      ],
    },
    conflicts: [
      {
        key: "ingenuity-2213726-official-nib-conflict",
        fieldKey: "nib",
        scopeKey: "ingenuity-2213726-conflict",
        conflictKind: "field",
        status: "resolved",
        resolutionNote:
          "Retain both dated official assertions on SKU 2213726. Do not choose F or M at family level; buyers must verify market, box label and nib marking.",
        members: [
          {
            citationKey: "ingenuity-2213726-nib-pdp",
            assertedValue: "F",
          },
          {
            citationKey: "ingenuity-2213726-nib-catalogue",
            assertedValue: "M",
          },
        ],
      },
    ],
    media: [
      {
        key: "ingenuity-factual-diagram-primary",
        title: "Parker Ingenuity 2023+ 身份与 SKU 证据示意图（非产品照片）",
        sourceKey: "parker-ingenuity-diagram",
        localPath:
          "/images/library/site-original/parker-p0/parker-ingenuity-factual-diagram.svg",
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "Fountain Pen Graph 本站原创 factual SVG/editorial diagram。示意图，非产品照片；未复制或临摹 Parker 产品照，不表现真实笔身、笔夹、刻字、颜色、比例或批次，不能作为鉴定证据。",
        sourceUrl:
          "/images/library/site-original/parker-p0/parker-ingenuity-factual-diagram.svg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "ingenuity-fountain-pen-2023",
        title: "新一代 Ingenuity Fountain Pen 发布",
        eventType: "model_released",
        startDate: "2023-03",
        circa: false,
        description:
          "Parker 扩展 Ingenuity 为钢笔、宝珠笔和圆珠笔；本事件不指 2011 5TH。",
        sourceKey: "parker-ingenuity-2023-press",
      },
    ],
  },
  {
    key: "phase30-parker-vector-classic-v1",
    entityId: PHASE30_VECTOR_ID,
    expectedType: "pen",
    expectedSlug: "派克-parker-威雅-vector",
    canonicalName: "Parker Vector（经典款）",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/parker-vector-publishable-content-2026-07-19.md",
    storyTitle: "经典 Parker Vector：从 1984 FP-1 到 Vector",
    primarySourceKey: "parker-2021-trade-catalogue",
    depthTier: "A",
    aliases: [
      {
        alias: "Parker Vector",
        language: "en",
        sourceKey: "parker-2021-trade-catalogue",
      },
      {
        alias: "Parker FP-1",
        language: "en",
        kind: "former_name",
        sourceKey: "parker-vector-penography",
      },
      {
        alias: "派克威雅",
        language: "zh",
        sourceKey: "parker-2021-trade-catalogue",
      },
    ],
    sources: [
      source("parker-2021-trade-catalogue"),
      source("parker-2022-catalogue"),
      source("parker-vector-penography"),
      source("parker-care-guide"),
      source("parker-vector-diagram"),
    ],
    variants: [
      {
        key: "fp1-1984",
        name: "FP-1 early fountain-pen identity",
        releaseYear: "1984",
        notes:
          "1984 年 2 月加入 RB-1 路线，随后开始使用 Vector 名称；不是 Vector XL。",
        sourceKey: "parker-vector-penography",
        variantKind: "edition_group",
        productCode: "FP-1",
      },
    ],
    scopes: [
      {
        key: "vector-classic",
        scopeKey: "parker-vector-classic-slim-family",
        validFrom: "1984",
        productionState: "historical",
        nibScope: "stainless-steel fountain-pen nib; widths vary by version",
        materialScope: "plastic and metal variants; no family-wide material",
        editionScope: "classic slim Vector lineage; excludes Vector XL",
      },
      {
        key: "vector-fp1",
        scopeKey: "parker-vector-fp1-1984-lineage",
        variantKey: "fp1-1984",
        validFrom: "1984-02",
        productionState: "historical",
        editionScope: "FP-1 predecessor/name-transition evidence",
      },
      {
        key: "vector-xl-excluded",
        scopeKey: "parker-vector-xl-excluded-from-classic",
        validFrom: "2022",
        productionState: "current",
        editionScope:
          "Vector XL is a separate catalogue family; no XL SKU, dimensions or weight on classic Vector",
      },
    ],
    claims: [
      {
        key: "vector-classic-xl-boundary",
        predicate: "model_identity",
        objectText:
          "经典 slim Vector 与现代 Vector XL 是两个独立型号；本页只保留经典 Vector 的资料，不混入 XL 的商品代码、尺寸和重量。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "parker-2022-catalogue",
        locator: "official catalogue separates Vector and Vector XL families",
        evidence: [
          {
            key: "vector-official-family-boundary",
            sourceKey: "parker-2022-catalogue",
            scopeKey: "vector-xl-excluded",
            locator: "separate Vector XL collection and 2159746 portfolio row",
          },
          {
            key: "vector-secondary-classic-lineage",
            sourceKey: "parker-vector-penography",
            scopeKey: "vector-classic",
            locator: "classic Vector history from RB-1 and FP-1",
          },
        ],
      },
      {
        key: "vector-fp1-history",
        predicate: "model_history",
        objectText:
          "1984 年 2 月 FP-1 加入 RB-1 产品线，从 1984 年 3 月起开始使用 Vector 名称；随后仍有结构调整。",
        factClass: "core",
        confidence: 0.95,
        sourceKey: "parker-vector-penography",
        locator: "February/March 1984 history paragraphs",
        evidence: [
          {
            key: "vector-fp1-secondary-history",
            sourceKey: "parker-vector-penography",
            scopeKey: "vector-fp1",
            locator:
              "February 1984 FP-1 addition; March 1984 Vector naming; late-1984 redesign",
          },
        ],
      },
      {
        key: "vector-media-boundary",
        predicate: "media_identity_boundary",
        objectText:
          "主图是本站原创文字时间线 SVG；示意图，非产品照片，也不表现经典 Vector 外形。",
        factClass: "editorial",
        confidence: 1,
        sourceKey: "parker-vector-diagram",
        locator: "site-original SVG provenance",
        evidence: [
          {
            key: "vector-diagram-not-photo",
            sourceKey: "parker-vector-diagram",
            scopeKey: "vector-classic",
            locator: "product-photo=false; product-likeness=false",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: PHASE30_PARKER_ID,
      values: {
        series_name: "Parker Vector（classic slim family）",
        release_year:
          "FP-1 introduced in 1984; Vector name adopted during 1984",
        nib: "不锈钢尖；尖号与配置依历史版本",
        fill_system: "Parker 墨囊／兼容 converter；包装与适配依版本",
        material: "经典家族含塑料与金属版本，不设统一金属笔身",
        status:
          "历史长期家族；与 2022 官方目录已单列的 Vector XL 分开，XL 精确全球首发日未核实",
      },
      evidence: [
        {
          key: "vector-brand",
          fieldKey: "brand_entity_id",
          sourceKey: "parker-2021-trade-catalogue",
          scopeKey: "vector-classic",
          locator: "official Parker Vector catalogue",
        },
        {
          key: "vector-series",
          fieldKey: "series_name",
          sourceKey: "parker-2021-trade-catalogue",
          scopeKey: "vector-classic",
          locator: "official classic Vector collection",
        },
        {
          key: "vector-year",
          fieldKey: "release_year",
          sourceKey: "parker-vector-penography",
          scopeKey: "vector-fp1",
          locator: "February/March 1984 FP-1 and Vector naming",
        },
        {
          key: "vector-nib",
          fieldKey: "nib",
          sourceKey: "parker-vector-penography",
          scopeKey: "vector-classic",
          locator: "classic Vector fountain-pen steel nib context",
        },
        {
          key: "vector-fill",
          fieldKey: "fill_system",
          sourceKey: "parker-2021-trade-catalogue",
          scopeKey: "vector-classic",
          locator: "classic Vector fountain-pen refillable configuration",
        },
        {
          key: "vector-material",
          fieldKey: "material",
          sourceKey: "parker-vector-penography",
          scopeKey: "vector-classic",
          locator: "Standard plastic and Flighter/metal version history",
        },
        {
          key: "vector-status",
          fieldKey: "status",
          sourceKey: "parker-2022-catalogue",
          scopeKey: "vector-xl-excluded",
          locator: "official separate Vector XL family boundary",
        },
      ],
    },
    media: [
      {
        key: "vector-factual-diagram-primary",
        title: "经典 Parker Vector 文字时间线示意图（非产品照片）",
        sourceKey: "parker-vector-diagram",
        localPath:
          "/images/library/site-original/parker-p0/parker-vector-factual-diagram.svg",
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "Fountain Pen Graph 本站原创 factual SVG/editorial diagram。示意图，非产品照片；未复制或临摹广告、目录或产品照，不表现真实笔夹、颜色、长度、比例或制造批次。",
        sourceUrl:
          "/images/library/site-original/parker-p0/parker-vector-factual-diagram.svg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "vector-fp1-1984",
        title: "FP-1 加入 RB-1 路线",
        eventType: "model_released",
        startDate: "1984-02",
        circa: false,
        description: "这是经典 Vector 钢笔前身节点，不是 Vector XL。",
        sourceKey: "parker-vector-penography",
      },
      {
        key: "vector-name-1984",
        title: "FP-1 开始使用 Vector 名称",
        eventType: "design_milestone",
        startDate: "1984-03",
        circa: false,
        description:
          "名称在 1984 年开始使用；后续结构和产品线仍继续调整。",
        sourceKey: "parker-vector-penography",
      },
    ],
  },
  {
    key: "phase30-parker-vector-xl-v1",
    entityId: PHASE30_VECTOR_XL_ID,
    expectedType: "pen",
    expectedSlug: "parker-vector-xl-fountain-pen",
    canonicalName: "Parker Vector XL",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/parker-vector-xl-publishable-content-2026-07-19.md",
    storyTitle: "Parker Vector XL：2159746 与经典 Vector 怎么分",
    primarySourceKey: "parker-2022-catalogue",
    depthTier: "A",
    aliases: [
      {
        alias: "Parker Vector XL Fountain Pen",
        language: "en",
        sourceKey: "parker-vector-xl-pdp",
      },
      {
        alias: "派克 Vector XL 钢笔",
        language: "zh",
        sourceKey: "parker-vector-xl-pdp",
      },
    ],
    sources: [
      source("parker-2022-catalogue"),
      source("parker-vector-xl-pdp"),
      source("parker-vector-xl-2159746-penheaven"),
      source("parker-vector-penography"),
      source("parker-care-guide"),
      source("parker-vector-xl-diagram"),
    ],
    variants: [
      {
        key: "teal-2159746",
        name: "Teal 2159746",
        notes:
          "M 不锈钢尖；闭合 135 mm、插帽 157 mm、最大径 11.5 mm、20 g；converter compatible but sold separately。",
        sourceKey: "parker-vector-xl-2159746-penheaven",
        variantKind: "market_sku",
        productCode: "2159746",
        market: "EMEA / UK retailer snapshot",
      },
    ],
    scopes: [
      {
        key: "vector-xl-current",
        scopeKey: "parker-vector-xl-documented-2022-present",
        validFrom: "2022",
        productionState: "current",
        nibScope: "large stainless-steel nib; size depends on SKU",
        editionScope:
          "Vector XL family documented in the official 2022 catalogue; exact global launch date unverified",
      },
      {
        key: "vector-xl-2159746",
        scopeKey: "parker-vector-xl-teal-2159746",
        variantKey: "teal-2159746",
        validFrom: "2022",
        productionState: "current",
        nibScope: "M stainless-steel nib",
        materialScope: "Teal / chrome-trim SKU",
        editionScope: "SKU 2159746 measurements and included-accessory scope only",
      },
      {
        key: "vector-classic-excluded",
        scopeKey: "parker-vector-classic-excluded-from-xl",
        validFrom: "1984",
        productionState: "historical",
        editionScope: "classic slim Vector/FP-1 lineage; separate model identity",
      },
    ],
    claims: [
      {
        key: "vector-xl-separate-identity",
        predicate: "model_identity",
        objectText:
          "Vector XL 是 Parker 单列的大直径、大型不锈钢尖家族，与 1984 FP-1 演变的经典 slim Vector 分开。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "parker-2022-catalogue",
        locator: "official Vector XL collection and independent classic lineage",
        evidence: [
          {
            key: "vector-xl-official-identity",
            sourceKey: "parker-vector-xl-pdp",
            scopeKey: "vector-xl-current",
            locator: "Vector XL title, larger-diameter positioning and large steel nib",
          },
          {
            key: "vector-classic-secondary-boundary",
            sourceKey: "parker-vector-penography",
            scopeKey: "vector-classic-excluded",
            locator: "classic Vector lineage from 1984 FP-1",
          },
        ],
      },
      {
        key: "vector-xl-2159746-spec",
        predicate: "market_sku_specification",
        objectText:
          "Teal 2159746 为 M 不锈钢尖，闭合 135 mm、插帽 157 mm、最大径 11.5 mm、20 g，兼容 converter 但需另购。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "parker-vector-xl-2159746-penheaven",
        locator: "exact SKU and Key Features",
        evidence: [
          {
            key: "vector-xl-2159746-secondary-spec",
            sourceKey: "parker-vector-xl-2159746-penheaven",
            scopeKey: "vector-xl-2159746",
            locator:
              "SKU 2159746; M steel nib; L135/L157/D11.5; 20g; converter sold separately",
          },
          {
            key: "vector-xl-2159746-official-code",
            sourceKey: "parker-2022-catalogue",
            scopeKey: "vector-xl-2159746",
            locator: "2159746 Vector XL Teal Fountain Pen Medium nib",
          },
        ],
      },
      {
        key: "vector-xl-date-boundary",
        predicate: "release_window",
        objectText:
          "Parker 2022 官方目录已单列 Vector XL；现有证据不足以核实精确全球首发日。",
        factClass: "core",
        confidence: 0.84,
        sourceKey: "parker-2022-catalogue",
        locator: "2022 catalogue provides a hard latest boundary",
        evidence: [
          {
            key: "vector-xl-2022-catalogue-boundary",
            sourceKey: "parker-2022-catalogue",
            scopeKey: "vector-xl-current",
            locator: "Vector XL and 2159746 present in 2022 official catalogue",
          },
        ],
      },
      {
        key: "vector-xl-media-boundary",
        predicate: "media_identity_boundary",
        objectText:
          "主图是本站原创 2159746 规格卡 SVG；示意图，非产品照片。",
        factClass: "editorial",
        confidence: 1,
        sourceKey: "parker-vector-xl-diagram",
        locator: "site-original SVG provenance",
        evidence: [
          {
            key: "vector-xl-diagram-not-photo",
            sourceKey: "parker-vector-xl-diagram",
            scopeKey: "vector-xl-current",
            locator: "product-photo=false; product-likeness=false",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: PHASE30_PARKER_ID,
      values: {
        series_name: "Parker Vector XL",
        release_year:
          "documented in Parker's 2022 catalogue; exact global launch date unverified",
        nib: "大型不锈钢尖；Teal 2159746 为 M",
        fill_system:
          "Parker 墨囊；2159746 兼容 converter，但需另购",
        material: "依 SKU；2159746 为 Teal CT 版本",
        dimensions:
          "Teal 2159746：闭合 135 mm、插帽 157 mm、最大径 11.5 mm",
        weight: "Teal 2159746：20 g",
        status: "Parker 现行 Vector XL；与经典 slim Vector 分开",
      },
      evidence: [
        {
          key: "vector-xl-brand",
          fieldKey: "brand_entity_id",
          sourceKey: "parker-2022-catalogue",
          scopeKey: "vector-xl-current",
          locator: "official Parker Vector XL catalogue",
        },
        {
          key: "vector-xl-series",
          fieldKey: "series_name",
          sourceKey: "parker-vector-xl-pdp",
          scopeKey: "vector-xl-current",
          locator: "Vector XL Fountain Pen title",
        },
        {
          key: "vector-xl-year",
          fieldKey: "release_year",
          sourceKey: "parker-2022-catalogue",
          scopeKey: "vector-xl-current",
          locator:
            "Vector XL is separately listed in the 2022 official catalogue; not a global launch-date assertion",
        },
        {
          key: "vector-xl-nib",
          fieldKey: "nib",
          sourceKey: "parker-vector-xl-2159746-penheaven",
          scopeKey: "vector-xl-2159746",
          locator: "SKU 2159746 stainless-steel medium nib",
        },
        {
          key: "vector-xl-fill",
          fieldKey: "fill_system",
          sourceKey: "parker-vector-xl-2159746-penheaven",
          scopeKey: "vector-xl-2159746",
          locator: "converter for bottled ink sold separately",
        },
        {
          key: "vector-xl-material",
          fieldKey: "material",
          sourceKey: "parker-2022-catalogue",
          scopeKey: "vector-xl-2159746",
          locator: "2159746 Teal identity",
        },
        {
          key: "vector-xl-dimensions",
          fieldKey: "dimensions",
          sourceKey: "parker-vector-xl-2159746-penheaven",
          scopeKey: "vector-xl-2159746",
          locator: "closed L135 x D11.5; posted L157 x D11.5",
        },
        {
          key: "vector-xl-weight",
          fieldKey: "weight",
          sourceKey: "parker-vector-xl-2159746-penheaven",
          scopeKey: "vector-xl-2159746",
          locator: "Weight 20g",
        },
        {
          key: "vector-xl-status",
          fieldKey: "status",
          sourceKey: "parker-vector-xl-pdp",
          scopeKey: "vector-xl-current",
          locator: "live current Parker Vector XL PDP retrieved 2026-07-19",
        },
      ],
    },
    media: [
      {
        key: "vector-xl-factual-diagram-primary",
        title: "Parker Vector XL 2159746 规格示意图（非产品照片）",
        sourceKey: "parker-vector-xl-diagram",
        localPath:
          "/images/library/site-original/parker-p0/parker-vector-xl-factual-diagram.svg",
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "Fountain Pen Graph 本站原创 factual SVG/editorial diagram。示意图，非产品照片；未复制或临摹 Parker 产品照，不表现真实 Teal 色差、笔夹、刻字、比例或批次，不能作为鉴定证据。",
        sourceUrl:
          "/images/library/site-original/parker-p0/parker-vector-xl-factual-diagram.svg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "vector-xl-catalogue-window",
        title: "Vector XL 已由 2022 官方目录单列",
        eventType: "design_milestone",
        startDate: "2022",
        circa: false,
        description:
          "这是可核验的官方目录节点，不把目录年份伪装成精确全球首发日。",
        sourceKey: "parker-2022-catalogue",
      },
    ],
  },
  {
    key: "phase30-parker-urban-v1",
    entityId: PHASE30_URBAN_ID,
    expectedType: "pen",
    expectedSlug: "parker-urban-fountain-pen",
    canonicalName: "Parker Urban Fountain Pen（现行款）",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/parker-urban-publishable-content-2026-07-19.md",
    storyTitle: "Parker Urban：post-2016 现行款与 1931593 怎么认",
    primarySourceKey: "parker-urban-1931593-pdp",
    depthTier: "A",
    aliases: [
      {
        alias: "Parker Urban Fountain Pen",
        language: "en",
        sourceKey: "parker-urban-1931593-pdp",
      },
      {
        alias: "派克 Urban 钢笔",
        language: "zh",
        sourceKey: "parker-urban-1931593-pdp",
      },
    ],
    sources: [
      source("parker-urban-1931593-pdp"),
      source("parker-urban-gentleman-stationer"),
      source("parker-care-guide"),
      source("parker-urban-diagram"),
    ],
    variants: [
      {
        key: "muted-black-gt-1931593",
        name: "Muted Black GT 1931593",
        notes:
          "F 不锈钢尖、Muted Black GT、漆面黄铜笔帽；使用 QUINK 墨囊或 converter。",
        sourceKey: "parker-urban-1931593-pdp",
        variantKind: "market_sku",
        productCode: "1931593",
        market: "current Parker PDP",
      },
    ],
    scopes: [
      {
        key: "urban-current",
        scopeKey: "parker-urban-post-2016-current",
        validFrom: "2016-12",
        productionState: "current",
        nibScope: "post-redesign open stainless-steel fountain-pen nib",
        editionScope: "post-2016 current Urban; excludes pre-2016 and 5TH",
      },
      {
        key: "urban-1931593",
        scopeKey: "parker-urban-muted-black-gt-1931593",
        variantKey: "muted-black-gt-1931593",
        productionState: "current",
        nibScope: "F stainless-steel nib",
        materialScope: "Muted Black lacquer-on-brass cap; GT trim",
        editionScope: "SKU 1931593 only",
      },
      {
        key: "urban-review-sample",
        scopeKey: "parker-urban-independent-review-2017",
        validFrom: "2017-04-19",
        productionState: "unknown",
        editionScope:
          "single post-redesign Urban Premium review unit supplied by Massdrop; affiliate links disclosed",
      },
    ],
    claims: [
      {
        key: "urban-current-generation",
        predicate: "model_identity",
        objectText:
          "本页只写 2016 年末重设计后的现行 Urban Fountain Pen，与 pre-2016 Urban 和 Urban 5TH 分开。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: "parker-urban-1931593-pdp",
        locator: "current official PDP and independent redesign record",
        evidence: [
          {
            key: "urban-current-official",
            sourceKey: "parker-urban-1931593-pdp",
            scopeKey: "urban-current",
            locator: "current Urban Fountain Pen identity and open steel nib",
          },
          {
            key: "urban-redesign-secondary",
            sourceKey: "parker-urban-gentleman-stationer",
            scopeKey: "urban-review-sample",
            locator:
              "paragraphs 40-48: late-2016 redesign and new open nib; sample disclosure",
          },
        ],
      },
      {
        key: "urban-1931593-spec",
        predicate: "market_sku_specification",
        objectText:
          "Muted Black GT 1931593 为 F 不锈钢尖、漆面黄铜笔帽，使用 Parker QUINK 墨囊或 converter。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "parker-urban-1931593-pdp",
        locator: "official description and Specifications",
        evidence: [
          {
            key: "urban-1931593-official-spec",
            sourceKey: "parker-urban-1931593-pdp",
            scopeKey: "urban-1931593",
            locator:
              "Item #1931593; Fine; Stainless steel; Cap Material Lacquer on Brass; QUINK/converter description",
          },
        ],
      },
      {
        key: "urban-media-boundary",
        predicate: "media_identity_boundary",
        objectText:
          "主图是本站原创 post-2016 代际 factual SVG；示意图，非产品照片。",
        factClass: "editorial",
        confidence: 1,
        sourceKey: "parker-urban-diagram",
        locator: "site-original SVG provenance",
        evidence: [
          {
            key: "urban-diagram-not-photo",
            sourceKey: "parker-urban-diagram",
            scopeKey: "urban-current",
            locator: "product-photo=false; product-likeness=false",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: PHASE30_PARKER_ID,
      values: {
        series_name: "Parker Urban Fountain Pen（post-2016 current generation）",
        release_year: "post-2016 redesign",
        nib: "不锈钢尖；Muted Black GT 1931593 为 F",
        fill_system: "Parker QUINK 墨囊／converter 两用",
        material:
          "依 SKU；1931593 为 Muted Black 漆面黄铜笔帽、GT 饰件",
        status: "Parker 官网当前 Urban Fountain Pen；排除 pre-2016 与 5TH",
      },
      evidence: [
        {
          key: "urban-brand",
          fieldKey: "brand_entity_id",
          sourceKey: "parker-urban-1931593-pdp",
          scopeKey: "urban-current",
          locator: "official Parker Urban PDP",
        },
        {
          key: "urban-series",
          fieldKey: "series_name",
          sourceKey: "parker-urban-1931593-pdp",
          scopeKey: "urban-current",
          locator: "Urban Fountain Pen title",
        },
        {
          key: "urban-year-boundary",
          fieldKey: "release_year",
          sourceKey: "parker-urban-gentleman-stationer",
          scopeKey: "urban-review-sample",
          locator: "late-2016 redesign statement",
        },
        {
          key: "urban-nib",
          fieldKey: "nib",
          sourceKey: "parker-urban-1931593-pdp",
          scopeKey: "urban-1931593",
          locator: "Item #1931593; Fine; Stainless steel",
        },
        {
          key: "urban-fill",
          fieldKey: "fill_system",
          sourceKey: "parker-urban-1931593-pdp",
          scopeKey: "urban-1931593",
          locator: "QUINK cartridges or convertible to bottle filling",
        },
        {
          key: "urban-material",
          fieldKey: "material",
          sourceKey: "parker-urban-1931593-pdp",
          scopeKey: "urban-1931593",
          locator: "Muted Black GT and Cap Material Lacquer on Brass",
        },
        {
          key: "urban-status",
          fieldKey: "status",
          sourceKey: "parker-urban-1931593-pdp",
          scopeKey: "urban-current",
          locator: "live current Parker PDP retrieved 2026-07-19",
        },
      ],
    },
    media: [
      {
        key: "urban-factual-diagram-primary",
        title: "Parker Urban post-2016 代际与 1931593 证据示意图（非产品照片）",
        sourceKey: "parker-urban-diagram",
        localPath:
          "/images/library/site-original/parker-p0/parker-urban-factual-diagram.svg",
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "Fountain Pen Graph 本站原创 factual SVG/editorial diagram。示意图，非产品照片；未复制或临摹 Parker 产品照，不表现真实外形、颜色、笔夹、刻字、比例或批次。",
        sourceUrl:
          "/images/library/site-original/parker-p0/parker-urban-factual-diagram.svg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "urban-redesign-2016",
        title: "Urban 进入 post-2016 重设计代际",
        eventType: "design_milestone",
        startDate: "2016-12",
        circa: true,
        description:
          "独立评测记录 Parker 在 2016 年末重做产品线；这是代际边界，不声称每个 SKU 同日上市。",
        sourceKey: "parker-urban-gentleman-stationer",
      },
    ],
  },
];
