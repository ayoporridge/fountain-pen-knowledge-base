import type {
  CuratedEntityPack,
  CuratedSource,
} from "../lib/curated-content-pack";
import { phase28Parker51Packs } from "./phase28-parker-51";
import {
  PHASE30_PARKER_ID,
  phase30ParkerP0Packs,
} from "./phase30-parker-p0";

const RETRIEVED = "2026-07-19";

export const PHASE34_PARKER_ID = PHASE30_PARKER_ID;
export const PHASE34_DUOFOLD_VINTAGE_ID = "sYO0meaAoJ_V";
export const PHASE34_DUOFOLD_GEOMETRIC_ID = "HDMg5J3JWOax";
export const PHASE34_DUOFOLD_STRIPED_ID = "wf8EzmU-iyFj";
export const PHASE34_DUOFOLD_CENTENNIAL_ID = "h8mHobX3YCPS";

type LiveSourceInput = Omit<
  CuratedSource,
  "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
> & {
  allowedUse?: CuratedSource["allowedUse"];
  locator: string;
};

function liveSource(source: LiveSourceInput): CuratedSource {
  const { allowedUse, locator, ...record } = source;
  return {
    ...record,
    retrievedAt: RETRIEVED,
    allowedUse: allowedUse ?? "summary_only",
    archiveUrl: record.url,
    archiveLocator: [
      "live-source-not-frozen",
      `retrieved=${RETRIEVED}`,
      "external_archive=false",
      "raw_source_stored=false",
      `locator=${locator}`,
    ].join(";"),
  };
}

function priorSource(key: string): CuratedSource {
  for (const pack of [...phase28Parker51Packs, ...phase30ParkerP0Packs]) {
    const found = pack.sources.find((candidate) => candidate.key === key);
    if (found) return structuredClone(found);
  }
  throw new Error(`Phase 34 prerequisite source is missing: ${key}`);
}

function derivedPriorSource(
  baseKey: string,
  input: Pick<CuratedSource, "key" | "title" | "url" | "summary"> & {
    locator: string;
    publishedAt?: string | null;
    itemType?: string;
  },
): CuratedSource {
  const base = priorSource(baseKey);
  return {
    ...base,
    key: input.key,
    title: input.title,
    url: input.url,
    summary: input.summary,
    publishedAt: input.publishedAt ?? null,
    itemType: input.itemType ?? "web_page",
    retrievedAt: RETRIEVED,
    archiveUrl: input.url,
    archiveLocator: [
      "live-source-not-frozen",
      `retrieved=${RETRIEVED}`,
      "external_archive=false",
      "raw_source_stored=false",
      `locator=${input.locator}`,
    ].join(";"),
  };
}

function siteOriginalSource(input: {
  key: string;
  title: string;
  path: string;
  diagramScope: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: input.title,
    url: input.path,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    summary: `${input.diagramScope}；本站原创事实图，仅呈现资料关系，示意图，非产品照片。`,
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl: input.path,
    archiveLocator: [
      `project-public-asset:${input.path}`,
      "site-original=true",
      "format=svg",
      "editorial-diagram=true",
      "product-photo=false",
      "product-likeness=false",
      "official-photo-copied=false",
    ].join(";"),
  };
}

