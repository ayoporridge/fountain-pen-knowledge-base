import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase77HongdianN7RabbitPacks } from "./phase77-hongdian-n7-rabbit";

export const PHASE383_HONGDIAN_BRAND_ID = "4yRpvovXFoWh";
export const PHASE383_N23_ID = "phase383-hongdian-n23";
export const PHASE383_N23_SLUG = "hongdian-n23";
export const PHASE383_N23_NAME = "HongDian N23（2023 Year of the Rabbit）";

const RETRIEVED = "2026-08-03";
const TTPEN = "https://www.ttpen.com/products/hongdian-n23-rabbit-year-fountain-pen";
const MAKobaBlack = "https://makoba.com/collections/fountain-pens/products/hongdian-n23-fountain-pen-black-gt";
const MAKobaRed = "https://makoba.com/collections/hongdian-fountain-pens/products/hongdian-n23-fountain-pen-red-gt";
const FPC = "https://www.fountainpencompanion.com/pen_brands/79-hongdian/pen_models/669-n23-2023-year-of-the-rabbit/pen_variants/5147-hongdian-lt-n23-year-of-the-rabbit-2023-white-metal-silver-cartridge-converter";
const PENEXCHANGE = "https://www.penexchange.de/forum_neu/viewtopic.php?t=37029";
const RUPERT = "https://rupertarzeian.com/tag/hongdian-n23/";
const SVG = "/images/library/site-original/phase383/hongdian/n23.svg";

