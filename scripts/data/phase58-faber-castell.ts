import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";

export const PHASE58_FABER_BRAND_ID = "xVHzH0mMviM4";
export const PHASE58_AMBITION_ID = "FBaxbvx7xTbo";
export const PHASE58_EMOTION_ID = "HhQgvkpTJhEc";
export const PHASE58_ONDORO_ID = "wMSXKOxA9s2X";
export const PHASE58_CLASSIC_ID = "iDvM2_w62N0C";
export const PHASE58_NEO_SLIM_ID = "O4AI01LTE75r";
export const PHASE58_LOOM_ID = "TDLhXLvIOq6p";

const RETRIEVED = "2026-07-19";

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
    registryKey: "fountain-pen-graph-editorial-phase58",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase58",
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

const brandOfficial = live({
  key: "phase58-faber-brand-official",
  title: "Faber-Castell official About Us",
  url: "https://fabercastell.com/pages/about-us",
  registryKey: "faber-castell-official-phase58",
  registryName: "Faber-Castell official",
  sourceType: "official",
  tier: "primary",
  summary: "官方 About Us 资料把公司历史锚定在 1761 年 Stein，并说明其从铅笔和绘写材料延伸到现代 Fine Writing 产品。",
  locator: "company history, Stein origin and writing-instrument context",
});
const products = live({
  key: "phase58-faber-products-official",
  title: "Faber-Castell Fine Writing products",
  url: "https://www.faber-castell.com/products",
  registryKey: "faber-castell-products-phase58",
  registryName: "Faber-Castell official product catalogue",
  sourceType: "official",
  tier: "contemporary_archive",
  summary: "官方产品导航当前分列 Ambition、e-motion、Essentio、HEXO、NEO Slim、Ondoro 等 Fine Writing 系列；颜色和库存按地区变化。",
  locator: "Fine Writing product-line navigation and current series separation",
});
const faq = live({
  key: "phase58-faber-care-faq",
  title: "Faber-Castell fountain pen FAQ",
  url: "https://www.faber-castell.com/service/frequently-asked-questions/faq-fountain-pens",
  registryKey: "faber-castell-care-phase58",
  registryName: "Faber-Castell care guidance",
  sourceType: "official",
  tier: "primary",
  summary: "官方 FAQ 说明墨囊、converter、换色清洗和温水冲洗原则；页面不把热水、酒精或洗剂写成通用保养方案。",
  locator: "fountain-pen cleaning, cartridge and converter guidance",
});
const brandSecondary = live({
  key: "phase58-faber-brand-penhero",
  title: "PenHero Faber-Castell fountain pen reference",
  url: "https://www.penhero.com/PenGallery/FaberCastell/FaberCastell.htm",
  registryKey: "penhero-faber-castell-phase58",
  registryName: "PenHero",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "钢笔资料站的品牌与系列条目用于交叉核对 Faber-Castell Fine Writing 的型号边界；不替代官方当前目录和 SKU 规格。",
  locator: "Faber-Castell pen family reference and model boundaries",
});
const gvfcSeries = live({
  key: "phase58-gvfc-classic-series",
  title: "Graf von Faber-Castell Classic series",
  url: "https://www.graf-von-faber-castell.com/series/classic",
  registryKey: "graf-von-faber-castell-classic-phase58",
  registryName: "Graf von Faber-Castell official",
  sourceType: "official",
  tier: "primary",
  summary: "Graf von Faber-Castell 官方系列页把 Classic 与普通 Faber-Castell 产品线分开，并列出贵重木材、铂金和纯银路线。",
  locator: "Classic series identity and material variants",
});
const gvfcProduct = live({
  key: "phase58-gvfc-classic-platinum",
  title: "Graf von Faber-Castell Classic platinum-plated fountain pen",
  url: "https://www.graf-von-faber-castell.us/products/FountainpenClassicplatinumplatedEF/145562",
  registryKey: "graf-von-faber-castell-product-phase58",
  registryName: "Graf von Faber-Castell official product",
  sourceType: "official",
  tier: "primary",
  summary: "官方铂金 Classic 商品页给出约 137 mm、13 mm、37 g、手工双色 18K 尖、EF/F/M/B/OM/OB 和 converter 体系。",
  locator: "platinum-plated Classic dimensions, weight, nib and filling",
});
const gvfcGuide = live({
  key: "phase58-gvfc-fountain-pen-guide",
  title: "Graf von Faber-Castell Fountain Pen Guide",
  url: "https://www.graf-von-faber-castell.com/fountain-pen-guide",
  registryKey: "graf-von-faber-castell-care-phase58",
  registryName: "Graf von Faber-Castell care guidance",
  sourceType: "official",
  tier: "contemporary_archive",
  summary: "官方指南说明 Graf von Faber-Castell 钢笔的 converter、清洁和高端材料保养边界。",
  locator: "converter, cleaning and material care guidance",
});

