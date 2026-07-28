import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { PHASE83_DIPLOMAT_BRAND_ID, phase83DiplomatLeonardoPacks } from "./phase83-diplomat-leonardo";

export const PHASE329_DIPLOMAT_BRAND_ID = PHASE83_DIPLOMAT_BRAND_ID;
export const PHASE329_NEXUS_ID = "phase329-pen-diplomat-nexus";
export const PHASE329_NEXUS_SLUG = "diplomat-nexus";
export const PHASE329_CLR_ID = "phase329-pen-diplomat-clr";
export const PHASE329_CLR_SLUG = "diplomat-clr";
export const PHASE329_ESTEEM_ID = "phase329-pen-diplomat-esteem";
export const PHASE329_ESTEEM_SLUG = "diplomat-esteem";
export const PHASE329_TRAVELLER_ID = "phase329-pen-diplomat-traveller";
export const PHASE329_TRAVELLER_SLUG = "diplomat-traveller";

const RETRIEVED = "2026-07-28";

function source(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  registryKey: string;
  registryName: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  homepageUrl?: string;
  author?: string;
  publishedAt?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? "primary",
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.homepageUrl ?? (sourceType === "official" ? "https://www.diplomat-pen.com/" : "/"),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt ?? null,
    retrievedAt: RETRIEVED,
    allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only",
    license: sourceType === "user_submission" ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: sourceType === "user_submission"
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function claim(key: string, predicate: string, objectText: string, sourceKey: string, locator: string, scopeKey: string, factClass: "core" | "editorial" = "core"): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.94,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }],
  };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string, scopeKey: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const SOURCES = {
  collections: source({
    key: "phase329-diplomat-collections",
    title: "Diplomat collections — current fountain pen families",
    url: "https://www.diplomat-pen.com/en/collections/",
    summary: "官方集合页把 Nexus、CLR、Esteem、Traveller、Magnum、Spacetec 分列；Nexus 以 piston technology 与 sealing cap 识别，CLR 以五个可换内环，Esteem 为圆柱路线，Traveller 为更纤细的金属路线。",
    registryKey: "diplomat-official-collections-phase329",
    registryName: "Diplomat",
  }),
  fountainArchive: source({
    key: "phase329-diplomat-fountain-archive",
    title: "Diplomat fountain pen catalogue archive",
    url: "https://www.diplomat-pen.com/en/type-of-product/fountain-pen/",
    summary: "官方钢笔归档用于核对当前商品家族与价格快照；地区库存和价格会变化，不把归档列表当作历史全量。",
    registryKey: "diplomat-official-archive-phase329",
    registryName: "Diplomat",
  }),
  guide: source({
    key: "phase329-diplomat-service-guide",
    title: "DIPLOMAT Service Guide & Warranty",
    url: "https://www.diplomat-pen.com/wp-content/uploads/2025/07/DIPLOMAT-Service-Guide-Warranty.pdf",
    summary: "官方服务指南用于标准墨胆/转换器清洁、清水冲洗、笔尖朝上运输和五年保修边界；Nexus 的专用上墨机构不据此改写成普通 C/C。",
    registryKey: "diplomat-official-service-phase329",
    registryName: "Diplomat",
    publishedAt: "2025-07-01",
  }),
  nexus: source({
    key: "phase329-diplomat-nexus-product",
    title: "Diplomat Nexus Demo Chrome Fountain Pen",
    url: "https://www.diplomat-pen.com/en/product/nexus-demo-chrome-fountain-pen/",
    summary: "官方 Nexus 商品页给出 piston/pipette filling、patented cap-closure sealing、超过七支墨胆的容量说明、145 mm、14 mm、55 g、EF/F/M/B 不锈钢尖与 filling kit。",
    registryKey: "diplomat-official-nexus-phase329",
    registryName: "Diplomat",
  }),
  clr: source({
    key: "phase329-diplomat-clr-product",
    title: "Diplomat CLR Chrome Lacquer Fountain Pen",
    url: "https://www.diplomat-pen.com/en/product/clr-chrome-lacquer-fountain-pen/",
    summary: "官方 CLR 商品页给出黄铜笔身、可更换内环、不锈钢尖、转换器、135/155/12 mm、30 g、五年保修以及颜色和尖幅选择。",
    registryKey: "diplomat-official-clr-phase329",
    registryName: "Diplomat",
  }),
  esteem: source({
    key: "phase329-diplomat-esteem-product",
    title: "Diplomat Esteem Lapis Fountain Pen",
    url: "https://www.diplomat-pen.com/en/product/esteem-lapis-fountain-pen/",
    summary: "官方 Esteem Lapis 商品页给出黄铜笔身、不锈钢尖、一支墨胆、135/155/12 mm、28 g、F/M/B 与五年保修；Lapis、Barley 等是产品变体。",
    registryKey: "diplomat-official-esteem-phase329",
    registryName: "Diplomat",
  }),
  traveller: source({
    key: "phase329-diplomat-traveller-product",
    title: "Diplomat Traveller Chrome Steel Fountain Pen",
    url: "https://www.diplomat-pen.com/en/product/traveller-chrome-steel-fountain-pen/",
    summary: "官方 Traveller 商品页给出不锈钢笔身、不锈钢尖、一支墨胆、134/155/10 mm、19 g、F/M 与五年保修。",
    registryKey: "diplomat-official-traveller-phase329",
    registryName: "Diplomat",
  }),
  travellerArchive: source({
    key: "phase329-diplomat-traveller-archive",
    title: "Diplomat Traveller shop archive",
    url: "https://www.diplomat-pen.com/en/shop/diplomat/traveller/",
    summary: "官方 Traveller 归档列出 steel、steel gold、Flame、Funky、Lapis 与 lacquered chrome/gold 等表面 SKU；它们共享 Traveller 身份，不拆成多个基础型号。",
    registryKey: "diplomat-official-traveller-archive-phase329",
    registryName: "Diplomat",
  }),
  nexusReview: source({
    key: "phase329-sacrideo-nexus",
    title: "A Quick Review of the Diplomat Nexus",
    url: "https://www.sacrideo.us/a-quick-review-of-the-diplomat-nexus/",
    summary: "Sacrideo 的专业评测以实物样本讨论 Nexus 的大尺寸、重量、约 3 ml 级别的个人实测容量与密封帽体验；实测不替代官方规格。",
    registryKey: "sacrideo-nexus-phase329",
    registryName: "Sacrideo",
    sourceType: "blog",
    tier: "professional_secondary",
    homepageUrl: "https://www.sacrideo.us/",
    author: "Sacrideo",
  }),
  clrReview: source({
    key: "phase329-penchalet-clr",
    title: "Diplomat CLR Black Lacquer Fountain Pens",
    url: "https://www.penchalet.com/fine_pens/fountain_pens/diplomat_CLR_black_lacquer_fountain_pens.html",
    summary: "Pen Chalet 的专业经销资料交叉记录 CLR 的金属笔身、可换色内环、钢尖与转换器语境；具体尺寸和官方五年保修仍以 Diplomat 为准。",
    registryKey: "pen-chalet-clr-phase329",
    registryName: "Pen Chalet",
    sourceType: "retailer",
    tier: "professional_secondary",
    homepageUrl: "https://www.penchalet.com/",
    author: "Pen Chalet",
  }),
  esteemReview: source({
    key: "phase329-gentleman-stationer-esteem",
    title: "Pen Review: Diplomat Esteem",
    url: "https://www.gentlemanstationer.com/blog/2016/10/31/pen-review-diplomat-esteem",
    summary: "The Gentleman Stationer 的专业评测以样笔讨论 Esteem 的钢尖、塑料握位、转换器/墨胆和日用握持；体验观察限定为评测样本。",
    registryKey: "gentleman-stationer-esteem-phase329",
    registryName: "The Gentleman Stationer",
    sourceType: "blog",
    tier: "professional_secondary",
    homepageUrl: "https://www.gentlemanstationer.com/",
    author: "The Gentleman Stationer",
    publishedAt: "2016-10-31",
  }),
  travellerReview: source({
    key: "phase329-ian-hedley-traveller",
    title: "Diplomat Traveller Fountain Pen review",
    url: "https://penpaperpencil.net/diplomat-traveller-fountain-pen-review/",
    summary: "Ian Hedley 的专业评测以 Traveller 样本讨论细长金属笔身、国际墨胆/转换器、笔帽与插帽后的长度；实测体验不替代官方当前 SKU。",
    registryKey: "ian-hedley-traveller-phase329",
    registryName: "Pen Paper Pencils",
    sourceType: "blog",
    tier: "professional_secondary",
    homepageUrl: "https://penpaperpencil.net/",
    author: "Ian Hedley",
  }),
  nexusDiagram: source({
    key: "phase329-diplomat-nexus-svg",
    title: "Diplomat Nexus factual diagram",
    url: "/images/library/site-original/phase329/diplomat/nexus.svg",
    summary: "本站原创 Nexus 事实 SVG，标示 piston/pipette、密封帽和官方尺寸样本；非产品照片、非 Logo、非比例图、非颜色校样。",
    registryKey: "fountain-pen-graph-editorial-phase329-nexus",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    homepageUrl: "/",
  }),
  clrDiagram: source({
    key: "phase329-diplomat-clr-svg",
    title: "Diplomat CLR factual diagram",
    url: "/images/library/site-original/phase329/diplomat/clr.svg",
    summary: "本站原创 CLR 事实 SVG，标示可换内环、转换器和官方尺寸样本；非产品照片、非 Logo、非比例图、非颜色校样。",
    registryKey: "fountain-pen-graph-editorial-phase329-clr",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    homepageUrl: "/",
  }),
  esteemDiagram: source({
    key: "phase329-diplomat-esteem-svg",
    title: "Diplomat Esteem factual diagram",
    url: "/images/library/site-original/phase329/diplomat/esteem.svg",
    summary: "本站原创 Esteem 事实 SVG，标示黄铜圆柱笔身、转换器/墨胆和官方尺寸样本；非产品照片、非 Logo、非比例图、非颜色校样。",
    registryKey: "fountain-pen-graph-editorial-phase329-esteem",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    homepageUrl: "/",
  }),
  travellerDiagram: source({
    key: "phase329-diplomat-traveller-svg",
    title: "Diplomat Traveller factual diagram",
    url: "/images/library/site-original/phase329/diplomat/traveller.svg",
    summary: "本站原创 Traveller 事实 SVG，标示纤细金属笔身、标准墨胆和官方尺寸样本；非产品照片、非 Logo、非比例图、非颜色校样。",
    registryKey: "fountain-pen-graph-editorial-phase329-traveller",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    homepageUrl: "/",
  }),
} as const;

