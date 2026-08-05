import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-08-05";
export const PHASE505_WANCHER_BRAND_ID = "eOfD77nOeENN";
export const PHASE505_TRUE_MAKI_E_SAKURA_ID = "phase505-wancher-true-maki-e-sakura";
export const PHASE505_TRUE_MAKI_E_SAKURA_SLUG = "wancher-dream-pen-true-maki-e-sakura";
const MODEL_SCOPE = "Wancher Dream Pen True Maki-e Sakura exact SKU, four signed serial variants, materials, filling and care";

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
    registryKey: "fountain-pen-graph-editorial-phase505",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase505",
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
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

const product = web({
  key: "wancher-true-maki-e-sakura-official",
  title: "True Maki-e - Sakura Fountain Pen | Wancher Pen",
  url: "https://www.wancherpen.com/products/dream-pen-true-maki-e-sakura",
  registryKey: "wancher-official-true-maki-e-sakura-phase505",
  registryName: "Wancher Pen official product page",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-true-maki-e-sakura-phase505",
  summary: "官方 exact product page：Togidashi-Taka Maki-e、轮岛山之下工匠、乌木/漆/金银粉、Wancher 18K 金尖、国际标准墨囊或转换器、气密帽和四个签名序号；访问时售罄。",
  locator: "product title, notice, True Maki-e description, specifications and packaging",
});

const collection = web({
  key: "wancher-dream-pen-collection",
  title: "Dream Pen Fountain Pen Collection | Wancher Official",
  url: "https://www.wancherpen.com/collections/dream-pen",
  registryKey: "wancher-official-dream-pen-collection-phase505",
  registryName: "Wancher Pen official collection",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-dream-pen-collection-phase505",
  summary: "官方集合页将 Dream Pen 定义为以日本乌木、漆艺和各地传统工艺为核心的系列入口；不为单一 True Maki-e SKU 提供未列出的尺寸。",
  locator: "Dream Pen introduction and collection navigation",
});

const care = web({
  key: "wancher-product-care",
  title: "Wancher Product Care Guide",
  url: "https://www.wancherpen.com/pages/product-care",
  registryKey: "wancher-official-product-care-phase505",
  registryName: "Wancher Pen official product care",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official-product-care-phase505",
  summary: "官方护理页说明 Urushi/Maki-e 避直晒、干燥、极端环境和冲击；乌木不长时间浸水，不用化学清洁剂，建议微湿软布。",
  locator: "Urushi, Maki-e and Ebonite care sections",
});

const museum = web({
  key: "wajima-lacquer-art-museum-makie",
  title: "Wajima Lacquer Art Museum exhibition guide",
  url: "https://www.art.city.wajima.ishikawa.jp/exhibition-guide/gl-en",
  registryKey: "wajima-lacquer-art-museum-makie-phase505",
  registryName: "Wajima Lacquer Art Museum",
  sourceType: "official",
  tier: "professional_secondary",
  independenceGroup: "wajima-lacquer-art-museum-makie-phase505",
  summary: "轮岛漆艺博物馆的英文展览指南介绍轮岛莳绘历史，并把 taka-maki-e 与 togidashi-maki-e 作为不同技法；只用于术语语境。",
  locator: "history of maki-e, taka-maki-e and togidashi-maki-e in Wajima",
});

const svg = diagram(
  "wancher-true-maki-e-sakura-svg",
  "Wancher True Maki-e Sakura material and serial boundary factual diagram",
  "/images/library/site-original/phase505/wancher/true-maki-e-sakura.svg",
);

