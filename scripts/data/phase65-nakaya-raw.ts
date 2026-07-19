import type {
  CuratedEntityPack,
  CuratedSource,
  SpecFieldKey,
} from "../lib/curated-content-pack";

export const PHASE65_NAKAYA_ID = "qrZay1FxJDjd";
export const PHASE65_HOUSOGE_ID = "XRyAh9ESgAP9";
export const PHASE65_CIGAR_PORTABLE_ID = "yi6bQ5ulPD-W";
export const PHASE65_WRITER_PORTABLE_ID = "YeodugzY82yu";
export const PHASE65_HOUSOGE_RAW_SLUG = "中屋-nakaya-housoge高级定制";
export const PHASE65_CIGAR_PORTABLE_RAW_SLUG = "中屋-nakaya-portable-portable-cigar";
export const PHASE65_WRITER_PORTABLE_RAW_SLUG = "中屋-nakaya-portable-writer-黑溜涂";
export const PHASE65_HOUSOGE_SLUG = "nakaya-cigar-piccolo-housoge";
export const PHASE65_CIGAR_PORTABLE_SLUG = "nakaya-cigar-portable-kuro-tamenuri";
export const PHASE65_WRITER_PORTABLE_SLUG = "nakaya-writer-portable-kuro-tamenuri";

const RETRIEVED = "2026-07-20";

