import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import {
  PHASE367_KASURI_ID,
  PHASE367_KASURI_SLUG,
  PHASE367_PILOT_BRAND_ID,
  phase367PilotCaplessFamilyPacks,
} from "./phase367-pilot-capless-families";

export const PHASE402_PILOT_ID = PHASE367_PILOT_BRAND_ID;
export const PHASE402_KASURI_ID = PHASE367_KASURI_ID;
export const PHASE402_KASURI_SLUG = PHASE367_KASURI_SLUG;

const RETRIEVED = "2026-08-03";
const SCOPE = "phase402-pilot-capless-kasuri-current";

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
    key: "phase402-pilot-kasuri-exact",
    registryKey: "pilot-webcatalog-kasuri-phase402",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-kasuri-phase402",
    title: "FCN-2MR-KB-F｜キャップレス・絣｜PILOTウェブカタログ",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100003597&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary:
      "当前 exact SKU 页列 FCN-2MR-KB-F：絣黑 F、18K、ノック式、CON-40、全长 140 mm、最大径 13.4 mm、重量 30 g、使用盒 Z-CR-N3，并展开 KB/KL 的 F/M lineup；页面价格为 ¥35,200。",
  }),
  care: source({
    key: "phase402-pilot-kasuri-care",
    registryKey: "pilot-support-capless-kasuri-phase402",
    registryName: "PILOT official support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-support-capless-kasuri-phase402",
    title: "キャップレス use and care guide",
    url: "https://www.pilot.co.jp/support/warranty/jp/fountain/capless_2.html",
    homepageUrl: "https://www.pilot.co.jp/support/warranty/jp/fountain/",
    summary:
      "官方护理页说明按键伸出/收回、收尖后装墨、CON-40 吸墨、清水清洁、不可清洗 head/轴、溶剂和航空气压边界。",
  }),
  warranty: source({
    key: "phase402-pilot-kasuri-warranty-list",
    registryKey: "pilot-warranty-list-kasuri-phase402",
    registryName: "PILOT international warranty",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-warranty-list-kasuri-phase402",
    title: "Fountain Pens Products covered by the warranty",
    url: "https://www.pilot.co.jp/support/warranty/en-au/fountain/",
    homepageUrl: "https://www.pilot.co.jp/support/warranty/",
    summary:
      "Pilot 国际保证清单把 Capless KASURI FCN-2MR 与 Stripe、SE、普通 Capless、Decimo、LS、Raden 等路线分别列出，用于身份边界。",
  }),
  price: source({
    key: "phase402-pilot-kasuri-price",
    registryKey: "pilot-price-list-202607-kasuri-phase402",
    registryName: "PILOT official information",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "pilot-price-list-202607-kasuri-phase402",
    title: "価格表 2026年7月1日付",
    url: "https://www.pilot.co.jp/information/pricelist_202607.pdf",
    homepageUrl: "https://www.pilot.co.jp/information/",
    itemType: "pdf",
    publishedAt: "2026-07-01",
    summary:
      "官方价格表把 FCN-2MR 从 ¥35,200 修订为 ¥38,500；这是日本建议价的日期快照，不覆盖旧商品页、海外库存或二手成交价。",
  }),
  manual: source({
    key: "phase402-pilot-fountain-manual",
    registryKey: "pilot-fountain-manual-kasuri-phase402",
    registryName: "PILOT official manual",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-fountain-manual-kasuri-phase402",
    title: "PILOT 万年筆使用说明书（日文 PDF）",
    url: "https://www.pilot.co.jp/support/manual/fountain/fountain_jp.pdf",
    homepageUrl: "https://www.pilot.co.jp/support/manual/",
    itemType: "pdf",
    summary:
      "Pilot 通用说明补充墨囊、清水吸排和收纳步骤；Capless 的 head/按动限制仍以专属护理页为准。",
  }),
  category: source({
    key: "phase402-pilot-fountain-category",
    registryKey: "pilot-webcatalog-fountain-category-phase402",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-fountain-category-phase402",
    title: "PILOT Web Catalog Fountain Pen category",
    url: "https://webcatalog.pilot.co.jp/products/DispCate.do?category=%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E4%B8%87%E5%B9%B4%E7%AD%86&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary:
      "官方万年笔目录入口用于确认絣、Stripe、SE、普通 Capless 等在同一产品目录中分立；不替代 exact SKU 的数字。",
  }),
  customHistory: source({
    key: "phase402-pilot-custom-history",
    registryKey: "pilot-custom-history-kasuri-phase402",
    registryName: "PILOT CUSTOM official",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "pilot-custom-history-kasuri-phase402",
    title: "PILOT CUSTOM History",
    url: "https://www.pilot-custom.jp/en/history/",
    homepageUrl: "https://www.pilot-custom.jp/en/",
    summary:
      "CUSTOM 官方历史只作为 Pilot 型号编号和相邻 Custom 结构的背景参照，不把 CUSTOM 年表误写成 Capless 絣的上市年份。",
  }),
  penAddict: source({
    key: "phase402-penaddict-capless-review",
    registryKey: "pen-addict-capless-kasuri-phase402",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-addict-capless-kasuri-phase402",
    title: "Pilot Vanishing Point Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2012/5/9/pilot-vanishing-point-fountain-pen-review.html",
    homepageUrl: "https://www.penaddict.com/",
    author: "The Pen Addict",
    summary:
      "专业评测补充普通全尺寸 Capless 的按动、夹子与日用体验；个人样本不覆盖 FCN-2MR 纹理、颜色或当前价格。",
  }),
  press: source({
    key: "phase402-pilot-capless-press",
    registryKey: "pilot-capless-press-kasuri-phase402",
    registryName: "PILOT official press",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "pilot-capless-press-kasuri-phase402",
    title: "PILOT Capless product press context",
    url: "https://www.pilot.co.jp/press_release/2026/03/05/post_150.html",
    homepageUrl: "https://www.pilot.co.jp/press_release/",
    publishedAt: "2026-03-05",
    summary:
      "Pilot 新闻稿提供 Capless 按动与 18K/特殊合金并行产品路线的背景，用于强调 FCS-1 不应回填 FCN-2MR 的 18K。",
  }),
  diagram: source({
    key: "phase402-pilot-kasuri-svg",
    registryKey: "fountain-pen-graph-editorial-kasuri-phase402",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-kasuri-phase402",
    title: "Pilot Capless 絣 事实示意图（非产品照片）",
    url: "/images/library/site-original/pilot/capless-kasuri.svg",
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    summary:
      "本站原创 factual SVG 表达 FCN-2MR、絣黑/絣蓝、18K F/M、按动和 CON-40；明确为 non-photo、non-logo、not-to-scale、non-colour-proof。",
    allowedUse: "store_full",
    license: "site-original",
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
  (pack) => pack.entityId === PHASE402_KASURI_ID && pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 367 Pilot Capless Kasuri prerequisite missing.");

const variants: CuratedVariant[] = [
  {
    key: "phase402-kasuri-black-edition",
    name: "絣黑 KB 颜色组",
    productCode: "FCN-2MR-KB",
    releaseYear: "现行",
    notes: "官方当前目录的カスリブラック edition group；F/M 子 SKU 另列。",
    sourceKey: S.exact.key,
    variantKind: "edition_group",
    market: "Pilot Japan",
  },
  {
    key: "phase402-kasuri-blue-edition",
    name: "絣蓝 KL 颜色组",
    productCode: "FCN-2MR-KL",
    releaseYear: "现行",
    notes: "官方当前目录的カスリブルー edition group；F/M 子 SKU 另列。",
    sourceKey: S.exact.key,
    variantKind: "edition_group",
    market: "Pilot Japan",
  },
  ...[
    ["black", "KB", "F", "絣黑 F"],
    ["black", "KB", "M", "絣黑 M"],
    ["blue", "KL", "F", "絣蓝 F"],
    ["blue", "KL", "M", "絣蓝 M"],
  ].map(([key, code, nib, label]) => ({
    key: `phase402-kasuri-${key}-${nib.toLowerCase()}`,
    name: `${label} 尖`,
    productCode: `FCN-2MR-${code}-${nib}`,
    releaseYear: "现行",
    notes: `官方当前 lineup 的 ${label} SKU；18K、CON-40 和 Capless 按动结构属于同一 FCN-2MR 平台。`,
    sourceKey: S.exact.key,
    variantKind: "market_sku" as const,
    parentVariantKey: `phase402-kasuri-${key}-edition`,
    market: "Pilot Japan",
  })),
];

const pack: CuratedEntityPack = {
  ...structuredClone(base),
  key: "phase402-pilot-capless-kasuri-refresh-v1",
  entityId: PHASE402_KASURI_ID,
  expectedSlug: PHASE402_KASURI_SLUG,
  canonicalName: "百乐 Pilot Capless 絣（Kasuri）",
  markdownFile: ".planning/content-research/pilot-capless-kasuri-phase402.md",
  storyTitle: "Pilot Capless 絣：FCN-2MR 的纹理、按动结构与价格时间线",
  primarySourceKey: S.exact.key,
  depthTier: "A",
  aliases: [
    { alias: "Pilot Capless Kasuri", language: "en", sourceKey: S.exact.key },
    { alias: "キャップレス・絣", language: "ja", sourceKey: S.exact.key },
    { alias: "FCN-2MR", language: "und", sourceKey: S.warranty.key },
    { alias: "百乐 Capless 絣", language: "zh", sourceKey: S.penAddict.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Pilot Japan current FCN-2MR listing with official care and 2026-07 price snapshot",
      nibScope: "18K；官方当前 FCN-2MR lineup 为 F/M；改尖、后配尖和样笔线宽另记",
      materialScope: "絣纹 finish；官方 exact page 未证明织物、天然漆、木材或螺鈿材质",
      editionScope: "Capless 絣 FCN-2MR；不吸收 FC-18SR、FC-3MS、FCSE-3MR、FCT-15SR、FCLS-35SR、FCN-5MP、FC-25SK 或 FCS-1",
    },
    {
      key: `${SCOPE}-commercial`,
      scopeKey: `${SCOPE}-commercial`,
      productionState: "unknown",
      editionScope: "商品页 ¥35,200 与 2026-07-01 官方价目表 ¥38,500 的日期冲突；以日期而非单一数字解释",
    },
  ],
  claims: [
    claim(
      "phase402-identity",
      "model_identity",
      "Pilot Capless 絣是官方产品号 FCN-2MR 的独立按动钢笔；FCN-2MR-KB/KL 与 F/M 组合属于同一型号，不拆为四个实体。",
      S.exact,
      "exact page title, product code and lineup",
      [S.warranty, S.category],
    ),
    claim(
      "phase402-mechanism",
      "mechanism",
      "官方护理页定义 Capless 为 knock 式：按一次伸出笔尖，再按一次收回；不用时必须收尖，head 与 shutter 的维护边界不能用螺纹笔说明替代。",
      S.care,
      "official knock/retract and storage instructions",
      [S.penAddict],
    ),
    claim(
      "phase402-nib",
      "nib_boundary",
      "当前 FCN-2MR exact page 列 18K F，lineup 另列 M；F/M 是官方尖幅，不把 FCS-1 特殊合金或改磨样笔回填到 FCN-2MR。",
      S.exact,
      "18K F field and KB/KL F/M lineup",
      [S.press],
    ),
    claim(
      "phase402-fill",
      "filling_system",
      "FCN-2MR 使用 Pilot 墨囊或 CON-40；官方 exact page 只列 CON-40，换墨前应先收回笔尖并按导槽拆装笔记体。",
      S.care,
      "official cartridge and CON-40 procedure",
      [S.exact, S.manual],
    ),
    claim(
      "phase402-physical",
      "physical_specification",
      "当前 exact SKU FCN-2MR-KB-F 给出全长 140 mm、最大径 φ13.4 mm、重量 30 g、使用盒 Z-CR-N3；作用域是官方商品卡而非私人加装状态。",
      S.exact,
      "official size, weight and case table",
      [],
    ),
    claim(
      "phase402-finish",
      "finish_boundary",
      "官方把 finish 写成絣柄，列出絣黑 KB 与絣蓝 KL；当前资料没有证明织物包覆、天然漆、木材、螺鈿或 Custom 蝋色漆工艺。",
      S.exact,
      "official product description and colour lineup",
      [S.category],
    ),
    claim(
      "phase402-price",
      "commercial_snapshot",
      "exact 商品页显示含税 ¥35,200（税前 ¥32,000），而 2026-07-01 官方价目表将 FCN-2MR 建议价修订为含税 ¥38,500；两者是不同日期快照，不应并写为同时有效的两个现价。",
      S.price,
      "2026-07-01 price list revision and exact page older display",
      [S.exact],
    ),
    claim(
      "phase402-siblings",
      "version_boundary",
      "FCN-2MR 与普通 FC-18SR、Stripe FC-3MS、SE FCSE-3MR、Decimo FCT-15SR、LS FCLS-35SR、Raden FCN-5MP、Wood FC-25SK 和 FCS-1 是相邻但独立的 Capless 产品线。",
      S.warranty,
      "official covered-products list separates Capless families",
      [S.category, S.penAddict],
    ),
    claim(
      "phase402-care",
      "maintenance_boundary",
      "Pilot 要求长期停用前排墨并用清水多次吸排，避免高低温、直射日光、酒精等溶剂、飞机气压和自行拆修；head 与轴不可整体浸洗。",
      S.care,
      "official care, storage, solvent and air-pressure warnings",
      [S.manual],
    ),
    claim(
      "phase402-selection",
      "selection_guidance",
      "絣适合把按动便利、18K F/M 和低调纹理放在一起考虑的人；选购先核对 FCN-2MR-KB/KL、F/M、CON-40 和价格日期，再用常用纸张试写，不能用纹理照片代替产品号。",
      S.exact,
      "exact SKU and variant verification",
      [S.penAddict],
      "editorial",
    ),
    claim(
      "phase402-media",
      "media_identity_boundary",
      "本站主图是原创 factual SVG，明确为 non-photo、non-logo、not-to-scale、non-colour-proof，不代表真实纹理、颜色校样或具体库存。",
      S.diagram,
      "site-original SVG attribution and non-product-photo boundary",
      [],
      "editorial",
    ),
  ],
  variants,
  spec: {
    brandEntityId: PHASE402_PILOT_ID,
    values: {
      series_name: "Pilot Capless 絣 / FCN-2MR",
      release_year: "现行；当前 exact page 未披露首发年份",
      origin_country: "日本 Pilot 产品线；具体批次和地区库存按实物/目录核对",
      nib: "18K；FCN-2MR-KB/KL 的 F、M",
      fill_system: "Pilot 墨囊或 CON-40",
      material: "絣柄 finish；官方页未将其定义为织物、天然漆、木材或螺鈿",
      dimensions: "当前 FCN-2MR-KB-F：全长 140 mm；最大径 φ13.4 mm",
      weight: "当前 FCN-2MR-KB-F：30 g",
      price_range: "2026-07-01 日本官方价目表：FCN-2MR 含税 ¥38,500；exact 商品页旧快照 ¥35,200",
      status: "当前 FCN-2MR；絣黑 KB／絣蓝 KL × F/M 四个 market SKU",
    },
    evidence: [
      specEvidence("phase402-spec-brand", "brand_entity_id", S.exact, SCOPE, "Pilot maker context"),
      specEvidence("phase402-spec-series", "series_name", S.exact, SCOPE, "exact title and FCN-2MR code"),
      specEvidence("phase402-spec-release", "release_year", S.exact, SCOPE, "current listing without first-launch year"),
      specEvidence("phase402-spec-origin", "origin_country", S.category, SCOPE, "Pilot Japan catalogue context"),
      specEvidence("phase402-spec-nib", "nib", S.exact, SCOPE, "18K and F/M lineup"),
      specEvidence("phase402-spec-fill", "fill_system", S.exact, SCOPE, "CON-40 field"),
      specEvidence("phase402-spec-material", "material", S.exact, SCOPE, "official finish wording"),
      specEvidence("phase402-spec-dimensions", "dimensions", S.exact, SCOPE, "140 mm and φ13.4 mm"),
      specEvidence("phase402-spec-weight", "weight", S.exact, SCOPE, "30 g"),
      specEvidence("phase402-spec-price", "price_range", S.price, `${SCOPE}-commercial`, "2026-07-01 revised ¥38,500"),
      specEvidence("phase402-spec-status", "status", S.exact, SCOPE, "KB/KL F/M lineup"),
    ],
  },
  media: [
    {
      key: "phase402-pilot-kasuri-primary-svg",
      title: "Pilot Capless 絣 事实示意图（非产品照片）",
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
      key: "phase402-kasuri-current-listing",
      title: "FCN-2MR 当前日本目录列出两色四 SKU",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "当前 exact page 展开絣黑 KB／絣蓝 KL 与 F/M 四个 FCN-2MR 产品号；首发年份未在该页披露。",
      sourceKey: S.exact.key,
    },
    {
      key: "phase402-kasuri-price-revision",
      title: "FCN-2MR 官方建议价修订",
      eventType: "design_milestone",
      startDate: "2026-07-01",
      circa: false,
      description: "Pilot 2026 年 7 月 1 日付价目表把 FCN-2MR 从 ¥35,200 修订为 ¥38,500；商品页旧价格保留为历史快照。",
      sourceKey: S.price.key,
    },
  ],
  conflicts: [],
};

export const phase402PilotCaplessKasuriRefreshPacks: CuratedEntityPack[] = [pack];
