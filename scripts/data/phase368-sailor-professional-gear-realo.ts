import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase33Sailor2026CurrentPacks } from "./phase33-sailor-2026-current";

export const PHASE368_SAILOR_BRAND_ID = "ce2dcqixqSCx";
export const PHASE368_REALO_ID = "phase368-sailor-professional-gear-realo-113926";
export const PHASE368_REALO_SLUG = "sailor-professional-gear-realo";

const RETRIEVED = "2026-08-03";
const MODEL_SCOPE = "phase368-sailor-professional-gear-realo-113926";

function web(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  registryKey?: string;
  registryName?: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  homepageUrl?: string;
  author?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const registryKey = input.registryKey ?? "sailor-official-phase368";
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
    tier: input.tier ?? (sourceType === "retailer" ? "professional_secondary" : "primary"),
    independenceGroup: registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://sailor.co.jp/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author: input.author ?? (sourceType === "official" ? "セーラー万年筆株式会社" : registryName),
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
    confidence: factClass === "core" ? 0.98 : 0.94,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: MODEL_SCOPE, locator }],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

const S = {
  official: web({
    key: "phase368-sailor-pgrealo-official",
    title: "プロフェッショナルギア レアロ万年筆 — 11-3926",
    url: "https://sailor.co.jp/product/11-3926/",
    summary:
      "Sailor 日本官网当前页将 11-3926 单列为 Professional Gear Realo：黑色 F/M/B 与 Maroon F/M 代码，21K 大型双色尖、尾栓回转吸入、PMMA、Gold IP、约 1 cc、φ18×135 mm、21.0 g，含税 ¥52,800，并标注库存售罄后结束销售。",
    locator: "current product title, stock-boundary notice, product codes, nib, filling, material, capacity, size, weight and price",
  }),
  refill: web({
    key: "phase368-sailor-pgrealo-refill",
    title: "万年筆のインク補充方法 — 尾栓回転吸入式",
    url: "https://sailor.co.jp/topics/fountain-pen-refill-ink/",
    summary:
      "Sailor 官方补墨说明把 Realo 定义为胴内直接储墨的尾栓回转吸入式，明确不能使用墨囊或 converter，并给出旋尾栓、浸入笔尖、缓慢吸墨和擦净笔尖的步骤。",
    locator: "Realo refill section and explicit cartridge/converter exclusion",
  }),
  care: web({
    key: "phase368-sailor-pgrealo-care",
    title: "万年筆のお手入れ方法 — Realo 清洗",
    url: "https://sailor.co.jp/topics/fountain-pen-maintenance/",
    summary:
      "Sailor 官方维护页建议 Realo 先推出残墨，再以清水吸入／排出多次；不要让水越过大先环，也不要把整支笔浸入水中，避免水从尾栓缝隙进入。",
    locator: "Realo cleaning steps, waterline warning and drying guidance",
  }),
  coating: web({
    key: "phase368-sailor-pgrealo-coating",
    title: "製品の仕様変更（メッキ加工）についてのご案内",
    url: "https://sailor.co.jp/important_news/20240801/",
    summary:
      "2024-08-01 公告把 11-3926 列入金属小件由传统金镀层向 Gold IP 逐步切换的产品；预计 2024 年 9 月以后按生产批次顺次生产，双色尖表面处理不变。",
    locator: "2024-08-01 coating-change notice, target list containing 11-3926 and bicolor-nib exception",
  }),
  archive: web({
    key: "phase368-sailor-pgrealo-archive",
    title: "SAILOR 2019–2020 官方目录索引第 62 页",
    url: "https://sailor.co.jp/book_2019-2020/pageindices/index62.html",
    summary:
      "Sailor 官方旧目录已经列出 11-3926 的黑色与 Maroon 代码、21K 大型双色尖、尾栓回转吸入、PMMA、旧金镀层与更宽尖幅；这里只作为历史／地区 SKU 边界。",
    locator: "2019–2020 catalogue page 62: 11-3926 code groups, nib widths and archived dimensions",
    tier: "contemporary_archive",
    registryKey: "sailor-official-catalogue-phase368",
  }),
  retailer: web({
    key: "phase368-sailor-pgrealo-goulet",
    title: "Sailor Pro Gear Realo Fountain Pen — Black/Gold",
    url: "https://www.gouletpens.com/collections/sailor-pro-gear-realo-fountain-pens/products/sailor-pro-gear-realo-fountain-pen-black-gold?variant=31829012086827",
    summary:
      "Goulet Pens 的国际市场页面以 SL-11-3926-420 列出黑色 Pro Gear Realo，交叉描述平顶外形、内部活塞、墨水窗与金色饰件；该页当前缺货，不能替代 Sailor 官方现行规格或库存。",
    locator: "product code, black/gold name, piston mechanism, ink window and flat-top description",
    sourceType: "retailer",
    tier: "professional_secondary",
    registryKey: "goulet-pens-phase368",
    registryName: "Goulet Pen Company",
    homepageUrl: "https://www.gouletpens.com/",
    author: "Goulet Pen Company",
  }),
  diagram: web({
    key: "phase368-sailor-pgrealo-svg",
    title: "Sailor Professional Gear Realo 11-3926 factual identity card",
    url: "/images/library/site-original/phase368/sailor/professional-gear-realo-113926.svg",
    summary: "本站原创 factual SVG；只呈现 11-3926 的代码、上墨方式和版本边界，非产品照片。",
    locator: "site-original factual SVG metadata",
    sourceType: "user_submission",
    registryKey: "fountain-pen-graph-editorial-phase368",
  }),
} as const;

