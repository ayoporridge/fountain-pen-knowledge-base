import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE124_BRAND_ID = "e51tJpejEkXY";
export const PHASE124_3776_ID = "ekPMWnot9inz";
export const PHASE124_CURIDAS_ID = "BoZ4C2WSqk0K";
export const PHASE124_PROCYON_ID = "phase121-platinum-procyon-pns-5000";
export const PHASE124_PRESIDENT_ID = "a1t4DNomp4Ge";
export const PHASE124_IZUMO_ARTICLE_ID = "OOumUrtFoAqu";
export const PHASE124_PIZ_ID = "phase123-platinum-izumo-piz-80000n";
export const PHASE124_ARTICLE_ID = "ogo1UmxmcXJT";
export const PHASE124_RAW_NAME = "白金 Platinum 富士旬景PNB-13000";
export const PHASE124_RAW_SLUG = "白金-platinum-富士旬景pnb-13000";
export const PHASE124_ARTICLE_NAME = "Platinum Fuji Shunkei 富士旬景系列";
export const PHASE124_ARTICLE_SLUG = "platinum-fuji-shunkei";
export const PHASE124_LEGACY_MADE_BY_ID = "3zG7ESdVS1JO";
export const PHASE124_LEGACY_REVERSE_ID = "rev-3zG7ESdVS1JO";

export const PHASE124_SERIES_URL =
  "https://www.platinum-pen.co.jp/common/img/pdf/urokogumo%28english%29.pdf";
export const PHASE124_PNB13000_URL =
  "https://www.platinum-pen.co.jp/en/news/detail/?pid=8807";

export interface Phase124Edition {
  key: "shungyo" | "kumpoo" | "rokka" | "shiun" | "kinshu";
  ordinal: number;
  year: string;
  name: string;
  productCode: string;
  officialUrl: string;
  officialPublishedAt: string;
  color: string;
  nibs: readonly string[];
  size: string;
  weight: string;
  material: string;
  trim: string;
  production: string;
  fill: string;
  accessories: string;
  sampleUrl: string;
  sampleTitle: string;
  sampleAuthor: string;
  samplePublishedAt: string;
  sampleTier: "professional_secondary" | "retailer";
  sampleType: "blog" | "retailer";
  sampleSummary: string;
  sampleLocator: string;
}

