import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE336_TARGET_ID,
  phase336AuroraOttantottoMillerighePacks,
} from "./phase336-aurora-ottantotto-millerighe";
import {
  PHASE338_TARGET_ID,
  phase338AuroraIpsilonItaliaPacks,
} from "./phase338-aurora-ipsilon-italia";
import {
  PHASE85_ELMO_01_ID,
  phase85MontegrappaElmoPacks,
} from "./phase85-montegrappa-elmo";

export const PHASE452_MODEL_IDS = {
  millerighe: PHASE336_TARGET_ID,
  ipsilonItalia: PHASE338_TARGET_ID,
  elmo01: PHASE85_ELMO_01_ID,
} as const;

const montegrappaPacks = phase85MontegrappaElmoPacks();
const allBasePacks = [
  ...phase336AuroraOttantottoMillerighePacks,
  ...phase338AuroraIpsilonItaliaPacks,
  ...montegrappaPacks,
];

function modelFrom(entityId: string, label: string): CuratedEntityPack {
  const pack = allBasePacks.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 452 ${label} model pack is missing.`);
  return pack;
}

function source(key: string, label: string): CuratedSource {
  for (const pack of allBasePacks) {
    const found = pack.sources.find((candidate) => candidate.key === key);
    if (found) return found;
  }
  throw new Error(`Phase 452 ${label} source ${key} is missing.`);
}

function currentScope(slug: string): CuratedScope {
  const key = `phase452-${slug}-model-depth`;
  return {
    key,
    scopeKey: key,
    productionState: "current",
    editionScope: "Phase 452 Aurora/Montegrappa 型号深化；具体颜色、尖幅、填充、尺寸与库存按 SKU 和来源粒度记录。",
  };
}

function claim(
  sourceItem: { key: string; summary: string },
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
    sourceKey: sourceItem.key,
    locator: sourceItem.summary,
    evidence: [{ key: `${key}-evidence`, sourceKey: sourceItem.key, scopeKey, locator: sourceItem.summary }],
  };
}

function refresh(
  base: CuratedEntityPack,
  key: string,
  scope: CuratedScope,
  claims: CuratedEntityPack["claims"],
  timeline: NonNullable<CuratedEntityPack["timeline"]>,
  additionalSources: CuratedEntityPack["sources"] = [],
): CuratedEntityPack {
  return {
    ...base,
    key,
    sources: [...base.sources, ...additionalSources],
    scopes: [...base.scopes, scope],
    claims: [...base.claims, ...claims],
    timeline: [...(base.timeline ?? []), ...timeline],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const millerigheBase = modelFrom(PHASE452_MODEL_IDS.millerighe, "Aurora Ottantotto Millerighe");
const ipsilonBase = modelFrom(PHASE452_MODEL_IDS.ipsilonItalia, "Aurora Ipsilon Italia");
const elmoBase = modelFrom(PHASE452_MODEL_IDS.elmo01, "Montegrappa Elmo 01");

const millerigheProduct = source("phase336-aurora-millerighe-product", "Millerighe product");
const millerigheFamily = source("phase336-aurora-ottantotto-category", "Ottantotto family");
const millerigheCatalog = source("phase336-aurora-high-end-catalog", "Millerighe catalog");
const millerigheHistory = source("phase336-aurora-history", "Aurora history");
const millerigheChronology = source("phase336-fountainpen-it-aurora", "Aurora chronology");

const ipsilonProduct = source("phase338-aurora-italia-product", "Ipsilon Italia product");
const ipsilonFamily = source("phase338-aurora-ipsilon-category", "Ipsilon family");
const ipsilonCatalog = source("phase338-aurora-medium-catalog", "Ipsilon catalog");
const ipsilonHistory = source("phase338-aurora-ipsilon-history", "Ipsilon history");
const ipsilonRetailer = source("phase338-penchalet-ipsilon-italia", "Ipsilon retailer");

const elmoProduct = source("phase85-montegrappa-elmo-01-official", "Elmo 01 product");
const elmoCatalog = source("phase85-montegrappa-official-catalog", "Montegrappa catalog");
const elmoHistory = source("phase85-montegrappa-official-history", "Montegrappa history");
const elmoRetailer = source("phase85-montegrappa-elmo-01-penchalet", "Elmo 01 retailer");

const millerigheScope = currentScope("aurora-ottantotto-millerighe");
const ipsilonScope = currentScope("aurora-ipsilon-italia");
const elmoScope = currentScope("montegrappa-elmo-01");

export const phase452AuroraMontegrappaModelPacks: CuratedEntityPack[] = [
  refresh(
    millerigheBase,
    "phase452-aurora-ottantotto-millerighe-depth-v1",
    millerigheScope,
    [
      claim(millerigheProduct, millerigheScope.scopeKey, "phase452-millerighe-identity", "sku_identity", "Aurora Ottantotto Millerighe 的官方具体商品标识为 801；本页只承载黑色树脂、millerighe 纹饰、镀金帽的钢笔 SKU。"),
      claim(millerigheProduct, millerigheScope.scopeKey, "phase452-millerighe-filling", "filling_boundary", "801 商品页明确是活塞钢笔；不能把 Ottantotto Resina、转换器或历史 88 的上墨方式回填。"),
      claim(millerigheCatalog, millerigheScope.scopeKey, "phase452-millerighe-variants", "variant_boundary", "官方目录把 chrome cap、银帽、镀金帽、Resina 和不同编号组合分开；EF/F/M/B 是本商品的尖幅选项，不拆成新型号。"),
      claim(millerigheHistory, millerigheScope.scopeKey, "phase452-millerighe-history", "family_history_boundary", "1947 年 Nizzoli 设计的 88 是家族历史锚点，不证明当代 801 的首发年份、老材料或复刻身份。"),
      claim(millerigheChronology, millerigheScope.scopeKey, "phase452-millerighe-crosscheck", "source_granularity", "FountainPen.it 只用于 Aurora 88 家族年代交叉，不扩展 801 的尺寸、重量或活塞维修规格。"),
      claim(millerigheProduct, millerigheScope.scopeKey, "phase452-millerighe-selection", "selection_boundary", "购买 801 要核对产品编号、帽面纹饰、活塞旋钮和尖幅；约 €750 是意大利检索日价格快照，不是全球固定 MSRP。"),
    ],
    [{ key: "phase452-millerighe-depth", title: "Phase 452：Millerighe 801 的 SKU、活塞与 88 家族边界", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "将 801 的具体商品、镀金条纹版本、活塞维护和 1947 88 家族历史分开记录。", sourceKey: millerigheProduct.key }],
  ),
  refresh(
    ipsilonBase,
    "phase452-aurora-ipsilon-italia-depth-v1",
    ipsilonScope,
    [
      claim(ipsilonProduct, ipsilonScope.scopeKey, "phase452-ipsilon-identity", "sku_identity", "Aurora Ipsilon Italia 的官方产品标识为 B17-A；本页只承载蓝色树脂、三色漆环和镀铬饰件的钢笔入口。"),
      claim(ipsilonFamily, ipsilonScope.scopeKey, "phase452-ipsilon-sibling", "family_boundary", "Ipsilon Italia、Ipsilon Resin、Ipsilon Quadra 与 B17 其它颜色在官方分类中分开；圆珠和 roller 不继承钢笔的尖与供墨字段。"),
      claim(ipsilonProduct, ipsilonScope.scopeKey, "phase452-ipsilon-unknown", "unknown_field_boundary", "B17-A 商品摘要没有公开尖材、尖幅、尺寸和重量；不能把 Quadra 的 14K 尖或 Resin 的钢尖回填到 Italia。"),
      claim(ipsilonRetailer, ipsilonScope.scopeKey, "phase452-ipsilon-filling", "filling_boundary", "专业零售资料支持 Ipsilon Italia 的国际墨囊/转换器路线和随附附件语境；具体盒内配件仍按订单和市场核对。"),
      claim(ipsilonHistory, ipsilonScope.scopeKey, "phase452-ipsilon-theme", "edition_history_boundary", "统一主题和帽盖人名解释纪念设计，但官方没有给出 B17-A 首发年份、生产数量或每个人名独立版次。"),
      claim(ipsilonProduct, ipsilonScope.scopeKey, "phase452-ipsilon-selection", "selection_boundary", "购买 B17-A 应核对编号、帽盖人名、三色环和尖面；约 €185 与 Disponibile 是意大利页面检索日快照，不代表全球价格或库存。"),
    ],
    [{ key: "phase452-ipsilon-depth", title: "Phase 452：Ipsilon Italia B17-A 的编号、主题与未知字段", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "把 B17-A 的蓝色三色环商品身份、墨囊/转换器、纪念主题和未公开尖材/尺寸边界写清。", sourceKey: ipsilonProduct.key }],
  ),
  refresh(
    elmoBase,
    "phase452-montegrappa-elmo-01-depth-v1",
    elmoScope,
    [
      claim(elmoProduct, elmoScope.scopeKey, "phase452-elmo-identity", "model_identity", "Montegrappa Elmo 01 是当前 Vintage Class 的树脂钢尖 cartridge/converter 型号；官方商品页给出约 142 mm、14.8 mm、26.6 g 和 EF/F/M/B/ST1/ST5 选项。"),
      claim(elmoCatalog, elmoScope.scopeKey, "phase452-elmo-family", "family_boundary", "官方目录把 Elmo 01、Elmo 02 与 Elmo 02 Plus 分列；颜色和尖宽是 Elmo 01 的 variant，不是新基础型号。"),
      claim(elmoHistory, elmoScope.scopeKey, "phase452-elmo-history", "history_boundary", "Elmo 名称和 Bassano del Grappa 历史提供设计语境，但不把现代 Elmo 01 写成古董复刻或推断历史生产批次。"),
      claim(elmoRetailer, elmoScope.scopeKey, "phase452-elmo-care", "maintenance_boundary", "国际墨囊/转换器款换色用常温清水吸排；渗漏、螺纹阻力和持续断墨不靠针捅 feed 或强拧金属件解决。"),
      claim(elmoProduct, elmoScope.scopeKey, "phase452-elmo-nib", "nib_boundary", "EF/F/M/B/ST1/ST5 是当前商品的尖型选择；实际线条受尖端调校、纸张和墨水影响，不能把评测手感泛化为全家族承诺。"),
      claim(elmoProduct, elmoScope.scopeKey, "phase452-elmo-selection", "selection_boundary", "要 C/C 日用结构选 Elmo 01；要更粗笔身比较 Elmo 02；要活塞、37 g 或金尖/弹性尖转到 Elmo 02 Plus，三者不共享规格。"),
    ],
    [{ key: "phase452-elmo-depth", title: "Phase 452：Elmo 01 的 C/C 结构、规格和 Plus 排除边界", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "补足 Elmo 01 的当前 SKU 规格、C/C 维护、尖型选项与 Elmo 02/02 Plus 型号关系。", sourceKey: elmoProduct.key }],
    [elmoHistory],
  ),
];

if (new Set(phase452AuroraMontegrappaModelPacks.map((pack) => pack.entityId)).size !== 3) {
  throw new Error("Phase 452 Aurora/Montegrappa pack must contain three unique models.");
}
