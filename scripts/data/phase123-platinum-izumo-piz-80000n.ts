import type { CuratedEntityPack, CuratedSource, LoadedCuratedEntityPack, SpecFieldKey } from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE123_BRAND_ID = "e51tJpejEkXY";
export const PHASE123_3776_ID = "ekPMWnot9inz";
export const PHASE123_CURIDAS_ID = "BoZ4C2WSqk0K";
export const PHASE123_PROCYON_ID = "phase121-platinum-procyon-pns-5000";
export const PHASE123_PRESIDENT_ID = "a1t4DNomp4Ge";
export const PHASE123_ARTICLE_ID = "OOumUrtFoAqu";
export const PHASE123_RAW_NAME = "白金 Platinum Izumo 出云";
export const PHASE123_RAW_SLUG = "白金-platinum-出云-izumo";
export const PHASE123_ARTICLE_NAME = "Platinum Izumo 系列";
export const PHASE123_ARTICLE_SLUG = "platinum-izumo";
export const PHASE123_PIZ_ID = "phase123-platinum-izumo-piz-80000n";
export const PHASE123_PIZ_NAME = "Platinum Izumo PIZ-80000N 八云涂";
export const PHASE123_PIZ_SLUG = "platinum-izumo-piz-80000n";
export const PHASE123_LEGACY_MADE_BY_ID = "tvedLyJyl6UZ";
export const PHASE123_LEGACY_REVERSE_ID = "rev-tvedLyJyl6UZ";
export const PHASE123_NEW_MADE_BY_ID = "phase123-platinum-izumo-piz-80000n-made-by";
// migration-004 deterministically materializes reverse links as `rev-${madeById}`.
export const PHASE123_NEW_REVERSE_ID = `rev-${PHASE123_NEW_MADE_BY_ID}`;

export const PHASE123_FAMILY_URL = "https://www.platinum-pen.co.jp/en/brands/detail/?pid=70";
export const PHASE123_PRODUCT_JP_URL = "https://www.platinum-pen.co.jp/products/fountain-pen/2064/";
export const PHASE123_PRODUCT_EN_URL = "https://www.platinum-pen.co.jp/en/products/detail/?pid=2064";
export const PHASE123_CATALOG_URL = "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/Platinum-pen-general-catalog-2019-2020.pdf";
export const PHASE123_MAINTENANCE_URL = "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/02/izumo-1.pdf";
export const PHASE123_LEIGH_URL = "https://leighreyes.com/2013/06/a-pen-with-a-sea-of-clouds/";
export const PHASE123_FPN_URL = "https://www.fountainpennetwork.com/forum/topic/325990-platinum-izumo-yagunomuri-ginsen-a-serene-giant-pen/";

export const PHASE123_FAMILY_SCOPE = "phase123-izumo-family-navigation-2026-07-22";
export const PHASE123_CURRENT_SCOPE = "phase123-piz-80000n-current-product-2026-07-22";
export const PHASE123_CATALOG_SCOPE = "phase123-piz-80000n-catalog-2019-2020";
export const PHASE123_MAINTENANCE_SCOPE = "phase123-piz-80000n-model-maintenance";
export const PHASE123_LEIGH_SCOPE = "phase123-piz-80000n-leigh-older-ambiguous-sample-2013";
export const PHASE123_FPN_SCOPE = "phase123-piz-80000n-fpn-ginsen-community-sample-2017";

export const PHASE123_LINEUP = [
  "PIZ-600000 Takisansui",
  "PIZ-500000 Hama no Matsu limited",
  "PIZ-300000 Hama no Matsu limited",
  "PIZ-300000 Urokomon",
  "PIZ-300000A Aurora",
  "PBA-120000G Takeami",
  "PBA-120000Y Takeami",
  "PIZ-100000 Yakumo Byakudan",
  "PIZ-80000N Ginsen/Togi Yakumo",
  "PIZ-50000T Tagayasan",
  "PIZ-55000 Tamenuri",
] as const;
export const PHASE123_CURRENT_VARIANTS = ["#91 Ginsen Yakumo", "#92 Togi Yakumo"] as const;

const RETRIEVED = "2026-07-22";
export const PHASE123_FAMILY_SVG_PATH = "/images/library/site-original/phase123/platinum/platinum-izumo-family.svg";
export const PHASE123_PIZ_SVG_PATH = "/images/library/site-original/phase123/platinum/platinum-izumo-piz-80000n.svg";

