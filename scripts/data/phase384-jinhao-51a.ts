import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase63JinhaoPacks } from "./phase63-jinhao-split";

export const PHASE384_JINHAO_BRAND_ID = "Yulxwu7PuQAU";
export const PHASE384_51A_ID = "phase384-jinhao-51a";
export const PHASE384_51A_SLUG = "jinhao-51a";
export const PHASE384_51A_NAME = "金豪 Jinhao 51A";

const RETRIEVED = "2026-08-03";
const SCOPE = "phase384-jinhao-51a-current-market";
const FPN = "https://www.fountainpennetwork.com/forum/topic/350873-jinhao-51-a/";
const PASTOR = "https://www.pastorandpen.com/blog/2019/6/24/jinhao-51a-fountain-pen-review";
const FPC = "https://www.fountainpencompanion.com/pen_brands/89-jinhao/pen_models/40-51a";
const MATS = "https://matspens.wordpress.com/2021/01/03/jinahao-51a/";
const SBRE = "https://www.sbrebrown.com/2019/04/jinhao-51a-hooded-and-exposed-nibs-fountain-pen-review/";
const INKQUIRING = "https://www.youtube.com/watch?v=LyBYEuD2uPg";
const SVG = "/images/library/site-original/phase384/jinhao/51a.svg";

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
  publishedAt?: string;
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

function siteOriginal(): CuratedSource {
  return {
    key: "phase384-jinhao-51a-svg",
    registryKey: "fountain-pen-graph-editorial-phase384",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase384",
    title: "Jinhao 51A structure and version boundary factual card",
    url: SVG,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；表达 51-style 外形、C/C 和 hooded/open 版本边界，非产品照片。",
    archiveUrl: SVG,
    archiveLocator: "project-public-asset:/images/library/site-original/phase384/jinhao/51a.svg;site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900",
  };
}

const S = {
  fpn: source({
    key: "phase384-jinhao-51a-fpn",
    title: "Jinhao 51-A — Fountain Pen Network",
    url: FPN,
    registryKey: "fpn-jinhao-51a-phase384",
    registryName: "Fountain Pen Network",
    sourceType: "forum",
    tier: "contemporary_archive",
    publishedAt: "2019",
    summary: "2019 年玩家评测记录 acrylic／wood body、金属笔帽、hooded nib 与 cartridge/converter；EF 标签和实际线宽只代表单支样本。",
    locator: "dated review topic; body materials, cap, hooded nib, filling and writing sample",
  }),
  pastor: source({
    key: "phase384-jinhao-51a-pastor",
    title: "Jinhao 51A Fountain Pen Review — Pastor and Pen",
    url: PASTOR,
    registryKey: "pastor-and-pen-jinhao-51a-phase384",
    registryName: "Pastor and Pen",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2019-06-24",
    summary: "独立评测展示彩色树脂版本、stainless-steel cap、hooded nib、standard cartridge/converter 与随笔 converter；写感属于评测者样本。",
    locator: "materials, cap, nib, filling system and individual writing sections",
  }),
  fpc: source({
    key: "phase384-jinhao-51a-fpc",
    title: "Jinhao 51A — Fountain Pen Companion",
    url: FPC,
    registryKey: "fountain-pen-companion-jinhao-51a-phase384",
    registryName: "Fountain Pen Companion",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "结构化型号索引把 51A 单列，并记录 wood、metal、plastic、transparent 等材料与颜色变体以及 cartridge/converter；这是社区数据库，不是官方规格表。",
    locator: "brand/model breadcrumb, 51A variants and filling fields",
  }),
  mats: source({
    key: "phase384-jinhao-51a-mats",
    title: "Jinahao 51A — Mat's Pens",
    url: MATS,
    registryKey: "mats-pens-jinhao-51a-phase384",
    registryName: "Mat's Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2021-01-03",
    summary: "2021 年实物记录 peach wood、塑料和其他材料、金属笔帽、folded steel fine／open #5 路线、C/C，以及约 139/128/148 mm、20 g 样本。",
    locator: "materials, nib alternatives, filling, measurements and weight sections",
  }),
  sbre: source({
    key: "phase384-jinhao-51a-sbre",
    title: "Jinhao 51A (Hooded and Exposed Nibs) — SBRE Brown",
    url: SBRE,
    registryKey: "sbre-brown-jinhao-51a-phase384",
    registryName: "SBRE Brown",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2019-04",
    summary: "评测标题及视频语境明确区分 hooded 与 exposed nib 版本；用于确认笔尖路线，不把单支书写偏好升级为全系规格。",
    locator: "review title, hooded/exposed nib comparison and sample notes",
  }),
  inkquiring: source({
    key: "phase384-jinhao-51a-inkquiring",
    title: "Jinhao 51A Non-Hooded Fountain Pen — Inkquiring Minds",
    url: INKQUIRING,
    registryKey: "inkquiring-minds-jinhao-51a-phase384",
    registryName: "Inkquiring Minds",
    sourceType: "blog",
    tier: "professional_secondary",
    summary: "视频评测以 non-hooded 51A 为独立样本，补充露尖路线存在的交叉证据；未用来推断所有颜色、尖号或尺寸。",
    locator: "video title and non-hooded sample review",
  }),
  svg: siteOriginal(),
} as const;

