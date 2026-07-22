import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE121_PLATINUM_BRAND_ID = "e51tJpejEkXY";
export const PHASE121_PLATINUM_3776_ID = "ekPMWnot9inz";
export const PHASE121_CURIDAS_ID = "BoZ4C2WSqk0K";
export const PHASE121_PROCYON_ID = "phase121-platinum-procyon-pns-5000";
export const PHASE121_PROCYON_SLUG = "platinum-procyon-pns-5000";
export const PHASE121_PROCYON_NAME = "Platinum Procyon PNS-5000";

export const PHASE121_CURRENT_URL =
  "https://www.platinum-pen.co.jp/en/brands/detail/?pid=91";
export const PHASE121_INDEX_URL =
  "https://www.platinum-pen.co.jp/en/products/?category__in=&display=result&lang=en";
export const PHASE121_LAUNCH_URL =
  "https://www.platinum-pen.co.jp/en/news/detail/?pid=8812";
export const PHASE121_CATALOG_URL =
  "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/Platinum-pen-general-catalog-2019-2020.pdf";
export const PHASE121_MANUAL_URL =
  "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2025/04/fourtainpen.pdf";
export const PHASE121_REVIEW_2019_URL =
  "https://www.penaddict.com/blog/2019/7/17/platinum-procyon-fountain-pen-review";
export const PHASE121_REVIEW_2021_URL =
  "https://www.penaddict.com/blog/2021/1/13/platinum-procyon-deep-sea-fountain-pen-review";

export const PHASE121_CURRENT_SCOPE =
  "phase121-procyon-pns5000-current-2026-07-22";
export const PHASE121_LAUNCH_SCOPE =
  "phase121-procyon-pns5000-launch-2018";
export const PHASE121_PNS8000_SCOPE =
  "phase121-procyon-pns8000-limited-sibling-2026-07-22";
export const PHASE121_SAMPLE_2019_SCOPE =
  "phase121-procyon-porcelain-white-f-supplied-sample-2019-07-17";
export const PHASE121_SAMPLE_2021_SCOPE =
  "phase121-procyon-deep-sea-m-supplied-sample-2021-01-13";

export const PHASE121_CURRENT_COLOURS = [
  "#1 Shadow Mica",
  "#10 Carmine Red",
  "#3 Porcelain White",
  "#50 Deep Sea",
] as const;
export const PHASE121_LAUNCH_COLOURS = [
  "#3 Porcelain White",
  "#25 Persimmon Orange",
  "#50 Deep Sea",
  "#52 Turquoise Blue",
  "#68 Citron Yellow",
] as const;
export const PHASE121_PNS8000_COLOURS = [
  "#18 Rose Gold",
  "#79 Satin Silver",
] as const;

const RETRIEVED = "2026-07-22";
const SVG_PATH =
  "/images/library/site-original/phase121/platinum/platinum-procyon-pns-5000.svg";

function webSource(
  input: Omit<
    CuratedSource,
    "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
  > & { locator: string; archiveUrl?: string },
): CuratedSource {
  const { locator, archiveUrl, ...source } = input;
  return {
    ...source,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: archiveUrl ?? source.url,
    archiveLocator: [
      "live-source-not-frozen",
      `retrieved=${RETRIEVED}`,
      "external_archive=false",
      `locator=${locator}`,
    ].join(";"),
  };
}

const officialBase = {
  registryKey: "platinum-official-phase121",
  registryName: "Platinum Pen Co., Ltd.",
  sourceType: "official" as const,
  tier: "primary" as const,
  independenceGroup: "platinum-official",
  homepageUrl: "https://www.platinum-pen.co.jp/",
  author: "Platinum Pen Co., Ltd.",
};

