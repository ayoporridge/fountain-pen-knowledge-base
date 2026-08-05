import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-05";
export const PHASE514_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE514_WANCHER_YUUKARI_ID = "phase514-wancher-kiei-yuukari-hekitame";
export const PHASE514_WANCHER_YUUKARI_SLUG = "wancher-dream-pen-kiei-urushi-yuukari-hekitame";
export const PHASE514_WANCHER_YUUKARI_PRODUCT_URL = "https://www.wancherpen.com/products/kiei-urushi-yuukari-hekitame.json";
const MODEL_SCOPE = "Wancher Dream Pen Kiei Urushi Yuukari Hekitame exact SKU, identity conflict, materials, option boundary and care";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; independenceGroup: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.independenceGroup, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase514", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase514", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作颜色证明。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey: MODEL_SCOPE, locator }] };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string, qualifies = true): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies };
}

const product = web({
  key: "wancher-kiei-yuukari-hekitame-official-json",
  title: "Kiei Urushi - Yuukari Hekitame | Wancher Official product JSON",
  url: PHASE514_WANCHER_YUUKARI_PRODUCT_URL,
  registryKey: "wancher-official-kiei-yuukari-hekitame-phase514",
  registryName: "Wancher Pen official product record",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-kiei-yuukari-hekitame-phase514",
  summary: "官方 Shopify product JSON：exact title、handle、产品编号 7636323991767、SKU WF-ATUR-EBDP-HEKI2、US$600、Sold out、Ebonite/Urushi/Eucalyptus polyanthemos leaf、两种 Wancher 18K 尖面和 Standard Plastic feed。",
  locator: "product id, title, handle, variant SKU, price/status, materials, art, filling, nib, feed and cap fields",
});

const productPage = web({
  key: "wancher-kiei-yuukari-hekitame-official-page",
  title: "Kiei Urushi - Yuukari Hekitame Fountain Pen | Wancher Official",
  url: "https://www.wancherpen.com/products/kiei-urushi-yuukari-hekitame",
  registryKey: "wancher-official-kiei-yuukari-hekitame-page-phase514",
  registryName: "Wancher Pen official product page",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-kiei-yuukari-hekitame-phase514",
  summary: "官方 exact handle 页面和集合导航用于确认可访问路径；2026-08-05 渲染 HTML 出现旧模板文字，因此具体字段以同 handle 的官方 JSON 记录为准。",
  locator: "exact product handle and rendered-page identity conflict note",
});

const collection = web({
  key: "wancher-kiei-collection-phase514",
  title: "Kiei Urushi Fountain Pen Collection | Wancher Official",
  url: "https://www.wancherpen.com/collections/kiei-urushi",
  registryKey: "wancher-official-kiei-collection-phase514",
  registryName: "Wancher Pen official collection",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-kiei-collection-phase514",
  summary: "官方集合页把 Yuukari Hekitame 与 Camellia、Holly Olive、Yozakura 等 Kiei sibling 分开列出，支持具体型号身份边界。",
  locator: "Kiei Urushi collection product navigation",
});

const artisan = web({
  key: "wancher-artisan-collection-phase514",
  title: "Artisan Pens Collection | Wancher Official",
  url: "https://www.wancherpen.com/collections/artisan-pens-collection",
  registryKey: "wancher-official-artisan-collection-phase514",
  registryName: "Wancher Pen official artisan collection",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-artisan-collection-phase514",
  summary: "官方 Artisan collection 说明工匠作品多为一件或极少数、可能不会再次制作；只用于稀缺性和回归边界，不改写为公开编号。",
  locator: "artisan collection one-or-few-piece and possible non-return wording",
});

const nibGuide = web({
  key: "wancher-nib-guide-phase514",
  title: "Wancher Fountain Pen Nib Guide",
  url: "https://www.wancherpen.com/pages/nib-guide",
  registryKey: "wancher-official-nib-guide-phase514",
  registryName: "Wancher Pen official nib guide",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-nib-guide-phase514",
  summary: "官方指南提供 Wancher 18K gold 与 rhodium-plated 选项的笔尖语境；不把本条 Standard Plastic feed 扩写成其他 Kiei 型号的 ebonite feed。",
  locator: "Wancher 18K nib and feed compatibility notes",
});

