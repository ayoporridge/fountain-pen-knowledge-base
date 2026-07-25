import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-25";
export const PHASE210_WEAREVER_BRAND_ID = "x0PbAr6vvwf9";
export const PHASE210_ZENITH_ID = "ZkG6VOvfGspq";

function live(input: {
  key: string;
  title: string;
  url: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
  independenceGroup?: string;
}): CuratedSource {
  return {
    ...input,
    registryKey: `${input.key}-registry`,
    independenceGroup: input.independenceGroup ?? `${input.key}-group`,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase210",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase210",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary:
      "本站原创 factual SVG；示意图，非产品照片，不证明真实比例、颜色、刻印、年份、尖型或保存状态。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true`,
  };
}

const S = {
  richard: live({
    key: "phase210-wearever-richardspens",
    title: "Richard's Pens：The Wearever Zenith",
    url: "https://www.richardspens.com/ref/profiles/zenith.htm",
    registryName: "Richard's Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "参考页记录 David Kahn 的注塑工艺、1943 年 Zenith lever filler、polystyrene 纯色限制、ruby top、战时 14K 金尖与战后钢尖，并给出约 1950 年退市节点。",
    locator: "1943 Zenith, polystyrene, lever filler, ruby top, nib transition and 1950 withdrawal",
    independenceGroup: "richardspens-wearever-zenith",
  }),
  penhero: live({
    key: "phase210-wearever-penhero",
    title: "PenHero：Wearever Zenith",
    url: "https://www.penhero.com/PenGallery/Wearever/WeareverZenith.htm",
    registryName: "PenHero / Jim Mamoulides",
    sourceType: "blog",
    tier: "contemporary_archive",
    summary:
      "资料汇总 1943–1946 广告、约 1.95 美元定价、14K 金尖、颜色与战时营销，并把 Zenith 放在 David Kahn 的大众钢笔产品线里。",
    locator: "1943-1946 advertising, price, colours, 14K nib and David Kahn product positioning",
    independenceGroup: "penhero-wearever-zenith",
  }),
  sterling: live({
    key: "phase210-wearever-sterling-sample",
    title: "PenHero：Wearever Zenith with Sterling Silver Cap Band",
    url: "https://www.penhero.com/PenGallery/Wearever/WeareverZenithSterling1943.htm",
    registryName: "PenHero / Jim Mamoulides",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "实物档案记录约 1943 年海军蓝 Zenith、约 5 又 5/8 英寸、红色顶珠、C-Flow 透明 feed、14K 尖与 sterling silver cap band；特殊饰件的目录地位仍需谨慎。",
    locator: "sterling cap band sample, 5 5/8 inch measurement, ruby jewels, C-Flow feed and 14K nib",
    independenceGroup: "penhero-wearever-sterling-sample",
  }),
  fpn: live({
    key: "phase210-wearever-fpn",
    title: "Fountain Pen Network：Wearever fountain pen discussion",
    url: "https://www.fountainpennetwork.com/forum/topic/377048-wearever-fountain-pen-what-the/",
    registryName: "Fountain Pen Network participants",
    sourceType: "forum",
    tier: "community",
    summary:
      "讨论页把 Zenith 置于 1940 年代中期的 Wearever 产品线，并提供 14K 战时尖和实物状态的收藏者交叉线索；不替代型号原始资料。",
    locator: "mid-1940s Zenith context, wartime gold nib and condition discussion",
  }),
  peyton: live({
    key: "phase210-wearever-peyton",
    title: "Peyton Street Pens：Wearever Zenith restored sample",
    url: "https://www.peytonstreetpens.com/wearever-zenith-fountain-pen-black-w-red-ends-semi-flex-fine-14k-nib-very-nice-restored.html",
    registryName: "Peyton Street Pens",
    sourceType: "retailer",
    tier: "retailer",
    summary:
      "修复样本记录黑色杆帽、红色两端、14K 半柔细尖和实际维修状态；这些字段只适用于该支实物，不扩写为全系规格。",
    locator: "black body, red ends, semi-flex fine 14K nib and restored condition",
  }),
  svg: diagram(
    "phase210-wearever-zenith-svg",
    "Wearever Zenith 事实示意",
    "/images/library/site-original/phase210/wearever/zenith.svg",
  ),
} as const;

