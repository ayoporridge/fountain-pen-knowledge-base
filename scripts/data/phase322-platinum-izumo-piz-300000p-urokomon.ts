import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase78PlatinumCuridasPacks } from "./phase78-platinum-curidas";

export const PHASE322_PLATINUM_BRAND_ID = "e51tJpejEkXY";
export const PHASE322_UROKOMON_ID = "phase322-platinum-izumo-piz-300000p-urokomon";
export const PHASE322_UROKOMON_SLUG = "platinum-izumo-piz-300000p-urokomon";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase322-piz-300000p-current";
const BOUNDARY_SCOPE = "phase322-piz-300000p-boundaries";
const CARE_SCOPE = "phase322-piz-300000p-care";

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
  const registryKey = input.registryKey ?? "platinum-official-phase322";
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
  family: web({
    key: "phase322-urokomon-family",
    title: "Platinum Izumo 官方品牌页",
    url: "https://www.platinum-pen.co.jp/en/brands/detail/?pid=70",
    summary:
      "Platinum 官方 Izumo 页面将 PIZ-300000 #93 Urokomon 与 PIZ-300000A #82 Aurora 分开列出，并给出本漆平蒔绘、螺钿、18K 宽幅尖和尺寸重量资料。",
    locator: "THE UROKOMON PIZ-300000 section; PIZ-300000A Aurora boundary; specification fields",
  }),
  catalog: web({
    key: "phase322-urokomon-catalog",
    title: "Platinum Fine Writing catalog 2019–2020",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/Platinum-pen-general-catalog-2019-2020.pdf",
    publishedAt: "2019-01-01",
    summary:
      "官方目录将 PIZ-300000 #93 Urokomon 列为 18K F/M/B、ebonite、Hira Maki-e/Raden、154 mm、18 mm、33.9 g。",
    locator: "PDF Izumo PIZ-300000 #93 Urokomon product row",
  }),
  usa: web({
    key: "phase322-urokomon-usa",
    title: "Platinum Pen USA Izumo Collection: Urokomon",
    url: "https://platinumpenusa.com/luxury-writing/izumo-collection/",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "platinum-pen-usa-phase322",
    registryName: "Platinum Pen USA",
    homepageUrl: "https://platinumpenusa.com/",
    author: "Platinum Pen USA",
    summary:
      "Platinum Pen USA 用 PIZ-300000P #93 标示 Urokomon，并列本漆平蒔绘加螺钿、18K 宽幅 F/M/B、154×18 mm、33.6 g 与 Converter 500 附件。",
    locator: "PIZ-300000P #93 Urokomon section and accessory/specification list",
  }),
  maintenance: web({
    key: "phase322-urokomon-maintenance",
    title: "Platinum Izumo 官方使用与维护手册",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/02/izumo-1.pdf",
    summary:
      "Izumo 官方手册用于墨囊/转换器取下、清水或温水清洁、阴干以及漆艺表面避免强溶剂和胶带的维护边界。",
    locator: "Izumo cartridge/converter cleaning and lacquer caution",
  }),
  diagram: web({
    key: "phase322-urokomon-svg",
    title: "PIZ-300000 #93 Urokomon factual diagram",
    url: "/images/library/site-original/phase322/platinum/izumo-piz-300000p-urokomon.svg",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase322",
    summary:
      "本站原创事实 SVG，标出 PIZ-300000/#93 Urokomon 与规格边界；非产品照片。",
    locator: "site-original factual SVG metadata",
  }),
} as const;

