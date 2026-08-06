import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-06";
export const PHASE534_WANCHER_BRAND_ID = "eOfD77nOeENN";
const NIB = [["wancher-18k", "#6 Wancher 18K gold, Rhodium-plated", "官方 Urushi-e exact 页面尖面配置。"]] as const;
const FEED = [["plastic", "Plastic feed", "官方 Urushi-e exact 页面仅列 Plastic。"]] as const;

export const PHASE534_TARGETS = [
  {
    key: "dragon",
    entityId: "phase534-wancher-urushi-e-dragon",
    slug: "wancher-urushi-e-dragon",
    canonicalName: "Wancher Dream Pen Urushi-e Dragon",
    title: "Dream Pen Urushi-e: Dragon",
    shortTitle: "Dream Pen Urushi-e Dragon",
    productId: "8737353826519",
    createdAt: "2024-10-17",
    publishedAt: "2024-10-17",
    url: "https://www.wancherpen.com/products/urushi-e-dragon",
    jsonUrl: "https://www.wancherpen.com/products/urushi-e-dragon.json",
    image: "/images/library/site-original/phase534/wancher/urushi-e-dragon.svg",
    articleFile: ".planning/content-research/wancher-urushi-e-dragon-phase534.md",
    sku: "WF-MK24-DP-DRG",
    price: "US$1400",
    availability: "official JSON available=false at retrieval; official page showed Sold out; inventory status is mutable",
    design: "Rokkyoku Issou Ryu-Tora-zu Folding Screen 语境中的云上神龙；官方将 Dragon 放在帽部云气之上，写作智慧、善意与好运的品牌灵感。",
    contextTitle: "龙虎图屏风 | 大阪市立美术馆数字馆藏",
    contextUrl: "https://dom.ocm.osaka/database/osaka-art-museum/7473",
    contextRegistryKey: "osaka-art-museum-ryukozu-phase534-dragon",
    contextRegistryName: "Osaka City Museum of Art digital collection",
    contextSummary: "大阪市立美术馆记录一件六曲一双龙虎图屏风的作者、时代、材质与件数；只作题材和形式背景。",
    contextLocator: "六曲一双、纸本金地墨画、作者与江户时代字段",
  },
  {
    key: "tiger",
    entityId: "phase534-wancher-urushi-e-tiger",
    slug: "wancher-urushi-e-tiger",
    canonicalName: "Wancher Dream Pen Urushi-e Tiger",
    title: "Dream Pen Urushi-e: Tiger",
    shortTitle: "Dream Pen Urushi-e Tiger",
    productId: "8737364312279",
    createdAt: "2024-10-17",
    publishedAt: "2024-10-17",
    url: "https://www.wancherpen.com/products/urushi-e-tiger",
    jsonUrl: "https://www.wancherpen.com/products/urushi-e-tiger.json",
    image: "/images/library/site-original/phase534/wancher/urushi-e-tiger.svg",
    articleFile: ".planning/content-research/wancher-urushi-e-tiger-phase534.md",
    sku: "WF-MK24-DP-TG",
    price: "US$1400",
    availability: "official JSON available=false at retrieval; official page showed Sale / Sold out; inventory status is mutable",
    design: "Rokkyoku Issou Ryu-Tora-zu Folding Screen 语境中的竹林地面虎；官方将 Tiger 写作力量、驱邪与勇气的品牌灵感。",
    contextTitle: "龙虎图屏风 | 大阪市立美术馆数字馆藏",
    contextUrl: "https://dom.ocm.osaka/database/osaka-art-museum/7473",
    contextRegistryKey: "osaka-art-museum-ryukozu-phase534-tiger",
    contextRegistryName: "Osaka City Museum of Art digital collection",
    contextSummary: "大阪市立美术馆记录一件六曲一双龙虎图屏风的作者、时代、材质与件数；只作题材和形式背景。",
    contextLocator: "六曲一双、纸本金地墨画、作者与江户时代字段",
  },
  {
    key: "persimmon-tree",
    entityId: "phase534-wancher-urushi-e-persimmon-tree",
    slug: "wancher-urushi-e-persimmon-tree",
    canonicalName: "Wancher Dream Pen Urushi-e Persimmon Tree",
    title: "Dream Pen Urushi-e: Persimmon Tree",
    shortTitle: "Dream Pen Urushi-e Persimmon Tree",
    productId: "8398627373271",
    createdAt: "2024-04-15",
    publishedAt: "2024-04-16",
    url: "https://www.wancherpen.com/products/urushi-e-persimmon-tree",
    jsonUrl: "https://www.wancherpen.com/products/urushi-e-persimmon-tree.json",
    image: "/images/library/site-original/phase534/wancher/urushi-e-persimmon-tree.svg",
    articleFile: ".planning/content-research/wancher-urushi-e-persimmon-tree-phase534.md",
    sku: "WF-MK24-DP-KK",
    price: "US$1400",
    availability: "official JSON available=false at retrieval; official page showed Sale / Sold out; inventory status is mutable",
    design: "酒井抱一《Persimmon Tree／柿図》屏风的设计语境；Wancher 将其转译到圆柱笔身，不把现代商品写成馆藏原作。",
    contextTitle: "Persimmon Tree, Sakai Hōitsu | The Metropolitan Museum of Art",
    contextUrl: "https://www.metmuseum.org/art/collection/search/45392",
    contextRegistryKey: "met-persimmon-tree-phase534",
    contextRegistryName: "The Metropolitan Museum of Art",
    contextSummary: "Met 馆藏记录 Sakai Hōitsu 1816 年 Persimmon Tree 双曲屏风的题名、年代、媒材、编号与当前 Not on view 状态。",
    contextLocator: "title, artist, date 1816, medium, object number 57.156.3 and display status",
    contextExtraTitle: "The Rinpa Experience of Nature | The Metropolitan Museum of Art",
    contextExtraUrl: "https://www.metmuseum.org/ja/perspectives/japan-rinpa-school-screens",
    contextExtraRegistryKey: "met-rinpa-nature-phase534-persimmon",
    contextExtraSummary: "Met 对琳派屏风的季节、自然题材与酒井抱一语境说明；只作艺术背景。",
    contextExtraLocator: "Rinpa screens, seasonal nature and Sakai Hōitsu context",
  },
] as const;
export type Phase534Target = (typeof PHASE534_TARGETS)[number];

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; tier: CuratedSource["tier"]; sourceType?: CuratedSource["sourceType"]; independenceGroup: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType ?? "official", tier: input.tier, independenceGroup: input.independenceGroup, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase534", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase534", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作色卡或库存证明。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, scopeKey: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }] };
}
function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makePack(target: Phase534Target): CuratedEntityPack {
  const scope = `Wancher ${target.shortTitle} exact product record, Urushi-e material and design boundary`;
  const product = web({ key: `wancher-phase534-${target.key}-official-json`, title: `${target.title} | Wancher Official product JSON`, url: target.jsonUrl, registryKey: `wancher-official-${target.key}-phase534-json`, registryName: "Wancher Pen official product record", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase534`, summary: `官方 Shopify product JSON：product id ${target.productId}、exact handle、SKU、价格、记录时间、市场变体、库存、材料、尖材、feed 与供墨。`, locator: "product id, title, handle, created_at, published_at, variants, price, availability and specifications" });
  const productPage = web({ key: `wancher-phase534-${target.key}-official-page`, title: `${target.title} | Wancher Official`, url: target.url, registryKey: `wancher-official-${target.key}-phase534-page`, registryName: "Wancher Pen official product page", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase534`, summary: `官方商品页：${target.design}Urushi-e 系列工艺、Natural Raw Urushi、18K 尖、包装和手工边界。`, locator: "exact title, Urushi-e description, design inspiration, natural Urushi, specifications and packaging" });
  const collection = web({ key: `wancher-phase534-${target.key}-collection`, title: "Dream Pen Collection | Wancher Official", url: "https://www.wancherpen.com/collections/dream-pen", registryKey: `wancher-official-dream-pen-collection-phase534-${target.key}`, registryName: "Wancher Pen official Dream Pen collection", tier: "primary", independenceGroup: `wancher-official-dream-pen-collection-phase534-${target.key}`, summary: "官方 Dream Pen 集合页把 Urushi-e Dragon、Tiger 与 Persimmon Tree 作为独立商品导航；不把不同题材合并。", locator: "Dream Pen navigation and Urushi-e sibling/entity boundary" });
  const care = web({ key: `wancher-phase534-${target.key}-care`, title: "Wancher Product Care Guide", url: "https://www.wancherpen.com/pages/product-care", registryKey: `wancher-official-product-care-phase534-${target.key}`, registryName: "Wancher Pen official product care", tier: "primary", independenceGroup: `wancher-official-product-care-phase534-${target.key}`, summary: "官方护理页提供钢笔、漆面与清洁边界；不补写未公布化学配方。", locator: "material care and cleaning guidance" });
  const context = web({ key: `wancher-phase534-${target.key}-context`, title: target.contextTitle, url: target.contextUrl, registryKey: target.contextRegistryKey, registryName: target.contextRegistryName, tier: "professional_secondary", independenceGroup: `${target.contextRegistryKey}-group`, summary: target.contextSummary, locator: target.contextLocator });
  const contextExtra = "contextExtraUrl" in target ? web({ key: `wancher-phase534-${target.key}-context-extra`, title: target.contextExtraTitle, url: target.contextExtraUrl, registryKey: target.contextExtraRegistryKey, registryName: "The Metropolitan Museum of Art", tier: "professional_secondary", independenceGroup: `${target.contextExtraRegistryKey}-group`, summary: target.contextExtraSummary, locator: target.contextExtraLocator }) : null;
  const contextExtraLocator = "contextExtraLocator" in target ? target.contextExtraLocator : "context extra";
  const makie = web({ key: `jta-makie-phase534-${target.key}`, title: "Maki-e", url: "https://www.mlit.go.jp/tagengo-db/en/R4-00025.html", registryKey: `japan-tourism-agency-makie-phase534-${target.key}`, registryName: "Japan Tourism Agency", tier: "professional_secondary", independenceGroup: `japan-tourism-agency-makie-phase534-${target.key}`, summary: "日本观光厅解释 Maki-e 在软漆上施加金属粉及平/高蒔绘术语；只作工艺背景。", locator: "Maki-e technique definition and hira/taka distinction" });
  const svg = diagram(`wancher-phase534-${target.key}-svg`, `${target.shortTitle} 材料、题材与来源边界事实图`, target.image);
  const c = (key: string, predicate: string, text: string, source: CuratedSource = product, locator = "exact product record", factClass: "core" | "editorial" = "core") => claim(`${target.key}-${key}`, predicate, text, source.key, locator, scope, factClass);
  const variants: CuratedVariant[] = [
    { key: `${target.key}-handmade`, name: "Handmade Urushi-e surface", notes: "官方手工和自然材料叙述；不是额外市场 SKU。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" },
    { key: `${target.key}-default`, name: "Default Title", notes: `官方 JSON 唯一市场变体，SKU ${target.sku}；检索窗口价格 ${target.price}。`, sourceKey: product.key, variantKind: "market_sku", productCode: target.sku, market: "global" },
    ...NIB.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "nib" as const, market: "global" })),
    ...FEED.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "material" as const, market: "global" })),
  ];
  const claims: CuratedClaim[] = [
    c("identity", "model_identity", `${target.shortTitle} 是 Wancher Dream Pen Urushi-e collection 中的独立商品；官方 product id 为 ${target.productId}，exact handle 为 ${target.url.split("/products/")[1]}，SKU 为 ${target.sku}。`),
    c("material", "material", `官方 exact Material 为 Ebonite，Art 为 Urushi-e；页面没有公布颜料配方、漆层数量、可靠成品重量或可复核尺寸。`),
    c("urushi", "urushi_e_context", "Wancher 将 Urushi-e 解释为把颜料混入漆的细密漆绘，并称本系列使用 Natural Raw Urushi；系列材料叙述不等于本支的实际用量、产地证书或固定耐久期限。", productPage, "Urushi-e and Natural Raw Urushi description"),
    c("design", "design_theme", `${target.design}这是品牌 Design Inspiration，不把现代钢笔写成屏风馆藏原件、按原尺寸复制品或博物馆授权商品。`, productPage, "design inspiration and exact title"),
    c("museum", "museum_context_boundary", `${target.contextRegistryName} 的资料可以解释参考画面、题材或屏风形式，但不证明 Wancher 商品与馆藏作品存在逐笔复制、授权或同一工匠关系。`, context, target.contextLocator),
    ...(contextExtra ? [c("museum-extra", "museum_context_extra", "Met 的琳派自然与季节语境只作 Persimmon Tree 的艺术背景；当前展陈状态按馆藏页面读取，不能把宣传语变成永久展出承诺。", contextExtra, contextExtraLocator)] : []),
    c("makie", "technique_context", "日本观光厅说明 Maki-e 的金属粉、平蒔绘和高蒔绘逻辑；本支 exact Art 是 Urushi-e，本文不擅自增加金粉、螺钿或高蒔绘配置。", makie, "Maki-e technique definition and hira/taka distinction"),
    c("nib", "nib", `官方 exact 页面列 ${NIB.map((item) => item[1]).join("、")}；不是同时安装多个尖。`),
    c("feed", "feed", `官方 exact 页面仅列 ${FEED.map((item) => item[1]).join("、")}；不能从其它 Urushi-e 或 Maki-e sibling 借用 ebonite feed。`),
    c("filling", "filling_system", "供墨为 Converter 或 Cartridge（European International Standard）；页面没有授权整支笔作为 eyedropper 使用。"),
    c("shape", "shape", "官方 exact 页面提供 Shape & Measurement 标题或示意图，但没有公开可复核长度、直径和握径；不要从题材照片估算尺寸。"),
    c("weight", "weight", "官方 exact 页面没有公开可靠成品重量；JSON 中 200 g 平台字段不作为实测规格。", product, "exact page without published product weight", "editorial"),
    c("packaging", "packaging", "包装包括 Traditional Japanese Wooden Box、Pen Kimono、Instructional Materials、Converter 与 Cartridge；具体交付按 exact 订单核对。", product, "packaging field", "editorial"),
    c("care", "maintenance_guidance", "天然 Urushi、颜料漆面与 Ebonite 应避开酒精、丙酮、漂白剂、强溶剂、金属抛光剂、粗研磨、直晒、剧烈温湿变化和整支浸水；外部用柔软布轻拭，局部清洗 nib、feed、握位与 converter。", care, "official conservative pen care boundary", "editorial"),
    c("price", "price_status", `检索窗口官方 JSON Default Title / ${target.sku} 为 ${target.price}，${target.availability}；价格、税费、库存和标签会变化。`, product, "exact market price and availability fields", "editorial"),
    c("selection", "selection_guidance", `选购或二手核对完整标题、product id ${target.productId}、handle、SKU ${target.sku}、Ebonite、Urushi-e、18K nib、Plastic feed、欧规 cartridge、木盒和 Pen Kimono；不要从其它题材借用设计或价格。`, product, "exact identity and evidence boundary", "editorial"),
  ];
  const values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>> = { series_name: target.canonicalName, release_year: `独立首发年份未公布；official created_at ${target.createdAt}、published_at ${target.publishedAt}，只作记录语境`, origin_country: "Japanese Urushi-e craft context; exact component-by-component origin not asserted", nib: NIB.map((item) => item[1]).join("、"), fill_system: "Converter 或 European International Standard cartridge", material: "Ebonite；Urushi-e；Natural Raw Urushi wording on official page", dimensions: "官方 exact product page 未公布可复核长度、直径和握径", weight: "官方未公布可靠成品重量；JSON 200 g 字段不作为实测规格", price_range: `Default Title / ${target.sku} ${target.price}；价格、税费和库存会变`, status: target.availability };
  return { key: `phase534-wancher-${target.key}-v1`, entityId: target.entityId, expectedType: "pen", expectedSlug: target.slug, canonicalName: target.canonicalName, publicationIntent: "publish", publicationBlockers: [], markdownFile: target.articleFile, storyTitle: `${target.shortTitle}：Urushi-e、题材与商品边界`, primarySourceKey: product.key, depthTier: "A", aliases: [{ alias: target.title, language: "en", sourceKey: product.key }, { alias: target.canonicalName, language: "en", sourceKey: product.key }, { alias: `Wancher ${target.shortTitle} 钢笔`, language: "zh", sourceKey: product.key }], sources: [product, productPage, collection, care, context, ...(contextExtra ? [contextExtra] : []), makie, svg], scopes: [{ key: scope, scopeKey: scope, productionState: "historical", market: "global", nibScope: NIB.map((item) => item[1]).join("、"), materialScope: "Ebonite、Urushi-e 与 Natural Raw Urushi wording 按 exact 页面记录；未公布颜料配方、漆层数量、重量和尺寸。", editionScope: "Default Title 是官方市场变体；手工表面差异不是公开限量编号。" }, { key: `phase534-${target.key}-context`, scopeKey: `phase534-${target.key}-context`, productionState: "historical", materialScope: "Independent museum and Japanese lacquer context only; no product-specific artisan or authorization asserted.", editionScope: "工艺史不建立本支首发年份、固定耐久期限或二手价值。" }], claims, variants, spec: { brandEntityId: PHASE534_WANCHER_BRAND_ID, values, evidence: [evidence(`${target.key}-brand`, "brand_entity_id", collection.key, scope, "official collection brand boundary"), evidence(`${target.key}-series`, "series_name", product.key, scope, "exact title and handle"), evidence(`${target.key}-release`, "release_year", product.key, scope, "created_at and published_at listing context without formal launch year"), evidence(`${target.key}-origin`, "origin_country", productPage.key, scope, "official Urushi-e wording"), evidence(`${target.key}-nib-spec`, "nib", product.key, scope, "exact nib field"), evidence(`${target.key}-fill-spec`, "fill_system", product.key, scope, "filling mechanism field"), evidence(`${target.key}-material-spec`, "material", product.key, scope, "exact material and art field"), evidence(`${target.key}-dimensions`, "dimensions", product.key, scope, "exact page without published dimensions"), evidence(`${target.key}-weight`, "weight", product.key, scope, "exact page without published weight"), evidence(`${target.key}-price-spec`, "price_range", product.key, scope, "exact market price row"), evidence(`${target.key}-status`, "status", product.key, scope, "commercial labels and product record")] }, timeline: [{ key: `${target.key}-listing`, title: `${target.shortTitle} exact product record verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: `Exact title, product id, SKU, Urushi-e wording and design boundary verified on ${RETRIEVED}; created_at ${target.createdAt} and published_at ${target.publishedAt} are not formal release dates.`, sourceKey: product.key }], media: [{ key: `${target.key}-svg`, title: `${target.shortTitle} 材料、题材与来源边界图（非产品照片）`, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }] };
}

export const phase534WancherUrushiEPacks: CuratedEntityPack[] = PHASE534_TARGETS.map(makePack);
