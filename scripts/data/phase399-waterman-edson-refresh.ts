import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
} from "../lib/curated-content-pack";
import {
  PHASE358_TARGET_ID,
  PHASE358_TARGET_SLUG,
  PHASE358_WATERMAN_BRAND_ID,
  phase358WatermanEdsonPacks,
} from "./phase358-waterman-edson";

export const PHASE399_WATERMAN_BRAND_ID = PHASE358_WATERMAN_BRAND_ID;
export const PHASE399_EDSON_ID = PHASE358_TARGET_ID;
export const PHASE399_EDSON_SLUG = PHASE358_TARGET_SLUG;
export const PHASE399_EDSON_NAME = "威迪文 Waterman Edson";

const RETRIEVED = "2026-08-03";
const SCOPE = "phase399-waterman-edson-current-and-historical-boundary";

function source(input: Omit<CuratedSource, "retrievedAt"> & { key: string }): CuratedSource {
  return { ...input, retrievedAt: RETRIEVED };
}

const SOURCES = {
  currentHeritage: source({
    key: "phase399-waterman-edson-current-heritage",
    registryKey: "waterman-official-heritage-phase399",
    registryName: "Waterman official heritage",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-heritage-phase399",
    title: "Waterman Heritage timeline",
    url: "https://www.waterman.com/waterman-history.html",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary: "英国官方 heritage 保留 1990–92 Expert 与随后椭圆未来感 Edson 的时间线；Edson 的颜色页面不提供统一首发日。",
    archiveUrl: "https://www.waterman.com/waterman-history.html",
    archiveLocator: "1990-92 Expert and Edson elliptic design entry",
  }),
  currentPortfolio: source({
    key: "phase399-waterman-edson-current-portfolio",
    registryKey: "waterman-official-portfolio-phase399",
    registryName: "Waterman official current portfolio",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-portfolio-phase399",
    title: "All Luxury Pens",
    url: "https://www.waterman.com/pens/",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary: "当前主目录列出 Allure、Expert、Carène、Hémisphère、Exception 等 collection；本次页面未列 Edson，支持其历史系列边界而非停产断言。",
    archiveUrl: "https://www.waterman.com/pens/",
    archiveLocator: "current collection results and Edson absence at retrieval time",
  }),
  spareParts: source({
    key: "phase399-waterman-edson-spare-parts",
    registryKey: "waterman-official-spare-parts-phase399",
    registryName: "Waterman official support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "waterman-official-spare-parts-phase399",
    title: "Spare part supply",
    url: "https://www.waterman.com/support?cfid=spare-part-supply",
    homepageUrl: "https://www.waterman.com/",
    author: "Waterman",
    allowedUse: "summary_only",
    summary: "官方支持页说明可咨询尖宽、维修、清洁和 converter 等零部件事项；具体 Edson 老款零件仍需按地区和凭证确认。",
    archiveUrl: "https://www.waterman.com/support?cfid=spare-part-supply",
    archiveLocator: "nib size, overhaul, cleaning and cartridge/converter supply guidance",
  }),
  catalogue2010: source({
    key: "phase399-waterman-edson-catalogue-2010",
    registryKey: "waterman-trade-catalogue-2010-phase399",
    registryName: "Waterman trade catalogue archive",
    sourceType: "retailer",
    tier: "contemporary_archive",
    independenceGroup: "waterman-trade-catalogue-2010-phase399",
    title: "Waterman Catalogue 2010",
    url: "https://www.samdex.sk/sub/samdex.sk/images/catalogue/Waterman_Catalogue_2010_ENG.pdf",
    homepageUrl: "https://www.samdex.sk/",
    author: "Waterman catalogue archive",
    allowedUse: "summary_only",
    summary: "2010 目录镜像列出 Edson 的 18K solid gold（Diamond Black 铑镀）、EF/F/M/B/Stub/OF/OB、twin-shell precious resin 与 C/C 语境。",
    archiveUrl: "https://www.samdex.sk/sub/samdex.sk/images/catalogue/Waterman_Catalogue_2010_ENG.pdf",
    archiveLocator: "Edson writing modes, nib widths, twin-shell barrel and filling fields",
  }),
} satisfies Record<string, CuratedSource>;

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceItem: CuratedSource,
  locator: string,
  factClass: "core" | "editorial" = "core",
  extra: CuratedSource[] = [],
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey: sourceItem.key,
    locator,
    evidence: [sourceItem, ...extra].map((item, index) => ({
      key: `${key}-evidence-${index + 1}`,
      sourceKey: item.key,
      scopeKey: SCOPE,
      locator: index === 0 ? locator : item.summary,
    })),
  };
}

