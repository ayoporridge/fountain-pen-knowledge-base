import { createHash } from "node:crypto";
import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";
import { PHASE42_LAMY_BRAND_ID } from "./phase42-lamy-platinum";

export const PHASE133_LAMY_ID = PHASE42_LAMY_BRAND_ID;
export const PHASE133_LOGO_RAW_SLUG = "凌美-lamy-logo";
export const PHASE133_LOGO_SLUG = "lamy-logo";

export function phase133MadeById(entityId: string): string {
  return `phase133-lamy-made-by-${createHash("sha256").update(entityId).digest("hex").slice(0, 20)}`;
}

export function phase133ReverseId(entityId: string): string {
  return `phase133-lamy-reverse-${createHash("sha256").update(entityId).digest("hex").slice(0, 20)}`;
}

const RETRIEVED = "2026-07-22";
const GLOBAL_CATEGORY_URL =
  "https://www.lamy.com/en-us/writing-tools/fountain-pens?limit=60&reverse=false&sortKey=COLLECTION_DEFAULT";
const PHILIPPINES_URL =
  "https://www.lamyphilippines.com/products/logo-005-fp";
const CARE_URL = "https://www.lamy.com/en-us/care-tips/fountain-pens";
const PEN_ADDICT_URL =
  "https://www.penaddict.com/blog/2011/9/9/lamy-logo-fountain-pen-review.html";
const GOULET_URL =
  "https://www.gouletpens.com/blogs/fountain-pen-blog/lamy-logo-quick-look";
const SVG =
  "/images/library/site-original/phase133/lamy/lamy-logo.svg";

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

const globalCategory = web({
  key: "phase133-lamy-global-fountain-category",
  registryKey: "lamy-global-phase133",
  registryName: "LAMY",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "lamy-global",
  homepageUrl: "https://www.lamy.com/",
  author: "LAMY",
  title: "LAMY Shop Fountain Pens category",
  url: GLOBAL_CATEGORY_URL,
  summary:
    "The current global fountain-pen category exposes one LAMY logo product in its model filter; this establishes current product presence but not a globally uniform exact SKU.",
  locator:
    "Fountain Pens category; Model filter; LAMY logo (1 available product)",
});

const philippines = web({
  key: "phase133-lamy-ph-logo-005-fp",
  registryKey: "lamy-philippines-phase133",
  registryName: "LAMY Philippines",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "lamy-philippines",
  homepageUrl: "https://www.lamyphilippines.com/",
  author: "LAMY Philippines",
  title: "LAMY Logo Fountain Pen | Stainless — Logo 005 FP",
  url: PHILIPPINES_URL,
  summary:
    "The regional official page identifies Logo 005 FP, Wolfgang Fabian, polished steel nib, brushed or cyclical-matt stainless-steel finishes, T10 cartridges and Z26/Z27 converter; bundle contents are regional.",
  locator:
    "Logo 005 FP product description; design; nib; casing; clip; fountain-pen filling and regional inclusions",
});

const care = web({
  key: "phase133-lamy-fountain-care",
  registryKey: "lamy-global-phase133",
  registryName: "LAMY",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "lamy-global",
  homepageUrl: "https://www.lamy.com/",
  author: "LAMY",
  title: "LAMY fountain-pen care tips",
  url: CARE_URL,
  summary:
    "LAMY's fountain-pen care guidance supports water flushing and service escalation without solvents, boiling water or forced mechanism work.",
  locator: "fountain-pen cleaning, nib handling and service guidance",
});

const penAddict = web({
  key: "phase133-penaddict-logo-review",
  registryKey: "pen-addict-phase133",
  registryName: "The Pen Addict",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pen-addict",
  homepageUrl: "https://www.penaddict.com/",
  author: "Bryan Gushikawa / The Pen Addict",
  title: "Lamy Logo Fountain Pen Review",
  url: PEN_ADDICT_URL,
  publishedAt: "2011-09-09",
  summary:
    "A guest review covers one medium-nib Logo sample, its slim body, textured metal grip, spring clip, posting balance, cartridge/converter use and sample-specific writing impressions.",
  locator:
    "guest-review disclosure; M sample; grip and balance; clip; posting; writing and flow observations",
});

const goulet = web({
  key: "phase133-goulet-logo-quick-look",
  registryKey: "goulet-phase133",
  registryName: "The Goulet Pen Company",
  sourceType: "retailer",
  tier: "professional_secondary",
  independenceGroup: "goulet",
  homepageUrl: "https://www.gouletpens.com/",
  author: "Brian Goulet",
  title: "LAMY logo: Quick Look",
  url: GOULET_URL,
  publishedAt: "2014-07-24",
  summary:
    "The retailer quick look records one approximately 18 g sample, snap cap, posting, matte/brushed finishes and Z27 use; its aluminium wording conflicts with the current regional official stainless-steel description and is not used for the material field.",
  locator:
    "18 g reviewed sample; snap cap; posting; two finishes; Z27; conflicting material wording isolated",
});

