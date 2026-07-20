import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE31_PRO_GEAR_ID,
  PHASE31_SAILOR_BRAND_ID,
  phase31SailorP0Packs,
} from "./phase31-sailor-p0";

export const PHASE76_SAILOR_BRAND_ID = PHASE31_SAILOR_BRAND_ID;
export const PHASE76_PROFESSIONAL_GEAR_ID = PHASE31_PRO_GEAR_ID;
export const PHASE76_PROFESSIONAL_GEAR_SLUG = "sailor-pro-gear";

const RETRIEVED = "2026-07-20";

function source(input: {
  key: string;
  title: string;
  url: string;
  tier?: CuratedSource["tier"];
  sourceType?: CuratedSource["sourceType"];
  independenceGroup?: string;
  registryKey?: string;
  registryName?: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey ?? "sailor-official-phase76",
    registryName: input.registryName ?? "The Sailor Pen Co., Ltd.",
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.independenceGroup ?? "sailor-official",
    title: input.title,
    url: input.url,
    homepageUrl: "https://sailor.co.jp/",
    author: input.sourceType === "retailer" ? "Pen Chalet" : "セーラー万年筆株式会社",
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: [
      "live-source-not-frozen",
      `retrieved=${RETRIEVED}`,
      "external_archive=false",
      "raw_source_stored=false",
      `locator=${input.locator}`,
    ].join(";"),
  };
}

