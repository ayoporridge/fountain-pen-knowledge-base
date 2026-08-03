import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedTimelineEvent,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase33Sailor2026CurrentPacks } from "./phase33-sailor-2026-current";

export const PHASE375_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE375_CASUAL_ID = "phase375-sailor-profit-casual-l-110820";
export const PHASE375_CASUAL_SLUG = "sailor-profit-casual-l";
export const PHASE375_BASIS_ID = "phase375-sailor-profit-casual-l-basis-110822";
export const PHASE375_BASIS_SLUG = "sailor-profit-casual-l-basis";
export const PHASE375_STABLE_ID = "phase375-sailor-profit-casual-l-stable-110825";
export const PHASE375_STABLE_SLUG = "sailor-profit-casual-l-stable";

const RETRIEVED = "2026-08-03";
const COMPARISON_PDF =
  "https://sailor.co.jp/wp-content/uploads/2026/05/260507_%E3%83%97%E3%83%AD%E3%83%95%E3%82%A3%E3%83%83%E3%83%88%E3%82%AB%E3%82%B8%E3%83%A5%E3%82%A2%E3%83%ABL_%E3%83%99%E3%83%BC%E3%82%B7%E3%82%B9_%E3%82%B4%E3%83%BC%E3%83%AB%E3%83%89%E3%83%AA%E3%83%A0%E4%B8%87%E5%B9%B4%E7%AD%86.pdf";

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
    (pack) => pack.entityId === PHASE375_SAILOR_BRAND_ID && pack.expectedType === "brand",
  ),
);
if (!brand) throw new Error("Phase 375 Sailor brand pack missing.");
brand.key = "phase375-sailor-brand-v1";

type SourceBundle = {
  officialJp: CuratedSource;
  officialEn: CuratedSource;
  topic: CuratedSource;
  release: CuratedSource;
  comparison: CuratedSource;
  refill: CuratedSource;
  care: CuratedSource;
  retailer: CuratedSource;
  diagram: CuratedSource;
};

