import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase84PlatinumPilotP0V3BrandPacks } from "./phase84-platinum-pilot-p0-v3";

export const PHASE365_PILOT_BRAND_ID = "Zt-PbXkE7UHM";
export const PHASE365_ENJU_ID = "phase365-pilot-custom-enju";
export const PHASE365_ENJU_SLUG = "pilot-custom-enju";

const RETRIEVED = "2026-08-02";
const SCOPE = "phase365-pilot-custom-enju-current";
const UNKNOWN_SCOPE = "phase365-pilot-custom-enju-commercial-boundary";
const SVG_PATH = "/images/library/site-original/pilot/custom-enju.svg";

function source(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  independenceGroup: string;
  homepageUrl?: string;
  author?: string;
  publishedAt?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const siteOriginal = sourceType === "user_submission";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    title: input.title,
    url: input.url,
    summary: input.summary,
    sourceType,
    tier:
      input.tier ??
      (sourceType === "official" ? "primary" : "professional_secondary"),
    independenceGroup: input.independenceGroup,
    homepageUrl: input.homepageUrl ?? (siteOriginal ? "/" : input.url),
    itemType: siteOriginal ? "image" : "web_page",
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    allowedUse: siteOriginal ? "store_full" : "summary_only",
    license: siteOriginal ? "site-original" : undefined,
    archiveUrl: input.url,
    archiveLocator: siteOriginal
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  scopeKey: string,
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
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey,
        scopeKey,
        locator,
      },
    ],
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

const S = {
  exact: source({
    key: "phase365-pilot-custom-enju-exact",
    registryKey: "pilot-webcatalog-custom-enju-phase365",
    registryName: "PILOT Web Catalog",
    title: "カスタム 槐（えんじゅ） FKV-5MK",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000371&volumeName=00004",
    independenceGroup: "pilot-webcatalog-custom-enju-phase365",
    summary:
      "Pilot exact 商品页列 FKV-5MK、槐木树脂浸渍轴与帽、18K 15号 F/M/B、CON-40／CON-70N、147 mm、16.7 mm、32 g、专用盒和附带 CON-70N。",
  }),
  support: source({
    key: "phase365-pilot-custom-enju-support",
    registryKey: "pilot-support-custom-enju-phase365",
    registryName: "PILOT official support",
    title: "カスタム槐 FKV-5MK 国际保修／支持",
    url: "https://www.pilot.co.jp/support/warranty/jp/fountain/custom_enjyu.html",
    independenceGroup: "pilot-support-custom-enju-phase365",
    summary:
      "Pilot 官方支持页以 FKV-5MK 绑定 Custom 槐，作为型号和售后支持边界；不从支持页推断木材耐化学性或全球库存。",
  }),
  release: source({
    key: "phase365-pilot-custom-enju-release",
    registryKey: "pilot-release-custom-enju-phase365",
    registryName: "PILOT official",
    title: "万年筆・油性ボールペン『カスタム 槐』新発売",
    url: "https://www.pilot.co.jp/press_release/2013/11/21/enju.html",
    publishedAt: "2013-11-21",
    independenceGroup: "pilot-release-custom-enju-phase365",
    summary:
      "Pilot 2013 年 11 月发布资料把 Custom 槐列为 Custom 木轴系列新作，给出槐木吉祥语境和 F／M／B 尖幅时间线。",
  }),
  price: source({
    key: "phase365-pilot-custom-enju-price",
    registryKey: "pilot-price-list-202607-phase365",
    registryName: "PILOT official",
    title: "价格表 2026 年 7 月 1 日付",
    url: "https://www.pilot.co.jp/information/pricelist_202607.pdf",
    publishedAt: "2026-05-01",
    independenceGroup: "pilot-price-list-202607-phase365",
    summary:
      "Pilot 2026 年 7 月价目快照仍列 Custom 槐 FKV-5MK，含税 110,000 日元；价格为检索时商业字段，不作为永久售价。",
  }),
  fpn: source({
    key: "phase365-pilot-custom-enju-fpn",
    registryKey: "fpn-pilot-custom-enju-phase365",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "community",
    independenceGroup: "fpn-pilot-custom-enju-phase365",
    homepageUrl: "https://www.fountainpennetwork.com/",
    title: "Pilot Custom Enjyu discussion and user sample",
    url: "https://www.fountainpennetwork.com/forum/topic/368648-does-a-pilot-custom-845-or-urushi-write-better-than-an-823/page/2/",
    summary:
      "独立讨论中的实物用户把 Custom Enjyu 描述为树脂浸渍木轴、15号双色 18K 尖，并明确这是个人样本体验，不替官方发布全库存书写感。",
  }),
  kakaku: source({
    key: "phase365-pilot-custom-enju-kakaku",
    registryKey: "kakaku-pilot-custom-enju-phase365",
    registryName: "価格.com",
    sourceType: "blog",
    tier: "community",
    independenceGroup: "kakaku-pilot-custom-enju-phase365",
    homepageUrl: "https://review.kakaku.com/",
    title: "カスタム 槐 FKV-5MK-ME review page",
    url: "https://review.kakaku.com/review/S0000778557/",
    summary:
      "日本消费者评测页记录 Custom 槐与 845 的同级比较和木纹实物意见；仅用于样本与购买辨识，不把用户评价升级成官方规格。",
  }),
  seriesReview: source({
    key: "phase365-pilot-custom-series-review",
    registryKey: "gentleman-stationer-pilot-custom-series-phase365",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "gentleman-stationer-pilot-custom-series-phase365",
    homepageUrl: "https://www.gentlemanstationer.com/",
    title: "The Pilot Custom Series: an overview",
    url: "https://www.gentlemanstationer.com/blog/2026/3/14/pilot-custom-series-an-overview-of-some-of-my-favorite-fountain-pens",
    publishedAt: "2026-03-14",
    summary:
      "专业钢笔媒体从系列层面对 Pilot Custom 742、743、823、912 等型号做比较；只作相邻型号导航和体验边界，不替 Custom 槐发布材质或规格。",
  }),
  diagram: source({
    key: "phase365-pilot-custom-enju-svg",
    registryKey: "fountain-pen-graph-editorial-phase365",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase365",
    title: "Pilot Custom 槐事实示意图",
    url: SVG_PATH,
    homepageUrl: "/",
    summary:
      "本站原创 factual SVG，表达槐木树脂浸渍、18K 15号 F/M/B、CON-40／CON-70N 与 exact-SKU 边界；非产品照片、Logo、比例图或颜色校样。",
  }),
} as const;

