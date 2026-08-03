import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import {
  PHASE60_CUSTOM_742_ID,
  PHASE60_PILOT_BRAND_ID,
  phase60PilotP0Packs,
} from "./phase60-pilot-p0";

export const PHASE406_PILOT_ID = PHASE60_PILOT_BRAND_ID;
export const PHASE406_742_ID = PHASE60_CUSTOM_742_ID;
export const PHASE406_742_SLUG = "pilot-custom-742";

const RETRIEVED = "2026-08-03";
const SCOPE = "phase406-pilot-custom-742-current";

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
  publishedAt?: string;
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

const base = phase60PilotP0Packs.find(
  (pack) => pack.entityId === PHASE406_742_ID && pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 60 Pilot Custom 742 prerequisite missing.");

const baseSource = (key: string): CuratedSource => {
  const found = base.sources.find((item) => item.key === key);
  if (!found) throw new Error(`Phase 60 source ${key} is missing.`);
  return found;
};

const S = {
  lineup: baseSource("phase60-pilot-custom-lineup"),
  history: baseSource("phase60-pilot-custom-history"),
  support: baseSource("phase60-pilot-742-support"),
  oldExact: baseSource("phase60-pilot-742-webcatalog-2026"),
  professional: baseSource("phase60-pilot-professional-review"),
  diagram: baseSource("phase60-pilot-742-svg"),
  exact: source({
    key: "phase406-pilot-742-exact-current",
    registryKey: "pilot-webcatalog-742-exact-phase406",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-742-exact-phase406",
    title: "FKK-2000R-B｜Custom 742｜PILOT Web Catalog",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000331&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary:
      "当前 exact card 列 FKK-2000R-B、黑色、14K No.10 F、螺纹嵌合、树脂轴帽、CON-40/CON-70N、145.9 mm、φ15.7 mm、24 g、Z-CR-N3 与十六种尖号 lineup。",
  }),
  price: source({
    key: "phase406-pilot-742-exact-price",
    registryKey: "pilot-webcatalog-742-price-phase406",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-742-price-phase406",
    title: "FKK-2000R-B current exact-card price",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000331&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary:
      "同一官方商品卡显示含税希望小卖价 ¥49,500、税前 ¥45,000；价格只属于日本当前 FKK-2000R-B 作用域。",
  }),
  warranty: source({
    key: "phase406-pilot-742-warranty-list",
    registryKey: "pilot-warranty-742-phase406",
    registryName: "PILOT international warranty",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-warranty-742-phase406",
    title: "Fountain Pens Products covered by the warranty",
    url: "https://www.pilot.co.jp/support/warranty/en-au/fountain/",
    homepageUrl: "https://www.pilot.co.jp/support/warranty/",
    summary:
      "国际保证清单把 CUSTOM 742 FKK-2000R 与 74、743、Heritage 912、823、845、Elite 95S 等路线分列。",
  }),
  manual: source({
    key: "phase406-pilot-fountain-manual",
    registryKey: "pilot-fountain-manual-742-phase406",
    registryName: "PILOT official manual",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-fountain-manual-742-phase406",
    title: "PILOT 万年筆使用说明书（日文 PDF）",
    url: "https://www.pilot.co.jp/support/manual/fountain/fountain_jp.pdf",
    homepageUrl: "https://www.pilot.co.jp/support/manual/",
    itemType: "pdf",
    summary: "通用说明补充墨囊、CON-40、CON-70N、清水吸排和安全保存步骤；742 专属限制以支持页为准。",
  }),
  category: source({
    key: "phase406-pilot-fountain-category",
    registryKey: "pilot-webcatalog-fountain-category-742-phase406",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-fountain-category-742-phase406",
    title: "PILOT Web Catalog Fountain Pen category",
    url: "https://webcatalog.pilot.co.jp/products/DispCate.do?category=%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E4%B8%87%E5%B9%B4%E7%AD%86&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary: "官方分类用于确认 Custom 742、743、823、845、Heritage 和 Elite 95S 为不同产品入口。",
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

const nibs = [
  ["F", "FKK-2000R-B", "Fine"],
  ["M", "FKK-2000R-B-M", "Medium"],
  ["B", "FKK-2000R-B-B", "Broad"],
  ["SF", "FKK-2000R-B-SF", "Soft Fine"],
  ["SM", "FKK-2000R-B-SM", "Soft Medium"],
  ["EF", "FKK-2000R-B-EF", "Extra Fine"],
  ["FM", "FKK-2000R-B-FM", "Fine Medium"],
  ["SFM", "FKK-2000R-B-SFM", "Soft Fine Medium"],
  ["BB", "FKK-2000R-B-BB", "Double Broad"],
  ["MS", "FKK-2000R-B-MS", "Music"],
  ["C", "FKK-2000R-B-C", "Calligraphy"],
  ["PO", "FKK-2000R-B-PO", "Posting"],
  ["WA", "FKK-2000R-B-WA", "Waverly"],
  ["FA", "FKK-2000R-B-FA", "Falcon"],
  ["SU", "FKK-2000R-B-SU", "Stub"],
  ["S", "FKK-2000R-B-S", "Stub"],
] as const;

const variants: CuratedVariant[] = [
  {
    key: "phase406-742-edition",
    name: "Custom 742 No.10 c/c 组",
    productCode: "FKK-2000R",
    releaseYear: "现行",
    notes: "Pilot 将 Custom 742 作为 No.10、墨囊/converter 路线列出；颜色、尖号和市场产品号下沉为原厂 variant。",
    sourceKey: S.exact.key,
    variantKind: "edition_group",
    market: "Pilot Japan",
  },
  ...nibs.map(([nib, productCode, english]) => ({
    key: `phase406-742-${nib.toLowerCase()}`,
    name: `FKK-2000R-B${nib === "F" ? "" : `-${nib}`} ${english} ${nib}`,
    productCode,
    releaseYear: "现行目录 lineup",
    notes: `官方 lineup 的 ${nib} 尖号；${english} 只是英文辅助标签，实际线宽和书写反馈仍需试写。后配或调磨尖不自动归入原厂 SKU。`,
    sourceKey: S.exact.key,
    variantKind: "market_sku" as const,
    parentVariantKey: "phase406-742-edition",
    market: "Pilot Japan",
  })),
];

const pack: CuratedEntityPack = {
  ...structuredClone(base),
  key: "phase406-pilot-custom-742-refresh-v1",
  entityId: PHASE406_742_ID,
  expectedSlug: PHASE406_742_SLUG,
  canonicalName: "百乐 Pilot Custom 742",
  markdownFile: ".planning/content-research/pilot-custom-742-phase406.md",
  storyTitle: "Pilot Custom 742：No.10 金尖、c/c 供墨与十六种原厂尖号边界",
  primarySourceKey: S.exact.key,
  depthTier: "A",
  aliases: [
    { alias: "Pilot Custom 742", language: "en", sourceKey: S.exact.key },
    { alias: "PILOT CUSTOM742", language: "en", sourceKey: S.lineup.key },
    { alias: "百乐 Custom 742", language: "zh", sourceKey: S.exact.key },
    { alias: "百乐 742", language: "zh", sourceKey: S.exact.key },
  ],
  sources: [...base.sources, S.exact, S.price, S.warranty, S.manual, S.category].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
  ),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Pilot Japan current FKK-2000R-B listing with official support and lineup",
      nibScope: "14K No.10；当前日本 lineup 的 F/M/B/SF/SM/EF/FM/SFM/BB/MS/C/PO/WA/FA/SU/S",
      materialScope: "当前 FKK-2000R-B 轴与笔帽为树脂；颜色、饰件和后配状态另记",
      editionScope: "Custom 742 FKK-2000R；不吸收 Custom 74 No.5、743 No.15、Heritage 912、823 真空、845 漆杆或 URUSHI",
    },
    {
      key: `${SCOPE}-commercial`,
      scopeKey: `${SCOPE}-commercial`,
      productionState: "unknown",
      editionScope: "当前日本 exact card：含税 ¥49,500；税前 ¥45,000；不外推其他市场或旧版价格",
    },
  ],
  claims: [
    claim(
      "phase406-742-identity",
      "model_identity",
      "Custom 742 是 Pilot 独立的 14K No.10 cartridge/converter 型号；FKK-2000R-B 黑色 F 与其余官方尖号属于同一实体下的原厂 SKU。",
      S.exact,
      "exact title, FKK-2000R-B code and 14K No.10 F field",
      [S.support, S.lineup, S.warranty],
    ),
    claim(
      "phase406-742-nibs",
      "nib_variants",
      "当前日本 lineup 共列 16 种笔尖：F、M、B、SF、SM、EF、FM、SFM、BB、MS、C、PO、WA、FA、SU、S；它们是 nib option，不是十六个独立型号。",
      S.exact,
      "official 16-nib lineup links",
      [S.lineup],
    ),
    claim(
      "phase406-742-material",
      "material_finish",
      "当前 FKK-2000R-B 商品卡的轴与笔帽材质为树脂、颜色为黑色；不能把 845 漆杆、槐/楓木材或 823 透明墨仓回填到 742。",
      S.exact,
      "official resin barrel/cap and black colour fields",
      [S.category],
    ),
    claim(
      "phase406-742-fill",
      "filling_system",
      "Custom 742 使用 Pilot 墨囊、CON-40 或 CON-70N；当前日本 FKK-2000R-B 商品卡随附 CON-70N，但二手包装不必然完整。",
      S.support,
      "official cartridge, CON-40 and CON-70N instructions",
      [S.exact, S.manual],
    ),
    claim(
      "phase406-742-mechanism",
      "mechanism",
      "742 采用螺纹嵌合笔帽与 c/c 供墨，不是 823 的真空柱塞；笔帽应旋紧但不应过度施力。",
      S.exact,
      "screw-fit method and resin barrel/cap fields",
      [S.professional],
    ),
    claim(
      "phase406-742-physical",
      "physical_specification",
      "当前 FKK-2000R-B 商品卡列全长 145.9 mm、最大径 φ15.7 mm、重量 24 g、使用盒 Z-CR-N3；数字属于日本黑色 F SKU 作用域。",
      S.exact,
      "official size, diameter, weight and case table",
    ),
    claim(
      "phase406-742-price",
      "commercial_snapshot",
      "当前日本 exact 商品卡显示含税希望小卖价 ¥49,500、税前 ¥45,000；不将它改写成全球成交价或所有颜色的固定售价。",
      S.price,
      "exact-card current Japanese price and tax scope",
      [S.exact],
    ),
    claim(
      "phase406-742-siblings",
      "version_boundary",
      "742 与 Custom 74 No.5、743 No.15、Heritage 912、823 真空、845 漆杆、URUSHI、Elite 95S 等相邻但身份独立；共同使用 Pilot converter 不足以合并实体。",
      S.warranty,
      "official covered-products list separates Custom routes",
      [S.category, S.history],
    ),
    claim(
      "phase406-742-care",
      "maintenance_boundary",
      "长期停用前排墨并清水吸排，避免热水、酒精等溶剂、航空气压、强烈冲击和自行拆修；笔帽与笔轴不可整体浸洗。",
      S.support,
      "official cleaning, storage, solvent, air-pressure and repair warnings",
      [S.manual],
    ),
    claim(
      "phase406-742-selection",
      "selection_guidance",
      "选购先核对 FKK-2000R、No.10、实际尖号、墨囊/CON-40/CON-70N、市场日期和笔况，再按纸张试写；不要用「大金尖」标题代替产品号。",
      S.exact,
      "exact SKU and nib lineup verification",
      [S.professional],
      "editorial",
    ),
    claim(
      "phase406-742-media",
      "media_identity_boundary",
      "本站主图是原创 factual SVG，明确非产品照片，不代表真实比例、颜色、刻字、价格校样或库存。",
      S.diagram,
      "site-original SVG attribution and non-product-photo boundary",
      [],
      "editorial",
    ),
  ],
  variants,
  spec: {
    brandEntityId: PHASE406_PILOT_ID,
    values: {
      series_name: "Pilot Custom 742 / FKK-2000R",
      release_year: "现行；当前 exact page 未披露 742 首发年份",
      origin_country: "日本 Pilot Custom 产品线；具体批次和地区库存按实物/目录核对",
      nib: "14K No.10；当前 FKK-2000R-B 为 F，官方 lineup 共 16 种尖号",
      fill_system: "Pilot 墨囊、CON-40 或 CON-70N",
      material: "当前 FKK-2000R-B：轴与笔帽为树脂；黑色",
      dimensions: "当前 FKK-2000R-B：全长 145.9 mm；最大径 φ15.7 mm",
      weight: "当前 FKK-2000R-B：24 g",
      price_range: "当前日本 exact 商品卡：含税 ¥49,500；税前 ¥45,000",
      status: "当前 FKK-2000R-B 与同一 lineup 的 16 种官方尖号；地区供应需另核",
    },
    evidence: [
      specEvidence("phase406-742-spec-brand", "brand_entity_id", S.exact, SCOPE, "Pilot maker context"),
      specEvidence("phase406-742-spec-series", "series_name", S.exact, SCOPE, "exact title and FKK-2000R code"),
      specEvidence("phase406-742-spec-release", "release_year", S.history, SCOPE, "current listing without first-launch year"),
      specEvidence("phase406-742-spec-origin", "origin_country", S.category, SCOPE, "Pilot Japan catalogue context"),
      specEvidence("phase406-742-spec-nib", "nib", S.exact, SCOPE, "14K No.10 F and 16-nib lineup"),
      specEvidence("phase406-742-spec-fill", "fill_system", S.exact, SCOPE, "CON-40 and CON-70N fields"),
      specEvidence("phase406-742-spec-material", "material", S.exact, SCOPE, "resin barrel/cap fields"),
      specEvidence("phase406-742-spec-dimensions", "dimensions", S.exact, SCOPE, "145.9 mm and φ15.7 mm"),
      specEvidence("phase406-742-spec-weight", "weight", S.exact, SCOPE, "24 g"),
      specEvidence("phase406-742-spec-price", "price_range", S.price, `${SCOPE}-commercial`, "exact-card ¥49,500"),
      specEvidence("phase406-742-spec-status", "status", S.exact, SCOPE, "FKK-2000R-B and 16-nib lineup"),
    ],
  },
  media: [
    {
      key: "phase406-pilot-742-primary-svg",
      title: "Pilot Custom 742 事实示意图（非产品照片）",
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
      key: "phase406-742-current-listing",
      title: "FKK-2000R-B 当前日本目录列出 No.10 F 与十六种尖号",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "当前 exact page 展开黑色 F 入口及 M/B/SF/SM/EF/FM/SFM/BB/MS/C/PO/WA/FA/SU/S lineup；首发年份未披露。",
      sourceKey: S.exact.key,
    },
    {
      key: "phase406-742-current-price",
      title: "FKK-2000R-B 当前商品卡建议价",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "当前 exact 商品卡显示含税 ¥49,500、税前 ¥45,000；未来价格按日期追加，不覆盖本快照。",
      sourceKey: S.price.key,
    },
  ],
  conflicts: [],
};

export const phase406PilotCustom742RefreshPacks: CuratedEntityPack[] = [pack];
