import type {
  CuratedClaimEvidence,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE171_WASP_IDS = {
  brand: "97fwqRaz02kE",
  addipoint: "5j4oXThfSHoz",
  clipper: "emvoh_r4BnJa",
} as const;
export const PHASE171_WASP_SLUGS = {
  brand: "wasp",
  addipoint: "the-wasp-addipoint",
  clipper: "the-wasp-clipper",
} as const;
const RETRIEVED = "2026-07-24";
const BRAND_SCOPE = "phase171-wasp-brand";
const ADDIPOINT_SCOPE = "phase171-wasp-addipoint";
const CLIPPER_SCOPE = "phase171-wasp-clipper";

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
    ...input,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    independenceGroup: input.registryKey,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}
function diagram(
  key: string,
  title: string,
  url: string,
  summary: string,
): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase171",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase171",
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
  sheafferOfficial: web({
    key: "phase171-wasp-sheaffer-official",
    title: "Sheaffer: history and current technology",
    url: "https://sheaffer.com/blogs/news/sheaffer-history-and-current-technology-used",
    registryKey: "sheaffer-official-history-phase171",
    registryName: "Sheaffer",
    sourceType: "official",
    tier: "primary",
    summary:
      "Sheaffer 官方历史页记录 1913 年 Fort Madison 起点和杠杆钢笔传统，用于确认 WASP 与 Sheaffer 主品牌的历史边界，不替代副品牌型号规格。",
    locator: "1913 Fort Madison and Sheaffer lever-filling history",
  }),
  waspHistory: web({
    key: "phase171-wasp-fountainpen-it",
    title: "FountainPen.it: Wasp under minor American manufacturers",
    url: "https://www.fountainpen.it/Produttori_minori_americani",
    registryKey: "fountainpen-it-wasp-phase171",
    registryName: "FountainPen.it",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "型号史资料把 Wasp 解释为 W. A. Sheaffer Pen 的副品牌/复杂命名，列出 Clipper、Addipoint、Rite-o-Way，并给出 1934、1937 与 1940 时间线。",
    locator: "Wasp identity, Clipper/Addipoint lines, 1934–1940 timeline",
  }),
  sheafferTimeline: web({
    key: "phase171-wasp-sheaffer-timeline",
    title: "FountainPen.it: W. A. Sheaffer Pen Company",
    url: "https://www.fountainpen.it/Sheaffer",
    registryKey: "fountainpen-it-sheaffer-phase171",
    registryName: "FountainPen.it",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "Sheaffer 型号表把 Wasp Addipoint 放在 1934–1940、Wasp Clipper 放在 1937–1940，并将副品牌与 Clipper 节点放入公司时间线。",
    locator: "model table and 1934/1937/1940 chronology",
  }),
  addipoint: web({
    key: "phase171-wasp-addipoint-penhero",
    title: "PenHero: Wasp Addipoint 1934–c.1940",
    url: "https://penhero.com/PenGallery/Sheaffer/SheafferWaspAddipoint.htm",
    registryKey: "penhero-wasp-addipoint-phase171",
    registryName: "PenHero",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "专业档案记录 Addipoint 可更换尖单元、钢/金/柔性/速记尖范围、junior/standard 尺寸、杠杆填充和颜色/五金版本。",
    locator: "changeable nib units; 1934–c.1940; junior/standard; lever filler",
  }),
  clipper: web({
    key: "phase171-wasp-clipper-paperwants",
    title: "Paper Wants A Pen: c.1938 WASP The Clipper Vacuum-Fil",
    url: "https://paperwantsapen.com/products/1938-wasp-the-clipper-vacuum-fil-fountain-pens",
    registryKey: "paperwantsapen-wasp-clipper-phase171",
    registryName: "Paper Wants A Pen",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "实物档案记录约 1938 Clipper 的 Vacuum-Fil、透明 celluloid 观察窗、12K 尖、帽顶/盲帽代际、EF/F 样本和约 126 mm 闭帽尺寸。",
    locator: "c.1938 Vacuum-Fil samples; windows; 12K nib; dimensions",
  }),
  clipperHistory: web({
    key: "phase171-wasp-clipper-history",
    title: "FountainPen.it: Wasp Clipper",
    url: "https://www.fountainpen.it/Produttori_minori_americani",
    registryKey: "fountainpen-it-clipper-phase171",
    registryName: "FountainPen.it",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "型号史资料把 Clipper 作为 Wasp 较高定位产品，记录杠杆与 Vacuum-Fil 两种路线及约 1937–1940 窗口。",
    locator: "Clipper lever/Vacuum-Fil and 1937–1940 window",
  }),
  brandSvg: diagram(
    "phase171-wasp-brand-svg",
    "WASP brand navigation",
    "/images/library/site-original/phase171/wasp/brand.svg",
    "本站原创 factual SVG，表达 WASP 与 Sheaffer 关系及 Addipoint/Clipper 导航。",
  ),
  addipointSvg: diagram(
    "phase171-wasp-addipoint-svg",
    "WASP Addipoint facts",
    "/images/library/site-original/phase171/wasp/addipoint.svg",
    "本站原创 factual SVG，表达 Addipoint 可换尖和尺寸边界。",
  ),
  clipperSvg: diagram(
    "phase171-wasp-clipper-svg",
    "WASP Clipper facts",
    "/images/library/site-original/phase171/wasp/clipper.svg",
    "本站原创 factual SVG，表达 Clipper Vacuum-Fil、观察窗和代际线索。",
  ),
} as const;
function ce(
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
): CuratedClaimEvidence {
  return { key, sourceKey, scopeKey, locator };
}
function ev(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  scopeKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
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
        "本站原创 factual SVG；非产品照片，不证明真实比例、颜色、尖材、修复状态或库存。",
      sourceUrl: source.url,
      usageStatus: "primary" as const,
    },
  ];
}