const pilotBrandBase = phase84PlatinumPilotP0V3BrandPacks.find(
  (pack) => pack.entityId === PHASE365_PILOT_BRAND_ID,
);
if (!pilotBrandBase) throw new Error("Phase 365 Pilot brand prerequisite is missing.");

const brand: CuratedEntityPack = structuredClone(pilotBrandBase);
brand.key = "phase365-pilot-brand-navigation-v1";
brand.markdownFile = ".planning/content-research/pilot-brand-phase365.md";
brand.storyTitle = "Pilot：Custom 槐的独立木轴入口";
brand.sources = [
  ...brand.sources,
  S.exact,
  S.support,
  S.release,
  S.price,
].filter(
  (item, index, all) =>
    all.findIndex((candidate) => candidate.key === item.key) === index,
);
const brandScope = brand.scopes[0]?.key ?? "phase365-pilot-brand-scope";
brand.claims = [
  ...brand.claims,
  claim(
    "phase365-pilot-enju-navigation",
    "brand_model_navigation",
    "Pilot 官方目录新增 Custom 槐（FKV-5MK）独立入口；它与 Custom 845、Custom URUSHI、Custom 823 和 Custom Heritage 的材料、尖号与供墨字段分开，不把 F/M/B 拆成多个实体。",
    S.exact.key,
    "FKV-5MK exact product title and lineup",
    brandScope,
  ),
];

