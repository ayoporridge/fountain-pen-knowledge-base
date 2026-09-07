import type { CuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE220_POLLOCK_BRAND_ID,
  phase220JohnHancockPacks,
} from "./phase220-john-hancock-cartridge-pen";
import {
  PHASE228_TRAMOL_BRAND_ID,
  phase228TramolVangoghPacks,
} from "./phase228-tramol-vangogh";
import {
  PHASE211_WAHL_BRAND_ID,
  phase211WahlPenPacks,
} from "./phase211-wahl-pen";
import {
  PHASE349_DAVID_OSCARSON_BRAND_ID,
  phase349DavidOscarsonWinterPacks,
} from "./phase349-david-oscarson-winter";
import {
  PHASE257_EBOYA_BRAND_ID,
  phase257EboyaHoujuPacks,
} from "./phase257-eboya-houju";

export const PHASE442_BRAND_IDS = {
  "pollock-pen-co": PHASE220_POLLOCK_BRAND_ID,
  tramol: PHASE228_TRAMOL_BRAND_ID,
  wahl: PHASE211_WAHL_BRAND_ID,
  "david-oscarson": PHASE349_DAVID_OSCARSON_BRAND_ID,
  eboya: PHASE257_EBOYA_BRAND_ID,
} as const;

function requireBrand(
  packs: readonly CuratedEntityPack[],
  entityId: string,
  label: string,
): CuratedEntityPack {
  const pack = packs.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "brand",
  );
  if (!pack) throw new Error(`Phase 442 ${label} brand pack is missing.`);
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

export const phase442BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    requireBrand(phase220JohnHancockPacks, PHASE220_POLLOCK_BRAND_ID, "Pollock Pen Co."),
    "phase442-pollock-brand-depth-refresh-v1",
    ".planning/content-research/pollock-pen-co-brand-phase442.md",
    "Pollock Pen Co.：John Hancock 铜管墨囊笔的制造者边界",
  ),
  refresh(
    requireBrand(phase228TramolVangoghPacks, PHASE228_TRAMOL_BRAND_ID, "Tramol"),
    "phase442-tramol-brand-depth-refresh-v1",
    ".planning/content-research/tramol-brand-phase442.md",
    "Tramol：艺术主题钢笔、墨水与销售组合边界",
  ),
  refresh(
    requireBrand(phase211WahlPenPacks, PHASE211_WAHL_BRAND_ID, "Wahl"),
    "phase442-wahl-brand-depth-refresh-v1",
    ".planning/content-research/wahl-brand-phase442.md",
    "Wahl：Boston、Tempoint 与 Wahl Pen 的谱系导航",
  ),
  refresh(
    requireBrand(
      phase349DavidOscarsonWinterPacks,
      PHASE349_DAVID_OSCARSON_BRAND_ID,
      "David Oscarson",
    ),
    "phase442-david-oscarson-brand-depth-refresh-v1",
    ".planning/content-research/david-oscarson-brand-phase442.md",
    "David Oscarson：限量珐琅书写工具的 collection 导航",
  ),
  refresh(
    requireBrand(phase257EboyaHoujuPacks, PHASE257_EBOYA_BRAND_ID, "Eboya"),
    "phase442-eboya-brand-depth-refresh-v1",
    ".planning/content-research/eboya-brand-phase619.md",
    "Eboya：Nikko Ebonite 的硬橡胶家族与尺寸路线",
  ),
];

if (
  phase442BrandDepthRefreshPacks.length !== 5 ||
  new Set(phase442BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5
) {
  throw new Error("Phase 442 brand refresh must contain five unique brands.");
}
