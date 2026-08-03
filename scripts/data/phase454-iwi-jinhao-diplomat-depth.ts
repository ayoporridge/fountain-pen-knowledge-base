import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE141_IDS,
  phase141AllPacks,
} from "./phase141-taiwan-twsbi-representative-batch";
import {
  PHASE63_X159_ID,
  phase63JinhaoPacks,
} from "./phase63-jinhao-split";
import {
  PHASE327_VIPER_ID,
  phase327DiplomatViperCobraPacks,
} from "./phase327-diplomat-viper-cobra";

export const PHASE454_MODEL_IDS = {
  iwiLaureate: PHASE141_IDS.iwiLaureate,
  jinhaoX159: PHASE63_X159_ID,
  diplomatViper: PHASE327_VIPER_ID,
} as const;

const allBasePacks = [
  ...phase141AllPacks,
  ...phase63JinhaoPacks,
  ...phase327DiplomatViperCobraPacks,
];

function modelFrom(entityId: string, label: string): CuratedEntityPack {
  const pack = allBasePacks.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 454 ${label} model pack is missing.`);
  return pack;
}

function source(key: string, label: string): CuratedSource {
  const found = allBasePacks
    .flatMap((pack) => pack.sources)
    .find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Phase 454 ${label} source ${key} is missing.`);
  return found;
}

