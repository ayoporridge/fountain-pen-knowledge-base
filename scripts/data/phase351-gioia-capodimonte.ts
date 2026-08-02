import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-02";
export const PHASE351_GIOIA_BRAND_ID = "phase351-gioia-brand";
export const PHASE351_CAPODIMONTE_ID = "phase351-gioia-capodimonte-kawari";
export const PHASE351_CAPODIMONTE_SLUG = "gioia-capodimonte-kawari";
const BRAND_SCOPE = "Gioia Pen Italia modern Neapolitan workshop, brand history, material and supplier boundaries";
const MODEL_SCOPE = "Gioia Capodimonte Kawari cigar-shaped route, trim variants, JoWo nib, piston filling and sample measurements";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.independenceGroup,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase351",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase351",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }],
  };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const home = web({
  key: "gioia-official-home",
  title: "Gioia Pen Italia official home and brand story",
  url: "https://www.gioiapen.com/en",
  registryKey: "gioia-official-home-phase351",
  registryName: "Gioia Pen Italia official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "gioia-official-home-phase351",
  summary: "官方首页写 Fabio Cervasio、资深工匠、2014 技术实验室、2020 自有品牌，以及意大利树脂、ebonite、celluloid 实心棒材手工车削。",
  locator: "Gioia Italia history and workshop materials",
});

const nibs = web({
  key: "gioia-official-nibs",
  title: "Gioia official Our Nibs",
  url: "https://www.gioiapen.com/en/our-nibs",
  registryKey: "gioia-official-nibs-phase351",
  registryName: "Gioia Pen Italia official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "gioia-official-nibs-phase351",
  summary: "官方说明 Gioia 设计自有尖面图案，并在 Berlin 与 JoWo Berliner Schreibfeder GmbH 讨论后委托生产；不扩写成整笔德国制造。",
  locator: "Gioia nib design and JoWo production paragraph",
});

const kawari = web({
  key: "gioia-official-kawari",
  title: "Gioia official Capodimonte Kawari ST",
  url: "https://www.gioiapen.com/en/prodotto/fountain-pen-capodimonte-kawari-st/",
  registryKey: "gioia-official-kawari-phase351",
  registryName: "Gioia Pen Italia official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "gioia-official-kawari-phase351",
  summary: "官方 Kawari 页确认 Capodimonte 首款雪茄形路线、Kawari 第一款、逐支编号、fine resin、JoWo #6 steel EF/F/M/B/Stub、rhodium 和后盲帽 piston；当前标缺货。",
  locator: "Kawari identity, nib options, trim and filling mechanism",
});

const penchalet = web({
  key: "gioia-penchalet",
  title: "Pen Chalet Kawari / Gold trim",
  url: "https://www.penchalet.com/fine_pens/fountain_pens/gioia_pen_italia_capodimonte_fountain_pens/Kawari%2B~%2BGold%2Btrim/",
  registryKey: "pen-chalet-gioia-kawari-phase351",
  registryName: "Pen Chalet",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "pen-chalet-gioia-kawari-phase351",
  summary: "专业零售页交叉记录 resin、gold/silver plated trim、Gioia embossed #6 JoWo stainless、piston，并给出 144/154.4/135 mm、14/16/12 mm、36 g 页面测量值。",
  locator: "Kawari description and product specifications table",
});

const video = web({
  key: "gioia-penchalet-video",
  title: "PenChalet video：Meet the Gioia Capodimonte Kawari",
  url: "https://www.youtube.com/watch?v=6muVprBmCV4",
  registryKey: "pen-chalet-gioia-kawari-video-phase351",
  registryName: "PenChalet",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pen-chalet-gioia-kawari-video-phase351",
  summary: "独立演示视频把 Capodimonte 作为 Gioia 首款雪茄形笔，展示金／银 trim 与 #6 stainless JoWo piston route；体验不普遍化。",
  locator: "video description and Capodimonte introduction",
});

const galen = web({
  key: "gioia-galen",
  title: "Galen Leather Gioia fountain pens",
  url: "https://www.galenleather.com/collections/gioia-fountain-pens",
  registryKey: "galen-leather-gioia-phase351",
  registryName: "Galen Leather",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "galen-leather-gioia-phase351",
  summary: "零售品牌导航列出 Metis、Capodimonte、Bellavista、Alleria 和 Partenope，并把 Gioia 放在 Naples hand-turned、年轻但有工匠经验的路线。",
  locator: "brand overview and model navigation",
});

