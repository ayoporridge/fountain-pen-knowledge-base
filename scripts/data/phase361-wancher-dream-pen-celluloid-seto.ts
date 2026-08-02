import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase107WancherBrandPack } from "./phase107-wancher-dream-pen-true-ebonite-matte-black";

export const PHASE361_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE361_TARGET_ID = "phase361-wancher-dream-pen-celluloid-seto";
export const PHASE361_TARGET_SLUG = "wancher-dream-pen-celluloid-seto";
const RETRIEVED = "2026-08-02";
const SCOPE = "phase361-wancher-celluloid-seto-current";
const SVG_PATH = "/images/library/site-original/phase361/wancher/dream-pen-celluloid-seto.svg";

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
  product: source({
    key: "phase361-wancher-seto-official-product",
    registryKey: "wancher-official-seto-product-phase361",
    registryName: "Wancher official",
    title: "Dream Pen Celluloid - SETO",
    url: "https://www.wancherpen.com/products/dream-pen-celluloid-seto",
    independenceGroup: "wancher-official-seto-product-phase361",
    summary:
      "官方 SETO exact product page 记录 2025 Kickstarter、Acetate Celluloid、Kyoto、Titanium Screw Section、Sterling Silver Ring、European C/C、Sailor standard for 18K、146/128 mm 和 21 g。",
    publishedAt: "2025",
  }),
  family: source({
    key: "phase361-wancher-seto-family",
    registryKey: "wancher-official-celluloid-family-phase361",
    registryName: "Wancher official",
    title: "Dream Pen Celluloid: Kingyo, Bekko, Momiji & Seto",
    url: "https://www.wancherpen.com/pages/dreampen-celluloid-all-colors-kickstarter",
    independenceGroup: "wancher-official-celluloid-family-phase361",
    summary:
      "官方 family 页面把 Seto 解释为濑户内海意象的蓝色渐变，并标作现代 cellulose acetate，与 Kingyo、Bekko 的传统 celluloid 边界分开。",
  }),
  jpCollection: source({
    key: "phase361-wancher-seto-japan-collection",
    registryKey: "wancher-japan-celluloid-collection-phase361",
    registryName: "Wancher Japan official",
    title: "Dream Pen Celluloid collection — Kyoto roll-up and nib options",
    url: "https://jp.wancherpen.com/collections/dream-pen-celluloid-collection/keiryu",
    independenceGroup: "wancher-japan-celluloid-collection-phase361",
    summary:
      "日本官方 collection 说明 Kyoto Celluloid、川上清、Japanese Roll Up、JoWo stainless、18K、Keiryu／Kodachi、钛螺纹和 925 银环的 family 语境。",
  }),
  jpColors: source({
    key: "phase361-wancher-seto-japan-colors",
    registryKey: "wancher-japan-celluloid-colors-phase361",
    registryName: "Wancher Japan official",
    title: "Dream Pen Celluloid all-colors introduction",
    url: "https://jp.wancherpen.com/pages/dream-pen-celluloid-introducing-all-colors-kickstarter-landing-page",
    independenceGroup: "wancher-japan-celluloid-colors-phase361",
    summary:
      "日本官方全色页面把 Seto 说明为浅深蓝相间、取意濑户内海的现代 acetate 颜色，并强调颜色与工艺语境，不替 exact product 发布新尺寸。",
  }),
  project: source({
    key: "phase361-wancher-seto-japan-project",
    registryKey: "wancher-japan-celluloid-project-phase361",
    registryName: "Wancher Japan official",
    title: "Dream Pen Celluloid CAMPFIRE project page",
    url: "https://jp.wancherpen.com/pages/dream-pen-celluloid-campfire-2026",
    independenceGroup: "wancher-japan-celluloid-project-phase361",
    summary:
      "日本官方项目页列出 Seto、Kingyo、Momiji、Bekko 和 Sakura 的颜色入口及国内项目安排；预告时间窗不等于今日库存。",
    publishedAt: "2026",
  }),
  retailer: source({
    key: "phase361-wancher-seto-stilo-estile",
    registryKey: "stiloestile-wancher-seto-phase361",
    registryName: "Stilo & Stile",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "stiloestile-wancher-seto-phase361",
    homepageUrl: "https://www.stiloestile.com/",
    title: "Wancher Dream Pen Celluloid SETO independent listing",
    url: "https://www.stiloestile.com/en/fountain-pens/wancher-dream-pen-celluloid-fountain-pen-seto",
    summary:
      "专业零售商 SETO listing 列 Standard C/C、钢尖、144 mm closed、127 mm body、22 g；与官方 146/128/21 g 形成测量定义或样本差异，不能静默覆盖。",
  }),
  care: source({
    key: "phase361-wancher-seto-celluloid-care",
    registryKey: "fountain-pen-revolution-celluloid-phase361",
    registryName: "Fountain Pen Revolution",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "fountain-pen-revolution-celluloid-phase361",
    homepageUrl: "https://fprevolutionusa.com/",
    title: "Celluloid in Modern Fountain Pens — care background",
    url: "https://fprevolutionusa.com/blogs/news/celluloid-in-modern-fountain-pens",
    author: "Kevin Thiemann",
    publishedAt: "2026-04-03",
    summary:
      "专业钢笔零售商文章提供 celluloid／acetate 的温和保存背景；本页只用于维护边界，不替 Wancher 官方发布 SETO 尺寸或尖材。",
  }),
  diagram: source({
    key: "phase361-wancher-seto-svg",
    registryKey: "fountain-pen-graph-editorial-phase361",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase361",
    title: "Wancher Dream Pen Celluloid SETO factual diagram",
    url: SVG_PATH,
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    summary:
      "本站原创 factual SVG，表达 SETO acetate celluloid、蓝色渐变、钛螺纹、925 银环、C/C 与官方／零售测量边界；非产品照片、Logo、比例图或颜色校样。",
  }),
} as const;

