import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase186WingsungPacks } from "./phase186-wingsung-601";

const RETRIEVED = "2026-07-25";
export const PHASE192_WINGSUNG_BRAND_ID = "5WJw8padPmKF";
export const PHASE192_840_ID = "GQPZwNqA_iVT";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, independenceGroup: `${input.key}-group`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase192", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase192", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不证明颜色、比例、尖材、填充方式或品牌标志。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}

const S = {
  fpn: live({ key: "phase192-wingsung-840-fpn", title: "Fountain Pen Network：Quick Review Of Wing Sung 840", url: "https://www.fountainpennetwork.com/forum/topic/340261-quick-review-of-wing-sung-840/", registryName: "Fountain Pen Network participants", sourceType: "forum", tier: "professional_secondary", summary: "长期藏家评测记录 840 的 1990 年代语境、红到酒红杆、金色帽、较小尖、缺少 233 橙色窗、F/XF/M 差异和过度按压风险。", locator: "840 review: identity, red/maroon body, gold cap, nib ring, warning-window distinction, nib variation and pressure damage" }),
  fpnVariant: live({ key: "phase192-wingsung-840-fpn-variant", title: "Fountain Pen Network：Wing Sung 840 New Design—With Italic Cursive", url: "https://www.fountainpennetwork.com/forum/topic/215937-wing-sung-840-new-design-with-italic-cursive/", registryName: "FP Writing / Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", summary: "2012 年实拍讨论记录红漆杆、镀金帽和 italic cursive 变体；属于公开样本，不证明所有 840 都有该尖。", locator: "new-design sample: red lacquer, gold-plated cap and italic cursive nib" }),
  penbbs: live({ key: "phase192-wingsung-840-penbbs", title: "PenBBS 国产笔讨论：幸福永生—重拾零星的记忆", url: "https://www.penbbs.com/forum.php?mod=viewthread&tid=33898", registryName: "PenBBS forum participants", sourceType: "forum", tier: "professional_secondary", summary: "老国产笔讨论把 840 与 322、841、842 列入永生中包头型号组，并区分全钢、半钢与不同装饰；用于历史谱系交叉核对。", locator: "historic Yongsheng model list: 322, 840, 841, 842 in medium hooded-nib group" }),
  archive: live({ key: "phase192-wingsung-840-archive", title: "Hero Pens archive：Wing Sung 840", url: "https://www.oocities.org/heropens/others_wing_sung.htm", registryName: "Hero Pens archive", sourceType: "blog", tier: "contemporary_archive", summary: "旧网页目录以 order number 记录 840 的红漆杆、金色帽和 Triumph style nib；是档案化商品描述，不等于制造商现行目录。", locator: "Wing Sung 840 catalogue entry: red lacquer barrel, gold plated cap and Triumph style nib" }),
  frank: live({ key: "phase192-wingsung-840-frank", title: "Frank Underwater：The New Wing Sung(s), Explained", url: "https://frankunderwater.com/2017/09/14/the-new-wing-sungs-explained/comment-page-1/", registryName: "Frank Underwater", sourceType: "blog", tier: "professional_secondary", summary: "品牌史文章解释 WingSung 名称、Hero 关系与不同年代授权／库存的公开争议；不用于推导 840 的具体生产批次。", locator: "brand history and licensing boundary; no 840-specific factory inference" }),
  svg: diagram("phase192-wingsung-840-svg", "永生 WingSung 840 红漆杆与金色帽示意", "/images/library/site-original/phase192/wingsung/840.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.82, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const scope = "wingsung-840-model";
const pen: CuratedEntityPack = {
  key: "phase192-wingsung-840",
  entityId: PHASE192_840_ID,
  expectedType: "pen",
  expectedSlug: "永生-wingsung-840",
  canonicalName: "永生 WingSung 840",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wingsung-840-phase192.md",
  storyTitle: "永生 WingSung 840：老式 Triumph 风格钢笔的识别与使用边界",
  primarySourceKey: S.fpn.key,
  depthTier: "A",
  aliases: [{ alias: "Wing Sung 840", language: "en", sourceKey: S.fpn.key }, { alias: "WingSung 840", language: "en", sourceKey: S.archive.key }, { alias: "Yongsheng 840", language: "en", sourceKey: S.penbbs.key }, { alias: "永生 840", language: "zh", sourceKey: S.penbbs.key }],
  sources: [S.fpn, S.fpnVariant, S.penbbs, S.archive, S.frank, S.svg],
  scopes: [{ key: scope, scopeKey: "wingsung-840-identity-nib-and-care", productionState: "historical", editionScope: "公开资料中的老款 WingSung 840、红／红棕漆杆与金色帽样本、Triumph 风格尖和二手维护边界" }],
  claims: [
    claim("wingsung-840-identity", "model_identity", "WingSung 840 是永生资料中的独立老款中包头型号；编号、帽盖、笔尖与笔杆刻字需共同确认，不能只凭红杆金帽外形命名。", S.fpn.key, scope, "840 model identity and 233 comparison"),
    claim("wingsung-840-brand-context", "brand_boundary", "Hero 官方历史页只用于确认 WingSung 所在的中国钢笔品牌语境；不同年代的 Hero、WingSung、库存和授权关系不能反推 840 的具体生产厂。", "phase186-hero-official-story", scope, "official brand context; no model-spec inference"),
    claim("wingsung-840-history", "historical_lineage", "PenBBS 老资料把 840 与 322、841、842 列入永生中包头组，独立目录则以 red lacquer barrel、gold plated cap 与 Triumph style nib 记录 840；两者共同支持型号谱系，但不是现行官方规格表。", S.penbbs.key, scope, "historic medium hooded-nib family and archived catalogue description"),
    claim("wingsung-840-nib", "nib_boundary", "独立样本出现接近 XF、F、M 与 italic cursive 的差异，尖材、调校和线宽不能从卖家标注或相似外形推导。", S.fpn.key, scope, "sample nib variation and italic-cursive variant"),
    claim("wingsung-840-window", "ink-window_boundary", "与 233 的比较资料指出 840 没有 233 的橙色观墨窗；任何透明窗口、接近空墨的警示效果都要按实物验证。", S.fpn.key, scope, "840 versus 233 window distinction"),
    claim("wingsung-840-care", "maintenance_guidance", "小型 Triumph 风格尖不应以大力按压制造线宽变化；漆面、镀层、尖部装饰环和未知填充接口都应采用保守清洗与维修。", S.fpn.key, scope, "pressure damage and conservative care boundary"),
    claim("wingsung-840-selection", "selection_guidance", "选购时应核对刻字、帽盖、夹子、尖部和是否能用清水吸排；公开资料未给统一填充系统、尺寸或重量，二手实物需单独测量。", S.archive.key, scope, "archived product description and missing factory specification boundary"),
  ],
  variants: [{ key: "wingsung-840-red-lacquer", name: "红色／红棕色漆杆样本", notes: "公开藏家与档案资料反复出现红到酒红、红棕色；漆色和保存状态按单支确认。", sourceKey: S.fpn.key, variantKind: "color" }, { key: "wingsung-840-f-xf-m", name: "F／近 XF／M 市场样本", notes: "三支独立样本的线宽并不一致；卖家标注不等于出厂统一规格。", sourceKey: S.fpn.key, variantKind: "nib" }, { key: "wingsung-840-italic-cursive", name: "Italic cursive 变体", notes: "2012 年实拍讨论记录过 italic cursive 尖；是否属于同一批次或改装尖需看实物。", sourceKey: S.fpnVariant.key, variantKind: "nib" }],
  spec: {
    brandEntityId: PHASE192_WINGSUNG_BRAND_ID,
    values: { series_name: "WingSung 840", origin_country: "中国；老永生／WingSung 历史与市场资料，具体生产主体按刻字、包装和批次核对", nib: "Triumph 风格小型曲面／包尖样式；公开样本出现 F、近 XF、M 与 italic cursive 差异，材质和调校按单支确认", fill_system: "公开型号资料未给出统一、可复核的填充系统或墨囊兼容表；收到实物后以接口和清水测试确认", material: "公开资料常写红色或红棕色漆杆／金属质感杆身、金色电镀帽；漆面与镀层按保存状态核验", dimensions: "未找到统一厂规尺寸；独立评测仅确认轮廓比 WingSung 233 略短、略细，二手实物应自行测量", weight: "未找到可交叉核对的统一公开重量；帽盖、金属件与残墨会影响单支测量", status: "历史型号；公开资料集中于老库存、藏家与二手流通，现行生产状态未见统一官方公告" },
    evidence: [ev("wingsung-840", "brand_entity_id", "phase186-hero-official-story", scope, "brand context"), ev("wingsung-840", "series_name", S.fpn.key, scope, "840 identity and title"), ev("wingsung-840", "origin_country", S.frank.key, scope, "Chinese brand and licensing context"), ev("wingsung-840", "nib", S.fpn.key, scope, "Triumph-like nib and sample widths"), ev("wingsung-840", "fill_system", S.archive.key, scope, "no unified filler in archived entry; verify specimen"), ev("wingsung-840", "material", S.archive.key, scope, "red lacquer barrel and gold plated cap"), ev("wingsung-840", "dimensions", S.fpn.key, scope, "shorter and slimmer than 233; no factory measurement"), ev("wingsung-840", "weight", S.fpn.key, scope, "no cross-source public weight"), ev("wingsung-840", "status", S.archive.key, scope, "historic catalogue and secondary circulation")],
  },
  media: [{ key: "wingsung-840-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表具体颜色、比例、尖材或生产批次。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

const existingBrand = phase186WingsungPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE192_WINGSUNG_BRAND_ID);
if (!existingBrand) throw new Error("Phase 192 requires the existing curated WingSung brand pack.");
const brandOfficialSource = existingBrand.sources.find((source) => source.sourceType === "official");
if (!brandOfficialSource) throw new Error("Phase 192 requires the existing WingSung official history source.");
pen.sources = [...pen.sources, brandOfficialSource];

export const phase192Wingsung840Packs: CuratedEntityPack[] = [existingBrand, pen];
