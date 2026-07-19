import type {
  CuratedEntityPack,
  CuratedSource,
} from "../lib/curated-content-pack";
import { phase29SailorPacks } from "./phase29-sailor";

export const PHASE31_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE31_PRO_GEAR_ID = "uY3QLMSxlCoo";
export const PHASE31_PROFIT_14_ID = "ZNBYjDlGF4FY";
export const PHASE31_PROFIT_18_ID = "Gmdr1MCj1Pp8";
export const PHASE31_RETIRED_PRO_GEAR_ID = "ouSQi7nqLzH5";

const RETRIEVED = "2026-07-19";

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

function phase29Source(key: string): CuratedSource {
  const match = phase29SailorPacks
    .flatMap((pack) => pack.sources)
    .find((candidate) => candidate.key === key);
  if (!match) {
    throw new Error(`Phase 31 cannot resolve Phase 29 source ${key}.`);
  }
  return match;
}

const SOURCES = {
  "phase31-pro-gear-gold": liveSource({
    key: "phase31-pro-gear-gold",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "プロフェッショナルギア 金 万年筆 — 11-2036",
    url: "https://sailor.co.jp/product/11-2036/",
    homepageUrl: "https://sailor.co.jp/",
    author: "セーラー万年筆株式会社",
    summary:
      "日本官网现行 11-2036：Black、21K 大型双色尖、七尖号、两用式、PMMA、Gold IP、φ18×129 mm、21.6 g 与日期化价格。",
    locator:
      "current product title, item-code list, nib/filling/material/metal/size/weight fields and prices",
  }),
  "phase31-pro-gear-silver": liveSource({
    key: "phase31-pro-gear-silver",
    registryKey: "sailor-official",
    registryName: "The Sailor Pen Co., Ltd.",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "sailor-official",
    title: "プロフェッショナルギア 銀 万年筆 — 11-2037",
    url: "https://sailor.co.jp/product/11-2037/",
    homepageUrl: "https://sailor.co.jp/",
    author: "セーラー万年筆株式会社",
    summary:
      "日本官网现行 11-2037：Black、21K 大型双色尖、七尖号、两用式、PMMA、nickel chrome plating、φ18×129 mm、21.6 g 与日期化价格。",
    locator:
      "current product title, item codes and basic specification fields including nickel chrome plating",
  }),
  "sailor-history-step": phase29Source("sailor-history-step"),
  "sailor-profit14-18-launch": phase29Source("sailor-profit14-18-launch"),
  "sailor-profit14": phase29Source("sailor-profit14"),
  "sailor-profit18": phase29Source("sailor-profit18"),
  "sailor-care": phase29Source("sailor-care"),
  "phase31-parka-pro-gear-review": liveSource({
    key: "phase31-parka-pro-gear-review",
    registryKey: "parka-blogs",
    registryName: "Parka Blogs",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "parka-blogs",
    title: "Review: Sailor Professional Gear with 21K Medium Nib Fountain Pen",
    url: "https://www.parkablogs.com/picture/review-sailor-professional-gear-medium-nib",
    homepageUrl: "https://www.parkablogs.com/",
    author: "Teoh Yi Chie",
    publishedAt: "2015-01-28",
    summary:
      "独立样笔评测直接记录一支全尺寸 Sailor Professional Gear 21K Medium 的平顶外形与单支书写样本；只作家族边界，不覆盖当前 SKU 价格和镀层。",
    locator:
      "Professional Gear flat-top identity, 21K Medium sample and review photographs; single-sample boundary",
  }),
  "phase31-biccamera-profit14": liveSource({
    key: "phase31-biccamera-profit14",
    registryKey: "biccamera",
    registryName: "BicCamera.com",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "biccamera-retailer",
    title: "プロフィット14 ゴールドトリム ブラック 11-1214-720",
    url: "https://www.biccamera.com/bc/item/14770924/",
    homepageUrl: "https://www.biccamera.com/",
    author: "BicCamera.com",
    summary:
      "日本专业零售目录直接列出 Profit 14 Black Zoom 的完整 SKU 11-1214-720；只用于独立交叉确认型号／颜色／尖号组合。",
    locator: "product title naming Profit 14, Black, Zoom and full code 11-1214-720",
  }),
  "phase31-biccamera-profit18": liveSource({
    key: "phase31-biccamera-profit18",
    registryKey: "biccamera",
    registryName: "BicCamera.com",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "biccamera-retailer",
    title:
      "プロフィット18 ゴールドトリム シャイニングブラック 11-2218-320",
    url: "https://www.biccamera.com/bc/item/14770945/",
    homepageUrl: "https://www.biccamera.com/",
    author: "BicCamera.com",
    summary:
      "日本专业零售目录直接列出 Profit 18 Shining Black MF 的完整 SKU 11-2218-320 与 ¥66,000；只用于型号／颜色／尖号／SKU 交叉确认。",
    locator:
      "product title naming Profit 18, Shining Black, MF and 11-2218-320; JPY 66,000 retailer listing",
  }),
  "phase31-flickr-pro-gear-full": {
    key: "phase31-flickr-pro-gear-full",
    registryKey: "flickr-semihundido",
    registryName: "Flickr — semihundido photostream",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "semihundido-pro-gear-2011",
    title: "Sailor Professional Gear",
    url: "https://www.flickr.com/photos/wasteofspace/5940085417/",
    homepageUrl: "https://www.flickr.com/photos/wasteofspace/",
    itemType: "image",
    author: "semihundido",
    publishedAt: "2011-07-14",
    retrievedAt: RETRIEVED,
    summary:
      "semihundido 发布的 2011 Professional Gear 全笔照片，CC BY-SA 2.0；仅作家族外观档案，不证明现行 11-2036／11-2037 SKU。",
    allowedUse: "store_full",
    license: "cc-by-sa-2.0",
    archiveUrl:
      "/images/library/licensed/sailor-p0/sailor-professional-gear-family-2011.jpg",
    archiveLocator:
      "project-public-asset:sailor-professional-gear-family-2011.jpg;flickr-photo=5940085417;author=semihundido;license=CC-BY-SA-2.0;source-size=1024x683;family-level=true;current-sku-proof=false;sha256=1d1a96c2ad9ab8ebd15df53c60bb5f65099f0c333aed44a8a9a0d34688223cc5;downloaded=2026-07-19",
  },
  "phase31-flickr-pro-gear-nib": {
    key: "phase31-flickr-pro-gear-nib",
    registryKey: "flickr-semihundido",
    registryName: "Flickr — semihundido photostream",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "semihundido-pro-gear-2011",
    title: "Sailor Professional Gear Medium Nib",
    url: "https://www.flickr.com/photos/wasteofspace/5940644652/",
    homepageUrl: "https://www.flickr.com/photos/wasteofspace/",
    itemType: "image",
    author: "semihundido",
    publishedAt: "2011-07-15",
    retrievedAt: RETRIEVED,
    summary:
      "semihundido 发布的 2011 Professional Gear Medium 笔尖近照，CC BY-SA 2.0；只显示该历史样笔，不能外推现行 SKU 刻字。",
    allowedUse: "store_full",
    license: "cc-by-sa-2.0",
    archiveUrl:
      "/images/library/licensed/sailor-p0/sailor-professional-gear-medium-nib-2011.jpg",
    archiveLocator:
      "project-public-asset:sailor-professional-gear-medium-nib-2011.jpg;flickr-photo=5940644652;author=semihundido;license=CC-BY-SA-2.0;source-size=1024x683;family-level=true;current-sku-proof=false;sha256=831c4dabf3e7ebde87690e14bfbdc193b998ae5ab4e050b575fad775584f2b39;downloaded=2026-07-19",
  },
  "phase31-pro-gear-factual-svg": {
    key: "phase31-pro-gear-factual-svg",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "Professional Gear 21K 全尺寸规格事实卡（本站原创 SVG）",
    url: "/images/library/site-original/sailor-p0/sailor-professional-gear-21k-factual.svg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创非写实事实卡；区分 11-2036 Gold IP 与 11-2037 nickel chrome，不含 logo、锚形商标或产品刻字，也不代表实物比例和色泽。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl:
      "/images/library/site-original/sailor-p0/sailor-professional-gear-21k-factual.svg",
    archiveLocator:
      "project-public-asset:sailor-professional-gear-21k-factual.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;anchor-trademark=false;engraving=false;to-scale=false;colour-proof=false;dimensions=1600x900",
  },
  "phase31-profit-14-factual-svg": {
    key: "phase31-profit-14-factual-svg",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "Profit 14 规格事实卡（本站原创 SVG）",
    url: "/images/library/site-original/sailor-p0/sailor-profit-14-factual.svg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创非写实事实卡；无 logo、无产品刻字、未复制官网图片，不能代表 11-1214 实物色泽、比例或表面加工。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl:
      "/images/library/site-original/sailor-p0/sailor-profit-14-factual.svg",
    archiveLocator:
      "project-public-asset:sailor-profit-14-factual.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;engraving=false;specific-colour-proof=false;dimensions=1600x900",
  },
  "phase31-profit-18-factual-svg": {
    key: "phase31-profit-18-factual-svg",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "Profit 18 规格事实卡（本站原创 SVG）",
    url: "/images/library/site-original/sailor-p0/sailor-profit-18-factual.svg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创非写实事实卡；抽象光点只提示珠光材料文字事实，无 logo、无产品刻字，也不代表 11-2218 的实物光泽与色泽。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl:
      "/images/library/site-original/sailor-p0/sailor-profit-18-factual.svg",
    archiveLocator:
      "project-public-asset:sailor-profit-18-factual.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;engraving=false;pearl-rendering-proof=false;dimensions=1600x900",
  },
} satisfies Record<string, CuratedSource>;

