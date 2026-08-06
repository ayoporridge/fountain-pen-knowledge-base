import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-06";
export const PHASE524_WANCHER_BRAND_ID = "eOfD77nOeENN";

const CHIJIMI_VARIANTS = (prefix: string) => [
  ["18k-ef", "Solid Gold / Extra Fine", `${prefix}-18K-EF`, "US$800"],
  ["18k-f", "Solid Gold / Fine", `${prefix}-18K-F`, "US$800"],
  ["18k-mf", "Solid Gold / Medium Fine", `${prefix}-18K-MF`, "US$800"],
  ["18k-m", "Solid Gold / Medium", `${prefix}-18K-M`, "US$800"],
  ["18k-b", "Solid Gold / Broad", `${prefix}-18K-B`, "US$800"],
  ["18k-nf", "Solid Gold / Kodachi Fine + $100", `${prefix}-18K-NF`, "US$900"],
  ["18k-nm", "Solid Gold / Kodachi Medium + $100", `${prefix}-18K-NM`, "US$900"],
  ["18k-nb", "Solid Gold / Kodachi Broad + $100", `${prefix}-18K-NB`, "US$900"],
  ["18r-ef", "Rhodium-plated / Extra Fine", `${prefix}-18R-EF`, "US$800"],
  ["18r-f", "Rhodium-plated / Fine", `${prefix}-18R-F`, "US$800"],
  ["18r-mf", "Rhodium-plated / Medium Fine", `${prefix}-18R-MF`, "US$800"],
  ["18r-m", "Rhodium-plated / Medium", `${prefix}-18R-M`, "US$800"],
  ["18r-b", "Rhodium-plated / Broad", `${prefix}-18R-B`, "US$800"],
  ["18r-nf", "Rhodium-plated / Kodachi Fine + $100", `${prefix}-18R-NF`, "US$900"],
  ["18r-nm", "Rhodium-plated / Kodachi Medium + $100", `${prefix}-18R-NM`, "US$900"],
  ["18r-nb", "Rhodium-plated / Kodachi Broad + $100", `${prefix}-18R-NB`, "US$900"],
] as const;

