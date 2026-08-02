import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedSource,
  CuratedSpecEvidence,
  SpecFieldKey,
} from "../lib/curated-content-pack";
import { phase140Groups } from "./phase140-italian-representative-models-batch";

export const PHASE354_SCRIBO_BRAND_ID = "phase140-brand-scribo";
export const PHASE354_SCRIBO_PIUMA_ID = "phase354-scribo-piuma";
export const PHASE354_SCRIBO_PIUMA_SLUG = "scribo-piuma";
const RETRIEVED = "2026-08-02";
const SCOPE = "phase354-scribo-piuma-scope";

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
  author?: string;
  publishedAt?: string;
}): CuratedSource {
  const sourceType = input.sourceType ?? "official";
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType,
    tier: input.tier ?? (sourceType === "official" ? "primary" : "professional_secondary"),
    independenceGroup: input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: sourceType === "official" ? "https://www.scritturabolognese.com/en/" : input.url,
    itemType: "web_page",
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function diagram(): CuratedSource {
  const url = "/images/library/site-original/phase354/scribo/piuma.svg";
  return {
    key: "phase354-scribo-piuma-svg",
    registryKey: "fountain-pen-graph-editorial-phase354",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase354",
    title: "SCRIBO Piuma factual diagram",
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；非产品照片，不复制 Logo，不作为比例或颜色校样。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1600x900`,
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

function evidence(
  key: string,
  fieldKey: SpecFieldKey,
  sourceKey: string,
  locator: string,
): CuratedSpecEvidence {
  return { key, fieldKey, sourceKey, scopeKey: SCOPE, locator, qualifies: true };
}

const S = {
  officialPiuma: web({
    key: "phase354-scribo-piuma-official",
    title: "PIUMA Utopia — SCRIBO official product page",
    url: "https://www.scritturabolognese.com/en/negozio/fountain-pens/piuma-en/piuma-utopia/",
    summary:
      "SCRIBO 官方 Piuma Utopia 页列出天然树脂手工笔身、铂色饰件、18K 或 14K Extra-Flexible 金尖、ebonite feed、国际卡水／转换器、144.5 mm、最大径 15.60 mm、30 g，以及 Lieve/Utopia/Ratio/Altrove 四种初版颜色和每色 219 支的限量说明。",
    locator: "description, additional information, nib options and collection production limit",
    registryKey: "scribo-official-phase354",
    registryName: "SCRIBO – Scrittura Bolognese",
  }),
  about: web({
    key: "phase354-scribo-about",
    title: "About us — SCRIBO official",
    url: "https://www.scritturabolognese.com/en/about-us/",
    summary:
      "官方 About 页面将 SCRIBO 的当代身份放在 Bologna，说明 2016 年结束 OMAS 阶段后开启新项目，并说明金尖与 ebonite feed 是当前制造重点；不据此主张法人或零件连续。",
    locator: "company history, Bologna identity and nib/feed values",
    registryKey: "scribo-official-phase354",
    registryName: "SCRIBO – Scrittura Bolognese",
  }),
  category: web({
    key: "phase354-scribo-category",
    title: "Fountain Pens archive — SCRIBO official",
    url: "https://www.scritturabolognese.com/en/categoria-prodotto/fountain-pens/",
    summary:
      "官方产品分类同时列出 PIUMA、FEEL、FLOW 和 LA DOTTA；用于证明 Piuma 与 FEEL 是并列产品路线，不把 Piuma 当成 FEEL 的颜色或活塞变体。",
    locator: "fountain-pen category and collection navigation",
    registryKey: "scribo-official-phase354",
    registryName: "SCRIBO – Scrittura Bolognese",
  }),
  goldspot: web({
    key: "phase354-scribo-piuma-goldspot",
    title: "SCRIBO Piuma Fountain Pen Review — Goldspot",
    url: "https://goldspot.com/blogs/magazine/scribo-piuma-fountain-pen-review",
    summary:
      "Goldspot 的专业评测补充 Piuma 与 FEEL 的尺寸比较、国际转换器、14K flex／18K standard 两条笔尖和单支书写体验；测量、手感和出墨只按评测样本使用。",
    locator: "design/specification table, filling system, nib and writing sample sections",
    sourceType: "blog",
    tier: "professional_secondary",
    registryKey: "goldspot-phase354",
    registryName: "Goldspot Pens",
    author: "Goldspot Pens editorial",
    publishedAt: "2021-07-13",
  }),
  fpn: web({
    key: "phase354-scribo-piuma-fpn",
    title: "SCRIBO Piuma first impressions — Fountain Pen Network",
    url: "https://www.fountainpennetwork.com/forum/topic/360505-scribo-piuma-first-impressions/",
    summary:
      "FPN 2021 早期样本记录约 144 mm 闭帽、29 g（含转换器）和 18K/14K 书写观察；作为日期与样本范围交叉资料，不覆盖所有颜色、批次和尖宽。",
    locator: "dated first-impressions post, sample measurement and nib observations",
    sourceType: "forum",
    tier: "professional_secondary",
    registryKey: "fountain-pen-network-phase354",
    registryName: "Fountain Pen Network",
    author: "Fountain Pen Network contributor Geert Jan",
    publishedAt: "2021-05-16",
  }),
  svg: diagram(),
};

const scriboGroup = phase140Groups.find((group) => group.brand.entityId === PHASE354_SCRIBO_BRAND_ID);
if (!scriboGroup) throw new Error("Phase 354 SCRIBO brand prerequisite is missing.");

const brand = structuredClone(scriboGroup.brand);
brand.key = "phase354-scribo-brand-navigation-v2";
brand.markdownFile = ".planning/content-research/scribo-brand-phase354.md";
brand.storyTitle = "SCRIBO：FEEL 与 Piuma 的当代品牌导航";
brand.sources = [...brand.sources, S.officialPiuma, S.category];
brand.claims = [
  ...brand.claims,
  {
    key: "phase354-scribo-brand-piuma-navigation",
    predicate: "series_navigation",
    objectText: "品牌页同时导航 SCRIBO FEEL 与 SCRIBO Piuma；FEEL 的 piston 与 Piuma 的 cartridge/converter 是两条不同产品路线。",
    factClass: "core",
    confidence: 0.99,
    sourceKey: S.category.key,
    locator: "official fountain-pen category lists PIUMA and FEEL as separate collections",
    evidence: [{ key: "phase354-scribo-brand-piuma-navigation-evidence", sourceKey: S.category.key, scopeKey: brand.scopes[0]!.scopeKey, locator: "official fountain-pen category lists PIUMA and FEEL as separate collections" }],
  },
];

const model: CuratedEntityPack = {
  key: "phase354-scribo-piuma-v1",
  entityId: PHASE354_SCRIBO_PIUMA_ID,
  expectedType: "pen",
  expectedSlug: PHASE354_SCRIBO_PIUMA_SLUG,
  canonicalName: "SCRIBO Piuma",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/content-research/scribo-piuma-phase354.md",
  storyTitle: "SCRIBO Piuma：轻量树脂笔身与两条金尖路线",
  primarySourceKey: S.officialPiuma.key,
  depthTier: "A",
  aliases: [
    { alias: "SCRIBO Piuma", language: "en", sourceKey: S.officialPiuma.key },
    { alias: "Scribo Piuma Fountain Pen", language: "en", sourceKey: S.officialPiuma.key },
    { alias: "PIUMA", language: "it", sourceKey: S.category.key },
    { alias: "SCRIBO 羽毛笔", language: "zh", sourceKey: S.officialPiuma.key },
  ],
  sources: [S.officialPiuma, S.about, S.category, S.goldspot, S.fpn, S.svg],
  scopes: [
    {
      key: SCOPE,
      scopeKey: SCOPE,
      market: "SCRIBO official Piuma collection",
      productionState: "current",
      nibScope: "18K standard or 14K Extra-Flexible gold nib; width by SKU",
      materialScope: "natural resin body and platinum-trim metal components",
      editionScope: "base Piuma colour collection; Urushi and later limited editions remain separate variants",
    },
    {
      key: "phase354-scribo-piuma-feel-boundary",
      scopeKey: "phase354-scribo-piuma-feel-boundary",
      productionState: "current",
      editionScope: "excludes piston-filled SCRIBO FEEL and its capacity/measurements",
    },
    {
      key: "phase354-scribo-piuma-media",
      scopeKey: "phase354-scribo-piuma-media",
      productionState: "current",
      editionScope: "site-original factual SVG; not a product photo or colour proof",
    },
  ],
  claims: [
    claim(
      "phase354-scribo-piuma-identity",
      "model_identity",
      "SCRIBO Piuma 是 SCRIBO 独立的树脂卡水／转换器钢笔路线；它不是活塞式 FEEL 的颜色或轻量版本。",
      S.category.key,
      "official category lists PIUMA and FEEL as separate collections",
    ),
    claim(
      "phase354-scribo-piuma-spec",
      "specification",
      "官方 Utopia 页给出 144.5 mm 全长、最大径 15.60 mm、30 g；笔帽、笔杆、尾钮和笔尖座为天然树脂，金属件为铂色饰面。",
      S.officialPiuma.key,
      "additional information product features",
    ),
    claim(
      "phase354-scribo-piuma-filling",
      "filling_system",
      "Piuma 使用 international cartridge/converter；容量与供墨体验不能套用 FEEL 的 piston，也不应写成 eyedropper。",
      S.officialPiuma.key,
      "cartridge/converter ink filling system field and FEEL sibling boundary",
    ),
    claim(
      "phase354-scribo-piuma-nibs",
      "nib_options",
      "官方列出 18K 金标准尖（EEF、EF、F、M、B、BBB、1.4 mm Stub）和 14K Extra-Flexible 金尖（EF、F、M、B）；实际可选范围按 SKU 与库存核对。",
      S.officialPiuma.key,
      "nibs guide and product options",
    ),
    claim(
      "phase354-scribo-piuma-feed",
      "feed_material",
      "SCRIBO 官方说明金尖配 ebonite feeder；Goldspot 的评测将 14K flex 与 18K standard 的书写感受视为两条不同样本路线。",
      S.about.key,
      "official heart-of-fountain-pen description; professional sample cross-check",
    ),
    claim(
      "phase354-scribo-piuma-colours",
      "version_boundary",
      "Lieve、Utopia、Ratio、Altrove 是 Piuma collection 内的颜色／树脂变体；每色初版 219 支的配额只适用于官方当前说明，不外推到后续特别版。",
      S.officialPiuma.key,
      "colours and limited-production field",
    ),
    claim(
      "phase354-scribo-piuma-history",
      "historical_context",
      "FPN 的 2021 年首批样本可作为 Piuma 早期公开语境和测量交叉资料，但不能据此断言所有后续版本的发布年份或统一参数。",
      S.fpn.key,
      "dated first-impressions post",
    ),
    claim(
      "phase354-scribo-piuma-selection",
      "selection_guidance",
      "选购时先决定 18K standard 或 14K Extra-Flexible 尖，再核对颜色、完整商品名、转换器、库存与退换条件；需要活塞和更大储墨量时应比较 FEEL。",
      S.goldspot.key,
      "nib/filling comparison and writing-use guidance",
      "editorial",
    ),
    claim(
      "phase354-scribo-piuma-care",
      "maintenance_guidance",
      "换色时用室温清水吸排并自然干燥，避免热水、酒精、研磨剂和强拆；对 ebonite feed、树脂和金属饰件按具体售后说明处理。",
      S.about.key,
      "material and handmade construction boundary",
      "editorial",
    ),
    claim(
      "phase354-scribo-piuma-media",
      "media_identity_boundary",
      "主图是本站原创事实 SVG，不是产品照片，不复制 SCRIBO logo，也不证明真实颜色、纹理、比例、批次或库存。",
      S.svg.key,
      "site-original SVG metadata",
      "editorial",
    ),
  ],
  variants: [
    { key: "phase354-scribo-piuma-lieve", name: "Lieve（SCRIBO 灰）", notes: "官方 Piuma 初版颜色之一；颜色、纹理和库存按 exact SKU 核对。", sourceKey: S.officialPiuma.key, variantKind: "color", market: "Global" },
    { key: "phase354-scribo-piuma-utopia", name: "Utopia（蓝色斑纹）", notes: "官方商品页当前示例；不代表每一支纹理或后续库存。", sourceKey: S.officialPiuma.key, variantKind: "color", market: "Global" },
    { key: "phase354-scribo-piuma-ratio", name: "Ratio（酒红斑纹）", notes: "Piuma 初版颜色变体；不与 Altrove 的纹理描述互换。", sourceKey: S.officialPiuma.key, variantKind: "color", market: "Global" },
    { key: "phase354-scribo-piuma-altrove", name: "Altrove（酒红色）", notes: "Piuma 初版颜色变体；后续 Urushi／特别版另行核对。", sourceKey: S.officialPiuma.key, variantKind: "color", market: "Global" },
  ],
  spec: {
    brandEntityId: PHASE354_SCRIBO_BRAND_ID,
    values: {
      series_name: "SCRIBO Piuma",
      release_year: "2021 年早期样本语境；本包不把它写成统一首发年份",
      origin_country: "Bologna, Italy；官方当代 SCRIBO 产品范围",
      nib: "18K gold standard or 14K Extra-Flexible gold nib; widths by SKU",
      fill_system: "international cartridge/converter",
      material: "handmade natural resin; platinum-trim metal components; ebonite feed",
      dimensions: "144.5 mm; maximum diameter 15.60 mm",
      weight: "30 g",
      status: "current Piuma collection; colour and limited-edition stock varies",
    },
    evidence: [
      evidence("phase354-scribo-piuma-brand", "brand_entity_id", S.officialPiuma.key, "SCRIBO official product identity"),
      evidence("phase354-scribo-piuma-series", "series_name", S.officialPiuma.key, "PIUMA Utopia product title"),
      evidence("phase354-scribo-piuma-release", "release_year", S.fpn.key, "2021 dated first-impressions context; no universal launch claim"),
      evidence("phase354-scribo-piuma-origin", "origin_country", S.about.key, "Bologna and made-in-Italy brand context"),
      evidence("phase354-scribo-piuma-nib", "nib", S.officialPiuma.key, "18K and 14K nib options"),
      evidence("phase354-scribo-piuma-fill", "fill_system", S.officialPiuma.key, "cartridge/converter ink filling system"),
      evidence("phase354-scribo-piuma-material", "material", S.officialPiuma.key, "natural resin and platinum trim fields"),
      evidence("phase354-scribo-piuma-dimensions", "dimensions", S.officialPiuma.key, "144.5 mm and max diameter 15.60 mm"),
      evidence("phase354-scribo-piuma-weight", "weight", S.officialPiuma.key, "30 grams"),
      evidence("phase354-scribo-piuma-status", "status", S.officialPiuma.key, "current product page and collection context"),
    ],
  },
  timeline: [
    {
      key: "phase354-scribo-piuma-early-context",
      title: "Piuma 在 2021 年形成公开样本语境",
      eventType: "model_released",
      startDate: "2021",
      circa: true,
      description: "FPN 的 2021 年首批印象和当代官方商品页共同支持 Piuma 的独立型号身份；日期不是精确首发断言。",
      sourceKey: S.fpn.key,
    },
  ],
  media: [
    {
      key: "phase354-scribo-piuma-primary-media",
      title: "SCRIBO Piuma 事实卡（非产品照片）",
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

export const phase354ScriboPiumaPacks: CuratedEntityPack[] = [brand, model];