const source = (key: keyof typeof SOURCES): CuratedSource => SOURCES[key];

const professionalGearPack: CuratedEntityPack = {
  key: "phase31-sailor-professional-gear-v1",
  entityId: PHASE31_PRO_GEAR_ID,
  expectedType: "pen",
  expectedSlug: "sailor-pro-gear",
  canonicalName: "Sailor Professional Gear 21K",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/sailor-professional-gear-publishable-content-2026-07-19.md",
  storyTitle: "Sailor Professional Gear：11-2036／11-2037 的全尺寸边界",
  primarySourceKey: "phase31-pro-gear-gold",
  depthTier: "A",
  aliases: [
    {
      alias: "Sailor Professional Gear",
      language: "en",
      sourceKey: "phase31-pro-gear-gold",
    },
    {
      alias: "Sailor Pro Gear",
      language: "en",
      sourceKey: "phase31-pro-gear-gold",
    },
    {
      alias: "プロフェッショナルギア",
      language: "ja",
      sourceKey: "phase31-pro-gear-gold",
    },
    {
      alias: "写乐 Professional Gear 21K",
      language: "zh",
      sourceKey: "phase31-pro-gear-gold",
    },
  ],
  sources: [
    source("phase31-pro-gear-gold"),
    source("phase31-pro-gear-silver"),
    source("sailor-history-step"),
    source("sailor-care"),
    source("phase31-parka-pro-gear-review"),
    source("phase31-flickr-pro-gear-full"),
    source("phase31-flickr-pro-gear-nib"),
    source("phase31-pro-gear-factual-svg"),
  ],
  variants: [
    {
      key: "pro-gear-gold-11-2036",
      name: "Black Gold Trim（11-2036）",
      notes:
        "日本现行 Black／Gold IP；EF/F/MF/M/B/Z/MS 商品尾码分别为 120/220/320/420/620/720/920。",
      sourceKey: "phase31-pro-gear-gold",
      variantKind: "market_sku",
      productCode: "11-2036-120/220/320/420/620/720/920",
      market: "日本",
    },
    {
      key: "pro-gear-silver-11-2037",
      name: "Black Silver Trim（11-2037）",
      notes:
        "日本现行 Black／nickel chrome plating；EF/F/MF/M/B/Z/MS 商品尾码分别为 120/220/320/420/620/720/920。",
      sourceKey: "phase31-pro-gear-silver",
      variantKind: "market_sku",
      productCode: "11-2037-120/220/320/420/620/720/920",
      market: "日本",
    },
  ],
  scopes: [
    {
      key: "pro-gear-current",
      scopeKey: "sailor-pro-gear-11-2036-11-2037-current-2026-07-19",
      market: "日本",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "21K large bicolor EF/F/MF/M/B/Z/MS",
      materialScope: "Black PMMA",
      editionScope: "full-size 11-2036 and 11-2037 only",
    },
    {
      key: "pro-gear-family-history",
      scopeKey: "sailor-professional-gear-family-history-2003",
      validFrom: "2003",
      productionState: "historical",
      editionScope: "family history only; not current SKU launch evidence",
    },
    {
      key: "pro-gear-independent-boundary",
      scopeKey: "sailor-family-size-boundary-independent-sample",
      productionState: "historical",
      editionScope: "independent sample supports family separation, not current SKU specs",
    },
    {
      key: "pro-gear-care",
      scopeKey: "sailor-cartridge-converter-care-current",
      productionState: "current",
      editionScope: "generic Sailor cartridge/converter care",
    },
    {
      key: "pro-gear-photo",
      scopeKey: "sailor-pro-gear-family-photo-2011",
      validFrom: "2011",
      productionState: "historical",
      editionScope: "family-level photos; not current 11-2036/11-2037 proof",
    },
  ],
  claims: [
    {
      key: "pro-gear-current-identity",
      predicate: "current_sku_identity",
      objectText:
        "本页只对应全尺寸 Black Professional Gear 21K：Gold IP 11-2036 与 nickel chrome 11-2037，共用 21K 大型双色尖、七尖号、两用式、PMMA、φ18×129 mm 与 21.6 g。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase31-pro-gear-gold",
      locator: "11-2036 current product page and basic specifications",
      evidence: [
        {
          key: "pro-gear-gold-current",
          sourceKey: "phase31-pro-gear-gold",
          scopeKey: "pro-gear-current",
          locator: "11-2036 item codes and specification table",
        },
        {
          key: "pro-gear-silver-current",
          sourceKey: "phase31-pro-gear-silver",
          scopeKey: "pro-gear-current",
          locator: "11-2037 item codes and specification table",
        },
      ],
    },
    {
      key: "pro-gear-history-boundary",
      predicate: "family_history_boundary",
      objectText:
        "官方历史中的 2003 是 Professional Gear 家族节点，不冒充现行 11-2036／11-2037 商品代码的首发年份。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "sailor-history-step",
      locator: "2003 Professional Gear family timeline entry",
      evidence: [
        {
          key: "pro-gear-family-2003",
          sourceKey: "sailor-history-step",
          scopeKey: "pro-gear-family-history",
          locator: "family timeline entry; no current item-code launch assertion",
        },
      ],
    },
    {
      key: "pro-gear-independent-family-boundary",
      predicate: "independent_family_boundary",
      objectText:
        "独立样笔评测直接记录全尺寸 Professional Gear 21K Medium 的平顶外形；该单支样本只支持家族识别，不替代当前 11-2036／11-2037 的官方规格。",
      factClass: "core",
      confidence: 0.86,
      sourceKey: "phase31-parka-pro-gear-review",
      locator: "Professional Gear flat-top identity and 21K Medium sample",
      evidence: [
        {
          key: "pro-gear-independent-size",
          sourceKey: "phase31-parka-pro-gear-review",
          scopeKey: "pro-gear-independent-boundary",
          locator: "direct Professional Gear 21K Medium single-sample review",
        },
      ],
    },
    {
      key: "pro-gear-care-guidance",
      predicate: "maintenance_guidance",
      objectText:
        "墨囊／上墨器结构用清水清洗，并可借上墨器反复吸排约五至六次；日常维护不套用 Realo 活塞拆修步骤。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "sailor-care",
      locator: "official converter cleaning steps",
      evidence: [
        {
          key: "pro-gear-care-water",
          sourceKey: "sailor-care",
          scopeKey: "pro-gear-care",
          locator: "draw and expel clean water five to six times",
        },
      ],
    },
    {
      key: "pro-gear-photo-boundary",
      predicate: "media_identity_boundary",
      objectText:
        "semihundido 的 2011 CC BY-SA 2.0 全笔与笔尖照片只证明 Professional Gear 家族历史样笔外观，不证明当前 11-2036／11-2037 SKU。",
      factClass: "editorial",
      confidence: 1,
      sourceKey: "phase31-flickr-pro-gear-full",
      locator: "photo titles, dates, creator and license metadata",
      evidence: [
        {
          key: "pro-gear-photo-full-boundary",
          sourceKey: "phase31-flickr-pro-gear-full",
          scopeKey: "pro-gear-photo",
          locator: "2011 family photo; current-sku-proof=false",
        },
        {
          key: "pro-gear-photo-nib-boundary",
          sourceKey: "phase31-flickr-pro-gear-nib",
          scopeKey: "pro-gear-photo",
          locator: "2011 Medium nib photo; current-sku-proof=false",
        },
      ],
    },
  ],
  spec: {
    brandEntityId: PHASE31_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor Professional Gear 21K 全尺寸（11-2036／11-2037）",
      nib: "21K 大型双色金尖；EF、F、MF、M、B、Z、MS",
      fill_system: "Sailor 墨囊／上墨器两用式",
      material:
        "Black PMMA；11-2036 金属部件为 Gold IP，11-2037 为 nickel chrome plating",
      dimensions: "最大径 φ18 mm × 全长 129 mm（含笔夹）",
      weight: "21.6 g",
      price_range:
        "日本官网 2026-07-19 快照：EF/F/MF/M/B 为 ¥77,000；Z/MS 为 ¥79,200",
      status:
        "日本官网当前商品页可见；全尺寸 Black，11-2036 Gold Trim 与 11-2037 Silver Trim",
    },
    evidence: [
      {
        key: "pro-gear-brand",
        fieldKey: "brand_entity_id",
        sourceKey: "phase31-pro-gear-gold",
        scopeKey: "pro-gear-current",
        locator: "official Sailor 11-2036 product page",
      },
      {
        key: "pro-gear-series",
        fieldKey: "series_name",
        sourceKey: "phase31-pro-gear-gold",
        scopeKey: "pro-gear-current",
        locator: "Professional Gear Gold title and 11-2036 codes",
      },
      {
        key: "pro-gear-nib",
        fieldKey: "nib",
        sourceKey: "phase31-pro-gear-gold",
        scopeKey: "pro-gear-current",
        locator: "21K large bicolor nib and seven item-code widths",
      },
      {
        key: "pro-gear-fill",
        fieldKey: "fill_system",
        sourceKey: "phase31-pro-gear-gold",
        scopeKey: "pro-gear-current",
        locator: "converter and cartridge type",
      },
      {
        key: "pro-gear-material-gold",
        fieldKey: "material",
        sourceKey: "phase31-pro-gear-gold",
        scopeKey: "pro-gear-current",
        locator: "PMMA and Gold IP fields",
      },
      {
        key: "pro-gear-material-silver",
        fieldKey: "material",
        sourceKey: "phase31-pro-gear-silver",
        scopeKey: "pro-gear-current",
        locator: "PMMA and nickel chrome plating fields",
      },
      {
        key: "pro-gear-dimensions",
        fieldKey: "dimensions",
        sourceKey: "phase31-pro-gear-gold",
        scopeKey: "pro-gear-current",
        locator: "phi 18 by 129 mm including clip",
      },
      {
        key: "pro-gear-weight",
        fieldKey: "weight",
        sourceKey: "phase31-pro-gear-gold",
        scopeKey: "pro-gear-current",
        locator: "catalog weight 21.6 g",
      },
      {
        key: "pro-gear-price",
        fieldKey: "price_range",
        sourceKey: "phase31-pro-gear-gold",
        scopeKey: "pro-gear-current",
        locator: "JPY 77,000 regular widths and JPY 79,200 Zoom/Music",
      },
      {
        key: "pro-gear-status",
        fieldKey: "status",
        sourceKey: "phase31-pro-gear-silver",
        scopeKey: "pro-gear-current",
        locator: "live 11-2036 and 11-2037 product pages retrieved 2026-07-19",
      },
    ],
  },
  media: [
    {
      key: "pro-gear-factual-primary",
      title: "Sailor Professional Gear 21K 全尺寸规格事实卡（非产品照片）",
      sourceKey: "phase31-pro-gear-factual-svg",
      localPath:
        "/images/library/site-original/sailor-p0/sailor-professional-gear-21k-factual.svg",
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG。仅排版已核验的 11-2036／11-2037 规格；示意图，非产品照片。无 Sailor logo、锚形商标或笔尖刻字，不表现真实笔身、比例、光泽、颜色或批次，不能用于鉴定。",
      sourceUrl:
        "/images/library/site-original/sailor-p0/sailor-professional-gear-21k-factual.svg",
      usageStatus: "primary",
    },
    {
      key: "pro-gear-family-2011-gallery",
      title:
        "Sailor Professional Gear 家族样笔（2011；非当前 11-2036／11-2037 SKU 证明）",
      sourceKey: "phase31-flickr-pro-gear-full",
      localPath:
        "/images/library/licensed/sailor-p0/sailor-professional-gear-family-2011.jpg",
      author: "semihundido",
      license: "cc-by-sa-2.0",
      attributionText:
        "Sailor Professional Gear，摄影 semihundido，2011，CC BY-SA 2.0（https://creativecommons.org/licenses/by-sa/2.0/）。本站保存 Flickr 1024×683 版本；如再传播修改版本须署名并以相同许可共享。图片只证明 Professional Gear 家族历史样笔外观，不证明当前 11-2036／11-2037 SKU、Gold IP／nickel chrome、尺寸、尖号或价格。",
      sourceUrl:
        "https://www.flickr.com/photos/wasteofspace/5940085417/",
      usageStatus: "gallery",
    },
    {
      key: "pro-gear-medium-nib-2011-gallery",
      title:
        "Sailor Professional Gear Medium 笔尖家族样本（2011；非当前 SKU 刻字证据）",
      sourceKey: "phase31-flickr-pro-gear-nib",
      localPath:
        "/images/library/licensed/sailor-p0/sailor-professional-gear-medium-nib-2011.jpg",
      author: "semihundido",
      license: "cc-by-sa-2.0",
      attributionText:
        "Sailor Professional Gear Medium Nib，摄影 semihundido，2011，CC BY-SA 2.0（https://creativecommons.org/licenses/by-sa/2.0/）。本站保存 Flickr 1024×683 版本；如再传播修改版本须署名并以相同许可共享。仅作家族级历史笔尖样本，不证明现行 11-2036／11-2037 的刻字、镀层或全部尖号。",
      sourceUrl:
        "https://www.flickr.com/photos/wasteofspace/5940644652/",
      usageStatus: "gallery",
    },
  ],
  timeline: [
    {
      key: "pro-gear-family-2003",
      title: "Professional Gear 家族进入官方历史时间线",
      eventType: "design_milestone",
      startDate: "2003",
      circa: false,
      description:
        "这是家族史节点，不作为现行 11-2036／11-2037 商品代码的首发日期。",
      sourceKey: "sailor-history-step",
    },
  ],
};

