import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE128_WANCHER_ID = "eOfD77nOeENN";
export const PHASE128_DREAM_ARTICLE_ID = "2aoD07lwSYCV";
export const PHASE128_TRUE_URUSHI_BLACK_ID =
  "phase128-wancher-dream-pen-true-urushi-black";
export const PHASE128_TRUE_URUSHI_BLACK_SLUG =
  "wancher-dream-pen-true-urushi-black";
export const PHASE128_BYAKUDAN_ID =
  "phase128-wancher-dream-pen-byakudan-nuri";
export const PHASE128_BYAKUDAN_SLUG =
  "wancher-dream-pen-byakudan-nuri";
export const PHASE128_TARGET_IDS = [
  PHASE128_TRUE_URUSHI_BLACK_ID,
  PHASE128_BYAKUDAN_ID,
] as const;
export const PHASE128_TARGET_SLUGS = [
  PHASE128_TRUE_URUSHI_BLACK_SLUG,
  PHASE128_BYAKUDAN_SLUG,
] as const;
export const PHASE128_MADE_BY_IDS = PHASE128_TARGET_IDS.map(
  (id) => `phase128-made-by-${id}`,
);
export const PHASE128_REVERSE_IDS = PHASE128_MADE_BY_IDS.map(
  (id) => `rev-${id}`,
);

const RETRIEVED = "2026-07-22";
const COLLECTION_URL = "https://www.wancherpen.com/collections/dream-pen";
const BLACK_URL =
  "https://www.wancherpen.com/products/dream-pen-true-urushi-black";
const BYAKUDAN_URL =
  "https://www.wancherpen.com/products/dream-pen-byakudan-nuri";
const PROTOTYPE_URL =
  "https://www.pencilcaseblog.com/2018/02/wancher-dream-pen-urushi-fountain-pen.html";
const PRODUCTION_URL =
  "https://www.pencilcaseblog.com/2019/08/revisiting-wancher-dream-pen-urushi.html";
const BLACK_SVG =
  "/images/library/site-original/phase128/wancher/wancher-dream-pen-true-urushi-black.svg";
const BYAKUDAN_SVG =
  "/images/library/site-original/phase128/wancher/wancher-dream-pen-byakudan-nuri.svg";

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
const collection = webSource({
  key: "phase128-wancher-dream-pen-collection",
  registryKey: "wancher-official-phase128",
  registryName: "Wancher official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official",
  title: "Dream Pen Fountain Pen Collection",
  url: COLLECTION_URL,
  homepageUrl: "https://www.wancherpen.com/",
  summary:
    "Official Dream Pen collection establishes the family navigation and its broad material/craft range; its large mutable card count is not treated as one model.",
  locator:
    "Dream Pen heading; ebonite/ABS/aluminium family context; Wajima/Tsugaru/Kyoto/Shimane craft context; mutable product-card grid",
});

const blackOfficial = webSource({
  key: "phase128-wancher-true-urushi-black-exact",
  registryKey: "wancher-official-phase128",
  registryName: "Wancher official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official",
  title: "True Urushi - Black",
  url: BLACK_URL,
  homepageUrl: "https://www.wancherpen.com/",
  summary:
    "Exact current product page supports ebonite plus urushi, Wajima hand painting, European International cartridge/converter, #6 JoWo steel or Wancher 18K nib, feed choices and compact air-tight cap.",
  locator:
    "heading and lines 714-768: handmade note, Wajima process, ebonite/urushi, filling, nib, feed, cap and packaging; availability checked 2026-07-22",
});

const byakudanOfficial = webSource({
  key: "phase128-wancher-byakudan-nuri-exact",
  registryKey: "wancher-official-phase128",
  registryName: "Wancher official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official",
  title: "Dream Pen Byakudan-nuri",
  url: BYAKUDAN_URL,
  homepageUrl: "https://www.wancherpen.com/",
  summary:
    "Exact page supports the foil/transparent-urushi/spiral-polish sequence, edge Kintsugi-art description, ebonite plus urushi, European International filling, listed nib/feed menu and a dated sold-out state.",
  locator:
    "heading and lines 718-786: sold-out snapshot, Byakudan process, edge Kintsugi art, exact material/filling/nib/feed/cap fields",
});

