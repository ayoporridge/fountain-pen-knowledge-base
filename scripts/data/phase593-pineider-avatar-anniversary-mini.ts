import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE592_PINEIDER_BRAND_ID,
  phase592PineiderBrandPack,
} from "./phase592-pineider-alba-classic-mini";

export const PHASE593_PINEIDER_BRAND_ID = PHASE592_PINEIDER_BRAND_ID;

export const PHASE593_IDS = {
  avatarAnniversary: "phase593-pineider-avatar-anniversary",
  avatarUrMini: "phase593-pineider-avatar-ur-mini",
} as const;

export const PHASE593_SLUGS = {
  avatarAnniversary: "pineider-avatar-anniversary-pp7301-1026",
  avatarUrMini: "pineider-avatar-ur-mini-spp6801-941",
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
    registryKey: "pineider-official-phase593",
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
  sourceType?: "blog" | "retailer";
  publishedAt?: string;
}): CuratedSource {
  return web({
    ...input,
    sourceType: input.sourceType ?? "blog",
    tier: "professional_secondary",
  });
}

function editorial(
  key: "avatar-anniversary" | "avatar-ur-mini",
  title: string,
): CuratedSource {
  const localPath = `/images/library/site-original/phase593/pineider/pineider-${key}.svg`;
  return {
    key: `phase593-pineider-${key}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase593-${key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase593-${key}`,
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创事实示意图，非产品照片；不复刻品牌标识、商品照片、真实笔形、颜色、树脂纹理、饰件、笔夹、机构或比例。",
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
  note?: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies, note };
}

