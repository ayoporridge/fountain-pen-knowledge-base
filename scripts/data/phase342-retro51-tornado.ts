import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-02";
export const PHASE342_RETRO51_BRAND_ID = "phase342-retro51";
export const PHASE342_RETRO51_BRAND_SLUG = "retro-51";
export const PHASE342_RETRO51_IDS = {
  series: "phase342-retro51-tornado-fountain-pen",
  jefferson: "phase342-retro51-tornado-jefferson",
} as const;
export const PHASE342_RETRO51_SLUGS = {
  series: "retro-51-tornado-fountain-pen",
  jefferson: "retro-51-tornado-jefferson",
} as const;

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
  itemType?: string;
  group?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.group ?? input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: input.itemType ?? "web_page",
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
    registryKey: "fountain-pen-graph-editorial-phase342",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase342",
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
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1200x720`,
  };
}

const story = web({
  key: "phase342-retro51-official-story",
  title: "Retro 51 official Our Story",
  url: "https://retro51.com/pages/our-story",
  registryKey: "retro51-official-story-phase342",
  registryName: "Retro 51 official",
  sourceType: "official",
  tier: "primary",
  summary: "官方 Our Story 记录 Tornado 在 1997 年以红、蓝、绿 rollerball 推出，后来扩展为 rollerball、fountain、ballpoint 与 mechanical pencil，并以 2022 年回顾 25 周年。",
  locator: "1997 Tornado launch, later writing modes and 2022 25th anniversary",
});

const collection = web({
  key: "phase342-retro51-official-collection",
  title: "Retro 51 official Tornado Fountain Pens collection",
  url: "https://retro51.com/collections/tornado-fountain-pens",
  registryKey: "retro51-official-fountain-collection-phase342",
  registryName: "Retro 51 official",
  sourceType: "official",
  tier: "primary",
  summary: "官方钢笔集合说明两支国际墨囊或一个 converter 的供墨框架，随笔提供两者，并列 German steel nib 与 EF/F/M/1.1mm/1.5mm 尖幅及多条主题路线。",
  locator: "collection description, nib widths and Classic/Stealth/Literary/material family list",
});

const jeffersonPage = web({
  key: "phase342-retro51-official-jefferson",
  title: "Retro 51 official Tornado Fountain Pen Jefferson",
  url: "https://retro51.com/products/tornado-foutain-pen-jefferson",
  registryKey: "retro51-official-jefferson-phase342",
  registryName: "Retro 51 official",
  sourceType: "official",
  tier: "primary",
  summary: "官方 Jefferson 商品页记录 antique silver over acid-etched barrel、antique silver trims、滚花旋盖、JoWo #6 不锈钢尖、国际墨囊／converter、137/125.9 mm、13 mm、34 g 与一年有限质保。",
  locator: "Jefferson product description, SKU options, measurements and warranty",
});

const faq = web({
  key: "phase342-retro51-official-faq",
  title: "Retro 51 official Frequently Asked Questions",
  url: "https://retro51.com/pages/frequently-asked-questions",
  registryKey: "retro51-official-faq-phase342",
  registryName: "Retro 51 official",
  sourceType: "official",
  tier: "primary",
  summary: "官方 FAQ 说明 Tornado 的圆柱金属 barrel、knurled twist top、不同书写模式、可更换 refill 和一年有限质保，用于品牌与维护边界。",
  locator: "Tornado definition, refill replacement and one-year warranty",
});

const nibs = web({
  key: "phase342-retro51-official-nibs",
  title: "Retro 51 official replacement nibs",
  url: "https://retro51.com/collections/replacement-nibs",
  registryKey: "retro51-official-nibs-phase342",
  registryName: "Retro 51 official",
  sourceType: "official",
  tier: "primary",
  summary: "官方 replacement nibs 页面把 German-made JoWo No.6 stainless nib 与 Tornado Fountain Pen（2018+）兼容关系写明，并列 fountain-to-rollerball converter kit。",
  locator: "JoWo No.6 stainless replacement nib compatibility from 2018 and converter kit",
});

const penAddict = web({
  key: "phase342-retro51-penaddict",
  title: "The Pen Addict：new Retro 51 Tornado Fountain Pen review",
  url: "https://www.penaddict.com/blog/2019/8/5/retro-51-tornado-fountain-pen-new-model-review",
  registryKey: "penaddict-retro51-phase342",
  registryName: "The Pen Addict",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "独立评测以样本讨论新款 JoWo、握位和平衡；用于新旧版本与书写体验边界，不外推每个主题或年份。",
  locator: "new model review sample: JoWo nib, grip and balance",
});

const wad = web({
  key: "phase342-retro51-wad",
  title: "Well-Appointed Desk：Retro 51 Tornado Fountain review",
  url: "https://www.wellappointeddesk.com/2019/04/fountain-pen-review-retro-51-tornado-fountain/",
  registryKey: "well-appointed-desk-retro51-phase342",
  registryName: "Well-Appointed Desk",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "独立评测交叉记录新款 JoWo #6 与较早 Schmidt 样本，包含约 32–33 g 的评测测量；仅作样本级版本证据。",
  locator: "new JoWo #6 versus older Schmidt sample and sample weight",
});

const pastor = web({
  key: "phase342-retro51-pastor",
  title: "Pastor and Pen：Retro 51 Fountain Pen review",
  url: "https://www.pastorandpen.com/blog/2019/12/1/retro-51-fountain-pen-review",
  registryKey: "pastor-and-pen-retro51-phase342",
  registryName: "Pastor and Pen",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "独立样本确认 current JoWo 与国际墨囊／converter 使用框架；不将一支评测笔的手感、尺寸或年份外推全系。",
  locator: "current JoWo sample and international cartridge/converter review",
});

const brandSvg = diagram(
  "phase342-retro51-brand-svg",
  "Retro 51 brand and Tornado writing modes factual SVG",
  "/images/library/site-original/phase342/retro51/brand.svg",
  "本站原创 factual SVG；表达 Retro 51、1997 Tornado 与四种书写模式的导航关系。",
);
const seriesSvg = diagram(
  "phase342-retro51-series-svg",
  "Retro 51 Tornado Fountain Pen family factual SVG",
  "/images/library/site-original/phase342/retro51/tornado-fountain-pen.svg",
  "本站原创 factual SVG；表达金属 barrel、滚花旋钮、国际墨囊／converter、German steel nib 与主题集合。",
);
const jeffersonSvg = diagram(
  "phase342-retro51-jefferson-svg",
  "Retro 51 Jefferson identity boundary factual SVG",
  "/images/library/site-original/phase342/retro51/jefferson.svg",
  "本站原创 factual SVG；表达 Jefferson 古银酸蚀 barrel、黄铜握位、JoWo #6 与官方尺寸。",
);

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
) {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }],
  } satisfies CuratedEntityPack["claims"][number];
}

function media(key: string, title: string, source: CuratedSource) {
  return [{
    key,
    title,
    sourceKey: source.key,
    localPath: source.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样。",
    sourceUrl: source.url,
    usageStatus: "primary" as const,
  }];
}

const brandScope = "phase342-retro51-brand";
const brand: CuratedEntityPack = {
  key: "phase342-retro51-brand-v1",
  entityId: PHASE342_RETRO51_BRAND_ID,
  expectedType: "brand",
  expectedSlug: PHASE342_RETRO51_BRAND_SLUG,
  canonicalName: "Retro 51",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/quick/260802-retro51-tornado/brand.md",
  storyTitle: "Retro 51：从 Tornado rollerball 到钢笔家族",
  primarySourceKey: story.key,
  depthTier: "A",
  aliases: [
    { alias: "Retro 51", language: "en", sourceKey: story.key },
    { alias: "Retro 1951", language: "en", sourceKey: faq.key, kind: "alias" },
    { alias: "Retro 51 钢笔", language: "zh", sourceKey: collection.key },
  ],
  sources: [story, collection, faq, nibs, penAddict, wad, pastor, brandSvg],
  scopes: [{ key: brandScope, scopeKey: brandScope, market: "Retro 51 brand and Tornado writing-mode navigation", productionState: "current", editionScope: "品牌页只链接已核对的 Tornado Fountain Pen 系列与 Jefferson；其他主题 SKU 另行展开" }],
  claims: [
    claim("retro51-identity", "brand_identity", "Retro 51 是以 Tornado 为核心产品家族的书写工具品牌；Tornado 既有 rollerball，也有 fountain pen、ballpoint 和 mechanical pencil。", story.key, brandScope, "brand story and writing-mode expansion"),
    claim("retro51-launch", "brand_history", "官方 Our Story 记录 Tornado 于 1997 年以红、蓝、绿三种漆色作为 rollerball 推出，2022 年回顾 25 周年。", story.key, brandScope, "1997 launch and 2022 anniversary"),
    claim("retro51-family", "family_boundary", "官方 FAQ 将 Tornado 置于圆柱金属 barrel 与 knurled twist top 的家族框架；书写模式仍各自使用不同 refill 或 nib。", faq.key, brandScope, "Tornado definition and writing modes"),
    claim("retro51-fountain", "collection_navigation", "官方 Tornado Fountain Pens collection 单独展示钢笔路线，列供墨、German steel nib、尖幅和多个主题／材料集合。", collection.key, brandScope, "fountain pen collection and theme branches"),
    claim("retro51-nib-era", "version_boundary", "官方 replacement nibs 页面把 German-made JoWo No.6 stainless 与 Tornado Fountain Pen（2018+）兼容关系单独列出；它不能覆盖更早 Schmidt 样本。", nibs.key, brandScope, "2018+ replacement compatibility"),
    claim("retro51-maintenance", "maintenance_ecosystem", "官方 FAQ 说明 refill 可更换并提供一年有限质保；不同书写模式的耗材不能互相当作原装内部件。", faq.key, brandScope, "replaceable refill and warranty"),
    claim("retro51-review-boundary", "sample_boundary", "The Pen Addict、Well-Appointed Desk 与 Pastor and Pen 的评测均是独立样本，用于理解新旧尖材与手感差异，不外推全品牌。", penAddict.key, brandScope, "independent sample review boundary"),
  ],
  timeline: [
    { key: "retro51-1997", title: "Tornado rollerball 推出", eventType: "model_released", startDate: "1997", circa: false, description: "官方 Our Story 记录 Tornado 以红、蓝、绿漆色的 rollerball 起步。", sourceKey: story.key },
    { key: "retro51-2022", title: "Tornado 25 周年回顾", eventType: "design_milestone", startDate: "2022", circa: false, description: "官方故事页以 2022 年标记 Tornado 25 周年；不把它当作所有主题 SKU 的首发年。", sourceKey: story.key },
  ],
  media: media("phase342-retro51-brand-media", brandSvg.title, brandSvg),
};

const seriesScope = "phase342-retro51-tornado-series";
const series: CuratedEntityPack = {
  key: "phase342-retro51-tornado-series-v1",
  entityId: PHASE342_RETRO51_IDS.series,
  expectedType: "pen",
  expectedSlug: PHASE342_RETRO51_SLUGS.series,
  canonicalName: "Retro 51 Tornado Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/quick/260802-retro51-tornado/tornado-fountain-pen.md",
  storyTitle: "Retro 51 Tornado Fountain Pen：家族结构与版本边界",
  primarySourceKey: collection.key,
  depthTier: "A",
  aliases: [
    { alias: "Retro 51 Tornado Fountain Pen", language: "en", sourceKey: collection.key },
    { alias: "Tornado fountain pen", language: "en", sourceKey: faq.key },
    { alias: "Retro 51 Tornado 钢笔", language: "zh", sourceKey: collection.key },
  ],
  sources: [story, collection, faq, nibs, penAddict, wad, pastor, seriesSvg],
  scopes: [{ key: seriesScope, scopeKey: seriesScope, market: "Retro 51 Tornado Fountain Pen current family and historical version records", productionState: "current", nibScope: "German steel nib; EF/F/M/1.1 mm/1.5 mm on official collection; 2018+ JoWo No.6 replacement compatibility", materialScope: "cylindrical metal barrel; finish varies by collection and SKU", editionScope: "family navigation only; Classic, Stealth, Elite, Vintage Metalsmiths, Woodworks, Platinum Executive, Rescue, Literary, Poppers and Acrylics remain variant/route boundaries" }],
  claims: [
    claim("tornado-series-identity", "model_identity", "Tornado Fountain Pen 是 Retro 51 的具体钢笔家族导航，而不是某个固定颜色或单一主题 SKU。", collection.key, seriesScope, "official fountain pen family page"),
    claim("tornado-series-fill", "filling_system", "官方集合说明可容纳两支国际墨囊或一个 converter，并随笔提供墨囊与 converter；历史盒装与二手配件仍需单支核对。", collection.key, seriesScope, "cartridge and converter description"),
    claim("tornado-series-nib", "nib", "官方集合列 German steel nib 与 EF、F、M、1.1 mm、1.5 mm 尖幅；具体 SKU 的尖幅不能覆盖全系。", collection.key, seriesScope, "nib material and width list"),
    claim("tornado-series-frame", "construction", "FAQ 将 Tornado 描述为圆柱金属 barrel 与 knurled twist top；finish、主题、木材或透明树脂按 collection 与 SKU 分开。", faq.key, seriesScope, "barrel and twist top family definition"),
    claim("tornado-series-history", "family_history", "Tornado 1997 年先以 rollerball 推出，后来扩展到 fountain pen、ballpoint 与 mechanical pencil；此时间线不等于钢笔首发年。", story.key, seriesScope, "1997 rollerball origin and later modes"),
    claim("tornado-series-jowo", "version_boundary", "官方 replacement nibs 将 German-made JoWo No.6 stainless 与 Tornado Fountain Pen（2018+）兼容；独立评测记录较早 Schmidt 样本。", nibs.key, seriesScope, "2018+ JoWo compatibility and earlier version boundary"),
    claim("tornado-series-themes", "variant_navigation", "Classic Lacquer、Stealth、Elite、Vintage Metalsmiths、Woodworks、Platinum Executive、Rescue、Literary、Poppers、Acrylics 是官方集合分组，具体主题页面要独立核对。", collection.key, seriesScope, "official collection route list"),
    claim("tornado-series-sample", "sample_boundary", "The Pen Addict、Well-Appointed Desk 与 Pastor and Pen 的握位、平衡、重量或手感属于各自样本，不外推所有年份和主题。", penAddict.key, seriesScope, "independent review sample boundary"),
    claim("tornado-series-care", "maintenance_guidance", "换墨时取下墨囊或 converter，以室温清水吸排并自然干燥；漆面、酸蚀金属、木材与透明树脂避免热水、酒精和研磨剂。", faq.key, seriesScope, "conservative care guidance from refill and finish boundary", "editorial"),
    claim("tornado-series-buying", "selection_guidance", "购买时先确认 fountain pen 模式，再核对 collection、主题、尖幅、尖刻字、供墨附件、螺纹和包装；价格、库存与地区配送不作稳定规格。", collection.key, seriesScope, "variant identification and current listing boundary", "editorial"),
  ],
  variants: [
    { key: "tornado-series-classic", name: "Classic Lacquer", notes: "官方集合中的漆面路线；颜色与具体尖幅按 SKU 核对。", sourceKey: collection.key, variantKind: "edition_group" },
    { key: "tornado-series-stealth", name: "Stealth / Elite", notes: "官方集合路线名；不由路线名推断供墨或重量差异。", sourceKey: collection.key, variantKind: "edition_group" },
    { key: "tornado-series-metals", name: "Vintage Metalsmiths / Platinum Executive", notes: "金属主题集合；具体 finish、图案和商品号另行核对。", sourceKey: collection.key, variantKind: "material" },
    { key: "tornado-series-theme", name: "Rescue / Literary / Poppers / Acrylics / Woodworks", notes: "主题或材料导航集合；不把 collection 名称当作单支规格。", sourceKey: collection.key, variantKind: "edition_group" },
    { key: "tornado-series-nibs", name: "EF / F / M / 1.1 mm / 1.5 mm", notes: "官方集合列出的尖幅；2018+ JoWo replacement compatibility 是版本辅助证据。", sourceKey: nibs.key, variantKind: "nib" },
  ],
  spec: {
    brandEntityId: PHASE342_RETRO51_BRAND_ID,
    values: {
      series_name: "Tornado Fountain Pen",
      release_year: "Tornado 1997 年以 rollerball 推出；钢笔 SKU 与 2018+ JoWo 兼容记录按版本核对",
      origin_country: "Retro 51 美国品牌语境；具体制造地按商品、包装与批次核对",
      nib: "German steel nib；EF/F/M/1.1 mm/1.5 mm；2018+ JoWo No.6 replacement route",
      fill_system: "两支国际墨囊或一个 converter；官方集合说明两者随笔提供",
      material: "圆柱金属 barrel；漆面、酸蚀金属、木材、透明树脂按 SKU 变化",
      dimensions: "官方选定家族页未给全系列统一长度、直径和重量；具体 SKU 单独记录",
      weight: "官方选定家族页未给全系列统一克重；独立评测样本不可外推",
      status: "系列导航；主题、颜色、尖幅和旧新尖材边界按 SKU 分开",
    },
    evidence: [
      evidence("tornado-brand", "brand_entity_id", story.key, seriesScope, "Retro 51 brand and Tornado history"),
      evidence("tornado-series", "series_name", collection.key, seriesScope, "official Tornado Fountain Pens collection"),
      evidence("tornado-release", "release_year", story.key, seriesScope, "1997 origin and later expansion"),
      evidence("tornado-origin", "origin_country", story.key, seriesScope, "Retro 51 brand context"),
      evidence("tornado-nib-field", "nib", collection.key, seriesScope, "German steel nib and width list"),
      evidence("tornado-fill-field", "fill_system", collection.key, seriesScope, "international cartridge/converter"),
      evidence("tornado-material-field", "material", faq.key, seriesScope, "cylindrical metal barrel and mode boundary"),
      evidence("tornado-dimensions", "dimensions", wad.key, seriesScope, "no family-wide dimensions claimed; sample boundary"),
      evidence("tornado-weight", "weight", wad.key, seriesScope, "no family-wide weight claimed; sample boundary"),
      evidence("tornado-status", "status", collection.key, seriesScope, "current collection routes"),
    ],
  },
  timeline: [{ key: "tornado-family-1997", title: "Tornado family begins", eventType: "model_released", startDate: "1997", circa: false, description: "官方 Our Story 把 1997 年的 rollerball 作为 Tornado 家族起点；钢笔扩展另按具体商品记录。", sourceKey: story.key }],
  media: media("phase342-retro51-series-media", seriesSvg.title, seriesSvg),
};

const jeffersonScope = "phase342-retro51-jefferson";
const jefferson: CuratedEntityPack = {
  key: "phase342-retro51-jefferson-v1",
  entityId: PHASE342_RETRO51_IDS.jefferson,
  expectedType: "pen",
  expectedSlug: PHASE342_RETRO51_SLUGS.jefferson,
  canonicalName: "Retro 51 Tornado Fountain Pen Jefferson",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/quick/260802-retro51-tornado/jefferson.md",
  storyTitle: "Retro 51 Tornado Fountain Pen Jefferson：古银酸蚀主题 SKU",
  primarySourceKey: jeffersonPage.key,
  depthTier: "A",
  aliases: [
    { alias: "Retro 51 Tornado Fountain Pen Jefferson", language: "en", sourceKey: jeffersonPage.key },
    { alias: "Tornado Fountain Pen Jefferson", language: "en", sourceKey: collection.key },
    { alias: "Retro 51 Jefferson 钢笔", language: "zh", sourceKey: jeffersonPage.key },
  ],
  sources: [jeffersonPage, collection, faq, nibs, story, penAddict, wad, pastor, jeffersonSvg],
  scopes: [{ key: jeffersonScope, scopeKey: jeffersonScope, market: "Retro 51 Jefferson official product record", productionState: "current", nibScope: "JoWo #6 stainless steel; EF/F/M/1.1 mm/1.5 mm options on official page", materialScope: "antique silver plated over acid-etched barrel; antique silver trims; contoured brass grip", editionScope: "Jefferson specific product page and SKU; do not merge with other silver, Literary or rollerball Tornado products" }],
  claims: [
    claim("jefferson-identity", "model_identity", "Jefferson 是 Retro 51 Tornado Fountain Pen 家族中的独立官方主题 SKU，不是所有银色 Tornado 的泛称。", jeffersonPage.key, jeffersonScope, "official product title and Jefferson identity"),
    claim("jefferson-barrel", "material_finish", "官方商品页记录 antique silver plated over acid-etched barrel 与 antique silver trims；antique silver 是 finish 名称，不等于实心银笔杆。", jeffersonPage.key, jeffersonScope, "barrel and trim material description"),
    claim("jefferson-cap", "cap_construction", "Jefferson 使用 knurl twist-cap；滚花旋转帽与 Tornado 家族的圆柱金属框架相连。", jeffersonPage.key, jeffersonScope, "knurl twist-cap description"),
    claim("jefferson-grip", "grip_material", "官方商品页将握位写为 contoured brass grip；不能把握位材质扩大成整支笔的材质声明。", jeffersonPage.key, jeffersonScope, "contoured brass grip field"),
    claim("jefferson-nib", "nib", "Jefferson 使用 JoWo #6 stainless steel nib，官方商品页提供 EF、F、M、1.1 mm、1.5 mm 选项；页面示例 SKU 为 EF。", jeffersonPage.key, jeffersonScope, "nib type, width options and EF SKU"),
    claim("jefferson-fill", "filling_system", "官方商品页说明 Jefferson 使用国际规格墨囊或 converter，并随笔提供两者。", jeffersonPage.key, jeffersonScope, "international cartridge and converter inclusion"),
    claim("jefferson-dimensions", "physical_specification", "官方商品页记录闭帽 137 mm、开盖 125.9 mm、直径 13 mm、34 g；测量条件按商品页口径保存。", jeffersonPage.key, jeffersonScope, "measurements and weight"),
    claim("jefferson-warranty", "warranty", "官方商品页记录一年有限质保；适用条件仍取决于购买渠道、凭证、时间与是否自行改装。", jeffersonPage.key, jeffersonScope, "one-year limited warranty"),
    claim("jefferson-jowo-era", "version_boundary", "官方 replacement nibs 页面把 German-made JoWo No.6 stainless 与 Tornado Fountain Pen（2018+）兼容关系单列；独立评测的 Schmidt 样本不覆盖 Jefferson 出厂状态。", nibs.key, jeffersonScope, "2018+ replacement route and older sample boundary"),
    claim("jefferson-independent-sample", "sample_boundary", "Well-Appointed Desk 与 Pastor and Pen 对 Tornado fountain pen 的重量、尖材和供墨讨论来自各自样本；这些观察用于版本辨析，不替代 Jefferson 官方商品页。", wad.key, jeffersonScope, "independent review sample boundary"),
    claim("jefferson-care", "maintenance_guidance", "古银酸蚀饰面、漆面、滚花与黄铜握位以柔软干布和室温清水保养，避免热水、酒精、研磨膏、金属抛光剂和长时间浸泡。", faq.key, jeffersonScope, "conservative finish and refill care", "editorial"),
    claim("jefferson-buying", "selection_guidance", "购买时核对 Jefferson 名称、VRF-1330 系列货号、尖幅、酸蚀纹理、包装、converter、尺寸和是否改装；价格与库存不作为稳定身份。", jeffersonPage.key, jeffersonScope, "SKU, variant and buying boundary", "editorial"),
  ],
  variants: [
    { key: "jefferson-ef", name: "VRF-1330-EF-K example SKU", notes: "官方页面标题／商品选项中的 EF 例；Jefferson 还列 F、M、1.1 mm、1.5 mm 选择。", sourceKey: jeffersonPage.key, variantKind: "market_sku", productCode: "VRF-1330-EF-K" },
    { key: "jefferson-widths", name: "EF / F / M / 1.1 mm / 1.5 mm", notes: "官方商品页的尖幅选择；购买时按订单与笔尖刻字确认。", sourceKey: jeffersonPage.key, variantKind: "nib" },
    { key: "jefferson-fill", name: "International cartridge / converter", notes: "官方商品页说明墨囊和 converter 均随笔提供；二手包装需实物核对。", sourceKey: jeffersonPage.key, variantKind: "variant" },
  ],
  spec: {
    brandEntityId: PHASE342_RETRO51_BRAND_ID,
    values: {
      series_name: "Tornado Fountain Pen",
      release_year: "当前官方 Jefferson 商品记录；页面未据此声明单支首发年",
      origin_country: "Retro 51 美国品牌语境；具体制造地按商品包装与批次核对",
      nib: "JoWo #6 stainless steel；EF/F/M/1.1 mm/1.5 mm 按商品选项核对",
      fill_system: "国际规格墨囊或 converter；官方商品页说明两者均随笔提供",
      material: "antique silver plated over acid-etched barrel；antique silver trims；contoured brass grip",
      dimensions: "闭帽 137 mm；开盖 125.9 mm；直径 13 mm",
      weight: "34 g（官方商品页记录）",
      status: "Jefferson 具体主题 SKU；不覆盖其他 Tornado 颜色、主题或 rollerball",
    },
    evidence: [
      evidence("jefferson-brand", "brand_entity_id", jeffersonPage.key, jeffersonScope, "Retro 51 product identity"),
      evidence("jefferson-series", "series_name", collection.key, jeffersonScope, "Tornado Fountain Pen family"),
      evidence("jefferson-release", "release_year", jeffersonPage.key, jeffersonScope, "current product record; no launch year inferred"),
      evidence("jefferson-origin", "origin_country", story.key, jeffersonScope, "Retro 51 brand context"),
      evidence("jefferson-nib-field", "nib", jeffersonPage.key, jeffersonScope, "JoWo #6 and width options"),
      evidence("jefferson-fill-field", "fill_system", jeffersonPage.key, jeffersonScope, "international cartridge/converter"),
      evidence("jefferson-material-field", "material", jeffersonPage.key, jeffersonScope, "acid-etched antique silver and brass grip"),
      evidence("jefferson-dimensions", "dimensions", jeffersonPage.key, jeffersonScope, "137/125.9 mm and 13 mm"),
      evidence("jefferson-weight", "weight", jeffersonPage.key, jeffersonScope, "34 g"),
      evidence("jefferson-status", "status", jeffersonPage.key, jeffersonScope, "Jefferson SKU boundary and warranty"),
    ],
  },
  media: media("phase342-retro51-jefferson-media", jeffersonSvg.title, jeffersonSvg),
};

export const phase342Retro51TornadoPacks: CuratedEntityPack[] = [brand, series, jefferson];