const brandScope = "wearever-brand-scope";
const penScope = "wearever-zenith-scope";

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  extra: string[] = [],
): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence: 0.95,
    sourceKey,
    locator,
    evidence: [sourceKey, ...extra].map((source, index) => ({
      key: `${key}-evidence-${index + 1}`,
      sourceKey: source,
      scopeKey,
      locator,
    })),
  };
}

function specEvidence(
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return {
    key: `phase210-wearever-${fieldKey}`,
    fieldKey,
    sourceKey,
    scopeKey: penScope,
    locator,
  };
}

const brand: CuratedEntityPack = {
  key: "phase210-wearever-zenith-brand",
  entityId: PHASE210_WEAREVER_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "wearever",
  canonicalName: "Wearever",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wearever-brand-phase210.md",
  storyTitle: "Wearever：把大众钢笔带进注塑塑料时代",
  primarySourceKey: S.richard.key,
  depthTier: "B",
  aliases: [
    { alias: "Wearever", language: "en", sourceKey: S.richard.key },
    { alias: "WearEver", language: "en", sourceKey: S.penhero.key },
    { alias: "David Kahn, Inc.", language: "en", sourceKey: S.richard.key, kind: "producer_name" },
    { alias: "Wearever 钢笔", language: "zh", sourceKey: S.penhero.key },
  ],
  sources: [S.richard, S.penhero, S.sterling, S.fpn, S.svg],
  scopes: [{
    key: brandScope,
    scopeKey: brandScope,
    productionState: "historical",
    editionScope: "Wearever 历史品牌导航；David Kahn 制造背景与 Zenith、Pacemaker、De Luxe 等型号分开核对",
  }],
  claims: [
    claim(
      "wearever-brand-identity",
      "brand_identity",
      "Wearever 是 David Kahn, Inc. 面向大众市场经营的美国钢笔品牌；品牌定位、制造商身份和单支型号身份需要分开记录。",
      S.richard.key,
      brandScope,
      "David Kahn maker of Wearever fountain pens",
      [S.penhero.key],
    ),
    claim(
      "wearever-brand-material",
      "manufacturing_context",
      "David Kahn 在 1920 年代末研究并发展注塑钢笔生产，Wearever Zenith 是这条聚苯乙烯量产路线的代表型号之一。",
      S.richard.key,
      brandScope,
      "late-1920s injection molding investigation and Zenith production",
      [S.penhero.key],
    ),
    claim(
      "wearever-brand-navigation",
      "brand_navigation",
      "Zenith、Pacemaker、De Luxe、Pennant 等名称属于型号或产品线层；品牌页只建立导航，不把一个型号的尖、材料和年份扩写给全部 Wearever。",
      S.penhero.key,
      brandScope,
      "Wearever product-line and model boundaries",
      [S.richard.key],
    ),
  ],
  variants: [],
  media: [{
    key: "phase210-wearever-brand-primary",
    title: "Wearever / Zenith 制造史示意图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实颜色、比例、刻印、年份或保存状态。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [{
    key: "phase210-wearever-injection",
    title: "David Kahn 发展注塑钢笔生产",
    eventType: "design_milestone",
    startDate: "1928",
    circa: true,
    description: "Richard's Pens 将 David Kahn 在 1920 年代末赴德国研究注塑工艺、带回设备并发展美国注塑钢笔生产作为 Wearever 制造史锚点。",
    sourceKey: S.richard.key,
  }, {
    key: "phase210-wearever-zenith-brand-launch",
    title: "Zenith 成为 Wearever 的代表产品线",
    eventType: "model_released",
    startDate: "1943",
    circa: false,
    description: "1943 年推出的 Zenith 把 David Kahn 的注塑路线、战时材料和大众价位带进 Wearever 品牌导航；具体尖型和饰件仍按型号页核对。",
    sourceKey: S.penhero.key,
  }],
};

