import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";
import { phase38PelikanM200P457Packs } from "./phase38-pelikan-m200-p457";

export const PHASE248_PELIKAN_ID = "VXUULuCOLOB1";
export const PHASE248_M200_ID = "uLrDh27Q5Xne";
export const PHASE248_TWIST_ID = "wnzMt5lugvtc";
export const PHASE248_TWIST_OLD_SLUG = "pelikan-twist-p457";
export const PHASE248_TWIST_SLUG = "pelikan-twist";
const RETRIEVED = "2026-07-26";

function official(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: input.title,
    url: input.url,
    homepageUrl: "https://www.pelikan.com/",
    author: "Pelikan",
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function secondary(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: "blog",
    tier: "professional_secondary",
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

function localSvg(key: string, title: string, url: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
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

const CARE: CuratedSource = phase38PelikanM200P457Packs
  .flatMap((pack) => pack.sources)
  .find((source) => source.key === "phase35-pelikan-official-care") ??
  (() => { throw new Error("Phase 248 cannot resolve Pelikan official care source."); })();

const SOURCES = {
  m200Catalog: official({
    key: "phase248-pelikan-m200-catalog",
    title: "Pelikan Fine Writing Instruments current catalogue",
    url: "https://www.pelikan.com/images/assets/catalogs/fine-writing-instruments-current-catalog-en.pdf",
    summary: "Pelikan 当前 Fine Writing 目录给出 Classic M200 的活塞填充、尺寸、容量、镀金钢尖与 EF/F/M/B 尖幅。",
    locator: "Classic Series 200 pages: piston filling, 14.7 cm, 12.3 mm, 14 g, approximately 1.3 ml, gold-plated stainless nib",
  }),
  m200Archive: secondary({
    key: "phase248-pelikan-m200-collectibles",
    title: "Pelikan Collectibles: M200 & M205",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Classic-Series/M200-Basis/index.html",
    registryKey: "pelikan-collectibles",
    registryName: "Pelikan Collectibles",
    summary: "专业型号档案记录 M200 1985 起点、1997 Old Style／改款边界、钢尖与 M250 金尖差异，并给出旧式尺寸和容量参考。",
    locator: "M200 Old Style 1985–1997; post-1997 redesign; steel nib versus M250 gold nib; measurement tables",
  }),
  m200Perch: secondary({
    key: "phase248-pelikan-m200-perch",
    title: "The Pelikan's Perch: M200",
    url: "https://thepelikansperch.com/database/fountain-pens/m2xx/m200/",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    summary: "专业 Pelikan 资料补充 M200 两代帽顶、帽环、旋钮环、镀金钢尖和旧式约 1.20 ml 容量参考。",
    locator: "trim differences, steel nib and 1.20 ml ink capacity",
  }),
  twistOfficial: official({
    key: "phase248-pelikan-twist-official",
    title: "Pelikan Twist fountain pens",
    url: "https://www.pelikan.com/de/produkte/schreiben/184-fuellhalter/207-twist.html",
    summary: "Pelikan 官方 Twist 页面说明扭转三角人体工学外形、软握位、左右手使用以及 Twist 家族产品边界。",
    locator: "Twist ergonomic triangular shape, soft grip, left/right handed use and fountain pen family listing",
  }),
  twistStructure: official({
    key: "phase248-pelikan-twist-structure",
    title: "Pelikan Twist Structure",
    url: "https://www.pelikan.com/de/produkte/schreiben/184-fuellhalter/4574-twist-structure.html",
    summary: "官方 Twist Structure 页面用于确认多边形表面属于 Twist 家族版本，而不是另一个基础型号。",
    locator: "Twist Structure product family and faceted surface description",
  }),
  twistCatalog2021: official({
    key: "phase248-pelikan-twist-catalog-2021",
    title: "Pelikan stationery 2021 catalogue",
    url: "https://www.pelikan.com/images/assets/catalogs/pelikan-stationery-2021-catalog-en.pdf",
    summary: "官方 2021 目录区分 Fp Twist P457 与 Ink roller Twist R457，确认 P457 是钢笔平台代码。",
    locator: "printed Twist listings: Fp Twist P457 versus Ink roller Twist R457",
  }),
  twistCatalog2022: official({
    key: "phase248-pelikan-twist-catalog-2022",
    title: "Pelikan PBS Catalogue 2022",
    url: "https://www.pelikan.com/images/assets/catalogs/pelikan-stationery-2022-catalog-en.pdf",
    summary: "官方 2022 目录列出 P457 颜色、M 尖、墨囊套装和具体货号。",
    locator: "printed p.41: P457 Deep Blue, Fiery Red, Neo Mint, Sweet Lilac, black and M + 2 TP blister item numbers",
  }),
  twistArchive: secondary({
    key: "phase248-pelikan-twist-collectibles",
    title: "Pelikan Collectibles: School & Youth Pens",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Cartridge-filler/School-youngsters-fp/index.html",
    registryKey: "pelikan-collectibles",
    registryName: "Pelikan Collectibles",
    summary: "专业档案列出 P457 2019 Color Edition 的颜色、钢尖与无饰件配置，用于版本范围而非全部年份外推。",
    locator: "P457 2019 Color Edition color entries, steel nib and trim fields",
  }),
  m200Svg: localSvg(
    "phase248-pelikan-m200-svg",
    "M200 年代与活塞边界事实卡",
    "/images/library/site-original/pelikan-m200-p457/m200.svg",
    "本站原创 factual SVG，区分 M200 Old Style、1997 后改款、钢尖与活塞，不表现真实比例或商标。",
  ),
  twistSvg: localSvg(
    "phase248-pelikan-twist-svg",
    "Pelikan Twist 握位与 P457 代码事实卡",
    "/images/library/site-original/pelikan-m200-p457/p457.svg",
    "本站原创 factual SVG，强调 Twist 扭转三角握位、墨囊、钢尖和颜色版本，不表现真实产品照片。",
  ),
};

function evidence(key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { key, sourceKey, scopeKey, locator };
}

function makePack(input: {
  key: string;
  entityId: string;
  slug: string;
  name: string;
  markdownFile: string;
  storyTitle: string;
  summary: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  otherSources: CuratedSource[];
  svg: CuratedSource;
  release: string;
  nib: string;
  fill: string;
  material: string;
  dimensions: string;
  status: string;
  boundary: string;
  variants: Array<{
    key: string;
    name: string;
    releaseYear?: string;
    notes: string;
    sourceKey: string;
    productCode?: string;
  }>;
}): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  return {
    key: `phase248-${input.key}-v1`,
    entityId: input.entityId,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.storyTitle,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: [
      { alias: input.name, language: "zh", sourceKey: input.primary.key },
      { alias: input.key === "m200" ? "Pelikan M200" : "Pelikan Twist", language: "en", sourceKey: input.primary.key },
      ...(input.key === "twist"
        ? [{ alias: "Pelikan Twist P457", language: "en", sourceKey: input.primary.key }, { alias: "P457", language: "en", sourceKey: SOURCES.twistCatalog2021.key }]
        : []),
    ],
    sources: [input.primary, input.secondary, ...input.otherSources, input.svg, CARE]
      .filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index),
    scopes: [{ key: scopeKey, scopeKey, productionState: input.status.includes("历史") ? "historical" : "current", editionScope: "型号家族；颜色、年代和包装按具体 variant 或货号记录" }],
    claims: [
      {
        key: `${input.key}-identity`,
        predicate: "model_identity",
        objectText: input.summary,
        factClass: "core",
        confidence: 0.99,
        sourceKey: input.primary.key,
        locator: "official model identity",
        evidence: [evidence(`${input.key}-identity-evidence`, input.primary.key, scopeKey, "official model identity and product listing")],
      },
      {
        key: `${input.key}-boundary`,
        predicate: "version_boundary",
        objectText: input.boundary,
        factClass: "core",
        confidence: 0.99,
        sourceKey: input.secondary.key,
        locator: "professional model-family boundary",
        evidence: [
          evidence(`${input.key}-boundary-evidence`, input.secondary.key, scopeKey, "model-specific archive boundary"),
          evidence(`${input.key}-official-boundary`, input.primary.key, scopeKey, "official product family distinction"),
        ],
      },
    ],
    variants: input.variants.map((variant) => ({ ...variant, variantKind: "edition_group" as const })),
    spec: {
      brandEntityId: PHASE248_PELIKAN_ID,
      values: {
        series_name: input.name,
        release_year: input.release,
        origin_country: "德国品牌；制造地按具体目录或包装核对",
        nib: input.nib,
        fill_system: input.fill,
        material: input.material,
        dimensions: input.dimensions,
        status: input.status,
      },
      evidence: [
        { key: `${input.key}-brand`, fieldKey: "brand_entity_id", sourceKey: input.primary.key, scopeKey, locator: "Pelikan maker identity" },
        { key: `${input.key}-series`, fieldKey: "series_name", sourceKey: input.primary.key, scopeKey, locator: "official family and model name" },
        { key: `${input.key}-release`, fieldKey: "release_year", sourceKey: input.secondary.key, scopeKey, locator: "model chronology or current family boundary" },
        { key: `${input.key}-origin`, fieldKey: "origin_country", sourceKey: input.primary.key, scopeKey, locator: "brand/catalog context; no factory inference", qualifies: true },
        { key: `${input.key}-nib`, fieldKey: "nib", sourceKey: input.primary.key, scopeKey, locator: "official nib or product-family field" },
        { key: `${input.key}-fill`, fieldKey: "fill_system", sourceKey: input.primary.key, scopeKey, locator: "official filling system field" },
        { key: `${input.key}-material`, fieldKey: "material", sourceKey: input.primary.key, scopeKey, locator: "official material and construction field" },
        { key: `${input.key}-dimensions`, fieldKey: "dimensions", sourceKey: input.primary.key, scopeKey, locator: "official dimensions or explicit family boundary" },
        { key: `${input.key}-status`, fieldKey: "status", sourceKey: input.secondary.key, scopeKey, locator: "model production status and family boundary" },
      ],
    },
    media: [{
      key: `${input.key}-factual-primary`,
      title: `${input.name} 资料边界事实卡（非产品照片）`,
      sourceKey: input.svg.key,
      localPath: input.svg.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制 Pelikan 官方摄影，不表现真实比例、色泽或商标。",
      sourceUrl: input.svg.url,
      usageStatus: "primary",
    }],
    timeline: [{
      key: `${input.key}-release`,
      title: `${input.name} 进入 Pelikan 产品路线`,
      eventType: "model_released",
      startDate: input.release,
      circa: true,
      description: input.summary,
      sourceKey: input.primary.key,
    }],
  };
}

const brand = structuredClone(phase38PelikanM200P457Packs[0]);
if (!brand || brand.entityId !== PHASE248_PELIKAN_ID) throw new Error("Phase 248 Pelikan brand pack missing.");
brand.key = "phase248-pelikan-brand-v1";

export const phase248PelikanM200TwistPacks: CuratedEntityPack[] = [
  brand,
  makePack({
    key: "m200",
    entityId: PHASE248_M200_ID,
    slug: "pelikan-m200",
    name: "百利金 Pelikan M200",
    markdownFile: ".planning/content-research/pelikan-m200-phase248-publishable-content-2026-07-26.md",
    storyTitle: "Pelikan M200：Classic 200 的活塞路线",
    summary: "Pelikan M200 是 Classic 200 系列的树脂活塞钢笔，1985 年推出，1997 年经历 Old Style 到后期结构的改款；它使用镀金不锈钢尖和透明墨窗，不能与金尖 M250 或墨囊 Twist P457 混写。",
    primary: SOURCES.m200Catalog,
    secondary: SOURCES.m200Archive,
    otherSources: [SOURCES.m200Perch],
    svg: SOURCES.m200Svg,
    release: "1985",
    nib: "镀金不锈钢尖；常见 EF/F/M/B，具体年代与替换尖需核对",
    fill: "Pelikan 活塞填充，现行目录约 1.3 ml；旧式档案约 1.20 ml",
    material: "树脂笔杆、透明墨窗与金色饰件，依年代和版本变化",
    dimensions: "现行目录约闭帽 14.7 cm、直径 12.3 mm、14 g；旧式档案约 127 mm",
    status: "Classic 200 现行与历史版本并存；1985–1997 Old Style，1997 年后改款",
    boundary: "M200 是 Classic 200 活塞路线，不能与金尖 M250 或墨囊 P200/P205、Twist P457 混写。",
    variants: [
      { key: "m200-old", name: "M200 Old Style", releaseYear: "1985–1997", notes: "derby 帽顶、常见两道帽环、无活塞旋钮装饰环；徽标与低量颜色按档案核对。", sourceKey: SOURCES.m200Archive.key },
      { key: "m200-post97", name: "M200 post-1997", releaseYear: "1997–", notes: "crown 帽顶、单帽环与旋钮环是常见改款线索，不能单凭徽标定年。", sourceKey: SOURCES.m200Archive.key },
    ],
  }),
  makePack({
    key: "twist",
    entityId: PHASE248_TWIST_ID,
    slug: PHASE248_TWIST_SLUG,
    name: "百利金 Pelikan Twist",
    markdownFile: ".planning/content-research/pelikan-twist-phase248-publishable-content-2026-07-26.md",
    storyTitle: "Pelikan Twist：P457 平台的扭转握位墨囊路线",
    summary: "Pelikan Twist 是面向学生、通勤与日常书写的扭转三角握位墨囊钢笔家族；P457 是官方目录反复使用的平台／产品代码，颜色、包装以及 eco、structure、Calligraphy 等版本属于 Twist 家族边界，不是第二个基础型号。",
    primary: SOURCES.twistOfficial,
    secondary: SOURCES.twistArchive,
    otherSources: [SOURCES.twistStructure, SOURCES.twistCatalog2021, SOURCES.twistCatalog2022],
    svg: SOURCES.twistSvg,
    release: "2019",
    nib: "钢尖，常见 M；Calligraphy 版本另有 1.5 mm 书法尖",
    fill: "Pelikan 标准墨囊",
    material: "注塑树脂笔身与软握位；颜色、表面和再生塑料比例依版本变化",
    dimensions: "官方资料重点描述扭转三角握位；具体尺寸按版本和市场包装核对",
    status: "现行 Twist 路线，颜色、eco、structure 与书法版本持续更新",
    boundary: "P457 是 Twist 家族的钢笔平台／产品代码；R457 是 roller，颜色、包装、eco、structure、Calligraphy 属于版本边界，不应拆成第二个基础实体。",
    variants: [
      { key: "twist-2019-color", name: "P457 2019 Color Edition", releaseYear: "2019", notes: "White Pearl、Pure Gold、Deep Blue、Fiery Red、Neon Mint、Sweet Lilac 等颜色，钢尖、无饰件。", sourceKey: SOURCES.twistArchive.key },
      { key: "twist-2022-blister", name: "P457 2022 catalog blister", releaseYear: "2022", notes: "官方目录列 Deep Blue、Fiery Red、Neo Mint、Sweet Lilac、black 及 M + 2 TP 套装货号。", sourceKey: SOURCES.twistCatalog2022.key, productCode: "814744 / 814805 / 814867 / 814911 / 946814" },
      { key: "twist-family-structure", name: "Twist Structure", notes: "多边形表面版本，保留 Twist 的握位家族身份。", sourceKey: SOURCES.twistStructure.key },
      { key: "twist-family-calligraphy", name: "Twist Calligraphy", notes: "书法尖版本，具体市场尖幅和包装以官方货号核对。", sourceKey: SOURCES.twistOfficial.key },
    ],
  }),
];
