import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase147AuroraTalentumPacks } from "./phase147-aurora-talentum";

export const PHASE338_AURORA_BRAND_ID = "CJXe8UpnkHLJ";
export const PHASE338_TARGET_ID = "phase338-pen-aurora-ipsilon-italia";
export const PHASE338_TARGET_SLUG = "aurora-ipsilon-italia";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase338-aurora-ipsilon-italia-current";
const SVG_PATH = "/images/library/site-original/phase338/aurora/ipsilon-italia.svg";

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
    key: "phase338-aurora-italia-product",
    registryKey: "aurora-official-italia-phase338",
    registryName: "Aurora official",
    title: "Ipsilon Italia - Stilografica",
    url: "https://aurorapen.it/shop/ipsilon-italia-stilografica/",
    independenceGroup: "aurora-official-product-phase338",
    summary:
      "官方具体商品页标识 B17-A，明确蓝色树脂、三色漆环、镀铬饰件与意大利统一纪念主题；价格仅适用于意大利市场且会变化。",
  }),
  family: source({
    key: "phase338-aurora-ipsilon-category",
    registryKey: "aurora-official-ipsilon-phase338",
    registryName: "Aurora official",
    title: "Ipsilon 官方分类页",
    url: "https://aurorapen.it/categoria-prodotto/medio-di-gamma/ipsilon/",
    independenceGroup: "aurora-official-ipsilon-family-phase338",
    summary:
      "官方 Ipsilon 分类页将 Italia、Quadra、Resin、Demo Colors 等分支并列，支撑 Ipsilon 家族边界而不跨 SKU 共享规格。",
  }),
  catalog: source({
    key: "phase338-aurora-medium-catalog",
    registryKey: "aurora-official-medium-catalog-phase338",
    registryName: "Aurora official",
    title: "Catalogo Medio di Gamma 2017",
    url: "https://www.aurorapen.it/wp-content/uploads/2020/02/Catalogo-Medio-di-Gamma-2017.pdf",
    independenceGroup: "aurora-official-medium-catalog-phase338",
    summary:
      "官方中档目录用于确认 Ipsilon 家族的中档产品语境与不同材料/饰件路线；不把未逐项点名 B17-A 的目录规格强行回填。",
  }),
  history: source({
    key: "phase338-aurora-ipsilon-history",
    registryKey: "aurora-official-history-phase338",
    registryName: "Aurora official",
    title: "Aurora La Nostra Storia",
    url: "https://aurorapen.it/la-nostra-storia/",
    independenceGroup: "aurora-official-ipsilon-history-phase338",
    summary:
      "官方历史页用于 Aurora 品牌与现代 Ipsilon 的意大利制造语境；不把家族历史外推为 B17-A 的首发年份。",
  }),
  chronology: source({
    key: "phase338-penchalet-ipsilon-italia",
    registryKey: "penchalet-ipsilon-italia-phase338",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "penchalet-ipsilon-italia-phase338",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    title: "Aurora Ipsilon Italia Collection Fountain Pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/aurora_ipsilon_italia_fountain_pen.html",
    summary:
      "专业零售资料交叉列出 Ipsilon Italia 钢笔的墨囊/转换器填充与随附转换器语境；不替代 Aurora 官方身份、颜色与价格。",
  }),
  diagram: source({
    key: "phase338-aurora-italia-svg",
    registryKey: "fountain-pen-graph-editorial-phase338",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    independenceGroup: "fountain-pen-graph-editorial-phase338",
    homepageUrl: "/",
    title: "Aurora Ipsilon Italia B17-A factual diagram",
    url: SVG_PATH,
    summary:
      "本站原创事实 SVG，提示 B17-A、蓝色树脂、三色漆环、镀铬饰件和墨囊/转换器边界；非产品照片、非 Logo、非比例图、非颜色校样。",
  }),
} as const;