function claim(
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
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }],
  };
}

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const baseBrand = phase63JinhaoPacks.find((pack) => pack.expectedType === "brand");
if (!baseBrand) throw new Error("Phase 384 Jinhao brand prerequisite is missing.");
const brand = structuredClone(baseBrand);
brand.entityId = PHASE384_JINHAO_BRAND_ID;
brand.key = "phase384-jinhao-brand-navigation-v1";
brand.sources = [...brand.sources, S.fpn, S.fpc, S.mats].filter(
  (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index,
);
brand.scopes = [
  ...brand.scopes,
  {
    key: "phase384-jinhao-51a-navigation",
    scopeKey: "phase384-jinhao-51a-navigation",
    validFrom: RETRIEVED,
    productionState: "current",
    editionScope: "Jinhao 品牌页新增 51A 独立入口；wood、acrylic/plastic、transparent 与 hooded/open 尖是 51A 内部变体，不与 Parker 51、Jinhao 911 或 85 合并。",
  },
];
brand.claims = [
  ...brand.claims,
  {
    key: "phase384-jinhao-51a-navigation-claim",
    predicate: "series_navigation",
    objectText: "Jinhao 品牌页新增 Jinhao 51A 独立型号入口。它是 Jinhao 自己的 Parker 51-style C/C 钢笔；wood/acrylic 外观和 hooded/open nib 是型号内部版本，不是 Parker 51 的品牌关系或 Jinhao 911 的别名。",
    factClass: "core",
    confidence: 0.98,
    sourceKey: S.fpn.key,
    locator: "51A model review and independent identity boundary",
    evidence: [{ key: "phase384-jinhao-51a-navigation-evidence", sourceKey: S.fpn.key, scopeKey: "phase384-jinhao-51a-navigation", locator: "51A model review and independent identity boundary" }],
  },
];

const pack: CuratedEntityPack = {
  key: `${PHASE384_51A_ID}-v1`,
  entityId: PHASE384_51A_ID,
  expectedType: "pen",
  expectedSlug: PHASE384_51A_SLUG,
  canonicalName: PHASE384_51A_NAME,
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/jinhao-51a-phase384.md",
  storyTitle: "Jinhao 51A：先分清 Parker 51-style 外形，再核对两种笔尖",
  primarySourceKey: S.fpn.key,
  depthTier: "A",
  aliases: [
    { alias: "Jinhao 51A", language: "en", sourceKey: S.fpn.key },
    { alias: "金豪 51A", language: "zh", sourceKey: S.pastor.key },
    { alias: "Jinhao 51-A", language: "en", sourceKey: S.fpn.key },
    { alias: "Jinhao 51A hooded nib", language: "en", sourceKey: S.sbre.key },
    { alias: "Jinhao 51A non-hooded", language: "en", sourceKey: S.inkquiring.key },
  ],
  sources: Object.values(S),
  scopes: [{
    key: SCOPE,
    scopeKey: SCOPE,
    validFrom: RETRIEVED,
    productionState: "current",
    market: "公开零售、型号索引与独立评测",
    nibScope: "公开资料区分 hooded EF 与 open/exposed #5；销售线宽和 section 按 SKU",
    materialScope: "acrylic/plastic、wood 与 metal cap 是公开样本边界；木种和配方不统一",
    editionScope: "Parker 51-style 独立 Jinhao 型号；不建立 Parker 授权或制造关系",
  }],
  claims: [
    claim("phase384-51a-identity", "model_identity", "Jinhao 51A 是 Jinhao 独立的 Parker 51-style 钢笔型号；FPN、Pastor and Pen 与 FPC 资料把 51A 作为独立型号记录，不能把 51A 改写为 Parker 51 的版本。", S.fpn.key, "model title and dated review; FPC model index"),
    claim("phase384-51a-parker-boundary", "identity_boundary", "51A 的细长笔身、金属笔帽与半包围笔尖是外形参照，不是 Parker 51 的品牌、授权或历史填充关系；Parker 51 的真空／气压机制不能套用到 51A。", S.pastor.key, "51A review body and filling-system description"),
    claim("phase384-51a-materials", "material_variants", "公开样本出现 acrylic/plastic、transparent 与 wood body，金属笔帽是共同可见边界；Wood、Rosewood、Peach wood 或具体颜色按商品和实物核对，不合并成一套固定材质规格。", S.mats.key, "material options and peach-wood sample"),
    claim("phase384-51a-filling", "filling_system", "51A 采用 cartridge/converter（墨囊／转换器）路线，Pastor and Pen 记录随笔 converter；不要把它写成 Parker 51 的真空、气压或毛细管填充。", S.pastor.key, "standard cartridge/converter and included converter"),
    claim("phase384-51a-nibs", "nib_variants", "公开资料至少区分 hooded EF 与 open/exposed #5 两条笔尖路线；露尖版本可能对应另一种 section，EF/F/M 标签与实际线宽按 SKU 和单支调校。", S.sbre.key, "hooded and exposed nib review boundary"),
    claim("phase384-51a-dimensions", "physical_specification", "Mat's Pens 对一支样本给出约 139 mm 合盖、128 mm 未合盖、148 mm 插帽；FPN 及其他评测强调笔身较轻、帽子相对更重，这些是样本测量，不是全系厂规。", S.mats.key, "measurements, posted length and balance notes"),
    claim("phase384-51a-weight", "physical_specification", "公开测量的一支 51A 约 20 g；木种、金属帽、converter、墨水和测量口径会改变重量，页面保留为样本值。", S.mats.key, "sample weight and component measurements"),
    claim("phase384-51a-index", "independent_model_index", "Fountain Pen Companion 把 51A 单列并收录 wood、metal、plastic、transparent 等变体；它用于型号导航和交叉检查，不替代 Jinhao 官方目录。", S.fpc.key, "brand/model breadcrumb and variant index"),
    claim("phase384-51a-care", "maintenance_guidance", "换墨先用室温清水吸排并自然干燥；hooded feed 需要多冲几轮，木杆和漆面避免长时间浸水、热水、酒精、漂白剂和强溶剂；无结构证据时不要硬拆笔尖或帽子。", S.pastor.key, "filling and construction context; conservative care boundary", "editorial"),
    claim("phase384-51a-selection", "selection_guidance", "购买先确认 51A、wood/acrylic/transparent 材料、hooded 或 open #5 结构、尖幅标签、converter 和具体 SKU；不要用一张颜色图或一支 EF 的写感推断全批次。", S.fpc.key, "variant index and model-selection boundary", "editorial"),
    claim("phase384-51a-media", "media_identity_boundary", "本站主图是原创 factual SVG，仅表达 51-style 外形、C/C 与两条笔尖路线；不是产品照片、Logo、真实比例或颜色校样。", S.svg.key, "site-original SVG metadata", "editorial"),
  ],
  variants: [
    { key: `${SCOPE}-acrylic`, name: "Acrylic／plastic／transparent body", notes: "FPN、Pastor and Pen 与 FPC 记录的树脂、塑料和透明外观路线；颜色和透明度按具体 SKU。", sourceKey: S.fpc.key, variantKind: "material", market: "公开零售" },
    { key: `${SCOPE}-wood`, name: "Wood body", notes: "木杆是 51A 的公开材料分支；Peach wood、Rosewood 等名称和表面处理需要卖家按同一 SKU 证明。", sourceKey: S.mats.key, variantKind: "material", market: "公开零售" },
    { key: `${SCOPE}-hooded-ef`, name: "Hooded EF", notes: "FPN 与多份评测记录的护尖路线；单支 EF 可能写出接近 Western Medium 的线宽。", sourceKey: S.fpn.key, variantKind: "nib", market: "公开零售" },
    { key: `${SCOPE}-open-5`, name: "Open／exposed #5", notes: "SBRE Brown、Mat's Pens 与 Inkquiring Minds 的露尖样本；不要假定其 section 与 hooded 版本可互换。", sourceKey: S.sbre.key, variantKind: "nib", market: "公开零售" },
  ],
  spec: {
    brandEntityId: PHASE384_JINHAO_BRAND_ID,
    values: {
      series_name: "Jinhao 51A",
      release_year: "公开评测至少自 2019 年出现；未找到可独立核验的官方首发公告",
      origin_country: "Jinhao 中国品牌语境；不外推具体工厂、公司沿革或生产地细节",
      nib: "hooded EF 与 open/exposed #5 两条公开版本路线；线宽按 SKU 和单支调校",
      fill_system: "墨囊／转换器（cartridge/converter）；随附 converter 和接口按商品核对",
      material: "常见 acrylic/plastic 或 wood body、metal cap；木种、颜色和透明配方随版本",
      dimensions: "约 139 mm 合盖、128 mm 未合盖、148 mm 插帽（单一公开测量样本）",
      weight: "约 20 g（单一公开测量样本；口径需核对）",
      price_range: "早期评测约 5–8 美元级别；历史市场样本，不作当前 MSRP",
      status: "公开市场长期可见的 Jinhao 51A 型号；颜色、材料、尖号和库存随渠道变化",
    },
    evidence: [
      evidence("phase384-51a-brand", "brand_entity_id", S.fpn.key, "Jinhao 51A maker and model context"),
      evidence("phase384-51a-series", "series_name", S.fpc.key, "51A model index"),
      evidence("phase384-51a-release", "release_year", S.pastor.key, "2019 dated review; launch year withheld"),
      evidence("phase384-51a-origin", "origin_country", S.pastor.key, "Jinhao product context; no factory inference"),
      evidence("phase384-51a-nib", "nib", S.sbre.key, "hooded/exposed nib boundary"),
      evidence("phase384-51a-fill", "fill_system", S.pastor.key, "standard cartridge/converter and converter"),
      evidence("phase384-51a-material", "material", S.mats.key, "wood, plastic and metal cap sample"),
      evidence("phase384-51a-dimensions", "dimensions", S.mats.key, "139/128/148 mm sample measurements"),
      evidence("phase384-51a-weight", "weight", S.mats.key, "20 g sample measurement"),
      evidence("phase384-51a-price", "price_range", S.fpn.key, "historical low-price review context"),
      evidence("phase384-51a-status", "status", S.fpc.key, "current model index and changing market variants"),
    ],
  },
  timeline: [{
    key: "phase384-51a-public-review-record",
    title: "51A appears in public review records",
    eventType: "model_released",
    startDate: "2019",
    circa: true,
    description: "2019 dated reviews identify Jinhao 51A and its C/C, hooded/open nib and material variants; no official launch notice was located.",
    sourceKey: S.fpn.key,
  }],
  media: [{
    key: `${SCOPE}-primary-media`,
    title: "Jinhao 51A 结构事实卡（非产品照片）",
    sourceKey: S.svg.key,
    localPath: SVG,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；non-photo、non-logo、not-to-scale、non-colour-proof；不代表真实比例、颜色、Logo、库存或某一批次。",
    sourceUrl: SVG,
    usageStatus: "primary",
  }],
};

export const phase384Jinhao51APacks: CuratedEntityPack[] = [brand, pack];