const SOURCES = {
  "parker-official-history": priorSource("parker-official-history"),
  "parker-care-guide": priorSource("parker-care-guide"),
  "parker-duofold-100-press": derivedPriorSource("parker-official-history", {
    key: "parker-duofold-100-press",
    title: "Parker Duofold 100 press release",
    url: "https://www.parkerpen.com/duofold-press-release.html",
    publishedAt: "2021",
    summary:
      "Parker 官方百年资料：1921 Big Red、1920 年代由 hard rubber 转向 resin、Jade／Lapis 等颜色历史，以及 2021 周年款边界。",
    locator:
      "Experimental Origins 1920s; Big Red; Jade Green 1926; Lapis Lazuli 1927; Duofold 100 construction",
  }),
  "parker-duofold-1931375-pdp": derivedPriorSource("parker-official-history", {
    key: "parker-duofold-1931375-pdp",
    title: "Duofold Classic Big Red Centennial Fountain Pen 1931375",
    url: "https://www.parkerpen.com/writing-types/collections/duofold/duofold-classic-fountain-pen/SAP_1931375.html",
    summary:
      "Parker 美国当前产品页：1931375、Big Red precious resin、palladium trim、Centennial Size、F 与 18K 双色镀铑笔尖。",
    locator:
      "current Features and Specifications on 2026-07-19; Item 1931375; Centennial Size; 18K; Big Red resin; palladium trim",
  }),
  "parker-duofold-1931381-pdp": derivedPriorSource("parker-official-history", {
    key: "parker-duofold-1931381-pdp",
    title: "Duofold Classic Black Centennial Fountain Pen 1931381",
    url: "https://www.parkerpen.com/writing-types/collections/duofold/duofold-classic-fountain-pen/SAP_1931381.html",
    summary:
      "Parker 当前产品页：1931381、Classic Black precious resin、23K gold-plated trim、Centennial Size、F 与 18K 双色镀铑笔尖。",
    locator:
      "Features and Specifications: Item 1931381; Classic Black; Centennial Size; Fine; 18K solid gold rhodium-plated nib",
  }),
  "parker-catalog-5550-1939": {
    key: "parker-catalog-5550-1939",
    registryKey: "pen-collectors-america-parker-library",
    registryName: "Pen Collectors of America — Parker Reference Library",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "parker-catalog-5550-1939",
    title: "Parker Catalog No. 5550 — Pens, Pencils and Desk Sets",
    url: "https://drive.google.com/file/d/1_8YvB2-K7242YXvJEbgz1hg7UPKkM6iR/view?usp=sharing",
    homepageUrl: "https://pencollectorsofamerica.org/parker/",
    itemType: "catalog",
    author: "The Parker Pen Company",
    publishedAt: "1939-08",
    retrievedAt: RETRIEVED,
    summary:
      "Parker 1939 年 8 月目录 No. 5550 的 Duofold 页：Mosaic-like pattern、Visiometer Ink Window、按键上墨、14K 金尖，以及 Standard／Slender 和黑、棕、灰、绿四色订货表。",
    allowedUse: "link_only",
    archiveUrl:
      "https://drive.google.com/file/d/1_8YvB2-K7242YXvJEbgz1hg7UPKkM6iR/view?usp=sharing",
    archiveLocator:
      "Pen Collectors of America Parker Reference Library; Catalog No. 5550, Aug 1939; PDF page 19 / printed page 18; Duofold Pen and Pencil Set",
  },
  "parker-duofold-catalog-1940": {
    key: "parker-duofold-catalog-1940",
    registryKey: "pen-collectors-america-parker-library",
    registryName: "Pen Collectors of America — Parker Reference Library",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "parker-duofold-catalog-1940",
    title: "Parker Duofold Sacless Catalog",
    url: "https://drive.google.com/file/d/1ufIlpYuTcgRYxJ8fDFagf4Y4kILPREnC/view?usp=sharing",
    homepageUrl: "https://pencollectorsofamerica.org/parker/",
    itemType: "catalog",
    author: "The Parker Pen Company",
    publishedAt: "1940",
    retrievedAt: RETRIEVED,
    summary:
      "Parker 1940 Duofold 目录：Laidtone Permanite、Senior／Ingenue／Major／Debutante、Sacless 与 Sac 分支、14K 金尖，以及蓝、栗、绿、黑等订货表。",
    allowedUse: "link_only",
    archiveUrl:
      "https://drive.google.com/file/d/1ufIlpYuTcgRYxJ8fDFagf4Y4kILPREnC/view?usp=sharing",
    archiveLocator:
      "Pen Collectors of America Parker Reference Library; Parker Duofold catalog, 1940; PDF pages 2-5; Sacless and Sac Duofold listings",
  },
  "parker-2026-emea-catalogue": priorSource("parker-2026-emea-catalogue"),
  "parker-duofold-penography": derivedPriorSource(
    "parker-vector-penography",
    {
      key: "parker-duofold-penography",
      title: "Parker Pens Penography: Duofold 1921–1933",
      url: "https://parkerpens.net/duofold.html",
      summary:
        "Tony Fischier 的 Parker 专题资料：1921 起源、各尺寸、hard rubber／Permanite、1929 Streamlined、1933 Janesville 停产及尺寸表。",
      locator:
        "1921 launch; Senior/Junior/Lady/Special chronology; 1925-26 Permanite; 1929 streamline; 1933 Janesville stop; size table",
    },
  ),
  "parker-duofold-geometric-penography": derivedPriorSource(
    "parker-vector-penography",
    {
      key: "parker-duofold-geometric-penography",
      title: "Parker Pens Penography: Duofold Geometric / Toothbrush",
      url: "https://parkerpens.net/geometric.html",
      summary:
        "Parker 专题资料：Geometric 1939–1940、Standard／Slender、绿灰棕黑四色，以及 solid-rod Visiometer 与实际 button filler + sac。",
      locator:
        "1939-1940 heading; two sizes and four colors; Visiometer solid rod; ordinary button filler with sac; early-1940 discontinuation",
    },
  ),
  "parker-duofold-striped-penography": derivedPriorSource(
    "parker-vector-penography",
    {
      key: "parker-duofold-striped-penography",
      title: "Parker Pens Penography: Striped Duofold / Duovac",
      url: "https://parkerpens.net/duovac.html",
      summary:
        "Parker 专题资料：Striped Duofold 1940–1948、Vacumatic 与 button filler 分支、尺寸与饰件变化，以及 1942 混用刻字／夹具过渡件。",
      locator:
        "1940-1948 heading; filler types; size/configuration table; 1942 transitional Vacumatic imprints/clips/cap bands; phase-out in 1948",
    },
  ),
  "parker-duofold-centennial-penography": derivedPriorSource(
    "parker-vector-penography",
    {
      key: "parker-duofold-centennial-penography",
      title: "Parker Pens Penography: Centennial / International Duofold",
      url: "https://parkerpens.net/centennial.shtml",
      summary:
        "Parker 专题资料：Centennial 1987 已生产、1988 百年正式推出，早期 Mk I 笔尖与尺寸，以及 1989 International 分型。",
      locator:
        "Centennial Mk I 1988-1995; production began in 1987; official centenary introduction in 1988; early nib options; International introduced 1989",
    },
  ),
  "vintagepens-parker-duofold": liveSource({
    key: "vintagepens-parker-duofold",
    registryKey: "vintagepens-reference",
    registryName: "VintagePens.com reference library",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "vintagepens-reference",
    title: "Parker Duofold",
    url: "https://www.vintagepens.com/Parker_Duofold.shtml",
    homepageUrl: "https://www.vintagepens.com/",
    author: "VintagePens.com",
    summary:
      "专业旧笔资料：1921 红色 hard-rubber button filler、黑色端部、后续尺寸与 1926 前后转入 Permanite 的概要。",
    locator:
      "first Duofolds paragraph; 1921 red hard rubber button filler; colors and celluloid/Permanite transition",
  }),
  "vintagepens-care": liveSource({
    key: "vintagepens-care",
    registryKey: "vintagepens-reference",
    registryName: "VintagePens.com reference library",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "vintagepens-reference",
    title: "How do I care for my vintage pen?",
    url: "https://vintagepens.com/FAQbasics/vintage_pen_care.shtml",
    homepageUrl: "https://www.vintagepens.com/",
    author: "VintagePens.com",
    summary:
      "专业旧笔护理：hard rubber 避水与强光、旧上墨机构勿强行操作、盖帽与插帽应轻柔。",
    locator:
      "hard-rubber water and sunlight warning; do not operate filler while closed; gentle handling and heat avoidance",
  }),
  "vintagepens-filling": liveSource({
    key: "vintagepens-filling",
    registryKey: "vintagepens-reference",
    registryName: "VintagePens.com reference library",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "vintagepens-reference",
    title: "Vintage Fountain Pens Filling Instructions: The Basics",
    url: "https://vintagepens.com/filling_instructions_vintage_pens.shtml",
    homepageUrl: "https://www.vintagepens.com/",
    author: "VintagePens.com",
    summary:
      "专业旧笔上墨说明：硬化墨囊或黏死机构不可强行操作；sac pen 松开后需等待回弹吸墨。",
    locator:
      "do not force a sticky filler; hardened sac warning; ten-second wait after releasing pressure",
  }),
  "ravens-march-duofold": liveSource({
    key: "ravens-march-duofold",
    registryKey: "ravens-march-reference",
    registryName: "Ravens March Fountain Pens",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "ravens-march-reference",
    title: "Duofold chronology",
    url: "https://dirck.delint.ca/beta/?page_id=53",
    homepageUrl: "https://dirck.delint.ca/",
    author: "Dirck De Lint",
    summary:
      "独立收藏研究按阶段区分 1921、1939 Geometric 与 1940s Striped，并说明 Striped 的 button/Vacumatic 两路及目录 Sac/Sacless 用语。",
    locator:
      "1921-1933 chapter; 1939-1940 Toothbrush; striped section; Sac and Sacless filler terminology; regional continuation notes",
  }),
  "parker-duofold-vintage-diagram": siteOriginalSource({
    key: "parker-duofold-vintage-diagram",
    title: "Parker Duofold 1921–1938 family timeline",
    path: "/images/library/site-original/parker-duofold/parker-duofold-vintage-family-factual.svg",
    diagramScope:
      "表示 1921 Big Red、Permanite、Streamlined 与 1933 后库存／海外延续的边界",
  }),
  "parker-duofold-geometric-diagram": siteOriginalSource({
    key: "parker-duofold-geometric-diagram",
    title: "Parker Duofold Geometric structure card",
    path: "/images/library/site-original/parker-duofold/parker-duofold-geometric-factual.svg",
    diagramScope:
      "表示两尺寸、四色以及 Visiometer solid rod 与 button filler + sac 的结构差别",
  }),
  "parker-duofold-striped-diagram": siteOriginalSource({
    key: "parker-duofold-striped-diagram",
    title: "Parker Striped Duofold filler-branch diagram",
    path: "/images/library/site-original/parker-duofold/parker-striped-duofold-factual.svg",
    diagramScope:
      "表示 Vacumatic 与 button filler 两分支，并标注 1942 过渡件",
  }),
  "parker-duofold-centennial-diagram": siteOriginalSource({
    key: "parker-duofold-centennial-diagram",
    title: "Parker Duofold Classic Centennial chronology and SKU card",
    path: "/images/library/site-original/parker-duofold/parker-duofold-centennial-factual.svg",
    diagramScope:
      "表示 1987/88 时间边界、当前 Centennial Size 与 1931375/76、1931381/82 SKU",
  }),
} satisfies Record<string, CuratedSource>;

