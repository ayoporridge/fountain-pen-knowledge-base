import type { CuratedEntityPack, CuratedScope } from "../lib/curated-content-pack";
import {
  PHASE62_BALANCE_ID,
  PHASE62_PFM_ID,
  PHASE62_SNORKEL_ID,
  phase62SheafferPacks,
} from "./phase62-sheaffer-p0";

export const PHASE450_MODEL_IDS = {
  balance: PHASE62_BALANCE_ID,
  snorkel: PHASE62_SNORKEL_ID,
  pfm: PHASE62_PFM_ID,
} as const;

function modelFrom(entityId: string, label: string): CuratedEntityPack {
  const pack = phase62SheafferPacks.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 450 ${label} model pack is missing.`);
  return pack;
}

function scope(slug: string): CuratedScope {
  const key = `phase450-${slug}-historical-model`;
  return {
    key,
    scopeKey: key,
    productionState: "historical",
    editionScope: "Phase 450 Sheaffer 历史型号深化；家族身份、版本边界、维修条件与实物证据分开记录。",
  };
}

function claim(
  sourceKey: string,
  sourceSummary: string,
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
    sourceKey,
    locator: sourceSummary,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator: sourceSummary }],
  };
}

function source(pack: CuratedEntityPack, key: string, label: string) {
  const found = pack.sources.find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Phase 450 ${label} source ${key} is missing.`);
  return found;
}

