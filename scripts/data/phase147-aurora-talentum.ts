import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase41IdentityCleanupPacks } from "./phase41-identity-cleanup";

export const PHASE147_AURORA_BRAND_ID = "CJXe8UpnkHLJ";
export const PHASE147_TALENTUM_ID = "phase147-aurora-talentum";
export const PHASE147_AURORA_SLUG = "aurora";
export const PHASE147_TALENTUM_SLUG = "aurora-talentum";
export const PHASE147_TALENTUM_NAME = "奥罗拉 Aurora Talentum";
const RETRIEVED = "2026-07-24";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  summary: string;
  locator: string;
  publishedAt?: string;
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
    author: input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase147",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase147",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "本站原创 factual SVG；示意图，非产品照片，不作为真实比例、颜色或库存证明。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  catalog: web({
    key: "phase147-aurora-high-end-catalog",
    title: "Aurora Catalogo Alto di Gamma 2025",
    url: "https://aurorapen.it/wp-content/uploads/2025/07/Catalogo-Alto-di-Gamma.pdf",
    registryKey: "aurora-official-catalog-phase147",
    registryName: "Aurora official catalogue",
    summary: "官方高端目录把 Talentum 定义为新千年的钢笔，并列出镀铬帽、钌色帽、普通与 Big 代码及 14K 尖路线。",
    locator: "Talentum pages 57–59: D10-C/D30-C/D70-C, D10-RN/D30-RN/D70-RN, D11-C/D71-C Big, 14K nibs",
    publishedAt: "2025-07",
  }),
  category: web({
    key: "phase147-aurora-talentum-category",
    title: "Aurora Talentum official category",
    url: "https://aurorapen.it/categoria-prodotto/alto-di-gamma/talentum/",
    registryKey: "aurora-official-category-phase147",
    registryName: "Aurora official",
    summary: "官方 Talentum 分类页保留系列入口；检索时可见的具体商品主要是 Resina roller 与 ballpoint，不能外推为钢笔库存。",
    locator: "Talentum category navigation and current Resina roller/ballpoint results; fountain-pen stock not separately confirmed",
  }),
  faq: web({
    key: "phase147-aurora-faq",
    title: "Aurora FAQ: filling and nibs",
    url: "https://aurorapen.it/faq/",
    registryKey: "aurora-official-faq-phase147",
    registryName: "Aurora official",
    summary: "Aurora FAQ 将 Talentum 纳入高端 14K（585‰）笔尖范围，并说明高端活塞、隐藏备用墨仓、K/S 墨囊与转换器使用。",
    locator: "FAQ sections on high-end 14K nibs, piston/reserve tank, Aurora K/S cartridges and converter filling",
  }),
  converter: web({
    key: "phase147-aurora-158c-converter",
    title: "Aurora 158-C converter compatibility",
    url: "https://aurorapen.it/shop/converter/",
    registryKey: "aurora-official-accessories-phase147",
    registryName: "Aurora official",
    summary: "官方 158-C 配件页明确列出 Talentum 兼容，但兼容性仍需落到具体早期或限量笔的接口核对。",
    locator: "158-C product compatibility list includes Talentum",
  }),
  timeline: web({
    key: "phase147-aurora-timeline",
    title: "MuseoTorino Aurora timeline",
    url: "https://www.museotorino.it/view/preview/ac120453f6da4a78bd6d61a82ab1c006/1",
    registryKey: "museotorino-aurora-phase147",
    registryName: "MuseoTorino",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "MuseoTorino 年表把 Talentum 放在 2000–2002 设计阶段，并记为 Giampiero Maria Bodino 设计；该年份是设计语境，不是每个 SKU 的上市年。",
    locator: "Aurora timeline 2000–2002: Talentum and Leonardo da Vinci designed by Giampiero Maria Bodino",
  }),
  dedalo: web({
    key: "phase147-aurora-dedalo-blu",
    title: "Aurora Dedalo Blu fountain pen",
    url: "https://www.aurorapen.it/prodotto/stilografica-dedalo-blu/",
    registryKey: "aurora-official-dedalo-phase147",
    registryName: "Aurora official",
    summary: "官方 Dedalo Blu 页面给出 D11-CDB、蓝色树脂、雕刻镀铬帽、14K 铑处理尖与 555 支限量边界。",
    locator: "D11-CDB; blue resin; engraved chrome cap; 14K rhodium nib; limited to 555 pieces",
  }),
  svg: diagram(
    "phase147-aurora-talentum-svg",
    "Aurora Talentum version boundary factual diagram",
    "/images/library/site-original/phase147/aurora/talentum.svg",
  ),
} as const;

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

