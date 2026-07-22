import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { createHash } from "node:crypto";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";
import { PHASE42_LAMY_BRAND_ID } from "./phase42-lamy-platinum";

export const PHASE132_LAMY_ID = PHASE42_LAMY_BRAND_ID;
export const PHASE132_STUDIO_RAW_SLUG = "凌美-lamy-studio-演艺";
export const PHASE132_DIALOG_RAW_SLUG = "凌美-lamy-dialog-3-焦点3";
export const PHASE132_STUDIO_SLUG = "lamy-studio";
export const PHASE132_DIALOG_SLUG = "lamy-dialog";
export const PHASE132_TARGET_SLUGS = [PHASE132_STUDIO_SLUG, PHASE132_DIALOG_SLUG] as const;
export function phase132MadeById(entityId: string): string { return `phase132-lamy-made-by-${createHash("sha256").update(entityId).digest("hex").slice(0, 20)}`; }
export function phase132ReverseId(entityId: string): string { return `phase132-lamy-reverse-${createHash("sha256").update(entityId).digest("hex").slice(0, 20)}`; }

const RETRIEVED = "2026-07-22";
const STUDIO_BLACK_URL = "https://www.lamy.com/en-de/p/lamy-studio-fountain-pen/54395071594840?Model+Color=black&Nib+Material+-+Nib+Grade=steel+nib+-+F";
const STUDIO_GOLD_URL = "https://www.lamy.com/en-us/p/lamy-studio-fountain-pen/50723086172494";
const STUDIO_REVIEW_URL = "https://www.penaddict.com/blog/2022/7/7/my-thoughts-on-the-lamy-studio";
const DIALOG_URL = "https://www.lamy.com/en-us/p/lamy-dialog-fountain-pen/50723088990542";
const DIALOG_REVIEW_URL = "https://www.pencilcaseblog.com/2016/06/lamy-dialog-3-fountain-pen-review.html";
const CARE_URL = "https://www.lamyshop.se/en/pages/faq";
const STUDIO_SVG = "/images/library/site-original/phase132/lamy/lamy-studio.svg";
const DIALOG_SVG = "/images/library/site-original/phase132/lamy/lamy-dialog.svg";

