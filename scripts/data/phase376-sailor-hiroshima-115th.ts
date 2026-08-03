import type {
  CuratedClaim,
  CuratedConflict,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase33Sailor2026CurrentPacks } from "./phase33-sailor-2026-current";

export const PHASE376_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE376_YOSEGI_ID = "phase376-sailor-hiroshima-yosegi-101115";
export const PHASE376_YOSEGI_SLUG = "sailor-hiroshima-yosegi-zaiku";
export const PHASE376_MOMIJI_ID = "phase376-sailor-hiroshima-momiji-101116";
export const PHASE376_MOMIJI_SLUG = "sailor-hiroshima-momiji";

const RETRIEVED = "2026-08-03";
const PRODUCT_YOSEGI_JP = "https://sailor.co.jp/product/10-1115/";
const PRODUCT_YOSEGI_EN = "https://en.sailor.co.jp/product/10-1115/";
const PRODUCT_MOMIJI_JP = "https://sailor.co.jp/product/10-1116/";
const PRODUCT_MOMIJI_EN = "https://en.sailor.co.jp/product/10-1116/";
const NEWS = "https://sailor.co.jp/news/20260512/";
const TOPIC = "https://sailor.co.jp/topics/115th/";
const PDF =
  "https://sailor.co.jp/wp-content/uploads/2026/05/260512_%E3%82%BB%E3%83%BC%E3%83%A9%E3%83%BC%E4%B8%87%E5%B9%B4%E7%AD%86_%E5%89%B5%E6%A5%AD115%E5%91%A8%E5%B9%B4%E8%A8%98%E5%BF%B5%E4%B8%87%E5%B9%B4%E7%AD%86-3.pdf";
const REFILL = "https://sailor.co.jp/topics/fountain-pen-refill-ink/";
const CARE = "https://sailor.co.jp/topics/fountain-pen-maintenance/";
const LOCAL_REPORT = "https://www.higashihiroshima-digital.com/report/news-sailor-2605/";

function source(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  registryKey: string;
  registryName: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  homepageUrl?: string;
  publishedAt?: string;
  author?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const siteOriginal = sourceType === "user_submission";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? (sourceType === "retailer" ? "professional_secondary" : "primary"),
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://sailor.co.jp/" : "/"),
    itemType: siteOriginal ? "image" : "web_page",
    author: input.author ?? (sourceType === "official" ? "セーラー万年筆株式会社" : input.registryName),
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    allowedUse: siteOriginal ? "store_full" : "summary_only",
    license: siteOriginal ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: siteOriginal
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function claim(
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.93,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies };
}

const brand = structuredClone(
  phase33Sailor2026CurrentPacks.find(
    (pack) => pack.entityId === PHASE376_SAILOR_BRAND_ID && pack.expectedType === "brand",
  ),
);
if (!brand) throw new Error("Phase 376 Sailor brand pack missing.");
brand.key = "phase376-sailor-brand-v1";

type SourceBundle = {
  officialJp: CuratedSource;
  officialEn: CuratedSource;
  topic: CuratedSource;
  news: CuratedSource;
  pdf: CuratedSource;
  localReport: CuratedSource;
  refill: CuratedSource;
  care: CuratedSource;
  diagram: CuratedSource;
};

