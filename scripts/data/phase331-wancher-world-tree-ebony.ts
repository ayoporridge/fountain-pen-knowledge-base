import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE107_WANCHER_ID,
  phase107WancherBrandPack,
} from "./phase107-wancher-dream-pen-true-ebonite-matte-black";

export const PHASE331_WANCHER_BRAND_ID = PHASE107_WANCHER_ID;
export const PHASE331_WORLD_TREE_EBONY_ID =
  "phase331-pen-wancher-world-tree-ebony";
export const PHASE331_WORLD_TREE_EBONY_SLUG = "wancher-world-tree-ebony";

const RETRIEVED = "2026-07-28";
const SCOPE = "phase331-wancher-world-tree-ebony-current";
const SVG_PATH =
  "/images/library/site-original/phase331/wancher/world-tree-ebony.svg";

function source(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  registryKey: string;
  registryName: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup?: string;
  homepageUrl?: string;
  author?: string;
  publishedAt?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? "primary",
    independenceGroup: input.independenceGroup ?? input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl:
      input.homepageUrl ??
      (sourceType === "official" ? "https://www.wancherpen.com/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt ?? null,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only",
    license: sourceType === "user_submission" ? "site-original" : undefined,
    archiveUrl: input.url,
    archiveLocator:
      sourceType === "user_submission"
        ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
        : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
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
    confidence: factClass === "core" ? 0.98 : 0.94,
    sourceKey,
    locator,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey,
        scopeKey: SCOPE,
        locator,
      },
    ],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const SOURCES = {
  product: source({
    key: "phase331-wancher-world-tree-ebony-product",
    title: "World Tree Ebony Fountain Pen",
    url: "https://www.wancherpen.com/products/world-tree-ebony",
    registryKey: "wancher-official-world-tree-ebony-phase331",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-product-phase331",
    summary:
      "官方具体商品页确认 World Tree Ebony、天然乌木、可选 925 夹、converter/国际墨胆、#6 JoWo 不锈钢或 Wancher 18K/Keiyu-Kodachi 尖材、塑料或 ebonite feed 及木盒包装。",
  }),
  worldTree: source({
    key: "phase331-wancher-world-tree-collection",
    title: "World Tree Fountain Pen Collection",
    url: "https://www.wancherpen.com/collections/world-tree",
    registryKey: "wancher-official-world-tree-collection-phase331",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-collection-phase331",
    summary:
      "官方系列页给出 13.2 mm 直径、140.1/164.4 mm 长度、27/21 g 重量、925 clip、国际墨胆或 converter、木材与尖材选项。",
  }),
  sekai: source({
    key: "phase331-wancher-sekai-collection",
    title: "Sekai Fountain Pen Collection",
    url: "https://www.wancherpen.com/collections/sekai",
    registryKey: "wancher-official-sekai-collection-phase331",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-sekai-phase331",
    summary:
      "官方 Sekai collection 用于确认 World Tree 是 Sekai 语境下的木材路线，并与 Aizome/Urushi 等工艺路线保持边界。",
  }),
  sekaiAi: source({
    key: "phase331-wancher-sekai-ai-boundary",
    title: "Sekai Ai Fountain Pen",
    url: "https://www.wancherpen.com/products/sekai-ai",
    registryKey: "wancher-official-sekai-ai-phase331",
    registryName: "Wancher official",
    independenceGroup: "wancher-official-sekai-ai-phase331",
    summary:
      "官方 Sekai Ai 商品用于区分 Olive Wood + Aizome 染色、Dove Zogan 与夹件版本，不把该工艺 SKU 的材质和图像挪到 Ebony。",
  }),
  appelboom: source({
    key: "phase331-appelboom-world-tree-teak",
    title: "Wancher Sekai World Tree Teak Wood Fountain Pen",
    url: "https://appelboom.com/wancher-sekai-world-tree-teak-wood-fountain-pen/",
    registryKey: "appelboom-world-tree-teak-phase331",
    registryName: "Appelboom",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "appelboom-phase331",
    homepageUrl: "https://appelboom.com/",
    author: "Appelboom",
    summary:
      "专业零售商的 Teak sibling 页面交叉确认 World Tree 家族的天然木材和国际转换器/墨胆语境；不把 Teak 页面当作 Ebony 独有重量或纹理主源。",
  }),
  diagram: source({
    key: "phase331-wancher-world-tree-ebony-svg",
    title: "Wancher World Tree Ebony factual diagram",
    url: SVG_PATH,
    registryKey: "fountain-pen-graph-editorial-phase331-ebony",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase331",
    homepageUrl: "/",
    summary:
      "本站原创事实 SVG，提示乌木、可拆 925 夹、C/C 供墨和官方系列尺寸；非产品照片、非 Logo、非比例图、非颜色校样。",
  }),
} as const;

