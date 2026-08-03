import type {
  CuratedClaim,
  CuratedEntityPack,
  CuratedScope,
  CuratedSource,
  CuratedSpecEvidence,
  CuratedVariant,
} from "../lib/curated-content-pack";
import {
  PHASE284_M300_ID,
  PHASE284_PELIKAN_ID,
  phase284PelikanM300Packs,
} from "./phase284-pelikan-m300";

export const PHASE419_PELIKAN_BRAND_ID = PHASE284_PELIKAN_ID;
export const PHASE419_M300_ID = PHASE284_M300_ID;
export const PHASE419_M300_SLUG = "pelikan-souveran-m300";
export const PHASE419_M300_NAME = "Pelikan Souverän M300";

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
    homepageUrl: sourceType === "official" ? "https://www.pelikan.com/" : input.url.startsWith("/") ? "/" : new URL(input.url).origin,
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
  web({
    key: "phase419-pelikan-m300-mam-901462",
    registryKey: "pelikan-mam-m300-901462-phase419",
    registryName: "Pelikan MAM product archive",
    title: "M300 Black-Green official product record 901462",
    url: "https://mam.pelikan.com/mam/en/pelikan/products/901462",
    summary: "官方 MAM 产品记录将 Black-Green M300 与 Souverän 300、14 ct 金尖和活塞结构关联；不把页面检索当作全球库存证明。",
  }),
  web({
    key: "phase419-pelikan-m300-fine-writing",
    registryKey: "pelikan-fine-writing-m300-702326-phase419",
    registryName: "Pelikan Fine Writing official",
    title: "Fine Writing Instruments M300 dimensions and capacity",
    url: "https://mam.pelikan.com/en/pelikan/media/702326/download",
    summary: "官方 Fine Writing 表给出 M300 约 110 mm、9.9 mm、10.7 g、0.7 ml 的当前舍入口径。",
    itemType: "pdf",
  }),
  web({
    key: "phase419-pelikan-m300-catalog-2018",
    registryKey: "pelikan-passion-catalog-2018-m300-phase419",
    registryName: "Pelikan Fine Writing catalogue",
    sourceType: "official",
    title: "Fine Writing Instruments 2018 catalogue",
    url: "https://www.pelikan-passion.com/images/international/assets/magazine/passion-magazin-01-2018_en.pdf?download=",
    publishedAt: "2018",
    summary: "官方杂志目录的 M300 行用于交叉核对 11.0 cm、9.9 mm、10.7 g、0.7 ml 和 XS 书写工具定位。",
    itemType: "pdf",
  }),
  web({
    key: "phase419-pelikan-m300-collectibles",
    registryKey: "pelikan-collectibles-m300-m320-m350-phase419",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    author: "Pelikan Collectibles editorial archive",
    title: "M300, M320 and M350 Souverän archive",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M300-Basis/index.html",
    summary: "专业档案记录 M300 1998 起、Black 1998–2008、Green-striped 1998 起、14 ct 尖、颜色、徽标和 M3xx 相邻边界。",
  }),
  web({
    key: "phase419-pelikan-m300-perch-database",
    registryKey: "the-pelikans-perch-m3xx-database-phase419",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    author: "Joshua Danley",
    title: "M3xx fountain pen database",
    url: "https://thepelikansperch.com/database/fountain-pens/m3xx/",
    summary: "专业型号档案补充天冠双雏／单雏阶段、双色 14C-585 尖、0.65 ml、尖幅和 M300/M320/M350 的结构边界。",
  }),
  web({
    key: "phase419-pelikan-m300-discontinuation",
    registryKey: "the-pelikans-perch-m300-discontinuation-phase419",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    author: "Joshua Danley",
    title: "The Life and Death of the Souverän M300",
    url: "https://thepelikansperch.com/2020/11/27/pelikan-m300-overview-and-discontinuation/",
    publishedAt: "2020-11-27",
    summary: "专业文章报道 M300 小尺寸便携定位、2020 年停产消息、M3xx 尖幅历史和 Black／Green-Black 的生产顺序；不外推统一价格。",
  }),
  web({
    key: "phase419-pelikan-m300-care",
    registryKey: "pelikan-official-care-m300-phase419",
    registryName: "Pelikan official care",
    title: "Pelikan writing instruments care instructions",
    url: "https://www.pelikan.com/int/products/writing-instruments/care-instructions.html",
    summary: "官方护理页支持排空后冷水吸排、避免热水／肥皂／酒精和长期停用前排空，不写成普通用户拆解教程。",
  }),
  web({
    key: "phase419-pelikan-m300-faq",
    registryKey: "pelikan-official-faq-m300-phase419",
    registryName: "Pelikan official FAQ",
    title: "FAQ: piston filling and cleaning",
    url: "https://www.pelikan.com/int/products/writing/145-international/services/541-faq.html",
    summary: "官方 FAQ 说明 Pelikan 活塞笔从瓶中吸墨、排空和清水清洁的基本路径，支持 M300 的上墨和维护边界。",
  }),
  web({
    key: "phase419-pelikan-m300-choosing",
    registryKey: "the-pelikans-perch-choosing-pelikan-phase419",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    author: "Joshua Danley",
    title: "A Guide to Buying Pelikan",
    url: "https://thepelikansperch.com/2015/06/22/choosing-pelikan-fountain-pen/",
    publishedAt: "2015-06-22",
    summary: "专业选购文章用于说明 Souverän 与 Classic 的尺寸导航；正文仍以 M300 自身档案字段作为规格来源。",
  }),
  web({
    key: "phase419-pelikan-m300-svg",
    registryKey: "fountain-pen-graph-editorial-m300-phase284",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    title: "Pelikan Souverän M300 identity boundary factual SVG",
    url: "/images/library/site-original/phase284/pelikan/m300.svg",
    summary: "本站原创 factual SVG，只表达 M300 小尺寸、镀金饰件、双色金尖和活塞边界；非产品照片、非 Logo、非比例图、非颜色校样。",
    itemType: "image",
  }),
];

