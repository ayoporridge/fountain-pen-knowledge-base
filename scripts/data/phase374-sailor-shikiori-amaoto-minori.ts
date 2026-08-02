import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedTimelineEvent,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase33Sailor2026CurrentPacks } from "./phase33-sailor-2026-current";

export const PHASE374_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE374_AMAOTO_ID = "phase374-sailor-shikiori-amaoto-113059";
export const PHASE374_AMAOTO_SLUG = "sailor-shikiori-amaoto";
export const PHASE374_MINORI_ID = "phase374-sailor-shikiori-minori-101050";
export const PHASE374_MINORI_SLUG = "sailor-shikiori-minori";

const RETRIEVED = "2026-08-03";

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
  author?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
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
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author: input.author ?? (sourceType === "official" ? "セーラー万年筆株式会社" : input.registryName),
    retrievedAt: RETRIEVED,
    allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only",
    license: sourceType === "user_submission" ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator:
      sourceType === "user_submission"
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
    confidence: factClass === "core" ? 0.97 : 0.93,
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
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const brand = structuredClone(
  phase33Sailor2026CurrentPacks.find(
    (pack) => pack.entityId === PHASE374_SAILOR_BRAND_ID && pack.expectedType === "brand",
  ),
);
if (!brand) throw new Error("Phase 374 Sailor brand pack missing.");
brand.key = "phase374-sailor-brand-v1";

type SourceBundle = Record<string, CuratedSource>;

