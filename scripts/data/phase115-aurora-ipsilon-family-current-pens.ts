import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE115_AURORA_BRAND_ID = "CJXe8UpnkHLJ";
export const PHASE115_OPTIMA_ID = "5waoVLPHU2Pt";
export const PHASE115_AURORA_88_FAMILY_ID = "s41AURORA88";
export const PHASE115_RESINA_800_ID = "phase114-aurora-ottantotto-resina-800";
export const PHASE115_FAMILY_ID = "phase115-aurora-ipsilon-family";
export const PHASE115_FAMILY_SLUG = "aurora-ipsilon";
export const PHASE115_FAMILY_NAME = "Aurora Ipsilon（系列导航）";
export const PHASE115_DEMO_ID = "phase115-aurora-ipsilon-demo-colors";
export const PHASE115_DEMO_SLUG = "aurora-ipsilon-demo-colors";
export const PHASE115_DEMO_NAME = "Aurora Ipsilon Demo Colors";
export const PHASE115_RESIN_ID = "phase115-aurora-ipsilon-resin-b11-n";
export const PHASE115_RESIN_SLUG = "aurora-ipsilon-resin-b11-n";
export const PHASE115_RESIN_NAME = "Aurora Ipsilon Resin B11-N";

export const PHASE115_DEMO_CATEGORY_URL = "https://aurorapen.it/categoria-prodotto/medio-di-gamma/ipsilon/ipsilon-demo-colors/";
export const PHASE115_DEMO_PDF_URL = "https://aurorapen.it/wp-content/uploads/2025/07/IPSILON-Demo-Colours.pdf";
export const PHASE115_BERTRAM_URL = "https://blog.bertramsinkwell.com/aurora-ipsilon-demo-colors/";
export const PHASE115_RESIN_OFFICIAL_URL = "https://aurorapen.it/shop/ipsilon-resin-stilografica/";
export const PHASE115_IPSILON_CATEGORY_URL = "https://aurorapen.it/categoria-prodotto/medio-di-gamma/ipsilon/";
export const PHASE115_PEN_BOUTIQUE_URL = "https://www.penboutique.com/blogs/blog/a-faithful-companion-with-personality-the-aurora-ipsilon";
export const PHASE115_FPN_SAMPLE_URL = "https://www.fountainpennetwork.com/forum/topic/207396-aurora-ipsilon-resin/";

export const PHASE115_FAMILY_SCOPE = "phase115-aurora-ipsilon-family-current-navigation";
export const PHASE115_DEMO_CURRENT_SCOPE = "phase115-aurora-ipsilon-demo-current-2026-07-21";
export const PHASE115_DEMO_2020_SCOPE = "phase115-aurora-ipsilon-demo-2020-professional";
export const PHASE115_RESIN_CURRENT_SCOPE = "phase115-aurora-ipsilon-resin-b11-n-current-2026-07-21";
export const PHASE115_RESIN_2024_SCOPE = "phase115-aurora-ipsilon-2024-professional-family";
export const PHASE115_RESIN_2011_SCOPE = "phase115-aurora-ipsilon-resin-2011-community-sample";

export const PHASE115_FAMILY_SVG = "/images/library/site-original/phase115/aurora/aurora-ipsilon-family.svg";
export const PHASE115_DEMO_SVG = "/images/library/site-original/phase115/aurora/aurora-ipsilon-demo-colors.svg";
export const PHASE115_RESIN_SVG = "/images/library/site-original/phase115/aurora/aurora-ipsilon-resin-b11-n.svg";
const RETRIEVED = "2026-07-21";

