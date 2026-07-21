import type { CuratedEntityPack, CuratedSource, LoadedCuratedEntityPack, SpecFieldKey } from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE113_WANCHER_ID = "eOfD77nOeENN";
export const PHASE113_DREAM_ARTICLE_ID = "2aoD07lwSYCV";
export const PHASE113_TRUE_EBONITE_ID = "phase107-wancher-true-ebonite-matte-black";
export const PHASE113_AKA_TAMENURI_ID = "phase113-wancher-dream-pen-true-urushi-aka-tamenuri";
export const PHASE113_AKA_TAMENURI_SLUG = "wancher-dream-pen-true-urushi-aka-tamenuri";
export const PHASE113_OFFICIAL_URL = "https://www.wancherpen.com/products/dream-pen-true-urushi-akatamenuri";
export const PHASE113_PRODUCTION_URL = "https://www.pencilcaseblog.com/2019/08/revisiting-wancher-dream-pen-urushi.html";
export const PHASE113_PENCILCASE_PROTOTYPE_URL = "https://www.pencilcaseblog.com/2018/02/wancher-dream-pen-urushi-fountain-pen.html";
export const PHASE113_ED_JELLEY_PROTOTYPE_URL = "https://edjelley.com/2018/01/25/wancher-ebonite-urushi-dream-pen-kickstarter-fountain-pen-review/";

const RETRIEVED = "2026-07-21";
const CURRENT_SCOPE = "phase113-current-official-listing-2026-07-21";
const PRODUCTION_SCOPE = "phase113-pencilcase-2019-production-order";
const PENCILCASE_PROTOTYPE_SCOPE = "phase113-pencilcase-2018-loaned-black-prototype";
const ED_JELLEY_PROTOTYPE_SCOPE = "phase113-ed-jelley-2018-wancher-supplied-black-prototype";
const SVG_PATH = "/images/library/site-original/phase113/wancher/wancher-dream-pen-true-urushi-aka-tamenuri.svg";

function webSource(
  input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"> & {
    locator: string;
  },
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
  key: "phase113-wancher-aka-tamenuri-official",
  registryKey: "wancher-official-phase113",
  registryName: "Wancher official",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "wancher-official",
  title: "Dream Pen True Urushi Aka Tamenuri",
  url: PHASE113_OFFICIAL_URL,
  homepageUrl: "https://www.wancherpen.com/",
  summary:
    "2026-07-21 exact current listing：ebonite + urushi、Wancher 所称 Wajima hand-work／至少三个月流程、European International C/C、#6 JoWo steel／Wancher 18K、plastic／ebonite feed 与 clip options。",
  locator:
    "exact product title; About True Urushi and Wajima hand-work/process copy; body material, filling system, nib, feed and clip option selectors; add-to-cart state observed only as mutable retrieval snapshot",
});

const production = webSource({
  key: "phase113-pencilcase-production-order-2019",
  registryKey: "pencilcaseblog-wancher-phase113",
  registryName: "The Pencilcase Blog",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pencilcase-production-order-2019",
  title: "Revisiting the Wancher Dream Pen Urushi",
  url: PHASE113_PRODUCTION_URL,
  homepageUrl: "https://www.pencilcaseblog.com/",
  author: "The Pencilcase Blog author",
  publishedAt: "2019-08",
  summary:
    "作者与父亲自费订购 production pens；父亲选择 Aka-Tamenuri，随单证书命名 Taya Shikkiten；页面声明 no affiliate links；较少漆层只是作者 hypothesis。",
  locator:
    "production-order introduction and no-affiliate disclosure; father chose Aka-Tamenuri; accompanying certificate names Taya Shikkiten; author explicitly frames fewer urushi layers as a possible explanation",
});

