import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase354ScriboPiumaPacks } from "./phase354-scribo-piuma";

export const PHASE355_SCRIBO_BRAND_ID = "phase140-brand-scribo";
export const PHASE355_FLOW_TEMPO_ID = "phase355-scribo-flow-tempo";
export const PHASE355_FLOW_TEMPO_SLUG = "scribo-flow-tempo";
const RETRIEVED = "2026-08-02";
const SCOPE = "phase355-scribo-flow-tempo-scope";

function web(input: {
  key: string;
  title: string;
  url: string;
  summary: string;
  locator: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  registryKey: string;
  registryName: string;
  homepageUrl?: string;
  author?: string;
  publishedAt?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  const official = sourceType === "official";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? (official ? "primary" : "professional_secondary"),
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: input.homepageUrl ?? (official ? "https://www.scritturabolognese.com/en/" : input.url),
    itemType: sourceType === "user_submission" ? "image" : "web_page",
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    allowedUse: sourceType === "user_submission" ? "store_full" : "summary_only",
    license: sourceType === "user_submission" ? "site-original" : undefined,
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: sourceType === "user_submission"
      ? `project-public-asset:${input.url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`
      : `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
): CuratedClaim {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.98 : 0.94,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, scopeKey: SCOPE, locator }],
  };
}

function specEvidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  officialFlow: web({
    key: "phase355-scribo-flow-tempo-official",
    title: "FLOW Tempo — SCRIBO official product page",
    url: "https://www.scritturabolognese.com/en/negozio/fountain-pens/flow-en/flow-tempo-2/",
    summary:
      "SCRIBO 官方 FLOW Tempo 页将 Tempo 与 Armonia 放在 FLOW collection 开端，列出 24 面手工 matte ebonite、铂色饰件、深青黑纹理、88 支限量、活塞、18K 标准或 14K Extra-Flexible 金尖、6.50 mm 双毛细 ebonite feed、1.42 ml、150 mm、最大径 16.20 mm 与 33.50 g；页面当前显示 Coming Soon，库存状态不外推。",
    locator: "FLOW introduction, product description, technical sheet, nib/feed, loading capacity, dimensions, weight and edition fields",
    registryKey: "scribo-official-phase355",
    registryName: "SCRIBO – Scrittura Bolognese",
  }),
  category: web({
    key: "phase355-scribo-flow-category",
    title: "Fountain Pens archive — SCRIBO official",
    url: "https://www.scritturabolognese.com/en/categoria-prodotto/fountain-pens/",
    summary:
      "官方分类页并列展示 PIUMA、FEEL、FLOW 与 LA DOTTA；用于锁定 FLOW 是独立 collection，不把 Tempo 并入 FEEL 或 Piuma。",
    locator: "fountain-pen category navigation and collection entries",
    registryKey: "scribo-official-phase355",
    registryName: "SCRIBO – Scrittura Bolognese",
  }),
  about: web({
    key: "phase355-scribo-about",
    title: "About us — SCRIBO official",
    url: "https://www.scritturabolognese.com/en/about-us/",
    summary:
      "官方 About 页提供 SCRIBO 的 Bologna 当代身份、2016 年后新项目背景及金尖／ebonite feed 的制造范围；不把 OMAS 的法人、保修或零件连续性倒推到 SCRIBO。",
    locator: "company history, Bologna identity and nib/feed manufacturing context",
    registryKey: "scribo-official-phase355",
    registryName: "SCRIBO – Scrittura Bolognese",
  }),
  secondary: web({
    key: "phase355-scribo-flow-tempo-deliberate-objects",
    title: "Revisiting Scribos: urushi, Flow and le Stelle — Deliberate Objects",
    url: "https://www.deliberateobjects.com/revisiting-scribos-urushi-flow-and-le-stelle/",
    summary:
      "Ant Newman 2025 年回顾以一支 Tempo 为样本记录 24 面哑光波纹硬橡胶、活塞、18K EF、88 支限量及大尺寸手感；只用于样本体验与专业交叉，不覆盖每支颜色、尖宽或公差。",
    locator: "published 2025-11-13 review, Flow Tempo sample, facets, piston, nib and handling observations",
    sourceType: "blog",
    tier: "professional_secondary",
    registryKey: "deliberate-objects-phase355",
    registryName: "Deliberate Objects",
    homepageUrl: "https://www.deliberateobjects.com/",
    author: "Ant Newman",
    publishedAt: "2025-11-13",
  }),
  svg: web({
    key: "phase355-scribo-flow-tempo-svg",
    title: "SCRIBO FLOW Tempo factual diagram",
    url: "/images/library/site-original/phase355/scribo/flow-tempo.svg",
    summary: "本站原创 factual SVG；表达 24 面硬橡胶、活塞、两种金尖、尺寸和 88 支限量边界，非产品照片。",
    locator: "site-original factual SVG metadata",
    sourceType: "user_submission",
    tier: "primary",
    registryKey: "fountain-pen-graph-editorial-phase355",
    registryName: "Fountain Pen Graph editorial studio",
    homepageUrl: "/",
    author: "Fountain Pen Graph editorial",
  }),
} as const;

const inheritedBrand = phase354ScriboPiumaPacks.find(
  (pack) => pack.expectedType === "brand" && pack.entityId === PHASE355_SCRIBO_BRAND_ID,
);
if (!inheritedBrand) throw new Error("Phase 355 SCRIBO brand prerequisite is missing.");

const brand = structuredClone(inheritedBrand);
brand.key = "phase355-scribo-brand-navigation-v3";
brand.markdownFile = ".planning/content-research/scribo-brand-phase355.md";
brand.storyTitle = "SCRIBO：FEEL、Piuma 与 FLOW Tempo 导航";
brand.sources = [...brand.sources, S.officialFlow, S.category, S.about];
brand.claims = [
  ...brand.claims,
  {
    key: "phase355-scribo-brand-flow-tempo-navigation",
    predicate: "series_navigation",
    objectText: "品牌页同时导航 SCRIBO FEEL、SCRIBO Piuma 与 SCRIBO FLOW Tempo；FLOW 的 24 面硬橡胶活塞与 FEEL 的十二面树脂活塞、Piuma 的卡水／转换器平台分别建模。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: S.category.key,
    locator: "official fountain-pen category lists FLOW, FEEL and PIUMA as separate collections",
    evidence: [{ key: "phase355-scribo-brand-flow-tempo-navigation-evidence", sourceKey: S.category.key, scopeKey: brand.scopes[0]!.scopeKey, locator: "official fountain-pen category lists FLOW, FEEL and PIUMA as separate collections" }],
  },
];

const model: CuratedEntityPack = {
  key: "phase355-scribo-flow-tempo-v1",
  entityId: PHASE355_FLOW_TEMPO_ID,
  expectedType: "pen",
  expectedSlug: PHASE355_FLOW_TEMPO_SLUG,
  canonicalName: "SCRIBO FLOW Tempo",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/scribo-flow-tempo-phase355.md",
  storyTitle: "SCRIBO FLOW Tempo：24 面硬橡胶与 88 支限量边界",
  primarySourceKey: S.officialFlow.key,
  depthTier: "A",
  aliases: [
    { alias: "SCRIBO FLOW Tempo", language: "en", sourceKey: S.officialFlow.key },
    { alias: "FLOW Tempo", language: "en", sourceKey: S.officialFlow.key },
    { alias: "SCRIBO Tempo", language: "en", sourceKey: S.secondary.key },
    { alias: "SCRIBO FLOW Tempo 钢笔", language: "zh", sourceKey: S.officialFlow.key },
  ],
  sources: [S.officialFlow, S.category, S.about, S.secondary, S.svg],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "SCRIBO official FLOW Tempo collection",
      productionState: "unknown",
      nibScope: "18K standard or 14K Extra-Flexible gold nib; widths by SKU",
      materialScope: "handmade matte ebonite body, cap, knob and nib-holder; platinum-trim metal components; ebonite feed",
      editionScope: "FLOW Tempo first edition; deep turquoise with black veins; limited production of 88",
    },
    {
      key: "phase355-scribo-flow-tempo-boundaries",
      scopeKey: "phase355-scribo-flow-tempo-boundaries",
      productionState: "unknown",
      editionScope: "excludes SCRIBO FEEL, Piuma and FLOW Armonia, Forma, Dimensione, Memoria, Origine and Evoluzione",
    },
    {
      key: "phase355-scribo-flow-tempo-media",
      scopeKey: "phase355-scribo-flow-tempo-media",
      productionState: "unknown",
      editionScope: "site-original factual SVG; not a product photo, logo, scale drawing or colour proof",
    },
  ],
  claims: [
    claim(
      "phase355-flow-tempo-identity",
      "model_identity",
      "SCRIBO FLOW Tempo 是 FLOW collection 的独立型号，与 FEEL、Piuma 以及 FLOW 的其他兄弟型号分开建模；官方页把 Tempo 与 Armonia 作为 FLOW 最早的两个模型。",
      S.officialFlow.key,
      "FLOW collection introduction and Tempo product title",
    ),
    claim(
      "phase355-flow-tempo-facets",
      "design_language",
      "Tempo 采用 24 面轮廓；笔帽、笔杆、尾钮和笔尖座由手工 matte ebonite 制作，金属部件为 platinum trim。",
      S.officialFlow.key,
      "technical sheet and handmade matte ebonite fields",
    ),
    claim(
      "phase355-flow-tempo-filling",
      "filling_system",
      "FLOW Tempo 是活塞上墨笔，官方技术表给出 1.42 ml loading capacity；它不是 Piuma 的 international cartridge/converter，也不套用 FEEL 的尺寸或容量。",
      S.officialFlow.key,
      "piston mechanism and loading capacity fields; category sibling boundary",
    ),
    claim(
      "phase355-flow-tempo-nibs",
      "nib_options",
      "官方列出 18K gold standard 与 14K Extra-Flexible gold 两条路线，并配 ebonite feeder；18K 尖宽与 14K flex 尖宽需按 SKU 和库存确认。",
      S.officialFlow.key,
      "nib options and 6.50 mm two-capillary ebonite feed fields",
    ),
    claim(
      "phase355-flow-tempo-spec",
      "specification",
      "官方技术表给出 150 mm 全长、最大径 16.20 mm、33.50 g；这些数值锁定 FLOW Tempo scope，不覆盖 FLOW 兄弟型号。",
      S.officialFlow.key,
      "dimensions and weight fields",
    ),
    claim(
      "phase355-flow-tempo-edition",
      "edition_boundary",
      "首版 Tempo 为深青色配黑色纹理，限量 88 支；颜色和数量只锁定在官方 Tempo 页面，不能外推到后续 FLOW 版本或不同尖宽。",
      S.officialFlow.key,
      "deep turquoise with black veins and 88-piece first edition fields",
    ),
    claim(
      "phase355-flow-tempo-sample",
      "historical_context",
      "Deliberate Objects 2025 年文章记录一支 Tempo 样本的 24 面波纹硬橡胶、活塞、18K EF 与大尺寸手感；它是样本观察，不是统一公差或所有批次的声明。",
      S.secondary.key,
      "published 2025-11-13 review sample",
    ),
    claim(
      "phase355-flow-tempo-selection",
      "selection_guidance",
      "选购时先确认完整 FLOW Tempo 名称、编号、尖宽、活塞状态、纹理照片和 88 支限量凭证；小手或常换色者应把 Tempo 与 Piuma、FEEL 实际试握后再决定。",
      S.secondary.key,
      "sample handling observations and official model boundaries",
      "editorial",
    ),
    claim(
      "phase355-flow-tempo-care",
      "maintenance_guidance",
      "换墨用室温清水缓慢吸排并自然干燥；硬橡胶、铂色饰件和螺纹避免热水、酒精、研磨剂及强拆，活塞或渗墨异常应交给 SCRIBO 或专业维修者。",
      S.about.key,
      "handmade materials and official manufacturing boundary",
      "editorial",
    ),
    claim(
      "phase355-flow-tempo-media",
      "media_identity_boundary",
      "主图是本站原创事实 SVG，不是产品照片，不复制 SCRIBO logo，也不证明真实颜色、纹理、比例、编号或库存。",
      S.svg.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    {
      key: "phase355-flow-tempo-first-edition",
      name: "FLOW Tempo First Edition（深青黑纹理）",
      notes: "官方页列出的首版颜色与 88 支限量；纹理、编号和库存需按 exact specimen 核对。",
      sourceKey: S.officialFlow.key,
      variantKind: "edition_group",
      market: "Global",
      productCode: "FLOW Tempo",
    },
    {
      key: "phase355-flow-tempo-18k-standard",
      name: "18K Gold Standard nib",
      notes: "标准金尖路线；尖宽按具体 SKU 选择，不以 14K flex 的书写压力替代。",
      sourceKey: S.officialFlow.key,
      variantKind: "nib",
      market: "Global",
    },
    {
      key: "phase355-flow-tempo-14k-flex",
      name: "14K Extra-Flexible gold nib",
      notes: "Extra-Flexible 路线；先试写并保持轻压，具体尖宽与库存按 SKU 核对。",
      sourceKey: S.officialFlow.key,
      variantKind: "nib",
      market: "Global",
    },
  ],
  spec: {
    brandEntityId: PHASE355_SCRIBO_BRAND_ID,
    values: {
      series_name: "SCRIBO FLOW Tempo",
      release_year: "2025 sample context; official launch year not asserted",
      origin_country: "Bologna, Italy; current SCRIBO scope",
      nib: "18K gold standard or 14K Extra-Flexible gold nib; widths by SKU",
      fill_system: "piston filling; official loading capacity 1.42 ml",
      material: "handmade matte ebonite; platinum-trim metal components; ebonite feed",
      dimensions: "150 mm; maximum diameter 16.20 mm",
      weight: "33.50 g",
      status: "FLOW Tempo first edition; limited production of 88; official availability varies",
    },
    evidence: [
      specEvidence("phase355-flow-tempo-brand", "brand_entity_id", S.officialFlow.key, "SCRIBO official product identity"),
      specEvidence("phase355-flow-tempo-series", "series_name", S.officialFlow.key, "FLOW Tempo product title"),
      specEvidence("phase355-flow-tempo-release", "release_year", S.secondary.key, "2025 dated sample context; no universal launch claim"),
      specEvidence("phase355-flow-tempo-origin", "origin_country", S.about.key, "Bologna and current SCRIBO context"),
      specEvidence("phase355-flow-tempo-nib", "nib", S.officialFlow.key, "18K standard and 14K Extra-Flexible options"),
      specEvidence("phase355-flow-tempo-fill", "fill_system", S.officialFlow.key, "piston and 1.42 ml loading capacity fields"),
      specEvidence("phase355-flow-tempo-material", "material", S.officialFlow.key, "matte ebonite, platinum trim and feed fields"),
      specEvidence("phase355-flow-tempo-dimensions", "dimensions", S.officialFlow.key, "150 mm and maximum diameter 16.20 mm"),
      specEvidence("phase355-flow-tempo-weight", "weight", S.officialFlow.key, "33.50 grams"),
      specEvidence("phase355-flow-tempo-status", "status", S.officialFlow.key, "first edition, 88 pieces and current Coming Soon availability note"),
    ],
  },
  timeline: [
    {
      key: "phase355-flow-tempo-sample-context",
      title: "FLOW Tempo 在 2025 年形成公开样本语境",
      eventType: "model_released",
      startDate: "2025",
      circa: true,
      description: "Deliberate Objects 的 2025 年回顾记录 Tempo 样本；该日期支持公开样本语境，不单独断言官方首发年份。",
      sourceKey: S.secondary.key,
    },
  ],
  media: [
    {
      key: "phase355-flow-tempo-primary-media",
      title: "SCRIBO FLOW Tempo 事实卡（非产品照片）",
      sourceKey: S.svg.key,
      localPath: S.svg.url,
      author: "Fountain Pen Graph editorial",
      license: "site-original",
      attributionText: "本站原创 factual SVG；非产品照片、非 Logo、非比例图、非颜色校样。",
      sourceUrl: S.svg.url,
      usageStatus: "primary",
    },
  ],
};

export const phase355ScriboFlowTempoPacks: CuratedEntityPack[] = [brand, model];
