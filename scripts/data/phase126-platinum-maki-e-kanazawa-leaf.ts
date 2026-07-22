import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE126_BRAND_ID = "e51tJpejEkXY";
export const PHASE126_ARTICLE_ID = "7dEIl-3axPwa";
export const PHASE126_RAW_SLUG = "白金-platinum-莳绘系列";
export const PHASE126_RAW_NAME = "白金 Platinum 莳绘系列";
export const PHASE126_ARTICLE_SLUG = "platinum-maki-e-kanazawa-leaf";
export const PHASE126_ARTICLE_NAME =
  "Platinum Maki-e & Kanazawa Leaf 莳绘与金泽箔导览";
export const PHASE126_LEGACY_MADE_BY_ID = "tUn99iHgNgAd";
export const PHASE126_LEGACY_REVERSE_ID = "rev-tUn99iHgNgAd";
export const PHASE126_PRICE_URL =
  "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2025/04/3ad9d2a744918feb4fd87b428dc1305e.pdf";
export const PHASE126_MANUAL_URL =
  "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2025/04/fourtainpen.pdf";
export const PHASE126_ARTICLE_SVG =
  "/images/library/site-original/phase126/platinum/platinum-maki-e-kanazawa-leaf-guide.svg";

const RETRIEVED = "2026-07-22";

interface VariantDefinition {
  key: string;
  name: string;
  code: string;
  url: string;
  locator: string;
}

interface LineDefinition {
  key: "pnb-30000b" | "pnb-35000h" | "ptl-20000h";
  entityId: string;
  slug: string;
  canonicalName: string;
  model: string;
  seriesName: string;
  markdownFile: string;
  svgPath: string;
  nib: string;
  fill: string;
  material: string;
  dimensions: string;
  weight: string;
  aliases: string[];
  variants: VariantDefinition[];
  professional: CuratedSource;
  professionalLocator: string;
  professionalObject: string;
}

