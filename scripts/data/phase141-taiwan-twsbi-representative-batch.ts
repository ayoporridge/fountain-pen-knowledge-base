import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";
import { PHASE57_OPUS_BRAND_ID } from "./phase57-opus88-leonardo";

const RETRIEVED = "2026-07-23";
export const PHASE141_TWSBI_BRAND_ID = "YTHuH8c3R9zl";
export const PHASE141_580_RAW_ID = "V9IvGskSYan0";

export const PHASE141_BRANDS = {
  ystudio: "phase141-brand-ystudio",
  laban: "phase141-brand-laban",
  fwi: "phase141-brand-fine-writing-international",
  iwi: "phase141-brand-iwi",
  opus88: PHASE57_OPUS_BRAND_ID,
  twsbi: PHASE141_TWSBI_BRAND_ID,
} as const;

export const PHASE141_IDS = {
  classicRevolve: "phase141-ystudio-classic-revolve",
  laban325: "phase141-laban-325",
  fenestro: "phase141-fwi-fenestro",
  omar: "phase141-opus-88-omar",
  swipe: "phase141-twsbi-swipe",
  iwiLaureate: "phase141-iwi-laureate",
  diamond580: PHASE141_580_RAW_ID,
  diamond580alr: "phase141-twsbi-diamond-580alr",
} as const;

