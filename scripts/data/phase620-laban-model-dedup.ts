import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { PHASE141_IDS, phase141AllPacks } from "./phase141-taiwan-twsbi-representative-batch";

const base = phase141AllPacks.find(
  (pack) => pack.entityId === PHASE141_IDS.laban325 && pack.expectedType === "pen",
);

if (!base) {
  throw new Error("Phase 620 Laban 325 base pack is missing.");
}

export const PHASE620_LABAN_325_ID = PHASE141_IDS.laban325;
export const PHASE620_LABAN_325_SLUG = "laban-325";

export const phase620LabanModelDedupPacks: CuratedEntityPack[] = [
  {
    ...base,
    key: "phase620-laban-325-model-dedup-v1",
    markdownFile: ".planning/content-research/laban-325-phase141.md",
    publicationIntent: "publish",
    publicationBlockers: [],
  },
];

if (
  phase620LabanModelDedupPacks.length !== 1 ||
  phase620LabanModelDedupPacks[0]?.entityId !== PHASE620_LABAN_325_ID ||
  phase620LabanModelDedupPacks[0]?.expectedSlug !== PHASE620_LABAN_325_SLUG
) {
  throw new Error("Phase 620 must contain exactly the canonical Laban 325 pen pack.");
}
