import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-06";
export const PHASE535_WANCHER_BRAND_ID = "eOfD77nOeENN";
const NIBS = [
  ["jowo-stainless", "#6 JoWo stainless steel", "官方 exact 页面列出的不锈钢 nib 选项。"],
  ["wancher-18k", "Wancher 18K gold", "官方 exact 页面列出的 18K gold nib 选项；不把选项写成同时安装。"],
] as const;
const FEEDS = [
  ["plastic", "Plastic feed", "官方 exact 页面列出的 feed 选项。"],
  ["black-ebonite", "Black ebonite feed", "官方 exact 页面列出的 feed 选项。"],
  ["red-ebonite", "Red ebonite feed", "官方 exact 页面列出的 feed 选项。"],
] as const;

export const PHASE535_TARGETS = [
  {
    key: "heki-tamenuri",
    entityId: "phase535-wancher-true-urushi-heki-tamenuri",
    slug: "wancher-true-urushi-heki-tamenuri",
    canonicalName: "Wancher True Urushi Heki Tamenuri",
    title: "True Urushi - Heki Tamenuri",
    shortTitle: "True Urushi Heki Tamenuri",
    japaneseName: "Heki Tamenuri",
    productId: "7562003349719",
    createdAt: "2022-03-04",
    publishedAt: "2022-03-04",
    url: "https://www.wancherpen.com/products/true-urushi-heki-tamenuri",
    jsonUrl: "https://www.wancherpen.com/products/true-urushi-heki-tamenuri.json",
    image: "/images/library/site-original/phase535/wancher/true-urushi-heki-tamenuri.svg",
    articleFile: ".planning/content-research/wancher-true-urushi-heki-tamenuri-phase535.md",
    variants: [
      { name: "Without Clip", sku: "WF-UR-DREAM-HETA", price: "US$550", available: false },
      { name: "With Chrome-plating Clip +$30", sku: "WF-UR-DREAM-HETA-CHCL", price: "US$580", available: false },
      { name: "With Gold-plating Clip +$30", sku: "WF-UR-DREAM-HETA-GDCL", price: "US$580", available: false },
    ],
    availability: "official JSON 2026-08-06: all three variants available=false; product page showed Sold out; inventory is mutable",
  },
  {
    key: "ao-tamenuri",
    entityId: "phase535-wancher-true-urushi-ao-tamenuri",
    slug: "wancher-true-urushi-ao-tamenuri",
    canonicalName: "Wancher True Urushi Ao Tamenuri",
    title: "True Urushi - Ao Tamenuri",
    shortTitle: "True Urushi Ao Tamenuri",
    japaneseName: "青溜塗",
    productId: "8131732013271",
    createdAt: "2023-08-17",
    publishedAt: "2023-08-17",
    url: "https://www.wancherpen.com/products/true-urushi-ao-tamenuri",
    jsonUrl: "https://www.wancherpen.com/products/true-urushi-ao-tamenuri.json",
    image: "/images/library/site-original/phase535/wancher/true-urushi-ao-tamenuri.svg",
    articleFile: ".planning/content-research/wancher-true-urushi-ao-tamenuri-phase535.md",
    variants: [
      { name: "Without Clip", sku: "WF-UR-DREAM-AOTA", price: "US$550", available: true },
      { name: "With Chrome-plating Clip +$30", sku: "WF-UR-DREAM-AOTA-CHCL", price: "US$580", available: false },
      { name: "With Gold-plating Clip +$30", sku: "WF-UR-DREAM-AOTA-GDCL", price: "US$580", available: false },
    ],
    availability: "official JSON 2026-08-06: Without Clip available=true and plated clip variants available=false; inventory is mutable",
  },
  {
    key: "midori-tamenuri",
    entityId: "phase535-wancher-true-urushi-midori-tamenuri",
    slug: "wancher-true-urushi-midori-tamenuri",
    canonicalName: "Wancher True Urushi Midori Tamenuri",
    title: "True Urushi - Midori Tamenuri",
    shortTitle: "True Urushi Midori Tamenuri",
    japaneseName: "緑溜塗",
    productId: "4685010239569",
    createdAt: "2020-09-08",
    publishedAt: "2020-09-10",
    url: "https://www.wancherpen.com/products/true-urushi-midori-tamenuri",
    jsonUrl: "https://www.wancherpen.com/products/true-urushi-midori-tamenuri.json",
    image: "/images/library/site-original/phase535/wancher/true-urushi-midori-tamenuri.svg",
    articleFile: ".planning/content-research/wancher-true-urushi-midori-tamenuri-phase535.md",
    variants: [
      { name: "Without Clip", sku: "WF-UR-DREAM-MITA", price: "US$550", available: true },
      { name: "With Chrome-plating Clip +$30", sku: "WF-UR-DREAM-MITA-CHCL", price: "US$580", available: false },
      { name: "With Gold-plating Clip +$30", sku: "WF-UR-DREAM-MITA-GDCL", price: "US$580", available: false },
    ],
    availability: "official JSON 2026-08-06: Without Clip available=true and plated clip variants available=false; inventory is mutable",
  },
] as const;
export type Phase535Target = (typeof PHASE535_TARGETS)[number];

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  tier: CuratedSource["tier"];
  sourceType?: CuratedSource["sourceType"];
  independenceGroup: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType ?? "official",
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
    registryKey: "fountain-pen-graph-editorial-phase535",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase535",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作色卡或库存证明。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, scopeKey: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
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

