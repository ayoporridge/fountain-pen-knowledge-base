import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

export const PHASE57_OPUS_BRAND_ID = "I6tjleAZx9RU";
export const PHASE57_OPUS_MIXED_ID = "dTCUDu03vrI6";
export const PHASE57_OPUS_DEMO_ID = "CqFpmT3l4Mtm";
export const PHASE57_OPUS_KOLORO_ID = "0CNmbxM54-GA";
export const PHASE57_LEONARDO_BRAND_ID = "g5r4udSOYhI5";
export const PHASE57_LEONARDO_MIXED_ID = "s0HAxT1gsHxh";
export const PHASE57_LEONARDO_FURORE_ID = "ixul2gTcJ06B";
export const PHASE57_LEONARDO_MOMENTO_ID = "UE5otlwKUfp9";

export const PHASE57_OPUS_DEMO_SLUG = "opus-88-demo";
export const PHASE57_OPUS_KOLORO_SLUG = "opus-88-koloro";
export const PHASE57_LEONARDO_FURORE_SLUG = "leonardo-furore";
export const PHASE57_LEONARDO_MOMENTO_SLUG = "leonardo-momento-magico";
export const PHASE57_OPUS_MIXED_SLUG = "opus-88-demo-kolora";
export const PHASE57_LEONARDO_MIXED_SLUG = "leonardo-furore-momento-magico";

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

