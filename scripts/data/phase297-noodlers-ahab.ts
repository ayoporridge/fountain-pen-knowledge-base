import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase214NoodlersNibCreaperPacks, PHASE214_NOODLERS_BRAND_ID } from "./phase214-noodlers-nib-creaper";

export const PHASE297_NOODLERS_BRAND_ID = PHASE214_NOODLERS_BRAND_ID;
export const PHASE297_AHAB_ID = "phase297-noodlers-ahab";
export const PHASE297_AHAB_SLUG = "noodlers-ahab";
const RETRIEVED = "2026-07-28";
const MODEL_SCOPE = "phase297-noodlers-ahab";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
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
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(): CuratedSource {
  const url = "/images/library/site-original/phase297/noodlers/ahab.svg";
  return {
    key: "phase297-noodlers-ahab-svg",
    registryKey: "fountain-pen-graph-editorial-phase297",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase297",
    title: "Noodler's Ahab factual diagram",
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；表达 #6 钢制柔性尖、滑动活塞和滴入边界，不是产品照片。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;not-to-scale=true;colour-proof=false`,
  };
}

const S = {
  officialProduct: web({
    key: "phase297-noodlers-ahab-official-product",
    title: "Noodler's Ink：15047 Black Pearl Ahab",
    url: "https://noodlersink.com/product/15047-black-pearl-ahab/",
    registryKey: "noodlers-official-ahab-phase297",
    registryName: "Noodler's Ink",
    summary: "官方商品页确认 15047 Black Pearl Ahab，并将其归入 Ahab Flex 产品组；用于型号身份和 SKU 边界。",
  }),
  officialCategory: web({
    key: "phase297-noodlers-ahab-category",
    title: "Noodler's Ink：Ahab Flex product category",
    url: "https://noodlersink.com/product-category/pens/ahab-flex-pens/",
    registryKey: "noodlers-official-ahab-phase297",
    registryName: "Noodler's Ink",
    summary: "官方分类将 Ahab Flex 与 Standard Flex、Konrad、Neponset 等产品线分开；支持不把相邻型号合并。",
  }),
  officialInstructions: web({
    key: "phase297-noodlers-ahab-instructions",
    title: "Noodler's official Ahab Instruction Sheet",
    url: "https://noodlersink.com/wp-content/uploads/Noodlers-Ahab-Instruction-Sheet.pdf",
    registryKey: "noodlers-official-ahab-instructions-phase297",
    registryName: "Noodler's Ink",
    summary: "官方说明书用于首次冲洗、nib/feed 调校和 Ahab 结构维护边界。",
  }),
  goulet: web({
    key: "phase297-noodlers-ahab-goulet",
    title: "Goulet Pen Company：Noodler's Ahab Flex Fountain Pen - Black",
    url: "https://www.gouletpens.com/products/noodlers-ahab-flex-fountain-pen-black",
    registryKey: "goulet-ahab-phase297",
    registryName: "The Goulet Pen Company",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "零售技术字段绑定 N15001 黑色样本，记录 #6 钢尖、滑动活塞、滴入容量、尺寸、重量和首次冲洗建议。",
  }),
  desk: web({
    key: "phase297-noodlers-ahab-desk",
    title: "The Well-Appointed Desk：Noodler's Ahab Flexible Nib Fountain Pen review",
    url: "https://www.wellappointeddesk.com/2014/09/review-noodlers-ahab-flexible-nib-fountain-pen/",
    registryKey: "well-appointed-desk-ahab-phase297",
    registryName: "The Well-Appointed Desk",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立评测补充软六角树脂、磁性/螺旋帽、柔性尖的握持与书写语境；体验绑定送测样本，不外推为质量保证。",
  }),
  svg: diagram(),
} satisfies Record<string, CuratedSource>;

function ev(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, extra: string[] = []) {
  return {
    key,
    predicate,
    objectText,
    factClass: "core" as const,
    confidence: 0.96,
    sourceKey,
    locator,
    evidence: [sourceKey, ...extra].map((item, index) => ({ key: `${key}-evidence-${index + 1}`, sourceKey: item, scopeKey: MODEL_SCOPE, locator })),
  } satisfies CuratedEntityPack["claims"][number];
}

