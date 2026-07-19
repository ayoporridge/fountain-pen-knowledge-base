import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE63_JINHAO_BRAND_ID = "Yulxwu7PuQAU";
/** Existing donor: the raw row mixed 159 and X159 and is retained for X159 only. */
export const PHASE63_X159_ID = "mP8BPi8qUHSI";
/** New stable identity for the older metal-bodied 159 family. */
export const PHASE63_159_ID = "s63JINHAO159";
export const PHASE63_MIXED_SLUG = "金豪-jinhao-x159-159";
export const PHASE63_X159_SLUG = "jinhao-x159";
export const PHASE63_159_SLUG = "jinhao-159";

const RETRIEVED = "2026-07-20";

function live(input: {
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
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.url,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
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
    summary: "本站原创 factual SVG，示意图而非产品照片。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false`,
  };
}

const SOURCES = {
  jinhaoCatalog: live({
    key: "phase63-jinhao-collection",
    title: "TTpen Jinhao fountain pen collection",
    url: "https://www.ttpen.com/collections/jinhao",
    registryKey: "ttpen-jinhao-phase63",
    registryName: "TTpen",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary:
      "当代 Jinhao 集合将 X159 单列为 acrylic、size 8 nib 的商品路线，也保留多型号并列目录语境。",
    locator: "Jinhao collection and X159 product-card fields",
  }),
  x159Review: live({
    key: "phase63-jinhao-x159-review",
    title: "Stridewise: Jinhao X159 fountain pen review",
    url: "https://stridewise.com/jinhao-x159-fountain-pen-review/",
    registryKey: "stridewise-phase63-x159",
    registryName: "Stridewise",
    sourceType: "blog",
    tier: "professional_secondary",
    summary:
      "2023 样本把 acrylic X159 与较早金属 159 分开，记录约 146 mm 闭帽、#8 steel nib 与 converter 使用语境。",
    locator: "X159 versus older 159, material, closed-length sample and converter observations",
  }),
  jinhao159Archive: live({
    key: "phase63-jinhao-159-archive",
    title: "Fountain Pen Network Jinhao discussions archive",
    url: "https://www.fountainpennetwork.com/forum/",
    registryKey: "fpn-jinhao-phase63",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "contemporary_archive",
    summary:
      "长期玩家讨论可作为旧金属 159 与后续 X159 被区分、二手状态需逐支检查的旁证；不承担统一尺寸或全批次规格。",
    locator: "dated Jinhao 159 and X159 discussion archive; sample-only observations",
  }),
  brandSvg: diagram(
    "phase63-jinhao-brand-svg",
    "Jinhao identity navigation facts",
    "/images/library/site-original/jinhao/jinhao-brand.svg",
  ),
  jinhao159Svg: diagram(
    "phase63-jinhao-159-svg",
    "Jinhao 159 identity boundary facts",
    "/images/library/site-original/jinhao/jinhao-159.svg",
  ),
  x159Svg: diagram(
    "phase63-jinhao-x159-svg",
    "Jinhao X159 identity boundary facts",
    "/images/library/site-original/jinhao/jinhao-x159.svg",
  ),
};

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