function source(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  independenceGroup?: string;
  summary: string;
  locator: string;
  publishedAt?: string;
}): CuratedSource {
  return {
    ...input,
    independenceGroup: input.independenceGroup ?? input.registryKey,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function siteOriginal(): CuratedSource {
  return {
    key: "phase383-hongdian-n23-svg",
    registryKey: "fountain-pen-graph-editorial-phase383",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase383",
    title: "HongDian N23 2023 Year of the Rabbit factual identity card",
    url: SVG,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；四种颜色、两条市场笔尖路线与 C/C 边界示意，非产品照片。",
    archiveUrl: SVG,
    archiveLocator: "project-public-asset:/images/library/site-original/phase383/hongdian/n23.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900",
  };
}

const S = {
  ttpen: source({
    key: "phase383-hongdian-n23-ttpen",
    title: "Hongdian N23 Rabbit Year Fountain Pen — TTPEN",
    url: TTPEN,
    registryKey: "ttpen-hongdian-phase383",
    registryName: "TTPEN",
    sourceType: "retailer",
    tier: "contemporary_archive",
    publishedAt: "2023",
    summary: "TTPEN 商品页确认 N23 Rabbit Year 型号、Black/Blue/Red/White 四色、EF 与 Long Knife Medium 两种选项、金属结构、钢琴漆、兔子雕饰、旋帽、随笔转换器与市场 SKU；页面不提供统一尺寸重量表。",
    locator: "product title, SKU N23-R-BKEF, color inputs, nib inputs and description",
  }),
  makobaBlack: source({
    key: "phase383-hongdian-n23-makoba-black",
    title: "Hongdian N23 Fountain Pen — Black GT — Makoba",
    url: MAKobaBlack,
    registryKey: "makoba-hongdian-phase383",
    registryName: "Makoba",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "Makoba 黑色 SKU 页面把 N23 列为 China origin、steel Medium、gold plated trim、metal body、screw-cap、cartridge/converter included，并显示 SKU 67149；这是一个市场快照，不覆盖其他尖幅。",
    locator: "technical specification, SKU 67149, black GT product fields",
  }),
  makobaRed: source({
    key: "phase383-hongdian-n23-makoba-red",
    title: "Hongdian N23 Fountain Pen — Red GT — Makoba",
    url: MAKobaRed,
    registryKey: "makoba-hongdian-phase383",
    registryName: "Makoba",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "Makoba 红色 SKU 页面同样列 steel Medium、gold plated trim、metal body、screw-cap 与 cartridge/converter included；其价格和库存会变化。",
    locator: "technical specification, SKU 67152, red GT product fields",
  }),
  fpc: source({
    key: "phase383-hongdian-n23-fpc",
    title: "Hongdian N23 2023 Year of the Rabbit — Fountain Pen Companion",
    url: FPC,
    registryKey: "fountain-pen-companion-hongdian-phase383",
    registryName: "Fountain Pen Companion",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "Fountain Pen Companion 将 N23 2023 Year of the Rabbit 单列为 Hongdian 型号，并汇集白色、金属／漆面、银色饰件、墨囊／转换器等用户维护的变体记录；它是结构化社区数据库，不是厂商规格表。",
    locator: "brand/model breadcrumb, model variants table and white metal silver cartridge/converter entry",
  }),
  penexchange: source({
    key: "phase383-hongdian-n23-penexchange",
    title: "Kurzvorstellung: Hong Dian N23, Year of the Rabbit — Penexchange",
    url: PENEXCHANGE,
    registryKey: "penexchange-hongdian-phase383",
    registryName: "Penexchange",
    sourceType: "forum",
    tier: "community",
    publishedAt: "2023-04-15",
    summary: "2023 年独立实物帖记录白色 EF 版本、蓝／红颜色、brass and resin、旋帽、约 141 mm、15 mm、36 g、随笔转换器与 Hong Dian 墨囊；单支写感和包装不能外推整批。",
    locator: "opening post lines: model, colors, material, cap, dimensions, weight, converter/cartridge and individual EF experience",
  }),
  rupert: source({
    key: "phase383-hongdian-n23-rupert",
    title: "Early thoughts on the Hongdian N23 Year of the Rabbit — Rupert Arzeian",
    url: RUPERT,
    registryKey: "rupert-arzeian-hongdian-phase383",
    registryName: "Rupert Arzeian",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2023-12-02",
    summary: "独立评测记录四种颜色、颜色与饰件搭配、金属钢琴漆、兔子雕饰、旋帽、Long Knife 体验、墨囊／转换器、约 141/122 mm 与约 35 g；书写、套帽和平衡均是单支样本观察。",
    locator: "colour list, construction, nib, filling, writing experience and weights/measures sections",
  }),
  svg: siteOriginal(),
} as const;

function claim(
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.97 : 0.93,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }],
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

const N23_SCOPE = "phase383-hongdian-n23-current-market";
const existing = phase77HongdianN7RabbitPacks(
  PHASE383_HONGDIAN_BRAND_ID,
  "phase77-pen-hongdian-n7-rabbit",
);
const baseBrand = existing.find((pack) => pack.expectedType === "brand");
if (!baseBrand) throw new Error("Phase 383 HongDian brand prerequisite is missing.");
const hongdianBrand = structuredClone(baseBrand);
hongdianBrand.key = "phase383-hongdian-brand-navigation-v1";
hongdianBrand.sources = [...hongdianBrand.sources, S.ttpen, S.fpc, S.rupert].filter(
  (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
);
hongdianBrand.scopes = [
  ...hongdianBrand.scopes,
  {
    key: "phase383-hongdian-n23-navigation",
    scopeKey: "phase383-hongdian-n23-navigation",
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope: "HongDian 品牌页新增 N23 2023 Year of the Rabbit 独立入口；颜色和笔尖是型号变体，不与 N7 Rabbit 合并。",
  },
];
hongdianBrand.claims = [
  ...hongdianBrand.claims,
  claim(
    "phase383-hongdian-n23-navigation",
    "phase383-hongdian-n23-navigation-claim",
    "series_navigation",
    "HongDian 品牌页新增 N23 2023 Year of the Rabbit 独立型号入口。N23 的金属漆面、旋帽和墨囊／转换器路线不继承 N7 Rabbit 的内置活塞规格；Black、Blue、Red、White 与 EF、Long Knife M 是 N23 内部变体。",
    S.ttpen.key,
    "N23 product title, colours, nib options and filling description",
  ),
];

const pack: CuratedEntityPack = {
  key: `${PHASE383_N23_ID}-v1`,
  entityId: PHASE383_N23_ID,
  expectedType: "pen",
  expectedSlug: PHASE383_N23_SLUG,
  canonicalName: PHASE383_N23_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/hongdian-n23-phase383.md",
  storyTitle: "HongDian N23：先核对兔年主题，再核对供墨与笔尖",
  primarySourceKey: S.ttpen.key,
  depthTier: "A",
  aliases: [
    { alias: "Hongdian N23", language: "en", sourceKey: S.ttpen.key },
    { alias: "HongDian N23 Year of the Rabbit", language: "en", sourceKey: S.ttpen.key },
    { alias: "Hong Dian N23 2023 Year of the Rabbit", language: "en", sourceKey: S.penexchange.key },
    { alias: "弘典 N23 兔年款", language: "zh", sourceKey: S.ttpen.key },
    { alias: "HongDian N23 兔年", language: "zh", sourceKey: S.rupert.key },
  ],
  sources: Object.values(S),
  scopes: [
    {
      key: N23_SCOPE,
      scopeKey: N23_SCOPE,
      validFrom: RETRIEVED,
      productionState: "current",
      market: "公开零售与独立实物资料",
      nibScope: "TTPEN exposes EF and Long Knife M; Makoba black/red pages expose Medium steel; exact nib follows SKU",
      materialScope: "Metal lacquered body in retailer descriptions; Penexchange single sample says brass and resin",
      editionScope: "2023 Year of the Rabbit theme; no independently verified official launch notice or fixed production quantity",
    },
  ],
  claims: [
    claim(N23_SCOPE, "phase383-n23-identity", "model_identity", "HongDian N23（2023 Year of the Rabbit）是独立的兔年主题钢笔型号；N7 Rabbit、N12、N24 与 A24 不是它的别名。", S.ttpen.key, "product title, vendor and N23 SKU"),
    claim(N23_SCOPE, "phase383-n23-index", "independent_model_index", "Fountain Pen Companion 将 N23 2023 Year of the Rabbit 单列为 HongDian 型号，并把颜色、材料和墨囊／转换器记录归在该型号下；这是独立索引交叉核对，不是制造商规格表。", S.fpc.key, "brand/model breadcrumb and model variants table"),
    claim(N23_SCOPE, "phase383-n23-colours", "color_variants", "公开页面反复出现 Black、Blue、Red、White 四种颜色；颜色是 N23 的变体，不能只凭颜色另建型号。", S.rupert.key, "four-colour list and colour/trim observations"),
    claim(N23_SCOPE, "phase383-n23-theme", "design_context", "兔子雕饰出现在笔帽、笔杆和笔尖语境中，表达 2023 兔年和祝福主题；它不是 N7 Rabbit 的供墨结构证明。", S.ttpen.key, "lucky rabbit carving description"),
    claim(N23_SCOPE, "phase383-n23-nib", "nib_variants", "TTPEN 当前选项为 EF 与 Long Knife Medium；Makoba 的黑／红市场页列 Medium steel。Long Knife／Blade 是渠道对特殊打磨的叫法，不应翻成 Sailor 长刀研或金尖。", S.ttpen.key, "nib options and description; cross-channel boundary"),
    claim(N23_SCOPE, "phase383-n23-fill", "filling_system", "N23 走墨囊／转换器（cartridge／converter）路线，随笔转换器是多份页面共同描述；不把它写成活塞或真空上墨。", S.makobaBlack.key, "cartridge/converter included and screw-cap product fields"),
    claim(N23_SCOPE, "phase383-n23-material", "material_boundary", "零售页描述金属笔身和钢琴漆面；Penexchange 的单支帖写 brass and resin，因此规格只写公开描述的金属漆面并保留部件结构差异，不拼出未经证实的统一工程图。", S.rupert.key, "metal construction, piano lacquer and brass/resin cross-source boundary"),
    claim(N23_SCOPE, "phase383-n23-dimensions", "physical_specification", "独立实物与评测资料给出约 141 mm 合盖、约 122 mm 未合盖、约 15 mm 直径；不同测量协议下只作样本范围。", S.rupert.key, "weights and measures section"),
    claim(N23_SCOPE, "phase383-n23-weight", "physical_specification", "公开单支资料约 35–36 g；转换器、墨水和装饰批次会影响称重，不写成官方统一 36 g。", S.penexchange.key, "36 g single-pen listing and independent sample"),
    claim(N23_SCOPE, "phase383-n23-market", "market_status", "TTPEN 检索时显示 USD 45，Makoba 黑／红页面显示印度市场促销价；价格、库存和包装是可变市场快照，不作为永久 MSRP。", S.ttpen.key, "displayed SKU price and market availability" , "editorial"),
    claim(N23_SCOPE, "phase383-n23-care", "maintenance_guidance", "用室温清水清洗转换器和笔尖，漆面避开酒精、强溶剂、漂白剂、研磨材料和长时间浸泡；不要把单支打磨或拆解经验当成默认保养。", S.rupert.key, "construction, filling and single-pen handling observations", "editorial"),
    claim(N23_SCOPE, "phase383-n23-selection", "selection_guidance", "购买先核对 N23 主型号、颜色和 EF／Long Knife M 尖，再确认转换器、墨囊、饰件和退换条件；Makoba 的 Medium 选项不能覆盖所有渠道。", S.ttpen.key, "product options and SKU boundary", "editorial"),
    claim(N23_SCOPE, "phase383-n23-media", "media_identity_boundary", "本站主图是原创 factual SVG，仅表达四种颜色、两条市场笔尖路线和 C/C 边界；不是产品照片、Logo、真实比例或色彩校样。", S.svg.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: `${N23_SCOPE}-black`, name: "Black", notes: "公开页面列为 N23 黑色变体；Makoba 黑色页面显示 gold plated trim 和 Medium steel，饰件与尖幅按 SKU 核对。", sourceKey: S.makobaBlack.key, variantKind: "color", market: "公开零售" },
    { key: `${N23_SCOPE}-blue`, name: "Blue", notes: "TTPEN 和独立评测列为 N23 颜色选项；漆面反光与饰件颜色以实物为准。", sourceKey: S.ttpen.key, variantKind: "color", market: "公开零售" },
    { key: `${N23_SCOPE}-red`, name: "Red", notes: "公开页面列为 N23 红色变体；Makoba 红色页面为一个 Medium steel／gold plated trim 市场快照。", sourceKey: S.makobaRed.key, variantKind: "color", market: "公开零售" },
    { key: `${N23_SCOPE}-white`, name: "White", notes: "Penexchange 的独立实物帖为白色 EF，FPC 记录白色金属／银色饰件 C/C 变体；不要把单支外观当作全部白色批次。", sourceKey: S.penexchange.key, variantKind: "color", market: "公开零售" },
    { key: `${N23_SCOPE}-ef`, name: "Extra Fine（EF）", notes: "TTPEN 当前选项；单支写感和约 0.4 mm 销售措辞按页面范围理解，不是全批线宽保证。", sourceKey: S.ttpen.key, variantKind: "nib", market: "公开零售", productCode: "N23-R-BKEF" },
    { key: `${N23_SCOPE}-long-knife-m`, name: "Long Knife Medium（Blade M）", notes: "TTPEN 当前选项；特殊打磨的线条和角度感受依纸张、握角和单支调校变化，不等同于 Sailor 长刀研。", sourceKey: S.rupert.key, variantKind: "nib", market: "公开零售" },
  ],
  spec: {
    brandEntityId: PHASE383_HONGDIAN_BRAND_ID,
    values: {
      series_name: "HongDian N23（2023 Year of the Rabbit）",
      release_year: "2023 兔年主题版；未找到可独立核验的官方首发公告",
      origin_country: "公开零售页标为中国；不外推具体工厂或法人沿革",
      nib: "EF 与 Long Knife M 是 TTPEN 当前选项；Makoba 黑／红 SKU 标 steel Medium；单支按 SKU 核对",
      fill_system: "墨囊／转换器两用；随笔转换器，墨囊是否随盒因渠道而异",
      material: "金属笔身与钢琴漆／漆面；单支资料另写 brass and resin，内层结构不统一",
      dimensions: "约 141 mm 合盖、约 122 mm 未合盖、约 15 mm 直径（独立实物／评测范围）",
      weight: "约 35–36 g（单支样本范围）",
      price_range: "TTPEN 显示 USD 45；Makoba 黑／红页面为印度市场促销价，均为可变快照",
      status: "2023 兔年主题版；部分渠道仍有库存，价格和包装随市场变化",
    },
    evidence: [
      evidence("phase383-n23-brand", "brand_entity_id", S.ttpen.key, N23_SCOPE, "HongDian vendor and N23 product identity"),
      evidence("phase383-n23-series", "series_name", S.ttpen.key, N23_SCOPE, "product title and SKU"),
      evidence("phase383-n23-release", "release_year", S.penexchange.key, N23_SCOPE, "2023 dated independent post and rabbit-year model name; no official launch claim"),
      evidence("phase383-n23-origin", "origin_country", S.makobaBlack.key, N23_SCOPE, "retailer product origin field"),
      evidence("phase383-n23-nib", "nib", S.ttpen.key, N23_SCOPE, "EF and Long Knife Medium options; Makoba cross-channel Medium boundary"),
      evidence("phase383-n23-fill", "fill_system", S.makobaBlack.key, N23_SCOPE, "cartridge/converter included field"),
      evidence("phase383-n23-material", "material", S.rupert.key, N23_SCOPE, "metal construction and piano lacquer; brass/resin single-sample boundary"),
      evidence("phase383-n23-dimensions", "dimensions", S.rupert.key, N23_SCOPE, "141/122 mm measures and diameter cross-check"),
      evidence("phase383-n23-weight", "weight", S.penexchange.key, N23_SCOPE, "36 g single-pen data"),
      evidence("phase383-n23-price", "price_range", S.ttpen.key, N23_SCOPE, "displayed USD 45 market snapshot"),
      evidence("phase383-n23-status", "status", S.ttpen.key, N23_SCOPE, "current product availability at retrieval"),
    ],
  },
  timeline: [
    { key: "phase383-n23-rabbit-year", title: "N23 2023 Year of the Rabbit enters public product records", eventType: "model_released", startDate: "2023", circa: true, description: "2023 dated independent post and current retail pages identify the N23 rabbit-year model; no separate official launch announcement was located.", sourceKey: S.penexchange.key },
  ],
  media: [
    { key: `${N23_SCOPE}-primary-media`, title: "HongDian N23 兔年事实卡（非产品照片）", sourceKey: S.svg.key, localPath: SVG, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof；不代表真实比例、颜色、Logo、库存或某一批次。", sourceUrl: SVG, usageStatus: "primary" },
  ],
};

export const phase383HongdianN23Packs: CuratedEntityPack[] = [hongdianBrand, pack];