export const PHASE141_SLUGS = {
  classicRevolve: "ystudio-classic-revolve",
  laban325: "laban-325",
  fenestro: "fine-writing-international-fenestro",
  omar: "opus-88-omar",
  swipe: "twsbi-swipe",
  iwiLaureate: "iwi-laureate",
  diamond580: "twsbi-diamond-580",
  diamond580alr: "twsbi-diamond-580alr",
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

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase141",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase141",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  ystudio: web({ key: "phase141-ystudio-brand", title: "YSTUDIO official", url: "https://www.ystudiostyle.com/collections/ystudio-classic-revolve-series", registry: "ystudio-official-phase141", name: "YSTUDIO", summary: "Classic Revolve is the brand's core brass-and-hexagon series; the collection page separates fountain, portable fountain and other writing tools." }),
  ystudioPen: web({ key: "phase141-ystudio-classic", title: "Classic Revolve-Fountain Pen", url: "https://www.ystudiostyle.com/products/classic-revolve-fountain-pen", registry: "ystudio-official-products-phase141", name: "YSTUDIO", summary: "Official product page: brass/copper, 13 x 11 x 138 mm, 46 g, F/M nib choices, international converter and care notes about brass patina and painted finishes." }),
  ystudioCare: web({ key: "phase141-ystudio-care", title: "Classic Revolve converter instruction", url: "https://www.ystudiostyle.com/blogs/guide/classic-revolve-fountain-pen-ink-converter-instruction", registry: "ystudio-guide-phase141", name: "YSTUDIO", summary: "Official guide explains the tight-fit converter, Schmidt nib origin and safe first installation; it is not a universal repair instruction." }),
  ystudioReview: web({ key: "phase141-ystudio-review", title: "Review: YSTUDIO Classic Revolve Fountain Pen", url: "https://archer-rantings.blogspot.com/2021/10/ystudio-classic-fountain-pen-review.html", registry: "archer-ystudio-review-phase141", name: "Rants of The Archer", sourceType: "blog", tier: "professional_secondary", publishedAt: "2021-10-01", summary: "Independent review supplies a separate writing sample and handling context; it does not replace the official dimensions or colour list." }),
  laban: web({ key: "phase141-laban-brand", title: "Laban 325 collection", url: "https://laban.com/collections/325", registry: "laban-official-phase141", name: "Laban Pen", summary: "Current 325 collection lists named colour and material SKUs; inventory and prices are a live retailer snapshot." }),
  labanPen: web({ key: "phase141-laban-325-damask", title: "DAMASK FOUNTAIN PEN / 325", url: "https://laban.com/products/damask-fountain-pen", registry: "laban-product-phase141", name: "Laban Pen", summary: "Official 325 product page shows EF/F/M/B/1.5 Stub and 14K Flex EF/F selections for a named Damask SKU." }),
  labanHistory: web({ key: "phase141-laban-325-history", title: "Pen World | Laban Pen Co.: Stroke By Stroke", url: "https://laban.com/blogs/media-coverage/pen-world-laban-pen-co-stroke-by-stroke", registry: "laban-pen-world-phase141", name: "Pen World / Laban", sourceType: "blog", tier: "professional_secondary", publishedAt: "2024-01-01", summary: "Professional profile scopes Laban's 1991 brand start, 325 flagship window, resin colour construction and cartridge/converter with steel or 14K nib options." }),
  fwi: web({ key: "phase141-fwi-brand", title: "Fine Writing International", url: "https://finewritinginternational.com/", registry: "fwi-official-phase141", name: "Fine Writing International", summary: "Brand identity and Taiwanese maker scope; no unsupported corporate continuity with other Taiwan makers is inferred." }),
  fwiPen: web({ key: "phase141-fwi-fenestro-review", title: "Fine Writing International Fenestro Fountain Pen in Aurora: A Review", url: "https://www.penaddict.com/blog/2021/6/17/fine-writing-international-fenestro-fountain-pen-in-aurora-a-review", registry: "pen-addict-fwi-phase141", name: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", publishedAt: "2021-06-18", summary: "Professional sample records Fenestro's large ink window, #6 JoWo steel nib, 3.6 ml eyedropper claim, 150 mm capped and 14 g filled Aurora sample." }),
  fwiStub: web({ key: "phase141-fwi-fenestro-stub", title: "Fenestro Kuroshio with 1.5 mm stub review", url: "https://www.penaddict.com/blog/2021/7/14/fine-writing-international-fenestro-kuroshio-fountain-pen-with-15mm-stub-nib-review", registry: "pen-addict-fwi-stub-phase141", name: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", publishedAt: "2021-07-14", summary: "Second named colour/sample confirms Fenestro colour and stub boundaries; writing impressions remain sample scoped." }),
  opus: web({ key: "phase141-opus-brand", title: "Opus 88 official/about", url: "https://www.opus88.com/", registry: "opus88-official-phase141", name: "Opus 88", summary: "Existing Opus 88 brand identity and Taiwan manufacturing context are retained; this pack adds Omar navigation only." }),
  omar: web({ key: "phase141-opus-omar", title: "Opus 88 Omar fountain pen", url: "https://www.gouletpens.com/products/opus-88-omar-fountain-pen", registry: "goulet-opus-omar-phase141", name: "The Goulet Pen Company", sourceType: "retailer", tier: "professional_secondary", summary: "Professional retail listing identifies Omar as a large resin Japanese-style eyedropper with #6 nib, shut-off valve and eyedropper filling; exact colour stock is not permanent." }),
  omarReview: web({ key: "phase141-opus-omar-review", title: "Opus 88 Omar review", url: "https://www.gentlemanstationer.com/blog/2021/10/16/workhorse-pens-opus-88-fountain-pens-offer-maximum-versatility", registry: "gentleman-opus-omar-phase141", name: "The Gentleman Stationer", sourceType: "blog", tier: "professional_secondary", publishedAt: "2021-10-16", summary: "Professional family review separates Omar/Jazz #6 route from Koloro #5 and Opera/Bock routes; handling is not a universal measurement." }),
  iwi: web({ key: "phase141-iwi-brand", title: "IWIC official", url: "https://www.iwic.com/", registry: "iwi-official-phase141", name: "IWIC", summary: "IWIC is the maker identity used for Laureate; the brand pack does not infer a founding year from the live page." }),
  iwiPen: web({ key: "phase141-iwi-laureate", title: "Laureate collection", url: "https://www.iwic.com/laureate", registry: "iwi-laureate-official-phase141", name: "IWIC", summary: "Official Laureate page lists a German-made custom EF fountain nib, precious-metal-plated finishes, engraved patterns and an elastic clip; rollerball specifications are not applied to the fountain pen." }),
  iwiGuide: web({ key: "phase141-iwi-laureate-guide", title: "IWIC Laureate product context", url: "https://www.iwic.com/laureate", registry: "iwi-laureate-catalog-phase141", name: "IWIC catalog", sourceType: "retailer", tier: "professional_secondary", summary: "Independent catalog reading bounds the 139.5 mm / 15 mm / 12 mm dimensions to the named Laureate collection page and not to every IWIC pen." }),
  iwiTrade: web({ key: "phase141-iwi-trade", title: "I.W.I.C. member profile", url: "https://www.tasi.org/en/member/profile/1048.htm", registry: "taiwan-stationery-association-phase141", name: "Taiwan Stationery Industries Association", sourceType: "blog", tier: "professional_secondary", summary: "Trade-association profile corroborates I.W.I.C. as a Taiwan writing-instrument maker; it is not used to fill Laureate specifications." }),
  twsbi: web({ key: "phase141-twsbi-brand", title: "TWSBI About Us", url: "https://www.twsbi.com/pages/about-us", registry: "twsbi-official-phase141", name: "TWSBI", summary: "Official About page describes TaShin Precision's OEM history and the San Wen Tong/TWSBI naming context; no exact founding date is asserted." }),
  twsbiReview: web({ key: "phase141-twsbi-review", title: "TWSBI brand overview", url: "https://www.gouletpens.com/blogs/fountain-pen-blog/twsbi-brand-overview", registry: "goulet-twsbi-brand-phase141", name: "The Goulet Pen Company", sourceType: "blog", tier: "professional_secondary", publishedAt: "2023-01-01", summary: "Professional brand overview separates Swipe's cartridge/converter route from TWSBI piston families; it is used for navigation only." }),
  swipe: web({ key: "phase141-twsbi-swipe", title: "TWSBI Swipe Ice Blue Fountain Pen", url: "https://www.twsbi.com/products/twsbi-swipe-ice-blue-fountain-pen", registry: "twsbi-swipe-official-phase141", name: "TWSBI", summary: "Official product page lists EF/F/M/B/Stub 1.1, standard international cartridge/converter, spring converter and regional package difference." }),
  diamond: web({ key: "phase141-twsbi-diamond-580", title: "TWSBI Diamond 580 Clear Fountain Pen", url: "https://www.twsbi.com/products/twsbi-diamond-580-clear-fountain-pen", registry: "twsbi-diamond-official-phase141", name: "TWSBI", summary: "Official Diamond 580 page confirms piston filling, detachable parts and a separate product family from ECO and VAC; colour stock is a live snapshot." }),
  diamondJapan: web({ key: "phase141-twsbi-diamond-japan", title: "TWSBI Diamond family", url: "https://twsbijapan.com/collections/diamond", registry: "twsbi-japan-phase141", name: "TWSBI Japan", summary: "Japan product navigation distinguishes Diamond models and nib choices; it is used for family boundary, not to universalise one market's dimensions." }),
  alr: web({ key: "phase141-twsbi-580alr", title: "TWSBI Diamond 580ALR Prussian Blue", url: "https://www.twsbi.com/products/twsbi-diamond-580alr-prussian-blue-fountain-pen", registry: "twsbi-580alr-official-phase141", name: "TWSBI", summary: "Official 580ALR listing identifies the aluminium grip/connector/piston rod and matte-finish sibling boundary; it is not written back to standard 580." }),
  goulet580: web({ key: "phase141-twsbi-580-review", title: "TWSBI Diamond 580 fountain pen listing", url: "https://www.gouletpens.com/products/twsbi-diamond-580-fountain-pen", registry: "goulet-twsbi-580-phase141", name: "The Goulet Pen Company", sourceType: "retailer", tier: "professional_secondary", summary: "Independent listing cross-checks standard 580 piston/nib and measurements for one retail configuration; it does not define 580ALR metal parts." }),
  cypressTrade: web({ key: "phase141-cypress-trade-record", title: "Taiwan trade-show Crown Mini record", url: "https://www.paipepro.com/", registry: "pai-pen-pro-cypress-phase141", name: "Pai Pen Pro", sourceType: "retailer", tier: "professional_secondary", summary: "Trade/show record names The Connect Modern & Ancient Crown Mini but does not identify Mr. Cypress as maker; publication is rejected." }),
} as const;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string, qualifies = true) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

type ModelKey = keyof typeof PHASE141_IDS;
type ModelDefinition = {
  key: ModelKey;
  name: string;
  brandId: string;
  slug: string;
  markdownFile: string;
  imagePath: string;
  title: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  extra?: CuratedSource[];
  aliases: string[];
  values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
  boundary: string;
  variants: Array<{ name: string; notes: string; source: CuratedSource; kind?: "color" | "market_sku" | "edition_group" }>;
};

function makeModel(def: ModelDefinition): CuratedEntityPack {
  const scopeKey = `phase141-${def.key}-exact-scope`;
  const svg = diagram(`phase141-${def.key}-svg`, `${def.name} factual diagram`, def.imagePath);
  const automaticSecondary = def.key === "classicRevolve" ? [S.ystudioReview] : def.key === "swipe" ? [S.twsbiReview] : def.key === "fenestro" ? [S.fwi] : def.key === "omar" ? [S.opus] : [];
  const automaticClaim = automaticSecondary[0] ? [{ key: `phase141-${def.key}-independent-context`, predicate: "independent_context", objectText: "Independent review context is retained as sample-bounded handling evidence; it does not replace official SKU facts.", factClass: "core" as const, confidence: 0.9, sourceKey: automaticSecondary[0].key, locator: automaticSecondary[0].summary, evidence: [{ key: `phase141-${def.key}-independent-context-evidence`, sourceKey: automaticSecondary[0].key, scopeKey, locator: automaticSecondary[0].summary }] }] : [];
  const sources = [...new Map([def.primary, def.secondary, ...(def.extra ?? []), ...automaticSecondary, ...def.variants.map((variant) => variant.source), svg].map((item) => [item.key, item])).values()];
  const fields = Object.keys(def.values) as Array<Exclude<SpecFieldKey, "brand_entity_id">>;
  return {
    key: `phase141-${def.key}-v1`,
    entityId: PHASE141_IDS[def.key],
    expectedType: "pen",
    expectedSlug: def.slug,
    canonicalName: def.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: def.markdownFile,
    storyTitle: def.title,
    primarySourceKey: def.primary.key,
    depthTier: "A",
    aliases: def.aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: def.primary.key })),
    sources,
    scopes: [{ key: scopeKey, scopeKey, validFrom: RETRIEVED, productionState: def.key === "diamond580" ? "current" : "current", nibScope: "Exact model/market scope; named samples and siblings do not inherit.", materialScope: "Exact model/variant scope; sibling finish and colour claims remain separate.", editionScope: def.boundary }],
    claims: [
      { key: `phase141-${def.key}-identity`, predicate: "model_identity", objectText: `${def.name} is a distinct, source-bounded model identity; similarly named siblings are not merged.`, factClass: "core", confidence: 0.99, sourceKey: def.primary.key, locator: def.primary.summary, evidence: [{ key: `phase141-${def.key}-identity-evidence`, sourceKey: def.primary.key, scopeKey, locator: def.primary.summary }] },
      { key: `phase141-${def.key}-boundary`, predicate: "version_boundary", objectText: def.boundary, factClass: "core", confidence: 0.98, sourceKey: def.secondary.key, locator: def.secondary.summary, evidence: [{ key: `phase141-${def.key}-boundary-evidence`, sourceKey: def.secondary.key, scopeKey, locator: def.secondary.summary }] },
      ...automaticClaim,
    ],
    variants: def.variants.map((variant, index) => ({ key: `phase141-${def.key}-variant-${index + 1}`, name: variant.name, notes: variant.notes, sourceKey: variant.source.key, variantKind: variant.kind ?? "market_sku" })),
    spec: {
      brandEntityId: def.brandId,
      values: def.values,
      evidence: [
        evidence("brand_entity_id", `phase141-${def.key}-brand`, def.primary.key, scopeKey, "maker/model relationship"),
        ...fields.map((field) => evidence(field, `phase141-${def.key}-${field}`, def.primary.key, scopeKey, `exact-source ${field}`)),
      ],
    },
    conflicts: def.key === "diamond580"
      ? [{ key: "phase141-diamond580-mixed-donor-conflict", fieldKey: "identity", scopeKey, conflictKind: "identity", status: "resolved", resolutionNote: "The raw 580/580AL donor is retained by ID but canonicalised to standard Diamond 580; 580ALR is a new sibling with aluminium components.", members: [{ citationKey: `phase141-${def.key}-brand`, assertedValue: "same ID, standard 580 identity" }] }]
      : undefined,
    timeline: [{ key: `phase141-${def.key}-verified`, title: `${def.name} evidence scope verified`, eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Retrieval date records evidence verification, not a launch date.", sourceKey: def.primary.key }],
    media: [{ key: `phase141-${def.key}-primary`, title: `${def.name} 事实图（非产品照片）`, sourceKey: svg.key, localPath: def.imagePath, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof。", sourceUrl: def.imagePath, usageStatus: "primary" }],
  };
}

function makeBrand(input: { key: keyof typeof PHASE141_BRANDS; name: string; slug: string; file: string; imagePath: string; aliases: string[]; primary: CuratedSource; secondary: CuratedSource; extra?: CuratedSource; origin: string; navigation: string }): CuratedEntityPack {
  const scopeKey = `phase141-${input.key}-brand-scope`;
  const svg = diagram(`phase141-${input.key}-brand-svg`, `${input.name} brand navigation`, input.imagePath);
  const extraClaim = input.extra ? [{ key: `phase141-${input.key}-independent-context`, predicate: "independent_context", objectText: "Independent secondary context corroborates the brand navigation without replacing official product identity.", factClass: "core" as const, confidence: 0.9, sourceKey: input.extra.key, locator: input.extra.summary, evidence: [{ key: `phase141-${input.key}-independent-context-evidence`, sourceKey: input.extra.key, scopeKey, locator: input.extra.summary }] }] : [];
  return {
    key: `phase141-${input.key}-brand-v1`,
    entityId: PHASE141_BRANDS[input.key],
    expectedType: "brand",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.file,
    storyTitle: `${input.name}：主体身份与代表型号导航`,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: input.primary.key })),
    sources: [input.primary, input.secondary, ...(input.extra ? [input.extra] : []), svg],
    scopes: [{ key: scopeKey, scopeKey, validFrom: RETRIEVED, productionState: "current", editionScope: "Current brand identity and Phase 141 representative-model navigation only." }],
    claims: [
      { key: `phase141-${input.key}-identity`, predicate: "brand_identity", objectText: input.origin, factClass: "core", confidence: 0.98, sourceKey: input.primary.key, locator: input.primary.summary, evidence: [{ key: `phase141-${input.key}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: input.primary.summary }] },
      { key: `phase141-${input.key}-navigation`, predicate: "series_navigation", objectText: input.navigation, factClass: "core", confidence: 0.99, sourceKey: input.secondary.key, locator: input.secondary.summary, evidence: [{ key: `phase141-${input.key}-navigation-evidence`, sourceKey: input.secondary.key, scopeKey, locator: input.secondary.summary }] },
      ...extraClaim,
    ],
    timeline: [
      { key: `phase141-${input.key}-identity-verified`, title: "Brand identity verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: input.origin, sourceKey: input.primary.key },
      { key: `phase141-${input.key}-navigation-verified`, title: "Representative model navigation verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: input.navigation, sourceKey: input.secondary.key },
    ],
    media: [{ key: `phase141-${input.key}-primary`, title: `${input.name} 品牌导航事实图（非产品照片）`, sourceKey: svg.key, localPath: input.imagePath, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创导航事实图；non-photo、non-logo、not-to-scale、non-colour-proof。", sourceUrl: input.imagePath, usageStatus: "primary" }],
  };
}

const brands: CuratedEntityPack[] = [
  makeBrand({ key: "ystudio", name: "YSTUDIO", slug: "ystudio", file: ".planning/content-research/ystudio-brand-phase141.md", imagePath: "/images/library/site-original/phase141/ystudio/brand.svg", aliases: ["YSTUDIO", "y studio"] , primary: S.ystudio, secondary: S.ystudioCare, extra: S.ystudioReview, origin: "YSTUDIO is represented by its own Taipei design/stationery identity; the collection page is used for current product navigation rather than an invented founding year.", navigation: "Classic Revolve is a core brass-and-hexagon family; Portable Fountain Pen and other writing tools remain separate siblings." }),
  makeBrand({ key: "laban", name: "Laban", slug: "laban", file: ".planning/content-research/laban-brand-phase141.md", imagePath: "/images/library/site-original/phase141/laban/brand.svg", aliases: ["Laban", "Laban Pen Co."], primary: S.laban, secondary: S.labanHistory, origin: "Laban Pen Co. is a Taiwan-rooted writing-instrument brand whose 325 line is documented separately from later collections and gift collaborations.", navigation: "325 is a cartridge/converter family with named colour/material editions; Damask, Ginkgo and Cambridge are variants or siblings, not one universal SKU." }),
  makeBrand({ key: "fwi", name: "Fine Writing International", slug: "fine-writing-international", file: ".planning/content-research/fine-writing-international-brand-phase141.md", imagePath: "/images/library/site-original/phase141/fwi/brand.svg", aliases: ["Fine Writing International", "FWI"], primary: S.fwi, secondary: S.fwiPen, origin: "Fine Writing International is treated as an independent Taiwanese maker identity; no unsupported founding-year or broader corporate claim is inferred.", navigation: "Fenestro's windowed eyedropper/C-C platform is separate from FWI Bronze Age, Planet and later colour or trim editions." }),
  makeBrand({ key: "iwi", name: "IWI", slug: "iwi", file: ".planning/content-research/iwi-brand-phase141.md", imagePath: "/images/library/site-original/phase141/iwi/brand.svg", aliases: ["IWI", "IWIC"], primary: S.iwi, secondary: S.iwiPen, extra: S.iwiTrade, origin: "IWI/IWIC is the maker identity shown by the Laureate collection page; the pack does not invent a separate historical company timeline.", navigation: "Laureate is a named collection with fountain and rollerball siblings; rollerball refills and dimensions are not copied into the fountain-pen spec." }),
  makeBrand({ key: "opus88", name: "Opus 88", slug: "opus88", file: ".planning/content-research/opus88-brand-phase141.md", imagePath: "/images/library/site-original/phase141/opus88/brand.svg", aliases: ["Opus 88", "Opus88"], primary: S.opus, secondary: S.omarReview, origin: "Existing Opus 88 brand ID is reused; current/previous catalogue continuity is not widened beyond the cited Taiwan maker context.", navigation: "Omar joins existing Demonstrator, Koloro and Jazz navigation as a distinct large #6 eyedropper route; no child payload is overwritten by this brand navigation update." }),
  makeBrand({ key: "twsbi", name: "三文堂 (TWSBI)", slug: "twsbi", file: ".planning/content-research/twsbi-brand-phase141.md", imagePath: "/images/library/site-original/phase141/twsbi/brand.svg", aliases: ["TWSBI", "三文堂", "三文堂 TWSBI"], primary: S.twsbi, secondary: S.diamondJapan, extra: S.twsbiReview, origin: "Existing TWSBI brand ID is reused; the official About page's TaShin OEM history is retained without asserting a precise founding year.", navigation: "Swipe, standard Diamond 580 and Diamond 580ALR are siblings; ECO, GO, VAC700R and Mini remain existing separate models." }),
];

const models: CuratedEntityPack[] = [
  makeModel({ key: "classicRevolve", name: "YSTUDIO Classic Revolve", brandId: PHASE141_BRANDS.ystudio, slug: PHASE141_SLUGS.classicRevolve, markdownFile: ".planning/content-research/ystudio-classic-revolve-phase141.md", imagePath: "/images/library/site-original/phase141/ystudio/classic-revolve.svg", title: "YSTUDIO Classic Revolve：黄铜六角杆与可见岁月", primary: S.ystudioPen, secondary: S.ystudioCare, aliases: ["YSTUDIO Classic Revolve", "Classic Revolve Fountain Pen", "研木 Classic Revolve", "YSTUDIO 经典旋转钢笔"], boundary: "Brass, Blue, Green, Red and Black are surface/colour variants of the fountain-pen SKU; Portable Fountain Pen and rollerball remain separate products.", values: { series_name: "Classic Revolve Fountain Pen", release_year: "brand 10-year milestone product; exact launch year not asserted", origin_country: "Taiwan design/product identity", nib: "YSTUDIO own-logo nib; F or M selector on the current page; converter guide identifies Schmidt production", fill_system: "international-standard cartridge or converter; one converter included", material: "solid brass and copper; lacquered colours can reveal brass through wear", dimensions: "official 13 x 11 x 138 mm", weight: "official 46 g", status: "current collection listing" }, variants: [{ name: "Brass", notes: "Unpainted brass patinates; polish restores lustre but oxide is harmless.", source: S.ystudioPen, kind: "color" }, { name: "Blue / Green / Red / Black", notes: "Matte-painted finishes; brassing effect is expected wear and is not a new material SKU.", source: S.ystudioPen, kind: "color" }] }),
  makeModel({ key: "laban325", name: "Laban 325", brandId: PHASE141_BRANDS.laban, slug: PHASE141_SLUGS.laban325, markdownFile: ".planning/content-research/laban-325-phase141.md", imagePath: "/images/library/site-original/phase141/laban/325.svg", title: "Laban 325：树脂色块、标准转换器与新旧笔尖边界", primary: S.labanPen, secondary: S.labanHistory, aliases: ["Laban 325", "Laban 325 Fountain Pen", "Laban TF-325", "Laban 325 钢笔"], boundary: "Named Damask/Ginkgo/Sakura/Forest/Snow and Cambridge offers are colour or material SKUs; 325's 2022 nib-face change and 14K Flex options do not turn every older sample into one current configuration.", values: { series_name: "Laban 325 fountain pen series", release_year: "flagship line documented from 2016/2017 window; exact first sale date varies by source", origin_country: "Taiwan-rooted Laban Pen Co.", nib: "steel EF/F/M/B/1.5 Stub; selected 14K Flex EF/F by exact SKU", fill_system: "international cartridge/converter", material: "resin cap, barrel and section; most colourways contrast ivory ends with a coloured barrel", dimensions: "no universal cross-colour measurement asserted", weight: "no universal cross-colour weight asserted", status: "current collection with historical and colour variants" }, variants: [{ name: "Damask", notes: "Current official product page anchor; nib selector includes steel and 14K Flex choices.", source: S.labanPen, kind: "market_sku" }, { name: "Ginkgo / Sakura / Cambridge and other 325 colours", notes: "Collection navigation only; inventory, trim and regional packaging are not permanent claims.", source: S.laban, kind: "color" }] }),
  makeModel({ key: "fenestro", name: "Fine Writing International Fenestro", brandId: PHASE141_BRANDS.fwi, slug: PHASE141_SLUGS.fenestro, markdownFile: ".planning/content-research/fine-writing-international-fenestro-phase141.md", imagePath: "/images/library/site-original/phase141/fwi/fenestro.svg", title: "FWI Fenestro：可见墨窗与三种上墨路线", primary: S.fwiPen, secondary: S.fwiStub, aliases: ["Fine Writing International Fenestro", "FWI Fenestro", "Fenestro Fountain Pen"], boundary: "Aurora, Kuroshio, Winter's Night and Snow Scene are named colours; the reviewed Aurora/Kuroshio samples do not define every trim or nib width.", values: { series_name: "Fine Writing International Fenestro", release_year: "publicly reviewed from 2020/2021; exact launch date not asserted", origin_country: "Taiwan", nib: "#6 JoWo steel nib; EF/F/M/B/1.5 stub options by source/SKU", fill_system: "standard international cartridge/converter or eyedropper with O-ring; up to about 3.6 ml is a named sample/listing claim", material: "acid/alkali-resistant resin with a large ink window", dimensions: "Aurora sample about 150 mm capped, 135 mm uncapped, 178 mm posted", weight: "Aurora filled sample about 14 g; another review reports 23.5 g all-in, measurement scope differs", status: "current/historical colour run with independent sample evidence" }, variants: [{ name: "Aurora", notes: "Turquoise/brown luminescent resin; Pen Addict sample anchor.", source: S.fwiPen, kind: "color" }, { name: "Kuroshio / Winter's Night / Snow Scene", notes: "Named colours; review observations and stock are colour/sample scoped.", source: S.fwiStub, kind: "color" }] }),
  makeModel({ key: "omar", name: "Opus 88 Omar", brandId: PHASE141_BRANDS.opus88, slug: PHASE141_SLUGS.omar, markdownFile: ".planning/content-research/opus-88-omar-phase141.md", imagePath: "/images/library/site-original/phase141/opus88/omar.svg", title: "Opus 88 Omar：大号树脂与尾端止墨阀", primary: S.omar, secondary: S.omarReview, extra: [S.opus], aliases: ["Opus 88 Omar", "Opus88 Omar", "欧品 Omar"], boundary: "Omar is the large rounded #6 Japanese-style eyedropper route; Jazz, Demonstrator and Koloro are siblings with different shapes, nib routes or capacities.", values: { series_name: "Opus 88 Omar", release_year: "current/long-running model family; exact launch year not asserted", origin_country: "Taiwan Opus 88 product line", nib: "#6 JoWo steel nib by exact unit; nib width is a replaceable SKU choice", fill_system: "Japanese-style eyedropper with tail shut-off valve; no piston or converter claim", material: "resin body and cap; colour/trim by exact market SKU", dimensions: "large full-size body; exact values remain seller/sample scoped", weight: "no universal weight asserted", status: "current and historical colour editions" }, variants: [{ name: "Omar colour editions", notes: "Opaque, demonstrator and seasonal colours are separate market variants; stock is not permanent.", source: S.omar, kind: "color" }, { name: "Omar versus Jazz/Demo/Koloro", notes: "Navigation boundary only; do not transfer measurements, cap shape or nib size.", source: S.omarReview, kind: "edition_group" }] }),
  makeModel({ key: "swipe", name: "三文堂 TWSBI Swipe", brandId: PHASE141_BRANDS.twsbi, slug: PHASE141_SLUGS.swipe, markdownFile: ".planning/content-research/twsbi-swipe-phase141.md", imagePath: "/images/library/site-original/phase141/twsbi/swipe.svg", title: "TWSBI Swipe：弹簧转换器与标准国际口径", primary: S.swipe, secondary: S.twsbi, aliases: ["TWSBI Swipe", "三文堂 Swipe", "TWSBI Swipe Fountain Pen"], boundary: "Swipe is a cartridge/converter platform; its spring converter and included cartridge are not the same mechanism as ECO/Diamond piston fillers or GO's integrated spring piston.", values: { series_name: "TWSBI Swipe", release_year: "current official product line; launch year not asserted", origin_country: "TWSBI product line", nib: "EF/F/M/B/Stub 1.1 stainless-steel options", fill_system: "standard international cartridge, traditional converter or included spring converter", material: "resin body with metal/plastic trim by colour SKU", dimensions: "no universal exact dimension asserted from the live product page", weight: "no universal exact weight asserted", status: "current model with colour and regional package variants" }, variants: [{ name: "Ice Blue and current colour SKUs", notes: "Live official collection snapshot; colours and stock change.", source: S.swipe, kind: "color" }, { name: "North America package / Rest of World package", notes: "Spring converter and extra traditional converter inclusion differs by region; model identity does not.", source: S.swipe, kind: "market_sku" }] }),
  makeModel({ key: "iwiLaureate", name: "IWI Laureate", brandId: PHASE141_BRANDS.iwi, slug: PHASE141_SLUGS.iwiLaureate, markdownFile: ".planning/content-research/iwi-laureate-phase141.md", imagePath: "/images/library/site-original/phase141/iwi/laureate.svg", title: "IWI Laureate：镀贵金属装饰与定制 EF 尖", primary: S.iwiPen, secondary: S.iwiGuide, aliases: ["IWI Laureate", "IWIC Laureate", "Laureate Fountain Pen", "IWI 榮耀系列钢笔"], boundary: "Laureate fountain and rollerball are siblings; rollerball refill and dimensions are not copied to the fountain pen. Three precious-metal plating colours remain finish variants.", values: { series_name: "IWI Laureate fountain pen", release_year: "current collection page; launch date not asserted", origin_country: "Taiwan IWI/IWIC product identity", nib: "German-made custom EF fountain nib", fill_system: "filling system not stated on the cited page; verify converter/cartridge with the seller before purchase", material: "body and cap with precious-metal plating and engraved classic patterns; exact substrate not asserted", dimensions: "139.5 mm x 15 mm x 12 mm value is cited on Laureate collection context; measurement scope retained", weight: "not stated", status: "current Laureate collection; rollerball sibling excluded" }, variants: [{ name: "Three precious-metal plating colours", notes: "Finish variants shown by IWIC; colour availability and plating terminology remain page scoped.", source: S.iwiPen, kind: "color" }, { name: "Laureate fountain / rollerball", notes: "Same collection name, different writing mechanism and refill; do not merge.", source: S.iwiPen, kind: "edition_group" }] }),
  makeModel({ key: "diamond580", name: "三文堂 TWSBI Diamond 580", brandId: PHASE141_BRANDS.twsbi, slug: PHASE141_SLUGS.diamond580, markdownFile: ".planning/content-research/twsbi-diamond-580-phase141.md", imagePath: "/images/library/site-original/phase141/twsbi/diamond-580.svg", title: "TWSBI Diamond 580：把混名原位收束为标准活塞 580", primary: S.diamond, secondary: S.goulet580, extra: [S.twsbi, S.diamondJapan], aliases: ["TWSBI Diamond 580", "Diamond 580", "三文堂 TWSBI 580", "三文堂 Diamond 580"], boundary: "The raw V9 donor is renamed in place to standard Diamond 580. Diamond 580AL/ALR metal-part siblings are separate; their aluminium grip, connector, piston rod and matte finish never define standard 580.", values: { series_name: "TWSBI Diamond 580", release_year: "Diamond 530/540/580 evolution; exact standard-580 launch date not asserted", origin_country: "Taiwan TWSBI product line", nib: "stainless-steel EF/F/M/B/Stub choices by current SKU", fill_system: "integrated piston filler with bottled ink", material: "transparent resin body with standard trim; colour and trim vary by SKU", dimensions: "no universal exact dimension asserted across colours", weight: "no universal exact weight asserted across colours", status: "current standard Diamond 580; 580ALR sibling separate" }, variants: [{ name: "Diamond 580 Clear and colour trims", notes: "Colour/trim variants retain the same standard piston platform; live stock is not a chronology.", source: S.diamond, kind: "color" }, { name: "Diamond 580AL / 580ALR (sibling)", notes: "Aluminium-part siblings are navigation only and are not written back to this standard 580 spec.", source: S.alr, kind: "edition_group" }] }),
  makeModel({ key: "diamond580alr", name: "三文堂 TWSBI Diamond 580ALR", brandId: PHASE141_BRANDS.twsbi, slug: PHASE141_SLUGS.diamond580alr, markdownFile: ".planning/content-research/twsbi-diamond-580alr-phase141.md", imagePath: "/images/library/site-original/phase141/twsbi/diamond-580alr.svg", title: "TWSBI Diamond 580ALR：铝制握位与标准 580 的兄弟边界", primary: S.alr, secondary: S.goulet580, extra: [S.diamond], aliases: ["TWSBI Diamond 580ALR", "Diamond 580 ALR", "三文堂 580ALR"], boundary: "580ALR shares the Diamond piston architecture but is a distinct aluminium-part sibling; standard 580 resin/trim, dimensions, colour and weight are not inherited.", values: { series_name: "TWSBI Diamond 580ALR", release_year: "current ALR product generation; exact launch date not asserted", origin_country: "Taiwan TWSBI product line", nib: "stainless-steel Diamond nib choices by exact SKU", fill_system: "integrated piston filler with bottled ink", material: "resin barrel plus machined aluminium grip/connector/piston rod and matte finish", dimensions: "no universal exact dimension asserted across ALR colours", weight: "metal-part weight varies by finish/colour; no universal value asserted", status: "current Diamond 580ALR sibling" }, variants: [{ name: "Prussian Blue and ALR colour editions", notes: "Official ALR page anchors aluminium-part identity; colour stock is a live SKU snapshot.", source: S.alr, kind: "color" }, { name: "Standard Diamond 580 sibling", notes: "Sibling boundary only; standard 580 remains the in-place V9 canonical entity.", source: S.diamond, kind: "edition_group" }] }),
];

const byId = new Map([...brands, ...models].map((pack) => [pack.entityId, pack]));
const brand = (id: string) => {
  const pack = byId.get(id);
  if (!pack) throw new Error(`Phase 141 brand pack missing: ${id}`);
  return pack;
};
const model = (id: string) => {
  const pack = byId.get(id);
  if (!pack) throw new Error(`Phase 141 model pack missing: ${id}`);
  return pack;
};

export const phase141Groups: Array<{ brand: CuratedEntityPack; pens: CuratedEntityPack[] }> = [
  { brand: brand(PHASE141_BRANDS.ystudio), pens: [model(PHASE141_IDS.classicRevolve)] },
  { brand: brand(PHASE141_BRANDS.laban), pens: [model(PHASE141_IDS.laban325)] },
  { brand: brand(PHASE141_BRANDS.fwi), pens: [model(PHASE141_IDS.fenestro)] },
  { brand: brand(PHASE141_BRANDS.iwi), pens: [model(PHASE141_IDS.iwiLaureate)] },
  { brand: brand(PHASE141_BRANDS.opus88), pens: [model(PHASE141_IDS.omar)] },
  { brand: brand(PHASE141_BRANDS.twsbi), pens: [model(PHASE141_IDS.swipe), model(PHASE141_IDS.diamond580), model(PHASE141_IDS.diamond580alr)] },
];

export const phase141AllPacks = phase141Groups.flatMap((group) => [group.brand, ...group.pens]);

export function loadPhase141Packs(workspaceRoot: string): LoadedCuratedEntityPack[] {
  return phase141AllPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
}

export const CYPRESS_CROWN_MINI_DECISION = {
  status: "rejected",
  candidate: "The Connect Modern & Ancient Crown Mini",
  reason: "Taiwan trade-show and Pai Pen Pro records name the candidate but do not establish Mr. Cypress as maker; no Cypress pack, entity, media or relationship is published.",
  sourceKey: S.cypressTrade.key,
} as const;
