import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-06";
export const PHASE530_WANCHER_BRAND_ID = "eOfD77nOeENN";

const NIB_OPTIONS = [
  ["jowo", "#6 JoWo stainless steel", "官方尖面菜单。"],
  ["wancher-18k", "Wancher 18K gold", "官方尖面菜单。"],
] as const;
const FEED_OPTIONS = [
  ["plastic", "Plastic feed", "官方 feed 菜单。"],
  ["ebonite-black", "Black ebonite feed", "官方 feed 菜单。"],
  ["ebonite-red", "Red ebonite feed", "官方 feed 菜单。"],
] as const;

export const PHASE530_TARGETS = [
  {
    key: "kyoto-cherry-blossom",
    entityId: "phase530-wancher-kyoto-kotoiro-cherry-blossom",
    slug: "wancher-kyoto-urushi-kyoto-cherry-blossom",
    canonicalName: "Wancher Kyoto Urushi Kotoiro - Kyoto Cherry Blossom Fountain Pen",
    title: "Kyoto Urushi Kotoiro - Kyoto Cherry Blossom Fountain Pen",
    shortTitle: "Kyoto Kotoiro Cherry Blossom",
    productId: "8136417837271",
    createdAt: "2023-08-30",
    publishedAt: "2023-08-31",
    url: "https://www.wancherpen.com/products/kyoto-urushi-kyoto-cherry-blossom",
    jsonUrl: "https://www.wancherpen.com/products/kyoto-urushi-kyoto-cherry-blossom.json",
    image: "/images/library/site-original/phase530/wancher/kyoto-kotoiro-cherry-blossom.svg",
    articleFile: ".planning/content-research/wancher-kyoto-kotoiro-cherry-blossom-phase530.md",
    sku: "WF-UR-DREAM-KYUR-PK",
    price: "US$900",
    theme: "Daigo-ji、Kiyomizu 与 Omuro 樱花景观的粉色彩漆与金箔语境",
  },
  {
    key: "kyoto-fushimi-inari",
    entityId: "phase530-wancher-kyoto-kotoiro-fushimi-inari",
    slug: "wancher-kyoto-urushi-fushimi-inari-taisha",
    canonicalName: "Wancher Kyoto Urushi Kotoiro - Fushimi Inari Taisha Fountain Pen",
    title: "Kyoto Urushi Kotoiro - Fushimi Inari Taisha Fountain Pen",
    shortTitle: "Kyoto Kotoiro Fushimi Inari",
    productId: "8136424063191",
    createdAt: "2023-08-30",
    publishedAt: "2023-08-31",
    url: "https://www.wancherpen.com/products/kyoto-urushi-fushimi-inari-taisha",
    jsonUrl: "https://www.wancherpen.com/products/kyoto-urushi-fushimi-inari-taisha.json",
    image: "/images/library/site-original/phase530/wancher/kyoto-kotoiro-fushimi-inari.svg",
    articleFile: ".planning/content-research/wancher-kyoto-kotoiro-fushimi-inari-phase530.md",
    sku: "WF-UR-DREAM-KYUR-OR",
    price: "US$850",
    theme: "千本鸟居、朱红主殿与金箔彩漆的 Fushimi Inari 语境",
  },
  {
    key: "kyoto-byodoin",
    entityId: "phase530-wancher-kyoto-kotoiro-byodoin",
    slug: "wancher-kyoto-urushi-byodoin-temple",
    canonicalName: "Wancher Kyoto Urushi Kotoiro - Byodoin Temple Fountain Pen",
    title: "Kyoto Urushi Kotoiro - Byodoin Temple Fountain Pen",
    shortTitle: "Kyoto Kotoiro Byodoin Temple",
    productId: "8136424489175",
    createdAt: "2023-08-30",
    publishedAt: "2023-08-31",
    url: "https://www.wancherpen.com/products/kyoto-urushi-byodoin-temple",
    jsonUrl: "https://www.wancherpen.com/products/kyoto-urushi-byodoin-temple.json",
    image: "/images/library/site-original/phase530/wancher/kyoto-kotoiro-byodoin.svg",
    articleFile: ".planning/content-research/wancher-kyoto-kotoiro-byodoin-phase530.md",
    sku: "WF-UR-DREAM-KYUR-RD",
    price: "US$850",
    theme: "平等院、凤凰堂与平安 Nishichi 红色的彩漆与金箔语境",
  },
  {
    key: "kyoto-arashiyama",
    entityId: "phase530-wancher-kyoto-kotoiro-arashiyama",
    slug: "wancher-kyoto-urushi-kotoiro-arashiyama-bamboo",
    canonicalName: "Wancher Kyoto Urushi Kotoiro - Arashiyama Bamboo Fountain Pen",
    title: "Kyoto Urushi Kotoiro - Arashiyama Bamboo Fountain Pen",
    shortTitle: "Kyoto Kotoiro Arashiyama Bamboo",
    productId: "8158011490519",
    createdAt: "2023-10-18",
    publishedAt: "2023-10-19",
    url: "https://www.wancherpen.com/products/kyoto-urushi-kotoiro-arashiyama-bamboo",
    jsonUrl: "https://www.wancherpen.com/products/kyoto-urushi-kotoiro-arashiyama-bamboo.json",
    image: "/images/library/site-original/phase530/wancher/kyoto-kotoiro-arashiyama.svg",
    articleFile: ".planning/content-research/wancher-kyoto-kotoiro-arashiyama-phase530.md",
    sku: "WF-UR-DREAM-KYUR-GR",
    price: "US$850",
    theme: "岚山竹林与 400 米竹径滤光绿色的彩漆与金箔语境",
  },
  {
    key: "kyoto-kinkakuji",
    entityId: "phase530-wancher-kyoto-kotoiro-kinkakuji",
    slug: "wancher-kyoto-urushi-kotoiro-kinkakuji-temple",
    canonicalName: "Wancher Kyoto Urushi Kotoiro - Kinkakuji Temple Fountain Pen",
    title: "Kyoto Urushi Kotoiro - Kinkakuji Temple Fountain Pen",
    shortTitle: "Kyoto Kotoiro Kinkakuji Temple",
    productId: "8158020534487",
    createdAt: "2023-10-18",
    publishedAt: "2023-10-19",
    url: "https://www.wancherpen.com/products/kyoto-urushi-kotoiro-kinkakuji-temple",
    jsonUrl: "https://www.wancherpen.com/products/kyoto-urushi-kotoiro-kinkakuji-temple.json",
    image: "/images/library/site-original/phase530/wancher/kyoto-kotoiro-kinkakuji.svg",
    articleFile: ".planning/content-research/wancher-kyoto-kotoiro-kinkakuji-phase530.md",
    sku: "WF-UR-DREAM-KYUR-YL",
    price: "US$850",
    theme: "Rokuon-ji 金阁寺与金箔建筑氛围的古都色彩语境",
  },
] as const;

