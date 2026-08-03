import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import {
  PHASE367_PILOT_BRAND_ID,
  PHASE367_SE_ID,
  PHASE367_SE_SLUG,
  phase367PilotCaplessFamilyPacks,
} from "./phase367-pilot-capless-families";

export const PHASE404_PILOT_ID = PHASE367_PILOT_BRAND_ID;
export const PHASE404_SE_ID = PHASE367_SE_ID;
export const PHASE404_SE_SLUG = PHASE367_SE_SLUG;

const RETRIEVED = "2026-08-03";
const SCOPE = "phase404-pilot-capless-se-current";

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
    license: input.license,
    archiveUrl: input.url,
    archiveLocator: siteOriginal
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

const S = {
  exact: source({
    key: "phase404-pilot-se-exact",
    registryKey: "pilot-webcatalog-capless-se-phase404",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-capless-se-phase404",
    title: "FCSE-3MR-MAR-F｜キャップレスSE｜PILOTウェブカタログ",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100002926&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary:
      "exact SKU 页列 FCSE-3MR-MAR-F、Marble Red、18K F、ノブノック式、氨基甲酸酯树脂、CON-40、全长 140 mm、最大径 14 mm、重量 26 g、Z-CR-N3、含税 ¥44,000，并展开 MAB/MAL/MAG/MAR/MAO × F/M。",
  }),
  care: source({
    key: "phase404-pilot-se-care",
    registryKey: "pilot-support-capless-se-phase404",
    registryName: "PILOT official support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-support-capless-se-phase404",
    title: "キャップレス use and care guide",
    url: "https://www.pilot.co.jp/support/warranty/jp/fountain/capless_2.html",
    homepageUrl: "https://www.pilot.co.jp/support/warranty/jp/fountain/",
    summary:
      "官方护理页说明按动伸缩、收尖后拆装、墨囊/CON-40、清水吸排、head 与轴的清洗边界，以及反复急按、航空气压、溶剂和自行拆修警告。",
  }),
  warranty: source({
    key: "phase404-pilot-se-warranty",
    registryKey: "pilot-warranty-list-se-phase404",
    registryName: "PILOT international warranty",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-warranty-list-se-phase404",
    title: "Fountain Pens Products covered by the warranty",
    url: "https://www.pilot.co.jp/support/warranty/en-au/fountain/",
    homepageUrl: "https://www.pilot.co.jp/support/warranty/",
    summary:
      "国际保证清单把 Capless SE FCSE-3MR 与 Custom Heritage SE、Stripe、KASURI、Decimo、LS、Raden、Wood 等路线分别列出。",
  }),
  price: source({
    key: "phase404-pilot-se-price",
    registryKey: "pilot-webcatalog-se-price-phase404",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-se-price-phase404",
    title: "FCSE-3MR-MAR-F official current price",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100002926&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary:
      "同一 exact 商品卡给出含税希望小売 ¥44,000（税前 ¥40,000）；不把 2026-07 价目表中其他 Capless 的改价外推到 SE。",
  }),
  manual: source({
    key: "phase404-pilot-fountain-manual",
    registryKey: "pilot-fountain-manual-se-phase404",
    registryName: "PILOT official manual",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-fountain-manual-se-phase404",
    title: "PILOT 万年筆使用说明书（日文 PDF）",
    url: "https://www.pilot.co.jp/support/manual/fountain/fountain_jp.pdf",
    homepageUrl: "https://www.pilot.co.jp/support/manual/",
    itemType: "pdf",
    summary:
      "Pilot 通用说明补充墨囊、清水吸排和保存步骤；Capless head/轴限制仍以专属护理页为准。",
  }),
  category: source({
    key: "phase404-pilot-fountain-category",
    registryKey: "pilot-webcatalog-fountain-category-se-phase404",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-fountain-category-se-phase404",
    title: "PILOT Web Catalog Fountain Pen category",
    url: "https://webcatalog.pilot.co.jp/products/DispCate.do?category=%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E4%B8%87%E5%B9%B4%E7%AD%86&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary:
      "官方目录入口用于确认 Capless SE、Stripe、絣、普通 Capless 与 Custom Heritage SE 在分类和产品码上分立。",
  }),
  press: source({
    key: "phase404-pilot-capless-press",
    registryKey: "pilot-capless-press-se-phase404",
    registryName: "PILOT official press",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "pilot-capless-press-se-phase404",
    title: "万年筆『キャップレス』新色発売",
    url: "https://www.pilot.co.jp/press_release/2026/03/05/post_150.html",
    homepageUrl: "https://www.pilot.co.jp/press_release/",
    publishedAt: "2026-03-05",
    summary:
      "Pilot 新闻稿提供 Capless 按动与 18K/特殊合金产品路线的背景，不把新闻稿颜色或 FCS-1 回填为 SE 颜色。",
  }),
  history: source({
    key: "phase404-pilot-custom-history",
    registryKey: "pilot-custom-history-se-phase404",
    registryName: "PILOT CUSTOM official",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "pilot-custom-history-se-phase404",
    title: "PILOT CUSTOM History",
    url: "https://www.pilot-custom.jp/en/history/",
    homepageUrl: "https://www.pilot-custom.jp/en/",
    summary:
      "CUSTOM 历史仅作为 Pilot 家族和 Heritage SE 名称的背景参照，不把 Custom Heritage SE 的年表写成 Capless SE 上市年份。",
  }),
  penAddict: source({
    key: "phase404-penaddict-capless-review",
    registryKey: "pen-addict-capless-se-phase404",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-addict-capless-se-phase404",
    title: "Pilot Vanishing Point Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2012/5/9/pilot-vanishing-point-fountain-pen-review.html",
    homepageUrl: "https://www.penaddict.com/",
    author: "The Pen Addict",
    summary:
      "专业评测补充普通全尺寸 Capless 的按动、前夹和日用体验；个人样本不覆盖 FCSE-3MR 纹理、树脂批次或当前价格。",
  }),
  diagram: source({
    key: "phase404-pilot-se-svg",
    registryKey: "fountain-pen-graph-editorial-se-phase404",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-se-phase404",
    title: "Pilot Capless SE 事实示意图（非产品照片）",
    url: "/images/library/site-original/pilot/capless-se.svg",
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    allowedUse: "store_full",
    license: "site-original",
    summary:
      "本站原创 factual SVG 表达 FCSE-3MR、大理石树脂、18K F/M、按动、CON-40、140 mm、14 mm、26 g；明确 non-photo、non-logo、not-to-scale、non-colour-proof。",
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

const base = phase367PilotCaplessFamilyPacks.find(
  (pack) => pack.entityId === PHASE404_SE_ID && pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 367 Pilot Capless SE prerequisite missing.");

const variants: CuratedVariant[] = [
  {
    key: "phase404-se-edition",
    name: "Capless SE 大理石 finish 组",
    productCode: "FCSE-3MR",
    releaseYear: "现行",
    notes: "官方把氨基甲酸酯树脂 marble Capless SE 作为 FCSE-3MR 独立产品；五色 × F/M 子 SKU 另列。",
    sourceKey: S.exact.key,
    variantKind: "edition_group",
    market: "Pilot Japan",
  },
  ...[
    ["MAB", "black", "大理石黑"],
    ["MAL", "blue", "大理石蓝"],
    ["MAG", "green", "大理石绿"],
    ["MAR", "red", "大理石红"],
    ["MAO", "orange", "大理石橙"],
  ].flatMap(([code, key, label]) =>
    (["F", "M"] as const).map((nib) => ({
      key: `phase404-se-${key}-${nib.toLowerCase()}`,
      name: `FCSE-3MR-${code}-${nib} ${label} ${nib}`,
      productCode: `FCSE-3MR-${code}-${nib}`,
      releaseYear: "现行",
      notes: `官方 lineup 的 ${label} ${nib} SKU；18K、CON-40、氨基甲酸酯树脂和按动结构属于同一 FCSE-3MR 平台。`,
      sourceKey: S.exact.key,
      variantKind: "market_sku" as const,
      parentVariantKey: "phase404-se-edition",
      market: "Pilot Japan",
    })),
  ),
];

const pack: CuratedEntityPack = {
  ...structuredClone(base),
  key: "phase404-pilot-capless-se-refresh-v1",
  entityId: PHASE404_SE_ID,
  expectedSlug: PHASE404_SE_SLUG,
  canonicalName: "百乐 Pilot Capless SE（大理石）",
  markdownFile: ".planning/content-research/pilot-capless-se-phase404.md",
  storyTitle: "Pilot Capless SE：FCSE-3MR 大理石纹理、按动结构与五色版本边界",
  primarySourceKey: S.exact.key,
  depthTier: "A",
  aliases: [
    { alias: "キャップレスSE", language: "ja", sourceKey: S.exact.key },
    { alias: "Pilot Capless SE", language: "en", sourceKey: S.penAddict.key },
    { alias: "FCSE-3MR", language: "und", sourceKey: S.exact.key },
    { alias: "百乐 Capless 大理石", language: "zh", sourceKey: S.exact.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Pilot Japan current FCSE-3MR listing with official care and current exact-card price",
      nibScope: "18K；FCSE-3MR-MAB/MAL/MAG/MAR/MAO 的 F/M；改尖和后配尖另记",
      materialScope: "轴为氨基甲酸酯树脂；大理石是 finish 描述，不写成天然石材",
      editionScope: "Capless SE FCSE-3MR；不吸收 Custom Heritage SE FKVH-3MR、FC-3MS、FCN-2MR、FCT-15SR、FCLS-35SR、FCN-5MP、FC-25SK 或 FCS-1",
    },
    {
      key: `${SCOPE}-commercial`,
      scopeKey: `${SCOPE}-commercial`,
      productionState: "unknown",
      editionScope: "exact 商品卡含税 ¥44,000（税前 ¥40,000）；其他日期和地区价格不外推",
    },
  ],
  claims: [
    claim(
      "phase404-identity",
      "model_identity",
      "Pilot Capless SE 是官方产品号 FCSE-3MR 的独立按动型号；MAB/MAL/MAG/MAR/MAO 与 F/M 组合属于同一实体下的十个原厂 SKU。",
      S.exact,
      "exact title, FCSE-3MR code and five-colour F/M lineup",
      [S.warranty, S.category],
    ),
    claim(
      "phase404-name",
      "name_boundary",
      "官方说明 SE 来自法语 Seul；这解释产品命名背景，不把 Capless SE 与 Custom Heritage SE FKVH-3MR 合并。",
      S.exact,
      "official SE naming note",
      [S.warranty, S.history],
    ),
    claim(
      "phase404-material",
      "material_finish",
      "FCSE-3MR 轴材质为氨基甲酸酯树脂，大理石是光泽纹理 finish；官方没有把它定义为天然石材、织物、木材或天然漆。",
      S.exact,
      "urethane resin material and marble finish fields",
      [S.diagram],
    ),
    claim(
      "phase404-mechanism",
      "mechanism",
      "Capless SE 采用按动式伸缩；按一次出尖，再按一次收尖，shutter 在收尖后帮助减少暴露和干燥，不用时应确认完整收尖。",
      S.care,
      "official knock/retract and storage instructions",
      [S.penAddict, S.exact],
    ),
    claim(
      "phase404-nib",
      "nib_boundary",
      "FCSE-3MR-MAR-F exact page 列 18K F，lineup 另列五色 M；F/M 是原厂尖幅，不把 FCS-1 特殊合金或改磨尖回填到 SE。",
      S.exact,
      "18K F field and MAB/MAL/MAG/MAR/MAO F/M lineup",
      [S.press],
    ),
    claim(
      "phase404-fill",
      "filling_system",
      "FCSE-3MR 使用 Pilot 墨囊或 CON-40；换墨前先收尖，按官方导槽顺序拆装，converter 残墨应清水洗净并干燥。",
      S.care,
      "official cartridge and CON-40 procedure",
      [S.exact, S.manual],
    ),
    claim(
      "phase404-physical",
      "physical_specification",
      "当前 FCSE-3MR-MAR-F 商品卡给出全长 140 mm、最大径 φ14 mm、重量 26 g、使用盒 Z-CR-N3；作用域是官方商品卡。",
      S.exact,
      "official size, weight and case table",
    ),
    claim(
      "phase404-price",
      "commercial_snapshot",
      "当前 exact 商品卡显示含税 ¥44,000（税前 ¥40,000）；2026-07 价目表未在同一表格替代 FCSE-3MR，不能借其他 Capless 的改价制造 SE 价格。",
      S.price,
      "exact-card price and price-scope boundary",
      [S.exact],
    ),
    claim(
      "phase404-siblings",
      "version_boundary",
      "FCSE-3MR 与普通 FC-18SR、Stripe FC-3MS、絣 FCN-2MR、Custom Heritage SE FKVH-3MR、Decimo、LS、Raden、Wood 和 FCS-1 是相邻但独立的产品线。",
      S.warranty,
      "official covered-products list separates Capless and Heritage SE",
      [S.category, S.history],
    ),
    claim(
      "phase404-care",
      "maintenance_boundary",
      "Pilot 要求长期停用前排墨并用清水吸排，避免高低温、直射日光、酒精等溶剂、飞机气压和自行拆修；head 与轴不可整体浸洗。",
      S.care,
      "official care, solvent, air-pressure and repair warnings",
      [S.manual],
    ),
    claim(
      "phase404-selection",
      "selection_guidance",
      "选 Capless SE 先核对 FCSE-3MR 颜色代码、F/M、18K、氨基甲酸酯树脂、CON-40、140 mm、14 mm、26 g 和价格日期，再按常用纸张试写；纹理照片不能替代产品号。",
      S.exact,
      "exact SKU and variant verification",
      [S.penAddict],
      "editorial",
    ),
    claim(
      "phase404-media",
      "media_identity_boundary",
      "本站主图是原创 factual SVG，明确 non-photo、non-logo、not-to-scale、non-colour-proof，不代表真实纹理、颜色校样、光泽或库存。",
      S.diagram,
      "site-original SVG attribution and non-product-photo boundary",
      [],
      "editorial",
    ),
  ],
  variants,
  spec: {
    brandEntityId: PHASE404_PILOT_ID,
    values: {
      series_name: "Pilot Capless SE / FCSE-3MR",
      release_year: "现行；当前 exact page 未披露 FCSE-3MR 首发年份",
      origin_country: "日本 Pilot 产品线；具体批次和地区库存按实物/目录核对",
      nib: "18K；MAB/MAL/MAG/MAR/MAO 的 F/M",
      fill_system: "Pilot 墨囊或 CON-40",
      material: "轴：氨基甲酸酯树脂；大理石纹理 finish",
      dimensions: "全长 140 mm；最大径 φ14 mm",
      weight: "26 g",
      price_range: "当前 exact 商品卡：含税 ¥44,000；税前 ¥40,000",
      status: "当前 FCSE-3MR；五色 × F/M 十个 market SKU",
    },
    evidence: [
      specEvidence("phase404-spec-brand", "brand_entity_id", S.exact, SCOPE, "Pilot maker context"),
      specEvidence("phase404-spec-series", "series_name", S.exact, SCOPE, "exact title and FCSE-3MR code"),
      specEvidence("phase404-spec-release", "release_year", S.exact, SCOPE, "current listing without first-launch year"),
      specEvidence("phase404-spec-origin", "origin_country", S.category, SCOPE, "Pilot Japan catalogue context"),
      specEvidence("phase404-spec-nib", "nib", S.exact, SCOPE, "18K and five-colour F/M lineup"),
      specEvidence("phase404-spec-fill", "fill_system", S.exact, SCOPE, "CON-40 field"),
      specEvidence("phase404-spec-material", "material", S.exact, SCOPE, "urethane resin and marble wording"),
      specEvidence("phase404-spec-dimensions", "dimensions", S.exact, SCOPE, "140 mm and φ14 mm"),
      specEvidence("phase404-spec-weight", "weight", S.exact, SCOPE, "26 g"),
      specEvidence("phase404-spec-price", "price_range", S.price, `${SCOPE}-commercial`, "exact-card ¥44,000"),
      specEvidence("phase404-spec-status", "status", S.exact, SCOPE, "MAB/MAL/MAG/MAR/MAO F/M lineup"),
    ],
  },
  media: [
    {
      key: "phase404-pilot-se-primary-svg",
      title: "Pilot Capless SE 事实示意图（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: S.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof，不代表真实纹理、颜色、价格或库存。",
      sourceUrl: S.diagram.url,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "phase404-se-current-listing",
      title: "FCSE-3MR 当前日本目录列出五色十 SKU",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "当前 exact page 展开 MAB/MAL/MAG/MAR/MAO 与 F/M 十个组合；首发年份未在该页披露。",
      sourceKey: S.exact.key,
    },
    {
      key: "phase404-se-current-price",
      title: "FCSE-3MR 当前商品卡建议价",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "当前 exact 商品卡显示含税 ¥44,000（税前 ¥40,000）；后续价目更新按日期新增，不覆盖本快照。",
      sourceKey: S.exact.key,
    },
  ],
  conflicts: [],
};

export const phase404PilotCaplessSeRefreshPacks: CuratedEntityPack[] = [pack];
