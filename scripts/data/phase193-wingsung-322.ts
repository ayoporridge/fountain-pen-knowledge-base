import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase186WingsungPacks } from "./phase186-wingsung-601";

const RETRIEVED = "2026-07-25";
export const PHASE193_WINGSUNG_BRAND_ID = "5WJw8padPmKF";
export const PHASE193_322_ID = "sahAk7o8xVkj";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, independenceGroup: `${input.key}-group`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase193", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase193", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不证明颜色、比例、容量、尖材、材料成分或品牌标志。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}

const S = {
  review: live({ key: "phase193-wingsung-322-review", title: "Fountain Pen Network：Informal Review—Wing Sung 322", url: "https://www.fountainpennetwork.com/forum/topic/260870-informal-review-wing-sung-322/", registryName: "Fountain Pen Network participants", sourceType: "forum", tier: "professional_secondary", summary: "手写评测和后续藏家帖记录 322 的 NOS 语境、硬涩尖、老库存与多种 finish；属于单支和小批量样本。", locator: "2014 handwritten review and 2018 NOS sample: finish variation, nib stiffness and historical circulation" }),
  fpnHistory: live({ key: "phase193-wingsung-322-fpn-history", title: "Fountain Pen Network：Wingsung 322", url: "https://www.fountainpennetwork.com/forum/topic/204832-wingsung-322/", registryName: "Fountain Pen Network participants", sourceType: "forum", tier: "professional_secondary", summary: "2011 讨论围绕红、绿、棕、橙杆身、celluloid 称呼和填充系统；藏家明确区分塑料外观与真正赛璐珞。", locator: "2011 material, color and filling-system discussion; plastic versus celluloid boundary" }),
  retailer: live({ key: "phase193-wingsung-322-retailer", title: "Fountain Pen INDIA：WingSung 322 Fountain Pen", url: "https://www.fountainpenindia.com/product-page/wingsung-322-fountain-pen", registryName: "Fountain Pen INDIA", sourceType: "retailer", tier: "retailer", summary: "零售页记录 emerald 色杆、金色电镀锥形 Fine 尖、银色金属帽，并把上墨字段写成 Aeromatic；属于销售批次描述。", locator: "product description and inking-system field: emerald body, conical Fine nib, silver cap, Aeromatic; out-of-stock listing" }),
  penbbs: live({ key: "phase193-wingsung-322-penbbs", title: "PenBBS 国产笔讨论：幸福永生—重拾零星的记忆", url: "https://www.penbbs.com/forum.php?mod=viewthread&tid=33898", registryName: "PenBBS forum participants", sourceType: "forum", tier: "professional_secondary", summary: "老国产笔讨论把 322 与 840、841、842 放入永生中包头组，并提到全钢、半钢和多种装饰；用于历史谱系核对。", locator: "historic Yongsheng medium hooded-nib group and finish list" }),
  frank: live({ key: "phase193-wingsung-322-frank", title: "Frank Underwater：The New Wing Sung(s), Explained", url: "https://frankunderwater.com/2017/09/14/the-new-wing-sungs-explained/comment-page-1/", registryName: "Frank Underwater", sourceType: "blog", tier: "professional_secondary", summary: "品牌史文章说明 WingSung 与 Hero 的历史、库存和授权生产存在公开争议；不用于推断 322 的具体工厂。", locator: "brand history and licensing boundary; no 322-specific factory inference" }),
  svg: diagram("phase193-wingsung-322-svg", "永生 WingSung 322 珍珠杆与锥形尖示意", "/images/library/site-original/phase193/wingsung/322.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.82, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const scope = "wingsung-322-model";
const pen: CuratedEntityPack = {
  key: "phase193-wingsung-322",
  entityId: PHASE193_322_ID,
  expectedType: "pen",
  expectedSlug: "永生-wingsung-322",
  canonicalName: "永生 WingSung 322",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wingsung-322-phase193.md",
  storyTitle: "永生 WingSung 322：珍珠塑料杆、中包头尖与老库存辨识",
  primarySourceKey: S.review.key,
  depthTier: "A",
  aliases: [{ alias: "Wing Sung 322", language: "en", sourceKey: S.review.key }, { alias: "Wingsung 322", language: "en", sourceKey: S.fpnHistory.key }, { alias: "Yongsheng 322", language: "en", sourceKey: S.penbbs.key }, { alias: "永生 322", language: "zh", sourceKey: S.penbbs.key }],
  sources: [S.review, S.fpnHistory, S.retailer, S.penbbs, S.frank, S.svg],
  scopes: [{ key: scope, scopeKey: "wingsung-322-identity-material-filler-and-care", productionState: "historical", editionScope: "公开资料中的老款 WingSung 322、珍珠色塑料／仿赛璐珞外观、锥形尖、挤压式上墨标签和老库存维护边界" }],
  claims: [
    claim("wingsung-322-identity", "model_identity", "WingSung 322 是永生资料中的独立老款中包头型号；编号、尖部、帽盖、笔杆刻字与填充接口需共同确认，不能只凭珍珠色外观命名。", S.review.key, scope, "322 identity and NOS sample"),
    claim("wingsung-322-brand-context", "brand_boundary", "Hero 官方历史页只用于确认 WingSung 所在的中国钢笔品牌语境；库存、授权和供应商争议不能反推 322 的具体生产厂。", "phase186-hero-official-story", scope, "official brand context; no model-spec inference"),
    claim("wingsung-322-lineage", "historical_lineage", "PenBBS 老资料把 322 与 840、841、842 列入永生中包头组，FPN 与零售资料则提供颜色、尖和填充标签；它们共同支持历史谱系，不构成现行官方规格表。", S.penbbs.key, scope, "historic medium hooded-nib group and independent model observations"),
    claim("wingsung-322-material", "material_boundary", "资料对 celluloid 说法不一致；藏家观察到没有典型赛璐珞气味和层次，零售页使用 Celluloid 销售称呼，因此正文保留珍珠塑料／仿赛璐珞外观而不作成分认证。", S.fpnHistory.key, scope, "celluloid wording versus plastic sample observations"),
    claim("wingsung-322-nib", "nib_boundary", "零售样本写金色电镀锥形 Fine 尖，NOS 藏家样本也有硬、涩或其它尖号差异；实际线宽和调校按单支确认。", S.retailer.key, scope, "conical Fine listing and NOS nib variation"),
    claim("wingsung-322-filler", "filling_system_boundary", "零售页把一批 322 标作 classic suction bladder／Aeromatic；FPN 讨论也提出填充系统疑问，不能把销售标签升级成所有年份的统一接口。", S.retailer.key, scope, "Aeromatic field and filling-system discussion"),
    claim("wingsung-322-care", "maintenance_guidance", "老库存应先用清水缓慢吸排，保护珍珠塑料、镀层和气囊；裂纹、漏气或尖片歪斜时交给熟悉老国产笔的维修者。", S.fpnHistory.key, scope, "conservative cleaning and material boundary"),
    claim("wingsung-322-selection", "selection_guidance", "选购时核对 322 刻字、帽盖、尖、填充件和退换条件；价格、celluloid 宣传和未使用状态都不能替代实物检查。", S.review.key, scope, "NOS buying and specimen verification"),
  ],
  variants: [{ key: "wingsung-322-pearl-colors", name: "珍珠绿／红／棕／橙杆身样本", notes: "FPN 与零售资料出现多种颜色和珍珠颗粒效果；照片光线会改变观感，按单支记录。", sourceKey: S.fpnHistory.key, variantKind: "color" }, { key: "wingsung-322-fine-conical", name: "金色电镀锥形 Fine 尖样本", notes: "零售页面的单批描述；库存尖号、线宽和调校可能不同。", sourceKey: S.retailer.key, variantKind: "nib" }, { key: "wingsung-322-aeromatic", name: "挤压式／Aeromatic 标签样本", notes: "零售页的填充字段与 FPN 讨论中的疑问需分开保存；接口以实物确认。", sourceKey: S.retailer.key, variantKind: "variant" }],
  spec: {
    brandEntityId: PHASE193_WINGSUNG_BRAND_ID,
    values: { series_name: "WingSung 322", origin_country: "中国；老永生／WingSung 历史与市场资料，具体生产主体按刻字、包装和批次核对", nib: "公开零售样本写金色电镀锥形 Fine 尖；老库存也有硬、涩或其它尖号样本，实际线宽和调校按单支确认", fill_system: "零售页标作 classic suction bladder／Aeromatic，FPN 讨论也提到填充系统疑问；接口、气囊和固定件按实物确认", material: "珍珠绿色、红色、棕色或橙色塑料／仿赛璐珞外观；资料对 celluloid 说法不一致，未经检测不作材料认证", dimensions: "未找到统一厂规尺寸；公开资料主要提供颜色、尖和填充描述，二手实物应自行测量", weight: "未找到可交叉核对的统一公开重量；金属帽、残墨和修复件会影响单支测量", status: "历史型号；公开证据集中于老库存、藏家样本和零售存货，现行生产状态未见统一官方公告" },
    evidence: [ev("wingsung-322", "brand_entity_id", "phase186-hero-official-story", scope, "brand context"), ev("wingsung-322", "series_name", S.review.key, scope, "322 identity and title"), ev("wingsung-322", "origin_country", S.frank.key, scope, "Chinese brand and licensing context"), ev("wingsung-322", "nib", S.retailer.key, scope, "conical Fine nib listing"), ev("wingsung-322", "fill_system", S.retailer.key, scope, "Aeromatic field with specimen boundary"), ev("wingsung-322", "material", S.fpnHistory.key, scope, "plastic versus celluloid discussion"), ev("wingsung-322", "dimensions", S.review.key, scope, "no factory measurement in review"), ev("wingsung-322", "weight", S.review.key, scope, "no cross-source public weight"), ev("wingsung-322", "status", S.review.key, scope, "NOS and historic circulation")],
  },
  media: [{ key: "wingsung-322-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表具体颜色、比例、材料成分或生产批次。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

const existingBrand = phase186WingsungPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE193_WINGSUNG_BRAND_ID);
if (!existingBrand) throw new Error("Phase 193 requires the existing curated WingSung brand pack.");
const brandOfficialSource = existingBrand.sources.find((source) => source.sourceType === "official");
if (!brandOfficialSource) throw new Error("Phase 193 requires the existing WingSung official history source.");
pen.sources = [...pen.sources, brandOfficialSource];

export const phase193Wingsung322Packs: CuratedEntityPack[] = [existingBrand, pen];
