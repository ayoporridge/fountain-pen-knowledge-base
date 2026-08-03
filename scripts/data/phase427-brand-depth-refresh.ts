import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase48WatermanAuroraPacks } from "./phase48-waterman-aurora";
import { phase49ViscontiHomoSapiensPacks } from "./phase49-visconti-homo-sapiens";
import { phase59BenuNahvalurPacks } from "./phase59-benu-nahvalur";
import { phase87MontegrappaExtra1930Packs } from "./phase87-montegrappa-extra-1930";
import { phase99ConklinHistoricPacks } from "./phase99-conklin-historic";

export const PHASE427_BRAND_IDS = {
  aurora: "CJXe8UpnkHLJ",
  visconti: "5BZDt2fQusMf",
  montegrappa: "phase85-brand-montegrappa",
  conklin: "9UPHCybD7qAX",
  benu: "s59BENU",
} as const;

function requireBrand(
  packs: readonly CuratedEntityPack[],
  entityId: string,
  label: string,
): CuratedEntityPack {
  const pack = packs.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "brand",
  );
  if (!pack) throw new Error(`Phase 427 ${label} brand pack is missing.`);
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

const aurora = requireBrand(
  phase48WatermanAuroraPacks,
  PHASE427_BRAND_IDS.aurora,
  "Aurora",
);
const visconti = requireBrand(
  phase49ViscontiHomoSapiensPacks,
  PHASE427_BRAND_IDS.visconti,
  "Visconti",
);
const montegrappa = requireBrand(
  phase87MontegrappaExtra1930Packs(),
  PHASE427_BRAND_IDS.montegrappa,
  "Montegrappa",
);
const conklin = requireBrand(
  phase99ConklinHistoricPacks,
  PHASE427_BRAND_IDS.conklin,
  "Conklin",
);
const benu = requireBrand(
  phase59BenuNahvalurPacks,
  PHASE427_BRAND_IDS.benu,
  "BENU",
);

export const phase427BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    aurora,
    "phase427-aurora-brand-depth-refresh-v1",
    ".planning/content-research/aurora-brand-phase427.md",
    "奥罗拉 Aurora：从 1919、Aurora 88 到 Optima 与 Ipsilon 的路线图",
  ),
  refresh(
    visconti,
    "phase427-visconti-brand-depth-refresh-v1",
    ".planning/content-research/visconti-brand-phase427.md",
    "维斯康蒂 Visconti：把材料、上墨机构与系列身份分开阅读",
  ),
  refresh(
    montegrappa,
    "phase427-montegrappa-brand-depth-refresh-v1",
    ".planning/content-research/montegrappa-brand-phase427.md",
    "Montegrappa：从 Bassano del Grappa 到 Elmo、Extra 1930 的型号树",
  ),
  refresh(
    conklin,
    "phase427-conklin-brand-depth-refresh-v1",
    ".planning/content-research/conklin-brand-phase427.md",
    "Conklin：Toledo、Chicago 与现代复兴必须分开的历史品牌",
  ),
  refresh(
    benu,
    "phase427-benu-brand-depth-refresh-v1",
    ".planning/content-research/benu-brand-phase427.md",
    "BENU：亚美尼亚树脂、Briolette、Talisman 与颜色版本的边界",
  ),
];

if (new Set(phase427BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 427 brand refresh must contain five unique brands.");
}