const current = webSource({
  ...officialBase,
  key: "phase121-platinum-procyon-current-cards",
  title: "PROCYON current brand page",
  url: PHASE121_CURRENT_URL,
  summary:
    "2026-07-22 current page supports PROCYON/PNS-5000, Slip & Seal, textured aluminium body and four name-deduplicated PNS-5000 cards; PNS-8000 #18/#79 are separately marked Limited Quantity.",
  locator:
    "PNS-5000 cards #1 Shadow Mica, #10 Carmine Red, #3 Porcelain White, #50 Deep Sea; PNS-8000 cards #18 Rose Gold and #79 Satin Silver marked <Limited Quantity>; Slip & Seal and aluminium body sections",
});
const index = webSource({
  ...officialBase,
  key: "phase121-platinum-procyon-product-index",
  title: "Platinum current product index",
  url: PHASE121_INDEX_URL,
  summary:
    "Current official navigation exposes PROCYON; it corroborates navigation presence only and does not supply colours, dimensions, materials or nib choices.",
  locator: "current product-navigation card/link for PROCYON only",
});
const launch = webSource({
  ...officialBase,
  key: "phase121-platinum-procyon-launch-2018",
  title: "New product PROCYON PNS-5000",
  url: PHASE121_LAUNCH_URL,
  publishedAt: "2018-07-30",
  summary:
    "Official launch notice records a 2018-07-20 release, PNS-5000, Slip & Seal, new feeder/Last Drop easier absorption at the nib end, pentagon-shaped steel F/M nib, coated aluminium body, 139.7 × 14.4 mm and 23.3 g.",
  locator:
    "published 2018-07-30; release 2018-07-20; PNS-5000 specification table and feature paragraphs; duplicated #52 colour line is not used to infer the fifth colour",
});
const catalog = webSource({
  ...officialBase,
  key: "phase121-platinum-general-catalog-2019-2020",
  title: "Platinum Pen General Catalog 2019–2020",
  url: PHASE121_CATALOG_URL,
  publishedAt: "2019",
  summary:
    "Dated catalog table supplies the five historical PNS-5000 colours and verifies material, F/M nib, cartridge/converter, dimensions and weight; it does not prove 2026 availability.",
  locator:
    "PDF page 10 (printed catalogue page 8), PROCYON / PNS-5000 table: #3, #25, #50, #52, #68; specification columns for nib, body, size, weight and accessories",
});
const manual = webSource({
  ...officialBase,
  key: "phase121-platinum-current-fountain-pen-manual",
  title: "Platinum fountain pen instruction manual",
  url: PHASE121_MANUAL_URL,
  summary:
    "Current manual narrowly supports cartridge/converter handling and the Procyon-specific instruction to submerge ink only up to the breather hole when using a converter.",
  locator:
    "PDF Procyon filling panel, converter diagram and text: submerge up to the breather hole; generic cartridge/converter handling",
});