const inheritedBrand = phase83DiplomatLeonardoPacks({
  excellenceA2: "phase83-pen-diplomat-excellence-a2",
  elox: "phase83-pen-diplomat-elox",
  momentoZero: "phase83-pen-leonardo-momento-zero",
  mzgMosaico: "phase83-pen-leonardo-mzg-mosaico",
}).find((pack) => pack.entityId === PHASE329_DIPLOMAT_BRAND_ID && pack.expectedType === "brand");
if (!inheritedBrand) throw new Error("Phase 329 Diplomat brand pack is unavailable.");

type ModelInput = {
  key: string;
  id: string;
  slug: string;
  name: string;
  markdownFile: string;
  storyTitle: string;
  summary: string;
  scope: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  extra: CuratedSource[];
  diagram: CuratedSource;
  aliases: CuratedEntityPack["aliases"];
  claims: Array<[string, string, string, CuratedSource, string] | [string, string, string, CuratedSource, string, "core" | "editorial"]>;
  variants: CuratedEntityPack["variants"];
  values: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
  specEvidence: Array<[SpecFieldKey, CuratedSource, string]>;
};

function model(input: ModelInput): CuratedEntityPack {
  const sources = [input.primary, input.secondary, ...input.extra, input.diagram];
  return {
    key: `phase329-${input.key}-v1`,
    entityId: input.id,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.storyTitle,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases,
    sources,
    scopes: [
      { key: input.scope, scopeKey: input.scope, market: `${input.name} current official catalogue snapshot`, validFrom: "2026-01-01", productionState: "current", nibScope: input.values.nib, materialScope: input.values.material, editionScope: "颜色、饰件、尖幅与填充配件按 SKU 记录；不与相邻 Diplomat 型号合并" },
      { key: `${input.scope}-boundary`, scopeKey: `${input.scope}-boundary`, productionState: "current", editionScope: "与 Diplomat Viper、Cobra、Excellence A+/A2 及相邻系列的帽机制、尺寸、尖幅和供墨边界" },
      { key: `${input.scope}-care`, scopeKey: `${input.scope}-care`, productionState: "current", editionScope: "Diplomat 服务指南中的清洁、运输、保修；专用 Nexus 机构按其官方说明处理" },
    ],
    claims: input.claims.map(([key, predicate, text, sourceItem, locator, factClass]) => claim(key, predicate, text, sourceItem.key, locator, input.scope, factClass ?? "core")),
    variants: input.variants,
    spec: {
      brandEntityId: PHASE329_DIPLOMAT_BRAND_ID,
      values: input.values,
      evidence: [
        evidence(`${input.key}-brand`, "brand_entity_id", input.primary.key, "Diplomat official model context", input.scope),
        ...input.specEvidence.map(([field, sourceItem, locator]) => evidence(`${input.key}-${field}`, field, sourceItem.key, locator, input.scope)),
      ],
    },
    media: [{
      key: `phase329-${input.key}-primary-media`,
      title: `${input.name} 事实卡（非产品照片）`,
      sourceKey: input.diagram.key,
      localPath: input.diagram.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
      sourceUrl: input.diagram.url,
      usageStatus: "primary",
    }],
  };
}

