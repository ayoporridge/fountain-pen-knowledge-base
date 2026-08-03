import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSpecEvidence,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE390_WANCHER_BRAND_ID,
  phase390WancherTwinDragonsRedPacks,
} from "./phase390-wancher-tsuikin-twin-dragons-red-urushi";

export const PHASE392_WANCHER_BRAND_ID = PHASE390_WANCHER_BRAND_ID;
export const PHASE392_BONSAI_ID = "phase392-pen-wancher-ryukyu-tsuikin-bonsai";
export const PHASE392_BONSAI_SLUG = "wancher-ryukyu-tsuikin-bonsai";
export const PHASE392_BONSAI_NAME = "Wancher Dream Pen Ryukyu Tsuikin Bonsai";
const RETRIEVED = "2026-08-03";
const SCOPE = "phase392-wancher-bonsai-current";

function rewriteIds(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replaceAll("phase390", "phase392")
      .replaceAll("twin-dragons-red-urushi", "bonsai")
      .replaceAll("twin-dragons-red-product", "bonsai-product")
      .replaceAll("twin-dragons-red-svg", "bonsai-svg")
      .replaceAll(
        "https://www.wancherpen.com/products/tsuikin-twin-dragons-red-urushi",
        "https://www.wancherpen.com/products/tsuikin-bonsai",
      );
  }
  if (Array.isArray(value)) return value.map((item) => rewriteIds(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, rewriteIds(item)]),
    );
  }
  return value;
}

const [brand, model] = rewriteIds(phase390WancherTwinDragonsRedPacks) as CuratedEntityPack[];
const product = model.sources.find((source) => source.key.endsWith("bonsai-product"));
const collection = model.sources.find((source) => source.key.endsWith("ryukyu-tsuikin-collection"));
const dream = model.sources.find((source) => source.key.endsWith("dream-pen-collection"));
const care = model.sources.find((source) => source.key.endsWith("product-care"));
const museum = model.sources.find((source) => source.key.endsWith("kyoto-museum-imperial-dragons"));
const svg = model.sources.find((source) => source.key.endsWith("bonsai-svg"));
if (!product || !collection || !dream || !care || !museum || !svg) {
  throw new Error("Phase 392 source rewrite lost a required Wancher source.");
}

product.title = "Ryukyu Tsuikin Bonsai Fountain Pen — Wancher official";
product.summary =
  "官方具体商品页确认 Ryukyu Tsuikin Bonsai 盆栽主题、$900 USD 起始标价、Original/Tamesukashi、Ebonite/Tamesukashi/Tsuikin Urushi、Keiryu/Kodachi/Jowo #6、两种 feed、欧规 C/C、气密帽和包装；当前页不公布文字尺寸重量。";
collection.summary =
  "官方集合页解释 2022 冲绳回归日本 50 周年纪念语境、琉球漆艺历史、Tsuikin 工艺，并将 Bonsai 与 Twin Dragons、Hibiscus、Shell Ginger、Kanhizakura 等具体主题并列。";
dream.summary =
  "官方 Dream Pen 集合页确认 Dream Pen 是跨材料、跨传统工艺的系列入口，不把系列宣传替代 Bonsai 的具体规格。";
svg.title = "Wancher Ryukyu Tsuikin Bonsai factual identity card";
svg.summary =
  "本站原创 factual SVG；表达黑色 Ebonite、盆栽枝叶花朵、Tsuikin Urushi、Original/Tamesukashi 与尖材/feed 边界，非产品照片。";

const sourceKey = (source: CuratedSource): string => source.key;

function claim(
  key: string,
  predicate: string,
  objectText: string,
  source: CuratedSource,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey: sourceKey(source),
    locator: "official product/collection/care section",
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey: sourceKey(source),
        scopeKey: SCOPE,
        locator: "official product/collection/care section",
      },
    ],
  };
}

