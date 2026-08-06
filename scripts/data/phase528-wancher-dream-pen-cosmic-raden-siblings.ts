import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-06";
export const PHASE528_WANCHER_BRAND_ID = "eOfD77nOeENN";

export const PHASE528_TARGETS = [
  {
    key: "dream-raden-nebula",
    entityId: "phase528-wancher-dream-raden-nebula",
    slug: "wancher-dream-pen-raden-nebula",
    canonicalName: "Wancher Dream Pen Raden - Nebula Fountain Pen",
    title: "Dream Pen Raden - Nebula Fountain Pen",
    shortTitle: "Dream Pen Raden Nebula",
    productId: "7726084522199",
    createdAt: "2022-08-01",
    publishedAt: "2022-08-02",
    url: "https://www.wancherpen.com/products/dream-pen-raden-nebula",
    jsonUrl: "https://www.wancherpen.com/products/dream-pen-raden-nebula.json",
    image: "/images/library/site-original/phase528/wancher/dream-pen-raden-nebula.svg",
    articleFile: ".planning/content-research/wancher-dream-pen-raden-nebula-phase528.md",
    sku: "WF-WARD-EBDP-NE",
    price: "US$2000",
    theme: "Nebula 命名与 Cosmic 2022 的 Raden／Maki-e 宇宙叙事",
  },
  {
    key: "dream-raden-meteor-shower",
    entityId: "phase528-wancher-dream-raden-meteor-shower",
    slug: "wancher-dream-pen-raden-meteor-shower",
    canonicalName: "Wancher Dream Pen Raden - Meteor Shower Fountain Pen",
    title: "Dream Pen Raden - Meteor Shower Fountain Pen",
    shortTitle: "Dream Pen Raden Meteor Shower",
    productId: "7726085800151",
    createdAt: "2022-08-01",
    publishedAt: "2022-08-02",
    url: "https://www.wancherpen.com/products/dream-pen-raden-meteor-shower",
    jsonUrl: "https://www.wancherpen.com/products/dream-pen-raden-meteor-shower.json",
    image: "/images/library/site-original/phase528/wancher/dream-pen-raden-meteor-shower.svg",
    articleFile: ".planning/content-research/wancher-dream-pen-raden-meteor-shower-phase528.md",
    sku: "WF-WARD-EBDP-MS",
    price: "US$1500",
    theme: "Meteor Shower 命名与 Cosmic 2022 的 Raden／Maki-e 宇宙叙事",
  },
  {
    key: "dream-raden-comets",
    entityId: "phase528-wancher-dream-raden-comets",
    slug: "wancher-dream-pen-raden-comets",
    canonicalName: "Wancher Dream Pen Raden - Comets Fountain Pen",
    title: "Dream Pen Raden - Comets Fountain Pen",
    shortTitle: "Dream Pen Raden Comets",
    productId: "7726086586583",
    createdAt: "2022-08-01",
    publishedAt: "2022-08-02",
    url: "https://www.wancherpen.com/products/dream-pen-raden-comets",
    jsonUrl: "https://www.wancherpen.com/products/dream-pen-raden-comets.json",
    image: "/images/library/site-original/phase528/wancher/dream-pen-raden-comets.svg",
    articleFile: ".planning/content-research/wancher-dream-pen-raden-comets-phase528.md",
    sku: "WF-WARD-EBDP-CO",
    price: "US$1500",
    theme: "Comets 命名与 Cosmic 2022 的 Raden／Maki-e 宇宙叙事",
  },
  {
    key: "dream-raden-asteroid-belt",
    entityId: "phase528-wancher-dream-raden-asteroid-belt",
    slug: "wancher-dream-pen-raden-asteroid-belt",
    canonicalName: "Wancher Dream Pen Raden - Asteroid Belt Fountain Pen",
    title: "Dream Pen Raden - Asteroid Belt Fountain Pen",
    shortTitle: "Dream Pen Raden Asteroid Belt",
    productId: "7726087078103",
    createdAt: "2022-08-01",
    publishedAt: "2022-08-02",
    url: "https://www.wancherpen.com/products/dream-pen-raden-asteroid-belt",
    jsonUrl: "https://www.wancherpen.com/products/dream-pen-raden-asteroid-belt.json",
    image: "/images/library/site-original/phase528/wancher/dream-pen-raden-asteroid-belt.svg",
    articleFile: ".planning/content-research/wancher-dream-pen-raden-asteroid-belt-phase528.md",
    sku: "WF-WARD-EBDP-AB",
    price: "US$1300",
    theme: "Asteroid Belt 命名与 Cosmic 2022 的 Raden／Maki-e 宇宙叙事",
  },
  {
    key: "dream-raden-supernova",
    entityId: "phase528-wancher-dream-raden-supernova",
    slug: "wancher-dream-pen-raden-supernova",
    canonicalName: "Wancher Dream Pen Raden - Supernova Fountain Pen",
    title: "Dream Pen Raden - Supernova Fountain Pen",
    shortTitle: "Dream Pen Raden Supernova",
    productId: "7726002012375",
    createdAt: "2022-08-01",
    publishedAt: "2023-03-16",
    url: "https://www.wancherpen.com/products/dream-pen-raden-supernova",
    jsonUrl: "https://www.wancherpen.com/products/dream-pen-raden-supernova.json",
    image: "/images/library/site-original/phase528/wancher/dream-pen-raden-supernova.svg",
    articleFile: ".planning/content-research/wancher-dream-pen-raden-supernova-phase528.md",
    sku: "WF-WARD-EBDP-SN",
    price: "US$2500",
    theme: "Supernova 命名与 Cosmic 2022 的 Raden／Maki-e 宇宙叙事",
  },
] as const;

