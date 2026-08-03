import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase140AllPacks } from "./phase140-italian-representative-models-batch";
import { phase168MooreFingertipPacks } from "./phase168-moore-fingertip";
import { phase275EnssoPiumaPacks } from "./phase275-ensso-piuma";
import { phase276FprHimalayaV2Packs } from "./phase276-fpr-himalaya-v2";
import { phase351GioiaCapodimontePacks } from "./phase351-gioia-capodimonte";

export const PHASE431_BRAND_IDS = {
  "current-delta": "phase140-brand-current-delta",
  "fountain-pen-revolution": "phase276-brand-fpr",
  ensso: "phase275-brand-ensso",
  moore: "fvOdtqcgGCmx",
  gioia: "phase351-gioia-brand",
} as const;

function requireBrand(
  packs: readonly CuratedEntityPack[],
  entityId: string,
  label: string,
): CuratedEntityPack {
  const pack = packs.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "brand",
  );
  if (!pack) throw new Error(`Phase 431 ${label} brand pack is missing.`);
  return pack;
}

function requireModel(
  packs: readonly CuratedEntityPack[],
  entityId: string,
  label: string,
): CuratedEntityPack {
  const pack = packs.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 431 ${label} model pack is missing.`);
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

function addSources(
  base: CuratedEntityPack,
  extras: CuratedEntityPack[],
): CuratedEntityPack {
  const known = new Set(base.sources.map((source) => source.key));
  return {
    ...base,
    sources: [
      ...base.sources,
      ...extras.flatMap((pack) => pack.sources.filter((source) => !known.has(source.key))),
    ],
  };
}

const deltaPacks = phase140AllPacks;
const delta = addSources(
  requireBrand(deltaPacks, PHASE431_BRAND_IDS["current-delta"], "Delta"),
  [requireModel(deltaPacks, "phase140-current-delta-dolcevita-mid-size", "Dolcevita")],
);

const fprPacks = phase276FprHimalayaV2Packs;
const enssoPacks = phase275EnssoPiumaPacks;
const moorePacks = phase168MooreFingertipPacks;
const gioiaPacks = phase351GioiaCapodimontePacks;

// These brand packs already carry their model's independent source set;
// keeping the base list avoids duplicate references for shared image URLs.
const fpr = requireBrand(
  fprPacks,
  PHASE431_BRAND_IDS["fountain-pen-revolution"],
  "FPR",
);
const ensso = requireBrand(enssoPacks, PHASE431_BRAND_IDS.ensso, "Ensso");
const moore = requireBrand(moorePacks, PHASE431_BRAND_IDS.moore, "Moore");
const gioia = requireBrand(gioiaPacks, PHASE431_BRAND_IDS.gioia, "Gioia");

export const phase431BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    delta,
    "phase431-delta-brand-depth-refresh-v1",
    ".planning/content-research/delta-brand-phase431.md",
    "当代 Delta：Dolcevita Mid-Size 的 steel C/C 与 14K piston 分流",
  ),
  refresh(
    fpr,
    "phase431-fpr-brand-depth-refresh-v1",
    ".planning/content-research/fpr-brand-phase431.md",
    "Fountain Pen Revolution：Himalaya V2-GT 的 flex 尖配置边界",
  ),
  refresh(
    ensso,
    "phase431-ensso-brand-depth-refresh-v1",
    ".planning/content-research/ensso-brand-phase431.md",
    "Ensso：Piuma 的 CNC 金属极简路线与型号树",
  ),
  refresh(
    moore,
    "phase431-moore-brand-depth-refresh-v1",
    ".planning/content-research/moore-brand-phase431.md",
    "Moore：Non-Leakable 与 Finger tip 的历史结构分层",
  ),
  refresh(
    gioia,
    "phase431-gioia-brand-depth-refresh-v1",
    ".planning/content-research/gioia-brand-phase431.md",
    "Gioia Pen Italia：Capodimonte Kawari、工坊与 JoWo 尖供应关系",
  ),
];

if (new Set(phase431BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 431 brand refresh must contain five unique brands.");
}
