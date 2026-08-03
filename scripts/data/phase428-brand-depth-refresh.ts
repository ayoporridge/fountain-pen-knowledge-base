import type { CuratedEntityPack } from "../lib/curated-content-pack";
import {
  phase72DelikePacks,
  phase72DukePacks,
  phase72PenBbsPacks,
} from "./phase72-delike-duke-penbbs";
import { phase140AllPacks } from "./phase140-italian-representative-models-batch";

export const PHASE428_BRAND_IDS = {
  delike: "5AB8Cngbp1un",
  duke: "2Ay71LNqmFAb",
  penbbs: "fXMP6pCWfPjq",
  stipula: "phase140-brand-stipula",
  pineider: "phase140-brand-pineider",
} as const;

function requireBrand(
  packs: readonly CuratedEntityPack[],
  entityId: string,
  label: string,
): CuratedEntityPack {
  const pack = packs.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "brand",
  );
  if (!pack) throw new Error(`Phase 428 ${label} brand pack is missing.`);
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

function addSources(base: CuratedEntityPack, extras: CuratedEntityPack[]): CuratedEntityPack {
  const known = new Set(base.sources.map((source) => source.key));
  return {
    ...base,
    sources: [
      ...base.sources,
      ...extras.flatMap((pack) => pack.sources.filter((source) => !known.has(source.key))),
    ],
  };
}

const delikePacks = phase72DelikePacks();
const dukePacks = phase72DukePacks();
const penbbsPacks = phase72PenBbsPacks();
const delike = addSources(
  requireBrand(delikePacks, PHASE428_BRAND_IDS.delike, "Delike"),
  [delikePacks.find((pack) => pack.entityId === "_gbRalCJARx3")!],
);
const duke = addSources(
  requireBrand(dukePacks, PHASE428_BRAND_IDS.duke, "Duke"),
  [dukePacks.find((pack) => pack.entityId === "s72DUKE551")!],
);
const penbbs = addSources(
  requireBrand(penbbsPacks, PHASE428_BRAND_IDS.penbbs, "PenBBS"),
  [penbbsPacks.find((pack) => pack.entityId === "6MSiaAQkLWEz")!],
);
const stipula = addSources(
  requireBrand(phase140AllPacks, PHASE428_BRAND_IDS.stipula, "Stipula"),
  [phase140AllPacks.find((pack) => pack.entityId === "phase140-stipula-etruria-magnifica")!],
);
const pineider = addSources(
  requireBrand(phase140AllPacks, PHASE428_BRAND_IDS.pineider, "Pineider"),
  [phase140AllPacks.find((pack) => pack.entityId === "phase140-pineider-avatar-ur")!],
);

export const phase428BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    delike,
    "phase428-delike-brand-depth-refresh-v1",
    ".planning/content-research/delike-brand-phase428.md",
    "得力克 Delike：从 Element 进入口袋笔型号树",
  ),
  refresh(
    duke,
    "phase428-duke-brand-depth-refresh-v1",
    ".planning/content-research/duke-brand-phase428.md",
    "公爵 Duke：551 Confucius 是一个型号，不是全品牌规格",
  ),
  refresh(
    penbbs,
    "phase428-penbbs-brand-depth-refresh-v1",
    ".planning/content-research/penbbs-brand-phase428.md",
    "坛笔 PenBBS：用上墨结构读型号树",
  ),
  refresh(
    stipula,
    "phase428-stipula-brand-depth-refresh-v1",
    ".planning/content-research/stipula-brand-phase428.md",
    "Stipula：从 Etruria 的托斯卡纳意象进入当前产品线",
  ),
  refresh(
    pineider,
    "phase428-pineider-brand-depth-refresh-v1",
    ".planning/content-research/pineider-brand-phase428.md",
    "Pineider：1774 佛罗伦萨传统与 Avatar UR 的当前入口",
  ),
];

if (new Set(phase428BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 428 brand refresh must contain five unique brands.");
}