const common = {
  anniversaryCollection: official({
    key: "phase593-pineider-anniversary-250-collection",
    title: "Pineider Anniversary 250",
    url: "https://www.pineider.com/en/pens/collections/anniversary",
    summary:
      "Anniversary 250 专页把 fountain pen 与 roller／ballpoint 分开，公布 Black 与 P. Green、glossy resin、yellow-gold enamelled steel nib EF／F／M、steel feather clip、Magnetic Lock、Cartridge／Converter 与佛罗伦萨组装。",
    locator:
      "Anniversary 250 fountain-pen section and spec cards: 2 colours Black and P. Green; glossy resin; yellow-gold enamelled steel EF/F/M; steel feather clip; Yellow Gold; Magnetic Lock; Cartridge/Converter",
  }),
  anniversaryExact: official({
    key: "phase593-pineider-avatar-anniversary-pp7301-1026-official",
    title: "Fountain Pen Avatar Anniversary",
    url: "https://www.pineider.com/en/products/fountain-pen-avatar-anniversary-1026",
    summary:
      "当前 exact 页面确认 PP7301／1026、黑色 056 与 Pineider Green 374 六个 child SKU、EF／F／M、148 mm、Ø14.2 mm、Italy、Serpentine Green 与 converter or cartridge。",
    locator:
      "H1 and Model PP7301/1026; variant HTML maps E/F/M with colors 056 and 374 to six SPP7301 child SKUs; DETAILS 148 MM, diameter 14.2 MM and Italy; DESCRIPTION converter or cartridge",
  }),
  avatarCollection: official({
    key: "phase593-pineider-avatar-collection",
    title: "Pineider Avatar UR collection",
    url: "https://www.pineider.com/en/pens/collections/avatar",
    summary:
      "当前 Avatar collection 将常规 Avatar、Anniversary 与 SPP6801 Mini 商品分开；家族说明给出 UltraResin、marine-steel feather clip、Florence skyline ring 与 magnetic closure，另有未与 SPP6801 exact SKU 对齐的 Yellow／Mint／Dust／Peach Mini 文案。",
    locator:
      "product grid separately lists SPP6801 Avatar UR Mini fountain pen and full-size Avatar items; collection prose identifies UltraResin, feather clip, Florence skyline ring and magnetic closure; Mini prose lists Yellow/Mint/Dust/Peach",
  }),
  miniExact: official({
    key: "phase593-pineider-avatar-ur-mini-spp6801-941-official",
    title: "Avatar UR Mini Fountain Pen",
    url: "https://www.pineider.com/us/products/avatar-ur-mini-fountain-pen-941",
    summary:
      "当前 exact 页面确认 SPP6801／941、五个官方色号十个 F／M child SKU、120 mm、Ø13.4 mm、Italy、Florence skyline ring、feather clip、nickel-free palladium finish 与 cartridge／converter。",
    locator:
      "H1 and Model SPP6801/941; variant HTML maps F/M and colors 056/644/645/646/647 to ten child SKUs; DETAILS 120 MM, diameter 13.4 MM and Italy; DESCRIPTION nickel-free palladium finishes and cartridge/converter",
  }),
  anniversaryMagazine: official({
    key: "phase593-pineider-250-stamp-magazine",
    title: "The Commemorative Postage Stamp: A Symbol of History and Tradition",
    url: "https://magazine.pineider.com/en/the-commemorative-postage-stamp-a-symbol-of-history-and-tradition/",
    publishedAt: "2024-10-22",
    summary:
      "Pineider 2024-10-22 文章确认品牌 1774 年创立并在 2024 年庆祝 250 周年；只支撑 Anniversary 的纪念时态，不证明 PP7301 限量数量或精确首卖日。",
    locator:
      "dated 22 October 2024; text states founded in Florence in 1774 and recently celebrated 250 years; no PP7301 limited count",
  }),
  zegarki: secondary({
    key: "phase593-zegarki-pineider-avatar-anniversary-review",
    registryKey: "zegarki-i-piora-phase593-pineider-anniversary",
    registryName: "Zegarki i Pióra",
    independenceGroup: "zegarki-i-piora",
    title: "Pineider Avatar Anniversary",
    url: "https://zegarkiipiora.com/2025/03/11/pineider-avatar-anniversary/",
    homepageUrl: "https://zegarkiipiora.com/",
    author: "Łysień Mariusz",
    publishedAt: "2025-03-11",
    summary:
      "实笔文章确认周年款基于 Avatar 但与常规款有别；深绿色在许多光线下近似黑色，帽环写有 Pineider、FIRENZE 1774 与 MADE IN ITALY。文章注明样笔由经销商提供。",
    locator:
      "dated 11 March 2025; paragraphs distinguish anniversary from regular Avatar, describe dark green appearing black and the anniversary cap-band wording; distributor review sample disclosed",
  }),
  fulker: secondary({
    key: "phase593-fulker-pineider-avatar-anniversary",
    registryKey: "fulker-phase593-pineider-anniversary",
    registryName: "Fulker",
    independenceGroup: "fulker",
    title: "Penna Stilografica Pineider Avatar Anniversary",
    url: "https://www.fulker.it/penna/penna-stilografica-pineider-avatar-anniversary/",
    homepageUrl: "https://www.fulker.it/",
    author: "Fulker",
    sourceType: "retailer",
    summary:
      "专业零售页把周年款写作 UltraResin，并在附加资料中使用 acrylic；同时列 Serpentine Green、gold trims、gold-plated steel F 与 cartridge／converter。材料用词只作为冲突样本。",
    locator:
      "product description calls body UltraResin and lists Serpentine Green, gold trim, gold-plated steel F and cartridge/converter; additional information labels material acrylic",
  }),
  penChalet: secondary({
    key: "phase593-pen-chalet-pineider-avatar-ur-mini",
    registryKey: "pen-chalet-phase593-pineider-avatar-ur-mini",
    registryName: "Pen Chalet",
    independenceGroup: "pen-chalet",
    title: "Pineider Avatar UR Mini Fountain Pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/pineider_avatar_ur_mini_fountain_pens.html",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    sourceType: "retailer",
    summary:
      "专业零售样本页列 UltraResin、palladium-plated stainless-steel #6 nib、magnetic cap、standard international cartridge／mini converter、121.9 mm、22.68 g，并多列 Lux；样本测量和零售颜色不覆盖官网 exact scope。",
    locator:
      "About and Product Specifications: stainless steel palladium-plated #6 nib, magnetic cap, standard international cartridge or mini converter, capped 121.9 mm, 22.68 g; retail colour list includes Lux",
  }),
  albaMiniExact: official({
    key: "phase593-pineider-alba-mini-sibling-pp7601-1122",
    title: "Alba Mini Fountain Pen with Gold Trims",
    url: "https://www.pineider.com/en/products/alba-mini-fountain-pen-with-gold-trims-1122",
    summary:
      "Alba Mini 是 PP7601／1122、galalith、gold trims 与 120 mm 的另一具体 Mini；它不是 SPP6801／941 alias。",
    locator:
      "H1 Alba Mini Fountain Pen with Gold Trims; Model PP7601/1122; DETAILS 120 MM and 13.4 MM; separate exact product from Avatar UR Mini",
  }),
};

const anniversaryDiagram = editorial(
  "avatar-anniversary",
  "Pineider Avatar Anniversary PP7301／1026 身份与版本边界事实图",
);
const miniDiagram = editorial(
  "avatar-ur-mini",
  "Pineider Avatar UR Mini SPP6801／941 十个 child SKU 与 Mini 边界事实图",
);

const anniversaryCurrent =
  "phase593-pineider-avatar-anniversary-current-pp7301-1026";
const anniversarySibling =
  "phase593-pineider-avatar-anniversary-writing-mode-siblings";
const anniversaryRetailMaterial =
  "phase593-pineider-avatar-anniversary-retail-material-wording";
const anniversaryMain = "phase593-pineider-avatar-anniversary-main";