function web(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"> & { locator: string }): CuratedSource {
  const { locator, ...source } = input;
  return { ...source, retrievedAt: RETRIEVED, allowedUse: "summary_only", archiveUrl: source.url, archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}` };
}

const official = { registryKey: "lamy-official-phase132", registryName: "LAMY", sourceType: "official" as const, tier: "primary" as const, independenceGroup: "lamy-official", homepageUrl: "https://www.lamy.com/", author: "LAMY" };
const studioBlack = web({ ...official, key: "phase132-lamy-studio-black-steel-f", title: "LAMY studio black / steel nib F, variant 54395071594840", url: STUDIO_BLACK_URL, summary: "Current exact variant describes matt black lacquer, steel propeller-shaped clip, polished steel nib, T 10/Z 27, Hannes Wettstein, 13×13×140 mm and 24 g.", locator: "selected black / steel nib F variant 54395071594840; product description; designer; size and weight" });
const studioGold = web({ ...official, key: "phase132-lamy-studio-palladium-gold", title: "LAMY studio palladium / gold nib", url: STUDIO_GOLD_URL, summary: "Current product family exposes palladium and pianoblack gold-nib variants; the palladium description specifies a partially platinum-plated 14 ct bi-colour gold nib with T 10/Z 27.", locator: "palladium selected product and variant descriptions; 14 ct bi-colour gold nib; T 10/Z 27" });
const studioReview = web({ key: "phase132-penaddict-lamy-studio", registryKey: "pen-addict-phase132", registryName: "The Pen Addict", sourceType: "blog", tier: "professional_secondary", independenceGroup: "pen-addict", homepageUrl: "https://www.penaddict.com/", author: "The Pen Addict", title: "My Thoughts on the Lamy Studio", url: STUDIO_REVIEW_URL, publishedAt: "2022-07-07", summary: "Professional owner review explicitly uses a self-purchased Terracotta steel-medium Studio and discusses its propeller clip, metal grip, sample weight, posting balance and steel/gold nib impressions.", locator: "Terracotta steel M sample; metal-grip discussion; 22 g sample; posting; purchased-by-author disclosure" });
const dialog = web({ ...official, key: "phase132-lamy-dialog-black-current", title: "LAMY dialog Fountain Pen, black current product", url: DIALOG_URL, summary: "Current page titles the pen LAMY dialog while product-family and designer metadata retain dialog 3; it names Franco Clivio, twist-action retractable 14K nib, lowering clip, ball valve, T 10/Z 27, 13×13×140 mm and 48 g.", locator: "current product title; product_family lamydialog3; Franco Clivio; mechanism description; black variant; size and weight" });
const dialogReview = web({ key: "phase132-pencilcase-dialog3-review", registryKey: "pencilcase-blog-phase132", registryName: "The Pencilcase Blog", sourceType: "blog", tier: "professional_secondary", independenceGroup: "pencilcase-blog", homepageUrl: "https://www.pencilcaseblog.com/", author: "The Pencilcase Blog", title: "LAMY Dialog 3 Fountain Pen Review", url: DIALOG_REVIEW_URL, publishedAt: "2016-06-01", summary: "Professional review discloses a discounted purchase and covers one Broad Dialog 3 sample: about 45 g/13.9 cm, twist and clip action, four-month desk seal observation, balance, gold-nib writing and VP comparison.", locator: "discounted-purchase disclosure; Broad sample; measured 45 g and 13.9 cm; four-month observation; mechanism and subjective comparison" });
const care = web({ ...official, key: "phase132-lamy-care", title: "LAMY care and handling FAQ", url: CARE_URL, summary: "LAMY care guidance supports room-temperature water flushing and drying while avoiding detergent, alcohol, boiling water and chemical cleaners; mechanism or gold-nib repair belongs with authorized service.", locator: "fountain-pen cleaning and nib-service guidance" });

function diagram(key: string, title: string, url: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase132", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase132", title, url, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, summary: "Site-original factual SVG; non-photo, non-logo and not to scale.", allowedUse: "store_full", license: "site-original", archiveUrl: url, archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900` };
}
const studioSvg = diagram("phase132-lamy-studio-svg", "LAMY studio identity and nib variants", STUDIO_SVG);
const dialogSvg = diagram("phase132-lamy-dialog-svg", "LAMY dialog mechanism and identity boundary", DIALOG_SVG);

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) { return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true }; }
function media(key: string, title: string, source: CuratedSource) { return [{ key, title, sourceKey: source.key, localPath: source.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "site-original factual SVG；non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof。", sourceUrl: source.url, usageStatus: "primary" as const }]; }

