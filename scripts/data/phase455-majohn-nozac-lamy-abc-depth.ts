import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE182_IDS,
  phase182MajohnPacks,
} from "./phase182-majohn-v1-v60-wancai";
import {
  PHASE99_NOZAC_ID,
  phase99ConklinHistoricPacks,
} from "./phase99-conklin-historic";
import {
  PHASE139_IDS,
  phase139AllPacks,
} from "./phase139-german-swiss-current-batch";

export const PHASE455_MODEL_IDS = {
  majohnV1: PHASE182_IDS.v1,
  nozac: PHASE99_NOZAC_ID,
  lamyAbc: PHASE139_IDS.abc,
} as const;

const allBasePacks = [
  ...phase182MajohnPacks,
  ...phase99ConklinHistoricPacks,
  ...phase139AllPacks,
];

function modelFrom(entityId: string, label: string): CuratedEntityPack {
  const pack = allBasePacks.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 455 ${label} model pack is missing.`);
  return pack;
}

function source(key: string, label: string): CuratedSource {
  const found = allBasePacks
    .flatMap((pack) => pack.sources)
    .find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Phase 455 ${label} source ${key} is missing.`);
  return found;
}

function scope(slug: string, productionState: "current" | "historical"): CuratedScope {
  const key = `phase455-${slug}-model-depth`;
  return {
    key,
    scopeKey: key,
    productionState,
    editionScope:
      "Phase 455 型号深化；规格、版本、使用经验、维修风险与选购边界按来源粒度记录，不跨型号回填。",
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
    factClass: "core",
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
): CuratedEntityPack {
  return {
    ...base,
    key,
    scopes: [...base.scopes, modelScope],
    claims: [...base.claims, ...claims],
    timeline: [...(base.timeline ?? []), ...timeline],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const majohnBase = modelFrom(PHASE455_MODEL_IDS.majohnV1, "Majohn V1");
const nozacBase = modelFrom(PHASE455_MODEL_IDS.nozac, "The Conklin Nozac");
const lamyBase = modelFrom(PHASE455_MODEL_IDS.lamyAbc, "LAMY abc");

const majohnCatalogue = source("phase182-majohn-v1-catalogue", "Majohn V1 catalogue");
const majohnReview = source("phase182-majohn-v1-review", "Majohn V1 review");
const majohnRetailer = source("phase182-majohn-v1-etsy", "Majohn V1 retailer listing");
const majohnOfficial = source("phase182-majohn-official", "Majohn official navigation");

const nozacArchive = source("phase99-conklin-nozac-vintagepens", "Nozac archive");
const nozacDetail = source("phase99-conklin-nozac-penhero", "Nozac PenHero detail");
const nozacOfficial = source("phase99-conklin-official", "Conklin official history");

const lamyProduct = source("phase139-abc-l09bka", "LAMY abc official product");
const lamyCare = source("phase139-lamy-care", "LAMY care guide");
const lamyReview = source("phase139-abc-review", "LAMY abc review");

const majohnScope = scope("majohn-v1", "current");
const nozacScope = scope("conklin-nozac", "historical");
const lamyScope = scope("lamy-abc", "current");

export const phase455MajohnNozacLamyAbcDepthPacks: CuratedEntityPack[] = [
  refresh(
    majohnBase,
    "phase455-majohn-v1-depth-v1",
    majohnScope,
    [
      claim(
        majohnCatalogue,
        majohnScope.scopeKey,
        "phase455-majohn-identity",
        "model_identity",
        "Majohn V1 是独立的透明真空上墨型号；长护帽、尾端供墨控制和纤细笔身共同构成识别边界，不与 V60、V126、V200 或 P140 合并。",
      ),
      claim(
        majohnReview,
        majohnScope.scopeKey,
        "phase455-majohn-filling",
        "filling_boundary",
        "V1 的真空机构依靠推杆行程与尾端止墨位置工作；吸墨不足可能来自密封、行程、止墨通道或笔尖浸入深度，不能只用一个未经出处的容量数字解释。",
      ),
      claim(
        majohnReview,
        majohnScope.scopeKey,
        "phase455-majohn-sample",
        "sample_experience_boundary",
        "EF/F 尖、透明度、容量、重心、尾端阻尼和长护帽体验来自具体用户样本；它们可以帮助试写和选购，但不能回填成所有颜色、批次的固定规格。",
        0.94,
      ),
      claim(
        majohnRetailer,
        majohnScope.scopeKey,
        "phase455-majohn-market",
        "market_boundary",
        "零售页确认透明示范与 vacuum filling 的商品语境，不证明每一批的附件、尾端夹件、密封状态或售后；Moonman 是旧名称语境，不是第二个型号。",
      ),
      claim(
        majohnReview,
        majohnScope.scopeKey,
        "phase455-majohn-care",
        "maintenance_boundary",
        "第一次使用应先用清水测试吸排和止墨动作；推杆发涩、空转、回弹异常、尾端渗墨或护帽螺纹开裂时停止反复抽推，交给熟悉真空机构的维修者，避开热水和强溶剂。",
      ),
      claim(
        majohnOfficial,
        majohnScope.scopeKey,
        "phase455-majohn-selection",
        "selection_boundary",
        "选购 V1 要分别核对型号、尾端机构、护帽螺纹、尖号、透明度、附件和维修史；希望频繁换色或随时帖帽者，应把 cartridge/converter 型号作为使用取舍，而不是把外观相似笔合并。",
      ),
    ],
    [
      {
        key: "phase455-majohn-v1-depth",
        title: "Phase 455：Majohn V1 的真空机构与维修边界",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足 V1 的真空上墨检查、长护帽使用取舍、样本规格边界、维修风险和与其它 Majohn 真空型号的身份分流。",
        sourceKey: majohnCatalogue.key,
      },
    ],
  ),
  refresh(
    nozacBase,
    "phase455-conklin-nozac-depth-v1",
    nozacScope,
    [
      claim(
        nozacArchive,
        nozacScope.scopeKey,
        "phase455-nozac-identity",
        "model_identity",
        "The Conklin Nozac 指约 1931–1938 年的无墨囊旋转活塞家族；圆杆、多面杆、透明窗口、刻印和尺寸需要按具体实物核对，不由现代 Conklin 复刻反向补齐。",
      ),
      claim(
        nozacDetail,
        nozacScope.scopeKey,
        "phase455-nozac-word-gauge",
        "variant_boundary",
        "Word Gauge 5,000 与 7,000 只绑定对应透明版本；广告或照片出现数字不等于整族 Nozac 都有相同刻度、容量或尺寸。",
      ),
      claim(
        nozacArchive,
        nozacScope.scopeKey,
        "phase455-nozac-mechanism",
        "mechanism_boundary",
        "Nozac 的尾端旋转机构和中空铝制活塞杆是历史型号的关键检查点；一次清水吸入不能证明旧密封、螺纹或活塞杆适合长期书写。",
      ),
      claim(
        nozacDetail,
        nozacScope.scopeKey,
        "phase455-nozac-markings",
        "identity_evidence",
        "Endura-Graph、Endura Symetrik、Nozac Symetrik 等刻印可以并存；应保留笔杆原文、杆型、透明窗和尖端近照，不能只凭颜色或广告标题判定版本。",
      ),
      claim(
        nozacArchive,
        nozacScope.scopeKey,
        "phase455-nozac-care",
        "maintenance_boundary",
        "尾端卡滞时不要强拧，也不要用热水、强溶剂、超声波或未经确认的橡胶件试修；先让熟悉老式活塞的维修者检查密封、活塞杆、螺纹和替换尖。",
      ),
      claim(
        nozacOfficial,
        nozacScope.scopeKey,
        "phase455-nozac-selection",
        "selection_boundary",
        "收藏应优先保存刻印、杆型、透明窗口和原装部件；日用则优先看密封稳定、尾端动作和可追溯维修。现代复刻可作比较对象，但不共享 Nozac 的历史规格或零件结论。",
      ),
    ],
    [
      {
        key: "phase455-nozac-depth",
        title: "Phase 455：Conklin Nozac 的版本识别与老化风险",
        eventType: "design_milestone",
        startDate: "1931",
        circa: true,
        description:
          "把 Nozac 的 Word Gauge、刻印、杆型和中空铝活塞杆放回 1930 年代历史边界，并补足待修实物的选购与维护判断。",
        sourceKey: nozacArchive.key,
      },
    ],
  ),
  refresh(
    lamyBase,
    "phase455-lamy-abc-depth-v1",
    lamyScope,
    [
      claim(
        lamyProduct,
        lamyScope.scopeKey,
        "phase455-lamy-identity",
        "model_identity",
        "LAMY abc 是与教育者合作开发的儿童习字钢笔系统，不是缩小版 Safari；当前 Black L09BKA 的枫木笔杆、人体工学握区、A/LH 钢尖和 roll-stop 构成产品身份。",
      ),
      claim(
        lamyProduct,
        lamyScope.scopeKey,
        "phase455-lamy-nib",
        "nib_boundary",
        "A 与 LH 是面向不同握姿和使用情境的尖型选项，不应转换成一个固定毫米宽度；手掌、纸面角度和压力会改变实际线迹，个体选择需要试写或教师观察。",
      ),
      claim(
        lamyReview,
        lamyScope.scopeKey,
        "phase455-lamy-sample",
        "sample_experience_boundary",
        "The Pen Addict 的 Black A 宽湿体验属于一支样笔和一位评测者，不能保证所有 A 尖、批次或儿童手型，也不能替代医学或作业治疗评估。",
        0.94,
      ),
      claim(
        lamyProduct,
        lamyScope.scopeKey,
        "phase455-lamy-spec",
        "specification_snapshot",
        "L09BKA 当前官方字段为 13 × 13 × 133 mm、12 g、枫木笔杆、抛光钢尖、T10 墨囊和推荐的 Z28 converter；这些字段不能覆盖没有明确来源的旧包装或地区 SKU。",
      ),
      claim(
        lamyCare,
        lamyScope.scopeKey,
        "phase455-lamy-care",
        "maintenance_boundary",
        "枫木笔杆应避开长时间浸泡、酒精、漂白剂、热水和强清洁剂；供墨变慢先检查墨囊、接口和笔舌，不用持续加压补偿损坏尖端，儿童清洁玻璃墨水瓶应有成人协助。",
      ),
      claim(
        lamyProduct,
        lamyScope.scopeKey,
        "phase455-lamy-selection",
        "selection_boundary",
        "购买时先确认 fountain pen 而非同名铅笔，核对 A/LH、L09BKA、颜色、T10 与 Z28；颜色、帽色、握区和包装是版本边界，不应把每个颜色另建成基础型号。",
      ),
    ],
    [
      {
        key: "phase455-lamy-abc-depth",
        title: "Phase 455：LAMY abc 的握姿、木材护理与版本边界",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足 abc 的 A/LH 使用情境、样本体验边界、枫木课堂维护、T10/Z28 补给和旧版包装的购买核对。",
        sourceKey: lamyProduct.key,
      },
    ],
  ),
];

if (
  new Set(phase455MajohnNozacLamyAbcDepthPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 455 Majohn/Nozac/LAMY pack must contain three unique models.");
}

for (const pack of phase455MajohnNozacLamyAbcDepthPacks) {
  if (!pack.spec?.brandEntityId) {
    throw new Error(`Phase 455 ${pack.expectedSlug} must retain its maker identity.`);
  }
}
