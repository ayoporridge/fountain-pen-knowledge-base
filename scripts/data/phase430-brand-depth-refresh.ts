import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase140AllPacks } from "./phase140-italian-representative-models-batch";
import { phase218Paili002Packs } from "./phase218-paili-002";
import { phase274LotusStudentPacks } from "./phase274-lotus-student";
import {
  PHASE307_GVFC_BRAND_ID,
  phase307GvfcIntuitionBrandSplitPacks,
} from "./phase307-gvfc-intuition-brand-split";

export const PHASE430_BRAND_IDS = {
  paili: "xGmfK8jpUCnX",
  "santini-italia": "phase140-brand-santini-italia",
  "current-omas": "phase140-brand-current-omas",
  "lotus-pens": "phase274-brand-lotus-pens",
  "graf-von-faber-castell": PHASE307_GVFC_BRAND_ID,
} as const;

function requireBrand(
  packs: readonly CuratedEntityPack[],
  entityId: string,
  label: string,
): CuratedEntityPack {
  const pack = packs.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "brand",
  );
  if (!pack) throw new Error(`Phase 430 ${label} brand pack is missing.`);
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
  if (!pack) throw new Error(`Phase 430 ${label} model pack is missing.`);
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

const pailiPacks = phase218Paili002Packs;
const lotusPacks = phase274LotusStudentPacks;
const gvfcPacks = phase307GvfcIntuitionBrandSplitPacks;

const paili = addSources(
  requireBrand(pailiPacks, PHASE430_BRAND_IDS.paili, "Paili"),
  [requireModel(pailiPacks, "ZmHH94j5tJQo", "Paili 002")],
);
const santini = addSources(
  requireBrand(phase140AllPacks, PHASE430_BRAND_IDS["santini-italia"], "Santini"),
  [requireModel(phase140AllPacks, "phase140-santini-libra-intenso", "Santini Libra")],
);
const omas = addSources(
  requireBrand(phase140AllPacks, PHASE430_BRAND_IDS["current-omas"], "OMAS"),
  [requireModel(phase140AllPacks, "phase140-current-omas-ogiva", "current OMAS Ogiva")],
);
// The brand and Student packs intentionally share one site-original SVG URL;
// keep the existing brand source to avoid two reference rows for one source item.
const lotus = requireBrand(
  lotusPacks,
  PHASE430_BRAND_IDS["lotus-pens"],
  "Lotus Pens",
);
const graf = addSources(
  requireBrand(
    gvfcPacks,
    PHASE430_BRAND_IDS["graf-von-faber-castell"],
    "Graf von Faber-Castell",
  ),
  [
    requireModel(
      gvfcPacks,
      "phase307-graf-von-faber-castell-intuition",
      "GvFC Intuition",
    ),
  ],
);

export const phase430BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    paili,
    "phase430-paili-brand-depth-refresh-v1",
    ".planning/content-research/paili-brand-phase430.md",
    "派利 Paili：把 002 的透明示范笔与 013／3013 真空路线分开",
  ),
  refresh(
    santini,
    "phase430-santini-brand-depth-refresh-v1",
    ".planning/content-research/santini-brand-phase619.md",
    "Santini Italia：Libra Intenso 的 in-house 尖与 ebonite 边界",
  ),
  refresh(
    omas,
    "phase430-omas-brand-depth-refresh-v1",
    ".planning/content-research/omas-brand-phase619.md",
    "当代 OMAS：复兴后 Ogiva 的商品身份与历史断点",
  ),
  refresh(
    lotus,
    "phase430-lotus-brand-depth-refresh-v1",
    ".planning/content-research/lotus-pens-brand-phase430.md",
    "Lotus Pens：印度手工车制路线与 Student 22383 的入口",
  ),
  refresh(
    graf,
    "phase430-graf-von-faber-castell-brand-depth-refresh-v1",
    ".planning/content-research/graf-von-faber-castell-brand-phase430.md",
    "Graf von Faber-Castell：Classic、Intuition 与普通线的独立导航",
  ),
];

if (new Set(phase430BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 430 brand refresh must contain five unique brands.");
}
