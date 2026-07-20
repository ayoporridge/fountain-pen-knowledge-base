import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE82_ESTERBROOK_J_FALLBACK_ID = "phase82-pen-esterbrook-j-series";
export const PHASE82_ESTERBROOK_J_SLUG = "esterbrook-j-series-double-jewel";

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
    registryKey: "fountain-pen-graph-editorial-phase82",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase82",
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
  modernGuide: live({
    key: "phase82-esterbrook-modern-model-guide",
    registryKey: "esterbrook-official-phase82",
    registryName: "Esterbrook official",
    sourceType: "official",
    tier: "primary",
    title: "A Guide to Esterbrook Pen Models: Estie, Model J, and JR Pocket Pen",
    url: "https://www.esterbrookpens.com/blogs/news/a-guide-to-esterbrook-pen-models-estie-model-j-and-jr-pocket-pen-1",
    summary: "当代官方指南把 Estie、现代 Model J 与 JR 列为不同产品线；现代 Model J 使用 cartridge/converter 与德国制笔尖，不能代替历史 J 的结构资料。",
  }),
  earlyJ: live({
    key: "phase82-esterbrook-j-visumaster",
    registryKey: "esterbrook-net-phase82",
    registryName: "Esterbrook.net / Brian Anderson",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "J Series Pens: Visumaster and Twist Filler",
    url: "https://www.esterbrook.net/j.shtml",
    summary: "专题档案指出 1941 目录已有 J 名称的 Visumaster，约 1943 年有 Twist Filler；它们说明 J 名称史早于 Double Jewel，不支持把所有 J 等同 1948 年。",
  }),
  doubleJewel: live({
    key: "phase82-esterbrook-double-jewel",
    registryKey: "esterbrook-net-phase82",
    registryName: "Esterbrook.net / Brian Anderson",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "J Series Pens: Double Jewel",
    url: "https://www.esterbrook.net/j3.shtml",
    summary: "专题档案将约 1948 年后的 Double Jewel J、LJ、SJ 分作三种体型，说明常见大理石纹、imprint、jewel 与 Icicle 边界。",
  }),
  nibs: live({
    key: "phase82-esterbrook-renew-point",
    registryKey: "esterbrook-net-phase82",
    registryName: "Esterbrook.net / Brian Anderson",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Re-New-Point Nib Units",
    url: "https://www.esterbrook.net/nibs.shtml",
    summary: "专题档案列出历史 Re-New-Point／Renew-Point 单元的编号、尖型与用途，包括 1550、1551、1554、2048、2284、2312、2314 等；编号不是每支 J 的固定原配。",
  }),
  repair: live({
    key: "phase82-esterbrook-repair",
    registryKey: "esterbrook-net-phase82",
    registryName: "Esterbrook.net / Brian Anderson",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Repair Tips",
    url: "https://www.esterbrook.net/repair.shtml",
    summary: "维修资料区分 J/LJ/SJ jewel 尺寸，并将笔囊、J-bar、basic service 作为独立检查与维修项目；可支持谨慎维护边界。",
  }),
  vintagePens: live({
    key: "phase82-vintagepens-esterbrook",
    registryKey: "vintagepens-phase82",
    registryName: "VintagePens / David Nishimura",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Esterbrook Fountain Pens",
    url: "https://www.vintagepens.com/Esterbrook.shtml",
    summary: "专业旧笔资料把 1948 J 置于战后量产脉络，区分 J/LJ/SJ、J Deluxe、SM、H/CH 等相邻型号，并提醒笔尖单元互换存在小型笔帽净空等例外。",
  }),
  dimensions: live({
    key: "phase82-ravens-march-j-dimensions",
    registryKey: "ravens-march-phase82",
    registryName: "Ravens March Fountain Pens",
    sourceType: "blog",
    tier: "community",
    title: "J Series",
    url: "https://dirck.delint.ca/beta/?page_id=989",
    summary: "收藏资料给出 J 约 12.7 cm、SJ 约 11.9 cm，且 LJ 与 J 同长度但更细的概略辨识；只能作参考，不是每批生产公差。",
  }),
  jSvg: diagram(
    "phase82-esterbrook-j-series-svg",
    "Esterbrook Double Jewel J／LJ／SJ 历史体型关系事实图",
    "/images/library/site-original/esterbrook-j/esterbrook-j-series-double-jewel.svg",
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
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、笔尖、刻字、生产年份、保存状态或具体版本。",
      sourceUrl: source.url,
      usageStatus: "primary" as const,
    },
  ];
}