const pack: CuratedEntityPack = {
  key: "phase505-wancher-true-maki-e-sakura-v1",
  entityId: PHASE505_TRUE_MAKI_E_SAKURA_ID,
  expectedType: "pen",
  expectedSlug: PHASE505_TRUE_MAKI_E_SAKURA_SLUG,
  canonicalName: "Wancher Dream Pen True Maki-e Sakura",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-true-maki-e-sakura-phase505.md",
  storyTitle: "Wancher Dream Pen True Maki-e Sakura：四个签名序号与轮岛莳绘的边界",
  primarySourceKey: product.key,
  depthTier: "A",
  aliases: [
    { alias: "True Maki-e - Sakura", language: "en", sourceKey: product.key },
    { alias: "Dream Pen True Maki-e Sakura", language: "en", sourceKey: product.key },
    { alias: "Wancher True Maki-e 樱花", language: "zh", sourceKey: product.key },
  ],
  sources: [product, collection, care, museum, svg],
  scopes: [
    {
      key: MODEL_SCOPE,
      scopeKey: MODEL_SCOPE,
      productionState: "historical",
      market: "global",
      nibScope: "Wancher 18K gold nib; exact point width is not stated on the page",
      materialScope: "Ebonite, Urushi and Togidashi-Taka Maki-e with gold and silver powder",
      editionScope: "01/04, 02/04, 03/04 and 04/04 signed serial variants; one model identity",
    },
  ],
  claims: [
    claim("true-maki-e-identity", "model_identity", "True Maki-e - Sakura 是 Wancher Dream Pen 下的樱花主题具体 SKU，不与 Sakura Zukiyo、True Urushi 或 Dream Pen 导航页合并。", product.key, "product title and Dream Pen wording"),
    claim("true-maki-e-position", "collection_position", "Wancher 将 Dream Pen True Maki-e 称为 Dream Pen 首个且最高等级的设计；这是品牌定位语句，不是行业排名。", product.key, "Dream Pen True Maki-e introduction"),
    claim("true-maki-e-artist", "craft_location", "商品页写明由日本轮岛山之下工匠以手工方式完成；正文不把轮岛工匠表述扩成每个组件均在轮岛制造。", product.key, "handcrafted by master Yamanoshita from Wajima"),
    claim("true-maki-e-technique", "decoration_technique", "商品页将工艺写为 Togidashi-Taka Maki-e；博物馆资料只用于解释研出与高莳绘术语边界。", product.key, "Togidashi-Taka Maki-e product description"),
    claim("true-maki-e-museum-context", "craft_terminology_context", "轮岛漆艺博物馆把 taka-maki-e 与 togidashi-maki-e 作为不同术语语境；这条独立资料只帮助读者理解工艺词，不替这支笔证明逐层制作记录。", museum.key, "history of maki-e, taka-maki-e and togidashi-maki-e in Wajima"),
    claim("true-maki-e-material", "material", "官方规格列出 Ebonite、Urushi、Maki-e；樱花图案使用金粉、银粉与漆，未公开漆层数量。", product.key, "material & art specification and Sakura description"),
    claim("true-maki-e-serial", "edition_serial", "官方通知列出 01/04、02/04、03/04、04/04 四个序号，并称四件是唯一签名 True Maki-e；序号是同一型号的个体变体。", product.key, "important notice and serial-number selector"),
    claim("true-maki-e-earthquake", "historical_context", "商品页把四件作品的完成背景放在 2024 年 1 月能登地震之后；这不是独立上市年份，也不应延伸为未给出的灾损细节。", product.key, "Noto earthquake notice"),
    claim("true-maki-e-nib", "nib", "官方规格为 Wancher 18K gold nib；具体尖幅须由订单与实物核对，不能借用其他 Dream Pen 的 JoWo/Keiryu/Shogun 选项。", product.key, "nib specification"),
    claim("true-maki-e-filling", "filling_system", "供墨为 converter 或 European International Standard cartridge；页面没有授权 eyedropper 用法。", product.key, "filling mechanism specification"),
    claim("true-maki-e-cap-feed", "cap_and_feed", "官方列出 plastic feed 与 compact air-tight cap，后者用于减少干墨风险。", product.key, "feed and compact air-tight cap specification"),
    claim("true-maki-e-packaging", "packaging", "包装包含日本木盒、Pen Kimono、说明材料、证书、converter 与 cartridge；证书应与四个序号记录一起保存。", product.key, "packaging list"),
    claim("true-maki-e-shape", "shape", "商品页以 traditional and minimal cigar shape 描述外形，但未公开本 SKU 的长度、直径和重量。", product.key, "size & shape section"),
    claim("true-maki-e-care", "maintenance_guidance", "Wancher 建议 Urushi/Maki-e 避直晒、干燥、极端环境和冲击；乌木不要长时间浸水、不要用化学清洁剂，应用微湿软布。", care.key, "Urushi/Maki-e and Ebonite care guidance"),
    claim("true-maki-e-selection", "selection_guidance", "购买和二手核对商品全名、序号、签名、证书、18K 尖与实时库存；售罄不等于停产或公开稀有度。", product.key, "serial, certificate and sold-out boundary", "editorial"),
  ],
  variants: [
    { key: "serial-01-04", name: "01/04", notes: "官方商品页列出的签名序号；属于同一 Sakura 型号，不单独建实体。", sourceKey: product.key, variantKind: "edition_group", market: "global" },
    { key: "serial-02-04", name: "02/04", notes: "官方商品页列出的签名序号；属于同一 Sakura 型号，不单独建实体。", sourceKey: product.key, variantKind: "edition_group", market: "global" },
    { key: "serial-03-04", name: "03/04", notes: "官方商品页列出的签名序号；属于同一 Sakura 型号，不单独建实体。", sourceKey: product.key, variantKind: "edition_group", market: "global" },
    { key: "serial-04-04", name: "04/04", notes: "官方商品页列出的签名序号；属于同一 Sakura 型号，不单独建实体。", sourceKey: product.key, variantKind: "edition_group", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE505_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher Dream Pen True Maki-e",
      release_year: "独立上市年份未公布；商品页记录 2024 年能登地震后的四件签名作品",
      origin_country: "日本；Wancher 指明轮岛山之下工匠负责手工莳绘，组件产地未统一声明",
      nib: "Wancher 18K gold nib；具体尖幅以订单与实物为准",
      fill_system: "Converter or European International Standard cartridge",
      material: "Ebonite body, Urushi and Togidashi-Taka Maki-e with gold and silver powder",
      dimensions: "官方未公布本 SKU 的长度、直径和重量",
      weight: "官方未公布",
      status: "官方商品页访问时显示 sold out；不据此推断停产",
    },
    evidence: [
      evidence("true-maki-e-brand", "brand_entity_id", collection.key, "Dream Pen collection brand boundary"),
      evidence("true-maki-e-series", "series_name", product.key, "Dream Pen True Maki-e title"),
      evidence("true-maki-e-year", "release_year", product.key, "Noto notice without independent release year"),
      evidence("true-maki-e-origin", "origin_country", product.key, "Wajima master Yamanoshita wording"),
      evidence("true-maki-e-nib-spec", "nib", product.key, "Wancher 18K gold nib"),
      evidence("true-maki-e-fill-spec", "fill_system", product.key, "converter or international cartridge"),
      evidence("true-maki-e-material-spec", "material", product.key, "Ebonite, Urushi and Maki-e specification"),
      evidence("true-maki-e-dimensions", "dimensions", product.key, "cigar shape section with no dimensions published"),
      evidence("true-maki-e-weight", "weight", product.key, "no weight published on exact page"),
      evidence("true-maki-e-status", "status", product.key, "sold-out marker"),
    ],
  },
  timeline: [
    { key: "true-maki-e-noto-2024", title: "四件签名作品的能登地震后完成背景", eventType: "design_milestone", startDate: "2024-01", circa: false, description: "Wancher 商品页把 01/04–04/04 四件作品的完成背景放在 2024 年 1 月能登地震之后；页面没有给出独立上市年份。", sourceKey: product.key },
  ],
  media: [{ key: "true-maki-e-sakura-svg", title: "True Maki-e Sakura 材料、供墨与序号边界事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase505WancherTrueMakiESakuraPacks: CuratedEntityPack[] = [pack];