const brand: CuratedEntityPack = {
  key: "phase171-wasp-brand-v1",
  entityId: PHASE171_WASP_IDS.brand,
  expectedType: "brand",
  expectedSlug: PHASE171_WASP_SLUGS.brand,
  canonicalName: "WASP",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/wasp-brand-phase171.md",
  storyTitle: "WASP：Sheaffer 低价副品牌与历史产品线",
  primarySourceKey: S.sheafferOfficial.key,
  depthTier: "A",
  aliases: [
    { alias: "WASP", language: "en", sourceKey: S.waspHistory.key },
    {
      alias: "W. A. Sheaffer Pen",
      language: "en",
      sourceKey: S.waspHistory.key,
    },
    { alias: "Wasp", language: "en", sourceKey: S.waspHistory.key },
  ],
  sources: [
    S.sheafferOfficial,
    S.waspHistory,
    S.sheafferTimeline,
    S.addipoint,
    S.clipper,
    S.clipperHistory,
    S.brandSvg,
  ],
  scopes: [
    {
      key: BRAND_SCOPE,
      scopeKey: BRAND_SCOPE,
      productionState: "historical",
      editionScope:
        "WASP 作为 Sheaffer 关联副品牌的 1930 年代产品；Addipoint、Clipper、Rite-o-Way 各自保留机构和版本边界。",
    },
  ],
  claims: [
    {
      key: "phase171-wasp-identity",
      predicate: "brand_identity",
      objectText:
        "WASP 通常解释为 W. A. Sheaffer Pen，是 Sheaffer 在 1930 年代建立的低价副品牌/产品线；资料同时提示公司法人与独立 W.A.S.P. Pen Co. 的历史命名复杂度。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.waspHistory.key,
      locator: S.waspHistory.summary,
      evidence: [
        ce(
          "phase171-wasp-identity-e",
          S.waspHistory.key,
          BRAND_SCOPE,
          "Wasp abbreviation and ownership caveat",
        ),
        ce(
          "phase171-wasp-official-e",
          S.sheafferOfficial.key,
          BRAND_SCOPE,
          "Sheaffer Fort Madison company history",
        ),
      ],
    },
    {
      key: "phase171-wasp-navigation",
      predicate: "model_navigation",
      objectText:
        "WASP 导航包含 Addipoint 与 Clipper；Addipoint 的可换尖和 junior/standard 尺寸、Clipper 的 lever/Vacuum-Fil 与观察窗不得互相覆盖。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.waspHistory.key,
      locator: S.waspHistory.summary,
      evidence: [
        ce(
          "phase171-wasp-nav-addipoint",
          S.addipoint.key,
          BRAND_SCOPE,
          "Addipoint line",
        ),
        ce(
          "phase171-wasp-nav-clipper",
          S.clipper.key,
          BRAND_SCOPE,
          "Clipper line",
        ),
      ],
    },
    {
      key: "phase171-wasp-period",
      predicate: "historical_window",
      objectText:
        "公开时间表把 Wasp 副品牌放在 1934 年起、Addipoint 约 1934–1940、Clipper 约 1937–1940；停产年份应视为资料窗口而非单支出厂日。",
      factClass: "core",
      confidence: 0.97,
      sourceKey: S.sheafferTimeline.key,
      locator: S.sheafferTimeline.summary,
      evidence: [
        ce(
          "phase171-wasp-period-e",
          S.sheafferTimeline.key,
          BRAND_SCOPE,
          "model table and chronology",
        ),
      ],
    },
  ],
  timeline: [
    {
      key: "phase171-wasp-launch",
      title: "WASP 副品牌进入 Sheaffer 产品谱系",
      eventType: "model_released",
      startDate: "1934",
      circa: true,
      description: "资料将 1934 作为 Wasp 副品牌的明确时间节点。",
      sourceKey: S.waspHistory.key,
    },
    {
      key: "phase171-wasp-clipper",
      title: "WASP Clipper 进入产品线",
      eventType: "model_released",
      startDate: "1937",
      circa: true,
      description: "Sheaffer 型号时间表将 Clipper 放在约 1937 年的产品窗口。",
      sourceKey: S.sheafferTimeline.key,
    },
  ],
  media: media(
    "phase171-wasp-brand-media",
    "WASP 品牌导航事实图（非产品照片）",
    S.brandSvg,
  ),
};