function webSource(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"> & { locator: string; limitation?: string }): CuratedSource {
  const { locator, limitation, ...source } = input;
  return {
    ...source,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: source.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}${limitation ? `;limitation=${limitation}` : ""}`,
  };
}

export const PHASE115_SOURCES = {
  category: webSource({
    key: "phase115-aurora-ipsilon-category", registryKey: "aurora-official-phase115", registryName: "Aurora official", sourceType: "official", tier: "primary", independenceGroup: "aurora-official", title: "Aurora Ipsilon current category", url: PHASE115_IPSILON_CATEGORY_URL, homepageUrl: "https://aurorapen.it/", summary: "官方当前 Ipsilon 导航用于确认 family 与 sibling line 语境，不证明跨 line 共享规格。", locator: "current Ipsilon category and sibling product navigation",
  }),
  demoCategory: webSource({
    key: "phase115-aurora-ipsilon-demo-category", registryKey: "aurora-official-phase115", registryName: "Aurora official", sourceType: "official", tier: "primary", independenceGroup: "aurora-official", title: "Aurora Ipsilon Demo Colors category", url: PHASE115_DEMO_CATEGORY_URL, homepageUrl: "https://aurorapen.it/", summary: "当前分类支撑 Demo Colors 的 glossy coloured resin、clear grip 与六色导航。", locator: "Demo Colors current category; glossy coloured resin; clear grip; six colour navigation",
  }),
  demoPdf: webSource({
    key: "phase115-aurora-ipsilon-demo-pdf", registryKey: "aurora-official-phase115", registryName: "Aurora official", sourceType: "official", tier: "primary", independenceGroup: "aurora-official", title: "IPSILON Demo Colours PDF", url: PHASE115_DEMO_PDF_URL, homepageUrl: "https://aurorapen.it/", itemType: "document", summary: "官方 PDF 将 red/purple/turquoise 与 chrome/stainless steel、green/orange/yellow 与 gold/gold-plated steel 分组。", locator: "six colour matrix and two trim/nib groups; availability current at retrieval",
  }),
  bertram: webSource({
    key: "phase115-bertram-demo-2020", registryKey: "bertrams-inkwell-phase115", registryName: "Bertram's Inkwell", sourceType: "blog", tier: "professional_secondary", independenceGroup: "bertrams-inkwell-demo-2020", title: "Aurora Ipsilon Demo Colors", url: PHASE115_BERTRAM_URL, homepageUrl: "https://blog.bertramsinkwell.com/", author: "Adam L.", publishedAt: "2020-08-06", summary: "2020 dated record：C/C、steel nib、EF/F/M/B/italic、当时 lineup 与 matching ink gift；不证明 2026 current。", locator: "2020 article body: filling, nib widths, then-lineup and matching ink gift",
  }),
  resinExact: webSource({
    key: "phase115-aurora-ipsilon-resin-b11-n", registryKey: "aurora-official-phase115", registryName: "Aurora official", sourceType: "official", tier: "primary", independenceGroup: "aurora-official", title: "Ipsilon Resin - Stilografica", url: PHASE115_RESIN_OFFICIAL_URL, homepageUrl: "https://aurorapen.it/", summary: "exact listing 支撑 B11-N、black resin、cartridge/converter、gold/chrome options；availability 仅为检索日快照。", locator: "SKU B11-N; black resin; cartridge/converter; gold and chrome finish options; current page at retrieval",
  }),
  penBoutique: webSource({
    key: "phase115-pen-boutique-ipsilon-2024", registryKey: "pen-boutique-phase115", registryName: "Pen Boutique", sourceType: "blog", tier: "professional_secondary", independenceGroup: "pen-boutique-ipsilon-2024", title: "A Faithful Companion With Personality: The Aurora Ipsilon", url: PHASE115_PEN_BOUTIQUE_URL, homepageUrl: "https://www.penboutique.com/", author: "Laura Petix", publishedAt: "2024-07-30", summary: "有日期的专业 family/sibling context；不能代替 exact current listing，也不是永久完整 taxonomy。", locator: "2024 article sections discussing Resin, Demo, Quadra and sibling configurations",
  }),
  sample: webSource({
    key: "phase115-fpn-resin-2011-sample", registryKey: "fountain-pen-network-phase115", registryName: "Fountain Pen Network", sourceType: "forum", tier: "community", independenceGroup: "fpn-ipsilon-resin-2011-sample", title: "Aurora Ipsilon Resin sample discussion", url: PHASE115_FPN_SAMPLE_URL, homepageUrl: "https://www.fountainpennetwork.com/", author: "Fountain Pen Network participant", publishedAt: "2011", summary: "2011 community sample observation；任何样本配置、尺寸感或体验均不 qualify exact B11-N current fields。", locator: "2011 attributed forum sample discussion", limitation: "community-sample-only;not-current-product-evidence",
  }),
} as const;

function diagram(key: string, title: string, url: string, summary: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase115", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase115", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary, archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;finish-proof=false;dimensions=1600x900` };
}

