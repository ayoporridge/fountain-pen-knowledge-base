import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-05";
export const PHASE507_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE507_KIEI_YOZAKURA_KURO_ID = "phase507-wancher-kiei-yozakura-kuro";
export const PHASE507_KIEI_YOZAKURA_KURO_SLUG = "wancher-dream-pen-kiei-urushi-yozakura-kuro";
const MODEL_SCOPE = "Wancher Dream Pen Kiei Urushi Yozakura Kuro exact SKU, Kiei nuri materials, options and care";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
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
    registryKey: "fountain-pen-graph-editorial-phase507",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase507",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；非产品照片、非 logo、不按比例、不作颜色证明。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.93, sourceKey, locator, evidence: [{ key: `${key}-e`, sourceKey, scopeKey: MODEL_SCOPE, locator }] };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

const product = web({
  key: "wancher-kiei-yozakura-kuro-official",
  title: "Wancher Dream Pen Kiei Urushi Yozakura - Black Fountain Pen",
  url: "https://www.wancherpen.com/products/kiei-urushi-yozakura-kuro",
  registryKey: "wancher-official-kiei-yozakura-kuro-phase507",
  registryName: "Wancher Pen official product page",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-kiei-yozakura-kuro-phase507",
  summary: "官方 exact page：Kiei nuri 季映塗、夜樱黑色 SKU、Japanese ebonite、天然漆、哑光漆、真实樱花花瓣、金粉、四类笔尖、三类 feed、包装和当前价格。",
  locator: "exact title, Kiei concept, technique, Yozakura description, materials, writing, feed, packaging, price and availability",
});

const collection = web({
  key: "wancher-dream-pen-collection-phase507",
  title: "Dream Pen Fountain Pen Collection | Wancher Official",
  url: "https://www.wancherpen.com/collections/dream-pen",
  registryKey: "wancher-official-dream-pen-collection-phase507",
  registryName: "Wancher Pen official collection",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-dream-pen-collection-phase507",
  summary: "官方集合页提供 Dream Pen 导航；Kuro、Yozakura 红色兄弟和其他 Kiei 作品应作为独立 SKU 或 sibling 进入导航。",
  locator: "Dream Pen collection title and product navigation",
});

const care = web({
  key: "wancher-product-care-phase507",
  title: "Wancher Product Care Guide",
  url: "https://www.wancherpen.com/pages/product-care",
  registryKey: "wancher-official-product-care-phase507",
  registryName: "Wancher Pen official product care",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-product-care-phase507",
  summary: "官方护理页说明 Urushi 避光、干燥、极端天气与冲击，Ebonite 不长时间浸水、不用化学清洁剂并以微湿布清洁。",
  locator: "Urushi/Maki-e/Raden and Ebonite material-care sections",
});

const kyotoMuseums = web({
  key: "kyoto-museums-lacquer-phase507",
  title: "A bit of knowledge about lacquer | Kyoto Museums Association",
  url: "https://kyoto-museums.city.kyoto.lg.jp/en/feature-column/lacquer/",
  registryKey: "kyoto-museums-association-lacquer-phase507",
  registryName: "Kyoto Museums Association",
  sourceType: "official",
  tier: "professional_secondary",
  independenceGroup: "kyoto-museums-association-lacquer-phase507",
  summary: "京都市博物馆协会资料提供漆树树液、京都漆器和金银粉装饰背景；只解释工艺词，不替 Kuro 证明制作细节。",
  locator: "lacquer material, Kyoto lacquerware and maki-e background",
});

const kyotoNationalMuseum = web({
  key: "kyoto-national-museum-makie-phase507",
  title: "Makie Lacquers of the Edo Period | Kyoto National Museum",
  url: "https://www.kyohaku.go.jp/old/eng/theme/floor1_6/past/shikko_20160830.html",
  registryKey: "kyoto-national-museum-makie-phase507",
  registryName: "Kyoto National Museum",
  sourceType: "official",
  tier: "professional_secondary",
  independenceGroup: "kyoto-national-museum-makie-phase507",
  summary: "京都国立博物馆资料解释蒔絵以漆的黏性固定金属粉末；只用于独立术语语境，不替 Wancher Kiei 证明配方或层数。",
  locator: "Makie technique explanation and lacquer exhibition context",
});

const svg = diagram(
  "wancher-kiei-yozakura-kuro-svg",
  "Wancher Kiei Yozakura Kuro 材料与 feed 兼容边界事实图",
  "/images/library/site-original/phase507/wancher/kiei-yozakura-kuro.svg",
);

