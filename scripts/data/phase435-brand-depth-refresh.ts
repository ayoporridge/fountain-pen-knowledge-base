import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase288CaranDacheEcridorPacks } from "./phase288-caran-dache-ecridor";
import { phase268OnotoMagnaPacks } from "./phase268-onoto-magna";
import { phase201SchneiderBk402Packs } from "./phase201-schneider-bk402";
import { phase238SkbRs501iPacks } from "./phase238-skb-rs501i";
import { phase260RangaGravitasPacks } from "./phase260-ranga-gravitas";

export const PHASE435_BRAND_IDS = {
  "caran-dache": "phase139-brand-caran-dache",
  onoto: "phase268-brand-onoto",
  schneider: "4RLQzNpb6WbN",
  skb: "z6qsxNL0PAj8",
  gravitas: "phase260-brand-gravitas",
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
  if (!pack) throw new Error(`Phase 435 ${label} ${expectedType} pack is missing.`);
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

// Reuse the existing brand-level source registries. Model-level sources are not
// merged into the brand rows, which keeps shared editorial assets replay-safe.
const caran = requirePack(
  phase288CaranDacheEcridorPacks,
  PHASE435_BRAND_IDS["caran-dache"],
  "brand",
  "Caran d’Ache",
);
const onoto = requirePack(
  phase268OnotoMagnaPacks,
  PHASE435_BRAND_IDS.onoto,
  "brand",
  "Onoto",
);
const schneider = requirePack(
  phase201SchneiderBk402Packs,
  PHASE435_BRAND_IDS.schneider,
  "brand",
  "Schneider",
);
const skb = requirePack(
  phase238SkbRs501iPacks,
  PHASE435_BRAND_IDS.skb,
  "brand",
  "SKB",
);
const gravitas = requirePack(
  phase260RangaGravitasPacks,
  PHASE435_BRAND_IDS.gravitas,
  "brand",
  "Gravitas",
);

export const phase435BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    caran,
    "phase435-caran-dache-brand-depth-refresh-v1",
    ".planning/content-research/caran-dache-brand-phase435.md",
    "Caran d’Ache：日内瓦制造、Ecridor 与 Léman 路线",
  ),
  refresh(
    onoto,
    "phase435-onoto-brand-depth-refresh-v1",
    ".planning/content-research/onoto-brand-phase435.md",
    "Onoto：Magna、Heritage 与 plunger-filler 历史边界",
  ),
  refresh(
    schneider,
    "phase435-schneider-brand-depth-refresh-v1",
    ".planning/content-research/schneider-brand-phase435.md",
    "Schneider：Schramberg 制造语境与 Ray／BK402 导航",
  ),
  refresh(
    skb,
    "phase435-skb-brand-depth-refresh-v1",
    ".planning/content-research/skb-brand-phase435.md",
    "SKB 文明钢笔：RS-301N、ES-520 与 RS-501i 型号边界",
  ),
  refresh(
    gravitas,
    "phase435-gravitas-brand-depth-refresh-v1",
    ".planning/content-research/gravitas-brand-phase435.md",
    "Gravitas Pens：Ultemate Vac、Vac 2.0 与机制优先导航",
  ),
];

if (new Set(phase435BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 435 brand refresh must contain five unique brands.");
}