function makePen(input: {
  key: string;
  id: string;
  slug: string;
  name: string;
  title: string;
  markdownFile: string;
  scope: string;
  primary: CuratedSource;
  sources: CuratedSource[];
  aliases: CuratedEntityPack["aliases"];
  claims: CuratedEntityPack["claims"];
  variants: NonNullable<CuratedEntityPack["variants"]>;
  spec: NonNullable<CuratedEntityPack["spec"]>;
  timeline: NonNullable<CuratedEntityPack["timeline"]>;
  image: CuratedSource;
}): CuratedEntityPack {
  const sources = Array.from(
    new Map(
      [...brand.sources, ...input.sources, input.image].map((source) => [
        source.key,
        source,
      ]),
    ).values(),
  );
  return {
    key: input.key,
    entityId: input.id,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.title,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases,
    sources,
    scopes: [
      {
        key: input.scope,
        scopeKey: input.scope,
        productionState: "historical",
        editionScope: input.title,
      },
    ],
    claims: input.claims,
    variants: input.variants,
    spec: input.spec,
    timeline: input.timeline,
    media: media(
      `${input.key}-media`,
      `${input.name} 事实图（非产品照片）`,
      input.image,
    ),
  };
}

const addipoint = makePen({
  key: "phase171-wasp-addipoint-v1",
  id: PHASE171_WASP_IDS.addipoint,
  slug: PHASE171_WASP_SLUGS.addipoint,
  name: "The WASP Addipoint",
  title: "The WASP Addipoint：1934—1940 年的可换尖副品牌钢笔",
  markdownFile: ".planning/content-research/wasp-addipoint-phase171.md",
  scope: ADDIPOINT_SCOPE,
  primary: S.addipoint,
  sources: [S.addipoint],
  image: S.addipointSvg,
  aliases: [
    { alias: "WASP Addipoint", language: "en", sourceKey: S.addipoint.key },
    { alias: "Wasp Addipoint", language: "en", sourceKey: S.addipoint.key },
    { alias: "WASP 可换尖钢笔", language: "zh", sourceKey: S.addipoint.key },
  ],
  claims: [
    {
      key: "phase171-addipoint-identity",
      predicate: "model_identity",
      objectText:
        "The WASP Addipoint 是约 1934—1940 年的历史型号，以可更换 nib unit 区别于普通固定尖钢笔；它属于 WASP/Sheaffer 关联产品线，不是 Sheaffer 主线旗舰的同义词。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.addipoint.key,
      locator: S.addipoint.summary,
      evidence: [
        ce(
          "phase171-addipoint-id-e",
          S.addipoint.key,
          ADDIPOINT_SCOPE,
          "changeable nib unit and period",
        ),
      ],
    },
    {
      key: "phase171-addipoint-nibs",
      predicate: "nib_boundary",
      objectText:
        "公开档案列出钢尖、solid gold EF/F/M、柔性、Gregg shorthand 与 manifold 等单元；当前装尖的材质和字幅必须看刻字与实物，不能把全表当作随笔附送配置。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.addipoint.key,
      locator: "nib unit list and alloy caveat",
      evidence: [
        ce(
          "phase171-addipoint-nibs-e",
          S.addipoint.key,
          ADDIPOINT_SCOPE,
          "nib unit catalogue and alloy boundary",
        ),
      ],
    },
    {
      key: "phase171-addipoint-size",
      predicate: "version_boundary",
      objectText:
        "Addipoint 至少有 junior 与 standard 两种尺寸，早期约 4 又 3/4 英寸与约 5 英寸闭帽样本不能互相套用。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.addipoint.key,
      locator: "junior/standard sample dimensions",
      evidence: [
        ce(
          "phase171-addipoint-size-e",
          S.addipoint.key,
          ADDIPOINT_SCOPE,
          "junior and standard measurements",
        ),
      ],
    },
    {
      key: "phase171-addipoint-filler",
      predicate: "filling_system",
      objectText:
        "公开资料可见杠杆填充，也提到 Vacuum-Fil 路线；拆洗前需从尾端、section 和墨囊/活塞结构确认具体样本。",
      factClass: "core",
      confidence: 0.97,
      sourceKey: S.waspHistory.key,
      locator: "Addipoint lever and Vacuum-Fil boundary",
      evidence: [
        ce(
          "phase171-addipoint-filler-e",
          S.waspHistory.key,
          ADDIPOINT_SCOPE,
          "Addipoint filling variants",
        ),
      ],
    },
    {
      key: "phase171-addipoint-care",
      predicate: "maintenance",
      objectText:
        "换尖时保护 section 螺纹和尖单元，清洗使用常温水，避免钳子、热水、酒精和强力抛光；裂纹或老化墨囊交给 vintage Sheaffer 维修者。",
      factClass: "editorial",
      confidence: 0.98,
      sourceKey: S.addipoint.key,
      locator: "conservative nib and vintage plastic care",
      evidence: [
        ce(
          "phase171-addipoint-care-e",
          S.addipoint.key,
          ADDIPOINT_SCOPE,
          "section, nib and restoration boundary",
        ),
      ],
    },
    {
      key: "phase171-addipoint-brand",
      predicate: "brand_boundary",
      objectText:
        "Sheaffer 官方历史确认 Fort Madison 与杠杆钢笔传统；WASP 的副品牌关系由型号史资料进一步限定，不能只凭现代 Sheaffer 页面推断全部旧笔规格。",
      factClass: "core",
      confidence: 0.95,
      sourceKey: S.sheafferOfficial.key,
      locator: "official Sheaffer history",
      evidence: [
        ce(
          "phase171-addipoint-brand-e",
          S.sheafferOfficial.key,
          ADDIPOINT_SCOPE,
          "Sheaffer Fort Madison history",
        ),
      ],
    },
  ],
  variants: [
    {
      key: "phase171-addipoint-junior",
      name: "Junior Addipoint",
      notes: "约 4 又 3/4 英寸闭帽的早期样本路线；当前尖和五金按实物。",
      sourceKey: S.addipoint.key,
      variantKind: "edition_group",
    },
    {
      key: "phase171-addipoint-standard",
      name: "Standard Addipoint",
      notes: "约 5 英寸闭帽样本；尺寸和颜色不能覆盖 junior。",
      sourceKey: S.addipoint.key,
      variantKind: "edition_group",
    },
    {
      key: "phase171-addipoint-nib-units",
      name: "可更换 nib units",
      notes:
        "钢、金、柔性、Gregg shorthand、manifold 等档案单元；不代表每支附全套。",
      sourceKey: S.addipoint.key,
      variantKind: "nib",
    },
  ],
  spec: {
    brandEntityId: PHASE171_WASP_IDS.brand,
    values: {
      series_name: "WASP Addipoint",
      release_year: "约 1934—1940",
      origin_country: "美国 Fort Madison / Sheaffer 关联语境",
      nib: "可更换 nib unit；钢、金、柔性、Gregg shorthand、manifold 等资料范围",
      fill_system: "杠杆填充为主要样本，亦有 Vacuum-Fil 路线",
      material: "彩色 pearlized plastic、黑色塑料与镀金/不锈钢五金版本",
      dimensions: "junior 约 4 又 3/4 英寸、standard 约 5 英寸闭帽样本",
      weight: "无可核实全系统一克重；按尺寸、五金和含墨量量测",
      status: "历史型号；约 1940 年前后退出生产窗口",
    },
    evidence: [
      ev(
        "phase171-addipoint-brand",
        "brand_entity_id",
        S.sheafferOfficial.key,
        ADDIPOINT_SCOPE,
        "Sheaffer official history",
      ),
      ev(
        "phase171-addipoint-series",
        "series_name",
        S.addipoint.key,
        ADDIPOINT_SCOPE,
        "Addipoint title",
      ),
      ev(
        "phase171-addipoint-year",
        "release_year",
        S.sheafferTimeline.key,
        ADDIPOINT_SCOPE,
        "1934–1940 model table",
      ),
      ev(
        "phase171-addipoint-origin",
        "origin_country",
        S.sheafferOfficial.key,
        ADDIPOINT_SCOPE,
        "Fort Madison company history",
      ),
      ev(
        "phase171-addipoint-nib",
        "nib",
        S.addipoint.key,
        ADDIPOINT_SCOPE,
        "changeable nib units",
      ),
      ev(
        "phase171-addipoint-fill",
        "fill_system",
        S.waspHistory.key,
        ADDIPOINT_SCOPE,
        "lever/Vacuum-Fil variants",
      ),
      ev(
        "phase171-addipoint-material",
        "material",
        S.addipoint.key,
        ADDIPOINT_SCOPE,
        "plastic and trim samples",
      ),
      ev(
        "phase171-addipoint-dimensions",
        "dimensions",
        S.addipoint.key,
        ADDIPOINT_SCOPE,
        "junior/standard samples",
      ),
      ev(
        "phase171-addipoint-weight",
        "weight",
        S.addipoint.key,
        ADDIPOINT_SCOPE,
        "sample-only boundary",
      ),
      ev(
        "phase171-addipoint-status",
        "status",
        S.sheafferTimeline.key,
        ADDIPOINT_SCOPE,
        "1940 timeline",
      ),
    ],
  },
  timeline: [
    {
      key: "phase171-addipoint-release",
      title: "Addipoint 进入 Wasp 产品线",
      eventType: "model_released",
      startDate: "1934",
      circa: true,
      description: "公开型号史将 Addipoint 放在约 1934 年起的窗口。",
      sourceKey: S.sheafferTimeline.key,
    },
  ],
});