function specEvidence(
  key: string,
  fieldKey: CuratedSpecEvidence["fieldKey"],
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const inheritedBrand = phase358WatermanEdsonPacks.find(
  (pack) => pack.entityId === PHASE399_WATERMAN_BRAND_ID && pack.expectedType === "brand",
);
const inheritedModel = phase358WatermanEdsonPacks.find(
  (pack) => pack.entityId === PHASE399_EDSON_ID && pack.expectedType === "pen",
);
if (!inheritedBrand || !inheritedModel) throw new Error("Phase 399 Waterman Edson prerequisite pack missing.");

const brand: CuratedEntityPack = structuredClone(inheritedBrand);
brand.key = "phase399-waterman-brand-navigation-v1";
brand.sources = [
  ...brand.sources.map((item) => ({ ...item, retrievedAt: RETRIEVED })),
  SOURCES.currentHeritage,
  SOURCES.currentPortfolio,
  SOURCES.catalogue2010,
].filter((item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index);
brand.scopes = [
  ...brand.scopes,
  {
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "historical",
    market: "Waterman Edson historical navigation",
    editionScope: "Edson family entry only; current portfolio and historical sources kept separate",
  },
];
brand.claims = [
  ...brand.claims,
  claim(
    "phase399-waterman-edson-navigation",
    "series_navigation",
    "Waterman 品牌页保留 Edson 独立入口；官方历史把它置于 1990–92 Expert 之后，当前主目录的现行 collection 与历史 Edson 分开记录。",
    SOURCES.currentHeritage,
    "official heritage timeline and current portfolio boundary",
    "core",
    [SOURCES.currentPortfolio],
  ),
];

const model: CuratedEntityPack = structuredClone(inheritedModel);
model.key = "phase399-waterman-edson-refresh-v1";
model.entityId = PHASE399_EDSON_ID;
model.expectedSlug = PHASE399_EDSON_SLUG;
model.canonicalName = PHASE399_EDSON_NAME;
model.markdownFile = ".planning/content-research/waterman-edson-phase399.md";
model.storyTitle = "Waterman Edson：椭圆双层树脂、18K 尖与 Diamond Black SKU 边界";
model.primarySourceKey = SOURCES.currentHeritage.key;
model.sources = [
  ...model.sources.map((item) => ({ ...item, retrievedAt: RETRIEVED })),
  ...Object.values(SOURCES),
].filter((item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index);
model.scopes = [
  ...model.scopes,
  {
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "historical",
    market: "Waterman historical Edson family compared with current portfolio",
    nibScope: "18K solid gold; Diamond Black rhodium-plated; F/M and ordered widths remain SKU-bound",
    materialScope: "twin-shell precious resin / SAN lacquer, brass cap and plated trim by variant",
    editionScope: "Edson fountain pen only; excludes same-name rollerball, ballpoint and unrelated Waterman series",
  },
];
model.claims = [
  ...model.claims,
  claim(
    `${SCOPE}-current-boundary`,
    "current_catalog_boundary",
    "Waterman 当前主目录在本次读取时列出 Allure、Expert、Carène、Hémisphère 和 Exception 等 collection，未列 Edson；这只能说明当前导航边界，不能单独证明所有市场永久停产。",
    SOURCES.currentPortfolio,
    "current portfolio result and absence at retrieval time",
    "core",
    [SOURCES.currentHeritage],
  ),
  claim(
    `${SCOPE}-spare-parts`,
    "service_boundary",
    "Waterman 官方支持页允许咨询尖宽、检修、清洁和 cartridge/converter 供应事项；Edson 老款的具体零件、保修和服务地区仍需按实物与购买凭证确认。",
    SOURCES.spareParts,
    "official spare-part and overhaul guidance",
    "core",
  ),
  claim(
    `${SCOPE}-catalogue-widths`,
    "nib_width_boundary",
    "2010 目录镜像把 Edson 公开字幅列为 EF、F、M、B、Stub、OF、OB；日本 Diamond Black 目录的 F/M 商品号仍只绑定 S2 210 172 与 S2 210 173。",
    SOURCES.catalogue2010,
    "2010 catalogue nib-width table",
    "core",
    [model.sources.find((item) => item.key === "phase358-waterman-edson-diamond-black-catalogue") ?? SOURCES.catalogue2010],
  ),
];
if (model.spec) {
  model.spec.values = {
    ...model.spec.values,
    status: "历史高端系列；Waterman 当前主目录未列 Edson，颜色、库存与维修条件随市场和年份变化",
    nib: "18K solid gold；Diamond Black rhodium-plated；常见 EF/F/M/B/Stub/OF/OB，具体字幅按 SKU",
    fill_system: "Waterman cartridge/converter；不同年代 converter、墨胆和接口按实物核对",
  };
  model.spec.evidence = [
    ...model.spec.evidence,
    specEvidence(`${SCOPE}-status`, "status", SOURCES.currentPortfolio.key, "current portfolio and historical Edson boundary"),
    specEvidence(`${SCOPE}-nib`, "nib", SOURCES.catalogue2010.key, "2010 Edson 18K and nib-width table"),
    specEvidence(`${SCOPE}-fill`, "fill_system", SOURCES.spareParts.key, "official cartridge/converter service guidance"),
  ];
}

export const phase399WatermanEdsonRefreshPacks: CuratedEntityPack[] = [brand, model];
