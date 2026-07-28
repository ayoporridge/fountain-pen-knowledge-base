import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE83_DIPLOMAT_BRAND_ID,
  phase83DiplomatLeonardoPacks,
} from "./phase83-diplomat-leonardo";

export const PHASE327_DIPLOMAT_BRAND_ID = PHASE83_DIPLOMAT_BRAND_ID;
export const PHASE327_VIPER_ID = "phase327-pen-diplomat-viper";
export const PHASE327_VIPER_SLUG = "diplomat-viper";
export const PHASE327_COBRA_ID = "phase327-pen-diplomat-cobra";
export const PHASE327_COBRA_SLUG = "diplomat-cobra";

const RETRIEVED = "2026-07-28";

function source(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  registryKey?: string;
  registryName?: string;
  homepageUrl?: string;
  author?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const registryKey = input.registryKey ?? "diplomat-official-phase327";
  return {
    key: input.key,
    registryKey,
    registryName:
      input.registryName ??
      (sourceType === "official"
        ? "Diplomat"
        : "Fountain Pen Graph editorial studio"),
    sourceType,
    tier: input.tier ?? "primary",
    independenceGroup: registryKey,
    title: input.title,
    url: input.url,
    homepageUrl:
      input.homepageUrl ??
      (sourceType === "official" ? "https://www.diplomat-pen.com/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author:
      input.author ??
      (sourceType === "official" ? "Diplomat" : "Fountain Pen Graph editorial"),
    publishedAt: null,
    retrievedAt: RETRIEVED,
    allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only",
    license: sourceType === "user_submission" ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator:
      sourceType === "user_submission"
        ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
        : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
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
    confidence: factClass === "core" ? 0.98 : 0.94,
    sourceKey,
    locator,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey,
        scopeKey,
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
  scopeKey: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const SOURCES = {
  collections: source({
    key: "phase327-diplomat-collections",
    title: "Diplomat collections — Viper and Cobra",
    url: "https://www.diplomat-pen.com/en/collections/",
    summary:
      "官方集合将 Viper 和 Cobra 分列：Viper 为 magnetic cap、hooded nib、铝制 chiselled body 和 F/M；Cobra 为深 guilloché、磁吸帽、黑色 PVD 饰件和四种钢尖。",
    locator: "Viper and Cobra collection sections",
  }),
  viperProduct: source({
    key: "phase327-diplomat-viper-product",
    title: "Diplomat Viper Guilloche Fountain Pen",
    url: "https://www.diplomat-pen.com/en/product/viper-guilloche-fountain-pen/",
    summary:
      "官方 Viper 商品页给出铝制笔身、闭帽 140 mm、插帽 150 mm、直径 11 mm、30 g、包覆式不锈钢尖、短国际墨胆、五年保修及银黑蓝棕绿颜色。",
    locator: "technical data, colours, nib selector and included cartridge",
  }),
  viperConverter: source({
    key: "phase327-diplomat-viper-converter",
    title: "Diplomat Viper Ink Convector",
    url: "https://www.diplomat-pen.com/en/product/viper-ink-convector/",
    summary:
      "官方另列 Viper 专用 plunger refill converter；标准 Diplomat 转换器商品明确把 Viper 排除在通用件外。",
    locator: "Viper-specific converter compatibility",
  }),
  cobraProduct: source({
    key: "phase327-diplomat-cobra-product",
    title: "Diplomat Cobra Guilloche Fountain Pen",
    url: "https://www.diplomat-pen.com/en/product/stylo-plume-cobra-guilloche/",
    summary:
      "官方 Cobra 商品页给出铝制笔身、深纹理、磁吸帽、黑色 PVD 饰件、EF/F/M/B 不锈钢尖、142/170/15 mm、39 g、转换器和标准国际墨胆。",
    locator: "technical data, nib sizes, filling and colour options",
  }),
  fountainArchive: source({
    key: "phase327-diplomat-fountain-archive",
    title: "Diplomat fountain pen catalogue archive",
    url: "https://www.diplomat-pen.com/en/type-of-product/fountain-pen/",
    summary:
      "官方钢笔归档把 Cobra 与 Viper 作为当前钢笔商品展示，并提供地区化价格快照；颜色库存不等同于历史全线。",
    locator: "current fountain pen listing and prices",
  }),
  guide: source({
    key: "phase327-diplomat-service-guide",
    title: "DIPLOMAT Service Guide & Warranty",
    url: "https://www.diplomat-pen.com/wp-content/uploads/2025/07/DIPLOMAT-Service-Guide-Warranty.pdf",
    summary:
      "官方服务指南用于清水清洁、转换器/墨胆使用、笔尖朝上运输和五年保修条件；不把维护建议误写成型号独有结构。",
    locator: "PDF pp. 33–41 fountain pen filling and cleaning; warranty section",
  }),
  viperReview: source({
    key: "phase327-pen-addict-viper",
    title: "Diplomat Viper Fountain Pen Review — The Pen Addict",
    url: "https://www.penaddict.com/blog/2025/3/30/diplomat-viper-fountain-pen-review",
    summary:
      "专业评测以书写样笔交叉记录 Viper 的包覆式尖、磁吸帽、轻量金属握持与转换器清洁边界；体验观察不替代官方尺寸。",
    locator: "review discussion of hooded nib, cap and filling",
    sourceType: "blog",
    tier: "professional_secondary",
    registryKey: "pen-addict-phase327-viper",
    registryName: "The Pen Addict",
    homepageUrl: "https://www.penaddict.com/",
    author: "The Pen Addict",
  }),
  viperRetailer: source({
    key: "phase327-wonder-pens-viper",
    title: "Diplomat Viper Fountain Pen — Wonder Pens",
    url: "https://wonderpens.ca/products/diplomat-fountain-pen-viper-guilloche-black",
    summary:
      "专业经销商页面提供 Viper 黑色 SKU 的在售与包装交叉资料，帮助核对颜色与标准短墨胆语境；不能覆盖所有颜色重量。",
    locator: "black Viper product details and package",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "wonder-pens-phase327-viper",
    registryName: "Wonder Pens",
    homepageUrl: "https://wonderpens.ca/",
    author: "Wonder Pens",
  }),
  cobraRetailer: source({
    key: "phase327-pen-chalet-cobra",
    title: "Diplomat Cobra Fountain Pens — Pen Chalet",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/diplomat_cobra_fountain_pens.html",
    summary:
      "专业经销商交叉列出 Cobra 的深 guilloché、磁吸帽、#6 JoWo 不锈钢尖、EF/F/M/B 与 standard international cartridge/converter；#6 仅作辅助核对。",
    locator: "Cobra specifications and nib/filling details",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "pen-chalet-phase327-cobra",
    registryName: "Pen Chalet",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
  }),
  cobraRetailerAlt: source({
    key: "phase327-appelboom-cobra",
    title: "Diplomat Cobra Matte Black Guilloche — Appelboom",
    url: "https://appelboom.com/diplomat-cobra-matte-black-guilloche-fountain-pen/",
    summary:
      "专业经销商以黑色 Cobra 商品交叉记录 guilloché、磁吸帽、PVD 饰件和约 142 mm/40 g 的测量；官方 39 g 仍是本页主规格。",
    locator: "black Cobra product measurements and finish",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "appelboom-phase327-cobra",
    registryName: "Appelboom",
    homepageUrl: "https://appelboom.com/",
    author: "Appelboom",
  }),
  viperDiagram: source({
    key: "phase327-diplomat-viper-svg",
    title: "Diplomat Viper factual diagram",
    url: "/images/library/site-original/phase327/diplomat/viper.svg",
    summary:
      "本站原创 Viper 事实 SVG，标示磁吸帽、包覆式尖和官方样本尺寸；非产品照片、非 Logo、非比例图、非颜色校样。",
    locator: "site-original factual SVG metadata",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase327-viper",
    registryName: "Fountain Pen Graph editorial studio",
  }),
  cobraDiagram: source({
    key: "phase327-diplomat-cobra-svg",
    title: "Diplomat Cobra factual diagram",
    url: "/images/library/site-original/phase327/diplomat/cobra.svg",
    summary:
      "本站原创 Cobra 事实 SVG，标示深 guilloché、磁吸帽和官方样本尺寸；非产品照片、非 Logo、非比例图、非颜色校样。",
    locator: "site-original factual SVG metadata",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase327-cobra",
    registryName: "Fountain Pen Graph editorial studio",
  }),
} as const;

const inheritedBrand = phase83DiplomatLeonardoPacks({
  excellenceA2: "phase83-pen-diplomat-excellence-a2",
  elox: "phase83-pen-diplomat-elox",
  momentoZero: "phase83-pen-leonardo-momento-zero",
  mzgMosaico: "phase83-pen-leonardo-mzg-mosaico",
}).find(
  (pack) =>
    pack.entityId === PHASE327_DIPLOMAT_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 327 Diplomat brand pack is unavailable.");

type ModelInput = {
  key: string;
  id: string;
  slug: string;
  name: string;
  markdownFile: string;
  storyTitle: string;
  summary: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  extra: CuratedSource[];
  diagram: CuratedSource;
  scope: string;
  aliases: Array<{ alias: string; language: string; sourceKey: string }>;
  claims: Array<[string, string, string, CuratedSource, string, ("core" | "editorial")?]>;
  variants: CuratedEntityPack["variants"];
  values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
  specEvidence: Array<[SpecFieldKey, CuratedSource, string]>;
};

function model(input: ModelInput): CuratedEntityPack {
  const sources = [input.primary, input.secondary, ...input.extra, input.diagram];
  return {
    key: `phase327-${input.key}-v1`,
    entityId: input.id,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.storyTitle,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases,
    sources,
    scopes: [
      {
        key: input.scope,
        scopeKey: input.scope,
        market: `${input.name} current official catalogue snapshot`,
        validFrom: "2026-01-01",
        productionState: "current",
        nibScope: input.values.nib,
        materialScope: input.values.material,
        editionScope: "颜色、饰件与尖幅是 SKU 变体；不与相邻 Diplomat 型号合并",
      },
      {
        key: `${input.scope}-boundary`,
        scopeKey: `${input.scope}-boundary`,
        productionState: "current",
        editionScope:
          "与 Viper/Cobra、Aero、Elox、Excellence A+ 和 A2 的帽机制、尺寸、尖幅与供墨边界",
      },
      {
        key: `${input.scope}-care`,
        scopeKey: `${input.scope}-care`,
        productionState: "current",
        editionScope: "Diplomat cartridge/converter filling, lukewarm-water cleaning and nib-up transport",
      },
    ],
    claims: input.claims.map(([key, predicate, text, sourceItem, locator, factClass]) =>
      claim(key, predicate, text, sourceItem.key, locator, input.scope, factClass),
    ),
    variants: input.variants,
    spec: {
      brandEntityId: PHASE327_DIPLOMAT_BRAND_ID,
      values: input.values,
      evidence: [
        evidence(
          `${input.key}-brand`,
          "brand_entity_id",
          input.primary.key,
          "Diplomat official model context",
          input.scope,
        ),
        ...input.specEvidence.map(([field, sourceItem, locator]) =>
          evidence(`${input.key}-${field}`, field, sourceItem.key, locator, input.scope),
        ),
      ],
    },
    media: [
      {
        key: `phase327-${input.key}-primary-media`,
        title: `${input.name} 事实卡（非产品照片）`,
        sourceKey: input.diagram.key,
        localPath: input.diagram.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
        sourceUrl: input.diagram.url,
        usageStatus: "primary",
      },
    ],
  };
}

const viper = model({
  key: "diplomat-viper",
  id: PHASE327_VIPER_ID,
  slug: PHASE327_VIPER_SLUG,
  name: "Diplomat Viper",
  markdownFile: ".planning/content-research/diplomat-viper-phase327.md",
  storyTitle: "Diplomat Viper：磁吸帽与包覆式尖的金属日用笔",
  summary:
    "Diplomat Viper 是铝制、雕刻纹理、磁吸帽钢笔；官方给出 140/150/11 mm、30 g，包覆式不锈钢尖，短国际墨胆，Viper 专用转换器另售。",
  primary: SOURCES.viperProduct,
  secondary: SOURCES.viperReview,
  extra: [
    SOURCES.collections,
    SOURCES.viperConverter,
    SOURCES.guide,
    SOURCES.viperRetailer,
  ],
  diagram: SOURCES.viperDiagram,
  scope: "phase327-diplomat-viper-current",
  aliases: [
    { alias: "Diplomat Viper", language: "en", sourceKey: SOURCES.viperProduct.key },
    { alias: "Viper Guilloche Fountain Pen", language: "en", sourceKey: SOURCES.viperProduct.key },
    { alias: "迪普洛玛 Viper", language: "zh", sourceKey: SOURCES.collections.key },
    { alias: "迪普洛玛 蝰蛇", language: "zh", sourceKey: SOURCES.viperProduct.key },
  ],
  claims: [
    ["viper-identity", "model_identity", "Viper 是 Diplomat 独立的铝制磁吸帽钢笔路线，不是 Aero 的沟槽改色，也不是 Cobra 的加粗版本。", SOURCES.viperProduct, "official product identity"],
    ["viper-cap", "cap_mechanism", "官方集合页以 magnetic cap 识别 Viper；它不是螺纹帽，磁力用于快速定位，不能横向扭动或甩动笔身。", SOURCES.collections, "magnetic cap collection description"],
    ["viper-nib", "nib_options", "Viper 使用包覆式/hooded stainless steel nib；集合页概括为 F/M，商品界面显示 Fine/Average，不把它扩写成 Cobra 的 EF/F/M/B。", SOURCES.collections, "hooded nib and F/M collection fields"],
    ["viper-spec", "specification", "当前官方 guilloché 商品快照为闭帽 140 mm、插帽 150 mm、直径 11 mm、30 g；这些数字只属于 Viper 商品样本。", SOURCES.viperProduct, "technical data"],
    ["viper-material", "material_finish", "笔身为铝，表面以雕刻/guilloché 纹理形成触感；银、黑、蓝、棕、绿是颜色变体，不是五个基础型号。", SOURCES.viperProduct, "material and colour selector"],
    ["viper-fill", "filling_system", "商品随一支短国际墨胆；Viper 专用转换器另有独立官方商品，标准 Diplomat 转换器页面明确排除 Viper。", SOURCES.viperConverter, "Viper converter compatibility and included cartridge"],
    ["viper-care", "maintenance", "换色或久置时按官方服务指南排空并以清水/温水冲洗，清洁后自然干燥；包覆式尖附近不要用针或硬物撬动。", SOURCES.guide, "fountain pen cleaning guidance"],
    ["viper-warranty", "warranty", "官方五年保修需完整证书、购买日期和授权经销商；撞击、正常磨损、未授权拆修和未推荐部件不在普通覆盖范围。", SOURCES.guide, "warranty terms"],
    ["viper-review-cross-check", "professional_cross_check", "The Pen Addict 的专业评测交叉记录包覆式尖、磁吸帽与轻量金属书写语境；体验观察不替代官方尺寸或保修条款。", SOURCES.viperReview, "review discussion of hooded nib and cap"],
    ["viper-retailer-cross-check", "retailer_cross_check", "Wonder Pens 的黑色商品页用于交叉核对当前颜色与包装语境；不把一个黑色 SKU 的库存或实测感受推广到所有颜色。", SOURCES.viperRetailer, "black Viper product details"],
    ["viper-boundary", "identity_boundaries", "Viper 的 140/150/11 mm、30 g、包覆式尖和专用 converter 边界，不应被复制给 Cobra 的 142/170/15 mm、39 g，或 Aero/Elox/A+。", SOURCES.collections, "Viper/Cobra/Aero collection boundary"],
    ["viper-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明真实比例、颜色、Logo、刻字、库存或具体实物品相。", SOURCES.viperDiagram, "site-original SVG metadata", "editorial"],
  ],
  variants: [
    { key: "phase327-viper-colours", name: "Silver / Black / Blue / Brown / Green", notes: "官方商品当前颜色选择；颜色按 SKU 记录，不建立五个基础实体。", sourceKey: SOURCES.viperProduct.key, variantKind: "color", market: "EU/国际经销" },
    { key: "phase327-viper-nib-fm", name: "F / M hooded stainless steel", notes: "系列页概括 F/M；商品地区界面可能使用 Fine/Average 文案，不扩大尖幅范围。", sourceKey: SOURCES.collections.key, variantKind: "nib" },
    { key: "phase327-viper-converter", name: "Viper dedicated converter", notes: "官方独立配件；不能把通用 Diplomat converter 当作 Viper 随笔附件。", sourceKey: SOURCES.viperConverter.key, variantKind: "market_sku" },
  ],
  values: {
    series_name: "Diplomat Viper",
    release_year: "当前官方目录可见；官网本页未给出可核实的首发年份",
    origin_country: "德国 Diplomat 产品线；具体制造与地区 SKU 按商品资料核验",
    nib: "包覆式/hooded 不锈钢尖；官方系列语境为 F/M",
    fill_system: "短国际墨胆；Viper 专用转换器另售，通用 Diplomat converter 排除 Viper",
    material: "铝制雕刻/guilloché 纹理笔身，磁吸帽",
    dimensions: "闭帽 140 mm、插帽 150 mm、直径 11 mm（官方商品快照）",
    weight: "30 g（官方 Viper guilloché 商品快照）",
    price_range: "官方归档快照约 €94；价格、税费与库存按日期和地区核对",
    status: "官方当前集合与商品页可见；颜色、尖幅和附件按 SKU",
  },
  specEvidence: [
    ["series_name", SOURCES.viperProduct, "official Viper product title"],
    ["release_year", SOURCES.collections, "current collection snapshot; no first-year claim"],
    ["origin_country", SOURCES.viperProduct, "Diplomat official product context"],
    ["nib", SOURCES.collections, "hooded nib and F/M"],
    ["fill_system", SOURCES.viperConverter, "Viper dedicated converter and cartridge"],
    ["material", SOURCES.viperProduct, "aluminium and guilloche product field"],
    ["dimensions", SOURCES.viperProduct, "140/150/11 mm"],
    ["weight", SOURCES.viperProduct, "30 g"],
    ["price_range", SOURCES.fountainArchive, "current official catalogue price snapshot"],
    ["status", SOURCES.collections, "current Viper collection presence"],
  ],
});

const cobra = model({
  key: "diplomat-cobra",
  id: PHASE327_COBRA_ID,
  slug: PHASE327_COBRA_SLUG,
  name: "Diplomat Cobra",
  markdownFile: ".planning/content-research/diplomat-cobra-phase327.md",
  storyTitle: "Diplomat Cobra：更大笔身的深鳞片磁吸帽路线",
  summary:
    "Diplomat Cobra 是现行目录的独立磁吸帽钢笔；铝制深 guilloché、黑色 PVD 饰件，官方给出 142/170/15 mm、39 g，EF/F/M/B 钢尖与标准国际供墨。",
  primary: SOURCES.cobraProduct,
  secondary: SOURCES.cobraRetailer,
  extra: [
    SOURCES.collections,
    SOURCES.fountainArchive,
    SOURCES.guide,
    SOURCES.cobraRetailerAlt,
  ],
  diagram: SOURCES.cobraDiagram,
  scope: "phase327-diplomat-cobra-current",
  aliases: [
    { alias: "Diplomat Cobra", language: "en", sourceKey: SOURCES.cobraProduct.key },
    { alias: "Diplomat Cobra Guilloche", language: "en", sourceKey: SOURCES.cobraProduct.key },
    { alias: "迪普洛玛 Cobra", language: "zh", sourceKey: SOURCES.collections.key },
    { alias: "迪普洛玛眼镜蛇", language: "zh", sourceKey: SOURCES.cobraProduct.key },
  ],
  claims: [
    ["cobra-identity", "model_identity", "Cobra 是 Diplomat 独立的深 guilloché 磁吸帽钢笔，不是 Viper 的换色或加粗 SKU；同系列滚珠笔另行处理。", SOURCES.cobraProduct, "official Cobra product identity"],
    ["cobra-cap", "cap_mechanism", "Cobra 使用磁吸帽和快速定位，不是 Excellence A+ 的三分之一圈螺纹帽，也不能按螺纹帽旋拧。", SOURCES.collections, "magnetic cap and adjacent model boundary"],
    ["cobra-finish", "material_finish", "笔身为铝制深纹理 guilloché，当前黑色与 Bordeaux 版本使用阳极氧化语境，饰件为黑色 PVD。", SOURCES.cobraProduct, "finish and colour fields"],
    ["cobra-spec", "specification", "当前官方商品快照为闭帽 142 mm、插帽 170 mm、直径 15 mm、39 g；不能沿用 Viper 的 140/150/11 mm、30 g。", SOURCES.cobraProduct, "technical data"],
    ["cobra-nib", "nib_options", "官方提供 EF、F、M、B 不锈钢尖；Pen Chalet 交叉标为 #6 JoWo，但这不自动授权其他 Diplomat #6 尖块通用。", SOURCES.cobraRetailer, "nib sizes and #6 cross-check"],
    ["cobra-fill", "filling_system", "官方随笔附转换器，并明确兼容标准国际墨胆；兼容不等于任意长度墨胆都无需核对。", SOURCES.cobraProduct, "converter and standard international cartridges"],
    ["cobra-care", "maintenance", "换色或久置时按官方服务指南用清水/温水冲洗并自然干燥；深纹理、阳极层和 PVD 饰件不应用抛光剂、酒精或硬刷。", SOURCES.guide, "fountain pen cleaning guidance"],
    ["cobra-warranty", "warranty", "官方五年保修以完整国际证书、购买日期和授权经销商为条件；正常磨损、撞击及未授权修理不在普通范围。", SOURCES.guide, "warranty terms"],
    ["cobra-penchalet-cross-check", "professional_cross_check", "Pen Chalet 的专业经销资料交叉列出深纹理、磁吸帽、#6 JoWo 不锈钢尖与 standard international filling；核心尺寸仍以官方商品为准。", SOURCES.cobraRetailer, "Cobra specifications"],
    ["cobra-appelboom-cross-check", "retailer_cross_check", "Appelboom 黑色 SKU 交叉记录约 142 mm、40 g 和 PVD/guilloché 表面；本页保留官方 39 g，并把 40 g 视为零售测量。", SOURCES.cobraRetailerAlt, "black Cobra measurements"],
    ["cobra-boundary", "identity_boundaries", "Cobra 的 15 mm 握持、EF/F/M/B 和标准国际供墨与 Viper 的包覆式尖、专用 converter 分开；Aero/Elox/A+/A2 也不能借用 Cobra 规格。", SOURCES.collections, "Cobra/Viper/Aero/Excellence boundary"],
    ["cobra-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明真实比例、颜色、刻字、PVD 光泽、Logo、库存或实物品相。", SOURCES.cobraDiagram, "site-original SVG metadata", "editorial"],
  ],
  variants: [
    { key: "phase327-cobra-colours", name: "Black / Bordeaux", notes: "官方当前颜色变体；颜色和饰件不建立两个基础型号。", sourceKey: SOURCES.cobraProduct.key, variantKind: "color", market: "EU/国际经销" },
    { key: "phase327-cobra-nibs", name: "EF / F / M / B stainless steel", notes: "官方尖幅范围；#6 JoWo 为 Pen Chalet 辅助交叉资料。", sourceKey: SOURCES.cobraProduct.key, variantKind: "nib" },
    { key: "phase327-cobra-filling", name: "Converter / standard international cartridge", notes: "官方商品同时列转换器和标准国际墨胆兼容；按实际内腔与墨胆长度核对。", sourceKey: SOURCES.cobraProduct.key, variantKind: "market_sku" },
  ],
  values: {
    series_name: "Diplomat Cobra",
    release_year: "2026 官方目录快照可见；不据此断言首发年份",
    origin_country: "德国 Diplomat 产品线；具体制造与地区 SKU 按商品资料核验",
    nib: "不锈钢 EF/F/M/B；Pen Chalet 辅助标为 #6 JoWo",
    fill_system: "转换器；兼容标准国际墨胆",
    material: "铝制深 guilloché 笔身，黑色 PVD 饰件，黑色/Bordeaux 颜色变体",
    dimensions: "闭帽 142 mm、插帽 170 mm、直径 15 mm（官方商品快照）",
    weight: "39 g（官方商品）；Appelboom 黑色 SKU 测量约 40 g",
    price_range: "官方归档快照约 €149；价格、税费与库存按日期和地区核对",
    status: "官方 2026 当前集合与商品页可见；颜色和尖幅按 SKU",
  },
  specEvidence: [
    ["series_name", SOURCES.cobraProduct, "official Cobra product title"],
    ["release_year", SOURCES.fountainArchive, "2026 current catalogue snapshot; no first-year claim"],
    ["origin_country", SOURCES.cobraProduct, "Diplomat official product context"],
    ["nib", SOURCES.cobraProduct, "EF/F/M/B stainless steel nib"],
    ["fill_system", SOURCES.cobraProduct, "converter and standard international compatibility"],
    ["material", SOURCES.cobraProduct, "aluminium, guilloche and PVD fields"],
    ["dimensions", SOURCES.cobraProduct, "142/170/15 mm"],
    ["weight", SOURCES.cobraProduct, "39 g official product weight"],
    ["price_range", SOURCES.fountainArchive, "current official catalogue price snapshot"],
    ["status", SOURCES.collections, "current Cobra collection presence"],
  ],
});

export const phase327DiplomatViperCobraPacks: CuratedEntityPack[] = [
  inheritedBrand,
  viper,
  cobra,
];
