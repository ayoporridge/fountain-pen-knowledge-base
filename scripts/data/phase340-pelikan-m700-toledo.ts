import type { CuratedEntityPack, CuratedSource, SpecFieldKey } from "../lib/curated-content-pack";
import { phase27PelikanPacks } from "./phase27-pelikan";

const RETRIEVED = "2026-08-02";
export const PHASE340_PELIKAN_ID = "VXUULuCOLOB1";
export const PHASE340_M700_ID = "phase340-pelikan-souveran-m700-toledo";
export const PHASE340_M700_SLUG = "pelikan-souveran-m700-toledo";
const MODEL_SCOPE = "phase340-pelikan-souveran-m700-toledo";

function web(input: {
  key: string;
  title: string;
  url: string;
  registryKey: string;
  registryName: string;
  sourceType: CuratedSource["sourceType"];
  tier: CuratedSource["tier"];
  group?: string;
  summary: string;
  locator: string;
  itemType?: string;
}): CuratedSource {
  return {
    key: input.key,
    registryKey: input.registryKey,
    registryName: input.registryName,
    sourceType: input.sourceType,
    tier: input.tier,
    independenceGroup: input.group ?? input.registryKey,
    title: input.title,
    url: input.url,
    homepageUrl: new URL(input.url).origin,
    itemType: input.itemType ?? "web_page",
    author: input.registryName,
    retrievedAt: RETRIEVED,
    allowedUse: "summary_only",
    summary: input.summary,
    archiveUrl: input.url,
    archiveLocator: `live-source-not-frozen;retrieved=${RETRIEVED};external_archive=false;locator=${input.locator}`,
  };
}

function svgSource(): CuratedSource {
  const url = "/images/library/site-original/phase340/pelikan/m700-toledo.svg";
  return {
    key: "phase340-pelikan-m700-svg",
    registryKey: "fountain-pen-graph-editorial-phase340",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial-phase340",
    title: "Pelikan Souverän M700 Toledo identity boundary factual SVG",
    url,
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial",
    retrievedAt: RETRIEVED,
    allowedUse: "store_full",
    license: "site-original",
    summary: "本站原创 factual SVG；表达 M700 小尺寸、M710 银色路线与 M900/M910 大尺寸边界，不是产品照片、Logo、比例图或颜色校样。",
    archiveUrl: url,
    archiveLocator: `project-public-asset:${url};site-original=true;factual-svg=true;product-photo=false;logo=false;to-scale=false;colour-proof=false;dimensions=1200x720`,
  };
}

const mam = web({
  key: "phase340-pelikan-mam-m700-overview",
  title: "Pelikan MAM：Souverän M700 Toledo products",
  url: "https://mam.pelikan.com/mam/en/pelikan/products?product_filter%5BtaxonomyNode%5D=1622",
  registryKey: "pelikan-mam-phase340",
  registryName: "Pelikan official MAM",
  sourceType: "official",
  tier: "primary",
  summary: "官方 MAM 的 Souverän M700 Toledo 产品分类与当前 M700 Toledo Black 商品记录，用于具体型号、德国制造语境与当前 SKU 边界；尖幅按货号核对。",
  locator: "Souverän M700 Toledo filter; current M700 Toledo Black product records and nib-width SKUs",
});

const family = web({
  key: "phase340-pelikan-collectibles-m700-family",
  title: "Pelikan Collectibles：M700/M710 Souverän family",
  url: "https://www.pelikan-collectibles.de/de/Pelikan/Modelle/Souveraen-Serien/M700-Basis/index.html",
  registryKey: "pelikan-collectibles-phase340-m700-family",
  registryName: "Pelikan Collectibles",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "专业型号档案区分 M700 Old Style 1986–1997、现代 M700 1997 起与 M710 银色路线，并记录 18 ct 尖、125 mm、21.6/23.4 g 与 1.30/1.40 ml 参考值。",
  locator: "M700 Old Style and modern M700 tables; M710 Old Style and special-color boundaries",
});

