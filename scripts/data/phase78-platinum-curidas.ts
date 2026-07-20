import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE42_PLATINUM_BRAND_ID,
  phase42LamyPlatinumPacks,
} from "./phase42-lamy-platinum";

export const PHASE78_PLATINUM_BRAND_ID = PHASE42_PLATINUM_BRAND_ID;
export const PHASE78_CURIDAS_ID = "BoZ4C2WSqk0K";
export const PHASE78_CURIDAS_RAW_SLUG = "白金-platinum-curidas";
export const PHASE78_CURIDAS_SLUG = "platinum-curidas";

const RETRIEVED = "2026-07-20";

function source(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  tier?: CuratedSource["tier"];
  sourceType?: CuratedSource["sourceType"];
  registryKey?: string;
  registryName?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey ?? "platinum-official-phase78",
    registryName: input.registryName ?? "Platinum Pen Co., Ltd.",
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.registryKey ?? "platinum-official-phase78",
    title: input.title,
    url: input.url,
    homepageUrl: "https://www.platinum-pen.co.jp/",
    author: input.registryName ?? "Platinum Pen Co., Ltd.",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: [
      "live-source-not-frozen",
      `retrieved=${RETRIEVED}`,
      "external_archive=false",
      `locator=${input.locator}`,
    ].join(";"),
  };
}

