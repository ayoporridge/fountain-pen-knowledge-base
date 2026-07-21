import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE114_AURORA_BRAND_ID = "CJXe8UpnkHLJ";
export const PHASE114_FAMILY_ID = "s41AURORA88";
export const PHASE114_FAMILY_SLUG = "aurora-88";
export const PHASE114_OPTIMA_ID = "5waoVLPHU2Pt";
export const PHASE114_TARGET_ID = "phase114-aurora-ottantotto-resina-800";
export const PHASE114_TARGET_SLUG = "aurora-ottantotto-resina-800";
export const PHASE114_TARGET_NAME = "Aurora Ottantotto Resina (800)";

export const PHASE114_HISTORY_URL = "https://aurorapen.it/la-nostra-storia/";
export const PHASE114_CATEGORY_URL =
  "https://aurorapen.it/categoria-prodotto/penne/ottantotto/";
export const PHASE114_OFFICIAL_URL =
  "https://aurorapen.it/shop/ottantotto-resina-stilografica/";
export const PHASE114_FAQ_URL = "https://aurorapen.it/faq/";
export const PHASE114_SAMPLE_URL =
  "https://www.fountainpennetwork.com/forum/topic/45704-aurora-88-modern/";
export const PHASE114_CHRONOLOGY_URL = "https://www.fountainpen.it/Aurora/en";

export const PHASE114_FAMILY_SCOPE = "phase114-aurora-88-family-history";
export const PHASE114_CURRENT_SCOPE =
  "phase114-aurora-ottantotto-resina-800-current-2026-07-21";
export const PHASE114_HIGH_END_SCOPE = "phase114-aurora-88-high-end-faq";
export const PHASE114_SAMPLE_SCOPE = "phase114-aurora-800-c-2007-sample";

export const PHASE114_FAMILY_SVG =
  "/images/library/site-original/phase114/aurora/aurora-88-family.svg";
export const PHASE114_TARGET_SVG =
  "/images/library/site-original/phase114/aurora/aurora-ottantotto-resina-800.svg";

const RETRIEVED = "2026-07-21";