export type Phase528Target = (typeof PHASE528_TARGETS)[number];

const NIB_OPTIONS = [
  ["wancher-18k", "Wancher 18K gold", "官方尖面菜单。"],
  ["wancher-18k-rhodium", "Wancher 18K gold - Rhodium-plated", "官方尖面菜单。"],
] as const;
const FEED_OPTIONS = [["plastic", "Standard plastic feed", "官方 feed 菜单。"]] as const;

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
    registryKey: "fountain-pen-graph-editorial-phase528",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase528",
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

function makePack(target: Phase528Target): CuratedEntityPack {
  const scope = `Wancher ${target.shortTitle} exact product record, Cosmic 2022 Raden／Maki-e technique and configuration`;
  const product = web({ key: `wancher-phase528-${target.key}-official-json`, title: `${target.title} | Wancher Official product JSON`, url: target.jsonUrl, registryKey: `wancher-official-${target.key}-phase528-json`, registryName: "Wancher Pen official product record", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase528`, summary: `官方 Shopify product JSON：product id ${target.productId}、exact handle、SKU、价格、材料、尖材、feed、供墨和包装。`, locator: "product id, title, handle, created_at, published_at, variants, prices and specifications" });
  const productPage = web({ key: `wancher-phase528-${target.key}-official-page`, title: `${target.title} | Wancher Official`, url: target.url, registryKey: `wancher-official-${target.key}-phase528-page`, registryName: "Wancher Pen official product page", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase528`, summary: `官方商品页：${target.theme}、Raden／Maki-e 手工差异、规格、包装和护理提示。`, locator: "exact title, Cosmic design context, Raden and Maki-e process, specifications, packaging and care" });
  const collection = web({ key: `wancher-phase528-${target.key}-collection`, title: "Dream Pen Collection | Wancher Official", url: "https://www.wancherpen.com/collections/dream-pen", registryKey: `wancher-official-dream-pen-collection-phase528-${target.key}`, registryName: "Wancher Pen official Dream Pen collection", tier: "primary", independenceGroup: `wancher-official-dream-pen-collection-phase528-${target.key}`, summary: "官方 Dream Pen 集合页把 Cosmic 2022 的 Nebula、Meteor Shower、Comets、Asteroid Belt 与 Supernova 分开导航。", locator: "collection product navigation and sibling boundary" });
  const craftsmanship = web({ key: `wancher-phase528-${target.key}-craftsmanship`, title: "True Craftsmanship | Wancher Official", url: "https://www.wancherpen.com/pages/true-craftsmanship-updated", registryKey: `wancher-official-craftsmanship-phase528-${target.key}`, registryName: "Wancher Pen official craftsmanship page", tier: "primary", independenceGroup: `wancher-official-craftsmanship-phase528-${target.key}`, summary: "官方工艺页提供 Wajima Urushi、Raden 片材和 Maki-e 工匠叙事；不替商品增加未公开编号。", locator: "Urushi, Raden and Maki-e craftsmanship context" });
  const threeD = web({ key: `wancher-phase528-${target.key}-3d`, title: "Dream Pen Limited Edition 2022 3D | Wancher Official", url: "https://www.wancherpen.com/pages/dream-pen-limited-edition-2022-3d", registryKey: `wancher-official-cosmic-3d-phase528-${target.key}`, registryName: "Wancher Pen official 3D showcase", tier: "primary", independenceGroup: `wancher-official-cosmic-3d-phase528-${target.key}`, summary: "官方 3D 展示用于观察 Cosmic 2022 的系列视觉方向，不替 exact JSON 证明色卡、尺寸或每支纹样。", locator: "Cosmic 2022 3D visual context" });
  const care = web({ key: `wancher-phase528-${target.key}-care`, title: "Wancher Product Care Guide", url: "https://www.wancherpen.com/pages/product-care", registryKey: `wancher-official-product-care-phase528-${target.key}`, registryName: "Wancher Pen official product care", tier: "primary", independenceGroup: `wancher-official-product-care-phase528-${target.key}`, summary: "官方护理页提供 Urushi 与钢笔清洁边界；本包不补写页面没有公布的化学配方。", locator: "material care and cleaning guidance" });
  const museum = web({ key: `kyoto-urushi-context-phase528-${target.key}`, title: "Preserving Lacquers through Conservation", url: "https://www.kyohaku.go.jp/old/eng/theme/floor1_6/past/1F-6_20201219.html", registryKey: `kyoto-national-museum-urushi-phase528-${target.key}`, registryName: "Kyoto National Museum", sourceType: "official", tier: "professional_secondary", independenceGroup: `kyoto-national-museum-urushi-phase528-${target.key}`, summary: "京都国立博物馆解释 Urushi 保存中的紫外线、湿度与清洁风险；只作一般护理背景。", locator: "urushi material and conservation explanation" });
  const svg = diagram(`wancher-phase528-${target.key}-svg`, `${target.shortTitle} 材料、配置与护理边界事实图`, target.image);
  const c = (key: string, predicate: string, text: string, source: CuratedSource = product, locator = "exact product record", factClass: "core" | "editorial" = "core") => claim(`${target.key}-${key}`, predicate, text, source.key, locator, scope, factClass);
  const marketText = `Default Title（${target.sku}）${target.price}`;
  const variants: CuratedVariant[] = [
    { key: `${target.key}-handcrafted-surface`, name: "Handcrafted surface · no fixed texture standard", notes: "官方手工 Raden／Maki-e 差异提醒；不是限量编号或额外市场 SKU。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" },
    { key: `${target.key}-default`, name: "Default Title", notes: `官方 exact JSON 市场变体，SKU ${target.sku}；价格以当次记录为准。`, sourceKey: product.key, variantKind: "market_sku", productCode: target.sku, market: "global" },
    ...NIB_OPTIONS.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "nib" as const, market: "global" })),
    ...FEED_OPTIONS.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "material" as const, market: "global" })),
  ];
  const claims: CuratedClaim[] = [
    c("identity", "model_identity", `${target.shortTitle} 是 Cosmic 2022 集合中的独立商品；官方 product id 为 ${target.productId}，exact handle 为 ${target.url.split("/products/")[1]}。`, product, "product id, exact title and handle"),
    c("theme", "design_theme", `${target.theme}；商品名是设计语境，不把天文名称扩写成固定图案、数量或颜色标准。`, productPage, "exact design naming and Cosmic narrative boundary"),
    c("craft", "decoration_technique", "官方工艺叙事为：Wajima 工艺师在 Ebonite 上施加 Urushi，选取鲍鱼壳压平为 Raden 薄片并切割嵌入，随后覆漆、研磨，再由 Master Yamanoshita 用金粉手绘 Maki-e 细节。", craftsmanship, "Raden and Maki-e process narrative"),
    c("handmade", "handmade_variation", "官方说明 Raden／Maki-e 为手工应用，每支设计会不同，不会有第二支完全相似；这不等于公开编号、总量或逐支证书。", productPage, "hand-applied variation statement"),
    c("cosmic", "series_context", "Cosmic Limited Edition 2022 的 Zen 与内在宇宙叙事属于品牌设计背景，不是书写性能、天文学数据或收藏价值证明。", threeD, "Cosmic 2022 visual context", "editorial"),
    c("material", "material", "官方 Material & art 列 Ebonite、Urushi、Raden、Maki-e；页面未公布漆层数量、壳片来源或可靠成品实测重量。", product, "exact material and art fields"),
    c("nib", "nib", `官方 exact page 列 ${NIB_OPTIONS.map((item) => item[1]).join("、")}；这是尖面菜单，不把菜单标签扩写成额外市场 SKU。`, product, "nib option menu"),
    c("feed", "feed", "Feed 为 Standard plastic；页面未把 Raden／Maki-e 工艺写成供墨部件。", product, "feed field"),
    c("filling", "filling_system", "供墨为 Converter 或 Cartridge（European International Standard）；页面没有授权本款作为 eyedropper 使用。", product, "filling mechanism field"),
    c("cap", "cap", "帽子带 compact air-tight cap，用于减少笔尖提前干涸；不等于完全防漏或免维护。", product, "compact air-tight cap specification"),
    c("size", "dimensions", "官方 exact 页面只显示 Size & Shape 标题，没有公开可复核的长度、直径、握径；不要从图片估算尺寸。", product, "exact page without published dimensions"),
    c("weight", "weight", "官方 exact 页面没有公开可靠成品重量；JSON 中的 200 g 字段不作为实测规格。", product, "exact page without published product weight", "editorial"),
    c("packaging", "packaging", "包装包括 Traditional Japanese Wooden Box、Cartridge、Converter 与 Instructional Materials；交付物按 exact 页面记录。", product, "packaging and product configuration", "editorial"),
    c("care", "maintenance_guidance", "漆面应避免长时间直晒、剧烈温湿变化、酒精、丙酮、漂白剂、研磨剂、硬物碰撞和整支浸水；只用柔软布轻拭，局部清洗笔尖、feed、握段与 converter。", museum, "urushi conservation and conservative pen boundary"),
    c("price", "price_status", `检索窗口官方 JSON 市场变体为 ${marketText}；价格、税费、库存和标签会变化。`, product, "exact market price and commercial labels", "editorial"),
    c("selection", "selection_guidance", `选购或二手核对完整标题、产品编号 ${target.productId}、handle、SKU ${target.sku}、四项材料、所选 18K 尖面、欧规 cartridge、木盒、converter、cartridge 与实物照片；不要从其他 Cosmic 款借用字段。`, product, "exact identity and evidence boundary", "editorial"),
  ];
  const values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>> = {
    series_name: target.canonicalName,
    release_year: `独立首发年份未公布；官方 product JSON created_at 为 ${target.createdAt}，页面发布时间为 ${target.publishedAt}，只作记录语境`,
    origin_country: "Wancher/Wajima Urushi、Raden 与 Maki-e 合作叙事；页面未逐组件公布产地分工",
    nib: NIB_OPTIONS.map((item) => item[1]).join("、"),
    fill_system: "Converter 或 European International Standard cartridge",
    material: "Ebonite、Urushi、Raden、Maki-e",
    dimensions: "官方 exact product page 仅显示 Size & Shape 标题，未公布可复核尺寸",
    weight: "官方未公布可靠成品重量；JSON 200 g 字段不作为实测规格",
    price_range: `${marketText}；价格、税费和库存会变`,
    status: "商品记录标签和可购状态需按页面实时确认",
  };
  return {
    key: `phase528-wancher-${target.key}-v1`, entityId: target.entityId, expectedType: "pen", expectedSlug: target.slug, canonicalName: target.canonicalName, publicationIntent: "publish", publicationBlockers: [], markdownFile: target.articleFile, storyTitle: `${target.shortTitle}：Raden、Maki-e、配置与身份边界`, primarySourceKey: product.key, depthTier: "A",
    aliases: [{ alias: target.title, language: "en", sourceKey: product.key }, { alias: target.canonicalName, language: "en", sourceKey: product.key }, { alias: `Wancher ${target.shortTitle} 手工漆艺钢笔`, language: "zh", sourceKey: product.key }],
    sources: [product, productPage, collection, craftsmanship, threeD, care, museum, svg],
    scopes: [{ key: scope, scopeKey: scope, productionState: "historical", market: "global", nibScope: NIB_OPTIONS.map((item) => item[1]).join("、"), materialScope: "Ebonite、Urushi、Raden、Maki-e；未公布漆层数量、批次、尺寸和实测重量。", editionScope: "Default Title 市场变体与手工纹理差异不是公开限量编号；库存和标签按当次页面核对。" }, { key: `phase528-${target.key}-context`, scopeKey: `phase528-${target.key}-context`, productionState: "historical", materialScope: "Independent craft context only; no product-specific authenticity certification.", editionScope: "Cosmic 设计叙事不建立独立首发年份、限量总数或二手价值。" }],
    claims,
    variants,
    spec: {
      brandEntityId: PHASE528_WANCHER_BRAND_ID,
      values,
      evidence: [
        evidence(`${target.key}-brand`, "brand_entity_id", collection.key, scope, "official collection brand boundary"),
        evidence(`${target.key}-series`, "series_name", product.key, scope, "exact title and handle"),
        evidence(`${target.key}-release`, "release_year", product.key, scope, "created_at and published_at listing context without formal launch year"),
        evidence(`${target.key}-origin`, "origin_country", craftsmanship.key, scope, "official artisan/origin wording"),
        evidence(`${target.key}-nib-spec`, "nib", product.key, scope, "exact nib menu"),
        evidence(`${target.key}-fill-spec`, "fill_system", product.key, scope, "filling mechanism field"),
        evidence(`${target.key}-material-spec`, "material", product.key, scope, "exact material and art field"),
        evidence(`${target.key}-dimensions`, "dimensions", product.key, scope, "exact page without published dimensions"),
        evidence(`${target.key}-weight`, "weight", product.key, scope, "exact page without published weight"),
        evidence(`${target.key}-price-spec`, "price_range", product.key, scope, "exact market price row"),
        evidence(`${target.key}-status`, "status", product.key, scope, "commercial labels and product record"),
      ],
    },
    timeline: [{ key: `${target.key}-listing`, title: `${target.shortTitle} exact product record verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: `Exact title, product id, SKU and Cosmic configuration verified on ${RETRIEVED}; created_at ${target.createdAt} and published_at ${target.publishedAt} are not formal release dates.`, sourceKey: product.key }],
    conflicts: [{ key: `${target.key}-not-release-year`, fieldKey: "release_year", scopeKey: scope, conflictKind: "field", status: "resolved", resolutionNote: "created_at 与 published_at 只保留官方记录语境，不推断正式发行日。", members: [{ citationKey: `${target.key}-release`, assertedValue: `created_at ${target.createdAt}; published_at ${target.publishedAt}` }] }],
    media: [{ key: `${target.key}-svg`, title: `${target.shortTitle} 材料、配置与护理边界图（非产品照片）`, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
  };
}

export const phase528WancherDreamPenCosmicRadenPacks: CuratedEntityPack[] = PHASE528_TARGETS.map(makePack);