const pencilcasePrototype = webSource({
  key: "phase113-pencilcase-loaned-black-prototype-2018",
  registryKey: "pencilcaseblog-wancher-phase113",
  registryName: "The Pencilcase Blog",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "pencilcase-loaned-prototype-2018",
  title: "Wancher Dream Pen Urushi Fountain Pen Review",
  url: PHASE113_PENCILCASE_PROTOTYPE_URL,
  homepageUrl: "https://www.pencilcaseblog.com/",
  author: "The Pencilcase Blog author",
  publishedAt: "2018-02",
  summary:
    "loaned black prototype；不是 Aka Tamenuri production unit。文章的尺寸、重量、steel nib 与写感只用于 Dream Pen／urushi family prototype history。",
  locator:
    "review disclosure identifies a loaned prototype; photographs/text identify a black non-Aka sample; measurements, weight, nib and experience remain sample-only",
});

const edJelleyPrototype = webSource({
  key: "phase113-ed-jelley-supplied-black-prototype-2018",
  registryKey: "ed-jelley-wancher-phase113",
  registryName: "Ed Jelley",
  sourceType: "blog",
  tier: "professional_secondary",
  independenceGroup: "ed-jelley-supplied-prototype-2018",
  title: "Wancher Ebonite Urushi Dream Pen Kickstarter Fountain Pen Review",
  url: PHASE113_ED_JELLEY_PROTOTYPE_URL,
  homepageUrl: "https://edjelley.com/",
  author: "Ed Jelley",
  publishedAt: "2018-01-25",
  summary:
    "Wancher-supplied black prototype；不是 Aka Tamenuri production unit。其尺寸、重量、steel nib、finish 与写感不进入 current Aka 配置。",
  locator:
    "review disclosure identifies a Wancher-supplied prototype; black non-Aka sample description; measurements, weight, steel nib and writing experience remain prototype-only",
});

