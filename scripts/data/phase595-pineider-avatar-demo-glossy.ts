import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE594_PINEIDER_BRAND_ID,
  phase594PineiderBrandPack,
} from "./phase594-pineider-avatar-ur-egosphere";

export const PHASE595_PINEIDER_BRAND_ID = PHASE594_PINEIDER_BRAND_ID;

export const PHASE595_IDS = {
  demoMetal: "phase595-pineider-avatar-ur-demo-metal",
  glossy: "phase595-pineider-avatar-ur-glossy",
} as const;

export const PHASE595_SLUGS = {
  demoMetal: "pineider-avatar-ur-demo-metal-608-611",
  glossy: "pineider-avatar-ur-glossy-pp4001-602",
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
    registryKey: "pineider-official-phase595",
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
  sourceType?: "blog" | "retailer";
}): CuratedSource {
  return web({
    ...input,
    sourceType: input.sourceType ?? "blog",
    tier: "professional_secondary",
  });
}

function editorial(
  key: "demo-metal" | "glossy",
  title: string,
): CuratedSource {
  const localPath = `/images/library/site-original/phase595/pineider/pineider-avatar-ur-${key}.svg`;
  return {
    key: `phase595-pineider-avatar-ur-${key}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase595-avatar-ur-${key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase595-avatar-ur-${key}`,
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创事实示意图，非产品照片；不复刻品牌标志、商品照片、真实笔形、颜色、透明度、纹理、笔夹、笔尖、机构剖面或比例。",
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
  note?: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies, note };
}

const common = {
  collection: official({
    key: "phase595-pineider-avatar-ur-collection",
    title: "Writing Instruments: Avatar UR Collection",
    url: "https://www.us.pineider.com/us/writing-instruments/collections/avatar-ur",
    summary:
      "Pineider 当前 Avatar UR collection 把标准款、Demo Metal、Demo Metal Black 与 Glossy 分成独立 fountain-pen 商品入口，并提供 UltraResin 与家族设计语境。",
    locator:
      "current collection grid lists Avatar UR Fountain Pen, Avatar UR Demo Metal Fountain Pen, Avatar UR Demo Metal Black Fountain Pen and Avatar UR Glossy Fountain Pen as separate entries; collection prose describes UltraResin and family design",
  }),
  care: official({
    key: "phase595-pineider-fountain-pen-cleaning-guide",
    title: "How to clean your fountain pen: Pineider tips",
    url: "https://magazine.pineider.com/en/how-to-clean-your-fountain-pen-pineider-tips/",
    publishedAt: "2023-05-15",
    summary:
      "Pineider 清洁指南建议移除 cartridge／converter，以水和软布清洁并彻底干燥；树脂表面避免酒精或刺激性化学品。",
    locator:
      "dated 15 May 2023; remove cartridge or converter; rinse cartridge pen; soft cloth for resin; avoid alcohol or harsh chemicals; dry completely",
  }),
};

const demo = {
  pp3401: official({
    key: "phase595-pineider-avatar-demo-pp3401-608-official",
    title: "Avatar UR Demo Metal Fountain Pen",
    url: "https://www.pineider.com/us/products/avatar-ur-demo-fountain-pen-608",
    summary:
      "当前 exact page 确认 PP3401／608、148 mm、Ø14.2 mm、Italy、transparent UltraResin、可视机构与 ink indicator、镀钯不锈钢尖、Magnetic Lock、cartridge／converter；四个颜色菜单中八个组合进入 pricing matrix。",
    locator:
      "H1 and Model PP3401/608; DETAILS 148 MM, diameter 14.2 MM and Italy; description states transparent UltraResin, visible mechanism, ink indicator, palladium-plated stainless-steel tip, Magnetic Lock and cartridge/converter; selector HTML has four colours and eight priced combinations",
  }),
  pp3901: official({
    key: "phase595-pineider-avatar-demo-black-pp3901-611-official",
    title: "Avatar UR Demo Metal Black Fountain Pen",
    url: "https://www.pineider.com/us/products/avatar-ur-demo-black-fountain-pen-611",
    summary:
      "当前 exact page 确认 PP3901／611 与 PP3401 相同的尺寸、产地、透明结构、墨量观察、磁吸帽和墨囊／上墨器，但使用黑色不锈钢尖；八个颜色菜单中二十三个组合进入 pricing matrix。",
    locator:
      "H1 and Model PP3901/611; DETAILS 148 MM, diameter 14.2 MM and Italy; description states transparent UltraResin, visible mechanism, ink indicator, black stainless-steel nib, Magnetic Lock and cartridge/converter; selector HTML has eight colours and 23 priced combinations",
  }),
  penAddict: secondary({
    key: "phase595-pen-addict-avatar-demo-amber",
    registryKey: "pen-addict-phase595-avatar-demo",
    registryName: "The Pen Addict",
    independenceGroup: "the-pen-addict",
    title: "Pineider Avatar UR Demo Fountain Pen in Amber: A Review",
    url: "https://www.penaddict.com/blog/2020/11/13/pineider-avatar-ur-demo-fountain-pen-in-amber-a-review",
    homepageUrl: "https://www.penaddict.com/",
    author: "The Pen Addict",
    publishedAt: "2020-11-13",
    summary:
      "2020 Amber 样笔文章记录约 147／133／164 mm、30／17.8 g、旧 rubberized section，以及该支 F 尖的尖脚不齐和 hard start；全部只属具名样笔。",
    locator:
      "reviewed Amber sample; 147 mm capped, 133 mm uncapped, 164 mm posted; 30 g capped and 17.8 g uncapped; rubberized section; sample Fine nib misalignment and hard starts",
  }),
  bertram: secondary({
    key: "phase595-bertrams-avatar-black-demo",
    registryKey: "bertrams-inkwell-phase595-avatar-demo",
    registryName: "Bertram's Inkwell",
    independenceGroup: "bertrams-inkwell",
    title: "Pineider Avatar UR Black Demo Pens",
    url: "https://bertramsinkwell.com/blogs/bertrams-inkwell-blog-talk-about-writing/pineider-avatar-ur-black-demo-pens",
    homepageUrl: "https://bertramsinkwell.com/",
    author: "Bertram's Inkwell",
    publishedAt: "2022-02-01",
    summary:
      "零售商文章记录 Black Demo 的黑色钢尖、EF／F／M、international cartridge／converter、磁吸帽与墨量观察，并把使用感限定在文章所见产品。",
    locator:
      "dated 1 February 2022; retailer article describes black trim, black steel EF/F/M nib, international cartridge or converter, magnetic cap and ink-level gauge",
    sourceType: "retailer",
  }),
  inky: secondary({
    key: "phase595-inky-inspirations-avatar-black-edition",
    registryKey: "inky-inspirations-phase595-avatar-demo",
    registryName: "Inky Inspirations",
    independenceGroup: "inky-inspirations",
    title: "Pineider Avatar UR Black Edition",
    url: "https://www.inkyinspirations.com/inkreviews/pineider-avatar-ur-black-edition",
    homepageUrl: "https://www.inkyinspirations.com/",
    author: "Inky Inspirations",
    publishedAt: "2021-06-11",
    summary:
      "2021 Wine Red Black Edition 评测由 Pen Chalet 提供样笔，只用于黑色饰件版与具体样笔的使用旁证，不证明当前八色矩阵。",
    locator:
      "Wine Red Black Edition review sample supplied by Pen Chalet; sample and review context only; not used to populate the current selector matrix",
  }),
  diagram: editorial(
    "demo-metal",
    "Pineider Avatar UR Demo Metal PP3401／608 与 PP3901／611 身份事实图",
  ),
};

