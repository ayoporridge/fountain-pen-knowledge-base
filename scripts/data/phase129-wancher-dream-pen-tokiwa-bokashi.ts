import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE129_WANCHER_ID = "eOfD77nOeENN";
export const PHASE129_DREAM_ARTICLE_ID = "2aoD07lwSYCV";
export const PHASE129_TOKIWA_ID = "phase129-wancher-dream-pen-tokiwa-iro";
export const PHASE129_TOKIWA_SLUG = "wancher-dream-pen-tokiwa-iro";
export const PHASE129_BOKASHI_ID = "phase129-wancher-dream-pen-bokashi-lunar-eclipse";
export const PHASE129_BOKASHI_SLUG = "wancher-dream-pen-bokashi-urushi-lunar-eclipse";
export const PHASE129_TARGET_IDS = [PHASE129_TOKIWA_ID, PHASE129_BOKASHI_ID] as const;
export const PHASE129_TARGET_SLUGS = [PHASE129_TOKIWA_SLUG, PHASE129_BOKASHI_SLUG] as const;
export const PHASE129_MADE_BY_IDS = PHASE129_TARGET_IDS.map((id) => `phase129-made-by-${id}`);
export const PHASE129_REVERSE_IDS = PHASE129_MADE_BY_IDS.map((id) => `rev-${id}`);

const RETRIEVED = "2026-07-22";
const COLLECTION_URL = "https://www.wancherpen.com/collections/dream-pen";
const TOKIWA_URL = "https://www.wancherpen.com/products/dream-pen-tokiwa-iro";
const BOKASHI_URL = "https://www.wancherpen.com/products/bokashi-urushi-lunar-eclipse";
const PRODUCTION_URL = "https://www.pencilcaseblog.com/2019/08/revisiting-wancher-dream-pen-urushi.html";
const TOKIWA_SVG = "/images/library/site-original/phase129/wancher/wancher-dream-pen-tokiwa-iro.svg";
const BOKASHI_SVG = "/images/library/site-original/phase129/wancher/wancher-dream-pen-bokashi-lunar-eclipse.svg";

function webSource(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"> & { locator: string }): CuratedSource {
  const { locator, ...source } = input;
  return {
    ...source,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: source.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}`,
  };
}

const collection = webSource({
  key: "phase129-wancher-dream-pen-collection",
  registryKey: "wancher-official-phase129",
  registryName: "Wancher official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official",
  title: "Dream Pen Fountain Pen Collection",
  url: COLLECTION_URL,
  homepageUrl: "https://www.wancherpen.com/",
  summary: "Official collection establishes the Dream Pen family context; mutable cards are not treated as one model.",
  locator: "Dream Pen heading, Japanese craft context and mutable product-card grid",
});

const tokiwaOfficial = webSource({
  key: "phase129-wancher-tokiwa-exact",
  registryKey: "wancher-official-phase129",
  registryName: "Wancher official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official",
  title: "Dream Pen - Tokiwa-iro",
  url: TOKIWA_URL,
  homepageUrl: "https://www.wancherpen.com/",
  summary: "Exact page supports Wancher first-ten-year commemoration, 30-piece limit, Aomori Tsugaru Urushi Kara-nuri/Midori-age, three-to-six-month process and current configuration menu.",
  locator: "product heading; anniversary and 30-piece statement; Tsugaru Urushi section; Specifications and Packaging",
});

const bokashiOfficial = webSource({
  key: "phase129-wancher-bokashi-lunar-exact",
  registryKey: "wancher-official-phase129",
  registryName: "Wancher official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official",
  title: "Bokashi Urushi - Lunar Eclipse",
  url: BOKASHI_URL,
  homepageUrl: "https://www.wancherpen.com/",
  summary: "Exact page supports Wajima Bokashi-nuri, natural red/black urushi gradation, handmade variation, four named colour designs, ebonite construction and current configuration menu.",
  locator: "product heading; Bokashi-nuri and Wajima paragraphs; Specifications, Packaging and dated unavailable state",
});

const production = webSource({
  key: "phase129-pencilcaseblog-production-followup-2019",
  registryKey: "pencilcaseblog-phase129",
  registryName: "The Pencil Case Blog",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pencilcaseblog-production-samples-2019",
  title: "Revisiting the Wancher Dream Pen Urushi Fountain Pen",
  url: PRODUCTION_URL,
  homepageUrl: "https://www.pencilcaseblog.com/",
  author: "Dries De Schepper",
  publishedAt: "2019-08-28",
  summary: "Follow-up after five months with purchased Shu and Aka-Tamenuri production pens; those disclosed samples are family context and exclude both Phase 129 exact finishes.",
  locator: "production-sample disclosure, five-month use and Shu/Aka-Tamenuri identities; no Tokiwa-iro or Bokashi Lunar Eclipse sample",
});

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase129",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase129",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "Site-original factual SVG showing exact product and evidence boundaries without copying a product photograph or logo.",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900`,
  };
}

