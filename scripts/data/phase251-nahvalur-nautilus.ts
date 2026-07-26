import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE59_NAHVALUR_BRAND_ID,
  phase59BenuNahvalurPacks,
} from "./phase59-benu-nahvalur";

const RETRIEVED = "2026-07-26";
export const PHASE251_NAHVALUR_BRAND_ID = PHASE59_NAHVALUR_BRAND_ID;
export const PHASE251_NAUTILUS_ID = "p251NahvalurNautilus";
export const PHASE251_NAUTILUS_SLUG = "nahvalur-nautilus";
const SCOPE = "phase251-nahvalur-nautilus-scope";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase251",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase251",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary,
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  extra: Array<{ key: string; sourceKey: string; locator: string }> = [],
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass: predicate === "maintenance_boundary" ? "editorial" : "core",
    confidence: 0.97,
    sourceKey,
    locator,
    evidence: [
      { key: `${key}-e`, sourceKey, scopeKey: SCOPE, locator },
      ...extra.map((item) => ({ ...item, scopeKey: SCOPE })),
    ],
  };
}

function specEvidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  series: web({
    key: "phase251-nahvalur-series",
    title: "Nahvalur official fountain pen series",
    url: "https://nahvalur.com/pages/nahvalur-fountain-pen",
    registryKey: "nahvalur-official-phase251",
    registryName: "Nahvalur official",
    sourceType: "official",
    tier: "primary",
    summary: "官方系列页将 Nautilus 列为 signature collection，说明 oversize ebonite、活塞和三枚仿船舷窗墨窗。",
    locator: "Nahvalur Nautilus collection description",
  }),
  collection: web({
    key: "phase251-nahvalur-nautilus-collection",
    title: "Nahvalur official Nautilus collection",
    url: "https://nahvalur.com/collections/nahvalur-nautilus",
    registryKey: "nahvalur-official-phase251",
    registryName: "Nahvalur official",
    sourceType: "official",
    tier: "primary",
    summary: "官方集合页列出 Nautilus 的 ebonite、颜色和当前销售配置，并把 Nautilus Ti 与 ebonite 款并列展示。",
    locator: "collection navigation and current model list",
  }),
  silver: web({
    key: "phase251-nautilus-cephalopod-silver",
    title: "Nahvalur Nautilus Cephalopod Silver Ebonite",
    url: "https://nahvalur.com/products/nautilus-cephalopod-silver-ebonite-fountain-pen",
    registryKey: "nahvalur-official-phase251",
    registryName: "Nahvalur official",
    sourceType: "official",
    tier: "primary",
    summary: "官方规格锚点：ebonite、银色饰件、Nahvalur No.6 不锈钢尖、活塞、149/133 mm、13 mm 笔杆、约 36.85 g，不能后插。",
    locator: "Cephalopod Silver specifications",
  }),
  black: web({
    key: "phase251-nautilus-cephalopod-black",
    title: "Nahvalur Nautilus Cephalopod Black Ebonite",
    url: "https://nahvalur.com/products/nautilus-cephalopod-black-ebonite-fountain-pen",
    registryKey: "nahvalur-official-phase251",
    registryName: "Nahvalur official",
    sourceType: "official",
    tier: "primary",
    summary: "官方重新设计说明：Cephalopod Black 与 Bronze Corydoras 采用更平顺的帽身轮廓和重新设计的笔夹；规格为 151/132 mm、14.5 mm 笔杆、No.6 钢尖和活塞。",
    locator: "reimagined Nautilus description and specifications",
  }),
  blueRinged: web({
    key: "phase251-nautilus-blue-ringed",
    title: "Nahvalur Nautilus The Blue Ringed Ebonite",
    url: "https://nahvalur.com/products/nautilus-the-blue-ringed-ebonite-fountain-pen",
    registryKey: "nahvalur-official-phase251",
    registryName: "Nahvalur official",
    sourceType: "official",
    tier: "contemporary_archive",
    summary: "官方商品页把 The Blue Ringed 标为 2023 DC Pen Show 限量 450 支，使用 German ebonite、蓝色饰件和蓝色 No.6 钢尖。",
    locator: "edition count, material, trim and nib",
  }),
  care: web({
    key: "phase251-nahvalur-care",
    title: "Nahvalur product care and repair",
    url: "https://nahvalur.com/pages/product-care-repair",
    registryKey: "nahvalur-official-phase251",
    registryName: "Nahvalur official",
    sourceType: "official",
    tier: "primary",
    summary: "官方护理与维修入口，作为复杂活塞、密封件和拆解问题应交品牌处理的边界依据。",
    locator: "product care and repair navigation",
  }),
  penChalet: web({
    key: "phase251-nautilus-penchalet",
    title: "Pen Chalet: Nahvalur Nautilus review",
    url: "https://www.penchalet.com/blog/nahvalur-nautilus-fountain-pen-review-the-original-cephalopod-black/",
    registryKey: "pen-chalet-phase251-nautilus",
    registryName: "Pen Chalet",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立评测补充不可后插、ebonite 握持、#6 钢尖线宽样本和三枚墨窗的日常观察。",
    locator: "material, posting, nib and ink-window observations",
  }),
  penAddict: web({
    key: "phase251-nautilus-penaddict",
    title: "The Pen Addict: Mariana Trench Nautilus review",
    url: "https://www.penaddict.com/blog/2023/5/24/nahvalur-nautilus-mariana-trench-limited-edition-fountain-pen-review",
    registryKey: "pen-addict-phase251-nautilus",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立评测记录 Mariana Trench 的蓝绿 ebonite、蓝色 PVD 饰件，并说明活塞、墨量和书写手感延续普通 Nautilus。",
    locator: "Mariana Trench limited color and construction boundary",
  }),
  svg: diagram(
    "phase251-nautilus-svg",
    "Nahvalur Nautilus structure factual diagram",
    "/images/library/site-original/phase251/nahvalur/nautilus.svg",
    "本站原创 factual SVG：表达 ebonite oversize 笔身、三枚舷窗式墨窗、活塞尾旋钮和 No.6 钢尖；非产品照片、非 Logo、非比例图、非颜色校样。",
  ),
} as const;

