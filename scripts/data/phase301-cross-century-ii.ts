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

const RETRIEVED = "2026-07-28";
export const PHASE301_CROSS_BRAND_ID = PHASE172_CROSS_IDS.brand;
export const PHASE301_CENTURY_II_ID = "p301CrossCenturyII";
export const PHASE301_CENTURY_II_SLUG = "cross-century-ii";
const SCOPE = "phase301-cross-century-ii-current";

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

function diagram(): CuratedSource {
  const url = "/images/library/site-original/phase301/cross/century-ii.svg";
  return {
    key: "phase301-cross-century-ii-svg",
    registryKey: "fountain-pen-graph-editorial-phase301",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase301",
    title: "Cross Century II factual diagram",
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "原创事实示意图：表达 Century II 的宽体、click-off 帽和 Cross 专用墨囊／转换器边界；不是产品照片。",
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
  extra: Array<{ key: string; sourceKey: string; locator: string }> = [],
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass: predicate === "maintenance_boundary" ? "editorial" : "core",
    confidence: 0.96,
    sourceKey,
    locator,
    evidence: [
      { key: `${key}-e`, sourceKey, scopeKey: SCOPE, locator },
      ...extra.map((item) => ({ ...item, scopeKey: SCOPE })),
    ],
  };
}

function specEvidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  black: web({
    key: "phase301-cross-century-ii-black",
    title: "A.T. Cross Century II Black Lacquer Fine official product page",
    url: "https://cross.com/collections/fountain-pen/products/century-ii-black-lacquer-fine-nib-fountain-pen",
    registryKey: "cross-official-century-ii-black-phase301",
    registryName: "A.T. Cross",
    sourceType: "official",
    tier: "primary",
    summary: "官方把 Century II Black Lacquer Fine 定为更宽的现代 Century 轮廓，列出 click-off 帽、手工完成不锈钢尖、#8921 黑色墨囊、可选 #8756 converter，以及书写 6.2 in、闭盖 5.3 in、约 0.77 oz、帽径 0.43 in、笔杆径 0.39 in。",
    locator: "product description, features and specification block",
  }),
  blue: web({
    key: "phase301-cross-century-ii-blue",
    title: "A.T. Cross Century II Translucent Blue Medium official product page",
    url: "https://cross.com/products/at0086-158ms",
    registryKey: "cross-official-century-ii-blue-phase301",
    registryName: "A.T. Cross",
    sourceType: "official",
    tier: "primary",
    summary: "官方半透明蓝 AT0086-158MS 页面交叉确认 Century II 的 click-off、Cross #8921 墨囊、#8756 converter 和 6.2／5.3 英寸尺寸；Medium 与 Fine 需按货号分开。",
    locator: "product title, feature list and specification",
  }),
  pvd: web({
    key: "phase301-cross-century-ii-pvd",
    title: "A.T. Cross Century II Black PVD Micro-knurl official product page",
    url: "https://cross.com/products/at0086-132fj",
    registryKey: "cross-official-century-ii-pvd-phase301",
    registryName: "A.T. Cross",
    sourceType: "official",
    tier: "primary",
    summary: "官方黑色 PVD 微刻纹页面说明手工研磨不锈钢尖可选 Fine 或 Medium，握位有细纹，并保留 #8921／#8756 Cross 供墨边界；它是 finish/SKU 例子，不覆盖所有 Century II。",
    locator: "features and specification block",
  }),
  penAddict: web({
    key: "phase301-cross-century-ii-pen-addict",
    title: "The Pen Addict: Cross Century II in Royal Blue review",
    url: "https://www.penaddict.com/blog/2015/11/20/cross-century-ii-in-royal-blue-a-review",
    registryKey: "pen-addict-cross-century-ii-phase301",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立评测把 Century II 放在中价位日用钢笔中，讨论细长但比 Classic Century 更宽的笔身、金属配重、click-off 帽和 Cross 墨囊系统；属于送测样本的体验观察。",
    locator: "review introduction, dimensions and writing impressions",
  }),
  dayspring: web({
    key: "phase301-cross-century-ii-dayspring",
    title: "Dayspring Pens: Cross Century II review",
    url: "https://www.dayspringpens.com/blogs/the-jotted-line/cross-fountain-pen-century-ii",
    registryKey: "dayspring-cross-century-ii-phase301",
    registryName: "Dayspring Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立评测交叉记录 Century II 的金属外壳、click-off 帽、Cross 专用墨囊／转换器和日用书写定位；主观手感不被升级为全系列硬规格。",
    locator: "construction, filling and writing sections",
  }),
  svg: diagram(),
} as const;

