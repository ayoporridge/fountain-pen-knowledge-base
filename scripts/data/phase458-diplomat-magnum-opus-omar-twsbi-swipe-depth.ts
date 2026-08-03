import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE330_MAGNUM_ID,
  phase330DiplomatMagnumPacks,
} from "./phase330-diplomat-magnum";
import {
  PHASE141_IDS,
  phase141AllPacks,
} from "./phase141-taiwan-twsbi-representative-batch";

export const PHASE458_MODEL_IDS = {
  diplomatMagnum: PHASE330_MAGNUM_ID,
  opus88Omar: PHASE141_IDS.omar,
  twsbiSwipe: PHASE141_IDS.swipe,
} as const;

const allBasePacks = [...phase330DiplomatMagnumPacks, ...phase141AllPacks];

function modelFrom(entityId: string, label: string): CuratedEntityPack {
  const pack = allBasePacks.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 458 ${label} model pack is missing.`);
  return pack;
}

function source(key: string, label: string): CuratedSource {
  const found = allBasePacks.flatMap((pack) => pack.sources).find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Phase 458 ${label} source ${key} is missing.`);
  return found;
}

function scope(slug: string, productionState: "current" | "historical"): CuratedScope {
  const key = `phase458-${slug}-model-depth`;
  return {
    key,
    scopeKey: key,
    productionState,
    editionScope:
      "Phase 458 型号深化；规格、版本、上墨、维护与选购边界按来源粒度记录，不跨同门型号回填。",
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
    factClass: predicate === "use_and_care" ? "editorial" : "core",
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
): CuratedEntityPack {
  return {
    ...base,
    key,
    scopes: [...base.scopes, modelScope],
    claims: [...base.claims, ...claims],
    timeline: [...(base.timeline ?? []), ...timeline],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const magnumBase = modelFrom(PHASE458_MODEL_IDS.diplomatMagnum, "Diplomat Magnum");
const omarBase = modelFrom(PHASE458_MODEL_IDS.opus88Omar, "Opus 88 Omar");
const swipeBase = modelFrom(PHASE458_MODEL_IDS.twsbiSwipe, "TWSBI Swipe");

const magnumProduct = source("phase330-diplomat-magnum-product", "Diplomat Magnum product");
const magnumArchive = source("phase330-diplomat-magnum-archive", "Diplomat Magnum archive");
const magnumHistory = source("phase330-diplomat-history", "Diplomat Magnum history");
const magnumGuide = source("phase330-diplomat-service-guide", "Diplomat service guide");
const magnumReview = source("phase330-pen-addict-magnum", "Diplomat Magnum review");

const omarProduct = source("phase141-opus-omar", "Opus 88 Omar product");
const omarReview = source("phase141-opus-omar-review", "Opus 88 Omar review");
const opusBrand = source("phase141-opus-brand", "Opus 88 brand");

const swipeProduct = source("phase141-twsbi-swipe", "TWSBI Swipe product");
const twsbiBrand = source("phase141-twsbi-brand", "TWSBI brand");
const twsbiReview = source("phase141-twsbi-review", "TWSBI family review");

const magnumScope = scope("diplomat-magnum", "current");
const omarScope = scope("opus-88-omar", "current");
const swipeScope = scope("twsbi-swipe", "current");

export const phase458DiplomatMagnumOpusOmarTwsbiSwipeDepthPacks: CuratedEntityPack[] = [
  refresh(
    magnumBase,
    "phase458-diplomat-magnum-depth-v1",
    magnumScope,
    [
      claim(
        magnumProduct,
        magnumScope.scopeKey,
        "phase458-magnum-identity",
        "model_identity",
        "Diplomat Magnum 是独立的轻量日用钢笔路线；普通 Magnum 与 Magnum Demo 是同一家族的颜色／透明版本，球笔、机械铅笔和 Spacetec 不进入钢笔实体。",
      ),
      claim(
        magnumProduct,
        magnumScope.scopeKey,
        "phase458-magnum-spec",
        "sample_specification",
        "官方当前商品样本为闭帽 135 mm、插帽 153 mm、直径 12 mm、净重 14 g；是否含转换器、墨水和具体饰件会改变实测条件。",
      ),
      claim(
        magnumHistory,
        magnumScope.scopeKey,
        "phase458-magnum-history",
        "history_boundary",
        "官方品牌历史把 Magnum 的系列里程碑放在 1996 年；这不是当前颜色 SKU 的生产日期，也不能外推到 Traveller、CLR 或 Esteem。",
      ),
      claim(
        magnumArchive,
        magnumScope.scopeKey,
        "phase458-magnum-variants",
        "variant_boundary",
        "Magnum Demo 在官方归档中作为透明商品分列，普通 Magnum 另有多种颜色；颜色、透明度和尖幅是 SKU 记录，不创建重复基础型号。",
      ),
      claim(
        magnumGuide,
        magnumScope.scopeKey,
        "phase458-magnum-care",
        "use_and_care",
        "换色或久置后按官方服务指南用清水冲洗尖部和转换器，避免塑料件接触热水、酒精和强溶剂；转换器漏气、笔帽积墨或尖端弯折时应停用并走售后。",
      ),
      claim(
        magnumReview,
        magnumScope.scopeKey,
        "phase458-magnum-selection",
        "selection_boundary",
        "EF/F 更适合细格纸，M 是一般笔记的稳妥起点，B 与 Stub 1.1 需要更宽行距；专业评测的顺滑和湿润只属于样笔，不是统一调校承诺。",
      ),
    ],
    [
      {
        key: "phase458-magnum-depth",
        title: "Phase 458：Diplomat Magnum 的轻量日用与 SKU 边界",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足 Magnum 的 1996 系列里程碑、官方样本测量、Demo 与颜色变体、尖幅和服务指南维护边界。",
        sourceKey: magnumProduct.key,
      },
    ],
  ),
  refresh(
    omarBase,
    "phase458-opus-88-omar-depth-v1",
    omarScope,
    [
      claim(
        omarProduct,
        omarScope.scopeKey,
        "phase458-omar-identity",
        "model_identity",
        "Opus 88 Omar 是大号树脂 #6 Japanese-style eyedropper，尾端旋钮控制止墨阀；它不是活塞吸墨器，也不应与 Jazz、Koloro 或 Demonstrator 合并。",
      ),
      claim(
        omarProduct,
        omarScope.scopeKey,
        "phase458-omar-mechanism",
        "filling_boundary",
        "灌墨需使用滴管并保持螺纹与密封面清洁，开始书写前打开尾端阀门，携带前关闭阀门；止墨阀是控制墨流的步骤，不是对错误装配的绝对防漏保证。",
      ),
      claim(
        omarReview,
        omarScope.scopeKey,
        "phase458-omar-sibling",
        "version_boundary",
        "Omar 的圆润大号 #6 路线与 Koloro 的不同尖路、Demonstrator 的透明体量及 Jazz 的笔形分开；评测的容量、重量和写感只能保留为样本。",
      ),
      claim(
        omarProduct,
        omarScope.scopeKey,
        "phase458-omar-measurement",
        "measurement_boundary",
        "当前零售页面没有为所有颜色提供统一可复核的长度、重量和毫升数；大容量是结构取向，实装量受滴管、排气、表面张力和温度影响。",
        0.94,
      ),
      claim(
        omarReview,
        omarScope.scopeKey,
        "phase458-omar-care",
        "use_and_care",
        "换色前关闭阀门并倒空墨水，用清水冲洗笔舌和墨仓，待螺纹与 O-ring 干燥后再装墨；高饱和、闪粉或防水墨水需要更短清洗周期。",
      ),
      claim(
        opusBrand,
        omarScope.scopeKey,
        "phase458-omar-selection",
        "selection_boundary",
        "Omar 适合连续书写、喜欢观察墨量且能接受大体积的人；需要快速换墨囊、轻装通勤或小握位的人应比较 cartridge/converter 型号。",
      ),
    ],
    [
      {
        key: "phase458-omar-depth",
        title: "Phase 458：Opus 88 Omar 的止墨阀与滴管使用边界",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足 Omar 的 #6 身份、尾端阀门、实际容量条件、清洗顺序、同门型号分流和大体积选购取舍。",
        sourceKey: omarProduct.key,
      },
    ],
  ),
  refresh(
    swipeBase,
    "phase458-twsbi-swipe-depth-v1",
    swipeScope,
    [
      claim(
        swipeProduct,
        swipeScope.scopeKey,
        "phase458-swipe-identity",
        "model_identity",
        "TWSBI Swipe 是以标准国际墨囊／转换器为中心的钢笔；弹簧转换器是可替换配件，不是 GO 的一体式弹簧活塞或 Diamond 的旋钮活塞。",
      ),
      claim(
        swipeProduct,
        swipeScope.scopeKey,
        "phase458-swipe-nibs",
        "nib_boundary",
        "官方 Ice Blue 页面列 EF/F/M/B/Stub 1.1 不锈钢尖；选择范围不代表每个颜色和市场同时有货，实际线宽仍受纸张、墨水和尖端调校影响。",
      ),
      claim(
        swipeProduct,
        swipeScope.scopeKey,
        "phase458-swipe-packaging",
        "market_sku_boundary",
        "不同地区包装可能包含弹簧转换器、传统转换器或额外墨囊的不同组合；包装差异不创建第二个型号，也不改变 Swipe 的 canonical identity。",
      ),
      claim(
        twsbiBrand,
        swipeScope.scopeKey,
        "phase458-swipe-family",
        "family_boundary",
        "Swipe、GO、ECO、Diamond 580、VAC700R 和 Mini AL 是同门但不同上墨路线；容量、尺寸、维修步骤和配件不能相互继承。",
      ),
      claim(
        swipeProduct,
        swipeScope.scopeKey,
        "phase458-swipe-care",
        "use_and_care",
        "墨囊用完后取下，转换器路线以清水吸排到水色变淡；弹簧转换器不应猛烈甩动或在压缩时强行旋帽，笔帽结墨和接口漏气应先清洁排查。",
      ),
      claim(
        twsbiReview,
        swipeScope.scopeKey,
        "phase458-swipe-selection",
        "selection_boundary",
        "Swipe 适合需要国际标准补墨并在传统转换器与弹簧转换器之间切换的人；希望观察大墨量活塞或真空结构，应进入 Diamond、GO 或 VAC700R 页面。",
      ),
    ],
    [
      {
        key: "phase458-swipe-depth",
        title: "Phase 458：TWSBI Swipe 的三种补墨路线",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足 Swipe 的墨囊、传统转换器与弹簧转换器差异、地区包装、尖幅、同门分流和二手检查边界。",
        sourceKey: swipeProduct.key,
      },
    ],
  ),
];