const productSources: Record<string, CuratedSource[]> = {
  ambition: [live({
    key: "phase58-faber-ambition-official",
    title: "Faber-Castell Ambition stainless steel fountain pen",
    url: "https://www.faber-castell.com/products/AmbitionStainlessSteelfountainpenFsilver/148391",
    registryKey: "faber-castell-ambition-phase58",
    registryName: "Faber-Castell Ambition official product",
    sourceType: "official",
    tier: "primary",
    summary: "官方 Ambition 页面确认细长设计、不锈钢尖、cartridge/converter 与材料路线；尖号和附件以具体货号为准。",
    locator: "Ambition stainless steel product identity, nib and filling",
  }), live({
    key: "phase58-faber-ambition-anniversary",
    title: "Ambition 20th anniversary official feature",
    url: "https://www.faber-castell.com/fields-of-competence/fine-writing/ambition/ambition-anniversary-edition",
    registryKey: "faber-castell-ambition-history-phase58",
    registryName: "Faber-Castell Ambition official history",
    sourceType: "official",
    tier: "contemporary_archive",
    summary: "官方周年专题提供 Ambition 系列约 2005 年起的时间线线索，并把 Blue Wood 等限量色与系列身份分开。",
    locator: "20th anniversary chronology and material variants",
  }), brandSecondary],
  emotion: [live({
    key: "phase58-faber-emotion-official",
    title: "Faber-Castell e-motion official series",
    url: "https://www.faber-castell.com/products/e-motion",
    registryKey: "faber-castell-emotion-phase58",
    registryName: "Faber-Castell e-motion official product",
    sourceType: "official",
    tier: "primary",
    summary: "官方系列页确认 e-motion 的 bulbous shape、弹簧夹、木材、树脂与金属路线；它与 Ambition 是不同比例。",
    locator: "e-motion family identity and material variants",
  }), live({
    key: "phase58-faber-emotion-pure-black",
    title: "e-motion Pure Black official product",
    url: "https://www.faber-castell.com/products/emotionPureBlackfountainpenEFblack/148622",
    registryKey: "faber-castell-emotion-pure-black-phase58",
    registryName: "Faber-Castell e-motion Pure Black",
    sourceType: "official",
    tier: "primary",
    summary: "官方 Pure Black 页补充阳极氧化/黑色 PVD 表面、黑色不锈钢尖和 cartridge/converter 语境。",
    locator: "Pure Black surface, nib and filling details",
  }), live({
    key: "phase58-faber-emotion-review",
    title: "SBREBrown e-motion Pure Silver review",
    url: "https://www.sbrebrown.com/2020/11/faber-castell-e-motion-pure-silver-fountain-pen-review/",
    registryKey: "sbrebrown-emotion-phase58",
    registryName: "SBREBrown",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "专业评测只用于交叉理解 Pure Silver 的重量与握持体验，不替代官方系列规格，也不泛化到所有 finish。",
    locator: "review sample handling and material observations",
  })],
  ondoro: [live({
    key: "phase58-faber-ondoro-official",
    title: "Faber-Castell Ondoro official series",
    url: "https://www.faber-castell.com/products/ondoro",
    registryKey: "faber-castell-ondoro-phase58",
    registryName: "Faber-Castell Ondoro official product",
    sourceType: "official",
    tier: "primary",
    summary: "官方 Ondoro 系列页确认六角高光树脂笔身和 graphite black/smoked oak 等材料边界。",
    locator: "Ondoro family identity and material variants",
  }), live({
    key: "phase58-faber-ondoro-graphite",
    title: "Ondoro graphite black official product",
    url: "https://www.faber-castell.com/products/OndorographiteblackfountainpenEFblack/147812",
    registryKey: "faber-castell-ondoro-graphite-phase58",
    registryName: "Faber-Castell Ondoro graphite black",
    sourceType: "official",
    tier: "primary",
    summary: "官方 graphite black 页列不锈钢 EF/F/M/B、cartridge/converter 与树脂笔身；不把烟熏橡木重量套过来。",
    locator: "graphite black nib and filling details",
  }), live({
    key: "phase58-faber-ondoro-drop",
    title: "Drop Ondoro material measurements",
    url: "https://drop.com/buy/faber-castell-ondoro/details?mode=shop_open",
    registryKey: "drop-ondoro-phase58",
    registryName: "Drop product measurements",
    sourceType: "retailer",
    tier: "retailer",
    summary: "零售页面提供树脂与 smoked oak 样本的长度和重量测量；本站明确标注为单品实测，不当作官方统一规格。",
    locator: "sample measurements for resin and smoked oak finishes",
  }), brandSecondary],
  neoSlim: [live({
    key: "phase58-faber-neo-slim-official",
    title: "Faber-Castell NEO Slim aluminium official product",
    url: "https://www.faber-castell.com/products/PlumaNeoSlimAlumniumverdeB/146153",
    registryKey: "faber-castell-neo-slim-phase58",
    registryName: "Faber-Castell NEO Slim official product",
    sourceType: "official",
    tier: "primary",
    summary: "官方欧洲产品页确认 NEO Slim 是细身铝制系列，配不锈钢尖和 cartridge/converter；它不属于 Graf von Faber-Castell。",
    locator: "NEO Slim aluminium identity, material and filling",
  }), live({
    key: "phase58-faber-neo-slim-us",
    title: "Faber-Castell NEO Slim Olive Green US product",
    url: "https://fabercastell.com/products/fountain-pen-olive-green-neo-slim",
    registryKey: "faber-castell-neo-slim-us-phase58",
    registryName: "Faber-Castell US product",
    sourceType: "official",
    tier: "contemporary_archive",
    summary: "美国官方页面列出 Olive Green 的 M/F/EF/B、黑色钢尖、弹簧夹和墨囊；Sold Out 只代表地区库存。",
    locator: "Olive Green nib options, clip, cartridge and regional stock",
  }), brandSecondary],
  loom: [live({
    key: "phase58-faber-loom-official",
    title: "Faber-Castell LOOM official fountain pen catalogue",
    url: "https://www.faber-castell.com/products/loom/24-24-11-fountain-pen",
    registryKey: "faber-castell-loom-phase58",
    registryName: "Faber-Castell LOOM official product",
    sourceType: "official",
    tier: "primary",
    summary: "官方 LOOM fountain pen 过滤页仍列 Metallic/Gunmetal 等 finish 和 EF/F/M/B；圆珠与滚珠兄弟分开。",
    locator: "LOOM fountain pen product-line filter and nib widths",
  }), live({
    key: "phase58-faber-loom-review",
    title: "The Pen Addict Faber-Castell Loom review",
    url: "https://www.penaddict.com/blog/faber-castell-loom-fountain-pen-review",
    registryKey: "pen-addict-loom-phase58",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "专业评测记录样本的金属笔杆、较宽握位、钢尖和短墨囊附件；体验只代表样本，不替代官方规格。",
    locator: "review sample grip, nib and included cartridge observations",
  })],
  classic: [gvfcSeries, gvfcProduct, gvfcGuide, brandSecondary],
};

