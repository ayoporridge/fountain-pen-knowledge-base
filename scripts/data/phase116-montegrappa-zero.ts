import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE116_MONTEGRAPPA_BRAND_ID = "phase85-brand-montegrappa";
export const PHASE116_ZERO_ID = "phase116-pen-montegrappa-zero";
export const PHASE116_ZERO_SLUG = "montegrappa-zero";
export const PHASE116_ZERO_NAME = "Montegrappa Zero";

export const PHASE116_CURRENT_URL =
  "https://www.montegrappa.com/en/collections/edizioni-continuative/zero-1176.html";
export const PHASE116_CATALOG_URL = "https://www.montegrappa.com/en/catalog/";
export const PHASE116_LAUNCH_URL =
  "https://montegrappa.com.ua/wp-content/uploads/2020/03/zero_eng.pdf";
export const PHASE116_REVIEW_URL =
  "https://www.pencilcaseblog.com/2020/11/review-montegrappa-zero-fountain-pen.html";

export const PHASE116_CURRENT_SCOPE = "phase116-zero-current";
export const PHASE116_LAUNCH_SCOPE = "phase116-zero-launch-2020";
export const PHASE116_REVIEW_SCOPE = "phase116-zero-review-2020";
export const PHASE116_ZERO_SVG =
  "/images/library/site-original/phase116/montegrappa/montegrappa-zero.svg";

const RETRIEVED = "2026-07-21";

