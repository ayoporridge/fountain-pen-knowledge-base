import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase23MajohnPacks } from "./phase23-majohn";

const RETRIEVED = "2026-07-25";
export const PHASE181_MAJOHN_BRAND_ID = "TfXerdAZ5iWg";
export const PHASE181_IDS = {
  q1: "FGW7K6dv4Dry",
  m2: "f1DaQYtCJVMk",
  p140: "GxLe3PSmZALi",
  p141: "gC8zhkSOlQiH",
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
    homepageUrl: new URL(input.url).origin,
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
    registryKey: "fountain-pen-graph-editorial-phase181",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase181",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: "本站原创 factual SVG；示意图，非产品照片，不证明比例、颜色、重量或库存。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;not-to-scale=true`,
  };
}

const S = {
  q1Sbre: live({ key: "phase181-majohn-q1-sbre", title: "SBreBrown：Majohn Q1 Fountain Pen Review", url: "https://www.sbrebrown.com/2023/04/majohn-q1-fountain-pen-review/", registryKey: "sbrebrown-majohn-q1-phase181", registryName: "SBreBrown", sourceType: "blog", tier: "professional_secondary", summary: "独立评测记录 Q1 的合盖、未合盖与帖帽长度、握位尺寸、重量和直灌结构；量测属于该样本。", locator: "measurements, eyedropper filling and writing sections" }),
  q1Paperemm: live({ key: "phase181-majohn-q1-paperemm", title: "Paperem：Majohn Q1", url: "https://www.paperemm.com/stationery/majohn-q1", registryKey: "paperemm-majohn-q1-phase181", registryName: "Paperem", sourceType: "blog", tier: "professional_secondary", summary: "实测记录 Q1 的透明外壳、粗握位、旋盖、随附滴管和适合长时间书写的手感。", locator: "construction, accessory and grip observations" }),
  q1Writing: live({ key: "phase181-majohn-q1-writing", title: "Writing at Large：Majohn Q1 Bent Nib Review", url: "https://writingatlarge.com/2023/07/21/majohn-q1-bent-nib-fude-fountain-pen-review/", registryKey: "writingatlarge-majohn-q1-phase181", registryName: "Writing at Large", sourceType: "blog", tier: "professional_secondary", summary: "弯尖评测解释 Q1 的 fude 线宽变化、备用普通尖和 O 形圈体验；不外推到每个 SKU。", locator: "fude nib, line variation and eyedropper maintenance" }),
  q1Fabulous: live({ key: "phase181-majohn-q1-fabulous", title: "The Fabulous Scientist：Majohn Q1 Review", url: "https://thefabulousscientist.com/2025/05/31/review-majohn-q1-demonstrator-fountain-pen-fine-nib/", registryKey: "fabulousscientist-majohn-q1-phase181", registryName: "The Fabulous Scientist", sourceType: "blog", tier: "professional_secondary", summary: "透明 Q1 细尖样本补充旋盖、O 形圈和日用书写观察；属于单支评测。", locator: "clear demonstrator, cap and fine-nib sample" }),
  m2Ttpen: live({ key: "phase181-majohn-m2-ttpen", title: "TTpen：Majohn M2 Transparent Eyedropper", url: "https://www.ttpen.com/products/majohn-m2-transparent-eye-dropper-filling-fountain-pen", registryKey: "ttpen-majohn-m2-phase181", registryName: "TTpen", sourceType: "retailer", tier: "contemporary_archive", summary: "零售页面确认 M2 透明直灌、尖号和大墨仓销售语境；容量与附件仍按 SKU 核对。", locator: "product title, filling system and nib options" }),
  m2Guide: live({ key: "phase181-majohn-m2-guide", title: "Fountain Pen Guide：Eyedropper Fountain Pen", url: "https://fountainpenguide.com/eyedropper-fountain-pen/", registryKey: "fountainpenguide-majohn-m2-phase181", registryName: "Fountain Pen Guide", sourceType: "blog", tier: "professional_secondary", summary: "独立资料记录 M2 约 5 ml 墨仓语境、细尖和单支书写表现；数值不是所有批次的保证。", locator: "M2 reservoir estimate and writing sample" }),
  m2Fpn: live({ key: "phase181-majohn-m2-fpn", title: "Fountain Pen Network：Majohn M2 with FPR Ultra Flex", url: "https://www.fountainpennetwork.com/forum/topic/375929-majohn-m2-with-fpr-ultra-flex-55-nib-fpr-classic-black-ink-and-a-dash-of-photo-flo/", registryKey: "fpn-majohn-m2-phase181", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", summary: "玩家讨论 M2 直灌、替换柔性尖和墨水添加物；用于区分结构与个体实验。", locator: "M2 eyedropper and nib experiment discussion" }),
  m2Collection: live({ key: "phase181-majohn-m2-collection", title: "Majohn 当代产品集合：M2 型号语境", url: "https://www.majohnpen.com/", registryKey: "majohn-official-phase181", registryName: "Majohn", sourceType: "official", tier: "contemporary_archive", summary: "品牌产品语境用于确认 Majohn 名称和当代型号边界；不从导航页臆造尺寸。", locator: "contemporary model navigation" }),
  p140Sbre: live({ key: "phase181-majohn-p140-sbre", title: "SBreBrown：Moonman P140 Fountain Pen Review", url: "https://www.sbrebrown.com/2026/02/moonman-p140-fountain-pen-review/", registryKey: "sbrebrown-majohn-p140-phase181", registryName: "SBreBrown", sourceType: "blog", tier: "professional_secondary", summary: "独立评测确认 P140 的大号透明示范和活塞定位；书写细节属于评测样本。", locator: "P140 shape, filling and writing review" }),
  p140Rupert: live({ key: "phase181-majohn-p140-rupert", title: "Rupert Arzeian：Early thoughts on the Majohn P140", url: "https://rupertarzeian.com/2026/04/22/early-thoughts-on-the-majohn-p140-fountain-pen/", registryKey: "rupertarzeian-majohn-p140-phase181", registryName: "Rupert Arzeian", sourceType: "blog", tier: "professional_secondary", summary: "样本记录 P140 的透明外壳、#8 尖、乌木进墨件、黄铜活塞、尺寸重量及 F 尖写感。", locator: "measurements, piston materials and nib sample" }),
  p140Fpn: live({ key: "phase181-majohn-p140-fpn", title: "Fountain Pen Network：Majohn P140 introduced", url: "https://www.fountainpennetwork.com/forum/topic/378730-majohn-p140-introduced/", registryKey: "fpn-majohn-p140-phase181", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", summary: "同期讨论确认 P140 的型号发布和大型笔身定位；社区内容不承担制造公差。", locator: "introduction thread and model identity" }),
  p140Fabulous: live({ key: "phase181-majohn-p140-fabulous", title: "The Fabulous Scientist：Why the Majohn P140 is a must-have", url: "https://thefabulousscientist.com/2026/06/17/why-the-majohn-p140-is-a-must-have-for-pen-collectors/", registryKey: "fabulousscientist-majohn-p140-phase181", registryName: "The Fabulous Scientist", sourceType: "blog", tier: "professional_secondary", summary: "收藏向评测补充 P140 的雪茄形比例和活塞存在感；作为当代旁证。", locator: "cigar shape and piston collector context" }),
  p141Fpn: live({ key: "phase181-majohn-p141-fpn", title: "Fountain Pen Network：Majohn P141 non-demo P140", url: "https://www.fountainpennetwork.com/forum/topic/379277-majohn-p141-non-demo-p140/", registryKey: "fpn-majohn-p141-phase181", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", summary: "讨论把 P141 作为非示范路线与 P140 分开，并记录 #8 标准刻花尖、初期 F 尖和颜色。", locator: "P141 identity, nib and color boundary" }),
  p141Ti: live({ key: "phase181-majohn-p141-ti141", title: "Fountain Pen Network：Ti141", url: "https://www.fountainpennetwork.com/forum/topic/380051-majohn-ti141/", registryKey: "fpn-majohn-ti141-phase181", registryName: "Fountain Pen Network", sourceType: "forum", tier: "professional_secondary", summary: "Ti141 讨论提供钛合金路线和具体样本内部件差异的旁证；不外推到所有 P141 批次。", locator: "Ti141 material and internal-part observations" }),
  p141Retail: live({ key: "phase181-majohn-p141-retail", title: "Majohn 当代产品集合：P141 SKU 语境", url: "https://www.majohnpen.com/", registryKey: "majohn-p141-retail-phase181", registryName: "Majohn retailer context", sourceType: "retailer", tier: "retailer", summary: "当代集合页用于确认 P141 的市场命名和颜色 SKU；材质范围按具体商品核对。", locator: "P141 product and color navigation" }),
  q1Svg: diagram("phase181-majohn-q1-svg", "Majohn Q1 直灌结构本站原创示意", "/images/library/site-original/phase181/majohn/q1.svg"),
  m2Svg: diagram("phase181-majohn-m2-svg", "Majohn M2 透明直灌本站原创示意", "/images/library/site-original/phase181/majohn/m2.svg"),
  p140Svg: diagram("phase181-majohn-p140-svg", "Majohn P140 活塞结构本站原创示意", "/images/library/site-original/phase181/majohn/p140.svg"),
  p141Svg: diagram("phase181-majohn-p141-svg", "Majohn P141 钛合金路线本站原创示意", "/images/library/site-original/phase181/majohn/p141.svg"),
} as const;

function claim(key: string, predicate: string, objectText: string, sourceKey: string, scopeKey: string, locator: string): CuratedEntityPack["claims"][number] {
  return { key, predicate, objectText, factClass: "core", confidence: 0.88, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function specEvidence(entityKey: string, fieldKey: SpecFieldKey, sourceKey: string, scopeKey: string, locator: string): NonNullable<CuratedEntityPack["spec"]>["evidence"][number] {
  return { key: `${entityKey}-${fieldKey}`, fieldKey, sourceKey, scopeKey, locator };
}

function makePen(input: {
  id: string;
  slug: string;
  key: string;
  name: string;
  title: string;
  summary: string;
  markdownFile: string;
  primary: CuratedSource;
  secondary: CuratedSource;
  tertiary: CuratedSource;
  image: CuratedSource;
  identity: string;
  boundary: string;
  fill: string;
  material: string;
  nib: string;
  dimensions: string;
  weight: string;
  status: string;
  aliases: string[];
  variants: CuratedEntityPack["variants"];
}): CuratedEntityPack {
  const scope = `${input.key}-model`;
  return {
    key: `phase181-majohn-${input.key}`,
    entityId: input.id,
    expectedType: "pen",
    expectedSlug: input.slug,
    canonicalName: input.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: input.markdownFile,
    storyTitle: input.title,
    primarySourceKey: input.primary.key,
    depthTier: "A",
    aliases: input.aliases.map((alias) => ({ alias, language: /[A-Za-z]/.test(alias) ? "en" : "zh", sourceKey: input.primary.key })),
    sources: [input.primary, input.secondary, input.tertiary, S.m2Collection, input.image],
    scopes: [
      { key: scope, scopeKey: `${input.key}-model-history`, productionState: "current", editionScope: "model identity and current market samples" },
      { key: `${scope}-variant`, scopeKey: `${input.key}-variant-samples`, productionState: "unknown", editionScope: "individual colour, nib or material samples" },
    ],
    claims: [
      claim(`${input.key}-identity`, "model_identity", input.identity, input.primary.key, scope, "model identity and product description"),
      claim(`${input.key}-boundary`, "version_boundary", input.boundary, input.secondary.key, `${scope}-variant`, "variant and sample limitation"),
      claim(`${input.key}-care`, "maintenance_guidance", "清洗、装墨和携带建议来自多来源样本；遇到密封、裂纹或尖端异常应停止使用并按卖家售后处理。", input.tertiary.key, scope, "care and use observations"),
      claim(`${input.key}-maker`, "brand_context", "该型号归入 Majohn 当代品牌目录语境；型号页仍以具体样本来源说明版本差异。", S.m2Collection.key, scope, "official brand and model navigation"),
    ],
    variants: input.variants,
    spec: {
      brandEntityId: PHASE181_MAJOHN_BRAND_ID,
      values: { series_name: input.name, nib: input.nib, fill_system: input.fill, material: input.material, dimensions: input.dimensions, weight: input.weight, status: input.status },
      evidence: [
        specEvidence(input.key, "brand_entity_id", input.primary.key, scope, "Majohn brand identity and model maker relation"),
        specEvidence(input.key, "series_name", input.primary.key, scope, "model series name"),
        specEvidence(input.key, "nib", input.primary.key, scope, "nib and writing sample"),
        specEvidence(input.key, "fill_system", input.primary.key, scope, "filling mechanism"),
        specEvidence(input.key, "material", input.secondary.key, `${scope}-variant`, "material and batch scope"),
        specEvidence(input.key, "dimensions", input.primary.key, scope, "published or reviewed dimensions"),
        specEvidence(input.key, "weight", input.primary.key, scope, "sample weight"),
        specEvidence(input.key, "status", input.tertiary.key, scope, "current market status"),
      ],
    },
    media: [{ key: `${input.key}-primary`, title: input.image.title, sourceKey: input.image.key, localPath: input.image.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "本站原创 factual SVG；非产品实拍，不代表具体颜色、比例或生产批次。", sourceUrl: input.image.url, usageStatus: "primary" }],
  };
}

const brandPack = phase23MajohnPacks.find((pack) => pack.entityId === PHASE181_MAJOHN_BRAND_ID);
if (!brandPack) throw new Error("Majohn brand pack missing from phase23 data");

export const phase181MajohnPacks: CuratedEntityPack[] = [
  brandPack,
  makePen({ id: PHASE181_IDS.q1, slug: "末匠-majohn-q1", key: "q1", name: "末匠 Majohn Q1", title: "末匠 Majohn Q1：短粗大容量与弯尖选择", summary: "Majohn Q1 是一支短而粗的透明树脂示范笔，采用旋盖、O 形圈和直灌式上墨；它的辨识重点是大握位与大墨仓，而不是某个外观相似的品牌型号。", markdownFile: ".planning/content-research/majohn-q1-phase181.md", primary: S.q1Sbre, secondary: S.q1Writing, tertiary: S.q1Paperemm, image: S.q1Svg, identity: "Q1 是 Majohn 独立的短粗透明直灌型号，公开样本有普通细尖与弯尖／fude 选项。", boundary: "弯尖、普通尖、透明度和颜色是型号内变体；Q1 不与 M2 的长圆柱直灌或 P140 的活塞结构合并。", fill: "eyedropper 直灌；O 形圈密封", material: "透明或半透明树脂；金属笔尖与夹件按 SKU 核对", nib: "普通细尖或弯尖／fude 变体", dimensions: "参考样本约 112.5 mm 合盖、134.1 mm 帖帽", weight: "参考样本约 36.5 g 含墨", status: "当代市场可见；颜色、尖型和附件随渠道变化", aliases: ["Majohn Q1", "Moonman Q1"], variants: [{ key: "q1-fude", name: "弯尖／fude 尖", notes: "弯尖带来角度相关的线宽变化；仍属于 Q1。", sourceKey: S.q1Writing.key, variantKind: "nib" }, { key: "q1-fine", name: "普通细尖", notes: "细尖样本更适合日常笔记；具体线宽按实物确认。", sourceKey: S.q1Sbre.key, variantKind: "nib" }] }),
  makePen({ id: PHASE181_IDS.m2, slug: "末匠-majohn-m2", key: "m2", name: "末匠 Majohn M2", title: "末匠 Majohn M2：透明直灌墨仓的边界", summary: "Majohn M2 是透明示范笔路线的直灌型号，重点在可见的大墨仓、螺纹帽与 O 形圈密封；公开资料中的容量与线宽属于样本或 SKU，不能强行固定为全批次规格。", markdownFile: ".planning/content-research/majohn-m2-phase181.md", primary: S.m2Ttpen, secondary: S.m2Guide, tertiary: S.m2Fpn, image: S.m2Svg, identity: "M2 是 Majohn 独立的透明直灌型号，公开零售与玩家资料均把其上墨方式与可见墨仓作为主要识别点。", boundary: "EF/F 等尖号、颜色、容量和附件属于 SKU 或样本差异；M2 不与 Q1、P140 的外形或机构互换。", fill: "eyedropper 直灌；O 形圈密封", material: "透明树脂示范笔身，金属钢尖与饰件按 SKU 核对", nib: "EF/F 等尖号按商品与实物确认", dimensions: "中大型圆柱路线；公开统一尺寸未固定", weight: "与装墨量和饰件明显相关", status: "当代市场可见；颜色、尖号和附件随渠道变化", aliases: ["Majohn M2", "Moonman M2"], variants: [{ key: "m2-nib-options", name: "EF／F 等尖号", notes: "尖号按订单和实物核对，不把个体线宽写成工厂固定值。", sourceKey: S.m2Ttpen.key, variantKind: "nib" }] }),
  makePen({ id: PHASE181_IDS.p140, slug: "末匠-majohn-p140", key: "p140", name: "末匠 Majohn P140", title: "末匠 Majohn P140：大号活塞与八号尖路线", summary: "Majohn P140 是大尺寸透明示范笔，采用活塞上墨、八号钢尖和较强存在感的笔身比例；公开评测所见黄铜活塞与乌木进墨结构应注明为样本，不宜泛化到所有批次。", markdownFile: ".planning/content-research/majohn-p140-phase181.md", primary: S.p140Rupert, secondary: S.p140Sbre, tertiary: S.p140Fpn, image: S.p140Svg, identity: "P140 是 Majohn 独立的大型透明活塞型号，公开样本采用 #8 级别钢尖并记录了较大的笔身和墨仓。", boundary: "透明度、颜色、尖号和内部材料按批次或样本区分；P140 不与 P141 的钛合金非透明路线或 M2 直灌结构合并。", fill: "piston 活塞上墨", material: "透明树脂示范笔身；公开样本记录黄铜活塞与乌木进墨件", nib: "大型 #8 钢尖；公开样本 F 尖偏 M", dimensions: "参考样本约 155 mm 合盖、133 mm 不含笔帽", weight: "参考样本约 38.5 g 含墨，笔身约 27.5 g", status: "当代市场可见；颜色、透明度、尖号和机构批次需核对", aliases: ["Majohn P140", "Moonman P140"], variants: [{ key: "p140-clear", name: "透明示范版本", notes: "透明外壳便于观察活塞和墨仓；颜色不另建型号。", sourceKey: S.p140Rupert.key, variantKind: "material" }, { key: "p140-nib", name: "#8 尖号版本", notes: "F 等尖号按具体 SKU 和样本确认。", sourceKey: S.p140Sbre.key, variantKind: "nib" }] }),
  makePen({ id: PHASE181_IDS.p141, slug: "末匠-majohn-p141-钛合金", key: "p141", name: "末匠 Majohn P141（钛合金）", title: "末匠 Majohn P141：钛合金非透明路线", summary: "Majohn P141 是与 P140 分开的钛合金路线型号，沿用大号笔尖和活塞钢笔的家族语境；公开资料显示其笔身、进墨件和颜色配置存在批次差异，购买时必须按具体 SKU 核对。", markdownFile: ".planning/content-research/majohn-p141-phase181.md", primary: S.p141Fpn, secondary: S.p141Ti, tertiary: S.p141Retail, image: S.p141Svg, identity: "P141 是 Majohn 独立的钛合金路线型号，公开讨论将其作为非示范版本并与透明 P140 分开。", boundary: "笔身、笔帽、活塞、进墨件和尖号可能有不同材料与批次；P141 不继承 P140 的透明外壳或黄铜活塞断言。", fill: "piston 活塞上墨语境；具体密封和内部件按 SKU 核对", material: "钛合金路线笔身或笔帽；内部件和饰件可能为其他材料", nib: "大型 #8 级别钢尖；尖号、刻花和线宽按批次确认", dimensions: "大型钢笔比例；公开统一尺寸未固定", weight: "钛合金和内部件差异会显著影响重量", status: "当代市场可见；颜色、表面处理、尖号和内部件存在批次差异", aliases: ["Majohn P141", "Majohn Ti141"], variants: [{ key: "p141-titanium", name: "钛合金笔身路线", notes: "材质范围按商品说明核对，不把所有内部件写成钛制。", sourceKey: S.p141Ti.key, variantKind: "material" }, { key: "p141-f", name: "F 尖早期市场版本", notes: "讨论记录初期 F 尖；当前库存和尖号需按 SKU 确认。", sourceKey: S.p141Fpn.key, variantKind: "nib" }] }),
];
