import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE329_CLR_ID,
  PHASE329_ESTEEM_ID,
  PHASE329_TRAVELLER_ID,
  phase329DiplomatCurrentPacks,
} from "./phase329-diplomat-current";

export const PHASE460_DIPLOMAT_IDS = {
  traveller: PHASE329_TRAVELLER_ID,
  esteem: PHASE329_ESTEEM_ID,
  clr: PHASE329_CLR_ID,
} as const;

const allBasePacks = phase329DiplomatCurrentPacks;

function base(entityId: string, label: string): CuratedEntityPack {
  const pack = allBasePacks.find((candidate) => candidate.entityId === entityId);
  if (!pack) throw new Error(`Phase 460 ${label} pack is missing.`);
  return pack;
}

function source(key: string, label: string): CuratedSource {
  const found = allBasePacks.flatMap((pack) => pack.sources).find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Phase 460 ${label} source ${key} is missing.`);
  return found;
}

function scope(slug: string): CuratedScope {
  const key = `phase460-${slug}-depth`;
  return {
    key,
    scopeKey: key,
    productionState: "current",
    editionScope:
      "Phase 460 型号深化；官方样本、地区 SKU、附件和第三方样本分层记录，不把相邻 Diplomat 系列规格互相回填。",
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
    factClass: predicate === "use_and_care" || predicate === "selection_boundary" ? "editorial" : "core",
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

const travellerBase = base(PHASE460_DIPLOMAT_IDS.traveller, "Diplomat Traveller");
const esteemBase = base(PHASE460_DIPLOMAT_IDS.esteem, "Diplomat Esteem");
const clrBase = base(PHASE460_DIPLOMAT_IDS.clr, "Diplomat CLR");

const collections = source("phase329-diplomat-collections", "Diplomat collections");
const archive = source("phase329-diplomat-fountain-archive", "Diplomat fountain archive");
const guide = source("phase329-diplomat-service-guide", "Diplomat service guide");
const travellerProduct = source("phase329-diplomat-traveller-product", "Traveller product");
const travellerArchive = source("phase329-diplomat-traveller-archive", "Traveller archive");
const travellerReview = source("phase329-ian-hedley-traveller", "Traveller review");
const esteemProduct = source("phase329-diplomat-esteem-product", "Esteem product");
const esteemReview = source("phase329-gentleman-stationer-esteem", "Esteem review");
const clrProduct = source("phase329-diplomat-clr-product", "CLR product");
const clrReview = source("phase329-penchalet-clr", "CLR retailer review");

const travellerScope = scope("diplomat-traveller");
const esteemScope = scope("diplomat-esteem");
const clrScope = scope("diplomat-clr");

export const phase460DiplomatTravellerEsteemClrDepthPacks: CuratedEntityPack[] = [
  refresh(
    travellerBase,
    "phase460-diplomat-traveller-depth-v1",
    travellerScope,
    [
      claim(
        travellerProduct,
        travellerScope.scopeKey,
        "phase460-traveller-identity",
        "model_identity",
        "Diplomat Traveller 是官方目录中的纤细金属 C/C 钢笔路线；Chrome Steel、Steel Gold、Flame、Funky 与 Lapis 属于同一型号的表面或市场 SKU。",
      ),
      claim(
        travellerProduct,
        travellerScope.scopeKey,
        "phase460-traveller-sample",
        "sample_specification",
        "官方 Chrome Steel 样本为闭帽 134 mm、插帽 155 mm、直径 10 mm、19 g、F/M 不锈钢尖并随一支墨胆；数字跟随样本与包装条件。",
      ),
      claim(
        travellerArchive,
        travellerScope.scopeKey,
        "phase460-traveller-variants",
        "variant_boundary",
        "官方归档把 Steel、Steel Gold、Flame、Funky、Lapis 与 lacquered chrome/gold 分列为商品组合；颜色和电镀不创建重复基础实体。",
      ),
      claim(
        travellerReview,
        travellerScope.scopeKey,
        "phase460-traveller-writing",
        "writing_sample_boundary",
        "专业评测对细长笔身、笔帽和插帽平衡的观察只属于评测样本；不能把单支的干湿、反馈或重心外推到所有颜色和尖幅。",
      ),
      claim(
        guide,
        travellerScope.scopeKey,
        "phase460-traveller-care",
        "use_and_care",
        "换色或久置后按官方服务指南清洗转换器和尖部，清水排到变淡、自然干燥并笔尖朝上携带；漆面和镀金避免酒精、研磨布与高温满墨。",
      ),
      claim(
        collections,
        travellerScope.scopeKey,
        "phase460-traveller-selection",
        "selection_boundary",
        "Traveller 适合轻便、细握位和标准墨胆便利；偏好更粗握位或大容量应比较 Esteem、CLR、Magnum 或 Nexus，而不是把相邻型号机构混入 Traveller。",
      ),
    ],
    [
      {
        key: "phase460-traveller-depth",
        title: "Phase 460：Diplomat Traveller 的细长金属路线与 SKU 边界",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足 Traveller 的官方样本尺寸、国际墨胆／转换器、表面版本、细握位、维护和二手身份核对。",
        sourceKey: travellerProduct.key,
      },
    ],
  ),
  refresh(
    esteemBase,
    "phase460-diplomat-esteem-depth-v1",
    esteemScope,
    [
      claim(
        esteemProduct,
        esteemScope.scopeKey,
        "phase460-esteem-identity",
        "model_identity",
        "Diplomat Esteem 是官方目录中的圆柱金属日用钢笔；Lapis、Barley、lacquered 与 matt chrome 是表面或纹理变体，不与 CLR 或 Excellence 合并。",
      ),
      claim(
        esteemProduct,
        esteemScope.scopeKey,
        "phase460-esteem-sample",
        "sample_specification",
        "官方 Esteem Lapis 样本为黄铜笔身、闭帽 135 mm、插帽 155 mm、直径 12 mm、28 g、F/M/B 不锈钢尖并随一支墨胆；重量不外推到全部 SKU。",
      ),
      claim(
        esteemReview,
        esteemScope.scopeKey,
        "phase460-esteem-writing",
        "writing_sample_boundary",
        "The Gentleman Stationer 的评测记录钢尖、塑料握位与日用手感；这些观察限定为评测样本，购买仍需核对当期表面、尖幅和附件。",
      ),
      claim(
        collections,
        esteemScope.scopeKey,
        "phase460-esteem-family",
        "family_boundary",
        "Esteem 的圆柱 12 mm 路线与 Traveller 的 10 mm 细杆、CLR 的可换内环、Viper/Cobra 的帽机制分开；相邻型号规格不能互相回填。",
      ),
      claim(
        guide,
        esteemScope.scopeKey,
        "phase460-esteem-care",
        "use_and_care",
        "按官方服务指南用清水或温水冲洗墨胆／转换器和尖部，避免酒精、漂白剂、研磨剂与硬刷；长时间不用倒空，异常时保留保修凭证。",
      ),
      claim(
        archive,
        esteemScope.scopeKey,
        "phase460-esteem-selection",
        "selection_boundary",
        "Esteem 适合希望圆柱握位、金属稳定感和 F/M/B 钢尖的人；要换色环看 CLR，要轻细便携看 Traveller，要特殊帽机制则进入其他 Diplomat 系列。",
      ),
    ],
    [
      {
        key: "phase460-esteem-depth",
        title: "Phase 460：Diplomat Esteem 的圆柱黄铜样本与版本选择",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足 Esteem 的 12 mm/28 g 官方样本、F/M/B 尖、墨胆／转换器附件、表面变体、清洗和相邻系列分流。",
        sourceKey: esteemProduct.key,
      },
    ],
  ),
  refresh(
    clrBase,
    "phase460-diplomat-clr-depth-v1",
    clrScope,
    [
      claim(
        clrProduct,
        clrScope.scopeKey,
        "phase460-clr-identity",
        "model_identity",
        "Diplomat CLR 的识别点是黄铜金属笔身与可更换中央内环；五个色环、颜色和尖幅属于同一型号的 SKU 变体。",
      ),
      claim(
        clrProduct,
        clrScope.scopeKey,
        "phase460-clr-sample",
        "sample_specification",
        "官方 Chrome Lacquer 样本为闭帽 135 mm、插帽 155 mm、直径 12 mm、30 g、不锈钢尖、转换器与五年保修；数字跟随具体商品。",
      ),
      claim(
        clrProduct,
        clrScope.scopeKey,
        "phase460-clr-ring",
        "mechanism_boundary",
        "内环承担识别色和外观变化，不承担供墨或流量调节；更换前应排空、擦干并避免刀尖或过大侧向力伤及漆面和黄铜。",
      ),
      claim(
        clrReview,
        clrScope.scopeKey,
        "phase460-clr-market",
        "market_sku_boundary",
        "Pen Chalet 的经销资料交叉确认金属笔身、色环、钢尖和转换器语境；单一库存不能覆盖全部颜色，也不替代官方尺寸和保修。",
      ),
      claim(
        guide,
        clrScope.scopeKey,
        "phase460-clr-care",
        "use_and_care",
        "按官方服务指南清洗转换器和尖部，色环与漆面避开酒精、强溶剂、研磨布和硬刷；环片偏心、松动或帽体卡顿时停止拆装并走售后。",
      ),
      claim(
        collections,
        clrScope.scopeKey,
        "phase460-clr-selection",
        "selection_boundary",
        "CLR 适合想要中等直径金属笔且希望改变识别色的人；偏好轻细看 Traveller，偏好圆柱但不换环看 Esteem，特殊帽机制则比较 Viper/Cobra。",
      ),
    ],
    [
      {
        key: "phase460-clr-depth",
        title: "Phase 460：Diplomat CLR 的可换内环与金属日用边界",
        eventType: "design_milestone",
        startDate: "2026-08-03",
        circa: false,
        description:
          "补足 CLR 的内环身份、官方 12 mm/30 g 样本、转换器、表面与色环版本、维护和二手核对。",
        sourceKey: clrProduct.key,
      },
    ],
  ),
];
