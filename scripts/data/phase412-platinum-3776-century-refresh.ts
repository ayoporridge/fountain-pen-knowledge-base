import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE52_PLATINUM_3776_ID,
  PHASE52_PLATINUM_BRAND_ID,
  phase52LamyPlatinumCorePacks,
} from "./phase52-lamy-platinum-core";

export const PHASE412_PLATINUM_BRAND_ID = PHASE52_PLATINUM_BRAND_ID;
export const PHASE412_PLATINUM_3776_ID = PHASE52_PLATINUM_3776_ID;
export const PHASE412_PLATINUM_3776_SLUG = "platinum-3776-century";
export const PHASE412_PLATINUM_3776_NAME = "Platinum #3776 Century";

const RETRIEVED = "2026-08-03";
const CURRENT_SCOPE = "phase412-platinum-3776-current-2026-08-03";
const NIB_SCOPE = "phase412-platinum-3776-nib-options";
const COLOR_SCOPE = "phase412-platinum-3776-color-skus";
const HISTORY_SCOPE = "phase412-platinum-3776-history";
const SEAL_SCOPE = "phase412-platinum-3776-slip-seal";
const CARE_SCOPE = "phase412-platinum-3776-care";
const VER20_SCOPE = "phase412-platinum-3776-ver20-boundary";
const TRAVIA_SCOPE = "phase412-platinum-3776-travia-boundary";
const SAMPLE_SCOPE = "phase412-platinum-3776-sample-review";
const FAMILY_SCOPE = "phase412-platinum-3776-family-boundary";
const COMMERCIAL_SCOPE = "phase412-platinum-3776-commercial-2026-08-03";

