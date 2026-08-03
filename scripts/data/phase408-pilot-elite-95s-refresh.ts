import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import { PHASE60_ELITE_95S_ID, PHASE60_PILOT_BRAND_ID, phase60PilotP0Packs } from "./phase60-pilot-p0";

export const PHASE408_ELITE_ID = PHASE60_ELITE_95S_ID;
export const PHASE408_PILOT_ID = PHASE60_PILOT_BRAND_ID;
export const PHASE408_ELITE_SLUG = "pilot-elite-95s";

const RETRIEVED = "2026-08-03";
const SCOPE = "phase408-pilot-elite-95s-current";

const base = phase60PilotP0Packs.find(
  (pack) => pack.entityId === PHASE408_ELITE_ID && pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 408 Pilot Elite 95S prerequisite missing.");

function source(input: {
  key: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup: string;
  title: string;
  url: string;
  homepageUrl: string;
  summary: string;
  itemType?: string;
  author?: string;
  allowedUse?: CuratedSource["allowedUse"];
  license?: string;
}): CuratedSource {
  const siteOriginal = input.sourceType === "user_submission";
  return {
    ...input,
    itemType: input.itemType ?? (siteOriginal ? "image" : "web_page"),
    author: input.author ?? input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: input.allowedUse ?? (siteOriginal ? "store_full" : "summary_only"),
    archiveUrl: input.url,
    archiveLocator: siteOriginal
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

const baseSource = (key: string): CuratedSource => {
  const found = base.sources.find((item) => item.key === key);
  if (!found) throw new Error(`Phase 408 Pilot source ${key} is missing.`);
  return found;
};

const S = {
  exact: baseSource("phase60-pilot-elite95s-sku-2026"),
  lineup: baseSource("phase60-pilot-elite95s-catalog"),
  history: baseSource("phase60-pilot-elite-history"),
  professional: baseSource("phase60-pilot-professional-review"),
  diagram: baseSource("phase60-pilot-elite95s-svg"),
  support: source({
    key: "phase408-pilot-elite95s-support",
    registryKey: "pilot-support-elite95s-phase408",
    registryName: "PILOT official support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-support-elite95s-phase408",
    title: "Elite 95S FES-1MM｜PILOT 官方支持与维护",
    url: "https://www.pilot.co.jp/support/warranty/jp/fountain/elite95s.html",
    homepageUrl: "https://www.pilot.co.jp/support/warranty/",
    summary:
      "官方支持页确认 FES-1MM、墨囊与 CON-40 的装墨顺序，清水吸排、首部清洗、溶剂/气压/自行维修警告。",
  }),
  manual: source({
    key: "phase408-pilot-fountain-manual",
    registryKey: "pilot-fountain-manual-elite95s-phase408",
    registryName: "PILOT official manual",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-fountain-manual-elite95s-phase408",
    title: "PILOT 万年筆使用说明书（日文 PDF）",
    url: "https://www.pilot.co.jp/support/manual/fountain/fountain_jp.pdf",
    homepageUrl: "https://www.pilot.co.jp/support/manual/",
    itemType: "pdf",
    summary: "通用说明补充墨囊、CON-40、清水吸排与保存步骤；Elite 95S 专属禁忌以支持页为准。",
  }),
  category: source({
    key: "phase408-pilot-fountain-category",
    registryKey: "pilot-webcatalog-fountain-category-elite95s-phase408",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-fountain-category-elite95s-phase408",
    title: "PILOT Web Catalog 万年笔分类与 Elite 95S 入口",
    url: "https://webcatalog.pilot.co.jp/products/DispCate.do?category=%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E4%B8%87%E5%B9%B4%E7%AD%86&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary: "官方分类把 Elite 95S 与 Custom、Capless、Cavalier 等作为不同商品入口，支持品牌导航分流。",
  }),
  warranty: source({
    key: "phase408-pilot-fountain-warranty",
    registryKey: "pilot-international-warranty-elite95s-phase408",
    registryName: "PILOT international warranty",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-international-warranty-elite95s-phase408",
    title: "PILOT international fountain-pen warranty list",
    url: "https://www.pilot.co.jp/support/warranty/en/fountain/",
    homepageUrl: "https://www.pilot.co.jp/support/warranty/",
    summary: "国际保证页用于把 Elite 95S 与 Custom、Capless 等其他 Pilot 产品路线分开；不外推日本 SKU 价格。",
  }),
  customHistory: source({
    key: "phase408-pilot-custom-history",
    registryKey: "pilot-custom-history-elite95s-phase408",
    registryName: "PILOT CUSTOM official",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "pilot-custom-history-elite95s-phase408",
    title: "PILOT CUSTOM history：相邻型号分流",
    url: "https://www.pilot-custom.jp/en/history/",
    homepageUrl: "https://www.pilot-custom.jp/en/",
    summary: "CUSTOM 历史页用于区分 74/742/743/823/845 等相邻路线，不把共享 Pilot converter 当成同一型号。",
  }),
} satisfies Record<string, CuratedSource>;

function claim(
  key: string,
  predicate: string,
  objectText: string,
  primary: CuratedSource,
  locator: string,
  extra: CuratedSource[] = [],
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.99 : 0.94,
    sourceKey: primary.key,
    locator,
    evidence: [primary, ...extra].map((item, index) => ({
      key: `${key}-evidence-${index + 1}`,
      sourceKey: item.key,
      scopeKey: SCOPE,
      locator: index === 0 ? locator : item.summary,
    })),
  };
}

function specEvidence(
  key: string,
  fieldKey: CuratedSpecEvidence["fieldKey"],
  sourceItem: CuratedSource,
  scopeKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey: sourceItem.key, scopeKey, locator, qualifies: true };
}

const variants: CuratedVariant[] = [
  {
    key: "phase408-elite95s-edition",
    name: "Elite 95S FES-1MM 黑色短身金尖组",
    productCode: "FES-1MM",
    releaseYear: "现代复刻路线；当前目录",
    notes: "Elite 95S 以 FES-1MM 为产品族；黑色、EF/F/M 和包装下沉为市场 SKU，不把旧 Elite S 拆入本组。",
    sourceKey: S.exact.key,
    variantKind: "edition_group",
    market: "Pilot Japan",
  },
  ...[
    ["EF", "FES-1MM-B-EF", "Extra Fine"],
    ["F", "FES-1MM-B-F", "Fine"],
    ["M", "FES-1MM-B-M", "Medium"],
  ].map(([nib, productCode, english]) => ({
    key: `phase408-elite95s-${String(nib).toLowerCase()}`,
    name: `${productCode} ${english} ${nib}`,
    productCode,
    releaseYear: "现行目录 lineup",
    notes: `官方 Elite 95S 页面列出的 ${nib} 尖号入口；实际线宽、库存和后配状态需按实物核对。`,
    sourceKey: S.exact.key,
    variantKind: "market_sku" as const,
    parentVariantKey: "phase408-elite95s-edition",
    market: "Pilot Japan",
  })),
];

const pack: CuratedEntityPack = {
  ...structuredClone(base),
  key: "phase408-pilot-elite-95s-refresh-v1",
  entityId: PHASE408_ELITE_ID,
  expectedSlug: PHASE408_ELITE_SLUG,
  canonicalName: "百乐 Pilot Elite 95S",
  markdownFile: ".planning/content-research/pilot-elite-95s-phase408.md",
  storyTitle: "Pilot Elite 95S：FES-1MM 短身金尖与旧 Elite 的证据边界",
  primarySourceKey: S.exact.key,
  depthTier: "A",
  aliases: [
    { alias: "Pilot Elite 95S", language: "en", sourceKey: S.exact.key },
    { alias: "PILOT Elite 95S", language: "en", sourceKey: S.lineup.key },
    { alias: "百乐 Elite 95S", language: "zh", sourceKey: S.exact.key },
    { alias: "百乐 95S", language: "zh", sourceKey: S.exact.key },
    { alias: "FES-1MM", language: "en", kind: "alias", sourceKey: S.exact.key },
  ],
  sources: [...base.sources, S.support, S.manual, S.category, S.warranty, S.customHistory].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
  ),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Pilot Japan current FES-1MM-B-EF card with FES-1MM-B-F/M lineup and official support",
      nibScope: "14K；当前页面列 EF、F、M 三个黑色尖号入口",
      materialScope: "当前 EF SKU：树脂轴、双重阳极氧化铝帽；金色环和包装按实物/市场核对",
      editionScope: "现代 Elite 95S FES-1MM；不吸收 1968 Elite S 或其他 vintage Elite 的规格",
    },
    {
      key: `${SCOPE}-commercial`,
      scopeKey: `${SCOPE}-commercial`,
      productionState: "unknown",
      editionScope: "当前日本 FES-1MM-B-EF：含税 ¥33,000；税前 ¥30,000；不外推其他市场或旧款成交价",
    },
  ],
  claims: [
    claim(
      "phase408-elite95s-identity",
      "model_identity",
      "Pilot Elite 95S 是现代 FES-1MM 短身钢笔；日本官方商品页以 FES-1MM-B-EF 为黑色 EF SKU，并同页列 FES-1MM-B-F 与 FES-1MM-B-M。",
      S.exact,
      "official Elite 95S title, FES-1MM-B-EF code and lineup links",
      [S.lineup, S.support, S.category],
    ),
    claim(
      "phase408-elite95s-history",
      "release_history",
      "Pilot 官方说明 Elite 95S 承接昭和 43 年 Elite S 的 DNA，并以昭和 49 年第二代设计为基础的复刻版；这描述设计来源，不把旧款规格并入 FES-1MM。",
      S.exact,
      "official product feature history paragraph",
      [S.history],
    ),
    claim(
      "phase408-elite95s-nibs",
      "nib_variants",
      "当前页面列 14K EF，并把 FES-1MM-B-F 与 FES-1MM-B-M 列为同一 Elite 95S 产品族的 F/Fine 与 M/Medium 入口；尖型不是三个独立型号。",
      S.exact,
      "14K EF field and F/M lineup links",
      [S.lineup, S.professional],
    ),
    claim(
      "phase408-elite95s-material",
      "material_finish",
      "当前 FES-1MM-B-EF 的轴为树脂，笔帽为铝制双重阳极氧化处理，颜色为黑色；外观相似的历史 Elite 不自动继承这些字段。",
      S.exact,
      "official material, cap finish and black colour fields",
      [S.history],
    ),
    claim(
      "phase408-elite95s-fill",
      "filling_system",
      "Elite 95S 使用 Pilot 墨囊或回转式 CON-40；墨囊应直线插入，CON-40 需笔尖向上稳妥安装后旋钮吸墨。",
      S.support,
      "official cartridge and CON-40 filling sequence",
      [S.manual],
    ),
    claim(
      "phase408-elite95s-physical",
      "physical_specification",
      "当前 FES-1MM-B-EF 商品卡列最大径 φ12.9 mm、收纳全长 119 mm、重量 15 g、使用盒 Z-CR-N3；数字只绑定该日本 EF SKU。",
      S.exact,
      "official size, weight and case table",
    ),
    claim(
      "phase408-elite95s-price",
      "commercial_snapshot",
      "当前日本 exact 商品卡显示含税希望小卖价 ¥33,000、税前 ¥30,000；不能改写成全球固定零售价或二手估值。",
      S.exact,
      "official current Japanese price and tax scope",
      [],
    ),
    claim(
      "phase408-elite95s-care",
      "maintenance_boundary",
      "长期停用前排墨并用清水吸排，避免热水、酒精等溶剂、航空气压、强烈冲击和自行维修；可按支持页清洗笔首，但不要整体浸洗笔帽和笔轴。",
      S.support,
      "official cleaning, storage, solvent, air-pressure and repair warnings",
      [S.manual],
    ),
    claim(
      "phase408-elite95s-siblings",
      "version_boundary",
      "现代 Elite 95S、历史 Elite S、Custom 74/742/743/823/845、Heritage 912 和 Capless 是不同身份；共享 Pilot 墨囊或 converter 不足以合并型号。",
      S.category,
      "official category and product-route separation",
      [S.warranty, S.customHistory, S.history],
    ),
    claim(
      "phase408-elite95s-selection",
      "selection_guidance",
      "选购先核对 FES-1MM 完整后缀、实际 EF/F/M 尖号、短身与加帽重心、CON-40/墨囊、市场日期和笔况，再按纸张试写；卖家写“老 Elite”不能替代产品号证据。",
      S.exact,
      "official SKU and lineup verification",
      [S.professional],
      "editorial",
    ),
    claim(
      "phase408-elite95s-media",
      "media_identity_boundary",
      "本站主图是原创 factual SVG，明确非产品照片，只表达 FES-1MM 短身/加帽、14K 和 c/c 导航，不代表真实比例、颜色校样、Logo、真伪或库存。",
      S.diagram,
      "site-original SVG attribution and non-product-photo boundary",
      [],
      "editorial",
    ),
  ],
  variants,
  spec: {
    brandEntityId: PHASE408_PILOT_ID,
    values: {
      series_name: "Pilot Elite 95S / FES-1MM",
      release_year: "现代复刻路线；官方说明承接昭和 43 年 Elite S 与昭和 49 年第二代设计",
      origin_country: "日本 Pilot 产品线；地区 SKU 和制造标记按实物核对",
      nib: "14K；当前 FES-1MM-B-EF 为 EF，官方同页另列 F 与 M",
      fill_system: "Pilot 墨囊或 CON-40 回转式转换器",
      material: "当前 FES-1MM-B-EF：树脂轴；铝制双重阳极氧化笔帽；黑色",
      dimensions: "当前 FES-1MM-B-EF：收纳全长 119 mm；最大径 φ12.9 mm",
      weight: "当前 FES-1MM-B-EF：15 g",
      price_range: "当前日本 exact 商品卡：含税 ¥33,000；税前 ¥30,000",
      status: "当前 FES-1MM-B-EF/F/M 三个官方黑色尖号入口；地区供应需另核",
    },
    evidence: [
      specEvidence("phase408-elite95s-spec-brand", "brand_entity_id", S.exact, SCOPE, "Pilot maker context"),
      specEvidence("phase408-elite95s-spec-series", "series_name", S.exact, SCOPE, "Elite 95S title and FES-1MM code"),
      specEvidence("phase408-elite95s-spec-release", "release_year", S.exact, SCOPE, "official Elite S / 1974 design context"),
      specEvidence("phase408-elite95s-spec-origin", "origin_country", S.category, SCOPE, "Pilot Japan catalogue context"),
      specEvidence("phase408-elite95s-spec-nib", "nib", S.exact, SCOPE, "14K EF and EF/F/M lineup"),
      specEvidence("phase408-elite95s-spec-fill", "fill_system", S.exact, SCOPE, "CON-40 field"),
      specEvidence("phase408-elite95s-spec-material", "material", S.exact, SCOPE, "resin barrel and double-anodized aluminum cap"),
      specEvidence("phase408-elite95s-spec-dimensions", "dimensions", S.exact, SCOPE, "119 mm and φ12.9 mm"),
      specEvidence("phase408-elite95s-spec-weight", "weight", S.exact, SCOPE, "15 g"),
      specEvidence("phase408-elite95s-spec-price", "price_range", S.exact, `${SCOPE}-commercial`, "exact-card ¥33,000"),
      specEvidence("phase408-elite95s-spec-status", "status", S.exact, SCOPE, "FES-1MM-B-EF/F/M official lineup"),
    ],
  },
  media: [
    {
      key: "phase408-pilot-elite95s-primary-svg",
      title: "Pilot Elite 95S 事实示意图（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: S.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不表现真实比例、颜色、Logo 或刻字。",
      sourceUrl: S.diagram.url,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "phase408-elite95s-1968-history",
      title: "Pilot 官方历史中的 Elite S 节点",
      eventType: "design_milestone",
      startDate: "1968",
      circa: true,
      description: "官方百年史记录 Elite S；它是 Elite 95S 的历史参照，不是 FES-1MM 的当前 SKU 规格。",
      sourceKey: S.history.key,
    },
    {
      key: "phase408-elite95s-current-listing",
      title: "FES-1MM-B-EF 当前日本目录卡",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "当前 exact page 展示 14K EF、短身 119 mm、15 g、CON-40 与 FES-1MM-B-F/M lineup；价格按日期保留。",
      sourceKey: S.exact.key,
    },
  ],
  conflicts: [],
};

export const phase408PilotElite95sRefreshPacks: CuratedEntityPack[] = [pack];