function makePen(input: {
  key: string;
  id: string;
  slug: string;
  name: string;
  title: string;
  summary: string;
  markdownFile: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  svg: CuratedSource;
  aliases: string[];
  release: string;
  nib: string;
  fill: string;
  material: string;
  dimensions: string;
  status: string;
  boundary: string;
}): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  return {
    key: `phase63-${input.key}-v1`,
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
    aliases: input.aliases.map((alias, index) => ({
      alias,
      language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en",
      sourceKey: index === 0 ? input.primary.key : input.secondary.key,
    })),
    sources: [input.primary, input.secondary, input.svg],
    scopes: [{
      key: scopeKey,
      scopeKey,
      productionState: "historical",
      editionScope:
        "型号 canonical；颜色、镀层、尖号、随附 converter 与销售包按批次和具体商品核对",
    }],
    claims: [
      {
        key: `${input.key}-identity`,
        predicate: "model_identity",
        objectText: input.summary,
        factClass: "core",
        confidence: 0.99,
        sourceKey: input.primary.key,
        locator: input.primary.summary,
        evidence: [{
          key: `${input.key}-identity-evidence`,
          sourceKey: input.primary.key,
          scopeKey,
          locator: input.primary.summary,
        }],
      },
      {
        key: `${input.key}-boundary`,
        predicate: "version_boundary",
        objectText: input.boundary,
        factClass: "core",
        confidence: 0.99,
        sourceKey: input.secondary.key,
        locator: input.secondary.summary,
        evidence: [{
          key: `${input.key}-boundary-evidence`,
          sourceKey: input.secondary.key,
          scopeKey,
          locator: input.secondary.summary,
        }],
      },
      {
        key: `${input.key}-care`,
        predicate: "maintenance_boundary",
        objectText:
          "清洗先用室温清水吸排并自然干燥；不以热水、酒精、强溶剂、硬物或蛮力拆解处理树脂、镀层、笔尖和 converter。持续断墨、渗漏或笔尖错位应先记录具体样本并由专业维修判断。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: input.primary.key,
        locator: "conservative care boundary from filling and construction context",
        evidence: [{
          key: `${input.key}-care-evidence`,
          sourceKey: input.primary.key,
          scopeKey,
          locator: "filling/construction context; conservative non-disassembly care",
        }],
      },
    ],
    variants: [],
    spec: {
      brandEntityId: PHASE63_JINHAO_BRAND_ID,
      values: {
        series_name: input.name,
        release_year: input.release,
        origin_country: "中国 Jinhao 产品线；具体制造批次和销售地区按实物/目录核对",
        nib: input.nib,
        fill_system: input.fill,
        material: input.material,
        dimensions: input.dimensions,
        status: input.status,
      },
      evidence: [
        evidence("brand_entity_id", `${input.key}-brand`, input.primary.key, scopeKey, "Jinhao maker identity"),
        evidence("series_name", `${input.key}-series`, input.primary.key, scopeKey, "model name and collection context"),
        evidence("release_year", `${input.key}-release`, input.secondary.key, scopeKey, "dated catalog/review boundary"),
        evidence("origin_country", `${input.key}-origin`, input.primary.key, scopeKey, "Jinhao product line context"),
        evidence("nib", `${input.key}-nib`, input.primary.key, scopeKey, "catalog/review nib boundary"),
        evidence("fill_system", `${input.key}-fill`, input.primary.key, scopeKey, "catalog/review filling boundary"),
        evidence("material", `${input.key}-material`, input.primary.key, scopeKey, "material boundary"),
        evidence("dimensions", `${input.key}-dimensions`, input.secondary.key, scopeKey, "dated sample or no-fixed-dimension boundary"),
        evidence("status", `${input.key}-status`, input.secondary.key, scopeKey, "current/historical market boundary"),
      ],
    },
    media: [{
      key: `${input.key}-primary`,
      title: `${input.name} 事实卡（非产品照片）`,
      sourceKey: input.svg.key,
      localPath: input.svg.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不表现真实比例、颜色、Logo、镀层或具体 SKU。",
      sourceUrl: input.svg.url,
      usageStatus: "primary",
    }],
    timeline: [{
      key: `${input.key}-catalog`,
      title: `${input.name} 的公开型号边界`,
      eventType: "model_released",
      startDate: input.release.match(/\d{4}/)?.[0] ?? "2000",
      circa: true,
      description: input.summary,
      sourceKey: input.primary.key,
    }],
  };
}

const brandScope = "phase63-jinhao-brand-scope";
const brand: CuratedEntityPack = {
  key: "phase63-jinhao-brand-v1",
  entityId: PHASE63_JINHAO_BRAND_ID,
  expectedType: "brand",
  expectedSlug: "jinhao",
  canonicalName: "金豪 Jinhao",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/jinhao-brand.md",
  storyTitle: "Jinhao（金豪）：先分清型号，再谈低价大笔身",
  primarySourceKey: SOURCES.jinhaoCatalog.key,
  depthTier: "A",
  aliases: [
    { alias: "Jinhao", language: "en", sourceKey: SOURCES.jinhaoCatalog.key },
    { alias: "金豪", language: "zh", sourceKey: SOURCES.jinhaoCatalog.key },
  ],
  sources: [SOURCES.jinhaoCatalog, SOURCES.x159Review, SOURCES.brandSvg],
  scopes: [{
    key: brandScope,
    scopeKey: brandScope,
    productionState: "current",
    editionScope: "品牌与型号导航；具体材料、笔尖、尺寸、上墨和生产时期下沉到单独型号页",
  }],
  claims: [
    {
      key: "phase63-jinhao-brand-identity",
      predicate: "brand_identity",
      objectText:
        "Jinhao 是中国市场可见的量产钢笔品牌；品牌页按型号身份、结构与资料状态导航，不把近名型号和零售 SKU 混成单一页面。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: SOURCES.jinhaoCatalog.key,
      locator: SOURCES.jinhaoCatalog.summary,
      evidence: [{ key: "phase63-jinhao-brand-identity-evidence", sourceKey: SOURCES.jinhaoCatalog.key, scopeKey: brandScope, locator: SOURCES.jinhaoCatalog.summary }],
    },
    {
      key: "phase63-jinhao-brand-159-x159-boundary",
      predicate: "model_family_boundary",
      objectText:
        "Jinhao 159 与 X159 是不同身份：旧金属 159 不承接 X159 的 acrylic、#8 steel nib、146 mm 样本或 converter 事实；X159 也不使用 159 的图片和未知规格。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: SOURCES.x159Review.key,
      locator: SOURCES.x159Review.summary,
      evidence: [{ key: "phase63-jinhao-brand-boundary-evidence", sourceKey: SOURCES.x159Review.key, scopeKey: brandScope, locator: SOURCES.x159Review.summary }],
    },
  ],
  variants: [],
  media: [{
    key: "phase63-jinhao-brand-media",
    title: "Jinhao 型号边界事实图（非产品照片）",
    sourceKey: SOURCES.brandSvg.key,
    localPath: SOURCES.brandSvg.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片。",
    sourceUrl: SOURCES.brandSvg.url,
    usageStatus: "primary",
  }],
  timeline: [{
    key: "phase63-jinhao-current-catalog",
    title: "当代 Jinhao 型号目录语境",
    eventType: "design_milestone",
    startDate: "2023",
    circa: true,
    description: "当代目录与独立评测共同显示 159/X159 必须分开处理。",
    sourceKey: SOURCES.x159Review.key,
  }, {
    key: "phase63-jinhao-catalogue-check",
    title: "Jinhao 当代目录复核",
    eventType: "design_milestone",
    startDate: "2026",
    circa: true,
    description: "当代集合页保留多型号并列语境；它不为旧款补造统一规格。",
    sourceKey: SOURCES.jinhaoCatalog.key,
  }],
};