export const phase593PineiderAvatarAnniversaryPack: CuratedEntityPack = {
  key: "phase593-pineider-avatar-anniversary-v1",
  entityId: PHASE593_IDS.avatarAnniversary,
  expectedType: "pen",
  expectedSlug: PHASE593_SLUGS.avatarAnniversary,
  canonicalName: "Pineider Avatar Anniversary Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/pineider-avatar-anniversary-phase593.md",
  storyTitle:
    "Pineider Avatar Anniversary：PP7301／1026、六个 child SKU 与周年边界",
  primarySourceKey: common.anniversaryExact.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Pineider Avatar Anniversary",
      language: "en",
      sourceKey: common.anniversaryExact.key,
    },
    {
      alias: "Pineider Avatar Anniversary PP7301/1026",
      language: "en",
      sourceKey: common.anniversaryExact.key,
    },
    {
      alias: "皮内德 Avatar 250 周年钢笔",
      language: "zh",
      sourceKey: common.anniversaryCollection.key,
    },
  ],
  sources: [
    common.anniversaryExact,
    common.anniversaryCollection,
    common.avatarCollection,
    common.anniversaryMagazine,
    common.zegarki,
    common.fulker,
    anniversaryDiagram,
  ],
  scopes: [
    {
      key: anniversaryCurrent,
      scopeKey: anniversaryCurrent,
      variantKey: anniversaryMain,
      market: "current global PP7301/1026; colours 056 and 374",
      validFrom: "2024",
      productionState: "current",
      nibScope: "Steel nib with yellow-gold finish; EF, F and M.",
      materialScope: "Glossy resin body; Yellow Gold finish.",
      editionScope:
        "Pineider 250th-anniversary context; no official limited-count claim.",
    },
    {
      key: anniversarySibling,
      scopeKey: anniversarySibling,
      market: "Anniversary rollerball PP7302 and ballpoint PP7303",
      productionState: "current",
      editionScope:
        "Writing-mode siblings are evidence for separation, not PP7301 variants.",
    },
    {
      key: anniversaryRetailMaterial,
      scopeKey: anniversaryRetailMaterial,
      market: "Fulker retail wording",
      productionState: "unknown",
      materialScope:
        "Retail copy alternates UltraResin and acrylic; neither overrides the official glossy-resin field.",
    },
  ],
  claims: [
    {
      key: "phase593-anniversary-exact-identity",
      predicate: "exact_product_identity",
      objectText:
        "Fountain Pen Avatar Anniversary is PP7301/1026 with six current SPP7301 child SKUs across Black 056 and Pineider Green 374, each in EF, F or M.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.anniversaryExact.key,
      locator: common.anniversaryExact.summary,
      evidence: [
        {
          key: "phase593-anniversary-identity-evidence",
          sourceKey: common.anniversaryExact.key,
          scopeKey: anniversaryCurrent,
          locator: common.anniversaryExact.summary,
        },
        {
          key: "phase593-anniversary-identity-secondary-evidence",
          sourceKey: common.zegarki.key,
          scopeKey: anniversaryCurrent,
          locator:
            "The dated review identifies Avatar Anniversary as a special edition based on Avatar while explicitly distinguishing it from the regular version; its disclosed sample supports the model boundary, not the official code matrix.",
        },
      ],
    },
    {
      key: "phase593-anniversary-configuration",
      predicate: "current_configuration",
      objectText:
        "The official Anniversary 250 scope specifies glossy resin, a yellow-gold-finished steel nib in EF/F/M, Magnetic Lock and cartridge/converter filling; the exact page specifies 148 mm by 14.2 mm and Italy.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.anniversaryCollection.key,
      locator: common.anniversaryCollection.summary,
      evidence: [
        {
          key: "phase593-anniversary-configuration-collection",
          sourceKey: common.anniversaryCollection.key,
          scopeKey: anniversaryCurrent,
          locator: common.anniversaryCollection.summary,
        },
        {
          key: "phase593-anniversary-configuration-exact",
          sourceKey: common.anniversaryExact.key,
          scopeKey: anniversaryCurrent,
          locator: common.anniversaryExact.summary,
        },
      ],
    },
    {
      key: "phase593-anniversary-context-not-count",
      predicate: "edition_boundary",
      objectText:
        "The 250th-anniversary context is sourced, but the official pages do not establish a numbered or 250-piece limited edition.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.anniversaryMagazine.key,
      locator: common.anniversaryMagazine.summary,
      evidence: [
        {
          key: "phase593-anniversary-context-evidence",
          sourceKey: common.anniversaryMagazine.key,
          scopeKey: anniversaryCurrent,
          locator: common.anniversaryMagazine.summary,
        },
      ],
    },
    {
      key: "phase593-anniversary-dark-green-observation",
      predicate: "professional_observation",
      objectText:
        "A disclosed distributor-supplied review sample appeared nearly black in many lighting conditions and had anniversary-specific cap-band wording.",
      factClass: "editorial",
      confidence: 0.88,
      sourceKey: common.zegarki.key,
      locator: common.zegarki.summary,
      evidence: [
        {
          key: "phase593-anniversary-review-evidence",
          sourceKey: common.zegarki.key,
          scopeKey: anniversaryCurrent,
          locator: common.zegarki.summary,
        },
      ],
    },
    {
      key: "phase593-anniversary-writing-mode-boundary",
      predicate: "sibling_boundary",
      objectText:
        "Anniversary rollerball PP7302 and ballpoint PP7303 are separate writing instruments, not fountain-pen variants of PP7301.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.anniversaryCollection.key,
      locator: common.anniversaryCollection.summary,
      evidence: [
        {
          key: "phase593-anniversary-sibling-evidence",
          sourceKey: common.anniversaryCollection.key,
          scopeKey: anniversarySibling,
          locator: common.anniversaryCollection.summary,
        },
      ],
    },
  ],
  variants: [
    {
      key: anniversaryMain,
      name: "Avatar Anniversary PP7301／1026 current fountain pen",
      releaseYear: "2024",
      notes:
        "Current anniversary fountain-pen edition group; two colours and three nib widths, without a limited-count claim.",
      sourceKey: common.anniversaryExact.key,
      variantKind: "edition_group",
      productCode: "PP7301/1026",
      market: "global",
    },
    ...[
      ["e056", "Black 056 Extra Fine", "SPP7301E056"],
      ["f056", "Black 056 Fine", "SPP7301F056"],
      ["m056", "Black 056 Medium", "SPP7301M056"],
      ["e374", "Pineider Green 374 Extra Fine", "SPP7301E374"],
      ["f374", "Pineider Green 374 Fine", "SPP7301F374"],
      ["m374", "Pineider Green 374 Medium", "SPP7301M374"],
    ].map(([key, name, productCode]) => ({
      key: `phase593-anniversary-sku-${key}`,
      name,
      notes: "Exact current child SKU from the official PP7301/1026 selector HTML.",
      sourceKey: common.anniversaryExact.key,
      variantKind: "market_sku" as const,
      parentVariantKey: anniversaryMain,
      productCode,
      market: "global",
    })),
  ],
  spec: {
    brandEntityId: PHASE593_PINEIDER_BRAND_ID,
    values: {
      series_name: "Avatar Anniversary",
      origin_country: "Italy",
      nib: "Yellow-gold-finished steel nib; Extra Fine, Fine or Medium",
      fill_system: "Cartridge or converter",
      material: "Glossy resin; Yellow Gold finish and steel feather clip",
      dimensions: "148 mm; diameter 14.2 mm",
      status:
        "Current PP7301/1026 anniversary fountain pen; six official child SKUs; no official limited-count claim",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase593-anniversary-spec-brand",
        common.anniversaryExact.key,
        anniversaryCurrent,
        "Official exact page identifies Pineider product and PP7301/1026.",
      ),
      specEvidence(
        "series_name",
        "phase593-anniversary-spec-series",
        common.anniversaryExact.key,
        anniversaryCurrent,
        "H1 Fountain Pen Avatar Anniversary and Model PP7301/1026.",
      ),
      specEvidence(
        "origin_country",
        "phase593-anniversary-spec-origin",
        common.anniversaryExact.key,
        anniversaryCurrent,
        "DETAILS states Origin Italy.",
      ),
      specEvidence(
        "nib",
        "phase593-anniversary-spec-nib",
        common.anniversaryCollection.key,
        anniversaryCurrent,
        "Anniversary fountain-pen spec card states yellow-gold enamelled steel nib, EF/F/M.",
      ),
      specEvidence(
        "fill_system",
        "phase593-anniversary-spec-fill",
        common.anniversaryCollection.key,
        anniversaryCurrent,
        "Anniversary fountain-pen spec card states Cartridge / Converter.",
      ),
      specEvidence(
        "material",
        "phase593-anniversary-spec-material",
        common.anniversaryCollection.key,
        anniversaryCurrent,
        "Anniversary fountain-pen spec card states glossy resin and Yellow Gold finish.",
      ),
      specEvidence(
        "dimensions",
        "phase593-anniversary-spec-dimensions",
        common.anniversaryExact.key,
        anniversaryCurrent,
        "DETAILS states 148 MM and diameter 14.2 MM.",
      ),
      specEvidence(
        "status",
        "phase593-anniversary-spec-status",
        common.anniversaryExact.key,
        anniversaryCurrent,
        "Current exact product page exposes six SPP7301 child SKUs.",
      ),
      specEvidence(
        "material",
        "phase593-anniversary-rejected-ultraresin",
        common.fulker.key,
        anniversaryRetailMaterial,
        "Fulker product prose calls the body UltraResin.",
        false,
        "Professional retail wording retained, but it does not override the official glossy-resin field.",
      ),
      specEvidence(
        "material",
        "phase593-anniversary-rejected-acrylic",
        common.fulker.key,
        anniversaryRetailMaterial,
        "Fulker additional information labels the material acrylic.",
        false,
        "Conflicting retailer metadata is nonqualifying for the canonical material field.",
      ),
    ],
  },
  conflicts: [
    {
      key: "phase593-anniversary-material-wording-conflict",
      fieldKey: "material",
      scopeKey: anniversaryCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The official Anniversary 250 exact collection specification is canonical: glossy resin. Fulker's UltraResin and acrylic labels remain rejected retail wording.",
      members: [
        {
          citationKey: "phase593-anniversary-spec-material",
          assertedValue: "Glossy resin",
        },
        {
          citationKey: "phase593-anniversary-rejected-ultraresin",
          assertedValue: "UltraResin",
        },
        {
          citationKey: "phase593-anniversary-rejected-acrylic",
          assertedValue: "Acrylic",
        },
      ],
    },
  ],
  timeline: [
    {
      key: "phase593-anniversary-250-context",
      title: "Pineider marks its 250th anniversary",
      eventType: "design_milestone",
      startDate: "2024-10-22",
      circa: false,
      description:
        "Pineider's dated article records the 1774–2024 anniversary context; it does not establish a PP7301 limited count.",
      sourceKey: common.anniversaryMagazine.key,
    },
    {
      key: "phase593-anniversary-professional-review",
      title: "Avatar Anniversary documented in a disclosed review sample",
      eventType: "community_event",
      startDate: "2025-03-11",
      circa: false,
      description:
        "Zegarki i Pióra published a distributor-supplied sample review distinguishing the anniversary pen from regular Avatar versions.",
      sourceKey: common.zegarki.key,
    },
  ],
  media: [
    {
      key: "phase593-pineider-avatar-anniversary-primary",
      title:
        "Pineider Avatar Anniversary PP7301／1026 身份与版本边界事实图（非产品照片）",
      sourceKey: anniversaryDiagram.key,
      localPath: anniversaryDiagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、树脂纹理、外形、比例、商标、帽环、笔夹、饰件或磁吸机构。",
      sourceUrl: anniversaryDiagram.url,
      usageStatus: "primary",
    },
  ],
};

