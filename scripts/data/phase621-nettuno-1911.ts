import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

const RETRIEVED = "2026-09-07";

export const PHASE621_NETTUNO_BRAND_ID = "phase621-brand-nettuno-1911";
export const PHASE621_NETTUNO_PELAGOS_ID =
  "phase621-nettuno-ne-2-0-pelagos-matte";
export const PHASE621_NETTUNO_BRAND_SLUG = "nettuno-1911";
export const PHASE621_NETTUNO_PELAGOS_SLUG =
  "nettuno-ne-2-0-pelagos-matte";

function web(input: {
  key: string;
  title: string;
  url: string;
  registry: string;
  name: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  publishedAt?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registry,
    registryName: input.name,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.registry,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    author: input.name,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(key: string, localPath: string, title: string): CuratedSource {
  return {
    key,
    registryKey: `fountain-pen-graph-editorial-phase621-${key}`,
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: `fountain-pen-graph-editorial-phase621-${key}`,
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创事实示意图，非产品照片、Logo、颜色校样、纹理复刻或比例图。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

const S = {
  vecchietti: web({
    key: "phase621-nettuno-vecchietti-history",
    title: "New Nettuno",
    url: "https://www.vecchietti.it/en/new-nettuno",
    registry: "nettuno-vecchietti-official-phase621",
    name: "A.C. Vecchietti",
    summary:
      "品牌页记录1911年传单线索、1921 Penna Nettuno Sicurezza商标、1936 Superba、1950年代停产与Vecchietti家族重新启动品牌。",
  }),
  yafaBrand: web({
    key: "phase621-nettuno-yafa-brand",
    title: "Nettuno",
    url: "https://yafabrands.com/pages/nettuno",
    registry: "nettuno-yafa-brand-phase621",
    name: "Yafa Brands",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "Yafa品牌页将Nettuno定位为承接早期意大利钢笔传统的当代产品线，并链接N-E.2.0等系列。",
  }),
  yafaCollection: web({
    key: "phase621-nettuno-yafa-collection",
    title: "Nettuno N-E 2.0",
    url: "https://yafabrands.com/collections/nettuno-n-e-2-0",
    registry: "nettuno-yafa-collection-phase621",
    name: "Yafa Brands",
    sourceType: "retailer",
    tier: "retailer",
    summary:
      "集合页在核实日列出N-E 2.0的Pelagos Matte、Leviatano、Anemone、Thalassa钢笔以及ballpoint和rollerball兄弟产品。",
  }),
  pensit: web({
    key: "phase621-nettuno-pensit-collection",
    title: "Nettuno 1911 Pens - Italian Fountain Pens",
    url: "https://www.pens.it/en/collections/penne-nettuno",
    registry: "nettuno-pensit-phase621",
    name: "Pens.it",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "专业零售集合页把Nettuno 1911与Superba、N.E.2.0并列，并将当代复兴放在Maiora语境中。",
  }),
  forbes: web({
    key: "phase621-nettuno-forbes-maiora-license",
    title: "Delta Pens Are Back, And They’re Hotter Than Ever",
    url: "https://www.forbes.com/sites/nancyolson/2023/07/14/delta-pens-are-back-and-theyre-hotter-than-ever/",
    registry: "forbes-delta-maiora-phase621",
    name: "Forbes",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2023-07-14",
    summary:
      "对Nino Marino的采访称Maiora获得Nettuno 1911商标许可并在其manufactory生产钢笔；该关系不等于两个品牌合并。",
  }),
  inherit: web({
    key: "phase621-nettuno-inherit-pelagos",
    title: "Nettuno 1911 N-E 2.0 Pelagos Matte",
    url: "https://inheritpen.com/?pid=180480641",
    registry: "inherit-pen-nettuno-phase621",
    name: "Inherit Pen",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "独立零售页面给出Pelagos Matte的另一组尺寸重量、钢尖与转换器信息，并把Naples生产关系归因于Maiora。",
  }),
  paperMind: web({
    key: "phase621-nettuno-paper-mind-pelagos",
    title: "Nettuno N-E 2.0 Fountain Pen - Pelagos Matte Black",
    url: "https://thepapermind.com/products/nettuno-n-e-2-0-fountain-pen-pelagos-matte-black",
    registry: "paper-mind-nettuno-phase621",
    name: "The Paper Mind",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "独立零售商将N-E 2.0描述为第二迭代、意大利树脂手工车削、#6 JoWo钢尖与标准国际转换器，并给出2024发行窗口说法。",
  }),
  penChalet: web({
    key: "phase621-nettuno-penchalet-pelagos",
    title: "Nettuno N-E 2.0 Fountain Pen",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/nettuno_n-e_2.0_fountain_pens.html",
    registry: "pen-chalet-nettuno-phase621",
    name: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary:
      "专业零售目录给出N-E 2.0约144.0/157.5/132.1mm、14.5/16.3/10.9mm、28.35g、#6不锈钢尖与标准国际转换器。",
  }),
  yafaPelagos: web({
    key: "phase621-nettuno-yafa-pelagos",
    title: "Nettuno N-E 2.0 Pelagos Matte(Matte Black) Fountain Pen",
    url: "https://yafabrands.com/products/nettuno-n-e-2-0-pelagos-mattematte-black-fountain-pen",
    registry: "nettuno-yafa-pelagos-phase621",
    name: "Yafa Brands",
    sourceType: "retailer",
    // Yafa is the authorized brand/distribution storefront for this exact
    // product page; keep sourceType=retailer while treating the SKU page as
    // primary product evidence rather than as an independent review.
    tier: "primary",
    summary:
      "exact页面显示Pelagos Matte标题、NE78179-EF型号、US$250快照、意大利树脂与gold/palladium/ruthenium版本，以及八种尖号选择。",
  }),
  brandDiagram: diagram(
    "nettuno-brand-map",
    "/images/library/site-original/phase621/nettuno/brand-map.svg",
    "Nettuno 1911 brand history and current scope factual diagram",
  ),
  modelDiagram: diagram(
    "nettuno-pelagos-spec",
    "/images/library/site-original/phase621/nettuno/pelagos-matte.svg",
    "Nettuno N-E 2.0 Pelagos Matte factual diagram",
  ),
};

const brandScope = "phase621-nettuno-brand-scope";
const modelScope = "phase621-nettuno-pelagos-matte-scope";

const brandPack: CuratedEntityPack = {
  key: "phase621-nettuno-1911-brand-v1",
  entityId: PHASE621_NETTUNO_BRAND_ID,
  expectedType: "brand",
  expectedSlug: PHASE621_NETTUNO_BRAND_SLUG,
  canonicalName: "Nettuno 1911",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/nettuno-1911-brand-phase621.md",
  storyTitle: "Nettuno 1911：品牌历史、复兴与型号导航",
  primarySourceKey: S.vecchietti.key,
  depthTier: "A",
  aliases: [
    { alias: "Nettuno", language: "en", sourceKey: S.vecchietti.key },
    { alias: "Nettuno 1911", language: "en", sourceKey: S.vecchietti.key },
    { alias: "Nettuno Pens", language: "en", sourceKey: S.yafaBrand.key },
  ],
  sources: [
    S.vecchietti,
    S.yafaBrand,
    S.yafaCollection,
    S.pensit,
    S.forbes,
    S.brandDiagram,
  ],
  scopes: [
    {
      key: brandScope,
      scopeKey: brandScope,
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope:
        "品牌历史与当代目录导航；具体型号、市场、颜色、电镀和生产关系必须在型号范围内核对。",
    },
  ],
  claims: [
    {
      key: "phase621-nettuno-brand-identity",
      predicate: "brand_identity",
      objectText:
        "Nettuno 1911 是 Umberto Vecchietti 在 Bologna 起步的意大利钢笔品牌；1911 起源线索、1921 商标、1936 Superba、1950 年代停产和家族复兴属于不同历史节点。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.vecchietti.key,
      locator: S.vecchietti.summary,
      evidence: [
        {
          key: "phase621-nettuno-brand-history-evidence",
          sourceKey: S.vecchietti.key,
          scopeKey: brandScope,
          locator: S.vecchietti.summary,
        },
        {
          key: "phase621-nettuno-brand-current-evidence",
          sourceKey: S.yafaBrand.key,
          scopeKey: brandScope,
          locator: S.yafaBrand.summary,
        },
      ],
    },
    {
      key: "phase621-nettuno-brand-maiora-boundary",
      predicate: "licensed_production_boundary",
      objectText:
        "Forbes 与 Pens.it 将现代 Nettuno 与 Maiora 的商标许可或生产体系联系起来；这不是把 Nettuno 1911 与 Maiora 品牌合并的依据。",
      factClass: "core",
      confidence: 0.94,
      sourceKey: S.forbes.key,
      locator: S.forbes.summary,
      evidence: [
        {
          key: "phase621-nettuno-brand-forbes-evidence",
          sourceKey: S.forbes.key,
          scopeKey: brandScope,
          locator: S.forbes.summary,
        },
        {
          key: "phase621-nettuno-brand-pensit-evidence",
          sourceKey: S.pensit.key,
          scopeKey: brandScope,
          locator: S.pensit.summary,
        },
      ],
    },
    {
      key: "phase621-nettuno-brand-navigation",
      predicate: "series_navigation",
      objectText:
        "当代目录至少区分 N-E 2.0、Neos 与 Superba；N-E 2.0 又有 Pelagos Matte、Leviatano、Anemone 和 Thalassa 等颜色与不同书写工具形态。",
      factClass: "core",
      confidence: 0.96,
      sourceKey: S.yafaCollection.key,
      locator: S.yafaCollection.summary,
      evidence: [
        {
          key: "phase621-nettuno-brand-yafa-collection-evidence",
          sourceKey: S.yafaCollection.key,
          scopeKey: brandScope,
          locator: S.yafaCollection.summary,
        },
        {
          key: "phase621-nettuno-brand-pensit-navigation-evidence",
          sourceKey: S.pensit.key,
          scopeKey: brandScope,
          locator: S.pensit.summary,
        },
      ],
    },
  ],
  timeline: [
    {
      key: "phase621-nettuno-1911-origin",
      title: "1911：品牌起源线索",
      eventType: "brand_founded",
      startDate: "1911",
      circa: false,
      description:
        "Vecchietti 页面把带 Bologna 海神喷泉的品牌传单和 Umberto Vecchietti 置于 1911 年。",
      sourceKey: S.vecchietti.key,
    },
    {
      key: "phase621-nettuno-1921-trademark",
      title: "1921：Penna Nettuno Sicurezza 商标",
      eventType: "design_milestone",
      startDate: "1921",
      circa: false,
      description:
        "页面称该年登记商标，并开始记录滴入式与 safety loading 钢笔生产。",
      sourceKey: S.vecchietti.key,
    },
    {
      key: "phase621-nettuno-1936-superba",
      title: "1936：Superba 系列出现",
      eventType: "design_milestone",
      startDate: "1936",
      circa: false,
      description:
        "Superba 采用更收尖的轮廓、多条装饰带和赛璐珞，并延续到 1950 年代。",
      sourceKey: S.vecchietti.key,
    },
    {
      key: "phase621-nettuno-revival-verified",
      title: "当代：Vecchietti 家族重启品牌叙述",
      eventType: "revival",
      startDate: RETRIEVED,
      circa: false,
      description:
        "当前页面称品牌仍由 Vecchietti 家族拥有并重新启动生产；该日期是核实日，不是复兴首发年。",
      sourceKey: S.vecchietti.key,
    },
  ],
  media: [
    {
      key: "phase621-nettuno-brand-primary",
      title: "Nettuno 1911 品牌历史与现代关系事实图（非产品照片）",
      sourceKey: S.brandDiagram.key,
      localPath: S.brandDiagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实图；非产品照片、Logo、颜色校样、纹理复刻或比例图。",
      sourceUrl: S.brandDiagram.url,
      usageStatus: "primary",
    },
  ],
};

const modelValues: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>> = {
  series_name: "Nettuno N-E 2.0",
  release_year:
    "2024（独立零售商称第二迭代；官网未给出可确认的官方首发日）",
  origin_country:
    "意大利品牌产品范围；Yafa 说明笔身为意大利树脂实心棒手工车削",
  nib: "#6 不锈钢尖；EF/F/M/B、Stub 1.1/1.5、Flex EF/F，按订单核对",
  fill_system: "标准国际墨囊／转换器两用，转换器随笔提供",
  material:
    "Pelagos Matte 黑色哑光意大利树脂；本 exact scope 采用 ruthenium trim",
  dimensions:
    "Pen Chalet：合盖144.0 mm、带帽书写157.5 mm、笔身132.1 mm；笔杆14.5 mm、笔帽16.3 mm、握位10.9 mm",
  weight: "Pen Chalet 约28.35 g（1.0 oz）",
  price_range: "Yafa 美国页面核实 US$250；价格与库存随市场和时间变化",
  status: "当前零售目录中的 N-E 2.0 Pelagos Matte exact 页面",
};

const modelPack: CuratedEntityPack = {
  key: "phase621-nettuno-ne20-pelagos-matte-v1",
  entityId: PHASE621_NETTUNO_PELAGOS_ID,
  expectedType: "pen",
  expectedSlug: PHASE621_NETTUNO_PELAGOS_SLUG,
  canonicalName: "Nettuno N-E 2.0 Pelagos Matte",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/nettuno-ne20-pelagos-matte-phase621.md",
  storyTitle: "Nettuno N-E 2.0 Pelagos Matte：规格、版本与购买边界",
  primarySourceKey: S.yafaPelagos.key,
  depthTier: "A",
  aliases: [
    {
      alias: "Nettuno N-E 2.0 Pelagos Matte",
      language: "en",
      sourceKey: S.yafaPelagos.key,
    },
    {
      alias: "Nettuno N-E 2.0 Pelagos Matte (Matte Black)",
      language: "en",
      sourceKey: S.yafaPelagos.key,
    },
    { alias: "Pelagos Matte", language: "en", sourceKey: S.yafaPelagos.key },
    {
      alias: "NE78179-EF",
      language: "en",
      sourceKey: S.yafaPelagos.key,
      market: "US",
    },
  ],
  sources: [
    S.yafaPelagos,
    S.penChalet,
    S.inherit,
    S.paperMind,
    S.forbes,
    S.vecchietti,
    S.pensit,
    S.modelDiagram,
  ],
  scopes: [
    {
      key: modelScope,
      scopeKey: modelScope,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "Pelagos Matte exact product selector; nib choices do not define sibling colours.",
      materialScope:
        "Pelagos Matte black resin with ruthenium trim; GT, palladium and gold versions remain separate.",
      editionScope:
        "N-E 2.0 Pelagos Matte; not Neos, Superba, ballpoint, rollerball or other N-E 2.0 colors.",
    },
  ],
  claims: [
    {
      key: "phase621-nettuno-pelagos-identity",
      predicate: "model_identity",
      objectText:
        "Pelagos Matte 是 Nettuno N-E 2.0 的黑色哑光钢笔 exact scope；Yafa 页面显示 NE78179-EF，并将其他颜色和球珠笔／rollerball 分开列出。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.yafaPelagos.key,
      locator: S.yafaPelagos.summary,
      evidence: [
        {
          key: "phase621-nettuno-pelagos-yafa-identity",
          sourceKey: S.yafaPelagos.key,
          scopeKey: modelScope,
          locator: S.yafaPelagos.summary,
        },
        {
          key: "phase621-nettuno-pelagos-penchalet-identity",
          sourceKey: S.penChalet.key,
          scopeKey: modelScope,
          locator: S.penChalet.summary,
        },
      ],
    },
    {
      key: "phase621-nettuno-pelagos-platform-boundary",
      predicate: "version_boundary",
      objectText:
        "Pelagos Matte 的颜色、哑光表面与 ruthenium trim 不能扩展到 Thalassa、Anemone、Leviatano、GT 或历史 Neos／Superba；普通钢尖、Stub 与 Flex 是选择器选项而非同时存在的固定配置。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.yafaPelagos.key,
      locator: S.yafaPelagos.summary,
      evidence: [
        {
          key: "phase621-nettuno-pelagos-yafa-boundary",
          sourceKey: S.yafaPelagos.key,
          scopeKey: modelScope,
          locator: S.yafaPelagos.summary,
        },
        {
          key: "phase621-nettuno-pelagos-pensit-boundary",
          sourceKey: S.pensit.key,
          scopeKey: modelScope,
          locator: S.pensit.summary,
        },
      ],
    },
    {
      key: "phase621-nettuno-pelagos-production-boundary",
      predicate: "licensed_production_boundary",
      objectText:
        "当代资料把 Nettuno 1911 的商标许可或实际生产与 Maiora 联系起来；该背景不改变产品标题的 Nettuno 品牌身份，也不在没有范围字段时创建第二条 maker。",
      factClass: "core",
      confidence: 0.94,
      sourceKey: S.forbes.key,
      locator: S.forbes.summary,
      evidence: [
        {
          key: "phase621-nettuno-pelagos-forbes-production",
          sourceKey: S.forbes.key,
          scopeKey: modelScope,
          locator: S.forbes.summary,
        },
        {
          key: "phase621-nettuno-pelagos-inherit-production",
          sourceKey: S.inherit.key,
          scopeKey: modelScope,
          locator: S.inherit.summary,
        },
      ],
    },
    {
      key: "phase621-nettuno-pelagos-filling-boundary",
      predicate: "filling_boundary",
      objectText:
        "N-E 2.0 Pelagos Matte 使用标准国际墨囊／转换器两用并附转换器；历史 Nettuno 的按钮、滴入式、安全上墨或活塞机构不能沿用到本 exact SKU。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.penChalet.key,
      locator: S.penChalet.summary,
      evidence: [
        {
          key: "phase621-nettuno-pelagos-penchalet-filling",
          sourceKey: S.penChalet.key,
          scopeKey: modelScope,
          locator: S.penChalet.summary,
        },
        {
          key: "phase621-nettuno-pelagos-yafa-filling",
          sourceKey: S.yafaPelagos.key,
          scopeKey: modelScope,
          locator: S.yafaPelagos.summary,
        },
      ],
    },
  ],
  variants: [
    {
      key: "phase621-nettuno-pelagos-exact-us-sku",
      name: "Pelagos Matte / Matte Black — NE78179-EF listing",
      notes:
        "Yafa 页面显示的美国市场 exact listing；同页面可选择其他尖号，产品代码和库存需按订单核对。",
      sourceKey: S.yafaPelagos.key,
      variantKind: "market_sku",
      productCode: "NE78179-EF",
      market: "US",
    },
  ],
  spec: {
    brandEntityId: PHASE621_NETTUNO_BRAND_ID,
    values: modelValues,
    evidence: [
      evidence(
        "brand_entity_id",
        "phase621-nettuno-pelagos-spec-brand",
        S.yafaPelagos.key,
        modelScope,
        "exact页面标题与集合将产品标为 Nettuno N-E 2.0 Pelagos Matte。",
      ),
      evidence(
        "series_name",
        "phase621-nettuno-pelagos-spec-series",
        S.yafaPelagos.key,
        modelScope,
        "Nettuno N-E 2.0 exact product title and collection scope.",
      ),
      evidence(
        "release_year",
        "phase621-nettuno-pelagos-spec-release",
        S.paperMind.key,
        modelScope,
        "独立零售商将2.0描述为2024年发布的第二迭代；非官方首发声明。",
      ),
      evidence(
        "origin_country",
        "phase621-nettuno-pelagos-spec-origin",
        S.yafaPelagos.key,
        modelScope,
        "hand-turned from solid bar in Italian resin; whole-pen assembly scope not expanded.",
      ),
      evidence(
        "nib",
        "phase621-nettuno-pelagos-spec-nib",
        S.yafaPelagos.key,
        modelScope,
        "Yafa selector: EF/F/M/B, Stub 1.1, Stub 1.5, Flex EF and Flex F.",
      ),
      evidence(
        "fill_system",
        "phase621-nettuno-pelagos-spec-fill",
        S.penChalet.key,
        modelScope,
        "Standard International cartridge/converter; converter included.",
      ),
      evidence(
        "material",
        "phase621-nettuno-pelagos-spec-material",
        S.yafaPelagos.key,
        modelScope,
        "Pelagos Matte matte-black Italian resin and plating-by-version description.",
      ),
      evidence(
        "dimensions",
        "phase621-nettuno-pelagos-spec-dimensions-penchalet",
        S.penChalet.key,
        modelScope,
        "Pen Chalet: 144.0 mm capped, 157.5 mm posted, 132.1 mm body; 14.5/16.3/10.9 mm diameters.",
      ),
      evidence(
        "dimensions",
        "phase621-nettuno-pelagos-spec-dimensions-inherit-rejected",
        S.inherit.key,
        modelScope,
        "Inherit Pen reports approximately 142/159/133 mm and 14/17 mm; retained as a rejected cross-market measurement, not averaged.",
        false,
      ),
      evidence(
        "weight",
        "phase621-nettuno-pelagos-spec-weight",
        S.penChalet.key,
        modelScope,
        "Pen Chalet lists 1.0 oz, approximately 28.35 g.",
      ),
      evidence(
        "price_range",
        "phase621-nettuno-pelagos-spec-price",
        S.yafaPelagos.key,
        modelScope,
        "Yafa US listing shows US$250 on the retrieval date; not a permanent global price.",
      ),
      evidence(
        "status",
        "phase621-nettuno-pelagos-spec-status",
        S.yafaPelagos.key,
        modelScope,
        "Current exact product page and retailer collection observed on retrieval date.",
      ),
    ],
  },
  conflicts: [
    {
      key: "phase621-nettuno-pelagos-dimension-conflict",
      fieldKey: "dimensions",
      scopeKey: modelScope,
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "采用 Pen Chalet 的当前专业目录测量作为主规格；Inherit Pen 的另一组读数保留为测量方法、饰件或市场差异的拒绝证据，不平均成第三组数字。",
      members: [
        {
          citationKey: "phase621-nettuno-pelagos-spec-dimensions-penchalet",
          assertedValue: "Pen Chalet 144.0/157.5/132.1 mm and 14.5/16.3/10.9 mm",
        },
        {
          citationKey: "phase621-nettuno-pelagos-spec-dimensions-inherit-rejected",
          assertedValue: "Inherit Pen approximately 142/159/133 mm and 14/17 mm",
        },
      ],
    },
  ],
  timeline: [
    {
      key: "phase621-nettuno-pelagos-2024-window",
      title: "N-E 2.0：独立零售资料的 2024 第二迭代窗口",
      eventType: "model_released",
      startDate: "2024",
      circa: true,
      description:
        "The Paper Mind 将 N-E 2.0 描述为 2024 年发布的第二迭代；因不是品牌官方发行公告，页面保留为约略窗口。",
      sourceKey: S.paperMind.key,
    },
    {
      key: "phase621-nettuno-pelagos-current-verified",
      title: "Pelagos Matte exact SKU 核实",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description:
        "型号代码、颜色、尖号选择、材料与零售规格在核实日分别对照，日期不是产品首发日。",
      sourceKey: S.yafaPelagos.key,
    },
  ],
  media: [
    {
      key: "phase621-nettuno-pelagos-primary",
      title: "N-E 2.0 Pelagos Matte 规格事实图（非产品照片）",
      sourceKey: S.modelDiagram.key,
      localPath: S.modelDiagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创事实图；非产品照片、Logo、颜色校样、纹理复刻或比例图。",
      sourceUrl: S.modelDiagram.url,
      usageStatus: "primary",
    },
  ],
};

export const phase621NettunoGroups = [
  { brand: brandPack, pens: [modelPack] },
] as const;

export const phase621NettunoPacks: CuratedEntityPack[] = [
  brandPack,
  modelPack,
];
