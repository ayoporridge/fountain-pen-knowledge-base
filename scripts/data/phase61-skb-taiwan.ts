import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

export const PHASE61_SKB_BRAND_ID = "z6qsxNL0PAj8";
export const PHASE61_MIXED_PEN_ID = "6K7UhGOj7VrS";
export const PHASE61_RS301N_ID = "s61SKBRS301N";
export const PHASE61_ES520_ID = "s61SKBES520";
export const PHASE61_RS301N_SLUG = "skb-rs-301n";
export const PHASE61_ES520_SLUG = "skb-es-520";
export const PHASE61_MIXED_OLD_SLUG = "skb派顿-f10-f21";

const RETRIEVED = "2026-07-20";

function live(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.url,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase61",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase61",
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

const SOURCES = {
  about: live({
    key: "phase61-skb-official-about",
    title: "SKB 文明钢笔：关于我们",
    url: "https://www.skb.com.tw/pages/%E9%97%9C%E6%96%BC%E6%88%91%E5%80%91",
    registryKey: "skb-official-phase61",
    registryName: "SKB 文明钢笔",
    sourceType: "official",
    tier: "primary",
    summary: "官方时间线区分 1955 年公司正式立名、1959 年首支自有品牌 830、1960 年 22 型、1963 年自制笔尖、1970 年金尖与 2012 年台湾制钢笔重启。",
    locator: "about timeline: 1955, 1959 830, 1960 Type 22, 1963 nib making, 1970 gold nibs and 2012 restart",
  }),
  catalogue: live({
    key: "phase61-skb-official-fine-writing-catalogue",
    title: "SKB 官方精品钢笔目录",
    url: "https://www.skb.com.tw/product/category%26path%3D26_67",
    registryKey: "skb-catalogue-phase61",
    registryName: "SKB 文明钢笔官方目录",
    sourceType: "official",
    tier: "contemporary_archive",
    summary: "当前目录列出 RS、ES、TM 等台湾 SKB 精品钢笔 SKU；图案、礼盒与书写工具不自动等于独立钢笔型号。",
    locator: "current fine-writing catalogue, RS/ES/TM product grouping",
  }),
  huashan: live({
    key: "phase61-skb-huashan-writing-memory",
    title: "华山 1914：SKB 书写记忆",
    url: "https://www.huashan1914.com/w/huashan1914/creative_19081517492906027",
    registryKey: "huashan1914-phase61",
    registryName: "华山 1914",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "台湾文化访谈把 SKB 的 830、22 型、毕业奖品记忆和 2012 年钢笔生产线重启放回台湾书写文化语境。",
    locator: "SKB 830, Type 22, writing-memory interview and 2012 restart context",
  }),
  rs301n: live({
    key: "phase61-skb-rs301n-official",
    title: "SKB RS-301N 黄铜袖珍钢笔",
    url: "https://www.skb.com.tw/product/product%26product_id%3D301",
    registryKey: "skb-rs301n-phase61",
    registryName: "SKB RS-301N 官方产品页",
    sourceType: "official",
    tier: "primary",
    summary: "官方 SKU 列 RS-301N 文创系列、M 尖、黄铜、总长约 12 cm、专用黄铜吸墨器一支与台湾制造。",
    locator: "product title, model, M nib, brass, ±12 cm, dedicated brass converter and Taiwan origin",
  }),
  pocketPen: live({
    key: "phase61-skb-rs301n-pocket-pen-chronicle",
    title: "Pocket Pen Chronicle：SKB RS-301N Kano 特别版",
    url: "https://pocketpenchronicle.com/skb-rs-301nkano-200ks-k-b-rs-301n-brass-pocket-pen-lemmings-200k-special-edition/",
    registryKey: "pocket-pen-chronicle-phase61",
    registryName: "Pocket Pen Chronicle",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "爱好者文章记录 RS-301N/Kano 相关特别版和历史 SKB 视觉资料；特别版外观与配件不替代普通 SKU 规格。",
    locator: "RS-301N/Kano special-edition context and version boundary",
  }),
  es520: live({
    key: "phase61-skb-es520-official",
    title: "SKB ES-520 黑琵永续钢笔组（书法尖）",
    url: "https://www.skb.com.tw/ES-520-%E9%BB%91%E7%90%B5%E6%B0%B8%E7%BA%8C%E9%8B%BC%E7%AD%86%E7%B5%84%E3%80%90%E6%9B%B8%E6%B3%95%E5%B0%96%E3%80%91",
    registryKey: "skb-es520-phase61",
    registryName: "SKB ES-520 官方产品页",
    sourceType: "official",
    tier: "primary",
    summary: "官方 SKU 列 55 度书法尖、RI-60 卡式墨水、#301A 吸墨器、环保回收料、总长约 13.8 cm、随附耗材和台湾制造。",
    locator: "product title, 55-degree calligraphy nib, RI-60, #301A, recycled material, ±13.8 cm and package",
  }),
  ink: live({
    key: "phase61-skb-ri60-official",
    title: "SKB RI-60 欧规卡式墨水",
    url: "https://www.skb.com.tw/product/product%26product_id%3D326",
    registryKey: "skb-ri60-phase61",
    registryName: "SKB RI-60 官方产品页",
    sourceType: "official",
    tier: "contemporary_archive",
    summary: "官方 RI-60 页为 ES-520 商品页所列卡式墨水提供耗材目录交叉线索；兼容性仍以具体型号页为准。",
    locator: "RI-60 cartridge product and compatible fountain-pen catalogue context",
  }),
  brandSvg: diagram("phase61-skb-brand-svg", "SKB 台湾品牌与型号边界事实图", "/images/library/site-original/skb-taiwan/brand.svg", "本站原创事实图，区分台湾 SKB 时间线、RS-301N、ES-520 与未证实 Penton/F 系列。"),
  rsSvg: diagram("phase61-skb-rs301n-svg", "SKB RS-301N 事实图", "/images/library/site-original/skb-taiwan/rs-301n.svg", "本站原创事实图，表现 RS-301N 黄铜、M 尖、约 12 cm 与专用黄铜吸墨器边界。"),
  esSvg: diagram("phase61-skb-es520-svg", "SKB ES-520 事实图", "/images/library/site-original/skb-taiwan/es-520.svg", "本站原创事实图，表现 ES-520 书法尖、约 55 度角度、RI-60/#301A 与约 13.8 cm 边界。"),
};

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makePen(input: {
  key: string;
  id: string;
  slug: string;
  name: string;
  title: string;
  markdownFile: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  additional: CuratedSource[];
  svg: CuratedSource;
  aliases: string[];
  nib: string;
  fill: string;
  material: string;
  dimensions: string;
  status: string;
  boundary: string;
}): CuratedEntityPack {
  const scopeKey = `${input.key}-current-tw`;
  const sources = [input.primary, input.secondary, ...input.additional, input.svg];
  return {
    key: `phase61-${input.key}-v1`,
    entityId: input.id,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.title,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: input.primary.key })),
    sources,
    scopes: [{ key: scopeKey, scopeKey, productionState: "current", market: "TW", editionScope: "官方当前 SKU；颜色、礼盒、库存和特别版必须逐项核对" }],
    claims: [
      { key: `${input.key}-identity`, predicate: "model_identity", objectText: `${input.name} 是台湾 SKB 的独立当前 SKU，不与其他 RS/ES 型号或来源未明的 Penton/F 系列合并。`, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: "official product title and SKU", evidence: [{ key: `${input.key}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: "official product title and model identity" }] },
      { key: `${input.key}-boundary`, predicate: "version_boundary", objectText: input.boundary, factClass: "core", confidence: 0.97, sourceKey: input.secondary.key, locator: "catalogue or independent model boundary", evidence: [{ key: `${input.key}-boundary-evidence`, sourceKey: input.secondary.key, scopeKey, locator: "sibling, special-edition or consumable boundary" }] },
      { key: `${input.key}-care`, predicate: "maintenance_boundary", objectText: "更换墨水前确认该型号的上墨接口；以清水清洗笔尖、笔舌和吸墨器，避免热水、强溶剂、硬物撬拆与把其他 SKB 型号的耗材兼容性当作本型号事实。", factClass: "core", confidence: 0.96, sourceKey: input.primary.key, locator: "official filling system and product boundary", evidence: [{ key: `${input.key}-care-evidence`, sourceKey: input.primary.key, scopeKey, locator: "official filler and package information" }] },
    ],
    variants: [],
    spec: {
      brandEntityId: PHASE61_SKB_BRAND_ID,
      values: { series_name: input.name, release_year: "当前官方商品页可见；首次发布日期未确认", origin_country: "台湾", nib: input.nib, fill_system: input.fill, material: input.material, dimensions: input.dimensions, status: input.status },
      evidence: [
        evidence("brand_entity_id", `${input.key}-brand`, input.primary.key, scopeKey, "official brand/model identity"),
        evidence("series_name", `${input.key}-series`, input.primary.key, scopeKey, "official model title"),
        evidence("release_year", `${input.key}-release`, input.primary.key, scopeKey, "current product-page availability, not original release date"),
        evidence("origin_country", `${input.key}-origin`, input.primary.key, scopeKey, "official Taiwan origin field"),
        evidence("nib", `${input.key}-nib`, input.primary.key, scopeKey, "official nib description"),
        evidence("fill_system", `${input.key}-fill`, input.primary.key, scopeKey, "official compatible consumables or included filler"),
        evidence("material", `${input.key}-material`, input.primary.key, scopeKey, "official material field"),
        evidence("dimensions", `${input.key}-dimensions`, input.primary.key, scopeKey, "official product dimensions"),
        evidence("status", `${input.key}-status`, input.primary.key, scopeKey, "current official product-page presence"),
      ],
    },
    media: [{ key: `${input.key}-primary-media`, title: `${input.name} 事实卡（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不表现真实比例、颜色、Logo、包装或库存。", sourceUrl: input.svg.url, usageStatus: "primary" }],
    timeline: [{ key: `${input.key}-catalogue-current`, title: `${input.name} 进入当前官方目录`, eventType: "model_released", startDate: "2026", circa: true, description: "2026-07-20 可见官方当前商品页；不把页面可见日期写成首发年份。", sourceKey: input.primary.key }],
  };
}

const brandScope = "skb-brand-current";
const skbBrand: CuratedEntityPack = {
  key: "phase61-skb-brand-v1",
  entityId: PHASE61_SKB_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "skb",
  canonicalName: "SKB 文明钢笔",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/skb-brand.md",
  storyTitle: "SKB 文明钢笔：台湾书写记忆、当前 SKU 与 F 系列身份边界",
  primarySourceKey: SOURCES.about.key,
  depthTier: "A",
  aliases: ["SKB", "SKB 文明钢笔", "文明钢笔", "SKB Writing Instruments"].map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh-hant" : "en", sourceKey: SOURCES.about.key })),
  sources: [SOURCES.about, SOURCES.huashan, SOURCES.catalogue, SOURCES.brandSvg],
  scopes: [{ key: brandScope, scopeKey: brandScope, productionState: "current", market: "TW", editionScope: "台湾 SKB 品牌历史、当前钢笔目录与可确认型号导航" }],
  claims: [
    { key: "skb-brand-identity", predicate: "brand_identity", objectText: "SKB 文明钢笔是台湾书写工具品牌；品牌页只承载其可核实的历史与当前 SKU 导航。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.about.key, locator: "official company and brand history", evidence: [{ key: "skb-brand-identity-evidence", sourceKey: SOURCES.about.key, scopeKey: brandScope, locator: "official about page" }] },
    { key: "skb-brand-history", predicate: "brand_timeline", objectText: "官方时间线区分 1955 公司正式立名、1959 首支自有品牌 830、1960 22 型、1963 自制笔尖、1970 金尖与 2012 台湾制钢笔重启。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.about.key, locator: "official timeline", evidence: [{ key: "skb-brand-history-evidence", sourceKey: SOURCES.about.key, scopeKey: brandScope, locator: "dated official timeline entries" }] },
    { key: "skb-brand-boundary", predicate: "identity_boundary", objectText: "Penton／SIKIB／F10/F21 的生产主体和型号关系尚未获得可发布的一手证据，不能作为台湾 SKB 型号或品牌关系发布。", factClass: "core", confidence: 0.98, sourceKey: SOURCES.huashan.key, locator: "Taiwan SKB historical context contrasted with official current catalogue", evidence: [{ key: "skb-brand-boundary-evidence", sourceKey: SOURCES.catalogue.key, scopeKey: brandScope, locator: "official RS/ES/TM current catalogue boundary" }, { key: "skb-brand-cultural-evidence", sourceKey: SOURCES.huashan.key, scopeKey: brandScope, locator: "independent Taiwan SKB history context" }] },
  ],
  media: [{ key: "skb-brand-primary-media", title: "SKB 品牌导航事实卡（非产品照片）", sourceKey: SOURCES.brandSvg.key, localPath: SOURCES.brandSvg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影或 Logo。", sourceUrl: SOURCES.brandSvg.url, usageStatus: "primary" }],
  timeline: [
    { key: "skb-1955", title: "文明钢笔股份有限公司正式立名", eventType: "brand_founded", startDate: "1955", circa: false, description: "官方时间线将公司正式立名列为 1955 年。", sourceKey: SOURCES.about.key },
    { key: "skb-1959", title: "首支自有品牌 830 钢笔诞生", eventType: "model_released", startDate: "1959", circa: false, description: "830 是品牌历史锚点；规格与变体仍待独立档案。", sourceKey: SOURCES.about.key },
    { key: "skb-2012", title: "重启台湾制钢笔与精品笔系列", eventType: "revival", startDate: "2012", circa: false, description: "官方与华山资料均将 2012 作为钢笔生产线重启节点。", sourceKey: SOURCES.about.key },
  ],
};

export const phase61SkbTaiwanPacks: CuratedEntityPack[] = [
  skbBrand,
  makePen({ key: "skb-rs301n", id: PHASE61_RS301N_ID, slug: PHASE61_RS301N_SLUG, name: "SKB RS-301N", title: "SKB RS-301N：黄铜袖珍笔与专用黄铜吸墨器", markdownFile: ".planning/content-research/skb-rs-301n.md", primary: SOURCES.rs301n, secondary: SOURCES.pocketPen, additional: [SOURCES.catalogue], svg: SOURCES.rsSvg, aliases: ["SKB RS-301N 黄铜袖珍钢笔", "RS-301N 文创系列", "SKB RS301N"], nib: "M 尖；官方页面未列 EF/F/B 等选项", fill: "专用黄铜吸墨器 ×1；不据此推断国际标准墨囊或其他 SKB 吸墨器兼容", material: "黄铜", dimensions: "闭盖总长约 12 cm；开盖、套盖与重量未见官方数值", status: "当前官方目录可见；库存与特别版按具体 SKU 核对", boundary: "本页只指普通 RS-301N 当前 SKU；Kano 等特别版的外观、包装和配件不回填。ES-520、RS-501i 与来源未明的 Penton/F 系列均不是本型号。" }),
  makePen({ key: "skb-es520", id: PHASE61_ES520_ID, slug: PHASE61_ES520_SLUG, name: "SKB ES-520", title: "SKB ES-520：55 度书法尖、RI-60 与 #301A", markdownFile: ".planning/content-research/skb-es-520.md", primary: SOURCES.es520, secondary: SOURCES.huashan, additional: [SOURCES.ink, SOURCES.catalogue], svg: SOURCES.esSvg, aliases: ["SKB ES-520 黑琵永续钢笔组", "ES-520 黑琵书法尖", "SKB ES520"], nib: "书法尖；官方说明约 55 度仰角，垂直较细、倾斜较粗", fill: "RI-60 卡式墨水、#301A 吸墨器；随附卡式墨水 ×1 与吸墨器 ×1", material: "环保回收料；再生比例、认证和耐化学性未列出", dimensions: "总长约 13.8 cm；重量、直径与开盖长度未见官方数值", status: "当前官方目录可见；库存、配色与礼盒内容按具体 SKU 核对", boundary: "ES-520 是书法尖型号，不是普通圆尖的同色版本；RS-301N 的黄铜和专用吸墨器不适用。黑琵主题、包装或其他书写工具不能自动成为新的钢笔型号。" }),
];

export const phase61SkbTaiwanRetire = {
  sourceEntityId: PHASE61_MIXED_PEN_ID,
  sourceSlug: PHASE61_MIXED_OLD_SLUG,
  note: "Mixed SKB/Penton F10/F21 identity is retired without redirect; it must not imply a Taiwan SKB relationship.",
};
