import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-05";
export const PHASE519_WANCHER_BRAND_ID = "eOfD77nOeENN";

export const PHASE519_TARGETS = [
  {
    key: "momiji",
    entityId: "phase519-wancher-zogan-momiji-green-tamamushi",
    slug: "wancher-dream-pen-zogan-momiji-green-tamamushi",
    canonicalName: "Wancher Dream Pen Zogan Momiji - Green Tamamushi-nuri",
    title: "Zogan Momiji - Green Tamamushi-nuri",
    shortTitle: "Zogan Momiji Green Tamamushi-nuri",
    productId: "9322088038615",
    createdAt: "2026-07-06",
    url: "https://www.wancherpen.com/products/zogan-momiji-green-tamamushi",
    jsonUrl: "https://www.wancherpen.com/products/zogan-momiji-green-tamamushi.json",
    image: "/images/library/site-original/phase519/wancher/zogan-momiji-green-tamamushi.svg",
    articleFile: ".planning/content-research/wancher-zogan-momiji-green-tamamushi-phase519.md",
    material: "ABS；Titanium trim；Zogan（珍珠母贝象嵌）",
    theme: "日本秋季落叶、Tamamushi 光泽与 Zogan 象嵌",
    marketVariants: [
      { key: "black-trim", name: "Black Trim", code: "WF-ZOUR-DREAM-MOTAGR", variantKind: "color" as const, price: "US$4,132" },
      { key: "silver-trim", name: "Silver Trim", code: "WF-ZOUR-DREAM-MOTAGR-SV", variantKind: "color" as const, price: "US$4,132" },
    ],
    nibOptions: [
      ["jowo", "#6 JoWo stainless steel", "官方商品页列出的钢尖菜单。"],
      ["wancher-18k", "Wancher 18K gold", "官方商品页列出的金尖菜单。"],
      ["keiryu-kodachi", "Keiryu/Kodachi", "官方商品页列出的特殊笔幅菜单。"],
    ],
    feedOptions: [
      ["plastic", "Plastic feed", "官方 feed 菜单。"],
      ["ebonite-black", "Black ebonite feed", "官方 feed 菜单；兼容性按订单确认。"],
      ["ebonite-red", "Red ebonite feed", "官方 feed 菜单；兼容性按订单确认。"],
    ],
    fill: "Converter 或 European International Standard cartridge",
    status: "商品记录标签和可购状态需按页面实时确认",
  },
  {
    key: "asagao",
    entityId: "phase519-wancher-kyoto-urushi-asagao",
    slug: "wancher-kyoto-urushi-kasane-iro-asagao",
    canonicalName: "Wancher Kyoto Urushi Kasane-iro - Asagao",
    title: "Kyoto Urushi Kasane-iro - Asagao",
    shortTitle: "Kyoto Urushi Kasane-iro Asagao",
    productId: "9324911526103",
    createdAt: "2026-07-09",
    url: "https://www.wancherpen.com/products/kyoto-urushi-asagao",
    jsonUrl: "https://www.wancherpen.com/products/kyoto-urushi-asagao.json",
    image: "/images/library/site-original/phase519/wancher/kyoto-urushi-asagao.svg",
    articleFile: ".planning/content-research/wancher-kyoto-urushi-asagao-phase519.md",
    material: "Ebonite、Urushi；Plastic/black ebonite/red ebonite feed",
    theme: "朝颜浅蓝与平安宫廷 Kasane no Irome 层色文化",
    marketVariants: [
      { key: "no-clip", name: "No Clip", code: "WF-KYUR-DR-KAS-LB", variantKind: "variant" as const, price: "US$4,132" },
      { key: "chrome-clip", name: "Chrome Clip", code: "WF-KYUR-DR-KAS-LB-CHCL", variantKind: "variant" as const, price: "US$4,339" },
      { key: "gold-clip", name: "Gold Clip", code: "WF-KYUR-DR-KAS-LB-GDCL", variantKind: "variant" as const, price: "US$4,339" },
    ],
    nibOptions: [
      ["jowo", "#6 JoWo stainless steel", "官方商品页列出的钢尖菜单。"],
      ["wancher-18k", "Wancher 18K gold", "官方商品页列出的金尖菜单。"],
      ["keiryu", "Keiryu", "官方商品页列出的特殊笔幅菜单。"],
      ["keiryu-kodachi", "Keiryu Kodachi", "官方商品页列出的特殊笔幅菜单。"],
      ["shogun-18k", "Shogun 18K", "官方商品页列出的 Shogun 18K 菜单。"],
    ],
    feedOptions: [
      ["plastic", "Plastic feed", "官方 feed 菜单。"],
      ["ebonite-black", "Black ebonite feed", "官方注明 ebonite feed 只适用于 JoWo nib。"],
      ["ebonite-red", "Red ebonite feed", "官方注明 ebonite feed 只适用于 JoWo nib。"],
    ],
    fill: "Converter 或 European International Standard cartridge",
    status: "商品记录标签和可购状态需按页面实时确认",
  },
  {
    key: "tsuikin",
    entityId: "phase388-pen-wancher-tsuikin-kanhizakura",
    slug: "wancher-tsuikin-kanhizakura",
    canonicalName: "Wancher Dream Pen Tsuikin – Kanhizakura",
    title: "Dream Pen Tsuikin Kanhizakura",
    shortTitle: "Dream Pen Tsuikin Kanhizakura",
    productId: "9327396454615",
    createdAt: "2026-07-14",
    url: "https://www.wancherpen.com/products/tsuikin-kanhizakuras",
    jsonUrl: "https://www.wancherpen.com/products/tsuikin-kanhizakuras.json",
    image: "/images/library/site-original/phase519/wancher/tsuikin-kanhizakura.svg",
    articleFile: ".planning/content-research/wancher-tsuikin-kanhizakura-phase519.md",
    material: "Ebonite、Red Urushi、Tsuikin Urushi；Plastic/black ebonite/red ebonite feed",
    theme: "冲绳 Ryukyu Kanhizakura 与堆锦工艺",
    marketVariants: [
      { key: "default", name: "Default Title", code: "WF-TSOU-SAK-RD", variantKind: "market_sku" as const, price: "US$6,886" },
    ],
    nibOptions: [
      ["jowo", "#6 JoWo stainless steel", "官方商品页列出的钢尖菜单。"],
      ["wancher-18k", "Wancher 18K gold", "官方商品页列出的金尖菜单。"],
      ["shogun-18k", "Shogun 18K", "官方商品页列出的 Shogun 18K 菜单。"],
    ],
    feedOptions: [
      ["plastic", "Plastic feed", "官方 feed 菜单。"],
      ["ebonite-black", "Black ebonite feed", "官方 feed 菜单；兼容性按订单确认。"],
      ["ebonite-red", "Red ebonite feed", "官方 feed 菜单；兼容性按订单确认。"],
    ],
    fill: "Converter 或 European International Standard cartridge",
    status: "商品记录标签和可购状态需按页面实时确认",
  },
  {
    key: "swan-black",
    entityId: "phase519-wancher-zogan-swan-urushi-black",
    slug: "wancher-dream-pen-zogan-swan-urushi-black",
    canonicalName: "Wancher Dream Pen Zogan Swan - Urushi Black",
    title: "Dream Pen Zogan Swan - Urushi Black",
    shortTitle: "Zogan Swan Urushi Black",
    productId: "9339187134679",
    createdAt: "2026-07-22",
    url: "https://www.wancherpen.com/products/wancher-fountain-pen-zogan-swan-urushi-black",
    jsonUrl: "https://www.wancherpen.com/products/wancher-fountain-pen-zogan-swan-urushi-black.json",
    image: "/images/library/site-original/phase519/wancher/zogan-swan-urushi-black.svg",
    articleFile: ".planning/content-research/wancher-zogan-swan-urushi-black-phase519.md",
    material: "ABS、Urushi、Zogan（珍珠母贝象嵌）；Ebonite feed 仅适用于 JoWo #6，另有 Plastic feed",
    theme: "黑色 Urushi 夜湖与珍珠母贝天鹅",
    marketVariants: [
      { key: "default", name: "Default Title", code: "WF-AIUR-DR-ZOBK-HKU", variantKind: "market_sku" as const, price: "US$4,132" },
    ],
    nibOptions: [
      ["jowo", "#6 JoWo stainless steel", "官方商品页列出的钢尖菜单。"],
      ["keiryu", "Keiryu", "官方商品页列出的特殊笔幅菜单。"],
      ["keiryu-kodachi", "Keiryu Kodachi", "官方商品页列出的特殊笔幅菜单。"],
      ["shogun-18k", "Shogun 18K", "官方商品页列出的 Shogun 18K 菜单。"],
    ],
    feedOptions: [
      ["ebonite", "Ebonite feed", "官方注明仅适用于 JoWo #6。"],
      ["plastic", "Plastic feed", "官方 feed 菜单。"],
    ],
    fill: "Converter 与 European International Standard cartridge",
    status: "商品记录标签和可购状态需按页面实时确认",
  },
] as const;

