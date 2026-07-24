import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase77HongdianN7RabbitPacks } from "./phase77-hongdian-n7-rabbit";

export const PHASE148_HONGDIAN_BRAND_ID = "4yRpvovXFoWh";
export const PHASE148_N12_ID = "phase148-hongdian-n12";
export const PHASE148_N12_SLUG = "hongdian-n12";
export const PHASE148_N12_NAME = "HongDian N12";
const RETRIEVED = "2026-07-24";

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
  publishedAt?: string;
}): CuratedSource {
  return {
    ...input,
    independenceGroup: input.registryKey,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase148",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase148",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片，不作为真实比例、颜色、库存或具体批次证明。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  tppen: web({
    key: "phase148-hongdian-n12-ttpen",
    title: "TTPEN Hongdian N12 Piston Fountain Pen",
    url: "https://www.ttpen.com/products/hongdian-n12-piston-fountain-pen-fine-soft-nib-acrylic-design",
    registryKey: "ttpen-hongdian-phase148",
    registryName: "TTPEN",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary: "当代商品页将 N12 列为亚克力树脂、内置活塞、瓶装墨水路线，列出白/橙/绿/紫颜色、EF/F 选项与约 14.5 g 戴帽重量；营销性的 soft 不升级为 flex 事实。",
    locator: "product title; colour and EF/F inputs; acrylic resin; piston filling; 14.5 g capped; fine-soft sales wording",
  }),
  fpc: web({
    key: "phase148-hongdian-n12-fpc",
    title: "Fountain Pen Companion Hongdian N12",
    url: "https://www.fountainpencompanion.com/pen_brands/79-hongdian/pen_models/1552-n12",
    registryKey: "fountain-pen-companion-hongdian-phase148",
    registryName: "Fountain Pen Companion",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "结构化钢笔数据库把 N12 单列为 Hongdian 型号，并记录 Blue、Acrylic、gold-colour nib 与 piston 等版本字段；不把 gold-colour 当金材质。",
    locator: "N12 model index; Blue/Acrylic/Gold-colour/Piston variant fields",
  }),
  desertcart: web({
    key: "phase148-hongdian-n12-desertcart",
    title: "Desertcart Hongdian N12 user sample",
    url: "https://qatar.desertcart.com/products/589639070-hong-dian-n12-piston-fountain-pen-extra-fine-soft-nib",
    registryKey: "desertcart-hongdian-n12-phase148",
    registryName: "Desertcart",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "页面聚合的单支用户样本描述 EF、亚克力、活塞和轻量手感；样本体验用于边界说明，不作为全部 N12 的品控或弹性尖结论。",
    locator: "user sample text: acrylic, piston, EF soft wording, light body and individual writing observations",
  }),
  n7Boundary: web({
    key: "phase148-hongdian-n7-boundary",
    title: "Online Mantra HongDian N7 Grey",
    url: "https://www.onlinemantra.in/products/hongdian-n7-grey-fountain-pen",
    registryKey: "online-mantra-hongdian-phase148",
    registryName: "Online Mantra",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary: "N7 Grey 商品页用于确认 N7 Rabbit 的独立边界：灰色、兔子帽顶、树脂加黄铜与活塞，不把 N7 规格移植到 N12。",
    locator: "N7 Grey/Rabbit identity and piston/material boundary",
  }),
  svg: diagram(
    "phase148-hongdian-n12-svg",
    "HongDian N12 structure and model boundary factual diagram",
    "/images/library/site-original/phase148/hongdian/n12.svg",
  ),
} as const;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

const existingPacks = phase77HongdianN7RabbitPacks(PHASE148_HONGDIAN_BRAND_ID, "phase77-pen-hongdian-n7-rabbit");
const brandBase = existingPacks.find((pack) => pack.expectedType === "brand");
if (!brandBase) throw new Error("Phase 148 HongDian brand prerequisite is missing.");
const hongdianBrand = structuredClone(brandBase);
hongdianBrand.key = "phase148-hongdian-brand-navigation-v1";
hongdianBrand.sources = [...hongdianBrand.sources, S.tppen, S.fpc].filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index);
const brandScope = "phase148-hongdian-n12-navigation";
hongdianBrand.scopes = [...hongdianBrand.scopes, { key: brandScope, scopeKey: brandScope, validFrom: RETRIEVED, productionState: "current", editionScope: "HongDian brand navigation includes the separately curated N12 piston/acrylic model." }];
hongdianBrand.claims = [
  ...hongdianBrand.claims,
  {
    key: "phase148-hongdian-n12-navigation",
    predicate: "series_navigation",
    objectText: "HongDian 品牌页新增 N12 独立型号入口；N12 的亚克力、轻量和活塞规格不继承 N7 Rabbit、N23 或 N6 的版本字段。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: S.tppen.key,
    locator: S.tppen.archiveLocator ?? S.tppen.summary,
    evidence: [{ key: "phase148-hongdian-n12-navigation-evidence", sourceKey: S.tppen.key, scopeKey: brandScope, locator: "N12 product title and piston/acrylic route" }],
  },
];