const AMAOTO_SCOPE = "phase374-sailor-shikiori-amaoto-113059";
const AMAOTO = {
  officialEn: source({
    key: "phase374-amaoto-official-en",
    title: "SHIKIORI The Sound of Rain Fountain Pen — 11-3059",
    url: "https://en.sailor.co.jp/product/11-3059/",
    summary: "Sailor 英文官网确认雨音系列、四个 11-3059-30x SKU、21K 金双色 MF 尖、C/C、PMMA／AS、φ17×124 mm 和 16.8 g。",
    locator: "series description, item codes, nib, filling, material, size and weight",
    registryKey: "sailor-official-en-phase374-amaoto",
    registryName: "The Sailor Pen Co., Ltd.",
  }),
  officialJp: source({
    key: "phase374-amaoto-official-jp",
    title: "SHIKIORI―四季織― 雨音 万年筆 — 11-3059",
    url: "https://sailor.co.jp/product/11-3059/",
    summary: "Sailor 日本官网确认当前 ¥66,000、春雨／翠雨／霧雨／凍雨四个 MF 代码、21 金、C/C、PMMA／AS、Gold IP、尺寸、重量和 PG-03W。",
    locator: "current price, Japanese item codes, nib, filling, material, plating, size, weight and package",
    registryKey: "sailor-official-jp-phase374-amaoto",
    registryName: "セーラー万年筆株式会社",
  }),
  collection: source({
    key: "phase374-amaoto-collection",
    title: "雨音 | Collections — SHIKIORI Official Website",
    url: "https://shikiori.sailor.co.jp/collections/amaoto/",
    summary: "SHIKIORI 官方系列页说明雨音把草木四季与雨景相连，并把春雨、翠雨、霧雨、凍雨列为 21K 钢笔产品；墨水另行列出。",
    locator: "collection story, seasonal motifs and four fountain-pen products",
    registryKey: "sailor-shikiori-official-phase374-amaoto",
    registryName: "SHIKIORI official website",
    homepageUrl: "https://shikiori.sailor.co.jp/",
  }),
  topic: source({
    key: "phase374-amaoto-topic",
    title: "『SHIKIORI―四季織― 雨音 万年筆』的介绍 — Sailor",
    url: "https://sailor.co.jp/topics/shikiori_amaoto/",
    summary: "Sailor 专题把雨音定位为 SHIKIORI 首次采用 21K 笔尖的最上位模型，并说明四季雨景与哑光／闪粉部件的设计边界。",
    locator: "21K first-in-series description and design story",
    registryKey: "sailor-official-topic-phase374-amaoto",
    registryName: "セーラー万年筆株式会社",
  }),
  press: source({
    key: "phase374-amaoto-press",
    title: "雨音钢笔 2020 年 11 月 15 日全国上市 — Sailor 新闻",
    url: "https://sailor.co.jp/news/20201111/",
    summary: "Sailor 官方新闻稿给出 11-3059 雨音钢笔 2020 年 11 月 15 日日本全国上市日，用于时间线而不是海外库存推断。",
    locator: "release date, product code and nationwide Japanese launch",
    registryKey: "sailor-official-news-phase374-amaoto",
    registryName: "セーラー万年筆株式会社",
    tier: "contemporary_archive",
  }),
  refill: source({
    key: "phase374-amaoto-refill",
    title: "万年筆のインク補充方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-refill-ink/",
    summary: "官方补墨页说明 Sailor 墨囊／转换器安装、吸排与换色排空步骤。",
    locator: "cartridge and converter filling instructions",
    registryKey: "sailor-official-care-phase374-amaoto",
    registryName: "セーラー万年筆株式会社",
  }),
  care: source({
    key: "phase374-amaoto-care",
    title: "万年筆のお手入れ方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-maintenance/",
    summary: "官方维护页用于清水冲洗、避免整笔浸没和长期保存的边界。",
    locator: "cleaning, storage and maintenance instructions",
    registryKey: "sailor-official-care-phase374-amaoto",
    registryName: "セーラー万年筆株式会社",
  }),
  retailer: source({
    key: "phase374-amaoto-retailer",
    title: "Sailor SHIKIORI 雨音 11-3059 — Nagasawa Stationery Center",
    url: "https://www.nagasawa-shop.jp/shopdetail/000000003030/",
    summary: "专业文具店以 11-3059 列出春雨、翠雨、霧雨、凍雨四个 MF 颜色，并将其标为 21K；规格主张仍以 Sailor 官网为准。",
    locator: "retailer family listing, four colour names and 11-3059 code",
    registryKey: "nagasawa-stationery-phase374-amaoto",
    registryName: "Nagasawa Stationery Center",
    sourceType: "retailer",
    tier: "professional_secondary",
    homepageUrl: "https://www.nagasawa-shop.jp/",
    author: "Nagasawa Stationery Center",
  }),
  diagram: source({
    key: "phase374-amaoto-svg",
    title: "Sailor SHIKIORI 雨音 11-3059 factual identity card",
    url: "/images/library/site-original/phase374/sailor/shikiori-amaoto-113059.svg",
    summary: "本站原创 factual SVG，表达四个 21K MF SKU 和 PMMA／AS 边界，不是产品照片、Logo、比例图或颜色校样。",
    locator: "site-original factual SVG metadata",
    registryKey: "fountain-pen-graph-editorial-phase374-amaoto",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
  }),
} as const;

