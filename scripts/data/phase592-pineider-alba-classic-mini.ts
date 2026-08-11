import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE591_PINEIDER_BRAND_ID,
  phase591PineiderBrandPack,
} from "./phase591-pineider-millenium-psycho";

export const PHASE592_PINEIDER_BRAND_ID = PHASE591_PINEIDER_BRAND_ID;

export const PHASE592_IDS = {
  albaClassic: "phase592-pineider-alba-classic",
  albaMini: "phase592-pineider-alba-mini",
} as const;

export const PHASE592_SLUGS = {
  albaClassic: "pineider-alba-classic-pp7701-1120",
  albaMini: "pineider-alba-mini-pp7601-1122",
} as const;

const RETRIEVED = "2026-08-11";

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

function official(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  publishedAt?: string;
}): CuratedSource {
  return web({
    ...input,
    registryKey: "pineider-official-phase592",
    registryName: "Pineider 1774",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pineider-official",
    homepageUrl: "https://www.pineider.com/",
    author: "Pineider 1774",
  });
}

function secondary(input: {
  key: string;
  registryKey: string;
  registryName: string;
  independenceGroup: string;
  title: string;
  url: string;
  homepageUrl: string;
  author: string;
  summary: string;
  locator: string;
  publishedAt?: string;
}): CuratedSource {
  return web({
    ...input,
    sourceType: "blog",
    tier: "professional_secondary",
  });
}

