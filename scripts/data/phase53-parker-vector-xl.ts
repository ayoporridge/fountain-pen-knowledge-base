import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";
import {
  PHASE30_PARKER_ID,
  PHASE30_VECTOR_ID,
  PHASE30_VECTOR_XL_ID,
  phase30ParkerP0Packs,
} from "./phase30-parker-p0";

export const PHASE53_PARKER_ID = PHASE30_PARKER_ID;
export const PHASE53_VECTOR_ID = PHASE30_VECTOR_ID;
export const PHASE53_VECTOR_XL_ID = PHASE30_VECTOR_XL_ID;
export const PHASE53_VECTOR_SLUG = "派克-parker-威雅-vector";
export const PHASE53_VECTOR_XL_SLUG = "parker-vector-xl-fountain-pen";

const RETRIEVED = "2026-07-19";

function live(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  summary: string;
  locator: string;
  publishedAt?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.url,
    author: input.registryName,
    publishedAt: input.publishedAt ?? null,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(key: string, title: string, localPath: string, summary: string): CuratedSource {
  return {
    key,
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title,
    url: localPath,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary,
    archiveUrl: localPath,
    archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
  };
}

const SOURCES = {
  catalogue2024: live({
    key: "phase53-parker-2024-catalogue",
    registryKey: "parker-official-catalogues-phase53",
    registryName: "Parker official trade catalogues",
    title: "Parker Catalogue 2024 A4 EMEA",
    url: "https://www.parkervip.com/media/Parker_Catalog_2024_A4_EMEA_2023_LR.pdf",
    sourceType: "official",
    tier: "contemporary_archive",
    publishedAt: "2024",
    summary:
      "Parker 2024 A4 EMEA 目录把 Vector 的 fountain-pen SKU（含 S0029690、1870805、S0881041、S0881011）与 Vector XL 的 FP SKU 分列；FP/F/M 图例用于区分 fountain pen、尖号与其他书写模式。",
    locator: "printed pages 155-156; Vector and Vector XL portfolio rows; FP/F/M legend",
  }),
  penhero: live({
    key: "phase53-parker-vector-penhero",
    registryKey: "penhero-parker-vector",
    registryName: "PenHero.com",
    title: "Parker Vector 1981–Present",
    url: "https://penhero.com/PenGallery/Parker/ParkerVector.htm",
    sourceType: "blog",
    tier: "professional_secondary",
    publishedAt: "2003-07-04",
    summary:
      "Jim Mamoulides 的 PenHero 档案（页面 2003 更新）同时记录 Vector 的 FP-1、1986 重设计、Standard/Flighter、钢尖与 converter 观察，也列出 ballpoint、rollerball 和 pencil；本文只把明确的 fountain-pen 段落用于钢笔事实。",
    locator: "updated 2003-07-04; FP1 and 1986 redesign; fountain-pen nib/filling paragraphs; separate ballpoint/rollerball/pencil paragraphs",
  }),
  classicDiagram: diagram(
    "phase53-parker-vector-boundary-svg",
    "Parker Vector classic 与 Vector XL 资料边界事实图",
    "/images/library/site-original/parker-vector-xl/classic-vector-boundary.svg",
    "本站原创事实图，区分经典 slim Vector 与 XL 的年份、尺寸和 SKU 边界。",
  ),
  xlDiagram: diagram(
    "phase53-parker-vector-xl-2159746-svg",
    "Parker Vector XL Teal 2159746 规格事实图",
    "/images/library/site-original/parker-vector-xl/vector-xl-2159746-spec.svg",
    "本站原创事实图，呈现 2159746 的 M 尖、尺寸、重量和 converter 边界。",
  ),
} satisfies Record<string, CuratedSource>;

function replaceMedia(
  pack: CuratedEntityPack,
  source: CuratedSource,
  localPath: string,
  title: string,
): void {
  pack.media = [{
    key: `${pack.entityId}-phase53-primary`,
    title,
    sourceKey: source.key,
    localPath,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText:
      "Fountain Pen Graph 本站原创 factual SVG；示意图，非产品照片，不复制或临摹 Parker 官方摄影，不表现真实比例、颜色、Logo、刻字或制造地。",
    sourceUrl: localPath,
    usageStatus: "primary",
  }];
}

function addSource(pack: CuratedEntityPack, source: CuratedSource): void {
  if (!pack.sources.some((candidate) => candidate.key === source.key)) {
    pack.sources.push(source);
  }
}

function makeClassicPack(): CuratedEntityPack {
  const base = phase30ParkerP0Packs.find((pack) => pack.entityId === PHASE53_VECTOR_ID);
  if (!base) throw new Error("Phase 53 classic Vector prerequisite pack is missing.");
  const pack = structuredClone(base);
  pack.key = "phase53-parker-vector-classic-v1";
  pack.canonicalName = "Parker Vector（经典款）";
  pack.primarySourceKey = SOURCES.catalogue2024.key;
  addSource(pack, SOURCES.catalogue2024);
  addSource(pack, SOURCES.penhero);
  addSource(pack, SOURCES.classicDiagram);
  pack.claims = pack.claims.map((claim) => {
    if (claim.key === "vector-classic-xl-boundary") {
      return { ...claim, sourceKey: SOURCES.catalogue2024.key, evidence: [
        ...claim.evidence,
        { key: "vector-2024-family-split", sourceKey: SOURCES.catalogue2024.key, scopeKey: "vector-xl-excluded", locator: "2024 catalogue keeps Vector and Vector XL rows separate" },
      ] };
    }
    if (claim.key === "vector-fp1-history") {
      return { ...claim, sourceKey: SOURCES.penhero.key, evidence: [
        ...claim.evidence,
        { key: "vector-penhero-fp1-history", sourceKey: SOURCES.penhero.key, scopeKey: "vector-fp1", locator: "FP1 1984 and 1986 Vector redesign chronology" },
      ] };
    }
    return claim;
  });
  pack.claims.push({
    key: "vector-2003-ballpoint-not-fountain",
    predicate: "writing_mode_boundary",
    objectText:
      "PenHero 页面 2003 更新中的 ballpoint、rollerball 与 pencil 段落是 Vector 的其他书写模式；它们不能被当作 fountain pen 的尖号、上墨、尺寸或维护证据。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: SOURCES.penhero.key,
    locator: "separate writing-mode paragraphs: pushbutton ballpoint/pencil and capped rollerball versus fountain pen",
    evidence: [
      { key: "vector-ballpoint-exclusion", sourceKey: SOURCES.penhero.key, scopeKey: "vector-classic", locator: "ballpoint and pencil mechanisms are described separately from fountain pen steel nib" },
    ],
  });
  pack.spec!.values = {
    ...pack.spec!.values,
    status: "历史长期 family；2024 目录仍列出部分 Vector fountain-pen SKU；与 Vector XL 分开",
  };
  pack.spec!.evidence = pack.spec!.evidence.map((evidence) =>
    evidence.fieldKey === "status"
      ? { ...evidence, sourceKey: SOURCES.catalogue2024.key, scopeKey: "vector-classic", locator: "2024 catalogue Vector FP rows and separate Vector XL section" }
      : evidence,
  );
  pack.variants = [
    ...(pack.variants ?? []),
    { key: "vector-2024-stainless-f", name: "Vector Stainless Steel CT fountain pen F", releaseYear: "2024 catalogue snapshot", notes: "SKU S0029690；目录 FP/F 记录，只用于 fountain pen，不能套用到同名 BP/RB。", sourceKey: SOURCES.catalogue2024.key, variantKind: "market_sku", productCode: "S0029690", market: "EMEA" },
    { key: "vector-2024-stainless-m", name: "Vector Stainless Steel CT fountain pen M", releaseYear: "2024 catalogue snapshot", notes: "SKU 1870805；目录 FP/M 记录，只绑定该 fountain-pen SKU。", sourceKey: SOURCES.catalogue2024.key, variantKind: "market_sku", productCode: "1870805", market: "EMEA" },
    { key: "vector-2024-black-m", name: "Vector Black CT fountain pen M", releaseYear: "2024 catalogue snapshot", notes: "SKU S0881041；Blister 包装的 FP/M 记录，不与圆珠笔或滚珠笔合并。", sourceKey: SOURCES.catalogue2024.key, variantKind: "market_sku", productCode: "S0881041", market: "EMEA" },
  ];
  replaceMedia(pack, SOURCES.classicDiagram, SOURCES.classicDiagram.url, "Parker Vector classic 与 Vector XL 边界事实图（非产品照片）");
  return pack;
}

function makeXlPack(): CuratedEntityPack {
  const base = phase30ParkerP0Packs.find((pack) => pack.entityId === PHASE53_VECTOR_XL_ID);
  if (!base) throw new Error("Phase 53 Vector XL prerequisite pack is missing.");
  const pack = structuredClone(base);
  pack.key = "phase53-parker-vector-xl-v1";
  pack.primarySourceKey = SOURCES.catalogue2024.key;
  addSource(pack, SOURCES.catalogue2024);
  addSource(pack, SOURCES.penhero);
  addSource(pack, SOURCES.xlDiagram);
  pack.claims = pack.claims.map((claim) => {
    if (claim.key === "vector-xl-separate-identity") {
      return { ...claim, sourceKey: SOURCES.catalogue2024.key, evidence: [
        ...claim.evidence,
        { key: "vector-xl-2024-catalogue-identity", sourceKey: SOURCES.catalogue2024.key, scopeKey: "vector-xl-current", locator: "2024 catalogue lists Vector XL FP SKUs separately from classic Vector" },
      ] };
    }
    if (claim.key === "vector-xl-date-boundary") {
      return { ...claim, sourceKey: SOURCES.catalogue2024.key, evidence: [
        ...claim.evidence,
        { key: "vector-xl-2024-latest-window", sourceKey: SOURCES.catalogue2024.key, scopeKey: "vector-xl-current", locator: "2024 catalogue confirms continuing Vector XL FP listings" },
      ] };
    }
    return claim;
  });
  pack.claims.push({
    key: "vector-xl-2003-ballpoint-exclusion",
    predicate: "writing_mode_boundary",
    objectText:
      "PenHero 的 2003 更新页可作为经典 Vector 家族的历史参考，但其中 pushbutton ballpoint、rollerball 与 pencil 的机制不属于 Vector XL fountain pen；XL 页只保留钢笔尖和墨囊／converter 证据。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: SOURCES.penhero.key,
    locator: "PenHero separate writing-mode descriptions; no XL fountain-pen spec inferred from ballpoint passages",
    evidence: [
      { key: "vector-xl-ballpoint-exclusion", sourceKey: SOURCES.penhero.key, scopeKey: "vector-classic-excluded", locator: "ballpoint mechanism is a separate Vector writing mode, not a fountain-pen filling system" },
    ],
  });
  pack.spec!.evidence = pack.spec!.evidence.map((evidence) =>
    evidence.fieldKey === "status"
      ? { ...evidence, sourceKey: SOURCES.catalogue2024.key, scopeKey: "vector-xl-current", locator: "2024 catalogue Vector XL FP listings" }
      : evidence,
  );
  pack.variants = [
    ...(pack.variants ?? []),
    { key: "vector-xl-2024-black-m", name: "Vector XL Black Lacquer CT fountain pen M", releaseYear: "2024 catalogue snapshot", notes: "SKU 2159744；GB 包装，FP/M。尺寸和重量不从 Teal 2159746 外推。", sourceKey: SOURCES.catalogue2024.key, variantKind: "market_sku", productCode: "2159744", market: "EMEA" },
    { key: "vector-xl-2024-lilac-m", name: "Vector XL Lilac Lacquer CT fountain pen M", releaseYear: "2024 catalogue snapshot", notes: "SKU 2159748；FP/M；仅作为 finish/SKU 记录。", sourceKey: SOURCES.catalogue2024.key, variantKind: "market_sku", productCode: "2159748", market: "EMEA" },
    { key: "vector-xl-2024-teal-f", name: "Vector XL Teal Lacquer CT fountain pen F", releaseYear: "2024 catalogue snapshot", notes: "SKU 2159771Z；FP/F transit-box SKU，不能改写 2159746 的 M。", sourceKey: SOURCES.catalogue2024.key, variantKind: "market_sku", productCode: "2159771Z", market: "EMEA" },
  ];
  replaceMedia(pack, SOURCES.xlDiagram, SOURCES.xlDiagram.url, "Parker Vector XL Teal 2159746 规格事实图（非产品照片）");
  return pack;
}

export const phase53ParkerVectorXLPacks: CuratedEntityPack[] = [makeClassicPack(), makeXlPack()];
