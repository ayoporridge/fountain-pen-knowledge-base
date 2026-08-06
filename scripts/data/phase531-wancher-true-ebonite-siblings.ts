import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-06";
export const PHASE531_WANCHER_BRAND_ID = "eOfD77nOeENN";

const STANDARD_NIBS = [
  ["jowo", "#6 JoWo stainless steel", "官方 exact 页面尖面菜单。"],
  ["wancher-18k", "Wancher 18K gold", "官方 exact 页面尖面菜单。"],
] as const;
const SHOGUN_NIBS = [
  ...STANDARD_NIBS,
  ["shogun-18k", "Shogun 18K", "官方 exact 页面额外提示可用；实际订单需核对。"],
] as const;
const FEEDS = [
  ["plastic", "Plastic feed", "官方 exact 页面 feed 菜单。"],
  ["ebonite-black", "Black ebonite feed", "官方 exact 页面 feed 菜单。"],
  ["ebonite-red", "Red ebonite feed", "官方 exact 页面 feed 菜单。"],
] as const;

export const PHASE531_TARGETS = [
  {
    key: "sand-red",
    entityId: "phase531-wancher-true-ebonite-sand-red",
    slug: "wancher-dream-pen-true-ebonite-sand-red",
    canonicalName: "Wancher Dream Pen True Ebonite Sand Red",
    title: "True Ebonite - Sand Red",
    shortTitle: "True Ebonite Sand Red",
    productId: "4622134771793",
    createdAt: "2020-06-08",
    publishedAt: "2020-06-12",
    url: "https://www.wancherpen.com/products/true-ebonite-sand-red",
    jsonUrl: "https://www.wancherpen.com/products/true-ebonite-sand-red.json",
    image: "/images/library/site-original/phase531/wancher/true-ebonite-sand-red.svg",
    articleFile: ".planning/content-research/wancher-true-ebonite-sand-red-phase531.md",
    sku: "WF-EB-DREAM-RED",
    price: "US$200",
    nibOptions: SHOGUN_NIBS,
    colorBoundary: "Sand Red 是 exact title 的颜色身份；页面未发布色号、颜料比例或固定纹理标准。",
  },
  {
    key: "marble-red",
    entityId: "phase531-wancher-true-ebonite-marble-red",
    slug: "wancher-dream-pen-true-ebonite-marble-red",
    canonicalName: "Wancher Dream Pen True Ebonite Marble Red",
    title: "True Ebonite - Marble Red",
    shortTitle: "True Ebonite Marble Red",
    productId: "6774352347311",
    createdAt: "2021-06-23",
    publishedAt: "2021-07-08",
    url: "https://www.wancherpen.com/products/true-ebonite-marble-red",
    jsonUrl: "https://www.wancherpen.com/products/true-ebonite-marble-red.json",
    image: "/images/library/site-original/phase531/wancher/true-ebonite-marble-red.svg",
    articleFile: ".planning/content-research/wancher-true-ebonite-marble-red-phase531.md",
    sku: "WF-EB-DREAM-RBW",
    price: "US$200",
    nibOptions: STANDARD_NIBS,
    colorBoundary: "Marble Red 的逐支纹理可变；页面未发布色号、红黑比例或纹理方向。",
  },
  {
    key: "marble-purple-gray",
    entityId: "phase531-wancher-true-ebonite-marble-purple-gray",
    slug: "wancher-dream-pen-true-ebonite-marble-purple-gray",
    canonicalName: "Wancher Dream Pen True Ebonite Marble Purple Gray",
    title: "True Ebonite - Marble Purple Gray",
    shortTitle: "True Ebonite Marble Purple Gray",
    productId: "6313808036015",
    createdAt: "2021-02-19",
    publishedAt: "2021-02-22",
    url: "https://www.wancherpen.com/products/true-ebonite-marble-purple-gray",
    jsonUrl: "https://www.wancherpen.com/products/true-ebonite-marble-purple-gray.json",
    image: "/images/library/site-original/phase531/wancher/true-ebonite-marble-purple-gray.svg",
    articleFile: ".planning/content-research/wancher-true-ebonite-marble-purple-gray-phase531.md",
    sku: "WF-EB-DREAM-DPP",
    price: "US$200",
    nibOptions: SHOGUN_NIBS,
    colorBoundary: "Marble Purple Gray 是官方颜色命名，不是公开色值；不同料位会带来不同紫灰纹理。",
  },
  {
    key: "marble-blue",
    entityId: "phase531-wancher-true-ebonite-marble-blue",
    slug: "wancher-dream-pen-true-ebonite-marble-blue",
    canonicalName: "Wancher Dream Pen True Ebonite Marble Blue",
    title: "True Ebonite - Marble Blue",
    shortTitle: "True Ebonite Marble Blue",
    productId: "6774351757487",
    createdAt: "2021-06-23",
    publishedAt: "2021-07-08",
    url: "https://www.wancherpen.com/products/true-ebonite-marble-blue",
    jsonUrl: "https://www.wancherpen.com/products/true-ebonite-marble-blue.json",
    image: "/images/library/site-original/phase531/wancher/true-ebonite-marble-blue.svg",
    articleFile: ".planning/content-research/wancher-true-ebonite-marble-blue-phase531.md",
    sku: "WF-EB-DREAM-BLGR",
    price: "US$200",
    nibOptions: STANDARD_NIBS,
    colorBoundary: "Marble Blue 是独立蓝色 SKU；页面没有色号、纹理方向或蓝色比例标准。",
  },
  {
    key: "marble-brown",
    entityId: "phase531-wancher-true-ebonite-marble-brown",
    slug: "wancher-dream-pen-true-ebonite-marble-brown",
    canonicalName: "Wancher Dream Pen True Ebonite Marble Brown",
    title: "True Ebonite - Marble Brown",
    shortTitle: "True Ebonite Marble Brown",
    productId: "4622180253777",
    createdAt: "2020-06-08",
    publishedAt: "2020-06-12",
    url: "https://www.wancherpen.com/products/true-ebonite-marble-brown",
    jsonUrl: "https://www.wancherpen.com/products/true-ebonite-marble-brown.json",
    image: "/images/library/site-original/phase531/wancher/true-ebonite-marble-brown.svg",
    articleFile: ".planning/content-research/wancher-true-ebonite-marble-brown-phase531.md",
    sku: "WF-EB-DREAM-BROWN",
    price: "US$200",
    nibOptions: STANDARD_NIBS,
    colorBoundary: "Marble Brown 的材料字段是 Ebonite，不是木材或 Urushi；花纹没有公开色卡。",
  },
] as const;

