import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE83_ALLURE_FALLBACK_ID,
  PHASE83_CARENE_ID,
  PHASE83_EXPERT_ID,
  PHASE83_HEMISPHERE_ID,
  PHASE83_WATERMAN_BRAND_ID,
} from "./phase83-waterman-current";

export const PHASE131_WATERMAN_ID = PHASE83_WATERMAN_BRAND_ID;
export const PHASE131_CARENE_ID = PHASE83_CARENE_ID;
export const PHASE131_EXPERT_ID = PHASE83_EXPERT_ID;
export const PHASE131_HEMISPHERE_ID = PHASE83_HEMISPHERE_ID;
export const PHASE131_ALLURE_ID = PHASE83_ALLURE_FALLBACK_ID;
export const PHASE131_EXCEPTION_ID = "phase131-waterman-exception-sap-2214314";
export const PHASE131_EXCEPTION_SLUG = "waterman-exception";
export const PHASE131_MADE_BY_ID = "phase131-waterman-exception-made-by";
export const PHASE131_REVERSE_ID = `rev-${PHASE131_MADE_BY_ID}`;
export const PHASE131_TARGET_IDS = [PHASE131_EXCEPTION_ID] as const;
export const PHASE131_TARGET_SLUGS = [PHASE131_EXCEPTION_SLUG] as const;
export const PHASE131_MADE_BY_IDS = [PHASE131_MADE_BY_ID] as const;
export const PHASE131_REVERSE_IDS = [PHASE131_REVERSE_ID] as const;

const RETRIEVED = "2026-07-22";
const COLLECTION_URL = "https://www.waterman.com/pens/exception/";
const SKU_URL =
  "https://www.waterman.com/pens/exception/exception-fountain-pen/SAP_2214314.html";
const CARE_URL =
  "https://www.waterman.com/support?cfid=fountain-pen-ink-filling-instructions";
const REVIEW_URL =
  "https://scrively.org/video-review-waterman-exception-lessence-du-bleu/";
const ARCHIVE_URL =
  "https://www.fountainpennetwork.com/forum/topic/60044-waterman-exception/";
const SVG =
  "/images/library/site-original/phase131/waterman/waterman-exception.svg";

