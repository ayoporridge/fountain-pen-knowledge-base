import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE172_CROSS_IDS,
  phase172CrossBaileyStratfordPacks,
} from "./phase172-cross-bailey-stratford";

const RETRIEVED = "2026-07-26";
export const PHASE249_CROSS_BRAND_ID = PHASE172_CROSS_IDS.brand;
export const PHASE249_TOWNSEND_ID = "p249CrossTownsend";
export const PHASE249_TOWNSEND_SLUG = "cross-townsend";
export const PHASE249_TOWNSEND_ROUTE = `/pen/${PHASE249_TOWNSEND_SLUG}`;

const TOWNSEND_SCOPE = "phase249-cross-townsend-536-fs";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.registryKey,
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

function diagram(key: string, title: string, url: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase249",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase249",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary,
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
  evidence: Array<{ key: string; sourceKey: string; locator: string }> = [],
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass: predicate === "maintenance_boundary" ? "editorial" : "core",
    confidence: 0.97,
    sourceKey,
    locator,
    evidence: [
      { key: `${key}-e`, sourceKey, scopeKey: TOWNSEND_SCOPE, locator },
      ...evidence.map((item) => ({ ...item, scopeKey: TOWNSEND_SCOPE })),
    ],
  };
}

function specEvidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return {
    key,
    fieldKey,
    sourceKey,
    scopeKey: TOWNSEND_SCOPE,
    locator,
    qualifies: true,
  };
}

const S = {
  product: web({
    key: "phase249-cross-townsend-product",
    title: "A.T. Cross Townsend 536-FS official product page",
    url: "https://cross.com/es/products/536-fs",
    registryKey: "cross-official-townsend-536-fs-phase249",
    registryName: "A.T. Cross",
    sourceType: "official",
    tier: "primary",
    summary:
      "官方页面将 536-FS 定为 Townsend Lustrous Chrome Stainless-Steel Fine Nib Fountain Pen，列出亮铬 finish、手工完成不锈钢尖、click-off 帽、两支 #8921 黑色墨囊、可选 #8751 转换器，以及 6.201 in 书写、5.88 in 闭盖、1.25 oz、帽径 0.51 in、笔杆径 0.43 in。",
    locator: "product title, features and specification block",
  }),
  converter: web({
    key: "phase249-cross-converter",
    title: "A.T. Cross Canada #8751 push-in converter",
    url: "https://ca.cross.com/products/8751",
    registryKey: "cross-official-converter-8751-phase249",
    registryName: "A.T. Cross Canada",
    sourceType: "official",
    tier: "primary",
    summary:
      "Cross 官方转换器页说明 #8751 是推入式转换器，可把 Cross 钢笔从墨囊切换到瓶装墨水，并明确列 Townsend 为兼容型号。",
    locator: "converter description and compatibility list",
  }),
  penAddict: web({
    key: "phase249-cross-townsend-pen-addict",
    title: "The Pen Addict: Cross Townsend Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2015/12/1/cross-townsend-fountain-pen-review",
    registryKey: "pen-addict-cross-townsend-phase249",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "独立评测记录一支 Cross Townsend 样本的金属与树脂握位、帽盖约 18 g、笔身约 21 g、套帽稳定性和书写体验；样本观察不覆盖所有 Townsend 版本。",
    locator: "look and feel, writing performance and sample weight sections",
  }),
  penChalet: web({
    key: "phase249-cross-townsend-penchalet",
    title: "Pen Chalet: Cross Townsend Fountain Pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/cross_townsend_fountain_pens.html",
    registryKey: "penchalet-cross-townsend-phase249",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "专业钢笔零售商交叉列出 Townsend 的不锈钢尖、Fine/Medium、click-off 帽、两支黑色墨囊、可选转换器、金属笔身、树脂握位与约 149.4 mm 闭盖、36 g 等目录值。",
    locator: "about section and product specifications",
  }),
  svg: diagram(
    "phase249-cross-townsend-svg",
    "Cross Townsend 536-FS factual diagram",
    "/images/library/site-original/phase249/cross/townsend.svg",
    "本站原创 factual SVG：表达 536-FS 的亮铬宽体、按压帽、不锈钢 Fine 尖与 #8921/#8751 上墨边界；非产品照片、非 Logo、非比例图、非颜色校样。",
  ),
} as const;