function sources(input: {
  prefix: string;
  officialJp: { title: string; url: string; summary: string; locator: string };
  officialEn: { title: string; url: string; summary: string; locator: string };
  topic: { title: string; url: string; summary: string; locator: string };
  release: { title: string; url: string; summary: string; locator: string };
  retailer: { title: string; url: string; summary: string; locator: string; registryKey: string; registryName: string; homepageUrl: string };
  diagramPath: string;
  diagramTitle: string;
  diagramSummary: string;
}): SourceBundle {
  const p = input.prefix;
  return {
    officialJp: source({ key: `${p}-official-jp`, ...input.officialJp, registryKey: `sailor-official-jp-${p}`, registryName: "セーラー万年筆株式会社" }),
    officialEn: source({ key: `${p}-official-en`, ...input.officialEn, registryKey: `sailor-official-en-${p}`, registryName: "The Sailor Pen Co., Ltd." }),
    topic: source({ key: `${p}-topic`, ...input.topic, registryKey: `sailor-official-topic-${p}`, registryName: "セーラー万年筆株式会社" }),
    release: source({ key: `${p}-release`, ...input.release, registryKey: `sailor-official-news-${p}`, registryName: "セーラー万年筆株式会社", tier: "contemporary_archive" }),
    comparison: source({
      key: `${p}-comparison`,
      title: "プロフィット カジュアルL 三种版本比较资料",
      url: COMPARISON_PDF,
      summary: "Sailor 官方资料比较 Casual L、Basis、Stable 的帽环、大先、价格、尖幅、材质、尺寸和重量。",
      locator: "comparison table and product specification",
      registryKey: `sailor-official-pdf-${p}`,
      registryName: "セーラー万年筆株式会社",
      tier: "contemporary_archive",
    }),
    refill: source({
      key: `${p}-refill`,
      title: "万年筆のインク補充方法 — Sailor 官方",
      url: "https://sailor.co.jp/topics/fountain-pen-refill-ink/",
      summary: "Sailor 官方页说明墨囊和转换器的安装、吸墨与排空步骤。",
      locator: "cartridge and converter filling instructions",
      registryKey: `sailor-official-refill-${p}`,
      registryName: "セーラー万年筆株式会社",
    }),
    care: source({
      key: `${p}-care`,
      title: "万年筆のお手入れ方法 — Sailor 官方",
      url: "https://sailor.co.jp/topics/fountain-pen-maintenance/",
      summary: "Sailor 官方页用于清水冲洗、长期保存和避免强力清洁的边界。",
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
}

const BASE_SOURCES = sources({
  prefix: "phase375-casual",
  officialJp: {
    title: "プロフィット カジュアルL ゴールドトリム 万年筆 — 11-0820",
    url: "https://sailor.co.jp/product/11-0820/",
    summary: "Sailor 日本官网确认 11-0820 的 2025-10-04 上市、四种颜色、EF/F/MF/M/B、不锈钢 Gold IP、C/C、PMMA、φ18×141 mm、19.8 g 和 ¥13,200。",
    locator: "product title, launch date, item codes, nib, filling, material, size, weight and price",
  },
  officialEn: {
    title: "1911 Casual L Gold Trim Fountain Pen — 11-0820",
    url: "https://en.sailor.co.jp/product/11-0820/",
    summary: "Sailor 英文官网以 1911 Casual L Gold Trim 名称交叉确认 11-0820 的钢尖、C/C、PMMA、尺寸、重量和市场提示。",
    locator: "product description, item-code and technical fields",
  },
  topic: {
    title: "プロフィット カジュアルL ゴールドトリム的介绍 — Sailor",
    url: "https://sailor.co.jp/topics/profit_casual_l/",
    summary: "官方专题说明新 Casual L 钢尖的手工整理、四种基础色和面向日常／入门的定位。",
    locator: "development story, colour and writing-positioning text",
  },
  release: {
    title: "プロフィット カジュアルL 2025 年 10 月 4 日全国上市 — Sailor",
    url: "https://sailor.co.jp/news/20250924/",
    summary: "官方新闻稿确认 11-0820 于 2025 年 10 月 4 日在日本全国上市。",
    locator: "release date and product name",
  },
  retailer: {
    title: "Sailor 11-0820 Profit Casual L Gold Trim — You Style",
    url: "https://store.shopping.yahoo.co.jp/youstyle-pen/you-sl-10-9683.html",
    summary: "专业文具零售商按 11-0820 列出四种颜色和 EF/F/MF/M/B 尖幅；规格主张仍以 Sailor 官方为准。",
    locator: "retailer product code, colour and nib selectors",
    registryKey: "youstyle-pen-phase375",
    registryName: "You Style stationery retailer",
    homepageUrl: "https://store.shopping.yahoo.co.jp/youstyle-pen/",
  },
  diagramPath: "/images/library/site-original/phase375/sailor/profit-casual-l-110820.svg",
  diagramTitle: "Sailor Profit Casual L 11-0820 factual identity card",
  diagramSummary: "本站原创 factual SVG，表达 11-0820 的四种颜色、不锈钢 Gold IP 尖和 C/C 边界，不是产品照片、Logo、比例图或颜色校样。",
});

const BASIS_SOURCES = sources({
  prefix: "phase375-basis",
  officialJp: {
    title: "プロフィット カジュアルL ベーシス ゴールドトリム 万年筆 — 11-0822",
    url: "https://sailor.co.jp/product/11-0822/",
    summary: "Sailor 日本官网确认 11-0822 的 2026-05-16 上市、帽环、四种颜色、EF/F/MF/M/B、不锈钢 Gold IP、C/C、PMMA、φ18×141 mm、19.8 g 和 ¥16,500。",
    locator: "product title, launch date, item codes, cap ring, nib, filling, material, size, weight and price",
  },
  officialEn: {
    title: "1911 Casual L Basis Gold Trim Fountain Pen — 11-0822",
    url: "https://en.sailor.co.jp/product/11-0822/",
    summary: "Sailor 英文官网确认 Basis 的不锈钢 Gold IP 尖、帽环、C/C、PMMA、尺寸、重量和四种颜色代码。",
    locator: "product description, item-code and technical fields",
  },
  topic: {
    title: "プロフィット カジュアルL ベーシス的介绍 — Sailor",
    url: "https://sailor.co.jp/topics/profit_casual_l_basis/",
    summary: "官方专题把 Basis 定位为在 Casual L 上增加帽环的经典化版本，并链接三种 Casual L 比较。",
    locator: "cap-ring distinction, development story and comparison link",
  },
  release: {
    title: "プロフィット カジュアルL ベーシス 2026 年 5 月 16 日全国上市 — Sailor",
    url: "https://sailor.co.jp/news/20260507/",
    summary: "官方新闻稿确认 11-0822 于 2026 年 5 月 16 日在日本全国上市。",
    locator: "release date and product description",
  },
  retailer: {
    title: "Sailor Profit Casual L Basis 11-0822 — PenHouse",
    url: "https://item.rakuten.co.jp/penroom/48489/",
    summary: "日本专业文具零售商按 11-0822 列出四种颜色和 EF/F/MF/M/B 尖幅；代码和结构以 Sailor 官网为准。",
    locator: "retailer family listing and item-code selector",
    registryKey: "penhouse-phase375",
    registryName: "PenHouse stationery retailer",
    homepageUrl: "https://www.pen-house.net/",
  },
  diagramPath: "/images/library/site-original/phase375/sailor/profit-casual-l-basis-110822.svg",
  diagramTitle: "Sailor Profit Casual L Basis 11-0822 factual identity card",
  diagramSummary: "本站原创 factual SVG，表达 11-0822 的帽环、四种颜色、不锈钢 Gold IP 尖和 C/C 边界，不是产品照片、Logo、比例图或颜色校样。",
});

const STABLE_SOURCES = sources({
  prefix: "phase375-stable",
  officialJp: {
    title: "プロフィット カジュアルL ステイブル ゴールドトリム 万年筆 — 11-0825",
    url: "https://sailor.co.jp/product/11-0825/",
    summary: "Sailor 日本官网确认 11-0825 的 2026-02-28 上市、黄铜 Gold IP 大先、四种颜色、EF/F/MF/M/B、不锈钢 Gold IP、C/C、PMMA、φ18×141 mm、23.9 g 和 ¥27,500。",
    locator: "product title, launch date, item codes, brass grip, nib, filling, material, size, weight and price",
  },
  officialEn: {
    title: "1911 Casual L Stable Gold Trim Fountain Pen — 11-0825",
    url: "https://en.sailor.co.jp/product/1911-casual-l-stable-gold-trim-fountain-pen/",
    summary: "Sailor 英文官网确认 Stable 的低重心金属握位、不锈钢 Gold IP 尖、C/C、PMMA、尺寸和 23.9 g；日文页进一步明确黄铜大先。",
    locator: "product description, low-centre-of-gravity and technical fields",
  },
  topic: {
    title: "プロフィット カジュアルL ステイブル的介绍 — Sailor",
    url: "https://sailor.co.jp/topics/profit_casual_l_stable/",
    summary: "官方专题说明 Stable 采用金属大先、围绕太轴笔身做低重心设计，并与普通 Casual L 颜色保持一致。",
    locator: "low-centre-of-gravity, brass grip and development story",
  },
  release: {
    title: "プロフィット カジュアルL ステイブル 2026 年 2 月 28 日全国上市 — Sailor",
    url: "https://sailor.co.jp/news/20260225/",
    summary: "官方新闻稿确认 11-0825 于 2026 年 2 月 28 日在日本全国上市。",
    locator: "release date and product description",
  },
  retailer: {
    title: "Sailor 1911 Casual L Stable Fountain Pen — Goulet Pens",
    url: "https://www.gouletpens.com/products/sailor-1911-casual-l-fountain-pen-muted-black",
    summary: "授权钢笔零售商以 SL-11-0825-120 列出 Stable，交叉核对市场型号、颜色、钢尖 Gold IP 与配重握位；官方日文规格优先。",
    locator: "authorized retailer product code and technical description",
    registryKey: "goulet-pens-phase375",
    registryName: "The Goulet Pen Company",
    homepageUrl: "https://www.gouletpens.com/",
  },
  diagramPath: "/images/library/site-original/phase375/sailor/profit-casual-l-stable-110825.svg",
  diagramTitle: "Sailor Profit Casual L Stable 11-0825 factual identity card",
  diagramSummary: "本站原创 factual SVG，表达 11-0825 的黄铜／Gold IP 大先、四种颜色、不锈钢 Gold IP 尖和 C/C 边界，不是产品照片、Logo、比例图或颜色校样。",
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
  release: string;
  validFrom: string;
  nib: string;
  fill: string;
  material: string;
  dimensions: string;
  weight: string;
  price: string;
  status: string;
  comparison: string;
  productCode: string;
  aliases: CuratedEntityPack["aliases"];
  colors: Array<{ key: string; name: string; code: string }>;
  launchDescription: string;
  identityDescription: string;
  structuralDescription: string;
  bodyBoundary: string;
}): CuratedEntityPack {
  const S = input.source;
  const sourceList = Object.values(S) as CuratedSource[];
  const variants = input.colors.map((color) => ({
    key: `${input.scopeKey}-${color.key}`,
    name: color.name,
    notes: `${input.nib}；完整颜色主码 ${color.code}，另有 EF/F/MF/M/B 尾码。`,
    sourceKey: S.officialJp.key,
    variantKind: "color" as const,
    productCode: color.code,
    market: "日本",
  }));
  const claims = [
    claim(input.scopeKey, `${input.scopeKey}-identity`, "model_identity", input.identityDescription, S.officialJp.key, "official product title, model code and item-code matrix"),
    claim(input.scopeKey, `${input.scopeKey}-retailer-identity`, "market_listing", `${S.retailer.registryName} 按 ${input.productCode} 列出该型号和颜色／尖幅组合，为专业零售市场身份交叉核对；规格仍以 Sailor 官方资料为准。`, S.retailer.key, "professional retailer product code and selectors"),
    claim(input.scopeKey, `${input.scopeKey}-launch`, "release_history", input.launchDescription, S.release.key, "official launch announcement"),
    claim(input.scopeKey, `${input.scopeKey}-series`, "series_position", "PROFIT 是 Sailor 自 1981 年延续的代表系列；Casual L 是其中的钢尖长尺寸平台。本页面只代表该产品代码，不把同系列金尖、普通 Casual 或其他 Casual L 型号的规格互相覆盖。", S.officialJp.key, "official PROFIT series description"),
    claim(input.scopeKey, `${input.scopeKey}-nib`, "nib", "采用不锈钢笔尖并做 Gold IP 表面处理；Gold IP 是表面处理，不等于 14K、18K 或 21K 金尖，也不是 flex 承诺。", S.officialEn.key, "nib and plating fields"),
    claim(input.scopeKey, `${input.scopeKey}-filling`, "filling_system", "采用 Sailor 墨囊／转换器两用式，不是活塞、真空或尾栓旋转吸入式。", S.refill.key, "official cartridge and converter instructions"),
    claim(input.scopeKey, `${input.scopeKey}-material`, "material", input.material, S.officialJp.key, "official material, metal-part and plating fields"),
    claim(input.scopeKey, `${input.scopeKey}-comparison`, "sibling_boundary", input.structuralDescription, S.comparison.key, "official Casual L comparison table"),
    claim(input.scopeKey, `${input.scopeKey}-size`, "physical_specification", `官方规格为 ${input.dimensions}，空笔重量 ${input.weight}。`, S.officialJp.key, "official size and weight fields"),
    claim(input.scopeKey, `${input.scopeKey}-price`, "market_status", `日本官网当前售价 ${input.price}；海外价格、库存、税费和二手价不能由此推定。`, S.officialJp.key, "current Japanese price and market notice"),
    claim(input.scopeKey, `${input.scopeKey}-care`, "maintenance_guidance", "换色或长期不用时排空墨囊／转换器，用室温清水吸排并自然晾干；避免热水、酒精、强溶剂、金属工具和粗糙抛光，Gold IP 镀层受损时交给专业服务。", S.care.key, "official cleaning and storage guidance", "editorial"),
    claim(input.scopeKey, `${input.scopeKey}-selection`, "selection_guidance", input.bodyBoundary, S.officialJp.key, "product code, nib, material, dimension and weight boundary", "editorial"),
    claim(input.scopeKey, `${input.scopeKey}-media`, "media_identity_boundary", "主图是本站原创 factual SVG，不复制 Sailor 产品照片或 Logo，也不证明真实比例、颜色、批次或笔尖实物。", S.diagram.key, "site-original SVG metadata", "editorial"),
  ];
  const specEvidence = [
    evidence(`${input.scopeKey}-brand`, "brand_entity_id", S.officialJp.key, input.scopeKey, "official Sailor product page"),
    evidence(`${input.scopeKey}-series`, "series_name", S.officialJp.key, input.scopeKey, "official product title and model code"),
    evidence(`${input.scopeKey}-release`, "release_year", S.release.key, input.scopeKey, "official launch announcement"),
    evidence(`${input.scopeKey}-origin`, "origin_country", S.officialEn.key, input.scopeKey, "Sailor official product context"),
    evidence(`${input.scopeKey}-nib`, "nib", S.officialJp.key, input.scopeKey, "official nib and plating fields"),
    evidence(`${input.scopeKey}-fill`, "fill_system", S.refill.key, input.scopeKey, "official cartridge and converter instructions"),
    evidence(`${input.scopeKey}-material`, "material", S.officialJp.key, input.scopeKey, "official material and metal-part fields"),
    evidence(`${input.scopeKey}-dimensions`, "dimensions", S.officialJp.key, input.scopeKey, "official size field"),
    evidence(`${input.scopeKey}-weight`, "weight", S.officialJp.key, input.scopeKey, "official weight field"),
    evidence(`${input.scopeKey}-price`, "price_range", S.officialJp.key, input.scopeKey, "official current price"),
    evidence(`${input.scopeKey}-status`, "status", S.officialJp.key, input.scopeKey, "official product availability notice"),
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
        market: "Sailor official product and PROFIT pages",
        validFrom: input.validFrom,
        productionState: "current",
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
    claims,
    variants,
    spec: {
      brandEntityId: PHASE375_SAILOR_BRAND_ID,
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
        key: `${input.scopeKey}-launch`,
        title: `${input.canonicalName} 在日本全国上市`,
        eventType: "model_released",
        startDate: input.validFrom,
        circa: false,
        description: input.launchDescription,
        sourceKey: S.release.key,
      },
    ],
  };
}

const COLORS = [
  { key: "clear-black", name: "Clear Black（クリアブラック）", code: "11-0820-220" },
  { key: "clear-red", name: "Clear Red（クリアレッド）", code: "11-0820-230" },
  { key: "clear-blue", name: "Clear Blue（クリアブルー）", code: "11-0820-240" },
  { key: "clear-green", name: "Clear Green（クリアグリーン）", code: "11-0820-260" },
];

function colorsFor(modelCode: "11-0820" | "11-0822" | "11-0825") {
  return COLORS.map((color) => ({
    ...color,
    code: color.code.replace("11-0820", modelCode),
  }));
}

const casual = pack({
  entityId: PHASE375_CASUAL_ID,
  slug: PHASE375_CASUAL_SLUG,
  canonicalName: "写乐 Sailor Profit Casual L Gold Trim（11-0820）",
  storyTitle: "写乐 Sailor Profit Casual L 11-0820：把传统外形放进新的钢尖入门线",
  markdownFile: ".planning/content-research/sailor-profit-casual-l-110820-phase375.md",
  scopeKey: "phase375-sailor-profit-casual-l-110820",
  source: BASE_SOURCES,
  seriesName: "Sailor PROFIT / 1911 Casual L Gold Trim（11-0820）",
  release: "2025-10-04 日本全国上市",
  validFrom: "2025-10-04",
  nib: "不锈钢 EF／F／MF／M／B，Gold IP 表面处理",
  fill: "墨囊／转换器两用式（cartridge/converter）",
  material: "盖、杆、大先为 PMMA 树脂；金属件和笔尖为 Gold IP 表面处理",
  dimensions: "φ18 × 141 mm（含笔夹）",
  weight: "19.8 g",
  price: "¥13,200（本体 ¥12,000）",
  status: "日本官网当前公开；不同市场库存与规格以授权渠道核对",
  comparison: "11-0820 没有帽环，盖、杆、大先为 PMMA，空笔 19.8 g；Basis 11-0822 增加帽环，Stable 11-0825 则使用黄铜 Gold IP 大先并重至 23.9 g。",
  productCode: "11-0820",
  aliases: [
    { alias: "1911 Casual L Gold Trim", language: "en", sourceKey: BASE_SOURCES.officialEn.key },
    { alias: "Sailor Profit Casual L", language: "en", sourceKey: BASE_SOURCES.officialEn.key },
    { alias: "11-0820", language: "en", sourceKey: BASE_SOURCES.officialEn.key },
    { alias: "プロフィット カジュアルL ゴールドトリム", language: "ja", sourceKey: BASE_SOURCES.officialJp.key },
    { alias: "写乐 Profit Casual L Gold Trim", language: "zh", sourceKey: BASE_SOURCES.officialJp.key },
  ],
  colors: colorsFor("11-0820"),
  launchDescription: "Sailor 官方新闻稿确认 11-0820 于 2025 年 10 月 4 日在日本全国上市。",
  identityDescription: "11-0820 是 PROFIT / 1911 Casual L Gold Trim 的共同主型号；四种颜色与五种尖幅是其市场 SKU，不是二十个独立系列。",
  structuralDescription: "11-0820 没有帽环，盖、杆、大先为 PMMA，空笔 19.8 g；Basis 11-0822 增加帽环，Stable 11-0825 改用黄铜 Gold IP 大先并重至 23.9 g。",
  bodyBoundary: "选购应核对完整 11-0820 尾码、钢尖 Gold IP、C/C、PMMA、φ18×141 mm 和 19.8 g；看到帽环、黄铜大先、14K 或 21K 时应重新辨认相邻型号。",
});

const basis = pack({
  entityId: PHASE375_BASIS_ID,
  slug: PHASE375_BASIS_SLUG,
  canonicalName: "写乐 Sailor Profit Casual L Basis Gold Trim（11-0822）",
  storyTitle: "写乐 Sailor Profit Casual L Basis 11-0822：只增加帽环，身份仍要按代码核对",
  markdownFile: ".planning/content-research/sailor-profit-casual-l-basis-110822-phase375.md",
  scopeKey: "phase375-sailor-profit-casual-l-basis-110822",
  source: BASIS_SOURCES,
  seriesName: "Sailor PROFIT / 1911 Casual L Basis Gold Trim（11-0822）",
  release: "2026-05-16 日本全国上市",
  validFrom: "2026-05-16",
  nib: "不锈钢 EF／F／MF／M／B，Gold IP 表面处理",
  fill: "墨囊／转换器两用式（cartridge/converter）",
  material: "盖、杆、大先为 PMMA 树脂；帽环、金属件和笔尖为 Gold IP 表面处理",
  dimensions: "φ18 × 141 mm（含笔夹）",
  weight: "19.8 g",
  price: "¥16,500（本体 ¥15,000）",
  status: "日本官网当前公开；不同市场库存与规格以授权渠道核对",
  comparison: "Basis 11-0822 在 11-0820 的 PMMA 大先基础上增加帽环，仍为 19.8 g；Stable 11-0825 另有黄铜 Gold IP 大先和 23.9 g，不能把 Stable 的配重写给 Basis。",
  productCode: "11-0822",
  aliases: [
    { alias: "1911 Casual L Basis Gold Trim", language: "en", sourceKey: BASIS_SOURCES.officialEn.key },
    { alias: "Sailor Profit Casual L Basis", language: "en", sourceKey: BASIS_SOURCES.officialEn.key },
    { alias: "11-0822", language: "en", sourceKey: BASIS_SOURCES.officialEn.key },
    { alias: "プロフィット カジュアルL ベーシス ゴールドトリム", language: "ja", sourceKey: BASIS_SOURCES.officialJp.key },
    { alias: "写乐 Profit Casual L Basis", language: "zh", sourceKey: BASIS_SOURCES.officialJp.key },
  ],
  colors: colorsFor("11-0822"),
  launchDescription: "Sailor 官方新闻稿确认 11-0822 于 2026 年 5 月 16 日在日本全国上市。",
  identityDescription: "11-0822 是 PROFIT / 1911 Casual L Basis Gold Trim 的共同主型号；四种颜色与五种尖幅是其市场 SKU，帽环是与 11-0820 的身份差异。",
  structuralDescription: "Basis 11-0822 增加帽环但保留 PMMA 盖、杆、大先和 19.8 g；普通 11-0820 无帽环，Stable 11-0825 则使用黄铜 Gold IP 大先并重至 23.9 g。",
  bodyBoundary: "选购应核对完整 11-0822 尾码、帽环、不锈钢 Gold IP 尖、C/C、PMMA、φ18×141 mm 和 19.8 g；看到黄铜大先、23.9 g 或金尖标记时应重新辨认。",
});

const stable = pack({
  entityId: PHASE375_STABLE_ID,
  slug: PHASE375_STABLE_SLUG,
  canonicalName: "写乐 Sailor Profit Casual L Stable Gold Trim（11-0825）",
  storyTitle: "写乐 Sailor Profit Casual L Stable 11-0825：低重心钢尖不是金尖替代品",
  markdownFile: ".planning/content-research/sailor-profit-casual-l-stable-110825-phase375.md",
  scopeKey: "phase375-sailor-profit-casual-l-stable-110825",
  source: STABLE_SOURCES,
  seriesName: "Sailor PROFIT / 1911 Casual L Stable Gold Trim（11-0825）",
  release: "2026-02-28 日本全国上市",
  validFrom: "2026-02-28",
  nib: "不锈钢 EF／F／MF／M／B，Gold IP 表面处理",
  fill: "墨囊／转换器两用式（cartridge/converter）",
  material: "盖、杆为 PMMA 树脂；大先为黄铜／Gold IP；金属件和笔尖为 Gold IP 表面处理",
  dimensions: "φ18 × 141 mm（含笔夹）",
  weight: "23.9 g",
  price: "¥27,500（本体 ¥25,000）",
  status: "日本官网当前公开；不同市场库存与规格以授权渠道核对",
  comparison: "Stable 11-0825 在盖、杆 PMMA 的基础上使用黄铜／Gold IP 大先，空笔 23.9 g；普通 11-0820 和 Basis 11-0822 的大先为 PMMA、19.8 g，不能互相覆盖。",
  productCode: "11-0825",
  aliases: [
    { alias: "1911 Casual L Stable Gold Trim", language: "en", sourceKey: STABLE_SOURCES.officialEn.key },
    { alias: "Sailor Profit Casual L Stable", language: "en", sourceKey: STABLE_SOURCES.officialEn.key },
    { alias: "11-0825", language: "en", sourceKey: STABLE_SOURCES.officialEn.key },
    { alias: "プロフィット カジュアルL ステイブル ゴールドトリム", language: "ja", sourceKey: STABLE_SOURCES.officialJp.key },
    { alias: "写乐 Profit Casual L Stable", language: "zh", sourceKey: STABLE_SOURCES.officialJp.key },
  ],
  colors: colorsFor("11-0825"),
  launchDescription: "Sailor 官方新闻稿确认 11-0825 于 2026 年 2 月 28 日在日本全国上市。",
  identityDescription: "11-0825 是 PROFIT / 1911 Casual L Stable Gold Trim 的共同主型号；四种颜色与五种尖幅是其市场 SKU，黄铜 Gold IP 大先和低重心是独立结构。",
  structuralDescription: "Stable 11-0825 采用黄铜／Gold IP 大先并重至 23.9 g；普通 11-0820 和 Basis 11-0822 的大先为 PMMA、19.8 g，Basis 的帽环也不能被写成 Stable 的大先。",
  bodyBoundary: "选购应核对完整 11-0825 尾码、不锈钢 Gold IP 尖、黄铜／Gold IP 大先、C/C、φ18×141 mm 和 23.9 g；看到全 PMMA 大先或 19.8 g 时可能是相邻型号。",
});

export const phase375SailorProfitCasualLPacks: CuratedEntityPack[] = [brand, casual, basis, stable];
