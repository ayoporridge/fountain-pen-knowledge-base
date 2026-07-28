import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase78PlatinumCuridasPacks } from "./phase78-platinum-curidas";

export const PHASE321_PLATINUM_BRAND_ID = "e51tJpejEkXY";
export const PHASE321_KURIKARA_ID =
  "phase321-platinum-izumo-piz-120000k-kurikara-ken";
export const PHASE321_KURIKARA_SLUG =
  "platinum-izumo-piz-120000k-kurikara-ken";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase321-piz-120000k-current";
const BOUNDARY_SCOPE = "phase321-piz-120000k-boundaries";
const CARE_SCOPE = "phase321-piz-120000k-care";

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
  const registryKey = input.registryKey ?? "platinum-official-phase321";
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
  press: web({
    key: "phase321-kurikara-press",
    title: "Platinum 官方：出云『倶利伽羅剣』新品发布",
    url: "https://www.platinum-pen.co.jp/news/8629/",
    publishedAt: "2016-05-09",
    summary:
      "Platinum 官方新闻稿确认 PIZ-120000K #1、2016 年 5 月 10 日上市、未税 120,000 日元、600 支首批序号、炭粉高蒔绘、18K 钌饰面尖、154/134×18 mm、33.7 g 与附件。",
    locator:
      "2016.5.9 press release lines: product number, release date, price, 600 numbered, specs and accessories",
  }),
  family: web({
    key: "phase321-kurikara-family",
    title: "Platinum Izumo 官方品牌页",
    url: "https://www.platinum-pen.co.jp/en/brands/detail/?pid=70",
    summary:
      "官方 Izumo 品牌页将 PIZ-120000K 与 PIZ-150000C、PIZ-100000、PIZ-80000N 等相邻产品分开导航。",
    locator: "IZUMO lineup product-number and adjacent-model boundary",
  }),
  catalog: web({
    key: "phase321-kurikara-catalog",
    title: "Platinum Fine Writing catalog 2019–2020",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/Platinum-pen-general-catalog-2019-2020.pdf",
    publishedAt: "2019-01-01",
    summary:
      "官方目录将 PIZ-120000K 炭粉高蒔绘路线与其他 Izumo 工艺并列，支持大型 18K F/M/B、ebonite、154×18 mm 和产品号边界。",
    locator: "PDF Izumo sumiko taka maki-e PIZ-120000K row and adjacent product table",
  }),
  maintenance: web({
    key: "phase321-kurikara-maintenance",
    title: "Platinum Izumo 官方使用与维护手册",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/02/izumo-1.pdf",
    summary:
      "Izumo 官方手册用于墨囊/转换器取下、清水或温水清洁与晾干边界；漆艺与炭粉表面不应使用强溶剂。",
    locator: "Izumo cartridge/converter cleaning and urushi surface caution",
  }),
  usa: web({
    key: "phase321-kurikara-usa",
    title: "Platinum Pen USA Izumo Collection: Kurikara-Ken",
    url: "https://platinumpenusa.com/luxury-writing/izumo-collection/",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "platinum-pen-usa-phase321",
    registryName: "Platinum Pen USA",
    homepageUrl: "https://platinumpenusa.com/",
    author: "Platinum Pen USA",
    summary:
      "Platinum Pen USA 交叉记录 Kurikara-Ken 的吞剑龙王题材、炭粉高蒔绘、PIZ-120000K、18K 尖与 600 支限量语境；不替代日本官方发布口径。",
    locator: "Kurikara-Ken story, sumiko taka maki-e, product code and limited-edition entry",
  }),
  diagram: web({
    key: "phase321-kurikara-svg",
    title: "PIZ-120000K Kurikara-Ken factual diagram",
    url: "/images/library/site-original/phase321/platinum/izumo-piz-120000k-kurikara-ken.svg",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase321",
    summary:
      "本站原创事实 SVG，标出 PIZ-120000K、#1、炭粉高蒔绘龙剑题材与规格边界；非产品照片。",
    locator: "site-original factual SVG metadata",
  }),
} as const;

