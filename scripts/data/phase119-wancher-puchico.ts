import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE119_WANCHER_ID = "eOfD77nOeENN";
export const PHASE119_DREAM_ARTICLE_ID = "2aoD07lwSYCV";
export const PHASE119_TRUE_EBONITE_ID =
  "phase107-wancher-true-ebonite-matte-black";
export const PHASE119_TITANIUM_BLACK_ID =
  "phase112-wancher-dream-pen-titanium-black";
export const PHASE119_AKA_TAMENURI_ID =
  "phase113-wancher-dream-pen-true-urushi-aka-tamenuri";
export const PHASE119_PUCHICO_ID = "phase119-wancher-puchico";
export const PHASE119_PUCHICO_SLUG = "wancher-puchico";
export const PHASE119_COLLECTION_URL =
  "https://www.wancherpen.com/collections/puchico";
export const PHASE119_WHITE_SNOW_URL =
  "https://www.wancherpen.com/products/puchico-whitesnow";
export const PHASE119_SARAH_URL =
  "https://www.penaddict.com/blog/2024/7/25/wancher-puchico-mini-fountain-pen";
export const PHASE119_KIMBERLY_URL =
  "https://www.penaddict.com/blog/2025/6/19/wancher-puchico-a-pen-for-ants";

export const PHASE119_VARIANT_NAMES = [
  "Lime Sherbet",
  "Lilac Mist",
  "White Snow",
  "Hawaiian Blue",
  "Black Chocolate Orange",
  "Arctic Blue",
  "Peony Pink",
  "Frosty Sepia",
  "Tropical Green",
  "Milky Soda",
  "Penguin Black",
] as const;

export const PHASE119_OFFICIAL_SCOPE =
  "phase119-puchico-official-current-2026-07-22";
export const PHASE119_SARAH_SCOPE =
  "phase119-puchico-sarah-read-2024-jetpens-supplied-sample";
export const PHASE119_KIMBERLY_SCOPE =
  "phase119-puchico-kimberly-lau-2025-self-purchased-bco-fine-sample";

const RETRIEVED = "2026-07-22";
const SVG_PATH =
  "/images/library/site-original/phase119/wancher/wancher-puchico.svg";

