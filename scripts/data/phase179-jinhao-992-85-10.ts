import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase63JinhaoPacks } from "./phase63-jinhao-split";

export const PHASE179_JINHAO_BRAND_ID = "Yulxwu7PuQAU";
export const PHASE179_IDS = {
  model992: "ymovp7E7NlEk",
  model85: "dnrQK31VKUst",
  model10: "ybN-vyW4nRbM",
} as const;
const RETRIEVED = "2026-07-25";

function source(input: {
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
    homepageUrl: input.url.startsWith("http") ? new URL(input.url).origin : "/",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function svg(key: string, title: string, url: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase179",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase179",
    title,
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片，不证明比例、颜色、重量或库存。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true`,
  };
}

const S = {
  official: source({ key: "phase179-jinhao-official", title: "Jinhao 官方产品站", url: "https://jinhaoproducts.com/", registryKey: "jinhaoproducts-phase179", registryName: "Jinhao Products", sourceType: "official", tier: "contemporary_archive", summary: "Jinhao 产品站提供品牌名称、型号导航与 converter 语境；不据此补写 992、85 或 10 的统一生产规格。", locator: "products navigation and converter context" }),
  collection: source({ key: "phase179-jinhao-collection", title: "TTpen Jinhao 产品集合", url: "https://www.ttpen.com/collections/jinhao", registryKey: "ttpen-jinhao-phase179", registryName: "TTpen", sourceType: "retailer", tier: "contemporary_archive", summary: "零售集合用于确认 Jinhao 型号并列的当代市场语境；不承担品牌史或每批次规格。", locator: "Jinhao collection model cards" }),
  p992: source({ key: "phase179-jinhao-992-inexpens", title: "InexPens：Jinhao 992 Fountain Pen", url: "https://inexpens.com/product/jinhao-992-fountain-pen/", registryKey: "inexpens-jinhao-992-phase179", registryName: "InexPens", sourceType: "retailer", tier: "retailer", summary: "零售规格列 992 的塑料笔身、螺纹帽、#5 钢尖、converter、可插帽与尺寸字段；颜色和线宽按 SKU。", locator: "992 technical specification table" }),
  p992Review: source({ key: "phase179-jinhao-992-sbrebrown", title: "SBreBrown：Jinhao 992 Fountain Pen Review", url: "https://www.sbrebrown.com/2018/10/jinhao-992-fountain-pen-review/", registryKey: "sbrebrown-jinhao-992-phase179", registryName: "SBreBrown", sourceType: "blog", tier: "professional_secondary", summary: "独立评测量得 992 样本尺寸与重量，并记录 cartridge/converter 和钢尖体验；只代表该样本。", locator: "measurements and cartridge-converter review" }),
  p992Fpn: source({ key: "phase179-jinhao-992-fpn", title: "Fountain Pen Network：Jinhao 992 Review", url: "https://www.fountainpennetwork.com/forum/topic/348756-jinhao-992-review/", registryKey: "fpn-jinhao-992-phase179", registryName: "Fountain Pen Network", sourceType: "forum", tier: "community", summary: "玩家记录 992 的 converter、国际墨囊、轻量插帽与个体裂纹风险；用于样本和维护边界。", locator: "992 review discussion and converter observations" }),
  p992Svg: svg("phase179-jinhao-992-svg", "Jinhao 992 结构事实图", "/images/library/site-original/phase179/jinhao/992.svg"),
  p85Catalog: source({ key: "phase179-jinhao-85-penography", title: "4mul8：Jinhao Penography", url: "https://4mul8.wordpress.com/jinhao-penography/", registryKey: "4mul8-jinhao-85-phase179", registryName: "4mul8", sourceType: "blog", tier: "contemporary_archive", summary: "型号目录把 85 归入护尖、金属或亚克力／木杆的 Jinhao 产品语境，提醒 85 与 86 名称和材料不应混用。", locator: "Jinhao model reference and 85/86 material boundary" }),
  p85Review: source({ key: "phase179-jinhao-85-fpn", title: "Fountain Pen Network：Jinhao 85 评测", url: "https://www.fountainpennetwork.com/forum/topic/357696-jinhao-85-the-premature-2021-parker-51-copy/", registryKey: "fpn-jinhao-85-phase179", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", summary: "独立评测记录 85 的金属笔身、螺纹帽、护尖钢尖、converter 和版本差异；手感与拆解风险只代表样本。", locator: "85 lacquered metal body, hooded nib, threaded cap and converter" }),
  p85Compare: source({ key: "phase179-jinhao-85-86", title: "Fountain Pen Network：Jinhao 86 与 85 比较", url: "https://www.fountainpennetwork.com/forum/topic/368960-jinhao-86-vs-85-question/", registryKey: "fpn-jinhao-85-86-phase179", registryName: "Fountain Pen Network community", sourceType: "forum", tier: "community", summary: "比较讨论把 85 的金属路线与 86 的树脂路线分开，并提示插帽和重心不可互相继承。", locator: "85 versus 86 material and postability discussion" }),
  p85Svg: svg("phase179-jinhao-85-svg", "Jinhao 85 结构事实图", "/images/library/site-original/phase179/jinhao/85.svg"),
  p10Review: source({ key: "phase179-jinhao-10-stylo", title: "Stylo-plume：Jinhao 10 评测", url: "https://www.stylo-plume.org/viewtopic.php?t=24593", registryKey: "stylo-plume-jinhao-10-phase179", registryName: "Stylo-plume reviewers", sourceType: "forum", tier: "professional_secondary", summary: "评测将 Jinhao 10 与 Capless 作外观比较，记录按动、遮门、细尖和尺寸样本；不承担 Pilot 兼容性。", locator: "Jinhao 10 retractable nib review and Capless comparison" }),
  p10Note: source({ key: "phase179-jinhao-10-note", title: "すとれえじ：JINHAO 10 按动钢笔实测", url: "https://note.com/_storage/n/nf18d81cf8318", registryKey: "note-jinhao-10-phase179", registryName: "すとれえじ", sourceType: "blog", tier: "community", summary: "实测记录 Jinhao 10 两种刻字位置、F 尖和含 converter 重量；属于单支与批次观察。", locator: "2025 JINHAO 10 review, two marking versions and 33 g sample" }),
  p10Reddit: source({ key: "phase179-jinhao-10-reddit", title: "Reddit：Jinhao 10 版本与 F/EF 使用记录", url: "https://www.reddit.com/r/fountainpens/comments/1ht703n/jinhao_10/", registryKey: "reddit-jinhao-10-phase179", registryName: "r/fountainpens participants", sourceType: "reddit", tier: "community", summary: "用户分享 Jinhao 10 的 F/EF 线宽、按动和批次刻字差异；只作体验旁证。", locator: "Jinhao 10 F/EF and marking discussion" }),
  p10Svg: svg("phase179-jinhao-10-svg", "Jinhao 10 结构事实图", "/images/library/site-original/phase179/jinhao/10.svg"),
};

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

const baseBrand = phase63JinhaoPacks.find((pack) => pack.expectedType === "brand");
if (!baseBrand) throw new Error("Phase 179 Jinhao brand prerequisite is missing.");
const brand = structuredClone(baseBrand);
brand.entityId = PHASE179_JINHAO_BRAND_ID;
brand.key = "phase179-jinhao-brand-navigation-v1";

function makePen(input: {
  id: string;
  slug: string;
  name: string;
  key: string;
  title: string;
  summary: string;
  markdownFile: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  tertiary: CuratedSource;
  image: CuratedSource;
  identity: string;
  boundary: string;
  care: string;
  series: string;
  release: string;
  nib: string;
  fill: string;
  material: string;
  dimensions: string;
  weight: string;
  status: string;
  variants: CuratedEntityPack["variants"];
}): CuratedEntityPack {
  const scope = `phase179-${input.key}-scope`;
  const sources = [S.official, S.collection, input.primary, input.secondary, input.tertiary, input.image];
  const claim = (key: string, predicate: string, objectText: string, sourceKey: string, locator: string, extra: Array<{ key: string; sourceKey: string; locator: string }> = []): CuratedEntityPack["claims"][number] => ({
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence: 0.97,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: scope, locator }, ...extra.map((item) => ({ ...item, scopeKey: scope }))],
  });
  return {
    key: `phase179-${input.key}-v1`,
    entityId: input.id,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.title,
    primarySourceKey: input.primary.key,
    depthTier: "B",
    aliases: [{ alias: input.name, language: "zh", sourceKey: input.primary.key }, { alias: input.name.replace("金豪 ", "Jinhao "), language: "en", sourceKey: input.primary.key }],
    sources,
    scopes: [{ key: scope, scopeKey: scope, validFrom: RETRIEVED, productionState: "current", materialScope: input.material, nibScope: input.nib, editionScope: "当代市场型号；颜色、饰件、尖号、converter 与库存按具体 SKU 核对。" }],
    claims: [
      claim(`${input.key}-identity`, "model_identity", input.identity, input.primary.key, input.primary.summary, [{ key: `${input.key}-identity-official`, sourceKey: S.official.key, locator: S.official.summary }]),
      claim(`${input.key}-boundary`, "version_boundary", input.boundary, input.secondary.key, input.secondary.summary, [{ key: `${input.key}-boundary-catalog`, sourceKey: S.collection.key, locator: S.collection.summary }]),
      { key: `${input.key}-care`, predicate: "maintenance_boundary", objectText: input.care, factClass: "editorial", confidence: 0.96, sourceKey: input.tertiary.key, locator: input.tertiary.summary, evidence: [{ key: `${input.key}-care-evidence`, sourceKey: input.tertiary.key, scopeKey: scope, locator: input.tertiary.summary }] },
    ],
    variants: input.variants,
    spec: {
      brandEntityId: PHASE179_JINHAO_BRAND_ID,
      values: { series_name: input.series, release_year: input.release, origin_country: "Jinhao 中国产品线；具体制造地点与批次按实物或商品页核对", nib: input.nib, fill_system: input.fill, material: input.material, dimensions: input.dimensions, weight: input.weight, status: input.status },
      evidence: [
        evidence("brand_entity_id", `${input.key}-brand`, S.official.key, scope, "Jinhao brand context"),
        evidence("series_name", `${input.key}-series`, input.primary.key, scope, input.primary.summary),
        evidence("release_year", `${input.key}-release`, input.secondary.key, scope, "dated review or contemporary catalogue window"),
        evidence("origin_country", `${input.key}-origin`, S.official.key, scope, "Jinhao manufacturer context without factory inference"),
        evidence("nib", `${input.key}-nib`, input.primary.key, scope, input.primary.summary),
        evidence("fill_system", `${input.key}-fill`, input.primary.key, scope, input.primary.summary),
        evidence("material", `${input.key}-material`, input.secondary.key, scope, input.secondary.summary),
        evidence("dimensions", `${input.key}-dimensions`, input.secondary.key, scope, input.secondary.summary),
        evidence("weight", `${input.key}-weight`, input.secondary.key, scope, input.secondary.summary),
        evidence("status", `${input.key}-status`, S.collection.key, scope, S.collection.summary),
      ],
    },
    timeline: [{ key: `${input.key}-current`, title: `${input.name} 的当代资料窗口`, eventType: "model_released", startDate: RETRIEVED, circa: true, description: input.summary, sourceKey: input.primary.key }],
    media: [{ key: `${input.key}-primary-media`, title: `${input.name} 结构事实图（非产品照片）`, sourceKey: input.image.key, localPath: input.image.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片；not-to-scale、non-colour-proof。", sourceUrl: input.image.url, usageStatus: "primary" }],
  };
}

const model992 = makePen({
  id: PHASE179_IDS.model992,
  slug: "金豪-jinhao-992",
  name: "金豪 Jinhao 992",
  key: "jinhao-992",
  title: "Jinhao 992：轻量透明树脂日用笔",
  summary: "Jinhao 992 是小巧树脂旋帽钢笔，常见 F/EF 钢尖、converter 与透明配色；实际线宽、尺寸和密封按样本核对。",
  markdownFile: ".planning/content-research/jinhao-992-phase179.md",
  primary: S.p992,
  secondary: S.p992Review,
  tertiary: S.p992Fpn,
  image: S.p992Svg,
  identity: "Jinhao 992 是独立的小型树脂 cartridge/converter 钢笔；透明配色、轻量笔身、螺纹帽与 #5 钢尖构成识别组合，不等同于 Sailor 1911、Pilot Prera 或 Jinhao 82。",
  boundary: "透明、咖啡、蓝、绿、白、红和金银饰件属于颜色或市场 SKU；F/EF 及替换尖也不拆为新型号。部分样本带 O-ring 并可尝试 eyedropper，但不把这项玩法当作所有 992 的无条件标准。",
  care: "converter 与握位以常温清水吸排为主，避免热水、酒精和强溶剂；若透明笔杆有裂纹、握位漏气或帽内积墨，应停止携带并交给卖家或维修者。",
  series: "Jinhao 992",
  release: "当代市场型号；2017–2019 年已有公开评测",
  nib: "常见 F／EF #5 钢尖；线宽按 SKU 与个体调校核对",
  fill: "cartridge/converter；常见附旋转 converter，部分样本具 eyedropper 条件",
  material: "塑料／树脂笔身、笔帽与握位，金属夹和饰环",
  dimensions: "参考样本合盖约 135 mm、插帽约 145–146 mm，握位约 9–10 mm",
  weight: "参考样本约 17–20 g；按颜色、converter 和批次核对",
  status: "当代市场可见；颜色、尖号与配件随渠道变化",
  variants: [{ key: "phase179-992-colors", name: "透明、咖啡与彩色树脂版本", notes: "颜色与饰件按商品 SKU；不拆成独立型号。", sourceKey: S.p992.key, variantKind: "color", market: "Global" }, { key: "phase179-992-nibs", name: "F／EF 与替换尖选项", notes: "线宽和替换件按具体实物，不保证全批次一致。", sourceKey: S.p992.key, variantKind: "nib", market: "Global" }],
});

const model85 = makePen({
  id: PHASE179_IDS.model85,
  slug: "金豪-jinhao-85",
  name: "金豪 Jinhao 85",
  key: "jinhao-85",
  title: "Jinhao 85：金属笔身与护尖的 51 风格路线",
  summary: "Jinhao 85 以金属笔身、螺纹帽、护尖钢尖和 converter 为识别点；金属、flighter、彩色和木杆属于版本边界。",
  markdownFile: ".planning/content-research/jinhao-85-phase179.md",
  primary: S.p85Catalog,
  secondary: S.p85Review,
  tertiary: S.p85Compare,
  image: S.p85Svg,
  identity: "Jinhao 85 是金属笔身、护尖钢尖、螺纹帽与 cartridge/converter 路线的独立型号；它常被与 Parker 51 或 Wing Sung 601 比较，但不属于这些品牌，也不继承它们的帽型和上墨结构。",
  boundary: "黑色涂层、flighter、彩色金属与木杆是市场外观路线；F/EF、帽色和夹子电镀属于变体。85 的金属触感与螺纹帽不能与树脂 86 或按压帽 911 混写。",
  care: "护尖、螺纹和 O-ring 以常温清水清洗；不强拆无法确认可拆的 hood，不用热水、酒精、研磨剂或金属刷处理漆面和电镀。",
  series: "Jinhao 85",
  release: "约 2020 年前后已有公开评测；首发日未由可靠目录固定",
  nib: "护尖钢尖；常见 F／EF，其他线宽为市场选项",
  fill: "cartridge/converter；converter 接口按精确 SKU 核对",
  material: "金属笔身或涂层／flighter 版本，塑料握位，金属帽与护尖组件",
  dimensions: "与 86、Parker 51 相近的中等尺寸路线；统一目录尺寸未固定",
  weight: "金属笔身比树脂 86 更有分量；按帽材和批次量测",
  status: "当代市场可见；材质、颜色、尖号和库存随渠道变化",
  variants: [{ key: "phase179-85-finish", name: "漆面、flighter、彩色与木杆版本", notes: "外观和材料按实物；不把木杆宣传成整支木制。", sourceKey: S.p85Catalog.key, variantKind: "material", market: "Global" }, { key: "phase179-85-nibs", name: "护尖 F／EF 与其他尖号", notes: "尖号按 SKU；硬钢尖不等于 flex 或 fude。", sourceKey: S.p85Review.key, variantKind: "nib", market: "Global" }],
});

const model10 = makePen({
  id: PHASE179_IDS.model10,
  slug: "金豪-jinhao-10号",
  name: "金豪 Jinhao 10",
  key: "jinhao-10",
  title: "Jinhao 10：按动收尖的平价 Capless 路线",
  summary: "Jinhao 10 是按键出尖、遮门收尖的 cartridge/converter 钢笔；它与 Pilot Capless 的相似只属于外形比较。",
  markdownFile: ".planning/content-research/jinhao-10-phase179.md",
  primary: S.p10Review,
  secondary: S.p10Note,
  tertiary: S.p10Reddit,
  image: S.p10Svg,
  identity: "Jinhao 10 是带按键和前端遮门的独立收尖钢笔，使用 Jinhao 自己的细钢尖与 converter/墨囊路线；它不是 Pilot Capless 的产品、授权版本或可直接互换的笔尖单元。",
  boundary: "中央刻字与夹子刻字、灰紫蓝黑和渐变色、带夹或无夹属于批次或市场 SKU；EF/F 线宽和按动密封按单支检查，不把外观相似写成品牌或零件关系。",
  care: "先收回笔尖再排空 converter，以常温水缓慢清洗；不把整支笔浸热水、酒精或超声波，也不往按动头部滴油。遮门留缝、按键卡住或头部漏墨时停止强拆并联系卖家。",
  series: "Jinhao 10",
  release: "约 2024 年前后已有公开使用记录；首发年份未由可靠目录固定",
  nib: "常见 EF／F 钢尖；线宽与干湿按 SKU 和个体调校变化",
  fill: "cartridge/converter；按动收尖结构，容量按 converter 与墨囊核对",
  material: "金属或涂层笔身与按动组件，塑料握位，金属夹和遮门组件",
  dimensions: "与全尺寸按动钢笔相近；公开样本约 140 mm 级，具体批次量测",
  weight: "约 33 g（含 converter 的单支样本）；不作全系固定重量",
  status: "当代市场可见；刻字、夹子、颜色和尖号按版本变化",
  variants: [{ key: "phase179-10-markings", name: "中央刻字与夹子刻字版本", notes: "观察到的批次外观差异，不自动宣称机构升级。", sourceKey: S.p10Note.key, variantKind: "edition_group", market: "Global" }, { key: "phase179-10-nibs", name: "EF／F 尖号与颜色 SKU", notes: "颜色、尖号和 converter 是否随附按订单核对。", sourceKey: S.p10Review.key, variantKind: "market_sku", market: "Global" }],
});

export const phase179JinhaoPacks: CuratedEntityPack[] = [brand, model992, model85, model10];
