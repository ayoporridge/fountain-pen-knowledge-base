import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-06";
export const PHASE529_WANCHER_BRAND_ID = "eOfD77nOeENN";

const AKA_NIBS = [
  ["jowo", "#6 JoWo stainless steel", "官方尖面菜单。"],
  ["wancher-18k", "Wancher 18K gold", "官方尖面菜单。"],
  ["keiryu", "Keiryu", "官方尖面菜单。"],
  ["keiryu-kodachi", "Keiryu Kodachi", "官方尖面菜单。"],
] as const;
const STANDARD_NIBS = [
  ["jowo", "#6 JoWo stainless steel", "官方尖面菜单。"],
  ["wancher-18k", "Wancher 18K gold", "官方尖面菜单。"],
] as const;
const NASHIJI_NIBS = [
  ...STANDARD_NIBS,
  ["keiryu-kodachi", "Keiryu - Kodachi", "官方尖面菜单。"],
  ["shogun-18k", "Shogun 18K", "官方尖面菜单。"],
] as const;

export const PHASE529_TARGETS = [
  {
    key: "aizu-aka-tamenuri",
    entityId: "phase529-wancher-aizu-urushi-aka-tamenuri",
    slug: "wancher-aizu-urushi-aka-tamenuri-fountain-pen",
    canonicalName: "Wancher Dream Pen Aizu Urushi - Aka Tamenuri Fountain Pen",
    title: "Aizu Urushi - Aka Tamenuri Fountain Pen",
    shortTitle: "Aizu Urushi Aka Tamenuri",
    productId: "9038671970519",
    createdAt: "2025-09-18",
    publishedAt: "2025-09-19",
    url: "https://www.wancherpen.com/products/aizu-urushi-aka-tamenuri-fountain-pen",
    jsonUrl: "https://www.wancherpen.com/products/aizu-urushi-aka-tamenuri-fountain-pen.json",
    image: "/images/library/site-original/phase529/wancher/aizu-urushi-aka-tamenuri.svg",
    articleFile: ".planning/content-research/wancher-aizu-urushi-aka-tamenuri-phase529.md",
    material: "ABS、Aizu Urushi、Aka Tamenuri",
    art: "Aizu Urushi、Aka Tamenuri",
    theme: "Aka Tamenuri 的红色 Urushi 层次与会津手工差异",
    nibOptions: AKA_NIBS,
    feedOptions: [["plastic", "Plastic", "官方 feed 菜单。"], ["ebonite-black", "Black ebonite feed", "官方 feed 菜单。"], ["ebonite-red", "Red ebonite feed", "官方 feed 菜单。"]] as const,
    marketVariants: [["pen-only", "Pen Only", "WF-AIUR-DR-AKATA", "US$350", "官方 JSON 市场变体。"], ["pillow-set", "Pen Pillow Set + $50", "WF-AIUR-DR-AKATA-PP-SET", "US$400", "官方 JSON 市场变体；增加笔枕套装。"]] as const,
    technique: "Aka Tamenuri 先施红色 Urushi，再按工艺判断加入黑色、透明或另一种红色漆层；层次和抛光形成深度，批次会有差异。",
  },
  {
    key: "aizu-akebono",
    entityId: "phase529-wancher-aizu-urushi-akebono",
    slug: "wancher-dream-pen-aizu-akebono",
    canonicalName: "Wancher Dream Pen Aizu Urushi - Akebono-nuri Fountain Pen",
    title: "Aizu Urushi - Akebono-nuri Fountain Pen",
    shortTitle: "Aizu Urushi Akebono-nuri",
    productId: "6556754903215",
    createdAt: "2021-03-08",
    publishedAt: "2021-03-11",
    url: "https://www.wancherpen.com/products/dream-pen-aizu-akebono",
    jsonUrl: "https://www.wancherpen.com/products/dream-pen-aizu-akebono.json",
    image: "/images/library/site-original/phase529/wancher/aizu-urushi-akebono.svg",
    articleFile: ".planning/content-research/wancher-aizu-urushi-akebono-phase529.md",
    material: "ABS、Aizu Urushi、Akebono-nuri",
    art: "Aizu Urushi、Akebono-nuri",
    theme: "红色底漆与黑色 Urushi 反复研磨形成的曙色渐层",
    nibOptions: STANDARD_NIBS,
    feedOptions: [["plastic", "Plastic", "官方 feed 菜单。"], ["ebonite-black", "Black ebonite feed", "官方 feed 菜单。"], ["ebonite-red", "Red ebonite feed", "官方 feed 菜单。"], ["keiryu-kodachi", "Keiryu - Kodachi", "官方尖／feed 配置菜单。"]] as const,
    marketVariants: [["default", "Default Title", "WF-POAU-DREAM-AKBO", "US$500", "官方 JSON 市场变体。"]] as const,
    technique: "Akebono-nuri 先以红色 Urushi 作底，再施黑色漆并抛光露出红色；反复施工使底层红色更有光泽。",
  },
  {
    key: "aizu-tamamushi",
    entityId: "phase529-wancher-aizu-urushi-tamamushi",
    slug: "wancher-aizu-urushi-tamamushi-nuri",
    canonicalName: "Wancher Dream Pen Aizu Urushi - Tamamushi-nuri - Aka Fountain Pen",
    title: "Aizu Urushi - Tamamushi-nuri - Aka Fountain Pen",
    shortTitle: "Aizu Urushi Tamamushi-nuri Aka",
    productId: "7936229802199",
    createdAt: "2023-03-28",
    publishedAt: "2023-03-28",
    url: "https://www.wancherpen.com/products/aizu-urushi-tamamushi-nuri",
    jsonUrl: "https://www.wancherpen.com/products/aizu-urushi-tamamushi-nuri.json",
    image: "/images/library/site-original/phase529/wancher/aizu-urushi-tamamushi.svg",
    articleFile: ".planning/content-research/wancher-aizu-urushi-tamamushi-phase529.md",
    material: "ABS、Aizu Urushi、Tamamushi-nuri",
    art: "Aizu Urushi、Tamamushi-nuri",
    theme: "Urushi 层间银粉、抛光与玉虫光泽",
    nibOptions: STANDARD_NIBS,
    feedOptions: [["plastic", "Plastic", "官方 feed 菜单。"], ["ebonite-black", "Black ebonite feed", "官方 feed 菜单。"], ["ebonite-red", "Red ebonite feed", "官方 feed 菜单。"]] as const,
    marketVariants: [["default", "Default Title", "WF-UR-DREAM-TAMA", "US$400", "官方 JSON 市场变体。"]] as const,
    technique: "Tamamushi-nuri 在 Urushi 层间加入银粉，再以温湿度、透明漆和研磨控制平整度与深度。",
  },
  {
    key: "aizu-koma",
    entityId: "phase529-wancher-aizu-urushi-koma",
    slug: "wancher-dream-pen-aizu-komanuri",
    canonicalName: "Wancher Dream Pen Aizu Urushi - Koma-nuri Fountain Pen",
    title: "Aizu Urushi - Koma-nuri Fountain Pen",
    shortTitle: "Aizu Urushi Koma-nuri",
    productId: "6556759621807",
    createdAt: "2021-03-08",
    publishedAt: "2021-03-11",
    url: "https://www.wancherpen.com/products/dream-pen-aizu-komanuri",
    jsonUrl: "https://www.wancherpen.com/products/dream-pen-aizu-komanuri.json",
    image: "/images/library/site-original/phase529/wancher/aizu-urushi-koma.svg",
    articleFile: ".planning/content-research/wancher-aizu-urushi-koma-phase529.md",
    material: "POM、Aizu Urushi、Koma-nuri",
    art: "Aizu Urushi、Koma-nuri",
    theme: "黑、红、黄 Urushi 同心圆与独乐命名",
    nibOptions: STANDARD_NIBS,
    feedOptions: [["plastic", "Plastic", "官方 feed 菜单。"], ["ebonite-black", "Black ebonite feed", "官方 feed 菜单。"], ["ebonite-red", "Red ebonite feed", "官方 feed 菜单。"]] as const,
    marketVariants: [["default", "Default Title", "WF-POAU-DREAM-KOMA", "US$500", "官方 JSON 市场变体。"]] as const,
    technique: "Koma-nuri 以黑、红、黄等多色 Urushi 绘制同心图案；平滑旋转与圆弧需要反复控制。",
  },
  {
    key: "aizu-nashiji",
    entityId: "phase529-wancher-aizu-urushi-nashiji",
    slug: "wancher-dream-pen-aizu-nashiji",
    canonicalName: "Wancher Dream Pen Aizu Urushi - Metallic Nashiji Fountain Pen",
    title: "Aizu Urushi - Metallic Nashiji Fountain Pen",
    shortTitle: "Aizu Urushi Metallic Nashiji",
    productId: "6556760539311",
    createdAt: "2021-03-08",
    publishedAt: "2021-03-11",
    url: "https://www.wancherpen.com/products/dream-pen-aizu-nashiji",
    jsonUrl: "https://www.wancherpen.com/products/dream-pen-aizu-nashiji.json",
    image: "/images/library/site-original/phase529/wancher/aizu-urushi-nashiji.svg",
    articleFile: ".planning/content-research/wancher-aizu-urushi-nashiji-phase529.md",
    material: "ABS、Aizu Urushi、Nashiji",
    art: "Aizu Urushi、Nashiji",
    theme: "金粉颗粒地、梨皮质感与透明漆",
    nibOptions: NASHIJI_NIBS,
    feedOptions: [["plastic", "Plastic", "官方 feed 菜单。"], ["ebonite-upgrade", "Ebonite feed upgrade for #6 JoWo stainless steel", "官方页面限定兼容条件。"]] as const,
    marketVariants: [["default", "Default Title", "WF-POAU-DREAM-MENA", "US$400", "官方 JSON 市场变体。"]] as const,
    technique: "Metallic Nashiji 以金属金粉形成梨地颗粒，再覆透明漆形成半透明金色装饰；页面未公布用量或颗粒尺寸。",
  },
] as const;

