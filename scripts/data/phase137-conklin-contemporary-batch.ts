import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE136_CONKLIN_BRAND_ID,
  PHASE136_DURAGRAPH_ID,
  PHASE136_GLIDER_ID,
  PHASE136_NOZAC_ID,
} from "./phase136-conklin-duragraph";

export const PHASE137_CONKLIN_BRAND_ID = PHASE136_CONKLIN_BRAND_ID;
export const PHASE137_PROTECTED_PEN_IDS = [
  PHASE136_NOZAC_ID,
  PHASE136_GLIDER_ID,
  PHASE136_DURAGRAPH_ID,
] as const;
export const PHASE137_IDS = {
  allAmerican: "phase137-pen-conklin-all-american",
  markTwain: "phase137-pen-conklin-mark-twain-crescent-filler",
  endura: "phase137-pen-conklin-endura-deco-crest",
  misto: "phase137-pen-conklin-1898-misto",
} as const;
export const PHASE137_SLUGS = {
  allAmerican: "conklin-all-american",
  markTwain: "conklin-mark-twain-crescent-filler",
  endura: "conklin-endura-deco-crest",
  misto: "conklin-1898-misto",
} as const;
export function phase137MadeById(entityId: string) {
  return `phase137-${entityId.replace("phase137-pen-", "")}-made-by-conklin`;
}
export function phase137ReverseId(entityId: string) {
  return `rev-${phase137MadeById(entityId)}`;
}
export const PHASE137_URLS = {
  allAmerican: "https://conklinpens.com/pages/all-american",
  allAmericanSbre: "https://www.sbrebrown.com/2016/12/conklin-all-american-sunburst-orange-fountain-pen-review/",
  allAmericanNook: "https://thepenloversnook.wordpress.com/2019/02/23/conklin-all-american-fountain-pen-review/",
  markTwain: "https://conklinpens.com/pages/mark-twain-crescent-filler",
  markTwainBlack: "https://conklinpens.com/products/conklin-mark-twain-crescent-filler-fountain-pen-black-w-rose-gold-trim-w-jowo-nib",
  markTwainReview: "https://www.gentlemanstationer.com/blog/tag/Mark%2BTwain%2BCrescent%2BFiller",
  endura: "https://conklinpens.com/pages/endura-deco-crest",
  enduraBlue: "https://conklinpens.com/products/conklin-endura-deco-crest-fountain-pen-blue",
  enduraOrange: "https://conklinpens.com/products/conklin-endura-deco-crest-fountain-pen-orange",
  enduraReview: "https://www.penchalet.com/blog/conklin-endura-deco-crest-fountain-pen-review/",
  misto: "https://conklinpens.com/pages/1898",
  mistoReview: "https://extrafinewriting.substack.com/p/review-conklin-1898-fountain-pen",
  history: "https://conklinpens.com/pages/about-us",
} as const;

const RETRIEVED = "2026-07-22";
const officialBase = {
  registryKey: "conklin-official-phase137",
  registryName: "Conklin official",
  sourceType: "official" as const,
  tier: "primary" as const,
  independenceGroup: "conklin-official",
  homepageUrl: "https://conklinpens.com/",
  author: "Conklin",
};

function web(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"> & { locator: string }): CuratedSource {
  const { locator, ...source } = input;
  return { ...source, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: source.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}` };
}

function official(key: string, title: string, url: string, summary: string, locator: string) {
  return web({ ...officialBase, key, title, url, summary, locator });
}

function review(key: string, registryName: string, independenceGroup: string, homepageUrl: string, author: string, publishedAt: string, title: string, url: string, summary: string) {
  return web({ key, registryKey: `${independenceGroup}-phase137`, registryName, sourceType: "blog", tier: "professional_secondary", independenceGroup, homepageUrl, author, publishedAt, title, url, summary, locator: "dated review, sample identity, disclosure, measurements and handling observations; single-sample-only" });
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase137", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase137", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, summary: "Site-original factual SVG separating current family, exact SKU, rejected evidence and dated review scope; not a product photograph.", allowedUse: "store_full", license: "site-original", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900` };
}

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string, qualifies = true) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