const miniCurrent = "phase593-pineider-avatar-ur-mini-current-spp6801-941";
const miniCollectionText =
  "phase593-pineider-avatar-ur-mini-unresolved-collection-colours";
const miniRetailSample =
  "phase593-pineider-avatar-ur-mini-pen-chalet-sample";
const miniSibling = "phase593-pineider-avatar-ur-mini-sibling-boundary";
const miniMain = "phase593-pineider-avatar-ur-mini-main";

export const phase593PineiderAvatarUrMiniPack: CuratedEntityPack = {
  key: "phase593-pineider-avatar-ur-mini-v1",
  entityId: PHASE593_IDS.avatarUrMini,
  expectedType: "pen",
  expectedSlug: PHASE593_SLUGS.avatarUrMini,
  canonicalName: "Pineider Avatar UR Mini Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pineider-avatar-ur-mini-phase593.md",
  storyTitle:
    "Pineider Avatar UR Mini：SPP6801／941、十个 child SKU 与 Mini 边界",
  primarySourceKey: common.miniExact.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Pineider Avatar UR Mini",
      language: "en",
      sourceKey: common.miniExact.key,
    },
    {
      alias: "Pineider Avatar UR Mini SPP6801/941",
      language: "en",
      sourceKey: common.miniExact.key,
    },
    {
      alias: "皮内德 Avatar UR Mini 钢笔",
      language: "zh",
      sourceKey: common.miniExact.key,
    },
  ],
  sources: [
    common.miniExact,
    common.avatarCollection,
    common.anniversaryExact,
    common.albaMiniExact,
    common.penChalet,
    miniDiagram,
  ],
  scopes: [
    {
      key: miniCurrent,
      scopeKey: miniCurrent,
      variantKey: miniMain,
      market: "current SPP6801/941 exact page; colours 056/644/645/646/647",
      productionState: "current",
      nibScope:
        "Fine and Medium on the official exact page; stainless-steel #6 is Pen Chalet sample detail.",
      materialScope:
        "Avatar-family UltraResin with nickel-free palladium-finish hardware.",
      editionScope:
        "Compact Avatar UR fountain pen; ten exact child SKUs, separate from roller SPP6802.",
    },
    {
      key: miniCollectionText,
      scopeKey: miniCollectionText,
      market: "current Avatar collection prose without exact Mini SKU mapping",
      productionState: "unknown",
      editionScope:
        "Yellow, Mint, Dust and Peach remain unresolved until an exact model code and child SKUs are published.",
    },
    {
      key: miniRetailSample,
      scopeKey: miniRetailSample,
      market: "Pen Chalet professional retail sample",
      productionState: "unknown",
      nibScope: "Stainless-steel palladium-plated #6 nib; F/M.",
      materialScope: "UltraResin body; retail colour list includes Lux.",
      editionScope:
        "121.9 mm capped and 22.68 g are sample measurements, not Pineider nominal values.",
    },
    {
      key: miniSibling,
      scopeKey: miniSibling,
      market: "same-brand Mini and Avatar siblings",
      productionState: "current",
      editionScope:
        "Full-size Avatar UR, Anniversary PP7301, Alba Mini PP7601 and roller SPP6802 remain separate identities.",
    },
  ],
  claims: [
    {
      key: "phase593-mini-exact-identity",
      predicate: "exact_product_identity",
      objectText:
        "Avatar UR Mini Fountain Pen is SPP6801/941 with ten current F/M child SKUs across Black 056, Red Onyx 644, Imperial Green 645, Gray Zebrino 646 and Red Blue Solidale 647.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.miniExact.key,
      locator: common.miniExact.summary,
      evidence: [
        {
          key: "phase593-mini-identity-evidence",
          sourceKey: common.miniExact.key,
          scopeKey: miniCurrent,
          locator: common.miniExact.summary,
        },
      ],
    },
    {
      key: "phase593-mini-official-configuration",
      predicate: "current_configuration",
      objectText:
        "The current exact page specifies 120 mm by 13.4 mm, F/M, Italy, nickel-free palladium finishes and cartridge/converter; the Avatar collection identifies UltraResin and magnetic closure.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.miniExact.key,
      locator: common.miniExact.summary,
      evidence: [
        {
          key: "phase593-mini-configuration-exact",
          sourceKey: common.miniExact.key,
          scopeKey: miniCurrent,
          locator: common.miniExact.summary,
        },
        {
          key: "phase593-mini-configuration-collection",
          sourceKey: common.avatarCollection.key,
          scopeKey: miniCurrent,
          locator: common.avatarCollection.summary,
        },
      ],
    },
    {
      key: "phase593-mini-retail-sample",
      predicate: "professional_sample_measurement",
      objectText:
        "Pen Chalet reports a stainless-steel palladium-plated #6 nib, 121.9 mm capped length, 22.68 g, standard international cartridges and a mini converter for its retail sample.",
      factClass: "editorial",
      confidence: 0.9,
      sourceKey: common.penChalet.key,
      locator: common.penChalet.summary,
      evidence: [
        {
          key: "phase593-mini-retail-sample-evidence",
          sourceKey: common.penChalet.key,
          scopeKey: miniRetailSample,
          locator: common.penChalet.summary,
        },
      ],
    },
    {
      key: "phase593-mini-colour-boundary",
      predicate: "variant_scope_boundary",
      objectText:
        "Yellow, Mint, Dust and Peach in collection prose and Lux in retail inventory lack current SPP6801 exact child-SKU mapping and are not added to the canonical five-colour scope.",
      factClass: "core",
      confidence: 0.98,
      sourceKey: common.avatarCollection.key,
      locator: common.avatarCollection.summary,
      evidence: [
        {
          key: "phase593-mini-colour-boundary-collection",
          sourceKey: common.avatarCollection.key,
          scopeKey: miniCollectionText,
          locator: common.avatarCollection.summary,
        },
        {
          key: "phase593-mini-colour-boundary-retail",
          sourceKey: common.penChalet.key,
          scopeKey: miniRetailSample,
          locator: common.penChalet.summary,
        },
        {
          key: "phase593-mini-colour-boundary-exact",
          sourceKey: common.miniExact.key,
          scopeKey: miniCurrent,
          locator: common.miniExact.summary,
        },
      ],
    },
    {
      key: "phase593-mini-sibling-boundary",
      predicate: "sibling_boundary",
      objectText:
        "SPP6801/941 remains separate from full-size Avatar UR, Anniversary PP7301/1026, Alba Mini PP7601/1122 and rollerball SPP6802.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.avatarCollection.key,
      locator: common.avatarCollection.summary,
      evidence: [
        {
          key: "phase593-mini-sibling-avatar-evidence",
          sourceKey: common.avatarCollection.key,
          scopeKey: miniSibling,
          locator: common.avatarCollection.summary,
        },
        {
          key: "phase593-mini-sibling-anniversary-evidence",
          sourceKey: common.anniversaryExact.key,
          scopeKey: miniSibling,
          locator: common.anniversaryExact.summary,
        },
        {
          key: "phase593-mini-sibling-alba-evidence",
          sourceKey: common.albaMiniExact.key,
          scopeKey: miniSibling,
          locator: common.albaMiniExact.summary,
        },
      ],
    },
  ],
  variants: [
    {
      key: miniMain,
      name: "Avatar UR Mini SPP6801／941 current fountain pen",
      notes:
        "Current official exact-page edition group with five colours and two nib widths.",
      sourceKey: common.miniExact.key,
      variantKind: "edition_group",
      productCode: "SPP6801/941",
      market: "global",
    },
    ...[
      ["f056", "Black 056 Fine", "SPP6801F056"],
      ["m056", "Black 056 Medium", "SPP6801M056"],
      ["f644", "Red Onyx 644 Fine", "SPP6801F644"],
      ["m644", "Red Onyx 644 Medium", "SPP6801M644"],
      ["f645", "Imperial Green 645 Fine", "SPP6801F645"],
      ["m645", "Imperial Green 645 Medium", "SPP6801M645"],
      ["f646", "Gray Zebrino 646 Fine", "SPP6801F646"],
      ["m646", "Gray Zebrino 646 Medium", "SPP6801M646"],
      ["f647", "Red Blue Solidale 647 Fine", "SPP6801F647"],
      ["m647", "Red Blue Solidale 647 Medium", "SPP6801M647"],
    ].map(([key, name, productCode]) => ({
      key: `phase593-mini-sku-${key}`,
      name,
      notes: "Exact current child SKU from the official SPP6801/941 selector HTML.",
      sourceKey: common.miniExact.key,
      variantKind: "market_sku" as const,
      parentVariantKey: miniMain,
      productCode,
      market: "global",
    })),
  ],
  spec: {
    brandEntityId: PHASE593_PINEIDER_BRAND_ID,
    values: {
      series_name: "Avatar UR Mini",
      origin_country: "Italy",
      nib:
        "Fine or Medium; stainless-steel palladium-plated #6 is a Pen Chalet sample description",
      fill_system:
        "Cartridge or converter; Pen Chalet sample uses standard international cartridges or a mini converter",
      material: "UltraResin; nickel-free palladium-finish hardware",
      dimensions:
        "Official 120 mm and diameter 13.4 mm; Pen Chalet sample capped 121.9 mm",
      weight: "22.68 g Pen Chalet retail sample; no official nominal weight",
      status:
        "Current SPP6801/941 exact page; five official colours and ten child SKUs",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase593-mini-spec-brand",
        common.miniExact.key,
        miniCurrent,
        "Official exact page identifies Pineider product and SPP6801/941.",
      ),
      specEvidence(
        "series_name",
        "phase593-mini-spec-series",
        common.miniExact.key,
        miniCurrent,
        "H1 Avatar UR Mini Fountain Pen and Model SPP6801/941.",
      ),
      specEvidence(
        "origin_country",
        "phase593-mini-spec-origin",
        common.miniExact.key,
        miniCurrent,
        "DETAILS states Origin Italy.",
      ),
      specEvidence(
        "nib",
        "phase593-mini-spec-nib-widths",
        common.miniExact.key,
        miniCurrent,
        "Official selector exposes Fine and Medium child SKUs.",
      ),
      specEvidence(
        "nib",
        "phase593-mini-spec-nib-retail-sample",
        common.penChalet.key,
        miniRetailSample,
        "Pen Chalet sample states stainless-steel palladium-plated #6 nib.",
        true,
        "Qualifies only as explicitly labelled professional-retailer sample detail.",
      ),
      specEvidence(
        "fill_system",
        "phase593-mini-spec-fill",
        common.miniExact.key,
        miniCurrent,
        "Official description states cartridge and converter versions.",
      ),
      specEvidence(
        "fill_system",
        "phase593-mini-spec-fill-retail-sample",
        common.penChalet.key,
        miniRetailSample,
        "Pen Chalet specifies standard international cartridges and mini converter.",
        true,
        "Professional-retailer compatibility detail, not an official converter model claim.",
      ),
      specEvidence(
        "material",
        "phase593-mini-spec-material",
        common.avatarCollection.key,
        miniCurrent,
        "Avatar collection identifies UltraResin; exact page identifies nickel-free palladium finishes.",
      ),
      specEvidence(
        "dimensions",
        "phase593-mini-spec-dimensions-official",
        common.miniExact.key,
        miniCurrent,
        "DETAILS states 120 MM and diameter 13.4 MM.",
      ),
      specEvidence(
        "dimensions",
        "phase593-mini-rejected-dimensions-retail",
        common.penChalet.key,
        miniRetailSample,
        "Pen Chalet sample capped length is 121.9 mm.",
        false,
        "Retained as sample measurement; does not override official 120 mm nominal length.",
      ),
      specEvidence(
        "weight",
        "phase593-mini-spec-weight-retail-sample",
        common.penChalet.key,
        miniRetailSample,
        "Pen Chalet sample weight is 22.68 g.",
        true,
        "Professional-retailer sample value; official nominal weight remains unavailable.",
      ),
      specEvidence(
        "status",
        "phase593-mini-spec-status",
        common.miniExact.key,
        miniCurrent,
        "Current exact page exposes five colours and ten SPP6801 child SKUs.",
      ),
      specEvidence(
        "status",
        "phase593-mini-rejected-collection-colours",
        common.avatarCollection.key,
        miniCollectionText,
        "Collection prose lists Yellow, Mint, Dust and Peach without exact SPP6801 child SKUs.",
        false,
        "Unresolved separate scope; not added to current exact variants.",
      ),
      specEvidence(
        "status",
        "phase593-mini-rejected-retail-lux",
        common.penChalet.key,
        miniRetailSample,
        "Pen Chalet retail list includes Lux without a current official exact child SKU.",
        false,
        "Retail colour remains outside the canonical current official five-colour scope.",
      ),
    ],
  },
  conflicts: [
    {
      key: "phase593-mini-dimension-conflict",
      fieldKey: "dimensions",
      scopeKey: miniCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Pineider's 120 mm is the canonical nominal length; Pen Chalet's 121.9 mm remains a labelled retail-sample measurement.",
      members: [
        {
          citationKey: "phase593-mini-spec-dimensions-official",
          assertedValue: "Official nominal length 120 mm",
        },
        {
          citationKey: "phase593-mini-rejected-dimensions-retail",
          assertedValue: "Pen Chalet sample capped length 121.9 mm",
        },
      ],
    },
    {
      key: "phase593-mini-colour-scope-conflict",
      fieldKey: "status",
      scopeKey: miniCurrent,
      conflictKind: "identity",
      status: "resolved",
      resolutionNote:
        "The exact SPP6801/941 HTML defines the canonical five-colour ten-SKU scope. Collection prose Yellow/Mint/Dust/Peach and retail Lux stay unresolved until exact official codes exist.",
      members: [
        {
          citationKey: "phase593-mini-spec-status",
          assertedValue:
            "Black 056, Red Onyx 644, Imperial Green 645, Gray Zebrino 646 and Red Blue Solidale 647",
        },
        {
          citationKey: "phase593-mini-rejected-collection-colours",
          assertedValue: "Yellow, Mint, Dust and Peach",
        },
        {
          citationKey: "phase593-mini-rejected-retail-lux",
          assertedValue: "Lux retail sample",
        },
      ],
    },
  ],
  media: [
    {
      key: "phase593-pineider-avatar-ur-mini-primary",
      title:
        "Pineider Avatar UR Mini SPP6801／941 十个 child SKU 与 Mini 边界事实图（非产品照片）",
      sourceKey: miniDiagram.key,
      localPath: miniDiagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、UltraResin 纹理、外形、比例、商标、帽环、笔夹、饰件或磁吸机构。",
      sourceUrl: miniDiagram.url,
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
      throw new Error(`Phase 593 conflicting source definition: ${source.key}.`);
    }
    byKey.set(source.key, source);
  }
  return [...byKey.values()];
}