const nexus = model({
  key: "diplomat-nexus", id: PHASE329_NEXUS_ID, slug: PHASE329_NEXUS_SLUG, name: "Diplomat Nexus",
  markdownFile: ".planning/content-research/diplomat-nexus-phase329.md",
  storyTitle: "Diplomat Nexus：密封帽与高容量 piston/pipette 供墨路线",
  summary: "Diplomat Nexus 是独立的高容量上墨钢笔；官方给出密封帽、piston/pipette 机构、145/14 mm、55 g、EF/F/M/B 钢尖与 filling kit，Chrome、Demo、Gold 和 14K 是变体。",
  scope: "phase329-diplomat-nexus-current", primary: SOURCES.nexus, secondary: SOURCES.nexusReview,
  extra: [SOURCES.collections, SOURCES.fountainArchive, SOURCES.guide], diagram: SOURCES.nexusDiagram,
  aliases: [
    { alias: "Diplomat Nexus", language: "en", sourceKey: SOURCES.nexus.key },
    { alias: "Diplomat Nexus Demo", language: "en", sourceKey: SOURCES.nexus.key },
    { alias: "迪普洛玛 Nexus", language: "zh", sourceKey: SOURCES.collections.key },
    { alias: "迪普洛玛 奈克瑟斯", language: "zh", sourceKey: SOURCES.nexus.key },
  ],
  claims: [
    ["nexus-identity", "model_identity", "Nexus 是 Diplomat 独立的高容量钢笔路线，不是 CLR 或 Excellence 的大号活塞版本；Demo、Chrome、Gold 与 14K 尖是其商品变体。", SOURCES.collections, "Nexus collection identity"],
    ["nexus-fill", "filling_system", "官方把 Nexus 归入 piston technology；商品页同时说明 piston/pipette filling，并提供 filling kit。这里的 pipette 是该型号的操作组件，不应改写为普通吸墨器。", SOURCES.nexus, "piston/pipette filling and filling kit"],
    ["nexus-seal", "cap_mechanism", "Nexus 的专利 cap-closure sealing 用于减少墨水在携带中的挥发和泄漏风险；它是帽与握位的密封设计，不等于笔身永久防漏。", SOURCES.nexus, "patented cap-closure sealing"],
    ["nexus-capacity", "ink_capacity", "官方商品页用‘超过七支墨胆’描述容量级别；专业评测以样本实测约 3 ml 讨论，两者的测量口径不同，不能混成精确额定容量。", SOURCES.nexus, "more than seven cartridges and Sacrideo sample"],
    ["nexus-spec", "specification", "当前官方 Demo Chrome 样本为闭帽 145 mm、直径 14 mm、55 g；这是商品样本，不回填到其他饰件或 14K SKU。", SOURCES.nexus, "technical data"],
    ["nexus-nib", "nib_options", "官方商品界面列 EF、F、M、B 不锈钢尖；14K gold nib 另作为 Nexus 变体出现，不能把金尖默认到 Chrome/Demo。", SOURCES.nexus, "nib selector and 14K variant boundary"],
    ["nexus-material", "material_finish", "官方产品语境同时出现 aluminum、brass、stainless steel 材料选项；Demo 透明/半透明外观是 SKU 变体，不代表所有 Nexus 笔身同材。", SOURCES.nexus, "material fields and product variants"],
    ["nexus-care", "maintenance", "换墨与久置时按官方服务指南处理可拆部件；Nexus 专用 piston/pipette 机构遇到阻力或漏墨应停止强拧并联系授权服务，不用针具清理。", SOURCES.guide, "cleaning and service boundary"],
    ["nexus-secondary", "professional_cross_check", "Sacrideo 的专业评测以实物样本记录 Nexus 的大尺寸、重量和约 3 ml 级别个人测量；这些是样本体验，不替代官方尺寸或容量措辞。", SOURCES.nexusReview, "review measurements and experience"],
    ["nexus-boundary", "identity_boundaries", "Nexus 的密封帽、高容量专用机构与 CLR 的可换内环、Traveller 的纤细 C/C、Viper 的专用 converter 分开；相关配件不应跨型号合并。", SOURCES.collections, "current family boundaries"],
    ["nexus-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明透明度、比例、颜色、Logo、编号、库存或某件实物品相。", SOURCES.nexusDiagram, "site-original SVG metadata", "editorial"],
  ],
  variants: [
    { key: "phase329-nexus-finishes", name: "Chrome / Demo Chrome / Gold / Demo Gold", notes: "官方归档的外观和饰件 SKU；共享 Nexus 身份，不建立四个基础型号。", sourceKey: SOURCES.fountainArchive.key, variantKind: "market_sku", market: "EU/国际经销" },
    { key: "phase329-nexus-nibs", name: "EF / F / M / B stainless steel; 14K gold variant", notes: "钢尖幅度和 14K 金尖按具体商品核对；不把金尖默认给所有透明或镀铬版本。", sourceKey: SOURCES.nexus.key, variantKind: "nib", market: "EU/国际经销" },
    { key: "phase329-nexus-filling-kit", name: "Nexus filling kit", notes: "官方商品随附蓝色墨水瓶、两支 pipette、支撑/收纳件；附件不拆为独立笔实体。", sourceKey: SOURCES.nexus.key, variantKind: "edition_group" },
  ],
  values: { series_name: "Diplomat Nexus", release_year: "当前官方集合与商品页可见；官网未给出本页可核实的首发年份", origin_country: "德国 Diplomat 产品线；具体制造与地区 SKU 以商品资料核验", nib: "EF/F/M/B 不锈钢尖；另有 14K gold nib 变体", fill_system: "piston/pipette 高容量机构；patented cap-closure sealing；随 filling kit", material: "aluminum、brass、stainless steel 按 SKU；Chrome/Demo/Gold 饰件变体", dimensions: "闭帽 145 mm、直径 14 mm（官方 Demo Chrome 样本）", weight: "55 g（官方 Demo Chrome 样本）", price_range: "官方归档快照约 €260；价格、税费和库存按地区与日期核对", status: "官方当前集合、商品页和归档均可见；变体按 SKU" },
  specEvidence: [["series_name", SOURCES.collections, "Nexus heading"], ["release_year", SOURCES.fountainArchive, "current catalogue snapshot; no first-year claim"], ["origin_country", SOURCES.nexus, "Diplomat official context"], ["nib", SOURCES.nexus, "EF/F/M/B and 14K variant"], ["fill_system", SOURCES.nexus, "piston/pipette and filling kit"], ["material", SOURCES.nexus, "material options"], ["dimensions", SOURCES.nexus, "145/14 mm"], ["weight", SOURCES.nexus, "55 g"], ["price_range", SOURCES.nexus, "official product price snapshot"], ["status", SOURCES.collections, "current Nexus collection presence"]],
});