const inheritedBrand = phase78PlatinumCuridasPacks.find(
  (pack) =>
    pack.entityId === PHASE321_PLATINUM_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 321 Platinum brand pack is unavailable.");

const model: CuratedEntityPack = {
  key: "phase321-platinum-izumo-piz-120000k-kurikara-ken-v1",
  entityId: PHASE321_KURIKARA_ID,
  expectedType: "pen",
  expectedSlug: PHASE321_KURIKARA_SLUG,
  canonicalName: "Platinum Izumo PIZ-120000K 倶利伽罗剣",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/platinum-izumo-piz-120000k-kurikara-ken-phase321.md",
  storyTitle: "Platinum Izumo PIZ-120000K：倶利伽罗剣 #1",
  primarySourceKey: S.press.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Platinum Izumo Kurikara-Ken PIZ-120000K #1",
      language: "en",
      sourceKey: S.usa.key,
    },
    {
      alias: "出雲 炭粉高蒔絵 倶利伽羅剣 PIZ-120000K",
      language: "ja",
      sourceKey: S.press.key,
    },
    {
      alias: "白金 出云 倶利伽罗剑",
      language: "zh",
      sourceKey: S.family.key,
    },
  ],
  sources: [S.press, S.family, S.catalog, S.maintenance, S.usa, S.diagram],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Platinum Izumo Kurikara-Ken",
      validFrom: "2016-05-10",
      productionState: "current",
      nibScope: "Large 18K F/M/B with ruthenium finish",
      materialScope:
        "ebonite body, Sumiko Taka Maki-e and black roiro urushi surface, AS resin grip, matte ruthenium-finished beryllium copper clip; Platinum cartridge/converter",
      editionScope: "PIZ-120000K #1 Kurikara-ken",
    },
    {
      key: BOUNDARY_SCOPE,
      scopeKey: BOUNDARY_SCOPE,
      productionState: "current",
      editionScope:
        "Independent from PIZ-150000C #1, PIZ-100000 #19, PIZ-80000N #91/#92, PIZ-160000 #56 and PBA-120000G/Y",
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
      "phase321-kurikara-identity",
      "model_identity",
      "PIZ-120000K 是 Platinum Izumo 炭粉高蒔绘倶利伽罗剣型号，官方图案编号为 #1 Kurikara-ken。",
      S.press.key,
      "PIZ-120000K #1 product-number entry",
    ),
    claim(
      "phase321-kurikara-craft",
      "craft_process",
      "官方说明龙身以炭粉上げ多次堆叠、刷入黑漆并以黑蝋色漆表现，银剑以高蒔绘、黑刷り込み和研磨让银色浮起；不外推单支笔的层数、工匠或图案位置。",
      S.press.key,
      "dragon and sword charcoal-powder maki-e process",
    ),
    claim(
      "phase321-kurikara-spec",
      "specification",
      "官方规格为大型 18K 钌饰面 F/M/B 尖、ebonite 炭粉高蒔绘轴盖、AS 树脂握位、铍铜哑钌饰面笔夹、154 mm、书写时约 134 mm、18 mm、33.7 g。",
      S.press.key,
      "official product overview specification fields",
    ),
    claim(
      "phase321-kurikara-fill",
      "filling_and_care",
      "PIZ-120000K 使用 Platinum 墨囊／转换器；官方附件列瓶装墨、蓝黑墨囊、倶利伽罗剣专用转换器、笔衣和专用桐箱。",
      S.press.key,
      "official accessory fields",
    ),
    claim(
      "phase321-kurikara-boundary",
      "identity_boundaries",
      "PIZ-120000K #1 与 PIZ-150000C #1、PIZ-100000 #19、PIZ-80000N #91/#92、PIZ-160000 #56、PBA-120000G/Y 使用不同产品号和工艺/材料路线，不能共享图片或规格。",
      S.family.key,
      "Izumo lineup product-number separation",
    ),
    claim(
      "phase321-kurikara-edition",
      "edition_boundary",
      "日本官方新闻稿称首次生产 600 支并带序列号；这属于发布时限量边界，不证明今天每支的证书、编号或原厂状态。",
      S.press.key,
      "first production 600 numbered entry",
    ),
    claim(
      "phase321-kurikara-retailer",
      "market_crosscheck",
      "Platinum Pen USA 以 Kurikara-Ken 交叉记录吞剑龙王题材、炭粉高蒔绘、18K 尖和 600 支限量语境；区域资料不替代日本官方价格和上市日期。",
      S.usa.key,
      "USA Kurikara-Ken story and product entry",
    ),
    claim(
      "phase321-kurikara-media",
      "media_identity_boundary",
      "主图是本站原创事实 SVG，非产品照片，不证明真实龙纹、银剑反光、颜色、比例、Logo、序号、库存或实物品相。",
      S.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase321-kurikara-1",
      name: "#1 Kurikara-ken 倶利伽罗剣",
      notes: "PIZ-120000K 的官方图案/工艺路线；不拆成第二个型号。",
      sourceKey: S.press.key,
      variantKind: "material",
      productCode: "PIZ-120000K #1",
      market: "日本/国际经销",
    },
    {
      key: "phase321-kurikara-nibs",
      name: "大型 18K F / M / B",
      notes: "同一 PIZ-120000K 下的字幅选择；钌饰面属于尖面处理。",
      sourceKey: S.press.key,
      variantKind: "nib",
      productCode: "PIZ-120000K",
      market: "日本/国际经销",
    },
  ],
  spec: {
    brandEntityId: PHASE321_PLATINUM_BRAND_ID,
    values: {
      series_name: "Platinum Izumo Sumiko Taka Maki-e PIZ-120000K",
      release_year: "2016",
      origin_country: "日本品牌；Izumo 出云系列",
      nib: "大型 18K 金尖；钌饰面；F、M、B",
      fill_system: "Platinum 专用墨囊／转换器；倶利伽罗剣专用转换器随盒",
      material: "ebonite 笔身；炭粉高蒔绘与黑蝋色漆；AS 树脂握位；铍铜哑钌饰面笔夹",
      dimensions: "全长 154 mm（书写时约 134 mm）× 最大径 18 mm",
      weight: "标准重量 33.7 g",
      price_range: "2016 官方发布未税 120,000 日元；当前价格按日期地区核对",
      status: "PIZ-120000K #1 Kurikara-ken；首批 600 支编号语境",
    },
    evidence: [
      evidence("phase321-brand", "brand_entity_id", S.family.key, "Izumo/Platinum product identity"),
      evidence("phase321-series", "series_name", S.press.key, "PIZ-120000K heading"),
      evidence("phase321-release", "release_year", S.press.key, "2016.5.9 press release"),
      evidence("phase321-origin", "origin_country", S.family.key, "Platinum Japanese official context"),
      evidence("phase321-nib", "nib", S.press.key, "18K ruthenium-finished F/M/B field"),
      evidence("phase321-fill", "fill_system", S.press.key, "converter/cartridge/accessory fields"),
      evidence("phase321-material", "material", S.press.key, "ebonite, maki-e and grip/clip fields"),
      evidence("phase321-dimensions", "dimensions", S.press.key, "154 mm x 18 mm size field"),
      evidence("phase321-weight", "weight", S.press.key, "33.7 g weight field"),
      evidence("phase321-price", "price_range", S.press.key, "2016 official price snapshot"),
      evidence("phase321-status", "status", S.press.key, "600 numbered first-production boundary"),
    ],
  },
  timeline: [
    {
      key: "phase321-kurikara-release",
      title: "Izumo 倶利伽罗剣发布",
      eventType: "model_released",
      startDate: "2016-05-10",
      circa: false,
      description:
        "Platinum 官方新闻稿于 2016 年 5 月 9 日发布，并说明 PIZ-120000K 倶利伽罗剣于 5 月 10 日上市。",
      sourceKey: S.press.key,
    },
  ],
  media: [
    {
      key: "phase321-kurikara-primary-media",
      title: "PIZ-120000K 倶利伽罗剣事实卡（非产品照片）",
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

export const phase321PlatinumIzumoPiz120000kKurikaraKenPacks: CuratedEntityPack[] = [
  inheritedBrand,
  model,
];
