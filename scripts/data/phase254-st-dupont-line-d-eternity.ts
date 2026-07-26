import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-26";
export const PHASE254_ST_DUPONT_BRAND_ID = "phase254-brand-st-dupont";
export const PHASE254_LINE_D_ID = "phase254-st-dupont-line-d-eternity";
export const PHASE254_LINE_D_SLUG = "st-dupont-line-d-eternity";
export const PHASE254_BRAND_SLUG = "st-dupont";
const BRAND_SCOPE = "phase254-st-dupont-brand-scope";
const MODEL_SCOPE = "phase254-st-dupont-line-d-scope";

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
    registryKey: "fountain-pen-graph-editorial-phase254",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase254",
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
  scopeKey: string,
  factClass: "core" | "editorial" = "core",
  extra: Array<{ key: string; sourceKey: string; locator: string }> = [],
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "editorial" ? 0.95 : 0.97,
    sourceKey,
    locator,
    evidence: [
      { key: `${key}-e`, sourceKey, scopeKey, locator },
      ...extra.map((item) => ({ ...item, scopeKey })),
    ],
  };
}

function specEvidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

const S = {
  product: web({
    key: "phase254-st-dupont-product-420216l",
    title: "S.T. Dupont official Line D Eternity fountain pen 420216L",
    url: "https://us.st-dupont.com/products/fountain-pen-eternity-420216l",
    registryKey: "st-dupont-official-product-phase254",
    registryName: "S.T. Dupont official store",
    sourceType: "official",
    tier: "primary",
    summary: "官方 420216L 商品页确认黑色 Dupont lacquer、缎面黑色、articulated sword clip、黑色 14K solid-gold Wings nib、plunger 与 Faverges 制造；同页列墨囊和瓶装墨水。",
    locator: "420216L product description, nib, plunger, manufacture and related refills",
  }),
  heritage: web({
    key: "phase254-st-dupont-heritage",
    title: "S.T. Dupont official Heritage",
    url: "https://en.st-dupont.com/pages/heritage-1",
    registryKey: "st-dupont-official-heritage-phase254",
    registryName: "S.T. Dupont official website",
    sourceType: "official",
    tier: "primary",
    summary: "官方历史页记载 1872 年 Simon Tissot Dupont 在巴黎开设皮具工坊、1924 年迁往 Faverges，并把品牌沿革与书写工具历史分开。",
    locator: "The Maison heritage timeline: 1872 Paris workshop and 1924 Faverges workshop",
  }),
  collection: web({
    key: "phase254-st-dupont-writing-collection",
    title: "S.T. Dupont official Writing Instruments collection",
    url: "https://us.st-dupont.com/collections/writing-instruments",
    registryKey: "st-dupont-official-collection-phase254",
    registryName: "S.T. Dupont official store",
    sourceType: "official",
    tier: "primary",
    summary: "官方目录将 Line D Eternity 与 fountain pen、rollerball、ballpoint 等书写模式并列，支持模式与系列边界，不承担单一 SKU 全部规格。",
    locator: "Writing Instruments collection filters and Line D Eternity collection",
  }),
  review: web({
    key: "phase254-st-dupont-sbrebrown",
    title: "SBRE Brown: S.T. Dupont Line D Black and Gold review",
    url: "https://www.sbrebrown.com/2017/07/s-t-dupont-line-d-black-and-gold-fountain-pen/",
    registryKey: "sbrebrown-st-dupont-phase254",
    registryName: "SBRE Brown",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立评测记录一支较早黑金 Line D 样本的 146.6/134.6/166.4 mm 长度、48 g 总重与 C/C 观察；仅作样本范围，不外推 420216L。",
    locator: "2017 review measurements and cartridge/converter notes",
  }),
  forum: web({
    key: "phase254-st-dupont-fpn",
    title: "Fountain Pen Network: S.T. Dupont D-Line fountain pen discussion",
    url: "https://www.fountainpennetwork.com/forum/topic/303360-st-dupont-d-line-fountain-pen/",
    registryKey: "fountain-pen-network-st-dupont-phase254",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "community",
    summary: "收藏者讨论 Line D 的 14K 尖、converter、平衡与年代差异；只作二级边界提示，不承担全系耐用性或规格保证。",
    locator: "Line D 14K nib, converter, balance and vintage-versus-current discussion",
  }),
  svg: diagram(
    "phase254-st-dupont-svg",
    "S.T. Dupont Line D Eternity structure factual diagram",
    "/images/library/site-original/phase254/st-dupont/line-d-eternity.svg",
    "本站原创 factual SVG：表达漆面笔身、剑形夹、14K Wings nib 与 plunger；非产品照片、非 Logo、非比例图、非颜色校样。",
  ),
} as const;