const inheritedBrand = phase172CrossBaileyStratfordPacks.find(
  (pack) => pack.entityId === PHASE249_CROSS_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 249 Cross brand pack missing.");

const brand: CuratedEntityPack = structuredClone(inheritedBrand);
brand.key = "phase249-cross-brand-v1";

const townsend: CuratedEntityPack = {
  key: "phase249-cross-townsend-v1",
  entityId: PHASE249_TOWNSEND_ID,
  expectedType: "pen",
  expectedSlug: PHASE249_TOWNSEND_SLUG,
  canonicalName: "高仕 Cross Townsend",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/cross-townsend-phase249.md",
  storyTitle: "Cross Townsend：536-FS 宽体亮铬钢笔",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Cross Townsend", language: "en", sourceKey: S.product.key },
    { alias: "Townsend Fountain Pen", language: "en", sourceKey: S.product.key },
    { alias: "Townsend 536-FS", language: "en", sourceKey: S.product.key },
    { alias: "高仕 Townsend 钢笔", language: "zh", sourceKey: S.product.key },
  ],
  sources: [S.product, S.converter, S.penAddict, S.penChalet, S.svg],
  scopes: [
    {
      key: TOWNSEND_SCOPE,
      scopeKey: TOWNSEND_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Cross official product page; regional SKU availability varies",
      nibScope: "536-FS Fine stainless-steel nib; other widths and precious-metal nibs remain separate SKU evidence.",
      materialScope: "536-FS bright chrome finish and chrome appointments; other Townsend finishes do not inherit these values.",
      editionScope: "Townsend fountain pen only; ballpoint, rollerball, vintage and limited editions excluded.",
    },
  ],
  claims: [
    claim(
      "phase249-townsend-identity",
      "model_identity",
      "Cross Townsend 是 A.T. Cross 的宽体钢笔家族；本页锁定当前官方 536-FS 亮铬不锈钢 Fine 尖 SKU，与同名圆珠笔、滚珠笔和其他贵金属版本分开。",
      S.product.key,
      S.product.summary,
      [{ key: "phase249-townsend-identity-collection", sourceKey: S.penChalet.key, locator: S.penChalet.summary }],
    ),
    claim(
      "phase249-townsend-finish",
      "material_and_finish",
      "536-FS 官方 finish 为亮铬，配铬色配件并带细微线纹；其他颜色、PVD、贵金属或限量装饰不得回填为本 SKU 的固定材料。",
      S.product.key,
      S.product.summary,
    ),
    claim(
      "phase249-townsend-nib",
      "nib_specification",
      "536-FS 使用手工完成的不锈钢 Fine 尖；Pen Chalet 的 Fine/Medium 目录只作为系列宽度交叉线索，不能把 Medium 改写到 536-FS。",
      S.product.key,
      S.product.summary,
      [{ key: "phase249-townsend-nib-retailer", sourceKey: S.penChalet.key, locator: S.penChalet.summary }],
    ),
    claim(
      "phase249-townsend-cap",
      "cap_mechanism",
      "官方将 Townsend 536-FS 的笔帽列为 click-off，属于按压扣合的拔帽结构，不是旋帽，也不等于防水或耐摔承诺。",
      S.product.key,
      "Pen Technology: Click-off cap",
    ),
    claim(
      "phase249-townsend-filling",
      "filling_system",
      "536-FS 随盒附两支 Cross #8921 黑色墨囊；Cross #8751 是官方列出的推入式转换器，可将 Townsend 接入瓶装墨水。",
      S.product.key,
      S.product.summary,
      [{ key: "phase249-townsend-converter", sourceKey: S.converter.key, locator: S.converter.summary }],
    ),
    claim(
      "phase249-townsend-size",
      "sku_dimensions",
      "官方 536-FS 目录值为书写 6.201 in、闭盖 5.88 in、帽径 0.51 in、笔杆径 0.43 in、重量 1.25 oz；零售商的毫米换算仅作量级交叉核对。",
      S.product.key,
      S.product.summary,
      [{ key: "phase249-townsend-size-retailer", sourceKey: S.penChalet.key, locator: S.penChalet.summary }],
    ),
    claim(
      "phase249-townsend-writing",
      "independent_writing_context",
      "The Pen Addict 的受测样本记录金属宽体、树脂握位、套帽稳定性和顺滑出墨；这些是独立样本观察，不是所有 Townsend 的性能保证。",
      S.penAddict.key,
      S.penAddict.summary,
    ),
    claim(
      "phase249-townsend-care",
      "maintenance_boundary",
      "更换墨水前后使用常温清水清洗笔尖、笔舌和转换器，避免热水、酒精、研磨剂和强力拆卸；若接口或镀层异常，应依 Cross 说明与售后处理。",
      S.converter.key,
      "Cross fountain pen converter workflow and conservative maintenance boundary",
    ),
  ],
  variants: [
    {
      key: "phase249-townsend-536-fs",
      name: "Lustrous Chrome 536-FS Fine",
      notes: "当前官方亮铬、铬色配件、不锈钢 Fine 尖 SKU；价格和库存随地区变化。",
      sourceKey: S.product.key,
      variantKind: "market_sku",
      productCode: "536-FS",
      market: "Cross official regional product page",
    },
    {
      key: "phase249-townsend-family-boundary",
      name: "其他 Townsend finish／尖宽",
      notes: "系列导航边界；黑色、绿色 PVD、金色五金、贵金属和 Medium 等必须按具体 SKU 核对，不复制 536-FS 规格。",
      sourceKey: S.penChalet.key,
      variantKind: "edition_group",
    },
  ],
  spec: {
    brandEntityId: PHASE249_CROSS_BRAND_ID,
    values: {
      series_name: "Cross Townsend（536-FS）",
      release_year: "当前官方 SKU；首发年份未由本次资料确认",
      origin_country: "A.T. Cross 美国品牌；536-FS 的具体生产地未由本次官方页确认",
      nib: "手工完成不锈钢 Fine 尖",
      fill_system: "Cross #8921 墨囊；可选 #8751 推入式转换器",
      material: "亮铬 finish、铬色配件；握位材质按产品结构与具体 SKU 核对",
      dimensions: "官方 536-FS：书写 6.201 in、闭盖 5.88 in、帽径 0.51 in、笔杆径 0.43 in",
      weight: "官方 536-FS：1.25 oz（约 35.4 g）",
    },
    evidence: [
      specEvidence("phase249-townsend-brand", "brand_entity_id", S.product.key, "536-FS official product identity"),
      specEvidence("phase249-townsend-series", "series_name", S.product.key, "Townsend product title"),
      specEvidence("phase249-townsend-year", "release_year", S.product.key, "Current product page; no launch year asserted"),
      specEvidence("phase249-townsend-origin", "origin_country", S.product.key, "A.T. Cross brand context; SKU origin not asserted"),
      specEvidence("phase249-townsend-nib-spec", "nib", S.product.key, "Stainless-steel Fine nib"),
      specEvidence("phase249-townsend-fill-spec", "fill_system", S.product.key, "#8921 cartridges and optional #8751 converter"),
      specEvidence("phase249-townsend-material", "material", S.product.key, "Bright chrome finish and chrome appointments"),
      specEvidence("phase249-townsend-dimensions", "dimensions", S.product.key, "Official 536-FS imperial specifications"),
      specEvidence("phase249-townsend-weight", "weight", S.product.key, "Official 536-FS weight"),
    ],
  },
  timeline: [
    {
      key: "phase249-townsend-current-sku",
      title: "536-FS 当前官方 SKU 核实",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description: "以检索日记录官方当前商品页，不把商品页访问日期当作型号首发年份。",
      sourceKey: S.product.key,
    },
  ],
  media: [
    {
      key: "phase249-townsend-primary-media",
      title: "Cross Townsend 536-FS 事实图（非产品照片）",
      sourceKey: S.svg.key,
      localPath: S.svg.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；示意图，非产品照片、非 Logo、非比例图、非颜色校样。",
      sourceUrl: S.svg.url,
      usageStatus: "primary",
    },
  ],
};

export const phase249CrossTownsendPacks: CuratedEntityPack[] = [brand, townsend];