const inheritedBrand = phase59BenuNahvalurPacks.find(
  (pack) => pack.entityId === PHASE251_NAHVALUR_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 251 Nahvalur brand pack missing.");

const brand: CuratedEntityPack = structuredClone(inheritedBrand);
brand.key = "phase251-nahvalur-brand-v2";
brand.markdownFile = ".planning/content-research/nahvalur-brand-phase251.md";
brand.sources = [...brand.sources, S.series, S.collection, S.silver, S.black, S.blueRinged, S.penChalet, S.penAddict];
brand.scopes = [
  ...brand.scopes.map((scope) => ({
    ...scope,
    editionScope: "品牌别名、Original Plus、Schuylkill、Nautilus 系列导航；具体材料、供墨、尺寸和颜色下沉到型号页。",
  })),
  {
    key: SCOPE,
    scopeKey: SCOPE,
    productionState: "current",
    editionScope: "本条只扩展 Nahvalur 品牌页对 Nautilus 的型号导航，不把 Nautilus Ti 或颜色 SKU 的参数回填到品牌页。",
  },
];
brand.claims = [
  ...brand.claims,
  claim(
    "phase251-nautilus-navigation",
    "brand_model_navigation",
    "Nahvalur 品牌页新增 Nautilus（原 Narwhal）主型号入口；e­bonite 颜色、限定配置和 Nautilus Ti 材料 sibling 仍在型号边界内区分。",
    S.series.key,
    S.series.summary,
    [
      { key: "phase251-nautilus-navigation-collection", sourceKey: S.collection.key, locator: S.collection.summary },
      { key: "phase251-nautilus-navigation-review", sourceKey: S.penChalet.key, locator: S.penChalet.summary },
    ],
  ),
];
brand.timeline = [
  ...(brand.timeline ?? []),
  {
    key: "phase251-nautilus-public-series",
    title: "Nautilus 成为 Nahvalur signature collection",
    eventType: "model_released",
    startDate: "2022",
    circa: true,
    description: "公开系列页和 2022 年前后独立评测均已记录 Nautilus；当前官方页面持续列出 ebonite 与限定色配置。",
    sourceKey: S.series.key,
  },
];

const pen: CuratedEntityPack = {
  key: "phase251-nahvalur-nautilus-v1",
  entityId: PHASE251_NAUTILUS_ID,
  expectedType: "pen",
  expectedSlug: PHASE251_NAUTILUS_SLUG,
  canonicalName: "Nahvalur Nautilus（原 Narwhal）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/nahvalur-nautilus-phase251.md",
  storyTitle: "Nahvalur Nautilus：三枚舷窗墨窗与 ebonite 活塞",
  primarySourceKey: S.silver.key,
  depthTier: "A",
  aliases: [
    { alias: "Nahvalur Nautilus", language: "en", sourceKey: S.series.key },
    { alias: "Narwhal Nautilus", language: "en", sourceKey: S.penChalet.key },
    { alias: "Nautilus Ebonite", language: "en", sourceKey: S.collection.key },
    { alias: "纳瓦尔 Nautilus", language: "zh", sourceKey: S.series.key },
  ],
  sources: [S.series, S.collection, S.silver, S.black, S.blueRinged, S.care, S.penChalet, S.penAddict, S.svg],
  scopes: [{
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "current",
    market: "Nahvalur 官方系列/商品页与公开评测；库存、价格和销售地区随时间变化",
    nibScope: "Nahvalur in-house stainless steel No.6；EF/F/M/B/stub/Double Broad 等按 SKU",
    materialScope: "ebonite 主线；Nautilus Ti 为独立钛合金 sibling，不把其参数回填到本页",
    editionScope: "Nautilus ebonite 主型号、颜色、重新设计配置与限定色；不覆盖 Nautilus Ti 独立型号",
  }],
  claims: [
    claim("phase251-nautilus-identity", "model_identity", "Nahvalur Nautilus 是独立的 oversize ebonite 活塞系列，三枚仿船舷窗墨窗是其稳定识别特征；旧资料的 Narwhal Nautilus 是品牌改名前名称。", S.series.key, S.series.summary, [{ key: "phase251-nautilus-identity-collection", sourceKey: S.collection.key, locator: S.collection.summary }]),
    claim("phase251-nautilus-filling", "filling_system", "Nautilus 使用瓶装墨 piston filling；尾部旋钮驱动活塞，三枚墨窗观察储墨，不能把它写成墨囊/转换器或 Original Plus 的 vacuum filling。", S.silver.key, S.silver.summary, [{ key: "phase251-nautilus-filling-series", sourceKey: S.series.key, locator: S.series.summary }]),
    claim("phase251-nautilus-spec-boundary", "specification_boundary", "官方样本闭帽约 149–151 mm、无帽约 132–133 mm、笔杆约 13–14.5 mm、约 36.85 g；差异来自颜色、饰件和重新设计，不能合并成单一工程值。", S.silver.key, S.silver.summary, [{ key: "phase251-nautilus-spec-black", sourceKey: S.black.key, locator: S.black.summary }]),
    claim("phase251-nautilus-nib", "nib_boundary", "官方商品页列 Nahvalur 自制 No.6 不锈钢尖，尖号按 SKU 可选；独立评测的 Fine 偏湿或线宽偏粗属于样本，不外推为所有尖号的固定调校。", S.silver.key, S.silver.summary, [{ key: "phase251-nautilus-nib-review", sourceKey: S.penChalet.key, locator: S.penChalet.summary }]),
    claim("phase251-nautilus-versions", "version_boundary", "Stylophora、Maylandia、Chelonia、Cephalopod、Bronze 和 Mariana Trench/The Blue Ringed 等是 ebonite 颜色、重新设计或限定配置；Nautilus Ti 是钛合金 sibling，不与 ebonite 主型号合并。", S.collection.key, S.collection.summary, [{ key: "phase251-nautilus-version-blue", sourceKey: S.blueRinged.key, locator: S.blueRinged.summary }, { key: "phase251-nautilus-version-penaddict", sourceKey: S.penAddict.key, locator: S.penAddict.summary }]),
    claim("phase251-nautilus-posting", "handling_boundary", "Nautilus 的笔帽不能安全后插；大尺寸 ebonite 笔体本身提供足够长度和配重，实际握持与笔帽是否后插应分开描述。", S.penChalet.key, S.penChalet.summary, [{ key: "phase251-nautilus-posting-silver", sourceKey: S.silver.key, locator: S.silver.summary }]),
    claim("phase251-nautilus-care", "maintenance_boundary", "换墨以常温清水吸排为主；不要从墨窗插入尖锐工具、用热水或强溶剂处理 ebonite、镀层、螺纹和活塞，阻力异常时交品牌或专业维修。", S.care.key, S.care.summary, [{ key: "phase251-nautilus-care-review", sourceKey: S.penChalet.key, locator: S.penChalet.summary }]),
  ],
  variants: [
    { key: "phase251-nautilus-classic", name: "Stylophora Berry／Maylandia Blue 等经典 ebonite 色", releaseYear: "约 2022 前后公开评测可见", notes: "颜色和树脂纹理是 sibling；不另建相同结构的型号。", sourceKey: S.collection.key, variantKind: "color" },
    { key: "phase251-nautilus-cephalopod", name: "Cephalopod Black／Cephalopod Silver", releaseYear: "现行商品记录", notes: "黑色与银色饰件对应不同商品页；Black 页面另说明重新设计的帽身和笔夹。", sourceKey: S.black.key, variantKind: "market_sku" },
    { key: "phase251-nautilus-mariana", name: "Mariana Trench", releaseYear: "2023", notes: "独立评测记录 450 支、蓝绿 ebonite 和蓝色 PVD 饰件；限定数量不代表所有 Nautilus。", sourceKey: S.penAddict.key, variantKind: "edition_group", productCode: "Mariana Trench" },
    { key: "phase251-nautilus-blue-ringed", name: "The Blue Ringed", releaseYear: "2023", notes: "官方页面记录 DC Pen Show 限量 450 支、German ebonite、蓝色饰件和蓝色 No.6 尖。", sourceKey: S.blueRinged.key, variantKind: "edition_group", productCode: "The Blue Ringed" },
  ],
  spec: {
    brandEntityId: PHASE251_NAHVALUR_BRAND_ID,
    values: {
      series_name: "Nahvalur Nautilus",
      release_year: "约 2022 年前后已有公开系列资料与评测；首发日未在当前官方页固定标明",
      origin_country: "Nahvalur／Narwhal 品牌产品；本页不推断具体工厂",
      nib: "Nahvalur 自制 No.6 不锈钢尖；EF/F/M/B/stub/Double Broad 按 SKU",
      fill_system: "瓶装墨 piston filling；三枚舷窗式墨窗",
      material: "ebonite 主线；饰件和 PVD/电镀随颜色或限定配置变化",
      dimensions: "官方样本闭帽约 149–151 mm、无帽约 132–133 mm；笔杆约 13–14.5 mm",
      weight: "官方样本约 36.85 g；饰件和批次会造成差异",
    },
    evidence: [
      specEvidence("phase251-nautilus-brand", "brand_entity_id", S.series.key, "Nahvalur series maker context"),
      specEvidence("phase251-nautilus-series", "series_name", S.series.key, "Nautilus collection identity"),
      specEvidence("phase251-nautilus-release", "release_year", S.penChalet.key, "2022 review/public-series boundary"),
      specEvidence("phase251-nautilus-origin", "origin_country", S.series.key, "brand/product identity; no factory inference"),
      specEvidence("phase251-nautilus-nib-spec", "nib", S.silver.key, "No.6 stainless steel nib specification"),
      specEvidence("phase251-nautilus-fill-spec", "fill_system", S.silver.key, "piston filling and bottled ink"),
      specEvidence("phase251-nautilus-material", "material", S.silver.key, "ebonite material specification"),
      specEvidence("phase251-nautilus-dimensions", "dimensions", S.silver.key, "149/133 mm and barrel/grip measurements"),
      specEvidence("phase251-nautilus-weight", "weight", S.silver.key, "36.85 g sample specification"),
    ],
  },
  media: [{
    key: "phase251-nautilus-media",
    title: "Nahvalur Nautilus 三墨窗与活塞事实图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、包装或零件兼容性。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [{
    key: "phase251-nautilus-release-event",
    title: "Nautilus 进入 Nahvalur 公开系列资料",
    eventType: "model_released",
    startDate: "2022",
    circa: true,
    description: "官方系列页与 2022 年前后独立评测均记录 Nautilus；当前集合页持续列出 ebonite 与限定配置。",
    sourceKey: S.series.key,
  }],
};

export const phase251NahvalurNautilusPacks: CuratedEntityPack[] = [brand, pen];
