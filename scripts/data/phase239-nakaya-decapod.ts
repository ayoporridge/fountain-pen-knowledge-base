import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";

const RETRIEVED = "2026-07-26";

export const PHASE239_NAKAYA_ID = "qrZay1FxJDjd";
export const PHASE239_PEN_ID = "p239NakayaDecapodST";
export const PHASE239_PEN_SLUG = "nakaya-writer-decapod-st-kuro-tamenuri";
export const PHASE239_RAW_SLUGS = {
  housoge: "中屋-nakaya-housoge高级定制",
  cigarPortable: "中屋-nakaya-portable-portable-cigar",
  writerPortable: "中屋-nakaya-portable-writer-黑溜涂",
} as const;

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  summary: string;
  tier?: CuratedSource["tier"];
  sourceType?: CuratedSource["sourceType"];
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType ?? "official",
    tier: input.tier ?? "primary",
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase239",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase239",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "本站原创 factual SVG；非产品照片、非 logo、非比例图、非颜色证明。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  home: web({
    key: "phase239-nakaya-home",
    title: "Nakaya Fountain Pen 官方首页",
    url: "https://www.nakaya.org/en/",
    registryKey: "nakaya-official-phase239",
    registryName: "Nakaya Fountain Pen official",
    summary: "官网说明 Nakaya 的手工制作、Urushi 漆艺、书写记录调校、订制订单与售后入口；用于品牌定位和日本手工语境，不代替 Decapod 产品规格。",
  }),
  modelIndex: web({
    key: "phase239-nakaya-model-index",
    title: "Nakaya 官方型号搜索",
    url: "https://www.nakaya.org/en/products/search/",
    registryKey: "nakaya-official-phase239",
    registryName: "Nakaya Fountain Pen official",
    summary: "官方型号搜索把 Decapod 作为独立模型，并列出 ST（Straight）和 TW（Twist）两种线条设计，同时按长度、直径和是否有笔夹筛选。",
  }),
  size: web({
    key: "phase239-nakaya-size",
    title: "Nakaya 官方尺寸与重量表",
    url: "https://www.nakaya.org/en/commitment/23035/",
    registryKey: "nakaya-official-phase239",
    registryName: "Nakaya Fountain Pen official",
    summary: "官方标准表列 Decapod(ST) Writer 约 25 g、未盖帽 15 g、总长 150 mm、未盖帽 130 mm、最大直径 15 mm，并说明手工成品可能有小幅差异。",
  }),
  product: web({
    key: "phase239-nakaya-decapod-product",
    title: "Nakaya Writer Decapod ST Kuro-tame 官方产品记录",
    url: "https://www.nakaya.org/en/products/info/36690/",
    registryKey: "nakaya-official-phase239",
    registryName: "Nakaya Fountain Pen official",
    summary: "官方具体产品记录写 Writer Decapod ST Kuro-tame，说明多面体、ST 直线、四线螺纹和 Kuro-tame 漆面；列产品号 02019-WST-11、24.0 g、150.0 mm、15.0 mm、硬橡胶、约七个月制作期及检索日 USD 1,500。",
  }),
  order: web({
    key: "phase239-nakaya-order-guide",
    title: "Nakaya 官方下单说明",
    url: "https://www.nakaya.org/en/guide/",
    registryKey: "nakaya-official-phase239",
    registryName: "Nakaya Fountain Pen official",
    summary: "官方下单流程把笔身、笔尖线宽/颜色/调校、笔夹和附件作为订单步骤，最终以工作人员邮件确认；用于说明 Decapod 不能继承固定笔尖与供墨配置。",
  }),
  repair: web({
    key: "phase239-nakaya-repair",
    title: "Nakaya 官方调校与维修说明",
    url: "https://www.nakaya.org/en/repair/",
    registryKey: "nakaya-official-phase239",
    registryName: "Nakaya Fountain Pen official",
    summary: "官方提供笔尖调校、部件更换和 Urushi 漆面修复，要求先通过询问流程并按报价寄送；用于维护和售后边界。",
  }),
  resume: web({
    key: "phase239-nakaya-decapod-resume",
    title: "Nakaya 2025 年恢复 Decapod 接单公告",
    url: "https://www.nakaya.org/en/news/24434/",
    registryKey: "nakaya-official-phase239",
    registryName: "Nakaya Fountain Pen official",
    summary: "官方 2025-05-16 公告称恢复 Decapod 型号接单，并提醒订单过多时可能再次停止、每人限购一件；用于状态时间线，不证明 2026 年仍可下单。",
  }),
  suspend: web({
    key: "phase239-nakaya-decapod-suspend",
    title: "Nakaya 2026 年 Decapod 暂停接单公告",
    url: "https://www.nakaya.org/en/news/24531/",
    registryKey: "nakaya-official-phase239",
    registryName: "Nakaya Fountain Pen official",
    summary: "官方 2026-04-14 公告称因订单增加暂时停止 Decapod 与 Dorsal Fin 系列接单，并暂时限制每位顾客一次一件；用于当前订单状态。",
  }),
  review: web({
    key: "phase239-nakaya-decapod-review",
    title: "S.B. Brown：Nakaya Decapod Fountain Pen Review",
    url: "https://www.sbrebrown.com/2015/08/nakaya-decapod-fountain-pen-review/",
    registryKey: "sbrebrown-nakaya-decapod-phase239",
    registryName: "S.B. Brown",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "独立钢笔评测以 Nakaya Decapod 为题并提供多张实拍与使用评测入口；只作多面体外形和实际使用语境旁证，不替代官方产品号、尺寸、重量或当前订单状态。",
  }),
  brandSvg: diagram(
    "phase239-nakaya-brand-svg",
    "Nakaya model naming factual diagram",
    "/images/library/site-original/phase239/nakaya/brand.svg",
  ),
  penSvg: diagram(
    "phase239-nakaya-decapod-svg",
    "Nakaya Writer Decapod ST Kuro-tame factual diagram",
    "/images/library/site-original/phase239/nakaya/writer-decapod-st-kuro-tamenuri.svg",
  ),
} as const;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function media(source: CuratedSource, key: string, title: string) {
  return [{
    key,
    title,
    sourceKey: source.key,
    localPath: source.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；非产品照片、非 logo、非比例图、非颜色证明。",
    sourceUrl: source.url,
    usageStatus: "primary" as const,
  }];
}

