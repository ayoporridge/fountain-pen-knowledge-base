import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE305_1911_L_DEMO_SILVER_ID,
  phase305Sailor1911LDemonstratorSilverPacks,
} from "./phase305-sailor-1911-l-demonstrator-silver";
import {
  PHASE295_ESSENTIO_ID,
  phase295FaberCastellEssentioDepthPacks,
} from "./phase295-faber-castell-essentio-depth";
import {
  PHASE40_VICTORY_ID,
  phase40ParkerFrontierPremierVictoryPacks,
} from "./phase40-parker-frontier-premier-victory";

export const PHASE461_IDS = {
  sailor: PHASE305_1911_L_DEMO_SILVER_ID,
  essentio: PHASE295_ESSENTIO_ID,
  victory: PHASE40_VICTORY_ID,
} as const;

const allBasePacks = [
  ...phase305Sailor1911LDemonstratorSilverPacks,
  ...phase295FaberCastellEssentioDepthPacks,
  ...phase40ParkerFrontierPremierVictoryPacks,
];

function base(entityId: string, label: string): CuratedEntityPack {
  const pack = allBasePacks.find((candidate) => candidate.entityId === entityId);
  if (!pack) throw new Error(`Phase 461 ${label} pack is missing.`);
  return pack;
}

function source(key: string, label: string): CuratedSource {
  const found = allBasePacks.flatMap((pack) => pack.sources).find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Phase 461 ${label} source ${key} is missing.`);
  return found;
}

function scope(slug: string): CuratedScope {
  const key = `phase461-${slug}-depth`;
  return {
    key,
    scopeKey: key,
    productionState: "current",
    editionScope:
      "Phase 461 型号深化；精确 SKU、历史版本、官方规格与独立样本分层记录，不把相邻型号或跨品牌同名条目互相回填。",
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
    factClass: ["use_and_care", "maintenance_guidance", "selection_boundary", "selection_guidance"].includes(predicate)
      ? "editorial"
      : "core",
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

const sailorBase = base(PHASE461_IDS.sailor, "Sailor 1911 L Demonstrator Silver");
const essentioBase = base(PHASE461_IDS.essentio, "Faber-Castell Essentio");
const victoryBase = base(PHASE461_IDS.victory, "Parker Victory");

const sailorSeries = source("phase305-sailor-1911-series", "Sailor 1911 series");
const sailorChina = source("phase305-sailor-1911-series-cn", "Sailor China 1911 series");
const sailorCatalogue = source("phase305-sailor-1911-catalogue", "Sailor 2024 catalogue");
const sailorIguana = source("phase305-sailor-1911-9223-iguana", "Sailor 11-9223 retailer");
const sailorPlating = source("phase305-sailor-plating", "Sailor plating notice");
const sailorReview = source("phase305-sailor-1911-review", "Sailor independent review");

const essentioRose = source("phase139-essentio-148420", "Essentio Rose SKU");
const essentioCarbonM = source("phase295-essentio-carbon-m", "Essentio Carbon M");
const essentioCarbonF = source("phase295-essentio-carbon-f", "Essentio Carbon F");
const essentioAluminiumBlack = source("phase295-essentio-aluminium-black", "Essentio Aluminium Black");
const essentioFamily = source("phase295-essentio-family", "Essentio family");
const essentioFaq = source("phase139-faber-faq", "Faber-Castell fountain pen FAQ");
const essentioReview = source("phase139-essentio-review", "Essentio independent review");

const victoryCollector = source("phase40-parker-victory-collector", "Parkercollector Victory");
const victoryPenography = source("phase40-parker-victory-penography", "Parker Penography Victory");
const parkerHistory = source("parker-official-history", "Parker official history");
const parkerCare = source("parker-care-guide", "Parker care guide");

const sailorScope = scope("sailor-1911-l-silver");
const essentioScope = scope("faber-castell-essentio");
const victoryScope = scope("parker-victory");

export const phase461SailorEssentioVictoryDepthPacks: CuratedEntityPack[] = [
  refresh(
    sailorBase,
    "phase461-sailor-1911-l-silver-depth-v1",
    sailorScope,
    [
      claim(
        sailorSeries,
        sailorScope.scopeKey,
        "phase461-sailor-identity",
        "model_identity",
        "Sailor 1911 L Demonstrator Silver 11-9223 是透明 1911 Large 的银／铑饰具体 SKU；它与金饰 11-2001、14K 的 11-1223 以及活塞 Realo 分开建档。",
      ),
      claim(
        sailorCatalogue,
        sailorScope.scopeKey,
        "phase461-sailor-sku-spec",
        "sku_specification",
        "2024 Regular Catalogue 对 11-9223 记录 21K 大型铑镀尖、透明 PMMA、约 φ18×141 mm、约 21.6 g；完整 11-9223-xxx 货号决定尖幅。",
      ),
      claim(
        sailorChina,
        sailorScope.scopeKey,
        "phase461-sailor-material-fill",
        "material_and_filling_boundary",
        "11-9223 的透明 PMMA 与 C/C 上墨让使用者看到墨量，但不等于原厂 eyedropper；不能把 11-3924 Realo 的活塞容量和拆洗方式回填。",
      ),
      claim(
        sailorIguana,
        sailorScope.scopeKey,
        "phase461-sailor-widths",
        "nib_variant_boundary",
        "经销商对 11-9223-400 交叉列出透明树脂、铬色饰件、21K 铑镀尖、旋帽和 C/C；EF/F/MF/M/B/Z/MS 应按完整货号和当期库存核对。",
      ),
      claim(
        sailorPlating,
        sailorScope.scopeKey,
        "phase461-sailor-plating",
        "finish_transition",
        "Sailor 的 plating process 公告提供 1911 装饰工艺由传统镀层向 Gold Ion Plating 过渡的时间线索；工艺窗口不自动产生新型号，也不能改写 11-9223 身份。",
      ),
      claim(
        sailorReview,
        sailorScope.scopeKey,
        "phase461-sailor-writing-care",
        "use_and_care",
        "透明 PMMA 和 21K 大尖适合先按纸张、握角和尖幅试写；换墨用常温清水吸排并自然干燥，避免热水、酒精、强清洁剂和硬物刮擦，独立评测手感不外推到所有 SKU。",
      ),
    ],
    [
      {
        key: "phase461-sailor-1911-l-silver-depth",
        title: "Phase 461：Sailor 1911 L 11-9223 的银饰 SKU 与透明维护边界",
        eventType: "design_milestone",
        startDate: "2026-08-04",
        circa: false,
        description:
          "以官方系列、中文目录、2024 Regular Catalogue、经销商和独立评测重核 11-9223 的身份、尖幅、PMMA/C-C 边界、工艺过渡与维护。",
        sourceKey: sailorSeries.key,
      },
    ],
  ),
  refresh(
    essentioBase,
    "phase461-faber-castell-essentio-depth-v1",
    essentioScope,
    [
      claim(
        essentioFamily,
        essentioScope.scopeKey,
        "phase461-essentio-identity",
        "model_identity",
        "Faber-Castell Essentio 是 Fine Writing 中独立的 fountain-pen 产品线；Aluminium、Carbon 与 Black 是系列内材料或颜色 SKU，不与 Ambition、e-motion 或 Graf von Faber-Castell 混名。",
      ),
      claim(
        essentioRose,
        essentioScope.scopeKey,
        "phase461-essentio-rose",
        "sku_anchor",
        "148420 Aluminium Rose M 是本页规格锚点：阳极氧化铝笔杆与握区、弹性金属笔夹、不锈钢 M 尖和 cartridge/converter；商品页说明随附墨囊，converter 按地区另核。",
      ),
      claim(
        essentioCarbonM,
        essentioScope.scopeKey,
        "phase461-essentio-carbon",
        "material_boundary",
        "148820 Carbon M 与 148821 Carbon F 使用 durable carbon 笔杆，并保留人体工学握区、弹性金属笔夹、不锈钢尖和 cartridge/converter；不能继承 148420 的铝材或重量描述。",
      ),
      claim(
        essentioAluminiumBlack,
        essentioScope.scopeKey,
        "phase461-essentio-aluminium-black",
        "market_sku_boundary",
        "148481 Aluminium Black 是独立的铝制黑色 F 尖 SKU；颜色近似不等于 Carbon，购买记录应保留完整产品号、尖幅和盒内附件。",
      ),
      claim(
        essentioFaq,
        essentioScope.scopeKey,
        "phase461-essentio-care",
        "maintenance_guidance",
        "换色或长期停用时用室温清水反复吸排并自然阴干；避免热水、酒精、漂白剂、强清洁剂和金属抛光，遇到尖端、螺纹或转换器故障先停用并联系售后。",
      ),
      claim(
        essentioReview,
        essentioScope.scopeKey,
        "phase461-essentio-writing-selection",
        "selection_guidance",
        "独立评测的套帽长度和不套帽书写只属于单支样本；选购应按 Aluminium/Carbon/Black、产品号、F/M 尖幅和供墨方式分流，细握位不适合所有手型。",
      ),
    ],
    [
      {
        key: "phase461-essentio-depth",
        title: "Phase 461：Essentio exact SKU、材质与 cartridge/converter 选择",
        eventType: "design_milestone",
        startDate: "2026-08-04",
        circa: false,
        description:
          "补足 148420、148481、148820、148821 的材料、尖幅、附件、清洁和选购边界，保留 fountain pen 与其他书写模式的身份分流。",
        sourceKey: essentioFamily.key,
      },
    ],
  ),
  refresh(
    victoryBase,
    "phase461-parker-victory-depth-v1",
    victoryScope,
    [
      claim(
        victoryCollector,
        victoryScope.scopeKey,
        "phase461-victory-identity",
        "model_identity",
        "Parker Victory（vintage UK）指英国 Newhaven 语境中的历史系列，约 1941 年至 1960 年代中期经历 Mk I–V；Eversharp Victory 是另一品牌，不能合并。",
      ),
      claim(
        victoryPenography,
        victoryScope.scopeKey,
        "phase461-victory-mk-fill",
        "version_boundary",
        "收藏资料把 Mk I–IV 多数样本放在 button filler 语境，Mk V 常见 aerometric；年份和上墨方式是常见边界，不应当作每支实物的绝对规格。",
      ),
      claim(
        parkerHistory,
        victoryScope.scopeKey,
        "phase461-victory-uk-context",
        "historical_context",
        "Parker 官方历史资料用于品牌与英国制造语境；Victory 的 Newhaven、Standard／De Luxe、夹具和帽环差异应回到具体实物刻字和结构核对。",
      ),
      claim(
        parkerCare,
        victoryScope.scopeKey,
        "phase461-victory-restoration",
        "maintenance_guidance",
        "老 Victory 先检查橡胶囊、按键、压条、密封和脆化树脂，再用凉水温和清洗；避免热水、酒精和强力超声，裂纹、卡键或尖端受撞应交给熟悉 vintage Parker 的技师。",
      ),
      claim(
        victoryPenography,
        victoryScope.scopeKey,
        "phase461-victory-nib-material",
        "identity_check",
        "开放式 Parker 尖的字幅、刻字、笔夹、帽环、笔杆颜色和制造地需一起记录；替换尖、改装墨囊或重镀会削弱单一外观特征的鉴定力。",
      ),
      claim(
        victoryCollector,
        victoryScope.scopeKey,
        "phase461-victory-selection",
        "selection_boundary",
        "Victory 适合愿意承担历史材料和维护成本的收藏或书写者；需要统一尺寸、现代墨胆和稳定保修，应转向 Parker 当前型号，不能用 Parker 51、Parker 25 或现代 C/C 规格替代。",
      ),
    ],
    [
      {
        key: "phase461-victory-depth",
        title: "Phase 461：Parker Victory Newhaven Mk I–V 的上墨与修复边界",
        eventType: "design_milestone",
        startDate: "2026-08-04",
        circa: false,
        description:
          "以 Parkercollector、Parker Penography、官方历史与护理资料重核英国 Victory 的身份、Mk／filler 边界、跨品牌混淆和修复风险。",
        sourceKey: victoryCollector.key,
      },
    ],
  ),
];