const glossy = {
  official: official({
    key: "phase595-pineider-avatar-glossy-pp4001-602-official",
    title: "Avatar UR Glossy Fountain Pen",
    url: "https://www.pineider.com/us/products/avatar-ur-glossy-fountain-pen-602",
    summary:
      "当前 exact page 确认 PP4001／602、148 mm、Ø14.2 mm、Italy、UltraResin、镀钯不锈钢尖、Magnetic Lock 与 cartridge／converter；颜色菜单为 Lapis Blue／Nero，只有五个组合进入 pricing matrix，正文却仍写 all-black look。",
    locator:
      "H1 and Model PP4001/602; DETAILS 148 MM, diameter 14.2 MM and Italy; description states all-black look, UltraResin, palladium-plated stainless-steel nib, Magnetic Lock and cartridge/converter; current selector lists Lapis Blue and Nero with five priced combinations",
  }),
  hamilton: secondary({
    key: "phase595-hamilton-avatar-glossy-black",
    registryKey: "hamilton-pens-phase595-avatar-glossy",
    registryName: "The Hamilton Pen Company",
    independenceGroup: "hamilton-pen-company",
    title: "Pineider Avatar Fountain Pen - Black Glossy Black",
    url: "https://www.hamiltonpens.com/products/pineider-avatar-fountain-pen-black-glossy-black",
    homepageUrl: "https://www.hamiltonpens.com/",
    author: "The Hamilton Pen Company",
    summary:
      "专业零售页以 PIN-PP4001056 锚定 Black Glossy Black，并写 black-plated No.6 steel nib 与 cartridge／converter；其笔尖镀层只作 Nero trim 冲突证据。",
    locator:
      "retailer product code PIN-PP4001056; Black Glossy Black; black-plated No.6 steel nib; converter and international standard cartridges",
    sourceType: "retailer",
  }),
  corsani: secondary({
    key: "phase595-corsani-avatar-glossy-black-trims",
    registryKey: "stilograph-corsani-phase595-avatar-glossy",
    registryName: "Stilograph Corsani",
    independenceGroup: "stilograph-corsani",
    title: "Avatar Ur Glossy Black Trims",
    url: "https://www.stilographcorsani.com/prodotto/avatar-ur-glossy-black-trims/?lang=en",
    homepageUrl: "https://www.stilographcorsani.com/",
    author: "Stilograph Corsani",
    summary:
      "专业零售页记录 Glossy Black Trims 的 black PVD、UltraResin、磁吸帽与 cartridge／converter；没有用来替官网当前五个完整 SKU 命名。",
    locator:
      "retailer body describes black PVD finishes, Ultraresin, magnetic fountain-pen cap and converter or cartridge filling; selector lacks the exact current five-code matrix",
    sourceType: "retailer",
  }),
  diagram: editorial(
    "glossy",
    "Pineider Avatar UR Glossy PP4001／602 选择器与文案冲突事实图",
  ),
};

const demoCurrent = "phase595-pineider-avatar-demo-current-family";
const demo608 = "phase595-pineider-avatar-demo-pp3401-608";
const demo611 = "phase595-pineider-avatar-demo-pp3901-611";
const demoUnpriced = "phase595-pineider-avatar-demo-unpriced-codes";
const demoSample = "phase595-pineider-avatar-demo-2020-amber-sample";
const demo608Edition = "phase595-pineider-avatar-demo-pp3401-edition";
const demo611Edition = "phase595-pineider-avatar-demo-pp3901-black-edition";

const DEMO_608_PRICED = [
  ["438-ef", "Clear 438 Extra Fine", "SFAE0PP3401438"],
  ["438-f", "Clear 438 Fine", "SFAF0PP3401438"],
  ["438-m", "Clear 438 Medium", "SFAM0PP3401438"],
  ["378-ef", "Wine Red 378 Extra Fine", "SFAE0PP3401378"],
  ["378-f", "Wine Red 378 Fine", "SFAF0PP3401378"],
  ["439-f", "Amber 439 Fine", "SFAF0PP3401439"],
  ["440-ef", "Sky Blue 440 Extra Fine", "SFAE0PP3401440"],
  ["440-m", "Sky Blue 440 Medium", "SFAM0PP3401440"],
] as const;

