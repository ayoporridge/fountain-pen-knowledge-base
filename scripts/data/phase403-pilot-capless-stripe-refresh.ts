import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import {
  PHASE367_PILOT_BRAND_ID,
  PHASE367_STRIPE_ID,
  PHASE367_STRIPE_SLUG,
  phase367PilotCaplessFamilyPacks,
} from "./phase367-pilot-capless-families";

export const PHASE403_PILOT_ID = PHASE367_PILOT_BRAND_ID;
export const PHASE403_STRIPE_ID = PHASE367_STRIPE_ID;
export const PHASE403_STRIPE_SLUG = PHASE367_STRIPE_SLUG;

const RETRIEVED = "2026-08-03";
const SCOPE = "phase403-pilot-capless-stripe-current";

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
    key: "phase403-pilot-stripe-exact",
    registryKey: "pilot-webcatalog-capless-stripe-phase403",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-capless-stripe-phase403",
    title: "FC-3MS-S-F｜キャップレス ストライプ｜PILOTウェブカタログ",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000125&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary:
      "exact SKU 页列 FC-3MS-S-F、Stripe、18K F、ノック式、黄铜轴铑仕上げ、CON-40、全长 140 mm、最大径 13.3 mm、重量 32 g、Z-CR-N3，并展开 S-M lineup；当前含税价 ¥52,800。",
  }),
  care: source({
    key: "phase403-pilot-stripe-care",
    registryKey: "pilot-support-capless-stripe-phase403",
    registryName: "PILOT official support",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-support-capless-stripe-phase403",
    title: "キャップレス use and care guide",
    url: "https://www.pilot.co.jp/support/warranty/jp/fountain/capless_2.html",
    homepageUrl: "https://www.pilot.co.jp/support/warranty/jp/fountain/",
    summary:
      "官方护理页说明按键伸缩、收尖后拆装、墨囊/CON-40、清水吸排、head 与轴的清洗边界，以及反复急按、航空气压、溶剂和自行拆修警告。",
  }),
  warranty: source({
    key: "phase403-pilot-stripe-warranty",
    registryKey: "pilot-warranty-list-stripe-phase403",
    registryName: "PILOT international warranty",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-warranty-list-stripe-phase403",
    title: "Fountain Pens Products covered by the warranty",
    url: "https://www.pilot.co.jp/support/warranty/en-au/fountain/",
    homepageUrl: "https://www.pilot.co.jp/support/warranty/",
    summary:
      "国际保证清单把 Capless STRIPE FC-3MS 与 Capless SE、KASURI、LS、Raden、Wood、普通 FC-18SR 等路线分别列出，用于身份边界。",
  }),
  price: source({
    key: "phase403-pilot-stripe-price",
    registryKey: "pilot-price-list-202607-stripe-phase403",
    registryName: "PILOT official information",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "pilot-price-list-202607-stripe-phase403",
    title: "価格表 2026年7月1日付",
    url: "https://www.pilot.co.jp/information/pricelist_202607.pdf",
    homepageUrl: "https://www.pilot.co.jp/information/",
    itemType: "pdf",
    publishedAt: "2026-07-01",
    summary:
      "官方价目表把 FC-3MS 从含税 ¥49,500 修订为 ¥52,800；这是日本建议价的日期快照，不替代海外、折扣或二手成交价。",
  }),
  manual: source({
    key: "phase403-pilot-fountain-manual",
    registryKey: "pilot-fountain-manual-stripe-phase403",
    registryName: "PILOT official manual",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-fountain-manual-stripe-phase403",
    title: "PILOT 万年筆使用说明书（日文 PDF）",
    url: "https://www.pilot.co.jp/support/manual/fountain/fountain_jp.pdf",
    homepageUrl: "https://www.pilot.co.jp/support/manual/",
    itemType: "pdf",
    summary:
      "Pilot 通用说明补充墨囊、清水吸排和保存步骤；Capless head/轴限制仍以专属护理页为准。",
  }),
  category: source({
    key: "phase403-pilot-fountain-category",
    registryKey: "pilot-webcatalog-fountain-category-stripe-phase403",
    registryName: "PILOT Japan Web Catalog",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pilot-webcatalog-fountain-category-stripe-phase403",
    title: "PILOT Web Catalog Fountain Pen category",
    url: "https://webcatalog.pilot.co.jp/products/DispCate.do?category=%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E4%B8%87%E5%B9%B4%E7%AD%86&volumeName=00004",
    homepageUrl: "https://webcatalog.pilot.co.jp/",
    summary:
      "官方目录入口用于确认 Stripe、絣、SE、普通 Capless 等分列，不替代 FC-3MS exact page 的数字。",
  }),
  press: source({
    key: "phase403-pilot-capless-press",
    registryKey: "pilot-capless-press-stripe-phase403",
    registryName: "PILOT official press",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "pilot-capless-press-stripe-phase403",
    title: "万年筆『キャップレス』新色発売",
    url: "https://www.pilot.co.jp/press_release/2026/03/05/post_150.html",
    homepageUrl: "https://www.pilot.co.jp/press_release/",
    publishedAt: "2026-03-05",
    summary:
      "Pilot 新闻稿提供 Capless 按动、18K 与特殊合金并行产品路线的背景，不把新色或 FCS-1 回填到 Stripe。",
  }),
  history: source({
    key: "phase403-pilot-custom-history",
    registryKey: "pilot-custom-history-stripe-phase403",
    registryName: "PILOT CUSTOM official",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "pilot-custom-history-stripe-phase403",
    title: "PILOT CUSTOM History",
    url: "https://www.pilot-custom.jp/en/history/",
    homepageUrl: "https://www.pilot-custom.jp/en/",
    summary:
      "CUSTOM 历史只用于 Pilot 型号年表的背景边界；不把家族 1963 年 Capless 语句误写成 FC-3MS 首发年份。",
  }),
  penAddict: source({
    key: "phase403-penaddict-capless-review",
    registryKey: "pen-addict-capless-stripe-phase403",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-addict-capless-stripe-phase403",
    title: "Pilot Vanishing Point Fountain Pen Review",
    url: "https://www.penaddict.com/blog/2012/5/9/pilot-vanishing-point-fountain-pen-review.html",
    homepageUrl: "https://www.penaddict.com/",
    author: "The Pen Addict",
    summary:
      "专业评测补充普通全尺寸 Capless 的按动、前夹和日用体验；个人样本不覆盖 FC-3MS 条纹批次、当前价格或表面磨损。",
  }),
  diagram: source({
    key: "phase403-pilot-stripe-svg",
    registryKey: "fountain-pen-graph-editorial-stripe-phase403",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-stripe-phase403",
    title: "Pilot Capless Stripe 事实示意图（非产品照片）",
    url: "/images/library/site-original/pilot/capless-stripe.svg",
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
    allowedUse: "store_full",
    license: "site-original",
    summary:
      "本站原创 factual SVG 表达 FC-3MS、黄铜铑仕上げ条纹、18K F/M、按动和 CON-40；明确 non-photo、non-logo、not-to-scale、non-colour-proof。",
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
  (pack) => pack.entityId === PHASE403_STRIPE_ID && pack.expectedType === "pen",
);
if (!base) throw new Error("Phase 367 Pilot Capless Stripe prerequisite missing.");

const variants: CuratedVariant[] = [
  {
    key: "phase403-stripe-edition",
    name: "Stripe 条纹 finish 组",
    productCode: "FC-3MS",
    releaseYear: "现行",
    notes: "官方将黄铜轴铑仕上げ Stripe 作为 FC-3MS 独立产品；F/M 子 SKU 另列。",
    sourceKey: S.exact.key,
    variantKind: "edition_group",
    market: "Pilot Japan",
  },
  {
    key: "phase403-stripe-f",
    name: "FC-3MS-S-F 条纹 F",
    productCode: "FC-3MS-S-F",
    releaseYear: "现行",
    notes: "exact page 当前展示的 18K F SKU；黄铜轴铑仕上げ、CON-40。",
    sourceKey: S.exact.key,
    variantKind: "market_sku",
    parentVariantKey: "phase403-stripe-edition",
    market: "Pilot Japan",
  },
  {
    key: "phase403-stripe-m",
    name: "FC-3MS-S-M 条纹 M",
    productCode: "FC-3MS-S-M",
    releaseYear: "现行",
    notes: "官方 lineup 列出的 18K M SKU；其表面和供墨平台与 F SKU 同属 FC-3MS。",
    sourceKey: S.exact.key,
    variantKind: "market_sku",
    parentVariantKey: "phase403-stripe-edition",
    market: "Pilot Japan",
  },
];

const pack: CuratedEntityPack = {
  ...structuredClone(base),
  key: "phase403-pilot-capless-stripe-refresh-v1",
  entityId: PHASE403_STRIPE_ID,
  expectedSlug: PHASE403_STRIPE_SLUG,
  canonicalName: "百乐 Pilot Capless Stripe（条纹）",
  markdownFile: ".planning/content-research/pilot-capless-stripe-phase403.md",
  storyTitle: "Pilot Capless Stripe：FC-3MS 的铑饰表面、按动结构与版本边界",
  primarySourceKey: S.exact.key,
  depthTier: "A",
  aliases: [
    { alias: "キャップレス ストライプ", language: "ja", sourceKey: S.exact.key },
    { alias: "Pilot Capless Stripe", language: "en", sourceKey: S.penAddict.key },
    { alias: "FC-3MS", language: "und", sourceKey: S.exact.key },
    { alias: "百乐 Capless 条纹", language: "zh", sourceKey: S.exact.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "Pilot Japan current FC-3MS listing with official care and 2026-07 price snapshot",
      nibScope: "18K；FC-3MS-S-F 与 FC-3MS-S-M 的原厂 F/M；改尖和后配尖另记",
      materialScope: "黄铜轴铑仕上げ；head 不锈钢、clip 铁钢；不写成整支银材或铑制笔尖",
      editionScope: "Capless Stripe FC-3MS；不吸收 FC-18SR、FCN-2MR、FCSE-3MR、FCT-15SR、FCLS-35SR、FCN-5MP、FC-25SK 或 FCS-1",
    },
    {
      key: `${SCOPE}-commercial`,
      scopeKey: `${SCOPE}-commercial`,
      productionState: "unknown",
      editionScope: "2026-07-01 价目表 ¥52,800 与历史改定前 ¥49,500 的日期快照，不推断地区成交价",
    },
  ],
  claims: [
    claim(
      "phase403-identity",
      "model_identity",
      "Pilot Capless Stripe 是官方产品号 FC-3MS 的独立按动钢笔；FC-3MS-S-F 与 FC-3MS-S-M 属于同一型号，不拆为两个实体。",
      S.exact,
      "exact title, FC-3MS code and S-F/S-M lineup",
      [S.warranty, S.category],
    ),
    claim(
      "phase403-finish",
      "material_finish",
      "官方将 Stripe 写作黄铜轴的ロジウム仕上げ条纹，head 为不锈钢、clip 为铁钢；铑仕上げ是表面处理，不把整支笔写成银材或铑制笔尖。",
      S.exact,
      "official material and finish fields",
      [S.diagram],
    ),
    claim(
      "phase403-mechanism",
      "mechanism",
      "Capless 的按动结构按一次伸出笔尖、再按一次收回；收尖后的 shutter 有助于减少暴露和干燥，不用时应确认完全收尖。",
      S.care,
      "official knock/retract and storage instructions",
      [S.penAddict, S.exact],
    ),
    claim(
      "phase403-nib",
      "nib_boundary",
      "FC-3MS exact page 列 18K F，lineup 另列 M；F/M 是原厂尖幅，不把 FCS-1 特殊合金或二手改磨尖回填到 Stripe。",
      S.exact,
      "18K F field and S-M lineup",
      [S.press],
    ),
    claim(
      "phase403-fill",
      "filling_system",
      "FC-3MS 使用 Pilot 墨囊或 CON-40；换墨前先收回笔尖，按官方导槽顺序拆装，converter 残墨需清水洗净并干燥。",
      S.care,
      "official cartridge and CON-40 procedure",
      [S.exact, S.manual],
    ),
    claim(
      "phase403-physical",
      "physical_specification",
      "当前 FC-3MS-S-F 商品卡给出全长 140 mm、最大径 φ13.3 mm、重量 32 g、使用盒 Z-CR-N3；作用域是官方产品卡。",
      S.exact,
      "official size, weight and case table",
    ),
    claim(
      "phase403-price",
      "commercial_snapshot",
      "2026-07-01 官方价目表将 FC-3MS 从含税 ¥49,500 修订为 ¥52,800；这是日本建议价日期快照，不外推为全球成交价。",
      S.price,
      "2026-07-01 price revision",
      [S.exact],
    ),
    claim(
      "phase403-siblings",
      "version_boundary",
      "FC-3MS 与普通 FC-18SR、絣 FCN-2MR、SE FCSE-3MR、Decimo、LS、Raden、Wood 和 FCS-1 是相邻但独立的 Capless 产品线。",
      S.warranty,
      "official covered-products list separates Capless families",
      [S.category, S.press],
    ),
    claim(
      "phase403-care",
      "maintenance_boundary",
      "Pilot 要求长期停用前排墨并用清水吸排，避免高低温、直射日光、酒精等溶剂、飞机气压和自行拆修；head 与轴不可整体浸洗。",
      S.care,
      "official care, solvent, air-pressure and repair warnings",
      [S.manual],
    ),
    claim(
      "phase403-selection",
      "selection_guidance",
      "选 Stripe 先核对 FC-3MS-S-F/M、18K、黄铜铑仕上げ、CON-40、Z-CR-N3 和价格日期，再按常用纸张试写和检查夹位；银色条纹照片不能替代产品号。",
      S.exact,
      "exact SKU and variant verification",
      [S.penAddict],
      "editorial",
    ),
    claim(
      "phase403-media",
      "media_identity_boundary",
      "本站主图是原创 factual SVG，明确 non-photo、non-logo、not-to-scale、non-colour-proof，不代表真实光泽、条纹连续性、颜色校样或库存。",
      S.diagram,
      "site-original SVG attribution and non-product-photo boundary",
      [],
      "editorial",
    ),
  ],
  variants,
  spec: {
    brandEntityId: PHASE403_PILOT_ID,
    values: {
      series_name: "Pilot Capless Stripe / FC-3MS",
      release_year: "现行；当前 exact page 未披露 FC-3MS 首发年份",
      origin_country: "日本 Pilot 产品线；具体批次和地区库存按实物/目录核对",
      nib: "18K；FC-3MS-S-F 与 FC-3MS-S-M",
      fill_system: "Pilot 墨囊或 CON-40",
      material: "轴：黄铜、铑仕上げ；head：不锈钢；clip：铁钢；条纹 finish",
      dimensions: "全长 140 mm；最大径 φ13.3 mm",
      weight: "32 g",
      price_range: "2026-07-01 日本官方价目表：FC-3MS 含税 ¥52,800；改定前快照 ¥49,500",
      status: "当前 FC-3MS；Stripe × F/M 两个 market SKU",
    },
    evidence: [
      specEvidence("phase403-spec-brand", "brand_entity_id", S.exact, SCOPE, "Pilot maker context"),
      specEvidence("phase403-spec-series", "series_name", S.exact, SCOPE, "exact title and FC-3MS code"),
      specEvidence("phase403-spec-release", "release_year", S.exact, SCOPE, "current listing without first-launch year"),
      specEvidence("phase403-spec-origin", "origin_country", S.category, SCOPE, "Pilot Japan catalogue context"),
      specEvidence("phase403-spec-nib", "nib", S.exact, SCOPE, "18K and S-F/S-M lineup"),
      specEvidence("phase403-spec-fill", "fill_system", S.exact, SCOPE, "CON-40 field"),
      specEvidence("phase403-spec-material", "material", S.exact, SCOPE, "brass and rhodium finish fields"),
      specEvidence("phase403-spec-dimensions", "dimensions", S.exact, SCOPE, "140 mm and φ13.3 mm"),
      specEvidence("phase403-spec-weight", "weight", S.exact, SCOPE, "32 g"),
      specEvidence("phase403-spec-price", "price_range", S.price, `${SCOPE}-commercial`, "2026-07-01 revised ¥52,800"),
      specEvidence("phase403-spec-status", "status", S.exact, SCOPE, "FC-3MS-S-F/S-M lineup"),
    ],
  },
  media: [
    {
      key: "phase403-pilot-stripe-primary-svg",
      title: "Pilot Capless Stripe 事实示意图（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: S.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof，不代表真实光泽、颜色、价格或库存。",
      sourceUrl: S.diagram.url,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "phase403-stripe-current-listing",
      title: "FC-3MS 当前日本目录列出 S-F 与 S-M",
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: true,
      description: "当前 exact page 展开 FC-3MS-S-F 与 FC-3MS-S-M；页面未披露 Stripe 首发年份。",
      sourceKey: S.exact.key,
    },
    {
      key: "phase403-stripe-price-revision",
      title: "FC-3MS 官方建议价修订",
      eventType: "design_milestone",
      startDate: "2026-07-01",
      circa: false,
      description: "Pilot 2026 年 7 月 1 日付价目表把 FC-3MS 从 ¥49,500 修订为 ¥52,800；当前商品页以新建议价展示。",
      sourceKey: S.price.key,
    },
  ],
  conflicts: [],
};

export const phase403PilotCaplessStripeRefreshPacks: CuratedEntityPack[] = [pack];