const source = (key: keyof typeof SOURCES): CuratedSource =>
  structuredClone(SOURCES[key]);

const parkerBrandPack = phase28Parker51Packs.find(
  (pack) =>
    pack.expectedType === "brand" && pack.entityId === PHASE34_PARKER_ID,
);
if (!parkerBrandPack) {
  throw new Error("Phase 34 cannot resolve the canonical Phase 30 Parker brand pack.");
}
const phase34ParkerBrandPack = structuredClone(parkerBrandPack);
phase34ParkerBrandPack.sources = phase34ParkerBrandPack.sources.map((source) =>
  source.key === "parker-im-commons"
    ? {
        ...source,
        registryKey: "wikimedia-commons-caleb-bond",
        registryName: "Wikimedia Commons — Caleb Bond file",
      }
    : source,
);

export const phase34ParkerDuofoldPacks: CuratedEntityPack[] = [
  phase34ParkerBrandPack,
  {
    key: "phase34-parker-duofold-vintage-family-v1",
    entityId: PHASE34_DUOFOLD_VINTAGE_ID,
    expectedType: "pen",
    expectedSlug: "the-parker-duofold",
    canonicalName: "Parker Duofold（1921–1938 经典家族）",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/parker-duofold-vintage-family-publishable-content-2026-07-19.md",
    storyTitle: "Parker Duofold 1921–1938：Big Red、Permanite 与 Streamlined",
    primarySourceKey: "parker-official-history",
    depthTier: "A",
    aliases: [
      {
        alias: "Parker Duofold",
        language: "en",
        sourceKey: "parker-official-history",
      },
      {
        alias: "派克多福",
        language: "zh",
        sourceKey: "parker-official-history",
      },
    ],
    sources: [
      source("parker-official-history"),
      source("parker-duofold-100-press"),
      source("parker-duofold-penography"),
      source("vintagepens-parker-duofold"),
      source("vintagepens-care"),
      source("vintagepens-filling"),
      source("parker-duofold-vintage-diagram"),
    ],
    variants: [
      {
        key: "duofold-senior-1921",
        name: "Duofold Senior / Big Red early family",
        releaseYear: "1921",
        notes:
          "首发大尺寸红色 hard-rubber button filler；约 139 mm 只属于早期 Senior 范围。",
        sourceKey: "parker-duofold-penography",
        variantKind: "edition_group",
      },
      {
        key: "duofold-junior-lady-special",
        name: "Junior / Lady / Special size branches",
        releaseYear: "1922+",
        notes: "尺寸、ring top、帽环与刻字均依分支及年代，不共享统一规格。",
        sourceKey: "parker-duofold-penography",
        variantKind: "edition_group",
      },
      {
        key: "duofold-permanite",
        name: "Permanite color families",
        releaseYear: "1925/26+",
        notes:
          "由 hard rubber 转入 Parker 称作 Permanite 的塑料，并扩展 Jade、Lapis、Mandarin 等颜色。",
        sourceKey: "parker-duofold-100-press",
        variantKind: "material",
      },
      {
        key: "duofold-streamlined",
        name: "Streamlined Duofold",
        releaseYear: "1929+",
        notes: "两端收束的外形调整；仍属早期家族，不是 1939 Geometric。",
        sourceKey: "parker-duofold-penography",
        variantKind: "edition_group",
      },
    ],
    scopes: [
      {
        key: "duofold-vintage-family",
        scopeKey: "parker-duofold-vintage-1921-1938-coverage",
        validFrom: "1921",
        validTo: "1938",
        productionState: "historical",
        nibScope: "open nib; exact size, marking and grade vary",
        materialScope: "hard rubber and later Permanite families",
        editionScope:
          "early US family plus dated stock/overseas continuation; excludes 1939+ renamed families",
      },
      {
        key: "duofold-vintage-us-mainline",
        scopeKey: "parker-duofold-janesville-1921-1933",
        validFrom: "1921",
        validTo: "1933",
        productionState: "historical",
        editionScope: "Janesville mainline production boundary",
      },
      {
        key: "duofold-vintage-post-us",
        scopeKey: "parker-duofold-stock-overseas-1933-1938",
        validFrom: "1933",
        validTo: "1938",
        productionState: "historical",
        editionScope: "stock sell-through and overseas continuation, not unchanged US production",
      },
    ],
    claims: [
      {
        key: "duofold-vintage-identity",
        predicate: "model_identity",
        objectText:
          "本页覆盖 1921 早期 Duofold 家族到 1930 年代后期边界，排除 1939 Geometric、1940 Striped 与现代 Centennial。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "parker-official-history",
        locator: "1921 official launch milestone",
        evidence: [
          {
            key: "duofold-vintage-launch-official",
            sourceKey: "parker-official-history",
            scopeKey: "duofold-vintage-family",
            locator: "official 1921 Duofold launch, Big Red and 25-year guarantee",
          },
          {
            key: "duofold-vintage-us-end-specialist",
            sourceKey: "parker-duofold-penography",
            scopeKey: "duofold-vintage-us-mainline",
            locator: "1933 Janesville production stopped; stock and overseas continuation",
          },
        ],
      },
      {
        key: "duofold-vintage-material-evolution",
        predicate: "material_evolution",
        objectText:
          "早期 Duofold 为红／黑 hard rubber，1920 年代中后期转入 Permanite 并扩展颜色；不同材料和尺寸不能共享单一规格。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "vintagepens-parker-duofold",
        locator: "early hard-rubber button filler and 1926 celluloid/Permanite transition",
        evidence: [
          {
            key: "duofold-vintage-hard-rubber",
            sourceKey: "vintagepens-parker-duofold",
            scopeKey: "duofold-vintage-family",
            locator: "first 1921 red hard-rubber button fillers with black end pieces",
          },
          {
            key: "duofold-vintage-permanite",
            sourceKey: "parker-duofold-100-press",
            scopeKey: "duofold-vintage-family",
            locator: "1920s resin transition and later color families",
          },
        ],
      },
      {
        key: "duofold-vintage-media-boundary",
        predicate: "media_identity_boundary",
        objectText:
          "主图是本站原创时间线，仅表示年代和材料分界；示意图，非产品照片。",
        factClass: "editorial",
        confidence: 1,
        sourceKey: "parker-duofold-vintage-diagram",
        locator: "site-original SVG provenance",
        evidence: [
          {
            key: "duofold-vintage-diagram-not-photo",
            sourceKey: "parker-duofold-vintage-diagram",
            scopeKey: "duofold-vintage-family",
            locator: "product-photo=false; product-likeness=false",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: PHASE34_PARKER_ID,
      values: {
        series_name: "Parker Duofold early family（1921–1938 coverage）",
        release_year:
          "1921；Janesville 主线至 1933，库存／海外生产延续到 1930 年代后期",
        nib: "开放式 Parker 笔尖；尺寸、刻字和等级随分支与年代变化",
        fill_system: "button filler + rubber sac",
        material: "早期 hard rubber；后期 Permanite，多颜色与版本",
        dimensions:
          "家族无统一尺寸；早期 Senior 约 139 mm，其他尺寸与 Streamlined 分开",
        status:
          "历史家族；排除 1939 Geometric、1940 Striped 与 1987/88+ Centennial",
      },
      evidence: [
        {
          key: "duofold-vintage-brand",
          fieldKey: "brand_entity_id",
          sourceKey: "parker-official-history",
          scopeKey: "duofold-vintage-family",
          locator: "official Parker Duofold milestone",
        },
        {
          key: "duofold-vintage-series",
          fieldKey: "series_name",
          sourceKey: "parker-duofold-penography",
          scopeKey: "duofold-vintage-family",
          locator: "Duofold 1921-1933 specialist chapter and later continuation notes",
        },
        {
          key: "duofold-vintage-year",
          fieldKey: "release_year",
          sourceKey: "parker-official-history",
          scopeKey: "duofold-vintage-family",
          locator: "1921 official launch",
        },
        {
          key: "duofold-vintage-year-end",
          fieldKey: "release_year",
          sourceKey: "parker-duofold-penography",
          scopeKey: "duofold-vintage-post-us",
          locator: "1933 Janesville stop and overseas continuation",
        },
        {
          key: "duofold-vintage-nib",
          fieldKey: "nib",
          sourceKey: "parker-duofold-penography",
          scopeKey: "duofold-vintage-family",
          locator: "size/edition chronology and changing nib/imprint descriptions",
        },
        {
          key: "duofold-vintage-fill",
          fieldKey: "fill_system",
          sourceKey: "vintagepens-parker-duofold",
          scopeKey: "duofold-vintage-family",
          locator: "first Duofolds described as button-filling pens",
        },
        {
          key: "duofold-vintage-material",
          fieldKey: "material",
          sourceKey: "vintagepens-parker-duofold",
          scopeKey: "duofold-vintage-family",
          locator: "hard rubber and celluloid/Permanite transition",
        },
        {
          key: "duofold-vintage-dimensions",
          fieldKey: "dimensions",
          sourceKey: "parker-duofold-penography",
          scopeKey: "duofold-vintage-family",
          locator: "overview size table; Senior/Junior/Special/Lady differ",
        },
        {
          key: "duofold-vintage-status",
          fieldKey: "status",
          sourceKey: "parker-duofold-penography",
          scopeKey: "duofold-vintage-post-us",
          locator: "historical production and continuation boundary",
        },
      ],
    },
    media: [
      {
        key: "duofold-vintage-factual-primary",
        title: "Parker Duofold 1921–1938 年代与材料示意图（非产品照片）",
        sourceKey: "parker-duofold-vintage-diagram",
        localPath:
          "/images/library/site-original/parker-duofold/parker-duofold-vintage-family-factual.svg",
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "Fountain Pen Graph 本站原创事实时间线。示意图，非产品照片；未复制或临摹 Parker 产品、广告或档案图，不能作为鉴定证据。",
        sourceUrl:
          "/images/library/site-original/parker-duofold/parker-duofold-vintage-family-factual.svg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "duofold-vintage-1921-launch",
        title: "Parker 推出 Duofold",
        eventType: "model_released",
        startDate: "1921",
        circa: false,
        description: "官方时间线记录 1921 发布，Big Red 与 25 年保证随后成名。",
        sourceKey: "parker-official-history",
      },
      {
        key: "duofold-vintage-1929-streamline",
        title: "Duofold 转入 Streamlined 外形",
        eventType: "design_milestone",
        startDate: "1929",
        circa: false,
        description: "两端收束的新外形加入，多尺寸与过渡组合继续存在。",
        sourceKey: "parker-duofold-penography",
      },
      {
        key: "duofold-vintage-1933-janesville-stop",
        title: "Janesville 常规生产停止",
        eventType: "discontinued",
        startDate: "1933",
        circa: false,
        description: "美国主线停止，库存与海外生产解释后续年份的实物。",
        sourceKey: "parker-duofold-penography",
      },
    ],
  },
  {
    key: "phase34-parker-duofold-geometric-v1",
    entityId: PHASE34_DUOFOLD_GEOMETRIC_ID,
    expectedType: "pen",
    expectedSlug: "the-parker-duofold-geometric-toothbrush",
    canonicalName: "Parker Duofold Geometric（1939–1940）",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/parker-duofold-geometric-publishable-content-2026-07-19.md",
    storyTitle: "Parker Duofold Geometric：solid rod 不是 Vacumatic filler",
    primarySourceKey: "parker-catalog-5550-1939",
    depthTier: "A",
    aliases: [
      {
        alias: "Parker Duofold Geometric",
        language: "en",
        sourceKey: "parker-duofold-geometric-penography",
      },
      {
        alias: "Parker Toothbrush Duofold",
        language: "en",
        sourceKey: "parker-duofold-geometric-penography",
      },
      {
        alias: "派克 Duofold 牙刷纹",
        language: "zh",
        sourceKey: "parker-duofold-geometric-penography",
      },
    ],
    sources: [
      source("parker-catalog-5550-1939"),
      source("parker-duofold-geometric-penography"),
      source("parker-duofold-striped-penography"),
      source("ravens-march-duofold"),
      source("vintagepens-care"),
      source("vintagepens-filling"),
      source("parker-duofold-geometric-diagram"),
    ],
    variants: [
      {
        key: "geometric-standard",
        name: "Geometric Standard",
        releaseYear: "1939",
        notes: "绿、灰、棕、黑；具体饰件随颜色，不能由颜色外推笔尖。",
        sourceKey: "parker-catalog-5550-1939",
        variantKind: "edition_group",
      },
      {
        key: "geometric-slender",
        name: "Geometric Slender",
        releaseYear: "1939",
        notes: "同样记录四种颜色；与 Standard 不共享单一尺寸。",
        sourceKey: "parker-catalog-5550-1939",
        variantKind: "edition_group",
      },
    ],
    scopes: [
      {
        key: "geometric-family",
        scopeKey: "parker-duofold-geometric-1939-1940",
        validFrom: "1939",
        validTo: "1940",
        productionState: "historical",
        nibScope:
          "1939 catalog states an Osmiridium-tipped 14K gold point; specimen marking and replacement history still require inspection",
        materialScope: "geometric-pattern plastic in four documented colors",
        editionScope: "Standard and Slender; excludes Striped Duofold",
      },
      {
        key: "geometric-filler",
        scopeKey: "parker-duofold-geometric-button-filler",
        validFrom: "1939",
        validTo: "1940",
        productionState: "historical",
        editionScope: "button filler with sac; Visiometer solid rod is not a Vacumatic tube",
      },
    ],
    claims: [
      {
        key: "geometric-identity",
        predicate: "model_identity",
        objectText:
          "Duofold Geometric 是 1939–1940 的短期经济型复名款，有 Standard 与 Slender、绿灰棕黑四色。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "parker-catalog-5550-1939",
        locator:
          "Catalog No. 5550 printed page 18: revived Duofold, Standard and Slender order table, black/brown/grey/green",
        evidence: [
          {
            key: "geometric-1939-catalog",
            sourceKey: "parker-catalog-5550-1939",
            scopeKey: "geometric-family",
            locator:
              "PDF page 19 / printed page 18: Mosaic-like pattern; Standard/Slender; black, brown, grey and green",
          },
          {
            key: "geometric-range",
            sourceKey: "parker-duofold-geometric-penography",
            scopeKey: "geometric-family",
            locator: "1939-1940; discontinued in early 1940",
          },
          {
            key: "geometric-independent-chronology",
            sourceKey: "ravens-march-duofold",
            scopeKey: "geometric-family",
            locator: "1939-1940 Toothbrush chapter and transition to striped family",
          },
        ],
      },
      {
        key: "geometric-visiometer-boundary",
        predicate: "filling_system_identity",
        objectText:
          "Visiometer 内部是 solid rod；实际机构为 button filler + pressure bar + rubber sac，不是 Vacumatic filler。",
        factClass: "core",
        confidence: 0.99,
        sourceKey: "parker-duofold-geometric-penography",
        locator: "Visiometer paragraph and ordinary button-filler-with-sac statement",
        evidence: [
          {
            key: "geometric-solid-rod",
            sourceKey: "parker-duofold-geometric-penography",
            scopeKey: "geometric-filler",
            locator: "fake tube is a solid rod; not a Vac-filler",
          },
          {
            key: "geometric-button-sac",
            sourceKey: "parker-duofold-geometric-penography",
            scopeKey: "geometric-filler",
            locator: "ordinary button-filler with a sac",
          },
          {
            key: "geometric-button-catalog",
            sourceKey: "parker-catalog-5550-1939",
            scopeKey: "geometric-filler",
            locator:
              "PDF page 19 / printed page 18: concealed leverless Press Button filler and Visiometer Ink Window",
          },
        ],
      },
      {
        key: "geometric-media-boundary",
        predicate: "media_identity_boundary",
        objectText:
          "主图是本站原创结构卡，只解释尺寸、颜色和上墨边界；示意图，非产品照片。",
        factClass: "editorial",
        confidence: 1,
        sourceKey: "parker-duofold-geometric-diagram",
        locator: "site-original SVG provenance",
        evidence: [
          {
            key: "geometric-diagram-not-photo",
            sourceKey: "parker-duofold-geometric-diagram",
            scopeKey: "geometric-family",
            locator: "product-photo=false; product-likeness=false",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: PHASE34_PARKER_ID,
      values: {
        series_name: "Parker Duofold Geometric / Toothbrush",
        release_year: "1939–1940",
        nib: "1939 目录为 Osmiridium-tipped 14K 金尖；刻字、状态与更换史按实物核对",
        fill_system:
          "button filler + pressure bar + rubber sac；Visiometer 为 solid rod",
        material: "几何纹塑料；Standard／Slender，绿、灰、棕、黑",
        dimensions: "两种尺寸，无可外推的统一长宽",
        status: "1940 年初停产；排除 1940–1948 Striped Duofold",
      },
      evidence: [
        {
          key: "geometric-brand",
          fieldKey: "brand_entity_id",
          sourceKey: "parker-catalog-5550-1939",
          scopeKey: "geometric-family",
          locator: "Parker Duofold catalog page and order table",
        },
        {
          key: "geometric-series",
          fieldKey: "series_name",
          sourceKey: "parker-catalog-5550-1939",
          scopeKey: "geometric-family",
          locator: "revived Duofold with Mosaic-like pattern",
        },
        {
          key: "geometric-year",
          fieldKey: "release_year",
          sourceKey: "parker-duofold-geometric-penography",
          scopeKey: "geometric-family",
          locator: "1939-1940 heading and early-1940 discontinuation",
        },
        {
          key: "geometric-nib",
          fieldKey: "nib",
          sourceKey: "parker-catalog-5550-1939",
          scopeKey: "geometric-family",
          locator: "Osmiridium tipped 14K gold point",
        },
        {
          key: "geometric-fill",
          fieldKey: "fill_system",
          sourceKey: "parker-catalog-5550-1939",
          scopeKey: "geometric-filler",
          locator: "Visiometer Ink Window and concealed leverless Press Button filler",
        },
        {
          key: "geometric-material",
          fieldKey: "material",
          sourceKey: "parker-catalog-5550-1939",
          scopeKey: "geometric-family",
          locator: "Mosaic-like pattern; Standard/Slender; black, brown, grey and green",
        },
        {
          key: "geometric-dimensions",
          fieldKey: "dimensions",
          sourceKey: "parker-catalog-5550-1939",
          scopeKey: "geometric-family",
          locator: "Standard and Slender order-table categories without dimensions",
        },
        {
          key: "geometric-status",
          fieldKey: "status",
          sourceKey: "parker-duofold-geometric-penography",
          scopeKey: "geometric-family",
          locator: "discontinued in early 1940",
        },
      ],
    },
    media: [
      {
        key: "geometric-factual-primary",
        title: "Parker Duofold Geometric 尺寸、颜色与结构示意图（非产品照片）",
        sourceKey: "parker-duofold-geometric-diagram",
        localPath:
          "/images/library/site-original/parker-duofold/parker-duofold-geometric-factual.svg",
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "Fountain Pen Graph 本站原创事实图。示意图，非产品照片；未复制或临摹 Geometric 实物纹样与结构图，不能作为鉴定证据。",
        sourceUrl:
          "/images/library/site-original/parker-duofold/parker-duofold-geometric-factual.svg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "geometric-1939-release",
        title: "Duofold Geometric 推出",
        eventType: "model_released",
        startDate: "1939",
        circa: false,
        description: "经济型复名款，Standard／Slender 与四色进入资料记录。",
        sourceKey: "parker-duofold-geometric-penography",
      },
      {
        key: "geometric-1940-stop",
        title: "Geometric 停产",
        eventType: "discontinued",
        startDate: "1940",
        circa: false,
        description: "1940 年初结束，随后进入 Striped Duofold 阶段。",
        sourceKey: "parker-duofold-geometric-penography",
      },
    ],
  },
  {
    key: "phase34-parker-striped-duofold-v1",
    entityId: PHASE34_DUOFOLD_STRIPED_ID,
    expectedType: "pen",
    expectedSlug: "the-parker-striped-duofold",
    canonicalName: "Parker Striped Duofold（1940–1948）",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/parker-striped-duofold-publishable-content-2026-07-19.md",
    storyTitle: "Parker Striped Duofold：Duovac 只指哪一条分支",
    primarySourceKey: "parker-duofold-catalog-1940",
    depthTier: "A",
    aliases: [
      {
        alias: "Parker Striped Duofold",
        language: "en",
        sourceKey: "parker-duofold-striped-penography",
      },
      {
        alias: "派克条纹 Duofold",
        language: "zh",
        sourceKey: "parker-duofold-striped-penography",
      },
    ],
    sources: [
      source("parker-duofold-catalog-1940"),
      source("parker-duofold-striped-penography"),
      source("parker-duofold-geometric-penography"),
      source("ravens-march-duofold"),
      source("vintagepens-care"),
      source("vintagepens-filling"),
      source("parker-duofold-striped-diagram"),
    ],
    variants: [
      {
        key: "striped-vac-speedline",
        name: "Striped Duofold Vacumatic — aluminium Speedline",
        releaseYear: "1940–1942",
        notes:
          "Vacumatic filler 分支；收藏界常称 Duovac，不能与 button-filler 分支混写。",
        sourceKey: "parker-duofold-striped-penography",
        variantKind: "edition_group",
      },
      {
        key: "striped-vac-plastic",
        name: "Striped Duofold Vacumatic — plastic plunger",
        releaseYear: "1942–1948",
        notes: "后期 Vacumatic filler；维修需按 diaphragm/filler unit 处理。",
        sourceKey: "parker-duofold-striped-penography",
        variantKind: "edition_group",
      },
      {
        key: "striped-button-filler",
        name: "Striped Duofold button filler",
        releaseYear: "1940–1948",
        notes:
          "传统 button + pressure bar + sac；不是 Vacumatic，目录语境可见 Sac。",
        sourceKey: "ravens-march-duofold",
        variantKind: "edition_group",
      },
      {
        key: "striped-1942-transition",
        name: "1942 transitional combinations",
        releaseYear: "1942",
        notes:
          "少量实物混见 Vacumatic imprint、clip 与 stacked-coin cap band；须整笔核验。",
        sourceKey: "parker-duofold-striped-penography",
        variantKind: "edition_group",
      },
    ],
    scopes: [
      {
        key: "striped-family",
        scopeKey: "parker-striped-duofold-1940-1948",
        validFrom: "1940",
        validTo: "1948",
        productionState: "historical",
        nibScope:
          "1940 catalog lists 14K gold nibs; blue-diamond and later bi-tone V details are version-scoped",
        materialScope: "longitudinal striped plastic in multiple colors",
        editionScope: "US striped family; filler and size branches remain separate",
      },
      {
        key: "striped-vac-scope",
        scopeKey: "parker-striped-duofold-vacumatic-fillers",
        validFrom: "1940",
        validTo: "1948",
        productionState: "historical",
        editionScope: "Vacumatic filler branch; Duovac nickname applies cleanly here",
      },
      {
        key: "striped-button-scope",
        scopeKey: "parker-striped-duofold-button-fillers",
        validFrom: "1940",
        validTo: "1948",
        productionState: "historical",
        editionScope: "button filler with rubber sac; not Vacumatic",
      },
      {
        key: "striped-transition-scope",
        scopeKey: "parker-striped-duofold-1942-transition",
        validFrom: "1942",
        validTo: "1942",
        productionState: "historical",
        editionScope: "documented mixed imprints, clips and cap-band parts",
      },
    ],
    claims: [
      {
        key: "striped-identity",
        predicate: "model_identity",
        objectText:
          "Striped Duofold 是 1940–1948 纵条纹家族；Duovac 更适合指 Vacumatic filler 分支，而不是全部条纹款。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "parker-duofold-catalog-1940",
        locator:
          "1940 Duofold catalogue: Laidtone Permanite, Sacless and Sac lines, Senior/Ingenue/Major/Debutante",
        evidence: [
          {
            key: "striped-1940-catalog",
            sourceKey: "parker-duofold-catalog-1940",
            scopeKey: "striped-family",
            locator:
              "PDF pages 2-5: Laidtone motif, Sacless and Sac Duofold listings, sizes and colors",
          },
          {
            key: "striped-range-specialist",
            sourceKey: "parker-duofold-striped-penography",
            scopeKey: "striped-family",
            locator: "Striped Duofolds 1940-1948; phase-out with Vacumatics",
          },
          {
            key: "striped-duovac-name",
            sourceKey: "ravens-march-duofold",
            scopeKey: "striped-vac-scope",
            locator: "Vacumatic versions occasionally called Duovacs; catalogues use Sac/Sacless",
          },
        ],
      },
      {
        key: "striped-filler-branches",
        predicate: "filling_system_variants",
        objectText:
          "家族包含 1940–42 aluminium Speedline、1942–48 plastic Vacumatic filler，以及独立的 button-filler + sac 路线。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "parker-duofold-catalog-1940",
        locator: "1940 catalogue Sacless and Sac Duofold sections",
        evidence: [
          {
            key: "striped-sacless-sac-catalog",
            sourceKey: "parker-duofold-catalog-1940",
            scopeKey: "striped-family",
            locator:
              "PDF pages 2-5: leverless sacless filling mechanism and separate one-stroke button-filler Sac Duofold",
          },
          {
            key: "striped-vac-fillers",
            sourceKey: "parker-duofold-striped-penography",
            scopeKey: "striped-vac-scope",
            locator: "aluminium speedline 1940-1942 and plastic Vacumatic 1942-1948",
          },
          {
            key: "striped-button-fillers",
            sourceKey: "parker-duofold-striped-penography",
            scopeKey: "striped-button-scope",
            locator: "third filler type is Duofold-style button filler",
          },
        ],
      },
      {
        key: "striped-1942-transition",
        predicate: "transitional_parts",
        objectText:
          "少量 1942 实物会混见 Vacumatic imprint、clip、stacked-coin cap band，甚至双重刻字；单一零件不能完成断代。",
        factClass: "core",
        confidence: 0.95,
        sourceKey: "parker-duofold-striped-penography",
        locator: "rare 1942 transition-items paragraph",
        evidence: [
          {
            key: "striped-transition-parts",
            sourceKey: "parker-duofold-striped-penography",
            scopeKey: "striped-transition-scope",
            locator: "Vacumatic imprint, clip, stacked-coin band and dual imprints",
          },
        ],
      },
      {
        key: "striped-media-boundary",
        predicate: "media_identity_boundary",
        objectText:
          "主图是本站原创上墨分支图，仅解释结构与过渡件；示意图，非产品照片。",
        factClass: "editorial",
        confidence: 1,
        sourceKey: "parker-duofold-striped-diagram",
        locator: "site-original SVG provenance",
        evidence: [
          {
            key: "striped-diagram-not-photo",
            sourceKey: "parker-duofold-striped-diagram",
            scopeKey: "striped-family",
            locator: "product-photo=false; product-likeness=false",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: PHASE34_PARKER_ID,
      values: {
        series_name: "Parker Striped Duofold（Duovac 仅指 Vacumatic 分支）",
        release_year: "1940–1948",
        nib: "1940 目录列 14K 金尖；blue diamond 与后期双色 V 纹只属于部分版本",
        fill_system:
          "Vacumatic（1940–42 aluminium Speedline；1942–48 plastic plunger）或 button filler + sac",
        material: "纵向条纹塑料；blue、maroon、green 与依版本出现的 black",
        dimensions:
          "多尺寸；1940 Senior 约 135 mm、Ingenue 约 125 mm 只属于对应配置",
        status: "美国历史家族；1942 有混用 Vacumatic 部件的过渡件",
      },
      evidence: [
        {
          key: "striped-brand",
          fieldKey: "brand_entity_id",
          sourceKey: "parker-duofold-catalog-1940",
          scopeKey: "striped-family",
          locator: "Parker Duofold Laidtone catalogue identity",
        },
        {
          key: "striped-series",
          fieldKey: "series_name",
          sourceKey: "parker-duofold-catalog-1940",
          scopeKey: "striped-family",
          locator: "Duofold catalogue; Laidtone motif; Sacless and Sac lines",
        },
        {
          key: "striped-year",
          fieldKey: "release_year",
          sourceKey: "parker-duofold-striped-penography",
          scopeKey: "striped-family",
          locator: "1940-1948 heading and phase-out",
        },
        {
          key: "striped-nib",
          fieldKey: "nib",
          sourceKey: "parker-duofold-catalog-1940",
          scopeKey: "striped-family",
          locator: "14K gold nib listings; Blue Diamond applies to listed top lines",
        },
        {
          key: "striped-fill-vac",
          fieldKey: "fill_system",
          sourceKey: "parker-duofold-striped-penography",
          scopeKey: "striped-vac-scope",
          locator: "aluminium and plastic Vacumatic filler periods",
        },
        {
          key: "striped-fill-button",
          fieldKey: "fill_system",
          sourceKey: "ravens-march-duofold",
          scopeKey: "striped-button-scope",
          locator: "button-filler and Vacumatic; catalogues use Sac and Sacless",
        },
        {
          key: "striped-material",
          fieldKey: "material",
          sourceKey: "parker-duofold-catalog-1940",
          scopeKey: "striped-family",
          locator: "Laidtone Permanite and blue, maroon, green, black order tables",
        },
        {
          key: "striped-dimensions",
          fieldKey: "dimensions",
          sourceKey: "parker-duofold-striped-penography",
          scopeKey: "striped-family",
          locator: "1940 Senior 135 mm and Ingenue 125 mm; additional size table",
        },
        {
          key: "striped-status",
          fieldKey: "status",
          sourceKey: "parker-duofold-striped-penography",
          scopeKey: "striped-transition-scope",
          locator: "1942 transitional parts and 1948 phase-out",
        },
      ],
    },
    media: [
      {
        key: "striped-factual-primary",
        title: "Parker Striped Duofold 两类上墨机构示意图（非产品照片）",
        sourceKey: "parker-duofold-striped-diagram",
        localPath:
          "/images/library/site-original/parker-duofold/parker-striped-duofold-factual.svg",
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "Fountain Pen Graph 本站原创事实图。示意图，非产品照片；抽象条纹不表现任何真实产品轮廓、比例或刻字，不能用于鉴定。",
        sourceUrl:
          "/images/library/site-original/parker-duofold/parker-striped-duofold-factual.svg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "striped-1940-release",
        title: "Striped Duofold 推出",
        eventType: "model_released",
        startDate: "1940",
        circa: false,
        description: "纵条纹家族接替 Geometric，并出现多尺寸与 filler 分支。",
        sourceKey: "parker-duofold-striped-penography",
      },
      {
        key: "striped-1942-transition",
        title: "上墨机构与零件过渡",
        eventType: "design_milestone",
        startDate: "1942",
        circa: false,
        description: "Vacumatic filler 转入 plastic plunger，部分实物混用刻字与饰件。",
        sourceKey: "parker-duofold-striped-penography",
      },
      {
        key: "striped-1948-stop",
        title: "美国 Striped Duofold 退场",
        eventType: "discontinued",
        startDate: "1948",
        circa: false,
        description: "专业资料把 Striped Duofold 与 Vacumatic 的退场记录在 1948。",
        sourceKey: "parker-duofold-striped-penography",
      },
    ],
  },
  {
    key: "phase34-parker-duofold-centennial-v1",
    entityId: PHASE34_DUOFOLD_CENTENNIAL_ID,
    expectedType: "pen",
    expectedSlug: "派克-parker-世纪-duofold",
    canonicalName: "Parker Duofold Classic Centennial（1987/88–）",
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile:
      ".planning/content-research/parker-duofold-centennial-publishable-content-2026-07-19.md",
    storyTitle: "Parker Duofold Classic Centennial：1987/88 与当前 SKU",
    primarySourceKey: "parker-duofold-1931375-pdp",
    depthTier: "A",
    aliases: [
      {
        alias: "Parker Duofold Classic Centennial",
        language: "en",
        sourceKey: "parker-duofold-1931375-pdp",
      },
      {
        alias: "Parker Duofold Centennial",
        language: "en",
        sourceKey: "parker-duofold-centennial-penography",
      },
      {
        alias: "派克世纪 Duofold",
        language: "zh",
        sourceKey: "parker-duofold-1931375-pdp",
      },
    ],
    sources: [
      source("parker-official-history"),
      source("parker-duofold-1931375-pdp"),
      source("parker-duofold-1931381-pdp"),
      source("parker-2026-emea-catalogue"),
      source("parker-duofold-centennial-penography"),
      source("parker-care-guide"),
      source("parker-duofold-centennial-diagram"),
    ],
    variants: [
      {
        key: "centennial-mk1",
        name: "Duofold Centennial Mk I",
        releaseYear: "1987 production / 1988 introduction",
        notes:
          "早期 14K/18K、约 137 mm 等资料只属于早期 Mk I，不外推当前 Classic。",
        sourceKey: "parker-duofold-centennial-penography",
        variantKind: "edition_group",
      },
      {
        key: "centennial-big-red-1931375",
        name: "Classic Big Red CT Fine",
        notes:
          "当前页面：Centennial Size、F、18K、red precious resin、palladium trim。",
        sourceKey: "parker-duofold-1931375-pdp",
        variantKind: "market_sku",
        productCode: "1931375",
        market: "美国现行产品页／EMEA 地区目录副本",
      },
      {
        key: "centennial-big-red-1931376",
        name: "Classic Big Red CT Medium",
        notes: "地区目录副本列 M、18K；材料由同一 Big Red Classic finish 范围说明。",
        sourceKey: "parker-2026-emea-catalogue",
        variantKind: "market_sku",
        productCode: "1931376",
        market: "2026 EMEA catalogue mirror",
      },
      {
        key: "centennial-black-1931381",
        name: "Classic Black GT Fine",
        notes:
          "当前页面：Centennial Size、F、18K、black precious resin、23K gold-plated trim。",
        sourceKey: "parker-duofold-1931381-pdp",
        variantKind: "market_sku",
        productCode: "1931381",
        market: "Parker 现行产品页／EMEA 地区目录副本",
      },
      {
        key: "centennial-black-1931382",
        name: "Classic Black GT Medium",
        notes: "地区目录副本列 M、18K；不借用另一 finish 的材料。",
        sourceKey: "parker-2026-emea-catalogue",
        variantKind: "market_sku",
        productCode: "1931382",
        market: "2026 EMEA catalogue mirror",
      },
    ],
    scopes: [
      {
        key: "centennial-family",
        scopeKey: "parker-duofold-centennial-1987-1988-present",
        validFrom: "1987",
        productionState: "current",
        nibScope: "generation-specific; current Classic is 18K, early Mk I differed",
        materialScope: "generation and finish specific",
        editionScope: "Centennial only; International excluded from current specification",
      },
      {
        key: "centennial-mk1-scope",
        scopeKey: "parker-duofold-centennial-mk1-1987-1995",
        variantKey: "centennial-mk1",
        validFrom: "1987",
        validTo: "1995",
        productionState: "historical",
        nibScope: "early 14K/18K options; 14K discontinued in March 1989",
        editionScope: "historical Mk I only; not current product specification",
      },
      {
        key: "centennial-current-classic",
        scopeKey: "parker-duofold-classic-centennial-current",
        productionState: "current",
        nibScope: "18K solid-gold bi-tonal rhodium-plated; F/M by SKU",
        materialScope: "precious resin with finish-specific palladium or 23K gold-plated trim",
        editionScope: "current Classic Centennial Size only",
      },
    ],
    claims: [
      {
        key: "centennial-chronology",
        predicate: "model_identity",
        objectText:
          "现代 Duofold Centennial 于 1987 年开始生产，1988 年为 Parker 百年正式推出；两年分别记录生产与发布节点。",
        factClass: "core",
        confidence: 0.97,
        sourceKey: "parker-duofold-centennial-penography",
        locator: "production started in 1987; officially introduced for 1888-1988 centenary",
        evidence: [
          {
            key: "centennial-production-1987",
            sourceKey: "parker-duofold-centennial-penography",
            scopeKey: "centennial-family",
            locator: "production had started already in 1987",
          },
          {
            key: "centennial-introduction-1988",
            sourceKey: "parker-duofold-centennial-penography",
            scopeKey: "centennial-family",
            locator: "officially introduced to commemorate Parker 1888-1988 centenary",
          },
        ],
      },
      {
        key: "centennial-current-sku-matrix",
        predicate: "current_sku_specification",
        objectText:
          "当前 Classic 只记录 Centennial Size：Big Red 1931375/76 与 Black GT 1931381/82 为 F/M 18K；材料与饰件按 finish 分开。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "parker-duofold-1931375-pdp",
        locator: "current product page and 2026 EMEA catalogue-mirror cross-check",
        evidence: [
          {
            key: "centennial-big-red-current",
            sourceKey: "parker-duofold-1931375-pdp",
            scopeKey: "centennial-current-classic",
            locator: "1931375; Centennial Size; Fine; 18K; red resin; palladium trim",
          },
          {
            key: "centennial-black-current",
            sourceKey: "parker-duofold-1931381-pdp",
            scopeKey: "centennial-current-classic",
            locator: "1931381; Centennial Size; Fine; 18K; black resin; 23K gold-plated trim",
          },
          {
            key: "centennial-current-catalogue-matrix",
            sourceKey: "parker-2026-emea-catalogue",
            scopeKey: "centennial-current-classic",
            locator: "1931375/76 and 1931381/82; F/M; FP 18K; Centennial only",
          },
        ],
      },
      {
        key: "centennial-current-dimension-boundary",
        predicate: "dimension_scope",
        objectText:
          "目前官网能确认 Centennial Size，但当前产品页与 2026 EMEA 地区目录副本没有给出精确长宽、重量或容量；早期 Mk I 数字不外推。",
        factClass: "core",
        confidence: 0.98,
        sourceKey: "parker-duofold-1931375-pdp",
        locator: "Centennial Size phrase and current specification fields",
        evidence: [
          {
            key: "centennial-current-size-only",
            sourceKey: "parker-duofold-1931375-pdp",
            scopeKey: "centennial-current-classic",
            locator: "Centennial Size; no current exact dimensions or weight fields",
          },
          {
            key: "centennial-mk1-historical-dimensions",
            sourceKey: "parker-duofold-centennial-penography",
            scopeKey: "centennial-mk1-scope",
            locator: "137 mm and 14.8 mm are presented in early Centennial/International context",
            note: "Historical evidence retained only to prevent reuse as a current specification.",
          },
        ],
      },
      {
        key: "centennial-media-boundary",
        predicate: "media_identity_boundary",
        objectText:
          "主图是本站原创时间线与 SKU 卡，不表现真实钢笔；示意图，非产品照片。",
        factClass: "editorial",
        confidence: 1,
        sourceKey: "parker-duofold-centennial-diagram",
        locator: "site-original SVG provenance",
        evidence: [
          {
            key: "centennial-diagram-not-photo",
            sourceKey: "parker-duofold-centennial-diagram",
            scopeKey: "centennial-current-classic",
            locator: "product-photo=false; product-likeness=false",
          },
        ],
      },
    ],
    spec: {
      brandEntityId: PHASE34_PARKER_ID,
      values: {
        series_name: "Parker Duofold Classic Centennial",
        release_year: "1987 production / 1988 centenary introduction",
        nib: "当前 Classic：18K 双色镀铑笔尖；F/M 按 SKU",
        fill_system:
          "Parker cartridge / converter；是否随附 converter 依市场与包装",
        material:
          "当前 Classic precious resin；Big Red CT 为 red/palladium，Black GT 为 black/23K gold-plated trim",
        dimensions:
          "当前官方只确认 Centennial Size；未公开精确长宽、重量或容量",
        status: "现行 Classic Centennial；排除 International 与三个 vintage 家族",
      },
      evidence: [
        {
          key: "centennial-brand",
          fieldKey: "brand_entity_id",
          sourceKey: "parker-official-history",
          scopeKey: "centennial-family",
          locator: "official Parker Duofold lineage",
        },
        {
          key: "centennial-series",
          fieldKey: "series_name",
          sourceKey: "parker-duofold-1931375-pdp",
          scopeKey: "centennial-current-classic",
          locator: "Duofold Classic and Centennial Size product identity",
        },
        {
          key: "centennial-year",
          fieldKey: "release_year",
          sourceKey: "parker-duofold-centennial-penography",
          scopeKey: "centennial-family",
          locator: "1987 production and 1988 centenary introduction",
        },
        {
          key: "centennial-nib-pdp",
          fieldKey: "nib",
          sourceKey: "parker-duofold-1931375-pdp",
          scopeKey: "centennial-current-classic",
          locator: "18K solid gold bi-tonal rhodium-plated Fine nib",
        },
        {
          key: "centennial-nib-catalogue",
          fieldKey: "nib",
          sourceKey: "parker-2026-emea-catalogue",
          scopeKey: "centennial-current-classic",
          locator: "Classic SKU matrix: FP 18K F/M",
        },
        {
          key: "centennial-fill",
          fieldKey: "fill_system",
          sourceKey: "parker-care-guide",
          scopeKey: "centennial-current-classic",
          locator: "current Parker cartridge/converter filling and cleaning guidance",
        },
        {
          key: "centennial-material-red",
          fieldKey: "material",
          sourceKey: "parker-duofold-1931375-pdp",
          scopeKey: "centennial-current-classic",
          locator: "1931375 Big Red precious resin and palladium-finished trims",
        },
        {
          key: "centennial-material-black",
          fieldKey: "material",
          sourceKey: "parker-duofold-1931381-pdp",
          scopeKey: "centennial-current-classic",
          locator: "1931381 black precious resin and 23K gold-plated trims",
        },
        {
          key: "centennial-dimensions",
          fieldKey: "dimensions",
          sourceKey: "parker-duofold-1931375-pdp",
          scopeKey: "centennial-current-classic",
          locator: "Centennial Size only; no exact current dimensions or weight",
        },
        {
          key: "centennial-status",
          fieldKey: "status",
          sourceKey: "parker-duofold-1931375-pdp",
          scopeKey: "centennial-current-classic",
          locator: "current Duofold Classic product page",
        },
      ],
    },
    media: [
      {
        key: "centennial-factual-primary",
        title: "Parker Duofold Classic Centennial 时间与 SKU 示意图（非产品照片）",
        sourceKey: "parker-duofold-centennial-diagram",
        localPath:
          "/images/library/site-original/parker-duofold/parker-duofold-centennial-factual.svg",
        author: "Fountain Pen Graph editorial",
        license: "site-original",
        attributionText:
          "Fountain Pen Graph 本站原创事实图。示意图，非产品照片；未复制或临摹产品轮廓、Ace 图案、箭形夹、刻字与饰面，不能作为鉴定证据。",
        sourceUrl:
          "/images/library/site-original/parker-duofold/parker-duofold-centennial-factual.svg",
        usageStatus: "primary",
      },
    ],
    timeline: [
      {
        key: "centennial-1987-production",
        title: "Centennial 开始生产",
        eventType: "design_milestone",
        startDate: "1987",
        circa: false,
        description: "专业资料记录首批生产在 Parker 百年正式推出前已开始。",
        sourceKey: "parker-duofold-centennial-penography",
      },
      {
        key: "centennial-1988-introduction",
        title: "Centennial 为 Parker 百年正式推出",
        eventType: "model_released",
        startDate: "1988",
        circa: false,
        description: "以 1888–1988 百年为正式发布语境。",
        sourceKey: "parker-duofold-centennial-penography",
      },
    ],
  },
];