function web(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  author?: string;
  publishedAt?: string;
  summary: string;
  itemType?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const homepageUrl = sourceType === "official"
    ? "https://www.platinum-pen.co.jp/"
    : new URL(input.url).origin;
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? (sourceType === "official" ? "primary" : "professional_secondary"),
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl,
    itemType: input.itemType ?? (input.url.toLowerCase().includes(".pdf") ? "pdf" : "web_page"),
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(): CuratedSource {
  const localPath = "/images/library/site-original/lamy-platinum/platinum-3776-century.svg";
  return {
    key: "phase412-platinum-3776-factual-svg",
    registryKey: "fountain-pen-graph-editorial-phase412-platinum-3776",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase412-platinum-3776",
    title: "Platinum #3776 Century 事实示意图（非产品照片）",
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "沿用本站原创 factual SVG，区分 1978 #3776、2011 Century、普通 PNB-15000、Ver.2.0 与 Travia；非产品照片、非 Logo、非比例图。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  jpProduct: web({
    key: "phase412-platinum-3776-jp-product",
    registryKey: "platinum-pnb15000-jp-official-phase412",
    registryName: "Platinum 日本官方 PNB-15000",
    title: "#3776 CENTURY PNB-15000 日本官方产品页",
    url: "https://www.platinum-pen.co.jp/products/fountain-pen/1464/",
    summary: "日本官方当前页列 PNB-15000、¥44,000 含税、14K 14-26、UEF/EF/F/SF/M/B/C、AS 树脂、五色、139.5 mm、15.4 mm、20.5 g、Converter-800A 与蓝黑墨囊。",
  }),
  enProduct: web({
    key: "phase412-platinum-3776-en-product",
    registryKey: "platinum-pnb15000-en-official-phase412",
    registryName: "Platinum English official product",
    title: "#3776 CENTURY PNB-15000 English product page",
    url: "https://www.platinum-pen.co.jp/en/products/detail/?pid=1464",
    summary: "英文官方规格表交叉核对 PNB-15000、14K 尖号、AS 树脂、尺寸、重量、颜色与同品牌产品导航。",
  }),
  history: web({
    key: "phase412-platinum-3776-history",
    registryKey: "platinum-3776-history-official-phase412",
    registryName: "Platinum #3776 official history",
    title: "Platinum #3776 Century official brand page",
    url: "https://www.platinum-pen.co.jp/brands/3776-century/",
    summary: "官方品牌页区分 1978 #3776 家族起点与 2011 Century 刷新，说明富士山 3776 命名和普通树脂、赛璐珞等家族分流。",
  }),
  slipSeal: web({
    key: "phase412-platinum-slip-seal",
    registryKey: "platinum-slip-seal-official-phase412",
    registryName: "Platinum official mechanism guide",
    title: "Platinum Slip & Seal mechanism",
    url: "https://www.platinum-pen.co.jp/en/slipseal/",
    summary: "官方机制页说明旋帽内部的密封结构用于减缓长时间闲置干墨；这不是永不干或免清洗保证。",
  }),
  manual: web({
    key: "phase412-platinum-century-manual",
    registryKey: "platinum-century-manual-phase412",
    registryName: "Platinum official manual archive",
    title: "Platinum Century care manual",
    url: "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2020/01/century.pdf",
    tier: "contemporary_archive",
    summary: "官方手册提供换墨冲洗、长期保存、Slip & Seal 例外和避免强力处理的使用边界。",
  }),
  timeline: web({
    key: "phase412-platinum-3776-timeline",
    registryKey: "platinum-official-timeline-phase412",
    registryName: "Platinum official history archive",
    title: "Platinum anniversary timeline",
    url: "https://www.platinum-pen.co.jp/common/img/pdf/decade_special_page%28english%29.pdf",
    tier: "contemporary_archive",
    summary: "官方时间线把 1978 原始 #3776 与 2011 #3776 Century 放在不同历史节点。",
  }),
  ver20: web({
    key: "phase412-platinum-3776-ver20",
    registryKey: "platinum-3776-ver20-official-phase412",
    registryName: "Platinum Ver.2.0 official release",
    title: "#3776 CENTURY Ver.2.0 Prism Crystal brief",
    url: "https://www.platinum-pen.co.jp/common/pdf/demonstrator_en.pdf",
    tier: "contemporary_archive",
    publishedAt: "2026-02-05",
    summary: "官方简报把 PNB-450 Prism Crystal 作为独立 Ver.2.0，2,000 支、139.5×15.4 mm、20.0 g，并说明握位、墨窗和密封目标调整。",
  }),
  travia: web({
    key: "phase412-platinum-travia",
    registryKey: "platinum-travia-official-phase412",
    registryName: "Platinum Travia official release",
    title: "Platinum Travia official brief",
    url: "https://www.platinum-pen.co.jp/common/pdf/travia_en.pdf",
    tier: "contemporary_archive",
    publishedAt: "2026-03-01",
    summary: "官方简报把 PFL-600 Travia 作为独立 sibling，列 FLAF 14K 镀钌尖、142 mm、29.3 g 与 Converter-700A。",
  }),
  news: web({
    key: "phase412-platinum-news",
    registryKey: "platinum-pressrelease-phase412",
    registryName: "Platinum official press releases",
    title: "Platinum English press release index",
    url: "https://www.platinum-pen.co.jp/en/news/?lang=en&news_category=pressrelease",
    tier: "contemporary_archive",
    summary: "官方新闻索引用于确认 2026 产品更新入口；在售、价格和地区供货仍需回到具体商品页。",
  }),
  penAddict: web({
    key: "phase412-platinum-3776-penaddict",
    registryKey: "pen-addict-platinum-3776-phase412",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    author: "The Pen Addict",
    publishedAt: "2015-12-14",
    title: "Platinum #3776 Century Chartres Blue review",
    url: "https://www.penaddict.com/blog/2015/12/14/platinum-3776-century-chartres-blue-fountain-pen-review",
    summary: "专业评测提供特定 Chartres Blue 样本的 14K 尖反馈、线条与日用观察；不替代当前 SKU 规格。",
  }),
  goulet: web({
    key: "phase412-platinum-3776-goulet",
    registryKey: "goulet-platinum-3776-phase412",
    registryName: "Goulet Pens",
    sourceType: "retailer",
    tier: "retailer",
    title: "Goulet Pens Platinum #3776 Century collection",
    url: "https://www.gouletpens.com/collections/platinum-3776-century-fountain-pens",
    summary: "可靠零售目录用于交叉核对普通树脂、旋帽、颜色商品名及墨囊／上墨器语境，不替代官方价格。",
  }),
  collector: web({
    key: "phase412-platinum-3776-collector",
    registryKey: "platinum-3776-collector-phase412",
    registryName: "Platinum 3776 collector guide",
    sourceType: "blog",
    tier: "community",
    author: "Platinum 3776 collector guide",
    title: "Platinum 3776 Century color and model guide",
    url: "https://platinum3776century.com/?p=118",
    summary: "收藏资料提供颜色和旧型号名称的辅助索引；历史细节低于官方产品页和目录层级。",
  }),
  svg: diagram(),
} as const;

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  source: CuratedSource,
  locator: string,
  scopeKey: string,
  extra: CuratedSource[] = [],
  factClass: CuratedClaim["factClass"] = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.99 : 0.93,
    sourceKey: source.key,
    locator,
    evidence: [source, ...extra].map((item, index) => ({
      key: `${key}-evidence-${index + 1}`,
      sourceKey: item.key,
      scopeKey,
      locator: index === 0 ? locator : item.summary,
    })),
  };
}