const care = web({
  key: "wancher-product-care-phase514",
  title: "Wancher Product Care Guide",
  url: "https://www.wancherpen.com/pages/product-care",
  registryKey: "wancher-official-product-care-phase514",
  registryName: "Wancher Pen official product care",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-product-care-phase514",
  summary: "官方护理页说明 Urushi 与 Ebonite 的避光、浸泡、化学清洁和冲击限制。",
  locator: "Urushi/Maki-e/Raden and Ebonite material-care sections",
});

const lacquer = web({
  key: "kyoto-museums-lacquer-phase514",
  title: "A bit of knowledge about lacquer | Kyoto Museums Association",
  url: "https://kyoto-museums.city.kyoto.lg.jp/en/feature-column/lacquer/",
  registryKey: "kyoto-museums-association-lacquer-phase514",
  registryName: "Kyoto Museums Association",
  sourceType: "official",
  tier: "professional_secondary",
  independenceGroup: "kyoto-museums-association-lacquer-phase514",
  summary: "京都市博物馆协会资料提供天然漆、京都漆器和金银粉装饰背景，只解释工艺词，不替本 SKU 证明叶片处理、漆层或配方。",
  locator: "lacquer material and decorative powder context",
});

const makie = web({
  key: "kyoto-national-museum-makie-phase514",
  title: "Makie Lacquers of the Edo Period | Kyoto National Museum",
  url: "https://www.kyohaku.go.jp/old/eng/theme/floor1_6/past/shikko_20160830.html",
  registryKey: "kyoto-national-museum-makie-phase514",
  registryName: "Kyoto National Museum",
  sourceType: "official",
  tier: "professional_secondary",
  independenceGroup: "kyoto-national-museum-makie-phase514",
  summary: "京都国立博物馆资料解释蒔絵用漆的黏性固定金属粉末，只作独立漆艺语境。",
  locator: "Makie technique and lacquer exhibition context",
});

const svg = diagram("wancher-kiei-yuukari-hekitame-svg", "Kiei Yuukari Hekitame 材料、笔尖与供墨边界事实图", "/images/library/site-original/phase514/wancher/kiei-yuukari-hekitame.svg");