const DEMO_611_PRICED = [
  ["378-ef", "Wine Red 378 Extra Fine", "SFAE0PP3901378"],
  ["378-f", "Wine Red 378 Fine", "SFAF0PP3901378"],
  ["615-ef", "Fumé 615 Extra Fine", "SFAE0PP3901615"],
  ["615-f", "Fumé 615 Fine", "SFAF0PP3901615"],
  ["615-m", "Fumé 615 Medium", "SFAM0PP3901615"],
  ["604-ef", "Ice Blue 604 Extra Fine", "SFAE0PP3901604"],
  ["604-f", "Ice Blue 604 Fine", "SFAF0PP3901604"],
  ["604-m", "Ice Blue 604 Medium", "SFAM0PP3901604"],
  ["605-ef", "Mint 605 Extra Fine", "SFAE0PP3901605"],
  ["605-f", "Mint 605 Fine", "SFAF0PP3901605"],
  ["605-m", "Mint 605 Medium", "SFAM0PP3901605"],
  ["612-ef", "Lemon 612 Extra Fine", "SFAE0PP3901612"],
  ["612-f", "Lemon 612 Fine", "SFAF0PP3901612"],
  ["612-m", "Lemon 612 Medium", "SFAM0PP3901612"],
  ["439-ef", "Amber 439 Extra Fine", "SFAE0PP3901439"],
  ["439-f", "Amber 439 Fine", "SFAF0PP3901439"],
  ["439-m", "Amber 439 Medium", "SFAM0PP3901439"],
  ["440-ef", "Sky Blue 440 Extra Fine", "SFAE0PP3901440"],
  ["440-f", "Sky Blue 440 Fine", "SFAF0PP3901440"],
  ["440-m", "Sky Blue 440 Medium", "SFAM0PP3901440"],
  ["438-ef", "Clear 438 Extra Fine", "SFAE0PP3901438"],
  ["438-f", "Clear 438 Fine", "SFAF0PP3901438"],
  ["438-m", "Clear 438 Medium", "SFAM0PP3901438"],
] as const;

export const PHASE595_DEMO_PRICED_SKUS = [
  ...DEMO_608_PRICED.map(([, , code]) => code),
  ...DEMO_611_PRICED.map(([, , code]) => code),
] as const;

export const PHASE595_DEMO_UNPRICED_CODES = [
  "SFAM0PP3401378",
  "SFAE0PP3401439",
  "SFAM0PP3401439",
  "SFAF0PP3401440",
  "SFAM0PP3901378",
] as const;

