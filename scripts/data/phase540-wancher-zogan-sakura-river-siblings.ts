import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, CuratedVariant, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-06";
export const PHASE540_WANCHER_BRAND_ID = "eOfD77nOeENN";
const FEEDS = [
  ["plastic", "Plastic feed", "官方 exact 页面列出的 feed 选项。"],
  ["black-ebonite", "Black ebonite feed", "官方 exact 页面列出的 feed 选项。"],
  ["red-ebonite", "Red ebonite feed", "官方 exact 页面列出的 feed 选项。"],
] as const;

export const PHASE540_TARGETS = [
  {
    key: "blue",
    entityId: "phase540-wancher-zogan-sakura-river-urushi-blue",
    slug: "wancher-zogan-sakura-river-urushi-blue",
    canonicalName: "Wancher Zogan Sakura River Urushi Blue",
    title: "Zogan Sakura River - Urushi Blue",
    shortTitle: "Zogan Sakura River Urushi Blue",
    japaneseName: "桜の川",
    productId: "7950295531735",
    createdAt: "2023-04-18",
    publishedAt: "2023-04-19",
    url: "https://www.wancherpen.com/products/zogan-sakura-river-urushi-blue",
    jsonUrl: "https://www.wancherpen.com/products/zogan-sakura-river-urushi-blue.json",
    image: "/images/library/site-original/phase540/wancher/zogan-sakura-river-urushi-blue.svg",
    articleFile: ".planning/content-research/wancher-zogan-sakura-river-urushi-blue-phase540.md",
    variants: [{ name: "Default Title", sku: "WF-ZOUR-DREAM-BLUE-SAKURA", price: "US$600", available: false }],
    nibs: ["#6 JoWo stainless steel", "Wancher 18K gold"],
    materialSpec: "Ebonite, Urushi, Zogan",
    materialClaim: "官方 exact Material & art 为 Ebonite、Urushi、Zogan；Ebonite 是笔体，Urushi 是漆艺层，Zogan 是母贝嵌入方法，Blue 是商品命名。",
    materialConflict: false,
    availability: "official 2026-08-06 snapshot: Default Title available=false; live page displayed Sold out; inventory and page labels are mutable",
  },
  {
    key: "aka-tamenuri",
    entityId: "phase540-wancher-zogan-sakura-river-urushi-aka-tamenuri",
    slug: "wancher-zogan-sakura-river-urushi-aka-tamenuri",
    canonicalName: "Wancher Zogan Sakura River Urushi Aka Tamenuri",
    title: "Zogan Sakura River - Urushi Aka Tamenuri",
    shortTitle: "Zogan Sakura River Urushi Aka Tamenuri",
    japaneseName: "桜の川",
    productId: "4412958638161",
    createdAt: "2019-12-03",
    publishedAt: "2026-01-13",
    url: "https://www.wancherpen.com/products/dream-pen-zogan-sakura-river-urushi-aka-tamenuri",
    jsonUrl: "https://www.wancherpen.com/products/dream-pen-zogan-sakura-river-urushi-aka-tamenuri.json",
    image: "/images/library/site-original/phase540/wancher/zogan-sakura-river-urushi-aka-tamenuri.svg",
    articleFile: ".planning/content-research/wancher-zogan-sakura-river-urushi-aka-tamenuri-phase540.md",
    variants: [{ name: "Default Title", sku: "WF-ZOUR-DREAM-AKATAME-SAKURA", price: "US$600", available: false }],
    nibs: ["#6 JoWo stainless steel", "Wancher 18K gold", "Keiryu - Kodachi"],
    materialSpec: "Ebonite, Urushi, Zogan",
    materialClaim: "官方 exact Material & art 为 Ebonite、Urushi、Zogan；Aka Tamenuri 是商品命名和漆面语境，不是独立基材或固定色卡。",
    materialConflict: false,
    availability: "official 2026-08-06 snapshot: Default Title available=false; inventory and page labels are mutable",
  },
  {
    key: "tamamushi",
    entityId: "phase540-wancher-zogan-sakura-river-urushi-tamamushi-nuri",
    slug: "wancher-zogan-sakura-river-urushi-tamamushi-nuri",
    canonicalName: "Wancher Zogan Sakura River Urushi Tamamushi-nuri",
    title: "Zogan Sakura River - Urushi Tamamushi-nuri",
    shortTitle: "Zogan Sakura River Urushi Tamamushi-nuri",
    japaneseName: "桜の川",
    productId: "8485792874711",
    createdAt: "2024-05-09",
    publishedAt: "2024-05-09",
    url: "https://www.wancherpen.com/products/zogan-sakura-river-urushi-tamamushi-nuri",
    jsonUrl: "https://www.wancherpen.com/products/zogan-sakura-river-urushi-tamamushi-nuri.json",
    image: "/images/library/site-original/phase540/wancher/zogan-sakura-river-urushi-tamamushi-nuri.svg",
    articleFile: ".planning/content-research/wancher-zogan-sakura-river-urushi-tamamushi-nuri-phase540.md",
    variants: [{ name: "Default Title", sku: "WF-ZOUR-DREAM-SAKTA", price: "US$600", available: false }],
    nibs: ["#6 JoWo stainless steel", "Wancher 18K gold", "KEIRYU/Kodachi"],
    materialSpec: "ABS, Urushi, Zogan",
    materialClaim: "官方 Specifications 字段写 ABS、Urushi、Zogan，但同一页面叙述另称 true Ebonite fountain pen；当前资料不足以解决冲突。",
    materialConflict: true,
    availability: "official 2026-08-06 snapshot: Default Title available=false; live page displayed Sold out; inventory and page labels are mutable",
  },
] as const;
export type Phase540Target = (typeof PHASE540_TARGETS)[number];

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; tier: CuratedSource["tier"]; sourceType?: CuratedSource["sourceType"]; independenceGroup: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType ?? "official", tier: input.tier, independenceGroup: input.independenceGroup, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase540", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase540", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作色卡或库存证明。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, scopeKey: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }] };
}
function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makePack(target: Phase540Target): CuratedEntityPack {
  const scope = `Wancher ${target.shortTitle} exact product record, Sakura River Zogan material and identity boundary`;
  const product = web({ key: `wancher-phase540-${target.key}-official-json`, title: `${target.title} | Wancher Official product JSON`, url: target.jsonUrl, registryKey: `wancher-official-${target.key}-phase540-json`, registryName: "Wancher Pen official product record", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase540`, summary: `官方 Shopify product JSON：product id ${target.productId}、exact handle、时间、Default Title SKU、价格与库存快照。`, locator: "product id, title, handle, created_at, published_at, variants, price and availability" });
  const productPage = web({ key: `wancher-phase540-${target.key}-official-page`, title: `${target.title} | Wancher Official`, url: target.url, registryKey: `wancher-official-${target.key}-phase540-page`, registryName: "Wancher Pen official product page", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase540`, summary: `官方 exact 页面：${target.title}（${target.japaneseName}）、Zogan 母贝嵌入、规格、包装与商品状态。`, locator: "exact title, Zogan and Sakura River description, specifications, packaging and commercial state" });
  const collection = web({ key: `wancher-phase540-${target.key}-collection`, title: "Dream Pen Collection | Wancher Official", url: "https://www.wancherpen.com/collections/dream-pen", registryKey: `wancher-official-dream-pen-collection-phase540-${target.key}`, registryName: "Wancher Pen official Dream Pen collection", tier: "primary", independenceGroup: `wancher-official-dream-pen-collection-phase540-${target.key}`, summary: "官方 Dream Pen 集合页把 Sakura River 作为独立产品入口，不把颜色 sibling 合并。", locator: "Dream Pen navigation and Sakura River sibling boundary" });
  const care = web({ key: `wancher-phase540-${target.key}-care`, title: "Wancher Product Care Guide", url: "https://www.wancherpen.com/pages/product-care", registryKey: `wancher-official-product-care-phase540-${target.key}`, registryName: "Wancher Pen official product care", tier: "primary", independenceGroup: `wancher-official-product-care-phase540-${target.key}`, summary: "官方护理页提供 Ebonite、清洁剂、浸水、直晒和冲击边界。", locator: "Ebonite care instructions" });
  const zogan = web({ key: `nakajima-zogan-phase540-${target.key}`, title: "History and traditional technique | Nakajima Zogan", url: "https://www.nakajima-zougan.jp/en/history/", registryKey: `nakajima-zogan-history-phase540-${target.key}`, registryName: "Nakajima Zogan professional craft studio", tier: "professional_secondary", independenceGroup: `nakajima-zogan-history-phase540-${target.key}`, summary: "专业 Zogan 资料解释日本嵌入工艺的历史与材料背景；不替本支证明具体工坊或施工记录。", locator: "Zogan history and material-dependent inlay context" });
  const pearl = web({ key: `met-mother-of-pearl-phase540-${target.key}`, title: "Mother-of-Pearl | The Metropolitan Museum of Art", url: "https://www.metmuseum.org/exhibitions/listings/2006/mother-of-pearl", registryKey: `met-mother-of-pearl-phase540-${target.key}`, registryName: "The Metropolitan Museum of Art", tier: "professional_secondary", independenceGroup: `met-mother-of-pearl-phase540-${target.key}`, summary: "博物馆资料解释母贝的切割、修整和嵌入漆基底，只作工艺术语背景。", locator: "mother-of-pearl preparation and inlay into lacquer base" });
  const wajima = web({ key: `wajimanuri-phase540-${target.key}`, title: "The production process of Wajimanuri", url: "https://www.wajimanuri.co.jp/e_tayashikkiten/process.html", registryKey: `wajimanuri-process-phase540-${target.key}`, registryName: "Wajimanuri professional craft guide", tier: "professional_secondary", independenceGroup: `wajimanuri-process-phase540-${target.key}`, summary: "轮岛漆艺资料解释底涂、研磨、反复上漆与干燥，只作 Urushi 背景。", locator: "Wajimanuri process stages and specialist craft context" });
  const svg = diagram(`wancher-phase540-${target.key}-svg`, `${target.shortTitle} 材料、嵌入与证据边界事实图`, target.image);
  const c = (key: string, predicate: string, text: string, source: CuratedSource = product, locator = "exact product record", factClass: "core" | "editorial" = "core") => claim(`${target.key}-${key}`, predicate, text, source.key, locator, scope, factClass);
  const variants: CuratedVariant[] = [
    { key: `${target.key}-zogan`, name: "Zogan mother-of-pearl inlay", notes: "官方 exact 页面列为 Zogan 装饰与母贝嵌入；不是另一个市场 SKU。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" },
    ...target.variants.map((item, index) => ({ key: `${target.key}-market-${index + 1}`, name: item.name, notes: `${item.available ? "官方快照检索时可用" : "官方快照检索时不可用"}；价格 ${item.price}，库存和价格会变化。`, sourceKey: product.key, variantKind: "market_sku" as const, productCode: item.sku, market: "global" })),
    ...target.nibs.map((item, index) => ({ key: `${target.key}-nib-${index + 1}`, name: item, notes: "官方 exact 页面列出的公开 nib 选项；不是同时安装多种尖。", sourceKey: product.key, variantKind: "nib" as const, market: "global" })),
    ...FEEDS.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "material" as const, market: "global" })),
  ];
  const claims: CuratedClaim[] = [
    c("identity", "model_identity", `${target.shortTitle} 是 Wancher Dream Pen 中独立列出的 Sakura River 商品；官方 product id 为 ${target.productId}，exact handle 为 ${target.slug.replace("wancher-", "")}，created_at 为 ${target.createdAt}、published_at 为 ${target.publishedAt}。`),
    c("name", "product_name", `官方英文标题为 ${target.title}，页面还使用 Zogan 桜の川 Sakura River；名称只对应 exact product page，不与其他颜色合并。`, productPage, "exact title and Sakura River naming"),
    c("material", "material", target.materialClaim, productPage, "Material & art field and surrounding exact product description"),
    ...(target.materialConflict ? [c("material-conflict", "fact_conflict", "同一官方页面的叙述段写 true Ebonite，但 Specifications 字段写 ABS、Urushi、Zogan；当前没有独立实测或技术资料解决冲突，因此正文和规格同时保留两种说法。", productPage, "true Ebonite narrative versus ABS specification field")] : []),
    c("zogan", "zogan_process", "品牌说明 Zogan／象嵌将 mother-of-pearl 手工切割并嵌入笔体；专业资料只解释工艺背景，不证明本支的具体工序、工坊或工时。", productPage, "Zogan and hand-cut mother-of-pearl description"),
    c("zogan-context", "professional_context", "Nakajima Zogan 资料只作日本嵌入工艺背景，不把现代 Wancher 商品写成传统工艺认证或某位工匠的署名作品。", zogan, "professional Zogan history context"),
    c("pearl-context", "material_context", "大都会艺术博物馆资料说明母贝需切割、修整并嵌入漆基底；它不为本支增加贝种、产地、片数或耐久期限。", pearl, "mother-of-pearl preparation and lacquer-base inlay context"),
    c("lacquer-context", "craft_context", "轮岛漆艺资料只作 Urushi 多工序背景，不证明本支的层数、工坊、师承或交付时间。", wajima, "professional lacquer process background"),
    c("theme", "design_theme", "Sakura River／桜の川以春季樱花花瓣落在水面为题材，品牌称灵感来自 Sakura and River of Time；题材不是历史文物或颜色测量。", productPage, "Sakura River theme and design inspiration"),
    c("nib", "nib", `官方 exact 页面列 ${target.nibs.join("、")}；这是公开选项集合，不是同时安装多种尖。`),
    c("feed", "feed", `官方 exact 页面列 ${FEEDS.map((item) => item[1]).join("、")}；不能从其他 Zogan sibling 借用未列出的 feed。`),
    c("filling", "filling_system", "供墨为 Converter or Cartridge（European International Standard）；官方页面没有授权整支漆艺嵌入笔作为 eyedropper 使用。"),
    c("cap", "cap", "官方写 compact air-tight cap，用于减少墨水干涸；不扩展成绝对防漏或长期密封保证。", productPage, "compact air-tight cap wording", "editorial"),
    c("shape", "shape", "官方页面有 Size & Shape 标题，但没有公开可复核长度、直径和握径；不从商品图片估算尺寸。", productPage, "Size & Shape section without published dimensions"),
    c("weight", "weight", "官方页面没有可靠成品重量；JSON 平台 grams 字段不作为实测成品重量。", product, "variant grams field is not a measured finished weight", "editorial"),
    c("packaging", "packaging", "包装包括 Traditional Japanese Wooden Box、Pen Kimono、Instructional Materials、Authenticity Certificate、Converter 与 Cartridge；具体交付以 exact 订单核对。", productPage, "packaging field", "editorial"),
    c("care", "maintenance_guidance", "Ebonite、Urushi 和母贝嵌片应避免长时间浸水、直晒、干燥环境、极端天气、化学清洁剂和强冲击；外部用略湿软布轻拭，换墨时只处理 nib、feed、握位与 converter。", care, "official Ebonite and material care boundary", "editorial"),
    c("variants", "market_variants", `官方 JSON 快照列出 ${target.variants.map((item) => `${item.name}（${item.sku}，${item.price}）`).join("、")}；市场变体是 SKU 差异，不建立新的颜色实体。`, product, "variants, options, SKUs, prices and availability"),
    c("price", "price_status", `${target.availability}；价格、税费、库存和页面标签会变化。`, product, "exact market price and availability fields", "editorial"),
    c("selection", "selection_guidance", `选购或二手核对完整标题、product id ${target.productId}、handle、唯一 SKU、${target.materialSpec}、公开 nib/feed、欧规供墨和包装；不要从其他 Sakura River 颜色页面借用商品证据。`, product, "exact identity and evidence boundary", "editorial"),
  ];
  const materialValue = target.materialConflict ? "官方规格：ABS；Urushi；Zogan。正文另称 true Ebonite，材质冲突未解决" : `${target.materialSpec}；${target.japaneseName} Sakura River product naming；母贝嵌入的具体贝种和片数未公布`;
  const values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>> = { series_name: target.canonicalName, release_year: `独立正式首发年份未公布；official created_at ${target.createdAt}、published_at ${target.publishedAt}，只作记录语境`, origin_country: "Japanese Zogan and Urushi craft context; exact component-by-component origin not asserted", nib: target.nibs.join("、"), fill_system: "Converter 或 European International Standard cartridge", material: materialValue, dimensions: "官方 exact product page 未公布可复核长度、直径和握径", weight: "官方未公布可靠成品重量；JSON grams 字段不作为实测重量", price_range: target.variants.map((item) => `${item.sku} ${item.price}`).join("；"), status: target.availability };
  return { key: `phase540-wancher-${target.key}-v1`, entityId: target.entityId, expectedType: "pen", expectedSlug: target.slug, canonicalName: target.canonicalName, publicationIntent: "publish", publicationBlockers: [], markdownFile: target.articleFile, storyTitle: `${target.shortTitle}：Zogan 工艺、身份与护理边界`, primarySourceKey: product.key, depthTier: "A", aliases: [{ alias: target.title, language: "en", sourceKey: product.key }, { alias: target.canonicalName, language: "en", sourceKey: product.key }, { alias: `${target.shortTitle} 钢笔`, language: "zh", sourceKey: product.key }, { alias: `${target.japaneseName} Sakura River`, language: "ja", sourceKey: productPage.key }], sources: [product, productPage, collection, care, zogan, pearl, wajima, svg], scopes: [{ key: scope, scopeKey: scope, productionState: "historical", market: "global", nibScope: target.nibs.join("、"), materialScope: `${target.materialSpec}；${target.japaneseName} 题材按 exact 页面记录；${target.materialConflict ? "ABS 与 true Ebonite 文案冲突未解决。" : "未公布贝种、片数、配方、漆层数量、重量和尺寸。"}`, editionScope: "唯一 Default Title 是官方市场 SKU；手工嵌片差异不是公开限量编号。" }, { key: `phase540-${target.key}-craft-context`, scopeKey: `phase540-${target.key}-craft-context`, productionState: "historical", materialScope: "Independent Zogan, mother-of-pearl and lacquer craft context only; no product-specific certification asserted.", editionScope: "专业工艺背景不建立本支首发年份、固定耐久期限或二手价值。" }], claims, variants, spec: { brandEntityId: PHASE540_WANCHER_BRAND_ID, values, evidence: [evidence(`${target.key}-brand`, "brand_entity_id", collection.key, scope, "official Dream Pen collection brand boundary"), evidence(`${target.key}-series`, "series_name", product.key, scope, "exact title and handle"), evidence(`${target.key}-release`, "release_year", product.key, scope, "created_at and published_at listing context without formal launch year"), evidence(`${target.key}-origin`, "origin_country", productPage.key, scope, "official Japanese craft wording"), evidence(`${target.key}-nib-spec`, "nib", product.key, scope, "exact nib field"), evidence(`${target.key}-fill-spec`, "fill_system", product.key, scope, "filling mechanism field"), evidence(`${target.key}-material-spec`, "material", product.key, scope, "exact Material & art field and conflict boundary"), evidence(`${target.key}-dimensions`, "dimensions", productPage.key, scope, "Size & Shape section without published dimensions"), evidence(`${target.key}-weight`, "weight", product.key, scope, "platform grams field not treated as measured weight"), evidence(`${target.key}-price-spec`, "price_range", product.key, scope, "exact market variant price rows"), evidence(`${target.key}-status`, "status", product.key, scope, "variant availability and page labels")] }, timeline: [{ key: `${target.key}-listing`, title: `${target.shortTitle} exact product record verified`, eventType: "design_milestone", startDate: target.createdAt, circa: false, description: `Exact title, product id, handle, name, SKU and Zogan specifications verified on ${RETRIEVED}; created_at ${target.createdAt} and published_at ${target.publishedAt} are not formal launch dates.`, sourceKey: product.key }], media: [{ key: `${target.key}-svg`, title: `${target.shortTitle} 材料、嵌入与证据边界图（非产品照片）`, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }] };
}

export const phase540WancherZoganSakuraRiverSiblingPacks: CuratedEntityPack[] = PHASE540_TARGETS.map(makePack);