const diagram: CuratedSource = {
  key: "phase113-wancher-aka-tamenuri-boundary-svg",
  registryKey: "fountain-pen-graph-editorial-phase113",
  registryName: "Fountain Pen Graph editorial studio",
  sourceType: "user_submission",
  tier: "primary",
  independenceGroup: "fountain-pen-graph-editorial-phase113",
  title: "Wancher Aka Tamenuri 三层证据边界图",
  url: SVG_PATH,
  homepageUrl: "/",
  itemType: "image",
  author: "Fountain Pen Graph editorial",
  retrievedAt: RETRIEVED,
  summary:
    "本站原创三层 evidence-boundary 示意图；区分 current brand claims、2019 production-order evidence 与 2018 non-Aka prototypes。",
  allowedUse: "store_full",
  license: "site-original",
  archiveUrl: SVG_PATH,
  archiveLocator: `project-public-asset:${SVG_PATH};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;urushi-layer-replica=false;dimensions=1600x900`,
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

export const phase113WancherDreamPenAkaTamenuriPack: CuratedEntityPack = {
  key: "phase113-wancher-dream-pen-true-urushi-aka-tamenuri-v1",
  entityId: PHASE113_AKA_TAMENURI_ID,
  expectedType: "pen",
  expectedSlug: PHASE113_AKA_TAMENURI_SLUG,
  canonicalName: "Wancher Dream Pen True Urushi Aka Tamenuri",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/wancher-dream-pen-true-urushi-aka-tamenuri-phase113.md",
  storyTitle:
    "Wancher Dream Pen True Urushi Aka Tamenuri：品牌现售页、量产订单与 prototype 不能揉成一层证据",
  primarySourceKey: official.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Dream Pen True Urushi Aka Tamenuri",
      language: "en",
      sourceKey: official.key,
    },
    {
      alias: "Dream Pen True Urushi Aka-Tamenuri",
      language: "en",
      sourceKey: production.key,
    },
  ],
  sources: [official, production, pencilcasePrototype, edJelleyPrototype, diagram],
  scopes: [
    {
      key: CURRENT_SCOPE,
      scopeKey: CURRENT_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "2026-07-21 current listing: #6 JoWo steel or Wancher 18K nib; plastic or ebonite feed options.",
      materialScope:
        "Exact Aka Tamenuri listing: ebonite body with urushi; Wajima hand-work is a qualified Wancher claim.",
      editionScope:
        "European International cartridge/converter and clip options; price, inventory and add-to-cart are mutable retrieval state, not stable specifications.",
    },
    {
      key: PRODUCTION_SCOPE,
      scopeKey: PRODUCTION_SCOPE,
      validFrom: "2019-08",
      validTo: "2019-08",
      productionState: "historical",
      nibScope:
        "Production-order evidence only; no current nib/feed option is inferred from this order.",
      materialScope:
        "Father's ordered Aka-Tamenuri and accompanying certificate naming Taya Shikkiten are limited to the reviewed order.",
      editionScope:
        "Author and father self-funded the production order; no affiliate links disclosed; fewer-layers is the author's qualified hypothesis only.",
    },
    {
      key: PENCILCASE_PROTOTYPE_SCOPE,
      scopeKey: PENCILCASE_PROTOTYPE_SCOPE,
      validFrom: "2018-02",
      validTo: "2018-02",
      productionState: "prototype",
      nibScope:
        "Loaned black prototype; steel nib and writing experience are excluded from current Aka configuration.",
      materialScope:
        "Black non-Aka prototype; measurements, weight and finish are sample-only.",
      editionScope:
        "Historical Dream Pen／urushi family context only; not production Aka ownership evidence.",
    },
    {
      key: ED_JELLEY_PROTOTYPE_SCOPE,
      scopeKey: ED_JELLEY_PROTOTYPE_SCOPE,
      validFrom: "2018-01-25",
      validTo: "2018-01-25",
      productionState: "prototype",
      nibScope:
        "Wancher-supplied black prototype; steel nib and writing experience are excluded from current Aka configuration.",
      materialScope:
        "Black non-Aka prototype; measurements, weight and finish are sample-only.",
      editionScope:
        "Historical Dream Pen／urushi family context only; not production Aka ownership evidence.",
    },
  ],
  claims: [
    {
      key: "phase113-current-identity-configuration",
      predicate: "model_identity_and_current_configuration",
      objectText:
        "2026-07-21 exact listing identifies one ebonite-and-urushi Aka Tamenuri pen with European International C/C, #6 JoWo steel／Wancher 18K, plastic／ebonite feed and clip options.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: official.key,
      locator: "exact title, material, filling and option selectors",
      evidence: [
        {
          key: "phase113-current-official-citation",
          sourceKey: official.key,
          scopeKey: CURRENT_SCOPE,
          locator:
            "exact current title; ebonite + urushi; cartridge/converter; nib, feed and clip options",
        },
      ],
    },
    {
      key: "phase113-qualified-wajima-workflow",
      predicate: "qualified_brand_claim",
      objectText:
        "Wancher 表示该 True Urushi 在 Wajima 由职人手工作业，流程至少三个月；这是 current official listing 的品牌自述，不因单次订单证书自动升级为独立普遍事实。",
      factClass: "core",
      confidence: 0.92,
      sourceKey: official.key,
      locator: "Wancher About True Urushi and production-process copy",
      evidence: [
        {
          key: "phase113-wajima-brand-claim-citation",
          sourceKey: official.key,
          scopeKey: CURRENT_SCOPE,
          locator: "brand-authored Wajima hand-work and at-least-three-month process statement",
          note: "qualified Wancher claim; not independently generalized",
        },
      ],
    },
    {
      key: "phase113-production-order-certificate",
      predicate: "production_order_evidence",
      objectText:
        "Pencilcase Blog 记录作者与父亲自费订购 production pens、父亲选择 Aka-Tamenuri，且该订单随附证书命名 Taya Shikkiten；页面声明没有 affiliate links。",
      factClass: "core",
      confidence: 0.96,
      sourceKey: production.key,
      locator: "2019 order, father Aka-Tamenuri, certificate and no-affiliate disclosure",
      evidence: [
        {
          key: "phase113-production-order-citation",
          sourceKey: production.key,
          scopeKey: PRODUCTION_SCOPE,
          locator:
            "self-funded production order; father's Aka-Tamenuri; accompanying certificate names Taya Shikkiten; no affiliate links",
          note: "order-scoped evidence; not provenance proof for every current unit",
        },
      ],
    },
    {
      key: "phase113-fewer-layers-hypothesis",
      predicate: "author_hypothesis_fewer_urushi_layers",
      objectText:
        "作者提出 production pen 可能使用较少漆层；这是明确归属于作者的 hypothesis，不是确定层数、官方流程反证或现售 Aka 的普遍事实。",
      factClass: "editorial",
      confidence: 0.65,
      sourceKey: production.key,
      locator: "author's possible-fewer-layers explanation",
      evidence: [
        {
          key: "phase113-fewer-layers-hypothesis-citation",
          sourceKey: production.key,
          scopeKey: PRODUCTION_SCOPE,
          locator: "explicitly qualified possible explanation by the author",
          note: "hypothesis/qualified; must not be promoted to approved stable spec",
        },
      ],
    },
    {
      key: "phase113-pencilcase-prototype-boundary",
      predicate: "historical_non_aka_prototype",
      objectText:
        "2018 Pencilcase Blog 样本是 loaned black prototype，不是 Aka；其尺寸、重量、steel nib、finish 和写感只说明 family prototype history。",
      factClass: "editorial",
      confidence: 0.95,
      sourceKey: pencilcasePrototype.key,
      locator: "loan disclosure and black prototype review context",
      evidence: [
        {
          key: "phase113-pencilcase-prototype-citation",
          sourceKey: pencilcasePrototype.key,
          scopeKey: PENCILCASE_PROTOTYPE_SCOPE,
          locator:
            "loaned black non-Aka prototype; sample measurements, weight, steel nib and experience excluded from current claims",
        },
      ],
    },
    {
      key: "phase113-ed-jelley-prototype-boundary",
      predicate: "historical_non_aka_prototype",
      objectText:
        "2018 Ed Jelley 样本是 Wancher-supplied black prototype，不是 Aka；其尺寸、重量、steel nib、finish 和写感只说明 family prototype history。",
      factClass: "editorial",
      confidence: 0.95,
      sourceKey: edJelleyPrototype.key,
      locator: "supply disclosure and black prototype review context",
      evidence: [
        {
          key: "phase113-ed-jelley-prototype-citation",
          sourceKey: edJelleyPrototype.key,
          scopeKey: ED_JELLEY_PROTOTYPE_SCOPE,
          locator:
            "Wancher-supplied black non-Aka prototype; sample measurements, weight, steel nib and experience excluded from current claims",
        },
      ],
    },
  ],
  variants: [
    {
      key: "phase113-current-option-snapshot",
      name: "Current listing option snapshot",
      releaseYear: "2026-07-21 listing snapshot",
      notes:
        "Nib, feed and clip choices belong to the exact retrieved listing; price, stock and future availability remain mutable.",
      sourceKey: official.key,
      variantKind: "market_sku",
    },
  ],
  spec: {
    brandEntityId: PHASE113_WANCHER_ID,
    values: {
      series_name: "Wancher Dream Pen True Urushi Aka Tamenuri",
      release_year: "current listing verified 2026-07-21; launch year not asserted",
      nib: "#6 JoWo steel or Wancher 18K; plastic or ebonite feed options",
      fill_system: "European International cartridge or converter",
      material: "ebonite body with urushi; exact Aka Tamenuri current listing",
      status: "current official listing snapshot retrieved 2026-07-21",
    },
    evidence: [
      evidence("brand_entity_id", "phase113-spec-brand", official.key, CURRENT_SCOPE, "exact Wancher listing and locked existing brand identity"),
      evidence("series_name", "phase113-spec-series", official.key, CURRENT_SCOPE, "exact current product title"),
      evidence("release_year", "phase113-spec-time", official.key, CURRENT_SCOPE, "retrieved 2026-07-21; retrieval is not launch year"),
      evidence("nib", "phase113-spec-current-nib", official.key, CURRENT_SCOPE, "#6 JoWo steel or Wancher 18K plus plastic or ebonite feed options"),
      evidence("fill_system", "phase113-spec-fill", official.key, CURRENT_SCOPE, "European International cartridge/converter"),
      evidence("material", "phase113-spec-material", official.key, CURRENT_SCOPE, "ebonite body with urushi; exact Aka Tamenuri listing"),
      evidence("status", "phase113-spec-status", official.key, CURRENT_SCOPE, "retrieved-date current listing; excludes mutable commerce state"),
      evidence("material", "phase113-spec-hypothesis-rejected", production.key, PRODUCTION_SCOPE, "possible fewer urushi layers is an author hypothesis and rejected as stable material spec", false),
      evidence("dimensions", "phase113-spec-pencilcase-dimensions-rejected", pencilcasePrototype.key, PENCILCASE_PROTOTYPE_SCOPE, "loaned black prototype measurements rejected as current Aka spec", false),
      evidence("weight", "phase113-spec-pencilcase-weight-rejected", pencilcasePrototype.key, PENCILCASE_PROTOTYPE_SCOPE, "loaned black prototype weight rejected as current Aka spec", false),
      evidence("nib", "phase113-spec-pencilcase-nib-rejected", pencilcasePrototype.key, PENCILCASE_PROTOTYPE_SCOPE, "loaned black prototype steel nib and writing experience rejected as current Aka configuration", false),
      evidence("dimensions", "phase113-spec-ed-jelley-dimensions-rejected", edJelleyPrototype.key, ED_JELLEY_PROTOTYPE_SCOPE, "Wancher-supplied black prototype measurements rejected as current Aka spec", false),
      evidence("weight", "phase113-spec-ed-jelley-weight-rejected", edJelleyPrototype.key, ED_JELLEY_PROTOTYPE_SCOPE, "Wancher-supplied black prototype weight rejected as current Aka spec", false),
      evidence("nib", "phase113-spec-ed-jelley-nib-rejected", edJelleyPrototype.key, ED_JELLEY_PROTOTYPE_SCOPE, "Wancher-supplied black prototype steel nib and writing experience rejected as current Aka configuration", false),
    ],
  },
  timeline: [
    {
      key: "phase113-ed-jelley-prototype-2018",
      title: "Ed Jelley records a Wancher-supplied black prototype",
      eventType: "community_event",
      startDate: "2018-01-25",
      circa: false,
      description:
        "Non-Aka prototype family context only; no sample specification transfers to the current Aka SKU.",
      sourceKey: edJelleyPrototype.key,
    },
    {
      key: "phase113-pencilcase-prototype-2018",
      title: "Pencilcase Blog records a loaned black prototype",
      eventType: "community_event",
      startDate: "2018-02",
      circa: true,
      description:
        "Non-Aka prototype family context only; no sample specification transfers to the current Aka SKU.",
      sourceKey: pencilcasePrototype.key,
    },
    {
      key: "phase113-production-order-2019",
      title: "Pencilcase Blog revisits self-funded production orders",
      eventType: "community_event",
      startDate: "2019-08",
      circa: true,
      description:
        "Father's Aka-Tamenuri, order certificate naming Taya Shikkiten, no-affiliate disclosure and qualified fewer-layers hypothesis remain order-scoped.",
      sourceKey: production.key,
    },
    {
      key: "phase113-current-listing-window",
      title: "Wancher exact Aka Tamenuri listing verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Current official configuration and qualified Wajima/process claims verified; mutable commerce state excluded from stable specs.",
      sourceKey: official.key,
    },
  ],
  media: [
    {
      key: "phase113-aka-tamenuri-primary",
      title: "Wancher Aka Tamenuri 三层证据边界图（非产品照片）",
      sourceKey: diagram.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片；非比例、色漆、漆层、表面或商标复刻。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary",
    },
  ],
};

export function loadPhase113WancherDreamPenAkaTamenuriPack(
  workspaceRoot: string,
): LoadedCuratedEntityPack {
  const loaded = loadCuratedEntityPack(
    workspaceRoot,
    phase113WancherDreamPenAkaTamenuriPack,
  );
  if (Array.from(loaded.bodyMd).length < 2_000) {
    throw new Error("Phase 113 body_md must contain at least 2,000 Unicode characters.");
  }
  return loaded;
}
