import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase33Sailor2026CurrentPacks } from "./phase33-sailor-2026-current";

export const PHASE353_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE353_SLIM14K_ID = "phase353-sailor-professional-gear-slim-14k";
export const PHASE353_SLIM14K_SLUG = "sailor-professional-gear-slim-14k";
const RETRIEVED = "2026-08-02";
const SCOPE = "phase353-sailor-pgs-slim-14k-11221-11222";

function web(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  tier?: CuratedSource["tier"];
  sourceType?: CuratedSource["sourceType"];
  registryKey?: string;
  registryName?: string;
  homepageUrl?: string;
  author?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const registryKey = input.registryKey ?? "sailor-official-phase353";
  const official = sourceType === "official";
  return {
    key: input.key,
    registryKey,
    registryName:
      input.registryName ?? (official ? "The Sailor Pen Co., Ltd." : "Fountain Pen Graph editorial studio"),
    sourceType,
    tier: input.tier ?? (official ? "primary" : "professional_secondary"),
    independenceGroup: registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.homepageUrl ?? (official ? "https://sailor.co.jp/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author: input.author ?? (official ? "セーラー万年筆株式会社" : "Fountain Pen Graph editorial"),
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

function specEvidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  official: web({
    key: "phase353-sailor-pgs-slim14k-official",
    title: "PROFESSIONALGEAR Slim Gold Fountain Pen — 11-1221",
    url: "https://en.sailor.co.jp/product/11-1221/",
    summary:
      "Sailor 英文产品页把 11-1221 列为 Professional Gear Slim Gold，列出 11-1221-120/220/320/420/620/720/920 尖尾码、14K Gold with Gold plating、Converter & Cartridge type、PMMA、φ17×124 mm（含笔夹）和 16.8 g。",
    locator: "product title, item-code list and material, filling, dimension and weight fields",
  }),
  series: web({
    key: "phase353-sailor-pgs-series",
    title: "Professional Gear Series — Sailor official series guide",
    url: "https://en.sailor.co.jp/topics/professional-gear-series/",
    summary:
      "官方系列页把 11-1221 Gold 与 11-1222 Rhodium 并列为旧 14K Professional Gear Slim，并与全尺寸、Realo、Slim Mini 等路线分开。",
    locator: "Professional Gear Slim 11-1221/11-1222 family table and sibling boundaries",
  }),
  catalog: web({
    key: "phase353-sailor-pgs-catalog-2019-2020",
    title: "Sailor 2019–2020 official catalog — Professional Gear Slim",
    url: "https://www.sailor.co.jp/book_2019-2020/pageindices/index68.html",
    summary:
      "Sailor 官方 2019–2020 目录页保留 11-1221/11-1222、14K、标准尖尾码、φ17×124 mm 与 16.8 g 的历史目录口径；只把出现年份作为目录证据，不倒推首次上市年份。",
    locator: "catalog page index 68, 11-1221/11-1222 listing and specification table",
    tier: "contemporary_archive",
  }),
  refill: web({
    key: "phase353-sailor-refill",
    title: "Fountain pen ink refill — Sailor official guidance",
    url: "https://sailor.co.jp/topics/fountain-pen-refill-ink/",
    summary: "Sailor 官方补墨说明覆盖专用墨囊与转换器的安装、吸墨和清洗边界。",
    locator: "cartridge/converter refill instructions",
  }),
  care: web({
    key: "phase353-sailor-care",
    title: "Fountain pen maintenance — Sailor official guidance",
    url: "https://sailor.co.jp/topics/fountain-pen-maintenance/",
    summary: "Sailor 官方维护说明给出清水吸排、晾干和避免不当浸泡的建议。",
    locator: "official cleaning and maintenance instructions",
  }),
  forum: web({
    key: "phase353-sailor-pgs-forum",
    title: "Subjective comparison of Professional Gear series — Fountain Pen Network",
    url: "https://www.fountainpennetwork.com/forum/topic/83920-subjective-comparison-of-professional-gear-series/",
    summary:
      "Fountain Pen Network 的系列比较提供约 124 mm 闭帽、16.8 g 和 Slim／全尺寸比例的样本测量与书写体验；仅作专业爱好者交叉资料，不覆盖每个批次。",
    locator: "sample dimensions, weight and subjective Slim/full-size comparison",
    sourceType: "forum",
    tier: "professional_secondary",
    registryKey: "fountain-pen-network-phase353",
    registryName: "Fountain Pen Network",
    homepageUrl: "https://www.fountainpennetwork.com/",
    author: "Fountain Pen Network contributors",
  }),
  retailer: web({
    key: "phase353-sailor-pgs-retailer",
    title: "Sailor Professional Gear Slim Fountain Pen — Pen Chalet archive",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/sailor_professional_gear_slim_fountain_pen/Black/",
    summary:
      "Pen Chalet 的历史零售页将黑色 Professional Gear Slim 与 14K 尖、Sailor 卡水／转换器和小型平顶平台并列；只用于市场名称与使用场景交叉核对，不替代官网规格。",
    locator: "retailer title, nib and filling descriptions",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "pen-chalet-phase353",
    registryName: "Pen Chalet",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
  }),
  diagram: web({
    key: "phase353-sailor-pgs-slim14k-svg",
    title: "Sailor Professional Gear Slim 14K 11-1221/11-1222 factual diagram",
    url: "/images/library/site-original/phase353/sailor/professional-gear-slim-14k.svg",
    summary: "本站原创事实 SVG；只表达 14K Slim 的 SKU、尺寸、重量和供墨边界，非产品照片。",
    locator: "site-original factual SVG metadata",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase353",
  }),
} as const;

const inheritedBrand = phase33Sailor2026CurrentPacks.find(
  (pack) => pack.expectedType === "brand" && pack.expectedSlug === "sailor",
);
if (!inheritedBrand) throw new Error("Phase 353 Sailor brand pack missing.");

const model: CuratedEntityPack = {
  key: "phase353-sailor-pgs-slim14k-v1",
  entityId: PHASE353_SLIM14K_ID,
  expectedType: "pen",
  expectedSlug: PHASE353_SLIM14K_SLUG,
  canonicalName: "Sailor Professional Gear Slim 14K（11-1221／11-1222）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sailor-professional-gear-slim-14k-phase353.md",
  storyTitle: "Sailor Professional Gear Slim 14K：11-1221／11-1222 的身份与边界",
  primarySourceKey: S.official.key,
  depthTier: "A",
  aliases: [
    { alias: "Sailor Professional Gear Slim 14K", language: "en", sourceKey: S.official.key },
    { alias: "Professional Gear Slim 11-1221", language: "en", sourceKey: S.official.key },
    { alias: "プロフェッショナルギア スリム 14K", language: "ja", sourceKey: S.series.key },
    { alias: "写乐 Professional Gear Slim 14K", language: "zh", sourceKey: S.series.key },
  ],
  sources: [S.official, S.series, S.catalog, S.refill, S.care, S.forum, S.retailer, S.diagram],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Sailor official product and series pages",
      productionState: "unknown",
      nibScope: "14K medium EF/F/MF/M/B/Z/MS by SKU",
      materialScope: "PMMA resin; 11-1221 Gold Trim or 11-1222 Rhodium Trim",
      editionScope: "11-1221 and 11-1222 standard Professional Gear Slim routes",
    },
    {
      key: "phase353-pgs-slim14k-boundaries",
      scopeKey: "phase353-pgs-slim14k-boundaries",
      productionState: "historical",
      editionScope: "excludes 21K Slim 21, Slim Mini and full-size Professional Gear",
    },
    {
      key: "phase353-pgs-slim14k-care",
      scopeKey: "phase353-pgs-slim14k-care",
      productionState: "unknown",
      editionScope: "standard Sailor cartridge/converter care; not Realo piston filling",
    },
    {
      key: "phase353-pgs-slim14k-media",
      scopeKey: "phase353-pgs-slim14k-media",
      productionState: "unknown",
      editionScope: "site-original factual SVG; not a product photo",
    },
  ],
  claims: [
    claim(
      "phase353-slim14k-identity",
      "model_identity",
      "11-1221 与 11-1222 是 Professional Gear Slim 的旧 14K 中型平台；金饰和银／镍铬饰件保留独立主商品代码，不是单纯颜色别名。",
      S.official.key,
      "11-1221 product title and official 11-1221/11-1222 series listing",
    ),
    claim(
      "phase353-slim14k-codes",
      "product_codes",
      "11-1221／11-1222 按 EF、F、MF、M、B、Z、MS 使用 -120、-220、-320、-420、-620、-720、-920 尖尾码；具体颜色与市场库存须核对完整代码。",
      S.official.key,
      "official item-code list and nib suffix mapping",
    ),
    claim(
      "phase353-slim14k-spec",
      "specification",
      "官方规格为 14K 中型金尖、Sailor 墨囊／转换器两用式、PMMA 树脂、φ17×124 mm（含笔夹）和 16.8 g；11-1221 为 Gold Trim，11-1222 为 Rhodium Trim。",
      S.official.key,
      "nib, filling, material, finish, dimensions and weight fields",
    ),
    claim(
      "phase353-slim14k-boundary",
      "identity_boundaries",
      "它与 21K Slim 21 的 11-2151／11-2152、短身 Slim Mini 11-1503 以及 21K 全尺寸 Professional Gear 分开建模；平顶外观和相近长度不足以合并。",
      S.series.key,
      "official Professional Gear family table and sibling specifications",
    ),
    claim(
      "phase353-slim14k-history",
      "historical_presence",
      "11-1221／11-1222 在 Sailor 2019–2020 官方目录中出现；目录能证明该时期的产品存在与规格，不能单独证明首次上市年份。",
      S.catalog.key,
      "2019–2020 catalog page index 68",
    ),
    claim(
      "phase353-slim14k-care",
      "maintenance_guidance",
      "使用 Sailor 专用墨囊或标准转换器；换墨时用室温清水缓慢吸排并自然晾干，不套用 Realo 尾栓吸墨步骤，也不使用热水、酒精或研磨剂。",
      S.refill.key,
      "official refill and maintenance guidance",
    ),
    claim(
      "phase353-slim14k-selection",
      "selection_guidance",
      "购买时先核对 11-1221／11-1222 主代码、尖尾码、饰件和转换器；商品页若写 21K、Gold IP、全尺寸或 Mini converter，应转到对应 sibling 页面。",
      S.official.key,
      "official code groups and material fields",
      "editorial",
    ),
    claim(
      "phase353-slim14k-secondary",
      "secondary_crosscheck",
      "专业爱好者与零售资料都把这条路线描述为较细的 Slim 平顶平台，但测量和书写反馈属于样本经验，不能覆盖每个年份、尖号或限定色。",
      S.forum.key,
      "sample dimensions and subjective writing comparison",
    ),
    claim(
      "phase353-slim14k-media",
      "media_identity_boundary",
      "主图是本站原创事实 SVG，不是产品照片，不复制 Sailor logo 或刻字，也不证明真实颜色、比例、批次或库存。",
      S.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase353-slim14k-gold",
      name: "11-1221 Gold Trim（金饰）",
      notes: "标准尖尾码为 11-1221-120/220/320/420/620/720/920，对应 EF/F/MF/M/B/Z/MS。",
      sourceKey: S.official.key,
      variantKind: "market_sku",
      productCode: "11-1221-(120/220/320/420/620/720/920)",
      market: "日本及地区市场",
    },
    {
      key: "phase353-slim14k-rhodium",
      name: "11-1222 Rhodium Trim（银／镍铬饰）",
      notes: "与 11-1221 共享 14K Slim 平台；完整尖尾码和颜色按市场商品页核对。",
      sourceKey: S.series.key,
      variantKind: "market_sku",
      productCode: "11-1222",
      market: "日本及地区市场",
    },
    {
      key: "phase353-slim14k-nibs",
      name: "14K 中型尖尾码组",
      notes: "EF、F、MF、M、B、Zoom、Music 七种尖号；线宽与书写角度是选购变量，不改变主型号。",
      sourceKey: S.official.key,
      variantKind: "nib",
      productCode: "-120/-220/-320/-420/-620/-720/-920",
      market: "日本及地区市场",
    },
  ],
  spec: {
    brandEntityId: PHASE353_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor Professional Gear Slim 14K（11-1221／11-1222）",
      release_year: "2019–2020 官方目录出现；首次上市年份未由本包断言",
      origin_country: "日本品牌；本页不把品牌所在地外推为每支笔的具体工厂",
      nib: "14K 中型金尖；EF、F、MF、M、B、Z、MS",
      fill_system: "Sailor 专用墨囊／转换器两用",
      material: "PMMA resin；11-1221 Gold Trim，11-1222 Rhodium Trim",
      dimensions: "最大径 φ17 mm × 全长 124 mm（含笔夹）",
      weight: "16.8 g",
      status: "旧 14K Slim 平台；官方英文页仍列出，地区库存与特别色按完整 SKU 核对",
    },
    evidence: [
      specEvidence("phase353-slim14k-brand", "brand_entity_id", S.official.key, "official Sailor product page"),
      specEvidence("phase353-slim14k-series", "series_name", S.official.key, "product title and 11-1221 code"),
      specEvidence("phase353-slim14k-release", "release_year", S.catalog.key, "2019–2020 catalog appearance; no launch-year inference"),
      specEvidence("phase353-slim14k-origin", "origin_country", S.series.key, "Sailor official series context; no factory inference"),
      specEvidence("phase353-slim14k-nib", "nib", S.official.key, "14K medium and seven nib suffixes"),
      specEvidence("phase353-slim14k-fill", "fill_system", S.official.key, "Converter & Cartridge type field"),
      specEvidence("phase353-slim14k-material", "material", S.official.key, "PMMA and Gold/Rhodium trim fields"),
      specEvidence("phase353-slim14k-dimensions", "dimensions", S.official.key, "φ17×124 mm including clip"),
      specEvidence("phase353-slim14k-weight", "weight", S.official.key, "16.8 g"),
      specEvidence("phase353-slim14k-status", "status", S.official.key, "live English 11-1221 page and market-availability note"),
    ],
  },
  timeline: [
    {
      key: "phase353-slim14k-catalog",
      title: "11-1221／11-1222 出现在 Sailor 2019–2020 官方目录",
      eventType: "model_released",
      startDate: "2019",
      circa: true,
      description: "官方目录记录该时期的 Professional Gear Slim 14K 代码与规格；事件日期为目录时期，不是首次上市断言。",
      sourceKey: S.catalog.key,
    },
  ],
  media: [
    {
      key: "phase353-slim14k-primary-media",
      title: "Professional Gear Slim 14K 11-1221/11-1222 事实卡（非产品照片）",
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

export const phase353SailorProfessionalGearSlim14kPacks: CuratedEntityPack[] = [inheritedBrand, model];
