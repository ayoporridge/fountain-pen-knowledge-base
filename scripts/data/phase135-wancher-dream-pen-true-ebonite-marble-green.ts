import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE134_DREAM_ARTICLE_ID,
  PHASE134_MATTE_BLACK_ID,
  PHASE134_SILK_BLACK_ID,
  PHASE134_WANCHER_ID,
} from "./phase134-wancher-dream-pen-true-ebonite-silk-black";

export const PHASE135_WANCHER_ID = PHASE134_WANCHER_ID;
export const PHASE135_DREAM_ARTICLE_ID = PHASE134_DREAM_ARTICLE_ID;
export const PHASE135_MATTE_BLACK_ID = PHASE134_MATTE_BLACK_ID;
export const PHASE135_SILK_BLACK_ID = PHASE134_SILK_BLACK_ID;
export const PHASE135_MARBLE_GREEN_ID =
  "phase135-wancher-true-ebonite-marble-green";
export const PHASE135_MARBLE_GREEN_SLUG =
  "wancher-dream-pen-true-ebonite-marble-green";
export const PHASE135_MADE_BY_ID = "phase135-marble-green-made-by-wancher";
export const PHASE135_REVERSE_ID = `rev-${PHASE135_MADE_BY_ID}`;
export const PHASE135_OFFICIAL_URL =
  "https://www.wancherpen.com/products/true-ebonite-marble-green";
export const PHASE135_PAPER_MOUSE_URL =
  "https://www.thepapermouse.com/products/true-ebonite-fountain-pen-marble-green-dream-pen";
export const PHASE135_TRUPHAE_URL =
  "https://www.truphaeinc.com/products/wancher-dream-pen-true-ebonite-fountain-pen-marble-green";

const RETRIEVED = "2026-07-22";
const CURRENT_SCOPE = "phase135-marble-green-current-2026-07-22";
const FAMILY_SCOPE = "phase135-true-ebonite-family-process";
const RETAIL_SCOPE = "phase135-marble-green-retailer-inventory";
const SVG =
  "/images/library/site-original/phase135/wancher/dream-pen-true-ebonite-marble-green.svg";

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
  registryKey: "wancher-official-phase135",
  registryName: "Wancher official",
  sourceType: "official" as const,
  tier: "primary" as const,
  independenceGroup: "wancher-official",
  homepageUrl: "https://www.wancherpen.com/",
  author: "Wancher",
};

const current = web({
  ...officialBase,
  key: "phase135-wancher-marble-green-current",
  title: "True Ebonite - Marble Green",
  url: PHASE135_OFFICIAL_URL,
  summary:
    "2026-07-22 exact product：ebonite、piece-to-piece pattern variation、European International cartridge/converter、#6 JoWo steel／Wancher 18K、three feed choices and compact air-tight cap claim.",
  locator:
    "exact title; handmade thickness and different ebonite-area pattern notice; material, filling, nib, feed, compact air-tight cap and packaging fields",
});

const dreamCollection = web({
  ...officialBase,
  key: "phase135-wancher-dream-pen-collection",
  title: "Dream Pen Fountain Pen Collection",
  url: "https://www.wancherpen.com/collections/dream-pen",
  summary:
    "Official Dream Pen collection lists Marble Green as a separate product beside Silk Black, Matte Black and other material/craft siblings.",
  locator:
    "Dream Pen family description and product grid containing separate True Ebonite Marble Green, Silk Black and Matte Black entries",
});

const reintro = web({
  ...officialBase,
  key: "phase135-wancher-true-ebonite-reintro",
  title: "Reintro Series - True Ebonite",
  url: "https://www.wancherpen.com/blogs/news/reintro-series-true-ebonite",
  summary:
    "Official family-process article names Japanese/Nikko Ebonite and ASO Kanagawa hand-polishing; retained as True Ebonite family context, not a per-piece component passport.",
  locator:
    "Obtaining the Material, Significance of Polishing Ebonite and Hand Polishing sections naming Nikko Ebonite, ASO Inc. and family-level process",
});