const MINORI_SCOPE = "phase374-sailor-shikiori-minori-101050";
const MINORI = {
  officialEn: source({
    key: "phase374-minori-official-en",
    title: "SHIKIORI 5th Anniversary Minori Fountain Pen — 10-1050",
    url: "https://en.sailor.co.jp/product/10-1050/",
    summary: "Sailor 英文官网确认 10-1050-368 MF、14K 金、C/C、PMMA、17×135 mm、约 16.6 g 和专用礼盒。",
    locator: "product description, item code, nib, filling, material, size, weight and package",
    registryKey: "sailor-official-en-phase374-minori",
    registryName: "The Sailor Pen Co., Ltd.",
  }),
  officialZh: source({
    key: "phase374-minori-official-zh",
    title: "SHIKIORI ―四季织― 5周年纪念 Minori 穣 钢笔 — Sailor 中文官网",
    url: "https://cn.sailor.co.jp/product/10-1050/",
    summary: "Sailor 中文官网确认数量限定、计划 2022 年 9 月发售、10-1050-368 MF、14K 黄金、PMMA 树脂和墨囊／转换器式。",
    locator: "Chinese product page limited-release notice and core specifications",
    registryKey: "sailor-official-zh-phase374-minori",
    registryName: "Sailor Pen Chinese official website",
    homepageUrl: "https://cn.sailor.co.jp/",
  }),
  collection: source({
    key: "phase374-minori-collection",
    title: "5周年記念 穣 | Collections — SHIKIORI Official Website",
    url: "https://shikiori.sailor.co.jp/collections/minori/",
    summary: "SHIKIORI 官方系列页把穣定位为五周年数量限定，说明水田四季主题、14K 中细、20 ml 瓶装墨水、转换器和 3,000 套。",
    locator: "limited set composition, quantity and rice-paddy seasonal story",
    registryKey: "sailor-shikiori-official-phase374-minori",
    registryName: "SHIKIORI official website",
    homepageUrl: "https://shikiori.sailor.co.jp/",
  }),
  topic: source({
    key: "phase374-minori-topic",
    title: "SHIKIORI 五周年纪念穣专题 — Sailor",
    url: "https://sailor.co.jp/topics/shikiori-5th/",
    summary: "Sailor 官方专题说明 SHIKIORI 2017 成系列、2022 年五周年、穣的丰收主题与水色轴内细小绿色闪粉的开发故事。",
    locator: "series history, fifth-anniversary context and development story",
    registryKey: "sailor-official-topic-phase374-minori",
    registryName: "セーラー万年筆株式会社",
  }),
  press: source({
    key: "phase374-minori-press",
    title: "SHIKIORI 五周年纪念穣万年笔／圆珠笔 — Sailor 新闻",
    url: "https://sailor.co.jp/news/page/18/",
    summary: "Sailor 新闻索引确认 2022 年 9 月 10 日起数量限定发售，用于日期边界而不是当前库存判断。",
    locator: "2022-08-31 release listing and 2022-09-10 launch date",
    registryKey: "sailor-official-news-phase374-minori",
    registryName: "セーラー万年筆株式会社",
    tier: "contemporary_archive",
  }),
  release: source({
    key: "phase374-minori-release-pdf",
    title: "220910 四季織 5 周年纪念穣 FP/BP 发布资料 — Sailor PDF",
    url: "https://sailor.co.jp/wp-content/uploads/2022/08/220910%E5%9B%9B%E5%AD%A3%E7%B9%945%E5%91%A8%E5%B9%B4%E8%A8%98%E5%BF%B5_%E7%A9%A3_FP_BP.pdf",
    summary: "Sailor 官方发布资料列出限量 3,000 套、¥25,300、14K MF、PMMA、Gold IP、φ17×135 mm、16.5 g 与 20 ml 墨水／转换器套装组成。",
    locator: "product specification and set-content section",
    registryKey: "sailor-official-release-pdf-phase374-minori",
    registryName: "セーラー万年筆株式会社",
    tier: "contemporary_archive",
  }),
  refill: source({
    key: "phase374-minori-refill",
    title: "万年筆のインク補充方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-refill-ink/",
    summary: "官方补墨页说明 Sailor 墨囊／转换器安装、吸排与换色排空步骤。",
    locator: "cartridge and converter filling instructions",
    registryKey: "sailor-official-care-phase374-minori",
    registryName: "セーラー万年筆株式会社",
  }),
  care: source({
    key: "phase374-minori-care",
    title: "万年筆のお手入れ方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-maintenance/",
    summary: "官方维护页用于清水冲洗、避免整笔浸没和长期保存的边界。",
    locator: "cleaning, storage and maintenance instructions",
    registryKey: "sailor-official-care-phase374-minori",
    registryName: "セーラー万年筆株式会社",
  }),
  retailer: source({
    key: "phase374-minori-retailer",
    title: "Sailor SHIKIORI Minori — JP Select",
    url: "https://jp-select.store/products/minori",
    summary: "专业零售商以 Minori 名称和 SHIKIORI 五周年主题交叉列出该限定钢笔；型号、规格与限定数量仍以 Sailor 官方资料为准。",
    locator: "retailer Minori identity and product listing",
    registryKey: "jp-select-phase374-minori",
    registryName: "JP Select",
    sourceType: "retailer",
    tier: "professional_secondary",
    homepageUrl: "https://jp-select.store/",
    author: "JP Select",
  }),
  diagram: source({
    key: "phase374-minori-svg",
    title: "Sailor SHIKIORI 五周年穣 10-1050-368 factual identity card",
    url: "/images/library/site-original/phase374/sailor/shikiori-minori-101050-368.svg",
    summary: "本站原创 factual SVG，表达一个 14K MF 限定套装及 20 ml 墨水／转换器组成，不是产品照片、Logo、比例图或颜色校样。",
    locator: "site-original factual SVG metadata",
    registryKey: "fountain-pen-graph-editorial-phase374-minori",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
  }),
} as const;

