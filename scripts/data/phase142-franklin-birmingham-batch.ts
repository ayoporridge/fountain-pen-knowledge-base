import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-23";

export const PHASE142_BRANDS = {
  // Reuse the canonical Franklin-Christoph brand published by Phase 73;
  // Phase 142 adds refreshed sourced copy and must not create a duplicate node.
  franklinChristoph: "p73FRCBRAND",
  // Phase 91 already established this canonical brand node.
  birmingham: "phase91-brand-birmingham-pen-company",
} as const;

export const PHASE142_IDS = {
  // Model 20 Marietta already has the canonical Phase 73 identity.
  model20: "p73FRCMODEL20",
  // Phase 91 already established the exact Alumina Model-C identity.
  aluminaModelC: "phase91-pen-birmingham-alumina-model-c",
} as const;

export const PHASE142_SLUGS = {
  franklinChristoph: "franklin-christoph",
  model20: "franklin-christoph-model-20-marietta",
  birmingham: "birmingham-pen-company",
  aluminaModelC: "birmingham-alumina-model-c",
} as const;

function web(input: {
  key: string;
  title: string;
  url: string;
  registry: string;
  name: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  publishedAt?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registry,
    registryName: input.name,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.registry,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    author: input.name,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase142",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase142",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  fcHistory: web({
    key: "phase142-fc-history",
    title: "Franklin-Christoph official history",
    url: "https://www.franklin-christoph.com/pages/history",
    registry: "franklin-christoph-history-phase142",
    name: "Franklin-Christoph",
    summary: "官方历史页说明 Franklin Co. 的 1901 年起源与 2001 年 Franklin-Christoph/IPO Fountain Pen 转型；年份只用于品牌沿革。",
  }),
  fcNibs: web({
    key: "phase142-fc-nib-info",
    title: "Franklin-Christoph FP Nib Info",
    url: "https://www.franklin-christoph.com/pages/fp-nib-details-and-info",
    registry: "franklin-christoph-nibs-phase142",
    name: "Franklin-Christoph",
    summary: "官方笔尖页说明大型型号使用 #6，笔尖、feed、housing 单元可旋下并在同尺寸型号间互换。",
  }),
  fcModel20: web({
    key: "phase142-fc-model20-official",
    title: "Model 20 Marietta official collection",
    url: "https://www.franklin-christoph.com/collections/model-20-marietta",
    registry: "franklin-christoph-model20-official-phase142",
    name: "Franklin-Christoph",
    summary: "官方集合页记录 Model 20 的滑盖、凹入式笔尖、三种上墨路线、#6 笔尖、3.5 ml 近似滴入容量与精确尺寸。",
  }),
  fcReview: web({
    key: "phase142-fc-model20-review",
    title: "Franklin-Christoph Model 20 Marietta review",
    url: "https://www.penaddict.com/blog/2015/7/10/franklin-christoph-model-20-marietta-in-vintage-green-a-review",
    registry: "pen-addict-fc-model20-phase142",
    name: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2015-07-10",
    summary: "独立评测以 Vintage Green 样品补充握持与尺寸语境；样品体验不替代当前官方 SKU 规格。",
  }),
  bpcAbout: web({
    key: "phase142-bpc-about",
    title: "Birmingham Pen Company Our Story",
    url: "https://www.birminghampens.com/pages/about-us",
    registry: "birmingham-pen-company-about-phase142",
    name: "Birmingham Pen Company",
    summary: "官方 Our Story 说明品牌名来自 Pittsburgh Southside 的 Little Birmingham，工作室位于 Pennsylvania，钢笔以小批量供应。",
  }),
  bpcAlumina: web({
    key: "phase142-bpc-alumina",
    title: "Birmingham Pen Company Alumina",
    url: "https://www.birminghampens.com/products/alumina",
    registry: "birmingham-alumina-official-phase142",
    name: "Birmingham Pen Company",
    summary: "官方产品页记录 Alumina Model-C 的 CNC 铝合金结构、German #6、转换器、尺寸重量和不建议 eyedropper 的维护警告。",
  }),
  bpcConverter: web({
    key: "phase142-bpc-converter",
    title: "Birmingham Pen Company Standard Ink Converter",
    url: "https://www.birminghampens.com/products/standard-ink-converter",
    registry: "birmingham-converter-phase142",
    name: "Birmingham Pen Company",
    summary: "官方转换器页提供 Birmingham 钢笔的通用 converter 背景；不覆盖 Alumina 的材料限制。",
  }),
  bpcFpc: web({
    key: "phase142-bpc-alumina-fpc",
    title: "Birmingham Pen Company Model C Alumina Aluminum",
    url: "https://www.fountainpencompanion.com/pen_brands/24-birmingham-pen-company/pen_models/746-ironsides-model-c/pen_variants/6567-birmingham-pen-company-model-c-alumina-aluminum",
    registry: "fountain-pen-companion-bpc-alumina-phase142",
    name: "Fountain Pen Companion",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立钢笔数据库将 Alumina Aluminum 作为 Birmingham Model-C 的材料/版本记录，用于型号身份交叉核对，不替代官方参数。",
  }),
  fcDiagram: diagram("phase142-fc-brand-svg", "Franklin-Christoph brand navigation factual diagram", "/images/library/site-original/phase142/franklin-christoph/brand.svg"),
  fcModelDiagram: diagram("phase142-fc-model20-svg", "Franklin-Christoph Model 20 Marietta factual diagram", "/images/library/site-original/phase142/franklin-christoph/model20-marietta.svg"),
  bpcDiagram: diagram("phase142-bpc-brand-svg", "Birmingham Pen Company brand navigation factual diagram", "/images/library/site-original/phase142/birmingham/brand.svg"),
  bpcModelDiagram: diagram("phase142-bpc-alumina-svg", "Birmingham Alumina Model-C factual diagram", "/images/library/site-original/phase142/birmingham/alumina-model-c.svg"),
} as const;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function makeBrand(input: {
  id: string;
  slug: string;
  name: string;
  file: string;
  aliases: string[];
  primary: CuratedSource;
  secondary: CuratedSource;
  diagram: CuratedSource;
  identity: string;
  navigation: string;
}): CuratedEntityPack {
  const scopeKey = `phase142-${input.slug}-brand-scope`;
  return {
    key: `phase142-${input.slug}-brand-v1`,
    entityId: input.id,
    expectedType: "brand",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.file,
    storyTitle: `${input.name}：品牌身份与代表型号导航`,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: input.primary.key })),
    sources: [input.primary, input.secondary, input.diagram],
    scopes: [{ key: scopeKey, scopeKey, validFrom: RETRIEVED, productionState: "current", editionScope: "Current brand identity and explicitly published representative-model navigation only." }],
    claims: [
      { key: `${input.slug}-identity`, predicate: "brand_identity", objectText: input.identity, factClass: "core", confidence: 0.98, sourceKey: input.primary.key, locator: input.primary.summary, evidence: [{ key: `${input.slug}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: input.primary.summary }] },
      { key: `${input.slug}-navigation`, predicate: "series_navigation", objectText: input.navigation, factClass: "core", confidence: 0.99, sourceKey: input.secondary.key, locator: input.secondary.summary, evidence: [{ key: `${input.slug}-navigation-evidence`, sourceKey: input.secondary.key, scopeKey, locator: input.secondary.summary }] },
    ],
    timeline: [
      { key: `${input.slug}-identity-verified`, title: "品牌身份核实", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: input.identity, sourceKey: input.primary.key },
      { key: `${input.slug}-navigation-verified`, title: "代表型号导航核实", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: input.navigation, sourceKey: input.secondary.key },
    ],
    media: [{ key: `${input.slug}-primary-media`, title: `${input.name} 品牌导航事实图（非产品照片）`, sourceKey: input.diagram.key, localPath: input.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。", sourceUrl: input.diagram.url, usageStatus: "primary" }],
  };
}

function makeModel(input: {
  id: string;
  slug: string;
  name: string;
  file: string;
  brandId: string;
  aliases: string[];
  primary: CuratedSource;
  secondary: CuratedSource;
  extra: CuratedSource[];
  diagram: CuratedSource;
  title: string;
  identity: string;
  boundary: string;
  values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
  variants: Array<{ name: string; notes: string; source: CuratedSource; kind: "color" | "material" | "nib" | "edition_group" }>;
}): CuratedEntityPack {
  const scopeKey = `phase142-${input.slug}-exact-scope`;
  const fields = Object.keys(input.values) as Array<Exclude<SpecFieldKey, "brand_entity_id">>;
  const sources = [...new Map([input.primary, input.secondary, ...input.extra, ...input.variants.map((variant) => variant.source), input.diagram].map((source) => [source.key, source])).values()];
  return {
    key: `phase142-${input.slug}-v1`,
    entityId: input.id,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.file,
    storyTitle: input.title,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: input.primary.key })),
    sources,
    scopes: [{ key: scopeKey, scopeKey, validFrom: RETRIEVED, productionState: "current", nibScope: "Exact model/market scope; named nib samples do not inherit.", materialScope: "Exact material/version scope; sibling materials remain separate.", editionScope: input.boundary }],
    claims: [
      { key: `${input.slug}-identity`, predicate: "model_identity", objectText: input.identity, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: input.primary.summary, evidence: [{ key: `${input.slug}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: input.primary.summary }] },
      { key: `${input.slug}-boundary`, predicate: "version_boundary", objectText: input.boundary, factClass: "core", confidence: 0.98, sourceKey: input.secondary.key, locator: input.secondary.summary, evidence: [{ key: `${input.slug}-boundary-evidence`, sourceKey: input.secondary.key, scopeKey, locator: input.secondary.summary }] },
      { key: `${input.slug}-independent-context`, predicate: "independent_context", objectText: "独立资料只用于交叉核对型号身份或样品语境，不替代当前官方规格。", factClass: "core", confidence: 0.9, sourceKey: input.secondary.key, locator: input.secondary.summary, evidence: [{ key: `${input.slug}-independent-context-evidence`, sourceKey: input.secondary.key, scopeKey, locator: input.secondary.summary }] },
    ],
    variants: input.variants.map((variant, index) => ({ key: `${input.slug}-variant-${index + 1}`, name: variant.name, notes: variant.notes, sourceKey: variant.source.key, variantKind: variant.kind })),
    spec: {
      brandEntityId: input.brandId,
      values: input.values,
      evidence: [
        evidence("brand_entity_id", `${input.slug}-brand`, input.primary.key, scopeKey, "verified maker relationship"),
        ...fields.map((field) => evidence(field, `${input.slug}-${field}`, input.primary.key, scopeKey, `exact-source ${field}`)),
      ],
    },
    timeline: [{ key: `${input.slug}-scope-verified`, title: "型号资料范围核实", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "检索日期记录资料核实，不推断首发年份。", sourceKey: input.primary.key }],
    media: [{ key: `${input.slug}-primary-media`, title: `${input.name} 事实图（非产品照片）`, sourceKey: input.diagram.key, localPath: input.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。", sourceUrl: input.diagram.url, usageStatus: "primary" }],
  };
}