function editorial(
  key: "alba-classic" | "alba-mini",
  title: string,
): CuratedSource {
  const localPath = `/images/library/site-original/phase592/pineider/pineider-${key}.svg`;
  return {
    key: `phase592-pineider-${key}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase592-${key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase592-${key}`,
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创事实示意图，非产品照片；不复刻品牌标识、商品照片、真实笔形、颜色、galalith 纹理、饰件、笔夹、机构或比例。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;texture-proof=false;dimensions=1600x900`,
  };
}

function specEvidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

const common = {
  collection: official({
    key: "phase592-pineider-alba-collection",
    title: "Pineider Alba collection",
    url: "https://www.pineider.com/en/pens/collections/alba",
    summary:
      "当前 Alba collection 将 Classic 与 Mini 的 fountain pen、rollerball、ballpoint 分成六个商品入口；钢笔身份不能与其他书写机构合并。",
    locator:
      "current collection cards separately list Alba Classic Fountain Pen with Palladium Trims and Alba Mini Fountain Pen with Gold Trims plus their rollerball and ballpoint siblings",
  }),
  identity: official({
    key: "phase592-pineider-alba-identity-card",
    title: "Pineider Alba identity card",
    url: "https://www.pineider.com/en/alba",
    summary:
      "Alba 专页分别公布 Classic 与 Mini 钢笔的 galalith、笔尖号、尖幅、316L clip、闭合和上墨；Classic 是 No.6／EF-F-M／converter or cartridge／Twist，Mini 是 No.5／F-M／cartridge／Magnetic Lock 与 gold plating。",
    locator:
      "Identity Card tables under Alba Classic and Alba Mini; Classic fountain pen No.6 EF/F/M and converter or cartridge with Twist Magnetic Lock; Mini No.5 F/M, cartridge, gold plating and Magnetic Lock",
  }),
  magazine: official({
    key: "phase592-pineider-alba-magazine-2026",
    title: "ALBA: Pineider's new pen collection celebrating the luxury of time",
    url: "https://magazine.pineider.com/en/5325-2/",
    publishedAt: "2026-06-17",
    summary:
      "Pineider 2026-06-17 官方文章把 Alba 作为新系列，说明 casein-derived galalith，并把 Classic 与 Mini 定义为同一视觉体系的两条互补比例路线。",
    locator:
      "dated 17 June 2026; headings Material as narrative: galalith and Two souls, one vision; paragraphs distinguish Classic and Mini",
  }),
  repubblica: secondary({
    key: "phase592-pineider-alba-la-repubblica-2026",
    registryKey: "la-repubblica-firenze-phase592-pineider-alba",
    registryName: "la Repubblica Firenze",
    independenceGroup: "la-repubblica",
    title: "Pineider lancia Alba, la penna che accompagna la lentezza della scrittura",
    url: "https://firenze.repubblica.it/cronaca/2026/06/11/news/pineider_penna_alba_linea_classic_mini_galalite-425404743/",
    homepageUrl: "https://firenze.repubblica.it/",
    author: "la Repubblica Firenze",
    publishedAt: "2026-06-11",
    summary:
      "独立新闻报道把 Alba 记为 2026 新系列，交叉确认由 milk casein 衍生的 galalith、Classic／Mini 双路线，以及六种 writing-instrument interpretation。",
    locator:
      "dated 11 June 2026; headline Pineider lancia Alba; paragraphs identify galalith from milk casein, Classic and Mini, and six writing-instrument interpretations",
  }),
  vam: secondary({
    key: "phase592-vam-casein-plastic-conservation",
    registryKey: "victoria-and-albert-museum-casein-conservation",
    registryName: "Victoria and Albert Museum",
    independenceGroup: "victoria-and-albert-museum",
    title:
      "Milk and Modernism: Conservation of a Smoker's Cabinet designed by Charles Rennie Mackintosh",
    url: "https://www.vam.ac.uk/content/journals/conservation-journal/issue-21/milk-and-modernism-conservation-of-a-smokers-cabinet-designed-by-charles-rennie-mackintosh",
    homepageUrl: "https://www.vam.ac.uk/",
    author: "Victoria and Albert Museum Conservation Journal",
    summary:
      "V&A 对历史 casein plastic 的保育研究说明其 hygroscopic 性质，水分吸放循环可能导致收缩、脆化、crazing 或翘曲；本站只把它用于保守维护背景。",
    locator:
      "Casein section explains hygroscopic behaviour and water absorption/desorption cycles causing shrinkage, embrittlement, surface crazing, curling or buckling",
  }),
};

const classic = {
  official: official({
    key: "phase592-pineider-alba-classic-pp7701-1120-official",
    title: "Alba Classic Fountain Pen with Palladium Trims",
    url: "https://www.pineider.com/en/products/alba-classic-fountain-pen-with-palladium-trims-1120?taxon_slug=pens%2Fcollections%2Falba",
    summary:
      "当前 exact 页面确认 Alba Classic PP7701／1120、MILK、SPP7701E010／M010／F010、144 mm、Ø15.5 mm、Italy、galalith、palladium trims 与 Twist Magnetic Lock。",
    locator:
      "H1 and Model PP7701/1120; variant HTML maps PP7701_E/M/F and MILK 010 to SPP7701E010/SPP7701M010/SPP7701F010; DETAILS 144 MM, diameter 15.5 MM and Italy",
  }),
  diagram: editorial(
    "alba-classic",
    "Pineider Alba Classic PP7701／1120 身份与规格边界事实图",
  ),
};

const mini = {
  official: official({
    key: "phase592-pineider-alba-mini-pp7601-1122-official",
    title: "Alba Mini Fountain Pen with Gold Trims",
    url: "https://www.pineider.com/en/products/alba-mini-fountain-pen-with-gold-trims-1122?taxon_slug=pens%2Fcollections%2Falba",
    summary:
      "当前 exact 页面确认 Alba Mini PP7601／1122、MILK、SPP7601F010／M010、120 mm、Ø13.4 mm、Italy 与 Gold Trims；上墨、笔尖和闭合由 Alba identity card 补足。",
    locator:
      "H1 and Model PP7601/1122; variant HTML maps PP7601_F/M and MILK 010 to SPP7601F010/SPP7601M010; DETAILS 120 MM, diameter 13.4 MM and Italy",
  }),
  genericMini: official({
    key: "phase592-pineider-generic-mini-spp7201-1063-official",
    title: "Fountain Pen Mini",
    url: "https://pineider-online.pineider.com/us/products/fountain-pen-mini-1063?taxon_slug=gifts",
    summary:
      "Pineider 另有 SPP7201／1063 generic Fountain Pen Mini，使用 UltraResin、No.5 F／M、120 mm／Ø13.4 mm、palladium-finished parts 与 Magnetic Lock；它不是 Alba Mini alias。",
    locator:
      "H1 Fountain Pen Mini; Model SPP7201/1063; DETAILS 120 MM and diameter 13.4 MM; DESCRIPTION Ultra Resin UR, stainless N5 F/M, Magnetic Lock and palladium-finished metal parts",
  }),
  diagram: editorial(
    "alba-mini",
    "Pineider Alba Mini PP7601／1122 紧凑型号边界事实图",
  ),
};

const classicCurrent = "phase592-pineider-alba-classic-current-pp7701-1120";
const classicMiniSibling = "phase592-pineider-alba-classic-mini-sibling";
const classicMainVariant = "phase592-pineider-alba-classic-current-product";

export const phase592PineiderAlbaClassicPack: CuratedEntityPack = {
  key: "phase592-pineider-alba-classic-v1",
  entityId: PHASE592_IDS.albaClassic,
  expectedType: "pen",
  expectedSlug: PHASE592_SLUGS.albaClassic,
  canonicalName: "Pineider Alba Classic Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/pineider-alba-classic-phase592.md",
  storyTitle:
    "Pineider Alba Classic：PP7701／1120、三个 child SKU 与 Mini 边界",
  primarySourceKey: classic.official.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Pineider Alba Classic",
      language: "en",
      sourceKey: classic.official.key,
    },
    {
      alias: "Pineider Alba Classic PP7701/1120",
      language: "en",
      sourceKey: classic.official.key,
    },
    {
      alias: "皮内德 Alba Classic 钢笔",
      language: "zh",
      sourceKey: classic.official.key,
    },
  ],
  sources: [
    classic.official,
    mini.official,
    common.collection,
    common.identity,
    common.magazine,
    common.repubblica,
    common.vam,
    classic.diagram,
  ],
  scopes: [
    {
      key: classicCurrent,
      scopeKey: classicCurrent,
      market: "current global PP7701/1120 and MILK 010 child SKUs",
      validFrom: "2026",
      productionState: "current",
      nibScope:
        "No.6 stainless steel; Extra Fine, Fine and Medium are current exact child-SKU widths.",
      materialScope:
        "Galalith body with 316L stainless-steel clip and exact-title palladium trims.",
      editionScope:
        "Current 2026 Alba Classic fountain pen; no official limited-edition count is asserted.",
    },
    {
      key: classicMiniSibling,
      scopeKey: classicMiniSibling,
      market: "Alba Mini PP7601/1122 sibling exclusion",
      validFrom: "2026",
      productionState: "current",
      nibScope:
        "Mini No.5 F/M does not qualify Classic No.6 EF/F/M fields.",
      materialScope:
        "Shared galalith does not transfer Mini gold plating or Magnetic Lock to Classic.",
      editionScope:
        "Mini cartridge-only and 120 mm fields remain sibling evidence.",
    },
  ],
  claims: [
    {
      key: "phase592-pineider-alba-classic-identity",
      predicate: "model_identity",
      objectText:
        "The canonical current identity is Pineider Alba Classic Fountain Pen PP7701/1120 with three MILK 010 nib child SKUs; rollerball and ballpoint are separate writing instruments.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: classic.official.key,
      locator: classic.official.summary,
      evidence: [
        {
          key: "phase592-alba-classic-identity-exact-evidence",
          sourceKey: classic.official.key,
          scopeKey: classicCurrent,
          locator: classic.official.summary,
        },
        {
          key: "phase592-alba-classic-identity-collection-evidence",
          sourceKey: common.collection.key,
          scopeKey: classicCurrent,
          locator: common.collection.summary,
        },
      ],
    },
    {
      key: "phase592-pineider-alba-classic-configuration",
      predicate: "current_configuration",
      objectText:
        "Current Classic is an Italian 144 mm by 15.5 mm galalith fountain pen with No.6 steel EF/F/M, converter or cartridge, palladium trims and Twist Magnetic Lock.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.identity.key,
      locator: common.identity.summary,
      evidence: [
        {
          key: "phase592-alba-classic-config-identity-card-evidence",
          sourceKey: common.identity.key,
          scopeKey: classicCurrent,
          locator: common.identity.summary,
        },
        {
          key: "phase592-alba-classic-config-exact-evidence",
          sourceKey: classic.official.key,
          scopeKey: classicCurrent,
          locator: classic.official.summary,
        },
      ],
    },
    {
      key: "phase592-pineider-alba-classic-family-boundary",
      predicate: "sibling_scope_boundary",
      objectText:
        "Alba's 2026 Classic and Mini routes share galalith but not model code, dimensions, nib unit, filling system, trim or cap closure; Mini fields never qualify Classic.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.identity.key,
      locator: common.identity.summary,
      evidence: [
        {
          key: "phase592-alba-classic-boundary-official-evidence",
          sourceKey: common.identity.key,
          scopeKey: classicMiniSibling,
          locator: common.identity.summary,
        },
        {
          key: "phase592-alba-classic-boundary-independent-evidence",
          sourceKey: common.repubblica.key,
          scopeKey: classicMiniSibling,
          locator: common.repubblica.summary,
        },
      ],
    },
  ],
  variants: [
    {
      key: classicMainVariant,
      name: "Alba Classic Fountain Pen PP7701 / 1120",
      releaseYear: "2026",
      notes: "Exact current MILK product anchor with palladium trims.",
      sourceKey: classic.official.key,
      variantKind: "edition_group",
      productCode: "PP7701 / 1120",
      market: "global current",
    },
    ...[
      ["ef", "Extra Fine", "SPP7701E010"],
      ["f", "Fine", "SPP7701F010"],
      ["m", "Medium", "SPP7701M010"],
    ].map(([suffix, width, productCode]) => ({
      key: `phase592-pineider-alba-classic-${suffix}-child-sku`,
      name: `Alba Classic ${width} child SKU`,
      notes: `Official current ${width} selector under PP7701/1120 and MILK 010.`,
      sourceKey: classic.official.key,
      variantKind: "nib" as const,
      parentVariantKey: classicMainVariant,
      productCode,
      market: "global current",
    })),
  ],
  spec: {
    brandEntityId: PHASE592_PINEIDER_BRAND_ID,
    values: {
      series_name: "Pineider Alba Classic Fountain Pen PP7701/1120",
      release_year: "2026 Alba collection",
      origin_country: "Italy",
      nib: "No.6 stainless steel; Extra Fine, Fine and Medium",
      fill_system: "Converter or cartridge; Twist Magnetic Lock cap closure",
      material:
        "Galalith (milk casein), 316L stainless-steel clip and palladium trims",
      dimensions: "144 mm; diameter 15.5 mm",
      weight: "Not published on the current official PP7701/1120 page",
      status: "Current 2026 Alba Classic; verified 2026-08-11",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase592-alba-classic-spec-brand",
        classic.official.key,
        classicCurrent,
        "exact Pineider product identity",
      ),
      specEvidence(
        "series_name",
        "phase592-alba-classic-spec-series",
        classic.official.key,
        classicCurrent,
        "H1 Alba Classic Fountain Pen with Palladium Trims and Model PP7701/1120",
      ),
      specEvidence(
        "release_year",
        "phase592-alba-classic-spec-release",
        common.repubblica.key,
        classicCurrent,
        "dated 11 June 2026 report calls Alba a new Pineider collection",
      ),
      specEvidence(
        "origin_country",
        "phase592-alba-classic-spec-origin",
        classic.official.key,
        classicCurrent,
        "DETAILS states Origin Italy",
      ),
      specEvidence(
        "nib",
        "phase592-alba-classic-spec-nib",
        common.identity.key,
        classicCurrent,
        "Classic identity card states No.6 stainless steel EF/F/M",
      ),
      specEvidence(
        "fill_system",
        "phase592-alba-classic-spec-fill",
        common.identity.key,
        classicCurrent,
        "Classic identity card states converter or cartridge and Twist Magnetic Lock",
      ),
      specEvidence(
        "material",
        "phase592-alba-classic-spec-material",
        common.identity.key,
        classicCurrent,
        "Classic identity card states galalith and 316L stainless-steel clip; exact title states palladium trims",
      ),
      specEvidence(
        "dimensions",
        "phase592-alba-classic-spec-dimensions",
        classic.official.key,
        classicCurrent,
        "DETAILS states 144 MM and diameter 15.5 MM",
      ),
      specEvidence(
        "weight",
        "phase592-alba-classic-spec-weight-unpublished",
        classic.official.key,
        classicCurrent,
        "current exact page publishes no product weight; no number asserted",
      ),
      specEvidence(
        "status",
        "phase592-alba-classic-spec-status",
        common.magazine.key,
        classicCurrent,
        "dated 17 June 2026 official Alba launch article and current product page",
      ),
      specEvidence(
        "nib",
        "phase592-alba-classic-rejected-mini-nib",
        common.identity.key,
        classicMiniSibling,
        "Mini No.5 F/M does not qualify Classic No.6 EF/F/M",
        false,
      ),
      specEvidence(
        "fill_system",
        "phase592-alba-classic-rejected-mini-fill",
        common.identity.key,
        classicMiniSibling,
        "Mini cartridge-only and Magnetic Lock do not qualify Classic",
        false,
      ),
      specEvidence(
        "dimensions",
        "phase592-alba-classic-rejected-mini-dimensions",
        mini.official.key,
        classicMiniSibling,
        "Mini 120 mm by 13.4 mm does not qualify Classic dimensions",
        false,
      ),
    ],
  },
  timeline: [
    {
      key: "phase592-alba-classic-press-launch",
      title: "Alba launch reported with Classic and Mini routes",
      eventType: "model_released",
      startDate: "2026-06-11",
      circa: false,
      description:
        "The date identifies the independent report, not a claim that every market opened sales simultaneously.",
      sourceKey: common.repubblica.key,
    },
    {
      key: "phase592-alba-classic-official-article",
      title: "Pineider publishes the Alba collection article",
      eventType: "design_milestone",
      startDate: "2026-06-17",
      circa: false,
      description:
        "The official article documents the material story and separate Classic/Mini proportions.",
      sourceKey: common.magazine.key,
    },
  ],
  conflicts: [
    {
      key: "phase592-alba-classic-mini-fill-conflict",
      fieldKey: "fill_system",
      scopeKey: classicCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The official identity card explicitly assigns converter or cartridge to Classic and cartridge to Mini; sibling evidence is retained but nonqualifying.",
      members: [
        {
          citationKey: "phase592-alba-classic-spec-fill",
          assertedValue: "Classic converter or cartridge with Twist Magnetic Lock",
        },
        {
          citationKey: "phase592-alba-classic-rejected-mini-fill",
          assertedValue: "Mini cartridge-only with Magnetic Lock",
        },
      ],
    },
    {
      key: "phase592-alba-classic-mini-dimension-conflict",
      fieldKey: "dimensions",
      scopeKey: classicCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Exact product pages bind 144 by 15.5 mm to Classic and 120 by 13.4 mm to Mini; no cross-fill is allowed.",
      members: [
        {
          citationKey: "phase592-alba-classic-spec-dimensions",
          assertedValue: "Classic 144 mm by 15.5 mm",
        },
        {
          citationKey: "phase592-alba-classic-rejected-mini-dimensions",
          assertedValue: "Mini 120 mm by 13.4 mm",
        },
      ],
    },
  ],
  media: [
    {
      key: "phase592-pineider-alba-classic-primary",
      title:
        "Pineider Alba Classic PP7701／1120 身份与规格边界事实图（非产品照片）",
      sourceKey: classic.diagram.key,
      localPath: classic.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、外形、galalith 纹理、比例、商标、笔尖、笔夹或磁吸机构。",
      sourceUrl: classic.diagram.url,
      usageStatus: "primary",
    },
  ],
};

const miniCurrent = "phase592-pineider-alba-mini-current-pp7601-1122";
const miniClassicSibling = "phase592-pineider-alba-mini-classic-sibling";
const miniGenericSibling = "phase592-pineider-alba-mini-generic-mini-sibling";
const miniMainVariant = "phase592-pineider-alba-mini-current-product";

export const phase592PineiderAlbaMiniPack: CuratedEntityPack = {
  key: "phase592-pineider-alba-mini-v1",
  entityId: PHASE592_IDS.albaMini,
  expectedType: "pen",
  expectedSlug: PHASE592_SLUGS.albaMini,
  canonicalName: "Pineider Alba Mini Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pineider-alba-mini-phase592.md",
  storyTitle:
    "Pineider Alba Mini：PP7601／1122、两个 child SKU 与同名 Mini 边界",
  primarySourceKey: mini.official.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Pineider Alba Mini",
      language: "en",
      sourceKey: mini.official.key,
    },
    {
      alias: "Pineider Alba Mini PP7601/1122",
      language: "en",
      sourceKey: mini.official.key,
    },
    {
      alias: "皮内德 Alba Mini 钢笔",
      language: "zh",
      sourceKey: mini.official.key,
    },
  ],
  sources: [
    mini.official,
    classic.official,
    mini.genericMini,
    common.collection,
    common.identity,
    common.magazine,
    common.repubblica,
    common.vam,
    mini.diagram,
  ],
  scopes: [
    {
      key: miniCurrent,
      scopeKey: miniCurrent,
      market: "current global PP7601/1122 and MILK 010 child SKUs",
      validFrom: "2026",
      productionState: "current",
      nibScope:
        "No.5 stainless steel; Fine and Medium are the current exact child-SKU widths.",
      materialScope:
        "Galalith body, 316L stainless-steel clip, gold plating and Magnetic Lock.",
      editionScope:
        "Current 2026 Alba Mini fountain pen; no official limited-edition count is asserted.",
    },
    {
      key: miniClassicSibling,
      scopeKey: miniClassicSibling,
      market: "Alba Classic PP7701/1120 sibling exclusion",
      validFrom: "2026",
      productionState: "current",
      nibScope:
        "Classic No.6 EF/F/M does not qualify Mini No.5 F/M fields.",
      materialScope:
        "Shared galalith does not transfer Classic palladium trims or Twist Magnetic Lock.",
      editionScope:
        "Classic converter support and 144 mm dimensions remain sibling evidence.",
    },
    {
      key: miniGenericSibling,
      scopeKey: miniGenericSibling,
      market: "generic Fountain Pen Mini SPP7201/1063 exclusion",
      productionState: "current",
      nibScope:
        "A similar No.5 F/M selector does not establish identity continuity.",
      materialScope:
        "Generic Mini UltraResin and palladium-finished parts do not qualify Alba Mini galalith and gold plating.",
      editionScope:
        "Generic Mini is retained as a distinct same-word sibling, not an alias.",
    },
  ],
  claims: [
    {
      key: "phase592-pineider-alba-mini-identity",
      predicate: "model_identity",
      objectText:
        "The canonical current identity is Pineider Alba Mini Fountain Pen PP7601/1122 with two MILK 010 nib child SKUs; generic Pineider Mini, rollerball and ballpoint remain separate.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: mini.official.key,
      locator: mini.official.summary,
      evidence: [
        {
          key: "phase592-alba-mini-identity-exact-evidence",
          sourceKey: mini.official.key,
          scopeKey: miniCurrent,
          locator: mini.official.summary,
        },
        {
          key: "phase592-alba-mini-identity-collection-evidence",
          sourceKey: common.collection.key,
          scopeKey: miniCurrent,
          locator: common.collection.summary,
        },
      ],
    },
    {
      key: "phase592-pineider-alba-mini-configuration",
      predicate: "current_configuration",
      objectText:
        "Current Mini is an Italian 120 mm by 13.4 mm galalith fountain pen with No.5 steel F/M, cartridge-only filling, gold plating and Magnetic Lock.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.identity.key,
      locator: common.identity.summary,
      evidence: [
        {
          key: "phase592-alba-mini-config-identity-card-evidence",
          sourceKey: common.identity.key,
          scopeKey: miniCurrent,
          locator: common.identity.summary,
        },
        {
          key: "phase592-alba-mini-config-exact-evidence",
          sourceKey: mini.official.key,
          scopeKey: miniCurrent,
          locator: mini.official.summary,
        },
      ],
    },
    {
      key: "phase592-pineider-alba-mini-boundary",
      predicate: "sibling_scope_boundary",
      objectText:
        "Alba Mini is distinct from Alba Classic and generic Fountain Pen Mini SPP7201/1063; model code, galalith, gold plating and cartridge-only filling are required identity boundaries.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: mini.official.key,
      locator: mini.official.summary,
      evidence: [
        {
          key: "phase592-alba-mini-boundary-generic-evidence",
          sourceKey: mini.genericMini.key,
          scopeKey: miniGenericSibling,
          locator: mini.genericMini.summary,
        },
        {
          key: "phase592-alba-mini-boundary-independent-evidence",
          sourceKey: common.repubblica.key,
          scopeKey: miniClassicSibling,
          locator: common.repubblica.summary,
        },
      ],
    },
  ],
  variants: [
    {
      key: miniMainVariant,
      name: "Alba Mini Fountain Pen PP7601 / 1122",
      releaseYear: "2026",
      notes: "Exact current MILK product anchor with gold trims.",
      sourceKey: mini.official.key,
      variantKind: "edition_group",
      productCode: "PP7601 / 1122",
      market: "global current",
    },
    ...[
      ["f", "Fine", "SPP7601F010"],
      ["m", "Medium", "SPP7601M010"],
    ].map(([suffix, width, productCode]) => ({
      key: `phase592-pineider-alba-mini-${suffix}-child-sku`,
      name: `Alba Mini ${width} child SKU`,
      notes: `Official current ${width} selector under PP7601/1122 and MILK 010.`,
      sourceKey: mini.official.key,
      variantKind: "nib" as const,
      parentVariantKey: miniMainVariant,
      productCode,
      market: "global current",
    })),
  ],
  spec: {
    brandEntityId: PHASE592_PINEIDER_BRAND_ID,
    values: {
      series_name: "Pineider Alba Mini Fountain Pen PP7601/1122",
      release_year: "2026 Alba collection",
      origin_country: "Italy",
      nib: "No.5 stainless steel; Fine and Medium",
      fill_system: "Cartridge only; Magnetic Lock cap closure",
      material:
        "Galalith (milk casein), 316L stainless-steel clip and gold plating",
      dimensions: "120 mm; diameter 13.4 mm",
      weight: "Not published on the current official PP7601/1122 page",
      status: "Current 2026 Alba Mini; verified 2026-08-11",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase592-alba-mini-spec-brand",
        mini.official.key,
        miniCurrent,
        "exact Pineider product identity",
      ),
      specEvidence(
        "series_name",
        "phase592-alba-mini-spec-series",
        mini.official.key,
        miniCurrent,
        "H1 Alba Mini Fountain Pen with Gold Trims and Model PP7601/1122",
      ),
      specEvidence(
        "release_year",
        "phase592-alba-mini-spec-release",
        common.repubblica.key,
        miniCurrent,
        "dated 11 June 2026 report calls Alba a new Pineider collection",
      ),
      specEvidence(
        "origin_country",
        "phase592-alba-mini-spec-origin",
        mini.official.key,
        miniCurrent,
        "DETAILS states Origin Italy",
      ),
      specEvidence(
        "nib",
        "phase592-alba-mini-spec-nib",
        common.identity.key,
        miniCurrent,
        "Mini identity card states No.5 stainless steel F/M",
      ),
      specEvidence(
        "fill_system",
        "phase592-alba-mini-spec-fill",
        common.identity.key,
        miniCurrent,
        "Mini identity card states cartridge and Magnetic Lock",
      ),
      specEvidence(
        "material",
        "phase592-alba-mini-spec-material",
        common.identity.key,
        miniCurrent,
        "Mini identity card states galalith, 316L clip and gold plating",
      ),
      specEvidence(
        "dimensions",
        "phase592-alba-mini-spec-dimensions",
        mini.official.key,
        miniCurrent,
        "DETAILS states 120 MM and diameter 13.4 MM",
      ),
      specEvidence(
        "weight",
        "phase592-alba-mini-spec-weight-unpublished",
        mini.official.key,
        miniCurrent,
        "current exact page publishes no product weight; no number asserted",
      ),
      specEvidence(
        "status",
        "phase592-alba-mini-spec-status",
        common.magazine.key,
        miniCurrent,
        "dated 17 June 2026 official Alba launch article and current product page",
      ),
      specEvidence(
        "series_name",
        "phase592-alba-mini-rejected-generic-mini-name",
        mini.genericMini.key,
        miniGenericSibling,
        "Fountain Pen Mini SPP7201/1063 is a distinct UltraResin sibling and not an Alba Mini alias",
        false,
      ),
      specEvidence(
        "material",
        "phase592-alba-mini-rejected-generic-mini-material",
        mini.genericMini.key,
        miniGenericSibling,
        "generic Mini UltraResin and palladium-finished parts do not qualify Alba Mini",
        false,
      ),
      specEvidence(
        "nib",
        "phase592-alba-mini-rejected-classic-nib",
        common.identity.key,
        miniClassicSibling,
        "Classic No.6 EF/F/M does not qualify Mini No.5 F/M",
        false,
      ),
      specEvidence(
        "fill_system",
        "phase592-alba-mini-rejected-classic-fill",
        common.identity.key,
        miniClassicSibling,
        "Classic converter support and Twist Magnetic Lock do not qualify Mini",
        false,
      ),
      specEvidence(
        "dimensions",
        "phase592-alba-mini-rejected-classic-dimensions",
        classic.official.key,
        miniClassicSibling,
        "Classic 144 mm by 15.5 mm does not qualify Mini dimensions",
        false,
      ),
    ],
  },
  timeline: [
    {
      key: "phase592-alba-mini-press-launch",
      title: "Alba launch reported with Classic and Mini routes",
      eventType: "model_released",
      startDate: "2026-06-11",
      circa: false,
      description:
        "The independent report documents the 2026 launch context and compact Mini route.",
      sourceKey: common.repubblica.key,
    },
    {
      key: "phase592-alba-mini-official-article",
      title: "Pineider publishes the Alba collection article",
      eventType: "design_milestone",
      startDate: "2026-06-17",
      circa: false,
      description:
        "The official article documents galalith and the separate Classic/Mini proportions.",
      sourceKey: common.magazine.key,
    },
  ],
  conflicts: [
    {
      key: "phase592-alba-mini-generic-mini-identity-conflict",
      fieldKey: "model_identity",
      scopeKey: miniCurrent,
      conflictKind: "identity",
      status: "resolved",
      resolutionNote:
        "Alba Mini requires PP7601/1122 and galalith/gold/cartridge scope. Generic Fountain Pen Mini SPP7201/1063 is UltraResin with palladium-finished parts and remains a separate sibling.",
      members: [
        {
          citationKey: "phase592-alba-mini-spec-series",
          assertedValue: "Alba Mini PP7601/1122",
        },
        {
          citationKey: "phase592-alba-mini-rejected-generic-mini-name",
          assertedValue: "Fountain Pen Mini SPP7201/1063",
        },
      ],
    },
    {
      key: "phase592-alba-mini-classic-fill-conflict",
      fieldKey: "fill_system",
      scopeKey: miniCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The official identity card assigns cartridge-only to Mini and converter or cartridge to Classic; Classic converter support is nonqualifying for Mini.",
      members: [
        {
          citationKey: "phase592-alba-mini-spec-fill",
          assertedValue: "Mini cartridge-only with Magnetic Lock",
        },
        {
          citationKey: "phase592-alba-mini-rejected-classic-fill",
          assertedValue: "Classic converter or cartridge with Twist Magnetic Lock",
        },
      ],
    },
  ],
  media: [
    {
      key: "phase592-pineider-alba-mini-primary",
      title:
        "Pineider Alba Mini PP7601／1122 紧凑型号边界事实图（非产品照片）",
      sourceKey: mini.diagram.key,
      localPath: mini.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、外形、galalith 纹理、比例、商标、金色饰件、笔夹或磁吸机构。",
      sourceUrl: mini.diagram.url,
      usageStatus: "primary",
    },
  ],
};

function mergeSources(
  base: readonly CuratedSource[],
  extras: readonly CuratedSource[],
): CuratedSource[] {
  const byKey = new Map(base.map((source) => [source.key, source]));
  for (const source of extras) {
    const previous = byKey.get(source.key);
    if (previous && JSON.stringify(previous) !== JSON.stringify(source)) {
      throw new Error(`Phase 592 conflicting source definition: ${source.key}.`);
    }
    byKey.set(source.key, source);
  }
  return [...byKey.values()];
}

const brandScope = phase591PineiderBrandPack.scopes[0]?.scopeKey;
if (!brandScope) {
  throw new Error("Phase 592 Pineider brand pack requires a canonical scope.");
}

export const phase592PineiderBrandPack: CuratedEntityPack = {
  ...phase591PineiderBrandPack,
  key: "phase592-pineider-brand-depth-refresh-v1",
  markdownFile: ".planning/content-research/pineider-brand-phase592.md",
  storyTitle: "Pineider：十一条公开型号入口与 Alba 双路线边界",
  publicationIntent: "publish",
  publicationBlockers: [],
  sources: mergeSources(phase591PineiderBrandPack.sources, [
    common.collection,
    common.identity,
    common.magazine,
    common.repubblica,
    common.vam,
    classic.official,
    mini.official,
    mini.genericMini,
  ]),
  claims: [
    ...phase591PineiderBrandPack.claims,
    {
      key: "phase592-pineider-brand-eleven-model-navigation",
      predicate: "series_navigation",
      objectText:
        "Pineider now has eleven public model nodes including separate 2026 Alba Classic PP7701/1120 and Alba Mini PP7601/1122; shared galalith never transfers dimensions, nib, filling, trim or closure fields.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.collection.key,
      locator: common.collection.summary,
      evidence: [
        {
          key: "phase592-pineider-brand-alba-collection-evidence",
          sourceKey: common.collection.key,
          scopeKey: brandScope,
          locator: common.collection.summary,
        },
        {
          key: "phase592-pineider-brand-alba-classic-evidence",
          sourceKey: classic.official.key,
          scopeKey: brandScope,
          locator: classic.official.summary,
        },
        {
          key: "phase592-pineider-brand-alba-mini-evidence",
          sourceKey: mini.official.key,
          scopeKey: brandScope,
          locator: mini.official.summary,
        },
        {
          key: "phase592-pineider-brand-alba-independent-evidence",
          sourceKey: common.repubblica.key,
          scopeKey: brandScope,
          locator: common.repubblica.summary,
        },
      ],
    },
  ],
};

export const phase592PineiderPacks: CuratedEntityPack[] = [
  phase592PineiderBrandPack,
  phase592PineiderAlbaClassicPack,
  phase592PineiderAlbaMiniPack,
];

if (
  phase592PineiderPacks.length !== 3 ||
  new Set(phase592PineiderPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 592 must contain one brand and two unique model packs.");
}