const EXTRA_VARIANTS: CuratedVariant[] = [
  { key: "m300-production-colors", name: "M300 production colors", notes: "Black 与 Green-striped 属同一 M300 基础型号的生产色。", sourceKey: "phase419-pelikan-m300-collectibles", variantKind: "edition_group" },
  { key: "m300-black-901462", name: "M300 Black-Green official SKU 901462", releaseYear: "按 MAM 记录", notes: "官方 MAM 901462 是 Black-Green 样本；产品号只锁定该记录，不外推所有年份。", sourceKey: "phase419-pelikan-m300-mam-901462", variantKind: "market_sku", parentVariantKey: "m300-production-colors", productCode: "901462" },
  { key: "m300-nib-widths", name: "M300 nib widths", notes: "尖幅是同一型号的规格维度，按年份和 SKU 记录。", sourceKey: "phase419-pelikan-m300-perch-database", variantKind: "edition_group" },
  { key: "m300-ef", name: "M300 EF", notes: "早期档案列有 EF；二手笔需核对尖刻和修磨。", sourceKey: "phase419-pelikan-m300-perch-database", variantKind: "nib", parentVariantKey: "m300-nib-widths" },
  { key: "m300-f", name: "M300 F", notes: "F 是常见细线尖幅；写感受纸张、墨水和调校影响。", sourceKey: "phase419-pelikan-m300-perch-database", variantKind: "nib", parentVariantKey: "m300-nib-widths" },
  { key: "m300-m", name: "M300 M", notes: "M 是常见中等尖幅；不把一支 M 尖的书写感外推给所有年份。", sourceKey: "phase419-pelikan-m300-perch-database", variantKind: "nib", parentVariantKey: "m300-nib-widths" },
  { key: "m300-b", name: "M300 B", notes: "2000 年以后专业档案常见 B；具体产品号和实物尖面另核。", sourceKey: "phase419-pelikan-m300-perch-database", variantKind: "nib", parentVariantKey: "m300-nib-widths" },
  { key: "m300-m320-boundary", name: "M320 special-edition boundary", releaseYear: "2004–2011", notes: "Orange、Jade Green、Ruby Red、Pearl 属 M320 特别版，不并入 M300 颜色。", sourceKey: "phase419-pelikan-m300-collectibles", variantKind: "edition_group" },
  { key: "m300-m350-boundary", name: "M350 vermeil boundary", releaseYear: "1998–2001", notes: "黑色笔杆、vermeil 帽、18 ct 尖和更高档案重量构成 M350 独立边界。", sourceKey: "phase419-pelikan-m300-collectibles", variantKind: "material" },
  { key: "m300-vintage-300-boundary", name: "Historical Pelikan 300 boundary", releaseYear: "1950s historical line", notes: "历史 300 与现代 Souverän M300 尺寸、时代和结构不同，不因名称相同而合并。", sourceKey: "phase419-pelikan-m300-choosing", variantKind: "edition_group" },
];

