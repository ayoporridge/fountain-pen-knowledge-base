import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase147AuroraTalentumPacks } from "./phase147-aurora-talentum";

export const PHASE336_AURORA_BRAND_ID = "CJXe8UpnkHLJ";
export const PHASE336_TARGET_ID = "phase336-pen-aurora-ottantotto-millerighe";
export const PHASE336_TARGET_SLUG = "aurora-ottantotto-millerighe";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase336-aurora-ottantotto-millerighe-current";
const SVG_PATH = "/images/library/site-original/phase336/aurora/ottantotto-millerighe.svg";

function source(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup: string;
  homepageUrl?: string;
  author?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    title: input.title,
    url: input.url,
    summary: input.summary,
    sourceType,
    tier: input.tier ?? "primary",
    independenceGroup: input.independenceGroup,
    homepageUrl: input.homepageUrl ?? "https://aurorapen.it/",
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author: input.author ?? input.registryName,
    publishedAt: null,
    retrievedAt: RETRIEVED,
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
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }],
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
    key: "phase336-aurora-millerighe-product",
    registryKey: "aurora-official-millerighe-phase336",
    registryName: "Aurora official",
    title: "Ottantotto Millerighe - Stilografica",
    url: "https://aurorapen.it/shop/ottantotto-millerighe-stilografica/",
    independenceGroup: "aurora-official-product-phase336",
    summary:
      "官方具体商品页标识产品 801，明确活塞上墨、层压镀金帽、millerighe guilloché、黑色树脂笔身、金色饰件与 EF/F/M/B 尖选项；价格仅适用于意大利市场且会变化。",
  }),
  family: source({
    key: "phase336-aurora-ottantotto-category",
    registryKey: "aurora-official-ottantotto-phase336",
    registryName: "Aurora official",
    title: "Ottantotto 官方系列页",
    url: "https://aurorapen.it/categoria-prodotto/alto-di-gamma/ottantotto/",
    independenceGroup: "aurora-official-family-phase336",
    summary:
      "官方系列页把 Millerighe 与 Resina 并列在当代 Ottantotto 家族中，支撑系列边界而不跨 SKU 共享规格。",
  }),
  catalog: source({
    key: "phase336-aurora-high-end-catalog",
    registryKey: "aurora-official-catalog-phase336",
    registryName: "Aurora official",
    title: "Catalogo Alto di Gamma 2025",
    url: "https://aurorapen.it/wp-content/uploads/2025/07/Catalogo-Alto-di-Gamma.pdf",
    independenceGroup: "aurora-official-catalog-phase336",
    summary:
      "官方高端目录第 47 页以 Streaked pattern / Millerighe 分节，区分 chrome cap、gold-plated cap、黑色树脂和 14K 金尖组合及产品编号；用于版本边界。",
  }),
  history: source({
    key: "phase336-aurora-history",
    registryKey: "aurora-official-history-phase336",
    registryName: "Aurora official",
    title: "Aurora La Nostra Storia",
    url: "https://aurorapen.it/la-nostra-storia/",
    independenceGroup: "aurora-official-history-phase336",
    summary:
      "官方历史页将 1947 年 Marcello Nizzoli 设计的 88 作为家族历史锚点；该来源不替代 801 的当前商品规格。",
  }),
  chronology: source({
    key: "phase336-fountainpen-it-aurora",
    registryKey: "fountainpen-it-aurora-phase336",
    registryName: "FountainPen.it",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "fountainpen-it-aurora-phase336",
    homepageUrl: "https://www.fountainpen.it/",
    author: "FountainPen.it contributors",
    title: "Aurora chronology",
    url: "https://www.fountainpen.it/Aurora/en",
    summary:
      "专业年表用于交叉核对 Aurora 88 的历史时间语境；不把老 88 的罩尖、尺寸或活塞细节回填到 801。",
  }),
  diagram: source({
    key: "phase336-aurora-millerighe-svg",
    registryKey: "fountain-pen-graph-editorial-phase336",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    independenceGroup: "fountain-pen-graph-editorial-phase336",
    homepageUrl: "/",
    title: "Aurora Ottantotto Millerighe 801 factual diagram",
    url: SVG_PATH,
    summary:
      "本站原创事实 SVG，提示 801、黑色树脂、millerighe 纹饰、镀金帽、活塞和 EF/F/M/B 边界；非产品照片、非 Logo、非比例图、非颜色校样。",
  }),
} as const;

