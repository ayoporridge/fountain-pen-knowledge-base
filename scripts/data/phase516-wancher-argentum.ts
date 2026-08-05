import type { CuratedClaim, CuratedEntityPack, CuratedSource, CuratedSpecEvidence, CuratedVariant, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-05";
export const PHASE516_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE516_ARGENTUM_ID = "phase516-wancher-argentum";
export const PHASE516_ARGENTUM_SLUG = "wancher-dream-pen-argentum-fountain-pen";
export const PHASE516_ARGENTUM_JSON_URL = "https://www.wancherpen.com/products/argentum-fountain-pen.json";
const MODEL_SCOPE = "Wancher Dream Pen Argentum 925 Sterling Silver exact SKU, 1-of-1 identity, acid etching, nib matrix and care";

function web(input: { key: string; title: string; url: string; registryKey: string; registryName: string; sourceType: CuratedSource["sourceType"]; tier: CuratedSource["tier"]; independenceGroup: string; summary: string; locator: string }): CuratedSource {
  return { key: input.key, registryKey: input.registryKey, registryName: input.registryName, sourceType: input.sourceType, tier: input.tier, independenceGroup: input.independenceGroup, title: input.title, url: input.url, homepageUrl: new URL(input.url).origin, itemType: "web_page", author: input.registryName, retrievedAt: RETRIEVED, allowedUse: "summary_only", summary: input.summary, archiveUrl: input.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}` };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase516", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase516", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作颜色证明。", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey: MODEL_SCOPE, locator }] };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string, qualifies = true): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies };
}

const product = web({ key: "wancher-argentum-official-json", title: "Argentum Fountain Pen - 925 Sterling Silver | Wancher Official product JSON", url: PHASE516_ARGENTUM_JSON_URL, registryKey: "wancher-official-argentum-phase516", registryName: "Wancher Pen official product record", sourceType: "official", tier: "primary", independenceGroup: "wancher-official-argentum-phase516", summary: "官方 Shopify product JSON：product id 9316894867671、handle、1-of-1、925 Sterling Silver、Ariel Kullock、16 条 Shogun/笔幅变体、Sailor Standard 供墨与 Plastic feed。", locator: "product id, title, handle, created_at, 1-of-1 copy, variants, prices, options, images and specifications" });
const productPage = web({ key: "wancher-argentum-official-page", title: "Argentum Fountain Pen - 925 Sterling Silver | Wancher Official", url: "https://www.wancherpen.com/products/argentum-fountain-pen", registryKey: "wancher-official-argentum-page-phase516", registryName: "Wancher Pen official product page", sourceType: "official", tier: "primary", independenceGroup: "wancher-official-argentum-phase516", summary: "官方商品页：Argentum 的 Milonga 主题、Ariel Kullock、1-of-1、酸蚀工艺、供墨、包装和检索窗口状态。", locator: "exact title, 1-of-1 boundary, Milonga story, acid-etching process, specifications, packaging and status" });
const collection = web({ key: "wancher-dream-pen-collection-phase516", title: "Dream Pen Fountain Pen Collection | Wancher Official", url: "https://www.wancherpen.com/collections/dream-pen", registryKey: "wancher-official-dream-pen-collection-phase516", registryName: "Wancher Pen official Dream Pen collection", sourceType: "official", tier: "primary", independenceGroup: "wancher-official-dream-pen-collection-phase516", summary: "官方 Dream Pen 集合页把 Argentum 作为独立商品列出，与 Raden、Urushi 和普通银饰配件分开。", locator: "Dream Pen collection product navigation" });
const newArrivals = web({ key: "wancher-new-arrivals-phase516", title: "Wancher New Arrival Collection", url: "https://www.wancherpen.com/collections/all/new-arrival", registryKey: "wancher-official-new-arrivals-phase516", registryName: "Wancher Pen official new-arrival collection", sourceType: "official", tier: "primary", independenceGroup: "wancher-official-new-arrivals-phase516", summary: "官方新到货集合卡片用于核对 Argentum 的新到货/售罄标签和 From US$2,000 展示；逐条价格以 exact product JSON 为准。", locator: "Argentum new-arrival card price/status display" });
const nibGuide = web({ key: "wancher-nib-guide-phase516", title: "Wancher Fountain Pen Nib Guide", url: "https://www.wancherpen.com/pages/nib-guide", registryKey: "wancher-official-nib-guide-phase516", registryName: "Wancher Pen official nib guide", sourceType: "official", tier: "primary", independenceGroup: "wancher-official-nib-guide-phase516", summary: "官方指南提供 Shogun 18K、Rhodium-plated 和 Kodachi 笔尖语境；不替 Argentum 增加未公布的尖型或 feed。", locator: "Shogun 18K, rhodium finish and Keiryu/Kodachi nib guidance" });
const care = web({ key: "wancher-product-care-phase516", title: "Wancher Product Care Guide", url: "https://www.wancherpen.com/pages/product-care", registryKey: "wancher-official-product-care-phase516", registryName: "Wancher Pen official product care", sourceType: "official", tier: "primary", independenceGroup: "wancher-official-product-care-phase516", summary: "官方护理页提供材料护理和清洁分类；没有为 Argentum 单独公布银面化学清洁配方，因此本页保留保守维护边界。", locator: "material care, cleaning categories and absence of Argentum-specific silver formula" });
const etchingMuseum = web({ key: "met-etching-phase516", title: "Electrolytic Etching | The Metropolitan Museum of Art", url: "https://www.metmuseum.org/it/perspectives/metalworking-electrolytic-etching", registryKey: "metropolitan-museum-etching-phase516", registryName: "The Metropolitan Museum of Art", sourceType: "official", tier: "professional_secondary", independenceGroup: "metropolitan-museum-etching-phase516", summary: "大都会艺术博物馆的材料与技法条目解释金属酸蚀如何通过遮蔽、溶液和受控腐蚀形成凹痕；只用于酸蚀术语语境，不替 Argentum 证明具体化学参数。", locator: "Materials and Techniques: electrolytic etching process and metal surface recesses" });
const svg = diagram("wancher-argentum-svg", "Argentum 925 Sterling Silver、酸蚀与配置边界事实图", "/images/library/site-original/phase516/wancher/argentum.svg");

const nibOptions = [
  ["18R-EF", "Rhodium-plated / Extra Fine", "US$3,000"], ["18R-F", "Rhodium-plated / Fine", "US$3,000"], ["18R-MF", "Rhodium-plated / Medium Fine", "US$3,000"], ["18R-M", "Rhodium-plated / Medium", "US$3,000"], ["18R-B", "Rhodium-plated / Broad", "US$3,000"], ["18R-NF", "Rhodium-plated / Kodachi Fine", "US$3,100"], ["18R-NM", "Rhodium-plated / Kodachi Medium", "US$3,100"], ["18R-NB", "Rhodium-plated / Kodachi Broad", "US$3,100"],
  ["18K-EF", "Solid Gold / Extra Fine", "US$3,100"], ["18K-F", "Solid Gold / Fine", "US$3,000"], ["18K-MF", "Solid Gold / Medium Fine", "US$3,000"], ["18K-M", "Solid Gold / Medium", "US$3,000"], ["18K-B", "Solid Gold / Broad", "US$3,000"], ["18K-NF", "Solid Gold / Kodachi Fine", "US$3,100"], ["18K-NM", "Solid Gold / Kodachi Medium", "US$3,100"], ["18K-NB", "Solid Gold / Kodachi Broad", "US$3,100"],
] as const;

const variants: CuratedVariant[] = [
  { key: "argentum-one-of-one", name: "1-of-1 masterpiece", notes: "官方 exact page 的唯一作品边界；不是可补货颜色，也没有公开第二支编号。", sourceKey: productPage.key, variantKind: "edition_group", market: "global" },
  ...nibOptions.map(([code, name, price]) => ({ key: `argentum-${code.toLowerCase()}`, name, notes: `官方 JSON 变体；SKU WF-DREAM-ARG-${code}，页面价格 ${price}。`, sourceKey: product.key, variantKind: "nib" as const, productCode: `WF-DREAM-ARG-${code}`, market: "global" })),
];

const pack: CuratedEntityPack = {
  key: "phase516-wancher-argentum-v1",
  entityId: PHASE516_ARGENTUM_ID,
  expectedType: "pen",
  expectedSlug: PHASE516_ARGENTUM_SLUG,
  canonicalName: "Wancher Dream Pen Argentum Fountain Pen - 925 Sterling Silver",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-argentum-phase516.md",
  storyTitle: "Wancher Argentum：925 银酸蚀、Milonga 与一件作品的边界",
  primarySourceKey: product.key,
  depthTier: "A",
  aliases: [
    { alias: "Argentum Fountain Pen - 925 Sterling Silver", language: "en", sourceKey: product.key },
    { alias: "Wancher Argentum Fountain Pen", language: "en", sourceKey: product.key },
    { alias: "Wancher Argentum 925 银酸蚀钢笔", language: "zh", sourceKey: product.key },
  ],
  sources: [product, productPage, collection, newArrivals, nibGuide, care, etchingMuseum, svg],
  scopes: [
    { key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, productionState: "current", market: "global", nibScope: "Official JSON lists 16 combinations: Solid Gold/Rhodium-plated with EF/F/MF/M/B and Kodachi Fine/Medium/Broad; exact SKU and price must be checked per variant.", materialScope: "925 Sterling Silver with acid etching and Plastic feed; acid type, concentration, silver thickness and post-treatment unpublished.", editionScope: "Official product copy says 1-of-1; it is a unique artwork boundary, not a public serial-number scheme or future reissue promise." },
    { key: "phase516-argentum-context", scopeKey: "phase516-argentum-context", productionState: "historical", materialScope: "Milonga and acid-etching terminology context only; no independent authenticity certificate.", editionScope: "The 2026 Independence Day story does not establish a formal launch date or resale value." },
  ],
  claims: [
    claim("identity", "model_identity", "Argentum Fountain Pen - 925 Sterling Silver 是 Dream Pen 集合中的独立 1-of-1 作品；官方 product id 为 9316894867671，handle 为 argentum-fountain-pen。", product.key, "product id, exact title and handle"),
    claim("one-of-one", "edition_boundary", "官方文案称这是 Wancher Pen 与阿根廷工匠 Ariel Kullock 合作的 1-of-1 masterpiece，并写明不会再有相同的 Argentum Fountain Pen；不据此推算序列号或复刻计划。", productPage.key, "1-of-1 copy and collaboration wording"),
    claim("milonga", "design_theme", "Milonga 是本款设计灵感；页面把它解释为社交舞会、音乐类型和早于 Tango 的舞蹈风格，银面图案描绘 20 世纪阿根廷舞会。", productPage.key, "Milonga in Silver narrative"),
    claim("artist", "artisan", "官方署名 Ariel Kullock 为阿根廷工匠，并将其手绘酸蚀构图与 Argentum 的整支银面联系起来；不扩写为完整艺术家履历。", productPage.key, "collaboration and artisan attribution"),
    claim("material", "material", "规格列 Base material: 925 Sterling Silver、Art: Acid Etching；Feed 为 Plastic。页面未公布银厚、酸液配方、遮蔽材料或后处理。", product.key, "exact specifications and material boundary"),
    claim("process", "decoration_technique", "品牌描述先遮蔽银面，再由工匠在曲面手绘，随后整支笔进入酸液；酸蚀不可逆，时间控制决定线条与粗糙暗面的对比。", productPage.key, "The Art of Acid Etching"),
    claim("etching-context", "craft_terminology_context", "大都会艺术博物馆把金属酸蚀解释为先保护部分表面、再让溶液作用于暴露区域形成凹痕；这只帮助理解工艺词，不替本 SKU 补酸液种类、浓度或时间。", etchingMuseum.key, "metalworking electrolytic etching technique context"),
    claim("nib", "nib", "官方 JSON 有 Solid Gold 与 Rhodium-plated 两种 Shogun 18K 尖面，并列 Extra Fine、Fine、Medium Fine、Medium、Broad、Kodachi Fine/Medium/Broad，共 16 条变体。", product.key, "option matrix and variant SKU rows"),
    claim("filling", "filling_system", "供墨为 Converter 或 Cartridge（Sailor Standard）；页面没有授权本款作为 eyedropper 使用。", product.key, "Filling mechanism specification"),
    claim("cap", "cap", "商品规格写 compact air-tight cap，用于减少墨水提前干涸；它不是完全防漏或免维护承诺。", product.key, "compact air-tight cap"),
    claim("packaging", "packaging", "包装列 Traditional Japanese Wooden Box、Pen Kimono、说明材料、converter 与 cartridge；附件仍按订单清单核对。", product.key, "Packaging list"),
    claim("care", "maintenance_guidance", "官方护理页没有 Argentum 专用银面化学配方；基于酸蚀不可逆和页面未授权化学清洁，建议只用柔软布轻拭、避酸碱/研磨剂/超声波，不自行抛光暗面。", care.key, "material-care categories and conservative silver-surface boundary", "editorial"),
    claim("price-conflict", "price_status", "逐条官方 JSON 变体价格为 US$3,000 或 US$3,100；集合卡片曾显示 From US$2,000，因此当前内容以 exact JSON 变体为规格证据并保留展示冲突。", product.key, "exact variant price rows versus collection card", "editorial"),
    claim("status", "commercial_status", "检索窗口官方新到货页面与商品记录显示 Sold out/不可购买；不据此推断永久停产或一定没有未来重制。", newArrivals.key, "new-arrival Sold out marker", "editorial"),
    claim("selection", "selection_guidance", "选购或二手核对 exact title、product id 9316894867671、1-of-1、Ariel Kullock、Milonga 酸蚀图案、925 银、两种 18K 尖面、Kodachi/常规笔幅、Sailor Standard、Plastic feed 和完整实物照片；不要用普通银色配件或其他 Argentum 文案补字段。", product.key, "exact identity and evidence boundary", "editorial"),
  ],
  variants,
  spec: {
    brandEntityId: PHASE516_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Dream Pen Argentum Fountain Pen - 925 Sterling Silver",
      release_year: "2026 页面记录；product JSON created_at 为 2026-07-03，品牌同时使用 2026-07-09 纪念语境，不等同正式首发日",
      origin_country: "Wancher 日本品牌与阿根廷工匠 Ariel Kullock 合作；未逐组件公布产地分工",
      nib: "18K Solid Gold Shogun 或 Rhodium-plated；Extra Fine/Fine/Medium Fine/Medium/Broad/Kodachi Fine/Kodachi Medium/Kodachi Broad",
      fill_system: "Converter 或 Sailor Standard cartridge",
      material: "925 Sterling Silver；全笔 Acid Etching，Plastic feed",
      dimensions: "官方 exact product JSON 未公布本 SKU 的长度、直径",
      weight: "官方 exact page 未公布实物重量；变体 200 g 字段不作为成品重量规格",
      price_range: "逐条官方 JSON 变体为 US$3,000 或 US$3,100；集合卡片曾显示 From US$2,000，保留为价格展示冲突",
      status: "检索窗口官方新到货页面与 product JSON 显示 Sold out；不据此推断永久停产或复刻",
    },
    evidence: [
      evidence("argentum-brand", "brand_entity_id", collection.key, "Dream Pen collection brand boundary"),
      evidence("argentum-series", "series_name", product.key, "exact title and handle"),
      evidence("argentum-release", "release_year", product.key, "created_at and July 2026 context without formal launch date"),
      evidence("argentum-origin", "origin_country", productPage.key, "Ariel Kullock collaboration"),
      evidence("argentum-nib-spec", "nib", product.key, "16 exact variant rows"),
      evidence("argentum-fill-spec", "fill_system", product.key, "Sailor Standard filling field"),
      evidence("argentum-material-spec", "material", product.key, "925 Sterling Silver and acid etching fields"),
      evidence("argentum-dimensions", "dimensions", product.key, "exact JSON without published dimensions"),
      evidence("argentum-weight", "weight", product.key, "exact page without published product weight"),
      evidence("argentum-price-spec", "price_range", product.key, "exact variant price rows"),
      evidence("argentum-price-card", "price_range", newArrivals.key, "collection card From US$2,000 display", false),
      evidence("argentum-status", "status", product.key, "product record availability fields"),
      evidence("argentum-status-card", "status", newArrivals.key, "new-arrival Sold out marker"),
    ],
  },
  timeline: [{ key: "argentum-current-listing", title: "Argentum exact product record verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Exact title, product id, 1-of-1 boundary, 16 variant rows and source conflict were verified on the retrieval date; this is not a formal release date.", sourceKey: product.key }],
  conflicts: [
    { key: "argentum-price-display-conflict", fieldKey: "price_range", scopeKey: MODEL_SCOPE, conflictKind: "field", status: "resolved", resolutionNote: "新到货集合卡片显示 From US$2,000，而 exact product JSON 的逐条变体为 US$3,000/US$3,100；采用逐条 JSON 作为型号规格，保留卡片价格作为展示冲突。", members: [{ citationKey: "argentum-price-spec", assertedValue: "exact variant JSON: US$3,000 or US$3,100" }, { citationKey: "argentum-price-card", assertedValue: "new-arrival card: From US$2,000" }] },
    { key: "argentum-status-window", fieldKey: "status", scopeKey: MODEL_SCOPE, conflictKind: "field", status: "resolved", resolutionNote: "商品记录的 available now 标签、变体不可用字段与集合 Sold out 展示可能随缓存/库存更新；内容保留检索窗口 Sold out，不推断永久停产。", members: [{ citationKey: "argentum-status", assertedValue: "product record availability fields" }, { citationKey: "argentum-status-card", assertedValue: "new-arrival Sold out marker" }] },
    { key: "argentum-date-not-launch", fieldKey: "release_year", scopeKey: MODEL_SCOPE, conflictKind: "field", status: "resolved", resolutionNote: "created_at 和阿根廷独立日纪念文案不足以确定正式首发日；release_year 只保留 2026 页面记录语境。", members: [{ citationKey: "argentum-release", assertedValue: "recorded 2026 context does not establish formal launch date" }] },
  ],
  media: [{ key: "argentum-svg", title: "Argentum 925 Sterling Silver、酸蚀与配置边界图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存、真伪或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase516WancherArgentumPacks: CuratedEntityPack[] = [pack];
