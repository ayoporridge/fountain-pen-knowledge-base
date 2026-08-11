import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE446_BRAND_IDS,
  phase446SheafferSchonNahvalurBrandPacks,
} from "./phase446-sheaffer-schon-nahvalur-brand-depth";

export const PHASE596_NAHVALUR_BRAND_ID = PHASE446_BRAND_IDS.nahvalur;

export const PHASE596_IDS = {
  original: "phase596-nahvalur-original",
  horizon: "phase596-nahvalur-horizon",
  voyage: "phase596-nahvalur-voyage",
  eclipse: "phase596-nahvalur-eclipse",
} as const;

export const PHASE596_SLUGS = {
  original: "nahvalur-original",
  horizon: "nahvalur-horizon",
  voyage: "nahvalur-voyage",
  eclipse: "nahvalur-eclipse",
} as const;

const RETRIEVED = "2026-08-11";

function web(
  input: Omit<
    CuratedSource,
    "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
  > & { locator: string },
): CuratedSource {
  const { locator, ...source } = input;
  return {
    ...source,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: source.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}`,
  };
}

function official(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  publishedAt?: string;
  tier?: "primary" | "contemporary_archive";
}): CuratedSource {
  return web({
    ...input,
    registryKey: "nahvalur-official-phase596",
    registryName: "Nahvalur official",
    sourceType: "official",
    tier: input.tier ?? "primary",
    independenceGroup: "nahvalur-official",
    homepageUrl: "https://nahvalur.com/",
    itemType: "web_page",
    author: "Nahvalur",
  });
}

function secondary(input: {
  key: string;
  registryKey: string;
  registryName: string;
  independenceGroup: string;
  title: string;
  url: string;
  homepageUrl: string;
  author: string;
  summary: string;
  locator: string;
  publishedAt?: string;
  sourceType?: "blog" | "retailer";
}): CuratedSource {
  return web({
    ...input,
    sourceType: input.sourceType ?? "blog",
    tier: "professional_secondary",
    itemType: "web_page",
  });
}

function editorial(
  key: keyof typeof PHASE596_IDS,
  title: string,
): CuratedSource {
  const localPath = `/images/library/site-original/phase596/nahvalur/nahvalur-${key}.svg`;
  return {
    key: `phase596-nahvalur-${key}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase596-nahvalur-${key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase596-nahvalur-${key}`,
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创事实示意图，非产品照片；不复刻品牌标志、商品照片、真实笔形、颜色、树脂纹理、笔夹、笔尖、内部机构或比例。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
  note?: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies, note };
}

function claim(input: {
  key: string;
  predicate: string;
  objectText: string;
  source: CuratedSource;
  scopeKey: string;
  evidence?: Array<{
    key: string;
    source: CuratedSource;
    scopeKey: string;
    locator?: string;
    note?: string;
  }>;
  confidence?: number;
  editorial?: boolean;
}): CuratedClaim {
  return {
    key: input.key,
    predicate: input.predicate,
    objectText: input.objectText,
    factClass: input.editorial ? "editorial" : "core",
    confidence: input.confidence ?? 0.99,
    sourceKey: input.source.key,
    locator: input.source.summary,
    evidence: [
      {
        key: `${input.key}-primary-evidence`,
        sourceKey: input.source.key,
        scopeKey: input.scopeKey,
        locator: input.source.summary,
      },
      ...(input.evidence ?? []).map((item) => ({
        key: item.key,
        sourceKey: item.source.key,
        scopeKey: item.scopeKey,
        locator: item.locator ?? item.source.summary,
        note: item.note,
      })),
    ],
  };
}

function media(
  key: keyof typeof PHASE596_IDS,
  source: CuratedSource,
): CuratedEntityPack["media"] {
  return [
    {
      key: `phase596-nahvalur-${key}-primary`,
      title: `${source.title}（非产品照片）`,
      sourceKey: source.key,
      localPath: source.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、材料纹理、光泽、外形、比例、商标、笔尖、笔夹、库存或内部机构。",
      sourceUrl: source.url,
      usageStatus: "primary",
    },
  ];
}

const S = {
  series: official({
    key: "phase596-nahvalur-fountain-pen-series",
    title: "Nahvalur Fountain Pen collections",
    url: "https://nahvalur.com/pages/nahvalur-fountain-pen",
    summary:
      "官方系列入口把 Original、Original Plus、Schuylkill、Nautilus、Horizon、Voyage 与 Eclipse 放在不同产品路线；集合名称不等于颜色或单一 SKU。",
    locator:
      "fountain-pen collection navigation and family descriptions; models remain separated by official family identity and filling construction",
  }),
  care: official({
    key: "phase596-nahvalur-care-repair",
    title: "Nahvalur Product Care & Repair",
    url: "https://nahvalur.com/pages/product-care-repair",
    summary:
      "官方护理与维修入口用于限定活塞、真空和伸缩机构的深拆边界；异常阻力、密封或内部机构问题应交由品牌处理。",
    locator:
      "official product care and repair route; used for service boundary rather than undocumented disassembly instructions",
  }),
  originalProduct: official({
    key: "phase596-nahvalur-original-black-product",
    title: "Nahvalur Original Black Fountain Pen",
    url: "https://nahvalur.com/products/original-black-fountain-pen",
    summary:
      "当前 exact page 确认 polished black resin、银色件、No.6 不锈钢尖、内部活塞、仅瓶装墨水、146.5／133／176 mm、13.5 mm 笔杆、10–11 mm 握段、19.8 g 与六个尖幅。",
    locator:
      "product title and specification table; resin, silver trim, No.6 stainless nib, piston, bottled ink only, capped/uncapped/posted dimensions, diameters and 19.8 g",
  }),
  originalData: official({
    key: "phase596-nahvalur-original-black-shopify-data",
    title: "Nahvalur Original Black Shopify product data",
    url: "https://nahvalur.com/products/original-black-fountain-pen.js",
    summary:
      "2026-08-11 JSON 将 `01010050/51/52/53/54/57` 分别绑定 EF/F/M/B/Stub/Double Broad，六项均 available 且价格为 USD 62.50。",
    locator:
      "variants array: six complete SKU codes, titles, available=true and price=6250; availability is retrieval-date evidence only",
  }),
  originalReview: secondary({
    key: "phase596-gentleman-stationer-narwhal-original",
    registryKey: "gentleman-stationer-phase596-nahvalur-original",
    registryName: "The Gentleman Stationer",
    independenceGroup: "the-gentleman-stationer",
    title: "Narwhal Pens: Continuing the Entry-Level Piston Filler Wars",
    url: "https://www.gentlemanstationer.com/blog/2021/6/30/narwhal-pens-continuing-the-entry-level-piston-filler-wars",
    homepageUrl: "https://www.gentlemanstationer.com/",
    author: "The Gentleman Stationer",
    publishedAt: "2021-06-30",
    summary:
      "文章记录 2019 D.C. Pen Show 公开起点、Poseidon Blue 等早期四色、活塞样笔、浅后插观察，并在 2022 更新中说明 Narwhal 改名 Nahvalur 与 Original Plus 真空结构。",
    locator:
      "2019 show context, four launch acrylic names, piston sample, shallow posting observation, August 2022 brand-name and Original Plus update",
  }),
  originalPlusReview: secondary({
    key: "phase596-pen-addict-original-plus-boundary",
    registryKey: "pen-addict-phase596-nahvalur-original",
    registryName: "The Pen Addict",
    independenceGroup: "the-pen-addict",
    title: "Nahvalur Original Plus Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2023/2/26/nahvalur-original-plus-fountain-pen-review",
    homepageUrl: "https://www.penaddict.com/",
    author: "The Pen Addict",
    publishedAt: "2023-02-26",
    summary:
      "评测把 2019 Original 的 piston 与 Original Plus 的 vacuum filling 清楚分开；只用于 sibling 机构边界，不把 Plus 样笔规格回填 Original。",
    locator:
      "Original 2019 piston-filler history contrasted with Original Plus vacuum-filling construction",
  }),
  horizonCollection: official({
    key: "phase596-nahvalur-horizon-collection",
    title: "Nahvalur Horizon collection",
    url: "https://nahvalur.com/collections/nahvalur-horizon",
    summary:
      "官方集合说明 Horizon 使用独立手工树脂、波浪形金属环与 signature ink window；2026-08-11 列出 Pride 2026、Pearl、Nebula、Soleil。",
    locator:
      "collection prose describes unique handcrafted resin, horizon phenomena, curved ocean-wave ring and signature ink window; current collection cards list four editions",
  }),
  horizonGaia: official({
    key: "phase596-nahvalur-horizon-gaia",
    title: "Nahvalur Horizon Gaia Fountain Pen",
    url: "https://nahvalur.com/products/horizon-gaia-fountain-pen",
    summary:
      "Gaia 档案写 Starry Night Resins 珠光 acrylic、透明墨窗、活塞、自制钢尖与约 153／137／168 mm；其 exact JSON 已不再提供当前商品数据。",
    locator:
      "archived product body and specifications: Starry Night Resins, transparent ink window, piston, in-house steel nib and capped/uncapped/posted lengths",
    tier: "contemporary_archive",
  }),
  horizonSoleil: official({
    key: "phase596-nahvalur-horizon-soleil",
    title: "Nahvalur Horizon Soleil Fountain Pen",
    url: "https://nahvalur.com/products/horizon-soleil-fountain-pen",
    summary:
      "Soleil 当前 exact page 是 Horizon 当前规格与 selector 锚点；颜色、库存和尖幅只绑定该 edition 与检索日。",
    locator:
      "current Horizon Soleil exact product identity and selector; no family-wide stock duration inferred",
  }),
  horizonData: official({
    key: "phase596-nahvalur-horizon-shopify-data",
    title: "Nahvalur Horizon Shopify collection data",
    url: "https://nahvalur.com/collections/nahvalur-horizon/products.json?limit=250",
    summary:
      "2026-08-11 JSON 中 Soleil F/M/B/Stub/Double Broad 五项 available，Soleil EF 与 Pride 2026、Pearl、Nebula 各六项共十九个完整代码 unavailable。",
    locator:
      "products and variants arrays: Soleil 07120111/12/13/14/17 available; 07120110 plus six codes each for Pride 2026, Pearl and Nebula available=false",
  }),
  horizonSbre: secondary({
    key: "phase596-sbrebrown-horizon-review",
    registryKey: "sbrebrown-phase596-nahvalur-horizon",
    registryName: "SBREBrown",
    independenceGroup: "sbrebrown",
    title: "Nahvalur Horizon Fountain Pen Review",
    url: "https://www.sbrebrown.com/2023/06/nahvalur-horizon-fountain-pen-review/",
    homepageUrl: "https://www.sbrebrown.com/",
    author: "SBREBrown",
    publishedAt: "2023-06-01",
    summary:
      "品牌提供的 Broad 样笔测得约 152.4／135.3／167.8 mm、握段 11.2–12.7 mm、笔杆 13.6 mm、总重 37.5 g；只作为单支样笔范围。",
    locator:
      "brand-provided review sample; measurement graphic and review tags report capped/uncapped/posted lengths, section/barrel diameters, total/body/cap weights, Broad and piston",
  }),
  horizonPenAddict: secondary({
    key: "phase596-pen-addict-horizon-twilight",
    registryKey: "pen-addict-phase596-nahvalur-horizon",
    registryName: "The Pen Addict",
    independenceGroup: "the-pen-addict",
    title: "Nahvalur Horizon Twilight Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2024/2/7/nahvalur-horizon-twilight-fountain-pen-review",
    homepageUrl: "https://www.penaddict.com/",
    author: "The Pen Addict",
    publishedAt: "2024-02-07",
    summary:
      "Twilight 样笔评测记录珠光材料、传统墨窗、活塞、前端帽螺纹、No.6 Stub 样笔和后插后平衡变化；产品由零售商折扣提供。",
    locator:
      "discounted Twilight review sample; pearlescent material, traditional ink window, piston, cap threads near nib, No.6 Stub and reviewer posting-balance observation",
  }),
  voyageHawaii: official({
    key: "phase596-nahvalur-voyage-hawaii",
    title: "Nahvalur Voyage Hawaii Fountain Pen",
    url: "https://nahvalur.com/products/voyage-hawaii-fountain-pen",
    summary:
      "当前 exact page 确认主题树脂、镀金件、镀金自制 No.6 钢尖、活塞、仅瓶装墨水、149／133 mm、13 mm 笔杆、10–11.5 mm 握段、36.85 g 且不可后插。",
    locator:
      "product identity, resin and gold-plated appointments, in-house No.6 steel nib, piston, bottled ink only, capped/uncapped dimensions, diameters, 36.85 g and cannot be posted",
  }),
  voyageData: official({
    key: "phase596-nahvalur-voyage-hawaii-shopify-data",
    title: "Nahvalur Voyage Hawaii Shopify product data",
    url: "https://nahvalur.com/products/voyage-hawaii-fountain-pen.js",
    summary:
      "2026-08-11 JSON 中 `03060391/92/93/94/97` 的 F/M/B/Stub/Double Broad available，EF `03060390` unavailable，价格均为 USD 180。",
    locator:
      "variants array: five available complete SKU codes, one Extra Fine code available=false, all price=18000; retrieval-date evidence only",
  }),
  voyagePride: official({
    key: "phase596-nahvalur-voyage-pride-2024",
    title: "Nahvalur Pride 2024 announcement",
    url: "https://nahvalur.com/blogs/news/nahvalur-continues-its-collaboration-with-it-gets-better-launches-new-pride-pens-for-2024",
    publishedAt: "2024-06-01",
    summary:
      "官方公告记录 Voyage Pride 2024 限量 628 支并延续 It Gets Better Project 合作；数量和公益关系只属于该 edition。",
    locator:
      "2024 announcement names Voyage Pride, 628-piece limit and continuing It Gets Better Project collaboration",
    tier: "contemporary_archive",
  }),
  voyagePenquisition: secondary({
    key: "phase596-penquisition-voyage-nashville",
    registryKey: "penquisition-phase596-nahvalur-voyage",
    registryName: "Penquisition",
    independenceGroup: "penquisition",
    title: "Nahvalur Does Nashville",
    url: "https://penquisition.com/blog/2023/11/26/nahavlur-narwhal-does-nashville",
    homepageUrl: "https://penquisition.com/",
    author: "Penquisition",
    publishedAt: "2023-11-26",
    summary:
      "Nashville 合作样本文章指出营销资料有时写 Nautilus，但包装写 Voyage；传统连续墨窗、不可后插与定制 DiamondCast 支持 Voyage edition 身份。",
    locator:
      "Hatch collaboration review: marketing called it Nautilus, box said Voyage; traditional ink window contrasted with Nautilus portholes; sample cannot post and uses custom DiamondCast",
  }),
  voyageNautilusReview: secondary({
    key: "phase596-pen-addict-nautilus-sibling",
    registryKey: "pen-addict-phase596-nahvalur-voyage",
    registryName: "The Pen Addict",
    independenceGroup: "the-pen-addict",
    title: "Nahvalur Nautilus Brilliant Bunny Review",
    url: "https://www.penaddict.com/blog/2023/8/17/nahvalur-nautilus-enigma-stationery-brilliant-bunny",
    homepageUrl: "https://www.penaddict.com/",
    author: "The Pen Addict",
    publishedAt: "2023-08-17",
    summary:
      "Nautilus 样笔评测只用于三枚圆形舷窗与 Voyage 传统墨窗的 sibling 识别，不把 Nautilus 样笔规格写入 Voyage。",
    locator:
      "Nautilus review and comparison context; porthole-window identity used only as sibling boundary",
  }),
  eclipseDesign: official({
    key: "phase596-nahvalur-eclipse-design",
    title: "Nahvalur Eclipse design page",
    url: "https://nahvalur.com/pages/nahvalur-eclipse",
    summary:
      "官方称 Eclipse 是品牌第一支 capless、历时两年设计；精密加工铝杆为十二切面，推动整个笔身伸缩，可拆笔夹，converter 供墨，自制钢尖，首发 F/M。",
    locator:
      "first capless pen, two-year development, machined aluminium, whole-body push mechanism, twelve facets, removable clip, converter, in-house steel nib and Fine/Medium launch options",
  }),
  eclipseBlack: official({
    key: "phase596-nahvalur-eclipse-black-silver",
    title: "Nahvalur Eclipse Black Silver Fountain Pen",
    url: "https://nahvalur.com/products/eclipse-black-silver-fountain-pen",
    summary:
      "Black Silver exact page 确认 aluminum、银色件、自制钢尖、converter、150 mm 收回、148 mm 伸出、Ø13.91 mm、无墨 34 g 与一年保修。",
    locator:
      "product specifications: aluminium, silver trim, in-house steel nib, converter, 150/148 mm, barrel diameter 13.91 mm, 34 g and one-year warranty",
  }),
  eclipseBlackData: official({
    key: "phase596-nahvalur-eclipse-black-silver-shopify-data",
    title: "Nahvalur Eclipse Black Silver Shopify product data",
    url: "https://nahvalur.com/products/eclipse-black-silver-fountain-pen.js",
    summary:
      "2026-08-11 JSON 中 Fine `09110061` 与 Medium `09110062` 均 available，价格 USD 99。",
    locator:
      "variants array: 09110061 Fine and 09110062 Medium, available=true and price=9900",
  }),
  eclipseCobalt: official({
    key: "phase596-nahvalur-eclipse-cobalt-black",
    title: "Nahvalur Eclipse Cobalt Black Fountain Pen",
    url: "https://nahvalur.com/products/nahvalur-eclipse-cobalt-black-fountain-pen",
    summary:
      "Cobalt Black 页明确写 newly engineered feed system 与 upgraded back-cap fastening，并将其与 Hepatizon 作为后续颜色；这是版本演进而非第二基础型号。",
    locator:
      "current product body explicitly states newly engineered feed system for flow and upgraded back-cap fastening for durability; Cobalt and Hepatizon presented as new colours",
  }),
  eclipseCobaltData: official({
    key: "phase596-nahvalur-eclipse-cobalt-black-shopify-data",
    title: "Nahvalur Eclipse Cobalt Black Shopify product data",
    url: "https://nahvalur.com/products/nahvalur-eclipse-cobalt-black-fountain-pen.js",
    summary:
      "2026-08-11 JSON 中 Fine `09110121`、Medium `09110122`、Broad `09110123` 均 available，价格 USD 99。",
    locator:
      "variants array: 09110121 Fine, 09110122 Medium and 09110123 Broad, available=true and price=9900",
  }),
  eclipsePenAddict: secondary({
    key: "phase596-pen-addict-eclipse-review",
    registryKey: "pen-addict-phase596-nahvalur-eclipse",
    registryName: "The Pen Addict",
    independenceGroup: "the-pen-addict",
    title: "Nahvalur Eclipse Retractable Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2025/10/27/nahvalur-eclipse-retractable-fountain-pen-review",
    homepageUrl: "https://www.penaddict.com/",
    author: "The Pen Addict",
    publishedAt: "2025-10-27",
    summary:
      "品牌提供的后续 Fine 样笔文章记录后部拆开、取出 nib unit 与 converter 上墨；作者未使用首发版，只转述首发重装报告，自己的样笔无相同问题。",
    locator:
      "brand-provided later Fine sample; rear unthreads, nib/converter unit removed for filling; reviewer did not use launch version and only reports others' reassembly complaints",
  }),
  eclipsePenquisition: secondary({
    key: "phase596-penquisition-eclipse-cobalt",
    registryKey: "penquisition-phase596-nahvalur-eclipse",
    registryName: "Penquisition",
    independenceGroup: "penquisition",
    title: "Nahvalur Eclipse in Cobalt with Rose Gold Trim",
    url: "https://penquisition.com/blog/2025/9/3/nahvalur-eclipse-in-cobalt-with-rose-gold-trim",
    homepageUrl: "https://penquisition.com/",
    author: "Penquisition",
    publishedAt: "2025-09-03",
    summary:
      "品牌提供样笔的专业文章把 Cobalt 理解为首发约一年后的 updated Eclipse，补充新版 feed／end-cap 与具体样笔范围。",
    locator:
      "brand-provided Cobalt review sample; original late-2024 introduction and roughly one-year-later update with revised feed and end cap",
  }),
  originalDiagram: editorial(
    "original",
    "Nahvalur Original 活塞结构、历史与当前 Black SKU 事实图",
  ),
  horizonDiagram: editorial(
    "horizon",
    "Nahvalur Horizon 产品线、传统墨窗与当前库存事实图",
  ),
  voyageDiagram: editorial(
    "voyage",
    "Nahvalur Voyage Hawaii 身份、活塞与不可后插事实图",
  ),
  eclipseDiagram: editorial(
    "eclipse",
    "Nahvalur Eclipse 整杆按压机构与版本演进事实图",
  ),
};

export const PHASE596_ORIGINAL_CURRENT_SKUS = [
  ["ef", "Extra Fine", "01010050"],
  ["f", "Fine", "01010051"],
  ["m", "Medium", "01010052"],
  ["b", "Broad", "01010053"],
  ["stub", "Stub", "01010054"],
  ["double-broad", "Double Broad", "01010057"],
] as const;

export const PHASE596_HORIZON_CURRENT_SKUS = [
  ["f", "Fine", "07120111"],
  ["m", "Medium", "07120112"],
  ["b", "Broad", "07120113"],
  ["stub", "Stub", "07120114"],
  ["double-broad", "Double Broad", "07120117"],
] as const;

export const PHASE596_HORIZON_UNAVAILABLE_CODES = [
  "07120110",
  "07120190",
  "07120191",
  "07120192",
  "07120193",
  "07120194",
  "07120197",
  "07120200",
  "07120201",
  "07120202",
  "07120203",
  "07120204",
  "07120207",
  "07120220",
  "07120221",
  "07120222",
  "07120223",
  "07120224",
  "07120227",
] as const;

export const PHASE596_VOYAGE_CURRENT_SKUS = [
  ["f", "Fine", "03060391"],
  ["m", "Medium", "03060392"],
  ["b", "Broad", "03060393"],
  ["stub", "Stub", "03060394"],
  ["double-broad", "Double Broad", "03060397"],
] as const;

export const PHASE596_VOYAGE_UNAVAILABLE_CODES = ["03060390"] as const;

export const PHASE596_ECLIPSE_BLACK_CURRENT_SKUS = [
  ["f", "Fine", "09110061"],
  ["m", "Medium", "09110062"],
] as const;

export const PHASE596_ECLIPSE_COBALT_CURRENT_SKUS = [
  ["f", "Fine", "09110121"],
  ["m", "Medium", "09110122"],
  ["b", "Broad", "09110123"],
] as const;

const originalCurrent = "phase596-nahvalur-original-black-current";
const originalEarly = "phase596-nahvalur-original-2019-early";
const originalPlusBoundary = "phase596-nahvalur-original-plus-boundary";
const originalBlackEdition = "phase596-nahvalur-original-black-edition";

export const phase596NahvalurOriginalPack: CuratedEntityPack = {
  key: "phase596-nahvalur-original-v1",
  entityId: PHASE596_IDS.original,
  expectedType: "pen",
  expectedSlug: PHASE596_SLUGS.original,
  canonicalName: "Nahvalur Original Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/nahvalur-original-phase596.md",
  storyTitle:
    "Nahvalur Original：2019 Narwhal 活塞起点、现行 Black 与六个 SKU",
  primarySourceKey: S.originalProduct.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Nahvalur Original",
      language: "en",
      sourceKey: S.originalProduct.key,
    },
    {
      alias: "Narwhal Original",
      language: "en",
      kind: "former_name",
      sourceKey: S.originalReview.key,
    },
    {
      alias: "Nahvalur Original Black",
      language: "en",
      sourceKey: S.originalProduct.key,
      market: "current Black edition",
    },
    {
      alias: "纳瓦尔 Original 活塞钢笔",
      language: "zh",
      sourceKey: S.originalProduct.key,
    },
  ],
  sources: [
    S.originalProduct,
    S.originalData,
    S.series,
    S.care,
    S.originalReview,
    S.originalPlusReview,
    S.originalDiagram,
  ],
  scopes: [
    {
      key: originalCurrent,
      scopeKey: originalCurrent,
      variantKey: originalBlackEdition,
      market: "current Nahvalur Original Black exact product",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "No.6 stainless steel; six retrieval-date available width/SKU combinations: EF, F, M, B, Stub and Double Broad.",
      materialScope:
        "Polished black resin with silver-coloured appointments; early swirled acrylic descriptions are not generalized to Black.",
      editionScope:
        "Current exact product anchor only; availability and USD 62.50 price are a 2026-08-11 snapshot.",
    },
    {
      key: originalEarly,
      scopeKey: originalEarly,
      market: "2019 Narwhal Original launch-era review scope",
      validFrom: "2019",
      validTo: "2022",
      productionState: "historical",
      nibScope:
        "The reviewed Medium sample does not establish every launch colour's width matrix or writing behaviour.",
      materialScope:
        "Poseidon Blue, Hippocampus Purple, Merman Green and Yellow Tang were launch-era swirled acrylic names.",
      editionScope:
        "Narwhal engraving and packaging are former-brand evidence, not a second canonical model.",
    },
    {
      key: originalPlusBoundary,
      scopeKey: originalPlusBoundary,
      market: "Original versus Original Plus sibling comparison",
      productionState: "current",
      nibScope:
        "Shared No.6 nib language does not merge the two models.",
      editionScope:
        "Original is an internal piston filler; Original Plus uses vacuum filling and remains a separate public sibling.",
    },
  ],
  claims: [
    claim({
      key: "phase596-nahvalur-original-identity",
      predicate: "model_identity",
      objectText:
        "Nahvalur Original Fountain Pen is the continuing identity of the 2019 Narwhal Original piston family; Narwhal is the former brand name and Black is a current edition, not a second base model.",
      source: S.originalProduct,
      scopeKey: originalCurrent,
      evidence: [
        {
          key: "phase596-original-identity-history-evidence",
          source: S.originalReview,
          scopeKey: originalEarly,
        },
        {
          key: "phase596-original-identity-series-evidence",
          source: S.series,
          scopeKey: originalCurrent,
        },
      ],
    }),
    claim({
      key: "phase596-nahvalur-original-current-configuration",
      predicate: "current_configuration",
      objectText:
        "Current Original Black is polished black resin with silver appointments, an in-house No.6 stainless-steel nib, internal piston and bottled-ink-only filling; official dimensions are 146.5/133/176 mm and weight is 19.8 g.",
      source: S.originalProduct,
      scopeKey: originalCurrent,
    }),
    claim({
      key: "phase596-nahvalur-original-current-skus",
      predicate: "variant_availability_boundary",
      objectText:
        "The 2026-08-11 product data exposes six available Original Black market SKUs, one each for EF, F, M, B, Stub and Double Broad; this matrix is not backfilled to the 2019 colours.",
      source: S.originalData,
      scopeKey: originalCurrent,
    }),
    claim({
      key: "phase596-nahvalur-original-plus-separation",
      predicate: "family_boundary",
      objectText:
        "Original and Original Plus are separate sibling nodes because their filling mechanisms differ: internal piston versus vacuum filling. Similar naming and shared No.6 nib language do not override that construction boundary.",
      source: S.originalPlusReview,
      scopeKey: originalPlusBoundary,
      evidence: [
        {
          key: "phase596-original-plus-official-family-evidence",
          source: S.series,
          scopeKey: originalPlusBoundary,
        },
      ],
    }),
    claim({
      key: "phase596-nahvalur-original-maintenance",
      predicate: "maintenance_boundary",
      objectText:
        "Routine cleaning uses cool water through the piston; the supplied wrench does not make frequent deep disassembly routine. Resistance, scraping or seal failure should stop operation and move to service.",
      source: S.care,
      scopeKey: originalCurrent,
      editorial: true,
    }),
  ],
  variants: [
    {
      key: originalBlackEdition,
      name: "Original Black",
      notes:
        "Current exact product anchor; six available market-SKU children are retrieval-date evidence.",
      sourceKey: S.originalProduct.key,
      variantKind: "edition_group",
      productCode: "Original Black",
      market: "global current",
    },
    ...PHASE596_ORIGINAL_CURRENT_SKUS.map(([suffix, name, productCode]) => ({
      key: `phase596-nahvalur-original-black-${suffix}-sku`,
      name: `Original Black ${name}`,
      notes:
        "Complete code is available in the 2026-08-11 Shopify product data; stock duration is not inferred.",
      sourceKey: S.originalData.key,
      variantKind: "market_sku" as const,
      parentVariantKey: originalBlackEdition,
      productCode,
      market: "current Original Black selector",
    })),
  ],
  spec: {
    brandEntityId: PHASE596_NAHVALUR_BRAND_ID,
    values: {
      series_name:
        "Nahvalur Original Fountain Pen; former Narwhal Original; Original Black is the current exact-product anchor",
      release_year:
        "2019 public debut around the D.C. Pen Show; precise day not asserted",
      nib:
        "Nahvalur No.6 stainless steel; current Original Black has six available EF/F/M/B/Stub/Double Broad SKU combinations",
      fill_system:
        "Internal piston, bottled ink only; not the Original Plus vacuum system",
      material:
        "Current Black: polished black resin and silver-coloured appointments; early four colours: swirled acrylic review scope",
      dimensions:
        "Current Original Black official: 146.5 mm capped, 133 mm uncapped, 176 mm posted; barrel 13.5 mm, grip 10–11 mm",
      weight: "Current Original Black official total weight: 19.8 g",
      status:
        "Current exact page verified 2026-08-11 with six available SKU combinations; launch colours remain historical edition evidence",
    },
    evidence: [
      evidence(
        "brand_entity_id",
        "phase596-original-spec-brand",
        S.series.key,
        originalCurrent,
        "official collection places Original under Nahvalur",
      ),
      evidence(
        "series_name",
        "phase596-original-spec-series-current",
        S.originalProduct.key,
        originalCurrent,
        "exact product title Nahvalur Original Black Fountain Pen",
      ),
      evidence(
        "series_name",
        "phase596-original-spec-series-former-name",
        S.originalReview.key,
        originalEarly,
        "2019 Narwhal Original and 2022 Nahvalur rename update",
      ),
      evidence(
        "release_year",
        "phase596-original-spec-release",
        S.originalReview.key,
        originalEarly,
        "2019 D.C. Pen Show public-debut context; exact day not fixed",
      ),
      evidence(
        "nib",
        "phase596-original-spec-nib",
        S.originalProduct.key,
        originalCurrent,
        "No.6 stainless-steel nib and six width selector",
      ),
      evidence(
        "fill_system",
        "phase596-original-spec-fill",
        S.originalProduct.key,
        originalCurrent,
        "internal piston mechanism and bottled ink only",
      ),
      evidence(
        "fill_system",
        "phase596-original-spec-rejected-plus-fill",
        S.originalPlusReview.key,
        originalPlusBoundary,
        "Original Plus uses vacuum filling and cannot qualify as Original's fill system",
        false,
      ),
      evidence(
        "material",
        "phase596-original-spec-material-current",
        S.originalProduct.key,
        originalCurrent,
        "polished black resin and silver trim",
      ),
      evidence(
        "material",
        "phase596-original-spec-material-early",
        S.originalReview.key,
        originalEarly,
        "four launch-era swirled acrylic colour names",
      ),
      evidence(
        "dimensions",
        "phase596-original-spec-dimensions",
        S.originalProduct.key,
        originalCurrent,
        "146.5/133/176 mm plus 13.5 mm barrel and 10–11 mm grip",
      ),
      evidence(
        "weight",
        "phase596-original-spec-weight",
        S.originalProduct.key,
        originalCurrent,
        "official total weight 19.8 g",
      ),
      evidence(
        "status",
        "phase596-original-spec-status-current",
        S.originalData.key,
        originalCurrent,
        "six complete SKU codes available=true on 2026-08-11",
      ),
    ],
  },
  media: media("original", S.originalDiagram),
  timeline: [
    {
      key: "phase596-nahvalur-original-2019-debut",
      title: "Narwhal Original enters public review",
      eventType: "model_released",
      startDate: "2019",
      circa: true,
      description:
        "The 2019 D.C. Pen Show context is used as a public-debut anchor; no exact launch day is asserted.",
      sourceKey: S.originalReview.key,
    },
    {
      key: "phase596-nahvalur-original-rename",
      title: "Narwhal name transitions to Nahvalur",
      eventType: "design_milestone",
      startDate: "2022",
      circa: true,
      description:
        "Former-brand engraving and packaging remain alias/time-scope evidence, not a second model.",
      sourceKey: S.originalReview.key,
    },
    {
      key: "phase596-nahvalur-original-current-verified",
      title: "Original Black selector verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Retrieval date records the exact product and six available SKU combinations, not a launch date.",
      sourceKey: S.originalData.key,
    },
  ],
};

const horizonFamily = "phase596-nahvalur-horizon-family";
const horizonGaia = "phase596-nahvalur-horizon-gaia-archive";
const horizonSoleil = "phase596-nahvalur-horizon-soleil-current";
const horizonUnavailable = "phase596-nahvalur-horizon-unavailable";
const horizonReview = "phase596-nahvalur-horizon-review-samples";
const horizonGaiaEdition = "phase596-nahvalur-horizon-gaia-edition";
const horizonSoleilEdition = "phase596-nahvalur-horizon-soleil-edition";

export const phase596NahvalurHorizonPack: CuratedEntityPack = {
  key: "phase596-nahvalur-horizon-v1",
  entityId: PHASE596_IDS.horizon,
  expectedType: "pen",
  expectedSlug: PHASE596_SLUGS.horizon,
  canonicalName: "Nahvalur Horizon Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/nahvalur-horizon-phase596.md",
  storyTitle:
    "Nahvalur Horizon：珠光树脂、传统墨窗与 Soleil 五个当前 SKU",
  primarySourceKey: S.horizonCollection.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Nahvalur Horizon",
      language: "en",
      sourceKey: S.horizonCollection.key,
    },
    {
      alias: "Nahvalur Horizon Series",
      language: "en",
      sourceKey: S.horizonCollection.key,
    },
    {
      alias: "纳瓦尔 Horizon 活塞钢笔",
      language: "zh",
      sourceKey: S.horizonCollection.key,
    },
  ],
  sources: [
    S.horizonCollection,
    S.horizonGaia,
    S.horizonSoleil,
    S.horizonData,
    S.series,
    S.care,
    S.horizonSbre,
    S.horizonPenAddict,
    S.horizonDiagram,
  ],
  scopes: [
    {
      key: horizonFamily,
      scopeKey: horizonFamily,
      market: "Nahvalur Horizon canonical fountain-pen family",
      productionState: "current",
      nibScope:
        "In-house No.6 stainless steel; width availability remains edition/SKU scoped.",
      materialScope:
        "Edition-specific handcrafted pearlescent resin, wave-shaped trim ring and traditional ink window.",
      editionScope:
        "Gaia, Twilight, Soleil, Nebula, Pearl and Pride remain editions under one canonical Horizon model.",
    },
    {
      key: horizonGaia,
      scopeKey: horizonGaia,
      variantKey: horizonGaiaEdition,
      market: "Horizon Gaia archive edition",
      productionState: "historical",
      nibScope:
        "Official archive names an in-house steel nib; no current Gaia stock is inferred.",
      materialScope:
        "Pearlescent acrylic by Starry Night Resins with transparent ink window.",
      editionScope:
        "Official 153/137/168 mm values belong to Gaia; its exact Shopify data is no longer current.",
    },
    {
      key: horizonSoleil,
      scopeKey: horizonSoleil,
      variantKey: horizonSoleilEdition,
      market: "2026-08-11 Horizon Soleil selector",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Fine, Medium, Broad, Stub and Double Broad available; Extra Fine unavailable.",
      materialScope:
        "Soleil edition-specific resin; no colour fidelity is inferred from the diagram.",
      editionScope:
        "Five retrieval-date available market SKUs; stock duration is not inferred.",
    },
    {
      key: horizonUnavailable,
      scopeKey: horizonUnavailable,
      market: "complete Horizon codes unavailable on retrieval date",
      validFrom: RETRIEVED,
      productionState: "unknown",
      nibScope:
        "Soleil EF plus six widths each for Pride 2026, Pearl and Nebula are available=false.",
      editionScope:
        "Nineteen unavailable complete codes remain rejected status evidence and do not become current market-SKU children.",
    },
    {
      key: horizonReview,
      scopeKey: horizonReview,
      market: "SBREBrown and The Pen Addict review samples",
      validFrom: "2023",
      validTo: "2024",
      productionState: "historical",
      nibScope:
        "One Broad and one Stub sample do not define family-wide tuning or current width availability.",
      materialScope:
        "Sample measurements and posting balance stay sample scoped.",
    },
  ],
  claims: [
    claim({
      key: "phase596-nahvalur-horizon-identity",
      predicate: "model_identity",
      objectText:
        "Nahvalur Horizon is a canonical piston-filling family identified by handcrafted pearlescent resin, a wave-shaped trim ring and a traditional ink window; it is not a colour alias of the three-port ebonite Nautilus.",
      source: S.horizonCollection,
      scopeKey: horizonFamily,
      evidence: [
        {
          key: "phase596-horizon-identity-series-evidence",
          source: S.series,
          scopeKey: horizonFamily,
        },
      ],
    }),
    claim({
      key: "phase596-nahvalur-horizon-gaia-boundary",
      predicate: "edition_scope",
      objectText:
        "Gaia supplies archived Starry Night Resins and 153/137/168 mm edition evidence; those values do not make Gaia a second base model or prove current Gaia availability.",
      source: S.horizonGaia,
      scopeKey: horizonGaia,
    }),
    claim({
      key: "phase596-nahvalur-horizon-current-skus",
      predicate: "variant_availability_boundary",
      objectText:
        "On 2026-08-11, Horizon Soleil has five available market SKUs while Soleil EF and eighteen Pride/Pearl/Nebula codes are unavailable; only the five available combinations become current SKU children.",
      source: S.horizonData,
      scopeKey: horizonSoleil,
      evidence: [
        {
          key: "phase596-horizon-unavailable-claim-evidence",
          source: S.horizonData,
          scopeKey: horizonUnavailable,
          locator:
            "nineteen complete codes are available=false in the same retrieval-date collection data",
        },
      ],
    }),
    claim({
      key: "phase596-nahvalur-horizon-sample-boundary",
      predicate: "review_sample_boundary",
      objectText:
        "SBREBrown's 37.5 g Broad sample and The Pen Addict's Twilight Stub/posting observations remain named review samples and do not overwrite family-wide weight, nib tuning or posting advice.",
      source: S.horizonSbre,
      scopeKey: horizonReview,
      evidence: [
        {
          key: "phase596-horizon-twilight-sample-evidence",
          source: S.horizonPenAddict,
          scopeKey: horizonReview,
        },
      ],
    }),
    claim({
      key: "phase596-nahvalur-horizon-maintenance",
      predicate: "maintenance_boundary",
      objectText:
        "The piston and feed can be flushed with cool water; shimmer ink requires extra cycles. Handcrafted resin and the piston mechanism should not be exposed to alcohol, heat or forceful deep disassembly.",
      source: S.care,
      scopeKey: horizonFamily,
      editorial: true,
    }),
  ],
  variants: [
    {
      key: horizonGaiaEdition,
      name: "Horizon Gaia",
      notes:
        "Archive edition anchor for Starry Night Resins and official dimensions; no current SKU children.",
      sourceKey: S.horizonGaia.key,
      variantKind: "edition_group",
      productCode: "Horizon Gaia",
      market: "archive edition",
    },
    {
      key: horizonSoleilEdition,
      name: "Horizon Soleil",
      notes:
        "Current edition anchor with five retrieval-date available market-SKU children.",
      sourceKey: S.horizonSoleil.key,
      variantKind: "edition_group",
      productCode: "Horizon Soleil",
      market: "global current",
    },
    ...PHASE596_HORIZON_CURRENT_SKUS.map(([suffix, name, productCode]) => ({
      key: `phase596-nahvalur-horizon-soleil-${suffix}-sku`,
      name: `Horizon Soleil ${name}`,
      notes:
        "Complete code is available in the 2026-08-11 collection data; stock duration is not inferred.",
      sourceKey: S.horizonData.key,
      variantKind: "market_sku" as const,
      parentVariantKey: horizonSoleilEdition,
      productCode,
      market: "current Horizon Soleil selector",
    })),
  ],
  spec: {
    brandEntityId: PHASE596_NAHVALUR_BRAND_ID,
    values: {
      series_name:
        "Nahvalur Horizon Fountain Pen; Gaia, Twilight, Soleil, Nebula, Pearl and Pride are edition scopes",
      nib:
        "Nahvalur in-house No.6 stainless steel; current Soleil has five available F/M/B/Stub/Double Broad SKU combinations, with EF unavailable",
      fill_system: "Internal piston, bottled ink only, with a traditional ink window",
      material:
        "Edition-specific handcrafted pearlescent resin; Gaia archive specifies Starry Night Resins; wave-shaped trim ring",
      dimensions:
        "Gaia official edition: about 153 mm capped, 137 mm uncapped and 168 mm posted; review sample 152.4/135.3/167.8 mm remains noncanonical corroboration",
      weight:
        "No official family-wide weight published; SBREBrown's 37.5 g is one review sample and does not qualify as a universal value",
      status:
        "Current collection verified 2026-08-11: five Soleil SKU combinations available; nineteen complete Horizon codes unavailable",
    },
    evidence: [
      evidence(
        "brand_entity_id",
        "phase596-horizon-spec-brand",
        S.series.key,
        horizonFamily,
        "official series navigation separates Horizon under Nahvalur",
      ),
      evidence(
        "series_name",
        "phase596-horizon-spec-series",
        S.horizonCollection.key,
        horizonFamily,
        "Horizon collection identity and current edition cards",
      ),
      evidence(
        "nib",
        "phase596-horizon-spec-nib",
        S.horizonData.key,
        horizonSoleil,
        "five available Soleil widths and unavailable Extra Fine on retrieval date",
      ),
      evidence(
        "fill_system",
        "phase596-horizon-spec-fill",
        S.horizonGaia.key,
        horizonGaia,
        "official Gaia archive states piston and transparent ink window",
      ),
      evidence(
        "material",
        "phase596-horizon-spec-material-family",
        S.horizonCollection.key,
        horizonFamily,
        "handcrafted resin and curved ocean-wave ring",
      ),
      evidence(
        "material",
        "phase596-horizon-spec-material-gaia",
        S.horizonGaia.key,
        horizonGaia,
        "pearlescent acrylic by Starry Night Resins",
      ),
      evidence(
        "dimensions",
        "phase596-horizon-spec-dimensions-gaia",
        S.horizonGaia.key,
        horizonGaia,
        "official Gaia 153/137/168 mm values",
      ),
      evidence(
        "dimensions",
        "phase596-horizon-rejected-sample-dimensions",
        S.horizonSbre.key,
        horizonReview,
        "152.4/135.3/167.8 mm belong to one brand-provided review sample",
        false,
      ),
      evidence(
        "weight",
        "phase596-horizon-spec-weight-unpublished",
        S.horizonCollection.key,
        horizonFamily,
        "current official collection publishes no universal Horizon weight; no numeric family value asserted",
      ),
      evidence(
        "weight",
        "phase596-horizon-rejected-sample-weight",
        S.horizonSbre.key,
        horizonReview,
        "37.5 g total, 23.0 g body and 14.5 g cap belong to one review sample",
        false,
      ),
      evidence(
        "status",
        "phase596-horizon-spec-status-current",
        S.horizonData.key,
        horizonSoleil,
        "five complete Soleil codes available=true on 2026-08-11",
      ),
      evidence(
        "status",
        "phase596-horizon-rejected-unavailable-codes",
        S.horizonData.key,
        horizonUnavailable,
        "nineteen complete Horizon codes are available=false on 2026-08-11",
        false,
      ),
    ],
  },
  media: media("horizon", S.horizonDiagram),
  timeline: [
    {
      key: "phase596-nahvalur-horizon-2023-review",
      title: "Horizon review sample documented",
      eventType: "community_event",
      startDate: "2023-06-01",
      circa: true,
      description:
        "The review date documents one measured sample and is not treated as the model launch date.",
      sourceKey: S.horizonSbre.key,
    },
    {
      key: "phase596-nahvalur-horizon-current-verified",
      title: "Horizon collection and Soleil availability verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Retrieval date records four visible editions, five available Soleil SKUs and nineteen unavailable codes.",
      sourceKey: S.horizonData.key,
    },
  ],
  conflicts: [
    {
      key: "phase596-nahvalur-horizon-availability-conflict",
      fieldKey: "variant_availability",
      scopeKey: horizonFamily,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Only the five Soleil combinations marked available become current market SKUs. Nineteen complete but unavailable codes remain rejected retrieval-date evidence and do not prove stock.",
      members: [
        {
          citationKey: "phase596-horizon-spec-status-current",
          assertedValue: "five Soleil codes available=true",
        },
        {
          citationKey: "phase596-horizon-rejected-unavailable-codes",
          assertedValue: "nineteen complete Horizon codes available=false",
        },
      ],
    },
  ],
};

const voyageFamily = "phase596-nahvalur-voyage-family";
const voyageHawaii = "phase596-nahvalur-voyage-hawaii-current";
const voyageUnavailable = "phase596-nahvalur-voyage-unavailable";
const voyagePride = "phase596-nahvalur-voyage-pride-2024";
const voyageNashville = "phase596-nahvalur-voyage-nashville-sample";
const voyageHawaiiEdition = "phase596-nahvalur-voyage-hawaii-edition";

export const phase596NahvalurVoyagePack: CuratedEntityPack = {
  key: "phase596-nahvalur-voyage-v1",
  entityId: PHASE596_IDS.voyage,
  expectedType: "pen",
  expectedSlug: PHASE596_SLUGS.voyage,
  canonicalName: "Nahvalur Voyage Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/nahvalur-voyage-phase596.md",
  storyTitle:
    "Nahvalur Voyage：Hawaii 当前规格、五个 SKU 与 Nautilus 混名纠错",
  primarySourceKey: S.voyageHawaii.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Nahvalur Voyage",
      language: "en",
      sourceKey: S.voyageHawaii.key,
    },
    {
      alias: "Nahvalur Voyage Series",
      language: "en",
      sourceKey: S.voyageHawaii.key,
    },
    {
      alias: "Nahvalur Voyage Hawaii",
      language: "en",
      sourceKey: S.voyageHawaii.key,
      market: "Hawaii edition",
    },
    {
      alias: "纳瓦尔 Voyage 旅行主题钢笔",
      language: "zh",
      sourceKey: S.voyageHawaii.key,
    },
  ],
  sources: [
    S.voyageHawaii,
    S.voyageData,
    S.voyagePride,
    S.series,
    S.care,
    S.voyagePenquisition,
    S.voyageNautilusReview,
    S.voyageDiagram,
  ],
  scopes: [
    {
      key: voyageFamily,
      scopeKey: voyageFamily,
      market: "Nahvalur Voyage canonical fountain-pen family",
      productionState: "current",
      nibScope:
        "In-house No.6 stainless steel; plating and width availability remain edition/SKU scoped.",
      materialScope:
        "Travel-themed edition-specific resin and appointments with a traditional continuous ink window.",
      editionScope:
        "Hawaii, Pride and Nashville remain edition/collaboration scopes; Nautilus is a separate sibling.",
    },
    {
      key: voyageHawaii,
      scopeKey: voyageHawaii,
      variantKey: voyageHawaiiEdition,
      market: "2026-08-11 Voyage Hawaii exact product",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Gold-plated in-house No.6 steel; F/M/B/Stub/Double Broad available and EF unavailable.",
      materialScope:
        "Hawaii edition resin, gold-plated appointments and oar-shaped clip; no colour fidelity inferred.",
      editionScope:
        "Five current market-SKU children; official dimensions and cannot-post statement remain Hawaii scoped.",
    },
    {
      key: voyageUnavailable,
      scopeKey: voyageUnavailable,
      market: "Voyage Hawaii Extra Fine retrieval-date status",
      validFrom: RETRIEVED,
      productionState: "unknown",
      nibScope:
        "Extra Fine code 03060390 is complete but available=false.",
      editionScope:
        "The unavailable code remains rejected status evidence and does not become a current market SKU.",
    },
    {
      key: voyagePride,
      scopeKey: voyagePride,
      market: "Voyage Pride 2024 official edition",
      validFrom: "2024",
      validTo: "2024",
      productionState: "historical",
      materialScope:
        "Pride resin and It Gets Better collaboration are edition scoped.",
      editionScope:
        "Officially limited to 628 pieces; the count is not generalized to Voyage.",
    },
    {
      key: voyageNashville,
      scopeKey: voyageNashville,
      market: "Penquisition Nashville Hatch collaboration sample",
      validFrom: "2023-11-26",
      productionState: "historical",
      materialScope:
        "Custom DiamondCast and collaboration details belong to one Nashville sample.",
      editionScope:
        "Marketing sometimes used Nautilus while packaging and traditional ink-window structure identify Voyage.",
    },
  ],
  claims: [
    claim({
      key: "phase596-nahvalur-voyage-identity",
      predicate: "model_identity",
      objectText:
        "Nahvalur Voyage is a canonical travel-themed piston family with a traditional continuous ink window. It remains separate from Nautilus, whose stable identity uses three round porthole windows.",
      source: S.voyageHawaii,
      scopeKey: voyageFamily,
      evidence: [
        {
          key: "phase596-voyage-identity-series-evidence",
          source: S.series,
          scopeKey: voyageFamily,
        },
        {
          key: "phase596-voyage-identity-nashville-evidence",
          source: S.voyagePenquisition,
          scopeKey: voyageNashville,
        },
        {
          key: "phase596-voyage-identity-nautilus-evidence",
          source: S.voyageNautilusReview,
          scopeKey: voyageFamily,
        },
      ],
    }),
    claim({
      key: "phase596-nahvalur-voyage-hawaii-configuration",
      predicate: "current_configuration",
      objectText:
        "Voyage Hawaii uses edition resin, gold-plated appointments, a gold-plated in-house No.6 steel nib and an internal piston; official values are 149/133 mm, 13 mm barrel, 10–11.5 mm grip, 36.85 g and cannot be posted.",
      source: S.voyageHawaii,
      scopeKey: voyageHawaii,
    }),
    claim({
      key: "phase596-nahvalur-voyage-current-skus",
      predicate: "variant_availability_boundary",
      objectText:
        "On 2026-08-11, Hawaii F/M/B/Stub/Double Broad codes are available while Extra Fine 03060390 is unavailable; only five available combinations become current market-SKU children.",
      source: S.voyageData,
      scopeKey: voyageHawaii,
      evidence: [
        {
          key: "phase596-voyage-unavailable-claim-evidence",
          source: S.voyageData,
          scopeKey: voyageUnavailable,
          locator: "Extra Fine SKU 03060390 is available=false",
        },
      ],
    }),
    claim({
      key: "phase596-nahvalur-voyage-pride-boundary",
      predicate: "edition_scope",
      objectText:
        "Voyage Pride 2024 is a 628-piece It Gets Better collaboration edition; the count, resin and relationship do not apply to all Voyage pens.",
      source: S.voyagePride,
      scopeKey: voyagePride,
    }),
    claim({
      key: "phase596-nahvalur-voyage-maintenance",
      predicate: "maintenance_boundary",
      objectText:
        "Hawaii should be flushed through its piston with cool water and never force-posted onto the piston knob. Resin and plated appointments should avoid alcohol, heat, abrasives and forced deep disassembly.",
      source: S.care,
      scopeKey: voyageHawaii,
      editorial: true,
    }),
  ],
  variants: [
    {
      key: voyageHawaiiEdition,
      name: "Voyage Hawaii",
      notes:
        "Current exact product anchor with five available market-SKU children and one unavailable EF code.",
      sourceKey: S.voyageHawaii.key,
      variantKind: "edition_group",
      productCode: "Voyage Hawaii",
      market: "global current",
    },
    ...PHASE596_VOYAGE_CURRENT_SKUS.map(([suffix, name, productCode]) => ({
      key: `phase596-nahvalur-voyage-hawaii-${suffix}-sku`,
      name: `Voyage Hawaii ${name}`,
      notes:
        "Complete code is available in the 2026-08-11 Shopify data; stock duration is not inferred.",
      sourceKey: S.voyageData.key,
      variantKind: "market_sku" as const,
      parentVariantKey: voyageHawaiiEdition,
      productCode,
      market: "current Voyage Hawaii selector",
    })),
  ],
  spec: {
    brandEntityId: PHASE596_NAHVALUR_BRAND_ID,
    values: {
      series_name:
        "Nahvalur Voyage Fountain Pen; Hawaii, Pride and Nashville are edition/collaboration scopes; Nautilus is a separate sibling",
      nib:
        "Hawaii gold-plated in-house No.6 stainless steel; five available F/M/B/Stub/Double Broad SKU combinations and unavailable EF",
      fill_system:
        "Internal piston, bottled ink only, with a traditional continuous ink window; Hawaii cannot be posted",
      material:
        "Edition-specific travel-themed resin; Hawaii gold-plated appointments and oar-shaped clip",
      dimensions:
        "Hawaii official: 149 mm capped, 133 mm uncapped; barrel 13 mm, grip 10–11.5 mm",
      weight: "Hawaii official total weight: 36.85 g",
      status:
        "Hawaii exact page verified 2026-08-11: five SKU combinations available; Extra Fine 03060390 unavailable",
    },
    evidence: [
      evidence(
        "brand_entity_id",
        "phase596-voyage-spec-brand",
        S.series.key,
        voyageFamily,
        "official series navigation places Voyage under Nahvalur",
      ),
      evidence(
        "series_name",
        "phase596-voyage-spec-series-hawaii",
        S.voyageHawaii.key,
        voyageHawaii,
        "exact product title Nahvalur Voyage Hawaii Fountain Pen",
      ),
      evidence(
        "series_name",
        "phase596-voyage-rejected-nashville-nautilus",
        S.voyagePenquisition.key,
        voyageNashville,
        "some Nashville marketing called the sample Nautilus, while packaging and traditional ink-window structure support Voyage",
        false,
      ),
      evidence(
        "nib",
        "phase596-voyage-spec-nib",
        S.voyageHawaii.key,
        voyageHawaii,
        "gold-plated in-house No.6 stainless-steel nib and selector widths",
      ),
      evidence(
        "fill_system",
        "phase596-voyage-spec-fill",
        S.voyageHawaii.key,
        voyageHawaii,
        "piston filling, bottled ink only and cannot be posted",
      ),
      evidence(
        "material",
        "phase596-voyage-spec-material",
        S.voyageHawaii.key,
        voyageHawaii,
        "Hawaii resin, gold-plated appointments and oar-shaped clip",
      ),
      evidence(
        "dimensions",
        "phase596-voyage-spec-dimensions",
        S.voyageHawaii.key,
        voyageHawaii,
        "149/133 mm plus 13 mm barrel and 10–11.5 mm grip",
      ),
      evidence(
        "weight",
        "phase596-voyage-spec-weight",
        S.voyageHawaii.key,
        voyageHawaii,
        "official total weight 36.85 g",
      ),
      evidence(
        "status",
        "phase596-voyage-spec-status-current",
        S.voyageData.key,
        voyageHawaii,
        "five complete Hawaii codes available=true on 2026-08-11",
      ),
      evidence(
        "status",
        "phase596-voyage-rejected-unavailable-ef",
        S.voyageData.key,
        voyageUnavailable,
        "Extra Fine 03060390 is a complete code but available=false on 2026-08-11",
        false,
      ),
    ],
  },
  media: media("voyage", S.voyageDiagram),
  timeline: [
    {
      key: "phase596-nahvalur-voyage-nashville-review",
      title: "Nashville collaboration identity conflict documented",
      eventType: "community_event",
      startDate: "2023-11-26",
      circa: false,
      description:
        "Packaging and traditional ink-window structure resolve the sample to Voyage despite some Nautilus marketing wording.",
      sourceKey: S.voyagePenquisition.key,
    },
    {
      key: "phase596-nahvalur-voyage-pride-2024",
      title: "Voyage Pride 2024 announced",
      eventType: "model_released",
      startDate: "2024",
      circa: false,
      description:
        "Official announcement limits this collaboration edition to 628 pieces.",
      sourceKey: S.voyagePride.key,
    },
    {
      key: "phase596-nahvalur-voyage-current-verified",
      title: "Voyage Hawaii selector verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Retrieval date records five available market SKUs and one unavailable Extra Fine code.",
      sourceKey: S.voyageData.key,
    },
  ],
  conflicts: [
    {
      key: "phase596-nahvalur-voyage-identity-conflict",
      fieldKey: "model_identity",
      scopeKey: voyageFamily,
      conflictKind: "identity",
      status: "resolved",
      resolutionNote:
        "Official Hawaii identity, Nashville packaging and the traditional continuous ink window support Voyage. The isolated Nautilus marketing label remains rejected collaboration-sample evidence.",
      members: [
        {
          citationKey: "phase596-voyage-spec-series-hawaii",
          assertedValue: "official Voyage Hawaii identity",
        },
        {
          citationKey: "phase596-voyage-rejected-nashville-nautilus",
          assertedValue: "some Nashville marketing used Nautilus",
        },
      ],
    },
    {
      key: "phase596-nahvalur-voyage-availability-conflict",
      fieldKey: "variant_availability",
      scopeKey: voyageHawaii,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Only five codes marked available become current market SKUs; the complete but unavailable Extra Fine code remains rejected status evidence.",
      members: [
        {
          citationKey: "phase596-voyage-spec-status-current",
          assertedValue: "five Hawaii codes available=true",
        },
        {
          citationKey: "phase596-voyage-rejected-unavailable-ef",
          assertedValue: "Extra Fine 03060390 available=false",
        },
      ],
    },
  ],
};

const eclipseFamily = "phase596-nahvalur-eclipse-family";
const eclipseLaunch = "phase596-nahvalur-eclipse-launch-black-silver";
const eclipseRevised = "phase596-nahvalur-eclipse-revised-cobalt";
const eclipseReview = "phase596-nahvalur-eclipse-review-sample";
const eclipseBlackEdition = "phase596-nahvalur-eclipse-black-silver-edition";
const eclipseCobaltEdition = "phase596-nahvalur-eclipse-cobalt-black-edition";

export const phase596NahvalurEclipsePack: CuratedEntityPack = {
  key: "phase596-nahvalur-eclipse-v1",
  entityId: PHASE596_IDS.eclipse,
  expectedType: "pen",
  expectedSlug: PHASE596_SLUGS.eclipse,
  canonicalName: "Nahvalur Eclipse Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/nahvalur-eclipse-phase596.md",
  storyTitle:
    "Nahvalur Eclipse：整杆按压、converter 与首发 F/M 到后续 F/M/B",
  primarySourceKey: S.eclipseDesign.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Nahvalur Eclipse",
      language: "en",
      sourceKey: S.eclipseDesign.key,
    },
    {
      alias: "Nahvalur Eclipse Retractable Fountain Pen",
      language: "en",
      sourceKey: S.eclipseDesign.key,
    },
    {
      alias: "Nahvalur Eclipse Capless Pen",
      language: "en",
      sourceKey: S.eclipseDesign.key,
    },
    {
      alias: "纳瓦尔 Eclipse 伸缩钢笔",
      language: "zh",
      sourceKey: S.eclipseDesign.key,
    },
  ],
  sources: [
    S.eclipseDesign,
    S.eclipseBlack,
    S.eclipseBlackData,
    S.eclipseCobalt,
    S.eclipseCobaltData,
    S.series,
    S.care,
    S.eclipsePenAddict,
    S.eclipsePenquisition,
    S.eclipseDiagram,
  ],
  scopes: [
    {
      key: eclipseFamily,
      scopeKey: eclipseFamily,
      market: "Nahvalur Eclipse canonical capless family",
      productionState: "current",
      nibScope:
        "In-house stainless steel; launch page states Fine/Medium while proven revised editions can add Broad.",
      materialScope:
        "Precision-machined twelve-sided aluminium body with removable clip and edition-specific trim.",
      editionScope:
        "One canonical family; launch and revised-feed/back-cap products remain versioned edition groups.",
    },
    {
      key: eclipseLaunch,
      scopeKey: eclipseLaunch,
      variantKey: eclipseBlackEdition,
      market: "Eclipse Black Silver current exact product and launch configuration",
      validFrom: "2024",
      productionState: "current",
      nibScope: "Fine and Medium current SKUs; no Broad inferred for Black Silver.",
      materialScope:
        "Aluminium, silver-coloured appointments and removable clip.",
      editionScope:
        "150 mm retracted, 148 mm extended, Ø13.91 mm and 34 g official anchor.",
    },
    {
      key: eclipseRevised,
      scopeKey: eclipseRevised,
      variantKey: eclipseCobaltEdition,
      market: "Eclipse Cobalt Black revised edition",
      validFrom: "2025",
      productionState: "current",
      nibScope: "Fine, Medium and Broad current Cobalt Black SKUs.",
      materialScope:
        "Cobalt colour/black trim remains edition scoped; exact coating chemistry is not inferred.",
      editionScope:
        "Officially described newly engineered feed and upgraded back-cap fastening; version evolution, not Eclipse 2.",
    },
    {
      key: eclipseReview,
      scopeKey: eclipseReview,
      market: "2025 professional review samples and launch-report boundary",
      validFrom: "2025",
      productionState: "historical",
      nibScope:
        "One Fine sample does not define family-wide flow or nib tuning.",
      editionScope:
        "Reviewer did not use launch version; reported launch reassembly complaints cannot establish a rate or universal defect.",
    },
  ],
  claims: [
    claim({
      key: "phase596-nahvalur-eclipse-identity",
      predicate: "model_identity",
      objectText:
        "Nahvalur Eclipse is the brand's first capless fountain pen: a twelve-sided machined-aluminium body moves as the push mechanism, the clip is removable, and filling uses a converter.",
      source: S.eclipseDesign,
      scopeKey: eclipseFamily,
      evidence: [
        {
          key: "phase596-eclipse-identity-series-evidence",
          source: S.series,
          scopeKey: eclipseFamily,
        },
      ],
    }),
    claim({
      key: "phase596-nahvalur-eclipse-black-configuration",
      predicate: "current_configuration",
      objectText:
        "Eclipse Black Silver provides the official size and weight anchor: aluminium, converter, in-house steel nib, 150 mm retracted, 148 mm extended, Ø13.91 mm and 34 g, with current Fine and Medium SKUs.",
      source: S.eclipseBlack,
      scopeKey: eclipseLaunch,
      evidence: [
        {
          key: "phase596-eclipse-black-selector-evidence",
          source: S.eclipseBlackData,
          scopeKey: eclipseLaunch,
        },
      ],
    }),
    claim({
      key: "phase596-nahvalur-eclipse-version-update",
      predicate: "version_evolution",
      objectText:
        "Cobalt Black belongs to the same Eclipse family but documents a newly engineered feed and upgraded back-cap fastening. Those changes are a later edition/version scope, not a new canonical Eclipse 2.",
      source: S.eclipseCobalt,
      scopeKey: eclipseRevised,
      evidence: [
        {
          key: "phase596-eclipse-version-secondary-evidence",
          source: S.eclipsePenquisition,
          scopeKey: eclipseRevised,
        },
      ],
    }),
    claim({
      key: "phase596-nahvalur-eclipse-nib-boundary",
      predicate: "nib_width_version_boundary",
      objectText:
        "The launch design page states Fine/Medium. Cobalt Black current data adds Broad, so the canonical wording is launch F/M with Broad proven only for later named editions, not every Eclipse colour.",
      source: S.eclipseDesign,
      scopeKey: eclipseLaunch,
      evidence: [
        {
          key: "phase596-eclipse-nib-revised-evidence",
          source: S.eclipseCobaltData,
          scopeKey: eclipseRevised,
        },
      ],
    }),
    claim({
      key: "phase596-nahvalur-eclipse-review-boundary",
      predicate: "review_sample_boundary",
      objectText:
        "The Pen Addict's later Fine sample supports the removable nib-unit/converter filling path. Its retelling of launch reassembly complaints remains nonqualifying and cannot establish a universal defect.",
      source: S.eclipsePenAddict,
      scopeKey: eclipseReview,
    }),
    claim({
      key: "phase596-nahvalur-eclipse-maintenance",
      predicate: "maintenance_boundary",
      objectText:
        "Filling and flushing should remove the nib/converter unit rather than immerse the aluminium mechanism. Guides must align without force; resistance, incomplete retraction or back-cap looseness requires service.",
      source: S.care,
      scopeKey: eclipseFamily,
      editorial: true,
    }),
  ],
  variants: [
    {
      key: eclipseBlackEdition,
      name: "Eclipse Black Silver",
      notes:
        "Launch-configuration exact product and official dimensions/weight anchor; two current SKU children.",
      sourceKey: S.eclipseBlack.key,
      variantKind: "edition_group",
      productCode: "Eclipse Black Silver",
      market: "global current",
    },
    ...PHASE596_ECLIPSE_BLACK_CURRENT_SKUS.map(
      ([suffix, name, productCode]) => ({
        key: `phase596-nahvalur-eclipse-black-silver-${suffix}-sku`,
        name: `Eclipse Black Silver ${name}`,
        notes:
          "Complete code is available in the 2026-08-11 Shopify data; stock duration is not inferred.",
        sourceKey: S.eclipseBlackData.key,
        variantKind: "market_sku" as const,
        parentVariantKey: eclipseBlackEdition,
        productCode,
        market: "current Eclipse Black Silver selector",
      }),
    ),
    {
      key: eclipseCobaltEdition,
      name: "Eclipse Cobalt Black",
      notes:
        "Revised-feed/back-cap exact product with Fine, Medium and Broad current SKU children.",
      sourceKey: S.eclipseCobalt.key,
      variantKind: "edition_group",
      productCode: "Eclipse Cobalt Black",
      market: "global current revised edition",
    },
    ...PHASE596_ECLIPSE_COBALT_CURRENT_SKUS.map(
      ([suffix, name, productCode]) => ({
        key: `phase596-nahvalur-eclipse-cobalt-black-${suffix}-sku`,
        name: `Eclipse Cobalt Black ${name}`,
        notes:
          "Complete code is available in the 2026-08-11 Shopify data; stock duration is not inferred.",
        sourceKey: S.eclipseCobaltData.key,
        variantKind: "market_sku" as const,
        parentVariantKey: eclipseCobaltEdition,
        productCode,
        market: "current Eclipse Cobalt Black selector",
      }),
    ),
  ],
  spec: {
    brandEntityId: PHASE596_NAHVALUR_BRAND_ID,
    values: {
      series_name:
        "Nahvalur Eclipse Fountain Pen; launch and revised-feed/back-cap products are versioned edition groups under one canonical model",
      release_year:
        "Late 2024 launch reported by professional review; revised Cobalt edition documented in 2025",
      nib:
        "Nahvalur in-house stainless steel; launch design states F/M, while current Cobalt Black proves F/M/B for that later edition",
      fill_system:
        "Converter; rear opens and nib/converter unit is removed for filling; whole aluminium mechanism is not immersed",
      material:
        "Precision-machined twelve-sided aluminium body with removable clip and edition-specific trim",
      dimensions:
        "Black Silver official: 150 mm retracted, 148 mm extended, barrel diameter 13.91 mm",
      weight: "Black Silver official uninked weight: 34 g",
      status:
        "Current exact pages verified 2026-08-11: Black Silver two available SKUs and Cobalt Black three; later feed/back-cap revision remains edition scoped",
    },
    evidence: [
      evidence(
        "brand_entity_id",
        "phase596-eclipse-spec-brand",
        S.series.key,
        eclipseFamily,
        "official series navigation places Eclipse under Nahvalur",
      ),
      evidence(
        "series_name",
        "phase596-eclipse-spec-series",
        S.eclipseDesign.key,
        eclipseFamily,
        "official Eclipse design identity and first-capless description",
      ),
      evidence(
        "release_year",
        "phase596-eclipse-spec-release",
        S.eclipsePenquisition.key,
        eclipseReview,
        "professional review reports original introduction in late 2024 and update roughly one year later",
      ),
      evidence(
        "nib",
        "phase596-eclipse-spec-nib-launch",
        S.eclipseDesign.key,
        eclipseLaunch,
        "official design page states Fine and Medium launch choices",
      ),
      evidence(
        "nib",
        "phase596-eclipse-spec-nib-revised",
        S.eclipseCobaltData.key,
        eclipseRevised,
        "Cobalt Black current data exposes Fine, Medium and Broad complete SKUs",
      ),
      evidence(
        "fill_system",
        "phase596-eclipse-spec-fill-official",
        S.eclipseDesign.key,
        eclipseFamily,
        "official design page states converter filling",
      ),
      evidence(
        "fill_system",
        "phase596-eclipse-spec-fill-review",
        S.eclipsePenAddict.key,
        eclipseReview,
        "later sample rear opens and nib/converter unit is removed for filling",
      ),
      evidence(
        "material",
        "phase596-eclipse-spec-material",
        S.eclipseDesign.key,
        eclipseFamily,
        "precision-machined aluminium, twelve facets and removable clip",
      ),
      evidence(
        "dimensions",
        "phase596-eclipse-spec-dimensions",
        S.eclipseBlack.key,
        eclipseLaunch,
        "150 mm closed/retracted, 148 mm open/extended and 13.91 mm barrel diameter",
      ),
      evidence(
        "weight",
        "phase596-eclipse-spec-weight",
        S.eclipseBlack.key,
        eclipseLaunch,
        "official uninked weight 34 g",
      ),
      evidence(
        "status",
        "phase596-eclipse-spec-status-black",
        S.eclipseBlackData.key,
        eclipseLaunch,
        "Black Silver Fine and Medium complete SKUs available=true on 2026-08-11",
      ),
      evidence(
        "status",
        "phase596-eclipse-spec-status-cobalt",
        S.eclipseCobaltData.key,
        eclipseRevised,
        "Cobalt Black Fine, Medium and Broad complete SKUs available=true on 2026-08-11",
      ),
      evidence(
        "status",
        "phase596-eclipse-rejected-launch-reassembly-report",
        S.eclipsePenAddict.key,
        eclipseReview,
        "reviewer did not use the launch version and only reports others' reassembly complaints; no rate or universal defect inferred",
        false,
      ),
    ],
  },
  media: media("eclipse", S.eclipseDiagram),
  timeline: [
    {
      key: "phase596-nahvalur-eclipse-launch",
      title: "Eclipse launch configuration documented",
      eventType: "model_released",
      startDate: "2024",
      circa: true,
      description:
        "Professional review places the first Eclipse introduction in late 2024; no exact day is asserted.",
      sourceKey: S.eclipsePenquisition.key,
    },
    {
      key: "phase596-nahvalur-eclipse-revision",
      title: "Revised feed and back-cap fastening documented",
      eventType: "design_milestone",
      startDate: "2025",
      circa: true,
      description:
        "Official Cobalt page describes the feed and back-cap update; this remains a version scope within Eclipse.",
      sourceKey: S.eclipseCobalt.key,
    },
    {
      key: "phase596-nahvalur-eclipse-current-verified",
      title: "Black Silver and Cobalt Black selectors verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Retrieval date records two Black Silver and three Cobalt Black available market SKUs.",
      sourceKey: S.eclipseCobaltData.key,
    },
  ],
  conflicts: [
    {
      key: "phase596-nahvalur-eclipse-nib-width-conflict",
      fieldKey: "nib",
      scopeKey: eclipseFamily,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Fine/Medium describes the launch family page. Broad is proven for the later named Cobalt Black edition and is not backfilled to every launch colour or Black Silver.",
      members: [
        {
          citationKey: "phase596-eclipse-spec-nib-launch",
          assertedValue: "launch design page: Fine and Medium",
        },
        {
          citationKey: "phase596-eclipse-spec-nib-revised",
          assertedValue: "Cobalt Black current data: Fine, Medium and Broad",
        },
      ],
    },
  ],
};

function mergeSources(
  base: CuratedSource[],
  extras: CuratedSource[],
): CuratedSource[] {
  const byKey = new Map(base.map((source) => [source.key, source]));
  for (const source of extras) {
    const previous = byKey.get(source.key);
    if (previous && JSON.stringify(previous) !== JSON.stringify(source)) {
      throw new Error(`Phase 596 conflicting source definition: ${source.key}.`);
    }
    byKey.set(source.key, source);
  }
  return [...byKey.values()];
}

const nahvalurBase = phase446SheafferSchonNahvalurBrandPacks.find(
  (pack) =>
    pack.entityId === PHASE596_NAHVALUR_BRAND_ID &&
    pack.expectedType === "brand",
);
if (!nahvalurBase) {
  throw new Error("Phase 596 requires the Phase 446 Nahvalur brand pack.");
}

const brandScope = nahvalurBase.scopes.at(-1)?.scopeKey;
if (!brandScope) {
  throw new Error("Phase 596 Nahvalur brand pack requires a canonical scope.");
}

export const phase596NahvalurBrandPack: CuratedEntityPack = {
  ...nahvalurBase,
  key: "phase596-nahvalur-brand-depth-refresh-v1",
  markdownFile: ".planning/content-research/nahvalur-brand-phase596.md",
  storyTitle:
    "Nahvalur：Original、Plus、Schuylkill、Nautilus、Horizon、Voyage 与 Eclipse 七线导航",
  publicationIntent: "publish",
  publicationBlockers: [],
  sources: mergeSources(nahvalurBase.sources, [
    S.series,
    S.care,
    S.originalProduct,
    S.originalData,
    S.originalReview,
    S.originalPlusReview,
    S.horizonCollection,
    S.horizonGaia,
    S.horizonSoleil,
    S.horizonData,
    S.horizonSbre,
    S.horizonPenAddict,
    S.voyageHawaii,
    S.voyageData,
    S.voyagePride,
    S.voyagePenquisition,
    S.voyageNautilusReview,
    S.eclipseDesign,
    S.eclipseBlack,
    S.eclipseBlackData,
    S.eclipseCobalt,
    S.eclipseCobaltData,
    S.eclipsePenAddict,
    S.eclipsePenquisition,
  ]),
  claims: [
    ...nahvalurBase.claims,
    claim({
      key: "phase596-nahvalur-brand-seven-model-navigation",
      predicate: "brand_model_navigation",
      objectText:
        "Nahvalur's public model navigation now contains seven canonical lines: Original, Original Plus, Schuylkill, Nautilus, Horizon, Voyage and Eclipse. Narwhal remains the former brand name, while colour, edition and SKU names stay below their family nodes.",
      source: S.series,
      scopeKey: brandScope,
      evidence: [
        {
          key: "phase596-nahvalur-brand-original-evidence",
          source: S.originalProduct,
          scopeKey: brandScope,
        },
        {
          key: "phase596-nahvalur-brand-horizon-evidence",
          source: S.horizonCollection,
          scopeKey: brandScope,
        },
        {
          key: "phase596-nahvalur-brand-voyage-evidence",
          source: S.voyageHawaii,
          scopeKey: brandScope,
        },
        {
          key: "phase596-nahvalur-brand-eclipse-evidence",
          source: S.eclipseDesign,
          scopeKey: brandScope,
        },
      ],
    }),
    claim({
      key: "phase596-nahvalur-brand-filling-boundary",
      predicate: "family_boundary",
      objectText:
        "Original, Schuylkill, Nautilus, Horizon and Voyage are piston families with different material/window identities; Original Plus is vacuum filling and Eclipse is converter-fed capless. Shared No.6 nib language does not merge them.",
      source: S.series,
      scopeKey: brandScope,
      evidence: [
        {
          key: "phase596-nahvalur-brand-original-plus-boundary-evidence",
          source: S.originalPlusReview,
          scopeKey: brandScope,
        },
        {
          key: "phase596-nahvalur-brand-eclipse-fill-evidence",
          source: S.eclipseDesign,
          scopeKey: brandScope,
        },
      ],
    }),
  ],
  timeline: [
    ...(nahvalurBase.timeline ?? []),
    {
      key: "phase596-nahvalur-original-branch",
      title: "Original piston branch documented from 2019",
      eventType: "model_released",
      startDate: "2019",
      circa: true,
      description:
        "Narwhal Original is retained as the former-name origin of the current Nahvalur Original family.",
      sourceKey: S.originalReview.key,
    },
    {
      key: "phase596-nahvalur-eclipse-branch",
      title: "Eclipse adds a converter-fed capless branch",
      eventType: "design_milestone",
      startDate: "2024",
      circa: true,
      description:
        "Eclipse introduces the twelve-sided whole-body push mechanism and remains separate from piston and vacuum models.",
      sourceKey: S.eclipseDesign.key,
    },
    {
      key: "phase596-nahvalur-seven-models-verified",
      title: "Seven public model routes verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Retrieval date marks source verification for the four added canonical models and the seven-link brand navigation.",
      sourceKey: S.series.key,
    },
  ],
};

export const phase596NahvalurPacks: CuratedEntityPack[] = [
  phase596NahvalurBrandPack,
  phase596NahvalurOriginalPack,
  phase596NahvalurHorizonPack,
  phase596NahvalurVoyagePack,
  phase596NahvalurEclipsePack,
];

if (
  phase596NahvalurPacks.length !== 5 ||
  new Set(phase596NahvalurPacks.map((pack) => pack.entityId)).size !== 5
) {
  throw new Error("Phase 596 must contain one brand and four unique model packs.");
}
