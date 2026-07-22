import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE99_CONKLIN_BRAND_ID,
  PHASE99_GLIDER_ID,
  PHASE99_NOZAC_ID,
} from "./phase99-conklin-historic";

export const PHASE136_CONKLIN_BRAND_ID = PHASE99_CONKLIN_BRAND_ID;
export const PHASE136_NOZAC_ID = PHASE99_NOZAC_ID;
export const PHASE136_GLIDER_ID = PHASE99_GLIDER_ID;
export const PHASE136_DURAGRAPH_ID = "phase136-pen-conklin-duragraph";
export const PHASE136_DURAGRAPH_SLUG = "conklin-duragraph";
export const PHASE136_MADE_BY_ID = "phase136-duragraph-made-by-conklin";
export const PHASE136_REVERSE_ID = `rev-${PHASE136_MADE_BY_ID}`;

export const PHASE136_CURRENT_URL = "https://conklinpens.com/pages/duragraph";
export const PHASE136_COLLECTION_URL =
  "https://conklinpens.com/collections/duragraph";
export const PHASE136_ABALONE_URL =
  "https://conklinpens.com/products/conklin-duragraph-abalone-nights-fountain-pen";
export const PHASE136_RED_URL =
  "https://conklinpens.com/products/conklin-duragraph-red-nights-fountain-pen";
export const PHASE136_METAL_URL =
  "https://conklinpens.com/products/conklin-duragraph-metal-pvd-brass-fountain-pen";
export const PHASE136_HISTORY_URL = "https://conklinpens.com/pages/about-us";
export const PHASE136_TGS_URL =
  "https://www.gentlemanstationer.com/blog/2018/2/21/pen-review-conklin-duragraph";
export const PHASE136_WAD_URL =
  "https://www.wellappointeddesk.com/2014/12/review-conklin-duragraph-cracked-ice-fountain-pen-f-nib/";
export const PHASE136_SVG =
  "/images/library/site-original/phase136/conklin/conklin-duragraph.svg";

export const PHASE136_CURRENT_SCOPE = "phase136-duragraph-current-2026-07-22";
export const PHASE136_TGS_SCOPE = "phase136-duragraph-cracked-ice-stub-2018";
export const PHASE136_WAD_SCOPE = "phase136-duragraph-cracked-ice-fine-2014";

const RETRIEVED = "2026-07-22";