const brand: CuratedEntityPack = {
  key: "phase254-st-dupont-brand-v1",
  entityId: PHASE254_ST_DUPONT_BRAND_ID,
  expectedType: "brand",
  expectedSlug: PHASE254_BRAND_SLUG,
  canonicalName: "S.T. Dupont",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/st-dupont-brand-phase254.md",
  storyTitle: "S.T. Dupont：皮具工坊、Faverges 与 Line D Eternity",
  primarySourceKey: S.heritage.key,
  depthTier: "A",
  aliases: [
    { alias: "S.T. Dupont", language: "en", sourceKey: S.heritage.key },
    { alias: "S.T.Dupont", language: "en", sourceKey: S.collection.key },
    { alias: "都彭", language: "zh", sourceKey: S.heritage.key },
  ],
  sources: [S.heritage, S.collection, S.product, S.review, S.svg],
  scopes: [{ key: BRAND_SCOPE, scopeKey: BRAND_SCOPE, productionState: "current", editionScope: "品牌沿革与当前书写工具目录；型号、颜色、书写模式和参考号逐项核对。" }],
  claims: [
    claim("st-dupont-origin", "brand_history", "官方历史页把 S.T. Dupont 的起点记为 1872 年 Simon Tissot Dupont 在巴黎开设皮具工坊；1924 年迁往 Faverges。", S.heritage.key, "1872 Paris workshop and 1924 Faverges workshop", BRAND_SCOPE),
    claim("st-dupont-writing", "brand_scope", "S.T. Dupont 当前目录同时包含钢笔、rollerball、ballpoint 与其他奢侈书写工具；品牌页不把不同书写模式合成同一型号。", S.collection.key, "Writing Instruments collection writing-mode filters", BRAND_SCOPE),
    claim("st-dupont-line-d", "brand_model_navigation", "Line D Eternity 是品牌当前钢笔目录中的一条路线；420216L 是本图谱锁定的黑色 Large fountain pen SKU。", S.product.key, "420216L product title and fountain pen description", BRAND_SCOPE),
    claim("st-dupont-secondary-boundary", "historical_boundary", "独立评测的旧 Line D 样本提供尺寸与 C/C 使用语境；这些观察只用于提示型号和年代边界，不外推为 S.T. Dupont 全品牌固定规格。", S.review.key, "2017 Line D sample measurements and cartridge/converter observations", BRAND_SCOPE),
    claim("st-dupont-care", "maintenance_boundary", "漆面、镀层、剑形夹和帽内结构应采用温和清洁与官方售后边界；不以品牌历史或奢侈品定位推导耐用性保证。", S.product.key, "product care and after-sales links; conservative editorial boundary", BRAND_SCOPE, "editorial"),
  ],
  variants: [{ key: "st-dupont-writing-modes", name: "钢笔、rollerball 与 ballpoint 书写模式", notes: "官方目录将三种模式并列；本品牌页只把 fountain pen 型号反链为钢笔入口。", sourceKey: S.collection.key, variantKind: "variant", market: "global" }],
  timeline: [{ key: "st-dupont-1872", title: "巴黎皮具工坊建立", eventType: "brand_founded", startDate: "1872", circa: false, description: "官方历史页给出的品牌沿革起点；不是 Line D 型号首发年份。", sourceKey: S.heritage.key }, { key: "st-dupont-1924", title: "工坊迁往 Faverges", eventType: "design_milestone", startDate: "1924", circa: false, description: "官方历史页记载家族工坊迁往 Faverges。", sourceKey: S.heritage.key }],
  media: [{ key: "st-dupont-brand-svg", title: "S.T. Dupont 品牌与 Line D 路线事实图（非产品照片）", sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、库存或价格。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

const model: CuratedEntityPack = {
  key: "phase254-st-dupont-line-d-v1",
  entityId: PHASE254_LINE_D_ID,
  expectedType: "pen",
  expectedSlug: PHASE254_LINE_D_SLUG,
  canonicalName: "S.T. Dupont Line D Eternity",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/st-dupont-line-d-eternity-phase254-body.md",
  storyTitle: "S.T. Dupont Line D Eternity：420216L 黑色 Large 钢笔",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Line D Eternity", language: "en", sourceKey: S.product.key },
    { alias: "S.T. Dupont Line D", language: "en", sourceKey: S.collection.key },
    { alias: "都彭 Line D Eternity", language: "zh", sourceKey: S.product.key },
  ],
  sources: [S.product, S.heritage, S.collection, S.review, S.forum, S.svg],
  scopes: [{ key: MODEL_SCOPE, scopeKey: MODEL_SCOPE, productionState: "current", editionScope: "420216L black Large fountain pen；Medium、其他颜色、饰件、限量版和旧 Line D 逐参考号核对。" }],
  claims: [
    claim("line-d-identity", "model_identity", "420216L 是官方页面列出的 Line D Eternity black Large fountain pen；不要与同系列 rollerball 或 ballpoint 合并。", S.product.key, "420216L title and writing-mode description", MODEL_SCOPE),
    claim("line-d-material", "material_finish", "420216L 商品页写明 black Dupont lacquer 与 satin-finish black；这只代表该参考号的 finish 边界。", S.product.key, "black Dupont lacquer and satin-finish black", MODEL_SCOPE),
    claim("line-d-nib", "nib", "420216L 页面写明 black 14-carat solid-gold Wings nib；14K 是成色字段，不是 flex 或固定线宽承诺。", S.product.key, "black 14-carat solid-gold Wings nib", MODEL_SCOPE),
    claim("line-d-fill", "filling_system", "官方商品页写 plunger included，并列出 S.T. Dupont 墨囊与瓶装墨水；具体包装接口按参考号确认，不把 plunger 改写成内置活塞。", S.product.key, "plunger included and related refills", MODEL_SCOPE),
    claim("line-d-manufacture", "manufacture", "420216L 官方页面写明在法国 Faverges 工坊制造。", S.product.key, "Manufactured in our workshops in Faverges, France", MODEL_SCOPE),
    claim("line-d-version", "version_boundary", "Line D Eternity 的 Medium/Large、颜色、饰件与限量主题是 SKU/版本边界；旧 Line D、Elysee、Olympio 和 Classique 不能互借规格或图片。", S.collection.key, "Line D Eternity collection and writing-mode catalogue", MODEL_SCOPE),
    claim("line-d-care", "maintenance_boundary", "换墨前以室温清水缓慢吸排并自然干燥；避免溶剂、热水、金属抛光剂和强拆漆面、剑形夹、14K 尖或帽内结构。", S.review.key, "conservative maintenance boundary derived from C/C sample and precision finishes", MODEL_SCOPE, "editorial", [{ key: "line-d-care-official", sourceKey: S.product.key, locator: "official product-care and after-sales links" }]),
  ],
  variants: [{ key: "line-d-420216l", name: "420216L black Large", releaseYear: "当前商品页可见", notes: "Black Dupont lacquer、satin-finish black、black Wings nib 与 plunger 的参考号边界；不代表 Medium 或其他限量版。", productCode: "420216L", sourceKey: S.product.key, variantKind: "market_sku", market: "US" }, { key: "line-d-medium-large", name: "Medium / Large 尺寸路线", notes: "官方欧洲目录将 Eternity 分为 Medium 与 Large；未取得 420216L 以外精确 SKU 规格时不外推尺寸重量。", sourceKey: S.collection.key, variantKind: "variant", market: "global" }],
  spec: {
    brandEntityId: PHASE254_ST_DUPONT_BRAND_ID,
    values: {
      series_name: "Line D Eternity",
      release_year: "当前官方商品页可见；未将观察年份写作首发年份",
      origin_country: "France；420216L 页面写 Faverges 工坊制造",
      nib: "black 14-carat solid-gold Wings nib（420216L）",
      fill_system: "plunger included；官方同时列 S.T. Dupont 墨囊与瓶装墨水，接口按参考号确认",
      material: "black Dupont lacquer 与 satin-finish black（420216L）",
      dimensions: "官方未给出 420216L 通用尺寸；2017 旧 Line D 样本合帽 146.6 mm、开帽 134.6 mm、后插 166.4 mm",
      weight: "官方未给出 420216L 固定重量；2017 旧 Line D 样本总重约 48 g",
    },
    evidence: [
      specEvidence("line-d-brand", "brand_entity_id", S.product.key, "420216L official product identifies S.T. Dupont Line D Eternity"),
      specEvidence("line-d-series", "series_name", S.product.key, "Line D Eternity product title"),
      specEvidence("line-d-release", "release_year", S.collection.key, "current collection visibility; no launch year asserted"),
      specEvidence("line-d-origin", "origin_country", S.product.key, "Manufactured in Faverges, France"),
      specEvidence("line-d-nib-spec", "nib", S.product.key, "black 14-carat solid-gold Wings nib"),
      specEvidence("line-d-fill-spec", "fill_system", S.product.key, "plunger included and related refills"),
      specEvidence("line-d-material-spec", "material", S.product.key, "black Dupont lacquer and satin-finish black"),
      specEvidence("line-d-dimensions", "dimensions", S.review.key, "2017 old Line D sample measurements; explicitly scoped as sample"),
      specEvidence("line-d-weight", "weight", S.review.key, "2017 old Line D sample 48 g; explicitly scoped as sample"),
    ],
  },
  timeline: [{ key: "line-d-current", title: "420216L 当前商品页", eventType: "model_released", startDate: "2025", circa: true, description: "官方当前商品页可见；该日期是资料观察边界，不是型号首发断言。", sourceKey: S.product.key }],
  media: [{ key: "line-d-svg", title: "Line D Eternity 结构事实图（非产品照片）", sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、刻字、库存或价格。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

export const phase254StDupontPacks: CuratedEntityPack[] = [brand, model];