const sourceBrand = phase214NoodlersNibCreaperPacks.find((pack) => pack.entityId === PHASE297_NOODLERS_BRAND_ID && pack.expectedType === "brand");
if (!sourceBrand) throw new Error("Phase 297 requires the existing Noodler's brand pack.");
const brand = structuredClone(sourceBrand);
brand.key = "phase297-noodlers-brand-v1";

const model: CuratedEntityPack = {
  key: "phase297-noodlers-ahab-v1",
  entityId: PHASE297_AHAB_ID,
  expectedType: "pen",
  expectedSlug: PHASE297_AHAB_SLUG,
  canonicalName: "Noodler's Ahab",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/noodlers-ahab-phase297.md",
  storyTitle: "Noodler's Ahab：可调校的 #6 柔性尖活塞笔",
  primarySourceKey: S.officialProduct.key,
  depthTier: "A",
  aliases: [
    { alias: "Noodler's Ahab Flex", language: "en", sourceKey: S.officialCategory.key },
    { alias: "Ahab Flex Fountain Pen", language: "en", sourceKey: S.goulet.key },
    { alias: "Noodler's Ahab", language: "en", sourceKey: S.officialProduct.key },
    { alias: "鲶鱼 Ahab", language: "zh", sourceKey: S.officialCategory.key },
  ],
  sources: [S.officialProduct, S.officialCategory, S.officialInstructions, S.goulet, S.desk, S.svg],
  scopes: [{ key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, productionState: "current", materialScope: "Ahab Flex；15047 Black Pearl 与 N15001 Black 为规格锚点，颜色、透明度和零售商专色按 SKU 分开。", editionScope: "不覆盖 Nib Creaper、Konrad、Neponset、Boston Safety、Triple Tail 或 Ahab Brush Pen。" }],
  claims: [
    claim("ahab-identity", "model_identity", "Ahab 是 Noodler's 官方单列的 Ahab Flex 产品线；15047 Black Pearl Ahab 和零售代码 N15001 Black 是具体商品识别，不把 Ahab 改写成品牌泛称。", S.officialProduct.key, "official product title and SKU", [S.officialCategory.key]),
    claim("ahab-nib", "nib_boundary", "黑色样本使用钢制 #6 flexible nib；flex 的线宽变化取决于尖缝、feed、压力、墨水和速度，不能承诺古董柔尖效果。", S.goulet.key, "technical specs and flex guidance", [S.desk.key]),
    claim("ahab-fill", "filling_system", "Ahab 默认是滑动活塞上墨；拆下活塞后可进行 eyedropper 改造，但 6.17 ml 仅是具体黑色样本的零售估算，不是无条件安全保证。", S.goulet.key, "filling mechanism and capacity fields", [S.officialInstructions.key]),
    claim("ahab-material", "material_boundary", "黑色样本被描述为植物来源树脂／celluloid derivative；透明或亮色可能出现颗粒、条纹和批次差异，不能把样本描述写成所有 Ahab 的统一配方。", S.goulet.key, "body material and sample caveat", [S.desk.key]),
    claim("ahab-tinkering", "maintenance_boundary", "官方说明书和零售资料都把首次冲洗、可抽出 nib/feed 和小幅调校列为使用边界；可调校不等于可以用工具强拆或保证开箱一致。", S.officialInstructions.key, "Ahab instruction sheet and adjustment guidance", [S.goulet.key]),
    claim("ahab-sibling", "sibling_boundary", "Ahab 与 Nib Creaper、Konrad、Neponset 是官方目录中的不同产品线；不能借用相邻型号的笔尖尺寸、活塞容量、图片或颜色。", S.officialCategory.key, "separate official product groups", [S.desk.key]),
    claim("ahab-selection", "selection_guidance", "选购时核对 Ahab Flex 名称、SKU、颜色、原装 #6 尖、活塞和退换条件；如果只想要免调校的日用笔，应把维护学习成本纳入选择。", S.goulet.key, "product selection and sample limitations", [S.officialProduct.key]),
    claim("ahab-review-boundary", "professional_sample_boundary", "独立评测对软六角笔身、磁性/螺旋帽和柔性尖的评价属于具体样本体验，只用于解释试写方向，不构成每支 Ahab 的质量承诺。", S.desk.key, "professional review sample boundary"),
  ],
  variants: [
    { key: "ahab-15047-black-pearl", name: "15047 Black Pearl Ahab", releaseYear: "官方商品页可见", notes: "官方 SKU 15047；黑色 Pearl 外观，Ahab Flex 产品组。", sourceKey: S.officialProduct.key, variantKind: "market_sku", productCode: "15047" },
    { key: "ahab-n15001-black", name: "N15001 Black Ahab Flex", notes: "Goulet 黑色零售样本代码；技术尺寸和容量只绑定该样本。", sourceKey: S.goulet.key, variantKind: "market_sku", productCode: "N15001" },
    { key: "ahab-color-family", name: "Ahab Flex 多色树脂与示范款", notes: "官方分类列多个颜色/透明度 SKU；颜色不是独立机械型号，实拍与库存需按具体商品核对。", sourceKey: S.officialCategory.key, variantKind: "color" },
  ],
  spec: {
    brandEntityId: PHASE297_NOODLERS_BRAND_ID,
    values: {
      series_name: "Ahab Flex",
      release_year: "官方当前商品页可见；本包不把零售资料中的年代推断写成首发年",
      origin_country: "美国品牌产品线语境；本包未核实具体制造地点",
      nib: "钢制 #6 flexible nib；具体尖缝、出墨和调校按单支核对",
      fill_system: "滑动活塞；拆除活塞后的 eyedropper 为用户改造路径",
      material: "植物来源树脂／celluloid derivative；颜色和透明度按 SKU",
      dimensions: "N15001 Black 样本：合帽约 139 mm、戴帽约 170 mm、笔身直径约 14 mm；不可外推到每个批次",
      weight: "N15001 Black 样本总重约 18 g（笔身约 12 g、笔帽约 6 g）",
      price_range: "官方 15047 页面检索价 $23；价格和库存随时间/地区变化",
      status: "官方 Ahab Flex 产品组中的现行/可见 SKU；颜色与供应状态需按地区核对",
    },
    evidence: [
      ev("ahab-brand", "brand_entity_id", S.officialProduct.key, "official Ahab product identity"),
      ev("ahab-series", "series_name", S.officialCategory.key, "Ahab Flex category"),
      ev("ahab-release", "release_year", S.officialProduct.key, "current product visibility; no launch year asserted"),
      ev("ahab-origin", "origin_country", S.officialProduct.key, "brand context only; no factory inference"),
      ev("ahab-nib", "nib", S.goulet.key, "steel #6 flex nib"),
      ev("ahab-fill", "fill_system", S.goulet.key, "slide piston and eyedropper option"),
      ev("ahab-material", "material", S.goulet.key, "vegetal resin/celluloid derivative"),
      ev("ahab-dimensions", "dimensions", S.goulet.key, "N15001 black technical dimensions"),
      ev("ahab-weight", "weight", S.goulet.key, "N15001 black weight fields"),
      ev("ahab-price", "price_range", S.officialProduct.key, "15047 official page observed price"),
      ev("ahab-status", "status", S.officialCategory.key, "Ahab Flex category and SKU visibility"),
    ],
  },
  media: [{ key: "ahab-primary-media", title: S.svg.title, sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、库存或具体笔尖。", sourceUrl: S.svg.url, usageStatus: "primary" }],
  timeline: [{ key: "ahab-current-category", title: "Ahab Flex 作为官方独立产品组", eventType: "design_milestone", startDate: "2026", circa: true, description: "官方目录在当前检索日仍将 Ahab Flex 与 Standard Flex、Konrad、Neponset 等产品组分开列出；目录可见不等同每个颜色全球有库存。", sourceKey: S.officialCategory.key }],
};

export const phase297NoodlersAhabPacks: CuratedEntityPack[] = [brand, model];
