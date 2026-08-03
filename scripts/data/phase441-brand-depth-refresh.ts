import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase100EsterbrookDollarPenPacks } from "./phase100-esterbrook-dollar-pen";
import { phase221CamelPacks } from "./phase221-camel-pen";
import { phase63JinhaoPacks } from "./phase63-jinhao-split";
import { phase210WeareverZenithPacks } from "./phase210-wearever-zenith";
import { phase96KacoMaster14kPacks } from "./phase96-kaco-master14k";

export const PHASE441_BRAND_IDS = {
  esterbrook: "b6DYMF38zz1B",
  "camel-pen-company": "phase221-brand-camel-pen-company",
  jinhao: "Yulxwu7PuQAU",
  wearever: "x0PbAr6vvwf9",
  kaco: "sBV7J5ZK4msi",
} as const;

function requirePack(
  packs: readonly CuratedEntityPack[],
  entityId: string,
  expectedType: CuratedEntityPack["expectedType"],
  label: string,
): CuratedEntityPack {
  const pack = packs.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === expectedType,
  );
  if (!pack) throw new Error(`Phase 441 ${label} ${expectedType} pack is missing.`);
  return pack;
}

function refresh(
  base: CuratedEntityPack,
  key: string,
  markdownFile: string,
  storyTitle: string,
): CuratedEntityPack {
  return {
    ...base,
    key,
    markdownFile,
    storyTitle,
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const esterbrook = requirePack(
  phase100EsterbrookDollarPenPacks(),
  PHASE441_BRAND_IDS.esterbrook,
  "brand",
  "Esterbrook",
);
const camel = requirePack(
  phase221CamelPacks,
  PHASE441_BRAND_IDS["camel-pen-company"],
  "brand",
  "Camel Pen Company",
);
const jinhaoBase = requirePack(
  phase63JinhaoPacks,
  PHASE441_BRAND_IDS.jinhao,
  "brand",
  "Jinhao",
);
const jinhao159 = requirePack(
  phase63JinhaoPacks,
  "s63JINHAO159",
  "pen",
  "Jinhao 159",
);
const jinhao159Archive = jinhao159.sources.find(
  (source) => source.key === "phase63-jinhao-159-archive",
);
if (!jinhao159Archive) throw new Error("Phase 441 Jinhao 159 archive source is missing.");
const jinhao: CuratedEntityPack = {
  ...jinhaoBase,
  sources: [...jinhaoBase.sources, jinhao159Archive],
};
const wearever = requirePack(
  phase210WeareverZenithPacks,
  PHASE441_BRAND_IDS.wearever,
  "brand",
  "Wearever",
);
const kaco = requirePack(
  phase96KacoMaster14kPacks,
  PHASE441_BRAND_IDS.kaco,
  "brand",
  "KACO",
);

export const phase441BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    esterbrook,
    "phase441-esterbrook-brand-depth-refresh-v1",
    ".planning/content-research/esterbrook-brand-phase441.md",
    "Esterbrook：Dollar Pen、J family 与当代型号导航",
  ),
  refresh(
    camel,
    "phase441-camel-brand-depth-refresh-v1",
    ".planning/content-research/camel-brand-phase441.md",
    "Camel Pen Company：干墨颗粒、button filler 与历史小厂",
  ),
  refresh(
    jinhao,
    "phase441-jinhao-brand-depth-refresh-v1",
    ".planning/content-research/jinhao-brand-phase441.md",
    "Jinhao 金豪：近名型号、跨境 SKU 与资料边界",
  ),
  refresh(
    wearever,
    "phase441-wearever-brand-depth-refresh-v1",
    ".planning/content-research/wearever-brand-phase441.md",
    "Wearever：注塑材料、Zenith 与大众钢笔史",
  ),
  refresh(
    kaco,
    "phase441-kaco-brand-depth-refresh-v1",
    ".planning/content-research/kaco-brand-phase441.md",
    "KACO：上海文采、Master 金尖与当前钢尖边界",
  ),
];

if (new Set(phase441BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 441 brand refresh must contain five unique brands.");
}
