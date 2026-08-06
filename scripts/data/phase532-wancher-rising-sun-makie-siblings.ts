import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-06";
export const PHASE532_WANCHER_BRAND_ID = "eOfD77nOeENN";
const NIBS = [
  ["jowo", "#6 JoWo stainless steel", "官方 exact 页面尖面菜单。"],
  ["wancher-18k", "Wancher 18K gold", "官方 exact 页面尖面菜单。"],
] as const;
const FEEDS = [
  ["plastic", "Plastic feed", "官方 exact 页面 feed 菜单。"],
  ["ebonite-black", "Black ebonite feed", "官方 exact 页面 feed 菜单。"],
  ["ebonite-red", "Red ebonite feed", "官方 exact 页面 feed 菜单。"],
] as const;

export const PHASE532_TARGETS = [
  {
    key: "sansui",
    entityId: "phase532-wancher-rising-sun-sansui",
    slug: "wancher-rising-sun-maki-e-sansui",
    canonicalName: "Wancher Dream Pen Rising Sun Maki-e Sansui",
    title: "Rising Sun Maki-e - Sansui",
    shortTitle: "Rising Sun Maki-e Sansui",
    productId: "4359679410257",
    createdAt: "2019-11-09",
    publishedAt: "2019-11-09",
    url: "https://www.wancherpen.com/products/rising-sun-maki-e-sansui",
    jsonUrl: "https://www.wancherpen.com/products/rising-sun-maki-e-sansui.json",
    image: "/images/library/site-original/phase532/wancher/rising-sun-maki-e-sansui.svg",
    articleFile: ".planning/content-research/wancher-rising-sun-maki-e-sansui-phase532.md",
    sku: "WF-MAGO-DREAM-SANSUI",
    price: "US$300",
    material: "ABS、Gold leaf、Kindai Maki-e",
    theme: "Sansui 山水景观设计语境；官方 exact Material & art 明列 Gold leaf。",
    availability: "official JSON available=false at retrieval; inventory status is mutable",
  },
  {
    key: "dragon",
    entityId: "phase532-wancher-rising-sun-dragon",
    slug: "wancher-rising-sun-maki-e-dragon",
    canonicalName: "Wancher Dream Pen Rising Sun Maki-e Dragon",
    title: "Rising Sun Maki-e - Dragon",
    shortTitle: "Rising Sun Maki-e Dragon",
    productId: "4458300014673",
    createdAt: "2019-12-26",
    publishedAt: "2019-12-27",
    url: "https://www.wancherpen.com/products/rising-sun-maki-e-dragon",
    jsonUrl: "https://www.wancherpen.com/products/rising-sun-maki-e-dragon.json",
    image: "/images/library/site-original/phase532/wancher/rising-sun-maki-e-dragon.svg",
    articleFile: ".planning/content-research/wancher-rising-sun-maki-e-dragon-phase532.md",
    sku: "WF-MAGO-DREAM-RYU",
    price: "US$300",
    material: "ABS、Kindai Maki-e（exact page）；系列 Kinpaku wording 保留为 broader context",
    theme: "Ryu 龙纹设计语境；不从系列正文把 Gold leaf 加入 exact Material & art。",
    availability: "official JSON available=true at retrieval; inventory status is mutable",
  },
] as const;
export type Phase532Target = (typeof PHASE532_TARGETS)[number];

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; tier: CuratedSource["tier"]; sourceType?: CuratedSource["sourceType"]; independenceGroup: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType ?? "official", tier: input.tier, independenceGroup: input.independenceGroup, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase532", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase532", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作色卡或库存证明。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, scopeKey: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }] };
}
function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makePack(target: Phase532Target): CuratedEntityPack {
  const scope = `Wancher ${target.shortTitle} exact product record, Rising Sun Maki-e material and design boundary`;
  const product = web({ key: `wancher-phase532-${target.key}-official-json`, title: `${target.title} | Wancher Official product JSON`, url: target.jsonUrl, registryKey: `wancher-official-${target.key}-phase532-json`, registryName: "Wancher Pen official product record", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase532`, summary: `官方 Shopify product JSON：product id ${target.productId}、exact handle、SKU、价格、记录时间、材料、尖材、feed、供墨和库存字段。`, locator: "product id, title, handle, created_at, published_at, variants, availability and specifications" });
  const productPage = web({ key: `wancher-phase532-${target.key}-official-page`, title: `${target.title} | Wancher Official`, url: target.url, registryKey: `wancher-official-${target.key}-phase532-page`, registryName: "Wancher Pen official product page", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase532`, summary: `官方商品页：${target.theme}手工差异、规格、Cigar shape、包装和护理提示。`, locator: "exact title, material/art wording, handmade statement, specifications, shape, packaging and care" });
  const collection = web({ key: `wancher-phase532-${target.key}-collection`, title: "Dream Pen Collection | Wancher Official", url: "https://www.wancherpen.com/collections/dream-pen", registryKey: `wancher-official-dream-pen-collection-phase532-${target.key}`, registryName: "Wancher Pen official Dream Pen collection", tier: "primary", independenceGroup: `wancher-official-dream-pen-collection-phase532-${target.key}`, summary: "官方集合页把 Rising Sun Maki-e 的 Ryu 与 Sansui 作为两个独立设计卡片；不把兄弟 SKU 合并。", locator: "Rising Sun collection navigation and Ryu/Sansui sibling boundary" });
  const care = web({ key: `wancher-phase532-${target.key}-care`, title: "Wancher Product Care Guide", url: "https://www.wancherpen.com/pages/product-care", registryKey: `wancher-official-product-care-phase532-${target.key}`, registryName: "Wancher Pen official product care", tier: "primary", independenceGroup: `wancher-official-product-care-phase532-${target.key}`, summary: "官方护理页提供钢笔、漆面和清洁边界；不补写未公布化学配方。", locator: "material care and cleaning guidance" });
  const yamanaka = web({ key: `yamanaka-about-phase532-${target.key}`, title: "About Yamanaka Lacquerware", url: "https://www.yamanakashikki.com/en/about/", registryKey: `yamanaka-lacquerware-about-phase532-${target.key}`, registryName: "Yamanaka Lacquerware official site", tier: "professional_secondary", independenceGroup: `yamanaka-lacquerware-about-phase532-${target.key}`, summary: "山中漆器官方资料说明地域、Maki-e 传入与现代工艺背景；不替 Wancher 证明逐件工匠或金箔。", locator: "Yamanaka-nuri history and Maki-e context" });
  const process = web({ key: `yamanaka-process-phase532-${target.key}`, title: "Manufacturing process | The Tradition of Yamanaka", url: "https://www.yamanakashikki.com/en/tradition/process/", registryKey: `yamanaka-lacquerware-process-phase532-${target.key}`, registryName: "Yamanaka Lacquerware official site", tier: "professional_secondary", independenceGroup: `yamanaka-lacquerware-process-phase532-${target.key}`, summary: "山中漆器工艺页说明木工、打底、涂层与 Maki-e 的分工；只作术语背景。", locator: "division of labour and lacquer/Maki-e process" });
  const government = web({ key: `gov-yamanaka-phase532-${target.key}`, title: "The JOY of Yamanaka Lacquer", url: "https://www.gov-online.go.jp/eng/publicity/book/hlj/html/201111/201111_14.html", registryKey: `government-online-yamanaka-phase532-${target.key}`, registryName: "Government of Japan Online", tier: "professional_secondary", independenceGroup: `government-online-yamanaka-phase532-${target.key}`, summary: "日本政府英文资料说明山中漆器传统工艺指定与木工、打底、涂漆、绘漆阶段。", locator: "Yamanaka lacquerware designation and four stages" });
  const makie = web({ key: `mlit-makie-phase532-${target.key}`, title: "Maki-e", url: "https://www.mlit.go.jp/tagengo-db/en/R4-00026.html", registryKey: `japan-tourism-agency-makie-phase532-${target.key}`, registryName: "Japan Tourism Agency", tier: "professional_secondary", independenceGroup: `japan-tourism-agency-makie-phase532-${target.key}`, summary: "日本观光厅解释 Maki-e 在未完全硬化的漆上施加金属粉末的基本术语。", locator: "Maki-e technique definition" });
  const svg = diagram(`wancher-phase532-${target.key}-svg`, `${target.shortTitle} 材料、系列与 exact 字段边界事实图`, target.image);
  const c = (key: string, predicate: string, text: string, source: CuratedSource = product, locator = "exact product record", factClass: "core" | "editorial" = "core") => claim(`${target.key}-${key}`, predicate, text, source.key, locator, scope, factClass);
  const variants: CuratedVariant[] = [
    { key: `${target.key}-handmade`, name: "Handmade Maki-e surface · no fixed texture standard", notes: "官方手工差异提醒；不是额外市场 SKU。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" },
    { key: `${target.key}-default`, name: "Default Title", notes: `官方 JSON 市场变体，SKU ${target.sku}；检索窗口价格 ${target.price}。`, sourceKey: product.key, variantKind: "market_sku", productCode: target.sku, market: "global" },
    ...NIBS.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "nib" as const, market: "global" })),
    ...FEEDS.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "material" as const, market: "global" })),
  ];
  const claims: CuratedClaim[] = [
    c("identity", "model_identity", `${target.shortTitle} 是 Rising Sun Maki-e collection 中的独立商品；官方 product id 为 ${target.productId}，exact handle 为 ${target.url.split("/products/")[1]}，SKU 为 ${target.sku}。`),
    c("material", "material", `exact Material & art 写为 ${target.material}；${target.theme}没有被扩写成额外工匠、金箔重量、漆层数量或固定色号。`),
    c("handmade", "handmade_variation", "官方提醒每支笔手工完成，收到的表面可能与图片略有不同；这表示图案与反光存在差异，不等于公开编号、限量总数或结构缺陷豁免。", productPage, "handmade variation statement"),
    c("collection", "collection_boundary", "官方系列说明 Rising Sun 采用 Yamanaka-nuri、Kinpaku 与 Kindai Maki-e 的系列语境，并把 Ryu 与 Sansui 分开；系列宣传不自动覆盖另一个 sibling 的 exact Material & art。", collection, "Rising Sun collection and sibling design boundary"),
    c("yamanaka", "craft_history_context", "Yamanaka Lacquerware 官方资料说明山中漆器的地域、江户时期技术传入与 Maki-e 发展；这是专业背景，不是本支逐件工艺履历。", yamanaka, "Yamanaka-nuri history and Maki-e context"),
    c("process", "craft_process_context", "山中漆器工艺页把木工、打底、涂层和 Maki-e 作为分工流程；不替 Wancher 证明本支工匠、层数、金属材料或制作日期。", process, "division of labour and lacquer/Maki-e process"),
    c("designation", "craft_designation_context", "日本政府资料说明山中漆器的传统工艺指定与工艺阶段；只作地域历史背景。", government, "Yamanaka lacquerware designation and four stages"),
    c("makie", "technique_context", "日本观光厅将 Maki-e 解释为在尚未完全硬化的漆上施加金属粉末等装饰；不把术语背景变成这支笔的金箔克数或纯手绘证明。", makie, "Maki-e technique definition"),
    c("nib", "nib", `官方尖面菜单为 ${NIBS.map((item) => item[1]).join("、")}；菜单是订单选择，不是一支笔同时安装全部选项。`),
    c("feed", "feed", `官方 feed 菜单为 ${FEEDS.map((item) => item[1]).join("、")}；实际订单和二手实物需分别核对。`),
    c("filling", "filling_system", "供墨为 Converter 或 Cartridge（European International Standard）；页面没有授权整支笔作为 eyedropper 使用。"),
    c("cap", "cap", "官方列 compact air-tight cap，目标是减少笔尖提前干涸；不等于完全防漏或免维护保证。"),
    c("shape", "shape", "Size & Shape 仅描述传统、简约的 Cigar shape 与重量平衡，没有公开可复核长度、直径或握径。"),
    c("weight", "weight", "官方 exact 页面没有公开可靠成品重量；JSON 中 200 g 平台字段不作为实测规格。", product, "exact page without published product weight", "editorial"),
    c("packaging", "packaging", "包装包括 Traditional Japanese Wooden Box、Pen Kimono、Instructional Materials、Authenticity Certificate、Converter 与 Cartridge；具体交付按 exact 订单核对。", product, "packaging field", "editorial"),
    c("care", "maintenance_guidance", "ABS、漆面与金箔装饰应避开酒精、丙酮、漂白剂、强溶剂、金属抛光剂、粗研磨、直晒和整支浸水；外部用柔软布轻拭，局部清洗笔尖、feed、握位与 converter。", care, "official conservative pen care boundary", "editorial"),
    c("price", "price_status", `检索窗口官方 JSON Default Title / ${target.sku} 为 ${target.price}，库存字段为 ${target.availability}；价格、税费、库存和标签会变化。`, product, "exact market price and availability fields", "editorial"),
    c("selection", "selection_guidance", `选购或二手核对完整标题、product id ${target.productId}、handle、SKU ${target.sku}、Material & art、实际 nib/feed、欧规 cartridge、Authenticity Certificate、木盒与 Pen Kimono；不要从 ${target.key === "sansui" ? "Dragon" : "Sansui"} 或其它 Maki-e SKU 借字段。`, product, "exact identity and evidence boundary", "editorial"),
  ];
  const values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>> = { series_name: target.canonicalName, release_year: `独立首发年份未公布；official created_at ${target.createdAt}、published_at ${target.publishedAt}，只作记录语境`, origin_country: "Rising Sun 的 Yamanaka-nuri／日本 Maki-e 系列语境；页面未逐组件公布产地分工", nib: NIBS.map((item) => item[1]).join("、"), fill_system: "Converter 或 European International Standard cartridge", material: target.material, dimensions: "官方 exact product page 未公布可复核长度、直径和握径", weight: "官方未公布可靠成品重量；JSON 200 g 字段不作为实测规格", price_range: `Default Title / ${target.sku} ${target.price}；价格、税费和库存会变`, status: target.availability };
  return { key: `phase532-wancher-${target.key}-v1`, entityId: target.entityId, expectedType: "pen", expectedSlug: target.slug, canonicalName: target.canonicalName, publicationIntent: "publish", publicationBlockers: [], markdownFile: target.articleFile, storyTitle: `${target.shortTitle}：系列 Maki-e 与 exact 材料边界`, primarySourceKey: product.key, depthTier: "A", aliases: [{ alias: target.title, language: "en", sourceKey: product.key }, { alias: target.canonicalName, language: "en", sourceKey: product.key }, { alias: `Wancher ${target.shortTitle} 钢笔`, language: "zh", sourceKey: product.key }], sources: [product, productPage, collection, care, yamanaka, process, government, makie, svg], scopes: [{ key: scope, scopeKey: scope, productionState: "historical", market: "global", nibScope: NIBS.map((item) => item[1]).join("、"), materialScope: `${target.material}；系列 Kinpaku wording 与 exact Material & art 分层记录。`, editionScope: "Default Title 市场变体与手工图案差异不是公开限量编号；库存和标签按当次页面核对。" }, { key: `phase532-${target.key}-context`, scopeKey: `phase532-${target.key}-context`, productionState: "historical", materialScope: "Independent Yamanaka-nuri and Maki-e context only; no product-specific artisan or layer certificate.", editionScope: "工艺通史不建立本支首发年份、固定耐久期限或二手价值。" }], claims, variants, spec: { brandEntityId: PHASE532_WANCHER_BRAND_ID, values, evidence: [evidence(`${target.key}-brand`, "brand_entity_id", collection.key, scope, "official collection brand boundary"), evidence(`${target.key}-series`, "series_name", product.key, scope, "exact title and handle"), evidence(`${target.key}-release`, "release_year", product.key, scope, "created_at and published_at listing context without formal launch year"), evidence(`${target.key}-origin`, "origin_country", productPage.key, scope, "official Rising Sun/Yamanaka wording"), evidence(`${target.key}-nib-spec`, "nib", product.key, scope, "exact nib menu"), evidence(`${target.key}-fill-spec`, "fill_system", product.key, scope, "filling mechanism field"), evidence(`${target.key}-material-spec`, "material", product.key, scope, "exact material and art field"), evidence(`${target.key}-dimensions`, "dimensions", product.key, scope, "exact page without published dimensions"), evidence(`${target.key}-weight`, "weight", product.key, scope, "exact page without published weight"), evidence(`${target.key}-price-spec`, "price_range", product.key, scope, "exact market price row"), evidence(`${target.key}-status`, "status", product.key, scope, "commercial labels and product record")] }, timeline: [{ key: `${target.key}-listing`, title: `${target.shortTitle} exact product record verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: `Exact title, product id, SKU, Material & art and series boundary verified on ${RETRIEVED}; created_at ${target.createdAt} and published_at ${target.publishedAt} are not formal release dates.`, sourceKey: product.key }], media: [{ key: `${target.key}-svg`, title: `${target.shortTitle} 材料、系列与 exact 字段边界图（非产品照片）`, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }] };
}

export const phase532WancherRisingSunMakiePacks: CuratedEntityPack[] = PHASE532_TARGETS.map(makePack);
