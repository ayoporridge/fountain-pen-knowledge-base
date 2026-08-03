import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase33Sailor2026CurrentPacks } from "./phase33-sailor-2026-current";

export const PHASE379_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE379_WABI_SABI_KIWAMI_ID =
  "phase379-sailor-wabi-sabi-kiwami-102213";
export const PHASE379_WABI_SABI_KIWAMI_SLUG = "sailor-wabi-sabi-kiwami";

const RETRIEVED = "2026-08-03";
const PRODUCT = "https://en.sailor.co.jp/product/10-2213/";
const TOPIC_2 = "https://en.sailor.co.jp/topics/wabi-sabi-2nd/";
const TOPIC_3 = "https://en.sailor.co.jp/topics/wabi-sabi-3rd/";
const NIB = "https://sailor.co.jp/topics/fountain-pen-type/";
const REFILL = "https://sailor.co.jp/topics/fountain-pen-refill-ink/";
const CARE = "https://sailor.co.jp/topics/fountain-pen-maintenance/";
const RETAILER =
  "https://www.dromgooles.com/products/sailor-king-of-pens-wabi-sabi-fountain-pen-kiwami-bespoke-limited-edition";
const SVG =
  "/images/library/site-original/phase379/sailor/wabi-sabi-kiwami-102213.svg";

function source(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  registryKey: string;
  registryName: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup?: string;
  homepageUrl?: string;
  author?: string;
  publishedAt?: string;
  itemType?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const siteOriginal = sourceType === "user_submission";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? (sourceType === "retailer" ? "professional_secondary" : "primary"),
    independenceGroup: input.independenceGroup ?? input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl:
      input.homepageUrl ??
      (sourceType === "official" ? "https://sailor.co.jp/" : "/"),
    itemType: input.itemType ?? (siteOriginal ? "image" : "web_page"),
    author:
      input.author ??
      (sourceType === "official" ? "セーラー万年筆株式会社" : input.registryName),
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    allowedUse: siteOriginal ? "store_full" : "summary_only",
    license: siteOriginal ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: siteOriginal
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function claim(
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies };
}