const brandScope = phase592PineiderBrandPack.scopes[0]?.scopeKey;
if (!brandScope) {
  throw new Error("Phase 593 Pineider brand pack requires a canonical scope.");
}

export const phase593PineiderBrandPack: CuratedEntityPack = {
  ...phase592PineiderBrandPack,
  key: "phase593-pineider-brand-depth-refresh-v1",
  markdownFile: ".planning/content-research/pineider-brand-phase593.md",
  storyTitle:
    "Pineider：十三条公开型号入口与 Avatar Anniversary／UR Mini 边界",
  publicationIntent: "publish",
  publicationBlockers: [],
  sources: mergeSources(phase592PineiderBrandPack.sources, [
    common.anniversaryCollection,
    common.anniversaryExact,
    common.avatarCollection,
    common.miniExact,
    common.anniversaryMagazine,
    common.zegarki,
    common.fulker,
    common.penChalet,
    common.albaMiniExact,
  ]),
  claims: [
    ...phase592PineiderBrandPack.claims,
    {
      key: "phase593-pineider-brand-thirteen-model-navigation",
      predicate: "series_navigation",
      objectText:
        "Pineider now has thirteen public model nodes, adding separate Avatar Anniversary PP7301/1026 and Avatar UR Mini SPP6801/941 pages without transferring specifications among Anniversary, full-size Avatar, UR Mini, Alba Mini or writing-mode siblings.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.avatarCollection.key,
      locator: common.avatarCollection.summary,
      evidence: [
        {
          key: "phase593-pineider-brand-anniversary-evidence",
          sourceKey: common.anniversaryExact.key,
          scopeKey: brandScope,
          locator: common.anniversaryExact.summary,
        },
        {
          key: "phase593-pineider-brand-mini-evidence",
          sourceKey: common.miniExact.key,
          scopeKey: brandScope,
          locator: common.miniExact.summary,
        },
        {
          key: "phase593-pineider-brand-avatar-family-evidence",
          sourceKey: common.avatarCollection.key,
          scopeKey: brandScope,
          locator: common.avatarCollection.summary,
        },
        {
          key: "phase593-pineider-brand-independent-evidence",
          sourceKey: common.penChalet.key,
          scopeKey: brandScope,
          locator: common.penChalet.summary,
        },
      ],
    },
  ],
};

export const phase593PineiderPacks: CuratedEntityPack[] = [
  phase593PineiderBrandPack,
  phase593PineiderAvatarAnniversaryPack,
  phase593PineiderAvatarUrMiniPack,
];

if (
  phase593PineiderPacks.length !== 3 ||
  new Set(phase593PineiderPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 593 must contain one brand and two unique model packs.");
}
