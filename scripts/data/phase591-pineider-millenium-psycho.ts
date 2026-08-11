import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE590_PINEIDER_BRAND_ID,
  phase590PineiderBrandPack,
} from "./phase590-pineider-forged-carbon-mystery-fast-filler";

export const PHASE591_PINEIDER_BRAND_ID = PHASE590_PINEIDER_BRAND_ID;

export const PHASE591_IDS = {
  millenium: "phase591-pineider-millenium",
  psycho: "phase591-pineider-psycho",
} as const;

export const PHASE591_SLUGS = {
  millenium: "pineider-millenium-pp4801-945",
  psycho: "pineider-psycho-pp4301-468",
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
    registryKey: "pineider-official-phase591",
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
  publishedAt?: string;
}): CuratedSource {
  return web({ ...input, sourceType: "retailer", tier: "professional_secondary" });
}

function editorial(
  key: "millenium" | "psycho",
  title: string,
): CuratedSource {
  const localPath = `/images/library/site-original/phase591/pineider/pineider-${key}.svg`;
  return {
    key: `phase591-pineider-${key}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase591-${key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase591-${key}`,
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创事实示意图，非产品照片；不复刻品牌标识、真实笔形、颜色、纹理、笔夹、机构剖面、编号或比例。",
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
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

const common = {
  collections: official({
    key: "phase591-pineider-writing-collections",
    title: "Pineider Writing Instruments Collections",
    url: "https://www.pineider.com/us/pens/collections",
    summary:
      "Pineider 当前 writing-instrument collection 将 Millenium 与 Psycho 作为分开的 fountain-pen 商品入口，也保留既有 Pineider 型号路线。",
    locator:
      "current collection cards include separate Millenium Fountain Pen and Psycho Fountain Pen entries alongside the prior Pineider lines",
  }),
  magazine: official({
    key: "phase591-pineider-collectors-jewel-pens-2024",
    title: "Collector's Jewel Pens by Pineider",
    url: "https://magazine.pineider.com/en/collectors-jewel-pens-by-pineider/",
    publishedAt: "2024-05-22",
    summary:
      "Pineider 的 2024 收藏笔文章把双 n Millennium、Psycho 与 Matrix 置于 Masterpiece Collection，并为 Psycho 记录 cartridge converter、14kt gold nib 及 Palladium／Yellow Gold／Rose Gold。",
    locator:
      "dated 22 May 2024; Masterpiece Collection names Millennium, Psycho and Matrix; Psycho paragraph states limited-edition cartridge converter, 14kt gold nib and Palladium/Yellow Gold/Rose Gold",
  }),
};

const millenium = {
  official: official({
    key: "phase591-pineider-millenium-pp4801-945-official",
    title: "Millenium Fountain Pen",
    url: "https://www.pineider.com/us/products/millenium-fountain-pen-250-years-of-pineider-945",
    summary:
      "当前商品页确认单 n Millenium、PP4801／945、五个 PP4801G20 child SKU、250 周年、88 支、Italy、aluminum／black PVD、14K hyperflex、marine-steel clip、Twist Magnetic Lock 与 Piston Filler。",
    locator:
      "H1 Millenium Fountain Pen; Model PP4801/945; variant HTML maps PP4801_F/M/S/B/E to SSPFX/SSPMX/SSPSX/SSPBX/SSPEXPP4801G20; Origin Italy; description states 250th anniversary, 88, aluminum, black PVD, 14 kt hyperflex, marine steel clip, Twist Magnetic Lock and Piston Filler",
  }),
  penSavings: retailer({
    key: "phase591-pineider-millenium-pen-savings",
    registryKey: "pen-savings-phase591-pineider-millenium",
    registryName: "Pen Savings",
    independenceGroup: "pen-savings",
    title: "Pineider Millenium Limited Edition Fountain Pen, Stealth Black",
    url: "https://pensavings.com/collections/all-limited-edition/products/millenium-fp",
    homepageUrl: "https://pensavings.com/",
    author: "Pen Savings",
    summary:
      "专业零售页使用单 n Millenium，并交叉记录 88、aluminum／black PVD、14 kt hyperflex、marine-steel clip、Twist Magnetic Lock 与 piston。",
    locator:
      "product title and body; Millenium spelling; 88 pieces; aluminum and black PVD; 14 kt hyperflex; marine steel clip; Twist Magnetic Lock; Piston Filler",
  }),
  chatterley: retailer({
    key: "phase591-pineider-millenium-chatterley",
    registryKey: "chatterley-phase591-pineider-millenium",
    registryName: "Chatterley Luxuries",
    independenceGroup: "chatterley-luxuries",
    title: "Pineider Millennium PVD Limited Edition Fountain Pen",
    url: "https://chatterleyluxuries.com/product/pineider-millenium-pvd-limited-edition-fountain-pen/",
    homepageUrl: "https://chatterleyluxuries.com/",
    author: "Chatterley Luxuries",
    publishedAt: "2025-06-01",
    summary:
      "Chatterley 档案标题用双 n Millennium、SKU 为 PP4801，正文用单 n 并重复 250 周年与 88 支语境。",
    locator:
      "archive title uses Millennium; SKU PP4801; description uses Millenium and states 250th anniversary and limited 88",
  }),
  truphae: retailer({
    key: "phase591-pineider-arman-black-aluminum-truphae",
    registryKey: "truphae-phase591-pineider-arman",
    registryName: "Truphae",
    independenceGroup: "truphae",
    title: "Pineider Arman Black Aluminum Limited Edition Fountain Pen",
    url: "https://www.truphaeinc.com/products/pineider-arman-black-aluminum-limited-edition-fountain-pen",
    homepageUrl: "https://www.truphaeinc.com/",
    author: "Truphae",
    summary:
      "零售页把 PP4801G20-EF／F／M／B／S 标成 Arman Black Aluminum；该同码异名只作 historical／ambiguous conflict evidence。",
    locator:
      "product title Arman Black Aluminum; variant JSON maps PP4801G20-EF/F/M/B/S to nib selections; retained as ambiguous same-code evidence and not a Millenium alias",
  }),
  italianPens: retailer({
    key: "phase591-pineider-arman-black-pvd-italianpens",
    registryKey: "italianpens-phase591-pineider-arman",
    registryName: "ItalianPens",
    independenceGroup: "italianpens",
    title: "Pineider Arman Black PVD LE Fountain Pen",
    url: "https://www.italianpens.com/product/2451/pineider/index.php",
    homepageUrl: "https://www.italianpens.com/",
    author: "ItalianPens",
    summary:
      "零售档案把 PP4801G20-M 写为 Arman Black PVD，并叙述 Arman／Trilogy／Doppler 的开孔与重复切割；不授权 current Millenium 的名称或结构。",
    locator:
      "SKU PP4801G20-M; product title Arman Black PVD LE; description discusses Arman, Trilogy, Doppler and aperture motifs; rejected for current Millenium identity and construction",
  }),
  penChaletArman: retailer({
    key: "phase591-pineider-arman-trilogy-pen-chalet",
    registryKey: "pen-chalet-phase591-pineider-arman",
    registryName: "Pen Chalet",
    independenceGroup: "pen-chalet",
    title: "Pineider Arman Trilogy Fountain Pen",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/pineider_armen_trilogy_fountain_pens.html",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    summary:
      "Arman Trilogy 档案给出开孔结构、156.8 mm、68.32 g 与 88；这些属于具名 Arman 零售样本，不回填 Millenium。",
    locator:
      "Arman Trilogy description and product specifications; triple cutouts; capped 156.8 mm; weight 68.32 g; limited 88; nonqualifying for Millenium current fields",
  }),
  diagram: editorial(
    "millenium",
    "Pineider Millenium PP4801／945 身份与同码冲突事实图",
  ),
};

const psycho = {
  official: official({
    key: "phase591-pineider-psycho-pp4301-468-official",
    title: "Psycho Fountain Pen",
    url: "https://www.pineider.com/us/products/psycho-fountain-pen-palladium-468",
    summary:
      "当前 Palladium 商品页确认 PP4301／468、ARGENTO、五个 PP4301099 child SKU、140 mm、Ø18.5 mm、Italy、925 silver、nanofusion、三种 plating 与 limited status。",
    locator:
      "H1 Psycho Fountain Pen; Model PP4301/468; ARGENTO; variant HTML maps PP4301_S/M/F/B/E to SSPSX/SSPMX/SSPFX/SSPBX/SSPEXPP4301099; Details 140 MM and diameter 18.5 MM, Origin Italy; description states nanofusion, 925 silver, palladium/gold/rose-gold plating and limited edition",
  }),
  chatterleyPalladium: retailer({
    key: "phase591-pineider-psycho-pp4301-099-chatterley",
    registryKey: "chatterley-phase591-pineider-psycho-palladium",
    registryName: "Chatterley Luxuries",
    independenceGroup: "chatterley-luxuries",
    title: "Pineider Psycho Palladium Limited Edition Fountain Pen",
    url: "https://chatterleyluxuries.com/product/closeout-pineider-psycho-palladium-limited-edition-fountain-pen/",
    homepageUrl: "https://chatterleyluxuries.com/",
    author: "Chatterley Luxuries",
    publishedAt: "2025-06-01",
    summary:
      "PP4301-099 档案正文写每种颜色各 88 支 fountain pen 或 roller、925 silver、三种 plating、14 kt 585 hyperflex 与 converter；同页属性栏却写 Piston Filler。",
    locator:
      "SKU PP4301-099; body states 88 fountain pens or rollers per color, sterling silver 925, palladium/gold/rose-gold plating, 14 kt 585 hyperflex and converter; Additional information states Piston Filler, retained as rejected internal contradiction",
  }),
  appelboomRose: retailer({
    key: "phase591-pineider-psycho-rose-gold-appelboom",
    registryKey: "appelboom-phase591-pineider-psycho",
    registryName: "Appelboom",
    independenceGroup: "appelboom",
    title: "Pineider Psycho RGT Fountain Pen",
    url: "https://appelboom.com/pineider-psycho-rgt-fountain-pen/",
    homepageUrl: "https://appelboom.com/",
    author: "Appelboom",
    summary:
      "Rose Gold 档案记录 925 silver＋rose-gold plating、14kt Hyperflex、cartridge／converter、EF/F/M/B/S 与每种颜色 88 支。",
    locator:
      "product body and Features; sterling 925 silver; rose gold plating; 14kt soft gold Hyperflex; cartridge/converter; Extra Fine/Fine/Medium/Broad/Stub; limited 88 pens for each colour",
  }),
  chatterleyUsed: retailer({
    key: "phase591-pineider-psycho-used-chatterley",
    registryKey: "chatterley-phase591-pineider-psycho-used",
    registryName: "Chatterley Luxuries",
    independenceGroup: "chatterley-luxuries",
    title: "Pineider Psycho Limited Edition Fountain Pen",
    url: "https://chatterleyluxuries.com/product/pineider-psycho-limited-edition-fountain-pen/",
    homepageUrl: "https://chatterleyluxuries.com/",
    author: "Chatterley Luxuries",
    summary:
      "二手档案正文写 14k Fine Quill 与 cartridge convertor，结构化属性再次写 Piston Filler；无 PP4301-099 exact code，只作 metadata 冲突旁证。",
    locator:
      "used-listing body says 14k Fine Quill and cartridge convertor included; Additional information says Piston Filler; no exact PP4301-099 anchor",
  }),
  diagram: editorial(
    "psycho",
    "Pineider Psycho PP4301／468 饰面与上墨冲突事实图",
  ),
};

const milleniumCurrent = "phase591-pineider-millenium-current-pp4801-945";
const milleniumArman = "phase591-pineider-millenium-arman-same-code-archive";
const milleniumMainVariant = "phase591-pineider-millenium-current-product";

export const phase591PineiderMilleniumPack: CuratedEntityPack = {
  key: "phase591-pineider-millenium-v1",
  entityId: PHASE591_IDS.millenium,
  expectedType: "pen",
  expectedSlug: PHASE591_SLUGS.millenium,
  canonicalName: "Pineider Millenium Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pineider-millenium-phase591.md",
  storyTitle: "Pineider Millenium：PP4801／945、五个 child SKU 与 Arman 同码边界",
  primarySourceKey: millenium.official.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Pineider Millennium Fountain Pen",
      language: "en",
      sourceKey: common.magazine.key,
    },
    {
      alias: "Pineider Millenium PP4801/945",
      language: "en",
      sourceKey: millenium.official.key,
    },
    {
      alias: "Pineider PP4801",
      language: "en",
      sourceKey: millenium.official.key,
    },
    {
      alias: "皮内德 Millenium 250 周年钢笔",
      language: "zh",
      sourceKey: millenium.official.key,
    },
  ],
  sources: [
    millenium.official,
    common.collections,
    common.magazine,
    millenium.penSavings,
    millenium.chatterley,
    millenium.truphae,
    millenium.italianPens,
    millenium.penChaletArman,
    millenium.diagram,
  ],
  scopes: [
    {
      key: milleniumCurrent,
      scopeKey: milleniumCurrent,
      market: "current global PP4801/945 and official PP4801G20 child SKUs",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Official current child SKUs bind F/M/S/B/EF to a 14K hyperflex gold nib in this exact product scope.",
      materialScope:
        "Current official PP4801/945 is aluminum with black PVD and a marine-steel clip.",
      editionScope:
        "Pineider's 250th-anniversary Millenium fountain pen is limited to 88 pieces.",
    },
    {
      key: milleniumArman,
      scopeKey: milleniumArman,
      variantKey: "phase591-pineider-arman-same-code-retail-records",
      market: "historical or ambiguous retail records using PP4801G20 for Arman",
      productionState: "historical",
      nibScope:
        "Retail PP4801G20-EF/F/M/B/S records use Arman naming; they do not rename the current official Millenium product.",
      materialScope:
        "Arman Black Aluminum/PVD, apertures and Trilogy/Doppler descriptions stay in the ambiguous archive scope.",
      editionScope:
        "Arman dimensions, 68.32 g sample weight and other edition narratives do not qualify current Millenium fields.",
    },
  ],
  claims: [
    {
      key: "phase591-pineider-millenium-identity",
      predicate: "model_identity",
      objectText:
        "The current canonical identity is Pineider Millenium Fountain Pen PP4801/945 with the official single-n spelling; Millennium is a sourced spelling alias, not a second model.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: millenium.official.key,
      locator: millenium.official.summary,
      evidence: [
        {
          key: "phase591-millenium-identity-current-evidence",
          sourceKey: millenium.official.key,
          scopeKey: milleniumCurrent,
          locator: millenium.official.summary,
        },
        {
          key: "phase591-millenium-identity-spelling-evidence",
          sourceKey: common.magazine.key,
          scopeKey: milleniumCurrent,
          locator: common.magazine.summary,
        },
      ],
    },
    {
      key: "phase591-pineider-millenium-current-configuration",
      predicate: "current_configuration",
      objectText:
        "Current PP4801/945 is an Italian 88-piece 250th-anniversary aluminum and black-PVD piston filler with a 14K hyperflex F/M/S/B/EF nib, marine-steel clip and Twist Magnetic Lock.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: millenium.official.key,
      locator: millenium.official.summary,
      evidence: [
        {
          key: "phase591-millenium-current-official-evidence",
          sourceKey: millenium.official.key,
          scopeKey: milleniumCurrent,
          locator: millenium.official.summary,
        },
        {
          key: "phase591-millenium-current-retail-evidence",
          sourceKey: millenium.penSavings.key,
          scopeKey: milleniumCurrent,
          locator: millenium.penSavings.summary,
        },
      ],
    },
    {
      key: "phase591-pineider-millenium-arman-boundary",
      predicate: "identity_conflict_resolution",
      objectText:
        "Arman Black Aluminum, Arman Black PVD and Arman Trilogy records using PP4801G20 are retained as ambiguous same-code evidence; without official rename continuity they do not become aliases or authorize Millenium dimensions, weight or aperture construction.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: millenium.truphae.key,
      locator: millenium.truphae.summary,
      evidence: [
        {
          key: "phase591-millenium-arman-truphae-evidence",
          sourceKey: millenium.truphae.key,
          scopeKey: milleniumArman,
          locator: millenium.truphae.summary,
        },
        {
          key: "phase591-millenium-arman-italianpens-evidence",
          sourceKey: millenium.italianPens.key,
          scopeKey: milleniumArman,
          locator: millenium.italianPens.summary,
        },
      ],
    },
  ],
  variants: [
    {
      key: milleniumMainVariant,
      name: "Millenium Fountain Pen PP4801 / 945",
      notes:
        "Exact current product anchor; the 250th-anniversary context does not supply an explicit launch date.",
      sourceKey: millenium.official.key,
      variantKind: "edition_group",
      productCode: "PP4801 / 945",
      market: "global",
    },
    ...[
      ["f", "Fine", "SSPFXPP4801G20"],
      ["m", "Medium", "SSPMXPP4801G20"],
      ["s", "Stub", "SSPSXPP4801G20"],
      ["b", "Broad", "SSPBXPP4801G20"],
      ["ef", "Extra Fine", "SSPEXPP4801G20"],
    ].map(([suffix, width, productCode]) => ({
      key: `phase591-pineider-millenium-${suffix}-child-sku`,
      name: `Millenium ${width} child SKU`,
      notes: `Official current ${width} selector under PP4801/945 and NERO; 14K hyperflex applies in this exact scope.`,
      sourceKey: millenium.official.key,
      variantKind: "nib" as const,
      parentVariantKey: milleniumMainVariant,
      productCode,
      market: "global current",
    })),
    {
      key: "phase591-pineider-arman-same-code-retail-records",
      name: "Arman PP4801G20 same-code retail records",
      notes:
        "Historical or ambiguous Arman Black Aluminum/PVD/Trilogy naming; retained for conflict resolution and not a Millenium alias.",
      sourceKey: millenium.truphae.key,
      variantKind: "edition_group",
      productCode: "PP4801G20-EF/F/M/B/S",
      market: "archived United States and European retail",
    },
  ],
  spec: {
    brandEntityId: PHASE591_PINEIDER_BRAND_ID,
    values: {
      series_name:
        "Pineider Millenium Fountain Pen PP4801/945; Millennium retained as a sourced spelling alias",
      origin_country: "Italy for current PP4801/945",
      nib: "14K hyperflex gold nib; current F/M/S/B/EF child SKUs",
      fill_system: "Piston Filler with Twist Magnetic Lock cap closure",
      material: "Aluminum with black PVD and a marine-steel clip",
      dimensions:
        "Current official PP4801/945 page publishes no dimensions; no Arman measurement is imported",
      weight:
        "Current official PP4801/945 page publishes no weight; Arman retail sample weight is rejected",
      status:
        "250th-anniversary limited edition of 88 pieces; current page verified 2026-08-11",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase591-millenium-spec-brand",
        millenium.official.key,
        milleniumCurrent,
        "official exact-product identity",
      ),
      specEvidence(
        "series_name",
        "phase591-millenium-spec-series-current",
        millenium.official.key,
        milleniumCurrent,
        "H1 Millenium Fountain Pen and Model PP4801/945",
      ),
      specEvidence(
        "series_name",
        "phase591-millenium-spec-series-double-n-alias",
        common.magazine.key,
        milleniumCurrent,
        "dated official article uses Millennium in the Masterpiece Collection",
      ),
      specEvidence(
        "series_name",
        "phase591-millenium-rejected-arman-name-truphae",
        millenium.truphae.key,
        milleniumArman,
        "PP4801G20-EF/F/M/B/S listed as Arman Black Aluminum without official rename continuity",
        false,
      ),
      specEvidence(
        "series_name",
        "phase591-millenium-rejected-arman-name-italianpens",
        millenium.italianPens.key,
        milleniumArman,
        "PP4801G20-M listed as Arman Black PVD with Trilogy/Doppler construction language",
        false,
      ),
      specEvidence(
        "origin_country",
        "phase591-millenium-spec-origin",
        millenium.official.key,
        milleniumCurrent,
        "DETAILS states Origin Italy",
      ),
      specEvidence(
        "nib",
        "phase591-millenium-spec-nib",
        millenium.official.key,
        milleniumCurrent,
        "14 kt hyperflex and official F/M/S/B/EF child-SKU mapping",
      ),
      specEvidence(
        "fill_system",
        "phase591-millenium-spec-fill",
        millenium.official.key,
        milleniumCurrent,
        "Piston Filler and Twist Magnetic Lock",
      ),
      specEvidence(
        "material",
        "phase591-millenium-spec-material",
        millenium.official.key,
        milleniumCurrent,
        "aluminum, black PVD and marine-steel clip",
      ),
      specEvidence(
        "material",
        "phase591-millenium-rejected-arman-construction",
        millenium.italianPens.key,
        milleniumArman,
        "Arman apertures and Trilogy/Doppler motifs do not qualify current Millenium construction",
        false,
      ),
      specEvidence(
        "dimensions",
        "phase591-millenium-spec-dimensions-unpublished",
        millenium.official.key,
        milleniumCurrent,
        "current official page publishes no dimensions; no number asserted",
      ),
      specEvidence(
        "dimensions",
        "phase591-millenium-rejected-arman-dimensions",
        millenium.penChaletArman.key,
        milleniumArman,
        "156.8 mm belongs to a named Arman Trilogy retail sample",
        false,
      ),
      specEvidence(
        "weight",
        "phase591-millenium-spec-weight-unpublished",
        millenium.official.key,
        milleniumCurrent,
        "current official page publishes no weight; no number asserted",
      ),
      specEvidence(
        "weight",
        "phase591-millenium-rejected-arman-weight",
        millenium.penChaletArman.key,
        milleniumArman,
        "68.32 g belongs to a named Arman Trilogy retail sample",
        false,
      ),
      specEvidence(
        "status",
        "phase591-millenium-spec-edition-88",
        millenium.official.key,
        milleniumCurrent,
        "official 250th-anniversary limited edition of 88 pieces",
      ),
      specEvidence(
        "status",
        "phase591-millenium-spec-edition-88-independent",
        millenium.penSavings.key,
        milleniumCurrent,
        "independent professional retail page also states 88 pieces",
      ),
    ],
  },
  timeline: [
    {
      key: "phase591-pineider-millenium-2024-article",
      title: "Millennium spelling documented in Pineider's collector article",
      eventType: "design_milestone",
      startDate: "2024-05-22",
      circa: false,
      description:
        "The dated article records the double-n spelling in the Masterpiece Collection; it is documentation evidence, not an inferred launch date.",
      sourceKey: common.magazine.key,
    },
    {
      key: "phase591-pineider-millenium-current-verified",
      title: "Current Millenium PP4801/945 product verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description: "Retrieval date marks current-page verification, not a launch date.",
      sourceKey: millenium.official.key,
    },
  ],
  conflicts: [
    {
      key: "phase591-pineider-millenium-spelling-conflict",
      fieldKey: "series_name",
      scopeKey: milleniumCurrent,
      conflictKind: "identity",
      status: "resolved",
      resolutionNote:
        "The exact PP4801/945 page supplies canonical Millenium. Pineider's dated Millennium spelling remains a searchable alias and does not create another entity.",
      members: [
        {
          citationKey: "phase591-millenium-spec-series-current",
          assertedValue: "Millenium Fountain Pen",
        },
        {
          citationKey: "phase591-millenium-spec-series-double-n-alias",
          assertedValue: "Millennium in the 2024 Masterpiece Collection article",
        },
      ],
    },
    {
      key: "phase591-pineider-millenium-arman-same-code-conflict",
      fieldKey: "model_identity",
      scopeKey: milleniumCurrent,
      conflictKind: "identity",
      status: "resolved",
      resolutionNote:
        "Current official PP4801/945 and collection pages determine Millenium. Arman same-code retail records remain historical or ambiguous because no official rename/continuity record was found; their names, apertures, dimensions and weight are nonqualifying.",
      members: [
        {
          citationKey: "phase591-millenium-spec-series-current",
          assertedValue: "current official Millenium PP4801/945",
        },
        {
          citationKey: "phase591-millenium-rejected-arman-name-truphae",
          assertedValue: "Arman Black Aluminum PP4801G20-EF/F/M/B/S",
        },
        {
          citationKey: "phase591-millenium-rejected-arman-name-italianpens",
          assertedValue: "Arman Black PVD PP4801G20-M",
        },
      ],
    },
  ],
  media: [
    {
      key: "phase591-pineider-millenium-primary",
      title: "Pineider Millenium PP4801／945 身份与同码冲突事实图（非产品照片）",
      sourceKey: millenium.diagram.key,
      localPath: millenium.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、外形、纹理、比例、商标、笔尖、笔夹、编号或机构。",
      sourceUrl: millenium.diagram.url,
      usageStatus: "primary",
    },
  ],
};

