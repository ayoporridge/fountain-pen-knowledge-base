import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase33Sailor2026CurrentPacks } from "./phase33-sailor-2026-current";

export const PHASE372_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE372_KUSA_ID = "phase372-sailor-shikiori-kusa-asobi-110657";
export const PHASE372_KUSA_SLUG = "sailor-shikiori-kusa-asobi";
export const PHASE372_SANSUI_ID = "phase372-sailor-shikiori-sansui-112050-112051";
export const PHASE372_SANSUI_SLUG = "sailor-shikiori-sansui";

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
    (pack) => pack.entityId === PHASE372_SAILOR_BRAND_ID && pack.expectedType === "brand",
  ),
);
if (!brand) throw new Error("Phase 372 Sailor brand pack missing.");
brand.key = "phase372-sailor-brand-v1";

const KUSA_SCOPE = "phase372-sailor-kusa-asobi-110657";
const KUSA = {
  officialEn: source({
    key: "phase372-kusa-official-en",
    title: "SHIKIORI KUSA ASOBI Fountain Pen — 11-0657",
    url: "https://en.sailor.co.jp/product/11-0657/",
    summary: "Sailor 英文官网确认 KUSA ASOBI 主题、四个颜色代码、F 钢尖、C/C、PMMA、Gold IP、φ17×134 mm 和 12.2 g。",
    locator: "product description, item codes, nib, filling, material, size and weight",
    registryKey: "sailor-official-en-phase372-kusa",
    registryName: "The Sailor Pen Co., Ltd.",
  }),
  officialJp: source({
    key: "phase372-kusa-official-jp",
    title: "SHIKIORI―四季織― 草遊び 万年筆 — 11-0657",
    url: "https://sailor.co.jp/product/11-0657/",
    summary: "Sailor 日本官网确认 2024-09-21 发售、¥8,800、花冠／笹舟／橡／雪兎四个颜色、F 钢尖和 PG-03W 包装。",
    locator: "launch date, price, Japanese color names, specifications and package",
    registryKey: "sailor-official-jp-phase372-kusa",
    registryName: "セーラー万年筆株式会社",
  }),
  press: source({
    key: "phase372-kusa-press",
    title: "SHIKIORI 草遊び万年筆／ボールペン新闻稿（2024-09-11）",
    url: "https://sailor.co.jp/news/20240911/",
    summary: "官方新闻稿把草遊び定位为四季織的新产品并公布全国上市日；用于时间与系列边界，不替代具体规格。",
    locator: "official news release title, launch notice and product context",
    registryKey: "sailor-official-press-phase372-kusa",
    registryName: "セーラー万年筆株式会社",
  }),
  refill: source({
    key: "phase372-kusa-refill",
    title: "万年筆のインク補充方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-refill-ink/",
    summary: "官方补墨页说明 Sailor 墨囊／转换器的安装、吸排和换色排空步骤。",
    locator: "cartridge and converter filling instructions",
    registryKey: "sailor-official-care-phase372-kusa",
    registryName: "セーラー万年筆株式会社",
  }),
  care: source({
    key: "phase372-kusa-care",
    title: "万年筆のお手入れ方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-maintenance/",
    summary: "官方维护页用于清水冲洗、避免整笔浸没和长期保存的边界。",
    locator: "cleaning, storage and maintenance instructions",
    registryKey: "sailor-official-care-phase372-kusa",
    registryName: "セーラー万年筆株式会社",
  }),
  retailer: source({
    key: "phase372-kusa-retailer",
    title: "Sailor 1911S Shikiori Kusa Asobi Sasabune — Fontoplumo",
    url: "https://fontoplumo.nl/products/sailor-1911s-shikiori-kusa-asobi-sasabune-fountain-pen",
    summary: "专业零售商以 11-0657-202 标识笹舟颜色并列出 Kusa Asobi 商品身份，用于市场交叉核对；规格仍以 Sailor 官网为准。",
    locator: "11-0657-202 product-code listing and Kusa Asobi identity",
    registryKey: "fontoplumo-phase372-kusa",
    registryName: "Fontoplumo",
    sourceType: "retailer",
    tier: "professional_secondary",
    homepageUrl: "https://fontoplumo.nl/",
    author: "Fontoplumo",
  }),
  diagram: source({
    key: "phase372-kusa-svg",
    title: "Sailor SHIKIORI 草遊び 11-0657 factual identity card",
    url: "/images/library/site-original/phase372/sailor/shikiori-kusa-asobi-110657.svg",
    summary: "本站原创 factual SVG，表达四个 F SKU 与共同规格边界，不是产品照片、Logo、比例图或颜色校样。",
    locator: "site-original factual SVG metadata",
    registryKey: "fountain-pen-graph-editorial-phase372-kusa",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
  }),
} as const;