function web(
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

const official = {
  registryKey: "conklin-official-phase136",
  registryName: "Conklin official",
  sourceType: "official" as const,
  tier: "primary" as const,
  independenceGroup: "conklin-official",
  homepageUrl: "https://conklinpens.com/",
  author: "Conklin",
};

export const PHASE136_SOURCES = {
  current: web({
    ...official,
    key: "phase136-conklin-duragraph-current",
    title: "Duragraph Collection",
    url: PHASE136_CURRENT_URL,
    summary:
      "2026-07-22 current family page: fountain/ballpoint boundary, 5.5/4.75/6.85/0.55-inch dimensions, international C/C, included converter and German JoWo stainless-steel EF/F/M/B/Stub/Flex.",
    locator:
      "Available Writing Modes, Colors, Specs, JoWo Stainless Steel Nib and Filling System sections",
  }),
  collection: web({
    ...official,
    key: "phase136-conklin-duragraph-collection",
    title: "Duragraph",
    url: PHASE136_COLLECTION_URL,
    summary:
      "Current collection navigation lists ten finish labels and distinguishes fountain pens from ballpoints; price, stock and availability are mutable and excluded.",
    locator:
      "collection introduction, current color list and product grid retrieved 2026-07-22",
  }),
  abalone: web({
    ...official,
    key: "phase136-conklin-duragraph-abalone",
    title: "Conklin Duragraph Abalone Nights Fountain Pen",
    url: PHASE136_ABALONE_URL,
    summary:
      "Exact current CK71297 page identifies an iridescent resin body, chrome trims, JoWo stainless steel, EF/F/M/B/Stub/Omniflex and standard international C/C.",
    locator: "exact title, SKU, Description, nib selector and Details & Features",
    limitation: "exact-sku-only;commercial-fields-excluded",
  }),
  red: web({
    ...official,
    key: "phase136-conklin-duragraph-red",
    title: "Conklin Duragraph Red Nights Fountain Pen",
    url: PHASE136_RED_URL,
    summary:
      "Exact current CK71387 page identifies a handcrafted resin body and threaded included converter; retained as a second resin-SKU example.",
    locator: "exact title, SKU, resin body and threaded converter description",
    limitation: "exact-sku-only;commercial-fields-excluded",
  }),
  metal: web({
    ...official,
    key: "phase136-conklin-duragraph-metal-pvd-brass",
    title: "Conklin Duragraph Metal PVD Brass Fountain Pen",
    url: PHASE136_METAL_URL,
    summary:
      "Exact current CK72002 page describes a PVD-coated metal body and JoWo C/C configuration, proving that current Duragraph material is SKU-dependent rather than universally resin.",
    locator: "exact title, SKU and PVD-coated metal body description",
    limitation: "exact-sku-only;weight-not-published",
  }),
  history: web({
    ...official,
    key: "phase136-conklin-brand-history",
    title: "About The Brand",
    url: PHASE136_HISTORY_URL,
    summary:
      "Official history separates the historical company from the modern Yafa-era revival; current Duragraph components must not be projected into the 1923 pen.",
    locator: "brand chronology and modern revival sections",
  }),
  tgs: web({
    key: "phase136-tgs-duragraph-review",
    registryKey: "gentleman-stationer-phase136",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "gentleman-stationer",
    homepageUrl: "https://www.gentlemanstationer.com/",
    author: "Joe Crace",
    publishedAt: "2018-02-21",
    title: "Pen Review: Conklin Duragraph",
    url: PHASE136_TGS_URL,
    summary:
      "Independent review of a self-purchased discounted Cracked Ice with stainless stub: unposted handling, long posted balance and nib observations remain sample-specific.",
    locator:
      "dated title, purchase disclosure, Cracked Ice/stub description, unposted grip and posted-length observations",
    limitation: "single-cracked-ice-stub-sample;subjective-observations",
  }),
  wad: web({
    key: "phase136-wad-duragraph-review",
    registryKey: "well-appointed-desk-phase136",
    registryName: "The Well-Appointed Desk",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "well-appointed-desk",
    homepageUrl: "https://www.wellappointeddesk.com/",
    author: "Ana Reinert",
    publishedAt: "2014-12-08",
    title: "Review: Conklin Duragraph Cracked Ice Fountain Pen (F Nib)",
    url: PHASE136_WAD_URL,
    summary:
      "Independent dated review of one Cracked Ice Fine: standard cartridges/converter, about 26 g filled capped, 15 g uncapped, five-inch unposted and near-seven-inch posted measurements are sample-only.",
    locator:
      "exact reviewed finish/nib, included converter, weights, measurements and writing observations",
    limitation: "single-2014-cracked-ice-fine-sample;not-current-universal-spec",
  }),
  diagram: {
    key: "phase136-conklin-duragraph-svg",
    registryKey: "fountain-pen-graph-editorial-phase136",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase136",
    title: "Conklin Duragraph current/SKU/review boundary",
    url: PHASE136_SVG,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "Site-original factual SVG separating current family specs, exact SKU material and dated review samples; non-photo and non-logo.",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: PHASE136_SVG,
    archiveLocator: `project-public-asset:${PHASE136_SVG};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;material-proof=false;dimensions=1600x900`,
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

const finishes = [
  "Metal Blue",
  "Metal Brass",
  "Forest Green",
  "Abalone Nights",
  "Amber",
  "Cracked Ice",
  "Ice Blue",
  "Purple Nights",
  "Orange Nights",
  "Red Nights",
] as const;

export const phase136ConklinDuragraphPack: CuratedEntityPack = {
  key: "phase136-conklin-duragraph-v1",
  entityId: PHASE136_DURAGRAPH_ID,
  expectedType: "pen",
  expectedSlug: PHASE136_DURAGRAPH_SLUG,
  canonicalName: "Conklin Duragraph",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/conklin-duragraph-phase136.md",
  storyTitle: "Conklin Duragraph：当前家族、具体材质与旧评测样笔分开读",
  primarySourceKey: PHASE136_SOURCES.current.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Conklin Duragraph Fountain Pen",
      language: "en",
      sourceKey: PHASE136_SOURCES.current.key,
    },
    {
      alias: "Duragraph",
      language: "en",
      sourceKey: PHASE136_SOURCES.collection.key,
    },
    {
      alias: "康克林 Duragraph",
      language: "zh",
      sourceKey: PHASE136_SOURCES.current.key,
    },
  ],
  sources: Object.values(PHASE136_SOURCES),
  scopes: [
    {
      key: PHASE136_CURRENT_SCOPE,
      scopeKey: PHASE136_CURRENT_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Current family: German-made JoWo stainless steel, EF/F/M/B/Stub/Flex; exact pages may label Flex as Omniflex, so order-level naming must be checked.",
      materialScope:
        "SKU-dependent: current exact resin examples include Abalone Nights and Red Nights; Metal PVD Brass is a PVD-coated metal-body example. No universal material or weight is asserted.",
      editionScope:
        "Modern fountain-pen family only: 5.5 in capped, 4.75 in uncapped, 6.85 in posted, 0.55 in diameter and international C/C. Ballpoints, special editions, price and stock excluded.",
    },
    {
      key: PHASE136_TGS_SCOPE,
      scopeKey: PHASE136_TGS_SCOPE,
      validFrom: "2018-02-21",
      validTo: "2018-02-21",
      productionState: "historical",
      nibScope:
        "One self-purchased discounted Cracked Ice stainless stub; edge feel, flow and line variation are sample/paper/ink specific.",
      materialScope: "One Cracked Ice acrylic sample described in 2018.",
      editionScope:
        "Unposted comfort and excessive posted length are the reviewer's handling observations, not universal ergonomic promises.",
    },
    {
      key: PHASE136_WAD_SCOPE,
      scopeKey: PHASE136_WAD_SCOPE,
      validFrom: "2014-12-08",
      validTo: "2014-12-08",
      productionState: "historical",
      nibScope:
        "One Cracked Ice Fine sample; smoothness and slight italic-like sharpness are subjective and not current nib-QC evidence.",
      materialScope: "One Cracked Ice sample with steel nib and converter.",
      editionScope:
        "About 26 g filled/capped, 15 g uncapped, five inches unposted and near seven inches posted belong only to the reviewed sample.",
    },
  ],
  claims: [
    {
      key: "phase136-duragraph-modern-identity",
      predicate: "modern_model_identity",
      objectText:
        "The current Duragraph fountain pen is a modern revived flat-top C/C family and remains separate from historical Nozac, Glider, ballpoint and special-edition products.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: PHASE136_SOURCES.current.key,
      locator: "current writing modes/specs compared with official brand chronology",
      evidence: [
        {
          key: "phase136-identity-current",
          sourceKey: PHASE136_SOURCES.current.key,
          scopeKey: PHASE136_CURRENT_SCOPE,
          locator: "current fountain-pen family and modern updates",
        },
        {
          key: "phase136-identity-history",
          sourceKey: PHASE136_SOURCES.history.key,
          scopeKey: PHASE136_CURRENT_SCOPE,
          locator: "historical company and modern revival boundary",
        },
      ],
    },
    {
      key: "phase136-duragraph-current-specs",
      predicate: "current_family_configuration",
      objectText:
        "Current family page supports 5.5/4.75/6.85/0.55-inch dimensions, international cartridge/converter and German JoWo stainless-steel EF/F/M/B/Stub/Flex.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: PHASE136_SOURCES.current.key,
      locator: "Specs, JoWo Stainless Steel Nib and Filling System sections",
      evidence: [
        {
          key: "phase136-current-specs-citation",
          sourceKey: PHASE136_SOURCES.current.key,
          scopeKey: PHASE136_CURRENT_SCOPE,
          locator: "four dimension fields, nib menu and international C/C",
        },
      ],
    },
    {
      key: "phase136-duragraph-material-boundary",
      predicate: "sku_material_boundary",
      objectText:
        "Current Duragraph material is SKU-dependent: Abalone Nights and Red Nights are exact resin examples, while Metal PVD Brass is an exact PVD-coated metal-body example.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: PHASE136_SOURCES.abalone.key,
      locator: "three exact official product descriptions",
      evidence: [
        {
          key: "phase136-material-abalone",
          sourceKey: PHASE136_SOURCES.abalone.key,
          scopeKey: PHASE136_CURRENT_SCOPE,
          locator: "CK71297 iridescent resin body",
        },
        {
          key: "phase136-material-red",
          sourceKey: PHASE136_SOURCES.red.key,
          scopeKey: PHASE136_CURRENT_SCOPE,
          locator: "CK71387 handcrafted resin body",
        },
        {
          key: "phase136-material-metal",
          sourceKey: PHASE136_SOURCES.metal.key,
          scopeKey: PHASE136_CURRENT_SCOPE,
          locator: "CK72002 PVD-coated metal body",
        },
      ],
    },
    {
      key: "phase136-duragraph-finish-navigation",
      predicate: "current_finish_navigation",
      objectText:
        "The current collection lists ten finish labels; they remain market-SKU variants rather than cloned base-model entities, and commercial availability is mutable.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: PHASE136_SOURCES.collection.key,
      locator: "current collection color list and product grid",
      evidence: [
        {
          key: "phase136-finish-list-citation",
          sourceKey: PHASE136_SOURCES.collection.key,
          scopeKey: PHASE136_CURRENT_SCOPE,
          locator: "ten current finish labels",
        },
      ],
    },
    {
      key: "phase136-duragraph-tgs-sample",
      predicate: "dated_professional_stub_sample",
      objectText:
        "The 2018 Gentleman Stationer review covers one Cracked Ice stainless stub; unposted grip, long posted balance and writing observations stay sample-specific.",
      factClass: "core",
      confidence: 0.97,
      sourceKey: PHASE136_SOURCES.tgs.key,
      locator: "purchase disclosure, reviewed finish/nib and handling sections",
      evidence: [
        {
          key: "phase136-tgs-sample-citation",
          sourceKey: PHASE136_SOURCES.tgs.key,
          scopeKey: PHASE136_TGS_SCOPE,
          locator: "single Cracked Ice stub sample and subjective observations",
        },
      ],
    },
    {
      key: "phase136-duragraph-wad-sample",
      predicate: "dated_professional_fine_sample",
      objectText:
        "The 2014 Well-Appointed Desk review covers one Cracked Ice Fine; its 26/15 g weights, five/seven-inch measurements and nib feel do not become current family specs.",
      factClass: "core",
      confidence: 0.97,
      sourceKey: PHASE136_SOURCES.wad.key,
      locator: "reviewed finish/nib, weights, measurements and writing sample",
      evidence: [
        {
          key: "phase136-wad-sample-citation",
          sourceKey: PHASE136_SOURCES.wad.key,
          scopeKey: PHASE136_WAD_SCOPE,
          locator: "single 2014 Cracked Ice Fine sample",
        },
      ],
    },
  ],
  variants: finishes.map((name) => ({
    key: `phase136-duragraph-${name.toLowerCase().replaceAll(" ", "-")}`,
    name,
    notes:
      "Current official finish label; exact material, fountain-pen availability, nib menu, price and stock must be checked on the product page.",
    sourceKey: PHASE136_SOURCES.collection.key,
    variantKind: "market_sku",
  })),
  spec: {
    brandEntityId: PHASE136_CONKLIN_BRAND_ID,
    values: {
      series_name: "Conklin Duragraph",
      release_year:
        "historical name first introduced in 1923; this page covers the modern revived family verified 2026-07-22",
      origin_country:
        "modern Conklin/Yafa product; JoWo stainless-steel nib made in Germany; final pen manufacturing country not asserted",
      nib: "current family: German-made JoWo stainless steel; EF, F, M, B, Stub and Flex/Omniflex naming by exact SKU",
      fill_system:
        "international cartridge or converter; current family page says converter included",
      material:
        "SKU-dependent: current resin and PVD-coated metal-body examples both exist",
      dimensions:
        "current family page: 5.5 in capped, 4.75 in uncapped, 6.85 in posted, 0.55 in diameter",
      status:
        "current modern family verified 2026-07-22; exact finish availability, price and stock are mutable",
    },
    evidence: [
      evidence(
        "brand_entity_id",
        "phase136-spec-brand",
        PHASE136_SOURCES.history.key,
        PHASE136_CURRENT_SCOPE,
        "official Conklin identity and modern-revival boundary",
      ),
      evidence(
        "series_name",
        "phase136-spec-series",
        PHASE136_SOURCES.current.key,
        PHASE136_CURRENT_SCOPE,
        "current family title",
      ),
      evidence(
        "release_year",
        "phase136-spec-release",
        PHASE136_SOURCES.current.key,
        PHASE136_CURRENT_SCOPE,
        "official 1923 heritage claim explicitly qualified as modern revived family",
      ),
      evidence(
        "origin_country",
        "phase136-spec-origin",
        PHASE136_SOURCES.current.key,
        PHASE136_CURRENT_SCOPE,
        "German-made JoWo nib only; no final-assembly inference",
      ),
      evidence(
        "nib",
        "phase136-spec-nib",
        PHASE136_SOURCES.current.key,
        PHASE136_CURRENT_SCOPE,
        "current JoWo stainless-steel nib menu",
      ),
      evidence(
        "fill_system",
        "phase136-spec-fill",
        PHASE136_SOURCES.current.key,
        PHASE136_CURRENT_SCOPE,
        "international cartridge/converter and included converter",
      ),
      evidence(
        "material",
        "phase136-spec-material-resin",
        PHASE136_SOURCES.abalone.key,
        PHASE136_CURRENT_SCOPE,
        "exact current resin SKU example",
      ),
      evidence(
        "material",
        "phase136-spec-material-metal",
        PHASE136_SOURCES.metal.key,
        PHASE136_CURRENT_SCOPE,
        "exact current PVD-coated metal-body SKU example",
      ),
      evidence(
        "dimensions",
        "phase136-spec-dimensions",
        PHASE136_SOURCES.current.key,
        PHASE136_CURRENT_SCOPE,
        "current family four dimension fields",
      ),
      evidence(
        "weight",
        "phase136-spec-wad-weight-rejected",
        PHASE136_SOURCES.wad.key,
        PHASE136_WAD_SCOPE,
        "26 g filled/capped and 15 g uncapped belong to one 2014 sample",
        false,
      ),
      evidence(
        "dimensions",
        "phase136-spec-wad-dimensions-rejected",
        PHASE136_SOURCES.wad.key,
        PHASE136_WAD_SCOPE,
        "five-inch unposted and near-seven-inch posted belong to one 2014 sample",
        false,
      ),
      evidence(
        "nib",
        "phase136-spec-tgs-nib-rejected",
        PHASE136_SOURCES.tgs.key,
        PHASE136_TGS_SCOPE,
        "stub feel and flow remain sample-specific",
        false,
      ),
      evidence(
        "status",
        "phase136-spec-status",
        PHASE136_SOURCES.collection.key,
        PHASE136_CURRENT_SCOPE,
        "current collection retrieved 2026-07-22; commercial state excluded",
      ),
    ],
  },
  conflicts: [
    {
      key: "phase136-duragraph-family-material",
      fieldKey: "material",
      scopeKey: PHASE136_CURRENT_SCOPE,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Resolved by SKU qualification: exact resin and PVD-metal pages are both current, so the base material field remains SKU-dependent rather than choosing one universal material.",
      members: [
        {
          citationKey: "phase136-spec-material-resin",
          assertedValue: "Abalone Nights exact SKU: resin body",
        },
        {
          citationKey: "phase136-spec-material-metal",
          assertedValue: "Metal PVD Brass exact SKU: PVD-coated metal body",
        },
      ],
    },
  ],
  timeline: [
    {
      key: "phase136-duragraph-name-1923",
      title: "Duragraph historical name introduced",
      eventType: "model_released",
      startDate: "1923",
      circa: false,
      description:
        "Official current narrative dates the historical name to 1923; modern JoWo/C/C specifications are not projected backward.",
      sourceKey: PHASE136_SOURCES.current.key,
    },
    {
      key: "phase136-duragraph-current-window",
      title: "Modern Duragraph current family verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Current dimensions, C/C, nib menu, finish navigation and SKU-dependent material boundary verified; retrieval is not a relaunch date.",
      sourceKey: PHASE136_SOURCES.collection.key,
    },
  ],
  media: [
    {
      key: "phase136-duragraph-primary",
      title: "Conklin Duragraph current／SKU／review 事实边界图（非产品照片）",
      sourceKey: PHASE136_SOURCES.diagram.key,
      localPath: PHASE136_SVG,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片、非 logo、非比例、非色准、非材质或笔尖实物证明。",
      sourceUrl: PHASE136_SVG,
      usageStatus: "primary",
    },
  ],
};

export function loadPhase136ConklinDuragraphPack(
  workspaceRoot: string,
): LoadedCuratedEntityPack {
  const loaded = loadCuratedEntityPack(
    workspaceRoot,
    phase136ConklinDuragraphPack,
  );
  if (Array.from(loaded.bodyMd).length < 2_000)
    throw new Error("Phase 136 body_md must contain at least 2,000 Unicode characters.");
  return loaded;
}
