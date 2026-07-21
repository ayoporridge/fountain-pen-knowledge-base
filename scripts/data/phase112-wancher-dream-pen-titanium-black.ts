import type { CuratedEntityPack, CuratedSource, LoadedCuratedEntityPack, SpecFieldKey } from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE112_WANCHER_ID = "eOfD77nOeENN";
export const PHASE112_DREAM_ARTICLE_ID = "2aoD07lwSYCV";
export const PHASE112_TRUE_EBONITE_ID = "phase107-wancher-true-ebonite-matte-black";
export const PHASE112_TITANIUM_BLACK_ID = "phase112-wancher-dream-pen-titanium-black";
export const PHASE112_TITANIUM_BLACK_SLUG = "wancher-dream-pen-titanium-black";
export const PHASE112_OFFICIAL_URL = "https://www.wancherpen.com/products/dream-pen-titanium-black";
export const PHASE112_REVIEW_URL = "https://kamitopen.jp/fountain-pen/wancher-dream-pen-titan-fountain-pen/";

const RETRIEVED = "2026-07-21";
const CURRENT_SCOPE = "phase112-current-official-listing-2026-07-21";
const SAMPLE_SCOPE = "phase112-kamitopen-2024-reviewed-sample";
const SVG_PATH = "/images/library/site-original/phase112/wancher/wancher-dream-pen-titanium-black.svg";

function webSource(
  input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"> & { locator: string },
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
  key: "phase112-wancher-titanium-black-official",
  registryKey: "wancher-official-phase112",
  registryName: "Wancher official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official",
  title: "Dream Pen Titanium Black",
  url: PHASE112_OFFICIAL_URL,
  homepageUrl: "https://www.wancherpen.com/",
  summary: "2026-07-21 current listing：titanium、black PVD、European International cartridge/converter、#6 JoWo matte-black steel nib、feed options 与当日 sold-out 状态。",
  locator: "product title and current specifications/options: titanium body, black PVD, European International cartridge/converter, #6 JoWo matte-black stainless-steel nib, feed choices; sold out at retrieval",
});

const review = webSource({
  key: "phase112-kamitopen-titanium-review-2024",
  registryKey: "kamitopen-wancher-phase112",
  registryName: "kamitopen",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "kamitopen-2024",
  title: "ワンチャー ドリームペン チタン 万年筆 review",
  url: PHASE112_REVIEW_URL,
  homepageUrl: "https://kamitopen.jp/",
  author: "kamitopen editorial author",
  publishedAt: "2024",
  summary: "2024 dated sample review，披露 affiliate relationship；154 mm、66.4 g、不后插、偏重、个人写感与 apparent original titanium-nib configuration 只属于该样本。",
  locator: "2024 article product measurements and handling sections: 154 mm, 66.4 g, cap not posted, author weight/writing impressions; nib description suggests an original titanium-nib sample; page affiliate disclosure retained",
});

const diagram: CuratedSource = {
  key: "phase112-wancher-titanium-black-boundary-svg",
  registryKey: "fountain-pen-graph-editorial-phase112",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase112",
  title: "Wancher Titanium Black current / 2024 sample 事实边界图",
  url: SVG_PATH,
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  summary: "本站原创双 scope 事实示意图；非产品照片，不复刻商标、比例、颜色或表面。",
  allowedUse: "store_full",
  license: "site-original",
  archiveUrl: SVG_PATH,
  archiveLocator: `project-public-asset:${SVG_PATH};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;finish-replica=false;dimensions=1600x900`,
};

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string, qualifies = true) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

