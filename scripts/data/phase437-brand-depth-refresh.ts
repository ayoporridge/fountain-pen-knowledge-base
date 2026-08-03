import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase350BexleyOriginalPacks } from "./phase350-bexley-original";
import { phase214NoodlersNibCreaperPacks } from "./phase214-noodlers-nib-creaper";
import { phase224SnowhitePacks } from "./phase224-snowhite-fp20";
import { phase145Packs } from "./phase145-waldmann-tuscany-batch";
import { phase212DunnPenPacks } from "./phase212-dunn-pen";

export const PHASE437_BRAND_IDS = {
  bexley: "phase350-bexley-brand",
  noodlers: "9gaEROr1PX3t",
  snowhite: "dd8FyxqCoIUb",
  waldmann: "phase145-waldmann-brand",
  dunn: "pwbUeoKAp7xI",
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
  if (!pack) throw new Error(`Phase 437 ${label} ${expectedType} pack is missing.`);
  return pack;
}

function refresh(
  base: CuratedEntityPack,
  key: string,
  markdownFile: string,
  storyTitle: string,
  extraSources: CuratedEntityPack["sources"] = [],
): CuratedEntityPack {
  return {
    ...base,
    key,
    markdownFile,
    storyTitle,
    sources: [...base.sources, ...extraSources],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const bexley = requirePack(
  phase350BexleyOriginalPacks,
  PHASE437_BRAND_IDS.bexley,
  "brand",
  "Bexley",
);
const noodlers = requirePack(
  phase214NoodlersNibCreaperPacks,
  PHASE437_BRAND_IDS.noodlers,
  "brand",
  "Noodler’s",
);
const snowhite = requirePack(
  phase224SnowhitePacks,
  PHASE437_BRAND_IDS.snowhite,
  "brand",
  "Snowhite",
);
const snowhiteModel = requirePack(
  phase224SnowhitePacks,
  "ex6eI7i__J5s",
  "pen",
  "Snowhite FP20",
);
const snowhiteSkuSource = snowhiteModel.sources.find((source) =>
  source.url.includes("shopee"),
);
if (!snowhiteSkuSource) {
  throw new Error("Phase 437 Snowhite FP20 SKU source is missing.");
}
const waldmann = requirePack(
  phase145Packs,
  PHASE437_BRAND_IDS.waldmann,
  "brand",
  "Waldmann",
);
const dunn = requirePack(
  phase212DunnPenPacks,
  PHASE437_BRAND_IDS.dunn,
  "brand",
  "Dunn",
);

export const phase437BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    bexley,
    "phase437-bexley-brand-depth-refresh-v1",
    ".planning/content-research/bexley-brand-phase437.md",
    "Bexley：美国钢笔复兴、Original 与历史型号导航",
  ),
  refresh(
    noodlers,
    "phase437-noodlers-brand-depth-refresh-v1",
    ".planning/content-research/noodlers-brand-phase437.md",
    "Noodler’s：墨水品牌、可调校钢笔与产品线边界",
  ),
  refresh(
    snowhite,
    "phase437-snowhite-brand-depth-refresh-v1",
    ".planning/content-research/snowhite-brand-phase437.md",
    "白雪 Snowhite：FP20 直液式入口与大众文具边界",
    [snowhiteSkuSource],
  ),
  refresh(
    waldmann,
    "phase437-waldmann-brand-depth-refresh-v1",
    ".planning/content-research/waldmann-brand-phase437.md",
    "Waldmann：Pforzheim 银制传统与 Tuscany 导航",
  ),
  refresh(
    dunn,
    "phase437-dunn-brand-depth-refresh-v1",
    ".planning/content-research/dunn-brand-phase437.md",
    "Dunn：红色泵杆、专利机构与短暂美国品牌史",
  ),
];

if (new Set(phase437BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 437 brand refresh must contain five unique brands.");
}
