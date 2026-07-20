import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

export const PHASE91_BIRMINGHAM_BRAND_ID = "phase91-brand-birmingham-pen-company";
export const PHASE91_ALUMINA_MODEL_C_ID = "phase91-pen-birmingham-alumina-model-c";
export const PHASE91_BIRMINGHAM_SLUG = "birmingham-pen-company";
export const PHASE91_ALUMINA_MODEL_C_SLUG = "birmingham-alumina-model-c";

const RETRIEVED = "2026-07-20";

function source(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "homepageUrl" | "archiveUrl" | "archiveLocator" | "independenceGroup">): CuratedSource {
  return {
    ...input,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    homepageUrl: input.url,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
    independenceGroup: input.registryKey,
  };
}

function diagram(key: string, title: string, localPath: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary,
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  story: source({ key: "phase91-birmingham-story", registryKey: "birmingham-official", registryName: "Birmingham Pen Company official", sourceType: "official", tier: "primary", title: "Our Story", url: "https://www.birminghampens.com/pages/about-us", summary: "官网说明品牌名来自匹兹堡 Southside 的 Little Birmingham，当前工作室在宾夕法尼亚 Cranberry Township，钢笔以小批量、有限供应加工。" }),
  alumina: source({ key: "phase91-birmingham-alumina", registryKey: "birmingham-official", registryName: "Birmingham Pen Company official", sourceType: "official", tier: "primary", title: "Alumina Fountain Pen", url: "https://www.birminghampens.com/products/alumina", summary: "现行 Alumina Model-C 商品页列铝合金 CNC 加工、German #6 nib、随附 converter、螺旋帽、可套帽、141.8/154.2/124.4 mm、31/20 g，并明确不建议 eyedropper conversion。" }),
  converter: source({ key: "phase91-birmingham-converter", registryKey: "birmingham-official", registryName: "Birmingham Pen Company official", sourceType: "official", tier: "primary", title: "Ink Converter Set", url: "https://www.birminghampens.com/products/standard-ink-converter", summary: "官网说明 Birmingham 书写笔附 standard international converter；该 converter 约 0.8 mL，不能被误写为金属笔杆可安全滴灌的容量。" }),
  modelA: source({ key: "phase91-birmingham-model-a-review", registryKey: "well-appointed-desk", registryName: "The Well-Appointed Desk", sourceType: "blog", tier: "professional_secondary", title: "Birmingham Pen Co. Model-A Liquid Hot Magma review", url: "https://www.wellappointeddesk.com/2018/10/fountain-pen-review-birmingham-pen-co-model-a-liquid-hot-magma/", publishedAt: "2018-10-29", summary: "独立评测的树脂 Model-A 是历史独立笔形，带 converter 的样本和作者的滴灌体验不能作为现行铝合金 Alumina Model-C 规格或维护建议。" }),
  brandSvg: diagram("phase91-birmingham-brand-svg", "Birmingham Pen Company 品牌事实卡", "/images/library/site-original/birmingham/birmingham-brand.svg", "原创 SVG，说明宾夕法尼亚小批量工作室与品牌—型号导航；不是产品照片。"),
  aluminaSvg: diagram("phase91-birmingham-alumina-svg", "Birmingham Alumina Model-C 结构事实卡", "/images/library/site-original/birmingham/birmingham-alumina-model-c.svg", "原创 SVG，说明铝合金、converter、#6 nib、螺旋帽与不可将其当作滴入笔；不是比例图或产品照片。"),
};

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

const brandScope = "phase91-birmingham-brand-scope";
const penScope = "phase91-birmingham-alumina-scope";