const EXTRA_SCOPES: CuratedScope[] = [
  { key: "phase419-m300-main", scopeKey: "pelikan-souveran-m300-main", market: "global", productionState: "historical", nibScope: "14 ct / 14C-585 bi-color gold nib; width by year and SKU", materialScope: "black or green-striped resin with gold-plated trim", editionScope: "M300 base model; M320 and M350 excluded" },
  { key: "phase419-m300-black", scopeKey: "pelikan-m300-black-1998-2008", variantKey: "Black", validFrom: "1998", validTo: "2008", productionState: "historical", nibScope: "14 ct gold", materialScope: "black resin barrel and black cap", editionScope: "series production" },
  { key: "phase419-m300-green", scopeKey: "pelikan-m300-green-striped", variantKey: "Green-striped", validFrom: "1998", productionState: "historical", nibScope: "14 ct gold", materialScope: "green-striped translucent barrel and black cap", editionScope: "series production" },
  { key: "phase419-m300-nibs", scopeKey: "pelikan-m300-nib-widths", variantKey: "m300-m", productionState: "historical", nibScope: "early EF/F/M/B/BB/OM/OB/OBB; later commonly F/M/B", editionScope: "nib width navigation, not separate models" },
  { key: "phase419-m300-m320", scopeKey: "pelikan-m300-versus-m320", variantKey: "m300-m320-boundary", productionState: "historical", materialScope: "special-edition colored small-format Souverän", editionScope: "2004 Orange, 2007 Jade Green, 2010 Ruby Red, 2011 Pearl" },
  { key: "phase419-m300-m350", scopeKey: "pelikan-m300-versus-m350", variantKey: "m300-m350-boundary", productionState: "historical", nibScope: "18 ct on M350", materialScope: "vermeil cap", editionScope: "1998–2001 adjacent model" },
  { key: "phase419-m300-care", scopeKey: "pelikan-m300-care", productionState: "current", editionScope: "cold-water flushing, no hot water/soap/alcohol, professional repair for faults" },
  { key: "phase419-m300-media", scopeKey: "pelikan-m300-factual-svg", productionState: "current", editionScope: "site-original factual SVG, non-product photo and not to scale" },
];