function refresh(
  base: CuratedEntityPack,
  key: string,
  currentScope: CuratedScope,
  claims: CuratedEntityPack["claims"],
  timeline: NonNullable<CuratedEntityPack["timeline"]>,
): CuratedEntityPack {
  return {
    ...base,
    key,
    scopes: [...base.scopes, currentScope],
    claims: [...base.claims, ...claims],
    timeline: [...(base.timeline ?? []), ...timeline],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const balanceBase = modelFrom(PHASE450_MODEL_IDS.balance, "Sheaffer Balance");
const snorkelBase = modelFrom(PHASE450_MODEL_IDS.snorkel, "Sheaffer Snorkel");
const pfmBase = modelFrom(PHASE450_MODEL_IDS.pfm, "Sheaffer PFM");

const balanceSource = source(balanceBase, "phase62-richards-balance", "Balance");
const chronologySource = source(balanceBase, "phase62-penhero-penography", "Balance chronology");
const balanceRepair = source(balanceBase, "phase62-vintagepens-snorkel-pfm", "Balance repair");
const snorkelSource = source(snorkelBase, "phase62-penhero-snorkel", "Snorkel");
const snorkelProfile = source(snorkelBase, "phase62-richards-snorkel", "Snorkel profile");
const snorkelRepair = source(snorkelBase, "phase62-vintagepens-snorkel-pfm", "Snorkel repair");
const pfmSource = source(pfmBase, "phase62-penhero-pfm", "PFM");
const pfmProfile = source(pfmBase, "phase62-richards-pfm", "PFM profile");
const inlaidSource = source(pfmBase, "phase62-penhero-inlaid", "inlaid nib chronology");
const pfmRepair = source(pfmBase, "phase62-vintagepens-snorkel-pfm", "PFM repair");

const balanceScope = scope("sheaffer-balance");
const snorkelScope = scope("sheaffer-snorkel");
const pfmScope = scope("sheaffer-pfm");

export const phase450SheafferBalanceSnorkelPfmPacks: CuratedEntityPack[] = [
  refresh(
    balanceBase,
    "phase450-sheaffer-balance-depth-v1",
    balanceScope,
    [
      claim(balanceSource.key, balanceSource.summary, balanceScope.scopeKey, "phase450-balance-family", "family_identity", "Balance 是 1929 年起的流线型产品家族，而不是覆盖所有尺寸、尖和填充方式的单一 SKU。"),
      claim(chronologySource.key, chronologySource.summary, balanceScope.scopeKey, "phase450-balance-chronology", "historical_boundary", "Balance 的主要历史阶段位于 1929 至约 1941 年；具体年份、等级和停产判断应回到目录与实物刻字。"),
      claim(balanceSource.key, balanceSource.summary, balanceScope.scopeKey, "phase450-balance-variant", "version_boundary", "早期 lever-fill 与 Vacuum-Fil 等上墨路径可共存于 Balance 时代；Craftsman、Tuckaway、33T 与 Touchdown TM 不能因流线外形相似而并入。"),
      claim(balanceRepair.key, balanceRepair.summary, balanceScope.scopeKey, "phase450-balance-care", "maintenance_boundary", "老 Balance 的墨囊、真空密封、赛璐珞和替换件应由专业维修者分别检查；不以热水、酒精或蛮力拆解作验证。"),
      claim(balanceSource.key, balanceSource.summary, balanceScope.scopeKey, "phase450-balance-selection", "selection_boundary", "购买 Balance 时，维修记录、笔尖刻字、填充方式和尺寸测量比卖家使用的稀有颜色或等级简称更能支撑个体判断。"),
    ],
    [{ key: "phase450-balance-depth", title: "Phase 450：Balance 家族、版本证据与维修边界", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "把 Balance 的流线家族身份、上墨阶段、相邻型号与个体维修证据放回 canonical 型号页。", sourceKey: balanceSource.key }],
  ),
  refresh(
    snorkelBase,
    "phase450-sheaffer-snorkel-depth-v1",
    snorkelScope,
    [
      claim(snorkelSource.key, snorkelSource.summary, snorkelScope.scopeKey, "phase450-snorkel-family", "family_identity", "Snorkel 是约 1952–1959 年的 Sheaffer 产品家族，以 Touchdown 气压结构配合伸缩吸墨管；成员等级和尖材仍需逐支核对。"),
      claim(snorkelProfile.key, snorkelProfile.summary, snorkelScope.scopeKey, "phase450-snorkel-members", "version_boundary", "Admiral、Statesman、Crest 等成员共享机制语境，却不共享固定帽材、笔尖或 trim；只有伸缩管能动不足以完成成员鉴定。"),
      claim(snorkelSource.key, snorkelSource.summary, snorkelScope.scopeKey, "phase450-snorkel-mechanism", "mechanism_boundary", "Snorkel 的核心是可收回的吸墨管与 Touchdown 压力系统；它不是普通 lever-fill、Touchdown TM 或 PFM 的泛称。"),
      claim(snorkelRepair.key, snorkelRepair.summary, snorkelScope.scopeKey, "phase450-snorkel-care", "maintenance_boundary", "墨囊、O-ring、压力管、伸缩管和密封件需要协同工作；异常阻力、漏气或管口变形时应停止灌墨并交给熟悉该结构的维修者。"),
      claim(snorkelProfile.key, snorkelProfile.summary, snorkelScope.scopeKey, "phase450-snorkel-selection", "selection_boundary", "购买 Snorkel 应优先看伸缩状态、尾端压力、笔尖照片和维修记录，而不是先按罕见颜色或广告等级支付溢价。"),
    ],
    [{ key: "phase450-snorkel-depth", title: "Phase 450：Snorkel 机制、成员边界与可维修性", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "将 Snorkel 的 Touchdown + 伸缩管机制、成员识别、维修和选购证据分开呈现。", sourceKey: snorkelSource.key }],
  ),
  refresh(
    pfmBase,
    "phase450-sheaffer-pfm-depth-v1",
    pfmScope,
    [
      claim(pfmSource.key, pfmSource.summary, pfmScope.scopeKey, "phase450-pfm-family", "family_identity", "PFM（Pen For Men）是 1959–1968 年的 Sheaffer 旗舰家族，以 Snorkel 结构和嵌入式笔尖为核心，不是普通 Snorkel 的一行变体。"),
      claim(pfmSource.key, pfmSource.summary, pfmScope.scopeKey, "phase450-pfm-nib", "version_boundary", "PFM I/II 使用钯银嵌入尖，III–V 使用 14K 嵌入尖；罗马数字和尖材不能由外观或单一卖家标题推断。"),
      claim(inlaidSource.key, inlaidSource.summary, pfmScope.scopeKey, "phase450-pfm-lineage", "family_boundary", "PFM 位于 Sheaffer 嵌入尖谱系的早期旗舰节点；Imperial、Targa 和 Legacy 各有独立年代、上墨与尖材，不能回填 PFM 规格。"),
      claim(pfmRepair.key, pfmRepair.summary, pfmScope.scopeKey, "phase450-pfm-care", "maintenance_boundary", "PFM 的 Snorkel 墨囊、O-ring、压力管和伸缩管需要专门维修；室温清水可作温和清洗，热水、强溶剂和强拉管子都有风险。"),
      claim(pfmProfile.key, pfmProfile.summary, pfmScope.scopeKey, "phase450-pfm-selection", "selection_boundary", "PFM 选购应把版本证据、尖材、上墨测试、维修记录和目标线宽放在稀有度与价格之前；写得出不等于内部健康。"),
    ],
    [{ key: "phase450-pfm-depth", title: "Phase 450：PFM I–V 尖材边界与 Snorkel 维修证据", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "补充 PFM 的旗舰家族身份、I/II 与 III–V 尖材分界、嵌入尖谱系和维修/选购条件。", sourceKey: pfmSource.key }],
  ),
];

if (new Set(phase450SheafferBalanceSnorkelPfmPacks.map((pack) => pack.entityId)).size !== 3) {
  throw new Error("Phase 450 Sheaffer depth pack must contain three unique models.");
}