const clipper = makePen({
  key: "phase171-wasp-clipper-v1",
  id: PHASE171_WASP_IDS.clipper,
  slug: PHASE171_WASP_SLUGS.clipper,
  name: "The WASP Clipper",
  title: "The WASP Clipper：1937—1940 年的 Vacuum-Fil 与观察窗",
  markdownFile: ".planning/content-research/wasp-clipper-phase171.md",
  scope: CLIPPER_SCOPE,
  primary: S.clipper,
  sources: [S.clipper, S.clipperHistory],
  image: S.clipperSvg,
  aliases: [
    { alias: "WASP Clipper", language: "en", sourceKey: S.clipperHistory.key },
    { alias: "The Clipper", language: "en", sourceKey: S.clipper.key },
    {
      alias: "WASP Clipper Vacuum-Fil",
      language: "en",
      sourceKey: S.clipper.key,
    },
  ],
  claims: [
    {
      key: "phase171-clipper-identity",
      predicate: "model_identity",
      objectText:
        "The WASP Clipper 是约 1937—1940 年 Wasp 产品线的较高定位型号，公开资料同时记录 lever 与 Vacuum-Fil 版本；收藏俗称 circuit board 只是外观线索。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.clipperHistory.key,
      locator: S.clipperHistory.summary,
      evidence: [
        ce(
          "phase171-clipper-id-e",
          S.clipperHistory.key,
          CLIPPER_SCOPE,
          "Clipper period and filling variants",
        ),
      ],
    },
    {
      key: "phase171-clipper-vacuum",
      predicate: "filling_system",
      objectText:
        "约 1938 样本使用 Vacuum-Fil，尾端盲帽、活塞杆和密封需要配合；杠杆版是另一结构路线，不能将 Vacuum-Fil 当作所有 Clipper 标准。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.clipper.key,
      locator: "Vacuum-Fil samples and restoration",
      evidence: [
        ce(
          "phase171-clipper-vacuum-e",
          S.clipper.key,
          CLIPPER_SCOPE,
          "Vacuum-Fil and restoration boundary",
        ),
      ],
    },
    {
      key: "phase171-clipper-window",
      predicate: "material_boundary",
      objectText:
        "公开样本有透明 celluloid 观察窗、不同窗格数量和颜色；窗段会老化变琥珀色或开裂，不能用一支样本的窗口推断全系外观。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.clipper.key,
      locator: "visualated barrel and window panes",
      evidence: [
        ce(
          "phase171-clipper-window-e",
          S.clipper.key,
          CLIPPER_SCOPE,
          "transparent celluloid window samples",
        ),
      ],
    },
    {
      key: "phase171-clipper-nib",
      predicate: "nib_boundary",
      objectText:
        "Paper Wants A Pen 的样本为 12K 语境，分别有 EF 与 F；其 bouncy 感不等于柔尖承诺，尖齿和尖片不适合大压力 flex。",
      factClass: "core",
      confidence: 0.97,
      sourceKey: S.clipper.key,
      locator: "12K EF/F sample nibs and flex caution",
      evidence: [
        ce(
          "phase171-clipper-nib-e",
          S.clipper.key,
          CLIPPER_SCOPE,
          "sample nibs",
        ),
      ],
    },
    {
      key: "phase171-clipper-size",
      predicate: "version_boundary",
      objectText:
        "约 1938 样本闭帽约 126 mm、去帽约 112 mm、插帽约 151 mm，帽径约 12 mm、杆径约 10.5 mm；这些是样本数据。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.clipper.key,
      locator: "sample measurements",
      evidence: [
        ce(
          "phase171-clipper-size-e",
          S.clipper.key,
          CLIPPER_SCOPE,
          "c.1938 measurements",
        ),
      ],
    },
    {
      key: "phase171-clipper-brand",
      predicate: "brand_boundary",
      objectText:
        "Sheaffer 官方历史确认 Fort Madison 与杠杆钢笔传统；Clipper 的 Wasp 低价副品牌身份和 Vacuum-Fil 变体应以型号史和实物档案补充。",
      factClass: "core",
      confidence: 0.95,
      sourceKey: S.sheafferOfficial.key,
      locator: "official Sheaffer history",
      evidence: [
        ce(
          "phase171-clipper-brand-e",
          S.sheafferOfficial.key,
          CLIPPER_SCOPE,
          "Sheaffer Fort Madison history",
        ),
      ],
    },
  ],
  variants: [
    {
      key: "phase171-clipper-lever",
      name: "Lever-fill Clipper",
      notes: "杠杆和墨囊路线；不能与 Vacuum-Fil 零件互换。",
      sourceKey: S.clipperHistory.key,
      variantKind: "edition_group",
    },
    {
      key: "phase171-clipper-vacuum",
      name: "Vacuum-Fil Clipper",
      notes: "约 1938 样本的真空上墨路线，需检查盲帽、杆和密封。",
      sourceKey: S.clipper.key,
      variantKind: "edition_group",
    },
    {
      key: "phase171-clipper-windows",
      name: "透明观察窗版本",
      notes: "不同窗格数量和颜色是版本/样本线索，不是统一色卡。",
      sourceKey: S.clipper.key,
      variantKind: "material",
    },
  ],
  spec: {
    brandEntityId: PHASE171_WASP_IDS.brand,
    values: {
      series_name: "WASP Clipper",
      release_year: "约 1937—1940",
      origin_country: "美国 Fort Madison / Sheaffer 关联语境",
      nib: "公开样本 12K 语境，EF/F；尖材、刻字和原装程度按单支",
      fill_system: "杠杆或 Vacuum-Fil 版本；约 1938 样本为 Vacuum-Fil",
      material: "celluloid 笔身与透明观察窗、金属端件和五金",
      dimensions:
        "约 1938 样本闭帽 126 mm、去帽 112 mm、插帽 151 mm；帽径 12 mm、杆径 10.5 mm",
      weight: "无可核实全系统一克重；按样本、含墨量和修复件量测",
      status: "历史型号；约 1940 年前后退出生产窗口",
    },
    evidence: [
      ev(
        "phase171-clipper-brand",
        "brand_entity_id",
        S.sheafferOfficial.key,
        CLIPPER_SCOPE,
        "Sheaffer official history",
      ),
      ev(
        "phase171-clipper-series",
        "series_name",
        S.clipperHistory.key,
        CLIPPER_SCOPE,
        "Clipper title and line",
      ),
      ev(
        "phase171-clipper-year",
        "release_year",
        S.sheafferTimeline.key,
        CLIPPER_SCOPE,
        "1937–1940 model table",
      ),
      ev(
        "phase171-clipper-origin",
        "origin_country",
        S.sheafferOfficial.key,
        CLIPPER_SCOPE,
        "Fort Madison company history",
      ),
      ev(
        "phase171-clipper-nib",
        "nib",
        S.clipper.key,
        CLIPPER_SCOPE,
        "12K EF/F samples",
      ),
      ev(
        "phase171-clipper-fill",
        "fill_system",
        S.clipper.key,
        CLIPPER_SCOPE,
        "Vacuum-Fil sample",
      ),
      ev(
        "phase171-clipper-material",
        "material",
        S.clipper.key,
        CLIPPER_SCOPE,
        "celluloid windows",
      ),
      ev(
        "phase171-clipper-dimensions",
        "dimensions",
        S.clipper.key,
        CLIPPER_SCOPE,
        "c.1938 measurements",
      ),
      ev(
        "phase171-clipper-weight",
        "weight",
        S.clipper.key,
        CLIPPER_SCOPE,
        "sample-only boundary",
      ),
      ev(
        "phase171-clipper-status",
        "status",
        S.sheafferTimeline.key,
        CLIPPER_SCOPE,
        "1940 timeline",
      ),
    ],
  },
  timeline: [
    {
      key: "phase171-clipper-release",
      title: "Clipper 进入 Wasp 产品线",
      eventType: "model_released",
      startDate: "1937",
      circa: true,
      description: "型号史把 Clipper 放在约 1937 年的 Wasp 产品窗口。",
      sourceKey: S.sheafferTimeline.key,
    },
  ],
});

export const phase171WaspRepresentativePacks: CuratedEntityPack[] = [
  brand,
  addipoint,
  clipper,
];
