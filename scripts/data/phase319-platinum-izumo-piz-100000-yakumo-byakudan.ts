import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase78PlatinumCuridasPacks } from "./phase78-platinum-curidas";

export const PHASE319_PLATINUM_BRAND_ID = "e51tJpejEkXY";
export const PHASE319_BYAKUDAN_ID =
  "phase319-platinum-izumo-piz-100000-yakumo-byakudan";
export const PHASE319_BYAKUDAN_SLUG =
  "platinum-izumo-piz-100000-yakumo-byakudan";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase319-piz-100000-current";
const BOUNDARY_SCOPE = "phase319-piz-100000-boundaries";
const CARE_SCOPE = "phase319-piz-100000-care";

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
  const registryKey = input.registryKey ?? "platinum-official-phase319";
  return {
    key: input.key,
    registryKey,
    registryName:
      input.registryName ??
      (sourceType === "official"
        ? "Platinum Pen Co., Ltd."
        : "Fountain Pen Graph editorial studio"),
    sourceType,
    tier: input.tier ?? "primary",
    independenceGroup: registryKey,
    title: input.title,
    url: input.url,
    homepageUrl:
      input.homepageUrl ??
      (sourceType === "official" ? "https://www.platinum-pen.co.jp/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author:
      input.author ??
      (sourceType === "official"
        ? "Platinum Pen Co., Ltd."
        : "Fountain Pen Graph editorial"),
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

function claim(
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
    confidence: factClass === "core" ? 0.98 : 0.94,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  product: web({
    key: "phase319-byakudan-product",
    title: "Platinum Izumo 八雲塗り『八雲白檀』 PIZ-100000",
    url: "https://www.platinum-pen.co.jp/products/fountain-pen/2061/",
    summary:
      "Platinum 日本官方产品页确认 PIZ-100000、#19 八云白檀、大型18K F/M/B、154 mm、18 mm、33.3 g 与 Converter-800A 等附件。",
    locator:
      "PIZ-100000 heading; 八雲白檀 description; nib, material, size, weight and accessory fields",
  }),
  family: web({
    key: "phase319-byakudan-family",
    title: "Platinum Izumo 官方品牌页",
    url: "https://www.platinum-pen.co.jp/brands/izumo/",
    summary:
      "官方 Izumo 品牌页将 PIZ-100000 #19 八云白檀与 PIZ-80000N #91/#92、其他出云产品分开列出。",
    locator: "IZUMO'S LINEUP exact PIZ-100000 #19 and adjacent product numbers",
  }),
  press: web({
    key: "phase319-byakudan-press",
    title: "高級万年筆『出雲』ブランドに出雲大社の天井絵をモチーフにした軸",
    url: "https://www.platinum-pen.co.jp/news/8602/",
    publishedAt: "2015-11-19",
    summary:
      "Platinum 官方新闻稿确认以出云大社天井画为题材的八云塗系列，并列出 PIZ-100000 #19 八云白檀。",
    locator: "PIZ-100000 #19 八雲白檀 product-number entry and cloud motif",
  }),
  maintenance: web({
    key: "phase319-byakudan-maintenance",
    title: "Platinum Izumo 官方使用与维护手册",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/izumo.pdf",
    summary:
      "Izumo 官方手册用于墨囊/转换器取下、清水或温水清洁笔尖和干燥边界；漆面不应使用强溶剂或胶带。",
    locator: "PIZ-100000 care caution; cartridge removal, nib rinse and dry-cloth instructions",
  }),
  catalog: web({
    key: "phase319-byakudan-catalog",
    title: "Platinum Fine Writing catalog 2019–2020",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/Platinum-pen-general-catalog-2019-2020.pdf",
    publishedAt: "2019-01-01",
    summary:
      "官方目录把 PIZ-100000 #19 Yakumo Byakudan 的 18K F/M/B、ebonite、154 mm、18 mm 与 33.3 g 列为独立条目。",
    locator: "PDF Izumo PIZ-100000 #19 specifications and product-number table",
  }),
  announcement: web({
    key: "phase319-byakudan-usa-announcement",
    title: "The Izumo Byakudan",
    url: "https://platinumpenusa.com/whats-new/the-izumo-byakudan/",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "platinum-pen-usa-phase319",
    registryName: "Platinum Pen USA",
    homepageUrl: "https://platinumpenusa.com/",
    author: "Platinum Pen USA",
    publishedAt: "2015-11-19",
    summary:
      "Platinum Pen USA 记录 PIZ-100000 #19 Yakumo Byakudan 的出云天井云纹题材、ebonite、18K F/M/B、154×18 mm 与 33.3 g。",
    locator: "Product number, urushi story and specification list",
  }),
  collection: web({
    key: "phase319-byakudan-usa-collection",
    title: "Platinum Pen USA Izumo Collection",
    url: "https://platinumpenusa.com/luxury-writing/izumo-collection/",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "platinum-pen-usa-phase319",
    registryName: "Platinum Pen USA",
    homepageUrl: "https://platinumpenusa.com/",
    author: "Platinum Pen USA",
    summary:
      "区域经销页把 PIZ-100000 #19 Byakudan 与 PIZ-80000N #91/#92、PIZ-55000 等相邻型号并列，支持产品号边界。",
    locator: "Izumo Collection lineup and PIZ-100000 #19 entry",
  }),
  diagram: web({
    key: "phase319-byakudan-svg",
    title: "PIZ-100000 Yakumo Byakudan factual diagram",
    url: "/images/library/site-original/phase319/platinum/izumo-piz-100000-yakumo-byakudan.svg",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase319",
    summary:
      "本站原创事实 SVG，标出 PIZ-100000、#19 八云白檀与规格边界；非产品照片。",
    locator: "site-original factual SVG metadata",
  }),
} as const;

const inheritedBrand = phase78PlatinumCuridasPacks.find(
  (pack) =>
    pack.entityId === PHASE319_PLATINUM_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 319 Platinum brand pack is unavailable.");

const model: CuratedEntityPack = {
  key: "phase319-platinum-izumo-piz-100000-yakumo-byakudan-v1",
  entityId: PHASE319_BYAKUDAN_ID,
  expectedType: "pen",
  expectedSlug: PHASE319_BYAKUDAN_SLUG,
  canonicalName: "Platinum Izumo PIZ-100000 八云白檀",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/platinum-izumo-piz-100000-yakumo-byakudan-phase319.md",
  storyTitle: "Platinum Izumo PIZ-100000：八云白檀 #19",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Platinum Izumo Yakumo Byakudan PIZ-100000 #19",
      language: "en",
      sourceKey: S.announcement.key,
    },
    {
      alias: "八雲塗り 八雲白檀 PIZ-100000",
      language: "ja",
      sourceKey: S.product.key,
    },
    {
      alias: "白金 出云 八云白檀",
      language: "zh",
      sourceKey: S.family.key,
    },
  ],
  sources: [
    S.product,
    S.family,
    S.press,
    S.maintenance,
    S.catalog,
    S.announcement,
    S.collection,
    S.diagram,
  ],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Platinum Izumo Yakumonuri Yakumo Byakudan",
      validFrom: "2015-11-19",
      productionState: "current",
      nibScope: "Large 18K F/M/B",
      materialScope:
        "ebonite body, Yakumonuri Yakumo Byakudan urushi finish, AS resin grip; Platinum cartridge/converter",
      editionScope: "PIZ-100000 #19 Yakumo Byakudan",
    },
    {
      key: BOUNDARY_SCOPE,
      scopeKey: BOUNDARY_SCOPE,
      productionState: "current",
      editionScope:
        "Independent from PIZ-80000N #91/#92, PIZ-55000, PIZ-50000T and PBA-120000G/Y",
    },
    {
      key: CARE_SCOPE,
      scopeKey: CARE_SCOPE,
      productionState: "current",
      editionScope:
        "Platinum cartridge/converter cleaning; no long soaking, sanding, waxing, solvent or glue repair for ebonite/urushi finish",
    },
  ],
  claims: [
    claim(
      "phase319-byakudan-identity",
      "model_identity",
      "PIZ-100000 是 Platinum Izumo 八云塗八云白檀型号，官方颜色/工艺编号为 #19 Yakumo Byakudan。",
      S.product.key,
      "PIZ-100000 and 八雲白檀 heading",
    ),
    claim(
      "phase319-byakudan-craft",
      "craft_process",
      "官方说明以金粉完成底地、以银粉表现云气，题材来自出云大社天井画，随后施溜塗漆层；不外推单支笔的云纹、漆层数量或工匠。",
      S.product.key,
      "description of gold powder, silver cloud motif and 溜塗",
    ),
    claim(
      "phase319-byakudan-spec",
      "specification",
      "官方规格为大型 18K（18-21）铑镀层染分け F/M/B 尖、ebonite 笔身、AS 树脂握位、154 mm、18 mm、33.3 g。",
      S.product.key,
      "nib, material, size and weight fields",
    ),
    claim(
      "phase319-byakudan-fill",
      "filling_and_care",
      "PIZ-100000 使用 Platinum 专用墨囊与 Converter-800A；日本产品页列笔衣、蓝黑墨囊和出云桐箱。",
      S.product.key,
      "accessory fields",
    ),
    claim(
      "phase319-byakudan-boundary",
      "identity_boundaries",
      "PIZ-100000 #19 与 PIZ-80000N #91/#92、PIZ-55000、PIZ-50000T、PBA-120000G/Y 使用不同产品号与材料/工艺路线，不能共享图片或规格。",
      S.family.key,
      "IZUMO lineup product-number separation",
    ),
    claim(
      "phase319-byakudan-history",
      "release_history",
      "Platinum USA 与日本官方新闻资料将八云白檀列为 2015 年推出的出云天井画题材产品；日期用于历史定位，不代表各地区同日上市。",
      S.press.key,
      "2015 announcement and PIZ-100000 #19 entry",
    ),
    claim(
      "phase319-byakudan-retailer",
      "market_crosscheck",
      "Platinum Pen USA 交叉记录 PIZ-100000 #19 Yakumo Byakudan 的 ebonite、18K F/M/B、154×18 mm 与 33.3 g；区域经销页不替代制造商库存口径。",
      S.announcement.key,
      "retailer product-number and specification fields",
    ),
    claim(
      "phase319-byakudan-media",
      "media_identity_boundary",
      "主图是本站原创事实 SVG，非产品照片，不证明真实云纹、颜色、比例、Logo、刻字、库存或实物品相。",
      S.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase319-byakudan-19",
      name: "#19 Yakumo Byakudan 八云白檀",
      notes: "PIZ-100000 的官方工艺/颜色路线；不拆成第二个型号。",
      sourceKey: S.product.key,
      variantKind: "material",
      productCode: "PIZ-100000 #19",
      market: "日本/国际经销",
    },
    {
      key: "phase319-byakudan-nibs",
      name: "大型 18K F / M / B",
      notes: "同一 PIZ-100000 下的字幅选择。",
      sourceKey: S.product.key,
      variantKind: "nib",
      productCode: "PIZ-100000",
      market: "日本/国际经销",
    },
  ],
  spec: {
    brandEntityId: PHASE319_PLATINUM_BRAND_ID,
    values: {
      series_name: "Platinum Izumo Yakumonuri PIZ-100000",
      release_year: "2015",
      origin_country: "日本品牌；Izumo 出云系列",
      nib: "大型 18K（18-21）金尖；铑镀层染分け；F、M、B",
      fill_system: "Platinum 专用墨囊／Converter-800A 转换器",
      material: "ebonite 笔身；八云塗八云白檀溜塗漆面；AS 树脂握位",
      dimensions: "全长 154 mm × 最大径 18 mm",
      weight: "标准重量 33.3 g",
      price_range: "日本官方当前页面含税 198,000 日元；价格按日期地区核对",
      status: "PIZ-100000 八云白檀；#19 Yakumo Byakudan",
    },
    evidence: [
      evidence("phase319-brand", "brand_entity_id", S.family.key, "Izumo/Platinum product identity"),
      evidence("phase319-series", "series_name", S.product.key, "PIZ-100000 heading"),
      evidence("phase319-release", "release_year", S.press.key, "2015 announcement"),
      evidence("phase319-origin", "origin_country", S.family.key, "Platinum Japanese official context"),
      evidence("phase319-nib", "nib", S.product.key, "18K F/M/B field"),
      evidence("phase319-fill", "fill_system", S.product.key, "Converter-800A field"),
      evidence("phase319-material", "material", S.product.key, "ebonite and Yakumonuri fields"),
      evidence("phase319-dimensions", "dimensions", S.product.key, "154 mm x 18 mm size field"),
      evidence("phase319-weight", "weight", S.product.key, "33.3 g weight field"),
      evidence("phase319-price", "price_range", S.product.key, "current Japanese tax-included price snapshot"),
      evidence("phase319-status", "status", S.family.key, "PIZ-100000 boundary"),
    ],
  },
  timeline: [
    {
      key: "phase319-byakudan-release",
      title: "Izumo 八云白檀发布",
      eventType: "model_released",
      startDate: "2015-11-19",
      circa: false,
      description:
        "Platinum 官方新闻资料公布 PIZ-100000 #19 八云白檀，取材于出云大社天井画的云。",
      sourceKey: S.press.key,
    },
  ],
  media: [
    {
      key: "phase319-byakudan-primary-media",
      title: "PIZ-100000 八云白檀事实卡（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: S.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
      sourceUrl: S.diagram.url,
      usageStatus: "primary",
    },
  ],
};

export const phase319PlatinumIzumoPiz100000YakumoByakudanPacks: CuratedEntityPack[] = [
  inheritedBrand,
  model,
];