export const PHASE524_TARGETS = [
  {
    key: "yakumo-shirohebi",
    entityId: "phase524-wancher-yakumo-nuri-chijimi-shirohebi",
    slug: "wancher-yakumo-nuri-chijimi-shirohebi",
    canonicalName: "Wancher Yakumo-nuri Chijimi - Shirohebi Fountain Pen",
    title: "Yakumo-nuri Chijimi - Shirohebi Fountain Pen",
    shortTitle: "Yakumo-nuri Chijimi Shirohebi",
    productId: "9246445109463",
    createdAt: "2026-04-23",
    url: "https://www.wancherpen.com/products/yakumo-nuri-chijimi-shirohebi",
    jsonUrl: "https://www.wancherpen.com/products/yakumo-nuri-chijimi-shirohebi.json",
    image: "/images/library/site-original/phase524/wancher/yakumo-chijimi-shirohebi.svg",
    articleFile: ".planning/content-research/wancher-yakumo-nuri-chijimi-shirohebi-phase524.md",
    material: "Ebonite、Yakumo-nuri、Chijimi Urushi",
    art: "Yakumo-nuri、Chijimi（收缩漆）",
    theme: "白蛇命名、守护意象与随机收缩纹理",
    fill: "Converter 或 Sailor Standard cartridge",
    nibOptions: [
      ["shogun-solid", "18K Solid Gold Shogun", "官方尖面菜单。"],
      ["shogun-rhodium", "Rhodium-plated Shogun 18K", "官方可选饰面菜单。"],
    ] as const,
    feedOptions: [["plastic", "Plastic feed", "官方 feed 菜单。"]] as const,
    marketVariants: CHIJIMI_VARIANTS("WF-MOUR-CHI-WH").map(([key, name, code, price]) => ({ key, name, code, price, variantKind: "market_sku" as const })),
    context: "yakumo" as const,
  },
  {
    key: "yakumo-nishikihebi",
    entityId: "phase524-wancher-yakumo-nuri-chijimi-nishikihebi",
    slug: "wancher-yakumo-nuri-chijimi-nishikihebi",
    canonicalName: "Wancher Yakumo-nuri Chijimi - Nishikihebi Fountain Pen",
    title: "Yakumo-nuri Chijimi - Nishikihebi Fountain Pen",
    shortTitle: "Yakumo-nuri Chijimi Nishikihebi",
    productId: "9246509269207",
    createdAt: "2026-04-23",
    url: "https://www.wancherpen.com/products/yakumo-nuri-chijimi-nishikihebi",
    jsonUrl: "https://www.wancherpen.com/products/yakumo-nuri-chijimi-nishikihebi.json",
    image: "/images/library/site-original/phase524/wancher/yakumo-chijimi-nishikihebi.svg",
    articleFile: ".planning/content-research/wancher-yakumo-nuri-chijimi-nishikihebi-phase524.md",
    material: "Ebonite、Yakumo-nuri、Chijimi Urushi",
    art: "Yakumo-nuri、Chijimi（收缩漆）",
    theme: "黄蛇意象、力量叙事与随机收缩纹理",
    fill: "Converter 或 Sailor Standard cartridge",
    nibOptions: [
      ["shogun-solid", "18K Solid Gold Shogun", "官方尖面菜单。"],
      ["shogun-rhodium", "Rhodium-plated Shogun 18K", "官方可选饰面菜单。"],
    ] as const,
    feedOptions: [["plastic", "Plastic feed", "官方 feed 菜单。"]] as const,
    marketVariants: CHIJIMI_VARIANTS("WF-MOUR-CHI-GD").map(([key, name, code, price]) => ({ key, name, code, price, variantKind: "market_sku" as const })),
    context: "yakumo" as const,
  },
  {
    key: "yakumo-aodaisho",
    entityId: "phase524-wancher-yakumo-nuri-chijimi-aodaisho",
    slug: "wancher-yakumo-nuri-chijimi-aodaisho",
    canonicalName: "Wancher Yakumo-nuri Chijimi - Aodaisho Fountain Pen",
    title: "Yakumo-nuri Chijimi - Aodaisho Fountain Pen",
    shortTitle: "Yakumo-nuri Chijimi Aodaisho",
    productId: "9246515298519",
    createdAt: "2026-04-23",
    url: "https://www.wancherpen.com/products/yakumo-nuri-chijimi-aodaisho",
    jsonUrl: "https://www.wancherpen.com/products/yakumo-nuri-chijimi-aodaisho.json",
    image: "/images/library/site-original/phase524/wancher/yakumo-chijimi-aodaisho.svg",
    articleFile: ".planning/content-research/wancher-yakumo-nuri-chijimi-aodaisho-phase524.md",
    material: "Ebonite、Yakumo-nuri、Chijimi Urushi",
    art: "Yakumo-nuri、Chijimi（收缩漆）",
    theme: "青大将意象、守护叙事与成熟中的色泽变化",
    fill: "Converter 或 Sailor Standard cartridge",
    nibOptions: [
      ["shogun-solid", "18K Solid Gold Shogun", "官方尖面菜单。"],
      ["shogun-rhodium", "Rhodium-plated Shogun 18K", "官方可选饰面菜单。"],
    ] as const,
    feedOptions: [["plastic", "Plastic feed", "官方 feed 菜单。"]] as const,
    marketVariants: CHIJIMI_VARIANTS("WF-MOUR-CHI-GR").map(([key, name, code, price]) => ({ key, name, code, price, variantKind: "market_sku" as const })),
    context: "yakumo" as const,
  },
  {
    key: "oita-kurozan",
    entityId: "phase524-wancher-oita-urushi-kurozan",
    slug: "wancher-oita-urushi-kurozan",
    canonicalName: "Wancher Oita Urushi - Kurozan Fountain Pen",
    title: "Oita Urushi - Kurozan Fountain Pen",
    shortTitle: "Oita Urushi Kurozan",
    productId: "9241757057239",
    createdAt: "2026-04-16",
    url: "https://www.wancherpen.com/products/oita-urushi-kurozan-fountain-pen",
    jsonUrl: "https://www.wancherpen.com/products/oita-urushi-kurozan-fountain-pen.json",
    image: "/images/library/site-original/phase524/wancher/oita-urushi-kurozan.svg",
    articleFile: ".planning/content-research/wancher-oita-urushi-kurozan-phase524.md",
    material: "Ebonite、Oita Urushi、炭粉、黑色与朱红色 Urushi",
    art: "Oita Urushi、炭粉与 Shikake-bera 旋涡",
    theme: "黑色炭粉哑光、朱红点缀与手工旋涡",
    fill: "Converter 或 European International Standard cartridge",
    nibOptions: [
      ["jowo", "#6 JoWo stainless steel", "官方尖面菜单。"],
      ["keiryu", "Keiryu", "官方尖面菜单。"],
      ["keiryu-kodachi", "Keiryu Kodachi", "官方尖面菜单。"],
      ["shogun", "18K Shogun", "官方尖面菜单。"],
    ] as const,
    feedOptions: [
      ["plastic", "Plastic feed", "18K Shogun、Keiryu、Keiryu Kodachi 的官方 feed。"],
      ["ebonite-jowo", "Ebonite feed", "官方说明仅与 JoWo #6 兼容。"],
    ] as const,
    marketVariants: [{ key: "default", name: "Default Title", code: "WF-DR-OTA-KZ-BARA", variantKind: "market_sku" as const, price: "US$600" }],
    context: "oita" as const,
  },
] as const;

