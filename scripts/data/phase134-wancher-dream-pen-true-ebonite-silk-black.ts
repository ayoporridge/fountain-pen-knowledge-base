import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE107_DREAM_ARTICLE_ID,
  PHASE107_TRUE_EBONITE_ID,
  PHASE107_WANCHER_ID,
} from "./phase107-wancher-dream-pen-true-ebonite-matte-black";

export const PHASE134_WANCHER_ID = PHASE107_WANCHER_ID;
export const PHASE134_DREAM_ARTICLE_ID = PHASE107_DREAM_ARTICLE_ID;
export const PHASE134_MATTE_BLACK_ID = PHASE107_TRUE_EBONITE_ID;
export const PHASE134_SILK_BLACK_ID =
  "phase134-wancher-true-ebonite-silk-black";
export const PHASE134_SILK_BLACK_SLUG =
  "wancher-dream-pen-true-ebonite-silk-black";
export const PHASE134_MADE_BY_ID = "phase134-silk-black-made-by-wancher";
export const PHASE134_REVERSE_ID = `rev-${PHASE134_MADE_BY_ID}`;
export const PHASE134_OFFICIAL_URL =
  "https://www.wancherpen.com/products/true-ebonite-silk-black";
export const PHASE134_AS_IS_URL =
  "https://www.wancherpen.com/products/true-ebonite-silk-black-as-is-sale-1";
export const PHASE134_REVIEW_URL =
  "https://www.pencilcaseblog.com/2018/10/review-wancher-dream-pen-true-ebonite.html";

const RETRIEVED = "2026-07-22";
const CURRENT_SCOPE = "phase134-silk-black-current-listing-2026-07-22";
const SAMPLE_SCOPE = "phase134-silk-black-2018-supplied-sample";
const AS_IS_SCOPE = "phase134-silk-black-as-is-listing-2026-07-22";
const SVG =
  "/images/library/site-original/phase134/wancher/dream-pen-true-ebonite-silk-black.svg";

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

const officialBase = {
  registryKey: "wancher-official-phase134",
  registryName: "Wancher official",
  sourceType: "official" as const,
  tier: "primary" as const,
  independenceGroup: "wancher-official",
  homepageUrl: "https://www.wancherpen.com/",
  author: "Wancher",
};

const current = web({
  ...officialBase,
  key: "phase134-wancher-silk-black-current",
  title: "True Ebonite - Silk Black",
  url: PHASE134_OFFICIAL_URL,
  summary:
    "2026-07-22 exact normal listing：Kanto repeated polishing、ebonite、European International cartridge/converter、current nib/feed/clip menu；availability only a dated snapshot.",
  locator:
    "exact title; Kanto craftsmen and repeated-polishing description; material, filling, nib, feed, compact air-tight cap, handmade variation and clip option menu",
});

const trueEboniteCollection = web({
  ...officialBase,
  key: "phase134-wancher-true-ebonite-collection",
  title: "True Ebonite Collection",
  url: "https://www.wancherpen.com/collections/true-ebonite/true-ebonite",
  summary:
    "Official collection lists Silk Black and Matte Black as sibling True Ebonite products rather than aliases or one shared finish.",
  locator:
    "True Ebonite collection title and product grid containing separate Silk Black and Matte Black entries",
});

const dreamCollection = web({
  ...officialBase,
  key: "phase134-wancher-dream-pen-collection",
  title: "Dream Pen Fountain Pen Collection",
  url: "https://www.wancherpen.com/collections/dream-pen",
  summary:
    "Official collection establishes Dream Pen as a broad material/craft family; exact Silk Black specifications remain on the product page.",
  locator:
    "Dream Pen collection title, product grid and multi-material family context",
});

const matte = web({
  ...officialBase,
  key: "phase134-wancher-matte-black-comparison",
  title: "Dream Pen True Ebonite Fountain Pen - Matte Black",
  url: "https://www.wancherpen.com/products/true-ebonite-matte-black",
  summary:
    "Official sibling page states Japanese Ebonite and Matte Sandblast Treatment, proving that Matte Black finish must not be copied into Silk Black.",
  locator:
    "exact Matte Black title and Specifications material/art line: Japanese Ebonite, Matte Sandblast Treatment",
});