function makeSources(input: {
  prefix: string;
  officialJp: { title: string; url: string; summary: string; locator: string };
  officialEn: { title: string; url: string; summary: string; locator: string };
  diagram: { path: string; title: string; summary: string };
}): SourceBundle {
  const p = input.prefix;
  return {
    officialJp: source({
      key: `${p}-official-jp`,
      ...input.officialJp,
      registryKey: `sailor-official-jp-${p}`,
      registryName: "セーラー万年筆株式会社",
    }),
    officialEn: source({
      key: `${p}-official-en`,
      ...input.officialEn,
      registryKey: `sailor-official-en-${p}`,
      registryName: "The Sailor Pen Co., Ltd.",
    }),
    topic: source({
      key: `${p}-topic`,
      title: "セーラー万年筆創業115周年 HIROSHIMA 专题",
      url: TOPIC,
      summary: "Sailor 官方专题记录广岛材料、115 周年项目协作、木材加工流程、盖环刻字、序列号和 21K 笔尖背景。",
      locator: "115th project, material and process sections",
      registryKey: `sailor-official-topic-${p}`,
      registryName: "セーラー万年筆株式会社",
    }),
    news: source({
      key: `${p}-news`,
      title: "HIROSHIMA 两款 115 周年万年笔 2026-08-06 限量发售",
      url: NEWS,
      summary: "Sailor 官方新闻稿确认两款 HIROSHIMA 纪念笔的 2026-08-06 上市、国内外授权渠道、广岛协作和木材主题。",
      locator: "release announcement, date, market and project overview",
      registryKey: `sailor-official-news-${p}`,
      registryName: "セーラー万年筆株式会社",
      tier: "contemporary_archive",
      publishedAt: "2026-05-12",
    }),
    pdf: source({
      key: `${p}-pdf`,
      title: "セーラー万年筆創業115周年記念万年筆 官方规格 PDF",
      url: PDF,
      summary: "Sailor 官方新闻资料以表格列出 10-1115/10-1116 的价格、限量、MF、21K 大型双彩尖、木材、尺寸、重量和包装。",
      locator: "product specification table for 10-1115 and 10-1116",
      registryKey: `sailor-official-pdf-${p}`,
      registryName: "セーラー万年筆株式会社",
      tier: "contemporary_archive",
      publishedAt: "2026-05-12",
    }),
    localReport: source({
      key: `${p}-local-report`,
      title: "「全广岛」共同开发 115 周年万年笔 — 东广岛数字报",
      url: LOCAL_REPORT,
      summary: "东广岛当地报道交叉核对东广岛市与 Sailor 的共同开发、当地木材和合作企业背景；不替代型号规格。",
      locator: "local project background, partner companies and 2026-08-06 launch",
      registryKey: `higashihiroshima-digital-${p}`,
      registryName: "東広島デジタル",
      sourceType: "blog",
      tier: "professional_secondary",
      homepageUrl: "https://www.higashihiroshima-digital.com/",
      publishedAt: "2026-05-23",
      author: "東広島デジタル編集部",
    }),
    refill: source({
      key: `${p}-refill`,
      title: "万年筆のインク補充方法 — Sailor 官方",
      url: REFILL,
      summary: "Sailor 官方说明墨囊、转换器安装和吸墨步骤，用于本型号的 C/C 维护边界。",
      locator: "cartridge and converter instructions",
      registryKey: `sailor-official-refill-${p}`,
      registryName: "セーラー万年筆株式会社",
    }),
    care: source({
      key: `${p}-care`,
      title: "万年筆のお手入れ方法 — Sailor 官方",
      url: CARE,
      summary: "Sailor 官方说明清水冲洗、保存和避免强力清洁的方法；木质件的额外边界来自材料保守原则。",
      locator: "cleaning and storage instructions",
      registryKey: `sailor-official-care-${p}`,
      registryName: "セーラー万年筆株式会社",
    }),
    diagram: source({
      key: `${p}-svg`,
      title: input.diagram.title,
      url: input.diagram.path,
      summary: input.diagram.summary,
      locator: "site-original factual SVG metadata",
      registryKey: `fountain-pen-graph-editorial-${p}`,
      registryName: "Fountain Pen Graph editorial studio",
      sourceType: "user_submission",
    }),
  };
}

const YOSEGI_SOURCES = makeSources({
  prefix: "phase376-yosegi",
  officialJp: {
    title: "創業115周年記念万年筆 HIROSHIMA 寄木細工 — 10-1115",
    url: PRODUCT_YOSEGI_JP,
    summary: "日本官网确认 10-1115 的 2026-08-06 发售、¥330,000、限量 115、MF 21K 大型双彩尖、三木寄木油仕上、PMMA 大先、φ18.5×134 mm 和 34.0 g。",
    locator: "title, launch date, price, limited quantity, code, material, nib, size, weight and package",
  },
  officialEn: {
    title: "HIROSHIMA Yosegi Zaiku 115th Anniversary Fountain Pen — 10-1115",
    url: PRODUCT_YOSEGI_EN,
    summary: "Sailor 英文页交叉确认 10-1115-328 (MF)、21K bicolor gold with rhodium、C/C、maple/gingko/sawtooth oak parquetry、尺寸、重量和限量 115。",
    locator: "English title, item code, nib, material, filling, dimensions, weight and limited edition",
  },
  diagram: {
    path: "/images/library/site-original/phase376/sailor/hiroshima-yosegi-101115.svg",
    title: "Sailor HIROSHIMA Yosegi Zaiku 10-1115 factual identity card",
    summary: "本站原创 factual SVG 表达 10-1115 的三木寄木、21K MF、C/C、34.0 g 和 115 支限量边界，不是产品照片、Logo、比例图或颜色校样。",
  },
});

