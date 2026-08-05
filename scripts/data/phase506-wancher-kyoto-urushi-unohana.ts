import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-05";
export const PHASE506_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE506_KYOTO_URUSHI_UNOHANA_ID = "phase506-wancher-kyoto-urushi-unohana";
export const PHASE506_KYOTO_URUSHI_UNOHANA_SLUG = "wancher-dream-pen-kyoto-urushi-unohana";
const MODEL_SCOPE = "Wancher Dream Pen Kyoto Urushi Kasane-iro Unohana exact SKU, current options, care and identity boundary";

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
    registryKey: "fountain-pen-graph-editorial-phase506",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase506",
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

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
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
    evidence: [{ key: `${key}-e`, sourceKey, scopeKey: MODEL_SCOPE, locator }],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
  qualifies = true,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies };
}

const product = web({
  key: "wancher-kyoto-urushi-unohana-official",
  title: "Wancher Dream Pen Kyoto Urushi Kasane-iro - Unohana",
  url: "https://www.wancherpen.com/products/kyoto-urushi-unohana",
  registryKey: "wancher-official-kyoto-urushi-unohana-phase506",
  registryName: "Wancher Pen official product page",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-kyoto-urushi-unohana-phase506",
  summary: "官方 exact page：Ebonite、Urushi、European International Standard cartridge/converter、五类笔尖菜单、三类 feed、气密帽、clip 选项、包装与当前价格/库存边界。",
  locator: "product title, description, material, filling, nib, feed, cap, clip, price, availability and packaging",
});

const collection = web({
  key: "wancher-dream-pen-collection-phase506",
  title: "Dream Pen Fountain Pen Collection | Wancher Official",
  url: "https://www.wancherpen.com/collections/dream-pen",
  registryKey: "wancher-official-dream-pen-collection-phase506",
  registryName: "Wancher Pen official collection",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-dream-pen-collection-phase506",
  summary: "官方集合页提供 Dream Pen 系列入口；Unohana 与 Kyoto Ume 等商品应作为独立 sibling SKU 进入导航。",
  locator: "Dream Pen collection title, product cards and navigation",
});

const care = web({
  key: "wancher-product-care-phase506",
  title: "Wancher Product Care Guide",
  url: "https://www.wancherpen.com/pages/product-care",
  registryKey: "wancher-official-product-care-phase506",
  registryName: "Wancher Pen official product care",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-product-care-phase506",
  summary: "官方护理页说明 Urushi 避光、干燥、极端天气与冲击，Ebonite 不长时间浸水、不用化学清洁剂并以微湿布清洁。",
  locator: "Urushi/Maki-e/Raden and Ebonite material-care sections",
});

const kyotoCraft = web({
  key: "kyoto-museums-lacquer-phase506",
  title: "A bit of knowledge about lacquer | Kyoto Museums Association",
  url: "https://kyoto-museums.city.kyoto.lg.jp/en/feature-column/lacquer/",
  registryKey: "kyoto-museums-association-lacquer-phase506",
  registryName: "Kyoto Museums Association",
  sourceType: "official",
  tier: "professional_secondary",
  independenceGroup: "kyoto-museums-association-lacquer-phase506",
  summary: "京都市博物馆协会资料提供漆树树液、京都漆器薄木地与金银粉装饰的地域工艺背景；不替 Wancher Unohana 证明工坊、配方、涂层或证书。",
  locator: "lacquer material, Kyoto lacquerware features and maki-e history",
});

const svg = diagram(
  "wancher-kyoto-urushi-unohana-svg",
  "Wancher Kyoto Urushi Kasane-iro Unohana 材料与兼容边界事实图",
  "/images/library/site-original/phase506/wancher/kyoto-urushi-unohana.svg",
);