export const phase595PineiderAvatarDemoMetalPack: CuratedEntityPack = {
  key: "phase595-pineider-avatar-demo-metal-v1",
  entityId: PHASE595_IDS.demoMetal,
  expectedType: "pen",
  expectedSlug: PHASE595_SLUGS.demoMetal,
  canonicalName: "Pineider Avatar UR Demo Metal Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/pineider-avatar-ur-demo-metal-phase595.md",
  storyTitle:
    "Pineider Avatar UR Demo Metal：PP3401／608、PP3901／611 与 31 个当前 SKU",
  primarySourceKey: demo.pp3401.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Pineider Avatar UR Demo Metal",
      language: "en",
      sourceKey: demo.pp3401.key,
    },
    {
      alias: "Pineider Avatar UR Demo Metal PP3401/608",
      language: "en",
      sourceKey: demo.pp3401.key,
    },
    {
      alias: "Pineider Avatar UR Demo Metal Black",
      language: "en",
      sourceKey: demo.pp3901.key,
      market: "Black edition PP3901/611",
    },
    {
      alias: "Pineider Avatar UR Demo Metal Black PP3901/611",
      language: "en",
      sourceKey: demo.pp3901.key,
      market: "Black edition PP3901/611",
    },
    {
      alias: "皮内德 Avatar UR 透明示范钢笔",
      language: "zh",
      sourceKey: demo.pp3401.key,
    },
  ],
  sources: [
    demo.pp3401,
    demo.pp3901,
    common.collection,
    common.care,
    demo.penAddict,
    demo.bertram,
    demo.inky,
    demo.diagram,
  ],
  scopes: [
    {
      key: demoCurrent,
      scopeKey: demoCurrent,
      market: "current Avatar UR Demo Metal fountain-pen family",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "PP3401 has a palladium-plated stainless-steel nib and PP3901 a black stainless-steel nib; the current size selector uses EF/F/M but not every colour-width pair is priced.",
      materialScope:
        "Both exact pages state transparent UltraResin, visible mechanism and ink indicator; the trim/nib finish stays edition-scoped.",
      editionScope:
        "One canonical model with PP3401/608 and PP3901/611 edition groups; no stock guarantee is inferred from page accessibility.",
    },
    {
      key: demo608,
      scopeKey: demo608,
      variantKey: demo608Edition,
      market: "current PP3401/608 standard-metal edition",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Palladium-plated stainless steel; eight pricing-backed EF/F/M combinations across four visible colours.",
      materialScope:
        "Transparent UltraResin with standard metal appointments; no exact trim alloy is inferred.",
      editionScope:
        "Only the eight combinations in the current pricing matrix qualify as market SKUs.",
    },
    {
      key: demo611,
      scopeKey: demo611,
      variantKey: demo611Edition,
      market: "current PP3901/611 Black edition",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Black stainless steel; 23 pricing-backed EF/F/M combinations across eight visible colours.",
      materialScope:
        "Transparent UltraResin with black appointments; no coating chemistry is inferred.",
      editionScope:
        "Only the 23 combinations in the current pricing matrix qualify as market SKUs.",
    },
    {
      key: demoUnpriced,
      scopeKey: demoUnpriced,
      market: "complete codes present in page data but absent from current pricing matrices",
      validFrom: RETRIEVED,
      productionState: "unknown",
      nibScope:
        "Five colour-width codes exist in variant data but are not currently priced; availability and lifecycle remain unknown.",
      editionScope:
        "Unpriced code presence does not create a current market SKU or prove stock.",
    },
    {
      key: demoSample,
      scopeKey: demoSample,
      market: "The Pen Addict 2020 Amber review sample",
      validFrom: "2020-11-13",
      productionState: "historical",
      nibScope:
        "One Fine sample had misaligned tines and hard starts; no family defect rate is inferred.",
      materialScope:
        "The reviewed sample used a rubberized section; it does not overwrite the current exact pages.",
      editionScope:
        "Sample dimensions and weights remain sample-scoped and non-canonical.",
    },
  ],
  claims: [
    {
      key: "phase595-pineider-avatar-demo-identity",
      predicate: "model_identity",
      objectText:
        "Pineider Avatar UR Demo Metal is one canonical transparent fountain-pen model with PP3401/608 standard-metal and PP3901/611 Black edition scopes, not two duplicate models and not PP2101/600.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: demo.pp3401.key,
      locator: demo.pp3401.summary,
      evidence: [
        {
          key: "phase595-demo-identity-608-evidence",
          sourceKey: demo.pp3401.key,
          scopeKey: demo608,
          locator: demo.pp3401.summary,
        },
        {
          key: "phase595-demo-identity-611-evidence",
          sourceKey: demo.pp3901.key,
          scopeKey: demo611,
          locator: demo.pp3901.summary,
        },
        {
          key: "phase595-demo-family-navigation-evidence",
          sourceKey: common.collection.key,
          scopeKey: demoCurrent,
          locator: common.collection.summary,
        },
      ],
    },
    {
      key: "phase595-pineider-avatar-demo-current-configuration",
      predicate: "current_configuration",
      objectText:
        "Both current exact editions are 148 mm by 14.2 mm, made in Italy from transparent UltraResin with visible mechanism, ink indicator, Magnetic Lock and cartridge/converter; nib finish remains edition-specific.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: demo.pp3401.key,
      locator: demo.pp3401.summary,
      evidence: [
        {
          key: "phase595-demo-current-608-evidence",
          sourceKey: demo.pp3401.key,
          scopeKey: demo608,
          locator: demo.pp3401.summary,
        },
        {
          key: "phase595-demo-current-611-evidence",
          sourceKey: demo.pp3901.key,
          scopeKey: demo611,
          locator: demo.pp3901.summary,
        },
      ],
    },
    {
      key: "phase595-pineider-avatar-demo-pricing-boundary",
      predicate: "variant_availability_boundary",
      objectText:
        "The 2026-08-11 pricing matrices support 8 PP3401 and 23 PP3901 market SKUs; five other complete codes are retained as unpriced evidence and do not become current variants.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: demo.pp3401.key,
      locator: `${demo.pp3401.summary} ${demo.pp3901.summary}`,
      evidence: [
        {
          key: "phase595-demo-pricing-608-evidence",
          sourceKey: demo.pp3401.key,
          scopeKey: demo608,
          locator: "eight entries in the current sylius-variants-pricing block",
        },
        {
          key: "phase595-demo-pricing-611-evidence",
          sourceKey: demo.pp3901.key,
          scopeKey: demo611,
          locator: "23 entries in the current sylius-variants-pricing block",
        },
        {
          key: "phase595-demo-unpriced-evidence",
          sourceKey: demo.pp3401.key,
          scopeKey: demoUnpriced,
          locator:
            "five complete variant codes exist outside current pricing matrices; no availability state inferred",
        },
      ],
    },
    {
      key: "phase595-pineider-avatar-demo-sample-boundary",
      predicate: "review_sample_boundary",
      objectText:
        "The Pen Addict's 2020 Amber measurements, rubberized section and one Fine-nib hard-start report remain review-sample evidence and do not overwrite the current two exact pages.",
      factClass: "core",
      confidence: 0.98,
      sourceKey: demo.penAddict.key,
      locator: demo.penAddict.summary,
      evidence: [
        {
          key: "phase595-demo-sample-evidence",
          sourceKey: demo.penAddict.key,
          scopeKey: demoSample,
          locator: demo.penAddict.summary,
        },
      ],
    },
  ],
  variants: [
    {
      key: demo608Edition,
      name: "Avatar UR Demo Metal PP3401 / 608",
      notes:
        "Current standard-metal exact product anchor; palladium-plated steel nib and eight pricing-backed child SKUs.",
      sourceKey: demo.pp3401.key,
      variantKind: "edition_group",
      productCode: "PP3401 / 608",
      market: "global current",
    },
    ...DEMO_608_PRICED.map(([suffix, name, productCode]) => ({
      key: `phase595-pineider-avatar-demo-608-${suffix}-sku`,
      name: `PP3401 ${name}`,
      notes:
        "Complete code appears in the current PP3401/608 pricing matrix; no stock duration is inferred.",
      sourceKey: demo.pp3401.key,
      variantKind: "market_sku" as const,
      parentVariantKey: demo608Edition,
      productCode,
      market: "current PP3401/608 selector",
    })),
    {
      key: demo611Edition,
      name: "Avatar UR Demo Metal Black PP3901 / 611",
      notes:
        "Current Black exact product anchor; black steel nib and 23 pricing-backed child SKUs.",
      sourceKey: demo.pp3901.key,
      variantKind: "edition_group",
      productCode: "PP3901 / 611",
      market: "global current Black edition",
    },
    ...DEMO_611_PRICED.map(([suffix, name, productCode]) => ({
      key: `phase595-pineider-avatar-demo-611-${suffix}-sku`,
      name: `PP3901 Black ${name}`,
      notes:
        "Complete code appears in the current PP3901/611 pricing matrix; no stock duration is inferred.",
      sourceKey: demo.pp3901.key,
      variantKind: "market_sku" as const,
      parentVariantKey: demo611Edition,
      productCode,
      market: "current PP3901/611 selector",
    })),
  ],
  spec: {
    brandEntityId: PHASE595_PINEIDER_BRAND_ID,
    values: {
      series_name:
        "Pineider Avatar UR Demo Metal; PP3401/608 standard-metal and PP3901/611 Black are edition groups",
      origin_country: "Italy for both current exact pages",
      nib:
        "Stainless steel; PP3401 palladium-plated, PP3901 black; EF/F/M selectors with 31 currently priced colour-width combinations",
      fill_system: "Cartridge/converter with Magnetic Lock cap closure",
      material:
        "Transparent UltraResin with visible mechanism and ink indicator; trim finish remains edition-scoped",
      dimensions:
        "Both official exact pages state 148 mm length and 14.2 mm diameter; measurement state is not specified",
      weight:
        "Current exact pages publish no product weight; 2020 review sample weights are not canonical",
      status:
        "Current exact pages verified 2026-08-11; 31 pricing-backed SKUs, while five complete codes remain unpriced and lifecycle-unknown",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase595-demo-spec-brand",
        demo.pp3401.key,
        demoCurrent,
        "official exact-product identities and Pineider collection",
      ),
      specEvidence(
        "series_name",
        "phase595-demo-spec-series-608",
        demo.pp3401.key,
        demo608,
        "H1 Avatar UR Demo Metal Fountain Pen and Model PP3401/608",
      ),
      specEvidence(
        "series_name",
        "phase595-demo-spec-series-611",
        demo.pp3901.key,
        demo611,
        "H1 Avatar UR Demo Metal Black Fountain Pen and Model PP3901/611",
      ),
      specEvidence(
        "origin_country",
        "phase595-demo-spec-origin-608",
        demo.pp3401.key,
        demo608,
        "DETAILS states Origin Italy",
      ),
      specEvidence(
        "origin_country",
        "phase595-demo-spec-origin-611",
        demo.pp3901.key,
        demo611,
        "DETAILS states Origin Italy",
      ),
      specEvidence(
        "nib",
        "phase595-demo-spec-nib-608",
        demo.pp3401.key,
        demo608,
        "palladium-plated stainless-steel tip and current EF/F/M selector matrix",
      ),
      specEvidence(
        "nib",
        "phase595-demo-spec-nib-611",
        demo.pp3901.key,
        demo611,
        "black stainless-steel nib and current EF/F/M selector matrix",
      ),
      specEvidence(
        "fill_system",
        "phase595-demo-spec-fill-608",
        demo.pp3401.key,
        demo608,
        "description states cartridge and converter plus Magnetic Lock",
      ),
      specEvidence(
        "fill_system",
        "phase595-demo-spec-fill-611",
        demo.pp3901.key,
        demo611,
        "description states cartridge and converter plus Magnetic Lock",
      ),
      specEvidence(
        "material",
        "phase595-demo-spec-material-608",
        demo.pp3401.key,
        demo608,
        "transparent UltraResin, visible mechanism and ink indicator",
      ),
      specEvidence(
        "material",
        "phase595-demo-spec-material-611",
        demo.pp3901.key,
        demo611,
        "transparent UltraResin, visible mechanism and ink indicator",
      ),
      specEvidence(
        "dimensions",
        "phase595-demo-spec-dimensions-608",
        demo.pp3401.key,
        demo608,
        "DETAILS states 148 MM and diameter 14.2 MM without measurement state",
      ),
      specEvidence(
        "dimensions",
        "phase595-demo-spec-dimensions-611",
        demo.pp3901.key,
        demo611,
        "DETAILS states 148 MM and diameter 14.2 MM without measurement state",
      ),
      specEvidence(
        "weight",
        "phase595-demo-spec-weight-unpublished",
        demo.pp3401.key,
        demoCurrent,
        "both current exact pages omit product weight; no number asserted",
      ),
      specEvidence(
        "weight",
        "phase595-demo-rejected-sample-weight",
        demo.penAddict.key,
        demoSample,
        "30 g capped and 17.8 g uncapped belong to one 2020 Amber review sample",
        false,
      ),
      specEvidence(
        "dimensions",
        "phase595-demo-rejected-sample-dimensions",
        demo.penAddict.key,
        demoSample,
        "147/133/164 mm belong to one 2020 Amber review sample",
        false,
      ),
      specEvidence(
        "status",
        "phase595-demo-spec-current-pricing-608",
        demo.pp3401.key,
        demo608,
        "eight complete colour-width combinations appear in the current pricing matrix",
      ),
      specEvidence(
        "status",
        "phase595-demo-spec-current-pricing-611",
        demo.pp3901.key,
        demo611,
        "23 complete colour-width combinations appear in the current pricing matrix",
      ),
      specEvidence(
        "status",
        "phase595-demo-rejected-unpriced-codes",
        demo.pp3401.key,
        demoUnpriced,
        "five complete codes exist in variant data but not current pricing matrices",
        false,
      ),
    ],
  },
  timeline: [
    {
      key: "phase595-pineider-avatar-demo-2020-review",
      title: "Amber Demo review sample documented",
      eventType: "community_event",
      startDate: "2020-11-13",
      circa: false,
      description:
        "The review date documents one historical sample and is not treated as the model launch date.",
      sourceKey: demo.penAddict.key,
    },
    {
      key: "phase595-pineider-avatar-demo-current-verified",
      title: "PP3401/608 and PP3901/611 exact pages verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Retrieval date marks current-page and pricing-matrix verification, not a launch date.",
      sourceKey: demo.pp3401.key,
    },
  ],
  conflicts: [
    {
      key: "phase595-pineider-avatar-demo-edition-identity",
      fieldKey: "model_identity",
      scopeKey: demoCurrent,
      conflictKind: "identity",
      status: "resolved",
      resolutionNote:
        "PP3401/608 and PP3901/611 share the official Avatar UR Demo Metal identity and current construction, while Black names the finish edition. They remain two edition groups under one canonical model.",
      members: [
        {
          citationKey: "phase595-demo-spec-series-608",
          assertedValue: "Avatar UR Demo Metal Fountain Pen PP3401/608",
        },
        {
          citationKey: "phase595-demo-spec-series-611",
          assertedValue: "Avatar UR Demo Metal Black Fountain Pen PP3901/611",
        },
      ],
    },
    {
      key: "phase595-pineider-avatar-demo-pricing-conflict",
      fieldKey: "variant_availability",
      scopeKey: demoCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Only complete codes inside each current pricing matrix become market SKUs. Five other complete codes remain rejected unpriced evidence; code presence alone does not prove current availability.",
      members: [
        {
          citationKey: "phase595-demo-spec-current-pricing-608",
          assertedValue: "eight PP3401 pricing-backed combinations",
        },
        {
          citationKey: "phase595-demo-spec-current-pricing-611",
          assertedValue: "23 PP3901 pricing-backed combinations",
        },
        {
          citationKey: "phase595-demo-rejected-unpriced-codes",
          assertedValue: "five complete codes absent from current pricing matrices",
        },
      ],
    },
  ],
  media: [
    {
      key: "phase595-pineider-avatar-demo-primary",
      title:
        "Pineider Avatar UR Demo Metal 608／611 身份与 SKU 边界事实图（非产品照片）",
      sourceKey: demo.diagram.key,
      localPath: demo.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、外形、透明度、纹理、比例、商标、笔尖、笔夹、库存或机构。",
      sourceUrl: demo.diagram.url,
      usageStatus: "primary",
    },
  ],
};

