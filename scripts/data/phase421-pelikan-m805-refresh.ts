import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import {
  PHASE283_M805_ID,
  PHASE283_PELIKAN_ID,
  phase283PelikanM805Packs,
} from "./phase283-pelikan-m805";

export const PHASE421_PELIKAN_BRAND_ID = PHASE283_PELIKAN_ID;
export const PHASE421_M805_ID = PHASE283_M805_ID;
export const PHASE421_M805_SLUG = "pelikan-souveran-m805";
export const PHASE421_M805_NAME = "Pelikan Souverän M805";

const RETRIEVED = "2026-08-03";

function web(input: {
  key: string;
  registryKey: string;
  registryName: string;
  title: string;
  url: string;
  summary: string;
  sourceType?: CuratedSource["sourceType"];
  tier?: CuratedSource["tier"];
  author?: string;
  publishedAt?: string;
  itemType?: string;
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
    homepageUrl: sourceType === "official" ? "https://www.pelikan.com/" : new URL(input.url).origin,
    itemType: input.itemType ?? (input.url.toLowerCase().includes(".pdf") ? "pdf" : "web_page"),
    author: input.author ?? input.registryName,
    publishedAt: input.publishedAt,
    retrievedAt: RETRIEVED,
    summary: input.summary,
    allowedUse: "summary_only",
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.summary}`,
  };
}

const EXTRA_SOURCES: CuratedSource[] = [
  web({ key: "phase421-pelikan-current-catalog", registryKey: "pelikan-current-catalog-m805-phase421", registryName: "Pelikan Fine Writing current catalogue", title: "Fine Writing Instruments current catalogue", url: "https://www.pelikan.com/images/assets/catalogs/fine-writing-instruments-current-catalog-en.pdf", summary: "官方当前目录列 M805 Stresemann 的 18K/750 全铑尖、EF/F/M/B、条纹 cellulose acetate、镀钯亮点和 M805 订单号。" }),
  web({ key: "phase421-pelikan-2025-catalog", registryKey: "pelikan-2025-catalog-m805-phase421", registryName: "Pelikan 2025 catalogue", title: "Fine Writing Instruments 2025 catalogue", url: "https://www.pelikan.com/images/assets/catalogs/2025/2025_CATALOGO_FWI.pdf", publishedAt: "2025", summary: "2025 官方目录用于交叉核对 Stresemann 命名和 Souverän 大尺寸导航，不把地区订单号外推为全球 SKU。" }),
  web({ key: "phase421-pelikan-m805-stresemann", registryKey: "pelikan-collectibles-m805-stresemann-phase421", registryName: "Pelikan Collectibles", sourceType: "blog", tier: "professional_secondary", author: "Pelikan Collectibles editorial archive", title: "M805 Stresemann detailed archive", url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M800-Basis/M805/M805-Stresemann/index.html", summary: "专业档案把 M805 Stresemann 记为约 2015 起、18 ct 金尖、141 mm、13 mm、29.3 g、1.35 ml、灰黑条纹和银色饰件。" }),
  web({ key: "phase421-pelikan-perch-m805-review", registryKey: "the-pelikans-perch-m805-stresemann-phase421", registryName: "The Pelikan's Perch", sourceType: "blog", tier: "professional_secondary", author: "Joshua Danley", publishedAt: "2015-04-15", title: "Review: M805 Anthracite Stresemann", url: "https://thepelikansperch.com/2015/04/15/pelikan-m805-anthracite-stresemann-review/", summary: "专业评测补充 cellulose acetate 笔杆、树脂黑部件、镀钯饰件、黄铜活塞、大尺寸书写姿势和 18C-750 尖幅体验。" }),
  web({ key: "phase421-fpn-m805-review", registryKey: "fountainpennetwork-m805-phase421", registryName: "The Fountain Pen Network", sourceType: "forum", tier: "community", author: "Fountain Pen Network reviewer", title: "Pelikan M805 Stresemann review thread", url: "https://www.fountainpennetwork.com/forum/topic/301704-pelikan-m805-stresemann/", summary: "FPN 玩家评测只作为书写和包装样本补充，不替代官方尺寸、尖材或版本表。" }),
  web({ key: "phase421-goldspot-m805-review", registryKey: "goldspot-m805-review-phase421", registryName: "Goldspot Pens", sourceType: "blog", tier: "professional_secondary", title: "Pelikan Souverän M805 Stresemann review", url: "https://goldspot.com/blogs/magazine/pelikan-souveran-805-stresemann-fountain-pen-review", summary: "Goldspot 评测提供尖刻、18C-750 和消费者使用背景；价格不当作型号固有字段。" }),
  web({ key: "phase421-pencilcase-m805-review", registryKey: "pencilcaseblog-m805-review-phase421", registryName: "The Pencilcase Blog", sourceType: "blog", tier: "professional_secondary", title: "Pelikan Souverän M805 Stresemann review", url: "https://www.pencilcaseblog.com/2015/04/pelikan-souveran-m805-stresemann.html", summary: "独立评测补充 2015 Stresemann 的书写和外观样本，只描述评测者样本。" }),
  web({ key: "phase421-nibandbarrel-m805", registryKey: "nibandbarrel-m805-phase421", registryName: "The Nib & Barrel", sourceType: "blog", tier: "professional_secondary", title: "Pelikan Souverän M805 Stresemann first impressions", url: "https://the.nibandbarrel.com/article/impressions-pelikan-souveraen-m805-stresemann", summary: "独立初印象用于包装与版本体验补充，不把礼盒或单个写感外推所有 M805。" }),
  web({ key: "phase421-pelikan-2015-annual-report", registryKey: "pelikan-annual-report-2015-m805-phase421", registryName: "Pelikan International annual report", title: "Pelikan International annual report 2015", url: "https://www.pelikan.com/images/assets/picb/Pelikan_Annual_Report_2015.pdf?download=", publishedAt: "2015", summary: "Pelikan 年报作为 805 Stresemann 标准系列的当期企业背景来源，不替代具体版本档案。" }),
];

const EXTRA_VARIANTS: CuratedVariant[] = [
  { key: "m805-editions", name: "M805 base editions", notes: "Black、Blue-striped、Dark Blue 是 M805 基础路线的颜色节点；Stresemann 和特别版另有独立记录。", sourceKey: "phase421-pelikan-m805-stresemann", variantKind: "edition_group" },
  { key: "m805-nib-widths", name: "M805 nib widths", notes: "EF/F/M/B 是尖幅导航，不是四个基础型号。", sourceKey: "phase421-pelikan-current-catalog", variantKind: "edition_group" },
  { key: "m805-m600-boundary", name: "M605/M600 boundary", releaseYear: "adjacent platform", notes: "M605/M600 是更小的平台，银色饰件不构成 M805 身份。", sourceKey: "phase283-pelikan-souveran-index", variantKind: "edition_group" },
  { key: "m805-m405-boundary", name: "M405/M400 boundary", releaseYear: "adjacent platform", notes: "M405/M400 的笔尖号数、长度和握位不同，不因 Stresemann 颜色相似并入 M805。", sourceKey: "phase283-pelikan-souveran-index", variantKind: "edition_group" },
  { key: "m805-black", name: "M805 Black", notes: "黑色高等级树脂与银色／钯色饰件；档案约 2002 起。", sourceKey: "phase283-pelikan-m805-black", variantKind: "color", parentVariantKey: "m805-editions" },
  { key: "m805-blue-striped", name: "M805 Blue-striped", notes: "蓝条纹笔杆、黑帽与银色饰件；档案约 2003 起。", sourceKey: "phase283-pelikan-m800-m805-archive", variantKind: "color", parentVariantKey: "m805-editions" },
  { key: "m805-dark-blue", name: "M805 Dark Blue", notes: "深蓝版本，档案记为约 2003；需以具体产品记录核对。", sourceKey: "phase283-pelikan-m800-m805-archive", variantKind: "color", parentVariantKey: "m805-editions" },
  { key: "m805-ef", name: "M805 EF", notes: "官方目录列 EF；实际线宽仍受供墨、纸张和调校影响。", sourceKey: "phase421-pelikan-current-catalog", variantKind: "nib", parentVariantKey: "m805-nib-widths" },
  { key: "m805-f", name: "M805 F", notes: "官方目录列 F；二手笔需核对尖刻和是否修磨。", sourceKey: "phase421-pelikan-current-catalog", variantKind: "nib", parentVariantKey: "m805-nib-widths" },
  { key: "m805-m", name: "M805 M", notes: "官方 MAM 记录 M 尖；不能把单个 M 尖样本的写感外推所有版本。", sourceKey: "phase283-pelikan-m805-black-blue", variantKind: "nib", parentVariantKey: "m805-nib-widths" },
  { key: "m805-b", name: "M805 B", notes: "官方目录列 B；换尖后要保留维修记录。", sourceKey: "phase421-pelikan-current-catalog", variantKind: "nib", parentVariantKey: "m805-nib-widths" },
];

const EXTRA_SCOPES: CuratedScope[] = [
  { key: "phase421-m805-main", scopeKey: "pelikan-m805-main-2026", market: "global", productionState: "current", nibScope: "18K/750 fully rhodium-plated gold; EF/F/M/B by SKU", materialScope: "high-grade resin or striped cellulose acetate with silver/palladium-coloured trim", editionScope: "M805 base and documented special editions; M800/M815/M605/M405 excluded" },
  { key: "phase421-m805-stresemann", scopeKey: "pelikan-m805-stresemann-2015", variantKey: "m805-stresemann", validFrom: "2015", productionState: "current", nibScope: "18 ct / 18K-750 fully rhodium-plated", materialScope: "anthracite-striped cellulose acetate, black cap, palladium trim", editionScope: "Stresemann series production" },
  { key: "phase421-m805-special", scopeKey: "pelikan-m805-special-editions", variantKey: "m805-ocean-swirl", productionState: "historical", materialScope: "Ocean Swirl, Blue Dunes and other documented special materials", editionScope: "edition-specific records; not ordinary Black SKU" },
  { key: "phase421-m805-nibs", scopeKey: "pelikan-m805-nib-widths", variantKey: "m805-m", productionState: "current", nibScope: "EF/F/M/B options; width depends on nib tuning and paper", editionScope: "nib navigation only" },
  { key: "phase421-m805-care", scopeKey: "pelikan-m805-care-2026", productionState: "current", editionScope: "cold-water flushing; no hot water, soap, alcohol or abrasive polish; professional repair" },
  { key: "phase421-m805-media", scopeKey: "pelikan-m805-factual-svg-2026", productionState: "current", editionScope: "site-original factual SVG, non-product photo and not to scale" },
];

const EXTRA_CLAIMS: CuratedClaim[] = [
  { key: "phase421-identity", predicate: "model_identity", objectText: "Pelikan Souverän M805 是 M800 尺寸平台的银色／钯色饰件路线，使用差动活塞与 18K/750 全铑金尖；不是 M800 的银色别名。", factClass: "core", confidence: 0.99, sourceKey: "phase283-pelikan-m805-black-blue", locator: "official M805 product identity", evidence: [{ key: "phase421-identity-mam", sourceKey: "phase283-pelikan-m805-black-blue", scopeKey: "phase421-m805-main", locator: "M805 product USP" }, { key: "phase421-identity-archive", sourceKey: "phase421-pelikan-m805-stresemann", scopeKey: "phase421-m805-main", locator: "M805 archive heading" }] },
  { key: "phase421-history", predicate: "production_history", objectText: "专业档案将 M805 基础路线置于约 2002 年起；Blue-striped、Dark Blue、Stresemann、Ocean Swirl 和 Blue Dunes 以各自生产窗口分开记录。", factClass: "core", confidence: 0.98, sourceKey: "phase283-pelikan-m800-m805-archive", locator: "chronology and variant table", evidence: [{ key: "phase421-history-archive", sourceKey: "phase283-pelikan-m800-m805-archive", scopeKey: "phase421-m805-main", locator: "M805 chronology" }, { key: "phase421-history-2015", sourceKey: "phase421-pelikan-2015-annual-report", scopeKey: "phase421-m805-stresemann", locator: "2015 corporate product context" }] },
  { key: "phase421-stresemann", predicate: "material_construction", objectText: "M805 Stresemann 约 2015 起采用灰黑条纹 cellulose acetate、黑色笔帽、银色／镀钯色饰件和全铑尖；不能与黄铜金属条纹 M815 混名。", factClass: "core", confidence: 0.99, sourceKey: "phase421-pelikan-m805-stresemann", locator: "Stresemann detail fields", evidence: [{ key: "phase421-stresemann-archive", sourceKey: "phase421-pelikan-m805-stresemann", scopeKey: "phase421-m805-stresemann", locator: "anthracite-striped, black cap, silver trim" }, { key: "phase421-stresemann-review", sourceKey: "phase421-pelikan-perch-m805-review", scopeKey: "phase421-m805-stresemann", locator: "cellulose acetate, resin and palladium furniture" }] },
  { key: "phase421-nib", predicate: "nib_scope", objectText: "官方目录列 18K/750 全铑金尖 EF/F/M/B；尖刻说明金含量和镀层，不替代具体尖幅和调校记录。", factClass: "core", confidence: 0.99, sourceKey: "phase421-pelikan-current-catalog", locator: "M805 order and nib table", evidence: [{ key: "phase421-nib-catalog", sourceKey: "phase421-pelikan-current-catalog", scopeKey: "phase421-m805-nibs", locator: "18K/750 EF/F/M/B" }, { key: "phase421-nib-mam", sourceKey: "phase283-pelikan-m805-black-blue", scopeKey: "phase421-m805-nibs", locator: "official MAM M sample" }] },
  { key: "phase421-fill", predicate: "filling_system", objectText: "M805 从瓶中使用差动活塞吸入钢笔墨，不是 P200/P205 墨囊路线；换色时以冷至温清水吸排，异常阻力时停止强拧。", factClass: "core", confidence: 0.99, sourceKey: "phase283-pelikan-care-faq", locator: "official piston filling FAQ", evidence: [{ key: "phase421-fill-faq", sourceKey: "phase283-pelikan-care-faq", scopeKey: "phase421-m805-care", locator: "piston filling and cleaning" }] },
  { key: "phase421-size", predicate: "measurement_scope", objectText: "M805 档案参考闭帽约 141 mm、直径约 13 mm、重量约 29.3 g、容量约 1.35 ml；评测样本的盎司读数需保留称量条件。", factClass: "core", confidence: 0.99, sourceKey: "phase421-pelikan-m805-stresemann", locator: "measurement table", evidence: [{ key: "phase421-size-archive", sourceKey: "phase421-pelikan-m805-stresemann", scopeKey: "phase421-m805-main", locator: "141 mm, 13 mm, 29.3 g, 1.35 ml" }, { key: "phase421-size-review", sourceKey: "phase421-pelikan-perch-m805-review", scopeKey: "phase421-m805-main", locator: "review sample dimensions and weight" }] },
  { key: "phase421-boundary", predicate: "family_boundary", objectText: "M800 是金色饰件大尺寸路线，M815 Metal Striped 是黄铜／金属条纹特别版，M605/M405 则是更小的平台；外观相似不构成同一型号。", factClass: "core", confidence: 0.98, sourceKey: "phase283-pelikan-souveran-index", locator: "Souverän family index", evidence: [{ key: "phase421-boundary-index", sourceKey: "phase283-pelikan-souveran-index", scopeKey: "phase421-m805-main", locator: "M800 Basis and adjacent sizes" }, { key: "phase421-boundary-m815", sourceKey: "phase283-pelikan-m800-m805-archive", scopeKey: "phase421-m805-main", locator: "M815 special-edition boundary in adjacent-model archive" }] },
  { key: "phase421-care", predicate: "care_boundary", objectText: "官方护理建议排空后用冷水反复吸排，避免热水、肥皂和酒精；树脂、cellulose acetate、镀钯饰件和全铑尖不应用研磨性抛光剂。", factClass: "core", confidence: 0.99, sourceKey: "phase283-pelikan-care-faq", locator: "official care path", evidence: [{ key: "phase421-care-faq", sourceKey: "phase283-pelikan-care-faq", scopeKey: "phase421-m805-care", locator: "cold-water cleaning" }, { key: "phase421-care-review", sourceKey: "phase421-pelikan-perch-m805-review", scopeKey: "phase421-m805-care", locator: "piston and trim maintenance" }] },
  { key: "phase421-buying", predicate: "second_hand_identification", objectText: "二手验收应同时核对 M8xx 尺寸、银色／钯色饰件、18K/750 尖刻、颜色／特别版、墨窗、尾钮、空笔称重、货号和维修史；后配盒或换尖不能单独确认 M805。", factClass: "editorial", confidence: 0.98, sourceKey: "phase421-pelikan-m805-stresemann", locator: "variant identification", evidence: [{ key: "phase421-buying-archive", sourceKey: "phase421-pelikan-m805-stresemann", scopeKey: "phase421-m805-main", locator: "variant and measurement fields" }, { key: "phase421-buying-goldspot", sourceKey: "phase421-goldspot-m805-review", scopeKey: "phase421-m805-main", locator: "nib engraving and review context" }] },
  { key: "phase421-media", predicate: "editorial_media_scope", objectText: "本站 SVG 只展示 M805 的大尺寸、银色饰件、全铑尖和活塞边界，明确非产品照片、非品牌 Logo、非比例图和非颜色校样。", factClass: "editorial", confidence: 0.99, sourceKey: "phase283-pelikan-m805-svg", locator: "site-original factual SVG", evidence: [{ key: "phase421-media-svg", sourceKey: "phase283-pelikan-m805-svg", scopeKey: "phase421-m805-media", locator: "SVG disclaimer" }] },
];

const EXTRA_SPEC_EVIDENCE: CuratedSpecEvidence[] = [
  { key: "phase421-brand", fieldKey: "brand_entity_id", sourceKey: "phase283-pelikan-m805-black-blue", scopeKey: "phase421-m805-main", locator: "official product brand" },
  { key: "phase421-series", fieldKey: "series_name", sourceKey: "phase283-pelikan-souveran-index", scopeKey: "phase421-m805-main", locator: "Souverän family index" },
  { key: "phase421-release", fieldKey: "release_year", sourceKey: "phase283-pelikan-m800-m805-archive", scopeKey: "phase421-m805-main", locator: "M805 chronology" },
  { key: "phase421-origin", fieldKey: "origin_country", sourceKey: "phase283-pelikan-m805-black", scopeKey: "phase421-m805-main", locator: "Made in Germany product field" },
  { key: "phase421-nib", fieldKey: "nib", sourceKey: "phase421-pelikan-current-catalog", scopeKey: "phase421-m805-nibs", locator: "18K/750 EF/F/M/B" },
  { key: "phase421-fill", fieldKey: "fill_system", sourceKey: "phase283-pelikan-m805-black-blue", scopeKey: "phase421-m805-main", locator: "piston filling USP" },
  { key: "phase421-material", fieldKey: "material", sourceKey: "phase421-pelikan-m805-stresemann", scopeKey: "phase421-m805-stresemann", locator: "cellulose acetate and palladium trim" },
  { key: "phase421-dimensions", fieldKey: "dimensions", sourceKey: "phase421-pelikan-m805-stresemann", scopeKey: "phase421-m805-main", locator: "141 mm and 13 mm" },
  { key: "phase421-weight", fieldKey: "weight", sourceKey: "phase421-pelikan-m805-stresemann", scopeKey: "phase421-m805-main", locator: "29.3 g" },
  { key: "phase421-status", fieldKey: "status", sourceKey: "phase283-pelikan-m800-m805-archive", scopeKey: "phase421-m805-main", locator: "base and special edition boundary" },
];

const BASE_M805 = phase283PelikanM805Packs.find(
  (pack) => pack.entityId === PHASE421_M805_ID && pack.expectedType === "pen",
);
if (!BASE_M805) throw new Error("Phase 421 requires the existing Phase 283 Pelikan M805 pack.");
const baseVariants = BASE_M805.variants ?? [];

const refreshedM805: CuratedEntityPack = {
  ...structuredClone(BASE_M805),
  key: "phase421-pelikan-m805-refresh-v1",
  canonicalName: PHASE421_M805_NAME,
  markdownFile: ".planning/content-research/pelikan-m805-phase421.md",
  storyTitle: "Pelikan Souverän M805：银色饰件、Stresemann 材料与版本边界",
  primarySourceKey: "phase283-pelikan-m805-black-blue",
  sources: [...BASE_M805.sources, ...EXTRA_SOURCES],
  aliases: [
    ...BASE_M805.aliases,
    { alias: "Pelikan M 805", language: "en", sourceKey: "phase421-pelikan-m805-stresemann" },
    { alias: "百利金 Souverän M805", language: "zh", sourceKey: "phase283-pelikan-m805-black-blue" },
  ],
  variants: [
    ...EXTRA_VARIANTS.filter((variant) => variant.variantKind === "edition_group"),
    ...baseVariants.map((variant) =>
      variant.key === "m805-black" || variant.key === "m805-blue-striped" || variant.key === "m805-dark-blue"
        ? { ...variant, parentVariantKey: "m805-editions" }
        : variant,
    ),
    ...EXTRA_VARIANTS.filter((variant) => variant.variantKind !== "edition_group" && !baseVariants.some((base) => base.key === variant.key)),
  ],
  scopes: [...BASE_M805.scopes, ...EXTRA_SCOPES],
  claims: [...BASE_M805.claims, ...EXTRA_CLAIMS],
  spec: BASE_M805.spec
    ? {
        ...BASE_M805.spec,
        values: {
          ...BASE_M805.spec.values,
          series_name: "Souverän M805（M800 尺寸银色／钯色饰件路线）",
          release_year: "约 2002 起；Stresemann 约 2015 起，特别版按窗口记录",
          origin_country: "Pelikan 德国制造语境；具体市场产品记录另核",
          nib: "18K/750 全铑镀金尖；官方目录列 EF/F/M/B，实际尖幅依 SKU 和调校",
          fill_system: "差动活塞；瓶装钢笔墨；容量档案约 1.35 ml",
          material: "高等级树脂或条纹 cellulose acetate；银色／钯色饰件",
          dimensions: "档案参考闭帽约 141 mm、直径约 13 mm",
          weight: "档案约 29.3 g；评测样本以盎司记录，需注明帽子和墨水条件",
          status: "M805：Souverän M800 尺寸银色／钯色饰件路线；基础色、Stresemann 和特别版分开记录",
        },
        evidence: [...BASE_M805.spec.evidence, ...EXTRA_SPEC_EVIDENCE],
      }
    : undefined,
  media: BASE_M805.media,
  timeline: [
    ...(BASE_M805.timeline ?? []),
    { key: "phase421-m805-2002", title: "M805 基础银色饰件路线出现", eventType: "model_released", startDate: "2002", circa: true, description: "专业档案将 M805 基础路线置于约 2002 年起，颜色和特别版另行记录。", sourceKey: "phase283-pelikan-m800-m805-archive" },
    { key: "phase421-m805-2015", title: "M805 Stresemann 进入系列生产", eventType: "model_released", startDate: "2015", circa: true, description: "M805 Stresemann 以灰黑条纹、银色饰件和全铑尖形成独立版本。", sourceKey: "phase421-pelikan-m805-stresemann" },
  ],
};

export const phase421PelikanM805RefreshPacks: CuratedEntityPack[] = [refreshedM805];