const variants: CuratedVariant[] = [
  {
    key: "phase412-platinum-3776-pnb15000",
    name: "PNB-15000 普通 AS 树脂款",
    releaseYear: "2011–",
    productCode: "PNB-15000",
    notes: "当前主体；14K 14-26、UEF/EF/F/SF/M/B/C、139.5×15.4 mm、20.5 g，Platinum 墨囊／Converter-800A。",
    sourceKey: S.jpProduct.key,
    variantKind: "edition_group",
  },
  {
    key: "phase412-platinum-3776-black",
    name: "黑色 #1",
    productCode: "PNB-15000 #1",
    notes: "官方当前颜色编号；具体尖号对应完整产品编号，以当期 SKU 表为准。",
    sourceKey: S.jpProduct.key,
    variantKind: "color",
    parentVariantKey: "phase412-platinum-3776-pnb15000",
  },
  {
    key: "phase412-platinum-3776-white",
    name: "Chenonceau White #2",
    productCode: "PNB-15000 #2",
    notes: "官方当前常规 AS 树脂颜色；不从颜色照片推断批次或材料变化。",
    sourceKey: S.jpProduct.key,
    variantKind: "color",
    parentVariantKey: "phase412-platinum-3776-pnb15000",
  },
  {
    key: "phase412-platinum-3776-green",
    name: "Laurel Green #41",
    productCode: "PNB-15000 #41",
    notes: "官方当前常规颜色；尖号和完整产品编号按当期表格核对。",
    sourceKey: S.jpProduct.key,
    variantKind: "color",
    parentVariantKey: "phase412-platinum-3776-pnb15000",
  },
  {
    key: "phase412-platinum-3776-blue",
    name: "Chartres Blue #51",
    productCode: "PNB-15000 #51",
    notes: "官方当前常规颜色；The Pen Addict 的试写只代表特定样本。",
    sourceKey: S.jpProduct.key,
    variantKind: "color",
    parentVariantKey: "phase412-platinum-3776-pnb15000",
  },
  {
    key: "phase412-platinum-3776-bourgogne",
    name: "Bourgogne #71",
    productCode: "PNB-15000 #71",
    notes: "官方当前常规颜色；零售图片和库存不替代官方产品号。",
    sourceKey: S.jpProduct.key,
    variantKind: "color",
    parentVariantKey: "phase412-platinum-3776-pnb15000",
  },
  {
    key: "phase412-platinum-3776-ver20",
    name: "#3776 CENTURY Ver.2.0 Prism Crystal",
    releaseYear: "2026-02-05",
    productCode: "PNB-450",
    notes: "独立透明示范款，2,000 支、20.0 g、改良握位／墨窗／密封目标；不回填普通 PNB-15000。",
    sourceKey: S.ver20.key,
    variantKind: "edition_group",
  },
  {
    key: "phase412-platinum-travia",
    name: "#3776 CENTURY Travia Onyx Black",
    releaseYear: "2026-03",
    productCode: "PFL-600",
    notes: "独立 sibling；FLAF 14K 镀钌尖、142 mm、29.3 g、金属平衡件与 Converter-700A。",
    sourceKey: S.travia.key,
    variantKind: "edition_group",
  },
];

const prior = phase52LamyPlatinumCorePacks.find(
  (pack) => pack.entityId === PHASE412_PLATINUM_3776_ID && pack.expectedType === "pen",
);
if (!prior) throw new Error("Phase 412 requires the existing Platinum #3776 Century identity.");

