import type { CuratedEntityPack, CuratedSource, LoadedCuratedEntityPack, SpecFieldKey } from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE120_WANCHER_ID = "eOfD77nOeENN";
export const PHASE120_DREAM_ARTICLE_ID = "2aoD07lwSYCV";
export const PHASE120_TRUE_EBONITE_ID = "phase107-wancher-true-ebonite-matte-black";
export const PHASE120_TITANIUM_BLACK_ID = "phase112-wancher-dream-pen-titanium-black";
export const PHASE120_AKA_TAMENURI_ID = "phase113-wancher-dream-pen-true-urushi-aka-tamenuri";
export const PHASE120_PUCHICO_ID = "phase119-wancher-puchico";
export const PHASE120_SHIZUKU_ID = "phase120-wancher-shizuku-glass-nib";
export const PHASE120_SHIZUKU_SLUG = "wancher-shizuku-glass-nib";
export const PHASE120_COLLECTION_REQUESTED_URL = "https://www.wancherpen.com/collections/shizuku-pen/keiryu";
export const PHASE120_COLLECTION_RESOLVED_URL = "https://www.wancherpen.com/collections/shizuku-pen";
export const PHASE120_SOLIS_URL = "https://www.wancherpen.com/products/shizuku-pen-solis";
export const PHASE120_PEN_ADDICT_URL = "https://www.penaddict.com/blog/2019/8/30/wancher-shizuku-glass-nib-fountain-pen-a-review";
export const PHASE120_FAMILY_SCOPE = "phase120-shizuku-official-family-current-card-2026-07-22";
export const PHASE120_SOLIS_SCOPE = "phase120-shizuku-solis-exact-current-2026-07-22";
export const PHASE120_EARTH_SCOPE = "phase120-shizuku-earth-supplied-sample-2019-08-30";
export const PHASE120_VARIANT_NAMES = ["Black Eye", "Orion Nebula", "Eclipse", "Solis", "Blue Moon", "Adrastea", "Mars", "Pluto", "Andromeda", "Gaia", "Saturn", "Jupiter", "Earth", "Venus"] as const;
export const PHASE120_PREORDER_NAMES = ["Blue Moon", "Saturn", "Earth", "Mars", "Venus", "Pluto", "Eclipse", "Jupiter"] as const;

const RETRIEVED = "2026-07-22";
const SVG_PATH = "/images/library/site-original/phase120/wancher/wancher-shizuku-glass-nib.svg";