export type Phase531Target = (typeof PHASE531_TARGETS)[number];

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; tier: CuratedSource["tier"]; sourceType?: CuratedSource["sourceType"]; independenceGroup: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType ?? "official", tier: input.tier, independenceGroup: input.independenceGroup, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase531", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase531", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作色卡或库存证明。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, scopeKey: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }] };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makePack(target: Phase531Target): CuratedEntityPack {
  const scope = `Wancher ${target.shortTitle} exact product record, True Ebonite material and color identity`;
  const product = web({ key: `wancher-phase531-${target.key}-official-json`, title: `${target.title} | Wancher Official product JSON`, url: target.jsonUrl, registryKey: `wancher-official-${target.key}-phase531-json`, registryName: "Wancher Pen official product record", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase531`, summary: `官方 Shopify product JSON：product id ${target.productId}、exact handle、SKU、价格、材料、尖材、feed、供墨和包装。`, locator: "product id, title, handle, created_at, published_at, variants, prices and specifications" });
  const productPage = web({ key: `wancher-phase531-${target.key}-official-page`, title: `${target.title} | Wancher Official`, url: target.url, registryKey: `wancher-official-${target.key}-phase531-page`, registryName: "Wancher Pen official product page", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase531`, summary: `官方商品页：${target.colorBoundary}手工制作差异、True Ebonite 说明、规格、包装和护理提示。`, locator: "exact title, color boundary, handmade statement, specifications, packaging and care" });
  const collection = web({ key: `wancher-phase531-${target.key}-collection`, title: "Dream Pen Collection | Wancher Official", url: "https://www.wancherpen.com/collections/dream-pen", registryKey: `wancher-official-dream-pen-collection-phase531-${target.key}`, registryName: "Wancher Pen official Dream Pen collection", tier: "primary", independenceGroup: `wancher-official-dream-pen-collection-phase531-${target.key}`, summary: "官方 Dream Pen 集合页把 True Ebonite 颜色款与 Urushi、Maki-e 和金属款分开导航；不替 exact 页合并颜色。", locator: "collection product navigation and sibling boundary" });
  const care = web({ key: `wancher-phase531-${target.key}-care`, title: "Wancher Product Care Guide", url: "https://www.wancherpen.com/pages/product-care", registryKey: `wancher-official-product-care-phase531-${target.key}`, registryName: "Wancher Pen official product care", tier: "primary", independenceGroup: `wancher-official-product-care-phase531-${target.key}`, summary: "官方护理页提供钢笔与材料清洁边界；不补写未公布的化学配方。", locator: "material care and cleaning guidance" });
  const vintage = web({ key: `vintage-pens-ebonite-phase531-${target.key}`, title: "Reblackening of faded hard rubber", url: "https://vintagepens.com/FAQrepair/reblackening.shtml", registryKey: `vintage-pens-hard-rubber-phase531-${target.key}`, registryName: "Vintage Pens", sourceType: "blog", tier: "professional_secondary", independenceGroup: `vintage-pens-hard-rubber-phase531-${target.key}`, summary: "专业修复资料说明 hard rubber、ebonite、vulcanite 的钢笔历史与光照褪色风险。", locator: "hard rubber history and light exposure discussion" });
  const pilot = web({ key: `pilot-laccanaite-ebonite-phase531-${target.key}`, title: "LACCANAITE Patent", url: "https://www.pilot.co.jp/100th/en/story/lacquernite.html", registryKey: `pilot-laccanaite-ebonite-phase531-${target.key}`, registryName: "Pilot 100th anniversary archive", tier: "professional_secondary", independenceGroup: `pilot-laccanaite-ebonite-phase531-${target.key}`, summary: "Pilot 历史档案说明早期钢笔使用 ebonite，以及紫外线和湿气造成的表面失色、失光。", locator: "early ebonite fountain pen history and discoloration" });
  const masahiro = web({ key: `masahiro-ebonite-phase531-${target.key}`, title: "エボナイトについて", url: "https://masahiro.gr.jp/product/m-spec/sozai/ebonite/", registryKey: `masahiro-ebonite-phase531-${target.key}`, registryName: "Masahiro 万年筆製作所", sourceType: "official", tier: "professional_secondary", independenceGroup: `masahiro-ebonite-phase531-${target.key}`, summary: "日本笔制作者说明游离硫、紫外线、湿气与硬橡胶表面雾化的保存背景。", locator: "ebonite material and low-UV storage explanation" });
  const svg = diagram(`wancher-phase531-${target.key}-svg`, `${target.shortTitle} 材料、颜色与配置边界事实图`, target.image);
  const c = (key: string, predicate: string, text: string, source: CuratedSource = product, locator = "exact product record", factClass: "core" | "editorial" = "core") => claim(`${target.key}-${key}`, predicate, text, source.key, locator, scope, factClass);
  const variants: CuratedVariant[] = [
    { key: `${target.key}-handmade`, name: "Handmade ebonite piece · pattern and thickness vary", notes: "官方手工差异提醒；不是额外市场 SKU。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" },
    { key: `${target.key}-default`, name: "Default Title", notes: `官方 JSON 市场变体，SKU ${target.sku}；检索窗口价格 ${target.price}。`, sourceKey: product.key, variantKind: "market_sku", productCode: target.sku, market: "global" },
    ...target.nibOptions.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "nib" as const, market: "global" })),
    ...FEEDS.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "material" as const, market: "global" })),
  ];
  const claims: CuratedClaim[] = [
    c("identity", "model_identity", `${target.shortTitle} 是 Wancher Dream Pen True Ebonite 家族中的独立商品；官方 product id 为 ${target.productId}，exact handle 为 ${target.url.split("/products/")[1]}，SKU 为 ${target.sku}。`),
    c("material", "material", `官方 Material & art 列 Ebonite；${target.colorBoundary} 页面未公布色号、颜料比例、料棒批次或可靠成品实测重量。`),
    c("handmade", "handmade_variation", "官方提醒 True Ebonite 需要多道手工步骤，笔身和帽顶厚度会有轻微差异；不同料位可能造成逐支纹理差异。这不是公开编号、固定色卡或质量问题豁免。", productPage, "handmade thickness and piece-to-piece pattern statement"),
    c("history", "material_history_context", "Vintage Pens 将 hard rubber、ebonite、vulcanite 放在同一钢笔材料语境，并记录硬橡胶长期光照后的褪色风险；这是材料背景，不是本支逐件履历。", vintage, "hard rubber history and light exposure discussion"),
    c("historical", "fountain_pen_history_context", "Pilot 100 周年档案说明早期钢笔使用 ebonite，紫外线和湿气会造成表面失色与失光；该档案用于历史和保存背景，不增加本支规格。", pilot, "early ebonite fountain pen history and discoloration"),
    c("conservation", "material_conservation_context", "Masahiro 万年筆製作所说明紫外线与空气水分会促进游离硫的表面反应，长期陈列应减少 UV；本站据此给出保守护理边界。", masahiro, "ebonite material and low-UV storage explanation"),
    c("nib", "nib", `官方尖面菜单为 ${target.nibOptions.map((item) => item[1]).join("、")}；菜单不等于一支笔同时装有所有选项。`, product, "exact nib option menu"),
    c("feed", "feed", `官方 feed 菜单为 ${FEEDS.map((item) => item[1]).join("、")}；实际订单和二手实物需分别核对。`, product, "exact feed option menu"),
    c("filling", "filling_system", "供墨为 Converter 或 Cartridge（European International Standard）；页面没有授权整支笔作为 eyedropper 使用。"),
    c("cap", "cap", "官方列 compact air-tight cap，意图是减少笔尖提前干涸；这不是完全防漏或免维护保证。"),
    c("size", "dimensions", "官方 exact 页面只显示 Size & Shape 标题，没有公开可复核长度、直径或握径；不要从图片估算。"),
    c("weight", "weight", "官方 exact 页面没有公开可靠成品重量；JSON 中的 200 g 字段不作为实测规格。", product, "exact page without published product weight", "editorial"),
    c("packaging", "packaging", "包装文字包括 Traditional Japanese Wooden Box、Pen Kimono、Instructional Materials、Converter 与 Cartridge；Marble Red 页面另写一包三枚 Cartridge，具体交付仍按 exact 订单核对。", product, "packaging field", "editorial"),
    c("care", "maintenance_guidance", "硬橡胶应避开长时间直晒、剧烈温湿变化、酒精、丙酮、漂白剂、强溶剂、金属抛光剂、粗研磨和整支浸水；外部以柔软布轻拭，局部清洗笔尖、feed、握位与 converter。", masahiro, "conservative ebonite care boundary", "editorial"),
    c("price", "price_status", `检索窗口官方 JSON Default Title / ${target.sku} 为 ${target.price}；价格、税费、库存和标签会变化。`, product, "exact market price and commercial labels", "editorial"),
    c("selection", "selection_guidance", `选购或二手核对完整标题、product id ${target.productId}、handle、SKU ${target.sku}、Ebonite、实际 nib/feed、欧规 cartridge、木盒与 Pen Kimono；不要从其它 True Ebonite 颜色或 Urushi sibling 借用字段。`, product, "exact identity and evidence boundary", "editorial"),
  ];
  const values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>> = {
    series_name: target.canonicalName,
    release_year: `独立首发年份未公布；official created_at ${target.createdAt}、published_at ${target.publishedAt}，只作记录语境`,
    origin_country: "Wancher True Ebonite 家族与日本材料叙事；页面未逐组件公布产地分工",
    nib: target.nibOptions.map((item) => item[1]).join("、"),
    fill_system: "Converter 或 European International Standard cartridge",
    material: "Ebonite；颜色与纹理逐支差异，未公布色号、配方或固定色卡",
    dimensions: "官方 exact product page 未公布可复核长度、直径和握径",
    weight: "官方未公布可靠成品重量；JSON 200 g 字段不作为实测规格",
    price_range: `Default Title / ${target.sku} ${target.price}；价格、税费和库存会变`,
    status: "官方商品记录已核对；市场价格、库存与实际订单配置需实时确认",
  };
  return {
    key: `phase531-wancher-${target.key}-v1`, entityId: target.entityId, expectedType: "pen", expectedSlug: target.slug, canonicalName: target.canonicalName, publicationIntent: "publish", publicationBlockers: [], markdownFile: target.articleFile, storyTitle: `${target.shortTitle}：Ebonite 颜色身份与逐支差异`, primarySourceKey: product.key, depthTier: "A", aliases: [{ alias: target.title, language: "en", sourceKey: product.key }, { alias: target.canonicalName, language: "en", sourceKey: product.key }, { alias: `Wancher ${target.shortTitle} 钢笔`, language: "zh", sourceKey: product.key }], sources: [product, productPage, collection, care, vintage, pilot, masahiro, svg], scopes: [{ key: scope, scopeKey: scope, productionState: "historical", market: "global", nibScope: target.nibOptions.map((item) => item[1]).join("、"), materialScope: "Ebonite；颜色名称和逐支纹理边界按 exact 页面记录，未公布色号、尺寸、重量和配方。", editionScope: "Default Title 市场变体与手工外观差异不是公开限量编号；库存和标签按当次页面核对。" }, { key: `phase531-${target.key}-context`, scopeKey: `phase531-${target.key}-context`, productionState: "historical", materialScope: "Independent ebonite history and conservation context only; no product-specific supply-chain certificate.", editionScope: "材料史不建立本支首发年份、固定耐久期限或二手价值。" }], claims, variants, spec: { brandEntityId: PHASE531_WANCHER_BRAND_ID, values, evidence: [evidence(`${target.key}-brand`, "brand_entity_id", collection.key, scope, "official collection brand boundary"), evidence(`${target.key}-series`, "series_name", product.key, scope, "exact title and handle"), evidence(`${target.key}-release`, "release_year", product.key, scope, "created_at and published_at listing context without formal launch year"), evidence(`${target.key}-origin`, "origin_country", productPage.key, scope, "official True Ebonite wording"), evidence(`${target.key}-nib-spec`, "nib", product.key, scope, "exact nib menu"), evidence(`${target.key}-fill-spec`, "fill_system", product.key, scope, "filling mechanism field"), evidence(`${target.key}-material-spec`, "material", product.key, scope, "exact material field"), evidence(`${target.key}-dimensions`, "dimensions", product.key, scope, "exact page without published dimensions"), evidence(`${target.key}-weight`, "weight", product.key, scope, "exact page without published weight"), evidence(`${target.key}-price-spec`, "price_range", product.key, scope, "exact market price row"), evidence(`${target.key}-status`, "status", product.key, scope, "commercial labels and product record")] }, timeline: [{ key: `${target.key}-listing`, title: `${target.shortTitle} exact product record verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: `Exact title, product id, SKU and material boundary verified on ${RETRIEVED}; created_at ${target.createdAt} and published_at ${target.publishedAt} are not formal release dates.`, sourceKey: product.key }], media: [{ key: `${target.key}-svg`, title: `${target.shortTitle} 材料、颜色与配置边界图（非产品照片）`, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }] };
}

export const phase531WancherTrueEbonitePacks: CuratedEntityPack[] = PHASE531_TARGETS.map(makePack);