const asIs = web({
  ...officialBase,
  key: "phase134-wancher-silk-black-as-is",
  title: "True Ebonite Silk Black AS IS sale",
  url: PHASE134_AS_IS_URL,
  summary:
    "Exact AS IS listing shows item-specific nicks, scrapes and bright-LED black/streak variation, different pictured pens and special return boundaries; none are normal-model features.",
  locator:
    "AS IS defect examples, different pictured items, bright LED inspection note, return/exchange limitation and service statement; option menu excluded from current normal specification",
});

const review = web({
  key: "phase134-pencilcase-true-ebonite-review-2018",
  registryKey: "pencilcaseblog-wancher-phase134",
  registryName: "The Pencilcase Blog",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pencilcaseblog",
  homepageUrl: "https://www.pencilcaseblog.com/",
  author: "Dries De Schepper",
  title: "Review: Wancher Dream Pen True Ebonite Fountain Pen",
  url: PHASE134_REVIEW_URL,
  publishedAt: "2018-10-31",
  summary:
    "Professional review of one Wancher-supplied polished black, clipless sample with block threads, non-posting body, steel JoWo fine and FNF ebonite feed; disclosure and sample scope retained.",
  locator:
    "Wancher-supplied sample statement; polished finish, clipless/non-posting shape, block threads and slip seal, steel JoWo fine plus FNF ebonite feed, closing supplied-product/no-affiliate disclosure",
});

