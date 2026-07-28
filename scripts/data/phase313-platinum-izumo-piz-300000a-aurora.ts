import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase78PlatinumCuridasPacks } from "./phase78-platinum-curidas";

export const PHASE313_PLATINUM_BRAND_ID = "e51tJpejEkXY";
export const PHASE313_AURORA_ID = "phase313-platinum-izumo-piz-300000a-aurora";
export const PHASE313_AURORA_SLUG = "platinum-izumo-piz-300000a-aurora";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase313-piz-300000a-aurora-current";
const BOUNDARY_SCOPE = "phase313-piz-300000a-aurora-boundaries";
const CARE_SCOPE = "phase313-piz-300000a-aurora-care";

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
  const registryKey = input.registryKey ?? "platinum-official-phase313";
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
    key: "phase313-aurora-product",
    title: "Aizu Maki-e Aurora — PIZ-300000A",
    url: "https://www.platinum-pen.co.jp/en/products/detail/?pid=2050",
    publishedAt: "2016-11-21",
    summary:
      "Platinum 官方产品页确认 PIZ-300000A、#82 Aurora、18K F/M/B、ebonite、Togidashi Maki-e/Raden、154 mm、18 mm 与 33.6 g。",
    locator: "PIZ-300000A heading; nib, base material, surface finish, size and weight fields",
  }),
  press: web({
    key: "phase313-aurora-press",
    title: "Izumo Raden Maki-e Aurora press release",
    url: "https://www.platinum-pen.co.jp/en/news/detail/?pid=8634",
    publishedAt: "2016-11-21",
    summary:
      "Platinum 官方发布稿介绍会津蒔绘、Aurora motif、螺钿、金粉和漆层研磨，确认这是 Izumo 的工艺作品而非普通颜色。",
    locator: "2016.11.21 heading; Aizu Maki-e, Aurora, raden and nashiji-ko process paragraphs",
  }),
  family: web({
    key: "phase313-aurora-family",
    title: "Platinum IZUMO brand lineup",
    url: "https://www.platinum-pen.co.jp/en/brands/detail/?pid=70",
    summary:
      "Platinum Izumo 品牌页将 PIZ-80000N、PIZ-160000、PIZ-300000A 与其他材质和工艺产品分别列出，用于确认 Aurora 的型号边界。",
    locator: "IZUMO product cards and separate PIZ product-number/material labels",
  }),
  maintenance: web({
    key: "phase313-aurora-maintenance",
    title: "Common practices on how to ensure long-term use of Izumo",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/02/izumo-1.pdf",
    summary:
      "Platinum Izumo 手册支持取下墨囊/转换器、用清水清洁笔尖并晾干；本页不把手册扩写为漆面打磨或长期浸泡许可。",
    locator: "Izumo manual; cartridge/converter removal and nib rinse instructions",
  }),
  retailer: web({
    key: "phase313-aurora-penhouse",
    title: "Platinum Izumo Aizu Maki-e Aurora PIZ-300000A",
    url: "https://www.penhouse.ro/instrumente-de-scris/stilouri/stilou-platinum-izumo-aizu-maki-e-aurora",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "penhouse-phase313",
    registryName: "Penhouse",
    homepageUrl: "https://www.penhouse.ro/",
    author: "Penhouse",
    summary:
      "专业经销页以 PIZ-300000A #82 Aurora 交叉记录 18K F/M/B、154 × 18 mm、33.6 g 与 ebonite；不替代 Platinum 工艺和发布日期。",
    locator: "PIZ-300000A product code, nib, material, dimensions and weight fields",
  }),
  diagram: web({
    key: "phase313-aurora-svg",
    title: "PIZ-300000A Aurora factual diagram",
    url: "/images/library/site-original/phase313/platinum/izumo-piz-300000a-aurora.svg",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase313",
    summary: "本站原创事实 SVG，标出 PIZ-300000A 的会津螺钿研蒔绘、ebonite、规格与型号边界；非产品照片。",
    locator: "site-original factual SVG metadata",
  }),
} as const;

