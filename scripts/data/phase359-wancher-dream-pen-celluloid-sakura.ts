import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase107WancherBrandPack } from "./phase107-wancher-dream-pen-true-ebonite-matte-black";

export const PHASE359_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE359_TARGET_ID = "phase359-wancher-dream-pen-celluloid-sakura";
export const PHASE359_TARGET_SLUG = "wancher-dream-pen-celluloid-sakura";
const RETRIEVED = "2026-08-02";
const SCOPE = "phase359-wancher-celluloid-sakura-current";
const SVG_PATH = "/images/library/site-original/phase359/wancher/dream-pen-celluloid-sakura.svg";

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
    key: "phase359-wancher-celluloid-sakura-product",
    registryKey: "wancher-official-celluloid-sakura-phase359",
    registryName: "Wancher official",
    title: "Dream Pen Celluloid - SAKURA",
    url: "https://www.wancherpen.com/products/dream-pen-celluloid-sakura",
    independenceGroup: "wancher-official-celluloid-sakura-product-phase359",
    summary:
      "官方 SAKURA 商品页记录 2025 Kickstarter 后的 Traditional Celluloid、Kyoto 原产、钛螺纹段、925 银环、C/C、146/128 mm 和 21 g；环色与尖材仍按选项核对。",
    publishedAt: "2025",
  }),
  family: source({
    key: "phase359-wancher-celluloid-family",
    registryKey: "wancher-official-celluloid-family-phase359",
    registryName: "Wancher official",
    title: "Dream Pen Celluloid: Kingyo, Bekko, Momiji & Seto",
    url: "https://www.wancherpen.com/pages/dreampen-celluloid-all-colors-kickstarter",
    independenceGroup: "wancher-official-celluloid-family-phase359",
    summary:
      "官方 family 页面区分 Kingyo、Bekko、Momiji、Seto 的颜色语义与传统 celluloid／现代 cellulose acetate 边界，用于 sibling 关系而非替代 SAKURA 商品规格。",
  }),
  jpCollection: source({
    key: "phase359-wancher-celluloid-japan-collection",
    registryKey: "wancher-japan-celluloid-collection-phase359",
    registryName: "Wancher Japan official",
    title: "Dream Pen Celluloid collection — Kyoto roll-up craft",
    url: "https://jp.wancherpen.com/collections/dream-pen-celluloid-collection",
    independenceGroup: "wancher-japan-celluloid-collection-phase359",
    summary:
      "日本官方 collection 说明 Kyoto Celluloid 川上清以传统 roll-up 技法手工制作，并列 JoWo stainless、18K 与 Keiryu 尖路线；不把工艺叙事扩为所有 Wancher 型号。",
  }),
  jpLanding: source({
    key: "phase359-wancher-celluloid-japan-landing",
    registryKey: "wancher-japan-celluloid-landing-phase359",
    registryName: "Wancher Japan official",
    title: "Wancher × Kyoto Celluloid project landing page",
    url: "https://jp.wancherpen.com/pages/wancher-x-kyoto-celluloid-dream-pen-celluloid-landing-page",
    independenceGroup: "wancher-japan-celluloid-landing-phase359",
    summary:
      "日本官方项目页说明复兴日本 celluloid 工艺、925 sterling silver 与 titanium 组合，并把项目指向 Kickstarter；不承诺每个颜色的纹理或库存。",
  }),
  dreamCollection: source({
    key: "phase359-wancher-dream-pen-collection",
    registryKey: "wancher-official-dream-pen-collection-phase359",
    registryName: "Wancher official",
    title: "Dream Pen fountain pen collection",
    url: "https://www.wancherpen.com/collections/dream-pen",
    independenceGroup: "wancher-official-dream-pen-collection-phase359",
    summary:
      "官方 Dream Pen collection 将 Urushi、Ebonite、Celluloid 等不同材料放在系列导航中；它只证明家族入口，不提供 SAKURA 以外颜色的统一尺寸。",
  }),
  kickstarterUpdate: source({
    key: "phase359-wancher-celluloid-kickstarter-update",
    registryKey: "wancher-official-celluloid-kickstarter-update-phase359",
    registryName: "Wancher official",
    title: "Dream Pen Celluloid Kickstarter Project Update July 2025",
    url: "https://www.wancherpen.com/blogs/news/dream-pen-celluloid-kickstarter-project-update-july-2025",
    independenceGroup: "wancher-official-celluloid-kickstarter-update-phase359",
    publishedAt: "2025-07",
    summary:
      "官方 Kickstarter 更新记录 2025 年不同颜色的发货批次，并说明普通购买者预计在 2025 年末至 2026 年初进入 online store；时间窗不等于今日现货。",
  }),
  secondary: source({
    key: "phase359-wancher-celluloid-fountain-pen-revolution",
    registryKey: "fountain-pen-revolution-celluloid-phase359",
    registryName: "Fountain Pen Revolution",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "fountain-pen-revolution-celluloid-phase359",
    title: "Celluloid in Modern Fountain Pens — Wancher Dream Pen Celluloid Sakura",
    url: "https://fprevolutionusa.com/blogs/news/celluloid-in-modern-fountain-pens",
    homepageUrl: "https://fprevolutionusa.com/",
    author: "Kevin Thiemann",
    publishedAt: "2026-04-03",
    summary:
      "专业钢笔零售商文章把 Wancher Dream Pen Celluloid Sakura 放入现代 celluloid 对比，并提醒材料需要谨慎维护；只作独立背景，不替官方给尺寸和尖号。",
  }),
  diagram: source({
    key: "phase359-wancher-celluloid-sakura-svg",
    registryKey: "fountain-pen-graph-editorial-phase359",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase359",
    title: "Wancher Dream Pen Celluloid SAKURA factual diagram",
    url: SVG_PATH,
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    summary:
      "本站原创 factual SVG，表达 Kyoto celluloid、titanium screw section、925 ring、C/C 与官网 146/128 mm、21 g；非产品照片、Logo、比例图或颜色校样。",
  }),
} as const;

