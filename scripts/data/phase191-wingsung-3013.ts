import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase186WingsungPacks } from "./phase186-wingsung-601";

const RETRIEVED = "2026-07-25";
export const PHASE191_WINGSUNG_BRAND_ID = "5WJw8padPmKF";
export const PHASE191_3013_ID = "bV6wU3C9NxNi";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, independenceGroup: `${input.key}-group`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase191", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase191", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不证明颜色、比例、容量、笔尖或品牌标志。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}

const S = {
  fpn: live({ key: "phase191-wingsung-3013-fpn", title: "Fountain Pen Network：Wing Sung 3013 Vacuum Filler Review", url: "https://www.fountainpennetwork.com/forum/topic/348005-wing-sung-3013-vacuum-filler-review/", registryName: "Fountain Pen Network participants", sourceType: "forum", tier: "professional_secondary", summary: "多段实测记录 3013 的透明笔身、推杆上墨、约 2 ml 级容量、EF/M 选择与装配风险；属于用户样本。", locator: "3013 review: appearance, filler action, capacity and construction" }),
  writershelf: live({ key: "phase191-wingsung-3013-writershelf", title: "WriterShelf：Wing Sung 3013 – A Four-Buck Vac Filler", url: "https://www.writershelf.com/article/wing-sung-3013-a-four-buck-vac-filler?locale=en", registryName: "WriterShelf", sourceType: "blog", tier: "professional_secondary", summary: "独立文章记录 3013 的真空／推杆术语、推杆动作、透明储墨量和与 TWSBI 的外观比较；不替代制造商规格。", locator: "3013 filling action and large-capacity review" }),
  goodwriters: live({ key: "phase191-wingsung-3013-goodwriters", title: "Goodwriterspens：Wing Sung 3013", url: "https://goodwriterspens.com/2019/11/23/wing-sung-3013/", registryName: "Goodwriterspens", sourceType: "blog", tier: "professional_secondary", summary: "长期使用记录提供约 14.5 cm 合盖、约 33 g、重心和透明树脂维护观察；数字属于单支样本。", locator: "sample dimensions, weight, balance and material observations" }),
  comfortable: live({ key: "phase191-wingsung-3013-comfortable", title: "Comfortable Shoes Studio：Wing Sung 3013 review", url: "https://comfortableshoesstudio.com/2021/01/review-wing-sung-3013-vacuum-fountain-pen/", registryName: "Comfortable Shoes Studio", sourceType: "blog", tier: "professional_secondary", summary: "独立评测补充透明树脂、推杆真空动作、约 2 ml 级容量、笔尖和螺纹风险；比较对象不等于制造关系。", locator: "3013 vacuum action, nib and cracking caution" }),
  svg: diagram("phase191-wingsung-3013-svg", "WingSung 3013 推杆上墨示意", "/images/library/site-original/phase191/wingsung/3013.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.82, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const scope = "wingsung-3013-model";
const pen: CuratedEntityPack = {
  key: "phase191-wingsung-3013",
  entityId: PHASE191_3013_ID,
  expectedType: "pen",
  expectedSlug: "永生-wingsung-3013",
  canonicalName: "永生 WingSung 3013",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wingsung-3013-phase191.md",
  storyTitle: "永生 WingSung 3013：低价真空／活塞上墨笔的实际边界",
  primarySourceKey: S.fpn.key,
  depthTier: "A",
  aliases: [{ alias: "Wing Sung 3013", language: "en", sourceKey: S.fpn.key }, { alias: "WingSung 3013 Vacuum Filler", language: "en", sourceKey: S.writershelf.key }, { alias: "Wing Sung 3013", language: "zh", sourceKey: S.goodwriters.key }, { alias: "Paili 013", language: "en", sourceKey: S.fpn.key }],
  sources: [S.fpn, S.writershelf, S.goodwriters, S.comfortable, S.svg],
  scopes: [{ key: scope, scopeKey: "wingsung-3013-identity-filler-and-care", productionState: "historical", editionScope: "约 2019 年前后流通的透明推杆／真空术语型号、EF/F/M 样本、容量和维护边界" }],
  claims: [
    claim("wingsung-3013-identity", "model_identity", "WingSung 3013 是独立的透明大容量上墨型号；尾端推杆、笔身刻字和填充单元需共同确认，不能用相似外形替代。", S.fpn.key, scope, "3013 identity and construction"),
    claim("wingsung-3013-brand-context", "brand_boundary", "Hero 官方历史页只用于确认 WingSung 所在的中国钢笔品牌语境，不证明 3013 的具体生产批次、材料或零件。", "phase186-hero-official-story", scope, "official brand context; no model-spec inference"),
    claim("wingsung-3013-terminology", "filling_system_boundary", "公开资料同时使用 vacuum filler 与 plunger filler；页面保留术语差异，不把比较对象 TWSBI Vac 700R 当作生产关系。", S.writershelf.key, scope, "vacuum versus plunger terminology"),
    claim("wingsung-3013-sample", "sample_measurement", "Goodwriterspens 样本约 14.5 cm 合盖、约 33 g 含帽；FPN 资料记录约 2 ml 级储墨量，均属于样本观察。", S.goodwriters.key, scope, "sample dimensions and capacity"),
    claim("wingsung-3013-nib", "nib_boundary", "市场资料可见 EF、F、M 选项，尖片和供墨片的兼容性不能从 Pilot 风格外形推导。", S.fpn.key, scope, "EF/M options and nib boundary"),
    claim("wingsung-3013-risk", "maintenance_guidance", "透明树脂、O-ring、螺纹和推杆机构可能出现裂纹、漏气或意外分离；先用清水测试，异常时交给维修者。", S.comfortable.key, scope, "cracking, thread and filler caution"),
    claim("wingsung-3013-selection", "selection_guidance", "购买时应核对刻字、透明笔杆、尾端阀位、笔尖和退换条件；大容量与较重重心不适合所有长时间书写者。", S.goodwriters.key, scope, "balance and selection boundary"),
  ],
  variants: [{ key: "wingsung-3013-clear", name: "透明／半透明树脂样本", notes: "透明储墨管是公开测评共同观察，颜色和透明度按批次核对。", sourceKey: S.fpn.key, variantKind: "material" }, { key: "wingsung-3013-ef-f", name: "EF／F 尖市场样本", notes: "市场选项与用户实测的线宽不能视为工厂统一调校。", sourceKey: S.comfortable.key, variantKind: "nib" }, { key: "wingsung-3013-m", name: "M 尖市场样本", notes: "FPN 评测记录 M 尖样本；尖材和供墨状态按单支确认。", sourceKey: S.fpn.key, variantKind: "nib" }],
  spec: {
    brandEntityId: PHASE191_WINGSUNG_BRAND_ID,
    values: { series_name: "WingSung 3013", origin_country: "中国；WingSung 资料与市场销售语境，具体生产主体按批次与刻字核对", nib: "常见 EF/F/M 市场选项；尖材、供墨片、刻字和调校按单支确认", fill_system: "尾端推杆式大容量上墨；公开资料在 vacuum 与 plunger 术语上有差异，密封和阀位决定实际吸墨", material: "透明或半透明树脂笔身、透明储墨管与金属填充件；颜色按版本", dimensions: "公开样本合盖约 14.5 cm、含帽约 33 g；单支测量，不代表全系", weight: "Goodwriterspens 样本约 33 g 含帽；空笔、颜色和后配件会改变重量", status: "历史/流通型号；约 2019 年前后公开测评集中出现，库存与批次状态按实物核对" },
    evidence: [ev("wingsung-3013", "brand_entity_id", S.fpn.key, scope, "WingSung model context"), ev("wingsung-3013", "series_name", S.fpn.key, scope, "3013 title and imprint"), ev("wingsung-3013", "origin_country", S.writershelf.key, scope, "Chinese market context"), ev("wingsung-3013", "nib", S.fpn.key, scope, "EF/M sample options"), ev("wingsung-3013", "fill_system", S.writershelf.key, scope, "plunger/vacuum action"), ev("wingsung-3013", "material", S.comfortable.key, scope, "transparent resin body"), ev("wingsung-3013", "dimensions", S.goodwriters.key, scope, "14.5 cm sample"), ev("wingsung-3013", "weight", S.goodwriters.key, scope, "33 g sample"), ev("wingsung-3013", "status", S.fpn.key, scope, "historical circulation" )],
  },
  media: [{ key: "wingsung-3013-primary", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表颜色、比例、容量、笔尖或品牌标志。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

const existingBrand = phase186WingsungPacks.find((pack) => pack.expectedType === "brand" && pack.entityId === PHASE191_WINGSUNG_BRAND_ID);
if (!existingBrand) throw new Error("Phase 191 requires the existing curated WingSung brand pack.");
const brandOfficialSource = existingBrand.sources.find((source) => source.sourceType === "official");
if (!brandOfficialSource) throw new Error("Phase 191 requires the existing WingSung official history source.");
pen.sources = [...pen.sources, brandOfficialSource];

export const phase191Wingsung3013Packs: CuratedEntityPack[] = [existingBrand, pen];
