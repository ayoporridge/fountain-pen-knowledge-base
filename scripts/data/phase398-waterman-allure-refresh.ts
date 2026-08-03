import type {
  CuratedClaim,
  CuratedClaimEvidence,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
} from "../lib/curated-content-pack";
import { phase244WatermanAllurePacks } from "./phase244-waterman-allure";
import { phase50WatermanCareneExpertPacks } from "./phase50-waterman-carene-expert";

export const PHASE398_WATERMAN_BRAND_ID = "zkAu9PePDdqJ";
export const PHASE398_ALLURE_ID = "phase83-pen-waterman-allure";
export const PHASE398_ALLURE_SLUG = "waterman-allure";
export const PHASE398_ALLURE_NAME = "威迪文 Waterman Allure";

const RETRIEVED = "2026-08-03";
const SCOPE = "waterman-allure-phase398-current-and-history";

function source(input: Omit<CuratedSource, "retrievedAt"> & { key: string }): CuratedSource {
  return { ...input, retrievedAt: RETRIEVED };
}

const SOURCES = {
  cleaning: source({
    key: "phase398-waterman-allure-cleaning",
    registryKey: "waterman-official-support-cleaning-phase398",
    registryName: "Waterman official storage and cleaning support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-support-cleaning-phase398",
    title: "Fountain pen storage and cleaning recommendations",
    url: "https://www.waterman.com/support?cfid=fountain-pen-storage-and-cleaning-recommendations",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary: "官方建议尖朝上收纳；换墨之间以凉水浸泡、冲洗并吹出余水，再装新墨胆或 converter。",
    archiveUrl: "https://www.waterman.com/support?cfid=fountain-pen-storage-and-cleaning-recommendations",
    archiveLocator: "point-up storage, cool-water soak and rinse instructions",
  }),
  heritage: source({
    key: "phase398-waterman-allure-heritage",
    registryKey: "waterman-official-heritage-phase398",
    registryName: "Waterman official heritage timeline",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-heritage-phase398",
    title: "Waterman Heritage",
    url: "https://www.waterman.com/waterman-history.html",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary: "官方历史页提供 Waterman 品牌和相邻现代系列的时间语境，但当前 Allure 页面没有公开可核实的首发年份。",
    archiveUrl: "https://www.waterman.com/waterman-history.html",
    archiveLocator: "heritage timeline and absence of an Allure launch-year assertion",
  }),
  catalogue: source({
    key: "phase398-waterman-allure-catalogue",
    registryKey: "waterman-official-catalogue-phase398",
    registryName: "Waterman official trade catalogue",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "waterman-official-catalogue-phase398",
    title: "Waterman Trade Catalogue 2021",
    url: "https://assets.waterman.com/is/content/NewellRubbermaid/wtrmn_trdctlg_2021",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary: "官方贸易目录用于核对 Allure Chrome、Pastel/Deluxe 等历史或地区商品语境，不替代当前地区库存。",
    archiveUrl: "https://assets.waterman.com/is/content/NewellRubbermaid/wtrmn_trdctlg_2021",
    archiveLocator: "Allure finishes, fountain-pen writing type and historical product rows",
  }),
} satisfies Record<string, CuratedSource>;

function claimEvidence(key: string, sourceKey: string, locator: string, scopeKey = SCOPE): CuratedClaimEvidence {
  return { key, sourceKey, locator, scopeKey };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceItem: CuratedSource,
  locator: string,
  factClass: "core" | "editorial" = "core",
  extras: CuratedSource[] = [],
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey: sourceItem.key,
    locator,
    evidence: [sourceItem, ...extras].map((item, index) =>
      claimEvidence(`${key}-evidence-${index + 1}`, item.key, index === 0 ? locator : item.summary),
    ),
  };
}

function specEvidence(key: string, fieldKey: CuratedSpecEvidence["fieldKey"], sourceKey: string, locator: string, scopeKey = SCOPE): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const sourcePack = phase244WatermanAllurePacks.find(
  (pack) => pack.entityId === "p244WatermanAllure" && pack.expectedType === "pen",
);
if (!sourcePack) throw new Error("Phase 398 Waterman Allure source pack missing.");
const baseBrand = phase50WatermanCareneExpertPacks.find(
  (pack) => pack.entityId === PHASE398_WATERMAN_BRAND_ID && pack.expectedType === "brand",
);
if (!baseBrand) throw new Error("Phase 398 Waterman brand base pack missing.");

