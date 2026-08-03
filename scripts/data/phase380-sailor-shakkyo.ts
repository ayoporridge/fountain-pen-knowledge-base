import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase33Sailor2026CurrentPacks } from "./phase33-sailor-2026-current";

export const PHASE380_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE380_SHAKKYO_ID = "phase380-sailor-shakkyo-108099";
export const PHASE380_SHAKKYO_SLUG = "sailor-king-of-pen-shakkyo-108099";

const RETRIEVED = "2026-08-03";
const PRODUCT = "https://en.sailor.co.jp/product/10-8099/";
const ARTIST_PRODUCT = "https://en.sailor.co.jp/product/10-7911/";
const SEIKO_ARTIST =
  "https://www.seikowatches.com/jp-ja/special/tokinowaza-since1881/tamura/";
const RETAILER =
  "https://writingculture.com/products/king-of-pen-noh-shakkyo-le-maki-e-by-isshu-tamura-fountain-pen";
const NIB = "https://sailor.co.jp/topics/fountain-pen-type/";
const REFILL = "https://sailor.co.jp/topics/fountain-pen-refill-ink/";
const CARE = "https://sailor.co.jp/topics/fountain-pen-maintenance/";
const SVG = "/images/library/site-original/phase380/sailor/shakkyo-108099.svg";

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
  independenceGroup?: string;
  homepageUrl?: string;
  author?: string;
  publishedAt?: string;
  itemType?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const siteOriginal = sourceType === "user_submission";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier:
      input.tier ??
      (sourceType === "retailer" ? "professional_secondary" : "primary"),
    independenceGroup: input.independenceGroup ?? input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl:
      input.homepageUrl ??
      (sourceType === "official" ? "https://sailor.co.jp/" : "/"),
    itemType: input.itemType ?? (siteOriginal ? "image" : "web_page"),
    author:
      input.author ??
      (sourceType === "official" ? "セーラー万年筆株式会社" : input.registryName),
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
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const SOURCES = {
  product: source({
    key: "phase380-shakkyo-product",
    title: "The King of Pen Japanese Classical Performing Arts ‘Shakkyo’ — Sailor 官方",
    url: PRODUCT,
    summary:
      "Sailor 官方产品页确认 10-8099 的能乐 Shakkyo 题材、Isshu Tamura、M/B 货号、双色 21K KOP 尖、C/C、硬橡胶、φ18×153.5 mm 与箱根寄木礼盒。",
    locator:
      "title, artist, Shakkyo description, item codes, barcodes, nib, filling, material, size and package",
    registryKey: "sailor-official-phase380-shakkyo",
    registryName: "The Sailor Pen Co., Ltd.",
    homepageUrl: "https://en.sailor.co.jp/",
    author: "The Sailor Pen Co., Ltd.",
  }),
  artistProduct: source({
    key: "phase380-shakkyo-artist-product",
    title: "Kaga Taka Maki-e ‘Mt. Yoshino’ 10-7911 — Sailor 官方",
    url: ARTIST_PRODUCT,
    summary:
      "Sailor 另一款官方页面介绍 Isshu Tamura 的加贺蒔绘师承、1992 年起与 Sailor 合作和金泽传统背景；不把 10-7911 规格移植到 Shakkyo。",
    locator:
      "Maki-e artist profile, Kaga Maki-e background and Sailor collaboration history",
    registryKey: "sailor-official-phase380-shakkyo",
    registryName: "The Sailor Pen Co., Ltd.",
    homepageUrl: "https://en.sailor.co.jp/",
    author: "The Sailor Pen Co., Ltd.",
  }),
  seiko: source({
    key: "phase380-shakkyo-seiko-artist",
    title: "漆芸家 田村一舟氏 — Seiko Watch Corporation",
    url: SEIKO_ARTIST,
    summary:
      "Seiko 工艺师档案介绍田村一舟的金泽加贺蒔绘训练、细密技法及其在高级钢笔与腕表上的作品；用于艺术家背景交叉核对。",
    locator: "artist biography, Kaga Maki-e training and high-end fountain-pen work",
    registryKey: "seiko-watch-phase380-shakkyo",
    registryName: "Seiko Watch Corporation",
    homepageUrl: "https://www.seikowatches.com/",
    author: "セイコーウオッチ株式会社",
  }),
  retailer: source({
    key: "phase380-shakkyo-writingculture",
    title: "SAILOR King of Pen Noh ‘Shakkyo’ LE Maki-e — Writing Culture",
    url: RETAILER,
    summary:
      "专业零售商页面独立列出 Shakkyo、Isshu Tamura、石桥／狮子／牡丹题材、箱根寄木礼盒和 CHF 7,500 市场价格；其尺寸重量口径与官方不同，只作二级交叉。",
    locator:
      "retailer title, Noh theme, artist, Hakone box, market listing and retailer-only specifications",
    registryKey: "writingculture-phase380-shakkyo",
    registryName: "Writing Culture",
    sourceType: "retailer",
    tier: "professional_secondary",
    independenceGroup: "writingculture-phase380-shakkyo",
    homepageUrl: "https://writingculture.com/",
    author: "Writing Culture",
  }),
  nib: source({
    key: "phase380-shakkyo-nib",
    title: "ペン先の種類と特長 — Sailor 官方",
    url: NIB,
    summary:
      "Sailor 官方笔尖知识页用于解释标准尖幅和材料语境，不将通用说明外推为 Shakkyo 单支调校。",
    locator: "official nib material and width guidance",
    registryKey: "sailor-official-phase380-shakkyo",
    registryName: "セーラー万年筆株式会社",
  }),
  refill: source({
    key: "phase380-shakkyo-refill",
    title: "万年筆のインク補充方法 — Sailor 官方",
    url: REFILL,
    summary:
      "Sailor 官方说明墨囊和转换器安装、吸墨、排空与保存，作为 Shakkyo 的 C/C 维护资料。",
    locator: "official cartridge and converter filling instructions",
    registryKey: "sailor-official-phase380-shakkyo",
    registryName: "セーラー万年筆株式会社",
  }),
  care: source({
    key: "phase380-shakkyo-care",
    title: "万年筆のお手入れ方法 — Sailor 官方",
    url: CARE,
    summary:
      "Sailor 官方说明日常清洗、长期保存和避免强力清洁的方法；Maki-e 表面仍须按型号与授权服务意见处理。",
    locator: "official cleaning, storage and maintenance instructions",
    registryKey: "sailor-official-phase380-shakkyo",
    registryName: "セーラー万年筆株式会社",
  }),
  diagram: source({
    key: "phase380-shakkyo-svg",
    title: "Sailor King of Pen Shakkyo 10-8099 factual identity card",
    url: SVG,
    summary:
      "本站原创 factual SVG 概括 Shakkyo 的能乐题材、硬橡胶、双色 21K KOP 尖、M/B 货号、尺寸与礼盒。",
    locator: "site-original factual SVG metadata",
    registryKey: "fountain-pen-graph-editorial-phase380-shakkyo",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    itemType: "image",
  }),
};

