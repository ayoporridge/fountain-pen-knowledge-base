import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-06";
export const PHASE526_WANCHER_BRAND_ID = "eOfD77nOeENN";

export const PHASE526_TARGETS = [
  {
    key: "yakumo-byakudan-yae",
    entityId: "phase526-wancher-yakumo-byakudan-yae",
    slug: "wancher-yakumo-nuri-byakudan-yae",
    canonicalName: "Wancher Yakumo-nuri Byakudan - Yae Fountain Pen",
    title: "Yakumo-nuri Byakudan - Yae Fountain Pen",
    shortTitle: "Yakumo-nuri Byakudan Yae",
    productId: "8853807628503",
    createdAt: "2025-03-04",
    url: "https://www.wancherpen.com/products/yakumo-nuri-byakudan-yae",
    jsonUrl: "https://www.wancherpen.com/products/yakumo-nuri-byakudan-yae.json",
    image: "/images/library/site-original/phase526/wancher/yakumo-byakudan-yae.svg",
    articleFile: ".planning/content-research/wancher-yakumo-byakudan-yae-phase526.md",
    material: "Ebonite、Yakumo Urushi、Byakudan-nuri",
    art: "Yakumo Urushi、Byakudan-nuri",
    theme: "两层金箔与琥珀色透明漆形成的立体深度",
    fill: "Converter 或 European International Standard cartridge",
    sku: "WF-MOUR-BYAK-YAE",
    price: "US$900",
    layerText: "Yae 先贴切成方片的薄金箔，再覆琥珀色 Suki Urushi 并加入第二层金箔；官方用悬浮般深度描述视觉效果。",
  },
  {
    key: "yakumo-byakudan-black",
    entityId: "phase526-wancher-yakumo-byakudan-black",
    slug: "wancher-yakumo-nuri-byakudan-black",
    canonicalName: "Wancher Yakumo-nuri Byakudan - Black Fountain Pen",
    title: "Yakumo-nuri Byakudan - Black Fountain Pen",
    shortTitle: "Yakumo-nuri Byakudan Black",
    productId: "8853810249943",
    createdAt: "2025-03-04",
    url: "https://www.wancherpen.com/products/yakumo-nuri-byakudan-black",
    jsonUrl: "https://www.wancherpen.com/products/yakumo-nuri-byakudan-black.json",
    image: "/images/library/site-original/phase526/wancher/yakumo-byakudan-black.svg",
    articleFile: ".planning/content-research/wancher-yakumo-byakudan-black-phase526.md",
    material: "Ebonite、Yakumo Urushi、Byakudan-nuri",
    art: "Yakumo Urushi、Byakudan-nuri",
    theme: "透明漆、黑色漆与红色漆的色序层次",
    fill: "Converter 或 European International Standard cartridge",
    sku: "WF-MOUR-BYAK-BK",
    price: "US$800",
    layerText: "Black 的官方色序为 Suki Urushi 基层、Black Urushi、Red Urushi；商品页将其与 Red 的先后顺序差异写成细微但可观察的区别。",
  },
  {
    key: "yakumo-byakudan-red",
    entityId: "phase526-wancher-yakumo-byakudan-red",
    slug: "wancher-yakumo-nuri-byakudan-red",
    canonicalName: "Wancher Yakumo-nuri Byakudan - Red Fountain Pen",
    title: "Yakumo-nuri Byakudan - Red Fountain Pen",
    shortTitle: "Yakumo-nuri Byakudan Red",
    productId: "8853815886039",
    createdAt: "2025-03-04",
    url: "https://www.wancherpen.com/products/yakumo-nuri-byakudan-red",
    jsonUrl: "https://www.wancherpen.com/products/yakumo-nuri-byakudan-red.json",
    image: "/images/library/site-original/phase526/wancher/yakumo-byakudan-red.svg",
    articleFile: ".planning/content-research/wancher-yakumo-byakudan-red-phase526.md",
    material: "Ebonite、Yakumo Urushi、Byakudan-nuri",
    art: "Yakumo Urushi、Byakudan-nuri",
    theme: "透明漆、红色漆与黑色漆的深朱红层次",
    fill: "Converter 或 European International Standard cartridge",
    sku: "WF-MOUR-BYAK-RD",
    price: "US$800",
    layerText: "Red 的官方色序为 Suki Urushi 基层、Red Urushi、Black Urushi；先施红色漆形成比 Black 更深的朱红倾向。",
  },
] as const;