export type Phase529Target = (typeof PHASE529_TARGETS)[number];

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; tier: CuratedSource["tier"]; sourceType?: CuratedSource["sourceType"]; independenceGroup: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType ?? "official", tier: input.tier, independenceGroup: input.independenceGroup, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase529", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase529", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作色卡或库存证明。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, scopeKey: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }] };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makePack(target: Phase529Target): CuratedEntityPack {
  const scope = `Wancher ${target.shortTitle} exact product record, Aizu Urushi technique and configuration`;
  const product = web({ key: `wancher-phase529-${target.key}-official-json`, title: `${target.title} | Wancher Official product JSON`, url: target.jsonUrl, registryKey: `wancher-official-${target.key}-phase529-json`, registryName: "Wancher Pen official product record", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase529`, summary: `官方 Shopify product JSON：product id ${target.productId}、exact handle、SKU、价格、材料、尖材、feed、供墨和包装。`, locator: "product id, title, handle, created_at, published_at, variants, prices and specifications" });
  const productPage = web({ key: `wancher-phase529-${target.key}-official-page`, title: `${target.title} | Wancher Official`, url: target.url, registryKey: `wancher-official-${target.key}-phase529-page`, registryName: "Wancher Pen official product page", tier: "primary", independenceGroup: `wancher-official-${target.key}-phase529`, summary: `官方商品页：${target.theme}、手工差异、规格、包装和护理提示。`, locator: "exact title, technique, specifications, packaging and care" });
  const collection = web({ key: `wancher-phase529-${target.key}-collection`, title: "Dream Pen Collection | Wancher Official", url: "https://www.wancherpen.com/collections/dream-pen", registryKey: `wancher-official-dream-pen-collection-phase529-${target.key}`, registryName: "Wancher Pen official Dream Pen collection", tier: "primary", independenceGroup: `wancher-official-dream-pen-collection-phase529-${target.key}`, summary: "官方 Dream Pen 集合页把 Aizu Urushi 与其他工艺商品分开导航；不替 exact 页合并型号。", locator: "collection product navigation and sibling boundary" });
  const care = web({ key: `wancher-phase529-${target.key}-care`, title: "Wancher Product Care Guide", url: "https://www.wancherpen.com/pages/product-care", registryKey: `wancher-official-product-care-phase529-${target.key}`, registryName: "Wancher Pen official product care", tier: "primary", independenceGroup: `wancher-official-product-care-phase529-${target.key}`, summary: "官方护理页提供 Urushi 与钢笔清洁边界；不补写未公布化学配方。", locator: "material care and cleaning guidance" });
  const history = web({ key: `mlit-aizu-history-phase529-${target.key}`, title: "Aizu Lacquerware | Japan Tourism Agency", url: "https://www.mlit.go.jp/tagengo-db/en/R4-00503.html", registryKey: `japan-tourism-agency-aizu-lacquerware-phase529-${target.key}`, registryName: "Japan Tourism Agency", sourceType: "official", tier: "professional_secondary", independenceGroup: `japan-tourism-agency-aizu-lacquerware-phase529-${target.key}`, summary: "日本观光厅资料说明会津漆器的历史人物、1590 年技术传播、四百年以上产业史与传统工艺地位。", locator: "Aizu lacquerware history and traditional craft designation" });
  const craft = web({ key: `aoyama-aizu-craft-phase529-${target.key}`, title: "AIZU Nuri (Lacquerware) | Traditional Crafts Aoyama Square", url: "https://kougeihin.jp/en/craft/0506/", registryKey: `traditional-crafts-aoyama-aizu-phase529-${target.key}`, registryName: "Traditional Crafts Aoyama Square", sourceType: "official", tier: "professional_secondary", independenceGroup: `traditional-crafts-aoyama-aizu-phase529-${target.key}`, summary: "传统工艺机构说明 Aizu Nuri 的漆树栽培、近江技术传播、产业化与 Maki-e 语境。", locator: "Aizu Nuri history, technology and materials" });
  const museum = web({ key: `kyoto-urushi-context-phase529-${target.key}`, title: "Preserving Lacquers through Conservation", url: "https://www.kyohaku.go.jp/old/eng/theme/floor1_6/past/1F-6_20201219.html", registryKey: `kyoto-national-museum-urushi-phase529-${target.key}`, registryName: "Kyoto National Museum", sourceType: "official", tier: "professional_secondary", independenceGroup: `kyoto-national-museum-urushi-phase529-${target.key}`, summary: "京都国立博物馆解释 Urushi 保存中的紫外线、湿度与清洁风险；只作一般护理背景。", locator: "urushi material and conservation explanation" });
  const svg = diagram(`wancher-phase529-${target.key}-svg`, `${target.shortTitle} 材料、配置与护理边界事实图`, target.image);
  const c = (key: string, predicate: string, text: string, source: CuratedSource = product, locator = "exact product record", factClass: "core" | "editorial" = "core") => claim(`${target.key}-${key}`, predicate, text, source.key, locator, scope, factClass);
  const marketText = target.marketVariants.map((item) => `${item[1]} / ${item[2]} ${item[3]}`).join("；");
  const variants: CuratedVariant[] = [
    { key: `${target.key}-handcrafted-surface`, name: "Handcrafted surface · no fixed texture standard", notes: "官方手工差异提醒；不是额外市场 SKU。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" },
    ...target.marketVariants.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[4], sourceKey: product.key, variantKind: "market_sku" as const, productCode: item[2], market: "global" })),
    ...target.nibOptions.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "nib" as const, market: "global" })),
    ...target.feedOptions.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "material" as const, market: "global" })),
  ];
  const claims: CuratedClaim[] = [
    c("identity", "model_identity", `${target.shortTitle} 是 Aizu Urushi 集合中的独立商品；官方 product id 为 ${target.productId}，exact handle 为 ${target.url.split("/products/")[1]}。`, product, "product id, exact title and handle"),
    c("technique", "decoration_technique", target.technique, productPage, "exact technique narrative"),
    c("handmade", "handmade_variation", "官方提醒每支 Urushi 钢笔为手工完成，批次、湿度和制作时间可能带来表面差异；这不等于公开编号、漆层数量或限量总数。", productPage, "handcrafted variation and batch boundary"),
    c("history", "craft_history_context", "日本观光厅以 Ashina Morinobu、Gamo Ujisato、1590 年技术传播和四百年以上产业史介绍 Aizu lacquerware；这是地方工艺背景，不是本支首发日期。", history, "Aizu lacquerware history and traditional craft designation"),
    c("craft", "craft_terminology_context", "Traditional Crafts Aoyama Square 说明 Aizu Nuri 的漆树栽培、近江技术传播、产业化与 Maki-e 语境；不替本支证明工匠、编号或漆层配方。", craft, "Aizu Nuri history, technology and materials"),
    c("material", "material", `官方规格列 ${target.material}；${target.art} 是产品材料与工艺边界，页面未公布漆层数量、批次、色值或可靠成品实测重量。`, product, "exact material and art fields"),
    c("nib", "nib", `官方尖面菜单为 ${target.nibOptions.map((item) => item[1]).join("、")}；这是配置菜单，不把菜单项扩写成额外型号。`, product, "nib option menu"),
    c("feed", "feed", `Feed 菜单为 ${target.feedOptions.map((item) => item[1]).join("、")}；兼容条件按 exact 页面记录。`, product, "feed option menu"),
    c("filling", "filling_system", "供墨为 Converter 或 Cartridge（European International Standard）；页面未授权本款作为 eyedropper 使用。", product, "filling mechanism field"),
    c("cap", "cap", "帽子带 compact air-tight cap，用于减少笔尖提前干涸；不等于完全防漏或免维护。", product, "compact air-tight cap specification"),
    c("size", "dimensions", "官方 exact 页面只显示 Size & Shape 标题，没有公开可复核的长度、直径、握径；不要从图片估算尺寸。", product, "exact page without published dimensions"),
    c("weight", "weight", "官方 exact 页面没有公开可靠成品重量；JSON 中的 200 g 字段不作为实测规格。", product, "exact page without published product weight", "editorial"),
    c("packaging", "packaging", "包装包括 Traditional Japanese Wooden Box、Pen Kimono、Instructional Materials、Converter 与 Cartridge；Aka Tamenuri 另有 Pen Pillow Set + $50 市场变体。", product, "packaging and market variant configuration", "editorial"),
    c("care", "maintenance_guidance", "漆面应避免长时间直晒、剧烈温湿变化、酒精、丙酮、漂白剂、研磨剂、硬物碰撞和整支浸水；只用柔软布轻拭，局部清洗笔尖、feed、握段与 converter。", museum, "urushi conservation and conservative pen boundary", "editorial"),
    c("price", "price_status", `检索窗口官方 JSON 市场变体为 ${marketText}；价格、税费、库存和标签会变化。`, product, "exact market price and commercial labels", "editorial"),
    c("selection", "selection_guidance", `选购或二手核对完整标题、产品编号 ${target.productId}、handle、市场 SKU、${target.material}、${target.art}、所选 nib/feed、欧规 cartridge、木盒与 pen kimono；不要从其他 Aizu 技法补字段。`, product, "exact identity and evidence boundary", "editorial"),
  ];
  const values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>> = {
    series_name: target.canonicalName,
    release_year: `独立首发年份未公布；官方 product JSON created_at 为 ${target.createdAt}、页面发布时间为 ${target.publishedAt}，只作记录语境`,
    origin_country: "Wancher Aizu Urushi／福岛会津工艺叙事；页面未逐组件公布产地分工",
    nib: target.nibOptions.map((item) => item[1]).join("、"),
    fill_system: "Converter 或 European International Standard cartridge",
    material: target.material,
    dimensions: "官方 exact product page 仅显示 Size & Shape 标题，未公布可复核尺寸",
    weight: "官方未公布可靠成品重量；JSON 200 g 字段不作为实测规格",
    price_range: `${marketText}；价格、税费和库存会变`,
    status: "商品记录标签和可购状态需按页面实时确认",
  };
  return {
    key: `phase529-wancher-${target.key}-v1`, entityId: target.entityId, expectedType: "pen", expectedSlug: target.slug, canonicalName: target.canonicalName, publicationIntent: "publish", publicationBlockers: [], markdownFile: target.articleFile, storyTitle: `${target.shortTitle}：漆艺、配置与身份边界`, primarySourceKey: product.key, depthTier: "A",
    aliases: [{ alias: target.title, language: "en", sourceKey: product.key }, { alias: target.canonicalName, language: "en", sourceKey: product.key }, { alias: `Wancher ${target.shortTitle} 日本漆艺钢笔`, language: "zh", sourceKey: product.key }],
    sources: [product, productPage, collection, care, history, craft, museum, svg],
    scopes: [{ key: scope, scopeKey: scope, productionState: "current", market: "global", nibScope: target.nibOptions.map((item) => item[1]).join("、"), materialScope: `${target.material}；未公布漆层数量、批次、色值、尺寸和实测重量。`, editionScope: "市场变体、手工纹理差异与商品标签不等于公开限量编号；库存和价格按当次页面核对。" }, { key: `phase529-${target.key}-history`, scopeKey: `phase529-${target.key}-history`, productionState: "historical", materialScope: "Independent Aizu lacquerware history context only; no product-specific authenticity certification.", editionScope: "地方工艺史不建立本支独立首发年份或二手价值。" }],
    claims,
    variants,
    spec: { brandEntityId: PHASE529_WANCHER_BRAND_ID, values, evidence: [evidence(`${target.key}-brand`, "brand_entity_id", collection.key, scope, "official collection brand boundary"), evidence(`${target.key}-series`, "series_name", product.key, scope, "exact title and handle"), evidence(`${target.key}-release`, "release_year", product.key, scope, "created_at and published_at listing context without formal launch year"), evidence(`${target.key}-origin`, "origin_country", productPage.key, scope, "official Aizu Urushi wording"), evidence(`${target.key}-nib-spec`, "nib", product.key, scope, "exact nib menu"), evidence(`${target.key}-fill-spec`, "fill_system", product.key, scope, "filling mechanism field"), evidence(`${target.key}-material-spec`, "material", product.key, scope, "exact material and art field"), evidence(`${target.key}-dimensions`, "dimensions", product.key, scope, "exact page without published dimensions"), evidence(`${target.key}-weight`, "weight", product.key, scope, "exact page without published weight"), evidence(`${target.key}-price-spec`, "price_range", product.key, scope, "exact market price rows"), evidence(`${target.key}-status`, "status", product.key, scope, "commercial labels and product record")] },
    timeline: [{ key: `${target.key}-listing`, title: `${target.shortTitle} exact product record verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: `Exact title, product id, market SKU and Aizu technique verified on ${RETRIEVED}; created_at ${target.createdAt} and published_at ${target.publishedAt} are not formal release dates.`, sourceKey: product.key }],
    media: [{ key: `${target.key}-svg`, title: `${target.shortTitle} 材料、配置与护理边界图（非产品照片）`, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
  };
}

export const phase529WancherAizuUrushiPacks: CuratedEntityPack[] = PHASE529_TARGETS.map(makePack);