export const PHASE124_EDITIONS: readonly Phase124Edition[] = [
  {
    key: "shungyo",
    ordinal: 1,
    year: "2017",
    name: "Shungyo",
    productCode: "PNB-25000SY",
    officialUrl: "https://www.platinum-pen.co.jp/en/news/detail/?pid=8638",
    officialPublishedAt: "2017-06-26",
    color: "#19 Akatsukiiro",
    nibs: ["Soft Fine", "Fine", "Medium", "Broad", "Double Broad"],
    size: "139.5 mm × 15.4 mm",
    weight: "21 g",
    material: "AS resin; 14K wide (14-26) rhodium-finished nib",
    trim: "Rhodium-finished brass rings, beryllium-copper clip and neo-black Mount Fuji nut",
    production: "3,776 numbered pieces; released 2017-07-01",
    fill: "Platinum cartridge / Converter 700",
    accessories: "Box-C1SG, blue-black cartridge, Converter 700 and 35-sheet Shungyo letter paper",
    sampleUrl:
      "https://www.penaddict.com/blog/2017/9/5/platinum-3776-shungyo-fountain-pen-review",
    sampleTitle: "Platinum 3776 Shungyo Fountain Pen Review",
    sampleAuthor: "Brad Dowdy",
    samplePublishedAt: "2017-09-05",
    sampleTier: "professional_secondary",
    sampleType: "blog",
    sampleSummary:
      "One JetPens-supplied Shungyo Soft Fine sample; the line, sweet spot and pace observations apply only to that disclosed specimen.",
    sampleLocator:
      "title/byline/date; Soft Fine sample paragraphs; 3,776-unit note; JetPens provided-at-no-charge disclosure",
  },
  {
    key: "kumpoo",
    ordinal: 2,
    year: "2018",
    name: "Kumpoo",
    productCode: "PNB-25000SK",
    officialUrl: "https://www.platinum-pen.co.jp/en/news/detail/?pid=7505",
    officialPublishedAt: "2018-06-08",
    color: "#43 Translucent Turquoise Blue",
    nibs: ["Ultra Extra Fine", "Fine", "Soft Medium (overseas limited)"],
    size: "139.5 mm × 15.4 mm",
    weight: "20.9 g",
    material: "AS resin; 14K wide (14-26) rhodium-finished nib",
    trim: "Rhodium-finished brass rings and beryllium-copper clip",
    production: "2,500 numbered pieces worldwide; released 2018-07-01",
    fill: "Platinum cartridge / Converter 700",
    accessories: "Box-C1T, blue-black cartridge, Converter 700 and Kumpoo blotter card",
    sampleUrl:
      "https://www.penaddict.com/blog/2018/8/31/platinum-3776-kumpoo-fountain-pen-a-review",
    sampleTitle: "Platinum 3776 Kumpoo Fountain Pen: A Review",
    sampleAuthor: "Susan M. Pigott",
    samplePublishedAt: "2018-08-31",
    sampleTier: "professional_secondary",
    sampleType: "blog",
    sampleSummary:
      "One discounted Vanness-purchased Kumpoo Soft Medium sample; comfort, line and nib feel remain specimen-only observations.",
    sampleLocator:
      "title/byline/date; Soft Medium sample, comfort and writing paragraphs; purchased-at-a-discount disclosure",
  },
  {
    key: "rokka",
    ordinal: 3,
    year: "2019",
    name: "Rokka",
    productCode: "PNB-30000SR",
    officialUrl: "https://www.platinum-pen.co.jp/en/news/detail/?pid=7506",
    officialPublishedAt: "2019-06-11",
    color: "#6 Rokka (clear snowflake-cut body)",
    nibs: ["Extra Fine", "Fine", "Soft Medium"],
    size: "139.5 mm × 15.4 mm",
    weight: "20.9 g",
    material: "AS resin; 14K wide (14-26) rhodium-finished nib",
    trim: "Rhodium-finished brass rings and beryllium-copper clip",
    production: "2,500 numbered pieces worldwide; released 2019-07-01",
    fill: "Platinum cartridge / Converter 700",
    accessories: "Box-G1WSR, blue-black cartridge, Converter 700 and Rokka blotter card",
    sampleUrl:
      "https://www.penaddict.com/blog/2019/9/13/platinum-3776-century-rokka-fountain-pen-review",
    sampleTitle: "Platinum #3776 Century Rokka Fountain Pen: A Review",
    sampleAuthor: "Susan M. Pigott",
    samplePublishedAt: "2019-09-13",
    sampleTier: "professional_secondary",
    sampleType: "blog",
    sampleSummary:
      "One JetPens-supplied Rokka Soft Medium #1869 sample used for a month; feel, line and measurements remain sample-only.",
    sampleLocator:
      "title/byline/date; #1869/2500; Soft Medium and one-month use paragraphs; JetPens provided-at-no-charge disclosure",
  },
  {
    key: "shiun",
    ordinal: 4,
    year: "2020",
    name: "Shiun",
    productCode: "PNB-35000SS",
    officialUrl: "https://www.platinum-pen.co.jp/en/news/detail/?pid=9605",
    officialPublishedAt: "2020-06-24",
    color: "Purple translucent cloud-cut body",
    nibs: ["Extra Fine", "Fine", "Medium", "Broad"],
    size: "139.5 mm × 15.4 mm",
    weight: "20.5 g",
    material: "AS resin; rhodium-plated 14K wide nib",
    trim: "Rhodium-plated brass rings and beryllium-copper clip",
    production: "3,776 numbered pieces worldwide",
    fill: "Platinum cartridge / Converter 700",
    accessories: "Box-G1VSS, blue-black cartridge, Converter 700 and Shiun blotter card",
    sampleUrl:
      "https://journalsandjottings.blogspot.com/2020/07/a-review-platinum-3776-century-shiun.html",
    sampleTitle: "A Review - Platinum 3776 Century Shiun",
    sampleAuthor: "Cass",
    samplePublishedAt: "2020-07-11",
    sampleTier: "professional_secondary",
    sampleType: "blog",
    sampleSummary:
      "Owner-purchased Shiun #3626 Broad sample after two days; weight, posting, line and value opinions are not line-wide facts.",
    sampleLocator:
      "title/date/byline; purchase disclosure; #3626/3776; Broad nib, measured weight, posting and two-day observation paragraphs",
  },
  {
    key: "kinshu",
    ordinal: 5,
    year: "2021",
    name: "Kinshu",
    productCode: "PNB-36000SK",
    officialUrl: "https://www.platinum-pen.co.jp/en/news/detail/?pid=10162",
    officialPublishedAt: "2021-06-24",
    color: "Hiiro scarlet autumn-foliage cut body",
    nibs: ["Extra Fine", "Fine", "Medium", "Broad"],
    size: "139.5 mm × 15.4 mm",
    weight: "20.5 g",
    material: "AS resin; 14K gold nib",
    trim: "Gold-plated brass rings and beryllium-copper clip",
    production: "Final edition; numbered production matched actual customer order quantity",
    fill: "Platinum cartridge / gold converter",
    accessories: "Exclusive box, gold converter, blue-black cartridge, Kinshu blotter card and five-pattern memorial bookmark",
    sampleUrl: "https://racheldelafuente.com/blog/2024-pens/",
    sampleTitle: "Year in Review – 2024 Pens",
    sampleAuthor: "Rachel de la Fuente",
    samplePublishedAt: "2024-12-20",
    sampleTier: "professional_secondary",
    sampleType: "blog",
    sampleSummary:
      "One second-hand Kinshu Extra Fine owner sample; appearance and writing impression remain a brief specimen-only observation.",
    sampleLocator:
      "Year in Review – 2024 Pens; author/date; section 11 Platinum #3776 Century Fuji Shunkei Kinshu; second-hand EF acquisition and owner-history sentences",
  },
] as const;

