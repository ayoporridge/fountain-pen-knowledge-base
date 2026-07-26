import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE72_PENBBS_BRAND_ID,
  phase72PenBbsPacks,
} from "./phase72-delike-duke-penbbs";

const RETRIEVED = "2026-07-26";
export const PHASE250_PENBBS_BRAND_ID = PHASE72_PENBBS_BRAND_ID;
export const PHASE250_PENBBS_500_ID = "p250PenBbs500";
export const PHASE250_PENBBS_500_SLUG = "penbbs-500";
const SCOPE = "phase250-penbbs-500-scope";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase250",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase250",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary,
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  extra: Array<{ key: string; sourceKey: string; locator: string }> = [],
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass: predicate === "maintenance_boundary" ? "editorial" : "core",
    confidence: 0.97,
    sourceKey,
    locator,
    evidence: [
      { key: `${key}-e`, sourceKey, scopeKey: SCOPE, locator },
      ...extra.map((item) => ({ ...item, scopeKey: SCOPE })),
    ],
  };
}

function specEvidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  store: web({
    key: "phase250-penbbs-store",
    title: "PENBBSOfficialStore Etsy shop",
    url: "https://www.etsy.com/shop/PENBBSOfficialStore",
    registryKey: "penbbsofficialstore-phase250",
    registryName: "PENBBSOfficialStore",
    sourceType: "official",
    tier: "primary",
    summary: "PenBBS 自营 Etsy 店铺；页面显示店主、销售窗口和型号商品，但库存与价格随时间及地区变化。",
    locator: "shop identity, sales channel and shop policy",
  }),
  directory: web({
    key: "phase250-penbbs-directory",
    title: "Fountain Pen Companion: PenBBS directory",
    url: "https://www.fountainpencompanion.com/pen_brands/167-penbbs",
    registryKey: "fountain-pen-companion-phase250-penbbs",
    registryName: "Fountain Pen Companion",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "结构化目录把 PenBBS 500 与 267、268、308、309、323、350、352、355、380、456、469 等分开列为型号。",
    locator: "PenBBS model list including 500",
  }),
  fudefan: web({
    key: "phase250-penbbs-500-fudefan",
    title: "Fudefan: PenBBS 500: TWSBI meets Conid",
    url: "https://www.fudefan.com/2020/01/penbbs-500/",
    registryKey: "fudefan-phase250-penbbs-500",
    registryName: "Fudefan",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "2020 独立评测记录 500 的上市窗口、弹簧活塞、可脱开推杆、英文说明卡、O-ring、尖型和后插平衡。",
    locator: "release, filling mechanism, maintenance and writing sections",
  }),
  edc: web({
    key: "phase250-penbbs-500-edc",
    title: "WriterShelf / EDC: PenBBS 500",
    url: "https://www.writershelf.com/article/penbbs-500-a-little-gaudy-a-little-gimmicky?locale=en",
    registryKey: "writershelf-edc-phase250-penbbs-500",
    registryName: "WriterShelf / EDC",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "2020 实测给出合盖与无帽长度、墨水状态下重量、握位直径、螺纹和浅后插边界，并描述弹簧推杆机构。",
    locator: "measurements, posting, mechanism and nib sections",
  }),
  frugal: web({
    key: "phase250-penbbs-500-frugal",
    title: "Frugal Pen Enthusiast: PenBBS 500",
    url: "https://frugalpenenthusiast.wordpress.com/2020/11/10/penbbs-500/",
    registryKey: "frugal-pen-enthusiast-phase250-penbbs-500",
    registryName: "Frugal Pen Enthusiast",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary: "独立拆解和测量记录 500-54F 的亚克力、钢尖、145/133 mm、约 31 g、螺纹帽及两段式活塞组件；不外推到所有批次。",
    locator: "500-54F specification and disassembly boundary",
  }),
  unsharpen: web({
    key: "phase250-penbbs-500-unsharpen",
    title: "Unsharpen: PenBBS 500 Fountain Pen",
    url: "https://unsharpen.com/pen/penbbs-500/",
    registryKey: "unsharpen-phase250-penbbs-500",
    registryName: "Unsharpen",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "资料页记录钢尖、F/M、内置活塞、约 13.5 mm 直径、约 14 cm 合盖、2019 年和填充步骤；部分字段是网站自有目录值。",
    locator: "filling instructions and information table",
  }),
  svg: diagram(
    "phase250-penbbs-500-svg",
    "PenBBS 500 filling mechanism factual diagram",
    "/images/library/site-original/phase250/penbbs/500.svg",
    "本站原创 factual SVG：表达亚克力宽体、尾部可脱开推杆、弹簧活塞和钢尖；非产品照片、非 Logo、非比例图、非颜色校样。",
  ),
} as const;