const mine = web({
  ...officialBase,
  key: "phase135-wancher-mine-marble-green-exclusion",
  title: "Wancher Mine - Marble Green",
  url: "https://www.wancherpen.com/products/wancher-mine-marble-green",
  summary:
    "Official similarly named Mine product has a different elevated-top shape and is described as shorter and heavier than Dream Pen True Ebonite; it is an exclusion, not an alias.",
  locator:
    "exact Mine title, Shape and Concept sections; comparison stating shorter barrel and more weight than Dream Pen True Ebonite",
});

const paperMouse = web({
  key: "phase135-paper-mouse-marble-green-inventory",
  registryKey: "paper-mouse-phase135",
  registryName: "The Paper Mouse",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "paper-mouse",
  homepageUrl: "https://www.thepapermouse.com/",
  author: "The Paper Mouse",
  title: "True Ebonite Fountain Pen | Marble Green | Dream Pen Series",
  url: PHASE135_PAPER_MOUSE_URL,
  summary:
    "Exact retailer inventory snapshot lists titanium threads, spring-loaded cap, gold-plated #6 JoWo steel and 6.08/5.28-inch measurements; all stay retailer-scoped and rejected as current universal specs.",
  locator:
    "exact product heading and inventory bullets: titanium threads, spring-loaded cap, gold-plated stainless-steel #6 JoWo, closed and uncapped measurements",
});

const truphae = web({
  key: "phase135-truphae-marble-green-inventory",
  registryKey: "truphae-phase135",
  registryName: "Truphae",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "truphae",
  homepageUrl: "https://www.truphaeinc.com/",
  author: "Truphae",
  title: "Wancher Dream Pen True Ebonite Fountain Pen - Marble Green",
  url: PHASE135_TRUPHAE_URL,
  summary:
    "Exact specialist-retailer entry independently identifies Marble Green and explains that pattern placement/intensity varies with the area of ebonite stock; price and inventory are excluded.",
  locator:
    "exact product title and Character of Ebonite section describing different stock areas and individual Marble Green pattern variation",
});

const stilorso = web({
  key: "phase135-stilorso-marble-green-review",
  registryKey: "stilorso-phase135",
  registryName: "StilOrso",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "stilorso",
  homepageUrl: "https://www.youtube.com/@StilograficheOrso",
  author: "StilOrso",
  title: "Wancher Dream Pen True Ebonite Fountain Pen Review",
  url: "https://www.youtube.com/watch?v=1AkCO4P9inM",
  summary:
    "Independent specialist video embedded by Wancher's exact Marble Green page; YouTube oEmbed supplies title/author and the thumbnail visually identifies a marbled green True Ebonite sample. No untranscribed measurements or experience claims are imported.",
  locator:
    "YouTube oEmbed title/author; official exact Marble Green page review link; video thumbnail showing the marbled green True Ebonite sample; identity use only",
});

