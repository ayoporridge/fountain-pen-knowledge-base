import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, CuratedVariant, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-06";
export const PHASE523_WANCHER_BRAND_ID = "eOfD77nOeENN";

const CHIJIMI_VARIANTS = [
  ["18k-ef", "Solid Gold / Extra Fine", "WF-MOUR-CHI-BK-18K-EF", "US$700"],
  ["18k-f", "Solid Gold / Fine", "WF-MOUR-CHI-BK-18K-F", "US$700"],
  ["18k-mf", "Solid Gold / Medium Fine", "WF-MOUR-CHI-BK-18K-MF", "US$700"],
  ["18k-m", "Solid Gold / Medium", "WF-MOUR-CHI-BK-18K-M", "US$700"],
  ["18k-b", "Solid Gold / Broad", "WF-MOUR-CHI-BK-18K-B", "US$700"],
  ["18k-nf", "Solid Gold / Kodachi Fine", "WF-MOUR-CHI-BK-18K-NF", "US$800"],
  ["18k-nm", "Solid Gold / Kodachi Medium", "WF-MOUR-CHI-BK-18K-NM", "US$800"],
  ["18k-nb", "Solid Gold / Kodachi Broad", "WF-MOUR-CHI-BK-18K-NB", "US$800"],
  ["18r-ef", "Rhodium-plated / Extra Fine", "WF-MOUR-CHI-BK-18R-EF", "US$700"],
  ["18r-f", "Rhodium-plated / Fine", "WF-MOUR-CHI-BK-18R-F", "US$700"],
  ["18r-mf", "Rhodium-plated / Medium Fine", "WF-MOUR-CHI-BK-18R-MF", "US$700"],
  ["18r-m", "Rhodium-plated / Medium", "WF-MOUR-CHI-BK-18R-M", "US$700"],
  ["18r-b", "Rhodium-plated / Broad", "WF-MOUR-CHI-BK-18R-B", "US$700"],
  ["18r-nf", "Rhodium-plated / Kodachi Fine", "WF-MOUR-CHI-BK-18R-NF", "US$800"],
  ["18r-nm", "Rhodium-plated / Kodachi Medium", "WF-MOUR-CHI-BK-18R-NM", "US$800"],
  ["18r-nb", "Rhodium-plated / Kodachi Broad", "WF-MOUR-CHI-BK-18R-NB", "US$800"],
] as const;

