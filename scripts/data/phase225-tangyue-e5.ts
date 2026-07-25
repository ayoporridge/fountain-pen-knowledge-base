import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-25";
export const PHASE225_TANGYUE_BRAND_ID = "FER68geLQkcJ";
export const PHASE225_TANGYUE_ID = "zaXu3bnh1ith";
export const PHASE225_TANGYUE_BRAND_SLUG = "tangyue";
export const PHASE225_TANGYUE_SLUG = "唐月-e5";

function web(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string; independenceGroup: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase225", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase225", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, summary: "本站原创 factual SVG；结构示意，非产品照片，不证明真实比例、颜色、磁铁位置、材料或完整目录。", allowedUse: "store_full", license: "site-original", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}
const S = {
  pennote: web({ key: "phase225-tangyue-pennote", title: "Pennote：唐月–爱因斯坦", url: "https://vintagepen.blog/2025/07/25/%E5%94%90%E6%9C%88-%E7%88%B1%E5%9B%A0%E6%96%AF%E5%9D%A6/".replace("%E7%88%B1", "%E7%88%B1"), registryName: "Pennote", sourceType: "blog", tier: "professional_secondary", summary: "实物记录讨论唐月钢尖表面处理、激光雕刻、多个尖型与一例 Bock 兼容改装，明确提示样本不能概括全线。", locator: "sections on treated nib surface, F/EF samples, engraving, nib variety and compatibility", independenceGroup: "phase225-pennote" }),
  modian: web({ key: "phase225-tangyue-modian", title: "摩点：唐月灵感钢笔—磁吸开合", url: "https://zhongchou.modian.com/item/150669.html", registryName: "摩点项目页", sourceType: "official", tier: "primary", summary: "项目页把唐月灵感钢笔、E5 灵感、草尖绿和磁吸开合放在同一具体产品语境，可作项目自身的一手记录。", locator: "project title, E5 inspiration, magnetic opening and color option", independenceGroup: "phase225-modian" }),
  smzdm: web({ key: "phase225-tangyue-smzdm", title: "什么值得买：唐月 E5 钢笔深度评测", url: "https://post.smzdm.com/p/ago7xqwm/", registryName: "什么值得买", sourceType: "blog", tier: "community", summary: "中文评测以唐月 E5 为题，记录磁吸结构、入门定位和实际使用语境，属于独立体验资料。", locator: "article title and sections describing Tangyue E5 magnetic design and use", independenceGroup: "phase225-smzdm" }),
  bilibili: web({ key: "phase225-tangyue-bilibili", title: "哔哩哔哩：唐月 E5 磁吸钢笔", url: "https://www.bilibili.com/video/BV135JQzeEr/", registryName: "哔哩哔哩创作者", sourceType: "forum", tier: "community", summary: "2025 年视频以唐月 E5 磁吸钢笔为主题，提供型号和时间交叉线索，不替代规格表。", locator: "video title and published date 2025-09-24", independenceGroup: "phase225-bilibili" }),
  brandSvg: diagram("phase225-tangyue-brand-svg", "唐月品牌与型号入口示意", "/images/library/site-original/phase225/tangyue/tangyue-brand.svg"),
  modelSvg: diagram("phase225-tangyue-e5-svg", "唐月 E5 磁吸笔帽结构示意", "/images/library/site-original/phase225/tangyue/e5.svg"),
} as const;
const brandScope = "tangyue-brand-scope";
const modelScope = "tangyue-e5-scope";
function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string, extra: string[] = []): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.86, sourceKey, locator, evidence: [sourceKey, ...extra].map((source, index) => ({ key: `${key}-evidence-${index + 1}`, sourceKey: source, scopeKey, locator })) };
}
function evidence(fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `phase225-tangyue-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}
function media(source: CuratedSource, key: string): CuratedEntityPack["media"][number] {
  return { key, title: source.title, sourceKey: source.key, localPath: source.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实尺寸、磁铁位置、材料、颜色、容量或包装。", sourceUrl: source.url, usageStatus: "primary" };
}

const brand: CuratedEntityPack = {
  key: "phase225-tangyue-brand", entityId: PHASE225_TANGYUE_BRAND_ID, expectedType: "brand", expectedSlug: PHASE225_TANGYUE_BRAND_SLUG, canonicalName: "唐月 TangMoon", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/tangyue-brand-phase225.md", storyTitle: "唐月 TangMoon：主题设计、磁吸路线与逐型号核验", primarySourceKey: S.modian.key, depthTier: "B",
  aliases: [{ alias: "唐月", language: "zh", sourceKey: S.modian.key }, { alias: "TangMoon", language: "en", sourceKey: S.pennote.key }],
  sources: [S.pennote, S.modian, S.smzdm, S.brandSvg],
  scopes: [{ key: brandScope, scopeKey: brandScope, productionState: "current", editionScope: "公开资料能确认的品牌与产品设计边界；不同型号分别核验，不拼接未证实目录。" }],
  claims: [
    claim("tangyue-brand-identity", "brand_identity", "唐月 TangMoon 是公开中文资料中出现的钢笔设计品牌，资料可确认其有具体型号和主题项目。", S.pennote.key, brandScope, "brand name and pen sample", [S.modian.key]),
    claim("tangyue-brand-design", "design_direction", "公开项目把原创主题、磁吸开合和颜色选项作为产品体验的一部分；这些卖点应按型号阅读。", S.modian.key, brandScope, "project design description", [S.smzdm.key]),
    claim("tangyue-brand-nibs", "nib_line", "Pennote 的样本记录提到多种钢尖、表面处理和激光雕刻，但样本数量不足以代表完整目录。", S.pennote.key, brandScope, "treated nib, engraving and nib variety", [S.smzdm.key]),
    claim("tangyue-brand-boundary", "identity_boundary", "现有来源不足以确认成立年份、固定工厂、完整型号总表或所有型号共用的上墨系统，品牌页保留资料边界。", S.pennote.key, brandScope, "evidence boundary", [S.modian.key]),
    claim("tangyue-brand-selection", "selection_guidance", "选购时应核对具体型号、笔尖、上墨器、磁吸件和批次，不以泛称磁吸钢笔替代型号证据。", S.smzdm.key, brandScope, "review and selection context", [S.modian.key]),
  ],
  variants: [{ key: "tangyue-design-projects", name: "主题设计／项目路线", notes: "摩点页面和实物记录支持该方向；每个项目的材料与配置仍需单独核验。", sourceKey: S.modian.key, variantKind: "edition_group" }],
  media: [media(S.brandSvg, "tangyue-brand-primary")],
  timeline: [
    { key: "tangyue-e5-project", title: "唐月灵感项目公开磁吸开合与 E5 选项", eventType: "design_milestone", startDate: "2025", circa: true, description: "众筹页面把 E5 灵感、颜色选项和磁吸开合放在同一项目语境。", sourceKey: S.modian.key },
    { key: "tangyue-e5-video", title: "唐月 E5 磁吸钢笔出现视频评测记录", eventType: "community_event", startDate: "2025-09-24", circa: false, description: "视频标题和发布日期为 E5 的公开时间线提供交叉线索。", sourceKey: S.bilibili.key },
  ],
};

const model: CuratedEntityPack = {
  key: "phase225-tangyue-e5", entityId: PHASE225_TANGYUE_ID, expectedType: "pen", expectedSlug: PHASE225_TANGYUE_SLUG, canonicalName: "唐月 E5 磁吸钢笔", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/tangyue-e5-phase225.md", storyTitle: "唐月 E5：磁吸笔帽与逐批次核对", primarySourceKey: S.modian.key, depthTier: "A",
  aliases: [{ alias: "唐月 E5", language: "zh", sourceKey: S.smzdm.key }, { alias: "TangMoon E5", language: "en", sourceKey: S.bilibili.key }, { alias: "唐月 E5 磁吸钢笔", language: "zh", sourceKey: S.bilibili.key }],
  sources: [S.modian, S.smzdm, S.bilibili, S.pennote, S.modelSvg],
  scopes: [{ key: modelScope, scopeKey: modelScope, productionState: "current", materialScope: "公开资料强调主题配色与磁吸结构；具体树脂、金属件和表面处理按批次核对。", editionScope: "E5 型号；颜色、尖幅、套装和上墨配件属于销售版本或渠道信息。" }],
  claims: [
    claim("tangyue-e5-identity", "model_identity", "唐月 E5 是公开项目和评测中被单独指名的型号，磁吸开合作为其主要辨识特征。", S.modian.key, modelScope, "E5 inspiration and magnetic opening", [S.smzdm.key, S.bilibili.key]),
    claim("tangyue-e5-cap", "cap_mechanism", "E5 的笔帽通过磁性定位完成开合；磁吸笔帽不等于活塞、真空或囊式上墨。", S.modian.key, modelScope, "magnetic opening description", [S.smzdm.key, S.bilibili.key]),
    claim("tangyue-e5-nib", "nib_boundary", "品牌旁证显示唐月有多种钢尖与表面处理，E5 的具体尖幅应以订单、笔尖刻字和实物为准。", S.pennote.key, modelScope, "treated nib and sample limitation", [S.smzdm.key]),
    claim("tangyue-e5-version", "version_boundary", "草尖绿等颜色、尖幅、套装与价格是项目或渠道选项，不拆成新的 E5 主型号。", S.modian.key, modelScope, "color and project option", [S.smzdm.key]),
    claim("tangyue-e5-fill", "filling_system", "现有公开资料没有形成统一的 E5 上墨器规格；购买时须按包装核对转换器、墨囊或其他配件。", S.smzdm.key, modelScope, "review scope and specification boundary", [S.pennote.key]),
    claim("tangyue-e5-care", "maintenance_guidance", "合帽时让磁力自然定位，保持接触面清洁，清洗和携带时避免强拧、强磁环境与高温。", S.smzdm.key, modelScope, "use and maintenance context", [S.modian.key]),
    claim("tangyue-e5-selection", "selection_guidance", "购买前保存订单和包装，核对型号、尖幅、上墨配件、磁吸件状态与售后条件。", S.bilibili.key, modelScope, "model and purchase cross-check", [S.smzdm.key]),
  ],
  variants: [{ key: "tangyue-e5-color", name: "E5 主题配色／草尖绿等项目选项", notes: "摩点页面的项目选项；颜色不构成独立主型号。", sourceKey: S.modian.key, variantKind: "color" }, { key: "tangyue-e5-nib", name: "E5 尖幅选项", notes: "公开资料未给出统一完整表，按订单和实物核对。", sourceKey: S.pennote.key, variantKind: "nib" }],
  spec: { brandEntityId: PHASE225_TANGYUE_BRAND_ID, values: { series_name: "唐月 TangMoon E5", release_year: "2025 年已有评测与视频记录；首发日期未核实", origin_country: "中文资料和渠道项目可见；具体生产地未核实", nib: "具体尖幅按订单与笔尖刻字；品牌同类资料显示存在多种钢尖", fill_system: "公开资料未形成统一标准，购买时核对转换器、墨囊或其他配件", material: "公开项目强调主题设计与配色；材质和表面处理按批次核对", dimensions: "未见统一公开长度、直径、重量和容量表", price_range: "渠道和版本差异较大，按当次订单核对", status: "项目与渠道资料可见；批次状态需向卖家确认" }, evidence: [evidence("brand_entity_id", S.modian.key, modelScope, "TangMoon project brand"), evidence("series_name", S.modian.key, modelScope, "E5 project title"), evidence("release_year", S.bilibili.key, modelScope, "published 2025-09-24"), evidence("origin_country", S.modian.key, modelScope, "Chinese project context; production location not stated"), evidence("nib", S.pennote.key, modelScope, "nib variety and sample boundary"), evidence("fill_system", S.smzdm.key, modelScope, "review does not establish a universal filler"), evidence("material", S.modian.key, modelScope, "theme color and design option"), evidence("dimensions", S.smzdm.key, modelScope, "no unified dimensions in reviewed sources"), evidence("price_range", S.smzdm.key, modelScope, "review market context"), evidence("status", S.bilibili.key, modelScope, "current public review record") ] },
  media: [media(S.modelSvg, "tangyue-e5-primary")],
  timeline: [{ key: "tangyue-e5-public", title: "E5 以磁吸钢笔名义出现在公开项目和评测", eventType: "model_released", startDate: "2025", circa: true, description: "摩点项目、中文评测和视频共同支持型号公开存在；不把评测年份写成首发日。", sourceKey: S.modian.key }],
};

export const phase225TangyueE5Packs: CuratedEntityPack[] = [brand, model];
