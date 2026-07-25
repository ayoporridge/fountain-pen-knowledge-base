import type {
  CuratedClaimEvidence,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase41IdentityCleanupPacks } from "./phase41-identity-cleanup";

const RETRIEVED = "2026-07-26";
export const PHASE244_WATERMAN_ID = "zkAu9PePDdqJ";
export const PHASE244_PEN_ID = "p244WatermanAllure";
export const PHASE244_PEN_SLUG = "waterman-allure-fountain-pen";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; summary: string; sourceType?: CuratedSource["sourceType"]; tier?: CuratedSource["tier"]; independenceGroup?: string; itemType?: string }): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.independenceGroup ?? input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: input.itemType,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(key: string, title: string, url: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase244",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase244",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary,
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  collection: web({ key: "phase244-waterman-allure-collection", title: "Waterman Allure collection", url: "https://www.waterman.com/pens/allure/", registryKey: "waterman-allure-collection-phase244", registryName: "Waterman", independenceGroup: "waterman-official", summary: "官方当前目录将 Allure 的 fountain pen、rollerball、ballpoint 分开列出；钢笔颜色项包括 Stainless Steel 与 Black CT，并标注 Fine nib。" }),
  product: web({ key: "phase244-waterman-allure-product", title: "Waterman Allure Fountain Pen S0037650", url: "https://www.waterman.com/pens/allure/allure/allure-fountain-pen/SAP_S0037650.html", registryKey: "waterman-allure-product-phase244", registryName: "Waterman", independenceGroup: "waterman-official", summary: "官方商品页列 S0037650、Fountain Pen、Fine、不锈钢帽、蓝色墨水；正文说明刷纹不锈钢笔身与帽、环形 W 不锈钢尖、法国手工装配和礼盒。" }),
  allures: web({ key: "phase244-waterman-allure-story", title: "Waterman The Allure of Paris", url: "https://www.waterman.com/allure-pens.html", registryKey: "waterman-allure-story-phase244", registryName: "Waterman", independenceGroup: "waterman-official", summary: "官方系列介绍以不锈钢基材、细身、双叉笔夹、法国装配和三种 writing modes 为重点，并把钢笔、滚珠笔、圆珠笔分开说明。" }),
  care: web({ key: "phase244-waterman-filling", title: "Waterman fountain pen filling instructions", url: "https://www.waterman.com/support?cfid=fountain-pen-ink-filling-instructions", registryKey: "waterman-filling-phase244", registryName: "Waterman support", independenceGroup: "waterman-support", summary: "官方说明墨胆与转换器的装入、吸墨、排出多余空气和清洁步骤；用于 Allure 的维护边界，不扩展为特定包装承诺。" }),
  retailer: web({ key: "phase244-waterman-allure-retailer", title: "Pen Heaven Waterman Allure Chrome fountain pen", url: "https://www.penheaven.com/waterman-allure-chrome-fountain-pen", registryKey: "pen-heaven-waterman-allure-phase244", registryName: "Pen Heaven", sourceType: "retailer", tier: "professional_secondary", independenceGroup: "pen-heaven", summary: "独立零售商记录刷纹铬色、不锈钢 Fine 尖、蓝色墨胆、转换器兼容、法国制造、约 134 mm 闭盖与 22 g；仅作为特定 Chrome 版本和用户购买信息的旁证。" }),
  review: web({ key: "phase244-waterman-allure-review", title: "Fountain Pen Network Waterman Allure review", url: "https://www.fountainpennetwork.com/forum/topic/135336-waterman-allure/", registryKey: "fpn-waterman-allure-review-phase244", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", independenceGroup: "fountain-pen-network", summary: "2009 年独立评测记录一支旧红色 Allure 的钢尖、约 137 mm 闭盖、约 11 mm 直径与普通 Waterman 墨胆/转换器；明确作为 dated sample，不能覆盖当前 S0037650。" }),
  svg: diagram("phase244-waterman-allure-svg", "Waterman Allure factual diagram", "/images/library/site-original/phase244/waterman/allure.svg", "本站原创 factual SVG；表达 S0037650 的钢制笔身、Fine 尖、墨胆/转换器和饰面边界。"),
} as const;

function claimEvidence(key: string, sourceKey: string, scopeKey: string, locator: string): CuratedClaimEvidence { return { key, sourceKey, scopeKey, locator }; }
function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence { return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true }; }

const scope = "phase244-waterman-allure-current";
const pen: CuratedEntityPack = {
  key: "phase244-waterman-allure-v1",
  entityId: PHASE244_PEN_ID,
  expectedType: "pen",
  expectedSlug: PHASE244_PEN_SLUG,
  canonicalName: "威迪文 Waterman Allure 钢笔",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/waterman-allure-phase244.md",
  storyTitle: "Waterman Allure：S0037650 的轻量日用边界",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Waterman Allure Fountain Pen", language: "en", sourceKey: S.product.key },
    { alias: "Waterman Allure", language: "en", sourceKey: S.collection.key },
    { alias: "威迪文 Allure 钢笔", language: "zh", sourceKey: S.collection.key },
    { alias: "Waterman Allure Chrome", language: "en", sourceKey: S.retailer.key },
  ],
  sources: [S.collection, S.product, S.allures, S.care, S.retailer, S.review, S.svg],
  scopes: [{ key: scope, scopeKey: scope, market: "Waterman current UK website", validFrom: RETRIEVED, productionState: "current", nibScope: "S0037650 official page lists Fine stainless-steel nib; other regional widths require SKU confirmation.", materialScope: "S0037650 brushed stainless steel reference; Black CT and lacquer finishes are variants.", editionScope: "Current Allure fountain pen family; old Pastel/Deluxe and non-fountain writing modes excluded." }],
  claims: [
    { key: "phase244-allure-identity", predicate: "model_identity", objectText: "Waterman Allure 钢笔是 Waterman 当前目录中的独立日用钢笔系列；本页用官方 SKU S0037650 作为刷纹不锈钢版本的规格锚点，与同名 rollerball 和 ballpoint 分开。", factClass: "core", confidence: 0.99, sourceKey: S.product.key, locator: S.product.summary, evidence: [claimEvidence("phase244-allure-identity-product", S.product.key, scope, S.product.summary), claimEvidence("phase244-allure-identity-collection", S.collection.key, scope, S.collection.summary)] },
    { key: "phase244-allure-current-boundary", predicate: "current_catalog_boundary", objectText: "官网当前目录列出 Allure Fountain Pen 并显示 Stainless Steel、Black CT 等颜色；过去的 Pastel、Deluxe 或地区名称不能自动继承为当前库存，也不能将缺货页面写成停产证明。", factClass: "core", confidence: 0.98, sourceKey: S.collection.key, locator: S.collection.summary, evidence: [claimEvidence("phase244-allure-boundary-collection", S.collection.key, scope, S.collection.summary), claimEvidence("phase244-allure-boundary-retailer", S.retailer.key, scope, S.retailer.summary)] },
    { key: "phase244-allure-material", predicate: "material_and_trim", objectText: "S0037650 官方描述为刷纹不锈钢笔身与笔帽、细身轮廓、Waterman 标志和双叉笔夹；系列页同时说明部分饰面在不锈钢基材上覆漆，因此材质必须按具体 finish 读取。", factClass: "core", confidence: 0.99, sourceKey: S.product.key, locator: S.product.summary, evidence: [claimEvidence("phase244-allure-material-product", S.product.key, scope, S.product.summary), claimEvidence("phase244-allure-material-story", S.allures.key, scope, S.allures.summary)] },
    { key: "phase244-allure-nib", predicate: "nib_specification", objectText: "S0037650 配置刻有环形 W 标志的不锈钢 Fine 尖；Waterman 的 smooth、consistent 是产品目标，不应被改写成每一支笔都无需调校的保证。", factClass: "core", confidence: 0.99, sourceKey: S.product.key, locator: S.product.summary, evidence: [claimEvidence("phase244-allure-nib-product", S.product.key, scope, S.product.summary), claimEvidence("phase244-allure-nib-review", S.review.key, scope, S.review.summary)] },
    { key: "phase244-allure-fill", predicate: "filling_system", objectText: "Allure 采用 Waterman 墨胆或转换器工作流；官方支持页说明装入墨胆、用转换器吸墨和换色清洁的步骤，但没有承诺所有地区包装都附带转换器。", factClass: "core", confidence: 0.98, sourceKey: S.care.key, locator: S.care.summary, evidence: [claimEvidence("phase244-allure-fill-care", S.care.key, scope, S.care.summary), claimEvidence("phase244-allure-fill-retailer", S.retailer.key, scope, S.retailer.summary)] },
    { key: "phase244-allure-origin", predicate: "manufacturing_boundary", objectText: "当前官方商品页和系列页把 Allure 描述为在法国手工装配；这项来源用于当前产品语境，不把旧款或所有 Waterman 产品都概括为同一生产地。", factClass: "core", confidence: 0.98, sourceKey: S.product.key, locator: S.product.summary, evidence: [claimEvidence("phase244-allure-origin-product", S.product.key, scope, S.product.summary), claimEvidence("phase244-allure-origin-story", S.allures.key, scope, S.allures.summary)] },
    { key: "phase244-allure-care", predicate: "maintenance_boundary", objectText: "更换颜色或长期停用前应以常温清水冲洗笔尖和握位并充分晾干；避免热水、酒精、强溶剂、研磨剂和自行拆解漆面、尖端或夹件。", factClass: "editorial", confidence: 0.97, sourceKey: S.care.key, locator: S.care.summary, evidence: [claimEvidence("phase244-allure-care-official", S.care.key, scope, S.care.summary), claimEvidence("phase244-allure-care-product", S.product.key, scope, S.product.summary)] },
  ],
  variants: [
    { key: "phase244-allure-variant-stainless", name: "Stainless Steel", notes: "S0037650 reference finish; brushed stainless steel body and cap", sourceKey: S.product.key, variantKind: "material", market: "global" },
    { key: "phase244-allure-variant-black-ct", name: "Black CT", notes: "Current collection finish; exact SKU and coating follow regional product page", sourceKey: S.collection.key, variantKind: "color", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE244_WATERMAN_ID,
    values: {
      series_name: "Waterman Allure",
      release_year: "未由当前官方资料给出；S0037650 是当前商品页 SKU",
      origin_country: "法国手工装配（当前官方商品页语境）",
      nib: "不锈钢 Fine 尖，刻有环形 W 标志",
      fill_system: "Waterman 墨胆或转换器；是否随盒附带转换器按具体 SKU 核对",
      material: "S0037650 为刷纹不锈钢笔身与笔帽；其它 finish 可能在不锈钢基材上覆漆",
      dimensions: "约 134 mm 闭盖、约 158 mm 套帽、约 11 mm 直径（Pen Heaven 的 Chrome 版本资料）",
      weight: "约 22 g（Pen Heaven 的 Chrome 版本资料；不覆盖所有 finish）",
      price_range: "当前官方页未提供可冻结的统一价格；地区、颜色与促销会变化",
      status: "Waterman 当前目录列出的 Allure fountain pen；地区库存会变化",
    },
    evidence: [
      evidence("phase244-allure-spec-brand", "brand_entity_id", S.collection.key, scope, "Waterman Allure collection"),
      evidence("phase244-allure-spec-series", "series_name", S.collection.key, scope, "Allure collection title"),
      evidence("phase244-allure-spec-sku", "release_year", S.product.key, scope, "S0037650 current product page; no release year asserted"),
      evidence("phase244-allure-spec-origin", "origin_country", S.product.key, scope, "Crafted / hand assembled in France"),
      evidence("phase244-allure-spec-nib", "nib", S.product.key, scope, "Fine stainless steel nib and looped W"),
      evidence("phase244-allure-spec-fill", "fill_system", S.care.key, scope, "Waterman cartridge and converter instructions"),
      evidence("phase244-allure-spec-material", "material", S.product.key, scope, "Brushed stainless steel barrel and cap"),
      evidence("phase244-allure-spec-dimensions", "dimensions", S.retailer.key, scope, "Chrome version dimensions"),
      evidence("phase244-allure-spec-weight", "weight", S.retailer.key, scope, "Chrome version weight"),
      evidence("phase244-allure-spec-price", "price_range", S.product.key, scope, "Current product page does not expose a stable price"),
      evidence("phase244-allure-spec-status", "status", S.collection.key, scope, "Current Allure catalog"),
    ],
  },
  media: [{ key: "phase244-allure-primary", title: "Waterman Allure 事实图（非产品照片）", sourceKey: S.svg.key, localPath: "/images/library/site-original/phase244/waterman/allure.svg", author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。", sourceUrl: "/images/library/site-original/phase244/waterman/allure.svg", usageStatus: "primary" }],
};

const watermanBrand = structuredClone(phase41IdentityCleanupPacks.find((pack) => pack.entityId === PHASE244_WATERMAN_ID && pack.expectedType === "brand"));
if (!watermanBrand) throw new Error("Phase 244 Waterman brand pack missing.");
watermanBrand.key = "phase244-waterman-brand-v1";
export const phase244WatermanAllurePacks: CuratedEntityPack[] = [watermanBrand, pen];
