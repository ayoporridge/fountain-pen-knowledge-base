import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE86_ELMO_02_ID,
  phase86MontegrappaElmoFamilyPacks,
} from "./phase86-montegrappa-elmo-family";
import {
  PHASE88_V200_ID,
  phase88AsvineVacuumPacks,
} from "./phase88-asvine-vacuum";
import {
  PHASE39_KING_PROFIT_ST_ID,
  phase39SailorKopModelPacks,
} from "./phase39-sailor-kop-models";

const ASVINE_BRAND_ID = "phase66-brand-4021dffad5ea8c4af6d7692b";

export const PHASE464_IDS = {
  elmo02: PHASE86_ELMO_02_ID,
  v200: PHASE88_V200_ID,
  kingProfitSt: PHASE39_KING_PROFIT_ST_ID,
} as const;

const montegrappaPacks = phase86MontegrappaElmoFamilyPacks();
const asvinePacks = phase88AsvineVacuumPacks(ASVINE_BRAND_ID);
const sailorPacks = phase39SailorKopModelPacks;

function base(entityId: string, label: string): CuratedEntityPack {
  const pack = [...montegrappaPacks, ...asvinePacks, ...sailorPacks].find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 464 ${label} pack is missing.`);
  return pack;
}

function source(pack: CuratedEntityPack, key: string, label: string): CuratedSource {
  const found = pack.sources.find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Phase 464 ${label} source ${key} is missing.`);
  return found;
}

function scope(slug: string): CuratedScope {
  const key = `phase464-${slug}-depth`;
  return {
    key,
    scopeKey: key,
    productionState: "current",
    editionScope:
      "Phase 464 exact product 深化；官方 SKU、地区商品、独立样本和相邻家族分开记录，不把颜色、套装或体验样本拆成重复型号。",
  };
}

