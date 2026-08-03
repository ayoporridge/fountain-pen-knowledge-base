import type { CuratedEntityPack, CuratedScope, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE57_LEONARDO_FURORE_ID,
  PHASE57_LEONARDO_MOMENTO_ID,
  PHASE57_OPUS_DEMO_ID,
  PHASE57_OPUS_KOLORO_ID,
  phase57Opus88LeonardoPacks,
} from "./phase57-opus88-leonardo";

export const PHASE448_MODEL_IDS = {
  opusDemo: PHASE57_OPUS_DEMO_ID,
  opusKoloro: PHASE57_OPUS_KOLORO_ID,
  leonardoFurore: PHASE57_LEONARDO_FURORE_ID,
  leonardoMomento: PHASE57_LEONARDO_MOMENTO_ID,
} as const;

const RETRIEVED = "2026-08-03";

function modelFrom(entityId: string, label: string): CuratedEntityPack {
  const pack = phase57Opus88LeonardoPacks.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 448 ${label} model pack is missing.`);
  return pack;
}

function sourceFrom(key: string, label: string): CuratedSource {
  for (const pack of phase57Opus88LeonardoPacks) {
    const source = pack.sources.find((candidate) => candidate.key === key);
    if (source) return source;
  }
  throw new Error(`Phase 448 ${label} source ${key} is missing.`);
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
  const key = `phase448-${slug}-current-model`;
  return {
    key,
    scopeKey: key,
    productionState: "current",
    editionScope: "Phase 448 型号页深化；当前 SKU、市场颜色、尖号、尺寸和库存不回填为全系列统一事实。",
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

const opusDemoBase = modelFrom(PHASE448_MODEL_IDS.opusDemo, "Opus 88 Demonstrator");
const opusKoloroBase = modelFrom(PHASE448_MODEL_IDS.opusKoloro, "Opus 88 Koloro");
const leonardoFuroreBase = modelFrom(PHASE448_MODEL_IDS.leonardoFurore, "Leonardo Furore");
const leonardoMomentoBase = modelFrom(PHASE448_MODEL_IDS.leonardoMomento, "Leonardo Momento Magico");

const opusGuide = sourceFrom("phase57-opus-quickstart", "Opus 88");
const opusDemoRetail = sourceFrom("phase57-opus-demo-goldspot", "Opus 88 Demo");
const opusDemoReview = sourceFrom("phase57-opus-demo-fpn", "Opus 88 Demo");
const opusKoloroRetail = sourceFrom("phase57-opus-koloro-stilo", "Opus 88 Koloro");
const opusKoloroReview = sourceFrom("phase57-opus-koloro-gentleman", "Opus 88 Koloro");
const leonardoFuroreCollection = sourceFrom("phase57-leonardo-furore-collection", "Leonardo Furore");
const leonardoFuroreSku = sourceFrom("phase57-leonardo-furore-aquapetra", "Leonardo Furore");
const leonardoFuroreReview = sourceFrom("phase57-leonardo-furore-glenn", "Leonardo Furore");
const leonardoMomentoCollection = sourceFrom("phase57-leonardo-momento-magico-collection", "Leonardo Momento Magico");
const leonardoMomentoSku = sourceFrom("phase57-leonardo-momento-magico-matte", "Leonardo Momento Magico");
const leonardoMomentoReview = sourceFrom("phase57-leonardo-momento-csn", "Leonardo Momento Magico");

const opusCurrentCatalog = officialSource({
  key: "phase448-opus-current-compatibility",
  title: "Opus 88 current model and nib compatibility listing",
  url: "https://endlesspens.com/collections/opus-88",
  registryKey: "opus88-current-retailer-phase448",
  registryName: "EndlessPens",
  summary: "当前目录把 Demonstrator 与 Koloro 分在 Jowo #6／Model 12 和 Jowo #5／Model 10 两条兼容路线；目录证据只用于型号与尖号边界，不替代官方规格。",
});
const leonardoCurrentSku = officialSource({
  key: "phase448-leonardo-momento-current",
  title: "Leonardo official Momento Magico Foglia",
  url: "https://leonardopen.com/products/momento-magico-foglia",
  registryKey: "leonardo-official-momento-phase448",
  registryName: "Leonardo Officina Italiana",
  summary: "官方当前 Momento Magico Foglia 页面重申工坊自制约 1.5 ml 活塞和约 23.8 g 空笔；特别树脂和颜色不覆盖普通 Matte Black。",
});

const opusDemoScope = currentScope("opus-demo");
const opusKoloroScope = currentScope("opus-koloro");
const leonardoFuroreScope = currentScope("leonardo-furore");
const leonardoMomentoScope = currentScope("leonardo-momento-magico");

export const phase448Opus88LeonardoModelPacks: CuratedEntityPack[] = [
  refresh(
    opusDemoBase,
    "phase448-opus-demo-depth-v1",
    opusDemoScope,
    [
      addClaim(opusGuide, opusDemoScope.scopeKey, "phase448-opus-demo-valve-boundary", "fill_system_boundary", "Demonstrator 是 Japanese-style eyedropper；尾部旋钮只控制墨仓到 feed 的通路，不是 piston filler 或墨囊转换器。"),
      addClaim(opusDemoRetail, opusDemoScope.scopeKey, "phase448-opus-demo-reference-measurement", "variant_measurement", "彩色 Demo 零售样本约 143 mm、23 g、3.5 ml；旧款实测可见约 147 mm、27 g，按版本和测量条件并列保存。"),
      addClaim(opusCurrentCatalog, opusDemoScope.scopeKey, "phase448-opus-demo-nib-boundary", "nib_compatibility", "当前兼容目录把 Demonstrator 归入 Jowo #6／Model 12 路线；不能把 Koloro 的 #5／Model 10 尖单元直接回填。"),
      addClaim(opusDemoReview, opusDemoScope.scopeKey, "phase448-opus-demo-carry-care", "maintenance_boundary", "携带前关紧尾阀，长途或气压变化明显时清空墨仓；阀门关闭不等于 feed 已完全排空，重新书写需先缓慢恢复供墨。"),
    ],
    [opusCurrentCatalog],
    [{ key: "phase448-opus-demo-depth", title: "Phase 448：Demo／Koloro 型号边界与阀门使用说明", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "将大型 Demonstrator 的 #6／#12、透明版本测量区间和止墨阀使用顺序与 Koloro 分开。", sourceKey: opusGuide.key }],
  ),
  refresh(
    opusKoloroBase,
    "phase448-opus-koloro-depth-v1",
    opusKoloroScope,
    [
      addClaim(opusKoloroRetail, opusKoloroScope.scopeKey, "phase448-opus-koloro-reference-measurement", "variant_measurement", "Koloro Black 零售样本约 142 mm、20 g、14 mm 直径；部分示范配色的容量约 4 ml，均按 SKU 保留。"),
      addClaim(opusCurrentCatalog, opusKoloroScope.scopeKey, "phase448-opus-koloro-nib-boundary", "nib_compatibility", "当前兼容目录把 Koloro 归入 Jowo #5／Model 10 路线；旧标题中的 Kolora 是 alias，不是新的第三型号。"),
      addClaim(opusKoloroReview, opusKoloroScope.scopeKey, "phase448-opus-koloro-valve-operation", "fill_system_boundary", "Koloro 的尾阀在携带时切断供墨，写作时应缓慢打开；它仍是滴管式结构，不应按普通活塞笔的补墨动作处理。"),
      addClaim(opusGuide, opusKoloroScope.scopeKey, "phase448-opus-koloro-care", "maintenance_boundary", "换色时清水冲洗笔身、阀杆、feed 与 O-ring，完全干燥后再装回；硅脂只按护理说明薄涂，不能掩盖错牙或磨损。"),
    ],
    [opusCurrentCatalog],
    [{ key: "phase448-opus-koloro-depth", title: "Phase 448：Koloro #5／#10 与旧别名边界", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "将 Koloro 的尺寸、尾阀和尖号路线与大型 Demonstrator 分离，并明确 Kolora 仅是旧拼写。", sourceKey: opusKoloroRetail.key }],
  ),
  refresh(
    leonardoFuroreBase,
    "phase448-leonardo-furore-depth-v1",
    leonardoFuroreScope,
    [
      addClaim(leonardoFuroreCollection, leonardoFuroreScope.scopeKey, "phase448-leonardo-furore-2018-boundary", "series_history", "官方 Furore collection 将系列推出节点放在 2018 年；这一时间点不等于每种树脂颜色或尖型的首发年份。"),
      addClaim(leonardoFuroreSku, leonardoFuroreScope.scopeKey, "phase448-leonardo-furore-aquapetra-spec", "current_sku_spec", "Aquapetra steel 当前商品页约 146 mm 闭合、131 mm 笔杆、27 g、15.5 mm 帽径、10.6 mm 握位，并配金属外壳 converter。"),
      addClaim(leonardoFuroreReview, leonardoFuroreScope.scopeKey, "phase448-leonardo-furore-measurement-range", "variant_measurement", "早期专业评测约 145 mm、25 g，并记录 steel／14K 与 converter 选择；测量差异按样本保留，不覆盖 Grande。"),
      addClaim(leonardoFuroreCollection, leonardoFuroreScope.scopeKey, "phase448-leonardo-furore-grande-boundary", "sibling_boundary", "Furore Grande 的活塞、1.5 ml 和更大轮廓不回填标准 Furore；出现墨窗或活塞尾钮时应回到 sibling 身份核对。"),
    ],
    [],
    [{ key: "phase448-leonardo-furore-depth", title: "Phase 448：Furore 标准 converter 路线深化", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "把 2018 系列节点、Aquapetra 当前 SKU、早期测量区间和 Furore Grande 分界放在同一型号页。", sourceKey: leonardoFuroreCollection.key }],
  ),
  refresh(
    leonardoMomentoBase,
    "phase448-leonardo-momento-magico-depth-v1",
    leonardoMomentoScope,
    [
      addClaim(leonardoMomentoCollection, leonardoMomentoScope.scopeKey, "phase448-leonardo-momento-piston-boundary", "fill_system_boundary", "Momento Magico 使用 Leonardo 工坊自制约 1.5 ml 活塞；它与 Furore 的 converter、Momento Zero 的 converter 路线分开。"),
      addClaim(leonardoMomentoSku, leonardoMomentoScope.scopeKey, "phase448-leonardo-momento-matte-spec", "current_sku_spec", "Matte Black 当前 SKU 约 145 mm 闭合、132 mm 笔杆、23.8 g、10 mm 墨窗，并附专用拆卸工具说明。"),
      addClaim(leonardoCurrentSku, leonardoMomentoScope.scopeKey, "phase448-leonardo-momento-foglia-current", "current_variant_boundary", "官方 Foglia 页面重申约 1.5 ml 活塞和空笔重量参考；特别树脂、颜色和装饰不覆盖普通 Matte Black。"),
      addClaim(leonardoMomentoReview, leonardoMomentoScope.scopeKey, "phase448-leonardo-momento-feed-boundary", "nib_feed_boundary", "钢尖 ABS feed 与 14K gold black ebonite feed 按配置分立；专业特别版资料只能绑定到明确 SKU，不泛化为全系列写感。"),
    ],
    [leonardoCurrentSku],
    [{ key: "phase448-leonardo-momento-depth", title: "Phase 448：Momento Magico 活塞、墨窗与特别版边界", eventType: "design_milestone", startDate: "2026-08-03", circa: false, description: "补充当前 Matte Black 与 Foglia 资料，区分工坊活塞、墨窗、feed 和特别树脂版本。", sourceKey: leonardoCurrentSku.key }],
  ),
];

if (new Set(phase448Opus88LeonardoModelPacks.map((pack) => pack.entityId)).size !== 4) {
  throw new Error("Phase 448 model depth must contain four unique canonical models.");
}
