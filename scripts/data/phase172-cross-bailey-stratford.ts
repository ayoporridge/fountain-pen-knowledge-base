import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedMedia,
  CuratedSource,
  CuratedSpecEvidence,
} from "../lib/curated-content-pack";

export const PHASE172_CROSS_IDS = {
  brand: "AcglIcVOba3Y",
  baileyLight: "q9hC7b9Q2RKZ",
  stratfordAlias: "NjUsoC-HoMM_",
} as const;

export const PHASE172_CROSS_SLUGS = {
  brand: "cross",
  baileyLight: "高仕-cross-佰利轻盈",
  stratfordAlias: "高仕-cross-莎士比亚",
} as const;

const RETRIEVED = "2026-07-24";
const BRAND_SCOPE = "phase172-cross-brand";
const BAILEY_SCOPE = "phase172-cross-bailey-light";
const STRATFORD_SCOPE = "phase172-cross-stratford-alias";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: input.url.endsWith(".pdf") ? "catalog_pdf" : "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase172",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase172",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary,
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  evidence: Array<{ key: string; sourceKey?: string; locator: string }> = [],
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence: 0.96,
    sourceKey,
    locator,
    evidence: [
      {
        key: `${key}-e`,
        sourceKey,
        scopeKey,
        locator,
      },
      ...evidence.map((item) => ({
        key: item.key,
        sourceKey: item.sourceKey ?? sourceKey,
        scopeKey,
        locator: item.locator,
      })),
    ],
  };
}

