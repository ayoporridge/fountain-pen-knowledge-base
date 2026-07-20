import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE75_SHEAFFER_ID = "tVXnzDSFCcPP";
export const PHASE75_LEGACY_HERITAGE_ID = "phase75-sheaffer-legacy-heritage";
export const PHASE75_LEGACY_HERITAGE_SLUG = "sheaffer-legacy-heritage";

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
    registryKey: "fountain-pen-graph-editorial-phase75",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase75",
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
  catalogue: live({
    key: "phase75-sheaffer-heritage-2006-catalogue",
    registryKey: "sheaffer-2006-catalogue-archive",
    registryName: "Sheaffer 2006 catalogue archive",
    sourceType: "official",
    tier: "contemporary_archive",
    title: "Sheaffer Catalogue 2006",
    url: "https://www.sheaffer.ro/cataloage1/Sheaffer/Catalog2006.pdf",
    summary:
      "保存的 contemporaneous Sheaffer 2006 catalogue 将 Legacy Heritage 列为宽笔身系列，并注明 18K、palladium-plated inlaid nib 与 9030/9031/9035/9040/9041/9046 等饰面组；目录不证明所有市场、年份都有相同 SKU。",
  }),
  history: live({
    key: "phase75-sheaffer-legacy-history",
    registryKey: "sheaffer-targa-legacy-history",
    registryName: "Sheaffer Targa / Legacy history",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Sheaffer Legacy history",
    url: "https://www.sheaffertarga.com/Legacy/Legacy%20history.html",
    summary:
      "收藏史料把 Legacy I 的 1995 年 9 月、Legacy II 的 1999 年与 Heritage 的 2003 年第三代位置分开，并记录 Heritage 从前两代 Touchdown converter 转向 cartridge/converter。",
  }),
  penhero: live({
    key: "phase75-penhero-pfm-legacy-boundary",
    registryKey: "penhero-pfm-legacy-boundary",
    registryName: "PenHero",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Sheaffer PFM: The Pen For Men 1959–1968",
    url: "https://www.penhero.com/PenGallery/Sheaffer/SheafferPFM.htm",
    summary:
      "PenHero 将 PFM 定义为 1959–1968 的 Snorkel 旗舰，并将 1990 年代 Legacy 说明为回看 PFM 设计语言的后继；共同的嵌入尖外观不让二者成为同一型号。",
  }),
  converter: live({
    key: "phase75-penhero-converter-history",
    registryKey: "penhero-sheaffer-converter-history",
    registryName: "PenHero",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Sheaffer Converter History",
    url: "https://www.penhero.com/PenInHand/2005/PenInHandMay2005.htm",
    summary:
      "PenHero 解释 Legacy I/II 专用 Touchdown converter 由尾端气压杆驱动，而常规 Sheaffer piston converter 是可拆卸 cartridge/converter 路线的一部分；不能把前者维修要求套给 Heritage。",
  }),
  current: live({
    key: "phase75-sheaffer-current-legacy-9064",
    registryKey: "sheaffer-current-legacy-9064",
    registryName: "Sheaffer official",
    sourceType: "official",
    tier: "primary",
    title: "Sheaffer Legacy 9064 Glossy Black",
    url: "https://sheaffer.com/products/sheaffer-legacy-9064-glossy-black-inlaid-nib-fountain-pen-with-chrome-plated-trims",
    summary:
      "当前官方 Legacy 9064 页面写明 stainless-steel inlaid nib、snap cap、Classic converter、两支 cartridges 与 F/M/B；它是 2025–26 revival 的资料，不能反写为 2003 Heritage 的 18K 规格。",
  }),
  review: live({
    key: "phase75-gourmetpens-legacy-heritage-review",
    registryKey: "gourmet-pens-legacy-heritage",
    registryName: "Gourmet Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "Review: Sheaffer Legacy Heritage",
    url: "https://www.gourmetpens.com/2014/12/review-sheaffer-legacy-heritage.html",
    summary:
      "2014 专业评测测得一支 black/palladium Heritage 样本约 137.8 mm 闭帽、120.1 mm 无帽、147.0 mm 插帽、38 g；这些是该样本的实测值，不是全系列固定规格。",
  }),
  brandSvg: diagram(
    "phase75-sheaffer-brand-svg",
    "Sheaffer Legacy generations and family boundary map",
    "/images/library/site-original/phase75/sheaffer-legacy/sheaffer-brand-legacy-map.svg",
  ),
  heritageSvg: diagram(
    "phase75-sheaffer-legacy-heritage-svg",
    "Sheaffer Legacy Heritage factual identity map",
    "/images/library/site-original/phase75/sheaffer-legacy/sheaffer-legacy-heritage.svg",
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
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、笔尖、材质、库存、具体 SKU 或实际墨量。",
      sourceUrl: source.url,
      usageStatus: "primary" as const,
    },
  ];
}

