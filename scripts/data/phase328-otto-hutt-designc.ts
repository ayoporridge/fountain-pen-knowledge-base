import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase144Packs, PHASE144_IDS } from "./phase144-otto-hutt-design04-design07-batch";

export const PHASE328_OTTO_HUTT_BRAND_ID = PHASE144_IDS.brand;
export const PHASE328_DESIGNC_ID = "phase328-pen-otto-hutt-designc";
export const PHASE328_DESIGNC_SLUG = "otto-hutt-designc";

const RETRIEVED = "2026-07-28";
const SCOPE = "phase328-otto-hutt-designc-current";

function source(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  registryKey: string;
  registryName: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  homepageUrl?: string;
  author?: string;
  publishedAt?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? "primary",
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://www.ottohutt.com/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt ?? null,
    retrievedAt: RETRIEVED,
    allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only",
    license: sourceType === "user_submission" ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: sourceType === "user_submission"
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
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

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const SOURCES = {
  official: source({
    key: "phase328-otto-hutt-designc-official",
    title: "Otto Hutt designC official product page",
    url: "https://www.ottohutt.com/product-category/designs-en/designc-en/?lang=en",
    summary: "官方页面说明 designC 的 925/- sterling silver 主体、Made in Germany 与编号刻字、哑黑 PVD 书写单元、18K yellow gold index、Pull+Twist 机构和套装配件。",
    registryKey: "otto-hutt-official-designc-phase328",
    registryName: "Otto Hutt GmbH",
  }),
  oldOfficial: source({
    key: "phase328-otto-hutt-designc-old-official",
    title: "Otto Hutt designC official mechanism archive",
    url: "https://oldwww.ottohutt.com/en/designC/",
    summary: "官方旧站解释先拉出尾部、再顺时针旋转形成真空吸墨，并称其为百年纪念语境中的 Pull+Twist 设计；同时说明 18-carat gold nib。",
    registryKey: "otto-hutt-old-official-designc-phase328",
    registryName: "Otto Hutt GmbH old site",
  }),
  booklet: source({
    key: "phase328-otto-hutt-100yrs-booklet",
    title: "Otto Hutt 100YRS booklet",
    url: "https://oldwww.ottohutt.com/wp-content/uploads/2020/02/ottohutt-100YRSBooklet-Ausgabe-LowRes.pdf",
    summary: "官方百年 booklet 将 designC 放在 100 Years Otto Hutt 纪念产品语境，补充银、金部件与编号证书的套装背景。",
    registryKey: "otto-hutt-official-100yrs-phase328",
    registryName: "Otto Hutt GmbH",
  }),
  pencilcase: source({
    key: "phase328-pencilcase-designc-review",
    title: "Review: Otto Hutt design C Fountain Pen — The Pencilcase Blog",
    url: "https://www.pencilcaseblog.com/2020/10/review-otto-hutt-design-c-fountain-pen.html",
    summary: "专业评测以实物样本交叉记录 designC 的银制纪念定位、Pull+Twist 上墨与书写体验；体验和测量不替代官方机制说明。",
    registryKey: "pencilcaseblog-otto-hutt-designc-phase328",
    registryName: "The Pencilcase Blog",
    sourceType: "blog",
    tier: "professional_secondary",
    homepageUrl: "https://www.pencilcaseblog.com/",
    author: "The Pencilcase Blog",
    publishedAt: "2020-10-01",
  }),
  ukReview: source({
    key: "phase328-uk-fountain-pens-designc",
    title: "Why I bought an Otto Hutt designC — UK Fountain Pens",
    url: "https://ukfountainpens.wordpress.com/2021/09/28/why-i-bought-an-otto-hutt-designc/",
    summary: "独立长期使用文章把 designC 作为限量百年纪念钢笔讨论，并把购买与书写感受保留为作者样本，不扩写成所有 Otto Hutt 的通用规格。",
    registryKey: "uk-fountain-pens-otto-hutt-designc-phase328",
    registryName: "UK Fountain Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    homepageUrl: "https://ukfountainpens.wordpress.com/",
    author: "UK Fountain Pens",
    publishedAt: "2021-09-28",
  }),
  diagram: source({
    key: "phase328-otto-hutt-designc-svg",
    title: "Otto Hutt designC factual diagram",
    url: "/images/library/site-original/phase328/otto-hutt/designc.svg",
    summary: "本站原创 designC 事实 SVG，标示 Pull+Twist、925 银主体、PVD 书写单元和 18K 标记；非产品照片、非 Logo、非比例图、非颜色校样。",
    registryKey: "fountain-pen-graph-editorial-phase328-designc",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    homepageUrl: "/",
  }),
} as const;

const inheritedBrand = phase144Packs.find((pack) => pack.entityId === PHASE328_OTTO_HUTT_BRAND_ID && pack.expectedType === "brand");
if (!inheritedBrand) throw new Error("Phase 328 Otto Hutt brand pack is unavailable.");

const designC: CuratedEntityPack = {
  key: "phase328-otto-hutt-designc-v1",
  entityId: PHASE328_DESIGNC_ID,
  expectedType: "pen",
  expectedSlug: PHASE328_DESIGNC_SLUG,
  canonicalName: "Otto Hutt designC",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/otto-hutt-designc-phase328.md",
  storyTitle: "Otto Hutt designC：Pull+Twist 真空机构的百年纪念钢笔",
  primarySourceKey: SOURCES.official.key,
  depthTier: "A",
  aliases: [
    { alias: "Otto Hutt designC", language: "en", sourceKey: SOURCES.official.key },
    { alias: "Otto Hutt Design C", language: "en", sourceKey: SOURCES.oldOfficial.key },
    { alias: "Otto Hutt 100YRS designC", language: "en", sourceKey: SOURCES.booklet.key },
    { alias: "奥托·胡特 designC", language: "zh", sourceKey: SOURCES.official.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    { key: SCOPE, scopeKey: SCOPE, market: "Otto Hutt designC centenary fountain pen", validFrom: "2020-01-01", productionState: "current", nibScope: "18-carat gold nib; exact width by SKU", materialScope: "925 sterling silver body, matt black PVD writing unit, 18K gold index", editionScope: "designC is independent from design04/design07; case, certificate, ink and leather sleeve are package accessories" },
    { key: `${SCOPE}-boundary`, scopeKey: `${SCOPE}-boundary`, productionState: "current", editionScope: "Pull+Twist mechanism is not cartridge/converter or a generic Otto Hutt part; rollerball and accessories are separate objects" },
    { key: `${SCOPE}-care`, scopeKey: `${SCOPE}-care`, productionState: "current", editionScope: "silver/PVD care, water-only cleaning and service escalation for resistance or leaks" },
  ],
  claims: [
    claim("phase328-designc-identity", "model_identity", "designC 是 Otto Hutt 独立的百年纪念钢笔，不是 design04 或 design07 的银色、笔尖或包装变体。", SOURCES.official.key, "official designC product identity"),
    claim("phase328-designc-material", "construction", "官方说明笔身主要为 925/- sterling silver，书写单元为哑黑 PVD，笔杆与笔帽使用 18K yellow gold index，笔帽带个体编号和银标。", SOURCES.official.key, "silver, PVD, index and engraving fields"),
    claim("phase328-designc-filling", "filling_system", "Pull+Twist 机构先缓慢拉出尾部进入上墨位置，再旋转在笔内形成真空并吸入墨水；它不是普通 converter 或通用活塞。", SOURCES.oldOfficial.key, "Pull+Twist mechanism explanation"),
    claim("phase328-designc-nib", "nib_options", "官方旧站把 designC 笔尖描述为 18-carat gold；具体宽度按实物或 SKU 核对，不把 design07 的大型尖描述移入所有 designC。", SOURCES.oldOfficial.key, "18-carat gold nib statement"),
    claim("phase328-designc-weight", "material_weight", "官方商品页给出的银总重量约 34 g、金总重量约 1 g 是材料重量快照，不是整支钢笔净重。", SOURCES.official.key, "total silver and gold weight fields"),
    claim("phase328-designc-package", "included_accessories", "当前官方套装列 Walkleder 皮套、银色清洁布、100YRS booklet、编号证书和一瓶防水墨水；地区库存变化不改变型号身份。", SOURCES.official.key, "case, booklet, certificate and ink package"),
    claim("phase328-designc-care", "maintenance", "银表面用软布轻拭，书写单元清洁以室温清水为限；避免酒精、研磨剂、硬刷和强行拆 Pull+Twist，异常阻力或漏墨交给授权服务。", SOURCES.official.key, "finish and user-care boundary"),
    claim("phase328-designc-secondary", "professional_cross_check", "The Pencilcase Blog 的专业评测以实物样本交叉讨论 designC 的银制纪念定位、Pull+Twist 和书写体验；体验不替代官方尺寸或维修承诺。", SOURCES.pencilcase.key, "review scope and sample experience"),
    claim("phase328-designc-uk-secondary", "professional_cross_check", "UK Fountain Pens 的长期文章把 designC 作为 500 支限量百年纪念样本讨论；数量与体验应限定在该资料所指版本，不扩写为所有未来批次。", SOURCES.ukReview.key, "limited-edition discussion and purchase experience"),
    claim("phase328-designc-boundary", "identity_boundaries", "designC 的银主体、Pull+Twist 和 18K 标记与 design04 的 cartridge/converter 路线、design07 的 Silver/Lacquer 路线分开；滚珠笔、皮套和墨水也不并入钢笔实体。", SOURCES.booklet.key, "centenary design and adjacent line boundary"),
    claim("phase328-designc-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明真实比例、银色反光、编号、Logo、尖宽或具体实物品相。", SOURCES.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase328-designc-nib-width", name: "18K gold nib widths", notes: "笔尖材质由官方确认，具体宽度按当期 SKU 或实物核对。", sourceKey: SOURCES.oldOfficial.key, variantKind: "nib" },
    { key: "phase328-designc-centenary-package", name: "100YRS numbered package", notes: "Walkleder 皮套、编号证书、booklet、清洁布和防水墨水是官方套装字段，不拆成型号。", sourceKey: SOURCES.official.key, variantKind: "edition_group" },
    { key: "phase328-designc-limited-sample", name: "500-piece edition (review scope)", notes: "500 支数量来自专业评测所讨论的版本范围，需保留资料来源边界。", sourceKey: SOURCES.ukReview.key, variantKind: "market_sku" },
  ],
  spec: {
    brandEntityId: PHASE328_OTTO_HUTT_BRAND_ID,
    values: {
      series_name: "Otto Hutt designC",
      release_year: "2020 百年纪念语境；官方当前页面未在本包断言具体首发日",
      origin_country: "德国；官方刻字与品牌页面使用 Made in Germany 语境",
      nib: "18-carat gold；具体尖宽按 SKU",
      fill_system: "Pull+Twist 专用真空上墨机构；先拉出尾部，再旋转吸墨",
      material: "925 sterling silver 主体、哑黑 PVD 书写单元、18K gold index",
      dimensions: "官方当前页面未给统一长度/直径；不从 design04/07 回填",
      weight: "银总重量约 34 g、金总重量约 1 g；这是材料重量，不是整笔净重",
      price_range: "百年纪念高端/限量产品；价格随地区、库存和证书套装核对",
      status: "官方 designC 页面可访问；编号、套装和地区库存按具体实物核对",
    },
    evidence: [
      evidence("phase328-brand", "brand_entity_id", SOURCES.official.key, "Otto Hutt official model context"),
      evidence("phase328-series", "series_name", SOURCES.official.key, "designC heading"),
      evidence("phase328-release", "release_year", SOURCES.booklet.key, "100YRS centenary context; no exact first-date claim"),
      evidence("phase328-origin", "origin_country", SOURCES.official.key, "Made in Germany engraving and brand context"),
      evidence("phase328-nib", "nib", SOURCES.oldOfficial.key, "18-carat gold nib statement"),
      evidence("phase328-fill", "fill_system", SOURCES.oldOfficial.key, "Pull+Twist sequence"),
      evidence("phase328-material", "material", SOURCES.official.key, "925 silver, PVD and gold index"),
      evidence("phase328-dimensions", "dimensions", SOURCES.official.key, "no uniform dimensions published in current page"),
      evidence("phase328-weight", "weight", SOURCES.official.key, "34 g silver and 1 g gold material totals"),
      evidence("phase328-price", "price_range", SOURCES.official.key, "current high-end centenary product context"),
      evidence("phase328-status", "status", SOURCES.official.key, "current official designC page"),
    ],
  },
  media: [{
    key: "phase328-designc-primary-media",
    title: "Otto Hutt designC 事实图（非产品照片）",
    sourceKey: SOURCES.diagram.key,
    localPath: SOURCES.diagram.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
    sourceUrl: SOURCES.diagram.url,
    usageStatus: "primary",
  }],
};

export const phase328OttoHuttDesignCPacks: CuratedEntityPack[] = [inheritedBrand, designC];
