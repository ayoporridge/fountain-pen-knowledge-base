import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase261MagnaCartaPacks } from "./phase261-magna-carta";
import { phase269YardOLedViceroyGrandPacks } from "./phase269-yard-o-led-viceroy-grand";
import { phase272MabieToddSwanPacks } from "./phase272-mabie-todd-swan";
import { phase289MonteverdeInvinciaPacks } from "./phase289-monteverde-invincia";
import { phase57Opus88LeonardoPacks, PHASE57_LEONARDO_FURORE_ID } from "./phase57-opus88-leonardo";

export const PHASE433_BRAND_IDS = {
  "mabie-todd": "phase272-brand-mabie-todd",
  "magna-carta": "phase261-brand-magna-carta",
  leonardo: "g5r4udSOYhI5",
  monteverde: "2OpQMjam65SM",
  "yard-o-led": "phase269-brand-yard-o-led",
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
  if (!pack) throw new Error(`Phase 433 ${label} ${expectedType} pack is missing.`);
  return pack;
}

function addSources(base: CuratedEntityPack, extras: CuratedEntityPack[]): CuratedEntityPack {
  const known = new Set(base.sources.map((source) => source.key));
  return {
    ...base,
    sources: [
      ...base.sources,
      ...extras.flatMap((pack) => pack.sources.filter((source) => !known.has(source.key))),
    ],
  };
}

function refresh(base: CuratedEntityPack, key: string, markdownFile: string, storyTitle: string): CuratedEntityPack {
  return {
    ...base,
    key,
    markdownFile,
    storyTitle,
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const mabiePacks = phase272MabieToddSwanPacks;
// Brand and model diagrams intentionally share one local SVG/source item;
// keep the brand's existing independent registry set to avoid duplicate references.
const mabie = requirePack(mabiePacks, PHASE433_BRAND_IDS["mabie-todd"], "brand", "Mabie Todd");

const magnaPacks = phase261MagnaCartaPacks;
const magna = addSources(
  requirePack(magnaPacks, PHASE433_BRAND_IDS["magna-carta"], "brand", "Magna Carta"),
  [requirePack(magnaPacks, "phase261-magna-carta-mag-600", "pen", "Mag 600")],
);

const leonardoPacks = phase57Opus88LeonardoPacks;
const leonardo = addSources(
  requirePack(leonardoPacks, PHASE433_BRAND_IDS.leonardo, "brand", "Leonardo"),
  [requirePack(leonardoPacks, PHASE57_LEONARDO_FURORE_ID, "pen", "Furore")],
);

const monteverdePacks = phase289MonteverdeInvinciaPacks;
const monteverde = addSources(
  requirePack(monteverdePacks, PHASE433_BRAND_IDS.monteverde, "brand", "Monteverde"),
  [requirePack(monteverdePacks, "phase289-entity-monteverde-invincia", "pen", "Invincia")],
);

const yardPacks = phase269YardOLedViceroyGrandPacks;
const yard = addSources(
  requirePack(yardPacks, PHASE433_BRAND_IDS["yard-o-led"], "brand", "YARD-O-LED"),
  [requirePack(yardPacks, "phase269-yard-o-led-viceroy-grand", "pen", "Viceroy Grand")],
);

export const phase433BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    mabie,
    "phase433-mabie-todd-brand-depth-refresh-v1",
    ".planning/content-research/mabie-todd-brand-phase433.md",
    "Mabie Todd & Co.：跨大西洋企业史与 Swan 型号家族导航",
  ),
  refresh(
    magna,
    "phase433-magna-carta-brand-depth-refresh-v1",
    ".planning/content-research/magna-carta-brand-phase433.md",
    "Magna Carta：Mag 600 弹性尖与多型号树脂路线",
  ),
  refresh(
    leonardo,
    "phase433-leonardo-brand-depth-refresh-v1",
    ".planning/content-research/leonardo-brand-phase433.md",
    "Leonardo Officina Italiana：现代意大利家族制笔与系列边界",
  ),
  refresh(
    monteverde,
    "phase433-monteverde-brand-depth-refresh-v1",
    ".planning/content-research/monteverde-brand-phase433.md",
    "Monteverde USA：Ritma 与 Invincia 两条钢笔路线",
  ),
  refresh(
    yard,
    "phase433-yard-o-led-brand-depth-refresh-v1",
    ".planning/content-research/yard-o-led-brand-phase433.md",
    "YARD-O-LED：Birmingham 银器工艺与英国书写工具导航",
  ),
];

if (new Set(phase433BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 433 brand refresh must contain five unique brands.");
}