const brand: CuratedEntityPack = {
  key: "phase91-birmingham-brand-v1",
  entityId: PHASE91_BIRMINGHAM_BRAND_ID,
  expectedType: "brand",
  expectedSlug: PHASE91_BIRMINGHAM_SLUG,
  canonicalName: "Birmingham Pen Company",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/birmingham-pen-company.md",
  storyTitle: "Birmingham Pen Company：宾夕法尼亚小批量制笔与墨水工作室",
  primarySourceKey: S.story.key,
  depthTier: "A",
  aliases: [
    { alias: "Birmingham Pen Company", language: "en", sourceKey: S.story.key },
    { alias: "伯明翰钢笔公司", language: "zh", sourceKey: S.story.key },
    { alias: "Birmingham Pens", language: "en", sourceKey: S.story.key },
  ],
  sources: [S.story, S.alumina, S.modelA, S.brandSvg],
  scopes: [{ key: brandScope, scopeKey: brandScope, productionState: "current", editionScope: "品牌历史与已公开型号导航；批次、材料、库存与笔尖下沉到具体型号。" }],
  claims: [
    { key: "phase91-birmingham-identity", predicate: "brand_identity", objectText: "Birmingham Pen Company 是宾夕法尼亚的小型墨水与钢笔制造商；名称来自匹兹堡 Southside 的 Little Birmingham，而非英国历史制笔厂的公司继承。", factClass: "core", confidence: 0.99, sourceKey: S.story.key, locator: "Our Story: name origin and workshop", evidence: [{ key: "phase91-birmingham-identity-evidence", sourceKey: S.story.key, scopeKey: brandScope, locator: "Little Birmingham naming and Pennsylvania workshop" }] },
    { key: "phase91-birmingham-navigation", predicate: "series_navigation", objectText: "本页仅链接已建立的 Alumina Model-C；早期 Model-A、其它材料批次与墨水产品均不是该型号的变体。", factClass: "core", confidence: 0.98, sourceKey: S.modelA.key, locator: "historical Model-A identity boundary", evidence: [{ key: "phase91-birmingham-navigation-evidence", sourceKey: S.modelA.key, scopeKey: brandScope, locator: "2018 Model-A independent review" }] },
  ],
  media: [{ key: "phase91-birmingham-brand-media", title: "Birmingham Pen Company 品牌事实卡（非产品照片）", sourceKey: S.brandSvg.key, localPath: S.brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片。", sourceUrl: S.brandSvg.url, usageStatus: "primary" }],
  timeline: [
    { key: "phase91-birmingham-name-context", title: "Pittsburgh Southside 的 Little Birmingham 名称语境", eventType: "community_event", startDate: "1900", circa: true, description: "品牌官网将名称关联到二十世纪初 Southside 的制造业称呼；这不是 Birmingham Pen Company 的成立年份。", sourceKey: S.story.key },
    { key: "phase91-birmingham-current-workshop", title: "宾夕法尼亚小批量工作室的当前资料窗口", eventType: "design_milestone", startDate: "2026", circa: true, description: "官网当前资料所述的工作室地点与小批量制笔定位；页面访问年份不是品牌成立年份。", sourceKey: S.story.key },
  ],
};

const alumina: CuratedEntityPack = {
  key: "phase91-birmingham-alumina-model-c-v1",
  entityId: PHASE91_ALUMINA_MODEL_C_ID,
  expectedType: "pen",
  expectedSlug: PHASE91_ALUMINA_MODEL_C_SLUG,
  canonicalName: "Birmingham Pen Company Alumina Model-C",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/birmingham-alumina-model-c.md",
  storyTitle: "Birmingham Pen Company Alumina Model-C：铝合金批次笔，不是所有 Model-C 的通用规格",
  primarySourceKey: S.alumina.key,
  depthTier: "A",
  aliases: [
    { alias: "Birmingham Alumina", language: "en", sourceKey: S.alumina.key },
    { alias: "Birmingham Alumina Model-C", language: "en", sourceKey: S.alumina.key },
    { alias: "Birmingham Model-C Alumina", language: "en", sourceKey: S.alumina.key },
    { alias: "伯明翰 Alumina Model-C", language: "zh", sourceKey: S.alumina.key },
  ],
  sources: [S.alumina, S.converter, S.story, S.modelA, S.aluminaSvg],
  scopes: [{ key: penScope, scopeKey: penScope, productionState: "current", editionScope: "当前官网 Alumina 铝合金 Model-C；笔尖选项、库存和批次以当期页面为准，历史树脂或其它材料不混入。" }],
  claims: [
    { key: "phase91-alumina-identity", predicate: "model_identity", objectText: "Alumina Model-C 是 Birmingham Pen Company 当前的铝合金 Model-C 版本：铝合金 CNC 加工、螺旋帽可套帽、German #6 nib 和随笔附带的 converter；它不是所有历史 Model-C 的统称。", factClass: "core", confidence: 0.99, sourceKey: S.alumina.key, locator: "Alumina product description and technical specs", evidence: [{ key: "phase91-alumina-identity-evidence", sourceKey: S.alumina.key, scopeKey: penScope, locator: "aluminum body, Model-C technical specs and included converter" }] },
    { key: "phase91-alumina-boundary", predicate: "version_boundary", objectText: "Alumina 的 141.8/154.2/124.4 mm、31/20 g 和不建议滴灌的限制只属于当前铝合金版本；早期树脂 Model-A 或其它 Birmingham 材料、笔形和用户体验都不能回填。", factClass: "core", confidence: 0.99, sourceKey: S.modelA.key, locator: "historical Model-A as separate pen", evidence: [{ key: "phase91-alumina-boundary-primary", sourceKey: S.alumina.key, scopeKey: penScope, locator: "Alumina technical specs and metal-care limit" }, { key: "phase91-alumina-boundary-secondary", sourceKey: S.modelA.key, scopeKey: penScope, locator: "2018 resin Model-A review" }] },
    { key: "phase91-alumina-care", predicate: "maintenance_boundary", objectText: "使用 converter；换墨时清水吸排并晾干，及时擦去接触金属表面的墨水。因长期接触墨水可能腐蚀铝合金，官方强烈不建议 eyedropper conversion；螺纹、笔尖或转换器异常时不要强拆。", factClass: "core", confidence: 0.99, sourceKey: S.alumina.key, locator: "metal corrosion and eyedropper warning", evidence: [{ key: "phase91-alumina-care-evidence", sourceKey: S.alumina.key, scopeKey: penScope, locator: "prolonged ink contact and cleaning instruction" }] },
  ],
  variants: [
    { key: "phase91-alumina-current-run", name: "当前 Alumina 标准批次", releaseYear: "2026 资料窗口", productCode: "PN100974", notes: "现行产品页规格锚点；笔尖选项和库存为页面访问时的批次信息，不生成独立型号。", sourceKey: S.alumina.key, variantKind: "market_sku" },
    { key: "phase91-alumina-nib-options", name: "当前 German #6 nib 选项", releaseYear: "按当期页面", notes: "EF、F、M、B、stub 和部分镀金选项是同一 Alumina 型号的笔尖配置，不把每个尖号建立第二笔。", sourceKey: S.alumina.key, variantKind: "nib" },
  ],
  spec: {
    brandEntityId: PHASE91_BIRMINGHAM_BRAND_ID,
    values: {
      series_name: "Birmingham Pen Company Alumina Model-C",
      release_year: "当前批次；首发年份待可靠档案补证",
      origin_country: "美国宾夕法尼亚加工、装配与包装；官网同时说明供墨系统来自德国，不能简称为全零件美国制造",
      nib: "German size #6；具体 EF/F/M/B/stub 或镀金选项按当期页面",
      fill_system: "随笔附带的 removable standard-international converter；不建议 eyedropper conversion",
      material: "亚光铝合金笔杆、握位、笔帽和帽顶；钢笔夹",
      dimensions: "盖帽 141.8 mm；去帽 124.4 mm；套帽 154.2 mm；最大笔杆径约 13.4 mm",
      weight: "全重约 31 g；去帽约 20 g",
      status: "现行小批量产品；库存、交期与笔尖配置按当期官方页面",
    },
    evidence: [
      evidence("brand_entity_id", "phase91-alumina-brand", S.alumina.key, penScope, "official maker and product page"),
      evidence("series_name", "phase91-alumina-series", S.alumina.key, penScope, "Alumina product title and Model-C technical specs"),
      evidence("release_year", "phase91-alumina-release", S.alumina.key, penScope, "current product availability; no initial-release inference"),
      evidence("origin_country", "phase91-alumina-origin", S.alumina.key, penScope, "Pennsylvania machining and German ink system statement"),
      evidence("nib", "phase91-alumina-nib", S.alumina.key, penScope, "German size #6 and current option list"),
      evidence("fill_system", "phase91-alumina-fill", S.alumina.key, penScope, "included converter and eyedropper warning"),
      evidence("material", "phase91-alumina-material", S.alumina.key, penScope, "aluminum alloy machining description"),
      evidence("dimensions", "phase91-alumina-dimensions", S.alumina.key, penScope, "technical specs"),
      evidence("weight", "phase91-alumina-weight", S.alumina.key, penScope, "technical specs"),
      evidence("status", "phase91-alumina-status", S.alumina.key, penScope, "current product page and batch wording"),
    ],
  },
  media: [{ key: "phase91-alumina-media", title: "Birmingham Alumina Model-C 结构事实卡（非产品照片）", sourceKey: S.aluminaSvg.key, localPath: S.aluminaSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不表示真实颜色、比例、刻字、库存或笔尖配置。", sourceUrl: S.aluminaSvg.url, usageStatus: "primary" }],
  timeline: [{ key: "phase91-alumina-current-sku", title: "Alumina Model-C 的当前官网资料窗口", eventType: "model_released", startDate: "2026", circa: true, description: "当前产品页可见的 PN100974 与规格；访问年份不被写成型号首发年份。", sourceKey: S.alumina.key }],
};

export const phase91BirminghamAluminaPacks = [brand, alumina];
