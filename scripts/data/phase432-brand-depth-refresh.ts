import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase141AllPacks } from "./phase141-taiwan-twsbi-representative-batch";
import { phase216Dagong56Packs } from "./phase216-dagong-56";
import { phase225TangyueE5Packs } from "./phase225-tangyue-e5";
import { phase345KilkOrientPacks } from "./phase345-kilk-orient";

export const PHASE432_BRAND_IDS = {
  kilk: "phase345-kilk-brand",
  "fine-writing-international": "phase141-brand-fine-writing-international",
  ystudio: "phase141-brand-ystudio",
  dagong: "vwSTpWgNYlPe",
  tangyue: "FER68geLQkcJ",
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
  if (!pack) throw new Error(`Phase 432 ${label} ${expectedType} pack is missing.`);
  return pack;
}

function addSources(
  base: CuratedEntityPack,
  extras: CuratedEntityPack[],
): CuratedEntityPack {
  const known = new Set(base.sources.map((source) => source.key));
  return {
    ...base,
    sources: [
      ...base.sources,
      ...extras.flatMap((pack) => pack.sources.filter((source) => !known.has(source.key))),
    ],
  };
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

const kilkPacks = phase345KilkOrientPacks;
const kilk = addSources(
  requirePack(kilkPacks, PHASE432_BRAND_IDS.kilk, "brand", "Kilk"),
  [requirePack(kilkPacks, "phase345-kilk-orient", "pen", "Kilk Orient")],
);

const taiwanPacks = phase141AllPacks;
const fwi = addSources(
  requirePack(taiwanPacks, PHASE432_BRAND_IDS["fine-writing-international"], "brand", "FWI"),
  [requirePack(taiwanPacks, "phase141-fwi-fenestro", "pen", "Fenestro")],
);
const ystudio = addSources(
  requirePack(taiwanPacks, PHASE432_BRAND_IDS.ystudio, "brand", "YSTUDIO"),
  [requirePack(taiwanPacks, "phase141-ystudio-classic-revolve", "pen", "Classic Revolve")],
);

const dagongPacks = phase216Dagong56Packs;
const dagong = addSources(
  requirePack(dagongPacks, PHASE432_BRAND_IDS.dagong, "brand", "Dagong"),
  [requirePack(dagongPacks, "A8H1NwxfcPhT", "pen", "Dagong 56")],
);

const tangyuePacks = phase225TangyueE5Packs;
const tangyue = addSources(
  requirePack(tangyuePacks, PHASE432_BRAND_IDS.tangyue, "brand", "TangMoon"),
  [requirePack(tangyuePacks, "zaXu3bnh1ith", "pen", "TangMoon E5")],
);

export const phase432BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    kilk,
    "phase432-kilk-brand-depth-refresh-v1",
    ".planning/content-research/kilk-brand-phase432.md",
    "Kilk：伊斯坦布尔独立制笔路线与 Orient 型号导航",
  ),
  refresh(
    fwi,
    "phase432-fwi-brand-depth-refresh-v1",
    ".planning/content-research/fwi-brand-phase432.md",
    "Fine Writing International：Fenestro 可见墨窗与台湾独立品牌边界",
  ),
  refresh(
    ystudio,
    "phase432-ystudio-brand-depth-refresh-v1",
    ".planning/content-research/ystudio-brand-phase432.md",
    "YSTUDIO：黄铜、漆面与 Classic Revolve 型号导航",
  ),
  refresh(
    dagong,
    "phase432-dagong-brand-depth-refresh-v1",
    ".planning/content-research/dagong-brand-phase432.md",
    "大公 Dagong：武汉金笔厂历史线索与 56 型号鉴定入口",
  ),
  refresh(
    tangyue,
    "phase432-tangmoon-brand-depth-refresh-v1",
    ".planning/content-research/tangmoon-brand-phase432.md",
    "唐月 TangMoon：主题设计、磁吸路线与 E5 批次边界",
  ),
];

if (new Set(phase432BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 432 brand refresh must contain five unique brands.");
}