const brand = structuredClone(phase107WancherBrandPack);
brand.key = "phase359-wancher-brand-navigation-v1";
brand.markdownFile = ".planning/content-research/wancher-brand-phase359.md";
brand.storyTitle = "Wancher：Dream Pen、Sekai 与 Kyoto Celluloid SAKURA 导航";
brand.sources = [...brand.sources, S.family, S.jpCollection, S.jpLanding, S.dreamCollection, S.product].filter(
  (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
);
const brandScope = brand.scopes[0]?.scopeKey ?? "phase359-wancher-brand-scope";
brand.claims = [
  ...brand.claims,
  {
    key: "phase359-wancher-celluloid-navigation",
    predicate: "brand_model_navigation",
    objectText:
      "Wancher 品牌页新增 Dream Pen Celluloid SAKURA 独立入口；它与 True Ebonite、Urushi、World Tree、Sekai 及 Celluloid sibling 颜色分开，按 exact product 页面维护材料和尖材。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: S.product.key,
    locator: "exact SAKURA product and Dream Pen family navigation",
    evidence: [{ key: "phase359-wancher-celluloid-navigation-evidence", sourceKey: S.product.key, scopeKey: brandScope, locator: "Dream Pen Celluloid - SAKURA exact product title" }],
  } satisfies CuratedClaim,
];

const model: CuratedEntityPack = {
  key: "phase359-wancher-dream-pen-celluloid-sakura-v1",
  entityId: PHASE359_TARGET_ID,
  expectedType: "pen",
  expectedSlug: PHASE359_TARGET_SLUG,
  canonicalName: "Wancher Dream Pen Celluloid SAKURA",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-dream-pen-celluloid-sakura-phase359.md",
  storyTitle: "Wancher Dream Pen Celluloid SAKURA：Kyoto roll-up celluloid 的具体 SKU",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Wancher Dream Pen Celluloid - SAKURA", language: "en", sourceKey: S.product.key },
    { alias: "Dream Pen Celluloid Sakura", language: "en", sourceKey: S.secondary.key },
    { alias: "Wancher × Kyoto Celluloid Sakura", language: "en", sourceKey: S.family.key },
    { alias: "Wancher Dream Pen Celluloid SAKURA", language: "zh", sourceKey: S.product.key },
    { alias: "万佳 Dream Pen Celluloid 樱花", language: "zh", sourceKey: S.jpLanding.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Wancher Dream Pen Celluloid SAKURA fountain pen",
      validFrom: "2025",
      productionState: "current",
      nibScope: "JoWo stainless, Wancher 18K, Keiryu/Kodachi and other order options; exact nib by order",
      materialScope: "Traditional Celluloid; titanium screw section; 925 sterling silver ring; Gold/Silver ring option",
      editionScope: "SAKURA only; excludes Kingyo, Bekko, Momiji, Seto and other Dream Pen materials",
    },
    {
      key: `${SCOPE}-family-boundary`,
      scopeKey: `${SCOPE}-family-boundary`,
      productionState: "current",
      editionScope: "Celluloid family sibling boundary; Momiji/Seto modern cellulose acetate statements do not replace SAKURA traditional celluloid",
    },
    {
      key: `${SCOPE}-media`,
      scopeKey: `${SCOPE}-media`,
      productionState: "current",
      editionScope: "site-original factual SVG; not a product photo, logo, scale drawing or colour proof",
    },
  ],
  claims: [
    claim("phase359-identity", "model_identity", "Wancher Dream Pen Celluloid SAKURA 是官方独立商品入口，不是 Dream Pen 系列导航页的泛称，也不与 Echizen Urushi Sakura Zukiyo 合并。", S.product.key, "exact product title and sibling boundary"),
    claim("phase359-launch", "release_window", "官方产品页写明 Celluloid 项目在 2025 年 Kickstarter 成功推出；Kickstarter update 的发货与网店上市是项目时间窗，不是今日库存保证。", S.kickstarterUpdate.key, "2025 Kickstarter shipping and store timing"),
    claim("phase359-material", "material_finish", "SAKURA 产品页列 Traditional Celluloid、Kyoto, Japan、Titanium Screw Section 与 Sterling Silver Ring；Gold/Silver 是环色选项，不是整支实心金。", S.product.key, "official specifications material/origin/ring fields"),
    claim("phase359-craft", "craft_process", "日本官方 collection 将 Dream Pen Celluloid 与 Kyoto Celluloid、传统 Japanese Roll Up 技法和手工作业联系起来；工艺叙事不证明每支纹理完全相同。", S.jpCollection.key, "Kyoto Celluloid and roll-up craft description"),
    claim("phase359-design", "design_language", "SAKURA 沿用 Celluloid family 的 step-down 设计；官方用 1980 年代日本高级钢笔语汇解释阶差，实际握感仍需按手型与尖调校判断。", S.product.key, "vintage-inspired step-down design section"),
    claim("phase359-nib", "nib_options", "日本官方 collection 列 JoWo stainless、18K 与 Keiryu 路线；SAKURA 的尖材与字幅按订单、尖面刻字和随笔单据核对。", S.jpCollection.key, "nib options in Japanese collection"),
    claim("phase359-fill", "filling_system", "SAKURA 采用 European International cartridge/converter；18K nib option 可用 Sailor converter 或 Sailor cartridge，不把两种接口写成无条件互换。", S.product.key, "official filling-system specification"),
    claim("phase359-size", "specification", "官网规格为闭帽 146 mm、开帽 128 mm、重 21 g；这组数字绑定 SAKURA 产品页，不回填到其他颜色、尖材或饰面。", S.product.key, "official length and weight table"),
    claim("phase359-sibling", "version_boundary", "Kingyo、Bekko、Momiji、Seto 是 Celluloid family sibling；官方 family 页区分传统 celluloid 与现代 cellulose acetate，不能把颜色和材料结论互借。", S.family.key, "family color and material boundary"),
    claim("phase359-secondary-context", "secondary_context", "Fountain Pen Revolution 的专业文章把 Dream Pen Celluloid Sakura 列入现代 celluloid 对比，提供材料背景；它不替 Wancher 官方给出尺寸、尖号、颜色或库存规格。", S.secondary.key, "article inclusion of Wancher Dream Pen Celluloid Sakura", SCOPE, "core"),
    claim("phase359-care", "maintenance_guidance", "Celluloid 远离高温、火源、强光和酒精／溶剂；用室温水清洗、排空 converter 并自然干燥，银环和钛螺纹不使用粗糙抛光剂。", S.secondary.key, "professional celluloid care boundary", SCOPE, "editorial"),
    claim("phase359-selection", "selection_guidance", "选购先核对 SAKURA 完整商品名、Gold/Silver 环色、尖材与字幅、converter／盒卡和纹理照片；“Wancher Sakura”不足以证明具体系列。", S.product.key, "exact product option and family boundary", SCOPE, "editorial"),
    claim("phase359-media", "media_identity_boundary", "本站原创 SVG 是事实示意图，非产品照片、非 Logo、非比例图、非颜色校样，不证明每支 SAKURA 的纹理、库存或包装。", S.diagram.key, "site-original SVG metadata", `${SCOPE}-media`, "editorial"),
  ],
  variants: [
    { key: "phase359-sakura-ring-gold", name: "SAKURA Gold sterling ring", releaseYear: "2025", notes: "912 Sterling Ring Color 的 Gold 选项；记录环色，不把金色写成实心金。", sourceKey: S.product.key, variantKind: "color", productCode: "SAKURA-GOLD-RING", market: "Wancher official" },
    { key: "phase359-sakura-ring-silver", name: "SAKURA Silver sterling ring", releaseYear: "2025", notes: "912 Sterling Ring Color 的 Silver 选项；仍是 925 sterling silver ring。", sourceKey: S.product.key, variantKind: "color", productCode: "SAKURA-SILVER-RING", market: "Wancher official" },
    { key: "phase359-sakura-jowo", name: "SAKURA JoWo stainless nib", releaseYear: "2025", notes: "日本官方 collection 列出的 JoWo stainless 路线；字幅按订单。", sourceKey: S.jpCollection.key, variantKind: "nib", market: "Wancher official" },
    { key: "phase359-sakura-18k", name: "SAKURA Wancher 18K nib", releaseYear: "2025", notes: "18K 选项的 converter/cartridge 采用 Sailor standard；具体尖宽按订单。", sourceKey: S.product.key, variantKind: "nib", market: "Wancher official" },
    { key: "phase359-sakura-keiryu", name: "SAKURA Keiryu / Kodachi nib", releaseYear: "2025", notes: "特制 Keiryu/Kodachi 路线；不把特殊尖名当成 flex 性能承诺。", sourceKey: S.jpCollection.key, variantKind: "nib", market: "Wancher official" },
  ],
  spec: {
    brandEntityId: PHASE359_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Dream Pen Celluloid SAKURA",
      release_year: "2025（Kickstarter 项目后上市）",
      origin_country: "Kyoto, Japan; Wancher × Kyoto Celluloid product context",
      nib: "JoWo stainless, Wancher 18K, Keiryu/Kodachi and other order options; exact nib by order",
      fill_system: "European International cartridge/converter; Sailor standard for 18K option",
      material: "Traditional Celluloid; titanium screw section; 925 sterling silver ring; Gold/Silver ring option",
      dimensions: "146 mm closed / 128 mm opened; 21 g official product specification",
      status: "current official product page; colour, ring, nib, stock and price vary by order and market",
    },
    evidence: [
      evidence("phase359-brand", "brand_entity_id", S.product.key, "Wancher maker identity"),
      evidence("phase359-series", "series_name", S.product.key, "exact SAKURA product title"),
      evidence("phase359-release", "release_year", S.product.key, "2025 Kickstarter success statement"),
      evidence("phase359-origin", "origin_country", S.product.key, "Kyoto, Japan manufacture/origin field"),
      evidence("phase359-nib", "nib", S.jpCollection.key, "JoWo, 18K and Keiryu nib routes"),
      evidence("phase359-fill", "fill_system", S.product.key, "European and Sailor filling-system fields"),
      evidence("phase359-material", "material", S.product.key, "celluloid, titanium and sterling silver fields"),
      evidence("phase359-dimensions", "dimensions", S.product.key, "closed/opened length and weight"),
      evidence("phase359-status", "status", S.kickstarterUpdate.key, "project and store timing boundary"),
    ],
  },
  timeline: [
    {
      key: "phase359-sakura-launch",
      title: "Dream Pen Celluloid SAKURA 在 Kickstarter 项目后进入官网",
      eventType: "model_released",
      startDate: "2025",
      circa: false,
      description: "官方产品页标注 2025 Kickstarter 成功推出；具体发货批次和网店上市时间以项目更新记录。",
      sourceKey: S.product.key,
    },
  ],
  media: [
    {
      key: "phase359-sakura-primary-media",
      title: "Wancher Dream Pen Celluloid SAKURA 事实图（非产品照片）",
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

export const phase359WancherDreamPenCelluloidSakuraPacks: CuratedEntityPack[] = [brand, model];