const clr = model({
  key: "diplomat-clr", id: PHASE329_CLR_ID, slug: PHASE329_CLR_SLUG, name: "Diplomat CLR",
  markdownFile: ".planning/content-research/diplomat-clr-phase329.md",
  storyTitle: "Diplomat CLR：用可换内环改变识别色的金属日用笔",
  summary: "Diplomat CLR 是黄铜金属笔身的日用钢笔；官方给出五个可换内环、135/155/12 mm、30 g、不锈钢尖与转换器，颜色和尖幅属于 SKU 变体。",
  scope: "phase329-diplomat-clr-current", primary: SOURCES.clr, secondary: SOURCES.clrReview,
  extra: [SOURCES.collections, SOURCES.fountainArchive, SOURCES.guide], diagram: SOURCES.clrDiagram,
  aliases: [
    { alias: "Diplomat CLR", language: "en", sourceKey: SOURCES.clr.key },
    { alias: "Diplomat CLR Chrome Lacquer", language: "en", sourceKey: SOURCES.clr.key },
    { alias: "迪普洛玛 CLR", language: "zh", sourceKey: SOURCES.collections.key },
    { alias: "迪普洛玛五色环", language: "zh", sourceKey: SOURCES.clr.key },
  ],
  claims: [
    ["clr-identity", "model_identity", "CLR 是 Diplomat 独立的可换内环金属钢笔路线，不是 Esteem 的换色版本，也不是 Excellence A+ 的低配名称。", SOURCES.clr, "official CLR product identity"],
    ["clr-ring", "design_feature", "官方把 CLR 的原创点写成可更换 inner ring；商品随五个色环，改变笔身中央 Diplomat 标识区域的识别色。色环是配件/变体，不建立五个实体。", SOURCES.clr, "changeable inner ring and five rings"],
    ["clr-material", "material_finish", "当前 CLR Chrome Lacquer 商品以黄铜笔身和漆面/镀铬视觉呈现；不同黑、蓝或其他表面是商品 SKU，不把单一颜色当成基础型号。", SOURCES.clr, "brass and finish fields"],
    ["clr-cap", "cap_mechanism", "CLR 官方商品尺寸区分闭帽 135 mm 与插帽 155 mm；页面未把它描述为 Viper/Cobra 的磁吸帽，使用时按普通帽体的开合阻力与密封状态检查。", SOURCES.clr, "closed/posted dimensions and cap boundary"],
    ["clr-spec", "specification", "官方当前样本为直径 12 mm、30 g；不能把这个重量或尺寸复制给更粗的 Excellence、Cobra 或更纤细的 Traveller。", SOURCES.clr, "technical data"],
    ["clr-nib", "nib_options", "官方商品界面提供不锈钢尖与地区化 F/M/B 选择；尖幅以具体商品页面为准，不用经销商对单一库存的称呼扩写系列范围。", SOURCES.clr, "nib selector"],
    ["clr-fill", "filling_system", "CLR 商品随转换器并兼容标准国际墨胆语境；首次装墨应确认转换器坐牢、墨胆长度和笔内环空间，不把五色环当作供墨组件。", SOURCES.clr, "converter and cartridge information"],
    ["clr-care", "maintenance", "按 Diplomat 服务指南用清水冲洗转换器和尖部，清洁后自然干燥；色环和漆面不要用酒精、研磨布或强力抛光剂。", SOURCES.guide, "cleaning and finish care"],
    ["clr-secondary", "professional_cross_check", "Pen Chalet 的专业经销资料交叉记录 CLR 的金属笔身、色环、钢尖和转换器；核心尺寸、保修与五色环数量以官方商品页为准。", SOURCES.clrReview, "retailer cross-check"],
    ["clr-boundary", "identity_boundaries", "CLR 的可换内环是识别特征，与 Esteem 的圆柱路线、Traveller 的纤细尺寸、Viper/Cobra 的磁吸帽和 Excellence 的螺纹帽分别记录。", SOURCES.collections, "current family boundaries"],
    ["clr-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明漆面反光、颜色、Logo、环片真实数量以外的库存或实物品相。", SOURCES.clrDiagram, "site-original SVG metadata", "editorial"],
  ],
  variants: [
    { key: "phase329-clr-rings", name: "Five interchangeable inner rings", notes: "官方随笔的五色内环；它们改变识别色，不拆成五个 CLR 型号。", sourceKey: SOURCES.clr.key, variantKind: "edition_group" },
    { key: "phase329-clr-finishes", name: "Chrome lacquer colour SKUs", notes: "黑、蓝等颜色/表面按商品记录；颜色变化不改变 CLR 身份。", sourceKey: SOURCES.fountainArchive.key, variantKind: "color", market: "EU/国际经销" },
    { key: "phase329-clr-nibs", name: "Stainless steel F / M / B", notes: "尖幅按地区商品界面核对；不从其他 Diplomat 系列推断。", sourceKey: SOURCES.clr.key, variantKind: "nib" },
  ],
  values: { series_name: "Diplomat CLR", release_year: "当前官方集合与商品页可见；官网未给出本页可核实的首发年份", origin_country: "德国 Diplomat 产品线；具体制造与地区 SKU 以商品资料核验", nib: "不锈钢尖；F/M/B 按商品页面和地区 SKU", fill_system: "转换器；兼容标准国际墨胆语境", material: "黄铜笔身，Chrome Lacquer/颜色表面与可更换内环", dimensions: "闭帽 135 mm、插帽 155 mm、直径 12 mm", weight: "30 g（官方商品样本）", price_range: "官方商品快照约 €125；价格、税费和库存按地区与日期核对", status: "官方当前 CLR 商品和集合可见；色环、颜色、尖幅按 SKU" },
  specEvidence: [["series_name", SOURCES.clr, "official CLR title"], ["release_year", SOURCES.collections, "current collection snapshot; no first-year claim"], ["origin_country", SOURCES.clr, "Diplomat official context"], ["nib", SOURCES.clr, "stainless nib selector"], ["fill_system", SOURCES.clr, "converter and cartridge"], ["material", SOURCES.clr, "brass and lacquer fields"], ["dimensions", SOURCES.clr, "135/155/12 mm"], ["weight", SOURCES.clr, "30 g"], ["price_range", SOURCES.clr, "official product price snapshot"], ["status", SOURCES.collections, "CLR collection presence"]],
});

