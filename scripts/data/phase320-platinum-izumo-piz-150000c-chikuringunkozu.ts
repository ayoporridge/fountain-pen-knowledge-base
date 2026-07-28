import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase78PlatinumCuridasPacks } from "./phase78-platinum-curidas";

export const PHASE320_PLATINUM_BRAND_ID = "e51tJpejEkXY";
export const PHASE320_CHIKURINGUNKOZU_ID =
  "phase320-platinum-izumo-piz-150000c-chikuringunkozu";
export const PHASE320_CHIKURINGUNKOZU_SLUG =
  "platinum-izumo-piz-150000c-chikuringunkozu";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase320-piz-150000c-current";
const BOUNDARY_SCOPE = "phase320-piz-150000c-boundaries";
const CARE_SCOPE = "phase320-piz-150000c-care";

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
  const registryKey = input.registryKey ?? "platinum-official-phase320";
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
  catalog: web({
    key: "phase320-chikuringunkozu-catalog",
    title: "Platinum Fine Writing catalog 2019–2020",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/Platinum-pen-general-catalog-2019-2020.pdf",
    publishedAt: "2019-01-01",
    summary:
      "官方目录将 PIZ-150000C #1 Chikuringunkozu 列为 18K F/M/B、ebonite、Sumiko Taka Maki-e、154 mm、18 mm、33.8 g。",
    locator: "PDF p.08 Izumo Shikkoku Chikuringunkozu PIZ-150000C row",
  }),
  price: web({
    key: "phase320-chikuringunkozu-price",
    title: "Platinum 官方价格与型号资料（2019）",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2019/12/56f2878addfb2165fb4f337114653fdb.pdf",
    publishedAt: "2019-12-01",
    summary:
      "官方价格资料把 PIZ-150000C 列为出云炭粉高蒔绘、#1、未税 150,000 日元，并列 F/M/B 商品代码。",
    locator: "PIZ-150000C product-number, #1 and price table",
  }),
  family: web({
    key: "phase320-chikuringunkozu-family",
    title: "Platinum Izumo 官方品牌页",
    url: "https://www.platinum-pen.co.jp/en/brands/detail/?pid=70",
    summary:
      "官方 Izumo 品牌页将 PIZ-150000C 与 PIZ-100000、PIZ-80000N、PIZ-300000A 等相邻产品分开导航。",
    locator: "IZUMO lineup product-number separation",
  }),
  maintenance: web({
    key: "phase320-chikuringunkozu-maintenance",
    title: "Platinum Izumo 官方使用与维护手册",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/02/izumo-1.pdf",
    summary:
      "Izumo 官方手册用于墨囊/转换器取下、清水或温水清洁与干燥边界；漆艺表面不应使用强溶剂或胶带。",
    locator: "Izumo cartridge/converter cleaning and lacquer caution",
  }),
  usa: web({
    key: "phase320-chikuringunkozu-usa",
    title: "Platinum Pen USA Izumo Collection: Tiger in Bamboo Forest",
    url: "https://platinumpenusa.com/luxury-writing/izumo-collection/",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "platinum-pen-usa-phase320",
    registryName: "Platinum Pen USA",
    homepageUrl: "https://platinumpenusa.com/",
    author: "Platinum Pen USA",
    summary:
      "Platinum Pen USA 记录 PIZ-150000C #1 Tiger in Bamboo Forest、炭粉高蒔绘题材与限量 600 支语境，并列 18kt F/M/B。",
    locator: "PIZ-150000C #1 Chikuringunkozu, charcoal powder maki-e and limited 600 entry",
  }),
  retailer: web({
    key: "phase320-chikuringunkozu-retailer",
    title: "You Style：Platinum Izumo PIZ-150000C",
    url: "https://store.shopping.yahoo.co.jp/youstyle-pen/you-pla-piz-150000c-1.html",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "you-style-phase320",
    registryName: "You Style",
    homepageUrl: "https://store.shopping.yahoo.co.jp/youstyle-pen/",
    author: "You Style",
    summary:
      "专业零售页交叉列出 PIZ-150000C-1、18K F/M/B、154 mm（书写时约 134 mm）、18 mm、33.8 g、Converter/墨囊与桐箱；不替代官方库存和限量口径。",
    locator: "PIZ-150000C-1 product specification, filling and accessory fields",
  }),
  diagram: web({
    key: "phase320-chikuringunkozu-svg",
    title: "PIZ-150000C Chikuringunkozu factual diagram",
    url: "/images/library/site-original/phase320/platinum/izumo-piz-150000c-chikuringunkozu.svg",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase320",
    summary:
      "本站原创事实 SVG，标出 PIZ-150000C、#1、炭粉高蒔绘与规格边界；非产品照片。",
    locator: "site-original factual SVG metadata",
  }),
} as const;

