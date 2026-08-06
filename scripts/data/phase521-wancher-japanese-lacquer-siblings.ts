import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, CuratedVariant, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-05";
export const PHASE521_WANCHER_BRAND_ID = "eOfD77nOeENN";

export const PHASE521_TARGETS = [
  {
    key: "oita-kurozan",
    entityId: "phase521-wancher-oita-urushi-kurozan",
    slug: "wancher-oita-urushi-kurozan-fountain-pen",
    canonicalName: "Wancher Oita Urushi - Kurozan Fountain Pen",
    title: "Oita Urushi - Kurozan Fountain Pen",
    shortTitle: "Oita Urushi Kurozan",
    productId: "9241757057239",
    createdAt: "2026-04-16",
    url: "https://www.wancherpen.com/products/oita-urushi-kurozan-fountain-pen",
    jsonUrl: "https://www.wancherpen.com/products/oita-urushi-kurozan-fountain-pen.json",
    image: "/images/library/site-original/phase521/wancher/oita-urushi-kurozan.svg",
    articleFile: ".planning/content-research/wancher-oita-urushi-kurozan-phase521.md",
    material: "Ebonite；Oita Urushi，炭粉黑底与红色纹理叙事",
    art: "Oita Urushi",
    theme: "Radiant Black、炭粉触感与大分新漆艺叙事",
    fill: "Converter 或 European International Standard cartridge",
    nibOptions: [["jowo", "JoWo #6", "官方尖面菜单。"], ["keiryu", "Keiryu", "官方尖面菜单。"], ["keiryu-kodachi", "Keiryu Kodachi", "官方尖面菜单。"], ["shogun-18k", "18K Shogun", "官方尖面菜单。"]] as const,
    feedOptions: [["plastic", "Plastic feed", "适用于 18K Shogun、Keiryu、Keiryu Kodachi。"], ["ebonite", "Ebonite feed", "仅兼容 JoWo #6。"]] as const,
    marketVariants: [{ key: "default", name: "Default Title", code: "WF-DR-OTA-KZ-BARA", variantKind: "market_sku" as const, price: "US$4,131" }],
    context: "kyoto",
  },
  {
    key: "aizu-tamamushi-midori",
    entityId: "phase521-wancher-aizu-urushi-tamamushi-midori",
    slug: "wancher-aizu-urushi-tamamushi-nuri-midori",
    canonicalName: "Wancher Aizu Urushi - Tamamushi-nuri - Midori",
    title: "Aizu Urushi - Tamamushi-nuri - Midori",
    shortTitle: "Aizu Urushi Tamamushi-nuri Midori",
    productId: "9215401427159",
    createdAt: "2026-03-17",
    url: "https://www.wancherpen.com/products/aizu-urushi-tamamushi-midori",
    jsonUrl: "https://www.wancherpen.com/products/aizu-urushi-tamamushi-midori.json",
    image: "/images/library/site-original/phase521/wancher/aizu-urushi-tamamushi-midori.svg",
    articleFile: ".planning/content-research/wancher-aizu-urushi-tamamushi-midori-phase521.md",
    material: "ABS；Aizu Urushi、Tamamushi-nuri（银粉夹层叙事）",
    art: "Aizu Urushi、Tamamushi-nuri",
    theme: "银粉夹层、绿色光泽与会津漆器语境",
    fill: "Converter 或 European International Standard cartridge",
    nibOptions: [["jowo", "#6 JoWo stainless steel", "官方尖面菜单。"], ["keiryu", "Keiryu", "官方尖面菜单。"], ["keiryu-kodachi", "Keiryu Kodachi", "官方尖面菜单。"]] as const,
    feedOptions: [["ebonite", "Ebonite feed", "仅适用于 JoWo #6。"], ["plastic", "Plastic feed", "官方 feed 菜单。"]] as const,
    marketVariants: [{ key: "default", name: "Default Title", code: "WF-UR-DREAM-TMGR", variantKind: "market_sku" as const, price: "US$2,754" }],
    context: "aizu",
  },
  {
    key: "bokashi-oboro",
    entityId: "phase521-wancher-bokashi-nuri-oboro",
    slug: "wancher-bokashi-nuri-oboro",
    canonicalName: "Wancher Bokashi-nuri - Oboro",
    title: "Bokashi-nuri - Oboro",
    shortTitle: "Bokashi-nuri Oboro",
    productId: "9149273047255",
    createdAt: "2026-01-06",
    url: "https://www.wancherpen.com/products/bokashi-nuri-oboro",
    jsonUrl: "https://www.wancherpen.com/products/bokashi-nuri-oboro.json",
    image: "/images/library/site-original/phase521/wancher/bokashi-nuri-oboro.svg",
    articleFile: ".planning/content-research/wancher-bokashi-nuri-oboro-phase521.md",
    material: "Ebonite、Bokashi-nuri；Ebonite feed 仅适用于 JoWo #6，另有 Plastic Feed",
    art: "Bokashi-nuri",
    theme: "深哑蓝向笔尾浅绿的朦胧渐变",
    fill: "Converter 和 European International Standard cartridge",
    nibOptions: [["jowo", "#6 JoWo stainless steel", "官方尖面菜单。"], ["keiryu", "Keiryu", "官方尖面菜单。"], ["keiryu-kodachi", "Keiryu Kodachi", "官方尖面菜单。"]] as const,
    feedOptions: [["ebonite", "Ebonite feed", "仅适用于 JoWo #6。"], ["plastic", "Plastic feed", "官方 feed 菜单。"]] as const,
    marketVariants: [{ key: "default", name: "Default Title", code: "WF-AIUR-DR-BO-BL", variantKind: "market_sku" as const, price: "US$3,168" }],
    context: "aizu",
  },
  {
    key: "bokashi-tsubomi",
    entityId: "phase521-wancher-bokashi-nuri-tsubomi",
    slug: "wancher-bokashi-nuri-tsubomi",
    canonicalName: "Wancher Bokashi-nuri - Tsubomi",
    title: "Bokashi-nuri - Tsubomi",
    shortTitle: "Bokashi-nuri Tsubomi",
    productId: "9149272752343",
    createdAt: "2026-01-06",
    url: "https://www.wancherpen.com/products/bokashi-nuri-tsubomi",
    jsonUrl: "https://www.wancherpen.com/products/bokashi-nuri-tsubomi.json",
    image: "/images/library/site-original/phase521/wancher/bokashi-nuri-tsubomi.svg",
    articleFile: ".planning/content-research/wancher-bokashi-nuri-tsubomi-phase521.md",
    material: "Ebonite、Bokashi Urushi；Plastic/black ebonite/red ebonite feed",
    art: "Bokashi Urushi",
    theme: "含苞待放与柔和粉色渐变",
    fill: "Converter 和 European International Standard cartridge",
    nibOptions: [["jowo", "#6 JoWo stainless steel", "官方尖面菜单。"], ["keiryu-kodachi", "Keiryu - Kodachi", "官方尖面菜单。"], ["shogun-18k", "Shogun 18K", "官方尖面菜单。"], ["keiryu", "Keiryu", "官方尖面菜单。"]] as const,
    feedOptions: [["plastic", "Plastic feed", "官方 feed 菜单。"], ["ebonite-black", "Black ebonite feed", "官方 feed 菜单。"], ["ebonite-red", "Red ebonite feed", "官方 feed 菜单。"]] as const,
    marketVariants: [{ key: "default", name: "Default Title", code: "WF-AIUR-DR-BO-PK", variantKind: "market_sku" as const, price: "US$3,168" }],
    context: "aizu",
  },
] as const;

