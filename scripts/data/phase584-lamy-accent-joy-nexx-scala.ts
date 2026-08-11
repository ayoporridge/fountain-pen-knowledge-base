import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE426_BRAND_IDS,
  phase426BrandDepthRefreshPacks,
} from "./phase426-brand-depth-refresh";

export const PHASE584_LAMY_BRAND_ID = PHASE426_BRAND_IDS.lamy;
export const PHASE584_IDS = {
  accent: "phase584-lamy-accent",
  joy: "phase584-lamy-joy",
  nexx: "phase584-lamy-nexx",
  scala: "phase584-lamy-scala",
} as const;

export const PHASE584_SLUGS = {
  accent: "lamy-accent",
  joy: "lamy-joy",
  nexx: "lamy-nexx",
  scala: "lamy-scala",
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

function lamyOfficial(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  itemType?: string;
  publishedAt?: string;
}): CuratedSource {
  return web({
    ...input,
    registryKey: "lamy-official-phase584",
    registryName: "C. Josef Lamy GmbH",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "lamy-official",
    homepageUrl: "https://www.lamy.com/",
    author: "C. Josef Lamy GmbH",
  });
}

function editorial(
  key: keyof typeof PHASE584_IDS,
  title: string,
): CuratedSource {
  const localPath = `/images/library/site-original/phase584/lamy/lamy-${key}.svg`;
  return {
    key: `phase584-lamy-${key}-diagram`,
    registryKey: `fountain-pen-graph-editorial-phase584-${key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase584-${key}`,
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "本站原创事实示意图，非产品照片；不复刻品牌标识、真实颜色、表面或比例。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;dimensions=1600x900`,
  };
}

function specEvidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

const common = {
  nibGuide: lamyOfficial({
    key: "phase584-lamy-nib-guide",
    title: "LAMY fountain pen nib guide",
    url: "https://www.lamy.com/en-gb/lamy-fountain-pen-nib-guide",
    summary:
      "官方区分 A、LH、常规圆尖、斜尖、书法平口尖以及钢／金材料，并说明除 LAMY 2000 外的可换尖边界。",
    locator:
      "lines 243-265, 338-419: nib categories, A/LH meanings, straight/oblique/italic cuts, steel/gold materials and LAMY 2000 exception",
  }),
  care: lamyOfficial({
    key: "phase584-lamy-fountain-pen-care",
    title: "LAMY care tips: Fountain Pens",
    url: "https://www.lamy.com/en-gb/care-tips/fountain-pens",
    summary:
      "官方护理入口分别提供换墨囊、converter filling 与 converter cleaning，不支持用溶剂或把完整笔体长期浸泡。",
    locator:
      "lines 378-419: changing cartridges, filling converters and converter cleaning/care sections",
  }),
};

const accent = {
  official: lamyOfficial({
    key: "phase584-lamy-accent-official",
    title: "LAMY accent Fountain Pen brillant-ld",
    url: "https://www.lamy.com/es-us/p/lamy-accent-fountain-pen/50723081847118",
    summary:
      "地区官方页列四种配置、可换握位、弹簧夹、旋帽、当前钢尖／T10／Z27 说明及 12×12×143 mm、26 g、4000649。",
    locator:
      "lines 336-428: selected brillant-ld, four model colors, B/EF/F/OB/OM/M, item 4000649, interchangeable grip, spring clip, screw cap, steel nib, T10/Z27, Andreas Haug, 143 mm and 26 g",
  }),
  review2023: web({
    key: "phase584-lamy-accent-penaddict-2023",
    registryKey: "penaddict-phase584-accent",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "penaddict",
    title: "Lamy Accent - A Quick Review",
    url: "https://www.penaddict.com/blog/2023/5/26/lamy-accent-a-quick-review",
    homepageUrl: "https://www.penaddict.com/",
    author: "Kimberly Lau",
    publishedAt: "2023-05-26",
    summary:
      "作者披露样笔和握位均自行购买，记录细杆、可换握位、Z26/Z27、后插重心与美国渠道差异；只作为样笔经验。",
    locator:
      "review sections around lines 918-969: grip swap, slim body, posting balance, Z26/Z27 and self-purchased disclosure",
  }),
  review2015: web({
    key: "phase584-lamy-accent-hedley-2015",
    registryKey: "ian-hedley-phase584-accent",
    registryName: "Ian Hedley Art / Pen Paper Pencil archive",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "ian-hedley",
    title: "Lamy Accent Fountain Pen Review",
    url: "https://penpaperpencil.net/lamy-accent-fountain-pen-review/",
    homepageUrl: "https://penpaperpencil.net/",
    author: "Ian Hedley",
    publishedAt: "2015-09-21",
    summary:
      "获赠 palladium／木质握位样本记录 proprietary C/C、旋帽、后插和握持感；钢尖及不舒适评价只属于该样本。",
    locator:
      "lines 30-65: review date, exact palladium/wood sample, converter, screw cap, posting, personal grip experience and supplied-review disclosure",
  }),
  diagram: editorial("accent", "LAMY accent 可更换握位与尖材边界示意"),
};

