import type { CuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE36_PARKER_50_ID,
  phase36ParkerPacks,
} from "./phase36-parker-25-t1-50-falcon-100";

const parkerBrand = phase36ParkerPacks.find((pack) => pack.expectedType === "brand");
const parker50 = phase36ParkerPacks.find((pack) => pack.entityId === PHASE36_PARKER_50_ID);

if (!parkerBrand || !parker50) {
  throw new Error("Phase 622 Parker source pack is missing.");
}

/**
 * Keep the brand pack in the set because the shared curated apply preflight
 * requires an explicit maker context. Only the Parker 50 pack gets a new
 * source marker; its markdown body is the repaired copy.
 */
export const phase622Parker50Packs: CuratedEntityPack[] = [
  structuredClone(parkerBrand),
  { ...structuredClone(parker50), key: "phase622-parker-50-falcon-dedup-v1" },
];