const EXTRA_CLAIMS: CuratedClaim[] = [
  { key: "phase419-identity", predicate: "model_identity", objectText: "Pelikan Souverän M300 是约 1998 年起的小尺寸 Souverän 活塞笔，配镀金饰件和双色 14 ct 金尖；Black 与 Green-striped 是生产色，不是两个基础型号。", factClass: "core", confidence: 0.99, sourceKey: "phase419-pelikan-m300-collectibles", locator: "M300 model row, colors, production and nib", evidence: [{ key: "phase419-identity-archive", sourceKey: "phase419-pelikan-m300-collectibles", scopeKey: "phase419-m300-main", locator: "M300 archive identity" }, { key: "phase419-identity-mam", sourceKey: "phase419-pelikan-m300-mam-901462", scopeKey: "phase419-m300-main", locator: "MAM 901462 official product record" }] },
  { key: "phase419-history", predicate: "production_history", objectText: "档案记录 M300 1998 年起，Black 约至 2008，Green-striped 自 1998 年起；2020 年专业文章报道该小尺寸路线停止生产。", factClass: "core", confidence: 0.98, sourceKey: "phase419-pelikan-m300-collectibles", locator: "M300 production windows", evidence: [{ key: "phase419-history-archive", sourceKey: "phase419-pelikan-m300-collectibles", scopeKey: "phase419-m300-black", locator: "Black and Green-striped rows" }, { key: "phase419-history-perch", sourceKey: "phase419-pelikan-m300-discontinuation", scopeKey: "phase419-m300-main", locator: "2020 discontinuation report" }] },
  { key: "phase419-logo", predicate: "identity_markers", objectText: "天冠和尖面可见双雏、单雏和 2010 年后镀金单雏等阶段，但磨损、换件和拍摄条件会降低定年可靠性，不能单独作为型号证据。", factClass: "core", confidence: 0.97, sourceKey: "phase419-pelikan-m300-perch-database", locator: "M3xx logo and cap-top timeline", evidence: [{ key: "phase419-logo-perch", sourceKey: "phase419-pelikan-m300-perch-database", scopeKey: "phase419-m300-main", locator: "1998–2003, 2003–2010 and 2010+ logo stages" }] },
  { key: "phase419-nib", predicate: "nib_scope", objectText: "M300 常规为双色 14C-585 金尖；早期宽度记录较多，后期常见 F、M、B。M350 的 18 ct 尖不能回填，M3xx 小尖也不能因可旋入而视为 M400 原厂尖。", factClass: "core", confidence: 0.98, sourceKey: "phase419-pelikan-m300-perch-database", locator: "nib material, widths and interchangeability", evidence: [{ key: "phase419-nib-perch", sourceKey: "phase419-pelikan-m300-perch-database", scopeKey: "phase419-m300-nibs", locator: "14C-585 and historical widths" }, { key: "phase419-nib-archive", sourceKey: "phase419-pelikan-m300-collectibles", scopeKey: "phase419-m300-main", locator: "14 ct gold M300 row" }] },
  { key: "phase419-fill", predicate: "filling_system", objectText: "M300 通过尾部旋钮驱动差动活塞，从瓶中吸入钢笔墨；容量历史档案约 0.65 ml，官方资料另以约 0.7 ml 舍入，不是 P200/P205 墨囊路线。", factClass: "core", confidence: 0.99, sourceKey: "phase419-pelikan-m300-faq", locator: "official piston filling FAQ", evidence: [{ key: "phase419-fill-faq", sourceKey: "phase419-pelikan-m300-faq", scopeKey: "phase419-m300-main", locator: "piston filling and cleaning" }, { key: "phase419-fill-measure", sourceKey: "phase419-pelikan-m300-fine-writing", scopeKey: "phase419-m300-main", locator: "0.7 ml current table" }] },
  { key: "phase419-size", predicate: "measurement_scope", objectText: "档案参考闭帽约 110 mm、直径约 10 mm、重量约 11.0 g、容量约 0.65 ml；Fine Writing 当前资料另列 9.9 mm、10.7 g、0.7 ml，页面按来源和舍入口径分层。", factClass: "core", confidence: 0.99, sourceKey: "phase419-pelikan-m300-collectibles", locator: "M300 historical measurement table", evidence: [{ key: "phase419-size-archive", sourceKey: "phase419-pelikan-m300-collectibles", scopeKey: "phase419-m300-main", locator: "110 mm, 10 mm, 11.0 g, 0.65 ml" }, { key: "phase419-size-current", sourceKey: "phase419-pelikan-m300-fine-writing", scopeKey: "phase419-m300-main", locator: "110 mm, 9.9 mm, 10.7 g, 0.7 ml" }] },
  { key: "phase419-boundary", predicate: "family_boundary", objectText: "M320 是 2004–2011 的小尺寸特别版色彩路线，M350 是 1998–2001 的 vermeil 帽与 18 ct 尖路线；历史 Pelikan 300 另属早期型号，三者均不能并入 M300。", factClass: "core", confidence: 0.98, sourceKey: "phase419-pelikan-m300-collectibles", locator: "M300/M320/M350 tables and adjacent models", evidence: [{ key: "phase419-boundary-archive", sourceKey: "phase419-pelikan-m300-collectibles", scopeKey: "phase419-m300-m320", locator: "M320 dates and colors" }, { key: "phase419-boundary-m350", sourceKey: "phase419-pelikan-m300-collectibles", scopeKey: "phase419-m300-m350", locator: "M350 vermeil and 18 ct row" }] },
  { key: "phase419-care", predicate: "care_boundary", objectText: "官方护理以排空后冷水吸排为主，避免热水、肥皂和酒精；尾钮卡滞、空转、渗墨、裂纹或尖座松动时停止强拧并交给专业维修者。", factClass: "core", confidence: 0.99, sourceKey: "phase419-pelikan-m300-care", locator: "official care instructions", evidence: [{ key: "phase419-care-official", sourceKey: "phase419-pelikan-m300-care", scopeKey: "phase419-m300-care", locator: "cold water and no hot water/soap/alcohol" }, { key: "phase419-care-faq", sourceKey: "phase419-pelikan-m300-faq", scopeKey: "phase419-m300-care", locator: "piston cleaning FAQ" }] },
  { key: "phase419-buying", predicate: "second_hand_identification", objectText: "二手 M300 应同时核对约 110 mm 比例、差动活塞、14C-585 尖、黑帽、帽环、天冠、Black 或 Green-striped 材料、产品号与维修史；证据不足时保留待核。", factClass: "editorial", confidence: 0.97, sourceKey: "phase419-pelikan-m300-perch-database", locator: "M3xx identification cues", evidence: [{ key: "phase419-buying-perch", sourceKey: "phase419-pelikan-m300-perch-database", scopeKey: "phase419-m300-main", locator: "cap, nib and ink capacity cues" }, { key: "phase419-buying-mam", sourceKey: "phase419-pelikan-m300-mam-901462", scopeKey: "phase419-m300-main", locator: "official SKU sample" }] },
  { key: "phase419-media", predicate: "editorial_media_scope", objectText: "本站 SVG 只解释 M300 小尺寸、镀金饰件、双色金尖和活塞边界，明确非产品照片、非品牌 Logo、非真实比例和非颜色校样。", factClass: "editorial", confidence: 0.99, sourceKey: "phase419-pelikan-m300-svg", locator: "SVG title and disclaimer", evidence: [{ key: "phase419-media-svg", sourceKey: "phase419-pelikan-m300-svg", scopeKey: "phase419-m300-media", locator: "site-original factual SVG" }] },
];