const diagram: CuratedSource = {
  key: "phase135-wancher-marble-green-svg",
  registryKey: "fountain-pen-graph-editorial-phase135",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase135",
  title: "Wancher Marble Green current / family / retailer boundary",
  url: SVG,
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  summary:
    "Site-original factual SVG separating current exact configuration, True Ebonite family process and retailer inventory; non-photo and non-pattern replica.",
  allowedUse: "store_full",
  license: "site-original",
  archiveUrl: SVG,
  archiveLocator: `project-public-asset:${SVG};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-pattern-proof=true;dimensions=1600x900`,
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

export const phase135WancherDreamPenTrueEboniteMarbleGreenPack: CuratedEntityPack = {
  key: "phase135-wancher-dream-pen-true-ebonite-marble-green-v1",
  entityId: PHASE135_MARBLE_GREEN_ID,
  expectedType: "pen",
  expectedSlug: PHASE135_MARBLE_GREEN_SLUG,
  canonicalName: "Wancher Dream Pen True Ebonite Marble Green",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/wancher-dream-pen-true-ebonite-marble-green-phase135.md",
  storyTitle:
    "Wancher True Ebonite Marble Green：自然花纹与零售版本不能混成统一规格",
  primarySourceKey: current.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Dream Pen True Ebonite Marble Green",
      language: "en",
      sourceKey: current.key,
    },
    {
      alias: "True Ebonite - Marble Green",
      language: "en",
      sourceKey: current.key,
    },
    {
      alias: "Wancher True Ebonite Marble Green",
      language: "en",
      sourceKey: current.key,
    },
  ],
  sources: [
    current,
    dreamCollection,
    reintro,
    mine,
    paperMouse,
    truphae,
    stilorso,
    diagram,
  ],
  scopes: [
    {
      key: CURRENT_SCOPE,
      scopeKey: CURRENT_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Current exact listing: #6 JoWo stainless steel or Wancher 18K gold; feed menu is plastic, black ebonite or red ebonite.",
      materialScope:
        "Ebonite; components cut from different material areas create piece-to-piece Marble Green pattern variation; exact colour/pattern not guaranteed.",
      editionScope:
        "European International cartridge/converter and compact air-tight cap claim; price, stock, packaging revision and future configuration are mutable.",
    },
    {
      key: FAMILY_SCOPE,
      scopeKey: FAMILY_SCOPE,
      productionState: "current",
      nibScope: "No model-specific nib claim is taken from the family process article.",
      materialScope:
        "Wancher True Ebonite family narrative names Japanese/Nikko Ebonite and ASO Kanagawa hand-polishing; not a component-by-component Marble Green passport.",
      editionScope:
        "Family process context only; does not establish exact SKU dimensions, current options, individual craftspeople or unlimited durability.",
    },
    {
      key: RETAIL_SCOPE,
      scopeKey: RETAIL_SCOPE,
      productionState: "unknown",
      nibScope:
        "The Paper Mouse inventory: gold-plated #6 JoWo stainless-steel nib; exact market/time and compatibility with current menu are not inferred.",
      materialScope:
        "Exact Marble Green retailer identity and pattern variation; titanium-thread wording remains one inventory description.",
      editionScope:
        "Spring-loaded cap and 6.08/5.28-inch fields belong only to the retailer snapshot; Truphae price/stock and Paper Mouse availability remain mutable.",
    },
  ],
  claims: [
    {
      key: "phase135-marble-green-exact-identity",
      predicate: "model_identity_and_sibling_boundary",
      objectText:
        "Marble Green is a separate Dream Pen True Ebonite product beside Silk Black and Matte Black; Marble Blue/Brown and Mine Marble Green are not aliases.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: current.key,
      locator: "exact product title, Dream Pen collection grid and separate Mine product",
      evidence: [
        {
          key: "phase135-identity-current",
          sourceKey: current.key,
          scopeKey: CURRENT_SCOPE,
          locator: "exact True Ebonite - Marble Green title",
        },
        {
          key: "phase135-identity-collection",
          sourceKey: dreamCollection.key,
          scopeKey: CURRENT_SCOPE,
          locator: "separate sibling product entries",
        },
        {
          key: "phase135-identity-mine-exclusion",
          sourceKey: mine.key,
          scopeKey: CURRENT_SCOPE,
          locator: "separate Mine title, shape and Dream Pen comparison",
        },
        {
          key: "phase135-identity-professional-review",
          sourceKey: stilorso.key,
          scopeKey: RETAIL_SCOPE,
          locator:
            "independent video title/author plus exact-page embed and marbled green sample thumbnail; identity only",
        },
      ],
    },
    {
      key: "phase135-marble-green-current-config",
      predicate: "current_configuration",
      objectText:
        "Current exact listing uses ebonite, European International cartridge/converter, #6 JoWo steel or Wancher 18K and three feed choices; compact air-tight cap is an official design claim.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: current.key,
      locator: "exact current material, filling, nib, feed and cap fields",
      evidence: [
        {
          key: "phase135-current-config-citation",
          sourceKey: current.key,
          scopeKey: CURRENT_SCOPE,
          locator: "Specifications and compact air-tight cap sections",
        },
      ],
    },
    {
      key: "phase135-marble-green-piece-pattern",
      predicate: "piece_to_piece_pattern_variation",
      objectText:
        "Different ebonite-stock areas and handmade processing produce different Marble Green pattern placement and intensity; product photography is not a fixed pattern guarantee.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: current.key,
      locator: "official different-material-area notice cross-checked by exact Truphae retailer description",
      evidence: [
        {
          key: "phase135-pattern-official",
          sourceKey: current.key,
          scopeKey: CURRENT_SCOPE,
          locator: "piece-to-piece diverse pattern notice",
        },
        {
          key: "phase135-pattern-retailer",
          sourceKey: truphae.key,
          scopeKey: RETAIL_SCOPE,
          locator: "different ebonite stock areas and individual pattern description",
        },
      ],
    },
    {
      key: "phase135-true-ebonite-family-process",
      predicate: "family_process_context",
      objectText:
        "Wancher names Nikko Ebonite and ASO Kanagawa hand-polishing in its True Ebonite family narrative; this is not a per-piece Marble Green component provenance record.",
      factClass: "editorial",
      confidence: 0.98,
      sourceKey: reintro.key,
      locator: "material and hand-polishing process sections with explicit editorial qualification",
      evidence: [
        {
          key: "phase135-family-process-citation",
          sourceKey: reintro.key,
          scopeKey: FAMILY_SCOPE,
          locator: "Nikko Ebonite and ASO Inc. family-process statements",
          note: "Only family context qualifies; exact component-by-component origin is deliberately not asserted.",
        },
      ],
    },
    {
      key: "phase135-retailer-configuration-boundary",
      predicate: "retailer_inventory_boundary",
      objectText:
        "Paper Mouse titanium threads, spring-loaded cap, gold-plated steel nib and 6.08/5.28-inch fields describe one exact retailer inventory and do not become current universal specs.",
      factClass: "core",
      confidence: 0.94,
      sourceKey: paperMouse.key,
      locator: "exact retailer inventory title, description and bullets",
      evidence: [
        {
          key: "phase135-paper-mouse-inventory-citation",
          sourceKey: paperMouse.key,
          scopeKey: RETAIL_SCOPE,
          locator: "titanium threads, spring-loaded cap, gold-plated steel nib and two measurements",
        },
      ],
    },
    {
      key: "phase135-mine-identity-exclusion",
      predicate: "similar_name_exclusion",
      objectText:
        "Wancher Mine - Marble Green is a different model with an elevated-top Mine shape and an official shorter/heavier comparison against Dream Pen True Ebonite.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: mine.key,
      locator: "Mine exact title, Shape and Concept sections",
      evidence: [
        {
          key: "phase135-mine-exclusion-citation",
          sourceKey: mine.key,
          scopeKey: CURRENT_SCOPE,
          locator: "Mine shape and shorter/heavier comparison",
        },
      ],
    },
  ],
  spec: {
    brandEntityId: PHASE135_WANCHER_ID,
    values: {
      series_name: "Wancher Dream Pen True Ebonite Marble Green",
      release_year:
        "current listing verified 2026-07-22; launch year not asserted",
      origin_country:
        "Wancher True Ebonite family context: Japanese ebonite and Japanese processing narrative; exact component-by-component origin not asserted",
      nib: "current exact listing: #6 JoWo stainless steel or Wancher 18K gold; actual order configuration must be checked",
      fill_system: "European International Standard cartridge or converter",
      material: "ebonite; Marble Green pattern varies from piece to piece",
      status:
        "current official listing verified 2026-07-22; price, stock and retailer configuration remain mutable",
    },
    evidence: [
      evidence(
        "brand_entity_id",
        "phase135-spec-brand",
        current.key,
        CURRENT_SCOPE,
        "exact Wancher product and locked published brand identity",
      ),
      evidence(
        "series_name",
        "phase135-spec-series",
        current.key,
        CURRENT_SCOPE,
        "exact current product title",
      ),
      evidence(
        "release_year",
        "phase135-spec-time",
        current.key,
        CURRENT_SCOPE,
        "retrieved 2026-07-22; retrieval is not launch year",
      ),
      evidence(
        "origin_country",
        "phase135-spec-origin",
        reintro.key,
        FAMILY_SCOPE,
        "qualified True Ebonite family Japanese material/process narrative; no per-piece origin inference",
      ),
      evidence(
        "nib",
        "phase135-spec-current-nib",
        current.key,
        CURRENT_SCOPE,
        "current exact #6 JoWo steel or Wancher 18K menu",
      ),
      evidence(
        "nib",
        "phase135-spec-retailer-nib-rejected",
        paperMouse.key,
        RETAIL_SCOPE,
        "gold-plated steel nib belongs to retailer inventory and is rejected as current universal config",
        false,
      ),
      evidence(
        "fill_system",
        "phase135-spec-fill",
        current.key,
        CURRENT_SCOPE,
        "European International Standard cartridge/converter",
      ),
      evidence(
        "material",
        "phase135-spec-material",
        current.key,
        CURRENT_SCOPE,
        "ebonite and piece-to-piece Marble Green pattern variation",
      ),
      evidence(
        "dimensions",
        "phase135-spec-retailer-dimensions-rejected",
        paperMouse.key,
        RETAIL_SCOPE,
        "6.08/5.28-inch inventory measurements rejected as current stable specs",
        false,
      ),
      evidence(
        "status",
        "phase135-spec-status",
        current.key,
        CURRENT_SCOPE,
        "current exact listing verified 2026-07-22; commercial state excluded",
      ),
    ],
  },
  conflicts: [
    {
      key: "phase135-current-versus-retailer-nib",
      fieldKey: "nib",
      scopeKey: CURRENT_SCOPE,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Resolved by non-merging: current official JoWo steel/Wancher 18K menu remains stable spec; retailer gold-plated steel wording stays inventory-scoped.",
      members: [
        {
          citationKey: "phase135-spec-current-nib",
          assertedValue: "Current official: #6 JoWo steel or Wancher 18K",
        },
        {
          citationKey: "phase135-spec-retailer-nib-rejected",
          assertedValue: "Retail inventory: gold-plated #6 JoWo steel",
        },
      ],
    },
  ],
  timeline: [
    {
      key: "phase135-true-ebonite-process-window",
      title: "Wancher publishes True Ebonite family process context",
      eventType: "design_milestone",
      startDate: "2022",
      circa: true,
      description:
        "Family narrative names Japanese/Nikko Ebonite and ASO hand-polishing; exact publication date and per-piece provenance are not inferred.",
      sourceKey: reintro.key,
    },
    {
      key: "phase135-marble-green-current-window",
      title: "Current Marble Green exact listing verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Current identity, piece-pattern variation, European International filling and nib/feed menu verified; retrieval is not launch date.",
      sourceKey: current.key,
    },
  ],
  media: [
    {
      key: "phase135-marble-green-primary",
      title:
        "Wancher Marble Green current／family／retailer 事实边界图（非产品照片）",
      sourceKey: diagram.key,
      localPath: SVG,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片；非比例、颜色、硬橡胶花纹、笔尖、feed、包装或商标复刻。",
      sourceUrl: SVG,
      usageStatus: "primary",
    },
  ],
};

export function loadPhase135WancherDreamPenTrueEboniteMarbleGreenPack(
  workspaceRoot: string,
): LoadedCuratedEntityPack {
  const loaded = loadCuratedEntityPack(
    workspaceRoot,
    phase135WancherDreamPenTrueEboniteMarbleGreenPack,
  );
  if (Array.from(loaded.bodyMd).length < 2_000)
    throw new Error(
      "Phase 135 body_md must contain at least 2,000 Unicode characters.",
    );
  return loaded;
}