const model: CuratedEntityPack = {
  key: "phase365-pilot-custom-enju-v1",
  entityId: PHASE365_ENJU_ID,
  expectedType: "pen",
  expectedSlug: PHASE365_ENJU_SLUG,
  canonicalName: "百乐 Pilot Custom 槐（Enju）",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/pilot-custom-enju-phase365.md",
  storyTitle: "Pilot Custom 槐：把树脂浸渍槐木做成独立 Custom SKU",
  primarySourceKey: S.exact.key,
  depthTier: "A",
  aliases: [
    { alias: "カスタム 槐（えんじゅ）", language: "ja", sourceKey: S.exact.key },
    { alias: "Pilot Custom Enju", language: "en", sourceKey: S.exact.key },
    { alias: "Pilot Custom Enjyu", language: "en", sourceKey: S.fpn.key },
    { alias: "百乐 Custom 槐", language: "zh", sourceKey: S.exact.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "Pilot Japan FKV-5MK current official product listing",
      validFrom: "2026-08-02",
      productionState: "current",
      nibScope: "18K No.15 F/M/B exact product lineup; actual width and installation by SKU",
      materialScope: "Enju wood for barrel and cap with resin impregnation",
      editionScope:
        "Custom 槐 FKV-5MK only; excludes Custom 845, Custom URUSHI, Custom 823 and other Pilot wood finishes",
    },
    {
      key: UNKNOWN_SCOPE,
      scopeKey: UNKNOWN_SCOPE,
      productionState: "unknown",
      editionScope:
        "Commercial price, stock, wood grain, box appearance and regional availability are mutable; FKV-5MK exact page is the authority for the checked date",
    },
    {
      key: `${SCOPE}-media`,
      scopeKey: `${SCOPE}-media`,
      productionState: "current",
      editionScope:
        "site-original factual SVG; not a product photograph, logo, scale drawing or colour proof",
    },
  ],
  claims: [
    claim(
      "phase365-enju-identity",
      "model_identity",
      "Pilot Web Catalog 将カスタム 槐（えんじゅ）以 FKV-5MK 单列；FKV-5MK-ME-F、-M、-B 是同一型号的原厂尖幅 SKU，不是三个实体。",
      S.exact.key,
      "exact title, product code and lineup",
      SCOPE,
    ),
    claim(
      "phase365-enju-wood",
      "material_finish",
      "官方材料字段为槐木（樹脂含浸加工）用于笔身与笔帽，色柄为エンジュモクメ；树脂浸渍槐木不等于 ebonite、urushi 或普通树脂。",
      S.exact.key,
      "material and colour-pattern fields",
      SCOPE,
    ),
    claim(
      "phase365-enju-nib",
      "nib_options",
      "Exact 商品页列 18K 15 号大型尖，当前 lineup 为 F、M、B；尖幅是原厂选项，改磨或二手换尖须单独标注。",
      S.exact.key,
      "18K No.15 and F/M/B lineup",
      SCOPE,
    ),
    claim(
      "phase365-enju-filling",
      "filling_system",
      "官方供墨字段列 Pilot CON-40 与 CON-70N，且注明随附 CON-70N；本页不把它写成国际标准 C/C，也不从兄弟型号推断墨囊或容量。",
      S.exact.key,
      "converter fields and included CON-70N",
      SCOPE,
    ),
    claim(
      "phase365-enju-size",
      "physical_specification",
      "FKV-5MK 商品卡给出全长 147 mm、最大径 16.7 mm、重量 32 g；包装尺寸和包装重量另列，不与本体数字混用。",
      S.exact.key,
      "size, diameter and weight fields",
      SCOPE,
    ),
    claim(
      "phase365-enju-release",
      "production_history",
      "Pilot 2013 年 11 月 21 日发布资料把 Custom 槐列为 Custom 木轴系列新作，并列 F、M、B 尖幅；上市时间不等于每支现售库存来自同一木材批次。",
      S.release.key,
      "2013-11-21 release and nib lineup",
      SCOPE,
    ),
    claim(
      "phase365-enju-support",
      "support_boundary",
      "Pilot 官方支持页以 FKV-5MK 绑定 Custom 槐；支持记录确认型号身份，不扩写为全球现货或木材防溶剂保证。",
      S.support.key,
      "FKV-5MK warranty page",
      SCOPE,
    ),
    claim(
      "phase365-enju-price",
      "commercial_snapshot",
      "Pilot 2026 年 7 月 1 日价目表仍列 FKV-5MK，含税 110,000 日元；价格是检索时商业快照，库存与地区售价须按订单复核。",
      S.price.key,
      "2026-07-01 price list entry",
      UNKNOWN_SCOPE,
    ),
    claim(
      "phase365-enju-comparison",
      "version_boundary",
      "Custom 槐与 Custom 845、Custom URUSHI、Custom 823 的材料、尖号和供墨路线不同；同属 Custom 不构成共享图片或规格的理由。",
      S.exact.key,
      "exact product fields and sibling boundary",
      SCOPE,
    ),
    claim(
      "phase365-enju-user-sample",
      "sample_boundary",
      "独立用户讨论把 Custom Enjyu 描述为树脂浸渍木轴和 15 号双色 18K 尖；书写感、木纹偏好和二手品相属于样本意见，不升级成全库存事实。",
      S.fpn.key,
      "user sample discussion",
      SCOPE,
    ),
    claim(
      "phase365-enju-family-context",
      "family_context",
      "专业钢笔媒体将 742、743、823、912 等 Pilot Custom 型号放在不同尖号、供墨与使用选择中比较；这支持品牌导航分流，但不替 FKV-5MK 增加未公开配置。",
      S.seriesReview.key,
      "Custom series comparison and sibling boundary",
      SCOPE,
    ),
    claim(
      "phase365-enju-care",
      "maintenance_guidance",
      "木轴和树脂浸渍表面应避开热水、酒精、丙酮、强溶剂、研磨剂、长期浸泡和暴晒；外部用柔软干布，裂纹、起翘或渗漏时停止拧动并联系官方或专业维修方。",
      S.support.key,
      "official high/low temperature, sunlight and self-repair boundary",
      SCOPE,
    ),
    claim(
      "phase365-enju-selection",
      "selection_guidance",
      "购买和验收时核对カスタム 槐、FKV-5MK、槐木树脂浸渍、F/M/B、CON-70N、专用笔套和盒卡；不要用 845 漆黑、朱或紺青照片代表槐木纹。",
      S.exact.key,
      "exact SKU and package verification",
      SCOPE,
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase365-enju-f",
      name: "FKV-5MK-ME-F",
      productCode: "FKV-5MK-ME-F",
      notes: "槐木纹 FKV-5MK 的 18K 15 号 F 尖原厂 SKU。",
      sourceKey: S.exact.key,
      variantKind: "nib",
      market: "Pilot Japan",
    },
    {
      key: "phase365-enju-m",
      name: "FKV-5MK-ME-M",
      productCode: "FKV-5MK-ME-M",
      notes: "槐木纹 FKV-5MK 的 18K 15 号 M 尖原厂 SKU。",
      sourceKey: S.exact.key,
      variantKind: "nib",
      market: "Pilot Japan",
    },
    {
      key: "phase365-enju-b",
      name: "FKV-5MK-ME-B",
      productCode: "FKV-5MK-ME-B",
      notes: "槐木纹 FKV-5MK 的 18K 15 号 B 尖原厂 SKU。",
      sourceKey: S.exact.key,
      variantKind: "nib",
      market: "Pilot Japan",
    },
    {
      key: "phase365-enju-wood",
      name: "Enju wood resin-impregnated barrel and cap",
      notes: "官方材料路线；不与 Custom 845 的 urushi-coated ebonite 混同。",
      sourceKey: S.exact.key,
      variantKind: "material",
      market: "Pilot Japan",
    },
    {
      key: "phase365-enju-con70n",
      name: "CON-70N included",
      notes: "商品页注明附 CON-70N；CON-40／CON-70N 是 Pilot converter options。",
      sourceKey: S.exact.key,
      variantKind: "edition_group",
      market: "Pilot Japan",
    },
  ],
  spec: {
    brandEntityId: PHASE365_PILOT_BRAND_ID,
    values: {
      series_name: "Pilot Custom 槐（Enju／Enjyu）FKV-5MK",
      release_year: "2013-11-21（Pilot 官方新発売资料）",
      origin_country: "Pilot Japan 官方产品线；本包不额外推断具体木材产地或组装地点",
      nib: "18K No.15；FKV-5MK-ME-F／M／B",
      fill_system: "Pilot CON-40／CON-70N；商品页注明附 CON-70N",
      material: "槐木（Enju，树脂浸渍加工）笔身与笔帽；エンジュモクメ",
      dimensions: "全长 147 mm；最大径 16.7 mm",
      weight: "32 g（本体；包装重量另列）",
      price_range: "2026-07-01 价目表快照：含税 110,000 日元；价格可变",
      status: "Pilot 官方 Web Catalog 与支持页在 2026-08-02 核查到的 FKV-5MK 型号",
    },
    evidence: [
      evidence("phase365-spec-brand", "brand_entity_id", S.exact.key, SCOPE, "Pilot exact product maker context"),
      evidence("phase365-spec-series", "series_name", S.exact.key, SCOPE, "FKV-5MK exact title and code"),
      evidence("phase365-spec-release", "release_year", S.release.key, SCOPE, "2013-11-21 release notice"),
      evidence("phase365-spec-origin", "origin_country", S.exact.key, SCOPE, "Pilot Japan Web Catalog context"),
      evidence("phase365-spec-nib", "nib", S.exact.key, SCOPE, "18K No.15 F/M/B lineup"),
      evidence("phase365-spec-fill", "fill_system", S.exact.key, SCOPE, "CON-40 and CON-70N fields"),
      evidence("phase365-spec-material", "material", S.exact.key, SCOPE, "Enju resin-impregnated wood field"),
      evidence("phase365-spec-dimensions", "dimensions", S.exact.key, SCOPE, "147 mm and 16.7 mm fields"),
      evidence("phase365-spec-weight", "weight", S.exact.key, SCOPE, "32 g body weight field"),
      evidence("phase365-spec-price", "price_range", S.price.key, UNKNOWN_SCOPE, "2026-07-01 price-list snapshot"),
      evidence("phase365-spec-status", "status", S.support.key, SCOPE, "FKV-5MK support page"),
    ],
  },
  media: [
    {
      key: "phase365-pilot-custom-enju-primary-media",
      title: "Pilot Custom 槐事实图（非产品照片）",
      sourceKey: S.diagram.key,
      localPath: SVG_PATH,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样，不代表具体木纹、光泽、刻字、价格或库存。",
      sourceUrl: SVG_PATH,
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "phase365-enju-release",
      title: "Custom 槐官方发布",
      eventType: "model_released",
      startDate: "2013-11-21",
      circa: false,
      description: "Pilot 发布资料把 Custom 槐列为 Custom 木轴系列新作，并列出 F／M／B 尖幅。",
      sourceKey: S.release.key,
    },
  ],
};

export const phase365PilotCustomEnjuPacks: CuratedEntityPack[] = [brand, model];