const inheritedBrand = phase78PlatinumCuridasPacks.find(
  (pack) =>
    pack.entityId === PHASE322_PLATINUM_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 322 Platinum brand pack is unavailable.");

const model: CuratedEntityPack = {
  key: "phase322-platinum-izumo-piz-300000p-urokomon-v1",
  entityId: PHASE322_UROKOMON_ID,
  expectedType: "pen",
  expectedSlug: PHASE322_UROKOMON_SLUG,
  canonicalName: "Platinum Izumo PIZ-300000 #93 鱗文 Urokomon",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/platinum-izumo-piz-300000p-urokomon-phase322.md",
  storyTitle: "Platinum Izumo PIZ-300000 #93：鱗文 Urokomon",
  primarySourceKey: S.family.key,
  depthTier: "A",
  aliases: [
    { alias: "Platinum Izumo PIZ-300000P #93 Urokomon", language: "en", sourceKey: S.usa.key },
    { alias: "出雲 本漆螺鈿平蒔絵 鱗文 PIZ-300000", language: "ja", sourceKey: S.family.key },
    { alias: "白金 出云 鱗文／鱼鳞纹", language: "zh", sourceKey: S.catalog.key },
  ],
  sources: [S.family, S.catalog, S.usa, S.maintenance, S.diagram],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Platinum Izumo Urokomon",
      validFrom: "2019-01-01",
      productionState: "current",
      nibScope: "18K gold wide F/M/B; USA lists 18-21",
      materialScope: "ebonite body, Hon-Urushi Hira Maki-e with raden, AS resin grip, gold-finish beryllium copper clip",
      editionScope: "PIZ-300000 #93 Urokomon; regional USA page uses PIZ-300000P",
    },
    {
      key: BOUNDARY_SCOPE,
      scopeKey: BOUNDARY_SCOPE,
      productionState: "current",
      editionScope: "Independent from PIZ-300000A #82 Aurora, PIZ-150000C #1, PIZ-120000K and PIZ-100000",
    },
    {
      key: CARE_SCOPE,
      scopeKey: CARE_SCOPE,
      productionState: "current",
      editionScope: "Platinum cartridge/converter cleaning; no long soaking, sanding, waxing, solvent or glue repair for urushi/raden finish",
    },
  ],
  claims: [
    claim("phase322-urokomon-identity", "model_identity", "PIZ-300000 #93 是 Platinum Izumo Urokomon 鱗文型号；Platinum Pen USA 另以 PIZ-300000P #93 标示同一产品条目。", S.family.key, "THE UROKOMON heading and product number; USA regional SKU boundary"),
    claim("phase322-urokomon-craft", "craft_process", "官方资料说明在 ebonite 本漆底层上以 Hira Maki-e 平蒔绘并加入螺钿，表达古来吉祥的鱼鳞纹；不外推单支笔的贝片数量或纹样位置。", S.usa.key, "Hon-Urushi Raden Maki-e Urokomon description"),
    claim("phase322-urokomon-spec", "specification", "官方目录列大型 18K F/M/B 尖、ebonite、Hira Maki-e/Raden、154 mm、最大径 18 mm、33.9 g；美国资料列 33.6 g。", S.catalog.key, "PIZ-300000 #93 specification row"),
    claim("phase322-urokomon-fill", "filling_and_care", "美国资料列蓝黑 30 cc 墨水、一支墨囊和 Converter 500；Izumo 手册提供清洗与漆面维护边界。", S.usa.key, "accessories list; Izumo maintenance handbook"),
    claim("phase322-urokomon-boundary", "identity_boundaries", "PIZ-300000 #93 与 PIZ-300000A #82 Aurora 使用不同产品号、图案和蒔绘路线，不能共享图片或规格。", S.family.key, "Urokomon and Aurora adjacent entries"),
    claim("phase322-urokomon-weight-conflict", "source_conflict", "官方目录 33.9 g 与 Platinum Pen USA 33.6 g 是来源快照差异；本页并列记录，不将其解释为另一个型号。", S.catalog.key, "catalog 33.9 g versus USA 33.6 g", "editorial"),
    claim("phase322-urokomon-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明真实颜色、比例、Logo、序号、库存或实物品相。", S.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    {
      key: "phase322-urokomon-93",
      name: "#93 Urokomon 鱗文",
      notes: "PIZ-300000 的官方图案编号；美国页面把区域 SKU 写为 PIZ-300000P #93。",
      sourceKey: S.family.key,
      variantKind: "material",
      productCode: "PIZ-300000 #93 / PIZ-300000P #93",
      market: "日本/国际经销",
    },
    {
      key: "phase322-urokomon-nibs",
      name: "18K gold wide F / M / B",
      notes: "同一 Urokomon 型号下的尖幅选择；美国资料标作 18-21 宽幅尖。",
      sourceKey: S.catalog.key,
      variantKind: "nib",
      productCode: "PIZ-300000",
      market: "日本/国际经销",
    },
  ],
  spec: {
    brandEntityId: PHASE322_PLATINUM_BRAND_ID,
    values: {
      series_name: "Platinum Izumo PIZ-300000 #93 Urokomon",
      release_year: "2019",
      origin_country: "日本品牌；Izumo 出云工艺系列",
      nib: "18K gold wide（18-21）；F、M、B",
      fill_system: "Platinum 墨囊／Converter 500（4704000）",
      material: "ebonite；Hon-Urushi Hira Maki-e with raden；AS 树脂握位；铍铜镀金色笔夹",
      dimensions: "154 mm（书写时约 134 mm）× 最大径 18 mm",
      weight: "官方目录 33.9 g；Platinum Pen USA 33.6 g",
      price_range: "官方 2019–2020 目录对应 300,000 日元级；当前价格按日期、地区和库存核对",
      status: "PIZ-300000 #93 Urokomon；美国页面另标 PIZ-300000P",
    },
    evidence: [
      evidence("phase322-brand", "brand_entity_id", S.family.key, "Izumo/Platinum product identity"),
      evidence("phase322-series", "series_name", S.family.key, "THE UROKOMON PIZ-300000 heading"),
      evidence("phase322-release", "release_year", S.catalog.key, "2019–2020 official catalog context"),
      evidence("phase322-origin", "origin_country", S.family.key, "Platinum Japanese official context"),
      evidence("phase322-nib", "nib", S.catalog.key, "18K F/M/B field"),
      evidence("phase322-fill", "fill_system", S.usa.key, "Converter 500 and cartridge fields"),
      evidence("phase322-material", "material", S.family.key, "ebonite, Hira Maki-e and raden fields"),
      evidence("phase322-dimensions", "dimensions", S.family.key, "154 mm x 18 mm size field"),
      evidence("phase322-weight", "weight", S.catalog.key, "33.9 g catalog snapshot"),
      evidence("phase322-price", "price_range", S.catalog.key, "PIZ-300000 price tier context"),
      evidence("phase322-status", "status", S.usa.key, "PIZ-300000P #93 regional boundary"),
    ],
  },
  timeline: [
    {
      key: "phase322-urokomon-catalog-release",
      title: "Izumo Urokomon #93 目录快照",
      eventType: "model_released",
      startDate: "2019-01-01",
      circa: true,
      description: "Platinum 2019–2020 官方目录将 PIZ-300000 #93 Urokomon 作为独立 Izumo 工艺型号列出。",
      sourceKey: S.catalog.key,
    },
  ],
  media: [
    {
      key: "phase322-urokomon-primary-media",
      title: "PIZ-300000 #93 Urokomon 鱗文事实卡（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: S.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
      sourceUrl: S.diagram.url,
      usageStatus: "primary",
    },
  ],
};

export const phase322PlatinumIzumoPiz300000pUrokomonPacks: CuratedEntityPack[] = [
  inheritedBrand,
  model,
];
