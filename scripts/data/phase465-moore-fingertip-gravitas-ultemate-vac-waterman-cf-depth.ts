import type {
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
} from "../lib/curated-content-pack";
import {
  PHASE168_FINGERTIP_ID,
  phase168MooreFingertipPacks,
} from "./phase168-moore-fingertip";
import {
  PHASE260_GRAVITAS_MODEL_ID,
  phase260RangaGravitasPacks,
} from "./phase260-ranga-gravitas";
import { PHASE157_IDS, phase157WatermanCfPacks } from "./phase157-waterman-cf";

export const PHASE465_IDS = {
  fingertip: PHASE168_FINGERTIP_ID,
  gravitas: PHASE260_GRAVITAS_MODEL_ID,
  watermanCf: PHASE157_IDS.cf,
} as const;

const moorePacks = phase168MooreFingertipPacks;
const gravitasPacks = phase260RangaGravitasPacks;
const watermanPacks = phase157WatermanCfPacks;

function base(entityId: string, label: string): CuratedEntityPack {
  const pack = [...moorePacks, ...gravitasPacks, ...watermanPacks].find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 465 ${label} pack is missing.`);
  return pack;
}

function source(
  pack: CuratedEntityPack,
  key: string,
  label: string,
): CuratedSource {
  const found = pack.sources.find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Phase 465 ${label} source ${key} is missing.`);
  return found;
}