const model: CuratedEntityPack = {
  key: "phase338-aurora-ipsilon-italia-v1",
  entityId: PHASE338_TARGET_ID,
  expectedType: "pen",
  expectedSlug: PHASE338_TARGET_SLUG,
  canonicalName: "Aurora Ipsilon Italia",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/aurora-ipsilon-italia-phase338.md",
  storyTitle: "Aurora Ipsilon Italia（B17-A）：蓝色树脂、三色漆环与纪念主题",
  primarySourceKey: SOURCES.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Ipsilon Italia", language: "it", sourceKey: SOURCES.product.key },
    { alias: "Aurora Ipsilon Italia B17-A", language: "en", sourceKey: SOURCES.product.key },
    { alias: "Aurora Ipsilon Italia Azzurra", language: "en", sourceKey: SOURCES.product.key },
    { alias: "奥罗拉 Ipsilon Italia", language: "zh", sourceKey: SOURCES.product.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Aurora official Italy Ipsilon listing",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "B17-A exact page does not publish nib material or width; verify by order and physical nib",
      materialScope: "blue resin with tricolour lacquer ring and chrome finish",
      editionScope: "B17-A Ipsilon Italia fountain pen only; other B17 colours, ballpoint/roller and Ipsilon Resin remain separate",
    },
    {
      key: `${SCOPE}-history`,
      scopeKey: `${SCOPE}-history`,
      productionState: "historical",
      editionScope: "Italian-unification anniversary context is separate from B17-A launch-year and production-count claims",
    },
    {
      key: `${SCOPE}-care`,
      scopeKey: `${SCOPE}-care`,
      productionState: "current",
      editionScope: "International cartridge/converter cleaning; protect sterling silver and guilloché from abrasives",
    },
  ],
  claims: [
    claim("phase338-identity", "model_identity", "Aurora Ipsilon Italia 的官方商品标识为 B17-A，是 Ipsilon 家族下独立的钢笔 SKU。", SOURCES.product.key, "product title and B17-A identifier"),
    claim("phase338-fill", "filling_system", "专业零售资料将 Ipsilon Italia 标为国际墨囊/转换器填充；官方商品页未把它写成活塞或真空机构。", SOURCES.chronology.key, "cartridge/converter product specification"),
    claim("phase338-material", "material_finish", "官方商品页明确 B17-A 使用蓝色树脂、三色漆环和镀铬饰件；纪念人名装饰属于主题语境，不证明限量数量。", SOURCES.product.key, "product description and commemorative text"),
    claim("phase338-nib", "nib_options", "官方 B17-A 页面没有在商品摘要中公布尖材、尖幅、尺寸和重量；不能把 Quadra 的 14K 尖或 Resin 的钢尖回填。", SOURCES.product.key, "exact page field boundary"),
    claim("phase338-family", "family_boundary", "官方 Ipsilon 分类页把 Italia 与 Quadra、Resin、Demo Colors 等分支并列；圆珠/roller 不能合并到钢笔页。", SOURCES.family.key, "Ipsilon category and sibling boundaries"),
    claim("phase338-chronology-crosscheck", "professional_crosscheck", "Pen Chalet 独立资料交叉列出 Ipsilon Italia 的墨囊/转换器路线与随附转换器语境；它不替代 Aurora 官方颜色与价格。", SOURCES.chronology.key, "professional retailer model description"),
    claim("phase338-variants", "variant_boundary", "B17-A 蓝色树脂与三色漆环是本页范围；其他 B17 颜色、Ipsilon Resin、Quadra 和 Cento Italia 需按独立编号记录。", SOURCES.catalog.key, "Ipsilon family catalogue boundary"),
    claim("phase338-price", "price_status", "商品页检索日显示约 €185，运费另计且价格仅适用于意大利市场；库存与价格是可变快照。", SOURCES.product.key, "displayed price and market notice"),
    claim("phase338-maintenance", "maintenance", "墨囊/转换器款换色使用常温清水吸排；蓝色树脂和漆环用软布清洁，避免酒精、研磨膏和自行拆解。", SOURCES.product.key, "resin and filling care editorial boundary", "editorial"),
    claim("phase338-media", "media_identity_boundary", "主图为本站原创 factual SVG，非产品照片、非 Logo、非比例图、非颜色校样。", SOURCES.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase338-italia-nib", name: "Nib width/material by order", notes: "B17-A 商品摘要未公布尖材与尖幅；按订单和实物核对。", sourceKey: SOURCES.product.key, variantKind: "nib", market: "Aurora Italy listing" },
    { key: "phase338-italia-finish", name: "Blue resin / tricolour lacquer ring / chrome", notes: "B17-A 本页外观边界；其他 B17 颜色另行识别。", sourceKey: SOURCES.product.key, variantKind: "material", market: "Aurora official listing" },
    { key: "phase338-italia-price", name: "Italy price snapshot", notes: "约 €185、运费另计；不是全球固定 MSRP。", sourceKey: SOURCES.product.key, variantKind: "market_sku", market: "Italy" },
  ],
  spec: {
    brandEntityId: PHASE338_AURORA_BRAND_ID,
    values: {
      series_name: "Aurora Ipsilon Italia B17-A",
      release_year: "当前商品与 Ipsilon 目录读取于 2026-07-28；不据此推断 B17-A 首发年份",
      origin_country: "Aurora 意大利品牌语境；本页不把品牌语境外推为每个零件产地声明",
      nib: "官方 B17-A 商品摘要未公布尖材与尖幅；按订单与实物核对",
      fill_system: "国际规格墨囊或转换器（专业零售交叉资料）",
      material: "蓝色树脂；三色漆环；镀铬饰件",
      dimensions: "官方 B17-A 商品页未公布本 SKU 的完整尺寸；不要借用其他 Ipsilon 样本测量",
      weight: "官方 B17-A 商品页未公布本 SKU 重量",
      price_range: "约 €185（检索日意大利市场显示，运费另计；价格和库存会变化）",
      status: "Aurora 官方 Ipsilon Italia B17-A 商品入口；颜色、尖材、填充和库存按订单核对",
    },
    evidence: [
      evidence("phase338-brand", "brand_entity_id", SOURCES.product.key, "Aurora product context"),
      evidence("phase338-series", "series_name", SOURCES.product.key, "B17-A title and Ipsilon category"),
      evidence("phase338-release", "release_year", SOURCES.product.key, "retrieval date only"),
      evidence("phase338-origin", "origin_country", SOURCES.history.key, "Aurora Italian brand context"),
      evidence("phase338-nib", "nib", SOURCES.product.key, "B17-A exact page field boundary"),
      evidence("phase338-fill", "fill_system", SOURCES.chronology.key, "professional cartridge/converter specification"),
      evidence("phase338-material", "material", SOURCES.product.key, "blue resin, tricolour lacquer ring and chrome finish"),
      evidence("phase338-dimensions", "dimensions", SOURCES.product.key, "not published on exact page; explicit unknown"),
      evidence("phase338-weight", "weight", SOURCES.product.key, "not published on exact page; explicit unknown"),
      evidence("phase338-price", "price_range", SOURCES.product.key, "Italy price snapshot"),
      evidence("phase338-status", "status", SOURCES.product.key, "current exact listing"),
    ],
  },
  media: [
    {
      key: "phase338-italia-primary-media",
      title: "Aurora Ipsilon Italia B17-A 事实图（非产品照片）",
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
  (pack) => pack.entityId === PHASE338_AURORA_BRAND_ID && pack.expectedType === "brand",
);
if (!auroraBrand) throw new Error("Phase 338 Aurora brand prerequisite is missing.");

export const phase338AuroraIpsilonItaliaPacks: CuratedEntityPack[] = [
  auroraBrand,
  model,
];