function source(
  input: Omit<
    CuratedSource,
    "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
  > & { locator: string },
): CuratedSource {
  const { locator, ...value } = input;
  return {
    ...value,
    retrievedAt: RETRIEVED,
    allowedUse: value.sourceType === "user_submission" ? "store_full" : "summary_only",
    archiveUrl: value.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}`,
  };
}

const officialBase = {
  registryKey: "platinum-official-phase126",
  registryName: "Platinum Pen Co., Ltd.",
  sourceType: "official" as const,
  tier: "primary" as const,
  independenceGroup: "platinum-official",
  homepageUrl: "https://www.platinum-pen.co.jp/",
  author: "Platinum Pen Co., Ltd.",
};

export const phase126PriceSource = source({
  ...officialBase,
  key: "phase126-platinum-price-list-2025",
  title: "2025年6月1日付 価格改定対象商品",
  url: PHASE126_PRICE_URL,
  publishedAt: "2025-04",
  summary:
    "Official dated list enumerates PNB-30000B and PNB-35000H motif/nib combinations; price is a snapshot, not a permanent identity field.",
  locator:
    "PDF page 1 lines 14-28: PNB-30000B #40/#84 F/M/B and PNB-35000H #3/#55/#57 F/M/B; prices are dated",
});

export const phase126ManualSource = source({
  ...officialBase,
  key: "phase126-platinum-general-manual",
  title: "Platinum fountain pen user manual",
  url: PHASE126_MANUAL_URL,
  publishedAt: "2025-04",
  summary:
    "General cartridge, converter, cleaning and consumable guidance; it does not establish decorative-finish durability.",
  locator:
    "general cartridge/converter installation, ink replacement and water-cleaning sections; decorative finish excluded",
});

function professionalSource(
  key: string,
  registryKey: string,
  registryName: string,
  author: string,
  title: string,
  url: string,
  publishedAt: string | null,
  summary: string,
  locator: string,
): CuratedSource {
  return source({
    key,
    registryKey,
    registryName,
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: registryKey,
    homepageUrl: new URL(url).origin,
    author,
    title,
    url,
    publishedAt,
    summary,
    locator,
  });
}

const lines: readonly LineDefinition[] = [
  {
    key: "pnb-30000b",
    entityId: "phase126-platinum-pnb-30000b",
    slug: "platinum-3776-century-kaga-hira-maki-e-pnb-30000b",
    canonicalName:
      "Platinum #3776 Century Kaga Hira Maki-e PNB-30000B",
    model: "PNB-30000B",
    seriesName: "#3776 Century Kaga Hira Maki-e",
    markdownFile: ".planning/content-research/platinum-pnb-30000b-phase126.md",
    svgPath:
      "/images/library/site-original/phase126/platinum/platinum-pnb-30000b.svg",
    nib: "large 14K (14-26), F / M / B",
    fill: "Platinum cartridge / Converter-800A",
    material: "AS resin body; genuine urushi hira maki-e",
    dimensions: "139.5 mm length; 14.5 mm maximum diameter",
    weight: "18.5 g standard weight",
    aliases: ["Platinum PNB-30000B", "Platinum #3776 Kaga Hira Maki-e"],
    variants: [
      { key: "sakura-40", name: "Sakura #40 桜", code: "PNB-30000B#40", url: "https://www.platinum-pen.co.jp/products/fountain-pen/1589/", locator: "heading PNB-30000B / 加賀平蒔絵 桜; specification and 1690402/03/04 codes" },
      { key: "sansui-84", name: "Sansui #84 山水", code: "PNB-30000B#84", url: "https://www.platinum-pen.co.jp/products/fountain-pen/1595/", locator: "heading PNB-30000B / 加賀平蒔絵 山水; specification and 1690842/03/04 codes" },
    ],
    professional: professionalSource(
      "phase126-pnb30000b-sansui-review",
      "sbrebrown-phase126",
      "S.B.R.E. Brown",
      "Stephen Brown",
      "Platinum 3776 Sansui Fountain Pen Review",
      "https://www.sbrebrown.com/2017/04/platinum-3776-sansui-fountain-pen-review-and-giveaway/",
      "2017-04-17",
      "One anonymously supplied Sansui Fine sample with measured dimensions, weight and disclosed subjective review.",
      "title/date; Fine sample; measurements; anonymous-benefactor disclosure; screened-maki-e tag",
    ),
    professionalLocator:
      "title/date; Fine sample; measurements and review disclosure",
    professionalObject:
      "One Sansui Fine review sample documents specimen measurements and use; feel and line remain sample-only.",
  },
  {
    key: "pnb-35000h",
    entityId: "phase126-platinum-pnb-35000h",
    slug: "platinum-3776-century-kanazawa-leaf-pnb-35000h",
    canonicalName: "Platinum #3776 Century Kanazawa Leaf PNB-35000H",
    model: "PNB-35000H",
    seriesName: "#3776 Century Kanazawa Leaf",
    markdownFile: ".planning/content-research/platinum-pnb-35000h-phase126.md",
    svgPath:
      "/images/library/site-original/phase126/platinum/platinum-pnb-35000h.svg",
    nib: "large 14K (14-26), F / M / B",
    fill: "Platinum cartridge / Converter-800A",
    material: "AS resin; Kanazawa leaf momi-chirashi with modern maki-e",
    dimensions: "139.5 mm length; 14.5 mm maximum diameter (current Japanese exact page)",
    weight: "18.8 g standard weight",
    aliases: ["Platinum PNB-35000H", "Platinum #3776 Kanazawa-Haku"],
    variants: [
      { key: "fujin-raijin-3", name: "Fujin Raijin #3 风神雷神", code: "PNB-35000H#3", url: "https://www.platinum-pen.co.jp/products/fountain-pen/2029/", locator: "heading PNB-35000H / 金沢箔 風神雷神; momi-chirashi/modern maki-e; 1627032/33/34" },
      { key: "matsu-tora-55", name: "Matsu Tora #55 松虎", code: "PNB-35000H#55", url: "https://www.platinum-pen.co.jp/products/fountain-pen/9282/", locator: "heading PNB-35000H / 金沢箔 松虎; F/M/B; 1627552/53/54" },
      { key: "ascending-dragon-57", name: "Ascending Dragon #57 昇龙", code: "PNB-35000H#57", url: "https://www.platinum-pen.co.jp/products/fountain-pen/2033/", locator: "heading PNB-35000H / 金沢箔 昇龍; F/M/B; 1627572/73/74" },
    ],
    professional: professionalSource(
      "phase126-pnb35000h-collector",
      "platinum3776century-phase126",
      "Platinum #3776 Century Collectors",
      "Platinum #3776 Century Collectors editorial",
      "Platinum Kanazawa-Haku",
      "https://platinum3776century.com/?p=300",
      null,
      "Independent specialist catalogue groups PNB-35000H #3/#55/#57 and records construction and market observations.",
      "PNB-35000H line; motif sections; specifications lines 48-66; 15.4 mm collector value conflicts with current Japanese exact page",
    ),
    professionalLocator:
      "PNB-35000H motif list and independent specialist specifications",
    professionalObject:
      "A specialist collector catalogue independently groups the three PNB-35000H motifs; market and diameter observations remain secondary.",
  },
  {
    key: "ptl-20000h",
    entityId: "phase126-platinum-ptl-20000h",
    slug: "platinum-kanazawa-leaf-ptl-20000h",
    canonicalName: "Platinum Kanazawa Leaf PTL-20000H",
    model: "PTL-20000H",
    seriesName: "Platinum Kanazawa Leaf",
    markdownFile: ".planning/content-research/platinum-ptl-20000h-phase126.md",
    svgPath:
      "/images/library/site-original/phase126/platinum/platinum-ptl-20000h.svg",
    nib: "18K, F / M",
    fill: "Platinum cartridge / compatible converter; package varies by date and market",
    material: "AS resin; gold-leaf surface finish",
    dimensions: "139 mm length; 13 mm maximum diameter",
    weight: "16.7 g",
    aliases: ["Platinum PTL-20000H", "Platinum Classic Kanazawa Leaf"],
    variants: [
      { key: "goldfish-24", name: "Goldfish #24 金鱼", code: "PTL-20000H#24", url: "https://www.platinum-pen.co.jp/products/fountain-pen/2085/", locator: "PTL-20000H 金沢箔 金魚; 18K F/M; 1748242/43" },
      { key: "autumn-leaves-46", name: "Autumn Leaves #46 红叶", code: "PTL-20000H#46", url: "https://www.platinum-pen.co.jp/products/fountain-pen/2089/", locator: "PTL-20000H 金沢箔 紅葉 exact page" },
      { key: "sakura-blizzard-52", name: "Sakura Blizzard #52 樱吹雪", code: "PTL-20000H#52", url: "https://www.platinum-pen.co.jp/products/fountain-pen/2092/", locator: "PTL-20000H 金沢箔 桜吹雪 exact page" },
      { key: "red-mt-fuji-58", name: "Red Mt. Fuji #58 赤富士", code: "PTL-20000H#58", url: "https://www.platinum-pen.co.jp/products/fountain-pen/2096/", locator: "PTL-20000H 金沢箔 赤富士 exact page" },
      { key: "moon-rabbit-87", name: "Moon and Rabbit #87 月与兔", code: "PTL-20000H#87", url: "https://www.platinum-pen.co.jp/products/fountain-pen/2100/", locator: "PTL-20000H 金沢箔 月と兎 exact page" },
    ],
    professional: professionalSource(
      "phase126-ptl20000h-penaddict",
      "pen-addict-phase126",
      "The Pen Addict",
      "Brad Dowdy",
      "Platinum Kanazawa Leaf Red Mt. Fuji Fountain Pen Review",
      "https://www.penaddict.com/blog/2019/9/23/platinum-kanazawa-leaf-red-mt-fuji-fountain-pen-review",
      "2019-09-23",
      "One JetPens-provided Red Mt. Fuji Fine sample; lightweight body, 18K nib and use observations are specimen scoped.",
      "title/byline/date; Red Mt. Fuji Fine sample; lightweight/18K observations; JetPens disclosure",
    ),
    professionalLocator:
      "Red Mt. Fuji Fine sample and JetPens disclosure",
    professionalObject:
      "One disclosed Red Mt. Fuji Fine sample documents actual use; writing feel and wear remain specimen-only.",
  },
] as const;

export const PHASE126_LINES = lines;
export const PHASE126_TARGET_IDS = lines.map((line) => line.entityId);
export const PHASE126_NEW_MADE_BY_IDS = lines.map(
  (line) => `phase126-${line.key}-made-by`,
);
export const PHASE126_NEW_REVERSE_IDS = PHASE126_NEW_MADE_BY_IDS.map(
  (id) => `rev-${id}`,
);

function officialVariantSource(line: LineDefinition, variant: VariantDefinition) {
  return source({
    ...officialBase,
    key: `phase126-${line.key}-${variant.key}-official`,
    title: `${line.model} ${variant.name}`,
    url: variant.url,
    publishedAt: null,
    summary: `Official exact product page for ${line.model} ${variant.name}; model, motif and line specifications.`,
    locator: variant.locator,
  });
}

function diagramSource(line: LineDefinition): CuratedSource {
  return source({
    key: `phase126-${line.key}-diagram`,
    registryKey: "fountain-pen-graph-editorial-phase126",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase126",
    title: `${line.model} product boundary map`,
    url: line.svgPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    publishedAt: RETRIEVED,
    summary: `Original factual SVG for ${line.model}, motifs and specification boundary.`,
    license: "site-original",
    locator: `project-public-asset:${line.svgPath};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900`,
  });
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

function buildPack(line: LineDefinition): CuratedEntityPack {
  const officials = line.variants.map((variant) =>
    officialVariantSource(line, variant),
  );
  const primary = officials[0];
  if (!primary) throw new Error(`Phase 126 ${line.model} has no official source.`);
  const diagram = diagramSource(line);
  const productScope = `phase126-${line.key}-official-line`;
  const sampleScope = `phase126-${line.key}-professional-sample`;
  const priceScope = `phase126-${line.key}-price-snapshot`;
  const maintenanceScope = `phase126-${line.key}-maintenance`;
  return {
    key: `phase126-platinum-${line.key}-v1`,
    entityId: line.entityId,
    expectedType: "pen",
    expectedSlug: line.slug,
    canonicalName: line.canonicalName,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: line.markdownFile,
    storyTitle: `${line.model}：基型、图案与样本边界`,
    primarySourceKey: primary.key,
    depthTier: "A",
    aliases: line.aliases.map((alias) => ({
      alias,
      language: "en",
      sourceKey: primary.key,
    })),
    sources: [
      ...officials,
      phase126PriceSource,
      phase126ManualSource,
      line.professional,
      diagram,
    ],
    scopes: [
      {
        key: productScope,
        scopeKey: productScope,
        market: "Japan / official product catalogue",
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope: line.nib,
        materialScope: line.material,
        editionScope: line.variants
          .map((variant) => `${variant.code} ${variant.name}`)
          .join("; "),
      },
      {
        key: sampleScope,
        scopeKey: sampleScope,
        validFrom: line.professional.publishedAt,
        validTo: line.professional.publishedAt,
        productionState: "historical",
        nibScope: line.professionalObject,
        editionScope: "One disclosed or specialist secondary observation only.",
      },
      {
        key: priceScope,
        scopeKey: priceScope,
        validFrom: "2025-04",
        validTo: "2025-06-01",
        productionState: "historical",
        editionScope:
          "Dated official SKU/price list; price and availability are not permanent facts.",
      },
      {
        key: maintenanceScope,
        scopeKey: maintenanceScope,
        validFrom: "2025-04",
        productionState: "current",
        editionScope:
          "General ink-system cleaning only; decorative-finish durability is excluded.",
      },
    ],
    claims: [
      {
        key: `${line.key}-identity`,
        predicate: "model_identity",
        objectText: `${line.model} is one exact Platinum product line with ${line.variants.length} documented motif variants.`,
        factClass: "core",
        confidence: 0.99,
        sourceKey: primary.key,
        locator: primary.archiveLocator ?? primary.summary,
        evidence: officials.map((item, index) => ({
          key: `${line.key}-identity-${index + 1}`,
          sourceKey: item.key,
          scopeKey: productScope,
          locator: item.archiveLocator ?? item.summary,
        })),
      },
      {
        key: `${line.key}-sample`,
        predicate: "independent_sample_boundary",
        objectText: line.professionalObject,
        factClass: "core",
        confidence: 0.92,
        sourceKey: line.professional.key,
        locator: line.professional.archiveLocator ?? line.professionalLocator,
        evidence: [
          {
            key: `${line.key}-sample-evidence`,
            sourceKey: line.professional.key,
            scopeKey: sampleScope,
            locator: line.professionalLocator,
          },
        ],
      },
    ],
    variants: line.variants.map((variant, index) => ({
      key: variant.key,
      name: variant.name,
      notes: `${line.model} official motif variant; nib choices remain in the line specification.`,
      sourceKey: officials[index]?.key ?? primary.key,
      variantKind: "edition_group" as const,
      productCode: variant.code,
      market: "Japan / official catalogue",
    })),
    spec: {
      brandEntityId: PHASE126_BRAND_ID,
      values: {
        series_name: line.seriesName,
        origin_country: "Japan / Platinum official product",
        nib: line.nib,
        fill_system: line.fill,
        material: line.material,
        dimensions: line.dimensions,
        weight: line.weight,
        ...(line.key === "ptl-20000h"
          ? {}
          : { status: `Current official product pages checked ${RETRIEVED}` }),
      },
      evidence: [
        evidence("brand_entity_id", `${line.key}-brand`, primary.key, productScope, "Platinum official exact product page"),
        evidence("series_name", `${line.key}-series`, primary.key, productScope, `${line.model} heading and product family`),
        evidence("origin_country", `${line.key}-origin`, primary.key, productScope, "Platinum Japanese official product catalogue"),
        evidence("nib", `${line.key}-nib`, primary.key, productScope, line.nib),
        evidence("fill_system", `${line.key}-fill`, line.key === "ptl-20000h" ? phase126ManualSource.key : primary.key, line.key === "ptl-20000h" ? maintenanceScope : productScope, line.fill),
        evidence("material", `${line.key}-material`, primary.key, productScope, line.material),
        evidence("dimensions", `${line.key}-dimensions`, primary.key, productScope, line.dimensions),
        evidence("weight", `${line.key}-weight`, primary.key, productScope, line.weight),
        ...(line.key === "ptl-20000h"
          ? []
          : [
              evidence(
                "status",
                `${line.key}-status`,
                phase126PriceSource.key,
                priceScope,
                "dated official SKU listing",
              ),
            ]),
        evidence("nib", `${line.key}-sample-rejected`, line.professional.key, sampleScope, "sample feel and line rejected as line-wide performance", false),
        ...(line.key === "pnb-35000h"
          ? [
              evidence(
                "dimensions",
                `${line.key}-collector-diameter-rejected`,
                line.professional.key,
                sampleScope,
                "collector 15.4 mm conflicts with current Japanese exact page 14.5 mm",
                false,
              ),
            ]
          : []),
      ],
    },
    timeline: [
      {
        key: `${line.key}-catalog-check`,
        title: `${line.model} official catalogue state checked`,
        eventType: "design_milestone",
        startDate: RETRIEVED,
        circa: false,
        description: `${line.variants.length} exact motifs; current status is a dated snapshot.`,
        sourceKey: primary.key,
      },
    ],
    media: [
      {
        key: `${line.key}-primary`,
        title: `${line.model} product boundary map（非产品照片）`,
        sourceKey: diagram.key,
        localPath: line.svgPath,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "site-original factual SVG；non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof。",
        sourceUrl: line.svgPath,
        usageStatus: "primary",
      },
    ],
  };
}

export const phase126Packs = lines.map(buildPack);

export const phase126Article = {
  entityId: PHASE126_ARTICLE_ID,
  name: PHASE126_ARTICLE_NAME,
  slug: PHASE126_ARTICLE_SLUG,
  markdownFile:
    ".planning/content-research/platinum-maki-e-kanazawa-leaf-family-phase126.md",
  sourceMarkerPrefix: "curated:phase126:platinum-maki-e-kanazawa-leaf:",
  source: phase126PriceSource,
  mediaPath: PHASE126_ARTICLE_SVG,
  truthfulAliases: ["Platinum Maki-e series", "白金 莳绘系列"] as const,
} as const;

export function loadPhase126Packs(
  workspaceRoot: string,
): LoadedCuratedEntityPack[] {
  return phase126Packs.map((pack) => {
    const loaded = loadCuratedEntityPack(workspaceRoot, pack);
    const summaryLength = Array.from(loaded.summary).length;
    if (summaryLength < 60 || summaryLength > 160)
      throw new Error(
        `Phase 126 ${loaded.entityId} summary must contain 60–160 Unicode characters.`,
      );
    if (Array.from(loaded.bodyMd).length < 2_000)
      throw new Error(
        `Phase 126 ${loaded.entityId} body_md must contain at least 2,000 Unicode characters.`,
      );
    if (!loaded.bodyMd.includes(`/article/${PHASE126_ARTICLE_SLUG}`))
      throw new Error(`Phase 126 ${loaded.entityId} lost its guide backlink.`);
    return loaded;
  });
}
