import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase147AuroraTalentumPacks } from "./phase147-aurora-talentum";

export const PHASE337_AURORA_BRAND_ID = "CJXe8UpnkHLJ";
export const PHASE337_TARGET_ID = "phase337-pen-aurora-ipsilon-quadra";
export const PHASE337_TARGET_SLUG = "aurora-ipsilon-quadra";
const RETRIEVED = "2026-07-28";
const SCOPE = "phase337-aurora-ipsilon-quadra-current";
const SVG_PATH = "/images/library/site-original/phase337/aurora/ipsilon-quadra.svg";

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
    key: "phase337-aurora-quadra-product",
    registryKey: "aurora-official-quadra-phase337",
    registryName: "Aurora official",
    title: "Ipsilon Quadra - Stilografica",
    url: "https://aurorapen.it/shop/ipsilon-quadra-stilografica/",
    independenceGroup: "aurora-official-product-phase337",
    summary:
      "官方具体商品页标识 B14-CQN，明确 925 银帽、quadra guilloché、镀铬饰件、14Kt 镀铑实金尖；价格仅适用于意大利市场且会变化。",
  }),
  family: source({
    key: "phase337-aurora-ipsilon-category",
    registryKey: "aurora-official-ipsilon-phase337",
    registryName: "Aurora official",
    title: "Ipsilon 官方分类页",
    url: "https://aurorapen.it/categoria-prodotto/medio-di-gamma/ipsilon/",
    independenceGroup: "aurora-official-ipsilon-family-phase337",
    summary:
      "官方 Ipsilon 分类页将 Quadra、Resin、Demo Colors 等分支并列，支撑 Ipsilon 家族边界而不跨 SKU 共享规格。",
  }),
  catalog: source({
    key: "phase337-aurora-medium-catalog",
    registryKey: "aurora-official-medium-catalog-phase337",
    registryName: "Aurora official",
    title: "Catalogo Medio di Gamma 2017",
    url: "https://www.aurorapen.it/wp-content/uploads/2020/02/Catalogo-Medio-di-Gamma-2017.pdf",
    independenceGroup: "aurora-official-medium-catalog-phase337",
    summary:
      "官方中档目录的 Ipsilon Quadra 分节确认 925 银帽/笔身、quadra guilloché、镀铬饰件和 14Kt 镀铑实金尖；用于版本边界。",
  }),
  history: source({
    key: "phase337-aurora-ipsilon-history",
    registryKey: "aurora-official-history-phase337",
    registryName: "Aurora official",
    title: "Aurora La Nostra Storia",
    url: "https://aurorapen.it/la-nostra-storia/",
    independenceGroup: "aurora-official-ipsilon-history-phase337",
    summary:
      "官方历史页用于 Aurora 品牌与现代 Ipsilon 的意大利制造语境；不把家族历史外推为 B14-CQN 的首发年份。",
  }),
  chronology: source({
    key: "phase337-giardino-ipsilon-quadra",
    registryKey: "giardino-ipsilon-quadra-phase337",
    registryName: "Giardino Italiano",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "giardino-ipsilon-quadra-phase337",
    homepageUrl: "https://www.giardino.it/",
    author: "Giardino Italiano",
    title: "Aurora Ipsilon Quadra in sterling silver",
    url: "https://www.giardino.it/pens/aurora/ipsilonquadra.php",
    summary:
      "专业零售资料交叉列出 Ipsilon Quadra 的 925 银、quadra 方格纹饰、国际墨囊/转换器和 14K 白金色尖；不替代 Aurora 官方库存与价格。",
  }),
  diagram: source({
    key: "phase337-aurora-quadra-svg",
    registryKey: "fountain-pen-graph-editorial-phase337",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    independenceGroup: "fountain-pen-graph-editorial-phase337",
    homepageUrl: "/",
    title: "Aurora Ipsilon Quadra B14-CQN factual diagram",
    url: SVG_PATH,
    summary:
      "本站原创事实 SVG，提示 B14-CQN、925 银、quadra 纹饰、镀铬饰件、14K 尖和墨囊/转换器边界；非产品照片、非 Logo、非比例图、非颜色校样。",
  }),
} as const;