const SANSUI_SCOPE = "phase372-sailor-sansui-112050-112051";
const SANSUI = {
  officialEn: source({
    key: "phase372-sansui-official-en",
    title: "SHIKIORI SANSUI Fountain Pen — 11-2050／11-2051",
    url: "https://en.sailor.co.jp/product/11-2050-11-2051/",
    summary: "Sailor 英文官网确认山水四个颜色、11-2050／11-2051 代码、14K Gold MF、C/C、PMMA、φ17×124 mm 和 16.8 g。",
    locator: "description, four item codes, nib, filling, material, size and weight",
    registryKey: "sailor-official-en-phase372-sansui",
    registryName: "The Sailor Pen Co., Ltd.",
  }),
  officialJp: source({
    key: "phase372-sansui-official-jp",
    title: "SHIKIORI―四季織― 山水 万年筆 — 11-2050／11-2051",
    url: "https://sailor.co.jp/product/11-2050/",
    summary: "Sailor 日本官网确认 2023-09-09 发售、¥44,000、14K 中型 MF、四个动物植物主题 SKU、C/C、PMMA 与金属表面处理。",
    locator: "launch date, price, Japanese color names, codes and specifications",
    registryKey: "sailor-official-jp-phase372-sansui",
    registryName: "セーラー万年筆株式会社",
  }),
  topic: source({
    key: "phase372-sansui-topic",
    title: "『SHIKIORI―四季織― 山水』のご紹介 — Sailor",
    url: "https://sailor.co.jp/topics/shikiori_sansui/",
    summary: "Sailor 官方专题说明山水在雨音（2020 年 11 月）之后加入 SHIKIORI，并解释四种动植物主题与透明／半透明树脂路线。",
    locator: "new-product introduction, development context and four motif descriptions",
    registryKey: "sailor-official-topic-phase372-sansui",
    registryName: "セーラー万年筆株式会社",
  }),
  refill: source({
    key: "phase372-sansui-refill",
    title: "万年筆のインク補充方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-refill-ink/",
    summary: "官方补墨页说明 Sailor 墨囊／转换器的安装、吸排和换色排空步骤。",
    locator: "cartridge and converter filling instructions",
    registryKey: "sailor-official-care-phase372-sansui",
    registryName: "セーラー万年筆株式会社",
  }),
  care: source({
    key: "phase372-sansui-care",
    title: "万年筆のお手入れ方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-maintenance/",
    summary: "官方维护页用于清水冲洗、避免整笔浸没和长期保存的边界。",
    locator: "cleaning, storage and maintenance instructions",
    registryKey: "sailor-official-care-phase372-sansui",
    registryName: "セーラー万年筆株式会社",
  }),
  retailer: source({
    key: "phase372-sansui-retailer",
    title: "Sailor Pro Gear Slim Shikiori Sansui Kamoshika — P.W. Akkerman",
    url: "https://www.pwakkerman.com/en/sailor-pro-gear-slim-shikiori-sansui-kamoshika-fountain-pen-%28c%2911-2051-304/info",
    summary: "欧洲专业零售商以 11-2051-304 列出羚羊 Kamoshika，并将其作为 Sailor Pro Gear Slim SHIKIORI 山水款；用于国际商品身份交叉核对。",
    locator: "international retailer listing and 11-2051-304 product identity",
    registryKey: "pwakkerman-phase372-sansui",
    registryName: "P.W. Akkerman",
    sourceType: "retailer",
    tier: "professional_secondary",
    homepageUrl: "https://www.pwakkerman.com/",
    author: "P.W. Akkerman",
  }),
  diagram: source({
    key: "phase372-sansui-svg",
    title: "Sailor SHIKIORI 山水 11-2050／11-2051 factual identity card",
    url: "/images/library/site-original/phase372/sailor/shikiori-sansui-112050-112051.svg",
    summary: "本站原创 factual SVG，表达四个 MF SKU、两种编号和镀层边界，不是产品照片、Logo、比例图或颜色校样。",
    locator: "site-original factual SVG metadata",
    registryKey: "fountain-pen-graph-editorial-phase372-sansui",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
  }),
} as const;

