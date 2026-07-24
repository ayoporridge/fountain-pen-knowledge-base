import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase77HongdianN7RabbitPacks } from "./phase77-hongdian-n7-rabbit";

export const PHASE163_HONGDIAN_BRAND_ID = "4yRpvovXFoWh";
export const PHASE163_IDS = {
  model1866: "1cA0oEMF7d1u",
  n6: "w0IUT4Uk9LOb",
  model620: "WUzZY3Y3y7-1",
} as const;
const RETRIEVED = "2026-07-24";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
}): CuratedSource {
  return {
    ...input,
    independenceGroup: input.registryKey,
    homepageUrl: new URL(input.url).origin,
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase163",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase163",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片，不作为真实比例、颜色、库存或具体批次证明。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const S = {
  wood: web({
    key: "phase163-hongdian-1866-desertcart",
    title: "Desertcart HongDian 1866 Fountain Pen",
    url: "https://www.desertcart.in/products/590824543-1866-fountain-pen-iridium-fine-soft-nib-chinese-knot-carving",
    registryKey: "desertcart-hongdian-1866-phase163",
    registryName: "Desertcart",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary: "商品页将 1866 列为 bubinga wood barrel、metal frame、约 0.5 mm iridium fine-soft nib，附 converter 与金属盒，并显示 1866 Max made in China 帽顶刻字；重量和完整长度未在该页固定。",
    locator: "title; Bubinga wood barrel; 0.5 mm iridium fine-soft nib; converter; metal box; 1866 Max cap engraving",
  }),
  woodBoundary: web({
    key: "phase163-hongdian-1866s-ttpen",
    title: "TTPEN HongDian 1866S Natural Wood Fountain Pen",
    url: "https://www.ttpen.com/products/hongdian-1866s-natural-wood-fountain-pen-flexible-soft-nib-converter-included",
    registryKey: "ttpen-hongdian-1866s-phase163",
    registryName: "TTPEN",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "1866S 商品页使用 sappanwood、HD1866S-1 和 new-generation soft flexible nib；仅用于确认 1866S 与旧款 1866 的版本边界，不把其尖感和木种外推。",
    locator: "1866S title, SKU HD1866S-1, sappanwood, flexible soft nib, converter",
  }),
  woodSample: web({
    key: "phase163-hongdian-1866-reddit",
    title: "Reddit r/fountainpens HongDian 1866 sample",
    url: "https://www.reddit.com/r/fountainpens/comments/1iumfdm",
    registryKey: "reddit-hongdian-1866-phase163",
    registryName: "Reddit r/fountainpens",
    sourceType: "reddit",
    tier: "community",
    summary: "用户样本记录 1866 木桶、旋帽、converter、帽重与 soft nib 触感；仅作个体体验和型号刻字的交叉线索，不升级为全批次品控结论。",
    locator: "1866 Max sample; wood barrel; converter; cap balance; soft nib experience",
  }),
  n6Makoba: web({
    key: "phase163-hongdian-n6-makoba",
    title: "Makoba Hongdian N6 Fountain Pen - Black",
    url: "https://makoba.com/collections/hongdian/products/hongdian-n6-fountain-pen-black",
    registryKey: "makoba-hongdian-n6-phase163",
    registryName: "Makoba",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary: "零售技术栏将黑色 N6 列为钢制 Fine 尖、金属与树脂、旋帽、活塞、可插帽，并记录中国原产地与品牌包装；页面库存状态是渠道快照。",
    locator: "N6 Black title; steel Fine nib; metal & resin; screw-cap; piston filler; postable; China origin",
  }),
  n6Online: web({
    key: "phase163-hongdian-n6-onlinemantra",
    title: "Online Mantra Hongdian N6 Black Fountain Pen",
    url: "https://www.onlinemantra.in/products/hongdian-n6-black-fountain-pen",
    registryKey: "online-mantra-hongdian-n6-phase163",
    registryName: "Online Mantra",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "同型号商品页补充 resin barrel、金属雕刻帽、black PVD stainless steel Fine 尖、透明墨仓与活塞式；品牌沿革段落不作为本页历史依据。",
    locator: "N6 Black technical specification; resin barrel; engraved metal cap; black PVD steel Fine nib; piston; transparent ink tank",
  }),
  n6Brand: web({
    key: "phase163-hongdian-brand-site",
    title: "Hongdian Pens product and care site",
    url: "https://hongdianpens.com/",
    registryKey: "hongdianpens-site-phase163",
    registryName: "Hongdian Pens product site",
    sourceType: "official",
    tier: "contemporary_archive",
    summary: "品牌型商品站展示 N 系列与常温水清洁建议；站点身份和创立年份未在本批次升级为法人或制造史断言。",
    locator: "N-series overview; room-temperature-water cleaning FAQ",
  }),
  cocktail: web({
    key: "phase163-hongdian-620-ttpen",
    title: "TTPEN Hongdian 620 Long Island Iced Tea Fountain Pen",
    url: "https://www.ttpen.com/products/hongdian-620-long-island-iced-tea-fountain-pen",
    registryKey: "ttpen-hongdian-620-phase163",
    registryName: "TTPEN",
    sourceType: "retailer",
    tier: "contemporary_archive",
    summary: "具体 Long Island Iced Tea SKU HD620S-1；银色金属笔身、EF 0.38 mm 与 Fude 0.6 mm、墨囊／converter 和 snap cap 均在页面列出。",
    locator: "title; SKU HD620S-1; silver metal; EF 0.38 mm; Fude 0.6 mm; cartridge/converter; snap cap",
  }),
  cocktailSpecs: web({
    key: "phase163-hongdian-620-ibspot",
    title: "ibspot Hongdian 620 Green Metal Fountain Pen",
    url: "https://www.ibspot.com/products/asvine-hongdian-620-green-metal-fountain-pen-extra-fine-nib-classic-pen-office-pen-writing-with-metal-box?vendor_id=834",
    registryKey: "ibspot-hongdian-620-phase163",
    registryName: "ibspot",
    sourceType: "retailer",
    tier: "professional_secondary",
    summary: "普通绿色 620 零售记录列金属、EF 0.4 mm、旋盖、converter、约 136 mm、14 mm 和 34 g；仅用于颜色 SKU 的交叉范围，不外推给所有 Cocktail 版。",
    locator: "Hongdian 620 specification block; metal; EF 0.4 mm; screw cap; converter; 136 mm; 14 mm; 34 g",
  }),
  cocktailReview: web({
    key: "phase163-hongdian-620-lifesway",
    title: "The Life's Way Hongdian 620 review",
    url: "https://www.thelifesway.com/2025/10/stationery-review-289-hongdian-model.html",
    registryKey: "lifesway-hongdian-620-phase163",
    registryName: "The Life's Way",
    sourceType: "blog",
    tier: "community",
    summary: "实物评测展示绿色 620 的金属手感与钢尖书写样本；只用于确认 620 的市场实物存在和体验边界，不替代商品规格。",
    locator: "Hongdian Model 620 green body; metal feel; stainless steel EF sample",
  }),
  svg1866: diagram("phase163-hongdian-1866-svg", "HongDian 1866 structure factual diagram", "/images/library/site-original/phase163/hongdian/1866.svg"),
  svgN6: diagram("phase163-hongdian-n6-svg", "HongDian N6 structure factual diagram", "/images/library/site-original/phase163/hongdian/n6.svg"),
  svg620: diagram("phase163-hongdian-620-svg", "HongDian 620 Cocktail structure factual diagram", "/images/library/site-original/phase163/hongdian/620.svg"),
} as const;

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies: true };
}