const model: CuratedEntityPack = {
  key: "phase337-aurora-ipsilon-quadra-v1",
  entityId: PHASE337_TARGET_ID,
  expectedType: "pen",
  expectedSlug: PHASE337_TARGET_SLUG,
  canonicalName: "Aurora Ipsilon Quadra",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/aurora-ipsilon-quadra-phase337.md",
  storyTitle: "Aurora Ipsilon Quadra（B14-CQN）：925 银方格 guilloché 与 14K 尖",
  primarySourceKey: SOURCES.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Ipsilon Quadra", language: "it", sourceKey: SOURCES.product.key },
    { alias: "Aurora Ipsilon Quadra B14-CQN", language: "en", sourceKey: SOURCES.product.key },
    { alias: "Aurora Ipsilon Quadra Sterling Silver", language: "en", sourceKey: SOURCES.product.key },
    { alias: "奥罗拉 Ipsilon Quadra", language: "zh", sourceKey: SOURCES.product.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Aurora official Italy Ipsilon listing",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "B14-CQN official page and 2017 catalogue identify a 14Kt rhodium-treated solid-gold nib; exact width is not asserted",
      materialScope: "925 silver cap/body with quadra guilloché and chrome finish",
      editionScope: "B14-CQN Ipsilon Quadra fountain pen only; Resin, Quadra roller, Ipsilon Italia and Cento Italia remain separate",
    },
    {
      key: `${SCOPE}-history`,
      scopeKey: `${SCOPE}-history`,
      productionState: "historical",
      editionScope: "Ipsilon family history and catalogue context are separate from B14-CQN launch-year claims",
    },
    {
      key: `${SCOPE}-care`,
      scopeKey: `${SCOPE}-care`,
      productionState: "current",
      editionScope: "International cartridge/converter cleaning; protect sterling silver and guilloché from abrasives",
    },
  ],
  claims: [
    claim("phase337-identity", "model_identity", "Aurora Ipsilon Quadra 的官方商品标识为 B14-CQN，是 Ipsilon 家族下独立的钢笔 SKU。", SOURCES.product.key, "product title and B14-CQN identifier"),
    claim("phase337-fill", "filling_system", "专业零售资料将 Ipsilon Quadra 标为国际墨囊/转换器填充；官方商品页未把它写成活塞或真空机构。", SOURCES.chronology.key, "cartridge/converter product specification"),
    claim("phase337-material", "material_finish", "官方商品页明确 B14-CQN 使用 925 银帽、quadra guilloché 和镀铬饰件，并配 deluxe 类型小环。", SOURCES.product.key, "product description"),
    claim("phase337-nib", "nib_options", "官方商品页与中档目录均列 14Kt 镀铑实金尖；本页不把其他 Ipsilon 的钢尖或玫瑰金尖回填。", SOURCES.product.key, "14Kt rhodium-treated solid-gold nib"),
    claim("phase337-family", "family_boundary", "官方 Ipsilon 分类页把 Quadra 与 Resin、Demo Colors 等分支并列；Quadra roller 和 Ipsilon Italia 不能合并到本页。", SOURCES.family.key, "Ipsilon category and sibling boundaries"),
    claim("phase337-chronology-crosscheck", "professional_crosscheck", "Giardino Italiano 独立资料交叉列出 925 银、方格 guilloché、国际墨囊/转换器和 14K 白金色尖；它不替代 Aurora 官方库存与价格。", SOURCES.chronology.key, "professional retailer model description"),
    claim("phase337-variants", "variant_boundary", "官方 2017 中档目录把 Quadra 的银帽/镀铬、黑树脂和其他 Ipsilon 组合按编号区分；B14-CQN 只承载本页银质 Quadra 钢笔。", SOURCES.catalog.key, "Ipsilon Quadra catalogue entry"),
    claim("phase337-price", "price_status", "商品页检索日显示约 €285，运费另计且价格仅适用于意大利市场；库存与价格是可变快照。", SOURCES.product.key, "displayed price and market notice"),
    claim("phase337-maintenance", "maintenance", "墨囊/转换器款换色使用常温清水吸排；925 银与 guilloché 用软布清洁，避免酒精、研磨膏和自行拆解。", SOURCES.product.key, "silver and filling care editorial boundary", "editorial"),
    claim("phase337-media", "media_identity_boundary", "主图为本站原创 factual SVG，非产品照片、非 Logo、非比例图、非颜色校样。", SOURCES.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase337-quadra-nib", name: "14Kt rhodium-treated solid-gold nib", notes: "官方商品页和目录确认的尖材；尖幅按订单或实物核对。", sourceKey: SOURCES.product.key, variantKind: "nib", market: "Aurora Italy listing" },
    { key: "phase337-quadra-finish", name: "925 silver / quadra / chrome finish", notes: "B14-CQN 本页材质边界；Resin、玫瑰金、钌色和 roller 另行识别。", sourceKey: SOURCES.catalog.key, variantKind: "material", market: "Aurora official catalogue" },
    { key: "phase337-quadra-price", name: "Italy price snapshot", notes: "约 €285、运费另计；不是全球固定 MSRP。", sourceKey: SOURCES.product.key, variantKind: "market_sku", market: "Italy" },
  ],
  spec: {
    brandEntityId: PHASE337_AURORA_BRAND_ID,
    values: {
      series_name: "Aurora Ipsilon Quadra B14-CQN",
      release_year: "当前商品与 2017 中档目录读取于 2026-07-28；不据此推断 B14-CQN 首发年份",
      origin_country: "Aurora 意大利品牌语境；本页不把品牌语境外推为每个零件产地声明",
      nib: "14Kt 镀铑实金尖；具体尖幅按订单与实物核对",
      fill_system: "国际规格墨囊或转换器（专业零售交叉资料）",
      material: "925 银帽/笔身；quadra guilloché；镀铬饰件",
      dimensions: "官方 B14-CQN 商品页未公布本 SKU 的完整尺寸；不要借用其他 Ipsilon 样本测量",
      weight: "官方 B14-CQN 商品页未公布本 SKU 重量",
      price_range: "约 €285（检索日意大利市场显示，运费另计；价格和库存会变化）",
      status: "Aurora 官方 Ipsilon Quadra B14-CQN 商品入口；材质、尖材、填充和库存按订单核对",
    },
    evidence: [
      evidence("phase337-brand", "brand_entity_id", SOURCES.product.key, "Aurora product context"),
      evidence("phase337-series", "series_name", SOURCES.product.key, "B14-CQN title and Ipsilon category"),
      evidence("phase337-release", "release_year", SOURCES.product.key, "retrieval date only"),
      evidence("phase337-origin", "origin_country", SOURCES.history.key, "Aurora Italian brand context"),
      evidence("phase337-nib", "nib", SOURCES.product.key, "14Kt rhodium-treated solid-gold nib"),
      evidence("phase337-fill", "fill_system", SOURCES.chronology.key, "professional cartridge/converter specification"),
      evidence("phase337-material", "material", SOURCES.product.key, "925 silver, quadra guilloche and chrome finish"),
      evidence("phase337-dimensions", "dimensions", SOURCES.product.key, "not published on exact page; explicit unknown"),
      evidence("phase337-weight", "weight", SOURCES.product.key, "not published on exact page; explicit unknown"),
      evidence("phase337-price", "price_range", SOURCES.product.key, "Italy price snapshot"),
      evidence("phase337-status", "status", SOURCES.product.key, "current exact listing"),
    ],
  },
  media: [
    {
      key: "phase337-quadra-primary-media",
      title: "Aurora Ipsilon Quadra B14-CQN 事实图（非产品照片）",
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
  (pack) => pack.entityId === PHASE337_AURORA_BRAND_ID && pack.expectedType === "brand",
);
if (!auroraBrand) throw new Error("Phase 337 Aurora brand prerequisite is missing.");

export const phase337AuroraIpsilonQuadraPacks: CuratedEntityPack[] = [
  auroraBrand,
  model,
];