const SOURCES = {
  opusOfficial: live({
    key: "phase57-opus-official-about",
    title: "Jin Gi Industrial / Opus 88 official About",
    url: "https://www.jingi.com.tw/about.php",
    registryKey: "opus88-official-phase57",
    registryName: "Jin Gi Industrial / Opus 88",
    sourceType: "official",
    tier: "primary",
    summary: "官方 About 页介绍 Michael Hsu、台湾 OEM/ODM 经验与 Opus 88 的制造背景；不把公司经验起点等同于自有品牌成立年。",
    locator: "About page; Michael Hsu, OEM/ODM and Taiwan manufacturing background",
  }),
  opusInterview: live({
    key: "phase57-opus-paper-mouse",
    title: "The Paper Mouse：Spotlight on Opus 88",
    url: "https://www.thepapermouse.com/blogs/whats-new-at-the-paper-mouse/spotlight-opus-88",
    registryKey: "the-paper-mouse-phase57-opus",
    registryName: "The Paper Mouse",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "访谈补充 1975–2017 OEM/ODM、2015 台湾钢笔热和 2017 后 eyedropper 聚焦，并区分 Demo、Jazz、Koloro 的品牌定位。",
    locator: "brand interview timeline and model positioning",
  }),
  opusGuide: live({
    key: "phase57-opus-quickstart",
    title: "Opus 88 Eyedropper Quick Start",
    url: "https://feedbackfromalex.com/wp-content/uploads/2025/07/Opus88QuickStart.pdf",
    registryKey: "opus88-care-phase57",
    registryName: "Opus 88 care guide",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary: "说明书式资料用于止墨阀、滴管灌墨、清洗、储存与携带边界；Japanese-style eyedropper 不是普通 piston filler。",
    locator: "eyedropper filling, shut-off valve, cleaning and storage instructions",
  }),
  opusDemo: live({
    key: "phase57-opus-demo-goldspot",
    title: "Goldspot：Opus 88 Demonstrator Color",
    url: "https://goldspot.com/products/opus-88-koloro-fountain-pen-in-color-demo",
    registryKey: "goldspot-phase57-opus-demo",
    registryName: "Goldspot",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary: "彩色 Demo 商品页给出透明亚克力、#6 钢尖、阀门、滴管及约 143 mm/23 g/3.5 ml 参考值。",
    locator: "product specifications, included dropper and shut-off valve",
  }),
  opusDemoYoseka: live({
    key: "phase57-opus-demo-yoseka",
    title: "Yoseka：Opus 88 Demo Clear",
    url: "https://yosekastationery.com/products/opus-88-demo-fountain-pen-clear",
    registryKey: "yoseka-phase57-opus-demo",
    registryName: "Yoseka Stationery",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "Yoseka 页面把 Demo 的 Opus #12 与 Jowo #6 兼容关系单独列出，支持替换尖口径边界。",
    locator: "Opus #12 / Jowo #6 nib compatibility and clear Demo listing",
  }),
  opusDemoReview: live({
    key: "phase57-opus-demo-fpn",
    title: "Fountain Pen Network：Opus 88 Demo 评测",
    url: "https://www.fountainpennetwork.com/forum/topic/360030-opus88-demo-the-new-king-of-150-segment/",
    registryKey: "fpn-phase57-opus-demo",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "contemporary_archive",
    summary: "玩家实测用于旧款尺寸和容量区间；个人测量不替代当前 SKU 官方规格。",
    locator: "2021 Demo review measurements and filling observations",
  }),
  opusKoloro: live({
    key: "phase57-opus-koloro-stilo",
    title: "Stilo Estile：Opus 88 Koloro Black",
    url: "https://www.stiloestile.com/en/fountain-pens/demonstrator/opus-88-koloro-fountain-pen-black",
    registryKey: "stiloestile-phase57-opus-koloro",
    registryName: "Stilo Estile",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary: "Koloro Black 页面记录约 142 mm/20 g、树脂、螺旋盖、eyedropper 与 #5 钢尖，并提供尾阀操作说明。",
    locator: "Koloro Black dimensions, nib size and filling instructions",
  }),
  opusKoloroChalet: live({
    key: "phase57-opus-koloro-chalet",
    title: "Pen Chalet：Opus 88 Koloro Demonstrator",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/opus_88_koloro_demonstrator_fountain_pen.html",
    registryKey: "penchalet-phase57-opus-koloro",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "商品页补充约 4 ml 参考容量、实心树脂、雾面内腔、不可倒插与附玻璃滴管等版本资料。",
    locator: "Koloro demonstrator capacity, construction and posting notes",
  }),
  opusKoloroReview: live({
    key: "phase57-opus-koloro-gentleman",
    title: "The Gentleman Stationer：Koloro 评测",
    url: "https://www.gentlemanstationer.com/blog/2018/1/27/opus-88-koloro-demonstrators",
    registryKey: "gentleman-stationer-phase57-opus-koloro",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "长期评测解释尾部旋钮如何控制供墨，并把 Koloro 与普通 eyedropper、piston filler 区分。",
    locator: "Japanese eyedropper operation and Koloro model review",
  }),
  leonardoOfficialBrand: live({
    key: "phase57-leonardo-brand",
    title: "Leonardo Officina Italiana official brand story",
    url: "https://leonardopen.com/pages/brand",
    registryKey: "leonardo-official-brand-phase57",
    registryName: "Leonardo Officina Italiana",
    sourceType: "official",
    tier: "primary",
    summary: "官方品牌页介绍五十年以上家族制笔经验、Ciro Matrone 与 Delta 1982，以及 Salvatore 与 Mariafrancesca Matrone 建立 Leonardo 的关系。",
    locator: "brand story, family craft history and Delta 1982 boundary",
  }),
  leonardoZero: live({
    key: "phase57-leonardo-momento-zero",
    title: "Leonardo official Momento Zero collection",
    url: "https://leonardopen.com/collections/momento-zero-collection",
    registryKey: "leonardo-official-collections-phase57",
    registryName: "Leonardo Officina Italiana",
    sourceType: "official",
    tier: "primary",
    summary: "官方系列页把 Momento Zero 放在 2017 年底设计的首支 Leonardo 语境，并说明实心棒料车削、编号和 converter。",
    locator: "Momento Zero origin, machining and converter description",
  }),
  leonardoFuroreCollection: live({
    key: "phase57-leonardo-furore-collection",
    title: "Leonardo official Furore collection",
    url: "https://leonardopen.com/collections/furore-collection",
    registryKey: "leonardo-official-furore-phase57",
    registryName: "Leonardo Officina Italiana",
    sourceType: "official",
    tier: "primary",
    summary: "官方 Furore collection 标注 2018 年推出、阿马尔菲海岸灵感和钢／金尖路线，并把 Furore 与 Furore Grande 分开。",
    locator: "Launched in 2018, Furore geography and collection boundary",
  }),
  leonardoFuroreSku: live({
    key: "phase57-leonardo-furore-aquapetra",
    title: "Leonardo Furore Aquapetra steel nib SKU",
    url: "https://leonardopen.com/collections/furore-collection/products/furore-aquapetra-steel-nib",
    registryKey: "leonardo-furore-sku-phase57",
    registryName: "Leonardo Officina Italiana",
    sourceType: "official",
    tier: "primary",
    summary: "当前 Aquapetra steel 页面给出约 146/131/66 mm、27 g、15.5 mm 帽径、10.6 mm 握位和金属外壳 converter。",
    locator: "Aquapetra steel product specifications and nib options",
  }),
  leonardoFuroreReview: live({
    key: "phase57-leonardo-furore-glenn",
    title: "Glenn’s Pens：Leonardo Furore review",
    url: "https://glennspens.com/pensofnote/Furore-EmeraldBlue.html",
    registryKey: "glenns-pens-phase57-furore",
    registryName: "Glenn’s Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "专业评测作为早期标准 Furore 的 converter、约 145 mm/25 g、steel/14K 选择和测量差异交叉资料。",
    locator: "early Furore filling, size and nib observations",
  }),
  leonardoMomentoCollection: live({
    key: "phase57-leonardo-momento-magico-collection",
    title: "Leonardo official Momento Magico collection",
    url: "https://leonardopen.com/collections/momento-magico",
    registryKey: "leonardo-momento-magico-phase57",
    registryName: "Leonardo Officina Italiana",
    sourceType: "official",
    tier: "primary",
    summary: "官方系列页介绍特殊树脂、钢／金尖、ABS／ebonite feed 和 Leonardo 工坊自制 1.5 ml 活塞。",
    locator: "Momento Magico resin, nib/feed and piston capacity",
  }),
  leonardoMomentoSku: live({
    key: "phase57-leonardo-momento-magico-matte",
    title: "Leonardo Momento Magico Matte Black official SKU",
    url: "https://leonardopen.com/products/momento-magico-matte-black",
    registryKey: "leonardo-momento-magico-phase57",
    registryName: "Leonardo Officina Italiana",
    sourceType: "official",
    tier: "primary",
    summary: "Matte Black 页面给出约 145/132/67 mm、23.8 g、10 mm 墨窗、1.5 ml 活塞和专用拆卸工具。",
    locator: "Matte Black dimensions, ink window, piston capacity and tool",
  }),
  leonardoMomentoPdf: live({
    key: "phase57-leonardo-momento-csn",
    title: "Il Pennofilo：Momento Magico CSN PDF",
    url: "https://www.ilpennofilo.it/wp-content/uploads/2021/08/LEONARDO-MOMENTO-MAGICO-CSN.pdf",
    registryKey: "ilpennofilo-phase57-momento",
    registryName: "Il Pennofilo",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "特别版资料补充约 146 mm、24 g、1.5 ml 和彩色墨窗；仅作早期／限量版本交叉资料。",
    locator: "CSN special edition dimensions, capacity and coloured ink window",
  }),
  opusBrandSvg: diagram("phase57-opus-brand-svg", "Opus 88 系列结构导航事实卡", "/images/library/site-original/opus88-leonardo/opus88-brand.svg", "原创示意图区分 Opus 88 Demo、Koloro、Jazz 与 Opera 的笔尖和上墨路线。"),
  opusDemoSvg: diagram("phase57-opus-demo-svg", "Opus 88 Demonstrator 事实卡", "/images/library/site-original/opus88-leonardo/opus88-demo.svg", "原创示意图区分透明亚克力、#6／#12 尖、3.5 ml 参考容量与尾部止墨阀。"),
  opusKoloroSvg: diagram("phase57-opus-koloro-svg", "Opus 88 Koloro 事实卡", "/images/library/site-original/opus88-leonardo/opus88-koloro.svg", "原创示意图区分扁平端盖、双色树脂、#5／#10 尖和约 4 ml 参考容量。"),
  leonardoBrandSvg: diagram("phase57-leonardo-brand-svg", "Leonardo 系列导航事实卡", "/images/library/site-original/opus88-leonardo/leonardo-brand.svg", "原创示意图区分 Momento Zero、Furore、Momento Magico 与 Grande 路线。"),
  leonardoFuroreSvg: diagram("phase57-leonardo-furore-svg", "Leonardo Furore 事实卡", "/images/library/site-original/opus88-leonardo/leonardo-furore.svg", "原创示意图区分 2018、converter、146 mm 级标准款与 Furore Grande 的边界。"),
  leonardoMomentoSvg: diagram("phase57-leonardo-momento-svg", "Leonardo Momento Magico 事实卡", "/images/library/site-original/opus88-leonardo/leonardo-momento-magico.svg", "原创示意图区分 1.5 ml 工坊活塞、10 mm 墨窗与 steel/gold feed 变体。"),
};