const brand: CuratedEntityPack = structuredClone(phase107WancherBrandPack);
brand.key = "phase361-wancher-brand-navigation-v1";
brand.markdownFile = ".planning/content-research/wancher-brand-phase361.md";
brand.storyTitle = "Wancher：Dream Pen Celluloid SETO 与材料导航";
brand.sources = [...brand.sources, S.product, S.family, S.jpCollection, S.jpColors, S.project].filter(
  (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
);
const brandScope = brand.scopes[0]?.scopeKey ?? "phase361-wancher-brand-scope";
brand.claims = [
  ...brand.claims,
  {
    key: "phase361-wancher-seto-navigation",
    predicate: "brand_model_navigation",
    objectText:
      "Wancher 品牌页新增 Dream Pen Celluloid SETO 独立入口；SETO 是现代 acetate 的蓝色渐变 SKU，与 KINGYO、SAKURA、Bekko、Momiji 及其他材料系列分开。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: S.product.key,
    locator: "exact SETO product title and family boundary",
    evidence: [{ key: "phase361-wancher-seto-navigation-evidence", sourceKey: S.product.key, scopeKey: brandScope, locator: "Dream Pen Celluloid - SETO exact product page" }],
  } satisfies CuratedClaim,
];

const model: CuratedEntityPack = {
  key: "phase361-wancher-dream-pen-celluloid-seto-v1",
  entityId: PHASE361_TARGET_ID,
  expectedType: "pen",
  expectedSlug: PHASE361_TARGET_SLUG,
  canonicalName: "Wancher Dream Pen Celluloid SETO",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-dream-pen-celluloid-seto-phase361.md",
  storyTitle: "Wancher Dream Pen Celluloid SETO：濑户蓝色 acetate 的具体 SKU",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Dream Pen Celluloid - SETO", language: "en", sourceKey: S.product.key },
    { alias: "Dream Pen Celluloid Seto", language: "en", sourceKey: S.family.key },
    { alias: "ドリームペン・セルロイド瀬戸", language: "ja", sourceKey: S.project.key },
    { alias: "Wancher Dream Pen Celluloid SETO", language: "zh", sourceKey: S.product.key },
    { alias: "万佳 Dream Pen Celluloid 濑户", language: "zh", sourceKey: S.jpColors.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Wancher Dream Pen Celluloid SETO fountain pen",
      validFrom: "2025",
      productionState: "current",
      nibScope: "JoWo stainless, Wancher 18K, Keiryu/Kodachi and other family/order options; exact nib by order",
      materialScope: "Acetate Celluloid / cellulose acetate SETO; titanium screw section; sterling silver ring",
      editionScope: "SETO only; excludes KINGYO, SAKURA, Bekko, Momiji and other Dream Pen materials",
    },
    {
      key: `${SCOPE}-measurement-boundary`,
      scopeKey: `${SCOPE}-measurement-boundary`,
      productionState: "current",
      editionScope: "Official exact page 146/128 mm and 21 g; Stilo & Stile sample 144/127 mm and 22 g retained as independent measurement",
    },
    {
      key: `${SCOPE}-media`,
      scopeKey: `${SCOPE}-media`,
      productionState: "current",
      editionScope: "site-original factual SVG; not a product photo, logo, scale drawing or colour proof",
    },
  ],
  claims: [
    claim("phase361-identity", "model_identity", "Wancher Dream Pen Celluloid SETO 是官方 exact product page 单列的具体 SKU，不是 Dream Pen 蓝色泛称，也不与其他蓝色材料实体合并。", S.product.key, "exact SETO product title"),
    claim("phase361-launch", "release_window", "官方 exact page 写明 SETO 在 2025 年 Kickstarter 成功推出；项目和地区 listing 的库存、价格与发货时间另行核对。", S.product.key, "2025 Kickstarter success statement"),
    claim("phase361-colour", "colourway", "SETO 名称取意濑户内海，官方以浅深蓝 marbled gradients 描述海面反光与波浪；颜色叙事不等于每支纹理完全相同。", S.family.key, "Seto colourway description"),
    claim("phase361-material", "material_finish", "SETO exact page 写 Acetate Celluloid，family 页面将其归入 modern cellulose acetate；不把 KINGYO／Bekko 的传统 celluloid 结论回填。", S.product.key, "Acetate Celluloid exact material field"),
    claim("phase361-craft", "craft_process", "日本官方 collection 将 Celluloid family 与 Kyoto Celluloid、川上清和 Japanese Roll Up 技法联系起来；工艺来源不证明每支笔由同一人完整组装。", S.jpCollection.key, "Kyoto Celluloid and roll-up craft"),
    claim("phase361-structure", "construction", "SETO 使用 Titanium Screw Section 和 Sterling Silver Ring；925 是银材质纯度标记，金色环选项不是实心黄金。", S.product.key, "official material and ring fields"),
    claim("phase361-fill", "filling_system", "SETO 采用 European International Standard converter 或 cartridge，18K nib option 使用 Sailor converter 或 Sailor cartridge；接口随尖材订单确认。", S.product.key, "official filling-system specification"),
    claim("phase361-size", "specification", "Wancher exact page 给出闭帽 146 mm、开帽 128 mm、21 g；这组数字绑定 SETO 当前官方页，不回填给 sibling。", S.product.key, "official length and weight table"),
    claim("phase361-conflict", "measurement_conflict", "Stilo & Stile 的独立 listing 给 144/127 mm、22 g；它与官方 146/128/21 g 可能采用不同测量定义或样本，本页并列保留，不静默覆盖。", S.retailer.key, "independent SETO measurement sample", SCOPE, "core"),
    claim("phase361-nib", "nib_options", "日本官方 collection 列 JoWo stainless、18K、Keiryu／Kodachi 路线；具体尖材和字幅要以订单与尖面刻字核对。", S.jpCollection.key, "family nib options"),
    claim("phase361-secondary-context", "secondary_context", "Fountain Pen Revolution 的专业文章提供 celluloid／acetate 的保存背景；本页只把它用于维护边界，不用它替 Wancher 发布 SETO 规格。", S.care.key, "professional material care context", SCOPE, "core"),
    claim("phase361-care", "maintenance_guidance", "SETO 远离高温、火源、长时强光和酒精／溶剂；用室温水清洁、排空 converter 并自然干燥，银环和钛螺纹不用粗糙抛光剂。", S.care.key, "celluloid and acetate maintenance boundary", SCOPE, "editorial"),
    claim("phase361-selection", "selection_guidance", "选购先核对 SETO 完整商品名、Acetate Celluloid、环色、尖材、字幅、C/C 和测量方法；不要把 Wancher blue 自动合并其他系列。", S.product.key, "exact product selection boundary", SCOPE, "editorial"),
    claim("phase361-media", "media_identity_boundary", "本站原创 SVG 是 SETO 事实示意图，非产品照片、非 Logo、非比例图、非颜色校样，不证明真实蓝纹、库存、包装或价格。", S.diagram.key, "site-original SVG metadata", `${SCOPE}-media`, "editorial"),
  ],
  variants: [
    { key: "phase361-seto-acetate", name: "SETO Acetate Celluloid blue gradient", releaseYear: "2025", notes: "官方 family 标为现代 cellulose acetate；蓝色渐变取意濑户内海。", sourceKey: S.family.key, variantKind: "material", market: "Wancher official" },
    { key: "phase361-seto-ring-gold", name: "SETO Gold sterling ring option", releaseYear: "2025", notes: "912 Sterling Ring Color 的 Gold 选项；不写成实心黄金。", sourceKey: S.product.key, variantKind: "color", market: "Wancher official" },
    { key: "phase361-seto-ring-silver", name: "SETO Silver sterling ring option", releaseYear: "2025", notes: "912 Sterling Ring Color 的 Silver 选项；仍以 sterling silver ring 记录。", sourceKey: S.product.key, variantKind: "color", market: "Wancher official" },
    { key: "phase361-seto-jowo", name: "SETO JoWo stainless nib route", releaseYear: "2025", notes: "日本 official Celluloid collection 列出的 JoWo stainless 路线；字幅按订单。", sourceKey: S.jpCollection.key, variantKind: "nib", market: "Wancher official" },
    { key: "phase361-seto-18k-keiryu", name: "SETO Wancher 18K / Keiryu route", releaseYear: "2025", notes: "18K、Keiryu／Kodachi 为 family/order 路线；接口与尖调校按订单确认。", sourceKey: S.jpCollection.key, variantKind: "nib", market: "Wancher official" },
  ],
  spec: {
    brandEntityId: PHASE361_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Dream Pen Celluloid SETO",
      release_year: "2025（Kickstarter 项目后进入官网商品页）",
      origin_country: "Kyoto, Japan; Wancher × Kyoto Celluloid product context",
      nib: "JoWo stainless, Wancher 18K, Keiryu/Kodachi and other family/order options; exact nib by order",
      fill_system: "European International cartridge/converter; Sailor standard converter/cartridge for 18K nib option",
      material: "Acetate Celluloid / cellulose acetate; titanium screw section; sterling silver ring",
      dimensions: "Official 146 mm closed / 128 mm opened / 21 g; Stilo & Stile sample 144/127 mm / 22 g retained separately",
      status: "current official exact product page; ring, nib, stock, price and market vary",
    },
    evidence: [
      evidence("phase361-brand", "brand_entity_id", S.product.key, "Wancher maker identity"),
      evidence("phase361-series", "series_name", S.product.key, "exact SETO product title"),
      evidence("phase361-release", "release_year", S.product.key, "2025 Kickstarter success statement"),
      evidence("phase361-origin", "origin_country", S.product.key, "Kyoto, Japan origin field"),
      evidence("phase361-nib", "nib", S.jpCollection.key, "JoWo, 18K and Keiryu family routes"),
      evidence("phase361-fill", "fill_system", S.product.key, "European and Sailor filling-system fields"),
      evidence("phase361-material", "material", S.product.key, "Acetate Celluloid exact field"),
      evidence("phase361-dimensions", "dimensions", S.product.key, "official length and weight table"),
      evidence("phase361-status", "status", S.product.key, "current exact product listing"),
    ],
  },
  timeline: [
    {
      key: "phase361-seto-launch",
      title: "Dream Pen Celluloid SETO 在 2025 Kickstarter 项目后进入官网",
      eventType: "model_released",
      startDate: "2025",
      circa: false,
      description: "官方 exact product page 记录 2025 Kickstarter 成功推出；项目和地区上市时间不等于库存保证。",
      sourceKey: S.product.key,
    },
  ],
  media: [
    {
      key: "phase361-seto-primary-media",
      title: "Wancher Dream Pen Celluloid SETO 事实图（非产品照片）",
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

export const phase361WancherDreamPenCelluloidSetoPacks: CuratedEntityPack[] = [brand, model];
