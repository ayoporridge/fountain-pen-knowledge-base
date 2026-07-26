import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-26";
export const PHASE259_KANWRITE_BRAND_ID = "phase259-brand-kanwrite";
export const PHASE259_HERITAGE_ID = "phase259-kanwrite-heritage";
export const PHASE259_HERITAGE_SLUG = "kanwrite-heritage";
const BRAND_SCOPE = "phase259-kanwrite-brand";
const MODEL_SCOPE = "phase259-kanwrite-heritage";

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
    registryKey: "fountain-pen-graph-editorial-phase259",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase259",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。",
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
  scopeKey: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.95,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-e`, sourceKey, scopeKey, locator }],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  scopeKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const heritage = web({
  key: "phase259-kanwrite-heritage",
  title: "Kanwrite Heritage official family page",
  url: "https://kanwrite.com/fountain-pens/heritage/",
  registryKey: "kanwrite-official-heritage-phase259",
  registryName: "Kanwrite official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "kanwrite-official-heritage-phase259",
  summary: "官方 Heritage 家族页确认 acrylic 树脂、ebonite feed、#6 尖选项、活塞、墨窗和 Ebony/Marble/Solid/Crystal/Dual Tone 路线。",
  locator: "Heritage features and five color themes",
});

const ebony = web({
  key: "phase259-kanwrite-heritage-ebony",
  title: "Kanwrite Heritage Ebony Black official product",
  url: "https://kanwrite.com/product/ebony-heritage/",
  registryKey: "kanwrite-official-heritage-ebony-phase259",
  registryName: "Kanwrite official shop",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "kanwrite-official-heritage-ebony-phase259",
  summary: "官方 Ebony Black 商品页给出 KW-HE-1-Black、黑色 PVD 尖／饰件、#6 钢尖、可更换螺纹尖单元、活塞转换与旋盖。",
  locator: "SKU, description, additional information and nib options",
});

const about = web({
  key: "phase259-kanwrite-about",
  title: "Kanwrite official About Us",
  url: "https://kanwrite.com/about-us/",
  registryKey: "kanwrite-official-about-phase259",
  registryName: "Kanwrite official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "kanwrite-official-about-phase259",
  summary: "官方 About Us 记载 Kanpur Writers 约 1986 年起点、2012 年 KANWRITE 品牌形成、Kanpur 家族企业与自制产品边界。",
  locator: "About Kanwrite; history and manufacturing scope",
});

const catalog = web({
  key: "phase259-kanwrite-catalog",
  title: "Kanwrite official fountain pen portfolio",
  url: "https://kanwrite.com/fountain-pens/",
  registryKey: "kanwrite-official-catalog-phase259",
  registryName: "Kanwrite official site",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "kanwrite-official-catalog-phase259",
  summary: "官方产品页把 Heritage 与 Desire、Legacy、Emperor、Divine、Mammoth 等家族分开，并列出各自尖号与 feed 方向。",
  locator: "Kanwrite Fountain Pen Models and product portfolio",
});

const directory = web({
  key: "phase259-kanwrite-fpc",
  title: "Fountain Pen Companion Kanwrite Heritage",
  url: "https://www.fountainpencompanion.com/pen_brands/96-kanwrite/pen_models/820-heritage",
  registryKey: "fountain-pen-companion-kanwrite-heritage-phase259",
  registryName: "Fountain Pen Companion",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "fountain-pen-companion-kanwrite-heritage-phase259",
  summary: "独立目录列出 Kanwrite Heritage、plastic 材质与 piston 供墨；作为型号存在和路线的二级旁证，不替代官方 SKU。",
  locator: "brand, model, material and filling fields",
});

const svg = diagram(
  "phase259-kanwrite-heritage-svg",
  "Kanwrite Heritage piston factual diagram",
  "/images/library/site-original/phase259/kanwrite/heritage.svg",
);

const brand: CuratedEntityPack = {
  key: "phase259-kanwrite-brand-v1",
  entityId: PHASE259_KANWRITE_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "kanwrite",
  canonicalName: "Kanwrite",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/kanwrite-heritage-phase259.md",
  storyTitle: "Kanwrite：从 Kanpur Writers 到可换尖活塞钢笔",
  primarySourceKey: about.key,
  depthTier: "A",
  aliases: [
    { alias: "KANWRITE", language: "en", sourceKey: about.key },
    { alias: "Kanpur Writers", language: "en", sourceKey: about.key },
    { alias: "Kanwrite 钢笔", language: "zh", sourceKey: heritage.key },
  ],
  sources: [about, catalog, heritage, ebony, directory, svg],
  scopes: [{
    key: BRAND_SCOPE,
    scopeKey: BRAND_SCOPE,
    productionState: "current",
    editionScope: "Kanpur Writers／Kanwrite 官方品牌与自有产品目录；OEM 客户和其他印度品牌不合并。",
  }],
  claims: [
    claim("kanwrite-history", "brand_history", "官方沿革将 Kanpur Writers 的起点放在约 1986 年，并说明 KANWRITE 自有品牌在 2012 年形成。", about.key, "history and brand formation", BRAND_SCOPE),
    claim("kanwrite-origin", "brand_origin", "Kanwrite 官方地址和沿革把企业置于印度 Kanpur；这是运营与制造语境，不扩写为每个零件的产地保证。", about.key, "Kanpur Writers and Kanpur address", BRAND_SCOPE),
    claim("kanwrite-families", "brand_model_navigation", "官方产品导航把 Heritage、Legacy、Desire、Emperor、Divine、Mammoth 等分列；本页不把所有尖单元或 OEM 项目写成 Heritage 变体。", catalog.key, "Fountain Pen Models", BRAND_SCOPE),
    claim("kanwrite-nib-focus", "brand_nib_scope", "Kanwrite 官方将大量 #6 常规、flex 和 specialty grind 尖单元作为品牌特色；尖单元目录与具体笔身型号分开阅读。", about.key, "42+ nib options and in-house manufacturing", BRAND_SCOPE),
    claim("kanwrite-secondary", "professional_secondary_boundary", "Fountain Pen Companion 的 Heritage 条目是独立目录旁证，不替代 Kanwrite 官方商品页对颜色、尖库存和价格的说明。", directory.key, "brand, model and filling fields", BRAND_SCOPE),
    claim("kanwrite-care", "maintenance_boundary", "活塞、透明墨窗和可换尖路线需要温和清洁、避免硬扭与过度浸泡；这是保守维护建议，不是官方耐久保证。", heritage.key, "conservative piston and replaceable nib care boundary", BRAND_SCOPE, "editorial"),
  ],
  variants: [{ key: "kanwrite-families", name: "Heritage、Legacy、Desire、Emperor、Divine、Mammoth、Mammoth X", notes: "官方产品目录家族；每条路线的尖号、feed 和供墨单独核对。", sourceKey: catalog.key, variantKind: "edition_group", market: "global" }],
  timeline: [
    { key: "kanwrite-1986", title: "Kanpur Writers 起点", eventType: "brand_founded", startDate: "1986", circa: true, description: "官方 About Us 的企业沿革节点；不是 KANWRITE 品牌钢笔首发年份。", sourceKey: about.key },
    { key: "kanwrite-2012", title: "KANWRITE 自有品牌形成", eventType: "brand_founded", startDate: "2012", circa: false, description: "官方沿革写明品牌形成节点；不把它扩写成所有型号的上市年份。", sourceKey: about.key },
  ],
  media: [{ key: "kanwrite-brand-svg", title: "Kanwrite Heritage 与品牌路线事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

const model: CuratedEntityPack = {
  key: "phase259-kanwrite-heritage-v1",
  entityId: PHASE259_HERITAGE_ID,
  expectedType: "pen",
  expectedSlug: PHASE259_HERITAGE_SLUG,
  canonicalName: "Kanwrite Heritage",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/kanwrite-heritage-phase259.md",
  storyTitle: "Kanwrite Heritage：把活塞、墨窗和可换尖做成日用平台",
  primarySourceKey: heritage.key,
  depthTier: "A",
  aliases: [
    { alias: "Kanwrite Heritage Fountain Pen", language: "en", sourceKey: heritage.key },
    { alias: "Heritage Ebony", language: "en", sourceKey: ebony.key },
    { alias: "Kanwrite Heritage 活塞钢笔", language: "zh", sourceKey: directory.key },
  ],
  sources: [heritage, ebony, about, catalog, directory, svg],
  scopes: [{
    key: MODEL_SCOPE,
    scopeKey: MODEL_SCOPE,
    productionState: "current",
    editionScope: "Heritage 家族；Ebony、Marble、Solid、Crystal、Dual Tone 为颜色／表面路线，尖型与饰件按 SKU 分开。",
  }],
  claims: [
    claim("heritage-identity", "model_identity", "Kanwrite Heritage 是 Kanwrite 的经典活塞钢笔路线；不与 Legacy、Desire、Emperor 或单独销售的尖单元合并。", heritage.key, "Kanwrite Heritage family page", MODEL_SCOPE),
    claim("heritage-fill", "filling_system", "官方 Heritage 页面写明 modern piston filler，笔杆带透明墨窗；不是墨囊／转换器主路线。", heritage.key, "ink filling mechanism and transparent ink window", MODEL_SCOPE),
    claim("heritage-material", "material_finish", "主体为模制 acrylic resin；Ebony Black 商品页补充 plastic（acrylic/CAB）、黑色 PVD 尖和 PVD 饰件。", ebony.key, "body material and PVD finish", MODEL_SCOPE),
    claim("heritage-nib", "nib", "Heritage 使用 #6 尖单元，官方列 EEF、EF、F、M、B、BB、F-Flex、F-Ultraflex 八种选项，并配 ebonite feed。", heritage.key, "#6 nib options and ebonite feeder", MODEL_SCOPE),
    claim("heritage-interchange", "nib_interchange", "官方商品页说明尖单元可替换；这指向 screw-in nib unit 与 Heritage／Legacy 体系，不代表所有品牌 #6 尖都无条件兼容。", ebony.key, "replaceable screw-in nib unit", MODEL_SCOPE),
    claim("heritage-themes", "variant_boundary", "Heritage 官方家族页分出 Ebony、Marble、Solid、Crystal、Dual Tone 五种颜色主题；颜色与饰件变化不自动构成新的机械型号。", heritage.key, "five unique color themes", MODEL_SCOPE),
    claim("heritage-origin", "origin_country", "Kanwrite 官方沿革和地址将品牌置于印度 Kanpur Writers 体系；不把地址改写成未经证实的每个部件产地断言。", about.key, "Kanpur Writers, Kanpur, India", MODEL_SCOPE),
    claim("heritage-directory", "professional_secondary_boundary", "独立目录把 Heritage 列为 plastic 材质、piston 供墨的型号；它用于交叉核对，不替代官方商品页。", directory.key, "Heritage model record", MODEL_SCOPE),
    claim("heritage-care", "maintenance_boundary", "活塞换墨用室温清水缓慢吸排，透明墨窗和 ebonite feed 避免强溶剂、热水和超声波；尖单元卡滞时停止施力。", heritage.key, "conservative piston, feed and nib care boundary", MODEL_SCOPE, "editorial"),
  ],
  variants: [
    { key: "heritage-five-themes", name: "Ebony / Marble / Solid / Crystal / Dual Tone", notes: "官方 Heritage 家族的颜色／表面主题；不把颜色当作独立供墨结构。", sourceKey: heritage.key, variantKind: "edition_group", market: "global" },
    { key: "heritage-ebony-black", name: "Heritage Ebony Black（KW-HE-1-Black）", productCode: "KW-HE-1-Black", notes: "黑色 PVD 尖与饰件商品入口；尖型从官方选项中选择。", sourceKey: ebony.key, variantKind: "market_sku", market: "India/global" },
  ],
  spec: {
    brandEntityId: PHASE259_KANWRITE_BRAND_ID,
    values: {
      series_name: "Heritage",
      release_year: "官方当前 Heritage 页面可见；未将观察年份写作家族首发年份",
      origin_country: "印度 Kanpur Writers／Kanwrite 官方制造语境",
      nib: "#6 steel nib unit；EEF/EF/F/M/B/BB/F-Flex/F-Ultraflex；ebonite feed",
      fill_system: "Modern piston filler；透明墨窗",
      material: "Molded acrylic resin；Ebony Black 为 acrylic/CAB、黑色 PVD 尖与饰件",
      dimensions: "官方 Heritage 家族页未给固定长度与直径；不以其他型号回填",
      weight: "官方 Heritage 家族页未给固定重量；不以单支用户评论回填",
    },
    evidence: [
      evidence("heritage-brand", "brand_entity_id", heritage.key, MODEL_SCOPE, "official Kanwrite Heritage"),
      evidence("heritage-series", "series_name", heritage.key, MODEL_SCOPE, "Heritage family page"),
      evidence("heritage-release", "release_year", heritage.key, MODEL_SCOPE, "current family visibility; no launch-year assertion"),
      evidence("heritage-origin", "origin_country", about.key, MODEL_SCOPE, "Kanpur Writers / Kanwrite official history"),
      evidence("heritage-nib-spec", "nib", heritage.key, MODEL_SCOPE, "#6 options and ebonite feeder"),
      evidence("heritage-fill-spec", "fill_system", heritage.key, MODEL_SCOPE, "modern piston filler and ink window"),
      evidence("heritage-material-spec", "material", ebony.key, MODEL_SCOPE, "acrylic/CAB and PVD Ebony Black details"),
      evidence("heritage-dimensions", "dimensions", heritage.key, MODEL_SCOPE, "family page does not state fixed dimensions"),
      evidence("heritage-weight", "weight", directory.key, MODEL_SCOPE, "independent directory has no fixed weight; no sample backfill"),
    ],
  },
  timeline: [{ key: "heritage-current", title: "Heritage 官方家族页核实", eventType: "model_released", startDate: RETRIEVED, circa: false, description: "当前官方家族与商品页的型号资料范围；不推断早期首发年份。", sourceKey: heritage.key }],
  media: [{ key: "heritage-svg", title: "Kanwrite Heritage 活塞与可换尖事实图（非产品照片）", sourceKey: svg.key, localPath: svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: svg.url, usageStatus: "primary" }],
};

export const phase259KanwriteHeritagePacks: CuratedEntityPack[] = [brand, model];