const inheritedBrand = phase78PlatinumCuridasPacks.find(
  (pack) =>
    pack.entityId === PHASE320_PLATINUM_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 320 Platinum brand pack is unavailable.");

const model: CuratedEntityPack = {
  key: "phase320-platinum-izumo-piz-150000c-chikuringunkozu-v1",
  entityId: PHASE320_CHIKURINGUNKOZU_ID,
  expectedType: "pen",
  expectedSlug: PHASE320_CHIKURINGUNKOZU_SLUG,
  canonicalName: "Platinum Izumo PIZ-150000C 漆黑竹林群虎图",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/platinum-izumo-piz-150000c-chikuringunkozu-phase320.md",
  storyTitle: "Platinum Izumo PIZ-150000C：漆黑竹林群虎图 #1",
  primarySourceKey: S.catalog.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Platinum Izumo Shikkoku Chikuringunkozu PIZ-150000C #1",
      language: "en",
      sourceKey: S.usa.key,
    },
    {
      alias: "出雲 炭粉高蒔絵 漆黒 竹林群虎図 PIZ-150000C",
      language: "ja",
      sourceKey: S.price.key,
    },
    {
      alias: "白金 出云 炭粉高蒔绘 竹林群虎图",
      language: "zh",
      sourceKey: S.family.key,
    },
  ],
  sources: [
    S.catalog,
    S.price,
    S.family,
    S.maintenance,
    S.usa,
    S.retailer,
    S.diagram,
  ],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Platinum Izumo Shikkoku Chikuringunkozu",
      validFrom: "2019-12-01",
      productionState: "current",
      nibScope: "Large 18K F/M/B with ruthenium finish",
      materialScope:
        "ebonite body, black Sumiko-age Taka Maki-e urushi surface, AS resin grip; Platinum cartridge/converter",
      editionScope: "PIZ-150000C #1 Chikuringunkozu",
    },
    {
      key: BOUNDARY_SCOPE,
      scopeKey: BOUNDARY_SCOPE,
      productionState: "current",
      editionScope:
        "Independent from PIZ-120000K, PIZ-100000, PIZ-80000N, PIZ-160000, PIZ-300000A and PBA-120000G/Y",
    },
    {
      key: CARE_SCOPE,
      scopeKey: CARE_SCOPE,
      productionState: "current",
      editionScope:
        "Platinum cartridge/converter cleaning; no long soaking, sanding, waxing, solvent or glue repair for urushi/maki-e finish",
    },
  ],
  claims: [
    claim(
      "phase320-chikuringunkozu-identity",
      "model_identity",
      "PIZ-150000C 是 Platinum Izumo 漆黑炭粉高蒔绘型号，官方图案编号为 #1 Chikuringunkozu 竹林群虎图。",
      S.catalog.key,
      "PIZ-150000C #1 heading",
    ),
    claim(
      "phase320-chikuringunkozu-craft",
      "craft_process",
      "官方资料说明在哑黑 ebonite 轴体上分层堆叠炭粉，以 Sumiko-age Taka Maki-e 和漆面明暗表现竹林与虎的立体感；不外推单支笔的炭粉层数、工匠或图案位置。",
      S.usa.key,
      "charcoal powder maki-e and tiger-in-bamboo description",
    ),
    claim(
      "phase320-chikuringunkozu-spec",
      "specification",
      "官方目录规格为大型 18K F/M/B 尖、ebonite、Sumiko Taka Maki-e、全长 154 mm、最大径 18 mm、标准重量 33.8 g。",
      S.catalog.key,
      "PIZ-150000C specifications row",
    ),
    claim(
      "phase320-chikuringunkozu-fill",
      "filling_and_care",
      "PIZ-150000C 使用 Platinum 墨囊／转换器；零售规格列笔衣、蓝黑墨囊、瓶装墨、专用 Converter 与桐箱，地区包装以实物清单为准。",
      S.retailer.key,
      "filling and accessory fields",
    ),
    claim(
      "phase320-chikuringunkozu-boundary",
      "identity_boundaries",
      "PIZ-150000C #1 与 PIZ-120000K、PIZ-100000、PIZ-80000N、PIZ-160000、PIZ-300000A、PBA-120000G/Y 使用不同产品号和工艺/材料路线，不能共享图片或规格。",
      S.family.key,
      "Izumo lineup product-number separation",
    ),
    claim(
      "phase320-chikuringunkozu-edition",
      "edition_boundary",
      "Platinum Pen USA 将 PIZ-150000C #1 记为限量 600 支；限量语境不改变 F/M/B 是同一型号下的尖幅变体，也不证明二手单支状态。",
      S.usa.key,
      "limited 600 entry",
    ),
    claim(
      "phase320-chikuringunkozu-retailer",
      "market_crosscheck",
      "You Style 以 PIZ-150000C-1 交叉记录大型 18K F/M/B、154 mm、18 mm、33.8 g 与墨囊/转换器；零售页不替代官方限量和库存口径。",
      S.retailer.key,
      "retailer product-code and specification fields",
    ),
    claim(
      "phase320-chikuringunkozu-media",
      "media_identity_boundary",
      "主图是本站原创事实 SVG，非产品照片，不证明真实虎纹、颜色、比例、Logo、序号、库存或实物品相。",
      S.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase320-chikuringunkozu-1",
      name: "#1 Chikuringunkozu 漆黑竹林群虎图",
      notes: "PIZ-150000C 的官方图案/工艺路线；不拆成第二个型号。",
      sourceKey: S.catalog.key,
      variantKind: "material",
      productCode: "PIZ-150000C #1",
      market: "日本/国际经销",
    },
    {
      key: "phase320-chikuringunkozu-nibs",
      name: "大型 18K F / M / B",
      notes: "同一 PIZ-150000C 下的字幅选择；钌饰面属于尖面处理。",
      sourceKey: S.catalog.key,
      variantKind: "nib",
      productCode: "PIZ-150000C",
      market: "日本/国际经销",
    },
  ],
  spec: {
    brandEntityId: PHASE320_PLATINUM_BRAND_ID,
    values: {
      series_name: "Platinum Izumo Shikkoku Chikuringunkozu PIZ-150000C",
      release_year: "2019",
      origin_country: "日本品牌；Izumo 出云系列",
      nib: "大型 18K（18-21）金尖；钌饰面；F、M、B",
      fill_system: "Platinum 专用墨囊／转换器；附件按地区核对",
      material: "ebonite 笔身；漆黑炭粉高蒔绘 Sumiko-age Taka Maki-e；AS 树脂握位",
      dimensions: "全长 154 mm（书写时约 134 mm）× 最大径 18 mm",
      weight: "标准重量 33.8 g",
      price_range: "官方 2019–2020 资料未税 150,000 日元；当前价格按日期地区核对",
      status: "PIZ-150000C #1 Chikuringunkozu；限量 600 支语境",
    },
    evidence: [
      evidence("phase320-brand", "brand_entity_id", S.family.key, "Izumo/Platinum product identity"),
      evidence("phase320-series", "series_name", S.catalog.key, "PIZ-150000C heading"),
      evidence("phase320-release", "release_year", S.price.key, "2019 official price/specification sheet"),
      evidence("phase320-origin", "origin_country", S.family.key, "Platinum Japanese official context"),
      evidence("phase320-nib", "nib", S.catalog.key, "18K F/M/B field"),
      evidence("phase320-fill", "fill_system", S.retailer.key, "converter/cartridge fields"),
      evidence("phase320-material", "material", S.catalog.key, "ebonite and Sumiko Taka Maki-e fields"),
      evidence("phase320-dimensions", "dimensions", S.catalog.key, "154 mm x 18 mm size field"),
      evidence("phase320-weight", "weight", S.catalog.key, "33.8 g weight field"),
      evidence("phase320-price", "price_range", S.price.key, "2019 official price snapshot"),
      evidence("phase320-status", "status", S.usa.key, "PIZ-150000C limited-edition boundary"),
    ],
  },
  timeline: [
    {
      key: "phase320-chikuringunkozu-release",
      title: "Izumo 漆黑竹林群虎图发布资料",
      eventType: "model_released",
      startDate: "2019-12-01",
      circa: true,
      description:
        "Platinum 官方价格资料在 2019 年资料中列出 PIZ-150000C #1 漆黑炭粉高蒔绘；目录随后记录其完整规格。",
      sourceKey: S.price.key,
    },
  ],
  media: [
    {
      key: "phase320-chikuringunkozu-primary-media",
      title: "PIZ-150000C 漆黑竹林群虎图事实卡（非产品照片）",
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

export const phase320PlatinumIzumoPiz150000cChikuringunkozuPacks: CuratedEntityPack[] = [
  inheritedBrand,
  model,
];