const MOMIJI_SOURCES = makeSources({
  prefix: "phase376-momiji",
  officialJp: {
    title: "創業115周年記念万年筆 HIROSHIMA モミジ — 10-1116",
    url: PRODUCT_MOMIJI_JP,
    summary: "日本官网确认 10-1116 的 2026-08-06 发售、¥220,000、限量 1,150、MF 21K 大型双彩尖、枫木油仕上、PMMA 大先、φ18.5×134 mm 和 34.5 g。",
    locator: "title, launch date, price, limited quantity, code, Japanese material, nib, size, weight and package",
  },
  officialEn: {
    title: "HIROSHIMA Momiji 115th Anniversary Fountain Pen — 10-1116",
    url: PRODUCT_MOMIJI_EN,
    summary: "Sailor 英文页确认 Momiji 名称、10-1116-328 (MF)、21K bicolor gold with rhodium、C/C、尺寸和限量；Material 与重量栏存在沿用寄木页的泛化文本。",
    locator: "English title, item code, nib, filling, availability and page-level material/weight discrepancy",
  },
  diagram: {
    path: "/images/library/site-original/phase376/sailor/hiroshima-momiji-101116.svg",
    title: "Sailor HIROSHIMA Momiji 10-1116 factual identity card",
    summary: "本站原创 factual SVG 表达 10-1116 的广岛枫木油仕上、21K MF、C/C、34.5 g 和 1,150 支限量边界，不是产品照片、Logo、比例图或颜色校样。",
  },
});