const diagram: CuratedSource = {
  key: "phase133-lamy-logo-svg",
  registryKey: "fountain-pen-graph-editorial-phase133",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase133",
  title: "LAMY logo identity and regional configuration diagram",
  url: SVG,
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  summary: "Site-original factual SVG; non-photo, non-logo and not to scale.",
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
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

export function createPhase133LamyLogoPack(
  entityId: string,
): CuratedEntityPack {
  const current = "phase133-logo-global-current";
  const regional = "phase133-logo-ph-005-current";
  const sample2011 = "phase133-logo-m-review-sample-2011";
  const sample2014 = "phase133-logo-review-sample-2014";
  return {
    key: "phase133-lamy-logo-v1",
    entityId,
    expectedType: "pen",
    expectedSlug: PHASE133_LOGO_SLUG,
    canonicalName: "LAMY logo",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/lamy-logo-phase133.md",
    storyTitle: "LAMY logo：细圆杆、弹簧笔夹与区域配置边界",
    primarySourceKey: philippines.key,
    depthTier: "A",
    aliases: [
      { alias: "LAMY logo", language: "en", sourceKey: globalCategory.key },
      { alias: "LAMY Logo", language: "en", sourceKey: philippines.key },
      { alias: "LAMY Logo 005 FP", language: "en", sourceKey: philippines.key },
      { alias: "凌美 Logo", language: "zh", sourceKey: philippines.key },
    ],
    sources: [globalCategory, philippines, care, penAddict, goulet, diagram],
    scopes: [
      {
        key: current,
        scopeKey: current,
        validFrom: RETRIEVED,
        productionState: "current",
        editionScope:
          "Global fountain-pen category exposes one LAMY logo product; no uniform exact-SKU fields inferred.",
      },
      {
        key: regional,
        scopeKey: regional,
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope: "LAMY Philippines Logo 005 FP polished steel nib.",
        materialScope:
          "Brushed or cyclical-matt stainless-steel finishes with steel/plastic clip variants.",
        editionScope:
          "T10 and Z26/Z27 plus listed box contents apply to the Philippines regional offer only.",
      },
      {
        key: sample2011,
        scopeKey: sample2011,
        validFrom: "2011-09-09",
        validTo: "2011-09-09",
        productionState: "historical",
        nibScope: "One guest-reviewed medium-nib sample.",
        materialScope: "Textured metal grip and slim-body observations.",
        editionScope:
          "Writing, flow, posting and balance impressions remain reviewer/sample scoped.",
      },
      {
        key: sample2014,
        scopeKey: sample2014,
        validFrom: "2014-07-24",
        validTo: "2014-07-24",
        productionState: "historical",
        materialScope:
          "One approximately 18 g sample; conflicting aluminium wording excluded from current material spec.",
        editionScope:
          "Matte/brushed availability and Z27 observation apply to the reviewed retail context.",
      },
    ],
    claims: [
      {
        key: "phase133-logo-current-presence",
        predicate: "current_model_presence",
        objectText:
          "LAMY's current global fountain-pen category exposes one LAMY logo product, without establishing globally uniform SKU specifications.",
        factClass: "core",
        confidence: 0.99,
        sourceKey: globalCategory.key,
        locator: globalCategory.archiveLocator ?? globalCategory.summary,
        evidence: [
          {
            key: "phase133-logo-current-presence-e",
            sourceKey: globalCategory.key,
            scopeKey: current,
            locator: "Model filter: LAMY logo (1 available product)",
          },
        ],
      },
      {
        key: "phase133-logo-regional-spec",
        predicate: "regional_product_specification",
        objectText:
          "LAMY Philippines Logo 005 FP uses a polished steel nib, brushed or cyclical-matt stainless-steel finishes, T10 cartridges and Z26/Z27 converter.",
        factClass: "core",
        confidence: 0.99,
        sourceKey: philippines.key,
        locator: philippines.archiveLocator ?? philippines.summary,
        evidence: [
          {
            key: "phase133-logo-regional-spec-e",
            sourceKey: philippines.key,
            scopeKey: regional,
            locator: "regional product nib, casing and filling sections",
          },
        ],
      },
      {
        key: "phase133-logo-bundle-boundary",
        predicate: "regional_bundle_boundary",
        objectText:
          "The converter, two cartridges, gift box, bag and warranty card listed by LAMY Philippines are regional inclusions and not a global packaging promise.",
        factClass: "core",
        confidence: 0.99,
        sourceKey: philippines.key,
        locator: philippines.archiveLocator ?? philippines.summary,
        evidence: [
          {
            key: "phase133-logo-bundle-boundary-e",
            sourceKey: philippines.key,
            scopeKey: regional,
            locator: "regional inclusions and change disclaimer",
          },
        ],
      },
      {
        key: "phase133-logo-2011-sample",
        predicate: "professional_sample_boundary",
        objectText:
          "The 2011 guest review covers one medium-nib sample; grip, posting, balance, line width, sound and flow observations do not replace current official fields.",
        factClass: "core",
        confidence: 0.97,
        sourceKey: penAddict.key,
        locator: penAddict.archiveLocator ?? penAddict.summary,
        evidence: [
          {
            key: "phase133-logo-2011-sample-e",
            sourceKey: penAddict.key,
            scopeKey: sample2011,
            locator: "guest-reviewed M sample and subjective sections",
          },
        ],
      },
      {
        key: "phase133-logo-2014-sample",
        predicate: "conflicting_sample_boundary",
        objectText:
          "Goulet's approximately 18 g sample and aluminium wording remain sample scoped; current material follows the regional official stainless-steel description.",
        factClass: "core",
        confidence: 0.97,
        sourceKey: goulet.key,
        locator: goulet.archiveLocator ?? goulet.summary,
        evidence: [
          {
            key: "phase133-logo-2014-sample-e",
            sourceKey: goulet.key,
            scopeKey: sample2014,
            locator: "18 g and conflicting material statement",
          },
        ],
      },
    ],
    variants: [
      {
        key: "phase133-logo-005-brushed",
        name: "LAMY Logo 005 FP brushed stainless steel",
        productCode: "005 FP",
        notes: "Philippines regional official finish.",
        sourceKey: philippines.key,
        variantKind: "market_sku",
      },
      {
        key: "phase133-logo-005-cyclical-matt",
        name: "LAMY Logo 005 FP cyclical matt stainless steel",
        productCode: "005 FP",
        notes: "Philippines regional official finish; exact availability by retailer.",
        sourceKey: philippines.key,
        variantKind: "market_sku",
      },
    ],
    spec: {
      brandEntityId: PHASE133_LAMY_ID,
      values: {
        series_name: "LAMY logo",
        origin_country:
          "LAMY product line; exact manufacturing statement by regional SKU/packaging",
        nib: "Philippines Logo 005 FP: polished steel nib",
        fill_system:
          "Philippines Logo 005 FP: LAMY T10 cartridge / Z26 or Z27 converter",
        material:
          "Philippines Logo 005 FP: brushed or cyclical-matt stainless-steel finish",
        dimensions:
          "No globally uniform current dimension asserted; verify exact regional SKU",
        weight:
          "No current official global weight asserted; 18 g is a 2014 review sample only",
        status:
          "Current global category presence; exact configuration and stock vary by market",
      },
      evidence: [
        evidence(
          "brand_entity_id",
          "phase133-logo-brand",
          globalCategory.key,
          current,
          "official LAMY category",
        ),
        evidence(
          "series_name",
          "phase133-logo-series",
          globalCategory.key,
          current,
          "current model filter",
        ),
        evidence(
          "origin_country",
          "phase133-logo-origin",
          globalCategory.key,
          current,
          "LAMY product context; no factory inference",
        ),
        evidence(
          "nib",
          "phase133-logo-nib",
          philippines.key,
          regional,
          "regional polished steel nib",
        ),
        evidence(
          "fill_system",
          "phase133-logo-fill",
          philippines.key,
          regional,
          "regional T10 and Z26/Z27",
        ),
        evidence(
          "material",
          "phase133-logo-material",
          philippines.key,
          regional,
          "regional stainless-steel finishes",
        ),
        evidence(
          "dimensions",
          "phase133-logo-dimensions",
          globalCategory.key,
          current,
          "no uniform dimension inferred",
        ),
        evidence(
          "weight",
          "phase133-logo-weight",
          goulet.key,
          sample2014,
          "18 g sample explicitly not generalized",
        ),
        evidence(
          "status",
          "phase133-logo-status",
          globalCategory.key,
          current,
          "one current category product",
        ),
      ],
    },
    media: [
      {
        key: "phase133-logo-primary",
        title: "LAMY logo identity and regional configuration（非产品照片）",
        sourceKey: diagram.key,
        localPath: SVG,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "site-original factual SVG；non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof。",
        sourceUrl: SVG,
        usageStatus: "primary",
      },
    ],
  };
}

export function loadPhase133LamyLogoPack(
  workspaceRoot: string,
  entityId: string,
): LoadedCuratedEntityPack {
  const pack = loadCuratedEntityPack(
    workspaceRoot,
    createPhase133LamyLogoPack(entityId),
  );
  if (Array.from(pack.summary).length < 60 || Array.from(pack.summary).length > 160)
    throw new Error("Phase 133 summary must contain 60-160 Unicode characters.");
  if (Array.from(pack.bodyMd).length < 2_000)
    throw new Error("Phase 133 body_md must contain at least 2,000 Unicode characters.");
  return pack;
}