const EXTRA_SPEC_EVIDENCE: CuratedSpecEvidence[] = [
  { key: "phase419-brand", fieldKey: "brand_entity_id", sourceKey: "phase419-pelikan-m300-mam-901462", scopeKey: "phase419-m300-main", locator: "official Pelikan M300 product identity" },
  { key: "phase419-series", fieldKey: "series_name", sourceKey: "phase419-pelikan-m300-collectibles", scopeKey: "phase419-m300-main", locator: "Souverän M3xx heading" },
  { key: "phase419-release", fieldKey: "release_year", sourceKey: "phase419-pelikan-m300-collectibles", scopeKey: "phase419-m300-main", locator: "1998 M300 production start" },
  { key: "phase419-origin", fieldKey: "origin_country", sourceKey: "phase419-pelikan-m300-mam-901462", scopeKey: "phase419-m300-main", locator: "official product context" },
  { key: "phase419-nib-field", fieldKey: "nib", sourceKey: "phase419-pelikan-m300-perch-database", scopeKey: "phase419-m300-nibs", locator: "14C-585 and widths" },
  { key: "phase419-fill-field", fieldKey: "fill_system", sourceKey: "phase419-pelikan-m300-faq", scopeKey: "phase419-m300-main", locator: "piston filling" },
  { key: "phase419-material-field", fieldKey: "material", sourceKey: "phase419-pelikan-m300-collectibles", scopeKey: "phase419-m300-main", locator: "Black and Green-striped materials" },
  { key: "phase419-dimensions", fieldKey: "dimensions", sourceKey: "phase419-pelikan-m300-fine-writing", scopeKey: "phase419-m300-main", locator: "current measurement table" },
  { key: "phase419-weight", fieldKey: "weight", sourceKey: "phase419-pelikan-m300-collectibles", scopeKey: "phase419-m300-main", locator: "11.0 g archive table" },
  { key: "phase419-status", fieldKey: "status", sourceKey: "phase419-pelikan-m300-discontinuation", scopeKey: "phase419-m300-main", locator: "historical production and discontinuation context" },
];