const joy = {
  official: lamyOfficial({
    key: "phase584-lamy-joy-official",
    title: "LAMY joy Fountain Pen",
    url: "https://www.lamy.com/en-us/p/lamy-joy-fountain-pen",
    summary:
      "当前基础款页列 black/strawberry、1.1/1.5/1.9、Safari 式握位、ASA 塑料、T10/Z28、Wolfgang Fabian 以及 178 mm、17 g。",
    locator:
      "lines 252-313: colors, 1.1/1.5/1.9 nibs, Safari-derived ergonomic grip, tapered body, ASA plastic, T10/Z28, designer, size, weight and item L15-19SB",
  }),
  kit: lamyOfficial({
    key: "phase584-lamy-joy-black-kit-official",
    title: "LAMY joy black Fountain Pen set",
    url: "https://www.lamy.com/en-us/p/lamy-joy-black-fountain-pen",
    summary:
      "官方三尖礼盒包含 1.1/1.5/1.9 三个可换尖；页面 385 g 与 210 mm 是套装数据，不能当普通钢笔重量和长度。",
    locator:
      "product description: three interchangeable 1.1/1.5/1.9 nibs, anodised aluminium cap, ASA body, T10/Z28; Data section is package 138×34×210 mm and 385 g",
  }),
  special2023: lamyOfficial({
    key: "phase584-lamy-joy-special-editions-2023",
    title: "Lamy through the year: 2023 Special Editions",
    url: "https://www.lamy.com/fileadmin/user_upload/EN_LAMY_PI_Special_Editions_AL-star_joy_safari_2023-02-03.pdf",
    itemType: "pdf",
    publishedAt: "2023-02-03",
    summary:
      "官方 2023 特别版资料将 joy 放在年度色彩产品线中，证明颜色迭代而不改变书法尖家族身份。",
    locator:
      "2023 special-edition release: LAMY joy seasonal color context and tapered calligraphy design; no universal launch-year claim",
  }),
  review: web({
    key: "phase584-lamy-joy-penaddict-2017",
    registryKey: "penaddict-phase584-joy",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "penaddict",
    title: "Lamy Joy 1.1 mm Calligraphy Fountain Pen: A Review",
    url: "https://www.penaddict.com/blog/2017/10/6/lamy-joy-11-mm-calligraphy-fountain-pen-a-review",
    homepageUrl: "https://www.penaddict.com/",
    author: "Susan M. Pigott; hosted by Brad Dowdy",
    publishedAt: "2017-10-06",
    summary:
      "商家免费提供的黑红 1.1 mm 样笔用于说明轻量、三角握位和单支刮纸体验；主观结论不泛化到全部尖。",
    locator:
      "lines 901-907 and review disclosure: exact 1.1 mm sample, 1.1/1.5/1.9 family, light body, grip preference, sample scratchiness and no-charge disclosure",
  }),
  diagram: editorial("joy", "LAMY joy 1.1／1.5／1.9 书法尖事实示意"),
};

const nexx = {
  official: lamyOfficial({
    key: "phase584-lamy-nexx-official",
    title: "LAMY nexx Fountain Pen lime",
    url: "https://www.lamy.com/en-us/p/lamy-nexx-fountain-pen",
    summary:
      "当前 lime 页列 A/M/LH、软防滑握位、塑料帽、三角阳极铝杆、T10/Z28、Andreas Haug 以及 150 mm、23 g、4000600。",
    locator:
      "lines 251-315: standard/special colors, A/M/LH, soft rubberised grip, reinforced plastic cap, triangular anodised aluminium body, T10/Z28, designer, size, weight and item 4000600",
  }),
  harryPotter: lamyOfficial({
    key: "phase584-lamy-nexx-harry-potter-official",
    title: "LAMY nexx Harry Potter Fountain Pen",
    url: "https://www.lamy.com/en-us/p/lamy-nexx-harry-potter-fountain-pen",
    summary:
      "官方联名页把四学院配色放在 nexx 基础结构下；图案、尖型和包装属于联名 SKU，不建立四个结构型号。",
    locator:
      "special-edition selector and product description: Gryffindor, Hufflepuff, Ravenclaw, Slytherin on nexx aluminium/rubber-grip platform",
  }),
  review: web({
    key: "phase584-lamy-nexx-m-pen-company-2015",
    registryKey: "the-pen-company-phase584-nexx",
    registryName: "The Pen Company Blog",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pen-company",
    title: "Lamy Nexx M Fountain Pen Review",
    url: "https://www.thepencompany.com/blog/pens/fountain-pens/lamy-nexx-m-fountain-pen/",
    homepageUrl: "https://www.thepencompany.com/",
    author: "Paul Wernick",
    publishedAt: "2015-08-05",
    summary:
      "获赠 nexx M 样笔记录橡胶握位、铝杆、标准钢尖和旧 Z24 名称，并明确 nexx M 与标准 nexx 帽夹差异。",
    locator:
      "lines 20-35 and article introduction: exact Nexx M sample, rubber grip, aluminium body, steel nib, historical Z24 and cap/clip sibling boundary",
  }),
  diagram: editorial("nexx", "LAMY nexx 三角铝杆与软握位事实示意"),
};