const glossyCurrent = "phase595-pineider-avatar-glossy-current-pp4001-602";
const glossyHidden = "phase595-pineider-avatar-glossy-hidden-unpriced-codes";
const glossyNeroRetail = "phase595-pineider-avatar-glossy-nero-retailer";
const glossyEdition = "phase595-pineider-avatar-glossy-current-product";

const GLOSSY_PRICED = [
  ["406-f", "Lapis Blue 406 Fine", "SSAFXPP4001406"],
  ["406-m", "Lapis Blue 406 Medium", "SSAMXPP4001406"],
  ["056-ef", "Nero 056 Extra Fine", "SSAEXPP4001056"],
  ["056-f", "Nero 056 Fine", "SSAFXPP4001056"],
  ["056-m", "Nero 056 Medium", "SSAMXPP4001056"],
] as const;

export const PHASE595_GLOSSY_PRICED_SKUS = GLOSSY_PRICED.map(
  ([, , code]) => code,
);

export const PHASE595_GLOSSY_HIDDEN_CODES = [
  "SSAEXPP4001406",
  "SSAEXPP4001273",
  "SSAFXPP4001273",
  "SSAMXPP4001273",
  "SSAEXPP4001380",
  "SSAFXPP4001380",
  "SSAMXPP4001380",
  "SSAEXPP4001606",
  "SSAFXPP4001606",
  "SSAMXPP4001606",
  "SSAEXPP4001608",
  "SSAFXPP4001608",
  "SSAMXPP4001608",
  "SSAEXPP4001609",
  "SSAFXPP4001609",
  "SSAMXPP4001609",
] as const;

