import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE588_PINEIDER_BRAND_ID,
  phase588PineiderBrandPack,
} from "./phase588-pineider-arco-rock";

export const PHASE589_PINEIDER_BRAND_ID = PHASE588_PINEIDER_BRAND_ID;

export const PHASE589_IDS = {
  classic: "phase589-pineider-classic-palladium",
  tempi: "phase589-pineider-tempi-moderni",
} as const;

export const PHASE589_SLUGS = {
  classic: "pineider-classic-palladium-pp5801-779",
  tempi: "pineider-tempi-moderni-pp6001-614",
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

function pineiderOfficial(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  publishedAt?: string;
}): CuratedSource {
  return web({
    ...input,
    registryKey: "pineider-official-phase589",
    registryName: "Pineider 1774",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pineider-official",
    homepageUrl: "https://www.pineider.com/",
    author: "Pineider 1774",
  });
}

function retailer(input: {
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
}): CuratedSource {
  return web({
    ...input,
    sourceType: "retailer",
    tier: "professional_secondary",
  });
}

function editorial(
  key: "classic-palladium" | "tempi-moderni",
  title: string,
): CuratedSource {
  const localPath = `/images/library/site-original/phase589/pineider/pineider-${key}.svg`;
  return {
    key: `phase589-pineider-${key}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase589-${key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase589-${key}`,
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创事实示意图，非产品照片；不复刻品牌标识、真实笔形、颜色、纹理、笔夹、机构剖面或比例。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
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
  return {
    fieldKey,
    key,
    sourceKey,
    scopeKey,
    locator,
    qualifies,
  };
}

const common = {
  collections: pineiderOfficial({
    key: "phase589-pineider-writing-collections",
    title: "Pineider Writing Instruments Collections",
    url: "https://www.pineider.com/en/pens/collections",
    summary:
      "Pineider 当前 collection 导航把 Avatar、Rock、Classic、Tempi Moderni、Forged Carbon、Arco、Millenium、Mistery Fast Filler 与 Alba 分开。",
    locator:
      "current collection navigation with Classic and Tempi Moderni as separate families alongside Avatar, Rock and Arco",
  }),
};

const classic = {
  official: pineiderOfficial({
    key: "phase589-pineider-classic-pp5801-779-official",
    title: "Pineider Classic Fountain Pen",
    url: "https://www.pineider.com/en/products/classic-stilo-medio-green-pall-trims-779",
    summary:
      "当前商品页确认 Classic／Classic Palladium、Model PP5801／779、EF/F/M、144 mm、直径 15.5 mm、Italy、树脂与钢、镀钯细节、磁吸帽和活塞。",
    locator:
      "current PP5801/779 identity; EF/F/M selector; 144 mm; 15.5 mm diameter; Origin Italy; resin and steel; palladium-plated details; magnetic closure; piston filling",
  }),
  collection: pineiderOfficial({
    key: "phase589-pineider-classic-collection",
    title: "Pineider Classic collection",
    url: "https://www.pineider.com/en/pens/collections/classic",
    summary:
      "当前 collection 同时列 Classic Palladium 与 Classic Rose Gold 的钢笔、宝珠笔和圆珠笔，说明饰件与书写模式必须分开确认。",
    locator:
      "current Classic collection cards separating Classic Fountain Pen, Classic Rose Gold Fountain Pen and non-fountain writing modes",
  }),
  fahrneys: retailer({
    key: "phase589-pineider-classic-rose-gold-fahrneys",
    registryKey: "fahrneys-pens-phase589-pineider-classic",
    registryName: "Fahrney's Pens",
    independenceGroup: "fahrneys-pens",
    title: "Pineider Classic Rose Gold Trim Fountain Pen",
    url: "https://www.fahrneyspens.com/Item--i-250410",
    homepageUrl: "https://www.fahrneyspens.com/",
    author: "Fahrney's Pens",
    summary:
      "专业零售档案把 Classic 家族置于 2024 年，Rose Gold 样式使用 Twist Magnetic Lock、玫瑰金色饰件和大型 No.6 semi-flex steel nib；未给 PP5801／779。",
    locator:
      "2024 Classic family retail introduction; Rose Gold trim; Twist Magnetic Lock; large No.6 semi-flex steel nib; no PP5801/779 identity",
  }),
  penSavings: retailer({
    key: "phase589-pineider-classic-rose-gold-pen-savings",
    registryKey: "pen-savings-phase589-pineider-classic",
    registryName: "Pen Savings",
    independenceGroup: "pen-savings",
    title: "Pineider Classic Fountain Pen, Red & Rose Gold",
    url: "https://pensavings.com/products/pineider-classic-fp-red",
    homepageUrl: "https://pensavings.com/",
    author: "Pen Savings",
    summary:
      "零售商品页把 Red & Rose Gold Classic 写为镀玫瑰金不锈钢尖，并随 ink cartridge 与 ink bottle converter；该页未给 PP5801／779。",
    locator:
      "Red and Rose Gold sibling: rose-gold-plated stainless-steel nib; ink cartridge and ink bottle converter; no PP5801/779 model code",
  }),
  diagram: editorial(
    "classic-palladium",
    "Pineider Classic Palladium 当前活塞与 Rose Gold sibling 边界示意",
  ),
};

const tempi = {
  official: pineiderOfficial({
    key: "phase589-pineider-tempi-pp6001-614-official",
    title: "Pineider Tempi Moderni Fountain Pen",
    url: "https://www.pineider.com/en/products/tempi-moderni-fountain-pen-black-trims-614",
    summary:
      "当前商品页确认 Tempi Moderni Fountain Pen、Model PP6001／614、EF/F/M、155 mm、直径 17.3 mm、Italy、UltraResin、镀钯钢尖、磁吸 Lock System 与活塞。",
    locator:
      "current PP6001/614 identity; EF/F/M selector; 155 mm; 17.3 mm diameter; Origin Italy; UltraResin; palladium-plated steel nib; magnetic Lock System; piston filling",
  }),
  collection: pineiderOfficial({
    key: "phase589-pineider-tempi-collection",
    title: "Pineider Tempi Moderni collection",
    url: "https://www.pineider.com/en/pens/collections/tempi-moderni",
    summary:
      "当前 Tempi Moderni collection 把 fountain pen、rollerball 与 ballpoint 分开，重述圆角三角截面、三指定位和双磁体设计。",
    locator:
      "current collection separates fountain pen from rollerball and ballpoint and explains rounded triangular three-finger form and double magnet closure",
  }),
  launch: pineiderOfficial({
    key: "phase589-pineider-tempi-launch-2023",
    title: "Tempi Moderni: the new Pineider pen",
    url: "https://magazine.pineider.com/en/tempi-moderni-the-new-pineider-pen/",
    publishedAt: "2023-06-01",
    summary:
      "2023 年发布稿说明 Dante Del Vecchio 的设计、喷气式飞机圆角三角截面、约 1.32:1 等腰三角比例、三指握持、形态过渡和双磁体闭合。",
    locator:
      "dated 2023-06-01 launch; Dante Del Vecchio; first-jet fuselage inspiration; rounded isosceles triangle ratio 1.32:1; three-finger grip; ogive-to-triangle-to-round transition; double magnet",
  }),
  pensIt: retailer({
    key: "phase589-pineider-tempi-pens-it",
    registryKey: "pens-it-phase589-pineider-tempi",
    registryName: "Pens.it / Giardino Italiano",
    independenceGroup: "pens-it",
    title: "Pineider Tempi Moderni",
    url: "https://www.pens.it/en/products/pineider-tempi-moderni",
    homepageUrl: "https://www.pens.it/",
    author: "Giardino Italiano",
    summary:
      "意大利专业零售档案交叉记录圆角三角截面、EF/F/M 钢尖、活塞，以及 Palladium／Rose Gold 饰件选择。",
    locator:
      "rounded triangular section; steel nib in EF/F/M; piston filling; Palladium and Rose Gold finishes",
  }),
  diagram: editorial(
    "tempi-moderni",
    "Pineider Tempi Moderni 截面过渡与当前规格示意",
  ),
};

const classicCurrent = "phase589-pineider-classic-current-pp5801-779";
const classicRoseGold = "phase589-pineider-classic-rose-gold-sibling";

export const phase589PineiderClassicPack: CuratedEntityPack = {
  key: "phase589-pineider-classic-palladium-v1",
  entityId: PHASE589_IDS.classic,
  expectedType: "pen",
  expectedSlug: PHASE589_SLUGS.classic,
  canonicalName: "Pineider Classic Palladium Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/pineider-classic-palladium-phase589.md",
  storyTitle:
    "Pineider Classic Palladium：PP5801／779 与 Rose Gold sibling 分开",
  primarySourceKey: classic.official.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Pineider Classic Palladium",
      language: "en",
      sourceKey: classic.official.key,
    },
    {
      alias: "Pineider Classic PP5801/779",
      language: "en",
      sourceKey: classic.official.key,
    },
    {
      alias: "Pineider Classic PP5801",
      language: "en",
      sourceKey: classic.official.key,
    },
    {
      alias: "皮内德 Classic Palladium 钢笔",
      language: "zh",
      sourceKey: classic.official.key,
    },
  ],
  sources: [
    classic.official,
    classic.collection,
    classic.fahrneys,
    classic.penSavings,
    common.collections,
    classic.diagram,
  ],
  scopes: [
    {
      key: classicCurrent,
      scopeKey: classicCurrent,
      market: "current global Classic Palladium PP5801/779",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Current selector lists EF/F/M and the product describes resin and steel; no nib number or semi-flex claim is inherited from Rose Gold retail copy.",
      materialScope:
        "Resin and steel with palladium-plated details; Palladium names the current trim/configuration rather than solid palladium construction.",
      editionScope:
        "PP5801/779 is the exact piston anchor; Classic Rose Gold pages without that code remain a sibling scope.",
    },
    {
      key: classicRoseGold,
      scopeKey: classicRoseGold,
      market: "2024 retail Classic Rose Gold sibling",
      validFrom: "2024-01-01",
      productionState: "current",
      nibScope:
        "Retail records describe a rose-gold-plated stainless-steel or large No.6 semi-flex steel nib; not inherited by PP5801/779.",
      materialScope:
        "Coloured resin with Rose Gold trim in the retail records; exact product code not supplied.",
      editionScope:
        "Pen Savings states cartridge/converter, conflicting with the exact Palladium piston's mechanism; retained as a separate sibling configuration.",
    },
  ],
  claims: [
    {
      key: "phase589-pineider-classic-identity",
      predicate: "model_identity",
      objectText:
        "Pineider Classic Palladium Fountain Pen is anchored to current exact product PP5801/779 rather than every Classic or Rose Gold writing instrument.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: classic.official.key,
      locator: classic.official.summary,
      evidence: [
        {
          key: "phase589-pineider-classic-identity-evidence",
          sourceKey: classic.official.key,
          scopeKey: classicCurrent,
          locator: classic.official.summary,
        },
      ],
    },
    {
      key: "phase589-pineider-classic-current-configuration",
      predicate: "current_configuration",
      objectText:
        "Current PP5801/779 is 144 mm by 15.5 mm, made in Italy, described with resin and steel, palladium-plated details, magnetic closure, piston filling and EF/F/M selection.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: classic.official.key,
      locator: classic.official.summary,
      evidence: [
        {
          key: "phase589-pineider-classic-current-configuration-evidence",
          sourceKey: classic.official.key,
          scopeKey: classicCurrent,
          locator: classic.official.summary,
        },
      ],
    },
    {
      key: "phase589-pineider-classic-sibling-boundary",
      predicate: "version_boundary",
      objectText:
        "Retail cartridge/converter wording for a Red and Rose Gold Classic is a sibling configuration and does not qualify PP5801/779's current fill-system field.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: classic.penSavings.key,
      locator: classic.penSavings.summary,
      evidence: [
        {
          key: "phase589-pineider-classic-rose-gold-evidence",
          sourceKey: classic.penSavings.key,
          scopeKey: classicRoseGold,
          locator: classic.penSavings.summary,
        },
        {
          key: "phase589-pineider-classic-palladium-resolution-evidence",
          sourceKey: classic.official.key,
          scopeKey: classicCurrent,
          locator: classic.official.summary,
        },
      ],
    },
  ],
  variants: [
    {
      key: "phase589-pineider-classic-current-product",
      name: "Classic Palladium PP5801 / 779",
      notes:
        "Current exact piston product with magnetic closure, 144 mm by 15.5 mm dimensions and EF/F/M selector.",
      sourceKey: classic.official.key,
      variantKind: "market_sku",
      productCode: "PP5801 / 779",
      market: "global",
    },
    {
      key: "phase589-pineider-classic-rose-gold-sibling",
      name: "Classic Rose Gold retail sibling",
      releaseYear: "2024",
      notes:
        "Retail records show Rose Gold trim and a cartridge/converter configuration without PP5801/779; retained as a sibling rather than a colour-only variant of the piston product.",
      sourceKey: classic.fahrneys.key,
      variantKind: "edition_group",
      market: "United States retail",
    },
  ],
  spec: {
    brandEntityId: PHASE589_PINEIDER_BRAND_ID,
    values: {
      series_name: "Pineider Classic Palladium Fountain Pen PP5801/779",
      release_year:
        "Classic family documented as a 2024 retail introduction; exact PP5801/779 current page verified 2026-08-11",
      origin_country: "Italy for current PP5801/779 product scope",
      nib: "Current EF/F/M selector; product describes resin and steel but publishes no nib number or semi-flex grade",
      fill_system:
        "Current PP5801/779: piston; cartridge/converter retail wording belongs to an un-coded Rose Gold sibling and is rejected for this field",
      material:
        "Resin and steel with palladium-plated details; exact colour remains SKU-specific",
      dimensions:
        "Official current product: 144 mm length and 15.5 mm diameter; measurement convention not stated",
      weight:
        "Current official PP5801/779 page does not publish a weight; no numeric weight asserted",
      status:
        "Current PP5801/779 product verified 2026-08-11; stock, colour and price vary",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase589-classic-spec-brand",
        classic.official.key,
        classicCurrent,
        "official Pineider exact-product identity",
      ),
      specEvidence(
        "series_name",
        "phase589-classic-spec-series",
        classic.official.key,
        classicCurrent,
        "Classic and Classic Palladium naming with PP5801/779",
      ),
      specEvidence(
        "release_year",
        "phase589-classic-spec-release",
        classic.fahrneys.key,
        classicRoseGold,
        "retailer dates the Classic family introduction to 2024; not an exact PP5801/779 release date",
      ),
      specEvidence(
        "origin_country",
        "phase589-classic-spec-origin",
        classic.official.key,
        classicCurrent,
        "current product Origin Italy",
      ),
      specEvidence(
        "nib",
        "phase589-classic-spec-nib-current",
        classic.official.key,
        classicCurrent,
        "current EF/F/M selector and resin/steel material statement; no number or flex grade",
      ),
      specEvidence(
        "nib",
        "phase589-classic-rejected-rose-gold-nib-inheritance",
        classic.fahrneys.key,
        classicRoseGold,
        "Rose Gold retail No.6 semi-flex steel nib is not exact PP5801/779 evidence",
        false,
      ),
      specEvidence(
        "fill_system",
        "phase589-classic-spec-fill-official",
        classic.official.key,
        classicCurrent,
        "current exact PP5801/779 piston filling system",
      ),
      specEvidence(
        "fill_system",
        "phase589-classic-rejected-rose-gold-converter",
        classic.penSavings.key,
        classicRoseGold,
        "un-coded Red and Rose Gold retail sibling includes cartridge and converter",
        false,
      ),
      specEvidence(
        "material",
        "phase589-classic-spec-material",
        classic.official.key,
        classicCurrent,
        "resin and steel with palladium-plated details",
      ),
      specEvidence(
        "dimensions",
        "phase589-classic-spec-dimensions",
        classic.official.key,
        classicCurrent,
        "current 144 mm by 15.5 mm dimensions",
      ),
      specEvidence(
        "weight",
        "phase589-classic-spec-weight-unpublished",
        classic.official.key,
        classicCurrent,
        "current details publish dimensions and origin but no weight; no number asserted",
      ),
      specEvidence(
        "status",
        "phase589-classic-spec-status",
        classic.official.key,
        classicCurrent,
        "current exact product retrieval window",
      ),
    ],
  },
  timeline: [
    {
      key: "phase589-pineider-classic-family-2024",
      title: "Classic family documented in the 2024 retail launch window",
      eventType: "design_milestone",
      startDate: "2024-01-01",
      circa: true,
      description:
        "Fahrney's dates the Classic family to 2024; this is not asserted as the exact PP5801/779 release day.",
      sourceKey: classic.fahrneys.key,
    },
    {
      key: "phase589-pineider-classic-current-verified",
      title: "Current PP5801/779 product verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "The exact current Palladium identity and configuration were verified; retrieval date is not a launch date.",
      sourceKey: classic.official.key,
    },
  ],
  conflicts: [
    {
      key: "phase589-pineider-classic-fill-system-boundary",
      fieldKey: "fill_system",
      scopeKey: classicCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The exact current PP5801/779 page states piston. Pen Savings describes a Red and Rose Gold Classic with cartridge/converter but gives no PP5801/779 code, so it remains a sibling scope and is nonqualifying for the Palladium field.",
      members: [
        {
          citationKey: "phase589-classic-spec-fill-official",
          assertedValue: "current exact PP5801/779: piston filling system",
        },
        {
          citationKey: "phase589-classic-rejected-rose-gold-converter",
          assertedValue:
            "un-coded Red and Rose Gold sibling: cartridge and converter",
        },
      ],
    },
  ],
  media: [
    {
      key: "phase589-pineider-classic-primary",
      title:
        "Pineider Classic Palladium 当前活塞与 Rose Gold sibling 边界图（非产品照片）",
      sourceKey: classic.diagram.key,
      localPath: classic.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、外形、纹理、比例、商标、笔尖、机构或库存。",
      sourceUrl: classic.diagram.url,
      usageStatus: "primary",
    },
  ],
};