const model: CuratedEntityPack = {
  key: "phase336-aurora-ottantotto-millerighe-v1",
  entityId: PHASE336_TARGET_ID,
  expectedType: "pen",
  expectedSlug: PHASE336_TARGET_SLUG,
  canonicalName: "Aurora Ottantotto Millerighe",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/aurora-ottantotto-millerighe-phase336.md",
  storyTitle: "Aurora Ottantotto Millerighe（801）：条纹 guilloché 与活塞结构",
  primarySourceKey: SOURCES.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Ottantotto Millerighe", language: "it", sourceKey: SOURCES.product.key },
    { alias: "Aurora 88 Millerighe", language: "en", sourceKey: SOURCES.family.key },
    { alias: "Aurora Ottantotto Millerighe 801", language: "en", sourceKey: SOURCES.product.key },
    { alias: "Aurora 88 条纹款", language: "zh", sourceKey: SOURCES.product.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Aurora official Italy product listing",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "801 product page lists EF, F, M and B; material and exact tip size are not asserted beyond cited page",
      materialScope: "black resin barrel with millerighe guilloché and laminated gold-plated cap",
      editionScope: "801 Millerighe only; Resina, chrome-cap and silver-cap combinations remain separate SKU boundaries",
    },
    {
      key: `${SCOPE}-history`,
      scopeKey: `${SCOPE}-history`,
      productionState: "historical",
      editionScope: "1947 Nizzoli 88 family history is contextual and does not prove 801 launch year",
    },
    {
      key: `${SCOPE}-care`,
      scopeKey: `${SCOPE}-care`,
      productionState: "current",
      editionScope: "Gentle water cleaning; no abrasive polishing or user disassembly of piston mechanism",
    },
  ],
  claims: [
    claim("phase336-identity", "model_identity", "Aurora Ottantotto Millerighe 的官方商品标识为 801，是 88/Ottantotto 家族下的独立具体钢笔 SKU。", SOURCES.product.key, "product title and 801 identifier"),
    claim("phase336-piston", "filling_system", "官方商品页明确写作活塞钢笔；不能把 801 写成墨囊/转换器型号。", SOURCES.product.key, "stilografica a pistone"),
    claim("phase336-material", "material_finish", "801 的页面描述为黑色树脂笔身、millerighe guilloché 纹饰、层压镀金帽和金色饰件。", SOURCES.product.key, "product description"),
    claim("phase336-nib", "nib_options", "官方页面列出 EF、F、M、B 四种尖幅；未在该段落承诺每一支的尖号材质、长度或重量。", SOURCES.product.key, "Pennino selector"),
    claim("phase336-family", "family_boundary", "Aurora 官方历史页以 1947 年 Marcello Nizzoli 设计的 88 为家族锚点；当代 Millerighe 不等于历史原版 88。", SOURCES.history.key, "1947 Nizzoli 88 history"),
    claim("phase336-chronology-crosscheck", "historical_crosscheck", "FountainPen.it 的 Aurora 年表作为独立专业资料交叉记录 88 家族的战后历史；它只用于年代语境，不覆盖 801 的当前规格。", SOURCES.chronology.key, "Aurora chronology and 88 family history"),
    claim("phase336-variants", "variant_boundary", "官方目录将 chrome cap、gold-plated cap、银帽及 Resina 组合分开列示；801 只承载本页黑树脂加镀金帽组合。", SOURCES.catalog.key, "catalogue pp. 46-47 and product identity"),
    claim("phase336-price", "price_status", "商品页检索日显示约 €750，运费另计且价格仅适用于意大利市场；库存与价格是可变快照。", SOURCES.product.key, "displayed price and market notice"),
    claim("phase336-maintenance", "maintenance", "活塞款换色使用常温清水吸排；外部镀层与条纹纹饰用软布清洁，避免酒精、研磨膏和自行拆活塞。", SOURCES.product.key, "piston and finish care editorial boundary", "editorial"),
    claim("phase336-media", "media_identity_boundary", "主图为本站原创 factual SVG，非产品照片、非 Logo、非比例图、非颜色校样。", SOURCES.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase336-millerighe-nibs", name: "EF / F / M / B", notes: "官方商品页的尖幅选项；不把尖幅拆成独立型号。", sourceKey: SOURCES.product.key, variantKind: "nib", market: "Aurora Italy listing" },
    { key: "phase336-millerighe-finish", name: "801 gold-plated cap / black resin", notes: "本页范围；chrome-cap、银帽和 Resina 另行识别。", sourceKey: SOURCES.catalog.key, variantKind: "market_sku", market: "Aurora official catalogue" },
    { key: "phase336-millerighe-price", name: "Italy price snapshot", notes: "约 €750、运费另计；不是全球固定 MSRP。", sourceKey: SOURCES.product.key, variantKind: "market_sku", market: "Italy" },
  ],
  spec: {
    brandEntityId: PHASE336_AURORA_BRAND_ID,
    values: {
      series_name: "Aurora 88 / Ottantotto Millerighe 801",
      release_year: "当前商品与 2025 高端目录读取于 2026-07-28；不据此推断 801 首发年份",
      origin_country: "Aurora 意大利品牌语境；本页不把家族历史外推为每个零件产地声明",
      nib: "EF、F、M、B（官方商品页尖幅选项；材质与尺寸未在该段落明确）",
      fill_system: "活塞上墨",
      material: "黑色树脂笔身；millerighe guilloché 纹饰；层压镀金帽与金色饰件",
      dimensions: "官方 801 商品页未公布本 SKU 的完整尺寸；不要借用其他 88 样本测量",
      weight: "官方 801 商品页未公布本 SKU 重量",
      price_range: "约 €750（检索日意大利市场显示，运费另计；价格和库存会变化）",
      status: "Aurora 官方当前 Ottantotto Millerighe 801 商品入口；颜色、尖幅与库存按订单核对",
    },
    evidence: [
      evidence("phase336-brand", "brand_entity_id", SOURCES.product.key, "Aurora product context"),
      evidence("phase336-series", "series_name", SOURCES.product.key, "801 title and family category"),
      evidence("phase336-release", "release_year", SOURCES.product.key, "retrieval date only"),
      evidence("phase336-origin", "origin_country", SOURCES.history.key, "Aurora Italian history context"),
      evidence("phase336-nib", "nib", SOURCES.product.key, "EF/F/M/B selector"),
      evidence("phase336-fill", "fill_system", SOURCES.product.key, "piston description"),
      evidence("phase336-material", "material", SOURCES.product.key, "black resin, guilloche and gold-plated cap"),
      evidence("phase336-dimensions", "dimensions", SOURCES.product.key, "not published on exact page; explicit unknown"),
      evidence("phase336-weight", "weight", SOURCES.product.key, "not published on exact page; explicit unknown"),
      evidence("phase336-price", "price_range", SOURCES.product.key, "Italy price snapshot"),
      evidence("phase336-status", "status", SOURCES.product.key, "current exact listing"),
    ],
  },
  media: [
    {
      key: "phase336-millerighe-primary-media",
      title: "Aurora Ottantotto Millerighe 801 事实图（非产品照片）",
      sourceKey: SOURCES.diagram.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary",
    },
  ],
};

const auroraBrand = phase147AuroraTalentumPacks.find(
  (pack) => pack.entityId === PHASE336_AURORA_BRAND_ID && pack.expectedType === "brand",
);
if (!auroraBrand) throw new Error("Phase 336 Aurora brand prerequisite is missing.");

export const phase336AuroraOttantottoMillerighePacks: CuratedEntityPack[] = [
  auroraBrand,
  model,
];