export const PHASE523_TARGETS = [
  {
    key: "hirota-sabi-nuri",
    entityId: "phase523-wancher-hirota-urushi-sabi-nuri",
    slug: "wancher-hirota-urushi-sabi-nuri",
    canonicalName: "Wancher Hirota Urushi - Sabi Nuri Fountain Pen",
    title: "Hirota Urushi - Sabi Nuri Fountain Pen",
    shortTitle: "Hirota Urushi Sabi Nuri",
    productId: "8972484608215",
    createdAt: "2025-07-15",
    url: "https://www.wancherpen.com/products/hirota-urushi-sabi-nuri",
    jsonUrl: "https://www.wancherpen.com/products/hirota-urushi-sabi-nuri.json",
    image: "/images/library/site-original/phase523/wancher/hirota-urushi-sabi-nuri.svg",
    articleFile: ".planning/content-research/wancher-hirota-urushi-sabi-nuri-phase523.md",
    material: "Ebonite、Urushi、Sabi Nuri",
    art: "Hirota Urushi、Sabi Nuri",
    theme: "局部凿刻、浅棕木芯般纹理与不重复的手工表面",
    fill: "Converter 或 European International Standard cartridge",
    nibOptions: [["jowo", "#6 JoWo stainless steel", "官方尖面菜单。"], ["wancher-18k", "Wancher 18K gold", "官方尖面菜单。"]] as const,
    feedOptions: [["plastic", "Plastic feed", "官方 feed 菜单。"], ["ebonite-black", "Black ebonite feed", "官方 feed 菜单。"], ["ebonite-red", "Red ebonite feed", "官方 feed 菜单。"]] as const,
    marketVariants: [{ key: "default", name: "Default Title", code: "WF-HIUR-DREAM-SAB", variantKind: "market_sku" as const, price: "US$750" }],
    context: "hirota",
  },
  {
    key: "hirota-chawan-momo",
    entityId: "phase523-wancher-hirota-urushi-chawan-iro-momo",
    slug: "wancher-hirota-urushi-chawan-iro-momo",
    canonicalName: "Wancher Hirota Urushi - Chawan-iro - Momo",
    title: "Hirota Urushi - Chawan-iro - Momo",
    shortTitle: "Hirota Urushi Chawan-iro Momo",
    productId: "8921741885655",
    createdAt: "2025-05-30",
    url: "https://www.wancherpen.com/products/hirota-urushi-chawan-iro-momo",
    jsonUrl: "https://www.wancherpen.com/products/hirota-urushi-chawan-iro-momo.json",
    image: "/images/library/site-original/phase523/wancher/hirota-urushi-chawan-momo.svg",
    articleFile: ".planning/content-research/wancher-hirota-urushi-chawan-iro-momo-phase523.md",
    material: "Ebonite、Kinma",
    art: "Hirota Urushi、Chawan-iro",
    theme: "茶碗审美、桃花盛开与中心深两端浅的粉红渐变",
    fill: "Converter 或 European International Standard cartridge",
    nibOptions: [["jowo", "#6 JoWo stainless steel", "官方尖面菜单。"], ["wancher-18k", "Wancher 18K gold", "官方尖面菜单。"]] as const,
    feedOptions: [["plastic", "Plastic feed", "官方 feed 菜单。"], ["ebonite-black", "Black ebonite feed", "官方 feed 菜单。"], ["ebonite-red", "Red ebonite feed", "官方 feed 菜单。"]] as const,
    marketVariants: [{ key: "default", name: "Default Title", code: "WF-HTUR-DP24-MOMO", variantKind: "market_sku" as const, price: "US$900" }],
    context: "hirota",
  },
  {
    key: "yakumo-ryuusei",
    entityId: "phase523-wancher-yakumo-nuri-shibo-ryuusei",
    slug: "wancher-yakumo-nuri-shibo-urushi-ryuusei",
    canonicalName: "Wancher Yakumo-nuri Shibo Urushi - Ryuusei",
    title: "Yakumo-nuri Shibo Urushi - Ryuusei",
    shortTitle: "Yakumo-nuri Shibo Urushi Ryuusei",
    productId: "8910344421591",
    createdAt: "2025-05-13",
    url: "https://www.wancherpen.com/products/yakumo-ryuusei",
    jsonUrl: "https://www.wancherpen.com/products/yakumo-ryuusei.json",
    image: "/images/library/site-original/phase523/wancher/yakumo-shibo-ryuusei.svg",
    articleFile: ".planning/content-research/wancher-yakumo-nuri-shibo-ryuusei-phase523.md",
    material: "Ebonite、Yakumo-nuri、Shibo Urushi",
    art: "Yakumo-nuri、Shibo Urushi",
    theme: "流星红色轨迹、金属粉和会随使用变化的表面",
    fill: "Converter 或 European International Standard cartridge",
    nibOptions: [["jowo", "#6 JoWo stainless steel", "官方尖面菜单。"], ["wancher-18k", "Wancher 18K gold", "官方尖面菜单。"], ["keiryu-kodachi", "Keiryu/Kodachi", "官方尖面菜单。"]] as const,
    feedOptions: [["plastic", "Plastic feed", "官方 feed 菜单。"], ["ebonite-black", "Black ebonite feed", "官方 feed 菜单。"], ["ebonite-red", "Red ebonite feed", "官方 feed 菜单。"]] as const,
    marketVariants: [{ key: "default", name: "Default Title", code: "WF-MOUR-DR-YAK-RD", variantKind: "market_sku" as const, price: "US$600" }],
    context: "yakumo",
  },
  {
    key: "yakumo-chijimi-black",
    entityId: "phase523-wancher-yakumo-nuri-chijimi-black",
    slug: "wancher-yakumo-nuri-chijimi-black",
    canonicalName: "Wancher Yakumo-nuri Chijimi - Black",
    title: "Yakumo-nuri Chijimi - Black",
    shortTitle: "Yakumo-nuri Chijimi Black",
    productId: "9174850044119",
    createdAt: "2026-02-04",
    url: "https://www.wancherpen.com/products/yakumo-nuri-chijimi-black",
    jsonUrl: "https://www.wancherpen.com/products/yakumo-nuri-chijimi-black.json",
    image: "/images/library/site-original/phase523/wancher/yakumo-chijimi-black.svg",
    articleFile: ".planning/content-research/wancher-yakumo-nuri-chijimi-black-phase523.md",
    material: "Ebonite、Yakumo-nuri、Chijimi Urushi",
    art: "Yakumo-nuri、Chijimi（收缩漆）",
    theme: "收缩漆干燥成熟形成树皮般深线和旋涡纹理",
    fill: "Converter 或 Sailor Standard cartridge",
    nibOptions: [["shogun-solid", "18K Solid Gold Shogun", "官方尖面与饰面菜单。"], ["shogun-rhodium", "Rhodium-plated Shogun 18K", "官方可选饰面菜单。"]] as const,
    feedOptions: [["plastic", "Plastic feed", "官方 feed 菜单。"]] as const,
    marketVariants: CHIJIMI_VARIANTS.map(([key, name, code, price]) => ({ key, name, code, price, variantKind: "market_sku" as const })),
    context: "yakumo",
  },
] as const;