export const phase112WancherDreamPenTitaniumBlackPack: CuratedEntityPack = {
  key: "phase112-wancher-dream-pen-titanium-black-v1",
  entityId: PHASE112_TITANIUM_BLACK_ID,
  expectedType: "pen",
  expectedSlug: PHASE112_TITANIUM_BLACK_SLUG,
  canonicalName: "Wancher Dream Pen Titanium Black",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-dream-pen-titanium-black-phase112.md",
  storyTitle: "Wancher Dream Pen Titanium Black：售罄页面与 2024 样本不能揉成一组规格",
  primarySourceKey: official.key,
  depthTier: "A",
  aliases: [
    { alias: "Dream Pen Titanium Black", language: "en", sourceKey: official.key },
    { alias: "Wancher Titanium Black", language: "en", sourceKey: official.key },
  ],
  sources: [official, review, diagram],
  scopes: [
    {
      key: CURRENT_SCOPE,
      scopeKey: CURRENT_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "2026-07-21 current listing: #6 JoWo matte-black stainless-steel nib and feed options; actual order must be checked.",
      materialScope: "Current exact product: titanium body with black PVD coating.",
      editionScope: "European International cartridge/converter and sold-out snapshot retrieved 2026-07-21; price, stock quantity and future availability are mutable.",
    },
    {
      key: SAMPLE_SCOPE,
      scopeKey: SAMPLE_SCOPE,
      validFrom: "2024",
      validTo: "2024",
      productionState: "historical",
      nibScope: "2024 reviewed sample: apparent original titanium-nib configuration; supplier, exact alloy, width and revision are not inferred.",
      materialScope: "Single reviewed Titanium sample measured 154 mm and 66.4 g; measurements are not current-listing specs.",
      editionScope: "Affiliate relationship disclosed; non-posting, heavy assessment and writing experience are the author's personal sample observations.",
    },
  ],
  claims: [
    {
      key: "phase112-current-identity-and-configuration",
      predicate: "model_identity_and_current_configuration",
      objectText: "2026-07-21 current listing identifies one Wancher Dream Pen Titanium Black with titanium／black PVD body, European International cartridge-converter, #6 JoWo matte-black steel nib and feed options; sold out is only a dated state.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: official.key,
      locator: "exact product title, specifications/options and sold-out state retrieved 2026-07-21",
      evidence: [
        { key: "phase112-current-official-citation", sourceKey: official.key, scopeKey: CURRENT_SCOPE, locator: "title and current material, filling, nib, feed and availability fields" },
      ],
    },
    {
      key: "phase112-sample-boundary",
      predicate: "dated_sample_observation",
      objectText: "kamitopen 的 2024 affiliate-disclosed sample 才承载 154 mm、66.4 g、不后插、偏重和个人写感；这些观察不进入 current model specs。",
      factClass: "core",
      confidence: 0.96,
      sourceKey: review.key,
      locator: "2024 measurements, handling, personal experience and affiliate disclosure",
      evidence: [
        { key: "phase112-sample-review-citation", sourceKey: review.key, scopeKey: SAMPLE_SCOPE, locator: "154 mm, 66.4 g, non-posting, heavy/writing impressions and affiliate disclosure" },
      ],
    },
    {
      key: "phase112-temporal-nib-boundary",
      predicate: "temporal_sample_conflict",
      objectText: "Current JoWo matte-black steel nib 与 2024 sample apparent original titanium nib 是尚无 revision evidence 可解释的 temporal/sample conflict，不能合并为当前双选项。",
      factClass: "core",
      confidence: 0.9,
      sourceKey: official.key,
      locator: "current official nib field compared with 2024 sample nib description",
      evidence: [
        { key: "phase112-conflict-current-citation", sourceKey: official.key, scopeKey: CURRENT_SCOPE, locator: "current #6 JoWo matte-black stainless-steel nib" },
        { key: "phase112-conflict-sample-citation", sourceKey: review.key, scopeKey: SAMPLE_SCOPE, locator: "2024 sample apparent original titanium-nib description; qualified and affiliate-disclosed" },
      ],
    },
  ],
  variants: [
    {
      key: "phase112-current-feed-options",
      name: "Current listing feed options",
      releaseYear: "2026-07-21 listing snapshot",
      notes: "Feed choices belong to the retrieved-date current listing and do not prove historical sample configuration or future availability.",
      sourceKey: official.key,
      variantKind: "market_sku",
    },
  ],
  spec: {
    brandEntityId: PHASE112_WANCHER_ID,
    values: {
      series_name: "Wancher Dream Pen Titanium Black",
      release_year: "current listing verified 2026-07-21; launch year not asserted",
      origin_country: "Wancher official product context; component origin not generalized",
      nib: "#6 JoWo matte-black stainless-steel nib; current listing configuration",
      fill_system: "European International cartridge or converter",
      material: "titanium body with black PVD coating",
      status: "official listing snapshot retrieved 2026-07-21; availability is mutable",
    },
    evidence: [
      evidence("brand_entity_id", "phase112-spec-brand", official.key, CURRENT_SCOPE, "exact Wancher product listing and locked existing brand identity"),
      evidence("series_name", "phase112-spec-series", official.key, CURRENT_SCOPE, "exact current product title"),
      evidence("release_year", "phase112-spec-time", official.key, CURRENT_SCOPE, "retrieved 2026-07-21; retrieval is not claimed launch year"),
      evidence("origin_country", "phase112-spec-origin", official.key, CURRENT_SCOPE, "official product context only; no unsupported component origin"),
      evidence("nib", "phase112-spec-current-nib", official.key, CURRENT_SCOPE, "current #6 JoWo matte-black stainless-steel nib"),
      evidence("nib", "phase112-spec-sample-nib", review.key, SAMPLE_SCOPE, "2024 sample apparent original titanium nib; rejected as current spec", false),
      evidence("fill_system", "phase112-spec-fill", official.key, CURRENT_SCOPE, "European International cartridge/converter"),
      evidence("material", "phase112-spec-material", official.key, CURRENT_SCOPE, "titanium and black PVD coating"),
      evidence("status", "phase112-spec-status", official.key, CURRENT_SCOPE, "sold out at retrieval; stable field deliberately excludes price and future availability"),
      evidence("dimensions", "phase112-spec-sample-dimensions", review.key, SAMPLE_SCOPE, "154 mm belongs only to the 2024 sample and is rejected as current spec", false),
      evidence("weight", "phase112-spec-sample-weight", review.key, SAMPLE_SCOPE, "66.4 g belongs only to the 2024 sample and is rejected as current spec", false),
    ],
  },
  conflicts: [
    {
      key: "phase112-nib-temporal-sample-conflict",
      fieldKey: "nib",
      scopeKey: CURRENT_SCOPE,
      conflictKind: "field",
      status: "resolved",
      resolutionNote: "The editorial conflict is resolved by non-merging and strict scope separation: current JoWo steel and the 2024 apparent titanium-nib sample are both retained, while configuration chronology remains unknown and no current titanium-nib option is inferred.",
      members: [
        { citationKey: "phase112-spec-current-nib", assertedValue: "2026-07-21 current listing: #6 JoWo matte-black stainless-steel nib" },
        { citationKey: "phase112-spec-sample-nib", assertedValue: "2024 reviewed sample: apparent original titanium-nib configuration, qualified and uncertain" },
      ],
    },
  ],
  timeline: [
    {
      key: "phase112-reviewed-sample-2024",
      title: "kamitopen records a Titanium sample",
      eventType: "community_event",
      startDate: "2024",
      circa: true,
      description: "Affiliate-disclosed sample measurements, non-posting, weight and personal experience; apparent titanium-nib configuration remains sample-only.",
      sourceKey: review.key,
    },
    {
      key: "phase112-current-listing-window",
      title: "Wancher current Titanium Black listing verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description: "Current titanium/PVD, European International filling, JoWo steel nib, feed options and sold-out snapshot; retrieval date is not a launch date.",
      sourceKey: official.key,
    },
  ],
  media: [
    {
      key: "phase112-titanium-black-primary",
      title: "Wancher Titanium Black current／2024 sample 事实边界图（非产品照片）",
      sourceKey: diagram.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创事实示意图；非产品照片；非比例、颜色、PVD 表面或商标复刻。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary",
    },
  ],
};

export function loadPhase112WancherDreamPenTitaniumBlackPack(workspaceRoot: string): LoadedCuratedEntityPack {
  const loaded = loadCuratedEntityPack(workspaceRoot, phase112WancherDreamPenTitaniumBlackPack);
  if (Array.from(loaded.bodyMd).length < 2_000) throw new Error("Phase 112 body_md must contain at least 2,000 Unicode characters.");
  return loaded;
}