const psychoCurrent = "phase591-pineider-psycho-current-palladium-pp4301-468";
const psychoFamily = "phase591-pineider-psycho-masterpiece-family";
const psychoYellow = "phase591-pineider-psycho-yellow-gold-trim";
const psychoRose = "phase591-pineider-psycho-rose-gold-trim";
const psychoMetadataConflict = "phase591-pineider-psycho-retailer-metadata-conflict";
const psychoMainVariant = "phase591-pineider-psycho-current-palladium-product";

export const phase591PineiderPsychoPack: CuratedEntityPack = {
  key: "phase591-pineider-psycho-v1",
  entityId: PHASE591_IDS.psycho,
  expectedType: "pen",
  expectedSlug: PHASE591_SLUGS.psycho,
  canonicalName: "Pineider Psycho Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pineider-psycho-phase591.md",
  storyTitle: "Pineider Psycho：PP4301／468、三种饰面与 converter／piston 冲突",
  primarySourceKey: psycho.official.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Pineider Psycho PP4301/468",
      language: "en",
      sourceKey: psycho.official.key,
    },
    {
      alias: "Pineider Psycho Palladium",
      language: "en",
      sourceKey: psycho.official.key,
      market: "current Palladium",
    },
    {
      alias: "Pineider PP4301",
      language: "en",
      sourceKey: psycho.official.key,
    },
    {
      alias: "皮内德 Psycho 925 银钢笔",
      language: "zh",
      sourceKey: psycho.official.key,
    },
  ],
  sources: [
    psycho.official,
    common.collections,
    common.magazine,
    psycho.chatterleyPalladium,
    psycho.appelboomRose,
    psycho.chatterleyUsed,
    psycho.diagram,
  ],
  scopes: [
    {
      key: psychoCurrent,
      scopeKey: psychoCurrent,
      market: "current Palladium PP4301/468 and PP4301-099 child-SKU scope",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Official current selector supplies F/M/S/B/EF; 14K hyperflex is supported at family plus exact professional-secondary level, not stated on the exact official page.",
      materialScope:
        "925 silver with Palladium/ARGENTO scope; current official page also names sibling gold and rose-gold plating without child SKUs.",
      editionScope:
        "Official page says limited edition; exact retailer text states 88 fountain pens or rollers per color.",
    },
    {
      key: psychoFamily,
      scopeKey: psychoFamily,
      market: "Psycho Masterpiece fountain-pen family",
      validFrom: "2024-05-22",
      productionState: "current",
      nibScope:
        "Pineider's family article states a 14kt gold fountain-pen nib; exact professional pages describe Hyperflex.",
      materialScope:
        "Family trim names are Palladium, Yellow Gold and Rose Gold; plating stays with each trim.",
      editionScope:
        "Professional exact/trim records support 88 for each trim/color and each writing mode, not 88 for the whole family.",
    },
    {
      key: psychoYellow,
      scopeKey: psychoYellow,
      variantKey: "phase591-pineider-psycho-yellow-gold-variant",
      market: "Yellow Gold trim",
      productionState: "current",
      nibScope: "Family-level 14kt evidence; no complete Yellow Gold child SKU read back.",
      materialScope: "Yellow-gold plating only; PP4301-099 is not assigned to this trim.",
      editionScope:
        "88 applies per trim/color and writing mode in professional scope; no family-total count asserted.",
    },
    {
      key: psychoRose,
      scopeKey: psychoRose,
      variantKey: "phase591-pineider-psycho-rose-gold-variant",
      market: "Rose Gold trim documented by Appelboom",
      productionState: "current",
      nibScope: "Appelboom records 14kt Hyperflex with EF/F/M/B/S.",
      materialScope:
        "925 silver with rose-gold plating; no complete Rose Gold child SKU read back.",
      editionScope:
        "Appelboom states 88 pens for each colour; scope remains per trim/color and writing mode.",
    },
    {
      key: psychoMetadataConflict,
      scopeKey: psychoMetadataConflict,
      market: "Chatterley structured Additional information",
      productionState: "unknown",
      nibScope: "No separate nib scope; this scope exists to retain the filling contradiction.",
      editionScope:
        "Piston Filler appears in metadata while the same page body says converter; metadata is nonqualifying.",
    },
  ],
  claims: [
    {
      key: "phase591-pineider-psycho-identity",
      predicate: "model_identity",
      objectText:
        "Pineider Psycho Fountain Pen PP4301/468 is one canonical model family; Palladium, Yellow Gold and Rose Gold are trim variants rather than separate model entities.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: psycho.official.key,
      locator: psycho.official.summary,
      evidence: [
        {
          key: "phase591-psycho-identity-current-evidence",
          sourceKey: psycho.official.key,
          scopeKey: psychoCurrent,
          locator: psycho.official.summary,
        },
        {
          key: "phase591-psycho-identity-family-evidence",
          sourceKey: common.magazine.key,
          scopeKey: psychoFamily,
          locator: common.magazine.summary,
        },
      ],
    },
    {
      key: "phase591-pineider-psycho-current-configuration",
      predicate: "current_configuration",
      objectText:
        "Current Palladium PP4301/468 is 140 mm by 18.5 mm, made in Italy from 925 silver using nanofusion, with ARGENTO and F/M/S/B/EF PP4301099 child SKUs and official limited status.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: psycho.official.key,
      locator: psycho.official.summary,
      evidence: [
        {
          key: "phase591-psycho-current-official-evidence",
          sourceKey: psycho.official.key,
          scopeKey: psychoCurrent,
          locator: psycho.official.summary,
        },
        {
          key: "phase591-psycho-current-palladium-retail-evidence",
          sourceKey: psycho.chatterleyPalladium.key,
          scopeKey: psychoCurrent,
          locator: psycho.chatterleyPalladium.summary,
        },
      ],
    },
    {
      key: "phase591-pineider-psycho-family-configuration",
      predicate: "family_configuration",
      objectText:
        "The Masterpiece-family and exact professional records support 14K Hyperflex and cartridge/converter; the 88-piece statement is scoped to each trim/color and each writing mode rather than the whole Psycho family.",
      factClass: "core",
      confidence: 0.98,
      sourceKey: common.magazine.key,
      locator: common.magazine.summary,
      evidence: [
        {
          key: "phase591-psycho-family-official-evidence",
          sourceKey: common.magazine.key,
          scopeKey: psychoFamily,
          locator: common.magazine.summary,
        },
        {
          key: "phase591-psycho-family-chatterley-evidence",
          sourceKey: psycho.chatterleyPalladium.key,
          scopeKey: psychoCurrent,
          locator: psycho.chatterleyPalladium.summary,
        },
        {
          key: "phase591-psycho-family-appelboom-evidence",
          sourceKey: psycho.appelboomRose.key,
          scopeKey: psychoRose,
          locator: psycho.appelboomRose.summary,
        },
      ],
    },
    {
      key: "phase591-pineider-psycho-filling-resolution",
      predicate: "filling_conflict_resolution",
      objectText:
        "Cartridge/converter is supported by Pineider's family article, Chatterley's PP4301-099 body and Appelboom; Chatterley's contradictory Piston Filler metadata is retained as rejected evidence and does not create a piston variant.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.magazine.key,
      locator: common.magazine.summary,
      evidence: [
        {
          key: "phase591-psycho-fill-official-evidence",
          sourceKey: common.magazine.key,
          scopeKey: psychoFamily,
          locator: common.magazine.summary,
        },
        {
          key: "phase591-psycho-fill-retailer-conflict-evidence",
          sourceKey: psycho.chatterleyPalladium.key,
          scopeKey: psychoMetadataConflict,
          locator: psycho.chatterleyPalladium.summary,
        },
      ],
    },
  ],
  variants: [
    {
      key: psychoMainVariant,
      name: "Psycho Palladium PP4301 / 468",
      notes:
        "Current exact product anchor; PP4301-099 and ARGENTO stay in the Palladium scope.",
      sourceKey: psycho.official.key,
      variantKind: "edition_group",
      productCode: "PP4301 / 468; PP4301-099",
      market: "global current Palladium",
    },
    ...[
      ["s", "Stub", "SSPSXPP4301099"],
      ["m", "Medium", "SSPMXPP4301099"],
      ["f", "Fine", "SSPFXPP4301099"],
      ["b", "Broad", "SSPBXPP4301099"],
      ["ef", "Extra Fine", "SSPEXPP4301099"],
    ].map(([suffix, width, productCode]) => ({
      key: `phase591-pineider-psycho-${suffix}-palladium-child-sku`,
      name: `Psycho Palladium ${width} child SKU`,
      notes: `Official current ${width} selector under PP4301/468 and ARGENTO; this code is not assigned to Yellow Gold or Rose Gold.`,
      sourceKey: psycho.official.key,
      variantKind: "nib" as const,
      parentVariantKey: psychoMainVariant,
      productCode,
      market: "global current Palladium",
    })),
    {
      key: "phase591-pineider-psycho-yellow-gold-variant",
      name: "Psycho Yellow Gold trim",
      notes:
        "Official family trim; no complete child SKU was read back, so PP4301-099 is not reused.",
      sourceKey: common.magazine.key,
      variantKind: "variant",
      market: "Masterpiece family",
    },
    {
      key: "phase591-pineider-psycho-rose-gold-variant",
      name: "Psycho Rose Gold trim",
      notes:
        "Appelboom documents 925 silver, rose-gold plating, 14K Hyperflex and cartridge/converter; no complete child SKU was read back.",
      sourceKey: psycho.appelboomRose.key,
      variantKind: "variant",
      market: "professional retail",
    },
  ],
  spec: {
    brandEntityId: PHASE591_PINEIDER_BRAND_ID,
    values: {
      series_name:
        "Pineider Psycho Fountain Pen PP4301/468; Palladium, Yellow Gold and Rose Gold are trim variants",
      origin_country: "Italy for current PP4301/468",
      nib: "Current F/M/S/B/EF selector; 14K gold Hyperflex supported by official family and exact professional evidence",
      fill_system:
        "Cartridge/converter supported by Pineider family, PP4301-099 body text and Rose Gold retail evidence; retailer Piston metadata rejected",
      material:
        "925 silver; current Palladium/ARGENTO scope with Yellow Gold and Rose Gold plating retained as separate trims",
      dimensions:
        "Official current PP4301/468: 140 mm length and 18.5 mm diameter; measurement convention not stated",
      weight:
        "Current official PP4301/468 page publishes no product weight; no shipping weight is asserted",
      status:
        "Official limited edition; professional exact/trim records support 88 per trim/color and per writing mode, not family-total 88",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase591-psycho-spec-brand",
        psycho.official.key,
        psychoCurrent,
        "official exact-product identity",
      ),
      specEvidence(
        "series_name",
        "phase591-psycho-spec-series",
        psycho.official.key,
        psychoCurrent,
        "H1 Psycho Fountain Pen and Model PP4301/468",
      ),
      specEvidence(
        "origin_country",
        "phase591-psycho-spec-origin",
        psycho.official.key,
        psychoCurrent,
        "DETAILS states Origin Italy",
      ),
      specEvidence(
        "nib",
        "phase591-psycho-spec-nib-widths",
        psycho.official.key,
        psychoCurrent,
        "official F/M/S/B/EF selectors and full PP4301099 child-SKU mapping",
      ),
      specEvidence(
        "nib",
        "phase591-psycho-spec-nib-14k-family",
        common.magazine.key,
        psychoFamily,
        "official Masterpiece-family article states a 14kt gold fountain-pen nib",
      ),
      specEvidence(
        "nib",
        "phase591-psycho-spec-nib-14k-palladium",
        psycho.chatterleyPalladium.key,
        psychoCurrent,
        "PP4301-099 body states 14 kt 585 hyperflex",
      ),
      specEvidence(
        "fill_system",
        "phase591-psycho-spec-fill-official-family",
        common.magazine.key,
        psychoFamily,
        "official Psycho paragraph states cartridge converter",
      ),
      specEvidence(
        "fill_system",
        "phase591-psycho-spec-fill-palladium-body",
        psycho.chatterleyPalladium.key,
        psychoCurrent,
        "PP4301-099 description states converter",
      ),
      specEvidence(
        "fill_system",
        "phase591-psycho-spec-fill-rose-appelboom",
        psycho.appelboomRose.key,
        psychoRose,
        "Rose Gold body and Features state cartridge/converter",
      ),
      specEvidence(
        "fill_system",
        "phase591-psycho-rejected-piston-metadata",
        psycho.chatterleyPalladium.key,
        psychoMetadataConflict,
        "Additional information says Piston Filler while the same page body says converter",
        false,
      ),
      specEvidence(
        "material",
        "phase591-psycho-spec-material-palladium",
        psycho.official.key,
        psychoCurrent,
        "925 silver, ARGENTO/Palladium and nanofusion in the current exact page",
      ),
      specEvidence(
        "material",
        "phase591-psycho-spec-material-yellow-gold",
        common.magazine.key,
        psychoYellow,
        "Yellow Gold is an official Psycho trim; no child SKU asserted",
      ),
      specEvidence(
        "material",
        "phase591-psycho-spec-material-rose-gold",
        psycho.appelboomRose.key,
        psychoRose,
        "925 silver with rose-gold plating in the trim-specific retail record",
      ),
      specEvidence(
        "dimensions",
        "phase591-psycho-spec-dimensions",
        psycho.official.key,
        psychoCurrent,
        "DETAILS states 140 MM and diameter 18.5 MM",
      ),
      specEvidence(
        "weight",
        "phase591-psycho-spec-weight-unpublished",
        psycho.official.key,
        psychoCurrent,
        "current official page publishes no product weight; no number asserted",
      ),
      specEvidence(
        "status",
        "phase591-psycho-spec-status-official-limited",
        psycho.official.key,
        psychoCurrent,
        "current exact page says limited edition without a count",
      ),
      specEvidence(
        "status",
        "phase591-psycho-spec-edition-per-color-mode",
        psycho.chatterleyPalladium.key,
        psychoCurrent,
        "PP4301-099 body states 88 fountain pens or rollers per color",
      ),
      specEvidence(
        "status",
        "phase591-psycho-spec-edition-rose-per-color",
        psycho.appelboomRose.key,
        psychoRose,
        "Rose Gold record states 88 pens for each colour",
      ),
    ],
  },
  timeline: [
    {
      key: "phase591-pineider-psycho-2024-family-article",
      title: "Psycho Masterpiece family configuration documented",
      eventType: "design_milestone",
      startDate: "2024-05-22",
      circa: false,
      description:
        "Pineider's dated article records the three trims, 14kt nib and cartridge-converter family configuration.",
      sourceKey: common.magazine.key,
    },
    {
      key: "phase591-pineider-psycho-current-verified",
      title: "Current Palladium PP4301/468 product verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description: "Retrieval date marks current-page verification, not a launch date.",
      sourceKey: psycho.official.key,
    },
  ],
  conflicts: [
    {
      key: "phase591-pineider-psycho-trim-sku-conflict",
      fieldKey: "trim_scope",
      scopeKey: psychoCurrent,
      conflictKind: "identity",
      status: "resolved",
      resolutionNote:
        "Palladium, Yellow Gold and Rose Gold remain trim variants of one Psycho entity. PP4301-099 and PP4301099 child SKUs are bound only to the directly read Palladium scope; no Gold or Rose Gold suffix is invented.",
      members: [
        {
          citationKey: "phase591-psycho-spec-material-palladium",
          assertedValue: "Palladium/ARGENTO current PP4301/468 and PP4301-099 scope",
        },
        {
          citationKey: "phase591-psycho-spec-material-yellow-gold",
          assertedValue: "Yellow Gold family trim without a read-back child SKU",
        },
        {
          citationKey: "phase591-psycho-spec-material-rose-gold",
          assertedValue: "Rose Gold trim-specific record without a read-back child SKU",
        },
      ],
    },
    {
      key: "phase591-pineider-psycho-filling-conflict",
      fieldKey: "fill_system",
      scopeKey: psychoCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Pineider's family article, Chatterley's PP4301-099 body and Appelboom agree on cartridge/converter. Chatterley's contradictory Piston Filler metadata is retained but rejected and does not create a piston field or variant.",
      members: [
        {
          citationKey: "phase591-psycho-spec-fill-official-family",
          assertedValue: "official family cartridge converter",
        },
        {
          citationKey: "phase591-psycho-spec-fill-palladium-body",
          assertedValue: "PP4301-099 body says converter",
        },
        {
          citationKey: "phase591-psycho-spec-fill-rose-appelboom",
          assertedValue: "Rose Gold body and features say cartridge/converter",
        },
        {
          citationKey: "phase591-psycho-rejected-piston-metadata",
          assertedValue: "Chatterley Additional information says Piston Filler",
        },
      ],
    },
    {
      key: "phase591-pineider-psycho-edition-scope-conflict",
      fieldKey: "edition_count",
      scopeKey: psychoFamily,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The count is 88 for each trim/color and each writing mode. It is not rewritten as 88 total for all Psycho fountain pens and rollerballs.",
      members: [
        {
          citationKey: "phase591-psycho-spec-status-official-limited",
          assertedValue: "official exact page says limited edition without count",
        },
        {
          citationKey: "phase591-psycho-spec-edition-per-color-mode",
          assertedValue: "88 fountain pens or rollers per color",
        },
        {
          citationKey: "phase591-psycho-spec-edition-rose-per-color",
          assertedValue: "88 pens for each colour",
        },
      ],
    },
  ],
  media: [
    {
      key: "phase591-pineider-psycho-primary",
      title: "Pineider Psycho PP4301／468 饰面与上墨冲突事实图（非产品照片）",
      sourceKey: psycho.diagram.key,
      localPath: psycho.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、外形、nanofusion 纹理、比例、商标、笔尖、笔夹、编号或机构。",
      sourceUrl: psycho.diagram.url,
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
      throw new Error(`Phase 591 conflicting source definition: ${source.key}.`);
    }
    byKey.set(source.key, source);
  }
  return [...byKey.values()];
}