const brandScope = "phase239-nakaya-brand-navigation";
const penScope = "phase239-nakaya-writer-decapod-st-scope";

const brand: CuratedEntityPack = {
  key: "phase239-nakaya-brand-v1",
  entityId: PHASE239_NAKAYA_ID,
  expectedType: "brand",
  expectedSlug: "nakaya",
  canonicalName: "Nakaya",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/nakaya-brand-phase239.md",
  storyTitle: "Nakaya：把笔形、线条、漆面和订单状态分开读",
  primarySourceKey: S.home.key,
  depthTier: "A",
  aliases: [
    { alias: "Nakaya", language: "en", sourceKey: S.home.key },
    { alias: "中屋", language: "zh", sourceKey: S.home.key },
    { alias: "Nakaya Fountain Pen", language: "en", sourceKey: S.home.key },
  ],
  sources: [S.home, S.modelIndex, S.size, S.order, S.repair, S.product, S.resume, S.suspend, S.review, S.brandSvg],
  scopes: [{
    key: brandScope,
    scopeKey: brandScope,
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope: "Nakaya 品牌导航；Cigar/Writer、Long/Portable/Piccolo、Decapod ST/TW 和漆面分别记录，导航到已完成资料核验的具体型号。",
  }],
  claims: [
    {
      key: "phase239-nakaya-brand-identity",
      predicate: "brand_identity",
      objectText: "Nakaya 以日本手工硬橡胶笔身、Urushi 漆艺、按书写记录调校和订制订单构成品牌入口；S.B. Brown 的独立 Decapod 评测提供了具体产品的外形与使用语境旁证。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.home.key,
      locator: S.home.summary,
      evidence: [
        { key: "phase239-nakaya-brand-identity-home", sourceKey: S.home.key, scopeKey: brandScope, locator: S.home.summary },
        { key: "phase239-nakaya-brand-identity-review", sourceKey: S.review.key, scopeKey: brandScope, locator: S.review.summary },
      ],
    },
    {
      key: "phase239-nakaya-brand-navigation",
      predicate: "brand_model_navigation",
      objectText: "当前品牌导航包含已核验的 Cigar Piccolo Housoge、Cigar Portable Kuro-tamenuri、Writer Portable Kuro-tamenuri 和 Writer Decapod ST Kuro-tamenuri；这四个名称分别保留笔形、长度、线条版本、漆面和具体产品号边界。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.modelIndex.key,
      locator: S.modelIndex.summary,
      evidence: [
        { key: "phase239-nakaya-brand-navigation-index", sourceKey: S.modelIndex.key, scopeKey: brandScope, locator: S.modelIndex.summary },
        { key: "phase239-nakaya-brand-navigation-product", sourceKey: S.product.key, scopeKey: brandScope, locator: S.product.summary },
      ],
    },
    {
      key: "phase239-nakaya-brand-naming-boundary",
      predicate: "model_naming_boundary",
      objectText: "Cigar/Writer 是笔形，Long/Portable/Piccolo 是长度，Decapod ST/TW 是多面体线条版本，Kuro-tame 是漆面；不能把这些层次各自重复建成同一支钢笔。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.size.key,
      locator: S.size.summary,
      evidence: [
        { key: "phase239-nakaya-brand-naming-size", sourceKey: S.size.key, scopeKey: brandScope, locator: S.size.summary },
        { key: "phase239-nakaya-brand-naming-index", sourceKey: S.modelIndex.key, scopeKey: brandScope, locator: S.modelIndex.summary },
      ],
    },
    {
      key: "phase239-nakaya-brand-order-boundary",
      predicate: "order_status_boundary",
      objectText: "Nakaya 2025-05-16 曾恢复 Decapod 接单，2026-04-14 又公告因订单增加暂时停止 Decapod 与 Dorsal Fin 接单；产品页存在不等于当前可下单。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.suspend.key,
      locator: S.suspend.summary,
      evidence: [
        { key: "phase239-nakaya-brand-order-resume", sourceKey: S.resume.key, scopeKey: brandScope, locator: S.resume.summary },
        { key: "phase239-nakaya-brand-order-suspend", sourceKey: S.suspend.key, scopeKey: brandScope, locator: S.suspend.summary },
      ],
    },
  ],
  timeline: [
    { key: "phase239-nakaya-decapod-resumed", title: "Decapod 曾恢复接单", eventType: "design_milestone", startDate: "2025-05-16", circa: false, description: "Nakaya 公告恢复 Decapod 型号接单，同时提醒订单过多时可能再次停止。", sourceKey: S.resume.key },
    { key: "phase239-nakaya-decapod-suspended", title: "Decapod 暂停接单", eventType: "discontinued", startDate: "2026-04-14", circa: false, description: "Nakaya 公告因订单增加暂时停止 Decapod 与 Dorsal Fin 系列接单；这是订单状态，不代表产品永久停产。", sourceKey: S.suspend.key },
  ],
  media: media(S.brandSvg, "phase239-nakaya-brand-primary", "Nakaya 型号命名事实图（非产品照片）"),
};

