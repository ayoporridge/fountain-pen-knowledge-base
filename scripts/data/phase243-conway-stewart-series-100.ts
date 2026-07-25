import type {
  CuratedClaimEvidence,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-26";

export const PHASE243_BRAND_ID = "p243ConwayStewartBrand";
export const PHASE243_PEN_ID = "p243ConwayStewartSeries100";
export const PHASE243_BRAND_SLUG = "conway-stewart";
export const PHASE243_PEN_SLUG = "conway-stewart-series-100";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.independenceGroup ?? input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(key: string, title: string, url: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase243",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase243",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary,
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  history: web({
    key: "phase243-conway-stewart-history",
    title: "Conway Stewart official history",
    url: "https://conwaystewart.com/en-us/pages/history",
    registryKey: "conway-stewart-official-history-phase243",
    registryName: "Conway Stewart",
    independenceGroup: "conway-stewart-official",
    summary: "官方历史页记录 1905 伦敦创立、1950 年代产品发展、1975 旧工厂终止生产、1996 Churchill、2014 工厂 administration 与 Bespoke British Pens 取得库存和技术图纸后的现代复兴。",
  }),
  series: web({
    key: "phase243-conway-stewart-series-100-collection",
    title: "Conway Stewart Series 100 collection",
    url: "https://conwaystewart.com/en-us/collections/series-100",
    registryKey: "conway-stewart-series-100-collection-phase243",
    registryName: "Conway Stewart",
    independenceGroup: "conway-stewart-official",
    summary: "官方系列页称 Series 100 于 1954 年首发，列当前 Classic Black、Classic Green、Amber、Meteor、Sepia Blue、Sapphire Blue、Honey Noire 等钢笔 finish，并说明 18ct 金尖为标准配置。",
  }),
  product: web({
    key: "phase243-conway-stewart-series-100-classic-black",
    title: "Conway Stewart Series 100 Classic Black fountain pen",
    url: "https://conwaystewart.com/en-us/products/conway-stewart-series-100-classic-black",
    registryKey: "conway-stewart-series-100-product-phase243",
    registryName: "Conway Stewart",
    independenceGroup: "conway-stewart-official",
    summary: "Classic Black exact product page列亚克力、三道9ct金帽环、两道9ct金笔杆环、18ct金尖、卡式/转换器两用、闭盖137.5 mm、套帽176 mm、直径12.5/15.5 mm与22 g。",
  }),
  faq: web({
    key: "phase243-conway-stewart-fountain-pen-faq",
    title: "Conway Stewart fountain pen FAQ",
    url: "https://conwaystewart.com/en-us/collections/fountain-pen",
    registryKey: "conway-stewart-fountain-pen-faq-phase243",
    registryName: "Conway Stewart",
    independenceGroup: "conway-stewart-official",
    summary: "官方 FAQ 说明不同型号的填充系统可能不同、通常可用墨囊和转换器，并给出 Series 100 与 Churchill 的书法尖定制入口和一般维护边界。",
  }),
  review: web({
    key: "phase243-conway-stewart-series-100-review",
    title: "The Gentleman Stationer：Conway Stewart Model 100 review",
    url: "https://gentlemanstationer.squarespace.com/blog/2018/12/19/pen-review-conway-stewart-model-100",
    registryKey: "gentleman-stationer-conway-stewart-100-phase243",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "gentleman-stationer",
    summary: "独立作者记录 2017 年购入的 Honey Noire 亚克力 Model 100，讨论约五英寸未套帽、卡式/转换器、18K中号尖和现代复兴背景，并披露购买与赞助关系。",
  }),
  brandSvg: diagram(
    "phase243-conway-stewart-brand-svg",
    "Conway Stewart brand history and collection diagram",
    "/images/library/site-original/phase243/conway-stewart/brand.svg",
    "本站原创 factual SVG；表达品牌时间线、现代复兴和钢笔系列导航边界。",
  ),
  penSvg: diagram(
    "phase243-conway-stewart-series-100-svg",
    "Conway Stewart Series 100 factual diagram",
    "/images/library/site-original/phase243/conway-stewart/series-100.svg",
    "本站原创 factual SVG；表达 1954 家族起点、Classic Black 的 18ct 尖、C/C、尺寸和 finish variant 边界。",
  ),
} as const;

function claimEvidence(key: string, sourceKey: string, scopeKey: string, locator: string): CuratedClaimEvidence {
  return { key, sourceKey, scopeKey, locator };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function media(source: CuratedSource, key: string, title: string, localPath: string) {
  return [{
    key,
    title,
    sourceKey: source.key,
    localPath,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
    sourceUrl: localPath,
    usageStatus: "primary" as const,
  }];
}

const brandScope = "phase243-conway-stewart-brand-navigation";
const penScope = "phase243-conway-stewart-series-100-current";

const brand: CuratedEntityPack = {
  key: "phase243-conway-stewart-brand-v1",
  entityId: PHASE243_BRAND_ID,
  expectedType: "brand",
  expectedSlug: PHASE243_BRAND_SLUG,
  canonicalName: "Conway Stewart",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/conway-stewart-brand-phase243.md",
  storyTitle: "Conway Stewart：1905 英国品牌与现代 Series 100 导航",
  primarySourceKey: S.history.key,
  depthTier: "A",
  aliases: [
    { alias: "Conway Stewart", language: "en", sourceKey: S.history.key },
    { alias: "Conway-Stewart", language: "en", sourceKey: S.history.key },
    { alias: "康威·斯图尔特", language: "zh", sourceKey: S.history.key },
  ],
  sources: [S.history, S.series, S.product, S.faq, S.review, S.brandSvg],
  scopes: [{
    key: brandScope,
    scopeKey: brandScope,
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope: "Conway Stewart 历史品牌与当前 Bespoke British Pens 复兴网站；钢笔、滚珠笔、圆珠笔和铅笔分别处理。",
  }],
  claims: [
    {
      key: "phase243-conway-stewart-brand-identity",
      predicate: "brand_identity",
      objectText: "Conway Stewart 是 1905 年在伦敦成立的英国书写工具品牌；官方历史页把早期制造、1950 年代产品高峰、1975 旧工厂停产与 2014 年后的现代复兴分开记录。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.history.key,
      locator: S.history.summary,
      evidence: [claimEvidence("phase243-conway-stewart-brand-identity-history", S.history.key, brandScope, S.history.summary)],
    },
    {
      key: "phase243-conway-stewart-revival",
      predicate: "ownership_boundary",
      objectText: "2014 年原 Plymouth 工厂进入 administration 后，Bespoke British Pens Limited 取得大部分库存和技术图纸，并从 2015 年起在英国工作室重新装配、销售和扩展 Conway Stewart 系列；现代复兴不应被写成原公司连续无缝经营。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.history.key,
      locator: S.history.summary,
      evidence: [claimEvidence("phase243-conway-stewart-revival-history", S.history.key, brandScope, S.history.summary), claimEvidence("phase243-conway-stewart-revival-review", S.review.key, brandScope, S.review.summary)],
    },
    {
      key: "phase243-conway-stewart-navigation",
      predicate: "brand_model_navigation",
      objectText: "当前官网将 Churchill、Churchill Heritage、Duro、Marlborough、Raleigh、Series 58、Series 100、Wellington、Winston 等列为独立系列；本页只把 Series 100 作为本批落地的具体钢笔入口。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.series.key,
      locator: S.series.summary,
      evidence: [claimEvidence("phase243-conway-stewart-navigation-series", S.series.key, brandScope, S.series.summary), claimEvidence("phase243-conway-stewart-navigation-faq", S.faq.key, brandScope, S.faq.summary)],
    },
    {
      key: "phase243-conway-stewart-tool-boundary",
      predicate: "writing_tool_boundary",
      objectText: "官网同时销售 fountain pen、ballpoint、rollerball 与 propelling pencil；品牌页不把同名非钢笔工具的尖、上墨、尺寸或维护字段复制到钢笔页。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.faq.key,
      locator: S.faq.summary,
      evidence: [claimEvidence("phase243-conway-stewart-tool-boundary-faq", S.faq.key, brandScope, S.faq.summary), claimEvidence("phase243-conway-stewart-tool-boundary-series", S.series.key, brandScope, S.series.summary)],
    },
  ],
  timeline: [
    {
      key: "phase243-conway-stewart-founded",
      title: "Conway Stewart 在伦敦成立",
      eventType: "brand_founded",
      startDate: "1905",
      circa: false,
      description: "官方历史页记录 Frank Jarvis 与 Howard Garner 在伦敦创立 Conway Stewart & Co.。",
      sourceKey: S.history.key,
    },
    {
      key: "phase243-conway-stewart-series-100",
      title: "Series 100 首次推出",
      eventType: "model_released",
      startDate: "1954",
      circa: false,
      description: "官方 Series 100 页面给出的设计家族首发年份；不把它等同于每一支现代 finish 的生产日期。",
      sourceKey: S.series.key,
    },
    {
      key: "phase243-conway-stewart-revival",
      title: "Bespoke British Pens 复兴 Conway Stewart",
      eventType: "revival",
      startDate: "2014",
      circa: true,
      description: "官方历史页记录原工厂进入 administration 后，Bespoke British Pens 取得库存和技术图纸并于 2015 年起重新装配销售。",
      sourceKey: S.history.key,
    },
  ],
  media: media(S.brandSvg, "phase243-conway-stewart-brand-primary", "Conway Stewart 品牌导航事实图（非产品照片）", "/images/library/site-original/phase243/conway-stewart/brand.svg"),
};

const pen: CuratedEntityPack = {
  key: "phase243-conway-stewart-series-100-v1",
  entityId: PHASE243_PEN_ID,
  expectedType: "pen",
  expectedSlug: PHASE243_PEN_SLUG,
  canonicalName: "Conway Stewart Series 100",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/conway-stewart-series-100-phase243.md",
  storyTitle: "Conway Stewart Series 100：Classic Black 的金尖与现代复兴边界",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Conway Stewart Series 100", language: "en", sourceKey: S.series.key },
    { alias: "Conway Stewart Model 100", language: "en", sourceKey: S.review.key },
    { alias: "Series 100 Classic Black", language: "en", sourceKey: S.product.key },
    { alias: "康威·斯图尔特 100 系列", language: "zh", sourceKey: S.product.key },
  ],
  sources: [S.product, S.series, S.history, S.faq, S.review, S.penSvg],
  scopes: [{
    key: penScope,
    scopeKey: penScope,
    market: "Conway Stewart current website",
    validFrom: RETRIEVED,
    productionState: "current",
    nibScope: "官方当前 Series 100 页面列 18ct gold nib standard；特殊尖型和宽度按订单定制。",
    materialScope: "Classic Black exact page 为 acrylic barrel、9ct gold rings；其它 finish 不自动继承同一外观与重量。",
    editionScope: "Series 100 family and current Classic Black reference product；vintage 1954–1970s pens and non-fountain tools excluded.",
  }],
  claims: [
    {
      key: "phase243-series-100-identity",
      predicate: "model_identity",
      objectText: "Conway Stewart Series 100 是官方称 1954 年首次推出的中型鱼雷形设计家族；本页的当前参考 SKU 是 Classic Black Fountain Pen，而不是同名滚珠笔、圆珠笔或铅笔。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.series.key,
      locator: S.series.summary,
      evidence: [claimEvidence("phase243-series-100-identity-series", S.series.key, penScope, S.series.summary), claimEvidence("phase243-series-100-identity-product", S.product.key, penScope, S.product.summary)],
    },
    {
      key: "phase243-series-100-current-boundary",
      predicate: "current_revival_boundary",
      objectText: "当前 Classic Black 是 Bespoke British Pens 运营的英国手工复兴产品；它继承 Series 100 的历史外形语汇，但不等同于 1954 年存世笔的材料、上墨或零件。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.history.key,
      locator: S.history.summary,
      evidence: [claimEvidence("phase243-series-100-current-history", S.history.key, penScope, S.history.summary), claimEvidence("phase243-series-100-current-review", S.review.key, penScope, S.review.summary)],
    },
    {
      key: "phase243-series-100-nib",
      predicate: "nib_specification",
      objectText: "当前 Series 100 页面把 18ct gold nib 列为标准，并允许选择宽度及 Italic、Left Oblique、Right Oblique、Stub 等定制；The Gentleman Stationer 的 Honey Noire 样本是独立的 18K medium 调校个案。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [claimEvidence("phase243-series-100-nib-product", S.product.key, penScope, S.product.summary), claimEvidence("phase243-series-100-nib-review", S.review.key, penScope, S.review.summary)],
    },
    {
      key: "phase243-series-100-fill",
      predicate: "filling_system",
      objectText: "Classic Black 使用转换器吸取瓶装墨水，或取下转换器改用 standard European ink cartridges，并随笔提供两支墨囊；历史杠杆、泵吸或 safety 结构不应从 vintage 资料回填到本 SKU。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [claimEvidence("phase243-series-100-fill-product", S.product.key, penScope, S.product.summary), claimEvidence("phase243-series-100-fill-faq", S.faq.key, penScope, S.faq.summary)],
    },
    {
      key: "phase243-series-100-dimensions",
      predicate: "physical_specification",
      objectText: "Classic Black 官方页面列闭盖 137.5 mm、套帽 176 mm、含尖笔杆 128 mm、帽长 63 mm、笔杆直径 12.5 mm、帽直径 15.5 mm、重量 22 g。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [claimEvidence("phase243-series-100-dimensions-product", S.product.key, penScope, S.product.summary)],
    },
    {
      key: "phase243-series-100-variants",
      predicate: "finish_variants",
      objectText: "Series 100 集合页列 Classic Black、Classic Green、Amber、Meteor、Sepia Blue、Sapphire Blue、Honey Noire、Flecked Amethyst、Nebula、Razor Shell 等钢笔 finish；颜色、树脂纹理、饰件和限量套装作为 variant，不拆成同一功能的重复基础型号。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.series.key,
      locator: S.series.summary,
      evidence: [claimEvidence("phase243-series-100-variants-series", S.series.key, penScope, S.series.summary), claimEvidence("phase243-series-100-variants-product", S.product.key, penScope, S.product.summary)],
    },
    {
      key: "phase243-series-100-care",
      predicate: "maintenance_boundary",
      objectText: "C/C 结构应在换色或久置前取下墨囊／转换器，用常温清水吸排后自然晾干；亚克力、金色环饰和 18ct 尖不适合酒精、强溶剂、研磨剂、高温或自行拆修。",
      factClass: "editorial",
      confidence: 0.97,
      sourceKey: S.faq.key,
      locator: S.faq.summary,
      evidence: [claimEvidence("phase243-series-100-care-faq", S.faq.key, penScope, S.faq.summary), claimEvidence("phase243-series-100-care-product", S.product.key, penScope, S.product.summary)],
    },
  ],
  variants: [
    ["Classic Black", "Classic Black exact product reference; acrylic, 9ct gold rings, 18ct nib"],
    ["Classic Green", "Series 100 collection finish; exact price, trim and stock follow its product page"],
    ["Amber", "Series 100 collection finish; do not reuse Classic Black photography as colour proof"],
    ["Honey Noire", "Series 100 finish; The Gentleman Stationer sample is a dated Honey Noire observation"],
    ["Commander", "Series 100 collection product/edition name; verify exact pen style before treating as fountain pen"],
  ].map(([name, notes], index) => ({
    key: `phase243-series-100-variant-${index + 1}`,
    name,
    notes,
    sourceKey: name === "Honey Noire" ? S.review.key : S.series.key,
    variantKind: name === "Commander" ? "edition_group" as const : "color" as const,
    market: "global",
  })),
  spec: {
    brandEntityId: PHASE243_BRAND_ID,
    values: {
      series_name: "Conway Stewart Series 100",
      release_year: "1954（官方系列页给出的家族首发年份）",
      origin_country: "英国；现代 Series 100 由 Bespoke British Pens 运营并在英国手工制作",
      nib: "18ct gold Conway Stewart nib standard；具体宽度与 Italic/Oblique/Stub 定制按订单确认",
      fill_system: "dual filling：转换器吸瓶装墨水，或使用 standard European ink cartridges；Classic Black 随附两支墨囊",
      material: "Classic Black 为亚克力笔身；三道 9ct gold 帽环与两道 9ct gold 笔杆环",
      dimensions: "闭盖 137.5 mm；套帽 176 mm；含尖笔杆 128 mm；帽长 63 mm；笔杆直径 12.5 mm；帽直径 15.5 mm",
      weight: "22 g（Classic Black 官方商品页）",
      price_range: "Classic Black 官方页面检索日起始价约 651 美元；finish、定制、税费与库存会变化",
      status: "Conway Stewart 当前官网在售／按单制作；历史 1954 版本与现代复兴版本分开理解",
    },
    evidence: [
      evidence("phase243-series-100-spec-brand", "brand_entity_id", S.history.key, penScope, "Conway Stewart official brand history"),
      evidence("phase243-series-100-spec-series", "series_name", S.product.key, penScope, "official Series 100 product title"),
      evidence("phase243-series-100-spec-year", "release_year", S.series.key, penScope, "official collection says first launched in 1954"),
      evidence("phase243-series-100-spec-origin", "origin_country", S.history.key, penScope, "British history and current workshop boundary"),
      evidence("phase243-series-100-spec-nib", "nib", S.product.key, penScope, "18ct gold nib standard and custom nib options"),
      evidence("phase243-series-100-spec-fill", "fill_system", S.product.key, penScope, "converter and standard European cartridges"),
      evidence("phase243-series-100-spec-material", "material", S.product.key, penScope, "Classic Black acrylic and 9ct gold rings"),
      evidence("phase243-series-100-spec-dimensions", "dimensions", S.product.key, penScope, "official dimensions in millimetres"),
      evidence("phase243-series-100-spec-weight", "weight", S.product.key, penScope, "22 g official Classic Black field"),
      evidence("phase243-series-100-spec-price", "price_range", S.product.key, penScope, "mutable current starting price"),
      evidence("phase243-series-100-spec-status", "status", S.history.key, penScope, "2014+ revival and current hand-made-to-order website"),
    ],
  },
  media: media(S.penSvg, "phase243-series-100-primary", "Conway Stewart Series 100 事实图（非产品照片）", "/images/library/site-original/phase243/conway-stewart/series-100.svg"),
};

export const phase243ConwayStewartSeries100Packs: CuratedEntityPack[] = [brand, pen];
