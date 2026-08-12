import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE604_BANJU_BRAND_ID = "S3JHYQtqJExx";
export const PHASE604_BANJU_BRAND_SLUG = "banju";
export const PHASE604_BANJU_DOER_ID = "phase604-banju-doer";
export const PHASE604_BANJU_DOER_SLUG = "banju-doer";
export const PHASE604_YISIHUA_ID = "mx3fnAnteiHS";
export const PHASE604_ASVINE_BRAND_ID = "phase66-brand-4021dffad5ea8c4af6d7692b";

const RETRIEVED = "2026-08-12";

function source(
  input: Omit<
    CuratedSource,
    "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
  > & { locator: string },
): CuratedSource {
  const { locator, ...rest } = input;
  return {
    ...rest,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}`,
  };
}

function diagram(
  key: string,
  title: string,
  localPath: string,
): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase604",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase604",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片、Logo 或比例图。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false`,
  };
}

const SOURCES = {
  manufacturer: source({
    key: "phase604-banju-manufacturer-profile",
    registryKey: "made-in-china-banju-phase604",
    registryName: "Made-in-China manufacturer showroom",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "banju-manufacturer-submitted-profile",
    title: "Suzhou Banju Cultural Creative Co., Ltd.",
    url: "https://www.made-in-china.com/showroom/banju-cultural/",
    homepageUrl: "https://www.made-in-china.com/",
    itemType: "manufacturer_profile",
    author: "Suzhou Banju Cultural Creative Co., Ltd.",
    summary:
      "制造商自述页把苏州半句文化创意有限公司列为 Manufacturer/Factory，展示 fountain pen 产品，并描述设计、研发、生产与销售文具创意产品；2019 仅是平台账户注册时间。",
    locator:
      "company name; Business Type Manufacturer/Factory; Account Registered in 2019; fountain pen product list; company introduction",
  }),
  tyleeStraight: source({
    key: "phase604-banju-doer-tylee-straight",
    registryKey: "tylee-banju-doer-phase604",
    registryName: "TY Lee Pen Shop",
    sourceType: "retailer",
    tier: "retailer",
    independenceGroup: "tylee-banju-doer-retail",
    title: "半句 BANJU DOER 实践家直条纹钢笔（枪灰绿）",
    url: "https://www.tylee.tw/index.php?path=652&product_id=12599&route=product%2Fproduct",
    homepageUrl: "https://www.tylee.tw/",
    itemType: "product_page",
    author: "TY Lee Pen Shop",
    summary:
      "专业零售页明确品牌为半句 BANJU、型号为 BANJU Doer；标称铝制金属笔身、CNC 表面、不锈钢 F 尖、吸墨器、旋转笔帽、139 × 14.8 mm 与约 32 g。",
    locator:
      "brand and model fields; product description; 139*14.8mm; stainless F nib; aluminium barrel; 32g; converter",
  }),
  tyleeDiamond: source({
    key: "phase604-banju-doer-tylee-diamond",
    registryKey: "tylee-banju-doer-diamond-phase604",
    registryName: "TY Lee Pen Shop",
    sourceType: "retailer",
    tier: "retailer",
    independenceGroup: "tylee-banju-doer-retail",
    title: "半句 BANJU DOER 实践家菱格纹钢笔（绅士咖）",
    url: "https://www.tylee.tw/index.php?path=652&product_id=12596&route=product%2Fproduct",
    homepageUrl: "https://www.tylee.tw/",
    itemType: "product_page",
    author: "TY Lee Pen Shop",
    summary:
      "同一专业零售商把菱格纹绅士咖也列为 BANJU Doer，并给出与直条纹一致的核心尺寸、重量、F 尖、铝制笔身和吸墨器。",
    locator:
      "brand and model fields; diamond-pattern title; same dimensions, weight, nib, material and converter listing",
  }),
  fpn: source({
    key: "phase604-banju-doer-fpn-sample",
    registryKey: "fountain-pen-network-banju-phase604",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "professional_secondary",
    independenceGroup: "fpn-dan-carmell-banju-sample",
    title: "Two Banju",
    url: "https://www.fountainpennetwork.com/forum/topic/379481-two-banju/",
    homepageUrl: "https://www.fountainpennetwork.com/",
    itemType: "hands_on_review",
    author: "Dan Carmell",
    publishedAt: "2025-08-26",
    summary:
      "独立实物帖同时辨认 Banju Doer 与 Ferris Wheel；Doer 样本使用 #26／#5 双配色钢尖、2.6 mm 墨囊／转换器，作者记录三色、两种纹理、深度后插、偏细握位和具体样本写感。",
    locator:
      "Doer and Ferris Wheel identity; #26/#5 nib; cartridge/converter 2.6mm; three colors; two patterns; posting and section observations",
  }),
  brandSvg: diagram(
    "phase604-banju-brand-svg",
    "半句 Banju 品牌身份事实图",
    "/images/library/site-original/phase604/banju/brand.svg",
  ),
  doerSvg: diagram(
    "phase604-banju-doer-svg",
    "Banju Doer 规格与版本事实图",
    "/images/library/site-original/phase604/banju/doer.svg",
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

function media(
  key: string,
  title: string,
  sourceItem: CuratedSource,
) {
  return [
    {
      key,
      title,
      sourceKey: sourceItem.key,
      localPath: sourceItem.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片、Logo、颜色校样或比例图。",
      sourceUrl: sourceItem.url,
      usageStatus: "primary" as const,
    },
  ];
}

const BRAND_SCOPE = "phase604-banju-brand-scope";
const DOER_SCOPE = "phase604-banju-doer-scope";

export const phase604BanjuPacks: CuratedEntityPack[] = [
  {
    key: "phase604-banju-brand-recovery-v1",
    entityId: PHASE604_BANJU_BRAND_ID,
    expectedType: "brand",
    expectedSlug: PHASE604_BANJU_BRAND_SLUG,
    canonicalName: "半句 Banju",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/banju-brand-phase604.md",
    storyTitle: "半句 Banju：从苏州文创品牌到可核对的钢笔型号",
    primarySourceKey: SOURCES.manufacturer.key,
    depthTier: "B",
    aliases: [
      {
        alias: "半句",
        language: "zh",
        sourceKey: SOURCES.tyleeStraight.key,
      },
      {
        alias: "BANJU",
        language: "en",
        sourceKey: SOURCES.manufacturer.key,
      },
      {
        alias: "BanJu",
        language: "en",
        sourceKey: SOURCES.tyleeStraight.key,
      },
    ],
    sources: [
      SOURCES.manufacturer,
      SOURCES.tyleeStraight,
      SOURCES.fpn,
      SOURCES.brandSvg,
    ],
    scopes: [
      {
        key: BRAND_SCOPE,
        scopeKey: BRAND_SCOPE,
        productionState: "current",
        editionScope:
          "半句 Banju 品牌导航；仅反链已完成身份、来源与媒体审核的具体钢笔，不把研究线索自动公开。",
      },
    ],
    claims: [
      {
        key: "phase604-banju-brand-identity",
        predicate: "brand_identity",
        objectText:
          "半句 Banju 是苏州半句文化创意有限公司公开使用的文创书写品牌；制造商自述页展示钢笔产品并说明设计、研发、生产与销售语境。",
        factClass: "core",
        confidence: 0.96,
        sourceKey: SOURCES.manufacturer.key,
        locator: "company name, manufacturer/factory status and fountain pen list",
        evidence: [
          {
            key: "phase604-banju-brand-identity-manufacturer",
            sourceKey: SOURCES.manufacturer.key,
            scopeKey: BRAND_SCOPE,
            locator:
              "Suzhou Banju Cultural Creative Co., Ltd.; Manufacturer/Factory; fountain pen products",
          },
          {
            key: "phase604-banju-brand-identity-retailer",
            sourceKey: SOURCES.tyleeStraight.key,
            scopeKey: BRAND_SCOPE,
            locator: "brand field 半句 BANJU and model field BANJU Doer",
          },
        ],
      },
      {
        key: "phase604-banju-brand-time-boundary",
        predicate: "history_boundary",
        objectText:
          "Made-in-China 的 2019 只表示供应商账户注册时间，不是公司成立、品牌创立或 Doer 首发年份。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.manufacturer.key,
        locator: "Account Registered in: 2019",
        evidence: [
          {
            key: "phase604-banju-brand-time-boundary-evidence",
            sourceKey: SOURCES.manufacturer.key,
            scopeKey: BRAND_SCOPE,
            locator:
              "marketplace account registration field; no independent founding-date field",
          },
        ],
      },
      {
        key: "phase604-banju-brand-navigation",
        predicate: "brand_navigation_boundary",
        objectText:
          "品牌页先以 Doer 实践家作为完整代表型号；Ferris Wheel、Star Shark／F-Plan、Candy 与 White Sugar 等线索必须分别补足目录、规格和版本证据后再建页。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: SOURCES.fpn.key,
        locator: "Doer, Ferris Wheel and Star Shark/F-Plan model distinctions",
        evidence: [
          {
            key: "phase604-banju-brand-navigation-fpn",
            sourceKey: SOURCES.fpn.key,
            scopeKey: BRAND_SCOPE,
            locator:
              "distinct Doer, Ferris Wheel and Star Shark/F-Plan references",
          },
          {
            key: "phase604-banju-brand-navigation-retailer",
            sourceKey: SOURCES.tyleeStraight.key,
            scopeKey: BRAND_SCOPE,
            locator: "exact BANJU Doer product identity",
          },
        ],
      },
    ],
    media: media(
      "phase604-banju-brand-media",
      "半句 Banju 品牌身份事实图（非产品照片）",
      SOURCES.brandSvg,
    ),
    timeline: [
      {
        key: "phase604-banju-marketplace-2019",
        title: "制造商平台账户注册记录",
        eventType: "community_event",
        startDate: "2019",
        circa: false,
        description:
          "Made-in-China 显示供应商账户于 2019 年注册；这只是公开存在锚点，不等同于品牌创立或公司成立。",
        sourceKey: SOURCES.manufacturer.key,
      },
      {
        key: "phase604-banju-doer-sample-2025",
        title: "Doer 与 Ferris Wheel 独立实物记录",
        eventType: "community_event",
        startDate: "2025-08-26",
        circa: false,
        description:
          "Fountain Pen Network 发布 Doer 与 Ferris Wheel 的独立实物帖，提供型号辨认与样本结构观察。",
        sourceKey: SOURCES.fpn.key,
      },
    ],
  },
  {
    key: "phase604-banju-doer-v1",
    entityId: PHASE604_BANJU_DOER_ID,
    expectedType: "pen",
    expectedSlug: PHASE604_BANJU_DOER_SLUG,
    canonicalName: "Banju Doer 实践家",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/banju-doer-phase604.md",
    storyTitle: "Banju Doer 实践家：铝制切面金属笔的版本边界",
    primarySourceKey: SOURCES.tyleeStraight.key,
    depthTier: "B",
    aliases: [
      {
        alias: "BANJU Doer",
        language: "en",
        sourceKey: SOURCES.tyleeStraight.key,
      },
      {
        alias: "半句 Doer",
        language: "zh",
        sourceKey: SOURCES.tyleeStraight.key,
      },
      {
        alias: "半句 实践家",
        language: "zh",
        sourceKey: SOURCES.tyleeDiamond.key,
      },
      {
        alias: "Banju Doer Fountain Pen",
        language: "en",
        sourceKey: SOURCES.fpn.key,
      },
    ],
    sources: [
      SOURCES.manufacturer,
      SOURCES.tyleeStraight,
      SOURCES.tyleeDiamond,
      SOURCES.fpn,
      SOURCES.doerSvg,
    ],
    scopes: [
      {
        key: DOER_SCOPE,
        scopeKey: DOER_SCOPE,
        productionState: "current",
        editionScope:
          "Banju Doer／实践家主型号；直条纹、菱格纹、颜色与销售包是 variant 或 SKU 层，不拆成独立型号。",
      },
    ],
    claims: [
      {
        key: "phase604-banju-doer-identity",
        predicate: "model_identity",
        objectText:
          "Doer／实践家是半句 Banju 下的独立钢笔型号；直条纹与菱格纹商品页均使用同一 BANJU Doer 型号字段。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.tyleeStraight.key,
        locator: "brand and model fields on both TY Lee product pages",
        evidence: [
          {
            key: "phase604-banju-doer-identity-straight",
            sourceKey: SOURCES.tyleeStraight.key,
            scopeKey: DOER_SCOPE,
            locator: "brand 半句 BANJU; model BANJU Doer",
          },
          {
            key: "phase604-banju-doer-identity-diamond",
            sourceKey: SOURCES.tyleeDiamond.key,
            scopeKey: DOER_SCOPE,
            locator: "diamond-pattern product with model BANJU Doer",
          },
        ],
      },
      {
        key: "phase604-banju-doer-retail-spec",
        predicate: "retail_specification",
        objectText:
          "专业零售页标称 CNC 加工铝制笔身、不锈钢 F 尖、吸墨器、旋转式笔帽、139 × 14.8 mm 与约 32 g。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: SOURCES.tyleeStraight.key,
        locator: "product description and specification block",
        evidence: [
          {
            key: "phase604-banju-doer-retail-spec-straight",
            sourceKey: SOURCES.tyleeStraight.key,
            scopeKey: DOER_SCOPE,
            locator:
              "139*14.8mm; stainless F nib; aluminium barrel; 32g; converter; screw cap",
          },
          {
            key: "phase604-banju-doer-retail-spec-diamond",
            sourceKey: SOURCES.tyleeDiamond.key,
            scopeKey: DOER_SCOPE,
            locator: "same core specification block on diamond-pattern variant",
          },
        ],
      },
      {
        key: "phase604-banju-doer-sample",
        predicate: "sample_configuration",
        objectText:
          "2025 年独立样本使用 #26／#5 双配色钢尖和 2.6 mm 墨囊／转换器；作者记录三色、两种纹理、深度后插和偏细握位，这些属于单支样本与当时市场观察。",
        factClass: "editorial",
        confidence: 0.95,
        sourceKey: SOURCES.fpn.key,
        locator:
          "#26/#5 nib; 2.6mm cartridge/converter; three colors; two patterns; posting and section observations",
        evidence: [
          {
            key: "phase604-banju-doer-sample-evidence",
            sourceKey: SOURCES.fpn.key,
            scopeKey: DOER_SCOPE,
            locator:
              "Doer sample paragraphs covering nib, filling, colors, patterns, section and posting",
          },
        ],
      },
      {
        key: "phase604-banju-doer-german-boundary",
        predicate: "nib_origin_boundary",
        objectText:
          "零售文案中的德国铱金粒只描述笔尖焊点材料，不足以证明整枚笔尖或笔尖总成在德国制造。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.tyleeStraight.key,
        locator: "German iridium grain wording versus stainless F nib wording",
        evidence: [
          {
            key: "phase604-banju-doer-german-boundary-evidence",
            sourceKey: SOURCES.tyleeStraight.key,
            scopeKey: DOER_SCOPE,
            locator:
              "German iridium grain statement does not identify whole-nib manufacturer",
          },
        ],
      },
      {
        key: "phase604-banju-doer-care",
        predicate: "maintenance_boundary",
        objectText:
          "换墨先用常温清水轻柔吸排并自然阴干；铝制纹理与涂层只用软布，避开酒精、强溶剂、磨料、整笔超声和盲目替换 #5 尖。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: SOURCES.tyleeStraight.key,
        locator:
          "aluminium body, converter filling and conservative care boundary",
        evidence: [
          {
            key: "phase604-banju-doer-care-evidence",
            sourceKey: SOURCES.tyleeStraight.key,
            scopeKey: DOER_SCOPE,
            locator:
              "aluminium/CNC surface and converter construction; conservative editorial care guidance",
          },
        ],
      },
    ],
    variants: [
      {
        key: "phase604-banju-doer-straight-green",
        name: "直条纹 枪灰绿",
        notes: "TY Lee 具名直条纹枪灰绿商品；核心型号仍是 Banju Doer。",
        sourceKey: SOURCES.tyleeStraight.key,
        variantKind: "color",
        market: "台湾零售记录",
      },
      {
        key: "phase604-banju-doer-diamond-brown",
        name: "菱格纹 绅士咖",
        notes: "TY Lee 具名菱格纹绅士咖商品；核心型号仍是 Banju Doer。",
        sourceKey: SOURCES.tyleeDiamond.key,
        variantKind: "color",
        market: "台湾零售记录",
      },
      {
        key: "phase604-banju-doer-steel-blue",
        name: "Steel Blue",
        notes:
          "Fountain Pen Network 作者所见三色之一；该记录未固定 Steel Blue 对应哪一种表面纹理。",
        sourceKey: SOURCES.fpn.key,
        variantKind: "color",
      },
    ],
    spec: {
      brandEntityId: PHASE604_BANJU_BRAND_ID,
      values: {
        series_name: "DOER 实践家",
        release_year: "不晚于 2025 年（公开实物记录；首发年份未核实）",
        origin_country: "中国；品牌与制造商资料指向苏州",
        nib: "不锈钢 F 尖；独立样本为 #26／#5 双配色钢尖",
        fill_system: "2.6 mm 墨囊／转换器；零售包随附吸墨器",
        material: "CNC 加工高强度铝合金笔身，金属握位",
        dimensions: "收合约 139 × 14.8 mm；14.8 mm 不等同握位直径",
        weight: "约 32 g；纹理、配件和含墨状态可能影响称量",
        price_range: "随地区、纹理、颜色、库存和时间变化",
        status: "2026 年 8 月仍有专业零售记录",
      },
      evidence: [
        evidence(
          "brand_entity_id",
          "phase604-banju-doer-brand",
          SOURCES.tyleeStraight.key,
          DOER_SCOPE,
          "brand field 半句 BANJU and model field BANJU Doer",
        ),
        evidence(
          "series_name",
          "phase604-banju-doer-series",
          SOURCES.tyleeStraight.key,
          DOER_SCOPE,
          "BANJU Doer / DOER 实践家 product title and model field",
        ),
        evidence(
          "release_year",
          "phase604-banju-doer-release",
          SOURCES.fpn.key,
          DOER_SCOPE,
          "independent sample published 2025-08-26; observed record, not launch year",
        ),
        evidence(
          "origin_country",
          "phase604-banju-doer-origin",
          SOURCES.manufacturer.key,
          DOER_SCOPE,
          "Suzhou, Jiangsu manufacturer profile and Banju fountain pen context",
        ),
        evidence(
          "nib",
          "phase604-banju-doer-nib",
          SOURCES.tyleeStraight.key,
          DOER_SCOPE,
          "stainless steel F nib; FPN sample supplements #26/#5 two-tone steel",
        ),
        evidence(
          "fill_system",
          "phase604-banju-doer-fill",
          SOURCES.fpn.key,
          DOER_SCOPE,
          "2.6mm cartridge/converter sample; retailer lists included converter",
        ),
        evidence(
          "material",
          "phase604-banju-doer-material",
          SOURCES.tyleeStraight.key,
          DOER_SCOPE,
          "CNC-machined high-strength aluminium barrel",
        ),
        evidence(
          "dimensions",
          "phase604-banju-doer-dimensions",
          SOURCES.tyleeStraight.key,
          DOER_SCOPE,
          "139*14.8mm retail listing",
        ),
        evidence(
          "weight",
          "phase604-banju-doer-weight",
          SOURCES.tyleeStraight.key,
          DOER_SCOPE,
          "32g retail listing",
        ),
        evidence(
          "price_range",
          "phase604-banju-doer-price",
          SOURCES.tyleeStraight.key,
          DOER_SCOPE,
          "regional live price is volatile; preserve no numeric canonical price",
        ),
        evidence(
          "status",
          "phase604-banju-doer-status",
          SOURCES.tyleeStraight.key,
          DOER_SCOPE,
          `retail listing retrieved ${RETRIEVED}`,
        ),
      ],
    },
    media: media(
      "phase604-banju-doer-media",
      "Banju Doer 规格与版本事实图（非产品照片）",
      SOURCES.doerSvg,
    ),
    timeline: [
      {
        key: "phase604-banju-doer-2025-sample",
        title: "Doer 独立实物记录",
        eventType: "community_event",
        startDate: "2025-08-26",
        circa: false,
        description:
          "Fountain Pen Network 发布 Doer 样本记录；该日期证明公开存在，不等同于首发日。",
        sourceKey: SOURCES.fpn.key,
      },
    ],
  },
];