export const PHASE124_TARGET_IDS = PHASE124_EDITIONS.map(
  (edition) => `phase124-platinum-fuji-shunkei-${edition.key}`,
);
export const PHASE124_NEW_MADE_BY_IDS = PHASE124_EDITIONS.map(
  (edition) => `phase124-platinum-fuji-shunkei-${edition.key}-made-by`,
);
export const PHASE124_NEW_REVERSE_IDS = PHASE124_NEW_MADE_BY_IDS.map(
  (id) => `rev-${id}`,
);

const RETRIEVED = "2026-07-22";
export const PHASE124_ARTICLE_SVG_PATH =
  "/images/library/site-original/phase124/platinum/platinum-fuji-shunkei-family.svg";

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

const official = {
  registryKey: "platinum-official-phase124",
  registryName: "Platinum Pen Co., Ltd.",
  sourceType: "official" as const,
  tier: "primary" as const,
  independenceGroup: "platinum-official",
  homepageUrl: "https://www.platinum-pen.co.jp/",
  author: "Platinum Pen Co., Ltd.",
};

export const phase124SeriesSource = webSource({
  ...official,
  key: "phase124-platinum-fuji-series-boundary",
  title: "The New #3776 Century Fuji Series — Fuji Unkei Uroko-Gumo",
  url: PHASE124_SERIES_URL,
  publishedAt: "2023",
  summary:
    "Official chronology says Fuji Five Lakes ran 2011–2016, Fuji Shunkei 2017–2021 and the separate successor Fuji Unkei began in 2023.",
  locator:
    "PDF page 1 lines 5–15: Fuji Five Lakes 2011–2016; Fuji Shunkei 2017–2021; new Fuji Unkei in 2023; regular versus irregular cutting distinction",
});

export const phase124PnbConflictSource = webSource({
  ...official,
  key: "phase124-platinum-pnb13000-identity-conflict",
  title: "#3776 Century Chenonceau White / Laurel Green",
  url: PHASE124_PNB13000_URL,
  publishedAt: "2018-10-31",
  summary:
    "Official PNB-13000 announcement assigns that product number to standard #3776 Century Chenonceau White and Laurel Green, not Fuji Shunkei.",
  locator:
    "#3776 CENTURY Chenonceau White / Laurel Green heading; Product number PNB-13000; #2/#41 color table; release date 2018-11-10",
});

export const phase124KinshuRetailerSource = webSource({
  key: "phase124-kinshu-retailer-context",
  registryKey: "bertrams-inkwell-phase124",
  registryName: "Bertram's Inkwell",
  sourceType: "retailer",
  tier: "retailer",
  independenceGroup: "bertrams-retailer",
  homepageUrl: "https://bertramsinkwell.com/",
  author: "Bertram's Inkwell",
  title: "Platinum #3776 LE Kinshu Fountain Pen",
  url: "https://bertramsinkwell.com/blogs/bertrams-inkwell-blog-talk-about-writing/platinum-3776-le-kinshu-fountain-pen",
  publishedAt: "2021-07-27",
  summary:
    "Retailer editorial with stock, purchase-link and shipping-promotion context; retained only as non-qualifying commercial evidence.",
  locator:
    "title/date; store identity; remaining-stock language; purchase link and shipping promotion; no independent specimen protocol",
});

