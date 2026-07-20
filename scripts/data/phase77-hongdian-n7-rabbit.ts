import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE77_HONGDIAN_BRAND_FALLBACK_ID = "phase77-brand-hongdian";
export const PHASE77_N7_RABBIT_FALLBACK_ID = "phase77-pen-hongdian-n7-rabbit";
export const PHASE77_N7_RABBIT_SLUG = "hongdian-n7-rabbit";

const RETRIEVED = "2026-07-20";

function live(
  input: Omit<
    CuratedSource,
    | "retrievedAt"
    | "allowedUse"
    | "homepageUrl"
    | "archiveUrl"
    | "archiveLocator"
    | "independenceGroup"
  >,
): CuratedSource {
  return {
    ...input,
    homepageUrl: input.url,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
    independenceGroup: input.registryKey,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase77",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase77",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false`,
  };
}

const SOURCES = {
  retail: live({
    key: "phase77-hongdian-n7-grey-online-mantra",
    registryKey: "online-mantra-phase77",
    registryName: "Online Mantra",
    sourceType: "retailer",
    tier: "primary",
    title: "Hongdian N7 Grey Fountain Pen",
    url: "https://www.onlinemantra.in/products/hongdian-n7-grey-fountain-pen",
    summary:
      "当代零售 SKU 将 N7 Grey 列为灰色树脂笔身、黄铜件、兔子帽顶、旋帽和内置活塞；页面列黑色 PVD steel nib 的 F/M 选项、136 mm、15 mm 与 38 g。这些只适用于该 Grey Rabbit SKU。",
  }),
  archive: live({
    key: "phase77-hongdian-n7-grey-etsy",
    registryKey: "etsy-hongdian-phase77",
    registryName: "Etsy historical listing",
    sourceType: "retailer",
    tier: "contemporary_archive",
    title: "Hongdian N7 Gray Resin Piston Fountain Pen",
    url: "https://www.etsy.com/listing/1178050806/hongdian-n7-gray-resin-piston-fountain",
    summary:
      "历史销售页以 N7 Gray／Rabbit、树脂加黄铜、活塞及 136 mm、15 mm、38 g 重复了核心 SKU 识别；页面提到的 wrench 是包装线索，不能据此要求所有 N7 或所有渠道随附拆解工具。",
  }),
  review: live({
    key: "phase77-hongdian-n7-grey-fpn",
    registryKey: "fountain-pen-network-hongdian-phase77",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "professional_secondary",
    title: "Hongdian N7 Grey user review",
    url: "https://www.fountainpennetwork.com/forum/topic/373871-hongdian-n7-gray/",
    summary:
      "2024 用户样本写到 38 g、约 5.3 in、金属帽偏重、活塞与黑色 long-knife 样本体验；这是个人所持笔的观察，不能外推成所有 N7 的标准重量、笔尖或平衡结论。",
  }),
  boundary: live({
    key: "phase77-hongdian-n7-peacock-rabbit-fpn",
    registryKey: "fountain-pen-network-hongdian-phase77",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "community",
    title: "Hongdian N7 Peacock and Rabbit discussion",
    url: "https://www.fountainpennetwork.com/forum/topic/365357-hongdian-n7-peacock-and-rabbit/",
    summary:
      "讨论把 Peacock 与 Rabbit 作为 N7 的不同主题外观，均在活塞路线语境中出现；它不证明两版的颜色、帽顶、笔尖、零件或包装完全相同。",
  }),
  n12: live({
    key: "phase77-hongdian-n12-boundary",
    registryKey: "fountain-pen-companion-phase77",
    registryName: "Fountain Pen Companion",
    sourceType: "blog",
    tier: "contemporary_archive",
    title: "Hongdian N12 model index",
    url: "https://www.fountainpencompanion.com/pen_brands/79-hongdian/pen_models/1552-n12",
    summary:
      "收藏索引将 N12 单列为 Hongdian 的另一型号并记录多种颜色；它只可用于证明 N12 不应被并到 N7 Rabbit，不承载 N7 的技术规格。",
  }),
  n23: live({
    key: "phase77-hongdian-n23-rabbit-boundary",
    registryKey: "penexchange-phase77",
    registryName: "Penexchange",
    sourceType: "forum",
    tier: "community",
    title: "Hong Dian N23 Year of the Rabbit",
    url: "https://www.penexchange.de/forum_neu/viewtopic.php?t=37029",
    summary:
      "2023 实物帖将 N23 Year of the Rabbit 写为黄铜加树脂、旋帽和 converter/cartridge 路线；它与 N7 Rabbit 同有兔子主题，但不是 N7 的活塞版本。",
  }),
  brandSvg: diagram(
    "phase77-hongdian-brand-svg",
    "HongDian 型号边界事实图",
    "/images/library/site-original/hongdian/hongdian-brand.svg",
  ),
  rabbitSvg: diagram(
    "phase77-hongdian-n7-rabbit-svg",
    "HongDian N7 Grey Rabbit 身份与规格事实图",
    "/images/library/site-original/hongdian/hongdian-n7-rabbit.svg",
  ),
} satisfies Record<string, CuratedSource>;

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function media(key: string, title: string, source: CuratedSource) {
  return [
    {
      key,
      title,
      sourceKey: source.key,
      localPath: source.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、库存、具体笔尖、材料或版本。",
      sourceUrl: source.url,
      usageStatus: "primary" as const,
    },
  ];
}

/** IDs are resolved from exact type/slug/name matches by the apply script, or created there. */
export function phase77HongdianN7RabbitPacks(
  brandId: string,
  penId: string,
): CuratedEntityPack[] {
  const brandScope = "phase77-hongdian-brand-scope";
  const rabbitScope = "phase77-hongdian-n7-rabbit-scope";
  const brand: CuratedEntityPack = {
    key: "phase77-hongdian-brand-v1",
    entityId: brandId,
    expectedType: "brand",
    expectedSlug: "hongdian",
    canonicalName: "HongDian",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/hongdian-n7-rabbit.md",
    storyTitle: "HongDian：先辨型号和主题版，再读规格",
    primarySourceKey: SOURCES.retail.key,
    depthTier: "A",
    aliases: [
      { alias: "HongDian", language: "en", sourceKey: SOURCES.retail.key },
      { alias: "Hongdian", language: "en", sourceKey: SOURCES.retail.key },
      { alias: "弘典", language: "zh", sourceKey: SOURCES.retail.key },
    ],
    sources: [
      SOURCES.retail,
      SOURCES.archive,
      SOURCES.review,
      SOURCES.boundary,
      SOURCES.n12,
      SOURCES.n23,
      SOURCES.brandSvg,
    ],
    scopes: [
      {
        key: brandScope,
        scopeKey: brandScope,
        productionState: "current",
        editionScope:
          "品牌页只反向链接到已完成身份、来源和正文核验的公开型号。N7 Rabbit、N7 Peacock、N12 和 N23 是不同的型号或主题边界，不能仅凭颜色、兔子主题或同为活塞而相互合并。",
      },
    ],
    claims: [
      {
        key: "phase77-hongdian-brand-identity",
        predicate: "brand_identity",
        objectText:
          "HongDian／弘典是当代市场中可辨识的钢笔品牌名称。本页以来源可交叉核对的 N7 Grey Rabbit 为入口；没有将零售资料升级为未证实的法人、创立年份、厂址或全系制造史。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: SOURCES.retail.key,
        locator: SOURCES.retail.summary,
        evidence: [
          {
            key: "phase77-hongdian-brand-identity-evidence",
            sourceKey: SOURCES.retail.key,
            scopeKey: brandScope,
            locator: SOURCES.retail.summary,
          },
          {
            key: "phase77-hongdian-brand-archive-evidence",
            sourceKey: SOURCES.archive.key,
            scopeKey: brandScope,
            locator: SOURCES.archive.summary,
          },
          {
            key: "phase77-hongdian-brand-sample-evidence",
            sourceKey: SOURCES.review.key,
            scopeKey: brandScope,
            locator: "独立用户样本确认 N7 Grey 的具体市场称呼；不据此推断品牌法人或全系规格。",
          },
        ],
      },
      {
        key: "phase77-hongdian-brand-navigation",
        predicate: "brand_model_navigation",
        objectText:
          "N7 Rabbit 是 N7 的灰色兔子主题版本；Peacock 是另一主题外观。N12 虽也在活塞语境出现，仍是独立型号；N23 Year of the Rabbit 使用 converter/cartridge，不能因兔子主题或材料相似而并入 N7。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: SOURCES.boundary.key,
        locator: SOURCES.boundary.summary,
        evidence: [
          {
            key: "phase77-hongdian-brand-theme-evidence",
            sourceKey: SOURCES.boundary.key,
            scopeKey: brandScope,
            locator: SOURCES.boundary.summary,
          },
          {
            key: "phase77-hongdian-brand-n12-evidence",
            sourceKey: SOURCES.n12.key,
            scopeKey: brandScope,
            locator: SOURCES.n12.summary,
          },
          {
            key: "phase77-hongdian-brand-n23-evidence",
            sourceKey: SOURCES.n23.key,
            scopeKey: brandScope,
            locator: SOURCES.n23.summary,
          },
        ],
      },
    ],
    media: media(
      "phase77-hongdian-brand-media",
      "HongDian 型号边界事实图（非产品照片）",
      SOURCES.brandSvg,
    ),
    timeline: [
      {
        key: "phase77-hongdian-n7-market-record",
        title: "N7 Grey Rabbit 的当代 SKU 记录",
        eventType: "model_released",
        startDate: "2026",
        circa: true,
        description:
          "当代零售 SKU 可核对 N7 Grey Rabbit 的主题、活塞与规格；这不是型号首发年，也不是品牌创立年。",
        sourceKey: SOURCES.retail.key,
      },
      {
        key: "phase77-hongdian-n7-sample-record",
        title: "N7 Grey 的用户样本讨论",
        eventType: "community_event",
        startDate: "2024",
        circa: false,
        description:
          "用户样本讨论记录了灰色 N7 的重量、帽重和笔尖感受；观察只属于作者所持样本。",
        sourceKey: SOURCES.review.key,
      },
    ],
  };
  const pen: CuratedEntityPack = {
    key: "phase77-hongdian-n7-rabbit-v1",
    entityId: penId,
    expectedType: "pen",
    expectedSlug: PHASE77_N7_RABBIT_SLUG,
    canonicalName: "HongDian N7 Grey Rabbit",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/hongdian-n7-rabbit.md",
    storyTitle: "HongDian N7 Grey Rabbit：先确认这是一支活塞主题版",
    primarySourceKey: SOURCES.retail.key,
    depthTier: "A",
    aliases: [
      { alias: "HongDian N7 Grey Rabbit", language: "en", sourceKey: SOURCES.retail.key },
      { alias: "Hongdian N7 Grey", language: "en", sourceKey: SOURCES.retail.key },
      { alias: "Hongdian N7 Rabbit", language: "en", sourceKey: SOURCES.archive.key },
      { alias: "Hongdian N7 Moon Rabbit", language: "en", sourceKey: SOURCES.archive.key },
      { alias: "弘典 N7 灰兔", language: "zh", sourceKey: SOURCES.retail.key },
    ],
    sources: [
      SOURCES.retail,
      SOURCES.archive,
      SOURCES.review,
      SOURCES.boundary,
      SOURCES.n12,
      SOURCES.n23,
      SOURCES.rabbitSvg,
    ],
    scopes: [
      {
        key: rabbitScope,
        scopeKey: rabbitScope,
        productionState: "current",
        editionScope:
          "N7 Grey Rabbit 的灰色树脂、兔子帽顶、黄铜件、黑色 PVD steel nib 和 F/M 选项由特定零售 SKU 支持。N7 Peacock、N12、N23 和其他笔尖组合须各自按版本核对。",
      },
    ],
    claims: [
      {
        key: "phase77-n7-rabbit-identity",
        predicate: "model_identity",
        objectText:
          "HongDian N7 Grey Rabbit 是 N7 系列的灰色兔子主题版本。已核对的商品资料列其为树脂笔身、黄铜件、旋帽和内置活塞；兔子帽顶是该版识别点，不应用 N7 Peacock 或 N23 的实物图和结构替代。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.retail.key,
        locator: SOURCES.retail.summary,
        evidence: [
          {
            key: "phase77-n7-rabbit-identity-evidence",
            sourceKey: SOURCES.retail.key,
            scopeKey: rabbitScope,
            locator: SOURCES.retail.summary,
          },
          {
            key: "phase77-n7-rabbit-archive-evidence",
            sourceKey: SOURCES.archive.key,
            scopeKey: rabbitScope,
            locator: SOURCES.archive.summary,
          },
          {
            key: "phase77-n7-rabbit-sample-evidence",
            sourceKey: SOURCES.review.key,
            scopeKey: rabbitScope,
            locator: "独立用户样本确认 N7 Grey 的重量、活塞和具体笔尖观察；仅用于交叉核对 SKU 身份，不外推为全系规格。",
          },
        ],
      },
      {
        key: "phase77-n7-rabbit-boundary",
        predicate: "version_boundary",
        objectText:
          "Peacock 与 Rabbit 可共处 N7 活塞系列，却是不同主题外观；N12 是另一编号型号，N23 Year of the Rabbit 则是 converter/cartridge 路线。它们没有足够的同一性证据，不建立相互重定向或互换规格。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.boundary.key,
        locator: SOURCES.boundary.summary,
        evidence: [
          {
            key: "phase77-n7-rabbit-theme-evidence",
            sourceKey: SOURCES.boundary.key,
            scopeKey: rabbitScope,
            locator: SOURCES.boundary.summary,
          },
          {
            key: "phase77-n7-rabbit-n12-evidence",
            sourceKey: SOURCES.n12.key,
            scopeKey: rabbitScope,
            locator: SOURCES.n12.summary,
          },
          {
            key: "phase77-n7-rabbit-n23-evidence",
            sourceKey: SOURCES.n23.key,
            scopeKey: rabbitScope,
            locator: SOURCES.n23.summary,
          },
        ],
      },
      {
        key: "phase77-n7-rabbit-care",
        predicate: "maintenance_boundary",
        objectText:
          "活塞笔日常可用室温清水反复吸排、自然干燥，并先观察活塞和连续供墨。公开页面对 wrench 的包装信息不一致，不能把自行拆活塞列为常规保养；异常紧涩、渗漏或吸不上墨时，应联系销售方或专业维修者。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: SOURCES.archive.key,
        locator: SOURCES.archive.summary,
        evidence: [
          {
            key: "phase77-n7-rabbit-care-evidence",
            sourceKey: SOURCES.archive.key,
            scopeKey: rabbitScope,
            locator: SOURCES.archive.summary,
          },
        ],
      },
    ],
    variants: [
      {
        key: "phase77-n7-grey-rabbit",
        name: "Grey Rabbit／Moon Rabbit",
        notes:
          "灰色树脂与兔子帽顶的版本名称在市场资料中并存；本文将它们作为同一 Grey Rabbit SKU 的可检索名称，而不是未经核实的两个独立笔型。",
        sourceKey: SOURCES.archive.key,
        variantKind: "market_sku",
        market: "retailer",
      },
      {
        key: "phase77-n7-nib-options",
        name: "黑色 PVD steel nib：F／M 与渠道选项",
        notes:
          "Online Mantra 的 Grey SKU 列 F/M；其他渠道出现的 EF 或 long-knife 只能作为其自身销售配置，不能覆盖全部 N7 Rabbit。",
        sourceKey: SOURCES.retail.key,
        variantKind: "nib",
        market: "retailer",
      },
    ],
    spec: {
      brandEntityId: brandId,
      values: {
        series_name: "HongDian N7 Grey Rabbit",
        release_year: "当代与历史零售 SKU 可见；具体首发年份未找到可追溯产品档案",
        origin_country: "当代市场产品；本页不从零售商品页推断制造方、工厂或产地",
        nib: "该 Grey SKU 列黑色 PVD steel nib，F/M 可选；其他渠道的 EF 或 long-knife 仅属相应 SKU",
        fill_system: "内置活塞上墨；使用瓶装钢笔墨水，不使用 N23 的 converter/cartridge 说明",
        material: "Grey Rabbit SKU：灰色树脂笔身、黄铜件、兔子帽顶；N7 Peacock 与其他主题版的材料和饰面另行核对",
        dimensions: "合盖约 136 mm；最大直径约 15 mm（Grey Rabbit 公开 SKU 值）",
        weight: "约 38 g（Grey Rabbit 公开 SKU 值；用户样本亦提到相近量级）",
        status: "当代／历史零售记录均可见；笔尖、颜色、包装、工具和库存按具体卖家 SKU 核对",
      },
      evidence: [
        evidence("brand_entity_id", "phase77-n7-brand", SOURCES.retail.key, rabbitScope, "retailer brand/model context; maker relation is set by exact identity resolver"),
        evidence("series_name", "phase77-n7-series", SOURCES.retail.key, rabbitScope, "N7 Grey product title and Rabbit cap-top description"),
        evidence("release_year", "phase77-n7-release", SOURCES.archive.key, rabbitScope, "historical/current retail visibility, not a launch-date claim"),
        evidence("origin_country", "phase77-n7-origin", SOURCES.retail.key, rabbitScope, "retailer context only; no unsupported origin claim"),
        evidence("nib", "phase77-n7-nib", SOURCES.retail.key, rabbitScope, "black PVD steel F/M Grey SKU options"),
        evidence("fill_system", "phase77-n7-fill", SOURCES.retail.key, rabbitScope, "built-in piston product field"),
        evidence("material", "phase77-n7-material", SOURCES.retail.key, rabbitScope, "grey resin, brass fittings and rabbit cap-top SKU fields"),
        evidence("dimensions", "phase77-n7-dimensions", SOURCES.retail.key, rabbitScope, "136 mm / 15 mm Grey SKU fields"),
        evidence("weight", "phase77-n7-weight", SOURCES.retail.key, rabbitScope, "38 g Grey SKU field, corroborated as sample-scale only by FPN"),
        evidence("status", "phase77-n7-status", SOURCES.archive.key, rabbitScope, "current and historical retail listings"),
      ],
    },
    media: media(
      "phase77-hongdian-n7-rabbit-media",
      "HongDian N7 Grey Rabbit 身份与规格事实图（非产品照片）",
      SOURCES.rabbitSvg,
    ),
    timeline: [
      {
        key: "phase77-n7-rabbit-retail-record",
        title: "N7 Grey Rabbit 的规格 SKU",
        eventType: "model_released",
        startDate: "2026",
        circa: true,
        description:
          "当代商品页列出 Grey Rabbit 的结构、F/M、尺寸和重量；该记录不等同于型号首发时间或全系列规格。",
        sourceKey: SOURCES.retail.key,
      },
      {
        key: "phase77-n7-rabbit-user-sample",
        title: "Grey N7 的个人书写样本",
        eventType: "community_event",
        startDate: "2024-01-11",
        circa: false,
        description:
          "Fountain Pen Network 作者记录自己所持 Grey N7 的帽重、插帽平衡和 long-knife 样本感受；不推广为统一品控结论。",
        sourceKey: SOURCES.review.key,
      },
    ],
  };
  return [brand, pen];
}