const inheritedBrand = phase172CrossBaileyStratfordPacks.find(
  (pack) => pack.entityId === PHASE301_CROSS_BRAND_ID && pack.expectedType === "brand",
);
if (!inheritedBrand) throw new Error("Phase 301 Cross brand pack missing.");
const brand: CuratedEntityPack = structuredClone(inheritedBrand);
brand.key = "phase301-cross-brand-v1";

const centuryII: CuratedEntityPack = {
  key: "phase301-cross-century-ii-v1",
  entityId: PHASE301_CENTURY_II_ID,
  expectedType: "pen",
  expectedSlug: PHASE301_CENTURY_II_SLUG,
  canonicalName: "高仕 Cross Century II",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/cross-century-ii-phase301.md",
  storyTitle: "Cross Century II：更宽的现代 Classic Century 家族",
  primarySourceKey: S.black.key,
  depthTier: "A",
  aliases: [
    { alias: "Cross Century II", language: "en", sourceKey: S.black.key },
    { alias: "Century II Fountain Pen", language: "en", sourceKey: S.blue.key },
    { alias: "高仕 Century II", language: "zh", sourceKey: S.black.key },
  ],
  sources: [S.black, S.blue, S.pvd, S.penAddict, S.dayspring, S.svg],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Cross official regional product pages; finish and nib availability varies by SKU",
      nibScope: "Century II stainless-steel Fine/Medium examples; exact finish and width follow product code.",
      materialScope: "Black lacquer, chrome, translucent lacquer and PVD are separate finish/SKU examples.",
      editionScope: "Fountain pen only; ballpoint, rollerball, pencil, vintage and precious-metal editions excluded.",
    },
  ],
  claims: [
    claim("phase301-century-ii-identity", "model_identity", "Cross Century II 是 A.T. Cross 的独立宽体钢笔型号；它比原始 Classic Century 更宽，与 Townsend、Bailey 和各类圆珠／滚珠版本分开。", S.black.key, S.black.summary, [{ key: "phase301-century-ii-review-identity", sourceKey: S.penAddict.key, locator: S.penAddict.summary }]),
    claim("phase301-century-ii-cap", "cap_mechanism", "官方将 Century II 的笔帽列为 click-off，属于拔取式扣合；这不等于旋帽、防水或绝对防漏承诺。", S.black.key, "Pen Technology: Click-off cap"),
    claim("phase301-century-ii-nib", "nib_specification", "当前官方 Century II 页面可核对手工完成不锈钢 Fine／Medium 尖；黑色 PVD 版本另有黑色镀尖，不能把一个 finish 的尖材写给全系列。", S.pvd.key, S.pvd.summary, [{ key: "phase301-century-ii-nib-black", sourceKey: S.black.key, locator: S.black.summary }]),
    claim("phase301-century-ii-fill", "filling_system", "Century II 随附 Cross #8921 黑色墨囊，并可选 Cross #8756 converter 使用瓶装墨水；不可直接套用国际标准或其他品牌转换器。", S.black.key, "#8921 cartridge and optional #8756 converter", [{ key: "phase301-century-ii-fill-blue", sourceKey: S.blue.key, locator: S.blue.summary }]),
    claim("phase301-century-ii-size", "sku_dimensions", "典型官方 SKU 约闭盖 5.3 in、书写 6.2 in、帽径 0.43 in、笔杆径 0.39 in；重量随 finish 页面约 0.75–0.795 oz，必须以货号页为准。", S.black.key, S.black.summary, [{ key: "phase301-century-ii-size-blue", sourceKey: S.blue.key, locator: S.blue.summary }]),
    claim("phase301-century-ii-finish", "material_and_finish", "黑漆、亮铬、半透明漆和黑色 PVD 是 Century II 的不同 finish/SKU，不能因颜色或饰件相似而合并材质与重量。", S.blue.key, S.blue.summary, [{ key: "phase301-century-ii-finish-pvd", sourceKey: S.pvd.key, locator: S.pvd.summary }]),
    claim("phase301-century-ii-writing", "independent_writing_context", "The Pen Addict 与 Dayspring 的样本评测把 Century II 描述为金属配重、细长而比 Classic Century 更宽的中价位日用钢笔；这些是样本体验，不是每个版本的性能保证。", S.penAddict.key, S.penAddict.summary, [{ key: "phase301-century-ii-writing-dayspring", sourceKey: S.dayspring.key, locator: S.dayspring.summary }]),
    claim("phase301-century-ii-care", "maintenance_boundary", "换墨前后用常温清水冲洗笔尖、握位和 converter，避免热水、酒精、研磨剂与强力拆卸；长期不用排空并收回笔尖，异常时交 Cross 售后处理。", S.black.key, "conservative cartridge/converter maintenance boundary"),
  ],
  variants: [
    { key: "phase301-century-ii-black-fine", name: "Black Lacquer Fine（AT0086-102FS）", notes: "官方黑色漆面与不锈钢 Fine 尖示例；尺寸和重量以该货号页面为准。", sourceKey: S.black.key, variantKind: "market_sku", productCode: "AT0086-102FS", market: "Cross official" },
    { key: "phase301-century-ii-blue-medium", name: "Translucent Blue Medium（AT0086-158MS）", notes: "半透明蓝漆面 Medium SKU；不可把颜色或 Medium 尖回填到黑漆 Fine。", sourceKey: S.blue.key, variantKind: "market_sku", productCode: "AT0086-158MS", market: "Cross official" },
    { key: "phase301-century-ii-pvd", name: "Black PVD Micro-knurl", notes: "黑色 PVD 微刻纹握位与镀尖版本；Fine/Medium 随货号核对。", sourceKey: S.pvd.key, variantKind: "edition_group", productCode: "AT0086-132FJ", market: "Cross official" },
  ],
  spec: {
    brandEntityId: PHASE301_CROSS_BRAND_ID,
    values: {
      series_name: "Cross Century II",
      release_year: "当前官方 SKU；本次资料未确认统一首发年份",
      origin_country: "A.T. Cross 美国品牌；具体 SKU 生产地未由本次官方页面确认",
      nib: "手工完成不锈钢 Fine／Medium；具体 finish 可能采用 PVD 镀层",
      fill_system: "Cross #8921 墨囊；可选 #8756 converter",
      material: "黑漆、亮铬、半透明漆或 PVD，按具体 SKU",
      dimensions: "典型官方页面：书写 6.2 in、闭盖 5.3 in、帽径 0.43 in、笔杆径 0.39 in",
      weight: "官方页面约 0.75–0.795 oz，随 finish/SKU 变化",
    },
    evidence: [
      specEvidence("phase301-century-ii-brand", "brand_entity_id", S.black.key, "A.T. Cross official product identity"),
      specEvidence("phase301-century-ii-series", "series_name", S.black.key, "Century II product title"),
      specEvidence("phase301-century-ii-year", "release_year", S.black.key, "Current product page; no launch year asserted"),
      specEvidence("phase301-century-ii-origin", "origin_country", S.black.key, "A.T. Cross brand context; SKU origin not asserted"),
      specEvidence("phase301-century-ii-nib-spec", "nib", S.black.key, "Stainless-steel Fine/Medium examples"),
      specEvidence("phase301-century-ii-fill-spec", "fill_system", S.black.key, "#8921 cartridge and optional #8756 converter"),
      specEvidence("phase301-century-ii-material", "material", S.black.key, "Finish-specific official pages"),
      specEvidence("phase301-century-ii-dimensions", "dimensions", S.black.key, "Official dimensions"),
      specEvidence("phase301-century-ii-weight", "weight", S.black.key, "Official finish-specific weight"),
    ],
  },
  timeline: [{ key: "phase301-century-ii-current", title: "当前官方 Century II SKU 核实", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "以检索日记录官方商品页，不把访问日期当成统一首发年份。", sourceKey: S.black.key }],
  media: [{ key: "phase301-century-ii-primary-media", title: "Cross Century II 事实图（非产品照片）", sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片、非 Logo、非比例图、非颜色校样。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

export const phase301CrossCenturyIIPacks: CuratedEntityPack[] = [brand, centuryII];