const svg = diagram("gioia-capodimonte-svg", "Gioia Capodimonte Kawari structure and supplier boundary factual diagram", "/images/library/site-original/phase351/gioia/capodimonte-kawari.svg");

const brand: CuratedEntityPack = {
  key: "phase351-gioia-brand-v1",
  entityId: PHASE351_GIOIA_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "gioia",
  canonicalName: "Gioia Pen Italia 乔亚",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/quick/260802-gioia-capodimonte/brand.md",
  storyTitle: "Gioia Pen Italia：那不勒斯工坊把树脂、尖和名字重新组合",
  primarySourceKey: home.key,
  depthTier: "A",
  aliases: [
    { alias: "Gioia Pen Italia", language: "en", sourceKey: home.key },
    { alias: "GIOIA writing emotion", language: "en", sourceKey: home.key },
    { alias: "Gioia 乔亚钢笔", language: "zh", sourceKey: galen.key },
  ],
  sources: [home, nibs, kawari, penchalet, video, galen, svg],
  scopes: [{ key: BRAND_SCOPE, scopeKey: BRAND_SCOPE, productionState: "current", editionScope: "Gioia Pen Italia modern brand and collection navigation; Metis, Alleria, Partenope, Bellavista, Capodimonte and Sephora remain separate routes." }],
  claims: [
    claim("gioia-origin", "brand_history", "官方把 Gioia 归于 Fabio Cervasio 的构想和资深工匠合作；技术实验室与工坊自 2014 年起生产，2020 年推出自有品牌。", home.key, BRAND_SCOPE, "official history since 2014 and 2020"),
    claim("gioia-workshop", "manufacturing_scope", "官方称工坊手工车削意大利树脂、ebonite、celluloid 等实心棒材，并配合国际机制、尖和 refill；不把每个组件都写成 Gioia 自制。", home.key, BRAND_SCOPE, "workshop material and component boundary"),
    claim("gioia-nibs", "nib_supplier", "Gioia 设计自有尖面图案，官方说明曾在 Berlin 与 JoWo Berliner Schreibfeder GmbH 讨论并委托生产；JoWo 尖的生产不等于整支笔德国制造。", nibs.key, BRAND_SCOPE, "Gioia nib design and JoWo production"),
    claim("gioia-navigation", "brand_model_navigation", "Gioia 导航包含 Metis、Alleria、Partenope、Bellavista、Capodimonte 和 Sephora；不同外形、供墨和树脂版本按具体型号核对。", galen.key, BRAND_SCOPE, "retailer collection navigation"),
    claim("gioia-secondary", "professional_secondary_boundary", "PenChalet 的独立演示把 Capodimonte 作为 Gioia 首款雪茄形笔，并交叉呈现 #6 stainless JoWo 与 piston route；演示不替其它系列提供规格。", video.key, BRAND_SCOPE, "Capodimonte video description and brand boundary"),
    claim("gioia-italian-boundary", "origin_boundary", "Naples／Arzano 工坊支持意大利制造语境，但官方没有发布覆盖树脂、金属件、活塞和 JoWo 尖的统一产地表。", home.key, BRAND_SCOPE, "Arzano workshop and international components"),
    claim("gioia-availability", "availability_boundary", "官方 Kawari 页当前标缺货，零售库存和价格会变化；缺货不等于 Gioia 停产，库存也不写成稀有度。", kawari.key, BRAND_SCOPE, "current product availability marker", "editorial"),
    claim("gioia-care", "maintenance_guidance", "树脂、镀层、JoWo 尖和 piston 需要分别维护；品牌页提供工坊和尖的边界，不把某一型号的清洗步骤扩大成全品牌标准。", nibs.key, BRAND_SCOPE, "component-specific care boundary", "editorial"),
  ],
  variants: [{ key: "gioia-collections", name: "Metis / Alleria / Partenope / Bellavista / Capodimonte / Sephora", notes: "品牌与零售导航中的系列入口；颜色、trim、尖和供墨按型号页分别核对。", sourceKey: galen.key, variantKind: "edition_group", market: "global" }],
  timeline: [
    { key: "gioia-2014", title: "技术实验室与手工工坊开始生产", eventType: "brand_founded", startDate: "2014", circa: false, description: "官方首页把 2014 作为 Gioia Pen Italia 开始设计、工程和生产书写工具的年份。", sourceKey: home.key },
    { key: "gioia-2020", title: "Gioia 以自有品牌面向世界", eventType: "design_milestone", startDate: "2020", circa: false, description: "官方首页说 2020 年 Gioia Pen Italia 决定以自身品牌被世界看见；这不是所有型号的上市年份。", sourceKey: home.key },
    { key: "gioia-kawari", title: "Capodimonte Kawari 作为首款雪茄形路线", eventType: "model_released", startDate: "2020", circa: true, description: "官方产品页把 Capodimonte 说成首款 cigar-shaped，Kawari 为该路线第一款；页面未给独立上市年份。", sourceKey: kawari.key },
  ],
  media: [{ key: "gioia-brand-svg", title: "Gioia 与 Capodimonte Kawari 工艺关系事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

const model: CuratedEntityPack = {
  key: "phase351-gioia-capodimonte-kawari-v1",
  entityId: PHASE351_CAPODIMONTE_ID,
  expectedType: "pen",
  expectedSlug: PHASE351_CAPODIMONTE_SLUG,
  canonicalName: "Gioia Capodimonte Kawari",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/gioia-capodimonte-kawari-phase351.md",
  storyTitle: "Gioia Capodimonte Kawari：那不勒斯工坊把第一支雪茄形笔做成了什么",
  primarySourceKey: kawari.key,
  depthTier: "A",
  aliases: [
    { alias: "Capodimonte Kawari ST", language: "en", sourceKey: kawari.key },
    { alias: "Gioia Capodimonte Fountain Pen", language: "en", sourceKey: penchalet.key },
    { alias: "Gioia Capodimonte Kawari 乔亚卡波迪蒙特", language: "zh", sourceKey: kawari.key },
  ],
  sources: [home, nibs, kawari, penchalet, video, svg],
  scopes: [{ key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, productionState: "current", materialScope: "Fine resin body with metal parts; trim is recorded as rhodium/silver or gold plated by page, not as a universal alloy recipe.", nibScope: "Customized Gioia-design #6 JoWo steel nib; official options EF/F/M/B/Stub 1.1/Stub 1.5.", editionScope: "Capodimonte Kawari route; ST and gold/silver trim are variants, not separate model identities." }],
  claims: [
    claim("kawari-identity", "model_identity", "Capodimonte 是 Gioia 首款 cigar-shaped fountain pen，Kawari 是该路线第一款；官方产品页称每支单独编号。", kawari.key, MODEL_SCOPE, "official model identity and individually numbered wording"),
    claim("kawari-name", "naming", "Capodimonte 名称来自那不勒斯山区／博物馆语境，Kawari 是日语中表示变化、差异或独特状态的词；命名不等于材料来源。", kawari.key, MODEL_SCOPE, "official naming explanation"),
    claim("kawari-material", "material", "官方写 fine resin 与 metal parts，细节为 rhodium plated；零售页补充 gold/silver plated trim，需按 ST／GT 变体核对。", kawari.key, MODEL_SCOPE, "official material and rhodium details"),
    claim("kawari-nib", "nib", "Kawari 使用 Gioia 图案的 customized JoWo #6 steel nib；官方列 EF、F、M、B、Stub 1.1、Stub 1.5，不能填入未经页面确认的金尖。", kawari.key, MODEL_SCOPE, "official nib options"),
    claim("kawari-fill", "filling_system", "供墨为 piston filling system，从尾端 blind cap 进入；不要把其它 Gioia 型号的 cartridge/converter 结构套进 Kawari。", kawari.key, MODEL_SCOPE, "official filling mechanism"),
    claim("kawari-measurements", "physical_specification", "Pen Chalet 页面测量值为闭帽 144.0、后插 154.4、笔身 135.0 mm，桶径 14.0、帽径 16.0、握位 12.0 mm，重量 36.0 g；对象和版本仍需核对。", penchalet.key, MODEL_SCOPE, "product specifications table"),
    claim("kawari-trims", "variant_boundary", "Kawari 的 ST／rhodium/silver 与 gold trim 是同一路线饰件变体；不按 trim 创建第二个型号。", penchalet.key, MODEL_SCOPE, "gold/silver trim product family"),
    claim("kawari-posting", "physical_feature", "Pen Chalet 页面写 Kawari 可后插、螺纹帽约 1.25 圈；这是零售页面规格，不代表所有特殊树脂版本的统一测量。", penchalet.key, MODEL_SCOPE, "posting, threaded cap and cap rotations"),
    claim("kawari-secondary", "professional_secondary_boundary", "PenChalet 独立演示交叉确认 Capodimonte 的雪茄形、#6 stainless JoWo 与 piston 路线；视频没有提供独立总限量或所有版本尺寸。", video.key, MODEL_SCOPE, "Capodimonte video description and scope boundary"),
    claim("kawari-availability", "availability", "官方页面当前显示 Kawari ST 缺货；缺货是访问时状态，不等于 Capodimonte 或 Gioia 停产。", kawari.key, MODEL_SCOPE, "official out-of-stock marker", "editorial"),
    claim("kawari-care", "maintenance_guidance", "活塞要用室温清水排空和冲洗，树脂与镀层避免研磨剂、酒精和长时间浸泡；尾端卡滞或漏墨交给维修者。", video.key, MODEL_SCOPE, "conservative piston and surface-care guidance", "editorial"),
    claim("kawari-buying", "selection_guidance", "购买核对 Capodimonte Kawari 名称、ST／gold trim、尖幅、逐支编号、页面测量状态与实时库存，不把商品图或价格当成固定规格。", penchalet.key, MODEL_SCOPE, "variant, measurement and stock boundary", "editorial"),
  ],
  variants: [
    { key: "kawari-trim", name: "Kawari ST / rhodium or silver trim / gold trim", notes: "同一 Capodimonte Kawari 路线的饰件页面命名；材质和颜色按单支商品核对。", sourceKey: kawari.key, variantKind: "material", market: "global" },
    { key: "kawari-nibs", name: "EF / F / M / B / Stub 1.1 / Stub 1.5", notes: "官方列出的 #6 steel 尖幅选项；零售下拉可能只展示部分库存。", sourceKey: kawari.key, variantKind: "nib", market: "global" },
    { key: "kawari-numbered", name: "Individually numbered", notes: "逐支编号是收藏和维修记录线索，不是公开的总限量数量。", sourceKey: kawari.key, variantKind: "edition_group", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE351_GIOIA_BRAND_ID,
    values: {
      series_name: "Capodimonte Kawari",
      release_year: "官方称 Capodimonte 首款雪茄形、Kawari 第一款；独立上市年份未公布",
      origin_country: "意大利那不勒斯／Arzano 工坊语境；JoWo #6 尖由德国 JoWo 生产",
      nib: "Customized Gioia-design JoWo #6 stainless steel; EF/F/M/B/Stub 1.1/Stub 1.5",
      fill_system: "Piston filler accessed by unscrewing the rear blind cap",
      material: "Fine resin body and metal parts; rhodium/silver or gold plated trim by variant",
      dimensions: "Pen Chalet page: capped 144.0 mm, posted 154.4 mm, body 135.0 mm; diameters 14.0/16.0/12.0 mm",
      weight: "Pen Chalet page: 36.0 g; measurement/sample scope not independently specified",
      status: "Current model route; official Kawari ST page showed out of stock on 2026-08-02, not a discontinuation claim",
    },
    evidence: [
      evidence("kawari-brand", "brand_entity_id", home.key, MODEL_SCOPE, "Gioia brand story"),
      evidence("kawari-series", "series_name", kawari.key, MODEL_SCOPE, "Capodimonte Kawari ST title"),
      evidence("kawari-release", "release_year", kawari.key, MODEL_SCOPE, "first cigar-shaped and first Kawari wording without year"),
      evidence("kawari-origin", "origin_country", home.key, MODEL_SCOPE, "Arzano/Naples workshop and international component boundary"),
      evidence("kawari-nib-spec", "nib", kawari.key, MODEL_SCOPE, "official JoWo #6 steel nib options"),
      evidence("kawari-fill-spec", "fill_system", kawari.key, MODEL_SCOPE, "rear blind-cap piston"),
      evidence("kawari-material-spec", "material", kawari.key, MODEL_SCOPE, "fine resin, metal parts and rhodium"),
      evidence("kawari-dimensions", "dimensions", penchalet.key, MODEL_SCOPE, "Pen Chalet specifications table"),
      evidence("kawari-weight", "weight", penchalet.key, MODEL_SCOPE, "Pen Chalet 36.0 g table value"),
      evidence("kawari-status", "status", kawari.key, MODEL_SCOPE, "official out-of-stock marker and availability boundary"),
    ],
  },
  timeline: [{ key: "kawari-route", title: "Capodimonte Kawari 首款雪茄形路线", eventType: "model_released", startDate: "2020", circa: true, description: "官方称 Capodimonte 是 Gioia 首款 cigar-shaped fountain pen、Kawari 是第一款；未发布独立上市年份，2020 只对应品牌自有品牌时间线。", sourceKey: kawari.key }],
  media: [{ key: "kawari-svg", title: "Capodimonte Kawari 结构与供应商边界事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase351GioiaCapodimontePacks: CuratedEntityPack[] = [brand, model];
