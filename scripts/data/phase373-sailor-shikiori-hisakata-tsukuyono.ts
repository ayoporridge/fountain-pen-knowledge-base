import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase33Sailor2026CurrentPacks } from "./phase33-sailor-2026-current";

export const PHASE373_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE373_HISAKATA_ID = "phase373-sailor-shikiori-hisakata-110500";
export const PHASE373_HISAKATA_SLUG = "sailor-shikiori-hisakata";
export const PHASE373_TSUKUYONO_ID = "phase373-sailor-shikiori-tsukuyono-minamo-110558";
export const PHASE373_TSUKUYONO_SLUG = "sailor-shikiori-tsukuyono-minamo";

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
    (pack) => pack.entityId === PHASE373_SAILOR_BRAND_ID && pack.expectedType === "brand",
  ),
);
if (!brand) throw new Error("Phase 373 Sailor brand pack missing.");
brand.key = "phase373-sailor-brand-v1";

type SourceBundle = Record<string, CuratedSource>;

const HISAKATA_SCOPE = "phase373-sailor-hisakata-110500";
const HISAKATA = {
  officialEn: source({
    key: "phase373-hisakata-official-en",
    title: "SHIKIORI HISAKATA Fountain Pen — 11-0500",
    url: "https://en.sailor.co.jp/product/11-0500/",
    summary: "Sailor 英文官网确认ひさかた主题、四个颜色代码、F 不锈钢尖、C/C、AS/PMMA 树脂、φ17×134 mm 和 12.2 g。",
    locator: "series description, item codes, nib, filling, material, size and weight",
    registryKey: "sailor-official-en-phase373-hisakata",
    registryName: "The Sailor Pen Co., Ltd.",
  }),
  officialJp: source({
    key: "phase373-hisakata-official-jp",
    title: "SHIKIORI―四季織― ひさかた 万年筆 — 11-0500",
    url: "https://sailor.co.jp/product/11-0500/",
    summary: "Sailor 日本官网确认当前 ¥6,600、四个 F 代码、三色 AS 树脂与うちみず自 2021-06-24 改为 PMMA，以及镍铬镀层和 PG-03W。",
    locator: "current price, Japanese color codes, resin boundary, plating, size, weight and package",
    registryKey: "sailor-official-jp-phase373-hisakata",
    registryName: "セーラー万年筆株式会社",
  }),
  collection: source({
    key: "phase373-hisakata-collection",
    title: "HISAKATA | Collections — SHIKIORI Official Website",
    url: "https://shikiori-en.sailor.co.jp/collections/hisakata/",
    summary: "SHIKIORI 官方系列页说明ひさかた以季节短瞬的颜色为主题，并列出 Sakura、Uchimizu、Akanezora、Hoshikuzu 四个钢尖颜色。",
    locator: "collection theme and four fountain-pen products",
    registryKey: "sailor-shikiori-official-phase373-hisakata",
    registryName: "SHIKIORI official website",
    homepageUrl: "https://shikiori-en.sailor.co.jp/",
  }),
  archive: source({
    key: "phase373-hisakata-catalogue",
    title: "Sailor 2023–2024 official catalogue index 57",
    url: "https://sailor.co.jp/book_2023-2024/pageindices/index57.html",
    summary: "Sailor 官方 2023–2024 目录把 11-0500 的四个颜色、F 不锈钢尖、AS 树脂与镍铬镀层列在同一商品组，作为时间与历史规格边界。",
    locator: "catalogue index 57: 11-0500 codes, F steel nib and material/plating fields",
    registryKey: "sailor-official-catalogue-phase373-hisakata",
    registryName: "セーラー万年筆株式会社",
    tier: "contemporary_archive",
  }),
  refill: source({
    key: "phase373-hisakata-refill",
    title: "万年筆のインク補充方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-refill-ink/",
    summary: "官方补墨页说明 Sailor 墨囊／转换器安装、吸排与换色排空步骤。",
    locator: "cartridge and converter filling instructions",
    registryKey: "sailor-official-care-phase373-hisakata",
    registryName: "セーラー万年筆株式会社",
  }),
  care: source({
    key: "phase373-hisakata-care",
    title: "万年筆のお手入れ方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-maintenance/",
    summary: "官方维护页用于清水冲洗、避免整笔浸没和长期保存的边界。",
    locator: "cleaning, storage and maintenance instructions",
    registryKey: "sailor-official-care-phase373-hisakata",
    registryName: "セーラー万年筆株式会社",
  }),
  retailer: source({
    key: "phase373-hisakata-retailer",
    title: "Sailor Shikiori Hisakata Fountain Pen Sakura — WRITER Stationery Store",
    url: "https://writer.my/products/sailor-shikiori-hisakata-fountain-pen-sakura?variant=42801927225592",
    summary: "专业文具零售商以 11-0500-231 标识 Sakura，并列出四个颜色与 F 钢尖，用于国际市场身份交叉核对；规格主张仍以 Sailor 为准。",
    locator: "11-0500-231 product code and four-color listing",
    registryKey: "writer-stationery-phase373-hisakata",
    registryName: "WRITER Stationery Store",
    sourceType: "retailer",
    tier: "professional_secondary",
    homepageUrl: "https://writer.my/",
    author: "WRITER Stationery Store",
  }),
  diagram: source({
    key: "phase373-hisakata-svg",
    title: "Sailor SHIKIORI ひさかた 11-0500 factual identity card",
    url: "/images/library/site-original/phase373/sailor/shikiori-hisakata-110500.svg",
    summary: "本站原创 factual SVG，表达四个 F SKU 和 Uchimizu 树脂变更边界，不是产品照片、Logo、比例图或颜色校样。",
    locator: "site-original factual SVG metadata",
    registryKey: "fountain-pen-graph-editorial-phase373-hisakata",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
  }),
} as const;

