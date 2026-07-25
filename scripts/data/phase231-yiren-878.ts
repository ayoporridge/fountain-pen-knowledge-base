import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

export const PHASE231_YIREN_BRAND_ID = "ncUFilOHTET2";
export const PHASE231_YIREN_878_ID = "pJVODqR4jDGw";
export const PHASE231_YIREN_BRAND_SLUG = "yiren";
export const PHASE231_YIREN_878_SLUG = "依人-yiren-878";

const RETRIEVED = "2026-07-26";

function live(
  input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "homepageUrl" | "archiveUrl" | "archiveLocator" | "independenceGroup">,
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
    registryKey: "fountain-pen-graph-editorial-phase231",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase231",
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
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false`,
  };
}

const SOURCES = {
  specialistRetailer: live({
    key: "phase231-yiren-878-specialist-retailer",
    registryKey: "plnici-pero-yiren-878-phase231",
    registryName: "Plnicí pero",
    sourceType: "retailer",
    tier: "contemporary_archive",
    title: "Plnicí pero: Yiren 878",
    url: "https://www.plnici-pero.cz/ostatni-plnici-pera/162-plnici-pero-yiren-878.html",
    summary: "专营钢笔零售页将 Yiren 878 列为全金属 gun-metal 钢笔；标注 F/0.5 mm 不锈钢尖、转换器或标准短/长墨囊、139/123/11 mm 与 53 g，均属该商品样本。",
  }),
  everydayScrawl: live({
    key: "phase231-yiren-878-everyday-scrawl",
    registryKey: "everyday-scrawl-yiren-878-phase231",
    registryName: "Everyday Scrawl",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Everyday Scrawl: Yiren 878",
    url: "https://everydayscrawlcom.wordpress.com/2020/10/20/yiren-878/",
    author: "Joshua Williams",
    publishedAt: "2020-10-20",
    summary: "独立试写把 878 描述为有分量的全金属笔，提到光滑握位、标准墨囊/转换器、扣合感与该作者样本的连续顺滑书写。",
  }),
  chrisRaper: live({
    key: "phase231-yiren-brand-chris-raper",
    registryKey: "chris-raper-chinese-pens-phase231",
    registryName: "Chris Raper",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Chris Raper: Chinese fountain pens — Yiren",
    url: "https://chrisraper.org.uk/blog/chinese-fountain-pens/",
    author: "Chris Raper",
    summary: "独立中国钢笔索引把 Yiren 作为可辨认的小品牌入口，并提醒部分商品仅靠外观难以归属；不承载未经核实的公司沿革。",
  }),
  fountainPenNetwork: live({
    key: "phase231-yiren-878-fpn",
    registryKey: "fountain-pen-network-yiren-878-phase231",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "community",
    title: "Fountain Pen Network: Yiren Company",
    url: "https://www.fountainpennetwork.com/forum/topic/343776-yiren-company/",
    author: "RayTheron and forum participants",
    publishedAt: "2019-02-15",
    summary: "论坛讨论以 Yiren 878 为明确对象，记录爱好者对型号和品牌归属的辨认；个人评价不外推为统一规格。",
  }),
  jdCatalog: live({
    key: "phase231-yiren-brand-jd-catalog",
    registryKey: "jd-yiren-models-phase231",
    registryName: "京东型号页",
    sourceType: "retailer",
    tier: "retailer",
    title: "京东：依人（YIREN）型号规格",
    url: "https://www.jd.com/xinghao/670d92fea08d2bd56e5.html",
    summary: "中文零售型号页列出 878 新款镀银钢笔与 0.5 mm 商品标题，说明存在不同表面或套装写法；不替代具体 SKU 的实物核对。",
  }),
  brandSvg: diagram("phase231-yiren-brand-svg", "依人 Yiren 品牌入口事实图", "/images/library/site-original/phase231/yiren/yiren-878-structure.svg"),
  penSvg: diagram("phase231-yiren-878-svg", "依人 Yiren 878 结构事实图", "/images/library/site-original/phase231/yiren/yiren-878-structure.svg"),
};

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function media(key: string, title: string, source: CuratedSource) {
  return [{
    key,
    title,
    sourceKey: source.key,
    localPath: source.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不表示真实比例、颜色、Logo、刻字、库存或具体批次。",
    sourceUrl: source.url,
    usageStatus: "primary" as const,
  }];
}

export const phase231Yiren878Packs: CuratedEntityPack[] = [
  {
    key: "phase231-yiren-brand-v1",
    entityId: PHASE231_YIREN_BRAND_ID,
    expectedType: "brand",
    expectedSlug: PHASE231_YIREN_BRAND_SLUG,
    canonicalName: "依人 Yiren",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/yiren-878-phase231.md",
    storyTitle: "依人 Yiren：先从可核对的 878 认识这个品牌入口",
    primarySourceKey: SOURCES.chrisRaper.key,
    depthTier: "B",
    aliases: [
      { alias: "依人", language: "zh", sourceKey: SOURCES.jdCatalog.key },
      { alias: "YIREN", language: "en", sourceKey: SOURCES.jdCatalog.key },
      { alias: "Yiren", language: "en", sourceKey: SOURCES.chrisRaper.key },
    ],
    sources: [SOURCES.chrisRaper, SOURCES.specialistRetailer, SOURCES.fountainPenNetwork, SOURCES.jdCatalog, SOURCES.brandSvg],
    scopes: [{ key: "phase231-yiren-brand-scope", scopeKey: "phase231-yiren-brand-scope", productionState: "current", editionScope: "公开市场中的依人品牌入口；仅反链已经独立核验的型号，不推断公司沿革或完整产品线" }],
    claims: [
      {
        key: "phase231-yiren-brand-identity",
        predicate: "brand_identity",
        objectText: "Yiren／依人是公开市场中可辨认的当代中国钢笔品牌入口；独立索引将其与南昌依人笔业相关联，但本站不把该线索升级为未经厂商档案证明的公司历史。",
        factClass: "core",
        confidence: 0.92,
        sourceKey: SOURCES.chrisRaper.key,
        locator: SOURCES.chrisRaper.summary,
        evidence: [{ key: "phase231-yiren-brand-identity-evidence", sourceKey: SOURCES.chrisRaper.key, scopeKey: "phase231-yiren-brand-scope", locator: SOURCES.chrisRaper.summary }],
      },
      {
        key: "phase231-yiren-brand-boundary",
        predicate: "brand_navigation_boundary",
        objectText: "依人品牌页先以 878 作为已完成身份与来源核验的代表型号；其他依人三位数型号必须分别核对名称、图片、规格和销售包后再加入。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: SOURCES.specialistRetailer.key,
        locator: "Yiren 878 exact product identity and specialist retail context",
        evidence: [
          { key: "phase231-yiren-brand-model-evidence", sourceKey: SOURCES.specialistRetailer.key, scopeKey: "phase231-yiren-brand-scope", locator: SOURCES.specialistRetailer.summary },
          { key: "phase231-yiren-brand-community-evidence", sourceKey: SOURCES.fountainPenNetwork.key, scopeKey: "phase231-yiren-brand-scope", locator: SOURCES.fountainPenNetwork.summary },
        ],
      },
    ],
    media: media("phase231-yiren-brand-media", "依人 Yiren 878 结构事实图（非产品照片）", SOURCES.brandSvg),
    timeline: [
      { key: "phase231-yiren-878-2019", title: "878 在爱好者讨论中被明确辨认", eventType: "community_event", startDate: "2019", circa: false, description: "Fountain Pen Network 讨论以 Yiren 878 为明确对象；这是型号辨认记录，不等同于品牌成立或型号首发年份。", sourceKey: SOURCES.fountainPenNetwork.key },
      { key: "phase231-yiren-878-2020", title: "878 的独立试写记录", eventType: "community_event", startDate: "2020", circa: false, description: "Everyday Scrawl 发布 878 独立试写，记录金属笔身、标准墨囊／转换器和具体样本的书写体验。", sourceKey: SOURCES.everydayScrawl.key },
    ],
  },
  {
    key: "phase231-yiren-878-v1",
    entityId: PHASE231_YIREN_878_ID,
    expectedType: "pen",
    expectedSlug: PHASE231_YIREN_878_SLUG,
    canonicalName: "依人 Yiren 878",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/yiren-878-phase231.md",
    storyTitle: "依人 Yiren 878：金属外壳、转换器与一支被低估的日用笔",
    primarySourceKey: SOURCES.specialistRetailer.key,
    depthTier: "B",
    aliases: [
      { alias: "Yiren 878", language: "en", sourceKey: SOURCES.specialistRetailer.key },
      { alias: "YIREN 878", language: "en", sourceKey: SOURCES.jdCatalog.key },
      { alias: "依人 878", language: "zh", sourceKey: SOURCES.jdCatalog.key },
      { alias: "依人 878 新款镀银钢笔", language: "zh", kind: "regional_name", market: "中国渠道", sourceKey: SOURCES.jdCatalog.key },
    ],
    sources: [SOURCES.specialistRetailer, SOURCES.everydayScrawl, SOURCES.fountainPenNetwork, SOURCES.jdCatalog, SOURCES.penSvg],
    scopes: [{ key: "phase231-yiren-878-scope", scopeKey: "phase231-yiren-878-scope", productionState: "current", editionScope: "Yiren 878 主型号；颜色、表面、套装、转换器与笔尖以具体销售 SKU 为准" }],
    claims: [
      {
        key: "phase231-yiren-878-identity",
        predicate: "model_identity",
        objectText: "Yiren 878 是依人品牌下的独立三位数型号；专业零售页、中文型号页与 2019 年爱好者讨论均以 878 作为同一型号名称，不能因数字相近而并入 868、886 或其他依人笔。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: SOURCES.specialistRetailer.key,
        locator: "exact product heading: Plnicí pero Yiren 878",
        evidence: [
          { key: "phase231-yiren-878-identity-retailer", sourceKey: SOURCES.specialistRetailer.key, scopeKey: "phase231-yiren-878-scope", locator: SOURCES.specialistRetailer.summary },
          { key: "phase231-yiren-878-identity-forum", sourceKey: SOURCES.fountainPenNetwork.key, scopeKey: "phase231-yiren-878-scope", locator: SOURCES.fountainPenNetwork.summary },
        ],
      },
      {
        key: "phase231-yiren-878-fill",
        predicate: "filling_system",
        objectText: "已查零售样本使用随笔转换器或标准短／长墨囊；转换器规格与是否随盒仍应按实际销售包确认。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: SOURCES.specialistRetailer.key,
        locator: SOURCES.specialistRetailer.summary,
        evidence: [{ key: "phase231-yiren-878-fill-evidence", sourceKey: SOURCES.specialistRetailer.key, scopeKey: "phase231-yiren-878-scope", locator: "Hrot a plnění: converter or standard short/long cartridge" }],
      },
      {
        key: "phase231-yiren-878-experience",
        predicate: "sample_experience",
        objectText: "Everyday Scrawl 的 2020 样本认为全金属外壳带来适中的分量，金属握位偏光滑；该作者的样本连续、顺滑且没有跳笔，属于单支试写观察，不外推为全批次保证。",
        factClass: "editorial",
        confidence: 0.94,
        sourceKey: SOURCES.everydayScrawl.key,
        locator: SOURCES.everydayScrawl.summary,
        evidence: [{ key: "phase231-yiren-878-experience-evidence", sourceKey: SOURCES.everydayScrawl.key, scopeKey: "phase231-yiren-878-scope", locator: SOURCES.everydayScrawl.summary }],
      },
      {
        key: "phase231-yiren-878-care",
        predicate: "maintenance_boundary",
        objectText: "换墨时先用室温清水反复吸排并自然干燥；金属表面只用柔软干布轻拭，避开酒精、磨料和强拆。持续漏墨、转换器松脱或笔尖刮纸时，应保留照片与 SKU 信息并联系销售方或维修者。",
        factClass: "core",
        confidence: 0.96,
        sourceKey: SOURCES.specialistRetailer.key,
        locator: "converter/cartridge construction and metal-body care boundary",
        evidence: [{ key: "phase231-yiren-878-care-evidence", sourceKey: SOURCES.specialistRetailer.key, scopeKey: "phase231-yiren-878-scope", locator: "full-metal body, converter/cartridge filling; conservative care guidance" }],
      },
    ],
    spec: {
      brandEntityId: PHASE231_YIREN_BRAND_ID,
      values: {
        series_name: "Yiren 878",
        release_year: "至少 2020 年已有独立试写记录；首发年份未核实",
        origin_country: "中国制造；具体制造商、工厂与批次未以官方档案核实",
        nib: "不锈钢尖；零售样本约 F / 0.5 mm，带 iridium tip",
        fill_system: "随笔转换器或标准短／长墨囊",
        material: "全金属笔身；零售样本为 gun-metal 外观，中文渠道另见镀银标题",
        dimensions: "零售样本闭帽约 139 mm，去帽约 123 mm，握位直径约 11 mm",
        weight: "零售样本约 53 g；表面、配件与墨水状态会影响称重",
        status: "当代零售与二手渠道仍可见；库存、颜色、包装和配件按 SKU 核对",
      },
      evidence: [
        evidence("brand_entity_id", "phase231-yiren-878-brand", SOURCES.specialistRetailer.key, "phase231-yiren-878-scope", "Yiren 878 exact product context"),
        evidence("series_name", "phase231-yiren-878-series", SOURCES.specialistRetailer.key, "phase231-yiren-878-scope", "exact product heading"),
        evidence("release_year", "phase231-yiren-878-release", SOURCES.everydayScrawl.key, "phase231-yiren-878-scope", "2020 independent review date is an observed record, not launch year"),
        evidence("origin_country", "phase231-yiren-878-origin", SOURCES.specialistRetailer.key, "phase231-yiren-878-scope", "Vyrobeno v Číně"),
        evidence("nib", "phase231-yiren-878-nib", SOURCES.specialistRetailer.key, "phase231-yiren-878-scope", "F 0.5 mm stainless nib with iridium tip"),
        evidence("fill_system", "phase231-yiren-878-fill-spec", SOURCES.specialistRetailer.key, "phase231-yiren-878-scope", "converter or standard short/long cartridge"),
        evidence("material", "phase231-yiren-878-material", SOURCES.specialistRetailer.key, "phase231-yiren-878-scope", "full-metal gun-metal body and trim"),
        evidence("dimensions", "phase231-yiren-878-dimensions", SOURCES.specialistRetailer.key, "phase231-yiren-878-scope", "139 mm / 123 mm / 11 mm retail sample"),
        evidence("weight", "phase231-yiren-878-weight", SOURCES.specialistRetailer.key, "phase231-yiren-878-scope", "53 g retail sample"),
        evidence("status", "phase231-yiren-878-status", SOURCES.specialistRetailer.key, "phase231-yiren-878-scope", "current retail listing observed during research"),
      ],
    },
    media: media("phase231-yiren-878-media", "依人 Yiren 878 结构事实图（非产品照片）", SOURCES.penSvg),
    timeline: [{ key: "phase231-yiren-878-sample-2020", title: "独立试写记录", eventType: "community_event", startDate: "2020", circa: false, description: "Everyday Scrawl 发布一支 Yiren 878 的独立试写，记录全金属笔身、标准墨囊／转换器和该样本的书写表现。", sourceKey: SOURCES.everydayScrawl.key }],
  },
];