function specEvidence(
  key: string,
  fieldKey: CuratedSpecEvidence["fieldKey"],
  sourceKey: string,
  scopeKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function media(key: string, title: string, source: CuratedSource): CuratedMedia[] {
  return [
    {
      key,
      title,
      sourceKey: source.key,
      localPath: source.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创 factual SVG；非产品照片，不证明真实比例、颜色、尖材、修复状态或库存。",
      sourceUrl: source.url,
      usageStatus: "primary",
    },
  ];
}

const S = {
  about: web({
    key: "phase172-cross-about",
    title: "About Cross：1846 起的品牌历史与保修说明",
    url: "https://cross.com/pages/about-cross",
    registryKey: "cross-official-about-phase172",
    registryName: "A.T. Cross",
    sourceType: "official",
    tier: "primary",
    summary:
      "Cross 官方历史页记录 1846 年 Providence 起点、Peerless 早期钢笔名称、品牌时间线和 Lifetime Mechanical Warranty；质量检查数字按品牌自述使用。",
    locator: "About Us, Our History, 1846 Peerless, warranty and quality standards",
  }),
  fountainPens: web({
    key: "phase172-cross-fountain-pens",
    title: "Cross Fountain Pens collection",
    url: "https://cross.com/collections/fountain-pen",
    registryKey: "cross-official-fountain-pens-phase172",
    registryName: "A.T. Cross",
    sourceType: "official",
    tier: "primary",
    summary:
      "Cross 官方钢笔集合页用于确认当前产品线入口及 Bailey Light、Century 等系列之间的导航边界，不把集合页库存当作永久目录。",
    locator: "Fountain Pens collection and current model navigation",
  }),
  baileyCollection: web({
    key: "phase172-cross-bailey-collection",
    title: "Cross Bailey Light collection",
    url: "https://cross.com/collections/bailey-light",
    registryKey: "cross-official-bailey-light-collection-phase172",
    registryName: "A.T. Cross",
    sourceType: "official",
    tier: "primary",
    summary:
      "Cross 官方系列页把 Bailey Light 描述为轻量、舒适的树脂路线，并列出不同颜色、透明树脂和钢笔尖宽的当前系列入口。",
    locator: "Bailey Light collection description and current color/SKU listing",
  }),
  baileyBlack: web({
    key: "phase172-cross-bailey-black",
    title: "Bailey Light polished black resin F nib, AT0746-1FS",
    url: "https://cross.com/products/at0746-1fs",
    registryKey: "cross-official-bailey-black-phase172",
    registryName: "A.T. Cross",
    sourceType: "official",
    tier: "primary",
    summary:
      "Cross 官方黑色树脂 F 尖页确认 click-off 帽、不锈钢 EF/F/M 尖、8921 墨囊、可选 8751 转换器及该 SKU 的英制尺寸重量。",
    locator: "AT0746-1FS features and specification",
  }),
  baileyWhiteGold: web({
    key: "phase172-cross-bailey-white-gold",
    title: "Bailey Light white resin and gold tone F nib, AT0746-10FF",
    url: "https://cross.com/collections/fountain-pen/products/at0746-10ff",
    registryKey: "cross-official-bailey-white-gold-phase172",
    registryName: "A.T. Cross",
    sourceType: "official",
    tier: "primary",
    summary:
      "Cross 官方白色树脂金色五金 F 尖页确认金色电镀不锈钢尖、8921 墨囊、8751 转换器及该 SKU 的尺寸重量。",
    locator: "AT0746-10FF finish, nib, filling and specification",
  }),
  crossCatalog: web({
    key: "phase172-cross-retail-catalog",
    title: "Cross Retail Catalogue 2021/2022",
    url: "https://luxco.co.za/cross/images/media/Cross_Retail_Catalogue_2021.pdf",
    registryKey: "cross-retail-catalogue-2021-phase172",
    registryName: "Cross distributor catalogue mirror",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary:
      "经销商目录镜像用于补充 Cross 系列在渠道中的商品命名；Stratford 仅作为目录检索线索，不替代 Cross 当前官网的独立产品页。",
    locator: "catalogue search result containing STRATFORD; no current official product page located",
  }),
  purePensHistory: web({
    key: "phase172-cross-purepens-history",
    title: "Pure Pens: Cross history",
    url: "https://www.purepens.co.uk/blogs/news/cross-a-history",
    registryKey: "purepens-cross-history-phase172",
    registryName: "Pure Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "钢笔专业零售商 Pure Pens 的品牌史文章补充 Cross 1846 起点、Peerless、早期书写工具和后续系列的二级时间线；不替代具体 SKU 官方规格。",
    locator: "Cross history, Peerless and later model chronology",
  }),
  penchaletBailey: web({
    key: "phase172-cross-penchalet-bailey",
    title: "Pen Chalet：Cross Bailey Light fountain pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/cross_bailey_light_fountain_pens.html",
    registryKey: "penchalet-cross-bailey-phase172",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "专业钢笔零售商 Pen Chalet 将 Bailey Light 归为 Cross 的轻量树脂钢笔路线；用于交叉确认系列定位，不替代 Cross 官方 SKU 规格。",
    locator: "Bailey Light fountain pen category and lightweight resin positioning",
  }),
  jdStratford: web({
    key: "phase172-cross-jd-stratford",
    title: "京东渠道：高仕 Cross STRATFORD/莎士比亚系列钢笔",
    url: "https://www.jd.com/book/167238faffe429672107.html",
    registryKey: "jd-cross-stratford-phase172",
    registryName: "京东渠道商品聚合页",
    sourceType: "retailer",
    tier: "retailer",
    summary:
      "京东渠道聚合页把商品标题写成 STRATFORD/莎士比亚系列，并列出宝石蓝白夹、黑丽雅白夹、珍珠白白夹、玫瑰红白夹等选择；销售场景不能当作性能证明。",
    locator: "STRATFORD/莎士比亚 title and color/trim listings",
  }),
  brandSvg: diagram(
    "phase172-cross-brand-svg",
    "Cross brand navigation facts",
    "/images/library/site-original/phase172/cross/brand.svg",
    "本站原创 factual SVG，表达 Cross 品牌、Peerless 历史名称和 Bailey Light 系列层级。",
  ),
  baileySvg: diagram(
    "phase172-cross-bailey-svg",
    "Bailey Light facts",
    "/images/library/site-original/phase172/cross/bailey-light.svg",
    "本站原创 factual SVG，表达轻量树脂、click-off 帽、钢尖及 8921/8751 上墨路线。",
  ),
  stratfordSvg: diagram(
    "phase172-cross-stratford-svg",
    "Stratford and Chinese channel alias",
    "/images/library/site-original/phase172/cross/stratford-alias.svg",
    "本站原创 factual SVG，表达 Cross、Stratford 和中文渠道莎士比亚之间的证据层级。",
  ),
} as const;

const brand: CuratedEntityPack = {
  key: "phase172-cross-brand-v1",
  entityId: PHASE172_CROSS_IDS.brand,
  expectedType: "brand",
  expectedSlug: PHASE172_CROSS_SLUGS.brand,
  canonicalName: "高仕（A.T. Cross）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/cross-brand-phase172.md",
  storyTitle: "高仕 Cross：1846 年起的美国书写工具品牌",
  primarySourceKey: S.about.key,
  depthTier: "A",
  aliases: [
    { alias: "A.T. Cross", language: "en", sourceKey: S.about.key },
    { alias: "Cross", language: "en", sourceKey: S.about.key },
    { alias: "高仕", language: "zh", sourceKey: S.fountainPens.key },
  ],
  sources: [S.about, S.fountainPens, S.baileyCollection, S.purePensHistory, S.brandSvg],
  scopes: [
    {
      key: BRAND_SCOPE,
      scopeKey: BRAND_SCOPE,
      productionState: "current",
      editionScope: "Cross 公司历史、当前钢笔集合与 Bailey Light 导航；不把商品 SKU 规格上推为品牌常数。",
    },
  ],
  claims: [
    claim(
      "phase172-cross-founded",
      "brand_history",
      "Cross 官方将 A.T. Cross 的品牌起点放在 1846 年美国罗得岛州普罗维登斯，并把 Richard Cross 记为创始人。",
      S.about.key,
      BRAND_SCOPE,
      "1846 Providence company history",
    ),
    claim(
      "phase172-cross-peerless",
      "fountain_pen_history",
      "Cross 官方时间线把 1846 年首次出现的 Cross fountain pen 记为 Peerless；这是历史名称，不等同于所有现代 Peerless 商品。",
      S.about.key,
      BRAND_SCOPE,
      "1846 first Cross Fountain Pen debuts as Peerless",
    ),
    claim(
      "phase172-cross-navigation",
      "model_navigation",
      "当前 Cross 钢笔导航包含 Bailey Light、Century 等系列；系列页与具体 SKU 页面分别承担产品层和规格层证据。",
      S.fountainPens.key,
      BRAND_SCOPE,
      "Fountain Pens collection navigation",
      [{ key: "phase172-cross-navigation-bailey", sourceKey: S.baileyCollection.key, locator: "Bailey Light collection" }],
    ),
    claim(
      "phase172-cross-warranty",
      "warranty",
      "Cross 官方提供 Lifetime Mechanical Warranty；适用范围应以当地条款和使用说明为准，不扩展为所有损坏均保修。",
      S.about.key,
      BRAND_SCOPE,
      "Lifetime mechanical warranty wording",
    ),
    claim(
      "phase172-cross-secondary-history",
      "secondary_history",
      "Pure Pens 的专业二级品牌史把 Cross 的 1846 起点、Peerless 和后续产品路线串联起来；其叙述用于交叉阅读，不覆盖官方 SKU 规格。",
      S.purePensHistory.key,
      BRAND_SCOPE,
      "Cross history overview",
    ),
  ],
  timeline: [
    {
      key: "phase172-cross-1846",
      title: "A.T. Cross 在 Providence 创立",
      eventType: "brand_founded",
      startDate: "1846",
      circa: false,
      description: "Cross 官方品牌历史给出 1846 年和 Providence, Rhode Island 的起点。",
      sourceKey: S.about.key,
    },
    {
      key: "phase172-cross-peerless",
      title: "Peerless 作为早期 Cross fountain pen 名称出现",
      eventType: "model_released",
      startDate: "1846",
      circa: false,
      description: "官方时间线把 Peerless 作为第一支 Cross fountain pen 的名称。",
      sourceKey: S.about.key,
    },
  ],
  media: media("phase172-cross-brand-media", "Cross 品牌层级事实图（非产品照片）", S.brandSvg),
};

const baileyLight: CuratedEntityPack = {
  key: "phase172-cross-bailey-light-v1",
  entityId: PHASE172_CROSS_IDS.baileyLight,
  expectedType: "pen",
  expectedSlug: PHASE172_CROSS_SLUGS.baileyLight,
  canonicalName: "高仕 Cross Bailey Light（佰利轻盈）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/cross-bailey-light-phase172.md",
  storyTitle: "Cross Bailey Light（佰利轻盈）：轻量树脂日用钢笔",
  primarySourceKey: S.baileyBlack.key,
  depthTier: "A",
  aliases: [
    { alias: "Cross Bailey Light", language: "en", sourceKey: S.baileyCollection.key },
    { alias: "Bailey Light", language: "en", sourceKey: S.baileyBlack.key },
    { alias: "佰利轻盈", language: "zh", sourceKey: S.fountainPens.key },
  ],
  sources: [
    S.about,
    S.fountainPens,
    S.baileyCollection,
    S.baileyBlack,
    S.baileyWhiteGold,
    S.purePensHistory,
    S.penchaletBailey,
    S.baileySvg,
  ],
  scopes: [
    {
      key: BAILEY_SCOPE,
      scopeKey: BAILEY_SCOPE,
      productionState: "current",
      editionScope: "Bailey Light 轻量树脂系列；AT0746 SKU 的颜色、五金、尖宽和尺寸按具体页面区分。",
    },
  ],
  claims: [
    claim(
      "phase172-bailey-identity",
      "model_identity",
      "Bailey Light 是 Cross Bailey 的轻量树脂路线；官方把它与原 Bailey 金属笔的外形气质区分开来。",
      S.baileyCollection.key,
      BAILEY_SCOPE,
      "Bailey Light collection description",
      [{ key: "phase172-bailey-identity-product", sourceKey: S.baileyBlack.key, locator: "lighter-weight resin and original Bailey metal pen distinction" }],
    ),
    claim(
      "phase172-bailey-fill",
      "filling_system",
      "官方产品页列出随笔附 Cross 8921 黑色墨囊，并提供 8751 转换器作为瓶装墨水方案。",
      S.baileyBlack.key,
      BAILEY_SCOPE,
      "8921 cartridge and optional 8751 converter",
    ),
    claim(
      "phase172-bailey-nib",
      "nib",
      "Bailey Light 使用不锈钢钢笔尖，官方页面列出 EF、F、M 尖宽；部分金色五金 SKU 的尖片为金色电镀外观。",
      S.baileyWhiteGold.key,
      BAILEY_SCOPE,
      "stainless steel nib, gold tone plating and EF/F/M options",
      [{ key: "phase172-bailey-nib-black", sourceKey: S.baileyBlack.key, locator: "black resin F page lists stainless steel EF/F/M" }],
    ),
    claim(
      "phase172-bailey-dimensions",
      "sku_dimensions",
      "官方列出的白金 F 与黑铬 F SKU 尺寸重量不同，说明 Bailey Light 规格必须按 SKU 记录，不能写成单一固定值。",
      S.baileyWhiteGold.key,
      BAILEY_SCOPE,
      "AT0746-10FF versus AT0746-1FS dimensions and weight",
      [{ key: "phase172-bailey-dimensions-black", sourceKey: S.baileyBlack.key, locator: "AT0746-1FS dimensions and weight" }],
    ),
    claim(
      "phase172-bailey-cap",
      "cap",
      "Bailey Light 为 click-off 帽；通勤携带应确认帽盖完全扣合，不能把拔帽结构写成旋盖。",
      S.baileyBlack.key,
      BAILEY_SCOPE,
      "Pen Technology: Click-off cap",
    ),
    claim(
      "phase172-bailey-colors",
      "version_boundary",
      "官方系列页同时展示抛光树脂、透明树脂以及金色或铬色五金的颜色组合；颜色与库存随市场和 SKU 变化。",
      S.baileyCollection.key,
      BAILEY_SCOPE,
      "current collection color and finish listing",
    ),
    claim(
      "phase172-bailey-secondary",
      "secondary_model_context",
      "专业钢笔零售商 Pen Chalet 也将 Bailey Light 归入轻量树脂 Cross 钢笔路线；该二级资料只用于交叉确认系列定位，不替代官网 SKU 数据。",
      S.penchaletBailey.key,
      BAILEY_SCOPE,
      "Bailey Light lightweight resin category",
    ),
  ],
  variants: [
    { key: "phase172-bailey-polished", name: "抛光树脂版本", notes: "黑、白、蓝、琥珀、酒红等颜色；按 SKU 核对五金和尖宽。", sourceKey: S.baileyCollection.key, variantKind: "color" },
    { key: "phase172-bailey-translucent", name: "Translucent 透明树脂版本", notes: "透明 navy-blue、clear、pink sapphire、green 等系列展示；不代表所有市场均有库存。", sourceKey: S.baileyCollection.key, variantKind: "material" },
    { key: "phase172-bailey-chrome", name: "铬色五金", notes: "黑铬 F SKU AT0746-1FS 的官方示例。", sourceKey: S.baileyBlack.key, variantKind: "edition_group", productCode: "AT0746-1FS" },
    { key: "phase172-bailey-gold", name: "金色五金", notes: "白树脂金色 F SKU AT0746-10FF 的官方示例；金色尖片为电镀外观。", sourceKey: S.baileyWhiteGold.key, variantKind: "edition_group", productCode: "AT0746-10FF" },
    { key: "phase172-bailey-nib-width", name: "EF / F / M", notes: "官网列出的钢尖宽度；不要与日系尖宽直接换算。", sourceKey: S.baileyBlack.key, variantKind: "nib" },
  ],
  spec: {
    brandEntityId: PHASE172_CROSS_IDS.brand,
    values: {
      series_name: "Cross Bailey Light",
      release_year: "官方当前系列；具体首发年份未在本次官方产品页明确",
      origin_country: "Cross 美国品牌；具体 SKU 生产地未由本次官方页面确认",
      nib: "不锈钢笔尖；EF/F/M，部分金色五金 SKU 为金色电镀外观",
      fill_system: "Cross 8921 墨囊；可选 8751 转换器",
      material: "轻量高光树脂笔身；铬色或金色五金按 SKU 区分",
      dimensions: "按 SKU：白金 F 约闭帽 5.4 in、书写 6.1 in；黑铬 F 约闭帽 5.375 in、书写 5.5 in",
      weight: "按 SKU：白金 F 约 0.69 oz；黑铬 F 约 0.795 oz",
      status: "Cross 当前系列页可见；颜色和库存随市场变化",
    },
    evidence: [
      specEvidence("phase172-bailey-brand", "brand_entity_id", S.about.key, BAILEY_SCOPE, "A.T. Cross brand history"),
      specEvidence("phase172-bailey-series", "series_name", S.baileyCollection.key, BAILEY_SCOPE, "Bailey Light collection"),
      specEvidence("phase172-bailey-year", "release_year", S.baileyCollection.key, BAILEY_SCOPE, "current collection; no launch year claim"),
      specEvidence("phase172-bailey-origin", "origin_country", S.about.key, BAILEY_SCOPE, "Cross Providence history; SKU origin not claimed"),
      specEvidence("phase172-bailey-nib-spec", "nib", S.baileyWhiteGold.key, BAILEY_SCOPE, "stainless steel nib and EF/F/M options"),
      specEvidence("phase172-bailey-fill-spec", "fill_system", S.baileyBlack.key, BAILEY_SCOPE, "8921 and 8751"),
      specEvidence("phase172-bailey-material", "material", S.baileyBlack.key, BAILEY_SCOPE, "lighter-weight resin"),
      specEvidence("phase172-bailey-dimensions", "dimensions", S.baileyWhiteGold.key, BAILEY_SCOPE, "AT0746-10FF dimensions"),
      specEvidence("phase172-bailey-weight", "weight", S.baileyBlack.key, BAILEY_SCOPE, "AT0746-1FS weight"),
      specEvidence("phase172-bailey-status", "status", S.baileyCollection.key, BAILEY_SCOPE, "current collection listing"),
    ],
  },
  timeline: [
    {
      key: "phase172-bailey-light-launch",
      title: "Bailey Light 作为轻量树脂路线出现",
      eventType: "model_released",
      startDate: "unknown",
      circa: true,
      description: "Cross 当前系列页确认其轻量树脂定位，但本次资料不锁定具体首发年份。",
      sourceKey: S.baileyCollection.key,
    },
  ],
  media: media("phase172-bailey-media", "Bailey Light 事实图（非产品照片）", S.baileySvg),
};

const stratfordAlias: CuratedEntityPack = {
  key: "phase172-cross-stratford-alias-v1",
  entityId: PHASE172_CROSS_IDS.stratfordAlias,
  expectedType: "pen",
  expectedSlug: PHASE172_CROSS_SLUGS.stratfordAlias,
  canonicalName: "高仕 Cross Stratford（中国渠道称“莎士比亚”）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/cross-stratford-alias-phase172.md",
  storyTitle: "Cross Stratford（中国渠道称“莎士比亚”）：渠道身份边界",
  primarySourceKey: S.jdStratford.key,
  depthTier: "B",
  aliases: [
    { alias: "Cross Stratford", language: "en", sourceKey: S.crossCatalog.key, kind: "regional_name", market: "international catalog" },
    { alias: "STRATFORD", language: "en", sourceKey: S.crossCatalog.key, kind: "regional_name", market: "international catalog" },
    { alias: "高仕 Cross 莎士比亚", language: "zh", sourceKey: S.jdStratford.key, kind: "regional_name", market: "中国渠道" },
  ],
  sources: [S.about, S.fountainPens, S.crossCatalog, S.purePensHistory, S.jdStratford, S.stratfordSvg],
  scopes: [
    {
      key: STRATFORD_SCOPE,
      scopeKey: STRATFORD_SCOPE,
      productionState: "unknown",
      market: "中国渠道",
      editionScope: "渠道标题中的 STRATFORD/莎士比亚名称；未将其扩写为 Cross 当前官网的全球独立系列。",
    },
  ],
  claims: [
    claim(
      "phase172-stratford-channel-name",
      "identity_boundary",
      "中国渠道把商品标题写作 STRATFORD/莎士比亚系列；本页将莎士比亚记录为 Stratford 的渠道称呼，而不是 Cross 官方全球系列名。",
      S.jdStratford.key,
      STRATFORD_SCOPE,
      "STRATFORD/莎士比亚 title",
      [{ key: "phase172-stratford-catalog", sourceKey: S.crossCatalog.key, locator: "STRATFORD catalogue search result" }],
    ),
    claim(
      "phase172-stratford-colors",
      "channel_variants",
      "渠道聚合页列出宝石蓝白夹、黑丽雅白夹、珍珠白白夹、玫瑰红白夹等颜色/五金选择；这些是商品选择，不能推定内部机构不同。",
      S.jdStratford.key,
      STRATFORD_SCOPE,
      "channel color and trim choices",
    ),
    claim(
      "phase172-stratford-no-official-page",
      "source_limit",
      "Cross 当前官方钢笔集合与 Bailey Light 系列页没有提供与莎士比亚名称对应的独立产品页；因此本页不编造全球产品历史。",
      S.fountainPens.key,
      STRATFORD_SCOPE,
      "current official collection boundary",
    ),
    claim(
      "phase172-stratford-unknown-specs",
      "specification_boundary",
      "本次资料未可靠确认具体尖材、尖宽、生产年份、闭帽尺寸、重量、笔身材料或 Cross 转换器接口，均保留为未核实。",
      S.jdStratford.key,
      STRATFORD_SCOPE,
      "retailer title lacks model specification fields",
      [{ key: "phase172-stratford-official-gap", sourceKey: S.about.key, locator: "official brand history does not identify this channel name" }],
    ),
    claim(
      "phase172-stratford-buying",
      "buying_advice",
      "购买或研究该渠道名称时，应索取笔尖照片、包装型号、帽环刻字和耗材接口；不能把 Bailey Light、Century II 或其他 Cross 型号规格套用过来。",
      S.jdStratford.key,
      STRATFORD_SCOPE,
      "channel purchase identity advice",
    ),
    claim(
      "phase172-stratford-secondary-boundary",
      "secondary_source_boundary",
      "专业钢笔资料对 Cross 品牌和现代钢笔线有独立叙述，但没有把莎士比亚写成 Cross 当前全球系列；本页因此保留渠道别名而不扩写官方历史。",
      S.purePensHistory.key,
      STRATFORD_SCOPE,
      "secondary Cross history does not identify the Chinese channel name",
    ),
  ],
  variants: [
    { key: "phase172-stratford-blue-white", name: "宝石蓝白夹", notes: "渠道列出的颜色/五金组合；未证明内部机构。", sourceKey: S.jdStratford.key, variantKind: "color", market: "中国渠道" },
    { key: "phase172-stratford-black-white", name: "黑丽雅白夹", notes: "渠道列出的颜色/五金组合；未证明内部机构。", sourceKey: S.jdStratford.key, variantKind: "color", market: "中国渠道" },
    { key: "phase172-stratford-pearl-white", name: "珍珠白白夹", notes: "渠道列出的颜色/五金组合；未证明内部机构。", sourceKey: S.jdStratford.key, variantKind: "color", market: "中国渠道" },
    { key: "phase172-stratford-rose-white", name: "玫瑰红白夹", notes: "渠道列出的颜色/五金组合；未证明内部机构。", sourceKey: S.jdStratford.key, variantKind: "color", market: "中国渠道" },
  ],
  spec: {
    brandEntityId: PHASE172_CROSS_IDS.brand,
    values: {
      series_name: "Cross Stratford；中国渠道称“莎士比亚”",
      release_year: "未由 Cross 当前官网或本次渠道资料确认",
      origin_country: "品牌为美国 Cross；本条目具体生产地未核实",
      nib: "钢笔；具体材质、尖宽和刻字未核实",
      fill_system: "渠道商品为墨水笔礼盒；墨囊/转换器接口未核实",
      material: "渠道标题信息不一致；具体笔身材料未核实",
      dimensions: "未核实",
      weight: "未核实",
      status: "中国渠道商品名称；非 Cross 当前官网独立全球系列",
    },
    evidence: [
      specEvidence("phase172-stratford-brand", "brand_entity_id", S.about.key, STRATFORD_SCOPE, "Cross official brand history"),
      specEvidence("phase172-stratford-series", "series_name", S.jdStratford.key, STRATFORD_SCOPE, "STRATFORD/莎士比亚 channel title"),
      specEvidence("phase172-stratford-year", "release_year", S.fountainPens.key, STRATFORD_SCOPE, "no official date located"),
      specEvidence("phase172-stratford-origin", "origin_country", S.about.key, STRATFORD_SCOPE, "brand origin only; SKU origin unknown"),
      specEvidence("phase172-stratford-nib", "nib", S.jdStratford.key, STRATFORD_SCOPE, "channel lists fountain pen but no nib detail"),
      specEvidence("phase172-stratford-fill", "fill_system", S.jdStratford.key, STRATFORD_SCOPE, "ink pen gift set; interface unknown"),
      specEvidence("phase172-stratford-material", "material", S.jdStratford.key, STRATFORD_SCOPE, "conflicting channel material wording"),
      specEvidence("phase172-stratford-dimensions", "dimensions", S.jdStratford.key, STRATFORD_SCOPE, "no dimensions in verified listing"),
      specEvidence("phase172-stratford-weight", "weight", S.jdStratford.key, STRATFORD_SCOPE, "no weight in verified listing"),
      specEvidence("phase172-stratford-status", "status", S.fountainPens.key, STRATFORD_SCOPE, "not a current official global collection entry"),
    ],
  },
  timeline: [],
  media: media("phase172-stratford-media", "Stratford／莎士比亚来源边界图（非产品照片）", S.stratfordSvg),
};

export const phase172CrossBaileyStratfordPacks: CuratedEntityPack[] = [brand, baileyLight, stratfordAlias];
