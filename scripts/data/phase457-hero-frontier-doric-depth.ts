import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE159_IDS,
  phase159HeroPacks,
} from "./phase159-hero-100-616-329";
import {
  PHASE40_FRONTIER_ID,
  phase40ParkerFrontierPremierVictoryPacks,
} from "./phase40-parker-frontier-premier-victory";
import {
  PHASE165_DORIC_ID,
  phase165EversharpChiltonPacks,
} from "./phase165-eversharp-chilton";

export const PHASE457_MODEL_IDS = {
  hero100: PHASE159_IDS.hero100,
  parkerFrontier: PHASE40_FRONTIER_ID,
  eversharpDoric: PHASE165_DORIC_ID,
} as const;

const allBasePacks = [
  ...phase159HeroPacks,
  ...phase40ParkerFrontierPremierVictoryPacks,
  ...phase165EversharpChiltonPacks,
];

function modelFrom(entityId: string, label: string): CuratedEntityPack {
  const pack = allBasePacks.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 457 ${label} model pack is missing.`);
  return pack;
}

function source(key: string, label: string): CuratedSource {
  const found = allBasePacks.flatMap((pack) => pack.sources).find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Phase 457 ${label} source ${key} is missing.`);
  return found;
}

function scope(slug: string, productionState: "current" | "historical"): CuratedScope {
  const key = `phase457-${slug}-model-depth`;
  return {
    key,
    scopeKey: key,
    productionState,
    editionScope:
      "Phase 457 型号深化；规格、版本、使用经验、维修风险与选购边界按来源粒度记录，不跨型号回填。",
  };
}

function claim(
  sourceItem: CuratedSource,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  confidence = 0.96,
): CuratedEntityPack["claims"][number] {
  const locator = sourceItem.summary || sourceItem.title;
  return {
    key,
    predicate,
    objectText,
    factClass: predicate === "use_and_care" ? "editorial" : "core",
    confidence,
    sourceKey: sourceItem.key,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey: sourceItem.key, scopeKey, locator }],
  };
}

