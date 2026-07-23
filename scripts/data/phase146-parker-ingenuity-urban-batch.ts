import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE30_INGENUITY_ID,
  PHASE30_PARKER_ID,
  PHASE30_URBAN_ID,
  phase30ParkerP0Packs,
} from "./phase30-parker-p0";
import { phase28Parker51Packs } from "./phase28-parker-51";

const RETRIEVED = "2026-07-23";

// These are existing canonical Parker identities from the earlier raw package.
// Phase 146 republishes them with refreshed editorial diagrams; it must not create
// a second Ingenuity or Urban entity.
export const PHASE146_IDS = {
  brand: PHASE30_PARKER_ID,
  ingenuity: PHASE30_INGENUITY_ID,
  urban: PHASE30_URBAN_ID,
} as const;

export const PHASE146_SLUGS = {
  brand: "parker",
  ingenuity: "parker-ingenuity-fountain-pen",
  urban: "parker-urban-fountain-pen",
} as const;

function diagram(
  key: string,
  title: string,
  localPath: string,
  summary: string,
): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial-phase146",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase146",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: `${summary}；本站原创 factual SVG，示意图，非产品照片。`,
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: localPath,
    archiveLocator: [
      `project-public-asset:${localPath}`,
      "site-original=true",
      "factual-svg=true",
      "product-photo=false",
      "logo=false",
      "to-scale=false",
      "colour-proof=false",
      "dimensions=1600x900",
    ].join(";"),
  };
}

const INGENUITY_DIAGRAM = diagram(
  "phase146-parker-ingenuity-diagram",
  "Parker Ingenuity 2023+ identity and SKU boundary diagram",
  "/images/library/site-original/phase146/parker/ingenuity.svg",
  "区分 2023+ conventional fountain pen、2011 5TH writing system 与 SKU 规格边界",
);

const URBAN_DIAGRAM = diagram(
  "phase146-parker-urban-diagram",
  "Parker Urban post-2016 identity and SKU boundary diagram",
  "/images/library/site-original/phase146/parker/urban.svg",
  "区分 pre-2016、post-2016 Urban 与 Muted Black GT 1931593",
);

function replaceDiagram(
  base: CuratedEntityPack,
  nextDiagram: CuratedSource,
  key: string,
): CuratedEntityPack {
  const pack = structuredClone(base);
  pack.key = key;
  const previousDiagramKey = pack.media[0]?.sourceKey;
  if (!previousDiagramKey) throw new Error(`${key} has no existing media source.`);
  pack.sources = [
    ...pack.sources.filter((source) => source.key !== previousDiagramKey),
    nextDiagram,
  ];
  pack.claims = pack.claims.map((claim) => ({
    ...claim,
    sourceKey: claim.sourceKey === previousDiagramKey ? nextDiagram.key : claim.sourceKey,
    evidence: claim.evidence.map((evidence) => ({
      ...evidence,
      sourceKey: evidence.sourceKey === previousDiagramKey ? nextDiagram.key : evidence.sourceKey,
    })),
  }));
  pack.media = pack.media.map((media) => ({
    ...media,
    sourceKey: nextDiagram.key,
    localPath: nextDiagram.url,
    sourceUrl: nextDiagram.url,
    attributionText:
      "本站原创 factual SVG；示意图，非产品照片；non-photo、non-logo、not-to-scale、non-colour-proof。",
  }));
  return pack;
}

function basePack(entityId: string): CuratedEntityPack {
  const pack = phase30ParkerP0Packs.find((candidate) => candidate.entityId === entityId);
  if (!pack) throw new Error(`Phase 146 prerequisite Parker pack is missing: ${entityId}`);
  return pack;
}

const ingenuity = replaceDiagram(
  basePack(PHASE146_IDS.ingenuity),
  INGENUITY_DIAGRAM,
  "phase146-parker-ingenuity-v1",
);
const urban = replaceDiagram(
  basePack(PHASE146_IDS.urban),
  URBAN_DIAGRAM,
  "phase146-parker-urban-v1",
);

function makeBrand(): CuratedEntityPack {
  const existing = phase28Parker51Packs.find(
    (candidate) => candidate.entityId === PHASE146_IDS.brand && candidate.expectedType === "brand",
  );
  if (!existing) throw new Error("Phase 146 Parker brand prerequisite pack is missing.");
  const brand = structuredClone(existing);
  brand.key = "phase146-parker-brand-navigation-v1";
  const sources = new Map(brand.sources.map((source) => [source.key, source]));
  for (const source of [...ingenuity.sources, ...urban.sources]) sources.set(source.key, source);
  brand.sources = [...sources.values()];
  const scopeRef = "phase146-current-navigation";
  const scopeKey = "parker-current-2026-07-23-model-navigation";
  brand.scopes = [
    ...brand.scopes,
    {
      key: "phase146-current-navigation",
      scopeKey,
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: "Ingenuity 2023+ and post-2016 Urban fountain-pen navigation only; other Parker modes stay separate.",
    },
  ];
  brand.claims = [
    ...brand.claims,
    {
      key: "phase146-parker-ingenuity-navigation",
      predicate: "model_navigation",
      objectText: "Parker 当前钢笔导航包含 Ingenuity 2023+ conventional fountain pen；2011 5TH refill writing system不并入该型号页。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "parker-ingenuity-2213726-pdp",
      locator: "current Grey GT 2213726 fountain-pen product page",
      evidence: [{
        key: "phase146-ingenuity-navigation-evidence",
        sourceKey: "parker-ingenuity-2213726-pdp",
        scopeKey: scopeRef,
        locator: "Parker product page labels the item as Ingenuity Fountain Pen and gives SKU 2213726",
      }],
    },
    {
      key: "phase146-parker-urban-navigation",
      predicate: "model_navigation",
      objectText: "Parker 当前钢笔导航包含 post-2016 Urban Fountain Pen；Urban 的圆珠笔、滚珠笔和 5TH 书写模式不继承钢笔规格。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "parker-urban-1931593-pdp",
      locator: "current Muted Black GT 1931593 fountain-pen product page",
      evidence: [{
        key: "phase146-urban-navigation-evidence",
        sourceKey: "parker-urban-1931593-pdp",
        scopeKey: scopeRef,
        locator: "Parker product page labels the item as Urban Fountain Pen and gives SKU 1931593",
      }],
    },
  ];
  return brand;
}

export const phase146ParkerIngenuityUrbanPacks: CuratedEntityPack[] = [
  makeBrand(),
  ingenuity,
  urban,
];

export const phase146ParkerPenPacks = [ingenuity, urban] as CuratedEntityPack[];
