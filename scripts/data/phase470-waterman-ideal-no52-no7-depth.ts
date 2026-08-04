import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { PHASE162_IDS, phase162WatermanIdealPacks } from "./phase162-waterman-ideal";

const RETRIEVED = "2026-08-04";

export const PHASE470_IDS = {
  no52: PHASE162_IDS.no52,
  no7: PHASE162_IDS.no7,
} as const;

function claim(sourceKey: string, scopeKey: string, key: string, predicate: string, objectText: string, factClass: "core" | "editorial" = "core"): CuratedEntityPack["claims"][number] {
  const locator = `${key}: source-backed Phase 470 editorial boundary`;
  return { key, predicate, objectText, factClass, confidence: factClass === "core" ? 0.98 : 0.96, sourceKey, locator, evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }] };
}

function event(sourceKey: string, key: string, title: string, description: string): NonNullable<CuratedEntityPack["timeline"]>[number] {
  return { key, title, eventType: "design_milestone", startDate: RETRIEVED, circa: true, description, sourceKey };
}

function deepen(base: CuratedEntityPack, key: string, markdownFile: string, scopeKey: string, editionScope: string, claims: CuratedEntityPack["claims"], timeline: NonNullable<CuratedEntityPack["timeline"]>): CuratedEntityPack {
  return { ...base, key, markdownFile, scopes: [...base.scopes, { key: scopeKey, scopeKey, validFrom: RETRIEVED, productionState: "historical", editionScope }], claims: [...base.claims, ...claims], timeline: [...(base.timeline ?? []), ...timeline] };
}

const no52Base = phase162WatermanIdealPacks.find((pack) => pack.entityId === PHASE162_IDS.no52);
const no7Base = phase162WatermanIdealPacks.find((pack) => pack.entityId === PHASE162_IDS.no7);
if (!no52Base || !no7Base) throw new Error("Phase 470 Waterman Ideal canonical base packs are missing.");

const no52Scope = "phase470-waterman-ideal-no52-depth";
const no7Scope = "phase470-waterman-ideal-no7-depth";

const no52 = deepen(
  no52Base,
  "phase470-waterman-ideal-no52-depth-v1",
  ".planning/content-research/waterman-ideal-no52-phase162.md",
  no52Scope,
  "Waterman’s Ideal No. 52; numbering, boxed lever, hard rubber/Ripple, 52V and celluloid remain version-scoped.",
  [
    claim("phase162-no52-richard", no52Scope, "phase470-no52-numbering", "model_identity", "Ideal No.52 的 5 指杠杆、2 指 No.2 尖是 Waterman 编号体系的历史线索；52V、ringtop、overlay、Ripple 和 celluloid 是相邻版本，不是一个无差别规格。"),
    claim("phase162-no52-patent", no52Scope, "phase470-no52-lever", "filling_system", "Waterman boxed lever 专利说明杠杆盒结构的设计语境；现存样本的 sac、压条、feed 和 section 状态仍需按实物检查，专利不证明今天可用。"),
    claim("phase162-no52-richard", no52Scope, "phase470-no52-material", "variant_boundary", "硬橡胶、Ripple、overlay 与后期 celluloid 跨越不同年代和装饰线；材料、前缀数字和帽环要与刻字、目录和照片互相支持，不能凭颜色断代。"),
    claim("phase162-no52-richard", no52Scope, "phase470-no52-flex", "sample_boundary", "flexible、superflexible 或 wet noodle 是具体笔尖与保存状态的描述，不是 No.52 的型号保证；尖幅、弹性、feed 和替换史需要独立记录。"),
    claim("phase162-waterman-history", no52Scope, "phase470-no52-care", "maintenance_boundary", "硬橡胶、杠杆盒、section、螺纹和 sac 适合常温、低压力清洁；热水、酒精、长泡、强抛光和钳子拆卸会增加不可逆损伤。", "editorial"),
    claim("phase162-no52-richard", no52Scope, "phase470-no52-selection", "selection_guidance", "学习编号优先选刻字清楚、结构完整的普通样本；收藏再比较 Ripple、overlay、52V 与 celluloid；日用优先密封、出墨、笔尖健康和维修渠道。", "editorial"),
  ],
  [event("phase162-no52-richard", "phase470-no52-evidence-layer", "Ideal No.52 的编号与样本分层", "把编号历史、boxed lever 结构、材料版本、笔尖弹性和当前维修状态拆成可追溯字段。"),],
);

const no7 = deepen(
  no7Base,
  "phase470-waterman-ideal-no7-depth-v1",
  ".planning/content-research/waterman-ideal-no7-phase162.md",
  no7Scope,
  "Waterman’s Ideal No. 7; Ripple, color-coded nibs, casein bands, Jet color disk and later numeric 7 remain edition-scoped.",
  [
    claim("phase162-no7-richard", no7Scope, "phase470-no7-identity", "model_identity", "Ideal No.7 是较大型的 Waterman 彩色笔尖路线，1927 年后与 Ripple、casein 色带、Jet color disk 和后期数字 7 形成版本时间线。"),
    claim("phase162-no7-richard", no7Scope, "phase470-no7-color", "variant_boundary", "彩色笔尖、Emerald‑Ray、Jet、Sapphire、Pink、Red 及后期取消颜色名的尖需要与笔身、帽盖、刻字和材料共同核对；颜色近照不能单独证明年份或原装程度。"),
    claim("phase162-no7-richard", no7Scope, "phase470-no7-material", "material_boundary", "Ripple 硬橡胶、casein 色带、celluloid 与 color disk 是不同识别轴；褪色、纹理磨平、后配帽盖或替换尖按具体样本记录。"),
    claim("phase162-no7-richard", no7Scope, "phase470-no7-nib", "sample_boundary", "No.7 彩色笔尖的写感、弹性和尖幅受尖齿状态、feed、sac、纸张与维修史影响；资料中的颜色性格不能升级为每支笔的书写保证。"),
    claim("phase162-waterman-history", no7Scope, "phase470-no7-care", "maintenance_boundary", "硬橡胶与 casein 避免热水、酒精、长时间浸泡和强力抛光；先记录 color disk、色带、section 和杠杆状态，再决定是否维修。", "editorial"),
    claim("phase162-no7-richard", no7Scope, "phase470-no7-selection", "selection_guidance", "收藏者先建立颜色和代际目录，日用者优先选择 sac、帽盖、尖况与维修渠道稳定的样本；完整颜色组的价值不能替代逐支状态核验。", "editorial"),
  ],
  [event("phase162-no7-richard", "phase470-no7-color-boundary", "No.7 彩色笔尖与材料版本分层", "把 Ripple、casein 色带、Jet color disk、Emerald‑Ray 和后期数字 7 分开记录，保留与 No.52、Ink‑Vue No.7 的导航关系而不混淆身份。"),],
);

export const phase470WatermanIdealNo52No7DepthPacks: CuratedEntityPack[] = [no52, no7];