function evidence(key: string, fieldKey: SpecFieldKey, source: CuratedSource): CuratedSpecEvidence {
  return {
    key,
    fieldKey,
    sourceKey: sourceKey(source),
    scopeKey: SCOPE,
    locator: "official specification or collection section",
    qualifies: true,
  };
}

model.entityId = PHASE392_BONSAI_ID;
model.expectedSlug = PHASE392_BONSAI_SLUG;
model.canonicalName = PHASE392_BONSAI_NAME;
model.key = `${PHASE392_BONSAI_ID}-v1`;
model.markdownFile = ".planning/content-research/wancher-tsuikin-bonsai-phase392.md";
model.storyTitle = "Wancher Ryukyu Tsuikin Bonsai：把盆景放进一支堆锦笔";
model.primarySourceKey = sourceKey(product);
model.aliases = [
  { alias: "Ryukyu Tsuikin Bonsai Fountain Pen", language: "en", sourceKey: sourceKey(product) },
  { alias: "Dream Pen Tsuikin Bonsai Fountain Pen", language: "en", sourceKey: sourceKey(collection) },
  { alias: "ドリームペン 堆錦・盆栽", language: "ja", sourceKey: sourceKey(collection) },
  { alias: "Wancher Tsuikin Bonsai", language: "en", sourceKey: sourceKey(product) },
  { alias: "万佳 Dream Pen 琉球堆锦盆栽", language: "zh", sourceKey: sourceKey(product) },
];
model.scopes = [
  {
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "current",
    market: "Wancher international current Bonsai product and official collection/care references",
    nibScope: "Keiryu、Keiryu Kodachi、Jowo #6；尖幅和升级条件随页面/订单确认",
    materialScope: "Ebonite、Tamesukashi（Aizu Urushi）、Tsuikin Urushi；clay/Urushi 盆栽装饰",
    editionScope: "Ryukyu Tsuikin Bonsai 具体型号；Original/Tamesukashi 为 finishing 变体",
  },
];
model.claims = [
  claim(`${SCOPE}-identity`, "model_identity", "Ryukyu Tsuikin Bonsai Fountain Pen 是 Wancher 当前国际商品页的具体型号；Bonsai 是主题，Original/Tamesukashi 是同一商品页中的 finishing 选项。", product),
  claim(`${SCOPE}-availability`, "availability", "2026-08-03 检索时国际商品页标价 $900 USD 并可继续购买流程；这是日期化页面状态，不是长期库存或固定全球价格承诺。", product),
  claim(`${SCOPE}-series`, "series_position", "Wancher 将 Bonsai 放在 Dream Pen Ryukyu Tsuikin 集合中，与 Twin Dragons、Hibiscus、Shell Ginger 和 Kanhizakura 等具体主题并列。", collection),
  claim(`${SCOPE}-bonsai-motif`, "design_motif", "官方将 Bonsai 描述为黑色笔身上的枝条、绿色叶片和一枝浅粉花的盆景意象，图案以 clay 与 Urushi 制作；不据图片补树种或花种。", product),
  claim(`${SCOPE}-tsuikin`, "craft_process", "官方 Tsuikin 说明包括制作 Tsuikin-mochi、擀薄、切图、贴附、刻线和着色；Bonsai 商品页另强调立体 clay/Urushi 盆景装饰。", collection),
  claim(`${SCOPE}-finishing`, "finishing_options", "商品页提供 Original 与 Tamesukashi 两种 finishing；Tamesukashi 使用琥珀色半透明 Urushi 增加一层表面处理，使盆景呈现被封在琥珀中的秋季视觉。", product),
  claim(`${SCOPE}-material`, "material_and_art", "规格为 Ebonite、Tamesukashi（Aizu Urushi）、Tsuikin Urushi；页面没有公开漆层厚度、clay 比例或装饰克重。", product),
  claim(`${SCOPE}-nib`, "nib_options", "Bonsai 是 Keiryu Exclusive，标准为定制不锈钢 Keiryu nib；页面列出 Keiryu Kodachi 升级和 Jowo #6 路线，具体尖幅需按订单确认。", product),
  claim(`${SCOPE}-feed`, "feed_options", "Feed 为 Plastic 或 Ebonite；官方明确 Ebonite feed 只与 Jowo #6 兼容，不能跨尖材复制到 Keiryu/Kodachi。", product),
  claim(`${SCOPE}-filling`, "filling_system", "Bonsai 使用 European International Standard cartridge 或 converter，包装列出 converter、cartridge、Pen Kimono、说明材料、Certificate 和传统日式木盒。", product),
  claim(`${SCOPE}-cap`, "cap_design", "官方将帽盖描述为 compact air-tight cap，用于减少墨水干燥；它不是永远不干或免清洗保证。", product),
  claim(`${SCOPE}-care`, "maintenance_guidance", "官方护理页建议 Urushi 避免直射光、干燥和极端天气，Ebonite 避免长时间浸泡和化学清洁剂；凸起盆景装饰不应强力擦拭。", care, "editorial"),
  claim(`${SCOPE}-size-boundary`, "specification_boundary", "当前商品页没有公布文字尺寸和重量；不从 Twin Dragons 或其他 Dream Pen 型号借用数字。", product),
  claim(`${SCOPE}-media`, "media_identity_boundary", "本站原创 factual SVG 只表达 Bonsai 的黑色 Ebonite、枝叶花朵、Original/Tamesukashi、尖材和 feed 兼容边界，并标明非产品照片、非 Logo、非真实比例、非颜色校样。", svg, "editorial"),
  {
    key: `${SCOPE}-secondary-boundary`,
    predicate: "visual_context_boundary",
    objectText:
      "京都国立博物馆的龙纹资料在本条只作一般东亚装饰史背景；它不证明 Bonsai 盆景主题来自龙纹，也不替代 Wancher 商品页对具体型号的说明。",
    factClass: "core",
    confidence: 0.95,
    sourceKey: sourceKey(museum),
    locator: "Kyoto National Museum dragon character history; boundary-only use",
    evidence: [
      {
        key: `${SCOPE}-secondary-boundary-evidence`,
        sourceKey: sourceKey(museum),
        scopeKey: SCOPE,
        locator: "Kyoto National Museum dragon character history; boundary-only use",
      },
    ],
  },
];
model.variants = [
  {
    key: `${SCOPE}-finishing-original`,
    name: "Original finishing",
    notes: "官方商品页 Finishing 选项；具体漆面视觉以实物和订单为准。",
    sourceKey: sourceKey(product),
    variantKind: "variant",
    market: "Wancher international listing",
  },
  {
    key: `${SCOPE}-finishing-tamesukashi`,
    name: "Tamesukashi finishing",
    notes: "官方商品页 Finishing 选项；增加琥珀色半透明 Urushi 层，不把它改写成独立型号。",
    sourceKey: sourceKey(product),
    variantKind: "variant",
    market: "Wancher international listing",
  },
  {
    key: `${SCOPE}-nib-keiryu`,
    name: "Keiryu stainless steel nib",
    notes: "Keiryu Exclusive 页面所列的定制不锈钢尖路线；固定尖幅未在商品正文公布。",
    sourceKey: sourceKey(product),
    variantKind: "nib",
    market: "Wancher international listing",
  },
  {
    key: `${SCOPE}-nib-kodachi`,
    name: "Keiryu Kodachi nib",
    notes: "官方升级路线；检索时页面写额外 40 USD，价格与可用性随页面变化。",
    sourceKey: sourceKey(product),
    variantKind: "nib",
    market: "Wancher international listing",
  },
  {
    key: `${SCOPE}-nib-jowo`,
    name: "Jowo #6 nib",
    notes: "官方规格列出的另一条尖材路线；固定尖幅和写感未公布。",
    sourceKey: sourceKey(product),
    variantKind: "nib",
    market: "Wancher international listing",
  },
  {
    key: `${SCOPE}-feed-plastic`,
    name: "plastic feed",
    notes: "官方 feed 选项；不把它与 Tamesukashi 或某个花色绑定。",
    sourceKey: sourceKey(product),
    variantKind: "variant",
    market: "Wancher international listing",
  },
  {
    key: `${SCOPE}-feed-ebonite`,
    name: "ebonite feed",
    notes: "官方 feed 选项，明确只与 Jowo #6 兼容。",
    sourceKey: sourceKey(product),
    variantKind: "variant",
    market: "Wancher international listing",
  },
];
model.spec = {
  brandEntityId: PHASE392_WANCHER_BRAND_ID,
  values: {
    series_name: "Dream Pen Ryukyu Tsuikin",
    release_year: "系列纪念语境为 2022-05-15 冲绳回归日本 50 周年；Bonsai 独立首发年份未核验",
    origin_country: "Wancher 将 Tsuikin 置于冲绳琉球漆艺语境；各部件完整原产地未逐项披露",
    nib: "Keiryu、Keiryu Kodachi、Jowo #6",
    fill_system: "European International Standard cartridge 或 converter",
    material: "Ebonite、Tamesukashi（Aizu Urushi）、Tsuikin Urushi",
    dimensions: "官方当前商品页未公布文字尺寸",
    weight: "官方当前商品页未公布文字重量",
    price_range: "$900 USD（2026-08-03 国际官方页标价；Finishing 与尖材升级另计）",
    status: "Ryukyu Tsuikin Bonsai 具体型号；Original/Tamesukashi 为 finishing 变体",
  },
  evidence: [
    evidence(`${SCOPE}-spec-brand`, "brand_entity_id", product),
    evidence(`${SCOPE}-spec-series`, "series_name", collection),
    evidence(`${SCOPE}-spec-release`, "release_year", collection),
    evidence(`${SCOPE}-spec-origin`, "origin_country", collection),
    evidence(`${SCOPE}-spec-nib`, "nib", product),
    evidence(`${SCOPE}-spec-fill`, "fill_system", product),
    evidence(`${SCOPE}-spec-material`, "material", product),
    evidence(`${SCOPE}-spec-dimensions`, "dimensions", product),
    evidence(`${SCOPE}-spec-weight`, "weight", product),
    evidence(`${SCOPE}-spec-price`, "price_range", product),
    evidence(`${SCOPE}-spec-status`, "status", product),
  ],
};
model.media = [
  {
    key: `${SCOPE}-primary-media`,
    title: "Ryukyu Tsuikin Bonsai 事实图（非产品照片）",
    sourceKey: sourceKey(svg),
    localPath: "/images/library/site-original/phase392/wancher/tsuikin-bonsai.svg",
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非真实比例图、非颜色校样。",
    sourceUrl: "/images/library/site-original/phase392/wancher/tsuikin-bonsai.svg",
    usageStatus: "primary",
  },
];

brand.key = "phase392-wancher-brand-bonsai-navigation-v1";
const modelSourcesByKey = new Map(model.sources.map((source) => [source.key, source]));
brand.sources = brand.sources.map(
  (source) => modelSourcesByKey.get(source.key) ?? source,
);
brand.claims = brand.claims.map((item) =>
  item.key.endsWith("-brand-navigation")
    ? {
        ...item,
        objectText:
          "Wancher 品牌页新增 Ryukyu Tsuikin Bonsai 具体型号入口；Twin Dragons、Hibiscus、Shell Ginger 和 Kanhizakura 保持独立，不把 Original/Tamesukashi 另建为型号。",
      }
    : item,
);
brand.scopes = [
  ...brand.scopes,
  {
    key: `${SCOPE}-brand`,
    scopeKey: `${SCOPE}-brand`,
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope: "Wancher 品牌页新增 Ryukyu Tsuikin Bonsai 具体型号入口；finishing 选择保留在同一实体",
  },
];

export const phase392WancherBonsaiPacks: CuratedEntityPack[] = [brand, model];
