import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase107WancherBrandPack } from "./phase107-wancher-dream-pen-true-ebonite-matte-black";

export const PHASE360_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE360_TARGET_ID = "phase360-wancher-dream-pen-celluloid-kingyo";
export const PHASE360_TARGET_SLUG = "wancher-dream-pen-celluloid-kingyo";
const RETRIEVED = "2026-08-02";
const SCOPE = "phase360-wancher-celluloid-kingyo-current";
const SVG_PATH = "/images/library/site-original/phase360/wancher/dream-pen-celluloid-kingyo.svg";

function source(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup: string;
  homepageUrl?: string;
  author?: string;
  publishedAt?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const siteOriginal = sourceType === "user_submission";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    title: input.title,
    url: input.url,
    summary: input.summary,
    sourceType,
    tier: input.tier ?? (sourceType === "official" ? "primary" : "professional_secondary"),
    independenceGroup: input.independenceGroup,
    homepageUrl: input.homepageUrl ?? (siteOriginal ? "/" : input.url),
    itemType: siteOriginal ? "image" : "web_page",
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    allowedUse: siteOriginal ? "store_full" : "summary_only",
    license: siteOriginal ? "site-original" : undefined,
    archiveUrl: input.url,
    archiveLocator: siteOriginal
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  scopeKey: string = SCOPE,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.94,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
  scopeKey: string = SCOPE,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const S = {
  collection: source({
    key: "phase360-wancher-kingyo-product-collection",
    registryKey: "wancher-official-dream-pen-collection-phase360",
    registryName: "Wancher official",
    title: "Dream Pen collection — Dream Pen Celluloid KINGYO",
    url: "https://www.wancherpen.com/collections/our-products/dream-pen",
    independenceGroup: "wancher-official-dream-pen-collection-phase360",
    summary:
      "Wancher International Dream Pen collection 当前将 Dream Pen Celluloid - KINGYO 单独列为商品入口；商品集合用于 exact name 和当前 listing，不替 KINGYO 发布未列出的尺寸。",
  }),
  family: source({
    key: "phase360-wancher-kingyo-celluloid-family",
    registryKey: "wancher-official-celluloid-family-phase360",
    registryName: "Wancher official",
    title: "Dream Pen Celluloid: Kingyo, Bekko, Momiji & Seto",
    url: "https://www.wancherpen.com/pages/dreampen-celluloid-all-colors-kickstarter",
    independenceGroup: "wancher-official-celluloid-family-phase360",
    summary:
      "官方 family 页面说明 Kingyo 是金色与深红卷纹的传统 Japanese celluloid colorway，并把它与 Bekko、Momiji、Seto 的材料和颜色叙事分开。",
  }),
  jpCollection: source({
    key: "phase360-wancher-kingyo-japan-collection",
    registryKey: "wancher-japan-celluloid-collection-phase360",
    registryName: "Wancher Japan official",
    title: "Dream Pen Celluloid collection — Kyoto roll-up craft",
    url: "https://jp.wancherpen.com/collections/dream-pen-celluloid-collection/keiryu",
    independenceGroup: "wancher-japan-celluloid-collection-phase360",
    summary:
      "日本官方 collection 说明 Kyoto Celluloid、川上清、传统 Japanese Roll Up，以及 JoWo stainless、18K、Keiryu／Kodachi、钛螺纹和 925 银环的 family 语境。",
  }),
  jpColors: source({
    key: "phase360-wancher-kingyo-japan-colors",
    registryKey: "wancher-japan-celluloid-colors-phase360",
    registryName: "Wancher Japan official",
    title: "Dream Pen Celluloid all-colors introduction",
    url: "https://jp.wancherpen.com/pages/dream-pen-celluloid-introducing-all-colors-kickstarter-landing-page",
    independenceGroup: "wancher-japan-celluloid-colors-phase360",
    summary:
      "日本官方全色页面把金鱼描述为金色与深红色大理石卷纹，并区分传统 celluloid 与现代 cellulose acetate；颜色叙事不等于独立尺寸表。",
  }),
  project: source({
    key: "phase360-wancher-kingyo-japan-project",
    registryKey: "wancher-japan-celluloid-project-phase360",
    registryName: "Wancher Japan official",
    title: "Dream Pen Celluloid CAMPFIRE project page",
    url: "https://jp.wancherpen.com/pages/dream-pen-celluloid-campfire-2026",
    independenceGroup: "wancher-japan-celluloid-project-phase360",
    summary:
      "日本官方项目页列出金鱼、瀬戸、紅葉、鼈甲和桜颜色，说明国内项目安排；预告时间窗不等于所有颜色今天均有现货。",
    publishedAt: "2026",
  }),
  sakura: source({
    key: "phase360-wancher-kingyo-sakura-sibling",
    registryKey: "wancher-official-celluloid-sakura-sibling-phase360",
    registryName: "Wancher official",
    title: "Dream Pen Celluloid SAKURA exact product — sibling boundary",
    url: "https://www.wancherpen.com/products/dream-pen-celluloid-sakura",
    independenceGroup: "wancher-official-celluloid-sakura-sibling-phase360",
    summary:
      "SAKURA exact product page单独发布 146/128 mm 和 21 g 等规格；它只用来证明 sibling SKU 不能共享尺寸，不替 KINGYO 供给规格。",
  }),
  secondary: source({
    key: "phase360-wancher-kingyo-celluloid-secondary",
    registryKey: "fountain-pen-revolution-celluloid-phase360",
    registryName: "Fountain Pen Revolution",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "fountain-pen-revolution-celluloid-phase360",
    homepageUrl: "https://fprevolutionusa.com/",
    title: "Celluloid in Modern Fountain Pens — material care background",
    url: "https://fprevolutionusa.com/blogs/news/celluloid-in-modern-fountain-pens",
    author: "Kevin Thiemann",
    publishedAt: "2026-04-03",
    summary:
      "专业钢笔零售商文章提供现代 celluloid 的材料和保存背景；本页只用于维护边界，不让它替 Wancher 官方给出 KINGYO 尺寸、尖号或库存。",
  }),
  diagram: source({
    key: "phase360-wancher-kingyo-svg",
    registryKey: "fountain-pen-graph-editorial-phase360",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase360",
    title: "Wancher Dream Pen Celluloid KINGYO factual diagram",
    url: SVG_PATH,
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    summary:
      "本站原创 factual SVG，表达 KINGYO 的金红传统 celluloid、钛螺纹、925 银环和 family 尖材边界；非产品照片、Logo、比例图或颜色校样。",
  }),
} as const;

const brand: CuratedEntityPack = structuredClone(phase107WancherBrandPack);
brand.key = "phase360-wancher-brand-navigation-v1";
brand.markdownFile = ".planning/content-research/wancher-brand-phase360.md";
brand.storyTitle = "Wancher：Dream Pen Celluloid KINGYO 与 SAKURA 导航";
brand.sources = [
  ...brand.sources,
  S.collection,
  S.family,
  S.jpCollection,
  S.jpColors,
  S.project,
  S.sakura,
].filter((item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index);
const brandScope = brand.scopes[0]?.scopeKey ?? "phase360-wancher-brand-scope";
brand.claims = [
  ...brand.claims,
  {
    key: "phase360-wancher-kingyo-navigation",
    predicate: "brand_model_navigation",
    objectText:
      "Wancher 品牌页新增 Dream Pen Celluloid KINGYO 独立入口；它与 SAKURA、Bekko、Momiji、Seto 及 Urushi、Ebonite、木材系列分开，按 exact listing 维护材质和订单选项。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: S.collection.key,
    locator: "Dream Pen collection exact KINGYO listing",
    evidence: [{ key: "phase360-wancher-kingyo-navigation-evidence", sourceKey: S.collection.key, scopeKey: brandScope, locator: "Dream Pen Celluloid - KINGYO product entry" }],
  } satisfies CuratedClaim,
];

const model: CuratedEntityPack = {
  key: "phase360-wancher-dream-pen-celluloid-kingyo-v1",
  entityId: PHASE360_TARGET_ID,
  expectedType: "pen",
  expectedSlug: PHASE360_TARGET_SLUG,
  canonicalName: "Wancher Dream Pen Celluloid KINGYO",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-dream-pen-celluloid-kingyo-phase360.md",
  storyTitle: "Wancher Dream Pen Celluloid KINGYO：传统金红 celluloid 的具体入口",
  primarySourceKey: S.collection.key,
  depthTier: "A",
  aliases: [
    { alias: "Dream Pen Celluloid - KINGYO", language: "en", sourceKey: S.collection.key },
    { alias: "Dream Pen Celluloid Kingyo", language: "en", sourceKey: S.family.key },
    { alias: "ドリームペン・セルロイド金魚", language: "ja", sourceKey: S.project.key },
    { alias: "Wancher Dream Pen Celluloid KINGYO", language: "zh", sourceKey: S.collection.key },
    { alias: "万佳 Dream Pen Celluloid 金鱼", language: "zh", sourceKey: S.jpColors.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Wancher Dream Pen Celluloid KINGYO fountain pen",
      validFrom: "2025",
      productionState: "current",
      nibScope: "JoWo stainless, Wancher 18K, Keiryu/Kodachi and other family order options; exact nib by order",
      materialScope: "Traditional Celluloid KINGYO; titanium screw section and 925 sterling silver ring in family context",
      editionScope: "KINGYO only; excludes SAKURA, Bekko, Momiji, Seto and other Dream Pen materials",
    },
    {
      key: `${SCOPE}-boundary`,
      scopeKey: `${SCOPE}-boundary`,
      productionState: "current",
      editionScope: "KINGYO-specific dimensions and filling interface are not independently published in the current indexed listing; do not inherit sibling SAKURA values",
    },
    {
      key: `${SCOPE}-media`,
      scopeKey: `${SCOPE}-media`,
      productionState: "current",
      editionScope: "site-original factual SVG; not a product photo, logo, scale drawing or colour proof",
    },
  ],
  claims: [
    claim("phase360-identity", "model_identity", "Wancher Dream Pen Celluloid KINGYO 是官方商品集合单列的具体颜色／SKU，不是 Dream Pen 系列导航泛称，也不与 Urushi 金鱼主题合并。", S.collection.key, "exact KINGYO collection listing"),
    claim("phase360-colour", "colourway", "官方 family 和日本全色页面把 KINGYO 描述为金色与深红色卷纹，日语金魚意象对应传统 Japanese celluloid 颜色语境；颜色叙事不等于逐支色卡。", S.family.key, "Kingyo colourway description"),
    claim("phase360-material", "material_finish", "KINGYO 属于官方标为 Traditional Celluloid 的颜色；Bekko 同属传统语境，Momiji 与 Seto 的现代 cellulose acetate 结论不回填到 KINGYO。", S.family.key, "traditional versus modern celluloid boundary"),
    claim("phase360-craft", "craft_process", "日本官方 collection 将 Dream Pen Celluloid 与 Kyoto Celluloid、川上清和 Japanese Roll Up 技法联系起来；工艺来源不证明每支纹理和组装完全相同。", S.jpCollection.key, "Kyoto Celluloid and roll-up description"),
    claim("phase360-structure", "construction", "日本官方 family 语境列钛螺纹段和 925 sterling silver pen ring；金色饰面不是整支实心黄金，具体环色按订单核对。", S.jpCollection.key, "titanium section and sterling ring fields"),
    claim("phase360-nib", "nib_options", "日本官方 collection 列 JoWo stainless、Wancher 18K 与 Keiryu／Kodachi 路线；KINGYO 具体尖材和字幅仍以订单、尖面刻字与随笔单据为准。", S.jpCollection.key, "family nib options"),
    claim("phase360-fill", "filling_system", "当前可核实 KINGYO listing 未独立发布单一 filling system；本页不把 SAKURA 的 European International 或 Sailor standard 无条件回填给 KINGYO。", S.sakura.key, "sibling specification boundary"),
    claim("phase360-dimensions", "specification_boundary", "当前官方 KINGYO family／collection 页面未独立发布闭帽、开帽和重量表；SAKURA 的 146/128 mm、21 g 只属于 SAKURA。", S.sakura.key, "SAKURA exact dimensions must not be inherited"),
    claim("phase360-release", "release_window", "KINGYO 随 Celluloid Kickstarter 项目及后续 Dream Pen 商品集合进入市场；项目预告和发货窗口不等于今日所有地区的库存保证。", S.project.key, "official project colour list and timing"),
    claim("phase360-secondary-context", "secondary_context", "Fountain Pen Revolution 的专业文章提供现代 celluloid 的保存背景；本页只把它用于维护边界，不用它替 Wancher 官方发布 KINGYO 规格。", S.secondary.key, "professional celluloid care context", SCOPE, "core"),
    claim("phase360-care", "maintenance_guidance", "传统 celluloid 应远离高温、火源、长时强光和酒精／溶剂；用室温水清洁并自然干燥，银环与钛螺纹不使用粗糙抛光剂。", S.secondary.key, "celluloid maintenance boundary", SCOPE, "editorial"),
    claim("phase360-selection", "selection_guidance", "选购先核对 Dream Pen Celluloid - KINGYO 完整名称、Traditional Celluloid、环色、尖材、字幅、接口和实拍纹理；不要按金红颜色自动合并其他 Dream Pen。", S.collection.key, "exact product selection boundary", SCOPE, "editorial"),
    claim("phase360-media", "media_identity_boundary", "本站原创 SVG 是 KINGYO 的事实示意图，非产品照片、非 Logo、非比例图、非颜色校样，不证明真实纹理、库存、包装或尺寸。", S.diagram.key, "site-original SVG metadata", `${SCOPE}-media`, "editorial"),
  ],
  variants: [
    { key: "phase360-kingyo-traditional-celluloid", name: "KINGYO Traditional Celluloid colourway", releaseYear: "2025", notes: "官方 family 标明金色与深红卷纹的传统 Japanese celluloid 颜色语境。", sourceKey: S.family.key, variantKind: "color", market: "Wancher official" },
    { key: "phase360-kingyo-jowo", name: "KINGYO JoWo stainless nib route", releaseYear: "2025", notes: "日本官方 collection 列出的 JoWo stainless family 路线；具体字幅按订单。", sourceKey: S.jpCollection.key, variantKind: "nib", market: "Wancher official" },
    { key: "phase360-kingyo-18k", name: "KINGYO Wancher 18K nib route", releaseYear: "2025", notes: "日本官方 collection 列出的 18K family 路线；不把它写成每支 KINGYO 固定配置。", sourceKey: S.jpCollection.key, variantKind: "nib", market: "Wancher official" },
    { key: "phase360-kingyo-keiryu", name: "KINGYO Keiryu / Kodachi nib route", releaseYear: "2025", notes: "特制 Keiryu／Kodachi 路线；尖名不直接承诺 flex 性能。", sourceKey: S.jpCollection.key, variantKind: "nib", market: "Wancher official" },
    { key: "phase360-kingyo-ring-option", name: "KINGYO sterling ring colour option", releaseYear: "2025", notes: "925 sterling ring 的具体 Gold／Silver 饰面要以当日订单和实物核对。", sourceKey: S.jpCollection.key, variantKind: "color", market: "Wancher official" },
  ],
  spec: {
    brandEntityId: PHASE360_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Dream Pen Celluloid KINGYO",
      release_year: "2025（Celluloid Kickstarter 项目及后续商品集合）",
      origin_country: "Kyoto, Japan; Wancher × Kyoto Celluloid project context",
      nib: "JoWo stainless, Wancher 18K, Keiryu/Kodachi and other family options; exact nib by order",
      fill_system: "KINGYO-specific interface not separately published in current indexed listing; verify selected order",
      material: "Traditional Celluloid KINGYO; titanium screw section and 925 sterling silver ring family context",
      dimensions: "KINGYO-specific dimensions not separately published; do not inherit SAKURA 146/128 mm or 21 g",
      status: "current official collection listing; colour, nib, stock, price and package vary by order and market",
    },
    evidence: [
      evidence("phase360-brand", "brand_entity_id", S.collection.key, "Wancher maker identity"),
      evidence("phase360-series", "series_name", S.collection.key, "exact KINGYO product listing"),
      evidence("phase360-release", "release_year", S.project.key, "official Celluloid project colour list"),
      evidence("phase360-origin", "origin_country", S.jpCollection.key, "Kyoto Celluloid project context"),
      evidence("phase360-nib", "nib", S.jpCollection.key, "JoWo, 18K and Keiryu family routes"),
      evidence("phase360-fill", "fill_system", S.sakura.key, "sibling page boundary; no KINGYO interface backfill"),
      evidence("phase360-material", "material", S.family.key, "Traditional Celluloid KINGYO material label"),
      evidence("phase360-dimensions", "dimensions", S.sakura.key, "SAKURA dimensions excluded from KINGYO"),
      evidence("phase360-status", "status", S.collection.key, "current official collection listing"),
    ],
  },
  timeline: [
    {
      key: "phase360-kingyo-launch",
      title: "Dream Pen Celluloid KINGYO 随 Celluloid 项目进入商品集合",
      eventType: "model_released",
      startDate: "2025",
      circa: false,
      description: "官方 family、项目页和 Dream Pen collection 共同记录 KINGYO 颜色入口；具体批次和库存随市场变化。",
      sourceKey: S.project.key,
    },
  ],
  media: [
    {
      key: "phase360-kingyo-primary-media",
      title: "Wancher Dream Pen Celluloid KINGYO 事实图（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary",
    },
  ],
};

export const phase360WancherDreamPenCelluloidKingyoPacks: CuratedEntityPack[] = [brand, model];
