import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase22MontblancPacks } from "./phase22-montblanc";
import { phase24TwsbiPacks } from "./phase24-twsbi";
import { phase28Parker51Packs } from "./phase28-parker-51";
import { phase42LamyPlatinumPacks } from "./phase42-lamy-platinum";

export const PHASE426_BRAND_IDS = {
  lamy: "ySwGGq4bhvOA",
  platinum: "e51tJpejEkXY",
  twsbi: "YTHuH8c3R9zl",
  parker: "vhqNYqDChhiN",
  montblanc: "CJM8uLY0LmIX",
} as const;

function requireBrand(
  packs: readonly CuratedEntityPack[],
  entityId: string,
  label: string,
): CuratedEntityPack {
  const pack = packs.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "brand",
  );
  if (!pack) throw new Error(`Phase 426 ${label} brand pack is missing.`);
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

const lamy = requireBrand(
  phase42LamyPlatinumPacks,
  PHASE426_BRAND_IDS.lamy,
  "LAMY",
);
const platinum = requireBrand(
  phase42LamyPlatinumPacks,
  PHASE426_BRAND_IDS.platinum,
  "Platinum",
);
const twsbi = requireBrand(phase24TwsbiPacks, PHASE426_BRAND_IDS.twsbi, "TWSBI");
const parker = requireBrand(
  phase28Parker51Packs,
  PHASE426_BRAND_IDS.parker,
  "Parker",
);
const montblanc = requireBrand(
  phase22MontblancPacks,
  PHASE426_BRAND_IDS.montblanc,
  "Montblanc",
);

export const phase426BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    lamy,
    "phase426-lamy-brand-depth-refresh-v1",
    ".planning/content-research/lamy-brand-phase426.md",
    "凌美 LAMY：从海德堡制造到 2000、Safari 与工业设计路线",
  ),
  refresh(
    platinum,
    "phase426-platinum-brand-depth-refresh-v1",
    ".planning/content-research/platinum-brand-phase426.md",
    "白金 Platinum：1919、#3776 Century 与墨囊技术的系列地图",
  ),
  refresh(
    twsbi,
    "phase426-twsbi-brand-depth-refresh-v1",
    ".planning/content-research/twsbi-brand-phase426.md",
    "三文堂 TWSBI：透明笔身背后的活塞、真空与维护分界",
  ),
  refresh(
    parker,
    "phase426-parker-brand-depth-refresh-v1",
    ".planning/content-research/parker-brand-phase426.md",
    "派克 Parker：把专利、经典型号与现代目录放回各自年代",
  ),
  refresh(
    montblanc,
    "phase426-montblanc-brand-depth-refresh-v1",
    ".planning/content-research/montblanc-brand-phase426.md",
    "万宝龙 Montblanc：从 1906、Meisterstück 到汉堡书写工具体系",
  ),
];

if (new Set(phase426BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 426 brand refresh must contain five unique brands.");
}