function studioPack(entityId: string): CuratedEntityPack {
  const current = "phase132-studio-black-steel-current";
  const gold = "phase132-studio-gold-current";
  const sample = "phase132-studio-terracotta-m-owner-sample";
  return {
    key: "phase132-lamy-studio-v1", entityId, expectedType: "pen", expectedSlug: PHASE132_STUDIO_SLUG, canonicalName: "LAMY studio", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/lamy-studio-phase132.md", storyTitle: "LAMY studio：螺旋桨笔夹下的钢尖与金尖分流", primarySourceKey: studioBlack.key, depthTier: "A",
    aliases: [{ alias: "LAMY studio", language: "en", sourceKey: studioBlack.key }, { alias: "LAMY Studio", language: "en", sourceKey: studioBlack.key }, { alias: "凌美 studio", language: "zh", sourceKey: studioBlack.key }, { alias: "凌美 演艺", language: "zh", sourceKey: studioReview.key, kind: "former_name" }],
    sources: [studioBlack, studioGold, studioReview, care, studioSvg],
    scopes: [
      { key: current, scopeKey: current, validFrom: RETRIEVED, productionState: "current", nibScope: "Black variant 54395071594840 selected as steel nib F.", materialScope: "Matt black lacquer and steel propeller-shaped clip.", editionScope: "13×13×140 mm and 24 g apply to the selected current black steel-F SKU." },
      { key: gold, scopeKey: gold, validFrom: RETRIEVED, productionState: "current", nibScope: "Palladium/pianoblack family options include partially platinum-plated 14 ct bi-colour gold nibs.", editionScope: "Gold-nib current variants remain separate from the black steel-F anchor." },
      { key: sample, scopeKey: sample, validFrom: "2022-07-07", validTo: "2022-07-07", productionState: "historical", nibScope: "One self-purchased Terracotta steel-medium sample.", materialScope: "One sample with reviewer-reported 22 g and metal grip.", editionScope: "Grip, posting, balance and writing impressions are reviewer/sample scoped." },
    ],
    claims: [
      { key: "phase132-studio-identity", predicate: "model_identity", objectText: "LAMY studio is Hannes Wettstein's metal fountain-pen family identified by the propeller-shaped clip, distinct from Safari, AL-star and LAMY 2000.", factClass: "core", confidence: 0.99, sourceKey: studioBlack.key, locator: studioBlack.archiveLocator ?? studioBlack.summary, evidence: [{ key: "phase132-studio-identity-e", sourceKey: studioBlack.key, scopeKey: current, locator: "product title, designer and propeller-clip description" }] },
      { key: "phase132-studio-current", predicate: "exact_sku_specification", objectText: "Current black steel-F variant 54395071594840 is matt black lacquer, polished steel nib, T 10/Z 27, 13×13×140 mm and 24 g.", factClass: "core", confidence: 0.99, sourceKey: studioBlack.key, locator: studioBlack.archiveLocator ?? studioBlack.summary, evidence: [{ key: "phase132-studio-current-e", sourceKey: studioBlack.key, scopeKey: current, locator: "selected exact variant description and dimensions" }] },
      { key: "phase132-studio-gold", predicate: "variant_boundary", objectText: "Palladium and related gold-nib Studio SKUs use a partially platinum-plated 14 ct bi-colour nib and cannot backfill the black steel-nib SKU.", factClass: "core", confidence: 0.99, sourceKey: studioGold.key, locator: studioGold.archiveLocator ?? studioGold.summary, evidence: [{ key: "phase132-studio-gold-e", sourceKey: studioGold.key, scopeKey: gold, locator: "current gold-nib variant descriptions" }] },
      { key: "phase132-studio-sample", predicate: "professional_sample_boundary", objectText: "The Pen Addict's Terracotta steel-M Studio is a self-purchased sample; 22 g, grip, posting and writing observations do not replace current official SKU fields.", factClass: "core", confidence: 0.97, sourceKey: studioReview.key, locator: studioReview.archiveLocator ?? studioReview.summary, evidence: [{ key: "phase132-studio-sample-e", sourceKey: studioReview.key, scopeKey: sample, locator: "sample configuration and purchase disclosure" }] },
    ],
    variants: [{ key: "phase132-studio-black-steel-f", name: "studio black / steel nib F", productCode: "54395071594840", notes: "Current exact specification anchor.", sourceKey: studioBlack.key, variantKind: "market_sku" }, { key: "phase132-studio-palladium-gold", name: "studio palladium / 14 ct gold nib", notes: "Current gold-nib route; nib widths and inventory by market.", sourceKey: studioGold.key, variantKind: "market_sku" }, { key: "phase132-studio-terracotta-m-sample", name: "Terracotta steel M review sample", releaseYear: "reviewed 2022", notes: "Self-purchased reviewer sample only.", sourceKey: studioReview.key, variantKind: "edition_group" }],
    spec: { brandEntityId: PHASE132_LAMY_ID, values: { series_name: "LAMY studio", origin_country: "LAMY Germany product line; exact manufacturing statement by SKU/packaging", nib: "Selected black SKU: polished steel F; palladium variants: partially platinum-plated 14 ct bi-colour gold", fill_system: "LAMY T 10 cartridge / Z 27 converter", material: "Selected black SKU: matt black lacquer and steel propeller-shaped clip", dimensions: "Selected black steel-F SKU: 13×13×140 mm", weight: "Selected black steel-F SKU: 24 g", status: "Current product family; finish, nib material, width and stock by SKU" }, evidence: [evidence("brand_entity_id", "phase132-studio-brand", studioBlack.key, current, "official LAMY product"), evidence("series_name", "phase132-studio-series", studioBlack.key, current, "current title"), evidence("origin_country", "phase132-studio-origin", studioBlack.key, current, "LAMY Germany context; no factory inference"), evidence("nib", "phase132-studio-nib", studioBlack.key, current, "selected black steel-F"), evidence("fill_system", "phase132-studio-fill", studioBlack.key, current, "T 10/Z 27"), evidence("material", "phase132-studio-material", studioBlack.key, current, "matt black lacquer and clip"), evidence("dimensions", "phase132-studio-dimensions", studioBlack.key, current, "official selected SKU size"), evidence("weight", "phase132-studio-weight", studioBlack.key, current, "official selected SKU weight"), evidence("status", "phase132-studio-status", studioGold.key, gold, "current multi-variant product family")] },
    media: media("phase132-studio-primary", "LAMY studio identity and nib variants（非产品照片）", studioSvg),
  };
}

