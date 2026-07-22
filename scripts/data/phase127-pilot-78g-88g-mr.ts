import type {
  CuratedEntityPack,
  CuratedSource,
  LoadedCuratedEntityPack,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { loadCuratedEntityPack } from "../lib/curated-content-pack";

export const PHASE127_PILOT_ID = "Zt-PbXkE7UHM";
export const PHASE127_78G_ID = "lOgSh4vuQsFK";
export const PHASE127_78G_RAW_SLUG = "百乐-pilot-78g-78g";
export const PHASE127_78G_RAW_NAME = "百乐 Pilot 78G/78G+";
export const PHASE127_78G_SLUG = "pilot-78g-fp-78g";
export const PHASE127_78G_NAME = "百乐 Pilot 78G / FP-78G";
export const PHASE127_78G_MADE_BY_ID = "6IWV9yeB5Ppo";
export const PHASE127_78G_REVERSE_ID = "rev-6IWV9yeB5Ppo";

export const PHASE127_88G_ARTICLE_ID = "2GM0UtshoSVw";
export const PHASE127_88G_RAW_SLUG = "百乐-pilot-88g";
export const PHASE127_88G_RAW_NAME = "百乐 Pilot 88G";
export const PHASE127_88G_ARTICLE_SLUG = "pilot-88g-mr-guide";
export const PHASE127_88G_ARTICLE_NAME = "百乐 Pilot 88G / MR 系列导览";
export const PHASE127_88G_LEGACY_MADE_BY_ID = "G2BD8Zsg8gp0";
export const PHASE127_88G_LEGACY_REVERSE_ID = "rev-G2BD8Zsg8gp0";

const RETRIEVED = "2026-07-22";
const OFFICIAL_78G = "https://www.pilotpen.com.cn/p/101.html";
const OFFICIAL_MR1 = "https://www.pilotpen.com.cn/p/104.html";
const OFFICIAL_MR2 = "https://www.pilotpen.com.cn/p/105.html";
const OFFICIAL_MR3 = "https://www.pilotpen.com.cn/p/106.html";
const OFFICIAL_LIST = "https://www.pilotpen.com.cn/product/6.html?page=5";
const OFFICIAL_AU = "https://pilotpen.com.au/ranges/mr";
const OFFICIAL_EU =
  "https://www.pilotpen.eu/wp-content/uploads/2024/01/pilot_catalogue_eu_2024.pdf";
const OFFICIAL_BR =
  "https://www.pilotpen.com.br/produtos/mr-retro-pop-collection/";
const CON40_MANUAL =
  "https://www.pilot.co.jp/support/warranty/en/warranty_assets/pdf/fountain_con40_en.pdf";

export interface Phase127Variant {
  key: string;
  name: string;
  code: string;
}

interface Line {
  key: "78g" | "mr1" | "mr2" | "mr3";
  entityId: string;
  slug: string;
  name: string;
  model: string;
  series: string;
  markdown: string;
  svg: string;
  officialUrl: string;
  officialTitle: string;
  officialLocator: string;
  aliases: Array<{ alias: string; language: string; kind?: "regional_name" }>;
  variants: Phase127Variant[];
  nib: string;
  fill: string;
  material: string;
  dimensions?: string;
  weight?: string;
  professional: CuratedSource;
  professionalObject: string;
  regional?: CuratedSource;
}

function source(
  input: Omit<
    CuratedSource,
    "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
  > & { locator: string },
): CuratedSource {
  const { locator, ...value } = input;
  return {
    ...value,
    retrievedAt: RETRIEVED,
    allowedUse:
      value.sourceType === "user_submission" ? "store_full" : "summary_only",
    archiveUrl: value.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${locator}`,
  };
}

const pilotChina = {
  registryKey: "pilot-china-official-phase127",
  registryName: "Pilot Pen (Shenzhen) Co., Ltd.",
  sourceType: "official" as const,
  tier: "primary" as const,
  independenceGroup: "pilot-official",
  homepageUrl: "https://www.pilotpen.com.cn/",
  author: "Pilot Pen (Shenzhen) Co., Ltd.",
};

function official(
  key: string,
  title: string,
  url: string,
  summary: string,
  locator: string,
): CuratedSource {
  return source({
    ...pilotChina,
    key,
    title,
    url,
    publishedAt: null,
    summary,
    locator,
  });
}

function professional(
  key: string,
  title: string,
  url: string,
  author: string,
  publishedAt: string,
  summary: string,
  locator: string,
): CuratedSource {
  return source({
    key,
    registryKey: key.includes("ilpennofilo")
      ? "ilpennofilo-phase127"
      : "pen-addict-phase127",
    registryName: key.includes("ilpennofilo")
      ? "Il Pennofilo"
      : "The Pen Addict",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: key.includes("ilpennofilo")
      ? "ilpennofilo"
      : "pen-addict",
    title,
    url,
    homepageUrl: new URL(url).origin,
    author,
    publishedAt,
    summary,
    locator,
  });
}

const listing = official(
  "phase127-pilot-china-fountain-list",
  "Pilot China fountain pens and ink catalogue page 5",
  OFFICIAL_LIST,
  "Current official listing contains FP-MR3 and FP-78G as separate fountain-pen entries.",
  "listing lines 44-48: FP-MR3 and FP-78G entries",
);

const con40 = source({
  key: "phase127-pilot-con40-manual",
  registryKey: "pilot-support-phase127",
  registryName: "PILOT official support",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "pilot-official",
  title: "PILOT CON-40 instructions",
  url: CON40_MANUAL,
  homepageUrl: "https://www.pilot.co.jp/support/manual/fountain/",
  author: "PILOT Corporation",
  publishedAt: null,
  summary:
    "Official converter installation, filling and water-cleaning instructions; no finish-durability claim.",
  locator: "CON-40 installation, filling and water-cleaning sequence",
});

const australia = source({
  key: "phase127-pilot-australia-mr-range",
  registryKey: "pilot-australia-phase127",
  registryName: "Pilot Pen Australia",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "pilot-official",
  title: "MR Premium Range",
  url: OFFICIAL_AU,
  homepageUrl: "https://pilotpen.com.au/",
  author: "Pilot Pen Australia",
  publishedAt: null,
  summary:
    "Official regional page says MR is also known as Metropolitan and separates MR1 Classic, MR2 Animal Print and MR3 Retro Pop.",
  locator: "MR Range intro and MR1/MR2/MR3 collection headings",
});

const europe = source({
  key: "phase127-pilot-europe-mr-catalogue",
  registryKey: "pilot-europe-phase127",
  registryName: "Pilot Pen Europe",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "pilot-official",
  title: "PILOT Europe catalogue 2024 — MR Animal Collection",
  url: OFFICIAL_EU,
  homepageUrl: "https://www.pilotpen.eu/",
  author: "Pilot Pen Europe",
  publishedAt: "2024",
  summary:
    "Official European MR Animal catalogue specifies metal barrel, stainless-steel nib and DIN cartridge; DIN compatibility stays region-scoped.",
  locator: "MR Animal Collection page: FD-MR2-M, metal barrel, stainless steel nib, DIN cartridge",
});

const brazil = source({
  key: "phase127-pilot-brazil-mr3",
  registryKey: "pilot-brazil-phase127",
  registryName: "Pilot Pen do Brasil",
  sourceType: "official",
  tier: "primary",
  independenceGroup: "pilot-official",
  title: "MR Retro Pop Collection FP-MR3",
  url: OFFICIAL_BR,
  homepageUrl: "https://www.pilotpen.com.br/",
  author: "Pilot Pen do Brasil",
  publishedAt: null,
  summary:
    "Official regional FP-MR3 page lists six Retro Pop patterns, Pilot IC-100/CON-40 and a 30 g regional-page weight.",
  locator: "FP-MR3 heading; six colours; IC-100 and CON-40; 30 g",
});

const lines: readonly Line[] = [
  {
    key: "78g",
    entityId: PHASE127_78G_ID,
    slug: PHASE127_78G_SLUG,
    name: PHASE127_78G_NAME,
    model: "FP-78G",
    series: "Pilot 78G / FP-78G",
    markdown: ".planning/content-research/pilot-78g-fp-78g-phase127.md",
    svg: "/images/library/site-original/phase127/pilot/pilot-78g-fp-78g.svg",
    officialUrl: OFFICIAL_78G,
    officialTitle: "78G Fountain Pen FP-78G",
    officialLocator:
      "lines 42-96: FP-78G, resin, EF/F/M/B, ten colours, included CON-40 and Pilot cartridges",
    aliases: [
      { alias: "Pilot 78G", language: "en" },
      { alias: "Pilot 78G+", language: "en", kind: "regional_name" },
      { alias: "百乐 78G", language: "zh" },
    ],
    variants: [
      ["black-b", "Black B 黑", "FP-78G-B"],
      ["red-r", "Red R 红", "FP-78G-R"],
      ["blue-l", "Blue L 蓝", "FP-78G-L"],
      ["green-g", "Green G 绿", "FP-78G-G"],
      ["olive-ol", "Olive OL 橄榄绿", "FP-78G-OL"],
      ["blue-grey-lgy", "Blue Grey LGY 蓝灰", "FP-78G-LGY"],
      ["pink-pp", "Pastel Pink PP 嫩粉", "FP-78G-PP"],
      ["green-pg", "Pastel Green PG 嫩绿", "FP-78G-PG"],
      ["clear-nc", "Clear NC 透明", "FP-78G-NC"],
      ["white-w", "White W 白", "FP-78G-W"],
    ].map(([key, name, code]) => ({ key, name, code })),
    nib: "gold-colour alloy nib; EF / F / M / B",
    fill: "Pilot cartridges; CON-40 included on current China page",
    material: "resin body",
    dimensions:
      "one disclosed 2022 78G+ F sample: 135 mm capped, 123 mm uncapped, 149 mm posted",
    weight: "one disclosed 2022 78G+ F sample: 12.40 g filled",
    professional: professional(
      "phase127-ilpennofilo-78gplus",
      "PILOT 78 G+ <F>",
      "https://www.ilpennofilo.it/wp-content/uploads/2022/01/PILOT-78-G.pdf",
      "Il Pennofilo editorial",
      "2022-01",
      "Measured one 78G+ F sample and compared it with the original 78G; measurements and feel are sample-scoped.",
      "PDF pages 2-3: CON-40, nib, sample measurements/weight and old/new comparison",
    ),
    professionalObject:
      "One 2022 78G+ F sample documents measurements and old/new differences; writing feel and dimensions remain specimen-scoped.",
  },
  {
    key: "mr1",
    entityId: "phase127-pilot-88g-mr1",
    slug: "pilot-88g-mr1-fp-mr1",
    name: "百乐 Pilot 88G MR1 Classic / FP-MR1",
    model: "FP-MR1",
    series: "Pilot 88G MR1 Classic",
    markdown: ".planning/content-research/pilot-88g-mr1-phase127.md",
    svg: "/images/library/site-original/phase127/pilot/pilot-88g-mr1-fp-mr1.svg",
    officialUrl: OFFICIAL_MR1,
    officialTitle: "88G Fountain Pen MR1 FP-MR1",
    officialLocator:
      "lines 42-89: FP-MR1, metal matte body, F/M, SIP/SID/GDP/GDZ/BP, Pilot cartridges and CON-40",
    aliases: [
      { alias: "Pilot 88G MR1", language: "en" },
      { alias: "Pilot MR1 Classic", language: "en", kind: "regional_name" },
      { alias: "Pilot Metropolitan Black Plain", language: "en", kind: "regional_name" },
    ],
    variants: [
      ["sip", "Silver Plain SIP 银色平纹", "FP-MR1-SIP"],
      ["sid", "Silver Dots SID 银色波点", "FP-MR1-SID"],
      ["gdp", "Gold Plain GDP 金色平纹", "FP-MR1-GDP"],
      ["gdz", "Gold Grid GDZ 金色格纹", "FP-MR1-GDZ"],
      ["bp", "Black Plain BP 黑色平纹", "FP-MR1-BP"],
    ].map(([key, name, code]) => ({ key, name, code })),
    nib: "special-alloy nib; F / M",
    fill: "China FP-MR1: Pilot cartridges / CON-40",
    material: "metal body; matte surface",
    professional: professional(
      "phase127-penaddict-mr1",
      "Pilot Metropolitan Fountain Pen Review",
      "https://www.penaddict.com/blog/2013/6/10/pilot-metropolitan-fountain-pen-review",
      "Brad Dowdy",
      "2013-06-10",
      "One disclosed US Black Plain Metropolitan Medium sample; weight, nib and step observations are sample-only.",
      "title/date; Black Plain body; M sample; metal weight and barrel-step observations; JetPens disclosure",
    ),
    professionalObject:
      "One US Black Plain Metropolitan Medium sample records metal weight, smoothness and barrel-step comfort; packaging remains market-specific.",
    regional: australia,
  },
  {
    key: "mr2",
    entityId: "phase127-pilot-88g-mr2",
    slug: "pilot-88g-mr2-fp-mr2",
    name: "百乐 Pilot 88G MR2 Animal / FP-MR2",
    model: "FP-MR2",
    series: "Pilot 88G MR2 Animal",
    markdown: ".planning/content-research/pilot-88g-mr2-phase127.md",
    svg: "/images/library/site-original/phase127/pilot/pilot-88g-mr2-fp-mr2.svg",
    officialUrl: OFFICIAL_MR2,
    officialTitle: "88G Fountain Pen MR2 FP-MR2",
    officialLocator:
      "lines 42-77: FP-MR2, metal matte body, F/M, LZD/LPD/WTG/CDL/PTN, Pilot cartridges and CON-40",
    aliases: [
      { alias: "Pilot 88G MR2", language: "en" },
      { alias: "Pilot MR2 Animal", language: "en", kind: "regional_name" },
      { alias: "Pilot Metropolitan Animal", language: "en", kind: "regional_name" },
    ],
    variants: [
      ["lzd", "Lizard LZD 灰色蜥蜴", "FP-MR2-LZD"],
      ["lpd", "Leopard LPD 紫色豹纹", "FP-MR2-LPD"],
      ["wtg", "White Tiger WTG 白色虎纹", "FP-MR2-WTG"],
      ["cdl", "Crocodile CDL 黑色鳄纹", "FP-MR2-CDL"],
      ["ptn", "Python PTN 银色蟒纹", "FP-MR2-PTN"],
    ].map(([key, name, code]) => ({ key, name, code })),
    nib: "special-alloy nib; F / M",
    fill: "China FP-MR2: Pilot cartridges / CON-40",
    material: "metal body; matte surface; printed animal-pattern accent",
    professional: professional(
      "phase127-penaddict-mr2",
      "Pilot Metropolitan White Tiger Fountain Pen Review",
      "https://www.penaddict.com/blog/2015/6/24/pilot-metropolitan-white-tiger-fountain-pen-review",
      "Jeff Abbott",
      "2015-06-24",
      "One US White Tiger Fine sample; metal-body, nib and use observations are sample-only.",
      "title/date; White Tiger F sample; metal body and use observations",
    ),
    professionalObject:
      "One US White Tiger Fine sample records metal-body balance and nib use; China converter and line-wide feel are not inferred.",
    regional: europe,
  },
  {
    key: "mr3",
    entityId: "phase127-pilot-88g-mr3",
    slug: "pilot-88g-mr3-fp-mr3",
    name: "百乐 Pilot 88G MR3 Retro Pop / FP-MR3",
    model: "FP-MR3",
    series: "Pilot 88G MR3 Retro Pop",
    markdown: ".planning/content-research/pilot-88g-mr3-phase127.md",
    svg: "/images/library/site-original/phase127/pilot/pilot-88g-mr3-fp-mr3.svg",
    officialUrl: OFFICIAL_MR3,
    officialTitle: "88G Fountain Pen MR3 FP-MR3",
    officialLocator:
      "lines 42-91: FP-MR3, metal matte body, F/M, DT/WV/FL/MB/EP/HT, Pilot cartridges and CON-40",
    aliases: [
      { alias: "Pilot 88G MR3", language: "en" },
      { alias: "Pilot MR3 Retro Pop", language: "en", kind: "regional_name" },
      { alias: "Pilot Metropolitan Retro Pop", language: "en", kind: "regional_name" },
    ],
    variants: [
      ["dt", "Dots DT 浅蓝圆点", "FP-MR3-DT"],
      ["wv", "Wave WV 红色波纹", "FP-MR3-WV"],
      ["fl", "Flower FL 橙色花朵", "FP-MR3-FL"],
      ["mb", "Marble MB 浅绿大理石", "FP-MR3-MB"],
      ["ep", "Ellipse EP 紫色圆圈", "FP-MR3-EP"],
      ["ht", "Houndstooth HT 灰色千鸟格", "FP-MR3-HT"],
    ].map(([key, name, code]) => ({ key, name, code })),
    nib: "special-alloy nib; F / M",
    fill: "China FP-MR3: Pilot cartridges / CON-40",
    material: "metal body; matte surface; Retro Pop patterned accent",
    weight: "Pilot Brazil regional FP-MR3 page: 30.0 g",
    professional: professional(
      "phase127-penaddict-mr3",
      "The Pilot Metropolitan Retro Pop: A Review",
      "https://www.penaddict.com/blog/2015/11/27/the-pilot-metropolitan-mr-retro-pop-a-review",
      "Susan M. Pigott",
      "2015-11-27",
      "One disclosed US turquoise Fine sample; 26 g, grip and use observations remain sample-only.",
      "title/date; turquoise F sample; 26 g and dimensions; Goulet purchase disclosure",
    ),
    professionalObject:
      "One US turquoise Retro Pop Fine sample records 26 g and grip/use observations; regional specifications remain separate.",
    regional: brazil,
  },
] as const;

export const PHASE127_LINES = lines;
export const PHASE127_MR_LINES = lines.filter((line) => line.key !== "78g");
export const PHASE127_NEW_MR_IDS = PHASE127_MR_LINES.map(
  (line) => line.entityId,
);
export const PHASE127_NEW_MADE_BY_IDS = PHASE127_MR_LINES.map(
  (line) => `phase127-pilot-${line.key}-made-by`,
);
export const PHASE127_NEW_REVERSE_IDS = PHASE127_NEW_MADE_BY_IDS.map(
  (id) => `rev-${id}`,
);

function diagram(line: Line): CuratedSource {
  return source({
    key: `phase127-${line.key}-diagram`,
    registryKey: "fountain-pen-graph-editorial-phase127",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase127",
    title: `${line.model} product boundary map`,
    url: line.svg,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    publishedAt: RETRIEVED,
    summary: `Original factual SVG mapping ${line.model} variants and evidence boundaries.`,
    license: "site-original",
    locator: `project-public-asset:${line.svg};site-original=true;factual-svg=true;non-photo=true;non-logo=true;not-to-scale=true;not-colour-proof=true;not-finish-proof=true;dimensions=1600x900`,
  });
}

function evidence(
  fieldKey: SpecFieldKey,
  key: string,
  sourceKey: string,
  scopeKey: string,
  locator: string,
  qualifies = true,
) {
  return { fieldKey, key, sourceKey, scopeKey, locator, qualifies };
}

function buildPack(line: Line): CuratedEntityPack {
  const exact = official(
    `phase127-${line.key}-official`,
    line.officialTitle,
    line.officialUrl,
    `Official exact China product page for ${line.model}, nib, material, variants and filling compatibility.`,
    line.officialLocator,
  );
  const art = diagram(line);
  const currentScope = `phase127-${line.key}-china-current`;
  const sampleScope = `phase127-${line.key}-sample`;
  const regionalScope = `phase127-${line.key}-regional`;
  const sources = [exact, listing, con40, line.professional, art];
  if (line.regional) sources.splice(3, 0, line.regional);
  const values = {
    series_name: line.series,
    origin_country: "Pilot regional product; China exact page is specification authority",
    nib: line.nib,
    fill_system: line.fill,
    material: line.material,
    ...(line.dimensions ? { dimensions: line.dimensions } : {}),
    ...(line.weight ? { weight: line.weight } : {}),
    status: `Current official China product page checked ${RETRIEVED}`,
  };
  return {
    key: `phase127-pilot-${line.key}-v1`,
    entityId: line.entityId,
    expectedType: "pen",
    expectedSlug: line.slug,
    canonicalName: line.name,
    publicationIntent: "publish",
    publicationBlockers: [],
    markdownFile: line.markdown,
    storyTitle: `${line.name}：产品号、地区与样本边界`,
    primarySourceKey: exact.key,
    depthTier: "A",
    aliases: line.aliases.map((alias) => ({
      ...alias,
      sourceKey: alias.alias === "Pilot 78G+"
        ? line.professional.key
        : alias.kind === "regional_name" && line.regional
          ? line.regional.key
          : exact.key,
      market: alias.kind === "regional_name" ? "regional usage" : null,
    })),
    sources,
    scopes: [
      {
        key: currentScope,
        scopeKey: currentScope,
        market: "China / Pilot official",
        validFrom: RETRIEVED,
        productionState: "current",
        nibScope: line.nib,
        materialScope: line.material,
        editionScope: line.variants.map((variant) => variant.code).join("; "),
      },
      {
        key: sampleScope,
        scopeKey: sampleScope,
        market: "disclosed professional sample",
        validFrom: line.professional.publishedAt,
        validTo: line.professional.publishedAt,
        productionState: "historical",
        editionScope: "One sample only; feel, dimensions and packaging do not become line-wide facts.",
      },
      ...(line.regional
        ? [{
            key: regionalScope,
            scopeKey: regionalScope,
            market: "official non-China regional page",
            validFrom: line.regional.publishedAt ?? RETRIEVED,
            productionState: "current" as const,
            editionScope: "Regional naming or compatibility only; China exact specifications remain separate.",
          }]
        : []),
    ],
    claims: [
      {
        key: `${line.key}-identity`,
        predicate: "model_identity",
        objectText: `${line.model} is one exact Pilot China product line with ${line.variants.length} listed coded variants.`,
        factClass: "core",
        confidence: 0.99,
        sourceKey: exact.key,
        locator: line.officialLocator,
        evidence: [{
          key: `${line.key}-identity-evidence`,
          sourceKey: exact.key,
          scopeKey: currentScope,
          locator: line.officialLocator,
        }],
      },
      {
        key: `${line.key}-sample`,
        predicate: "independent_sample_boundary",
        objectText: line.professionalObject,
        factClass: "core",
        confidence: 0.92,
        sourceKey: line.professional.key,
        locator: line.professional.archiveLocator ?? line.professional.summary,
        evidence: [{
          key: `${line.key}-sample-evidence`,
          sourceKey: line.professional.key,
          scopeKey: sampleScope,
          locator: line.professional.archiveLocator ?? line.professional.summary,
        }],
      },
    ],
    variants: line.variants.map((variant) => ({
      key: variant.key,
      name: variant.name,
      notes: `${line.model} official coded colour/pattern; diagram is not colour or finish proof.`,
      sourceKey: exact.key,
      variantKind: "color",
      productCode: variant.code,
      market: "China / Pilot official",
    })),
    spec: {
      brandEntityId: PHASE127_PILOT_ID,
      values,
      evidence: [
        evidence("brand_entity_id", `${line.key}-brand`, exact.key, currentScope, "Pilot official exact product page"),
        evidence("series_name", `${line.key}-series`, exact.key, currentScope, `${line.model} heading`),
        evidence("origin_country", `${line.key}-origin`, exact.key, currentScope, "Pilot China exact product authority"),
        evidence("nib", `${line.key}-nib`, exact.key, currentScope, line.nib),
        evidence("fill_system", `${line.key}-fill`, exact.key, currentScope, line.fill),
        evidence("material", `${line.key}-material`, exact.key, currentScope, line.material),
        ...(line.dimensions
          ? [evidence("dimensions", `${line.key}-dimensions`, line.professional.key, sampleScope, line.dimensions)]
          : []),
        ...(line.weight
          ? [evidence("weight", `${line.key}-weight`, line.key === "mr3" ? brazil.key : line.professional.key, line.key === "mr3" ? regionalScope : sampleScope, line.weight)]
          : []),
        evidence("status", `${line.key}-status`, exact.key, currentScope, `live exact product page checked ${RETRIEVED}`),
        evidence("nib", `${line.key}-sample-rejected`, line.professional.key, sampleScope, "sample feel rejected as line-wide performance", false),
      ],
    },
    timeline: [{
      key: `${line.key}-catalog-check`,
      title: `${line.model} official China catalogue state checked`,
      eventType: "design_milestone",
      startDate: RETRIEVED,
      circa: false,
      description: `${line.variants.length} exact coded variants; current status is a dated snapshot.`,
      sourceKey: exact.key,
    }],
    media: [{
      key: `${line.key}-primary`,
      title: `${line.model} product boundary map（非产品照片）`,
      sourceKey: art.key,
      localPath: line.svg,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText:
        "site-original factual SVG；non-photo、non-logo、not-to-scale、not-colour-proof、not-finish-proof。",
      sourceUrl: line.svg,
      usageStatus: "primary",
    }],
  };
}

export const phase127Packs = lines.map(buildPack);

export function loadPhase127Packs(
  workspaceRoot: string,
): LoadedCuratedEntityPack[] {
  return phase127Packs.map((pack) => loadCuratedEntityPack(workspaceRoot, pack));
}

export const phase127Article = {
  entityId: PHASE127_88G_ARTICLE_ID,
  slug: PHASE127_88G_ARTICLE_SLUG,
  name: PHASE127_88G_ARTICLE_NAME,
  markdown: ".planning/content-research/pilot-88g-mr-guide-phase127.md",
  svg: "/images/library/site-original/phase127/pilot/pilot-88g-mr-guide.svg",
  aliases: ["Pilot 88G", "Pilot MR fountain pen range", "百乐 88G / MR 系列"],
  sourceMarkerPrefix: "curated-content:phase127-pilot-88g-mr-guide-v1:",
} as const;
