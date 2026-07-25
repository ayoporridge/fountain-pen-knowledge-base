import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import {
  PHASE179_JINHAO_BRAND_ID,
  phase179JinhaoPacks,
} from "./phase179-jinhao-992-85-10";

const RETRIEVED = "2026-07-25";

export const PHASE180_IDS = {
  model313: "gAxOYWXf25TY",
  model619: "LpJabRAW_0Pu",
  model75: "U8RkDxnXNxqo",
  model80: "V3GOJ5Q1Ra9-",
  model9035: "Y5hFEra6hHop",
  model9056: "jrBqng7RkdNS",
  modelCentury: "8Zf3hoxCN0sv",
  modelSilverCentury: "vspGwjDxROQ-",
} as const;

function live(input: {
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

function diagram(key: string, title: string, localPath: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase180",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase180",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；示意图，非产品照片，不证明比例、颜色、重量或库存。",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true`,
  };
}

const S = {
  official: live({ key: "phase180-jinhao-official", title: "Jinhao 官方产品站", url: "https://jinhaoproducts.com/", registryKey: "jinhaoproducts-phase180", registryName: "Jinhao Products", sourceType: "official", tier: "contemporary_archive", summary: "官方站提供 Jinhao 当代品牌与型号目录语境；不据此臆造未列型号的统一尺寸或材质。", locator: "brand and model navigation" }),
  collection: live({ key: "phase180-jinhao-collection", title: "TTpen Jinhao 产品集合", url: "https://www.ttpen.com/collections/jinhao", registryKey: "ttpen-jinhao-phase180", registryName: "TTpen", sourceType: "retailer", tier: "contemporary_archive", summary: "零售集合用于确认型号并列、当代销售与颜色／尖号 SKU 语境，不承担历史和全批次公差。", locator: "Jinhao collection cards and SKU context" }),
  p75Review: live({ key: "phase180-jinhao-75-shinowan", title: "しのわん：JINHAO 75 评测", url: "https://shinowanblog.com/fountain-pen-jinhao-75/", registryKey: "shinowan-jinhao-75-phase180", registryName: "しのわんブログ", sourceType: "blog", tier: "professional_secondary", summary: "日文实测记录 Jinhao 75 的金属笔身、尺寸重量、嵌合帽、converter 与书写体验。", locator: "75 dimensions, weight, cap and writing sample" }),
  p75Fpn: live({ key: "phase180-jinhao-75-fpn", title: "Fountain Pen Network：Jinhao 75 讨论", url: "https://www.fountainpennetwork.com/forum/topic/354377-jinhao-75-not-x750/", registryKey: "fpn-jinhao-75-phase180", registryName: "Fountain Pen Network", sourceType: "forum", tier: "community", summary: "玩家讨论把 75 与 X750 分开，并记录金属、黑／银饰件、标准钢尖与个体手感差异。", locator: "75 versus X750 identity and sample observations" }),
  p75Pdf: live({ key: "phase180-jinhao-75-pdf", title: "Il Pennofilo：JINHAO 75 HongYun 测量表", url: "https://www.ilpennofilo.it/wp-content/uploads/2021/07/JINHAO-75-HONGYUN.pdf", registryKey: "ilpennofilo-jinhao-75-phase180", registryName: "Il Pennofilo", sourceType: "blog", tier: "contemporary_archive", summary: "公开测量表给出 75 HongYun 样本的长度、直径和重量；数值仅适用于该颜色和样本。", locator: "75 HongYun dimensional sheet" }),
  p619Review: live({ key: "phase180-jinhao-619-skilltoyz", title: "SkillToyz：Jinhao 619 Fountain Pen", url: "https://skilltoyz.com/jinhao-619-fountain-pen-magenta-gloss-f-nib/", registryKey: "skilltoyz-jinhao-619-phase180", registryName: "SkillToyz", sourceType: "retailer", tier: "retailer", summary: "零售页面确认 619 型号、颜色和 F 尖 SKU；不把单一 magenta 商品描述扩展到全系列。", locator: "619 product title and F nib SKU" }),
  p619Fpn: live({ key: "phase180-jinhao-619-fpn", title: "Fountain Pen Network：Jinhao 619 使用讨论", url: "https://www.fountainpennetwork.com/forum/topic/393536-jinhao-619/", registryKey: "fpn-jinhao-619-phase180", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", summary: "玩家讨论 619 的薄型、漆面、钢尖与个体出墨；只作为使用旁证。", locator: "619 user impressions and quality variation" }),
  p313Review: live({ key: "phase180-jinhao-313-mysku", title: "Mysku：Jinhao 313 评测", url: "https://mysku.club/blog/usa-stores/105930.html", registryKey: "mysku-jinhao-313-phase180", registryName: "Mysku reviewer", sourceType: "blog", tier: "professional_secondary", summary: "俄文实测记录 313 的低价塑料路线、笔尖与上墨体验；不把作者个体称为工厂规格。", locator: "313 construction and writing review" }),
  p313Catalog: live({ key: "phase180-jinhao-313-catalog", title: "Jinhao Penography 型号目录", url: "https://4mul8.wordpress.com/jinhao-penography/", registryKey: "4mul8-jinhao-313-phase180", registryName: "4mul8", sourceType: "blog", tier: "contemporary_archive", summary: "型号目录用于确认 313 的名称边界，与 992、82 等树脂型号分开。", locator: "Jinhao model index and 313 entry" }),
  p80Pdf: live({ key: "phase180-jinhao-80-pdf", title: "Il Pennofilo：JINHAO 80 测量表", url: "https://www.ilpennofilo.it/wp-content/uploads/2023/03/JINHAO-80.pdf", registryKey: "ilpennofilo-jinhao-80-phase180", registryName: "Il Pennofilo", sourceType: "blog", tier: "professional_secondary", summary: "公开测量表给出 80 的样本长度、直径、重量和 F 尖记录；不同饰件和批次需复测。", locator: "80 dimensions and writing sample sheet" }),
  p80Review: live({ key: "phase180-jinhao-80-reddit", title: "Reddit：Jinhao 80 使用记录", url: "https://www.reddit.com/r/fountainpens/comments/12ngw65", registryKey: "reddit-jinhao-80-phase180", registryName: "r/fountainpens participants", sourceType: "reddit", tier: "community", summary: "用户将 80 与 Lamy 2000 比较并记录笔身品质、尖型差异；不据此声称零件兼容。", locator: "80 material and nib comparison" }),
  p9035Review: live({ key: "phase180-jinhao-9035-reddit", title: "Reddit：NPD Jinhao 9035", url: "https://www.reddit.com/r/fountainpens/comments/1plzicb/npd_jinhao_9035/", registryKey: "reddit-jinhao-9035-phase180", registryName: "r/fountainpens participants", sourceType: "reddit", tier: "professional_secondary", summary: "用户记录 9035 木杆、F 尖、螺纹精度与后续起笔问题；属于单支使用记录。", locator: "9035 wooden body, F nib and hard-start follow-up" }),
  p9035Catalog: live({ key: "phase180-jinhao-9035-collection", title: "TTpen Jinhao 集合（9035 型号语境）", url: "https://www.ttpen.com/collections/jinhao", registryKey: "ttpen-jinhao-9035-phase180", registryName: "TTpen", sourceType: "retailer", tier: "retailer", summary: "零售集合提供 Jinhao 当代木杆／日用型号的销售语境；不承担 9035 的统一尺寸。", locator: "Jinhao wood-bodied model catalogue context" }),
  p9056Review: live({ key: "phase180-jinhao-9056-fpn", title: "Fountain Pen Network：Jinhao 9056 Tiger Skin Ebony", url: "https://www.fountainpennetwork.com/forum/topic/374182-jinhao-9056-tiger-skin-ebony/", registryKey: "fpn-jinhao-9056-phase180", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", summary: "玩家长期记录 9056 天然木材、约 1 ml cartridge、硬钢尖和耐久性；不代表所有木种。", locator: "9056 wood, filling and two-year storage observations" }),
  p9056Pdf: live({ key: "phase180-jinhao-9056-pdf", title: "Il Pennofilo：JINHAO 9056 测量表", url: "https://www.ilpennofilo.it/wp-content/uploads/2021/06/JINHAO-9056.pdf", registryKey: "ilpennofilo-jinhao-9056-phase180", registryName: "Il Pennofilo", sourceType: "blog", tier: "contemporary_archive", summary: "测量表提供 9056 M 尖样本的长度、直径与重量；颜色、木种和配件仍按实物核对。", locator: "9056 M dimensional sheet" }),
  p9056Cn: live({ key: "phase180-jinhao-9056-cn", title: "钢笔爱好者：金豪 9056 木杆钢笔评测", url: "https://www.nonopen.com/12507.html", registryKey: "nonopen-jinhao-9056-phase180", registryName: "钢笔爱好者", sourceType: "blog", tier: "professional_secondary", summary: "中文评测补充 9056 木杆、笔帽内衬、粗细和购买检查要点；不替代工厂参数。", locator: "9056 wooden construction and care notes" }),
  pCenturyFpn: live({ key: "phase180-jinhao-century-fpn", title: "Fountain Pen Network：Jinhao Century Mk 2", url: "https://www.fountainpennetwork.com/forum/topic/220345-jinhao-century-mk-2/", registryKey: "fpn-jinhao-century-phase180", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", summary: "早期评测明确区分 Jinhao Century 与后来的 Century 100／Centennial，避免把系列名混作同一型号。", locator: "Century Mk 2 historical identity boundary" }),
  pCenturyReview: live({ key: "phase180-jinhao-century-neil", title: "Neil's Unique Pens：Jinhao Century 100", url: "https://www.neilspens.com/blog/pen-review-jinhao-century-100-acrylic-fountain-pen", registryKey: "neilspens-jinhao-century-phase180", registryName: "Neil's Unique Pens", sourceType: "blog", tier: "professional_secondary", summary: "独立评测记录 acrylic Century 100 的约 5 7/16 英寸合盖、converter 和镀金钢尖样本。", locator: "Century 100 acrylic, length and nib review" }),
  pCenturyRetail: live({ key: "phase180-jinhao-century-ttpen", title: "TTpen：Jinhao Century 100 产品比较", url: "https://www.ttpen.co.uk/blogs/news/jinhao-fountain-pen-comparison-82-vs-x159-vs-century-100-vs-10-capless-which-one-is-right-for-you", registryKey: "ttpen-jinhao-century-phase180", registryName: "TTpen", sourceType: "retailer", tier: "contemporary_archive", summary: "当代比较文章把 Century 100 与 82、X159、10 分开，提供市场定位和 converter 语境。", locator: "Century 100 contemporary comparison" }),
  pSilverReview: live({ key: "phase180-jinhao-silver-nonopen", title: "钢笔爱好者：金豪纯银版镂空世纪评测", url: "https://www.nonopen.com/52786.html", registryKey: "nonopen-jinhao-silver-century-phase180", registryName: "钢笔爱好者", sourceType: "blog", tier: "professional_secondary", summary: "中文评测记录镂空世纪纯银版的 S925 刻字、球夹、浅色透明配色和银色 converter；对顶帽材质保持存疑。", locator: "S925 marking, trim and converter observations" }),
  pSilverFpn: live({ key: "phase180-jinhao-silver-fpn", title: "Fountain Pen Network：Jinhao 纯银镂空世纪讨论", url: "https://www.fountainpennetwork.com/forum/topic/372342-new-chinese-pens-2023/", registryKey: "fpn-jinhao-silver-century-phase180", registryName: "Fountain Pen Network", sourceType: "forum", tier: "community", summary: "收藏者讨论 S925 镂空世纪与普通 Century 100 的版本边界，不把讨论当成重量或含银量证明。", locator: "2023 Chinese pen thread and sterling-silver variant boundary" }),
  pSilverRetail: live({ key: "phase180-jinhao-silver-collection", title: "Jinhao 当代集合页", url: "https://jinhaoproducts.com/", registryKey: "jinhaoproducts-silver-century-phase180", registryName: "Jinhao Products", sourceType: "official", tier: "contemporary_archive", summary: "官方产品站只用于品牌和当代产品语境；纯银标记和每批次配色以实物与专业评测为准。", locator: "official brand context; no unsupported silver purity inference" }),
  svg313: diagram("phase180-jinhao-313-svg", "Jinhao 313 结构事实图", "/images/library/site-original/phase180/jinhao/313.svg"),
  svg619: diagram("phase180-jinhao-619-svg", "Jinhao 619 结构事实图", "/images/library/site-original/phase180/jinhao/619.svg"),
  svg75: diagram("phase180-jinhao-75-svg", "Jinhao 75 结构事实图", "/images/library/site-original/phase180/jinhao/75.svg"),
  svg80: diagram("phase180-jinhao-80-svg", "Jinhao 80 结构事实图", "/images/library/site-original/phase180/jinhao/80.svg"),
  svg9035: diagram("phase180-jinhao-9035-svg", "Jinhao 9035 结构事实图", "/images/library/site-original/phase180/jinhao/9035.svg"),
  svg9056: diagram("phase180-jinhao-9056-svg", "Jinhao 9056 结构事实图", "/images/library/site-original/phase180/jinhao/9056.svg"),
  svgCentury: diagram("phase180-jinhao-century-svg", "Jinhao Century 结构事实图", "/images/library/site-original/phase180/jinhao/century.svg"),
  svgSilver: diagram("phase180-jinhao-silver-century-svg", "Jinhao 纯银镂空世纪结构事实图", "/images/library/site-original/phase180/jinhao/silver-century.svg"),
};

function evidence(fieldKey: SpecFieldKey, key: string, sourceKey: string, scopeKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey, locator, qualifies: true };
}

type PenInput = {
  id: string; slug: string; name: string; key: string; title: string; summary: string; markdownFile: string;
  primary: CuratedSource; secondary: CuratedSource; tertiary: CuratedSource; image: CuratedSource;
  identity: string; boundary: string; care: string; series: string; release: string; nib: string; fill: string;
  material: string; dimensions: string; weight: string; status: string; aliases?: string[]; variants: CuratedEntityPack["variants"];
};

function makePen(input: PenInput): CuratedEntityPack {
  const scope = `phase180-${input.key}-scope`;
  const sources = Array.from(new Map([S.official, S.collection, input.primary, input.secondary, input.tertiary, input.image].map((source) => [source.key, source])).values());
  const claim = (key: string, predicate: string, objectText: string, source: CuratedSource, extra?: CuratedSource): CuratedEntityPack["claims"][number] => ({
    key, predicate, objectText, factClass: predicate === "maintenance_boundary" ? "editorial" : "core", confidence: 0.96,
    sourceKey: source.key, locator: source.summary,
    evidence: [{ key: `${key}-evidence`, sourceKey: source.key, scopeKey: scope, locator: source.summary }, ...(extra ? [{ key: `${key}-secondary`, sourceKey: extra.key, scopeKey: scope, locator: extra.summary }] : [])],
  });
  const aliases = [input.name, ...(input.aliases ?? [])];
  return {
    key: `phase180-${input.key}-v1`, entityId: input.id, expectedType: "pen", expectedSlug: input.slug, canonicalName: input.name,
    publicationIntent: "publish", publicationBlockers: [], markdownFile: input.markdownFile, storyTitle: input.title,
    primarySourceKey: input.primary.key, depthTier: "B", aliases: aliases.map((alias) => ({ alias, language: /[\u4e00-\u9fff]/.test(alias) ? "zh" : "en", sourceKey: input.primary.key })), sources,
    scopes: [{ key: scope, scopeKey: scope, validFrom: RETRIEVED, productionState: "current", materialScope: input.material, nibScope: input.nib, editionScope: "当代市场型号；颜色、木种、饰件、尖号、converter 与库存按具体 SKU 核对。" }],
    claims: [claim(`${input.key}-identity`, "model_identity", input.identity, input.primary, S.official), claim(`${input.key}-boundary`, "version_boundary", input.boundary, input.secondary, S.collection), claim(`${input.key}-care`, "maintenance_boundary", input.care, input.tertiary)],
    variants: input.variants,
    spec: { brandEntityId: PHASE179_JINHAO_BRAND_ID, values: { series_name: input.series, release_year: input.release, origin_country: "Jinhao 中国产品线；具体制造地点与批次按实物或商品页核对", nib: input.nib, fill_system: input.fill, material: input.material, dimensions: input.dimensions, weight: input.weight, status: input.status }, evidence: [
      evidence("brand_entity_id", `${input.key}-brand`, S.official.key, scope, "Jinhao brand context"), evidence("series_name", `${input.key}-series`, input.primary.key, scope, input.primary.summary), evidence("release_year", `${input.key}-release`, input.secondary.key, scope, "dated review or contemporary catalogue window"), evidence("origin_country", `${input.key}-origin`, S.official.key, scope, "Jinhao manufacturer context without factory inference"), evidence("nib", `${input.key}-nib`, input.primary.key, scope, input.primary.summary), evidence("fill_system", `${input.key}-fill`, input.primary.key, scope, input.primary.summary), evidence("material", `${input.key}-material`, input.secondary.key, scope, input.secondary.summary), evidence("dimensions", `${input.key}-dimensions`, input.secondary.key, scope, input.secondary.summary), evidence("weight", `${input.key}-weight`, input.secondary.key, scope, input.secondary.summary), evidence("status", `${input.key}-status`, S.collection.key, scope, S.collection.summary),
    ] },
    timeline: [{ key: `${input.key}-current`, title: `${input.name} 的当代资料窗口`, eventType: "model_released", startDate: RETRIEVED, circa: true, description: input.summary, sourceKey: input.primary.key }],
    media: [{ key: `${input.key}-primary-media`, title: `${input.name} 结构事实图（非产品照片）`, sourceKey: input.image.key, localPath: input.image.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；示意图，非产品照片；not-to-scale、non-colour-proof。", sourceUrl: input.image.url, usageStatus: "primary" }],
  };
}

const brandPack = phase179JinhaoPacks.find((pack) => pack.expectedType === "brand");
if (!brandPack) throw new Error("Phase 180 Jinhao brand prerequisite is missing.");
const brand = structuredClone(brandPack);

export const phase180JinhaoPacks: CuratedEntityPack[] = [
  brand,
  makePen({ id: PHASE180_IDS.model313, slug: "金豪-jinhao-313", name: "金豪 Jinhao 313", key: "jinhao-313", title: "Jinhao 313：低价钢尖日用笔", summary: "Jinhao 313 是独立的平价 cartridge/converter 钢笔；塑料外壳、钢尖和批次差异应以实物核对。", markdownFile: ".planning/content-research/jinhao-313-phase180.md", primary: S.p313Review, secondary: S.p313Catalog, tertiary: S.p619Fpn, image: S.svg313, identity: "Jinhao 313 是 Jinhao 的独立型号，不应因为外形或低价而并入 992、619 或 82；公开评测所见为塑料笔身、钢尖和 cartridge/converter 路线。", boundary: "颜色、饰件、F/EF 或其他线宽、converter 是否随附属于市场 SKU；评测中的单支笔尖和出墨不可外推为统一规格。", care: "换墨时使用常温清水吸排并自然干燥；不以针、热水、酒精或金属工具处理塑料握位和钢尖，持续断墨应先记录样本。", series: "Jinhao 313", release: "当代市场型号；公开评测窗口约 2025–2026", nib: "常见钢尖；线宽和硬度按具体 SKU 核对", fill: "cartridge/converter；接口和随附配件按商品页核对", material: "塑料／树脂笔身与笔帽，金属夹和钢尖", dimensions: "公开统一尺寸未固定；按实物量测", weight: "公开统一重量未固定；轻量日用路线", status: "当代市场可见；颜色、尖号和配件随渠道变化", aliases: ["Jinhao 313"], variants: [{ key: "phase180-313-colors", name: "颜色与尖号 SKU", notes: "不把销售颜色或个体笔尖另建型号。", sourceKey: S.p313Review.key, variantKind: "market_sku", market: "Global" }] }),
  makePen({ id: PHASE180_IDS.model619, slug: "金豪-jinhao-619", name: "金豪 Jinhao 619", key: "jinhao-619", title: "Jinhao 619：纤细漆面日用路线", summary: "Jinhao 619 以纤细外形、漆面金属路线和 cartridge/converter 钢尖为识别点；实际批次需复核。", markdownFile: ".planning/content-research/jinhao-619-phase180.md", primary: S.p619Review, secondary: S.p619Fpn, tertiary: S.collection, image: S.svg619, identity: "Jinhao 619 是独立的细长日用型号，零售资料可见 magenta gloss F 尖 SKU；它不等于 Jinhao 601、Lamy AL-star 或其他外形相似的笔。", boundary: "漆面颜色、F/EF 尖号、夹子电镀与 converter 随商品变化；薄壁或小握位的个体感受不能替代制造规格。", care: "用常温水清洗 converter 和握位，擦干漆面后再收纳；避免热水、酒精、硬刷和长期夹在厚口袋边缘。", series: "Jinhao 619", release: "当代市场型号；至少 2025 年仍有零售记录", nib: "常见 F 钢尖，其他线宽按 SKU 核对", fill: "cartridge/converter；容量和接口按实物核对", material: "漆面金属／塑料组合，金属夹和钢尖", dimensions: "纤细中等长度；公开统一尺寸未固定", weight: "薄型日用路线；不同漆面和饰件需量测", status: "当代市场可见；颜色和尖号按渠道变化", aliases: ["Jinhao 619"], variants: [{ key: "phase180-619-finish", name: "Magenta gloss 与其他漆面", notes: "颜色是市场版本，不单独拆实体。", sourceKey: S.p619Review.key, variantKind: "color", market: "Global" }] }),
  makePen({ id: PHASE180_IDS.model75, slug: "金豪-jinhao-75", name: "金豪 Jinhao 75", key: "jinhao-75", title: "Jinhao 75：金属笔身的细长钢笔", summary: "Jinhao 75 是金属笔身、嵌合帽与 converter 的细长型号，不能与 X750 混名；尺寸和手感按样本核对。", markdownFile: ".planning/content-research/jinhao-75-phase180.md", primary: S.p75Review, secondary: S.p75Pdf, tertiary: S.p75Fpn, image: S.svg75, identity: "Jinhao 75 是独立于 X750 的细长金属笔身型号；实测样本约 132–134 mm 合盖、约 27 g，配标准钢尖和 converter。", boundary: "黑色、银色、红色饰环与不同尖号属于颜色／市场变体；75 的嵌合帽、尺寸和重心不能复制到 X750 或 619。", care: "嵌合帽应沿轴线轻推取下，不要扭拧夹子；常温清水清洗 converter，漆面和饰环避免溶剂与磨料。", series: "Jinhao 75", release: "约 2020 年前后已有公开评测", nib: "常见 F 钢尖；线宽按个体核对", fill: "cartridge/converter，公开评测记录随附 converter", material: "金属笔身、塑料握位、金属笔帽与饰件", dimensions: "参考样本合盖约 132–134 mm、直径约 10–11 mm", weight: "参考样本约 27–27.3 g；按饰件和墨水核对", status: "当代市场可见；颜色、尖号和库存随渠道变化", aliases: ["Jinhao 75", "HongYun 75"], variants: [{ key: "phase180-75-hongyun", name: "HongYun／黑银饰件版本", notes: "名称和配色归入变体，仍指向 75。", sourceKey: S.p75Pdf.key, variantKind: "color", market: "Global" }] }),
  makePen({ id: PHASE180_IDS.model80, slug: "金豪-jinhao-80", name: "金豪 Jinhao 80", key: "jinhao-80", title: "Jinhao 80：轻量现代夹笔轮廓", summary: "Jinhao 80 是轻量 cartridge/converter 钢笔；外形比较不能证明与 Lamy 2000 共用零件。", markdownFile: ".planning/content-research/jinhao-80-phase180.md", primary: S.p80Pdf, secondary: S.p80Review, tertiary: S.collection, image: S.svg80, identity: "Jinhao 80 是独立的现代细长钢笔，公开测量表和玩家记录均把它作为独立型号；与 Lamy 2000 的外观或握持比较不构成品牌、专利或零件关系。", boundary: "F 尖、颜色、夹子与 converter 由 SKU 决定；不能把玩家认为‘像’某品牌的外观写成仿制或兼容结论。", care: "以常温水清洗并保持帽内干燥，避免用溶剂处理漆面；出墨异常先检查 converter 插接和尖齿，不要强行扩大缝隙。", series: "Jinhao 80", release: "当代市场型号；2023 年已有公开测量记录", nib: "常见 F 钢尖；实际线宽可能偏粗或偏细", fill: "cartridge/converter；随附 converter 按订单核对", material: "轻量树脂或涂层笔身，金属夹和钢尖", dimensions: "以 Il Pennofilo 样本为准；不同版本需复测", weight: "公开样本为轻量路线；不作全批次固定值", status: "当代市场可见；颜色与尖号随渠道变化", aliases: ["Jinhao 80"], variants: [{ key: "phase180-80-f-nib", name: "F 尖与颜色版本", notes: "线宽和颜色归入 SKU。", sourceKey: S.p80Pdf.key, variantKind: "nib", market: "Global" }] }),
  makePen({ id: PHASE180_IDS.model9035, slug: "金豪-jinhao-9035", name: "金豪 Jinhao 9035", key: "jinhao-9035", title: "Jinhao 9035：木杆书写样本", summary: "Jinhao 9035 是木杆 cartridge/converter 钢笔；木材和笔尖状态需按单支检查，不能把一次起笔反馈当成全系规格。", markdownFile: ".planning/content-research/jinhao-9035-phase180.md", primary: S.p9035Review, secondary: S.p9035Catalog, tertiary: S.collection, image: S.svg9035, identity: "Jinhao 9035 是以木质外观为识别点的独立型号，公开样本配 F 钢尖并使用螺纹帽；不能与 9056、9036 或其他木杆型号混写。", boundary: "木种、纹理、颜色、F 尖和金属饰件是市场变体；用户后续反馈的起笔困难说明个体调校需复核，不是型号的必然特征。", care: "木杆应避免长时间浸水、暴晒和高湿骤干；清洗时只冲握位和 converter，擦干木件后让其自然回温，不用油或酒精临时补救。", series: "Jinhao 9035", release: "至少 2025 年已有公开使用记录", nib: "公开样本为 F 钢尖；线宽和起笔按个体核对", fill: "cartridge/converter；容量与随附件按 SKU 核对", material: "木杆、塑料内衬／握位及金属夹和钢尖", dimensions: "公开统一尺寸未固定；按木杆版本量测", weight: "木材密度差异明显；不作全批次固定值", status: "当代市场可见；木种、颜色和尖号随渠道变化", aliases: ["Jinhao 9035"], variants: [{ key: "phase180-9035-wood", name: "不同木纹与颜色", notes: "天然纹理不构成独立型号。", sourceKey: S.p9035Review.key, variantKind: "material", market: "Global" }] }),
  makePen({ id: PHASE180_IDS.model9056, slug: "金豪-jinhao-9056木杆", name: "金豪 Jinhao 9056 木杆", key: "jinhao-9056", title: "Jinhao 9056：天然木杆与金属笔帽", summary: "Jinhao 9056 以天然木杆、金属夹与螺纹帽为识别点；木种、耐久性和尖号差异按实物判断。", markdownFile: ".planning/content-research/jinhao-9056-phase180.md", primary: S.p9056Review, secondary: S.p9056Pdf, tertiary: S.p9056Cn, image: S.svg9056, identity: "Jinhao 9056 是天然木杆 cartridge/converter 钢笔；F/M 钢尖、约 1 ml 级墨囊和木杆笔帽内衬见于公开样本，不应与 9035 的身份互换。", boundary: "虎纹乌木、胡桃木及其他木色是材料／颜色变体；S925、金色或黑色夹子和不同尖号不自动构成新型号。", care: "避免水分滞留在木杆端面和帽口，清洁后彻底擦干；木材出现裂纹、松动或异味时停止上墨，不用强力压帽或自行灌胶。", series: "Jinhao 9056", release: "约 2021 年起有公开目录和评测记录", nib: "常见 F／M 钢尖；公开样本记录硬而顺滑，仍需逐支核对", fill: "cartridge/converter；公开样本约 1 ml 级墨量语境", material: "天然木杆、塑料内衬／握位、金属笔帽和夹子", dimensions: "公开测量表按具体 M 尖样本；版本差异需复测", weight: "受木种和金属件影响；不作统一重量", status: "当代市场可见；木种、饰件和尖号随渠道变化", aliases: ["Jinhao 9056", "9056 木杆钢笔"], variants: [{ key: "phase180-9056-wood", name: "Tiger Skin Ebony 与其他木种", notes: "天然木纹和木种进入变体层，不另建实体。", sourceKey: S.p9056Review.key, variantKind: "material", market: "Global" }] }),
  makePen({ id: PHASE180_IDS.modelCentury, slug: "金豪-jinhao-世纪-century", name: "金豪 Jinhao Century", key: "jinhao-century", title: "Jinhao Century：早期世纪系列边界", summary: "Jinhao Century 是早期世纪路线；不能把 Century、Century 100 与 Centennial 三个名称混成一页。", markdownFile: ".planning/content-research/jinhao-century-phase180.md", primary: S.pCenturyFpn, secondary: S.pCenturyReview, tertiary: S.pCenturyRetail, image: S.svgCentury, identity: "Jinhao Century 是早期的 Duofold 风格树脂／赛璐珞路线型号；Fountain Pen Network 明确把它与后来的 Century 100／Centennial 分开，页面只记录这一身份边界。", boundary: "Century Mk 2、不同树脂颜色和球形夹属于早期系列内的版本语境；Century 100／Centennial 是后续另一个公开命名，不能用其规格补写本页。", care: "老库存或二手笔先检查树脂、螺纹、饰环和 converter 是否老化；用常温水清洗，不用热水、酒精或抛光剂处理未知树脂。", series: "Jinhao Century", release: "早期型号；2012 年已有 Mk 2 评测记录", nib: "公开样本为钢尖；尖号和线宽随版本核对", fill: "cartridge/converter；老库存 converter 需检查密封", material: "树脂／赛璐珞外观笔身、塑料握位和金属饰件", dimensions: "早期公开统一尺寸未固定；按具体版本量测", weight: "受树脂和饰件影响；不作统一值", status: "历史／老库存型号；当代仍可能以二手或渠道余货出现", aliases: ["Jinhao Century", "金豪世纪"], variants: [{ key: "phase180-century-mk2", name: "Century Mk 2 与颜色版本", notes: "不并入 Century 100／Centennial。", sourceKey: S.pCenturyFpn.key, variantKind: "edition_group", market: "Global" }] }),
  makePen({ id: PHASE180_IDS.modelSilverCentury, slug: "金豪-jinhao-纯银镂空世纪", name: "金豪 Jinhao 纯银镂空世纪", key: "jinhao-silver-century", title: "金豪纯银镂空世纪：S925 标记的特殊版本", summary: "金豪纯银镂空世纪以 S925 标记、镂空外壳和透明配色识别；顶帽材质与含银量不能臆测，购买需核对实物。", markdownFile: ".planning/content-research/jinhao-silver-century-phase180.md", primary: S.pSilverReview, secondary: S.pSilverFpn, tertiary: S.pSilverRetail, image: S.svgSilver, identity: "金豪纯银镂空世纪是 Century 100／世纪路线的特殊市场版本，公开评测记录笔帽对面有 S925 字样、镂空壳和银色 converter；S925 标记不等于整支笔所有部件均为纯银。", boundary: "透明白、浅紫、浅粉、贝加尔湖蓝等配色、球夹与银色 converter 属于该版本的市场变体；普通 Century、Century 100 和无 S925 标记款不要合并到本页。", care: "按金属饰件与树脂双重要求维护：常温水清洗、彻底擦干，避免酒精、漂白剂和粗糙抛光布；银色表面变色先咨询卖家，不用强磨损去除。", series: "Jinhao Century 纯银镂空版本", release: "约 2023 年有公开评测记录", nib: "钢尖；具体 F/M/其他尖号按 SKU 核对", fill: "cartridge/converter；公开评测记录银色 converter", material: "透明树脂／镂空外壳、金属饰件；笔帽有 S925 标记但各部件材质需核对", dimensions: "沿用 Century 100 级别的大型路线；具体版本需量测", weight: "银饰件、树脂和 converter 会造成批次差异；无可靠统一值", status: "当代限量／市场版本可见；颜色与库存变化快", aliases: ["Jinhao S925 Skeleton Century", "金豪纯银版镂空世纪"], variants: [{ key: "phase180-silver-century-colors", name: "S925 镂空世纪浅色透明配色", notes: "颜色和饰件是市场 SKU，不把顶帽存疑材质写成已证实纯银。", sourceKey: S.pSilverReview.key, variantKind: "material", market: "Global" }] }),
];