function officialEditionSource(edition: Phase124Edition): CuratedSource {
  return webSource({
    ...official,
    key: `phase124-platinum-${edition.key}-official`,
    title: `New Product Specifications #3776 Century ${edition.name}`,
    url: edition.officialUrl,
    publishedAt: edition.officialPublishedAt,
    summary: `${edition.ordinal}/5 Fuji Shunkei edition; ${edition.productCode}; ${edition.production}; exact nib/material/size/accessory fields.`,
    locator: `${edition.officialPublishedAt} Pressrelease; Fuji Shunkei / #3776 CENTURY ${edition.name.toUpperCase()} heading; Product number ${edition.productCode}; body color, nib, serial/quantity, specifications, accessories and release fields`,
  });
}

function sampleSource(edition: Phase124Edition): CuratedSource {
  return webSource({
    key: `phase124-${edition.key}-sample`,
    registryKey:
      edition.key === "shiun"
        ? "journals-and-jottings-phase124"
        : edition.key === "kinshu"
          ? "rachels-reflections-phase124"
          : "pen-addict-phase124",
    registryName:
      edition.key === "shiun"
        ? "Journals & Jottings"
        : edition.key === "kinshu"
          ? "Rachel's Reflections"
          : "The Pen Addict",
    sourceType: edition.sampleType,
    tier: edition.sampleTier,
    independenceGroup:
      edition.key === "kinshu"
        ? "rachel-de-la-fuente"
        : edition.key === "shiun"
          ? "journals-jottings-cass"
          : `pen-addict-${edition.sampleAuthor.toLowerCase().replace(/[^a-z]+/g, "-")}`,
    homepageUrl:
      edition.key === "shiun"
        ? "https://journalsandjottings.blogspot.com/"
        : edition.key === "kinshu"
          ? "https://racheldelafuente.com/"
          : "https://www.penaddict.com/",
    author: edition.sampleAuthor,
    title: edition.sampleTitle,
    url: edition.sampleUrl,
    publishedAt: edition.samplePublishedAt,
    summary: edition.sampleSummary,
    locator: edition.sampleLocator,
  });
}

function diagramSource(edition: Phase124Edition): CuratedSource {
  const path = `/images/library/site-original/phase124/platinum/platinum-fuji-shunkei-${edition.key}.svg`;
  return {
    key: `phase124-${edition.key}-diagram`,
    registryKey: "fountain-pen-graph-editorial-phase124",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase124",
    title: `${edition.name} exact product boundary map`,
    url: path,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: `Original factual SVG for ${edition.productCode}, its edition scope and sample boundary.`,
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: path,
    archiveLocator: `project-public-asset:${path};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900`,
  };
}

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

