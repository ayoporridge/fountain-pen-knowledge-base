import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import {
  PHASE60_CUSTOM_912_ID,
  PHASE60_PILOT_BRAND_ID,
  phase60PilotP0Packs,
} from "./phase60-pilot-p0";

export const PHASE409_912_ID = PHASE60_CUSTOM_912_ID;
export const PHASE409_PILOT_ID = PHASE60_PILOT_BRAND_ID;
export const PHASE409_912_SLUG = "pilot-custom-heritage-912";

const RETRIEVED = "2026-08-03";
const SCOPE = "phase409-pilot-custom-heritage-912-current";

const base = phase60PilotP0Packs.find(
  (pack) => pack.entityId === PHASE409_912_ID && pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 409 Pilot Custom Heritage 912 prerequisite missing.");

function source(input: {
  key: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup: string;
  title: string;
  url: string;
  homepageUrl: string;
  summary: string;
  itemType?: string;
  author?: string;
  allowedUse?: CuratedSource["allowedUse"];
  license?: string;
}): CuratedSource {
  const siteOriginal = input.sourceType === "user_submission";
  return {
    ...input,
    itemType: input.itemType ?? (siteOriginal ? "image" : "web_page"),
    author: input.author ?? input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: input.allowedUse ?? (siteOriginal ? "store_full" : "summary_only"),
    archiveUrl: input.url,
    archiveLocator: siteOriginal
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

const baseSource = (key: string): CuratedSource => {
  const found = base.sources.find((item) => item.key === key);
  if (!found) throw new Error(`Phase 409 Pilot source ${key} is missing.`);
  return found;
};

const S = {
  exact: source({
    key: "phase409-pilot-912-exact-current",
    registryKey: "pilot-webcatalog-912-exact-phase409",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-912-exact-phase409",
    title: "FKVH2MR-BF｜Custom Heritage 912｜PILOT Web Catalog",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000377&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary:
      "当前 exact card 列 FKVH2MR-BF、黑色、14K No.10 F、螺纹嵌合、树脂轴帽、CON-40/CON-70N、随附 CON-70N、140 mm、φ15.7 mm、20 g 与 15 个尖号入口。",
  }),
  lineup: baseSource("phase60-pilot-heritage-lineup"),
  history: baseSource("phase60-pilot-custom-history"),
  support: source({
    key: "phase409-pilot-912-support",
    registryKey: "pilot-support-912-phase409",
    registryName: "PILOT official support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-support-912-phase409",
    title: "Custom Heritage 912 官方支持与维护",
    url: "https://www.pilot.co.jp/support/warranty/jp/fountain/custom_heritage912.html",
    homepageUrl: "https://www.pilot.co.jp/support/warranty/",
    summary:
      "官方支持页确认 FKVH-2MR、墨囊、CON-40、清水吸排、首部清洗、气压、溶剂与不可自行维修边界。",
  }),
  manual: source({
    key: "phase409-pilot-fountain-manual",
    registryKey: "pilot-fountain-manual-912-phase409",
    registryName: "PILOT official manual",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-fountain-manual-912-phase409",
    title: "PILOT 万年筆使用说明书（日文 PDF）",
    url: "https://www.pilot.co.jp/support/manual/fountain/fountain_jp.pdf",
    homepageUrl: "https://www.pilot.co.jp/support/manual/",
    itemType: "pdf",
    summary: "通用说明补充墨囊、转换器、清水吸排和保存步骤；912 专属维护以支持页为准。",
  }),
  category: source({
    key: "phase409-pilot-fountain-category",
    registryKey: "pilot-webcatalog-fountain-category-912-phase409",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-fountain-category-912-phase409",
    title: "PILOT Web Catalog 万年笔分类与 Custom Heritage 912 入口",
    url: "https://webcatalog.pilot.co.jp/products/DispCate.do?category=%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E4%B8%87%E5%B9%B4%E7%AD%86&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary: "官方分类把 Custom Heritage 912 与 742、743、823、845、Capless 等作为不同产品入口。",
  }),
  warranty: source({
    key: "phase409-pilot-912-warranty",
    registryKey: "pilot-international-warranty-912-phase409",
    registryName: "PILOT international warranty",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-international-warranty-912-phase409",
    title: "CUSTOM HERITAGE 912｜PILOT International Warranty",
    url: "https://www.pilot.co.jp/support/warranty/en/fountain/custom_heritage912.html",
    homepageUrl: "https://www.pilot.co.jp/support/warranty/",
    summary: "国际页把 FKVH-2MR 与 FKVH-2000R 列为 912 的地区代码语境，并提供同类维护警告。",
  }),
  price: source({
    key: "phase409-pilot-912-price-list",
    registryKey: "pilot-price-list-912-phase409",
    registryName: "PILOT official price list",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-price-list-912-phase409",
    title: "PILOT 2026 年 7 月万年笔价格表",
    url: "https://www.pilot.co.jp/information/pricelist_202607.pdf",
    homepageUrl: "https://www.pilot.co.jp/information/",
    itemType: "pdf",
    summary: "官方价格表列 Custom Heritage 912 基础品番 FKVH2MR，含税建议价 ¥49,500；价格为日本时间快照。",
  }),
  professional: baseSource("phase60-pilot-professional-review"),
  diagram: baseSource("phase60-pilot-912-svg"),
} satisfies Record<string, CuratedSource>;

function claim(
  key: string,
  predicate: string,
  objectText: string,
  primary: CuratedSource,
  locator: string,
  extra: CuratedSource[] = [],
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.99 : 0.94,
    sourceKey: primary.key,
    locator,
    evidence: [primary, ...extra].map((item, index) => ({
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
  sourceItem: CuratedSource,
  scopeKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey: sourceItem.key, scopeKey, locator, qualifies: true };
}

const nibs = [
  ["EF", "FKVH2MR-BEF", "Extra Fine"],
  ["F", "FKVH2MR-BF", "Fine"],
  ["SF", "FKVH2MR-BSF", "Soft Fine"],
  ["FM", "FKVH2MR-BFM", "Fine Medium"],
  ["SFM", "FKVH2MR-BSFM", "Soft Fine Medium"],
  ["M", "FKVH2MR-BM", "Medium"],
  ["SM", "FKVH2MR-BSM", "Soft Medium"],
  ["B", "FKVH2MR-BB", "Broad"],
  ["BB", "FKVH2MR-BBB", "Double Broad"],
  ["PO", "FKVH2MR-BPO", "Posting"],
  ["FA", "FKVH2MR-BFA", "Falcon"],
  ["WA", "FKVH2MR-BWA", "Waverly"],
  ["SU", "FKVH2MR-BSU", "Stub"],
  ["C", "FKVH2MR-BC", "Calligraphy"],
  ["MS", "FKVH2MR-BMS", "Music"],
] as const;

const variants: CuratedVariant[] = [
  {
    key: "phase409-912-edition",
    name: "Custom Heritage 912 FKVH2MR 黑色 No.10 组",
    productCode: "FKVH2MR",
    releaseYear: "现行目录",
    notes: "912 是型号；黑色、No.10 和 15 个官方尖号入口下沉为 edition/market SKU，不把 PO/FA 等拆成独立实体。",
    sourceKey: S.exact.key,
    variantKind: "edition_group",
    market: "Pilot Japan",
  },
  ...nibs.map(([nib, productCode, english]) => ({
    key: `phase409-912-${nib.toLowerCase()}`,
    name: `${productCode} ${english} ${nib}`,
    productCode,
    releaseYear: "现行目录 lineup",
    notes: `官方 912 页面列出的 ${nib} 尖号入口；实际线宽、库存和后配/调磨状态须按实物核对。`,
    sourceKey: S.exact.key,
    variantKind: "market_sku" as const,
    parentVariantKey: "phase409-912-edition",
    market: "Pilot Japan",
  })),
];

const pack: CuratedEntityPack = {
  ...structuredClone(base),
  key: "phase409-pilot-custom-heritage-912-refresh-v1",
  entityId: PHASE409_912_ID,
  expectedSlug: PHASE409_912_SLUG,
  canonicalName: "百乐 Pilot Custom Heritage 912",
  markdownFile: ".planning/content-research/pilot-custom-heritage-912-phase409.md",
  storyTitle: "Pilot Custom Heritage 912：FKVH2MR、No.10 与 15 个尖型入口",
  primarySourceKey: S.exact.key,
  depthTier: "A",
  aliases: [
    { alias: "Pilot Custom Heritage 912", language: "en", sourceKey: S.exact.key },
    { alias: "PILOT CUSTOM HERITAGE 912", language: "en", sourceKey: S.lineup.key },
    { alias: "百乐 912", language: "zh", sourceKey: S.exact.key },
    { alias: "百乐 Custom 912", language: "zh", sourceKey: S.exact.key },
    { alias: "FKVH-2MR", language: "en", kind: "alias", sourceKey: S.warranty.key },
    { alias: "FKVH-2000R", language: "en", kind: "regional_name", market: "Pilot international", sourceKey: S.warranty.key },
  ],
  sources: [
    ...base.sources,
    S.exact,
    S.support,
    S.manual,
    S.category,
    S.warranty,
    S.price,
  ].filter((item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Pilot Japan current FKVH2MR-BF card with official 15-nib lineup and support",
      nibScope: "14K No.10；EF/F/SF/FM/SFM/M/SM/B/BB/PO/FA/WA/SU/C/MS",
      materialScope: "当前 F 尖 SKU：黑色树脂轴帽、铑饰面、银色调饰件；其他市场/限定色另记",
      editionScope: "Custom Heritage 912 FKVH-2MR；不吸收 Custom 742、743、823、845、URUSHI 或 Capless",
    },
    {
      key: `${SCOPE}-commercial`,
      scopeKey: `${SCOPE}-commercial`,
      productionState: "unknown",
      editionScope: "日本当前 FKVH2MR-BF：含税 ¥49,500；税前 ¥45,000；不外推其他市场或二手价格",
    },
  ],
  claims: [
    claim(
      "phase409-912-identity",
      "model_identity",
      "Custom Heritage 912 是 Pilot 的 FKVH-2MR/FKVH2MR 黑色扁平顶 c/c 型号；当前 FKVH2MR-BF 是 F 尖 market SKU，PO、FA、WA、SU 等仍是同一实体的官方尖号入口。",
      S.exact,
      "exact title, FKVH2MR-BF code and official lineup",
      [S.lineup, S.warranty, S.category],
    ),
    claim(
      "phase409-912-nibs",
      "nib_variants",
      "日本官方页面列出 15 个尖号入口：EF、F、SF、FM、SFM、M、SM、B、BB、PO、FA、WA、SU、C、MS；它们是 nib option，不是 15 个型号。",
      S.exact,
      "official 15-nib lineup links and code list",
      [S.lineup, S.professional],
    ),
    claim(
      "phase409-912-material",
      "material_finish",
      "当前 FKVH2MR-BF 的轴与笔帽为树脂，颜色为黑色，笔尖为铑饰面；扁平顶与银色调夹/金轮是外观语境，不能单独证明年份或真伪。",
      S.exact,
      "official resin, black and rhodium-finish fields",
      [S.history],
    ),
    claim(
      "phase409-912-mechanism",
      "mechanism",
      "912 采用螺纹嵌合帽与 cartridge/converter 供墨，不是 Custom 823 的真空柱塞，也不是 Capless 的伸缩笔尖；共享 Pilot converter 不消除型号边界。",
      S.exact,
      "screw-fit method and converter fields",
      [S.warranty, S.professional],
    ),
    claim(
      "phase409-912-fill",
      "filling_system",
      "Pilot 官方支持墨囊、CON-40 与 CON-70N；当前日本 F 尖商品卡随附 CON-70N。包装随附与兼容列表是两个字段，二手缺件需另记。",
      S.exact,
      "CON-40/CON-70N and included converter fields",
      [S.support, S.manual],
    ),
    claim(
      "phase409-912-physical",
      "physical_specification",
      "当前 FKVH2MR-BF 商品卡列最大径 φ15.7 mm、全长 140 mm、重量 20 g、使用盒 Z-CR-N3；数字绑定日本黑色 F SKU。",
      S.exact,
      "official dimensions, weight and case table",
    ),
    claim(
      "phase409-912-price",
      "commercial_snapshot",
      "当前日本 exact 商品卡和 2026 年 7 月官方价格表显示含税 ¥49,500、税前 ¥45,000；不能写成全球固定成交价。",
      S.price,
      "official price list and exact-card tax scope",
      [S.exact],
    ),
    claim(
      "phase409-912-care",
      "maintenance_boundary",
      "长期停用前排墨并清水吸排，避免热水、酒精等溶剂、航空气压、强冲击和自行维修；可按支持页清洗笔首，但不要整体浸洗笔帽和笔轴。",
      S.support,
      "official cleaning, storage, solvent, air-pressure and repair warnings",
      [S.manual],
    ),
    claim(
      "phase409-912-siblings",
      "version_boundary",
      "912 与 Custom 742、743、823、845、URUSHI、Heritage 91/92、Capless 和历史/限定版本相邻但身份独立；共享 No.10 或 converter 不能合并实体。",
      S.category,
      "official category and international product-route separation",
      [S.warranty, S.history, S.lineup],
    ),
    claim(
      "phase409-912-selection",
      "selection_guidance",
      "选购先核对 FKVH2MR 完整后缀、实际尖号、No.10、CON-40/CON-70N、140 mm/20 g 的日本 F SKU 作用域和笔况，再按纸张试写；不要用“912 FA”替代产品号证据。",
      S.exact,
      "exact SKU, nib and current lineup verification",
      [S.professional],
      "editorial",
    ),
    claim(
      "phase409-912-media",
      "media_identity_boundary",
      "本站主图是原创 factual SVG，明确非产品照片，只表达型号先于 PO/FA/WA/SU 尖型与 c/c 导航，不代表真实比例、颜色、刻字、真伪或库存。",
      S.diagram,
      "site-original SVG attribution and non-product-photo boundary",
      [],
      "editorial",
    ),
  ],
  variants,
  spec: {
    brandEntityId: PHASE409_PILOT_ID,
    values: {
      series_name: "Pilot Custom Heritage 912 / FKVH2MR",
      release_year: "现行产品线；限定/历史时间按专属来源另记",
      origin_country: "日本 Pilot 产品线；地区代码与制造标记按实物核对",
      nib: "14K No.10；当前 FKVH2MR-BF 为 F，官方同页共列 15 个尖号",
      fill_system: "Pilot 墨囊、CON-40 或 CON-70N；当前日本 F 卡随附 CON-70N",
      material: "当前 FKVH2MR-BF：黑色树脂轴帽；铑饰面；银色调夹/金轮语境",
      dimensions: "当前 FKVH2MR-BF：全长 140 mm；最大径 φ15.7 mm",
      weight: "当前 FKVH2MR-BF：20 g",
      price_range: "当前日本 exact 商品卡：含税 ¥49,500；税前 ¥45,000",
      status: "当前 FKVH2MR-BF 与同一 lineup 的 15 种官方尖号；地区供应需另核",
    },
    evidence: [
      specEvidence("phase409-912-spec-brand", "brand_entity_id", S.exact, SCOPE, "Pilot maker context"),
      specEvidence("phase409-912-spec-series", "series_name", S.exact, SCOPE, "Custom Heritage 912 and FKVH2MR title"),
      specEvidence("phase409-912-spec-release", "release_year", S.lineup, SCOPE, "current Heritage lineup context"),
      specEvidence("phase409-912-spec-origin", "origin_country", S.category, SCOPE, "Pilot Japan catalogue context"),
      specEvidence("phase409-912-spec-nib", "nib", S.exact, SCOPE, "14K No.10 F and 15-nib lineup"),
      specEvidence("phase409-912-spec-fill", "fill_system", S.exact, SCOPE, "CON-40, CON-70N and included converter"),
      specEvidence("phase409-912-spec-material", "material", S.exact, SCOPE, "resin barrel/cap and rhodium nib"),
      specEvidence("phase409-912-spec-dimensions", "dimensions", S.exact, SCOPE, "140 mm and φ15.7 mm"),
      specEvidence("phase409-912-spec-weight", "weight", S.exact, SCOPE, "20 g"),
      specEvidence("phase409-912-spec-price", "price_range", S.price, `${SCOPE}-commercial`, "official ¥49,500 price snapshot"),
      specEvidence("phase409-912-spec-status", "status", S.exact, SCOPE, "FKVH2MR-BF and 15-nib lineup"),
    ],
  },
  media: [
    {
      key: "phase409-pilot-912-primary-svg",
      title: "Pilot Custom Heritage 912 事实示意图（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: S.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不表现真实比例、颜色、Logo 或刻字。",
      sourceUrl: S.diagram.url,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "phase409-912-current-listing",
      title: "FKVH2MR-BF 当前日本目录列出 No.10 F 与十五种尖号",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "当前 exact page 展示黑色 F、14K No.10、140 mm、20 g、CON-70N 随附与 15 个尖号入口。",
      sourceKey: S.exact.key,
    },
    {
      key: "phase409-912-price",
      title: "FKVH2MR-BF 当前日本商品卡建议价",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "当前商品卡和 2026 年 7 月官方价格表显示含税 ¥49,500；未来价格按日期追加。",
      sourceKey: S.price.key,
    },
  ],
  conflicts: [],
};

export const phase409PilotCustomHeritage912RefreshPacks: CuratedEntityPack[] = [pack];