const pack: CuratedEntityPack = {
  key: "phase506-wancher-kyoto-urushi-unohana-v1",
  entityId: PHASE506_KYOTO_URUSHI_UNOHANA_ID,
  expectedType: "pen",
  expectedSlug: PHASE506_KYOTO_URUSHI_UNOHANA_SLUG,
  canonicalName: "Wancher Dream Pen Kyoto Urushi Kasane-iro Unohana",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-kyoto-urushi-unohana-phase506.md",
  storyTitle: "Wancher Kyoto Urushi Unohana：浅绿色命名、京都漆与笔尖兼容边界",
  primarySourceKey: product.key,
  depthTier: "A",
  aliases: [
    { alias: "Kyoto Urushi Kasane-iro - Unohana", language: "en", sourceKey: product.key },
    { alias: "Kyoto Urushi - Unohana", language: "en", sourceKey: product.key },
    { alias: "Wancher 京都漆 卯之花", language: "zh", sourceKey: product.key },
  ],
  sources: [product, collection, care, kyotoCraft, svg],
  scopes: [
    {
      key: MODEL_SCOPE,
      scopeKey: MODEL_SCOPE,
      productionState: "current",
      market: "global",
      nibScope: "Official exact-page nib menu; delivered nib and feed combination depends on the order.",
      materialScope: "Ebonite and Urushi with Unohana naming/design context; no sibling-material inheritance.",
      editionScope: "One exact Dream Pen fountain-pen SKU; current price, stock and clip availability are mutable fields.",
    },
    {
      key: "phase506-kyoto-context",
      scopeKey: "phase506-kyoto-context",
      productionState: "historical",
      materialScope: "Independent Kyoto lacquerware context only; no product-specific certification.",
      editionScope: "Craft history does not establish Unohana launch year or continuous production.",
    },
  ],
  claims: [
    claim("unohana-identity", "model_identity", "Kyoto Urushi Kasane-iro - Unohana 是 Dream Pen 下的一个具体 SKU，与 Kyoto Ume、其他色层款和 Dream Pen 导航页分开。", product.key, "exact product title and collection context"),
    claim("unohana-kasane", "design_inspiration", "Wancher 以平安时代服装叠色 Kasane no Irome 解释命名与层次感；这是品牌设计叙事，不是本型号首发年代。", product.key, "Kasane no Irome description"),
    claim("unohana-name", "colour_name", "Wancher 将 Unohana 解释为草木、树木和土地意象的浅绿色，并关联卯之花的星形花朵；这不是颜色标准或天然染料配方。", product.key, "The Unohana description"),
    claim("unohana-material", "material", "官方材料与工艺栏列 Ebonite、Urushi；页面没有公开本 SKU 的漆层数、配方或每个组件产地分工。", product.key, "material and art specification"),
    claim("unohana-regional-context", "regional_craft_context", "京都市博物馆协会资料只提供漆树材料、京都漆器与金银粉装饰的专业背景，不替 Wancher 证明 Unohana 的工坊或质量。", kyotoCraft.key, "Kyoto lacquerware features and maki-e history"),
    claim("unohana-filling", "filling_system", "供墨为 converter 或 European International Standard cartridge；页面没有授权本 SKU 使用 eyedropper。", product.key, "filling mechanism specification"),
    claim("unohana-nib-menu", "nib", "官方笔尖菜单为 #6 JoWo stainless steel、Wancher 18K Gold、Keiryu、Keiryu Kodachi、Shogun 18K；具体交付选择要看订单。", product.key, "nib specification"),
    claim("unohana-feed-menu", "feed", "Feed 菜单为 plastic、black ebonite、red ebonite，并明确 ebonite feed 只兼容 JoWo nibs；不能把所有菜单项任意组合。", product.key, "feed specification and compatibility note"),
    claim("unohana-cap", "cap", "官方列出 compact air-tight cap，作用是帮助减少干墨风险；它不是对所有环境的绝对保证。", product.key, "compact air-tight cap specification"),
    claim("unohana-packaging", "packaging", "包装清单包括日本木盒、Pen Kimono、说明材料、Certificate、converter 和 cartridge；附件是身份与完整度核对项。", product.key, "packaging list"),
    claim("unohana-clip", "clip_options", "页面列出 no clip、chrome clip、gold clip 三种夹子选项；检索时均显示售罄或不可用，属于时间点库存字段。", product.key, "clip option and availability marker"),
    claim("unohana-price", "price", "检索窗口商品页标示 US$680；这是可变商业字段，不是长期价格区间或二手估值。", product.key, "regular price and sale price fields", "editorial"),
    claim("unohana-care-urushi", "maintenance_guidance", "官方建议 Urushi 避直晒、干燥、极端天气与强冲击；有装饰的漆面应轻拿轻放。", care.key, "Urushi, Maki-e and Raden care"),
    claim("unohana-care-ebonite", "maintenance_guidance", "官方建议 Ebonite 不要浸水超过一分钟，不用化学清洁剂，避免直晒、干燥和极端环境，并用微湿布擦拭。", care.key, "Ebonite care"),
    claim("unohana-selection", "selection_guidance", "选购和二手核对应保存完整商品名、clip/nib/feed 组合、订单、Certificate 和实物照片；宽泛的绿色京都漆描述不足以确认身份。", product.key, "exact SKU, options and packaging boundary", "editorial"),
  ],
  variants: [
    { key: "clip-no", name: "No Clip", notes: "官方当前 clip 选项；库存与交付状态需在订单时确认。", sourceKey: product.key, variantKind: "market_sku", market: "global" },
    { key: "clip-chrome", name: "Chrome Clip", notes: "官方当前 clip 选项；库存与交付状态需在订单时确认。", sourceKey: product.key, variantKind: "market_sku", market: "global" },
    { key: "clip-gold", name: "Gold Clip", notes: "官方当前 clip 选项；库存与交付状态需在订单时确认。", sourceKey: product.key, variantKind: "market_sku", market: "global" },
    { key: "nib-jowo", name: "#6 JoWo stainless steel", notes: "官方笔尖选项；与 ebonite feed 的明确兼容组合。", sourceKey: product.key, variantKind: "nib", market: "global" },
    { key: "nib-wancher-18k", name: "Wancher 18K Gold", notes: "官方笔尖选项；不要自动与 ebonite feed 组合。", sourceKey: product.key, variantKind: "nib", market: "global" },
    { key: "nib-keiryu", name: "Keiryu", notes: "官方笔尖选项；具体尖幅与 feed 组合按订单确认。", sourceKey: product.key, variantKind: "nib", market: "global" },
    { key: "nib-keiryu-kodachi", name: "Keiryu Kodachi", notes: "官方笔尖选项；具体尖幅与 feed 组合按订单确认。", sourceKey: product.key, variantKind: "nib", market: "global" },
    { key: "nib-shogun-18k", name: "Shogun 18K", notes: "官方笔尖选项；具体 feed 组合按订单确认。", sourceKey: product.key, variantKind: "nib", market: "global" },
    { key: "feed-plastic", name: "Plastic feed", notes: "官方 feed 选项；与所选 nib 的实际组合按订单确认。", sourceKey: product.key, variantKind: "material", market: "global" },
    { key: "feed-ebonite-black", name: "Black ebonite feed", notes: "官方 feed 选项；页面明确 ebonite feed 只兼容 JoWo nibs。", sourceKey: product.key, variantKind: "material", market: "global" },
    { key: "feed-ebonite-red", name: "Red ebonite feed", notes: "官方 feed 选项；页面明确 ebonite feed 只兼容 JoWo nibs。", sourceKey: product.key, variantKind: "material", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE506_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Dream Pen Kyoto Urushi Kasane-iro",
      release_year: "独立上市年份未公布；2026-08-05 为当前 listing 核验窗口",
      origin_country: "日本品牌商品；exact page 未对每个组件的产地分工作统一声明",
      nib: "#6 JoWo stainless steel、Wancher 18K Gold、Keiryu、Keiryu Kodachi 或 Shogun 18K（按订单选择）",
      fill_system: "European International Standard cartridge 或 converter",
      material: "Ebonite、Urushi；Unohana 浅绿色命名与京都漆设计叙事",
      dimensions: "官方 exact page 未公布本 SKU 的长度、直径",
      weight: "官方 exact page 未公布",
      price_range: "检索窗口页面标示 US$680；价格与库存会变",
      status: "检索窗口 clip 选项显示 sold out or unavailable；不据此推断停产",
    },
    evidence: [
      evidence("unohana-brand", "brand_entity_id", collection.key, "Dream Pen collection brand boundary"),
      evidence("unohana-series", "series_name", product.key, "exact product title and collection"),
      evidence("unohana-release", "release_year", product.key, "exact page has current listing but no independent launch year"),
      evidence("unohana-origin", "origin_country", product.key, "brand and shipping address context without component-level origin"),
      evidence("unohana-nib-spec", "nib", product.key, "nib specification and option menu"),
      evidence("unohana-fill-spec", "fill_system", product.key, "filling mechanism specification"),
      evidence("unohana-material-spec", "material", product.key, "Ebonite and Urushi specification"),
      evidence("unohana-dimensions", "dimensions", product.key, "size and shape section without dimensions"),
      evidence("unohana-weight", "weight", product.key, "exact page without weight"),
      evidence("unohana-price-spec", "price_range", product.key, "current regular/sale price field"),
      evidence("unohana-status", "status", product.key, "clip availability marker"),
    ],
  },
  timeline: [
    { key: "unohana-current-listing", title: "Unohana exact listing verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Exact product configuration and source boundary verified on the retrieval date; this entry is not a release-year claim.", sourceKey: product.key },
  ],
  conflicts: [
    {
      key: "unohana-heian-release-rejected",
      fieldKey: "release_year",
      scopeKey: MODEL_SCOPE,
      conflictKind: "field",
      status: "resolved",
      resolutionNote: "Kasane no Irome 的平安时代背景仅作为品牌设计灵感；没有现代 Unohana 的独立首发档案，因此 release_year 保持未公布。",
      members: [{ citationKey: "unohana-release", assertedValue: "Heian Period (794-1185) design inspiration is not a modern release year" }],
    },
  ],
  media: [
    {
      key: "unohana-svg",
      title: "Kyoto Urushi Unohana 材料、选项与兼容边界图（非产品照片）",
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

export const phase506WancherKyotoUrushiUnohanaPacks: CuratedEntityPack[] = [pack];