export const phase595PineiderAvatarGlossyPack: CuratedEntityPack = {
  key: "phase595-pineider-avatar-glossy-v1",
  entityId: PHASE595_IDS.glossy,
  expectedType: "pen",
  expectedSlug: PHASE595_SLUGS.glossy,
  canonicalName: "Pineider Avatar UR Glossy Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/pineider-avatar-ur-glossy-phase595.md",
  storyTitle:
    "Pineider Avatar UR Glossy：PP4001／602、五个当前 SKU 与 all-black 文案冲突",
  primarySourceKey: glossy.official.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Pineider Avatar UR Glossy",
      language: "en",
      sourceKey: glossy.official.key,
    },
    {
      alias: "Pineider Avatar UR Glossy PP4001/602",
      language: "en",
      sourceKey: glossy.official.key,
    },
    {
      alias: "Pineider PP4001",
      language: "en",
      sourceKey: glossy.official.key,
    },
    {
      alias: "皮内德 Avatar UR Glossy 钢笔",
      language: "zh",
      sourceKey: glossy.official.key,
    },
  ],
  sources: [
    glossy.official,
    common.collection,
    common.care,
    glossy.hamilton,
    glossy.corsani,
    glossy.diagram,
  ],
  scopes: [
    {
      key: glossyCurrent,
      scopeKey: glossyCurrent,
      variantKey: glossyEdition,
      market: "current PP4001/602 exact page and pricing matrix",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope:
        "Official page states palladium-plated stainless steel and an EF/F/M size selector; current pricing supports Lapis Blue F/M and Nero EF/F/M only.",
      materialScope:
        "UltraResin; official all-black prose conflicts with the current Lapis Blue and Nero selector and is not generalized to every trim.",
      editionScope:
        "One PP4001/602 model with five pricing-backed market SKUs; page accessibility does not guarantee stock duration.",
    },
    {
      key: glossyHidden,
      scopeKey: glossyHidden,
      market: "complete codes present in variant data but absent from current pricing matrix",
      validFrom: RETRIEVED,
      productionState: "unknown",
      nibScope:
        "Lapis Blue EF and fifteen codes under hidden suffixes 273/380/606/608/609 are unpriced; lifecycle and colour labels remain unknown.",
      materialScope:
        "Hidden suffixes are not assigned colours from CSS or image inference.",
      editionScope:
        "Sixteen unpriced codes do not create current market variants.",
    },
    {
      key: glossyNeroRetail,
      scopeKey: glossyNeroRetail,
      market: "Hamilton Black Glossy Black retailer scope",
      productionState: "unknown",
      nibScope:
        "Retailer says black-plated No.6 steel for PIN-PP4001056; this conflicts with the current official palladium-plated wording and remains nonqualifying.",
      materialScope:
        "Black Glossy Black/Nero retailer wording does not remove current Lapis Blue from the official selector.",
    },
  ],
  claims: [
    {
      key: "phase595-pineider-avatar-glossy-identity",
      predicate: "model_identity",
      objectText:
        "Pineider Avatar UR Glossy Fountain Pen PP4001/602 is a canonical sibling of standard Avatar UR and Demo Metal, not a colour alias of either model.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: glossy.official.key,
      locator: glossy.official.summary,
      evidence: [
        {
          key: "phase595-glossy-identity-exact-evidence",
          sourceKey: glossy.official.key,
          scopeKey: glossyCurrent,
          locator: glossy.official.summary,
        },
        {
          key: "phase595-glossy-family-navigation-evidence",
          sourceKey: common.collection.key,
          scopeKey: glossyCurrent,
          locator: common.collection.summary,
        },
      ],
    },
    {
      key: "phase595-pineider-avatar-glossy-configuration",
      predicate: "current_configuration",
      objectText:
        "Current PP4001/602 is 148 mm by 14.2 mm, made in Italy from UltraResin with an officially described palladium-plated steel nib, Magnetic Lock and cartridge/converter.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: glossy.official.key,
      locator: glossy.official.summary,
      evidence: [
        {
          key: "phase595-glossy-configuration-evidence",
          sourceKey: glossy.official.key,
          scopeKey: glossyCurrent,
          locator: glossy.official.summary,
        },
      ],
    },
    {
      key: "phase595-pineider-avatar-glossy-selector-boundary",
      predicate: "variant_availability_boundary",
      objectText:
        "The current selector and pricing matrix support five market SKUs: Lapis Blue F/M and Nero EF/F/M; sixteen other complete codes remain hidden or unpriced and do not become current variants.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: glossy.official.key,
      locator: glossy.official.summary,
      evidence: [
        {
          key: "phase595-glossy-current-pricing-evidence",
          sourceKey: glossy.official.key,
          scopeKey: glossyCurrent,
          locator: "five entries in the current sylius-variants-pricing block",
        },
        {
          key: "phase595-glossy-hidden-code-evidence",
          sourceKey: glossy.official.key,
          scopeKey: glossyHidden,
          locator:
            "16 complete codes appear outside the current pricing matrix; five suffix groups have no visible current colour label",
        },
      ],
    },
    {
      key: "phase595-pineider-avatar-glossy-colour-conflict",
      predicate: "marketing_selector_conflict",
      objectText:
        "The official all-black look sentence and the same page's Lapis Blue plus Nero selector are both retained; marketing prose is not used to delete Lapis Blue or infer trim colour across PP4001.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: glossy.official.key,
      locator: glossy.official.summary,
      evidence: [
        {
          key: "phase595-glossy-all-black-evidence",
          sourceKey: glossy.official.key,
          scopeKey: glossyCurrent,
          locator: "description says all-black look",
        },
        {
          key: "phase595-glossy-two-colour-evidence",
          sourceKey: glossy.official.key,
          scopeKey: glossyCurrent,
          locator: "current colour selector lists LAPIS BLUE and NERO",
        },
      ],
    },
    {
      key: "phase595-pineider-avatar-glossy-nib-conflict",
      predicate: "nib_finish_conflict",
      objectText:
        "Pineider's current exact page supplies the canonical palladium-plated steel wording; Hamilton's black-plated No.6 claim remains Nero retailer evidence and does not overwrite the family spec.",
      factClass: "core",
      confidence: 0.98,
      sourceKey: glossy.official.key,
      locator: `${glossy.official.summary} ${glossy.hamilton.summary}`,
      evidence: [
        {
          key: "phase595-glossy-official-nib-evidence",
          sourceKey: glossy.official.key,
          scopeKey: glossyCurrent,
          locator: "current exact description states stainless-steel palladium-plated nib",
        },
        {
          key: "phase595-glossy-retailer-black-nib-evidence",
          sourceKey: glossy.hamilton.key,
          scopeKey: glossyNeroRetail,
          locator: glossy.hamilton.summary,
        },
      ],
    },
  ],
  variants: [
    {
      key: glossyEdition,
      name: "Avatar UR Glossy PP4001 / 602",
      notes:
        "Current exact product anchor; selector and pricing evidence are kept separate from all-black marketing prose.",
      sourceKey: glossy.official.key,
      variantKind: "edition_group",
      productCode: "PP4001 / 602",
      market: "global current",
    },
    ...GLOSSY_PRICED.map(([suffix, name, productCode]) => ({
      key: `phase595-pineider-avatar-glossy-${suffix}-sku`,
      name: `PP4001 ${name}`,
      notes:
        "Complete code appears in the current PP4001/602 pricing matrix; no stock duration is inferred.",
      sourceKey: glossy.official.key,
      variantKind: "market_sku" as const,
      parentVariantKey: glossyEdition,
      productCode,
      market: "current PP4001/602 selector",
    })),
  ],
  spec: {
    brandEntityId: PHASE595_PINEIDER_BRAND_ID,
    values: {
      series_name: "Pineider Avatar UR Glossy Fountain Pen PP4001/602",
      origin_country: "Italy for current PP4001/602",
      nib:
        "Official current wording: palladium-plated stainless steel; EF/F/M selector, with five pricing-backed colour-width combinations; Nero black-plated retailer claim remains unresolved trim evidence",
      fill_system: "Cartridge/converter with Magnetic Lock cap closure",
      material:
        "UltraResin; current selector lists Lapis Blue 406 and Nero 056 despite all-black marketing prose",
      dimensions:
        "Official current page states 148 mm length and 14.2 mm diameter; measurement state is not specified",
      weight: "Current official PP4001/602 page publishes no product weight",
      status:
        "Current exact page verified 2026-08-11; five pricing-backed SKUs, while sixteen complete codes remain hidden or unpriced",
    },
    evidence: [
      specEvidence(
        "brand_entity_id",
        "phase595-glossy-spec-brand",
        glossy.official.key,
        glossyCurrent,
        "official exact-product identity and Pineider collection",
      ),
      specEvidence(
        "series_name",
        "phase595-glossy-spec-series",
        glossy.official.key,
        glossyCurrent,
        "H1 Avatar UR Glossy Fountain Pen and Model PP4001/602",
      ),
      specEvidence(
        "origin_country",
        "phase595-glossy-spec-origin",
        glossy.official.key,
        glossyCurrent,
        "DETAILS states Origin Italy",
      ),
      specEvidence(
        "nib",
        "phase595-glossy-spec-nib-official",
        glossy.official.key,
        glossyCurrent,
        "official description states stainless-steel palladium-plated nib; selector lists EF/F/M",
      ),
      specEvidence(
        "nib",
        "phase595-glossy-rejected-black-nib-retailer",
        glossy.hamilton.key,
        glossyNeroRetail,
        "Hamilton PIN-PP4001056 page says black-plated No.6 steel nib",
        false,
      ),
      specEvidence(
        "fill_system",
        "phase595-glossy-spec-fill",
        glossy.official.key,
        glossyCurrent,
        "description states cartridge and converter plus Magnetic Lock",
      ),
      specEvidence(
        "material",
        "phase595-glossy-spec-material-ultraresin",
        glossy.official.key,
        glossyCurrent,
        "description states resistant UltraResin",
      ),
      specEvidence(
        "material",
        "phase595-glossy-spec-all-black-prose",
        glossy.official.key,
        glossyCurrent,
        "description says all-black look without defining its colour or trim scope",
        false,
      ),
      specEvidence(
        "material",
        "phase595-glossy-spec-two-colour-selector",
        glossy.official.key,
        glossyCurrent,
        "current selector lists LAPIS BLUE 406 and NERO 056",
      ),
      specEvidence(
        "dimensions",
        "phase595-glossy-spec-dimensions",
        glossy.official.key,
        glossyCurrent,
        "DETAILS states 148 MM and diameter 14.2 MM without measurement state",
      ),
      specEvidence(
        "weight",
        "phase595-glossy-spec-weight-unpublished",
        glossy.official.key,
        glossyCurrent,
        "current exact page publishes no product weight; no number asserted",
      ),
      specEvidence(
        "status",
        "phase595-glossy-spec-current-pricing",
        glossy.official.key,
        glossyCurrent,
        "five complete colour-width combinations appear in the current pricing matrix",
      ),
      specEvidence(
        "status",
        "phase595-glossy-rejected-hidden-codes",
        glossy.official.key,
        glossyHidden,
        "16 complete codes exist outside current pricing matrix; no current availability inferred",
        false,
      ),
    ],
  },
  timeline: [
    {
      key: "phase595-pineider-avatar-glossy-current-verified",
      title: "Current PP4001/602 product and pricing matrix verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "Retrieval date marks current-page, selector and pricing-matrix verification, not a launch date.",
      sourceKey: glossy.official.key,
    },
  ],
  conflicts: [
    {
      key: "phase595-pineider-avatar-glossy-colour-scope-conflict",
      fieldKey: "colour_scope",
      scopeKey: glossyCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The current selector controls colour identity and lists Lapis Blue plus Nero. The all-black sentence remains marketing prose of unclear scope and neither deletes Lapis Blue nor proves trim colour across both variants.",
      members: [
        {
          citationKey: "phase595-glossy-spec-all-black-prose",
          assertedValue: "description says all-black look",
        },
        {
          citationKey: "phase595-glossy-spec-two-colour-selector",
          assertedValue: "selector lists Lapis Blue 406 and Nero 056",
        },
      ],
    },
    {
      key: "phase595-pineider-avatar-glossy-nib-finish-conflict",
      fieldKey: "nib",
      scopeKey: glossyCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The current exact official page supplies palladium-plated stainless steel for the canonical spec. Hamilton's black-plated No.6 wording is retained only for its Nero retailer scope and should be checked against the physical pen.",
      members: [
        {
          citationKey: "phase595-glossy-spec-nib-official",
          assertedValue: "official palladium-plated stainless-steel nib",
        },
        {
          citationKey: "phase595-glossy-rejected-black-nib-retailer",
          assertedValue: "Hamilton black-plated No.6 steel nib for PIN-PP4001056",
        },
      ],
    },
    {
      key: "phase595-pineider-avatar-glossy-pricing-conflict",
      fieldKey: "variant_availability",
      scopeKey: glossyCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Only five complete codes inside the current pricing matrix become market SKUs. Sixteen other complete codes remain hidden or unpriced evidence; no colour, stock or lifecycle is inferred from code presence.",
      members: [
        {
          citationKey: "phase595-glossy-spec-current-pricing",
          assertedValue: "five PP4001 pricing-backed combinations",
        },
        {
          citationKey: "phase595-glossy-rejected-hidden-codes",
          assertedValue: "16 complete codes absent from current pricing matrix",
        },
      ],
    },
  ],
  media: [
    {
      key: "phase595-pineider-avatar-glossy-primary",
      title:
        "Pineider Avatar UR Glossy PP4001／602 选择器与文案冲突事实图（非产品照片）",
      sourceKey: glossy.diagram.key,
      localPath: glossy.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实示意图；非产品照片，不表示真实颜色、光泽、外形、纹理、比例、商标、笔尖、笔夹或库存。",
      sourceUrl: glossy.diagram.url,
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
      throw new Error(`Phase 595 conflicting source definition: ${source.key}.`);
    }
    byKey.set(source.key, source);
  }
  return [...byKey.values()];
}