const tempiCurrent = "phase589-pineider-tempi-current-pp6001-614";
const tempiLaunch = "phase589-pineider-tempi-launch-2023";

export const phase589PineiderTempiPack: CuratedEntityPack = {
  key: "phase589-pineider-tempi-moderni-v1",
  entityId: PHASE589_IDS.tempi,
  expectedType: "pen",
  expectedSlug: PHASE589_SLUGS.tempi,
  canonicalName: "Pineider Tempi Moderni Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pineider-tempi-moderni-phase589.md",
  storyTitle: "Pineider Tempi Moderni：圆角三角截面与 PP6001／614",
  primarySourceKey: tempi.official.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Pineider Tempi Moderni",
      language: "it",
      sourceKey: tempi.official.key,
    },
    {
      alias: "Pineider Modern Times Fountain Pen",
      language: "en",
      sourceKey: tempi.launch.key,
    },
    {
      alias: "Pineider Tempi Moderni PP6001/614",
      language: "en",
      sourceKey: tempi.official.key,
    },
    {
      alias: "皮内德 Tempi Moderni 钢笔",
      language: "zh",
      sourceKey: tempi.official.key,
    },
  ],
  sources: [
    tempi.official,
    tempi.collection,
    tempi.launch,
    tempi.pensIt,
    common.collections,
    tempi.diagram,
  ],
  scopes: [
    {
      key: tempiCurrent,
      scopeKey: tempiCurrent,
      market: "current global Tempi Moderni PP6001/614",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Current palladium-plated steel nib in EF/F/M, independently cross-checked by Pens.it; no 14K Quill, S or B inherited from other Pineider families.",
      materialScope:
        "Durable UltraResin in the current official product scope; exact colour and trim remain SKU-specific.",
      editionScope:
        "PP6001/614 is the fountain-pen anchor; same-name rollerball, ballpoint and pencil remain separate writing modes.",
    },
    {
      key: tempiLaunch,
      scopeKey: tempiLaunch,
      market: "Pineider 2023 launch narrative",
      validFrom: "2023-06-01",
      productionState: "historical",
      nibScope:
        "Launch article establishes design and writing-mode family but does not supply current nib metal or widths.",
      materialScope:
        "Launch article situates Tempi Moderni among Pineider's modern material research without replacing the current UltraResin product page.",
      editionScope:
        "Dante Del Vecchio, jet-fuselage inspiration, 1.32:1 rounded triangle, three-finger grip and double magnet bind to the 2023 design narrative.",
    },
  ],
  claims: [
    {
      key: "phase589-pineider-tempi-identity",
      predicate: "model_identity",
      objectText:
        "Pineider Tempi Moderni Fountain Pen is anchored to current exact product PP6001/614; Modern Times is an English alias and non-fountain writing modes are separate.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: tempi.official.key,
      locator: tempi.official.summary,
      evidence: [
        {
          key: "phase589-pineider-tempi-identity-evidence",
          sourceKey: tempi.official.key,
          scopeKey: tempiCurrent,
          locator: tempi.official.summary,
        },
        {
          key: "phase589-pineider-tempi-writing-mode-evidence",
          sourceKey: tempi.collection.key,
          scopeKey: tempiCurrent,
          locator: tempi.collection.summary,
        },
      ],
    },
    {
      key: "phase589-pineider-tempi-current-configuration",
      predicate: "current_configuration",
      objectText:
        "Current PP6001/614 is 155 mm by 17.3 mm, made in Italy from UltraResin with a palladium-plated steel EF/F/M nib, magnetic Lock System and piston filling.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: tempi.official.key,
      locator: tempi.official.summary,
      evidence: [
        {
          key: "phase589-pineider-tempi-current-official-evidence",
          sourceKey: tempi.official.key,
          scopeKey: tempiCurrent,
          locator: tempi.official.summary,
        },
        {
          key: "phase589-pineider-tempi-current-retail-evidence",
          sourceKey: tempi.pensIt.key,
          scopeKey: tempiCurrent,
          locator: tempi.pensIt.summary,
        },
      ],
    },
    {
      key: "phase589-pineider-tempi-design",
      predicate: "design_history",
      objectText:
        "The dated 2023 launch attributes Tempi Moderni to Dante Del Vecchio and explains its jet-fuselage-inspired rounded triangular three-finger form and double-magnet closure.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: tempi.launch.key,
      locator: tempi.launch.summary,
      evidence: [
        {
          key: "phase589-pineider-tempi-design-evidence",
          sourceKey: tempi.launch.key,
          scopeKey: tempiLaunch,
          locator: tempi.launch.summary,
        },
      ],
    },
  ],
  variants: [
    {
      key: "phase589-pineider-tempi-current-product",
      name: "Tempi Moderni PP6001 / 614",
      releaseYear: "2023",
      notes:
        "Current fountain-pen anchor with UltraResin, steel EF/F/M nib, piston and magnetic Lock System.",
      sourceKey: tempi.official.key,
      variantKind: "market_sku",
      productCode: "PP6001 / 614",
      market: "global",
    },
    {
      key: "phase589-pineider-tempi-trim-family",
      name: "Palladium and Rose Gold finishes",
      notes:
        "Pens.it lists both finish families; finish alone does not create a second filling-system or nib-material identity.",
      sourceKey: tempi.pensIt.key,
      variantKind: "variant",
      market: "European retail",
    },
  ],
  spec: {
    brandEntityId: PHASE589_PINEIDER_BRAND_ID,
    values: {
      series_name: "Pineider Tempi Moderni Fountain Pen PP6001/614",
      release_year: "2023-06-01 dated Pineider launch article",
      origin_country: "Italy for current PP6001/614 product scope",
      nib: "Palladium-plated steel nib; current EF/F/M selector",
      fill_system: "Internal piston filling mechanism",
      material:
        "Durable UltraResin; exact colour and Palladium/Rose Gold finish remain SKU-specific",
      dimensions:
        "Official current product: 155 mm length and 17.3 mm diameter; measurement convention not stated",
      weight:
        "Current official PP6001/614 page does not publish a weight; no numeric weight asserted",
      status:
        "Current PP6001/614 product verified 2026-08-11; stock, colour and price vary",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase589-tempi-spec-brand",
        tempi.official.key,
        tempiCurrent,
        "official Pineider exact-product identity",
      ),
      specEvidence(
        "series_name",
        "phase589-tempi-spec-series",
        tempi.official.key,
        tempiCurrent,
        "Tempi Moderni Fountain Pen and PP6001/614",
      ),
      specEvidence(
        "release_year",
        "phase589-tempi-spec-release",
        tempi.launch.key,
        tempiLaunch,
        "dated Pineider launch article on 2023-06-01",
      ),
      specEvidence(
        "origin_country",
        "phase589-tempi-spec-origin",
        tempi.official.key,
        tempiCurrent,
        "current product Origin Italy",
      ),
      specEvidence(
        "nib",
        "phase589-tempi-spec-nib-official",
        tempi.official.key,
        tempiCurrent,
        "current palladium-plated steel nib and EF/F/M selector",
      ),
      specEvidence(
        "nib",
        "phase589-tempi-spec-nib-retail",
        tempi.pensIt.key,
        tempiCurrent,
        "independent steel EF/F/M record",
      ),
      specEvidence(
        "fill_system",
        "phase589-tempi-spec-fill-official",
        tempi.official.key,
        tempiCurrent,
        "current piston-filling mechanism",
      ),
      specEvidence(
        "fill_system",
        "phase589-tempi-spec-fill-retail",
        tempi.pensIt.key,
        tempiCurrent,
        "independent piston record",
      ),
      specEvidence(
        "material",
        "phase589-tempi-spec-material",
        tempi.official.key,
        tempiCurrent,
        "current durable UltraResin product",
      ),
      specEvidence(
        "dimensions",
        "phase589-tempi-spec-dimensions",
        tempi.official.key,
        tempiCurrent,
        "current 155 mm by 17.3 mm dimensions",
      ),
      specEvidence(
        "weight",
        "phase589-tempi-spec-weight-unpublished",
        tempi.official.key,
        tempiCurrent,
        "current details publish dimensions and origin but no weight; no number asserted",
      ),
      specEvidence(
        "status",
        "phase589-tempi-spec-status",
        tempi.official.key,
        tempiCurrent,
        "current exact product retrieval window",
      ),
    ],
  },
  timeline: [
    {
      key: "phase589-pineider-tempi-launch-event",
      title: "Pineider introduces Tempi Moderni",
      eventType: "design_milestone",
      startDate: "2023-06-01",
      circa: false,
      description:
        "The dated official article introduces the new design and its rounded triangular three-finger concept.",
      sourceKey: tempi.launch.key,
    },
    {
      key: "phase589-pineider-tempi-current-verified",
      title: "Current PP6001/614 product verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "The exact current product configuration was verified; retrieval date is not a launch date.",
      sourceKey: tempi.official.key,
    },
  ],
  conflicts: [],
  media: [
    {
      key: "phase589-pineider-tempi-primary",
      title: "Pineider Tempi Moderni 当前结构与规格图（非产品照片）",
      sourceKey: tempi.diagram.key,
      localPath: tempi.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、外形、纹理、比例、商标、笔尖、机构或库存。",
      sourceUrl: tempi.diagram.url,
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
      throw new Error(`Phase 589 conflicting source definition: ${source.key}.`);
    }
    byKey.set(source.key, source);
  }
  return [...byKey.values()];
}