const pack: CuratedEntityPack = {
  ...structuredClone(prior),
  key: "phase412-platinum-3776-century-refresh-v1",
  entityId: PHASE412_PLATINUM_3776_ID,
  expectedType: "pen",
  expectedSlug: PHASE412_PLATINUM_3776_SLUG,
  canonicalName: PHASE412_PLATINUM_3776_NAME,
  markdownFile: ".planning/content-research/platinum-3776-century-phase412.md",
  storyTitle: "Platinum #3776 Century：PNB-15000 普通款与版本边界",
  primarySourceKey: S.jpProduct.key,
  publicationIntent: "publish",
  publicationBlockers: [],
  aliases: [
    { alias: "Platinum #3776 Century", language: "en", sourceKey: S.enProduct.key },
    { alias: "Platinum 3776 Century", language: "en", sourceKey: S.enProduct.key },
    { alias: "#3776 Century", language: "en", sourceKey: S.history.key },
    { alias: "Platinum PNB-15000", language: "en", sourceKey: S.jpProduct.key },
    { alias: "白金 3776 世纪", language: "zh", sourceKey: S.jpProduct.key },
    { alias: "白金 #3776 Century", language: "zh", sourceKey: S.enProduct.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: CURRENT_SCOPE,
      scopeKey: CURRENT_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "14K 14-26；UEF、EF、F、SF、M、B、C；颜色与尖号组合对应完整产品编号。",
      materialScope: "PNB-15000 普通 AS 树脂；黑色、白色、Laurel Green、Chartres Blue、Bourgogne。",
      editionScope: "普通 PNB-15000；不含 PNB-450 Ver.2.0、PFL-600 Travia 与特殊材料款。",
    },
    {
      key: NIB_SCOPE,
      scopeKey: NIB_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      nibScope: "官方当前 UEF/EF/F/SF/M/B/C 选择；日系 F 与其他品牌字母不直接换算。",
      editionScope: "普通 PNB-15000 的尖号范围和选购语境。",
    },
    {
      key: COLOR_SCOPE,
      scopeKey: COLOR_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      materialScope: "五种官方常规 AS 树脂颜色及 #1/#2/#41/#51/#71 编号。",
      editionScope: "颜色 variant；不因颜色创建新的基础笔形。",
    },
    {
      key: HISTORY_SCOPE,
      scopeKey: HISTORY_SCOPE,
      validFrom: "1978",
      productionState: "historical",
      editionScope: "1978 #3776 家族起点与 2011 Century 刷新；不推断每个 SKU 首发年份。",
    },
    {
      key: SEAL_SCOPE,
      scopeKey: SEAL_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: "普通款 Slip & Seal 机制和约两年目标的条件性说明。",
    },
    {
      key: CARE_SCOPE,
      scopeKey: CARE_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: "墨囊／Converter-800A、清水冲洗、长期保存与温和开合。",
    },
    {
      key: VER20_SCOPE,
      scopeKey: VER20_SCOPE,
      validFrom: "2026-02-05",
      productionState: "current",
      editionScope: "PNB-450 Prism Crystal 独立 Ver.2.0；不回填 PNB-15000。",
    },
    {
      key: TRAVIA_SCOPE,
      scopeKey: TRAVIA_SCOPE,
      validFrom: "2026-03",
      productionState: "current",
      nibScope: "FLAF 14K 镀钌尖；与普通款 14K 14-26 分开。",
      editionScope: "PFL-600 Travia 独立 sibling；不回填普通款规格。",
    },
    {
      key: SAMPLE_SCOPE,
      scopeKey: SAMPLE_SCOPE,
      validFrom: "2015-12-14",
      validTo: "2015-12-14",
      productionState: "historical",
      editionScope: "Chartres Blue 专业评测样本；写感不覆盖所有尖号和颜色。",
    },
    {
      key: FAMILY_SCOPE,
      scopeKey: FAMILY_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: "赛璐珞、木材、象嵌、Music 与其他 #3776 家族 sibling 的导航边界。",
    },
    {
      key: COMMERCIAL_SCOPE,
      scopeKey: COMMERCIAL_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Japan",
      editionScope: "¥44,000 含税与当期颜色／尖号供货快照。",
    },
  ],
  claims: [
    claim(
      "phase412-platinum-3776-identity",
      "model_identity",
      "本页主体是 Platinum #3776 Century 的现行普通 PNB-15000，而不是所有 #3776 材料和版本的合并条目。",
      S.jpProduct,
      "current PNB-15000 product title and product number",
      CURRENT_SCOPE,
      [S.history, S.enProduct],
    ),
    claim(
      "phase412-platinum-3776-specs",
      "official_specification",
      "日本官方当前页列 AS 树脂、14K 大型 14-26、UEF/EF/F/SF/M/B/C、139.5 mm、15.4 mm、20.5 g、Platinum 墨囊／Converter-800A 与蓝黑墨囊。",
      S.jpProduct,
      "PNB-15000 current specification block",
      CURRENT_SCOPE,
      [S.enProduct],
    ),
    claim(
      "phase412-platinum-3776-colors",
      "color_sku_range",
      "普通款当前常规颜色为黑色 #1、Chenonceau White #2、Laurel Green #41、Chartres Blue #51 和 Bourgogne #71；颜色与尖号组合对应具体产品编号。",
      S.jpProduct,
      "current color and product-code table",
      COLOR_SCOPE,
      [S.enProduct, S.goulet],
    ),
    claim(
      "phase412-platinum-3776-nibs",
      "nib_options",
      "UEF、EF、F、SF、M、B、C 是官方当前列出的尖号选择；字母不可直接换算为西方品牌线宽，体验还受墨水、纸张和调校影响。",
      S.jpProduct,
      "official nib list and editorial selection boundary",
      NIB_SCOPE,
      [S.enProduct, S.penAddict],
    ),
    claim(
      "phase412-platinum-3776-history",
      "brand_lineage",
      "官方资料把 #3776 家族起点放在 1978 年，把 #3776 Century 的全面刷新放在 2011 年；这两个年份不等于每个 PNB-15000 SKU 的首发年份。",
      S.history,
      "1978 #3776 and 2011 Century timeline",
      HISTORY_SCOPE,
      [S.timeline],
    ),
    claim(
      "phase412-platinum-3776-seal",
      "cap_seal",
      "Slip & Seal 是旋帽内用于减缓闲置干墨的密封结构；普通款常被概括为约两年目标，但它不是永不干、永不漏或免清洗保证。",
      S.slipSeal,
      "official airtight mechanism and anti-dry design intent",
      SEAL_SCOPE,
      [S.manual],
    ),
    claim(
      "phase412-platinum-3776-care",
      "maintenance_boundary",
      "换色、久置或出墨异常时用清水吸排并自然干燥，避免酒精、强溶剂、热水和强拆；Slip & Seal 不能替代长期保存前的清洗。",
      S.manual,
      "official cleaning, storage and handling guidance",
      CARE_SCOPE,
      [S.slipSeal],
    ),
    claim(
      "phase412-platinum-3776-ver20-boundary",
      "edition_boundary",
      "PNB-450 Prism Crystal 是 2026-02-05 的独立 Ver.2.0，2,000 支、约 20.0 g，握位、墨窗、刻印和密封试验目标有调整；这些事实不回填普通 PNB-15000。",
      S.ver20,
      "official Ver.2.0 brief specifications and redesign notes",
      VER20_SCOPE,
      [S.news],
    ),
    claim(
      "phase412-platinum-travia-boundary",
      "sibling_boundary",
      "PFL-600 Travia 是独立 sibling，采用 FLAF 14K 镀钌尖、约 142 mm、29.3 g 与 Converter-700A；不能写成普通树脂款的金属版本。",
      S.travia,
      "official Travia brief and product boundary",
      TRAVIA_SCOPE,
      [S.history],
    ),
    claim(
      "phase412-platinum-3776-family",
      "family_boundary",
      "赛璐珞、木材、象嵌、Music 和其他特殊材料或尖号属于 #3776 家族的独立 variant／sibling，不共享普通 PNB-15000 的重量、配件、密封目标或价格。",
      S.history,
      "official family product navigation and material boundary",
      FAMILY_SCOPE,
      [S.enProduct, S.collector],
    ),
    claim(
      "phase412-platinum-3776-sample",
      "independent_sample",
      "The Pen Addict 的 Chartres Blue 文章记录特定 14K 尖样本的清楚线条和一定反馈；这是个人试写语境，不是所有颜色和尖号的统一结论。",
      S.penAddict,
      "Chartres Blue review writing observations",
      SAMPLE_SCOPE,
      [S.goulet],
      "editorial",
    ),
    claim(
      "phase412-platinum-3776-commercial",
      "commercial_snapshot",
      "日本官方产品页在 2026-08-03 检索日显示 PNB-15000 含税 ¥44,000；价格、税费、库存和地区销售策略随时间与 SKU 变化。",
      S.jpProduct,
      "current Japan tax-included price snapshot",
      COMMERCIAL_SCOPE,
      [S.news],
    ),
    claim(
      "phase412-platinum-3776-buying",
      "selection_guidance",
      "购买时先确认 PNB-15000 身份，再核对颜色编号、尖号、完整产品编号、Converter-800A 和当期保修／退货条件；二手笔要同时检查材料、重量和刻字。",
      S.jpProduct,
      "current product table and editorial purchase checklist",
      COMMERCIAL_SCOPE,
      [S.enProduct, S.manual],
      "editorial",
    ),
  ],
  variants,
  spec: {
    brandEntityId: PHASE412_PLATINUM_BRAND_ID,
    values: {
      series_name: "Platinum #3776 Century PNB-15000",
      release_year: "1978（#3776 家族）；2011（Century）",
      origin_country: "Japan",
      nib: "14K 大型 14-26；UEF、EF、F、SF、M、B、C",
      fill_system: "Platinum 专用墨囊／Converter-800A；当前页面随附蓝黑墨囊",
      material: "AS 树脂（PNB-15000 普通款）",
      dimensions: "139.5 mm × 15.4 mm",
      weight: "20.5 g",
      price_range: "¥44,000 含税（日本官方 2026-08-03 快照）",
      status: "PNB-15000 普通树脂款现行；Ver.2.0、Travia 与特殊材料另立",
    },
    evidence: [
      evidence("brand_entity_id", "phase412-platinum-brand", S.jpProduct.key, CURRENT_SCOPE, "verified existing Platinum maker relation"),
      evidence("series_name", "phase412-platinum-series", S.jpProduct.key, CURRENT_SCOPE, "PNB-15000 product title"),
      evidence("release_year", "phase412-platinum-release", S.history.key, HISTORY_SCOPE, "1978 and 2011 official lineage"),
      evidence("origin_country", "phase412-platinum-origin", S.enProduct.key, CURRENT_SCOPE, "Platinum Japan official product context"),
      evidence("nib", "phase412-platinum-nib", S.jpProduct.key, NIB_SCOPE, "14K 14-26 and UEF through C"),
      evidence("fill_system", "phase412-platinum-fill", S.jpProduct.key, CURRENT_SCOPE, "Converter-800A and blue-black cartridge included"),
      evidence("material", "phase412-platinum-material", S.jpProduct.key, CURRENT_SCOPE, "AS resin standard product"),
      evidence("dimensions", "phase412-platinum-dimensions", S.jpProduct.key, CURRENT_SCOPE, "139.5 mm and 15.4 mm"),
      evidence("weight", "phase412-platinum-weight", S.jpProduct.key, CURRENT_SCOPE, "20.5 g official weight"),
      evidence("price_range", "phase412-platinum-price", S.jpProduct.key, COMMERCIAL_SCOPE, "2026-08-03 Japan tax-included price"),
      evidence("status", "phase412-platinum-status", S.news.key, COMMERCIAL_SCOPE, "current product/news index context"),
    ],
  },
  timeline: [
    {
      key: "phase412-platinum-3776-1978",
      title: "#3776 家族起点",
      eventType: "model_released",
      startDate: "1978",
      circa: false,
      description: "官方品牌资料把原始 #3776 的开发放在 1978 年，名称取自富士山标高 3776 米。",
      sourceKey: S.history.key,
    },
    {
      key: "phase412-platinum-3776-2011",
      title: "#3776 Century 全面刷新",
      eventType: "design_milestone",
      startDate: "2011",
      circa: false,
      description: "官方资料把 #3776 Century 的全面刷新放在 2011 年；这不是每个颜色 SKU 的首发年份。",
      sourceKey: S.timeline.key,
    },
    {
      key: "phase412-platinum-3776-ver20-2026",
      title: "PNB-450 Ver.2.0 独立发布资料",
      eventType: "model_released",
      startDate: "2026-02-05",
      circa: false,
      description: "官方简报记录 2,000 支 Prism Crystal 与握位、墨窗、刻印及密封试验目标调整；不覆盖普通款。",
      sourceKey: S.ver20.key,
    },
    {
      key: "phase412-platinum-travia-2026",
      title: "PFL-600 Travia sibling 资料",
      eventType: "model_released",
      startDate: "2026-03",
      circa: true,
      description: "官方简报记录 Travia 的独立产品号、镀钌尖、尺寸重量和 Converter-700A。",
      sourceKey: S.travia.key,
    },
  ],
  media: [
    {
      key: "phase412-platinum-3776-primary-media",
      title: "Platinum #3776 Century 事实图（非产品照片）",
      sourceKey: S.svg.key,
      localPath: S.svg.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；示意图，非产品照片、非 Logo、非比例图，不证明真实颜色或具体 SKU。",
      sourceUrl: S.svg.url,
      usageStatus: "primary",
    },
  ],
};

export const phase412Platinum3776CenturyRefreshPacks: CuratedEntityPack[] = [pack];