export type Phase523Target = (typeof PHASE523_TARGETS)[number];

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType?: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; independenceGroup: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType ?? "official", tier: input.tier, independenceGroup: input.independenceGroup, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase523", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase523", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作色卡或库存证明。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, scopeKey: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }] };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makePack(target: Phase523Target): CuratedEntityPack {
  const scope = `Wancher ${target.shortTitle} exact product record, ${target.context === "hirota" ? "Hirota Urushi artisan technique" : "Yakumo-nuri lacquer technique"} and configuration`;
  const product = web({ key: `wancher-phase523-${target.key}-official-json`, title: `${target.title} | Wancher Official product JSON`, url: target.jsonUrl, registryKey: `wancher-official-${target.key}-phase523`, registryName: "Wancher Pen official product record", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase523`, summary: `官方 Shopify product JSON：product id ${target.productId}、exact handle、SKU、价格、材料、尖材、feed、供墨和包装。`, locator: "product id, title, handle, created_at, variants, prices and specifications" });
  const productPage = web({ key: `wancher-phase523-${target.key}-official-page`, title: `${target.title} | Wancher Official`, url: target.url, registryKey: `wancher-official-${target.key}-page-phase523`, registryName: "Wancher Pen official product page", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase523`, summary: `官方商品页：${target.theme}、工艺师语境、手工差异、规格、包装和护理提示。`, locator: "exact title, artisan/craft narrative, specifications, packaging and care" });
  const collection = web({ key: `wancher-phase523-${target.key}-collection`, title: "Dream Pen Fountain Pen Collection | Wancher Official", url: "https://www.wancherpen.com/collections/dream-pen", registryKey: `wancher-official-dream-pen-collection-phase523-${target.key}`, registryName: "Wancher Pen official Dream Pen collection", tier: "primary", independenceGroup: `wancher-official-dream-pen-collection-phase523-${target.key}`, summary: "官方集合页用于确认 Dream Pen 导航；Hirota、Yakumo 和 Chijimi 商品按 exact product 分开。", locator: "Dream Pen collection product navigation" });
  const nibGuide = web({ key: `wancher-phase523-${target.key}-nib-guide`, title: "Wancher Fountain Pen Nib Guide", url: "https://www.wancherpen.com/pages/nib-guide", registryKey: `wancher-official-nib-guide-phase523-${target.key}`, registryName: "Wancher Pen official nib guide", tier: "primary", independenceGroup: `wancher-official-nib-guide-phase523-${target.key}`, summary: "官方指南提供 JoWo、Keiryu/Kodachi 和 Shogun 菜单语境；不替 exact page 添加未列配置。", locator: "nib family and compatibility guidance" });
  const care = web({ key: `wancher-phase523-${target.key}-care`, title: "Wancher Product Care Guide", url: "https://www.wancherpen.com/pages/product-care", registryKey: `wancher-official-product-care-phase523-${target.key}`, registryName: "Wancher Pen official product care", tier: "primary", independenceGroup: `wancher-official-product-care-phase523-${target.key}`, summary: "官方护理页提供漆面和钢笔清洁边界；本包不补写页面没有公布的化学配方。", locator: "material care and cleaning guidance" });
  const artisan = target.context === "hirota" ? web({ key: `wancher-hirota-context-phase523-${target.key}`, title: "Urushi Fountain Pen by Yoko Hirota", url: "https://www.wancherpen.com/collections/hirota-urushi", registryKey: `wancher-official-hirota-collection-phase523-${target.key}`, registryName: "Wancher Hirota Urushi official collection", tier: "primary", independenceGroup: `wancher-official-hirota-collection-phase523-${target.key}`, summary: "Wancher 官方集合页介绍广田洋子与主要技法；只作工艺师和系列背景。", locator: "Yoko Hirota biography and main Urushi techniques" }) : web({ key: `shimane-yakumo-context-phase523-${target.key}`, title: "Shimane Art Museum collection and crafts", url: "https://www.shimane-art-museum.jp/en/collection/", registryKey: `shimane-art-museum-yakumo-phase523-${target.key}`, registryName: "Shimane Art Museum", sourceType: "official", tier: "professional_secondary", independenceGroup: `shimane-art-museum-yakumo-phase523-${target.key}`, summary: "岛根县立美术馆介绍岛根地方工艺并提及明治时期坂田平一开始八雲塗；只作区域历史背景。", locator: "Shimane crafts and Yakumo-nuri history" });
  const contextCare = target.context === "hirota" ? web({ key: `kyoto-urushi-context-phase523-${target.key}`, title: "Preserving Lacquers through Conservation", url: "https://www.kyohaku.go.jp/old/eng/theme/floor1_6/past/1F-6_20201219.html", registryKey: `kyoto-national-museum-urushi-phase523-${target.key}`, registryName: "Kyoto National Museum", sourceType: "official", tier: "professional_secondary", independenceGroup: `kyoto-national-museum-urushi-phase523-${target.key}`, summary: "京都国立博物馆解释 Urushi 硬化、紫外线和湿度保存风险；只作一般护理背景。", locator: "urushi material and conservation explanation" }) : web({ key: `izumo-yakumo-context-phase523-${target.key}`, title: "出雲の伝統工芸品一覧", url: "https://www.city.izumo.shimane.jp/www/contents/1407998917650/index.html", registryKey: `izumo-city-yakumo-craft-phase523-${target.key}`, registryName: "Izumo City", sourceType: "official", tier: "professional_secondary", independenceGroup: `izumo-city-yakumo-craft-phase523-${target.key}`, summary: "出云市官方名录将八雲塗列为地方传统工艺；只作地方工艺身份背景。", locator: "Yakumo-nuri in Izumo traditional crafts list" });
  const svg = diagram(`wancher-phase523-${target.key}-svg`, `${target.shortTitle} 材料、配置与护理边界事实图`, target.image);
  const c = (key: string, predicate: string, text: string, source: CuratedSource = product, locator = "exact product record", factClass: "core" | "editorial" = "core") => claim(`${target.key}-${key}`, predicate, text, source.key, locator, scope, factClass);
  const marketText = target.marketVariants.map((item) => `${item.name}（${item.code}）${item.price}`).join("；");
  const craftText = target.key === "hirota-sabi-nuri" ? "官方把 Sabi Nuri 描述为多层 Urushi 后局部凿刻和研磨的锈蚀般纹理；不把视觉比喻写成铁锈或结构缺陷。" : target.key === "hirota-chawan-momo" ? "官方把 Chawan-iro Momo 描述为茶碗审美参照和粉红、红、白的桃花渐变；Kinma 按 exact material/art 字段记录。" : target.key === "yakumo-ryuusei" ? "官方把 Shibo Urushi - Ryuusei 描述为金属粉和 Urushi 形成的红色流星轨迹，并说颜色会随使用变化；不推导量化褪色曲线。" : "官方把 Chijimi-nuri 描述为收缩漆在受控干燥成熟中形成深线和旋涡纹理；18K Shogun 的金尖/铑饰和尖幅是市场配置边界。";
  const contextText = target.context === "hirota" ? "Wancher Hirota Urushi 集合页介绍广田洋子与主要技法；它是品牌工艺师背景，不能替本支商品证明独立作品编号、完整履历或认证。" : "岛根与出云官方资料说明八雲塗的地方工艺背景和明治时期发展；它们不替本支钢笔证明具体漆液来源、逐支签名或每层工序。";
  const claims: CuratedClaim[] = [
    c("identity", "model_identity", `${target.shortTitle} 是 Dream Pen 集合中的独立商品；官方 product id 为 ${target.productId}，exact handle 为 ${target.url.split("/products/")[1]}。`, product, "product id, exact title and handle"),
    c("craft", "decoration_technique", craftText, productPage, "exact craft process and technique narrative"),
    c("artisan", "artisan", target.context === "hirota" ? "官方将 Hirota Urushi 归于广田洋子；本支页面的每色一支/手工描述不建立独立认证编号。" : "官方将 Yakumo-nuri 合作工艺师写为 Nagaya Momoko；区域资料只作背景，不替本支建立逐支签名档案。", productPage, "artisan attribution and identity boundary"),
    c("craft-context", "craft_terminology_context", contextText, artisan, "independent or official artisan context"),
    c("conservation-context", "material_conservation_context", target.context === "hirota" ? "京都国立博物馆的 Urushi 保存说明指出，漆器应避开紫外线、剧烈温湿变化和不当清洁；这是材料护理背景，不是本支商品的额外规格。" : "出云市官方传统工艺名录确认 Yakumo-nuri 的地方工艺身份；这只用于区域背景，不替本支钢笔证明逐支工艺记录。", contextCare, "independent professional-secondary context for material and regional boundary"),
    c("material", "material", `官方规格列 ${target.material}；页面未公布漆层数量、批次或可靠成品实测重量。`, product, "exact material and art fields"),
    c("nib", "nib", `官方 exact page 列 ${target.nibOptions.map((item) => item[1]).join("、")}；这是尖面/饰面菜单，不把未展开组合写成额外市场 SKU。`, product, "nib option menu"),
    c("feed", "feed", `Feed 菜单包括 ${target.feedOptions.map((item) => item[1]).join("、")}；兼容性按 exact 页面记录。`, product, "feed options and compatibility"),
    c("filling", "filling_system", `供墨为 ${target.fill}；页面未授权本款作为 eyedropper 使用。`, product, "filling mechanism field"),
    c("cap", "cap", "帽子带 compact air-tight cap，用于减少笔尖提前干涸；不等于完全防漏或免维护。", product, "compact air-tight cap specification"),
    c("size", "dimensions", "官方 exact 页面没有公开可复核的长度、直径、握径；不要从图片估算尺寸。", product, "exact page without published dimensions"),
    c("weight", "weight", "官方 exact 页面没有公开可靠成品重量；JSON 变体中的 200 g 字段不作为实测规格。", product, "exact page without published product weight", "editorial"),
    c("packaging", "packaging", "包装按 exact 页面记录；Chijimi Black 的 16 个尖面/饰面 SKU 与普通 Default Title 商品分开。", product, "packaging and market variant list", "editorial"),
    c("care", "maintenance_guidance", "漆面应避免强冲击、尖锐物、长时间直晒、剧烈温湿变化、酒精、丙酮、漂白剂、研磨剂和整支浸水；只用柔软布轻拭，清洗局部笔尖、feed、握段和 converter。", contextCare, "official lacquer care and conservative pen boundary", "editorial"),
    c("price", "price_status", `检索窗口官方 JSON 市场变体为 ${marketText}；价格、税费、库存和标签会变化。`, product, "exact market price and commercial labels", "editorial"),
    c("selection", "selection_guidance", `选购或二手核对完整标题、产品编号 ${target.productId}、handle、${target.marketVariants.map((item) => item.code).join("/、")}、材料与工艺、所选 nib/feed、供墨标准、包装和实物照片；不要从其他漆艺商品补未公布字段。`, product, "exact identity and evidence boundary", "editorial"),
  ];
  const variants: CuratedVariant[] = [{ key: `${target.key}-handcrafted-surface`, name: "Handcrafted surface · no fixed texture standard", notes: "官方手工差异提醒；不是限量编号或额外市场 SKU。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" }, ...target.marketVariants.map((item) => ({ key: `${target.key}-${item.key}`, name: item.name, notes: `官方 exact JSON 市场变体，SKU ${item.code}；价格以当次记录为准。`, sourceKey: product.key, variantKind: item.variantKind, productCode: item.code, market: "global" })), ...target.nibOptions.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "nib" as const, market: "global" })), ...target.feedOptions.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "material" as const, market: "global" }))];
  return {
    key: `phase523-wancher-${target.key}-v1`, entityId: target.entityId, expectedType: "pen", expectedSlug: target.slug, canonicalName: target.canonicalName, publicationIntent: "publish", publicationBlockers: [], markdownFile: target.articleFile, storyTitle: `${target.shortTitle}：漆艺、配置与身份边界`, primarySourceKey: product.key, depthTier: "A",
    aliases: [{ alias: target.title, language: "en", sourceKey: product.key }, { alias: target.canonicalName, language: "en", sourceKey: product.key }, { alias: `Wancher ${target.shortTitle} 日本漆艺钢笔`, language: "zh", sourceKey: product.key }],
    sources: [product, productPage, collection, nibGuide, care, artisan, contextCare, svg],
    scopes: [{ key: scope, scopeKey: scope, productionState: "current", market: "global", nibScope: target.nibOptions.map((item) => item[1]).join("、"), materialScope: `${target.material}；未公布漆层数量、批次、尺寸和实测重量。`, editionScope: "市场变体与手工纹理差异不是公开限量编号；库存和标签按当次页面核对。" }, { key: `phase523-${target.key}-context`, scopeKey: `phase523-${target.key}-context`, productionState: "historical", materialScope: "Independent craft context only; no product-specific authenticity certification.", editionScope: "工艺叙事不建立独立首发年份或二手价值。" }],
    claims, variants,
    spec: { brandEntityId: PHASE523_WANCHER_BRAND_ID, values: { series_name: target.canonicalName, release_year: `独立首发年份未公布；官方 product JSON created_at 为 ${target.createdAt}，只作商品记录时间`, origin_country: `Wancher ${target.context === "hirota" ? "Hirota Urushi/广田洋子" : "岛根 Yakumo-nuri/Nagaya Momoko"} 工艺叙事；页面未逐组件公布产地分工`, nib: target.nibOptions.map((item) => item[1]).join("、"), fill_system: target.fill, material: target.material, dimensions: "官方 exact product page 未公布长度、直径、握径", weight: "官方未公布可靠成品重量；JSON 200 g 字段不作为实测规格", price_range: `${marketText}；价格、税费和库存会变`, status: "商品记录标签和可购状态需按页面实时确认" }, evidence: [evidence(`${target.key}-brand`, "brand_entity_id", collection.key, scope, "Dream Pen collection brand boundary"), evidence(`${target.key}-series`, "series_name", product.key, scope, "exact title and handle"), evidence(`${target.key}-release`, "release_year", product.key, scope, "created_at listing context without formal launch year"), evidence(`${target.key}-origin`, "origin_country", productPage.key, scope, "official artisan/origin wording"), evidence(`${target.key}-nib-spec`, "nib", product.key, scope, "exact nib and finish menu"), evidence(`${target.key}-fill-spec`, "fill_system", product.key, scope, "filling mechanism field"), evidence(`${target.key}-material-spec`, "material", product.key, scope, "exact material and art field"), evidence(`${target.key}-dimensions`, "dimensions", product.key, scope, "exact page without published dimensions"), evidence(`${target.key}-weight`, "weight", product.key, scope, "exact page without published weight"), evidence(`${target.key}-price-spec`, "price_range", product.key, scope, "exact market price rows"), evidence(`${target.key}-status`, "status", product.key, scope, "commercial labels and product record")] },
    timeline: [{ key: `${target.key}-listing`, title: `${target.shortTitle} exact product record verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: `Exact title, product id, SKU and craft configuration verified on ${RETRIEVED}; this is not a formal release date.`, sourceKey: product.key }],
    conflicts: [{ key: `${target.key}-status-window`, fieldKey: "status", scopeKey: scope, conflictKind: "field", status: "resolved", resolutionNote: "商品标签和库存会随页面更新；保留检索窗口语境，不推断长期可购买或永久停产。", members: [{ citationKey: `${target.key}-status`, assertedValue: "exact JSON commercial labels" }] }, { key: `${target.key}-not-release-year`, fieldKey: "release_year", scopeKey: scope, conflictKind: "field", status: "resolved", resolutionNote: "created_at 与工艺故事不足以确定正式首发日；release_year 只保留商品记录时间。", members: [{ citationKey: `${target.key}-release`, assertedValue: `created_at ${target.createdAt} is not a formal launch date` }] }],
    media: [{ key: `${target.key}-svg`, title: `${target.shortTitle} 材料、配置与护理边界图（非产品照片）`, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
  };
}

export const phase523WancherHirotaYakumoPacks: CuratedEntityPack[] = PHASE523_TARGETS.map(makePack);
