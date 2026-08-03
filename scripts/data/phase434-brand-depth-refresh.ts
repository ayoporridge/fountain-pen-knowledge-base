import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase88AsvineVacuumPacks } from "./phase88-asvine-vacuum";
import { phase226MgAfpu9902Packs } from "./phase226-mg-afpu9902";
import { phase254StDupontPacks } from "./phase254-st-dupont-line-d-eternity";
import { phase227DouwanLiuguangPacks } from "./phase227-douwan-liuguang";
import { phase354ScriboPiumaPacks } from "./phase354-scribo-piuma";

export const PHASE434_BRAND_IDS = {
  asvine: "phase66-brand-4021dffad5ea8c4af6d7692b",
  mg: "70VSUqdIrGVc",
  "st-dupont": "phase254-brand-st-dupont",
  douwan: "CwfFGW5zsocf",
  scribo: "phase140-brand-scribo",
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
  if (!pack) throw new Error(`Phase 434 ${label} ${expectedType} pack is missing.`);
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

// Each brand already has an independent source registry with at least three groups.
// Do not merge model-level sources here: several brand/model packs intentionally share
// one editorial SVG and would create duplicate entity-reference rows on replay.
const asvine = requirePack(
  phase88AsvineVacuumPacks(PHASE434_BRAND_IDS.asvine),
  PHASE434_BRAND_IDS.asvine,
  "brand",
  "Asvine",
);
const mg = requirePack(
  phase226MgAfpu9902Packs,
  PHASE434_BRAND_IDS.mg,
  "brand",
  "M&G",
);
const stDupont = requirePack(
  phase254StDupontPacks,
  PHASE434_BRAND_IDS["st-dupont"],
  "brand",
  "S.T. Dupont",
);
const douwan = requirePack(
  phase227DouwanLiuguangPacks,
  PHASE434_BRAND_IDS.douwan,
  "brand",
  "DareWorks",
);
const scribo = requirePack(
  phase354ScriboPiumaPacks,
  PHASE434_BRAND_IDS.scribo,
  "brand",
  "SCRIBO",
);

export const phase434BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    asvine,
    "phase434-asvine-brand-depth-refresh-v1",
    ".planning/content-research/asvine-brand-phase434.md",
    "Asvine：P36、V126 与 V200 的供墨结构导航",
  ),
  refresh(
    mg,
    "phase434-mg-brand-depth-refresh-v1",
    ".planning/content-research/mg-brand-phase434.md",
    "晨光 M&G：按动钢笔与可换墨囊产品线边界",
  ),
  refresh(
    stDupont,
    "phase434-st-dupont-brand-depth-refresh-v1",
    ".planning/content-research/st-dupont-brand-phase434.md",
    "S.T. Dupont：Line D Eternity 与法国书写工艺谱系",
  ),
  refresh(
    douwan,
    "phase434-douwan-brand-depth-refresh-v1",
    ".planning/content-research/douwan-brand-phase434.md",
    "逗万 DareWorks：创意笔、流光系列与 SKU 边界",
  ),
  refresh(
    scribo,
    "phase434-scribo-brand-depth-refresh-v1",
    ".planning/content-research/scribo-brand-phase434.md",
    "SCRIBO：FEEL、Piuma 与 Bologna 当代制笔路线",
  ),
];

if (new Set(phase434BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 434 brand refresh must contain five unique brands.");
}