const pen: CuratedEntityPack = {
  key: "phase210-wearever-zenith",
  entityId: PHASE210_ZENITH_ID,
  expectedType: "pen",
  expectedSlug: "the-wearever-zenith",
  canonicalName: "The Wearever Zenith",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wearever-zenith-phase210.md",
  storyTitle: "Wearever Zenith：纯色注塑杆帽与战时金尖",
  primarySourceKey: S.richard.key,
  depthTier: "A",
  aliases: [
    { alias: "The Wearever Zenith", language: "en", sourceKey: S.richard.key },
    { alias: "Wearever Zenith", language: "en", sourceKey: S.penhero.key },
    { alias: "WearEver Zenith", language: "en", sourceKey: S.sterling.key },
    { alias: "Wearever Zenith 钢笔", language: "zh", sourceKey: S.penhero.key },
  ],
  sources: [S.richard, S.penhero, S.sterling, S.fpn, S.peyton, S.svg],
  scopes: [{
    key: penScope,
    scopeKey: penScope,
    productionState: "historical",
    editionScope: "1943–约 1950 的 Zenith；纯色 polystyrene、ruby top、lever filler、战时 14K 与战后钢尖按样本核对",
  }],
  claims: [
    claim(
      "wearever-zenith-identity",
      "model_identity",
      "Zenith 是 David Kahn, Inc. 在 1943 年推出的 Wearever lever filler；公开广告集中出现在 1943–1946 年，Richard's Pens 记录约 1950 年退市。",
      S.richard.key,
      penScope,
      "1943 launch, lever filler and 1950 withdrawal",
      [S.penhero.key],
    ),
    claim(
      "wearever-zenith-material",
      "material_boundary",
      "Zenith 的代表性杆帽采用注塑 polystyrene，早期工艺以纯色为主；它不能与赛璐珞 Pacemaker 或其它 Wearever 型号互换材料描述。",
      S.richard.key,
      penScope,
      "polystyrene solid-color molding and Pacemaker comparison",
      [S.penhero.key],
    ),
    claim(
      "wearever-zenith-filler",
      "filling_system",
      "Zenith 是侧杆式 lever filler，使用传统橡胶墨囊；旧墨囊、section 和 feed 的维修状态按单支记录，不能直接套现代 converter。",
      S.richard.key,
      penScope,
      "completely new lever-filler identity and vintage sac maintenance boundary",
      [S.peyton.key],
    ),
    claim(
      "wearever-zenith-nib",
      "nib_boundary",
      "战时 Zenith 可见 14K 金尖，战后材料供应恢复后出现钢尖；14K 或钢尖都是年份／样本线索，不是全系唯一配置。",
      S.richard.key,
      penScope,
      "wartime gold nib and postwar steel nib transition",
      [S.penhero.key, S.sterling.key],
    ),
    claim(
      "wearever-zenith-appearance",
      "variant_boundary",
      "透明红色 ruby top 固定夹子，桶尾常有相配顶珠；黑、栗红、Coachman's Green、海军蓝等颜色见于资料，带 sterling silver cap band 的实物仍应作为特殊样本核对。",
      S.penhero.key,
      penScope,
      "colours, ruby jewels and sterling cap-band sample",
      [S.sterling.key],
    ),
    claim(
      "wearever-zenith-care",
      "maintenance_guidance",
      "使用前检查墨囊、帽口、顶珠和夹子；用常温水清洗，避免酒精、丙酮、热水与暴晒，墨囊失效时交给熟悉 sac filler 的维修者处理。",
      S.sterling.key,
      penScope,
      "stiff sac, plating, clip and sample condition notes",
      [S.peyton.key],
    ),
    claim(
      "wearever-zenith-selection",
      "selection_guidance",
      "选购时优先核对桶身刻印、red jewels、填充杆、尖端刻字和维修痕迹；14K 金尖或银帽带提高特定样本兴趣，但不保证书写质量。",
      S.sterling.key,
      penScope,
      "sample identity and condition checks",
      [S.penhero.key, S.peyton.key],
    ),
  ],
  variants: [
    {
      key: "wearever-zenith-wartime-gold",
      name: "战时 14K 金尖路线",
      notes: "战争时期材料限制下出现的 14K 金尖版本；按单支尖刻字和来源核对。",
      sourceKey: S.richard.key,
      variantKind: "nib",
      releaseYear: "1943–约 1945",
    },
    {
      key: "wearever-zenith-postwar-steel",
      name: "战后钢尖路线",
      notes: "材料供应恢复后重新出现钢尖；不因钢尖而否定 Zenith 身份。",
      sourceKey: S.richard.key,
      variantKind: "nib",
      releaseYear: "约 1945–1950",
    },
    {
      key: "wearever-zenith-sterling-band",
      name: "Sterling silver cap band 样本",
      notes: "PenHero 记录的特殊饰件样本；目前不把它写成全系常规目录版本。",
      sourceKey: S.sterling.key,
      variantKind: "edition_group",
      releaseYear: "约 1943",
    },
  ],
  spec: {
    brandEntityId: PHASE210_WEAREVER_BRAND_ID,
    values: {
      series_name: "Wearever Zenith",
      release_year: "1943；资料广告集中于 1943–1946，约 1950 年退市",
      origin_country: "美国，新泽西州 North Bergen（David Kahn, Inc.）",
      nib: "战时 14K 金尖；战后钢尖；个别样本可见半柔或后配尖",
      fill_system: "lever filler + 橡胶墨囊",
      material: "注塑 polystyrene 纯色杆帽，金属夹件与 ruby top",
      dimensions: "PenHero 样本约 5 又 5/8 英寸；按单支测量",
      weight: "公开资料未给可覆盖全系的统一值",
      price_range: "历史广告约 1.95 美元；boxed set 约 2.75 美元，非当前估值",
      status: "历史型号，约 1950 年退出连续产品线",
    },
    evidence: [
      specEvidence("brand_entity_id", S.richard.key, "David Kahn maker context"),
      specEvidence("series_name", S.penhero.key, "Wearever Zenith model identity"),
      specEvidence("release_year", S.richard.key, "1943 launch and 1950 withdrawal"),
      specEvidence("origin_country", S.sterling.key, "North Bergen, New Jersey imprint"),
      specEvidence("nib", S.richard.key, "wartime gold and postwar steel transition"),
      specEvidence("fill_system", S.richard.key, "lever-filler identity"),
      specEvidence("material", S.richard.key, "polystyrene and solid-color limitation"),
      specEvidence("dimensions", S.sterling.key, "5 5/8 inch sample"),
      specEvidence("weight", S.peyton.key, "no universal family weight asserted"),
      specEvidence("price_range", S.penhero.key, "historical advertising price"),
      specEvidence("status", S.richard.key, "withdrawal boundary"),
    ],
  },
  media: [{
    key: "phase210-wearever-zenith-primary",
    title: "Wearever Zenith 事实示意图（非产品照片）",
    sourceKey: S.svg.key,
    localPath: S.svg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；示意图，非产品照片，不代表真实颜色、比例、刻印、年份、尖型或保存状态。",
    sourceUrl: S.svg.url,
    usageStatus: "primary",
  }],
  timeline: [
    {
      key: "phase210-wearever-zenith-1943",
      title: "Wearever Zenith 上市",
      eventType: "model_released",
      startDate: "1943",
      circa: false,
      description: "Richard's Pens 将 1943 年推出的 Zenith 视为 David Kahn 的全新注塑 lever filler；PenHero 也收录 1943–1946 年广告。",
      sourceKey: S.richard.key,
    },
    {
      key: "phase210-wearever-zenith-nib",
      title: "战时金尖与战后钢尖转换",
      eventType: "design_milestone",
      startDate: "1945",
      circa: true,
      description: "材料管制放松后，Zenith 从战时 14K 金尖路线回到钢尖路线；具体年份和尖片仍按单支核对。",
      sourceKey: S.richard.key,
    },
  ],
};

export const phase210WeareverZenithPacks: CuratedEntityPack[] = [brand, pen];