function live(input: Omit<CuratedSource, "retrievedAt" | "allowedUse" | "homepageUrl" | "archiveUrl" | "archiveLocator" | "independenceGroup">): CuratedSource {
  return {
    ...input,
    homepageUrl: input.url,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
    independenceGroup: input.registryKey,
  };
}

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG，示意图而非产品照片。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false`,
  };
}

const SOURCES = {
  brand: live({
    key: "phase65-nakaya-brand",
    registryKey: "nakaya-official-phase65",
    registryName: "Nakaya Fountain Pen official",
    sourceType: "official",
    tier: "primary",
    title: "Nakaya Fountain Pen official site",
    url: "https://www.nakaya.org/en/",
    summary: "官网将手工制作、漆艺、按书写习惯订制、订单与售后支持分开说明；不同笔形、漆面与订单选项不能混为一个型号。",
  }),
  size: live({
    key: "phase65-nakaya-size",
    registryKey: "nakaya-official-phase65",
    registryName: "Nakaya Fountain Pen official",
    sourceType: "official",
    tier: "primary",
    title: "Nakaya size and weight guide",
    url: "https://www.nakaya.org/en/commitment/23035/",
    summary: "官方尺寸表列 Cigar Piccolo 130 mm/20 g、Cigar Portable 150 mm/20 g、Writer Portable 150 mm/25 g，并明确手工作品会有小幅误差。",
  }),
  housoge: live({
    key: "phase65-nakaya-housoge",
    registryKey: "nakaya-official-phase65",
    registryName: "Nakaya Fountain Pen official",
    sourceType: "official",
    tier: "primary",
    title: "Nakaya Cigar Piccolo HOUSOGE (Black/Gold Lines)",
    url: "https://www.nakaya.org/en/products/info/37698/",
    summary: "官方产品号 2070CPI-10-00；Chinkin 宝相华纹样覆盖包括握位在内的整支笔身，列硬橡胶、130 mm、15 mm、20 g。",
  }),
  cigarPortable: live({
    key: "phase65-nakaya-cigar-portable",
    registryKey: "nakaya-official-phase65",
    registryName: "Nakaya Fountain Pen official",
    sourceType: "official",
    tier: "primary",
    title: "Nakaya Cigar Portable Kuro-tame",
    url: "https://www.nakaya.org/en/products/info/36624/",
    summary: "官方产品号 1207CP5-11-00；无笔夹 Cigar Portable 为硬橡胶、150 mm、15 mm、20 g，Kuro-tamenuri 为黑色上层与朱色底层的漆面说明。",
  }),
  writerPortable: live({
    key: "phase65-nakaya-writer-portable",
    registryKey: "nakaya-official-phase65",
    registryName: "Nakaya Fountain Pen official",
    sourceType: "official",
    tier: "primary",
    title: "Nakaya Writer Portable Kuro-tame",
    url: "https://www.nakaya.org/en/products/info/36696/",
    summary: "官方产品号 1177WP5-11-00；带笔夹 Writer Portable 为硬橡胶、150 mm、15 mm、25 g，Kuro-tamenuri 是漆面而非另一基础笔形。",
  }),
  housogeReview: live({
    key: "phase65-nakaya-housoge-review",
    registryKey: "fpn-housoge-phase65",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "professional_secondary",
    title: "Fountain Pen Network: Nakaya Naka-ai Chinkin Housoge review",
    url: "https://www.fountainpennetwork.com/forum/topic/266754-review-nakaya-naka-ai-chinkin-%E2%80%9Chousoge%E2%80%9D-kikyoplatinum/",
    summary: "不同 Naka-ai 笔形的 Housoge 样本只能旁证主题与装饰语境；其尺寸、重量、笔夹与笔尖配置不得回填 Cigar Piccolo。",
  }),
  cigarPortableReview: live({
    key: "phase65-nakaya-cigar-portable-review",
    registryKey: "penaddict-nakaya-phase65",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    title: "The Pen Addict: Nakaya Portable Cigar Ao-tamenuri review",
    url: "https://penaddict.squarespace.com/blog/2015/2/6/nakaya-portable-cigar-ao-tamenuri-fountain-pen-review",
    summary: "不同漆面 Ao-tamenuri 的 Cigar Portable 评测只作无笔夹基础笔形、使用与订制语境旁证，不替代 Kuro-tamenuri 的官方规格。",
  }),
  writerPortableReview: live({
    key: "phase65-nakaya-writer-portable-review",
    registryKey: "fpn-writer-portable-phase65",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "professional_secondary",
    title: "Fountain Pen Network: Nakaya Portable Writer Kuro-tamenuri review",
    url: "https://www.fountainpennetwork.com/forum/topic/307510-nakaya-portable-writer-kuro-tamenuri/",
    summary: "个体订单讨论显示笔尖、转换器与调校会改变实际体验；不把样本的尖型、容量或改磨写为该产品号固定标准。",
  }),
  brandSvg: diagram("phase65-nakaya-brand-svg", "Nakaya 型号命名事实图", "/images/library/site-original/nakaya/nakaya-brand.svg"),
  housogeSvg: diagram("phase65-nakaya-housoge-svg", "Nakaya Cigar Piccolo Housoge 事实图", "/images/library/site-original/nakaya/nakaya-cigar-piccolo-housoge.svg"),
  cigarPortableSvg: diagram("phase65-nakaya-cigar-portable-svg", "Nakaya Cigar Portable Kuro-tamenuri 事实图", "/images/library/site-original/nakaya/nakaya-cigar-portable-kuro-tamenuri.svg"),
  writerPortableSvg: diagram("phase65-nakaya-writer-portable-svg", "Nakaya Writer Portable Kuro-tamenuri 事实图", "/images/library/site-original/nakaya/nakaya-writer-portable-kuro-tamenuri.svg"),
};

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

function media(key: string, title: string, source: CuratedSource) {
  return [{ key, title, sourceKey: source.key, localPath: source.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不代表真实比例、颜色、Logo、刻字、库存或具体笔尖配置。", sourceUrl: source.url, usageStatus: "primary" as const }];
}

function brand(): CuratedEntityPack {
  const scopeKey = "phase65-nakaya-brand-scope";
  return {
    key: "phase65-nakaya-brand-v1", entityId: PHASE65_NAKAYA_ID, expectedType: "brand", expectedSlug: "nakaya", canonicalName: "Nakaya", publicationIntent: "publish", publicationBlockers: [], markdownFile: ".planning/content-research/nakaya-brand-phase65.md", storyTitle: "Nakaya：先分清笔形、长度和漆面", primarySourceKey: SOURCES.brand.key, depthTier: "A",
    aliases: [{ alias: "Nakaya", language: "en", sourceKey: SOURCES.brand.key }, { alias: "中屋", language: "zh", sourceKey: SOURCES.brand.key }],
    sources: [SOURCES.brand, SOURCES.size, SOURCES.writerPortableReview, SOURCES.brandSvg],
    scopes: [{ key: scopeKey, scopeKey, productionState: "current", editionScope: "品牌导航；笔形、长度、漆面与具体装饰款分层，反向链接到已资料化公开型号" }],
    claims: [
      { key: "nakaya-brand-identity", predicate: "brand_identity", objectText: "Nakaya 以手工制作、漆艺、书写样张与订单订制服务构成其品牌入口；页面不把基础笔形、漆面和单笔订单混成统一型号。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.brand.key, locator: SOURCES.brand.summary, evidence: [{ key: "nakaya-brand-identity-evidence", sourceKey: SOURCES.brand.key, scopeKey, locator: SOURCES.brand.summary }] },
      { key: "nakaya-brand-boundary", predicate: "brand_navigation_boundary", objectText: "Cigar/Writer 是笔形，Long/Portable/Piccolo 是长度，Kuro-tamenuri 或 Housoge 是漆面/装饰；具体订单笔尖、价格与交期另行确认。", factClass: "core", confidence: 0.99, sourceKey: SOURCES.size.key, locator: SOURCES.size.summary, evidence: [{ key: "nakaya-brand-boundary-evidence", sourceKey: SOURCES.size.key, scopeKey, locator: SOURCES.size.summary }, { key: "nakaya-brand-secondary-evidence", sourceKey: SOURCES.writerPortableReview.key, scopeKey, locator: SOURCES.writerPortableReview.summary }] },
    ],
    media: media("nakaya-brand-media", "Nakaya 型号命名事实图（非产品照片）", SOURCES.brandSvg),
    timeline: [
      { key: "nakaya-brand-current-entry", title: "Nakaya 当前品牌入口", eventType: "design_milestone", startDate: "2026", circa: true, description: "当前官方入口展示手工制作、漆艺和订制服务；不以页面可见日期倒推创立年份。", sourceKey: SOURCES.brand.key },
      { key: "nakaya-brand-shape-system", title: "Nakaya 笔形与长度体系复核", eventType: "design_milestone", startDate: "2026", circa: true, description: "官方尺寸表把 Cigar/Writer 与 Long/Portable/Piccolo 分层，避免将笔形、长度和漆面混作一个型号。", sourceKey: SOURCES.size.key },
    ],
  };
}

function pen(input: {
  key: string; id: string; slug: string; name: string; title: string; markdownFile: string; primary: CuratedSource; secondary: CuratedSource; svg: CuratedSource; aliases: string[]; release: string; nib: string; fill: string; material: string; dimensions: string; weight: string; status: string; summary: string; boundary: string; variants: CuratedEntityPack["variants"];
}): CuratedEntityPack {
  const scopeKey = `${input.key}-scope`;
  return {
    key: `phase65-${input.key}-v1`, entityId: input.id, expectedType: "pen", expectedSlug: input.slug, canonicalName: input.name, publicationIntent: "publish", publicationBlockers: [], markdownFile: input.markdownFile, storyTitle: input.title, primarySourceKey: input.primary.key, depthTier: "A",
    aliases: input.aliases.map((alias, index) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: index === 0 ? input.primary.key : input.secondary.key })),
    sources: [input.primary, SOURCES.brand, SOURCES.size, input.secondary, input.svg],
    scopes: [{ key: scopeKey, scopeKey, productionState: "current", editionScope: "完整基础笔形、长度和漆面/装饰组合；笔尖、研磨、供墨、订单包、价格和交期按当期订单或实物核对" }],
    claims: [
      { key: `${input.key}-identity`, predicate: "model_identity", objectText: input.summary, factClass: "core", confidence: 0.99, sourceKey: input.primary.key, locator: input.primary.summary, evidence: [{ key: `${input.key}-identity-evidence`, sourceKey: input.primary.key, scopeKey, locator: input.primary.summary }] },
      { key: `${input.key}-boundary`, predicate: "version_boundary", objectText: input.boundary, factClass: "core", confidence: 0.99, sourceKey: input.secondary.key, locator: input.secondary.summary, evidence: [{ key: `${input.key}-boundary-evidence`, sourceKey: input.secondary.key, scopeKey, locator: input.secondary.summary }, { key: `${input.key}-official-boundary`, sourceKey: input.primary.key, scopeKey, locator: input.primary.summary }] },
      { key: `${input.key}-care`, predicate: "maintenance_boundary", objectText: "以室温清水清洗并自然干燥；不要用热水、酒精、强溶剂、超声波、抛光剂或硬物处理漆面，也不要蛮力拆解笔尖、笔舌和供墨部件。持续断墨、渗漏、碰撞或漆面异常应停止施力并交由品牌或专业维修判断。", factClass: "core", confidence: 0.98, sourceKey: SOURCES.brand.key, locator: "official after-sales and care entry", evidence: [{ key: `${input.key}-care-evidence`, sourceKey: SOURCES.brand.key, scopeKey, locator: "official after-sales and care entry" }] },
    ],
    variants: input.variants,
    spec: { brandEntityId: PHASE65_NAKAYA_ID, values: { series_name: input.name, release_year: input.release, origin_country: "日本 Nakaya 手工钢笔；具体制造、订单和地区信息以官方当期确认及实物为准", nib: input.nib, fill_system: input.fill, material: input.material, dimensions: input.dimensions, weight: input.weight, status: input.status }, evidence: [
      evidence("brand_entity_id", `${input.key}-brand`, SOURCES.brand.key, scopeKey, "official Nakaya maker identity"),
      evidence("series_name", `${input.key}-series`, input.primary.key, scopeKey, "official product title and product number"),
      evidence("release_year", `${input.key}-release`, input.primary.key, scopeKey, "official current product-page availability, not assumed launch year"),
      evidence("origin_country", `${input.key}-origin`, SOURCES.brand.key, scopeKey, "official Nakaya Japanese handmade fountain pen context"),
      evidence("nib", `${input.key}-nib`, SOURCES.brand.key, scopeKey, "official custom-order boundary; exact nib depends on order"),
      evidence("fill_system", `${input.key}-fill`, SOURCES.brand.key, scopeKey, "official order/after-sales boundary; exact supply configuration requires order confirmation"),
      evidence("material", `${input.key}-material`, input.primary.key, scopeKey, "official product material field"),
      evidence("dimensions", `${input.key}-dimensions`, input.primary.key, scopeKey, "official product dimensions; size table confirms hand-made tolerance"),
      evidence("weight", `${input.key}-weight`, input.primary.key, scopeKey, "official product weight; size table confirms hand-made tolerance"),
      evidence("status", `${input.key}-status`, input.primary.key, scopeKey, "official product page and order boundary"),
    ] },
    media: media(`${input.key}-media`, `${input.name} 事实图（非产品照片）`, input.svg),
    timeline: [{ key: `${input.key}-current`, title: `${input.name} 的官方产品页范围`, eventType: "model_released", startDate: "2026", circa: true, description: "当前官方具体产品页可见；不把页面可见日期误写为首发年份，也不以此保证订单状态。", sourceKey: input.primary.key }],
  };
}

export const phase65NakayaPacks: CuratedEntityPack[] = [
  brand(),
  pen({ key: "housoge", id: PHASE65_HOUSOGE_ID, slug: PHASE65_HOUSOGE_SLUG, name: "Nakaya Cigar Piccolo Housoge", title: "Nakaya Cigar Piccolo Housoge：宝相华沉金不是通用漆面", markdownFile: ".planning/content-research/nakaya-cigar-piccolo-housoge.md", primary: SOURCES.housoge, secondary: SOURCES.housogeReview, svg: SOURCES.housogeSvg, aliases: ["Nakaya Cigar Piccolo Housoge", "Nakaya Cigar Piccolo HOUSOGE", "中屋 Cigar Piccolo 宝相华", "中屋 Housoge 高级定制"], release: "官方具体产品页可见；首发年份待官方档案核实", nib: "按订单配置；不把其他 Nakaya 或评测样本的尖型/研磨写为固定标准", fill: "按订单与当前官方说明确认；不以其他 Nakaya 样本的转换器/墨囊配置外推", material: "硬橡胶笔身；黑底金线 Chinkin 宝相华装饰覆盖包括握位在内的整支笔身", dimensions: "约 130 mm 长、15 mm 最大直径；手工成品有小幅误差", weight: "约 20 g；手工成品有小幅误差", status: "官方具体产品页可见；订单、价格、交期和选项须下单前确认", summary: "Nakaya Cigar Piccolo Housoge 是产品号 2070CPI-10-00 的具体 Cigar Piccolo 装饰款；宝相华 Chinkin 图案覆盖包括握位在内的整支笔身，不能被泛化成所有 Nakaya 或所有 Housoge。", boundary: "Housoge 是这支 Cigar Piccolo 的特定沉金装饰；不同笔形上的 Housoge、纯色 Piccolo、不同笔尖/订单配置都不是同一版本。", variants: [{ key: "housoge-order-options", name: "笔尖、订单与图案/底色定制", notes: "可选笔尖、研磨、订单图案/底色、价格和交期按实际确认，不因订单差异创建 duplicate。", sourceKey: SOURCES.housoge.key, variantKind: "market_sku", productCode: "2070CPI-10-00", market: "JP" }] }),
  pen({ key: "cigar-portable", id: PHASE65_CIGAR_PORTABLE_ID, slug: PHASE65_CIGAR_PORTABLE_SLUG, name: "Nakaya Cigar Portable Kuro-tamenuri", title: "Nakaya Cigar Portable Kuro-tamenuri：无笔夹的黑溜涂日用尺寸", markdownFile: ".planning/content-research/nakaya-cigar-portable-kuro-tamenuri.md", primary: SOURCES.cigarPortable, secondary: SOURCES.cigarPortableReview, svg: SOURCES.cigarPortableSvg, aliases: ["Nakaya Cigar Portable Kuro-tamenuri", "Nakaya Cigar Portable Kuro-tame", "中屋 Cigar Portable 黑溜涂", "Nakaya Portable / Portable Cigar"], release: "官方具体产品页可见；首发年份待官方档案核实", nib: "按订单配置；不以其他 Cigar Portable 漆面评测的尖型/改磨作为固定标准", fill: "按订单与当前官方说明确认；不以其他样本的转换器/墨囊配置外推", material: "硬橡胶笔身；无笔夹 Cigar 轮廓；朱色底层与黑色上层形成 Kuro-tamenuri 漆面", dimensions: "约 150 mm 总长、130 mm 未盖帽、15 mm 最大直径；手工成品有小幅误差", weight: "约 20 g 总重、15 g 未盖帽；手工成品有小幅误差", status: "官方具体产品页可见；订单、价格、交期和选项须下单前确认", summary: "Nakaya Cigar Portable Kuro-tamenuri 是产品号 1207CP5-11-00 的无笔夹 Cigar Portable；150 mm、约 20 g 的硬橡胶基础笔形与黑溜涂漆面构成一个完整型号。", boundary: "Portable 是长度、Cigar 是无笔夹笔形、Kuro-tamenuri 是漆面；带笔夹 Writer Portable 与不同漆面 Cigar Portable 不能共用重量、图片或订单规格。", variants: [{ key: "cigar-portable-order-options", name: "笔尖、订单、颜色与漆面定制", notes: "笔尖、研磨、订单图案/底色、价格和交期按实际确认；不同漆面仍需以完整名称和产品号识别。", sourceKey: SOURCES.cigarPortable.key, variantKind: "market_sku", productCode: "1207CP5-11-00", market: "JP" }] }),
  pen({ key: "writer-portable", id: PHASE65_WRITER_PORTABLE_ID, slug: PHASE65_WRITER_PORTABLE_SLUG, name: "Nakaya Writer Portable Kuro-tamenuri", title: "Nakaya Writer Portable Kuro-tamenuri：有笔夹的黑溜涂 Portable", markdownFile: ".planning/content-research/nakaya-writer-portable-kuro-tamenuri.md", primary: SOURCES.writerPortable, secondary: SOURCES.writerPortableReview, svg: SOURCES.writerPortableSvg, aliases: ["Nakaya Writer Portable Kuro-tamenuri", "Nakaya Writer Portable Kuro-tame", "中屋 Writer Portable 黑溜涂", "Nakaya Portable Writer 黑溜涂"], release: "官方具体产品页可见；首发年份待官方档案核实", nib: "按订单配置；论坛样本的 14K、双色或改磨尖不等于当前所有产品号固定配置", fill: "按订单与当前官方说明确认；论坛样本的转换器体验不等于全部订单标准", material: "硬橡胶笔身；带笔夹 Writer 轮廓；朱色底层与黑色上层形成 Kuro-tamenuri 漆面", dimensions: "约 150 mm 总长、130 mm 未盖帽、15 mm 最大直径；手工成品有小幅误差", weight: "约 25 g 总重、15 g 未盖帽；手工成品有小幅误差", status: "官方具体产品页可见；订单、价格、交期和选项须下单前确认", summary: "Nakaya Writer Portable Kuro-tamenuri 是产品号 1177WP5-11-00 的带笔夹 Writer Portable；同为 150 mm，但官方总重约 25 g，和无笔夹 Cigar Portable 的携带方式与重量不能混写。", boundary: "Writer 的笔夹是基础笔形特征，Kuro-tamenuri 是漆面；个体订单的笔尖、转换器和调校只构成订单差异，不把它们写成这支型号的统一出厂事实。", variants: [{ key: "writer-portable-order-options", name: "笔尖、订单、颜色与漆面定制", notes: "笔尖、研磨、订单图案/底色、价格和交期按实际确认；带笔夹 Writer 不与无笔夹 Cigar 合并。", sourceKey: SOURCES.writerPortable.key, variantKind: "market_sku", productCode: "1177WP5-11-00", market: "JP" }] }),
];
