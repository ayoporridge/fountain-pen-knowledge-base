import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase352DanitrioDenshoPacks } from "./phase352-danitrio-densho";
import { phase223RiderSecurityPacks } from "./phase223-rider-security";
import { phase171WaspRepresentativePacks } from "./phase171-wasp-representatives";
import { phase267EdisonCollierPacks } from "./phase267-edison-collier";
import { phase167NamikiPacks } from "./phase167-namiki";

export const PHASE439_BRAND_IDS = {
  danitrio: "phase352-danitrio-brand",
  "j-g-rider-fountain-pen-company": "phase223-brand-jg-rider",
  wasp: "97fwqRaz02kE",
  "edison-pen-co": "phase267-brand-edison",
  namiki: "lMGfoMjegnv8",
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
  if (!pack) throw new Error(`Phase 439 ${label} ${expectedType} pack is missing.`);
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

const danitrio = requirePack(
  phase352DanitrioDenshoPacks,
  PHASE439_BRAND_IDS.danitrio,
  "brand",
  "Danitrio",
);
const rider = requirePack(
  phase223RiderSecurityPacks,
  PHASE439_BRAND_IDS["j-g-rider-fountain-pen-company"],
  "brand",
  "J. G. Rider",
);
const wasp = requirePack(
  phase171WaspRepresentativePacks,
  PHASE439_BRAND_IDS.wasp,
  "brand",
  "WASP",
);
const edison = requirePack(
  phase267EdisonCollierPacks,
  PHASE439_BRAND_IDS["edison-pen-co"],
  "brand",
  "Edison",
);
const namiki = requirePack(
  phase167NamikiPacks,
  PHASE439_BRAND_IDS.namiki,
  "brand",
  "Namiki",
);

export const phase439BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    danitrio,
    "phase439-danitrio-brand-depth-refresh-v1",
    ".planning/content-research/danitrio-brand-phase439.md",
    "Danitrio：日本手工漆艺、Maki-e 与型号导航",
  ),
  refresh(
    rider,
    "phase439-rider-brand-depth-refresh-v1",
    ".planning/content-research/rider-brand-phase439.md",
    "J. G. Rider：方形键槽笔舌与早期美国公司边界",
  ),
  refresh(
    wasp,
    "phase439-wasp-brand-depth-refresh-v1",
    ".planning/content-research/wasp-brand-phase439.md",
    "WASP：Chicago 品牌史、Addipoint 与 Clipper 分流",
  ),
  refresh(
    edison,
    "phase439-edison-brand-depth-refresh-v1",
    ".planning/content-research/edison-brand-phase439.md",
    "Edison Pen Co：美国独立车削、树脂与型号路线",
  ),
  refresh(
    namiki,
    "phase439-namiki-brand-depth-refresh-v1",
    ".planning/content-research/namiki-brand-phase439.md",
    "Namiki：Pilot 漆艺品牌、Urushi 与系列导航",
  ),
];

if (new Set(phase439BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 439 brand refresh must contain five unique brands.");
}
