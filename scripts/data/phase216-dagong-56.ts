import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-25";
export const PHASE216_DAGONG_BRAND_ID = "vwSTpWgNYlPe";
export const PHASE216_DAGONG_56_ID = "A8H1NwxfcPhT";
export const PHASE216_DAGONG_56_SLUG = "大公-dagong-56揿动式";
export const PHASE216_DAGONG_SOURCE_KEY = "phase216-dagong-56";

function live(input: {
  key: string;
  title: string;
  url: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
  independenceGroup: string;
}): CuratedSource {
  return {
    ...input,
    registryKey: `${input.key}-registry`,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase216",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase216",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片，不证明真实比例、颜色、Logo、完整厂史、编号或生产批次。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true`,
  };
}

const S = {
  estilofilos: live({
    key: "phase216-dagong-estilofilos",
    title: "Crónicas Estilográficas：Matching (XIX). Dagong 56",
    url: "https://estilofilos.blogspot.com/2016/02/matching-xix-dagong-56.html",
    registryName: "Crónicas Estilográficas / Bruno Taut",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立钢笔资料记录 Wuhan Pen Factory、Dagong 56、1980 年代、按压式伸缩尖、不锈钢笔身、镀金钢尖、内置 aerometric、尺寸和样本做工问题。",
    locator: "Wuhan Pen Factory; Dagong 56 in the 1980s; push button, stainless steel, gold-plated steel nib, integrated aerometric; dimensions and construction observations",
    independenceGroup: "phase216-dagong-estilofilos",
  }),
  laman: live({
    key: "phase216-dagong-laman",
    title: "Laman Fountain Pen：Pen Buatan Negara China",
    url: "https://lamanfountainpen.blogspot.com/2017/03/pen-buatan-negara-china.html",
    registryName: "Laman Fountain Pen / Seele",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "中国老钢笔名录将 Da Gong／Dagong 列为 Wuhan Pen Factory 品牌；同时强调该类小众品牌资料通常有限。",
    locator: "Da Gong, or Dagong - A brand by the Wuhan Pen Factory",
    independenceGroup: "phase216-dagong-laman",
  }),
  brandSvg: diagram("phase216-dagong-brand-svg", "大公 Dagong 品牌与 56 型号关系示意", "/images/library/site-original/phase216/dagong/dagong-brand.svg"),
  modelSvg: diagram("phase216-dagong-56-svg", "大公 Dagong 56 结构示意", "/images/library/site-original/phase216/dagong/dagong-56.svg"),
} as const;

const brandScope = "dagong-brand-scope";
const modelScope = "dagong-56-scope";

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  extra: string[] = [],
): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence: 0.85,
    sourceKey,
    locator,
    evidence: [sourceKey, ...extra].map((evidenceSource, index) => ({
      key: `${key}-evidence-${index + 1}`,
      sourceKey: evidenceSource,
      scopeKey,
      locator,
    })),
  };
}

function specEvidence(fieldKey: SpecFieldKey, sourceKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `dagong-56-${fieldKey}`, fieldKey, sourceKey, scopeKey: modelScope, locator };
}

const brand: CuratedEntityPack = {
  key: "phase216-dagong-brand",
  entityId: PHASE216_DAGONG_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "dagong",
  canonicalName: "大公 Dagong",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/dagong-brand-phase216.md",
  storyTitle: "大公 Dagong：武汉金笔厂资料中的历史品牌与 56 型号",
  primarySourceKey: S.estilofilos.key,
  depthTier: "B",
  aliases: [
    { alias: "Dagong", language: "en", sourceKey: S.estilofilos.key },
    { alias: "Da Gong", language: "en", sourceKey: S.laman.key },
    { alias: "大公", language: "zh", sourceKey: S.laman.key },
    { alias: "武汉大公钢笔", language: "zh", sourceKey: S.estilofilos.key },
  ],
  sources: [S.estilofilos, S.laman, S.brandSvg],
  scopes: [{
    key: brandScope,
    scopeKey: brandScope,
    productionState: "historical",
    editionScope: "历史钢笔资料中的 Dagong／Da Gong 品牌入口；目前只把 56 型号作为已确认导航，不覆盖现代同名科技、仪器或其它企业。",
  }],
  claims: [
    claim("dagong-brand-maker", "brand_identity", "钢笔资料把 Dagong／Da Gong 作为 Wuhan Pen Factory（武汉金笔厂）的品牌，而不是一个可以与所有现代同名公司的名称自动合并的法人实体。", S.estilofilos.key, brandScope, "Wuhan Pen Factory and Dagong brand statement", [S.laman.key]),
    claim("dagong-location", "origin_context", "资料把制造者放在湖北武汉；当前证据支持的是历史钢笔生产语境，不足以补写工厂完整厂址、隶属关系或成立年份。", S.estilofilos.key, brandScope, "Wuhan, Hubei, PR China", [S.laman.key]),
    claim("dagong-56-navigation", "brand_model_family", "Dagong 56 是目前资料最完整、可在品牌页挂出的型号；品牌页不把它扩写成完整目录，也不把 Capless 当作 Dagong 别名。", S.estilofilos.key, brandScope, "Dagong 56 produced during the 1980s", [S.laman.key, S.brandSvg.key]),
    claim("dagong-history-boundary", "historical_boundary", "当前资料只足以确认 1980 年代 Dagong 56 的公开窗口；创办人、产量、商标注册和其它型号仍属于待研究部分。", S.estilofilos.key, brandScope, "1980s production window; no complete catalogue asserted"),
    claim("dagong-name-boundary", "identity_boundary", "现代同名企业或仪器产品没有钢笔实物、包装或档案证据时，不应写成 Dagong 钢笔品牌的延续；名称相同不是生产者相同。", S.laman.key, brandScope, "limited knowledge of small historical marques and maker-specific listing", [S.estilofilos.key]),
    claim("dagong-selection", "selection_guidance", "鉴定旧笔应同时核对 Dagong／大公标识、WUHAN 刻字、56 型号、尾部按键和伸缩尖结构；只凭“武汉”或“国产 Capless”不足以归类。", S.estilofilos.key, brandScope, "shallow WUHAN engraving and push-button structure", [S.laman.key]),
  ],
  variants: [{ key: "dagong-56-family", name: "Dagong 56", notes: "目前资料支持的历史型号；后续颜色和批次只有在获得独立实物证据后再拆分。", sourceKey: S.estilofilos.key, variantKind: "edition_group" }],
  media: [{ key: "dagong-brand-primary", title: S.brandSvg.title, sourceKey: S.brandSvg.key, localPath: S.brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；品牌导航示意，非产品照片，不代表真实比例、颜色、Logo、组织结构或生产批次。", sourceUrl: S.brandSvg.url, usageStatus: "primary" }],
  timeline: [
    { key: "dagong-1980s-window", title: "Dagong 56 进入公开资料的 1980 年代窗口", eventType: "model_released", startDate: "1980", circa: true, description: "独立钢笔资料把 Wuhan Pen Factory 旗下 Dagong 56 放在 1980 年代生产窗口；这不是工厂成立年份。", sourceKey: S.estilofilos.key },
    { key: "dagong-collector-record", title: "Dagong 作为少见历史钢笔进入收藏资料", eventType: "community_event", startDate: "2016", circa: true, description: "2016 年独立文章记录 Dagong 56 的结构、尺寸和停产状态，为品牌—型号导航提供目前最完整的公开证据。", sourceKey: S.estilofilos.key },
  ],
};

const model: CuratedEntityPack = {
  key: PHASE216_DAGONG_SOURCE_KEY,
  entityId: PHASE216_DAGONG_56_ID,
  expectedType: "pen",
  expectedSlug: PHASE216_DAGONG_56_SLUG,
  canonicalName: "大公 Dagong 56",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/dagong-56-phase216.md",
  storyTitle: "大公 Dagong 56：按压式伸缩尖、内置 aerometric 与 1980 年代的武汉线索",
  primarySourceKey: S.estilofilos.key,
  depthTier: "B",
  aliases: [
    { alias: "Dagong 56", language: "en", sourceKey: S.estilofilos.key },
    { alias: "Da Gong 56", language: "en", sourceKey: S.laman.key },
    { alias: "大公 56", language: "zh", sourceKey: S.laman.key },
    { alias: "武汉 56 揿动式钢笔", language: "zh", sourceKey: S.estilofilos.key },
  ],
  sources: [S.estilofilos, S.laman, S.modelSvg],
  scopes: [{
    key: modelScope,
    scopeKey: modelScope,
    productionState: "historical",
    materialScope: "已发表资料所见的不锈钢笔身、黑色滚花塑料握位和镀金钢尖；不将单支样本的表面状态外推为所有批次。",
    editionScope: "Dagong 56；不覆盖其它 Wuhan 品牌、Pilot Capless、现代同名公司或未经证实的颜色／年份 SKU。",
  }],
  claims: [
    claim("dagong-56-identity", "model_identity", "Dagong 56 是与 Wuhan Pen Factory／武汉金笔厂相联系的 1980 年代历史按压式钢笔型号；“国产 Capless”只能描述结构相似性，不能替代型号身份。", S.estilofilos.key, modelScope, "Wuhan Pen Factory, Dagong 56, 1980s", [S.laman.key, S.modelSvg.key]),
    claim("dagong-56-mechanism", "mechanism", "尾部按钮驱动笔尖伸缩，前端有封闭片帮助防止停放时干涸；按钮手感被独立评测为偏硬，需先确认机构完整。", S.estilofilos.key, modelScope, "push button, retractable nib and closing lid", [S.laman.key]),
    claim("dagong-56-material", "material_boundary", "资料记录不锈钢笔身和黑色滚花塑料握位；钢壳表面孔洞或不均匀是被记录的样本做工问题，不是统一外观标准。", S.estilofilos.key, modelScope, "stainless steel body, black knurled plastic grip and construction flaws"),
    claim("dagong-56-nib", "nib_boundary", "笔尖为镀金钢尖，安装在可动作的笔尖单元中；资料没有给出统一尖幅或可互换规格，不创建未经证实的 Fine／Medium 变体。", S.estilofilos.key, modelScope, "gold-plated steel nib operated by rear push button", [S.laman.key]),
    claim("dagong-56-filling", "filling_system", "供墨是集成在笔尖单元内的 aerometric 系统，而不是国际卡水／转换器；老笔应先检查挤压囊和气密性，再低压清洗。", S.estilofilos.key, modelScope, "integrated aerometric filling system in nib unit"),
    claim("dagong-56-dimensions", "dimensions", "独立测量样本闭合 139 mm、打开 144 mm、直径 11 mm；数值用于识别和比较，不承诺所有批次或后配件完全相同。", S.estilofilos.key, modelScope, "length closed 139 mm, open 144 mm, diameter 11 mm"),
    claim("dagong-56-capacity", "capacity", "资料记录干重 16.5 g、墨水容量约 0.7 ml；残墨、腐蚀和替换件会影响二手笔的实际测量。", S.estilofilos.key, modelScope, "dry weight 16.5 g and ink deposit 0.7 ml"),
    claim("dagong-56-quality", "condition_risk", "评测样本的前端开口下缘加工不直，可能磨损 feed；选购时应检查封闭片、开口边缘、按钮回位和钢壳腐蚀，避免强按或自行打磨。", S.estilofilos.key, modelScope, "rough nib mouth and possible feed erosion"),
    claim("dagong-56-care", "maintenance_guidance", "第一次使用先用清水低压冲洗，避免热水、酒精和强溶剂；不熟悉笔尖单元方向时不要强拆，异常漏气或卡滞应交给维修者。", S.estilofilos.key, modelScope, "integrated filler and documented construction risks"),
    claim("dagong-56-selection", "selection_guidance", "选购要同时核对 Dagong／大公、WUHAN、56、按键式伸缩尖和 aerometric 供墨线索；2016 年文章中的 EUR 60–70 只是历史拍卖观察，不是当前报价。", S.estilofilos.key, modelScope, "shallow WUHAN engraving, discontinued collector rarity and dated auction observation", [S.laman.key]),
  ],
  variants: [{ key: "dagong-56-historical", name: "Dagong 56 历史型号", notes: "当前资料未支持按颜色、年份或尖幅拆分 SKU；获得独立实物证据后再扩展。", sourceKey: S.estilofilos.key, variantKind: "edition_group" }],
  spec: {
    brandEntityId: PHASE216_DAGONG_BRAND_ID,
    values: {
      series_name: "Dagong 56",
      release_year: "1980年代（公开资料窗口）",
      origin_country: "中国；资料具体指向湖北武汉的 Wuhan Pen Factory",
      nib: "镀金不锈钢钢尖；尾部按键驱动伸缩",
      fill_system: "笔尖单元内置 aerometric",
      material: "不锈钢笔身；黑色滚花塑料握位",
      dimensions: "闭合 139 mm；打开 144 mm；直径 11 mm（测量样本）",
      weight: "干重 16.5 g（测量样本）",
      price_range: "2016 年独立文章观察拍卖约 EUR 60–70；非当前报价",
      status: "已停产；历史收藏品",
    },
    evidence: [
      specEvidence("brand_entity_id", S.estilofilos.key, "Wuhan Pen Factory under Dagong brand"),
      specEvidence("series_name", S.estilofilos.key, "Dagong 56 model title"),
      specEvidence("release_year", S.estilofilos.key, "produced during the 1980s"),
      specEvidence("origin_country", S.estilofilos.key, "Wuhan, Hubei, PR China"),
      specEvidence("nib", S.estilofilos.key, "gold-plated steel nib and rear push button"),
      specEvidence("fill_system", S.estilofilos.key, "integrated aerometric in nib unit"),
      specEvidence("material", S.estilofilos.key, "stainless steel and black knurled plastic"),
      specEvidence("dimensions", S.estilofilos.key, "139/144 mm and 11 mm sample measurements"),
      specEvidence("weight", S.estilofilos.key, "16.5 g dry sample measurement"),
      specEvidence("price_range", S.estilofilos.key, "dated EUR 60–70 auction observation"),
      specEvidence("status", S.estilofilos.key, "no longer in production; collector rarity"),
    ],
  },
  media: [{ key: "dagong-56-primary", title: S.modelSvg.title, sourceKey: S.modelSvg.key, localPath: S.modelSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；结构示意，非产品照片，不代表真实比例、颜色、内腔、Logo、编号或生产批次。", sourceUrl: S.modelSvg.url, usageStatus: "primary" }],
  timeline: [{ key: "dagong-56-production", title: "Dagong 56 的 1980 年代生产窗口", eventType: "model_released", startDate: "1980", circa: true, description: "独立钢笔资料把该型号放在 Wuhan Pen Factory 的 1980 年代产品窗口；具体首发年份未知。", sourceKey: S.estilofilos.key }],
};

export const phase216Dagong56Packs: CuratedEntityPack[] = [brand, model];
