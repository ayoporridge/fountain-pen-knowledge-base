import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase33Sailor2026CurrentPacks } from "./phase33-sailor-2026-current";

export const PHASE377_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE377_EBONITE_ID = "phase377-sailor-ebonite-eternal-flow-106085";
export const PHASE377_EBONITE_SLUG = "sailor-ebonite-eternal-flow";
export const PHASE377_MICARTA_ID = "phase377-sailor-black-micarta-105060";
export const PHASE377_MICARTA_SLUG = "sailor-black-micarta";

const RETRIEVED = "2026-08-03";
const EBONITE_JP = "https://sailor.co.jp/product/10-6085/";
const EBONITE_EN = "https://en.sailor.co.jp/product/10-6085/";
const MICARTA_JP = "https://sailor.co.jp/product/10-5060/";
const MICARTA_EN = "https://en.sailor.co.jp/product/10-5060/";
const CATEGORY = "https://sailor.co.jp/category_product/fountain-pen/";
const EBONITE_TOPIC = "https://sailor.co.jp/topics/ebonite-sculpture-fp/";
const NIB = "https://sailor.co.jp/topics/fountain-pen-type/";
const REFILL = "https://sailor.co.jp/topics/fountain-pen-refill-ink/";
const CARE = "https://sailor.co.jp/topics/fountain-pen-maintenance/";
const EBONITE_USAGIYA = "https://at-usagiya.com/products/20260603b01";
const EBONITE_AKKERMAN =
  "https://www.pwakkerman.com/en/sailor-ebonite-eternal-flow-limited-edition-fountain-pen-%28c%2910-6085-448/info";
const MICARTA_YOUSTYLE =
  "https://store.shopping.yahoo.co.jp/youstyle-pen/yahoo-sl-10-5060.html";
const MICARTA_STILO =
  "https://www.stiloestile.com/en/fountain-pens/special-limited-edition/sailor-black-micarta-fountain-pen-limited-edition";

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
  publishedAt?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const siteOriginal = sourceType === "user_submission";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier:
      input.tier ?? (sourceType === "retailer" ? "professional_secondary" : "primary"),
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
    (pack) => pack.entityId === PHASE377_SAILOR_BRAND_ID && pack.expectedType === "brand",
  ),
);
if (!brand) throw new Error("Phase 377 Sailor brand pack missing.");
brand.key = "phase377-sailor-brand-v1";

type SourceBundle = {
  officialJp: CuratedSource;
  officialEn: CuratedSource;
  category: CuratedSource;
  topic?: CuratedSource;
  nib: CuratedSource;
  refill: CuratedSource;
  care: CuratedSource;
  retailer: CuratedSource;
  retailerAlt: CuratedSource;
  diagram: CuratedSource;
};