const esteem = model({
  key: "diplomat-esteem", id: PHASE329_ESTEEM_ID, slug: PHASE329_ESTEEM_SLUG, name: "Diplomat Esteem",
  markdownFile: ".planning/content-research/diplomat-esteem-phase329.md",
  storyTitle: "Diplomat Esteem：圆柱黄铜笔身与稳妥钢尖的日用路线",
  summary: "Diplomat Esteem 是圆柱金属日用钢笔；官方 Lapis 样本为黄铜、135/155/12 mm、28 g、F/M/B 不锈钢尖，随一支墨胆，Lapis 与 Barley 是表面变体。",
  scope: "phase329-diplomat-esteem-current", primary: SOURCES.esteem, secondary: SOURCES.esteemReview,
  extra: [SOURCES.collections, SOURCES.fountainArchive, SOURCES.guide], diagram: SOURCES.esteemDiagram,
  aliases: [
    { alias: "Diplomat Esteem", language: "en", sourceKey: SOURCES.esteem.key },
    { alias: "Diplomat Esteem Lapis", language: "en", sourceKey: SOURCES.esteem.key },
    { alias: "迪普洛玛 Esteem", language: "zh", sourceKey: SOURCES.collections.key },
    { alias: "迪普洛玛尊享", language: "zh", sourceKey: SOURCES.esteem.key },
  ],
  claims: [
    ["esteem-identity", "model_identity", "Esteem 是 Diplomat 独立的圆柱金属钢笔路线，不是 CLR 的换色环版本，也不是 Excellence A+/A2 的帽机制变体。", SOURCES.collections, "Esteem collection identity"],
    ["esteem-shape", "construction", "官方集合用 cylindrical 描述 Esteem；Lapis、lacquered、matt chrome 和 Barley 是同一产品线的表面/纹理商品，不建立多个基础实体。", SOURCES.collections, "cylindrical family and finish variants"],
    ["esteem-spec", "specification", "官方 Esteem Lapis 样本为闭帽 135 mm、插帽 155 mm、直径 12 mm、28 g；不可回填到 CLR 的 30 g 或 Traveller 的 19 g。", SOURCES.esteem, "technical data"],
    ["esteem-nib", "nib_options", "官方页面列不锈钢尖和 F/M/B 选择；The Gentleman Stationer 的评测以样笔讨论钢尖与日用书写，不把体验升级成统一出厂调校承诺。", SOURCES.esteem, "nib selector and review boundary"],
    ["esteem-fill", "filling_system", "官方 Lapis 商品随一支墨胆；专业评测也把 Esteem 放在 cartridge/converter 语境。墨胆或转换器的实际长度与坐牢状态仍需按笔内空间检查。", SOURCES.esteem, "included cartridge and filling"],
    ["esteem-section", "grip_boundary", "专业评测指出样本为金属主体配塑料握位；这是该评测样本的结构观察，不将它写成所有颜色和生产批次的永久材质保证。", SOURCES.esteemReview, "sample section construction"],
    ["esteem-cap", "cap_mechanism", "Esteem 与 A+ 的三分之一圈金属螺纹帽、A2 的 Soft Sliding Click、Viper/Cobra 的磁吸帽属于不同结构；本页只保留官方尺寸和系列边界，不杜撰开合圈数。", SOURCES.collections, "adjacent cap mechanisms"],
    ["esteem-care", "maintenance", "换色或久置时按官方服务指南以清水冲洗转换器和尖部，擦干后自然干燥；漆面、镀层和塑料握位不要用溶剂或硬刷。", SOURCES.guide, "cleaning and finish care"],
    ["esteem-secondary", "professional_cross_check", "The Gentleman Stationer 的专业评测以样本交叉记录钢尖、塑料握位和转换器/墨胆体验；尺寸、价格与保修仍以 Diplomat 当前页面为准。", SOURCES.esteemReview, "professional review scope"],
    ["esteem-boundary", "identity_boundaries", "Esteem 的 28 g、圆柱笔身和 F/M/B 钢尖边界与 CLR、Traveller、Magnum 和 Excellence 产品线分开；颜色和 Barley 纹理不应制造重复型号。", SOURCES.collections, "current family boundaries"],
    ["esteem-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明真实比例、颜色、刻字、漆面、Logo、库存或具体实物品相。", SOURCES.esteemDiagram, "site-original SVG metadata", "editorial"],
  ],
  variants: [
    { key: "phase329-esteem-lapis", name: "Lapis lacquer", notes: "官方当前商品样本；规格 135/155/12 mm、28 g 只属于该样本。", sourceKey: SOURCES.esteem.key, variantKind: "market_sku", productCode: "Esteem Lapis" },
    { key: "phase329-esteem-finishes", name: "Lacquered / matt chrome / Barley", notes: "官方归档中的表面和 Barley 纹理变体；共享 Esteem 基础身份。", sourceKey: SOURCES.fountainArchive.key, variantKind: "color", market: "EU/国际经销" },
    { key: "phase329-esteem-nibs", name: "F / M / B stainless steel", notes: "官方尖幅选项；具体地区库存按商品页面核对。", sourceKey: SOURCES.esteem.key, variantKind: "nib" },
  ],
  values: { series_name: "Diplomat Esteem", release_year: "当前官方集合与商品页可见；官网未给出本页可核实的首发年份", origin_country: "德国 Diplomat 产品线；具体制造与地区 SKU 以商品资料核验", nib: "不锈钢 F/M/B", fill_system: "标准国际墨胆/转换器语境；Lapis 商品随一支墨胆", material: "黄铜圆柱主体；漆面、哑铬和 Barley 表面按 SKU；评测样本为塑料握位", dimensions: "闭帽 135 mm、插帽 155 mm、直径 12 mm", weight: "28 g（官方 Esteem Lapis 样本）", price_range: "官方商品快照约 €88；价格、税费和库存按地区与日期核对", status: "官方当前 Esteem 商品和集合可见；表面、尖幅、附件按 SKU" },
  specEvidence: [["series_name", SOURCES.esteem, "official Esteem title"], ["release_year", SOURCES.collections, "current collection snapshot; no first-year claim"], ["origin_country", SOURCES.esteem, "Diplomat official context"], ["nib", SOURCES.esteem, "F/M/B stainless steel"], ["fill_system", SOURCES.esteem, "included cartridge and filling context"], ["material", SOURCES.esteem, "brass body and finish fields"], ["dimensions", SOURCES.esteem, "135/155/12 mm"], ["weight", SOURCES.esteem, "28 g"], ["price_range", SOURCES.esteem, "official product price snapshot"], ["status", SOURCES.collections, "Esteem collection presence"]],
});