type SourceBundle = Record<string, CuratedSource>;

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
  nib: string;
  fill: string;
  material: string;
  dimensions: string;
  weight: string;
  price: string;
  status: string;
  aliases: Array<{ alias: string; language: string; sourceKey: string; kind?: "alias" | "regional_name"; market?: string }>;
  claims: CuratedClaim[];
  variants: CuratedEntityPack["variants"];
  timeline: CuratedEntityPack["timeline"];
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
    primarySourceKey: S.officialJp.key,
    depthTier: "A",
    aliases: input.aliases,
    sources: sourceList,
    scopes: [
      {
        key: input.scopeKey,
        scopeKey: input.scopeKey,
        market: "Sailor Japan official product page",
        validFrom: input.release.slice(0, 10),
        productionState: "current",
        nibScope: input.nib,
        materialScope: input.material,
        editionScope: input.seriesName,
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
      brandEntityId: PHASE372_SAILOR_BRAND_ID,
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
        evidence(`${input.scopeKey}-brand`, "brand_entity_id", S.officialJp.key, input.scopeKey, "official Sailor product page"),
        evidence(`${input.scopeKey}-series`, "series_name", S.officialJp.key, input.scopeKey, "product title and model code"),
        evidence(`${input.scopeKey}-release`, "release_year", S.officialJp.key, input.scopeKey, "official launch date"),
        evidence(`${input.scopeKey}-origin`, "origin_country", S.officialJp.key, input.scopeKey, "Sailor Japan product context"),
        evidence(`${input.scopeKey}-nib`, "nib", S.officialEn.key, input.scopeKey, "official nib and item-code fields"),
        evidence(`${input.scopeKey}-fill`, "fill_system", S.refill.key, input.scopeKey, "official cartridge and converter instructions"),
        evidence(`${input.scopeKey}-material`, "material", S.officialJp.key, input.scopeKey, "official material and plating fields"),
        evidence(`${input.scopeKey}-dimensions`, "dimensions", S.officialEn.key, input.scopeKey, "official size field"),
        evidence(`${input.scopeKey}-weight`, "weight", S.officialEn.key, input.scopeKey, "official weight field"),
        evidence(`${input.scopeKey}-price`, "price_range", S.officialJp.key, input.scopeKey, "official Japanese price"),
        evidence(`${input.scopeKey}-status`, "status", S.officialJp.key, input.scopeKey, "official current product status"),
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

const kusa = pack({
  entityId: PHASE372_KUSA_ID,
  slug: PHASE372_KUSA_SLUG,
  canonicalName: "写乐 Sailor SHIKIORI 草遊び（11-0657）",
  storyTitle: "写乐 Sailor SHIKIORI 草遊び 11-0657：把草花、溪流和新雪做成 F 尖",
  markdownFile: ".planning/content-research/sailor-shikiori-kusa-asobi-110657-phase372.md",
  scopeKey: KUSA_SCOPE,
  source: KUSA,
  seriesName: "Sailor SHIKIORI 草遊び（Kusa Asobi，11-0657）",
  release: "2024-09-21 日本全国上市",
  nib: "不锈钢 F（细字）尖，Gold IP 处理",
  fill: "墨囊／转换器两用式（cartridge/converter）",
  material: "盖、杆、大先为 PMMA 树脂；笔尖与金属部件为 Gold IP 处理",
  dimensions: "φ17 × 134 mm（含笔夹）",
  weight: "12.2 g",
  price: "日本官方售价 ¥8,800（本体 ¥8,000）；按读取市场与日期",
  status: "2024-09-21 日本全国上市；四个 F 颜色 SKU",
  aliases: [
    { alias: "Sailor SHIKIORI Kusa Asobi", language: "en", sourceKey: KUSA.officialEn.key },
    { alias: "Sailor Shikiori Grass Play", language: "en", sourceKey: KUSA.officialEn.key },
    { alias: "11-0657", language: "en", sourceKey: KUSA.officialEn.key },
    { alias: "11-0657-201", language: "en", sourceKey: KUSA.officialEn.key, kind: "regional_name", market: "Hanakanmuri" },
    { alias: "11-0657-202", language: "en", sourceKey: KUSA.officialEn.key, kind: "regional_name", market: "Sasabune" },
    { alias: "11-0657-203", language: "en", sourceKey: KUSA.officialEn.key, kind: "regional_name", market: "Tsurubami" },
    { alias: "11-0657-204", language: "en", sourceKey: KUSA.officialEn.key, kind: "regional_name", market: "Yuki Usagi" },
    { alias: "SHIKIORI 草遊び", language: "ja", sourceKey: KUSA.officialJp.key },
    { alias: "写乐 四季織 草遊び", language: "zh", sourceKey: KUSA.officialJp.key },
  ],
  claims: [
    claim(KUSA_SCOPE, "phase372-kusa-identity", "model_identity", "11-0657 是 SHIKIORI 草遊び钢笔组的共同主型号，四个完整颜色 SKU 为 11-0657-201 至 204；不是四个互不相关的型号。", KUSA.officialJp.key, "official title and four product codes"),
    claim(KUSA_SCOPE, "phase372-kusa-retailer-identity", "market_listing", "Fontoplumo 以 11-0657-202 列出笹舟 Kusa Asobi，作为国际零售市场的身份交叉核对；经销商页面不替代 Sailor 规格。", KUSA.retailer.key, "professional retailer product code and color listing"),
    claim(KUSA_SCOPE, "phase372-kusa-theme", "design_theme", "草遊び把草花、川の流れ、木の実和新雪等自然触感做成四季織配色；这是设计语境，不是天然材料或实物色样承诺。", KUSA.officialJp.key, "official Japanese product description"),
    claim(KUSA_SCOPE, "phase372-kusa-release", "release_date", "日本官方将 2024 年 9 月 21 日列为草遊び全国上市日。", KUSA.press.key, "official launch notice"),
    claim(KUSA_SCOPE, "phase372-kusa-nib", "nib", "四个颜色共同为不锈钢 F 尖，并做 Gold IP 外观处理；不能把金色镀层写成金尖。", KUSA.officialJp.key, "nib and Gold IP fields"),
    claim(KUSA_SCOPE, "phase372-kusa-filling", "filling_system", "采用墨囊／转换器两用式，不是活塞、真空或滴入式系统。", KUSA.refill.key, "official cartridge and converter instructions"),
    claim(KUSA_SCOPE, "phase372-kusa-material", "material", "盖、杆和大先为 PMMA 树脂；Gold IP 是笔尖与金属件的表面处理名称，不等于整支笔为黄金。", KUSA.officialJp.key, "PMMA and Gold IP specification fields"),
    claim(KUSA_SCOPE, "phase372-kusa-size", "physical_specification", "官方规格为 φ17 mm、含笔夹全长 134 mm、空笔重量 12.2 g。", KUSA.officialEn.key, "size and weight fields"),
    claim(KUSA_SCOPE, "phase372-kusa-price", "market_status", "日本官网当前售价 ¥8,800（本体 ¥8,000）；海外价格、库存与税费不能由此推定。", KUSA.officialJp.key, "current Japanese price and market notice"),
    claim(KUSA_SCOPE, "phase372-kusa-sibling-boundary", "sibling_boundary", "草遊び与山水、雨音、野山の唄同属 SHIKIORI，但产品代码、笔尖材质和上市窗口不同；不能混成一个型号。", KUSA.officialEn.key, "SHIKIORI product family and Kusa Asobi code"),
    claim(KUSA_SCOPE, "phase372-kusa-care", "maintenance_guidance", "换色时排空墨囊或转换器，以室温清水吸排；不要整笔长时间浸泡、用热水、酒精或强溶剂处理。", KUSA.care.key, "official cleaning and storage guidance", "editorial"),
    claim(KUSA_SCOPE, "phase372-kusa-selection", "selection_guidance", "选购应核对 11-0657-20x、F 钢尖、C/C、PMMA、φ17×134 mm 和 12.2 g；看到 14K 或 MF 时应重新辨认是否为其他 SHIKIORI 组。", KUSA.officialJp.key, "code, nib, filling, material, dimensions and weight", "editorial"),
    claim(KUSA_SCOPE, "phase372-kusa-media", "media_identity_boundary", "主图是本站原创四颜色事实 SVG，不复制 Sailor 产品照片或 Logo，也不证明树脂实物颜色、比例或耐光性。", KUSA.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase372-kusa-hanakanmuri", name: "花冠 Hanakanmuri（11-0657-201）", notes: "F 不锈钢尖，草遊び四个颜色之一。", sourceKey: KUSA.officialJp.key, variantKind: "color", productCode: "11-0657-201", market: "日本" },
    { key: "phase372-kusa-sasabune", name: "笹舟 Sasabune（11-0657-202）", notes: "F 不锈钢尖，草遊び四个颜色之一。", sourceKey: KUSA.officialJp.key, variantKind: "color", productCode: "11-0657-202", market: "日本" },
    { key: "phase372-kusa-tsurubami", name: "橡 Tsurubami（11-0657-203）", notes: "F 不锈钢尖，草遊び四个颜色之一。", sourceKey: KUSA.officialJp.key, variantKind: "color", productCode: "11-0657-203", market: "日本" },
    { key: "phase372-kusa-yuki-usagi", name: "雪兎 Yuki Usagi（11-0657-204）", notes: "F 不锈钢尖，草遊び四个颜色之一。", sourceKey: KUSA.officialJp.key, variantKind: "color", productCode: "11-0657-204", market: "日本" },
  ],
  timeline: [{ key: "phase372-kusa-launch", title: "SHIKIORI 草遊び在日本全国上市", eventType: "model_released", startDate: "2024-09-21", circa: false, description: "Sailor 官方新闻稿和日本产品页将 2024 年 9 月 21 日列为 11-0657 草遊び的全国上市日。", sourceKey: KUSA.press.key }],
});

const sansui = pack({
  entityId: PHASE372_SANSUI_ID,
  slug: PHASE372_SANSUI_SLUG,
  canonicalName: "写乐 Sailor SHIKIORI 山水（11-2050／11-2051）",
  storyTitle: "写乐 Sailor SHIKIORI 山水 11-2050／11-2051：14K 中细尖的四种生命主题",
  markdownFile: ".planning/content-research/sailor-shikiori-sansui-112050-112051-phase372.md",
  scopeKey: SANSUI_SCOPE,
  source: SANSUI,
  seriesName: "Sailor SHIKIORI 山水（Sansui，11-2050／11-2051）",
  release: "2023-09-09 日本全国上市",
  nib: "14K 金／中型 MF（中细）",
  fill: "墨囊／转换器两用式（cartridge/converter）",
  material: "盖、杆、大先为 PMMA 树脂；夕燕／駒草为 Gold IP，撫子／羚羊为镍铬镀层并配铑镀笔尖",
  dimensions: "φ17 × 124 mm（含笔夹）",
  weight: "16.8 g",
  price: "日本官方售价 ¥44,000（本体 ¥40,000）；按读取市场与日期",
  status: "2023-09-09 日本全国上市；11-2050 与 11-2051 四个 MF 颜色 SKU",
  aliases: [
    { alias: "Sailor SHIKIORI Sansui", language: "en", sourceKey: SANSUI.officialEn.key },
    { alias: "Sailor Professional Gear Slim Shikiori Sansui", language: "en", sourceKey: SANSUI.retailer.key },
    { alias: "11-2050／11-2051", language: "en", sourceKey: SANSUI.officialEn.key },
    { alias: "11-2050-301", language: "en", sourceKey: SANSUI.officialEn.key, kind: "regional_name", market: "Yutsubame" },
    { alias: "11-2050-302", language: "en", sourceKey: SANSUI.officialEn.key, kind: "regional_name", market: "Komakusa" },
    { alias: "11-2051-303", language: "en", sourceKey: SANSUI.officialEn.key, kind: "regional_name", market: "Nadeshiko" },
    { alias: "11-2051-304", language: "en", sourceKey: SANSUI.officialEn.key, kind: "regional_name", market: "Kamoshika" },
    { alias: "SHIKIORI 山水", language: "ja", sourceKey: SANSUI.officialJp.key },
    { alias: "写乐 四季織 山水", language: "zh", sourceKey: SANSUI.officialJp.key },
  ],
  claims: [
    claim(SANSUI_SCOPE, "phase372-sansui-identity", "model_identity", "11-2050 与 11-2051 是同一 SHIKIORI 山水钢笔组的两个主型号编号，四个完整 SKU 为 11-2050-301、302 与 11-2051-303、304；不是四个独立系列。", SANSUI.officialJp.key, "official title and item-code table"),
    claim(SANSUI_SCOPE, "phase372-sansui-retailer-identity", "market_listing", "P.W. Akkerman 以 11-2051-304 列出羚羊 Kamoshika 的 Pro Gear Slim Shikiori Sansui，用于国际市场身份交叉核对；最终规格仍以 Sailor 官方页为准。", SANSUI.retailer.key, "professional retailer model code and product identity"),
    claim(SANSUI_SCOPE, "phase372-sansui-theme", "design_theme", "山水从山川、溪流和在野外坚韧生长的动植物获得灵感，四个颜色分别对应夕燕、駒草、撫子、羚羊；这是设计主题，不是生物标本或天然材料。", SANSUI.topic.key, "official development article and four motif descriptions"),
    claim(SANSUI_SCOPE, "phase372-sansui-release", "release_date", "日本官方产品页将山水万年笔的全国上市日列为 2023 年 9 月 9 日。", SANSUI.officialJp.key, "official launch date field"),
    claim(SANSUI_SCOPE, "phase372-sansui-nib", "nib", "四个颜色均采用 14K 金中型 MF 尖；不能把 11-2050／11-2051 误写成钢尖或 21K。", SANSUI.officialEn.key, "14K Gold nib and MF item-code fields"),
    claim(SANSUI_SCOPE, "phase372-sansui-filling", "filling_system", "采用墨囊／转换器两用式，不是 Realo 活塞、真空或滴入式大容量系统。", SANSUI.refill.key, "official cartridge and converter instructions"),
    claim(SANSUI_SCOPE, "phase372-sansui-material", "material", "盖、杆和大先为 PMMA 树脂；夕燕与駒草使用 Gold IP，撫子与羚羊使用镍铬镀层，后两色笔尖为铑镀处理。", SANSUI.officialJp.key, "PMMA, Gold IP, nickel-chrome and rhodium fields"),
    claim(SANSUI_SCOPE, "phase372-sansui-size", "physical_specification", "官方规格为 φ17 mm、含笔夹全长 124 mm、空笔重量 16.8 g。", SANSUI.officialEn.key, "size and weight fields"),
    claim(SANSUI_SCOPE, "phase372-sansui-price", "market_status", "日本官网当前售价 ¥44,000（本体 ¥40,000）；价格和库存随市场及日期变化。", SANSUI.officialJp.key, "current Japanese price and market notice"),
    claim(SANSUI_SCOPE, "phase372-sansui-history", "series_history", "山水是在 2020 年 11 月发布的雨音之后加入 SHIKIORI 的新系列；官方专题还把它放在四季織五周年之后的延展中。", SANSUI.topic.key, "official development chronology"),
    claim(SANSUI_SCOPE, "phase372-sansui-sibling-boundary", "sibling_boundary", "山水与草遊び、野山の唄、雨音同属 SHIKIORI，但 11-2050／11-2051 的 14K MF 与其他组的钢尖或不同金尖不能互换描述。", SANSUI.officialEn.key, "SHIKIORI product family and specification boundary"),
    claim(SANSUI_SCOPE, "phase372-sansui-care", "maintenance_guidance", "换色时先排空墨囊或转换器，以室温清水吸排；不要整笔长时间浸泡、用热水、酒精或强溶剂处理镀层。", SANSUI.care.key, "official cleaning and storage guidance", "editorial"),
    claim(SANSUI_SCOPE, "phase372-sansui-selection", "selection_guidance", "选购应核对 11-2050-301／302 或 11-2051-303／304、14K MF、C/C、φ17×124 mm 和 16.8 g；同时确认金色 Gold IP 与银色镍铬／铑镀路线。", SANSUI.officialJp.key, "codes, plating, nib, filling, dimensions and weight", "editorial"),
    claim(SANSUI_SCOPE, "phase372-sansui-media", "media_identity_boundary", "主图是本站原创四颜色事实 SVG，不复制 Sailor 产品照片或 Logo，也不证明树脂实物颜色、比例、批次或耐光性。", SANSUI.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase372-sansui-yutsubame", name: "夕燕 Yutsubame（11-2050-301）", notes: "14K 中型 MF；Gold IP 金色路线。", sourceKey: SANSUI.officialJp.key, variantKind: "color", productCode: "11-2050-301", market: "日本" },
    { key: "phase372-sansui-komakusa", name: "駒草 Komakusa（11-2050-302）", notes: "14K 中型 MF；Gold IP 金色路线。", sourceKey: SANSUI.officialJp.key, variantKind: "color", productCode: "11-2050-302", market: "日本" },
    { key: "phase372-sansui-nadeshiko", name: "撫子 Nadeshiko（11-2051-303）", notes: "14K 中型 MF；镍铬镀层金属件与铑镀笔尖。", sourceKey: SANSUI.officialJp.key, variantKind: "color", productCode: "11-2051-303", market: "日本" },
    { key: "phase372-sansui-kamoshika", name: "羚羊 Kamoshika（11-2051-304）", notes: "14K 中型 MF；镍铬镀层金属件与铑镀笔尖。", sourceKey: SANSUI.officialJp.key, variantKind: "color", productCode: "11-2051-304", market: "日本" },
  ],
  timeline: [{ key: "phase372-sansui-launch", title: "SHIKIORI 山水在日本全国上市", eventType: "model_released", startDate: "2023-09-09", circa: false, description: "Sailor 日本产品页将 2023 年 9 月 9 日列为 11-2050／11-2051 山水万年笔的全国上市日。", sourceKey: SANSUI.officialJp.key }],
});

export const phase372SailorShikioriKusaAsobiSansuiPacks: CuratedEntityPack[] = [brand, kusa, sansui];
export const phase372SailorShikioriKusaAsobiPacks: CuratedEntityPack[] = [brand, kusa];
export const phase372SailorShikioriSansuiPacks: CuratedEntityPack[] = [brand, sansui];