function makeSources(input: {
  prefix: string;
  officialJp: { title: string; url: string; summary: string; locator: string };
  officialEn: { title: string; url: string; summary: string; locator: string };
  retailer: { title: string; url: string; summary: string; locator: string; registryKey: string; registryName: string; homepageUrl: string };
  retailerAlt: { title: string; url: string; summary: string; locator: string; registryKey: string; registryName: string; homepageUrl: string };
  diagramPath: string;
  diagramTitle: string;
  diagramSummary: string;
  topic?: { title: string; url: string; summary: string; locator: string };
}): SourceBundle {
  const p = input.prefix;
  const bundle: SourceBundle = {
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
    category: source({
      key: `${p}-category`,
      title: "Sailor 万年筆・インク产品目录",
      url: CATEGORY,
      summary: "Sailor 官方目录把该页面列入现行万年笔产品分类；目录位置用于确认型号身份，不替代规格字段。",
      locator: "fountain pen category and product-card link",
      registryKey: `sailor-official-category-${p}`,
      registryName: "セーラー万年筆株式会社",
    }),
    nib: source({
      key: `${p}-nib`,
      title: "ペン先の種類と特長 — Sailor 官方",
      url: NIB,
      summary: "Sailor 官方基础知识页说明 14K／21K 笔尖、标准 F/M/B 尖幅和金含量对书写弹性的通用边界；不替代单支实物调校。",
      locator: "nib material, nib size and standard-width explanations",
      registryKey: `sailor-official-nib-${p}`,
      registryName: "セーラー万年筆株式会社",
    }),
    refill: source({
      key: `${p}-refill`,
      title: "万年筆のインク補充方法 — Sailor 官方",
      url: REFILL,
      summary: "Sailor 官方说明墨囊与转换器的安装、吸墨、排空和保存步骤，用于 C/C 型号的维护边界。",
      locator: "cartridge and converter filling instructions",
      registryKey: `sailor-official-refill-${p}`,
      registryName: "セーラー万年筆株式会社",
    }),
    care: source({
      key: `${p}-care`,
      title: "万年筆のお手入れ方法 — Sailor 官方",
      url: CARE,
      summary: "Sailor 官方说明日常清洗、长期保存和避免强力清洁的方法；材料专项警告仍以产品页为准。",
      locator: "cleaning, storage and maintenance instructions",
      registryKey: `sailor-official-care-${p}`,
      registryName: "セーラー万年筆株式会社",
    }),
    retailer: source({
      key: `${p}-retailer`,
      title: input.retailer.title,
      url: input.retailer.url,
      summary: input.retailer.summary,
      locator: input.retailer.locator,
      registryKey: input.retailer.registryKey,
      registryName: input.retailer.registryName,
      sourceType: "retailer",
      tier: "professional_secondary",
      homepageUrl: input.retailer.homepageUrl,
      author: input.retailer.registryName,
    }),
    retailerAlt: source({
      key: `${p}-retailer-alt`,
      title: input.retailerAlt.title,
      url: input.retailerAlt.url,
      summary: input.retailerAlt.summary,
      locator: input.retailerAlt.locator,
      registryKey: input.retailerAlt.registryKey,
      registryName: input.retailerAlt.registryName,
      sourceType: "retailer",
      tier: "professional_secondary",
      homepageUrl: input.retailerAlt.homepageUrl,
      author: input.retailerAlt.registryName,
    }),
    diagram: source({
      key: `${p}-svg`,
      title: input.diagramTitle,
      url: input.diagramPath,
      summary: input.diagramSummary,
      locator: "site-original factual SVG metadata",
      registryKey: `fountain-pen-graph-editorial-${p}`,
      registryName: "Fountain Pen Graph editorial studio",
      sourceType: "user_submission",
    }),
  };
  if (input.topic) {
    bundle.topic = source({
      key: `${p}-topic`,
      ...input.topic,
      registryKey: `sailor-official-topic-${p}`,
      registryName: "セーラー万年筆株式会社",
    });
  }
  return bundle;
}

const EBONITE_SOURCES = makeSources({
  prefix: "phase377-ebonite",
  officialJp: {
    title: "EBONITE ETERNAL FLOW 万年筆 — 10-6085",
    url: EBONITE_JP,
    summary: "Sailor 日本官网确认 10-6085 的 ¥110,000、2026-09-12 计划上市、F/M 代码、14K 大型铑饰尖、ebonite 机器刻纹、C/C、φ19.6×164 mm、43.1 g 和 PG-3 包装。",
    locator: "price, release date, F/M item codes, nib, filling, material, metal finish, size, weight, package and ebonite warnings",
  },
  officialEn: {
    title: "EBONITE ETERNAL FLOW Fountain Pen — 10-6085",
    url: EBONITE_EN,
    summary: "Sailor 英文页交叉确认 ETERNAL FLOW 的 14K 大型铑饰尖、ebonite 机器刻纹、C/C、尺寸重量，并列出 10-6085-248/448/648 市场代码。",
    locator: "English title, market item-code matrix and technical fields",
  },
  topic: {
    title: "エボナイト彫刻万年筆专题 — Sailor",
    url: EBONITE_TOPIC,
    summary: "Sailor 官方专题提供 ebonite 雕刻万年笔的历史工艺背景；只用于解释材料与机器加工语境，不覆盖 10-6085 的型号规格。",
    locator: "ebonite sculpture craft background and prior special products",
  },
  retailer: {
    title: "Sailor Ebonite Eternal Flow 10-6085 预订 — Usagiya",
    url: EBONITE_USAGIYA,
    summary: "日本专业零售商确认 10-6085 的 2026-09-12 预订、¥110,000、F/M 和 14K 大型尖；规格主张仍以 Sailor 官网为准。",
    locator: "professional pre-order title, release date, price, F/M selectors and model code",
    registryKey: "usagiya-phase377-ebonite",
    registryName: "Usagiya stationery retailer",
    homepageUrl: "https://at-usagiya.com/",
  },
  retailerAlt: {
    title: "Sailor Ebonite Eternal Flow 10-6085-448 — PW Akkerman",
    url: EBONITE_AKKERMAN,
    summary: "欧洲专业钢笔零售商列出 10-6085-448 M 市场 SKU，用于交叉核对海外代码；日本 F/M 主规格仍回到 Sailor。",
    locator: "professional retailer market SKU and nib selector",
    registryKey: "pw-akkerman-phase377-ebonite",
    registryName: "PW Akkerman pen retailer",
    homepageUrl: "https://www.pwakkerman.com/",
  },
  diagramPath: "/images/library/site-original/phase377/sailor/ebonite-eternal-flow-106085.svg",
  diagramTitle: "Sailor EBONITE ETERNAL FLOW 10-6085 factual identity card",
  diagramSummary: "本站原创 factual SVG 表达 10-6085 的机器刻纹 ebonite、14K 大型铑饰尖、C/C、43.1 g 和市场代码边界，不是产品照片、Logo、比例图或颜色校样。",
});