function makePack(target: Phase535Target): CuratedEntityPack {
  const scope = `Wancher ${target.shortTitle} exact product record, Ebonite and Urushi material boundary`;
  const product = web({
    key: `wancher-phase535-${target.key}-official-json`,
    title: `${target.title} | Wancher Official product JSON`,
    url: target.jsonUrl,
    registryKey: `wancher-official-${target.key}-phase535-json`,
    registryName: "Wancher Pen official product record",
    tier: "primary",
    independenceGroup: `wancher-official-${target.key}-phase535`,
    summary: `官方 Shopify product JSON：product id ${target.productId}、exact handle、created_at、published_at、三个 clip SKU、价格、库存与商品字段。`,
    locator: "product id, title, handle, created_at, published_at, variants, price, availability and options",
  });
  const productPage = web({
    key: `wancher-phase535-${target.key}-official-page`,
    title: `${target.title} | Wancher Official`,
    url: target.url,
    registryKey: `wancher-official-${target.key}-phase535-page`,
    registryName: "Wancher Pen official product page",
    tier: "primary",
    independenceGroup: `wancher-official-${target.key}-phase535`,
    summary: `官方 exact 页面：${target.title}（${target.japaneseName}）、True Urushi 工艺说明、轮岛手工、规格、包装与 Clips 选择项。`,
    locator: "exact title, Japanese name, True Urushi description, Wajima making process, specifications, packaging and clip options",
  });
  const collection = web({
    key: `wancher-phase535-${target.key}-collection`,
    title: "True Urushi Collection | Wancher Official",
    url: "https://www.wancherpen.com/collections/true-urushi",
    registryKey: `wancher-official-true-urushi-collection-phase535-${target.key}`,
    registryName: "Wancher Pen official True Urushi collection",
    tier: "primary",
    independenceGroup: `wancher-official-true-urushi-collection-phase535-${target.key}`,
    summary: "官方集合页把 Heki、Ao、Midori 等商品作为独立入口，并说明 Ebonite、Natural Urushi 与轮岛工艺背景。",
    locator: "True Urushi sibling navigation and Natural Urushi / Wajima background",
  });
  const care = web({
    key: `wancher-phase535-${target.key}-care`,
    title: "Wancher Product Care Guide",
    url: "https://www.wancherpen.com/pages/product-care",
    registryKey: `wancher-official-product-care-phase535-${target.key}`,
    registryName: "Wancher Pen official product care",
    tier: "primary",
    independenceGroup: `wancher-official-product-care-phase535-${target.key}`,
    summary: "官方护理页给出 Ebonite 的浸水、日照、干燥环境和化学清洁剂边界。",
    locator: "Ebonite care instructions",
  });
  const wajima = web({
    key: `wajimanuri-phase535-${target.key}`,
    title: "The production process of Wajimanuri",
    url: "https://www.wajimanuri.co.jp/e_tayashikkiten/process.html",
    registryKey: `wajimanuri-process-phase535-${target.key}`,
    registryName: "Wajimanuri professional craft guide",
    tier: "professional_secondary",
    independenceGroup: `wajimanuri-process-phase535-${target.key}`,
    summary: "轮岛漆器工坊资料解释底涂、研磨、反复上漆、干燥与专业分工，只作工艺背景。",
    locator: "Wajimanuri process stages and specialist craft context",
  });
  const government = web({
    key: `japan-government-wajima-phase535-${target.key}`,
    title: "Highlighting Japan: Wajima lacquerware",
    url: "https://www.gov-online.go.jp/eng/publicity/book/hlj/html/202101/202101_05_en.html",
    registryKey: `japan-government-wajima-phase535-${target.key}`,
    registryName: "Government of Japan public information",
    tier: "professional_secondary",
    independenceGroup: `japan-government-wajima-phase535-${target.key}`,
    summary: "日本政府英文资料说明轮岛漆艺的多阶段工序、专业分工与 Maki-e/Chinkin 背景；不用于推断本支工匠或配方。",
    locator: "Wajima lacquerware history and multi-stage craft context",
  });
  const svg = diagram(`wancher-phase535-${target.key}-svg`, `${target.shortTitle} 材料、变体与来源边界事实图`, target.image);
  const c = (key: string, predicate: string, text: string, source: CuratedSource = product, locator = "exact product record", factClass: "core" | "editorial" = "core") => claim(`${target.key}-${key}`, predicate, text, source.key, locator, scope, factClass);
  const variants: CuratedVariant[] = [
    { key: `${target.key}-handmade`, name: "Handmade Urushi surface", notes: "官方手工与 Natural Urushi 系列叙述；不是额外市场 SKU。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" },
    ...target.variants.map((item, index) => ({ key: `${target.key}-market-${index + 1}`, name: item.name, notes: `${item.available ? "JSON 检索时可用" : "JSON 检索时不可用"}；价格 ${item.price}，库存和价格会变化。`, sourceKey: product.key, variantKind: "market_sku" as const, productCode: item.sku, market: "global" })),
    ...NIBS.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "nib" as const, market: "global" })),
    ...FEEDS.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "material" as const, market: "global" })),
  ];
  const claims: CuratedClaim[] = [
    c("identity", "model_identity", `${target.shortTitle} 是 Wancher True Urushi collection 中的独立商品；官方 product id 为 ${target.productId}，exact handle 为 ${target.slug.replace("wancher-", "")}，商品记录 created_at 为 ${target.createdAt}、published_at 为 ${target.publishedAt}。`),
    c("name", "product_name", `官方英文标题为 ${target.title}，页面还使用 ${target.japaneseName}；这两个名称属于同一 exact product page，不与 Heki、Ao、Midori 其他入口合并。`, productPage, "exact title and Japanese product naming"),
    c("material", "material", "官方 exact Material & art 为 Ebonite, Urushi；公开页面没有公布颜料配方、颜色数值、漆层数量、可靠成品重量或可复核尺寸。"),
    c("tamenuri", "finish_name_boundary", `Tamenuri 是官方商品命名的一部分；本文不从 ${target.japaneseName} 推断固定色号、配方、光泽度或批次标准。`, productPage, "exact product name and absence of quantitative colour specification"),
    c("series", "series_context", "Wancher True Urushi 集合页把各色商品分成独立入口，并将 Dream Pen、Ebonite、Natural Urushi 和轮岛工匠作为系列背景；系列描述不等于本支施工报告。", collection, "sibling navigation and series description"),
    c("craft", "wajima_process", "官方商品页写明每支笔由日本工匠在轮岛手工上色，制作至少三个月或更久；专业轮岛工艺资料解释多阶段漆艺流程，但不证明本支的层数、工坊、师承或交付时长。", productPage, "Wajima making process and minimum three-month wording"),
    c("craft-context", "professional_context", "轮岛资料只作日本漆艺流程背景，不把现代 Wancher 商品写成传统工艺馆藏、政府认证或某位工匠的署名作品。", wajima, "professional process background"),
    c("government-context", "historical_context", "日本政府资料可帮助理解轮岛漆艺的多工序和专业分工；它不为本支增加未公布的材料、日期或耐久期限。", government, "Wajima lacquerware multi-stage craft context", "editorial"),
    c("nib", "nib", `官方 exact 页面列 ${NIBS.map((item) => item[1]).join("、")}；这是配置选项集合，不是同时安装多种尖。`),
    c("feed", "feed", `官方 exact 页面列 ${FEEDS.map((item) => item[1]).join("、")}；不能从其它 True Urushi sibling 借用未列出的 feed。`),
    c("filling", "filling_system", "供墨为 Converter or Cartridge（European International Standard）；官方页面没有授权整支漆艺笔作为 eyedropper 使用。"),
    c("cap", "cap", "官方写 compact air-tight cap，用于减少墨水干涸；不把这句话扩展成绝对防漏或长期密封保证。", productPage, "compact air-tight cap wording", "editorial"),
    c("shape", "shape", "官方页面有 Size & Shape 标题，但没有公开可复核长度、直径和握径；不从商品图片估算尺寸。", productPage, "Size & Shape section without published dimensions"),
    c("weight", "weight", "官方页面没有可靠成品重量；JSON 的 200 g 平台字段不作为实测规格。", product, "variant grams field is not a measured finished weight", "editorial"),
    c("packaging", "packaging", "包装包括 Traditional Japanese Wooden Box、Pen Kimono、Instructional Materials、Certificate、Converter 与 Cartridge；具体交付以 exact 订单核对。", productPage, "packaging field", "editorial"),
    c("care", "maintenance_guidance", "Ebonite 与漆面应避免长时间浸水、直晒、干燥环境、极端天气和化学清洁剂；外部用略湿软布轻拭，换墨时只处理 nib、feed、握位与 converter。", care, "official Ebonite care boundary", "editorial"),
    c("variants", "market_variants", `官方 JSON 列出 ${target.variants.map((item) => `${item.name}（${item.sku}，${item.price}）`).join("、")}；clip 是市场 SKU 差异，不是三个不同颜色实体。`, product, "variants, options, SKUs, prices and availability"),
    c("price", "price_status", `${target.availability}；价格、税费、库存和 Sold out/Add to cart 标签会变化。`, product, "exact market price and availability fields", "editorial"),
    c("selection", "selection_guidance", `选购或二手核对完整标题、product id ${target.productId}、handle、对应 SKU、Ebonite、Urushi、公开 nib/feed、欧规供墨和木盒包装；不要从其它 Tamenuri 页面借用颜色、价格或首发信息。`, product, "exact identity and evidence boundary", "editorial"),
  ];
  const values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>> = {
    series_name: target.canonicalName,
    release_year: `独立正式首发年份未公布；official created_at ${target.createdAt}、published_at ${target.publishedAt}，只作记录语境`,
    origin_country: "Japanese Urushi craft context; exact component-by-component origin not asserted",
    nib: NIBS.map((item) => item[1]).join("、"),
    fill_system: "Converter 或 European International Standard cartridge",
    material: `Ebonite；Urushi；${target.japaneseName} product naming；Natural Urushi wording on official collection`,
    dimensions: "官方 exact product page 未公布可复核长度、直径和握径",
    weight: "官方未公布可靠成品重量；JSON 200 g 字段不作为实测规格",
    price_range: `${target.variants.map((item) => `${item.sku} ${item.price}`).join("；")}；价格、税费和库存会变`,
    status: target.availability,
  };
  return {
    key: `phase535-wancher-${target.key}-v1`,
    entityId: target.entityId,
    expectedType: "pen",
    expectedSlug: target.slug,
    canonicalName: target.canonicalName,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: target.articleFile,
    storyTitle: `${target.shortTitle}：Tamenuri、规格与商品边界`,
    primarySourceKey: product.key,
    depthTier: "A",
    aliases: [
      { alias: target.title, language: "en", sourceKey: product.key },
      { alias: target.canonicalName, language: "en", sourceKey: product.key },
      { alias: `${target.shortTitle} 钢笔`, language: "zh", sourceKey: product.key },
      { alias: target.japaneseName, language: "ja", sourceKey: productPage.key },
    ],
    sources: [product, productPage, collection, care, wajima, government, svg],
    scopes: [
      { key: scope, scopeKey: scope, productionState: "historical", market: "global", nibScope: NIBS.map((item) => item[1]).join("、"), materialScope: `Ebonite、Urushi 与 ${target.japaneseName} 商品命名按 exact 页面记录；未公布配方、漆层数量、重量和尺寸。`, editionScope: "三个 clip SKU 是官方市场变体；手工表面差异不是公开限量编号。" },
      { key: `phase535-${target.key}-craft-context`, scopeKey: `phase535-${target.key}-craft-context`, productionState: "historical", materialScope: "Independent Wajima lacquer craft context only; no product-specific artisan or authorization asserted.", editionScope: "工艺背景不建立本支首发年份、固定耐久期限或二手价值。" },
    ],
    claims,
    variants,
    spec: {
      brandEntityId: PHASE535_WANCHER_BRAND_ID,
      values,
      evidence: [
        evidence(`${target.key}-brand`, "brand_entity_id", collection.key, scope, "official collection brand boundary"),
        evidence(`${target.key}-series`, "series_name", product.key, scope, "exact title and handle"),
        evidence(`${target.key}-release`, "release_year", product.key, scope, "created_at and published_at listing context without formal launch year"),
        evidence(`${target.key}-origin`, "origin_country", productPage.key, scope, "official Urushi and Wajima wording"),
        evidence(`${target.key}-nib-spec`, "nib", product.key, scope, "exact nib field"),
        evidence(`${target.key}-fill-spec`, "fill_system", product.key, scope, "filling mechanism field"),
        evidence(`${target.key}-material-spec`, "material", product.key, scope, "exact Material & art field"),
        evidence(`${target.key}-dimensions`, "dimensions", productPage.key, scope, "Size & Shape section without published dimensions"),
        evidence(`${target.key}-weight`, "weight", product.key, scope, "platform grams field not treated as measured weight"),
        evidence(`${target.key}-price-spec`, "price_range", product.key, scope, "exact market variant price rows"),
        evidence(`${target.key}-status`, "status", product.key, scope, "variant availability and page labels"),
      ],
    },
    timeline: [{ key: `${target.key}-listing`, title: `${target.shortTitle} exact product record verified`, eventType: "design_milestone", startDate: target.createdAt, circa: false, description: `Exact title, product id, handle, Tamenuri naming, clip SKUs and specifications verified on ${RETRIEVED}; created_at ${target.createdAt} and published_at ${target.publishedAt} are not formal launch dates.`, sourceKey: product.key }],
    media: [{ key: `${target.key}-svg`, title: `${target.shortTitle} 材料、变体与来源边界图（非产品照片）`, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
  };
}

export const phase535WancherTrueUrushiPacks: CuratedEntityPack[] = PHASE535_TARGETS.map(makePack);
