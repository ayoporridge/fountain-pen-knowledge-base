import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE49_LAVA_COLOR_ID,
  phase49ViscontiHomoSapiensPacks,
} from "./phase49-visconti-homo-sapiens";
import {
  PHASE45_CP1_ID,
  phase45LamyAionCp1Packs,
} from "./phase45-lamy-aion-cp1";
import {
  PHASE217_LILY_910_ID,
  phase217Lily910Packs,
} from "./phase217-lily-910";

export const PHASE456_MODEL_IDS = {
  viscontiLavaColor: PHASE49_LAVA_COLOR_ID,
  lamyCp1: PHASE45_CP1_ID,
  lily910: PHASE217_LILY_910_ID,
} as const;

const allBasePacks = [
  ...phase49ViscontiHomoSapiensPacks,
  ...phase45LamyAionCp1Packs,
  ...phase217Lily910Packs,
];

function modelFrom(entityId: string, label: string): CuratedEntityPack {
  const pack = allBasePacks.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 456 ${label} model pack is missing.`);
  return pack;
}

function source(key: string, label: string): CuratedSource {
  const found = allBasePacks
    .flatMap((pack) => pack.sources)
    .find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Phase 456 ${label} source ${key} is missing.`);
  return found;
}

function scope(slug: string, productionState: "current" | "historical"): CuratedScope {
  const key = `phase456-${slug}-model-depth`;
  return {
    key,
    scopeKey: key,
    productionState,
    editionScope:
      "Phase 456 型号深化；颜色、尖材、尺寸、机构、样本体验、历史维修状态与地区库存按来源粒度记录，不跨 sibling 回填。",
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
    factClass: "core",
    confidence,
    sourceKey: sourceItem.key,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey: sourceItem.key, scopeKey, locator }],
  };
}