const prototype = webSource({
  key: "phase128-pencilcaseblog-black-prototype-2018",
  registryKey: "pencilcaseblog-phase128",
  registryName: "The Pencil Case Blog",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pencilcaseblog-black-prototype-2018",
  title: "Wancher 'The Dream Pen' Urushi Fountain Pen Review",
  url: PROTOTYPE_URL,
  homepageUrl: "https://www.pencilcaseblog.com/",
  author: "Dries De Schepper",
  publishedAt: "2018-02-21",
  summary:
    "Disclosed black-urushi production prototype: cigar form, cap/barrel step, 18K broad/ebonite-feed sample and converter-fit observation remain prototype-only.",
  locator:
    "lines 31-52: Kickstarter family, black urushi production prototype disclosure, form, cap, sample nib/feed and converter issue",
});

const production = webSource({
  key: "phase128-pencilcaseblog-production-followup-2019",
  registryKey: "pencilcaseblog-phase128",
  registryName: "The Pencil Case Blog",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pencilcaseblog-production-samples-2019",
  title: "Revisiting the Wancher Dream Pen Urushi Fountain Pen",
  url: PRODUCTION_URL,
  homepageUrl: "https://www.pencilcaseblog.com/",
  author: "Dries De Schepper",
  publishedAt: "2019-08-28",
  summary:
    "Follow-up after five months with purchased production pens; sample finish, certificates, Shu and Aka-Tamenuri observations stay attached to those disclosed pens.",
  locator:
    "lines 17-28: prototype-to-production distinction, five-month use, purchased production pens, certificate and finish-specific sample observations",
});