function modelPack(input: {
  entityId: string;
  slug: string;
  canonicalName: string;
  storyTitle: string;
  markdownFile: string;
  scopeKey: string;
  source: SourceBundle;
  seriesName: string;
  productCode: string;
  englishProductCode: string;
  material: string;
  dimensions: string;
  weight: string;
  price: string;
  limited: string;
  launchDescription: string;
  identityDescription: string;
  siblingDescription: string;
  selectionDescription: string;
  bodyMedia: string;
  conflict?: CuratedConflict[];
}): CuratedEntityPack {
  const S = input.source;
  const scopeKey = input.scopeKey;
  const sources = Object.values(S) as CuratedSource[];
  const isMomiji = input.productCode === "10-1116";
  const specEvidence: CuratedSpecEvidence[] = [
    evidence(`${scopeKey}-brand`, "brand_entity_id", S.officialJp.key, scopeKey, "official Sailor product page"),
    evidence(`${scopeKey}-series`, "series_name", S.officialJp.key, scopeKey, "official title and 115th anniversary product code"),
    evidence(`${scopeKey}-release`, "release_year", S.news.key, scopeKey, "official release announcement"),
    evidence(`${scopeKey}-origin`, "origin_country", S.officialEn.key, scopeKey, "official Sailor product context"),
    evidence(`${scopeKey}-nib`, "nib", S.officialJp.key, scopeKey, "Japanese nib, nib finish and MF product code"),
    evidence(`${scopeKey}-fill`, "fill_system", S.officialJp.key, scopeKey, "Japanese converter/cartridge and package fields"),
    evidence(`${scopeKey}-material`, "material", S.officialJp.key, scopeKey, isMomiji ? "Japanese 本体仕様: モミジ／オイル仕上げ" : "Japanese 本体仕様: 寄木細工（モミジ、イチョウ、アベマキ）／オイル仕上げ"),
    evidence(`${scopeKey}-dimensions`, "dimensions", S.officialJp.key, scopeKey, "Japanese size field"),
    evidence(`${scopeKey}-weight`, "weight", S.officialJp.key, scopeKey, "Japanese weight field"),
    evidence(`${scopeKey}-price`, "price_range", S.officialJp.key, scopeKey, "Japanese price and limited quantity"),
    evidence(`${scopeKey}-status`, "status", S.news.key, scopeKey, "official future release announcement"),
  ];
  if (isMomiji) {
    specEvidence.push(
      evidence(`${scopeKey}-material-en`, "material", S.officialEn.key, scopeKey, "English Material block repeats the Yosegi Zaiku wording used on 10-1115", false),
      evidence(`${scopeKey}-weight-en`, "weight", S.officialEn.key, scopeKey, "English page shows 34g while Japanese page and official PDF show 34.5g", false),
    );
  }
  const claims = [
    claim(scopeKey, `${scopeKey}-identity`, "model_identity", input.identityDescription, S.officialJp.key, "official product title, code and package fields"),
    claim(scopeKey, `${scopeKey}-project`, "anniversary_project", "这是 Sailor 创业 115 周年 HIROSHIMA 项目的具体型号；广岛合作、附属包装和当地材料属于项目背景，不把项目背景替代为生产地字段。", S.news.key, "official anniversary project announcement"),
    claim(scopeKey, `${scopeKey}-local-project`, "local_project_context", "东广岛当地报道将本项目描述为东广岛市与 Sailor 共同开发，并提到当地木材、含浸、寄木和包装等企业协作；这只用于交叉核对项目背景，不替代产品页规格。", S.localReport.key, "local report on Higashihiroshima collaboration"),
    claim(scopeKey, `${scopeKey}-material`, "material", input.material, S.officialJp.key, "Japanese material and finish fields"),
    claim(scopeKey, `${scopeKey}-english-boundary`, "source_boundary", isMomiji ? "英文 10-1116 页面 Material 与 Weight 栏出现沿用寄木页的泛化文本；本页按日本产品页和官方 PDF 的枫木油仕上、34.5 g 处理，并保留冲突记录。" : "英文页的 maple／gingko／sawtooth oak 描述与日本页的三木寄木相互印证；材料不跨到 HIROSHIMA Momiji。", S.officialEn.key, "English product page cross-language comparison", "editorial"),
    claim(scopeKey, `${scopeKey}-nib`, "nib", "采用 21 金大型 MF 笔尖，双彩／铑饰面；MF 是官方公布的单一尖幅，不能从其他 Sailor 21K 型号扩展出 EF/F/M/B。", S.officialJp.key, "Japanese nib, finish and item-code fields"),
    claim(scopeKey, `${scopeKey}-filling`, "filling_system", "采用 Sailor 墨囊／转换器两用式，官方包装列有内置转换器和附带墨囊；不是活塞或真空系统。", S.officialJp.key, "Japanese type and package fields"),
    claim(scopeKey, `${scopeKey}-size`, "physical_specification", `官方规格为 ${input.dimensions}，空笔重量 ${input.weight}。英文页面的 ${isMomiji ? "34 g" : "34 g"} 不覆盖日本页的精确读取。`, S.officialJp.key, "Japanese size and weight fields"),
    claim(scopeKey, `${scopeKey}-limited`, "edition_limit", input.limited, S.officialJp.key, "Japanese limited edition and product code"),
    claim(scopeKey, `${scopeKey}-launch`, "release_history", input.launchDescription, S.news.key, "official 2026-05-12 announcement"),
    claim(scopeKey, `${scopeKey}-price`, "market_status", `日本官网价格为 ${input.price}；这只是 2026-08-03 读取到的日本官方基线，不推导海外税费、库存或二手价格。`, S.officialJp.key, "Japanese price field"),
    claim(scopeKey, `${scopeKey}-sibling`, "sibling_boundary", input.siblingDescription, S.pdf.key, "official two-model specification comparison"),
    claim(scopeKey, `${scopeKey}-care`, "maintenance_guidance", "换色或长期不用时排空墨囊／转换器，用室温清水吸排并自然晾干；木制盖、杆、尾栓不浸水，不使用酒精、强溶剂、研磨布或未经确认的补油剂。", S.care.key, "official cleaning guidance plus conservative oil-finish care", "editorial"),
    claim(scopeKey, `${scopeKey}-selection`, "selection_guidance", input.selectionDescription, S.officialJp.key, "product code, material, weight, limited quantity and package boundary", "editorial"),
    claim(scopeKey, `${scopeKey}-media`, "media_identity_boundary", input.bodyMedia, S.diagram.key, "site-original SVG metadata", "editorial"),
  ];
  return {
    key: `${input.entityId}-v1`,
    entityId: input.entityId,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.canonicalName,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.storyTitle,
    primarySourceKey: S.officialJp.key,
    depthTier: "A",
    aliases: [
      { alias: input.productCode, language: "en", sourceKey: S.officialJp.key },
      { alias: input.englishProductCode, language: "en", sourceKey: S.officialEn.key },
      { alias: input.canonicalName.replace(/^写乐 Sailor /, ""), language: "en", sourceKey: S.officialEn.key },
      { alias: input.canonicalName, language: "zh", sourceKey: S.officialJp.key },
    ],
    sources,
    scopes: [
      {
        key: scopeKey,
        scopeKey,
        market: "Sailor 115th anniversary official product and authorized market announcement",
        validFrom: "2026-08-06",
        productionState: "current",
        nibScope: "21K large MF bicolor/rhodium; single announced nib width",
        materialScope: input.material,
        editionScope: `${input.productCode}; announced future limited release`,
      },
      {
        key: `${scopeKey}-announcement`,
        scopeKey: `${scopeKey}-announcement`,
        validFrom: "2026-05-12",
        productionState: "historical",
        editionScope: "official announcement snapshot; not proof of current stock",
      },
      {
        key: `${scopeKey}-media-boundary`,
        scopeKey: `${scopeKey}-media-boundary`,
        productionState: "current",
        editionScope: "site-original factual SVG; no product photo or colour proof",
      },
    ],
    claims,
    variants: [
      {
        key: `${scopeKey}-mf`,
        name: "中细 MF（官方单一尖幅）",
        notes: `日本产品代码 ${input.productCode}-320；英文页跨市场代码 ${input.englishProductCode}，两者均指向同一 MF 产品，不建立第二个型号。`,
        sourceKey: S.officialJp.key,
        variantKind: "market_sku",
        productCode: `${input.productCode}-320`,
        market: "日本／海外页面交叉核对",
      },
    ],
    spec: {
      brandEntityId: PHASE376_SAILOR_BRAND_ID,
      values: {
        series_name: input.seriesName,
        release_year: "2026-08-06 公告上市（读取日 2026-08-03，未来时态）",
        origin_country: "日本 Sailor；广岛材料与协作项目，具体工厂批次不外推",
        nib: "21金大型 MF，双彩／铑饰面",
        fill_system: "墨囊／转换器两用式（转换器内置）",
        material: input.material,
        dimensions: input.dimensions,
        weight: input.weight,
        price_range: `${input.price}；限量 ${input.limited}`,
        status: "已公告、计划 2026-08-06 国内及海外授权渠道限量发售；库存需实时核对",
      },
      evidence: specEvidence,
    },
    media: [
      {
        key: `${scopeKey}-primary-media`,
        title: `${input.canonicalName} 事实卡（非产品照片）`,
        sourceKey: S.diagram.key,
        localPath: S.diagram.url,
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样。",
        sourceUrl: S.diagram.url,
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: `${scopeKey}-announcement`,
        title: `${input.canonicalName} 官方公布并计划限量发售`,
        eventType: "model_released",
        startDate: "2026-08-06",
        circa: false,
        description: input.launchDescription,
        sourceKey: S.news.key,
      },
    ],
    conflicts: input.conflict,
  };
}