export type Phase530Target = (typeof PHASE530_TARGETS)[number];

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; tier: CuratedSource["tier"]; sourceType?: CuratedSource["sourceType"]; independenceGroup: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType ?? "official", tier: input.tier, independenceGroup: input.independenceGroup, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase530", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase530", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作色卡或库存证明。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, scopeKey: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }] };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makePack(target: Phase530Target): CuratedEntityPack {
  const scope = `Wancher ${target.shortTitle} exact product record, Kyoto Urushi Kotoiro technique and landmark design context`;
  const product = web({ key: `wancher-phase530-${target.key}-official-json`, title: `${target.title} | Wancher Official product JSON`, url: target.jsonUrl, registryKey: `wancher-official-${target.key}-phase530-json`, registryName: "Wancher Pen official product record", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase530`, summary: `官方 Shopify product JSON：product id ${target.productId}、exact handle、SKU、价格、材料、尖材、feed、供墨和包装。`, locator: "product id, title, handle, created_at, published_at, variants, prices and specifications" });
  const productPage = web({ key: `wancher-phase530-${target.key}-official-page`, title: `${target.title} | Wancher Official`, url: target.url, registryKey: `wancher-official-${target.key}-phase530-page`, registryName: "Wancher Pen official product page", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase530`, summary: `官方商品页：${target.theme}、Kyoto Urushi、金箔 Maki-e、Shimamoto Megumi、规格、包装和护理提示。`, locator: "exact title, landmark design context, artisan, specifications, packaging and care" });
  const collection = web({ key: `wancher-phase530-${target.key}-collection`, title: "Dream Pen Collection | Wancher Official", url: "https://www.wancherpen.com/collections/dream-pen", registryKey: `wancher-official-dream-pen-collection-phase530-${target.key}`, registryName: "Wancher Pen official Dream Pen collection", tier: "primary", independenceGroup: `wancher-official-dream-pen-collection-phase530-${target.key}`, summary: "官方 Dream Pen 集合页把 Kotoiro 五个景观商品分开导航；不替 exact 页合并型号。", locator: "collection product navigation and sibling boundary" });
  const care = web({ key: `wancher-phase530-${target.key}-care`, title: "Wancher Product Care Guide", url: "https://www.wancherpen.com/pages/product-care", registryKey: `wancher-official-product-care-phase530-${target.key}`, registryName: "Wancher Pen official product care", tier: "primary", independenceGroup: `wancher-official-product-care-phase530-${target.key}`, summary: "官方护理页提供 Urushi 与钢笔清洁边界；不补写未公布化学配方。", locator: "material care and cleaning guidance" });
  const kyoto = web({ key: `kyoto-museums-lacquer-phase530-${target.key}`, title: "A bit of knowledge about lacquer | Kyoto Museums Association", url: "https://kyoto-museums.city.kyoto.lg.jp/en/feature-column/lacquer/", registryKey: `kyoto-museums-association-lacquer-phase530-${target.key}`, registryName: "Kyoto Museums Association", sourceType: "official", tier: "professional_secondary", independenceGroup: `kyoto-museums-association-lacquer-phase530-${target.key}`, summary: "京都博物馆协会说明金银粉装饰、平安时期京都漆艺与专业术语背景；不替本支证明逐支工艺。", locator: "Kyoto lacquer history and gold/silver powder context" });
  const museum = web({ key: `kyoto-national-museum-urushi-phase530-${target.key}`, title: "Preserving Lacquers through Conservation", url: "https://www.kyohaku.go.jp/old/eng/theme/floor1_6/past/1F-6_20201219.html", registryKey: `kyoto-national-museum-urushi-phase530-${target.key}`, registryName: "Kyoto National Museum", sourceType: "official", tier: "professional_secondary", independenceGroup: `kyoto-national-museum-urushi-phase530-${target.key}`, summary: "京都国立博物馆解释 Urushi 保存中的紫外线、湿度与清洁风险；只作一般护理背景。", locator: "urushi material and conservation explanation" });
  const svg = diagram(`wancher-phase530-${target.key}-svg`, `${target.shortTitle} 材料、配置与景观边界事实图`, target.image);
  const c = (key: string, predicate: string, text: string, source: CuratedSource = product, locator = "exact product record", factClass: "core" | "editorial" = "core") => claim(`${target.key}-${key}`, predicate, text, source.key, locator, scope, factClass);
  const variants: CuratedVariant[] = [
    { key: `${target.key}-hand-applied`, name: "Hand-applied Urushi and gold leaf · no fixed texture standard", notes: "官方手工差异提醒；不是额外市场 SKU。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" },
    { key: `${target.key}-default`, name: "Default Title", notes: `官方 exact JSON 市场变体，SKU ${target.sku}；价格以当次记录为准。`, sourceKey: product.key, variantKind: "market_sku", productCode: target.sku, market: "global" },
    ...NIB_OPTIONS.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "nib" as const, market: "global" })),
    ...FEED_OPTIONS.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "material" as const, market: "global" })),
  ];
  const claims: CuratedClaim[] = [
    c("identity", "model_identity", `${target.shortTitle} 是 Kyoto Urushi Kotoiro 集合中的独立商品；官方 product id 为 ${target.productId}，exact handle 为 ${target.url.split("/products/")[1]}。`, product, "product id, exact title and handle"),
    c("landmark", "design_theme", `${target.theme}；景观名称是品牌设计语境，不把地标资料扩写成钢笔的产地、尺寸或固定图案。`, productPage, "exact landmark naming and design boundary"),
    c("craft", "decoration_technique", "官方将 Kotoiro 写成 Kyoto Urushi 的彩色漆面与 authentic gold leaf Maki-e 交织，并归于 Kyoto Maki-e artisan Shimamoto Megumi 的合作叙事。", productPage, "Kyoto Urushi, gold leaf Maki-e and artisan narrative"),
    c("handmade", "handmade_variation", "官方说明 Urushi 与金箔施作由手工完成，不会有两支完全相同；这不等于公开编号、金箔重量、漆层数量或限量总数。", productPage, "hand-applied variation statement"),
    c("kyoto-history", "craft_history_context", "Kyoto Museums Association 说明金银粉装饰可追溯至奈良时代、京都自平安时期延续约 1200 年漆艺传统；这是区域工艺背景，不是本支发行年份。", kyoto, "Kyoto lacquer history and gold/silver powder context"),
    c("conservation", "material_conservation_context", "京都国立博物馆的 Urushi 保存说明支持避开紫外线、剧烈温湿变化和不当清洁；这是一般材料护理背景。", museum, "urushi conservation context"),
    c("material", "material", "官方 Material & art 列 Ebonite、Urushi、Gold leaf；页面未公布金箔重量、漆层数量、色值或可靠成品实测重量。", product, "exact material and art fields"),
    c("nib", "nib", `官方尖面菜单为 ${NIB_OPTIONS.map((item) => item[1]).join("、")}；这是配置菜单，不把菜单项扩写成额外型号。`, product, "nib option menu"),
    c("feed", "feed", `Feed 菜单为 ${FEED_OPTIONS.map((item) => item[1]).join("、")}；兼容条件按 exact 页面记录。`, product, "feed option menu"),
    c("filling", "filling_system", "供墨为 Converter 或 Cartridge（European International Standard）；页面未授权本款作为 eyedropper 使用。", product, "filling mechanism field"),
    c("cap", "cap", "帽子带 compact air-tight cap，用于减少笔尖提前干涸；不等于完全防漏或免维护。", product, "compact air-tight cap specification"),
    c("size", "dimensions", "官方 exact 页面只显示 Size & Shape 标题，没有公开可复核的长度、直径、握径；不要从图片估算尺寸。", product, "exact page without published dimensions"),
    c("weight", "weight", "官方 exact 页面没有公开可靠成品重量；JSON 中的 200 g 字段不作为实测规格。", product, "exact page without published product weight", "editorial"),
    c("packaging", "packaging", "包装包括 Traditional Japanese Wooden Box、Pen Kimono、Instructional Materials、Certificate、Converter 与 Cartridge；交付物按 exact 页面记录。", product, "packaging and product configuration", "editorial"),
    c("care", "maintenance_guidance", "漆面与金箔应避免长时间直晒、剧烈温湿变化、酒精、丙酮、漂白剂、研磨剂、硬物碰撞和整支浸水；只用柔软布轻拭，局部清洗笔尖、feed、握段与 converter。", museum, "urushi conservation and conservative pen boundary", "editorial"),
    c("price", "price_status", `检索窗口官方 JSON 市场变体为 Default Title / ${target.sku} ${target.price}；价格、税费、库存和标签会变化。`, product, "exact market price and commercial labels", "editorial"),
    c("selection", "selection_guidance", `选购或二手核对完整标题、产品编号 ${target.productId}、handle、SKU ${target.sku}、Ebonite、Urushi、Gold leaf、所选 nib/feed、欧规 cartridge、Certificate、木盒与 pen kimono；不要从其他 Kotoiro 景观款借用字段。`, product, "exact identity and evidence boundary", "editorial"),
  ];
  const values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>> = { series_name: target.canonicalName, release_year: `独立首发年份未公布；官方 product JSON created_at 为 ${target.createdAt}、页面发布时间为 ${target.publishedAt}，只作记录语境`, origin_country: "Wancher Kyoto Urushi／Shimamoto Megumi 工艺叙事；页面未逐组件公布产地分工", nib: NIB_OPTIONS.map((item) => item[1]).join("、"), fill_system: "Converter 或 European International Standard cartridge", material: "Ebonite、Urushi、Gold leaf", dimensions: "官方 exact product page 仅显示 Size & Shape 标题，未公布可复核尺寸", weight: "官方未公布可靠成品重量；JSON 200 g 字段不作为实测规格", price_range: `Default Title / ${target.sku} ${target.price}；价格、税费和库存会变`, status: "商品记录标签和可购状态需按页面实时确认" };
  return { key: `phase530-wancher-${target.key}-v1`, entityId: target.entityId, expectedType: "pen", expectedSlug: target.slug, canonicalName: target.canonicalName, publicationIntent: "publish", publicationBlockers: [], markdownFile: target.articleFile, storyTitle: `${target.shortTitle}：Kyoto Urushi、金箔与景观身份边界`, primarySourceKey: product.key, depthTier: "A", aliases: [{ alias: target.title, language: "en", sourceKey: product.key }, { alias: target.canonicalName, language: "en", sourceKey: product.key }, { alias: `Wancher ${target.shortTitle} 京都漆艺钢笔`, language: "zh", sourceKey: product.key }], sources: [product, productPage, collection, care, kyoto, museum, svg], scopes: [{ key: scope, scopeKey: scope, productionState: "historical", market: "global", nibScope: NIB_OPTIONS.map((item) => item[1]).join("、"), materialScope: "Ebonite、Urushi、Gold leaf；未公布金箔重量、漆层数量、色值、尺寸和实测重量。", editionScope: "Default Title 市场变体与手工外观差异不是公开限量编号；库存和标签按当次页面核对。" }, { key: `phase530-${target.key}-context`, scopeKey: `phase530-${target.key}-context`, productionState: "historical", materialScope: "Independent Kyoto lacquer history context only; no product-specific authenticity certification.", editionScope: "地标历史和 Kyoto Urushi 通史不建立本支独立首发年份或二手价值。" }], claims, variants, spec: { brandEntityId: PHASE530_WANCHER_BRAND_ID, values, evidence: [evidence(`${target.key}-brand`, "brand_entity_id", collection.key, scope, "official collection brand boundary"), evidence(`${target.key}-series`, "series_name", product.key, scope, "exact title and handle"), evidence(`${target.key}-release`, "release_year", product.key, scope, "created_at and published_at listing context without formal launch year"), evidence(`${target.key}-origin`, "origin_country", productPage.key, scope, "official Kyoto Urushi wording"), evidence(`${target.key}-nib-spec`, "nib", product.key, scope, "exact nib menu"), evidence(`${target.key}-fill-spec`, "fill_system", product.key, scope, "filling mechanism field"), evidence(`${target.key}-material-spec`, "material", product.key, scope, "exact material and art field"), evidence(`${target.key}-dimensions`, "dimensions", product.key, scope, "exact page without published dimensions"), evidence(`${target.key}-weight`, "weight", product.key, scope, "exact page without published weight"), evidence(`${target.key}-price-spec`, "price_range", product.key, scope, "exact market price row"), evidence(`${target.key}-status`, "status", product.key, scope, "commercial labels and product record")] }, timeline: [{ key: `${target.key}-listing`, title: `${target.shortTitle} exact product record verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: `Exact title, product id, SKU and landmark design context verified on ${RETRIEVED}; created_at ${target.createdAt} and published_at ${target.publishedAt} are not formal release dates.`, sourceKey: product.key }], media: [{ key: `${target.key}-svg`, title: `${target.shortTitle} 材料、配置与景观边界图（非产品照片）`, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }] };
}

export const phase530WancherKyotoKotoiroPacks: CuratedEntityPack[] = PHASE530_TARGETS.map(makePack);
