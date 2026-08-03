import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import {
  PHASE367_PILOT_BRAND_ID,
  PHASE367_SPECIAL_ALLOY_ID,
  PHASE367_SPECIAL_ALLOY_SLUG,
  phase367PilotCaplessFamilyPacks,
} from "./phase367-pilot-capless-families";

export const PHASE405_PILOT_ID = PHASE367_PILOT_BRAND_ID;
export const PHASE405_ALLOY_ID = PHASE367_SPECIAL_ALLOY_ID;
export const PHASE405_ALLOY_SLUG = PHASE367_SPECIAL_ALLOY_SLUG;

const RETRIEVED = "2026-08-03";
const SCOPE = "phase405-pilot-capless-special-alloy-current";

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

const base = phase367PilotCaplessFamilyPacks.find(
  (pack) => pack.entityId === PHASE405_ALLOY_ID && pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 367 Pilot Capless special alloy prerequisite missing.");

const baseSource = (key: string): CuratedSource => {
  const found = base.sources.find((item) => item.key === key);
  if (!found) throw new Error(`Phase 367 source ${key} is missing.`);
  return found;
};

const S = {
  exact: baseSource("phase367-pilot-special-alloy-exact"),
  support: baseSource("phase367-pilot-capless-covered"),
  care: baseSource("phase367-pilot-capless-care"),
  priceList: baseSource("phase367-pilot-price"),
  penAddict: baseSource("phase367-pilot-capless-professional"),
  press: baseSource("phase367-pilot-capless-press"),
  diagram: baseSource("phase367-alloy-svg"),
  exactPrice: source({
    key: "phase405-pilot-fcs1-exact-card-price",
    registryKey: "pilot-webcatalog-fcs1-price-phase405",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-fcs1-price-phase405",
    title: "FCS-1-MS-F｜current exact-card price",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100006188&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary:
      "同一 FCS-1 exact 商品卡给出含税希望小売 ¥17,600、税前 ¥16,000；不把其他 Capless 的 2026-07 改价外推到 FCS-1。",
  }),
  manual: source({
    key: "phase405-pilot-fountain-manual",
    registryKey: "pilot-fountain-manual-fcs1-phase405",
    registryName: "PILOT official manual",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-fountain-manual-fcs1-phase405",
    title: "PILOT 万年筆使用说明书（日文 PDF）",
    url: "https://www.pilot.co.jp/support/manual/fountain/fountain_jp.pdf",
    homepageUrl: "https://www.pilot.co.jp/support/manual/",
    itemType: "pdf",
    summary: "通用说明补充墨囊、清水吸排和保存步骤；Capless head 与轴的限制仍以专属护理页为准。",
  }),
  category: source({
    key: "phase405-pilot-fountain-category",
    registryKey: "pilot-webcatalog-fountain-category-fcs1-phase405",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-fountain-category-fcs1-phase405",
    title: "PILOT Web Catalog Fountain Pen category",
    url: "https://webcatalog.pilot.co.jp/products/DispCate.do?category=%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E4%B8%87%E5%B9%B4%E7%AD%86&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary: "官方分类用于确认 FCS-1、普通 Capless、Stripe、絣与 SE 以不同产品码并列。",
  }),
  history: source({
    key: "phase405-pilot-custom-history",
    registryKey: "pilot-custom-history-fcs1-phase405",
    registryName: "PILOT CUSTOM official",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "pilot-custom-history-fcs1-phase405",
    title: "PILOT CUSTOM History",
    url: "https://www.pilot-custom.jp/en/history/",
    homepageUrl: "https://www.pilot-custom.jp/en/",
    summary: "仅作为 Pilot 家族背景参照，不把家族年表推写成 FCS-1 首发年份。",
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
    key: "phase405-alloy-edition",
    name: "Capless FCS-1 特殊合金哑光 finish 组",
    productCode: "FCS-1",
    releaseYear: "现行",
    notes: "官方 exact page 将 FCS-1 作为特殊合金尖路线列出；四种哑光颜色与 F/M 子 SKU 归在同一型号下。",
    sourceKey: S.exact.key,
    variantKind: "edition_group",
    market: "Pilot Japan",
  },
  ...[
    ["MS", "Matte Silver", "哑光银"],
    ["MCO", "Matte Copper", "哑光铜"],
    ["MDG", "Matte Deep Green", "哑光深绿"],
    ["MAL", "Matte Ash Blue", "哑光灰蓝"],
  ].flatMap(([code, english, chinese]) =>
    (["F", "M"] as const).map((nib) => ({
      key: `phase405-alloy-${String(code).toLowerCase()}-${nib.toLowerCase()}`,
      name: `FCS-1-${code}-${nib} ${english} ${chinese} ${nib}`,
      productCode: `FCS-1-${code}-${nib}`,
      releaseYear: "现行",
      notes: `官方 lineup 的 ${english}（${chinese}）${nib} SKU；特殊合金尖、CON-40、黄铜涂装轴和按动结构属于同一 FCS-1 平台。`,
      sourceKey: S.exact.key,
      variantKind: "market_sku" as const,
      parentVariantKey: "phase405-alloy-edition",
      market: "Pilot Japan",
    })),
  ),
];

const pack: CuratedEntityPack = {
  ...structuredClone(base),
  key: "phase405-pilot-capless-special-alloy-refresh-v1",
  entityId: PHASE405_ALLOY_ID,
  expectedSlug: PHASE405_ALLOY_SLUG,
  canonicalName: "百乐 Pilot Capless 特殊合金（FCS-1）",
  markdownFile: ".planning/content-research/pilot-capless-special-alloy-phase405.md",
  storyTitle: "Pilot Capless FCS-1：特殊合金尖、四种哑光颜色与按动维护边界",
  primarySourceKey: S.exact.key,
  depthTier: "A",
  aliases: [
    { alias: "キャップレス FCS-1", language: "ja", sourceKey: S.exact.key },
    { alias: "Pilot Capless Special Alloy", language: "en", sourceKey: S.penAddict.key },
    { alias: "FCS-1", language: "und", sourceKey: S.exact.key },
    { alias: "百乐 Capless 特殊合金", language: "zh", sourceKey: S.exact.key },
  ],
  sources: [...base.sources, S.exactPrice, S.manual, S.category, S.history].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
  ),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Pilot Japan current FCS-1 listing with official care and exact-card price",
      nibScope: "特殊合金；FCS-1-MS/MCO/MDG/MAL 的 F/M；改尖和后配 head 另记",
      materialScope: "轴为黄铜＋涂装；head 为不锈钢；clip 为铁钢；哑光 finish",
      editionScope: "Capless FCS-1；不吸收普通 FC-18SR、Stripe FC-3MS、絣 FCN-2MR、SE FCSE-3MR、Decimo、LS、Raden、Wood 或 Custom",
    },
    {
      key: `${SCOPE}-commercial`,
      scopeKey: `${SCOPE}-commercial`,
      productionState: "unknown",
      editionScope: "exact 商品卡含税 ¥17,600（税前 ¥16,000）；其他地区和日期价格不外推",
    },
  ],
  claims: [
    claim(
      "phase405-identity",
      "model_identity",
      "Pilot Capless 特殊合金路线的官方型号是 FCS-1；FCS-1-MS/MCO/MDG/MAL 与 F/M 组合是同一实体下的八个原厂 market SKU。",
      S.exact,
      "exact title, FCS-1 code and four-colour F/M lineup",
      [S.category, S.support],
    ),
    claim(
      "phase405-nib-boundary",
      "nib_boundary",
      "FCS-1 exact page 将笔种写为特殊合金 F，lineup 另列 M；本页不把普通 Capless、Stripe、絣或 SE 的 18K 字段回填到 FCS-1。",
      S.exact,
      "special alloy F field and F/M lineup",
      [S.press, S.support],
    ),
    claim(
      "phase405-colours",
      "finish_variants",
      "MS 是 Matte Silver，MCO 是 Matte Copper，MDG 是 Matte Deep Green，MAL 是 Matte Ash Blue；颜色代码优先于卖家昵称和照片白平衡。",
      S.exact,
      "official four matte colour codes",
      [S.diagram],
    ),
    claim(
      "phase405-material",
      "material_finish",
      "官方组件字段分别列轴为黄铜＋涂装、head 为不锈钢、clip 为铁钢；哑光是表面 finish，不是天然石材、木材或裸铜尖。",
      S.exact,
      "brass with coating, stainless head and iron-steel clip fields",
      [S.diagram],
    ),
    claim(
      "phase405-mechanism",
      "mechanism",
      "FCS-1 使用 Capless 按动伸缩结构；按一次出尖、再按一次收尖，收尖后应确认 shutter 完整闭合。",
      S.care,
      "official knock/retract and shutter care instructions",
      [S.exact, S.penAddict],
    ),
    claim(
      "phase405-fill",
      "filling_system",
      "FCS-1 使用 Pilot 墨囊或 CON-40；换墨前先收尖，按导槽拆装，converter 残墨应清水洗净并干燥。",
      S.care,
      "official cartridge and CON-40 procedure",
      [S.manual, S.exact],
    ),
    claim(
      "phase405-physical",
      "physical_specification",
      "FCS-1-MS-F 当前商品卡给出全长 140 mm、最大径 φ13.4 mm、重量 30 g 和专用ケース；这些数字属于日本 exact card 作用域。",
      S.exact,
      "official size, diameter, weight and case fields",
    ),
    claim(
      "phase405-price",
      "commercial_snapshot",
      "当前 FCS-1 exact 商品卡显示含税 ¥17,600（税前 ¥16,000）；2026-07 价目表没有在同一表格替代 FCS-1 价格，不能借其他 Capless 改价外推。",
      S.exactPrice,
      "exact-card current price and price-scope boundary",
      [S.priceList, S.exact],
    ),
    claim(
      "phase405-siblings",
      "version_boundary",
      "FCS-1 与普通 FC-18SR、Stripe FC-3MS、絣 FCN-2MR、SE FCSE-3MR、Decimo、LS、Raden、Wood 及 Custom 系列相邻但身份独立。",
      S.support,
      "official covered-products list separates Capless routes",
      [S.category, S.history],
    ),
    claim(
      "phase405-care",
      "maintenance_boundary",
      "长期停用前排墨并清水吸排，避免酒精等溶剂、飞机气压、强烈撞击和自行拆修；head 与轴不能整体浸洗。",
      S.care,
      "official cleaning, solvent, air-pressure and repair warnings",
      [S.manual],
    ),
    claim(
      "phase405-selection",
      "selection_guidance",
      "选购先核对完整 FCS-1-MS/MCO/MDG/MAL-F/M、特殊合金、按键回弹、CON-40 接口、涂装笔况和价格日期，再按纸张试写；哑光照片不能替代产品号。",
      S.exact,
      "exact SKU and variant verification",
      [S.penAddict],
      "editorial",
    ),
    claim(
      "phase405-media",
      "media_identity_boundary",
      "本站主图是原创 factual SVG，明确 non-photo、non-logo、not-to-scale、non-colour-proof，不代表真实照片、颜色校样、比例或库存。",
      S.diagram,
      "site-original SVG attribution and non-product-photo boundary",
      [],
      "editorial",
    ),
  ],
  variants,
  spec: {
    brandEntityId: PHASE405_PILOT_ID,
    values: {
      series_name: "Pilot Capless Special Alloy / FCS-1",
      release_year: "现行；当前 exact page 未披露 FCS-1 首发年份",
      origin_country: "日本 Pilot 产品线；具体批次和地区库存按实物/目录核对",
      nib: "特殊合金；FCS-1-MS/MCO/MDG/MAL 的 F/M，非 18K",
      fill_system: "Pilot 墨囊或 CON-40",
      material: "轴：黄铜＋涂装；head：不锈钢；clip：铁钢；哑光 finish",
      dimensions: "全长 140 mm；最大径 φ13.4 mm",
      weight: "30 g",
      price_range: "当前 exact 商品卡：含税 ¥17,600；税前 ¥16,000",
      status: "当前 FCS-1；四种哑光颜色 × F/M 八个 market SKU",
    },
    evidence: [
      specEvidence("phase405-spec-brand", "brand_entity_id", S.exact, SCOPE, "Pilot maker context"),
      specEvidence("phase405-spec-series", "series_name", S.exact, SCOPE, "exact title and FCS-1 code"),
      specEvidence("phase405-spec-release", "release_year", S.exact, SCOPE, "current listing without first-launch year"),
      specEvidence("phase405-spec-origin", "origin_country", S.category, SCOPE, "Pilot Japan catalogue context"),
      specEvidence("phase405-spec-nib", "nib", S.exact, SCOPE, "special alloy and four-colour F/M lineup"),
      specEvidence("phase405-spec-fill", "fill_system", S.exact, SCOPE, "CON-40 field"),
      specEvidence("phase405-spec-material", "material", S.exact, SCOPE, "component material fields"),
      specEvidence("phase405-spec-dimensions", "dimensions", S.exact, SCOPE, "140 mm and φ13.4 mm"),
      specEvidence("phase405-spec-weight", "weight", S.exact, SCOPE, "30 g"),
      specEvidence("phase405-spec-price", "price_range", S.exactPrice, `${SCOPE}-commercial`, "exact-card ¥17,600"),
      specEvidence("phase405-spec-status", "status", S.exact, SCOPE, "MS/MCO/MDG/MAL F/M lineup"),
    ],
  },
  media: [
    {
      key: "phase405-pilot-alloy-primary-svg",
      title: "Pilot Capless FCS-1 事实示意图（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: S.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof，不代表真实颜色、价格或库存。",
      sourceUrl: S.diagram.url,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "phase405-alloy-current-lineup",
      title: "FCS-1 当前日本目录列出四种哑光色与八个 F/M SKU",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "当前 exact page 展开 MS/MCO/MDG/MAL 与 F/M；首发年份未在该页披露。",
      sourceKey: S.exact.key,
    },
    {
      key: "phase405-alloy-current-price",
      title: "FCS-1 当前商品卡建议价",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "当前 exact 商品卡显示含税 ¥17,600（税前 ¥16,000）；未来价目更新按日期追加。",
      sourceKey: S.exactPrice.key,
    },
  ],
  conflicts: [],
};

export const phase405PilotCaplessSpecialAlloyRefreshPacks: CuratedEntityPack[] = [pack];