const SVG = {
  brand: diagram("phase58-faber-brand-svg", "Faber-Castell Fine Writing 系列边界事实图", "/images/library/site-original/faber-castell/brand.svg", "本站原创事实图，区分普通 Fine Writing 与 Graf von Faber-Castell 高端线。"),
  ambition: diagram("phase58-faber-ambition-svg", "Ambition 材料与细长笔杆事实图", "/images/library/site-original/faber-castell/ambition.svg", "本站原创事实图，表现 Ambition 直筒比例和不锈钢、树脂、木杆 variant。"),
  emotion: diagram("phase58-faber-emotion-svg", "e-motion 粗壮笔杆与材料事实图", "/images/library/site-original/faber-castell/e-motion.svg", "本站原创事实图，表现 e-motion bulbous shape、弹簧夹和木材/金属分支。"),
  ondoro: diagram("phase58-faber-ondoro-svg", "Ondoro 六角树脂与烟熏橡木事实图", "/images/library/site-original/faber-castell/ondoro.svg", "本站原创事实图，区分 graphite black 树脂与 smoked oak，不表现真实产品照片。"),
  neoSlim: diagram("phase58-faber-neo-slim-svg", "NEO Slim 细身铝杆事实图", "/images/library/site-original/faber-castell/neo-slim.svg", "本站原创事实图，表现普通 Faber-Castell NEO Slim 的铝杆、黑尖和可套尾帽。"),
  loom: diagram("phase58-faber-loom-svg", "LOOM finish 与钢尖事实图", "/images/library/site-original/faber-castell/loom.svg", "本站原创事实图，区分 LOOM fountain pen 与 Metallic/Gunmetal/Piano finish。"),
  classic: diagram("phase58-gvfc-classic-svg", "Graf von Faber-Castell Classic 高端线事实图", "/images/library/site-original/faber-castell/graf-classic.svg", "本站原创事实图，表现 Classic 的贵重材料、18K 尖和 converter 边界。"),
};