export const PHASE115_FAMILY_DIAGRAM = diagram("phase115-ipsilon-family-svg", "Aurora Ipsilon sibling family navigation", PHASE115_FAMILY_SVG, "本站原创 sibling map；非产品照片、logo、比例、颜色或饰面证据。");
export const PHASE115_DEMO_DIAGRAM = diagram("phase115-ipsilon-demo-svg", "Aurora Ipsilon Demo six-colour matrix", PHASE115_DEMO_SVG, "本站原创六色与两组饰件／钢尖矩阵；色块仅为版式编码。");
export const PHASE115_RESIN_DIAGRAM = diagram("phase115-ipsilon-resin-svg", "Aurora Ipsilon Resin B11-N evidence boundary", PHASE115_RESIN_SVG, "本站原创 exact current、professional 与 community evidence boundary。");

export const phase115AuroraIpsilonFamilyArticle = {
  entityId: PHASE115_FAMILY_ID,
  expectedSlug: PHASE115_FAMILY_SLUG,
  canonicalName: PHASE115_FAMILY_NAME,
  markdownFile: ".planning/content-research/aurora-ipsilon-family-phase115.md",
  storyTitle: "Aurora Ipsilon：先分清家族，再进入具体型号",
  sourceMarkerPrefix: "curated:phase115:aurora-ipsilon-family:",
  sources: [PHASE115_SOURCES.category, PHASE115_SOURCES.demoCategory, PHASE115_SOURCES.resinExact, PHASE115_SOURCES.penBoutique, PHASE115_FAMILY_DIAGRAM],
  primaryImage: PHASE115_FAMILY_DIAGRAM,
} as const;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string, qualifies = true) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

