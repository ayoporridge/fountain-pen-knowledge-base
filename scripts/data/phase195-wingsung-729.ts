import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase186WingsungPacks } from "./phase186-wingsung-601";

const RETRIEVED = "2026-07-25";
export const PHASE195_WINGSUNG_BRAND_ID = "5WJw8padPmKF";
export const PHASE195_729_ID = "lMq83WGl2qss";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, independenceGroup: `${input.key}-group`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase195", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase195", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不证明颜色、比例、容量、尖材、墨囊或品牌标志。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}

const S = {
  review: live({ key: "phase195-wingsung-729-review", title: "钢笔爱好者：空间利用的黑洞，永生728、729及类似结构两用笔评测", url: "https://www.nonopen.com/1627.html", registryName: "钢笔爱好者 / nonozone", sourceType: "blog", tier: "professional_secondary", summary: "中文实测记录 729 的两用结构、长度比较、旋转出尖、迷你墨囊、0.45–0.55 线宽范围、刻字和品控风险。", locator: "2018 review: 728/729 comparison, dual-ended mechanism, nib range, mini ink sac, marks and QC observations" }),
  index: live({ key: "phase195-wingsung-index", title: "钢笔爱好者：永生钢笔标签页", url: "https://www.nonopen.com/tag/%E6%B0%B8%E7%94%9F%E9%92%A2%E7%AC%94", registryName: "钢笔爱好者", sourceType: "blog", tier: "professional_secondary", summary: "站点索引确认 729 两用笔评测属于永生型号内容，并与 601、618、233 等文章分开。", locator: "tag archive and model-specific article navigation" }),
  penbbs: live({ key: "phase195-wingsung-729-penbbs", title: "PenBBS 国产笔讨论：幸福永生—重拾零星的记忆", url: "https://www.penbbs.com/forum.php?mod=viewthread&tid=33898", registryName: "PenBBS forum participants", sourceType: "forum", tier: "professional_secondary", summary: "历史讨论用于核对永生品牌与老型号谱系，不把其它型号的尖、尺寸或填充件回填到 729。", locator: "historic Yongsheng model family and brand context" }),
  frank: live({ key: "phase195-wingsung-729-frank", title: "Frank Underwater：The New Wing Sung(s), Explained", url: "https://frankunderwater.com/2017/09/14/the-new-wing-sungs-explained/comment-page-1/", registryName: "Frank Underwater", sourceType: "blog", tier: "professional_secondary", summary: "品牌史文章讨论 Hero、WingSung、库存和后来授权生产的公开争议；不用于推断 729 的具体工厂。", locator: "brand history and licensing boundary; no 729-specific factory inference" }),
  svg: diagram("phase195-wingsung-729-svg", "永生 WingSung 729 两用笔示意", "/images/library/site-original/phase195/wingsung/729.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.82, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const scope = "wingsung-729-model";
const pen: CuratedEntityPack = {
  key: "phase195-wingsung-729",
  entityId: PHASE195_729_ID,
  expectedType: "pen",
  expectedSlug: "永生-wingsung-729",
  canonicalName: "永生 WingSung 729",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wingsung-729-phase195.md",
  storyTitle: "永生 WingSung 729：一支两用笔的旋转机构、细尖与维修边界",
  primarySourceKey: S.review.key,
  depthTier: "A",
  aliases: [{ alias: "Wing Sung 729", language: "en", sourceKey: S.review.key }, { alias: "WingSung 729 dual-use pen", language: "en", sourceKey: S.review.key }, { alias: "Yongsheng 729", language: "en", sourceKey: S.penbbs.key }, { alias: "永生 729", language: "zh", sourceKey: S.review.key }],
  sources: [S.review, S.index, S.penbbs, S.frank, S.svg],
  scopes: [{ key: scope, scopeKey: "wingsung-729-dual-use-identity-and-care", productionState: "historical", editionScope: "公开中文实测中的老款 WingSung 729 两用笔、钢笔端小墨囊、旋转圆珠笔端、尖与老库存维护边界" }],
  claims: [
    claim("wingsung-729-identity", "model_identity", "WingSung 729 是一支把钢笔和旋转出尖圆珠笔装进同一笔身的两用型号；笔身刻字、两端机构和帽盖需共同确认。", S.review.key, scope, "dual-ended identity and 729 marks"),
    claim("wingsung-729-brand-context", "brand_boundary", "Hero 官方历史页只用于确认 WingSung 所在的中国钢笔品牌语境；老永生工厂、库存和授权争议不能反推 729 的具体生产主体。", "phase186-hero-official-story", scope, "official brand context; no model-spec inference"),
    claim("wingsung-729-mechanism", "filling_system_boundary", "钢笔端使用小型墨囊，圆珠端通过旋转环伸出或收回笔芯；两端独立工作，不能把 729 当作活塞或真空钢笔。", S.review.key, scope, "mini ink sac and rotating ballpoint mechanism"),
    claim("wingsung-729-nib", "nib_boundary", "729 与 728 的评测样本使用同款路线尖，实测书写范围约 0.45–0.55；个体品控、铱粒、纸张和墨水会改变线宽。", S.review.key, scope, "728/729 nib comparison and 0.45–0.55 sample range"),
    claim("wingsung-729-risk", "maintenance_guidance", "旋转件长期使用可能不同轴或产生裂痕，帽顶可能锈蚀，墨囊护套也可能做工粗糙；卡滞或漏墨时应停止加力。", S.review.key, scope, "plastic rotation parts, cap jewel, ink sac guard and QC"),
    claim("wingsung-729-selection", "selection_guidance", "购买时要检查两端、刻字、旋转出尖和收回、墨囊、圆珠笔芯与退换条件；729 比 728 更长的观察来自单篇实测。", S.review.key, scope, "selection checks and 728 length comparison"),
  ],
  variants: [{ key: "wingsung-729-fountain", name: "钢笔端小型墨囊", notes: "两用结构的钢笔端容量有限；接口、护套和密封按单支确认。", sourceKey: S.review.key, variantKind: "variant" }, { key: "wingsung-729-ballpoint", name: "旋转出尖圆珠笔端", notes: "左旋出尖、右旋收回的样本操作；笔芯长度与尾部形状需匹配。", sourceKey: S.review.key, variantKind: "variant" }, { key: "wingsung-729-nib-range", name: "约 0.45–0.55 书写范围样本", notes: "实测范围不是厂家统一尖号；纸张、墨水、压力和个体品控都会影响线宽。", sourceKey: S.review.key, variantKind: "nib" }],
  spec: {
    brandEntityId: PHASE195_WINGSUNG_BRAND_ID,
    values: { series_name: "WingSung 729", origin_country: "中国；永生／WingSung 老款资料与中文实测，具体生产主体按刻字、包装和批次核对", nib: "与 728 同款路线的细尖样本；中文实测范围约 0.45–0.55，纸张、墨水和单支品控会改变实际线宽", fill_system: "钢笔端小型墨囊；另一端为旋转出尖的圆珠笔芯，两种书写端独立工作，墨囊与笔芯规格按实物确认", material: "塑料笔身与旋转部件、金属帽和装饰件；表面、顶珠和帽盖状态按保存与批次核验", dimensions: "公开评测只确认 729 比 728 显得更长；未找到统一厂规尺寸，二手实物应自行测量", weight: "公开评测将 729 归为较轻的两用笔；未找到统一公开重量，笔芯、墨囊和金属件会影响单支测量", status: "历史流通型号；旧库存和二手资料集中出现，现行生产与配件供应状态按卖家和实物核对" },
    evidence: [ev("wingsung-729", "brand_entity_id", "phase186-hero-official-story", scope, "brand context"), ev("wingsung-729", "series_name", S.review.key, scope, "729 identity and model marks"), ev("wingsung-729", "origin_country", S.frank.key, scope, "Chinese brand and licensing context"), ev("wingsung-729", "nib", S.review.key, scope, "728/729 nib and line range"), ev("wingsung-729", "fill_system", S.review.key, scope, "mini ink sac and dual-use structure"), ev("wingsung-729", "material", S.review.key, scope, "plastic rotation components and metal cap"), ev("wingsung-729", "dimensions", S.review.key, scope, "729 longer than 728 sample"), ev("wingsung-729", "weight", S.review.key, scope, "lightweight sample description"), ev("wingsung-729", "status", S.review.key, scope, "historic circulation and old-stock boundary")],
  },
  media: [{ key: "wingsung-729-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表具体颜色、比例、尖材或生产批次。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

const existingBrand = phase186WingsungPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE195_WINGSUNG_BRAND_ID);
if (!existingBrand) throw new Error("Phase 195 requires the existing curated WingSung brand pack.");
const brandOfficialSource = existingBrand.sources.find((source) => source.sourceType === "official");
if (!brandOfficialSource) throw new Error("Phase 195 requires the existing WingSung official history source.");
pen.sources = [...pen.sources, brandOfficialSource];

export const phase195Wingsung729Packs: CuratedEntityPack[] = [existingBrand, pen];