const brandBase = phase41IdentityCleanupPacks.find(
  (pack) => pack.entityId === PHASE147_AURORA_BRAND_ID && pack.expectedType === "brand",
);
if (!brandBase) throw new Error("Phase 147 Aurora brand prerequisite is missing.");

const auroraBrand = structuredClone(brandBase);
auroraBrand.key = "phase147-aurora-brand-navigation-v1";
auroraBrand.sources = [...auroraBrand.sources, S.catalog, S.category].filter(
  (source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index,
);
const brandScope = "phase147-aurora-talentum-navigation";
auroraBrand.scopes = [
  ...auroraBrand.scopes,
  {
    key: brandScope,
    scopeKey: brandScope,
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope: "Aurora brand navigation now includes the separately curated Talentum fountain-pen series.",
  },
];
auroraBrand.claims = [
  ...auroraBrand.claims,
  {
    key: "phase147-aurora-talentum-navigation",
    predicate: "series_navigation",
    objectText: "Aurora 品牌页新增 Talentum 钢笔系列入口；Talentum 的 roller、ballpoint、Big、Dedalo 与普通帽材版本继续按各自 SKU 或版次记录。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: S.catalog.key,
    locator: S.catalog.archiveLocator ?? S.catalog.summary,
    evidence: [{
      key: "phase147-aurora-talentum-navigation-evidence",
      sourceKey: S.catalog.key,
      scopeKey: brandScope,
      locator: "Talentum catalog pages and SKU groups",
    }],
  },
];

const talentumScope = "phase147-aurora-talentum-catalog-scope";
const dedaloScope = "phase147-aurora-talentum-dedalo-scope";

export const phase147AuroraTalentumPack: CuratedEntityPack = {
  key: "phase147-aurora-talentum-v1",
  entityId: PHASE147_TALENTUM_ID,
  expectedType: "pen",
  expectedSlug: PHASE147_TALENTUM_SLUG,
  canonicalName: PHASE147_TALENTUM_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/aurora-talentum-phase147.md",
  storyTitle: "Aurora Talentum：目录版本、14K 尖与钢笔边界",
  primarySourceKey: S.catalog.key,
  depthTier: "A",
  aliases: [
    { alias: "Aurora Talentum", language: "en", sourceKey: S.catalog.key },
    { alias: "Talentum", language: "en", sourceKey: S.category.key },
    { alias: "奥罗拉 Talentum", language: "zh", sourceKey: S.catalog.key },
    { alias: "Aurora Talentum fountain pen", language: "en", sourceKey: S.catalog.key },
  ],
  sources: [S.catalog, S.category, S.faq, S.converter, S.timeline, S.dedalo, S.svg],
  scopes: [
    {
      key: talentumScope,
      scopeKey: talentumScope,
      validFrom: "2000",
      validTo: RETRIEVED,
      productionState: "unknown",
      nibScope: "Talentum high-end fountain-pen routes listed with 14K (585‰) nibs; exact finish and width remain SKU-scoped.",
      materialScope: "Black resin body; chrome, ruthenium or resin cap/trim routes by catalog code.",
      editionScope: "Series-level identity; D10/D30/D70, Big and finish variants must not share unqualified dimensions or stock status.",
    },
    {
      key: dedaloScope,
      scopeKey: dedaloScope,
      validFrom: RETRIEVED,
      validTo: RETRIEVED,
      productionState: "historical",
      nibScope: "Dedalo Blu D11-CDB 14K rhodium-treated nib.",
      materialScope: "Blue resin body and engraved chrome cap.",
      editionScope: "Limited to 555; this is a distinct Talentum family variant, not the regular black-resin baseline.",
    },
  ],
  claims: [
    {
      key: "phase147-talentum-identity",
      predicate: "model_identity",
      objectText: "Aurora Talentum 是 Aurora 约 2000–2002 设计阶段形成的高端钢笔系列；官方目录同时列普通、钌色帽、Big 与限量版本，因此本页不是单一固定颜色 SKU。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.catalog.key,
      locator: S.catalog.archiveLocator ?? S.catalog.summary,
      evidence: [
        { key: "phase147-talentum-catalog-evidence", sourceKey: S.catalog.key, scopeKey: talentumScope, locator: "Talentum catalog title and D10/D30/D70 code groups" },
        { key: "phase147-talentum-timeline-evidence", sourceKey: S.timeline.key, scopeKey: talentumScope, locator: "2000–2002 design context; Giampiero Maria Bodino" },
      ],
    },
    {
      key: "phase147-talentum-version-boundary",
      predicate: "version_boundary",
      objectText: "镀铬帽、钌色帽与 Big 是官方目录中的不同配置路线；黑铑尖、尺寸和配件不能跨版本回填，roller 与 ballpoint 也不继承钢笔规格。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.catalog.key,
      locator: "catalog finish and Big code groups",
      evidence: [{ key: "phase147-talentum-version-evidence", sourceKey: S.catalog.key, scopeKey: talentumScope, locator: "D10-C/D30-C/D70-C, D10-RN/D30-RN/D70-RN and D11-C/D71-C Big" }],
    },
    {
      key: "phase147-talentum-filling",
      predicate: "filling_and_maintenance_boundary",
      objectText: "Aurora FAQ 将 Talentum 纳入高端活塞与隐藏备用墨仓语境；158-C 官方配件页列 Talentum 兼容，但具体老笔和限量笔仍须核对接口，不能仅凭系列名保证兼容。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.faq.key,
      locator: "FAQ high-end filling and 158-C guidance",
      evidence: [
        { key: "phase147-talentum-faq-evidence", sourceKey: S.faq.key, scopeKey: talentumScope, locator: "high-end 14K, piston/reserve tank, Aurora K/S cartridge and converter instructions" },
        { key: "phase147-talentum-converter-evidence", sourceKey: S.converter.key, scopeKey: talentumScope, locator: "158-C compatibility list includes Talentum" },
      ],
    },
    {
      key: "phase147-talentum-dedalo-boundary",
      predicate: "limited_edition_boundary",
      objectText: "Dedalo Blu（D11-CDB）是 Talentum 家族中的独立限量款：蓝色树脂、雕刻镀铬帽、14K 铑处理尖、555 支；其颜色和编号不能替代普通 Talentum 的上市年份或库存。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.dedalo.key,
      locator: S.dedalo.archiveLocator ?? S.dedalo.summary,
      evidence: [{ key: "phase147-talentum-dedalo-evidence", sourceKey: S.dedalo.key, scopeKey: dedaloScope, locator: "D11-CDB and 555-piece limited specification" }],
    },
    {
      key: "phase147-talentum-current-status",
      predicate: "current_status_boundary",
      objectText: "官方 Talentum 分类入口仍可访问，但检索到的当前商品主要是 Resina roller 与 ballpoint；钢笔具体库存未被当前页面单独确认，因此本页不武断标为现行或停产。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.category.key,
      locator: S.category.archiveLocator ?? S.category.summary,
      evidence: [{ key: "phase147-talentum-status-evidence", sourceKey: S.category.key, scopeKey: talentumScope, locator: "category navigation and current non-fountain results" }],
    },
  ],
  variants: [
    { key: "phase147-talentum-chrome", name: "Talentum D10-C / D30-C / D70-C", notes: "普通镀铬帽路线；具体尺寸、尖宽和市场 SKU 以目录或实物核对。", sourceKey: S.catalog.key, variantKind: "market_sku", productCode: "D10-C/D30-C/D70-C" },
    { key: "phase147-talentum-ruthenium", name: "Talentum D10-RN / D30-RN / D70-RN", notes: "缎面钌色帽与钌色饰件路线；黑铑尖只在对应 SKU 语境下记录。", sourceKey: S.catalog.key, variantKind: "material", productCode: "D10-RN/D30-RN/D70-RN" },
    { key: "phase147-talentum-big", name: "Talentum Big D11-C / D71-C", notes: "官方目录单列 Big；不把 Big 的体量或手感回填到普通 Talentum。", sourceKey: S.catalog.key, variantKind: "edition_group", productCode: "D11-C/D71-C" },
    { key: "phase147-talentum-dedalo", name: "Talentum Dedalo Blu D11-CDB", notes: "蓝色树脂、雕刻镀铬帽、14K 铑处理尖、555 支限量。", sourceKey: S.dedalo.key, variantKind: "edition_group", productCode: "D11-CDB" },
  ],
  spec: {
    brandEntityId: PHASE147_AURORA_BRAND_ID,
    values: {
      series_name: "Aurora Talentum",
      release_year: "2000–2002 design context; exact SKU launch years not asserted",
      origin_country: "Aurora official Italian product line; factory location not inferred",
      nib: "High-end 14K (585‰) gold nib; rhodium or black-rhodium finish by exact SKU",
      fill_system: "Aurora high-end piston with hidden reserve; Aurora K/S cartridge and 158-C converter compatibility must be checked on exact pen",
      material: "Black resin body; chrome, ruthenium or resin cap/trim routes; Dedalo Blu is blue resin",
      status: "Series category remains accessible; fountain-pen SKU availability not separately confirmed at retrieval",
    },
    evidence: [
      evidence("brand_entity_id", "phase147-talentum-brand", S.catalog.key, talentumScope, "Aurora official catalog brand context"),
      evidence("series_name", "phase147-talentum-series", S.catalog.key, talentumScope, "Talentum series title and code groups"),
      evidence("release_year", "phase147-talentum-release", S.timeline.key, talentumScope, "2000–2002 design context only; not exact SKU launch"),
      evidence("origin_country", "phase147-talentum-origin", S.catalog.key, talentumScope, "Aurora official Italian catalog context; no factory inference"),
      evidence("nib", "phase147-talentum-nib", S.faq.key, talentumScope, "high-end 14K (585‰) nib scope"),
      evidence("fill_system", "phase147-talentum-fill", S.faq.key, talentumScope, "high-end piston and hidden reserve; converter boundary"),
      evidence("material", "phase147-talentum-material", S.catalog.key, talentumScope, "chrome/ruthenium/resin cap and black resin body routes"),
      evidence("status", "phase147-talentum-status", S.category.key, talentumScope, "category remains accessible; fountain-pen availability not separately confirmed"),
    ],
  },
  timeline: [
    { key: "phase147-talentum-design", title: "Talentum design context", eventType: "design_milestone", startDate: "2000", circa: true, description: "MuseoTorino places Talentum in a 2000–2002 design phase associated with Giampiero Maria Bodino.", sourceKey: S.timeline.key },
    { key: "phase147-talentum-catalog", title: "Talentum high-end catalog boundary", eventType: "model_released", startDate: "2025", circa: true, description: "Aurora high-end catalog records chrome, ruthenium, Big and 14K nib routes; catalog date is not the launch date.", sourceKey: S.catalog.key },
    { key: "phase147-talentum-dedalo", title: "Dedalo Blu limited variant", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "D11-CDB and 555-piece boundary checked against the official product page.", sourceKey: S.dedalo.key },
  ],
  media: [{
    key: "phase147-talentum-primary",
    title: "Aurora Talentum 版本边界事实图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片；non-photo、non-logo、not-to-scale、non-colour-proof。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
};

export const phase147AuroraTalentumPacks: CuratedEntityPack[] = [auroraBrand, phase147AuroraTalentumPack];