const brandScope = phase590PineiderBrandPack.scopes[0]?.scopeKey;
if (!brandScope) {
  throw new Error("Phase 591 Pineider brand pack requires a canonical scope.");
}

export const phase591PineiderBrandPack: CuratedEntityPack = {
  ...phase590PineiderBrandPack,
  key: "phase591-pineider-brand-depth-refresh-v1",
  markdownFile: ".planning/content-research/pineider-brand-phase591.md",
  storyTitle: "Pineider：九个公开型号入口与不可跨型号继承的规格边界",
  publicationIntent: "publish",
  publicationBlockers: [],
  sources: mergeSources(phase590PineiderBrandPack.sources, [
    common.collections,
    common.magazine,
    millenium.official,
    millenium.penSavings,
    millenium.chatterley,
    millenium.truphae,
    millenium.italianPens,
    millenium.penChaletArman,
    psycho.official,
    psycho.chatterleyPalladium,
    psycho.appelboomRose,
    psycho.chatterleyUsed,
  ]),
  claims: [
    ...phase590PineiderBrandPack.claims,
    {
      key: "phase591-pineider-brand-nine-model-navigation",
      predicate: "series_navigation",
      objectText:
        "Pineider Avatar UR, Arco, Rock, Classic Palladium, Tempi Moderni, Grande Bellezza Forged Carbon, Mystery Fast Filler, Millenium and Psycho are nine separate public model nodes; specifications and variants remain scoped to exact identities.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.collections.key,
      locator: common.collections.summary,
      evidence: [
        {
          key: "phase591-pineider-brand-nine-model-navigation-evidence",
          sourceKey: common.collections.key,
          scopeKey: brandScope,
          locator: common.collections.summary,
        },
        {
          key: "phase591-pineider-brand-millenium-navigation-evidence",
          sourceKey: millenium.official.key,
          scopeKey: brandScope,
          locator: millenium.official.summary,
        },
        {
          key: "phase591-pineider-brand-psycho-navigation-evidence",
          sourceKey: psycho.official.key,
          scopeKey: brandScope,
          locator: psycho.official.summary,
        },
      ],
    },
  ],
};

export const phase591PineiderPacks: CuratedEntityPack[] = [
  phase591PineiderBrandPack,
  phase591PineiderMilleniumPack,
  phase591PineiderPsychoPack,
];

if (
  phase591PineiderPacks.length !== 3 ||
  new Set(phase591PineiderPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 591 must contain one brand and two unique model packs.");
}
