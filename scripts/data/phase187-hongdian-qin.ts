import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase174HongdianM2Packs } from "./phase174-hongdian-m2";

const RETRIEVED = "2026-07-25";
export const PHASE187_HONGDIAN_BRAND_ID = "4yRpvovXFoWh";
export const PHASE187_QIN_ID = "F9Fb7joURlNH";

function live(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, independenceGroup: input.registryKey, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase187", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase187", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, summary: "本站原创 factual SVG；示意图，非产品照片，不证明比例、颜色、重量或库存。", allowedUse: "store_full", license: "site-original", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}

const S = {
  product: live({ key: "phase187-hongdian-qin-ttpen-product", title: "TTPen：Hongdian D5 Qin Dynasty Fountain Pen", url: "https://www.ttpen.com/products/hongdian-d5-qin-dynasty-fountain-pen", registryKey: "ttpen-hongdian-qin-phase187", registryName: "TTPen", sourceType: "retailer", tier: "retailer", summary: "零售页确认 D5 Qin Dynasty 名称、主题纹样、Fine 尖和活塞路线；价格与库存只代表该渠道。", locator: "D5 Qin Dynasty product title, engraved body, Fine nib and piston filling" }),
  review: live({ key: "phase187-hongdian-qin-ttpen-review", title: "TTPen：Hongdian D5 Qin Dynasty 评测", url: "https://www.ttpen.com/blogs/guides/write-like-an-emperor-the-hongdian-d5-qin-dynasty-fountain-pen-review", registryKey: "ttpen-hongdian-qin-review-phase187", registryName: "TTPen", sourceType: "blog", tier: "professional_secondary", summary: "评测补充金属雕刻、笔尖、活塞和主题使用语境；部分赞美属于商家评测，不升级为全批次质量保证。", locator: "D5 construction, filling, nib and use context" }),
  community: live({ key: "phase187-hongdian-qin-community", title: "Reddit：Hongdian D5 Qin Dynasty 使用讨论", url: "https://www.reddit.com/r/fountainpens/comments/18krasn", registryKey: "reddit-hongdian-qin-phase187", registryName: "r/fountainpens participants", sourceType: "reddit", tier: "community", summary: "玩家讨论记录重量感、平衡、Long Knife 线条和单支调校；只归因到个人样本。", locator: "D5 weight, balance, Long Knife and individual nib experience" }),
  d5x: live({ key: "phase187-hongdian-d5x-manual", title: "Hongdian D5X 使用说明资料", url: "https://manuals.plus/asin/B0D6WDMWPY.pdf", registryKey: "hongdian-d5x-manual-phase187", registryName: "Hongdian D5X manual mirror", sourceType: "blog", tier: "contemporary_archive", summary: "说明资料用于提醒 D5 与 D5X 的上墨和版本边界，不把相邻 SKU 当成同一规格。", locator: "D5X model, closure and filling context" }),
  official: live({ key: "phase187-hongdian-catalogue", title: "Hongdian 当代产品目录站", url: "https://hongdianpens.com/", registryKey: "hongdian-catalogue-phase187", registryName: "Hongdian product catalogue", sourceType: "official", tier: "contemporary_archive", summary: "目录站用于当代品牌和 D 系列语境；不从营销文案推导 D5 的统一重量、容量或历史。", locator: "contemporary brand and D-series navigation" }),
  svg: diagram("phase187-hongdian-qin-svg", "HongDian D5 秦主题钢笔示意", "/images/library/site-original/phase187/hongdian/qin.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.85, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const scope = "hongdian-qin-d5-model";
export const phase187HongdianQinPack: CuratedEntityPack = {
  key: "phase187-hongdian-qin",
  entityId: PHASE187_QIN_ID,
  expectedType: "pen",
  expectedSlug: "弘典-hongdian-秦",
  canonicalName: "弘典 HongDian 秦",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/hongdian-qin-phase187.md",
  storyTitle: "弘典 HongDian 秦（D5 Qin Dynasty）：主题纹样与活塞日用",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [{ alias: "HongDian D5 Qin Dynasty", language: "en", sourceKey: S.product.key }, { alias: "Hongdian D5", language: "en", sourceKey: S.review.key }, { alias: "HongDian Qin", language: "en", sourceKey: S.product.key }, { alias: "弘典 秦", language: "zh", sourceKey: S.product.key }],
  sources: [S.product, S.review, S.community, S.d5x, S.official, S.svg],
  scopes: [{ key: scope, scopeKey: "hongdian-d5-qin-identity-and-sku-boundary", productionState: "current", editionScope: "D5 Qin Dynasty identity, theme, filling, nib options, maintenance and buying guidance" }],
  claims: [
    claim("hongdian-qin-identity", "model_identity", "弘典秦对应公开资料中的 HongDian D5 Qin Dynasty，是以秦代主题纹样、金属笔身和瓶装墨活塞路线为识别点的现代钢笔。", S.product.key, scope, "D5 Qin Dynasty product title and identity"),
    claim("hongdian-qin-sku-boundary", "version_boundary", "D5、D5X、颜色和 Fine／Long Knife 等尖端选项不能只凭“秦”字合并；购买时按尾端结构、包装和尖号确认。", S.d5x.key, scope, "D5/D5X filling and nib boundary"),
    claim("hongdian-qin-writing", "writing_sample_boundary", "玩家样本认为笔身有重量且平衡尚可，Long Knife 有方向性反馈；这些是单支体验，不是全批次质量保证。", S.community.key, scope, "individual weight, balance and Long Knife observations"),
    claim("hongdian-qin-care", "maintenance_guidance", "活塞笔换色时用室温清水反复进出，避免酒精、热水和金属工具；活塞卡滞或漏墨时停止拆解并联系维修。", S.review.key, scope, "piston cleaning and conservative care boundary"),
    claim("hongdian-qin-maker", "brand_context", "该型号归入已公开的 HongDian 品牌导航；秦代纹样是现代设计灵感，不等于历史文物或品牌古代沿革。", S.official.key, scope, "contemporary Hongdian catalogue context"),
  ],
  variants: [{ key: "hongdian-qin-fine", name: "Fine 尖", notes: "公开零售页常见的细尖选项；实际线宽和调校按单支确认。", sourceKey: S.product.key, variantKind: "nib" }, { key: "hongdian-qin-long-knife", name: "Long Knife／Long Blade 选项", notes: "部分市场或玩家讨论中的尖端选择，不等于每个 D5 包装都有。", sourceKey: S.community.key, variantKind: "nib" }, { key: "hongdian-qin-colors", name: "绿金、黑金等 finish", notes: "颜色和饰件按渠道 SKU 区分，不能从单一实物推导全系配色。", sourceKey: S.product.key, variantKind: "color" }],
  spec: {
    brandEntityId: PHASE187_HONGDIAN_BRAND_ID,
    values: { series_name: "HongDian D5 Qin Dynasty（弘典秦）", nib: "公开商品常见 Fine；Long Knife/Long Blade 等为部分 SKU 或选项，线宽和调校按单支确认", fill_system: "D5 商品与独立资料指向内置活塞、瓶装墨上墨；D5X 等相近名称可能是转换器变体，购买时核对", material: "金属笔身和笔帽，带秦代主题雕刻或装饰；颜色与饰件按具体 SKU 区分", dimensions: "没有足够独立资料建立跨版本统一尺寸；按商品页面与实物核对", weight: "独立玩家描述有重量感且样本平衡良好；未建立统一工厂重量", status: "现代 HongDian 渠道流通型号；颜色、尖号、库存和 D5/D5X 命名按渠道确认" },
    evidence: [ev("hongdian-qin", "brand_entity_id", S.official.key, scope, "Hongdian catalogue context"), ev("hongdian-qin", "series_name", S.product.key, scope, "D5 Qin Dynasty product title"), ev("hongdian-qin", "nib", S.product.key, scope, "Fine product option and community Long Knife boundary"), ev("hongdian-qin", "fill_system", S.product.key, scope, "piston filling product description"), ev("hongdian-qin", "material", S.review.key, scope, "metal engraved body and cap"), ev("hongdian-qin", "dimensions", S.product.key, scope, "no unified cross-SKU dimension published"), ev("hongdian-qin", "weight", S.community.key, scope, "individual weight/balance observation"), ev("hongdian-qin", "status", S.product.key, scope, "retailer current listing boundary")],
  },
  media: [{ key: "hongdian-qin-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表具体颜色、比例或生产批次。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

const existingHongdianBrand = phase174HongdianM2Packs.find(
  (pack) => pack.expectedType === "brand",
);

if (!existingHongdianBrand) {
  throw new Error("Phase 187 HongDian brand prerequisite is missing.");
}

export const phase187HongdianQinPacks: CuratedEntityPack[] = [
  existingHongdianBrand,
  phase187HongdianQinPack,
];