function brandPack(): CuratedEntityPack {
  const scopeKey = "phase75-sheaffer-brand-legacy-scope";
  return {
    key: "phase75-sheaffer-brand-legacy-v1",
    entityId: PHASE75_SHEAFFER_ID,
    expectedType: "brand",
    expectedSlug: "sheaffer",
    canonicalName: "犀飞利 Sheaffer",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/sheaffer-legacy-brand-phase75.md",
    storyTitle: "犀飞利 Sheaffer：嵌入尖是谱系线索，不是型号名称",
    primarySourceKey: SOURCES.catalogue.key,
    depthTier: "A",
    aliases: [
      { alias: "Sheaffer", language: "en", sourceKey: SOURCES.catalogue.key },
      { alias: "犀飞利", language: "zh", sourceKey: SOURCES.catalogue.key },
    ],
    sources: [
      SOURCES.catalogue,
      SOURCES.history,
      SOURCES.penhero,
      SOURCES.current,
      SOURCES.brandSvg,
    ],
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        productionState: "historical",
        editionScope:
          "品牌页按实际公开的 made_by 型号关系导航；嵌入尖、Touchdown、Snorkel、颜色与饰面不是单一型号名称，也不能替代具体年代与供墨的判断。",
      },
    ],
    claims: [
      {
        key: "phase75-sheaffer-legacy-generations",
        predicate: "model_family_boundary",
        objectText:
          "Legacy I（1995–1998）、Legacy II（1999 起）与 2003 起的 Legacy Heritage 是不同代际：前两代使用专用 Touchdown converter，Heritage 转为 cartridge/converter；它们不能只因大笔身和嵌入尖而合成一个页面。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.history.key,
        locator: SOURCES.history.summary,
        evidence: [
          { key: "phase75-sheaffer-generation-history", sourceKey: SOURCES.history.key, scopeKey, locator: SOURCES.history.summary },
          { key: "phase75-sheaffer-generation-converter", sourceKey: SOURCES.converter.key, scopeKey, locator: SOURCES.converter.summary },
        ],
      },
      {
        key: "phase75-sheaffer-pfm-current-boundary",
        predicate: "related_model_boundary",
        objectText:
          "PFM 是 1959–1968 的 Snorkel 旗舰；2025–26 Legacy 9064 则是配 steel inlaid nib 的当前 revival。两者都不是 2003 Heritage 的别名，品牌导航应保留为相邻、可比较的独立型号。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.penhero.key,
        locator: SOURCES.penhero.summary,
        evidence: [
          { key: "phase75-sheaffer-pfm-boundary", sourceKey: SOURCES.penhero.key, scopeKey, locator: SOURCES.penhero.summary },
          { key: "phase75-sheaffer-current-boundary", sourceKey: SOURCES.current.key, scopeKey, locator: SOURCES.current.summary },
        ],
      },
    ],
    media: media(
      "phase75-sheaffer-brand-legacy-media",
      "Sheaffer Legacy 世代与相邻型号事实图（非产品照片）",
      SOURCES.brandSvg,
    ),
    timeline: [
      {
        key: "phase75-sheaffer-legacy-i",
        title: "Legacy I 的首代资料节点",
        eventType: "design_milestone",
        startDate: "1995-09",
        circa: false,
        description: "历史资料记录 Legacy I 于 1995 年 9 月出现；它仍是使用专用 Touchdown converter 的首代。",
        sourceKey: SOURCES.history.key,
      },
      {
        key: "phase75-sheaffer-legacy-heritage",
        title: "Legacy Heritage 的第三代资料节点",
        eventType: "model_released",
        startDate: "2003",
        circa: false,
        description: "历史资料将 Heritage 定位为第三代 Legacy，并记录它改用 cartridge/converter。",
        sourceKey: SOURCES.history.key,
      },
    ],
  };
}

