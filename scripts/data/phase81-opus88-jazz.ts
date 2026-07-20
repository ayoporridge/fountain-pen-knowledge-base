import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import {
  PHASE57_OPUS_BRAND_ID,
  phase57Opus88LeonardoPacks,
} from "./phase57-opus88-leonardo";

export const PHASE81_OPUS_BRAND_ID = PHASE57_OPUS_BRAND_ID;
export const PHASE81_JAZZ_FALLBACK_ID = "phase81-pen-opus88-jazz";
export const PHASE81_JAZZ_SLUG = "opus-88-jazz";

const RETRIEVED = "2026-07-20";

function source(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator">): CuratedSource {
  return {
    ...input,
    retrievedAt: RETRIEVED,
    allowedUse: input.sourceType === "user_submission" ? "store_full" : "summary_only",
    archiveUrl: input.url,
    archiveLocator: input.url.startsWith("/")
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;to-scale=false;colour-proof=false`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

const SOURCES = {
  penquisition: source({
    key: "phase81-opus88-jazz-penquisition",
    registryKey: "penquisition-phase81",
    registryName: "Penquisition / Pengeek13",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "penquisition",
    title: "OPUS 88 Jazz Fountain Pen",
    url: "https://penquisition.com/blog/2021/05/12/opus-88-jazz-fountain-pen",
    homepageUrl: "https://penquisition.com/",
    author: "Pengeek13",
    summary: "2021 年实测将 Jazz 记为传统全尺寸雪茄形，约 151.2 mm、15.2 mm、28 g；记录 #6 JoWo steel nib、尾阀、滴管填充、约 3.5 圈开帽及约 3 ml 的单一样本容量说法。",
  }),
  pencilcase: source({
    key: "phase81-opus88-jazz-pencilcase",
    registryKey: "pencilcase-blog-phase81",
    registryName: "The Pencilcase Blog",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pencilcase-blog",
    title: "Review: Opus 88 Jazz Demonstrator Fountain Pen",
    url: "https://www.pencilcaseblog.com/2021/05/review-opus-88-jazz-demonstrator.html",
    homepageUrl: "https://www.pencilcaseblog.com/",
    author: "The Pencilcase Blog",
    summary: "2021 年评测把 Jazz 放在 Demo、Omar 之外的 classic/full-size 外形中讨论，记录透明与 Holiday Clear 等名称，并给出约 3 ml 的单一评测容量口径。",
  }),
  penAddict: source({
    key: "phase81-opus88-jazz-pen-addict",
    registryKey: "pen-addict-phase81",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-addict",
    title: "Opus 88 Jazz Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2024/1/31/opus-88-jazz-fountain-pen-review",
    homepageUrl: "https://www.penaddict.com/",
    author: "The Pen Addict",
    summary: "2024 评测将 Jazz 与 Demo、Fantasia、Koloro 并列为不同型号，并以接近 2 ml 的容量描述提醒读者：不同来源没有给出可统一为一个精确数值的同一 SKU 记录。",
  }),
  gentleman: source({
    key: "phase81-opus88-jazz-gentleman-stationer",
    registryKey: "gentleman-stationer-phase81",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "gentleman-stationer",
    title: "Workhorse Pens: Opus 88 Fountain Pens Offer Maximum Versatility",
    url: "https://www.gentlemanstationer.com/blog/2021/10/16/workhorse-pens-opus-88-fountain-pens-offer-maximum-versatility",
    homepageUrl: "https://www.gentlemanstationer.com/",
    author: "The Gentleman Stationer",
    summary: "专业编辑资料将 Jazz/Omar 的常见可换 #6 JoWo 单元与 Koloro 的较小路线、Opera 的 Bock 路线分别讨论；它支持家族边界，不替任一二手笔确认原装零件。",
  }),
  holiday: source({
    key: "phase81-opus88-jazz-holiday-appelboom",
    registryKey: "appelboom-phase81",
    registryName: "Appelboom",
    sourceType: "retailer",
    tier: "contemporary_archive",
    independenceGroup: "appelboom-retailer",
    title: "Opus 88 Jazz Holiday Clear Fountain Pen",
    url: "https://appelboom.com/opus-88-jazz-holiday-clear-fountain-pen/",
    homepageUrl: "https://appelboom.com/",
    author: "Appelboom",
    summary: "零售存档以 Jazz Holiday Clear 的完整商品名和 #6 JoWo 配置交叉证明它是 Jazz 的一项表面／饰件版本；该页不代表所有颜色、库存或现售状态。",
  }),
  quickstart: source({
    key: "phase81-opus88-eyedropper-quickstart",
    registryKey: "opus88-care-phase81",
    registryName: "Opus 88 Eyedropper Quick Start",
    sourceType: "blog",
    tier: "contemporary_archive",
    independenceGroup: "opus88-care-guide",
    title: "Opus 88 Eyedropper Fountain Pen Instructions",
    url: "https://feedbackfromalex.com/wp-content/uploads/2025/07/Opus88QuickStart.pdf",
    homepageUrl: "https://feedbackfromalex.com/",
    author: "Opus 88 care guide",
    summary: "经销商托管的通用说明给出开阀、旋下前段、以滴管灌墨、装回并按常规冲洗的顺序；它是通用结构说明，不是 Jazz 的单一 SKU 规格表。",
  }),
  brandSvg: source({
    key: "phase81-opus88-brand-jazz-svg",
    registryKey: "fountain-pen-graph-editorial-phase81",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase81",
    title: "Opus 88 Jazz 与相邻型号边界事实图",
    url: "/images/library/site-original/opus88-jazz/opus88-brand-jazz-map.svg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片。",
  }),
  jazzSvg: source({
    key: "phase81-opus88-jazz-svg",
    registryKey: "fountain-pen-graph-editorial-phase81",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase81",
    title: "Opus 88 Jazz 结构与版本边界事实图",
    url: "/images/library/site-original/opus88-jazz/opus88-jazz-structure.svg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片。",
  }),
} satisfies Record<string, CuratedSource>;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function media(key: string, title: string, sourceItem: CuratedSource) {
  return [{
    key,
    title,
    sourceKey: sourceItem.key,
    localPath: sourceItem.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、库存、材料质感、具体笔尖或具体版本。",
    sourceUrl: sourceItem.url,
    usageStatus: "primary" as const,
  }];
}

const phase57Brand = phase57Opus88LeonardoPacks.find((pack) => pack.entityId === PHASE81_OPUS_BRAND_ID);
if (!phase57Brand) throw new Error("Phase 81 requires the Phase 57 Opus 88 brand pack.");

export function phase81Opus88JazzPacks(jazzId: string): CuratedEntityPack[] {
  const brand: CuratedEntityPack = structuredClone(phase57Brand!);
  const brandScope = "phase81-opus88-brand-jazz-navigation";
  brand.key = "phase81-opus88-brand-jazz-v1";
  brand.markdownFile = ".planning/content-research/opus88-brand-jazz-phase81.md";
  brand.storyTitle = "Opus 88：把 Jazz、Demo、Koloro 与 Opera 分开认"
  brand.sources = [...brand.sources, SOURCES.penquisition, SOURCES.pencilcase, SOURCES.penAddict, SOURCES.gentleman, SOURCES.brandSvg];
  brand.scopes = [...brand.scopes, { key: brandScope, scopeKey: brandScope, productionState: "current", editionScope: "品牌入口与可核查型号导航；Jazz、Demonstrator、Koloro、Omar 与 Opera 不互相代替规格、图片或版本。" }];
  brand.claims = [
    ...brand.claims,
    {
      key: "phase81-opus88-jazz-navigation",
      predicate: "brand_model_navigation",
      objectText: "Jazz 是雪茄形、全尺寸、带尾阀的独立型号；Demonstrator/Demo、Koloro、Omar 与 Opera 是相邻但不同的笔形或笔尖路线。相同的滴入式结构与 #6 字样不足以把它们视作同一支笔。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: SOURCES.penAddict.key,
      locator: SOURCES.penAddict.summary,
      evidence: [
        { key: "phase81-opus88-jazz-nav-penaddict", sourceKey: SOURCES.penAddict.key, scopeKey: brandScope, locator: SOURCES.penAddict.summary },
        { key: "phase81-opus88-jazz-nav-gentleman", sourceKey: SOURCES.gentleman.key, scopeKey: brandScope, locator: SOURCES.gentleman.summary },
      ],
    },
  ];
  brand.media = media("phase81-opus88-brand-jazz-media", "Opus 88 型号边界事实图（非产品照片）", SOURCES.brandSvg);

  const jazzScope = "phase81-opus88-jazz-2021-common-configuration";
  const jazz: CuratedEntityPack = {
    key: "phase81-opus88-jazz-v1",
    entityId: jazzId,
    expectedType: "pen",
    expectedSlug: PHASE81_JAZZ_SLUG,
    canonicalName: "Opus 88 Jazz",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/opus88-jazz-phase81.md",
    storyTitle: "Opus 88 Jazz：雪茄形大墨仓，容量数字必须保留来源边界",
    primarySourceKey: SOURCES.penquisition.key,
    depthTier: "A",
    aliases: [
      { alias: "Opus 88 Jazz", language: "en", sourceKey: SOURCES.penquisition.key },
      { alias: "Opus88 Jazz", language: "en", sourceKey: SOURCES.penquisition.key },
      { alias: "欧品 Opus 88 Jazz", language: "zh", sourceKey: SOURCES.penAddict.key },
    ],
    sources: [SOURCES.penquisition, SOURCES.pencilcase, SOURCES.penAddict, SOURCES.gentleman, SOURCES.holiday, SOURCES.quickstart, SOURCES.jazzSvg],
    scopes: [{
      key: jazzScope,
      scopeKey: jazzScope,
      productionState: "historical",
      validFrom: "2021",
      materialScope: "early/commonly reviewed acrylic or resin Jazz; Clear, Holiday Clear and Solid Black differ in transparency, trim and retail naming",
      nibScope: "2021 and common retail record: #6 JoWo screw-in steel nib; confirm exact used pen rather than treating it as every Jazz ever sold",
      editionScope: "full-size cigar-shaped Jazz only; excludes Demonstrator/Demo, Koloro, Omar and Opera",
    }],
    claims: [
      {
        key: "phase81-jazz-identity",
        predicate: "model_identity",
        objectText: "Jazz 是 Opus 88 的独立全尺寸雪茄形 Japanese-style eyedropper：拆下前段后直接向笔杆加墨，尾端旋钮控制止墨阀。它不是透明 Demonstrator/Demo，也不是扁平端盖的 Koloro、Omar 或 Opera。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.penquisition.key,
        locator: SOURCES.penquisition.summary,
        evidence: [
          { key: "phase81-jazz-identity-penquisition", sourceKey: SOURCES.penquisition.key, scopeKey: jazzScope, locator: SOURCES.penquisition.summary },
          { key: "phase81-jazz-identity-pencilcase", sourceKey: SOURCES.pencilcase.key, scopeKey: jazzScope, locator: SOURCES.pencilcase.summary },
        ],
      },
      {
        key: "phase81-jazz-capacity-boundary",
        predicate: "specification_conflict",
        objectText: "Jazz 的公开评测对墨仓容量没有一条可统一的精确数值：有资料写约 3 ml，也有资料写接近 2 ml。本页只称其为大容量滴入式墨仓，并要求购买者按具体版本、测量方法与剩余空间核对。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.penAddict.key,
        locator: SOURCES.penAddict.summary,
        evidence: [
          { key: "phase81-jazz-capacity-penaddict", sourceKey: SOURCES.penAddict.key, scopeKey: jazzScope, locator: SOURCES.penAddict.summary },
          { key: "phase81-jazz-capacity-penquisition", sourceKey: SOURCES.penquisition.key, scopeKey: jazzScope, locator: SOURCES.penquisition.summary },
          { key: "phase81-jazz-capacity-pencilcase", sourceKey: SOURCES.pencilcase.key, scopeKey: jazzScope, locator: SOURCES.pencilcase.summary },
        ],
      },
      {
        key: "phase81-jazz-use-boundary",
        predicate: "maintenance_boundary",
        objectText: "尾阀帮助管理供墨与携带风险，不是抽墨活塞，也不能保证绝不渗漏。常规步骤是开阀、旋下前段、滴管加注普通钢笔墨、装回后让笔舌润湿；清洗以清水冲洗为主，不建议自行拆尾阀总成。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: SOURCES.quickstart.key,
        locator: SOURCES.quickstart.summary,
        evidence: [
          { key: "phase81-jazz-care-quickstart", sourceKey: SOURCES.quickstart.key, scopeKey: jazzScope, locator: SOURCES.quickstart.summary },
          { key: "phase81-jazz-care-penquisition", sourceKey: SOURCES.penquisition.key, scopeKey: jazzScope, locator: SOURCES.penquisition.summary },
        ],
      },
    ],
    variants: [
      { key: "phase81-jazz-early-colours", name: "2021 首发期半透明／双色配色记录", releaseYear: "2021", notes: "早期评测看到的表面配色是 Jazz 的版本记录，不表示全部颜色、饰件或库存仍相同。", sourceKey: SOURCES.penquisition.key, variantKind: "market_sku" },
      { key: "phase81-jazz-holiday-clear", name: "Jazz Holiday Clear", releaseYear: "存档商品页", notes: "Holiday Clear 的名称、透明度和饰件应按该商品页单独认；不能用作普通 Jazz 的实物照片或固定规格。", sourceKey: SOURCES.holiday.key, variantKind: "market_sku" },
      { key: "phase81-jazz-clear-solid", name: "Clear / Solid Black 等零售命名", releaseYear: "不同批次", notes: "透明、磨砂、实色与饰件是同一笔形下的版本语言；尖号、存货和图像逐个 SKU 核查。", sourceKey: SOURCES.pencilcase.key, variantKind: "edition_group" },
    ],
    spec: {
      brandEntityId: PHASE81_OPUS_BRAND_ID,
      values: {
        series_name: "Opus 88 Jazz（2021 首发期与常见零售版本）",
        release_year: "2021 年公开评测／首发期资料；后续颜色与库存按具体 SKU",
        origin_country: "台湾 Opus 88 产品线；具体制造批次以包装与卖家资料核对",
        nib: "2021 与常见零售记录：#6 JoWo screw-in steel nib；EF/F/M/B/1.5 stub 等选项按市场和实物核查",
        fill_system: "Japanese-style eyedropper；手动滴入，尾端 shut-off valve 管理墨水通道；不是活塞或墨囊／converter",
        material: "树脂／acrylic 主体的常见公开版本；Clear、Holiday Clear、Solid Black 的透明度与饰件不相同",
        dimensions: "首发期实测参考：合盖约 151.2 mm、最大径约 15.2 mm；套帽约 174 mm，仅作尺寸判断，不代替各批次实物",
        weight: "首发期实测参考约 28 g；材料、饰件和测量状态可能不同",
        status: "至少有 2021 首发期及后续零售版本记录；本页不据旧评测断言所有颜色现售或停售",
      },
      evidence: [
        evidence("brand_entity_id", "phase81-jazz-brand", SOURCES.penquisition.key, jazzScope, "Opus 88 Jazz model identity"),
        evidence("series_name", "phase81-jazz-series", SOURCES.penquisition.key, jazzScope, "Jazz title and 2021 review scope"),
        evidence("release_year", "phase81-jazz-release", SOURCES.penquisition.key, jazzScope, "2021 publication date"),
        evidence("origin_country", "phase81-jazz-origin", SOURCES.gentleman.key, jazzScope, "Opus 88 model family context"),
        evidence("nib", "phase81-jazz-nib", SOURCES.penquisition.key, jazzScope, "#6 JoWo steel nib observation"),
        evidence("fill_system", "phase81-jazz-fill", SOURCES.quickstart.key, jazzScope, "Japanese-style eyedropper filling and valve sequence"),
        evidence("material", "phase81-jazz-material", SOURCES.pencilcase.key, jazzScope, "Clear/Holiday Clear and surface-version boundary"),
        evidence("dimensions", "phase81-jazz-dimensions", SOURCES.penquisition.key, jazzScope, "151.2 mm / 15.2 mm / posted 174 mm measured reference"),
        evidence("weight", "phase81-jazz-weight", SOURCES.penquisition.key, jazzScope, "28 g measured reference"),
        evidence("status", "phase81-jazz-status", SOURCES.holiday.key, jazzScope, "archived Holiday Clear retail-name boundary"),
      ],
    },
    media: media("phase81-opus88-jazz-media", "Opus 88 Jazz 结构与版本边界事实图（非产品照片）", SOURCES.jazzSvg),
    timeline: [
      { key: "phase81-jazz-2021", title: "Jazz 的首发期公开评测", eventType: "model_released", startDate: "2021", circa: true, description: "2021 年的专业评测记录了 Jazz 作为独立雪茄形、全尺寸型号的首发期配置与尺寸参考。", sourceKey: SOURCES.penquisition.key },
      { key: "phase81-jazz-2024", title: "后续评测再次区分相邻型号", eventType: "design_milestone", startDate: "2024", circa: false, description: "后续评测将 Jazz 与 Demo、Fantasia、Koloro 并列比较，说明相同品牌和滴入结构不构成同一型号。", sourceKey: SOURCES.penAddict.key },
    ],
  };
  return [brand, jazz];
}
