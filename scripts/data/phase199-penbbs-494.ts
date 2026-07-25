import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase158PenBbs456Packs, PHASE158_PENBBS_BRAND_ID } from "./phase158-penbbs-456";

const RETRIEVED = "2026-07-25";
export const PHASE199_PENBBS_BRAND_ID = PHASE158_PENBBS_BRAND_ID;
export const PHASE199_494_ID = "ndYHaLW2Ezp_";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, independenceGroup: `${input.key}-group`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase199", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase199", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不证明真实比例、颜色、刻字、材料配方、密封圈批次或库存。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}

const S = {
  fpnReview: live({ key: "phase199-penbbs-494-fpn-review", title: "Fountain Pen Network：PenBBS 494 — a 4$ piston filling pseudo-clone of the Pilot 78G?", url: "https://www.fountainpennetwork.com/forum/topic/348290-penbbs-494-a-4-piston-filling-pseudo-clone-of-the-pilot-78g/", registryName: "Fountain Pen Network participants", sourceType: "forum", tier: "professional_secondary", summary: "独立评测把 494 识别为低价小型 piston filler，记录三角握位、Pilot 风格钢尖、清理制造油后的书写、尾旋卡点、后插与 O-ring；只作样本证据。", locator: "2019 review: piston filler, triangular grip, nib, click at piston end, secure posting and O-ring" }),
  fpnChannel: live({ key: "phase199-penbbs-494-fpn-channel", title: "Fountain Pen Network：PenBBS 494 — a 78G style piston filler exclusive to Shanghai Jingdian", url: "https://www.fountainpennetwork.com/forum/topic/347779-penbbs-494-a-78g-style-piston-filler-exclusive-to-shanghai-jingdian/", registryName: "Fountain Pen Network participants", sourceType: "forum", tier: "professional_secondary", summary: "讨论标题提供上海 Jingdian 独家渠道的历史身份线索；页面不把该标题升级为制造商授权或所有批次的生产证明。", locator: "discussion title and channel identity context" }),
  redditNib: live({ key: "phase199-penbbs-494-reddit-nib", title: "Reddit：PenBBS 494 discussion", url: "https://www.reddit.com/r/fountainpens/comments/dv9wap", registryName: "Reddit r/fountainpens participants", sourceType: "reddit", tier: "community", summary: "使用者报告某些 494 尖面可能带 MARSHMALLOW Shanghai 刻字，亦记录偏干、反馈和三圈旋帽等个体体验；不外推全批次。", locator: "community observations: Marshmallow Shanghai marking, flow, feedback and cap turns" }),
  redditCompare: live({ key: "phase199-penbbs-494-reddit-compare", title: "Reddit：PenBBS 494 and Wing Sung 3008A comparison", url: "https://www.reddit.com/r/fountainpens/comments/15zhd9w", registryName: "Reddit r/fountainpens participants", sourceType: "reddit", tier: "community", summary: "对比讨论记录 494 的活塞尾旋、帽盖后插、密封和仿冒列表风险；比较仅用于识别结构边界，不是零件兼容证明。", locator: "comparison: piston knob, cap seal, secure posting and counterfeit listing warning" }),
  jim: live({ key: "phase199-penbbs-494-jim", title: "Jim P.：NPD — PenBBS 494 with an EF nib", url: "https://jimp.ink/2024/08/30/npd-penbbs-494-with-an-ef-nib", registryName: "Jim P.", sourceType: "blog", tier: "community", summary: "个人新笔记录提供 EF 版本的时间窗口和实物观察；尖幅、流量、树脂与刻字仍只绑定该支样本。", locator: "2024-08-30 EF sample entry" }),
  retailer: live({ key: "phase199-penbbs-494-retailer", title: "Desertcart：PenBBS 494 piston fountain pen", url: "https://www.desertcart.com.om/products/403109425-penbbs-494-piston-fountain-pen-extra-fine-nib-clear-transparent-demonstrator-pen-gift-box-set", registryName: "Desertcart", sourceType: "retailer", tier: "retailer", summary: "零售标题提供透明 demonstrator、EF 与 piston fountain pen 语境；零售页不是制造商规格书，尺寸、重量和库存不作统一规格。", locator: "listing title: transparent demonstrator, EF and piston filling" }),
  svg: diagram("phase199-penbbs-494-svg", "PenBBS 494 透明活塞结构示意", "/images/library/site-original/phase199/penbbs/494.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.82, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const scope = "penbbs-494-model";
const OFFICIAL_SOURCE_KEY = "phase72-penbbs-official-store";
const pen: CuratedEntityPack = {
  key: "phase199-penbbs-494",
  entityId: PHASE199_494_ID,
  expectedType: "pen",
  expectedSlug: "坛笔-penbbs-494",
  canonicalName: "坛笔 PenBBS 494",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/penbbs-494-phase199.md",
  storyTitle: "坛笔 PenBBS 494：小型活塞、刻字线索与选购边界",
  primarySourceKey: S.fpnReview.key,
  depthTier: "A",
  aliases: [{ alias: "PenBBS 494", language: "en", sourceKey: S.fpnReview.key }, { alias: "坛笔 494", language: "zh", sourceKey: S.fpnReview.key }, { alias: "MARSHMALLOW Shanghai 494", language: "en", sourceKey: S.redditNib.key }, { alias: "Shanghai Jingdian 494", language: "en", sourceKey: S.fpnChannel.key }],
  sources: [S.fpnReview, S.fpnChannel, S.redditNib, S.redditCompare, S.jim, S.retailer, S.svg],
  scopes: [{ key: scope, scopeKey: "penbbs-494-small-piston-model", productionState: "historical", editionScope: "PenBBS 494 的公开评测、上海渠道线索和透明／半透明活塞样本；刻字、尖幅、密封圈、包装与真伪按单支核对。" }],
  claims: [
    claim("penbbs-494-brand-context", "brand_relationship", "PenBBS 的自营销售窗口提供品牌与型号资料语境；494 页面仍需以自身评测、刻字和结构证据核对，不能用 456 或 308 的规格代替。", OFFICIAL_SOURCE_KEY, scope, "PenBBS official sales window and sibling-model boundary"),
    claim("penbbs-494-identity", "model_identity", "PenBBS 494 是公开资料中独立出现的小型透明树脂活塞型号；PenBBS、Marshmallow Shanghai 和上海 Jingdian 是销售与刻字线索，不把它们未经证明地合并为制造商或授权品牌。", S.fpnReview.key, scope, "494 model title and channel comparison"),
    claim("penbbs-494-filling", "filling_system", "494 使用内置小型活塞旋钮吸墨，不是墨囊／转换器或真空推杆结构；尾旋末端的卡点、行程和实际容量按具体样本确认。", S.fpnReview.key, scope, "piston filling and click at the end of the knob"),
    claim("penbbs-494-nib", "nib_boundary", "公开样本多见 Pilot 风格钢尖或 EF，部分尖面可能刻 MARSHMALLOW Shanghai；书写湿度、反馈、线宽和是否需要调校存在个体差异。", S.redditNib.key, scope, "nib marking and individual writing reports"),
    claim("penbbs-494-body", "material_boundary", "透明或半透明 demonstrator 样本采用注塑树脂语境，细小分型线可能可见；没有统一可靠资料证明材料配方、耐冲击性或所有批次完全相同。", S.fpnReview.key, scope, "plastic fit/finish and injection seam sample"),
    claim("penbbs-494-cap", "cap_seal", "样本可多圈旋帽、稳固后插，帽口可能带 O-ring 或类似密封；凝露、干燥和旋帽圈数按版本与使用环境检查。", S.fpnReview.key, scope, "secure posting, O-ring and cap observations"),
    claim("penbbs-494-channel", "identity_boundary", "部分历史讨论把 494 与上海 Jingdian 独家渠道和 Marshmallow 刻字联系起来；该证据不能推出统一工厂、授权 Pilot 关系或所有商品列表均为真品。", S.fpnChannel.key, scope, "Shanghai Jingdian channel title and counterfeit boundary"),
    claim("penbbs-494-care", "maintenance_guidance", "清洗时以常温清水反复吸排活塞，先清掉制造油和残墨；活塞、O-ring、帽口或尖端异常时不要强拧、热处理或无资料拆总成。", S.fpnReview.key, scope, "cleaning oil before writing and piston/O-ring care boundary"),
    claim("penbbs-494-selection", "selection_guidance", "购买前核对尖面刻字、活塞动作、透明笔杆、帽口密封、后插稳定性、包装与卖家退换条件；把通用照片、仿冒标题和不一致刻字视为风险。", S.redditCompare.key, scope, "counterfeit warning and physical inspection checklist"),
  ],
  variants: [{ key: "penbbs-494-transparent", name: "透明／半透明 demonstrator", notes: "公开零售和评测所见外观；颜色、透明度、分型线和树脂批次按实物核对。", sourceKey: S.retailer.key, variantKind: "color" }, { key: "penbbs-494-ef", name: "EF 钢尖样本", notes: "个人记录与零售标题中的 EF 版本；尖幅、流量和调校不外推到所有 494。", sourceKey: S.jim.key, variantKind: "nib" }, { key: "penbbs-494-marshmallow-marking", name: "MARSHMALLOW Shanghai 刻字样本", notes: "社区实物线索，不足以证明所有批次或生产者身份。", sourceKey: S.redditNib.key, variantKind: "edition_group" }],
  spec: {
    brandEntityId: PHASE199_PENBBS_BRAND_ID,
    values: { series_name: "PenBBS 494", release_year: "2019 前后已有公开评测；确切首发年待品牌档案核实", origin_country: "中国；公开资料涉及 PenBBS、Marshmallow Shanghai 与上海渠道，具体生产主体不作超证据推断", nib: "钢尖；Pilot 风格外形、EF 等配置见具体样本，刻字与线宽按单支核对", fill_system: "内置小型活塞旋钮上墨；不是墨囊／转换器或真空推杆", material: "透明／半透明注塑树脂样本；材料配方、颜色和分型线按批次核对", dimensions: "未找到统一可靠厂规尺寸；小型 78G 风格外形只作比较语境", weight: "未找到统一可靠厂规克重；树脂、墨量、帽盖和版本会影响单支测量", status: "历史／特殊渠道流通型号；当前库存、真伪与包装按卖家和实物复核" },
    evidence: [ev("penbbs-494", "brand_entity_id", OFFICIAL_SOURCE_KEY, scope, "PenBBS official sales window"), ev("penbbs-494", "series_name", S.fpnReview.key, scope, "494 model title"), ev("penbbs-494", "release_year", S.fpnReview.key, scope, "2019 review window"), ev("penbbs-494", "origin_country", S.fpnChannel.key, scope, "Shanghai channel context"), ev("penbbs-494", "nib", S.redditNib.key, scope, "nib marking and EF sample"), ev("penbbs-494", "fill_system", S.fpnReview.key, scope, "piston filling mechanism"), ev("penbbs-494", "material", S.fpnReview.key, scope, "transparent plastic sample"), ev("penbbs-494", "dimensions", S.fpnReview.key, scope, "small 78G-style comparison; no universal dimensions"), ev("penbbs-494", "weight", S.fpnReview.key, scope, "no universal weight asserted"), ev("penbbs-494", "status", S.retailer.key, scope, "retail listing availability boundary")],
  },
  media: [{ key: "penbbs-494-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表真实比例、颜色、刻字、材料配方、密封圈批次或库存。", sourceUrl: S.svg.url, usageStatus: "primary" }],
  timeline: [{ key: "penbbs-494-review-window", title: "PenBBS 494 的公开评测窗口", eventType: "design_milestone", startDate: "2019", circa: false, description: "独立讨论在 2019 年前后记录 494 的小型活塞、Pilot 风格外形与上海渠道线索；发表时间不等同确切首发年。", sourceKey: S.fpnReview.key }],
};

const existingBrand = phase158PenBbs456Packs.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE199_PENBBS_BRAND_ID);
if (!existingBrand) throw new Error("Phase 199 requires the existing curated PenBBS brand pack.");
pen.sources = [...pen.sources, ...existingBrand.sources.filter((source) => source.sourceType === "official")];
export const phase199PenBbs494Packs: CuratedEntityPack[] = [existingBrand, pen];
