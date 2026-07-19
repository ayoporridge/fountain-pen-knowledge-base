import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE69_ESTERBROOK_BRAND_ID = "b6DYMF38zz1B";
export const PHASE69_ESTIE_OVERSIZED_ID = "Xn2g9NlYnU8t";
export const PHASE69_ESTIE_OVERSIZED_SLUG = "esterbrook-estie-oversized";

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
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
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
  modelGuide: live({
    key: "phase69-esterbrook-model-guide",
    registryKey: "esterbrook-official-phase69",
    registryName: "Esterbrook official",
    sourceType: "official",
    tier: "primary",
    title: "A Guide to Esterbrook Pen Models: Estie, Model J, and JR Pocket Pen",
    url: "https://www.esterbrookpens.com/blogs/news/a-guide-to-esterbrook-pen-models-estie-model-j-and-jr-pocket-pen-1",
    summary:
      "官方 2025 指南区分 Estie、现代 Model J 与 JR；Estie 有标准和 Oversized 尺寸，常规供墨为 cartridge/converter，button piston 只出现在部分型号。",
  }),
  choosing: live({
    key: "phase69-esterbrook-estie-choosing",
    registryKey: "esterbrook-official-phase69",
    registryName: "Esterbrook official",
    sourceType: "official",
    tier: "primary",
    title: "Tips for choosing your Estie!",
    url: "https://www.esterbrookpens.com/blogs/happenings/tips-for-choosing-your-estie",
    summary:
      "旧官方选购说明列 Oversized 约 6.0 in 闭合、5.2 in 开盖，并将较粗握位和通常不戴帽的书写习惯作为与标准 Estie 的选择边界。",
  }),
  nibs: live({
    key: "phase69-esterbrook-nibs",
    registryKey: "esterbrook-official-phase69",
    registryName: "Esterbrook official",
    sourceType: "official",
    tier: "primary",
    title: "Get to Know Our Nibs",
    url: "https://www.esterbrookpens.com/pages/learn-about-our-nibs",
    summary:
      "官方当前 nib 说明将 Estie 系统列为 JoWo #6，并说明可选范围从 EF 至 Stub/Flex；具体材质、custom 研磨与可用 SKU 不能泛化。",
  }),
  adaptor: live({
    key: "phase69-esterbrook-mv-adaptor",
    registryKey: "esterbrook-official-phase69",
    registryName: "Esterbrook official",
    sourceType: "official",
    tier: "primary",
    title: "MV Nib Adaptor",
    url: "https://www.esterbrookpens.com/pages/mv-nib-adaptor",
    summary:
      "官方说明 MV Nib Adaptor 是替换握位的专用件，可将部分 vintage Esterbrook nib 接到 Estie/Oversized Estie；不适用于 JR 或 Camden。",
  }),
  independentReview: live({
    key: "phase69-estie-oversized-penchalet",
    registryKey: "penchalet-phase69",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    title: "Esterbrook Estie Oversize Fountain Pen Review",
    url: "https://www.penchalet.com/blog/esterbrook-estie-oversize-fountain-pen-review/",
    summary:
      "独立零售商转载的 2022 Ebony Oversize 试写把大尺寸、笔帽与宽尖体验限制在一支样笔范围；不把其重量、手感或出水外推全系。",
  }),
  brandSvg: diagram(
    "phase69-esterbrook-brand-svg",
    "Esterbrook 当代型号导航事实图",
    "/images/library/site-original/esterbrook-estie/esterbrook-brand.svg",
  ),
  estieSvg: diagram(
    "phase69-esterbrook-estie-oversized-svg",
    "Esterbrook Estie Oversized 身份与使用边界事实图",
    "/images/library/site-original/esterbrook-estie/esterbrook-estie-oversized.svg",
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
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、库存、笔尖或具体版本。",
      sourceUrl: source.url,
      usageStatus: "primary" as const,
    },
  ];
}