type PenInput = {
  key: string;
  entityId: string;
  slug: string;
  name: string;
  markdownFile: string;
  title: string;
  series: string;
  summaryStatus: string;
  sourceList: CuratedSource[];
  svg: CuratedSource;
  aliases: string[];
  material: string;
  nib: string;
  fill: string;
  dimensions: string;
  variants: CuratedEntityPack["variants"];
  boundary: string;
};

function makePenPack(input: PenInput): CuratedEntityPack {
  const primary = input.sourceList[0]!;
  const secondary = input.sourceList.find((source) => source.tier === "professional_secondary") ?? input.sourceList[1] ?? primary;
  const sources = [...input.sourceList, faq, input.svg].filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index);
  return {
    key: `phase58-${input.key}-v1`,
    entityId: input.entityId,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    markdownFile: input.markdownFile,
    storyTitle: input.title,
    primarySourceKey: primary.key,
    depthTier: "A",
    aliases: [input.name, ...input.aliases].map((alias) => ({ alias, language: alias === input.name ? "en" : "zh", sourceKey: primary.key })),
    sources,
    scopes: [{ key: input.key, scopeKey: input.key, productionState: "current", materialScope: input.material }],
    claims: [
      {
        key: `${input.key}-identity`,
        predicate: "series_identity",
        objectText: `${input.name} 是 ${input.series} 系列；颜色、材料和尖号属于 variant，不应混成其他辉柏嘉型号。`,
        factClass: "core",
        confidence: 0.98,
        sourceKey: primary.key,
        locator: "official product or series identity",
        evidence: [{ key: `${input.key}-identity-evidence`, sourceKey: primary.key, scopeKey: input.key, locator: "official product identity and series boundary" }],
      },
      {
        key: `${input.key}-boundary`,
        predicate: "version_boundary",
        objectText: input.boundary,
        factClass: "core",
        confidence: 0.96,
        sourceKey: secondary.key,
        locator: "official sibling or professional secondary boundary",
        evidence: [{ key: `${input.key}-boundary-evidence`, sourceKey: secondary.key, scopeKey: input.key, locator: "variant, sibling or sample-scope boundary" }],
      },
      {
        key: `${input.key}-care`,
        predicate: "care_guidance",
        objectText: "换色或久置前以室温温水冲洗笔尖和 converter，清澈后彻底干燥；不把热水、酒精或洗剂当作通用保养。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: faq.key,
        locator: "Faber-Castell fountain pen FAQ",
        evidence: [{ key: `${input.key}-care-evidence`, sourceKey: faq.key, scopeKey: input.key, locator: "cleaning and converter guidance" }],
      },
    ],
    variants: input.variants,
    spec: {
      brandEntityId: PHASE58_FABER_BRAND_ID,
      values: {
        series_name: input.series,
        release_year: "现代 Fine Writing 产品线；具体颜色和货号按官方目录核对",
        origin_country: "德国品牌；具体制造地按产品货号和包装核对",
        nib: input.nib,
        fill_system: input.fill,
        material: input.material,
        dimensions: input.dimensions,
        status: input.summaryStatus,
      },
      evidence: [
        { key: `${input.key}-spec-brand`, fieldKey: "brand_entity_id", sourceKey: primary.key, scopeKey: input.key, locator: "official product brand and Faber-Castell series identity" },
        { key: `${input.key}-spec-series`, fieldKey: "series_name", sourceKey: primary.key, scopeKey: input.key, locator: "official series name and product navigation" },
        { key: `${input.key}-spec-release`, fieldKey: "release_year", sourceKey: secondary.key, scopeKey: input.key, locator: "series chronology or current catalogue boundary" },
        { key: `${input.key}-spec-origin`, fieldKey: "origin_country", sourceKey: primary.key, scopeKey: input.key, locator: "brand/product origin context; exact manufacturing place remains SKU-scoped" },
        { key: `${input.key}-spec-material`, fieldKey: "material", sourceKey: primary.key, scopeKey: input.key, locator: "official material and product description" },
        { key: `${input.key}-spec-nib`, fieldKey: "nib", sourceKey: primary.key, scopeKey: input.key, locator: "official nib and filling description" },
        { key: `${input.key}-spec-fill`, fieldKey: "fill_system", sourceKey: primary.key, scopeKey: input.key, locator: "official cartridge/converter or product page" },
        { key: `${input.key}-spec-dimensions`, fieldKey: "dimensions", sourceKey: secondary.key, scopeKey: input.key, locator: "version-scoped dimensions or explicit no-generalization boundary" },
        { key: `${input.key}-spec-status`, fieldKey: "status", sourceKey: secondary.key, scopeKey: input.key, locator: "current catalogue or sample-status boundary" },
      ],
    },
    media: [{ key: `${input.key}-primary-media`, title: `${input.name} 事实图（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影，不表现真实比例、颜色、Logo、刻字或制造地。", sourceUrl: input.svg.url, usageStatus: "primary" }],
  };
}

const brandPack: CuratedEntityPack = {
  key: "phase58-faber-brand-v1",
  entityId: PHASE58_FABER_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "faber-castell",
  canonicalName: "辉柏嘉 Faber-Castell",
  markdownFile: ".planning/content-research/faber-castell-brand.md",
  storyTitle: "从 Stein 铅笔制造到 Fine Writing：Faber-Castell 的钢笔分线",
  primarySourceKey: brandOfficial.key,
  depthTier: "A",
  aliases: [{ alias: "Faber-Castell", language: "en", sourceKey: brandOfficial.key }, { alias: "辉柏嘉", language: "zh", sourceKey: brandOfficial.key }],
  sources: [brandOfficial, products, faq, brandSecondary, SVG.brand],
  scopes: [{ key: "faber-brand-scope", scopeKey: "faber-castell", productionState: "current" }],
  claims: [
    { key: "faber-brand-origin", predicate: "brand_origin", objectText: "官方资料把 Faber-Castell 企业历史锚定在 1761 年德国 Stein 的铅笔制造，并延伸到现代绘写和 Fine Writing。", factClass: "core", confidence: 0.99, sourceKey: brandOfficial.key, locator: "About Us company history", evidence: [{ key: "faber-origin-evidence", sourceKey: brandOfficial.key, scopeKey: "faber-brand-scope", locator: "1761 Stein origin and writing materials" }] },
    { key: "faber-brand-lines", predicate: "product_line_boundary", objectText: "Ambition、e-motion、Ondoro、NEO Slim、LOOM 与 Graf von Faber-Castell Classic 是不同系列；材料、尖号、重量和图片不可跨系列复制。", factClass: "core", confidence: 0.98, sourceKey: products.key, locator: "Fine Writing product navigation", evidence: [{ key: "faber-lines-evidence", sourceKey: products.key, scopeKey: "faber-brand-scope", locator: "separate product-line navigation" }] },
    { key: "faber-brand-secondary-boundary", predicate: "model_family_boundary", objectText: "PenHero 的资料条目可作为历史与型号边界的独立交叉参考；当前颜色、附件和库存仍以官方目录为准。", factClass: "core", confidence: 0.9, sourceKey: brandSecondary.key, locator: "PenHero Faber-Castell family reference", evidence: [{ key: "faber-secondary-evidence", sourceKey: brandSecondary.key, scopeKey: "faber-brand-scope", locator: "independent model-family reference" }] },
  ],
  timeline: [
    { key: "faber-1761", title: "Stein 的铅笔制造起点", eventType: "brand_founded", startDate: "1761", circa: false, description: "官方公司历史以 1761 年 Stein 的铅笔制造为 Faber-Castell 的企业起点。", sourceKey: brandOfficial.key },
    { key: "faber-modern-fine-writing", title: "Fine Writing 产品线分化", eventType: "design_milestone", startDate: "现代", circa: true, description: "现代目录把 Ambition、e-motion、Ondoro、NEO Slim、LOOM 等作为不同产品线维护。", sourceKey: products.key },
  ],
  spec: { brandEntityId: PHASE58_FABER_BRAND_ID, values: { series_name: "Faber-Castell Fine Writing", release_year: "1761 起", origin_country: "德国", status: "普通 Fine Writing 与 Graf von Faber-Castell 高端线分开导航" }, evidence: [{ key: "faber-spec-brand", fieldKey: "brand_entity_id", sourceKey: brandOfficial.key, scopeKey: "faber-brand-scope", locator: "Faber-Castell official brand identity" }, { key: "faber-spec-series", fieldKey: "series_name", sourceKey: products.key, scopeKey: "faber-brand-scope", locator: "Fine Writing product navigation" }, { key: "faber-spec-release", fieldKey: "release_year", sourceKey: brandOfficial.key, scopeKey: "faber-brand-scope", locator: "1761 company history" }, { key: "faber-spec-origin", fieldKey: "origin_country", sourceKey: brandOfficial.key, scopeKey: "faber-brand-scope", locator: "Stein company history" }, { key: "faber-spec-status", fieldKey: "status", sourceKey: products.key, scopeKey: "faber-brand-scope", locator: "current product-line navigation" }] },
  media: [{ key: "faber-brand-primary-media", title: "Faber-Castell Fine Writing 系列边界事实图（非产品照片）", sourceKey: SVG.brand.key, localPath: SVG.brand.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制官方摄影。", sourceUrl: SVG.brand.url, usageStatus: "primary" }],
};

export const phase58FaberCastellPacks: CuratedEntityPack[] = [
  brandPack,
  makePenPack({ key: "ambition", entityId: PHASE58_AMBITION_ID, slug: "faber-castell-ambition", name: "Faber-Castell Ambition", markdownFile: ".planning/content-research/faber-castell-ambition.md", title: "Ambition：材料设计优先的细长直筒笔", series: "Ambition", summaryStatus: "官方 Fine Writing 目录仍可见；颜色、木材、尖号和附件按 SKU/地区变化", sourceList: productSources.ambition, svg: SVG.ambition, aliases: ["辉柏嘉 Ambition 雄心"], material: "拉丝不锈钢、珍贵树脂、梨木/其他木材、All Black", nib: "不锈钢尖；EF/F/M/B 依具体货号", fill: "cartridge/converter；附件依具体货号", dimensions: "细长直筒；不把单一版本实测泛化", variants: [{ key: "ambition-stainless", name: "Ambition Stainless Steel", notes: "拉丝不锈钢笔杆；官方产品页的具体尖号和附件以货号为准。", sourceKey: productSources.ambition[0]!.key, variantKind: "material" }, { key: "ambition-wood", name: "Ambition wood variants", notes: "梨木、核桃木、椰木及限量木杆属于材料 variant，不另立系列。", sourceKey: productSources.ambition[1]!.key, variantKind: "material" }], boundary: "Ambition 的木杆、树脂、金属和 All Black 是同一系列的材料/表面 variant；不应与 e-motion、Ondoro 或 NEO Slim 合并。" }),
  makePenPack({ key: "emotion", entityId: PHASE58_EMOTION_ID, slug: "faber-castell-e-motion", name: "Faber-Castell e-motion", markdownFile: ".planning/content-research/faber-castell-e-motion.md", title: "e-motion：粗壮比例与材料触感的 Fine Writing 系列", series: "e-motion", summaryStatus: "官方仍维护 e-motion 产品线；颜色、表面处理和附件依地区 SKU", sourceList: productSources.emotion, svg: SVG.emotion, aliases: ["辉柏嘉 e-motion 尚品", "Faber-Castell E-Motion"], material: "染色梨木、珍贵树脂、Pure Black/Pure Silver 金属表面", nib: "不锈钢尖；EF/F/M/B 依具体产品页；Pure Black 可为黑色涂层尖", fill: "cartridge/converter", dimensions: "粗壮近雪茄形；重量因木材、树脂、金属和是否含帽而变", variants: [{ key: "emotion-pure-black", name: "e-motion Pure Black", notes: "黑色金属表面与黑尖属于外观/涂层边界，不证明软弹。", sourceKey: productSources.emotion[1]!.key, variantKind: "material" }, { key: "emotion-wood", name: "e-motion wood", notes: "木杆是天然材料 variant，不能套用金属样本重量。", sourceKey: productSources.emotion[0]!.key, variantKind: "material" }], boundary: "e-motion 是粗壮 bulbous shape 系列，与细长 Ambition、六角 Ondoro 分开；Pure Black/Pure Silver 与木杆是材料 variant。" }),
  makePenPack({ key: "ondoro", entityId: PHASE58_ONDORO_ID, slug: "faber-castell-ondoro", name: "Faber-Castell Ondoro", markdownFile: ".planning/content-research/faber-castell-ondoro.md", title: "Ondoro：六角树脂与烟熏橡木的材料分界", series: "Ondoro", summaryStatus: "官方目录仍列 graphite black；smoked oak 和旧色按地区库存/历史记录核对", sourceList: productSources.ondoro, svg: SVG.ondoro, aliases: ["辉柏嘉 Ondoro 极致", "Faber-Castell Ondoro smoked oak"], material: "六角高光树脂/珍贵树脂与 smoked oak 烟熏橡木", nib: "不锈钢 EF/F/M/B；具体货号可能固定宽度", fill: "cartridge/converter", dimensions: "树脂与木杆样本长度/重量不同，具体数字按来源 scope", variants: [{ key: "ondoro-graphite", name: "Ondoro graphite black", notes: "树脂版；官方页面列不锈钢尖和 cartridge/converter。", sourceKey: productSources.ondoro[1]!.key, variantKind: "material" }, { key: "ondoro-smoked-oak", name: "Ondoro smoked oak", notes: "烟熏橡木版；零售商尺寸重量为单品实测，不回填树脂版。", sourceKey: productSources.ondoro[2]!.key, variantKind: "material" }], boundary: "Ondoro 的六角树脂和 smoked oak 共享系列轮廓但不共享材料、重量、照片和维护；旧色不能自动当现行目录。" }),
  makePenPack({ key: "neo-slim", entityId: PHASE58_NEO_SLIM_ID, slug: "faber-castell-neo-slim", name: "Faber-Castell NEO Slim", markdownFile: ".planning/content-research/faber-castell-neo-slim.md", title: "NEO Slim：普通 Faber-Castell 的细身铝杆路线", series: "NEO Slim", summaryStatus: "欧洲目录仍有 NEO Slim；美国个别颜色 Sold Out 只代表地区库存", sourceList: productSources.neoSlim, svg: SVG.neoSlim, aliases: ["辉柏嘉 Neo Slim", "伯爵翎尚 Neo Slim"], material: "阳极氧化铝笔身与金属夹；Olive Green、black、silver/rose 等 finish", nib: "黑色不锈钢尖；EF/F/M/B 依地区产品页", fill: "cartridge/converter；部分包装附 royal blue 墨囊", dimensions: "细身轻量；具体尺寸/附件按颜色和地区货号核对", variants: [{ key: "neo-slim-olive", name: "NEO Slim Olive Green", notes: "美国官方列 EF/F/M/B 和墨囊；Sold Out 不等于全球停产。", sourceKey: productSources.neoSlim[1]!.key, variantKind: "color", market: "US" }], boundary: "NEO Slim 属普通 Faber-Castell，不属于 Graf von Faber-Castell；颜色是 finish，不应与 Ambition 或 GvFC Classic 共用身份和图片。" }),
  makePenPack({ key: "loom", entityId: PHASE58_LOOM_ID, slug: "faber-castell-loom", name: "Faber-Castell LOOM", markdownFile: ".planning/content-research/faber-castell-loom.md", title: "LOOM：金属表面与钢尖体验的入门进阶线", series: "LOOM", summaryStatus: "官方目录仍列部分 Metallic/Gunmetal fountain pen；涂层和地区库存变化较快", sourceList: productSources.loom, svg: SVG.loom, aliases: ["辉柏嘉 Loom 如恩"], material: "金属笔身与塑料/树脂部件；Metallic、Gunmetal、Piano finish", nib: "不锈钢 EF/F/M/B；产品页面可能固定具体宽度", fill: "cartridge/converter；部分包装只附短墨囊", dimensions: "金属版握区和重量因 finish/附件而变，按具体 SKU 核对", variants: [{ key: "loom-metallic", name: "LOOM Metallic", notes: "Metallic finish；官方 fountain pen 过滤页仍列部分颜色。", sourceKey: productSources.loom[0]!.key, variantKind: "color" }, { key: "loom-gunmetal", name: "LOOM Gunmetal", notes: "Gunmetal matt/shiny 是表面路线，不与圆珠或滚珠兄弟合并。", sourceKey: productSources.loom[0]!.key, variantKind: "color" }], boundary: "LOOM 的 Metallic/Gunmetal/Piano 是 finish；钢笔、圆珠和滚珠是不同书写模式，不能共享机制、图片或规格。" }),
  makePenPack({ key: "classic", entityId: PHASE58_CLASSIC_ID, slug: "graf-von-faber-castell-classic", name: "Graf von Faber-Castell Classic", markdownFile: ".planning/content-research/graf-von-faber-castell-classic.md", title: "Graf von Faber-Castell Classic：贵重材料与 18K 尖的高端线", series: "Graf von Faber-Castell Classic", summaryStatus: "Graf von Faber-Castell 高端 Classic 系列；材质、尖号、重量和供货按 SKU 区分", sourceList: productSources.classic, svg: SVG.classic, aliases: ["辉柏嘉 伯爵经典", "Graf Classic"], material: "贵重木材、platinum-plated、925 sterling silver 等路线", nib: "手工双色 18K 金尖带 iridium tip；EF/F/M/B/OM/OB 依具体产品页", fill: "cartridge/converter；铂金商品页注明 converter included", dimensions: "铂金样本约 137 mm × 13 mm、37 g；不复制到木杆/纯银", variants: [{ key: "classic-platinum", name: "Classic platinum-plated", notes: "官方样本约 137×13 mm、37 g；只绑定铂金产品页。", sourceKey: productSources.classic[1]!.key, variantKind: "material" }, { key: "classic-wood", name: "Classic precious wood", notes: "Macassar、Grenadilla、Pernambuco、Ebony 等木材是独立 finish，纹理和重量按货号核对。", sourceKey: productSources.classic[0]!.key, variantKind: "material" }], boundary: "Classic 属 Graf von Faber-Castell 高端线；不与普通 Faber-Castell Ambition/NEO Slim 共用钢尖、重量、上墨说明或图片。" }),
];

export const phase58FaberCastellPenIds = [PHASE58_AMBITION_ID, PHASE58_EMOTION_ID, PHASE58_ONDORO_ID, PHASE58_CLASSIC_ID, PHASE58_NEO_SLIM_ID, PHASE58_LOOM_ID] as const;