const brandScope = phase594PineiderBrandPack.scopes[0]?.scopeKey;
if (!brandScope) {
  throw new Error("Phase 595 Pineider brand pack requires a canonical scope.");
}

export const phase595PineiderBrandPack: CuratedEntityPack = {
  ...phase594PineiderBrandPack,
  key: "phase595-pineider-brand-depth-refresh-v1",
  markdownFile: ".planning/content-research/pineider-brand-phase595.md",
  storyTitle:
    "Pineider：十六个公开型号入口与 current selector／historic code 边界",
  publicationIntent: "publish",
  publicationBlockers: [],
  sources: mergeSources(phase594PineiderBrandPack.sources, [
    common.collection,
    common.care,
    demo.pp3401,
    demo.pp3901,
    demo.penAddict,
    demo.bertram,
    demo.inky,
    glossy.official,
    glossy.hamilton,
    glossy.corsani,
  ]),
  claims: [
    ...phase594PineiderBrandPack.claims,
    {
      key: "phase595-pineider-brand-sixteen-model-navigation",
      predicate: "series_navigation",
      objectText:
        "Pineider's 14 previously public models plus Avatar UR Demo Metal and Avatar UR Glossy are 16 separate public model nodes; PP3401/608 and PP3901/611 remain edition groups of Demo Metal, while PP4001/602 is a separate sibling.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.collection.key,
      locator: common.collection.summary,
      evidence: [
        {
          key: "phase595-pineider-brand-sixteen-navigation-evidence",
          sourceKey: common.collection.key,
          scopeKey: brandScope,
          locator: common.collection.summary,
        },
        {
          key: "phase595-pineider-brand-demo-navigation-evidence",
          sourceKey: demo.pp3401.key,
          scopeKey: brandScope,
          locator: demo.pp3401.summary,
        },
        {
          key: "phase595-pineider-brand-demo-black-navigation-evidence",
          sourceKey: demo.pp3901.key,
          scopeKey: brandScope,
          locator: demo.pp3901.summary,
        },
        {
          key: "phase595-pineider-brand-glossy-navigation-evidence",
          sourceKey: glossy.official.key,
          scopeKey: brandScope,
          locator: glossy.official.summary,
        },
      ],
    },
  ],
};

export const phase595PineiderPacks: CuratedEntityPack[] = [
  phase595PineiderBrandPack,
  phase595PineiderAvatarDemoMetalPack,
  phase595PineiderAvatarGlossyPack,
];

if (
  phase595PineiderPacks.length !== 3 ||
  new Set(phase595PineiderPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 595 must contain one brand and two unique model packs.");
}