function legacyHeritagePack(): CuratedEntityPack {
  const scopeKey = "phase75-sheaffer-legacy-heritage-scope";
  return {
    key: "phase75-sheaffer-legacy-heritage-v1",
    entityId: PHASE75_LEGACY_HERITAGE_ID,
    expectedType: "pen",
    expectedSlug: PHASE75_LEGACY_HERITAGE_SLUG,
    canonicalName: "Sheaffer Legacy Heritage",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/sheaffer-legacy-heritage.md",
    storyTitle: "Sheaffer Legacy Heritage：把 Touchdown 的仪式感换成日常 C/C",
    primarySourceKey: SOURCES.catalogue.key,
    depthTier: "A",
    aliases: [
      { alias: "Sheaffer Legacy Heritage", language: "en", sourceKey: SOURCES.catalogue.key },
      { alias: "Legacy Heritage", language: "en", sourceKey: SOURCES.history.key },
      { alias: "犀飞利 Legacy Heritage", language: "zh", sourceKey: SOURCES.catalogue.key },
    ],
    sources: [
      SOURCES.catalogue,
      SOURCES.history,
      SOURCES.penhero,
      SOURCES.converter,
      SOURCES.current,
      SOURCES.review,
      SOURCES.heritageSvg,
    ],
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        productionState: "historical",
        editionScope:
          "2003 起 Legacy Heritage 基础家族。903x/904x 饰面、特别版、笔幅、市场与样本状态分别核验；前两代 Touchdown Legacy 与当前 steel-nib Legacy 9064/9065 不代入本页规格。",
      },
    ],
    claims: [
      {
        key: "phase75-heritage-identity",
        predicate: "model_identity",
        objectText:
          "Legacy Heritage 是 2003 起的第三代 Legacy：宽笔身、snap cap 和 18K palladium-plated inlaid nib 延续 PFM-inspired 语言，但供墨为 Sheaffer cartridge/converter，而不是前两代的专用 Touchdown converter。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.catalogue.key,
        locator: SOURCES.catalogue.summary,
        evidence: [
          { key: "phase75-heritage-catalogue-identity", sourceKey: SOURCES.catalogue.key, scopeKey, locator: SOURCES.catalogue.summary },
          { key: "phase75-heritage-history-identity", sourceKey: SOURCES.history.key, scopeKey, locator: SOURCES.history.summary },
        ],
      },
      {
        key: "phase75-heritage-generation-boundary",
        predicate: "version_boundary",
        objectText:
          "Legacy I/II 的 Touchdown converter、PFM 的 Snorkel，以及当前 Legacy 9064 的 stainless-steel inlaid nib 分属不同结构或代际；任何只有“Legacy”或“嵌入尖”的二手标题都不足以证明 Heritage 身份。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.converter.key,
        locator: SOURCES.converter.summary,
        evidence: [
          { key: "phase75-heritage-converter-boundary", sourceKey: SOURCES.converter.key, scopeKey, locator: SOURCES.converter.summary },
          { key: "phase75-heritage-pfm-boundary", sourceKey: SOURCES.penhero.key, scopeKey, locator: SOURCES.penhero.summary },
          { key: "phase75-heritage-current-boundary", sourceKey: SOURCES.current.key, scopeKey, locator: SOURCES.current.summary },
        ],
      },
      {
        key: "phase75-heritage-care-boundary",
        predicate: "maintenance_boundary",
        objectText:
          "Heritage 采用普通 cartridge/converter 路线：可拆下 converter 后以室温清水反复吸排并晾干；不要把 Legacy I/II 的气密、O-ring、专用 converter 维修或 PFM 的 Snorkel 拆装当作 Heritage 的日常保养。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: SOURCES.converter.key,
        locator: SOURCES.converter.summary,
        evidence: [
          { key: "phase75-heritage-care-converter", sourceKey: SOURCES.converter.key, scopeKey, locator: SOURCES.converter.summary },
        ],
      },
    ],
    variants: [
      { key: "phase75-heritage-9030", name: "Legacy Heritage 9030 / 9031 family", releaseYear: "2006 catalogue", notes: "目录中的饰面/SKU 组，不应推定全部地区、年份或笔幅均有同一配置。", sourceKey: SOURCES.catalogue.key, variantKind: "edition_group" },
      { key: "phase75-heritage-9035", name: "Legacy Heritage 9035 deep-cut palladium", releaseYear: "2006 catalogue", notes: "特定 palladium 饰面，不能用来概括所有 Heritage 的外壳材质。", sourceKey: SOURCES.catalogue.key, variantKind: "material" },
      { key: "phase75-heritage-sterling", name: "Legacy Heritage 9037 / 9045 Sterling Silver", releaseYear: "2006 catalogue", notes: "interrupted barleycorn 与 Victorian 特别饰面是限量/饰面资料，不是另一种供墨世代。", sourceKey: SOURCES.catalogue.key, variantKind: "edition_group" },
      { key: "phase75-heritage-black-palladium-sample", name: "Black / palladium reviewed sample", releaseYear: "2014 review", notes: "实测约 137.8 mm 闭帽、38 g 的单支样本；不写成全系固定尺寸重量。", sourceKey: SOURCES.review.key, variantKind: "market_sku" },
    ],
    spec: {
      brandEntityId: PHASE75_SHEAFFER_ID,
      values: {
        series_name: "Sheaffer Legacy Heritage（第三代 Legacy）",
        release_year: "2003 起（第三代 Legacy；具体饰面/SKU 按目录和市场核对）",
        origin_country: "Sheaffer 品牌历史语境；具体生产地与批次必须由对应包装、刻印或当期资料确认",
        nib: "18K gold、palladium-plated inlaid nib；笔幅和特定 SKU 配置按目录/实物核对",
        fill_system: "Sheaffer cartridge/converter 系统；不是内置活塞，也不是 Legacy I/II 的专用 Touchdown converter",
        material: "宽笔身 Heritage；palladium、sterling silver 与特别饰面为特定 903x/904x SKU，不作全系材质",
        dimensions: "2014 black/palladium 评测样本：约 137.8 mm 闭帽、120.1 mm 无帽、147.0 mm 插帽；并非全系列保证",
        weight: "2014 black/palladium 评测样本：约 38 g；材质、饰面和个体状态会改变重量",
        status: "历史第三代 Legacy；二手购入时按 903x/904x、笔尖刻印、尾端与供墨实物确认",
      },
      evidence: [
        evidence("brand_entity_id", "phase75-heritage-brand", SOURCES.catalogue.key, scopeKey, "Sheaffer catalogue product context"),
        evidence("series_name", "phase75-heritage-series", SOURCES.catalogue.key, scopeKey, "2006 catalogue Legacy Heritage collection"),
        evidence("release_year", "phase75-heritage-release", SOURCES.history.key, scopeKey, "third Legacy generation introduced in 2003"),
        evidence("origin_country", "phase75-heritage-origin", SOURCES.catalogue.key, scopeKey, "Sheaffer brand catalogue context; no factory inference"),
        evidence("nib", "phase75-heritage-nib", SOURCES.catalogue.key, scopeKey, "18K palladium-plated inlaid nib statement"),
        evidence("fill_system", "phase75-heritage-fill", SOURCES.history.key, scopeKey, "Heritage cartridge/converter transition"),
        evidence("material", "phase75-heritage-material", SOURCES.catalogue.key, scopeKey, "903x/904x finish group boundary"),
        evidence("dimensions", "phase75-heritage-dimensions", SOURCES.review.key, scopeKey, "2014 black/palladium reviewed sample measurement"),
        evidence("weight", "phase75-heritage-weight", SOURCES.review.key, scopeKey, "2014 black/palladium reviewed sample weight"),
        evidence("status", "phase75-heritage-status", SOURCES.current.key, scopeKey, "current steel-nib revival distinguishes the historical Heritage"),
      ],
    },
    media: media(
      "phase75-sheaffer-legacy-heritage-media",
      "Sheaffer Legacy Heritage 身份与代际事实图（非产品照片）",
      SOURCES.heritageSvg,
    ),
    timeline: [
      {
        key: "phase75-heritage-third-generation",
        title: "Legacy Heritage 进入第三代",
        eventType: "model_released",
        startDate: "2003",
        circa: false,
        description: "历史资料记录 Heritage 为第三代 Legacy，并从 Touchdown converter 转向 cartridge/converter。",
        sourceKey: SOURCES.history.key,
      },
      {
        key: "phase75-heritage-2006-catalogue",
        title: "2006 catalogue 的 Heritage 饰面记录",
        eventType: "design_milestone",
        startDate: "2006",
        circa: false,
        description: "同期目录记载宽笔身、18K palladium-plated inlaid nib 与多组 903x/904x 饰面；不将目录年份当成全部饰面的首发年。",
        sourceKey: SOURCES.catalogue.key,
      },
    ],
  };
}

export const phase75SheafferLegacyHeritagePacks: CuratedEntityPack[] = [
  brandPack(),
  legacyHeritagePack(),
];