const TSUKUYONO_SCOPE = "phase373-sailor-tsukuyono-minamo-110558";
const TSUKUYONO = {
  officialEn: source({
    key: "phase373-tsukuyono-official-en",
    title: "SHIKIORI TSUKUYONO MINAMO Fountain Pen — 11-0558",
    url: "https://en.sailor.co.jp/product/11-0558/",
    summary: "Sailor 英文官网确认月夜の水面主题、四个颜色代码、F 不锈钢尖、C/C、AS 树脂、φ17×134 mm 和 12.2 g。",
    locator: "series description, item codes, nib, filling, material, size and weight",
    registryKey: "sailor-official-en-phase373-tsukuyono",
    registryName: "The Sailor Pen Co., Ltd.",
  }),
  officialJp: source({
    key: "phase373-tsukuyono-official-jp",
    title: "SHIKIORI―四季織― 月夜の水面 万年筆 — 11-0558",
    url: "https://sailor.co.jp/product/11-0558/",
    summary: "Sailor 日本官网确认当前 ¥6,600、夜桜／夜焚／夜長／霜夜四个 F 代码、AS 树脂、Gold IP 和 PG-03W。",
    locator: "current price, Japanese color codes, material, plating, size, weight and package",
    registryKey: "sailor-official-jp-phase373-tsukuyono",
    registryName: "セーラー万年筆株式会社",
  }),
  collection: source({
    key: "phase373-tsukuyono-collection",
    title: "TSUKUYONO MINAMO | Collections — SHIKIORI Official Website",
    url: "https://shikiori-en.sailor.co.jp/collections/tsukuyonominamo/",
    summary: "SHIKIORI 官方系列页说明月夜の水面以黑暗中映出的月光和水面为主题，并列出 Yozakura、Yodaki、Yonaga、Shimoyo 四个钢尖颜色。",
    locator: "collection story, seasonal motifs and four fountain-pen products",
    registryKey: "sailor-shikiori-official-phase373-tsukuyono",
    registryName: "SHIKIORI official website",
    homepageUrl: "https://shikiori-en.sailor.co.jp/",
  }),
  archive: source({
    key: "phase373-tsukuyono-catalogue",
    title: "Sailor 2023–2024 official catalogue index 57",
    url: "https://sailor.co.jp/book_2023-2024/pageindices/index57.html",
    summary: "Sailor 官方 2023–2024 目录把 11-0558 的四个颜色、F 不锈钢尖、AS 树脂和 Gold IP 列在同一商品组，作为历史与规格交叉证据。",
    locator: "catalogue index 57: 11-0558 codes, F steel nib and Gold IP fields",
    registryKey: "sailor-official-catalogue-phase373-tsukuyono",
    registryName: "セーラー万年筆株式会社",
    tier: "contemporary_archive",
  }),
  refill: source({
    key: "phase373-tsukuyono-refill",
    title: "万年筆のインク補充方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-refill-ink/",
    summary: "官方补墨页说明 Sailor 墨囊／转换器安装、吸排与换色排空步骤。",
    locator: "cartridge and converter filling instructions",
    registryKey: "sailor-official-care-phase373-tsukuyono",
    registryName: "セーラー万年筆株式会社",
  }),
  care: source({
    key: "phase373-tsukuyono-care",
    title: "万年筆のお手入れ方法 — Sailor 官方",
    url: "https://sailor.co.jp/topics/fountain-pen-maintenance/",
    summary: "官方维护页用于清水冲洗、避免整笔浸没和长期保存的边界。",
    locator: "cleaning, storage and maintenance instructions",
    registryKey: "sailor-official-care-phase373-tsukuyono",
    registryName: "セーラー万年筆株式会社",
  }),
  retailer: source({
    key: "phase373-tsukuyono-retailer",
    title: "Sailor Shikiori Shimoyo Light Blue Fountain Pen — Pen Heaven",
    url: "https://www.penheaven.com/sailor-shikiori-shimoyo-light-blue-fountain-pen",
    summary: "专业零售商以 11-0558-204 标识霜夜 Shimoyo 的 F 钢尖商品，用于国际市场身份交叉核对；规格仍以 Sailor 官网为准。",
    locator: "11-0558-204 product code and Shimoyo identity",
    registryKey: "penheaven-phase373-tsukuyono",
    registryName: "Pen Heaven",
    sourceType: "retailer",
    tier: "professional_secondary",
    homepageUrl: "https://www.penheaven.com/",
    author: "Pen Heaven",
  }),
  diagram: source({
    key: "phase373-tsukuyono-svg",
    title: "Sailor SHIKIORI 月夜の水面 11-0558 factual identity card",
    url: "/images/library/site-original/phase373/sailor/shikiori-tsukuyono-minamo-110558.svg",
    summary: "本站原创 factual SVG，表达四个 F SKU、夜色主题和 Gold IP 边界，不是产品照片、Logo、比例图或颜色校样。",
    locator: "site-original factual SVG metadata",
    registryKey: "fountain-pen-graph-editorial-phase373-tsukuyono",
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
  aliases: Array<{ alias: string; language: string; sourceKey: string; kind?: "alias" | "regional_name"; market?: string }>;
  claims: CuratedClaim[];
  variants: CuratedEntityPack["variants"];
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
        validFrom: input.validFrom,
        productionState: "current",
        nibScope: input.nib,
        materialScope: input.material,
        editionScope: input.seriesName,
      },
      {
        key: `${input.scopeKey}-archive-boundary`,
        scopeKey: `${input.scopeKey}-archive-boundary`,
        validFrom: "2019",
        productionState: "historical",
        editionScope: "official catalogue window; exact first-release date not inferred",
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
      brandEntityId: PHASE373_SAILOR_BRAND_ID,
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
        evidence(`${input.scopeKey}-release`, "release_year", S.archive.key, input.scopeKey, "official catalogue time boundary; no exact first release inferred"),
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
  };
}

const hisakata = pack({
  entityId: PHASE373_HISAKATA_ID,
  slug: PHASE373_HISAKATA_SLUG,
  canonicalName: "写乐 Sailor SHIKIORI ひさかた（11-0500）",
  storyTitle: "写乐 Sailor SHIKIORI ひさかた 11-0500：把季节一瞬留在 F 尖钢笔里",
  markdownFile: ".planning/content-research/sailor-shikiori-hisakata-110500-phase373.md",
  scopeKey: HISAKATA_SCOPE,
  source: HISAKATA,
  seriesName: "Sailor SHIKIORI ひさかた（Hisakata，11-0500）",
  release: "至少 2019–2020 官方目录已列；现行产品页未给精确首发日",
  validFrom: "2019",
  nib: "不锈钢 F（细字）尖",
  fill: "墨囊／转换器两用式（cartridge/converter）",
  material: "Sakura／Akanezora／Hoshikuzu 为 AS 树脂；Uchimizu 自 2021-06-24 起为 PMMA；金属件镍铬镀层",
  dimensions: "φ17 × 134 mm（含笔夹）",
  weight: "12.2 g",
  price: "日本官方当前售价 ¥6,600（本体 ¥6,000）；按读取市场与日期",
  status: "现行日本官网列出四个 F 颜色 SKU；首发日期未由当前官方页明确给出",
  aliases: [
    { alias: "Sailor SHIKIORI Hisakata", language: "en", sourceKey: HISAKATA.officialEn.key },
    { alias: "Sailor Shikiori Procolor 500 Hisakata", language: "en", sourceKey: HISAKATA.archive.key },
    { alias: "11-0500", language: "en", sourceKey: HISAKATA.officialEn.key },
    { alias: "11-0500-231", language: "en", sourceKey: HISAKATA.officialEn.key, kind: "regional_name", market: "Sakura" },
    { alias: "11-0500-242", language: "en", sourceKey: HISAKATA.officialEn.key, kind: "regional_name", market: "Uchimizu" },
    { alias: "11-0500-233", language: "en", sourceKey: HISAKATA.officialEn.key, kind: "regional_name", market: "Akanezora" },
    { alias: "11-0500-249", language: "en", sourceKey: HISAKATA.officialEn.key, kind: "regional_name", market: "Hoshikuzu" },
    { alias: "SHIKIORI ひさかた", language: "ja", sourceKey: HISAKATA.officialJp.key },
    { alias: "写乐 四季織 ひさかた", language: "zh", sourceKey: HISAKATA.officialJp.key },
  ],
  claims: [
    claim(HISAKATA_SCOPE, "phase373-hisakata-identity", "model_identity", "11-0500 是 SHIKIORI ひさかた的共同主型号，四个完整颜色 SKU 为 11-0500-231、242、233、249；不是四个独立系列。", HISAKATA.officialJp.key, "official title and four product codes"),
    claim(HISAKATA_SCOPE, "phase373-hisakata-retailer-identity", "market_listing", "WRITER Stationery Store 以 11-0500-231 列出 Sakura ひさかた，并列出四个颜色和 F 钢尖，作为国际零售身份交叉核对。", HISAKATA.retailer.key, "professional retailer code and family listing"),
    claim(HISAKATA_SCOPE, "phase373-hisakata-theme", "design_theme", "ひさかた把樱花、水花、晚霞和星光等季节短瞬做成颜色主题；设计叙事不等于天然材料或实物色样。", HISAKATA.collection.key, "official collection theme and seasonal motifs"),
    claim(HISAKATA_SCOPE, "phase373-hisakata-history", "history_boundary", "官方 2023–2024 目录已列出 11-0500 四色 F 钢尖；当前产品页未给精确首发日，因此只记录目录时间边界。", HISAKATA.archive.key, "official catalogue window"),
    claim(HISAKATA_SCOPE, "phase373-hisakata-nib", "nib", "四个颜色均为不锈钢 F 尖；金属件为镍铬镀层，不能把旧商品标题中的 Procolor 或金色照片写成金尖。", HISAKATA.officialJp.key, "nib and plating fields"),
    claim(HISAKATA_SCOPE, "phase373-hisakata-filling", "filling_system", "采用墨囊／转换器两用式，不是活塞、真空或滴入式大容量系统。", HISAKATA.refill.key, "official cartridge and converter instructions"),
    claim(HISAKATA_SCOPE, "phase373-hisakata-material", "material", "Sakura、Akanezora、Hoshikuzu 使用 AS 树脂；Uchimizu 的当前官方页特别注明自 2021-06-24 起改为 PMMA，不能把一次材料描述覆盖所有批次。", HISAKATA.officialJp.key, "color-specific AS/PMMA boundary and date"),
    claim(HISAKATA_SCOPE, "phase373-hisakata-size", "physical_specification", "官方规格为 φ17 mm、含笔夹全长 134 mm、空笔重量 12.2 g。", HISAKATA.officialEn.key, "size and weight fields"),
    claim(HISAKATA_SCOPE, "phase373-hisakata-price", "market_status", "日本官网当前售价 ¥6,600（本体 ¥6,000）；海外库存、税费与到手价不能由此推定。", HISAKATA.officialJp.key, "current Japanese price and market notice"),
    claim(HISAKATA_SCOPE, "phase373-hisakata-sibling-boundary", "sibling_boundary", "ひさかた与月夜の水面、草遊び同属 SHIKIORI，但编号、颜色和材料边界不同；Uchimizu 的 PMMA 变更也不应扩写到其他颜色。", HISAKATA.officialEn.key, "series and specification boundary"),
    claim(HISAKATA_SCOPE, "phase373-hisakata-care", "maintenance_guidance", "换色时排空墨囊或转换器，用室温清水吸排；不要整笔长时间浸泡、用热水、酒精或强溶剂处理镍铬镀层。", HISAKATA.care.key, "official cleaning and storage guidance", "editorial"),
    claim(HISAKATA_SCOPE, "phase373-hisakata-selection", "selection_guidance", "选购应核对 11-0500-20x 完整代码、F 钢尖、C/C、φ17×134 mm、12.2 g，以及 Uchimizu 的当前 PMMA 与其他三色 AS 树脂差异。", HISAKATA.officialJp.key, "code, nib, filling, material, dimensions and weight", "editorial"),
    claim(HISAKATA_SCOPE, "phase373-hisakata-media", "media_identity_boundary", "主图是本站原创四颜色事实 SVG，不复制 Sailor 产品照片或 Logo，也不证明树脂实物颜色、批次、比例或耐光性。", HISAKATA.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase373-hisakata-sakura", name: "さくら Sakura（11-0500-231）", notes: "F 不锈钢尖，AS 树脂路线。", sourceKey: HISAKATA.officialJp.key, variantKind: "color", productCode: "11-0500-231", market: "日本" },
    { key: "phase373-hisakata-uchimizu", name: "うちみず Uchimizu（11-0500-242）", notes: "F 不锈钢尖；当前官方页注明自 2021-06-24 起使用 PMMA 树脂。", sourceKey: HISAKATA.officialJp.key, variantKind: "color", productCode: "11-0500-242", market: "日本" },
    { key: "phase373-hisakata-akanezora", name: "あかねぞら Akanezora（11-0500-233）", notes: "F 不锈钢尖，AS 树脂路线。", sourceKey: HISAKATA.officialJp.key, variantKind: "color", productCode: "11-0500-233", market: "日本" },
    { key: "phase373-hisakata-hoshikuzu", name: "ほしくず Hoshikuzu（11-0500-249）", notes: "F 不锈钢尖，AS 树脂路线。", sourceKey: HISAKATA.officialJp.key, variantKind: "color", productCode: "11-0500-249", market: "日本" },
  ],
});

const tsukuyono = pack({
  entityId: PHASE373_TSUKUYONO_ID,
  slug: PHASE373_TSUKUYONO_SLUG,
  canonicalName: "写乐 Sailor SHIKIORI 月夜の水面（11-0558）",
  storyTitle: "写乐 Sailor SHIKIORI 月夜の水面 11-0558：暗夜水面的四个 F 尖颜色",
  markdownFile: ".planning/content-research/sailor-shikiori-tsukuyono-minamo-110558-phase373.md",
  scopeKey: TSUKUYONO_SCOPE,
  source: TSUKUYONO,
  seriesName: "Sailor SHIKIORI 月夜の水面（Tsukuyono Minamo，11-0558）",
  release: "至少 2019–2020 官方目录已列；现行产品页未给精确首发日",
  validFrom: "2019",
  nib: "不锈钢 F（细字）尖，Gold IP 处理",
  fill: "墨囊／转换器两用式（cartridge/converter）",
  material: "盖、杆和大先为 AS 树脂；笔尖与金属部件为 Gold IP 处理",
  dimensions: "φ17 × 134 mm（含笔夹）",
  weight: "12.2 g",
  price: "日本官方当前售价 ¥6,600（本体 ¥6,000）；按读取市场与日期",
  status: "现行日本官网列出四个 F 颜色 SKU；首发日期未由当前官方页明确给出",
  aliases: [
    { alias: "Sailor SHIKIORI TSUKUYONO MINAMO", language: "en", sourceKey: TSUKUYONO.officialEn.key },
    { alias: "Sailor Shikiori Moonlit Water Surface", language: "en", sourceKey: TSUKUYONO.collection.key },
    { alias: "11-0558", language: "en", sourceKey: TSUKUYONO.officialEn.key },
    { alias: "11-0558-201", language: "en", sourceKey: TSUKUYONO.officialEn.key, kind: "regional_name", market: "Yozakura" },
    { alias: "11-0558-202", language: "en", sourceKey: TSUKUYONO.officialEn.key, kind: "regional_name", market: "Yodaki" },
    { alias: "11-0558-203", language: "en", sourceKey: TSUKUYONO.officialEn.key, kind: "regional_name", market: "Yonaga" },
    { alias: "11-0558-204", language: "en", sourceKey: TSUKUYONO.officialEn.key, kind: "regional_name", market: "Shimoyo" },
    { alias: "SHIKIORI 月夜の水面", language: "ja", sourceKey: TSUKUYONO.officialJp.key },
    { alias: "写乐 四季織 月夜之水面", language: "zh", sourceKey: TSUKUYONO.officialJp.key },
  ],
  claims: [
    claim(TSUKUYONO_SCOPE, "phase373-tsukuyono-identity", "model_identity", "11-0558 是 SHIKIORI 月夜の水面的共同主型号，四个完整颜色 SKU 为 11-0558-201 至 204；不是四个独立系列。", TSUKUYONO.officialJp.key, "official title and four product codes"),
    claim(TSUKUYONO_SCOPE, "phase373-tsukuyono-retailer-identity", "market_listing", "Pen Heaven 以 11-0558-204 标识霜夜 Shimoyo 的 F 钢尖商品，作为国际零售市场的身份交叉核对；经销商页面不替代 Sailor 规格。", TSUKUYONO.retailer.key, "professional retailer code and Shimoyo identity"),
    claim(TSUKUYONO_SCOPE, "phase373-tsukuyono-theme", "design_theme", "月夜の水面以黑暗中的月光和水面倒影表达季节场景，四个颜色分别对应夜桜、夜焚、夜長、霜夜；这是设计主题，不是夜光材料承诺。", TSUKUYONO.collection.key, "official collection story and seasonal motifs"),
    claim(TSUKUYONO_SCOPE, "phase373-tsukuyono-history", "history_boundary", "官方 2023–2024 目录已列出 11-0558 四色 F 钢尖；当前产品页未给精确首发日，因此只记录目录时间边界。", TSUKUYONO.archive.key, "official catalogue window"),
    claim(TSUKUYONO_SCOPE, "phase373-tsukuyono-nib", "nib", "四个颜色均为不锈钢 F 尖并采用 Gold IP 处理；金色外观不能写成 14K 或 21K 金尖。", TSUKUYONO.officialJp.key, "stainless nib and Gold IP fields"),
    claim(TSUKUYONO_SCOPE, "phase373-tsukuyono-filling", "filling_system", "采用墨囊／转换器两用式，不是活塞、真空或滴入式大容量系统。", TSUKUYONO.refill.key, "official cartridge and converter instructions"),
    claim(TSUKUYONO_SCOPE, "phase373-tsukuyono-material", "material", "盖、杆和大先为 AS 树脂；Gold IP 是笔尖与金属件的表面处理名称，不等于整支笔为黄金。", TSUKUYONO.officialJp.key, "AS resin and Gold IP fields"),
    claim(TSUKUYONO_SCOPE, "phase373-tsukuyono-size", "physical_specification", "官方规格为 φ17 mm、含笔夹全长 134 mm、空笔重量 12.2 g。", TSUKUYONO.officialEn.key, "size and weight fields"),
    claim(TSUKUYONO_SCOPE, "phase373-tsukuyono-price", "market_status", "日本官网当前售价 ¥6,600（本体 ¥6,000）；海外价格、库存与税费不能由此推定。", TSUKUYONO.officialJp.key, "current Japanese price and market notice"),
    claim(TSUKUYONO_SCOPE, "phase373-tsukuyono-sibling-boundary", "sibling_boundary", "月夜の水面与ひさかた、草遊び同属 SHIKIORI，但 11-0558 的夜景主题、Gold IP 和 F 钢尖不能与其他颜色组混写。", TSUKUYONO.officialEn.key, "series and specification boundary"),
    claim(TSUKUYONO_SCOPE, "phase373-tsukuyono-care", "maintenance_guidance", "换色时排空墨囊或转换器，用室温清水吸排；不要整笔长时间浸泡、用热水、酒精或强溶剂处理 Gold IP 镀层。", TSUKUYONO.care.key, "official cleaning and storage guidance", "editorial"),
    claim(TSUKUYONO_SCOPE, "phase373-tsukuyono-selection", "selection_guidance", "选购应核对 11-0558-20x 完整代码、F 钢尖、C/C、AS 树脂、Gold IP、φ17×134 mm 和 12.2 g；夜色照片不能替代型号代码。", TSUKUYONO.officialJp.key, "code, nib, filling, material, dimensions and weight", "editorial"),
    claim(TSUKUYONO_SCOPE, "phase373-tsukuyono-media", "media_identity_boundary", "主图是本站原创四颜色事实 SVG，不复制 Sailor 产品照片或 Logo，也不证明树脂实物颜色、比例、批次或夜光效果。", TSUKUYONO.diagram.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: "phase373-tsukuyono-yozakura", name: "夜桜 Yozakura（11-0558-201）", notes: "F 不锈钢尖，Gold IP 路线。", sourceKey: TSUKUYONO.officialJp.key, variantKind: "color", productCode: "11-0558-201", market: "日本" },
    { key: "phase373-tsukuyono-yodaki", name: "夜焚 Yodaki（11-0558-202）", notes: "F 不锈钢尖，Gold IP 路线。", sourceKey: TSUKUYONO.officialJp.key, variantKind: "color", productCode: "11-0558-202", market: "日本" },
    { key: "phase373-tsukuyono-yonaga", name: "夜長 Yonaga（11-0558-203）", notes: "F 不锈钢尖，Gold IP 路线。", sourceKey: TSUKUYONO.officialJp.key, variantKind: "color", productCode: "11-0558-203", market: "日本" },
    { key: "phase373-tsukuyono-shimoyo", name: "霜夜 Shimoyo（11-0558-204）", notes: "F 不锈钢尖，Gold IP 路线。", sourceKey: TSUKUYONO.officialJp.key, variantKind: "color", productCode: "11-0558-204", market: "日本" },
  ],
});

export const phase373SailorShikioriHisakataTsukuyonoPacks: CuratedEntityPack[] = [brand, hisakata, tsukuyono];