const brandScope = phase588PineiderBrandPack.scopes[0]?.scopeKey;
if (!brandScope) {
  throw new Error("Phase 589 Pineider brand pack requires a canonical scope.");
}

export const phase589PineiderBrandPack: CuratedEntityPack = {
  ...phase588PineiderBrandPack,
  key: "phase589-pineider-brand-depth-refresh-v1",
  markdownFile: ".planning/content-research/pineider-brand-phase589.md",
  storyTitle:
    "Pineider：Avatar UR、Arco、Rock、Classic 与 Tempi Moderni 导航",
  publicationIntent: "publish",
  publicationBlockers: [],
  sources: mergeSources(phase588PineiderBrandPack.sources, [
    common.collections,
    classic.official,
    classic.fahrneys,
    classic.penSavings,
    tempi.official,
    tempi.launch,
    tempi.pensIt,
  ]),
  claims: [
    ...phase588PineiderBrandPack.claims,
    {
      key: "phase589-pineider-brand-five-model-navigation",
      predicate: "series_navigation",
      objectText:
        "Pineider Avatar UR, Arco, Rock, Classic Palladium PP5801/779 and Tempi Moderni PP6001/614 are separate model nodes whose nib, fill, material and edition fields must not be inherited across families or same-name writing modes.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.collections.key,
      locator: common.collections.summary,
      evidence: [
        {
          key: "phase589-pineider-brand-five-model-navigation-evidence",
          sourceKey: common.collections.key,
          scopeKey: brandScope,
          locator: common.collections.summary,
        },
        {
          key: "phase589-pineider-brand-classic-navigation-evidence",
          sourceKey: classic.official.key,
          scopeKey: brandScope,
          locator: classic.official.summary,
        },
        {
          key: "phase589-pineider-brand-tempi-navigation-evidence",
          sourceKey: tempi.official.key,
          scopeKey: brandScope,
          locator: tempi.official.summary,
        },
      ],
    },
  ],
};

export const phase589PineiderPacks: CuratedEntityPack[] = [
  phase589PineiderBrandPack,
  phase589PineiderClassicPack,
  phase589PineiderTempiPack,
];

if (
  phase589PineiderPacks.length !== 3 ||
  new Set(phase589PineiderPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 589 must contain one brand and two unique model packs.");
}