const brands: CuratedEntityPack[] = [
  makeBrand({ id: PHASE142_BRANDS.franklinChristoph, slug: PHASE142_SLUGS.franklinChristoph, name: "Franklin-Christoph", file: ".planning/content-research/franklin-christoph-brand-phase142.md", aliases: ["Franklin-Christoph", "Franklin Christoph", "F-C 钢笔"], primary: S.fcHistory, secondary: S.fcReview, diagram: S.fcDiagram, identity: "Franklin-Christoph 是以美国小批量钢笔、独立笔尖与多种型号/材料 SKU 为核心的品牌；官方历史中的 1901 与 2001 年份只描述品牌沿革。", navigation: "本批公开导航只指向已核实的 Model 20 Marietta；pocket 20、Model 02 和 Model 31 保持独立型号边界。" }),
  makeBrand({ id: PHASE142_BRANDS.birmingham, slug: PHASE142_SLUGS.birmingham, name: "Birmingham Pen Company", file: ".planning/content-research/birmingham-pen-company-brand-phase142.md", aliases: ["Birmingham Pen Company", "Birmingham Pen Co.", "Birmingham 钢笔公司"], primary: S.bpcAbout, secondary: S.bpcFpc, diagram: S.bpcDiagram, identity: "Birmingham Pen Company 是位于 Pennsylvania 的小型墨水与钢笔制造商，品牌名来自 Pittsburgh Southside 的 Little Birmingham 地方历史，不是英国旧钢笔厂的同名延续。", navigation: "本批公开导航只指向 current Alumina Model-C；旧树脂、Ironsides、Raven 与 Model-A 尚未并入当前详情页。" }),
];

