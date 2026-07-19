import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE74_MONTEVERDE_BRAND_ID = "2OpQMjam65SM";
export const PHASE74_RITMA_ID = "phase74-entity-e52336d24708815e8bfed361";
export const PHASE74_RITMA_SLUG = "monteverde-ritma";
export const PHASE74_LEGACY_ID = "ehhBLnGu6Uav";
export const PHASE74_LEGACY_SLUG = "万特佳";

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
    registryKey: "fountain-pen-graph-editorial-phase74",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase74",
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
  brand: live({
    key: "phase74-monteverde-about",
    registryKey: "monteverde-official-phase74",
    registryName: "Monteverde USA official",
    sourceType: "official",
    tier: "primary",
    title: "About Monteverde USA",
    url: "https://www.monteverdepens.com/pages/about-monteverde",
    summary:
      "官方品牌页称 Monteverde USA 创立于 1999 年，并列 California 地址；这证明品牌定位和入口，不证明每一款笔的统一制造地。",
  }),
  collection: live({
    key: "phase74-monteverde-ritma-collection",
    registryKey: "monteverde-official-phase74",
    registryName: "Monteverde USA official",
    sourceType: "official",
    tier: "primary",
    title: "Monteverde Ritma Collection",
    url: "https://www.monteverdepens.com/pages/ritma-collection-page",
    summary:
      "官方系列页将 Ritma 描述为受 1960/70 年代极简设计启发的磁吸帽钢笔：常规阳极氧化款为铝制，Walnut 为木质外观分支；基础为 JoWo #6 steel nib、international cartridge/converter，部分款才有 titanium nib。",
  }),
  green: live({
    key: "phase74-monteverde-ritma-green",
    registryKey: "monteverde-official-phase74",
    registryName: "Monteverde USA official",
    sourceType: "official",
    tier: "primary",
    title: "Ritma Fountain Pen Green Anodized",
    url: "https://www.monteverdepens.com/products/ritma-fountain-pen-green",
    summary:
      "Green Anodized 当前官方 SKU 列 151.1 mm、12.7 mm、37.77 g，且选购器列 EF/F/M/B/Stub/Omniflex；这些是该阳极氧化 SKU 的基准，不能替代 Walnut、stainless 或所有钛尖版本。",
  }),
  brushed: live({
    key: "phase74-monteverde-ritma-brushed",
    registryKey: "monteverde-official-phase74",
    registryName: "Monteverde USA official",
    sourceType: "official",
    tier: "primary",
    title: "Ritma Brushed Stainless Steel with JoWo Nib",
    url: "https://www.monteverdepens.com/products/monteverde-usa%C2%AE-ritma-fountain-pen-brushed-stainless-steel-w-jowo-nib",
    summary:
      "当前官方 SKU 用于交叉核对 Ritma 的颜色、钢尖和可见 titanium F/M 选项；它不把年度色、钢材版或钛尖变成所有 Ritma 的恒定规格。",
  }),
  goulet: live({
    key: "phase74-monteverde-ritma-walnut-goulet",
    registryKey: "goulet-pens-phase74",
    registryName: "Goulet Pens",
    sourceType: "retailer",
    tier: "professional_secondary",
    title: "Monteverde Ritma Fountain Pen - Walnut",
    url: "https://www.gouletpens.com/products/monteverde-ritma-fountain-pen-walnut",
    summary:
      "专业零售商页面把 Walnut 列为 Ritma 的木质外观 SKU，适合与官方资料交叉确认材料分支；并非所有 Ritma 的材质或重量证据。",
  }),
  fpn: live({
    key: "phase74-monteverde-ritma-fpn",
    registryKey: "fountain-pen-network-phase74",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "community",
    title: "Monteverde Ritma discussion",
    url: "https://www.fountainpennetwork.com/forum/topic/354692-monteverde-ritma/",
    summary:
      "用户讨论将明显重量、长写平衡和个别笔舌根部积墨作为样本观察；它们不能替代官方规格，也不是所有 Ritma 的必然缺陷。",
  }),
  brandSvg: diagram(
    "phase74-monteverde-brand-svg",
    "Monteverde 品牌与型号边界事实图",
    "/images/library/site-original/monteverde/monteverde-brand.svg",
  ),
  ritmaSvg: diagram(
    "phase74-monteverde-ritma-svg",
    "Monteverde Ritma 身份与版本边界事实图",
    "/images/library/site-original/monteverde/monteverde-ritma.svg",
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

function brandPack(): CuratedEntityPack {
  const scopeKey = "phase74-monteverde-brand-scope";
  return {
    key: "phase74-monteverde-brand-v1",
    entityId: PHASE74_MONTEVERDE_BRAND_ID,
    expectedType: "brand",
    expectedSlug: "monteverde",
    canonicalName: "Monteverde USA",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/monteverde-brand-phase74.md",
    storyTitle: "Monteverde：先确认具体型号，再讨论材料与笔尖",
    primarySourceKey: SOURCES.brand.key,
    depthTier: "A",
    aliases: [
      { alias: "Monteverde", language: "en", sourceKey: SOURCES.brand.key },
      { alias: "Monteverde USA", language: "en", sourceKey: SOURCES.brand.key },
      { alias: "万特佳", language: "zh", sourceKey: SOURCES.brand.key },
    ],
    sources: [
      SOURCES.brand,
      SOURCES.collection,
      SOURCES.goulet,
      SOURCES.brandSvg,
    ],
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        productionState: "current",
        editionScope:
          "品牌导航仅反向链接到本轮已完成身份、内容和来源核验的 Ritma；其他系列、颜色、滚珠或圆珠不因共享品牌而自动成为公开钢笔型号。",
      },
    ],
    claims: [
      {
        key: "phase74-monteverde-brand-identity",
        predicate: "brand_identity",
        objectText:
          "Monteverde USA 是 1999 年成立、以 California 为品牌入口的书写工具品牌；品牌来源并未证明旗下每一款钢笔都在美国制造，因此型号页不能以品牌名推断统一产地。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.brand.key,
        locator: SOURCES.brand.summary,
        evidence: [
          {
            key: "phase74-monteverde-brand-identity-evidence",
            sourceKey: SOURCES.brand.key,
            scopeKey,
            locator: SOURCES.brand.summary,
          },
        ],
      },
      {
        key: "phase74-monteverde-brand-navigation",
        predicate: "brand_model_navigation",
        objectText:
          "Ritma 是已核对的具体钢笔系列；阳极氧化金属、Walnut、brushed stainless、颜色和钢尖/钛尖选项只是材料、SKU 或笔尖层面的差异，不能各自伪装成独立的基础钢笔型号。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: SOURCES.collection.key,
        locator: SOURCES.collection.summary,
        evidence: [
          {
            key: "phase74-monteverde-brand-navigation-evidence",
            sourceKey: SOURCES.collection.key,
            scopeKey,
            locator: SOURCES.collection.summary,
          },
          {
            key: "phase74-monteverde-brand-secondary-evidence",
            sourceKey: SOURCES.goulet.key,
            scopeKey,
            locator: SOURCES.goulet.summary,
          },
        ],
      },
    ],
    media: media(
      "phase74-monteverde-brand-media",
      "Monteverde 品牌与型号边界事实图（非产品照片）",
      SOURCES.brandSvg,
    ),
    timeline: [
      {
        key: "phase74-monteverde-founded",
        title: "Monteverde USA 品牌成立",
        eventType: "brand_founded",
        startDate: "1999",
        circa: false,
        description:
          "品牌官方页面将 1999 年作为 Monteverde USA 的成立年份；这不是任意一支具体型号的首发时间。",
        sourceKey: SOURCES.brand.key,
      },
      {
        key: "phase74-monteverde-ritma-current",
        title: "Ritma 系列的当前产品边界复核",
        eventType: "design_milestone",
        startDate: "2026",
        circa: true,
        description:
          "当前 Ritma 页面将磁吸帽、材料分支、JoWo #6 和 C/C 路线分开说明；页面可见时间不倒推该型号的准确首发日。",
        sourceKey: SOURCES.collection.key,
      },
    ],
  };
}