const diagram: CuratedSource = {
  key: "phase134-wancher-silk-black-svg",
  registryKey: "fountain-pen-graph-editorial-phase134",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase134",
  title: "Wancher Silk Black current / 2018 sample / AS IS boundary",
  url: SVG,
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  summary:
    "Site-original factual SVG separating the current exact SKU, one supplied review sample and AS IS defect inventory; non-photo and non-finish replica.",
  allowedUse: "store_full",
  license: "site-original",
  archiveUrl: SVG,
  archiveLocator: `project-public-asset:${SVG};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900`,
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

export const phase134WancherDreamPenTrueEboniteSilkBlackPack: CuratedEntityPack = {
  key: "phase134-wancher-dream-pen-true-ebonite-silk-black-v1",
  entityId: PHASE134_SILK_BLACK_ID,
  expectedType: "pen",
  expectedSlug: PHASE134_SILK_BLACK_SLUG,
  canonicalName: "Wancher Dream Pen True Ebonite Silk Black",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/wancher-dream-pen-true-ebonite-silk-black-phase134.md",
  storyTitle:
    "Wancher True Ebonite Silk Black：当前抛光款、2018 样笔与 AS IS 边界",
  primarySourceKey: current.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Dream Pen True Ebonite Silk Black",
      language: "en",
      sourceKey: current.key,
    },
    {
      alias: "True Ebonite - Silk Black",
      language: "en",
      sourceKey: current.key,
    },
    {
      alias: "Wancher True Ebonite Silk Black",
      language: "en",
      sourceKey: current.key,
    },
  ],
  sources: [
    current,
    trueEboniteCollection,
    dreamCollection,
    matte,
    asIs,
    review,
    diagram,
  ],
  scopes: [
    {
      key: CURRENT_SCOPE,
      scopeKey: CURRENT_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Current normal listing: #6 JoWo stainless steel, Wancher 18K gold or Shogun 18K; feed menu is plastic, black ebonite or red ebonite.",
      materialScope:
        "Ebonite with Kanto repeated-polishing Silk Black finish; handmade thickness/finial variation allowed, exact colour and gloss not inferred.",
      editionScope:
        "European International cartridge/converter; clipless, chrome-plated clip and gold-plated clip menu; option availability is only a 2026-07-22 snapshot.",
    },
    {
      key: SAMPLE_SCOPE,
      scopeKey: SAMPLE_SCOPE,
      validFrom: "2018-10-31",
      validTo: "2018-10-31",
      productionState: "historical",
      nibScope:
        "One Wancher-supplied sample: steel JoWo fine nib with Flexible Nib Factory ebonite feed; not a current default.",
      materialScope:
        "One highly polished black ebonite, clipless sample; long/chunky tapered cigar-shape and non-posting are reviewer observations.",
      editionScope:
        "Block threads, slip seal, occasional cross-thread tendency and personal writing/dry-out observations belong only to the disclosed supplied sample; prototype-linked measurements are not adopted.",
    },
    {
      key: AS_IS_SCOPE,
      scopeKey: AS_IS_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "AS IS option menu is inventory-specific and rejected as the current normal-product nib specification.",
      materialScope:
        "Item-specific nicks, scrapes and bright-LED black/streak variation; these are defects/inspection examples, not standard Silk Black traits.",
      editionScope:
        "AS IS sale items have pictured-piece and return/service boundaries that must be checked per listing and exact pen.",
    },
  ],
  claims: [
    {
      key: "phase134-silk-black-exact-sibling-identity",
      predicate: "model_identity_and_sibling_boundary",
      objectText:
        "Silk Black and Matte Black are separate True Ebonite sibling products: Silk Black uses repeated polishing, while Matte Black explicitly uses matte sandblast treatment.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: current.key,
      locator: "exact Silk Black listing compared with official collection and exact Matte Black listing",
      evidence: [
        {
          key: "phase134-silk-identity-current",
          sourceKey: current.key,
          scopeKey: CURRENT_SCOPE,
          locator: "exact title and repeated-polishing description",
        },
        {
          key: "phase134-silk-identity-collection",
          sourceKey: trueEboniteCollection.key,
          scopeKey: CURRENT_SCOPE,
          locator: "separate sibling product entries",
        },
        {
          key: "phase134-silk-identity-matte",
          sourceKey: matte.key,
          scopeKey: CURRENT_SCOPE,
          locator: "Matte Black exact title and matte sandblast specification",
        },
      ],
    },
    {
      key: "phase134-silk-current-configuration",
      predicate: "current_configuration",
      objectText:
        "Current normal Silk Black listing uses ebonite, European International cartridge/converter and a dated nib/feed/clip option menu; compact air-tight cap remains an official design claim.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: current.key,
      locator: "current exact Specifications, option menu and cap description",
      evidence: [
        {
          key: "phase134-current-config-citation",
          sourceKey: current.key,
          scopeKey: CURRENT_SCOPE,
          locator:
            "material, filling, nib, feed, clip and compact air-tight cap fields retrieved 2026-07-22",
        },
      ],
    },
    {
      key: "phase134-silk-handmade-variation",
      predicate: "handmade_variation_boundary",
      objectText:
        "Official listing allows small handmade thickness and cap-finial variation; this does not establish a fixed colour, gloss level or defect tolerance.",
      factClass: "editorial",
      confidence: 0.98,
      sourceKey: current.key,
      locator: "handcraft variation statement and repeated-polishing description",
      evidence: [
        {
          key: "phase134-handmade-citation",
          sourceKey: current.key,
          scopeKey: CURRENT_SCOPE,
          locator: "handmade thickness and cap-finial variation statement",
        },
      ],
    },
    {
      key: "phase134-silk-clip-stock-snapshot",
      predicate: "dated_option_availability",
      objectText:
        "Clipless, chrome-plated and gold-plated clip are configuration variants; chrome/gold unavailability is only the 2026-07-22 page snapshot and not a permanent identity claim.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: current.key,
      locator: "clip option menu and availability state retrieved 2026-07-22",
      evidence: [
        {
          key: "phase134-clip-snapshot-citation",
          sourceKey: current.key,
          scopeKey: CURRENT_SCOPE,
          locator: "without clip, chrome-plating clip and gold-plating clip option states",
        },
      ],
    },
    {
      key: "phase134-silk-sample-boundary",
      predicate: "dated_supplied_sample_observation",
      objectText:
        "The 2018 professional review covers one supplied polished, clipless, non-posting sample with steel JoWo fine and FNF ebonite feed; structure and writing impressions remain sample-only.",
      factClass: "core",
      confidence: 0.96,
      sourceKey: review.key,
      locator: "sample source disclosure, finish/body/threads/seal/nib/feed observations and no-affiliate disclosure",
      evidence: [
        {
          key: "phase134-sample-review-citation",
          sourceKey: review.key,
          scopeKey: SAMPLE_SCOPE,
          locator:
            "polished clipless supplied sample, block threads/slip seal, steel JoWo fine, FNF ebonite feed and personal experience",
        },
      ],
    },
    {
      key: "phase134-silk-as-is-boundary",
      predicate: "as_is_purchase_boundary",
      objectText:
        "AS IS listing defect examples and special return conditions apply only to item-specific defect inventory and must not be generalized as standard Silk Black product characteristics.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: asIs.key,
      locator: "item-specific defect examples, pictured pieces and AS IS return/service terms",
      evidence: [
        {
          key: "phase134-as-is-citation",
          sourceKey: asIs.key,
          scopeKey: AS_IS_SCOPE,
          locator: "nicks, scrapes, LED-visible variation, different pictured pieces and return boundary",
        },
      ],
    },
  ],
  variants: [
    {
      key: "phase134-silk-black-clipless",
      name: "Without Clip",
      releaseYear: "2026-07-22 listing snapshot",
      notes:
        "Current normal-listing variant; exact order configuration and future availability must be checked.",
      sourceKey: current.key,
      variantKind: "market_sku",
    },
    {
      key: "phase134-silk-black-chrome-clip",
      name: "Chrome-plating Clip",
      releaseYear: "2026-07-22 listing snapshot",
      notes:
        "Current menu variant shown unavailable at retrieval; unavailability is not permanent status.",
      sourceKey: current.key,
      variantKind: "market_sku",
    },
    {
      key: "phase134-silk-black-gold-clip",
      name: "Gold-plating Clip",
      releaseYear: "2026-07-22 listing snapshot",
      notes:
        "Current menu variant shown unavailable at retrieval; unavailability is not permanent status.",
      sourceKey: current.key,
      variantKind: "market_sku",
    },
  ],
  spec: {
    brandEntityId: PHASE134_WANCHER_ID,
    values: {
      series_name: "Wancher Dream Pen True Ebonite Silk Black",
      release_year:
        "current listing verified 2026-07-22; launch year not asserted",
      origin_country:
        "Wancher current listing: Japanese/premium ebonite with Kanto repeated-polishing finish; component origins not generalized",
      nib: "current listing: #6 JoWo stainless steel, Wancher 18K gold or Shogun 18K; actual order configuration must be checked",
      fill_system: "European International Standard cartridge or converter",
      material: "ebonite; Silk Black repeated-polishing finish",
      status:
        "current official listing verified 2026-07-22; clip-option availability is a dated snapshot",
    },
    evidence: [
      evidence(
        "brand_entity_id",
        "phase134-spec-brand",
        current.key,
        CURRENT_SCOPE,
        "exact Wancher listing and locked published brand identity",
      ),
      evidence(
        "series_name",
        "phase134-spec-series",
        current.key,
        CURRENT_SCOPE,
        "exact current product title",
      ),
      evidence(
        "release_year",
        "phase134-spec-time",
        current.key,
        CURRENT_SCOPE,
        "retrieved 2026-07-22; retrieval is not launch year",
      ),
      evidence(
        "origin_country",
        "phase134-spec-origin",
        current.key,
        CURRENT_SCOPE,
        "Japanese/premium ebonite and Kanto repeated-polishing product description; component origins not inferred",
      ),
      evidence(
        "nib",
        "phase134-spec-current-nib",
        current.key,
        CURRENT_SCOPE,
        "current normal listing nib menu",
      ),
      evidence(
        "nib",
        "phase134-spec-sample-nib-rejected",
        review.key,
        SAMPLE_SCOPE,
        "2018 steel JoWo fine plus FNF ebonite feed sample; rejected as current default",
        false,
      ),
      evidence(
        "nib",
        "phase134-spec-as-is-menu-rejected",
        asIs.key,
        AS_IS_SCOPE,
        "AS IS inventory option menu; rejected as current normal-product menu",
        false,
      ),
      evidence(
        "fill_system",
        "phase134-spec-fill",
        current.key,
        CURRENT_SCOPE,
        "European International Standard converter or cartridge",
      ),
      evidence(
        "material",
        "phase134-spec-material",
        current.key,
        CURRENT_SCOPE,
        "ebonite and repeated-polishing Silk Black finish",
      ),
      evidence(
        "material",
        "phase134-spec-matte-rejected",
        matte.key,
        CURRENT_SCOPE,
        "Matte Black sibling uses matte sandblast; rejected for Silk Black",
        false,
      ),
      evidence(
        "dimensions",
        "phase134-spec-dimensions-unasserted",
        review.key,
        SAMPLE_SCOPE,
        "review redirects exact dimensions to a sibling True Urushi prototype; rejected",
        false,
      ),
      evidence(
        "weight",
        "phase134-spec-weight-unasserted",
        review.key,
        SAMPLE_SCOPE,
        "review redirects exact weight to a sibling True Urushi prototype; rejected",
        false,
      ),
      evidence(
        "status",
        "phase134-spec-status",
        current.key,
        CURRENT_SCOPE,
        "current exact listing verified 2026-07-22; clip availability remains dated",
      ),
    ],
  },
  conflicts: [
    {
      key: "phase134-silk-versus-matte-finish-conflict",
      fieldKey: "material",
      scopeKey: CURRENT_SCOPE,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Resolved by exact-SKU non-merging: Silk Black retains repeated polishing, Matte Black remains a protected sibling with matte sandblast treatment.",
      members: [
        {
          citationKey: "phase134-spec-material",
          assertedValue: "Silk Black: ebonite with repeated-polishing finish",
        },
        {
          citationKey: "phase134-spec-matte-rejected",
          assertedValue:
            "Matte Black sibling: Japanese ebonite with matte sandblast treatment",
        },
      ],
    },
  ],
  timeline: [
    {
      key: "phase134-silk-black-reviewed-sample-2018",
      title: "Pencilcase Blog records a supplied polished sample",
      eventType: "community_event",
      startDate: "2018-10-31",
      circa: false,
      description:
        "Clipless/non-posting body, block threads, slip seal and steel JoWo fine plus FNF ebonite feed remain one disclosed supplied-sample record.",
      sourceKey: review.key,
    },
    {
      key: "phase134-silk-black-current-window",
      title: "Current normal Silk Black listing verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Repeated-polishing finish, European International filling and current nib/feed/clip menu verified; retrieval is not a launch date.",
      sourceKey: current.key,
    },
    {
      key: "phase134-silk-black-as-is-window",
      title: "AS IS purchase boundary verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Item-specific defect and service terms retained only for AS IS purchase inspection, not normal-product identity.",
      sourceKey: asIs.key,
    },
  ],
  media: [
    {
      key: "phase134-silk-black-primary",
      title:
        "Wancher Silk Black current／2018 sample／AS IS 事实边界图（非产品照片）",
      sourceKey: diagram.key,
      localPath: SVG,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片；非比例、颜色、硬橡胶表面、笔夹、笔尖、feed、包装或商标复刻。",
      sourceUrl: SVG,
      usageStatus: "primary",
    },
  ],
};

export function loadPhase134WancherDreamPenTrueEboniteSilkBlackPack(
  workspaceRoot: string,
): LoadedCuratedEntityPack {
  const loaded = loadCuratedEntityPack(
    workspaceRoot,
    phase134WancherDreamPenTrueEboniteSilkBlackPack,
  );
  if (Array.from(loaded.bodyMd).length < 2_000)
    throw new Error(
      "Phase 134 body_md must contain at least 2,000 Unicode characters.",
    );
  return loaded;
}
