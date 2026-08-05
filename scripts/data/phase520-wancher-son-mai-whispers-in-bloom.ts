import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-05";
export const PHASE520_WANCHER_BRAND_ID = "eOfD77nOeENN";

export const PHASE520_TARGETS = [
  {
    key: "white-lotus",
    entityId: "phase520-wancher-son-mai-white-lotus",
    slug: "wancher-son-mai-white-lotus-whispers-in-bloom",
    canonicalName: "Wancher Sơn Mài - White Lotus (Whisper in Bloom)",
    title: "Sơn Mài - White Lotus (Whisper in Bloom)",
    shortTitle: "Sơn Mài White Lotus",
    productId: "9328182067415",
    createdAt: "2026-07-15",
    url: "https://www.wancherpen.com/products/son-mai-white-lotus",
    jsonUrl: "https://www.wancherpen.com/products/son-mai-white-lotus.json",
    image: "/images/library/site-original/phase520/wancher/son-mai-white-lotus.svg",
    articleFile: ".planning/content-research/wancher-son-mai-white-lotus-phase520.md",
    art: "SƠN TA (Son Ta) 蛋壳装饰漆艺",
    theme: "越南白莲、坚韧与纯洁",
    marketVariants: [
      { key: "a", name: "Type A", code: "WF-DRVIE-BK-LO26-A", variantKind: "variant" as const, price: "US$6,198" },
      { key: "b", name: "Type B", code: "WF-DRVIE-BK-LO26-B", variantKind: "variant" as const, price: "US$6,198" },
    ],
  },
  {
    key: "crimson-lotus",
    entityId: "phase520-wancher-son-mai-crimson-lotus",
    slug: "wancher-son-mai-crimson-lotus-whispers-in-bloom",
    canonicalName: "Wancher Sơn Mài - The Crimson Lotus (Whisper in Bloom)",
    title: "Sơn Mài - The Crimson Lotus (Whisper in Bloom)",
    shortTitle: "Sơn Mài The Crimson Lotus",
    productId: "9328188522711",
    createdAt: "2026-07-15",
    url: "https://www.wancherpen.com/products/son-mai-the-lotus-red",
    jsonUrl: "https://www.wancherpen.com/products/son-mai-the-lotus-red.json",
    image: "/images/library/site-original/phase520/wancher/son-mai-crimson-lotus.svg",
    articleFile: ".planning/content-research/wancher-son-mai-crimson-lotus-phase520.md",
    art: "Eggshell Artwork - SƠN TA (Son Ta)",
    theme: "越南深红莲花、活力与韧性",
    marketVariants: [
      { key: "a", name: "Type A", code: "WF-DRVIE-OR-LO26-A", variantKind: "variant" as const, price: "US$6,198" },
      { key: "b", name: "Type B", code: "WF-DRVIE-OR-LO26-B", variantKind: "variant" as const, price: "US$6,198" },
    ],
  },
  {
    key: "hoa-ban",
    entityId: "phase520-wancher-son-mai-hoa-ban",
    slug: "wancher-son-mai-hoa-ban-whispers-in-bloom",
    canonicalName: "Wancher Sơn Mài - The Hoa Ban (Whisper in Bloom)",
    title: "Sơn Mài - The Hoa Ban (Whisper in Bloom)",
    shortTitle: "Sơn Mài The Hoa Ban",
    productId: "9328189178071",
    createdAt: "2026-07-15",
    url: "https://www.wancherpen.com/products/son-mai-the-hoa-ban-whispers-in-bloom",
    jsonUrl: "https://www.wancherpen.com/products/son-mai-the-hoa-ban-whispers-in-bloom.json",
    image: "/images/library/site-original/phase520/wancher/son-mai-hoa-ban.svg",
    articleFile: ".planning/content-research/wancher-son-mai-hoa-ban-phase520.md",
    art: "Eggshell Artwork - SƠN TA (Son Ta)",
    theme: "越南西北 Hoa Ban、坚定的爱与希望",
    marketVariants: [
      { key: "a", name: "Type A", code: "WF-DRVIE-BK-HOA26-A", variantKind: "variant" as const, price: "US$6,198" },
      { key: "b", name: "Type B", code: "WF-DRVIE-BK-HOA26-B", variantKind: "variant" as const, price: "US$6,198" },
      { key: "c", name: "Type C", code: "WF-DRVIE-BK-HOA26-C", variantKind: "variant" as const, price: "US$6,198" },
    ],
  },
  {
    key: "crimson-hoa-ban",
    entityId: "phase520-wancher-son-mai-crimson-hoa-ban",
    slug: "wancher-son-mai-crimson-hoa-ban-whispers-in-bloom",
    canonicalName: "Wancher Sơn Mài - The Crimson Hoa Ban (Whisper in Bloom)",
    title: "Sơn Mài - The Crimson Hoa Ban (Whisper in Bloom)",
    shortTitle: "Sơn Mài The Crimson Hoa Ban",
    productId: "9328189964503",
    createdAt: "2026-07-15",
    url: "https://www.wancherpen.com/products/son-mai-the-crimson-hoa-ban",
    jsonUrl: "https://www.wancherpen.com/products/son-mai-the-crimson-hoa-ban.json",
    image: "/images/library/site-original/phase520/wancher/son-mai-crimson-hoa-ban.svg",
    articleFile: ".planning/content-research/wancher-son-mai-crimson-hoa-ban-phase520.md",
    art: "Son Mai Artwork / Eggshell Artwork - SƠN TA",
    theme: "越南西北 Hoa Ban、深红底座与春日活力",
    marketVariants: [
      { key: "a", name: "Type A", code: "WF-DRVIE-OR-HOA26-A", variantKind: "variant" as const, price: "US$6,198" },
      { key: "b", name: "Type B", code: "WF-DRVIE-OR-HOA26-B", variantKind: "variant" as const, price: "US$6,198" },
      { key: "c", name: "Type C", code: "WF-DRVIE-OR-HOA26-C", variantKind: "variant" as const, price: "US$6,198" },
    ],
  },
] as const;