function webSource(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"> & { locator: string }): CuratedSource {
  const { locator, ...source } = input;
  return { ...source, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: source.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}` };
}

const official = { registryKey: "platinum-official-phase123", registryName: "Platinum Pen Co., Ltd.", sourceType: "official" as const, tier: "primary" as const, independenceGroup: "platinum-official", homepageUrl: "https://www.platinum-pen.co.jp/", author: "Platinum Pen Co., Ltd." };
export const phase123FamilySource = webSource({ ...official, key: "phase123-platinum-izumo-family", title: "IZUMO brand lineup", url: PHASE123_FAMILY_URL, summary: `Retrieved ${RETRIEVED} IZUMO'S LINEUP navigation; repeated image cards deduplicated to exactly ${PHASE123_LINEUP.length} textual family labels. No shared specs or sibling entities.`, locator: `IZUMO'S LINEUP heading; exact card labels: ${PHASE123_LINEUP.join(" | ")}; duplicate image cards deduplicated; 2025 Precious Wood news excluded from current card set` });
const productJp = webSource({ ...official, key: "phase123-platinum-piz-jp-product", title: "PIZ-80000N Japanese product page", url: PHASE123_PRODUCT_JP_URL, summary: "Current JP product identity, ¥165,000 retrieved-date price, #91/#92 table, nib/material/finish/size/accessories/box fields.", locator: "breadcrumb and PIZ-80000N; ¥165,000 description; ペン先／ペン種／仕様／サイズ／付属品／化粧箱 labels; #91/#92 code table" });
const productEn = webSource({ ...official, key: "phase123-platinum-piz-en-product", title: "PIZ-80000N English product page", url: PHASE123_PRODUCT_EN_URL, summary: "Current EN product description and exact #91/#92 table with nib, base material, surface finish, size and weight labels.", locator: "PIZ-80000N descriptive paragraph; Nib／Base Material／Surface Finish／Size／Weight labels; #91/#92 code table" });
const catalog = webSource({ ...official, key: "phase123-platinum-catalog-2019-2020", title: "Platinum Pen General Catalog 2019–2020", url: PHASE123_CATALOG_URL, publishedAt: "2019", summary: "Dated PIZ-80000N variants/specification corroboration only; not evidence of 2026 availability or price.", locator: "PDF printed page 14; IZUMO heading; PIZ-80000N row; product code/colour, nib, material, dimensions, weight and accessories column labels" });
const maintenance = webSource({ ...official, key: "phase123-platinum-izumo-maintenance", title: "Common practices on how to ensure long-term use of Izumo", url: PHASE123_MAINTENANCE_URL, summary: "Model-scoped maintenance: remove cartridge/converter about every three months, rinse nib in water/lukewarm water and use Platinum replacement products.", locator: "PDF printed page 1; 出雲をより長くお使いいただくために / Common practices heading; three-month cartridge removal and nib water/lukewarm-water steps; Platinum replacement products sentence" });
const leigh = webSource({ key: "phase123-leigh-older-yakumonuri-sample", registryKey: "leigh-reyes-phase123", registryName: "Leigh Reyes — My Life As a Verb", sourceType: "blog", tier: "professional_secondary", independenceGroup: "leigh-reyes", homepageUrl: "https://leighreyes.com/", author: "Leigh Reyes", title: "A pen with a sea of clouds", url: PHASE123_LEIGH_URL, publishedAt: "2013-06-25", summary: "Older ambiguous Yakumonuri sample: section threads, older President engraving, Fine writing/reliability/appearance observations; not identified as #91 or #92.", locator: "title/byline/date; thread-placement paragraph; President nib engraving; Fine nib and smooth/reliable observation; no #91/#92 code" });
const fpn = webSource({ key: "phase123-fpn-ginsen-sample", registryKey: "fountain-pen-network-phase123", registryName: "Fountain Pen Network", sourceType: "forum", tier: "community", independenceGroup: "fpn-columela-2017", homepageUrl: "https://www.fountainpennetwork.com/", author: "columela", title: "Platinum Izumo Yagunomuri Ginsen. A Serene Giant Pen", url: PHASE123_FPN_URL, publishedAt: "2017-08-05", summary: "Community/user-generated exact Ginsen sample: M nib, cartridge/converter, large size and personal feel/line observations; non-core publication evidence.", locator: "topic title; author columela; Posted August 5, 2017; Ginsen identification; Design/Size/Weight, Nib and Filling System sections; M and personal line/feel observations" });
const diagram: CuratedSource = { key: "phase123-piz-boundary-svg", registryKey: "fountain-pen-graph-editorial-phase123", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase123", title: "PIZ-80000N evidence boundary map", url: PHASE123_PIZ_SVG_PATH, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, summary: "Original factual SVG separating current product, dated catalog, maintenance and two sample scopes.", allowedUse: "store_full", license: "site-original", archiveUrl: PHASE123_PIZ_SVG_PATH, archiveLocator: `project-public-asset:${PHASE123_PIZ_SVG_PATH};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900` };

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string, qualifies = true) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

export const phase123PlatinumIzumoFamilyArticle = {
  entityId: PHASE123_ARTICLE_ID,
  name: PHASE123_ARTICLE_NAME,
  slug: PHASE123_ARTICLE_SLUG,
  markdownFile: ".planning/content-research/platinum-izumo-family-phase123.md",
  sourceMarkerPrefix: "curated:phase123:platinum-izumo-family:",
  source: phase123FamilySource,
  lineup: PHASE123_LINEUP,
  mediaPath: PHASE123_FAMILY_SVG_PATH,
} as const;

export const phase123PlatinumIzumoPizPack: CuratedEntityPack = {
  key: "phase123-platinum-izumo-piz-80000n-v1",
  entityId: PHASE123_PIZ_ID,
  expectedType: "pen",
  expectedSlug: PHASE123_PIZ_SLUG,
  canonicalName: PHASE123_PIZ_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/platinum-izumo-piz-80000n-phase123.md",
  storyTitle: "Platinum Izumo PIZ-80000N：#91／#92 与 evidence boundaries",
  primarySourceKey: productJp.key,
  depthTier: "A",
  aliases: [{ alias: "Platinum Izumo PIZ-80000N", language: "en", sourceKey: productEn.key }],
  sources: [phase123FamilySource, productJp, productEn, catalog, maintenance, leigh, fpn, diagram],
  scopes: [
    { key: PHASE123_CURRENT_SCOPE, scopeKey: PHASE123_CURRENT_SCOPE, validFrom: RETRIEVED, productionState: "current", nibScope: "Large 18K（18-21）two-tone/selective rhodium F/M/B.", materialScope: "Ebonite, Yakumonuri; 154 × 18 mm; 33 g; cartridge/Converter-800A.", editionScope: `${PHASE123_CURRENT_VARIANTS.join(", ")}; #92 only has togidashi/polished wording; JP ¥165,000 is a retrieved-date snapshot.` },
    { key: PHASE123_CATALOG_SCOPE, scopeKey: PHASE123_CATALOG_SCOPE, validFrom: "2019", validTo: "2020-12-31", productionState: "historical", editionScope: "Printed catalog PIZ-80000N row is dated corroboration only, never 2026 availability." },
    { key: PHASE123_MAINTENANCE_SCOPE, scopeKey: PHASE123_MAINTENANCE_SCOPE, productionState: "unknown", editionScope: "About every three months remove cartridge/converter, rinse nib with water/lukewarm water, and use Platinum replacements; no durability or general lacquer-care inference." },
    { key: PHASE123_LEIGH_SCOPE, scopeKey: PHASE123_LEIGH_SCOPE, validFrom: "2013-06-25", validTo: "2013-06-25", productionState: "historical", nibScope: "One Fine older Yakumonuri sample; #91/#92 unresolved.", editionScope: "Section threads, older President engraving, writing/reliability/appearance remain sample-only." },
    { key: PHASE123_FPN_SCOPE, scopeKey: PHASE123_FPN_SCOPE, validFrom: "2017-08-05", validTo: "2017-08-05", productionState: "historical", nibScope: "Community exact Ginsen sample with M nib.", editionScope: "Cartridge/converter, large size and personal feel/line apply only to columela's sample; source does not qualify as professional core." },
  ],
  claims: [
    { key: "phase123-identity", predicate: "model_identity", objectText: "PIZ-80000N is the exact Izumo product represented by the new immutable pen identity.", factClass: "core", confidence: 0.99, sourceKey: productJp.key, locator: "breadcrumb and PIZ-80000N heading", evidence: [{ key: "phase123-identity-jp", sourceKey: productJp.key, scopeKey: PHASE123_CURRENT_SCOPE, locator: "PIZ-80000N exact product code" }, { key: "phase123-identity-en", sourceKey: productEn.key, scopeKey: PHASE123_CURRENT_SCOPE, locator: "PIZ-80000N exact product code" }] },
    { key: "phase123-variants", predicate: "retrieved_current_variant_snapshot", objectText: PHASE123_CURRENT_VARIANTS.join(", "), factClass: "core", confidence: 0.99, sourceKey: productJp.key, locator: "#91/#92 code tables", evidence: [{ key: "phase123-variants-jp", sourceKey: productJp.key, scopeKey: PHASE123_CURRENT_SCOPE, locator: "#91 Ginsen Yakumo; #92 Togi Yakumo" }, { key: "phase123-variants-en", sourceKey: productEn.key, scopeKey: PHASE123_CURRENT_SCOPE, locator: "#91 Ginsen Yakumo; #92 Togi Yakumo" }] },
    { key: "phase123-catalog", predicate: "dated_catalog_snapshot", objectText: "2019–2020 catalog corroborates dated variants/spec fields but not current availability.", factClass: "core", confidence: 0.98, sourceKey: catalog.key, locator: catalog.archiveLocator ?? catalog.summary, evidence: [{ key: "phase123-catalog-evidence", sourceKey: catalog.key, scopeKey: PHASE123_CATALOG_SCOPE, locator: catalog.archiveLocator ?? catalog.summary }] },
    { key: "phase123-maintenance", predicate: "model_scoped_maintenance", objectText: "Izumo manual supports the three-month cartridge/converter removal and nib rinse process only.", factClass: "core", confidence: 0.99, sourceKey: maintenance.key, locator: maintenance.archiveLocator ?? maintenance.summary, evidence: [{ key: "phase123-maintenance-evidence", sourceKey: maintenance.key, scopeKey: PHASE123_MAINTENANCE_SCOPE, locator: maintenance.archiveLocator ?? maintenance.summary }] },
    { key: "phase123-leigh", predicate: "ambiguous_older_sample", objectText: "Leigh Reyes reports one older Yakumonuri sample without a defensible #91/#92 identification.", factClass: "core", confidence: 0.94, sourceKey: leigh.key, locator: leigh.archiveLocator ?? leigh.summary, evidence: [{ key: "phase123-leigh-evidence", sourceKey: leigh.key, scopeKey: PHASE123_LEIGH_SCOPE, locator: leigh.archiveLocator ?? leigh.summary }] },
    { key: "phase123-fpn", predicate: "community_exact_ginsen_sample", objectText: "columela reports one exact Ginsen/M/cartridge-converter/large sample; subjective feel and line remain community observations.", factClass: "core", confidence: 0.9, sourceKey: fpn.key, locator: fpn.archiveLocator ?? fpn.summary, evidence: [{ key: "phase123-fpn-evidence", sourceKey: fpn.key, scopeKey: PHASE123_FPN_SCOPE, locator: fpn.archiveLocator ?? fpn.summary }] },
  ],
  variants: PHASE123_CURRENT_VARIANTS.map((name) => ({ key: `phase123-${name.startsWith("#91") ? "91-ginsen" : "92-togi"}`, name, releaseYear: `${RETRIEVED} listing snapshot`, notes: name.startsWith("#92") ? "Exact official variant; togidashi/polished statement applies only here." : "Exact official Ginsen variant; does not inherit #92 togidashi wording.", sourceKey: productJp.key, variantKind: "market_sku" as const, productCode: `PIZ-80000N ${name.split(" ")[0]}` })),
  spec: { brandEntityId: PHASE123_BRAND_ID, values: { series_name: "Platinum Izumo PIZ-80000N", origin_country: "Japan / Platinum official product", nib: "Large 18K（18-21）two-tone/selective rhodium; F, M, B", fill_system: "Platinum blue-black cartridge or Converter-800A", material: "Ebonite base with Yakumonuri; #92 only togidashi/polished", dimensions: "154 mm × 18 mm", weight: "33 g", price_range: "¥165,000 JP snapshot retrieved 2026-07-22", status: "#91 Ginsen Yakumo and #92 Togi Yakumo product listing snapshot" }, evidence: [
    evidence("brand_entity_id", "phase123-brand", productJp.key, PHASE123_CURRENT_SCOPE, "locked Platinum maker"),
    evidence("series_name", "phase123-series", productJp.key, PHASE123_CURRENT_SCOPE, "PIZ-80000N heading"),
    evidence("origin_country", "phase123-origin", productJp.key, PHASE123_CURRENT_SCOPE, "Platinum Japanese official registry"),
    evidence("nib", "phase123-nib", productJp.key, PHASE123_CURRENT_SCOPE, "large 18K（18-21）two-tone/selective rhodium F/M/B"),
    evidence("fill_system", "phase123-fill", productJp.key, PHASE123_CURRENT_SCOPE, "Converter-800A and blue-black cartridge"),
    evidence("material", "phase123-material", productEn.key, PHASE123_CURRENT_SCOPE, "Base Material ebonite; Surface Finish Yakumonuri; #92 polished only"),
    evidence("dimensions", "phase123-size", productEn.key, PHASE123_CURRENT_SCOPE, "Size 154 × 18 mm"),
    evidence("weight", "phase123-weight", productEn.key, PHASE123_CURRENT_SCOPE, "Weight 33 g"),
    evidence("price_range", "phase123-price", productJp.key, PHASE123_CURRENT_SCOPE, "¥165,000 JP retrieved-date snapshot"),
    evidence("status", "phase123-status", productJp.key, PHASE123_CURRENT_SCOPE, "#91/#92 exact table"),
    evidence("status", "phase123-family-rejected", phase123FamilySource.key, PHASE123_CURRENT_SCOPE, "11 sibling labels rejected as target variants or shared specs", false),
    evidence("status", "phase123-catalog-current-rejected", catalog.key, PHASE123_CATALOG_SCOPE, "dated catalog rejected as 2026 availability", false),
    evidence("material", "phase123-togi-boundary", productEn.key, PHASE123_CURRENT_SCOPE, "#92 togidashi/polished rejected for #91", false),
    evidence("status", "phase123-maintenance-current-rejected", maintenance.key, PHASE123_MAINTENANCE_SCOPE, "maintenance instructions rejected as product availability/performance", false),
    evidence("nib", "phase123-leigh-code-rejected", leigh.key, PHASE123_LEIGH_SCOPE, "older Fine sample rejected as #91/#92 identity or current nib set", false),
    evidence("material", "phase123-leigh-appearance-rejected", leigh.key, PHASE123_LEIGH_SCOPE, "older appearance rejected as current finish proof", false),
    evidence("nib", "phase123-fpn-writing-rejected", fpn.key, PHASE123_FPN_SCOPE, "community M feel/line rejected as line-wide writing proof", false),
    evidence("dimensions", "phase123-fpn-size-rejected", fpn.key, PHASE123_FPN_SCOPE, "community large-size observation rejected as official stable dimensions", false),
  ] },
  timeline: [{ key: "phase123-catalog-event", title: "PIZ-80000N catalog snapshot", eventType: "design_milestone", startDate: "2019", circa: false, description: "Dated 2019–2020 catalog only.", sourceKey: catalog.key }, { key: "phase123-current-event", title: "Official product snapshot verified", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: PHASE123_CURRENT_VARIANTS.join(", "), sourceKey: productJp.key }],
  media: [{ key: "phase123-piz-primary", title: "PIZ-80000N evidence boundary map（非产品照片）", sourceKey: diagram.key, localPath: PHASE123_PIZ_SVG_PATH, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "site-original factual SVG；non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof。", sourceUrl: PHASE123_PIZ_SVG_PATH, usageStatus: "primary" }],
};

export function loadPhase123PlatinumIzumoPizPack(workspaceRoot: string): LoadedCuratedEntityPack {
  const loaded = loadCuratedEntityPack(workspaceRoot, phase123PlatinumIzumoPizPack);
  if (Array.from(loaded.summary).length < 60 || Array.from(loaded.summary).length > 160) throw new Error("Phase 123 PIZ summary must contain 60–160 Unicode characters.");
  if (Array.from(loaded.bodyMd).length < 2_000) throw new Error("Phase 123 PIZ body_md must contain at least 2,000 Unicode characters.");
  return loaded;
}