interface Definition {
  key: keyof typeof PHASE137_IDS;
  packKey: string;
  name: string;
  storyTitle: string;
  markdownFile: string;
  svg: string;
  official: CuratedSource[];
  reviews: CuratedSource[];
  currentScope: string;
  reviewScope: string;
  aliases: string[];
  variants: string[];
  values: CuratedEntityPack["spec"] extends infer _ ? Record<string, string> : never;
  rejected: Array<{ field: SpecFieldKey; key: string; sourceKey: string; locator: string }>;
  conflict: { key: string; field: string; note: string; members: Array<{ citationKey: string; assertedValue: string }> };
}

function makePack(def: Definition): CuratedEntityPack {
  const image = diagram(`phase137-${def.key}-diagram`, `${def.name} factual boundary`, def.svg);
  const sources = [...def.official, ...def.reviews, image];
  const primary = def.official[0] as CuratedSource;
  const secondary = def.reviews[0] as CuratedSource;
  const specEvidence = Object.keys(def.values).map((field) => evidence(field as SpecFieldKey, `phase137-${def.key}-spec-${field}`, primary.key, def.currentScope, `official current ${field} field with model/SKU qualification`));
  specEvidence.unshift(evidence("brand_entity_id", `phase137-${def.key}-spec-brand`, primary.key, def.currentScope, "official Conklin model identity"));
  specEvidence.push(...def.rejected.map((item) => evidence(item.field, item.key, item.sourceKey, def.currentScope, item.locator, false)));
  return {
    key: def.packKey,
    entityId: PHASE137_IDS[def.key],
    expectedType: "pen",
    expectedSlug: PHASE137_SLUGS[def.key],
    canonicalName: def.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: def.markdownFile,
    storyTitle: def.storyTitle,
    primarySourceKey: primary.key,
    depthTier: "A",
    aliases: def.aliases.map((alias, index) => ({ alias, language: index === def.aliases.length - 1 ? "zh" : "en", sourceKey: primary.key })),
    sources,
    scopes: [
      { key: def.currentScope, scopeKey: def.currentScope, validFrom: RETRIEVED, productionState: "current", nibScope: "Current exact/family JoWo steel options only; availability remains order-specific.", materialScope: "Current family/exact SKU only; no material projection into historical names.", editionScope: "Base modern fountain-pen family; other writing modes, special editions, price and stock excluded." },
      { key: def.reviewScope, scopeKey: def.reviewScope, validFrom: secondary.publishedAt, validTo: secondary.publishedAt, productionState: "historical", nibScope: "One dated review sample; nib feel and flow remain sample/paper/ink specific.", materialScope: "One disclosed review sample only.", editionScope: "Measurements, weight, balance and QC observations do not become current universal specifications." },
    ],
    claims: [
      { key: `phase137-${def.key}-identity`, predicate: "modern_model_identity", objectText: `${def.name} is a distinct modern Conklin fountain-pen family; writing modes, colours and historical names are not cloned or merged.`, factClass: "core", confidence: 0.99, sourceKey: primary.key, locator: "official family title and current writing-mode boundary", evidence: [{ key: `phase137-${def.key}-identity-citation`, sourceKey: primary.key, scopeKey: def.currentScope, locator: "current family identity" }] },
      { key: `phase137-${def.key}-configuration`, predicate: "current_family_configuration", objectText: `Current configuration and variants are limited to the qualified official family/exact-SKU statements represented in this pack.`, factClass: "core", confidence: 0.99, sourceKey: primary.key, locator: "official current specs and colour navigation", evidence: [{ key: `phase137-${def.key}-configuration-citation`, sourceKey: primary.key, scopeKey: def.currentScope, locator: "current specs and variants" }] },
      { key: `phase137-${def.key}-review`, predicate: "dated_professional_sample", objectText: `The professional review describes one dated sample; measurements, handling, nib and QC observations remain sample-specific.`, factClass: "core", confidence: 0.97, sourceKey: secondary.key, locator: "review disclosure and sample observations", evidence: [{ key: `phase137-${def.key}-review-citation`, sourceKey: secondary.key, scopeKey: def.reviewScope, locator: "single dated sample" }] },
    ],
    variants: def.variants.map((name) => ({ key: `phase137-${def.key}-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`, name, notes: "Current official colour/finish label; exact material, nib, price and stock require product-page confirmation.", sourceKey: primary.key, variantKind: "market_sku" })),
    spec: { brandEntityId: PHASE137_CONKLIN_BRAND_ID, values: def.values, evidence: specEvidence },
    conflicts: [{ key: def.conflict.key, fieldKey: def.conflict.field, scopeKey: def.currentScope, conflictKind: "field", status: "resolved", resolutionNote: def.conflict.note, members: def.conflict.members }],
    timeline: [{ key: `phase137-${def.key}-verified`, title: `${def.name} current family verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Current family, SKU, rejected-field and review-sample boundaries verified; retrieval is not a release date.", sourceKey: primary.key }],
    media: [{ key: `phase137-${def.key}-primary`, title: `${def.name} 事实边界图（非产品照片）`, sourceKey: image.key, localPath: def.svg, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创事实示意图；非产品照片、非 logo、非比例、非色准或材质实物证明。", sourceUrl: def.svg, usageStatus: "primary" }],
  };
}

const allAmericanOfficial = official("phase137-all-american-official", "All American Collection", PHASE137_URLS.allAmerican, "Current family page: fountain/ballpoint boundary, 5.5/5/6.75-inch lengths, European resin, JoWo #6 steel and international C/C; the 2-inch diameter is rejected.", "writing modes, colours, specs, nib and filling sections");
const markOfficial = official("phase137-mark-twain-official", "Mark Twain Crescent Filler Collection", PHASE137_URLS.markTwain, "Current modern crescent/sac family and five colours; 7.25×2×2.75-inch fields are packaging-like and rejected.", "writing mode, colours, mechanism and dimension fields");
const enduraOfficial = official("phase137-endura-official", "Endura Deco Crest Collection", PHASE137_URLS.endura, "Current resin/metal-filigree family with JoWo steel and international C/C; packaging-like dimensions are rejected.", "materials, nib, filling, colours and dimension fields");
const mistoOfficial = official("phase137-misto-official", "1898 Misto Resin Collection", PHASE137_URLS.misto, "Current Misto Resin family: 5.5/5/6.75/0.65-inch dimensions, JoWo steel, optional 14kt and international C/C.", "current specs, colours, nib and filling sections");

export const phase137Packs: CuratedEntityPack[] = [
  makePack({ key: "allAmerican", packKey: "phase137-conklin-all-american-v1", name: "Conklin All American", storyTitle: "Conklin All American：大尺寸家族、样笔测量与错误直径分开读", markdownFile: ".planning/content-research/conklin-all-american-phase137.md", svg: "/images/library/site-original/phase137/conklin/conklin-all-american.svg", official: [allAmericanOfficial], reviews: [review("phase137-all-american-sbre", "SBREBrown", "sbrebrown", "https://www.sbrebrown.com/", "Stephen B.R.E. Brown", "2016-12-01", "Conklin All American Sunburst Orange Fountain Pen Review", PHASE137_URLS.allAmericanSbre, "Provided Sunburst Orange sample with sample-only dimensions and weights."), review("phase137-all-american-nook", "Pen Lover's Nook", "pen-lovers-nook", "https://thepenloversnook.wordpress.com/", "Pen Lover's Nook", "2019-02-23", "Conklin All American Fountain Pen Review", PHASE137_URLS.allAmericanNook, "Self-purchased discounted sample with sample-only weight, posting and EF observations.")], currentScope: "phase137-all-american-current", reviewScope: "phase137-all-american-samples", aliases: ["All American", "Conklin All American Fountain Pen", "康克林 All American"], variants: ["Old Glory", "Turquoise Serenity", "Raven Black", "Southwest Turquoise", "Brownstone", "Tortoiseshell", "Yellowstone", "Demo"], values: { series_name: "Conklin All American", origin_country: "modern Conklin/Yafa product; German-made JoWo nib; final assembly country not asserted", nib: "#6 German JoWo stainless steel: EF/F/M/B/1.1 Stub/Omniflex by exact SKU", fill_system: "standard international cartridge/converter; converter included", material: "high-grade European resin; finish-specific", dimensions: "current family: 5.5 in capped, 5 in uncapped, 6.75 in posted; diameter rejected", status: "current modern family verified 2026-07-22" }, rejected: [{ field: "dimensions", key: "phase137-all-american-diameter-rejected", sourceKey: allAmericanOfficial.key, locator: "2 in diameter is physically implausible and conflicts with sample scale" }], conflict: { key: "phase137-all-american-diameter", field: "dimensions", note: "Resolved by rejecting the official 2-inch diameter as an obvious bad field; no replacement universal diameter is inferred from samples.", members: [{ citationKey: "phase137-allAmerican-spec-dimensions", assertedValue: "qualified current length fields" }, { citationKey: "phase137-all-american-diameter-rejected", assertedValue: "Diameter 2 in rejected" }] } }),
  makePack({ key: "markTwain", packKey: "phase137-conklin-mark-twain-v1", name: "Conklin Mark Twain Crescent Filler", storyTitle: "Mark Twain Crescent Filler：现代压囊机构与历史名字分开读", markdownFile: ".planning/content-research/conklin-mark-twain-crescent-filler-phase137.md", svg: "/images/library/site-original/phase137/conklin/conklin-mark-twain-crescent-filler.svg", official: [markOfficial, official("phase137-mark-twain-black", "Mark Twain Crescent Filler Black Rose Gold", PHASE137_URLS.markTwainBlack, "Exact CK71134 Black Chase page with JoWo steel nib menu and crescent filling.", "exact title, SKU, nib selector and filling description")], reviews: [review("phase137-mark-twain-review", "The Gentleman Stationer", "gentleman-stationer", "https://www.gentlemanstationer.com/", "Joe Crace", "2017-03-04", "Pen Review: Conklin Mark Twain Crescent Filler", PHASE137_URLS.markTwainReview, "Loaned red demonstrator stub sample, returned; mechanism and writing observations are sample-specific.")], currentScope: "phase137-mark-twain-current", reviewScope: "phase137-mark-twain-review-2017", aliases: ["Mark Twain Crescent Filler", "Conklin Crescent Filler", "康克林 Mark Twain Crescent Filler"], variants: ["Blue Array", "Purple Fusion", "Orange Medley", "Black Chase", "Demo Rosegold Trim"], values: { series_name: "Conklin Mark Twain Crescent Filler", release_year: "modern revival family; historical Crescent narrative is separate", nib: "current exact SKU: JoWo stainless steel EF/F/M/B/Stub/Omniflex", fill_system: "bottled ink via crescent-compressed internal sac and lock ring", material: "finish/SKU-dependent modern body; universal resin chemistry not asserted", status: "current modern family verified 2026-07-22" }, rejected: [{ field: "dimensions", key: "phase137-mark-twain-package-dimensions-rejected", sourceKey: markOfficial.key, locator: "7.25×2×2.75 in fields are packaging-like and not labelled capped/uncapped/posted" }], conflict: { key: "phase137-mark-twain-dimensions", field: "dimensions", note: "Resolved by rejecting packaging-like Width/Height/Depth fields rather than relabelling them as pen dimensions.", members: [{ citationKey: "phase137-mark-twain-package-dimensions-rejected", assertedValue: "7.25×2×2.75 in rejected" }] } }),
  makePack({ key: "endura", packKey: "phase137-conklin-endura-deco-crest-v1", name: "Conklin Endura Deco Crest", storyTitle: "Endura Deco Crest：树脂、金属外罩与冲突商品页分开读", markdownFile: ".planning/content-research/conklin-endura-deco-crest-phase137.md", svg: "/images/library/site-original/phase137/conklin/conklin-endura-deco-crest.svg", official: [enduraOfficial, official("phase137-endura-blue", "Endura Deco Crest Fountain Pen Blue", PHASE137_URLS.enduraBlue, "Exact CK72201 title says Blue while copied body says Orange/Medium; conflicting copy is rejected.", "exact title, SKU and conflicting description"), official("phase137-endura-orange", "Endura Deco Crest Fountain Pen Orange", PHASE137_URLS.enduraOrange, "Exact CK72181 Orange resin and rose-gold-plated filigree example with JoWo and C/C.", "exact title, SKU, material, nib and filling")], reviews: [review("phase137-endura-review", "Pen Chalet / From Pens With Love", "from-pens-with-love", "https://www.penchalet.com/blog/", "Christine", "2022-06-13", "Conklin Endura Deco Crest Fountain Pen Review", PHASE137_URLS.enduraReview, "Disclosed supplied Black/Silver Fine sample with sample-only weight, dimensions and balance.")], currentScope: "phase137-endura-current", reviewScope: "phase137-endura-review-2022", aliases: ["Endura Deco Crest", "Conklin Endura Deco Crest Fountain Pen", "康克林 Endura Deco Crest"], variants: ["Blue", "Orange", "Black/Silver"], values: { series_name: "Conklin Endura Deco Crest", origin_country: "modern Conklin/Yafa product; JoWo nib made in Germany; final assembly not asserted", nib: "#6 JoWo stainless steel EF/F/M/B/Stub/Flex by exact SKU", fill_system: "standard international cartridge/threaded converter; converter included", material: "European-grade resin with SKU-dependent metal filigree/finish", status: "current modern family verified 2026-07-22" }, rejected: [{ field: "dimensions", key: "phase137-endura-package-dimensions-rejected", sourceKey: enduraOfficial.key, locator: "7.25×2×2.75 in packaging-like fields rejected" }, { field: "material", key: "phase137-endura-blue-copy-rejected", sourceKey: "phase137-endura-blue", locator: "Blue title conflicts with copied Orange/Medium body text" }], conflict: { key: "phase137-endura-blue-copy", field: "material", note: "Resolved by retaining the Blue SKU identity while rejecting copied Orange/Medium description; Orange material is supported only for CK72181.", members: [{ citationKey: "phase137-endura-blue-copy-rejected", assertedValue: "Blue title versus Orange body conflict" }] } }),
  makePack({ key: "misto", packKey: "phase137-conklin-1898-misto-v1", name: "Conklin 1898 Misto", storyTitle: "Conklin 1898 Misto：混色树脂、金尖选项与样笔 QC 分开读", markdownFile: ".planning/content-research/conklin-1898-misto-phase137.md", svg: "/images/library/site-original/phase137/conklin/conklin-1898-misto.svg", official: [mistoOfficial, official("phase137-conklin-history", "About The Brand", PHASE137_URLS.history, "Official historical chronology separates the 1898 founding narrative from the modern Yafa-era revival.", "historical chronology and modern revival")], reviews: [review("phase137-misto-review", "Extra Fine Writing", "extra-fine-writing", "https://extrafinewriting.substack.com/", "Ricardo", "2025-06-23", "Review: Conklin 1898 Fountain Pen", PHASE137_URLS.mistoReview, "Self-purchased sale sample with size preference, steel nib and sample-specific trim/stamping QC observations.")], currentScope: "phase137-misto-current", reviewScope: "phase137-misto-review-2025", aliases: ["1898 Misto Resin", "Conklin 1898 Fountain Pen", "康克林 1898 Misto"], variants: ["Misto Resin Purple", "Misto Resin Green", "Misto Resin Orange", "Misto Resin Flare"], values: { series_name: "Conklin 1898 Misto Resin", release_year: "named for Conklin's 1898 founding; current modern family verified 2026-07-22", nib: "#6 German JoWo stainless steel EF/F/M/B/Stub/Omniflex; optional 14kt by exact order", fill_system: "standard international cartridge/threaded converter; converter included", material: "Misto resin with piece-to-piece pattern variation", dimensions: "current family: 5.5 in capped, 5 in uncapped, 6.75 in posted, 0.65 in diameter", status: "current modern Misto Resin family; stabilized wood and Spectra Fusion excluded" }, rejected: [{ field: "weight", key: "phase137-misto-weight-rejected", sourceKey: "phase137-misto-review", locator: "single review sample cannot establish family weight" }], conflict: { key: "phase137-misto-family-boundary", field: "material", note: "Resolved by limiting this entity to Misto Resin; Stabilized Wood and Spectra Fusion remain separate edition/material families.", members: [{ citationKey: "phase137-misto-spec-material", assertedValue: "Misto resin base family" }] } }),
];

export function loadPhase137ConklinPacks(workspaceRoot: string): LoadedCuratedEntityPack[] {
  return phase137Packs.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
}