function webSource(
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

const official = webSource({
  key: "phase119-wancher-puchico-official-collection",
  registryKey: "wancher-official-phase119",
  registryName: "Wancher official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official",
  title: "Collection: PuChiCo",
  url: PHASE119_COLLECTION_URL,
  homepageUrl: "https://www.wancherpen.com/",
  summary:
    "2026-07-22 official collection：65 mm capped-before-posting、cap posting、acrylic shavings/cutting、eyedropper、iridium-point stainless-steel nib 与 11 个 PuChiCo pen cards；3 个 Petite Charm Case 排除。",
  locator:
    "collection lines 739-920 exact eleven PuChiCo pen cards and three Petite Charm Case cards; lines 921-964 acrylic process, 65 mm before posting, eyedropper and specifications",
});

const sarah = webSource({
  key: "phase119-pen-addict-sarah-read-2024",
  registryKey: "pen-addict-phase119-sarah-read",
  registryName: "The Pen Addict",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pen-addict-sarah-read-2024-sample",
  title: "Wancher PuChiCo Mini Fountain Pen",
  url: PHASE119_SARAH_URL,
  homepageUrl: "https://www.penaddict.com/",
  author: "Sarah Read",
  publishedAt: "2024-07-25",
  summary:
    "Sarah Read 的 JetPens 免费提供 review sample；6.5 cm capped、约 0.5 ml、随身数周无 leak、nib／threads／clip／comfort 与当时 $33 均限于该样品。",
  locator:
    "lines 906-921: author, 6.5 cm capped, comfort, construction/nib, .5 ml, weeks without leak, $33 JetPens price and no-charge disclosure; posted 2024-07-25",
});

const kimberly = webSource({
  key: "phase119-pen-addict-kimberly-lau-2025",
  registryKey: "pen-addict-phase119-kimberly-lau",
  registryName: "The Pen Addict",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pen-addict-kimberly-lau-2025-sample",
  title: "Wancher PuChiCo - A Pen for Ants?",
  url: PHASE119_KIMBERLY_URL,
  homepageUrl: "https://www.penaddict.com/",
  author: "Kimberly Lau",
  publishedAt: "2025-06-20",
  summary:
    "Kimberly Lau 在 2024 SF Pen Show 向 Kirk Speer 全价购买 Black Chocolate Orange／Fine；约 0.5 ml、dozen flights 无 burp、Fine feel、60／90 mm、posting 与 hand-fit 均限于该样品。",
  locator:
    "lines 904-978: author, Black Chocolate Orange/Fine identity, ~0.5 ml, dozen flights/no burp, Fine feel, 60/90 mm, posting/hand-fit, full-price 2024 SF Pen Show disclosure and 2025-06-20 post date",
});

const diagram: CuratedSource = {
  key: "phase119-wancher-puchico-boundary-svg",
  registryKey: "fountain-pen-graph-editorial-phase119",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase119",
  title: "Wancher PuChiCo model／variants／sample-scope boundary",
  url: SVG_PATH,
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  summary:
    "本站原创 factual SVG；区分 official model／11-color snapshot 与 2024 supplied、2025 self-purchased samples。",
  allowedUse: "store_full",
  license: "site-original",
  archiveUrl: SVG_PATH,
  archiveLocator: `project-public-asset:${SVG_PATH};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
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

export const phase119WancherPuchicoPack: CuratedEntityPack = {
  key: "phase119-wancher-puchico-v1",
  entityId: PHASE119_PUCHICO_ID,
  expectedType: "pen",
  expectedSlug: PHASE119_PUCHICO_SLUG,
  canonicalName: "Wancher PuChiCo",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-puchico-phase119.md",
  storyTitle: "Wancher PuChiCo：一个 65 mm 型号，十一种颜色与两支样品",
  primarySourceKey: official.key,
  depthTier: "A",
  aliases: [
    { alias: "PuChiCo", language: "en", sourceKey: official.key },
    { alias: "Wancher PuChico", language: "en", sourceKey: official.key },
  ],
  sources: [official, sarah, kimberly, diagram],
  scopes: [
    {
      key: PHASE119_OFFICIAL_SCOPE,
      scopeKey: PHASE119_OFFICIAL_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Official collection: normal-sized iridium-point stainless-steel nib; retrieved filters show EF/F, availability mutable.",
      materialScope:
        "Official collection: acrylic resin made through acrylic shavings/cutting process.",
      editionScope:
        "One PuChiCo model, 65 mm capped-before-posting, cap posts for use, eyedropper; exact eleven pen-card colors at retrieval; price, stock and availability mutable; Petite Charm Case excluded.",
    },
    {
      key: PHASE119_SARAH_SCOPE,
      scopeKey: PHASE119_SARAH_SCOPE,
      validFrom: "2024-07-25",
      validTo: "2024-07-25",
      productionState: "historical",
      nibScope:
        "Sarah Read 2024 JetPens-supplied review sample: nib feel and construction observations are sample-only.",
      materialScope:
        "Single supplied sample: resin machining, threads and clip observations do not qualify all current colors.",
      editionScope:
        "JetPens provided the sample at no charge; 6.5 cm, ~0.5 ml, weeks without leak, comfort and $33 belong only to Sarah Read's reviewed sample.",
    },
    {
      key: PHASE119_KIMBERLY_SCOPE,
      scopeKey: PHASE119_KIMBERLY_SCOPE,
      validFrom: "2025-06-20",
      validTo: "2025-06-20",
      productionState: "historical",
      nibScope:
        "Kimberly Lau's self-purchased Black Chocolate Orange/Fine sample: Fine feel and comparisons are sample-only.",
      materialScope:
        "Black Chocolate Orange sample color and no observed posting marks are sample-only, not color/durability guarantees.",
      editionScope:
        "Paid full price to Kirk Speer at the 2024 SF Pen Show; ~0.5 ml, dozen flights/no burp, 60/90 mm, posting security, hand-fit and price observations are sample-only.",
    },
  ],
  claims: [
    {
      key: "phase119-official-model-structure",
      predicate: "current_model_identity_and_structure",
      objectText:
        "2026-07-22 official collection supports one Wancher PuChiCo: acrylic cutting, 65 mm capped-before-posting, cap posting, eyedropper and a normal-sized iridium-point stainless-steel nib.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: official.key,
      locator: "collection descriptions and Specifications lines 921-964",
      evidence: [
        {
          key: "phase119-official-structure-citation",
          sourceKey: official.key,
          scopeKey: PHASE119_OFFICIAL_SCOPE,
          locator:
            "acrylic shavings/cutting; 65 mm before cap posting; eyedropper; iridium-point stainless-steel nib",
        },
      ],
    },
    {
      key: "phase119-official-variant-snapshot",
      predicate: "retrieved_color_variant_snapshot",
      objectText:
        "The collection shows exactly eleven PuChiCo pen-card colors at retrieval; three Petite Charm Case cards are accessories, while price, stock and availability remain mutable.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: official.key,
      locator: "collection product grid lines 739-920",
      evidence: [
        {
          key: "phase119-official-variants-citation",
          sourceKey: official.key,
          scopeKey: PHASE119_OFFICIAL_SCOPE,
          locator:
            "eleven PuChiCo pen cards followed by Mocha Beige, Duck Blue and Pink Blossom Petite Charm Case cards",
        },
      ],
    },
    {
      key: "phase119-sarah-supplied-sample",
      predicate: "professional_supplied_sample_observation",
      objectText:
        "Sarah Read's 2024 JetPens-supplied sample carries ~0.5 ml, weeks-without-leak, nib/construction, comfort and review-price observations; none is a line-wide current guarantee.",
      factClass: "core",
      confidence: 0.97,
      sourceKey: sarah.key,
      locator: "Sarah Read article lines 906-921 and no-charge disclosure",
      evidence: [
        {
          key: "phase119-sarah-sample-citation",
          sourceKey: sarah.key,
          scopeKey: PHASE119_SARAH_SCOPE,
          locator:
            "Sarah Read; 2024-07-25; JetPens provided at no charge; sample capacity, leak, nib, construction, comfort and price",
        },
      ],
    },
    {
      key: "phase119-kimberly-self-purchased-sample",
      predicate: "professional_self_purchased_sample_observation",
      objectText:
        "Kimberly Lau's self-purchased Black Chocolate Orange/Fine sample carries ~0.5 ml, dozen-flights/no-burp, Fine feel, 60/90 mm, posting, hand-fit, price, color and durability observations only.",
      factClass: "core",
      confidence: 0.97,
      sourceKey: kimberly.key,
      locator: "Kimberly Lau article lines 904-978 and full-price disclosure",
      evidence: [
        {
          key: "phase119-kimberly-sample-citation",
          sourceKey: kimberly.key,
          scopeKey: PHASE119_KIMBERLY_SCOPE,
          locator:
            "Kimberly Lau; 2025-06-20; full-price Kirk Speer/2024 SF Pen Show purchase; Black Chocolate Orange/Fine sample observations",
        },
      ],
    },
  ],
  variants: PHASE119_VARIANT_NAMES.map((name) => ({
    key: `phase119-color-${name.toLowerCase().replaceAll(" ", "-")}`,
    name,
    releaseYear: "2026-07-22 collection snapshot",
    notes:
      "Official PuChiCo pen-card color at retrieval; availability, price and stock are mutable. This is a color variant of one canonical pen, not an entity.",
    sourceKey: official.key,
    variantKind: "color" as const,
  })),
  spec: {
    brandEntityId: PHASE119_WANCHER_ID,
    values: {
      series_name: "Wancher PuChiCo",
      release_year: "official collection verified 2026-07-22; launch year not asserted",
      nib: "normal-sized iridium-point stainless-steel nib",
      fill_system: "Eyedropper filling",
      material: "Acrylic resin; acrylic shavings/cutting process",
      dimensions: "65 mm capped-before-posting; cap posts for use",
      status: "official collection snapshot retrieved 2026-07-22",
    },
    evidence: [
      evidence("brand_entity_id", "phase119-spec-brand", official.key, PHASE119_OFFICIAL_SCOPE, "official Wancher collection and locked brand identity"),
      evidence("series_name", "phase119-spec-series", official.key, PHASE119_OFFICIAL_SCOPE, "Collection: PuChiCo"),
      evidence("release_year", "phase119-spec-time", official.key, PHASE119_OFFICIAL_SCOPE, "retrieved 2026-07-22; retrieval is not launch year"),
      evidence("nib", "phase119-spec-nib", official.key, PHASE119_OFFICIAL_SCOPE, "normal-sized iridium-point stainless-steel nib"),
      evidence("fill_system", "phase119-spec-fill", official.key, PHASE119_OFFICIAL_SCOPE, "eyedropper filling"),
      evidence("material", "phase119-spec-material", official.key, PHASE119_OFFICIAL_SCOPE, "acrylic resin and acrylic cutting"),
      evidence("dimensions", "phase119-spec-dimensions", official.key, PHASE119_OFFICIAL_SCOPE, "65 mm before cap posting; posted use"),
      evidence("status", "phase119-spec-status", official.key, PHASE119_OFFICIAL_SCOPE, "retrieved collection; mutable commerce fields excluded"),
      evidence("dimensions", "phase119-sarah-capacity-rejected", sarah.key, PHASE119_SARAH_SCOPE, "~0.5 ml sample capacity rejected as line-wide stable spec", false),
      evidence("status", "phase119-sarah-leak-rejected", sarah.key, PHASE119_SARAH_SCOPE, "weeks without leak belongs only to supplied sample", false),
      evidence("nib", "phase119-sarah-nib-feel-rejected", sarah.key, PHASE119_SARAH_SCOPE, "sample nib feel and construction rejected as line-wide guarantee", false),
      evidence("dimensions", "phase119-sarah-comfort-rejected", sarah.key, PHASE119_SARAH_SCOPE, "sample comfort/hand fit rejected as line-wide spec", false),
      evidence("price_range", "phase119-sarah-price-rejected", sarah.key, PHASE119_SARAH_SCOPE, "JetPens review price rejected as current stable price", false),
      evidence("dimensions", "phase119-kimberly-capacity-rejected", kimberly.key, PHASE119_KIMBERLY_SCOPE, "~0.5 ml sample capacity rejected as line-wide stable spec", false),
      evidence("status", "phase119-kimberly-flight-burp-rejected", kimberly.key, PHASE119_KIMBERLY_SCOPE, "dozen flights without burp/leak belongs only to self-purchased sample", false),
      evidence("nib", "phase119-kimberly-nib-feel-rejected", kimberly.key, PHASE119_KIMBERLY_SCOPE, "Fine sample nib feel rejected as line-wide/EF guarantee", false),
      evidence("dimensions", "phase119-kimberly-posting-rejected", kimberly.key, PHASE119_KIMBERLY_SCOPE, "60/90 mm, posting security and hand comfort rejected as current stable dimensions", false),
      evidence("material", "phase119-kimberly-color-durability-rejected", kimberly.key, PHASE119_KIMBERLY_SCOPE, "Black Chocolate Orange sample color and observed durability rejected as all-color proof", false),
      evidence("price_range", "phase119-kimberly-price-rejected", kimberly.key, PHASE119_KIMBERLY_SCOPE, "sample purchase/retailer price rejected as current stable price", false),
    ],
  },
  timeline: [
    {
      key: "phase119-sarah-review-2024",
      title: "Sarah Read reviews a JetPens-supplied PuChiCo sample",
      eventType: "community_event",
      startDate: "2024-07-25",
      circa: false,
      description: "Professional supplied-sample observations remain sample-only.",
      sourceKey: sarah.key,
    },
    {
      key: "phase119-kimberly-review-2025",
      title: "Kimberly Lau reviews her self-purchased Black Chocolate Orange/Fine",
      eventType: "community_event",
      startDate: "2025-06-20",
      circa: false,
      description: "Professional self-purchased-sample observations remain sample-only.",
      sourceKey: kimberly.key,
    },
    {
      key: "phase119-official-window-2026",
      title: "Official PuChiCo collection verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description: "Official model facts and exact eleven-color snapshot verified.",
      sourceKey: official.key,
    },
  ],
  media: [
    {
      key: "phase119-puchico-primary",
      title: "Wancher PuChiCo model／variants／sample boundary（非产品照片）",
      sourceKey: diagram.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创 factual SVG；非产品照片、logo、比例、色准、饰面、价格或库存证明。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary",
    },
  ],
};

export function loadPhase119WancherPuchicoPack(
  workspaceRoot: string,
): LoadedCuratedEntityPack {
  const loaded = loadCuratedEntityPack(
    workspaceRoot,
    phase119WancherPuchicoPack,
  );
  if (Array.from(loaded.bodyMd).length < 2_000) {
    throw new Error("Phase 119 body_md must contain at least 2,000 Unicode characters.");
  }
  return loaded;
}
