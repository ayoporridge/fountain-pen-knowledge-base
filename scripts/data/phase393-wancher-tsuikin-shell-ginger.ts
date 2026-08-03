import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE392_WANCHER_BRAND_ID,
  phase392WancherBonsaiPacks,
} from "./phase392-wancher-tsuikin-bonsai";

export const PHASE393_WANCHER_BRAND_ID = PHASE392_WANCHER_BRAND_ID;
export const PHASE393_SHELL_GINGER_ID =
  "phase393-pen-wancher-ryukyu-tsuikin-shell-ginger";
export const PHASE393_SHELL_GINGER_SLUG =
  "wancher-ryukyu-tsuikin-shell-ginger";
export const PHASE393_SHELL_GINGER_NAME =
  "Wancher Dream Pen Ryukyu Tsuikin Shell Ginger";
const RETRIEVED = "2026-08-03";
const SCOPE = "phase393-wancher-shell-ginger-current";

function rewriteIds(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replaceAll("phase392", "phase393")
      .replaceAll("wancher-ryukyu-tsuikin-bonsai", "wancher-ryukyu-tsuikin-shell-ginger")
      .replaceAll("tsuikin-bonsai", "tsuikin-shell-ginger")
      .replaceAll("bonsai-product", "shell-ginger-product")
      .replaceAll("bonsai-svg", "shell-ginger-svg")
      .replaceAll(
        "https://www.wancherpen.com/products/tsuikin-bonsai",
        "https://www.wancherpen.com/products/dream-pen-tsuikin-shell-ginger",
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

const [brand, model] = structuredClone(
  rewriteIds(phase392WancherBonsaiPacks),
) as CuratedEntityPack[];
const product = model.sources.find((source) =>
  source.key.endsWith("shell-ginger-product"),
);
const collection = model.sources.find((source) =>
  source.key.endsWith("ryukyu-tsuikin-collection"),
);
const dream = model.sources.find((source) =>
  source.key.endsWith("dream-pen-collection"),
);
const care = model.sources.find((source) => source.key.endsWith("product-care"));
const svg = model.sources.find((source) => source.key.endsWith("shell-ginger-svg"));
if (!product || !collection || !dream || !care || !svg) {
  throw new Error("Phase 393 source rewrite lost a required Wancher source.");
}

product.title = "Dream Pen Ryukyu Tsuikin Shell Ginger — Wancher official";
product.summary =
  "官方具体商品页确认 Shell Ginger、$900 USD 标价与检索时 Sold out、ABS/Tamesukashi/Tsuikin Urushi、透明 demonstrator、立体月桃叶花、三条尖材路线、三类 feed、欧规 C/C、气密帽和包装；文字未公布尺寸重量。";
collection.summary =
  "官方集合页解释 2022 冲绳回归日本 50 周年纪念语境、琉球漆艺历史、Tsuikin 工艺，并将 Shell Ginger 与 Twin Dragons、Hibiscus、Bonsai、Kanhizakura 等具体主题并列。";
dream.summary =
  "官方 Dream Pen 集合页确认 Dream Pen 是跨材料、跨传统工艺的系列入口，不把系列宣传替代 Shell Ginger 的具体规格。";
svg.title = "Wancher Ryukyu Tsuikin Shell Ginger factual identity card";
svg.summary =
  "本站原创 factual SVG；表达 ABS demonstrator、琥珀 Tamesukashi、月桃叶花、Tsuikin Urushi 与尖材/feed 边界，非产品照片。";

const kew: CuratedSource = {
  key: `${SCOPE}-kew-shell-ginger`,
  registryKey: "kew-powo-alpinia-zerumbet-phase393",
  registryName: "Royal Botanic Gardens, Kew — Plants of the World Online",
  sourceType: "official",
  tier: "professional_secondary",
  independenceGroup: "kew-powo-alpinia-zerumbet-phase393",
  title: "Alpinia zerumbet (Pers.) B.L.Burtt & R.M.Sm. — Plants of the World Online",
  url: "https://powo.science.kew.org/taxon/872083-1",
  homepageUrl: "https://powo.science.kew.org/",
  itemType: "web_page",
  author: "Royal Botanic Gardens, Kew",
  publishedAt: null,
  retrievedAt: RETRIEVED,
  summary:
    "Kew 植物学资料用于 shell ginger / 月桃常见名称的物种边界；不用于证明 Wancher 图案的具体栽培品种或装饰来源。",
  allowedUse: "summary_only",
  archiveUrl: "https://powo.science.kew.org/taxon/872083-1",
  archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=accepted-name-and-common-name-boundary`,
};

const sourceKey = (source: CuratedSource): string => source.key;

function claim(
  key: string,
  predicate: string,
  objectText: string,
  source: CuratedSource,
  factClass: "core" | "editorial" = "core",
  locator = "official product/collection/care section",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey: sourceKey(source),
    locator,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey: sourceKey(source),
        scopeKey: SCOPE,
        locator,
      },
    ],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  source: CuratedSource,
): CuratedSpecEvidence {
  return {
    key,
    fieldKey,
    sourceKey: sourceKey(source),
    scopeKey: SCOPE,
    locator: "official specification or collection section",
    qualifies: true,
  };
}

model.entityId = PHASE393_SHELL_GINGER_ID;
model.expectedSlug = PHASE393_SHELL_GINGER_SLUG;
model.canonicalName = PHASE393_SHELL_GINGER_NAME;
model.key = `${PHASE393_SHELL_GINGER_ID}-v1`;
model.markdownFile =
  ".planning/content-research/wancher-tsuikin-shell-ginger-phase393.md";
model.storyTitle = "Wancher Ryukyu Tsuikin Shell Ginger：黄昏色里的月桃立体堆锦";
model.primarySourceKey = sourceKey(product);
model.aliases = [
  {
    alias: "Dream Pen Ryukyu Tsuikin Shell Ginger",
    language: "en",
    sourceKey: sourceKey(product),
  },
  {
    alias: "Dream Pen Tsuikin Shell Ginger Fountain Pen",
    language: "en",
    sourceKey: sourceKey(collection),
  },
  {
    alias: "ドリームペン 堆錦・月桃",
    language: "ja",
    sourceKey: sourceKey(collection),
  },
  {
    alias: "Wancher Tsuikin Shell Ginger",
    language: "en",
    sourceKey: sourceKey(product),
  },
  {
    alias: "万佳 Dream Pen 琉球堆锦月桃",
    language: "zh",
    sourceKey: sourceKey(product),
  },
];
model.scopes = [
  {
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "current",
    market: "Wancher international Shell Ginger product and official collection/care references",
    nibScope: "#6 JoWo stainless steel、Wancher 18K gold、Keiryu/Kodachi；尖幅需按订单确认",
    materialScope: "ABS、Tamesukashi（Aizu Urushi）、Tsuikin Urushi；透明/琥珀底层与立体月桃叶花朵",
    editionScope: "Dream Pen Ryukyu Tsuikin Shell Ginger 具体型号；不与 Hibiscus、Bonsai、Twin Dragons 合并",
  },
];
model.sources = [
  ...model.sources.filter((source) => source.key !== "phase393-kyoto-museum-imperial-dragons"),
  kew,
];
model.claims = [
  claim(
    `${SCOPE}-identity`,
    "model_identity",
    "Dream Pen Ryukyu Tsuikin Shell Ginger 是 Wancher 国际商品页的独立具体型号；日本页面的“堆錦・月桃”是同一型号的别名，不把相邻主题合并进来。",
    product,
  ),
  claim(
    `${SCOPE}-availability`,
    "availability",
    "2026-08-03 检索时国际商品页标价 $900 USD 并显示 Sold out；这是日期化市场状态，不是永久停产或固定全球价格承诺。",
    product,
  ),
  claim(
    `${SCOPE}-series`,
    "series_position",
    "Wancher 将 Shell Ginger 放在 Dream Pen Ryukyu Tsuikin 集合中，与 Twin Dragons、Hibiscus、Bonsai 和 Kanhizakura 等具体主题并列。",
    collection,
  ),
  claim(
    `${SCOPE}-motif`,
    "design_motif",
    "官方将 Shell Ginger 描述为透明 demonstrator body 上的琥珀色 Tamesukashi Urushi、立体月桃叶和淡粉色花朵；黄昏和海面是商品叙事，不补图案尺寸。",
    product,
  ),
  claim(
    `${SCOPE}-craft`,
    "craft_process",
    "官方 Tsuikin 工序包括制作 Tsuikin-mochi、擀薄、切图、贴附、刻线和着色；不据此推断本支笔制作天数、漆层次数或个人匠人手法。",
    collection,
  ),
  claim(
    `${SCOPE}-material`,
    "material_and_art",
    "规格为 ABS、Tamesukashi（Aizu Urushi）、Tsuikin Urushi；ABS 是基材，Tamesukashi 是琥珀色漆面语境，Tsuikin Urushi 支撑立体月桃装饰。",
    product,
  ),
  claim(
    `${SCOPE}-nib`,
    "nib_options",
    "商品页列出 #6 JoWo stainless steel、Wancher 18K gold、Keiryu/Kodachi 三条尖材路线；固定尖幅、弹性和写感未在正文完整公布。",
    product,
  ),
  claim(
    `${SCOPE}-feed`,
    "feed_options",
    "Feed 选项为 plastic、ebonite black、ebonite red；颜色只描述 feed，不把 ABS 笔身改写成 ebonite，也不跨型号复制未公布的兼容矩阵。",
    product,
  ),
  claim(
    `${SCOPE}-filling`,
    "filling_system",
    "Shell Ginger 使用 European International Standard cartridge 或 converter，包装列出木盒、Pen Kimono、说明材料、Certificate、converter 和 cartridge。",
    product,
  ),
  claim(
    `${SCOPE}-cap`,
    "cap_design",
    "官方将帽盖描述为 compact air-tight cap，用于减少墨水干燥；气密不是长期免清洗保证。",
    product,
  ),
  claim(
    `${SCOPE}-care`,
    "maintenance_guidance",
    "官方护理边界要求 Urushi 避免直射光、干燥和极端天气；立体叶片花朵不应硬擦，清洁应避开化学剂、抛光膏、硬刷和超声波。",
    care,
    "editorial",
  ),
  claim(
    `${SCOPE}-botanical-boundary`,
    "botanical_name_boundary",
    "Kew Plants of the World Online 将常见 shell ginger 对应到 Alpinia zerumbet；这是名称边界，不证明 Wancher 图案的具体栽培品种或装饰来源。",
    kew,
    "core",
    "Kew accepted name and common-name boundary",
  ),
  claim(
    `${SCOPE}-size-boundary`,
    "specification_boundary",
    "当前商品页只提供 Size & Shape 图片，没有在文字中公布笔长、直径、重量或漆层厚度；不从其他 Dream Pen 型号借用数字。",
    product,
  ),
  claim(
    `${SCOPE}-media`,
    "media_identity_boundary",
    "本站原创 factual SVG 只表达 ABS demonstrator、琥珀 Tamesukashi、月桃叶花、尖材和 feed 选项，并标明非产品照片、非 Logo、非真实比例、非颜色校样。",
    svg,
    "editorial",
  ),
];
model.variants = [
  {
    key: `${SCOPE}-nib-jowo`,
    name: "#6 JoWo stainless steel nib",
    notes: "官方尖材路线；固定尖幅和写感需按订单确认。",
    sourceKey: sourceKey(product),
    variantKind: "nib",
    market: "Wancher international listing",
  },
  {
    key: `${SCOPE}-nib-18k`,
    name: "Wancher 18K gold nib",
    notes: "官方尖材路线；不把 18K 名称扩展为固定软硬度结论。",
    sourceKey: sourceKey(product),
    variantKind: "nib",
    market: "Wancher international listing",
  },
  {
    key: `${SCOPE}-nib-keiryu`,
    name: "Keiryu/Kodachi nib",
    notes: "官方列出的 Keiryu/Kodachi 路线；具体升级条件和尖幅需按订单确认。",
    sourceKey: sourceKey(product),
    variantKind: "nib",
    market: "Wancher international listing",
  },
  {
    key: `${SCOPE}-feed-plastic`,
    name: "plastic feed",
    notes: "官方 feed 选项；不与其他主题或颜色绑定。",
    sourceKey: sourceKey(product),
    variantKind: "variant",
    market: "Wancher international listing",
  },
  {
    key: `${SCOPE}-feed-ebonite-black`,
    name: "ebonite black feed",
    notes: "官方 feed 选项；只记录颜色，不推导整笔基材。",
    sourceKey: sourceKey(product),
    variantKind: "variant",
    market: "Wancher international listing",
  },
  {
    key: `${SCOPE}-feed-ebonite-red`,
    name: "ebonite red feed",
    notes: "官方 feed 选项；跨尖材兼容矩阵未在页面完整公布。",
    sourceKey: sourceKey(product),
    variantKind: "variant",
    market: "Wancher international listing",
  },
];
model.spec = {
  brandEntityId: PHASE393_WANCHER_BRAND_ID,
  values: {
    series_name: "Dream Pen Ryukyu Tsuikin",
    release_year: "系列纪念语境为 2022-05-15 冲绳回归日本 50 周年；Shell Ginger 独立首发年份未核验",
    origin_country: "Wancher 将 Tsuikin 置于冲绳琉球漆艺语境；各部件完整原产地未逐项披露",
    nib: "#6 JoWo stainless steel、Wancher 18K gold、Keiryu/Kodachi",
    fill_system: "European International Standard cartridge 或 converter",
    material: "ABS、Tamesukashi（Aizu Urushi）、Tsuikin Urushi",
    dimensions: "未公布（官方商品页只提供 Size & Shape 图片）",
    weight: "未公布（官方商品页未提供文字重量）",
    price_range: "$900 USD（2026-08-03 国际商品页标价；检索时 Sold out）",
    status: "Dream Pen Ryukyu Tsuikin Shell Ginger 具体型号；透明 demonstrator/Tamesukashi 外观保持同一商品身份",
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
    title: "Ryukyu Tsuikin Shell Ginger 事实图（非产品照片）",
    sourceKey: sourceKey(svg),
    localPath:
      "/images/library/site-original/phase393/wancher/tsuikin-shell-ginger.svg",
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText:
      "本站原创 factual SVG；非产品照片、非 Logo、非真实比例图、非颜色校样。",
    sourceUrl:
      "/images/library/site-original/phase393/wancher/tsuikin-shell-ginger.svg",
    usageStatus: "primary",
  },
];

brand.key = "phase393-wancher-brand-shell-ginger-navigation-v1";
const modelSourcesByKey = new Map(model.sources.map((source) => [source.key, source]));
brand.sources = brand.sources
  .filter((source) => source.key !== "phase393-kyoto-museum-imperial-dragons")
  .map((source) => modelSourcesByKey.get(source.key) ?? source);
brand.sources.push(kew);
brand.claims = brand.claims.map((item) =>
  item.key.endsWith("-brand-navigation")
    ? {
        ...item,
        objectText:
          "Wancher 品牌页新增 Ryukyu Tsuikin Shell Ginger 具体型号入口；Shell Ginger 与 Hibiscus、Bonsai、Twin Dragons、Kanhizakura 保持独立，不把 feed 颜色另建为型号。",
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
    editionScope:
      "Wancher 品牌页新增 Ryukyu Tsuikin Shell Ginger 具体型号入口；透明/Tamesukashi 外观保留在同一实体",
  },
];

export const phase393WancherShellGingerPacks: CuratedEntityPack[] = [
  brand,
  model,
];
