import type { CuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE161_IDS,
  phase161WatermanVintagePacks,
} from "./phase161-waterman-vintage";

const RETRIEVED = "2026-08-04";

export const PHASE469_IDS = {
  hundredYear: PHASE161_IDS.hundredYear,
  inkVue: PHASE161_IDS.inkVue,
  xPen: PHASE161_IDS.xPen,
} as const;

function claim(
  sourceKey: string,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  factClass: "core" | "editorial" = "core",
): CuratedEntityPack["claims"][number] {
  const locator = `${key}: source-backed Phase 469 editorial boundary`;
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.96,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey, locator }],
  };
}

function event(
  sourceKey: string,
  key: string,
  title: string,
  description: string,
): NonNullable<CuratedEntityPack["timeline"]>[number] {
  return {
    key,
    title,
    eventType: "design_milestone",
    startDate: RETRIEVED,
    circa: true,
    description,
    sourceKey,
  };
}

function deepen(
  base: CuratedEntityPack,
  key: string,
  markdownFile: string,
  scopeKey: string,
  editionScope: string,
  claims: CuratedEntityPack["claims"],
  timeline: NonNullable<CuratedEntityPack["timeline"]>,
): CuratedEntityPack {
  return {
    ...base,
    key,
    markdownFile,
    scopes: [
      ...base.scopes,
      {
        key: scopeKey,
        scopeKey,
        validFrom: RETRIEVED,
        productionState: "historical",
        editionScope,
      },
    ],
    claims: [...base.claims, ...claims],
    timeline: [...(base.timeline ?? []), ...timeline],
  };
}

const hundredBase = phase161WatermanVintagePacks.find(
  (pack) => pack.entityId === PHASE161_IDS.hundredYear,
);
const inkVueBase = phase161WatermanVintagePacks.find(
  (pack) => pack.entityId === PHASE161_IDS.inkVue,
);
const xPenBase = phase161WatermanVintagePacks.find(
  (pack) => pack.entityId === PHASE161_IDS.xPen,
);
if (!hundredBase || !inkVueBase || !xPenBase) {
  throw new Error("Phase 469 Waterman canonical base packs are missing.");
}

const hundredScope = "phase469-waterman-hundred-year-depth";
const inkVueScope = "phase469-waterman-ink-vue-depth";
const xPenScope = "phase469-waterman-x-pen-depth";

const hundredYear = deepen(
  hundredBase,
  "phase469-waterman-hundred-year-depth-v1",
  ".planning/content-research/waterman-hundred-year-phase161.md",
  hundredScope,
  "Waterman’s Hundred Year Pen; Lucite/celluloid, No.17/18, Lady and De Luxe remain edition- and specimen-scoped.",
  [
    claim("phase161-hundred-year-azahara", hundredScope, "phase469-hundred-identity", "model_identity", "Hundred Year Pen 是 1939 年推出的 Waterman 历史型号，原始名称与后续 Emblem 名称相邻但不相同；No.17/18、尺寸和材料随版本记录。"),
    claim("phase161-hundred-year-pencil", hundredScope, "phase469-hundred-material", "variant_boundary", "Lucite 与 celluloid 的材料转换属于年代和样本边界；透明尾端、颜色、晶化与裂纹需要具体照片和档案支持，不能外推为全型号材质。"),
    claim("phase161-hundred-year-azahara", hundredScope, "phase469-hundred-nib", "sample_boundary", "No.17 标准款、No.18 De Luxe 和不同尺寸的笔尖编号不等于固定尖幅或弹性；替换、重磨和 feed 状态应单独记录。"),
    claim("phase161-hundred-year-pencil", hundredScope, "phase469-hundred-emblem-boundary", "version_boundary", "Emblem 的名称和 Lock-Slip 等相邻叙事不能倒填到所有 Hundred Year；Patrician、Commando 与 Taperite 也不能凭透明尾端合并。"),
    claim("phase161-waterman-care", hundredScope, "phase469-hundred-care", "maintenance_boundary", "透明尾端、section、sac、杠杆和 feed 异常时先停用，使用常温水与低压力检查；高温、强溶剂和盲目拆卸会放大老材料损伤。", "editorial"),
    claim("phase161-hundred-year-azahara", hundredScope, "phase469-hundred-selection", "selection_guidance", "日用选购优先确认密封、杠杆和可修复笔尖；收藏选购再核对材料世代、No.17/18、尺寸、原盒与维修记录，不以广告或卖家形容词替代实物证据。", "editorial"),
  ],
  [
    event("phase161-hundred-year-azahara", "phase469-hundred-evidence-layer", "Hundred Year 的名称、版本与可用性分层", "把 1939 年产品线位置、Lucite/celluloid 世代、No.17/18 版本和当前维修状态分成可追溯字段。"),
  ],
);

