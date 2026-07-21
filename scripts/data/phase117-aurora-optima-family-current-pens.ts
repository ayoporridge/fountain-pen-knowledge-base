import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE117_AURORA_BRAND_ID = "CJXe8UpnkHLJ";
export const PHASE117_OPTIMA_ID = "5waoVLPHU2Pt";
export const PHASE117_AURORA_88_FAMILY_ID = "s41AURORA88";
export const PHASE117_RESINA_800_ID = "phase114-aurora-ottantotto-resina-800";
export const PHASE117_IPSILON_FAMILY_ID = "phase115-aurora-ipsilon-family";
export const PHASE117_IPSILON_DEMO_ID = "phase115-aurora-ipsilon-demo-colors";
export const PHASE117_IPSILON_RESIN_ID = "phase115-aurora-ipsilon-resin-b11-n";
export const PHASE117_FAMILY_ID = PHASE117_OPTIMA_ID;
export const PHASE117_FAMILY_SLUG = "aurora-optima";
export const PHASE117_FAMILY_NAME = "Aurora Optima（系列导航）";
export const PHASE117_AUROLOIDE_ID = "phase117-aurora-optima-auroloide-996-dor";
export const PHASE117_AUROLOIDE_SLUG = "aurora-optima-auroloide-996-dor";
export const PHASE117_AUROLOIDE_NAME = "Aurora Optima Auroloide 996-DOR";
export const PHASE117_RESINA_ID = "phase117-aurora-optima-resina-997-cn";
export const PHASE117_RESINA_SLUG = "aurora-optima-resina-997-cn";
export const PHASE117_RESINA_NAME = "Aurora Optima Resina 997-CN";

export const PHASE117_AUROLOIDE_OFFICIAL_URL = "https://aurorapen.it/shop/optima-auroloide-stilografica/";
export const PHASE117_RESINA_OFFICIAL_URL = "https://aurorapen.it/shop/optima-resina-stilografica/";
export const PHASE117_OPTIMA_CATEGORY_URL = "https://aurorapen.it/categoria-prodotto/alto-di-gamma/optima/";
export const PHASE117_PENHERO_URL = "https://www.penhero.com/PenGallery/Aurora/AuroraPrimavera.htm";
export const PHASE117_PEN_BOUTIQUE_URL = "https://www.penboutique.com/blogs/blog/optima-art-deco-elegance-from-aurora";
export const PHASE117_PEN_ADDICT_URL = "https://www.penaddict.com/blog/2016/11/30/aurora-optima-blue-auroloide-fountain-pen-review";
export const PHASE117_OPTIMA_366_URL = "https://aurorapen.it/wp-content/uploads/2025/08/Optima-366-2024.pdf";

export const PHASE117_FAMILY_SCOPE = "phase117-aurora-optima-family-current-navigation";
export const PHASE117_AUROLOIDE_CURRENT_SCOPE = "phase117-aurora-optima-auroloide-current-2026-07-21";
export const PHASE117_AUROLOIDE_2016_SCOPE = "phase117-aurora-optima-auroloide-2016-blue-sample";
export const PHASE117_LIMITED_366_SCOPE = "phase117-aurora-optima-366-2024-limited";
export const PHASE117_RESINA_CURRENT_SCOPE = "phase117-aurora-optima-resina-997-cn-current-2026-07-21";
export const PHASE117_RESINA_2024_SCOPE = "phase117-aurora-optima-2024-professional-family";
export const PHASE117_RESINA_2016_SCOPE = "phase117-aurora-optima-2016-auroloide-sibling-sample";

export const PHASE117_FAMILY_SVG = "/images/library/site-original/phase117/aurora/aurora-optima-family.svg";
export const PHASE117_AUROLOIDE_SVG = "/images/library/site-original/phase117/aurora/aurora-optima-auroloide-996-dor.svg";
export const PHASE117_RESINA_SVG = "/images/library/site-original/phase117/aurora/aurora-optima-resina-997-cn.svg";
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

