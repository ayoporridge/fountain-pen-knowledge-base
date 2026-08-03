import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE181_IDS,
  PHASE181_MAJOHN_BRAND_ID,
  phase181MajohnPacks,
} from "./phase181-majohn-q1-m2-p140-p141";

export const PHASE459_MAJOHN_IDS = {
  brand: PHASE181_MAJOHN_BRAND_ID,
  p140: PHASE181_IDS.p140,
  p141: PHASE181_IDS.p141,
} as const;

const allBasePacks = phase181MajohnPacks;

function base(entityId: string, label: string): CuratedEntityPack {
  const pack = allBasePacks.find((candidate) => candidate.entityId === entityId);
  if (!pack) throw new Error(`Phase 459 ${label} pack is missing.`);
  return pack;
}

function source(key: string, label: string): CuratedSource {
  const found = allBasePacks.flatMap((pack) => pack.sources).find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Phase 459 ${label} source ${key} is missing.`);
  return found;
}

function scope(slug: string, productionState: CuratedScope["productionState"] = "current"): CuratedScope {
  const key = `phase459-${slug}-depth`;
  return {
    key,
    scopeKey: key,
    productionState,
    editionScope:
      "Phase 459 型号深化；名称、机构、批次、维护与购买边界按来源粒度记录，不把单支样本外推为全系列规格。",
  };
}

function claim(
  sourceItem: CuratedSource,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  confidence = 0.95,
): CuratedEntityPack["claims"][number] {
  const locator = sourceItem.summary || sourceItem.title;
  return {
    key,
    predicate,
    objectText,
    factClass: predicate === "use_and_care" || predicate === "editorial_boundary" ? "editorial" : "core",
    confidence,
    sourceKey: sourceItem.key,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey: sourceItem.key, scopeKey, locator }],
  };
}

function refresh(
  basePack: CuratedEntityPack,
  key: string,
  depthScope: CuratedScope,
  claims: CuratedEntityPack["claims"],
  timeline: NonNullable<CuratedEntityPack["timeline"]>,
): CuratedEntityPack {
  return {
    ...basePack,
    key,
    scopes: [...basePack.scopes, depthScope],
    claims: [...basePack.claims, ...claims],
    timeline: [...(basePack.timeline ?? []), ...timeline],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const brandBase = base(PHASE459_MAJOHN_IDS.brand, "Majohn brand");
const p140Base = base(PHASE459_MAJOHN_IDS.p140, "Majohn P140");
const p141Base = base(PHASE459_MAJOHN_IDS.p141, "Majohn P141");

const justia = source("majohn-justia-trademark", "Majohn trademark");
const wtr = source("majohn-wtr-transition", "Moonman-to-Majohn transition");
const a1Launch = source("majohn-fpn-a1-launch", "A1 launch context");
const ct = source("majohn-lumafield-ct", "A1 CT study");
const p140Rupert = source("phase181-majohn-p140-rupert", "P140 measurement review");
const p140Sbre = source("phase181-majohn-p140-sbre", "P140 review");
const p140Fpn = source("phase181-majohn-p140-fpn", "P140 introduction");
const p141Fpn = source("phase181-majohn-p141-fpn", "P141 identity discussion");
const p141Ti = source("phase181-majohn-p141-ti141", "Ti141 material discussion");
const p141Retail = source("phase181-majohn-p141-retail", "P141 SKU context");

const brandScope = scope("majohn-brand", "current");
const p140Scope = scope("majohn-p140", "current");
const p141Scope = scope("majohn-p141", "current");

export const phase459MajohnBrandP140P141DepthPacks: CuratedEntityPack[] = [
  refresh(
    brandBase,
    "phase459-majohn-brand-depth-v1",
    brandScope,
    [
      claim(
        justia,
        brandScope.scopeKey,
        "phase459-majohn-legal-boundary",
        "brand_identity_boundary",
        "MAJOHN 的公开商标记录能固定申请主体、日期和钢笔商品类别，但不等于完整公司史、制造商清单或所有型号的共同设计声明。",
      ),
      claim(
        wtr,
        brandScope.scopeKey,
        "phase459-majohn-name-continuity",
        "former_name_boundary",
        "Moonman 是转用 Majohn 过程中的历史名称与检索别名；旧刻字和旧包装可以保留为时间线索，不因此复制当前品牌实体。",
      ),
      claim(
        a1Launch,
        brandScope.scopeKey,
        "phase459-majohn-market-evidence",
        "market_evidence_boundary",
        "A1 同期讨论证明 Majohn 销售名与 Moon Man 笔身标记曾在过渡期并存；这属于市场记录，不替代制造商正式发布日期。",
      ),
      claim(
        ct,
        brandScope.scopeKey,
        "phase459-majohn-mechanism-scope",
        "mechanism_evidence_boundary",
        "A1 的工业 CT 只能说明受测样本的伸缩尖、弹簧与遮门结构；按动、直灌、活塞和金属路线必须回到各自型号来源。",
      ),
      claim(
        a1Launch,
        brandScope.scopeKey,
        "phase459-majohn-navigation-rule",
        "editorial_boundary",
        "品牌页负责名称沿革和证据导航，型号页负责具体尖号、尺寸、材料、上墨和维护；零售标题中的颜色或“新版”不自动创建新实体。",
      ),
    ],
    [
      {
        key: "phase459-majohn-brand-depth",
        title: "Phase 459：Majohn 品牌证据与型号导航边界",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足商标线索、Moonman 名称过渡、A1 机构证据和品牌页与型号页的责任边界；不扩写未经来源支持的企业史。",
        sourceKey: justia.key,
      },
    ],
  ),
  refresh(
    p140Base,
    "phase459-majohn-p140-depth-v1",
    p140Scope,
    [
      claim(
        p140Rupert,
        p140Scope.scopeKey,
        "phase459-p140-sample-measurement",
        "sample_specification",
        "公开样本约 155 mm 合盖、133 mm 不含笔帽、帖帽约 170 mm；约 38.5 g 含墨和约 27.5 g 笔身也只代表该支评测样本。",
      ),
      claim(
        p140Rupert,
        p140Scope.scopeKey,
        "phase459-p140-internal-material",
        "sample_material_boundary",
        "评测样本记录黄铜活塞与乌木进墨件；这是可引用的样本观察，不能倒填到 P141 或声称覆盖所有 P140 批次。",
      ),
      claim(
        p140Sbre,
        p140Scope.scopeKey,
        "phase459-p140-writing",
        "nib_writing_boundary",
        "P140 的大型 #8 路线适合较宽笔画，但独立评测中 F 尖写感接近 M，实际线宽仍受尖端调校、墨水和纸张影响。",
      ),
      claim(
        p140Fpn,
        p140Scope.scopeKey,
        "phase459-p140-model-boundary",
        "model_identity",
        "P140 是 Majohn 独立的大型透明活塞型号；发布讨论中的型号身份不应与 P141 钛合金非透明路线或 M2 直灌结构合并。",
      ),
      claim(
        p140Sbre,
        p140Scope.scopeKey,
        "phase459-p140-selection",
        "selection_boundary",
        "P140 的选择价值在于透明墨仓、大活塞和大尖面；偏好轻量、细尖或快速换墨的人，应先比较体积和维护负担，而非只看容量。",
      ),
      claim(
        p140Rupert,
        p140Scope.scopeKey,
        "phase459-p140-care",
        "use_and_care",
        "透明活塞笔适合用少量清水先做吸排检查；清洗避免热水、酒精和漂白剂，活塞阻力异常、空转或持续漏墨时停止加力并走售后。",
      ),
    ],
    [
      {
        key: "phase459-p140-depth",
        title: "Phase 459：Majohn P140 的透明活塞样本与选购边界",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足 P140 样本测量、内部材料、八号尖线宽、透明结构检查、旅行清洗和二手身份核对。",
        sourceKey: p140Rupert.key,
      },
    ],
  ),
  refresh(
    p141Base,
    "phase459-majohn-p141-depth-v1",
    p141Scope,
    [
      claim(
        p141Fpn,
        p141Scope.scopeKey,
        "phase459-p141-identity",
        "model_identity",
        "P141 是 Majohn 与透明 P140 分开的非透明大型路线；讨论中的 P141、Ti141 名称应与具体刻字、材料和批次一起核对。",
      ),
      claim(
        p141Ti,
        p141Scope.scopeKey,
        "phase459-p141-material",
        "material_boundary",
        "钛合金路线主要描述笔身或笔帽，笔夹、活塞杆、进墨件、饰环和笔尖可能是其他材料；不能把“钛笔”扩写成全零件钛制。",
      ),
      claim(
        p141Fpn,
        p141Scope.scopeKey,
        "phase459-p141-nib",
        "nib_boundary",
        "公开讨论记录大型 #8 级别钢尖与早期 F 尖语境；尖号、刻花和实际线宽属于 SKU 或样本，不能照搬 P140 的评测线宽。",
      ),
      claim(
        p141Ti,
        p141Scope.scopeKey,
        "phase459-p141-internal",
        "batch_boundary",
        "玩家资料提到 P141 具体样本的活塞或进墨件可能不同；这提醒购买者核对内部件，但不构成全批次工程规格。",
      ),
      claim(
        p141Retail,
        p141Scope.scopeKey,
        "phase459-p141-market",
        "market_sku_boundary",
        "颜色、表面处理、笔夹和尖号是当代商品组合；若商品把 P141、Ti141 或 P140 Ti 混在一个标题，应先按身份未决处理。",
      ),
      claim(
        p141Ti,
        p141Scope.scopeKey,
        "phase459-p141-care",
        "use_and_care",
        "金属外壳用柔软布和室温水维护，螺纹干墨轻带即可；旋钮空转、握位漏墨或尖端受撞时停止使用并保留购买与批次证据。",
      ),
    ],
    [
      {
        key: "phase459-p141-depth",
        title: "Phase 459：Majohn P141 的钛合金路线与批次核对",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足 P141 的型号身份、钛合金范围、内部件差异、大尖面、金属维护、二手核对和与 P140 的分流。",
        sourceKey: p141Fpn.key,
      },
    ],
  ),
];