const allure: CuratedEntityPack = structuredClone(sourcePack);
allure.key = "phase398-waterman-allure-refresh-v1";
allure.entityId = PHASE398_ALLURE_ID;
allure.expectedSlug = PHASE398_ALLURE_SLUG;
allure.canonicalName = PHASE398_ALLURE_NAME;
allure.markdownFile = ".planning/content-research/waterman-allure-phase398.md";
allure.storyTitle = "Waterman Allure：S0037650 当前规格与历史饰面边界";
allure.primarySourceKey = "phase244-waterman-allure-product";
allure.spec = {
  ...allure.spec,
  brandEntityId: PHASE398_WATERMAN_BRAND_ID,
  values: {
    ...allure.spec?.values,
    series_name: "Waterman Allure",
    release_year: "当前官方目录可见；现有官方资料未公开可核实的首发年份",
    origin_country: "当前官方商品页称法国手工装配；旧款和地区 SKU 另核",
    nib: "S0037650：刻有环形 W 标志的不锈钢 Fine 尖",
    fill_system: "Waterman cartridge/converter（墨胆或转换器）；是否随盒附 converter 按 SKU 核对",
    material: "S0037650：刷纹不锈钢笔身与笔帽；其它 finish 可能在不锈钢基材上覆漆",
    dimensions: "Pen Heaven Chrome 样本约 134 mm 闭帽、158 mm 后套、11 mm 直径；不覆盖所有版本",
    weight: "Pen Heaven Chrome 样本约 22 g；不覆盖所有 finish",
    status: "Waterman 当前目录列出的 Allure fountain pen；具体颜色、SKU 和库存依地区变化",
  },
  evidence: [
    specEvidence("phase398-allure-brand", "brand_entity_id", "phase244-waterman-allure-collection", "Waterman Allure collection"),
    specEvidence("phase398-allure-series", "series_name", "phase244-waterman-allure-collection", "Allure collection title"),
    specEvidence("phase398-allure-release", "release_year", SOURCES.heritage.key, SOURCES.heritage.summary),
    specEvidence("phase398-allure-origin", "origin_country", "phase244-waterman-allure-product", "current product page hand assembled in France"),
    specEvidence("phase398-allure-nib", "nib", "phase244-waterman-allure-product", "S0037650 Fine stainless-steel nib and looped W"),
    specEvidence("phase398-allure-fill", "fill_system", "phase244-waterman-filling", "official cartridge and converter instructions"),
    specEvidence("phase398-allure-material", "material", "phase244-waterman-allure-product", "brushed stainless-steel barrel and cap"),
    specEvidence("phase398-allure-dimensions", "dimensions", "phase244-waterman-allure-retailer", "Chrome sample dimensions"),
    specEvidence("phase398-allure-weight", "weight", "phase244-waterman-allure-retailer", "Chrome sample weight"),
    specEvidence("phase398-allure-price", "price_range", "phase244-waterman-allure-product", "current product page does not expose a stable price"),
    specEvidence("phase398-allure-status", "status", "phase244-waterman-allure-collection", "current collection writing-type separation"),
  ],
};

allure.sources = [
  ...allure.sources.map((item) => ({ ...item, retrievedAt: RETRIEVED })),
  ...Object.values(SOURCES),
];
allure.scopes = [
  ...allure.scopes,
  {
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "current",
    market: "Waterman current Allure collection and S0037650, with historical/secondary comparison",
    nibScope: "S0037650 Waterman W stainless-steel Fine nib; other widths remain SKU-bound",
    materialScope: "S0037650 brushed stainless steel; Black CT and other lacquer finishes separately checked",
    editionScope: "Allure fountain pen family only; excludes same-name rollerball, ballpoint and duplicate Phase 244 entity",
  },
];
allure.claims = [
  ...allure.claims,
  claim(`${SCOPE}-history`, "release_history", "当前 Allure collection、S0037650 商品页和官方系列介绍没有给出可核实的系列首发年份；Waterman 的 140 多年是品牌工艺语境，不能当作 Allure 的发行年。", SOURCES.heritage, "official heritage context and no Allure launch-year assertion", "core", [SOURCES.catalogue]),
  claim(`${SCOPE}-cleaning`, "maintenance_guidance", "官方建议每次换墨之间以凉水浸泡、冲洗并吹出余水，换墨前再装 cartridge 或 converter；不用笔时尖朝上收纳。", SOURCES.cleaning, "official cool-water cleaning and point-up storage", "core", [SOURCES.cleaning]),
  claim(`${SCOPE}-current-boundary`, "current_catalog_boundary", "当前 collection 将 Allure fountain pen 与 rollerball、ballpoint 分列，并显示 Stainless Steel、Black CT 等颜色；S0037650 抓取时缺货不等于系列停产。", SOURCES.catalogue, "current writing-type and historical/region boundary", "core", [SOURCES.cleaning]),
  claim(`${SCOPE}-family`, "sibling_boundary", "Allure 与 Hémisphère、Expert、Carène、Charleston 是不同 Waterman 身份；相同的 Waterman cartridge/converter 生态不能覆盖它们各自的商品号、尺寸或尖材。", SOURCES.heritage, "Waterman heritage and current pens navigation", "core", [SOURCES.catalogue]),
  claim(`${SCOPE}-media`, "media_identity_boundary", "本站原创 SVG 只表达 Allure 的细身轮廓、刷纹金属、环形 W 钢尖和墨胆／转换器关系；它是事实示意图，不是产品照片或颜色校样。", allure.sources.find((item) => item.key === "phase244-waterman-allure-svg") ?? SOURCES.catalogue, "site-original factual SVG and non-photo boundary", "editorial"),
];

const stainless = allure.variants?.find((variant) => variant.name === "Stainless Steel");
if (stainless) stainless.productCode = "S0037650";
allure.variants = [
  ...(allure.variants ?? []),
  {
    key: `${SCOPE}-pastel-deluxe`,
    name: "Pastel / Deluxe 历史或地区 SKU",
    releaseYear: "历史或地区目录；年份未统一公开",
    notes: "旧页面或贸易目录可用于识别颜色、礼盒和市场语境；不可把 unavailable 页面写成当前库存或停产证明。",
    sourceKey: SOURCES.catalogue.key,
    variantKind: "edition_group",
    market: "历史/地区资料",
  },
  {
    key: `${SCOPE}-chrome-old-sample`,
    name: "Chrome / Allure of Paris 等旧称或地区样本",
    releaseYear: "具体样本待核",
    notes: "Pen Heaven Chrome 与 Fountain Pen Network dated sample 的尺寸、重量和附件只绑定各自样本，不覆盖当前 S0037650。",
    sourceKey: "phase244-waterman-allure-retailer",
    variantKind: "edition_group",
    market: "专业零售与论坛样本",
  },
];

const watermanBrand: CuratedEntityPack = structuredClone(baseBrand);
watermanBrand.key = "phase398-waterman-brand-v1";

export const phase398WatermanAllureRefreshPacks: CuratedEntityPack[] = [
  watermanBrand,
  allure,
];