const scala = {
  steel: lamyOfficial({
    key: "phase584-lamy-scala-black-steel-official",
    title: "LAMY scala Fountain Pen black",
    url: "https://www.lamy.com/en-us/p/lamy-scala-fountain-pen/50723088040270",
    summary:
      "当前 black 4000559 页写全金属、实心夹、抛光金属握位、哑黑漆、抛光钢尖、T10/Z27、sieger design、140 mm 与 38 g。",
    locator:
      "lines 251-308: black/brushed/pianoblack/pianored, EF/F/M/B, all-metal body, solid clip, polished grip, Heidelberg hand assembly, steel nib, T10/Z27, 140 mm, 38 g and item 4000559",
  }),
  gold: lamyOfficial({
    key: "phase584-lamy-scala-pianoblack-gold-official",
    title: "LAMY scala Fountain Pen pianoblack",
    url: "https://www.lamy.com/en-us/p/lamy-scala-fountain-pen/50723088105806",
    summary:
      "当前 pianoblack 页面写亮黑漆面、部分镀铂 14K 双色金尖、T10/Z27，并保持 140 mm、38 g 外形锚点。",
    locator:
      "current product configuration: shiny black lacquer, partially platinum-plated 14 ct bi-colour gold nib, T10/Z27; Data 12×12×140 mm and 38 g",
  }),
  catalog2023: lamyOfficial({
    key: "phase584-lamy-scala-catalog-2023",
    title: "LAMY Premium Business Gifts 2023 — scala",
    url: "https://www.lamy.com/fileadmin/redaktion/Services/Download-Dokumente/LAMY_PP-Katalog_2023_P164_EN_RZ1001_LOW1.pdf",
    itemType: "pdf",
    publishedAt: "2023-01-01",
    summary:
      "官方目录把 079 列为 gold nib、080/051 列为 steel nib，并说明不锈钢、哑黑漆、拉丝与高光饰面。",
    locator:
      "PDF lines 799-821 / page 67: scala model 079 gold nib, 080/051 steel nib, stainless-steel/lacquer finishes, solid spring clip and Sieger Design",
  }),
  jade2023: lamyOfficial({
    key: "phase584-lamy-scala-majestic-jade-2023",
    title: "Limited, numbered special edition: LAMY scala majestic jade",
    url: "https://www.lamy.com/fileadmin/user_upload/EN_PI_LAMY_scala_majestic_jade_EN.pdf",
    itemType: "pdf",
    publishedAt: "2023-08-01",
    summary:
      "官方新闻稿记录 2023 Majestic Jade 限量 1,500 支、编号笔夹、漆面不锈钢、14K F 尖及配套 converter／墨水。",
    locator:
      "August 2023 press release: 1,500 numbered pieces, lacquered stainless steel, platinum-plated clip, 14K F nib, converter and ink set",
  }),
  nibReview: web({
    key: "phase584-lamy-scala-penboutique-nib-guide-2026",
    registryKey: "pen-boutique-phase584-scala",
    registryName: "Pen Boutique",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-boutique",
    title: "A Complete Guide to LAMY's Interchangeable Nibs",
    url: "https://www.penboutique.com/blogs/blog/a-complete-guide-to-all-of-lamys-interchangeable-nibs",
    homepageUrl: "https://www.penboutique.com/",
    author: "Pen Boutique editorial",
    publishedAt: "2026-04-01",
    summary:
      "独立零售指南把 standard scala 的 Z50 钢尖与 Piano Black／Piano Red 等 premium Z55 14K 配置分开。",
    locator:
      "lines 303-310: Z55 14K on premium Scala Piano Black/Piano Red and limited editions; standard Scala uses Z50 stainless steel",
  }),
  diagram: editorial("scala", "LAMY scala 钢尖与 14K 金尖配置分流示意"),
};