function ritmaPack(): CuratedEntityPack {
  const scopeKey = "phase74-monteverde-ritma-scope";
  return {
    key: "phase74-monteverde-ritma-v1",
    entityId: PHASE74_RITMA_ID,
    expectedType: "pen",
    expectedSlug: PHASE74_RITMA_SLUG,
    canonicalName: "Monteverde Ritma",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: ".planning/content-research/monteverde-ritma-phase74.md",
    storyTitle: "Monteverde Ritma：先选材料和重量，再选笔尖",
    primarySourceKey: SOURCES.collection.key,
    depthTier: "A",
    aliases: [
      {
        alias: "Monteverde Ritma",
        language: "en",
        sourceKey: SOURCES.collection.key,
      },
      {
        alias: "Monteverde Ritma Fountain Pen",
        language: "en",
        sourceKey: SOURCES.green.key,
      },
      { alias: "万特佳 Ritma", language: "zh", sourceKey: SOURCES.collection.key },
    ],
    sources: [
      SOURCES.collection,
      SOURCES.green,
      SOURCES.brushed,
      SOURCES.goulet,
      SOURCES.fpn,
      SOURCES.ritmaSvg,
    ],
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        productionState: "current",
        editionScope:
          "Ritma 基础钢笔系列；阳极氧化铝、Walnut、brushed stainless、年度色、钢尖/钛尖、笔幅和地区库存均是 SKU 或版本边界，不互相借用规格与图片。",
      },
    ],
    claims: [
      {
        key: "phase74-ritma-identity",
        predicate: "model_identity",
        objectText:
          "Monteverde Ritma 是以磁吸笔帽和可吸附尾端为特征的钢笔系列，设计说明引用 1960/70 年代极简风格；它不是仅指 Green Anodized、Walnut、Brushed Stainless Steel、滚珠或圆珠版本。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.collection.key,
        locator: SOURCES.collection.summary,
        evidence: [
          {
            key: "phase74-ritma-identity-evidence",
            sourceKey: SOURCES.collection.key,
            scopeKey,
            locator: SOURCES.collection.summary,
          },
        ],
      },
      {
        key: "phase74-ritma-material-nib-boundary",
        predicate: "version_boundary",
        objectText:
          "常规阳极氧化 Ritma 的铝制笔身、Green SKU 的 151.1 mm/12.7 mm/37.77 g、Walnut 的木质外观分支，以及仅部分款可见的 titanium F/M 不能合并成一套固定规格；基础 JoWo #6 steel nib 与具体尖型都要按完整 SKU 确认。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: SOURCES.green.key,
        locator: SOURCES.green.summary,
        evidence: [
          {
            key: "phase74-ritma-green-evidence",
            sourceKey: SOURCES.green.key,
            scopeKey,
            locator: SOURCES.green.summary,
          },
          {
            key: "phase74-ritma-collection-evidence",
            sourceKey: SOURCES.collection.key,
            scopeKey,
            locator: SOURCES.collection.summary,
          },
          {
            key: "phase74-ritma-walnut-evidence",
            sourceKey: SOURCES.goulet.key,
            scopeKey,
            locator: SOURCES.goulet.summary,
          },
        ],
      },
      {
        key: "phase74-ritma-use-boundary",
        predicate: "use_boundary",
        objectText:
          "Ritma 是 standard international cartridge/converter 的钢笔路线；磁吸帽虽可吸附尾端，实际长写平衡仍受材料、手型和是否后插影响。社区关于明显重量或个别积墨的讨论只代表用户样本，不写成全线缺陷。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: SOURCES.collection.key,
        locator: SOURCES.collection.summary,
        evidence: [
          {
            key: "phase74-ritma-fill-evidence",
            sourceKey: SOURCES.collection.key,
            scopeKey,
            locator: SOURCES.collection.summary,
          },
          {
            key: "phase74-ritma-community-evidence",
            sourceKey: SOURCES.fpn.key,
            scopeKey,
            locator: SOURCES.fpn.summary,
          },
        ],
      },
      {
        key: "phase74-ritma-care",
        predicate: "maintenance_boundary",
        objectText:
          "换墨时以室温清水冲洗墨囊或转换器、笔尖和笔舌并自然干燥；笔帽内若有冷凝残墨先擦净再收纳。没有拆解说明时，不以热水、酒精、强溶剂、尖锐工具或蛮力拆卸笔尖、笔舌、磁吸结构和供墨部件。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: SOURCES.collection.key,
        locator: "official C/C system and product-boundary context; conservative non-disassembly care",
        evidence: [
          {
            key: "phase74-ritma-care-evidence",
            sourceKey: SOURCES.collection.key,
            scopeKey,
            locator:
              "official C/C system and product-boundary context; conservative non-disassembly care",
          },
        ],
      },
    ],
    variants: [
      {
        key: "phase74-ritma-anodized",
        name: "阳极氧化金属款",
        notes:
          "Green Anodized 的 151.1 mm、12.7 mm、37.77 g 仅为该 SKU 的基准；颜色、库存、表面和笔尖选项不能外推。",
        sourceKey: SOURCES.green.key,
        variantKind: "market_sku",
      },
      {
        key: "phase74-ritma-walnut",
        name: "Walnut 木质外观款",
        notes:
          "Walnut 是材料外观分支；不要把它的材料、重量或零售状态套给阳极氧化或 stainless 款。",
        sourceKey: SOURCES.goulet.key,
        variantKind: "material",
      },
      {
        key: "phase74-ritma-titanium-nib",
        name: "部分 SKU 的钛尖选项",
        notes:
          "官方系列页和当前 SKU 仅表明部分款可见 titanium F/M；不把钛尖当全部 Ritma 的标准配置。",
        sourceKey: SOURCES.brushed.key,
        variantKind: "nib",
      },
    ],
    spec: {
      brandEntityId: PHASE74_MONTEVERDE_BRAND_ID,
      values: {
        series_name: "Monteverde Ritma",
        release_year: "当前官方 Ritma 系列可见；准确首发年份待品牌历史档案核实",
        origin_country:
          "Monteverde USA 品牌入口位于 California；Ritma 的具体制造地、批次与销售地区须以当期 SKU 或实物确认",
        nib: "基础为 JoWo #6 不锈钢尖；EF/F/M/B/Stub/Omniflex 与部分 SKU 的 titanium F/M 均须按完整 SKU 确认",
        fill_system:
          "standard international cartridge/converter；仅限 fountain-pen 版本，不把滚珠/圆珠 refill 写入本页",
        material:
          "常规阳极氧化款为铝制笔身；Walnut 为木质外观分支，brushed stainless 等版本另按 SKU 确认",
        dimensions:
          "Green Anodized 官方 SKU：约 151.1 mm 长、12.7 mm 直径；其他材料和版别以各自产品页为准",
        weight:
          "Green Anodized 官方 SKU：约 37.77 g；木质、stainless 或其他版本不可据此视为同一重量",
        status:
          "当代 Ritma 钢笔系列；颜色、材料、钛尖、笔幅、库存与地区供应随完整 SKU 变化",
      },
      evidence: [
        evidence(
          "brand_entity_id",
          "phase74-ritma-brand",
          SOURCES.brand.key,
          scopeKey,
          "official Monteverde USA brand context and maker topology",
        ),
        evidence(
          "series_name",
          "phase74-ritma-series",
          SOURCES.collection.key,
          scopeKey,
          "official Ritma collection title and design boundary",
        ),
        evidence(
          "release_year",
          "phase74-ritma-release",
          SOURCES.collection.key,
          scopeKey,
          "current official collection presence; no unsupported launch-year claim",
        ),
        evidence(
          "origin_country",
          "phase74-ritma-origin",
          SOURCES.brand.key,
          scopeKey,
          "official California brand address without factory inference",
        ),
        evidence(
          "nib",
          "phase74-ritma-nib",
          SOURCES.collection.key,
          scopeKey,
          "official JoWo #6 steel and partial titanium-nib boundary",
        ),
        evidence(
          "fill_system",
          "phase74-ritma-fill",
          SOURCES.collection.key,
          scopeKey,
          "official standard international cartridge/converter statement",
        ),
        evidence(
          "material",
          "phase74-ritma-material",
          SOURCES.collection.key,
          scopeKey,
          "official anodized aluminium and Walnut material split",
        ),
        evidence(
          "dimensions",
          "phase74-ritma-dimensions",
          SOURCES.green.key,
          scopeKey,
          "official Green Anodized SKU dimensions only",
        ),
        evidence(
          "weight",
          "phase74-ritma-weight",
          SOURCES.green.key,
          scopeKey,
          "official Green Anodized SKU weight only",
        ),
        evidence(
          "status",
          "phase74-ritma-status",
          SOURCES.brushed.key,
          scopeKey,
          "current official SKU and option boundary",
        ),
      ],
    },
    media: media(
      "phase74-monteverde-ritma-media",
      "Monteverde Ritma 身份与版本边界事实图（非产品照片）",
      SOURCES.ritmaSvg,
    ),
    timeline: [
      {
        key: "phase74-ritma-current-collection",
        title: "Ritma 当前系列说明",
        eventType: "design_milestone",
        startDate: "2026",
        circa: true,
        description:
          "当前官方系列页以 1960/70 年代极简灵感、磁吸帽、材料与笔尖分支定义 Ritma；可见日期不是准确首发年份。",
        sourceKey: SOURCES.collection.key,
      },
    ],
  };
}

export const phase74MonteverdeRitmaPacks: CuratedEntityPack[] = [
  brandPack(),
  ritmaPack(),
];