const SOURCES = {
  product: source({
    key: "phase78-curidas-pkn7000-official",
    title: "キュリダス PKN-7000",
    url: "https://www.platinum-pen.co.jp/products/fountain-pen/7848/",
    summary:
      "Platinum 日本官网当前 PKN-7000 产品页列 Curidas、五种常规轴色、ST-2 不锈钢尖 EF/F/M、PMMA、153 mm、13.8 mm、24.0 g、蓝黑墨囊一支和日本含税 7,700 日元。",
    locator:
      "PKN-7000 product name, current regular colours, ST-2 nib choices, PMMA, dimensions, weight and included cartridge",
  }),
  feature: source({
    key: "phase78-curidas-feature-official",
    title: "CURIDAS キュリダス 特设页",
    url: "https://www.platinum-pen.co.jp/curidas_jp.html",
    summary:
      "官方专题说明 Curidas 的推出/收回笔尖、收纳仓门和较小气密空间、可拆笔夹、PMMA 与镀铬黄铜/弹簧钢部件，以及 Platinum 墨囊和另购 Converter-700A/800A 的边界。",
    locator:
      "retractable-nib sealing description; removable clip; materials; Platinum cartridge and Converter-700A/800A compatibility",
  }),
  launch: source({
    key: "phase78-curidas-launch-official",
    title: "新製品 キュリダス発売のお知らせ",
    url: "https://www.platinum-pen.co.jp/news/8910/",
    summary:
      "2020-02-17 Platinum 发布稿把 Curidas 的发售日定为 2020-03-20，并将其置于 1965 Platinum Knock 之后的公司按动钢笔脉络，列出常规规格和随附蓝黑墨囊。",
    locator:
      "2020-03-20 release date; 1965 Platinum Knock historical line; launch specifications and included cartridge",
  }),
  temporaryPause: source({
    key: "phase78-curidas-temporary-pause-official",
    title: "キュリダス一時生産中止のお知らせ",
    url: "https://www.platinum-pen.co.jp/news/9553/",
    summary:
      "2020-06-12 官方公告说 Curidas 因 COVID-19 相关供应影响而暂时生产中止，并预告 2020 年 11 月恢复；它是历史供应事件，不能当作目前停产证据。",
    locator:
      "temporary 2020 production pause, COVID-19 context and planned November resumption",
  }),
  manual: source({
    key: "phase78-curidas-manual-official",
    title: "Platinum Curidas 取扱説明书",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2023/05/2132623e0a9276d43ac296ba8a41609e.pdf",
    summary:
      "官方说明书用于核对按动笔的墨囊/转换器安装、使用警示和清洗边界；不把内部机构的拆卸当作日常用户必须执行的保养。",
    locator: "cartridge/converter installation, warnings and maintenance boundary",
  }),
  review: source({
    key: "phase78-curidas-gentleman-stationer",
    title: "Initial Thoughts: The Platinum Curidas",
    url: "https://www.gentlemanstationer.com/blog/2020/4/29/initial-thoughts-the-platinum-curidas",
    tier: "professional_secondary",
    sourceType: "blog",
    registryKey: "gentleman-stationer-phase78",
    registryName: "The Gentleman Stationer",
    summary:
      "署名评测记录一支样笔更换墨囊/转换器时需要先处理带弹簧的笔尖组件，且笔夹和前端结构会因握法产生分歧；仅作体验和操作交叉核验。",
    locator: "sample-specific filling disassembly sequence, grip and clip observations",
  }),
  review2: source({
    key: "phase78-curidas-pencilcase-blog",
    title: "Review: Platinum Curidas Fountain Pen",
    url: "https://www.pencilcaseblog.com/2022/12/review-platinum-curidas-fountain-pen.html",
    tier: "professional_secondary",
    sourceType: "blog",
    registryKey: "pencilcase-blog-phase78",
    registryName: "Pencilcase Blog",
    summary:
      "独立评测以一支 F 样本讨论推出后的长度、前端凸起和握持；这些体验不外推为 EF/F/M 全部笔尖的统一书写或平衡承诺。",
    locator: "F-sample grip and protrusion observations; no all-nib extrapolation",
  }),
  capless: source({
    key: "phase78-pilot-capless-boundary",
    title: "パイロット キャップレス 新色発売",
    url: "https://www.pilot.co.jp/press_release/2026/03/05/post_150.html",
    summary:
      "Pilot 官方 2026 Capless 资料显示其拥有自身的 18K 与特殊合金笔尖路线及 cartridge/converter 平台；只用于说明它不是 Curidas 的版本或替换零件来源。",
    locator: "Capless 18K and special-alloy nib routes plus Pilot filling-system boundary",
  }),
  preppy: source({
    key: "phase78-platinum-preppy-boundary",
    title: "Platinum Preppy 品牌页",
    url: "https://www.platinum-pen.co.jp/brands/preppy/",
    summary:
      "Platinum 官方 Preppy 品牌页确认 Preppy 是独立的有帽入门系列；该页不承载 Curidas 的按动密封、尺寸或配件事实。",
    locator: "Preppy as capped sibling series, not a Curidas specification source",
  }),
  svg: {
    key: "phase78-curidas-factual-svg",
    registryKey: "fountain-pen-graph-editorial-phase78",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission" as const,
    tier: "primary" as const,
    independenceGroup: "fountain-pen-graph-editorial-phase78",
    title: "Platinum Curidas PKN-7000 身份与使用边界事实图",
    url: "/images/library/site-original/platinum-curidas/platinum-curidas-pkn7000.svg",
    homepageUrl: "/",
    itemType: "image" as const,
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full" as const,
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片。",
    archiveUrl: "/images/library/site-original/platinum-curidas/platinum-curidas-pkn7000.svg",
    archiveLocator:
      "project-public-asset:platinum-curidas;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false",
  },
} satisfies Record<string, CuratedSource>;

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

const oldBrand = phase42LamyPlatinumPacks.find(
  (pack) => pack.entityId === PHASE78_PLATINUM_BRAND_ID,
);
if (!oldBrand) throw new Error("Phase 78 Platinum brand pack is unavailable.");
const platinumBrand = structuredClone(oldBrand);
platinumBrand.key = "phase78-platinum-brand-v1";