const pen: CuratedEntityPack = {
  key: "phase239-nakaya-writer-decapod-st-v1",
  entityId: PHASE239_PEN_ID,
  expectedType: "pen",
  expectedSlug: PHASE239_PEN_SLUG,
  canonicalName: "Nakaya Writer Decapod ST Kuro-tamenuri",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/nakaya-writer-decapod-st-kuro-tamenuri-phase239.md",
  storyTitle: "Nakaya Writer Decapod ST Kuro-tamenuri：多面体直线与订单边界",
  primarySourceKey: S.product.key,
  depthTier: "A",
  aliases: [
    { alias: "Nakaya Writer Decapod ST Kuro-tame", language: "en", sourceKey: S.product.key },
    { alias: "Nakaya Writer Decapod ST Kuro-tamenuri", language: "en", sourceKey: S.product.key },
    { alias: "Nakaya Decapod ST Writer Kuro-tame", language: "en", sourceKey: S.modelIndex.key },
    { alias: "中屋 Writer Decapod ST 黑溜涂", language: "zh", sourceKey: S.product.key },
    { alias: "02019-WST-11", language: "en", sourceKey: S.product.key },
  ],
  sources: [S.product, S.modelIndex, S.size, S.order, S.repair, S.resume, S.suspend, S.review, S.penSvg],
  scopes: [{
    key: penScope,
    scopeKey: penScope,
    validFrom: RETRIEVED,
    productionState: "current",
    nibScope: "官方产品记录未声明固定通用尖型；笔尖线宽、颜色和调校按订单确认。",
    materialScope: "产品记录范围内为 Ebonite（硬橡胶）笔身；Writer 带笔夹；Kuro-tame 是漆面。",
    editionScope: "产品号 02019-WST-11 的 Writer Decapod ST Kuro-tame；不与 Decapod TW、Decapod Cigar 或其他 Kuro-tame 笔形合并。",
  }],
  claims: [
    {
      key: "phase239-decapod-identity",
      predicate: "model_identity",
      objectText: "Nakaya Writer Decapod ST Kuro-tamenuri 对应官方产品记录 Writer Decapod ST Kuro-tame，产品号 02019-WST-11；Writer、Decapod、ST 和 Kuro-tame 分别承担笔形、模型、线条版本和漆面信息。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [{ key: "phase239-decapod-identity-evidence", sourceKey: S.product.key, scopeKey: penScope, locator: S.product.summary }],
    },
    {
      key: "phase239-decapod-shape",
      predicate: "version_boundary",
      objectText: "官方说明 ST 采用笔直、偏修长的多面体线条，使用四线螺纹；线条没有完全对齐不影响功能。ST 不是 TW 扭转线条版本，也不是无笔夹的 Decapod Cigar。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [
        { key: "phase239-decapod-shape-product", sourceKey: S.product.key, scopeKey: penScope, locator: S.product.summary },
        { key: "phase239-decapod-shape-index", sourceKey: S.modelIndex.key, scopeKey: penScope, locator: S.modelIndex.summary },
      ],
    },
    {
      key: "phase239-decapod-specification",
      predicate: "specification",
      objectText: "具体产品记录列硬橡胶、150.0 mm 总长、15.0 mm 最大直径、24.0 g 总重和约七个月制作期；官方标准表对 Decapod(ST) Writer 给出约 25 g、未盖帽 15 g、150/130 mm 和 15 mm，并提醒手工成品有小幅差异。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.product.key,
      locator: S.product.summary,
      evidence: [
        { key: "phase239-decapod-spec-product", sourceKey: S.product.key, scopeKey: penScope, locator: S.product.summary },
        { key: "phase239-decapod-spec-size", sourceKey: S.size.key, scopeKey: penScope, locator: S.size.summary },
      ],
    },
    {
      key: "phase239-decapod-order-boundary",
      predicate: "order_boundary",
      objectText: "官方下单流程允许选择笔尖线宽、颜色和是否调校，产品记录没有声明固定通用尖型或供墨配置；笔尖、附件、价格、制作期和运输应以订单最终确认为准。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: S.order.key,
      locator: S.order.summary,
      evidence: [{ key: "phase239-decapod-order-boundary-evidence", sourceKey: S.order.key, scopeKey: penScope, locator: S.order.summary }],
    },
    {
      key: "phase239-decapod-status",
      predicate: "availability_status",
      objectText: "2025-05-16 官方公告曾恢复 Decapod 接单；2026-04-14 官方公告又说明 Decapod 系列因订单增加暂时停止接单。产品页存在不等于当前订单开放。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: S.suspend.key,
      locator: S.suspend.summary,
      evidence: [
        { key: "phase239-decapod-status-resume", sourceKey: S.resume.key, scopeKey: penScope, locator: S.resume.summary },
        { key: "phase239-decapod-status-suspend", sourceKey: S.suspend.key, scopeKey: penScope, locator: S.suspend.summary },
      ],
    },
    {
      key: "phase239-decapod-independent-review",
      predicate: "professional_secondary_context",
      objectText: "S.B. Brown 发布过以 Nakaya Decapod 为题的独立钢笔评测并提供多张实拍入口，可帮助读者理解多面体外形和实际使用语境；该评测不替代 02019-WST-11 的官方规格或当前订单状态。",
      factClass: "core",
      confidence: 0.9,
      sourceKey: S.review.key,
      locator: S.review.summary,
      evidence: [{ key: "phase239-decapod-review-evidence", sourceKey: S.review.key, scopeKey: penScope, locator: S.review.summary }],
    },
    {
      key: "phase239-decapod-care",
      predicate: "maintenance_boundary",
      objectText: "以室温清水清洗并自然干燥；避免热水、酒精、强溶剂、研磨膏、超声波和硬刷，不要强行旋拧四线螺纹或拆卸笔尖、笔舌与供墨件。异常断墨、渗漏、弯尖、裂纹或漆面损伤应先停用并走 Nakaya 调校/维修流程。",
      factClass: "editorial",
      confidence: 0.98,
      sourceKey: S.repair.key,
      locator: S.repair.summary,
      evidence: [{ key: "phase239-decapod-care-evidence", sourceKey: S.repair.key, scopeKey: penScope, locator: S.repair.summary }],
    },
  ],
  variants: [{
    key: "phase239-decapod-product-record",
    name: "Writer Decapod ST Kuro-tame（02019-WST-11）",
    notes: "官方具体产品记录；产品号、24.0 g、150.0 mm、15.0 mm、硬橡胶、约七个月制作期和检索日价格只在该记录范围内有效。",
    sourceKey: S.product.key,
    variantKind: "market_sku",
    productCode: "02019-WST-11",
    market: "global",
  }],
  spec: {
    brandEntityId: PHASE239_NAKAYA_ID,
    values: {
      series_name: "Nakaya Writer Decapod ST Kuro-tamenuri",
      release_year: "官方具体产品记录当前可见；官方未公布该产品号的首发年份",
      origin_country: "日本；Nakaya 官方日本手工钢笔体系",
      nib: "按订单选择线宽、颜色与是否调校；官方产品记录未声明固定通用尖型",
      fill_system: "按订单与官方确认；产品记录未声明固定通用转换器或墨囊配置",
      material: "Ebonite（硬橡胶）笔身；Writer 带笔夹；Kuro-tame 漆面",
      dimensions: "总长 150.0 mm、最大直径 15.0 mm；官方模型标准约 130 mm 未盖帽",
      weight: "具体产品记录 24.0 g；官方 Decapod(ST) Writer 标准表约 25 g，手工成品有小幅误差",
      price_range: "官方产品记录检索时显示 USD 1,500；价格与订单状态会变动",
      status: "官方具体产品页可核验；2026-04-14 官方公告显示 Decapod 系列暂时停止接单",
    },
    evidence: [
      evidence("brand_entity_id", "phase239-decapod-brand", S.home.key, penScope, "Nakaya official maker identity"),
      evidence("series_name", "phase239-decapod-series", S.product.key, penScope, "official title and product no. 02019-WST-11"),
      evidence("release_year", "phase239-decapod-release", S.product.key, penScope, "current product record; launch year withheld"),
      evidence("origin_country", "phase239-decapod-origin", S.home.key, penScope, "official Japanese handmade fountain pen context"),
      evidence("nib", "phase239-decapod-nib", S.order.key, penScope, "official order choices for nib line width, colour and tuning"),
      evidence("fill_system", "phase239-decapod-fill", S.order.key, penScope, "official order confirmation boundary; no fixed filler on product record"),
      evidence("material", "phase239-decapod-material", S.product.key, penScope, "official product material field"),
      evidence("dimensions", "phase239-decapod-dimensions", S.product.key, penScope, "official product dimensions"),
      evidence("weight", "phase239-decapod-weight", S.product.key, penScope, "official product weight; size table gives model standard"),
      evidence("price_range", "phase239-decapod-price", S.product.key, penScope, "retrieved product price snapshot; mutable"),
      evidence("status", "phase239-decapod-status-field", S.suspend.key, penScope, "official 2026-04-14 temporary suspension"),
    ],
  },
  timeline: [
    { key: "phase239-decapod-product-record", title: "Writer Decapod ST Kuro-tame 产品记录", eventType: "model_released", startDate: RETRIEVED, circa: true, description: "官方当前具体产品记录可见；页面可见时间不被倒推为首发年份。", sourceKey: S.product.key },
    { key: "phase239-decapod-resumed", title: "Decapod 恢复接单公告", eventType: "design_milestone", startDate: "2025-05-16", circa: false, description: "官方公告曾恢复 Decapod 型号接单。", sourceKey: S.resume.key },
    { key: "phase239-decapod-suspended", title: "Decapod 暂停接单公告", eventType: "discontinued", startDate: "2026-04-14", circa: false, description: "官方公告因订单增加暂时停止 Decapod 接单；此处记录订单状态而非永久停产。", sourceKey: S.suspend.key },
  ],
  media: media(S.penSvg, "phase239-nakaya-decapod-primary", "Nakaya Writer Decapod ST Kuro-tame 事实图（非产品照片）"),
};

export const phase239NakayaDecapodPacks: CuratedEntityPack[] = [brand, pen];
