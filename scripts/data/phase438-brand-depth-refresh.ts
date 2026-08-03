import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase159HeroPacks } from "./phase159-hero-100-616-329";
import { phase223RiderSecurityPacks } from "./phase223-rider-security";
import { phase348MaioraImprontePacks } from "./phase348-maiora-impronte";
import { phase169EversharpRepresentativePacks } from "./phase169-eversharp-representatives";
import { phase329DiplomatCurrentPacks } from "./phase329-diplomat-current";

export const PHASE438_BRAND_IDS = {
  hero: "LIfzzmbCfFPt",
  "security-pen-corporation": "phase223-brand-security-pen",
  maiora: "phase348-maiora-brand",
  eversharp: "kFT81caNK3tP",
  diplomat: "4kID3Wqc15O6",
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
  if (!pack) throw new Error(`Phase 438 ${label} ${expectedType} pack is missing.`);
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

const hero = requirePack(phase159HeroPacks, PHASE438_BRAND_IDS.hero, "brand", "Hero");
const security = requirePack(
  phase223RiderSecurityPacks,
  PHASE438_BRAND_IDS["security-pen-corporation"],
  "brand",
  "Security Pen",
);
const maiora = requirePack(
  phase348MaioraImprontePacks,
  PHASE438_BRAND_IDS.maiora,
  "brand",
  "Maiora",
);
const eversharp = requirePack(
  phase169EversharpRepresentativePacks,
  PHASE438_BRAND_IDS.eversharp,
  "brand",
  "Eversharp",
);
const diplomat = requirePack(
  phase329DiplomatCurrentPacks,
  PHASE438_BRAND_IDS.diplomat,
  "brand",
  "Diplomat",
);

export const phase438BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    hero,
    "phase438-hero-brand-depth-refresh-v1",
    ".planning/content-research/hero-brand-phase438.md",
    "英雄 Hero：上海制笔历史、一体尖与型号导航",
  ),
  refresh(
    security,
    "phase438-security-brand-depth-refresh-v1",
    ".planning/content-research/security-pen-brand-phase438.md",
    "Security Pen：支票保护器、专利机构与公司阶段",
  ),
  refresh(
    maiora,
    "phase438-maiora-brand-depth-refresh-v1",
    ".planning/content-research/maiora-brand-phase438.md",
    "Maiora：意大利手工树脂与 Impronte 路线",
  ),
  refresh(
    eversharp,
    "phase438-eversharp-brand-depth-refresh-v1",
    ".planning/content-research/eversharp-brand-phase438.md",
    "Eversharp：Wahl、Parker 与历史型号导航",
  ),
  refresh(
    diplomat,
    "phase438-diplomat-brand-depth-refresh-v1",
    ".planning/content-research/diplomat-brand-phase438.md",
    "Diplomat：Aero、Excellence 与 Elox SKU 分流",
  ),
];

if (new Set(phase438BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 438 brand refresh must contain five unique brands.");
}
