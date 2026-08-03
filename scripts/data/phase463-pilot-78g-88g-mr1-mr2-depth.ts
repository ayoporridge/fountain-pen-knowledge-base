import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE127_78G_ID,
  phase127Packs,
} from "./phase127-pilot-78g-88g-mr";

const mr1Id = "phase127-pilot-88g-mr1";
const mr2Id = "phase127-pilot-88g-mr2";

export const PHASE463_IDS = {
  pilot78g: PHASE127_78G_ID,
  mr1: mr1Id,
  mr2: mr2Id,
} as const;

const allBasePacks = phase127Packs;

function base(entityId: string, label: string): CuratedEntityPack {
  const pack = allBasePacks.find((candidate) => candidate.entityId === entityId);
  if (!pack) throw new Error(`Phase 463 ${label} pack is missing.`);
  return pack;
}

function source(key: string, label: string): CuratedSource {
  const found = allBasePacks.flatMap((pack) => pack.sources).find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Phase 463 ${label} source ${key} is missing.`);
  return found;
}

function scope(slug: string): CuratedScope {
  const key = `phase463-${slug}-depth`;
  return {
    key,
    scopeKey: key,
    productionState: "current",
    editionScope:
      "Phase 463 Pilot 78G／88G MR exact product 深化；中国 current、地区 alias、历史样本、converter 与图案变体分层记录，不把相邻产品号合并。",
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
    factClass: ["use_and_care", "selection_boundary", "selection_guidance"].includes(predicate)
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

const pilot78g = base(PHASE463_IDS.pilot78g, "Pilot 78G");
const mr1 = base(PHASE463_IDS.mr1, "Pilot 88G MR1");
const mr2 = base(PHASE463_IDS.mr2, "Pilot 88G MR2");

const g78Official = source("phase127-78g-official", "FP-78G official China page");
const g78Listing = source("phase127-pilot-china-fountain-list", "Pilot China fountain listing");
const g78Con40 = source("phase127-pilot-con40-manual", "Pilot CON-40 manual");
const g78Review = source("phase127-ilpennofilo-78gplus", "78G+ independent sample");

const mr1Official = source("phase127-mr1-official", "FP-MR1 official China page");
const mr1Regional = source("phase127-pilot-australia-mr-range", "Pilot Australia MR range");
const mr1Review = source("phase127-penaddict-mr1", "MR1 independent sample");

const mr2Official = source("phase127-mr2-official", "FP-MR2 official China page");
const mr2Regional = source("phase127-pilot-europe-mr-catalogue", "Pilot Europe MR catalogue");
const mr2Review = source("phase127-penaddict-mr2", "MR2 independent sample");

const g78Scope = scope("pilot-78g");
const mr1Scope = scope("pilot-88g-mr1");
const mr2Scope = scope("pilot-88g-mr2");

export const phase463Pilot78g88gMr1Mr2DepthPacks: CuratedEntityPack[] = [
  refresh(
    pilot78g,
    "phase463-pilot-78g-depth-v1",
    g78Scope,
    [
      claim(g78Official, g78Scope.scopeKey, "phase463-78g-identity", "model_identity", "Pilot China current FP-78G 是一条树脂 78G 产品线；78G+ 是玩家／渠道区分新旧批次的 alias，不创建第二个基础实体。"),
      claim(g78Official, g78Scope.scopeKey, "phase463-78g-variants", "variant_boundary", "中国官网列 EF/F/M/B、十种颜色代码和 FP-78G；透明 NC、柔和新色与尖幅都属于同一型号的 coded variants，不把十色拆成十页。"),
      claim(g78Con40, g78Scope.scopeKey, "phase463-78g-fill", "current_fill_system", "当前中国页面的 CON-40 与 Pilot 墨囊是 current compatibility；老 78G 的旧 squeeze converter、海外旧库存或店家重配附件必须另记。"),
      claim(g78Review, g78Scope.scopeKey, "phase463-78g-sample", "sample_boundary", "Il Pennofilo 2022 78G+ F 的 135/123/149 mm、约 12.40 g 与书写感只属于一个样本；不能替中国官网定义全系列公差或所有 B 尖磨形。"),
      claim(g78Con40, g78Scope.scopeKey, "phase463-78g-care", "use_and_care", "CON-40 用常温清水吸排并自然干燥，树脂螺纹避免斜扣、过扭、热水、酒精和硬刷；温差或飞行时笔尖朝上。"),
      claim(g78Listing, g78Scope.scopeKey, "phase463-78g-selection", "selection_guidance", "78G 适合轻树脂、较多尖幅和易清洗的 Pilot 日用；想要金属重量转 MR1/MR2/MR3，想要短卡扣帽转 Prera/Kakuno，不能互换规格。"),
    ],
    [{ key: "phase463-78g-depth", title: "Phase 463：Pilot FP-78G 的新旧 alias、CON-40 与尖幅边界", eventType: "design_milestone", startDate: "2026-08-04", circa: false, description: "重核 FP-78G 当前十色、EF/F/M/B、CON-40 与 78G+ 历史样本边界。", sourceKey: g78Official.key }],
  ),
  refresh(
    mr1,
    "phase463-pilot-88g-mr1-depth-v1",
    mr1Scope,
    [
      claim(mr1Official, mr1Scope.scopeKey, "phase463-mr1-identity", "model_identity", "Pilot China FP-MR1 是 88G MR1 Classic 的 exact product；Metropolitan Black Plain 是地区 alias，不与 MR2 动物纹或 MR3 Retro Pop 合并。"),
      claim(mr1Official, mr1Scope.scopeKey, "phase463-mr1-codes", "variant_boundary", "SIP/SID/GDP/GDZ/BP 五个编码分别保留银平纹、银波点、金平纹、金格纹与黑平纹，官方页面的数量文字矛盾不能成为删码理由。"),
      claim(mr1Official, mr1Scope.scopeKey, "phase463-mr1-fill", "regional_fill_boundary", "中国 FP-MR1 采用 Pilot 墨囊与 CON-40；若商品来自其他市场，converter 与 cartridge standard 要按包装核对，不能把地区附件互相覆盖。"),
      claim(mr1Review, mr1Scope.scopeKey, "phase463-mr1-sample", "sample_boundary", "The Pen Addict 2013 美国 Black Plain／M 样本的金属重量、桶身台阶和顺滑只属于该支样笔，不是中国 exact page 的尺寸或全系手感。"),
      claim(g78Con40, mr1Scope.scopeKey, "phase463-mr1-care", "use_and_care", "CON-40 安装和清洗按 Pilot 官方说明执行；金属磨砂面与中环避免酒精、研磨剂和长时间浸泡，长期停用前排空并清洗。"),
      claim(mr1Regional, mr1Scope.scopeKey, "phase463-mr1-selection", "selection_boundary", "MR1 适合金属重量与经典素色；丰富图案看 MR2/MR3，轻细树脂看 Cavalier/78G，所有比较都保留 exact product number 与地区供墨边界。"),
    ],
    [{ key: "phase463-mr1-depth", title: "Phase 463：Pilot FP-MR1 五个花纹代码与地区供墨", eventType: "design_milestone", startDate: "2026-08-04", circa: false, description: "补足 MR1 五个编码、金属台阶、CON-40 与 Metropolitan 地区名称分流。", sourceKey: mr1Official.key }],
  ),
  refresh(
    mr2,
    "phase463-pilot-88g-mr2-depth-v1",
    mr2Scope,
    [
      claim(mr2Official, mr2Scope.scopeKey, "phase463-mr2-identity", "model_identity", "Pilot China FP-MR2 是 88G MR2 Animal 的 exact product；White Tiger 只是 WTG 图案 variant，不是独立型号。"),
      claim(mr2Official, mr2Scope.scopeKey, "phase463-mr2-codes", "variant_boundary", "LZD/LPD/WTG/CDL/PTN 五个代码用于蜥蜴、豹、白虎、鳄纹和蟒纹图案；名称不是动物皮革材质结论。"),
      claim(mr2Official, mr2Scope.scopeKey, "phase463-mr2-fill", "regional_fill_boundary", "中国页面支持 Pilot 墨囊与 CON-40；欧洲 MR Animal catalogue 的 DIN cartridge 属于地区版本，购买前先确认包装与接嘴。"),
      claim(mr2Review, mr2Scope.scopeKey, "phase463-mr2-sample", "sample_boundary", "The Pen Addict 2015 White Tiger／F 美国样本记录金属重量、细线和使用感，只用于样品语境，不替中国 FP-MR2 证明公差或盒内附件。"),
      claim(g78Con40, mr2Scope.scopeKey, "phase463-mr2-care", "use_and_care", "CON-40 以笔尖和呼吸孔浸入墨水后缓慢吸墨；换色用室温清水，动物纹中环和磨砂面避免酒精、研磨剂、热水与整笔超声。"),
      claim(mr2Regional, mr2Scope.scopeKey, "phase463-mr2-selection", "selection_guidance", "MR2 适合金属重量与图案；经典素色转 MR1，Retro Pop 转 MR3，轻树脂转 78G/Prera，不能以一张 White Tiger 图代表全系。"),
    ],
    [{ key: "phase463-mr2-depth", title: "Phase 463：Pilot FP-MR2 动物纹代码与 DIN／CON-40 边界", eventType: "design_milestone", startDate: "2026-08-04", circa: false, description: "补足 MR2 五个图案代码、地区供墨、样品体验和表面维护。", sourceKey: mr2Official.key }],
  ),
];