export type Phase524Target = (typeof PHASE524_TARGETS)[number];

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType?: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; independenceGroup: string; summary: string; locator: string }): CuratedSource {
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
    registryKey: "fountain-pen-graph-editorial-phase524",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase524",
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

function makePack(target: Phase524Target): CuratedEntityPack {
  const isYakumo = target.context === "yakumo";
  const scope = `Wancher ${target.shortTitle} exact product record, ${isYakumo ? "Yakumo-nuri Chijimi technique" : "Oita Urushi Kurozan technique"} and configuration`;
  const product = web({
    key: `wancher-phase524-${target.key}-official-json`,
    title: `${target.title} | Wancher Official product JSON`,
    url: target.jsonUrl,
    registryKey: `wancher-official-${target.key}-phase524`,
    registryName: "Wancher Pen official product record",
    tier: "primary",
    independenceGroup: `wancher-official-${target.key}-phase524`,
    summary: `官方 Shopify product JSON：product id ${target.productId}、exact handle、SKU、价格、材料、尖材、feed、供墨和包装。`,
    locator: "product id, title, handle, created_at, variants, prices and specifications",
  });
  const productPage = web({
    key: `wancher-phase524-${target.key}-official-page`,
    title: `${target.title} | Wancher Official`,
    url: target.url,
    registryKey: `wancher-official-${target.key}-page-phase524`,
    registryName: "Wancher Pen official product page",
    tier: "primary",
    independenceGroup: `wancher-official-${target.key}-phase524`,
    summary: `官方商品页：${target.theme}、工艺师语境、手工差异、规格、包装和护理提示。`,
    locator: "exact title, craft narrative, specifications, packaging and care",
  });
  const collection = web({
    key: `wancher-phase524-${target.key}-collection`,
    title: isYakumo ? "Yakumo-nuri Urushi Fountain Pen Collection | Wancher Official" : "Wancher Oita Fountain Pen Collection",
    url: isYakumo ? "https://www.wancherpen.com/collections/yakumo-nuri" : "https://www.wancherpen.com/collections/all-pens/oita",
    registryKey: `wancher-official-${isYakumo ? "yakumo-nuri" : "oita"}-collection-phase524-${target.key}`,
    registryName: "Wancher Pen official collection",
    tier: "primary",
    independenceGroup: `wancher-official-${isYakumo ? "yakumo-nuri" : "oita"}-collection-phase524-${target.key}`,
    summary: isYakumo ? "官方 Yakumo-nuri 集合页把 Shirohebi、Nishikihebi、Aodaisho 与其他商品分开导航。" : "官方集合页用于确认 Oita Urushi 商品导航；Kurozan 按 exact product 单独记录。",
    locator: "collection product navigation and series boundary",
  });
  const nibGuide = web({ key: `wancher-phase524-${target.key}-nib-guide`, title: "Wancher Fountain Pen Nib Guide", url: "https://www.wancherpen.com/pages/nib-guide", registryKey: `wancher-official-nib-guide-phase524-${target.key}`, registryName: "Wancher Pen official nib guide", tier: "primary", independenceGroup: `wancher-official-nib-guide-phase524-${target.key}`, summary: "官方指南提供 Shogun、JoWo、Keiryu/Kodachi 菜单语境；不替 exact page 添加未列配置。", locator: "nib family and compatibility guidance" });
  const care = web({ key: `wancher-phase524-${target.key}-care`, title: "Wancher Product Care Guide", url: "https://www.wancherpen.com/pages/product-care", registryKey: `wancher-official-product-care-phase524-${target.key}`, registryName: "Wancher Pen official product care", tier: "primary", independenceGroup: `wancher-official-product-care-phase524-${target.key}`, summary: "官方护理页提供漆面和钢笔清洁边界；本包不补写页面没有公布的化学配方。", locator: "material care and cleaning guidance" });
  const artisan = isYakumo
    ? web({ key: `shimane-yakumo-context-phase524-${target.key}`, title: "八雲塗 | 島根県伝統工芸", url: "https://www.pref.shimane.lg.jp/industry/syoko/sangyo/dentou_kougei/kougei/kougei_02.html", registryKey: `shimane-pref-yakumo-phase524-${target.key}`, registryName: "Shimane Prefecture", sourceType: "official", tier: "professional_secondary", independenceGroup: `shimane-pref-yakumo-phase524-${target.key}`, summary: "岛根县官方资料说明八雲塗的明治时期起源、材料与基本工序；只作区域工艺背景。", locator: "Yakumo-nuri history, materials and process" })
    : web({ key: `wancher-oita-story-phase524-${target.key}`, title: "Bringing Urushi Culture to Oita Prefecture", url: "https://www.wancherpen.com/blogs/news/bringing-urushi-culture-to-oita-prefecture", registryKey: `wancher-official-oita-story-phase524-${target.key}`, registryName: "Wancher Pen official Oita Urushi story", tier: "primary", independenceGroup: `wancher-official-oita-story-phase524-${target.key}`, summary: "官方故事页补充 Oita Urushi 的地域叙事、Onimaru Mayumi 与 Kurozan 创作语境。", locator: "Oita Urushi origin, artisan and Kurozan story" });
  const contextCare = web({ key: `kyoto-urushi-context-phase524-${target.key}`, title: "Preserving Lacquers through Conservation", url: "https://www.kyohaku.go.jp/old/eng/theme/floor1_6/past/1F-6_20201219.html", registryKey: `kyoto-national-museum-urushi-phase524-${target.key}`, registryName: "Kyoto National Museum", sourceType: "official", tier: "professional_secondary", independenceGroup: `kyoto-national-museum-urushi-phase524-${target.key}`, summary: "京都国立博物馆解释 Urushi 硬化、紫外线和湿度保存风险；只作一般护理背景。", locator: "urushi material and conservation explanation" });
  const svg = diagram(`wancher-phase524-${target.key}-svg`, `${target.shortTitle} 材料、配置与护理边界事实图`, target.image);
  const c = (key: string, predicate: string, text: string, source: CuratedSource = product, locator = "exact product record", factClass: "core" | "editorial" = "core") => claim(`${target.key}-${key}`, predicate, text, source.key, locator, scope, factClass);
  const marketText = target.marketVariants.map((item) => `${item.name}（${item.code}）${item.price}`).join("；");
  const craftText = isYakumo ? "官方把 Chijimi-nuri 描述为收缩漆在受控干燥成熟中形成深线和旋涡纹理；每支纹理随机，不把蛇主题写成动物材料。" : "官方把 Kurozan 描述为黑色基调、朱红点缀、炭粉哑光与 Shikake-bera 旋涡；不把炭纹位置或手工差异写成固定批次标准。";
  const contextText = isYakumo ? "岛根县官方资料说明八雲塗在明治时期由坂田平一创案，并以色漆、青贝、金银粉和透明漆完成；它是区域背景，不替本支证明逐支工艺记录。" : "官方 Oita Urushi 故事把 Onimaru Mayumi 的青森训练与大分新工艺方向联系起来；这是品牌工艺师叙事，不替本支建立独立认证编号。";
  const claims: CuratedClaim[] = [
    c("identity", "model_identity", `${target.shortTitle} 是 Wancher 集合中的独立商品；官方 product id 为 ${target.productId}，exact handle 为 ${target.url.split("/products/")[1]}。`, product, "product id, exact title and handle"),
    c("craft", "decoration_technique", craftText, productPage, "exact craft process and technique narrative"),
    c("artisan", "artisan", isYakumo ? "官方将 Yakumo-nuri 合作工艺师写为 Nagaya Momoko；岛根县资料只作区域历史，不替本支建立逐支签名档案。" : "官方将本支工艺师写为 Onimaru Mayumi；本包保留其青森训练、大分迁居和发展 Oita Urushi 的叙事边界。", productPage, "artisan attribution and identity boundary"),
    c("craft-context", "craft_terminology_context", contextText, artisan, "independent or official artisan context"),
    c("conservation-context", "material_conservation_context", isYakumo ? "京都国立博物馆的 Urushi 保存说明指出，应避开紫外线、剧烈温湿变化和不当清洁；这是材料护理背景，不是本支商品的额外规格。" : "京都国立博物馆的 Urushi 保存说明可用于 Kurozan 的保守护理边界；它不替 Oita Urushi 证明配方、漆层数量或工艺认证。", contextCare, "independent professional-secondary context for material boundary"),
    c("material", "material", `官方规格列 ${target.material}；页面未公布漆层数量、批次或可靠成品实测重量。`, product, "exact material and art fields"),
    c("nib", "nib", `官方 exact page 列 ${target.nibOptions.map((item) => item[1]).join("、")}；这是尖面/饰面菜单，不把未展开组合写成额外市场 SKU。`, product, "nib option menu"),
    c("feed", "feed", `Feed 菜单包括 ${target.feedOptions.map((item) => item[1]).join("、")}；兼容性按 exact 页面记录。`, product, "feed options and compatibility"),
    c("filling", "filling_system", `供墨为 ${target.fill}；页面未授权本款作为 eyedropper 使用。`, product, "filling mechanism field"),
    c("cap", "cap", "帽子带 compact air-tight cap，用于减少笔尖提前干涸；不等于完全防漏或免维护。", product, "compact air-tight cap specification"),
    c("size", "dimensions", "官方 exact 页面没有公开可复核的长度、直径、握径；不要从图片估算尺寸。", product, "exact page without published dimensions"),
    c("weight", "weight", "官方 exact 页面没有公开可靠成品重量；JSON 变体中的 200 g 字段不作为实测规格。", product, "exact page without published product weight", "editorial"),
    c("packaging", "packaging", isYakumo ? "包装按 exact 页面记录；Chijimi 的 16 个尖面/饰面 SKU 与普通 Default Title 商品分开。" : "包装按 exact 页面记录；Kurozan 的 JoWo 与其他尖面/ feed 兼容边界必须随订单保存。", product, "packaging and market variant list", "editorial"),
    c("care", "maintenance_guidance", "漆面应避免强冲击、尖锐物、长时间直晒、剧烈温湿变化、酒精、丙酮、漂白剂、研磨剂和整支浸水；只用柔软布轻拭，清洗局部笔尖、feed、握段和 converter。", contextCare, "official lacquer care and conservative pen boundary", "editorial"),
    c("price", "price_status", `检索窗口官方 JSON 市场变体为 ${marketText}；价格、税费、库存和标签会变化。`, product, "exact market price and commercial labels", "editorial"),
    c("selection", "selection_guidance", `选购或二手核对完整标题、产品编号 ${target.productId}、handle、${target.marketVariants.map((item) => item.code).join("/、")}、材料与工艺、所选 nib/feed、供墨标准、包装和实物照片；不要从其他漆艺商品补未公布字段。`, product, "exact identity and evidence boundary", "editorial"),
  ];
  const variants: CuratedVariant[] = [
    { key: `${target.key}-handcrafted-surface`, name: "Handcrafted surface · no fixed texture standard", notes: "官方手工差异提醒；不是限量编号或额外市场 SKU。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" },
    ...target.marketVariants.map((item) => ({ key: `${target.key}-${item.key}`, name: item.name, notes: `官方 exact JSON 市场变体，SKU ${item.code}；价格以当次记录为准。`, sourceKey: product.key, variantKind: item.variantKind, productCode: item.code, market: "global" })),
    ...target.nibOptions.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "nib" as const, market: "global" })),
    ...target.feedOptions.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "material" as const, market: "global" })),
  ];
  return {
    key: `phase524-wancher-${target.key}-v1`,
    entityId: target.entityId,
    expectedType: "pen",
    expectedSlug: target.slug,
    canonicalName: target.canonicalName,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: target.articleFile,
    storyTitle: `${target.shortTitle}：漆艺、配置与身份边界`,
    primarySourceKey: product.key,
    depthTier: "A",
    aliases: [{ alias: target.title, language: "en", sourceKey: product.key }, { alias: target.canonicalName, language: "en", sourceKey: product.key }, { alias: `Wancher ${target.shortTitle} 日本漆艺钢笔`, language: "zh", sourceKey: product.key }],
    sources: [product, productPage, collection, nibGuide, care, artisan, contextCare, svg],
    scopes: [{ key: scope, scopeKey: scope, productionState: "current", market: "global", nibScope: target.nibOptions.map((item) => item[1]).join("、"), materialScope: `${target.material}；未公布漆层数量、批次、尺寸和实测重量。`, editionScope: "市场变体与手工纹理差异不是公开限量编号；库存和标签按当次页面核对。" }, { key: `phase524-${target.key}-context`, scopeKey: `phase524-${target.key}-context`, productionState: "historical", materialScope: "Independent craft context only; no product-specific authenticity certification.", editionScope: "工艺叙事不建立独立首发年份或二手价值。" }],
    claims,
    variants,
    spec: {
      brandEntityId: PHASE524_WANCHER_BRAND_ID,
      values: {
        series_name: target.canonicalName,
        release_year: `独立首发年份未公布；官方 product JSON created_at 为 ${target.createdAt}，只作商品记录时间`,
        origin_country: `Wancher ${isYakumo ? "岛根 Yakumo-nuri/Nagaya Momoko" : "Oita Urushi/Onimaru Mayumi"} 工艺叙事；页面未逐组件公布产地分工`,
        nib: target.nibOptions.map((item) => item[1]).join("、"),
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
        evidence(`${target.key}-nib-spec`, "nib", product.key, scope, "exact nib and finish menu"),
        evidence(`${target.key}-fill-spec`, "fill_system", product.key, scope, "filling mechanism field"),
        evidence(`${target.key}-material-spec`, "material", product.key, scope, "exact material and art field"),
        evidence(`${target.key}-dimensions`, "dimensions", product.key, scope, "exact page without published dimensions"),
        evidence(`${target.key}-weight`, "weight", product.key, scope, "exact page without published weight"),
        evidence(`${target.key}-price-spec`, "price_range", product.key, scope, "exact market price rows"),
        evidence(`${target.key}-status`, "status", product.key, scope, "commercial labels and product record"),
      ],
    },
    timeline: [{ key: `${target.key}-listing`, title: `${target.shortTitle} exact product record verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: `Exact title, product id, SKU and craft configuration verified on ${RETRIEVED}; this is not a formal release date.`, sourceKey: product.key }],
    conflicts: [{ key: `${target.key}-status-window`, fieldKey: "status", scopeKey: scope, conflictKind: "field", status: "resolved", resolutionNote: "商品标签和库存会随页面更新；保留检索窗口语境，不推断长期可购买或永久停产。", members: [{ citationKey: `${target.key}-status`, assertedValue: "exact JSON commercial labels" }] }, { key: `${target.key}-not-release-year`, fieldKey: "release_year", scopeKey: scope, conflictKind: "field", status: "resolved", resolutionNote: "created_at 与工艺故事不足以确定正式首发日；release_year 只保留商品记录时间。", members: [{ citationKey: `${target.key}-release`, assertedValue: `created_at ${target.createdAt} is not a formal launch date` }] }],
    media: [{ key: `${target.key}-svg`, title: `${target.shortTitle} 材料、配置与护理边界图（非产品照片）`, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
  };
}

export const phase524WancherYakumoChijimiOitaPacks: CuratedEntityPack[] = PHASE524_TARGETS.map(makePack);