export type Phase526Target = (typeof PHASE526_TARGETS)[number];

const NIB_OPTIONS = [
  ["jowo", "#6 JoWo stainless steel", "官方尖面菜单。"],
  ["wancher-18k", "Wancher 18K gold", "官方尖面菜单。"],
] as const;

const FEED_OPTIONS = [
  ["plastic", "Plastic feed", "官方 feed 菜单。"],
  ["ebonite-black", "Black ebonite feed", "官方 feed 菜单；ebonite feed 只与 JoWo #6 配用。"],
  ["ebonite-red", "Red ebonite feed", "官方 feed 菜单；ebonite feed 只与 JoWo #6 配用。"],
] as const;

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType?: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
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
    registryKey: "fountain-pen-graph-editorial-phase526",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase526",
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

function makePack(target: Phase526Target): CuratedEntityPack {
  const scope = `Wancher ${target.shortTitle} exact product record, Yakumo-nuri Byakudan technique and configuration`;
  const product = web({
    key: `wancher-phase526-${target.key}-official-json`,
    title: `${target.title} | Wancher Official product JSON`,
    url: target.jsonUrl,
    registryKey: `wancher-official-${target.key}-phase526`,
    registryName: "Wancher Pen official product record",
    tier: "primary",
    independenceGroup: `wancher-official-${target.key}-phase526`,
    summary: `官方 Shopify product JSON：product id ${target.productId}、exact handle、SKU、价格、材料、尖材、feed、供墨和包装。`,
    locator: "product id, title, handle, created_at, variants, prices and specifications",
  });
  const productPage = web({
    key: `wancher-phase526-${target.key}-official-page`,
    title: `${target.title} | Wancher Official`,
    url: target.url,
    registryKey: `wancher-official-${target.key}-page-phase526`,
    registryName: "Wancher Pen official product page",
    tier: "primary",
    independenceGroup: `wancher-official-${target.key}-phase526`,
    summary: `官方商品页：${target.theme}、Byakudan 工艺、色序差异、规格、包装和护理提示。`,
    locator: "exact title, Byakudan process, colour sequence, specifications, packaging and care",
  });
  const collection = web({
    key: `wancher-phase526-${target.key}-collection`,
    title: "Yakumo-nuri Urushi Fountain Pen Collection | Wancher Official",
    url: "https://www.wancherpen.com/collections/yakumo-nuri",
    registryKey: `wancher-official-yakumo-nuri-collection-phase526-${target.key}`,
    registryName: "Wancher Pen official Yakumo-nuri collection",
    tier: "primary",
    independenceGroup: `wancher-official-yakumo-nuri-collection-phase526-${target.key}`,
    summary: "官方 Yakumo-nuri 集合页把 Byakudan Yae、Black、Red 与 Shibo、Chijimi 等商品分开导航。",
    locator: "collection product navigation and series boundary",
  });
  const nibGuide = web({
    key: `wancher-phase526-${target.key}-nib-guide`,
    title: "Wancher Fountain Pen Nib Guide",
    url: "https://www.wancherpen.com/pages/nib-guide",
    registryKey: `wancher-official-nib-guide-phase526-${target.key}`,
    registryName: "Wancher Pen official nib guide",
    tier: "primary",
    independenceGroup: `wancher-official-nib-guide-phase526-${target.key}`,
    summary: "官方指南提供 JoWo 与 Wancher gold 菜单语境；不替 exact page 添加未列配置。",
    locator: "nib family and compatibility guidance",
  });
  const care = web({
    key: `wancher-phase526-${target.key}-care`,
    title: "Wancher Product Care Guide",
    url: "https://www.wancherpen.com/pages/product-care",
    registryKey: `wancher-official-product-care-phase526-${target.key}`,
    registryName: "Wancher Pen official product care",
    tier: "primary",
    independenceGroup: `wancher-official-product-care-phase526-${target.key}`,
    summary: "官方护理页提供漆面和钢笔清洁边界；本包不补写页面没有公布的化学配方。",
    locator: "material care and cleaning guidance",
  });
  const artisan = web({
    key: `shimane-yakumo-context-phase526-${target.key}`,
    title: "八雲塗 | 島根県伝統工芸",
    url: "https://www.pref.shimane.lg.jp/industry/syoko/sangyo/dentou_kougei/kougei/kougei_02.html",
    registryKey: `shimane-pref-yakumo-phase526-${target.key}`,
    registryName: "Shimane Prefecture",
    sourceType: "official",
    tier: "professional_secondary",
    independenceGroup: `shimane-pref-yakumo-phase526-${target.key}`,
    summary: "岛根县官方资料说明八雲塗的明治时期起源、材料与基本工序；只作区域工艺背景。",
    locator: "Yakumo-nuri history, materials and process",
  });
  const museum = web({
    key: `shimane-museum-yakumo-context-phase526-${target.key}`,
    title: "Shimane Art Museum collection and crafts",
    url: "https://www.shimane-art-museum.jp/en/collection/",
    registryKey: `shimane-art-museum-yakumo-phase526-${target.key}`,
    registryName: "Shimane Art Museum",
    sourceType: "official",
    tier: "professional_secondary",
    independenceGroup: `shimane-art-museum-yakumo-phase526-${target.key}`,
    summary: "岛根县立美术馆提供地方工艺与八雲塗的博物馆语境；不替本支证明逐支签名或限量数量。",
    locator: "Shimane crafts and Yakumo-nuri collection context",
  });
  const contextCare = web({
    key: `kyoto-urushi-context-phase526-${target.key}`,
    title: "Preserving Lacquers through Conservation",
    url: "https://www.kyohaku.go.jp/old/eng/theme/floor1_6/past/1F-6_20201219.html",
    registryKey: `kyoto-national-museum-urushi-phase526-${target.key}`,
    registryName: "Kyoto National Museum",
    sourceType: "official",
    tier: "professional_secondary",
    independenceGroup: `kyoto-national-museum-urushi-phase526-${target.key}`,
    summary: "京都国立博物馆解释 Urushi 硬化、紫外线和湿度保存风险；只作一般护理背景。",
    locator: "urushi material and conservation explanation",
  });
  const svg = diagram(`wancher-phase526-${target.key}-svg`, `${target.shortTitle} 材料、配置与护理边界事实图`, target.image);
  const c = (key: string, predicate: string, text: string, source: CuratedSource = product, locator = "exact product record", factClass: "core" | "editorial" = "core") => claim(`${target.key}-${key}`, predicate, text, source.key, locator, scope, factClass);
  const marketText = `Default Title（${target.sku}）${target.price}`;
  const variants: CuratedVariant[] = [
    { key: `${target.key}-handcrafted-surface`, name: "Handcrafted surface · no fixed texture standard", notes: "官方手工差异提醒；不是限量编号或额外市场 SKU。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" },
    { key: `${target.key}-default`, name: "Default Title", notes: `官方 exact JSON 市场变体，SKU ${target.sku}；价格以当次记录为准。`, sourceKey: product.key, variantKind: "market_sku", productCode: target.sku, market: "global" },
    ...NIB_OPTIONS.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "nib" as const, market: "global" })),
    ...FEED_OPTIONS.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "material" as const, market: "global" })),
  ];
  const claims: CuratedClaim[] = [
    c("identity", "model_identity", `${target.shortTitle} 是 Yakumo-nuri 集合中的独立商品；官方 product id 为 ${target.productId}，exact handle 为 ${target.url.split("/products/")[1]}。`, product, "product id, exact title and handle"),
    c("theme", "design_theme", target.theme, productPage, "exact design and colour-sequence narrative"),
    c("craft", "decoration_technique", `Byakudan-nuri 以 Suki Urushi（透明漆）承载极细金箔或金叶，再覆盖更多透明漆；${target.layerText}`, productPage, "Byakudan process and exact design narrative"),
    c("artisan", "artisan", "官方将 Yakumo-nuri 合作工艺师写为 Nagaya Momoko；区域资料只作背景，不替本支建立逐支签名档案。", productPage, "artisan attribution and identity boundary"),
    c("craft-context", "craft_terminology_context", "岛根县官方资料说明八雲塗在明治时期由坂田平一创案，并使用色漆、青贝、金银粉和透明漆完成；这是区域工艺背景。", artisan, "Yakumo-nuri history, materials and process"),
    c("museum-context", "craft_museum_context", "岛根县立美术馆的收藏语境可用于理解地方漆艺传统，不替本支证明作品编号、金箔重量、漆层数量或正式限量。", museum, "Shimane crafts and Yakumo-nuri collection context"),
    c("conservation-context", "material_conservation_context", "京都国立博物馆的 Urushi 保存说明指出，应避开紫外线、剧烈温湿变化和不当清洁；这是材料护理背景，不是本支商品的额外规格。", contextCare, "professional-secondary urushi conservation context"),
    c("material", "material", `官方规格列 ${target.material}；Byakudan 是工艺与产品命名，不是木质笔杆；页面未公布漆层数量或可靠成品实测重量。`, product, "exact material and art fields"),
    c("nib", "nib", `官方 exact page 列 ${NIB_OPTIONS.map((item) => item[1]).join("、")}；这是尖面菜单，不把未展开组合写成额外市场 SKU。`, product, "nib option menu"),
    c("feed", "feed", `Feed 菜单包括 ${FEED_OPTIONS.map((item) => item[1]).join("、")}；页面说明 ebonite feed 只与 JoWo #6 配用。`, product, "feed options and compatibility"),
    c("filling", "filling_system", `供墨为 ${target.fill}；页面未授权本款作为 eyedropper 使用。`, product, "filling mechanism field"),
    c("cap", "cap", "帽子带 compact air-tight cap，用于减少笔尖提前干涸；不等于完全防漏或免维护。", product, "compact air-tight cap specification"),
    c("size", "dimensions", "官方 exact 页面没有公开可复核的长度、直径、握径；不要从图片估算尺寸。", product, "exact page without published dimensions"),
    c("weight", "weight", "官方 exact 页面没有公开可靠成品重量；JSON 变体中的 200 g 字段不作为实测规格。", product, "exact page without published product weight", "editorial"),
    c("packaging", "packaging", "包装包括 Traditional Japanese Wooden Box、Pen Kimono、Instructional Materials、Converter 与 Cartridge；交付物按 exact 页面记录。", product, "packaging and product configuration", "editorial"),
    c("care", "maintenance_guidance", "漆面应避免强冲击、尖锐物、长时间直晒、剧烈温湿变化、酒精、丙酮、漂白剂、研磨剂和整支浸水；只用柔软布轻拭，清洗局部笔尖、feed、握段和 converter。", contextCare, "urushi conservation and conservative pen boundary", "editorial"),
    c("price", "price_status", `检索窗口官方 JSON 市场变体为 ${marketText}；价格、税费、库存和标签会变化。`, product, "exact market price and commercial labels", "editorial"),
    c("selection", "selection_guidance", `选购或二手核对完整标题、产品编号 ${target.productId}、handle、SKU ${target.sku}、材料与工艺、所选 nib/feed、供墨标准、木盒、pen kimono 和实物照片；不要从其他 Byakudan 颜色补未公布字段。`, product, "exact identity and evidence boundary", "editorial"),
  ];
  return {
    key: `phase526-wancher-${target.key}-v1`,
    entityId: target.entityId,
    expectedType: "pen",
    expectedSlug: target.slug,
    canonicalName: target.canonicalName,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: target.articleFile,
    storyTitle: `${target.shortTitle}：漆艺、色序、配置与身份边界`,
    primarySourceKey: product.key,
    depthTier: "A",
    aliases: [
      { alias: target.title, language: "en", sourceKey: product.key },
      { alias: target.canonicalName, language: "en", sourceKey: product.key },
      { alias: `Wancher ${target.shortTitle} 日本漆艺钢笔`, language: "zh", sourceKey: product.key },
    ],
    sources: [product, productPage, collection, nibGuide, care, artisan, museum, contextCare, svg],
    scopes: [
      { key: scope, scopeKey: scope, productionState: "current", market: "global", nibScope: NIB_OPTIONS.map((item) => item[1]).join("、"), materialScope: `${target.material}；未公布漆层数量、批次、尺寸和实测重量。`, editionScope: "Default Title 市场变体与手工纹理差异不是公开限量编号；库存和标签按当次页面核对。" },
      { key: `phase526-${target.key}-context`, scopeKey: `phase526-${target.key}-context`, productionState: "historical", materialScope: "Independent craft context only; no product-specific authenticity certification.", editionScope: "工艺叙事不建立独立首发年份或二手价值。" },
    ],
    claims,
    variants,
    spec: {
      brandEntityId: PHASE526_WANCHER_BRAND_ID,
      values: {
        series_name: target.canonicalName,
        release_year: `独立首发年份未公布；官方 product JSON created_at 为 ${target.createdAt}，只作商品记录时间`,
        origin_country: "Wancher 岛根 Yakumo-nuri/Nagaya Momoko 工艺叙事；页面未逐组件公布产地分工",
        nib: NIB_OPTIONS.map((item) => item[1]).join("、"),
        fill_system: target.fill,
        material: target.material,
        dimensions: "官方 exact product page 未公布长度、直径、握径",
        weight: "官方未公布可靠成品重量；JSON 200 g 字段不作为实测规格",
        price_range: `${marketText}；价格、税费和库存会变`,
        status: "商品记录标签和可购状态需按页面实时确认",
      },
      evidence: [
        evidence(`${target.key}-brand`, "brand_entity_id", collection.key, scope, "official collection brand boundary"),
        evidence(`${target.key}-series`, "series_name", product.key, scope, "exact title and handle"),
        evidence(`${target.key}-release`, "release_year", product.key, scope, "created_at listing context without formal launch year"),
        evidence(`${target.key}-origin`, "origin_country", productPage.key, scope, "official artisan/origin wording"),
        evidence(`${target.key}-nib-spec`, "nib", product.key, scope, "exact nib menu"),
        evidence(`${target.key}-fill-spec`, "fill_system", product.key, scope, "filling mechanism field"),
        evidence(`${target.key}-material-spec`, "material", product.key, scope, "exact material and art field"),
        evidence(`${target.key}-dimensions`, "dimensions", product.key, scope, "exact page without published dimensions"),
        evidence(`${target.key}-weight`, "weight", product.key, scope, "exact page without published weight"),
        evidence(`${target.key}-price-spec`, "price_range", product.key, scope, "exact market price row"),
        evidence(`${target.key}-status`, "status", product.key, scope, "commercial labels and product record"),
      ],
    },
    timeline: [{ key: `${target.key}-listing`, title: `${target.shortTitle} exact product record verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: `Exact title, product id, SKU and Byakudan configuration verified on ${RETRIEVED}; this is not a formal release date.`, sourceKey: product.key }],
    conflicts: [
      { key: `${target.key}-status-window`, fieldKey: "status", scopeKey: scope, conflictKind: "field", status: "resolved", resolutionNote: "商品标签和库存会随页面更新；保留检索窗口语境，不推断长期可购买或永久停产。", members: [{ citationKey: `${target.key}-status`, assertedValue: "exact JSON commercial labels" }] },
      { key: `${target.key}-not-release-year`, fieldKey: "release_year", scopeKey: scope, conflictKind: "field", status: "resolved", resolutionNote: "created_at 与工艺故事不足以确定正式首发日；release_year 只保留商品记录时间。", members: [{ citationKey: `${target.key}-release`, assertedValue: `created_at ${target.createdAt} is not a formal launch date` }] },
    ],
    media: [{ key: `${target.key}-svg`, title: `${target.shortTitle} 材料、配置与护理边界图（非产品照片）`, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
  };
}

export const phase526WancherYakumoByakudanPacks: CuratedEntityPack[] = PHASE526_TARGETS.map(makePack);