const accentCurrent = "phase584-accent-current-regional-2026-08-11";
const accentSample = "phase584-accent-sample-2023";
export const phase584LamyAccentPack: CuratedEntityPack = {
  key: "phase584-lamy-accent-v1",
  entityId: PHASE584_IDS.accent,
  expectedType: "pen",
  expectedSlug: PHASE584_SLUGS.accent,
  canonicalName: "LAMY accent",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/lamy-accent-phase584.md",
  storyTitle: "LAMY accent：可更换握位、钢尖与金尖版本怎样分开",
  primarySourceKey: accent.official.key,
  depthTier: "A",
  aliases: [
    { alias: "LAMY Accent", language: "en", sourceKey: accent.official.key },
    { alias: "凌美 accent", language: "zh", sourceKey: accent.official.key },
  ],
  sources: [accent.official, common.nibGuide, common.care, accent.review2023, accent.review2015, accent.diagram],
  scopes: [
    {
      key: accentCurrent,
      scopeKey: accentCurrent,
      market: "LAMY es-US regional shop at retrieval",
      productionState: "current",
      nibScope: "Selected page copy says polished steel; B/EF/F/OB/OM/M availability is option-dependent.",
      materialScope: "Selected page copy says aluminium colour and interchangeable rubber grip; other listed finishes require their own SKU.",
      editionScope: "4000649, 143 mm and 26 g bind only to the retrieved page state.",
    },
    {
      key: accentSample,
      scopeKey: accentSample,
      market: "2023 reviewer-owned sample and grips",
      productionState: "historical",
      nibScope: "Sample nib and replacement observations are not a current catalog guarantee.",
      materialScope: "Palladium/wood/rubber grip experience belongs to reviewed pieces.",
      editionScope: "US availability and posting balance are dated sample/market observations.",
    },
  ],
  claims: [
    {
      key: "phase584-accent-identity",
      predicate: "model_identity",
      objectText: "LAMY accent 以可更换握位、弹簧笔夹和旋帽结构构成独立型号；握位材料变化属于配置，不另建型号。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: accent.official.key,
      locator: "official lines 338-393",
      evidence: [{ key: "phase584-accent-identity-official", sourceKey: accent.official.key, scopeKey: accentCurrent, locator: "lines 338-393: interchangeable grip, spring clip and screw cap" }],
    },
    {
      key: "phase584-accent-variant-boundary",
      predicate: "variant_boundary",
      objectText: "4000649 页面所示钢尖、橡胶握位、143 mm 与 26 g 不覆盖历史金尖、木质握位或其它饰面。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: accent.official.key,
      locator: "official lines 352-428",
      evidence: [
        { key: "phase584-accent-current-config", sourceKey: accent.official.key, scopeKey: accentCurrent, locator: "lines 352-428: listed options, selected copy and data" },
        { key: "phase584-accent-review-config", sourceKey: accent.review2023.key, scopeKey: accentSample, locator: "2023 purchased sample, grip swap and market availability" },
      ],
    },
    {
      key: "phase584-accent-use-boundary",
      predicate: "handling_boundary",
      objectText: "细杆、木质或橡胶握位和后插重心需实际试写；两篇评测的舒适度只代表各自样本与手型。",
      factClass: "editorial",
      confidence: 0.94,
      sourceKey: accent.review2015.key,
      locator: "review lines 46-51",
      evidence: [
        { key: "phase584-accent-use-2015", sourceKey: accent.review2015.key, scopeKey: accentSample, locator: "lines 46-51: sample posting and wood-grip comfort" },
        { key: "phase584-accent-use-2023", sourceKey: accent.review2023.key, scopeKey: accentSample, locator: "review neutral/cons: slim body and posting balance" },
      ],
    },
  ],
  variants: ["silver-black", "brillant-by", "silver-wood", "brillant-ld"].map((name, index) => ({
    key: `phase584-accent-option-${index}`,
    name,
    notes: "2026-08-11 地区官网选择器所列配置；握位、尖材、重量和包装仍按具体商品页核对。",
    sourceKey: accent.official.key,
    variantKind: "market_sku" as const,
    market: "regional LAMY shop",
  })),
  spec: {
    brandEntityId: PHASE584_LAMY_BRAND_ID,
    values: {
      series_name: "LAMY accent（可更换握位系列）",
      release_year: "官方当前页未列系列首发年；2015 与 2023 有不同配置的独立样本",
      nib: "4000649 页面配置为抛光钢尖；B/EF/F/M/OB/OM 及历史金尖按 SKU",
      fill_system: "LAMY T10 墨囊／Z27 上墨器",
      material: "当前所示为金属笔身与可换橡胶握位；木质和装饰握位按配置",
      dimensions: "当前 4000649 页面：12 × 12 × 143 mm",
      weight: "当前 4000649 页面：26 g",
      status: "地区 LAMY 官方目录在列；颜色、尖材与库存随市场",
    },
    evidence: [
      specEvidence("brand_entity_id", "phase584-accent-brand", accent.official.key, accentCurrent, "LAMY official product identity"),
      specEvidence("series_name", "phase584-accent-series", accent.official.key, accentCurrent, "title and interchangeable-grip product description"),
      specEvidence("release_year", "phase584-accent-history", accent.review2015.key, accentSample, "2015 dated exact sample; no launch-year assertion"),
      specEvidence("nib", "phase584-accent-nib", accent.official.key, accentCurrent, "lines 359-365 and 393: option list and selected steel nib copy"),
      specEvidence("fill_system", "phase584-accent-fill", accent.official.key, accentCurrent, "line 393: T10 and Z27"),
      specEvidence("material", "phase584-accent-material", accent.official.key, accentCurrent, "lines 352-357 and 392-393: finishes and interchangeable grip"),
      specEvidence("dimensions", "phase584-accent-dimensions", accent.official.key, accentCurrent, "line 426: 12×12×143 mm"),
      specEvidence("weight", "phase584-accent-weight", accent.official.key, accentCurrent, "line 427: 26 g"),
      specEvidence("status", "phase584-accent-status", accent.official.key, accentCurrent, "lines 369-385: item and regional availability at retrieval"),
    ],
  },
  timeline: [
    { key: "phase584-accent-2015-sample", title: "木质握位独立样本", eventType: "community_event", startDate: "2015-09-21", circa: false, description: "独立评测记录 palladium／木质握位样本；不作为系列首发日期。", sourceKey: accent.review2015.key },
    { key: "phase584-accent-current", title: "地区官方目录复核", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "四种配置、可换握位、当前页面规格和地区可售状态重新核对。", sourceKey: accent.official.key },
  ],
  media: [{ key: "phase584-accent-primary", title: "LAMY accent 可更换握位事实示意（非产品照片）", sourceKey: accent.diagram.key, localPath: accent.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创示意图，非产品照片；不代表真实比例、颜色、Logo、握位材料、笔尖或库存。", sourceUrl: accent.diagram.url, usageStatus: "primary" }],
};

const joyCurrent = "phase584-joy-current-base-2026-08-11";
const joySample = "phase584-joy-sample-2017";
export const phase584LamyJoyPack: CuratedEntityPack = {
  key: "phase584-lamy-joy-v1",
  entityId: PHASE584_IDS.joy,
  expectedType: "pen",
  expectedSlug: PHASE584_SLUGS.joy,
  canonicalName: "LAMY joy",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/lamy-joy-phase584.md",
  storyTitle: "LAMY joy：1.1、1.5、1.9 mm 平口尖怎样选择与维护",
  primarySourceKey: joy.official.key,
  depthTier: "A",
  aliases: [
    { alias: "LAMY Joy", language: "en", sourceKey: joy.official.key },
    { alias: "凌美 joy", language: "zh", sourceKey: joy.official.key },
  ],
  sources: [joy.official, joy.kit, joy.special2023, common.nibGuide, common.care, joy.review, joy.diagram],
  scopes: [
    { key: joyCurrent, scopeKey: joyCurrent, market: "US current base joy page", productionState: "current", nibScope: "Polished steel calligraphy nibs 1.1/1.5/1.9.", materialScope: "Base selected SKU uses ASA plastic cap/body and ergonomic grip.", editionScope: "L15-19SB, 178 mm and 17 g bind to the base page; joy AL and gift set are adjacent configurations." },
    { key: joySample, scopeKey: joySample, market: "2017 no-charge review sample", productionState: "historical", nibScope: "One 1.1 mm sample's scratchiness is not a family guarantee.", materialScope: "Black resin/red-accent sample only.", editionScope: "Grip preference and price belong to the dated sample." },
  ],
  claims: [
    { key: "phase584-joy-identity", predicate: "model_identity", objectText: "LAMY joy 是以 1.1、1.5、1.9 mm 平口钢尖、Safari 式握位和长尾笔身组成的书法钢笔。", factClass: "core", confidence: 0.99, sourceKey: joy.official.key, locator: "official lines 252-294", evidence: [{ key: "phase584-joy-identity-official", sourceKey: joy.official.key, scopeKey: joyCurrent, locator: "lines 252-294: nib sizes, calligraphy purpose, grip, body and designer" }] },
    { key: "phase584-joy-kit-boundary", predicate: "variant_boundary", objectText: "joy black 三尖套装的 385 g／210 mm 是礼盒数据，不是基础 joy 单笔重量和长度；joy AL 也有不同帽材。", factClass: "core", confidence: 0.99, sourceKey: joy.kit.key, locator: "kit description and Data section", evidence: [
      { key: "phase584-joy-base-data", sourceKey: joy.official.key, scopeKey: joyCurrent, locator: "base page lines 309-313: 178 mm, 17 g, L15-19SB" },
      { key: "phase584-joy-kit-data", sourceKey: joy.kit.key, scopeKey: joyCurrent, locator: "three-nib set description and package 138×34×210 mm, 385 g" },
    ] },
    { key: "phase584-joy-sample-boundary", predicate: "sample_experience_boundary", objectText: "2017 年 1.1 mm 样笔的刮纸和三角握位偏好只属于获赠样本，不能推断全部 joy。", factClass: "core", confidence: 0.96, sourceKey: joy.review.key, locator: "2017 review pros/cons and disclosure", evidence: [{ key: "phase584-joy-sample-review", sourceKey: joy.review.key, scopeKey: joySample, locator: "exact 1.1 mm sample, scratchiness, grip preference and no-charge disclosure" }] },
  ],
  variants: [
    { key: "phase584-joy-black", name: "black base joy", notes: "基础 ASA 塑料款颜色；尖宽另选。", sourceKey: joy.official.key, variantKind: "color", market: "US" },
    { key: "phase584-joy-strawberry", name: "strawberry base joy", notes: "当前基础款颜色；L15-19SB 页面数据绑定此 SKU。", sourceKey: joy.official.key, variantKind: "color", market: "US" },
    { key: "phase584-joy-three-nib-kit", name: "joy black three-nib set", notes: "含 1.1/1.5/1.9 三个尖；套装尺寸重量不进入单笔规格。", sourceKey: joy.kit.key, variantKind: "edition_group", market: "US" },
  ],
  spec: {
    brandEntityId: PHASE584_LAMY_BRAND_ID,
    values: {
      series_name: "LAMY joy base calligraphy fountain pen",
      release_year: "官方当前页未列首发年；2017 有独立 1.1 mm 样本，2023 有官方特别版资料",
      nib: "抛光钢制平口书法尖：1.1、1.5、1.9 mm",
      fill_system: "LAMY T10 墨囊／Z28 上墨器",
      material: "当前基础款为 ASA 塑料帽与笔身、人体工学握位；joy AL／礼盒另核",
      dimensions: "当前 L15-19SB 基础款：12 × 12 × 178 mm",
      weight: "当前 L15-19SB 基础款：17 g；385 g 为三尖礼盒",
      status: "LAMY 当前基础款目录在列；颜色、尖幅和套装随地区",
    },
    evidence: [
      specEvidence("brand_entity_id", "phase584-joy-brand", joy.official.key, joyCurrent, "LAMY official product identity"),
      specEvidence("series_name", "phase584-joy-series", joy.official.key, joyCurrent, "title and calligraphy product description"),
      specEvidence("release_year", "phase584-joy-history", joy.special2023.key, joyCurrent, "2023 official special-edition context; no launch-year assertion"),
      specEvidence("nib", "phase584-joy-nib", joy.official.key, joyCurrent, "lines 263-287: 1.1/1.5/1.9 polished steel calligraphy nibs"),
      specEvidence("fill_system", "phase584-joy-fill", joy.official.key, joyCurrent, "line 287: T10 and recommended Z28"),
      specEvidence("material", "phase584-joy-material", joy.official.key, joyCurrent, "line 287: ASA plastic cap and body"),
      specEvidence("dimensions", "phase584-joy-dimensions", joy.official.key, joyCurrent, "line 311: 12×12×178 mm"),
      specEvidence("weight", "phase584-joy-weight", joy.official.key, joyCurrent, "line 312: 17 g; kit source rejects 385 g as pen weight"),
      specEvidence("status", "phase584-joy-status", joy.official.key, joyCurrent, "lines 252-283: current colors and availability at retrieval"),
    ],
  },
  timeline: [
    { key: "phase584-joy-review-2017", title: "1.1 mm 独立样笔记录", eventType: "community_event", startDate: "2017-10-06", circa: false, description: "记录一支获赠 1.1 mm 样笔；不作为首发日期或全系写感。", sourceKey: joy.review.key },
    { key: "phase584-joy-special-2023", title: "joy 进入 2023 特别版计划", eventType: "model_released", startDate: "2023-02-03", circa: false, description: "官方年度特别版资料确认 joy 的颜色迭代。", sourceKey: joy.special2023.key },
  ],
  media: [{ key: "phase584-joy-primary", title: "LAMY joy 平口书法尖事实示意（非产品照片）", sourceKey: joy.diagram.key, localPath: joy.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创示意图，非产品照片；不代表真实比例、颜色、Logo、笔尖造型、包装或库存。", sourceUrl: joy.diagram.url, usageStatus: "primary" }],
};

const nexxCurrent = "phase584-nexx-current-base-2026-08-11";
const nexxMSample = "phase584-nexx-m-sample-2015";
export const phase584LamyNexxPack: CuratedEntityPack = {
  key: "phase584-lamy-nexx-v1",
  entityId: PHASE584_IDS.nexx,
  expectedType: "pen",
  expectedSlug: PHASE584_SLUGS.nexx,
  canonicalName: "LAMY nexx",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/lamy-nexx-phase584.md",
  storyTitle: "LAMY nexx：三角铝杆、软握位与 nexx M 的边界",
  primarySourceKey: nexx.official.key,
  depthTier: "A",
  aliases: [
    { alias: "LAMY Nexx", language: "en", sourceKey: nexx.official.key },
    { alias: "凌美 nexx", language: "zh", sourceKey: nexx.official.key },
  ],
  sources: [nexx.official, nexx.harryPotter, common.nibGuide, common.care, nexx.review, nexx.diagram],
  scopes: [
    { key: nexxCurrent, scopeKey: nexxCurrent, market: "US current base nexx page", productionState: "current", nibScope: "Current selected page offers A/M/LH polished steel nibs; other regional widths are not assumed.", materialScope: "Rubberised grip, reinforced plastic cap and matt anodised triangular aluminium body.", editionScope: "4000600, 150 mm and 23 g bind to selected lime page; Harry Potter graphics are SKU variants." },
    { key: nexxMSample, scopeKey: nexxMSample, market: "2015 UK nexx M review sample", productionState: "historical", nibScope: "Shop-swapped F and original M belong to the reviewed nexx M.", materialScope: "Nexx M cap/clip construction is not copied to base nexx.", editionScope: "Historical Z24 name and reviewer experience remain dated sibling evidence." },
  ],
  claims: [
    { key: "phase584-nexx-identity", predicate: "model_identity", objectText: "LAMY nexx 由三角阳极铝笔杆、橡胶化软握位、塑料帽和抛光钢尖组成，设计署名 Phönix Product Design／Andreas Haug。", factClass: "core", confidence: 0.99, sourceKey: nexx.official.key, locator: "official lines 291-313", evidence: [{ key: "phase584-nexx-identity-official", sourceKey: nexx.official.key, scopeKey: nexxCurrent, locator: "lines 291-313: construction, positioning, designer, size and weight" }] },
    { key: "phase584-nexx-sibling-boundary", predicate: "related_model_boundary", objectText: "nexx M 与标准 nexx 的帽夹构造不同；2015 nexx M 样本与旧 Z24 名称不能覆盖当前标准 nexx。", factClass: "core", confidence: 0.97, sourceKey: nexx.review.key, locator: "Nexx M review construction/filling sections", evidence: [{ key: "phase584-nexx-m-review", sourceKey: nexx.review.key, scopeKey: nexxMSample, locator: "exact Nexx M sample, cap/clip sibling distinction and historical Z24" }] },
    { key: "phase584-nexx-color-boundary", predicate: "variant_boundary", objectText: "普通色、multiblue／multired 与 Harry Potter 四学院属于颜色或联名配置，不拆成新的结构型号。", factClass: "core", confidence: 0.99, sourceKey: nexx.harryPotter.key, locator: "official standard/special selectors", evidence: [
      { key: "phase584-nexx-base-colors", sourceKey: nexx.official.key, scopeKey: nexxCurrent, locator: "lines 255-268: standard and special colors" },
      { key: "phase584-nexx-hp-colors", sourceKey: nexx.harryPotter.key, scopeKey: nexxCurrent, locator: "four Hogwarts house options on the nexx platform" },
    ] },
  ],
  variants: [
    { key: "phase584-nexx-standard-colors", name: "azure / black / blue / crimson / lime", notes: "当前基础款颜色组；尖型和商品号按所选颜色。", sourceKey: nexx.official.key, variantKind: "edition_group", market: "US" },
    { key: "phase584-nexx-multicolor", name: "multiblue / multired", notes: "官网特别版颜色，不改变 nexx 基础身份。", sourceKey: nexx.official.key, variantKind: "color", market: "US" },
    { key: "phase584-nexx-harry-potter", name: "Harry Potter four-house Special Edition", notes: "四学院图案为联名 SKU；帽图、包装与尖型逐款核对。", sourceKey: nexx.harryPotter.key, variantKind: "edition_group", market: "US" },
  ],
  spec: {
    brandEntityId: PHASE584_LAMY_BRAND_ID,
    values: {
      series_name: "LAMY nexx base fountain pen",
      release_year: "官方当前页未列首发年；2015 有 nexx M sibling 专业样本",
      nib: "当前 lime 页面：抛光钢尖 A、M、LH；其它尖宽按地区 SKU",
      fill_system: "LAMY T10 墨囊／Z28 上墨器",
      material: "橡胶化防滑握位、增强塑料帽、哑光阳极铝三角笔杆",
      dimensions: "当前 lime 4000600：20 × 20 × 150 mm",
      weight: "当前 lime 4000600：23 g",
      status: "LAMY 当前目录在列；普通色、特别色和联名库存随地区",
    },
    evidence: [
      specEvidence("brand_entity_id", "phase584-nexx-brand", nexx.official.key, nexxCurrent, "LAMY official product identity"),
      specEvidence("series_name", "phase584-nexx-series", nexx.official.key, nexxCurrent, "LAMY nexx title and product description"),
      specEvidence("release_year", "phase584-nexx-history", nexx.review.key, nexxMSample, "2015 dated Nexx M sibling sample; no base launch-year assertion"),
      specEvidence("nib", "phase584-nexx-nib", nexx.official.key, nexxCurrent, "lines 270-294: A/M/LH polished steel nib"),
      specEvidence("fill_system", "phase584-nexx-fill", nexx.official.key, nexxCurrent, "line 294: T10 and recommended Z28"),
      specEvidence("material", "phase584-nexx-material", nexx.official.key, nexxCurrent, "lines 292-294: rubberised grip, plastic cap, anodised aluminium body"),
      specEvidence("dimensions", "phase584-nexx-dimensions", nexx.official.key, nexxCurrent, "line 312: 20×20×150 mm"),
      specEvidence("weight", "phase584-nexx-weight", nexx.official.key, nexxCurrent, "line 313: 23 g"),
      specEvidence("status", "phase584-nexx-status", nexx.official.key, nexxCurrent, "lines 255-288: current options and availability"),
    ],
  },
  timeline: [
    { key: "phase584-nexx-m-2015", title: "nexx M 独立样笔记录", eventType: "community_event", startDate: "2015-08-05", circa: false, description: "专业评测记录相邻 nexx M 的帽夹、软握位和旧配件语境。", sourceKey: nexx.review.key },
    { key: "phase584-nexx-current", title: "标准 nexx 当前目录复核", eventType: "design_milestone", startDate: RETRIEVED, circa: false, description: "当前标准款材料、A/M/LH、150 mm 与 23 g 重新核对。", sourceKey: nexx.official.key },
  ],
  media: [{ key: "phase584-nexx-primary", title: "LAMY nexx 三角铝杆与软握位事实示意（非产品照片）", sourceKey: nexx.diagram.key, localPath: nexx.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创示意图，非产品照片；不代表真实比例、颜色、Logo、帽夹、联名图案或库存。", sourceUrl: nexx.diagram.url, usageStatus: "primary" }],
};

const scalaSteel = "phase584-scala-current-black-steel-2026-08-11";
const scalaGold = "phase584-scala-current-pianoblack-gold-2026-08-11";
const scalaJade = "phase584-scala-majestic-jade-2023";
export const phase584LamyScalaPack: CuratedEntityPack = {
  key: "phase584-lamy-scala-v1",
  entityId: PHASE584_IDS.scala,
  expectedType: "pen",
  expectedSlug: PHASE584_SLUGS.scala,
  canonicalName: "LAMY scala",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/lamy-scala-phase584.md",
  storyTitle: "LAMY scala：标准钢尖与 premium 14K 金尖配置分流",
  primarySourceKey: scala.steel.key,
  depthTier: "A",
  aliases: [
    { alias: "LAMY Scala", language: "en", sourceKey: scala.steel.key },
    { alias: "凌美 scala", language: "zh", sourceKey: scala.steel.key },
  ],
  sources: [scala.steel, scala.gold, scala.catalog2023, scala.jade2023, common.nibGuide, common.care, scala.nibReview, scala.diagram],
  scopes: [
    { key: scalaSteel, scopeKey: scalaSteel, market: "US current black 4000559", productionState: "current", nibScope: "Polished steel EF/F/M/B on selected page.", materialScope: "Matt black lacquer all-metal body, solid clip and polished metal grip.", editionScope: "4000559, 140 mm and 38 g bind to black steel configuration." },
    { key: scalaGold, scopeKey: scalaGold, market: "US current pianoblack", productionState: "current", nibScope: "Partially platinum-plated 14K bi-colour gold nib.", materialScope: "Shiny black lacquer all-metal body.", editionScope: "Pianoblack current gold-nib configuration; not a standard-steel default." },
    { key: scalaJade, scopeKey: scalaJade, market: "2023 numbered special edition", productionState: "historical", nibScope: "14K F nib only for Majestic Jade release.", materialScope: "Lacquered stainless steel and platinum-plated numbered clip.", editionScope: "1,500 numbered pieces with converter and ink set." },
  ],
  claims: [
    { key: "phase584-scala-identity", predicate: "model_identity", objectText: "LAMY scala 是 sieger design 设计、在海德堡工坊手工组装的全金属系列，具有实心夹和抛光金属握位。", factClass: "core", confidence: 0.99, sourceKey: scala.steel.key, locator: "official lines 287-306", evidence: [{ key: "phase584-scala-identity-official", sourceKey: scala.steel.key, scopeKey: scalaSteel, locator: "lines 287-306: hand assembly, solid clip, all-metal body, polished grip and designer" }] },
    { key: "phase584-scala-nib-split", predicate: "variant_boundary", objectText: "black 4000559 为抛光钢尖，pianoblack 当前页为部分镀铂 14K 双色金尖；同一外形不能统一写成一种尖材。", factClass: "core", confidence: 0.99, sourceKey: scala.steel.key, locator: "steel and gold official configurations", evidence: [
      { key: "phase584-scala-steel-config", sourceKey: scala.steel.key, scopeKey: scalaSteel, locator: "line 290 and Data: steel nib, T10/Z27, 140 mm, 38 g, item 4000559" },
      { key: "phase584-scala-gold-config", sourceKey: scala.gold.key, scopeKey: scalaGold, locator: "pianoblack official copy: 14K bi-colour gold nib, T10/Z27, 140 mm, 38 g" },
      { key: "phase584-scala-catalog-split", sourceKey: scala.catalog2023.key, scopeKey: scalaSteel, locator: "PDF lines 805-821: 079 gold, 080/051 steel" },
      { key: "phase584-scala-secondary-nib-split", sourceKey: scala.nibReview.key, scopeKey: scalaSteel, locator: "lines 303-310: standard Scala Z50 steel versus premium Piano Black/Piano Red Z55 14K" },
    ] },
    { key: "phase584-scala-jade-boundary", predicate: "limited_edition_boundary", objectText: "2023 scala Majestic Jade 限量 1,500 支并配 14K F 尖、编号夹和套装；该数量与配件不覆盖普通版。", factClass: "core", confidence: 0.99, sourceKey: scala.jade2023.key, locator: "August 2023 official release", evidence: [{ key: "phase584-scala-jade-release", sourceKey: scala.jade2023.key, scopeKey: scalaJade, locator: "1,500 numbered pieces, lacquered stainless steel, 14K F nib and converter/ink set" }] },
  ],
  variants: [
    { key: "phase584-scala-black-steel", name: "black 4000559 steel nib", notes: "哑黑漆、抛光钢尖、T10/Z27；140 mm、38 g。", sourceKey: scala.steel.key, variantKind: "market_sku", productCode: "4000559", market: "US" },
    { key: "phase584-scala-pianoblack-gold", name: "pianoblack 14K gold nib", notes: "亮黑漆与部分镀铂 14K 双色金尖；不可与标准钢尖配置互抄。", sourceKey: scala.gold.key, variantKind: "market_sku", market: "US" },
    { key: "phase584-scala-majestic-jade", name: "scala majestic jade", releaseYear: "2023", notes: "官方限量 1,500 支、编号夹、14K F 尖和套装。", sourceKey: scala.jade2023.key, variantKind: "edition_group", productCode: "1/1500 series", market: "Global" },
  ],
  spec: {
    brandEntityId: PHASE584_LAMY_BRAND_ID,
    values: {
      series_name: "LAMY scala（standard steel 与 premium 14K 配置分流）",
      release_year: "官方当前页未列系列首发年；2023 官方目录已并列钢尖／金尖并发布 Majestic Jade",
      nib: "black 4000559 为抛光钢尖；pianoblack premium 为部分镀铂 14K 双色金尖",
      fill_system: "LAMY T10 墨囊／Z27 上墨器；套装附件按 SKU",
      material: "全金属笔身、实心夹、抛光金属握位；哑黑、拉丝、高光漆按饰面",
      dimensions: "当前 black／pianoblack 页面：12 × 12 × 140 mm",
      weight: "当前 black／pianoblack 页面：38 g",
      status: "LAMY 当前目录在列；钢尖、金尖、饰面和库存按地区 SKU",
    },
    evidence: [
      specEvidence("brand_entity_id", "phase584-scala-brand", scala.steel.key, scalaSteel, "LAMY official product identity"),
      specEvidence("series_name", "phase584-scala-series", scala.catalog2023.key, scalaSteel, "official scala catalog with steel/gold model split"),
      specEvidence("release_year", "phase584-scala-history", scala.jade2023.key, scalaJade, "August 2023 exact special-edition release; no series launch-year assertion"),
      specEvidence("nib", "phase584-scala-steel-nib", scala.steel.key, scalaSteel, "black 4000559 polished steel nib"),
      specEvidence("nib", "phase584-scala-gold-nib", scala.gold.key, scalaGold, "pianoblack partially platinum-plated 14K bi-colour gold nib"),
      specEvidence("fill_system", "phase584-scala-fill", scala.steel.key, scalaSteel, "black product copy: T10 and Z27"),
      specEvidence("material", "phase584-scala-material", scala.steel.key, scalaSteel, "all-metal body, solid clip, polished grip and matt black lacquer"),
      specEvidence("dimensions", "phase584-scala-dimensions", scala.steel.key, scalaSteel, "black Data: 12×12×140 mm"),
      specEvidence("weight", "phase584-scala-weight", scala.steel.key, scalaSteel, "black Data: 38 g"),
      specEvidence("status", "phase584-scala-status", scala.steel.key, scalaSteel, "current US product options and availability at retrieval"),
    ],
  },
  timeline: [
    { key: "phase584-scala-catalog-2023", title: "官方目录并列钢尖与金尖", eventType: "design_milestone", startDate: "2023-01-01", circa: true, description: "官方 B2B 目录将 079 金尖与 080/051 钢尖明确分开。", sourceKey: scala.catalog2023.key },
    { key: "phase584-scala-jade-2023", title: "Majestic Jade 限量发布", eventType: "model_released", startDate: "2023-08-01", circa: false, description: "1,500 支编号特别版，14K F 尖与套装边界明确。", sourceKey: scala.jade2023.key },
  ],
  media: [{ key: "phase584-scala-primary", title: "LAMY scala 钢尖与 14K 金尖配置事实示意（非产品照片）", sourceKey: scala.diagram.key, localPath: scala.diagram.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创示意图，非产品照片；不代表真实比例、颜色、Logo、漆面、镀层、笔尖刻字、限量编号或库存。", sourceUrl: scala.diagram.url, usageStatus: "primary" }],
};

const lamyBrandPack = phase426BrandDepthRefreshPacks.find(
  (pack) => pack.entityId === PHASE584_LAMY_BRAND_ID,
);
if (!lamyBrandPack || lamyBrandPack.expectedType !== "brand") {
  throw new Error("Phase 584 requires the Phase 426 LAMY brand pack.");
}

export const phase584LamyPacks: CuratedEntityPack[] = [
  lamyBrandPack,
  phase584LamyAccentPack,
  phase584LamyJoyPack,
  phase584LamyNexxPack,
  phase584LamyScalaPack,
];

if (
  phase584LamyPacks.length !== 5 ||
  new Set(phase584LamyPacks.map((pack) => pack.entityId)).size !== 5
) {
  throw new Error("Phase 584 requires one LAMY brand and four unique pen packs.");
}
