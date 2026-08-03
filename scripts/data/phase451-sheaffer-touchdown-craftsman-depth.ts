import type { CuratedEntityPack, CuratedScope } from "../lib/curated-content-pack";
import {
  PHASE56_CRAFTSMAN_BALANCE_ID,
  PHASE56_CRAFTSMAN_TIP_DIP_ID,
  PHASE56_TOUCHDOWN_TM_ID,
  phase56SheafferPacks,
} from "./phase56-sheaffer-p0";

export const PHASE451_MODEL_IDS = {
  touchdownTm: PHASE56_TOUCHDOWN_TM_ID,
  craftsmanBalance: PHASE56_CRAFTSMAN_BALANCE_ID,
  craftsmanTipDip: PHASE56_CRAFTSMAN_TIP_DIP_ID,
} as const;

function modelFrom(entityId: string, label: string): CuratedEntityPack {
  const pack = phase56SheafferPacks.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 451 ${label} model pack is missing.`);
  return pack;
}

function source(key: string, label: string): { key: string; summary: string } {
  for (const pack of phase56SheafferPacks) {
    const found = pack.sources.find((candidate) => candidate.key === key);
    if (found) return { key: found.key, summary: found.summary };
  }
  throw new Error(`Phase 451 ${label} source ${key} is missing.`);
}

function currentScope(slug: string): CuratedScope {
  const key = `phase451-${slug}-historical-model`;
  return {
    key,
    scopeKey: key,
    productionState: "historical",
    editionScope: "Phase 451 Sheaffer 1940s–1960s 型号深化；机制、成员、尖、帽件和维修状态按具体实物与目录证据区分。",
  };
}

function claim(
  sourceItem: { key: string; summary: string },
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  confidence = 0.96,
): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence,
    sourceKey: sourceItem.key,
    locator: sourceItem.summary,
    evidence: [{ key: `${key}-evidence`, sourceKey: sourceItem.key, scopeKey, locator: sourceItem.summary }],
  };
}

function refresh(
  base: CuratedEntityPack,
  key: string,
  scope: CuratedScope,
  claims: CuratedEntityPack["claims"],
  timeline: NonNullable<CuratedEntityPack["timeline"]>,
): CuratedEntityPack {
  return {
    ...base,
    key,
    scopes: [...base.scopes, scope],
    claims: [...base.claims, ...claims],
    timeline: [...(base.timeline ?? []), ...timeline],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const tmBase = modelFrom(PHASE451_MODEL_IDS.touchdownTm, "Touchdown TM");
const balanceBase = modelFrom(PHASE451_MODEL_IDS.craftsmanBalance, "Craftsman Balance");
const tipDipBase = modelFrom(PHASE451_MODEL_IDS.craftsmanTipDip, "Craftsman Tip-Dip");

const tmPenhero = source("phase56-penhero-tm", "Touchdown TM");
const tmProfile = source("phase56-sheaffer-touchdown-profile", "Touchdown TM profile");
const tmGuide = source("phase56-penhero-touchdown-guide", "Touchdown filling guide");
const tmRepair = source("phase56-vintagepens-touchdown-repair", "Touchdown repair");
const tmPeyton = source("phase56-peyton-identifier", "TM identifier");
const tmSentinel = source("phase56-peyton-sentinel-tm", "Sentinel TM sample");

const balanceCraftsman = source("phase56-sheaffer-craftsman", "Craftsman Balance");
const balanceProfile = source("phase56-sheaffer-balance", "Balance profile");
const balance1948 = source("phase56-penhero-1948-taxonomy", "Craftsman taxonomy");
const balanceRepair = source("phase56-vintagepens-touchdown-repair", "Balance repair boundary");
const balancePeyton = source("phase56-peyton-identifier", "Balance identifier boundary");

const tipDipPenhero = source("phase56-penhero-tip-dip", "Tip-Dip");
const tipDipGuide = source("phase56-penhero-touchdown-guide", "Tip-Dip filling guide");
const tipDipCraftsman = source("phase56-sheaffer-craftsman", "Tip-Dip Craftsman");
const tipDipSnorkel = source("phase56-sheaffer-snorkel", "Tip-Dip/Snorkel boundary");
const tipDipRepair = source("phase56-vintagepens-touchdown-repair", "Tip-Dip repair");
const tipDipPeyton = source("phase56-peyton-identifier", "Tip-Dip identifier");

const tmScope = currentScope("touchdown-tm");
const balanceScope = currentScope("craftsman-balance");
const tipDipScope = currentScope("craftsman-tip-dip-touchdown");

export const phase451SheafferTouchdownCraftsmanPacks: CuratedEntityPack[] = [
  refresh(
    tmBase,
    "phase451-sheaffer-touchdown-tm-depth-v1",
    tmScope,
    [
      claim(tmPenhero, tmScope.scopeKey, "phase451-tm-family", "family_identity", "Touchdown TM 是 1950–1952 年的 Thin Model 气压上墨家族；TM 描述细身产品线，不是脱离 Sentinel、Valiant 或 Craftsman 成员的单一 model no。"),
      claim(tmProfile, tmScope.scopeKey, "phase451-tm-chronology", "historical_boundary", "1949 fat Touchdown、1950 前后的 Thin Model 与 1952 Snorkel 是相邻但可分辨的时间节点；年代是家族窗口，不能替代具体个体日期。"),
      claim(tmGuide, tmScope.scopeKey, "phase451-tm-mechanism", "mechanism_boundary", "TM 使用 Touchdown pneumatic filler，没有 Snorkel 伸缩管；PFM 和 Snorkel 的管件、嵌入尖与维修方法不回填本页。"),
      claim(tmRepair, tmScope.scopeKey, "phase451-tm-care", "maintenance_boundary", "墨囊、O-ring、柱塞和密封决定 TM 的气密性；室温清水可作温和吸排，不以热水、酒精或反复强压替代维修。"),
      claim(tmPeyton, tmScope.scopeKey, "phase451-tm-identification", "selection_boundary", "鉴定 TM 应同时记录薄身轮廓、透明握位环、尾端、笔尖、帽材和是否有 snorkel；Sentinel 单样本的长度不能扩展为全家族规格。"),
      claim(tmSentinel, tmScope.scopeKey, "phase451-tm-sample", "sample_scope", "Peyton Street 的 Sentinel TM 约 5 5/16 英寸闭帽、无 snorkel、Touchdown 和修复状态只绑定该实物记录，不是所有 TM 成员的统一尺寸。"),
    ],
    [{ key: "phase451-tm-depth", title: "Phase 451：Touchdown TM 的细身、机制与 Snorkel 前后边界", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "把 TM 的 Thin Model 身份、Touchdown 气压结构、Sentinel 样本和维修证据放回同一 canonical 页面。", sourceKey: tmPenhero.key }],
  ),
  refresh(
    balanceBase,
    "phase451-sheaffer-craftsman-balance-depth-v1",
    balanceScope,
    [
      claim(balanceCraftsman, balanceScope.scopeKey, "phase451-craftsman-balance-family", "family_identity", "Craftsman (Balance) 是 1930 年代中期至战后早期的 Balance-era 低价全尺寸命名，不是所有线环 Sheaffer 的总称，也不等同于后来的 Tip-Dip Craftsman。"),
      claim(balanceProfile, balanceScope.scopeKey, "phase451-craftsman-balance-shape", "version_boundary", "Balance 流线轮廓、全尺寸定位、No. 3/33 开放式尖与杠杆/Vacuum-Fil 配置共同构成候选；单一尖号或价格刻印不能独立确认身份。"),
      claim(balance1948, balanceScope.scopeKey, "phase451-craftsman-balance-33", "nib_boundary", "后期 No. 33 尖不能直接改称 33T；33T 是 1948 目录中的具体 lever-fill 身份，属于另一页。"),
      claim(balanceRepair, balanceScope.scopeKey, "phase451-craftsman-balance-care", "maintenance_boundary", "杠杆版先检查墨囊、压条、section 和赛璐珞应力裂；Vacuum-Fil 版要检查柱塞与密封，不能套用 Touchdown O-ring 流程或暴力拆解。"),
      claim(balancePeyton, balanceScope.scopeKey, "phase451-craftsman-balance-selection", "selection_boundary", "选购时应索要笔夹/白点、尖面刻字、价格或笔身刻印、上墨机构与帽口照片；无这些证据时按待核验普通老 Sheaffer 处理。"),
    ],
    [{ key: "phase451-craftsman-balance-depth", title: "Phase 451：Craftsman (Balance) 的 No. 3/33、材料与老上墨维护", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "深化 Balance-era Craftsman 的产品等级、尖号、33T 排除、材料风险和杠杆/Vacuum-Fil 选购边界。", sourceKey: balanceCraftsman.key }],
  ),
  refresh(
    tipDipBase,
    "phase451-sheaffer-craftsman-tip-dip-depth-v1",
    tipDipScope,
    [
      claim(tipDipPenhero, tipDipScope.scopeKey, "phase451-tip-dip-family", "model_identity", "Craftsman Tip-Dip Touchdown 是 1952 年后低价气压型号，以中心开口和可换不锈钢尖实现只浸尖端的上墨路径；它不是 Snorkel。"),
      claim(tipDipGuide, tipDipScope.scopeKey, "phase451-tip-dip-mechanism", "mechanism_boundary", "Tip-Dip 保留 Touchdown 囊体、柱塞和尾部压力逻辑，但没有 Snorkel 伸缩管或 PFM 嵌入尖；中心开口与普通开放式尖的差异必须实物核对。"),
      claim(tipDipCraftsman, tipDipScope.scopeKey, "phase451-tip-dip-variant", "version_boundary", "线纹镀铬帽、SHEAFFER’S 夹子、塑料笔杆和可换尖是 Craftsman Tip-Dip 的组合线索；Cadet 的塑料帽和帽环不能回填。"),
      claim(tipDipRepair, tipDipScope.scopeKey, "phase451-tip-dip-care", "maintenance_boundary", "墨囊、O-ring、柱塞、section 和中心通道要分别清洁与维修；室温清水可用于吸排，热水、强溶剂和强力拧转会增加老材料风险。"),
      claim(tipDipPeyton, tipDipScope.scopeKey, "phase451-tip-dip-selection", "selection_boundary", "选购至少要看到帽件、夹子、尖单元中心开口和尾端四组照片；颜色、5 英寸级长度和 1955 价格只能作为历史参考。"),
      claim(tipDipSnorkel, tipDipScope.scopeKey, "phase451-tip-dip-sibling", "sibling_boundary", "Tip-Dip、TM、Snorkel、PFM 共享 Sheaffer 的技术谱系但不共享规格；看到真正伸缩管时应转到 Snorkel 身份路径。"),
    ],
    [{ key: "phase451-tip-dip-depth", title: "Phase 451：Tip-Dip 中心开口、可换尖与 Touchdown 维修边界", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "补足 Tip-Dip 的低价线身份、中心开口、可换尖、Touchdown 囊体和与 TM/Snorkel 的排除关系。", sourceKey: tipDipPenhero.key }],
  ),
];

if (new Set(phase451SheafferTouchdownCraftsmanPacks.map((pack) => pack.entityId)).size !== 3) {
  throw new Error("Phase 451 Sheaffer Touchdown/Craftsman pack must contain three unique models.");
}