function web(
  input: Omit<
    CuratedSource,
    "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
  > & { locator: string },
): CuratedSource {
  const { locator, ...source } = input;
  return {
    ...source,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: source.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}`,
  };
}

const official = {
  registryKey: "waterman-official-phase131",
  registryName: "Waterman",
  sourceType: "official" as const,
  tier: "primary" as const,
  independenceGroup: "waterman-official",
  homepageUrl: "https://www.waterman.com/",
  author: "Waterman",
};

const collection = web({
  ...official,
  key: "phase131-waterman-exception-collection",
  title: "Waterman Exception Collection",
  url: COLLECTION_URL,
  summary:
    "Waterman maintains Exception as its own collection; the collection boundary is separate from Carène, Expert, Hémisphère and Allure and includes non-fountain-pen writing tools that must not be merged into this pen page.",
  locator:
    "Exception collection title and fountain-pen category; separate collection identity",
});

const sku = web({
  ...official,
  key: "phase131-waterman-exception-sap-2214314",
  title: "Exception Fountain Pen Blue CT, SAP 2214314",
  url: SKU_URL,
  summary:
    "Official exact product entry identifies SAP_2214314 as Exception Fountain Pen Blue CT and describes the square-profile blue lacquer design with a rhodium-plated 18K gold nib; fields remain exact-SKU scoped.",
  locator:
    "product title and SAP_2214314; Blue CT; square profile; rhodium-plated 18K gold nib",
});

const care = web({
  ...official,
  key: "phase131-waterman-filling-care",
  title: "Waterman fountain pen filling instructions",
  url: CARE_URL,
  summary:
    "Waterman gives cartridge and converter filling steps and cold-water cleaning guidance; exact converter inclusion remains a product and market packaging question.",
  locator:
    "cartridge installation; converter filling; cold-water rinse and natural drying",
});

const review = web({
  key: "phase131-scrively-exception-slim-review",
  registryKey: "scrively-phase131",
  registryName: "Scrively",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "scrively",
  homepageUrl: "https://scrively.org/",
  author: "Scrively",
  title: "Video-Review: Waterman Exception ‘L’Essence Du Bleu’",
  url: REVIEW_URL,
  publishedAt: "2024-08-07",
  summary:
    "Professional review explicitly covers one supported Exception Slim L’Essence du Bleu sample, listing lacquered metal, silver-toned trim, cartridge/converter filling, rhodium-plated 18K nib and EF/F/M/B options for that version only.",
  locator:
    "published date; Appelboom support disclosure; Quick Facts naming Exception Slim L’Essence du Bleu; body, trim, filling and nib fields",
});

const historicalSample = web({
  key: "phase131-fpn-exception-night-day-sample",
  registryKey: "fountain-pen-network-phase131",
  registryName: "Fountain Pen Network",
  sourceType: "forum",
  tier: "contemporary_archive",
  independenceGroup: "fountain-pen-network",
  homepageUrl: "https://www.fountainpennetwork.com/",
  author: "Fountain Pen Network contributor",
  title: "Waterman Exception Night/Day platinum trim sample review",
  url: ARCHIVE_URL,
  summary:
    "A historical owner review reports 57.4 g and dimensions for one Night/Day platinum-trim sample; the record is used only to reject a line-wide weight or closure specification.",
  locator:
    "owner identifies Night/Day platinum-trim sample and reports 57.4 g plus sample dimensions",
});

const diagram: CuratedSource = {
  key: "phase131-waterman-exception-svg",
  registryKey: "fountain-pen-graph-editorial-phase131",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase131",
  title: "Waterman Exception identity and version boundary",
  url: SVG,
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  summary:
    "Site-original factual SVG separating SAP 2214314 Blue CT from Slim, L’Essence du Bleu and older sample specifications.",
  allowedUse: "store_full",
  license: "site-original",
  archiveUrl: SVG,
  archiveLocator: `project-public-asset:${SVG};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900`,
};

const currentScope = "phase131-exception-sap-2214314-current";
const slimScope = "phase131-exception-slim-lessence-sample-2024";
const historicalScope = "phase131-exception-night-day-owner-sample";
const careScope = "phase131-exception-waterman-care";

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

export const phase131WatermanExceptionPack: CuratedEntityPack = {
  key: "phase131-waterman-exception-sap-2214314-v1",
  entityId: PHASE131_EXCEPTION_ID,
  expectedType: "pen",
  expectedSlug: PHASE131_EXCEPTION_SLUG,
  canonicalName: "威迪文 Waterman Exception",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/waterman-exception-phase131.md",
  storyTitle: "Waterman Exception：SAP_2214314 与方形旗舰的版本边界",
  primarySourceKey: sku.key,
  depthTier: "A",
  aliases: [
    { alias: "Waterman Exception", language: "en", sourceKey: collection.key },
    { alias: "威迪文 Exception", language: "zh", sourceKey: collection.key },
    { alias: "Exception Fountain Pen Blue CT", language: "en", sourceKey: sku.key },
    { alias: "SAP_2214314", language: "en", sourceKey: sku.key },
  ],
  sources: [collection, sku, care, review, historicalSample, diagram],
  scopes: [
    {
      key: currentScope,
      scopeKey: currentScope,
      validFrom: "2026-07-22",
      productionState: "current",
      nibScope: "SAP_2214314 Blue CT: rhodium-plated 18K gold nib.",
      materialScope:
        "Blue lacquer and square-profile current product context; exact substrate and finish must remain SKU-scoped.",
      editionScope:
        "Current Exception Fountain Pen Blue CT exact product entry; no all-generation dimensions, box contents or nib-width inference.",
    },
    {
      key: slimScope,
      scopeKey: slimScope,
      validFrom: "2024-08-07",
      validTo: "2024-08-07",
      productionState: "historical",
      nibScope:
        "One Exception Slim L’Essence du Bleu review version: rhodium-plated 18K nib, EF/F/M/B listed by the reviewer.",
      materialScope:
        "One reviewed Slim version: lacquered metal body and silver-toned trim.",
      editionScope:
        "Appelboom-supported professional review sample; configuration and observations do not define SAP_2214314 or all Exception production.",
    },
    {
      key: historicalScope,
      scopeKey: historicalScope,
      productionState: "historical",
      materialScope:
        "One owner-reported Night/Day platinum-trim sample with a reported 57.4 g weight.",
      editionScope:
        "Historical community sample used only to demonstrate version variation; no line-wide measurements or closure claims.",
    },
    {
      key: careScope,
      scopeKey: careScope,
      productionState: "current",
      editionScope:
        "Waterman cartridge/converter filling and cold-water care guidance; included accessories remain SKU/market scoped.",
    },
  ],
  claims: [
    {
      key: "phase131-exception-identity",
      predicate: "model_identity",
      objectText:
        "Waterman Exception is a separate square-profile collection; SAP_2214314 is the current Exception Fountain Pen Blue CT anchor, not an alias of Carène, Expert, Hémisphère or Allure.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: sku.key,
      locator: sku.archiveLocator ?? sku.summary,
      evidence: [
        { key: "phase131-exception-identity-collection", sourceKey: collection.key, scopeKey: currentScope, locator: "separate Exception collection" },
        { key: "phase131-exception-identity-sku", sourceKey: sku.key, scopeKey: currentScope, locator: "SAP_2214314 Blue CT exact product" },
      ],
    },
    {
      key: "phase131-exception-current-spec",
      predicate: "exact_sku_specification",
      objectText:
        "SAP_2214314 Blue CT uses the square-profile blue-lacquer design and a rhodium-plated 18K gold nib; measurements, nib widths and packaging are not generalized.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: sku.key,
      locator: sku.archiveLocator ?? sku.summary,
      evidence: [{ key: "phase131-exception-current-spec-evidence", sourceKey: sku.key, scopeKey: currentScope, locator: "Blue CT, square profile and rhodium-plated 18K nib" }],
    },
    {
      key: "phase131-exception-version-boundary",
      predicate: "version_boundary",
      objectText:
        "Exception Slim L’Essence du Bleu is a named reviewed version and does not supply universal material, filling, nib-option or accessory fields for SAP_2214314.",
      factClass: "core",
      confidence: 0.98,
      sourceKey: review.key,
      locator: review.archiveLocator ?? review.summary,
      evidence: [{ key: "phase131-exception-slim-evidence", sourceKey: review.key, scopeKey: slimScope, locator: "review Quick Facts and support disclosure" }],
    },
    {
      key: "phase131-exception-historical-boundary",
      predicate: "historical_sample_boundary",
      objectText:
        "The reported 57.4 g Night/Day platinum-trim pen is one owner sample; its weight, dimensions and closure observations are rejected as family-wide Exception specifications.",
      factClass: "core",
      confidence: 0.95,
      sourceKey: historicalSample.key,
      locator: historicalSample.archiveLocator ?? historicalSample.summary,
      evidence: [{ key: "phase131-exception-night-day-evidence", sourceKey: historicalSample.key, scopeKey: historicalScope, locator: "Night/Day owner sample and 57.4 g report" }],
    },
    {
      key: "phase131-exception-care",
      predicate: "maintenance_boundary",
      objectText:
        "Use Waterman cartridge/converter filling steps and cold-water cleaning; do not infer included converters or apply heat, alcohol, polishing compounds or forced disassembly.",
      factClass: "core",
      confidence: 0.98,
      sourceKey: care.key,
      locator: care.archiveLocator ?? care.summary,
      evidence: [{ key: "phase131-exception-care-evidence", sourceKey: care.key, scopeKey: careScope, locator: "official filling and cleaning instructions" }],
    },
  ],
  variants: [
    {
      key: "phase131-exception-blue-ct",
      name: "Exception Fountain Pen Blue CT",
      notes: "Current exact product anchor; SAP_2214314.",
      sourceKey: sku.key,
      productCode: "SAP_2214314",
      variantKind: "market_sku",
    },
    {
      key: "phase131-exception-slim-lessence",
      name: "Exception Slim L’Essence du Bleu",
      releaseYear: "2022 collection context / 2024 review",
      notes:
        "Separate Slim themed version; review fields and sample experience remain version-scoped.",
      sourceKey: review.key,
      variantKind: "edition_group",
    },
    {
      key: "phase131-exception-night-day",
      name: "Exception Night & Day",
      releaseYear: "historical",
      notes:
        "Historical decoration route; 57.4 g is one platinum-trim owner sample, not a family specification.",
      sourceKey: historicalSample.key,
      variantKind: "edition_group",
    },
  ],
  spec: {
    brandEntityId: PHASE131_WATERMAN_ID,
    values: {
      series_name: "Waterman Exception",
      origin_country:
        "Waterman France product line; exact manufacturing statement must be checked by SKU and packaging",
      nib: "SAP_2214314 Blue CT: rhodium-plated 18K gold nib",
      fill_system:
        "Waterman cartridge/converter; included converter depends on SKU and market packaging",
      material:
        "SAP_2214314 Blue CT: blue lacquer and square-profile product context",
      status:
        "Current Waterman Exception collection; exact SAP inventory varies by market",
    },
    evidence: [
      evidence("brand_entity_id", "phase131-exception-brand", collection.key, currentScope, "Waterman official collection"),
      evidence("series_name", "phase131-exception-series", collection.key, currentScope, "Exception collection title"),
      evidence("origin_country", "phase131-exception-origin", sku.key, currentScope, "Waterman France product context; no factory inference"),
      evidence("nib", "phase131-exception-nib", sku.key, currentScope, "SAP_2214314 rhodium-plated 18K gold nib"),
      evidence("fill_system", "phase131-exception-fill", care.key, careScope, "official cartridge/converter instructions"),
      evidence("material", "phase131-exception-material", sku.key, currentScope, "Blue CT lacquer and square-profile context"),
      evidence("status", "phase131-exception-status", collection.key, currentScope, "current collection listing; exact inventory not inferred"),
    ],
  },
  media: [
    {
      key: "phase131-exception-primary",
      title: "Waterman Exception identity and version boundary（非产品照片）",
      sourceKey: diagram.key,
      localPath: SVG,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "site-original factual SVG；non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof。",
      sourceUrl: SVG,
      usageStatus: "primary",
    },
  ],
};

export function loadPhase131WatermanExceptionPack(
  workspaceRoot: string,
): LoadedCuratedEntityPack {
  const pack = loadCuratedEntityPack(workspaceRoot, phase131WatermanExceptionPack);
  if (Array.from(pack.summary).length < 60 || Array.from(pack.summary).length > 160)
    throw new Error("Phase 131 summary must contain 60-160 Unicode characters.");
  if (Array.from(pack.bodyMd).length < 2_000)
    throw new Error("Phase 131 body_md must contain at least 2,000 Unicode characters.");
  return pack;
}

export function loadPhase131WatermanExceptionPacks(
  workspaceRoot: string,
): LoadedCuratedEntityPack[] {
  return [loadPhase131WatermanExceptionPack(workspaceRoot)];
}