const yosegi = modelPack({
  entityId: PHASE376_YOSEGI_ID,
  slug: PHASE376_YOSEGI_SLUG,
  canonicalName: "写乐 Sailor 115 周年 HIROSHIMA 寄木细工（10-1115）",
  storyTitle: "写乐 Sailor HIROSHIMA 寄木细工 10-1115：把广岛三种木材收进 115 支限量笔",
  markdownFile: ".planning/content-research/sailor-hiroshima-yosegi-101115-phase376.md",
  scopeKey: "phase376-sailor-hiroshima-yosegi-101115",
  source: YOSEGI_SOURCES,
  seriesName: "Sailor 115th Anniversary HIROSHIMA Yosegi Zaiku（10-1115）",
  productCode: "10-1115",
  englishProductCode: "10-1115-328",
  material: "盖顶、笔盖、笔杆、尾栓为广岛枫木／银杏／阿部槲的寄木细工，油仕上；大先 PMMA 树脂；金属件镀金",
  dimensions: "φ18.5×134 mm（含笔夹）",
  weight: "34.0 g",
  price: "¥330,000（本体 ¥300,000）",
  limited: "115 支",
  launchDescription: "Sailor 官方新闻稿于 2026-05-12 公布 10-1115 将于 2026-08-06 在日本及海外授权经销商限量发售；读取日 2026-08-03，仍保持计划上市时态。",
  identityDescription: "10-1115 是 Sailor 创业 115 周年 HIROSHIMA 寄木细工的具体产品代码；其 115 支限量、三木寄木、MF 21K 大型尖和 ¥330,000 不能覆盖 10-1116。",
  siblingDescription: "10-1115 使用枫／银杏／阿部槲三木寄木、限量 115 支、34.0 g、¥330,000；并列 10-1116 使用枫木整件笔身、限量 1,150 支、34.5 g、¥220,000。",
  selectionDescription: "选购应核对 10-1115-320、MF、21K 大型双彩／铑尖、三木寄木油仕上、34.0 g、115 支、专用纸箱与序列卡；“HIROSHIMA 木笔”简称不足以证明此型号。",
  bodyMedia: "主图是本站原创三木寄木身份 SVG，不复制 Sailor 产品照片或 Logo，也不证明真实木纹、比例、颜色、批次或尖的实物状态。",
});