const SCOPE = "phase380-sailor-shakkyo-108099";

const brand = structuredClone(
  phase33Sailor2026CurrentPacks.find(
    (candidate) =>
      candidate.entityId === PHASE380_SAILOR_BRAND_ID &&
      candidate.expectedType === "brand",
  ),
);
if (!brand) throw new Error("Phase 380 Sailor brand pack missing.");
brand.key = "phase380-sailor-brand-v1";

const pack: CuratedEntityPack = {
  key: `${PHASE380_SHAKKYO_ID}-v1`,
  entityId: PHASE380_SHAKKYO_ID,
  expectedType: "pen",
  expectedSlug: PHASE380_SHAKKYO_SLUG,
  canonicalName: "写乐 Sailor King of Pen ‘Shakkyo’（10-8099）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sailor-shakkyo-108099-phase380.md",
  storyTitle: "写乐 Sailor King of Pen Shakkyo 10-8099：把能乐题材放进 KOP 笔身",
  primarySourceKey: SOURCES.product.key,
  depthTier: "A",
  aliases: [
    { alias: "The King of Pen Japanese Classical Performing Arts - Shakkyo Fountain Pen", language: "en", sourceKey: SOURCES.product.key },
    { alias: "Sailor King of Pen Noh Shakkyo", language: "en", sourceKey: SOURCES.retailer.key },
    { alias: "Sailor Shakkyo 10-8099", language: "en", sourceKey: SOURCES.product.key },
    { alias: "写乐 King of Pen 石桥", language: "zh", sourceKey: SOURCES.product.key },
    { alias: "10-8099", language: "en", sourceKey: SOURCES.product.key },
  ],
  sources: Object.values(SOURCES),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Sailor authorized market",
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "KOP bicolor 21K gold with gold and rhodium plating; M/B SKUs",
      materialScope: "ebonite body; art finish and theme bounded to official description",
      editionScope: "10-8099 Japanese Classical Performing Arts Shakkyo",
    },
    {
      key: `${SCOPE}-artist-context`,
      scopeKey: `${SCOPE}-artist-context`,
      productionState: "historical",
      editionScope: "Isshu Tamura biography and Sailor collaboration; not a transfer of 10-7911 specifications",
    },
    {
      key: `${SCOPE}-media-boundary`,
      scopeKey: `${SCOPE}-media-boundary`,
      productionState: "current",
      editionScope: "site-original factual SVG; no product photo, logo, scale or colour proof",
    },
  ],
  claims: [
    claim(SCOPE, `${SCOPE}-identity`, "model_identity", "10-8099 是 Sailor King of Pen Japanese Classical Performing Arts ‘Shakkyo’ 的具体钢笔；Shakkyo 是题材名，KOP 是产品路线，不能与 KOP 总称或其他 Maki-e 款合并。", SOURCES.product.key, "official product title and item-code identity"),
    claim(SCOPE, `${SCOPE}-noh`, "design_context", "Sailor 以能乐《石桥》、清凉山石桥传说、狮子灵、牡丹和舞蹈作为设计说明；这些是产品题材叙事，不是完整能乐版本或中国地理史的独立考证。", SOURCES.product.key, "official Shakkyo description"),
    claim(SCOPE, `${SCOPE}-artist`, "artist_context", "Sailor 官方 10-7911 页面和 Seiko 工艺师档案都介绍 Isshu Tamura 的金泽加贺蒔绘训练与高级钢笔作品；没有证据把 10-8099 的每一层漆料或协作工坊细节外推出来。", SOURCES.seiko.key, "artist biography cross-check with official Sailor artist page", "editorial"),
    claim(SCOPE, `${SCOPE}-nib`, "nib", "KOP 双色 21K 金尖，金色与铑镀层；官方 M 10-8099-420、B 10-8099-620。镀层是表面处理，不是额外的尖材质声明。", SOURCES.product.key, "official nib, plating and item-code fields"),
    claim(SCOPE, `${SCOPE}-filling`, "filling_system", "墨囊／转换器两用式（converter & cartridge），没有证据把此型号写成活塞或真空上墨。", SOURCES.product.key, "official filling type field"),
    claim(SCOPE, `${SCOPE}-material`, "material", "官方材料字段为硬橡胶；页面没有给出漆种、金粉、螺钿、漆层厚度或逐笔工艺配方，不从题材照片猜工艺。", SOURCES.product.key, "official material field and absent craft-detail boundary"),
    claim(SCOPE, `${SCOPE}-size`, "physical_specification", "官方产品页给出 φ18×153.5 mm，未列本体重量；不借用其他 KOP 或零售页面的克数。", SOURCES.product.key, "official size field and absent weight field"),
    claim(SCOPE, `${SCOPE}-package`, "package_contents", "官方说明配 Special gift box，进一步指出为箱根寄木细工；页面未列墨囊数量、证书、编号卡或布套，不把它们补成标准套装。", SOURCES.product.key, "official package and Hakone marquetry description"),
    claim(SCOPE, `${SCOPE}-market`, "market_status", "Writing Culture 作为专业零售商独立列出 Shakkyo LE、题材、艺术家、礼盒和 CHF 7,500 市场价格；该价格与零售规格不替代 Sailor 官方 MSRP 或主尺寸。", SOURCES.retailer.key, "professional retailer market listing", "editorial"),
    claim(SCOPE, `${SCOPE}-care`, "maintenance_guidance", "换色或长期存放前用室温清水缓慢吸排并自然晾干；硬橡胶与装饰表面避免酒精、强溶剂、研磨物和长时间浸泡，出现掉漆、漏墨或尖片变形时联系授权服务。", SOURCES.care.key, "Sailor care guidance plus conservative art-finish boundary", "editorial"),
    claim(SCOPE, `${SCOPE}-selection`, "selection_guidance", "选购应核对 10-8099 主码、M/B 后缀、双色 21K KOP 尖、硬橡胶、φ18×153.5 mm、箱根寄木礼盒和授权来源；第三方价格只作市场参考。", SOURCES.product.key, "model code, specification, package and market checks", "editorial"),
    claim(SCOPE, `${SCOPE}-media`, "media_identity_boundary", "主图是本站原创 factual SVG，不复制 Sailor 产品照片或 Logo，不证明 Maki-e 真实纹样、比例、颜色、编号或礼盒缺件。", SOURCES.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: `${SCOPE}-m`, name: "KOP M 中字", notes: "官方代码 10-8099-420，JAN 49-01680-60586-9；与 B 共享 10-8099 主型号。", sourceKey: SOURCES.product.key, variantKind: "market_sku", productCode: "10-8099-420", market: "授权市场" },
    { key: `${SCOPE}-b`, name: "KOP B 太字", notes: "官方代码 10-8099-620，JAN 49-01680-60587-6；与 M 共享 10-8099 主型号。", sourceKey: SOURCES.product.key, variantKind: "market_sku", productCode: "10-8099-620", market: "授权市场" },
  ],
  spec: {
    brandEntityId: PHASE380_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor King of Pen Japanese Classical Performing Arts Shakkyo（10-8099）",
      release_year: "官方当前产品页未给出单一首发年份",
      origin_country: "日本 Sailor；不外推工厂或艺术品装配地点",
      nib: "KOP 双色 21K 金尖，金色与铑镀层；M 10-8099-420、B 10-8099-620",
      fill_system: "墨囊／转换器两用式（converter & cartridge）",
      material: "硬橡胶（ebonite）；题材装饰工艺不超出官方描述",
      dimensions: "φ18×153.5 mm",
      weight: "官方当前产品页未列重量",
      price_range: "官方页未列 MSRP；Writing Culture 历史零售页面列 CHF 7,500，仅作市场参考",
      status: "官方产品目录展示；授权市场库存需向 Sailor 经销商核对",
    },
    evidence: [
      evidence(`${SCOPE}-brand`, "brand_entity_id", SOURCES.product.key, SCOPE, "official Sailor product identity"),
      evidence(`${SCOPE}-series`, "series_name", SOURCES.product.key, SCOPE, "official Shakkyo title and code"),
      evidence(`${SCOPE}-release`, "release_year", SOURCES.product.key, SCOPE, "official page does not state a single launch year"),
      evidence(`${SCOPE}-origin`, "origin_country", SOURCES.product.key, SCOPE, "Sailor official product page; no factory inference"),
      evidence(`${SCOPE}-nib`, "nib", SOURCES.product.key, SCOPE, "official nib and item-code fields"),
      evidence(`${SCOPE}-fill`, "fill_system", SOURCES.product.key, SCOPE, "official filling field"),
      evidence(`${SCOPE}-material`, "material", SOURCES.product.key, SCOPE, "official ebonite field"),
      evidence(`${SCOPE}-dimensions`, "dimensions", SOURCES.product.key, SCOPE, "official size field"),
      evidence(`${SCOPE}-weight`, "weight", SOURCES.product.key, SCOPE, "official page does not list weight; no borrowed value"),
      evidence(`${SCOPE}-price`, "price_range", SOURCES.retailer.key, SCOPE, "historical professional retailer price only"),
      evidence(`${SCOPE}-status`, "status", SOURCES.product.key, SCOPE, "official availability and market notice"),
    ],
  },
  media: [
    {
      key: `${SCOPE}-primary-media`,
      title: "King of Pen Shakkyo 10-8099 事实卡（非产品照片）",
      sourceKey: SOURCES.diagram.key,
      localPath: SVG,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样、非纹样证明。",
      sourceUrl: SVG,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: `${SCOPE}-current-page`,
      title: "Sailor 产品页确认 Shakkyo 10-8099",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "截至 2026-08-03，Sailor 官方英文页展示 10-8099 的能乐 Shakkyo 题材、Isshu Tamura、KOP 双色 21K 尖、硬橡胶、尺寸和箱根寄木礼盒；页面未给出首发年份。",
      sourceKey: SOURCES.product.key,
    },
  ],
};

export const phase380SailorShakkyoPacks: CuratedEntityPack[] = [brand, pack];