function refresh(
  base: CuratedEntityPack,
  key: string,
  modelScope: CuratedScope,
  claims: CuratedEntityPack["claims"],
  timeline: NonNullable<CuratedEntityPack["timeline"]>,
  additionalSources: CuratedSource[] = [],
): CuratedEntityPack {
  return {
    ...base,
    key,
    sources: [...base.sources, ...additionalSources].filter(
      (sourceItem, index, all) =>
        all.findIndex((candidate) => candidate.key === sourceItem.key) === index,
    ),
    scopes: [...base.scopes, modelScope],
    claims: [...base.claims, ...claims],
    timeline: [...(base.timeline ?? []), ...timeline],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const heroBase = modelFrom(PHASE457_MODEL_IDS.hero100, "Hero 100");
const frontierBase = modelFrom(PHASE457_MODEL_IDS.parkerFrontier, "Parker Frontier");
const doricBase = modelFrom(PHASE457_MODEL_IDS.eversharpDoric, "Eversharp Doric");

const heroOfficial = source("phase159-hero-official", "Hero official");
const heroSample = source("phase159-hero-100-fpn", "Hero 100 sample");
const heroLegacy = source("phase159-hero-100-fpn-legacy", "Hero 100 legacy review");
const heroHistory = source("phase159-hero-100-history", "Hero history");

const frontierArchive = source("phase40-parker-frontier-penography", "Parker Frontier Penography");
const frontierReview = source("phase40-parker-frontier-review", "Parker Frontier sample");
const parkerOfficial = source("parker-official-history", "Parker official history");
const parkerCare = source("parker-care-guide", "Parker care guide");

const doricRichard = source("phase165-doric-richard", "Doric Richard's Pens");
const doricPm = source("phase165-doric-pm", "Doric PM Pens");
const doricAirliner = source("phase165-doric-airliner", "Doric Airliner sample");
const eversharpOfficial = source("phase165-eversharp-official", "Eversharp official history");
const eversharpHome = source("phase165-eversharp-home", "Eversharp modern product boundary");

const heroScope = scope("hero-100", "historical");
const frontierScope = scope("parker-frontier", "historical");
const doricScope = scope("eversharp-doric", "historical");

export const phase457HeroFrontierDoricDepthPacks: CuratedEntityPack[] = [
  refresh(
    heroBase,
    "phase457-hero-100-depth-v1",
    heroScope,
    [
      claim(
        heroSample,
        heroScope.scopeKey,
        "phase457-hero100-identity",
        "model_identity",
        "Hero 100 是上海英雄体系中的 14K hooded nib 挤压囊型号；与 Parker 51 的相似只提供设计语境，不构成品牌、授权或零件关系。",
      ),
      claim(
        heroSample,
        heroScope.scopeKey,
        "phase457-hero100-measurement",
        "measurement_boundary",
        "约 5.56 英寸合帽、5 英寸无帽和约 23 g 的数字来自独立单支样本；帽深、是否后套、含墨量和金属件都会改变测量结果。",
      ),
      claim(
        heroLegacy,
        heroScope.scopeKey,
        "phase457-hero100-nib",
        "nib_boundary",
        "14K 只证明公开样本的尖材，不保证每支 Hero 100 都保留原装尖、同一字幅或软弹表现；暗尖调校、尖缝和 feed 状态需按实物检查。",
      ),
      claim(
        heroHistory,
        heroScope.scopeKey,
        "phase457-hero100-market",
        "market_boundary",
        "二手市场的老款、新版、颜色和礼盒称呼并不构成稳定生产目录；看不见尖面、压条和帽内的商品照片只能保留为待核。",
        0.94,
      ),
      claim(
        heroLegacy,
        heroScope.scopeKey,
        "phase457-hero100-care",
        "use_and_care",
        "固定挤压囊应以常温清水吸排检查回弹、压条和密封；不要把相似外形当作 Parker 零件兼容依据，也不要用热水、酒精或强溶剂处理老胶接件。",
      ),
      claim(
        heroOfficial,
        heroScope.scopeKey,
        "phase457-hero100-selection",
        "selection_boundary",
        "选购时应同时核对尖面、囊体、帽盖密封、刻字和维修史；想要频繁换墨与稳定防漏的读者，应把现代 converter 或墨囊型号作为明确的使用取舍。",
      ),
    ],
    [
      {
        key: "phase457-hero100-depth",
        title: "Phase 457：Hero 100 的暗尖样本与老式囊体边界",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足 Hero 100 的 14K 暗尖、挤压囊、样本测量、版本核验和长期保存边界，并与 Hero 616、329 及 Parker 51 分流。",
        sourceKey: heroSample.key,
      },
    ],
  ),
  refresh(
    frontierBase,
    "phase457-parker-frontier-depth-v1",
    frontierScope,
    [
      claim(
        frontierArchive,
        frontierScope.scopeKey,
        "phase457-frontier-identity",
        "model_identity",
        "Parker Frontier 是 Parker UK 约 1996 年起的独立日用线，塑料或 ABS 笔杆、不锈钢帽和 Parker 墨囊／converter 是常见识别组合，不是 Vector 的别名。",
      ),
      claim(
        frontierReview,
        frontierScope.scopeKey,
        "phase457-frontier-market",
        "market_boundary",
        "英国／Newhaven 与后期印度等市场可能在刻字、包装、夹具和表面处理上不同；制造地应从具体笔杆和附件核对，不能用近似商品照补齐。",
      ),
      claim(
        frontierReview,
        frontierScope.scopeKey,
        "phase457-frontier-measurement",
        "measurement_boundary",
        "约 131 mm 合帽及其它长度、重量数字都属于样本参考；是否后套、是否含 converter 和具体帽深会改变测量与重心。",
      ),
      claim(
        parkerOfficial,
        frontierScope.scopeKey,
        "phase457-frontier-neighbours",
        "version_boundary",
        "Frontier、Vector／Vector XL、Urban、Parker 25 与 51 是不同产品线；颜色、Flighter、Stainless 或金银饰件只在有来源时记录为 variant，不创建重复主型号。",
      ),
      claim(
        parkerCare,
        frontierScope.scopeKey,
        "phase457-frontier-care",
        "use_and_care",
        "清洗应拆下墨囊或 converter 后用凉水吸排，漆面、ABS 和镀层避开热水、酒精和强力抛光；漏气先排查 converter、笔握裂纹与残墨堵塞。",
      ),
      claim(
        frontierArchive,
        frontierScope.scopeKey,
        "phase457-frontier-selection",
        "selection_boundary",
        "购买二手 Frontier 应要求笔尖、笔杆刻字、帽顶、夹具和帽内照片，并把制造地、尖号、附件与维修史放在同一条记录中；“稀有配色”不能替代身份证据。",
      ),
    ],
    [
      {
        key: "phase457-frontier-depth",
        title: "Phase 457：Parker Frontier 的市场版本与日用检查",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足 Frontier 的 UK／后期市场边界、样本尺寸条件、相邻型号分流和墨囊转换器维护，避免成为 Vector 图片与规格的容器。",
        sourceKey: frontierArchive.key,
      },
    ],
  ),
  refresh(
    doricBase,
    "phase457-eversharp-doric-depth-v1",
    doricScope,
    [
      claim(
        doricRichard,
        doricScope.scopeKey,
        "phase457-doric-identity",
        "model_identity",
        "Eversharp Doric 是 1931 年起的多面赛璐珞历史钢笔家族；第一、第二代、尺寸、颜色与机构必须结合帽环、刻字和实物判断，现代复兴 Doric 另立。",
      ),
      claim(
        doricPm,
        doricScope.scopeKey,
        "phase457-doric-material",
        "material_boundary",
        "Kashmir、Morocco、Cathay、Burma、Carnelian 等颜色名称来自历史资料和收藏语境，不是今天卖家昵称的统一色卡；反光和后配零件会改变照片观感。",
      ),
      claim(
        doricAirliner,
        doricScope.scopeKey,
        "phase457-doric-mechanism",
        "mechanism_boundary",
        "存世 Doric 可见杠杆／橡胶墨囊、plunger/vacuum 和部分 Safety Ink Shut-Off；机构、尾端行程和密封状态不能从一个颜色或广告标题外推。",
      ),
      claim(
        doricPm,
        doricScope.scopeKey,
        "phase457-doric-version",
        "version_boundary",
        "约 1931–1935 的帽环未完全包到帽口，约 1935/1936 起的样式常见延伸帽环；年代会与尺寸、市场和库存交叠，不能用颜色单独定年。",
      ),
      claim(
        doricAirliner,
        doricScope.scopeKey,
        "phase457-doric-care",
        "use_and_care",
        "多面赛璐珞出现帽口裂纹、收缩或应力时应停止后插和强拧；真空、shut-off 与老墨囊都先用清水保守检查，热水、酒精和超声波不适合作为试修。",
      ),
      claim(
        eversharpOfficial,
        doricScope.scopeKey,
        "phase457-doric-selection",
        "selection_boundary",
        "日用选择优先看帽口、尖舌对齐、密封与维修记录；收藏选择再看代际帽环、Gold Seal 滑片、原装夹子和盒证，不能以 adjustable 或 shut-off 承诺柔尖或完全防漏。",
      ),
    ],
    [
      {
        key: "phase457-doric-depth",
        title: "Phase 457：Eversharp Doric 的代际与修复记录",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "把 Doric 的多面赛璐珞、第一／第二代帽环、调节尖、上墨机构和收藏／日用选择放回各自来源边界。",
        sourceKey: doricRichard.key,
      },
    ],
    [eversharpHome],
  ),
];
