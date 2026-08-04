import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { PHASE181_IDS, phase181MajohnPacks } from "./phase181-majohn-q1-m2-p140-p141";
import {
  PHASE341_CLEO_IDS,
  phase341CleoSkribentClassicPacks,
} from "./phase341-cleo-skribent-classic";
import { phase235ObscureChineseTrioPacks } from "./phase235-obscure-chinese-trio";
import { phase444BrandDepthPacks } from "./phase444-dongwu-shule-zhangjiang-brand-depth";

const RETRIEVED = "2026-08-04";

export const PHASE467_IDS = {
  majohnM2: "f1DaQYtCJVMk",
  cleoPalladium: "phase341-cleo-classic-palladium",
  shule2398: "p81bNOu9URb7",
} as const;

function claim(
  sourceKey: string,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  factClass: "core" | "editorial" = "core",
): CuratedEntityPack["claims"][number] {
  const locator = `${key}: source-backed Phase 467 editorial boundary`;
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
  extraSources: CuratedEntityPack["sources"] = [],
): CuratedEntityPack {
  const sourceKeys = new Set(base.sources.map((source) => source.key));
  return {
    ...base,
    key,
    markdownFile,
    sources: [
      ...base.sources,
      ...extraSources.filter((source) => !sourceKeys.has(source.key)),
    ],
    scopes: [
      ...base.scopes,
      {
        key: scopeKey,
        scopeKey,
        validFrom: RETRIEVED,
        productionState: "current",
        editionScope,
      },
    ],
    claims: [...base.claims, ...claims],
    timeline: [...(base.timeline ?? []), ...timeline],
  };
}

const majohnBase = phase181MajohnPacks.find(
  (pack) => pack.entityId === PHASE181_IDS.m2,
);
const cleoBase = phase341CleoSkribentClassicPacks.find(
  (pack) => pack.entityId === PHASE341_CLEO_IDS.palladium,
);
const shuleBase = phase235ObscureChineseTrioPacks().find(
  (pack) => pack.entityId === PHASE467_IDS.shule2398,
);
const shuleBrand = phase444BrandDepthPacks.find(
  (pack) => pack.entityId === "DnQI7CPpnewz",
);

if (!majohnBase || !cleoBase || !shuleBase || !shuleBrand) {
  throw new Error("Phase 467 canonical base packs are missing.");
}

const majohnScope = "phase467-majohn-m2-depth";
const cleoScope = "phase467-cleo-palladium-depth";
const shuleScope = "phase467-shule-2398-depth";
const shuleFpn = shuleBrand.sources.find(
  (source) => source.key === "phase444-fpn-shule-2212",
);
if (!shuleFpn) throw new Error("Phase 467 ShuLe adjacent-model source is missing.");

const majohnM2 = deepen(
  majohnBase,
  "phase467-majohn-m2-depth-v1",
  ".planning/content-research/majohn-m2-phase181.md",
  majohnScope,
  "Majohn M2 transparent eyedropper model; capacity, nib swaps and seals remain sample/SKU-scoped.",
  [
    claim("phase181-majohn-m2-ttpen", majohnScope, "phase467-m2-capacity", "measurement_boundary", "M2 的约 5 ml 只可作为零售或评测样本的容量估计；装满位置、是否含握位通道和量测工具会改变结果，不能写成全批次工厂定值。"),
    claim("phase181-majohn-m2-fpn", majohnScope, "phase467-m2-nib-swap", "variant_boundary", "FPR Ultra Flex 等替换尖属于玩家个体实验；螺纹、肩部间隙和笔舌兼容性需按单支确认，不能当作 Majohn 的原厂配置。"),
    claim("phase181-majohn-m2-collection", majohnScope, "phase467-m2-identity", "model_identity", "M2 的独立身份来自透明直灌笔身、螺纹帽和 O 形圈密封组合；Q1 的短粗比例与 P140 的活塞机构不能并入 M2。"),
    claim("phase181-majohn-m2-guide", majohnScope, "phase467-m2-pressure", "maintenance_boundary", "大墨仓对温度和气压变化更敏感；满仓、日晒或航空携带可能放大吐墨风险，出行应减量或清空并笔尖向上收纳。", "editorial"),
    claim("phase181-majohn-m2-fpn", majohnScope, "phase467-m2-ink", "maintenance_boundary", "换色前应以室温清水冲净墨仓、握位和进墨孔；高饱和、闪粉和含颗粒墨水要在可逆试写后再决定。", "editorial"),
    claim("phase181-majohn-m2-guide", majohnScope, "phase467-m2-purchase", "selection_guidance", "选购 M2 时优先核对尖型、密封圈、透明笔身裂纹、退换政策和容量量测条件，而不是只看“超大墨仓”宣传。", "editorial"),
  ],
  [
    event("phase181-majohn-m2-collection", "phase467-m2-design", "M2 透明直灌路线的维护边界整理", "把透明墨仓、O 形圈、替换尖和压力变化分成结构事实与样本经验。"),
  ],
);