function factualSvg(): CuratedSource {
  const url =
    "/images/library/site-original/sailor-professional-gear/sailor-professional-gear-21k-regular.svg";
  return {
    key: "phase76-pro-gear-factual-svg",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "Sailor Professional Gear 常规 21K 规格示意图",
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "本站原创 factual SVG；示意图，非产品照片。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: url,
    archiveLocator:
      `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;anchor-trademark=false;engraving=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const SOURCES = {
  gold: source({
    key: "phase76-pro-gear-gold-11-2036",
    title: "プロフェッショナルギア 金 万年筆 — 11-2036",
    url: "https://sailor.co.jp/product/11-2036/",
    summary:
      "日本官网当前常规金色饰件款：11-2036、21K 大型双色笔尖、PMMA、墨囊／转换器两用、Gold IP、φ18×129 mm、21.6 g 与 EF 至 MS 的商品代码。",
    locator:
      "11-2036 item-code list; 21K large bicolor nib; PMMA; converter/cartridge; Gold IP; dimensions and weight",
  }),
  silver: source({
    key: "phase76-pro-gear-silver-11-2037",
    title: "プロフェッショナルギア 銀 万年筆 — 11-2037",
    url: "https://sailor.co.jp/product/11-2037/",
    summary:
      "日本官网当前常规银色饰件款：11-2037 与 11-2036 共享 21K 大型双色笔尖、PMMA、尺寸、重量和供墨；金属部件为 nickel chrome plating。",
    locator:
      "11-2037 item-code list; shared basic specifications; nickel chrome plating field",
  }),
  series: source({
    key: "phase76-pro-gear-series",
    title: "Professional Gear Series",
    url: "https://en.sailor.co.jp/topics/professional-gear-series/",
    summary:
      "Sailor 英文系列介绍把常规 Professional Gear、Slim、Realo 与 King 分列；它仅用于家族导航，具体当前规格仍以日本单品页为准。",
    locator:
      "series-member navigation separating Professional Gear, Slim, Realo and King models",
  }),
  goldIp: source({
    key: "phase76-pro-gear-gold-ip-change",
    title: "金色金属部件の仕様変更のお知らせ",
    url: "https://sailor.co.jp/important_news/20240801/",
    summary:
      "2024-08-01 官方公告说明部分金色金属件从旧金镀层切换为 Gold IP，11-2036 在对象之列，并允许新旧库存过渡并存。",
    locator:
      "11-2036 listed in Gold IP specification-change notice; old and new stock transition caveat",
  }),
  slim: source({
    key: "phase76-pro-gear-slim-11-1221",
    title: "プロフェッショナルギア スリム 金 万年筆 — 11-1221",
    url: "https://sailor.co.jp/product/11-1221/",
    summary:
      "Slim 11-1221 是 14K 中型笔尖、φ17×124 mm、16.8 g 的独立较小笔形；不能以平顶外观或家族名称并进常规全尺寸 11-2036／11-2037。",
    locator: "14K medium nib, 124 mm and 16.8 g fields for Slim identity boundary",
  }),
  slim21: source({
    key: "phase76-pro-gear-slim-21-11-2151",
    title: "プロフェッショナルギア スリム 21 金 万年筆 — 11-2151",
    url: "https://sailor.co.jp/product/11-2151/",
    summary:
      "2026 年的 Slim 21 11-2151 虽改用 21K 中型笔尖，仍为 124 mm、16.8 g 的 Slim 笔形，不是常规全尺寸款的金尖变体。",
    locator: "21K medium nib, 124 mm and 16.8 g fields for Slim 21 boundary",
  }),
  realo: source({
    key: "phase76-pro-gear-realo-11-3926",
    title: "プロフェッショナルギア レアロ万年筆 — 11-3926",
    url: "https://sailor.co.jp/product/11-3926/",
    summary:
      "Professional Gear Realo 11-3926 是独立的尾栓回转吸墨机型，约 1 cc、135 mm、21.0 g；不能把其储墨或填墨方式写进常规墨囊／转换器款。",
    locator: "21K large nib, piston mechanism, approximately 1 cc, 135 mm and 21.0 g fields",
  }),
  refill: source({
    key: "phase76-sailor-refill",
    title: "万年筆のインク補充方法",
    url: "https://sailor.co.jp/topics/fountain-pen-refill-ink/",
    summary:
      "Sailor 官方说明自家墨囊与转换器的安装、吸墨步骤，并将 Realo 的尾栓吸墨步骤单列，支持两类供墨方式不可混写。",
    locator:
      "cartridge/converter installation and refill steps; separate Realo tail-knob filling section",
  }),
  nib: source({
    key: "phase76-sailor-nib-types",
    title: "ペン先の種類と特長",
    url: "https://sailor.co.jp/topics/fountain-pen-type/",
    summary:
      "Sailor 官方将 EF 至 B、Zoom、Music 的用途与线条特征分开说明，并把 21K 的材料说明与任何单笔必然软硬结论区分。",
    locator: "EF-B, Zoom and Music sections plus 21K material explanation",
  }),
  retailer: source({
    key: "phase76-pro-gear-penchalet",
    title: "Sailor Professional Gear Fountain Pen Review",
    url: "https://www.penchalet.com/reviews/sailor_professional_gear_fountain_pen_review.html",
    tier: "professional_secondary",
    sourceType: "retailer",
    registryKey: "penchalet",
    registryName: "Pen Chalet",
    independenceGroup: "penchalet-retailer",
    summary:
      "独立零售商评测将常规全尺寸 21K、Slim 14K、约 129 mm 合盖与约 149 mm 套帽长度作为不同产品层级说明；仅作尺寸与家族边界交叉核对。",
    locator:
      "review comparison of full-size 21K Professional Gear and 14K Slim; posted-length cross-check",
  }),
  diagram: factualSvg(),
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

const brandPack = phase31SailorP0Packs.find(
  (pack) => pack.expectedType === "brand" && pack.entityId === PHASE76_SAILOR_BRAND_ID,
);

if (!brandPack) {
  throw new Error("Phase 76 cannot resolve the published Sailor brand pack.");
}

const scopeKey = "phase76-sailor-pro-gear-regular-21k-current";

const professionalGearPack: CuratedEntityPack = {
  key: "phase76-sailor-professional-gear-regular-21k-v1",
  entityId: PHASE76_PROFESSIONAL_GEAR_ID,
  expectedType: "pen",
  expectedSlug: PHASE76_PROFESSIONAL_GEAR_SLUG,
  canonicalName: "Sailor Professional Gear（全尺寸常规 21K）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/sailor-professional-gear-regular-21k-phase76.md",
  storyTitle: "Sailor Professional Gear：常规全尺寸 21K，不把 Slim 与 Realo 叠成一个型号",
  primarySourceKey: SOURCES.gold.key,
  depthTier: "A",
  aliases: [
    { alias: "Sailor Professional Gear", language: "en", sourceKey: SOURCES.gold.key },
    { alias: "Sailor Pro Gear", language: "en", sourceKey: SOURCES.gold.key },
    { alias: "プロフェッショナルギア", language: "ja", sourceKey: SOURCES.gold.key },
    { alias: "写乐 Professional Gear 全尺寸", language: "zh", sourceKey: SOURCES.gold.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    {
      key: scopeKey,
      scopeKey,
      market: "日本",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "21K large bicolor EF/F/MF/M/B/Z/MS",
      materialScope: "Black PMMA; Gold IP or nickel chrome trim",
      editionScope:
        "11-2036 Gold IP and 11-2037 nickel chrome regular full-size only; excludes Slim, Slim 21, Realo, King, Anchor, limited colours and special-nib concepts.",
    },
    {
      key: "phase76-pro-gear-2024-transition",
      scopeKey: "sailor-11-2036-gold-ip-transition-2024",
      validFrom: "2024-08-01",
      productionState: "current",
      editionScope: "Gold trim process transition only; does not date every second-hand example.",
    },
  ],
  claims: [
    {
      key: "phase76-pro-gear-identity",
      predicate: "model_identity",
      objectText:
        "本页只对应常规全尺寸 Professional Gear：11-2036 Gold IP 与 11-2037 nickel chrome 两种饰件变体，共用黑色 PMMA、21K 大型双色笔尖、卡水／转换器两用、φ18×129 mm 与 21.6 g。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: SOURCES.gold.key,
      locator: SOURCES.gold.summary,
      evidence: [
        { key: "phase76-pro-gear-gold-identity", sourceKey: SOURCES.gold.key, scopeKey, locator: SOURCES.gold.summary },
        { key: "phase76-pro-gear-silver-identity", sourceKey: SOURCES.silver.key, scopeKey, locator: SOURCES.silver.summary },
        { key: "phase76-pro-gear-secondary-boundary", sourceKey: SOURCES.retailer.key, scopeKey, locator: SOURCES.retailer.summary },
      ],
    },
    {
      key: "phase76-pro-gear-family-boundary",
      predicate: "model_boundary",
      objectText:
        "Slim、Slim 21 与 Realo 都是独立型号：Slim 类为 124 mm、16.8 g 的中型笔尖平台，Realo 是尾栓回转吸墨结构；King、Anchor、限定配色与长刀研等也不被并入本常规全尺寸词条。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: SOURCES.series.key,
      locator: SOURCES.series.summary,
      evidence: [
        { key: "phase76-pro-gear-slim-boundary", sourceKey: SOURCES.slim.key, scopeKey, locator: SOURCES.slim.summary },
        { key: "phase76-pro-gear-slim21-boundary", sourceKey: SOURCES.slim21.key, scopeKey, locator: SOURCES.slim21.summary },
        { key: "phase76-pro-gear-realo-boundary", sourceKey: SOURCES.realo.key, scopeKey, locator: SOURCES.realo.summary },
      ],
    },
    {
      key: "phase76-pro-gear-gold-ip-transition",
      predicate: "trim_process_boundary",
      objectText:
        "2024 年后 11-2036 的金色件采用 Gold IP；官方公告同时提示旧金镀层库存可能并存，因此二手照片中的金色件不足以单独断定生产年份或工艺。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: SOURCES.goldIp.key,
      locator: SOURCES.goldIp.summary,
      evidence: [{ key: "phase76-pro-gear-gold-ip-evidence", sourceKey: SOURCES.goldIp.key, scopeKey: "phase76-pro-gear-2024-transition", locator: SOURCES.goldIp.summary }],
    },
    {
      key: "phase76-pro-gear-care",
      predicate: "maintenance_boundary",
      objectText:
        "常规款使用 Sailor 规格卡水或转换器；换色、久置或出墨异常时按官方卡水／转换器流程清洗，不能把 Realo 的尾栓回转吸墨步骤套用到本型号。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: SOURCES.refill.key,
      locator: SOURCES.refill.summary,
      evidence: [{ key: "phase76-pro-gear-refill-evidence", sourceKey: SOURCES.refill.key, scopeKey, locator: SOURCES.refill.summary }],
    },
  ],
  variants: [
    {
      key: "phase76-pro-gear-gold-11-2036",
      name: "Black Gold Trim（11-2036）",
      notes: "常规全尺寸金色件变体；现行字段为 Gold IP。EF/F/MF/M/B/Z/MS 对应商品尾码 120/220/320/420/620/720/920。",
      sourceKey: SOURCES.gold.key,
      variantKind: "market_sku",
      productCode: "11-2036-120/220/320/420/620/720/920",
      market: "日本",
    },
    {
      key: "phase76-pro-gear-silver-11-2037",
      name: "Black Silver Trim（11-2037）",
      notes: "常规全尺寸银色件变体；金属部件为 nickel chrome plating，其他主规格与 11-2036 共享。",
      sourceKey: SOURCES.silver.key,
      variantKind: "market_sku",
      productCode: "11-2037-120/220/320/420/620/720/920",
      market: "日本",
    },
  ],
  spec: {
    brandEntityId: PHASE76_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor Professional Gear 常规全尺寸 21K（11-2036／11-2037）",
      release_year: "Professional Gear 家族起点与当前 SKU 首发年份需分开核对；本页不以家族年份替代商品代码发布日期",
      nib: "21K 大型双色金尖；EF、F、MF、M、B、Z、MS",
      fill_system: "Sailor 专用卡水／转换器两用；不是 Realo 尾栓回转吸墨",
      material: "黑色 PMMA；11-2036 为 Gold IP，11-2037 为 nickel chrome plating",
      dimensions: "最大径 φ18 mm × 全长 129 mm（含笔夹）；零售资料约 149 mm 为套帽长度的辅助口径",
      weight: "21.6 g（日本官网常规款口径）",
      status: "日本官网当前常规全尺寸款；11-2036 与 11-2037 是饰件变体，不含 Slim、Realo、King、Anchor 或限定版",
    },
    evidence: [
      evidence("brand_entity_id", "phase76-pro-gear-brand", SOURCES.gold.key, scopeKey, "official Sailor maker context"),
      evidence("series_name", "phase76-pro-gear-series", SOURCES.series.key, scopeKey, "official Professional Gear series boundary"),
      evidence("release_year", "phase76-pro-gear-release-year-boundary", SOURCES.series.key, scopeKey, "series history is not claimed as SKU launch date"),
      evidence("nib", "phase76-pro-gear-nib", SOURCES.gold.key, scopeKey, "21K large bicolor nib and item-code list"),
      evidence("fill_system", "phase76-pro-gear-fill", SOURCES.refill.key, scopeKey, "official cartridge/converter refill instructions"),
      evidence("material", "phase76-pro-gear-material-gold", SOURCES.gold.key, scopeKey, "PMMA and Gold IP"),
      evidence("material", "phase76-pro-gear-material-silver", SOURCES.silver.key, scopeKey, "PMMA and nickel chrome plating"),
      evidence("dimensions", "phase76-pro-gear-dimensions", SOURCES.gold.key, scopeKey, "official 129 mm / phi 18 mm"),
      evidence("dimensions", "phase76-pro-gear-posted-length", SOURCES.retailer.key, scopeKey, "retailer 149 mm posted-length cross-check"),
      evidence("weight", "phase76-pro-gear-weight", SOURCES.gold.key, scopeKey, "official 21.6 g"),
      evidence("status", "phase76-pro-gear-status", SOURCES.silver.key, scopeKey, "current 11-2037 product page"),
    ],
  },
  media: [
    {
      key: "phase76-pro-gear-factual-media",
      title: "Sailor Professional Gear 常规全尺寸 21K 规格示意图（非产品照片）",
      sourceKey: SOURCES.diagram.key,
      localPath: SOURCES.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、树脂纹理、Logo、笔尖刻字、饰件工艺、库存、生产批次或实际墨量。",
      sourceUrl: SOURCES.diagram.url,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "phase76-pro-gear-2024-gold-ip",
      title: "11-2036 金色件转为 Gold IP 的公告窗口",
      eventType: "design_milestone",
      startDate: "2024-08-01",
      circa: false,
      description: "官方公告将 11-2036 列入 Gold IP 工艺变更对象；新旧库存可以并存，公告不能反向判定每一支二手笔的生产时间。",
      sourceKey: SOURCES.goldIp.key,
    },
  ],
};

export const phase76SailorProfessionalGearPacks: CuratedEntityPack[] = [
  brandPack,
  professionalGearPack,
];