const MICARTA_SOURCES = makeSources({
  prefix: "phase377-micarta",
  officialJp: {
    title: "ブラックマイカルタ 万年筆 — 10-5060",
    url: MICARTA_JP,
    summary: "Sailor 日本官网确认 10-5060 的 ¥198,000、2026-10-17 计划上市、F/M/B 代码、21K 大型镀金尖、canvas micarta 全笔身、C/C、φ18.5×134 mm、33.2 g 和 PG-3 包装。",
    locator: "price, release date, F/M/B item codes, nib, filling, material, metal finish, size, weight, package and material positioning",
  },
  officialEn: {
    title: "Black Micarta Fountain Pen — 10-5060",
    url: MICARTA_EN,
    summary: "Sailor 英文页交叉确认 Black Micarta 的 21K 大型镀金尖、C/C、canvas micarta 和 φ18.5×134 mm，并列出 10-5060-228/428/628 市场代码。",
    locator: "English title, market item-code matrix and technical fields",
  },
  retailer: {
    title: "Sailor Black Micarta 10-5060 预订 — You Style",
    url: MICARTA_YOUSTYLE,
    summary: "日本专业文具零售商列出 10-5060 的 F/M/B 选择与预订信息，用于市场 SKU 交叉核对；材质和上市日以 Sailor 官网为准。",
    locator: "professional retailer model code and nib selectors",
    registryKey: "youstyle-phase377-micarta",
    registryName: "You Style stationery retailer",
    homepageUrl: "https://store.shopping.yahoo.co.jp/youstyle-pen/",
  },
  retailerAlt: {
    title: "Sailor Black Micarta Fountain Pen — Stilo e Stile",
    url: MICARTA_STILO,
    summary: "专业钢笔零售商以 Black Micarta 名称和 21K 尖配置交叉核对型号市场身份；不把零售商的营销耐久词升级成保证。",
    locator: "professional retailer model title, nib and material positioning",
    registryKey: "stiloestile-phase377-micarta",
    registryName: "Stilo e Stile pen retailer",
    homepageUrl: "https://www.stiloestile.com/",
  },
  diagramPath: "/images/library/site-original/phase377/sailor/black-micarta-105060.svg",
  diagramTitle: "Sailor Black Micarta 10-5060 factual identity card",
  diagramSummary: "本站原创 factual SVG 表达 10-5060 的 canvas micarta 全笔身、21K 大型镀金尖、C/C、33.2 g 和 F/M/B 市场代码边界，不是产品照片、Logo、比例图或颜色校样。",
});