const SOURCES = {
  product: source({
    key: "phase379-wabi-sabi-kiwami-product",
    title: "Wabi Sabi Kiwami, 極, Fountain Pen — Sailor 官方产品页",
    url: PRODUCT,
    summary:
      "Sailor 英文官方产品页确认 KIWAMI 的产品身份、10-2213-430/630、条码、KOP 21K 金色镀层尖、C/C、硬橡胶、φ20×153.5 mm、特殊礼盒及海外限定全球 20 支。",
    locator:
      "title, description, item code, barcode, nib, filling, material, size, package and overseas-exclusive fields",
    registryKey: "sailor-official-phase379-wabi-sabi",
    registryName: "The Sailor Pen Co., Ltd.",
    homepageUrl: "https://en.sailor.co.jp/",
    author: "The Sailor Pen Co., Ltd.",
  }),
  topic2: source({
    key: "phase379-wabi-sabi-2nd-topic",
    title: "Wabi Sabi 2nd — Sailor 官方专题",
    url: TOPIC_2,
    summary:
      "官方专题说明 Wayo Shimamori、Irogasane Sabinuri、硬橡胶、21K 镀金尖和 C/C，并警示同工艺系列不设计后插笔帽。",
    locator:
      "series context, Urushi artist, Irogasane Sabinuri, material, nib, filling and cap-posting warning",
    registryKey: "sailor-official-phase379-wabi-sabi",
    registryName: "The Sailor Pen Co., Ltd.",
    homepageUrl: "https://en.sailor.co.jp/",
    author: "The Sailor Pen Co., Ltd.",
  }),
  topic3: source({
    key: "phase379-wabi-sabi-3rd-topic",
    title: "Wabi Sabi 3rd — Sailor 官方专题",
    url: TOPIC_3,
    summary:
      "官方专题把 3rd 说明为 Wabi Sabi 系列最后模型之一，补充 Wayo Shimamori、Sabi-nuri、硬橡胶、C/C、21K 镀金尖和后插笔帽边界；不替代 10-2213 的单支代码。",
    locator:
      "Wabi Sabi series continuity, final-model wording, artist, lacquer, material and cap-posting warning",
    registryKey: "sailor-official-phase379-wabi-sabi",
    registryName: "The Sailor Pen Co., Ltd.",
    homepageUrl: "https://en.sailor.co.jp/",
    author: "The Sailor Pen Co., Ltd.",
  }),
  retailer: source({
    key: "phase379-wabi-sabi-dromgooles",
    title: "Sailor King of Pens Wabi Sabi Fountain Pen - Kiwami — Dromgoole's",
    url: RETAILER,
    summary:
      "专业钢笔零售商页面独立列出 KIWAMI、US$2,200 历史标价、M/B、10-2213-430/630、硬橡胶、21K 镀金 KOP 尖和全球 20 支；页面当前显示售罄，旧预订日期不作官方当前状态。",
    locator:
      "product title, historical price, sold-out state, nib options, item numbers, material and limited quantity",
    registryKey: "dromgooles-phase379-wabi-sabi",
    registryName: "Dromgoole's Fine Writing Instruments",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "dromgooles-phase379-wabi-sabi",
    homepageUrl: "https://www.dromgooles.com/",
    author: "Dromgoole's Fine Writing Instruments",
    publishedAt: "2026",
  }),
  nib: source({
    key: "phase379-wabi-sabi-nib",
    title: "ペン先の種類と特長 — Sailor 官方",
    url: NIB,
    summary:
      "Sailor 官方笔尖知识页用于解释尖幅命名和一般使用边界，不把通用字幅说明外推成 KIWAMI 单支调校。",
    locator: "official nib material and width guidance",
    registryKey: "sailor-official-phase379-wabi-sabi",
    registryName: "セーラー万年筆株式会社",
  }),
  refill: source({
    key: "phase379-wabi-sabi-refill",
    title: "万年筆のインク補充方法 — Sailor 官方",
    url: REFILL,
    summary:
      "Sailor 官方说明墨囊和转换器的安装、吸墨、排空和保存，用于 KIWAMI 的 C/C 维护边界。",
    locator: "official cartridge and converter filling instructions",
    registryKey: "sailor-official-phase379-wabi-sabi",
    registryName: "セーラー万年筆株式会社",
  }),
  care: source({
    key: "phase379-wabi-sabi-care",
    title: "万年筆のお手入れ方法 — Sailor 官方",
    url: CARE,
    summary:
      "Sailor 官方说明日常清洗、长期保存与避免强力清洁的方法；漆艺表面的谨慎边界仍按型号与授权服务意见执行。",
    locator: "official cleaning, storage and maintenance instructions",
    registryKey: "sailor-official-phase379-wabi-sabi",
    registryName: "セーラー万年筆株式会社",
  }),
  diagram: source({
    key: "phase379-wabi-sabi-kiwami-svg",
    title: "Sailor Wabi Sabi KIWAMI 10-2213 factual identity card",
    url: SVG,
    summary:
      "本站原创 factual SVG 概括 KIWAMI 的硬橡胶、Irogasane Sabinuri、KOP 21K 镀金尖、M/B 货号和全球 20 支边界。",
    locator: "site-original factual SVG metadata",
    registryKey: "fountain-pen-graph-editorial-phase379-wabi-sabi",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    itemType: "image",
  }),
};

const SCOPE = "phase379-sailor-wabi-sabi-kiwami-102213";

const brand = structuredClone(
  phase33Sailor2026CurrentPacks.find(
    (candidate) =>
      candidate.entityId === PHASE379_SAILOR_BRAND_ID &&
      candidate.expectedType === "brand",
  ),
);
if (!brand) throw new Error("Phase 379 Sailor brand pack missing.");
brand.key = "phase379-sailor-brand-v1";

