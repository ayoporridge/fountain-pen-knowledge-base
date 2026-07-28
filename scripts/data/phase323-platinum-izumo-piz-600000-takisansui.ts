import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase78PlatinumCuridasPacks } from "./phase78-platinum-curidas";

export const PHASE323_PLATINUM_BRAND_ID = "e51tJpejEkXY";
export const PHASE323_TAKISANSUI_ID = "phase323-platinum-izumo-piz-600000-takisansui";
export const PHASE323_TAKISANSUI_SLUG = "platinum-izumo-piz-600000-takisansui";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase323-piz-600000-current";
const BOUNDARY_SCOPE = "phase323-piz-600000-boundaries";
const CARE_SCOPE = "phase323-piz-600000-care";

function web(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  registryKey?: string;
  registryName?: string;
  homepageUrl?: string;
  author?: string;
  publishedAt?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const registryKey = input.registryKey ?? "platinum-official-phase323";
  return {
    key: input.key,
    registryKey,
    registryName:
      input.registryName ??
      (sourceType === "official" ? "Platinum Pen Co., Ltd." : "Fountain Pen Graph editorial studio"),
    sourceType,
    tier: input.tier ?? "primary",
    independenceGroup: registryKey,
    title: input.title,
    url: input.url,
    homepageUrl:
      input.homepageUrl ?? (sourceType === "official" ? "https://www.platinum-pen.co.jp/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author:
      input.author ?? (sourceType === "official" ? "Platinum Pen Co., Ltd." : "Fountain Pen Graph editorial"),
    publishedAt: input.publishedAt ?? null,
    retrievedAt: RETRIEVED,
    allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only",
    license: sourceType === "user_submission" ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator:
      sourceType === "user_submission"
        ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
        : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.94, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }] };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  catalog: web({
    key: "phase323-takisansui-catalog",
    title: "Platinum Fine Writing catalog 2019–2020",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/Platinum-pen-general-catalog-2019-2020.pdf",
    publishedAt: "2019-01-01",
    summary: "官方目录把 PIZ-600000 #56 Takisansui 列为 Kaga Maki-e、18K F/M/B、ebonite、154 mm、18 mm、34.9 g。",
    locator: "PDF p.08 Izumo Kaga Maki-e PIZ-600000 #56 Takisansui row",
  }),
  price: web({
    key: "phase323-takisansui-price",
    title: "Platinum 2023 price revision list",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2022/12/52ea6d6214b3a3003e19c057c7f7fedf-1.pdf",
    publishedAt: "2023-01-16",
    summary: "Platinum 官方价格表列 PIZ-600000 56-2/3/4 的 F/M/B 旧价 600,000、新价 750,000 日元，均为未税。",
    locator: "PDF p.0 PIZ-600000 56-2/3/4 price rows",
  }),
  family: web({
    key: "phase323-takisansui-family",
    title: "Platinum Pen USA Izumo Collection",
    url: "https://platinumpenusa.com/luxury-writing/izumo-collection/",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "platinum-pen-usa-phase323",
    registryName: "Platinum Pen USA",
    homepageUrl: "https://platinumpenusa.com/",
    author: "Platinum Pen USA",
    summary: "Platinum Pen USA 将 Takisansui 与 Hama no Matsu 作为 Izumo Kaga Maki-e 家族分开，并说明 18K 宽幅尖、154×18 mm 和桐箱。",
    locator: "Takisansui/Hama no Matsu Kaga Maki-e entries and shared accessory context",
  }),
  retailer: web({
    key: "phase323-takisansui-retailer",
    title: "Iguana Sell: Platinum Izumo Takisansui PIZ-600000-56",
    url: "https://www.iguanasell.de/products/platinum-izumo-kaga-maki-e-fullfederhalter-takisansui-piz-600000-56",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "iguana-sell-phase323",
    registryName: "Iguana Sell",
    homepageUrl: "https://www.iguanasell.de/",
    author: "Iguana Sell",
    summary: "授权经销商列 PIZ-600000-56、ebonite、18K、墨囊/转换器、154 mm、134 mm 书写长度、18 mm 和 34.5 g。",
    locator: "PIZ-600000-56 product specification fields",
  }),
  maintenance: web({
    key: "phase323-takisansui-maintenance",
    title: "Platinum Izumo 官方使用与维护手册",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/02/izumo-1.pdf",
    summary: "Izumo 官方手册说明墨囊/转换器清洁、清水冲洗和漆艺表面的溶剂与浸泡边界。",
    locator: "Izumo cartridge/converter cleaning and lacquer caution",
  }),
  diagram: web({
    key: "phase323-takisansui-svg",
    title: "PIZ-600000 #56 Takisansui factual diagram",
    url: "/images/library/site-original/phase323/platinum/izumo-piz-600000-takisansui.svg",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase323",
    summary: "本站原创事实 SVG，标出 PIZ-600000 #56、Kaga 高蒔绘和规格边界；非产品照片。",
    locator: "site-original factual SVG metadata",
  }),
} as const;