function scope(
  slug: string,
  productionState: CuratedScope["productionState"],
): CuratedScope {
  const key = `phase465-${slug}-depth`;
  return {
    key,
    scopeKey: key,
    validFrom: "2026-08-03",
    productionState,
    editionScope:
      "Phase 465 exact product 深化；颜色、地区版本、独立样本与相邻家族保持分开，不把一支样本的数字扩成全系规格。",
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
    factClass: [
      "maintenance",
      "use_and_care",
      "selection_guidance",
      "selection_boundary",
      "sample_boundary",
      "measurement_boundary",
    ].includes(predicate)
      ? "editorial"
      : "core",
    confidence: 0.96,
    sourceKey: sourceItem.key,
    locator,
    evidence: [
      {
        key: `${key}-evidence`,
        sourceKey: sourceItem.key,
        scopeKey,
        locator,
      },
    ],
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

const fingertip = base(PHASE465_IDS.fingertip, "Moore Fingertip");
const gravitasBase = base(PHASE465_IDS.gravitas, "Gravitas Ultemate Vac");
const gravitasBrand = gravitasPacks.find(
  (pack) => pack.expectedType === "brand" && pack.expectedSlug === "gravitas",
);
if (!gravitasBrand) throw new Error("Phase 465 Gravitas brand pack is missing.");
const gravitasOfficialBrand = source(
  gravitasBrand,
  "phase260-gravitas-official",
  "Gravitas official brand navigation",
);
const gravitas = {
  ...gravitasBase,
  sources: [...gravitasBase.sources, gravitasOfficialBrand],
};
const watermanCf = base(PHASE465_IDS.watermanCf, "Waterman C/F");

const fingertipHero = source(
  fingertip,
  "phase168-moore-fingertip-penhero",
  "Moore Fingertip PenHero",
);
const fingertipEarly = source(
  fingertip,
  "phase168-moore-fingertip-penhero-early",
  "Moore Fingertip early archive",
);
const fingertipPatent = source(
  fingertip,
  "phase168-moore-fingertip-us2432112",
  "Moore Fingertip patent",
);
const fingertipRoss = source(
  fingertip,
  "phase168-moore-fingertip-ross",
  "Moore Fingertip specimen",
);

const gravitasOfficial = source(
  gravitas,
  "phase260-gravitas-vac",
  "Gravitas official product",
);
const gravitasAcrylic = source(
  gravitas,
  "phase260-gravitas-acrylic",
  "Gravitas acrylic sibling",
);
const gravitasVac2 = source(
  gravitas,
  "phase260-gravitas-vac2",
  "Gravitas Vac 2.0 sibling",
);
const gravitasReview = source(
  gravitas,
  "phase260-gravitas-review",
  "Gravitas independent review",
);
const gravitasRetailer = source(
  gravitas,
  "phase260-gravitas-venture",
  "Gravitas independent listing",
);

const cfOfficial = source(
  watermanCf,
  "phase157-waterman-official-history",
  "Waterman official history",
);
const cfRichard = source(
  watermanCf,
  "phase157-waterman-cf-richard",
  "Waterman C/F Richard's Pens",
);
const cfVintage = source(
  watermanCf,
  "phase157-waterman-cf-vintage",
  "Waterman C/F Vintage Pens",
);
const cfPatent = source(
  watermanCf,
  "phase157-waterman-cf-patent",
  "Waterman C/F patent",
);

const fingertipScope = scope("moore-fingertip", "historical");
const gravitasScope = scope("gravitas-ultemate-vac", "current");
const cfScope = scope("waterman-cf", "historical");

export const phase465MooreFingertipGravitasUltemateVacWatermanCfDepthPacks: CuratedEntityPack[] = [
  refresh(
    fingertip,
    "phase465-moore-fingertip-depth-v1",
    fingertipScope,
    [
      claim(
        fingertipHero,
        fingertipScope.scopeKey,
        "phase465-fingertip-identity",
        "model_identity",
        "Moore Fingertip 是约 1946–1950 年的独立历史型号；内嵌式尖、流线笔身和杠杆上墨共同区别于 Moore Non-Leakable 安全笔。",
      ),
      claim(
        fingertipHero,
        fingertipScope.scopeKey,
        "phase465-fingertip-nib",
        "nib_boundary",
        "档案将 Fingertip 记为 14K gold inlaid style nib，并列出 EF/F/M/B 可能字幅；刻字、原装程度、重磨和实际线宽必须按单支实物核对。",
      ),
      claim(
        fingertipHero,
        fingertipScope.scopeKey,
        "phase465-fingertip-measurement",
        "measurement_boundary",
        "大号样本约 5 英寸闭帽、约 6 又 3/8 英寸插帽；是否含夹、帽口插入深度、celluloid 收缩和 demi 版本都会改变量测条件。",
      ),
      claim(
        fingertipHero,
        fingertipScope.scopeKey,
        "phase465-fingertip-filling",
        "filling_system",
        "Fingertip 使用杠杆和墨囊，不采用 Non-Leakable 的收尖密封结构；老墨囊、压条、section 与杠杆应先检查再灌墨。",
      ),
      claim(
        fingertipEarly,
        fingertipScope.scopeKey,
        "phase465-fingertip-versions",
        "version_boundary",
        "公开档案中的大号塑料／celluloid、demi 与金属帽路线不能共享长度、重量和装饰数据；颜色名称也不是现存笔的统一色卡。",
      ),
      claim(
        fingertipRoss,
        fingertipScope.scopeKey,
        "phase465-fingertip-care",
        "maintenance",
        "清洗用常温清水缓慢吸排，避免热水、酒精、强溶剂和硬物撬动内嵌尖；section、尖或墨囊异常时交给熟悉 vintage Moore 的维修者。",
      ),
      claim(
        fingertipHero,
        fingertipScope.scopeKey,
        "phase465-fingertip-selection",
        "selection_guidance",
        "收藏或日用选择应先看尖端齐平度、section、杠杆、帽环、celluloid 裂纹和匹配笔帽，再考虑颜色和稀有度；缺少结构照片的标题应保留待核。",
      ),
      claim(
        fingertipPatent,
        fingertipScope.scopeKey,
        "phase465-fingertip-patent-boundary",
        "sample_boundary",
        "1945/1947 专利解释内嵌尖、section 与 barrel 的设计语境，但不能替代某支实物对尖材、颜色、换尖、后配帽或修复状态的判断。",
      ),
    ],
    [
      {
        key: "phase465-fingertip-depth",
        title: "Phase 465：Moore Fingertip 的尺寸、结构证据与修复边界",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "把大号／demi 的量测条件、内嵌尖鉴别、杠杆上墨和收藏检查清单补到现有型号页。",
        sourceKey: fingertipHero.key,
      },
    ],
  ),
  refresh(
    gravitas,
    "phase465-gravitas-ultemate-vac-depth-v1",
    gravitasScope,
    [
      claim(
        gravitasOfficial,
        gravitasScope.scopeKey,
        "phase465-gravitas-identity",
        "model_identity",
        "Gravitas Ultemate Vac 是 ULTEM 树脂真空上墨型号；Piston、Monster、Vac 2.0 和 acrylic sibling 都是相邻路线，不是同一规格页。",
      ),
      claim(
        gravitasOfficial,
        gravitasScope.scopeKey,
        "phase465-gravitas-fill",
        "filling_system",
        "真空杆把墨水带入主仓，次级 chamber 约 0.7 ml 并由 shut-off valve 控制供墨；“完成抽墨”和“已经可以连续书写”是两个检查点。",
      ),
      claim(
        gravitasOfficial,
        gravitasScope.scopeKey,
        "phase465-gravitas-capacity",
        "measurement_boundary",
        "官方标称主仓超过 2.5 ml、次级 chamber 约 0.7 ml，另列 25 mm section、约 11–13 mm 握位和 closed/open 约 28.8/24 g；不能迁移给 Vac 2.0。",
      ),
      claim(
        gravitasOfficial,
        gravitasScope.scopeKey,
        "phase465-gravitas-nib",
        "variant_boundary",
        "原装 Gravitas steel #6 可选 EF/F/M/B，页面提到 JoWo size 6 兼容性但附有螺纹、O-ring 与使用者风险条件，不代表所有 #6 unit 即插即用。",
      ),
      claim(
        gravitasReview,
        gravitasScope.scopeKey,
        "phase465-gravitas-sample",
        "sample_boundary",
        "专业评测中的真空动作、书写和拆洗体验属于一支送测样本；它能帮助理解机构，不升级为所有批次的出墨、重量或可靠性结论。",
      ),
      claim(
        gravitasOfficial,
        gravitasScope.scopeKey,
        "phase465-gravitas-care",
        "maintenance",
        "官方建议常规水性墨水，清洗后在螺纹和密封处少量使用 silicone grease；颜料、闪粉、铁胆或香味墨水以及无资料强拆都应视为风险边界。",
      ),
      claim(
        gravitasAcrylic,
        gravitasScope.scopeKey,
        "phase465-gravitas-material-boundary",
        "version_boundary",
        "ULTEM regular 与 clear acrylic 是材料 variant；透明度、重量和表面状态不能跨版本回填，颜色也不替代商品 SKU。",
      ),
      claim(
        gravitasVac2,
        gravitasScope.scopeKey,
        "phase465-gravitas-selection",
        "selection_guidance",
        "重视大容量和可维护真空机构时再选 Ultemate Vac；偏好金属重量、随身立即书写或 Kraken filling system 时应比较 Vac 2.0 或 cartridge/converter 型号。",
      ),
    ],
    [
      {
        key: "phase465-gravitas-depth",
        title: "Phase 465：Ultemate Vac 的阀门、容量与第三方笔尖边界",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足主仓／次级 chamber 的使用状态、第三方 nib 风险、墨水限制和 Vac 2.0 分流。",
        sourceKey: gravitasOfficial.key,
      },
    ],
  ),
  refresh(
    watermanCf,
    "phase465-waterman-cf-depth-v1",
    cfScope,
    [
      claim(
        cfOfficial,
        cfScope.scopeKey,
        "phase465-cf-identity",
        "model_identity",
        "Waterman C/F（Cartridge Filler）是 1953 年推出、以塑料墨囊和金属穿刺管为核心的 Waterman 历史型号。",
      ),
      claim(
        cfRichard,
        cfScope.scopeKey,
        "phase465-cf-interface",
        "filling_system",
        "C/F 的专用接口由穿刺管、橡胶密封圈和可拆换尖组共同完成；现代国际标准墨囊不能按品牌名称直接视为兼容。",
      ),
      claim(
        cfRichard,
        cfScope.scopeKey,
        "phase465-cf-regional",
        "version_boundary",
        "美国、法国 Jif-Waterman、英国和加拿大生产，以及硬橡胶／塑料笔舌、尖材、漆面和 demonstrator 不能压成单一规格。",
      ),
      claim(
        cfVintage,
        cfScope.scopeKey,
        "phase465-cf-history",
        "historical_boundary",
        "美国生产约在 1957 年前后结束，其他地区继续发展，整体家族寿命约三十年；不能简化成一个全球停产日。",
      ),
      claim(
        cfRichard,
        cfScope.scopeKey,
        "phase465-cf-maintenance",
        "maintenance",
        "日用前先检查穿刺管、密封圈、帽内衬、笔舌和旧墨囊残片；清洗拆下墨囊并用凉水缓慢冲洗，金属管不要弯折，漆面和镀层避免强溶剂。",
      ),
      claim(
        cfRichard,
        cfScope.scopeKey,
        "phase465-cf-selection",
        "selection_guidance",
        "准备日用优先选择接口完整、密封圈已更换且帽内衬不收缩的普通色；稀有漆面和透明 demonstrator 应在确认结构稳定后再考虑长期灌墨。",
      ),
      claim(
        cfRichard,
        cfScope.scopeKey,
        "phase465-cf-measurement",
        "measurement_boundary",
        "替代墨囊是否合适要以接口长度、穿刺管居中度、密封杯弹性和少量清水观察为准，不能用一次能刺破来证明长期密封。",
      ),
      claim(
        cfPatent,
        cfScope.scopeKey,
        "phase465-cf-patent-boundary",
        "design_history",
        "US Patent 2,802,448 只提供 C/F 卡水接口的工程背景，不替代每一支量产笔的尺寸、材料、地区或维修状态。",
      ),
    ],
    [
      {
        key: "phase465-cf-depth",
        title: "Phase 465：Waterman C/F 的接口替代件与地区版本核验",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足专用卡水接口、地区／年代记录、日用与展示边界及二手购买最低证据。",
        sourceKey: cfOfficial.key,
      },
    ],
  ),
];