function buildPack(edition: Phase124Edition): CuratedEntityPack {
  const officialSource = officialEditionSource(edition);
  const sample = sampleSource(edition);
  const diagram = diagramSource(edition);
  const currentScope = `phase124-${edition.key}-official-edition`;
  const seriesScope = `phase124-${edition.key}-series-boundary`;
  const conflictScope = `phase124-${edition.key}-pnb13000-conflict`;
  const sampleScope = `phase124-${edition.key}-sample`;
  const retailerScope = `phase124-${edition.key}-retailer-context`;
  const id = `phase124-platinum-fuji-shunkei-${edition.key}`;
  const slug = `platinum-fuji-shunkei-${edition.key}`;
  const aliases = [
    {
      alias: `Platinum #3776 Century ${edition.name}`,
      language: "en",
      sourceKey: officialSource.key,
    },
    {
      alias: `Platinum ${edition.productCode}`,
      language: "en",
      sourceKey: officialSource.key,
    },
  ];
  return {
    key: `phase124-platinum-fuji-shunkei-${edition.key}-v1`,
    entityId: id,
    expectedType: "pen",
    expectedSlug: slug,
    canonicalName: `Platinum #3776 Century Fuji Shunkei ${edition.name} ${edition.productCode}`,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: `.planning/content-research/platinum-fuji-shunkei-${edition.key}-phase124.md`,
    storyTitle: `Platinum Fuji Shunkei ${edition.name}：第 ${edition.ordinal} 款与证据边界`,
    primarySourceKey: officialSource.key,
    depthTier: "A",
    aliases,
    sources: [
      officialSource,
      phase124SeriesSource,
      phase124PnbConflictSource,
      sample,
      ...(edition.key === "kinshu" ? [phase124KinshuRetailerSource] : []),
      diagram,
    ],
    scopes: [
      {
        key: currentScope,
        scopeKey: currentScope,
        validFrom: edition.officialPublishedAt,
        productionState: "historical",
        nibScope: edition.nibs.join(" / "),
        materialScope: `${edition.material}; ${edition.trim}`,
        editionScope: `${edition.ordinal}/5; ${edition.productCode}; ${edition.color}; ${edition.production}; ${edition.accessories}`,
      },
      {
        key: seriesScope,
        scopeKey: seriesScope,
        validFrom: "2017",
        validTo: "2021-12-31",
        productionState: "historical",
        editionScope:
          "Fuji Shunkei chronology only; Fuji Unkei is a separate successor beginning in 2023.",
      },
      {
        key: conflictScope,
        scopeKey: conflictScope,
        validFrom: "2018-11-10",
        productionState: "historical",
        editionScope:
          "PNB-13000 belongs to standard #3776 Century Chenonceau White / Laurel Green and is rejected as a Fuji Shunkei identity.",
      },
      {
        key: sampleScope,
        scopeKey: sampleScope,
        validFrom: edition.samplePublishedAt,
        validTo: edition.samplePublishedAt,
        productionState: "historical",
        nibScope: edition.sampleSummary,
        editionScope:
          "One disclosed sample only; subjective observations do not become line-wide facts.",
      },
      ...(edition.key === "kinshu"
        ? [
            {
              key: retailerScope,
              scopeKey: retailerScope,
              validFrom: "2021-07-27",
              validTo: "2021-07-27",
              productionState: "historical" as const,
              editionScope:
                "Commercial context only; never publication core or line-wide experience.",
            },
          ]
        : []),
    ],
    claims: [
      {
        key: `${edition.key}-identity`,
        predicate: "model_identity",
        objectText: `${edition.name} is Fuji Shunkei edition ${edition.ordinal}/5 with product number ${edition.productCode}.`,
        factClass: "core",
        confidence: 0.99,
        sourceKey: officialSource.key,
        locator: officialSource.archiveLocator ?? officialSource.summary,
        evidence: [
          {
            key: `${edition.key}-identity-evidence`,
            sourceKey: officialSource.key,
            scopeKey: currentScope,
            locator: `${edition.name} heading; ${edition.productCode}; ${edition.production}`,
          },
        ],
      },
      {
        key: `${edition.key}-series`,
        predicate: "series_chronology",
        objectText:
          "Fuji Shunkei ran 2017–2021 and is distinct from the Fuji Unkei successor introduced in 2023.",
        factClass: "core",
        confidence: 0.99,
        sourceKey: phase124SeriesSource.key,
        locator: phase124SeriesSource.archiveLocator ?? phase124SeriesSource.summary,
        evidence: [
          {
            key: `${edition.key}-series-evidence`,
            sourceKey: phase124SeriesSource.key,
            scopeKey: seriesScope,
            locator: "PDF page 1, 2011–2016 / 2017–2021 / 2023 chronology",
          },
        ],
      },
      {
        key: `${edition.key}-sample`,
        predicate: "disclosed_sample_observation",
        objectText: edition.sampleSummary,
        factClass: "core",
        confidence: 0.92,
        sourceKey: sample.key,
        locator: sample.archiveLocator ?? sample.summary,
        evidence: [
          {
            key: `${edition.key}-sample-evidence`,
            sourceKey: sample.key,
            scopeKey: sampleScope,
            locator: edition.sampleLocator,
          },
        ],
      },
    ],
    variants: edition.nibs.map((nib, index) => ({
      key: `${edition.key}-nib-${index + 1}`,
      name: nib,
      releaseYear: edition.year,
      notes: `Official nib option for ${edition.productCode}; not shared with other Fuji Shunkei editions.`,
      sourceKey: officialSource.key,
      variantKind: "nib" as const,
      productCode: edition.productCode,
    })),
    spec: {
      brandEntityId: PHASE124_BRAND_ID,
      values: {
        series_name: `Platinum #3776 Century Fuji Shunkei ${edition.name}`,
        release_year: edition.year,
        origin_country: "Japan / Platinum official release",
        nib: edition.nibs.join(" / "),
        fill_system: edition.fill,
        material: `${edition.material}; ${edition.trim}; ${edition.color}`,
        dimensions: edition.size,
        weight: edition.weight,
        status: edition.production,
      },
      evidence: [
        evidence("brand_entity_id", `${edition.key}-brand`, officialSource.key, currentScope, "Platinum official registry"),
        evidence("series_name", `${edition.key}-series-name`, officialSource.key, currentScope, `#3776 CENTURY ${edition.name.toUpperCase()} heading`),
        evidence("release_year", `${edition.key}-year`, officialSource.key, currentScope, edition.officialPublishedAt),
        evidence("origin_country", `${edition.key}-origin`, officialSource.key, currentScope, "Platinum Japanese official release"),
        evidence("nib", `${edition.key}-nib`, officialSource.key, currentScope, edition.nibs.join(" / ")),
        evidence("fill_system", `${edition.key}-fill`, officialSource.key, currentScope, edition.fill),
        evidence("material", `${edition.key}-material`, officialSource.key, currentScope, `${edition.material}; ${edition.trim}; ${edition.color}`),
        evidence("dimensions", `${edition.key}-size`, officialSource.key, currentScope, edition.size),
        evidence("weight", `${edition.key}-weight`, officialSource.key, currentScope, edition.weight),
        evidence("status", `${edition.key}-production`, officialSource.key, currentScope, edition.production),
        evidence("series_name", `${edition.key}-unkei-rejected`, phase124SeriesSource.key, seriesScope, "Fuji Unkei rejected as a Fuji Shunkei edition", false),
        evidence("series_name", `${edition.key}-pnb13000-rejected`, phase124PnbConflictSource.key, conflictScope, "PNB-13000 rejected as Fuji Shunkei product number", false),
        evidence("nib", `${edition.key}-sample-rejected`, sample.key, sampleScope, "sample feel/line rejected as line-wide nib performance", false),
        ...(edition.key === "kinshu"
          ? [
              evidence(
                "status",
                "kinshu-retailer-rejected",
                phase124KinshuRetailerSource.key,
                retailerScope,
                "retailer stock, promotion and purchase language rejected as publication core or current availability",
                false,
              ),
            ]
          : []),
      ],
    },
    timeline: [
      {
        key: `${edition.key}-release`,
        title: `${edition.name} official release`,
        eventType: "model_released",
        startDate: edition.officialPublishedAt,
        circa: false,
        description: `${edition.ordinal}/5; ${edition.productCode}; ${edition.production}`,
        sourceKey: officialSource.key,
      },
    ],
    media: [
      {
        key: `${edition.key}-primary`,
        title: `${edition.name} exact product boundary map（非产品照片）`,
        sourceKey: diagram.key,
        localPath: diagram.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "site-original factual SVG；non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof。",
        sourceUrl: diagram.url,
        usageStatus: "primary",
      },
    ],
  };
}