const pack: CuratedEntityPack = {
  key: "phase514-wancher-kiei-yuukari-hekitame-v1",
  entityId: PHASE514_WANCHER_YUUKARI_ID,
  expectedType: "pen",
  expectedSlug: PHASE514_WANCHER_YUUKARI_SLUG,
  canonicalName: "Wancher Dream Pen Kiei Urushi Yuukari Hekitame",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-kiei-urushi-yuukari-hekitame-phase514.md",
  storyTitle: "Wancher Kiei Yuukari Hekitame：桉叶、天然漆与工匠 SKU 的身份边界",
  primarySourceKey: product.key,
  depthTier: "A",
  aliases: [
    { alias: "Kiei Urushi - Yuukari Hekitame", language: "en", sourceKey: product.key },
    { alias: "Dream Pen Kiei Yuukari Hekitame", language: "en", sourceKey: product.key },
    { alias: "Wancher 季映漆 桉叶 Hekitame", language: "zh", sourceKey: product.key },
  ],
  sources: [product, productPage, collection, artisan, nibGuide, care, lacquer, makie, svg],
  scopes: [
    { key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, productionState: "current", market: "global", nibScope: "Exact product JSON lists Wancher 18K gold and Wancher 18K gold - Rhodium-plated; actual finish must be confirmed per order.", materialScope: "Ebonite, Urushi and Eucalyptus polyanthemos leaf as listed for this exact record; leaf count, layers, formula, dimensions and weight unpublished.", editionScope: "One artisan listing with a single Default Title marketplace variant and SKU WF-ATUR-EBDP-HEKI2; one-or-few-piece wording is a commercial boundary, not a public edition number." },
    { key: "phase514-yuukari-context", scopeKey: "phase514-yuukari-context", productionState: "historical", materialScope: "Independent lacquer and Maki-e terminology only; no product-specific certification.", editionScope: "Artisan collection context does not establish this SKU's launch year or permanent discontinuation." },
  ],
  claims: [
    claim("identity", "model_identity", "Yuukari Hekitame 是 Kiei Urushi 集合中独立列出的具体工匠 SKU。官方 JSON 的 product id 为 7636323991767，handle 为 kiei-urushi-yuukari-hekitame，唯一变体 SKU 为 WF-ATUR-EBDP-HEKI2。", product.key, "product id, title, handle and variant SKU fields"),
    claim("identity-conflict", "identity_resolution", "同一 handle 的渲染 HTML 在检索窗口曾出现 Holly Olive Akatame 旧模板文字；本条以同 handle 的官方 JSON、集合导航、图片文件名和 SKU 作为精确身份依据，不继承旧模板。", productPage.key, "rendered-page conflict resolved against exact JSON record"),
    claim("artisan-boundary", "edition_boundary", "官方 Artisan collection 说明工匠作品通常只有一件或极少数，可能不会再次制作；这不等于公开限量编号、首发年份或永久停产证明。", artisan.key, "artisan one-or-few-piece and possible non-return wording"),
    claim("art", "decoration_technique", "产品 JSON 的 Art 字段为 Kiei Urushi；本条只确认品牌把它归入季映塗工艺语境，不臆测漆层数量、金粉重量、叶片数量或工时。", product.key, "Art: Kiei Urushi and exact product description"),
    claim("leaf", "material", "规格明确列 Ebonite、Urushi、Eucalyptus polyanthemos leaf。该物种名是本 SKU 页面公布的叶材，不能改写成 Holly Olive、Camellia 或 Yozakura。", product.key, "Material: Ebonite, Urushi, Eucalyptus polyanthemos leaf"),
    claim("variation", "variation_boundary", "天然叶片的叶脉、边缘、大小、色泽和贴合位置会逐支不同；实物照片应作为具体样本，不是所有 Yuukari 的标准色卡。", product.key, "artisan natural-material and exact design boundary", "editorial"),
    claim("filling", "filling_system", "供墨为 Converter 或 Cartridge（European International Standard）；官方页面没有授权本 SKU 作为 eyedropper 使用。", product.key, "Filling mechanism field"),
    claim("nib", "nib", "笔尖选项为 Wancher 18K gold 与 Wancher 18K gold - Rhodium-plated；这是两种金尖表面版本，不应改写成 JoWo 钢尖。", product.key, "Nib field"),
    claim("feed", "feed", "Feed 明确为 Standard Plastic；这与其他 Kiei sibling 页面可能出现的 black/red ebonite feed 不同，是本 SKU 的身份和下单核验字段。", product.key, "Feed: Standard Plastic"),
    claim("cap", "cap", "商品规格写 compact air-tight cap，用于减少墨水干涸；这不是完全防漏或无需维护的承诺。", product.key, "compact air-tight cap specification"),
    claim("commercial", "price_status", "检索窗口官方 JSON 变体价格为 US$600，集合/商品状态显示 Sold out；价格、税费、库存和是否重制会变。", product.key, "variant price and sold-out marker", "editorial"),
    claim("packaging", "packaging_boundary", "包装、证书和配件应以同一 exact listing 或订单当次清单为准；没有在 JSON 明确列出的附件不从其他 Kiei 型号补齐。", product.key, "exact record packaging boundary", "editorial"),
    claim("context", "craft_terminology_context", "京都博物馆资料提供天然漆和金银粉背景，京都国立博物馆解释蒔絵术语；两者只用于独立语境，不替 Yuukari 证明工艺参数。", lacquer.key, "independent lacquer and maki-e context"),
    claim("care-urushi", "maintenance_guidance", "官方建议 Urushi 避直晒、干燥、极端天气与强冲击；出现裂漆、起泡、脱层或叶片翘起时应停止使用并请专业人员判断。", care.key, "Urushi, Maki-e and Raden care"),
    claim("care-ebonite", "maintenance_guidance", "官方建议 Ebonite 水中不超过一分钟，不用化学清洁剂，避免直晒并以微湿软布清洁；不要用酒精、丙酮、漂白剂、研磨剂或超声波处理。", care.key, "Ebonite care"),
    claim("selection", "selection_guidance", "选购或二手核对 exact title、handle、产品 id 7636323991767、SKU WF-ATUR-EBDP-HEKI2、Eucalyptus polyanthemos leaf、两种 18K 尖面、Standard Plastic feed、证书和实物照片；不要用 Holly Olive 页面补字段。", product.key, "exact identity and evidence boundary", "editorial"),
  ],
  variants: [
    { key: "yuukari-market-default", name: "Default Title / artisan listing", notes: "官方 JSON 的唯一 Shopify 变体；不是可选颜色，也不证明固定发行数量。", sourceKey: product.key, variantKind: "edition_group", market: "global" },
    { key: "yuukari-market-sku", name: "WF-ATUR-EBDP-HEKI2", notes: "官方 JSON 唯一变体 SKU，用于身份和二手核对。", sourceKey: product.key, variantKind: "market_sku", market: "global" },
    { key: "yuukari-nib-18k-gold", name: "Wancher 18K gold", notes: "官方 exact record 的笔尖表面选项。", sourceKey: product.key, variantKind: "nib", market: "global" },
    { key: "yuukari-nib-18k-rhodium", name: "Wancher 18K gold - Rhodium-plated", notes: "官方 exact record 的镀铑 18K 选项；不要改写成钢尖。", sourceKey: product.key, variantKind: "nib", market: "global" },
    { key: "yuukari-feed-standard-plastic", name: "Standard Plastic feed", notes: "官方 exact record 的 feed 字段；不要继承其他 sibling 的 ebonite feed。", sourceKey: product.key, variantKind: "material", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE514_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Dream Pen Kiei Urushi Yuukari Hekitame",
      release_year: "独立上市年份未公布；2026-08-05 为官方 product JSON 核验窗口",
      origin_country: "日本品牌商品；官方 Artisan 语境未逐组件公布产地分工",
      nib: "Wancher 18K gold 或 Wancher 18K gold - Rhodium-plated",
      fill_system: "Converter 或 European International Standard cartridge",
      material: "Ebonite、Urushi、Eucalyptus polyanthemos leaf；页面未公布叶片数量、漆层和金粉用量",
      dimensions: "官方 exact product JSON 未公布本 SKU 的长度、直径",
      weight: "官方 exact product JSON 未公布",
      price_range: "官方 product JSON 变体标示 US$600；价格、税费和库存会变",
      status: "检索窗口显示 Sold out；Artisan 说明称通常一件或极少数，不据此推断公开编号或永久停产",
    },
    evidence: [
      evidence("yuukari-brand", "brand_entity_id", collection.key, "Kiei collection brand boundary"),
      evidence("yuukari-series", "series_name", product.key, "exact title and collection context"),
      evidence("yuukari-page-conflict", "series_name", productPage.key, "rendered HTML stale-template conflict; does not qualify over exact JSON", false),
      evidence("yuukari-release", "release_year", product.key, "current listing without independent launch year"),
      evidence("yuukari-origin", "origin_country", artisan.key, "Artisan collection wording without component-level origin split"),
      evidence("yuukari-nib-spec", "nib", product.key, "exact JSON nib options"),
      evidence("yuukari-fill-spec", "fill_system", product.key, "exact JSON filling mechanism"),
      evidence("yuukari-material-spec", "material", product.key, "exact JSON material fields"),
      evidence("yuukari-dimensions", "dimensions", product.key, "exact JSON without published dimensions"),
      evidence("yuukari-weight", "weight", product.key, "exact JSON without published weight"),
      evidence("yuukari-price-spec", "price_range", product.key, "exact JSON variant price"),
      evidence("yuukari-status", "status", product.key, "exact JSON/collection commercial status"),
    ],
  },
  timeline: [{ key: "yuukari-current-listing", title: "Yuukari Hekitame exact product record verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Exact title, handle, product id, SKU, materials and commercial status were verified on the retrieval date; this is not a release-year claim.", sourceKey: product.key }],
  conflicts: [
    { key: "yuukari-rendered-template-conflict", fieldKey: "series_name", scopeKey: MODEL_SCOPE, conflictKind: "field", status: "resolved", resolutionNote: "同一 exact handle 的渲染 HTML 曾显示 Holly Olive Akatame 旧模板文字；官方 JSON 的产品 id、handle、SKU、材料和集合导航构成更精确的身份证据，因此保留 Yuukari Hekitame，不继承 Holly Olive 字段。", members: [{ citationKey: "yuukari-series", assertedValue: "exact JSON record identifies Yuukari Hekitame" }, { citationKey: "yuukari-page-conflict", assertedValue: "rendered HTML stale template showed Holly Olive Akatame text" }] },
    { key: "yuukari-not-release-year", fieldKey: "release_year", scopeKey: MODEL_SCOPE, conflictKind: "field", status: "resolved", resolutionNote: "Artisan 一件或极少数和季映技法背景不足以确定现代 SKU 的首发年份；release_year 保持未公布。", members: [{ citationKey: "yuukari-release", assertedValue: "artisan context does not establish launch year" }] },
  ],
  media: [{ key: "yuukari-svg", title: "Kiei Yuukari Hekitame 材料、笔尖与供墨边界图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase514WancherKieiYuukariHekitamePacks: CuratedEntityPack[] = [pack];
