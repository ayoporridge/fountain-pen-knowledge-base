import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase186WingsungPacks } from "./phase186-wingsung-601";

const RETRIEVED = "2026-07-25";
export const PHASE194_WINGSUNG_BRAND_ID = "5WJw8padPmKF";
export const PHASE194_601A_ID = "JyzeY3oQZxT4";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, independenceGroup: `${input.key}-group`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase194", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase194", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不证明颜色、比例、容量、尖材、材质或品牌标志。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}

const S = {
  comfortable: live({ key: "phase194-wingsung-601a-comfortable", title: "Comfortable Shoes Studio：Review: Wing Sung 601A", url: "https://comfortableshoesstudio.com/2019/01/review-wing-sung-601a/", registryName: "Comfortable Shoes Studio", sourceType: "blog", tier: "professional_secondary", summary: "独立评测记录 601A 的树脂杆、金属摩擦帽、窗口、真空动作、Triumph 尖和过度按压后尖片失稳。", locator: "601A body, cap, filler, ink window, nib failure and writing observations" }),
  leftHook: live({ key: "phase194-wingsung-601a-lefthook", title: "Left Hook Pens：The Wing Sung 601a", url: "https://lefthookpens.com/2024/07/26/the-wing-sung-601a/", registryName: "Left Hook Pens", sourceType: "blog", tier: "professional_secondary", summary: "评测补充盲帽、弹簧加载活塞、窗口、替换摩擦件、锥形尖、螺纹损坏和清洗后的渗墨。", locator: "blind cap, spring-loaded piston, window, conical nib and thread repair caution" }),
  rupert: live({ key: "phase194-wingsung-601a-rupert", title: "Rupert Arzeian：Bath time for the Wing Sung 601A", url: "https://rupertarzeian.com/2019/08/11/bath-time-for-the-wing-sung-601a-fountain-pen/", registryName: "Rupert Arzeian", sourceType: "blog", tier: "professional_secondary", summary: "维修与清洗记录确认 601A 使用较大的管状尖单元和类似 Sheaffer Triumph 的结构，并提醒与 601 分开。", locator: "601A tubular nib unit, Triumph-like construction and cleaning context" }),
  fpn: live({ key: "phase194-wingsung-601a-fpn", title: "Fountain Pen Network：Open Nib Wing Sung 601A with 18K Gold Nib", url: "https://www.fountainpennetwork.com/forum/topic/377100-open-nib-wing-sung-601a-with-18k-gold-nib/", registryName: "Fountain Pen Network participants", sourceType: "forum", tier: "professional_secondary", summary: "社区讨论记录开放式 601A 的 18K 金尖、贵金属帽盖样本及帽内夹环刮杆风险；属于稀有市场样本。", locator: "open-nib 601A, 18K gold and sterling-cap sample; clutch-ring abrasion warning" }),
  retailer: live({ key: "phase194-wingsung-601a-retailer", title: "Ubuy：Wing Sung 601A Steel Cap Vacumatic Fountain Pen", url: "https://www.ubuy.com.gr/el/product/2AG57XVM-czxwyst-wing-sung-601a-steel-cap-vacumatic-fountain-pen-blue-green-with-ink-window", registryName: "Ubuy product listing", sourceType: "retailer", tier: "retailer", summary: "零售资料给出树脂杆、钢帽、F 尖、139 mm、12 mm、18.7 g 等商品字段；是销售批次数据，不代表全系厂规。", locator: "product fields: resin body, steel cap, F nib, 139 mm, 12 mm, 18.7 g and vacumatic-type filler" }),
  svg: diagram("phase194-wingsung-601a-svg", "永生 WingSung 601A 墨窗与开放式尖示意", "/images/library/site-original/phase194/wingsung/601a.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.83, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const scope = "wingsung-601a-model";
const pen: CuratedEntityPack = {
  key: "phase194-wingsung-601a",
  entityId: PHASE194_601A_ID,
  expectedType: "pen",
  expectedSlug: "永生-wingsung-601a",
  canonicalName: "永生 WingSung 601A",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wingsung-601a-phase194.md",
  storyTitle: "永生 WingSung 601A：真空抽拉、开放式 Triumph 尖与 601 家族辨识",
  primarySourceKey: S.comfortable.key,
  depthTier: "A",
  aliases: [{ alias: "Wing Sung 601A", language: "en", sourceKey: S.comfortable.key }, { alias: "WingSung 601A", language: "en", sourceKey: S.leftHook.key }, { alias: "Yongsheng 601A", language: "en", sourceKey: S.fpn.key }, { alias: "永生 601A", language: "zh", sourceKey: S.comfortable.key }],
  sources: [S.comfortable, S.leftHook, S.rupert, S.fpn, S.retailer, S.svg],
  scopes: [{ key: scope, scopeKey: "wingsung-601a-identity-filler-nib-and-care", productionState: "current", editionScope: "现代渠道流通的 WingSung 601A、开放式／Triumph 风格尖、墨窗、真空抽拉机构与不同帽盖／金尖市场样本" }],
  claims: [
    claim("wingsung-601a-identity", "model_identity", "WingSung 601A 是 601 家族中改用开放式或 Triumph 风格尖的独立型号；它不是 601 的颜色版本，尖部、握位和维护边界需分开确认。", S.comfortable.key, scope, "601A versus 601 family identity"),
    claim("wingsung-601a-brand-context", "brand_boundary", "Hero 官方历史页只用于确认 WingSung 所在的中国钢笔品牌语境；601A 的具体生产批次、授权与贵金属版本不能由品牌史反推。", "phase186-hero-official-story", scope, "official brand context; no model-spec inference"),
    claim("wingsung-601a-filler", "filling_system", "公开评测使用 vacumatic、vacumatic-type 或弹簧加载活塞等术语描述尾端抽拉；实际阀位、行程、密封和容量按单支清水测试。", S.leftHook.key, scope, "blind cap and spring-loaded filler terminology"),
    claim("wingsung-601a-nib", "nib_boundary", "开放式或 Triumph 风格尖是 601A 的主要识别点；钢制 F/M、14K／18K 及其它市场样本并存，尖片不应靠按压制造线宽。", S.comfortable.key, scope, "open/conical nib, gold sample and pressure damage"),
    claim("wingsung-601a-body", "material_boundary", "独立样本常见树脂杆、墨窗和金属摩擦帽；颜色、帽材和窗口条纹随版本变化，销售字段不等于全系厂规。", S.retailer.key, scope, "resin body, steel cap, ink window and market fields"),
    claim("wingsung-601a-risk", "maintenance_guidance", "尖片过度受力、帽内夹环刮杆、尖座小螺纹打滑和清洗后渗墨都在独立记录中出现；异常时停手并找维修者。", S.leftHook.key, scope, "nib, clutch ring, threads and seepage risks"),
    claim("wingsung-601a-selection", "selection_guidance", "购买时要确认 601A 与 601 的尖部差异、尾端保压、窗口裂纹、帽内夹环和退换条件；139 mm、12 mm、18.7 g 只是单一销售批次字段。", S.retailer.key, scope, "model selection and single-listing measurements"),
  ],
  variants: [{ key: "wingsung-601a-steel-open", name: "钢制开放式／Triumph 风格尖", notes: "独立评测的常见路线；尖片偏硬，线宽和调校按单支确认。", sourceKey: S.comfortable.key, variantKind: "nib" }, { key: "wingsung-601a-gold", name: "14K／18K 金尖与贵金属帽样本", notes: "社区记录的稀有市场样本，不能回填到普通钢尖 601A。", sourceKey: S.fpn.key, variantKind: "edition_group" }, { key: "wingsung-601a-colors", name: "黑、深青、蓝绿色杆身样本", notes: "商品色名与实物观感可能不同，按照片、刻字和批次记录。", sourceKey: S.comfortable.key, variantKind: "color" }],
  spec: {
    brandEntityId: PHASE194_WINGSUNG_BRAND_ID,
    values: { series_name: "WingSung 601A", origin_country: "中国；WingSung 市场与独立评测资料，具体生产主体和金尖版本按刻字、包装与批次核对", nib: "开放式或 Triumph 风格锥形尖；钢制样本常见 F/M，另有少量 14K／18K 市场样本，实际线宽和调校按单支确认", fill_system: "尾端盲帽配真空／vacumatic-type 弹簧抽拉机构；资料对术语和阀位描述有差异，密封、行程和容量按实物测试", material: "树脂或塑料杆身、条纹墨窗、金属摩擦帽；银色、拉丝钢、贵金属帽盖等 finish 按版本", dimensions: "部分销售资料给约 139 mm 长、约 12 mm 直径；单支测量，帽盖和版本会改变数值", weight: "部分销售资料给约 18.7 g 净重；空笔、帽盖和金尖版本会改变实际重量", status: "现代渠道流通型号；601A 与 601 暗尖版本并存，具体批次、库存和售后按卖家与实物核对" },
    evidence: [ev("wingsung-601a", "brand_entity_id", "phase186-hero-official-story", scope, "brand context"), ev("wingsung-601a", "series_name", S.comfortable.key, scope, "601A identity and title"), ev("wingsung-601a", "origin_country", S.leftHook.key, scope, "Chinese model context"), ev("wingsung-601a", "nib", S.comfortable.key, scope, "Triumph-style nib and pressure boundary"), ev("wingsung-601a", "fill_system", S.leftHook.key, scope, "spring-loaded filler and blind cap"), ev("wingsung-601a", "material", S.retailer.key, scope, "resin body, steel cap and window"), ev("wingsung-601a", "dimensions", S.retailer.key, scope, "139 mm and 12 mm single listing"), ev("wingsung-601a", "weight", S.retailer.key, scope, "18.7 g single listing"), ev("wingsung-601a", "status", S.comfortable.key, scope, "modern channel review and batch boundary")],
  },
  media: [{ key: "wingsung-601a-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表具体颜色、比例、材质或生产批次。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

const existingBrand = phase186WingsungPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE194_WINGSUNG_BRAND_ID);
if (!existingBrand) throw new Error("Phase 194 requires the existing curated WingSung brand pack.");
const brandOfficialSource = existingBrand.sources.find((source) => source.sourceType === "official");
if (!brandOfficialSource) throw new Error("Phase 194 requires the existing WingSung official history source.");
pen.sources = [...pen.sources, brandOfficialSource];

export const phase194Wingsung601aPacks: CuratedEntityPack[] = [existingBrand, pen];