const tokiwaDiagram = diagram("phase129-wancher-tokiwa-svg", "Tokiwa-iro exact identity and configuration boundary", TOKIWA_SVG);
const bokashiDiagram = diagram("phase129-wancher-bokashi-svg", "Bokashi Lunar Eclipse exact variant boundary", BOKASHI_SVG);

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string, qualifies = true) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

const tokiwaCurrent = "phase129-tokiwa-current-2026-07-22";
const bokashiCurrent = "phase129-bokashi-current-2026-07-22";
const familySamples = "phase129-dream-pen-production-samples-2019-08-28";

export const phase129WancherPacks: CuratedEntityPack[] = [
  {
    key: "phase129-wancher-dream-pen-tokiwa-iro-v1",
    entityId: PHASE129_TOKIWA_ID,
    expectedType: "pen",
    expectedSlug: PHASE129_TOKIWA_SLUG,
    canonicalName: "Wancher Dream Pen Tokiwa-iro",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/wancher-dream-pen-tokiwa-iro-phase129.md",
    storyTitle: "Wancher Tokiwa-iro：十周年、30支与津轻漆绿色层次",
    primarySourceKey: tokiwaOfficial.key,
    depthTier: "A",
    aliases: [
      { alias: "Dream Pen - Tokiwa-iro", language: "en", sourceKey: tokiwaOfficial.key },
      { alias: "Wancher Tokiwa-iro", language: "en", sourceKey: tokiwaOfficial.key },
      { alias: "Wancher 常磐色 Dream Pen", language: "zh", sourceKey: tokiwaOfficial.key },
    ],
    sources: [tokiwaOfficial, collection, production, tokiwaDiagram],
    scopes: [
      {
        key: tokiwaCurrent,
        scopeKey: tokiwaCurrent,
        market: "Wancher international exact page",
        validFrom: RETRIEVED,
        productionState: "historical",
        nibScope: "#6 JoWo stainless steel or Wancher 18K gold; feed and nib must be verified per pen.",
        materialScope: "Ebonite and urushi; Aomori Tsugaru Urushi with Kara-nuri and Midori-age.",
        editionScope: "Wancher first-ten-year commemorative edition limited to 30 pieces; commerce state remains mutable.",
      },
      {
        key: familySamples,
        scopeKey: familySamples,
        market: "professional Dream Pen production samples",
        validFrom: "2019-08-28",
        validTo: "2019-08-28",
        productionState: "historical",
        editionScope: "Purchased Shu and Aka-Tamenuri production samples; not Tokiwa-iro and not evidence for its finish, configuration or feel.",
      },
    ],
    claims: [
      {
        key: "phase129-tokiwa-exact-identity",
        predicate: "exact_product_identity",
        objectText: "Dream Pen Tokiwa-iro is Wancher's first-ten-year 30-piece commemorative SKU, made in Aomori with Tsugaru Urushi Kara-nuri/Midori-age over ebonite.",
        factClass: "core",
        confidence: 0.99,
        sourceKey: tokiwaOfficial.key,
        locator: tokiwaOfficial.archiveLocator ?? tokiwaOfficial.summary,
        evidence: [{ key: "phase129-tokiwa-exact-citation", sourceKey: tokiwaOfficial.key, scopeKey: tokiwaCurrent, locator: "anniversary, limited quantity, craft and specifications" }],
      },
      {
        key: "phase129-tokiwa-sample-exclusion",
        predicate: "professional_sample_exclusion",
        objectText: "The 2019 professional follow-up covers purchased Shu and Aka-Tamenuri production samples, not Tokiwa-iro, so its finish and writing observations cannot qualify this exact SKU.",
        factClass: "core",
        confidence: 0.98,
        sourceKey: production.key,
        locator: production.archiveLocator ?? production.summary,
        evidence: [{ key: "phase129-tokiwa-sample-exclusion-citation", sourceKey: production.key, scopeKey: familySamples, locator: "Shu and Aka-Tamenuri sample identities exclude Tokiwa-iro" }],
      },
    ],
    variants: [],
    spec: {
      brandEntityId: PHASE129_WANCHER_ID,
      values: {
        series_name: "Wancher Dream Pen Tokiwa-iro",
        origin_country: "Handcrafted by Tsugaru Urushi artisans in Aomori, Japan",
        nib: "#6 JoWo stainless steel or Wancher 18K gold",
        fill_system: "European International Standard cartridge or converter",
        material: "Ebonite and Urushi; Tsugaru Urushi Kara-nuri / Midori-age",
        status: "Wancher first-ten-year commemorative edition limited to 30 pieces; exact page checked 2026-07-22",
      },
      evidence: [
        evidence("brand_entity_id", "phase129-tokiwa-brand", tokiwaOfficial.key, tokiwaCurrent, "Wancher exact product page"),
        evidence("series_name", "phase129-tokiwa-series", tokiwaOfficial.key, tokiwaCurrent, "Dream Pen - Tokiwa-iro exact heading"),
        evidence("origin_country", "phase129-tokiwa-origin", tokiwaOfficial.key, tokiwaCurrent, "Tsugaru Urushi artisans in Aomori, Japan"),
        evidence("nib", "phase129-tokiwa-nib", tokiwaOfficial.key, tokiwaCurrent, "#6 JoWo stainless steel or Wancher 18K gold"),
        evidence("fill_system", "phase129-tokiwa-fill", tokiwaOfficial.key, tokiwaCurrent, "European International cartridge/converter"),
        evidence("material", "phase129-tokiwa-material", tokiwaOfficial.key, tokiwaCurrent, "Ebonite, Urushi; Tsugaru Urushi Midori-age"),
        evidence("status", "phase129-tokiwa-status", tokiwaOfficial.key, tokiwaCurrent, "ten-year commemoration and 30-piece limit; dated page state"),
      ],
    },
    timeline: [
      { key: "phase129-tokiwa-anniversary", title: "Tokiwa-iro created for Wancher's first ten-year milestone", eventType: "design_milestone", startDate: "2021", circa: true, description: "Official page ties the 30-piece Tokiwa-iro edition to Wancher's first ten years after its 2011 original-product focus.", sourceKey: tokiwaOfficial.key },
      { key: "phase129-tokiwa-check", title: "Tokiwa-iro exact page checked", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Exact identity, craft and current configuration fields checked; commerce state remains mutable.", sourceKey: tokiwaOfficial.key },
    ],
    media: [{ key: "phase129-tokiwa-primary", title: "Tokiwa-iro exact product and evidence boundary（非产品照片）", sourceKey: tokiwaDiagram.key, localPath: TOKIWA_SVG, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "site-original factual SVG；non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof。", sourceUrl: TOKIWA_SVG, usageStatus: "primary" }],
  },
  {
    key: "phase129-wancher-bokashi-lunar-eclipse-v1",
    entityId: PHASE129_BOKASHI_ID,
    expectedType: "pen",
    expectedSlug: PHASE129_BOKASHI_SLUG,
    canonicalName: "Wancher Dream Pen Bokashi Urushi Lunar Eclipse",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/wancher-dream-pen-bokashi-lunar-eclipse-phase129.md",
    storyTitle: "Wancher Lunar Eclipse：轮岛 Bokashi 红黑渐变与配色边界",
    primarySourceKey: bokashiOfficial.key,
    depthTier: "A",
    aliases: [
      { alias: "Bokashi Urushi - Lunar Eclipse", language: "en", sourceKey: bokashiOfficial.key },
      { alias: "Dream Pen Bokashi Lunar Eclipse", language: "en", sourceKey: bokashiOfficial.key },
      { alias: "Wancher 暈し塗 Lunar Eclipse", language: "zh", sourceKey: bokashiOfficial.key },
    ],
    sources: [bokashiOfficial, collection, production, bokashiDiagram],
    scopes: [
      {
        key: bokashiCurrent,
        scopeKey: bokashiCurrent,
        market: "Wancher international exact page",
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope: "#6 JoWo stainless steel or Wancher 18K gold; feed and nib must be verified per pen.",
        materialScope: "Ebonite with natural red and black urushi in Wajima Bokashi-nuri gradation; handmade variation expected.",
        editionScope: "Lunar Eclipse exact colour design only; Sunset, Sunrise and Solar Eclipse are excluded; sold-out is dated.",
      },
      {
        key: familySamples,
        scopeKey: familySamples,
        market: "professional Dream Pen production samples",
        validFrom: "2019-08-28",
        validTo: "2019-08-28",
        productionState: "historical",
        editionScope: "Purchased Shu and Aka-Tamenuri production samples; not Bokashi Lunar Eclipse and not evidence for its finish, configuration or feel.",
      },
    ],
    claims: [
      {
        key: "phase129-bokashi-exact-identity",
        predicate: "exact_product_identity",
        objectText: "Bokashi Urushi Lunar Eclipse is one exact Wajima-made ebonite/urushi SKU using natural red and black lacquer in a hand-applied gradation.",
        factClass: "core",
        confidence: 0.99,
        sourceKey: bokashiOfficial.key,
        locator: bokashiOfficial.archiveLocator ?? bokashiOfficial.summary,
        evidence: [{ key: "phase129-bokashi-exact-citation", sourceKey: bokashiOfficial.key, scopeKey: bokashiCurrent, locator: "exact heading, Bokashi-nuri explanation, Wajima statement and specifications" }],
      },
      {
        key: "phase129-bokashi-variant-boundary",
        predicate: "variant_boundary",
        objectText: "Lunar Eclipse is distinct from the Sunset, Sunrise and Solar Eclipse Bokashi designs named on the official page.",
        factClass: "core",
        confidence: 0.99,
        sourceKey: bokashiOfficial.key,
        locator: bokashiOfficial.archiveLocator ?? bokashiOfficial.summary,
        evidence: [{ key: "phase129-bokashi-variant-citation", sourceKey: bokashiOfficial.key, scopeKey: bokashiCurrent, locator: "four named Bokashi designs; exact page title is Lunar Eclipse" }],
      },
      {
        key: "phase129-bokashi-sample-exclusion",
        predicate: "professional_sample_exclusion",
        objectText: "The 2019 professional follow-up covers purchased Shu and Aka-Tamenuri production samples, not Bokashi Lunar Eclipse, so its finish and writing observations cannot qualify this exact SKU.",
        factClass: "core",
        confidence: 0.98,
        sourceKey: production.key,
        locator: production.archiveLocator ?? production.summary,
        evidence: [{ key: "phase129-bokashi-sample-exclusion-citation", sourceKey: production.key, scopeKey: familySamples, locator: "Shu and Aka-Tamenuri sample identities exclude Bokashi Lunar Eclipse" }],
      },
    ],
    variants: [],
    spec: {
      brandEntityId: PHASE129_WANCHER_ID,
      values: {
        series_name: "Wancher Dream Pen Bokashi Urushi Lunar Eclipse",
        origin_country: "Handcrafted in Wajima, Japan",
        nib: "#6 JoWo stainless steel or Wancher 18K gold",
        fill_system: "European International Standard cartridge or converter",
        material: "Ebonite with natural red and black Urushi; Bokashi-nuri gradation",
        status: "Unavailable on exact page checked 2026-07-22; permanent retirement not asserted",
      },
      evidence: [
        evidence("brand_entity_id", "phase129-bokashi-brand", bokashiOfficial.key, bokashiCurrent, "Wancher exact product page"),
        evidence("series_name", "phase129-bokashi-series", bokashiOfficial.key, bokashiCurrent, "Bokashi Urushi - Lunar Eclipse exact heading"),
        evidence("origin_country", "phase129-bokashi-origin", bokashiOfficial.key, bokashiCurrent, "Handcrafted in Wajima, Japan"),
        evidence("nib", "phase129-bokashi-nib", bokashiOfficial.key, bokashiCurrent, "#6 JoWo stainless steel or Wancher 18K gold"),
        evidence("fill_system", "phase129-bokashi-fill", bokashiOfficial.key, bokashiCurrent, "European International cartridge/converter"),
        evidence("material", "phase129-bokashi-material", bokashiOfficial.key, bokashiCurrent, "Ebonite, natural red/black Urushi and Bokashi gradation"),
        evidence("status", "phase129-bokashi-status", bokashiOfficial.key, bokashiCurrent, "dated unavailable snapshot; no permanent retirement inference"),
      ],
    },
    timeline: [{ key: "phase129-bokashi-check", title: "Lunar Eclipse exact page checked unavailable", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Dated commerce snapshot; exact craft, variant and configuration fields remain documented.", sourceKey: bokashiOfficial.key }],
    media: [{ key: "phase129-bokashi-primary", title: "Bokashi Lunar Eclipse exact variant boundary（非产品照片）", sourceKey: bokashiDiagram.key, localPath: BOKASHI_SVG, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "site-original factual SVG；non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof。", sourceUrl: BOKASHI_SVG, usageStatus: "primary" }],
  },
];

export function loadPhase129WancherPacks(workspaceRoot: string): LoadedCuratedEntityPack[] {
  const packs = phase129WancherPacks.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  for (const pack of packs) {
    if (Array.from(pack.summary).length < 60 || Array.from(pack.summary).length > 160)
      throw new Error("Phase 129 summary must contain 60-160 Unicode characters.");
    if (Array.from(pack.bodyMd).length < 2_000)
      throw new Error("Phase 129 body_md must contain at least 2,000 Unicode characters.");
  }
  return packs;
}