const inheritedBrand = phase78PlatinumCuridasPacks.find((pack) => pack.entityId === PHASE323_PLATINUM_BRAND_ID && pack.expectedType === "brand");
if (!inheritedBrand) throw new Error("Phase 323 Platinum brand pack is unavailable.");

const model: CuratedEntityPack = {
  key: "phase323-platinum-izumo-piz-600000-takisansui-v1",
  entityId: PHASE323_TAKISANSUI_ID,
  expectedType: "pen",
  expectedSlug: PHASE323_TAKISANSUI_SLUG,
  canonicalName: "Platinum Izumo PIZ-600000 #56 瀑水 Takisansui",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/platinum-izumo-piz-600000-takisansui-phase323.md",
  storyTitle: "Platinum Izumo PIZ-600000 #56：瀑水 Takisansui",
  primarySourceKey: S.catalog.key,
  depthTier: "A",
  aliases: [
    { alias: "Platinum Izumo Kaga Maki-e Takisansui PIZ-600000-56", language: "en", sourceKey: S.retailer.key },
    { alias: "出雲 加賀蒔絵 滝山水 PIZ-600000", language: "ja", sourceKey: S.price.key },
    { alias: "白金 出云 瀑水／瀧山水", language: "zh", sourceKey: S.family.key },
  ],
  sources: [S.catalog, S.price, S.family, S.retailer, S.maintenance, S.diagram],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Platinum Izumo Kaga Maki-e Takisansui",
      validFrom: "2019-01-01",
      productionState: "current",
      nibScope: "18K gold F/M/B",
      materialScope: "ebonite body; Hon-Urushi Taka Maki-e; Platinum cartridge/converter",
      editionScope: "PIZ-600000 #56 Takisansui; retailer SKU PIZ-600000-56",
    },
    {
      key: BOUNDARY_SCOPE,
      scopeKey: BOUNDARY_SCOPE,
      productionState: "current",
      editionScope: "Independent from PIZ-500000 #55, PIZ-300000 #55/#93 and PIZ-300000A #82",
    },
    {
      key: CARE_SCOPE,
      scopeKey: CARE_SCOPE,
      productionState: "current",
      editionScope: "Platinum cartridge/converter cleaning; no long soaking, sanding, waxing, solvent or glue repair for urushi/maki-e finish",
    },
  ],
  claims: [
    claim("phase323-takisansui-identity", "model_identity", "PIZ-600000 #56 是 Platinum Izumo Kaga Maki-e Takisansui（滝山水／瀑水）型号；PIZ-600000-56 是经销商参考 SKU。", S.catalog.key, "PIZ-600000 #56 Takisansui row"),
    claim("phase323-takisansui-craft", "craft_process", "官方目录把表面工艺列为 Taka Maki-e 高蒔绘；题材资料指向瀑布与山水景观，但不外推每支笔的粉末、位置或工匠细节。", S.catalog.key, "Kaga Maki-e/Taka Maki-e and Takisansui title"),
    claim("phase323-takisansui-spec", "specification", "官方目录规格为 18K F/M/B、ebonite、154 mm、最大径 18 mm、34.9 g；授权经销商另列 34.5 g。", S.catalog.key, "PIZ-600000 specification row"),
    claim("phase323-takisansui-price", "price_snapshot", "Platinum 2023 年 1 月价格表将 PIZ-600000 F/M/B 未税新价列为 750,000 日元；这是官方价格快照，不是当前成交价。", S.price.key, "PIZ-600000 56-2/3/4 old/new price rows"),
    claim("phase323-takisansui-boundary", "identity_boundaries", "PIZ-600000 #56 与 PIZ-500000 #55、PIZ-300000 #55/#93、PIZ-300000A #82 具有不同产品号、图案或工艺，不共享图片和重量。", S.family.key, "Izumo Kaga/Aizu lineup boundary"),
    claim("phase323-takisansui-care", "filling_and_care", "经销商列墨囊/转换器，Izumo 官方手册用于清水清洗、阴干和漆面保护边界。", S.retailer.key, "cartridge-converter and accessory fields"),
    claim("phase323-takisansui-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明真实颜色、金银粉、比例、Logo、序号或实物品相。", S.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase323-takisansui-56", name: "#56 Takisansui 瀑水", notes: "PIZ-600000 的官方图案编号；不拆成第二个型号。", sourceKey: S.catalog.key, variantKind: "material", productCode: "PIZ-600000 #56", market: "日本/国际经销" },
    { key: "phase323-takisansui-nibs", name: "18K F / M / B", notes: "同一 PIZ-600000 下的尖幅选择；价格表用 56-2/3/4 区分商品代码。", sourceKey: S.price.key, variantKind: "nib", productCode: "PIZ-600000 56-2/3/4", market: "日本/国际经销" },
  ],
  spec: {
    brandEntityId: PHASE323_PLATINUM_BRAND_ID,
    values: {
      series_name: "Platinum Izumo PIZ-600000 #56 Takisansui",
      release_year: "2019–2020 官方目录快照",
      origin_country: "日本品牌；Izumo Kaga Maki-e 系列",
      nib: "18K gold；F、M、B",
      fill_system: "Platinum 墨囊／转换器；授权经销商列随附 converter",
      material: "ebonite；Hon-Urushi Taka Maki-e 高蒔绘表面",
      dimensions: "154 mm（书写时约 134 mm）× 最大径 18 mm",
      weight: "官方目录 34.9 g；Iguana Sell 34.5 g",
      price_range: "Platinum 2023 价格表未税新价 750,000 日元；当前价格按日期、地区和库存核对",
      status: "PIZ-600000 #56 Takisansui；Kaga Maki-e 高阶型号",
    },
    evidence: [
      evidence("phase323-brand", "brand_entity_id", S.catalog.key, "Izumo/Platinum product identity"),
      evidence("phase323-series", "series_name", S.catalog.key, "PIZ-600000 #56 heading"),
      evidence("phase323-release", "release_year", S.catalog.key, "2019–2020 official catalog context"),
      evidence("phase323-origin", "origin_country", S.catalog.key, "Platinum Japanese official context"),
      evidence("phase323-nib", "nib", S.catalog.key, "18K F/M/B field"),
      evidence("phase323-fill", "fill_system", S.retailer.key, "cartridge-converter field"),
      evidence("phase323-material", "material", S.catalog.key, "ebonite and Taka Maki-e fields"),
      evidence("phase323-dimensions", "dimensions", S.catalog.key, "154 mm x 18 mm size field"),
      evidence("phase323-weight", "weight", S.catalog.key, "34.9 g catalog snapshot"),
      evidence("phase323-price", "price_range", S.price.key, "2023 official price revision"),
      evidence("phase323-status", "status", S.family.key, "Kaga Maki-e family and SKU boundary"),
    ],
  },
  timeline: [{ key: "phase323-takisansui-catalog", title: "Takisansui 目录与价格快照", eventType: "model_released", startDate: "2019-01-01", circa: true, description: "Platinum 2019–2020 目录与后续价格表将 PIZ-600000 #56 Takisansui 作为独立 Kaga Maki-e 型号列出。", sourceKey: S.catalog.key }],
  media: [{ key: "phase323-takisansui-primary-media", title: "PIZ-600000 #56 Takisansui 事实卡（非产品照片）", sourceKey: S.diagram.key, localPath: S.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。", sourceUrl: S.diagram.url, usageStatus: "primary" }],
};

export const phase323PlatinumIzumoPiz600000TakisansuiPacks: CuratedEntityPack[] = [inheritedBrand, model];