function dialogPack(entityId: string): CuratedEntityPack {
  const current = "phase132-dialog-black-current";
  const sample = "phase132-dialog3-broad-review-sample-2016";
  return {
    key: "phase132-lamy-dialog-v1", entityId, expectedType: "pen", expectedSlug: PHASE132_DIALOG_SLUG, canonicalName: "LAMY dialog", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/lamy-dialog-phase132.md", storyTitle: "LAMY dialog：Dialog 3 旧名、旋转伸缩尖与 dialog cc 边界", primarySourceKey: dialog.key, depthTier: "A",
    aliases: [{ alias: "LAMY dialog", language: "en", sourceKey: dialog.key }, { alias: "LAMY Dialog 3", language: "en", sourceKey: dialog.key, kind: "former_name" }, { alias: "Dialog 3", language: "en", sourceKey: dialog.key, kind: "former_name" }, { alias: "凌美 dialog", language: "zh", sourceKey: dialog.key }, { alias: "凌美 焦点3", language: "zh", sourceKey: dialogReview.key, kind: "former_name" }],
    sources: [dialog, dialogReview, care, dialogSvg],
    scopes: [
      { key: current, scopeKey: current, validFrom: RETRIEVED, productionState: "current", nibScope: "Current black product: partially platinum-plated 14 ct bi-colour gold nib; widths by variant.", materialScope: "Matt black lacquer and palladium-finish clip.", editionScope: "Current title dialog; product-family/designer metadata retain dialog 3; 13×13×140 mm and 48 g; dialog cc excluded." },
      { key: sample, scopeKey: sample, validFrom: "2016-06-01", validTo: "2016-06-01", productionState: "historical", nibScope: "One discounted-purchase Broad gold-nib Dialog 3 sample.", materialScope: "Reviewer measured about 45 g and 13.9 cm.", editionScope: "Four-month seal, balance, writing and VP-comparison observations remain sample and author scoped." },
    ],
    claims: [
      { key: "phase132-dialog-identity", predicate: "model_identity", objectText: "Current title LAMY dialog and product-family name LAMY dialog 3 refer to this Franco Clivio retractable model; dialog cc is a separate sibling.", factClass: "core", confidence: 0.99, sourceKey: dialog.key, locator: dialog.archiveLocator ?? dialog.summary, evidence: [{ key: "phase132-dialog-identity-e", sourceKey: dialog.key, scopeKey: current, locator: "current title, lamydialog3 family metadata and Franco Clivio designer record" }] },
      { key: "phase132-dialog-mechanism", predicate: "mechanism", objectText: "Twisting extends the 14K nib while lowering the clip; closing retracts the nib and places a ball valve over the opening.", factClass: "core", confidence: 0.99, sourceKey: dialog.key, locator: dialog.archiveLocator ?? dialog.summary, evidence: [{ key: "phase132-dialog-mechanism-e", sourceKey: dialog.key, scopeKey: current, locator: "official retractable nib/clip and ball-valve description" }] },
      { key: "phase132-dialog-current", predicate: "exact_sku_specification", objectText: "Current black product is matt black lacquer with palladium-finish clip, 14 ct bi-colour gold nib, T 10/Z 27, 13×13×140 mm and 48 g.", factClass: "core", confidence: 0.99, sourceKey: dialog.key, locator: dialog.archiveLocator ?? dialog.summary, evidence: [{ key: "phase132-dialog-current-e", sourceKey: dialog.key, scopeKey: current, locator: "black variant description and official size/weight" }] },
      { key: "phase132-dialog-sample", predicate: "professional_sample_boundary", objectText: "The Pencilcase Blog's discounted-purchase Broad sample measured about 45 g; its four-month seal, balance, nib and VP comparison do not override current official fields or promise universal performance.", factClass: "core", confidence: 0.97, sourceKey: dialogReview.key, locator: dialogReview.archiveLocator ?? dialogReview.summary, evidence: [{ key: "phase132-dialog-sample-e", sourceKey: dialogReview.key, scopeKey: sample, locator: "purchase disclosure, Broad sample, measurements and observations" }] },
    ],
    variants: [{ key: "phase132-dialog-black-current", name: "LAMY dialog black", productCode: "50723088990542", notes: "Current exact product anchor; nib width by selected variant.", sourceKey: dialog.key, variantKind: "market_sku" }, { key: "phase132-dialog-former-name", name: "LAMY dialog 3 naming", notes: "Former/product-family naming for the same model identity; not a duplicate page.", sourceKey: dialog.key, variantKind: "edition_group" }],
    spec: { brandEntityId: PHASE132_LAMY_ID, values: { series_name: "LAMY dialog", origin_country: "LAMY Germany product line; exact manufacturing statement by SKU/packaging", nib: "Current black SKU: partially platinum-plated 14 ct bi-colour gold nib", fill_system: "LAMY T 10 cartridge / Z 27 converter", material: "Current black SKU: matt black lacquer and palladium-finish clip", dimensions: "Current black SKU: 13×13×140 mm", weight: "Current black SKU: 48 g", status: "Current product; Dialog 3 former/product-family name; dialog cc separate" }, evidence: [evidence("brand_entity_id", "phase132-dialog-brand", dialog.key, current, "official LAMY product"), evidence("series_name", "phase132-dialog-series", dialog.key, current, "current title and family metadata"), evidence("origin_country", "phase132-dialog-origin", dialog.key, current, "LAMY Germany context; no factory inference"), evidence("nib", "phase132-dialog-nib", dialog.key, current, "current black 14 ct nib"), evidence("fill_system", "phase132-dialog-fill", dialog.key, current, "T 10/Z 27"), evidence("material", "phase132-dialog-material", dialog.key, current, "black variant materials"), evidence("dimensions", "phase132-dialog-dimensions", dialog.key, current, "official size"), evidence("weight", "phase132-dialog-weight", dialog.key, current, "official 48 g"), evidence("status", "phase132-dialog-status", dialog.key, current, "current title and dialog 3 naming boundary")] },
    media: media("phase132-dialog-primary", "LAMY dialog mechanism and identity boundary（非产品照片）", dialogSvg),
  };
}

export function createPhase132LamyStudioDialogPacks(ids: { studio: string; dialog: string }): CuratedEntityPack[] { return [studioPack(ids.studio), dialogPack(ids.dialog)]; }
export function loadPhase132LamyStudioDialogPacks(workspaceRoot: string, ids: { studio: string; dialog: string }): LoadedCuratedEntityPack[] {
  const packs = createPhase132LamyStudioDialogPacks(ids).map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
  for (const pack of packs) {
    if (Array.from(pack.summary).length < 60 || Array.from(pack.summary).length > 160) throw new Error(`Phase 132 summary must contain 60-160 Unicode characters: ${pack.expectedSlug}.`);
    if (Array.from(pack.bodyMd).length < 2_000) throw new Error(`Phase 132 body_md must contain at least 2,000 Unicode characters: ${pack.expectedSlug}.`);
  }
  return packs;
}