const brand = structuredClone(
  phase33Sailor2026CurrentPacks.find(
    (pack) => pack.entityId === PHASE368_SAILOR_BRAND_ID && pack.expectedType === "brand",
  ),
);
if (!brand) throw new Error("Phase 368 Sailor brand pack missing.");
brand.key = "phase368-sailor-brand-v1";

const model: CuratedEntityPack = {
  key: "phase368-sailor-professional-gear-realo-113926-v1",
  entityId: PHASE368_REALO_ID,
  expectedType: "pen",
  expectedSlug: PHASE368_REALO_SLUG,
  canonicalName: "Sailor Professional Gear Realo（11-3926）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/sailor-professional-gear-realo-113926-phase368.md",
  storyTitle: "Sailor Professional Gear Realo 11-3926：全尺寸平顶与尾栓回转吸入",
  primarySourceKey: S.official.key,
  depthTier: "A",
  aliases: [
    { alias: "Sailor Professional Gear Realo", language: "en", sourceKey: S.official.key },
    { alias: "Sailor Pro Gear Realo", language: "en", sourceKey: S.retailer.key },
    { alias: "Professional Gear Realo 11-3926", language: "en", sourceKey: S.official.key },
    { alias: "プロフェッショナルギア レアロ", language: "ja", sourceKey: S.official.key },
    { alias: "写乐 Professional Gear Realo", language: "zh", sourceKey: S.official.key },
    { alias: "写乐 PG Realo 11-3926", language: "zh", sourceKey: S.retailer.key },
  ],
  sources: [S.official, S.refill, S.care, S.coating, S.archive, S.retailer, S.diagram],
  scopes: [
    {
      key: MODEL_SCOPE,
      scopeKey: MODEL_SCOPE,
      market: "Sailor Japan official current product page",
      validFrom: "2024-09",
      productionState: "current",
      nibScope: "21K large bicolor; current page F/M/B black and F/M Maroon",
      materialScope: "PMMA body and Gold IP metal parts; coating varies by production batch",
      editionScope: "11-3926 current black and Maroon routes only",
    },
    {
      key: "phase368-pgrealo-archive-boundary",
      scopeKey: "phase368-pgrealo-archive-boundary",
      productionState: "historical",
      editionScope: "2019–2020 official catalogue widths and old coating are historical/market evidence, not a universal current SKU list",
    },
    {
      key: "phase368-pgrealo-care-boundary",
      scopeKey: "phase368-pgrealo-care-boundary",
      productionState: "current",
      editionScope: "Realo piston-filling care; excludes cartridge/converter and ordinary Professional Gear procedures",
    },
    {
      key: "phase368-pgrealo-media-boundary",
      scopeKey: "phase368-pgrealo-media-boundary",
      productionState: "current",
      editionScope: "site-original factual SVG; not product photography or colour proof",
    },
  ],
  claims: [
    claim(
      "phase368-realo-identity",
      "model_identity",
      "11-3926 是 Sailor Professional Gear Realo 的独立型号，保留全尺寸平顶 Professional Gear 外形，但使用尾栓回转吸入，不是 Profit Realo 18 或普通 converter 型 Professional Gear。",
      S.official.key,
      "current product title and filling system",
    ),
    claim(
      "phase368-realo-international-code",
      "international_listing",
      "Goulet Pens 以 SL-11-3926-420 列出黑色 Pro Gear Realo，并交叉描述平顶外形、内部活塞和墨水窗；这只作国际市场的专业二手核对，不替代 Sailor 当前规格。",
      S.retailer.key,
      "international listing code, flat-top shape, piston and ink-window description",
    ),
    claim(
      "phase368-realo-codes",
      "product_codes",
      "当前官网列出黑色 F/M/B：11-3926-220、-420、-620；Maroon F/M：11-3926-232、-432。旧官方目录另列 EF/MF/Zoom/Music 代码，属于历史／地区库存边界。",
      S.official.key,
      "current black and Maroon code groups; archived width boundary",
    ),
    claim(
      "phase368-realo-nib",
      "nib",
      "官方当前规格为 21K 大型双色金尖；尖幅和实际手感按具体代码、调校、墨水和纸张核对，不能把某一支样笔的线宽当作全系列保证。",
      S.official.key,
      "21K large bicolor nib field and current width options",
    ),
    claim(
      "phase368-realo-filling",
      "filling_system",
      "尾栓回转吸入式把墨水直接储存在胴内，标称吸入量约 1 cc；Sailor 官方明确不能使用墨囊或 ink converter。",
      S.refill.key,
      "official Realo refill instructions and cartridge/converter exclusion",
    ),
    claim(
      "phase368-realo-material",
      "material",
      "盖、胴和大先为 PMMA 树脂；当前产品页写 Gold IP 金属件。2024 公告说明部分批次从传统金镀层转为 Gold IP，双色尖表面处理不变。",
      S.coating.key,
      "product material fields and 2024 coating-change notice",
    ),
    claim(
      "phase368-realo-size",
      "physical_specification",
      "当前官网规格为最大径 φ18 mm、全长 135 mm（含笔夹）、轴径约 φ13 mm、重量 21.0 g，吸入量约 1 cc。",
      S.official.key,
      "size, barrel diameter, weight and ink capacity fields",
    ),
    claim(
      "phase368-realo-status",
      "market_status",
      "日本官网当前页标价 ¥52,800（含税），并注明库存售罄后结束销售；价格和库存是时间点与市场口径，不是全球统一承诺。",
      S.official.key,
      "official price and stock-boundary notice",
    ),
    claim(
      "phase368-realo-siblings",
      "identity_boundaries",
      "11-3926 与 Profit Realo 18（11-3924）、标准 Professional Gear 21K、Professional Gear Slim 21（11-2151/11-2152）保持独立；平顶或 21K 不能单独证明同一型号。",
      S.official.key,
      "current product family comparison and separate codes",
    ),
    claim(
      "phase368-realo-care",
      "maintenance_guidance",
      "清洗前推出残墨，以清水吸入和排出多次；不要让水越过大先环或浸没整支笔，避免水从尾栓缝隙进入。PMMA、镀层和活塞不应接触酒精、研磨剂或自行拆解。",
      S.care.key,
      "official Realo cleaning steps and waterline warning",
      "editorial",
    ),
    claim(
      "phase368-realo-selection",
      "selection_guidance",
      "购买时先确认主代码、颜色、尖幅、21K 大型双色尖、φ18×135 mm 和尾栓机构；若页面写 11-3924、converter 或 14K，应转查其他 sibling 页面。",
      S.official.key,
      "SKU, nib, size and filling fields",
      "editorial",
    ),
    claim(
      "phase368-realo-media",
      "media_identity_boundary",
      "主图是本站原创事实 SVG，不复制 Sailor logo 或产品照片，也不证明实物色泽、比例、年份或具体批次。",
      S.diagram.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase368-realo-black-current",
      name: "Black（黑色）当前官网代码组",
      notes: "F/M/B：11-3926-220、11-3926-420、11-3926-620。",
      sourceKey: S.official.key,
      variantKind: "market_sku",
      productCode: "11-3926-220/420/620",
      market: "日本",
    },
    {
      key: "phase368-realo-maroon-current",
      name: "Maroon（栗红）当前官网代码组",
      notes: "F/M：11-3926-232、11-3926-432；当前页未列 B。",
      sourceKey: S.official.key,
      variantKind: "market_sku",
      productCode: "11-3926-232/432",
      market: "日本",
    },
    {
      key: "phase368-realo-archived-widths",
      name: "旧官方目录的历史／地区尖幅",
      notes: "2019–2020 目录另列 EF、MF、Zoom、Music 代码；需按实际库存和市场核对，不代表当前官网全部可订。",
      sourceKey: S.archive.key,
      variantKind: "nib",
      market: "历史／地区库存",
    },
    {
      key: "phase368-realo-coating-batches",
      name: "金镀层与 Gold IP 批次",
      notes: "2024 年 9 月以后逐步切换金属小件表面处理；双色尖表面处理不变。",
      sourceKey: S.coating.key,
      variantKind: "material",
      market: "全球批次边界",
    },
  ],
  spec: {
    brandEntityId: PHASE368_SAILOR_BRAND_ID,
    values: {
      series_name: "Sailor Professional Gear Realo（11-3926）",
      release_year: "2019–2020 官方目录已列；官网当前页未给出明确首发日",
      origin_country: "日本品牌；本页不外推具体制造工厂",
      nib: "21K 大型双色金尖；当前官网 F/M/B（黑）与 F/M（Maroon），旧目录另列 EF/MF/Z/MS",
      fill_system: "尾栓回转吸入式；约 1 cc；不能使用 Sailor 墨囊或 converter",
      material: "PMMA 树脂盖／杆／大先；当前页 Gold IP 金属件；旧批次可能为传统金镀层",
      dimensions: "φ18 × 135 mm（含笔夹）；轴径约 φ13 mm",
      weight: "21.0 g",
      price_range: "日本官网 2026-08-03 快照：¥52,800（含税）；库存售罄后结束销售",
      status: "日本官网现行 11-3926；黑／Maroon 当前代码与旧目录尖幅分层记录",
    },
    evidence: [
      evidence("phase368-realo-brand", "brand_entity_id", S.official.key, "official Sailor product page"),
      evidence("phase368-realo-series", "series_name", S.official.key, "product title and 11-3926 code"),
      evidence("phase368-realo-release", "release_year", S.archive.key, "2019–2020 official catalogue availability; no exact launch inferred"),
      evidence("phase368-realo-origin", "origin_country", S.official.key, "Sailor Japan product page; no factory inference"),
      evidence("phase368-realo-nib-field", "nib", S.official.key, "21K large bicolor and current code groups"),
      evidence("phase368-realo-fill-field", "fill_system", S.refill.key, "official Realo refill method"),
      evidence("phase368-realo-material-field", "material", S.coating.key, "PMMA, Gold IP and coating transition"),
      evidence("phase368-realo-dimensions", "dimensions", S.official.key, "φ18×135 mm and barrel diameter"),
      evidence("phase368-realo-weight", "weight", S.official.key, "21.0 g"),
      evidence("phase368-realo-price", "price_range", S.official.key, "official Japanese price and stock notice"),
      evidence("phase368-realo-status", "status", S.official.key, "current product page status boundary"),
    ],
  },
  timeline: [
    {
      key: "phase368-realo-catalogue-window",
      title: "11-3926 已出现在 Sailor 2019–2020 官方目录",
      eventType: "design_milestone",
      startDate: "2019",
      circa: true,
      description: "官方目录已列出 Professional Gear Realo 11-3926；目录时间证明存在窗口，不等于精确首发日。",
      sourceKey: S.archive.key,
    },
  ],
  media: [
    {
      key: "phase368-realo-primary-media",
      title: "Professional Gear Realo 11-3926 事实卡（非产品照片）",
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

export const phase368SailorProfessionalGearRealoPacks: CuratedEntityPack[] = [brand, model];