function brandPack(): CuratedEntityPack {
  const scopeKey = "phase69-esterbrook-brand-scope";
  return {
    key: "phase69-esterbrook-brand-v1",
    entityId: PHASE69_ESTERBROOK_BRAND_ID,
    expectedType: "brand",
    expectedSlug: "esterbrook",
    canonicalName: "Esterbrook",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/esterbrook-estie-brand.md",
    storyTitle: "Esterbrook：先把现代 Estie 与历史 J 系分开",
    primarySourceKey: SOURCES.modelGuide.key,
    depthTier: "A",
    aliases: [
      { alias: "Esterbrook", language: "en", sourceKey: SOURCES.modelGuide.key },
      { alias: "伊斯特布鲁克", language: "zh", sourceKey: SOURCES.modelGuide.key },
    ],
    sources: [
      SOURCES.modelGuide,
      SOURCES.nibs,
      SOURCES.adaptor,
      SOURCES.independentReview,
      SOURCES.brandSvg,
    ],
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        productionState: "current",
        editionScope:
          "品牌导航只涵盖当代 Estie、Model J、JR 的已核对边界；历史 J family 与具体颜色/限量版必须另以身份和资料处理。",
      },
    ],
    claims: [
      {
        key: "phase69-esterbrook-brand-navigation",
        predicate: "brand_navigation_boundary",
        objectText:
          "当代 Estie、现代 Model J 与 JR 是不同产品线：Estie 有标准和 Oversized 尺寸，Model J 是现代再设计，JR 是短杆口袋路线；它们不共享历史 J family 的结构或具体 SKU 规格。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.modelGuide.key,
        locator: SOURCES.modelGuide.summary,
        evidence: [
          {
            key: "phase69-esterbrook-brand-navigation-evidence",
            sourceKey: SOURCES.modelGuide.key,
            scopeKey,
            locator: SOURCES.modelGuide.summary,
          },
        ],
      },
      {
        key: "phase69-esterbrook-brand-modern-nib-boundary",
        predicate: "modern_nib_boundary",
        objectText:
          "当代 Estie 的 JoWo #6 与 MV Nib Adaptor 是现代系统：adaptor 只适用于 Estie/Oversized Estie，旧笔尖、特殊尖型和具体材料都要按部件或 SKU 核对。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.adaptor.key,
        locator: SOURCES.adaptor.summary,
        evidence: [
          {
            key: "phase69-esterbrook-brand-adaptor-evidence",
            sourceKey: SOURCES.adaptor.key,
            scopeKey,
            locator: SOURCES.adaptor.summary,
          },
          {
            key: "phase69-esterbrook-brand-nib-evidence",
            sourceKey: SOURCES.nibs.key,
            scopeKey,
            locator: SOURCES.nibs.summary,
          },
          {
            key: "phase69-esterbrook-brand-secondary-evidence",
            sourceKey: SOURCES.independentReview.key,
            scopeKey,
            locator: SOURCES.independentReview.summary,
          },
        ],
      },
    ],
    media: media(
      "phase69-esterbrook-brand-media",
      "Esterbrook 当代型号导航事实图（非产品照片）",
      SOURCES.brandSvg,
    ),
    timeline: [
      {
        key: "phase69-esterbrook-model-guide-2026",
        title: "Esterbrook 当代型号导航",
        eventType: "design_milestone",
        startDate: "2026",
        circa: true,
        description: "官方型号指南将 Estie、Model J 与 JR 作为不同当代路线；页面可见日期不倒推各款首发年份。",
        sourceKey: SOURCES.modelGuide.key,
      },
      {
        key: "phase69-esterbrook-modern-nib-system-2026",
        title: "Estie 当代笔尖系统复核",
        eventType: "design_milestone",
        startDate: "2026",
        circa: true,
        description: "官方 Nib Adaptor 资料限定现代 Estie/Oversized Estie 的适用范围，避免以历史笔尖或相邻型号代替。",
        sourceKey: SOURCES.adaptor.key,
      },
    ],
  };
}