const detail = web({
  key: "phase340-pelikan-collectibles-m700-toledo",
  title: "Pelikan Collectibles：M700 Toledo detailed record",
  url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M700-Basis/M700/M700-Toledo/index.html",
  registryKey: "pelikan-collectibles-phase340-m700-detail",
  registryName: "Pelikan Collectibles",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "专业档案的 M700 Toledo 具体页记录 1997 年起生产窗口、18 ct 金尖、黑帽金饰件、约 23.4 g、125 mm、12.0 mm 与 1.30 ml。",
  locator: "M700 Toledo production since 1997; nib, dimensions, weight and capacity table",
});

const catalog = web({
  key: "phase340-pelikan-fine-writing-2015-catalog",
  title: "Pelikan Fine Writing Instruments 2015 catalogue：Toledo technique",
  url: "https://www.pelikan-collectibles.com/en/Pelikan/Kataloge/2015/Pelikan-Fine-Writing-Instruments-2015-en.pdf",
  registryKey: "pelikan-fine-writing-catalog-phase340",
  registryName: "Pelikan Fine Writing archival catalog",
  sourceType: "book",
  tier: "contemporary_archive",
  itemType: "catalog_pdf",
  summary: "Pelikan Fine Writing 目录解释 sterling silver 套雕、金层、手工刻纹、德国制造和手工产能限制，为 Toledo 工艺而非普通金色饰件提供档案语境。",
  locator: "Toledo technique and M700/M900 product pages in the 2015 Fine Writing Instruments catalog",
});

const care = web({
  key: "phase340-pelikan-warranty-care",
  title: "Pelikan Souverän warranty and care",
  url: "https://www.pelikan-passion.com/images/assets/fwi_warranty_current.pdf",
  registryKey: "pelikan-official-care-phase340",
  registryName: "Pelikan Fine Writing official",
  sourceType: "official",
  tier: "primary",
  itemType: "warranty_pdf",
  summary: "官方质保与维护资料建议用冷水吸排、停用前排空，并把不当使用与自行拆解排除在质保范围之外；用于保守维护建议。",
  locator: "care section: cold-water fill/empty cycles, exclusions and non-disassembly boundary",
});

const perch = web({
  key: "phase340-pelikans-perch-m700",
  title: "The Pelikan's Perch：M700 series overview",
  url: "https://thepelikansperch.com/2017/02/20/pelikan-m700-series/",
  registryKey: "the-pelikans-perch-phase340-m700",
  registryName: "The Pelikan's Perch",
  sourceType: "blog",
  tier: "professional_secondary",
  summary: "专业收藏资料用于交叉核对 M700/M710 的小尺寸家族关系与历史版本边界，不替代 Pelikan 官方当前 SKU 记录。",
  locator: "M700 series history and M700/M710 variant comparison",
});

const diagram = svgSource();

const brand = structuredClone(
  phase27PelikanPacks.find(
    (pack) => pack.entityId === PHASE340_PELIKAN_ID && pack.expectedType === "brand",
  ),
);
if (!brand) throw new Error("Phase 340 Pelikan brand pack missing.");
brand.key = "phase340-pelikan-brand-v1";

function claim(
  key: string,
  predicate: string,
  objectText: string,
  sourceKey: string,
  locator: string,
  factClass: "core" | "editorial" = "core",
): CuratedEntityPack["claims"][number] {
  return {
    key,
    predicate,
    objectText,
    factClass,
    confidence: factClass === "core" ? 0.97 : 0.93,
    sourceKey,
    locator,
    evidence: [{ key: `${key}-evidence`, sourceKey, locator, scopeKey: MODEL_SCOPE }],
  };
}

function evidence(key: string, fieldKey: SpecFieldKey, sourceKey: string, locator: string) {
  return { key, fieldKey, sourceKey, scopeKey: MODEL_SCOPE, locator, qualifies: true };
}

