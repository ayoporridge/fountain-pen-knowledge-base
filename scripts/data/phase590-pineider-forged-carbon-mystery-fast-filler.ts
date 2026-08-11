import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE589_PINEIDER_BRAND_ID,
  phase589PineiderBrandPack,
} from "./phase589-pineider-classic-tempi-moderni";

export const PHASE590_PINEIDER_BRAND_ID = PHASE589_PINEIDER_BRAND_ID;

export const PHASE590_IDS = {
  forgedCarbon: "phase590-pineider-grande-bellezza-forged-carbon",
  mysteryFastFiller: "phase590-pineider-mystery-fast-filler",
} as const;

export const PHASE590_SLUGS = {
  forgedCarbon: "pineider-grande-bellezza-forged-carbon-pp2401-206",
  mysteryFastFiller: "pineider-mystery-fast-filler-spp6901-943",
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
    registryKey: "pineider-official-phase590",
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
  return web({ ...input, sourceType: "retailer", tier: "professional_secondary" });
}

function editorial(
  key: "grande-bellezza-forged-carbon" | "mystery-fast-filler",
  title: string,
): CuratedSource {
  const localPath = `/images/library/site-original/phase590/pineider/pineider-${key}.svg`;
  return {
    key: `phase590-pineider-${key}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase590-${key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase590-${key}`,
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
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

const common = {
  collections: official({
    key: "phase590-pineider-writing-collections",
    title: "Pineider Writing Instruments Collections",
    url: "https://www.pineider.com/en/pens/collections",
    summary:
      "Pineider 当前 collection 导航把 Avatar、Arco、Rock、Classic、Tempi Moderni、Forged Carbon 与 Mistery Fast Filler 分成不同入口。",
    locator:
      "current collection navigation separates the seven Pineider model families and spells the collection Mistery Fast Filler",
  }),
};

const forged = {
  official: official({
    key: "phase590-pineider-forged-carbon-pp2401-206-official",
    title: "La Grande Bellezza Forged Carbon Fountain Pen",
    url: "https://www.pineider.com/en/products/la-grande-bellezza-forged-carbon-fountain-pen-206",
    summary:
      "当前商品页确认 PP2401／206、Carbon Dream、158 mm、直径 15.6 mm、Italy、B/EF/F/M/S、14K super-flexible nib、Mistery piston 与 888 支限量。",
    locator:
      "current PP2401/206 identity; Carbon Dream; 158 mm; diameter 15.6 mm; Origin Italy; B/EF/F/M/S selector; 14K super-flexible nib; Mistery piston; limited 888 pieces",
  }),
  collection: official({
    key: "phase590-pineider-forged-carbon-collection",
    title: "Pineider Forged Carbon collection",
    url: "https://www.pineider.com/en/pens/collections/forged-carbon",
    summary:
      "当前 Forged Carbon collection 将钢笔、宝珠笔和其他书写模式分开，不能把共同系列名当成统一规格。",
    locator:
      "current Forged Carbon collection cards separate fountain pen and non-fountain writing modes",
  }),
  penBoutique: retailer({
    key: "phase590-pineider-forged-carbon-pen-boutique",
    registryKey: "pen-boutique-phase590-pineider-forged-carbon",
    registryName: "Pen Boutique",
    independenceGroup: "pen-boutique",
    title: "The Pineider La Grande Bellezza Forged Carbon",
    url: "https://www.penboutique.com/blogs/blog/the-pineider-la-grande-bellezza-forged-carbon",
    homepageUrl: "https://www.penboutique.com/",
    author: "Pen Boutique",
    summary:
      "2020 年专业零售文章记录 Carbon Dream、14K flex nib、磁吸帽、按压释放活塞尾钮与 888 支限量。",
    locator:
      "dated 2020-01-08 article; Carbon Dream; 14K flexible nib; magnetic cap; push-and-release piston knob; limited 888",
  }),
  penChalet: retailer({
    key: "phase590-pineider-forged-carbon-pen-chalet",
    registryKey: "pen-chalet-phase590-pineider-forged-carbon",
    registryName: "Pen Chalet",
    independenceGroup: "pen-chalet",
    title: "Pineider La Grande Bellezza Forged Carbon Fiber Fountain Pen",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/pineider_la_grande_bellezza_forged_carbon_fiber_fountain_pens.html",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    summary:
      "零售页两处写 88 支，并给出 148.8 mm 闭合、167.4 mm 戴帽、137.4 mm 无帽等样本测量；这些与当前官网 888 和 158 mm 口径冲突。",
    locator:
      "retail page states limited 88 twice and sample measurements 148.8 mm closed, 167.4 mm posted, 137.4 mm uncapped; retained as nonqualifying conflicting evidence",
  }),
  yafa: retailer({
    key: "phase590-pineider-forged-carbon-yafa",
    registryKey: "yafa-brands-phase590-pineider-forged-carbon",
    registryName: "YAFA Brands",
    independenceGroup: "yafa-brands",
    title: "La Grande Bellezza Forged Carbon Fiber Fountain Pen EF",
    url: "https://yafabrands.com/la-grande-bellezza-forged-carbon-fiber-fountain-pen-extra-fine-14k-gold-nib/",
    homepageUrl: "https://yafabrands.com/",
    author: "YAFA Brands",
    summary:
      "分销商商品页给出 SKU PP2401-EF、888 支、14K nib、Mystery filler 与 Twist Magnetic Lock。",
    locator:
      "SKU PP2401-EF; limited 888; 14K nib; Mystery filler; Twist Magnetic Lock",
  }),
  diagram: editorial(
    "grande-bellezza-forged-carbon",
    "Pineider Grande Bellezza Forged Carbon PP2401／206 事实边界图",
  ),
};

const mystery = {
  official: official({
    key: "phase590-pineider-mystery-spp6901-943-official",
    title: "Mystery Fast Filler Fountain Pen",
    url: "https://www.pineider.com/en/products/mystery-fast-filler-fountain-pen-943",
    summary:
      "当前商品页确认 Mystery Fast Filler、SPP6901／943、F/EF、155 mm、直径 15.45 mm、Italy、制表灵感、快速上墨、意外启动防护与 Twist Magnetic Lock。",
    locator:
      "current SPP6901/943 identity; F/EF selector; 155 mm; diameter 15.45 mm; Origin Italy; watchmaking inspiration; quick filling; accidental activation protection; Twist Magnetic Lock",
  }),
  collection: official({
    key: "phase590-pineider-mistery-fast-filler-collection",
    title: "Pineider Mistery Fast Filler collection",
    url: "https://www.pineider.com/en/pens/collections/mistery-fast-filler",
    summary:
      "collection URL 与标题使用 Mistery Fast Filler，而当前 exact 商品页使用 Mystery；该拼写保留为 alias，不另建第二实体。",
    locator:
      "current collection label and URL use Mistery Fast Filler while exact product page uses Mystery",
  }),
  magazine: official({
    key: "phase590-pineider-mystery-magazine-2024",
    title: "Collectors' jewel pens by Pineider",
    url: "https://magazine.pineider.com/en/collectors-jewel-pens-by-pineider/",
    publishedAt: "2024-01-01",
    summary:
      "Pineider 杂志把 Mystery Filler Demonstrator 的制表灵感和隐藏启动机构置于收藏笔语境，也把 Forged Carbon 另列为独立系列。",
    locator:
      "2024 collectors overview; Mystery Filler Demonstrator watchmaking and hidden activation; Forged Carbon separately listed",
  }),
  stixis: retailer({
    key: "phase590-pineider-mystery-spp6901f435-stixis",
    registryKey: "stixis-phase590-pineider-mystery",
    registryName: "Stixis",
    independenceGroup: "stixis",
    title: "Pineider Mistery Fast Filler Green Black Trims Steel Nib F",
    url: "https://www.stixis.gr/en/pi-mistery-fast-filler-green-blk-trims-fp-steel-nib-f-p-4634.html",
    homepageUrl: "https://www.stixis.gr/",
    author: "Stixis",
    summary:
      "零售商品页提供完整 SKU SPP6901F435，并明确 Green／Black trims／steel nib／F；它只证明该子 SKU，不能把钢尖扩展到全部 SPP6901／943。",
    locator:
      "full SKU SPP6901F435; green; black trims; steel nib; F; SKU-specific evidence only",
  }),
  demoSteel: retailer({
    key: "phase590-pineider-mistery-demo-steel-pen-chalet",
    registryKey: "pen-chalet-phase590-pineider-mistery-demo-steel",
    registryName: "Pen Chalet",
    independenceGroup: "pen-chalet",
    title: "Pineider Mistery Fast Filler Demo Steel Nib Fountain Pen",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/pineider_mistery_fast_filler_demo_fountain_pens/Green~Black%2Btrim/",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    summary:
      "2024 Demo steel sibling 零售页写钢尖、约一圈启动、七个部件与 158.0 mm 样本长度；没有 SPP6901／943 精确身份。",
    locator:
      "2024 Demo steel sibling; steel nib; one-turn activation; seven parts; sample length 158.0 mm; no exact SPP6901/943 anchor",
  }),
  demoGold: retailer({
    key: "phase590-pineider-mistery-demo-14k-pen-chalet",
    registryKey: "pen-chalet-phase590-pineider-mistery-demo-14k",
    registryName: "Pen Chalet",
    independenceGroup: "pen-chalet",
    title: "Pineider Mistery Fast Filler Demo 14K Nib Fountain Pen",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/pineider_mistery_fast_filler_demo_14kt_nib_fountain_pens.html",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    summary:
      "2024 Demo 14K sibling 页写 14K nib、少于两圈启动、七个部件与 154.4 mm 样本长度；不授权 current SPP6901／943 的笔尖材质或尺寸。",
    locator:
      "2024 Demo 14K sibling; less-than-two-turn activation; seven parts; sample length 154.4 mm; no exact SPP6901/943 anchor",
  }),
  oldMystery: retailer({
    key: "phase590-pineider-old-mystery-filler-pen-chalet",
    registryKey: "pen-chalet-phase590-pineider-old-mystery",
    registryName: "Pen Chalet",
    independenceGroup: "pen-chalet",
    title: "Pineider Mystery Filler Fountain Pen",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/pineider_mystery_filler_fountain_pen.html",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
    summary:
      "旧 Mystery Filler demonstrator 零售页记录 152.4 mm、15.9 mm、gold nib、七部件与活塞锁，属于旧代，不并入 current SPP6901／943。",
    locator:
      "older Mystery Filler demonstrator; 152.4 mm; 15.9 mm; gold nib; seven parts; piston lock; historical sibling",
  }),
  peytonStreet: retailer({
    key: "phase590-pineider-mystery-filler-2019-peyton-street",
    registryKey: "peyton-street-phase590-pineider-mystery",
    registryName: "Peyton Street Pens",
    independenceGroup: "peyton-street-pens",
    title: "Pineider Mystery Filler LE 66/888 Fountain Pen",
    url: "https://www.peytonstreetpens.com/pineider-mystery-filler-le-66-888-fountain-pen-clear-demonstrator-w-rhodium-trim-14k-soft-medium-nib-superior-works-well.html",
    homepageUrl: "https://www.peytonstreetpens.com/",
    author: "Peyton Street Pens",
    summary:
      "2019 二手档案记录旧 Mystery Filler LE 66/888、透明 demonstrator、14K soft M 与旧式活塞锁；只用于历史版本边界。",
    locator:
      "2019 historical listing; LE 66/888; clear demonstrator; 14K soft medium nib; earlier piston lock",
  }),
  diagram: editorial(
    "mystery-fast-filler",
    "Pineider Mystery Fast Filler SPP6901／943 版本边界图",
  ),
};

const forgedCurrent = "phase590-pineider-forged-current-pp2401-206";
const forgedRetailConflict = "phase590-pineider-forged-pen-chalet-retail";

export const phase590PineiderForgedCarbonPack: CuratedEntityPack = {
  key: "phase590-pineider-grande-bellezza-forged-carbon-v1",
  entityId: PHASE590_IDS.forgedCarbon,
  expectedType: "pen",
  expectedSlug: PHASE590_SLUGS.forgedCarbon,
  canonicalName: "Pineider Grande Bellezza Forged Carbon Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/pineider-grande-bellezza-forged-carbon-phase590.md",
  storyTitle: "Pineider Grande Bellezza Forged Carbon：PP2401／206 与 888 支证据边界",
  primarySourceKey: forged.official.key,
  depthTier: "A",
  aliases: [
    { alias: "Pineider La Grande Bellezza Forged Carbon", language: "en", sourceKey: forged.official.key },
    { alias: "Pineider Forged Carbon PP2401/206", language: "en", sourceKey: forged.official.key },
    { alias: "Pineider PP2401", language: "en", sourceKey: forged.official.key },
    { alias: "皮内德 Grande Bellezza 锻造碳纤维钢笔", language: "zh", sourceKey: forged.official.key },
  ],
  sources: [
    forged.official,
    forged.collection,
    forged.penBoutique,
    forged.penChalet,
    forged.yafa,
    common.collections,
    forged.diagram,
  ],
  scopes: [
    {
      key: forgedCurrent,
      scopeKey: forgedCurrent,
      market: "current global PP2401/206",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "Current official selector B/EF/F/M/S with 14K super-flexible nib.",
      materialScope: "Forged Carbon / Carbon Dream in the exact official product scope.",
      editionScope: "Official page and two independent records support 888 pieces.",
    },
    {
      key: forgedRetailConflict,
      scopeKey: forgedRetailConflict,
      market: "Pen Chalet archived retail description and sample measurements",
      productionState: "historical",
      nibScope: "Retail page records a 14K nib but does not replace the current official selector.",
      materialScope: "Forged carbon retail description.",
      editionScope: "Page says 88 twice; retained as a conflicting, nonqualifying statement.",
    },
  ],
  claims: [
    {
      key: "phase590-pineider-forged-identity",
      predicate: "model_identity",
      objectText: "The current Grande Bellezza Forged Carbon fountain pen is anchored to exact product PP2401/206, not every La Grande Bellezza writing instrument.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: forged.official.key,
      locator: forged.official.summary,
      evidence: [{ key: "phase590-forged-identity-evidence", sourceKey: forged.official.key, scopeKey: forgedCurrent, locator: forged.official.summary }],
    },
    {
      key: "phase590-pineider-forged-current-configuration",
      predicate: "current_configuration",
      objectText: "Current PP2401/206 is 158 mm by 15.6 mm, made in Italy from forged carbon, with a 14K super-flexible B/EF/F/M/S nib, Mistery piston and magnetic closure.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: forged.official.key,
      locator: forged.official.summary,
      evidence: [
        { key: "phase590-forged-current-official-evidence", sourceKey: forged.official.key, scopeKey: forgedCurrent, locator: forged.official.summary },
        { key: "phase590-forged-current-yafa-evidence", sourceKey: forged.yafa.key, scopeKey: forgedCurrent, locator: forged.yafa.summary },
      ],
    },
    {
      key: "phase590-pineider-forged-edition-resolution",
      predicate: "edition_resolution",
      objectText: "The 888-piece edition is supported by Pineider, Pen Boutique and YAFA; Pen Chalet's 88 is preserved as rejected conflicting evidence rather than silently corrected.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: forged.official.key,
      locator: forged.official.summary,
      evidence: [
        { key: "phase590-forged-edition-888-evidence", sourceKey: forged.official.key, scopeKey: forgedCurrent, locator: forged.official.summary },
        { key: "phase590-forged-edition-88-evidence", sourceKey: forged.penChalet.key, scopeKey: forgedRetailConflict, locator: forged.penChalet.summary },
      ],
    },
  ],
  variants: [
    {
      key: "phase590-pineider-forged-current-product",
      name: "Grande Bellezza Forged Carbon PP2401 / 206",
      releaseYear: "2020",
      notes: "Exact current anchor; the 2020 retail article supplies a dated release-window record, not a precise launch date.",
      sourceKey: forged.official.key,
      variantKind: "market_sku",
      productCode: "PP2401 / 206",
      market: "global",
    },
  ],
  spec: {
    brandEntityId: PHASE590_PINEIDER_BRAND_ID,
    values: {
      series_name: "Pineider Grande Bellezza Forged Carbon Fountain Pen PP2401/206",
      release_year: "Documented in a dated 2020-01-08 professional retail article",
      origin_country: "Italy for current PP2401/206 product scope",
      nib: "14K super-flexible nib; current B/EF/F/M/S selector",
      fill_system: "Mistery piston filling mechanism with protected tail control",
      material: "Forged Carbon described by Pineider as Carbon Dream",
      dimensions: "Official current product: 158 mm length and 15.6 mm diameter; measurement convention not stated",
      weight: "Current official PP2401/206 page does not publish a weight; no numeric weight asserted",
      status: "Limited edition of 888 pieces; current product page verified 2026-08-11",
    },
    evidence: [
      specEvidence("brand_entity_id", "phase590-forged-spec-brand", forged.official.key, forgedCurrent, "official exact-product identity"),
      specEvidence("series_name", "phase590-forged-spec-series", forged.official.key, forgedCurrent, "official name and PP2401/206"),
      specEvidence("release_year", "phase590-forged-spec-release-window", forged.penBoutique.key, forgedCurrent, "dated professional article published 2020-01-08"),
      specEvidence("origin_country", "phase590-forged-spec-origin", forged.official.key, forgedCurrent, "Origin Italy"),
      specEvidence("nib", "phase590-forged-spec-nib", forged.official.key, forgedCurrent, "14K super-flexible and B/EF/F/M/S selector"),
      specEvidence("fill_system", "phase590-forged-spec-fill", forged.official.key, forgedCurrent, "Mistery piston mechanism"),
      specEvidence("material", "phase590-forged-spec-material", forged.official.key, forgedCurrent, "Forged Carbon and Carbon Dream"),
      specEvidence("dimensions", "phase590-forged-spec-dimensions", forged.official.key, forgedCurrent, "158 mm and diameter 15.6 mm"),
      specEvidence("dimensions", "phase590-forged-rejected-retail-dimensions", forged.penChalet.key, forgedRetailConflict, "sample measurements use different conventions and do not qualify the current field", false),
      specEvidence("weight", "phase590-forged-spec-weight-unpublished", forged.official.key, forgedCurrent, "official page publishes no weight; no number asserted"),
      specEvidence("status", "phase590-forged-spec-edition-888", forged.official.key, forgedCurrent, "official limited edition of 888 pieces"),
      specEvidence("status", "phase590-forged-spec-edition-888-independent", forged.yafa.key, forgedCurrent, "independent distributor also states 888 pieces"),
      specEvidence("status", "phase590-forged-rejected-edition-88", forged.penChalet.key, forgedRetailConflict, "single retail page states 88 twice", false),
    ],
  },
  timeline: [
    {
      key: "phase590-pineider-forged-2020-record",
      title: "Forged Carbon documented in a dated professional article",
      eventType: "design_milestone",
      startDate: "2020-01-08",
      circa: false,
      description: "Pen Boutique records the forged-carbon construction, filling control and 888-piece edition.",
      sourceKey: forged.penBoutique.key,
    },
    {
      key: "phase590-pineider-forged-current-verified",
      title: "Current PP2401/206 product verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description: "Retrieval date marks current-page verification, not a launch date.",
      sourceKey: forged.official.key,
    },
  ],
  conflicts: [
    {
      key: "phase590-pineider-forged-edition-count-conflict",
      fieldKey: "edition_count",
      scopeKey: forgedCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote: "Pineider and two independent professional records support 888. Pen Chalet's 88 is retained but rejected for the current field.",
      members: [
        { citationKey: "phase590-forged-spec-edition-888", assertedValue: "888 pieces" },
        { citationKey: "phase590-forged-spec-edition-888-independent", assertedValue: "888 pieces" },
        { citationKey: "phase590-forged-rejected-edition-88", assertedValue: "88 pieces" },
      ],
    },
  ],
  media: [
    {
      key: "phase590-pineider-forged-primary",
      title: "Pineider Grande Bellezza Forged Carbon PP2401／206 事实边界图（非产品照片）",
      sourceKey: forged.diagram.key,
      localPath: forged.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创事实示意图；非产品照片，不表示真实颜色、外形、纹理、比例、商标、笔尖、机构或库存。",
      sourceUrl: forged.diagram.url,
      usageStatus: "primary",
    },
  ],
};

const mysteryCurrent = "phase590-pineider-mystery-current-spp6901-943";
const mysterySku = "phase590-pineider-mystery-spp6901f435-steel-f";
const mysteryDemo = "phase590-pineider-mistery-demo-2024-siblings";
const mysteryOlder = "phase590-pineider-mystery-filler-older-generation";

export const phase590PineiderMysteryFastFillerPack: CuratedEntityPack = {
  key: "phase590-pineider-mystery-fast-filler-v1",
  entityId: PHASE590_IDS.mysteryFastFiller,
  expectedType: "pen",
  expectedSlug: PHASE590_SLUGS.mysteryFastFiller,
  canonicalName: "Pineider Mystery Fast Filler Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pineider-mystery-fast-filler-phase590.md",
  storyTitle: "Pineider Mystery Fast Filler：SPP6901／943 与多代 Mistery 边界",
  primarySourceKey: mystery.official.key,
  depthTier: "A",
  aliases: [
    { alias: "Pineider Mistery Fast Filler", language: "en", sourceKey: mystery.collection.key },
    { alias: "Pineider Mystery Fast Filler SPP6901/943", language: "en", sourceKey: mystery.official.key },
    { alias: "Pineider SPP6901", language: "en", sourceKey: mystery.official.key },
    { alias: "皮内德 Mystery Fast Filler 钢笔", language: "zh", sourceKey: mystery.official.key },
  ],
  sources: [
    mystery.official,
    mystery.collection,
    mystery.magazine,
    mystery.stixis,
    mystery.demoSteel,
    mystery.demoGold,
    mystery.oldMystery,
    mystery.peytonStreet,
    common.collections,
    mystery.diagram,
  ],
  scopes: [
    {
      key: mysteryCurrent,
      scopeKey: mysteryCurrent,
      market: "current global SPP6901/943",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "Current official selector shows F/EF but does not publish nib metal; no metal is inferred.",
      materialScope: "Current page does not publish a body-material field; no resin formula is inferred.",
      editionScope: "Exact current product anchor SPP6901/943; no edition count asserted.",
    },
    {
      key: mysterySku,
      scopeKey: mysterySku,
      variantKey: "phase590-pineider-mystery-steel-f-sku",
      market: "Stixis retail SKU SPP6901F435",
      productionState: "current",
      nibScope: "Steel F applies only to full SKU SPP6901F435.",
      editionScope: "SKU-specific colour and trim; does not authorize every SPP6901/943 configuration.",
    },
    {
      key: mysteryDemo,
      scopeKey: mysteryDemo,
      market: "2024 Mistery Fast Filler Demo retail siblings",
      validFrom: "2024-01-01",
      productionState: "current",
      nibScope: "Separate steel and 14K Demo retail pages; neither supplies exact SPP6901/943 identity.",
      editionScope: "One-turn/seven-part descriptions and sample dimensions stay with Demo siblings.",
    },
    {
      key: mysteryOlder,
      scopeKey: mysteryOlder,
      market: "2019 and older Mystery Filler demonstrator generation",
      validFrom: "2019-01-01",
      productionState: "historical",
      nibScope: "14K soft M appears in one 2019 LE 66/888 resale record.",
      editionScope: "LE 66/888 and older piston-lock details are historical, not current SPP6901/943 fields.",
    },
  ],
  claims: [
    {
      key: "phase590-pineider-mystery-identity",
      predicate: "model_identity",
      objectText: "Mystery Fast Filler SPP6901/943 is the exact current entity; the official collection's Mistery spelling is an alias rather than a second model.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: mystery.official.key,
      locator: mystery.official.summary,
      evidence: [
        { key: "phase590-mystery-identity-product-evidence", sourceKey: mystery.official.key, scopeKey: mysteryCurrent, locator: mystery.official.summary },
        { key: "phase590-mystery-identity-collection-evidence", sourceKey: mystery.collection.key, scopeKey: mysteryCurrent, locator: mystery.collection.summary },
      ],
    },
    {
      key: "phase590-pineider-mystery-current-configuration",
      predicate: "current_configuration",
      objectText: "Current SPP6901/943 is 155 mm by 15.45 mm, made in Italy, offers F/EF, a protected fast-filling mechanism and Twist Magnetic Lock; the official page does not publish nib metal or body material.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: mystery.official.key,
      locator: mystery.official.summary,
      evidence: [{ key: "phase590-mystery-current-evidence", sourceKey: mystery.official.key, scopeKey: mysteryCurrent, locator: mystery.official.summary }],
    },
    {
      key: "phase590-pineider-mystery-version-boundary",
      predicate: "version_boundary",
      objectText: "Steel-F SKU SPP6901F435, 2024 Demo steel/14K pages and 2019 Mystery Filler LE records remain scoped evidence and do not fill unknown current fields.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: mystery.stixis.key,
      locator: mystery.stixis.summary,
      evidence: [
        { key: "phase590-mystery-steel-sku-evidence", sourceKey: mystery.stixis.key, scopeKey: mysterySku, locator: mystery.stixis.summary },
        { key: "phase590-mystery-demo-14k-evidence", sourceKey: mystery.demoGold.key, scopeKey: mysteryDemo, locator: mystery.demoGold.summary },
        { key: "phase590-mystery-older-evidence", sourceKey: mystery.peytonStreet.key, scopeKey: mysteryOlder, locator: mystery.peytonStreet.summary },
      ],
    },
  ],
  variants: [
    {
      key: "phase590-pineider-mystery-current-product",
      name: "Mystery Fast Filler SPP6901 / 943",
      notes: "Exact current identity with F/EF selector and no universal nib-metal claim.",
      sourceKey: mystery.official.key,
      variantKind: "market_sku",
      productCode: "SPP6901 / 943",
      market: "global",
    },
    {
      key: "phase590-pineider-mystery-steel-f-sku",
      name: "Mistery Fast Filler Green / Black trims / steel F",
      notes: "Full retail SKU SPP6901F435; evidence remains SKU-specific.",
      sourceKey: mystery.stixis.key,
      variantKind: "market_sku",
      productCode: "SPP6901F435",
      market: "European retail",
    },
    {
      key: "phase590-pineider-mystery-demo-siblings",
      name: "Mistery Fast Filler Demo steel and 14K siblings",
      releaseYear: "2024",
      notes: "Retail siblings with different nib metals and measurements; no exact SPP6901/943 anchor.",
      sourceKey: mystery.demoGold.key,
      variantKind: "edition_group",
      market: "United States retail",
    },
    {
      key: "phase590-pineider-mystery-2019-generation",
      name: "Mystery Filler LE demonstrator generation",
      releaseYear: "2019",
      notes: "Historical LE 66/888 record with 14K soft M and older piston-lock language.",
      sourceKey: mystery.peytonStreet.key,
      variantKind: "edition_group",
      market: "historical resale",
    },
  ],
  spec: {
    brandEntityId: PHASE590_PINEIDER_BRAND_ID,
    values: {
      series_name: "Pineider Mystery Fast Filler Fountain Pen SPP6901/943; Mistery retained as official collection alias",
      origin_country: "Italy for current SPP6901/943 product scope",
      nib: "Current official selector F/EF; nib metal unpublished and intentionally not inferred",
      fill_system: "Fast filling mechanism with protection against accidental piston activation",
      material: "Current official SPP6901/943 page does not publish body material; no material asserted",
      dimensions: "Official current product: 155 mm length and 15.45 mm diameter; measurement convention not stated",
      weight: "Current official SPP6901/943 page does not publish a weight; no numeric weight asserted",
      status: "Current SPP6901/943 product verified 2026-08-11; stock, colour and price vary",
    },
    evidence: [
      specEvidence("brand_entity_id", "phase590-mystery-spec-brand", mystery.official.key, mysteryCurrent, "official exact-product identity"),
      specEvidence("series_name", "phase590-mystery-spec-series-product", mystery.official.key, mysteryCurrent, "exact product uses Mystery Fast Filler"),
      specEvidence("series_name", "phase590-mystery-spec-series-alias", mystery.collection.key, mysteryCurrent, "official collection uses Mistery Fast Filler"),
      specEvidence("origin_country", "phase590-mystery-spec-origin", mystery.official.key, mysteryCurrent, "Origin Italy"),
      specEvidence("nib", "phase590-mystery-spec-nib-widths", mystery.official.key, mysteryCurrent, "current F/EF selector; nib metal not published"),
      specEvidence("nib", "phase590-mystery-rejected-sku-steel-nib", mystery.stixis.key, mysterySku, "steel F belongs only to SPP6901F435", false),
      specEvidence("nib", "phase590-mystery-rejected-demo-14k-nib", mystery.demoGold.key, mysteryDemo, "14K belongs to a Demo sibling without exact SPP6901/943 anchor", false),
      specEvidence("fill_system", "phase590-mystery-spec-fill", mystery.official.key, mysteryCurrent, "quick mechanism and accidental activation protection"),
      specEvidence("fill_system", "phase590-mystery-rejected-demo-turn-count", mystery.demoSteel.key, mysteryDemo, "one-turn/seven-part detail is retained only for Demo sibling", false),
      specEvidence("material", "phase590-mystery-spec-material-unpublished", mystery.official.key, mysteryCurrent, "current product page omits body material; no value inferred"),
      specEvidence("dimensions", "phase590-mystery-spec-dimensions", mystery.official.key, mysteryCurrent, "155 mm and diameter 15.45 mm"),
      specEvidence("dimensions", "phase590-mystery-rejected-demo-dimensions", mystery.demoGold.key, mysteryDemo, "154.4 mm retail sample belongs to Demo 14K sibling", false),
      specEvidence("dimensions", "phase590-mystery-rejected-old-dimensions", mystery.oldMystery.key, mysteryOlder, "152.4 by 15.9 mm belongs to the older Mystery Filler generation", false),
      specEvidence("weight", "phase590-mystery-spec-weight-unpublished", mystery.official.key, mysteryCurrent, "official page publishes no weight; no number asserted"),
      specEvidence("status", "phase590-mystery-spec-status", mystery.official.key, mysteryCurrent, "current exact-product retrieval window"),
    ],
  },
  timeline: [
    {
      key: "phase590-pineider-mystery-2019-archive",
      title: "Earlier Mystery Filler LE generation documented",
      eventType: "design_milestone",
      startDate: "2019-01-01",
      circa: true,
      description: "A resale archive records LE 66/888, 14K soft M and the earlier piston-lock presentation.",
      sourceKey: mystery.peytonStreet.key,
    },
    {
      key: "phase590-pineider-mystery-current-verified",
      title: "Current SPP6901/943 product verified",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description: "Retrieval date marks current-page verification, not a launch date.",
      sourceKey: mystery.official.key,
    },
  ],
  conflicts: [
    {
      key: "phase590-pineider-mystery-spelling-conflict",
      fieldKey: "series_name",
      scopeKey: mysteryCurrent,
      conflictKind: "identity",
      status: "resolved",
      resolutionNote: "The exact SPP6901/943 product page supplies canonical Mystery. Pineider's collection spelling Mistery remains a searchable alias.",
      members: [
        { citationKey: "phase590-mystery-spec-series-product", assertedValue: "Mystery Fast Filler" },
        { citationKey: "phase590-mystery-spec-series-alias", assertedValue: "Mistery Fast Filler" },
      ],
    },
    {
      key: "phase590-pineider-mystery-nib-scope-conflict",
      fieldKey: "nib",
      scopeKey: mysteryCurrent,
      conflictKind: "field",
      status: "resolved",
      resolutionNote: "F/EF is current exact-page evidence. Steel F is SKU-specific and 14K is a Demo sibling, so neither metal becomes a universal field.",
      members: [
        { citationKey: "phase590-mystery-spec-nib-widths", assertedValue: "current F/EF; metal unpublished" },
        { citationKey: "phase590-mystery-rejected-sku-steel-nib", assertedValue: "SPP6901F435 steel F only" },
        { citationKey: "phase590-mystery-rejected-demo-14k-nib", assertedValue: "2024 Demo sibling 14K" },
      ],
    },
  ],
  media: [
    {
      key: "phase590-pineider-mystery-primary",
      title: "Pineider Mystery Fast Filler SPP6901／943 版本边界图（非产品照片）",
      sourceKey: mystery.diagram.key,
      localPath: mystery.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创事实示意图；非产品照片，不表示真实颜色、外形、纹理、比例、商标、笔尖、机构或库存。",
      sourceUrl: mystery.diagram.url,
      usageStatus: "primary",
    },
  ],
};

function mergeSources(base: readonly CuratedSource[], extras: readonly CuratedSource[]): CuratedSource[] {
  const byKey = new Map(base.map((source) => [source.key, source]));
  for (const source of extras) {
    const previous = byKey.get(source.key);
    if (previous && JSON.stringify(previous) !== JSON.stringify(source)) {
      throw new Error(`Phase 590 conflicting source definition: ${source.key}.`);
    }
    byKey.set(source.key, source);
  }
  return [...byKey.values()];
}

const brandScope = phase589PineiderBrandPack.scopes[0]?.scopeKey;
if (!brandScope) throw new Error("Phase 590 Pineider brand pack requires a canonical scope.");

export const phase590PineiderBrandPack: CuratedEntityPack = {
  ...phase589PineiderBrandPack,
  key: "phase590-pineider-brand-depth-refresh-v1",
  markdownFile: ".planning/content-research/pineider-brand-phase590.md",
  storyTitle: "Pineider：七个公开型号入口与不可跨型号继承的规格边界",
  publicationIntent: "publish",
  publicationBlockers: [],
  sources: mergeSources(phase589PineiderBrandPack.sources, [
    common.collections,
    forged.official,
    forged.penBoutique,
    forged.penChalet,
    forged.yafa,
    mystery.official,
    mystery.collection,
    mystery.magazine,
    mystery.stixis,
    mystery.demoSteel,
    mystery.demoGold,
    mystery.oldMystery,
    mystery.peytonStreet,
  ]),
  claims: [
    ...phase589PineiderBrandPack.claims,
    {
      key: "phase590-pineider-brand-seven-model-navigation",
      predicate: "series_navigation",
      objectText: "Pineider Avatar UR, Arco, Rock, Classic Palladium, Tempi Moderni, Grande Bellezza Forged Carbon and Mystery Fast Filler are seven separate public model nodes; specifications and historical variants remain scoped to their exact identities.",
      factClass: "core",
      confidence: 0.99,
      sourceKey: common.collections.key,
      locator: common.collections.summary,
      evidence: [
        { key: "phase590-pineider-brand-seven-model-navigation-evidence", sourceKey: common.collections.key, scopeKey: brandScope, locator: common.collections.summary },
        { key: "phase590-pineider-brand-forged-navigation-evidence", sourceKey: forged.official.key, scopeKey: brandScope, locator: forged.official.summary },
        { key: "phase590-pineider-brand-mystery-navigation-evidence", sourceKey: mystery.official.key, scopeKey: brandScope, locator: mystery.official.summary },
      ],
    },
  ],
};

export const phase590PineiderPacks: CuratedEntityPack[] = [
  phase590PineiderBrandPack,
  phase590PineiderForgedCarbonPack,
  phase590PineiderMysteryFastFillerPack,
];

if (
  phase590PineiderPacks.length !== 3 ||
  new Set(phase590PineiderPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 590 must contain one brand and two unique model packs.");
}