const models: CuratedEntityPack[] = [
  makeModel({ id: PHASE142_IDS.model20, slug: PHASE142_SLUGS.model20, name: "Franklin-Christoph Model 20 Marietta", file: ".planning/content-research/franklin-christoph-model20-marietta-phase142.md", brandId: PHASE142_BRANDS.franklinChristoph, aliases: ["Franklin-Christoph Model 20 Marietta", "Franklin-Christoph Model 20", "F-C Model 20", "F-C Marietta", "Model 20 Marietta 钢笔"], primary: S.fcModel20, secondary: S.fcReview, extra: [S.fcNibs, S.fcHistory], diagram: S.fcModelDiagram, title: "Franklin-Christoph Model 20 Marietta：滑盖结构与可换 #6 笔尖", identity: "Model 20 Marietta 是 Franklin-Christoph 的独立全尺寸滑盖型号，带凹入式 #6 笔尖，并提供短国际墨囊、转换器和 eyedropper 三种上墨路线。", boundary: "Marietta 不与 pocket 20 合并；颜色和限量名称是 SKU/variant，Model 02 与 Model 31 的尺寸、帽盖和结构不继承到本页。", values: { series_name: "Franklin-Christoph Model 20 Marietta", release_year: "当前官方集合页；未断言首发年份", origin_country: "United States (Made in USA wording on official page)", nib: "#6 fountain pen nib unit; factory/custom options by exact SKU", fill_system: "short international cartridge, piston converter, or eyedropper; approximately 3.5 ml eyedropper capacity", material: "exact colour/material varies by SKU; current collection includes resin and named finish variants", dimensions: "127 mm nib tip to barrel end; 138.43 mm capped; 150 mm posted; 55.25 mm cap; 14.61 mm cap diameter; 12.95 mm barrel; 10.41 mm smallest grip", weight: "19.28 g with converter inserted and no ink", status: "current collection with colour and limited SKU variants" }, variants: [{ name: "Onyx / Black Cathedral / Copper Rising / Emerald and other named colours", notes: "颜色或限量 SKU；不改变 Model 20 基础身份，库存随集合页变化。", source: S.fcModel20, kind: "color" }, { name: "#6 factory/custom nib options", notes: "笔尖和研磨是具体订单选项；不能把单一研磨样品写成全型号固定规格。", source: S.fcNibs, kind: "nib" }, { name: "pocket 20 sibling", notes: "独立短笔形，导航边界而非 Marietta 变体；本轮不复制其参数。", source: S.fcModel20, kind: "edition_group" }] }),
  makeModel({ id: PHASE142_IDS.aluminaModelC, slug: PHASE142_SLUGS.aluminaModelC, name: "Birmingham Pen Company Alumina Model-C", file: ".planning/content-research/birmingham-pen-company-alumina-model-c-phase142.md", brandId: PHASE142_BRANDS.birmingham, aliases: ["Birmingham Pen Company Alumina", "Birmingham Alumina Model-C", "Birmingham Model-C Alumina", "Alumina Model-C Fountain Pen"], primary: S.bpcAlumina, secondary: S.bpcFpc, extra: [S.bpcAbout, S.bpcConverter], diagram: S.bpcModelDiagram, title: "Birmingham Pen Company Alumina Model-C：CNC 铝合金与转换器上墨", identity: "Alumina Model-C 是 Birmingham Pen Company 当前的铝合金 Model-C 版本，配 German #6 笔尖和国际规格转换器。", boundary: "Alumina 的铝合金、31 g 总重和不建议 eyedropper 的维护限制不继承到旧树脂、Ironsides、Raven 或其他材料的 Model-C。", values: { series_name: "Birmingham Pen Company Model-C / Alumina", release_year: "当前官方产品页；未断言首发年份", origin_country: "Pennsylvania, United States; manufactured in USA from imported materials/components", nib: "German size #6; EF/F/M/B/stub/oblique options by exact batch", fill_system: "included removable international-standard ink converter; eyedropper strongly discouraged", material: "CNC-machined matte-finished aluminum alloy body, grip, cap and finial; steel clip", dimensions: "141.8 mm capped; 154.2 mm posted; 124.4 mm uncapped; 16.8 mm grip length; 10.7-11.6 mm grip diameter", weight: "20 g uncapped; 31 g total", status: "current Alumina batch; availability and nib stock are live SKU conditions" }, variants: [{ name: "EF / F / M / B / 0.6 Stub / 0.8 Stub", notes: "官方当前页面列出的尖号选择；缺货和可用性随批次变化。", source: S.bpcAlumina, kind: "nib" }, { name: "Gold-plated oblique options", notes: "部分页面选项；不把单一 OBB 样品写成所有批次固定配置。", source: S.bpcAlumina, kind: "nib" }, { name: "旧树脂、Ironsides、Raven Model-C", notes: "历史/材料 sibling 边界；不继承 Alumina 的重量或铝材维护警告。", source: S.bpcFpc, kind: "material" }] }),
];

export const phase142Groups: Array<{ brand: CuratedEntityPack; pens: CuratedEntityPack[] }> = [
  { brand: brands[0]!, pens: [models[0]!] },
  { brand: brands[1]!, pens: [models[1]!] },
];

export function loadPhase142Packs(workspaceRoot: string): CuratedEntityPack[] {
  void workspaceRoot;
  return [...brands, ...models];
}
