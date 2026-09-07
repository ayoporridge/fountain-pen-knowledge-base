import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";
import { PHASE142_BRANDS, phase142Groups } from "./phase142-franklin-birmingham-batch";
import { phase58FaberCastellPacks, PHASE58_FABER_BRAND_ID } from "./phase58-faber-castell";
import { phase259KanwriteHeritagePacks, PHASE259_KANWRITE_BRAND_ID } from "./phase259-kanwrite-heritage";
import { phase144Packs, PHASE144_IDS } from "./phase144-otto-hutt-design04-design07-batch";

export const PHASE443_BRAND_IDS = {
  "birmingham-pen-company": PHASE142_BRANDS.birmingham,
  "franklin-christoph": PHASE142_BRANDS.franklinChristoph,
  kanwrite: PHASE259_KANWRITE_BRAND_ID,
  "faber-castell": PHASE58_FABER_BRAND_ID,
  "otto-hutt": PHASE144_IDS.brand,
} as const;

function brandFrom(packs: readonly CuratedEntityPack[], entityId: string, label: string): CuratedEntityPack {
  const pack = packs.find((candidate) => candidate.entityId === entityId && candidate.expectedType === "brand");
  if (!pack) throw new Error(`Phase 443 ${label} brand pack is missing.`);
  return pack;
}

function sourceFrom(packs: readonly CuratedEntityPack[], key: string, label: string): CuratedSource {
  for (const pack of packs) {
    const source = pack.sources.find((candidate) => candidate.key === key);
    if (source) return source;
  }
  throw new Error(`Phase 443 ${label} source ${key} is missing.`);
}

function addSourcedClaim(
  base: CuratedEntityPack,
  source: CuratedSource,
  key: string,
  predicate: string,
  objectText: string,
): CuratedEntityPack["claims"][number] {
  const scopeKey = base.scopes[0]?.scopeKey ?? `${base.expectedSlug}-brand-scope`;
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence: 0.96,
    sourceKey: source.key,
    locator: source.summary,
    evidence: [{
      key: `${key}-evidence`,
      sourceKey: source.key,
      scopeKey,
      locator: source.summary,
    }],
  };
}

function refresh(
  base: CuratedEntityPack,
  key: string,
  markdownFile: string,
  storyTitle: string,
  extraSources: CuratedSource[] = [],
  extraClaims: CuratedEntityPack["claims"] = [],
): CuratedEntityPack {
  const existingKeys = new Set(base.sources.map((source) => source.key));
  return {
    ...base,
    key,
    markdownFile,
    storyTitle,
    sources: [...base.sources, ...extraSources.filter((source) => !existingKeys.has(source.key))],
    claims: [...base.claims, ...extraClaims],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const birminghamBase = brandFrom(
  phase142Groups.map((group) => group.brand),
  PHASE443_BRAND_IDS["birmingham-pen-company"],
  "Birmingham Pen Company",
);
const franklinBase = brandFrom(
  phase142Groups.map((group) => group.brand),
  PHASE443_BRAND_IDS["franklin-christoph"],
  "Franklin-Christoph",
);
const kanwriteBase = brandFrom(phase259KanwriteHeritagePacks, PHASE443_BRAND_IDS.kanwrite, "Kanwrite");
const faberBase = brandFrom(phase58FaberCastellPacks, PHASE443_BRAND_IDS["faber-castell"], "Faber-Castell");
const ottoBase = brandFrom(phase144Packs, PHASE443_BRAND_IDS["otto-hutt"], "Otto Hutt");

const birminghamAlumina = sourceFrom(
  phase142Groups.flatMap((group) => [group.brand, ...group.pens]),
  "phase142-bpc-alumina",
  "Birmingham Pen Company",
);
const birminghamConverter = sourceFrom(
  phase142Groups.flatMap((group) => [group.brand, ...group.pens]),
  "phase142-bpc-converter",
  "Birmingham Pen Company",
);
const franklinModel20 = sourceFrom(
  phase142Groups.flatMap((group) => [group.brand, ...group.pens]),
  "phase142-fc-model20-official",
  "Franklin-Christoph",
);
const franklinNibs = sourceFrom(
  phase142Groups.flatMap((group) => [group.brand, ...group.pens]),
  "phase142-fc-nib-info",
  "Franklin-Christoph",
);

export const phase443BrandDepthRefreshPacks: CuratedEntityPack[] = [
  refresh(
    birminghamBase,
    "phase443-birmingham-brand-depth-refresh-v1",
    ".planning/content-research/birmingham-pen-company-brand-phase443.md",
    "Birmingham Pen Company：Pennsylvania 小批量墨水与钢笔导航",
    [birminghamAlumina, birminghamConverter],
    [
      addSourcedClaim(birminghamBase, birminghamAlumina, "phase443-birmingham-alumina-boundary", "model_navigation", "Alumina Model-C 的 CNC 铝合金、German #6、转换器和 eyedropper 警告只属于该材料与批次，不回填旧树脂 Model-C。"),
      addSourcedClaim(birminghamBase, birminghamConverter, "phase443-birmingham-converter", "filling_boundary", "Birmingham 的通用转换器是型号页的可逆供墨背景；具体笔身仍需按当前 SKU 核对兼容性。"),
    ],
  ),
  refresh(
    franklinBase,
    "phase443-franklin-christoph-brand-depth-refresh-v1",
    ".planning/content-research/franklin-christoph-brand-phase443.md",
    "Franklin-Christoph：美国小批量钢笔与可换尖型号导航",
    [franklinModel20, franklinNibs],
    [
      addSourcedClaim(franklinBase, franklinModel20, "phase443-franklin-model20-boundary", "model_navigation", "Model 20 Marietta 的滑盖、凹入式 #6 尖和三种供墨路线只用于该型号，不覆盖 pocket 20、Model 02 或 Model 31。"),
      addSourcedClaim(franklinBase, franklinNibs, "phase443-franklin-nib-modularity", "nib_maintenance", "官方笔尖页把 #5/#6 与可旋下 nib/feed/housing 作为尺寸相关的维护线索，不是任意型号的无条件互换承诺。"),
    ],
  ),
  refresh(
    kanwriteBase,
    "phase443-kanwrite-brand-depth-refresh-v1",
    ".planning/content-research/kanwrite-brand-phase619.md",
    "Kanwrite：Kanpur Writers、Heritage 与自有型号分线",
  ),
  refresh(
    faberBase,
    "phase443-faber-castell-brand-depth-refresh-v1",
    ".planning/content-research/faber-castell-brand-phase443.md",
    "Faber-Castell：普通 Fine Writing 与 Graf 高端线导航",
  ),
  refresh(
    ottoBase,
    "phase443-otto-hutt-brand-depth-refresh-v1",
    ".planning/content-research/otto-hutt-brand-phase443.md",
    "Otto Hutt：德国 design 编号、笔类与 finish 导航",
  ),
];

if (
  phase443BrandDepthRefreshPacks.length !== 5 ||
  new Set(phase443BrandDepthRefreshPacks.map((pack) => pack.entityId)).size !== 5
) {
  throw new Error("Phase 443 brand refresh must contain five unique brands.");
}
