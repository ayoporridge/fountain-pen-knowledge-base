import type { CuratedEntityPack } from "../lib/curated-content-pack";
import {
  PHASE337_AURORA_BRAND_ID,
  PHASE337_TARGET_ID,
  PHASE337_TARGET_SLUG,
  phase337AuroraIpsilonQuadraPacks,
} from "./phase337-aurora-ipsilon-quadra";
import {
  PHASE45_AION_ID,
  PHASE45_CP1_ID,
  PHASE45_LAMY_BRAND_ID,
  phase45LamyAionCp1Packs,
} from "./phase45-lamy-aion-cp1";
import {
  PHASE264_PINNACLE_ID,
  PHASE264_TACCIA_BRAND_ID,
  phase264TacciaPinnacleCovenantPacks,
} from "./phase264-taccia-pinnacle-covenant";

export const PHASE493_REWRITE_ROOT =
  ".planning/quick/260804-mes-rewrite-three-flagged-model-pages-with-r/research";

function findModel(
  packs: CuratedEntityPack[],
  entityId: string,
  expectedSlug: string,
): CuratedEntityPack {
  const pack = packs.find(
    (candidate) =>
      candidate.entityId === entityId &&
      candidate.expectedType === "pen" &&
      candidate.expectedSlug === expectedSlug,
  );
  if (!pack) {
    throw new Error(`Phase 493 source pack is missing: ${entityId}/${expectedSlug}`);
  }
  return pack;
}

function rewritePack(
  pack: CuratedEntityPack,
  input: { key: string; markdownFile: string; storyTitle: string },
): CuratedEntityPack {
  const rewritten = structuredClone(pack);
  rewritten.key = `phase493-${input.key}-v1`;
  rewritten.markdownFile = input.markdownFile;
  rewritten.storyTitle = input.storyTitle;
  return rewritten;
}

const aurora = rewritePack(
  findModel(
    phase337AuroraIpsilonQuadraPacks,
    PHASE337_TARGET_ID,
    PHASE337_TARGET_SLUG,
  ),
  {
    key: "aurora-ipsilon-quadra",
    markdownFile: `${PHASE493_REWRITE_ROOT}/aurora-ipsilon-quadra-v1.md`,
    storyTitle: "Aurora Ipsilon Quadra：925 银方格 guilloché 与 14K 尖",
  },
);

const aion = rewritePack(
  findModel(phase45LamyAionCp1Packs, PHASE45_AION_ID, "lamy-aion"),
  {
    key: "lamy-aion",
    markdownFile: `${PHASE493_REWRITE_ROOT}/lamy-aion-v1.md`,
    storyTitle: "LAMY aion：全铝圆柱笔与 Z53 钢尖",
  },
);
const lamyCp1Source = phase45LamyAionCp1Packs
  .find((pack) => pack.entityId === PHASE45_CP1_ID)
  ?.sources.find((source) => source.key === "phase45-lamy-cp1-row");
if (lamyCp1Source && !aion.sources.some((source) => source.key === lamyCp1Source.key)) {
  aion.sources.push(lamyCp1Source);
}

const pinnacle = rewritePack(
  findModel(
    phase264TacciaPinnacleCovenantPacks,
    PHASE264_PINNACLE_ID,
    "taccia-pinnacle",
  ),
  {
    key: "taccia-pinnacle",
    markdownFile: `${PHASE493_REWRITE_ROOT}/taccia-pinnacle-v1.md`,
    storyTitle: "TACCIA Pinnacle：阳极氧化铝的日用工业路线",
  },
);

export const phase493ReadFirstRewritePacks: CuratedEntityPack[] = [
  aurora,
  aion,
  pinnacle,
];

export const PHASE493_REWRITE_TARGETS = [
  {
    entityId: PHASE337_TARGET_ID,
    brandEntityId: PHASE337_AURORA_BRAND_ID,
    slug: PHASE337_TARGET_SLUG,
    pack: aurora,
  },
  {
    entityId: PHASE45_AION_ID,
    brandEntityId: PHASE45_LAMY_BRAND_ID,
    slug: "lamy-aion",
    pack: aion,
  },
  {
    entityId: PHASE264_PINNACLE_ID,
    brandEntityId: PHASE264_TACCIA_BRAND_ID,
    slug: "taccia-pinnacle",
    pack: pinnacle,
  },
] as const;