const traveller = model({
  key: "diplomat-traveller", id: PHASE329_TRAVELLER_ID, slug: PHASE329_TRAVELLER_SLUG, name: "Diplomat Traveller",
  markdownFile: ".planning/content-research/diplomat-traveller-phase329.md",
  storyTitle: "Diplomat Traveller：纤细金属笔身的旅行取向",
  summary: "Diplomat Traveller 是官方集合中更纤细的金属钢笔路线；Chrome Steel 样本为 134/155/10 mm、19 g、F/M 不锈钢尖，随一支墨胆，Flame、Funky 等是颜色变体。",
  scope: "phase329-diplomat-traveller-current", primary: SOURCES.traveller, secondary: SOURCES.travellerReview,
  extra: [SOURCES.collections, SOURCES.travellerArchive, SOURCES.guide], diagram: SOURCES.travellerDiagram,
  aliases: [
    { alias: "Diplomat Traveller", language: "en", sourceKey: SOURCES.traveller.key },
    { alias: "Diplomat Traveler", language: "en", sourceKey: SOURCES.travellerReview.key },
    { alias: "Diplomat Traveller Chrome Steel", language: "en", sourceKey: SOURCES.traveller.key },
    { alias: "迪普洛玛 Traveller", language: "zh", sourceKey: SOURCES.collections.key },
  ],
  claims: [
    ["traveller-identity", "model_identity", "Traveller 是 Diplomat 独立的纤细金属钢笔路线；官方集合将它描述为最纤细的型号之一，不与 Magnum 或 Esteem 合并。", SOURCES.collections, "Traveller collection identity"],
    ["traveller-material", "material_finish", "Chrome Steel 商品样本使用不锈钢笔身和不锈钢尖；Steel Gold、Flame、Funky、Lapis 与 lacquered chrome/gold 是表面 SKU。", SOURCES.traveller, "stainless body and finish variants"],
    ["traveller-spec", "specification", "官方当前样本为闭帽 134 mm、插帽 155 mm、直径 10 mm、19 g；这个轻量与纤细尺寸是 Traveller 和 CLR/Esteem 的重要边界。", SOURCES.traveller, "technical data"],
    ["traveller-nib", "nib_options", "官方商品界面提供 F、M 不锈钢尖；不把其他 Diplomat 型号的 EF/B 或金尖默认到 Traveller。", SOURCES.traveller, "nib selector"],
    ["traveller-fill", "filling_system", "官方 Chrome Steel 商品随一支墨胆；Ian Hedley 的专业评测把样本放在国际墨胆/转换器语境，具体转换器与墨胆长度仍需实物核对。", SOURCES.traveller, "included cartridge and review filling context"],
    ["traveller-posting", "ergonomics", "官方闭帽/插帽长度相同为 134/155 mm；专业评测提醒细长笔身与插帽后的长度会改变平衡，是否插帽按手感与夹持稳定性决定。", SOURCES.travellerReview, "posted length and handling sample"],
    ["traveller-care", "maintenance", "按官方服务指南用清水清洁转换器和尖部，清洁后自然干燥；漆面或镀金版本避免溶剂和研磨材料，旅行时笔尖朝上。", SOURCES.guide, "cleaning, travel and warranty guidance"],
    ["traveller-secondary", "professional_cross_check", "Ian Hedley 的专业评测以 Traveller 样本记录细长金属笔、国际墨胆/转换器和插帽体验；体验观察不替代官方当前 SKU 规格。", SOURCES.travellerReview, "professional review scope"],
    ["traveller-boundary", "identity_boundaries", "Traveller 的 10 mm、19 g、F/M 钢尖和纤细外形与 Esteem 的 12 mm/28 g、CLR 的 30 g、Magnum 的轻量塑料路线分别记录。", SOURCES.collections, "current family boundaries"],
    ["traveller-media", "media_identity_boundary", "主图是本站原创事实 SVG，非产品照片，不证明真实比例、颜色、Logo、镀层、库存或具体实物品相。", SOURCES.travellerDiagram, "site-original SVG metadata", "editorial"],
  ],
  variants: [
    { key: "phase329-traveller-steel", name: "Chrome Steel / Steel Gold", notes: "官方基础外观与饰件变体；共享 Traveller 身份。", sourceKey: SOURCES.traveller.key, variantKind: "market_sku" },
    { key: "phase329-traveller-colours", name: "Flame / Funky / Lapis / lacquered chrome-gold", notes: "官方归档列出的颜色和表面；颜色不拆成多个基础型号。", sourceKey: SOURCES.travellerArchive.key, variantKind: "color", market: "EU/国际经销" },
    { key: "phase329-traveller-nibs", name: "F / M stainless steel", notes: "官方尖幅范围；不把其他系列的 EF/B/金尖带入。", sourceKey: SOURCES.traveller.key, variantKind: "nib" },
  ],
  values: { series_name: "Diplomat Traveller", release_year: "当前官方集合与商品页可见；官网未给出本页可核实的首发年份", origin_country: "德国 Diplomat 产品线；具体制造与地区 SKU 以商品资料核验", nib: "不锈钢 F/M", fill_system: "标准国际墨胆/转换器语境；Chrome Steel 商品随一支墨胆", material: "不锈钢笔身；Steel Gold、Flame、Funky、Lapis 与漆面镀层按 SKU", dimensions: "闭帽 134 mm、插帽 155 mm、直径 10 mm", weight: "19 g（官方 Chrome Steel 样本）", price_range: "官方商品快照约 €48；价格、税费和库存按地区与日期核对", status: "官方当前 Traveller 商品、集合和归档可见；颜色与尖幅按 SKU" },
  specEvidence: [["series_name", SOURCES.traveller, "official Traveller title"], ["release_year", SOURCES.collections, "current collection snapshot; no first-year claim"], ["origin_country", SOURCES.traveller, "Diplomat official context"], ["nib", SOURCES.traveller, "F/M stainless steel"], ["fill_system", SOURCES.traveller, "included cartridge"], ["material", SOURCES.traveller, "stainless steel body"], ["dimensions", SOURCES.traveller, "134/155/10 mm"], ["weight", SOURCES.traveller, "19 g"], ["price_range", SOURCES.traveller, "official product price snapshot"], ["status", SOURCES.collections, "Traveller collection presence"]],
});

export const phase329DiplomatCurrentPacks: CuratedEntityPack[] = [inheritedBrand, nexus, clr, esteem, traveller];