function estiePack(): CuratedEntityPack {
  const scopeKey = "phase69-esterbrook-estie-oversized-scope";
  return {
    key: "phase69-esterbrook-estie-oversized-v1",
    entityId: PHASE69_ESTIE_OVERSIZED_ID,
    expectedType: "pen",
    expectedSlug: PHASE69_ESTIE_OVERSIZED_SLUG,
    canonicalName: "Esterbrook Estie Oversized",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/esterbrook-estie-oversized.md",
    storyTitle: "Esterbrook Estie Oversized：先买握位，再选树脂",
    primarySourceKey: SOURCES.modelGuide.key,
    depthTier: "A",
    aliases: [
      {
        alias: "Esterbrook Estie Oversized",
        language: "en",
        sourceKey: SOURCES.modelGuide.key,
      },
      {
        alias: "Esterbrook Estie OS",
        language: "en",
        sourceKey: SOURCES.choosing.key,
      },
      {
        alias: "Esterbrook Estie Oversize",
        language: "en",
        sourceKey: SOURCES.independentReview.key,
      },
      {
        alias: "伊斯特布鲁克 Estie 加大版",
        language: "zh",
        sourceKey: SOURCES.choosing.key,
      },
    ],
    sources: [
      SOURCES.modelGuide,
      SOURCES.choosing,
      SOURCES.nibs,
      SOURCES.adaptor,
      SOURCES.independentReview,
      SOURCES.estieSvg,
    ],
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        productionState: "current",
        editionScope:
          "现代 Estie Oversized 基础尺寸；颜色、联名、限量材质、18K/特殊研磨、button piston 与具体库存均为 variant/SKU，不能与普通 C/C 版合并。",
      },
    ],
    claims: [
      {
        key: "phase69-estie-oversized-identity",
        predicate: "model_identity",
        objectText:
          "Esterbrook Estie Oversized 是现代 Estie 的加大尺寸分支，不是历史 J/LJ/SJ、现代 Model J、JR，亦不是任何颜色、联名或限量材质的统一名称。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.modelGuide.key,
        locator: SOURCES.modelGuide.summary,
        evidence: [
          {
            key: "phase69-estie-oversized-identity-evidence",
            sourceKey: SOURCES.modelGuide.key,
            scopeKey,
            locator: SOURCES.modelGuide.summary,
          },
        ],
      },
      {
        key: "phase69-estie-oversized-size-boundary",
        predicate: "version_boundary",
        objectText:
          "旧官方选购说明把 Oversized 写为约 6.0 in 闭合、5.2 in 开盖，重点是较粗握位和通常不戴帽的使用习惯；材料、重量、笔帽配合与特殊供墨仍按具体版本确认。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.choosing.key,
        locator: SOURCES.choosing.summary,
        evidence: [
          {
            key: "phase69-estie-oversized-size-evidence",
            sourceKey: SOURCES.choosing.key,
            scopeKey,
            locator: SOURCES.choosing.summary,
          },
          {
            key: "phase69-estie-oversized-review-evidence",
            sourceKey: SOURCES.independentReview.key,
            scopeKey,
            locator: SOURCES.independentReview.summary,
          },
        ],
      },
      {
        key: "phase69-estie-oversized-system-boundary",
        predicate: "nib_fill_boundary",
        objectText:
          "当代 Estie 使用 JoWo #6；常规版本走 cartridge/converter，button piston 只属于部分型号。MV Nib Adaptor 是 Estie/Oversized Estie 专用配件，不把旧笔尖直接安装或 JR/Camden 兼容写成默认状态。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.nibs.key,
        locator: SOURCES.nibs.summary,
        evidence: [
          {
            key: "phase69-estie-oversized-nib-evidence",
            sourceKey: SOURCES.nibs.key,
            scopeKey,
            locator: SOURCES.nibs.summary,
          },
          {
            key: "phase69-estie-oversized-fill-evidence",
            sourceKey: SOURCES.modelGuide.key,
            scopeKey,
            locator: SOURCES.modelGuide.summary,
          },
          {
            key: "phase69-estie-oversized-adaptor-evidence",
            sourceKey: SOURCES.adaptor.key,
            scopeKey,
            locator: SOURCES.adaptor.summary,
          },
        ],
      },
      {
        key: "phase69-estie-oversized-care",
        predicate: "maintenance_boundary",
        objectText:
          "普通 C/C 版本换色时用室温清水吸排并自然干燥；不以热水、酒精、强溶剂、超声波、尖锐工具或蛮力处理树脂、笔尖、笔舌和供墨部件。button piston 版与 C/C 版的操作不互相替代；持续渗漏或阻力异常应交由售后或专业维修判断。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: SOURCES.modelGuide.key,
        locator: "current C/C versus select button-piston version boundary; conservative non-disassembly care",
        evidence: [
          {
            key: "phase69-estie-oversized-care-evidence",
            sourceKey: SOURCES.modelGuide.key,
            scopeKey,
            locator: "current C/C versus select button-piston version boundary; conservative non-disassembly care",
          },
        ],
      },
    ],
    variants: [
      {
        key: "phase69-estie-oversized-colors-materials",
        name: "颜色、限量材料与联名款",
        notes:
          "核心色、季节色、特殊树脂/材料和联名款各自有独立范围；任何一款的重量、配色、尖型、库存或照片不回填本基础尺寸页。",
        sourceKey: SOURCES.modelGuide.key,
        variantKind: "edition_group",
      },
      {
        key: "phase69-estie-oversized-button-piston",
        name: "部分 Estie 的 button piston 供墨版本",
        notes:
          "官方只确认该供墨方式在部分 Estie 型号可见；购买时按完整 SKU 判断，不能取代普通 C/C 版本。",
        sourceKey: SOURCES.modelGuide.key,
        variantKind: "variant",
      },
      {
        key: "phase69-estie-oversized-mv-adaptor",
        name: "MV Nib Adaptor 与 vintage nib",
        notes:
          "为 Estie/Oversized Estie 提供的专用 adaptor；旧 nib 状态、adaptor 与转换器均须逐件核对，JR/Camden 不适用。",
        sourceKey: SOURCES.adaptor.key,
        variantKind: "nib",
      },
    ],
    spec: {
      brandEntityId: PHASE69_ESTERBROOK_BRAND_ID,
      values: {
        series_name: "Esterbrook Estie Oversized",
        release_year:
          "当代 Estie 系列；准确首发年份待可追溯官方产品档案核实",
        origin_country:
          "Esterbrook 当代产品线；具体制造地、批次与销售地区按当期 SKU 或实物核对",
        nib: "JoWo #6；常见选择从 EF 至 Stub/Flex，具体尖型、材质与研磨按 SKU",
        fill_system:
          "常规版本为 international cartridge/converter；部分 Estie 版本为 button piston，不可混写",
        material:
          "树脂／acrylic 类笔身随颜色和版本变化；不以任何一个限量材料外推全系",
        dimensions:
          "旧官方选购说明：Oversized 约 6.0 in 闭合、5.2 in 开盖；不同材料与版本须以专页核对",
        weight:
          "随材料和版本变化；不把某一 DiamondCast 或限量版约 33 g 写为全系固定重量",
        status:
          "当代 Estie 尺寸分支；颜色、限量、笔尖、供墨、库存与销售地区按具体 SKU 确认",
      },
      evidence: [
        evidence(
          "brand_entity_id",
          "phase69-estie-brand",
          SOURCES.modelGuide.key,
          scopeKey,
          "official Estie/Esterbrook model context; maker topology separately verified",
        ),
        evidence(
          "series_name",
          "phase69-estie-series",
          SOURCES.modelGuide.key,
          scopeKey,
          "official Estie standard and Oversized model distinction",
        ),
        evidence(
          "release_year",
          "phase69-estie-release",
          SOURCES.modelGuide.key,
          scopeKey,
          "current official guide presence; not assumed launch year",
        ),
        evidence(
          "origin_country",
          "phase69-estie-origin",
          SOURCES.modelGuide.key,
          scopeKey,
          "official contemporary model context without unsupported factory claim",
        ),
        evidence(
          "nib",
          "phase69-estie-nib",
          SOURCES.nibs.key,
          scopeKey,
          "official JoWo #6 and available nib-family statement",
        ),
        evidence(
          "fill_system",
          "phase69-estie-fill",
          SOURCES.modelGuide.key,
          scopeKey,
          "official cartridge/converter and select button-piston distinction",
        ),
        evidence(
          "material",
          "phase69-estie-material",
          SOURCES.modelGuide.key,
          scopeKey,
          "official acrylic body and version/material boundary",
        ),
        evidence(
          "dimensions",
          "phase69-estie-dimensions",
          SOURCES.choosing.key,
          scopeKey,
          "official historical selection guide dimensions",
        ),
        evidence(
          "weight",
          "phase69-estie-weight",
          SOURCES.independentReview.key,
          scopeKey,
          "independent sample confirms weight varies by exact sample; no universal value",
        ),
        evidence(
          "status",
          "phase69-estie-status",
          SOURCES.modelGuide.key,
          scopeKey,
          "current official model guide and specific-SKU availability boundary",
        ),
      ],
    },
    media: media(
      "phase69-esterbrook-estie-oversized-media",
      "Esterbrook Estie Oversized 身份与使用边界事实图（非产品照片）",
      SOURCES.estieSvg,
    ),
    timeline: [
      {
        key: "phase69-estie-oversized-current-guide",
        title: "Estie Oversized 的当前官方型号边界",
        eventType: "model_released",
        startDate: "2025",
        circa: true,
        description:
          "2025 官方型号指南仍将 Estie 的标准和 Oversized 分开说明；这不把指南发布日期写成该型号的精确首发日。",
        sourceKey: SOURCES.modelGuide.key,
      },
    ],
  };
}

export const phase69EsterbrookEstiePacks: CuratedEntityPack[] = [
  brandPack(),
  estiePack(),
];