export function phase82EsterbrookJPacks(
  brandId: string,
  penId: string,
): CuratedEntityPack[] {
  const brandScope = "phase82-esterbrook-brand-history-scope";
  const jScope = "phase82-esterbrook-double-jewel-j-scope";
  return [
    {
      key: "phase82-esterbrook-brand-history-v1",
      entityId: brandId,
      expectedType: "brand",
      expectedSlug: "esterbrook",
      canonicalName: "Esterbrook",
      publicationIntent: "publish",
      publicationBlockers: [],
      markdownFile: ".planning/content-research/esterbrook-j-series-phase82-brand.md",
      storyTitle: "Esterbrook：同一个 J，隔着两代产品",
      primarySourceKey: SOURCES.modernGuide.key,
      depthTier: "A",
      aliases: [
        { alias: "Esterbrook", language: "en", sourceKey: SOURCES.modernGuide.key },
        { alias: "伊斯特布鲁克", language: "zh", sourceKey: SOURCES.modernGuide.key },
      ],
      sources: [SOURCES.modernGuide, SOURCES.doubleJewel, SOURCES.vintagePens, SOURCES.repair, SOURCES.jSvg],
      scopes: [{ key: brandScope, scopeKey: brandScope, productionState: "unknown", editionScope: "品牌页将历史 Double Jewel J/LJ/SJ 与当代 Estie、现代 Model J、JR 分开导航；不以相似名称、商品图或一支样笔的规格跨代填充。" }],
      claims: [
        {
          key: "phase82-esterbrook-brand-two-generation-boundary",
          predicate: "brand_navigation_boundary",
          objectText: "历史 Double Jewel J/LJ/SJ 是杠杆笔囊与 Renew-Point 单元的旧笔家族；当代 Estie、现代 Model J、JR 是不同的现代产品线。名称相近不构成结构、尺寸、图片或维护方法互用的证据。",
          factClass: "core",
          confidence: 0.99,
          sourceKey: SOURCES.modernGuide.key,
          locator: SOURCES.modernGuide.summary,
          evidence: [
            { key: "phase82-brand-modern-boundary", sourceKey: SOURCES.modernGuide.key, scopeKey: brandScope, locator: SOURCES.modernGuide.summary },
            { key: "phase82-brand-historic-boundary", sourceKey: SOURCES.doubleJewel.key, scopeKey: brandScope, locator: SOURCES.doubleJewel.summary },
            { key: "phase82-brand-independent-boundary", sourceKey: SOURCES.vintagePens.key, scopeKey: brandScope, locator: SOURCES.vintagePens.summary },
          ],
        },
        {
          key: "phase82-esterbrook-brand-care-boundary",
          predicate: "maintenance_boundary",
          objectText: "历史杠杆笔需要逐支确认笔囊、J-bar、杠杆与笔尖单元状态；不把现代墨囊／转换器笔的拆装方式套进旧 J，也不以杠杆能动代替完整的供墨验收。",
          factClass: "core",
          confidence: 0.98,
          sourceKey: SOURCES.repair.key,
          locator: SOURCES.repair.summary,
          evidence: [{ key: "phase82-brand-repair-boundary", sourceKey: SOURCES.repair.key, scopeKey: brandScope, locator: SOURCES.repair.summary }],
        },
      ],
      media: media("phase82-esterbrook-brand-history-media", "Esterbrook 历史与现代 J 路线事实图（非产品照片）", SOURCES.jSvg),
      timeline: [
        { key: "phase82-esterbrook-j-name-1941", title: "J 名称的早期目录语境", eventType: "design_milestone", startDate: "1941", circa: false, description: "专题档案记录 1941 Visumaster 已使用 J 名称，因此不把 1948 写成全部 J 名称的起点。", sourceKey: SOURCES.earlyJ.key },
        { key: "phase82-esterbrook-double-jewel-1948", title: "Double Jewel J family 的战后语境", eventType: "model_released", startDate: "1948", circa: true, description: "专题档案与旧笔资料将约 1948 年后的 Double Jewel J、LJ、SJ 作为收藏者最常说的历史家族。", sourceKey: SOURCES.doubleJewel.key },
      ],
    },
    {
      key: "phase82-esterbrook-j-series-double-jewel-v1",
      entityId: penId,
      expectedType: "pen",
      expectedSlug: PHASE82_ESTERBROOK_J_SLUG,
      canonicalName: "Esterbrook J Series（Double Jewel，约 1948 年后）",
      publicationIntent: "publish",
      publicationBlockers: [],
      markdownFile: ".planning/content-research/esterbrook-j-series-phase82.md",
      storyTitle: "Esterbrook J Series：同名不等于同一支笔",
      primarySourceKey: SOURCES.doubleJewel.key,
      depthTier: "A",
      aliases: [
        { alias: "Esterbrook J", language: "en", sourceKey: SOURCES.doubleJewel.key },
        { alias: "Esterbrook LJ", language: "en", sourceKey: SOURCES.doubleJewel.key },
        { alias: "Esterbrook SJ", language: "en", sourceKey: SOURCES.doubleJewel.key },
        { alias: "Esterbrook Double Jewel J", language: "en", sourceKey: SOURCES.vintagePens.key },
        { alias: "伊斯特布鲁克 J／LJ／SJ", language: "zh", sourceKey: SOURCES.doubleJewel.key },
      ],
      sources: [SOURCES.earlyJ, SOURCES.doubleJewel, SOURCES.nibs, SOURCES.repair, SOURCES.vintagePens, SOURCES.dimensions, SOURCES.modernGuide, SOURCES.jSvg],
      scopes: [{ key: jScope, scopeKey: jScope, productionState: "historical", editionScope: "约 1948 年后的 Double Jewel J/LJ/SJ 历史 family；不包含 1941 Visumaster、Twist Filler、Transitional、Icicle、J Deluxe、SM、H/CH purse pens，亦不包含当代 Model J、Estie、JR。" }],
      claims: [
        {
          key: "phase82-esterbrook-j-identity",
          predicate: "model_identity",
          objectText: "本页的 Esterbrook J Series 指约 1948 年后常见的 Double Jewel J family：J 为全尺寸，LJ 与 J 同长而较细，SJ 较短且较细；它是历史杠杆笔家族，不是当代 Model J、Estie 或 JR。",
          factClass: "core",
          confidence: 0.99,
          sourceKey: SOURCES.doubleJewel.key,
          locator: SOURCES.doubleJewel.summary,
          evidence: [
            { key: "phase82-j-identity-archive", sourceKey: SOURCES.doubleJewel.key, scopeKey: jScope, locator: SOURCES.doubleJewel.summary },
            { key: "phase82-j-identity-independent", sourceKey: SOURCES.vintagePens.key, scopeKey: jScope, locator: SOURCES.vintagePens.summary },
            { key: "phase82-j-modern-exclusion", sourceKey: SOURCES.modernGuide.key, scopeKey: jScope, locator: SOURCES.modernGuide.summary },
          ],
        },
        {
          key: "phase82-esterbrook-j-age-boundary",
          predicate: "history_boundary",
          objectText: "1948 是 Double Jewel J family 的约略战后锚点，不是 J 名称的绝对起点；1941 Visumaster、约 1943 Twist Filler 与 1944–1948 Transitional 需另行辨识，不可套用本页规格。",
          factClass: "core",
          confidence: 0.99,
          sourceKey: SOURCES.earlyJ.key,
          locator: SOURCES.earlyJ.summary,
          evidence: [
            { key: "phase82-j-age-early", sourceKey: SOURCES.earlyJ.key, scopeKey: jScope, locator: SOURCES.earlyJ.summary },
            { key: "phase82-j-age-double", sourceKey: SOURCES.doubleJewel.key, scopeKey: jScope, locator: SOURCES.doubleJewel.summary },
          ],
        },
        {
          key: "phase82-esterbrook-j-filling-and-nib",
          predicate: "fill_nib_boundary",
          objectText: "Double Jewel J/LJ/SJ 使用 lever filler 压迫笔囊吸墨，并使用可旋卸 Renew-Point 单元；1550、1551、1554、2048、2284、2312、2314 等为可见的历史单元例子，不是每支笔的固定原配。",
          factClass: "core",
          confidence: 0.99,
          sourceKey: SOURCES.nibs.key,
          locator: SOURCES.nibs.summary,
          evidence: [
            { key: "phase82-j-nib-archive", sourceKey: SOURCES.nibs.key, scopeKey: jScope, locator: SOURCES.nibs.summary },
            { key: "phase82-j-nib-independent", sourceKey: SOURCES.vintagePens.key, scopeKey: jScope, locator: SOURCES.vintagePens.summary },
          ],
        },
        {
          key: "phase82-esterbrook-j-care",
          predicate: "maintenance_boundary",
          objectText: "旧笔验收先看笔囊、J-bar、杠杆、笔帽唇、筒身、笔尖螺纹与当前出水；以常温清水和缓慢操作清洗，不用热水、酒精、强溶剂、尖锐工具或蛮力拆杠杆。异常时交由熟悉杠杆笔的人检修。",
          factClass: "core",
          confidence: 0.98,
          sourceKey: SOURCES.repair.key,
          locator: SOURCES.repair.summary,
          evidence: [{ key: "phase82-j-care-repair", sourceKey: SOURCES.repair.key, scopeKey: jScope, locator: SOURCES.repair.summary }],
        },
      ],
      variants: [
        { key: "phase82-j-full-size", name: "J（full size）", releaseYear: "约 1948 年后", notes: "Double Jewel family 的全尺寸体型；参考盖帽约 12.7 cm，具体长度与实物状态逐支确认。", sourceKey: SOURCES.dimensions.key, variantKind: "variant" },
        { key: "phase82-j-long-slender", name: "LJ（Long Slender）", releaseYear: "约 1948 年后", notes: "与 J 同长度而更细；不是缩短版 J，也不等同现代 JR。", sourceKey: SOURCES.doubleJewel.key, variantKind: "variant" },
        { key: "phase82-j-short-slender", name: "SJ（Short Slender）", releaseYear: "约 1948 年后", notes: "较 LJ 短且为较细体型；不以现代 JR 或 purse pen 代替。", sourceKey: SOURCES.dimensions.key, variantKind: "variant" },
      ],
      spec: {
        brandEntityId: brandId,
        values: {
          series_name: "Vintage Esterbrook J Series（约 1948 年后 Double Jewel）",
          release_year: "约 1948 年后；J 名称在更早 Visumaster、Twist Filler 与 Transitional 中已出现，不能把 1948 写成全部 J 名称的起点",
          origin_country: "美国历史 Esterbrook 量产笔；具体工厂、出厂年份与零件组合按实物核对",
          nib: "可旋卸 Renew-Point（早期写作 Re-New-Point）笔尖单元；编号、尖型、状态与是否原配逐支确认",
          fill_system: "lever filler：杠杆压迫内部笔囊吸墨；不是现代 cartridge/converter 或活塞系统",
          material: "战后量产的彩色大理石纹塑料笔身；色深差异不自动等于稀有或特殊版本",
          dimensions: "参考辨识：J 盖帽约 12.7 cm；LJ 与 J 同长度但更细；SJ 约 11.9 cm。不同批次与测量方式须复核",
          weight: "历史资料未给可靠统一重量；笔囊、笔尖、饰面和保存状态不同，不填单一固定数值",
          status: "停产的历史家族；二手状态、翻修、笔尖单元与配件完整度逐支检查",
        },
        evidence: [
          evidence("brand_entity_id", "phase82-j-brand", SOURCES.doubleJewel.key, jScope, "historic Esterbrook J context; maker topology separately verified"),
          evidence("series_name", "phase82-j-series", SOURCES.doubleJewel.key, jScope, SOURCES.doubleJewel.summary),
          evidence("release_year", "phase82-j-release", SOURCES.earlyJ.key, jScope, SOURCES.earlyJ.summary),
          evidence("origin_country", "phase82-j-origin", SOURCES.vintagePens.key, jScope, "historical American Esterbrook context without unsupported factory precision"),
          evidence("nib", "phase82-j-nib", SOURCES.nibs.key, jScope, SOURCES.nibs.summary),
          evidence("fill_system", "phase82-j-fill", SOURCES.vintagePens.key, jScope, "historic lever-filler and replaceable nib-unit context"),
          evidence("material", "phase82-j-material", SOURCES.doubleJewel.key, jScope, "Double Jewel color/plastic context; not a formulation claim"),
          evidence("dimensions", "phase82-j-dimensions", SOURCES.dimensions.key, jScope, SOURCES.dimensions.summary),
          evidence("weight", "phase82-j-weight", SOURCES.vintagePens.key, jScope, "no reliable universal historical weight; sample weights not generalized"),
          evidence("status", "phase82-j-status", SOURCES.vintagePens.key, jScope, "historic discontinued family and individual-condition boundary"),
        ],
      },
      media: media("phase82-esterbrook-j-series-media", "Esterbrook Double Jewel J／LJ／SJ 事实图（非产品照片）", SOURCES.jSvg),
      timeline: [
        { key: "phase82-j-name-1941", title: "J 名称的早期 Visumaster 语境", eventType: "design_milestone", startDate: "1941", circa: false, description: "1941 目录已有 J 名称的 Visumaster，不能让 Double Jewel 规格倒灌到更早型号。", sourceKey: SOURCES.earlyJ.key },
        { key: "phase82-j-double-jewel-1948", title: "Double Jewel J/LJ/SJ 的战后锚点", eventType: "model_released", startDate: "1948", circa: true, description: "专题档案与独立旧笔资料将约 1948 年后的 Double Jewel J、LJ、SJ 作为此页的历史家族边界。", sourceKey: SOURCES.doubleJewel.key },
      ],
    },
  ];
}