const inkVue = deepen(
  inkVueBase,
  "phase469-waterman-ink-vue-depth-v1",
  ".planning/content-research/waterman-ink-vue-phase161.md",
  inkVueScope,
  "Waterman’s Ink-Vue; transparent barrel and bulb filler with 84, De Luxe, Lady Patricia and 5116 structures kept distinct.",
  [
    claim("phase161-ink-vue-vintagepens", inkVueScope, "phase469-ink-vue-identity", "model_identity", "Ink-Vue 是 1935 年推出的透明 barrel 泵式路线；Model 84、De Luxe、Lady Patricia 和 5116 属于相邻结构与命名边界，不是一个统一 SKU。"),
    claim("phase161-ink-vue-vintagepens", inkVueScope, "phase469-ink-vue-mechanism", "filling_system", "横向压缩 bulb、washer、plug、Tip-Fill feed 与一体／铰接杠杆构成历史泵式系统；5116 的一体式 barrel/section 不能照搬 84 的拆修步骤。"),
    claim("phase161-ink-vue-fpn", inkVueScope, "phase469-ink-vue-nib", "variant_boundary", "标准 84 常见 No.5、De Luxe 常见 No.7 的档案语境不等于每支实物的尖幅、材质或原装程度；笔尖刻字和替换史需要独立记录。"),
    claim("phase161-ink-vue-ravens", inkVueScope, "phase469-ink-vue-repair", "maintenance_boundary", "透明 celluloid、bulb、washer、plug 和密封是主要维修风险；先常温、低压力、分段清洁，不能用热水、酒精、现代 converter 或强拧末端验证机构。"),
    claim("phase161-ink-vue-vintagepens", inkVueScope, "phase469-ink-vue-selection", "selection_guidance", "收藏者可比较颜色、徽记、No.5/No.7、bulb 和透明 barrel，日用者先确认密封、补件与维修路径；价格和书写表现均限制在具体样本。", "editorial"),
  ],
  [
    event("phase161-ink-vue-vintagepens", "phase469-ink-vue-pump-boundary", "Ink-Vue 泵式结构的版本分层", "把透明墨量可见、横压 bulb、84/De Luxe/Lady Patricia 与 5116 的机构差异分开，避免用一个拆洗流程覆盖全家族。"),
  ],
);

const xPen = deepen(
  xPenBase,
  "phase469-waterman-x-pen-depth-v1",
  ".planning/content-research/waterman-x-pen-phase161.md",
  xPenScope,
  "Waterman’s X-Pen; French capillary filler and X-Pen Junior remain separate from C/F, Taperite and Parker 61.",
  [
    claim("phase161-x-pen-vintagepens", xPenScope, "phase469-x-pen-identity", "model_identity", "X-Pen 是法国约 1957–1959 年的 Waterman capillary filler；X-Pen Junior、晚期可拆 barrel 与地区样本属于版本和结构边界。"),
    claim("phase161-x-pen-peyton", xPenScope, "phase469-x-pen-sample", "measurement_boundary", "Peyton Street 的约 5-3/16 英寸、hooded steel nib 和 Junior 资料是单支样本范围，不能外推全部 X-Pen 的尺寸、尖幅或重量。"),
    claim("phase161-x-pen-vintagepens", xPenScope, "phase469-x-pen-filler", "filling_system", "笔尖浸入、织物 wick 和 capillary reservoir 构成 X-Pen 的毛细上墨路线；C/F 的 cartridge、Taperite 的 sac 杠杆与 Parker 61 的内部结构不能替代说明。"),
    claim("phase161-x-pen-ravens", xPenScope, "phase469-x-pen-care", "maintenance_boundary", "普通样本先以常温水浸泡、倒空和自然干燥；热水、酒精、超声波和强拉 barrel 可能破坏 wick、密封或塑料，晚期可拆结构需先由维修者确认。"),
    claim("phase161-x-pen-peyton", xPenScope, "phase469-x-pen-selection", "selection_guidance", "日用选购优先确认吸墨、帽盖密封、织物储墨和可维护性；收藏选购再比较法国刻字、Junior 尺寸、帽环、原盒和包装，不把一次试写升级为全线可靠性。", "editorial"),
  ],
  [
    event("phase161-x-pen-vintagepens", "phase469-x-pen-capillary-boundary", "X-Pen 毛细储墨的记录边界", "把法国制造窗口、织物 wick、清洁限制、Junior 尺寸和晚期可拆例外分开记录，保持与 Parker 61 的比较链接而不混淆身份。"),
  ],
);

export const phase469WatermanHundredYearInkVueXPenDepthPacks: CuratedEntityPack[] = [
  hundredYear,
  inkVue,
  xPen,
];
