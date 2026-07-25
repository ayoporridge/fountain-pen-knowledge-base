import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-25";
export const PHASE186_WINGSUNG_BRAND_ID = "5WJw8padPmKF";
export const PHASE186_601_ID = "UIxLC4vsFU4T";

function live(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string }): CuratedSource {
  return { ...input, independenceGroup: input.registryKey, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase186", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase186", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, summary: "本站原创 factual SVG；示意图，非产品照片，不证明比例、颜色、重量或库存。", allowedUse: "store_full", license: "site-original", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}

const S = {
  hero: live({ key: "phase186-hero-official-story", title: "Hero 官方：Our Story", url: "https://www.hero-light.com/en/list-18-1.html", registryKey: "hero-official-phase186", registryName: "Shanghai Hero", sourceType: "official", tier: "primary", summary: "Hero 官方品牌史确认中国钢笔品牌、出口和长期制造语境；不从该页反推 WingSung 601 的具体规格。", locator: "Our Story: Chinese fountain-pen brand and export history" }),
  company: live({ key: "phase186-shanghai-hero-overview", title: "Shanghai Hero Pen Company 历史概览", url: "https://en.wikipedia.org/wiki/Shanghai_Hero_Pen_Company", registryKey: "shanghai-hero-reference-phase186", registryName: "Shanghai Hero Pen Company reference", sourceType: "blog", tier: "professional_secondary", summary: "历史概览列出 Hero、Wing Sung 等品牌名称；归属、授权和年代仍保留多源分歧。", locator: "company history, brand list and ownership boundary" }),
  brandForum: live({ key: "phase186-wingsung-hero-forum", title: "Fountain Pen Network：Wing Sung 与 Hero 品牌讨论", url: "https://www.fountainpennetwork.com/forum/topic/499-wing-sung-hero/", registryKey: "fountain-pen-network-wingsung-brand-phase186", registryName: "Fountain Pen Network participants", sourceType: "forum", tier: "professional_secondary", summary: "社区长帖展示不同年代和供应商对 WingSung/Hero 关系的争论；本包只用于保留争议边界。", locator: "brand ownership, licensing and historical disagreement" }),
  fpn601: live({ key: "phase186-wingsung-601-fpn", title: "Fountain Pen Network：Wing Sung 601 Review", url: "https://www.fountainpennetwork.com/forum/topic/341720-wing-sung-601-review/", registryKey: "fountain-pen-network-wingsung-601-phase186", registryName: "Fountain Pen Network reviewers", sourceType: "forum", tier: "professional_secondary", summary: "评测记录 601 的隔膜与弹簧活塞版本、墨窗、暗尖、容量和单支笔尖差异。", locator: "diaphragm and spring-loaded piston versions; ink window; hooded nib; writing sample" }),
  fpnAuto: live({ key: "phase186-wingsung-601-auto-draw", title: "Fountain Pen Network：Wing Sung 601 Auto Draw Filler", url: "https://www.fountainpennetwork.com/forum/topic/337068-wing-sung-601-auto-draw-filler/", registryKey: "fountain-pen-network-wingsung-601-auto-phase186", registryName: "Fountain Pen Network reviewer", sourceType: "forum", tier: "professional_secondary", summary: "独立资料提供抽拉机构、暗尖、约 138/128/152 mm 和约 20 g 的样本测量。", locator: "auto-draw filler, dimensions, weight and hooded nib" }),
  sbre: live({ key: "phase186-wingsung-601-sbre", title: "SBRE Brown：Wing Sung 601 Vacumatic Fountain Pen Review", url: "https://www.sbrebrown.com/2019/08/wing-sung-601-vacumatic-fountain-pen-review/", registryKey: "sbre-brown-wingsung-601-phase186", registryName: "SBRE Brown", sourceType: "blog", tier: "professional_secondary", summary: "独立视频评测页面给出约 139.3/129.3/153.4 mm 和约 19.5 g 的具体样本数据。", locator: "measurements: capped, uncapped, posted and weight" }),
  rupert: live({ key: "phase186-wingsung-601-rupert", title: "Rupert Arzeian：Another look at the Wing Sung 601", url: "https://rupertarzeian.com/2018/07/30/another-look-at-the-wing-sung-601/", registryKey: "rupert-arzeian-wingsung-601-phase186", registryName: "Rupert Arzeian", sourceType: "blog", tier: "professional_secondary", summary: "独立观察补充盲帽、金属推杆、帽盖和携带尺寸；单支体验不外推到全部批次。", locator: "blind cap, plunger rod, cap and specimen dimensions" }),
  brandSvg: diagram("phase186-wingsung-brand-svg", "永生 WingSung 品牌导航示意", "/images/library/site-original/phase186/wingsung/brand.svg"),
  penSvg: diagram("phase186-wingsung-601-svg", "WingSung 601 暗尖与真空上墨示意", "/images/library/site-original/phase186/wingsung/601.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.86, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function ev(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

const brandScope = "wingsung-brand";
const modelScope = "wingsung-601-model";
const brand: CuratedEntityPack = {
  key: "phase186-wingsung-brand",
  entityId: PHASE186_WINGSUNG_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "wingsung",
  canonicalName: "永生 (WingSung)",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wingsung-brand-phase186.md",
  storyTitle: "永生 WingSung：把品牌名称、生产线和具体型号分开",
  primarySourceKey: S.hero.key,
  depthTier: "A",
  aliases: [{ alias: "Wing Sung", language: "en", sourceKey: S.company.key }, { alias: "WingSung", language: "en", sourceKey: S.company.key }, { alias: "Yongsheng", language: "en", sourceKey: S.brandForum.key }, { alias: "永生", language: "zh", sourceKey: S.brandForum.key }],
  sources: [S.hero, S.company, S.brandForum, S.fpn601, S.brandSvg],
  scopes: [{ key: brandScope, scopeKey: "wingsung-brand-name-and-navigation", productionState: "unknown", editionScope: "品牌名称、历史和已完成型号导航；具体材料、上墨和生产归属按型号核验" }],
  claims: [
    claim("wingsung-brand-identity", "brand_identity", "永生／WingSung 是中国钢笔资料中反复出现的品牌名称；中文、英文和旧资料拼写应作为检索别名，不自动生成多个品牌。", S.company.key, brandScope, "brand name and historical overview"),
    claim("wingsung-brand-boundary", "brand_boundary", "Hero 官方品牌史能确认中国钢笔制造语境，但 WingSung 与 Hero 的不同时期归属、授权和供应商存在公开分歧；页面保留争议，不臆断单一股权链。", S.hero.key, brandScope, "official Hero history plus community disagreement"),
    claim("wingsung-brand-navigation", "brand_model_navigation", "品牌页只公开已经来源化的具体型号；601 的暗尖、墨窗和真空／活塞结构不回填到 601A、618 或 699。", S.fpn601.key, brandScope, "model-specific evidence and navigation boundary"),
  ],
  variants: [],
  timeline: [
    { key: "wingsung-hero-context-1931", title: "上海钢笔制造的 Hero 前身语境", eventType: "brand_founded", startDate: "1931", circa: true, description: "历史概览以 1931 年上海 Wolff Pen Manufacturing Company 作为 Hero 前身起点；这不是 WingSung 品牌单独成立日期。", sourceKey: S.company.key },
    { key: "wingsung-hero-context-1966", title: "Hero 名称进入官方品牌史", eventType: "design_milestone", startDate: "1966", circa: true, description: "历史概览记录企业在 1966 年改用 Hero 名称；WingSung 的具体授权和生产阶段仍需逐型号核对。", sourceKey: S.company.key },
  ],
  media: [{ key: "wingsung-brand-primary", title: S.brandSvg.title, sourceKey: S.brandSvg.key, localPath: S.brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片，不代表商标、比例或工厂标志。", sourceUrl: S.brandSvg.url, usageStatus: "primary" }],
};

const pen: CuratedEntityPack = {
  key: "phase186-wingsung-601",
  entityId: PHASE186_601_ID,
  expectedType: "pen",
  expectedSlug: "永生-wingsung-601",
  canonicalName: "永生 WingSung 601",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wingsung-601-phase186.md",
  storyTitle: "永生 WingSung 601：暗尖、墨窗和现代真空路线",
  primarySourceKey: S.fpn601.key,
  depthTier: "A",
  aliases: [{ alias: "Wing Sung 601", language: "en", sourceKey: S.fpn601.key }, { alias: "WingSung 601", language: "en", sourceKey: S.sbre.key }, { alias: "Yongsheng 601", language: "en", sourceKey: S.fpn601.key }, { alias: "永生 601", language: "zh", sourceKey: S.fpn601.key }],
  sources: [S.fpn601, S.fpnAuto, S.sbre, S.rupert, S.hero, S.penSvg],
  scopes: [{ key: modelScope, scopeKey: "wingsung-601-model-and-sample-measurements", productionState: "current", editionScope: "601 identity, filling versions, use, maintenance and independent sample measurements" }],
  claims: [
    claim("wingsung-601-identity", "model_identity", "WingSung 601 是一支现代渠道流通的暗尖钢笔，以复古流线外形、墨窗和尾端真空／活塞抽拉机构为识别点。", S.fpn601.key, modelScope, "601 review identity and construction"),
    claim("wingsung-601-filling-boundary", "version_boundary", "早期隔膜样本与后期弹簧加载活塞样本并存；两者不能只凭 vacumatic 一个词合并，购买时要按尾端结构核对。", S.fpn601.key, modelScope, "diaphragm and spring-loaded piston revision discussion"),
    claim("wingsung-601-measurement", "sample_measurement", "独立评测样本约 138–139.3 mm 合盖、约 128–129.3 mm 未插帽、约 152–153.4 mm 插帽、约 19.5–20 g；这些数值不代表所有批次。", S.sbre.key, modelScope, "independent measurements and cross-source range"),
    claim("wingsung-601-care", "maintenance_guidance", "用室温清水缓慢抽拉清洗，避免酒精、热水和金属工具；隔膜、活塞密封和尾端螺纹异常时停手并找维修。", S.rupert.key, modelScope, "blind cap, plunger and conservative maintenance boundary"),
    claim("wingsung-601-maker", "brand_context", "该型号归入永生 WingSung 品牌页；品牌归属和授权历史不改变 601 自身的型号规格。", S.hero.key, modelScope, "brand context without factory inference"),
  ],
  variants: [
    { key: "wingsung-601-diaphragm", name: "早期隔膜样本", notes: "早期资料记录橡胶隔膜；密封件老化风险按单支检查。", sourceKey: S.fpn601.key, variantKind: "edition_group" },
    { key: "wingsung-601-spring-piston", name: "弹簧加载活塞样本", notes: "后期改良路线；尾端结构、密封和拆卸仍按实物确认。", sourceKey: S.fpn601.key, variantKind: "edition_group" },
    { key: "wingsung-601-hooded-steel", name: "暗尖钢尖", notes: "评测常见细、硬、反馈明显；具体线宽和调校按单支验收。", sourceKey: S.fpnAuto.key, variantKind: "nib" },
  ],
  spec: {
    brandEntityId: PHASE186_WINGSUNG_BRAND_ID,
    values: { series_name: "WingSung 601", nib: "暗尖钢尖；独立评测常见细、硬、反馈明显，实际线宽和调校按单支确认", fill_system: "真空／vacumatic 路线；早期隔膜与后期弹簧加载活塞样本并存，购买时核对版本", material: "树脂或塑料笔身、金属夹与帽盖等组合；不同 finish 和全钢版本不能互相回填", dimensions: "约 138–139.3 mm 合盖、约 128–129.3 mm 未插帽、约 152–153.4 mm 插帽；来自独立样本测量", weight: "约 19.5–20 g 的独立样本；装墨和 finish 会改变实际重量", status: "现代渠道流通型号；批次、授权生产和库存按卖家与实物核对" },
    evidence: [ev("wingsung-601", "brand_entity_id", S.hero.key, modelScope, "brand context"), ev("wingsung-601", "series_name", S.fpn601.key, modelScope, "601 model identity"), ev("wingsung-601", "nib", S.fpnAuto.key, modelScope, "hooded steel nib observations"), ev("wingsung-601", "fill_system", S.fpn601.key, modelScope, "filling revision boundary"), ev("wingsung-601", "material", S.rupert.key, modelScope, "single-sample material and cap observations"), ev("wingsung-601", "dimensions", S.sbre.key, modelScope, "independent measurement"), ev("wingsung-601", "weight", S.sbre.key, modelScope, "independent sample weight"), ev("wingsung-601", "status", S.fpn601.key, modelScope, "modern channel and batch boundary")],
  },
  media: [{ key: "wingsung-601-primary", title: S.penSvg.title, sourceKey: S.penSvg.key, localPath: S.penSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表具体颜色、比例或生产批次。", sourceUrl: S.penSvg.url, usageStatus: "primary" }],
};

export const phase186WingsungPacks: CuratedEntityPack[] = [brand, pen];
