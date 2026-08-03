import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase26PilotPacks } from "./phase26-pilot";
import { phase27PelikanPacks } from "./phase27-pelikan";
import { phase29SailorPacks } from "./phase29-sailor";
import { phase83WatermanCurrentPacks } from "./phase83-waterman-current";
import { PHASE83_ALLURE_FALLBACK_ID } from "./phase83-waterman-current";
import { phase107WancherBrandPack } from "./phase107-wancher-dream-pen-true-ebonite-matte-black";

export const PHASE425_BRAND_IDS = {
  pilot: "Zt-PbXkE7UHM",
  pelikan: "VXUULuCOLOB1",
  sailor: "ce2dcqixqSCx",
  waterman: "zkAu9PePDdqJ",
  wancher: "eOfD77nOeENN",
} as const;

function requireBrand(
  packs: readonly CuratedEntityPack[],
  entityId: string,
  label: string,
): CuratedEntityPack {
  const pack = packs.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "brand",
  );
  if (!pack) throw new Error(`Phase 425 ${label} brand pack is missing.`);
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

const pilot = requireBrand(phase26PilotPacks, PHASE425_BRAND_IDS.pilot, "Pilot");
const pelikan = requireBrand(phase27PelikanPacks, PHASE425_BRAND_IDS.pelikan, "Pelikan");
const sailor = requireBrand(phase29SailorPacks, PHASE425_BRAND_IDS.sailor, "Sailor");
const waterman = requireBrand(
  phase83WatermanCurrentPacks(PHASE83_ALLURE_FALLBACK_ID),
  PHASE425_BRAND_IDS.waterman,
  "Waterman",
);

export const phase425BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    pilot,
    "phase425-pilot-brand-depth-refresh-v1",
    ".planning/content-research/pilot-brand-phase425.md",
    "百乐 Pilot：从公司史、CUSTOM、Capless 到日用与袖珍钢笔",
  ),
  refresh(
    pelikan,
    "phase425-pelikan-brand-depth-refresh-v1",
    ".planning/content-research/pelikan-brand-phase425.md",
    "Pelikan：从颜料墨水工厂到 Souverän 活塞谱系",
  ),
  refresh(
    sailor,
    "phase425-sailor-brand-depth-refresh-v1",
    ".planning/content-research/sailor-brand-phase425.md",
    "写乐 Sailor：从 1911 到 Profit、Professional Gear 与现行金尖目录",
  ),
  refresh(
    waterman,
    "phase425-waterman-brand-depth-refresh-v1",
    ".planning/content-research/waterman-brand-phase425.md",
    "威迪文 Waterman：从四个当前钢笔系列开始认",
  ),
  refresh(
    phase107WancherBrandPack,
    "phase425-wancher-brand-depth-refresh-v1",
    ".planning/content-research/wancher-brand-phase425.md",
    "Wancher：先看材料与工艺如何组成产品，再看具体型号",
  ),
];

if (new Set(phase425BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 425 brand refresh must contain five unique brands.");
}