const existing = phase77HongdianN7RabbitPacks(PHASE163_HONGDIAN_BRAND_ID, "phase77-pen-hongdian-n7-rabbit");
const baseBrand = existing.find((pack) => pack.expectedType === "brand");
if (!baseBrand) throw new Error("Phase 163 HongDian brand prerequisite is missing.");
const brand = structuredClone(baseBrand);
brand.key = "phase163-hongdian-brand-navigation-v1";
brand.sources = [...brand.sources, S.wood, S.n6Makoba, S.cocktail].filter((source, index, all) => all.findIndex((candidate) => candidate.key === source.key) === index);
brand.claims = [
  ...brand.claims,
  ...[
    ["phase163-hongdian-1866-navigation", "HongDian 品牌页新增 1866/1866 Max 木质两用笔入口；它与 1866S、Black Forest 和 N 系列分开记录。", S.wood.key],
    ["phase163-hongdian-n6-navigation", "HongDian 品牌页新增 N6 活塞型号入口；N6 的树脂、金属雕刻帽和活塞规格不继承 N7、N12 或 N23。", S.n6Makoba.key],
    ["phase163-hongdian-620-navigation", "HongDian 品牌页新增 620 Cocktail 型号入口；Long Island Iced Tea 的 EF／Fude 选项按颜色 SKU 记录。", S.cocktail.key],
  ].map(([key, objectText, sourceKey]) => ({
    key,
    predicate: "series_navigation",
    objectText,
    factClass: "core" as const,
    confidence: 0.98,
    sourceKey,
    locator: "model-specific source and existing HongDian brand identity",
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: "phase163-hongdian-navigation", locator: "separately curated model identity" }],
  })),
];
brand.scopes = [...brand.scopes, { key: "phase163-hongdian-navigation", scopeKey: "phase163-hongdian-navigation", validFrom: RETRIEVED, productionState: "current", editionScope: "HongDian navigation includes 1866, N6 and 620 as separately curated model entries." }];

