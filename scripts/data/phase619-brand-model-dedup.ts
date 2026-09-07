import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { PHASE430_BRAND_IDS, phase430BrandDepthRefreshPacks } from "./phase430-brand-depth-refresh";
import { PHASE431_BRAND_IDS, phase431BrandDepthRefreshPacks } from "./phase431-brand-depth-refresh";
import { PHASE442_BRAND_IDS, phase442BrandDepthRefreshPacks } from "./phase442-brand-depth-refresh";
import { PHASE443_BRAND_IDS, phase443BrandDepthRefreshPacks } from "./phase443-brand-depth-refresh";
import { PHASE383_HONGDIAN_BRAND_ID, phase383HongdianN23Packs } from "./phase383-hongdian-n23";

export const PHASE619_BRAND_IDS = {
  "current-omas": PHASE430_BRAND_IDS["current-omas"],
  "current-delta": PHASE431_BRAND_IDS["current-delta"],
  "santini-italia": PHASE430_BRAND_IDS["santini-italia"],
  hongdian: PHASE383_HONGDIAN_BRAND_ID,
  kanwrite: PHASE443_BRAND_IDS.kanwrite,
  eboya: PHASE442_BRAND_IDS.eboya,
} as const;

function brand(
  packs: readonly CuratedEntityPack[],
  entityId: string,
  label: string,
): CuratedEntityPack {
  const pack = packs.find((candidate) => candidate.entityId === entityId && candidate.expectedType === "brand");
  if (!pack) throw new Error(`Phase 619 ${label} brand pack is missing.`);
  return pack;
}

export const phase619BrandModelDedupPacks: CuratedEntityPack[] = [
  brand(phase430BrandDepthRefreshPacks, PHASE619_BRAND_IDS["current-omas"], "current OMAS"),
  brand(phase431BrandDepthRefreshPacks, PHASE619_BRAND_IDS["current-delta"], "current Delta"),
  brand(phase430BrandDepthRefreshPacks, PHASE619_BRAND_IDS["santini-italia"], "Santini Italia"),
  brand(phase383HongdianN23Packs, PHASE619_BRAND_IDS.hongdian, "HongDian"),
  brand(phase443BrandDepthRefreshPacks, PHASE619_BRAND_IDS.kanwrite, "Kanwrite"),
  brand(phase442BrandDepthRefreshPacks, PHASE619_BRAND_IDS.eboya, "Eboya"),
];

if (
  phase619BrandModelDedupPacks.length !== 6 ||
  new Set(phase619BrandModelDedupPacks.map((pack) => pack.entityId)).size !== 6 ||
  phase619BrandModelDedupPacks.some((pack) => pack.expectedType !== "brand")
) {
  throw new Error("Phase 619 must contain six unique brand packs.");
}
