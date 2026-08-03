import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE40_PARKER_ID,
  PHASE40_PREMIER_MODERN_ID,
  PHASE40_PREMIER_VINTAGE_ID,
  phase40ParkerFrontierPremierVictoryPacks,
} from "./phase40-parker-frontier-premier-victory";
import {
  PHASE156_IDS,
  phase156ParkerVpVsPacks,
} from "./phase156-parker-vp-vs";

export const PHASE453_MODEL_IDS = {
  premierVintage: PHASE40_PREMIER_VINTAGE_ID,
  premierModern: PHASE40_PREMIER_MODERN_ID,
  vp: PHASE156_IDS.vp,
} as const;

const allBasePacks = [
  ...phase40ParkerFrontierPremierVictoryPacks,
  ...phase156ParkerVpVsPacks,
];

function modelFrom(entityId: string, label: string): CuratedEntityPack {
  const pack = allBasePacks.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 453 ${label} model pack is missing.`);
  return pack;
}

function source(key: string, label: string): CuratedSource {
  const found = allBasePacks
    .flatMap((pack) => pack.sources)
    .find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Phase 453 ${label} source ${key} is missing.`);
  return found;
}

function currentScope(slug: string, productionState: "current" | "historical"): CuratedScope {
  const key = `phase453-${slug}-model-depth`;
  return {
    key,
    scopeKey: key,
    productionState,
    editionScope: "Phase 453 Parker 型号深化；代际、颜色、尖幅、上墨、地区 SKU 与维修状态按来源和实物粒度记录。",
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
  const locator = sourceItem.summary ?? sourceItem.title;
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
  scope: CuratedScope,
  claims: CuratedEntityPack["claims"],
  timeline: NonNullable<CuratedEntityPack["timeline"]>,
): CuratedEntityPack {
  return {
    ...base,
    key,
    sources: [...base.sources],
    scopes: [...base.scopes, scope],
    claims: [...base.claims, ...claims],
    timeline: [...(base.timeline ?? []), ...timeline],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const premierVintageBase = modelFrom(
  PHASE453_MODEL_IDS.premierVintage,
  "Parker Premier vintage",
);
const premierModernBase = modelFrom(
  PHASE453_MODEL_IDS.premierModern,
  "Parker Premier modern",
);
const vpBase = modelFrom(PHASE453_MODEL_IDS.vp, "The Parker VP");

const history = source("parker-official-history", "Parker official history");
const care = source("parker-care-guide", "Parker care guide");
const premierVintage = source("phase40-parker-premier-vintage", "Premier vintage archive");
const premier75 = source("phase40-parker-premier-75-reference", "Premier and Parker 75 reference");
const premierModernCatalog = source(
  "phase40-parker-premier-modern-catalog",
  "Premier modern catalogue",
);
const vpRichard = source("phase156-parker-vp-richard", "Parker VP profile");
const vpPenography = source("phase156-parker-vp-penography", "Parker VP penography");
const vpNibs = source("phase156-parker-vp-nibs", "Parker VP nib guide");
const vpPatent = source("phase156-parker-vp-patent", "Parker VP patent");
const vpCatalog = source("phase156-parker-vp-catalog", "Parker VP catalogue");

const vintageScope = currentScope("parker-premier-vintage", "historical");
const modernScope = currentScope("parker-premier-modern", "current");
const vpScope = currentScope("the-parker-vp", "historical");

export const phase453ParkerPremierVpDepthPacks: CuratedEntityPack[] = [
  refresh(
    premierVintageBase,
    "phase453-parker-premier-vintage-depth-v1",
    vintageScope,
    [
      claim(
        premierVintage,
        vintageScope.scopeKey,
        "phase453-premier-vintage-identity",
        "generation_identity",
        "经典 Parker Premier 属于约 1983–1991/94 的欧洲高端分支；本页不把 2009 年后的 contemporary Premier 回填为同一代。",
      ),
      claim(
        premierVintage,
        vintageScope.scopeKey,
        "phase453-premier-vintage-materials",
        "material_boundary",
        "18K 金尖、金属或漆面笔身、帽环、夹具与端饰随款式和市场变化；金色外观不能单独证明实金或天然宝石。",
      ),
      claim(
        premier75,
        vintageScope.scopeKey,
        "phase453-premier-vintage-family",
        "family_boundary",
        "经典 Premier 与 Parker 75 有设计谱系关联，但笔尖座、转换器接口、笔帽与饰件不因血缘而自动通用，也不能合并成 Parker 75 型号。",
      ),
      claim(
        care,
        vintageScope.scopeKey,
        "phase453-premier-vintage-care",
        "maintenance_boundary",
        "老款墨囊／converter 先用凉水吸排并确认密封；漆面和镀层避开酒精、研磨与高温，老化橡胶件的替换应记录为维修历史。",
      ),
      claim(
        premierVintage,
        vintageScope.scopeKey,
        "phase453-premier-vintage-selection",
        "selection_boundary",
        "选购需同时核对帽顶端饰、夹具、笔尖刻字、笔杆环、盒卡与维修史；没有年代线索的高价 listing 不应因 Premier 或 18K 字样溢价。",
      ),
    ],
    [
      {
        key: "phase453-premier-vintage-depth",
        title: "Phase 453：经典 Premier 的欧洲分支与 modern 代际边界",
        eventType: "model_released",
        startDate: "1983",
        circa: true,
        description: "补足经典 Premier 的年代范围、18K 尖与装饰版本、Parker 75 谱系边界及老款维护和选购证据顺序。",
        sourceKey: premierVintage.key,
      },
    ],
  ),
  refresh(
    premierModernBase,
    "phase453-parker-premier-modern-depth-v1",
    modernScope,
    [
      claim(
        history,
        modernScope.scopeKey,
        "phase453-premier-modern-identity",
        "generation_identity",
        "现代 Parker Premier 约 2009 年重回产品线；它是 contemporary 系列，不是 1980 年代欧洲 Premier 的继续销售或改名。",
      ),
      claim(
        premierModernCatalog,
        modernScope.scopeKey,
        "phase453-premier-modern-catalog",
        "catalog_boundary",
        "2012 Parker Japan 目录把颜色、饰件和套装按地区 SKU 组织；目录是当时市场快照，不能直接等同全球当前库存或统一尺寸表。",
      ),
      claim(
        premierModernCatalog,
        modernScope.scopeKey,
        "phase453-premier-modern-materials",
        "material_boundary",
        "现代 Premier 常见黄铜基底、漆面或 PVD／镀层金属与 18K 尖；表面反光和颜色不能替代笔尖刻字、帽环、端部及货号证据。",
      ),
      claim(
        care,
        modernScope.scopeKey,
        "phase453-premier-modern-care",
        "maintenance_boundary",
        "Parker 墨囊／converter 以凉水吸排维护；漆面和 PVD 避免酒精、研磨膏与硬物，尖端偏斜或断墨应交给熟悉现代 Parker 尖组的修笔者。",
      ),
      claim(
        premierModernCatalog,
        modernScope.scopeKey,
        "phase453-premier-modern-selection",
        "selection_boundary",
        "购买现代 Premier 应核对产品编号、颜色、饰件、尖幅、converter、盒卡与市场；停售颜色、旧目录和经销商现货须分别标注，不创建重复颜色主实体。",
      ),
    ],
    [
      {
        key: "phase453-premier-modern-depth",
        title: "Phase 453：现代 Premier 的 2009 以后 SKU 与库存边界",
        eventType: "model_released",
        startDate: "2009",
        circa: true,
        description: "补足现代 Premier 的 contemporary 身份、2012 同期目录、漆面／PVD 与 18K 结构、C/C 维护和地区库存判断。",
        sourceKey: premierModernCatalog.key,
      },
    ],
  ),
  refresh(
    vpBase,
    "phase453-parker-vp-depth-v1",
    vpScope,
    [
      claim(
        vpCatalog,
        vpScope.scopeKey,
        "phase453-vp-identity",
        "model_identity",
        "The Parker VP（Very Personal）在 1962 年前后以三角握位、旋转尖和 Clean Filler 进入市场；本页保持它作为独立历史型号。",
      ),
      claim(
        vpRichard,
        vpScope.scopeKey,
        "phase453-vp-mechanism",
        "mechanism_boundary",
        "三角握位引导手指落点，旋转尖总成允许调整笔尖朝向；Clean Filler 是可拆卸挤压式转换器，不能用普通 Parker 墨囊或 75 converter 直接代替。",
      ),
      claim(
        vpPatent,
        vpScope.scopeKey,
        "phase453-vp-primary-context",
        "primary_source_boundary",
        "专利和 1962 年目录用于确认工程与上市语境，不替代每支二手 VP 的尺寸、原装零件或生产年份鉴定。",
        0.94,
      ),
      claim(
        vpNibs,
        vpScope.scopeKey,
        "phase453-vp-nib-lineage",
        "nib_lineage_boundary",
        "Parker 75 Reference 的尖号展板可说明 VP 到 75 的设计血缘和尖码差异，但 75 尖号不能倒写成 VP 原厂配置。",
      ),
      claim(
        vpRichard,
        vpScope.scopeKey,
        "phase453-vp-care",
        "maintenance_boundary",
        "维护应先拆下并检查 Clean Filler，凉水清洗后让长颈和密封件自然干燥；旋转机构有阻力或松旷时不要继续硬拧。",
      ),
      claim(
        vpPenography,
        vpScope.scopeKey,
        "phase453-vp-selection",
        "selection_boundary",
        "选购应索取三角握位、旋转刻度、尖端、转换器颈部、帽内衬和刻字照片；VP 与 Parker 75、Premier 以设计血缘关联，不合并身份或规格。",
      ),
    ],
    [
      {
        key: "phase453-vp-depth",
        title: "Phase 453：Parker VP 的三角握位、旋转尖与 Clean Filler",
        eventType: "design_milestone",
        startDate: "1962",
        circa: true,
        description: "补足 VP 的 1962 上市语境、旋转尖和三角握位机制、Clean Filler 安全边界以及与 Parker 75 的独立身份。",
        sourceKey: vpCatalog.key,
      },
    ],
  ),
];

if (new Set(phase453ParkerPremierVpDepthPacks.map((pack) => pack.entityId)).size !== 3) {
  throw new Error("Phase 453 Parker Premier/VP pack must contain three unique models.");
}

for (const pack of phase453ParkerPremierVpDepthPacks) {
  if (pack.spec?.brandEntityId !== PHASE40_PARKER_ID) {
    throw new Error(`Phase 453 ${pack.expectedSlug} must remain linked to Parker brand.`);
  }
}