function diagram(
  key: string,
  title: string,
  localPath: string,
): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase128",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase128",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "Site-original factual SVG showing product and evidence boundaries without copying a product photograph or logo.",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900`,
  };
}

const blackDiagram = diagram(
  "phase128-wancher-black-boundary-svg",
  "True Urushi Black exact/current versus 2018 prototype boundary",
  BLACK_SVG,
);
const byakudanDiagram = diagram(
  "phase128-wancher-byakudan-boundary-svg",
  "Byakudan-nuri official layer and evidence boundary",
  BYAKUDAN_SVG,
);

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

const blackCurrent = "phase128-black-current-2026-07-22";
const blackSample = "phase128-black-prototype-2018-02-21";
const byakudanCurrent = "phase128-byakudan-current-2026-07-22";
const familySamples = "phase128-dream-pen-production-samples-2019-08-28";

export const phase128WancherPacks: CuratedEntityPack[] = [
  {
    key: "phase128-wancher-true-urushi-black-v1",
    entityId: PHASE128_TRUE_URUSHI_BLACK_ID,
    expectedType: "pen",
    expectedSlug: PHASE128_TRUE_URUSHI_BLACK_SLUG,
    canonicalName: "Wancher Dream Pen True Urushi Black",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/wancher-dream-pen-true-urushi-black-phase128.md",
    storyTitle:
      "Wancher True Urushi Black：当前具体款与 2018 黑色 prototype",
    primarySourceKey: blackOfficial.key,
    depthTier: "A",
    aliases: [
      {
        alias: "True Urushi - Black",
        language: "en",
        sourceKey: blackOfficial.key,
      },
      {
        alias: "Wancher True Urushi Black",
        language: "en",
        sourceKey: blackOfficial.key,
      },
    ],
    sources: [
      blackOfficial,
      collection,
      prototype,
      production,
      blackDiagram,
    ],
    scopes: [
      {
        key: blackCurrent,
        scopeKey: blackCurrent,
        market: "Wancher international exact page",
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope:
          "#6 JoWo stainless steel or Wancher 18K gold; feed choice must be checked per order.",
        materialScope:
          "Ebonite with urushi; hand-painted in Wajima; handmade variation expected.",
        editionScope:
          "True Urushi - Black exact SKU only; commerce availability is a dated snapshot.",
      },
      {
        key: blackSample,
        scopeKey: blackSample,
        market: "disclosed professional prototype sample",
        validFrom: "2018-02-21",
        validTo: "2018-02-21",
        productionState: "prototype",
        nibScope:
          "One black prototype with 18K rhodium-plated broad nib and ebonite feed.",
        editionScope:
          "Prototype form, cap/step, feel and converter-fit observations are sample-only.",
      },
    ],
    claims: [
      {
        key: "phase128-black-exact-identity",
        predicate: "exact_product_identity",
        objectText:
          "True Urushi - Black is one exact Dream Pen SKU with ebonite/urushi construction, Wajima hand painting and a current configurable nib/feed menu.",
        factClass: "core",
        confidence: 0.99,
        sourceKey: blackOfficial.key,
        locator: blackOfficial.archiveLocator ?? blackOfficial.summary,
        evidence: [
          {
            key: "phase128-black-exact-citation",
            sourceKey: blackOfficial.key,
            scopeKey: blackCurrent,
            locator: "exact heading, process and specification fields",
          },
        ],
      },
      {
        key: "phase128-black-prototype-boundary",
        predicate: "professional_prototype_sample_boundary",
        objectText:
          "The 2018 black urushi review concerns one disclosed production prototype; its 18K broad nib, ebonite feed, feel and converter-fit issue do not define current stock.",
        factClass: "core",
        confidence: 0.97,
        sourceKey: prototype.key,
        locator: prototype.archiveLocator ?? prototype.summary,
        evidence: [
          {
            key: "phase128-black-prototype-citation",
            sourceKey: prototype.key,
            scopeKey: blackSample,
            locator: "black production prototype disclosure and sample observations",
          },
        ],
      },
    ],
    variants: [],
    spec: {
      brandEntityId: PHASE128_WANCHER_ID,
      values: {
        series_name: "Wancher Dream Pen True Urushi Black",
        origin_country:
          "Dream Pen body with urushi hand-painted by Japanese craftsmen in Wajima",
        nib: "#6 JoWo stainless steel or Wancher 18K gold",
        fill_system:
          "European International Standard cartridge or converter",
        material: "Ebonite body with Urushi",
        status:
          "Exact product page checked 2026-07-22; availability remains mutable",
      },
      evidence: [
        evidence(
          "brand_entity_id",
          "phase128-black-brand",
          blackOfficial.key,
          blackCurrent,
          "Wancher exact product page",
        ),
        evidence(
          "series_name",
          "phase128-black-series",
          blackOfficial.key,
          blackCurrent,
          "True Urushi - Black exact heading",
        ),
        evidence(
          "origin_country",
          "phase128-black-origin",
          blackOfficial.key,
          blackCurrent,
          "Wajima hand-painting statement",
        ),
        evidence(
          "nib",
          "phase128-black-nib",
          blackOfficial.key,
          blackCurrent,
          "#6 JoWo stainless steel or Wancher 18K",
        ),
        evidence(
          "fill_system",
          "phase128-black-fill",
          blackOfficial.key,
          blackCurrent,
          "European International cartridge/converter",
        ),
        evidence(
          "material",
          "phase128-black-material",
          blackOfficial.key,
          blackCurrent,
          "Ebonite, Urushi",
        ),
        evidence(
          "status",
          "phase128-black-status",
          blackOfficial.key,
          blackCurrent,
          "dated exact-page snapshot",
        ),
        evidence(
          "nib",
          "phase128-black-sample-nib-rejected",
          prototype.key,
          blackSample,
          "prototype 18K broad and ebonite feed rejected as current fixed configuration",
          false,
        ),
        evidence(
          "fill_system",
          "phase128-black-sample-converter-rejected",
          prototype.key,
          blackSample,
          "one prototype converter-fit issue rejected as line-wide behavior",
          false,
        ),
      ],
    },
    timeline: [
      {
        key: "phase128-black-prototype-2018",
        title: "Black urushi production prototype reviewed",
        eventType: "community_event",
        startDate: "2018-02-21",
        circa: false,
        description:
          "One disclosed prototype; its sample configuration and observations are not current specifications.",
        sourceKey: prototype.key,
      },
      {
        key: "phase128-black-current-check",
        title: "True Urushi Black exact page checked",
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description:
          "Current exact product fields and mutable availability snapshot.",
        sourceKey: blackOfficial.key,
      },
    ],
    media: [
      {
        key: "phase128-black-primary",
        title: "True Urushi Black exact／prototype boundary（非产品照片）",
        sourceKey: blackDiagram.key,
        localPath: BLACK_SVG,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "site-original factual SVG；non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof。",
        sourceUrl: BLACK_SVG,
        usageStatus: "primary",
      },
    ],
  },
  {
    key: "phase128-wancher-byakudan-nuri-v1",
    entityId: PHASE128_BYAKUDAN_ID,
    expectedType: "pen",
    expectedSlug: PHASE128_BYAKUDAN_SLUG,
    canonicalName: "Wancher Dream Pen Byakudan-nuri",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/wancher-dream-pen-byakudan-nuri-phase128.md",
    storyTitle:
      "Wancher Byakudan-nuri：箔、透明漆、螺旋层次与边缘金继式处理",
    primarySourceKey: byakudanOfficial.key,
    depthTier: "A",
    aliases: [
      {
        alias: "Dream Pen Byakudan-nuri",
        language: "en",
        sourceKey: byakudanOfficial.key,
      },
      {
        alias: "Wancher Byakudan Nuri",
        language: "en",
        sourceKey: byakudanOfficial.key,
      },
      {
        alias: "Wancher 白檀涂 Dream Pen",
        language: "zh",
        sourceKey: byakudanOfficial.key,
      },
    ],
    sources: [
      byakudanOfficial,
      collection,
      prototype,
      production,
      byakudanDiagram,
    ],
    scopes: [
      {
        key: byakudanCurrent,
        scopeKey: byakudanCurrent,
        market: "Wancher international exact page",
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope:
          "#6 JoWo steel, Wancher 18K, Keiryu/Keiryu-Kodachi or Shogun 18K as listed; compatibility must be checked per order.",
        materialScope:
          "Ebonite and urushi with foil, transparent coloured urushi, spiral application/polish and edge Kintsugi-art description.",
        editionScope:
          "Exact Byakudan-nuri SKU; sold-out is a 2026-07-22 availability snapshot, not permanent retirement.",
      },
      {
        key: familySamples,
        scopeKey: familySamples,
        market: "professional Dream Pen production samples",
        validFrom: "2019-08-28",
        validTo: "2019-08-28",
        productionState: "historical",
        editionScope:
          "Purchased Shu and Aka-Tamenuri production samples; not Byakudan-nuri and not evidence for its foil, edge treatment or feel.",
      },
    ],
    claims: [
      {
        key: "phase128-byakudan-exact-identity",
        predicate: "exact_product_identity",
        objectText:
          "Dream Pen Byakudan-nuri is one exact ebonite/urushi SKU whose official process uses foil, transparent coloured urushi, spiral application, polishing and an edge treatment called Kintsugi art.",
        factClass: "core",
        confidence: 0.99,
        sourceKey: byakudanOfficial.key,
        locator:
          byakudanOfficial.archiveLocator ?? byakudanOfficial.summary,
        evidence: [
          {
            key: "phase128-byakudan-exact-citation",
            sourceKey: byakudanOfficial.key,
            scopeKey: byakudanCurrent,
            locator:
              "exact heading, Byakudan process, edge treatment and specifications",
          },
        ],
      },
      {
        key: "phase128-byakudan-sample-exclusion",
        predicate: "professional_sample_exclusion",
        objectText:
          "The 2018 prototype and 2019 production follow-up concern other Dream Pen urushi samples, so their finish and writing observations cannot qualify Byakudan-nuri.",
        factClass: "core",
        confidence: 0.97,
        sourceKey: production.key,
        locator: production.archiveLocator ?? production.summary,
        evidence: [
          {
            key: "phase128-byakudan-sample-exclusion-citation",
            sourceKey: production.key,
            scopeKey: familySamples,
            locator:
              "Shu and Aka-Tamenuri sample identities exclude Byakudan-nuri",
          },
        ],
      },
    ],
    variants: [],
    spec: {
      brandEntityId: PHASE128_WANCHER_ID,
      values: {
        series_name: "Wancher Dream Pen Byakudan-nuri",
        origin_country:
          "Wancher Dream Pen Japanese craft product; exact artisan/location not inferred beyond the page",
        nib: "#6 JoWo stainless steel, Wancher 18K gold, Keiryu / Keiryu-Kodachi, or Shogun 18K as listed",
        fill_system:
          "European International Standard cartridge or converter",
        material:
          "Ebonite and Urushi; foil plus transparent coloured urushi with polished spiral layers and edge Kintsugi-art treatment",
        status:
          "Sold out on exact page checked 2026-07-22; permanent retirement not asserted",
      },
      evidence: [
        evidence(
          "brand_entity_id",
          "phase128-byakudan-brand",
          byakudanOfficial.key,
          byakudanCurrent,
          "Wancher exact product page",
        ),
        evidence(
          "series_name",
          "phase128-byakudan-series",
          byakudanOfficial.key,
          byakudanCurrent,
          "Dream Pen Byakudan-nuri exact heading",
        ),
        evidence(
          "origin_country",
          "phase128-byakudan-origin",
          collection.key,
          byakudanCurrent,
          "Dream Pen official Japanese craft context; exact artisan not inferred",
        ),
        evidence(
          "nib",
          "phase128-byakudan-nib",
          byakudanOfficial.key,
          byakudanCurrent,
          "listed nib menu",
        ),
        evidence(
          "fill_system",
          "phase128-byakudan-fill",
          byakudanOfficial.key,
          byakudanCurrent,
          "European International cartridge/converter",
        ),
        evidence(
          "material",
          "phase128-byakudan-material",
          byakudanOfficial.key,
          byakudanCurrent,
          "ebonite/urushi and disclosed Byakudan layer sequence",
        ),
        evidence(
          "status",
          "phase128-byakudan-status",
          byakudanOfficial.key,
          byakudanCurrent,
          "sold-out snapshot checked 2026-07-22",
        ),
        evidence(
          "material",
          "phase128-byakudan-family-sample-rejected",
          production.key,
          familySamples,
          "Shu/Aka-Tamenuri production samples rejected as Byakudan finish proof",
          false,
        ),
        evidence(
          "nib",
          "phase128-byakudan-prototype-nib-rejected",
          prototype.key,
          familySamples,
          "black prototype nib/feel rejected as Byakudan current behavior",
          false,
        ),
      ],
    },
    timeline: [
      {
        key: "phase128-byakudan-family-samples-2019",
        title: "Other Dream Pen production samples revisited",
        eventType: "community_event",
        startDate: "2019-08-28",
        circa: false,
        description:
          "Shu and Aka-Tamenuri samples provide family history only and exclude Byakudan-nuri.",
        sourceKey: production.key,
      },
      {
        key: "phase128-byakudan-current-check",
        title: "Byakudan-nuri exact page checked sold out",
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description:
          "Dated availability snapshot; exact craft and configuration fields remain documented.",
        sourceKey: byakudanOfficial.key,
      },
    ],
    media: [
      {
        key: "phase128-byakudan-primary",
        title: "Byakudan-nuri official layer boundary（非产品照片）",
        sourceKey: byakudanDiagram.key,
        localPath: BYAKUDAN_SVG,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "site-original factual SVG；non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof。",
        sourceUrl: BYAKUDAN_SVG,
        usageStatus: "primary",
      },
    ],
  },
];

export function loadPhase128WancherPacks(
  workspaceRoot: string,
): LoadedCuratedEntityPack[] {
  const packs = phase128WancherPacks.map((pack) =>
    loadCuratedEntityPack(workspaceRoot, pack),
  );
  for (const pack of packs) {
    if (Array.from(pack.summary).length < 60 || Array.from(pack.summary).length > 160)
      throw new Error("Phase 128 summary must contain 60-160 Unicode characters.");
    if (Array.from(pack.bodyMd).length < 2_000)
      throw new Error("Phase 128 body_md must contain at least 2,000 Unicode characters.");
  }
  return packs;
}