function makePen(input: {
  entityId: string;
  slug: string;
  name: string;
  markdownFile: string;
  storyTitle: string;
  summary: string;
  primary: CuratedSource;
  secondary: CuratedSource[];
  svg: CuratedSource;
  aliases: string[];
  scopeKey: string;
  identity: string;
  structure: string;
  nib: string;
  variant: string;
  care: string;
  specs: Partial<Record<Exclude<SpecFieldKey, "brand_entity_id">, string>>;
  specEvidence: Array<{ fieldKey: SpecFieldKey; sourceKey: string; locator: string }>;
  variants: CuratedEntityPack["variants"];
}): CuratedEntityPack {
  const sourceList = [input.primary, ...input.secondary, input.svg];
  const sourceKeys = new Set(sourceList.map((source) => source.key));
  return {
    key: `phase163-hongdian-${input.slug}`,
    entityId: input.entityId,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.storyTitle,
    primarySourceKey: input.primary.key,
    depthTier: "B",
    aliases: input.aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: input.primary.key })),
    sources: sourceList,
    scopes: [{ key: input.scopeKey, scopeKey: input.scopeKey, validFrom: RETRIEVED, productionState: "current", materialScope: "Model-level facts are bounded to the named SKU family and do not absorb adjacent variants.", nibScope: "Nib options are listing-scoped; marketing soft/fude wording is not upgraded to a universal flex or gold-nib claim.", editionScope: "Current retail identity; launch year and factory history are withheld when not independently documented." }],
    claims: [
      { key: `${input.slug}-identity`, predicate: "model_identity", objectText: input.identity, factClass: "core", confidence: 0.98, sourceKey: input.primary.key, locator: input.primary.archiveLocator ?? input.primary.summary, evidence: [{ key: `${input.slug}-identity-primary`, sourceKey: input.primary.key, scopeKey: input.scopeKey, locator: "model title and product-specific description" }, { key: `${input.slug}-identity-secondary`, sourceKey: input.secondary[0]?.key ?? input.primary.key, scopeKey: input.scopeKey, locator: "independent model record" }] },
      { key: `${input.slug}-structure`, predicate: "filling_material_boundary", objectText: input.structure, factClass: "core", confidence: 0.97, sourceKey: input.primary.key, locator: input.primary.summary, evidence: [{ key: `${input.slug}-structure-evidence`, sourceKey: input.primary.key, scopeKey: input.scopeKey, locator: "material, cap and filling fields" }] },
      { key: `${input.slug}-nib`, predicate: "nib_boundary", objectText: input.nib, factClass: "core", confidence: 0.97, sourceKey: input.primary.key, locator: input.primary.summary, evidence: [{ key: `${input.slug}-nib-primary`, sourceKey: input.primary.key, scopeKey: input.scopeKey, locator: "nib option and line-size fields" }, { key: `${input.slug}-nib-secondary`, sourceKey: input.secondary[0]?.key ?? input.primary.key, scopeKey: input.scopeKey, locator: "independent nib wording" }] },
      { key: `${input.slug}-variant`, predicate: "version_boundary", objectText: input.variant, factClass: "core", confidence: 0.96, sourceKey: input.primary.key, locator: input.primary.summary, evidence: [{ key: `${input.slug}-variant-evidence`, sourceKey: input.primary.key, scopeKey: input.scopeKey, locator: "named colour, SKU or variant option" }] },
      { key: `${input.slug}-care`, predicate: "maintenance_boundary", objectText: input.care, factClass: "editorial", confidence: 0.95, sourceKey: input.primary.key, locator: "conservative care guidance based on filling system and material", evidence: [{ key: `${input.slug}-care-evidence`, sourceKey: input.primary.key, scopeKey: input.scopeKey, locator: "filling and material boundary" }] },
    ],
    variants: input.variants,
    spec: {
      brandEntityId: PHASE163_HONGDIAN_BRAND_ID,
      values: input.specs,
      evidence: [
        evidence("brand_entity_id", `${input.slug}-brand`, input.primary.key, input.scopeKey, "HongDian product context"),
        ...input.specEvidence.map((item) => evidence(item.fieldKey, `${input.slug}-${item.fieldKey}`, sourceKeys.has(item.sourceKey) ? item.sourceKey : input.primary.key, input.scopeKey, item.locator)),
      ],
    },
    timeline: [{ key: `${input.slug}-current`, title: "当前商品记录核对", eventType: "model_released", startDate: RETRIEVED, circa: true, description: "本事件表示资料检索日的市场记录，不是型号首发年份。", sourceKey: input.primary.key }],
    media: [{ key: `${input.slug}-primary`, title: `${input.name} 结构事实图（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片；non-photo、non-logo、not-to-scale、non-colour-proof。", sourceUrl: input.svg.url, usageStatus: "primary" }],
  };
}

export const phase163HongdianPacks: CuratedEntityPack[] = [
  brand,
  makePen({
    entityId: PHASE163_IDS.model1866,
    slug: "弘典-hongdian-1866",
    name: "弘典 HongDian 1866",
    markdownFile: ".planning/content-research/hongdian-1866-phase163.md",
    storyTitle: "HongDian 1866：木质外观与软弹钢尖的身份边界",
    summary: "HongDian 1866 是一支以木质笔身、金属帽和软弹钢尖为识别点的复古风格两用笔；本页只记录 1866/1866 Max 的可核对结构，不把 1866S、新一代软尖或其他 Black Forest 版本混为同一型号。",
    primary: S.wood,
    secondary: [S.woodBoundary, S.woodSample],
    svg: S.svg1866,
    aliases: ["HongDian 1866", "HongDian 1866 Max", "弘典 1866"],
    scopeKey: "phase163-hongdian-1866-scope",
    identity: "HongDian 1866/1866 Max 是木质外观、金属帽、Fine soft 钢尖与 converter 两用式路线的独立型号记录；1866S、新款 Black Forest 和其他木质版本不并入本实体。",
    structure: "商品页列 bubinga wood barrel、metal frame、旋帽和 converter；木纹、颜色、盒装和具体装饰按批次或卖家 SKU 核对。",
    nib: "当前商品记录写 Fine、约 0.5 mm iridium fine-soft；soft 是销售描述，不能升级为 flex、金尖或全批次线宽保证。",
    variant: "1866/1866 Max 与 1866S 分开记录；木种、颜色和 1866 Max 帽顶刻字是版本边界，不把 1866S 的 sappanwood 与新一代软尖移植过来。",
    care: "converter 用常温清水吸排，木质笔身不长时间浸泡，不使用热水、酒精和强溶剂；螺纹干墨先软化再擦拭，异常时停止用力并联系卖家。",
    specs: { series_name: "HongDian 1866 / 1866 Max", release_year: "当代零售记录；首发年未独立核实", origin_country: "商品记录标注 made in China；未据此推断工厂沿革", nib: "Fine，约 0.5 mm；商品页写 iridium fine-soft，非 flex 保证", fill_system: "Converter 两用式；兼容墨囊与瓶装墨水按 SKU 核对", material: "木质（商品页写 bubinga wood）笔身与金属帽/装饰件", dimensions: "约 13.5 mm 直径；完整长度未由可靠交叉来源固定", status: "当代零售可见；颜色、木纹和库存随渠道变化" },
    specEvidence: [
      { fieldKey: "series_name", sourceKey: S.wood.key, locator: "1866 product title and model number" },
      { fieldKey: "release_year", sourceKey: S.wood.key, locator: "current retail snapshot; no launch-year claim" },
      { fieldKey: "origin_country", sourceKey: S.wood.key, locator: "1866 Max made in China cap marking" },
      { fieldKey: "nib", sourceKey: S.wood.key, locator: "0.5 mm iridium fine-soft nib" },
      { fieldKey: "fill_system", sourceKey: S.wood.key, locator: "converter included" },
      { fieldKey: "material", sourceKey: S.wood.key, locator: "bubinga wood barrel and metal frame" },
      { fieldKey: "dimensions", sourceKey: S.wood.key, locator: "13.5 mm diameter specification" },
      { fieldKey: "status", sourceKey: S.wood.key, locator: "in-stock retail snapshot" },
    ],
    variants: [
      { key: "phase163-1866-max", name: "1866 Max 木质版本", notes: "商品和用户实物记录出现 1866 Max 帽顶刻字；不把名称升级为不同结构型号。", sourceKey: S.wood.key, variantKind: "variant" },
      { key: "phase163-1866s-boundary", name: "1866S（边界，不并入本实体）", notes: "1866S 使用 HD1866S-1、sappanwood 与新一代软弹尖，作为相邻版本单独核验。", sourceKey: S.woodBoundary.key, variantKind: "edition_group" },
    ],
  }),
  makePen({
    entityId: PHASE163_IDS.n6,
    slug: "弘典-hongdian-n6云章",
    name: "弘典 HongDian N6",
    markdownFile: ".planning/content-research/hongdian-n6-phase163.md",
    storyTitle: "HongDian N6：金属雕刻帽、透明墨仓与活塞结构",
    summary: "HongDian N6 是 N 系列中的活塞钢笔，黑色版本以树脂笔杆、金属雕刻帽、黑色钢尖和可视墨仓为识别点；本页按两个零售商的具体规格记录，不把 N7、N12、N23 或其他 N 系列的材料和主题版移植过来。",
    primary: S.n6Makoba,
    secondary: [S.n6Online, S.n6Brand],
    svg: S.svgN6,
    aliases: ["HongDian N6", "Hongdian N6 Black", "弘典 N6 云章"],
    scopeKey: "phase163-hongdian-n6-scope",
    identity: "HongDian N6 是黑色树脂笔杆、金属雕刻帽、黑色钢制 Fine 尖和内置活塞路线的独立型号；N7 Rabbit、N12 和 N23 不与其合并。",
    structure: "两个零售记录共同列金属与树脂、旋帽、可插帽和活塞；Online Mantra 还列透明可视墨仓和黑色 PVD 钢尖。",
    nib: "当前黑色样本是 Fine 钢尖，Online Mantra 写 black PVD plated stainless steel；不把其他 N 系列的 fude、long knife 或 gold-colour 说法套过来。",
    variant: "本页固定黑色 N6 样本；金色、彩色、尖号和库存为 SKU 字段，不能由 N7、N12 或 N23 的主题版替代。",
    care: "活塞换墨使用常温清水吸排并自然晾干；不使用热水、酒精、研磨剂或强拆活塞，PVD 尖和雕刻帽以软布清洁。",
    specs: { series_name: "HongDian N6", release_year: "当代零售记录；首发年未独立核实", origin_country: "两个零售页面列 China；未据此扩写制造史", nib: "Fine；黑色 PVD 镀层不锈钢尖", fill_system: "内置活塞式，直接使用瓶装墨水", material: "树脂笔杆与金属雕刻帽", status: "当代型号；部分渠道检索时售罄，全球停产未证实" },
    specEvidence: [
      { fieldKey: "series_name", sourceKey: S.n6Makoba.key, locator: "N6 Black title and collection" },
      { fieldKey: "release_year", sourceKey: S.n6Makoba.key, locator: "current product page; launch year withheld" },
      { fieldKey: "origin_country", sourceKey: S.n6Makoba.key, locator: "Product Origin China" },
      { fieldKey: "nib", sourceKey: S.n6Online.key, locator: "black PVD plated stainless steel Fine" },
      { fieldKey: "fill_system", sourceKey: S.n6Makoba.key, locator: "Piston Filler" },
      { fieldKey: "material", sourceKey: S.n6Online.key, locator: "resin barrel and metal engraving cap" },
      { fieldKey: "status", sourceKey: S.n6Makoba.key, locator: "retail availability snapshot" },
    ],
    variants: [{ key: "phase163-n6-black", name: "N6 Black", notes: "本批次以两个零售商共同记录的黑色版本为主体；尖号和库存随 SKU 核对。", sourceKey: S.n6Makoba.key, variantKind: "color", market: "IN" }],
  }),
  makePen({
    entityId: PHASE163_IDS.model620,
    slug: "弘典-hongdian-620鸡尾酒",
    name: "弘典 HongDian 620 鸡尾酒",
    markdownFile: ".planning/content-research/hongdian-620-phase163.md",
    storyTitle: "HongDian 620 鸡尾酒系列：金属笔身与 EF／小弯尖选项",
    summary: "HongDian 620 是 Cocktail 系列中的金属两用笔；Long Island Iced Tea 版本以银色金属外观、旋盖和 EF 0.38 mm／Fude 0.6 mm 两种尖号为当前可核对的 SKU 边界，不把 620 的颜色名称或小弯尖写成全系列统一配置。",
    primary: S.cocktail,
    secondary: [S.cocktailSpecs, S.cocktailReview],
    svg: S.svg620,
    aliases: ["HongDian 620", "Hongdian 620 Long Island Iced Tea", "弘典 620 鸡尾酒"],
    scopeKey: "phase163-hongdian-620-scope",
    identity: "HongDian 620 是 Cocktail 系列的独立金属两用笔；本页主记录 Long Island Iced Tea SKU HD620S-1，并与其他颜色或普通 620 规格保持边界。",
    structure: "TTPEN 的具体 SKU 列银色金属笔身、snap cap、墨囊／converter 两用式；金属手感和帽机构不能外推到未具名的 620 页面。",
    nib: "Long Island Iced Tea 页面列 EF 0.38 mm（描述段写 0.4 mm）和 Fude 0.6 mm；Fude 是小弯尖，不自动等于长刀尖或 flex。",
    variant: "Long Island Iced Tea、绿色和其他鸡尾酒名称是颜色/市场 SKU；普通绿色记录的 136 mm、约 34 g 仅作范围交叉，不写成所有 620 的固定值。",
    care: "converter 用常温清水吸排；金属表面不使用热水、酒精、牙膏或金属刷，小弯尖用轻压力靠角度变化，不用按压制造线宽。",
    specs: { series_name: "HongDian 620 Cocktail series", release_year: "当代零售记录；首发年未独立核实", origin_country: "零售资料列 China/Asvine-HongDian context；不扩写工厂史", nib: "Long Island Iced Tea：EF 0.38/0.4 mm 或 Fude 0.6 mm", fill_system: "墨囊／converter 两用式", material: "金属笔身与笔帽", dimensions: "绿色普通款零售记录约 136 mm 长、14 mm 直径；不外推给所有颜色", weight: "绿色普通款零售记录约 34 g；Long Island Iced Tea 未给统一重量", status: "当代零售可见；颜色、尖号和库存随渠道变化" },
    specEvidence: [
      { fieldKey: "series_name", sourceKey: S.cocktail.key, locator: "620 Long Island Iced Tea title and Cocktail series description" },
      { fieldKey: "release_year", sourceKey: S.cocktail.key, locator: "current SKU snapshot; launch year withheld" },
      { fieldKey: "origin_country", sourceKey: S.cocktailSpecs.key, locator: "Hongdian/Asvine product context" },
      { fieldKey: "nib", sourceKey: S.cocktail.key, locator: "EF 0.38 mm and Fude 0.6 mm options" },
      { fieldKey: "fill_system", sourceKey: S.cocktail.key, locator: "standard cartridges and converter" },
      { fieldKey: "material", sourceKey: S.cocktail.key, locator: "full metal body" },
      { fieldKey: "dimensions", sourceKey: S.cocktailSpecs.key, locator: "136 mm, 14 mm in green 620 record" },
      { fieldKey: "weight", sourceKey: S.cocktailSpecs.key, locator: "34 g in green 620 record" },
      { fieldKey: "status", sourceKey: S.cocktail.key, locator: "in-stock product page at retrieval" },
    ],
    variants: [
      { key: "phase163-620-long-island", name: "Long Island Iced Tea（HD620S-1）", notes: "银色金属版本；EF 0.38 mm 与 Fude 0.6 mm 由当前商品选择器列出。", sourceKey: S.cocktail.key, variantKind: "market_sku", productCode: "HD620S-1" },
      { key: "phase163-620-green-boundary", name: "绿色普通 620（边界样本）", notes: "另一个零售记录列 EF 0.4 mm、136 mm 与约 34 g，仅用于范围交叉，不改写主 SKU。", sourceKey: S.cocktailSpecs.key, variantKind: "color" },
    ],
  }),
];
