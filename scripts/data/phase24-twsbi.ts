import type {
  CuratedEntityPack,
  CuratedSource,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-19";

type LiveSourceInput = Omit<
  CuratedSource,
  "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
> & {
  allowedUse?: CuratedSource["allowedUse"];
  locator: string;
};

function liveSource(source: LiveSourceInput): CuratedSource {
  const { allowedUse, locator, ...record } = source;
  return {
    ...record,
    retrievedAt: RETRIEVED,
    allowedUse: allowedUse ?? "summary_only",
    archiveUrl: record.url,
    archiveLocator: [
      "live-source-not-frozen",
      `retrieved=${RETRIEVED}`,
      "external_archive=false",
      "raw_source_stored=false",
      `locator=${locator}`,
    ].join(";"),
  };
}

const SOURCES = {
  "twsbi-official-about": liveSource({
    key: "twsbi-official-about",
    registryKey: "twsbi-official",
    registryName: "TWSBI official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "twsbi-official",
    title: "TWSBI: About Us",
    url: "https://www.twsbi.com/pages/about-us",
    homepageUrl: "https://www.twsbi.com/",
    author: "TWSBI",
    summary:
      "TWSBI 官方品牌页：TaShin Precision 的五十多年 OEM、塑料与金属制造背景，以及 San Wen Tong／TWSBI 的命名解释；页面未给出精确品牌创立年份。",
    locator:
      "About Us sections 'TWSBI', OEM manufacturer background, name explanation and mission; no explicit founding date on the retrieved page",
  }),
  "twsbi-official-eco-black": liveSource({
    key: "twsbi-official-eco-black",
    registryKey: "twsbi-official",
    registryName: "TWSBI official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "twsbi-official",
    title: "TWSBI ECO Black Fountain Pen",
    url: "https://www.twsbi.com/products/twsbi-eco-black-fountain-pen",
    homepageUrl: "https://www.twsbi.com/",
    author: "TWSBI",
    summary:
      "ECO Black 官方商品页：EF／F／M／B／Stub 1.1、Black/Clear 与 White/Clear、可套帽、活塞上墨、内帽密封及当前美元价格。",
    locator:
      "product title, current price, nib selector and Description section; live inventory and price snapshot",
  }),
  "twsbi-official-eco-collection": liveSource({
    key: "twsbi-official-eco-collection",
    registryKey: "twsbi-official",
    registryName: "TWSBI official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "twsbi-official",
    title: "TWSBI Fountain Pens — ECO collection",
    url: "https://www.twsbi.com/collections/fountain-pens/eco",
    homepageUrl: "https://www.twsbi.com/",
    author: "TWSBI",
    summary:
      "ECO 官方集合的滚动在售快照；2026-07-19 检索时列出 Black、Clear 与多种彩色或特殊饰件 SKU，库存与数量会变化。",
    locator:
      "ECO filtered collection and visible product names; live collection snapshot, not a permanent color chronology",
  }),
  "twsbi-official-diamond-580": liveSource({
    key: "twsbi-official-diamond-580",
    registryKey: "twsbi-official",
    registryName: "TWSBI official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "twsbi-official",
    title: "TWSBI Diamond 580 Clear Fountain Pen",
    url: "https://www.twsbi.com/products/twsbi-diamond-580-clear-fountain-pen",
    homepageUrl: "https://www.twsbi.com/",
    author: "TWSBI",
    summary:
      "Diamond 580 Clear 官方页，用于说明品牌活塞产品线、可拆部件与 ECO 之外的系列边界；不把 580 的结构外推给 ECO。",
    locator:
      "Description lines describing piston filling, detachable parts and disassembly/reassembly",
  }),
  "twsbi-official-go-clear": liveSource({
    key: "twsbi-official-go-clear",
    registryKey: "twsbi-official",
    registryName: "TWSBI official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "twsbi-official",
    title: "TWSBI GO Clear Fountain Pen",
    url: "https://www.twsbi.com/products/twsbi-go-clear-fountain-pen",
    homepageUrl: "https://www.twsbi.com/",
    author: "TWSBI",
    summary:
      "GO Clear 官方商品页，用于确认 GO 的弹簧活塞与按压释放式上墨；不把 GO 结构外推给 ECO。",
    locator: "Description section identifying a spring-loaded piston filling mechanism",
  }),
  "twsbi-official-vac700r-iris": liveSource({
    key: "twsbi-official-vac700r-iris",
    registryKey: "twsbi-official",
    registryName: "TWSBI official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "twsbi-official",
    title: "TWSBI Vac700R Iris Fountain Pen",
    url: "https://www.twsbi.com/products/twsbi-vac700r-iris-fountain-pen",
    homepageUrl: "https://www.twsbi.com/",
    author: "TWSBI",
    summary:
      "Vac700R Iris 官方商品页，用于确认该系列的真空上墨与止墨阀；不把 Vac 结构外推给 ECO。",
    locator: "Description section identifying vacuum filling and an ink shut-off valve",
  }),
  "twsbi-japan-home": liveSource({
    key: "twsbi-japan-home",
    registryKey: "twsbi-japan-official",
    registryName: "TWSBI Japan official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "twsbi-japan-official",
    title: "TWSBI JP product-family overview",
    url: "https://twsbijapan.com/",
    homepageUrl: "https://twsbijapan.com/",
    author: "TWSBI JP",
    summary:
      "TWSBI 日本官网的系列概览，明确区分 ECO、带改良握位的 ECO-T、Diamond、VACUUM 700R 与其他产品线。",
    locator:
      "top-page product-family descriptions for ECO and ECO-T; ECO-T identified as a derivative with a modified grip",
  }),
  "twsbi-japan-eco-black": liveSource({
    key: "twsbi-japan-eco-black",
    registryKey: "twsbi-japan-official",
    registryName: "TWSBI Japan official site",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "twsbi-japan-official",
    title: "TWSBI ECO Black",
    url: "https://twsbijapan.com/products/twsbi-eco-black/",
    homepageUrl: "https://twsbijapan.com/",
    author: "TWSBI JP",
    summary:
      "ECO Black 日本官网规格：约 139／168 mm、轴径约 12.9 mm、约 21 g、树脂笔身、不锈钢尖、吸入机构及扳手／硅脂。",
    locator:
      "product feature, size, mechanism, nib, material and accessories sections",
  }),
  "twsbi-writing-desk-nibs": liveSource({
    key: "twsbi-writing-desk-nibs",
    registryKey: "writing-desk-reference",
    registryName: "The Writing Desk reference section",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-writing-desk",
    title: "About TWSBI nib compatibility",
    url: "https://www.thewritingdesk.co.uk/content/twsbi-nibs.html",
    homepageUrl: "https://www.thewritingdesk.co.uk/",
    author: "The Writing Desk",
    summary:
      "专业零售与维修资料：Diamond 530 于 2010 年推出；580 使用可旋出的完整笔尖组件，ECO 没有同类可拆组件，直接拔尖可能损坏笔舌。",
    locator:
      "intro launch chronology; Diamond 580 section; Eco and Eco T section lines 286-292",
  }),
  "twsbi-nibsmith-eco-2015": liveSource({
    key: "twsbi-nibsmith-eco-2015",
    registryKey: "nibsmith",
    registryName: "The Nibsmith",
    sourceType: "blog",
    tier: "contemporary_archive",
    independenceGroup: "nibsmith-eco-2015",
    title: "TWSBI Eco Review",
    url: "https://nibsmith.com/twsbi-eco-review/",
    homepageUrl: "https://nibsmith.com/",
    author: "Daniel Smith",
    publishedAt: "2015-07-31",
    summary:
      "2015 年 7 月带实物、上墨与书写体验的同期评测，证明 ECO 最迟在当月已进入公开销售；评测日期不是官方发布日。",
    locator:
      "article publication date, photographed review sample and filling section; contemporaneous availability evidence",
  }),
  "twsbi-goulet-eco-black": liveSource({
    key: "twsbi-goulet-eco-black",
    registryKey: "goulet-pens",
    registryName: "The Goulet Pen Company",
    sourceType: "retailer",
    tier: "retailer",
    independenceGroup: "goulet-pens",
    title: "TWSBI ECO Fountain Pen — Black",
    url: "https://www.gouletpens.com/products/twsbi-eco-fountain-pen-black",
    homepageUrl: "https://www.gouletpens.com/",
    author: "The Goulet Pen Company",
    summary:
      "现售 ECO Black 的独立量测与维护提示：约 138.8／131.6／167.5 mm、21 g、1.76 ml，以及扳手和硅脂用于长期维护而非立即拆解。",
    locator:
      "Details, Technical Specs and maintenance note; current retailer measurement set",
  }),
  "twsbi-eco-commons": {
    key: "twsbi-eco-commons",
    registryKey: "wikimedia-commons",
    registryName: "Wikimedia Commons",
    sourceType: "wikimedia",
    tier: "primary",
    independenceGroup: "pavel-satrapa-twsbi-eco",
    title: "File:TWSBI Eco.jpg",
    url: "https://commons.wikimedia.org/wiki/File:TWSBI_Eco.jpg",
    homepageUrl: "https://commons.wikimedia.org/",
    itemType: "image",
    author: "Pavel.satrapa",
    publishedAt: "2017-03-04",
    retrievedAt: RETRIEVED,
    summary:
      "Pavel.satrapa 拍摄的透明笔身、黑色饰件 TWSBI ECO 样本；原图 CC BY-SA 4.0，站内保存 1600 px 等比缩放版，未裁切、未改色，不把该配色外推到全部 ECO。",
    allowedUse: "store_full",
    license: "cc-by-sa-4.0",
    archiveUrl:
      "/images/library/wikimedia/twsbi/twsbi-eco-pavel-satrapa.jpg",
    archiveLocator:
      "project-public-asset:twsbi-eco-pavel-satrapa.jpg;source-file=TWSBI_Eco.jpg;source-author=Pavel.satrapa;source-license=CC-BY-SA-4.0;resize=1600x918;crop=false;color-edit=false;sha256=722133c2a8d4071a079a65faed9a5f9b9c9232e839ca9ddab1937b6bf3b53bda",
  },
  "twsbi-brand-site-original": {
    key: "twsbi-brand-site-original",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "TWSBI 透明上墨系统——本站原创编辑插画（AI 辅助制作）",
    url: "/images/library/warm-pen-atlas/twsbi-brand-cover.jpg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial with OpenAI image generation",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创编辑插画（AI 辅助制作），非 TWSBI 产品实拍，不代表任何具体型号、结构、尺寸、比例、配色或生产批次。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: "/images/library/warm-pen-atlas/twsbi-brand-cover.jpg",
    archiveLocator:
      "project-public-asset:twsbi-brand-cover.jpg;site-original=true;ai-assisted=true;generator=OpenAI-image-generation;product-photo=false;specific-model=false;mechanical-diagram=false;dimensions-or-proportions=false;sha256=1285d45e6eb200bb958895a2614b21cb341d8b85e531a76a9134440686e89641",
  },
} satisfies Record<string, CuratedSource>;

const source = (key: keyof typeof SOURCES): CuratedSource => SOURCES[key];

export const phase24TwsbiPacks: CuratedEntityPack[] = [
  {
    key: "phase24-twsbi-brand-v1",
    entityId: "YTHuH8c3R9zl",
    expectedType: "brand",
    expectedSlug: "twsbi",
    canonicalName: "三文堂 TWSBI",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/twsbi-brand-publishable-content-2026-07-19.md",
    storyTitle: "三文堂 TWSBI：从制造经验到透明上墨系统",
    primarySourceKey: "twsbi-official-about",
    depthTier: "A",
    aliases: [
      {
        alias: "TWSBI",
        language: "en",
        sourceKey: "twsbi-official-about",
      },
      {
        alias: "三文堂",
        language: "zh",
        sourceKey: "twsbi-official-about",
      },
      {
        alias: "San Wen Tong",
        language: "en",
        sourceKey: "twsbi-official-about",
      },
    ],
    sources: [
      source("twsbi-official-about"),
      source("twsbi-official-diamond-580"),
      source("twsbi-official-go-clear"),
      source("twsbi-official-vac700r-iris"),
      source("twsbi-japan-home"),
      source("twsbi-writing-desk-nibs"),
      source("twsbi-nibsmith-eco-2015"),
      source("twsbi-brand-site-original"),
    ],
    scopes: [
      {
        key: "official-brand",
        scopeKey: "twsbi-official-brand-background-current",
        productionState: "current",
        editionScope:
          "official About Us wording; no explicit brand founding date",
      },
      {
        key: "diamond-530-2010",
        scopeKey: "twsbi-diamond-530-launch-2010",
        validFrom: "2010",
        productionState: "historical",
        editionScope: "Diamond 530 product-line chronology",
      },
      {
        key: "eco-2015",
        scopeKey: "twsbi-eco-public-market-july-2015",
        validFrom: "2015-07-31",
        productionState: "historical",
        editionScope:
          "contemporaneous reviewed ECO sample; not an official launch date",
      },
      {
        key: "current-families",
        scopeKey: "twsbi-current-product-family-boundaries",
        productionState: "current",
        editionScope: "ECO, ECO-T, Diamond and Vac family descriptions",
      },
    ],
    claims: [
      {
        key: "twsbi-name-derivation",
        predicate: "brand_name_origin",
        objectText:
          "官网解释 TWSBI 由 San Wen Tong 首字母倒序形成 TWS，再接上意为书写工具的 Bi；三文堂、San Wen Tong 与 TWSBI 属同一品牌名称体系。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "twsbi-official-about",
        locator: "About Us name explanation.",
        evidence: [
          {
            key: "official-name-explanation",
            sourceKey: "twsbi-official-about",
            scopeKey: "official-brand",
            locator:
              "Official explanation of San Wen Tong initials reversed to TWS and Bi added for writing instruments.",
          },
        ],
      },
      {
        key: "twsbi-manufacturing-background",
        predicate: "manufacturing_background",
        objectText:
          "官网把品牌置于 TaShin Precision 五十多年 OEM 以及塑料、金属制造经验之后；这不等于官网确认了一个精确品牌创立年份。",
        factClass: "core",
        confidence: 0.96,
        sourceKey: "twsbi-official-about",
        locator: "About Us OEM and manufacturing-experience paragraphs.",
        evidence: [
          {
            key: "official-oem-background",
            sourceKey: "twsbi-official-about",
            scopeKey: "official-brand",
            locator:
              "Official page states 50-plus years as an OEM manufacturer and experience with plastics and metals.",
          },
        ],
      },
      {
        key: "twsbi-verifiable-product-timeline",
        predicate: "earliest_verified_product_timeline",
        objectText:
          "专业资料把 Diamond 530 的推出时间标为 2010 年；ECO 最迟在 2015 年 7 月已有公开销售样本与同期评测。",
        factClass: "core",
        confidence: 0.91,
        sourceKey: "twsbi-writing-desk-nibs",
        locator:
          "Writing Desk launch chronology combined with Nibsmith's dated contemporary ECO review.",
        evidence: [
          {
            key: "diamond-530-launch",
            sourceKey: "twsbi-writing-desk-nibs",
            scopeKey: "diamond-530-2010",
            locator: "Reference introduction identifies Diamond 530 as launched in 2010.",
          },
          {
            key: "eco-july-2015-sample",
            sourceKey: "twsbi-nibsmith-eco-2015",
            scopeKey: "eco-2015",
            locator:
              "Dated 2015-07-31 hands-on review with photographed ECO sample and filling test.",
          },
        ],
      },
      {
        key: "twsbi-model-boundaries",
        predicate: "product_family_boundaries",
        objectText:
          "ECO、ECO-T、Diamond 与 Vac 是不同产品路线；ECO-T 的握位变化使它不能仅作为普通 ECO 配色处理。",
        factClass: "core",
        confidence: 0.95,
        sourceKey: "twsbi-japan-home",
        locator: "TWSBI Japan product-family overview.",
        evidence: [
          {
            key: "japan-family-boundaries",
            sourceKey: "twsbi-japan-home",
            scopeKey: "current-families",
            locator:
              "Separate ECO and ECO-T entries; ECO-T described as a derivative with a modified grip.",
          },
        ],
      },
    ],
    media: [
      {
        key: "twsbi-brand-editorial-primary",
        title: "TWSBI 透明上墨系统本站原创编辑插画（AI 辅助制作）",
        sourceKey: "twsbi-brand-site-original",
        localPath: "/images/library/warm-pen-atlas/twsbi-brand-cover.jpg",
        author: "Fountain Pen Graph editorial with OpenAI image generation",
        license: "site-original",
        attributionText:
          "本站原创编辑插画（AI 辅助制作）。非 TWSBI 产品实拍，不代表任何具体型号、结构、尺寸、比例、配色或生产批次。",
        sourceUrl: "/images/library/warm-pen-atlas/twsbi-brand-cover.jpg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "diamond-530-2010",
        title: "Diamond 530 推出",
        eventType: "model_released",
        startDate: "2010",
        circa: false,
        description:
          "专业 TWSBI 笔尖资料把初代 Diamond 530 的推出年份标为 2010；未据此倒推出品牌精确创立日。",
        sourceKey: "twsbi-writing-desk-nibs",
      },
      {
        key: "eco-public-by-july-2015",
        title: "同期评测记录 ECO 已公开销售",
        eventType: "community_event",
        startDate: "2015-07-31",
        circa: false,
        description:
          "同期评测证明 ECO 最迟在 2015 年 7 月已有公开销售样本；评测日期不是制造商正式发布日。",
        sourceKey: "twsbi-nibsmith-eco-2015",
      },
    ],
  },
  {
    key: "phase24-twsbi-eco-v1",
    entityId: "X1jZgxCD4osm",
    expectedType: "pen",
    expectedSlug: "三文堂-twsbi-eco",
    canonicalName: "三文堂 TWSBI ECO",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/twsbi-eco-publishable-content-2026-07-19.md",
    storyTitle: "三文堂 TWSBI ECO：透明活塞、版本边界与维护成本",
    primarySourceKey: "twsbi-official-eco-black",
    depthTier: "A",
    aliases: [
      {
        alias: "TWSBI ECO",
        language: "en",
        sourceKey: "twsbi-official-eco-black",
      },
      {
        alias: "三文堂 ECO",
        language: "zh",
        sourceKey: "twsbi-japan-home",
      },
    ],
    sources: [
      source("twsbi-official-about"),
      source("twsbi-official-eco-black"),
      source("twsbi-official-eco-collection"),
      source("twsbi-japan-home"),
      source("twsbi-japan-eco-black"),
      source("twsbi-writing-desk-nibs"),
      source("twsbi-nibsmith-eco-2015"),
      source("twsbi-goulet-eco-black"),
      source("twsbi-eco-commons"),
    ],
    variants: [
      {
        key: "black-clear",
        name: "ECO Black / Clear",
        notes:
          "黑色笔帽与尾钮、透明笔杆的基础配色；当前美国官网商品页锚点。",
        sourceKey: "twsbi-official-eco-black",
        variantKind: "color",
      },
      {
        key: "white-clear",
        name: "ECO White / Clear",
        notes:
          "白色笔帽与尾钮、透明笔杆的基础配色；与 Black / Clear 同列于官方页面。",
        sourceKey: "twsbi-official-eco-black",
        variantKind: "color",
      },
      {
        key: "clear",
        name: "ECO Clear",
        notes:
          "当前官方 ECO 集合中的透明款；库存状态随时间变化，不代表永久生产。",
        sourceKey: "twsbi-official-eco-collection",
        variantKind: "color",
      },
    ],
    scopes: [
      {
        key: "model-history",
        scopeKey: "twsbi-eco-model-history-2015-present",
        validFrom: "2015-07",
        productionState: "current",
        editionScope:
          "canonical ECO model; excludes ECO-T as a distinct grip derivative",
      },
      {
        key: "launch-window",
        scopeKey: "twsbi-eco-public-market-july-2015",
        validFrom: "2015-07-31",
        productionState: "historical",
        editionScope:
          "contemporaneous reviewed sample; not an official launch announcement",
      },
      {
        key: "current-official-black",
        scopeKey: "twsbi-eco-black-current-official",
        productionState: "current",
        nibScope: "EF, F, M, B, Stub 1.1",
        materialScope: "official Black / Clear SKU",
        editionScope:
          "live US product page; price and availability retrieved 2026-07-19",
      },
      {
        key: "current-official-collection",
        scopeKey: "twsbi-eco-current-color-collection",
        productionState: "current",
        editionScope:
          "rolling official ECO collection; not a permanent color chronology",
      },
      {
        key: "current-japan-black",
        scopeKey: "twsbi-eco-black-current-japan-spec",
        market: "Japan",
        productionState: "current",
        nibScope: "EF, F, M, B, Stub 1.1",
        materialScope: "resin body and stainless-steel nib",
        editionScope: "Japan official ECO Black measurement and accessory set",
      },
      {
        key: "goulet-measurement",
        scopeKey: "twsbi-eco-black-goulet-measurement",
        market: "United States",
        productionState: "current",
        editionScope: "retailer measurement set and maintenance guidance",
      },
      {
        key: "family-boundary",
        scopeKey: "twsbi-eco-versus-eco-t-current",
        productionState: "current",
        editionScope: "ECO-T is a grip-modified derivative, not an ECO color",
      },
      {
        key: "nib-maintenance",
        scopeKey: "twsbi-eco-nib-maintenance-boundary",
        productionState: "current",
        editionScope:
          "professional repair/retailer guidance; not a manufacturer warranty promise",
      },
      {
        key: "commons-photo",
        scopeKey: "twsbi-eco-commons-photo-2017",
        validFrom: "2017-03-04",
        productionState: "unknown",
        editionScope: "photographed TWSBI ECO sample",
      },
    ],
    claims: [
      {
        key: "eco-canonical-identity",
        predicate: "canonical_identity",
        objectText:
          "普通 ECO 与 ECO-T 分开建模；TWSBI 日本官网把 ECO-T 明确列为握位经过调整的派生型号，不能把它作为普通 ECO 配色合并。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: "twsbi-japan-home",
        locator: "Separate ECO and ECO-T product-family descriptions.",
        evidence: [
          {
            key: "eco-eco-t-boundary",
            sourceKey: "twsbi-japan-home",
            scopeKey: "family-boundary",
            locator:
              "ECO-T described as an ECO-series derivative with a modified grip for fixed hand placement.",
          },
        ],
      },
      {
        key: "eco-public-by-july-2015",
        predicate: "earliest_verified_retail_window",
        objectText:
          "带实物与上墨体验的同期评测证明 ECO 最迟于 2015 年 7 月已公开销售；没有把该评测日期当作官方发布日。",
        factClass: "core",
        confidence: 0.92,
        sourceKey: "twsbi-nibsmith-eco-2015",
        locator: "Dated contemporary hands-on review with photographed ECO sample.",
        evidence: [
          {
            key: "nibsmith-july-2015",
            sourceKey: "twsbi-nibsmith-eco-2015",
            scopeKey: "launch-window",
            locator:
              "Review dated 2015-07-31 documents an ECO sample in use and filled with bottled ink.",
          },
        ],
      },
      {
        key: "eco-piston-nibs-cap",
        predicate: "core_product_configuration",
        objectText:
          "当前 ECO Black 官方页确认内置活塞、EF／F／M／B／Stub 1.1、可套帽与内帽密封；这些是基础结构，不代表所有特别色永久在售。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "twsbi-official-eco-black",
        locator: "Official product Description and nib selector.",
        evidence: [
          {
            key: "official-eco-core-configuration",
            sourceKey: "twsbi-official-eco-black",
            scopeKey: "current-official-black",
            locator:
              "Official page lists piston filler, five nib choices, posting and an inner cap.",
          },
        ],
      },
      {
        key: "eco-current-colors-rolling",
        predicate: "variant_inventory_boundary",
        objectText:
          "官方 ECO 集合同时列有 Black、Clear 与多种彩色或特殊饰件 SKU；这是 2026-07-19 库存快照，不是永久完整色表。",
        factClass: "core",
        confidence: 0.96,
        sourceKey: "twsbi-official-eco-collection",
        locator: "Live ECO collection product list.",
        evidence: [
          {
            key: "official-current-eco-collection",
            sourceKey: "twsbi-official-eco-collection",
            scopeKey: "current-official-collection",
            locator:
              "Visible ECO product names on the retrieved official filtered collection.",
          },
        ],
      },
      {
        key: "eco-nib-maintenance-boundary",
        predicate: "maintenance_boundary",
        objectText:
          "ECO 没有 Diamond 580 那种可旋出的完整笔尖组件；直接拔出笔尖和笔舌可能损坏笔舌，不应作为日常换墨步骤。",
        factClass: "core",
        confidence: 0.93,
        sourceKey: "twsbi-writing-desk-nibs",
        locator: "Eco and Eco T section, lines 286-292.",
        evidence: [
          {
            key: "writing-desk-eco-nib-boundary",
            sourceKey: "twsbi-writing-desk-nibs",
            scopeKey: "nib-maintenance",
            locator:
              "Article states ECO lacks a removable nib assembly and warns that pulling and swapping can damage the feed.",
          },
        ],
      },
      {
        key: "eco-maintenance-tools-not-immediate",
        predicate: "maintenance_tool_usage",
        objectText:
          "随盒扳手和硅脂用于长期维护；现售资料明确提醒不必在新笔到手时立即拆解。",
        factClass: "core",
        confidence: 0.89,
        sourceKey: "twsbi-goulet-eco-black",
        locator: "Retailer maintenance note above technical specifications.",
        evidence: [
          {
            key: "goulet-long-term-maintenance",
            sourceKey: "twsbi-goulet-eco-black",
            scopeKey: "goulet-measurement",
            locator:
              "Included wrench and silicone grease described as long-term care tools not intended for immediate use.",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: "YTHuH8c3R9zl",
      values: {
        series_name: "ECO 透明示范活塞钢笔",
        release_year:
          "2015；最迟 2015 年 7 月已有公开销售样本，官方精确发布日未确认",
        nib: "不锈钢尖；EF、F、M、B、Stub 1.1",
        fill_system: "内置旋转活塞，只使用瓶装墨水",
        material: "树脂笔身；具体饰件颜色和表面处理依版本",
        dimensions:
          "闭合约 138.8–139 mm；不套帽笔身约 131.6 mm；套帽约 167.5–168 mm；最大轴径约 12.8–12.9 mm",
        weight: "约 21 g",
        price_range: "美国官网 ECO Black 为 US$36.99（2026-07-19 快照）",
        status: "在产；颜色与饰件库存随官方集合滚动变化",
      },
      evidence: [
        {
          key: "brand-official-product",
          fieldKey: "brand_entity_id",
          sourceKey: "twsbi-official-eco-black",
          scopeKey: "current-official-black",
          locator: "Official TWSBI product title identifies TWSBI ECO Black.",
        },
        {
          key: "series-official-product",
          fieldKey: "series_name",
          sourceKey: "twsbi-official-eco-black",
          scopeKey: "current-official-black",
          locator: "Official product title identifies the ECO series and fountain-pen type.",
        },
        {
          key: "release-contemporary-review",
          fieldKey: "release_year",
          sourceKey: "twsbi-nibsmith-eco-2015",
          scopeKey: "launch-window",
          locator:
            "Dated 2015-07-31 review documents a purchased/available ECO sample; lower-bound evidence, not official launch day.",
        },
        {
          key: "nib-official-product",
          fieldKey: "nib",
          sourceKey: "twsbi-official-eco-black",
          scopeKey: "current-official-black",
          locator: "Official nib selector lists EF, F, M, B and Stub 1.1.",
        },
        {
          key: "nib-material-japan",
          fieldKey: "nib",
          sourceKey: "twsbi-japan-eco-black",
          scopeKey: "current-japan-black",
          locator: "Japanese official specification identifies a stainless-steel nib.",
        },
        {
          key: "fill-official-product",
          fieldKey: "fill_system",
          sourceKey: "twsbi-official-eco-black",
          scopeKey: "current-official-black",
          locator: "Official Description identifies a piston-filler fountain pen.",
        },
        {
          key: "material-japan",
          fieldKey: "material",
          sourceKey: "twsbi-japan-eco-black",
          scopeKey: "current-japan-black",
          locator: "Japanese official specification lists a resin body.",
        },
        {
          key: "dimensions-japan",
          fieldKey: "dimensions",
          sourceKey: "twsbi-japan-eco-black",
          scopeKey: "current-japan-black",
          locator:
            "Japanese official page lists about 139 mm closed, 168 mm posted and 12.9 mm maximum barrel diameter.",
        },
        {
          key: "dimensions-goulet",
          fieldKey: "dimensions",
          sourceKey: "twsbi-goulet-eco-black",
          scopeKey: "goulet-measurement",
          locator:
            "Retailer technical specs list 138.8 mm closed, 131.6 mm body, 167.5 mm posted and 12.8 mm barrel diameter.",
        },
        {
          key: "weight-japan",
          fieldKey: "weight",
          sourceKey: "twsbi-japan-eco-black",
          scopeKey: "current-japan-black",
          locator: "Japanese official page lists about 21 g.",
        },
        {
          key: "weight-goulet",
          fieldKey: "weight",
          sourceKey: "twsbi-goulet-eco-black",
          scopeKey: "goulet-measurement",
          locator: "Retailer technical specs list 21.0 g overall.",
        },
        {
          key: "price-current-official",
          fieldKey: "price_range",
          sourceKey: "twsbi-official-eco-black",
          scopeKey: "current-official-black",
          locator: "Live official page lists ECO Black at US$36.99 on 2026-07-19.",
        },
        {
          key: "status-current-collection",
          fieldKey: "status",
          sourceKey: "twsbi-official-eco-collection",
          scopeKey: "current-official-collection",
          locator: "Live official ECO collection with purchasable product entries.",
        },
      ],
    },
    media: [
      {
        key: "twsbi-eco-commons-primary",
        title: "TWSBI ECO 透明笔身／黑色饰件样本实物照片",
        sourceKey: "twsbi-eco-commons",
        localPath:
          "/images/library/wikimedia/twsbi/twsbi-eco-pavel-satrapa.jpg",
        author: "Pavel.satrapa",
        license: "cc-by-sa-4.0",
        attributionText:
          "图中是透明笔身、黑色饰件的具体 TWSBI ECO 样本，不代表全部 ECO 配色。摄影：Pavel.satrapa；来源：Wikimedia Commons；许可：CC BY-SA 4.0（https://creativecommons.org/licenses/by-sa/4.0/）。本站仅将原图等比缩放为 1600 px 宽，未裁切、未改色；本地衍生文件继续采用 CC BY-SA 4.0。",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:TWSBI_Eco.jpg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "eco-public-by-july-2015",
        title: "同期评测记录 ECO 已公开销售",
        eventType: "community_event",
        startDate: "2015-07-31",
        circa: false,
        description:
          "2015 年 7 月的同期实物评测证明 ECO 已公开销售；未把评测日期写成制造商正式发布日。",
        sourceKey: "twsbi-nibsmith-eco-2015",
      },
    ],
  },
];
