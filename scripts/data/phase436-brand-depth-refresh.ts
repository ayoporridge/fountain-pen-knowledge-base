import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase186WingsungPacks } from "./phase186-wingsung-601";
import { phase347TibaldiBononiaPacks } from "./phase347-tibaldi-bononia";
import { phase97AdmokJ800Packs } from "./phase97-admok-j800";
import { phase260RangaGravitasPacks } from "./phase260-ranga-gravitas";
import { phase172CrossBaileyStratfordPacks } from "./phase172-cross-bailey-stratford";

export const PHASE436_BRAND_IDS = {
  wingsung: "5WJw8padPmKF",
  tibaldi: "phase347-tibaldi-brand",
  admok: "1gAp6eiclNnS",
  ranga: "phase260-brand-ranga",
  cross: "AcglIcVOba3Y",
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
  if (!pack) throw new Error(`Phase 436 ${label} ${expectedType} pack is missing.`);
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

const wingsung = requirePack(
  phase186WingsungPacks,
  PHASE436_BRAND_IDS.wingsung,
  "brand",
  "WingSung",
);
const tibaldi = requirePack(
  phase347TibaldiBononiaPacks,
  PHASE436_BRAND_IDS.tibaldi,
  "brand",
  "Tibaldi",
);
const admok = requirePack(
  phase97AdmokJ800Packs,
  PHASE436_BRAND_IDS.admok,
  "brand",
  "Admok",
);
const ranga = requirePack(
  phase260RangaGravitasPacks,
  PHASE436_BRAND_IDS.ranga,
  "brand",
  "Ranga",
);
const cross = requirePack(
  phase172CrossBaileyStratfordPacks,
  PHASE436_BRAND_IDS.cross,
  "brand",
  "Cross",
);

export const phase436BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    wingsung,
    "phase436-wingsung-brand-depth-refresh-v1",
    ".planning/content-research/wingsung-brand-phase436.md",
    "永生 WingSung：跨年代型号与品牌关系边界",
  ),
  refresh(
    tibaldi,
    "phase436-tibaldi-brand-depth-refresh-v1",
    ".planning/content-research/tibaldi-brand-phase436.md",
    "Tibaldi：佛罗伦萨历史、复兴与 Bononia 导航",
  ),
  refresh(
    admok,
    "phase436-admok-brand-depth-refresh-v1",
    ".planning/content-research/admok-brand-phase436.md",
    "Admok：J800 身份、改装与市场别名边界",
  ),
  refresh(
    ranga,
    "phase436-ranga-brand-depth-refresh-v1",
    ".planning/content-research/ranga-brand-phase436.md",
    "Ranga Pens：手工材料、订单与型号导航",
  ),
  refresh(
    cross,
    "phase436-cross-brand-depth-refresh-v1",
    ".planning/content-research/cross-brand-phase436.md",
    "高仕 Cross：品牌历史、系列与 SKU 分流",
  ),
];

if (new Set(phase436BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 436 brand refresh must contain five unique brands.");
}
