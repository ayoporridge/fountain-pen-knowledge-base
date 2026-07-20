import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE95_MOORE_BRAND_ID = "fvOdtqcgGCmx";
export const PHASE95_MOORE_NON_LEAKABLE_ID = "979eBhBZJMjH";

const RETRIEVED = "2026-07-20";

function source(
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

function diagram(key: string, title: string, url: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase95",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase95",
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

const S = {
  patent: source({
    key: "phase95-moore-us567151",
    registryKey: "google-patents-us567151",
    registryName: "Google Patents / United States Patent Office record",
    sourceType: "patent",
    tier: "primary",
    title: "US567151A — Fountain-pen",
    url: "https://patents.google.com/patent/US567151A/en",
    publishedAt: "1896-09-08",
    summary:
      "Morris W. Moore 的 1894 年申请、1896 年授权专利记录了可在笔杆内收纳笔尖的 fountain-pen 结构；它是设计来源，不等于每一支量产品的完整零件清单。",
  }),
  vintage: source({
    key: "phase95-moore-vintagepens",
    registryKey: "vintagepens-moore-safety",
    registryName: "Vintage Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Moore Safety Pens",
    url: "https://www.vintagepens.com/Moore_safeties.shtml",
    summary:
      "专业历史资料将 Moore safety 描述为直线滑套伸缩笔尖、旋帽密封笔杆的系列；称其约 1898 年进入完整商业生产、1917 年公司改名、杠杆上墨出现后 Non-Leakable 仍生产到 1920 年代末，并提示修复后的旧笔才适合使用。",
  }),
  ross: source({
    key: "phase95-moore-rosspens",
    registryKey: "rosspens-moore-history",
    registryName: "Ross Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "The History of the Moore Pen Company",
    url: "https://www.rosspens.com/about/Moore%20Pen%20History/",
    summary:
      "历史整理将 American Fountain Pen Company 的 Boston 起点、Morris W. Moore 的设计来源、1899 年前后商品化、1917 年改名 Moore Pen Company，以及黑色硬橡胶与金属包覆等不同装饰路线分开说明。",
  }),
  richard: source({
    key: "phase95-moore-richardspens",
    registryKey: "richardspens-moore-nonleak",
    registryName: "Richard's Pens",
    sourceType: "blog",
    tier: "contemporary_archive",
    title: "Moore's Non-Leakable Fountain Pen profile",
    url: "https://www.richardspens.com/ref/profiles/nonleak.htm",
    summary:
      "带专利、广告和实物图的历史档案区分早期滑套结构、1903 年的帽内保护设计、Tourist/Midget 等销售名称及多种尺寸和包覆；单一编号或图片不可外推为整个家族的统一规格。",
  }),
  brandSvg: diagram(
    "phase95-moore-brand-svg",
    "Moore 品牌与年代导航事实卡",
    "/images/library/site-original/moore/moore-brand.svg",
    "本站原创 SVG，标出 American Fountain Pen Company、Moore Pen Company 与 Non-Leakable 的年代关系；不是产品照片。",
  ),
  penSvg: diagram(
    "phase95-moore-non-leakable-svg",
    "Moore's Non-Leakable 结构与维护事实卡",
    "/images/library/site-original/moore/moore-non-leakable.svg",
    "本站原创 SVG，概念性说明收尖、滑套和旋帽密封；不是产品照片、拆解图或维修指南。",
  ),
};

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

const brandScope = "phase95-moore-brand-scope";
const penScope = "phase95-moore-non-leakable-scope";

const brand: CuratedEntityPack = {
  key: "phase95-moore-brand-v1",
  entityId: PHASE95_MOORE_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "moore",
  canonicalName: "Moore",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/moore-brand.md",
  storyTitle: "Moore：从 American Fountain Pen 到 Moore Pen 的历史品牌导航",
  primarySourceKey: S.ross.key,
  depthTier: "A",
  aliases: [
    { alias: "Moore", language: "en", sourceKey: S.ross.key },
    { alias: "Moore Pen Company", language: "en", kind: "former_name", sourceKey: S.ross.key },
    { alias: "American Fountain Pen Company", language: "en", kind: "former_name", sourceKey: S.ross.key },
    { alias: "摩尔", language: "zh", sourceKey: S.ross.key },
  ],
  sources: [S.ross, S.vintage, S.richard, S.brandSvg],
  scopes: [
    {
      key: brandScope,
      scopeKey: brandScope,
      productionState: "historical",
      editionScope:
        "Boston 的 American Fountain Pen Company／后来的 Moore Pen Company 历史语境；型号、年代、材料和上墨方式必须在各型号页单独判断。",
    },
  ],
  claims: [
    {
      key: "phase95-moore-brand-identity",
      predicate: "brand_identity",
      objectText:
        "Moore 是美国历史钢笔品牌导航名：早期产品由 Boston 的 American Fountain Pen Company 销售，1917 年前后改称 Moore Pen Company。品牌名、公司名与具体笔身刻字会因年代并存，不能据此把安全笔、杠杆笔和后期产品合成一支笔。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.ross.key,
      locator: "company history and 1917 name change",
      evidence: [
        {
          key: "phase95-moore-brand-identity-ross",
          sourceKey: S.ross.key,
          scopeKey: brandScope,
          locator: "American Fountain Pen Company, Boston, and 1917 Moore Pen Company chronology",
        },
        {
          key: "phase95-moore-brand-identity-vintage",
          sourceKey: S.vintage.key,
          scopeKey: brandScope,
          locator: "American Fountain Pen Company / Moore Pen Company safety-pen history",
        },
      ],
    },
    {
      key: "phase95-moore-brand-navigation",
      predicate: "series_navigation",
      objectText:
        "本页目前链接已完成来源整理的 Moore’s Non-Leakable 安全笔。后来的 Finger Tip、杠杆上墨与其他 Moore 产品须以各自铭文、结构和年代另建页面；装饰包覆、尺寸编号和广告名称不是自动的新型号。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.vintage.key,
      locator: "safety/lever-filler and variant boundary",
      evidence: [
        {
          key: "phase95-moore-brand-nav-vintage",
          sourceKey: S.vintage.key,
          scopeKey: brandScope,
          locator: "lever-filler introduction and retained Non-Leakable production",
        },
        {
          key: "phase95-moore-brand-nav-richard",
          sourceKey: S.richard.key,
          scopeKey: brandScope,
          locator: "sizes, Tourist/Midget names, and trim boundary",
        },
      ],
    },
  ],
  media: [
    {
      key: "phase95-moore-brand-media",
      title: "Moore 品牌年代导航事实卡（非产品照片）",
      sourceKey: S.brandSvg.key,
      localPath: S.brandSvg.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片。",
      sourceUrl: S.brandSvg.url,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "phase95-moore-brand-commercial",
      title: "American Fountain Pen Company 销售 Moore’s Non-Leakable",
      eventType: "design_milestone",
      startDate: "1899",
      circa: true,
      description: "1898/1899 的资料记载略有差异，因此这里以约 1899 年表示商业化窗口，而非假定精确上市日。",
      sourceKey: S.ross.key,
    },
    {
      key: "phase95-moore-brand-rename",
      title: "公司改称 Moore Pen Company",
      eventType: "design_milestone",
      startDate: "1917",
      circa: false,
      description: "改名不表示早期安全笔即时停产；资料显示它与后续杠杆上墨产品并行一段时间。",
      sourceKey: S.vintage.key,
    },
  ],
};

const nonLeakable: CuratedEntityPack = {
  key: "phase95-moore-non-leakable-v1",
  entityId: PHASE95_MOORE_NON_LEAKABLE_ID,
  expectedType: "pen",
  expectedSlug: "moore-s-non-leakable-fountain-pen",
  canonicalName: "Moore’s Non-Leakable Fountain Pen",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/moore-non-leakable.md",
  storyTitle: "Moore’s Non-Leakable：收尖安全笔，不是一支统一规格的“防漏老笔”",
  primarySourceKey: S.patent.key,
  depthTier: "A",
  aliases: [
    { alias: "Moore’s Non-Leakable Fountain Pen", language: "en", sourceKey: S.vintage.key },
    { alias: "Moore Non-Leakable", language: "en", sourceKey: S.vintage.key },
    { alias: "Moore safety pen", language: "en", sourceKey: S.vintage.key },
    { alias: "摩尔防漏安全笔", language: "zh", sourceKey: S.vintage.key },
  ],
  sources: [S.patent, S.vintage, S.ross, S.richard, S.penSvg],
  scopes: [
    {
      key: penScope,
      scopeKey: penScope,
      productionState: "historical",
      editionScope:
        "约 1898/1899 至 1920 年代末的 Moore retracting-nib safety family；具体编号、尺寸、硬橡胶、金属包覆、笔尖和改良版须按实物及资料逐支判断。",
    },
  ],
  claims: [
    {
      key: "phase95-moore-non-leakable-identity",
      predicate: "model_identity",
      objectText:
        "Moore’s Non-Leakable 是以可收回笔尖、滑动笔杆套与旋帽密封为核心的一组历史安全笔。它源自 Morris W. Moore 的 1890 年代专利并由 American Fountain Pen Company 在 Boston 商品化；“Non-Leakable”是系列名称，不是对一百多年后每支未修复旧笔的性能保证。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.patent.key,
      locator: "1894 application / 1896 patent record and historical production context",
      evidence: [
        {
          key: "phase95-moore-non-leakable-patent",
          sourceKey: S.patent.key,
          scopeKey: penScope,
          locator: "US567151A, filed 1894 and published 1896, retractable fountain-pen mechanism",
        },
        {
          key: "phase95-moore-non-leakable-vintage",
          sourceKey: S.vintage.key,
          scopeKey: penScope,
          locator: "straight-line sleeve, retracting nib, screw cap and factory-filled historical claim",
        },
      ],
    },
    {
      key: "phase95-moore-non-leakable-boundary",
      predicate: "version_boundary",
      objectText:
        "早期短帽／长开槽滑套结构、约 1903 年后的外形、Improved 或 Banker、Twistout、Ink-Tab、Tourist、Midget 以及不同金属包覆和编号都不能一概而论。1918 年前后出现的杠杆上墨 Moore 产品与本页的收尖安全笔不是同一上墨结构；尽管两者曾同时销售。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.vintage.key,
      locator: "early/late safety variants and lever-filler boundary",
      evidence: [
        {
          key: "phase95-moore-non-leakable-boundary-vintage",
          sourceKey: S.vintage.key,
          scopeKey: penScope,
          locator: "pre-1902 form, Improved/Banker, Twistout, Ink-Tab and lever-filler chronology",
        },
        {
          key: "phase95-moore-non-leakable-boundary-richard",
          sourceKey: S.richard.key,
          scopeKey: penScope,
          locator: "Tourist/Midget, sizing and overlay examples",
        },
      ],
    },
    {
      key: "phase95-moore-non-leakable-care",
      predicate: "use_and_care",
      objectText:
        "把它当作需要先检修的古董，而非可直接灌墨的普通钢笔。应由熟悉安全笔的维修者检查软木或其他密封、螺纹、笔尖和笔舌；确认密封可靠后再按安全笔方式使用瓶装墨。开合笔帽时握住笔杆而不是滑套，避免误伸笔尖；不要强扭、用力压尖、干拆老化部件或把任何一支未鉴定样本当作可用柔软尖。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.vintage.key,
      locator: "restored-seal, cap-handling and flexible-nib cautions",
      evidence: [
        {
          key: "phase95-moore-non-leakable-care-vintage",
          sourceKey: S.vintage.key,
          scopeKey: penScope,
          locator: "safe use after seal replacement; grip barrel rather than sleeve; inspect old flexible nib",
        },
        {
          key: "phase95-moore-non-leakable-care-richard",
          sourceKey: S.richard.key,
          scopeKey: penScope,
          locator: "retracting mechanism, cap protection and historical construction context",
        },
      ],
    },
  ],
  variants: [
    {
      key: "phase95-moore-non-leakable-early",
      name: "早期短帽／长开槽滑套外形",
      releaseYear: "约 1898–1902",
      notes: "是早期结构窗口，不把任何单支的长度、笔尖或包覆材料推广为全系。",
      sourceKey: S.vintage.key,
      variantKind: "edition_group",
    },
    {
      key: "phase95-moore-non-leakable-improved",
      name: "Improved／Banker 等晚期安全笔",
      releaseYear: "1920 年代",
      notes: "帽与笔杆的使用状态及滑套开孔等细节不同；不是普通 Non-Leakable 的单纯颜色变体。",
      sourceKey: S.vintage.key,
      variantKind: "edition_group",
    },
    {
      key: "phase95-moore-non-leakable-trim",
      name: "黑色硬橡胶、纹理硬橡胶与金属包覆",
      releaseYear: "历史销售期",
      notes: "材料和装饰是同一安全笔家族下的实物差异；金、镀金、银或包覆成色必须按实物检验。",
      sourceKey: S.ross.key,
      variantKind: "material",
    },
  ],
  spec: {
    brandEntityId: PHASE95_MOORE_BRAND_ID,
    values: {
      series_name: "Moore’s Non-Leakable Fountain Pen safety family",
      release_year: "约 1898/1899 至 1920 年代末；资料对商业化起点有一年差异",
      origin_country: "美国，Boston 的 American Fountain Pen Company 历史生产语境",
      nib: "可收回笔尖；金尖、尺寸、弹性与刻字随实物和时期，不把单支样本外推",
      fill_system: "收尖 safety pen 的笔杆储墨结构；确认密封修复后使用瓶装墨，不与后期杠杆上墨 Moore 混同",
      material: "常见黑色硬橡胶，亦有纹理硬橡胶、金属环或金属包覆；具体材质和成色按实物",
      dimensions: "多种尺寸和销售名称并存；没有可安全代表整个家族的统一长度或直径",
      weight: "随尺寸、硬橡胶、金属包覆和保存状态变化；不以单支拍卖或收藏样本充作全系重量",
      status: "历史停产；收藏、修复与实际书写适用性需按单支密封和笔尖状态判断",
    },
    evidence: [
      evidence("brand_entity_id", "phase95-moore-non-leakable-brand", S.ross.key, penScope, "American Fountain Pen Company / Moore history"),
      evidence("series_name", "phase95-moore-non-leakable-series", S.vintage.key, penScope, "Moore Safety Pens title and Non-Leakable history"),
      evidence("release_year", "phase95-moore-non-leakable-release", S.vintage.key, penScope, "commercial production window and end-of-1920s statement"),
      evidence("origin_country", "phase95-moore-non-leakable-origin", S.ross.key, penScope, "Boston company history"),
      evidence("nib", "phase95-moore-non-leakable-nib", S.patent.key, penScope, "retractable fountain-pen mechanism"),
      evidence("fill_system", "phase95-moore-non-leakable-fill", S.vintage.key, penScope, "retracting-nib safety use and restored seal context"),
      evidence("material", "phase95-moore-non-leakable-material", S.ross.key, penScope, "black hard-rubber and overlay routes"),
      evidence("dimensions", "phase95-moore-non-leakable-dimensions", S.richard.key, penScope, "multiple sizes, Tourist/Midget and examples"),
      evidence("weight", "phase95-moore-non-leakable-weight", S.richard.key, penScope, "multiple-size historical family; no universal weight"),
      evidence("status", "phase95-moore-non-leakable-status", S.vintage.key, penScope, "historical production end and restoration cautions"),
    ],
  },
  media: [
    {
      key: "phase95-moore-non-leakable-media",
      title: "Moore’s Non-Leakable 结构事实卡（非产品照片）",
      sourceKey: S.penSvg.key,
      localPath: S.penSvg.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片、拆解图或维修指南。",
      sourceUrl: S.penSvg.url,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "phase95-moore-non-leakable-patent",
      title: "Morris W. Moore 的可收纳笔尖专利授权",
      eventType: "patent_filed",
      startDate: "1896-09-08",
      circa: false,
      description: "US567151A 的授权日；设计专利不是每一支量产笔的精确生产日期。",
      sourceKey: S.patent.key,
    },
    {
      key: "phase95-moore-non-leakable-discontinued",
      title: "Non-Leakable 安全笔退出生产",
      eventType: "discontinued",
      startDate: "1929",
      circa: true,
      description: "资料称其持续至 1920 年代末；这里用约 1929 标记年代窗口，非逐支停产日期。",
      sourceKey: S.vintage.key,
    },
  ],
};

export const phase95MoorePacks = [brand, nonLeakable];