function webSource(
  input: Omit<
    CuratedSource,
    "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
  > & { locator: string; limitation?: string },
): CuratedSource {
  const { locator, limitation, ...source } = input;
  return {
    ...source,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: source.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}${limitation ? `;limitation=${limitation}` : ""}`,
  };
}

export const PHASE116_SOURCES = {
  current: webSource({
    key: "phase116-montegrappa-zero-current",
    registryKey: "montegrappa-zero-current-phase116",
    registryName: "Montegrappa official current product",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "montegrappa-zero-current-product-2026-07-21",
    title: "Zero Fountain Pen",
    url: PHASE116_CURRENT_URL,
    homepageUrl: "https://www.montegrappa.com/",
    summary:
      "2026-07-21 current Zero page: resin, stainless-steel trims, cartridge/converter, two cartridges plus converter, 143 mm, 14 mm, 32 g, steel/14K/14K flex and EF/F/M/B/ST1/ST5.",
    locator:
      "current product specification and option panels; retrieved 2026-07-21; price, stock and delivery excluded",
  }),
  catalog: webSource({
    key: "phase116-montegrappa-zero-catalog",
    registryKey: "montegrappa-catalog-phase116",
    registryName: "Montegrappa official catalogue",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "montegrappa-current-catalog-navigation-2026-07-21",
    title: "Explore Montegrappa catalogue",
    url: PHASE116_CATALOG_URL,
    homepageUrl: "https://www.montegrappa.com/",
    summary:
      "Current catalogue navigation treats Zero, Elmo models and Extra 1930 as separate entries and does not collapse Zero Custom or themed pens into the standard SKU.",
    locator: "current catalogue model navigation retrieved 2026-07-21",
  }),
  launch: webSource({
    key: "phase116-montegrappa-zero-launch-brochure",
    registryKey: "montegrappa-zero-launch-brochure-phase116",
    registryName: "Montegrappa official March 2020 brochure",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "montegrappa-zero-launch-brochure-2020-03",
    title: "Montegrappa Zero launch brochure",
    url: PHASE116_LAUNCH_URL,
    homepageUrl: "https://montegrappa.com.ua/",
    itemType: "document",
    publishedAt: "2020-03",
    summary:
      "March 2020 official launch-era brochure describes Br8 bronze; it is retained as dated evidence and cannot overwrite the current stainless-steel listing.",
    locator: "March 2020 Zero brochure material/trim description: Br8 bronze",
    limitation: "launch-era-only;not-current-stable-material",
  }),
  review: webSource({
    key: "phase116-pencilcase-zero-review",
    registryKey: "pencilcaseblog-zero-review-phase116",
    registryName: "The Pencilcase Blog",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pencilcaseblog-zero-loaned-sample-2020-11-09",
    title: "REVIEW: MONTEGRAPPA ZERO FOUNTAIN PEN",
    url: PHASE116_REVIEW_URL,
    homepageUrl: "https://www.pencilcaseblog.com/",
    author: "Dries Pil",
    publishedAt: "2020-11-09",
    summary:
      "Dated review of one loaned black/ruthenium sample: 14.3 cm capped and 32 g corroborate current values; uncapped length, section estimate, JoWo attribution, feedback and balance remain sample-specific.",
    locator:
      "loan disclosure, black/ruthenium sample, 14.3 cm capped, 12.9 cm uncapped, about 10.5 mm section, 32 g, JoWo attribution and subjective writing/balance sections",
    limitation: "loaned-single-sample;sample-only-observations",
  }),
  diagram: {
    key: "phase116-montegrappa-zero-boundary-svg",
    registryKey: "fountain-pen-graph-editorial-phase116",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-zero-phase116",
    title: "Montegrappa Zero current/launch/review evidence boundary",
    url: PHASE116_ZERO_SVG,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "Site-original factual scope diagram; non-photo and non-logo, with no scale, colour, finish, material or durability proof.",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: PHASE116_ZERO_SVG,
    archiveLocator: `project-public-asset:${PHASE116_ZERO_SVG};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;finish-proof=false;material-proof=false;durability-proof=false;dimensions=1600x900`,
  } satisfies CuratedSource,
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

export const phase116MontegrappaZeroPack: CuratedEntityPack = {
  key: "phase116-montegrappa-zero-v1",
  entityId: PHASE116_ZERO_ID,
  expectedType: "pen",
  expectedSlug: PHASE116_ZERO_SLUG,
  canonicalName: PHASE116_ZERO_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/phase116-montegrappa-zero.md",
  storyTitle: "Montegrappa Zero：current stainless 与 2020 Br8 必须分开读",
  primarySourceKey: PHASE116_SOURCES.current.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Montegrappa Zero Fountain Pen",
      language: "en",
      sourceKey: PHASE116_SOURCES.current.key,
    },
    {
      alias: "蒙特格拉帕 Zero",
      language: "zh",
      sourceKey: PHASE116_SOURCES.catalog.key,
    },
  ],
  sources: [
    PHASE116_SOURCES.current,
    PHASE116_SOURCES.catalog,
    PHASE116_SOURCES.launch,
    PHASE116_SOURCES.review,
    PHASE116_SOURCES.diagram,
  ],
  scopes: [
    {
      key: PHASE116_CURRENT_SCOPE,
      scopeKey: PHASE116_CURRENT_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Current steel, 14K gold or 14K gold flex; EF/F/M/B/ST1/ST5. Flex range and universal softness are not asserted.",
      materialScope: "Current standard Zero: resin with stainless-steel trims.",
      editionScope:
        "Factory-standard Zero with IP Palladium/IP Ultra-Black/IP Yellow Gold finishes; C/C, two cartridges plus converter, 143 mm, 14 mm, 32 g. Custom and themed products excluded.",
    },
    {
      key: PHASE116_LAUNCH_SCOPE,
      scopeKey: PHASE116_LAUNCH_SCOPE,
      validFrom: "2020-03",
      validTo: "2020-03",
      productionState: "historical",
      materialScope: "March 2020 launch brochure: Br8 bronze.",
      editionScope:
        "Launch-era official scope only; material chronology and applicability to later/current SKUs remain unresolved.",
    },
    {
      key: PHASE116_REVIEW_SCOPE,
      scopeKey: PHASE116_REVIEW_SCOPE,
      validFrom: "2020-11-09",
      validTo: "2020-11-09",
      productionState: "historical",
      nibScope:
        "Loaned black/ruthenium Fine sample; JoWo attribution, feedback and writing experience are sample-specific.",
      materialScope: "One loaned black/ruthenium sample.",
      editionScope:
        "14.3 cm capped and 32 g corroborate current values; 12.9 cm uncapped, about 10.5 mm section and balance remain sample-only.",
    },
  ],
  claims: [
    {
      key: "phase116-zero-current-configuration",
      predicate: "current_standard_configuration",
      objectText:
        "The 2026-07-21 official standard Zero listing supports resin, stainless trims, C/C with two cartridges and converter, 143 mm, 14 mm, 32 g, three nib material categories and EF/F/M/B/ST1/ST5.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: PHASE116_SOURCES.current.key,
      locator: "current official specification and configuration panels",
      evidence: [
        {
          key: "phase116-current-claim-citation",
          sourceKey: PHASE116_SOURCES.current.key,
          scopeKey: PHASE116_CURRENT_SCOPE,
          locator: "current materials, filling, accessories, dimensions, weight and nib options",
        },
      ],
    },
    {
      key: "phase116-zero-launch-material-boundary",
      predicate: "dated_launch_material_conflict",
      objectText:
        "The March 2020 brochure's Br8 bronze description conflicts with the current stainless-steel listing and remains dated rather than becoming a current option.",
      factClass: "core",
      confidence: 0.98,
      sourceKey: PHASE116_SOURCES.launch.key,
      locator: "March 2020 Br8 brochure language compared with current stainless trims",
      evidence: [
        {
          key: "phase116-launch-claim-citation",
          sourceKey: PHASE116_SOURCES.launch.key,
          scopeKey: PHASE116_LAUNCH_SCOPE,
          locator: "launch brochure Br8 bronze",
        },
        {
          key: "phase116-launch-current-citation",
          sourceKey: PHASE116_SOURCES.current.key,
          scopeKey: PHASE116_CURRENT_SCOPE,
          locator: "current stainless-steel trims",
        },
      ],
    },
    {
      key: "phase116-zero-loaned-sample-boundary",
      predicate: "dated_professional_sample",
      objectText:
        "Dries Pil's 2020-11-09 review covers one loaned black/ruthenium sample: capped length and weight corroborate official values, while uncapped/section/JoWo/feedback/balance remain sample-only.",
      factClass: "core",
      confidence: 0.96,
      sourceKey: PHASE116_SOURCES.review.key,
      locator: "loan disclosure, measurements, nib attribution and handling observations",
      evidence: [
        {
          key: "phase116-review-claim-citation",
          sourceKey: PHASE116_SOURCES.review.key,
          scopeKey: PHASE116_REVIEW_SCOPE,
          locator: "loaned black/ruthenium sample and dated observations",
        },
      ],
    },
    {
      key: "phase116-zero-clip-attribution",
      predicate: "manufacturer_engineering_claim",
      objectText:
        "Montegrappa says its CNC-machined stainless-steel ruzzolino clip was stress-tested beyond 20,000 actions; this is attributed engineering language, not a durability guarantee.",
      factClass: "editorial",
      confidence: 0.99,
      sourceKey: PHASE116_SOURCES.current.key,
      locator: "manufacturer ruzzolino clip and stress-test language",
      evidence: [
        {
          key: "phase116-clip-claim-citation",
          sourceKey: PHASE116_SOURCES.current.key,
          scopeKey: PHASE116_CURRENT_SCOPE,
          locator: "manufacturer claim: beyond 20,000 actions",
        },
      ],
    },
  ],
  variants: [
    {
      key: "phase116-zero-standard-finishes",
      name: "IP Palladium / IP Ultra-Black / IP Yellow Gold",
      releaseYear: "current listing retrieved 2026-07-21",
      notes:
        "Standard Zero finish/trim choices only; Zero Custom and themed/collaboration pens are excluded identities.",
      sourceKey: PHASE116_SOURCES.current.key,
      variantKind: "color",
    },
    {
      key: "phase116-zero-current-nibs",
      name: "steel / 14K gold / 14K gold flex; EF/F/M/B/ST1/ST5",
      releaseYear: "current listing retrieved 2026-07-21",
      notes: "Nib order options under standard Zero; no unsupported flex range is asserted.",
      sourceKey: PHASE116_SOURCES.current.key,
      variantKind: "nib",
    },
  ],
  spec: {
    brandEntityId: PHASE116_MONTEGRAPPA_BRAND_ID,
    values: {
      series_name: PHASE116_ZERO_NAME,
      release_year: "current listing verified 2026-07-21; launch-era brochure dated March 2020",
      origin_country: "Montegrappa official product context; manufacturing batch origin not generalized",
      nib: "steel, 14K gold or 14K gold flex; EF/F/M/B/ST1/ST5",
      fill_system: "cartridge/converter; two cartridges and converter included",
      material: "resin with stainless-steel trims in the current listing",
      dimensions: "closed length 143 mm; diameter 14 mm",
      weight: "32 g",
      status: "current official standard Zero listing retrieved 2026-07-21; price and availability mutable",
    },
    evidence: [
      evidence("brand_entity_id", "phase116-spec-brand", PHASE116_SOURCES.catalog.key, PHASE116_CURRENT_SCOPE, "official catalogue and locked Montegrappa identity"),
      evidence("series_name", "phase116-spec-series", PHASE116_SOURCES.current.key, PHASE116_CURRENT_SCOPE, "exact current product title"),
      evidence("release_year", "phase116-spec-time", PHASE116_SOURCES.current.key, PHASE116_CURRENT_SCOPE, "retrieval date is not asserted as launch day"),
      evidence("origin_country", "phase116-spec-origin", PHASE116_SOURCES.catalog.key, PHASE116_CURRENT_SCOPE, "official brand/product context only"),
      evidence("nib", "phase116-spec-current-nib", PHASE116_SOURCES.current.key, PHASE116_CURRENT_SCOPE, "current nib material and grade options"),
      evidence("fill_system", "phase116-spec-current-fill", PHASE116_SOURCES.current.key, PHASE116_CURRENT_SCOPE, "C/C and included accessories"),
      evidence("material", "phase116-spec-current-material", PHASE116_SOURCES.current.key, PHASE116_CURRENT_SCOPE, "current resin and stainless-steel trims"),
      evidence("dimensions", "phase116-spec-current-dimensions", PHASE116_SOURCES.current.key, PHASE116_CURRENT_SCOPE, "current 143 mm and 14 mm"),
      evidence("weight", "phase116-spec-current-weight", PHASE116_SOURCES.current.key, PHASE116_CURRENT_SCOPE, "current 32 g"),
      evidence("status", "phase116-spec-current-status", PHASE116_SOURCES.current.key, PHASE116_CURRENT_SCOPE, "current at retrieval; mutable price/stock excluded"),
      evidence("material", "phase116-spec-launch-material", PHASE116_SOURCES.launch.key, PHASE116_LAUNCH_SCOPE, "March 2020 Br8 bronze rejected for current material qualification", false),
      evidence("dimensions", "phase116-spec-review-capped", PHASE116_SOURCES.review.key, PHASE116_REVIEW_SCOPE, "loaned sample 14.3 cm capped corroborates but does not qualify current dimensions", false),
      evidence("weight", "phase116-spec-review-weight", PHASE116_SOURCES.review.key, PHASE116_REVIEW_SCOPE, "loaned sample 32 g corroborates but does not qualify current weight", false),
      evidence("dimensions", "phase116-spec-review-uncapped-section", PHASE116_SOURCES.review.key, PHASE116_REVIEW_SCOPE, "12.9 cm uncapped and about 10.5 mm section are sample-only", false),
      evidence("nib", "phase116-spec-review-jowo", PHASE116_SOURCES.review.key, PHASE116_REVIEW_SCOPE, "JoWo attribution and Fine feedback are sample-only", false),
      evidence("status", "phase116-spec-review-balance", PHASE116_SOURCES.review.key, PHASE116_REVIEW_SCOPE, "unposted balance is subjective sample evidence", false),
    ],
  },
  conflicts: [
    {
      key: "phase116-zero-br8-stainless-conflict",
      fieldKey: "material",
      scopeKey: PHASE116_CURRENT_SCOPE,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Resolved editorially by strict dated scope separation and non-merging: both official descriptions remain queryable, while current stainless controls the stable field and launch Br8 chronology remains unexplained.",
      members: [
        {
          citationKey: "phase116-spec-current-material",
          assertedValue: "2026 current page: stainless-steel trims",
        },
        {
          citationKey: "phase116-spec-launch-material",
          assertedValue: "2020 launch brochure: Br8 bronze trim/material",
        },
      ],
    },
  ],
  timeline: [
    {
      key: "phase116-zero-launch-2020",
      title: "Zero launch brochure records Br8 bronze",
      eventType: "model_released",
      startDate: "2020-03",
      circa: false,
      description: "Launch-era material scope; not promoted to the current stable specification.",
      sourceKey: PHASE116_SOURCES.launch.key,
    },
    {
      key: "phase116-zero-review-2020",
      title: "Loaned black/ruthenium sample reviewed",
      eventType: "community_event",
      startDate: "2020-11-09",
      circa: false,
      description: "Professional dated sample evidence with explicit current-field limits.",
      sourceKey: PHASE116_SOURCES.review.key,
    },
    {
      key: "phase116-zero-current-2026",
      title: "Standard Zero current listing verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description: "Current standard configuration verified without inferring price or stock permanence.",
      sourceKey: PHASE116_SOURCES.current.key,
    },
  ],
  media: [
    {
      key: "phase116-zero-primary",
      title: "Montegrappa Zero current/launch/review 事实边界图（非产品照片）",
      sourceKey: PHASE116_SOURCES.diagram.key,
      localPath: PHASE116_ZERO_SVG,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片、logo、比例、色准、饰面、材料或耐久性证明。",
      sourceUrl: PHASE116_ZERO_SVG,
      usageStatus: "primary",
    },
  ],
};

export function loadPhase116MontegrappaZeroPack(
  workspaceRoot: string,
): LoadedCuratedEntityPack {
  const loaded = loadCuratedEntityPack(workspaceRoot, phase116MontegrappaZeroPack);
  const summaryLength = Array.from(loaded.summary).length;
  if (summaryLength < 60 || summaryLength > 160) {
    throw new Error("Phase 116 summary must contain 60-160 Unicode characters.");
  }
  if (Array.from(loaded.bodyMd).length < 2_000) {
    throw new Error("Phase 116 body_md must contain at least 2,000 Unicode characters.");
  }
  for (const route of [
    "/brand/montegrappa",
    "/pen/montegrappa-elmo-01",
    "/pen/montegrappa-elmo-02",
    "/pen/montegrappa-elmo-02-plus",
    "/pen/montegrappa-extra-1930",
  ]) {
    if (!loaded.bodyMd.includes(route)) {
      throw new Error(`Phase 116 reviewed copy is missing navigation route: ${route}`);
    }
  }
  return loaded;
}