function scope(slug: string, productionState: "current" | "historical"): CuratedScope {
  const key = `phase454-${slug}-model-depth`;
  return {
    key,
    scopeKey: key,
    productionState,
    editionScope: "Phase 454 型号深化；颜色、尖幅、上墨、地区 SKU 与样本维修状态按来源粒度记录。",
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

const iwiBase = modelFrom(PHASE454_MODEL_IDS.iwiLaureate, "IWI Laureate");
const jinhaoBase = modelFrom(PHASE454_MODEL_IDS.jinhaoX159, "Jinhao X159");
const viperBase = modelFrom(PHASE454_MODEL_IDS.diplomatViper, "Diplomat Viper");

const iwiPen = source("phase141-iwi-laureate", "IWI Laureate official page");
const iwiGuide = source("phase141-iwi-laureate-guide", "IWI Laureate dimension context");
const iwiTrade = source("phase141-iwi-trade", "IWI Taiwan trade profile");

const jinhaoCatalog = source("phase63-jinhao-collection", "Jinhao collection");
const jinhaoReview = source("phase63-jinhao-x159-review", "Jinhao X159 review");
const jinhaoArchive = source("phase63-jinhao-159-archive", "Jinhao 159 archive");

const viperCollections = source("phase327-diplomat-collections", "Diplomat collections");
const viperProduct = source("phase327-diplomat-viper-product", "Diplomat Viper product");
const viperConverter = source("phase327-diplomat-viper-converter", "Diplomat Viper converter");
const viperGuide = source("phase327-diplomat-service-guide", "Diplomat service guide");
const viperReview = source("phase327-pen-addict-viper", "Diplomat Viper review");
const viperRetailer = source("phase327-wonder-pens-viper", "Diplomat Viper retailer");
const viperArchive: CuratedSource = {
  key: "phase327-diplomat-fountain-archive",
  registryKey: "diplomat-official-phase327",
  registryName: "Diplomat",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "diplomat-official-phase327",
  title: "Diplomat fountain pen catalogue archive",
  url: "https://www.diplomat-pen.com/en/type-of-product/fountain-pen/",
  homepageUrl: "https://www.diplomat-pen.com/",
  author: "Diplomat",
  publishedAt: null,
  retrievedAt: "2026-07-28",
  allowedUse: "summary_only",
  summary:
    "官方钢笔归档把 Cobra 与 Viper 作为当前钢笔商品展示，并提供地区化价格快照；颜色库存不等同于历史全线。",
  archiveUrl: "https://www.diplomat-pen.com/en/type-of-product/fountain-pen/",
  archiveLocator:
    "live-source-not-frozen;retrieved=2026-07-28;external_archive=false;locator=current fountain pen listing and prices",
};

const iwiScope = scope("iwi-laureate", "current");
const jinhaoScope = scope("jinhao-x159", "current");
const viperScope = scope("diplomat-viper", "current");

export const phase454IwiJinhaoDiplomatDepthPacks: CuratedEntityPack[] = [
  refresh(
    iwiBase,
    "phase454-iwi-laureate-depth-v1",
    iwiScope,
    [
      claim(
        iwiPen,
        iwiScope.scopeKey,
        "phase454-iwi-identity",
        "model_identity",
        "IWI Laureate 本页只指 fountain pen；同名 rollerball 是集合中的 sibling，不能把补充芯、尺寸或照片回填到钢笔。",
      ),
      claim(
        iwiPen,
        iwiScope.scopeKey,
        "phase454-iwi-nib",
        "nib_boundary",
        "官方 Laureate 页面给出德国制造定制 EF fountain nib；没有证据证明金尖、完整尖幅或统一墨流，因此保留具体商品核对边界。",
      ),
      claim(
        iwiGuide,
        iwiScope.scopeKey,
        "phase454-iwi-dimensions",
        "dimension_boundary",
        "约 139.5 mm × 15 mm × 12 mm 属于 Laureate 集合页的尺寸语境，测量方向、是否含帽和跨地区商品应分别确认。",
      ),
      claim(
        iwiPen,
        iwiScope.scopeKey,
        "phase454-iwi-finish",
        "finish_boundary",
        "贵金属镀层、雕刻图案与弹性笔夹是外观和饰件特征；颜色是 finish variant，不能单独证明实金、天然宝石或统一底材。",
      ),
      claim(
        iwiTrade,
        iwiScope.scopeKey,
        "phase454-iwi-maker",
        "maker_context",
        "台湾文具业协会资料可交叉确认 I.W.I.C. 的台湾制造商语境，但不用于补充 Laureate 未公开的重量、上墨或首发年份。",
        0.94,
      ),
      claim(
        iwiPen,
        iwiScope.scopeKey,
        "phase454-iwi-selection",
        "selection_boundary",
        "购买前应分别核对 fountain pen、镀层色、定制 EF 尖、接口与配件、尺寸口径和售后；集合页没有统一 converter 说明时保持待确认。",
      ),
    ],
    [
      {
        key: "phase454-iwi-depth",
        title: "Phase 454：IWI Laureate 的钢笔身份、装饰与未知字段",
        eventType: "design_milestone",
        startDate: "2026-07-23",
        circa: false,
        description: "把 Laureate fountain pen 与 rollerball 分开，补足定制 EF、镀层、尺寸口径、上墨未知和购买证据边界。",
        sourceKey: iwiPen.key,
      },
    ],
    [iwiTrade],
  ),
  refresh(
    jinhaoBase,
    "phase454-jinhao-x159-depth-v1",
    jinhaoScope,
    [
      claim(
        jinhaoCatalog,
        jinhaoScope.scopeKey,
        "phase454-jinhao-identity",
        "model_identity",
        "Jinhao X159 是当代 acrylic 大笔与 #8 steel nib 路线，不是较早金属 Jinhao 159 的异名，也不与 9019 Dadao 合并。",
      ),
      claim(
        jinhaoReview,
        jinhaoScope.scopeKey,
        "phase454-jinhao-sample",
        "sample_boundary",
        "Stridewise 2023 样本约 146 mm 闭帽、#8 steel nib 与 converter 只属于该评测样本；不能保证所有颜色、批次和后配件。",
      ),
      claim(
        jinhaoCatalog,
        jinhaoScope.scopeKey,
        "phase454-jinhao-variants",
        "variant_boundary",
        "acrylic/resin 颜色、金属饰件和 EF/F/M 等尖号是市场 SKU 变体，不因颜色或尖幅变化创建新的 X159 基础型号。",
      ),
      claim(
        jinhaoArchive,
        jinhaoScope.scopeKey,
        "phase454-jinhao-159-boundary",
        "family_boundary",
        "旧金属 159 与 X159 需要分别记录；159 不承接 X159 的 acrylic、#8、146 mm 样本或 converter 图片，X159 也不使用 159 的未知规格。",
      ),
      claim(
        jinhaoReview,
        jinhaoScope.scopeKey,
        "phase454-jinhao-care",
        "maintenance_boundary",
        "converter 上墨先检查接口、O-ring 和螺纹，常温清水吸排并自然干燥；断墨、漏墨或尖位异常应先记录样本，不用针、砂纸或蛮力调尖。",
      ),
      claim(
        jinhaoCatalog,
        jinhaoScope.scopeKey,
        "phase454-jinhao-selection",
        "selection_boundary",
        "选购先确认订单或笔身写的是 X159，再核对 acrylic、#8 steel nib、converter、重量和握位；大笔身适配性要以试握和试写为准。",
      ),
    ],
    [
      {
        key: "phase454-jinhao-depth",
        title: "Phase 454：Jinhao X159 的 acrylic、#8 尖与 159 分家",
        eventType: "model_released",
        startDate: "2023",
        circa: true,
        description: "补足 X159 的当代身份、样本尺寸、converter 维护、颜色变体及与旧金属 159/9019 的型号边界。",
        sourceKey: jinhaoReview.key,
      },
    ],
    [jinhaoArchive],
  ),
  refresh(
    viperBase,
    "phase454-diplomat-viper-depth-v1",
    viperScope,
    [
      claim(
        viperProduct,
        viperScope.scopeKey,
        "phase454-viper-identity",
        "model_identity",
        "Diplomat Viper 是铝制雕刻纹理、磁吸帽和包覆式不锈钢尖的独立型号，不是 Aero/Elox 的改色，也不是 Cobra 的放大版。",
      ),
      claim(
        viperProduct,
        viperScope.scopeKey,
        "phase454-viper-spec",
        "specification_snapshot",
        "官方 guilloché 商品快照给出闭帽 140 mm、插帽 150 mm、直径 11 mm、30 g；数字绑定当前商品和测量口径，不扩展到相邻型号或所有地区。",
      ),
      claim(
        viperCollections,
        viperScope.scopeKey,
        "phase454-viper-cap-nib",
        "mechanism_boundary",
        "官方集合页用 magnetic cap、hooded nib、F/M 和 chiselled aluminium body 识别 Viper；它不是螺纹帽，也不能套用 Cobra 的 EF/F/M/B 尖幅。",
      ),
      claim(
        viperConverter,
        viperScope.scopeKey,
        "phase454-viper-filling",
        "filling_boundary",
        "短国际墨胆随官方商品语境出现，Viper 专用 plunger converter 另售；标准 Diplomat converter 页面排除 Viper，不能拿 A+、A2 或 Aero 配件硬塞。",
      ),
      claim(
        viperGuide,
        viperScope.scopeKey,
        "phase454-viper-care",
        "maintenance_boundary",
        "换色或久置按服务指南用清水/温水吸排并自然干燥；铝制雕刻面和包覆式尖避开酒精、抛光剂、针和硬刷，旅行时笔尖朝上。",
      ),
      claim(
        viperReview,
        viperScope.scopeKey,
        "phase454-viper-experience",
        "sample_experience_boundary",
        "专业评测可补充包覆式尖、磁吸帽和轻量金属握持的样本体验，但不替代官方尺寸、附件兼容或保修条件。",
        0.94,
      ),
      claim(
        viperRetailer,
        viperScope.scopeKey,
        "phase454-viper-selection",
        "selection_boundary",
        "选购时保存颜色、尖幅、是否含专用 converter、墨胆数量、保修卡与商品日期；颜色只在 variant 层记录，不创建五个基础实体。",
      ),
    ],
    [
      {
        key: "phase454-viper-depth",
        title: "Phase 454：Diplomat Viper 的磁吸帽、包覆式尖与配件边界",
        eventType: "design_milestone",
        startDate: "2026-07-28",
        circa: false,
        description: "补足 Viper 的官方商品快照、磁吸帽与包覆式尖、专用 converter、服务保修及 Cobra/Aero 排除边界。",
        sourceKey: viperProduct.key,
      },
    ],
    [viperArchive],
  ),
];

if (new Set(phase454IwiJinhaoDiplomatDepthPacks.map((pack) => pack.entityId)).size !== 3) {
  throw new Error("Phase 454 IWI/Jinhao/Diplomat pack must contain three unique models.");
}

for (const pack of phase454IwiJinhaoDiplomatDepthPacks) {
  if (!pack.spec?.brandEntityId) {
    throw new Error(`Phase 454 ${pack.expectedSlug} must retain its maker identity.`);
  }
}