function refresh(
  base: CuratedEntityPack,
  key: string,
  modelScope: CuratedScope,
  claims: CuratedEntityPack["claims"],
  timeline: NonNullable<CuratedEntityPack["timeline"]>,
  additionalSources: CuratedSource[] = [],
): CuratedEntityPack {
  const sources = [...base.sources, ...additionalSources].filter(
    (candidate, index, all) =>
      all.findIndex((item) => item.key === candidate.key) === index,
  );
  return {
    ...base,
    key,
    sources,
    scopes: [...base.scopes, modelScope],
    claims: [...base.claims, ...claims],
    timeline: [...(base.timeline ?? []), ...timeline],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const viscontiBase = modelFrom(PHASE456_MODEL_IDS.viscontiLavaColor, "Visconti Lava Color");
const cp1Base = modelFrom(PHASE456_MODEL_IDS.lamyCp1, "LAMY cp1");
const lilyBase = modelFrom(PHASE456_MODEL_IDS.lily910, "Lily 910");

const lavaOfficial = source("phase49-visconti-lava-color-official", "Visconti Lava Color official page");
const lavaReview = source("phase49-visconti-lava-color-pencilcase", "Visconti Lava Color professional notes");
const lavaCare = source("phase49-visconti-care", "Visconti care page");
const lavaCatalog = source("phase49-visconti-catalog", "Visconti catalogue");

const cp1Official = source("phase45-lamy-cp1-black", "LAMY cp1 black official page");
const cp1Review = source("phase45-lamy-cp1-review", "LAMY cp1 review");
const cp1Aquamarine = source("phase45-lamy-cp1-aquamarine", "LAMY cp1 aquamarine official page");
const cp1Row = source("phase45-lamy-cp1-row", "LAMY cp1 regional list");

const lilyReview = source("phase217-lily-estilofilos", "Lily 910 independent record");
const lilyZhihu = source("phase217-lily-zhihu", "Lily 910 Chinese comparison");
const lilyDiagram = source("phase217-lily-910-svg", "Lily 910 factual diagram");
const lilyFpn: CuratedSource = {
  key: "phase456-lily-910-fpn-review",
  registryKey: "fountain-pen-network-lily-910-phase456",
  registryName: "Fountain Pen Network contributors",
  sourceType: "forum",
  tier: "community",
  independenceGroup: "fountain-pen-network-lily-910-phase456",
  title: "Fountain Pen Network: Annual Review 2019 - Lily 910",
  url: "https://www.fountainpennetwork.com/forum/topic/346545-annual-review-2019-lily-910/",
  homepageUrl: "https://www.fountainpennetwork.com/",
  author: "Fountain Pen Network contributors",
  publishedAt: "2019",
  retrievedAt: "2026-08-03",
  summary:
    "社区评测讨论把 Lily 910 作为中国伸缩钢笔识别线索；只用于补充玩家语境，不承担制造者、年份或统一规格结论。",
  allowedUse: "summary_only",
  archiveUrl: "https://www.fountainpennetwork.com/forum/topic/346545-annual-review-2019-lily-910/",
  archiveLocator:
    "live-source-not-frozen;retrieved=2026-08-03;external_archive=false;locator=Annual Review 2019 - Lily 910",
};

const lavaScope = scope("visconti-lava-color", "current");
const cp1Scope = scope("lamy-cp1", "current");
const lilyScope = scope("lily-910", "historical");

export const phase456ViscontiLavaColorLamyCp1Lily910DepthPacks: CuratedEntityPack[] = [
  refresh(
    viscontiBase,
    "phase456-visconti-lava-color-depth-v1",
    lavaScope,
    [
      claim(
        lavaOfficial,
        lavaScope.scopeKey,
        "phase456-lava-identity",
        "model_identity",
        "Homo Sapiens Lava Color 是彩色熔岩与树脂复合材料的独立 sibling；磁吸帽、anti-stain、Double Reservoir Power Filler 和色号共同构成身份，不与 Lava Bronze、Dark Age、Crystal Dream 或 Dark Crystal 合并。",
      ),
      claim(
        lavaOfficial,
        lavaScope.scopeKey,
        "phase456-lava-mechanism",
        "filling_boundary",
        "Lava Color 使用 Double Reservoir Power Filler，不是普通活塞或 converter；装墨、排空和清洗应按双储墨结构完成，尾端发涩、吸入量异常或墨窗气泡不应靠蛮力处理。",
      ),
      claim(
        lavaReview,
        lavaScope.scopeKey,
        "phase456-lava-sample",
        "sample_experience_boundary",
        "颜色、树脂纹理、磁吸帽手感、出墨和重量属于具体色号或评测样本；专业评测能补充书写体验，但不能把某一色号的测量值扩展到全家族。",
        0.94,
      ),
      claim(
        lavaCatalog,
        lavaScope.scopeKey,
        "phase456-lava-variants",
        "variant_boundary",
        "KP15-08-01、KP15-08-02、KP15-08-03 等是同一 Lava Color family 下的色号变体；颜色名称、饰件和库存按商品号记录，不因每个颜色新建基础型号。",
      ),
      claim(
        lavaCare,
        lavaScope.scopeKey,
        "phase456-lava-care",
        "maintenance_boundary",
        "官方维护建议使用室温清水吸排、排空晾干并避免溶剂、热水和不必要拆解；透明或浅色材料更容易显出残墨，换色时应耐心清洗两个储墨区。",
      ),
      claim(
        lavaOfficial,
        lavaScope.scopeKey,
        "phase456-lava-selection",
        "selection_boundary",
        "选购时核对 KP15-08 色号、笔尖刻字、磁吸帽、Double Reservoir、售后和实拍；当前页面的 14K 自制尖不应回填到早期可能出现的 18K 或其它代际。",
      ),
    ],
    [
      {
        key: "phase456-lava-depth",
        title: "Phase 456：Visconti Lava Color 的材料、双储墨与色号边界",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足 Lava Color 的彩色熔岩材料、磁吸帽、Double Reservoir 操作、KP15-08 色号、清洗风险和与其它 Homo Sapiens sibling 的身份分流。",
        sourceKey: lavaOfficial.key,
      },
    ],
  ),
  refresh(
    cp1Base,
    "phase456-lamy-cp1-depth-v1",
    cp1Scope,
    [
      claim(
        cp1Official,
        cp1Scope.scopeKey,
        "phase456-cp1-identity",
        "model_identity",
        "LAMY cp1 fountain pen 是 Gerd A. Müller 设计的细长全金属钢笔；cp1 twin/tri 等多功能兄弟不是本页的钢笔，也不共享笔尖和上墨规格。",
      ),
      claim(
        cp1Official,
        cp1Scope.scopeKey,
        "phase456-cp1-spec",
        "specification_snapshot",
        "黑色标准款官方约 135 mm、9 mm、18 g，使用抛光钢 EF/F/M/B、T10 墨囊和 Z27 converter；这些字段只绑定黑色商品 SKU。",
      ),
      claim(
        cp1Aquamarine,
        cp1Scope.scopeKey,
        "phase456-cp1-variant",
        "variant_boundary",
        "2025 aquamarine 特别版官方页给出约 150 mm、20 mm、24 g，与黑色标准款的 135 mm、9 mm、18 g 分开记录；不能用零售商沿用的黑款数字覆盖特别版。",
      ),
      claim(
        cp1Review,
        cp1Scope.scopeKey,
        "phase456-cp1-sample",
        "sample_experience_boundary",
        "细长、轻、适合笔环携带和直握位的体验来自专业评测样本；手大者可能在长时间书写中感到握位窄，尖宽和湿度也受墨水、纸张与调校影响。",
        0.94,
      ),
      claim(
        cp1Official,
        cp1Scope.scopeKey,
        "phase456-cp1-care",
        "maintenance_boundary",
        "漆面用柔软微湿布清洁，避免酒精、金属抛光剂和粗布；换墨拆下 T10/Z27 后用常温清水吸排并干燥，不以自行打磨尖端解决跳字或刮纸。",
      ),
      claim(
        cp1Row,
        cp1Scope.scopeKey,
        "phase456-cp1-selection",
        "selection_boundary",
        "购买时保存地区官方链接、产品号、颜色、尖幅、随附墨囊与 converter；若筛选结果混入 rollerball 或 twin/tri，先确认 fountain pen 类型再记录订单和库存日期。",
      ),
    ],
    [
      {
        key: "phase456-cp1-depth",
        title: "Phase 456：LAMY cp1 的细长握位与黑色／aquamarine 分流",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足 cp1 的标准黑款规格、aquamarine 独立尺寸、细长书写体验、漆面护理、T10/Z27 和多功能兄弟边界。",
        sourceKey: cp1Official.key,
      },
    ],
  ),
  refresh(
    lilyBase,
    "phase456-lily-910-depth-v1",
    lilyScope,
    [
      claim(
        lilyReview,
        lilyScope.scopeKey,
        "phase456-lily-identity",
        "model_identity",
        "Lily 910 是公开资料中的中国历史无帽钢笔型号；其身份依靠 Lily／910 刻印、尾部释放机构、aerometric 供墨和无前端 shutter 的组合，不因与 Pilot Capless 相似而改名或合并。",
      ),
      claim(
        lilyReview,
        lilyScope.scopeKey,
        "phase456-lily-mechanism",
        "mechanism_boundary",
        "尾部机构控制笔尖伸缩，但前端没有内部 shutter，收回后仍暴露在空气中；按键阻力、笔尖行程、挤压囊和导墨应分别检查，不能把一次成功伸出当作整支笔健康。",
      ),
      claim(
        lilyReview,
        lilyScope.scopeKey,
        "phase456-lily-spec",
        "sample_specification_boundary",
        "约 144 mm 收回、151 mm 伸出、12.0 mm 直径、28.5 g 干重与约 1 ml 墨量来自一支实测样本；残墨、改件和磨损会改变二手测量，不形成统一生产规格。",
      ),
      claim(
        lilyZhihu,
        lilyScope.scopeKey,
        "phase456-lily-family",
        "family_boundary",
        "中文资料把 Lily 910 与大公 56 作为国产无帽例子，但 capless 只是结构类别；Pilot Capless 的气密 shutter、CON-40、金尖或授权关系不能移植到 Lily 910。",
      ),
      claim(
        lilyReview,
        lilyScope.scopeKey,
        "phase456-lily-care",
        "maintenance_boundary",
        "历史样本应先用常温清水低压检查 aerometric 挤压囊，再排空晾干；携带使用笔盒、让笔尖朝上，避免热水、酒精、整支浸泡和自行封堵前端。",
      ),
      claim(
        lilyZhihu,
        lilyScope.scopeKey,
        "phase456-lily-selection",
        "selection_boundary",
        "二手购买要索取收回／伸出两种状态、尖端刻字、尾端按钮、挤压囊和笔杆接缝照片；制造厂和年份未充分核实，不能只凭“国产 Capless”标题下结论。",
      ),
      claim(
        lilyFpn,
        lilyScope.scopeKey,
        "phase456-lily-community",
        "community_boundary",
        "Fountain Pen Network 的 2019 年讨论只能确认 Lily 910 在玩家资料中作为中国伸缩钢笔被辨认和讨论；它不替代独立实物记录，也不把社区称呼变成制造史结论。",
        0.9,
      ),
    ],
    [
      {
        key: "phase456-lily-depth",
        title: "Phase 456：Lily 910 的外露尖、aerometric 与历史样本边界",
        eventType: "design_milestone",
        startDate: "2017",
        circa: true,
        description:
          "补足 Lily 910 的无帽机构、无 shutter、实测窗口、修复风险、Pilot/Dagong 边界与收藏选购证据。",
        sourceKey: lilyReview.key,
      },
    ],
    [lilyFpn],
  ),
];

if (
  new Set(phase456ViscontiLavaColorLamyCp1Lily910DepthPacks.map((pack) => pack.entityId)).size !==
  3
) {
  throw new Error("Phase 456 Visconti/LAMY/Lily pack must contain three unique models.");
}

for (const pack of phase456ViscontiLavaColorLamyCp1Lily910DepthPacks) {
  if (!pack.spec?.brandEntityId) {
    throw new Error(`Phase 456 ${pack.expectedSlug} must retain its maker identity.`);
  }
}