const inheritedBrand = phase78PlatinumCuridasPacks.find(
  (pack) => pack.entityId === PHASE313_PLATINUM_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 313 Platinum brand pack is unavailable.");

const model: CuratedEntityPack = {
  key: "phase313-platinum-izumo-piz-300000a-aurora-v1",
  entityId: PHASE313_AURORA_ID,
  expectedType: "pen",
  expectedSlug: PHASE313_AURORA_SLUG,
  canonicalName: "Platinum Izumo Aizu Raden Maki-e Aurora PIZ-300000A（#82）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/platinum-izumo-piz-300000a-aurora-phase313.md",
  storyTitle: "Platinum Izumo PIZ-300000A：会津螺钿研蒔绘 Aurora",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Platinum Izumo Aizu Maki-e Aurora PIZ-300000A", language: "en", sourceKey: S.product.key },
    { alias: "PIZ-300000A #82 Aurora", language: "en", sourceKey: S.retailer.key },
    { alias: "白金 出云 会津螺钿研蒔绘 极光", language: "zh", sourceKey: S.press.key },
  ],
  sources: [S.product, S.press, S.family, S.maintenance, S.retailer, S.diagram],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Platinum Izumo Aizu Raden Maki-e Aurora",
      validFrom: "2016-11-21",
      productionState: "historical",
      nibScope: "Large 18K gold, rhodium-plated; F/M/B",
      materialScope: "Ebonite body/cap/crown with Togidashi Maki-e and Raden; AS resin grip; gold-plated beryllium copper clip",
      editionScope: "PIZ-300000A, colour #82 Aurora",
    },
    {
      key: BOUNDARY_SCOPE,
      scopeKey: BOUNDARY_SCOPE,
      productionState: "historical",
      editionScope: "Independent from PIZ-80000N Yakumonuri, PIZ-160000 Galaxy and PIZ-150000PW Precious Wood",
    },
    {
      key: CARE_SCOPE,
      scopeKey: CARE_SCOPE,
      productionState: "current",
      editionScope: "Platinum cartridge/converter cleaning; no solvent, sanding, polishing or long-soak claim for Urushi/Raden",
    },
  ],
  claims: [
    claim("phase313-aurora-identity", "model_identity", "PIZ-300000A 是 Platinum Izumo Aizu Raden Maki-e Aurora #82 的独立型号，不是 PIZ-80000N、PIZ-160000 或普通 PIZ-300000 的别名。", S.product.key, "PIZ-300000A and #82 Aurora fields"),
    claim("phase313-aurora-craft", "craft_process", "官方把 Aurora 定位为会津蒔绘作品，以本漆、研蒔绘、螺钿、金粉和研磨层表现渐变光带；贝片纹样和颜色不构成统一批次校样。", S.press.key, "Aizu Maki-e, raden and Aurora process paragraphs"),
    claim("phase313-aurora-spec", "specification", "官方规格为大型 18K 铑饰 F/M/B 尖、ebonite 基底、全长 154 mm、最大径 18 mm、重量 33.6 g。", S.product.key, "nib, base material, size and weight fields"),
    claim("phase313-aurora-fill", "filling_and_care", "本页按 Platinum 墨囊／Converter-800A 体系写日常清洁；Izumo 手册不支持自行打磨、补漆、强溶剂擦拭或长期浸泡。", S.maintenance.key, "cartridge/converter and rinse guidance"),
    claim("phase313-aurora-boundary", "identity_boundaries", "Aurora 与 PIZ-80000N、PIZ-160000 Galaxy、PIZ-150000PW 和其他 Izumo 工艺路线保持独立产品号、纹样和图片边界。", S.family.key, "IZUMO lineup product-number separation"),
    claim("phase313-aurora-retailer", "market_crosscheck", "Penhouse 以 PIZ-300000A #82 Aurora 交叉记录 18K F/M/B、154 × 18 mm、33.6 g 与 ebonite；零售页不替代官方工艺或现价口径。", S.retailer.key, "PIZ-300000A code and specification fields"),
    claim("phase313-aurora-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明真实螺钿纹样、色差、比例、Logo、刻字、库存或二手品相。", S.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase313-aurora-82", name: "#82 Aurora", releaseYear: "2016-11-21", notes: "Aizu Raden Maki-e Aurora 路线；不拆成单独颜色或纹样型号。", sourceKey: S.product.key, variantKind: "material", productCode: "PIZ-300000A", market: "日本/国际经销" },
    { key: "phase313-aurora-nibs", name: "大型 18K 铑饰 F / M / B", notes: "同一 PIZ-300000A 下的字幅选择，不是三个型号。", sourceKey: S.product.key, variantKind: "nib", productCode: "PIZ-300000A", market: "日本/国际经销" },
  ],
  spec: {
    brandEntityId: PHASE313_PLATINUM_BRAND_ID,
    values: {
      series_name: "Platinum Izumo Aizu Raden Maki-e Aurora PIZ-300000A #82",
      release_year: "2016-11-21",
      origin_country: "日本品牌；会津蒔绘传统背景，未外推具体工坊分工",
      nib: "大型 18K 金、铑饰；F、M、B",
      fill_system: "Platinum 墨囊／Converter-800A 两用式",
      material: "Ebonite body/cap/crown；Togidashi Maki-e/Raden；AS resin grip；gold-plated beryllium copper clip",
      dimensions: "全长 154 mm（笔记时约 134 mm）× 最大径 18 mm",
      weight: "33.6 g",
      price_range: "2016 年官方发布为高价工艺笔；当前价格、库存和地区供货按日期核对",
      status: "PIZ-300000A #82 Aurora 独立 Izumo Aizu Raden Maki-e 型号",
    },
    evidence: [
      evidence("phase313-brand", "brand_entity_id", S.product.key, "Izumo/Platinum product identity"),
      evidence("phase313-series", "series_name", S.product.key, "PIZ-300000A and #82 Aurora title"),
      evidence("phase313-release", "release_year", S.press.key, "2016-11-21 press release"),
      evidence("phase313-origin", "origin_country", S.press.key, "Aizu Maki-e official context"),
      evidence("phase313-nib", "nib", S.product.key, "18K rhodium-plated F/M/B field"),
      evidence("phase313-fill", "fill_system", S.maintenance.key, "Izumo cartridge/converter guidance"),
      evidence("phase313-material", "material", S.product.key, "ebonite and Togidashi Maki-e/Raden fields"),
      evidence("phase313-dimensions", "dimensions", S.product.key, "154 mm x 18 mm size field"),
      evidence("phase313-weight", "weight", S.product.key, "33.6 g weight field"),
      evidence("phase313-price", "price_range", S.retailer.key, "retailer is date-bound; no current price claim"),
      evidence("phase313-status", "status", S.family.key, "Izumo product-number and material boundary"),
    ],
  },
  timeline: [{ key: "phase313-aurora-release", title: "Izumo Aizu Raden Maki-e Aurora 发布", eventType: "model_released", startDate: "2016-11-21", circa: false, description: "Platinum 官方发布稿公布 PIZ-300000A #82 Aurora 的会津蒔绘、螺钿工艺与产品定位。", sourceKey: S.press.key }],
  media: [{ key: "phase313-aurora-primary-media", title: "PIZ-300000A Aurora 事实卡（非产品照片）", sourceKey: S.diagram.key, localPath: S.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。", sourceUrl: S.diagram.url, usageStatus: "primary" }],
};

export const phase313PlatinumIzumoPiz300000AAuroraPacks: CuratedEntityPack[] = [inheritedBrand, model];