export const phase124Packs = PHASE124_EDITIONS.map(buildPack);

export const phase124FamilyArticle = {
  entityId: PHASE124_ARTICLE_ID,
  name: PHASE124_ARTICLE_NAME,
  slug: PHASE124_ARTICLE_SLUG,
  markdownFile:
    ".planning/content-research/platinum-fuji-shunkei-family-phase124.md",
  sourceMarkerPrefix: "curated:phase124:platinum-fuji-shunkei-family:",
  source: phase124SeriesSource,
  mediaPath: PHASE124_ARTICLE_SVG_PATH,
  truthfulAliases: ["Platinum Fuji Shunkei"] as const,
  editions: PHASE124_EDITIONS.map(
    (edition) =>
      `${edition.ordinal}. ${edition.name} ${edition.productCode} (${edition.year})`,
  ),
} as const;

export function loadPhase124Packs(
  workspaceRoot: string,
): LoadedCuratedEntityPack[] {
  return phase124Packs.map((pack) => {
    const loaded = loadCuratedEntityPack(workspaceRoot, pack);
    const summaryLength = Array.from(loaded.summary).length;
    if (summaryLength < 60 || summaryLength > 160)
      throw new Error(
        `Phase 124 ${loaded.entityId} summary must contain 60–160 Unicode characters.`,
      );
    if (Array.from(loaded.bodyMd).length < 2_000)
      throw new Error(
        `Phase 124 ${loaded.entityId} body_md must contain at least 2,000 Unicode characters.`,
      );
    if (!loaded.bodyMd.includes(`/article/${PHASE124_ARTICLE_SLUG}`))
      throw new Error(`Phase 124 ${loaded.entityId} lost its family backlink.`);
    return loaded;
  });
}
