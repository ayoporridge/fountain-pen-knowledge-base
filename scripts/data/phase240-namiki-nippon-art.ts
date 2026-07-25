import type {
  CuratedClaimEvidence,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-26";

export const PHASE240_NAMIKI_BRAND_ID = "lMGfoMjegnv8";
export const PHASE240_PEN_ID = "p240NamikiMtFujiWave";
export const PHASE240_PEN_SLUG = "namiki-nippon-art-mt-fuji-and-wave";
export const PHASE240_RAW_SLUGS = {
  brand: "并木-namiki",
} as const;

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  summary: string;
  tier?: CuratedSource["tier"];
  sourceType?: CuratedSource["sourceType"];
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.registryKey,
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
    registryKey: "fountain-pen-graph-editorial-phase240",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase240",
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
  home: web({
    key: "phase240-namiki-home",
    title: "Pilot Namiki 官方 collection 导航",
    url: "https://www.pilot-namiki.com/en/",
    registryKey: "pilot-namiki-official-phase240",
    registryName: "Pilot Namiki",
    summary: "官方导航将 Emperor、Yukari Royale、Yukari、Chinkin、Nippon Art、Urushi、AYA 与 Limited Edition 分为独立 collection；品牌页据此保持系列边界。",
  }),
  collection: web({
    key: "phase240-namiki-nippon-art-collection",
    title: "Pilot Namiki NIPPON ART collection",
    url: "https://www.pilot-namiki.com/en/collection/nippon-art/",
    registryKey: "pilot-namiki-nippon-art-phase240",
    registryName: "Pilot Namiki",
    summary: "官方 collection 说明 Nippon Art 将传统题材置于黑色漆面背景，以 Hira Maki-e（Flat Maki-e）呈现，并把 Mt. Fuji and Wave 与 Mt. Fuji and Ship 等主题分别列出。",
  }),
  product: web({
    key: "phase240-namiki-mt-fuji-wave-product",
    title: "Pilot Namiki Mt. Fuji and Wave 官方产品页",
    url: "https://www.pilot-namiki.com/en/collection/nippon-art/mt-fuji-and-wave/",
    registryKey: "pilot-namiki-mt-fuji-wave-phase240",
    registryName: "Pilot Namiki",
    summary: "官方具体产品页列富士与波、Hira Maki-e、产品号 FN-35SM-FN、F/M/B、No.5（14K）和 Kokkokai；精确页面没有稳定列出完整筒身材质、尺寸、重量或供墨结构。",
  }),
  feature: web({
    key: "phase240-namiki-features",
    title: "Pilot Namiki Special Features：Maki-e",
    url: "https://www.pilot-namiki.com/en/about/feature.html",
    registryKey: "pilot-namiki-features-phase240",
    registryName: "Pilot Namiki",
    summary: "官方工艺说明把 Maki-e 解释为在漆面上撒布金粉等材料表现细节的日本漆艺，并提供 Namiki 制作与书写质量的品牌语境；不用于推导本 SKU 的底材或尺寸。",
  }),
  care: web({
    key: "phase240-namiki-care",
    title: "Namiki Use and Care Guide 镜像",
    url: "https://device.report/m/4444d8c109915e453e3f0d0383e3bda48cca8a2bf5c4453746e748ac5b32e09a.pdf",
    registryKey: "namiki-care-guide-phase240",
    registryName: "Namiki care guide mirror",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary: "护理资料用于支持 Urushi 表面避光、避免溶剂和低风险清洁的编辑边界；它不替代 FN-35SM-FN 的产品规格或维修报价。",
  }),
  review: web({
    key: "phase240-namiki-mt-fuji-wave-review",
    title: "Glenn's Pens：Namiki Mt Fuji and Wave",
    url: "https://www.glennspens.com/pensofnote/namiki-MontFujiWave.html",
    registryKey: "glennspens-namiki-mt-fuji-wave-phase240",
    registryName: "Glenn's Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立专题记录作者在 2016 年购得一支编号 1160 的 Mt Fuji and Wave，描述其 Nippon Art Tradition line、Kokkokai、Hira Maki-e 与 14K 尖的使用体验；这是具体藏家样本，不替代官方当前 SKU 的价格、库存、供墨或所有编号。",
  }),
  brandSvg: diagram(
    "phase240-namiki-brand-svg",
    "Namiki collection and product navigation factual diagram",
    "/images/library/site-original/phase240/namiki/brand.svg",
    "本站原创 factual SVG；表达 Namiki collection、现有代表型号与新增 FN-35SM-FN 的导航边界。",
  ),
  penSvg: diagram(
    "phase240-namiki-mt-fuji-wave-svg",
    "Namiki Mt. Fuji and Wave factual diagram",
    "/images/library/site-original/phase240/namiki/nippon-art-mt-fuji-and-wave.svg",
    "本站原创 factual SVG；表达产品号、Hira Maki-e、No.5 14K、Kokkokai 与待核字段。",
  ),
} as const;