const inheritedBrand = phase72PenBbsPacks().find(
  (pack) => pack.entityId === PHASE250_PENBBS_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 250 PenBBS brand pack missing.");

const brand: CuratedEntityPack = structuredClone(inheritedBrand);
brand.key = "phase250-penbbs-brand-v2";
brand.markdownFile = ".planning/content-research/penbbs-brand-phase250.md";
brand.sources = [...brand.sources, S.directory, S.fudefan, S.edc, S.svg];
brand.scopes = brand.scopes.map((scope) => ({
  ...scope,
  editionScope: "品牌页导航 268、308、355、456、469 与本次补充的 500；不同上墨结构、尖型和颜色必须回到各自型号页。",
}));
brand.scopes.push({
  key: SCOPE,
  scopeKey: SCOPE,
  productionState: "historical",
  editionScope: "本条只说明 PenBBS 500 已加入品牌导航，不把型号级规格回填到品牌页。",
});
brand.claims = [
  ...brand.claims,
  claim(
    "phase250-penbbs-500-navigation",
    "brand_model_navigation",
    "PenBBS 500 是品牌页新增的弹簧活塞代表型号；它与 268/456 真空、308 墨囊／转换器、355 杆式结构和 469 特殊路线分开导航。",
    S.directory.key,
    S.directory.summary,
    [{ key: "phase250-penbbs-500-navigation-review", sourceKey: S.fudefan.key, locator: S.fudefan.summary }],
  ),
];
brand.media = [{
  key: "phase250-penbbs-brand-media",
  title: "PenBBS 上墨结构导航事实图（非产品照片）",
  sourceKey: S.svg.key,
  localPath: S.svg.url,
  author: "Fountain Pen Graph editorial",
  license: "site-original",
  attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、包装或零件兼容性。",
  sourceUrl: S.svg.url,
  usageStatus: "primary",
}];
brand.timeline = [
  ...(brand.timeline ?? []),
  {
    key: "phase250-penbbs-500-release",
    title: "PenBBS 500 进入销售渠道",
    eventType: "model_released",
    startDate: "2020",
    circa: false,
    description: "独立资料记录 2019 年末预告、2020 年初 Etsy 与国内渠道出现；不等同完整生产档案。",
    sourceKey: S.fudefan.key,
  },
];

const pen: CuratedEntityPack = {
  key: "phase250-penbbs-500-v1",
  entityId: PHASE250_PENBBS_500_ID,
  expectedType: "pen",
  expectedSlug: PHASE250_PENBBS_500_SLUG,
  canonicalName: "坛笔 PenBBS 500",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/penbbs-500-phase250.md",
  storyTitle: "PenBBS 500：弹簧活塞与可脱开推杆",
  primarySourceKey: S.fudefan.key,
  depthTier: "A",
  aliases: [
    { alias: "PenBBS 500", language: "en", sourceKey: S.directory.key },
    { alias: "PENBBS 500", language: "en", sourceKey: S.store.key },
    { alias: "PenBBS 500-54F", language: "en", sourceKey: S.frugal.key, kind: "regional_name", market: "2020 sample / sales channel" },
    { alias: "坛笔 500", language: "zh", sourceKey: S.store.key },
  ],
  sources: [S.store, S.directory, S.fudefan, S.edc, S.frugal, S.unsharpen, S.svg],
  scopes: [{
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "historical",
    market: "PenBBS Etsy、国内渠道与历史评测；当前库存按渠道复核",
    nibScope: "钢尖；F/M/RM 与 blade／mini-fude 为来源样本或市场选项，不合并为单一固定尖型",
    materialScope: "亚克力／树脂笔身与金属饰件；配色和批次作为 variant",
    editionScope: "仅覆盖 PenBBS 500 钢笔；355、456、308 与 rollerball attachment 不并入本页",
  }],
  claims: [
    claim("phase250-500-identity", "model_identity", "PenBBS 500 是独立型号，核心为内置弹簧活塞和可脱开的两段式推杆；不与 355、456、308 合并。", S.fudefan.key, S.fudefan.summary, [{ key: "phase250-500-directory", sourceKey: S.directory.key, locator: S.directory.summary }]),
    claim("phase250-500-release", "release_window", "资料记录 2019 年末预告、2020 年初进入 Etsy 与国内渠道；这不是未经生产档案确认的精确首发日。", S.fudefan.key, "2019 teaser and early January 2020 release", [{ key: "phase250-500-release-frugal", sourceKey: S.frugal.key, locator: S.frugal.summary }]),
    claim("phase250-500-filling", "filling_system", "填充需拉出尾部推杆、重新啮合弹簧活塞、浸入笔尖并按下，再解除啮合收回推杆；操作应以随笔说明卡为准。", S.unsharpen.key, S.unsharpen.summary, [{ key: "phase250-500-filling-fudefan", sourceKey: S.fudefan.key, locator: S.fudefan.summary }]),
    claim("phase250-500-size", "sample_dimensions", "不同独立样本合盖约 143–145 mm、无帽约 131–135 mm，约 31–33 g；差异来自墨量、配色和测量口径，不写成统一工程单值。", S.edc.key, S.edc.summary, [{ key: "phase250-500-size-frugal", sourceKey: S.frugal.key, locator: S.frugal.summary }]),
    claim("phase250-500-nib", "nib_boundary", "500 有钢尖和 F/M/RM、blade／mini-fude 等市场或样本配置；更换 Jowo、feed 或其他尖属于改装，不能外推为标准兼容。", S.fudefan.key, S.fudefan.summary, [{ key: "phase250-500-nib-unsharpen", sourceKey: S.unsharpen.key, locator: S.unsharpen.summary }]),
    claim("phase250-500-care", "maintenance_boundary", "清洗以常温清水为主；导向塞、弹簧活塞、O-ring 和薄 feed 鳍片出现异常时不要强拆，先按说明卡或寻求专业维修。", S.fudefan.key, S.fudefan.summary, [{ key: "phase250-500-care-frugal", sourceKey: S.frugal.key, locator: S.frugal.summary }]),
  ],
  variants: [
    { key: "phase250-500-54f", name: "500-54F 亚克力／F 样本", releaseYear: "2020", notes: "Frugal Pen Enthusiast 的具体测量样本；约 145/133 mm、约 31 g 只绑定该样本。", sourceKey: S.frugal.key, variantKind: "market_sku", productCode: "500-54F" },
    { key: "phase250-500-09", name: "500-09 Summer 色码样本", releaseYear: "2020", notes: "Ravens March 资料记录的色码样本；颜色不是新的供墨型号，后插也不推荐作为日常姿势。", sourceKey: S.edc.key, variantKind: "color", productCode: "500-09" },
  ],
  spec: {
    brandEntityId: PHASE250_PENBBS_BRAND_ID,
    values: {
      series_name: "PenBBS 500",
      release_year: "2019 年末预告；2020 年初进入销售渠道",
      origin_country: "中国品牌；本页不推断具体工厂",
      nib: "钢尖；来源样本见 F、M、RM 与 blade／mini-fude 市场选项",
      fill_system: "内置弹簧活塞与可脱开两段式推杆；瓶装墨水",
      material: "亚克力／树脂笔身，金属笔夹、尾部件与饰环按批次核对",
      dimensions: "来源样本合盖约 143–145 mm、无帽约 131–135 mm",
      weight: "来源样本约 31–33 g；墨量和配色会影响实测",
    },
    evidence: [
      specEvidence("phase250-500-brand", "brand_entity_id", S.directory.key, "PenBBS directory maker context"),
      specEvidence("phase250-500-series", "series_name", S.directory.key, "model list entry 500"),
      specEvidence("phase250-500-release-spec", "release_year", S.fudefan.key, "2019 teaser and 2020 release"),
      specEvidence("phase250-500-origin", "origin_country", S.unsharpen.key, "country of origin field"),
      specEvidence("phase250-500-nib-spec", "nib", S.unsharpen.key, "steel nib and F/M table"),
      specEvidence("phase250-500-fill-spec", "fill_system", S.unsharpen.key, "spring-loaded filling steps"),
      specEvidence("phase250-500-material", "material", S.frugal.key, "acrylic material field"),
      specEvidence("phase250-500-dimensions", "dimensions", S.edc.key, "capped/uncapped measurement"),
      specEvidence("phase250-500-weight", "weight", S.frugal.key, "500-54F sample weight"),
    ],
  },
  media: [{
    key: "phase250-500-media",
    title: "PenBBS 500 弹簧活塞事实图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、包装或零件兼容性。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [{
    key: "phase250-500-release-event",
    title: "PenBBS 500 进入销售渠道",
    eventType: "model_released",
    startDate: "2020",
    circa: false,
    description: "独立资料记录 2019 年末预告、2020 年初 Etsy 与国内销售窗口。",
    sourceKey: S.fudefan.key,
  }],
};

export const phase250PenBbs500Packs: CuratedEntityPack[] = [brand, pen];
