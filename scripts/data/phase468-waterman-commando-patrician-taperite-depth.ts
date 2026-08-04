import type { CuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE160_IDS,
  phase160WatermanVintagePacks,
} from "./phase160-waterman-vintage";

const RETRIEVED = "2026-08-04";

export const PHASE468_IDS = {
  commando: PHASE160_IDS.commando,
  patrician: PHASE160_IDS.patrician,
  taperite: PHASE160_IDS.taperite,
} as const;

function claim(
  sourceKey: string,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  factClass: "core" | "editorial" = "core",
): CuratedEntityPack["claims"][number] {
  const locator = `${key}: source-backed Phase 468 editorial boundary`;
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.96,
    sourceKey,
    locator,
    evidence: [{
      key: `${key}-evidence`,
      sourceKey,
      scopeKey,
      locator,
    }],
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

const commandoBase = phase160WatermanVintagePacks.find(
  (pack) => pack.entityId === PHASE160_IDS.commando,
);
const patricianBase = phase160WatermanVintagePacks.find(
  (pack) => pack.entityId === PHASE160_IDS.patrician,
);
const taperiteBase = phase160WatermanVintagePacks.find(
  (pack) => pack.entityId === PHASE160_IDS.taperite,
);
if (!commandoBase || !patricianBase || !taperiteBase) {
  throw new Error("Phase 468 Waterman canonical base packs are missing.");
}

const commandoScope = "phase468-waterman-commando-depth";
const patricianScope = "phase468-waterman-patrician-depth";
const taperiteScope = "phase468-waterman-taperite-depth";

const commando = deepen(
  commandoBase,
  "phase468-waterman-commando-depth-v1",
  ".planning/content-research/waterman-commando-phase160.md",
  commandoScope,
  "Waterman’s Commando; Lucite/celluloid, No.5, transparent tail and military-style clip remain specimen-scoped.",
  [
    claim("phase160-commando-fpn", commandoScope, "phase468-commando-name-boundary", "model_identity", "1941 年五美元型号与 1943 年 Commando 名称属于同一历史路线的命名边界；1939 年已出现的 Hundred Year Pen 不能被当作 Commando 的前身或改名。"),
    claim("phase160-commando-pencil", commandoScope, "phase468-commando-material-boundary", "variant_boundary", "Lucite、celluloid、透明笔尾和颜色是不同样本的材料线索；只有照片、档案与刻字互相支持时，才把它们记为版本，不把稀有材料外推为全系列规格。"),
    claim("phase160-commando-fpn", commandoScope, "phase468-commando-section-risk", "maintenance_boundary", "celluloid section 失圆、透明尾端晶化或裂纹会影响笔尖固定与密封；应先检查再拆解，不以加热、强压或继续灌墨解决结构异常。"),
    claim("phase160-commando-azahara", commandoScope, "phase468-commando-writing-boundary", "sample_boundary", "No.5 是 Waterman 的笔尖编号，不等于固定尖幅或弹性；细线、柔软度和断墨表现需与具体尖刻字、feed、墨水和纸张一起记录。"),
    claim("phase160-waterman-care", commandoScope, "phase468-commando-purchase", "selection_guidance", "日用选购优先核对 sac、杠杆、帽盖、section 与退换／维修条件；收藏选购再核对材料世代、颜色、笔夹和原装程度，不用卖家稀有标签替代实物证据。", "editorial"),
  ],
  [
    event("phase160-commando-fpn", "phase468-commando-evidence-layer", "Commando 的型号与样本证据分层", "把名称、战时定位、材料版本和当前维修状态分成独立记录，避免用一张相似外观图片合并相邻 Waterman 型号。"),
  ],
);

const patrician = deepen(
  patricianBase,
  "phase468-waterman-patrician-depth-v1",
  ".planning/content-research/waterman-patrician-phase160.md",
  patricianScope,
  "Waterman’s Patrician; Art Deco celluloid, metal trim, Lady Patricia and closeout variants remain historically bounded.",
  [
    claim("phase160-patrician-vintage", patricianScope, "phase468-patrician-flagship-boundary", "model_identity", "Patrician 的旗舰时间线约从 1929 年延续到 1939 年 Hundred Year Pen 出现前后；它不是所有彩色 Waterman 老笔的统称。"),
    claim("phase160-patrician-antique", patricianScope, "phase468-patrician-material-boundary", "variant_boundary", "Emerald、Onyx、Nacre 等颜色与 Art Deco celluloid 需要结合目录、帽环、笔夹和实物状态核对；一支样本的配色与饰件不能回填到整个产品线。"),
    claim("phase160-patrician-vintage", patricianScope, "phase468-patrician-lady-boundary", "version_boundary", "Lady Patricia、closeout Patrician 与标准 Patrician 是相邻而非同一页面；名称相似、颜色相近或拍卖标题相同都不足以合并身份。"),
    claim("phase160-patrician-ravens", patricianScope, "phase468-patrician-nib-boundary", "sample_boundary", "大型金尖、14K 刻字和弹性是具体实物证据；替换尖、重磨和 feed 状态会改变书写，不能把某一支的尖幅写成型号固定规格。"),
    claim("phase160-waterman-care", patricianScope, "phase468-patrician-care", "maintenance_boundary", "老 celluloid、sac、section、lever box 与金属饰件应避免热水、强溶剂和盲目拆装；异常时先保留刻字与原装件，再交给熟悉 vintage Waterman 的维修者。", "editorial"),
    claim("phase160-patrician-vintage", patricianScope, "phase468-patrician-selection", "selection_guidance", "选购应分开核对型号位置、具体样本归类和当前可用状态；维修记录与密封可靠性比未经检查的稀有色宣传更有决策价值。", "editorial"),
  ],
  [
    event("phase160-patrician-vintage", "phase468-patrician-art-deco-boundary", "Patrician 装饰与实用证据分层", "把 Art Deco 材料、旗舰时间线、相邻 Lady Patricia 与当前维修状态分开记录，保留型号和版本导航的可追溯性。"),
  ],
);

const taperite = deepen(
  taperiteBase,
  "phase468-waterman-taperite-depth-v1",
  ".planning/content-research/waterman-taperite-phase160.md",
  taperiteScope,
  "Waterman’s Taperite; post-1945 lever-filled family with hooded-nib-era styling, regional and cap variants kept separate.",
  [
    claim("phase160-taperite-pm", taperiteScope, "phase468-taperite-era-boundary", "model_identity", "Taperite 是 1945 年以后 Waterman 面向半暗尖／锥形尖时代的型号线；Parker 51 只是同时代参照，不证明共享模具、零件或 filler。"),
    claim("phase160-taperite-italy", taperiteScope, "phase468-taperite-family-boundary", "variant_boundary", "Crusader、Citation、金属帽、透明尾端、美国／加拿大制造和不同尺寸应按具体目录与实物核对，不能仅按配色合并。"),
    claim("phase160-taperite-fpn", taperiteScope, "phase468-taperite-nib-boundary", "sample_boundary", "锥形尖不等于完全 hooded nib；尖端露出、贵金属材质、尖幅和替换件随样本变化，照片不足时应保留为待核。"),
    claim("phase160-taperite-pm", taperiteScope, "phase468-taperite-measurement", "measurement_boundary", "PM Pens 的约 129.5 mm、含 converter 约 15.1 g 是 Crusader 样本测量，不可外推到全部 Taperite、Citation 或地区版本。"),
    claim("phase160-waterman-care", taperiteScope, "phase468-taperite-maintenance", "maintenance_boundary", "杠杆、sac、feed、clutch、透明尾端和脆化塑料应按低风险顺序检查；先常温水与放大镜，再决定是否需要拆修，不用热水、酒精或强力抛光。", "editorial"),
    claim("phase160-taperite-fpn", taperiteScope, "phase468-taperite-writing-record", "sample_boundary", "试写应同时记录尖端露出、书写角度、墨水、纸张和帽盖状态，把单支样本的干湿、硬软或启动差异与全系列事实分开。", "editorial"),
  ],
  [
    event("phase160-taperite-italy", "phase468-taperite-comparison-boundary", "Taperite 的同时代结构比较", "将 Commando 的露尖、Taperite 的锥形路线、Parker 51 的封闭尖和 C/F 的墨水管并列为探索入口，不把比较关系写成身份或兼容关系。"),
  ],
);

export const phase468WatermanCommandoPatricianTaperiteDepthPacks: CuratedEntityPack[] = [
  commando,
  patrician,
  taperite,
];