export const PHASE117_SOURCES = {
  category: webSource({ key: "phase117-aurora-optima-category", registryKey: "aurora-official-phase117", registryName: "Aurora official", sourceType: "official", tier: "primary", independenceGroup: "aurora-official", title: "Aurora Optima current category", url: PHASE117_OPTIMA_CATEGORY_URL, homepageUrl: "https://aurorapen.it/", summary: "官方系列页支撑1930年代设计根源、当代再诠释与Auroloide/Resina sibling导航；不支撑跨时代共享规格。", locator: "1930s inspiration; contemporary reinterpretation; Auroloide and Resina sibling navigation" }),
  auroloideExact: webSource({ key: "phase117-aurora-optima-auroloide-996-dor", registryKey: "aurora-official-phase117", registryName: "Aurora official", sourceType: "official", tier: "primary", independenceGroup: "aurora-official", title: "Aurora Optima Auroloide 996-DOR", url: PHASE117_AUROLOIDE_OFFICIAL_URL, homepageUrl: "https://aurorapen.it/", summary: "exact current listing支撑996-DOR、Auroloide、14K white gold、hidden-reserve piston、screw cap、EF/F/M/B；availability仅为检索日快照。", locator: "SKU 996-DOR; Auroloide; 14K white gold nib; hidden-reserve piston; screw cap; EF/F/M/B; current at retrieval" }),
  resinaExact: webSource({ key: "phase117-aurora-optima-resina-997-cn", registryKey: "aurora-official-phase117", registryName: "Aurora official", sourceType: "official", tier: "primary", independenceGroup: "aurora-official", title: "Aurora Optima Resina 997-CN", url: PHASE117_RESINA_OFFICIAL_URL, homepageUrl: "https://aurorapen.it/", summary: "exact current listing仅支撑997-CN、black resin、chrome trim、piston、EF/F/M/B与检索日availability。", locator: "SKU 997-CN; black resin; chrome trim; piston; EF/F/M/B; current at retrieval" }),
  penHero: webSource({ key: "phase117-penhero-optima-chronology", registryKey: "penhero-phase117", registryName: "PenHero", sourceType: "blog", tier: "professional_secondary", independenceGroup: "penhero-optima-history", title: "PenHero Aurora Optima chronology", url: PHASE117_PENHERO_URL, homepageUrl: "https://www.penhero.com/", summary: "专业档案只支撑约1992 modern line及早期Auroloide/resin chronology；不支撑current exact SKU。", locator: "1992 modern line and early Auroloide/resin chronology", limitation: "historical-family-only;not-current-sku-evidence" }),
  penBoutique: webSource({ key: "phase117-pen-boutique-optima-2024", registryKey: "pen-boutique-phase117", registryName: "Pen Boutique", sourceType: "blog", tier: "professional_secondary", independenceGroup: "pen-boutique-optima-2024", title: "Optima: Art Deco Elegance from Aurora", url: PHASE117_PEN_BOUTIQUE_URL, homepageUrl: "https://www.penboutique.com/", author: "Laura Petix", publishedAt: "2024-10-12", summary: "2024 dated professional family/sample context；127 mm、21.55 g、cleaning与hand feel不qualify current exact SKU。", locator: "dated family/sample discussion including 127 mm, 21.55 g, cleaning and hand feel", limitation: "dated-sample-only;not-exact-current-evidence" }),
  penAddict: webSource({ key: "phase117-pen-addict-blue-auroloide-2016", registryKey: "pen-addict-phase117", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", independenceGroup: "pen-addict-blue-auroloide-2016", title: "Aurora Optima Blue Auroloide Fountain Pen Review", url: PHASE117_PEN_ADDICT_URL, homepageUrl: "https://www.penaddict.com/", author: "The Pen Addict", publishedAt: "2016-11-30", summary: "2016 dated blue Auroloide sample；主观手感、样本尺寸重量及蓝色版本观察不得泛化到全部Auroloide或Resina。", locator: "dated blue Auroloide review sample", limitation: "blue-sample-only;not-current-line-wide-evidence" }),
  limited366: webSource({ key: "phase117-aurora-optima-366-2024", registryKey: "aurora-official-phase117", registryName: "Aurora official", sourceType: "official", tier: "primary", independenceGroup: "aurora-official", title: "Aurora Optima 366 2024", url: PHASE117_OPTIMA_366_URL, homepageUrl: "https://aurorapen.it/", itemType: "document", summary: "官方PDF只支撑996-LW白色大理石Auroloide、编号与明确18K limited边界；不回填regular 996-DOR/997-CN。", locator: "996-LW numbered limited edition and 18K boundary", limitation: "limited-edition-only;not-regular-sku-evidence" }),
} as const;

function diagram(key: string, title: string, url: string, summary: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase117", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase117", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary, archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;finish-proof=false;dimensions=1600x900` };
}

export const PHASE117_FAMILY_DIAGRAM = diagram("phase117-optima-family-svg", "Aurora Optima chronology and sibling navigation", PHASE117_FAMILY_SVG, "本站原创战前／1992 modern／current siblings／366 limited事实图；非产品照片、logo、比例、颜色或饰面证据。");
export const PHASE117_AUROLOIDE_DIAGRAM = diagram("phase117-optima-auroloide-996-dor-svg", "Aurora Optima Auroloide 996-DOR evidence boundary", PHASE117_AUROLOIDE_SVG, "本站原创996-DOR exact current与2016 blue sample边界；色块仅为版式编码。");
export const PHASE117_RESINA_DIAGRAM = diagram("phase117-optima-resina-997-cn-svg", "Aurora Optima Resina 997-CN evidence exclusions", PHASE117_RESINA_SVG, "本站原创997-CN exact current与未获exact支持字段边界。");

export const phase117AuroraOptimaFamilyArticle = {
  entityId: PHASE117_FAMILY_ID,
  expectedSlug: PHASE117_FAMILY_SLUG,
  canonicalName: PHASE117_FAMILY_NAME,
  markdownFile: ".planning/content-research/aurora-optima-family-phase117.md",
  storyTitle: "Aurora Optima：先分清家族，再进入具体型号",
  sourceMarkerPrefix: "curated:phase117:aurora-optima-family:",
  sources: [PHASE117_SOURCES.category, PHASE117_SOURCES.penHero, PHASE117_SOURCES.penBoutique, PHASE117_SOURCES.limited366, PHASE117_FAMILY_DIAGRAM],
  primaryImage: PHASE117_FAMILY_DIAGRAM,
} as const;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string, qualifies = true) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

export const phase117AuroraOptimaAuroloide996DorPack: CuratedEntityPack = {
  key: "phase117-aurora-optima-auroloide-996-dor-v1",
  entityId: PHASE117_AUROLOIDE_ID,
  expectedType: "pen",
  expectedSlug: PHASE117_AUROLOIDE_SLUG,
  canonicalName: PHASE117_AUROLOIDE_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/aurora-optima-auroloide-996-dor-phase117.md",
  storyTitle: "Aurora Optima Auroloide 996-DOR：exact current 与样本边界",
  primarySourceKey: PHASE117_SOURCES.auroloideExact.key,
  depthTier: "A",
  aliases: [{ alias: "Optima Auroloide 996-DOR", language: "en", sourceKey: PHASE117_SOURCES.auroloideExact.key }],
  sources: [PHASE117_SOURCES.auroloideExact, PHASE117_SOURCES.category, PHASE117_SOURCES.penAddict, PHASE117_SOURCES.limited366, PHASE117_AUROLOIDE_DIAGRAM],
  scopes: [
    { key: PHASE117_AUROLOIDE_CURRENT_SCOPE, scopeKey: PHASE117_AUROLOIDE_CURRENT_SCOPE, validFrom: RETRIEVED, productionState: "current", nibScope: "Exact 996-DOR: 14K white gold, EF/F/M/B", materialScope: "Exact 996-DOR Auroloide", editionScope: "Hidden-reserve piston and screw cap; availability mutable at 2026-07-21." },
    { key: PHASE117_AUROLOIDE_2016_SCOPE, scopeKey: PHASE117_AUROLOIDE_2016_SCOPE, validFrom: "2016-11-30", validTo: "2016-11-30", productionState: "historical", editionScope: "Blue Auroloide sample only; measurements, weight, colour and subjective experience are not line-wide facts." },
    { key: PHASE117_LIMITED_366_SCOPE, scopeKey: PHASE117_LIMITED_366_SCOPE, validFrom: "2024", validTo: "2024", productionState: "historical", nibScope: "18K belongs only to numbered 996-LW", editionScope: "Optima 366 limited; excluded from regular 996-DOR." },
  ],
  claims: [
    { key: "phase117-auroloide-current", predicate: "current_exact_identity", objectText: "Official exact listing: 996-DOR, Auroloide, 14K white-gold EF/F/M/B, hidden-reserve piston and screw cap at retrieval.", factClass: "core", confidence: 0.99, sourceKey: PHASE117_SOURCES.auroloideExact.key, locator: "exact listing fields", evidence: [{ key: "phase117-auroloide-current-citation", sourceKey: PHASE117_SOURCES.auroloideExact.key, scopeKey: PHASE117_AUROLOIDE_CURRENT_SCOPE, locator: "996-DOR, Auroloide, 14K white gold, hidden-reserve piston, screw cap, EF/F/M/B" }] },
    { key: "phase117-auroloide-sample", predicate: "dated_blue_sample", objectText: "The 2016 Pen Addict item is a blue Auroloide sample; sample measurements, weight, colour and hand feel do not qualify the whole current line.", factClass: "core", confidence: 0.94, sourceKey: PHASE117_SOURCES.penAddict.key, locator: "2016 blue sample only", evidence: [{ key: "phase117-auroloide-sample-citation", sourceKey: PHASE117_SOURCES.penAddict.key, scopeKey: PHASE117_AUROLOIDE_2016_SCOPE, locator: "dated blue-sample observation" }] },
    { key: "phase117-auroloide-limited", predicate: "limited_edition_boundary", objectText: "Optima 366 records numbered 996-LW with 18K; that field is excluded from regular 996-DOR.", factClass: "core", confidence: 0.99, sourceKey: PHASE117_SOURCES.limited366.key, locator: "996-LW numbered 18K limited", evidence: [{ key: "phase117-auroloide-limited-citation", sourceKey: PHASE117_SOURCES.limited366.key, scopeKey: PHASE117_LIMITED_366_SCOPE, locator: "limited-only 18K boundary" }] },
  ],
  variants: [{ key: "phase117-auroloide-996-dor", name: PHASE117_AUROLOIDE_NAME, releaseYear: "current listing verified 2026-07-21", productCode: "996-DOR", notes: "Exact current SKU; availability mutable.", sourceKey: PHASE117_SOURCES.auroloideExact.key, variantKind: "market_sku" }],
  spec: { brandEntityId: PHASE117_AURORA_BRAND_ID, values: { series_name: PHASE117_AUROLOIDE_NAME, release_year: "current listing verified 2026-07-21; launch year not asserted", nib: "14K white gold; EF/F/M/B", fill_system: "hidden-reserve piston", material: "Auroloide", status: "current official listing retrieved 2026-07-21; screw cap; availability mutable" }, evidence: [
    evidence("brand_entity_id", "phase117-auroloide-brand", PHASE117_SOURCES.auroloideExact.key, PHASE117_AUROLOIDE_CURRENT_SCOPE, "official Aurora exact product"),
    evidence("series_name", "phase117-auroloide-series", PHASE117_SOURCES.auroloideExact.key, PHASE117_AUROLOIDE_CURRENT_SCOPE, "exact 996-DOR title"),
    evidence("release_year", "phase117-auroloide-time", PHASE117_SOURCES.auroloideExact.key, PHASE117_AUROLOIDE_CURRENT_SCOPE, "retrieval date only"),
    evidence("nib", "phase117-auroloide-nib", PHASE117_SOURCES.auroloideExact.key, PHASE117_AUROLOIDE_CURRENT_SCOPE, "14K white gold EF/F/M/B"),
    evidence("fill_system", "phase117-auroloide-fill", PHASE117_SOURCES.auroloideExact.key, PHASE117_AUROLOIDE_CURRENT_SCOPE, "hidden-reserve piston"),
    evidence("material", "phase117-auroloide-material", PHASE117_SOURCES.auroloideExact.key, PHASE117_AUROLOIDE_CURRENT_SCOPE, "Auroloide"),
    evidence("status", "phase117-auroloide-status", PHASE117_SOURCES.auroloideExact.key, PHASE117_AUROLOIDE_CURRENT_SCOPE, "current at retrieval and screw cap"),
    evidence("dimensions", "phase117-auroloide-sample-dimensions", PHASE117_SOURCES.penAddict.key, PHASE117_AUROLOIDE_2016_SCOPE, "sample dimensions rejected", false),
    evidence("weight", "phase117-auroloide-sample-weight", PHASE117_SOURCES.penAddict.key, PHASE117_AUROLOIDE_2016_SCOPE, "sample weight and hand feel rejected", false),
    evidence("nib", "phase117-auroloide-limited-18k", PHASE117_SOURCES.limited366.key, PHASE117_LIMITED_366_SCOPE, "18K only 996-LW limited", false),
  ] },
  timeline: [{ key: "phase117-auroloide-2016", title: "Blue Auroloide sample reviewed", eventType: "community_event", startDate: "2016-11-30", circa: false, description: "Dated sample only.", sourceKey: PHASE117_SOURCES.penAddict.key }, { key: "phase117-auroloide-current", title: "Official 996-DOR listing verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Exact current fields verified.", sourceKey: PHASE117_SOURCES.auroloideExact.key }],
  media: [{ key: "phase117-auroloide-primary", title: "996-DOR exact current / sample boundary（非产品照片）", sourceKey: PHASE117_AUROLOIDE_DIAGRAM.key, localPath: PHASE117_AUROLOIDE_SVG, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创事实图；非产品照片、logo、比例、色准或饰面证明。", sourceUrl: PHASE117_AUROLOIDE_SVG, usageStatus: "primary" }],
};

export const phase117AuroraOptimaResina997CnPack: CuratedEntityPack = {
  key: "phase117-aurora-optima-resina-997-cn-v1",
  entityId: PHASE117_RESINA_ID,
  expectedType: "pen",
  expectedSlug: PHASE117_RESINA_SLUG,
  canonicalName: PHASE117_RESINA_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/aurora-optima-resina-997-cn-phase117.md",
  storyTitle: "Aurora Optima Resina 997-CN：只保留 exact current 事实",
  primarySourceKey: PHASE117_SOURCES.resinaExact.key,
  depthTier: "A",
  aliases: [{ alias: "Optima Resina 997-CN", language: "en", sourceKey: PHASE117_SOURCES.resinaExact.key }],
  sources: [PHASE117_SOURCES.resinaExact, PHASE117_SOURCES.category, PHASE117_SOURCES.penBoutique, PHASE117_SOURCES.penAddict, PHASE117_SOURCES.auroloideExact, PHASE117_SOURCES.limited366, PHASE117_RESINA_DIAGRAM],
  scopes: [
    { key: PHASE117_RESINA_CURRENT_SCOPE, scopeKey: PHASE117_RESINA_CURRENT_SCOPE, validFrom: RETRIEVED, productionState: "current", nibScope: "Exact 997-CN: EF/F/M/B only; nib material not asserted", materialScope: "Exact 997-CN black resin with chrome trim", editionScope: "Piston; availability mutable at 2026-07-21." },
    { key: PHASE117_RESINA_2024_SCOPE, scopeKey: PHASE117_RESINA_2024_SCOPE, validFrom: "2024-10-12", validTo: "2024-10-12", productionState: "historical", editionScope: "Professional sample context; 127 mm, 21.55 g, cleaning and hand feel rejected for exact current." },
    { key: PHASE117_RESINA_2016_SCOPE, scopeKey: PHASE117_RESINA_2016_SCOPE, validFrom: "2016-11-30", validTo: "2016-11-30", productionState: "historical", editionScope: "Blue Auroloide sibling sample only; no field qualifies 997-CN." },
    { key: PHASE117_LIMITED_366_SCOPE, scopeKey: PHASE117_LIMITED_366_SCOPE, validFrom: "2024", validTo: "2024", productionState: "historical", editionScope: "996-LW 18K limited; excluded from regular 997-CN." },
  ],
  claims: [
    { key: "phase117-resina-current", predicate: "current_exact_identity", objectText: "Official exact listing: 997-CN, black resin, chrome trim, piston and EF/F/M/B at retrieval.", factClass: "core", confidence: 0.99, sourceKey: PHASE117_SOURCES.resinaExact.key, locator: "exact listing fields", evidence: [{ key: "phase117-resina-current-citation", sourceKey: PHASE117_SOURCES.resinaExact.key, scopeKey: PHASE117_RESINA_CURRENT_SCOPE, locator: "997-CN, black resin, chrome trim, piston, EF/F/M/B" }] },
    { key: "phase117-resina-professional", predicate: "dated_professional_sample_context", objectText: "Laura Petix 2024 article supplies dated sample context only; 127 mm, 21.55 g, cleaning and hand feel do not qualify 997-CN.", factClass: "editorial", confidence: 0.94, sourceKey: PHASE117_SOURCES.penBoutique.key, locator: "2024 dated sample context", evidence: [{ key: "phase117-resina-professional-citation", sourceKey: PHASE117_SOURCES.penBoutique.key, scopeKey: PHASE117_RESINA_2024_SCOPE, locator: "sample-only measurements and observations" }] },
    { key: "phase117-resina-sibling", predicate: "sibling_sample_exclusion", objectText: "Blue Auroloide sample and 996-DOR exact fields do not qualify 997-CN nib material, hidden reserve, screw cap, dimensions, weight or hand feel.", factClass: "core", confidence: 0.99, sourceKey: PHASE117_SOURCES.penAddict.key, locator: "Auroloide sibling only", evidence: [{ key: "phase117-resina-sibling-citation", sourceKey: PHASE117_SOURCES.penAddict.key, scopeKey: PHASE117_RESINA_2016_SCOPE, locator: "blue Auroloide excluded from Resina" }] },
  ],
  variants: [{ key: "phase117-resina-997-cn", name: PHASE117_RESINA_NAME, releaseYear: "current listing verified 2026-07-21", productCode: "997-CN", notes: "Exact black-resin/chrome current SKU; availability mutable.", sourceKey: PHASE117_SOURCES.resinaExact.key, variantKind: "market_sku" }],
  spec: { brandEntityId: PHASE117_AURORA_BRAND_ID, values: { series_name: PHASE117_RESINA_NAME, release_year: "current listing verified 2026-07-21; launch year not asserted", nib: "EF/F/M/B; nib material not asserted", fill_system: "piston", material: "black resin with chrome trim", status: "current official listing retrieved 2026-07-21; availability mutable" }, evidence: [
    evidence("brand_entity_id", "phase117-resina-brand", PHASE117_SOURCES.resinaExact.key, PHASE117_RESINA_CURRENT_SCOPE, "official Aurora exact product"),
    evidence("series_name", "phase117-resina-series", PHASE117_SOURCES.resinaExact.key, PHASE117_RESINA_CURRENT_SCOPE, "exact 997-CN title"),
    evidence("release_year", "phase117-resina-time", PHASE117_SOURCES.resinaExact.key, PHASE117_RESINA_CURRENT_SCOPE, "retrieval date only"),
    evidence("nib", "phase117-resina-widths", PHASE117_SOURCES.resinaExact.key, PHASE117_RESINA_CURRENT_SCOPE, "EF/F/M/B only"),
    evidence("fill_system", "phase117-resina-fill", PHASE117_SOURCES.resinaExact.key, PHASE117_RESINA_CURRENT_SCOPE, "piston only"),
    evidence("material", "phase117-resina-material", PHASE117_SOURCES.resinaExact.key, PHASE117_RESINA_CURRENT_SCOPE, "black resin and chrome trim"),
    evidence("status", "phase117-resina-status", PHASE117_SOURCES.resinaExact.key, PHASE117_RESINA_CURRENT_SCOPE, "current at retrieval"),
    evidence("nib", "phase117-resina-reject-14k", PHASE117_SOURCES.auroloideExact.key, PHASE117_RESINA_2016_SCOPE, "996-DOR 14K rejected", false),
    evidence("fill_system", "phase117-resina-reject-hidden-reserve", PHASE117_SOURCES.auroloideExact.key, PHASE117_RESINA_2016_SCOPE, "996-DOR hidden reserve rejected", false),
    evidence("dimensions", "phase117-resina-reject-dimensions", PHASE117_SOURCES.penBoutique.key, PHASE117_RESINA_2024_SCOPE, "127 mm rejected", false),
    evidence("weight", "phase117-resina-reject-weight", PHASE117_SOURCES.penBoutique.key, PHASE117_RESINA_2024_SCOPE, "21.55 g and hand feel rejected", false),
    evidence("nib", "phase117-resina-reject-18k", PHASE117_SOURCES.limited366.key, PHASE117_LIMITED_366_SCOPE, "996-LW 18K limited rejected", false),
  ] },
  timeline: [{ key: "phase117-resina-2024", title: "Professional Optima sample context published", eventType: "community_event", startDate: "2024-10-12", circa: false, description: "Dated family/sample context only.", sourceKey: PHASE117_SOURCES.penBoutique.key }, { key: "phase117-resina-current", title: "Official 997-CN listing verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Exact current fields verified.", sourceKey: PHASE117_SOURCES.resinaExact.key }],
  media: [{ key: "phase117-resina-primary", title: "997-CN exact current / exclusions（非产品照片）", sourceKey: PHASE117_RESINA_DIAGRAM.key, localPath: PHASE117_RESINA_SVG, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创事实图；非产品照片、logo、比例、颜色或饰面证明。", sourceUrl: PHASE117_RESINA_SVG, usageStatus: "primary" }],
};
function loadChecked(workspaceRoot: string, pack: CuratedEntityPack): LoadedCuratedEntityPack {
  const loaded = loadCuratedEntityPack(workspaceRoot, pack);
  const summaryLength = Array.from(loaded.summary).length;
  if (summaryLength < 60 || summaryLength > 160) throw new Error(`Phase 117 ${pack.entityId} summary must contain 60-160 Unicode characters.`);
  if (Array.from(loaded.bodyMd).length < 2_000) throw new Error(`Phase 117 ${pack.entityId} body_md must contain at least 2,000 Unicode characters.`);
  return loaded;
}

export function loadPhase117AuroraOptimaAuroloide996DorPack(workspaceRoot: string) { return loadChecked(workspaceRoot, phase117AuroraOptimaAuroloide996DorPack); }
export function loadPhase117AuroraOptimaResina997CnPack(workspaceRoot: string) { return loadChecked(workspaceRoot, phase117AuroraOptimaResina997CnPack); }