export type Phase521Target = (typeof PHASE521_TARGETS)[number];

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; tier: CuratedSource["tier"]; independenceGroup: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: "official", tier: input.tier, independenceGroup: input.independenceGroup, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase521", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase521", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作色卡或库存证明。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, scopeKey: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }] };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string, qualifies = true): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies };
}

function makePack(target: Phase521Target): CuratedEntityPack {
  const scope = `Wancher ${target.shortTitle} exact product record, Japanese lacquer technique and configuration`;
  const product = web({ key: `wancher-phase521-${target.key}-official-json`, title: `${target.title} | Wancher Official product JSON`, url: target.jsonUrl, registryKey: `wancher-official-${target.key}-phase521`, registryName: "Wancher Pen official product record", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase521`, summary: `官方 Shopify product JSON：product id ${target.productId}、exact handle、SKU、价格、材料、尖材、feed、供墨和包装。`, locator: "product id, title, handle, created_at, variants, prices and specifications" });
  const productPage = web({ key: `wancher-phase521-${target.key}-official-page`, title: `${target.title} | Wancher Official`, url: target.url, registryKey: `wancher-official-${target.key}-page-phase521`, registryName: "Wancher Pen official product page", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase521`, summary: `官方商品页：${target.theme}、工艺步骤、手工差异和护理提示。`, locator: "exact title, craft narrative, specifications, packaging and care" });
  const collection = web({ key: `wancher-phase521-${target.key}-collection`, title: "Dream Pen Fountain Pen Collection | Wancher Official", url: "https://www.wancherpen.com/collections/dream-pen", registryKey: `wancher-official-dream-pen-collection-phase521-${target.key}`, registryName: "Wancher Pen official Dream Pen collection", tier: "primary", independenceGroup: `wancher-official-dream-pen-collection-phase521-${target.key}`, summary: "官方集合页用于确认 Dream Pen 导航；Oita、Aizu、Bokashi 工艺商品仍按 exact product 分开。", locator: "Dream Pen collection product navigation" });
  const nibGuide = web({ key: `wancher-phase521-${target.key}-nib-guide`, title: "Wancher Fountain Pen Nib Guide", url: "https://www.wancherpen.com/pages/nib-guide", registryKey: `wancher-official-nib-guide-phase521-${target.key}`, registryName: "Wancher Pen official nib guide", tier: "primary", independenceGroup: `wancher-official-nib-guide-phase521-${target.key}`, summary: "官方指南提供 JoWo、Keiryu/Kodachi 和 Shogun 菜单语境；不替 exact page 增加未列配置。", locator: "nib family and compatibility guidance" });
  const care = web({ key: `wancher-phase521-${target.key}-care`, title: "Wancher Product Care Guide", url: "https://www.wancherpen.com/pages/product-care", registryKey: `wancher-official-product-care-phase521-${target.key}`, registryName: "Wancher Pen official product care", tier: "primary", independenceGroup: `wancher-official-product-care-phase521-${target.key}`, summary: "官方护理页提供漆面和钢笔清洁边界；本包不补写页面没有公布的化学配方。", locator: "material care and cleaning guidance" });
  const context = target.context === "aizu" ? web({ key: `aizu-craft-context-phase521-${target.key}`, title: "会津塗 | 传统工艺青山 Square", url: "https://kougeihin.jp/craft/0506/", registryKey: `aoyama-square-aizu-phase521-${target.key}`, registryName: "Traditional Crafts Aoyama Square", tier: "professional_secondary", independenceGroup: `aoyama-square-aizu-phase521-${target.key}`, summary: "传统工艺青山 Square 介绍会津塗的地方工艺和多样漆法；只作 Aizu 背景。", locator: "Aizu lacquerware regional technique description" }) : web({ key: `kyoto-urushi-context-phase521-${target.key}`, title: "Preserving Lacquers through Conservation", url: "https://www.kyohaku.go.jp/old/eng/theme/floor1_6/past/1F-6_20201219.html", registryKey: `kyoto-national-museum-urushi-phase521-${target.key}`, registryName: "Kyoto National Museum", tier: "professional_secondary", independenceGroup: `kyoto-national-museum-urushi-phase521-${target.key}`, summary: "京都国立博物馆解释 Urushi 漆的硬化与保存风险；只作材料护理背景。", locator: "urushi material and conservation explanation" });
  const svg = diagram(`wancher-phase521-${target.key}-svg`, `${target.shortTitle} 材料、配置与护理边界事实图`, target.image);
  const c = (key: string, predicate: string, text: string, source: CuratedSource = product, locator = "exact product record", factClass: "core" | "editorial" = "core") => claim(`${target.key}-${key}`, predicate, text, source.key, locator, scope, factClass);
  const marketText = target.marketVariants.map((item) => `${item.name}（${item.code}）${item.price}`).join("；");
  const craftText = target.key === "oita-kurozan" ? "品牌描述炭粉黑底、红色纹理和 Shikake-bera 刮纹；它是 Oita Urushi 的新系列叙事，不是政府地理认证。" : target.key === "aizu-tamamushi-midori" ? "品牌描述在中间漆层加入银粉，再覆 Urushi 并反复抛光以形成 Tamamushi-nuri 的绿色深度；温湿度和抛光会影响结果。" : "品牌描述 Bokashi-nuri 通过多层 Urushi 手工形成渐变；漆层在成熟过程中可能改变颜色和亮度，微小点与不对称可能是 wabi-sabi 手工痕迹。";
  const claims: CuratedClaim[] = [
    c("identity", "model_identity", `${target.shortTitle} 是 Dream Pen 集合中的独立商品；官方 product id 为 ${target.productId}，exact handle 为 ${target.url.split("/products/")[1]}。`, product, "product id, exact title and handle"),
    c("craft", "decoration_technique", craftText, productPage, "exact craft process and technique narrative"),
    c("craft-context", "craft_terminology_context", target.context === "aizu" ? "传统工艺青山 Square 的会津塗资料提供 Aizu 漆器的地方工艺背景；不替本支钢笔证明工匠、漆液来源、银粉含量或认证。" : "京都国立博物馆说明 Urushi 是漆树汁液硬化形成的材料，老漆器仍可能需要保存修复；只作一般材料背景，不替 Kurozan 证明漆液树种、层数或产地认证。", context, "independent Japanese lacquer context"),
    c("material", "material", `官方规格列 ${target.material}；页面未公布漆层数量、批次、工匠完整履历或单支认证编号。`, product, "exact material and art fields"),
    c("nib", "nib", `官方 exact page 列 ${target.nibOptions.map((item) => item[1]).join("、")}；这是配置菜单，不把未展开组合写成额外市场 SKU。`, product, "nib option menu"),
    c("feed", "feed", `Feed 菜单包括 ${target.feedOptions.map((item) => item[1]).join("、")}；兼容性按 exact 页面注明的边界。`, product, "feed options and compatibility"),
    c("filling", "filling_system", `供墨为 ${target.fill}；页面未授权本款作为 eyedropper 使用。`, product, "filling mechanism field"),
    c("cap", "cap", "帽子带 compact air-tight cap，用于减少笔尖提前干涸；不等于完全防漏或免维护。", product, "compact air-tight cap specification"),
    c("size", "dimensions", "官方 exact 页面没有公开可复核的长度、直径、握径；不要从图片估算尺寸。", product, "exact page without published dimensions"),
    c("weight", "weight", "官方 exact 页面没有公开可靠成品重量；JSON 变体中的 200 g 字段不作为实测规格。", product, "exact page without published product weight", "editorial"),
    c("packaging", "packaging", "包装列 Traditional Japanese Wooden Box、Pen Kimono、说明材料、converter 与 cartridge；若 exact 页面列 Certificate 或 3 个 cartridges，以当次清单为准。", product, "packaging list", "editorial"),
    c("care", "maintenance_guidance", "漆面应避免强冲击、尖锐物、长时间直晒、剧烈温湿变化、酒精、丙酮、漂白剂、研磨剂和整支浸水；只用柔软布轻拭，清洗局部笔尖、feed、握段和 converter。", care, "official care page and conservative lacquer boundary", "editorial"),
    c("price", "price_status", `检索窗口官方 JSON 市场变体为 ${marketText}；价格、税费、库存和标签会变化。`, product, "exact market price and commercial labels", "editorial"),
    c("selection", "selection_guidance", `选购或二手核对完整标题、产品编号 ${target.productId}、handle、${target.marketVariants.map((item) => item.code).join("/、")}、材料与工艺、所选 nib/feed、欧规 cartridge、包装和实物照片；不要从其他漆艺商品补未公布字段。`, product, "exact identity and evidence boundary", "editorial"),
  ];
  const variants: CuratedVariant[] = [{ key: `${target.key}-handcrafted-surface`, name: "Handcrafted lacquer surface · no fixed texture standard", notes: "官方手工差异提醒；不是限量编号或额外市场 SKU。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" }, ...target.marketVariants.map((item) => ({ key: `${target.key}-${item.key}`, name: item.name, notes: `官方 exact JSON 市场变体，SKU ${item.code}；价格以当次记录为准。`, sourceKey: product.key, variantKind: item.variantKind, productCode: item.code, market: "global" })), ...target.nibOptions.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "nib" as const, market: "global" })), ...target.feedOptions.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "material" as const, market: "global" }))];
  const marketValues = marketText;
  return {
    key: `phase521-wancher-${target.key}-v1`, entityId: target.entityId, expectedType: "pen", expectedSlug: target.slug, canonicalName: target.canonicalName, publicationIntent: "publish", publicationBlockers: [], markdownFile: target.articleFile, storyTitle: `${target.shortTitle}：漆艺、配置与身份边界`, primarySourceKey: product.key, depthTier: "A",
    aliases: [{ alias: target.title, language: "en", sourceKey: product.key }, { alias: target.canonicalName, language: "en", sourceKey: product.key }, { alias: `Wancher ${target.shortTitle} 日本漆艺钢笔`, language: "zh", sourceKey: product.key }],
    sources: [product, productPage, collection, nibGuide, care, context, svg],
    scopes: [{ key: scope, scopeKey: scope, productionState: "current", market: "global", nibScope: target.nibOptions.map((item) => item[1]).join("、"), materialScope: `${target.material}；未公布漆层数量、批次、尺寸和实测重量。`, editionScope: "市场变体与手工纹理差异不是公开限量编号；库存和标签按当次页面核对。" }, { key: `phase521-${target.key}-context`, scopeKey: `phase521-${target.key}-context`, productionState: "historical", materialScope: "Independent Japanese lacquer context only; no product-specific authenticity certification.", editionScope: "工艺叙事不建立独立首发年份或二手价值。" }],
    claims, variants,
    spec: { brandEntityId: PHASE521_WANCHER_BRAND_ID, values: { series_name: target.canonicalName, release_year: `独立首发年份未公布；官方 product JSON created_at 为 ${target.createdAt}，只作商品记录时间`, origin_country: "Wancher 日本品牌与 Oita/Aizu Urushi 工艺叙事；页面未逐组件公布产地分工", nib: target.nibOptions.map((item) => item[1]).join("、"), fill_system: target.fill, material: target.material, dimensions: "官方 exact product page 未公布长度、直径、握径", weight: "官方未公布可靠成品重量；JSON 200 g 字段不作为实测规格", price_range: `${marketValues}；价格、税费和库存会变`, status: "商品记录标签和可购状态需按页面实时确认" }, evidence: [evidence(`${target.key}-brand`, "brand_entity_id", collection.key, scope, "Dream Pen collection brand boundary"), evidence(`${target.key}-series`, "series_name", product.key, scope, "exact title and handle"), evidence(`${target.key}-release`, "release_year", product.key, scope, "created_at listing context without formal launch year"), evidence(`${target.key}-origin`, "origin_country", productPage.key, scope, "official craft/origin wording"), evidence(`${target.key}-nib-spec`, "nib", product.key, scope, "exact nib menu"), evidence(`${target.key}-fill-spec`, "fill_system", product.key, scope, "filling mechanism field"), evidence(`${target.key}-material-spec`, "material", product.key, scope, "exact material and art field"), evidence(`${target.key}-dimensions`, "dimensions", product.key, scope, "exact page without published dimensions"), evidence(`${target.key}-weight`, "weight", product.key, scope, "exact page without published weight"), evidence(`${target.key}-price-spec`, "price_range", product.key, scope, "exact market price rows"), evidence(`${target.key}-status`, "status", product.key, scope, "commercial labels and product record")] },
    timeline: [{ key: `${target.key}-listing`, title: `${target.shortTitle} exact product record verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: `Exact title, product id, SKU and lacquer configuration verified on ${RETRIEVED}; this is not a formal release date.`, sourceKey: product.key }],
    conflicts: [{ key: `${target.key}-status-window`, fieldKey: "status", scopeKey: scope, conflictKind: "field", status: "resolved", resolutionNote: "商品标签和库存会随页面更新；保留检索窗口语境，不推断长期可购买或永久停产。", members: [{ citationKey: `${target.key}-status`, assertedValue: "exact JSON commercial labels" }] }, { key: `${target.key}-not-release-year`, fieldKey: "release_year", scopeKey: scope, conflictKind: "field", status: "resolved", resolutionNote: "created_at 与工艺故事不足以确定正式首发日；release_year 只保留商品记录时间。", members: [{ citationKey: `${target.key}-release`, assertedValue: `created_at ${target.createdAt} is not a formal launch date` }] }],
    media: [{ key: `${target.key}-svg`, title: `${target.shortTitle} 材料、配置与护理边界图（非产品照片）`, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
  };
}

export const phase521WancherJapaneseLacquerPacks: CuratedEntityPack[] = PHASE521_TARGETS.map(makePack);