function claimEvidence(key: string, sourceKey: string, scopeKey: string, locator: string): CuratedClaimEvidence {
  return { key, sourceKey, scopeKey, locator };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function media(source: CuratedSource, key: string, title: string) {
  return [{
    key,
    title,
    sourceKey: source.key,
    localPath: source.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；非产品照片、非 logo、非比例图、非颜色证明。",
    sourceUrl: source.url,
    usageStatus: "primary" as const,
  }];
}

const brandScope = "phase240-namiki-brand-navigation";
const penScope = "phase240-namiki-nippon-art-mt-fuji-wave";

const brand: CuratedEntityPack = {
  key: "phase240-namiki-brand-v1",
  entityId: PHASE240_NAMIKI_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "namiki",
  canonicalName: "Namiki 并木",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/namiki-brand-phase240.md",
  storyTitle: "Namiki：从 collection 到具体漆艺产品的导航",
  primarySourceKey: S.home.key,
  depthTier: "A",
  aliases: [
    { alias: "Namiki", language: "en", sourceKey: S.home.key },
    { alias: "并木", language: "zh", sourceKey: S.home.key },
    { alias: "Namiki Fountain Pen", language: "en", sourceKey: S.home.key },
  ],
  sources: [S.home, S.collection, S.product, S.feature, S.care, S.review, S.brandSvg],
  scopes: [{
    key: brandScope,
    scopeKey: brandScope,
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope: "Namiki 品牌导航；Emperor、Yukari Royale、Rising Dragon 与 NIPPON ART 富士与波分别作为 collection 或 exact product 入口。",
  }],
  claims: [
    {
      key: "phase240-namiki-brand-identity",
      predicate: "brand_identity",
      objectText: "Namiki 是 Pilot 体系中以日本漆艺钢笔为核心的品牌入口；官方将 Emperor、Yukari Royale、Yukari、Chinkin、Nippon Art、Urushi、AYA 和 Limited Edition 分列为不同 collection。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.home.key,
      locator: S.home.summary,
      evidence: [claimEvidence("phase240-namiki-brand-identity-home", S.home.key, brandScope, S.home.summary), claimEvidence("phase240-namiki-brand-identity-feature", S.feature.key, brandScope, S.feature.summary)],
    },
    {
      key: "phase240-namiki-brand-navigation",
      predicate: "brand_model_navigation",
      objectText: "当前导航包含 Namiki Emperor、Namiki Yukari Royale、Namiki Rising Dragon 95th Anniversary 与 Namiki Nippon Art Mt. Fuji and Wave 四个已核验入口；其中前三个是既有代表条目，富士与波以产品号 FN-35SM-FN 单独落页。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.collection.key,
      locator: S.collection.summary,
      evidence: [claimEvidence("phase240-namiki-brand-navigation-collection", S.collection.key, brandScope, S.collection.summary), claimEvidence("phase240-namiki-brand-navigation-product", S.product.key, brandScope, S.product.summary), claimEvidence("phase240-namiki-brand-navigation-review", S.review.key, brandScope, S.review.summary)],
    },
    {
      key: "phase240-namiki-collection-boundary",
      predicate: "collection_product_boundary",
      objectText: "Nippon Art 是 collection 层级，Mt. Fuji and Wave 是该 collection 下有独立产品号的具体产品；Mt. Fuji and Ship、Origami 和其他题材不能被并入富士与波的变体。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.collection.key,
      locator: S.collection.summary,
      evidence: [claimEvidence("phase240-namiki-collection-boundary-list", S.collection.key, brandScope, S.collection.summary), claimEvidence("phase240-namiki-collection-boundary-product", S.product.key, brandScope, S.product.summary)],
    },
    {
      key: "phase240-namiki-evidence-boundary",
      predicate: "evidence_boundary",
      objectText: "官方富士与波页面可以确认 Hira Maki-e、FN-35SM-FN、F/M/B、No.5（14K）和 Kokkokai；完整筒身材质、尺寸、重量、供墨和当前地区库存必须留在待核边界，不能由相邻主题或藏家样本外推。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [claimEvidence("phase240-namiki-evidence-official", S.product.key, brandScope, S.product.summary), claimEvidence("phase240-namiki-evidence-secondary", S.review.key, brandScope, S.review.summary)],
    },
  ],
  timeline: [
    {
      key: "phase240-namiki-nippon-art-listed",
      title: "Nippon Art collection 官方列出",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "官方当前 collection 页面将 Nippon Art 与其他 Namiki collection 分列，并列出富士与波、富士与舟等独立题材。",
      sourceKey: S.collection.key,
    },
    {
      key: "phase240-namiki-fuji-wave-product",
      title: "富士与波产品号可核验",
      eventType: "model_released",
      startDate: RETRIEVED,
      circa: true,
      description: "官方当前产品页可核验 Mt. Fuji and Wave、FN-35SM-FN、Hira Maki-e、No.5（14K）和 Kokkokai；页面可见时间不倒推为首发年份。",
      sourceKey: S.product.key,
    },
  ],
  media: media(S.brandSvg, "phase240-namiki-brand-primary", "Namiki collection 与具体产品导航事实图（非产品照片）"),
};

const pen: CuratedEntityPack = {
  key: "phase240-namiki-nippon-art-mt-fuji-wave-v1",
  entityId: PHASE240_PEN_ID,
  expectedType: "pen",
  expectedSlug: PHASE240_PEN_SLUG,
  canonicalName: "Namiki Nippon Art Mt. Fuji and Wave",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/namiki-nippon-art-mt-fuji-and-wave-phase240.md",
  storyTitle: "Namiki Nippon Art Mt. Fuji and Wave：FN-35SM-FN 的题材与证据边界",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Mt. Fuji and Wave", language: "en", sourceKey: S.product.key },
    { alias: "富士と波", language: "ja", sourceKey: S.product.key },
    { alias: "富士与波", language: "zh", sourceKey: S.product.key },
    { alias: "Namiki FN-35SM-FN", language: "en", sourceKey: S.product.key },
    { alias: "Namiki Nippon Art Tradition Mt. Fuji and Wave", language: "en", sourceKey: S.review.key },
  ],
  sources: [S.product, S.collection, S.feature, S.care, S.review, S.penSvg],
  scopes: [{
    key: penScope,
    scopeKey: penScope,
    validFrom: RETRIEVED,
    productionState: "current",
    nibScope: "官方产品页列 Pen type F/M/B 与 No.5（14K）；具体样笔实际线宽需按刻字和订单确认。",
    materialScope: "官方 collection 语境为黑色漆面上的 Hira Maki-e；精确产品页未列完整筒身底材。",
    editionScope: "产品号 FN-35SM-FN 的 Mt. Fuji and Wave；不与 Mt. Fuji and Ship 或其他 Nippon Art 题材合并。",
  }],
  claims: [
    {
      key: "phase240-fuji-wave-identity",
      predicate: "model_identity",
      objectText: "Namiki Nippon Art Mt. Fuji and Wave 对应官方题名「富士と波」与产品号 FN-35SM-FN；它是 NIPPON ART collection 下的具体产品，不是泛称 Nippon Art。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [claimEvidence("phase240-fuji-wave-identity-product", S.product.key, penScope, S.product.summary), claimEvidence("phase240-fuji-wave-identity-collection", S.collection.key, penScope, S.collection.summary)],
    },
    {
      key: "phase240-fuji-wave-technique",
      predicate: "craft_technique",
      objectText: "官方产品页将技法列为 Hira Maki-e；collection 说明把 Nippon Art 的传统题材放在黑色漆面背景上。此页不把 Hira Maki-e 改写为 Taka Maki-e，也不由 collection 共性推断漆层数量。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [claimEvidence("phase240-fuji-wave-technique-product", S.product.key, penScope, S.product.summary), claimEvidence("phase240-fuji-wave-technique-collection", S.collection.key, penScope, S.collection.summary)],
    },
    {
      key: "phase240-fuji-wave-nib",
      predicate: "nib_specification",
      objectText: "官方列 Pen type 为 F、M、B，Pen nib 为 No.5（14K）；这是产品页的可核对字段，不能把藏家样本的具体线宽当成所有现存笔的统一状态。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [claimEvidence("phase240-fuji-wave-nib-product", S.product.key, penScope, S.product.summary), claimEvidence("phase240-fuji-wave-nib-review", S.review.key, penScope, S.review.summary)],
    },
    {
      key: "phase240-fuji-wave-artisan",
      predicate: "artisan_attribution",
      objectText: "官方产品页的 Artisan 字段写 Kokkokai；独立藏家专题也将该样本与 Kokkokai 相连，但没有提供把该名称扩写为个人作者、年份或编号规则的依据。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [claimEvidence("phase240-fuji-wave-artisan-product", S.product.key, penScope, S.product.summary), claimEvidence("phase240-fuji-wave-artisan-review", S.review.key, penScope, S.review.summary)],
    },
    {
      key: "phase240-fuji-wave-spec-boundary",
      predicate: "specification_boundary",
      objectText: "官方精确产品页没有稳定列出完整筒身材质、总长、直径、重量和供墨结构；相邻 Mt. Fuji and Ship 的评测或 Custom 74 形制不能被复制到 FN-35SM-FN。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [claimEvidence("phase240-fuji-wave-spec-boundary-official", S.product.key, penScope, S.product.summary), claimEvidence("phase240-fuji-wave-spec-boundary-review", S.review.key, penScope, S.review.summary)],
    },
    {
      key: "phase240-fuji-wave-secondary",
      predicate: "professional_secondary_context",
      objectText: "Glenn's Pens 的专题记录一支编号 1160 的富士与波样本，讨论 Nippon Art Tradition line、Kokkokai、Hira Maki-e 与 14K 尖的实际书写感受；它只作为样本和使用语境旁证。",
      factClass: "core",
      confidence: 0.92,
      sourceKey: S.review.key,
      locator: S.review.summary,
      evidence: [claimEvidence("phase240-fuji-wave-secondary-review", S.review.key, penScope, S.review.summary)],
    },
    {
      key: "phase240-fuji-wave-care",
      predicate: "maintenance_boundary",
      objectText: "漆艺外表避免酒精、香水、未知溶剂、研磨布、抛光膏、高温和长期直晒；内部以常温清水低风险清洁并充分干燥，裂纹、脱漆、漏墨或尖端异常应停用并寻求 Pilot/Namiki 或 Urushi 维修渠道。",
      factClass: "editorial",
      confidence: 0.97,
      sourceKey: S.care.key,
      locator: S.care.summary,
      evidence: [claimEvidence("phase240-fuji-wave-care-guide", S.care.key, penScope, S.care.summary)],
    },
  ],
  variants: [{
    key: "phase240-fuji-wave-sku",
    name: "Mt. Fuji and Wave（FN-35SM-FN）",
    notes: "官方具体产品记录；富士与波、Hira Maki-e、F/M/B、No.5（14K）和 Kokkokai 属于该产品页。不要与 Mt. Fuji and Ship 或其他 Nippon Art 题材合并。",
    sourceKey: S.product.key,
    variantKind: "market_sku",
    productCode: "FN-35SM-FN",
    market: "global",
  }],
  spec: {
    brandEntityId: PHASE240_NAMIKI_BRAND_ID,
    values: {
      series_name: "Namiki Nippon Art Mt. Fuji and Wave / 富士与波",
      release_year: "官方当前产品页可见；官方未在该页公布首发年份",
      origin_country: "日本；Pilot Namiki 体系",
      nib: "官方列 No.5（14K），Pen type 为 F、M、B；实际线宽按具体笔确认",
      fill_system: "官方精确产品页未声明固定供墨结构；按地区订单与实物确认",
      material: "官方 collection 语境为黑色漆面上的 Hira Maki-e；完整筒身底材未在精确产品页列出",
      dimensions: "官方精确产品页未列稳定总长、直径或重量；不要从相邻 Nippon Art 主题外推",
      weight: "官方精确产品页未列稳定克重；二手样本需实测并注明是否含墨",
      price_range: "官方产品页未提供稳定公开价格；按地区、年份和库存核对",
      status: "官方 NIPPON ART 产品页可核验；当前销售与地区库存需重新向官方或授权渠道确认",
    },
    evidence: [
      evidence("phase240-fuji-wave-brand", "brand_entity_id", S.home.key, penScope, "Pilot Namiki official brand context"),
      evidence("phase240-fuji-wave-series", "series_name", S.product.key, penScope, "official title and product number FN-35SM-FN"),
      evidence("phase240-fuji-wave-year", "release_year", S.product.key, penScope, "current product page; launch year withheld"),
      evidence("phase240-fuji-wave-origin", "origin_country", S.home.key, penScope, "Pilot Namiki Japanese brand context"),
      evidence("phase240-fuji-wave-nib", "nib", S.product.key, penScope, "official Pen type F/M/B and No.5 14K"),
      evidence("phase240-fuji-wave-fill", "fill_system", S.product.key, penScope, "exact product page does not state fixed filling system"),
      evidence("phase240-fuji-wave-material", "material", S.collection.key, penScope, "Nippon Art black lacquer and Hira Maki-e collection context"),
      evidence("phase240-fuji-wave-dimensions", "dimensions", S.product.key, penScope, "exact product page omits stable dimensions; boundary retained"),
      evidence("phase240-fuji-wave-weight", "weight", S.product.key, penScope, "exact product page omits stable weight; sample boundary retained"),
      evidence("phase240-fuji-wave-price", "price_range", S.product.key, penScope, "official product page has no stable public price"),
      evidence("phase240-fuji-wave-status", "status", S.product.key, penScope, "official current product page; regional availability requires confirmation"),
    ],
  },
  media: media(S.penSvg, "phase240-namiki-fuji-wave-primary", "Namiki Mt. Fuji and Wave 事实图（非产品照片）"),
};

export const phase240NamikiNipponArtPacks: CuratedEntityPack[] = [brand, pen];