export type Phase520Target = (typeof PHASE520_TARGETS)[number];
const NIBS = [
  ["jowo", "#6 JoWo stainless steel", "官方商品页列出的钢尖菜单。"],
  ["keiryu", "Keiryu", "官方商品页列出的特殊笔幅菜单。"],
  ["keiryu-kodachi", "Keiryu Kodachi", "官方商品页列出的特殊笔幅菜单。"],
  ["shogun-18k", "Shogun 18K gold", "官方商品页列出的金尖菜单。"],
] as const;
const FEEDS = [
  ["plastic", "Plastic feed", "官方 feed 菜单。"],
  ["ebonite-black", "Black ebonite feed", "官方注明 ebonite feed 只适用于 #6 JoWo。"],
  ["ebonite-red", "Red ebonite feed", "官方注明 ebonite feed 只适用于 #6 JoWo。"],
] as const;

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  tier: CuratedSource["tier"];
  independenceGroup: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: "official",
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
    registryKey: "fountain-pen-graph-editorial-phase520",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase520",
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
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }] };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string, qualifies = true): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies };
}

function makePack(target: Phase520Target): CuratedEntityPack {
  const scope = `Wancher ${target.shortTitle} exact product record, Vietnamese Son Mai artwork and configuration`;
  const product = web({ key: `wancher-phase520-${target.key}-official-json`, title: `${target.title} | Wancher Official product JSON`, url: target.jsonUrl, registryKey: `wancher-official-${target.key}-phase520`, registryName: "Wancher Pen official product record", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase520`, summary: `官方 Shopify product JSON：product id ${target.productId}、exact handle、Type、SKU、价格、材料、尖材、feed、尺寸、重量和包装。`, locator: "product id, title, handle, created_at, variants, prices and specifications" });
  const productPage = web({ key: `wancher-phase520-${target.key}-official-page`, title: `${target.title} | Wancher Official`, url: target.url, registryKey: `wancher-official-${target.key}-page-phase520`, registryName: "Wancher Pen official product page", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase520`, summary: `官方商品页：${target.theme}、Pham Chinh Trung、Sơn Mài/蛋壳工艺、手工差异和护理提示。`, locator: "exact title, theme, artist, craft process, specifications, packaging and care" });
  const collection = web({ key: `wancher-phase520-${target.key}-collection`, title: "Dream Pen Fountain Pen Collection | Wancher Official", url: "https://www.wancherpen.com/collections/dream-pen", registryKey: `wancher-official-dream-pen-collection-phase520-${target.key}`, registryName: "Wancher Pen official Dream Pen collection", tier: "primary", independenceGroup: `wancher-official-dream-pen-collection-phase520-${target.key}`, summary: "官方集合页用于确认 Dream Pen 与 Whispers in Bloom 的产品导航；各花卉和底色仍按 exact product 分开。", locator: "Dream Pen collection product navigation" });
  const nibGuide = web({ key: `wancher-phase520-${target.key}-nib-guide`, title: "Wancher Fountain Pen Nib Guide", url: "https://www.wancherpen.com/pages/nib-guide", registryKey: `wancher-official-nib-guide-phase520-${target.key}`, registryName: "Wancher Pen official nib guide", tier: "primary", independenceGroup: `wancher-official-nib-guide-phase520-${target.key}`, summary: "官方指南提供 JoWo、Keiryu/Kodachi 和 Shogun 菜单语境；不替 exact page 添加未列配置。", locator: "nib family and compatibility guidance" });
  const care = web({ key: `wancher-phase520-${target.key}-care`, title: "Wancher Product Care Guide", url: "https://www.wancherpen.com/pages/product-care", registryKey: `wancher-official-product-care-phase520-${target.key}`, registryName: "Wancher Pen official product care", tier: "primary", independenceGroup: `wancher-official-product-care-phase520-${target.key}`, summary: "官方护理页提供漆面和钢笔清洁边界；本包不补写页面没有公布的化学配方。", locator: "material care and cleaning guidance" });
  const craft = web({ key: `vietnam-ministry-son-mai-phase520-${target.key}`, title: "Độc đáo sơn mài", url: "https://moit.gov.vn/tin-tuc/thi-truong-nuoc-ngoai/doc-dao-son-mai.html", registryKey: `vietnam-ministry-son-mai-phase520-${target.key}`, registryName: "Vietnam Ministry of Industry and Trade", tier: "professional_secondary", independenceGroup: `vietnam-ministry-son-mai-phase520-${target.key}`, summary: "越南工贸部介绍 Sơn Mài 的多层漆、研磨以及蛋壳、金银等材料背景；只作工艺语境。", locator: "Vietnamese lacquer material, layering, sanding and eggshell description" });
  const svg = diagram(`wancher-phase520-${target.key}-svg`, `${target.shortTitle} 材料、配置与护理边界事实图`, target.image);
  const c = (key: string, predicate: string, text: string, source: CuratedSource = product, locator = "exact product record", factClass: "core" | "editorial" = "core") => claim(`${target.key}-${key}`, predicate, text, source.key, locator, scope, factClass);
  const marketText = target.marketVariants.map((item) => `${item.name}（${item.code}）${item.price}`).join("；");
  const claims: CuratedClaim[] = [
    c("identity", "model_identity", `${target.shortTitle} 是 Dream Pen Whispers in Bloom 集合中的独立商品；官方 product id 为 ${target.productId}，exact handle 为 ${target.url.split("/products/")[1]}。`, product, "product id, exact title and handle"),
    c("artist", "artisan", "官方商品页把每支作品的签名风格归于越南 Sơn Mài 大师 Pham Chinh Trung；不扩写为未被本批来源支持的完整履历。", productPage, "Master Pham Chinh Trung attribution"),
    c("theme", "design_theme", `${target.theme}；主题名称不替代实物颜色、纹理、花形或 Type 对照。`, productPage, "exact flower and colour narrative"),
    c("craft", "decoration_technique", `官方 Art 字段为 ${target.art}；页面描述多层漆、mài 研磨和蛋壳逐片贴附，最终图像会在研磨中显现。`, product, "Son Mai and eggshell process description"),
    c("craft-context", "craft_terminology_context", "越南工贸部资料也把多道漆、研磨、蛋壳和金银列为越南漆画的重要材料与步骤；只作独立工艺背景，不替本 SKU 证明树脂批次、漆层厚度或工坊分工。", craft, "independent Vietnamese lacquer context"),
    c("material", "material", "官方规格列 Base material: Ebonite；页面未公布笔身坯料批次、漆层数量或每支艺术品认证编号。", product, "base material and exact specification fields"),
    c("nib", "nib", "官方 exact page 列 #6 JoWo stainless steel、Keiryu、Keiryu Kodachi 和 Shogun 18K gold；这是尖面配置菜单，不把 Type 变体扩写成完整尖面 SKU。", product, "nib option menu"),
    c("feed", "feed", "Feed 为 Plastic、black ebonite、red ebonite；官方注明 ebonite feed 只适用于 #6 JoWo。", product, "feed options and JoWo compatibility"),
    c("filling", "filling_system", "供墨为 Converter 或 European International Standard cartridge；页面未授权本款作为 eyedropper 使用。", product, "filling mechanism field"),
    c("dimensions", "dimensions", "官方给出带帽长度 154.8 mm、不带帽 135.5 mm、最大直径 15.5 mm。", product, "Size & Shape field"),
    c("weight", "weight", "官方给出带帽 28 g、不带帽 19 g；JSON 变体中的 200 g 字段不作为成品实测重量。", product, "Size & Shape weight field", "editorial"),
    c("cap", "cap", "帽子带 compact air-tight cap，用于减少墨水提前干燥；不等于完全防漏或免维护。", product, "compact air-tight cap specification"),
    c("packaging", "packaging", "包装列 Japanese/Traditional Japanese Wooden Box、Pen Sleeve 或 Pen Kimono、说明材料、converter 与 cartridge；以各 exact 页面清单为准。", product, "packaging list", "editorial"),
    c("care", "maintenance_guidance", "官方提醒避免强冲击、尖锐物和会撕掉漆面的胶带，并用柔软布轻拭；清洗只处理笔尖、feed、握段和 converter，不用酒精、研磨剂或超声波。", care, "official Son Mai care boundary", "editorial"),
    c("price", "price_status", `检索窗口官方 JSON 市场变体为 ${marketText}；价格、税费、库存和商品标签会变化。`, product, "exact Type price rows and commercial labels", "editorial"),
    c("selection", "selection_guidance", `选购或二手核对完整标题、产品编号 ${target.productId}、handle、${target.marketVariants.map((item) => item.code).join("/、")}、Ebonite、Sơn Mài/蛋壳、所选 nib/feed、欧规 cartridge、尺寸重量和当支照片；不要从同系列其他花卉补未公布字段。`, product, "exact identity, Type variants and evidence boundary", "editorial"),
  ];
  const variants: CuratedVariant[] = [
    { key: `${target.key}-handcrafted-surface`, name: "Handcrafted Son Mai surface · no fixed texture standard", notes: "品牌手工差异提醒；不是限量编号或额外市场 SKU。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" },
    ...target.marketVariants.map((item) => ({ key: `${target.key}-${item.key}`, name: item.name, notes: `官方 exact JSON 市场变体，SKU ${item.code}；价格以当次记录为准。`, sourceKey: product.key, variantKind: item.variantKind, productCode: item.code, market: "global" })),
    ...NIBS.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "nib" as const, market: "global" })),
    ...FEEDS.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "material" as const, market: "global" })),
  ];
  const values = {
    series_name: target.canonicalName,
    release_year: `独立首发年份未公布；官方 product JSON created_at 为 ${target.createdAt}，只作商品记录时间`,
    origin_country: "Wancher 日本品牌与越南 Pham Chinh Trung Sơn Mài 工艺叙事；页面未逐组件公布产地分工",
    nib: NIBS.map((item) => item[1]).join("、"),
    fill_system: "Converter 或 European International Standard cartridge",
    material: `Ebonite；${target.art}`,
    dimensions: "带帽 154.8 mm；不带帽 135.5 mm；最大直径 15.5 mm",
    weight: "带帽 28 g；不带帽 19 g",
    price_range: `${marketText}；价格、税费和库存会变`,
    status: "商品记录标签和可购状态需按页面实时确认",
  };
  return {
    key: `phase520-wancher-${target.key}-v1`,
    entityId: target.entityId,
    expectedType: "pen",
    expectedSlug: target.slug,
    canonicalName: target.canonicalName,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: target.articleFile,
    storyTitle: `${target.shortTitle}：越南漆艺、蛋壳与 Type 边界`,
    primarySourceKey: product.key,
    depthTier: "A",
    aliases: [{ alias: target.title, language: "en", sourceKey: product.key }, { alias: target.canonicalName, language: "en", sourceKey: product.key }, { alias: `Wancher ${target.shortTitle} 越南漆艺钢笔`, language: "zh", sourceKey: product.key }],
    sources: [product, productPage, collection, nibGuide, care, craft, svg],
    scopes: [{ key: scope, scopeKey: scope, productionState: "current", market: "global", nibScope: "#6 JoWo stainless steel、Keiryu、Keiryu Kodachi、Shogun 18K gold；feed 兼容按 exact page。", materialScope: `Ebonite；${target.art}；未公布漆层数量、树脂批次、工匠分工和单支认证编号。`, editionScope: "Type 变体与手工纹理差异不是公开限量编号；库存和标签按当次页面核对。" }, { key: `phase520-${target.key}-context`, scopeKey: `phase520-${target.key}-context`, productionState: "historical", materialScope: "Independent Vietnamese lacquer-art context only; no product-specific authenticity certification.", editionScope: "花卉象征和艺术家署名不建立独立首发年份或二手价值。" }],
    claims,
    variants,
    spec: {
      brandEntityId: PHASE520_WANCHER_BRAND_ID,
      values,
      evidence: [
        evidence(`${target.key}-brand`, "brand_entity_id", collection.key, scope, "Dream Pen collection brand boundary"),
        evidence(`${target.key}-series`, "series_name", product.key, scope, "exact title and handle"),
        evidence(`${target.key}-release`, "release_year", product.key, scope, "created_at listing context without formal launch year"),
        evidence(`${target.key}-origin`, "origin_country", productPage.key, scope, "Pham Chinh Trung and Vietnamese craft wording"),
        evidence(`${target.key}-nib-spec`, "nib", product.key, scope, "exact nib menu"),
        evidence(`${target.key}-fill-spec`, "fill_system", product.key, scope, "filling mechanism field"),
        evidence(`${target.key}-material-spec`, "material", product.key, scope, "base material and art field"),
        evidence(`${target.key}-dimensions`, "dimensions", product.key, scope, "exact Size & Shape fields"),
        evidence(`${target.key}-weight`, "weight", product.key, scope, "exact Size & Shape weight fields"),
        evidence(`${target.key}-price-spec`, "price_range", product.key, scope, "exact Type price rows"),
        evidence(`${target.key}-status`, "status", product.key, scope, "commercial labels and product record"),
      ],
    },
    timeline: [{ key: `${target.key}-listing`, title: `${target.shortTitle} exact product record verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: `Exact title, product id, Type variants and Son Mai specifications verified on ${RETRIEVED}; this is not a formal release date.`, sourceKey: product.key }],
    conflicts: [
      { key: `${target.key}-status-window`, fieldKey: "status", scopeKey: scope, conflictKind: "field", status: "resolved", resolutionNote: "商品标签与渲染页状态会随库存和缓存更新；内容保留检索窗口语境，不推断长期可购买或永久停产。", members: [{ citationKey: `${target.key}-status`, assertedValue: "exact JSON commercial labels" }] },
      { key: `${target.key}-not-release-year`, fieldKey: "release_year", scopeKey: scope, conflictKind: "field", status: "resolved", resolutionNote: "created_at 与工艺故事不足以确定正式首发日；release_year 只保留商品记录时间。", members: [{ citationKey: `${target.key}-release`, assertedValue: `created_at ${target.createdAt} is not a formal launch date` }] },
    ],
    media: [{ key: `${target.key}-svg`, title: `${target.shortTitle} 材料、配置与护理边界图（非产品照片）`, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
  };
}

export const phase520WancherSonMaiPacks: CuratedEntityPack[] = PHASE520_TARGETS.map(makePack);