const BASE_M300 = phase284PelikanM300Packs.find(
  (pack) => pack.entityId === PHASE419_M300_ID && pack.expectedType === "pen",
);
if (!BASE_M300) throw new Error("Phase 419 requires the existing Phase 284 Pelikan M300 pack.");

const refreshedM300: CuratedEntityPack = {
  ...structuredClone(BASE_M300),
  key: "phase419-pelikan-m300-refresh-v1",
  canonicalName: PHASE419_M300_NAME,
  markdownFile: ".planning/content-research/pelikan-m300-phase419.md",
  storyTitle: "Pelikan Souverän M300：小尺寸、14K 尖与 M3xx 身份边界",
  primarySourceKey: "phase419-pelikan-m300-mam-901462",
  sources: [...BASE_M300.sources, ...EXTRA_SOURCES],
  aliases: [
    ...BASE_M300.aliases,
    { alias: "Souverän M 300", language: "en", sourceKey: "phase419-pelikan-m300-fine-writing" },
    { alias: "百利金 Souverän M300", language: "zh", sourceKey: "phase419-pelikan-m300-mam-901462" },
  ],
  variants: [
    ...EXTRA_VARIANTS.filter((variant) => variant.variantKind === "edition_group"),
    ...(BASE_M300.variants ?? []).map((variant) =>
      variant.key === "m300-black" || variant.key === "m300-green-striped"
        ? { ...variant, parentVariantKey: "m300-production-colors" }
        : variant,
    ),
    ...EXTRA_VARIANTS.filter((variant) => variant.variantKind !== "edition_group"),
  ],
  scopes: [...BASE_M300.scopes, ...EXTRA_SCOPES],
  claims: [...BASE_M300.claims, ...EXTRA_CLAIMS],
  spec: BASE_M300.spec
    ? {
        ...BASE_M300.spec,
        values: {
          ...BASE_M300.spec.values,
          series_name: "Pelikan Souverän M3xx",
          release_year: "约 1998 起；Black 约至 2008，Green-striped 路线另记",
          origin_country: "德国品牌；具体制造地按官方产品页、目录或实物核对",
          nib: "14 ct／14C-585 双色金尖；尖幅依年份与 SKU，M350 的 18 ct 另核",
          fill_system: "差动活塞；瓶装钢笔墨；不可写成 P200/P205 墨囊接口",
          material: "高等级树脂或绿黑条纹材料；镀金饰件；颜色按 variant 核对",
          dimensions: "历史档案闭帽约 110 mm、直径约 10 mm；当前资料约 9.9 mm",
          weight: "历史档案约 11.0 g；当前资料约 10.7 g，实测需注明笔帽和墨水条件",
          status: "Pelikan Souverän M300（M3xx）小尺寸历史／生产型号；Black、Green-striped、M320、M350 与历史 300 分开记录",
        },
        evidence: [...BASE_M300.spec.evidence, ...EXTRA_SPEC_EVIDENCE],
      }
    : undefined,
  media: BASE_M300.media,
  timeline: [
    ...(BASE_M300.timeline ?? []),
    { key: "phase419-m300-1998", title: "M300 进入 Souverän 小尺寸路线", eventType: "model_released", startDate: "1998", circa: true, description: "档案将 Black 与 Green-striped M300 放在约 1998 年起的 M3xx 生产路线。", sourceKey: "phase419-pelikan-m300-collectibles" },
    { key: "phase419-m300-2008", title: "Black 档案生产窗口结束", eventType: "discontinued", startDate: "2008", circa: true, description: "Pelikan Collectibles 将黑色 M300 记为约 1998–2008；绿条纹另行记录。", sourceKey: "phase419-pelikan-m300-collectibles" },
    { key: "phase419-m300-2020", title: "专业文章报道 M300 路线停止生产", eventType: "discontinued", startDate: "2020", circa: false, description: "The Pelikan's Perch 报道 M300 线在 2020 年停止生产；库存与地区公告不在此处外推。", sourceKey: "phase419-pelikan-m300-discontinuation" },
  ],
};

export const phase419PelikanM300RefreshPacks: CuratedEntityPack[] = [refreshedM300];