export const phase115AuroraIpsilonDemoColorsPack: CuratedEntityPack = {
  key: "phase115-aurora-ipsilon-demo-colors-v1", entityId: PHASE115_DEMO_ID, expectedType: "pen", expectedSlug: PHASE115_DEMO_SLUG, canonicalName: PHASE115_DEMO_NAME, publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/aurora-ipsilon-demo-colors-phase115.md", storyTitle: "Aurora Ipsilon Demo Colors：六色与两组饰件边界", primarySourceKey: PHASE115_SOURCES.demoPdf.key, depthTier: "A",
  aliases: [{ alias: "Ipsilon Demo Colors", language: "en", sourceKey: PHASE115_SOURCES.demoCategory.key }, { alias: "Aurora Ipsilon Demo Colours", language: "en", sourceKey: PHASE115_SOURCES.demoPdf.key }],
  sources: [PHASE115_SOURCES.demoCategory, PHASE115_SOURCES.demoPdf, PHASE115_SOURCES.bertram, PHASE115_SOURCES.category, PHASE115_DEMO_DIAGRAM],
  scopes: [
    { key: PHASE115_DEMO_CURRENT_SCOPE, scopeKey: PHASE115_DEMO_CURRENT_SCOPE, validFrom: RETRIEVED, productionState: "current", nibScope: "red/purple/turquoise: stainless-steel nib; green/orange/yellow: gold-plated steel nib", materialScope: "glossy coloured resin with clear grip section", editionScope: "Six official colours in two fixed trim/nib groups; availability is a 2026-07-21 snapshot." },
    { key: PHASE115_DEMO_2020_SCOPE, scopeKey: PHASE115_DEMO_2020_SCOPE, validFrom: "2020-08-06", validTo: "2020-08-06", productionState: "historical", nibScope: "Dated EF/F/M/B/italic and steel nib record only", editionScope: "Dated C/C, then-lineup and matching-ink gift; excluded from 2026 current qualification." },
  ],
  claims: [
    { key: "phase115-demo-current", predicate: "current_demo_configuration", objectText: "Official current material records glossy coloured resin, clear grip, six colours and two fixed trim/nib groups at the 2026-07-21 retrieval.", factClass: "core", confidence: 0.99, sourceKey: PHASE115_SOURCES.demoPdf.key, locator: "official six-colour/two-group matrix", evidence: [{ key: "phase115-demo-current-citation", sourceKey: PHASE115_SOURCES.demoPdf.key, scopeKey: PHASE115_DEMO_CURRENT_SCOPE, locator: "red/purple/turquoise chrome/stainless; green/orange/yellow gold/gold-plated steel" }] },
    { key: "phase115-demo-dated", predicate: "dated_professional_context", objectText: "Adam L.'s 2020 article records C/C, EF/F/M/B/italic, then-lineup and matching ink gift; none is promoted to 2026 current availability.", factClass: "core", confidence: 0.95, sourceKey: PHASE115_SOURCES.bertram.key, locator: "2020 dated article", evidence: [{ key: "phase115-demo-dated-citation", sourceKey: PHASE115_SOURCES.bertram.key, scopeKey: PHASE115_DEMO_2020_SCOPE, locator: "dated filling, widths, lineup and gift" }] },
  ],
  variants: ["red", "purple", "turquoise", "green", "orange", "yellow"].map((name) => ({ key: `phase115-demo-${name}`, name, releaseYear: "current listing verified 2026-07-21", notes: ["red", "purple", "turquoise"].includes(name) ? "chrome trim; stainless-steel nib" : "gold trim; gold-plated steel nib", sourceKey: PHASE115_SOURCES.demoPdf.key, variantKind: "color" as const })),
  spec: { brandEntityId: PHASE115_AURORA_BRAND_ID, values: { series_name: PHASE115_DEMO_NAME, release_year: "current listing verified 2026-07-21; launch year not asserted", nib: "colour-bound groups: stainless steel or gold-plated steel", material: "glossy coloured resin; clear grip section", status: "current official navigation retrieved 2026-07-21; availability is mutable" }, evidence: [
    evidence("brand_entity_id", "phase115-demo-brand", PHASE115_SOURCES.demoPdf.key, PHASE115_DEMO_CURRENT_SCOPE, "official Aurora product and locked brand"), evidence("series_name", "phase115-demo-series", PHASE115_SOURCES.demoCategory.key, PHASE115_DEMO_CURRENT_SCOPE, "current category title"), evidence("release_year", "phase115-demo-time", PHASE115_SOURCES.demoPdf.key, PHASE115_DEMO_CURRENT_SCOPE, "retrieved date, not launch year"), evidence("nib", "phase115-demo-nib", PHASE115_SOURCES.demoPdf.key, PHASE115_DEMO_CURRENT_SCOPE, "two colour-bound nib groups"), evidence("material", "phase115-demo-material", PHASE115_SOURCES.demoPdf.key, PHASE115_DEMO_CURRENT_SCOPE, "glossy coloured resin and clear grip"), evidence("status", "phase115-demo-status", PHASE115_SOURCES.demoCategory.key, PHASE115_DEMO_CURRENT_SCOPE, "current at retrieval only"), evidence("fill_system", "phase115-demo-dated-fill", PHASE115_SOURCES.bertram.key, PHASE115_DEMO_2020_SCOPE, "2020 C/C does not qualify current", false), evidence("nib", "phase115-demo-dated-widths", PHASE115_SOURCES.bertram.key, PHASE115_DEMO_2020_SCOPE, "2020 widths do not qualify current", false),
  ] },
  timeline: [{ key: "phase115-demo-2020", title: "Bertram records Demo lineup and gift", eventType: "community_event", startDate: "2020-08-06", circa: false, description: "Dated professional context only.", sourceKey: PHASE115_SOURCES.bertram.key }, { key: "phase115-demo-current", title: "Official Demo Colors listing verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Six colours and two groups verified.", sourceKey: PHASE115_SOURCES.demoPdf.key }],
  media: [{ key: "phase115-demo-primary", title: "Demo Colors six-colour/two-trim matrix（非产品照片）", sourceKey: PHASE115_DEMO_DIAGRAM.key, localPath: PHASE115_DEMO_SVG, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创事实图；非产品照片、logo、比例、色准或饰面证明。", sourceUrl: PHASE115_DEMO_SVG, usageStatus: "primary" }],
};

export const phase115AuroraIpsilonResinB11NPack: CuratedEntityPack = {
  key: "phase115-aurora-ipsilon-resin-b11-n-v1", entityId: PHASE115_RESIN_ID, expectedType: "pen", expectedSlug: PHASE115_RESIN_SLUG, canonicalName: PHASE115_RESIN_NAME, publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/aurora-ipsilon-resin-b11-n-phase115.md", storyTitle: "Aurora Ipsilon Resin B11-N：exact current 与样本分开读", primarySourceKey: PHASE115_SOURCES.resinExact.key, depthTier: "A",
  aliases: [{ alias: "Ipsilon Resin B11-N", language: "en", sourceKey: PHASE115_SOURCES.resinExact.key }, { alias: "Aurora B11-N", language: "en", sourceKey: PHASE115_SOURCES.resinExact.key }],
  sources: [PHASE115_SOURCES.resinExact, PHASE115_SOURCES.category, PHASE115_SOURCES.penBoutique, PHASE115_SOURCES.sample, PHASE115_RESIN_DIAGRAM],
  scopes: [
    { key: PHASE115_RESIN_CURRENT_SCOPE, scopeKey: PHASE115_RESIN_CURRENT_SCOPE, validFrom: RETRIEVED, productionState: "current", materialScope: "Exact B11-N black resin with gold/chrome finish options", editionScope: "Exact SKU B11-N, cartridge/converter; availability is mutable at retrieval." },
    { key: PHASE115_RESIN_2024_SCOPE, scopeKey: PHASE115_RESIN_2024_SCOPE, validFrom: "2024-07-30", validTo: "2024-07-30", productionState: "historical", editionScope: "Professional dated family/sibling context; configurations do not qualify exact-current fields." },
    { key: PHASE115_RESIN_2011_SCOPE, scopeKey: PHASE115_RESIN_2011_SCOPE, validFrom: "2011", validTo: "2011", productionState: "historical", editionScope: "Attributed community sample only; sample measurements, finish and experience are rejected for B11-N current specs." },
  ],
  claims: [
    { key: "phase115-resin-current", predicate: "current_exact_identity", objectText: "The official exact listing identifies B11-N as black resin, cartridge/converter, with gold/chrome finish options; availability is dated 2026-07-21.", factClass: "core", confidence: 0.99, sourceKey: PHASE115_SOURCES.resinExact.key, locator: "exact listing fields", evidence: [{ key: "phase115-resin-current-citation", sourceKey: PHASE115_SOURCES.resinExact.key, scopeKey: PHASE115_RESIN_CURRENT_SCOPE, locator: "B11-N, black resin, C/C, gold/chrome and dated availability" }] },
    { key: "phase115-resin-family", predicate: "dated_professional_family_context", objectText: "Laura Petix's 2024 article supplies dated family/sibling context, not exact B11-N current qualification.", factClass: "core", confidence: 0.94, sourceKey: PHASE115_SOURCES.penBoutique.key, locator: "2024 sibling article", evidence: [{ key: "phase115-resin-family-citation", sourceKey: PHASE115_SOURCES.penBoutique.key, scopeKey: PHASE115_RESIN_2024_SCOPE, locator: "family/sibling context only" }] },
    { key: "phase115-resin-sample", predicate: "community_sample_observation", objectText: "The 2011 forum item remains an attributed community sample and does not establish current B11-N specifications.", factClass: "editorial", confidence: 0.85, sourceKey: PHASE115_SOURCES.sample.key, locator: "2011 sample discussion", evidence: [{ key: "phase115-resin-sample-citation", sourceKey: PHASE115_SOURCES.sample.key, scopeKey: PHASE115_RESIN_2011_SCOPE, locator: "sample-only observation" }] },
  ],
  variants: [{ key: "phase115-resin-b11-n", name: "Ipsilon Resin fountain pen B11-N", releaseYear: "current listing verified 2026-07-21", productCode: "B11-N", notes: "Exact black resin, C/C, gold/chrome options; availability mutable.", sourceKey: PHASE115_SOURCES.resinExact.key, variantKind: "market_sku" }],
  spec: { brandEntityId: PHASE115_AURORA_BRAND_ID, values: { series_name: PHASE115_RESIN_NAME, release_year: "current listing verified 2026-07-21; launch year not asserted", fill_system: "cartridge/converter", material: "black resin with gold/chrome finish options", status: "current official listing retrieved 2026-07-21; availability is mutable" }, evidence: [
    evidence("brand_entity_id", "phase115-resin-brand", PHASE115_SOURCES.resinExact.key, PHASE115_RESIN_CURRENT_SCOPE, "official exact listing and locked brand"), evidence("series_name", "phase115-resin-series", PHASE115_SOURCES.resinExact.key, PHASE115_RESIN_CURRENT_SCOPE, "exact title and SKU"), evidence("release_year", "phase115-resin-time", PHASE115_SOURCES.resinExact.key, PHASE115_RESIN_CURRENT_SCOPE, "retrieved date, not launch year"), evidence("fill_system", "phase115-resin-fill", PHASE115_SOURCES.resinExact.key, PHASE115_RESIN_CURRENT_SCOPE, "cartridge/converter"), evidence("material", "phase115-resin-material", PHASE115_SOURCES.resinExact.key, PHASE115_RESIN_CURRENT_SCOPE, "black resin and options"), evidence("status", "phase115-resin-status", PHASE115_SOURCES.resinExact.key, PHASE115_RESIN_CURRENT_SCOPE, "availability at retrieval only"), evidence("dimensions", "phase115-resin-sample-dimensions", PHASE115_SOURCES.sample.key, PHASE115_RESIN_2011_SCOPE, "sample dimensions rejected", false), evidence("weight", "phase115-resin-sample-experience", PHASE115_SOURCES.sample.key, PHASE115_RESIN_2011_SCOPE, "sample experience rejected", false), evidence("nib", "phase115-resin-family-nib", PHASE115_SOURCES.penBoutique.key, PHASE115_RESIN_2024_SCOPE, "family article configuration rejected for exact current", false),
  ] },
  timeline: [{ key: "phase115-resin-2011", title: "Community Resin sample recorded", eventType: "community_event", startDate: "2011", circa: false, description: "Sample-only observation.", sourceKey: PHASE115_SOURCES.sample.key }, { key: "phase115-resin-current", title: "Official B11-N listing verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Exact current fields verified.", sourceKey: PHASE115_SOURCES.resinExact.key }],
  media: [{ key: "phase115-resin-primary", title: "Resin B11-N current/context boundary（非产品照片）", sourceKey: PHASE115_RESIN_DIAGRAM.key, localPath: PHASE115_RESIN_SVG, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创事实图；非产品照片、logo、比例、颜色或饰面证明。", sourceUrl: PHASE115_RESIN_SVG, usageStatus: "primary" }],
};

function loadChecked(workspaceRoot: string, pack: CuratedEntityPack): LoadedCuratedEntityPack {
  const loaded = loadCuratedEntityPack(workspaceRoot, pack);
  const summaryLength = Array.from(loaded.summary).length;
  if (summaryLength < 60 || summaryLength > 160) throw new Error(`Phase 115 ${pack.entityId} summary must contain 60-160 Unicode characters.`);
  if (Array.from(loaded.bodyMd).length < 2_000) throw new Error(`Phase 115 ${pack.entityId} body_md must contain at least 2,000 Unicode characters.`);
  return loaded;
}

export function loadPhase115AuroraIpsilonDemoColorsPack(workspaceRoot: string) { return loadChecked(workspaceRoot, phase115AuroraIpsilonDemoColorsPack); }
export function loadPhase115AuroraIpsilonResinB11NPack(workspaceRoot: string) { return loadChecked(workspaceRoot, phase115AuroraIpsilonResinB11NPack); }
