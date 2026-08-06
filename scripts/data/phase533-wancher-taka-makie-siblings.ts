import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, CuratedVariant, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-06";
export const PHASE533_WANCHER_BRAND_ID = "eOfD77nOeENN";
const NIB = [["wancher-18k", "#6 Wancher 18K gold, rhodium-plated", "官方 Taka Maki-e exact 页面尖面配置。"]] as const;
const FEED = [["plastic", "Plastic feed", "官方 Taka Maki-e exact 页面仅列 Plastic。"]] as const;

export const PHASE533_TARGETS = [
  {
    key: "flowers-praying-mantis",
    entityId: "phase533-wancher-taka-flowers-praying-mantis",
    slug: "wancher-taka-maki-e-flowers-praying-mantis",
    canonicalName: "Wancher Dream Pen Taka Maki-e Flowers and Praying Mantis",
    title: "Taka Maki-e - Flowers and Praying Mantis",
    shortTitle: "Taka Maki-e Flowers and Praying Mantis",
    productId: "8321029570775",
    createdAt: "2024-03-19",
    publishedAt: "2024-03-20",
    url: "https://www.wancherpen.com/products/taka-maki-e-flowers-and-praying-mantis",
    jsonUrl: "https://www.wancherpen.com/products/taka-maki-e-flowers-and-praying-mantis.json",
    image: "/images/library/site-original/phase533/wancher/taka-maki-e-flowers-praying-mantis.svg",
    articleFile: ".planning/content-research/wancher-taka-maki-e-flowers-praying-mantis-phase533.md",
    material: "Ebonite",
    art: "Taka Maki-e",
    sku: "WF-MK24-DP-FLMN",
    price: "US$1600",
    design: "Hanakusakamakiri（花草蟷螂）花草与螳螂题材；品牌称其从江户时期流行至今。",
    marketVariants: [["default", "Default Title", "WF-MK24-DP-FLMN", "US$1600", "官方 JSON 唯一市场变体。"]] as const,
  },
  {
    key: "senmen-narihira",
    entityId: "phase533-wancher-taka-senmen-narihira",
    slug: "wancher-taka-maki-e-senmen-narihira",
    canonicalName: "Wancher Dream Pen Taka Maki-e Senmen Narihira",
    title: "Taka Maki-e - Senmen Narihira",
    shortTitle: "Taka Maki-e Senmen Narihira",
    productId: "8322185527511",
    createdAt: "2024-03-20",
    publishedAt: "2024-03-20",
    url: "https://www.wancherpen.com/products/taka-maki-e-senmen-narihira",
    jsonUrl: "https://www.wancherpen.com/products/taka-maki-e-senmen-narihira.json",
    image: "/images/library/site-original/phase533/wancher/taka-maki-e-senmen-narihira.svg",
    articleFile: ".planning/content-research/wancher-taka-maki-e-senmen-narihira-phase533.md",
    material: "Ebonite",
    art: "Taka Maki-e",
    sku: "WF-MK24-DP-SNH",
    price: "US$1500",
    design: "Senmen Narihira 扇面人物题材；品牌叙述关联东京 Nezu Museum 与在原业平文化语境。",
    marketVariants: [["default", "Default Title", "WF-MK24-DP-SNH", "US$1500", "官方 JSON 唯一市场变体。"]] as const,
  },
  {
    key: "mejiro-birds-vine",
    entityId: "phase533-wancher-taka-mejiro-birds-vine",
    slug: "wancher-taka-maki-e-mejiro-birds-and-vine",
    canonicalName: "Wancher Dream Pen Taka Maki-e Mejiro Birds and Vine",
    title: "Taka Maki-e - Mejiro Birds and Vine",
    shortTitle: "Taka Maki-e Mejiro Birds and Vine",
    productId: "8322213839063",
    createdAt: "2024-03-20",
    publishedAt: "2024-03-20",
    url: "https://www.wancherpen.com/products/taka-maki-e-mejiro-birds-and-vine",
    jsonUrl: "https://www.wancherpen.com/products/taka-maki-e-mejiro-birds-and-vine.json",
    image: "/images/library/site-original/phase533/wancher/taka-maki-e-mejiro-birds-vine.svg",
    articleFile: ".planning/content-research/wancher-taka-maki-e-mejiro-birds-vine-phase533.md",
    material: "Ebonite",
    art: "Taka Maki-e",
    sku: "WF-MK24-DP-MJB2 / WF-MK24-DP-MJB1",
    price: "US$1300 / US$1350",
    design: "Tsuruumemodoki Mejiro：两只 Mejiro 鸟与红果藤；官方市场变体区分 Without／With Hira Maki-e。",
    marketVariants: [["without-hira", "Without Hira Maki-e", "WF-MK24-DP-MJB2", "US$1300", "官方 JSON 市场变体。"], ["with-hira", "With Hira Maki-e", "WF-MK24-DP-MJB1", "US$1350", "官方 JSON 市场变体。"]] as const,
  },
] as const;
export type Phase533Target = (typeof PHASE533_TARGETS)[number];

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; tier: CuratedSource["tier"]; sourceType?: CuratedSource["sourceType"]; independenceGroup: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType ?? "official", tier: input.tier, independenceGroup: input.independenceGroup, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}
function diagram(key: string, title: string, url: string): CuratedSource { return { key, registryKey: "fountain-pen-graph-editorial-phase533", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase533", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作色卡或库存证明。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` }; }
function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, scopeKey: string, factClass: "core" | "editorial" = "core"): CuratedClaim { return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }] }; }
function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence { return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true }; }

