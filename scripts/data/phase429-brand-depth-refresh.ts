import type { CuratedEntityPack } from "../lib/curated-content-pack";
import { phase141AllPacks } from "./phase141-taiwan-twsbi-representative-batch";
import { phase217Lily910Packs } from "./phase217-lily-910";
import { phase219Lanbitou3059Packs } from "./phase219-lanbitou-3059";
import { phase64DiplomatOnlinePacks } from "./phase64-diplomat-online";

export const PHASE429_BRAND_IDS = {
  lily: "iBdg7LUlPdde",
  iwi: "phase141-brand-iwi",
  laban: "phase141-brand-laban",
  "online-schreibgeraete": "vkvhr34TkrUy",
  lanbitou: "O8u4aqylQqJ7",
} as const;

function requireBrand(
  packs: readonly CuratedEntityPack[],
  entityId: string,
  label: string,
): CuratedEntityPack {
  const pack = packs.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "brand",
  );
  if (!pack) throw new Error(`Phase 429 ${label} brand pack is missing.`);
  return pack;
}

function requireModel(
  packs: readonly CuratedEntityPack[],
  entityId: string,
  label: string,
): CuratedEntityPack {
  const pack = packs.find(
    (candidate) => candidate.entityId === entityId && candidate.expectedType === "pen",
  );
  if (!pack) throw new Error(`Phase 429 ${label} model pack is missing.`);
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

const lilyPacks = phase217Lily910Packs;
const lanbitouPacks = phase219Lanbitou3059Packs;
const lily = addSources(
  requireBrand(lilyPacks, PHASE429_BRAND_IDS.lily, "Lily"),
  [requireModel(lilyPacks, "dinM62TunTr8", "Lily 910")],
);
const lanbitou = addSources(
  requireBrand(lanbitouPacks, PHASE429_BRAND_IDS.lanbitou, "Lanbitou"),
  [requireModel(lanbitouPacks, "v_9J04P6xdfo", "Lanbitou 3059")],
);

const iwi = addSources(
  requireBrand(phase141AllPacks, PHASE429_BRAND_IDS.iwi, "IWI"),
  [requireModel(phase141AllPacks, "phase141-iwi-laureate", "IWI Laureate")],
);
const laban = addSources(
  requireBrand(phase141AllPacks, PHASE429_BRAND_IDS.laban, "Laban"),
  [requireModel(phase141AllPacks, "phase141-laban-325", "Laban 325")],
);
const online = addSources(
  requireBrand(
    phase64DiplomatOnlinePacks,
    PHASE429_BRAND_IDS["online-schreibgeraete"],
    "ONLINE",
  ),
  [requireModel(phase64DiplomatOnlinePacks, "6nwjVw9OWbpw", "ONLINE Campus")],
);

export const phase429BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    lily,
    "phase429-lily-brand-depth-refresh-v1",
    ".planning/content-research/lily-brand-phase429.md",
    "铃兰 Lily：把 910 的无帽结构留在可核实边界内",
  ),
  refresh(
    iwi,
    "phase429-iwi-brand-depth-refresh-v1",
    ".planning/content-research/iwi-brand-phase429.md",
    "IWI：Laureate 的镀层、EF 尖与滚珠笔分层",
  ),
  refresh(
    laban,
    "phase429-laban-brand-depth-refresh-v1",
    ".planning/content-research/laban-brand-phase429.md",
    "Laban：用 325 的树脂、尖号和历史窗口读品牌页",
  ),
  refresh(
    online,
    "phase429-online-brand-depth-refresh-v1",
    ".planning/content-research/online-brand-phase429.md",
    "ONLINE Schreibgeräte：Campus 61100/3D 是 SKU 变体，不是品牌名",
  ),
  refresh(
    lanbitou,
    "phase429-lanbitou-brand-depth-refresh-v1",
    ".planning/content-research/lanbitou-brand-phase429.md",
    "烂笔头 Lanbitou：3059 透明活塞与样本品控边界",
  ),
];

if (new Set(phase429BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5) {
  throw new Error("Phase 429 brand refresh must contain five unique brands.");
}