function pack(input: {
  entityId: string;
  slug: string;
  canonicalName: string;
  storyTitle: string;
  markdownFile: string;
  scopeKey: string;
  source: SourceBundle;
  seriesName: string;
  release: string;
  validFrom: string;
  nib: string;
  fill: string;
  material: string;
  dimensions: string;
  weight: string;
  price: string;
  status: string;
  aliases: CuratedEntityPack["aliases"];
  claims: CuratedClaim[];
  variants: CuratedEntityPack["variants"];
  timeline: CuratedTimelineEvent[];
}): CuratedEntityPack {
  const S = input.source;
  const sourceList = Object.values(S) as CuratedSource[];
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
    primarySourceKey: S.officialJp?.key ?? S.officialZh?.key ?? S.officialEn.key,
    depthTier: "A",
    aliases: input.aliases,
    sources: sourceList,
    scopes: [
      {
        key: input.scopeKey,
        scopeKey: input.scopeKey,
        market: "Sailor official product and SHIKIORI pages",
        validFrom: input.validFrom,
        productionState: input.status.includes("结束") ? "historical" : "current",
        nibScope: input.nib,
        materialScope: input.material,
        editionScope: input.seriesName,
      },
      {
        key: `${input.scopeKey}-release-boundary`,
        scopeKey: `${input.scopeKey}-release-boundary`,
        validFrom: input.validFrom,
        productionState: "historical",
        editionScope: input.release,
      },
      {
        key: `${input.scopeKey}-media-boundary`,
        scopeKey: `${input.scopeKey}-media-boundary`,
        productionState: "current",
        editionScope: "site-original factual SVG; no product photo or colour proof",
      },
    ],
    claims: input.claims,
    variants: input.variants,
    spec: {
      brandEntityId: PHASE374_SAILOR_BRAND_ID,
      values: {
        series_name: input.seriesName,
        release_year: input.release,
        origin_country: "日本品牌；不外推具体工厂",
        nib: input.nib,
        fill_system: input.fill,
        material: input.material,
        dimensions: input.dimensions,
        weight: input.weight,
        price_range: input.price,
        status: input.status,
      },
      evidence: [
        evidence(`${input.scopeKey}-brand`, "brand_entity_id", S.officialJp?.key ?? S.officialZh?.key ?? S.officialEn.key, input.scopeKey, "official Sailor product page"),
        evidence(`${input.scopeKey}-series`, "series_name", S.officialEn.key, input.scopeKey, "official product title and model code"),
        evidence(`${input.scopeKey}-release`, "release_year", S.press.key, input.scopeKey, "official launch record"),
        evidence(`${input.scopeKey}-origin`, "origin_country", S.officialEn.key, input.scopeKey, "Sailor official product context"),
        evidence(`${input.scopeKey}-nib`, "nib", S.officialEn.key, input.scopeKey, "official nib and item-code fields"),
        evidence(`${input.scopeKey}-fill`, "fill_system", S.refill.key, input.scopeKey, "official cartridge and converter instructions"),
        evidence(`${input.scopeKey}-material`, "material", S.officialEn.key, input.scopeKey, "official material and plating fields"),
        evidence(`${input.scopeKey}-dimensions`, "dimensions", S.officialEn.key, input.scopeKey, "official size field"),
        evidence(`${input.scopeKey}-weight`, "weight", S.officialEn.key, input.scopeKey, "official weight field"),
        evidence(`${input.scopeKey}-price`, "price_range", S.officialJp?.key ?? S.release.key, input.scopeKey, "official Japanese price or historical release price"),
        evidence(`${input.scopeKey}-status`, "status", S.officialJp?.key ?? S.officialZh?.key ?? S.officialEn.key, input.scopeKey, "official product status"),
      ],
    },
    media: [
      {
        key: `${input.scopeKey}-primary-media`,
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
    timeline: input.timeline,
  };
}

const amaoto = pack({
  entityId: PHASE374_AMAOTO_ID,
  slug: PHASE374_AMAOTO_SLUG,
  canonicalName: "写乐 Sailor SHIKIORI 雨音（11-3059）",
  storyTitle: "写乐 Sailor SHIKIORI 雨音 11-3059：把四季的雨写在 21K 中细尖上",
  markdownFile: ".planning/content-research/sailor-shikiori-amaoto-113059-phase374.md",
  scopeKey: AMAOTO_SCOPE,
  source: AMAOTO,
  seriesName: "Sailor SHIKIORI 雨音（The Sound of Rain，11-3059）",
  release: "2020-11-15 日本全国上市",
  validFrom: "2020-11-15",
  nib: "21K 金、中型 MF（中细）尖，双色表面处理",
  fill: "墨囊／转换器两用式（cartridge/converter）",
  material: "盖栓、尾栓为 PMMA 树脂；盖、杆、大先为哑光 AS 树脂；金属件 Gold IP",
  dimensions: "φ17 × 124 mm（含笔夹）",
  weight: "16.8 g",
  price: "日本官方当前售价 ¥66,000（本体 ¥60,000）；按读取市场与日期",
  status: "日本官网当前公开；不同市场库存和规格以授权渠道核对",
  aliases: [
    { alias: "Sailor SHIKIORI The Sound of Rain", language: "en", sourceKey: AMAOTO.officialEn.key },
    { alias: "Sailor Shikiori Amaoto", language: "en", sourceKey: AMAOTO.officialEn.key },
    { alias: "11-3059", language: "en", sourceKey: AMAOTO.officialEn.key },
    { alias: "11-3059-301", language: "en", sourceKey: AMAOTO.officialEn.key, kind: "regional_name", market: "Spring Rain" },
    { alias: "11-3059-302", language: "en", sourceKey: AMAOTO.officialEn.key, kind: "regional_name", market: "Summer Rain" },
    { alias: "11-3059-303", language: "en", sourceKey: AMAOTO.officialEn.key, kind: "regional_name", market: "Drizzle" },
    { alias: "11-3059-304", language: "en", sourceKey: AMAOTO.officialEn.key, kind: "regional_name", market: "Winter Rain" },
    { alias: "SHIKIORI 雨音", language: "ja", sourceKey: AMAOTO.officialJp.key },
    { alias: "写乐 四季织 雨音", language: "zh", sourceKey: AMAOTO.officialJp.key },
  ],
  claims: [
    claim(AMAOTO_SCOPE, "phase374-amaoto-identity", "model_identity", "11-3059 是 SHIKIORI 雨音的共同主型号，四个完整颜色 SKU 为 11-3059-301、302、303、304；不是四个独立系列。", AMAOTO.officialJp.key, "official title and four product codes"),
    claim(AMAOTO_SCOPE, "phase374-amaoto-retailer-identity", "market_listing", "Nagasawa Stationery Center 以 11-3059 列出春雨、翠雨、霧雨、凍雨四个 MF 颜色，为专业零售市场提供身份交叉核对；规格仍以 Sailor 为准。", AMAOTO.retailer.key, "professional retailer family listing"),
    claim(AMAOTO_SCOPE, "phase374-amaoto-launch", "release_history", "Sailor 官方新闻稿确认雨音钢笔于 2020 年 11 月 15 日在日本全国上市；雨音主题墨水是之后另行发布的耗材。", AMAOTO.press.key, "official nationwide launch date"),
    claim(AMAOTO_SCOPE, "phase374-amaoto-theme", "design_theme", "雨音把春芽、夏叶、秋实、冬眠的草木与雨及雨后情景相连，四个颜色分别对应春雨、翠雨、霧雨、凍雨；主题叙事不等于防水或夜光材料。", AMAOTO.collection.key, "official collection story and seasonal motifs"),
    claim(AMAOTO_SCOPE, "phase374-amaoto-nib", "nib", "四个颜色均为 21K 金中型 MF 尖并采用双色表面处理；这是笔尖字段，不能写成整支笔为黄金。", AMAOTO.officialJp.key, "nib and plating fields"),
    claim(AMAOTO_SCOPE, "phase374-amaoto-position", "series_position", "雨音是 SHIKIORI 系列首次使用 21K 笔尖的最上位模型；该描述限定在 SHIKIORI 发展语境，不是全 Sailor 产品排名。", AMAOTO.topic.key, "official first-21K-in-series description"),
    claim(AMAOTO_SCOPE, "phase374-amaoto-filling", "filling_system", "采用墨囊／转换器两用式，不是活塞、真空或尾栓吸入式。", AMAOTO.refill.key, "official cartridge and converter instructions"),
    claim(AMAOTO_SCOPE, "phase374-amaoto-material", "material", "盖栓、尾栓为 PMMA；盖、杆、大先为哑光 AS；金属件为 Gold IP，部件边界不能被压缩成‘全金属’或‘全 PMMA’。", AMAOTO.officialJp.key, "material and plating fields"),
    claim(AMAOTO_SCOPE, "phase374-amaoto-size", "physical_specification", "官方规格为 φ17 mm、含笔夹全长 124 mm、空笔重量 16.8 g。", AMAOTO.officialEn.key, "size and weight fields"),
    claim(AMAOTO_SCOPE, "phase374-amaoto-price", "market_status", "日本官网当前售价 ¥66,000（本体 ¥60,000）；海外价格、库存、税费和保修不能由此推定。", AMAOTO.officialJp.key, "current Japanese price and market notice"),
    claim(AMAOTO_SCOPE, "phase374-amaoto-ink-boundary", "sibling_boundary", "雨音钢笔与同主题瓶装／墨囊墨水是不同商品节点；墨水色名不能替代 11-3059-30x 尾码，也不能把墨水显色写成树脂材质。", AMAOTO.collection.key, "fountain-pen and ink product separation"),
    claim(AMAOTO_SCOPE, "phase374-amaoto-care", "maintenance_guidance", "换色时排空墨囊或转换器，用室温清水吸排；不要整笔长时间浸泡、用热水、酒精或强溶剂处理哑光 AS 和 Gold IP。", AMAOTO.care.key, "official cleaning and storage guidance", "editorial"),
    claim(AMAOTO_SCOPE, "phase374-amaoto-selection", "selection_guidance", "选购应核对 11-3059-30x 完整代码、21K MF、C/C、PMMA／AS、Gold IP、φ17×124 mm 和 16.8 g；看到钢尖或 14K 时应重新辨认型号。", AMAOTO.officialJp.key, "code, nib, filling, material, dimensions and weight", "editorial"),
    claim(AMAOTO_SCOPE, "phase374-amaoto-media", "media_identity_boundary", "主图是本站原创四颜色事实 SVG，不复制 Sailor 产品照片或 Logo，也不证明树脂实物颜色、比例、批次或耐光性。", AMAOTO.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase374-amaoto-harusame", name: "春雨 Harusame（11-3059-301）", notes: "21K MF，双色处理。", sourceKey: AMAOTO.officialJp.key, variantKind: "color", productCode: "11-3059-301", market: "日本" },
    { key: "phase374-amaoto-suiu", name: "翠雨 Suiu（11-3059-302）", notes: "21K MF，双色处理。", sourceKey: AMAOTO.officialJp.key, variantKind: "color", productCode: "11-3059-302", market: "日本" },
    { key: "phase374-amaoto-kirisame", name: "霧雨 Kirisame（11-3059-303）", notes: "21K MF，双色处理。", sourceKey: AMAOTO.officialJp.key, variantKind: "color", productCode: "11-3059-303", market: "日本" },
    { key: "phase374-amaoto-touu", name: "凍雨 Touu（11-3059-304）", notes: "21K MF，双色处理。", sourceKey: AMAOTO.officialJp.key, variantKind: "color", productCode: "11-3059-304", market: "日本" },
  ],
  timeline: [
    { key: "phase374-amaoto-launch", title: "SHIKIORI 雨音在日本全国上市", eventType: "model_released", startDate: "2020-11-15", circa: false, description: "Sailor 官方新闻稿将 2020 年 11 月 15 日列为 11-3059 雨音钢笔的日本全国上市日。", sourceKey: AMAOTO.press.key },
  ],
});

const minori = pack({
  entityId: PHASE374_MINORI_ID,
  slug: PHASE374_MINORI_SLUG,
  canonicalName: "写乐 Sailor SHIKIORI 五周年纪念 穣（Minori，10-1050-368）",
  storyTitle: "写乐 Sailor SHIKIORI 五周年穣 10-1050-368：一支把水田四季装进套装的 14K 钢笔",
  markdownFile: ".planning/content-research/sailor-shikiori-minori-101050-phase374.md",
  scopeKey: MINORI_SCOPE,
  source: MINORI,
  seriesName: "Sailor SHIKIORI 五周年纪念 穣（Minori，10-1050-368）",
  release: "2022-09-10 日本限定上市；限量 3,000 套",
  validFrom: "2022-09-10",
  nib: "14K 金、中型 MF（中细）尖",
  fill: "墨囊／转换器两用式；套装含专用金色转换器",
  material: "PMMA 树脂；金属部件 Gold IP；水色笔杆含细小绿色调闪粉",
  dimensions: "φ17 × 135 mm（含笔夹）",
  weight: "16.5–16.6 g（官方发布资料 16.5 g；英文现行页 16.6 g）",
  price: "日本发布资料希望零售价 ¥25,300（本体 ¥23,000）；限定品已结束销售，不作当前价格",
  status: "数量限定 3,000 套；SHIKIORI 官方资料注明已结束销售",
  aliases: [
    { alias: "SHIKIORI 5th Anniversary Minori", language: "en", sourceKey: MINORI.officialEn.key },
    { alias: "SHIKIORI Minori Fountain Pen", language: "en", sourceKey: MINORI.officialEn.key },
    { alias: "10-1050-368", language: "en", sourceKey: MINORI.officialEn.key },
    { alias: "SHIKIORI 五周年記念 穣", language: "ja", sourceKey: MINORI.topic.key },
    { alias: "SHIKIORI 5周年纪念 Minori 穣", language: "zh", sourceKey: MINORI.officialZh.key },
  ],
  claims: [
    claim(MINORI_SCOPE, "phase374-minori-identity", "model_identity", "10-1050-368 是 SHIKIORI 五周年纪念穣的唯一钢笔主型号；20 ml 墨水、专用转换器和礼盒属于套装组成，不另造颜色型号。", MINORI.officialEn.key, "official item code and product description"),
    claim(MINORI_SCOPE, "phase374-minori-retailer-identity", "market_listing", "JP Select 以 Minori 名称列出这支 SHIKIORI 五周年主题钢笔，作为国际零售身份交叉点；不以零售商页面替代官方 SKU 或规格。", MINORI.retailer.key, "professional retailer identity listing"),
    claim(MINORI_SCOPE, "phase374-minori-launch", "release_history", "官方新闻与发布资料确认穣钢笔套装于 2022 年 9 月 10 日在日本数量限定上市，限量 3,000 套。", MINORI.press.key, "official launch date and limited quantity"),
    claim(MINORI_SCOPE, "phase374-minori-ended", "market_status", "SHIKIORI 官方系列资料注明五周年穣属于数量限定品且已经结束销售；发布时的 ¥25,300 只作历史价格基线。", MINORI.collection.key, "official limited-edition status and collection note"),
    claim(MINORI_SCOPE, "phase374-minori-theme", "design_theme", "穣以四季变化的水田、稻苗、金色稻穗和整地为主题，名称来自丰穰的‘穣’；这是设计叙事，不是天然稻米材质或产地声明。", MINORI.topic.key, "official rice-paddy theme and naming story"),
    claim(MINORI_SCOPE, "phase374-minori-development", "design_development", "官方开发故事说明水色轴内的小闪粉带有轻微绿色调，用于联想水田稻苗；不据此推断粒径、耐光性或每支闪粉密度。", MINORI.topic.key, "official development story"),
    claim(MINORI_SCOPE, "phase374-minori-nib", "nib", "钢笔采用 14K 金中型 MF 尖；14K 是笔尖材质，不等于整支笔为黄金，也不等于 21K 雨音结构。", MINORI.officialEn.key, "nib and item-code fields"),
    claim(MINORI_SCOPE, "phase374-minori-filling", "filling_system", "采用墨囊／转换器两用式，套装附专用金色转换器；转换器附件不把型号变成活塞或 Realo。", MINORI.officialZh.key, "official Chinese filling and set specification"),
    claim(MINORI_SCOPE, "phase374-minori-material", "material", "笔身为 PMMA 树脂，金属部件为 Gold IP；水色、微闪和金色是外观设计边界，不是树脂颜色校样。", MINORI.release.key, "official release specification"),
    claim(MINORI_SCOPE, "phase374-minori-size", "physical_specification", "官方资料给出 φ17×135 mm（含笔夹）；重量在发布资料的 16.5 g 与英文产品页 16.6 g 之间，正文保留来源差异。", MINORI.officialEn.key, "size and weight fields with release cross-check"),
    claim(MINORI_SCOPE, "phase374-minori-set", "set_composition", "完整套装包括钢笔、20 ml 穣主题瓶装墨水、专用金色转换器、礼盒和说明资料；墨水显色属于耗材与纸张组合表现。", MINORI.collection.key, "official set-content description"),
    claim(MINORI_SCOPE, "phase374-minori-sibling-boundary", "sibling_boundary", "穣与雨音、山水、草遊び等同属 SHIKIORI，但其 10-1050-368、14K MF、135 mm 和限定套装边界不能与其他型号混写。", MINORI.officialEn.key, "SHIKIORI family and specification boundary"),
    claim(MINORI_SCOPE, "phase374-minori-care", "maintenance_guidance", "换色时排空墨囊或转换器，用室温清水吸排；不要整笔长时间浸泡、用热水、酒精或研磨布处理 PMMA 和 Gold IP。", MINORI.care.key, "official cleaning and storage guidance", "editorial"),
    claim(MINORI_SCOPE, "phase374-minori-selection", "selection_guidance", "选购或收藏应核对 10-1050-368、14K MF、PMMA、φ17×135 mm、约 16.5–16.6 g，以及 3,000 套的附件完整性；发布价不是当前二手价。", MINORI.release.key, "code, nib, material, dimensions, weight and set boundary", "editorial"),
    claim(MINORI_SCOPE, "phase374-minori-media", "media_identity_boundary", "主图是本站原创套装事实 SVG，不复制 Sailor 产品照片或 Logo，也不证明实物颜色、闪粉密度、比例或墨水显色。", MINORI.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase374-minori-set", name: "穣 Minori 五周年限量套装（10-1050-368）", notes: "14K MF 钢笔；含 20 ml 穣墨水、专用金色转换器和礼盒；限量 3,000 套。", sourceKey: MINORI.collection.key, variantKind: "edition_group", productCode: "10-1050-368", market: "日本" },
  ],
  timeline: [
    { key: "phase374-minori-launch", title: "SHIKIORI 五周年穣在日本限定上市", eventType: "model_released", startDate: "2022-09-10", circa: false, description: "Sailor 官方新闻与发布资料将 2022 年 9 月 10 日列为穣限量钢笔套装的日本上市日。", sourceKey: MINORI.press.key },
    { key: "phase374-minori-discontinued", title: "五周年穣限定套装结束销售", eventType: "discontinued", startDate: "2025-11", circa: true, description: "SHIKIORI 官方系列总览在 2025 年 11 月更新中注明数量限定穣已结束销售；未给出具体停产日。", sourceKey: MINORI.collection.key },
  ],
});

export const phase374SailorShikioriAmaotoMinoriPacks: CuratedEntityPack[] = [brand, amaoto, minori];
