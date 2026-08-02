import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE370_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE370_NOYAMA_ID = "phase370-sailor-shikiori-noyama-no-uta-11231";
export const PHASE370_NOYAMA_SLUG = "sailor-shikiori-noyama-no-uta";

const RETRIEVED = "2026-08-03";
const SCOPE = "phase370-sailor-shikiori-noyama-no-uta-11231";

function source(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  registryKey?: string;
  registryName?: string;
  homepageUrl?: string;
  author?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const registryKey = input.registryKey ?? `sailor-phase370-${sourceType}`;
  const registryName =
    input.registryName ??
    (sourceType === "official"
      ? "The Sailor Pen Co., Ltd."
      : "Fountain Pen Graph editorial studio");
  return {
    key: input.key,
    registryKey,
    registryName,
    sourceType,
    tier:
      input.tier ??
      (sourceType === "retailer" ? "professional_secondary" : "primary"),
    independenceGroup: registryKey,
    title: input.title,
    url: input.url,
    homepageUrl:
      input.homepageUrl ??
      (sourceType === "official" ? "https://sailor.co.jp/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author:
      input.author ??
      (sourceType === "official" ? "セーラー万年筆株式会社" : registryName),
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
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey,
        scopeKey: SCOPE,
        locator,
      },
    ],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  officialEn: source({
    key: "phase370-sailor-noyama-official-en",
    title: "SHIKIORI NOYAMA NO UTA Fountain Pen — 11-1231",
    url: "https://en.sailor.co.jp/product/11-1231/",
    summary:
      "Sailor 英文官网确认 SHIKIORI 第 8 年的系列语境、野山之歌鸟类主题、四个颜色 SKU、14K Standard MF、C/C、PMMA、φ17×124 mm、16.8 g 以及市场差异提示。",
    locator: "product details, description, item codes, nib, filling, material, size, weight",
  }),
  officialJp: source({
    key: "phase370-sailor-noyama-official-jp",
    title: "SHIKIORI―四季織― 野山の唄 万年筆 — 11-1231",
    url: "https://sailor.co.jp/product/11-1231/",
    summary:
      "Sailor 日本官网确认日文颜色名、2025-10-25 发售、¥33,000、14K 中型 MF、C/C、PMMA、金色 IP、尺寸重量和 PG-03W 包装。",
    locator: "price, release date, Japanese color names, specifications and packaging",
    registryKey: "sailor-official-japan-phase370",
  }),
  press: source({
    key: "phase370-sailor-noyama-press",
    title: "SHIKIORI 野山の唄 万年筆／ボールペン 新闻稿（2025-10-15）",
    url: "https://sailor.co.jp/wp-content/uploads/2025/10/251015_%E5%9B%9B%E5%AD%A3%E7%B9%94_%E9%87%8E%E5%B1%B1%E3%81%AE%E5%94%84_%E4%B8%87%E5%B9%B4%E7%AD%86_%E3%83%9C%E3%83%BC%E3%83%AB%E3%83%9A%E3%83%B3.pdf",
    summary:
      "官方新闻稿确认 2025-10-25 全国上市、七十二候鸟类灵感、四种颜色、14K 中型 MF、PMMA、金色 IP、φ17×124 mm、16.8 g 和日本希望零售价。",
    locator: "press release pages 1–2: launch, theme, lineup and product specifications",
    registryKey: "sailor-official-press-phase370",
  }),
  collection: source({
    key: "phase370-sailor-shikiori-collection",
    title: "SHIKIORI 四季織 Collections and price list",
    url: "https://shikiori.sailor.co.jp/collections/",
    summary:
      "SHIKIORI 官方系列站将野山の唄列为独立系列，并在价格表中单列 14K、中细和 ¥33,000；同时提示价格、设计和库存可能变化。",
    locator: "collections description, price list and update notice",
    registryKey: "sailor-shikiori-official-phase370",
    registryName: "SHIKIORI official website",
    homepageUrl: "https://shikiori.sailor.co.jp/",
  }),
  refill: source({
    key: "phase370-sailor-refill",
    title: "万年筆のインク補充方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-refill-ink/",
    summary:
      "Sailor 官方补墨页用于墨囊／转换器安装、吸排和换色时的排空步骤，不把 11-1231 误写成活塞或真空系统。",
    locator: "cartridge and converter filling instructions",
    registryKey: "sailor-official-care-phase370",
  }),
  care: source({
    key: "phase370-sailor-care",
    title: "万年筆のお手入れ方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-maintenance/",
    summary:
      "Sailor 官方维护页用于清水冲洗、避免整笔浸没和长期保存的边界，不把清洗建议扩大为材料耐受承诺。",
    locator: "cleaning, storage and maintenance instructions",
    registryKey: "sailor-official-care-phase370",
  }),
  retailer: source({
    key: "phase370-sailor-noyama-retailer",
    title: "Sailor Professional Gear Slim Shikiori Noyama no Uta — Komamono Honpo",
    url: "https://www.komamono-honpo.com/stationery/fountain_pen/premium_fountain_pen/sailor/11-1231.html",
    summary:
      "日本专业零售商以 11-1231 列出野山の唄四款和日本市场价格，用于交叉核对商品身份；规格主张仍以 Sailor 官方页为准。",
    locator: "11-1231 product family, color options and Japanese retail listing",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "komamono-honpo-phase370",
    registryName: "Komamono Honpo",
    homepageUrl: "https://www.komamono-honpo.com/",
    author: "Komamono Honpo",
  }),
  diagram: source({
    key: "phase370-sailor-noyama-svg",
    title: "Sailor SHIKIORI 野山の唄 11-1231 factual identity card",
    url: "/images/library/site-original/phase370/sailor/shikiori-noyama-no-uta-11231.svg",
    summary:
      "本站原创 factual SVG，表达四个颜色 SKU 和共同规格边界，不是产品照片、Logo、比例图或颜色校样。",
    locator: "site-original factual SVG metadata",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase370",
  }),
} as const;