const pack: CuratedEntityPack = {
  key: `${PHASE379_WABI_SABI_KIWAMI_ID}-v1`,
  entityId: PHASE379_WABI_SABI_KIWAMI_ID,
  expectedType: "pen",
  expectedSlug: PHASE379_WABI_SABI_KIWAMI_SLUG,
  canonicalName: "写乐 Sailor Wabi Sabi KIWAMI（極，10-2213）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/sailor-wabi-sabi-kiwami-102213-phase379.md",
  storyTitle:
    "写乐 Sailor Wabi Sabi KIWAMI 10-2213：先把最后一组 Wabi Sabi KOP 读成漆艺限量款",
  primarySourceKey: SOURCES.product.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Wabi Sabi Kiwami, 極, Fountain Pen",
      language: "en",
      sourceKey: SOURCES.product.key,
    },
    {
      alias: "Sailor King of Pens Wabi Sabi Kiwami",
      language: "en",
      sourceKey: SOURCES.retailer.key,
    },
    {
      alias: "Sailor Wabi Sabi KIWAMI",
      language: "en",
      sourceKey: SOURCES.product.key,
    },
    {
      alias: "写乐 Wabi Sabi 极",
      language: "zh",
      sourceKey: SOURCES.product.key,
    },
    {
      alias: "10-2213",
      language: "en",
      sourceKey: SOURCES.product.key,
    },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Sailor overseas-exclusive authorized market",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "KOP 21K gold with gold plating; M/B market SKUs",
      materialScope: "ebonite body with Irogasane Sabinuri Urushi finish",
      editionScope: "10-2213; worldwide limited quantity 20 pieces",
    },
    {
      key: `${SCOPE}-series-context`,
      scopeKey: `${SCOPE}-series-context`,
      productionState: "historical",
      editionScope: "Wabi Sabi series continuity from official 2nd/3rd topics; not a merged SKU",
    },
    {
      key: `${SCOPE}-media-boundary`,
      scopeKey: `${SCOPE}-media-boundary`,
      productionState: "current",
      editionScope: "site-original factual SVG; no product photo, logo, scale or colour proof",
    },
  ],
  claims: [
    claim(
      SCOPE,
      `${SCOPE}-identity`,
      "model_identity",
      "10-2213 是 Sailor Wabi Sabi 系列最后一组限定 KOP 的具体主型号，KIWAMI／極是该组型号名；Wabi Sabi 1st、2nd、3rd 与 KOP 家族总称不在本实体中合并。",
      SOURCES.product.key,
      "official product title, description and 10-2213 identity",
    ),
    claim(
      SCOPE,
      `${SCOPE}-craft`,
      "craft_history",
      "Sailor 说明 Urushi 艺术家 Wayo Shimamori 开发 Irogasane Sabinuri，并制作全球 20 支；页面没有给出逐支编号分配、漆层配方或具体工坊地址。",
      SOURCES.product.key,
      "official description and overseas-exclusive quantity",
    ),
    claim(
      SCOPE,
      `${SCOPE}-series-boundary`,
      "version_boundary",
      "官方 Wabi Sabi 2nd／3rd 专题用于确认同系列的 Sabinuri、硬橡胶、21K 镀金尖和 C/C 语境，但各代货号不同；不能把 10-2213 改写成 10-2211、10-2212 或普通 KOP。",
      SOURCES.topic3.key,
      "official Wabi Sabi series topics and model-code boundary",
    ),
    claim(
      SCOPE,
      `${SCOPE}-nib`,
      "nib",
      "KOP 尺寸 21K 金尖，金色镀层；官方市场 SKU 为 M 10-2213-430 与 B 10-2213-630。镀层是表面处理，不等于 14K／21K 金色装饰替换了尖材声明。",
      SOURCES.product.key,
      "official nib, plating and item-code fields",
    ),
    claim(
      SCOPE,
      `${SCOPE}-filling`,
      "filling_system",
      "墨囊／转换器两用式（converter & cartridge）；没有官方证据把 KIWAMI 写成活塞、真空或吸墨器内置型号。",
      SOURCES.product.key,
      "official filling type field",
    ),
    claim(
      SCOPE,
      `${SCOPE}-material`,
      "material",
      "笔身材料为硬橡胶；Irogasane Sabinuri 是 Wayo Shimamori 的 Urushi 表面工艺，不把系列名称误当成木材、石材或树脂配方。",
      SOURCES.product.key,
      "official material and craft description",
    ),
    claim(
      SCOPE,
      `${SCOPE}-size`,
      "physical_specification",
      "官方产品页给出 φ20×153.5 mm；页面没有列本体重量，因此不借用其他 KOP 分支的克数。",
      SOURCES.product.key,
      "official size field and absent weight field",
    ),
    claim(
      SCOPE,
      `${SCOPE}-limited`,
      "market_status",
      "官方标注海外限定、全球 20 支；Dromgoole’s 历史商品页列 US$2,200 并显示售罄，这只是专业二级市场记录，不是官方 MSRP、当前库存或配额证明。",
      SOURCES.retailer.key,
      "retailer price and sold-out listing cross-check",
      "editorial",
    ),
    claim(
      SCOPE,
      `${SCOPE}-care`,
      "maintenance_guidance",
      "清洗时使用室温清水缓慢吸排并自然晾干；硬橡胶和 Sabinuri 漆面避开酒精、强溶剂、研磨物和长时间浸泡。Wabi Sabi 2nd／3rd 官方专题警告同工艺系列不设计后插笔帽，KIWAMI 页面未逐字重复，故正文把它作为保守使用边界而非单页明示规格。",
      SOURCES.topic3.key,
      "official Wabi Sabi cap-posting warning plus Sailor care guidance",
      "editorial",
    ),
    claim(
      SCOPE,
      `${SCOPE}-selection`,
      "selection_guidance",
      "选购应核对 10-2213 主码、M/B 后缀、硬橡胶与 Sabinuri 漆面、φ20×153.5 mm、特殊礼盒和全球 20 支边界；卖家克数或价格必须附自己的称重与市场来源。",
      SOURCES.product.key,
      "model code, material, dimensions, package and market-limit checks",
      "editorial",
    ),
    claim(
      SCOPE,
      `${SCOPE}-media`,
      "media_identity_boundary",
      "主图是本站原创 factual SVG，不复制 Sailor 产品照片或 Logo，不证明真实漆面纹理、编号、比例、颜色或礼盒缺件。",
      SOURCES.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: `${SCOPE}-m`,
      name: "KOP M 中字",
      notes:
        "官方代码 10-2213-430，JAN 49-01680-60779-3；与 B 共享 10-2213 主型号和全球 20 支限量边界。",
      sourceKey: SOURCES.product.key,
      variantKind: "market_sku",
      productCode: "10-2213-430",
      market: "海外限定",
    },
    {
      key: `${SCOPE}-b`,
      name: "KOP B 太字",
      notes:
        "官方代码 10-2213-630，JAN 49-01680-60780-9；与 M 共享 10-2213 主型号和全球 20 支限量边界。",
      sourceKey: SOURCES.product.key,
      variantKind: "market_sku",
      productCode: "10-2213-630",
      market: "海外限定",
    },
  ],
  spec: {
    brandEntityId: PHASE379_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor Wabi Sabi KIWAMI（極，10-2213）",
      release_year:
        "官方当前产品页未给出单一首发年份；页面称 Wabi Sabi 系列最后限定型号",
      origin_country: "日本 Sailor；不外推具体工厂、漆艺工坊或供应商",
      nib: "KOP 尺寸 21K 金尖，金色镀层；M 10-2213-430、B 10-2213-630",
      fill_system: "墨囊／转换器两用式（converter & cartridge）",
      material: "硬橡胶（ebonite）笔身；Irogasane Sabinuri Urushi 漆艺表面",
      dimensions: "φ20×153.5 mm",
      weight: "官方当前产品页未列重量",
      price_range:
        "官方英文页未列 MSRP；Dromgoole’s 历史页面曾列 US$2,200，已售罄，不代表现行官方价",
      status: "海外限定、全球 20 支；库存和授权市场需向 Sailor 经销商核对",
    },
    evidence: [
      evidence(`${SCOPE}-brand`, "brand_entity_id", SOURCES.product.key, SCOPE, "official Sailor product identity"),
      evidence(`${SCOPE}-series`, "series_name", SOURCES.product.key, SCOPE, "official KIWAMI title and code"),
      evidence(`${SCOPE}-release`, "release_year", SOURCES.product.key, SCOPE, "official page does not state a single launch year; field intentionally bounded"),
      evidence(`${SCOPE}-origin`, "origin_country", SOURCES.product.key, SCOPE, "Sailor official product page; no factory inference"),
      evidence(`${SCOPE}-nib`, "nib", SOURCES.product.key, SCOPE, "official nib and item-code fields"),
      evidence(`${SCOPE}-fill`, "fill_system", SOURCES.product.key, SCOPE, "official filling field"),
      evidence(`${SCOPE}-material`, "material", SOURCES.product.key, SCOPE, "official ebonite and Urushi description"),
      evidence(`${SCOPE}-dimensions`, "dimensions", SOURCES.product.key, SCOPE, "official size field"),
      evidence(`${SCOPE}-weight`, "weight", SOURCES.product.key, SCOPE, "official page does not list weight; no borrowed value"),
      evidence(`${SCOPE}-price`, "price_range", SOURCES.retailer.key, SCOPE, "historical professional retailer price only"),
      evidence(`${SCOPE}-status`, "status", SOURCES.product.key, SCOPE, "official overseas-exclusive and worldwide quantity fields"),
    ],
  },
  media: [
    {
      key: `${SCOPE}-primary-media`,
      title: "Wabi Sabi KIWAMI 10-2213 事实卡（非产品照片）",
      sourceKey: SOURCES.diagram.key,
      localPath: SVG,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样、非编号证明。",
      sourceUrl: SVG,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: `${SCOPE}-current-page`,
      title: "Sailor 产品页确认 KIWAMI 的海外限定身份",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description:
        "截至 2026-08-03，Sailor 官方英文页仍展示 10-2213 的 KIWAMI、KOP 21K 镀金尖、硬橡胶、全球 20 支和海外限定边界；页面没有给出单一首发年份。",
      sourceKey: SOURCES.product.key,
    },
  ],
};

export const phase379SailorWabiSabiKiwamiPacks: CuratedEntityPack[] = [
  brand,
  pack,
];