function uniqueSources(sources: CuratedSource[]): CuratedSource[] {
  return sources.filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index);
}

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makeBrand(input: {
  key: string;
  id: string;
  slug: string;
  name: string;
  title: string;
  markdownFile: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  extra: CuratedSource[];
  svg: CuratedSource;
  aliases: string[];
  origin: string;
  milestone: { key: string; title: string; date: string; description: string; sourceKey: string };
}): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  return {
    key: `phase57-${input.key}-v1`,
    entityId: input.id,
    expectedType: "brand",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.title,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: input.primary.key })),
    sources: uniqueSources([input.primary, input.secondary, ...input.extra, input.svg]),
    scopes: [{ key: scopeKey, scopeKey, productionState: "current", editionScope: "品牌历史与系列导航；规格、上墨和维护下沉到型号页" }],
    claims: [
      { key: `${input.key}-identity`, predicate: "brand_identity", objectText: `${input.name} 的品牌身份与制造／家族工艺背景以第一方资料为准。`, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: "official brand identity", evidence: [{ key: `${input.key}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: "official brand story and identity" }] },
      { key: `${input.key}-navigation`, predicate: "series_navigation", objectText: "品牌页按型号、上墨和笔尖路线导航；相近外形、颜色或结构词不能代替具体型号身份。", factClass: "core", confidence: 0.98, sourceKey: input.secondary.key, locator: "series navigation boundary", evidence: [{ key: `${input.key}-navigation-evidence`, sourceKey: input.secondary.key, scopeKey, locator: "model family distinction" }] },
    ],
    variants: [],
    media: [{ key: `${input.key}-primary`, title: `${input.name} 系列导航事实卡（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非实物照片，不复制官方摄影。", sourceUrl: input.svg.url, usageStatus: "primary" }],
    timeline: [
      { key: `${input.key}-origin`, title: `${input.name} 制造／家族背景`, eventType: "brand_founded", startDate: input.origin, circa: true, description: `${input.name} 的品牌历史入口；公司经验、家族工艺与自有品牌成立时间按来源区分。`, sourceKey: input.primary.key },
      { key: input.milestone.key, title: input.milestone.title, eventType: "design_milestone", startDate: input.milestone.date, circa: true, description: input.milestone.description, sourceKey: input.milestone.sourceKey },
    ],
  };
}

function makePen(input: {
  key: string;
  id: string;
  slug: string;
  name: string;
  title: string;
  summary: string;
  markdownFile: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  extra: CuratedSource[];
  svg: CuratedSource;
  brandEntityId: string;
  aliases: string[];
  release: string;
  nib: string;
  fill: string;
  material: string;
  dimensions: string;
  weight: string;
  status: string;
  boundary: string;
  variants: Array<{ key: string; name: string; notes: string; sourceKey: string; releaseYear?: string; productCode?: string }>;
}): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  return {
    key: `phase57-${input.key}-v1`,
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
    aliases: input.aliases.map((alias, index) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: index === 0 ? input.primary.key : input.secondary.key })),
    sources: uniqueSources([input.primary, input.secondary, ...input.extra, input.svg]),
    scopes: [{ key: scopeKey, scopeKey, productionState: "historical", editionScope: "具体型号；颜色、市场、批次和尖型按 variant 记录" }],
    claims: [
      { key: `${input.key}-identity`, predicate: "model_identity", objectText: input.summary, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: "model identity and product page", evidence: [{ key: `${input.key}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: "model title and product identity" }] },
      { key: `${input.key}-boundary`, predicate: "version_boundary", objectText: input.boundary, factClass: "core", confidence: 0.99, sourceKey: input.secondary.key, locator: "sibling and version boundary", evidence: [{ key: `${input.key}-boundary-evidence`, sourceKey: input.secondary.key, scopeKey, locator: "model sibling distinction" }, { key: `${input.key}-primary-boundary`, sourceKey: input.primary.key, scopeKey, locator: "current product or collection boundary" }] },
      { key: `${input.key}-care`, predicate: "maintenance_boundary", objectText: "上墨结构决定清洗和携带方式；换色时应使用清水，长期不用时清空墨水，不能把另一系列的转换器、活塞或笔尖口径套到本页。", factClass: "core", confidence: 0.97, sourceKey: input.secondary.key, locator: "care and filling boundary", evidence: [{ key: `${input.key}-care-evidence`, sourceKey: input.secondary.key, scopeKey, locator: "filling and maintenance observations" }] },
    ],
    variants: input.variants.map((variant) => ({ ...variant, variantKind: "market_sku" as const })),
    spec: {
      brandEntityId: input.brandEntityId,
      values: { series_name: input.name, release_year: input.release, origin_country: input.brandEntityId === PHASE57_OPUS_BRAND_ID ? "台湾" : "意大利", nib: input.nib, fill_system: input.fill, material: input.material, dimensions: input.dimensions, weight: input.weight, status: input.status },
      evidence: [
        evidence("brand_entity_id", `${input.key}-brand`, input.primary.key, scopeKey, "maker identity"),
        evidence("series_name", `${input.key}-series`, input.primary.key, scopeKey, "model title"),
        evidence("release_year", `${input.key}-release`, input.primary.key, scopeKey, "dated model or collection context"),
        evidence("origin_country", `${input.key}-origin`, input.primary.key, scopeKey, "brand/model origin context"),
        evidence("nib", `${input.key}-nib`, input.primary.key, scopeKey, "nib configuration"),
        evidence("fill_system", `${input.key}-fill`, input.primary.key, scopeKey, "filling system"),
        evidence("material", `${input.key}-material`, input.secondary.key, scopeKey, "material and construction"),
        evidence("dimensions", `${input.key}-dimensions`, input.primary.key, scopeKey, "product dimensions or measured reference"),
        evidence("weight", `${input.key}-weight`, input.primary.key, scopeKey, "product weight or measured reference"),
        evidence("status", `${input.key}-status`, input.secondary.key, scopeKey, "current/historical boundary"),
      ],
    },
    media: [{ key: `${input.key}-primary`, title: `${input.name} 事实卡（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非实物照片，不复制官方摄影，不表现真实比例、颜色、Logo 或刻字。", sourceUrl: input.svg.url, usageStatus: "primary" }],
    timeline: [{ key: `${input.key}-timeline`, title: `${input.name} 进入公开资料`, eventType: "model_released", startDate: input.release.match(/\d{4}/)?.[0] ?? "2000", circa: true, description: input.summary, sourceKey: input.primary.key }],
  };
}

const opusBrand = makeBrand({
  key: "opus-brand", id: PHASE57_OPUS_BRAND_ID, slug: "opus88", name: "Opus 88", title: "Opus 88：台湾制造背景与 Japanese-style eyedropper 型号导航", markdownFile: ".planning/content-research/opus88-brand.md", primary: SOURCES.opusOfficial, secondary: SOURCES.opusInterview, extra: [SOURCES.opusGuide], svg: SOURCES.opusBrandSvg, aliases: ["Opus 88", "Opus88", "欧普斯 88"], origin: "1988", milestone: { key: "opus-eyedropper-focus", title: "自有品牌聚焦 eyedropper fountain pens", date: "2017", description: "访谈将自有品牌在 2015–2017 年间的形成与之后聚焦 eyedropper 的路线分开描述。", sourceKey: SOURCES.opusInterview.key },
});

const leonardoBrand = makeBrand({
  key: "leonardo-brand", id: PHASE57_LEONARDO_BRAND_ID, slug: "leonardo", name: "Leonardo Officina Italiana", title: "Leonardo Officina Italiana：现代意大利家族制笔与系列导航", markdownFile: ".planning/content-research/leonardo-brand.md", primary: SOURCES.leonardoOfficialBrand, secondary: SOURCES.leonardoFuroreReview, extra: [SOURCES.leonardoZero, SOURCES.leonardoFuroreCollection, SOURCES.leonardoMomentoCollection], svg: SOURCES.leonardoBrandSvg, aliases: ["Leonardo", "Leonardo Officina Italiana", "列奥纳多钢笔"], origin: "1982", milestone: { key: "leonardo-momento-zero", title: "Momento Zero 成为 Leonardo 首支独立系列", date: "2017", description: "官方系列页把 Momento Zero 追溯到 2017 年底设计，Furore 则标注 2018 年推出；二者应分开导航。", sourceKey: SOURCES.leonardoZero.key },
});

export const phase57Opus88LeonardoPacks: CuratedEntityPack[] = [
  opusBrand,
  makePen({ key: "opus-demo", id: PHASE57_OPUS_DEMO_ID, slug: PHASE57_OPUS_DEMO_SLUG, name: "Opus 88 Demonstrator", title: "Opus 88 Demonstrator：透明大墨仓与 #6 止墨阀", summary: "Opus 88 Demonstrator 是透明或半透明大型 Japanese-style eyedropper，常见 Jowo #6／Opus #12 钢尖，彩色 Demo 公开样本约 143 mm、23 g、3.5 ml。", markdownFile: ".planning/content-research/opus88-demonstrator.md", primary: SOURCES.opusDemo, secondary: SOURCES.opusDemoYoseka, extra: [SOURCES.opusDemoReview, SOURCES.opusGuide, SOURCES.opusInterview], svg: SOURCES.opusDemoSvg, brandEntityId: PHASE57_OPUS_BRAND_ID, aliases: ["Opus 88 Demo", "Opus 88 Demonstrator", "Opus88 Demo", "欧普斯 88 透明示范笔"], release: "约 2017 起；具体透明与 PVD 版本分批", nib: "Jowo #6／Opus #12 钢尖；EF/F/M/B/1.5 mm 常见", fill: "Japanese-style eyedropper + 尾部 shut-off valve", material: "透明或半透明亚克力；塑料 feed；玻璃滴管", dimensions: "彩色 Demo 参考约 143 mm 闭合、15.9 mm 最大直径；旧款约 147 mm", weight: "彩色 Demo 约 23 g；旧款实测约 27 g", status: "当前与历史配色并存；颜色/PVD 为 variants", boundary: "本页只指大型 Demonstrator；Koloro 是 #5／#10、扁平端盖的 sibling。Demo 不是 piston filler，尾部旋钮只控制墨仓到 feed 的通路；容量和重量随版本、饰件与测量方法变化。", variants: [{ key: "opus-demo-color", name: "Demonstrator Color / Clear", releaseYear: "当前及历史配色", notes: "透明或半透明亚克力；Goldspot 参考约 143 mm、23 g、3.5 ml。", sourceKey: SOURCES.opusDemo.key }, { key: "opus-demo-pvd", name: "Demonstrator PVD trim", releaseYear: "2024–2025", notes: "PVD 饰件和颜色为外观 variant，不改变大型 #6／#12 路线；具体 SKU 需核对。", sourceKey: SOURCES.opusDemo.key }] }),
  makePen({ key: "opus-koloro", id: PHASE57_OPUS_KOLORO_ID, slug: PHASE57_OPUS_KOLORO_SLUG, name: "Opus 88 Koloro", title: "Opus 88 Koloro：扁平端盖、双色树脂与 #5 止墨阀", summary: "Opus 88 Koloro（旧资料偶写 Kolora）是扁平端盖、双色树脂和 Jowo #5／Opus #10 钢尖的 Japanese-style eyedropper，Black 参考约 142 mm、20 g。", markdownFile: ".planning/content-research/opus88-koloro.md", primary: SOURCES.opusKoloro, secondary: SOURCES.opusKoloroChalet, extra: [SOURCES.opusKoloroReview, SOURCES.opusGuide, SOURCES.opusInterview], svg: SOURCES.opusKoloroSvg, brandEntityId: PHASE57_OPUS_BRAND_ID, aliases: ["Opus 88 Koloro", "Opus 88 Kolora", "Koloro Demonstrator", "欧普斯 88 Koloro"], release: "约 2017 起；颜色和透明版本分批", nib: "Jowo #5／Opus #10 钢尖；EF/F/M/B/1.5 mm 常见", fill: "Japanese-style eyedropper + 尾部 shut-off valve", material: "双色树脂、部分实心树脂或乌木配色；螺旋盖", dimensions: "Koloro Black 参考约 142 mm 闭合、14 mm 直径、笔杆约 125 mm", weight: "Koloro Black 参考约 20 g", status: "当前与历史配色并存；Kolora 仅为 alias", boundary: "本页只指 Koloro；Demonstrator/Jazz 是 sibling。Koloro 的 #5／#10 尖不能按品牌名与 Demo 的 #6／#12 互换；雾面内腔和不可倒插是部分版本的结构观察，不应外推到所有颜色。", variants: [{ key: "opus-koloro-black", name: "Koloro Black", releaseYear: "历史与现售库存", notes: "Stilo Estile 参考约 142 mm、20 g、#5 钢尖、eyedropper。", sourceKey: SOURCES.opusKoloro.key }, { key: "opus-koloro-demo", name: "Koloro Demonstrator", releaseYear: "分批配色", notes: "Pen Chalet 参考约 4 ml、实心树脂与雾面内腔；具体颜色透明度需看实物。", sourceKey: SOURCES.opusKoloroChalet.key }] }),
  leonardoBrand,
  makePen({ key: "leonardo-furore", id: PHASE57_LEONARDO_FURORE_ID, slug: PHASE57_LEONARDO_FURORE_SLUG, name: "Leonardo Furore", title: "Leonardo Furore：2018 意大利树脂与 converter 路线", summary: "Leonardo Furore 是 2018 年推出的意大利树脂 cartridge/converter 系列；Aquapetra steel SKU 约 146 mm、27 g，并配金属外壳 converter。", markdownFile: ".planning/content-research/leonardo-furore.md", primary: SOURCES.leonardoFuroreSku, secondary: SOURCES.leonardoFuroreReview, extra: [SOURCES.leonardoFuroreCollection, SOURCES.leonardoOfficialBrand, SOURCES.leonardoZero], svg: SOURCES.leonardoFuroreSvg, brandEntityId: PHASE57_LEONARDO_BRAND_ID, aliases: ["Leonardo Furore", "Furore Aquapetra", "Leonardo Furore 钢笔"], release: "2018", nib: "steel 或 14K gold；EF/F/M/B/Stub 1.1/1.5，部分 SKU 有 elastic", fill: "cartridge/converter；带金属外壳螺旋 converter", material: "意大利树脂、金属 trim、柔性滚轮夹", dimensions: "Aquapetra steel 约 146 mm 闭合、131 mm 笔杆、15.5 mm 帽径、10.6 mm 握位", weight: "Aquapetra steel 约 27 g；早期评测约 25 g", status: "2018 起的标准 Furore；颜色、尖和 trim 按 SKU", boundary: "本页只指标准 Furore converter 路线。Furore Grande 是后续更大活塞 sibling，不能把 1.5 ml piston 或 ebonite feed 写到标准款；Momento Zero 与 Momento Magico 也分别导航。", variants: [{ key: "furore-aquapetra-steel", name: "Furore Aquapetra steel", releaseYear: "当前 SKU", notes: "官方页面约 146 mm、27 g，steel nib 与金属外壳 converter。", sourceKey: SOURCES.leonardoFuroreSku.key }, { key: "furore-gold", name: "Furore 14K gold nib", releaseYear: "不同市场分批", notes: "14K 尖与 trim 是配置 variant；不能回填 converter 之外的活塞规格。", sourceKey: SOURCES.leonardoFuroreCollection.key }] }),
  makePen({ key: "leonardo-momento-magico", id: PHASE57_LEONARDO_MOMENTO_ID, slug: PHASE57_LEONARDO_MOMENTO_SLUG, name: "Leonardo Momento Magico", title: "Leonardo Momento Magico：墨窗与工坊自制 1.5 ml 活塞", summary: "Leonardo Momento Magico 是带可视墨窗与工坊自制活塞的独立系列；Matte Black 官方 SKU 约 145 mm、23.8 g、1.5 ml，feed 随尖型变化。", markdownFile: ".planning/content-research/leonardo-momento-magico.md", primary: SOURCES.leonardoMomentoSku, secondary: SOURCES.leonardoMomentoPdf, extra: [SOURCES.leonardoMomentoCollection, SOURCES.leonardoOfficialBrand, SOURCES.leonardoZero], svg: SOURCES.leonardoMomentoSvg, brandEntityId: PHASE57_LEONARDO_BRAND_ID, aliases: ["Leonardo Momento Magico", "Momento Magico Matte Black", "Leonardo 魔法时刻"], release: "约 2020 起；不同特别版分批", nib: "steel + ABS feed 或 14K gold + black ebonite feed；EF/F/M/B/Stub 1.1，gold elastic 另列", fill: "Leonardo 工坊自制 piston；约 1.5 ml；专用 316L piston tool", material: "特殊意大利树脂、中央装饰环、可视 ink window", dimensions: "Matte Black 约 145 mm 闭合、132 mm 笔杆、67 mm 笔帽、15.4 mm 帽径、10.9 mm 握位、10 mm 墨窗", weight: "Matte Black 未灌墨约 23.8 g；特别版约 24 g", status: "当前与特别版并存；颜色/trim/墨窗为 variants", boundary: "本页只指 Momento Magico 活塞路线；标准 Furore 是 converter，Momento Zero 是另一条 converter 型号。钢尖 ABS 与金尖 ebonite feed 必须按配置记录，不能把“Leonardo 金尖更湿”当作固定保证。", variants: [{ key: "momento-matte-black", name: "Momento Magico Matte Black", releaseYear: "当前官方 SKU", notes: "145/132/67 mm、23.8 g、10 mm 墨窗、1.5 ml 活塞，附专用拆卸工具说明。", sourceKey: SOURCES.leonardoMomentoSku.key }, { key: "momento-csn", name: "Momento Magico CSN / 彩色墨窗特别版", releaseYear: "约 2021", notes: "Il Pennofilo 资料约 146 mm、24 g、1.5 ml；彩色墨窗属于特别版，不覆盖普通 Matte Black。", sourceKey: SOURCES.leonardoMomentoPdf.key }] }),
];

export const phase57Opus88LeonardoRetire = [
  { sourceEntityId: PHASE57_OPUS_MIXED_ID, sourceSlug: PHASE57_OPUS_MIXED_SLUG, targetEntityId: null as string | null },
  { sourceEntityId: PHASE57_LEONARDO_MIXED_ID, sourceSlug: PHASE57_LEONARDO_MIXED_SLUG, targetEntityId: null as string | null },
];
