import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase279Opus88PremiumOperaPacks } from "./phase279-opus88-premium-opera";
import { phase55HeroPaidiPacks } from "./phase55-hero-paidi";
import { phase262TacciaPacks } from "./phase262-taccia";
import { phase229JinxingDoubleNibPacks } from "./phase229-jinxing-double-nib";
import { phase165EversharpChiltonPacks } from "./phase165-eversharp-chilton";

export const PHASE440_BRAND_IDS = {
  opus88: "I6tjleAZx9RU",
  "hero-paddy": "qpcW25Dw0fxW",
  taccia: "phase262-brand-taccia",
  jinxing: "u872EQEhnTzA",
  chilton: "6bBDoAc4ULKm",
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
  if (!pack) throw new Error(`Phase 440 ${label} ${expectedType} pack is missing.`);
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

const opus88 = requirePack(
  phase279Opus88PremiumOperaPacks,
  PHASE440_BRAND_IDS.opus88,
  "brand",
  "Opus 88",
);
const paidi = requirePack(
  phase55HeroPaidiPacks,
  PHASE440_BRAND_IDS["hero-paddy"],
  "brand",
  "Hero Paidi",
);
const taccia = requirePack(
  phase262TacciaPacks,
  PHASE440_BRAND_IDS.taccia,
  "brand",
  "TACCIA",
);
const jinxing = requirePack(
  phase229JinxingDoubleNibPacks,
  PHASE440_BRAND_IDS.jinxing,
  "brand",
  "JinXing",
);
const chilton = requirePack(
  phase165EversharpChiltonPacks,
  PHASE440_BRAND_IDS.chilton,
  "brand",
  "Chilton",
);

export const phase440BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    opus88,
    "phase440-opus88-brand-depth-refresh-v1",
    ".planning/content-research/opus88-brand-phase440.md",
    "Opus 88：台湾制造、日式滴入式与型号分流",
  ),
  refresh(
    paidi,
    "phase440-hero-paidi-brand-depth-refresh-v1",
    ".planning/content-research/hero-paidi-brand-phase440.md",
    "Paidi／Hero Paddy：一体尖品牌关系与 Century 导航",
  ),
  refresh(
    taccia,
    "phase440-taccia-brand-depth-refresh-v1",
    ".planning/content-research/taccia-brand-phase440.md",
    "TACCIA：透明树脂、定制尖与漆艺路线",
  ),
  refresh(
    jinxing,
    "phase440-jinxing-brand-depth-refresh-v1",
    ".planning/content-research/jinxing-brand-phase440.md",
    "金星 JinXing：上海、北京与双尖历史线索",
  ),
  refresh(
    chilton,
    "phase440-chilton-brand-depth-refresh-v1",
    ".planning/content-research/chilton-brand-phase440.md",
    "Chilton：气压上墨、Wing-flow 与历史型号导航",
  ),
];

if (new Set(phase440BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 440 brand refresh must contain five unique brands.");
}