function profitPack(input: {
  key: "14" | "18";
  entityId: string;
  expectedSlug: string;
  productCode: "11-1214" | "11-2218";
  sourceKey: "sailor-profit14" | "sailor-profit18";
  secondarySourceKey:
    | "phase31-biccamera-profit14"
    | "phase31-biccamera-profit18";
  markdownFile: string;
  gold: "14K" | "18K";
  colours: Array<{ name: string; suffix: string; codes: string }>;
  material: string;
  regularPrice: string;
  specialPrice: string;
  mediaSourceKey:
    | "phase31-profit-14-factual-svg"
    | "phase31-profit-18-factual-svg";
  mediaPath: string;
}): CuratedEntityPack {
  const scopePrefix = `profit-${input.key}`;
  return {
    key: `phase31-sailor-profit-${input.key}-v1`,
    entityId: input.entityId,
    expectedType: "pen",
    expectedSlug: input.expectedSlug,
    canonicalName: `Sailor Profit ${input.key}`,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: `Sailor Profit ${input.key}：${input.productCode} 的大型 ${input.gold} 路线`,
    primarySourceKey: input.sourceKey,
    depthTier: "A",
    aliases: [
      {
        alias: `Sailor Profit ${input.key}`,
        language: "en",
        sourceKey: input.sourceKey,
      },
      {
        alias: `プロフィット ${input.key}`,
        language: "ja",
        sourceKey: input.sourceKey,
      },
      {
        alias: `写乐 Profit ${input.key}`,
        language: "zh",
        sourceKey: input.sourceKey,
      },
    ],
    sources: [
      source(input.sourceKey),
      source("sailor-profit14-18-launch"),
      source("sailor-history-step"),
      source("sailor-care"),
      source(input.secondarySourceKey),
      source(input.mediaSourceKey),
    ],
    variants: input.colours.map((colour) => ({
      key: `${scopePrefix}-${colour.suffix}`,
      name: `日本现行 ${colour.name}`,
      notes: `${input.gold} 大型尖；EF/F/MF/M/B/Z/MS 完整商品代码为 ${colour.codes}。`,
      sourceKey: input.sourceKey,
      variantKind: "market_sku" as const,
      productCode: colour.codes,
      market: "日本",
    })),
    scopes: [
      {
        key: `${scopePrefix}-current`,
        scopeKey: `sailor-${scopePrefix}-${input.productCode}-current-2026-07-19`,
        market: "日本",
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope: `${input.gold} large EF/F/MF/M/B/Z/MS`,
        materialScope: input.material,
        editionScope: `${input.productCode} only`,
      },
      {
        key: `${scopePrefix}-launch`,
        scopeKey: `sailor-${scopePrefix}-launch-2025-12`,
        market: "日本",
        validFrom: "2025-12-03",
        productionState: "historical",
        editionScope: "announcement 2025-12-03; release 2025-12-13",
      },
      {
        key: `${scopePrefix}-family-boundary`,
        scopeKey: `sailor-${scopePrefix}-independent-family-boundary`,
        productionState: "historical",
        editionScope: "independent family-size methodology; not 2025 SKU evidence",
      },
      {
        key: `${scopePrefix}-care`,
        scopeKey: `sailor-${scopePrefix}-cartridge-converter-care-current`,
        productionState: "current",
        editionScope: "generic Sailor cartridge/converter care",
      },
      {
        key: `${scopePrefix}-media`,
        scopeKey: `sailor-${scopePrefix}-factual-svg-2026-07-19`,
        validFrom: RETRIEVED,
        productionState: "current",
        editionScope: "site-original factual SVG; not a product photo",
      },
    ],
    claims: [
      {
        key: `${scopePrefix}-identity`,
        predicate: "current_sku_identity",
        objectText: `Profit ${input.key} 是 ${input.productCode}：${input.gold} 大型尖、四色七尖号、两用式、PMMA、Gold IP、φ18×141 mm、21.6 g。`,
        factClass: "core",
        confidence: 0.99,
        sourceKey: input.sourceKey,
        locator: "official item codes and basic specification fields",
        evidence: [
          {
            key: `${scopePrefix}-official-current`,
            sourceKey: input.sourceKey,
            scopeKey: `${scopePrefix}-current`,
            locator: "current product page, colour groups and specification table",
          },
        ],
      },
      {
        key: `${scopePrefix}-release-dates`,
        predicate: "announcement_and_release_dates",
        objectText:
          "2025-12-03 是新品公告日，2025-12-13 是日本发售日；两个日期不互相替代。",
        factClass: "core",
        confidence: 1,
        sourceKey: "sailor-profit14-18-launch",
        locator: "dated news heading and nationwide release sentence",
        evidence: [
          {
            key: `${scopePrefix}-launch-dates`,
            sourceKey: "sailor-profit14-18-launch",
            scopeKey: `${scopePrefix}-launch`,
            locator: "announcement 2025-12-03 and release 2025-12-13",
          },
        ],
      },
      {
        key: `${scopePrefix}-independent-sku-corroboration`,
        predicate: "independent_sku_corroboration",
        objectText: `专业零售目录独立列出 ${input.productCode} 的具体颜色／尖号 SKU，可交叉确认 Profit ${input.key} 身份；当前完整规格仍以 Sailor 官网为准。`,
        factClass: "core",
        confidence: 0.9,
        sourceKey: input.secondarySourceKey,
        locator: "direct product-specific retailer title and full SKU",
        evidence: [
          {
            key: `${scopePrefix}-independent-sku`,
            sourceKey: input.secondarySourceKey,
            scopeKey: `${scopePrefix}-family-boundary`,
            locator: `direct retailer record for a ${input.productCode} colour/nib SKU`,
          },
        ],
      },
      {
        key: `${scopePrefix}-care-guidance`,
        predicate: "maintenance_guidance",
        objectText:
          "墨囊／上墨器结构以清水清洗，并可借上墨器反复吸排约五至六次；日常维护不需要拔尖或套用 Realo 活塞步骤。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "sailor-care",
        locator: "official converter cleaning steps",
        evidence: [
          {
            key: `${scopePrefix}-care-water`,
            sourceKey: "sailor-care",
            scopeKey: `${scopePrefix}-care`,
            locator: "draw and expel clean water five to six times",
          },
        ],
      },
      {
        key: `${scopePrefix}-media-boundary`,
        predicate: "media_identity_boundary",
        objectText:
          "主图是本站原创、无 logo／无刻字的事实性 SVG，不是产品照片，不证明实物色泽、光泽、比例或生产批次。",
        factClass: "editorial",
        confidence: 1,
        sourceKey: input.mediaSourceKey,
        locator: "site-original factual SVG provenance and disclaimer",
        evidence: [
          {
            key: `${scopePrefix}-media-disclaimer`,
            sourceKey: input.mediaSourceKey,
            scopeKey: `${scopePrefix}-media`,
            locator: "product-photo=false;logo=false;engraving=false",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: PHASE31_SAILOR_BRAND_ID,
      values: {
        series_name: `Sailor Profit ${input.key}（${input.productCode}）`,
        release_year: "2025",
        nib: `${input.gold} 大型金尖；EF、F、MF、M、B、Z、MS`,
        fill_system: "Sailor 墨囊／上墨器两用式",
        material: input.material,
        dimensions: "最大径 φ18 mm × 全长 141 mm（含笔夹）",
        weight: "21.6 g",
        price_range: `日本官网 2026-07-19 快照：EF/F/MF/M/B 为 ${input.regularPrice}；Z/MS 为 ${input.specialPrice}`,
        status: `日本官网当前商品页可见；2025-12-13 发售；${input.colours.map((colour) => colour.name).join("、")}`,
      },
      evidence: [
        {
          key: `${scopePrefix}-brand`,
          fieldKey: "brand_entity_id",
          sourceKey: input.sourceKey,
          scopeKey: `${scopePrefix}-current`,
          locator: `official Sailor ${input.productCode} product page`,
        },
        {
          key: `${scopePrefix}-series`,
          fieldKey: "series_name",
          sourceKey: input.sourceKey,
          scopeKey: `${scopePrefix}-current`,
          locator: `Profit ${input.key} title and ${input.productCode} item codes`,
        },
        {
          key: `${scopePrefix}-release-year`,
          fieldKey: "release_year",
          sourceKey: "sailor-profit14-18-launch",
          scopeKey: `${scopePrefix}-launch`,
          locator: "2025-12-13 nationwide release sentence",
        },
        {
          key: `${scopePrefix}-nib`,
          fieldKey: "nib",
          sourceKey: input.sourceKey,
          scopeKey: `${scopePrefix}-current`,
          locator: `${input.gold} large nib and seven item-code widths`,
        },
        {
          key: `${scopePrefix}-fill`,
          fieldKey: "fill_system",
          sourceKey: input.sourceKey,
          scopeKey: `${scopePrefix}-current`,
          locator: "converter and cartridge filling field",
        },
        {
          key: `${scopePrefix}-material`,
          fieldKey: "material",
          sourceKey: input.sourceKey,
          scopeKey: `${scopePrefix}-current`,
          locator: "PMMA body and Gold IP metal fields",
        },
        ...(input.key === "18"
          ? [
              {
                key: `${scopePrefix}-material-shining`,
                fieldKey: "material" as const,
                sourceKey: "sailor-profit14-18-launch",
                scopeKey: `${scopePrefix}-current`,
                locator:
                  "Profit 18 announcement paragraph describing micro pearl particles and glittering material in the four Shining colours",
              },
            ]
          : []),
        {
          key: `${scopePrefix}-dimensions`,
          fieldKey: "dimensions",
          sourceKey: input.sourceKey,
          scopeKey: `${scopePrefix}-current`,
          locator: "phi 18 by 141 mm including clip",
        },
        {
          key: `${scopePrefix}-weight`,
          fieldKey: "weight",
          sourceKey: input.sourceKey,
          scopeKey: `${scopePrefix}-current`,
          locator: "catalog weight 21.6 g",
        },
        {
          key: `${scopePrefix}-price`,
          fieldKey: "price_range",
          sourceKey: input.sourceKey,
          scopeKey: `${scopePrefix}-current`,
          locator: `${input.regularPrice} regular widths and ${input.specialPrice} Zoom/Music`,
        },
        {
          key: `${scopePrefix}-status`,
          fieldKey: "status",
          sourceKey: input.sourceKey,
          scopeKey: `${scopePrefix}-current`,
          locator: "live product page and four colour groups retrieved 2026-07-19",
        },
      ],
    },
    media: [
      {
        key: `${scopePrefix}-factual-primary`,
        title: `Profit ${input.key} 规格事实卡（本站原创；非产品照片）`,
        sourceKey: input.mediaSourceKey,
        localPath: input.mediaPath,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText: `Fountain Pen Graph 本站原创 factual SVG。用于呈现 Profit ${input.key} 的已核规格；非 Sailor 产品照片，未复制 Sailor 官网图片，不含 Sailor logo、锚形商标或可验证笔尖刻字。抽象色块、光点与通用轮廓不代表 ${input.productCode} 的实物色泽、光泽、比例、表面加工或生产批次，不能作为鉴定证据。`,
        sourceUrl: input.mediaPath,
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: `${scopePrefix}-announced`,
        title: `Profit ${input.key} 正式公布`,
        eventType: "design_milestone",
        startDate: "2025-12-03",
        circa: false,
        description: "Sailor 发布新品公告；这不是日本发售日。",
        sourceKey: "sailor-profit14-18-launch",
      },
      {
        key: `${scopePrefix}-released`,
        title: `Profit ${input.key} 在日本发售`,
        eventType: "model_released",
        startDate: "2025-12-13",
        circa: false,
        description: "官方公告所列日本全国发售日。",
        sourceKey: "sailor-profit14-18-launch",
      },
    ],
  };
}

const profit14Pack = profitPack({
  key: "14",
  entityId: PHASE31_PROFIT_14_ID,
  expectedSlug: "sailor-profit-14",
  productCode: "11-1214",
  sourceKey: "sailor-profit14",
  secondarySourceKey: "phase31-biccamera-profit14",
  markdownFile:
    ".planning/content-research/sailor-profit-14-publishable-content-2026-07-19.md",
  gold: "14K",
  colours: [
    {
      name: "Black",
      suffix: "20",
      codes: "11-1214-120/220/320/420/620/720/920",
    },
    {
      name: "Red",
      suffix: "30",
      codes: "11-1214-130/230/330/430/630/730/930",
    },
    {
      name: "Blue",
      suffix: "40",
      codes: "11-1214-140/240/340/440/640/740/940",
    },
    {
      name: "Green",
      suffix: "60",
      codes: "11-1214-160/260/360/460/660/760/960",
    },
  ],
  material: "Black／Red／Blue／Green PMMA；金属部件为 Gold IP",
  regularPrice: "¥55,000",
  specialPrice: "¥57,200",
  mediaSourceKey: "phase31-profit-14-factual-svg",
  mediaPath:
    "/images/library/site-original/sailor-p0/sailor-profit-14-factual.svg",
});

const profit18Pack = profitPack({
  key: "18",
  entityId: PHASE31_PROFIT_18_ID,
  expectedSlug: "sailor-profit-18",
  productCode: "11-2218",
  sourceKey: "sailor-profit18",
  secondarySourceKey: "phase31-biccamera-profit18",
  markdownFile:
    ".planning/content-research/sailor-profit-18-publishable-content-2026-07-19.md",
  gold: "18K",
  colours: [
    {
      name: "Shining Black",
      suffix: "20",
      codes: "11-2218-120/220/320/420/620/720/920",
    },
    {
      name: "Shining Red",
      suffix: "30",
      codes: "11-2218-130/230/330/430/630/730/930",
    },
    {
      name: "Shining Blue",
      suffix: "40",
      codes: "11-2218-140/240/340/440/640/740/940",
    },
    {
      name: "Shining Green",
      suffix: "60",
      codes: "11-2218-160/260/360/460/660/760/960",
    },
  ],
  material:
    "含微细珠光粒子／光辉材料的 Shining PMMA；金属部件为 Gold IP",
  regularPrice: "¥66,000",
  specialPrice: "¥68,200",
  mediaSourceKey: "phase31-profit-18-factual-svg",
  mediaPath:
    "/images/library/site-original/sailor-p0/sailor-profit-18-factual.svg",
});

const sailorBrandPack = phase29SailorPacks[0];
if (!sailorBrandPack || sailorBrandPack.entityId !== PHASE31_SAILOR_BRAND_ID) {
  throw new Error("Phase 31 cannot resolve the canonical Phase 29 Sailor brand pack.");
}

export const phase31SailorP0Packs: CuratedEntityPack[] = [
  sailorBrandPack,
  professionalGearPack,
  profit14Pack,
  profit18Pack,
];