export const phase78PlatinumCuridasPacks: CuratedEntityPack[] = [
  platinumBrand,
  {
    key: "phase78-platinum-curidas-v1",
    entityId: PHASE78_CURIDAS_ID,
    expectedType: "pen",
    expectedSlug: PHASE78_CURIDAS_SLUG,
    canonicalName: "Platinum Curidas",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/platinum-curidas-phase78.md",
    storyTitle: "Platinum Curidas：按一下就能写，补墨却并不省事",
    primarySourceKey: SOURCES.product.key,
    depthTier: "A",
    aliases: [
      { alias: "Platinum Curidas", language: "en", sourceKey: SOURCES.product.key },
      { alias: "キュリダス", language: "ja", sourceKey: SOURCES.product.key },
      { alias: "白金 Curidas", language: "zh", sourceKey: SOURCES.product.key },
      { alias: "PKN-7000", language: "en", sourceKey: SOURCES.product.key },
    ],
    sources: Object.values(SOURCES),
    scopes: [
      {
        key: "phase78-curidas-pkn7000-scope",
        scopeKey: "phase78-curidas-pkn7000-scope",
        productionState: "current",
        editionScope:
          "本页只承载日本当前目录的 Curidas PKN-7000。五种常规颜色与 EF/F/M 是同一型号的选择；Curidas Matte、地区套装和未来限量若无官方 SKU 证据，不回填本页。",
      },
    ],
    claims: [
      {
        key: "phase78-curidas-identity",
        predicate: "model_identity",
        objectText:
          "Curidas 是 Platinum 于 2020 年推出的独立按动式钢笔型号 PKN-7000。它以可收回笔尖、收纳仓门和透明 PMMA 笔身为核心，不是 Pilot Capless 的子型号，也不是 Preppy 的按动外壳。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.product.key,
        locator: SOURCES.product.summary,
        evidence: [
          { key: "phase78-curidas-product-evidence", sourceKey: SOURCES.product.key, scopeKey: "phase78-curidas-pkn7000-scope", locator: SOURCES.product.summary },
          { key: "phase78-curidas-launch-evidence", sourceKey: SOURCES.launch.key, scopeKey: "phase78-curidas-pkn7000-scope", locator: SOURCES.launch.summary },
          { key: "phase78-curidas-independent-structure-evidence", sourceKey: SOURCES.review.key, scopeKey: "phase78-curidas-pkn7000-scope", locator: "独立样笔对可收回笔尖、补墨动作与前端结构的观察；不替代官方规格。" },
        ],
      },
      {
        key: "phase78-curidas-boundary",
        predicate: "version_boundary",
        objectText:
          "Curidas 的按动场景可与 Pilot Capless 比较，但两者分别使用 Platinum 与 Pilot 的笔尖和供墨体系；Preppy 则是有笔帽的独立入门系列。2020 年的临时生产中止是供应历史，不能把当前 PKN-7000 写为停产。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.temporaryPause.key,
        locator: SOURCES.temporaryPause.summary,
        evidence: [
          { key: "phase78-curidas-pause-evidence", sourceKey: SOURCES.temporaryPause.key, scopeKey: "phase78-curidas-pkn7000-scope", locator: SOURCES.temporaryPause.summary },
          { key: "phase78-curidas-capless-evidence", sourceKey: SOURCES.capless.key, scopeKey: "phase78-curidas-pkn7000-scope", locator: SOURCES.capless.summary },
          { key: "phase78-curidas-preppy-evidence", sourceKey: SOURCES.preppy.key, scopeKey: "phase78-curidas-pkn7000-scope", locator: SOURCES.preppy.summary },
        ],
      },
      {
        key: "phase78-curidas-use-observation",
        predicate: "usage_observation",
        objectText:
          "独立评测的样笔观察显示，按动机构令补墨和握持体验比普通有帽钢笔更有分歧；这是结构取舍的说明，不是对任意尖号或每位使用者的质量判定。",
        factClass: "editorial",
        confidence: 0.85,
        sourceKey: SOURCES.review.key,
        locator: SOURCES.review.summary,
        evidence: [
          { key: "phase78-curidas-review-evidence", sourceKey: SOURCES.review.key, scopeKey: "phase78-curidas-pkn7000-scope", locator: SOURCES.review.summary },
          { key: "phase78-curidas-review2-evidence", sourceKey: SOURCES.review2.key, scopeKey: "phase78-curidas-pkn7000-scope", locator: SOURCES.review2.summary },
        ],
      },
    ],
    variants: [
      {
        key: "phase78-curidas-pkn7000-regular",
        name: "Curidas PKN-7000 常规款",
        variantKind: "market_sku",
        releaseYear: "2020–",
        productCode: "PKN-7000",
        notes:
          "Prism Crystal、Graphite Smoke、Urban Green、Abyss Blue、Gran Red 为官网当前列出的常规颜色；EF/F/M 为同一型号笔尖选项。",
        sourceKey: SOURCES.product.key,
      },
    ],
    spec: {
      brandEntityId: PHASE78_PLATINUM_BRAND_ID,
      values: {
        series_name: "Platinum Curidas / PKN-7000",
        release_year: "2020-03-20",
        origin_country: "日本 Platinum 当前产品目录",
        nib: "ST-2 不锈钢尖；EF、F、M",
        fill_system: "Platinum 专用墨囊；Converter-700A 或 800A 另购",
        material: "PMMA 笔身、前轴与按键部件；中螺纹为镀铬黄铜，笔夹为镀铬弹簧钢",
        dimensions: "全长约 153 mm；最大径约 13.8 mm；标准重量约 24.0 g",
        status: "日本官网当前 PKN-7000 常规款；2020 年临时供应中止已属历史事件",
      },
      evidence: [
        evidence("brand_entity_id", "phase78-curidas-brand", SOURCES.product.key, "phase78-curidas-pkn7000-scope", "Platinum PKN-7000 official product identity"),
        evidence("series_name", "phase78-curidas-series", SOURCES.product.key, "phase78-curidas-pkn7000-scope", "official product title and PKN-7000"),
        evidence("release_year", "phase78-curidas-release", SOURCES.launch.key, "phase78-curidas-pkn7000-scope", "official 2020-03-20 release date"),
        evidence("origin_country", "phase78-curidas-origin", SOURCES.product.key, "phase78-curidas-pkn7000-scope", "Japanese official current catalogue context"),
        evidence("nib", "phase78-curidas-nib", SOURCES.product.key, "phase78-curidas-pkn7000-scope", "official ST-2 and EF/F/M field"),
        evidence("fill_system", "phase78-curidas-fill", SOURCES.feature.key, "phase78-curidas-pkn7000-scope", "official cartridge and Converter-700A/800A compatibility"),
        evidence("material", "phase78-curidas-material", SOURCES.feature.key, "phase78-curidas-pkn7000-scope", "official PMMA, brass and spring-steel fields"),
        evidence("dimensions", "phase78-curidas-dimensions", SOURCES.product.key, "phase78-curidas-pkn7000-scope", "official 153 mm, 13.8 mm and 24.0 g fields"),
        evidence("status", "phase78-curidas-status", SOURCES.product.key, "phase78-curidas-pkn7000-scope", "current official PKN-7000 product page"),
      ],
    },
    media: [
      {
        key: "phase78-curidas-primary-svg",
        title: "Platinum Curidas PKN-7000 事实图（非产品照片）",
        sourceKey: SOURCES.svg.key,
        localPath: SOURCES.svg.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、库存、具体笔尖、材料或版本。",
        sourceUrl: SOURCES.svg.url,
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "phase78-curidas-knock-line",
        title: "Platinum Knock 构成公司按动钢笔历史线",
        eventType: "model_released",
        startDate: "1965",
        circa: false,
        description: "官方 Curidas 发布资料以 1965 Platinum Knock 作为按动钢笔历史参照，不将它当作 Curidas 的同款变体。",
        sourceKey: SOURCES.launch.key,
      },
      {
        key: "phase78-curidas-launch",
        title: "Curidas PKN-7000 上市",
        eventType: "model_released",
        startDate: "2020-03-20",
        circa: false,
        description: "Platinum 公布 Curidas 于 2020 年 3 月 20 日发售；当前规格仍须以现行 PKN-7000 产品页为准。",
        sourceKey: SOURCES.launch.key,
      },
    ],
  },
];