const model: CuratedEntityPack = {
  key: "phase331-wancher-world-tree-ebony-v1",
  entityId: PHASE331_WORLD_TREE_EBONY_ID,
  expectedType: "pen",
  expectedSlug: PHASE331_WORLD_TREE_EBONY_SLUG,
  canonicalName: "Wancher World Tree – Ebony",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/wancher-world-tree-ebony-phase331.md",
  storyTitle: "Wancher World Tree – Ebony：天然乌木与可拆银夹",
  primarySourceKey: SOURCES.product.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Wancher World Tree Ebony",
      language: "en",
      sourceKey: SOURCES.product.key,
    },
    {
      alias: "World Tree – Ebony",
      language: "en",
      sourceKey: SOURCES.worldTree.key,
    },
    {
      alias: "Wancher World Tree 乌木",
      language: "zh",
      sourceKey: SOURCES.product.key,
    },
    {
      alias: "万佳 World Tree 乌木",
      language: "zh",
      sourceKey: SOURCES.sekai.key,
    },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Wancher official World Tree Ebony current product",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "#6 JoWo stainless steel、Wancher 18K gold 或 Keiyu-Kodachi；实际尖材按订单 SKU",
      materialScope:
        "Natural ebony body and cap; natural wood colour and grain vary by piece",
      editionScope:
        "World Tree Ebony only; other World Tree woods and Sekai Ai remain separate SKUs",
    },
    {
      key: `${SCOPE}-boundary`,
      scopeKey: `${SCOPE}-boundary`,
      productionState: "current",
      editionScope:
        "Independent from World Tree Teak/Sandalwood/Verawood/Olive, Sekai Ai/Aizu Urushi, Dream Pen and Shizuku Glass Nib",
    },
    {
      key: `${SCOPE}-care`,
      scopeKey: `${SCOPE}-care`,
      productionState: "current",
      editionScope:
        "Soft-cloth and water care for wood; no alcohol or strong detergent; inspect clip, wood and feed before service",
    },
  ],
  claims: [
    claim(
      "phase331-ebony-identity",
      "model_identity",
      "World Tree – Ebony 是 Wancher Sekai collection 的具体天然乌木钢笔 SKU，不是 World Tree 系列导航，也不把其他木材或工艺版合并进来。",
      SOURCES.product.key,
      "official product title and Ebony material description",
    ),
    claim(
      "phase331-ebony-wood",
      "material",
      "乌木是笔身与笔帽的核心材料；天然木材存在颜色、纹理和细小外观差异，商品图不能当成每支实物的颜色校样。",
      SOURCES.product.key,
      "natural ebony and handmade/natural colour variation notice",
    ),
    claim(
      "phase331-ebony-clip",
      "clip",
      "官方提供无夹、925 matte silver clip 或 925 silver clip 选项；夹子由 Wancher 日本工作室制作，可拆附件，不是笔身不可分离结构。",
      SOURCES.product.key,
      "clip selector and Wancher-made clip description",
    ),
    claim(
      "phase331-ebony-dimensions",
      "specification",
      "World Tree 系列页面给出直径 13.2 mm、闭帽 140.1 mm、插帽 164.4 mm；这些是系列参考尺寸，不反推不同木材的密度或每支手工误差。",
      SOURCES.worldTree.key,
      "World Tree collection dimensions",
    ),
    claim(
      "phase331-ebony-weight",
      "weight",
      "官方系列参考重量为含夹 27 g、无夹 21 g；夹件状态会改变携带重量，数值不应回填到其他 World Tree 木材或 Sekai Ai。",
      SOURCES.worldTree.key,
      "World Tree collection weight with and without clip",
    ),
    claim(
      "phase331-ebony-fill",
      "filling_system",
      "World Tree – Ebony 使用 European International Standard cartridge 或 converter；商品包装包括墨胆、转换器和传统日式木盒。",
      SOURCES.product.key,
      "filling and package specifications",
    ),
    claim(
      "phase331-ebony-nib",
      "nib_options",
      "官方可选 #6 JoWo stainless steel、Wancher 18K gold 与 Keiyu/Kodachi；feed 另有 plastic、black ebonite、red ebonite，不能按木材颜色自动推定。",
      SOURCES.product.key,
      "nib and feed options",
    ),
    claim(
      "phase331-ebony-care",
      "maintenance",
      "换色时先清空墨水并以清水冲洗转换器和尖部；木面使用柔软布与清水，避免酒精、强清洁剂、热水和自行强拆夹件。",
      SOURCES.product.key,
      "wood-care and product handling boundary; routine cleaning editorial guidance",
      "editorial",
    ),
    claim(
      "phase331-ebony-family",
      "variant_boundary",
      "World Tree 的 Ebony、Teak、Sandalwood、Verawood 等是同一系列的材料 SKU；Sekai Ai 是 Olive Wood + Aizome 的另一商品，不能共享 Ebony 的材质、重量或图像。",
      SOURCES.sekaiAi.key,
      "Sekai and Sekai Ai product boundary",
    ),
    claim(
      "phase331-ebony-cross-check",
      "professional_cross_check",
      "Appelboom 的 World Tree Teak 页面只作为专业零售交叉窗口，支持家族级天然木材和 C/C 语境；它不替代 Wancher Ebony 商品页，也不证明 Ebony 的纹理或重量。",
      SOURCES.appelboom.key,
      "retailer sibling-page scope limitation",
    ),
    claim(
      "phase331-ebony-media",
      "media_identity_boundary",
      "主图是本站原创 factual SVG，非产品照片、非 Logo、非比例图、非颜色校样，不证明实物木纹、库存或实际尖材组合。",
      SOURCES.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase331-ebony-clip",
      name: "Clipless / 925 matte silver clip / 925 silver clip",
      notes: "官方可选夹件；夹子可拆，三项不建立三个基础型号。",
      sourceKey: SOURCES.product.key,
      variantKind: "market_sku",
      market: "Wancher international listing",
    },
    {
      key: "phase331-ebony-wood-family",
      name: "Ebony / Sandalwood / Verawood / Teak / Olive World Tree family",
      notes:
        "系列材料入口；本实体仅代表 Ebony，其他木材应按具体商品页核验。",
      sourceKey: SOURCES.worldTree.key,
      variantKind: "material",
      market: "Wancher World Tree collection",
    },
    {
      key: "phase331-ebony-nib-feed",
      name: "#6 JoWo stainless / Wancher 18K / Keiyu-Kodachi; plastic or ebonite feed",
      notes: "尖材和 feed 按订单组合，不能从颜色或木材自动推定。",
      sourceKey: SOURCES.product.key,
      variantKind: "nib",
      market: "Wancher international listing",
    },
  ],
  spec: {
    brandEntityId: PHASE331_WANCHER_BRAND_ID,
    values: {
      series_name: "Wancher World Tree – Ebony",
      release_year:
        "当前商品与系列页面读取于 2026-07-28；不据此推断首发年份",
      origin_country:
        "Wancher 日本品牌语境；官方明确夹子由日本工作室制作，但不把整支笔的制造地过度外推",
      nib: "#6 JoWo 不锈钢尖、Wancher 18K 金尖或 Keiyu-Kodachi；plastic/black ebonite/red ebonite feed",
      fill_system: "European International Standard cartridge 或 converter",
      material: "天然乌木笔身与笔帽；颜色、纹理和细小差异随实物变化",
      dimensions: "直径 13.2 mm；闭帽 140.1 mm；插帽 164.4 mm（World Tree 系列参考）",
      weight: "27 g（含 925 夹）；21 g（不含夹）",
      status:
        "Wancher 当前 World Tree Ebony 商品；夹件、木材、尖材、feed、包装与库存按 SKU 核对",
    },
    evidence: [
      evidence(
        "phase331-ebony-brand",
        "brand_entity_id",
        SOURCES.product.key,
        "Wancher official product context",
      ),
      evidence(
        "phase331-ebony-series",
        "series_name",
        SOURCES.product.key,
        "World Tree Ebony product title",
      ),
      evidence(
        "phase331-ebony-release",
        "release_year",
        SOURCES.product.key,
        "retrieval date only; launch year intentionally not asserted",
      ),
      evidence(
        "phase331-ebony-origin",
        "origin_country",
        SOURCES.product.key,
        "Wancher/Japan clip statement and conservative production boundary",
      ),
      evidence(
        "phase331-ebony-nib",
        "nib",
        SOURCES.product.key,
        "official nib and feed options",
      ),
      evidence(
        "phase331-ebony-fill",
        "fill_system",
        SOURCES.product.key,
        "official cartridge/converter specification",
      ),
      evidence(
        "phase331-ebony-material",
        "material",
        SOURCES.product.key,
        "natural ebony and colour variation notice",
      ),
      evidence(
        "phase331-ebony-dimensions",
        "dimensions",
        SOURCES.worldTree.key,
        "official World Tree collection dimensions",
      ),
      evidence(
        "phase331-ebony-weight",
        "weight",
        SOURCES.worldTree.key,
        "official World Tree collection weights",
      ),
      evidence(
        "phase331-ebony-status",
        "status",
        SOURCES.product.key,
        "current product page and mutable SKU boundary",
      ),
    ],
  },
  media: [
    {
      key: "phase331-ebony-primary-media",
      title: "Wancher World Tree – Ebony 事实图（非产品照片）",
      sourceKey: SOURCES.diagram.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary",
    },
  ],
};

export const phase331WancherWorldTreeEbonyPacks: CuratedEntityPack[] = [
  phase107WancherBrandPack,
  model,
];
