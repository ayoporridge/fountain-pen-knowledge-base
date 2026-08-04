import type {
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
} from "../lib/curated-content-pack";
import {
  PHASE139_IDS,
  phase139NewModelPacks,
} from "./phase139-german-swiss-current-batch";
import {
  PHASE348_IMPRONTE_OVERSIZE_ID,
  phase348MaioraImprontePacks,
} from "./phase348-maiora-impronte";
import {
  PHASE65_WRITER_PORTABLE_ID,
  phase65NakayaPacks,
} from "./phase65-nakaya-raw";

export const PHASE466_IDS = {
  dia2: PHASE139_IDS.dia2,
  maioraOversize: PHASE348_IMPRONTE_OVERSIZE_ID,
  nakayaWriter: PHASE65_WRITER_PORTABLE_ID,
} as const;

function base(
  packs: CuratedEntityPack[],
  entityId: string,
  label: string,
): CuratedEntityPack {
  const pack = packs.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 466 ${label} pack is missing.`);
  return pack;
}

function source(
  pack: CuratedEntityPack,
  key: string,
  label: string,
): CuratedSource {
  const found = pack.sources.find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Phase 466 ${label} source ${key} is missing.`);
  return found;
}

function scope(
  slug: string,
  productionState: CuratedScope["productionState"],
): CuratedScope {
  const key = `phase466-${slug}-depth`;
  return {
    key,
    scopeKey: key,
    validFrom: "2026-08-04",
    productionState,
    editionScope:
      "Phase 466 exact product 深化；尖幅、颜色、订单样本、地区库存与相邻型号保持分开，不把一支样本的数字扩成全系规格。",
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
      "maintenance_boundary",
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

const dia2 = base(phase139NewModelPacks, PHASE466_IDS.dia2, "Kaweco DIA2");
const maiora = base(
  phase348MaioraImprontePacks,
  PHASE466_IDS.maioraOversize,
  "Maiora Impronte Oversize",
);
const nakaya = base(phase65NakayaPacks, PHASE466_IDS.nakayaWriter, "Nakaya Writer Portable");

const dia2Official = source(dia2, "phase139-dia2-chrome-f", "DIA2 official SKU");
const dia2Series = source(dia2, "phase139-dia2-series", "DIA2 series");
const dia2Manual = source(dia2, "phase139-kaweco-manual", "Kaweco care manual");
const dia2Converter = source(dia2, "phase139-kaweco-standard-converter", "Kaweco converter");
const dia2Review = source(dia2, "phase139-dia2-review", "DIA2 independent sample");

const maioraCatalog = source(
  maiora,
  "phase348-maiora-official-catalog",
  "Maiora catalog",
);
const maioraGentleman = source(
  maiora,
  "phase348-maiora-gentleman",
  "Maiora Oversize review",
);
const maioraPenAddict = source(
  maiora,
  "phase348-maiora-penaddict",
  "Maiora Posillipo review",
);
const maioraSbre = source(maiora, "phase348-maiora-sbrebrown", "Maiora measurement sample");
const maioraRetailer = source(
  maiora,
  "phase348-maiora-penchalet-oversize",
  "Maiora Oversize retailer",
);
const maioraStandard = source(
  maiora,
  "phase348-maiora-pencilcase",
  "Maiora standard sibling",
);

const nakayaOfficial = source(nakaya, "phase65-nakaya-writer-portable", "Nakaya Writer official");
const nakayaSize = source(nakaya, "phase65-nakaya-size", "Nakaya size table");
const nakayaReview = source(
  nakaya,
  "phase65-nakaya-writer-portable-review",
  "Nakaya Writer sample",
);
const nakayaBrand = source(nakaya, "phase65-nakaya-brand", "Nakaya brand");

const dia2Scope = scope("kaweco-dia2", "current");
const maioraScope = scope("maiora-impronte-oversize", "current");
const nakayaScope = scope("nakaya-writer-portable-kuro-tamenuri", "current");

export const phase466KawecoDia2MaioraImpronteOversizeNakayaWriterDepthPacks: CuratedEntityPack[] = [
  refresh(
    dia2,
    "phase466-kaweco-dia2-depth-v1",
    dia2Scope,
    [
      claim(
        dia2Official,
        dia2Scope.scopeKey,
        "phase466-dia2-identity",
        "model_identity",
        "Kaweco DIA2 Chrome F 10000557 是现代全尺寸 PMMA cartridge/converter 型号；1921 是 DIA 名称的历史语境，不是现代 DIA2 的首发年份。",
      ),
      claim(
        dia2Official,
        dia2Scope.scopeKey,
        "phase466-dia2-measurement",
        "measurement_boundary",
        "10000557 的 13.1 cm 闭合、15.8 cm 打开／插帽、14.2 mm 无夹直径和 26.8 g 属于该 Chrome F 商品范围；Gold 饰件、旧批次、是否含墨和量测点不能混用。",
      ),
      claim(
        dia2Manual,
        dia2Scope.scopeKey,
        "phase466-dia2-filling",
        "filling_system",
        "DIA2 使用标准墨囊或 Kaweco Standard Converter；是否随包装附 converter 应按具体销售 SKU 核对，不能用品牌名称推断包装内容。",
      ),
      claim(
        dia2Converter,
        dia2Scope.scopeKey,
        "phase466-dia2-nib",
        "variant_boundary",
        "DIA2 使用 060 threaded nib section，与 Supra／Original 的 250 大尖不同；EF、F、M、B、BB 和官方兼容的 060 单元应按尖幅与 SKU 记录。",
      ),
      claim(
        dia2Series,
        dia2Scope.scopeKey,
        "phase466-dia2-family",
        "version_boundary",
        "DIA2 的 Chrome／Gold 是饰件路线，历史 DIA、现代第一代 Dia、Sport、Student 和 Supra 都不能共享内部结构、尺寸或供墨表。",
      ),
      claim(
        dia2Manual,
        dia2Scope.scopeKey,
        "phase466-dia2-care",
        "maintenance_boundary",
        "换色和停用前用室温清水缓慢冲洗并自然干燥；PMMA、螺纹和镀层避免热水、酒精、强溶剂、超声波、研磨剂与硬物刮擦。",
      ),
      claim(
        dia2Review,
        dia2Scope.scopeKey,
        "phase466-dia2-sample",
        "sample_boundary",
        "独立评测中小尖视觉比例、BB 顺滑和湿润属于受测样本；它们不能升级为所有 DIA2 尖幅或固定出墨结论。",
      ),
      claim(
        dia2Series,
        dia2Scope.scopeKey,
        "phase466-dia2-selection",
        "selection_guidance",
        "想要全尺寸黑色复古轮廓和简单 cartridge/converter 可选 DIA2；需要口袋长度选 Sport／Liliput，需要可拆中接和 250 尖比较 Supra，需要活塞大容量则另看活塞型号。",
      ),
    ],
    [
      {
        key: "phase466-dia2-depth",
        title: "Phase 466：DIA2 10000557 的量测、060 前端与日用边界",
        eventType: "design_milestone",
        startDate: "2026-08-04",
        circa: false,
        description:
          "补足 Chrome F 商品条件、060 尖路线、标准 converter、维护限制和与 Supra／Sport 的选择分流。",
        sourceKey: dia2Official.key,
      },
    ],
  ),
  refresh(
    maiora,
    "phase466-maiora-impronte-oversize-depth-v1",
    maioraScope,
    [
      claim(
        maioraCatalog,
        maioraScope.scopeKey,
        "phase466-maiora-identity",
        "model_identity",
        "Maiora Impronte Oversize 是 Impronte 家族中的较大尺寸路线；它与标准 Impronte 共用设计语言，但桶径、握位与样本重量形成独立型号边界。",
      ),
      claim(
        maioraGentleman,
        maioraScope.scopeKey,
        "phase466-maiora-grip",
        "selection_boundary",
        "Capri acrylic 样本的宽桶与深凹握位是具体作者的握持观察，能解释 Oversize 的设计取向，但不代表每种树脂、尖幅或手型都会同样舒适。",
      ),
      claim(
        maioraSbre,
        maioraScope.scopeKey,
        "phase466-maiora-measurement",
        "measurement_boundary",
        "Mirror Black 样本测得闭帽 145.2 mm、开盖 143.4 mm、套帽 153.7 mm、桶径约 15.5 mm、握位 11.5–12.9 mm、约 32 g；这些数字要保留样本与量测条件。",
      ),
      claim(
        maioraPenAddict,
        maioraScope.scopeKey,
        "phase466-maiora-filling",
        "filling_system",
        "Posillipo 样本的 #6 JoWo EF 与尾端 captured converter 说明它仍是 cartridge/converter 路线，不应写成活塞笔或把单支改装当作所有 Oversize 标准。",
      ),
      claim(
        maioraRetailer,
        maioraScope.scopeKey,
        "phase466-maiora-material",
        "variant_boundary",
        "Capri、Posillipo、Mirror Black 等名称首先是颜色或树脂样本；亮／哑表面、金／铑电镀、编号版和限量色应按完整商品版本记录。",
      ),
      claim(
        maioraCatalog,
        maioraScope.scopeKey,
        "phase466-maiora-care",
        "maintenance_boundary",
        "标准国际卡水／转换器用室温清水清洗并自然干燥；树脂、螺纹和金属件避免酒精、丙酮、热水、漂白剂、研磨膏和无资料强拆。",
      ),
      claim(
        maioraStandard,
        maioraScope.scopeKey,
        "phase466-maiora-selection",
        "selection_guidance",
        "喜欢存在感、宽桶、凹面握位和约 30 g 级别重量时再选 Oversize；追求窄握位、轻量或更容易放入口袋时，应先比较标准 Impronte。",
      ),
      claim(
        maioraPenAddict,
        maioraScope.scopeKey,
        "phase466-maiora-sample",
        "sample_boundary",
        "Posillipo、Capri 和 Mirror Black 来自不同评测者与树脂样本；EF 或 B 的书写感、平衡和表面观感不能外推到全系。",
      ),
    ],
    [
      {
        key: "phase466-maiora-depth",
        title: "Phase 466：Impronte Oversize 的样本量测、converter 与选购分流",
        eventType: "design_milestone",
        startDate: "2026-08-04",
        circa: false,
        description:
          "补足不同 Oversize 样本的量测条件、captured converter、材料版本、维护和标准款选择边界。",
        sourceKey: maioraCatalog.key,
      },
    ],
  ),
  refresh(
    nakaya,
    "phase466-nakaya-writer-portable-depth-v1",
    nakayaScope,
    [
      claim(
        nakayaOfficial,
        nakayaScope.scopeKey,
        "phase466-nakaya-identity",
        "model_identity",
        "Nakaya Writer Portable Kuro-tamenuri 对应官方产品号 1177WP5-11-00；Writer 是带笔夹的基础笔形，Portable 是长度路线，Kuro-tamenuri 是漆面，不是三个重复型号。",
      ),
      claim(
        nakayaOfficial,
        nakayaScope.scopeKey,
        "phase466-nakaya-finish",
        "material_finish",
        "官方说明为硬橡胶笔身、朱色底层叠加黑色上层的 Kuro-tamenuri；照片曝光和个体手工差异不能被写成统一红黑色卡。",
      ),
      claim(
        nakayaSize,
        nakayaScope.scopeKey,
        "phase466-nakaya-measurement",
        "measurement_boundary",
        "官方尺寸表约为总长 150 mm、未盖帽 130 mm、最大直径 15 mm、总重 25 g、未盖帽约 15 g；手工作品有小幅误差，不能与 Cigar 的约 20 g 直接互换。",
      ),
      claim(
        nakayaReview,
        nakayaScope.scopeKey,
        "phase466-nakaya-order",
        "selection_boundary",
        "论坛中的 14K、双拼色尖、Platinum 螺旋上墨器和调校体验属于个体订单；当前产品号的笔尖、研磨、供墨与价格需按订单确认。",
      ),
      claim(
        nakayaBrand,
        nakayaScope.scopeKey,
        "phase466-nakaya-care",
        "maintenance_boundary",
        "漆面与笔夹用柔软干布轻拭，换墨用室温清水吸排并自然干燥；避免热水、酒精、强溶剂、抛光剂、超声波、硬刷和强拆笔尖。",
      ),
      claim(
        nakayaReview,
        nakayaScope.scopeKey,
        "phase466-nakaya-carry",
        "selection_guidance",
        "需要固定在笔袋或口袋边缘时，Writer 的笔夹是功能条件；偏好无中断轮廓或主要放在笔托、硬壳笔套中时，可比较无笔夹的 Cigar Portable。",
      ),
      claim(
        nakayaReview,
        nakayaScope.scopeKey,
        "phase466-nakaya-sample",
        "sample_boundary",
        "个体评测只能说明某次订单的笔尖、转换器与书写阻尼；不能把样本的重量、墨容量或尖型升级为所有 Writer Portable Kuro-tamenuri 的固定事实。",
      ),
      claim(
        nakayaOfficial,
        nakayaScope.scopeKey,
        "phase466-nakaya-status",
        "order_boundary",
        "官方页面的价格、制作期和接单状态随时间变化；页面可见性不等于长期库存，也不替代下单前的书面确认。",
      ),
    ],
    [
      {
        key: "phase466-nakaya-depth",
        title: "Phase 466：Writer Portable Kuro-tamenuri 的订单层与携带分流",
        eventType: "design_milestone",
        startDate: "2026-08-04",
        circa: false,
        description:
          "把产品号、Writer／Portable／漆面分层、手工量测误差、订单选项、笔夹维护和 Cigar 分流补到型号页。",
        sourceKey: nakayaOfficial.key,
      },
    ],
  ),
];