function reviewSource(input: {
  key: string;
  title: string;
  url: string;
  publishedAt: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return webSource({
    ...input,
    registryKey: "pen-addict-phase121",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-addict",
    homepageUrl: "https://www.penaddict.com/",
    author: "Jeff Abbott",
  });
}
const review2019 = reviewSource({
  key: "phase121-pen-addict-procyon-porcelain-white-f-2019",
  title: "Platinum Procyon Fountain Pen Review",
  url: PHASE121_REVIEW_2019_URL,
  publishedAt: "2019-07-17",
  summary:
    "Jeff Abbott reviews a Porcelain White/F sample supplied free by JetPens; $53, then-retailer availability, shiny finish, clip, half-turn cap, grip, F feel and weeks-unused no-dry-out remain sample/date observations.",
  locator:
    "Jeff Abbott; published 2019-07-17; JetPens provided the Porcelain White fine-nib sample free of charge; sample price, finish, cap/clip/grip, F writing and weeks-unused observation",
});
const review2021 = reviewSource({
  key: "phase121-pen-addict-procyon-deep-sea-m-2021",
  title: "Platinum Procyon Deep Sea Fountain Pen Review",
  url: PHASE121_REVIEW_2021_URL,
  publishedAt: "2021-01-13",
  summary:
    "Jeff Abbott reviews a Deep Sea/M sample supplied free by JetPens; $60/$68 converter context, finish, M flow/smoothness, F comparison and couple-weeks-unused immediate start remain sample/date observations.",
  locator:
    "Jeff Abbott; published 2021-01-13; JetPens provided the Deep Sea medium-nib sample free of charge; dated price/converter, finish, M/F comparison and couple-weeks-unused observation",
});
const diagram: CuratedSource = {
  key: "phase121-platinum-procyon-boundary-svg",
  registryKey: "fountain-pen-graph-editorial-phase121",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase121",
  title: "Procyon PNS-5000 current/history/sibling/sample boundary map",
  url: SVG_PATH,
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  summary:
    "本站原创 factual SVG，区分 PNS-5000 structure/current four、launch-only colours、PNS-8000 limited sibling 与两支 supplied samples。",
  allowedUse: "store_full",
  license: "site-original",
  archiveUrl: SVG_PATH,
  archiveLocator:
    `project-public-asset:${SVG_PATH};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900`,
};

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

export const phase121PlatinumProcyonPack: CuratedEntityPack = {
  key: "phase121-platinum-procyon-pns-5000-v1",
  entityId: PHASE121_PROCYON_ID,
  expectedType: "pen",
  expectedSlug: PHASE121_PROCYON_SLUG,
  canonicalName: PHASE121_PROCYON_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/platinum-procyon-pns-5000-phase121.md",
  storyTitle:
    "Platinum Procyon PNS-5000：四个现行色、五个首发色与样本边界",
  primarySourceKey: current.key,
  depthTier: "A",
  aliases: [
    { alias: "Platinum Procyon", language: "en", sourceKey: current.key },
    { alias: "PROCYON", language: "en", sourceKey: current.key },
    { alias: "PNS-5000", language: "en", sourceKey: launch.key },
    { alias: "白金 Procyon", language: "zh", sourceKey: current.key },
  ],
  sources: [
    current,
    index,
    launch,
    catalog,
    manual,
    review2019,
    review2021,
    diagram,
  ],
  scopes: [
    {
      key: PHASE121_CURRENT_SCOPE,
      scopeKey: PHASE121_CURRENT_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "PNS-5000 line: steel F/M nib; four current cards are a retrieval-date listing snapshot.",
      materialScope: "PNS-5000 coated/textured aluminium body and Slip & Seal.",
      editionScope: `2026-07-22 current cards only: ${PHASE121_CURRENT_COLOURS.join(", ")}; repeated image renders deduplicated; not a permanent production promise.`,
    },
    {
      key: PHASE121_LAUNCH_SCOPE,
      scopeKey: PHASE121_LAUNCH_SCOPE,
      validFrom: "2018-07-20",
      validTo: "2020-12-31",
      productionState: "historical",
      nibScope: "2018 launch PNS-5000 with pentagon-shaped steel F/M nib and new feeder/Last Drop launch wording.",
      materialScope: "2018 launch coated aluminium body; 139.7 × 14.4 mm; 23.3 g; cartridge/converter.",
      editionScope: `Dated launch/catalog set only: ${PHASE121_LAUNCH_COLOURS.join(", ")}; shared names retain separate time evidence; launch-only colours do not become current.`,
    },
    {
      key: PHASE121_PNS8000_SCOPE,
      scopeKey: PHASE121_PNS8000_SCOPE,
      validFrom: RETRIEVED,
      productionState: "historical",
      editionScope: `Separate PNS-8000 limited sibling only: ${PHASE121_PNS8000_COLOURS.join(", ")}; not PNS-5000 variants, specs, aliases or entities.`,
    },
    {
      key: PHASE121_SAMPLE_2019_SCOPE,
      scopeKey: PHASE121_SAMPLE_2019_SCOPE,
      validFrom: "2019-07-17",
      validTo: "2019-07-17",
      productionState: "historical",
      nibScope: "Jeff Abbott's JetPens-free-supplied Porcelain White/F sample only.",
      materialScope: "Sample-only shiny finish, clip, half-turn cap and grip observations.",
      editionScope: "2019 price, retailer availability, F feel and weeks-unused no-dry-out remain dated sample observations.",
    },
    {
      key: PHASE121_SAMPLE_2021_SCOPE,
      scopeKey: PHASE121_SAMPLE_2021_SCOPE,
      validFrom: "2021-01-13",
      validTo: "2021-01-13",
      productionState: "historical",
      nibScope: "Jeff Abbott's JetPens-free-supplied Deep Sea/M sample only.",
      materialScope: "Sample-only Deep Sea finish observation.",
      editionScope: "2021 price/converter context, M flow/smoothness, F comparison and couple-weeks-unused start remain dated sample observations.",
    },
  ],
  claims: [
    {
      key: "phase121-procyon-identity",
      predicate: "model_identity",
      objectText:
        "Platinum Procyon PNS-5000 is one canonical current pen, not a colour-specific pen and not PNS-8000.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: current.key,
      locator: "current PROCYON/PNS-5000 cards and launch model code",
      evidence: [
        { key: "phase121-identity-current", sourceKey: current.key, scopeKey: PHASE121_CURRENT_SCOPE, locator: "PROCYON and PNS-5000 current cards" },
        { key: "phase121-identity-launch", sourceKey: launch.key, scopeKey: PHASE121_LAUNCH_SCOPE, locator: "PNS-5000 launch identity" },
      ],
    },
    {
      key: "phase121-current-colours",
      predicate: "retrieved_current_variant_snapshot",
      objectText: `The 2026-07-22 current set is exactly ${PHASE121_CURRENT_COLOURS.join(", ")}; duplicate image cards do not create duplicate variants.`,
      factClass: "core",
      confidence: 0.99,
      sourceKey: current.key,
      locator: "four current PNS-5000 cards",
      evidence: [{ key: "phase121-current-colours-evidence", sourceKey: current.key, scopeKey: PHASE121_CURRENT_SCOPE, locator: PHASE121_CURRENT_COLOURS.join(", ") }],
    },
    {
      key: "phase121-launch-colours",
      predicate: "dated_launch_variant_history",
      objectText: `The dated 2018/2019–2020 set is ${PHASE121_LAUNCH_COLOURS.join(", ")}; only Porcelain White and Deep Sea overlap the current snapshot.`,
      factClass: "core",
      confidence: 0.99,
      sourceKey: catalog.key,
      locator: "catalog PNS-5000 colour table",
      evidence: [{ key: "phase121-launch-colours-evidence", sourceKey: catalog.key, scopeKey: PHASE121_LAUNCH_SCOPE, locator: "PDF page 10 / printed page 8 PNS-5000 table" }],
    },
    {
      key: "phase121-pns8000-boundary",
      predicate: "limited_sibling_boundary",
      objectText: `PNS-8000 ${PHASE121_PNS8000_COLOURS.join(" and ")} are limited sibling cards and never PNS-5000 variants or stable specifications.`,
      factClass: "core",
      confidence: 0.99,
      sourceKey: current.key,
      locator: "PNS-8000 cards marked Limited Quantity",
      evidence: [{ key: "phase121-pns8000-evidence", sourceKey: current.key, scopeKey: PHASE121_PNS8000_SCOPE, locator: "separate PNS-8000 model code and limited labels" }],
    },
    {
      key: "phase121-last-drop",
      predicate: "launch_filling_feature",
      objectText:
        "The 2018 launch's new feeder/Last Drop wording says ink can be drawn with only the nib end immersed; it is a dated launch claim.",
      factClass: "core",
      confidence: 0.98,
      sourceKey: launch.key,
      locator: "new feeder / easier ink absorption feature paragraph",
      evidence: [{ key: "phase121-last-drop-evidence", sourceKey: launch.key, scopeKey: PHASE121_LAUNCH_SCOPE, locator: "immerse only up to nib end for ink absorption" }],
    },
    {
      key: "phase121-manual-filling",
      predicate: "current_manual_operation",
      objectText:
        "The current manual separately instructs Procyon converter users to submerge up to the breather hole.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: manual.key,
      locator: "Procyon breather-hole filling panel",
      evidence: [{ key: "phase121-manual-evidence", sourceKey: manual.key, scopeKey: PHASE121_CURRENT_SCOPE, locator: "submerge up to breather hole" }],
    },
    {
      key: "phase121-sample-2019",
      predicate: "professional_supplied_sample_observation",
      objectText:
        "Jeff Abbott's 2019 Porcelain White/F sample, supplied free by JetPens, carries its price, finish, cap/clip/grip, F feel and weeks-unused observation only.",
      factClass: "core",
      confidence: 0.96,
      sourceKey: review2019.key,
      locator: review2019.summary,
      evidence: [{ key: "phase121-sample-2019-evidence", sourceKey: review2019.key, scopeKey: PHASE121_SAMPLE_2019_SCOPE, locator: review2019.archiveLocator ?? review2019.summary }],
    },
    {
      key: "phase121-sample-2021",
      predicate: "professional_supplied_sample_observation",
      objectText:
        "Jeff Abbott's 2021 Deep Sea/M sample, supplied free by JetPens, carries its price/converter context, finish, M feel, F comparison and couple-weeks-unused observation only.",
      factClass: "core",
      confidence: 0.96,
      sourceKey: review2021.key,
      locator: review2021.summary,
      evidence: [{ key: "phase121-sample-2021-evidence", sourceKey: review2021.key, scopeKey: PHASE121_SAMPLE_2021_SCOPE, locator: review2021.archiveLocator ?? review2021.summary }],
    },
  ],
  variants: PHASE121_CURRENT_COLOURS.map((name) => ({
    key: `phase121-current-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    name,
    releaseYear: "2026-07-22 listing snapshot",
    notes:
      "One name-deduplicated official current PNS-5000 card; mutable listing snapshot, not a permanent production or finish/colour proof.",
    sourceKey: current.key,
    variantKind: "market_sku" as const,
    productCode: `PNS-5000 ${name.split(" ")[0]}`,
  })),
  spec: {
    brandEntityId: PHASE121_PLATINUM_BRAND_ID,
    values: {
      series_name: "Platinum Procyon PNS-5000",
      release_year: "2018-07-20",
      origin_country: "Japan / Platinum official product line",
      nib: "pentagon-shaped steel nib; F and M",
      fill_system: "Platinum cartridge or converter",
      material: "coated/textured aluminium body",
      dimensions: "139.7 mm × 14.4 mm",
      weight: "approximately 23.3 g",
      status:
        "current four-card official listing snapshot retrieved 2026-07-22",
    },
    evidence: [
      evidence("brand_entity_id", "phase121-brand", current.key, PHASE121_CURRENT_SCOPE, "locked Platinum brand identity"),
      evidence("series_name", "phase121-series", launch.key, PHASE121_LAUNCH_SCOPE, "PNS-5000 launch identity"),
      evidence("release_year", "phase121-release", launch.key, PHASE121_LAUNCH_SCOPE, "release date 2018-07-20"),
      evidence("origin_country", "phase121-origin", current.key, PHASE121_CURRENT_SCOPE, "Platinum Japanese official registry"),
      evidence("nib", "phase121-nib", launch.key, PHASE121_LAUNCH_SCOPE, "pentagon-shaped steel F/M nib"),
      evidence("fill_system", "phase121-fill", catalog.key, PHASE121_LAUNCH_SCOPE, "cartridge and converter table"),
      evidence("material", "phase121-material", launch.key, PHASE121_LAUNCH_SCOPE, "coated aluminium body"),
      evidence("dimensions", "phase121-dimensions", catalog.key, PHASE121_LAUNCH_SCOPE, "139.7 mm × 14.4 mm table"),
      evidence("weight", "phase121-weight", catalog.key, PHASE121_LAUNCH_SCOPE, "23.3 g table"),
      evidence("status", "phase121-status", current.key, PHASE121_CURRENT_SCOPE, "four current cards retrieved 2026-07-22"),
      evidence("status", "phase121-launch-only-rejected", catalog.key, PHASE121_LAUNCH_SCOPE, "Persimmon Orange, Turquoise Blue and Citron Yellow rejected as 2026 current evidence", false),
      evidence("status", "phase121-pns8000-rejected", current.key, PHASE121_PNS8000_SCOPE, "PNS-8000 Rose Gold/Satin Silver rejected as PNS-5000 variants", false),
      evidence("price_range", "phase121-price-2019-rejected", review2019.key, PHASE121_SAMPLE_2019_SCOPE, "$53 and retailer availability rejected as current stable specification", false),
      evidence("material", "phase121-finish-2019-rejected", review2019.key, PHASE121_SAMPLE_2019_SCOPE, "sample finish/cap/clip/grip rejected as line-wide proof", false),
      evidence("nib", "phase121-feel-2019-rejected", review2019.key, PHASE121_SAMPLE_2019_SCOPE, "F sample feel and no-dry-out rejected as line-wide guarantee", false),
      evidence("price_range", "phase121-price-2021-rejected", review2021.key, PHASE121_SAMPLE_2021_SCOPE, "$60/$68 converter context rejected as current stable price", false),
      evidence("material", "phase121-finish-2021-rejected", review2021.key, PHASE121_SAMPLE_2021_SCOPE, "Deep Sea sample finish rejected as line-wide proof", false),
      evidence("nib", "phase121-feel-2021-rejected", review2021.key, PHASE121_SAMPLE_2021_SCOPE, "M flow/smoothness, F comparison and no-dry-out rejected as line-wide guarantee", false),
    ],
  },
  timeline: [
    { key: "phase121-launch", title: "Procyon PNS-5000 released", eventType: "model_released", startDate: "2018-07-20", circa: false, description: `Dated launch set: ${PHASE121_LAUNCH_COLOURS.join(", ")}.`, sourceKey: launch.key },
    { key: "phase121-review-2019", title: "Porcelain White/F supplied sample reviewed", eventType: "community_event", startDate: "2019-07-17", circa: false, description: "Jeff Abbott / Pen Addict / JetPens free-supplied sample.", sourceKey: review2019.key },
    { key: "phase121-review-2021", title: "Deep Sea/M supplied sample reviewed", eventType: "community_event", startDate: "2021-01-13", circa: false, description: "Jeff Abbott / Pen Addict / JetPens free-supplied sample.", sourceKey: review2021.key },
    { key: "phase121-current", title: "Official current-card snapshot verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: PHASE121_CURRENT_COLOURS.join(", "), sourceKey: current.key },
  ],
  media: [
    {
      key: "phase121-procyon-primary",
      title: "Procyon PNS-5000 evidence boundary map（非产品照片）",
      sourceKey: diagram.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创 factual SVG；non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof，不证明价格、库存或持续生产。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary",
    },
  ],
};

export function loadPhase121PlatinumProcyonPack(
  workspaceRoot: string,
): LoadedCuratedEntityPack {
  const loaded = loadCuratedEntityPack(workspaceRoot, phase121PlatinumProcyonPack);
  if (Array.from(loaded.summary).length < 60 || Array.from(loaded.summary).length > 160) {
    throw new Error("Phase 121 summary must contain 60–160 Unicode characters.");
  }
  if (Array.from(loaded.bodyMd).length < 2_000) {
    throw new Error("Phase 121 body_md must contain at least 2,000 Unicode characters.");
  }
  return loaded;
}
