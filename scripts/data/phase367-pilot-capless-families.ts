import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import {
  PHASE366_PILOT_BRAND_ID,
  phase366PilotSpecialRoutePacks,
} from "./phase366-pilot-special-routes";

export const PHASE367_PILOT_BRAND_ID = PHASE366_PILOT_BRAND_ID;
export const PHASE367_KASURI_ID = "phase367-pilot-capless-kasuri";
export const PHASE367_STRIPE_ID = "phase367-pilot-capless-stripe";
export const PHASE367_SE_ID = "phase367-pilot-capless-se";
export const PHASE367_SPECIAL_ALLOY_ID = "phase367-pilot-capless-special-alloy";
export const PHASE367_KASURI_SLUG = "pilot-capless-kasuri";
export const PHASE367_STRIPE_SLUG = "pilot-capless-stripe";
export const PHASE367_SE_SLUG = "pilot-capless-se";
export const PHASE367_SPECIAL_ALLOY_SLUG = "pilot-capless-special-alloy";

const RETRIEVED = "2026-08-02";

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
    tier: input.tier ?? (sourceType === "official" ? "primary" : "professional_secondary"),
    independenceGroup: input.independenceGroup,
    homepageUrl: input.homepageUrl ?? (siteOriginal ? "/" : input.url),
    itemType: siteOriginal ? "image" : "web_page",
    author: input.registryName,
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

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const S = {
  kasuriExact: source({
    key: "phase367-pilot-kasuri-exact",
    registryKey: "pilot-webcatalog-capless-kasuri-phase367",
    registryName: "PILOT Web Catalog",
    title: "キャップレス・絣 FCN-2MR",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100003597&volumeName=00004",
    independenceGroup: "pilot-webcatalog-capless-kasuri-phase367",
    summary: "官方列 FCN-2MR-KB／KL 黑／蓝、18K F／M、按动、CON-40、140 mm、13.4 mm、30 g 与 Z-CR-N3。",
  }),
  stripeExact: source({
    key: "phase367-pilot-stripe-exact",
    registryKey: "pilot-webcatalog-capless-stripe-phase367",
    registryName: "PILOT Web Catalog",
    title: "キャップレス ストライプ FC-3MS",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100000125&volumeName=00004",
    independenceGroup: "pilot-webcatalog-capless-stripe-phase367",
    summary: "官方列 FC-3MS-S-F／M、黄铜铑饰条纹、18K、CON-40、140 mm、13.3 mm、32 g 与 Z-CR-N3。",
  }),
  seExact: source({
    key: "phase367-pilot-se-exact",
    registryKey: "pilot-webcatalog-capless-se-phase367",
    registryName: "PILOT Web Catalog",
    title: "キャップレスSE FCSE-3MR",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100002926&volumeName=00004",
    independenceGroup: "pilot-webcatalog-capless-se-phase367",
    summary: "官方列 FCSE-3MR-MAB／MAL／MAG／MAR／MAO 五种大理石 finish、18K F／M、氨基甲酸酯树脂、CON-40、140 mm、14 mm、26 g。",
  }),
  alloyExact: source({
    key: "phase367-pilot-special-alloy-exact",
    registryKey: "pilot-webcatalog-capless-special-alloy-phase367",
    registryName: "PILOT Web Catalog",
    title: "キャップレス FCS-1 特殊合金",
    url: "https://webcatalog.pilot.co.jp/products/DispDetail.do?itemID=t000100006188&volumeName=00004",
    independenceGroup: "pilot-webcatalog-capless-special-alloy-phase367",
    summary: "官方列 FCS-1-MS／MCO／MDG／MAL 哑光色、特殊合金 F／M、黄铜涂装、CON-40、140 mm、13.4 mm、30 g。",
  }),
  support: source({
    key: "phase367-pilot-capless-covered",
    registryKey: "pilot-covered-capless-families-phase367",
    registryName: "PILOT official warranty",
    title: "Fountain Pens Products covered by the warranty",
    url: "https://www.pilot.co.jp/support/warranty/en-au/fountain/",
    independenceGroup: "pilot-covered-capless-families-phase367",
    summary: "Pilot 支持清单独立列 Capless KASURI FCN-2MR、STRIPE FC-3MS、SE FCSE-3MR 与特殊合金路线。",
  }),
  care: source({
    key: "phase367-pilot-capless-care",
    registryKey: "pilot-capless-care-phase367",
    registryName: "PILOT official support",
    title: "キャップレス use and care guide",
    url: "https://www.pilot.co.jp/support/warranty/jp/fountain/capless_2.html",
    independenceGroup: "pilot-capless-care-phase367",
    summary: "官方护理页说明按动伸缩、CON-40、收尖、清水清洁、溶剂与航空气压边界。",
  }),
  price: source({
    key: "phase367-pilot-price",
    registryKey: "pilot-price-list-202607-phase367",
    registryName: "PILOT official",
    title: "価格表 2026 年 7 月 1 日付",
    url: "https://www.pilot.co.jp/information/pricelist_202607.pdf",
    publishedAt: "2026-07-01",
    independenceGroup: "pilot-price-list-202607-phase367",
    summary: "当前价目表作为 FCN-2MR、FC-3MS、FCSE-3MR、FCS-1 的商业快照；价格不外推为永久售价。",
  }),
  penAddict: source({
    key: "phase367-pilot-capless-professional",
    registryKey: "pen-addict-pilot-capless-phase367",
    registryName: "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pen-addict-pilot-capless-phase367",
    homepageUrl: "https://www.penaddict.com/",
    title: "Pilot Vanishing Point review",
    url: "https://www.penaddict.com/blog/2012/5/9/pilot-vanishing-point-fountain-pen-review.html",
    summary: "专业评测补充 Capless 的单手按动、前夹与日用边界，只作家族机构参照。",
  }),
  press: source({
    key: "phase367-pilot-capless-press",
    registryKey: "pilot-capless-press-2026-phase367",
    registryName: "PILOT official press",
    title: "万年筆『キャップレス』新色発売",
    url: "https://www.pilot.co.jp/press_release/2026/03/05/post_150.html",
    publishedAt: "2026-03-05",
    independenceGroup: "pilot-capless-press-2026-phase367",
    summary: "Pilot 发布资料重申 Capless 的按动、18K／特殊合金两条尖材路线，不替代四个 exact finish。",
  }),
  kasuriSvg: source({ key: "phase367-kasuri-svg", registryKey: "fountain-pen-graph-editorial-phase367", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase367-kasuri", title: "Pilot Capless 絣事实示意图", url: "/images/library/site-original/pilot/capless-kasuri.svg", homepageUrl: "/", summary: "本站原创 factual SVG，表达 FCN-2MR 絣黑／蓝、18K F／M、按动与 CON-40；非产品照片、Logo、比例图或颜色校样。" }),
  stripeSvg: source({ key: "phase367-stripe-svg", registryKey: "fountain-pen-graph-editorial-phase367", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase367-stripe", title: "Pilot Capless Stripe 事实示意图", url: "/images/library/site-original/pilot/capless-stripe.svg", homepageUrl: "/", summary: "本站原创 factual SVG，表达 FC-3MS 铑饰条纹、18K F／M、按动与 CON-40；非产品照片、Logo、比例图或颜色校样。" }),
  seSvg: source({ key: "phase367-se-svg", registryKey: "fountain-pen-graph-editorial-phase367", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase367-se", title: "Pilot Capless SE 事实示意图", url: "/images/library/site-original/pilot/capless-se.svg", homepageUrl: "/", summary: "本站原创 factual SVG，表达 FCSE-3MR 大理石树脂、18K F／M、按动与 CON-40；非产品照片、Logo、比例图或颜色校样。" }),
  alloySvg: source({ key: "phase367-alloy-svg", registryKey: "fountain-pen-graph-editorial-phase367", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase367-alloy", title: "Pilot Capless 特殊合金事实示意图", url: "/images/library/site-original/pilot/capless-special-alloy.svg", homepageUrl: "/", summary: "本站原创 factual SVG，表达 FCS-1 特殊合金、MS／MCO／MDG／MAL、F／M 与 CON-40；非产品照片、Logo、比例图或颜色校样。" }),
} as const;

const brandBase = phase366PilotSpecialRoutePacks.find((pack) => pack.entityId === PHASE367_PILOT_BRAND_ID);
if (!brandBase) throw new Error("Phase 367 Pilot brand prerequisite is missing.");
const brand: CuratedEntityPack = structuredClone(brandBase);
brand.key = "phase367-pilot-capless-families-brand-v1";
brand.markdownFile = ".planning/content-research/pilot-brand-phase367.md";
brand.storyTitle = "Pilot：Capless 絣、Stripe、SE 与特殊合金入口";
brand.sources = [...brand.sources, S.kasuriExact, S.stripeExact, S.seExact, S.alloyExact, S.support, S.price].filter((item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index);
const brandScope = brand.scopes[0]?.key ?? "phase367-pilot-brand-scope";
brand.claims = [
  ...brand.claims,
  claim("phase367-kasuri-navigation", "brand_model_navigation", "Pilot 官方将 Capless 絣 FCN-2MR 作为独立絣纹按动入口，KB／KL 与 F／M 留在同一型号。", S.kasuriExact.key, "FCN-2MR exact title and lineup", brandScope),
  claim("phase367-stripe-navigation", "brand_model_navigation", "Pilot 官方将黄铜铑饰条纹 Capless FC-3MS 单独列出，不能并入普通 FC-18SR。", S.stripeExact.key, "FC-3MS exact title and lineup", brandScope),
  claim("phase367-se-navigation", "brand_model_navigation", "Pilot 官方将大理石树脂 Capless SE FCSE-3MR 单独列出，五种 marble finish 各有 F／M。", S.seExact.key, "FCSE-3MR exact title and lineup", brandScope),
  claim("phase367-alloy-navigation", "brand_model_navigation", "Pilot 官方将特殊合金尖 Capless FCS-1 与 18K Capless 分开，哑光色与 F／M 留在同一型号。", S.alloyExact.key, "FCS-1 special alloy exact title and lineup", brandScope),
];

type Input = {
  key: string;
  id: string;
  slug: string;
  name: string;
  title: string;
  markdownFile: string;
  primary: CuratedSource;
  svg: CuratedSource;
  aliases: string[];
  summary: string;
  material: string;
  nib: string;
  fill: string;
  dimensions: string;
  weight: string;
  price: string;
  release: string;
  status: string;
  boundary: string;
  selection: string;
  variants: Array<{ key: string; name: string; productCode: string; notes: string; variantKind: "color" | "nib" | "material"; market?: string }>;
};

function makePack(input: Input): CuratedEntityPack {
  const scopeKey = `phase367-${input.key}-current`;
  const sources = [input.primary, S.support, S.care, S.price, S.penAddict, S.press, input.svg];
  const aliases = input.aliases.map((alias, index) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: index === 0 ? input.primary.key : S.penAddict.key }));
  const claims = [
    claim(`phase367-${input.key}-identity`, "model_identity", input.summary, input.primary.key, "official exact title, product code and lineup", scopeKey),
    claim(`phase367-${input.key}-material`, "material_finish", input.material, input.primary.key, "official material and finish fields", scopeKey),
    claim(`phase367-${input.key}-nib`, "nib_options", input.nib, input.primary.key, "official nib field and lineup", scopeKey),
    claim(`phase367-${input.key}-fill`, "filling_system", input.fill, input.primary.key, "official converter field", scopeKey),
    claim(`phase367-${input.key}-physical`, "physical_specification", `${input.dimensions}；${input.weight}`, input.primary.key, "official dimensions and weight", scopeKey),
    claim(`phase367-${input.key}-price`, "commercial_snapshot", input.price, S.price.key, "2026-07-01 price-list snapshot", `${scopeKey}-commercial`),
    claim(`phase367-${input.key}-support`, "support_boundary", input.status, S.support.key, "official covered-products list", scopeKey),
    claim(`phase367-${input.key}-boundary`, "version_boundary", input.boundary, S.penAddict.key, "professional Capless family boundary", scopeKey),
    claim(`phase367-${input.key}-care`, "maintenance_guidance", "按 Pilot 官方护理边界使用：不用时收回尖端，室温清水清洁笔舌与 converter，避免高低温、直射日光、酒精等溶剂、航空气压和自行拆修。", S.care.key, "official Capless care and solvent warnings", scopeKey),
    claim(`phase367-${input.key}-selection`, "selection_guidance", input.selection, input.primary.key, "exact SKU and variant verification", scopeKey, "editorial"),
  ];
  const values = { series_name: input.name, release_year: input.release, origin_country: "Pilot Japan 官方产品线；不从市场代码推断工厂地址", nib: input.nib, fill_system: input.fill, material: input.material, dimensions: input.dimensions, weight: input.weight, price_range: input.price, status: input.status };
  const specEvidence = [
    evidence(`phase367-${input.key}-brand`, "brand_entity_id", input.primary.key, scopeKey, "Pilot maker context"),
    evidence(`phase367-${input.key}-series`, "series_name", input.primary.key, scopeKey, "exact title and product code"),
    evidence(`phase367-${input.key}-release`, "release_year", input.primary.key, scopeKey, "current catalogue chronology boundary"),
    evidence(`phase367-${input.key}-origin`, "origin_country", input.primary.key, scopeKey, "Pilot Japan catalogue context"),
    evidence(`phase367-${input.key}-nib`, "nib", input.primary.key, scopeKey, "official nib field"),
    evidence(`phase367-${input.key}-fill`, "fill_system", input.primary.key, scopeKey, "official converter field"),
    evidence(`phase367-${input.key}-material`, "material", input.primary.key, scopeKey, "official material field"),
    evidence(`phase367-${input.key}-dimensions`, "dimensions", input.primary.key, scopeKey, "official dimensions field"),
    evidence(`phase367-${input.key}-weight`, "weight", input.primary.key, scopeKey, "official weight field"),
    evidence(`phase367-${input.key}-price`, "price_range", S.price.key, `${scopeKey}-commercial`, "current price-list snapshot"),
    evidence(`phase367-${input.key}-status`, "status", S.support.key, scopeKey, "official support list"),
  ];
  return {
    key: `phase367-${input.key}-v1`, entityId: input.id, expectedType: "pen", expectedSlug: input.slug, canonicalName: input.name, publicationIntent: "publish", publicationBlockers: [], markdownFile: input.markdownFile, storyTitle: input.title, primarySourceKey: input.primary.key, depthTier: "A", aliases, sources,
    scopes: [
      { key: scopeKey, scopeKey, market: "Pilot Japan current Web Catalog and covered-product list", validFrom: RETRIEVED, productionState: "current", nibScope: input.nib, materialScope: input.material, editionScope: input.boundary },
      { key: `${scopeKey}-commercial`, scopeKey: `${scopeKey}-commercial`, productionState: "unknown", editionScope: "价格、库存、颜色、包装和区域代码按交易日期核对" },
      { key: `${scopeKey}-media`, scopeKey: `${scopeKey}-media`, productionState: "current", editionScope: "site-original factual SVG; not a product photograph, logo, scale drawing or colour proof" },
    ],
    claims,
    variants: input.variants.map((variant) => ({ ...variant, sourceKey: input.primary.key })),
    spec: { brandEntityId: PHASE367_PILOT_BRAND_ID, values, evidence: specEvidence },
    media: [{ key: `phase367-${input.key}-primary-media`, title: `${input.name} 事实图（非产品照片）`, sourceKey: input.svg.key, localPath: input.svg.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样，不代表具体纹理、光泽、颜色、价格或库存。", sourceUrl: input.svg.url, usageStatus: "primary" }],
  };
}

const inputs: Input[] = [
  {
    key: "capless-kasuri", id: PHASE367_KASURI_ID, slug: PHASE367_KASURI_SLUG, name: "百乐 Pilot Capless 絣（Kasuri）", title: "Pilot Capless 絣：低调纹理的按动路线", markdownFile: ".planning/content-research/pilot-capless-kasuri-phase367.md", primary: S.kasuriExact, svg: S.kasuriSvg,
    aliases: ["キャップレス・絣", "Pilot Capless Kasuri", "FCN-2MR", "百乐 Capless 絣"], summary: "Pilot 官方将 Capless 絣以 FCN-2MR 单列；黑／蓝絣纹与 F／M 是同一按动型号的原厂 variant。", material: "絣纹 finish；官方 exact page 未把它写成木材、螺鈿或天然漆", nib: "18K；FCN-2MR-KB／KL 的 F／M", fill: "Pilot CON-40", dimensions: "全长 140 mm；最大径 13.4 mm", weight: "30 g", price: "Pilot 2026 价目／当前商品页快照：黑色含税 35,200 日元；蓝色页面另列 38,500 日元", release: "现行；FCN-2MR 首次上市年份未在当前 exact page 披露", status: "Pilot 支持清单独立列出的 Capless KASURI FCN-2MR", boundary: "絣 FCN-2MR 与普通 FC-18SR、Stripe FC-3MS、SE FCSE-3MR、木轴和螺鈿的 finish、重量、纹理与图片分开。", selection: "核对 FCN-2MR-KB／KL、黑／蓝、F／M、18K、CON-40 与 Z-CR-N3；纹理不能替代品号。", variants: [
      { key: "phase367-kasuri-kb-f", name: "FCN-2MR-KB-F 絣黑 F", productCode: "FCN-2MR-KB-F", notes: "カスリブラック，18K F。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase367-kasuri-kb-m", name: "FCN-2MR-KB-M 絣黑 M", productCode: "FCN-2MR-KB-M", notes: "カスリブラック，18K M。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase367-kasuri-kl-f", name: "FCN-2MR-KL-F 絣蓝 F", productCode: "FCN-2MR-KL-F", notes: "カスリブルー，18K F。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase367-kasuri-kl-m", name: "FCN-2MR-KL-M 絣蓝 M", productCode: "FCN-2MR-KL-M", notes: "カスリブルー，18K M。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase367-kasuri-material", name: "Kasuri pattern finish", productCode: "FCN-2MR", notes: "絣纹外观路线，不与螺鈿或木材合并。", variantKind: "material", market: "Pilot Japan" },
    ],
  },
  {
    key: "capless-stripe", id: PHASE367_STRIPE_ID, slug: PHASE367_STRIPE_SLUG, name: "百乐 Pilot Capless Stripe（条纹）", title: "Pilot Capless Stripe：铑饰条纹的 18K 按动笔", markdownFile: ".planning/content-research/pilot-capless-stripe-phase367.md", primary: S.stripeExact, svg: S.stripeSvg,
    aliases: ["キャップレス ストライプ", "Pilot Capless Stripe", "FC-3MS", "百乐 Capless 条纹"], summary: "Pilot 官方将黄铜铑饰条纹 Capless 以 FC-3MS 单列；S-F／S-M 是同一型号的原厂尖幅。", material: "黄铜轴铑仕上げ；头部不锈钢、夹子铁钢；条纹 finish", nib: "18K；FC-3MS-S-F／S-M", fill: "Pilot CON-40", dimensions: "全长 140 mm；最大径 13.3 mm", weight: "32 g", price: "Pilot 2026 价目／当前商品页快照：含税约 52,800 日元；价格可变", release: "现行；FC-3MS 首次上市年份未在当前 exact page 披露", status: "Pilot 支持清单独立列出的 Capless STRIPE FC-3MS", boundary: "FC-3MS 的铑饰条纹、13.3 mm 与 32 g 不并入普通 Capless、螺鈿、木轴、SE 或 FCS-1。", selection: "核对 FC-3MS-S-F／M、18K、铑饰黄铜轴、CON-40 与 Z-CR-N3；不要只凭银色条纹照片验收。", variants: [
      { key: "phase367-stripe-f", name: "FC-3MS-S-F 条纹 F", productCode: "FC-3MS-S-F", notes: "黄铜铑饰条纹，18K F。", variantKind: "nib", market: "Pilot Japan" },
      { key: "phase367-stripe-m", name: "FC-3MS-S-M 条纹 M", productCode: "FC-3MS-S-M", notes: "黄铜铑饰条纹，18K M。", variantKind: "nib", market: "Pilot Japan" },
      { key: "phase367-stripe-rhodium", name: "Rhodium-finished brass stripe", productCode: "FC-3MS", notes: "铑仕上げ材质／纹理路线。", variantKind: "material", market: "Pilot Japan" },
      { key: "phase367-stripe-con40", name: "CON-40 compatible", productCode: "FC-3MS", notes: "官方 converter 选项。", variantKind: "material", market: "Pilot Japan" },
    ],
  },
  {
    key: "capless-se", id: PHASE367_SE_ID, slug: PHASE367_SE_SLUG, name: "百乐 Pilot Capless SE（大理石）", title: "Pilot Capless SE：每支纹理不同的大理石按动笔", markdownFile: ".planning/content-research/pilot-capless-se-phase367.md", primary: S.seExact, svg: S.seSvg,
    aliases: ["キャップレスSE", "Pilot Capless SE", "FCSE-3MR", "百乐 Capless 大理石"], summary: "Pilot 官方将 Capless SE 以 FCSE-3MR 单列；五种大理石树脂 finish 各有 F／M，不能与 Heritage SE 混名。", material: "氨基甲酸酯树脂轴；大理石 finish；头部／夹子按 Capless 组件", nib: "18K；FCSE-3MR-MAB／MAL／MAG／MAR／MAO 的 F／M", fill: "Pilot CON-40", dimensions: "全长 140 mm；最大径 14 mm", weight: "26 g", price: "Pilot 2026 价目／当前商品页快照：含税 44,000 日元；价格可变", release: "现行；FCSE-3MR 首次上市年份未在当前 exact page 披露", status: "Pilot 支持清单独立列出的 Capless SE FCSE-3MR", boundary: "FCSE-3MR 是大理石氨基甲酸酯树脂 Capless；不与 Custom Heritage SE、絣、木轴或普通 FC-18SR 共享材料、尖号和图片。", selection: "核对 MAB／MAL／MAG／MAR／MAO、F／M、18K、CON-40 与 Z-CR-N3；一支纹理不能代表全库存。", variants: [
      { key: "phase367-se-mab", name: "FCSE-3MR-MAB-F／M 大理石黑", productCode: "FCSE-3MR-MAB", notes: "Marble Black，F／M。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase367-se-mal", name: "FCSE-3MR-MAL-F／M 大理石蓝", productCode: "FCSE-3MR-MAL", notes: "Marble Blue，F／M。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase367-se-mag", name: "FCSE-3MR-MAG-F／M 大理石绿", productCode: "FCSE-3MR-MAG", notes: "Marble Green，F／M。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase367-se-mar", name: "FCSE-3MR-MAR-F／M 大理石红", productCode: "FCSE-3MR-MAR", notes: "Marble Red，F／M。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase367-se-mao", name: "FCSE-3MR-MAO-F／M 大理石橙", productCode: "FCSE-3MR-MAO", notes: "Marble Orange，F／M。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase367-se-material", name: "Urethane resin marble body", productCode: "FCSE-3MR", notes: "氨基甲酸酯树脂与大理石 finish。", variantKind: "material", market: "Pilot Japan" },
    ],
  },
  {
    key: "capless-special-alloy", id: PHASE367_SPECIAL_ALLOY_ID, slug: PHASE367_SPECIAL_ALLOY_SLUG, name: "百乐 Pilot Capless 特殊合金（FCS-1）", title: "Pilot Capless FCS-1：把特殊合金尖单独列清", markdownFile: ".planning/content-research/pilot-capless-special-alloy-phase367.md", primary: S.alloyExact, svg: S.alloySvg,
    aliases: ["キャップレス FCS-1", "Pilot Capless Special Alloy", "FCS-1", "百乐 Capless 特殊合金"], summary: "Pilot 官方将特殊合金尖 Capless 以 FCS-1 单列；四种哑光金属色各有 F／M，不能回填普通 Capless 的 18K。", material: "黄铜＋涂装轴；哑光金属色 MS／MCO／MDG／MAL；头部不锈钢、夹子铁钢", nib: "特殊合金；FCS-1-MS／MCO／MDG／MAL 的 F／M，非 18K", fill: "Pilot CON-40", dimensions: "全长 140 mm；最大径 13.4 mm", weight: "30 g", price: "Pilot 2026 价目／当前商品页快照：含税 17,600 日元；价格可变", release: "现行；FCS-1 首次上市年份未在当前 exact page 披露", status: "Pilot 支持清单与 Web Catalog 独立列出的特殊合金 Capless FCS-1", boundary: "FCS-1 的特殊合金尖和哑光色不与 18K 普通 Capless、Stripe、SE、木轴或螺鈿共用 nib／finish 字段。", selection: "核对 FCS-1、MS／MCO／MDG／MAL、F／M、特殊合金、CON-40 与专用盒；不要把‘Capless 钢尖’泛称当作品号。", variants: [
      { key: "phase367-alloy-ms", name: "FCS-1-MS-F／M 哑光银", productCode: "FCS-1-MS", notes: "Matte Silver，特殊合金 F／M。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase367-alloy-mco", name: "FCS-1-MCO-F／M 哑光铜", productCode: "FCS-1-MCO", notes: "Matte Copper，特殊合金 F／M。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase367-alloy-mdg", name: "FCS-1-MDG-F／M 哑光深绿", productCode: "FCS-1-MDG", notes: "Matte Deep Green，特殊合金 F／M。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase367-alloy-mal", name: "FCS-1-MAL-F／M 哑光灰蓝", productCode: "FCS-1-MAL", notes: "Matte Ash Blue，特殊合金 F／M。", variantKind: "color", market: "Pilot Japan" },
      { key: "phase367-alloy-nib", name: "Special alloy nib", productCode: "FCS-1", notes: "特殊合金尖；不继承 18K 字段。", variantKind: "nib", market: "Pilot Japan" },
    ],
  },
];

export const phase367PilotCaplessFamilyPacks: CuratedEntityPack[] = [brand, ...inputs.map(makePack)];
