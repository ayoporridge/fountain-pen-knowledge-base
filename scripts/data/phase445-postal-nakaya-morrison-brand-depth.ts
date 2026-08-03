import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE222_POSTAL_BRAND_ID,
  phase222PostalPacks,
} from "./phase222-postal-reservoir-pen";
import {
  PHASE189_MORRISON_BRAND_ID,
  phase189MorrisonPatriotPacks,
} from "./phase189-morrison-patriot";
import {
  PHASE65_NAKAYA_ID,
  phase65NakayaPacks,
} from "./phase65-nakaya-raw";

export const PHASE445_BRAND_IDS = {
  "postal-pen-company": PHASE222_POSTAL_BRAND_ID,
  nakaya: PHASE65_NAKAYA_ID,
  morrison: PHASE189_MORRISON_BRAND_ID,
} as const;

function brandFrom(packs: readonly CuratedEntityPack[], entityId: string, label: string): CuratedEntityPack {
  const pack = packs.find((candidate) => candidate.entityId === entityId && candidate.expectedType === "brand");
  if (!pack) throw new Error(`Phase 445 ${label} brand pack is missing.`);
  return pack;
}

function sourceFrom(packs: readonly CuratedEntityPack[], key: string, label: string): CuratedSource {
  for (const pack of packs) {
    const source = pack.sources.find((candidate) => candidate.key === key);
    if (source) return source;
  }
  throw new Error(`Phase 445 ${label} source ${key} is missing.`);
}

function addClaim(
  base: CuratedEntityPack,
  source: CuratedSource,
  key: string,
  predicate: string,
  objectText: string,
  confidence = 0.96,
): CuratedEntityPack["claims"][number] {
  const scopeKey = base.scopes[0]?.key ?? `${base.expectedSlug}-brand-scope`;
  return {
    key,
    predicate,
    objectText,
    factClass: "core",
    confidence,
    sourceKey: source.key,
    locator: source.summary,
    evidence: [{ key: `${key}-evidence`, sourceKey: source.key, scopeKey, locator: source.summary }],
  };
}

function refresh(
  base: CuratedEntityPack,
  key: string,
  markdownFile: string,
  storyTitle: string,
  extraClaims: CuratedEntityPack["claims"],
): CuratedEntityPack {
  return {
    ...base,
    key,
    markdownFile,
    storyTitle,
    claims: [...base.claims, ...extraClaims],
    publicationIntent: "publish",
    publicationBlockers: [],
  };
}

const postalBase = brandFrom(phase222PostalPacks, PHASE445_BRAND_IDS["postal-pen-company"], "Postal Pen Company");
const nakayaBase = brandFrom(phase65NakayaPacks, PHASE445_BRAND_IDS.nakaya, "Nakaya");
const morrisonBase = brandFrom(phase189MorrisonPatriotPacks, PHASE445_BRAND_IDS.morrison, "Morrison");

const postalPenhero = sourceFrom(phase222PostalPacks, "phase222-postal-penhero", "Postal Pen Company");
const postalAuction = sourceFrom(phase222PostalPacks, "phase222-postal-auction", "Postal Pen Company");
const nakayaOfficial = sourceFrom(phase65NakayaPacks, "phase65-nakaya-brand", "Nakaya");
const nakayaSize = sourceFrom(phase65NakayaPacks, "phase65-nakaya-size", "Nakaya");
const morrisonMuseum = sourceFrom(phase189MorrisonPatriotPacks, "phase189-morrison-museum", "Morrison");
const morrisonPatriot = sourceFrom(phase189MorrisonPatriotPacks, "phase189-morrison-patriot-munson", "Morrison");

export const phase445BrandDepthPacks: CuratedEntityPack[] = [
  refresh(
    postalBase,
    "phase445-postal-brand-depth-v1",
    ".planning/content-research/postal-pen-company-brand-phase445.md",
    "Postal Pen Company：邮购、透明储墨与修复边界",
    [
      addClaim(postalBase, postalPenhero, "phase445-postal-navigation-layers", "brand_navigation", "Postal 品牌页把公司、邮购路线、Postal Reservoir 型号和单支修复样本分开；透明 barrel、breather tube 与 bulb filler 只在型号和样本范围内使用。"),
      addClaim(postalBase, postalAuction, "phase445-postal-sager-boundary", "identity_boundary", "OneBid 同场的 Sager Pen 是另一件拍品，不能因为邮购或透明笔身语境相邻就与 Postal Pen Company 建立制造者关系。"),
    ],
  ),
  refresh(
    nakayaBase,
    "phase445-nakaya-brand-depth-v1",
    ".planning/content-research/nakaya-brand-phase445.md",
    "Nakaya：笔形、长度、漆面与订单不是同一层",
    [
      addClaim(nakayaBase, nakayaOfficial, "phase445-nakaya-order-layer", "order_boundary", "Nakaya 的笔尖、调校、供墨、价格、制作期和运输需按具体产品号与订单确认；品牌页不把某一支样本配置升级为统一出厂规格。"),
      addClaim(nakayaBase, nakayaSize, "phase445-nakaya-shape-length-layer", "model_navigation", "Cigar／Writer 是笔形，Piccolo／Portable／Long 是长度路线，Kuro-tamenuri／Housoge 是漆面或装饰；不同层级不能互相替代。"),
    ],
  ),
  refresh(
    morrisonBase,
    "phase445-morrison-brand-depth-v1",
    ".planning/content-research/morrison-brand-phase445.md",
    "Morrison：纽约早期、子品牌与战时 Patriot 的分层导航",
    [
      addClaim(morrisonBase, morrisonMuseum, "phase445-morrison-period-layer", "history_boundary", "约 1920 年博物馆藏品只证明战前硬橡胶与金饰实物语境，不能把其材料、供应商或上墨系统回填到 1940 年代 Patriot。"),
      addClaim(morrisonBase, morrisonPatriot, "phase445-morrison-patriot-layer", "model_navigation", "Patriot 的军种徽章、军绿色与 Visual Vacuum／syringe 机制属于战时型号和样本范围，不构成 Morrison 全品牌统一配置。"),
    ],
  ),
];

if (
  phase445BrandDepthPacks.length !== 3 ||
  new Set(phase445BrandDepthPacks.map((pack) => pack.entityId)).size !== 3
) {
  throw new Error("Phase 445 brand refresh must contain three unique brands.");
}