const cleoPalladium = deepen(
  cleoBase,
  "phase467-cleo-classic-palladium-depth-v1",
  ".planning/content-research/cleo-classic-palladium-phase467.md",
  cleoScope,
  "Cleo Skribent Classic Palladium route; piston, cartridge/converter, steel and 14K variants remain SKU-scoped.",
  [
    claim("phase341-cleo-official-collection", cleoScope, "phase467-cleo-route", "model_identity", "Classic Palladium 是 Classic 家族中的饰件路线，与 Classic Gold、Classic Metall 并列；Palladium 不是一个可以吞并其他路线的总型号。"),
    claim("phase341-cleo-catalog-2025", cleoScope, "phase467-cleo-nib", "variant_boundary", "官方目录的基础 Palladium 语境以钢尖为主，商城另列 14K 商品；尖材、尖号和研磨必须按具体商品或订单记录。"),
    claim("phase341-cleo-shop-palladium", cleoScope, "phase467-cleo-fill", "filling_system", "Classic Palladium 同时存在 piston 与 cartridge/converter 商品；活塞的盲帽、墨窗和清洗路径不能复制到转换器版本。"),
    claim("phase341-cleo-penaddict-palladium", cleoScope, "phase467-cleo-sample", "sample_boundary", "The Pen Addict 的轻量、盲帽、透明墨窗和钢尖书写观察属于一支评测样本，不证明所有年份、颜色或尖幅。"),
    claim("phase341-cleo-paper-mind-14k", cleoScope, "phase467-cleo-gold-variant", "variant_boundary", "白色 14K 商品页证明市场存在 14K 变体，但不能把该商品的尖材与价格外推为 Palladium 基础路线的固定规格。"),
    claim("phase341-cleo-official-company", cleoScope, "phase467-cleo-maker", "manufacturing_context", "官方公司资料将 Cleo Skribent 置于 Bad Wilsnack 的制造、模具和质量控制语境；这不等于未经资料支持的每个零件工序或手工比例。"),
    claim("phase341-cleo-gentleman-stationer", cleoScope, "phase467-cleo-selection", "selection_guidance", "大墨量与可见墨窗应核对 piston SKU，便携换墨应核对 cartridge/converter SKU，想要 14K 尖则要求商品页或尖面刻字证据。", "editorial"),
  ],
  [
    event("phase341-cleo-catalog-2025", "phase467-cleo-catalog", "Classic Palladium 的 SKU 分流整理", "把饰件路线、供墨结构和钢尖／14K 变体分开，避免同名页面互相覆盖。"),
  ],
);

const shule2398 = deepen(
  shuleBase,
  "phase467-shule-2398-depth-v1",
  ".planning/content-research/shule-2398-phase235.md",
  shuleScope,
  "ShuLe 2398 specific model; sparse documentation remains sample-scoped and adjacent ShuLe 2212 is not merged.",
  [
    claim("phase235-shule-2398-review", shuleScope, "phase467-shule-identity", "model_identity", "2398 需要与书乐品牌名、笔身或帽环刻字、笔尖和结构一起确认；单独数字、相似外观或卖家简称不足以建立身份。"),
    claim("phase444-fpn-shule-2212", shuleScope, "phase467-shule-adjacent", "version_boundary", "Fountain Pen Network 的 ShuLe 2212 是相邻型号样本；其金属笔身、暗尖、约 0.5 mm 和气囊上墨不能回填到 2398。"),
    claim("phase235-shule-2398-review", shuleScope, "phase467-shule-unknowns", "specification_boundary", "公开资料仍不足以确认 2398 的统一尺寸、重量、材质、上墨和首发年份；这些字段按单支实物与卖家说明核对。"),
    claim("phase235-shule-2398-review", shuleScope, "phase467-shule-condition", "purchase_boundary", "二手 2398 应先检查刻字、帽口、笔夹、螺纹、笔尖和上墨件，再讨论全新、绝版、稀有或收藏溢价。", "editorial"),
    claim("phase235-shule-2398-review", shuleScope, "phase467-shule-care", "maintenance_boundary", "未知结构先用常温清水少量测试，避免热水、酒精、强溶剂、硬刷和盲目拆尖；漏墨或脆裂应交给熟悉旧国产笔的维修者。", "editorial"),
    claim("phase444-fpn-shule-2212", shuleScope, "phase467-shule-recording", "research_boundary", "记录每支样本的刻字位置、帽环、笔夹、尾端和笔尖标记，只有多支样本与目录或包装互相吻合时才升级统一规格。", "editorial"),
  ],
  [
    event("phase444-fpn-shule-2212", "phase467-shule-variant-map", "2398 与 2212 的相邻型号边界整理", "保留 2212 作为品牌侧线索，不把其结构或体验写进 2398 规格。"),
  ],
  [shuleFpn],
);

export const phase467MajohnM2CleoPalladiumShule2398DepthPacks: CuratedEntityPack[] = [
  majohnM2,
  cleoPalladium,
  shule2398,
];