const model: CuratedEntityPack = {
  key: "phase340-pelikan-m700-toledo-v1",
  entityId: PHASE340_M700_ID,
  expectedType: "pen",
  expectedSlug: PHASE340_M700_SLUG,
  canonicalName: "Pelikan Souverän M700 Toledo",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile: ".planning/quick/260802-pelikan-m700-toledo/pelikan-m700-toledo.md",
  storyTitle: "Pelikan Souverän M700 Toledo：小尺寸手工套雕活塞笔",
  primarySourceKey: mam.key,
  depthTier: "A",
  aliases: [
    { alias: "Pelikan Souverän M700 Toledo", language: "en", sourceKey: detail.key },
    { alias: "Pelikan M700 Toledo", language: "en", sourceKey: family.key },
    { alias: "百利金 M700 Toledo", language: "zh", sourceKey: mam.key },
  ],
  sources: [mam, family, detail, catalog, care, perch, diagram],
  scopes: [{
    key: MODEL_SCOPE,
    scopeKey: MODEL_SCOPE,
    market: "Pelikan Souverän M700 Toledo global current and historical archive records",
    productionState: "current",
    validFrom: "1986",
    nibScope: "18 ct gold nib; width varies by specific SKU and year",
    materialScope: "sterling silver hand-engraved overlay with gold layer; black resin cap and section",
    editionScope: "M700 Toledo only; M710, M900/M910, ordinary M800 and generic Toledo navigation remain separate",
  }],
  claims: [
    claim("m700-identity", "model_identity", "M700 Toledo 是 Souverän Toledo 小尺寸的具体金色套雕型号；M710、M900/M910 与泛 Toledo family 另行记录。", mam.key, "M700 Toledo product category and family boundary"),
    claim("m700-toledo-process", "material_process", "套雕以 sterling silver 为基材，经手工刻纹与表面处理形成 gold layer；金色外观不等于实心黄金笔杆。", catalog.key, "Toledo technique: sterling silver, gold layer and hand engraving"),
    claim("m700-history", "production_history", "档案将 M700 Old Style 记为 1986–1997，现代 M700 表格自 1997 年起；年份是资料窗口，不是单支二手笔的精确日期。", family.key, "M700 Old Style and modern M700 production tables"),
    claim("m700-nib", "nib", "M700 Toledo 使用 18 ct 金尖；尖幅依当前 SKU、年份和具体笔尖单元核对，不能从一个 EF 商品外推全系列。", detail.key, "18 ct nib and current width records"),
    claim("m700-fill", "filling_system", "M700 Toledo 使用 Pelikan 差动活塞，从瓶装钢笔墨水吸墨；不是墨囊或一次性墨胆型号。", mam.key, "Souverän piston filling product family"),
    claim("m700-size", "physical_specification", "现代 M700 档案参考约闭帽 125 mm、直径 12.0 mm、23.4 g、1.30 ml；Old Style 约 21.6 g、1.40 ml。", detail.key, "modern M700 measurement and capacity table"),
    claim("m700-origin", "origin", "Pelikan Fine Writing 资料将 Toledo 放在德国制造的产品语境；具体批次、包装与零件更换仍需单支核对。", catalog.key, "Made in Germany and Toledo production context"),
    claim("m700-boundary", "version_boundary", "M710 是银色／银饰路线，M900/M910 是约 141 mm 的大尺寸路线，普通 M800 的金色饰件不能替代 M700 Toledo 身份。", family.key, "M700/M710 and larger M900/M910 family tables"),
    claim("m700-care", "maintenance_guidance", "换墨或停用前以冷水吸排并排空；避免热水、酒精、研磨剂和自行拆解套雕、活塞与尖座。", care.key, "official cold-water care and non-disassembly boundary", "editorial"),
    claim("m700-buying", "selection_guidance", "购买时核对尺寸阶梯、套雕基材与金层、18 ct 尖刻字、帽环、徽标、活塞和维修记录；不能由颜色或价格单独确认年份与原装状态。", family.key, "variant identification and buying checklist", "editorial"),
  ],
  variants: [
    { key: "m700-old-style", name: "M700 Old Style", releaseYear: "1986–1997", notes: "小尺寸档案路线，参考约 125 mm、21.6 g、1.40 ml；帽环、徽标与尖刻字按年代核对。", sourceKey: family.key, variantKind: "edition_group", market: "global" },
    { key: "m700-modern", name: "M700 Toledo", releaseYear: "1997–", notes: "现代档案路线，参考约 125 mm、23.4 g、1.30 ml；当前黑帽金饰件 SKU 的尖幅按货号核对。", sourceKey: detail.key, variantKind: "edition_group", market: "global" },
    { key: "m700-nib-widths", name: "Current nib-width SKUs", notes: "MAM 当前商品记录分列不同尖幅货号；尖幅是 SKU 级信息，不是所有 M700 的固定配置。", sourceKey: mam.key, variantKind: "nib", market: "global" },
  ],
  spec: {
    brandEntityId: PHASE340_PELIKAN_ID,
    values: {
      series_name: "Souverän M700 Toledo",
      release_year: "M700 Old Style 1986–1997；现代 M700 档案自 1997 年起",
      origin_country: "Pelikan 德国制造语境；具体批次按官方记录或包装核对",
      nib: "18 ct 金尖；尖幅随具体 SKU 与年份核对",
      fill_system: "差动活塞；瓶装钢笔墨水",
      material: "一体 sterling silver 套雕，经手工刻纹并覆盖 gold layer；黑色树脂帽、握位与尾部",
      dimensions: "现代 M700：约 125 mm、直径 12.0 mm、23.4 g、1.30 ml；Old Style 约 21.6 g、1.40 ml",
      weight: "现代档案约 23.4 g；Old Style 约 21.6 g；均为版本参考值",
      status: "Souverän Toledo 小尺寸具体型号；M710、M900/M910 与泛 Toledo family 分开",
    },
    evidence: [
      evidence("m700-brand", "brand_entity_id", mam.key, "Pelikan maker identity"),
      evidence("m700-series", "series_name", mam.key, "M700 Toledo category"),
      evidence("m700-release", "release_year", family.key, "Old Style and modern chronology"),
      evidence("m700-origin", "origin_country", catalog.key, "German production context"),
      evidence("m700-nib-field", "nib", detail.key, "18 ct nib field"),
      evidence("m700-fill-field", "fill_system", mam.key, "Souverän piston filling"),
      evidence("m700-material-field", "material", catalog.key, "sterling silver, gold layer and hand engraving"),
      evidence("m700-dimensions", "dimensions", detail.key, "modern M700 measurement table"),
      evidence("m700-weight", "weight", family.key, "Old Style and modern weight fields"),
      evidence("m700-status", "status", family.key, "M700/M710 and M900/M910 boundary"),
    ],
  },
  timeline: [
    { key: "m700-old-style-start", title: "M700 Old Style 进入档案窗口", eventType: "model_released", startDate: "1986", circa: false, description: "Pelikan Collectibles 将 M700 Old Style 记录在 1986–1997 的小尺寸 Toledo 生产窗口。", sourceKey: family.key },
    { key: "m700-modern-start", title: "现代 M700 Toledo 生产窗口", eventType: "design_milestone", startDate: "1997", circa: false, description: "M700 具体档案从 1997 年起记录现代表格，仍保持小尺寸 Toledo 平台。", sourceKey: detail.key },
  ],
  media: [{
    key: "m700-primary-factual-svg",
    title: diagram.title,
    sourceKey: diagram.key,
    localPath: diagram.url,
    author: "Fountain Pen Graph editorial",
    license: "site-original",
    attributionText: "本站原创 factual SVG；非产品照片、非品牌 Logo、非比例图、非颜色校样。",
    sourceUrl: diagram.url,
    usageStatus: "primary",
  }],
};

export const phase340PelikanM700ToledoPacks: CuratedEntityPack[] = [brand, model];
