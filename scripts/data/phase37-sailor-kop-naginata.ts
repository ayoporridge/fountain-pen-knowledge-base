import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";
import { phase31SailorP0Packs } from "./phase31-sailor-p0";

export const PHASE37_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE37_KOP_ID = "lrpwJxiOfNNR";
export const PHASE37_NAGINATA_ID = "sDaEy32aebxE";

const RETRIEVED = "2026-07-19";

function official(input: { key: string; title: string; url: string; summary: string; locator: string }): CuratedSource {
  return {
    key: input.key,
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: input.title,
    url: input.url,
    homepageUrl: "https://sailor.co.jp/",
    author: "セーラー万年筆株式会社",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function secondary(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; summary: string; locator: string }): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: "professional_secondary",
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.url,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

const officialKop = official({
  key: "phase37-sailor-kop-official",
  title: "Sailor King of Pens 官方专题",
  url: "https://en.sailor.co.jp/topics/king-of-pens/",
  summary: "官方专题把 KOP 分成 Ebonite、Urushi、ST Resin 三条材料路线，并列出各自货号、尖号与上墨方式。",
  locator: "KOP Ebonite, KOP Urushi and KOP ST (Resin) sections; item codes, material and converter/cartridge fields",
});
const sources = {
  officialKop,
  kingProfit: official({
    key: "phase37-sailor-king-profit",
    title: "KING PROFIT（キング プロフィット）11-7002",
    url: "https://sailor.co.jp/product/11-7002/",
    summary: "日本官网把 11-7002 称为 KING PROFIT 系列，并给出大型 21K 尖、硬橡胶与两用式规格。",
    locator: "KING PROFIT series heading; 11-7002 item-code group; 21K nib and filling fields",
  }),
  kai: official({
    key: "phase37-sailor-kop-kai",
    title: "King of Pens Kai 10-9962",
    url: "https://en.sailor.co.jp/product/10-9962/",
    summary: "英文官网将 KOP Kai 单列为 10-9962，记录硬橡胶、21K 镀铑尖、两用式、153.5 mm 和 32.8 g。",
    locator: "10-9962 title; rhodium-plated 21K nib; ebonite; converter/cartridge; 153.5 mm and 32.8 g",
  }),
  proGearKop: official({
    key: "phase37-sailor-pro-gear-kop",
    title: "Professional Gear KOP 10-9618",
    url: "https://en.sailor.co.jp/product/10-9618/",
    summary: "官网将平顶 Professional Gear KOP 作为 10-9618 独立产品，不与鱼雷形 KING PROFIT 合并。",
    locator: "Professional Gear KOP product title and 10-9618 product identity",
  }),
  specialNib: official({
    key: "phase37-sailor-special-nib",
    title: "Sailor 特殊笔尖与长刀研说明",
    url: "https://sailor.co.jp/topics/fountain-pen-type/",
    summary: "官方特殊尖页面把长刀研列为 nib 类型，说明线宽随书写角度变化及汉字书写用途。",
    locator: "special nib section; Naginata-Togi described as a nib and angle-dependent line-width behavior",
  }),
  naginataPen: official({
    key: "phase37-sailor-naginata-pen",
    title: "长刀研搭载笔 10-7121",
    url: "https://en.sailor.co.jp/product/10-7121/",
    summary: "官网 10-7121 是搭载 Naginata-Togi 的具体钢笔 SKU，记录 21K 尖、F/MF/M/B、141 mm 和 24.0 g。",
    locator: "10-7121 product page; Naginata-Togi nib; F/MF/M/B codes; PMMA; 141 mm and 24.0 g",
  }),
  fpn: secondary({
    key: "phase37-sailor-kop-fpn",
    title: "Sailor King of Pen Ebonite 使用评测",
    url: "https://www.fountainpennetwork.com/forum/topic/290285-sailor-king-of-pen-ebonite/",
    registryKey: "fountain-pen-network",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    summary: "专业钢笔论坛的 KOP Ebonite 单笔评测，用于交叉核对大型笔身、硬橡胶触感与实际使用边界，不替代官方 SKU。",
    locator: "single-sample Ebonite KOP review; handling and material observations",
  }),
  anderson: secondary({
    key: "phase37-sailor-kop-anderson",
    title: "Sailor Ebonite King of Pen 资料",
    url: "https://blog.andersonpens.com/sailor-ebonite-king-of-pen/",
    registryKey: "anderson-pens",
    registryName: "Anderson Pens",
    sourceType: "blog",
    summary: "专业零售商资料补充 KOP Ebonite 的握持、尖号和维护观察；只作专业二级来源。",
    locator: "Ebonite KOP construction, nib and handling observations",
  }),
  care: phase31SailorP0Packs.flatMap((pack) => pack.sources).find((source) => source.key === "sailor-care")!,
  factualSvg: {
    key: "phase37-sailor-kop-factual-svg",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "Sailor KOP 材质与身份边界事实卡（本站原创 SVG）",
    url: "/images/library/site-original/sailor-kop-naginata/sailor-kop.svg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创非写实事实卡，区分 KOP 材质分支、KOP Kai 与 Professional Gear KOP，不表现真实产品比例、颜色或商标。",
    archiveUrl: "/images/library/site-original/sailor-kop-naginata/sailor-kop.svg",
    archiveLocator: "project-public-asset:/images/library/site-original/sailor-kop-naginata/sailor-kop.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;anchor-trademark=false;engraving=false;to-scale=false;colour-proof=false;dimensions=1600x900",
  } satisfies CuratedSource,
};

const scopeKey = "sailor-kop-family";
const evidence = (key: string, sourceKey: string, locator: string) => ({ key, sourceKey, scopeKey, locator });

const kopPack: CuratedEntityPack = {
  key: "phase37-sailor-kop-v1",
  entityId: PHASE37_KOP_ID,
  expectedType: "pen",
  expectedSlug: "sailor-king-of-pens",
  canonicalName: "写乐 Sailor King of Pens（KOP）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sailor-king-of-pens-naginata-publishable-content-2026-07-19.md",
  storyTitle: "King of Pens（KOP）：写乐大型尖路线的身份边界",
  primarySourceKey: sources.officialKop.key,
  depthTier: "A",
  aliases: [
    { alias: "Sailor King of Pens", language: "en", sourceKey: sources.officialKop.key },
    { alias: "Sailor KOP", language: "en", sourceKey: sources.officialKop.key },
    { alias: "King of Pen", language: "en", kind: "former_name", sourceKey: sources.fpn.key },
    { alias: "写乐 King of Pen 笔王", language: "zh", kind: "former_name", sourceKey: sources.officialKop.key },
  ],
  sources: Object.values(sources),
  scopes: [{ key: scopeKey, scopeKey, productionState: "current", editionScope: "KOP 总称；尺寸、重量、颜色和停产状态必须回到具体分支或 SKU" }],
  claims: [
    { key: "kop-family", predicate: "model_identity", objectText: "King of Pens 是 Sailor 一组大型笔身与大型 21K 尖路线，官方专题分为 Ebonite、Urushi 与 ST Resin。", factClass: "core", confidence: 0.99, sourceKey: sources.officialKop.key, locator: "official KOP family sections", evidence: [evidence("kop-family-evidence", sources.officialKop.key, "KOP Ebonite / Urushi / ST Resin headings")] },
    { key: "kop-boundary", predicate: "version_boundary", objectText: "KOP 总称不提供单一尺寸；KOP Kai、Professional Gear KOP 和 KING PROFIT 各有独立货号与结构。", factClass: "core", confidence: 0.98, sourceKey: sources.fpn.key, locator: "professional review compared with official product identities", evidence: [evidence("kop-boundary-evidence", sources.fpn.key, "single-sample Ebonite review and family boundary"), evidence("kop-boundary-pro-gear", sources.proGearKop.key, "10-9618 Professional Gear KOP identity")] },
    { key: "kop-naginata", predicate: "nib_taxonomy", objectText: "Naginata-Togi（长刀研）是特殊笔尖类型；具体钢笔 SKU 10-7121 不能反推所有 KOP 都搭载该尖。", factClass: "core", confidence: 0.99, sourceKey: sources.specialNib.key, locator: "special nib taxonomy", evidence: [evidence("kop-naginata-evidence", sources.specialNib.key, "Naginata-Togi appears under special nibs"), evidence("kop-naginata-sku", sources.naginataPen.key, "10-7121 concrete pen SKU")] },
  ],
  variants: [
    { key: "kop-ebonite", name: "KOP Ebonite（11-7002 / 11-9704）", notes: "硬橡胶路线；GT、RT 与具体颜色／饰件按货号区分。", sourceKey: sources.kingProfit.key, variantKind: "material", productCode: "11-7002 / 11-9704" },
    { key: "kop-urushi", name: "KOP Urushi（10-9175 等）", notes: "硬橡胶底材与 Urushi 漆艺；颜色和生产状态按官方分支页核对。", sourceKey: sources.officialKop.key, variantKind: "material", productCode: "10-9175 / 10-9579 / 10-8160" },
    { key: "kop-resin", name: "KOP ST Resin（11-6001 / 11-9639）", notes: "PMMA 树脂路线，Gold 与 Rhodium 饰件独立列货号。", sourceKey: sources.officialKop.key, variantKind: "material", productCode: "11-6001 / 11-9639" },
    { key: "kop-kai", name: "King of Pens Kai（10-9962）", notes: "硬橡胶独立 SKU；官方页给出含夹长度和重量，只作该 SKU 规格。", sourceKey: sources.kai.key, variantKind: "market_sku", productCode: "10-9962" },
    { key: "kop-pro-gear", name: "Professional Gear KOP（10-9618）", notes: "平顶 Professional Gear 路线，不与鱼雷形 KING PROFIT 合并。", sourceKey: sources.proGearKop.key, variantKind: "edition_group", productCode: "10-9618" },
  ],
  spec: {
    brandEntityId: PHASE37_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor King of Pens（KOP）",
      release_year: "2000s（总称无单一官方首发年）",
      origin_country: "日本（以 Sailor 日本官网产品页为准，不外推具体工厂）",
      nib: "21K 金大型尖；M/B 为常见规格，依具体 SKU",
      fill_system: "Sailor 墨囊／上墨器",
      material: "硬橡胶、Urushi 或 PMMA 树脂，依分支与货号",
      dimensions: "总称不设单一尺寸；KOP Kai 10-9962 约 153.5 mm、32.8 g",
      status: "现行／历史分支并存；以官方具体 SKU 状态为准",
    },
    evidence: [
      { key: "kop-brand", fieldKey: "brand_entity_id", sourceKey: sources.officialKop.key, scopeKey, locator: "Sailor official KOP collection" },
      { key: "kop-series", fieldKey: "series_name", sourceKey: sources.officialKop.key, scopeKey, locator: "KOP Ebonite / Urushi / ST Resin sections" },
      { key: "kop-release", fieldKey: "release_year", sourceKey: sources.officialKop.key, scopeKey, locator: "No single launch year stated; intentionally marked as 2000s family context" },
      { key: "kop-origin", fieldKey: "origin_country", sourceKey: sources.kingProfit.key, scopeKey, locator: "Sailor Japanese official product page; factory not inferred", qualifies: true },
      { key: "kop-nib", fieldKey: "nib", sourceKey: sources.officialKop.key, scopeKey, locator: "21K large nib and M/B fields across KOP sections" },
      { key: "kop-fill", fieldKey: "fill_system", sourceKey: sources.officialKop.key, scopeKey, locator: "converter and cartridge fields" },
      { key: "kop-material", fieldKey: "material", sourceKey: sources.officialKop.key, scopeKey, locator: "Ebonite, Urushi and PMMA sections" },
      { key: "kop-dimensions", fieldKey: "dimensions", sourceKey: sources.kai.key, scopeKey, locator: "153.5 mm and 32.8 g are explicitly SKU-scoped to KOP Kai" },
      { key: "kop-status", fieldKey: "status", sourceKey: sources.officialKop.key, scopeKey, locator: "official collection and product availability labels" },
    ],
  },
  media: [{ key: "kop-factual-primary", title: "KOP 材质与身份边界事实卡（非产品照片）", sourceKey: sources.factualSvg.key, localPath: sources.factualSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创事实示意图：区分 KOP Ebonite、Urushi、ST Resin、KOP Kai 与 Professional Gear KOP；示意图，非产品照片，不含 Sailor logo、锚形商标、刻字或真实比例。", sourceUrl: sources.factualSvg.url, usageStatus: "primary" }],
  timeline: [{ key: "kop-current-family", title: "Sailor 官方以 KOP 专题整理材料分支", eventType: "design_milestone", startDate: "2026-07-19", circa: true, description: "当前官网把 KOP Ebonite、Urushi 与 ST Resin 分开展示；本页据此建立总称与 SKU 边界。", sourceKey: sources.officialKop.key }],
};

const sailorBrandPack = structuredClone(phase31SailorP0Packs[0]);
if (!sailorBrandPack || sailorBrandPack.entityId !== PHASE37_SAILOR_BRAND_ID) throw new Error("Phase 37 Sailor brand pack missing.");
sailorBrandPack.key = "phase37-sailor-brand-v1";

export const phase37SailorKopPacks: CuratedEntityPack[] = [sailorBrandPack, kopPack];