function webSource(
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

export const PHASE114_SOURCES = {
  history: webSource({
    key: "phase114-aurora-history",
    registryKey: "aurora-official-phase114",
    registryName: "Aurora official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "aurora-official",
    title: "Aurora La Nostra Storia",
    url: PHASE114_HISTORY_URL,
    homepageUrl: "https://aurorapen.it/",
    summary:
      "官方历史页明确写出 1947 年 Marcello Nizzoli 创造 88，并称其成为意大利设计象征、至今仍在生产；只支撑家族历史与延续。",
    locator:
      "Anni '30-'50 section: 1947, Marcello Nizzoli, celebre 88, Italian design, tuttora in produzione",
  }),
  category: webSource({
    key: "phase114-aurora-ottantotto-category",
    registryKey: "aurora-official-phase114",
    registryName: "Aurora official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "aurora-official",
    title: "Aurora Ottantotto category",
    url: PHASE114_CATEGORY_URL,
    homepageUrl: "https://aurorapen.it/",
    summary:
      "官方 Ottantotto 分类把 Marcello Nizzoli 的经典延续到当代，并列出 Millerighe、Resina 等当前导航；不证明跨 SKU 共享规格。",
    locator:
      "Ottantotto category introduction and current subcategory/product navigation for Millerighe and Resina",
  }),
  exact: webSource({
    key: "phase114-aurora-ottantotto-resina-800-official",
    registryKey: "aurora-official-phase114",
    registryName: "Aurora official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "aurora-official",
    title: "Ottantotto Resina - Stilografica",
    url: PHASE114_OFFICIAL_URL,
    homepageUrl: "https://aurorapen.it/",
    summary:
      "2026-07-21 exact listing：SKU 800、黑色树脂笔帽与笔身、金色饰件、活塞、EF/F/M/B；available 仅为检索日可变快照。",
    locator:
      "product title and SKU 800; 'Stilografica a pistone con cappuccio e corpo in resina nera, finiture dorate'; nib options EF/F/M/B; Disponibile at retrieval",
  }),
  faq: webSource({
    key: "phase114-aurora-faq-high-end-88",
    registryKey: "aurora-official-phase114",
    registryName: "Aurora official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "aurora-official",
    title: "Aurora FAQ",
    url: PHASE114_FAQ_URL,
    homepageUrl: "https://aurorapen.it/",
    summary:
      "FAQ 在 88／高端线层级陈述 14K、隐藏备用墨仓与活塞；没有逐项点名 exact SKU 800，故不得升级为 exact 稳定尖材或容量。",
    locator:
      "FAQ nib section: 14K for high-end lines including 88; high-end hidden reserve and piston sections; line-level scope only",
  }),
  chronology: webSource({
    key: "phase114-fountainpen-it-aurora-chronology",
    registryKey: "fountainpen-it-phase114",
    registryName: "FountainPen.it",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "fountainpen-it-aurora-chronology",
    title: "Fabbrica Italiana Penne a Serbatoio Aurora",
    url: PHASE114_CHRONOLOGY_URL,
    homepageUrl: "https://www.fountainpen.it/",
    author: "FountainPen.it contributors",
    publishedAt: "2023-08-08",
    summary:
      "专业年表独立记录 Aurora 战后重建、Marcello Nizzoli 与早期 88 家族；其 1946/1947 日期口径只作历史边界，不覆盖 Aurora 官方 1947 锚点，也不支撑当前 SKU 800 规格。",
    locator:
      "history and chronology sections: late-1946 introduction, Marcello Nizzoli, early Aurora 88 family and later descendants; date divergence retained against official 1947 wording",
  }),
  sample: webSource({
    key: "phase114-fpn-aurora-800-c-sample-2007",
    registryKey: "fountain-pen-network-phase114",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "community",
    independenceGroup: "fpn-2007-800-c-sample",
    title: "Aurora 88 Modern",
    url: PHASE114_SAMPLE_URL,
    homepageUrl: "https://www.fountainpennetwork.com/",
    author: "Fountain Pen Network review author",
    publishedAt: "2007",
    summary:
      "2007 独立 800/C chrome-trim 样本；claimed 1.8 ml、测量、手感与书写体验仅属该样本，不支撑 2026 gold-trim 800。",
    locator:
      "2007 review locator retained from prior research: 800/C chrome-trim sample, claimed 1.8 ml, measurements, handling and writing impressions",
    limitation: "403/live-fetch limitation on 2026-07-21;sample-only;not-current-product-evidence",
  }),
} as const;

function diagram(
  key: string,
  title: string,
  url: string,
  summary: string,
): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase114",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase114",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary,
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;finish-proof=false;dimensions=1600x900`,
  };
}

export const PHASE114_FAMILY_DIAGRAM = diagram(
  "phase114-aurora-88-family-svg",
  "Aurora 88 家族时间线与型号导航图",
  PHASE114_FAMILY_SVG,
  "本站原创事实图：表达 1947 家族锚点、当代 Ottantotto 导航与 exact 800 入口；非产品照片或规格证明。",
);

export const PHASE114_TARGET_DIAGRAM = diagram(
  "phase114-aurora-800-current-sample-boundary-svg",
  "Aurora 800 current 与 2007 sample 证据边界图",
  PHASE114_TARGET_SVG,
  "本站原创事实图：区分 2026 exact gold-trim listing、FAQ line scope 与 2007 800/C chrome-trim sample。",
);

export const phase114Aurora88FamilyArticle = {
  entityId: PHASE114_FAMILY_ID,
  expectedSlug: PHASE114_FAMILY_SLUG,
  canonicalName: "Aurora 88（系列导航）",
  markdownFile: ".planning/content-research/aurora-88-family-phase114.md",
  storyTitle: "Aurora 88：从 1947 年设计到当代 Ottantotto 的家族导航",
  sourceMarkerPrefix: "curated:phase114:aurora-88-family:",
  sources: [
    PHASE114_SOURCES.history,
    PHASE114_SOURCES.category,
    PHASE114_SOURCES.exact,
    PHASE114_SOURCES.faq,
    PHASE114_SOURCES.chronology,
    PHASE114_SOURCES.sample,
    PHASE114_FAMILY_DIAGRAM,
  ],
  primaryImage: PHASE114_FAMILY_DIAGRAM,
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

export const phase114AuroraOttantottoResina800Pack: CuratedEntityPack = {
  key: "phase114-aurora-ottantotto-resina-800-v1",
  entityId: PHASE114_TARGET_ID,
  expectedType: "pen",
  expectedSlug: PHASE114_TARGET_SLUG,
  canonicalName: PHASE114_TARGET_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/aurora-ottantotto-resina-800-phase114.md",
  storyTitle:
    "Aurora Ottantotto Resina (800)：当前商品与 2007 样本分开读",
  primarySourceKey: PHASE114_SOURCES.exact.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Aurora Ottantotto Resina 800",
      language: "en",
      sourceKey: PHASE114_SOURCES.exact.key,
    },
    {
      alias: "Aurora 88 Resina 800",
      language: "en",
      sourceKey: PHASE114_SOURCES.exact.key,
    },
  ],
  sources: [
    PHASE114_SOURCES.exact,
    PHASE114_SOURCES.category,
    PHASE114_SOURCES.faq,
    PHASE114_SOURCES.chronology,
    PHASE114_SOURCES.sample,
    PHASE114_TARGET_DIAGRAM,
  ],
  scopes: [
    {
      key: PHASE114_FAMILY_SCOPE,
      scopeKey: PHASE114_FAMILY_SCOPE,
      validFrom: "1946",
      productionState: "historical",
      editionScope:
        "Independent chronology establishes early Aurora 88 lineage and date divergence only; early technical details do not qualify current SKU 800 fields.",
    },
    {
      key: PHASE114_CURRENT_SCOPE,
      scopeKey: PHASE114_CURRENT_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Exact listing supplies EF/F/M/B only; nib material is not stated on the exact SKU page.",
      materialScope:
        "Exact SKU 800: black resin cap and body with gold-coloured trim.",
      editionScope:
        "Exact current product, piston filling; availability is a mutable 2026-07-21 snapshot and price/stock are excluded.",
    },
    {
      key: PHASE114_HIGH_END_SCOPE,
      scopeKey: PHASE114_HIGH_END_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "FAQ line-level claim: high-end 88 family uses 14K; not exact SKU 800 evidence.",
      editionScope:
        "FAQ high-end line scope for piston and hidden reserve; no exact capacity or SKU-level qualification.",
    },
    {
      key: PHASE114_SAMPLE_SCOPE,
      scopeKey: PHASE114_SAMPLE_SCOPE,
      validFrom: "2007",
      validTo: "2007",
      productionState: "historical",
      nibScope:
        "Independent 800/C chrome-trim sample; nib and writing impressions remain sample-only.",
      materialScope:
        "Chrome-trim 800/C sample, distinct from the current gold-trim exact listing.",
      editionScope:
        "Claimed 1.8 ml, measurements, feel and writing experience are rejected as current specs.",
    },
  ],
  claims: [
    {
      key: "phase114-current-exact-identity",
      predicate: "current_exact_identity",
      objectText:
        "The 2026-07-21 exact Aurora listing identifies SKU 800 as a black-resin, gold-trim piston fountain pen with EF/F/M/B options; availability is dated and mutable.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: PHASE114_SOURCES.exact.key,
      locator:
        "SKU 800, exact product description, nib options and retrieved-date availability",
      evidence: [
        {
          key: "phase114-current-exact-citation",
          sourceKey: PHASE114_SOURCES.exact.key,
          scopeKey: PHASE114_CURRENT_SCOPE,
          locator:
            "exact 800 black resin, gold trim, piston, EF/F/M/B; Disponibile only at retrieval",
        },
      ],
    },
    {
      key: "phase114-faq-qualified-line-claim",
      predicate: "qualified_family_high_end_claim",
      objectText:
        "Aurora FAQ assigns 14K to high-end lines including 88 and discusses piston/hidden reserve at high-end level; these are not promoted to exact 800 stable nib or capacity fields.",
      factClass: "core",
      confidence: 0.97,
      sourceKey: PHASE114_SOURCES.faq.key,
      locator: "FAQ 14K 88 list and high-end piston/hidden-reserve paragraphs",
      evidence: [
        {
          key: "phase114-faq-line-citation",
          sourceKey: PHASE114_SOURCES.faq.key,
          scopeKey: PHASE114_HIGH_END_SCOPE,
          locator:
            "family/high-end scope only; exact SKU material and capacity not stated",
        },
      ],
    },
    {
      key: "phase114-sample-boundary",
      predicate: "dated_sample_observation",
      objectText:
        "The 2007 FPN item concerns an 800/C chrome-trim sample; claimed 1.8 ml, measurements, feel and writing experience remain sample-qualified and do not describe the 2026 gold-trim 800.",
      factClass: "editorial",
      confidence: 0.9,
      sourceKey: PHASE114_SOURCES.sample.key,
      locator:
        "2007 800/C chrome-trim sample locator; 403/live-fetch limitation retained",
      evidence: [
        {
          key: "phase114-sample-citation",
          sourceKey: PHASE114_SOURCES.sample.key,
          scopeKey: PHASE114_SAMPLE_SCOPE,
          locator:
            "sample-only chrome trim, claimed 1.8 ml, measurements, handling and writing experience",
        },
      ],
    },
    {
      key: "phase114-family-navigation-context",
      predicate: "family_navigation_context",
      objectText:
        "FountainPen.it independently records the early Aurora 88 lineage and Marcello Nizzoli context; its late-1946 chronology is retained as a date divergence, while Aurora official 1947 remains the family-page anchor and no early specification is transferred to SKU 800.",
      factClass: "core",
      confidence: 0.93,
      sourceKey: PHASE114_SOURCES.chronology.key,
      locator:
        "independent Aurora chronology; early 88 family context only, not current 800 specification evidence",
      evidence: [
        {
          key: "phase114-family-chronology-citation",
          sourceKey: PHASE114_SOURCES.chronology.key,
          scopeKey: PHASE114_FAMILY_SCOPE,
          locator:
            "family navigation context; official 1947 anchor retained and early technical details excluded from current SKU",
        },
      ],
    },
  ],
  variants: [
    {
      key: "phase114-current-800-listing",
      name: "Ottantotto Resina fountain pen SKU 800",
      releaseYear: "2026-07-21 listing snapshot",
      productCode: "800",
      notes:
        "Exact black-resin, gold-trim piston fountain pen; EF/F/M/B. Availability is mutable.",
      sourceKey: PHASE114_SOURCES.exact.key,
      variantKind: "market_sku",
    },
  ],
  spec: {
    brandEntityId: PHASE114_AURORA_BRAND_ID,
    values: {
      series_name: PHASE114_TARGET_NAME,
      release_year: "current listing verified 2026-07-21; launch year not asserted",
      nib: "EF, F, M or B width options; exact listing does not state nib material",
      fill_system: "piston",
      material: "black resin cap and body with gold-coloured trim",
      status:
        "current official listing retrieved 2026-07-21; availability is mutable",
    },
    evidence: [
      evidence(
        "brand_entity_id",
        "phase114-spec-brand",
        PHASE114_SOURCES.exact.key,
        PHASE114_CURRENT_SCOPE,
        "Aurora exact listing and locked existing Aurora brand identity",
      ),
      evidence(
        "series_name",
        "phase114-spec-series",
        PHASE114_SOURCES.exact.key,
        PHASE114_CURRENT_SCOPE,
        "exact title and SKU 800",
      ),
      evidence(
        "release_year",
        "phase114-spec-time",
        PHASE114_SOURCES.exact.key,
        PHASE114_CURRENT_SCOPE,
        "retrieved 2026-07-21; not a launch-year assertion",
      ),
      evidence(
        "nib",
        "phase114-spec-nib-widths",
        PHASE114_SOURCES.exact.key,
        PHASE114_CURRENT_SCOPE,
        "exact EF/F/M/B option selectors; no material claim",
      ),
      evidence(
        "fill_system",
        "phase114-spec-piston",
        PHASE114_SOURCES.exact.key,
        PHASE114_CURRENT_SCOPE,
        "exact 'stilografica a pistone' description",
      ),
      evidence(
        "material",
        "phase114-spec-material",
        PHASE114_SOURCES.exact.key,
        PHASE114_CURRENT_SCOPE,
        "exact black resin cap/body and gold-coloured trim",
      ),
      evidence(
        "status",
        "phase114-spec-status",
        PHASE114_SOURCES.exact.key,
        PHASE114_CURRENT_SCOPE,
        "Disponibile at retrieval only; price and future stock excluded",
      ),
      evidence(
        "nib",
        "phase114-spec-14k-rejected",
        PHASE114_SOURCES.faq.key,
        PHASE114_HIGH_END_SCOPE,
        "FAQ 14K is 88/high-end line-level, rejected as exact SKU 800 stable nib material",
        false,
      ),
      evidence(
        "dimensions",
        "phase114-spec-sample-dimensions-rejected",
        PHASE114_SOURCES.sample.key,
        PHASE114_SAMPLE_SCOPE,
        "2007 800/C sample measurements rejected as current 800 specs",
        false,
      ),
      evidence(
        "weight",
        "phase114-spec-sample-experience-rejected",
        PHASE114_SOURCES.sample.key,
        PHASE114_SAMPLE_SCOPE,
        "2007 800/C feel and writing experience rejected as current stable fields",
        false,
      ),
    ],
  },
  timeline: [
    {
      key: "phase114-sample-2007",
      title: "FPN records an 800/C chrome-trim sample",
      eventType: "community_event",
      startDate: "2007",
      circa: false,
      description:
        "Independent sample-only locator; claimed capacity, measurements and experience are excluded from current specs.",
      sourceKey: PHASE114_SOURCES.sample.key,
    },
    {
      key: "phase114-current-listing",
      title: "Aurora exact SKU 800 listing verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Black resin, gold trim, piston, EF/F/M/B and dated availability verified on the exact listing.",
      sourceKey: PHASE114_SOURCES.exact.key,
    },
  ],
  media: [
    {
      key: "phase114-aurora-800-primary",
      title: "Aurora 800 current／2007 sample 证据边界图（非产品照片）",
      sourceKey: PHASE114_TARGET_DIAGRAM.key,
      localPath: PHASE114_TARGET_SVG,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片；不证明真实比例、颜色、饰面、笔尖材质或容量。",
      sourceUrl: PHASE114_TARGET_SVG,
      usageStatus: "primary",
    },
  ],
};

export function loadPhase114AuroraOttantottoResina800Pack(
  workspaceRoot: string,
): LoadedCuratedEntityPack {
  const loaded = loadCuratedEntityPack(
    workspaceRoot,
    phase114AuroraOttantottoResina800Pack,
  );
  if (Array.from(loaded.summary).length < 60 || Array.from(loaded.summary).length > 160) {
    throw new Error("Phase 114 target summary must contain 60-160 Unicode characters.");
  }
  if (Array.from(loaded.bodyMd).length < 2_000) {
    throw new Error("Phase 114 target body_md must contain at least 2,000 Unicode characters.");
  }
  return loaded;
}