function claim(
  sourceItem: CuratedSource,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
): CuratedEntityPack["claims"][number] {
  const locator = sourceItem.summary || sourceItem.title;
  return {
    key,
    predicate,
    objectText,
    factClass: ["use_and_care", "selection_guidance", "selection_boundary", "sample_boundary"].includes(predicate)
      ? "editorial"
      : "core",
    confidence: 0.96,
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

const elmoBase = base(PHASE464_IDS.elmo02, "Montegrappa Elmo 02");
const elmoHistory = montegrappaPacks
  .find((pack) => pack.expectedType === "brand")
  ?.sources.find((candidate) => candidate.key === "phase86-montegrappa-history");
if (!elmoHistory) throw new Error("Phase 464 Montegrappa history source is missing.");
const elmo02 = { ...elmoBase, sources: [...elmoBase.sources, elmoHistory] };
const v200 = base(PHASE464_IDS.v200, "Asvine V200");
const kingProfitSt = base(PHASE464_IDS.kingProfitSt, "Sailor King Profit ST");

const elmoOfficial = source(elmo02, "phase86-elmo-02-official", "Elmo 02 official");
const elmoRetailer = source(elmo02, "phase86-elmo-02-vecchietti", "Elmo 02 retailer");
const elmoCatalog = source(elmo02, "phase86-montegrappa-catalog", "Montegrappa catalog");

const v200Retailer = source(v200, "phase88-asvine-v200-retailer", "V200 product listing");
const v200Review = source(v200, "phase88-asvine-v200-sbrebrown", "V200 independent review");
const v200Sample = source(v200, "phase88-asvine-v200-reddit", "V200 user sample");
const v200Storefront = source(v200, "phase88-asvine-storefront", "Asvine storefront boundary");

const stOfficial = source(kingProfitSt, "phase39-sailor-11-6001", "King Profit ST official");
const stFamily = source(kingProfitSt, "phase39-sailor-kop-topic", "Sailor KOP family topic");
const stReview = source(kingProfitSt, "phase39-sailor-kop-fpn", "King Profit independent sample");
const stCare = source(kingProfitSt, "sailor-care", "Sailor care guidance");

const elmoScope = scope("montegrappa-elmo-02");
const v200Scope = scope("asvine-v200");
const stScope = scope("sailor-king-profit-st");

export const phase464MontegrappaElmo02AsvineV200SailorKDepthPacks: CuratedEntityPack[] = [
  refresh(
    elmo02,
    "phase464-montegrappa-elmo-02-depth-v1",
    elmoScope,
    [
      claim(elmoOfficial, elmoScope.scopeKey, "phase464-elmo-identity", "model_identity", "Montegrappa Elmo 02 是官方目录中的独立 C/C 树脂型号；142 mm、最大直径 17 mm、30 g 属于指定商品页，不把 Elmo 01 或 Elmo 02 Plus 的数字倒灌。"),
      claim(elmoOfficial, elmoScope.scopeKey, "phase464-elmo-fill", "fill_system", "Elmo 02 采用 cartridge/converter，当前官方页列两支墨囊与 converter；Plus 的一体活塞是相邻型号边界，不是普通 02 的隐藏配置。"),
      claim(elmoOfficial, elmoScope.scopeKey, "phase464-elmo-nibs", "variant_boundary", "EF/F/M/B/ST1/ST5 是同一 Elmo 02 的笔尖选项；尖幅、颜色和表面可以组成 SKU，但不能由单个尖幅创建新基础实体。"),
      claim(elmoRetailer, elmoScope.scopeKey, "phase464-elmo-dimensions", "measurement_boundary", "独立零售页对闭帽 142 mm、最大直径 17 mm 作交叉核对；17 mm 不是握位处处直径，30 g 也不自动包含墨水或 converter。"),
      claim(elmoOfficial, elmoScope.scopeKey, "phase464-elmo-care", "use_and_care", "C/C 换色用常温清水缓慢吸排并自然干燥；树脂、黄铜和镀层避免热水、酒精、强溶剂、研磨剂与无资料强拆，异常漏墨转售后或专业维修。"),
      claim(elmoCatalog, elmoScope.scopeKey, "phase464-elmo-selection", "selection_guidance", "需要较细较轻且同为 C/C 可比较 Elmo 01；需要更粗的 17 mm 轮廓和黄铜细节选 Elmo 02；需要活塞或按 SKU 选择金尖／Flex 则转 Elmo 02 Plus。"),
    ],
    [{ key: "phase464-elmo-02-depth", title: "Phase 464：Elmo 02 的 C/C、17 mm 与 Plus 排除边界", eventType: "design_milestone", startDate: "2026-08-04", circa: false, description: "补足 Elmo 02 当前规格、尖幅选项、保养与三支 Elmo 的选择分流。", sourceKey: elmoOfficial.key }],
  ),
  refresh(
    v200,
    "phase464-asvine-v200-depth-v1",
    v200Scope,
    [
      claim(v200Retailer, v200Scope.scopeKey, "phase464-v200-identity", "model_identity", "Asvine V200 是透明 acrylic、钛部件与真空上墨出现在同一商品 SKU 的具体型号；它不是 P36 活塞升级名，也不是 V126 的金属别称。"),
      claim(v200Retailer, v200Scope.scopeKey, "phase464-v200-vacuum", "fill_system", "真空杆的抽吸、止墨与储墨动作按对应说明和精确 SKU 执行；不能把别的真空笔阀门行程或拆装步骤当作 V200 通用说明。"),
      claim(v200Review, v200Scope.scopeKey, "phase464-v200-nib", "variant_boundary", "SBREBrown 评测中的 #6、Bock、钢尖信息属于受测样笔；当前商品的尖幅、刻印、替换性和扳手应按具体地区 SKU 与实物核对。"),
      claim(v200Sample, v200Scope.scopeKey, "phase464-v200-sample", "sample_boundary", "尾端钛部件的后重感、略滑握位和清洗后出墨变化只属于已注明的用户样本，不是每支 V200 的固定重量、平衡或质量结论。"),
      claim(v200Retailer, v200Scope.scopeKey, "phase464-v200-care", "use_and_care", "透明 acrylic、真空密封与钛部件只建议常温清水温和吸排和自然晾干；避免热水、酒精、强溶剂和无资料强拆，裂纹、漏气或尾端不顺应保留证据并咨询售后。"),
      claim(v200Storefront, v200Scope.scopeKey, "phase464-v200-selection", "selection_guidance", "需要透明真空与钛部件且能接受较长清洗周期时再选 V200；偏好活塞回到 P36，重视止墨阀与另一种地区配置比较 V126，三者不能共享规格或配件表。"),
    ],
    [{ key: "phase464-v200-depth", title: "Phase 464：V200 真空杆、钛部件与 SKU 样本边界", eventType: "design_milestone", startDate: "2026-08-04", circa: false, description: "补足 V200 的真空动作、笔尖／套装核验、维护限制与 P36/V126 选择分流。", sourceKey: v200Review.key }],
  ),
  refresh(
    kingProfitSt,
    "phase464-sailor-king-profit-st-depth-v1",
    stScope,
    [
      claim(stOfficial, stScope.scopeKey, "phase464-st-identity", "model_identity", "Sailor King Profit ST 的 exact product number 是 11-6001；11-6001-420 为 M、11-6001-620 为 B，不能用“King of Pens Gold”笼统标题替代货号。"),
      claim(stOfficial, stScope.scopeKey, "phase464-st-material", "variant_boundary", "11-6001 是 PMMA 树脂与金色电镀路线；11-7002 硬橡胶和 10-9618 平顶 Professional Gear KOP 是相邻具体型号，不能共享材料、轮廓或重量。"),
      claim(stOfficial, stScope.scopeKey, "phase464-st-dimensions", "measurement_boundary", "官方指定页给出含夹 φ20×153.5 mm、32.8 g；该条件属于 11-6001 商品页，不能外推至所有 KOP，也不说明是否含墨水或 converter。"),
      claim(stOfficial, stScope.scopeKey, "phase464-st-fill", "fill_system", "11-6001 为 Sailor 两用式，可用 Sailor 墨囊或上墨器；“支持 converter”与“盒内一定附 converter”要按包装和销售地分别记录。"),
      claim(stCare, stScope.scopeKey, "phase464-st-care", "use_and_care", "21K 超大型尖用低压力自然落笔；清洗用常温水缓慢吸排并自然干燥，PMMA 与电镀件避免热水、酒精、研磨剂和自行压尖。"),
      claim(stFamily, stScope.scopeKey, "phase464-st-selection", "selection_guidance", "喜欢圆润 Profit 轮廓、PMMA 与 153.5 mm 大笔身可看 11-6001；要硬橡胶转 11-7002，要平顶与 37.0 g 的 Pro Gear KOP 转 10-9618，不能因 KOP 总称合并。"),
      claim(stReview, stScope.scopeKey, "phase464-st-sample", "sample_boundary", "大型 Sailor KOP 的握持和维护观察只作为独立样本语境，不替官方 11-6001 页面新增尖幅、重量或墨流承诺。"),
    ],
    [{ key: "phase464-st-depth", title: "Phase 464：King Profit ST 11-6001 的货号、PMMA 与 KOP 分流", eventType: "design_milestone", startDate: "2026-08-04", circa: false, description: "补足 11-6001 M/B 货号、两用式、规格条件、维护和 11-7002／10-9618 排除边界。", sourceKey: stOfficial.key }],
  ),
];