const model: CuratedEntityPack = {
  key: "phase370-sailor-shikiori-noyama-no-uta-11231-v1",
  entityId: PHASE370_NOYAMA_ID,
  expectedType: "pen",
  expectedSlug: PHASE370_NOYAMA_SLUG,
  canonicalName: "写乐 Sailor SHIKIORI 野山の唄（11-1231）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sailor-shikiori-noyama-no-uta-11231-phase370.md",
  storyTitle: "写乐 Sailor SHIKIORI 野山の唄 11-1231：七十二候鸟声的 14K 四季色",
  primarySourceKey: S.officialJp.key,
  depthTier: "A",
  aliases: [
    { alias: "Sailor SHIKIORI NOYAMA NO UTA", language: "en", sourceKey: S.officialEn.key },
    { alias: "Sailor Shikiori Noyama-no-uta", language: "en", sourceKey: S.officialEn.key },
    { alias: "11-1231", language: "en", sourceKey: S.officialEn.key },
    { alias: "11-1231-301", language: "en", sourceKey: S.officialEn.key, kind: "regional_name", market: "Haru-Tsuge-Dori" },
    { alias: "11-1231-302", language: "en", sourceKey: S.officialEn.key, kind: "regional_name", market: "Waka-Take" },
    { alias: "11-1231-303", language: "en", sourceKey: S.officialEn.key, kind: "regional_name", market: "Sekirei" },
    { alias: "11-1231-304", language: "en", sourceKey: S.officialEn.key, kind: "regional_name", market: "Kiji" },
    { alias: "SHIKIORI 野山の唄", language: "ja", sourceKey: S.officialJp.key },
    { alias: "写乐 四季織 野山之歌", language: "zh", sourceKey: S.officialJp.key },
  ],
  sources: [
    S.officialEn,
    S.officialJp,
    S.press,
    S.collection,
    S.refill,
    S.care,
    S.retailer,
    S.diagram,
  ],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Sailor Japan official product page",
      validFrom: "2025-10-25",
      productionState: "current",
      nibScope: "14K gold, standard-size nib, MF across four 11-1231 color SKUs",
      materialScope: "PMMA resin cap/barrel/section; gold IP metal parts",
      editionScope: "SHIKIORI Noyama-no-uta family, 11-1231-301 through 304",
    },
    {
      key: "phase370-noyama-market-boundary",
      scopeKey: "phase370-noyama-market-boundary",
      market: "Japan launch and retail listing",
      validFrom: "2025-10-25",
      productionState: "current",
      editionScope: "Japanese launch price and availability; international price not inferred",
    },
    {
      key: "phase370-noyama-media-boundary",
      scopeKey: "phase370-noyama-media-boundary",
      productionState: "current",
      editionScope: "site-original factual SVG; no product photo or color proof",
    },
  ],
  claims: [
    claim(
      "phase370-noyama-identity",
      "model_identity",
      "11-1231 是 Sailor SHIKIORI 野山の唄钢笔组的共同主型号，四个完整颜色 SKU 为 11-1231-301、302、303、304；不是四个互不相关的系列型号。",
      S.officialJp.key,
      "Japanese product title and item-code table",
    ),
    claim(
      "phase370-noyama-retailer-identity",
      "market_listing",
      "Komamono Honpo 将 11-1231 列为野山の唄四款颜色的同一商品组，用于交叉核对市场身份；经销商页面不替代 Sailor 对材质、尖型和尺寸的官方规格。",
      S.retailer.key,
      "retailer family listing and four color options",
    ),
    claim(
      "phase370-noyama-theme",
      "design_theme",
      "野山の唄以七十二候中出现的鸟为灵感，四个颜色名对应春告鸟、若鷹、鶺鴒、雉；七十二候是将二十四节气再分为三候的历法语境。",
      S.press.key,
      "official press release theme and 72 micro-seasons explanation",
    ),
    claim(
      "phase370-noyama-launch",
      "release_date",
      "日本官方产品页和新闻稿给出的全国上市日是 2025 年 10 月 25 日；这不是 SHIKIORI 系列的首发年份。",
      S.press.key,
      "press release launch notice",
    ),
    claim(
      "phase370-noyama-nib",
      "nib",
      "四个颜色 SKU 共同采用 14K 金中型 MF（中细）尖；不能把颜色 SKU 误写成钢尖或 21K 尖。",
      S.officialEn.key,
      "nib and item-code fields",
    ),
    claim(
      "phase370-noyama-filling",
      "filling_system",
      "采用墨囊／转换器两用式，不能写成 Realo 活塞、真空或滴入式大容量系统。",
      S.refill.key,
      "official cartridge and converter instructions",
    ),
    claim(
      "phase370-noyama-material",
      "material",
      "盖、杆和大先为 PMMA 树脂，金属部件为金色 IP 处理；金色 IP 是金属表面处理名称，不等于笔身为金属或实金。",
      S.officialJp.key,
      "body and metal-parts fields",
    ),
    claim(
      "phase370-noyama-size",
      "physical_specification",
      "官方规格为最大径 φ17 mm、含笔夹全长 124 mm、空笔重量 16.8 g；不把装墨重量或插帽重心混入字段。",
      S.officialEn.key,
      "size and weight fields",
    ),
    claim(
      "phase370-noyama-price",
      "market_status",
      "日本官方希望零售价为 ¥33,000（本体 ¥30,000）；不同市场的库存、价格和展示规格需向授权经销商核对。",
      S.officialJp.key,
      "Japanese price and market availability notice",
    ),
    claim(
      "phase370-noyama-sibling-boundary",
      "sibling_boundary",
      "野山の唄与雨音、山水、雪月空葉等同属 SHIKIORI 语境，但产品代码、颜色和上市窗口不同；不能用总系列页替代 11-1231 的 SKU 身份。",
      S.collection.key,
      "official SHIKIORI collection and price list",
    ),
    claim(
      "phase370-noyama-care",
      "maintenance_guidance",
      "换色时先排空墨囊或转换器，再以室温清水吸排；不要整笔长时间浸泡、用热水、酒精或强溶剂，异常时停止强拆并寻求服务。",
      S.care.key,
      "official cleaning and storage guidance",
      "editorial",
    ),
    claim(
      "phase370-noyama-selection",
      "selection_guidance",
      "选购应核对 11-1231-30x 完整代码、14K 中型 MF、C/C、PMMA、金色 IP、φ17×124 mm 和 16.8 g；只写‘Shikiori 14K’不足以证明是野山の唄。",
      S.officialJp.key,
      "code, nib, filling, material, dimensions and weight fields",
      "editorial",
    ),
    claim(
      "phase370-noyama-media",
      "media_identity_boundary",
      "主图是本站原创四颜色事实 SVG，不复制 Sailor 产品照片或 Logo，也不证明实物色彩、比例、批次和耐光性。",
      S.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase370-noyama-haru-tsuge-dori",
      name: "春告鳥 Haru-Tsuge-Dori",
      notes: "11-1231-301，14K 中型 MF；野山の唄四个颜色之一。",
      sourceKey: S.officialJp.key,
      variantKind: "color",
      productCode: "11-1231-301",
      market: "日本",
    },
    {
      key: "phase370-noyama-waka-take",
      name: "若鷹 Waka-Take",
      notes: "11-1231-302，14K 中型 MF；野山の唄四个颜色之一。",
      sourceKey: S.officialJp.key,
      variantKind: "color",
      productCode: "11-1231-302",
      market: "日本",
    },
    {
      key: "phase370-noyama-sekirei",
      name: "鶺鴒 Sekirei",
      notes: "11-1231-303，14K 中型 MF；野山の唄四个颜色之一。",
      sourceKey: S.officialJp.key,
      variantKind: "color",
      productCode: "11-1231-303",
      market: "日本",
    },
    {
      key: "phase370-noyama-kiji",
      name: "雉 Kiji",
      notes: "11-1231-304，14K 中型 MF；野山の唄四个颜色之一。",
      sourceKey: S.officialJp.key,
      variantKind: "color",
      productCode: "11-1231-304",
      market: "日本",
    },
  ],
  spec: {
    brandEntityId: PHASE370_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor SHIKIORI 野山の唄（11-1231）",
      release_year: "2025-10-25 日本全国上市；SHIKIORI 2025 年进入第 8 年",
      origin_country: "日本品牌；不外推具体工厂",
      nib: "14K 金／中型 MF（中细）",
      fill_system: "墨囊／转换器两用式（cartridge/converter）",
      material: "盖、杆、大先为 PMMA 树脂；金属部件为金色 IP 处理",
      dimensions: "φ17 × 124 mm（含笔夹）",
      weight: "16.8 g",
      price_range: "日本官方希望零售价 ¥33,000（本体 ¥30,000）",
      status: "2025-10-25 日本全国上市；四个 11-1231-30x MF 颜色 SKU",
    },
    evidence: [
      evidence("phase370-noyama-brand", "brand_entity_id", S.officialJp.key, "official Sailor product page"),
      evidence("phase370-noyama-series", "series_name", S.officialJp.key, "product title and 11-1231 code"),
      evidence("phase370-noyama-release", "release_year", S.press.key, "2025-10-25 national launch"),
      evidence("phase370-noyama-origin", "origin_country", S.officialJp.key, "Sailor Japan official context"),
      evidence("phase370-noyama-nib-field", "nib", S.officialEn.key, "14K standard MF"),
      evidence("phase370-noyama-fill-field", "fill_system", S.refill.key, "cartridge and converter instructions"),
      evidence("phase370-noyama-material-field", "material", S.officialJp.key, "PMMA and gold IP fields"),
      evidence("phase370-noyama-dimensions", "dimensions", S.officialEn.key, "φ17×124 mm"),
      evidence("phase370-noyama-weight", "weight", S.officialEn.key, "16.8 g"),
      evidence("phase370-noyama-price", "price_range", S.officialJp.key, "¥33,000 Japanese official price"),
      evidence("phase370-noyama-status", "status", S.officialJp.key, "launch and four-SKU status"),
    ],
  },
  media: [
    {
      key: "phase370-noyama-primary-media",
      title: "SHIKIORI 野山の唄 11-1231 四色事实卡（非产品照片）",
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
      key: "phase370-noyama-launch",
      title: "SHIKIORI 野山の唄在日本全国上市",
      eventType: "model_released",
      startDate: "2025-10-25",
      circa: false,
      description: "Sailor 官方新闻稿和日本产品页将 2025 年 10 月 25 日列为 11-1231 野山の唄的全国上市日。",
      sourceKey: S.press.key,
    },
  ],
};

export const phase370SailorShikioriNoyamaNoUtaPacks: CuratedEntityPack[] = [model];