function webSource(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"> & { locator: string; archiveUrl?: string }): CuratedSource {
  const { locator, archiveUrl, ...source } = input;
  return { ...source, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: archiveUrl ?? source.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}` };
}

const officialFamily = webSource({
  key: "phase120-wancher-shizuku-official-family-collection",
  registryKey: "wancher-official-phase120",
  registryName: "Wancher official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official",
  title: "Shizuku Pen collection",
  url: PHASE120_COLLECTION_REQUESTED_URL,
  archiveUrl: PHASE120_COLLECTION_RESOLVED_URL,
  homepageUrl: "https://www.wancherpen.com/",
  summary: "2026-07-22 official collection：Shizuku family、handmade glass nib、converter、Duralumin/anodization、2025 Black Eye/Orion Nebula/Adrastea 语境与十四张去重 public cards。",
  locator: `requested=${PHASE120_COLLECTION_REQUESTED_URL};resolved=${PHASE120_COLLECTION_RESOLVED_URL};fourteen name-deduplicated public cards; repeated image/title renders and AS IS/outlet excluded`,
});

const officialSolis = webSource({
  key: "phase120-wancher-shizuku-solis-exact",
  registryKey: "wancher-official-phase120",
  registryName: "Wancher official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official",
  title: "Shizuku Pen Solis",
  url: PHASE120_SOLIS_URL,
  homepageUrl: "https://www.wancherpen.com/",
  summary: "Solis current exact listing：Duralumin、screw cap、clear/black glass nib、EF/F/M、154/128 mm、12 mm ring、约25 g与international converter；commerce state排除。",
  locator: "Solis product specifications; exact values apply only to Solis; price, stock and sold-out excluded",
});

const penAddict = webSource({
  key: "phase120-pen-addict-susan-pigott-earth-2019",
  registryKey: "pen-addict-phase120-susan-pigott",
  registryName: "The Pen Addict",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pen-addict-susan-pigott-2019-earth-sample",
  title: "Wancher Shizuku Glass Nib Fountain Pen: A Review",
  url: PHASE120_PEN_ADDICT_URL,
  homepageUrl: "https://www.penaddict.com/",
  author: "Susan M. Pigott",
  publishedAt: "2019-08-30",
  summary: "Wancher免费提供Earth review sample；26.5/18 g、137/120 mm、non-posting、10 mm grip、step/seam、glass-nib feel/flow/no-skip及八个preorder名称与价格仅属dated sample/history。",
  locator: "Susan M. Pigott; posted 2019-08-30; Wancher supplied sample free; Earth measurements, construction, writing observations, preorder names and historic price",
});

const diagram: CuratedSource = {
  key: "phase120-wancher-shizuku-scope-svg", registryKey: "fountain-pen-graph-editorial-phase120", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase120", title: "Shizuku mechanism, listing and evidence-scope map", url: SVG_PATH, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, summary: "本站原创 factual SVG；区分family mechanism、十四张card snapshot、Solis exact与2019 Earth sample exclusion。", allowedUse: "store_full", license: "site-original", archiveUrl: SVG_PATH, archiveLocator: `project-public-asset:${SVG_PATH};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900`,
};

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string, qualifies = true) { return { fieldKey, key, sourceKey, scopeKey, locator, qualifies }; }

export const phase120WancherShizukuPack: CuratedEntityPack = {
  key: "phase120-wancher-shizuku-glass-nib-v1",
  entityId: PHASE120_SHIZUKU_ID,
  expectedType: "pen",
  expectedSlug: PHASE120_SHIZUKU_SLUG,
  canonicalName: "Wancher Shizuku Glass Nib Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wancher-shizuku-glass-nib-phase120.md",
  storyTitle: "Wancher Shizuku：十四张当前卡片、Solis 精确规格与 2019 Earth 样品",
  primarySourceKey: officialFamily.key,
  depthTier: "A",
  aliases: [
    { alias: "Wancher Shizuku", language: "en", sourceKey: officialFamily.key },
    { alias: "Shizuku Glass Nib Fountain Pen", language: "en", sourceKey: officialFamily.key },
  ],
  sources: [officialFamily, officialSolis, penAddict, diagram],
  scopes: [
    { key: PHASE120_FAMILY_SCOPE, scopeKey: PHASE120_FAMILY_SCOPE, validFrom: RETRIEVED, productionState: "current", nibScope: "Official family: handmade glass nib with converter mechanism; card availability is a mutable retrieval snapshot.", materialScope: "Official family context: Duralumin and anodization; not asserted as identical exact construction for every card.", editionScope: "Fourteen name-deduplicated public cards retrieved 2026-07-22; repeated renders and AS IS/outlet excluded; 2025 Black Eye/Orion Nebula/Adrastea context; sold-out is not production status." },
    { key: PHASE120_SOLIS_SCOPE, scopeKey: PHASE120_SOLIS_SCOPE, validFrom: RETRIEVED, productionState: "current", nibScope: "Solis only: clear/black glass nib in EF/F/M.", materialScope: "Solis only: Duralumin, screw cap, 154 mm capped, 128 mm uncapped, 12 mm ring and approx. 25 g.", editionScope: "Solis exact current product scope only; international converter; price, stock and sold-out excluded as mutable commerce state." },
    { key: PHASE120_EARTH_SCOPE, scopeKey: PHASE120_EARTH_SCOPE, validFrom: "2019-08-30", validTo: "2019-08-30", productionState: "historical", nibScope: "Susan M. Pigott's Wancher-free-supplied Earth sample: glass-nib feel, flow and no-skip observations are sample-only.", materialScope: "Earth sample: Duralumin, 26.5 g capped/18 g uncapped, 137/120 mm, non-posting cap, 10 mm grip and step/seam observations.", editionScope: `Dated sample/history only; 2019 preorder names ${PHASE120_PREORDER_NAMES.join(", ")} and historic price do not enumerate current variants.` },
  ],
  claims: [
    { key: "phase120-family-mechanism", predicate: "official_family_design_and_mechanism", objectText: "Official Shizuku family context supports handmade glass nib, converter mechanism, Duralumin/anodization and 2025 Black Eye/Orion Nebula/Adrastea context without making every card an exact-spec sibling.", factClass: "core", confidence: 0.99, sourceKey: officialFamily.key, locator: "official family and collection context", evidence: [{ key: "phase120-family-citation", sourceKey: officialFamily.key, scopeKey: PHASE120_FAMILY_SCOPE, locator: "family design/mechanism/material context and dated cards" }] },
    { key: "phase120-current-card-snapshot", predicate: "retrieved_listing_variant_snapshot", objectText: "Exactly fourteen name-deduplicated official public cards were retrieved; repeated image/title renders and AS IS/outlet duplicates are excluded and availability remains mutable.", factClass: "core", confidence: 0.99, sourceKey: officialFamily.key, locator: "official collection product-card grid", evidence: [{ key: "phase120-current-cards-citation", sourceKey: officialFamily.key, scopeKey: PHASE120_FAMILY_SCOPE, locator: PHASE120_VARIANT_NAMES.join(", ") }] },
    { key: "phase120-solis-exact", predicate: "solis_exact_current_specification", objectText: "Solis only: Duralumin, screw cap, clear/black glass nib, EF/F/M, 154/128 mm, 12 mm ring, approx. 25 g and international converter; commerce state excluded.", factClass: "core", confidence: 0.99, sourceKey: officialSolis.key, locator: "Solis product specifications", evidence: [{ key: "phase120-solis-citation", sourceKey: officialSolis.key, scopeKey: PHASE120_SOLIS_SCOPE, locator: "all exact values explicitly qualified to Solis" }] },
    { key: "phase120-earth-sample", predicate: "professional_supplied_earth_sample_observation", objectText: `Susan M. Pigott's 2019 Wancher-free-supplied Earth sample carries 26.5/18 g, 137/120 mm, non-posting, 10 mm grip, step/seam, feel/flow/no-skip, eight preorder names and historic price only.`, factClass: "core", confidence: 0.97, sourceKey: penAddict.key, locator: "2019 review and free-sample disclosure", evidence: [{ key: "phase120-earth-citation", sourceKey: penAddict.key, scopeKey: PHASE120_EARTH_SCOPE, locator: "author/date/disclosure, Earth identity, measurements, construction, writing and preorder history" }] },
  ],
  variants: PHASE120_VARIANT_NAMES.map((name) => ({ key: `phase120-card-${name.toLowerCase().replaceAll(" ", "-")}`, name, releaseYear: "2026-07-22 collection snapshot", notes: "Official public-card snapshot at retrieval; availability, sold-out, price and stock are mutable and do not assert production status. Name-deduplicated variant of one canonical pen; repeated render and AS IS/outlet excluded.", sourceKey: officialFamily.key, variantKind: "edition_group" as const })),
  spec: {
    brandEntityId: PHASE120_WANCHER_ID,
    values: { series_name: "Wancher Shizuku Glass Nib Fountain Pen", release_year: "official collection verified 2026-07-22; launch year not asserted", nib: "Family: handmade glass nib; Solis exact listing only: clear/black, EF/F/M", fill_system: "International converter mechanism", material: "Family context: Duralumin/anodization; Solis exact listing: Duralumin", dimensions: "Solis exact listing only: 154 mm capped, 128 mm uncapped, 12 mm ring; not asserted line-wide", weight: "Solis exact listing only: approx. 25 g; not asserted line-wide", status: "fourteen-card official collection snapshot retrieved 2026-07-22; availability mutable" },
    evidence: [
      evidence("brand_entity_id", "phase120-spec-brand", officialFamily.key, PHASE120_FAMILY_SCOPE, "locked Wancher brand identity"),
      evidence("series_name", "phase120-spec-series", officialFamily.key, PHASE120_FAMILY_SCOPE, "official Shizuku family identity"),
      evidence("release_year", "phase120-spec-retrieval", officialFamily.key, PHASE120_FAMILY_SCOPE, "retrieved date is not launch year"),
      evidence("nib", "phase120-spec-family-nib", officialFamily.key, PHASE120_FAMILY_SCOPE, "handmade glass nib family mechanism"),
      evidence("fill_system", "phase120-spec-family-fill", officialFamily.key, PHASE120_FAMILY_SCOPE, "converter mechanism"),
      evidence("material", "phase120-spec-family-material", officialFamily.key, PHASE120_FAMILY_SCOPE, "Duralumin/anodization family context; no all-card exact assertion"),
      evidence("nib", "phase120-spec-solis-nib", officialSolis.key, PHASE120_SOLIS_SCOPE, "Solis only clear/black glass nib EF/F/M"),
      evidence("fill_system", "phase120-spec-solis-fill", officialSolis.key, PHASE120_SOLIS_SCOPE, "Solis only international converter"),
      evidence("material", "phase120-spec-solis-material", officialSolis.key, PHASE120_SOLIS_SCOPE, "Solis only Duralumin and screw cap"),
      evidence("dimensions", "phase120-spec-solis-dimensions", officialSolis.key, PHASE120_SOLIS_SCOPE, "Solis only 154/128 mm and 12 mm ring"),
      evidence("weight", "phase120-spec-solis-weight", officialSolis.key, PHASE120_SOLIS_SCOPE, "Solis only approx. 25 g"),
      evidence("status", "phase120-spec-status", officialFamily.key, PHASE120_FAMILY_SCOPE, "listing snapshot; mutable availability is not production status"),
      evidence("material", "phase120-earth-material-rejected", penAddict.key, PHASE120_EARTH_SCOPE, "Earth sample Duralumin rejected as all-current-card proof", false),
      evidence("dimensions", "phase120-earth-dimensions-rejected", penAddict.key, PHASE120_EARTH_SCOPE, "Earth sample 137/120 mm, non-posting and 10 mm grip rejected as Solis/current line-wide dimensions", false),
      evidence("weight", "phase120-earth-weight-rejected", penAddict.key, PHASE120_EARTH_SCOPE, "Earth sample 26.5/18 g rejected as Solis/current weight", false),
      evidence("nib", "phase120-earth-feel-rejected", penAddict.key, PHASE120_EARTH_SCOPE, "Earth sample glass-nib feel, flow and no-skip rejected as current line-wide guarantee", false),
      evidence("dimensions", "phase120-earth-step-rejected", penAddict.key, PHASE120_EARTH_SCOPE, "Earth sample step/seam observations rejected as current line-wide construction", false),
      evidence("release_year", "phase120-earth-preorder-rejected", penAddict.key, PHASE120_EARTH_SCOPE, `2019 preorder set ${PHASE120_PREORDER_NAMES.join(", ")} rejected as current variant enumeration`, false),
      evidence("price_range", "phase120-earth-price-rejected", penAddict.key, PHASE120_EARTH_SCOPE, "2019 sample/preorder price rejected as current stable price", false),
    ],
  },
  timeline: [
    { key: "phase120-earth-review-2019", title: "Susan M. Pigott reviews a Wancher-supplied Earth sample", eventType: "community_event", startDate: "2019-08-30", circa: false, description: `Sample/history only; preorder names: ${PHASE120_PREORDER_NAMES.join(", ")}.`, sourceKey: penAddict.key },
    { key: "phase120-family-2025-context", title: "Black Eye, Orion Nebula and Adrastea appear in 2025 family context", eventType: "design_milestone", startDate: "2025", circa: false, description: "Dated family context, not a line-wide launch or production claim.", sourceKey: officialFamily.key },
    { key: "phase120-collection-2026", title: "Official Shizuku collection snapshot verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "Fourteen name-deduplicated public cards; mutable availability.", sourceKey: officialFamily.key },
  ],
  media: [{ key: "phase120-shizuku-primary", title: "Shizuku mechanism／listing／scope boundary（非产品照片）", sourceKey: diagram.key, localPath: SVG_PATH, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、logo、比例、色准、饰面、价格、库存或持续生产证明。", sourceUrl: SVG_PATH, usageStatus: "primary" }],
};

export function loadPhase120WancherShizukuPack(workspaceRoot: string): LoadedCuratedEntityPack {
  const loaded = loadCuratedEntityPack(workspaceRoot, phase120WancherShizukuPack);
  if (Array.from(loaded.bodyMd).length < 2_000) throw new Error("Phase 120 body_md must contain at least 2,000 Unicode characters.");
  return loaded;
}