function makePack(target: Phase533Target): CuratedEntityPack {
  const scope = `Wancher ${target.shortTitle} exact product record, Taka Maki-e material and design boundary`;
  const product = web({ key: `wancher-phase533-${target.key}-official-json`, title: `${target.title} | Wancher Official product JSON`, url: target.jsonUrl, registryKey: `wancher-official-${target.key}-phase533-json`, registryName: "Wancher Pen official product record", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase533`, summary: `官方 Shopify product JSON：product id ${target.productId}、exact handle、SKU、价格、记录时间、市场变体、材料、尖材、feed、供墨和包装。`, locator: "product id, title, handle, created_at, published_at, variants, prices and specifications" });
  const productPage = web({ key: `wancher-phase533-${target.key}-official-page`, title: `${target.title} | Wancher Official`, url: target.url, registryKey: `wancher-official-${target.key}-phase533-page`, registryName: "Wancher Pen official product page", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase533`, summary: `官方商品页：${target.design}Taka Maki-e、Natural Raw Urushi、18K 尖、包装和手工差异提示。`, locator: "exact title, design inspiration, technique, raw Urushi, specifications, variants and packaging" });
  const collection = web({ key: `wancher-phase533-${target.key}-collection`, title: "Dream Pen Collection | Wancher Official", url: "https://www.wancherpen.com/collections/dream-pen", registryKey: `wancher-official-dream-pen-collection-phase533-${target.key}`, registryName: "Wancher Pen official Dream Pen collection", tier: "primary", independenceGroup: `wancher-official-dream-pen-collection-phase533-${target.key}`, summary: "官方 Dream Pen 集合页把三个 Taka Maki-e 商品分开导航；Mejiro 的 Hira 选项留在同一个商品下。", locator: "Taka Maki-e product navigation and sibling/entity boundary" });
  const care = web({ key: `wancher-phase533-${target.key}-care`, title: "Wancher Product Care Guide", url: "https://www.wancherpen.com/pages/product-care", registryKey: `wancher-official-product-care-phase533-${target.key}`, registryName: "Wancher Pen official product care", tier: "primary", independenceGroup: `wancher-official-product-care-phase533-${target.key}`, summary: "官方护理页提供钢笔、Urushi 与清洁边界；不补写未公布化学配方。", locator: "material care and cleaning guidance" });
  const jta = web({ key: `jta-taka-makie-phase533-${target.key}`, title: "Maki-e", url: "https://www.mlit.go.jp/tagengo-db/en/R4-00025.html", registryKey: `japan-tourism-agency-taka-makie-phase533-${target.key}`, registryName: "Japan Tourism Agency", tier: "professional_secondary", independenceGroup: `japan-tourism-agency-taka-makie-phase533-${target.key}`, summary: "日本观光厅解释 Maki-e、Hira 与 Taka（raised）术语；只作工艺背景。", locator: "maki-e and taka/raised technique explanation" });
  const emuseum = web({ key: `emuseum-takamakie-phase533-${target.key}`, title: "Small box depicting chrysanthemum flowers in maki-e lacquer", url: "https://emuseum.nich.go.jp/detail?content_base_id=100026&content_part_id=0&content_pict_id=0&langId=en", registryKey: `emuseum-takamakie-phase533-${target.key}`, registryName: "National Institutes for Cultural Heritage e-Museum", tier: "professional_secondary", independenceGroup: `emuseum-takamakie-phase533-${target.key}`, summary: "国家文化遗产 e-Museum 以馆藏说明 raised gold takamaki-e 的堆高、施粉和保护漆逻辑。", locator: "raised gold takamaki-e process explanation" });
  const nezu = web({ key: `nezu-lacquer-phase533-${target.key}`, title: "Lacquer collection", url: "https://www.nezu-muse.or.jp/en/collection/list.php?category=6", registryKey: `nezu-lacquer-collection-phase533-${target.key}`, registryName: "Nezu Museum", tier: "professional_secondary", independenceGroup: `nezu-lacquer-collection-phase533-${target.key}`, summary: "东京 Nezu Museum 的漆艺馆藏与 Narihira 题材背景；不替现代钢笔证明馆藏复制或授权。", locator: "lacquer collection and Narihira-related art context" });
  const svg = diagram(`wancher-phase533-${target.key}-svg`, `${target.shortTitle} 材料、工艺与市场变体边界事实图`, target.image);
  const c = (key: string, predicate: string, text: string, source: CuratedSource = product, locator = "exact product record", factClass: "core" | "editorial" = "core") => claim(`${target.key}-${key}`, predicate, text, source.key, locator, scope, factClass);
  const variants: CuratedVariant[] = [
    { key: `${target.key}-handmade`, name: "Handmade Taka Maki-e surface", notes: "官方手工与天然材料提示；不是额外市场 SKU。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" },
    ...target.marketVariants.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[4], sourceKey: product.key, variantKind: "market_sku" as const, productCode: item[2], market: "global" })),
    ...NIB.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "nib" as const, market: "global" })),
    ...FEED.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "material" as const, market: "global" })),
  ];
  const claims: CuratedClaim[] = [
    c("identity", "model_identity", `${target.shortTitle} 是 Wancher Dream Pen Taka Maki-e collection 中的独立商品；官方 product id 为 ${target.productId}，exact handle 为 ${target.url.split("/products/")[1]}。`),
    c("design", "design_theme", `${target.design}这是品牌 Design Inspiration，不把现代钢笔写成馆藏原件、古物复制或博物馆授权。`, productPage, "design inspiration and exact title"),
    c("material", "material", `官方 Material 为 ${target.material}，Art 为 ${target.art}；页面没有公布漆层数、金粉重量、凸起高度、色号或可靠实测重量。`),
    c("urushi", "natural_urushi_context", "官方页面称 Taka Maki-e 使用 Natural Raw Urushi，并解释漆树采集和材料稀少性；这是品牌材料叙述，不是本支实际用量或产地证书。", productPage, "Natural Raw Urushi narrative"),
    c("taka", "technique_context", "日本观光厅解释 Taka（raised）Maki-e 通过抬高图案形成浮雕效果；这个术语背景不补写本支的具体堆高配方、漆层数量或工匠履历。", jta, "maki-e and taka/raised technique explanation"),
    c("museum-technique", "craft_process_context", "e-Museum 馆藏说明 raised gold takamaki-e 的堆高、施粉和保护漆逻辑；只作传统工艺背景，不认证 Wancher 逐件制作。", emuseum, "raised gold takamaki-e process explanation"),
    c("museum-boundary", "museum_context_boundary", "Nezu Museum 的漆艺馆藏与 Narihira 题材背景可解释设计语境，但不证明现代钢笔是馆藏原件、复制品或授权商品。", nezu, "lacquer collection and Narihira-related art context"),
    c("nib", "nib", `官方 exact 页面列 ${NIB.map((item) => item[1]).join("、")}；不是同时安装多个尖。`),
    c("feed", "feed", `官方 exact 页面仅列 ${FEED.map((item) => item[1]).join("、")}；不能从其它 Dream Pen sibling 借用 ebonite feed。`),
    c("filling", "filling_system", "供墨为 Converter 或 Cartridge（European International Standard）；页面没有授权整支笔作为 eyedropper 使用。"),
    c("shape", "shape", "官方 exact 页面只显示 Size & Shape 标题，没有公开可复核长度、直径或握径；不要从浮雕照片估算尺寸。"),
    c("weight", "weight", "官方 exact 页面没有公开可靠成品重量；JSON 中的 200 g 平台字段不作为实测规格。", product, "exact page without published product weight", "editorial"),
    c("packaging", "packaging", "包装包括 Traditional Japanese Wooden Box、Pen Kimono、Instructional Materials、Converter 与 Cartridge；具体交付按 exact 订单核对。", product, "packaging field", "editorial"),
    c("care", "maintenance_guidance", "Natural Urushi、凸起 Maki-e、金粉与 Ebonite 应避开酒精、丙酮、漂白剂、强溶剂、金属抛光剂、粗研磨、直晒、剧烈温湿变化和整支浸水；外部用柔软布轻拭，局部清洗笔尖、feed、握位与 converter。", care, "official conservative pen care boundary", "editorial"),
    c("price", "price_status", `检索窗口官方 JSON 市场变体为 ${target.marketVariants.map((item) => `${item[1]} / ${item[2]} ${item[3]}`).join("；")}；库存、价格和标签会变化。`, product, "exact market price and variants", "editorial"),
    c("selection", "selection_guidance", `选购或二手核对完整标题、product id ${target.productId}、handle、${target.sku}、Ebonite、Taka Maki-e、实际 18K nib、Plastic feed、欧规 cartridge、木盒与 Pen Kimono；${target.key === "mejiro-birds-vine" ? "Mejiro 的两个 Hira 市场 SKU 必须按订单保留。" : "不要从其它 Taka Maki-e 兄弟借用图案或价格。"}`, product, "exact identity and evidence boundary", "editorial"),
  ];
  const values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>> = { series_name: target.canonicalName, release_year: `独立首发年份未公布；official created_at ${target.createdAt}、published_at ${target.publishedAt}，只作记录语境`, origin_country: "Japanese Taka Maki-e／Natural Urushi craft context; exact component-by-component origin not asserted", nib: NIB.map((item) => item[1]).join("、"), fill_system: "Converter 或 European International Standard cartridge", material: `${target.material}；${target.art}${target.key === "mejiro-birds-vine" ? "；Without Hira / With Hira 为同一 product id 下的市场变体" : ""}`, dimensions: "官方 exact product page 未公布可复核长度、直径和握径", weight: "官方未公布可靠成品重量；JSON 200 g 字段不作为实测规格", price_range: `${target.marketVariants.map((item) => `${item[2]} ${item[3]}`).join("；")}；价格、税费和库存会变`, status: "官方商品记录已核对；变体、价格、库存与交付需实时确认" };
  return { key: `phase533-wancher-${target.key}-v1`, entityId: target.entityId, expectedType: "pen", expectedSlug: target.slug, canonicalName: target.canonicalName, publicationIntent: "publish", publicationBlockers: [], markdownFile: target.articleFile, storyTitle: `${target.shortTitle}：Taka Maki-e、题材与市场变体边界`, primarySourceKey: product.key, depthTier: "A", aliases: [{ alias: target.title, language: "en", sourceKey: product.key }, { alias: target.canonicalName, language: "en", sourceKey: product.key }, { alias: `Wancher ${target.shortTitle} 钢笔`, language: "zh", sourceKey: product.key }], sources: [product, productPage, collection, care, jta, emuseum, nezu, svg], scopes: [{ key: scope, scopeKey: scope, productionState: "historical", market: "global", nibScope: NIB.map((item) => item[1]).join("、"), materialScope: `${target.material}、${target.art} 与 Natural Urushi wording 按 exact 页面记录；未公布层数、重量、尺寸和凸起高度。`, editionScope: "市场变体与手工表面差异不是公开限量编号；Mejiro 的两个 SKU 属于同一 product id。" }, { key: `phase533-${target.key}-context`, scopeKey: `phase533-${target.key}-context`, productionState: "historical", materialScope: "Independent Maki-e museum and craft context only; no product-specific artisan or museum authorization.", editionScope: "工艺史不建立本支首发年份、固定耐久期限或二手价值。" }], claims, variants, spec: { brandEntityId: PHASE533_WANCHER_BRAND_ID, values, evidence: [evidence(`${target.key}-brand`, "brand_entity_id", collection.key, scope, "official collection brand boundary"), evidence(`${target.key}-series`, "series_name", product.key, scope, "exact title and handle"), evidence(`${target.key}-release`, "release_year", product.key, scope, "created_at and published_at listing context without formal launch year"), evidence(`${target.key}-origin`, "origin_country", productPage.key, scope, "official Taka Maki-e wording"), evidence(`${target.key}-nib-spec`, "nib", product.key, scope, "exact nib menu"), evidence(`${target.key}-fill-spec`, "fill_system", product.key, scope, "filling mechanism field"), evidence(`${target.key}-material-spec`, "material", product.key, scope, "exact material and art field"), evidence(`${target.key}-dimensions`, "dimensions", product.key, scope, "exact page without published dimensions"), evidence(`${target.key}-weight`, "weight", product.key, scope, "exact page without published weight"), evidence(`${target.key}-price-spec`, "price_range", product.key, scope, "exact market price row"), evidence(`${target.key}-status`, "status", product.key, scope, "commercial labels and product record")] }, timeline: [{ key: `${target.key}-listing`, title: `${target.shortTitle} exact product record verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: `Exact title, product id, SKU, Taka Maki-e wording and market boundary verified on ${RETRIEVED}; created_at ${target.createdAt} and published_at ${target.publishedAt} are not formal release dates.`, sourceKey: product.key }], media: [{ key: `${target.key}-svg`, title: `${target.shortTitle} 材料、工艺与变体边界图（非产品照片）`, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或变体纹理。", sourceUrl: svg.url, usageStatus: "primary" }] };
}

export const phase533WancherTakaMakiePacks: CuratedEntityPack[] = PHASE533_TARGETS.map(makePack);