const momiji = modelPack({
  entityId: PHASE376_MOMIJI_ID,
  slug: PHASE376_MOMIJI_SLUG,
  canonicalName: "写乐 Sailor 115 周年 HIROSHIMA モミジ（10-1116）",
  storyTitle: "写乐 Sailor HIROSHIMA モミジ 10-1116：广岛县木与 21K MF 的限量组合",
  markdownFile: ".planning/content-research/sailor-hiroshima-momiji-101116-phase376.md",
  scopeKey: "phase376-sailor-hiroshima-momiji-101116",
  source: MOMIJI_SOURCES,
  seriesName: "Sailor 115th Anniversary HIROSHIMA Momiji（10-1116）",
  productCode: "10-1116",
  englishProductCode: "10-1116-328",
  material: "盖顶、笔盖、笔杆、尾栓为广岛枫木／油仕上；大先 PMMA 树脂；金属件镀金",
  dimensions: "φ18.5×134 mm（含笔夹）",
  weight: "34.5 g",
  price: "¥220,000（本体 ¥200,000）",
  limited: "1,150 支",
  launchDescription: "Sailor 官方新闻稿于 2026-05-12 公布 10-1116 将于 2026-08-06 在日本及海外授权经销商限量发售；读取日 2026-08-03，仍保持计划上市时态。",
  identityDescription: "10-1116 是 Sailor 创业 115 周年 HIROSHIMA モミジ的具体产品代码；其枫木油仕上、1,150 支限量、34.5 g 和 ¥220,000 不能覆盖寄木细工 10-1115。",
  siblingDescription: "10-1116 使用枫木整件笔身、限量 1,150 支、34.5 g、¥220,000；并列 10-1115 使用枫／银杏／阿部槲寄木、限量 115 支、34.0 g、¥330,000。",
  selectionDescription: "选购应核对 10-1116-320、MF、21K 大型双彩／铑尖、枫木油仕上、34.5 g、1,150 支、专用纸箱与序列卡；英文页泛化寄木文字或 34 g 不能覆盖日本资料。",
  bodyMedia: "主图是本站原创枫木身份 SVG，不复制 Sailor 产品照片或 Logo，也不证明真实木纹、比例、颜色、批次或尖的实物状态。",
  conflict: [
    {
      key: "phase376-momiji-material-language-conflict",
      fieldKey: "material",
      scopeKey: "phase376-sailor-hiroshima-momiji-101116",
      conflictKind: "field",
      status: "resolved",
      resolutionNote: "10-1116 的日本产品页与官方 PDF 明确写作枫木／油仕上；英文页 Material 栏沿用了 10-1115 的寄木文字，保留为被拒绝的跨语言页面冲突，不写入当前规格。",
      members: [
        { citationKey: "phase376-sailor-hiroshima-momiji-101116-material", assertedValue: "日本页：モミジ／オイル仕上げ" },
        { citationKey: "phase376-sailor-hiroshima-momiji-101116-material-en", assertedValue: "英文页：Maple/Gingko/Sawtooth Oak Yosegi Zaiku" },
      ],
    },
    {
      key: "phase376-momiji-weight-language-conflict",
      fieldKey: "weight",
      scopeKey: "phase376-sailor-hiroshima-momiji-101116",
      conflictKind: "field",
      status: "resolved",
      resolutionNote: "10-1116 的日本页与官方 PDF 给出 34.5 g；英文页显示 34 g，按地区页面的四舍五入／沿用字段处理，不覆盖日本精确值。",
      members: [
        { citationKey: "phase376-sailor-hiroshima-momiji-101116-weight", assertedValue: "日本页：34.5 g" },
        { citationKey: "phase376-sailor-hiroshima-momiji-101116-weight-en", assertedValue: "英文页：34 g" },
      ],
    },
  ],
});

export const phase376SailorHiroshima115thPacks: CuratedEntityPack[] = [brand, yosegi, momiji];