export type Phase519Target = (typeof PHASE519_TARGETS)[number];

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
    registryKey: "fountain-pen-graph-editorial-phase519",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase519",
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

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  scopeKey: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
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

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies };
}

function makePack(target: Phase519Target): CuratedEntityPack {
  const scope = `Wancher ${target.shortTitle} exact product record, material, configuration and maintenance`;
  const product = web({
    key: `wancher-phase519-${target.key}-official-json`,
    title: `${target.title} | Wancher Official product JSON`,
    url: target.jsonUrl,
    registryKey: `wancher-official-${target.key}-phase519`,
    registryName: "Wancher Pen official product record",
    tier: "primary",
    independenceGroup: `wancher-official-${target.key}-phase519`,
    summary: `官方 Shopify product JSON：product id ${target.productId}、exact handle、市场变体、价格、材料、尖材、feed、供墨和包装字段。`,
    locator: "product id, title, handle, created_at, variants, prices, options and specifications",
  });
  const productPage = web({
    key: `wancher-phase519-${target.key}-official-page`,
    title: `${target.title} | Wancher Official`,
    url: target.url,
    registryKey: `wancher-official-${target.key}-page-phase519`,
    registryName: "Wancher Pen official product page",
    tier: "primary",
    independenceGroup: `wancher-official-${target.key}-phase519`,
    summary: `官方商品页：${target.theme}、手工差异、配置菜单和护理边界。`,
    locator: "exact title, craft narrative, specifications, compatibility, packaging and commercial labels",
  });
  const collection = web({
    key: `wancher-phase519-${target.key}-collection`,
    title: "Dream Pen Fountain Pen Collection | Wancher Official",
    url: "https://www.wancherpen.com/collections/dream-pen",
    registryKey: `wancher-official-dream-pen-collection-phase519-${target.key}`,
    registryName: "Wancher Pen official Dream Pen collection",
    tier: "primary",
    independenceGroup: `wancher-official-dream-pen-collection-phase519-${target.key}`,
    summary: "官方集合页用于确认具体产品卡与 Dream Pen 导航边界；不同图案、材料和颜色仍按 exact product 分开。",
    locator: "Dream Pen collection product card and navigation",
  });
  const nibGuide = web({
    key: `wancher-phase519-${target.key}-nib-guide`,
    title: "Wancher Fountain Pen Nib Guide",
    url: "https://www.wancherpen.com/pages/nib-guide",
    registryKey: `wancher-official-nib-guide-phase519-${target.key}`,
    registryName: "Wancher Pen official nib guide",
    tier: "primary",
    independenceGroup: `wancher-official-nib-guide-phase519-${target.key}`,
    summary: "官方指南用于理解 JoWo、Wancher 18K、Keiryu/Kodachi 和 Shogun 菜单；不替 exact page 增加未列配置。",
    locator: "nib family and compatibility guidance",
  });
  const care = web({
    key: `wancher-phase519-${target.key}-care`,
    title: "Wancher Product Care Guide",
    url: "https://www.wancherpen.com/pages/product-care",
    registryKey: `wancher-official-product-care-phase519-${target.key}`,
    registryName: "Wancher Pen official product care",
    tier: "primary",
    independenceGroup: `wancher-official-product-care-phase519-${target.key}`,
    summary: "官方护理页提供漆面、装饰面和钢笔清洁的分类边界；本包不补写品牌没有公布的化学配方。",
    locator: "material care and cleaning guidance",
  });
  const context = target.key === "asagao"
    ? web({ key: "phase519-kasane-no-irome", title: "Kimono Combinations: The Seasons in Layers of Silk", url: "https://www.gov-online.go.jp/eng/publicity/book/hlj/html/202010/202010_06_en.html", registryKey: "japan-government-kasane-no-irome-phase519", registryName: "Government of Japan", tier: "professional_secondary", independenceGroup: "japan-government-kasane-no-irome-phase519", summary: "日本政府文化说明解释平安时期多层服饰的 Kasane no Irome 及季节配色语境；只作颜色文化背景。", locator: "Heian court dress and kasane no irome layered-color explanation" })
    : target.key === "tsuikin"
      ? web({ key: "phase519-okinawa-tsuikin", title: "沖縄の伝統工芸（堆錦）", url: "https://www.pref.okinawa.lg.jp/kyoiku/kodomo/1002688/1002692.html", registryKey: "okinawa-prefecture-tsuikin-phase519", registryName: "Okinawa Prefecture", tier: "professional_secondary", independenceGroup: "okinawa-prefecture-tsuikin-phase519", summary: "冲绳县官方介绍琉球漆器与堆锦加饰法；只作工艺文化背景，不替本 SKU 证明工匠或配方。", locator: "Ryukyu lacquerware and Tsuikin craft explanation" })
      : web({ key: "phase519-kyoto-mother-of-pearl", title: "From Land and from Sea: East Asian Lacquers with Mother-of-Pearl Inlay", url: "https://www.kyohaku.go.jp/old/eng/theme/floor1_6/past/shikko_20160726.html", registryKey: "kyoto-national-museum-mother-of-pearl-phase519", registryName: "Kyoto National Museum", tier: "professional_secondary", independenceGroup: "kyoto-national-museum-mother-of-pearl-phase519", summary: "京都国立博物馆解释母贝珍珠层的切割、粘接与漆面嵌入语境；只作 Zogan/螺钿背景。", locator: "mother-of-pearl material and inlay technique explanation" });
  const svg = diagram(`wancher-phase519-${target.key}-svg`, `${target.shortTitle} 材料、配置与护理边界事实图`, target.image);
  const c = (key: string, predicate: string, text: string, source: CuratedSource = product, locator = "exact product record", factClass: "core" | "editorial" = "core") => claim(`${target.key}-${key}`, predicate, text, source.key, locator, scope, factClass);
  const marketText = target.marketVariants.map((item) => `${item.name}（${item.code}）${item.price}`).join("；");
  const isTsuikin = target.key === "tsuikin";
  const identityText = isTsuikin
    ? `当前英文 product JSON 以 id ${target.productId}、handle ${target.url.split("/products/")[1]} 记录 Kanhizakura；它与已有同名日本站记录是同一型号的更新官方商品记录，本包刷新来源和规格，不新造重复身份。`
    : `${target.shortTitle} 是 Dream Pen 集合中的独立商品；官方 product id 为 ${target.productId}，exact handle 为 ${target.url.split("/products/")[1]}。`;
  const claims: CuratedClaim[] = [
    c("identity", "model_identity", identityText, product, "product id, exact title and handle"),
    c("theme", "design_theme", `${target.theme}；主题名称不替代实物颜色、纹理或漆层记录。`, productPage, "exact product story and named design theme"),
    c("material", "material", `官方规格列材料为 ${target.material}；页面未公布厚度、工匠、批次或逐组件产地。`, product, "exact material and specification fields"),
    c("craft-context", "craft_terminology_context", target.key === "tsuikin" ? "冲绳县资料把堆锦列为琉球漆器的加饰方法；这只提供术语背景，不替本支笔证明制作参数。" : target.key === "asagao" ? "日本政府资料说明 Kasane no Irome 是平安宫廷服饰的层色组合文化；这只解释颜色叙事，不证明固定色值。" : "京都国立博物馆说明母贝螺钿使用贝壳内侧珍珠层并嵌入漆面；这只解释 Zogan/螺钿语境，不证明本支笔的贝种或供应链。", context, "independent craft-context source", "core"),
    c("nib", "nib", `官方 exact page 列出 ${target.nibOptions.map((item) => item[1]).join("、")}；这是配置菜单，不把没有展开的尖/feed 组合写成 Shopify 市场 SKU。`, product, "nib option menu"),
    c("feed", "feed", `Feed 菜单包括 ${target.feedOptions.map((item) => item[1]).join("、")}；兼容性以 exact 页面注明的边界为准。`, product, "feed option menu and compatibility wording"),
    c("filling", "filling_system", `供墨为 ${target.fill}；页面未授权本款作为 eyedropper 使用。`, product, "filling mechanism field"),
    c("cap", "cap", "商品规格写 compact air-tight cap，用于减少笔尖提前干涸；不等于完全防漏或免维护。", product, "compact air-tight cap specification"),
    c("packaging", "packaging", "包装列 Traditional Japanese Wooden Box、Pen Kimono、说明材料、Certificate、converter 与 cartridge；附件按当次 exact 页面核对。", product, "packaging list", "editorial"),
    c("price", "price_status", `检索窗口官方 JSON 市场变体为 ${marketText}；价格、税费、库存和商品标签会变化。`, product, "exact variant price rows and commercial labels", "editorial"),
    c("care", "maintenance_guidance", target.key === "swan-black" ? "母贝应避免跌落、点压和长时间直晒；Urushi、ABS 与 feed 只用柔软布和局部清洗，不用酒精、研磨剂或超声波。" : "漆面、象嵌或堆锦应避免长时间浸水、强热、骤冷骤热、硬物摩擦、酒精和研磨剂；清洗时只处理笔尖、feed、握段与 converter。", care, "official care page and conservative surface boundary", "editorial"),
    c("selection", "selection_guidance", `选购或二手核对完整标题、产品编号 ${target.productId}、handle、${target.marketVariants.map((item) => item.code).join("/、")}、材料、所选 nib/feed、欧规 cartridge、包装和当支实物照片；不要从同系列其他商品补未公布字段。`, product, "exact identity, market variants and evidence boundary", "editorial"),
  ];
  const variants: CuratedVariant[] = [
    { key: `${target.key}-handcrafted-surface`, name: "Handcrafted surface · no fixed colour or texture standard", notes: "官方手工差异提醒；不是限量编号或额外市场 SKU。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" },
    ...target.marketVariants.map((item) => ({ key: `${target.key}-${item.key}`, name: item.name, notes: `官方 exact JSON 市场变体，SKU ${item.code}；价格以当次记录为准。`, sourceKey: product.key, variantKind: item.variantKind, productCode: item.code, market: "global" })),
    ...target.nibOptions.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "nib" as const, market: "global" })),
    ...target.feedOptions.map((item) => ({ key: `${target.key}-${item[0]}`, name: item[1], notes: item[2], sourceKey: product.key, variantKind: "material" as const, market: "global" })),
  ];
  const values = {
    series_name: target.canonicalName,
    release_year: `独立首发年份未公布；官方 product JSON created_at 为 ${target.createdAt}，只作商品记录时间`,
    origin_country: "Wancher 日本品牌与日本/冲绳工艺叙事；页面未逐组件公布产地分工",
    nib: target.nibOptions.map((item) => item[1]).join("、"),
    fill_system: target.fill,
    material: target.material,
    dimensions: "官方 exact product page 未公布长度、直径、握径",
    weight: "官方未公布可靠成品重量；JSON 200 g 字段不作为实测规格",
    price_range: `${marketText}；价格、税费和库存会变`,
    status: target.status,
  };
  const pack: CuratedEntityPack = {
    key: `phase519-wancher-${target.key}-v1`,
    entityId: target.entityId,
    expectedType: "pen",
    expectedSlug: target.slug,
    canonicalName: target.canonicalName,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: target.articleFile,
    storyTitle: `${target.shortTitle}：工艺、配置与身份边界`,
    primarySourceKey: product.key,
    depthTier: "A",
    aliases: [
      { alias: target.title, language: "en", sourceKey: product.key },
      { alias: target.canonicalName, language: "en", sourceKey: product.key },
      { alias: `Wancher ${target.shortTitle} 钢笔`, language: "zh", sourceKey: product.key },
    ],
    sources: [product, productPage, collection, nibGuide, care, context, svg],
    scopes: [
      { key: scope, scopeKey: scope, productionState: "current", market: "global", nibScope: `${target.nibOptions.map((item) => item[1]).join("、")}；具体 feed/尖面兼容按 exact page。`, materialScope: `${target.material}；未公布厚度、批次、尺寸和成品实测重量。`, editionScope: "市场变体与天然/手工差异不是公开限量编号；库存和标签按当次页面核对。" },
      { key: `phase519-${target.key}-context`, scopeKey: `phase519-${target.key}-context`, productionState: "historical", materialScope: "Independent craft terminology context only; no product-specific authenticity certification.", editionScope: "工艺和颜色叙事不建立独立首发年份或二手价值。" },
    ],
    claims,
    variants,
    spec: {
      brandEntityId: PHASE519_WANCHER_BRAND_ID,
      values,
      evidence: [
        evidence(`${target.key}-brand`, "brand_entity_id", collection.key, scope, "Dream Pen collection brand boundary"),
        evidence(`${target.key}-series`, "series_name", product.key, scope, "exact title and handle"),
        evidence(`${target.key}-release`, "release_year", product.key, scope, "created_at listing context without formal launch year"),
        evidence(`${target.key}-origin`, "origin_country", productPage.key, scope, "official craft/origin wording"),
        evidence(`${target.key}-nib-spec`, "nib", product.key, scope, "exact nib menu"),
        evidence(`${target.key}-fill-spec`, "fill_system", product.key, scope, "filling mechanism field"),
        evidence(`${target.key}-material-spec`, "material", product.key, scope, "exact material fields"),
        evidence(`${target.key}-dimensions`, "dimensions", product.key, scope, "exact page without published dimensions"),
        evidence(`${target.key}-weight`, "weight", product.key, scope, "exact page without published product weight"),
        evidence(`${target.key}-price-spec`, "price_range", product.key, scope, "exact market variant price rows"),
        evidence(`${target.key}-status`, "status", product.key, scope, "commercial labels and product record"),
      ],
    },
    timeline: [{ key: `${target.key}-listing`, title: `${target.shortTitle} exact product record verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: `Exact title, product id, market variants and material/configuration fields verified on ${RETRIEVED}; this is not a formal release date.`, sourceKey: product.key }],
    conflicts: [
      { key: `${target.key}-status-window`, fieldKey: "status", scopeKey: scope, conflictKind: "field", status: "resolved", resolutionNote: "商品标签与渲染页状态会随库存和缓存更新；内容保留检索窗口语境，不推断长期可购买或永久停产。", members: [{ citationKey: `${target.key}-status`, assertedValue: "exact JSON commercial labels" }] },
      { key: `${target.key}-not-release-year`, fieldKey: "release_year", scopeKey: scope, conflictKind: "field", status: "resolved", resolutionNote: "created_at 与工艺故事不足以确定正式首发日；release_year 只保留商品记录时间。", members: [{ citationKey: `${target.key}-release`, assertedValue: `created_at ${target.createdAt} is not a formal launch date` }] },
      ...(isTsuikin ? [{ key: "tsuikin-handle-refresh", fieldKey: "series_name", scopeKey: scope, conflictKind: "identity" as const, status: "resolved" as const, resolutionNote: "当前英文 exact handle 与旧日本站短 handle 指向同名 Kanhizakura 型号；保留已有 canonical entity 并刷新到新的官方 product id，不新造重复实体。", members: [{ citationKey: "tsuikin-series", assertedValue: "9327396454615 / tsuikin-kanhizakuras" }, { citationKey: "tsuikin-brand", assertedValue: "existing canonical entity wancher-tsuikin-kanhizakura" }] }] : []),
    ],
    media: [{ key: `${target.key}-svg`, title: `${target.shortTitle} 材料、配置与护理边界图（非产品照片）`, sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
  };
  return pack;
}

export const phase519WancherDreamPenPacks: CuratedEntityPack[] = PHASE519_TARGETS.map(makePack);
