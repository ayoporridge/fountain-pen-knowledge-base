import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE43_CAPLESS_ID,
  PHASE43_CAPLESS_LS_ID,
  PHASE43_DECIMO_ID,
  phase43PilotCaplessPacks,
} from "./phase43-pilot-capless";

export const PHASE449_MODEL_IDS = {
  capless: PHASE43_CAPLESS_ID,
  decimo: PHASE43_DECIMO_ID,
  ls: PHASE43_CAPLESS_LS_ID,
} as const;

const RETRIEVED = "2026-08-03";

function modelFrom(entityId: string, label: string): CuratedEntityPack {
  const pack = phase43PilotCaplessPacks.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 449 ${label} model pack is missing.`);
  return pack;
}

function sourceFrom(key: string, label: string): CuratedSource {
  for (const pack of phase43PilotCaplessPacks) {
    const source = pack.sources.find((candidate) => candidate.key === key);
    if (source) return source;
  }
  throw new Error(`Phase 449 ${label} source ${key} is missing.`);
}

function officialSource(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  summary: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: "official",
    tier: "primary",
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

function currentScope(slug: string): CuratedScope {
  const key = `phase449-${slug}-current-model`;
  return {
    key,
    scopeKey: key,
    productionState: "current",
    editionScope: "Phase 449 Pilot Capless 家族深化；市场代码、finish、尖号和配件按具体 SKU 记录。",
  };
}

function addClaim(
  source: CuratedSource,
  scopeKey: string,
  key: string,
  predicate: string,
  objectText: string,
  confidence = 0.96,
): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence,
    sourceKey: source.key,
    locator: source.summary,
    evidence: [{ key: `${key}-evidence`, sourceKey: source.key, scopeKey, locator: source.summary }],
  };
}

function refresh(
  base: CuratedEntityPack,
  key: string,
  scope: CuratedScope,
  claims: CuratedEntityPack["claims"],
  sources: CuratedSource[],
  timeline: NonNullable<CuratedEntityPack["timeline"]>,
): CuratedEntityPack {
  return {
    ...base,
    key,
    sources: [...base.sources, ...sources],
    scopes: [...base.scopes, scope],
    claims: [...base.claims, ...claims],
    timeline: [...(base.timeline ?? []), ...timeline],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const caplessBase = modelFrom(PHASE449_MODEL_IDS.capless, "Pilot Capless");
const decimoBase = modelFrom(PHASE449_MODEL_IDS.decimo, "Pilot Capless Decimo");
const lsBase = modelFrom(PHASE449_MODEL_IDS.ls, "Pilot Capless LS");

const caplessOfficial = sourceFrom("phase43-pilot-capless-full", "Pilot Capless");
const caplessSupport = sourceFrom("phase43-pilot-capless-care", "Pilot Capless");
const caplessClassic = sourceFrom("phase43-pilot-capless-classic", "Pilot Capless");
const caplessReview = sourceFrom("phase43-pilot-capless-review", "Pilot Capless");
const decimoOfficial = sourceFrom("phase43-pilot-decimo-official", "Pilot Decimo");
const decimoChina = sourceFrom("phase43-pilot-decimo-china", "Pilot Decimo");
const decimoReview = sourceFrom("phase43-pilot-decimo-review", "Pilot Decimo");
const lsOfficial = sourceFrom("phase43-pilot-capless-ls", "Pilot Capless LS");
const lsPress = sourceFrom("phase43-pilot-capless-ls-press", "Pilot Capless LS");
const con40 = sourceFrom("phase43-pilot-con40", "Pilot Capless");

const currentFamily = officialSource({
  key: "phase449-pilot-capless-family-current",
  title: "Pilot Europe official Capless family overview",
  url: "https://www.pilotpen.eu/our-products/capless/",
  registryKey: "pilot-eu-official-phase449",
  registryName: "Pilot Europe official",
  summary: "官方 Capless 家族页把全尺寸 Capless、较细较轻的 Decimo 和按动钢笔的使用定位并列展示；家族描述不替代日本市场的具体产品代码。",
});
const currentLsCare = officialSource({
  key: "phase449-pilot-ls-warranty",
  title: "Pilot official Capless LS warranty page",
  url: "https://www.pilot.co.jp/support/warranty/jp/fountain/capless_ls.html",
  registryKey: "pilot-official-support-phase449",
  registryName: "Pilot Japan official support",
  summary: "官方 LS 保修页再次确认 FCLS-35SR 的当前身份；保修入口不扩展为所有 finish 的规格或价格。",
});

const caplessScope = currentScope("pilot-capless");
const decimoScope = currentScope("pilot-capless-decimo");
const lsScope = currentScope("pilot-capless-ls");

export const phase449PilotCaplessFamilyPacks: CuratedEntityPack[] = [
  refresh(
    caplessBase,
    "phase449-pilot-capless-depth-v1",
    caplessScope,
    [
      addClaim(currentFamily, caplessScope.scopeKey, "phase449-capless-family-name", "market_name_boundary", "全尺寸 Pilot Capless 在部分市场称 Vanishing Point；这是同一产品线的市场命名，不把 Decimo 或 LS 归入全尺寸页面。"),
      addClaim(caplessOfficial, caplessScope.scopeKey, "phase449-capless-full-spec", "current_sku_spec", "FC-1／FC-15SR 等全尺寸 SKU 采用按动机构、18K 尖与 Pilot 墨囊／CON-40；饰面和尖号按商品号区分。"),
      addClaim(caplessSupport, caplessScope.scopeKey, "phase449-capless-care", "maintenance_boundary", "官方护理要求不用时收回尖端、用清水吸排并避免自行拆 head；气压变化可能造成滴墨，容量小是按动结构的使用交换。"),
      addClaim(con40, caplessScope.scopeKey, "phase449-capless-con40", "filling_accessory", "CON-40 是当前兼容转换器，标称约 0.4 ml；墨囊与 converter 的选择按区域包装和具体 SKU 核对。"),
      addClaim(caplessReview, caplessScope.scopeKey, "phase449-capless-clip", "handling_observation", "专业评测把前端 clip 视为必须试握的结构选择，不把单支评测的夹子感受泛化为全系列缺陷。"),
    ],
    [currentFamily],
    [{ key: "phase449-capless-depth", title: "Phase 449：全尺寸 Capless 的市场命名、CON-40 与 clip 边界", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "将 Capless／Vanishing Point 命名、全尺寸 SKU、护理和前端夹子体验放回同一 canonical 型号页。", sourceKey: currentFamily.key }],
  ),
  refresh(
    decimoBase,
    "phase449-pilot-decimo-depth-v1",
    decimoScope,
    [
      addClaim(decimoOfficial, decimoScope.scopeKey, "phase449-decimo-code", "current_sku_identity", "FCT-15SR 是 Pilot Capless Decimo 的日本／国际产品代码；FCT-1500RR 是中国区域代码，不创建第二个 Decimo。"),
      addClaim(currentFamily, decimoScope.scopeKey, "phase449-decimo-family-position", "family_position", "官方家族页把 Decimo 定位为比全尺寸前代更细、更轻的按动钢笔；轻量不改变其独立型号身份。"),
      addClaim(decimoOfficial, decimoScope.scopeKey, "phase449-decimo-spec", "current_sku_spec", "FCT-15SR 约 12 mm、21 g、18K 尖、铝制涂装笔身和 CON-40；颜色、尖号和礼盒配件按 SKU 记录。"),
      addClaim(decimoReview, decimoScope.scopeKey, "phase449-decimo-handling", "handling_observation", "专业评测把 Decimo 视为同一尖／握位家族的细轻分支，并提示前端 clip 仍需试握；个人体验不替代官方尺寸。"),
      addClaim(caplessSupport, decimoScope.scopeKey, "phase449-decimo-care", "maintenance_boundary", "Decimo 仍使用精密 writing unit；不用时收尖、清水吸排、避免酒精和高温，不能因轻量就按普通圆珠笔维护。"),
    ],
    [currentFamily],
    [{ key: "phase449-decimo-depth", title: "Phase 449：Decimo FCT 代码、轻量与维护边界", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "补充 FCT-15SR／FCT-1500RR 的市场身份、21 g 参考与 writing unit 护理边界。", sourceKey: decimoOfficial.key }],
  ),
  refresh(
    lsBase,
    "phase449-pilot-capless-ls-depth-v1",
    lsScope,
    [
      addClaim(lsOfficial, lsScope.scopeKey, "phase449-ls-code", "current_sku_identity", "FCLS-35SR 是 Capless LS 的当前型号代码；LS 的尾部旋钮、knock & twist 回收和 41.3 g 参考不回填普通 Capless 或 Decimo。"),
      addClaim(lsPress, lsScope.scopeKey, "phase449-ls-mechanism", "mechanism_boundary", "Pilot 2019 发布资料将 Luxury & Silent 的按键出尖与尾部旋钮收尖分开说明；静音是机构目标，不承诺所有环境完全无声。"),
      addClaim(currentLsCare, lsScope.scopeKey, "phase449-ls-current", "current_sku_spec", "官方 LS 保修入口确认 FCLS-35SR 当前身份；finish、价格和区域供应仍按商品页面与盒卡核对。"),
      addClaim(con40, lsScope.scopeKey, "phase449-ls-filling", "filling_accessory", "LS 沿用 Pilot 墨囊／CON-40 语境；转换器容量和附带方式按市场包装确认，不由重量或静音机构推导。"),
      addClaim(caplessSupport, lsScope.scopeKey, "phase449-ls-care", "maintenance_boundary", "LS 不用时收回尖端、排空并清水吸排；不自行拆 head 或用尾部旋钮硬顶 shutter，异常摩擦应交由维修处理。"),
    ],
    [currentLsCare],
    [{ key: "phase449-ls-depth", title: "Phase 449：Capless LS 的 FCLS 代码与 knock & twist 机构", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "把 LS 的产品代码、静音回收、重量、CON-40 和护理条件与全尺寸／Decimo 分开。", sourceKey: lsPress.key }],
  ),
];

if (new Set(phase449PilotCaplessFamilyPacks.map((pack) => pack.entityId)).size !== 3) {
  throw new Error("Phase 449 Pilot Capless family must contain three unique models.");
}