const n12Scope = "phase148-hongdian-n12-current-sku";
export const phase148HongdianN12Pack: CuratedEntityPack = {
  key: "phase148-hongdian-n12-v1",
  entityId: PHASE148_N12_ID,
  expectedType: "pen",
  expectedSlug: PHASE148_N12_SLUG,
  canonicalName: PHASE148_N12_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/hongdian-n12-phase148.md",
  storyTitle: "HongDian N12：亚克力、活塞与 N 系列身份边界",
  primarySourceKey: S.tppen.key,
  depthTier: "A",
  aliases: [
    { alias: "Hongdian N12", language: "en", sourceKey: S.tppen.key },
    { alias: "HongDian N12 Piston Fountain Pen", language: "en", sourceKey: S.tppen.key },
    { alias: "弘典 N12", language: "zh", sourceKey: S.tppen.key },
  ],
  sources: [S.tppen, S.fpc, S.desertcart, S.n7Boundary, S.svg],
  scopes: [{ key: n12Scope, scopeKey: n12Scope, validFrom: RETRIEVED, productionState: "current", materialScope: "Acrylic resin body with metal clip; colour and marbling are SKU-scoped.", nibScope: "EF/F options on current listing; sales-page soft wording is not a flex or gold-nib claim.", editionScope: "Current N12 product identity; launch year, factory and universal dimensions are not asserted." }],
  claims: [
    { key: "phase148-n12-identity", predicate: "model_identity", objectText: "HongDian N12 是独立的亚克力活塞钢笔型号，不是 N7 Rabbit 的换色或 N23 Year of the Rabbit 的兔子主题版本。", factClass: "core", confidence: 0.99, sourceKey: S.tppen.key, locator: S.tppen.archiveLocator ?? S.tppen.summary, evidence: [{ key: "phase148-n12-identity-evidence", sourceKey: S.tppen.key, scopeKey: n12Scope, locator: "N12 title and product description" }, { key: "phase148-n12-index-evidence", sourceKey: S.fpc.key, scopeKey: n12Scope, locator: "N12 is separately indexed from N7 and N23" }] },
    { key: "phase148-n12-structure", predicate: "filling_material_boundary", objectText: "当前商品页列亚克力树脂、金属夹、内置活塞、瓶装墨水和约 14.5 g 戴帽重量；这些是商品快照，不回填到所有颜色或批次。", factClass: "core", confidence: 0.98, sourceKey: S.tppen.key, locator: S.tppen.summary, evidence: [{ key: "phase148-n12-structure-evidence", sourceKey: S.tppen.key, scopeKey: n12Scope, locator: "acrylic, piston, bottled ink and 14.5 g capped listing" }] },
    { key: "phase148-n12-nib", predicate: "nib_boundary", objectText: "公开商品选项为 EF/F；销售页的 fine-soft 或用户样本的 springy 描述不能升级为 flex、金尖或全批次弹性保证。", factClass: "core", confidence: 0.98, sourceKey: S.tppen.key, locator: "EF/F inputs and soft sales wording", evidence: [{ key: "phase148-n12-nib-evidence", sourceKey: S.tppen.key, scopeKey: n12Scope, locator: "Extra Fine/Fine options; soft is marketing descriptor" }, { key: "phase148-n12-sample-evidence", sourceKey: S.desertcart.key, scopeKey: n12Scope, locator: "single user sample only" }] },
    { key: "phase148-n12-version", predicate: "version_boundary", objectText: "白、橙、绿、紫及蓝/青等大理石纹是颜色和材料外观 SKU，不是互相独立的型号；精确纹理、装饰与包装随库存核对。", factClass: "core", confidence: 0.97, sourceKey: S.fpc.key, locator: S.fpc.summary, evidence: [{ key: "phase148-n12-version-evidence", sourceKey: S.fpc.key, scopeKey: n12Scope, locator: "N12 colour and acrylic variant index" }] },
    { key: "phase148-n12-care", predicate: "maintenance_boundary", objectText: "活塞笔换色时用常温清水吸排至基本清澈并自然晾干；不要根据未核实帖子强拆活塞或使用热水、酒精和强溶剂，异常时保留 SKU 联系销售方。", factClass: "editorial", confidence: 0.96, sourceKey: S.tppen.key, locator: "piston filling instructions and conservative care boundary", evidence: [{ key: "phase148-n12-care-evidence", sourceKey: S.tppen.key, scopeKey: n12Scope, locator: "bottled-ink piston filling instructions" }] },
  ],
  variants: [
    { key: "phase148-n12-colours", name: "N12 acrylic colour variants", notes: "White, orange, green, purple and other marble/transparent colours are SKU options; exact finish follows the listing or pen in hand.", sourceKey: S.tppen.key, variantKind: "color" },
    { key: "phase148-n12-nib-options", name: "N12 EF / F nib options", notes: "Current listing exposes Extra Fine and Fine; do not treat soft wording as flex or gold material.", sourceKey: S.tppen.key, variantKind: "nib" },
  ],
  spec: {
    brandEntityId: PHASE148_HONGDIAN_BRAND_ID,
    values: {
      series_name: "HongDian N12",
      release_year: "Current product listing verified 2026-07-24; launch year not asserted",
      origin_country: "HongDian product line; factory ownership and manufacturing location not inferred",
      nib: "EF/F market options; steel/iridium and soft wording are SKU/sample-scoped, not a gold-nib claim",
      fill_system: "Internal piston filling with bottled ink",
      material: "Acrylic resin body with metal clip; marble/transparent colours vary by SKU",
      weight: "Approximately 14.5 g capped on the current TTPEN listing; batch and packaging scope applies",
      status: "Current retail listing at retrieval; colour, nib and inventory are mutable",
    },
    evidence: [
      evidence("brand_entity_id", "phase148-n12-brand", S.tppen.key, n12Scope, "HongDian product-line context"),
      evidence("series_name", "phase148-n12-series", S.tppen.key, n12Scope, "N12 product title"),
      evidence("release_year", "phase148-n12-release", S.tppen.key, n12Scope, "retrieval date only; launch year withheld"),
      evidence("origin_country", "phase148-n12-origin", S.tppen.key, n12Scope, "brand/product context without factory inference"),
      evidence("nib", "phase148-n12-nib", S.tppen.key, n12Scope, "EF/F inputs and iridium/soft sales wording"),
      evidence("fill_system", "phase148-n12-fill", S.tppen.key, n12Scope, "piston filling description"),
      evidence("material", "phase148-n12-material", S.tppen.key, n12Scope, "acrylic resin and metal clip"),
      evidence("weight", "phase148-n12-weight", S.tppen.key, n12Scope, "14.5 g capped listing"),
      evidence("status", "phase148-n12-status", S.tppen.key, n12Scope, "current retail listing at retrieval"),
    ],
  },
  timeline: [{ key: "phase148-n12-current", title: "N12 current product listing checked", eventType: "model_released", startDate: RETRIEVED, circa: true, description: "Current listing and independent index establish the N12 model boundary; this date is not a launch year.", sourceKey: S.tppen.key }],
  media: [{ key: "phase148-n12-primary", title: "HongDian N12 结构事实图（非产品照片）", sourceKey: S.svg.key, localPath: S.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片；non-photo、non-logo、not-to-scale、non-colour-proof。", sourceUrl: S.svg.url, usageStatus: "primary" }],
};

export const phase148HongdianN12Packs: CuratedEntityPack[] = [hongdianBrand, phase148HongdianN12Pack];