const pack: CuratedEntityPack = {
  key: "phase507-wancher-kiei-yozakura-kuro-v1",
  entityId: PHASE507_KIEI_YOZAKURA_KURO_ID,
  expectedType: "pen",
  expectedSlug: PHASE507_KIEI_YOZAKURA_KURO_SLUG,
  canonicalName: "Wancher Dream Pen Kiei Urushi Yozakura Kuro",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-kiei-urushi-yozakura-kuro-phase507.md",
  storyTitle: "Wancher Kiei Yozakura Kuro：真实樱花花瓣、哑光漆与笔尖兼容边界",
  primarySourceKey: product.key,
  depthTier: "A",
  aliases: [
    { alias: "Kiei Urushi - Yozakura - Kuro", language: "en", sourceKey: product.key },
    { alias: "Dream Pen Kiei Urushi Yozakura - Black", language: "en", sourceKey: product.key },
    { alias: "Wancher 季映漆 夜樱 黑", language: "zh", sourceKey: product.key },
  ],
  sources: [product, collection, care, kyotoMuseums, kyotoNationalMuseum, svg],
  scopes: [
    {
      key: MODEL_SCOPE,
      scopeKey: MODEL_SCOPE,
      productionState: "current",
      market: "global",
      nibScope: "Official exact-page nib menu; feed compatibility restricts ebonite feeds to JoWo #6.",
      materialScope: "Japanese ebonite, natural/matte Urushi, natural Sakura petals and gold powder as listed for this exact page.",
      editionScope: "One black Yozakura Kiei SKU; price, availability, natural pattern and seasonal repeatability are mutable or non-uniform.",
    },
    {
      key: "phase507-kiei-context",
      scopeKey: "phase507-kiei-context",
      productionState: "historical",
      materialScope: "Independent lacquer and Maki-e terminology only; no product-specific certification.",
      editionScope: "Craft history does not establish the modern Kuro launch year or fixed edition count.",
    },
  ],
  claims: [
    claim("kuro-identity", "model_identity", "Kiei Urushi - Yozakura - Kuro 是 Dream Pen 下的黑色夜樱具体 SKU，与红色 Yozakura、泛称 Kiei nuri 和其他漆艺笔分开。", product.key, "exact product title and Yozakura Kuro wording"),
    claim("kuro-kiei-technique", "decoration_technique", "Wancher 将 Kiei nuri 季映塗描述为其工匠原创开发的当代 Urushi 技法，并概括底漆、贴叶/花瓣、撒金粉、覆哑光漆等步骤；具体元素可能改变流程。", product.key, "Kiei concept and four-step technique description"),
    claim("kuro-yozakura", "design_theme", "Yozakura Kiei 以夜间樱花景象为主题，官方写明结合 Urushi、金粉和真实 Sakura petals；主题不等于固定图案或限量编号。", product.key, "Yozakura Kiei description"),
    claim("kuro-material", "material", "材料栏列 Japanese ebonite、natural urushi、matte urushi、natural sakura petals 和 gold powder，并称材料在日本制作或取得。", product.key, "materials section"),
    claim("kuro-texture", "surface_boundary", "官方说明 Nurippanashi 的哑光漆保留自然平滑、粗糙和不均匀点，触感是艺术目的，不应直接当作缺陷。", product.key, "Matte Urushi and Nurippanashi explanation"),
    claim("kuro-seasonality", "variation_boundary", "品牌提醒 Kiei 系列图案会因自然变化而随季节/年份不同；这支持天然花瓣差异提醒，不证明固定限量或停产。", product.key, "seasonal design notice"),
    claim("kuro-lacquer-context", "craft_terminology_context", "京都博物馆资料说明漆材料和京都漆艺背景，京都国立博物馆解释蒔絵的金属粉固定方式；两者只用于术语语境。", kyotoMuseums.key, "independent lacquer and maki-e context"),
    claim("kuro-filling", "filling_system", "供墨为 converter 或 European International Standard cartridge；页面没有授权本 SKU 使用 eyedropper。", product.key, "filling mechanism"),
    claim("kuro-nib", "nib", "官方笔尖菜单为 #6 JoWo stainless steel、Keiryu、Keiryu Kodachi 和 18K Shogun；交付配置按订单确认。", product.key, "nib specification"),
    claim("kuro-feed", "feed", "Feed 菜单为 plastic、black ebonite、red ebonite；黑/红 ebonite 只兼容 JoWo #6，与 Shogun 18K、Keiryu、Keiryu Kodachi 不兼容。", product.key, "feed compatibility specification"),
    claim("kuro-packaging", "packaging", "包装包括日本木盒、Pen Kimono、说明材料、Authenticity Certificate、converter 和 cartridge。", product.key, "packaging list"),
    claim("kuro-price", "price", "检索窗口页面标示 US$600 并可加入购物车；价格和库存是可变商业字段，不是长期估值。", product.key, "regular/sale price and add-to-cart state", "editorial"),
    claim("kuro-care-urushi", "maintenance_guidance", "官方建议 Urushi 避直晒、干燥、极端天气和冲击；带花瓣/装饰的表面应轻拿轻放。", care.key, "Urushi, Maki-e and Raden care"),
    claim("kuro-care-ebonite", "maintenance_guidance", "官方建议 Ebonite 不要浸水超过一分钟，不用化学清洁剂，避免直晒和极端环境，用微湿布清洁。", care.key, "Ebonite care"),
    claim("kuro-selection", "selection_guidance", "选购和二手核对 exact title、Kuro 黑色主题、nib/feed 兼容、证书、订单和花瓣纹理实物图；不要把顾客评论当规格证明。", product.key, "exact SKU and evidence boundary", "editorial"),
  ],
  variants: [
    { key: "nib-jowo", name: "#6 JoWo stainless steel", notes: "官方笔尖选项；可与 black/red ebonite feed 按兼容说明组合。", sourceKey: product.key, variantKind: "nib", market: "global" },
    { key: "nib-keiryu", name: "Keiryu", notes: "官方笔尖选项；与 ebonite feed 不兼容。", sourceKey: product.key, variantKind: "nib", market: "global" },
    { key: "nib-keiryu-kodachi", name: "Keiryu Kodachi", notes: "官方笔尖选项；与 ebonite feed 不兼容。", sourceKey: product.key, variantKind: "nib", market: "global" },
    { key: "nib-shogun", name: "18K Shogun", notes: "官方笔尖选项；与 ebonite feed 不兼容。", sourceKey: product.key, variantKind: "nib", market: "global" },
    { key: "feed-plastic", name: "Plastic feed", notes: "官方 feed 选项；具体交付组合按订单确认。", sourceKey: product.key, variantKind: "material", market: "global" },
    { key: "feed-ebonite-black", name: "Black ebonite feed", notes: "官方 feed 选项；只兼容 JoWo #6。", sourceKey: product.key, variantKind: "material", market: "global" },
    { key: "feed-ebonite-red", name: "Red ebonite feed", notes: "官方 feed 选项；只兼容 JoWo #6。", sourceKey: product.key, variantKind: "material", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE507_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Dream Pen Kiei Urushi Yozakura",
      release_year: "独立上市年份未公布；2026-08-05 为当前 listing 核验窗口",
      origin_country: "日本品牌商品；页面称材料在日本制作或取得，未逐组件说明产地分工",
      nib: "#6 JoWo stainless steel、Keiryu、Keiryu Kodachi 或 18K Shogun（按订单选择）",
      fill_system: "Converter 或 European International Standard cartridge",
      material: "Japanese ebonite、natural urushi、matte urushi、natural sakura petals、gold powder",
      dimensions: "官方 exact page 未公布本 SKU 的长度、直径",
      weight: "官方 exact page 未公布",
      price_range: "检索窗口页面标示 US$600；价格和库存会变",
      status: "检索窗口显示可加入购物车；不据此推断持续供货或限量",
    },
    evidence: [
      evidence("kuro-brand", "brand_entity_id", collection.key, "Dream Pen collection brand boundary"),
      evidence("kuro-series", "series_name", product.key, "exact title and Dream Pen context"),
      evidence("kuro-release", "release_year", product.key, "current listing without independent launch year"),
      evidence("kuro-origin", "origin_country", product.key, "materials made or sourced in Japan wording"),
      evidence("kuro-nib-spec", "nib", product.key, "nib menu"),
      evidence("kuro-fill-spec", "fill_system", product.key, "filling mechanism"),
      evidence("kuro-material-spec", "material", product.key, "materials list"),
      evidence("kuro-dimensions", "dimensions", product.key, "size and shape section without dimensions"),
      evidence("kuro-weight", "weight", product.key, "exact page without weight"),
      evidence("kuro-price-spec", "price_range", product.key, "current price field"),
      evidence("kuro-status", "status", product.key, "current add-to-cart state"),
    ],
  },
  timeline: [
    { key: "kuro-current-listing", title: "Yozakura Kuro exact listing verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Exact Kuro configuration and source boundary verified on the retrieval date; this is not a release-year claim.", sourceKey: product.key },
  ],
  conflicts: [
    {
      key: "kuro-season-release-rejected",
      fieldKey: "release_year",
      scopeKey: MODEL_SCOPE,
      conflictKind: "field",
      status: "resolved",
      resolutionNote: "Kiei 页面关于季节与三年开发的叙述是技法和自然变化背景，不足以建立现代 Kuro 的独立首发年份；release_year 保持未公布。",
      members: [{ citationKey: "kuro-release", assertedValue: "seasonal technique context is not a modern release date" }],
    },
  ],
  media: [
    {
      key: "kuro-svg",
      title: "Kiei Yozakura Kuro 材料、自然纹理与 feed 兼容边界图（非产品照片）",
      sourceKey: svg.key,
      localPath: svg.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。",
      sourceUrl: svg.url,
      usageStatus: "primary",
    },
  ],
};

export const phase507WancherKieiUrushiYozakuraKuroPacks: CuratedEntityPack[] = [pack];