export const phase63JinhaoPacks: CuratedEntityPack[] = [
  brand,
  makePen({
    key: "jinhao-159",
    id: PHASE63_159_ID,
    slug: PHASE63_159_SLUG,
    name: "金豪 Jinhao 159",
    title: "Jinhao 159：金属大笔身，而不是 X159 的旧名字",
    summary:
      "Jinhao 159 是较早的金属大笔身型号；它不是 X159 的异名，不能使用后者的 acrylic、#8 steel nib、146 mm 样本尺寸或图片。",
    markdownFile: ".planning/content-research/jinhao-159.md",
    primary: SOURCES.jinhao159Archive,
    secondary: SOURCES.x159Review,
    svg: SOURCES.jinhao159Svg,
    aliases: ["Jinhao 159", "金豪 159", "Jinhao 159 metal"],
    release: "较早市场型号；具体首发年待可靠目录补证",
    nib: "钢尖；尺寸、线宽、刻字与材料按具体版本核对",
    fill: "cartridge/converter 路线常见；接口与随附耗材按实物",
    material: "金属大笔身路线；镀层、饰件和握位材料随版本",
    dimensions: "无可作为全系固定值的已核对尺寸；不得使用 X159 的 146 mm 样本",
    status: "历史/持续流通库存边界按市场和实物核对",
    boundary:
      "159 与 X159 不可互称。159 页面不载入 X159 的 acrylic、#8 尖、现代 converter 商品说明或实物照片；无法确认的混名库存保持待鉴定。",
  }),
  makePen({
    key: "jinhao-x159",
    id: PHASE63_X159_ID,
    slug: PHASE63_X159_SLUG,
    name: "金豪 Jinhao X159",
    title: "Jinhao X159：当代 acrylic 大笔与 #8 尖的独立路线",
    summary:
      "Jinhao X159 是当代 acrylic 大笔、#8 steel nib、converter 路线的独立型号；2023 独立评测的闭帽约 146 mm 是该样本资料，不是旧金属 159 的规格。",
    markdownFile: ".planning/content-research/jinhao-x159.md",
    primary: SOURCES.jinhaoCatalog,
    secondary: SOURCES.x159Review,
    svg: SOURCES.x159Svg,
    aliases: ["Jinhao X159", "金豪 X159", "Jinhao X-159"],
    release: "当代市场型号；2023 独立评测可作时间锚点",
    nib: "#8 steel nib；EF/F/M 等按市场 SKU/批次",
    fill: "converter filling；接口与随附 converter 按商品核对",
    material: "acrylic/resin 笔身；颜色、金属饰件与纹理按 SKU",
    dimensions: "独立评测样本闭帽约 146 mm；非全批次固定值",
    status: "当代流通型号；颜色、尖号和库存随市场 SKU",
    boundary:
      "X159 是独立型号，不是旧 159 的改名；也不与同为大号笔的 Jinhao 9019 Dadao 合并。旧混合 slug 因同时指向两种身份而不安全，必须 hard 404。",
  }),
];