function pack(input: {
  entityId: string;
  slug: string;
  canonicalName: string;
  storyTitle: string;
  markdownFile: string;
  scopeKey: string;
  source: SourceBundle;
  seriesName: string;
  releaseDate: string;
  releaseDescription: string;
  nib: string;
  fill: string;
  material: string;
  dimensions: string;
  weight: string;
  price: string;
  status: string;
  productCode: string;
  aliases: CuratedEntityPack["aliases"];
  variants: CuratedEntityPack["variants"];
  identityDescription: string;
  retailerDescription: string;
  materialDescription: string;
  siblingDescription: string;
  selectionDescription: string;
  mediaDescription: string;
  topicDescription?: string;
}): CuratedEntityPack {
  const S = input.source;
  const sourceList = Object.values(S).filter(Boolean) as CuratedSource[];
  const sourcesForTopic = S.topic ?? S.officialJp;
  const claims = [
    claim(input.scopeKey, `${input.scopeKey}-identity`, "model_identity", input.identityDescription, S.officialJp.key, "official product title, model code and technical fields"),
    claim(input.scopeKey, `${input.scopeKey}-market`, "market_listing", input.retailerDescription, S.retailer.key, "professional retailer product code and selectors"),
    claim(input.scopeKey, `${input.scopeKey}-market-alt`, "market_listing_secondary", "另一专业零售页面对同一主型号的尖幅／海外市场 SKU 提供独立交叉核对；不覆盖 Sailor 日本官网的主规格。", S.retailerAlt.key, "independent professional retailer listing"),
    claim(input.scopeKey, `${input.scopeKey}-release`, "release_history", input.releaseDescription, S.officialJp.key, "official planned release date and limited-sale notice"),
    claim(input.scopeKey, `${input.scopeKey}-nib`, "nib", input.nib, S.officialJp.key, "official nib material, size and finish fields"),
    claim(input.scopeKey, `${input.scopeKey}-nib-context`, "nib_context", "Sailor 官方笔尖基础知识把 F、M、B 作为标准字幅，并说明 14K／21K 只提供材料与弹性的一般背景；实际线宽和单支调校不能从金含量推定。", S.nib.key, "official nib material and width guidance"),
    claim(input.scopeKey, `${input.scopeKey}-filling`, "filling_system", input.fill, S.refill.key, "official cartridge and converter instructions"),
    claim(input.scopeKey, `${input.scopeKey}-material`, "material", input.materialDescription, S.officialJp.key, "official material, finish and component fields"),
    claim(input.scopeKey, `${input.scopeKey}-size`, "physical_specification", `官方规格为 ${input.dimensions}，空笔重量 ${input.weight}。含笔夹或防滚部的尺寸口径按产品页面保留。`, S.officialJp.key, "official size and weight fields"),
    claim(input.scopeKey, `${input.scopeKey}-price`, "market_status", `日本官网价格为 ${input.price}；这是 2026-08-03 读取的日本官方基线，不推导海外税费、库存或二手价格。`, S.officialJp.key, "official Japanese price and market notice"),
    claim(input.scopeKey, `${input.scopeKey}-sibling`, "sibling_boundary", input.siblingDescription, S.category.key, "official category and related-product identity boundary"),
    ...(input.topicDescription
      ? [claim(input.scopeKey, `${input.scopeKey}-topic`, "material_history", input.topicDescription, sourcesForTopic.key, "official ebonite craft background", "editorial")]
      : []),
    claim(input.scopeKey, `${input.scopeKey}-care`, "maintenance_guidance", "换色或长期不用时排空墨囊／转换器，用室温清水吸排并自然晾干；材料笔身不长时间浸泡，不使用酒精、强溶剂、研磨布、家具蜡或未经确认的抛光剂。出现裂纹、层压分离、螺纹松动或漏墨时应联系卖家或 Sailor 服务。", S.care.key, "official cleaning guidance plus material-specific conservative care", "editorial"),
    claim(input.scopeKey, `${input.scopeKey}-selection`, "selection_guidance", input.selectionDescription, S.officialJp.key, "product code, nib, material, dimensions, weight and release boundary", "editorial"),
    claim(input.scopeKey, `${input.scopeKey}-media`, "media_identity_boundary", input.mediaDescription, S.diagram.key, "site-original SVG metadata", "editorial"),
  ];
  const specEvidence = [
    evidence(`${input.scopeKey}-brand`, "brand_entity_id", S.officialJp.key, input.scopeKey, "official Sailor product page"),
    evidence(`${input.scopeKey}-series`, "series_name", S.officialJp.key, input.scopeKey, "official product title and model code"),
    evidence(`${input.scopeKey}-release`, "release_year", S.officialJp.key, input.scopeKey, "official planned release date"),
    evidence(`${input.scopeKey}-origin`, "origin_country", S.officialEn.key, input.scopeKey, "Sailor official product context"),
    evidence(`${input.scopeKey}-nib`, "nib", S.officialJp.key, input.scopeKey, "official nib and finish fields"),
    evidence(`${input.scopeKey}-fill`, "fill_system", S.officialJp.key, input.scopeKey, "official filling method field"),
    evidence(`${input.scopeKey}-material`, "material", S.officialJp.key, input.scopeKey, "official body-material and metal-part fields"),
    evidence(`${input.scopeKey}-dimensions`, "dimensions", S.officialJp.key, input.scopeKey, "official size field"),
    evidence(`${input.scopeKey}-weight`, "weight", S.officialJp.key, input.scopeKey, "official weight field"),
    evidence(`${input.scopeKey}-price`, "price_range", S.officialJp.key, input.scopeKey, "official price and limited-sale notice"),
    evidence(`${input.scopeKey}-status`, "status", S.officialJp.key, input.scopeKey, "official planned release and availability notice"),
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
    aliases: input.aliases,
    sources: sourceList,
    scopes: [
      {
        key: input.scopeKey,
        scopeKey: input.scopeKey,
        market: "Sailor official product page and authorized market listings",
        validFrom: input.releaseDate,
        productionState: "current",
        nibScope: input.nib,
        materialScope: input.material,
        editionScope: `${input.productCode}; announced future limited release`,
      },
      {
        key: `${input.scopeKey}-catalog-snapshot`,
        scopeKey: `${input.scopeKey}-catalog-snapshot`,
        validFrom: RETRIEVED,
        productionState: "historical",
        editionScope: "2026-08-03 catalog reading snapshot; not proof that the future product has shipped",
      },
      {
        key: `${input.scopeKey}-media-boundary`,
        scopeKey: `${input.scopeKey}-media-boundary`,
        productionState: "current",
        editionScope: "site-original factual SVG; no product photo or colour proof",
      },
    ],
    claims,
    variants: input.variants,
    spec: {
      brandEntityId: PHASE377_SAILOR_BRAND_ID,
      values: {
        series_name: input.seriesName,
        release_year: `${input.releaseDate} 计划上市（读取日 ${RETRIEVED}，未来时态）`,
        origin_country: "日本 Sailor；不外推具体工厂、原料供应商或单支批次",
        nib: input.nib,
        fill_system: input.fill,
        material: input.material,
        dimensions: input.dimensions,
        weight: input.weight,
        price_range: input.price,
        status: input.status,
      },
      evidence: specEvidence,
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
    timeline: [
      {
        key: `${input.scopeKey}-release`,
        title: `${input.canonicalName} 官方公布并计划限量发售`,
        eventType: "model_released",
        startDate: input.releaseDate,
        circa: false,
        description: input.releaseDescription,
        sourceKey: S.officialJp.key,
      },
    ],
  };
}

const ebonite = pack({
  entityId: PHASE377_EBONITE_ID,
  slug: PHASE377_EBONITE_SLUG,
  canonicalName: "写乐 Sailor EBONITE ETERNAL FLOW（10-6085）",
  storyTitle: "写乐 Sailor EBONITE ETERNAL FLOW 10-6085：机器刻纹把硬橡胶变成握位",
  markdownFile: ".planning/content-research/sailor-ebonite-eternal-flow-106085-phase377.md",
  scopeKey: "phase377-sailor-ebonite-eternal-flow-106085",
  source: EBONITE_SOURCES,
  seriesName: "Sailor EBONITE ETERNAL FLOW（10-6085）",
  releaseDate: "2026-09-12",
  releaseDescription: "Sailor 日本官网公布 10-6085 将于 2026-09-12 发售并标为限定销售；读取日 2026-08-03，正文保持“已公告、计划上市”时态，不把页面提示写成已经发售。",
  nib: "14金大型，铑饰面；日本页面 F/M，英文页面另列 B 市场代码",
  fill: "墨囊／转换器两用式（cartridge/converter）",
  material: "盖顶、笔盖、笔杆、大先、尾栓为硬橡胶 ebonite，机器刻纹；金属件镍铬镀层",
  dimensions: "φ19.6×164 mm（含防滚部）",
  weight: "43.1 g",
  price: "¥110,000（本体 ¥100,000）；限定发售，数量未在官网给出",
  status: "已公告、计划 2026-09-12 发售；日本 F/M 与英文 B 市场代码、库存和保修需按授权渠道实时核对",
  productCode: "10-6085",
  aliases: [
    { alias: "EBONITE ETERNAL FLOW Fountain Pen", language: "en", sourceKey: EBONITE_SOURCES.officialEn.key },
    { alias: "10-6085", language: "en", sourceKey: EBONITE_SOURCES.officialEn.key },
    { alias: "EBONITE ETERNAL FLOW", language: "en", sourceKey: EBONITE_SOURCES.officialJp.key },
    { alias: "エボナイト エターナルフロー 万年筆", language: "ja", sourceKey: EBONITE_SOURCES.officialJp.key },
    { alias: "写乐 Sailor Ebonite Eternal Flow", language: "zh", sourceKey: EBONITE_SOURCES.officialJp.key },
  ],
  variants: [
    { key: "phase377-ebonite-f", name: "细字 F（日本）", notes: "日本官网代码 10-6085-240；英文页面对应 10-6085-248，属于同一 10-6085 的地区市场后缀。", sourceKey: EBONITE_SOURCES.officialJp.key, variantKind: "market_sku", productCode: "10-6085-240", market: "日本" },
    { key: "phase377-ebonite-m", name: "中字 M（日本）", notes: "日本官网代码 10-6085-440；英文页面对应 10-6085-448，属于同一 10-6085 的地区市场后缀。", sourceKey: EBONITE_SOURCES.officialJp.key, variantKind: "market_sku", productCode: "10-6085-440", market: "日本" },
    { key: "phase377-ebonite-b", name: "太字 B（英文页面市场）", notes: "英文官网列 10-6085-648（B）；日本产品页未列 B，不把该海外市场 SKU 回写成日本库存。", sourceKey: EBONITE_SOURCES.officialEn.key, variantKind: "market_sku", productCode: "10-6085-648", market: "英文页面／海外市场" },
  ],
  identityDescription: "10-6085 是 Sailor EBONITE ETERNAL FLOW 的共同主型号；F/M 的日本代码与英文页面额外列出的 B 代码是市场 SKU，不是三个独立笔身或三个系列。",
  retailerDescription: "Usagiya 预订页按 10-6085 列出 2026-09-12、¥110,000 和 F/M 选项，为日本专业零售市场身份交叉核对；不替代官方材质与上市时态。",
  materialDescription: "官方把盖顶、盖、胴、大先、尾栓列为 ebonite／机器刻纹，金属件为镍铬镀层；英文页并提示原料偶见小凸点／凹陷与紫外线变色边界。",
  siblingDescription: "Black Micarta 10-5060 是另一支独立型号，使用 canvas micarta 与 21K 大型镀金尖；EBONITE ETERNAL FLOW 的硬橡胶刻纹、14K 大型铑尖和 43.1 g 不能覆盖到 Black Micarta 或其他 Sailor ebonite 产品。",
  selectionDescription: "选购应核对 10-6085 主码、F/M 的 240／440 或英文 B 的 648、14K 大型铑饰尖、ebonite 机器刻纹、镍铬金属件、φ19.6×164 mm、43.1 g、PG-3 和 2026-09-12 计划时态；零售商的“售罄”不等于官方取消。",
  mediaDescription: "主图是本站原创 ebonite 波纹身份 SVG，不复制 Sailor 产品照片或 Logo，也不证明真实波纹深浅、尺寸比例、颜色、批次或单支尖状态。",
  topicDescription: "Sailor 旧 ebonite 雕刻专题可说明品牌曾将机械雕刻用于硬橡胶笔，但不把旧款夜景主题、工艺批次或上市年代移植到 10-6085。",
});

const micarta = pack({
  entityId: PHASE377_MICARTA_ID,
  slug: PHASE377_MICARTA_SLUG,
  canonicalName: "写乐 Sailor Black Micarta（10-5060）",
  storyTitle: "写乐 Sailor Black Micarta 10-5060：整支 canvas micarta 不是黑色树脂改色",
  markdownFile: ".planning/content-research/sailor-black-micarta-105060-phase377.md",
  scopeKey: "phase377-sailor-black-micarta-105060",
  source: MICARTA_SOURCES,
  seriesName: "Sailor Black Micarta（10-5060）",
  releaseDate: "2026-10-17",
  releaseDescription: "Sailor 日本官网公布 10-5060 将于 2026-10-17 发售并标为限定销售；读取日 2026-08-03，正文只写已公告、计划上市，不写已经发售或已售罄。",
  nib: "21金大型，镀金；F／M／B 三种官方尖幅",
  fill: "墨囊／转换器两用式（cartridge/converter）",
  material: "盖顶、笔盖、大先、笔杆、尾栓均为 canvas micarta；金属件镀金",
  dimensions: "φ18.5×134 mm（含笔夹）",
  weight: "33.2 g",
  price: "¥198,000（本体 ¥180,000）；限定发售，数量未在官网给出",
  status: "已公告、计划 2026-10-17 发售；日本／英文市场代码和库存需按授权渠道实时核对",
  productCode: "10-5060",
  aliases: [
    { alias: "Black Micarta Fountain Pen", language: "en", sourceKey: MICARTA_SOURCES.officialEn.key },
    { alias: "10-5060", language: "en", sourceKey: MICARTA_SOURCES.officialEn.key },
    { alias: "ブラックマイカルタ 万年筆", language: "ja", sourceKey: MICARTA_SOURCES.officialJp.key },
    { alias: "Sailor Black Micarta", language: "en", sourceKey: MICARTA_SOURCES.officialEn.key },
    { alias: "写乐 Sailor Black Micarta", language: "zh", sourceKey: MICARTA_SOURCES.officialJp.key },
  ],
  variants: [
    { key: "phase377-micarta-f", name: "细字 F", notes: "日本官网代码 10-5060-220；英文页面对应 10-5060-228，地区后缀不同但共享同一 10-5060 主型号。", sourceKey: MICARTA_SOURCES.officialJp.key, variantKind: "market_sku", productCode: "10-5060-220", market: "日本" },
    { key: "phase377-micarta-m", name: "中字 M", notes: "日本官网代码 10-5060-420；英文页面对应 10-5060-428，地区后缀不同但共享同一 10-5060 主型号。", sourceKey: MICARTA_SOURCES.officialJp.key, variantKind: "market_sku", productCode: "10-5060-420", market: "日本" },
    { key: "phase377-micarta-b", name: "太字 B", notes: "日本官网代码 10-5060-620；英文页面对应 10-5060-628，地区后缀不同但共享同一 10-5060 主型号。", sourceKey: MICARTA_SOURCES.officialJp.key, variantKind: "market_sku", productCode: "10-5060-620", market: "日本／海外页面" },
  ],
  identityDescription: "10-5060 是 Sailor Black Micarta 的共同主型号；F/M/B 与日英页面尾码是市场 SKU，不把六个地区代码拆成六个实体，也不把所有黑色树脂笔并入本页。",
  retailerDescription: "You Style 专业零售目录按 10-5060 列出 F/M/B 预订选择，为市场身份和尖幅交叉核对；价格、材质与计划上市日仍以 Sailor 日本官网为准。",
  materialDescription: "官方把盖顶、盖、大先、胴和尾栓全部列为 canvas micarta，金属件为镀金；工业绝缘材料和层压布／纸的历史属于材料定位，不应升级成整笔无限防水或不可磨损保证。",
  siblingDescription: "EBONITE ETERNAL FLOW 10-6085 采用机器刻纹 ebonite、14K 大型铑尖和 43.1 g；Black Micarta 的 canvas micarta 全笔身、21K 大型镀金尖和 33.2 g 是另一条独立材料路线。",
  selectionDescription: "选购应核对 10-5060-220／420／620 或英文页 228／428／628、F/M/B、21K 大型镀金尖、canvas micarta 覆盖范围、C/C、φ18.5×134 mm、33.2 g、PG-3 和 2026-10-17 计划时态；屏幕上的纯黑不能证明实际层纹。",
  mediaDescription: "主图是本站原创 canvas micarta 身份 SVG，不复制 Sailor 产品照片或 Logo，也不证明实际纤维纹理、光泽、比例、颜色、批次或单支尖状态。",
});

export const phase377SailorEboniteMicartaPacks: CuratedEntityPack[] = [brand, ebonite, micarta];
