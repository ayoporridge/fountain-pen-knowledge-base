import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-25";
export const PHASE217_LILY_BRAND_ID = "iBdg7LUlPdde";
export const PHASE217_LILY_910_ID = "dinM62TunTr8";
export const PHASE217_LILY_910_SLUG = "铃兰-lily-910-capless";
export const PHASE217_LILY_SOURCE_KEY = "phase217-lily-910";

function live(input: { key: string; title: string; url: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; summary: string; locator: string; independenceGroup: string }): CuratedSource {
  return { ...input, registryKey: `${input.key}-registry`, homepageUrl: new URL(input.url).origin, author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase217", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase217", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；示意图，非产品照片，不证明真实比例、颜色、Logo、完整厂史、内部状态或生产批次。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true` };
}

const S = {
  review: live({ key: "phase217-lily-estilofilos", title: "Crónicas Estilográficas：Matching (XXII). Lily 910", url: "https://estilofilos.blogspot.com/2017/01/matching-xxii-lily-910.html", registryName: "Crónicas Estilográficas / Bruno Taut", sourceType: "blog", tier: "professional_secondary", summary: "独立钢笔资料记录 Lily 910 的钢制笔身、镀金钢尖、aerometric 供墨、无前端 shutter、尺寸和制造者／年代的不确定性。", locator: "Lily 910 structure, aerometric filling, no internal shutter, dimensions and uncertain maker/period", independenceGroup: "phase217-lily-estilofilos" }),
  zhihu: live({ key: "phase217-lily-zhihu", title: "知乎：脱“帽”致敬！常见 Capless 钢笔评测", url: "https://www.zhihu.com/tardis/zm/art/412880134", registryName: "知乎钢笔爱好者文章", sourceType: "blog", tier: "community", summary: "中文社区文章把铃兰 910 与大公 56 作为国产无帽钢笔例子，适合作为中文名称和结构类别的旁证，不承担制造史结论。", locator: "Chinese capless examples: Dagong 56 and Lily 910", independenceGroup: "phase217-lily-zhihu" }),
  brandSvg: diagram("phase217-lily-brand-svg", "铃兰 Lily 品牌与 910 型号边界示意", "/images/library/site-original/phase217/lily/lily-brand.svg"),
  modelSvg: diagram("phase217-lily-910-svg", "铃兰 Lily 910 结构示意", "/images/library/site-original/phase217/lily/lily-910.svg"),
} as const;

const brandScope = "lily-brand-scope";
const modelScope = "lily-910-scope";
function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string, extra: string[] = []): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.84, sourceKey, locator, evidence: [sourceKey, ...extra].map((evidenceSource, index) => ({ key: `${key}-evidence-${index + 1}`, sourceKey: evidenceSource, scopeKey, locator })) };
}
function specEvidence(fieldKey: SpecFieldKey, sourceKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] { return { key: `lily-910-${fieldKey}`, fieldKey, sourceKey, scopeKey: modelScope, locator }; }

const brand: CuratedEntityPack = {
  key: "phase217-lily-brand", entityId: PHASE217_LILY_BRAND_ID, expectedType: "brand", expectedSlug: "lily", canonicalName: "铃兰 Lily", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/lily-brand-phase217.md", storyTitle: "铃兰 Lily：从中国无帽钢笔资料回到 910 型号", primarySourceKey: S.review.key, depthTier: "B",
  aliases: [{ alias: "Lily", language: "en", sourceKey: S.review.key }, { alias: "铃兰", language: "zh", sourceKey: S.zhihu.key }, { alias: "Lily 910 品牌", language: "zh", sourceKey: S.review.key }],
  sources: [S.review, S.zhihu, S.brandSvg], scopes: [{ key: brandScope, scopeKey: brandScope, productionState: "historical", editionScope: "历史钢笔资料中的 Lily／铃兰品牌入口；当前只确认 910 型号，不覆盖现代同名品牌或 Pilot Capless。" }],
  claims: [
    claim("lily-brand-identity", "brand_identity", "公开钢笔资料把 Lily 作为中国历史无帽钢笔的品牌／铭牌名称；制造者和生产年代仍未被充分核实，不写成确定的现代公司沿革。", S.review.key, brandScope, "Lily 910 described as a Chinese capless pen; maker documentation remains sparse", [S.zhihu.key, S.brandSvg.key]),
    claim("lily-910-family", "brand_model_family", "Lily 910 是目前资料最完整、可以挂在品牌页的型号；品牌页不把 capless 结构类别扩展成多个未经证实的 Lily SKU。", S.review.key, brandScope, "Lily 910 model record and limited maker information", [S.zhihu.key]),
    claim("lily-maker-boundary", "identity_boundary", "资料只提出安徽合肥及多家可能的文具企业作为线索，并未确认生产厂；不能把猜测写成品牌的正式制造者。", S.review.key, brandScope, "possible Hefei stationery makers; no confirmed production documentation"),
    claim("lily-capless-boundary", "design_positioning", "“capless”描述无传统笔帽的结构类别，不是 Lily 的别名，也不证明它与 Pilot Capless 共享授权、零件或气密设计。", S.review.key, brandScope, "comparison with Pilot Capless without asserting direct copying", [S.zhihu.key]),
    claim("lily-care", "maintenance_guidance", "品牌页应提醒 910 的笔尖外露、漏墨和久置干涸风险；清洗先用清水，携带用笔盒，不强行改造前端结构。", S.review.key, brandScope, "no internal shutter and exposed nib consequences"),
    claim("lily-selection", "selection_guidance", "鉴定旧笔应核对 Lily／910 铭刻、尾部释放机构、aerometric 供墨和无 shutter 结构；只凭“国产 Capless”不足以建立身份。", S.review.key, brandScope, "Lily 910 identification and structure clues", [S.zhihu.key]),
  ],
  variants: [{ key: "lily-910", name: "Lily 910", notes: "目前资料支持的历史型号；颜色、尖幅和生产年份暂不拆成 SKU。", sourceKey: S.review.key, variantKind: "edition_group" }],
  media: [{ key: "lily-brand-primary", title: S.brandSvg.title, sourceKey: S.brandSvg.key, localPath: S.brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；品牌导航示意，非产品照片，不代表真实比例、颜色、Logo、组织结构或生产批次。", sourceUrl: S.brandSvg.url, usageStatus: "primary" }],
  timeline: [{ key: "lily-2017-record", title: "Lily 910 进入独立钢笔资料记录", eventType: "community_event", startDate: "2017", circa: true, description: "2017 年独立钢笔文章集中记录 Lily 910 的结构、尺寸与制造者不确定性，形成目前品牌页的主要公开证据。", sourceKey: S.review.key }, { key: "lily-current-research", title: "中文社区继续把 Lily 910 作为国产无帽钢笔例子", eventType: "community_event", startDate: "2021", circa: true, description: "中文社区文章继续将铃兰 910 与大公 56 作为国产无帽钢笔案例；它补充中文语境，不替代型号原始实物资料。", sourceKey: S.zhihu.key }],
};

const model: CuratedEntityPack = {
  key: PHASE217_LILY_SOURCE_KEY, entityId: PHASE217_LILY_910_ID, expectedType: "pen", expectedSlug: PHASE217_LILY_910_SLUG, canonicalName: "铃兰 Lily 910", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/lily-910-phase217.md", storyTitle: "铃兰 Lily 910：无帽外露尖、aerometric 与 144／151 mm 尺寸窗口", primarySourceKey: S.review.key, depthTier: "B",
  aliases: [{ alias: "Lily 910", language: "en", sourceKey: S.review.key }, { alias: "铃兰 910", language: "zh", sourceKey: S.zhihu.key }, { alias: "Lily 910 capless", language: "en", sourceKey: S.review.key }, { alias: "铃兰无帽钢笔", language: "zh", sourceKey: S.zhihu.key }],
  sources: [S.review, S.zhihu, S.modelSvg], scopes: [{ key: modelScope, scopeKey: modelScope, productionState: "historical", materialScope: "资料所见抛光钢制笔身、镀金钢尖和 aerometric 供墨；不把样本状态外推为所有批次。", editionScope: "Lily 910；不覆盖 Pilot Capless、Dagong 56 或其它无帽中国钢笔。" }],
  claims: [
    claim("lily-910-identity", "model_identity", "Lily 910 是公开资料中的中国历史无帽钢笔型号；它与 Pilot Capless 有结构比较，但不能因此改名为 Pilot、Capless 或复制品。", S.review.key, modelScope, "Lily 910 Chinese capless model and Pilot comparison", [S.zhihu.key, S.modelSvg.key]),
    claim("lily-910-mechanism", "mechanism", "尾部释放机构控制笔尖工作状态，但前端没有内部 shutter；笔尖收回后仍暴露在外界。", S.review.key, modelScope, "no shutter whatsoever; nib constantly exposed", [S.modelSvg.key]),
    claim("lily-910-filling", "filling_system", "供墨是 aerometric；资料没有支持国际卡水、转换器或其它现代供墨系统，不创建替换件规格。", S.review.key, modelScope, "aerometric filling system"),
    claim("lily-910-material", "material_boundary", "笔身为抛光钢，笔尖为镀金钢尖；金色表面不等于实金尖，也不足以推断钢材牌号。", S.review.key, modelScope, "polished steel body and gold-plated steel nib"),
    claim("lily-910-dimensions", "dimensions", "实测样本闭合约 144 mm、打开约 151 mm、直径 12.0 mm；闭合是笔尖收回状态，不是有传统笔帽。", S.review.key, modelScope, "length 144/151 mm and diameter 12.0 mm"),
    claim("lily-910-weight-capacity", "capacity", "资料记录干重约 28.5 g、墨水容量约 1 ml；残墨、后配件和磨损会改变二手笔测量。", S.review.key, modelScope, "weight 28.5 g and ink deposit around 1 ml"),
    claim("lily-910-dryness", "condition_risk", "外露笔尖增加漏墨和久置干涸风险，但原评测样本重新启动并不困难；这两点都不能外推成统一品控承诺。", S.review.key, modelScope, "exposed nib consequences and sample resistance to dryness"),
    claim("lily-910-writing", "writing_character", "独立评测认为写感可用但可能有反馈或粗糙感；线宽和舒适度受尖端状态、纸张和墨水影响。", S.review.key, modelScope, "acceptable writing quality and feedback observation"),
    claim("lily-910-care", "maintenance_guidance", "上墨前先清水冲洗并低压检查挤压囊；携带让笔尖朝上、使用笔盒，避免热水、酒精和自行封堵或改造 shutter。", S.review.key, modelScope, "aerometric maintenance and exposed-nib carrying risk"),
    claim("lily-910-selection", "selection_guidance", "购买要同时核对 Lily／910 铭刻、尾部机构、无 shutter、aerometric 单元和 144／151 mm 尺寸窗口；“国产 Capless”标题本身不够。", S.review.key, modelScope, "identification clues and limited availability", [S.zhihu.key]),
  ],
  variants: [{ key: "lily-910-historical", name: "Lily 910 历史型号", notes: "公开资料未确认颜色、尖幅、生产年份或制造厂，不拆分未经证实的版本。", sourceKey: S.review.key, variantKind: "edition_group" }],
  spec: { brandEntityId: PHASE217_LILY_BRAND_ID, values: { series_name: "Lily 910", release_year: "未核实；部分资料提到 1992，但不能视为定论", origin_country: "中国；资料线索指向安徽合肥，制造者未确认", nib: "镀金钢尖；统一尖幅未核实", fill_system: "aerometric", material: "抛光钢制笔身", dimensions: "闭合约 144 mm；打开约 151 mm；直径 12.0 mm（测量样本）", weight: "干重约 28.5 g（测量样本）", price_range: "来源和库存不稳定；不提供当前价格", status: "历史型号；公开资料有限" }, evidence: [specEvidence("brand_entity_id", S.review.key, "Lily 910 maker/brand context"), specEvidence("series_name", S.review.key, "Lily 910 title"), specEvidence("release_year", S.review.key, "uncertain period and 1992 mention"), specEvidence("origin_country", S.review.key, "possible Hefei, Anhui context"), specEvidence("nib", S.review.key, "gold-plated steel nib"), specEvidence("fill_system", S.review.key, "aerometric"), specEvidence("material", S.review.key, "steel body"), specEvidence("dimensions", S.review.key, "144/151 mm and 12 mm"), specEvidence("weight", S.review.key, "28.5 g dry"), specEvidence("price_range", S.review.key, "erratic availability; no current price"), specEvidence("status", S.review.key, "limited documentation"),] },
  media: [{ key: "lily-910-primary", title: S.modelSvg.title, sourceKey: S.modelSvg.key, localPath: S.modelSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；结构示意，非产品照片，不代表真实比例、颜色、内腔、Logo、编号或生产批次。", sourceUrl: S.modelSvg.url, usageStatus: "primary" }],
  timeline: [{ key: "lily-910-recorded", title: "Lily 910 的独立实物记录", eventType: "model_released", startDate: "2017", circa: true, description: "2017 年文章记录 Lily 910 的无帽结构、aerometric 供墨、尺寸和制造者不确定性；具体首发年份未知。", sourceKey: S.review.key }],
};

export const phase217Lily910Packs: CuratedEntityPack[] = [brand, model];
